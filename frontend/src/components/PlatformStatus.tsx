import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { toast } from 'react-hot-toast';
import { Settings, Shield, AlertTriangle, CheckCircle2, Loader } from 'lucide-react';

// Import the IDL and types
import { Gada } from '../lib/types/gada';
import IDL from '../lib/idl/gada.json';

const PROGRAM_ID = new PublicKey("EciS2vNDTe5S6WnNWEBmdBmKjQL5bsXyfauYmxPFKQGu");

interface PlatformStatus {
  isInitialized: boolean;
  hasUserProfile: boolean;
  isPlatformAdmin: boolean;
  loading: boolean;
}

export default function PlatformStatus() {
  const { publicKey, wallet } = useWallet();
  const [connection] = useState(() => new Connection('https://api.devnet.solana.com', 'confirmed'));
  const [program, setProgram] = useState<Program<Gada> | null>(null);
  const [status, setStatus] = useState<PlatformStatus>({
    isInitialized: false,
    hasUserProfile: false,
    isPlatformAdmin: false,
    loading: true
  });
  const [isInitializing, setIsInitializing] = useState(false);

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

  // Check platform status
  useEffect(() => {
    if (!program || !publicKey) return;

    const checkStatus = async () => {
      setStatus(prev => ({ ...prev, loading: true }));
      
      try {
        // Check platform initialization
        const [platformConfigPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("platform_config")],
          PROGRAM_ID
        );

        let isInitialized = false;
        let isPlatformAdmin = false;
        
        try {
          const config = await program.account.platformConfig.fetch(platformConfigPDA);
          isInitialized = true;
          isPlatformAdmin = config.admin.equals(publicKey);
        } catch (error) {
          console.log('Platform not initialized');
        }

        // Check user profile
        const [userProfilePDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("user_profile"), publicKey.toBuffer()],
          PROGRAM_ID
        );

        let hasUserProfile = false;
        try {
          await program.account.userProfile.fetch(userProfilePDA);
          hasUserProfile = true;
        } catch (error) {
          console.log('User profile not found');
        }

        setStatus({
          isInitialized,
          hasUserProfile,
          isPlatformAdmin,
          loading: false
        });
      } catch (error) {
        console.error('Failed to check platform status:', error);
        setStatus(prev => ({ ...prev, loading: false }));
      }
    };

    checkStatus();
  }, [program, publicKey]);

  const initializePlatform = async () => {
    if (!program || !publicKey) {
      toast.error('Wallet not connected');
      return;
    }

    setIsInitializing(true);
    try {
      const [platformConfigPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("platform_config")],
        PROGRAM_ID
      );

      const [treasuryPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("treasury")],
        PROGRAM_ID
      );

      const tx = await program.methods
        .initialize()
        .accountsPartial({
          platformConfig: platformConfigPDA,
          treasury: treasuryPDA,
          admin: publicKey,
        })
        .rpc();

      toast.success('Platform initialized successfully!');
      console.log('Platform initialization transaction:', tx);
      
      // Refresh status
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Failed to initialize platform:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to initialize platform: ' + errorMessage);
    }
    setIsInitializing(false);
  };

  const createUserProfile = async () => {
    if (!program || !publicKey) {
      toast.error('Wallet not connected');
      return;
    }

    if (!status.isInitialized) {
      toast.error('Platform must be initialized first');
      return;
    }

    try {
      const [userProfilePDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("user_profile"), publicKey.toBuffer()],
        PROGRAM_ID
      );

      const [platformConfigPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("platform_config")],
        PROGRAM_ID
      );

      const tx = await program.methods
        .initializeUserProfile(false) // false = not premium user by default
        .accountsPartial({
          userProfile: userProfilePDA,
          user: publicKey,
          platformConfig: platformConfigPDA,
        })
        .rpc();

      toast.success('User profile created successfully!');
      console.log('User profile transaction:', tx);
      
      // Refresh status
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Failed to create user profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to create user profile: ' + errorMessage);
    }
  };

  if (!publicKey) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 text-center">
          <Settings className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold text-white mb-2">Platform Status</h2>
          <p className="text-gray-300">Please connect your wallet to check platform status</p>
        </div>
      </div>
    );
  }

  if (status.loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 text-center">
          <Loader className="w-8 h-8 mx-auto mb-4 text-blue-400 animate-spin" />
          <h2 className="text-2xl font-bold text-white mb-2">Checking Platform Status</h2>
          <p className="text-gray-300">Please wait while we check the platform status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Platform Status Card */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-8 h-8 text-blue-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Platform Status</h2>
            <p className="text-gray-300">Current state of the Gada Wallet platform</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Platform Initialization Status */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-3">
              {status.isInitialized ? (
                <CheckCircle2 className="w-6 h-6 text-green-400" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-red-400" />
              )}
              <div>
                <h3 className="text-white font-semibold">Platform Initialization</h3>
                <p className="text-gray-400 text-sm">Core platform configuration and treasury</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              status.isInitialized 
                ? 'bg-green-500/20 text-green-300' 
                : 'bg-red-500/20 text-red-300'
            }`}>
              {status.isInitialized ? 'Initialized' : 'Not Initialized'}
            </span>
          </div>

          {/* User Profile Status */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-3">
              {status.hasUserProfile ? (
                <CheckCircle2 className="w-6 h-6 text-green-400" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
              )}
              <div>
                <h3 className="text-white font-semibold">User Profile</h3>
                <p className="text-gray-400 text-sm">Your account profile for Smart Wallet features</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              status.hasUserProfile 
                ? 'bg-green-500/20 text-green-300' 
                : 'bg-yellow-500/20 text-yellow-300'
            }`}>
              {status.hasUserProfile ? 'Created' : 'Not Created'}
            </span>
          </div>

          {/* Admin Status */}
          {status.isPlatformAdmin && (
            <div className="flex items-center justify-between p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-purple-400" />
                <div>
                  <h3 className="text-white font-semibold">Platform Administrator</h3>
                  <p className="text-gray-400 text-sm">You have admin privileges on this platform</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-500/20 text-purple-300">
                Admin
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Actions Card */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">
        <h3 className="text-xl font-bold text-white mb-4">Required Actions</h3>
        
        <div className="space-y-4">
          {!status.isInitialized && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-red-300 font-semibold mb-2">Platform Not Initialized</h4>
                  <p className="text-red-200 text-sm mb-4">
                    The platform needs to be initialized before Smart Wallets can be created. 
                    This sets up the core configuration and treasury system.
                  </p>
                  <button
                    onClick={initializePlatform}
                    disabled={isInitializing}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isInitializing ? (
                      <><Loader className="w-4 h-4 inline mr-2 animate-spin" />Initializing...</>
                    ) : (
                      <>Initialize Platform</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {status.isInitialized && !status.hasUserProfile && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-yellow-300 font-semibold mb-2">User Profile Required</h4>
                  <p className="text-yellow-200 text-sm mb-4">
                    You need to create a user profile before you can create Smart Wallets. 
                    This will be created as a free user account.
                  </p>
                  <button
                    onClick={createUserProfile}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Create User Profile
                  </button>
                </div>
              </div>
            </div>
          )}

          {status.isInitialized && status.hasUserProfile && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-green-300 font-semibold mb-2">Ready to Use</h4>
                  <p className="text-green-200 text-sm">
                    Your account is fully set up! You can now create Smart Wallets and use all platform features.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Information Card */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-blue-300 font-semibold mb-2">About Platform Setup</h4>
            <ul className="text-blue-200 text-sm space-y-1">
              <li>• Platform initialization is a one-time setup that creates the core configuration</li>
              <li>• User profiles are required for Smart Wallet creation and inheritance features</li>
              <li>• All transactions are performed on Solana devnet for testing</li>
              <li>• Your wallet will be used to sign and pay for initialization transactions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}