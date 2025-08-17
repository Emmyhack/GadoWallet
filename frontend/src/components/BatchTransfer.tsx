import { useState } from 'react';
import { useAnchorProgram } from '../lib/anchor';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { web3, BN } from '@project-serum/anchor';
import { Send, Plus, Trash2, Coins, Coins as Token } from 'lucide-react';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, getMint, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { useTranslation } from 'react-i18next';

interface Recipient {
  id: string;
  address: string;
  amount: string;
}

export function BatchTransfer() {
  const program = useAnchorProgram();
  const { publicKey } = useWallet();
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

      if (activeTab === 'sol') {
        for (const recipient of validRecipients) {
          const toAddress = new web3.PublicKey(recipient.address);
          const amount = new BN(parseFloat(recipient.amount) * 1e9);
          await program.methods
            .batchTransferCoins([amount])
            .accounts({
              from_account: publicKey,
              to_account: toAddress,
              system_program: web3.SystemProgram.programId,
            })
            .rpc();
        }
        setMessage(t('solTransfersCompleted'));
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
        for (const recipient of validRecipients) {
          const toOwner = new web3.PublicKey(recipient.address);
          const fromTokenAccount = await getAssociatedTokenAddress(mintPk, publicKey);
          const toTokenAccount = await getAssociatedTokenAddress(mintPk, toOwner);

          const ix: web3.TransactionInstruction[] = [];
          const toAccountInfo = await connection.getAccountInfo(toTokenAccount);
          if (!toAccountInfo) {
            ix.push(
              createAssociatedTokenAccountInstruction(
                publicKey,
                toTokenAccount,
                toOwner,
                mintPk
              )
            );
          }

          const uiAmount = parseFloat(recipient.amount);
          const rawAmount = new BN(Math.floor(uiAmount * 10 ** decimals));
          await program.methods
            .batchTransferTokens([rawAmount])
            .accounts({
              from_token_account: fromTokenAccount,
              to_token_account: toTokenAccount,
              authority: publicKey,
              token_program: TOKEN_PROGRAM_ID,
            })
            .preInstructions(ix)
            .rpc();
        }
        setMessage(t('tokenTransfersCompleted'));
        setIsError(false);
      }

      // Reset form
      setRecipients([{ id: '1', address: '', amount: '' }]);
      setTokenMint('');
    } catch (error) {
      console.error('Error in batch transfer:', error);
      setMessage(t('errorBatchTransfer'));
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