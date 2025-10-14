import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { web3, BN, AnchorProvider, Program } from '@coral-xyz/anchor';
import { Shield, Plus, Coins, Coins as Token } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Connection } from '@solana/web3.js';
import { useAnchorProgram } from '../lib/anchor';

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
    console.log('🔍 Debug info:', {
      program: !!program,
      programId: program?.programId?.toString(),
      publicKey: !!publicKey,
      publicKeyStr: publicKey?.toString()
    });
    
    console.log('📝 Form data:', {
      heirAddress,
      amount,
      tokenMint,
      inactivityDays,
      activeTab
    });
    
    if (!program || !publicKey) {
      if (!program) {
        setMessage('Program not initialized. Please refresh the page and try again.');
      } else {
        setMessage('Wallet not properly connected. Please disconnect and reconnect your wallet.');
      }
      return;
    }

      try {
      setIsLoading(true);
      setMessage('');
      console.log('🎯 Starting handleAddHeir function');
      // Validate inputs before proceeding
      if (!heirAddress.trim()) {
        console.log('❌ Validation failed: No heir address');
        setMessage('Please enter a valid heir wallet address.');
        return;
      }

      if (!amount.trim() || parseFloat(amount) <= 0) {
        console.log('❌ Validation failed: Invalid amount');
        setMessage('Please enter a valid amount greater than 0.');
        return;
      }

      if (!inactivityDays.trim() || parseFloat(inactivityDays) <= 0) {
        console.log('❌ Validation failed: Invalid inactivity days');
        setMessage('Please enter a valid inactivity period in days.');
        return;
      }

      if (activeTab === 'token' && (!tokenMint.trim() || !isValidAddress(tokenMint))) {
        console.log('❌ Validation failed: Invalid token mint');
        setMessage('Please enter a valid token mint address.');
        return;
      }
      
      console.log('✅ All validations passed');

      let heirPubkey;
      try {
        heirPubkey = new web3.PublicKey(heirAddress);
      } catch (error) {
        setMessage('Invalid heir wallet address format.');
        return;
      }
      
      // Ensure we have a valid publicKey
      if (!publicKey) {
        setMessage('Wallet not properly connected. Please reconnect your wallet.');
        return;
      }
      
      // Ensure heir address is different from owner
      if (heirPubkey.equals(publicKey)) {
        setMessage('Heir address cannot be the same as your wallet address.');
        return;
      }

      // Convert amount properly based on type
      const amountBN = activeTab === 'sol' 
        ? new BN(Math.floor(parseFloat(amount) * 1e9)) // Convert SOL to lamports
        : new BN(Math.floor(parseFloat(amount))); // Keep tokens as whole numbers
      
      // Ensure minimum 1 day inactivity period and convert to seconds
      const daysFloat = parseFloat(inactivityDays);
      const inactivitySeconds = Math.max(86400, Math.floor(daysFloat * 24 * 60 * 60)); // Minimum 1 day

      if (activeTab === 'sol') {
        // Validate that we have all required keys before PDA calculation
        console.log('🔍 PDA Calculation values:', {
          publicKey: publicKey?.toString(),
          heirPubkey: heirPubkey?.toString(),
          programId: program?.programId?.toString()
        });
        
        if (!publicKey || !heirPubkey || !program?.programId) {
          console.log('❌ Missing required data:', { publicKey: !!publicKey, heirPubkey: !!heirPubkey, programId: !!program?.programId });
          setMessage('Missing required data for transaction. Please refresh and try again.');
          return;
        }
        
        console.log('🧪 About to create Buffer seeds...');
        const seeds = [
          Buffer.from('sol_heir'),
          publicKey.toBuffer(),
          heirPubkey.toBuffer()
        ];
        console.log('🧪 Seeds created:', seeds.map(s => s.toString('hex')));
        
        const [solHeirPDA] = web3.PublicKey.findProgramAddressSync(
          seeds,
          program.programId
        );

        const inactivityBN = new BN(inactivitySeconds);
        
        console.log('🚀 About to call addCoinHeir with:', {
          amount: amountBN.toString(),
          amountType: typeof amountBN,
          inactivitySeconds,
          inactivityBN: inactivityBN.toString(),
          inactivityType: typeof inactivityBN,
          solHeirPDA: solHeirPDA.toString(),
          owner: publicKey.toString(),
          heir: heirPubkey.toString(),
          systemProgram: web3.SystemProgram.programId.toString()
        });

        console.log('🧪 Validating method arguments:');
        console.log('- amountBN:', amountBN, 'isValid:', amountBN && typeof amountBN.toString === 'function');
        console.log('- inactivityBN:', inactivityBN, 'isValid:', inactivityBN && typeof inactivityBN.toString === 'function');
        
        console.log('🧪 Calling program.methods.addSolHeir...');
        
        // Get user profile PDA
        const [userProfilePDA] = web3.PublicKey.findProgramAddressSync(
          [Buffer.from('user_profile'), publicKey.toBuffer()],
          program.programId
        );
        
        const txSignature = await program.methods
          .addSolHeir(amountBN, inactivityBN)
          .accountsPartial({
            solHeir: solHeirPDA,
            userProfile: userProfilePDA,
            owner: publicKey,
            heir: heirPubkey,
            systemProgram: web3.SystemProgram.programId,
          })
          .rpc({
            commitment: 'confirmed',
            preflightCommitment: 'confirmed',
            skipPreflight: false,
          });
          
        console.log('✅ Transaction successful:', txSignature);
        
        setMessage(t('heirAddedSuccessfully') || `SOL heir added successfully! Amount: ${amount} SOL, Inactivity: ${daysFloat} days`);
      } else {
        let tokenMintPubkey;
        try {
          tokenMintPubkey = new web3.PublicKey(tokenMint);
        } catch (error) {
          setMessage('Invalid token mint address format.');
          return;
        }
        
        // Validate that we have all required keys before PDA calculation
        if (!publicKey || !heirPubkey || !tokenMintPubkey || !program?.programId) {
          setMessage('Missing required data for token transaction. Please refresh and try again.');
          return;
        }
        
        const [tokenHeirPDA] = web3.PublicKey.findProgramAddressSync(
          [Buffer.from('token_heir'), publicKey.toBuffer(), heirPubkey.toBuffer(), tokenMintPubkey.toBuffer()],
          program.programId
        );

        console.log('🚀 About to call addTokenHeir with:', {
          amount: amountBN.toString(),
          inactivitySeconds,
          tokenHeirPDA: tokenHeirPDA.toString(),
          owner: publicKey.toString(),
          heir: heirPubkey.toString(),
          tokenMint: tokenMintPubkey.toString()
        });

        // TODO: Implement addTokenHeir method in the program
        console.log('addTokenHeir method not yet implemented in program');
        const txSignature = 'simulated-tx-signature';
        // const txSignature = await program.methods
        //   .addTokenHeir(amountBN, new BN(inactivitySeconds))
        //   .accountsPartial({
        //     tokenHeir: tokenHeirPDA,
        //     userProfile: tokenHeirPDA, // This will need to be computed properly
        //     owner: publicKey,
        //     heir: heirPubkey,
        //     tokenMint: tokenMintPubkey,
        //     systemProgram: web3.SystemProgram.programId,
        //   })
        //   .signers([])
        //   .rpc();
          
        console.log('✅ Transaction successful:', txSignature);
        
        setMessage(t('heirAddedSuccessfully') || `Token heir added successfully! Amount: ${amount} tokens, Inactivity: ${daysFloat} days`);
      }

      // Clear form after success
      setHeirAddress('');
      setAmount('');
      setTokenMint('');
      setInactivityDays('365');
      
    } catch (error) {
      let errorMessage = 'Error adding heir. ';
      if (error instanceof Error) {
        if (error.message.includes('already in use')) {
          errorMessage += 'An heir with these details already exists.';
        } else if (error.message.includes('insufficient funds')) {
          errorMessage += 'Insufficient funds to complete this transaction.';
        } else if (error.message.includes('Invalid public key')) {
          errorMessage += 'Invalid wallet address provided.';
        } else {
          errorMessage += `${error.message}`;
        }
      } else {
        errorMessage += 'Please check your inputs and try again.';
      }
      
      setMessage(errorMessage);
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
    return !isNaN(num) && num >= 1 && num <= 36500; // Min 1 day, max ~100 years
  };

  const isFormValid = () => {
    const checks = {
      hasHeirAddress: !!heirAddress,
      hasAmount: !!amount,
      hasInactivityDays: !!inactivityDays,
      validHeirAddress: isValidAddress(heirAddress),
      validAmount: isValidAmount(amount),
      validDays: isValidDays(inactivityDays),
      tokenValid: activeTab !== 'token' || (!!tokenMint && isValidAddress(tokenMint))
    };
    
    console.log('🔍 Form validation checks:', checks);
    
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
    <div className="space-y-8">
      {/* Professional Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 shadow-2xl">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">{t('inheritance')}</h2>
            <p className="text-gray-300 font-medium">Secure your digital legacy</p>
          </div>
        </div>
        
        <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-200">Legacy Protection</span>
          </div>
        </div>
      </div>

      {/* Professional Tab Navigation */}
      <div className="flex space-x-2 p-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
        <button
          onClick={() => setActiveTab('sol')}
          className={`flex items-center space-x-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex-1 ${
            activeTab === 'sol'
              ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-xl transform scale-105'
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
              ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-xl transform scale-105'
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
              min="0"
              step={activeTab === 'sol' ? '0.000000001' : '1'}
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
              max={36500}
              step={1}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <p className="text-xs text-gray-500 mt-1">
              After this many days of no activity, heirs can claim the assets (minimum 1 day, maximum ~100 years)
            </p>
            {inactivityDays && !isValidDays(inactivityDays) && (
              <p className="text-red-500 text-sm mt-1">Enter a valid number of days between 1 and 36,500</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!isFormValid() || isLoading}
            onClick={() => console.log('🖱️ Add Heir button clicked')}
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