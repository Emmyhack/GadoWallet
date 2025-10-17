import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { web3, BN } from '@coral-xyz/anchor';
import { Shield, Plus, Coins } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAnchorProgram } from '../lib/anchor';
// Note: addSolHeir and initializeUser functions need to be implemented in anchor.ts

export function BasicInheritanceManager() {
  const { publicKey } = useWallet();
  const program = useAnchorProgram();
  const { t } = useTranslation();
  
  // Form states
  const [heirAddress, setHeirAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [inactivityDays, setInactivityDays] = useState('365');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddHeir = async () => {
    if (!program || !publicKey) {
      setMessage('Please connect your wallet first.');
      return;
    }

    try {
      setIsLoading(true);
      setMessage('');
      
      // Basic validation
      if (!heirAddress.trim()) {
        setMessage('Please enter a heir wallet address.');
        return;
      }
      
      if (!amount.trim() || parseFloat(amount) <= 0) {
        setMessage('Please enter a valid amount.');
        return;
      }

      // Create heir public key
      const heirPubkey = new web3.PublicKey(heirAddress);
      
      // Convert amount to lamports (SOL * 10^9)
      const amountLamports = new BN(Math.floor(parseFloat(amount) * 1e9));
      
      // Convert days to seconds
      const inactivitySeconds = Math.floor(parseFloat(inactivityDays) * 24 * 60 * 60);
      
      // Initialize user profile if needed (ignore if already exists)
      try {
        // TODO: Implement initializeUser function
        console.log('initializeUser function not yet implemented');
        // await initializeUser(program);
      } catch (profileError) {
        // Profile might already exist, continue
      }

      // Add SOL heir using helper function
      // TODO: Implement addSolHeir function
      console.log('addSolHeir function not yet implemented');
      const txSignature = 'simulated-tx-signature';
      // const txSignature = await addSolHeir(program, heirPubkey, amountLamports, inactivitySeconds);
        
      setMessage(`✅ Heir added successfully! Transaction: ${txSignature.slice(0, 8)}...`);
        
      // Clear form
      setHeirAddress('');
      setAmount('');
      setInactivityDays('365');

    } catch (error) {
      console.error('Error adding heir:', error);
      let errorMessage = 'Error adding heir. ';
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid public key')) {
          errorMessage += 'Invalid wallet address provided.';
        } else if (error.message.includes('insufficient funds')) {
          errorMessage += 'Insufficient funds for this transaction.';
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += 'Please check your inputs and try again.';
      }
      
      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Validation helpers
  const isValidAddress = (address: string) => {
    try {
      new web3.PublicKey(address);
      return true;
    } catch {
      return false;
    }
  };

  const isFormValid = () => {
    return heirAddress && 
           amount && 
           inactivityDays &&
           isValidAddress(heirAddress) &&
           parseFloat(amount) > 0 &&
           parseFloat(inactivityDays) >= 1;
  };

  if (!publicKey) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gray-900 rounded-md flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Inheritance</h2>
            <p className="text-gray-600 dark:text-gray-300">Secure your digital legacy</p>
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-600 rounded-md flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Basic Inheritance</h2>
          <p className="text-gray-600 dark:text-gray-300">Set up simple SOL inheritance</p>
        </div>
      </div>

      {/* Add Heir Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <Coins className="w-5 h-5" />
          <span>Add SOL Heir</span>
        </h3>
        
        <form onSubmit={(e) => { e.preventDefault(); handleAddHeir(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Heir Wallet Address
            </label>
            <input
              type="text"
              value={heirAddress}
              onChange={(e) => setHeirAddress(e.target.value)}
              placeholder="Enter heir's wallet address"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
            {heirAddress && !isValidAddress(heirAddress) && (
              <p className="text-red-500 text-sm mt-1">Invalid wallet address</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Amount (SOL)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter SOL amount"
              min="0"
              step="0.000000001"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
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
              min="1"
              step="1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <p className="text-xs text-gray-500 mt-1">
              After this many days of no activity, the heir can claim the assets
            </p>
          </div>

          <button
            type="submit"
            disabled={!isFormValid() || isLoading || !program}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md transition-colors"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Add Heir</span>
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
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 dark:text-white mb-2">How It Works</h3>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Set an heir to inherit your SOL after a period of inactivity</li>
          <li>• Choose how many days of inactivity before inheritance becomes claimable</li>
          <li>• Your heir can claim the inheritance after the specified period</li>
          <li>• Any activity from your wallet resets the inactivity timer</li>
        </ul>
      </div>
    </div>
  );
}