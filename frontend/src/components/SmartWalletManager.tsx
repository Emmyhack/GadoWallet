import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet } from '@coral-xyz/anchor';
import * as anchor from '@coral-xyz/anchor';
import { toast } from 'react-hot-toast';
import { 
  Wallet as WalletIcon, 
  Users, 
  Clock, 
  Shield, 
  Plus, 
  Trash2,
  RefreshCw,
  Send,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

// Import the IDL and types
import { Gada } from '../lib/types/gada';
import IDL from '../lib/idl/gada.json';

interface HeirData {
  heirPubkey: PublicKey;
  allocationPercentage: number;
}

interface SmartWalletData {
  owner: PublicKey;
  heirs: HeirData[];
  inactivityPeriodSeconds: number;
  lastActiveTime: number;
  isExecuted: boolean;
  bump: number;
}

const PROGRAM_ID = new PublicKey("EciS2vNDTe5S6WnNWEBmdBmKjQL5bsXyfauYmxPFKQGu");

export default function SmartWalletManager() {
  const { publicKey, wallet, signTransaction, signAllTransactions } = useWallet();
  const [connection] = useState(() => new Connection('https://api.devnet.solana.com', 'confirmed'));
  const [program, setProgram] = useState<Program<Gada> | null>(null);
  
  // Smart Wallet state
  const [smartWallet, setSmartWallet] = useState<SmartWalletData | null>(null);
  const [smartWalletBalance, setSmartWalletBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form state for creating Smart Wallet
  const [heirs, setHeirs] = useState<{ address: string; percentage: number }[]>([
    { address: '', percentage: 50 },
    { address: '', percentage: 50 }
  ]);
  const [inactivityDays, setInactivityDays] = useState<number>(365);
  const [depositAmount, setDepositAmount] = useState<string>('');

  // Initialize program
  useEffect(() => {
    if (!wallet || !publicKey) return;

    const initializeProgram = async () => {
      try {
        const provider = new AnchorProvider(
          connection,
          wallet.adapter as any,
          { commitment: 'confirmed' }
        );
        
        const programInstance = new Program(IDL as any, provider) as Program<Gada>;
        setProgram(programInstance);
      } catch (error) {
        console.error('Failed to initialize program:', error);
      }
    };

    initializeProgram();
  }, [wallet, publicKey, connection]);

  // Load Smart Wallet data
  useEffect(() => {
    if (!program || !publicKey) return;

    const loadSmartWallet = async () => {
      setLoading(true);
      try {
        const [smartWalletPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("smart_wallet"), publicKey.toBuffer()],
          PROGRAM_ID
        );

        const smartWalletAccount = await program.account.smartWallet.fetch(smartWalletPDA);
        setSmartWallet(smartWalletAccount as any);

        // Get balance
        const [smartWalletAssetPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("smart_wallet_pda"), publicKey.toBuffer()],
          PROGRAM_ID
        );
        
        const balance = await connection.getBalance(smartWalletAssetPDA);
        setSmartWalletBalance(balance / LAMPORTS_PER_SOL);
      } catch (error) {
        console.log('No Smart Wallet found for this account');
        setSmartWallet(null);
        setSmartWalletBalance(0);
      }
      setLoading(false);
    };

    loadSmartWallet();
  }, [program, publicKey, connection]);

  const addHeir = () => {
    if (heirs.length < 10) {
      setHeirs([...heirs, { address: '', percentage: 0 }]);
    } else {
      toast.error('Maximum 10 heirs allowed');
    }
  };

  const removeHeir = (index: number) => {
    if (heirs.length > 1) {
      setHeirs(heirs.filter((_, i) => i !== index));
    } else {
      toast.error('At least one heir required');
    }
  };

  const updateHeir = (index: number, field: 'address' | 'percentage', value: string | number) => {
    const updatedHeirs = [...heirs];
    updatedHeirs[index] = { ...updatedHeirs[index], [field]: value };
    setHeirs(updatedHeirs);
  };

  const getTotalPercentage = () => {
    return heirs.reduce((sum, heir) => sum + (heir.percentage || 0), 0);
  };

  const createSmartWallet = async () => {
    if (!program || !publicKey) {
      toast.error('Wallet not connected');
      return;
    }

    // Validation
    const totalPercentage = getTotalPercentage();
    if (totalPercentage !== 100) {
      toast.error(`Total allocation must be 100%, currently ${totalPercentage}%`);
      return;
    }

    const validHeirs = heirs.filter(heir => {
      try {
        new PublicKey(heir.address);
        return heir.percentage > 0;
      } catch {
        return false;
      }
    });

    if (validHeirs.length === 0) {
      toast.error('Please add at least one valid heir');
      return;
    }

    setIsCreating(true);
    try {
      // First, check if platform is initialized
      const [platformConfigPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("platform_config")],
        PROGRAM_ID
      );

      let platformInitialized = false;
      try {
        await program.account.platformConfig.fetch(platformConfigPDA);
        platformInitialized = true;
      } catch (error) {
        console.log('Platform not initialized');
        toast.error('Platform not initialized. Please contact support.');
        setIsCreating(false);
        return;
      }

      // Check if user profile exists and create it if not
      const [userProfilePDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("user_profile"), publicKey.toBuffer()],
        PROGRAM_ID
      );

      let userProfileExists = false;
      try {
        await program.account.userProfile.fetch(userProfilePDA);
        userProfileExists = true;
      } catch (error) {
        console.log('User profile does not exist, will create it first');
      }

      // Create user profile if it doesn't exist
      if (!userProfileExists) {
        try {
          const userProfileTx = await program.methods
            .initializeUserProfile(false) // false = not premium user by default
            .accountsPartial({
              userProfile: userProfilePDA,
              user: publicKey,
              platformConfig: platformConfigPDA,
            })
            .rpc();

          toast.success('User profile created!');
          console.log('User profile transaction:', userProfileTx);
          
          // Wait a moment for the transaction to be confirmed
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (profileError) {
          console.error('Failed to create user profile:', profileError);
          toast.error('Failed to create user profile');
          setIsCreating(false);
          return;
        }
      }

      // Now create the Smart Wallet
      const programHeirs = validHeirs.map(heir => ({
        heirPubkey: new PublicKey(heir.address),
        allocationPercentage: heir.percentage,
      }));

      const [smartWalletPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("smart_wallet"), publicKey.toBuffer()],
        PROGRAM_ID
      );

      const [smartWalletAssetPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("smart_wallet_pda"), publicKey.toBuffer()],
        PROGRAM_ID
      );

      const tx = await program.methods
        .createSmartWalletInheritance(
          programHeirs,
          new anchor.BN(inactivityDays * 24 * 60 * 60)
        )
        .accountsPartial({
          smartWallet: smartWalletPDA,
          smartWalletPda: smartWalletAssetPDA,
          userProfile: userProfilePDA,
          owner: publicKey,
        })
        .rpc();

      toast.success('Smart Wallet created successfully!');
      console.log('Transaction:', tx);
      
      // Reload Smart Wallet data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Failed to create Smart Wallet:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to create Smart Wallet: ' + errorMessage);
    }
    setIsCreating(false);
  };

  const depositToSmartWallet = async () => {
    if (!program || !publicKey || !depositAmount) {
      toast.error('Please enter deposit amount');
      return;
    }

    try {
      const amount = parseFloat(depositAmount);
      if (amount <= 0) {
        toast.error('Invalid deposit amount');
        return;
      }

      const [smartWalletPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("smart_wallet"), publicKey.toBuffer()],
        PROGRAM_ID
      );

      const [smartWalletAssetPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("smart_wallet_pda"), publicKey.toBuffer()],
        PROGRAM_ID
      );

      const tx = await program.methods
        .depositToSmartWallet(new anchor.BN(amount * LAMPORTS_PER_SOL))
        .accountsPartial({
          smartWallet: smartWalletPDA,
          smartWalletPda: smartWalletAssetPDA,
          owner: publicKey,
        })
        .rpc();

      toast.success(`Deposited ${amount} SOL to Smart Wallet`);
      setDepositAmount('');
      
      // Reload balance
      setTimeout(() => {
        const [smartWalletAssetPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("smart_wallet_pda"), publicKey.toBuffer()],
          PROGRAM_ID
        );
        connection.getBalance(smartWalletAssetPDA).then(balance => {
          setSmartWalletBalance(balance / LAMPORTS_PER_SOL);
        });
      }, 2000);
    } catch (error) {
      console.error('Failed to deposit:', error);
      toast.error('Failed to deposit to Smart Wallet');
    }
  };

  const updateActivity = async () => {
    if (!program || !publicKey) {
      toast.error('Wallet not connected');
      return;
    }

    try {
      const [smartWalletPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("smart_wallet"), publicKey.toBuffer()],
        PROGRAM_ID
      );

      const tx = await program.methods
        .updateSmartWalletActivity()
        .accountsPartial({
          smartWallet: smartWalletPDA,
          owner: publicKey,
        })
        .rpc();

      toast.success('Activity updated successfully!');
      
      // Reload Smart Wallet data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Failed to update activity:', error);
      toast.error('Failed to update activity');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading Smart Wallet...</span>
      </div>
    );
  }

  if (!smartWallet) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">
          <div className="text-center mb-8">
            <WalletIcon className="w-16 h-16 mx-auto mb-4 text-blue-400" />
            <h2 className="text-3xl font-bold text-white mb-2">Create Smart Wallet</h2>
            <p className="text-gray-300">Set up automated inheritance for your digital assets</p>
          </div>

          <div className="space-y-6">
            {/* Inactivity Period */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Inactivity Period (Days)
              </label>
              <input
                type="number"
                min="1"
                value={inactivityDays}
                onChange={(e) => setInactivityDays(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="365"
              />
              <p className="text-xs text-gray-400 mt-1">
                Assets will be inherited after {inactivityDays} days of inactivity
              </p>
            </div>

            {/* Heirs */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Users className="w-4 h-4 inline mr-2" />
                Heirs ({heirs.length}/10)
              </label>
              
              {heirs.map((heir, index) => (
                <div key={index} className="flex gap-3 mb-3">
                  <input
                    type="text"
                    value={heir.address}
                    onChange={(e) => updateHeir(index, 'address', e.target.value)}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Heir wallet address"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={heir.percentage}
                    onChange={(e) => updateHeir(index, 'percentage', parseInt(e.target.value) || 0)}
                    className="w-20 px-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="flex items-center text-gray-400">%</span>
                  {heirs.length > 1 && (
                    <button
                      onClick={() => removeHeir(index)}
                      className="p-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}

              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={addHeir}
                  disabled={heirs.length >= 10}
                  className="flex items-center gap-2 text-blue-400 hover:text-blue-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  Add Heir
                </button>
                <span className={`text-sm ${getTotalPercentage() === 100 ? 'text-green-400' : 'text-red-400'}`}>
                  Total: {getTotalPercentage()}%
                </span>
              </div>
            </div>

            <button
              onClick={createSmartWallet}
              disabled={isCreating || getTotalPercentage() !== 100}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isCreating ? (
                <><RefreshCw className="w-5 h-5 inline mr-2 animate-spin" />Creating...</>
              ) : (
                <><Shield className="w-5 h-5 inline mr-2" />Create Smart Wallet</>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Smart Wallet Overview */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Smart Wallet Active</h2>
            <p className="text-gray-300">Automated inheritance system is configured</p>
          </div>
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle2 className="w-6 h-6" />
            <span className="font-semibold">Active</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <WalletIcon className="w-5 h-5 text-blue-400" />
              <span className="text-gray-300">Balance</span>
            </div>
            <p className="text-2xl font-bold text-white">{smartWalletBalance.toFixed(4)} SOL</p>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-purple-400" />
              <span className="text-gray-300">Heirs</span>
            </div>
            <p className="text-2xl font-bold text-white">{smartWallet.heirs.length}</p>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-orange-400" />
              <span className="text-gray-300">Inactivity Period</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {Math.round(smartWallet.inactivityPeriodSeconds / (24 * 60 * 60))} days
            </p>
          </div>
        </div>
      </div>

      {/* Heirs List */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">
        <h3 className="text-xl font-bold text-white mb-4">Inheritance Configuration</h3>
        <div className="space-y-3">
          {smartWallet.heirs.map((heir, index) => (
            <div key={index} className="flex justify-between items-center bg-white/5 rounded-lg p-4">
              <div>
                <span className="text-gray-300">Heir {index + 1}</span>
                <p className="text-white font-mono text-sm">{heir.heirPubkey.toString()}</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-white">{heir.allocationPercentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Deposit */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Deposit SOL</h3>
          <div className="space-y-4">
            <input
              type="number"
              step="0.001"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Amount in SOL"
            />
            <button
              onClick={depositToSmartWallet}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200"
            >
              <Send className="w-5 h-5 inline mr-2" />
              Deposit
            </button>
          </div>
        </div>

        {/* Update Activity */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Update Activity</h3>
          <p className="text-gray-300 text-sm mb-4">
            Reset your inactivity timer to prevent inheritance execution
          </p>
          <button
            onClick={updateActivity}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
          >
            <RefreshCw className="w-5 h-5 inline mr-2" />
            Update Activity
          </button>
        </div>
      </div>

      {/* Status Info */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-yellow-300 font-semibold mb-2">Important Information</h4>
            <ul className="text-yellow-200 text-sm space-y-1">
              <li>• Your Smart Wallet is active and monitoring your activity</li>
              <li>• Assets will be automatically distributed to heirs after {Math.round(smartWallet.inactivityPeriodSeconds / (24 * 60 * 60))} days of inactivity</li>
              <li>• Update your activity regularly to prevent early inheritance execution</li>
              <li>• Last activity: {new Date(smartWallet.lastActiveTime * 1000).toLocaleString()}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}