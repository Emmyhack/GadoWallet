import { useState } from 'react';
import { useAnchorProgram } from '../lib/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import { web3, BN } from '@project-serum/anchor';
import { Shield, Plus, Coins, Coins as Token } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function InheritanceManager() {
  const program = useAnchorProgram();
  const { publicKey } = useWallet();
  const { t } = useTranslation();

  const [heirAddress, setHeirAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [tokenMint, setTokenMint] = useState('');
  const [assetType, setAssetType] = useState<'sol' | 'token'>('sol');
  const [message, setMessage] = useState('');

  const addHeir = async () => {
    if (!program || !publicKey) return;

    try {
      setMessage('Adding heir...');
      const heirPubkey = new web3.PublicKey(heirAddress);
      
      if (assetType === 'sol') {
        // Add SOL heir
        const amountLamports = new BN(parseFloat(amount) * web3.LAMPORTS_PER_SOL);
        await program.methods.addCoinHeir(heirPubkey, amountLamports).accounts({
          owner: publicKey,
          coinHeir: web3.PublicKey.findProgramAddressSync(
            [Buffer.from('coin_heir'), publicKey.toBuffer(), heirPubkey.toBuffer()],
            program.programId
          )[0],
          systemProgram: web3.SystemProgram.programId,
        }).rpc();
      } else {
        // Add Token heir
        const tokenMintPubkey = new web3.PublicKey(tokenMint);
        const amountTokens = new BN(parseFloat(amount) * Math.pow(10, 6)); // Assuming 6 decimals
        await program.methods.addTokenHeir(heirPubkey, tokenMintPubkey, amountTokens).accounts({
          owner: publicKey,
          tokenHeir: web3.PublicKey.findProgramAddressSync(
            [Buffer.from('token_heir'), publicKey.toBuffer(), heirPubkey.toBuffer(), tokenMintPubkey.toBuffer()],
            program.programId
          )[0],
          systemProgram: web3.SystemProgram.programId,
        }).rpc();
      }
      
      setMessage('Heir added successfully!');
      setHeirAddress('');
      setAmount('');
      setTokenMint('');
    } catch (error) {
      console.error('Error adding heir:', error);
      setMessage('Error');
    }
  };

  const isValidSolanaAddress = (address: string) => {
    try {
      new web3.PublicKey(address);
      return true;
    } catch {
      return false;
    }
  };

  if (!publicKey) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gray-900 rounded-md flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('inheritance')}</h2>
            <p className="text-gray-600 dark:text-gray-300">{t('whyGado')}</p>
          </div>
        </div>
        
        <div className="p-6 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-900/20">
          <div className="text-center">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Wallet Connection Required
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Please connect your wallet to manage inheritance plans.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-gray-900 rounded-md flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('inheritance')}</h2>
          <p className="text-gray-600 dark:text-gray-300">{t('whyGado')}</p>
        </div>
      </div>

      {/* Asset Type Selection */}
      <div className="bg-white/80 dark:bg-gray-900/60 rounded-lg border border-gray-200 dark:border-white/10 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('addHeir')}</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('assetType')}
          </label>
          <div className="flex space-x-4">
            <button
              onClick={() => setAssetType('sol')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md border transition-colors ${
                assetType === 'sol'
                  ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
                  : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Coins className="w-4 h-4" />
              <span>SOL</span>
            </button>
            <button
              onClick={() => setAssetType('token')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md border transition-colors ${
                assetType === 'token'
                  ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
                  : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Token className="w-4 h-4" />
              <span>{t('token')}</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('heirAddress')}
            </label>
            <input
              type="text"
              value={heirAddress}
              onChange={(e) => setHeirAddress(e.target.value)}
              placeholder={t('heirAddressPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
            {heirAddress && !isValidSolanaAddress(heirAddress) && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {t('invalidAddress')}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {assetType === 'sol' ? t('amountSol') : t('amountToken')}
            </label>
            <input
              type="number"
              step="0.000001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={assetType === 'sol' ? '0.1' : '1000'}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {assetType === 'token' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('tokenMintAddress')}
              </label>
              <input
                type="text"
                value={tokenMint}
                onChange={(e) => setTokenMint(e.target.value)}
                placeholder={t('tokenMintPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
              {tokenMint && !isValidSolanaAddress(tokenMint) && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {t('invalidTokenMint')}
                </p>
              )}
            </div>
          )}

          <button
            onClick={addHeir}
            disabled={!heirAddress || !amount || (assetType === 'token' && !tokenMint) || !isValidSolanaAddress(heirAddress) || (assetType === 'token' && !isValidSolanaAddress(tokenMint))}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addHeir')}</span>
          </button>

          {message && (
            <div className={`mt-4 p-3 rounded-md ${
              message.includes('Error') 
                ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800' 
                : 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
            }`}>
              {message.includes('Error') ? (
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>{t('errorAddingHeir')}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>{message}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}