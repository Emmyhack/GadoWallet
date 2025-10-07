import { useState } from 'react';
import { useAnchorProgram } from '../lib/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import { web3, BN } from '@coral-xyz/anchor';
import { Shield, Plus, Coins, Coins as Token, Mail, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ProgramStatus } from './ProgramStatus';
import { EmailService, InheritanceEmailData } from '../lib/emailService';
import { PROGRAM_ID } from '../lib/publickey-utils';
import { getNetworkLabel } from '../lib/config';

export function InheritanceManager() {
  const program = useAnchorProgram();
  const { publicKey } = useWallet();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'sol' | 'token'>('sol');
  const [heirAddress, setHeirAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [tokenMint, setTokenMint] = useState('');
  const [inactivityDays, setInactivityDays] = useState('2');
  const [message, setMessage] = useState('');
  
  // NEW: Email notification fields
  const [heirEmail, setHeirEmail] = useState('');
  const [heirName, setHeirName] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');
  const [sendEmailNotification, setSendEmailNotification] = useState(true);
  const [claimLink, setClaimLink] = useState<string | null>(null);

  // Generate claim link and send email notification
  const generateAndSendClaimLink = async (inheritanceData: any) => {
    try {
      // Generate unique inheritance ID (using timestamp + owner + heir)
      const inheritanceId = `${Date.now()}_${inheritanceData.ownerAddress.slice(-8)}_${inheritanceData.heirAddress.slice(-8)}`;
      
      // Generate secure token (in production, use crypto.randomBytes)
      const secureToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0')).join('');
      
      // Create claim URL
      const claimUrl = `${window.location.origin}/claim/${inheritanceId}/${secureToken}`;
      
      // Store claim link data (in production, this would go to a database)
      const claimData = {
        inheritanceId,
        secureToken,
        claimUrl,
        ...inheritanceData,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + (90 * 24 * 60 * 60 * 1000)).toISOString(), // 90 days
        isUsed: false
      };
      
      // Store in localStorage for demo (replace with API call in production)
      const existingClaims = JSON.parse(localStorage.getItem('inheritanceClaimLinks') || '[]');
      existingClaims.push(claimData);
      localStorage.setItem('inheritanceClaimLinks', JSON.stringify(existingClaims));
      
      // Send email notification (simulate API call)
      await sendInheritanceEmail(claimData);
      
      setClaimLink(claimUrl);
      setMessage(prev => prev + ` 📧 Email notification sent to ${inheritanceData.heirEmail}`);
      
    } catch (error) {
      console.error('Failed to generate claim link:', error);
      setMessage(prev => prev + ` ⚠️ Email notification failed`);
    }
  };

  // Send inheritance email using EmailService
  const sendInheritanceEmail = async (claimData: any) => {
    const emailData: InheritanceEmailData = {
      heirName: claimData.heirName,
      heirEmail: claimData.heirEmail,
      ownerWallet: claimData.ownerAddress,
      heirWallet: claimData.heirAddress,
      amount: claimData.amount,
      assetType: claimData.assetType,
      claimUrl: claimData.claimUrl,
      personalMessage: claimData.personalMessage,
      inactivityPeriod: claimData.inactivityPeriod
    };
    
    return await EmailService.simulateEmailSend(emailData);
  };

  // Preview email before sending
  const previewEmail = () => {
    if (!heirEmail || !heirName) return;
    
    const emailData: InheritanceEmailData = {
      heirName: heirName || 'Beneficiary',
      heirEmail: heirEmail,
      ownerWallet: publicKey?.toBase58() || 'Your Wallet',
      heirWallet: heirAddress || 'Heir Wallet',
      amount: amount || '0',
      assetType: activeTab === 'sol' ? 'SOL' : 'TOKEN',
      claimUrl: 'https://gadawallet.com/claim/preview/token',
      personalMessage: personalMessage,
      inactivityPeriod: parseFloat(inactivityDays) || 2
    };
    
    EmailService.previewEmail(emailData);
  };

  const handleAddHeir = async () => {
    if (!program || !publicKey) return;

    try {
      setIsLoading(true);
      setMessage('');
      

      // Validate inputs before proceeding
      if (!heirAddress.trim()) {
        setMessage('Please enter a valid heir wallet address.');
        return;
      }

      if (!amount.trim() || parseFloat(amount) <= 0) {
        setMessage('Please enter a valid amount greater than 0.');
        return;
      }

      if (!inactivityDays.trim() || parseFloat(inactivityDays) <= 0) {
        setMessage('Please enter a valid inactivity period in days.');
        return;
      }

      if (activeTab === 'token' && (!tokenMint.trim() || !isValidAddress(tokenMint))) {
        setMessage('Please enter a valid token mint address.');
        return;
      }

      const heirPubkey = new web3.PublicKey(heirAddress);
      
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
        const [coinHeirPDA] = web3.PublicKey.findProgramAddressSync(
          [Buffer.from('coin_heir'), publicKey.toBuffer(), heirPubkey.toBuffer()],
          program.programId
        );

        // Get user profile PDA - required by the smart contract
        const [userProfilePDA] = web3.PublicKey.findProgramAddressSync(
          [Buffer.from('user_profile'), publicKey.toBuffer()],
          program.programId
        );

        await program.methods
          .addCoinHeir(amountBN, new BN(inactivitySeconds))
          .accounts({
            coinHeir: coinHeirPDA,
            userProfile: userProfilePDA,
            owner: publicKey,
            heir: heirPubkey,
            systemProgram: web3.SystemProgram.programId,
          })
          .rpc();
        
        setMessage(t('heirAddedSuccessfully') || `SOL heir added successfully! Amount: ${amount} SOL, Inactivity: ${daysFloat} days`);
        
        // Generate claim link for SOL inheritance
        if (sendEmailNotification && heirEmail.trim()) {
          await generateAndSendClaimLink({
            type: 'sol',
            heirAddress: heirPubkey.toBase58(),
            ownerAddress: publicKey.toBase58(),
            amount: amount,
            assetType: 'SOL',
            inactivityPeriod: daysFloat,
            heirEmail: heirEmail.trim(),
            heirName: heirName.trim() || 'Beneficiary',
            personalMessage: personalMessage.trim()
          });
        }
      } else {
        const tokenMintPubkey = new web3.PublicKey(tokenMint);
        const [tokenHeirPDA] = web3.PublicKey.findProgramAddressSync(
          [Buffer.from('token_heir'), publicKey.toBuffer(), heirPubkey.toBuffer(), tokenMintPubkey.toBuffer()],
          program.programId
        );

        // Get user profile PDA - required by the smart contract
        const [userProfilePDA] = web3.PublicKey.findProgramAddressSync(
          [Buffer.from('user_profile'), publicKey.toBuffer()],
          program.programId
        );

        await program.methods
          .addTokenHeir(amountBN, new BN(inactivitySeconds))
          .accounts({
            tokenHeir: tokenHeirPDA,
            userProfile: userProfilePDA,
            owner: publicKey,
            heir: heirPubkey,
            tokenMint: tokenMintPubkey,
            systemProgram: web3.SystemProgram.programId,
          })
          .rpc();
        
        setMessage(t('heirAddedSuccessfully') || `Token heir added successfully! Amount: ${amount} tokens, Inactivity: ${daysFloat} days`);
        
        // Generate claim link for token inheritance
        if (sendEmailNotification && heirEmail.trim()) {
          await generateAndSendClaimLink({
            type: 'token',
            heirAddress: heirPubkey.toBase58(),
            ownerAddress: publicKey.toBase58(),
            amount: amount,
            assetType: 'TOKEN',
            tokenMint: tokenMint,
            inactivityPeriod: daysFloat,
            heirEmail: heirEmail.trim(),
            heirName: heirName.trim() || 'Beneficiary',
            personalMessage: personalMessage.trim()
          });
        }
      }

      // Clear form after success
      setHeirAddress('');
      setAmount('');
      setTokenMint('');
      setInactivityDays('2');
      setHeirEmail('');
      setHeirName('');
      setPersonalMessage('');
      
    } catch (error) {
      console.error('Error adding heir:', error);
      
      // Handle SendTransactionError specifically to get detailed logs
      if (error && typeof error === 'object' && 'getLogs' in error) {
        try {
          const logs = (error as any).getLogs();
          console.error('Transaction logs from getLogs():', logs);
        } catch (logError) {
          console.error('Failed to get transaction logs:', logError);
        }
      }
      
      // Also check for logs property
      if (error && typeof error === 'object' && 'logs' in error && Array.isArray((error as any).logs)) {
        console.error('Transaction logs from property:', (error as any).logs);
      }
      
      let errorMessage = 'Error adding heir. ';
      if (error instanceof Error) {
        if (error.message.includes('already in use')) {
          errorMessage += 'An heir with these details already exists.';
        } else if (error.message.includes('insufficient funds')) {
          errorMessage += 'Insufficient funds to complete this transaction.';
        } else if (error.message.includes('Invalid public key')) {
          errorMessage += 'Invalid wallet address provided.';
        } else if (error.message.includes('user_profile') || error.message.includes('Account does not exist or has no data') || error.message.includes('AccountNotInitialized')) {
          errorMessage += 'User profile not found. Please create a user profile first by going to Platform Status → Create User Profile.';
        } else if (error.message.includes('program that does not exist') || error.message.includes('Attempt to load a program that does not exist')) {
          errorMessage += 'The Gado program is not deployed on this network. Please contact support or try again later.';
          console.error('Program deployment issue - Program ID:', PROGRAM_ID.toBase58(), 'Network:', getNetworkLabel());
        } else if (error.message.includes('Simulation failed')) {
          errorMessage += 'Transaction simulation failed. This usually means the program is not deployed or network issues. Please try again.';
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
    if (!heirAddress || !amount || !inactivityDays) return false;
    if (!isValidAddress(heirAddress)) return false;
    if (!isValidAmount(amount)) return false;
    if (!isValidDays(inactivityDays)) return false;
    if (activeTab === 'token' && (!tokenMint || !isValidAddress(tokenMint))) return false;
    if (sendEmailNotification && (!heirEmail.trim() || !isValidEmail(heirEmail))) return false;
    return true;
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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

      {/* Program Status */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
        <ProgramStatus />
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

          {/* Email Notification Section */}
          <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
            <div className="flex items-center space-x-3 mb-4">
              <input
                type="checkbox"
                id="emailNotification"
                checked={sendEmailNotification}
                onChange={(e) => setSendEmailNotification(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="emailNotification" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                📧 Send claim link to heir via email
              </label>
            </div>
            
            {sendEmailNotification && (
              <div className="space-y-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Heir's Email Address
                  </label>
                  <input
                    type="email"
                    value={heirEmail}
                    onChange={(e) => setHeirEmail(e.target.value)}
                    placeholder="heir@example.com"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Heir's Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={heirName}
                    onChange={(e) => setHeirName(e.target.value)}
                    placeholder="John Smith"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Personal Message (Optional)
                  </label>
                  <textarea
                    value={personalMessage}
                    onChange={(e) => setPersonalMessage(e.target.value)}
                    placeholder="A personal message for your heir..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <p>📋 Your heir will receive an email with:</p>
                    <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                      <li>Direct claim link to access their inheritance</li>
                      <li>Instructions on how to connect their wallet</li>
                      <li>Details about the inheritance amount and timing</li>
                      <li>Your personal message (if provided)</li>
                    </ul>
                  </div>
                  
                  <button
                    type="button"
                    onClick={previewEmail}
                    disabled={!heirEmail || !heirName}
                    className="ml-4 px-3 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded text-sm flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Preview Email</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Claim Link Display */}
          {claimLink && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                ✅ Claim Link Generated
              </h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={claimLink}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(claimLink)}
                    className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Share this link with your heir. It will allow them to claim their inheritance directly.
                </p>
              </div>
            </div>
          )}

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
              placeholder="e.g. 2"
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
        {/* User Profile Requirement Notice */}
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">📋 Prerequisites</h4>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Before adding heirs, you need a user profile. If you haven't created one yet, go to 
            <span className="font-semibold"> Platform Status → Create User Profile</span> first.
          </p>
        </div>
        
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