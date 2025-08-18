import { useState } from 'react';
import { useAnchorProgram } from '../lib/anchor';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { web3 } from '@project-serum/anchor';
import { Send, Plus, Trash2, Coins, Coins as Token } from 'lucide-react';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, getMint, createTransferInstruction } from '@solana/spl-token';
import { useTranslation } from 'react-i18next';
import { ComputeBudgetProgram } from '@solana/web3.js';

interface Recipient {
  id: string;
  address: string;
  amount: string;
}

export function BatchTransfer() {
  const program = useAnchorProgram();
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'sol' | 'token'>('sol');
  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: '1', address: '', amount: '' }
  ]);
  const [tokenMint, setTokenMint] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const addRecipient = () => {
    if (recipients.length < 10) {
      const newId = (recipients.length + 1).toString();
      setRecipients([...recipients, { id: newId, address: '', amount: '' }]);
    }
  };

  const removeRecipient = (id: string) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter(r => r.id !== id));
    }
  };

  const updateRecipient = (id: string, field: 'address' | 'amount', value: string) => {
    setRecipients(recipients.map(r => 
      r.id === id ? { ...r, [field]: value } : r
    ));
  };

  const handleBatchTransfer = async () => {
    if (!program || !publicKey) return;

    try {
      setIsLoading(true);
      setMessage('');
      setIsError(false);

      // Filter out empty recipients
      const validRecipients = recipients.filter(r => r.address && r.amount);
      
      if (validRecipients.length === 0) {
        setMessage(t('pleaseAddRecipient'));
        setIsError(true);
        return;
      }

      // Calculate total amount for SOL transfers to check balance
      if (activeTab === 'sol') {
        const totalAmount = validRecipients.reduce((sum, recipient) => {
          return sum + Math.floor(parseFloat(recipient.amount) * 1e9);
        }, 0);
        
        // Add estimated transaction fees (approximately 5000 lamports per signature)
        const estimatedFees = validRecipients.length > 5 ? Math.ceil(validRecipients.length / 3) * 5000 : 5000;
        const totalWithFees = totalAmount + estimatedFees;
        
        // Check if user has sufficient balance
        const balance = await connection.getBalance(publicKey);
        if (balance < totalWithFees) {
          setMessage(`Insufficient SOL balance. Need ${(totalWithFees / 1e9).toFixed(4)} SOL but have ${(balance / 1e9).toFixed(4)} SOL`);
          setIsError(true);
          return;
        }
      }

      if (activeTab === 'sol') {
        // Check if we should split into multiple transactions for reliability
        const maxRecipientsPerTx = validRecipients.length > 5 ? 3 : validRecipients.length;
        const batches = [];
        
        // Split recipients into smaller batches to avoid transaction limits
        for (let i = 0; i < validRecipients.length; i += maxRecipientsPerTx) {
          batches.push(validRecipients.slice(i, i + maxRecipientsPerTx));
        }
        
        let totalTransferred = 0;
        const signatures = [];
        
        for (const [batchIndex, batch] of batches.entries()) {
          // Create a transaction for this batch with fresh blockhash
          const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
          const transaction = new web3.Transaction({
            recentBlockhash: blockhash,
            feePayer: publicKey,
          });
          
          // Add compute budget instructions with more conservative limits
          transaction.add(
            ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 250_000 }),
            ComputeBudgetProgram.setComputeUnitLimit({ units: 150_000 + (batch.length * 30_000) })
          );
          
          // Add transfer instructions for this batch
          for (const recipient of batch) {
            const toAddress = new web3.PublicKey(recipient.address);
            const amount = Math.floor(parseFloat(recipient.amount) * 1e9);
            
            const transferInstruction = web3.SystemProgram.transfer({
              fromPubkey: publicKey,
              toPubkey: toAddress,
              lamports: amount,
            });
            
            transaction.add(transferInstruction);
          }
          
          try {
            // Send the transaction for this batch
            const signature = await sendTransaction(transaction, connection);
            signatures.push(signature);
            
            // Wait for confirmation with better timeout handling
            setMessage(`Batch ${batchIndex + 1}/${batches.length} submitted - waiting for confirmation...`);
            
            try {
              // First try with shorter timeout
              await connection.confirmTransaction(signature, 'confirmed');
            } catch (confirmError: any) {
              if (confirmError.message?.includes('not confirmed')) {
                // Check if transaction actually succeeded despite timeout
                setMessage(`Checking transaction status for batch ${batchIndex + 1}...`);
                
                const signatureStatus = await connection.getSignatureStatus(signature);
                if (signatureStatus?.value?.confirmationStatus === 'confirmed' || 
                    signatureStatus?.value?.confirmationStatus === 'finalized') {
                  // Transaction actually succeeded
                  console.log(`Transaction ${signature} succeeded despite timeout`);
                } else {
                  // Try one more time with longer timeout
                  await connection.confirmTransaction({
                    signature,
                    blockhash,
                    lastValidBlockHeight
                  }, 'confirmed');
                }
              } else {
                throw confirmError;
              }
            }
            
            totalTransferred += batch.length;
            
            // Update progress
            setMessage(`Batch ${batchIndex + 1}/${batches.length} confirmed - ${totalTransferred}/${validRecipients.length} transfers completed`);
            
          } catch (batchError: any) {
            console.error(`Error in batch ${batchIndex + 1}:`, batchError);
            throw new Error(`Failed at batch ${batchIndex + 1} after ${totalTransferred} successful transfers. Error: ${batchError.message}`);
          }
        }
        
        setMessage(`${t('solTransfersCompleted')} - ${totalTransferred} transfers in ${batches.length} transaction(s). Signatures: ${signatures.join(', ')}`);
        setIsError(false);
      } else {
        if (!tokenMint) {
          setMessage(t('tokenMintRequired'));
          setIsError(true);
          return;
        }
        
        const mintPk = new web3.PublicKey(tokenMint);
        const mintInfo = await getMint(connection, mintPk);
        const decimals = mintInfo.decimals;
        const fromTokenAccount = await getAssociatedTokenAddress(mintPk, publicKey);
        
        // Token transfers are more complex due to ATA creation, use smaller batches
        const maxRecipientsPerTx = validRecipients.length > 3 ? 2 : validRecipients.length;
        const batches = [];
        
        // Split recipients into smaller batches for token transfers
        for (let i = 0; i < validRecipients.length; i += maxRecipientsPerTx) {
          batches.push(validRecipients.slice(i, i + maxRecipientsPerTx));
        }
        
        let totalTransferred = 0;
        const signatures = [];
        
        for (const [batchIndex, batch] of batches.entries()) {
          // Create a transaction for this batch
          const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed'); const transaction = new web3.Transaction({ recentBlockhash: blockhash, feePayer: publicKey });
          
          // Add compute budget instructions with higher limits for token operations
          transaction.add(
            ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 500_000 }),
            ComputeBudgetProgram.setComputeUnitLimit({ units: 200_000 + (batch.length * 150_000) })
          );
          
          // Process each recipient in this batch
          for (const recipient of batch) {
            const recipientAddress = new web3.PublicKey(recipient.address);
            const toTokenAccount = await getAssociatedTokenAddress(mintPk, recipientAddress);
            
            // Check if ATA exists, create if not
            const toAccountInfo = await connection.getAccountInfo(toTokenAccount);
            if (!toAccountInfo) {
              const createATAInstruction = createAssociatedTokenAccountInstruction(
                publicKey,
                toTokenAccount,
                recipientAddress,
                mintPk
              );
              transaction.add(createATAInstruction);
            }
            
            // Add the token transfer instruction
            const amount = Math.floor(parseFloat(recipient.amount) * 10 ** decimals);
            
            const tokenTransferInstruction = createTransferInstruction(
              fromTokenAccount,
              toTokenAccount,
              publicKey,
              amount
            );
            
            transaction.add(tokenTransferInstruction);
          }
          
          try {
            // Send the transaction for this batch
            const signature = await sendTransaction(transaction, connection);
            signatures.push(signature);
            
            // Wait for confirmation with better timeout handling
            setMessage(`Token batch ${batchIndex + 1}/${batches.length} submitted - waiting for confirmation...`);
            
            try {
              // First try with shorter timeout
              await connection.confirmTransaction(signature, 'confirmed');
            } catch (confirmError: any) {
              if (confirmError.message?.includes('not confirmed')) {
                // Check if transaction actually succeeded despite timeout
                setMessage(`Checking token transaction status for batch ${batchIndex + 1}...`);
                
                const signatureStatus = await connection.getSignatureStatus(signature);
                if (signatureStatus?.value?.confirmationStatus === 'confirmed' || 
                    signatureStatus?.value?.confirmationStatus === 'finalized') {
                  // Transaction actually succeeded
                  console.log(`Token transaction ${signature} succeeded despite timeout`);
                } else {
                  // Try one more time with longer timeout
                  await connection.confirmTransaction({
                    signature,
                    blockhash,
                    lastValidBlockHeight
                  }, 'confirmed');
                }
              } else {
                throw confirmError;
              }
            }
            
            totalTransferred += batch.length;
            
            // Update progress
            setMessage(`Token batch ${batchIndex + 1}/${batches.length} confirmed - ${totalTransferred}/${validRecipients.length} transfers completed`);
            
          } catch (batchError: any) {
            console.error(`Error in token batch ${batchIndex + 1}:`, batchError);
            throw new Error(`Token transfer failed at batch ${batchIndex + 1} after ${totalTransferred} successful transfers. Error: ${batchError.message}`);
          }
        }
        
        setMessage(`${t('tokenTransfersCompleted')} - ${totalTransferred} transfers in ${batches.length} transaction(s). Signatures: ${signatures.join(', ')}`);
        setIsError(false);
      }

      // Reset form
      setRecipients([{ id: '1', address: '', amount: '' }]);
      setTokenMint('');
    } catch (error: any) {
      console.error('Error in batch transfer:', error);
      
      // Provide more detailed error information
      let errorMessage = t('errorBatchTransfer');
      if (error.message) {
        if (error.message.includes('not confirmed') && error.message.includes('30.00 seconds')) {
          // Extract signature from error message if available
          const signatureMatch = error.message.match(/signature\s+([A-Za-z0-9]{44,})/);
          const signature = signatureMatch ? signatureMatch[1] : 'unknown';
          
          errorMessage = `Transaction timeout - but it may have succeeded! Please check the transaction signature ${signature} on Solana Explorer (https://explorer.solana.com/tx/${signature}) to verify if your transfers completed. If successful, the recipients should have received their funds despite the timeout.`;
        } else {
          errorMessage += `: ${error.message}`;
        }
      } else if (error.toString().includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for batch transfer';
      } else if (error.toString().includes('Transaction too large')) {
        errorMessage = 'Transaction too large - try with fewer recipients';
      } else if (error.toString().includes('Blockhash not found')) {
        errorMessage = 'Network congestion - please try again';
      } else if (error.toString().includes('timeout')) {
        errorMessage = 'Network timeout - your transaction may still be processing. Check Solana Explorer for confirmation.';
      }
      
      setMessage(errorMessage);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const isValidAddress = (address: string) => {
    try {
      new web3.PublicKey(address);
      return true;
    } catch {
      return false;
    }
  };

  const isValidAmount = (amount: string) => {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0;
  };

  const isFormValid = () => {
    const validRecipients = recipients.filter(r => r.address && r.amount);
    if (validRecipients.length === 0) return false;
    
    for (const recipient of validRecipients) {
      if (!isValidAddress(recipient.address) || !isValidAmount(recipient.amount)) {
        return false;
      }
    }

    if (activeTab === 'token' && (!tokenMint || !isValidAddress(tokenMint))) {
      return false;
    }

    return true;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-rose-600 rounded-md flex items-center justify-center">
          <Send className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('batchTransfer')}</h2>
          <p className="text-gray-600 dark:text-gray-300">{t('batchTransferSubtitle')}</p>
        </div>
      </div>

      {/* Asset Type Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-md">
        <button
          onClick={() => setActiveTab('sol')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all ${
            activeTab === 'sol'
              ? 'bg-white/80 dark:bg-gray-900/60 text-gray-900 dark:text-white shadow-sm backdrop-blur'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>{t('sol')}</span>
        </button>
        <button
          onClick={() => setActiveTab('token')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all ${
            activeTab === 'token'
              ? 'bg-white/80 dark:bg-gray-900/60 text-gray-900 dark:text-white shadow-sm backdrop-blur'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Token className="w-4 h-4" />
          <span>{t('splToken')}</span>
        </button>
      </div>

      {/* Token Mint Input */}
      {activeTab === 'token' && (
        <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-gray-900/60 backdrop-blur p-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            {t('tokenMintAddress')}
          </label>
          <input
            type="text"
            value={tokenMint}
            onChange={(e) => setTokenMint(e.target.value)}
            placeholder={t('tokenMintAddress') || ''}
            className="input-field"
          />
          {tokenMint && !isValidAddress(tokenMint) && (
            <p className="text-red-500 text-sm mt-1">{t('invalidTokenMint')}</p>
          )}
        </div>
      )}

      {/* Recipients */}
      <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-gray-900/60 backdrop-blur p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('recipients')}</h3>
          <button
            onClick={addRecipient}
            disabled={recipients.length >= 10}
            className="btn-secondary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addRecipient')}</span>
          </button>
        </div>

        <div className="space-y-4">
          {recipients.map((recipient) => (
            <div key={recipient.id} className="flex items-center space-x-4 p-4 rounded-lg border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-gray-900/60 backdrop-blur">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  {t('walletAddress')}
                </label>
                <input
                  type="text"
                  value={recipient.address}
                  onChange={(e) => updateRecipient(recipient.id, 'address', e.target.value)}
                  placeholder={t('enterWalletAddress') || ''}
                  className="input-field"
                />
                {recipient.address && !isValidAddress(recipient.address) && (
                  <p className="text-red-500 text-sm mt-1">{t('invalidAddress')}</p>
                )}
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  {t('amountLabel')} ({activeTab === 'sol' ? t('sol') : t('splToken')})
                </label>
                <input
                  type="number"
                  value={recipient.amount}
                  onChange={(e) => updateRecipient(recipient.id, 'amount', e.target.value)}
                  placeholder={activeTab === 'sol' ? (t('amountInSol') || '') : (t('amountInTokens') || 'Amount in tokens (UI)')}
                  step="0.000000001"
                  className="input-field"
                />
                {recipient.amount && !isValidAmount(recipient.amount) && (
                  <p className="text-red-500 text-sm mt-1">{t('invalidAmount')}</p>
                )}
              </div>

              {recipients.length > 1 && (
                <button
                  onClick={() => removeRecipient(recipient.id)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleBatchTransfer}
          disabled={!isFormValid() || isLoading}
          className="btn-primary w-full mt-6 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-600"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{t('processingTransfer')}</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>{t('sendBatchTransfer')}</span>
            </>
          )}
        </button>

        {message && (
          <div className={`mt-4 p-3 rounded-md ${
            isError 
              ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800' 
              : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
          }`}>
            {message}
          </div>
        )}
      </div>

      {/* Information Card */}
      <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-gray-900/60 backdrop-blur p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('batchTransferInfo')}</h3>
        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
          <li>• {t('sendUpTo10Recipients')}</li>
          <li>• {t('reduceFeesByBatching')}</li>
          <li>• {t('transfersRequireSignature')}</li>
          <li>• {t('recipientsMustHaveValidAddresses')}</li>
        </ul>
      </div>
    </div>
  );
}