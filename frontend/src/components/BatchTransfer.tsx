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

      const validRecipients = recipients.filter(r => r.address && r.amount);
      if (validRecipients.length === 0) {
        setMessage('Please add at least one valid recipient.');
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
          // Create a transaction for this batch
          const transaction = new web3.Transaction();
          
          // Add compute budget instructions with conservative limits
          const computeUnits = 150_000 + (batch.length * 30_000);
          transaction.add(
            ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 250_000 }),
            ComputeBudgetProgram.setComputeUnitLimit({ units: computeUnits })
          );
          
          // Add all transfer instructions for this batch
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
            setMessage(`Processing batch ${batchIndex + 1} of ${batches.length}... (${batch.length} recipients)`);
            
            const signature = await sendTransaction(transaction, connection);
            signatures.push(signature);
            
            // Wait for confirmation before proceeding to next batch
            try {
              await connection.confirmTransaction(signature, 'confirmed');
              totalTransferred += batch.length;
              
              if (batches.length > 1) {
                setMessage(`Batch ${batchIndex + 1} completed successfully! (${totalTransferred}/${validRecipients.length} recipients processed)`);
                
                // Small delay between batches to avoid rate limiting
                if (batchIndex < batches.length - 1) {
                  await new Promise(resolve => setTimeout(resolve, 1000));
                }
              }
            } catch (confirmError: any) {
              if (confirmError.message?.includes('not confirmed')) {
                // Transaction might still succeed, just taking longer
                console.warn(`Batch ${batchIndex + 1} confirmation timeout, but transaction may still succeed`);
                totalTransferred += batch.length;
              } else {
                throw confirmError;
              }
            }
          } catch (batchError: any) {
            console.error(`Error in batch ${batchIndex + 1}:`, batchError);
            throw new Error(`Failed at batch ${batchIndex + 1} after ${totalTransferred} successful transfers. Error: ${batchError.message}`);
          }
        }
        
        setMessage(`✅ All ${totalTransferred} SOL transfers completed successfully!`);
        setIsError(false);
      } else {
        // Token transfers with batch splitting
        if (!tokenMint) {
          setMessage('Please enter a token mint address.');
          setIsError(true);
          return;
        }

        const mintPk = new web3.PublicKey(tokenMint);
        const mintInfo = await getMint(connection, mintPk);
        
        // For token transfers, use smaller batches due to higher complexity
        const maxRecipientsPerTx = validRecipients.length > 3 ? 2 : validRecipients.length;
        const batches = [];
        
        for (let i = 0; i < validRecipients.length; i += maxRecipientsPerTx) {
          batches.push(validRecipients.slice(i, i + maxRecipientsPerTx));
        }
        
        let totalTransferred = 0;
        const signatures = [];
        
        for (const [batchIndex, batch] of batches.entries()) {
          const transaction = new web3.Transaction();
          
          // Higher compute budget for token transfers
          const computeUnits = 200_000 + (batch.length * 150_000);
          transaction.add(
            ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 500_000 }),
            ComputeBudgetProgram.setComputeUnitLimit({ units: computeUnits })
          );

          for (const recipient of batch) {
            const recipientAddress = new web3.PublicKey(recipient.address);
            const amount = Math.floor(parseFloat(recipient.amount) * Math.pow(10, mintInfo.decimals));

            const fromTokenAccount = await getAssociatedTokenAddress(mintPk, publicKey);
            const toTokenAccount = await getAssociatedTokenAddress(mintPk, recipientAddress);

            // Check if recipient's token account exists, create if not
            const toTokenAccountInfo = await connection.getAccountInfo(toTokenAccount);
            if (!toTokenAccountInfo) {
              transaction.add(
                createAssociatedTokenAccountInstruction(
                  publicKey, // payer
                  toTokenAccount, // ata
                  recipientAddress, // owner
                  mintPk // mint
                )
              );
            }

            transaction.add(
              createTransferInstruction(
                fromTokenAccount,
                toTokenAccount,
                publicKey,
                amount
              )
            );
          }

          try {
            setMessage(`Processing token batch ${batchIndex + 1} of ${batches.length}... (${batch.length} recipients)`);
            
            const signature = await sendTransaction(transaction, connection);
            signatures.push(signature);
            
            // Wait for confirmation
            try {
              await connection.confirmTransaction(signature, 'confirmed');
              totalTransferred += batch.length;
              
              if (batches.length > 1) {
                setMessage(`Token batch ${batchIndex + 1} completed successfully! (${totalTransferred}/${validRecipients.length} recipients processed)`);
                
                if (batchIndex < batches.length - 1) {
                  await new Promise(resolve => setTimeout(resolve, 1500));
                }
              }
            } catch (confirmError: any) {
              if (confirmError.message?.includes('not confirmed')) {
                console.warn(`Token batch ${batchIndex + 1} confirmation timeout, but transaction may still succeed`);
                totalTransferred += batch.length;
              } else {
                throw confirmError;
              }
            }
          } catch (batchError: any) {
            console.error(`Error in token batch ${batchIndex + 1}:`, batchError);
            throw new Error(`Token transfer failed at batch ${batchIndex + 1} after ${totalTransferred} successful transfers. Error: ${batchError.message}`);
          }
        }
        
        setMessage(`✅ All ${totalTransferred} token transfers completed successfully!`);
        setIsError(false);
      }

      // Clear recipients after successful transfer
      setRecipients([{ id: '1', address: '', amount: '' }]);
      if (activeTab === 'token') {
        setTokenMint('');
      }

    } catch (error: any) {
      console.error('Error in batch transfer:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      
      if (errorMessage.includes('insufficient funds')) {
        setMessage(`${t('errorBatchTransfer')}: Insufficient funds for this transfer.`);
      } else if (errorMessage.includes('blockhash not found')) {
        setMessage(`${t('errorBatchTransfer')}: Network congestion. Please try again.`);
      } else if (errorMessage.includes('Transaction too large')) {
        setMessage(`${t('errorBatchTransfer')}: Too many recipients. Please reduce the number of recipients per batch.`);
      } else {
        setMessage(`${t('errorBatchTransfer')}: ${errorMessage}`);
      }
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

  const getTotalAmount = () => {
    return recipients.reduce((sum, r) => {
      const amount = parseFloat(r.amount || '0');
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
  };

  const getValidRecipientsCount = () => {
    return recipients.filter(r => r.address && r.amount && isValidAddress(r.address) && isValidAmount(r.amount)).length;
  };

  if (!publicKey) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gray-900 rounded-md flex items-center justify-center">
            <Send className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('batchTransfer')}</h2>
            <p className="text-gray-600 dark:text-gray-300">{t('batchTransferDescription')}</p>
          </div>
        </div>
        
        <div className="p-6 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-900/20">
          <div className="text-center">
            <Send className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Wallet Connection Required
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Please connect your wallet to perform batch transfers.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Professional Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 shadow-2xl">
            <Send className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">{t('batchTransfer')}</h2>
            <p className="text-gray-300 font-medium">{t('batchTransferDescription')}</p>
          </div>
        </div>
        
        <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-200">Recipients</div>
            <div className="text-2xl font-bold text-white">{getValidRecipientsCount()}/{recipients.length}</div>
          </div>
        </div>
      </div>

      {/* Professional Tab Navigation */}
      <div className="flex space-x-2 p-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
        <button
          onClick={() => setActiveTab('sol')}
          className={`flex items-center space-x-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex-1 ${
            activeTab === 'sol'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xl transform scale-105'
              : 'text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Coins className="w-5 h-5" />
          <div className="text-left">
            <div className="font-bold">{t('sol') || 'SOL'}</div>
            <div className="text-xs opacity-75">Native Solana</div>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('token')}
          className={`flex items-center space-x-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex-1 ${
            activeTab === 'token'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-xl transform scale-105'
              : 'text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Token className="w-5 h-5" />
          <div className="text-left">
            <div className="font-bold">{t('token') || 'Token'}</div>
            <div className="text-xs opacity-75">SPL Tokens</div>
          </div>
        </button>
      </div>

      {/* Token Mint Input for Token Transfers */}
      {activeTab === 'token' && (
        <div className="bg-white/80 dark:bg-gray-900/60 backdrop-blur rounded-lg p-6 border border-gray-200 dark:border-white/10">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('tokenDetails')}</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {t('tokenMintAddress')}
            </label>
            <input
              type="text"
              value={tokenMint}
              onChange={(e) => setTokenMint(e.target.value)}
              placeholder="Enter token mint address"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
            {tokenMint && !isValidAddress(tokenMint) && (
              <p className="text-red-500 text-sm mt-1">{t('invalidTokenMint')}</p>
            )}
          </div>
        </div>
      )}

      {/* Recipients */}
      <div className="bg-white/80 dark:bg-gray-900/60 backdrop-blur rounded-lg p-6 border border-gray-200 dark:border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('recipients')}</h3>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Valid: {getValidRecipientsCount()} | Total: {getTotalAmount().toFixed(6)} {activeTab.toUpperCase()}
          </div>
        </div>

        <div className="space-y-4">
          {recipients.map((recipient, index) => (
            <div key={recipient.id} className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600 dark:text-blue-300">{index + 1}</span>
              </div>
              
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    value={recipient.address}
                    onChange={(e) => updateRecipient(recipient.id, 'address', e.target.value)}
                    placeholder={t('recipientAddress')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                  />
                  {recipient.address && !isValidAddress(recipient.address) && (
                    <p className="text-red-500 text-xs mt-1">{t('invalidAddress')}</p>
                  )}
                </div>
                
                <div>
                  <input
                    type="number"
                    value={recipient.amount}
                    onChange={(e) => updateRecipient(recipient.id, 'amount', e.target.value)}
                    placeholder={`${t('amount')} (${activeTab.toUpperCase()})`}
                    step="0.000000001"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                  />
                  {recipient.amount && !isValidAmount(recipient.amount) && (
                    <p className="text-red-500 text-xs mt-1">{t('invalidAmount')}</p>
                  )}
                </div>
              </div>
              
              {recipients.length > 1 && (
                <button
                  onClick={() => removeRecipient(recipient.id)}
                  className="flex-shrink-0 p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-4">
          <button
            onClick={addRecipient}
            disabled={recipients.length >= 10}
            className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addRecipient')} ({recipients.length}/10)</span>
          </button>

          <button
            onClick={handleBatchTransfer}
            disabled={isLoading || getValidRecipientsCount() === 0 || (activeTab === 'token' && !isValidAddress(tokenMint))}
            className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md transition-colors"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{t('processingTransfer')}</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>{t('sendToAll')} ({getValidRecipientsCount()})</span>
              </>
            )}
          </button>
        </div>

        {message && (
          <div className={`mt-4 p-3 rounded-md ${
            isError 
              ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800' 
              : 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
          }`}>
            {message}
          </div>
        )}
      </div>

      {/* Information Panel */}
      <div className="bg-white/80 dark:bg-gray-900/60 backdrop-blur border border-gray-200 dark:border-white/10 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('batchTransferInfo')}</h3>
        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
          <li>• Send {activeTab.toUpperCase()} to multiple recipients in a single operation</li>
          <li>• Automatic batch splitting for large transfers (SOL: 3-5 recipients per batch, Tokens: 2-3 per batch)</li>
          <li>• Balance validation before transfer initiation</li>
          <li>• Progress tracking for multi-batch operations</li>
          <li>• Automatic token account creation for recipients</li>
          <li>• Maximum 10 recipients per batch transfer</li>
        </ul>
      </div>
    </div>
  );
}