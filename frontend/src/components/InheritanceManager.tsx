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
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'sol' | 'token'>('sol');
  const [heirAddress, setHeirAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [tokenMint, setTokenMint] = useState('');
  const [inactivityDays, setInactivityDays] = useState('365');
  const [message, setMessage] = useState('');

  const handleAddHeir = async () => {
    if (!program || !publicKey) return;

    try {
      setIsLoading(true);
      setMessage('');

      const heirPubkey = new web3.PublicKey(heirAddress);
      const amountBN = new BN(parseFloat(amount) * 1e9); // Convert SOL to lamports
      const inactivitySeconds = Math.max(1, Math.floor(parseFloat(inactivityDays || '0') * 24 * 60 * 60));

      if (activeTab === 'sol') {
        await program.methods
          .addCoinHeir(amountBN, new BN(inactivitySeconds))
          .accounts({
            coin_heir: web3.PublicKey.findProgramAddressSync(
              [Buffer.from('coin_heir'), publicKey.toBuffer(), heirPubkey.toBuffer()],
              program.programId
            )[0],
            owner: publicKey,
            heir: heirPubkey,
            system_program: web3.SystemProgram.programId,
          })
          .rpc();
        setMessage(t('heirAddedSuccessfully') || 'Heir added successfully!');
      } else {
        const tokenMintPubkey = new web3.PublicKey(tokenMint);
        await program.methods
          .addTokenHeir(amountBN, new BN(inactivitySeconds))
          .accounts({
            token_heir: web3.PublicKey.findProgramAddressSync(
              [Buffer.from('token_heir'), publicKey.toBuffer(), heirPubkey.toBuffer(), tokenMintPubkey.toBuffer()],
              program.programId
            )[0],
            owner: publicKey,
            heir: heirPubkey,
            token_mint: tokenMintPubkey,
            system_program: web3.SystemProgram.programId,
          })
          .rpc();
        setMessage(t('heirAddedSuccessfully') || 'Heir added successfully!');
      }

      setHeirAddress('');
      setAmount('');
      setTokenMint('');
      setInactivityDays('365');
    } catch (error) {
      console.error('Error adding heir:', error);
      setMessage('Error adding heir. Please try again.');
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

  const isValidDays = (days: string) => {
    const num = parseFloat(days);
    return !isNaN(num) && num > 0;
  };

  const isFormValid = () => {
    if (!heirAddress || !amount || !inactivityDays) return false;
    if (!isValidAddress(heirAddress)) return false;
    if (!isValidAmount(amount)) return false;
    if (!isValidDays(inactivityDays)) return false;
    if (activeTab === 'token' && (!tokenMint || !isValidAddress(tokenMint))) return false;
    return true;
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

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-md">
        <button
          onClick={() => setActiveTab('sol')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all ${
            activeTab === 'sol'
              ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>{t('sol') || 'SOL'}</span>
        </button>
        <button
          onClick={() => setActiveTab('token')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all ${
            activeTab === 'token'
              ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Token className="w-4 h-4" />
          <span>{t('token') || 'Token'}</span>
        </button>
      </div>

      {/* Add Heir Form */}
      <div className="bg-white/80 dark:bg-gray-900/60 backdrop-blur rounded-lg p-6 border border-gray-200 dark:border-white/10">
        <form onSubmit={(e) => { e.preventDefault(); handleAddHeir(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {t('heirWalletAddress') || 'Heir Wallet Address'}
            </label>
            <input
              type="text"
              value={heirAddress}
              onChange={(e) => setHeirAddress(e.target.value)}
              placeholder="Enter heir's wallet address"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
            {heirAddress && !isValidAddress(heirAddress) && (
              <p className="text-red-500 text-sm mt-1">{t('invalidWalletAddress') || 'Invalid wallet address'}</p>
            )}
          </div>

          {activeTab === 'token' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                {t('tokenMintAddress') || 'Token Mint Address'}
              </label>
              <input
                type="text"
                value={tokenMint}
                onChange={(e) => setTokenMint(e.target.value)}
                placeholder="Enter token mint address"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
              {tokenMint && !isValidAddress(tokenMint) && (
                <p className="text-red-500 text-sm mt-1">{t('invalidTokenMint') || 'Invalid token mint address'}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {t('amountLabel') || 'Amount'} ({activeTab === 'sol' ? 'SOL' : 'Tokens'})
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Enter ${activeTab === 'sol' ? 'SOL' : 'token'} amount`}
              step="0.000000001"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
            {amount && !isValidAmount(amount) && (
              <p className="text-red-500 text-sm mt-1">{t('invalidAmount') || 'Invalid amount'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Inactivity Period (days)
            </label>
            <input
              type="number"
              value={inactivityDays}
              onChange={(e) => setInactivityDays(e.target.value)}
              placeholder="e.g. 365"
              min={1}
              step={1}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <p className="text-xs text-gray-500 mt-1">
              After this many days of no activity, heirs can claim the assets
            </p>
            {inactivityDays && !isValidDays(inactivityDays) && (
              <p className="text-red-500 text-sm mt-1">Enter a valid number of days</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!isFormValid() || isLoading}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md transition-colors"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{t('processingTransfer') || 'Processing...'}</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>{t('addHeir') || 'Add Heir'}</span>
              </>
            )}
          </button>
        </form>

        {message && (
          <div className={`mt-4 p-3 rounded-md ${
            message.includes('Error') 
              ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800' 
              : 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
          }`}>
            {message}
          </div>
        )}
      </div>

      {/* Information Panel */}
      <div className="bg-white/80 dark:bg-gray-900/60 backdrop-blur border border-gray-200 dark:border-white/10 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('whyGado') || 'Why Use Gado?'}</h3>
        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
          <li>• {t('designateHeirs') || 'Designate heirs for your digital assets'}</li>
          <li>• {t('batchTransfer') || 'Perform batch transfers efficiently'}</li>
          <li>• Set custom inactivity periods in days</li>
          <li>• Heirs can claim after the specified inactivity period</li>
          <li>• Activity updates reset the inactivity timer</li>
          <li>• Secure and transparent inheritance management</li>
        </ul>
      </div>
    </div>
  );
}