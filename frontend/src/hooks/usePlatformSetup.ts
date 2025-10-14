import { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { toast } from 'react-hot-toast';
import { useWalletConnection } from './useWalletConnection';

interface PlatformState {
  isInitialized: boolean;
  hasUserProfile: boolean;
  isPlatformAdmin: boolean;
  loading: boolean;
  error: string | null;
}

export function usePlatformSetup() {
  const {
    publicKey,
    connected,
    program,
    connection,
    programId,
    executeTransaction
  } = useWalletConnection();

  const [state, setState] = useState<PlatformState>({
    isInitialized: false,
    hasUserProfile: false,
    isPlatformAdmin: false,
    loading: true,
    error: null,
  });

  const [isInitializing, setIsInitializing] = useState(false);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);

  // Check platform and user status
  const checkPlatformStatus = async () => {
    if (!program || !publicKey || !connected) {
      setState((prev: PlatformState) => ({ ...prev, loading: false }));
      return;
    }

    setState((prev: PlatformState) => ({ ...prev, loading: true, error: null }));

    try {
      const [platformConfigPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("platform_config")],
        programId
      );

      const [userProfilePDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("user_profile"), publicKey.toBuffer()],
        programId
      );

      // Check platform initialization
      let isInitialized = false;
      let isPlatformAdmin = false;
      try {
        const platformAccount = await connection.getAccountInfo(platformConfigPDA);
        if (platformAccount && platformAccount.data.length > 0) {
          isInitialized = true;
          
          // Try to fetch platform config to check admin status
          try {
            const platformConfig = await program.account.platformConfig.fetch(platformConfigPDA);
            isPlatformAdmin = (platformConfig as any).admin?.equals(publicKey) || false;
          } catch (adminError) {
            console.log('Could not determine admin status:', adminError);
          }
        }
      } catch (platformError) {
        console.log('Platform not initialized:', platformError);
      }

      // Check user profile
      let hasUserProfile = false;
      try {
        const userProfileAccount = await connection.getAccountInfo(userProfilePDA);
        hasUserProfile = !!(userProfileAccount && userProfileAccount.data.length > 0);
      } catch (profileError) {
        console.log('No user profile found:', profileError);
      }

      setState({
        isInitialized,
        hasUserProfile,
        isPlatformAdmin,
        loading: false,
        error: null,
      });

      // console.log('Platform Status:', {
      //   isInitialized,
      //   hasUserProfile,
      //   isPlatformAdmin,
      //   wallet: publicKey.toString(),
      // });

    } catch (error: any) {
      console.error('Failed to check platform status:', error);
      setState((prev: PlatformState) => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to check platform status',
      }));
    }
  };

  // Initialize platform
  const initializePlatform = async () => {
    if (!program || !publicKey || !connected) {
      toast.error('Wallet not connected');
      return false;
    }

    setIsInitializing(true);

    try {
      await executeTransaction(async () => {
        const [platformConfigPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("platform_config")],
          programId
        );

        const [treasuryPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("treasury")],
          programId
        );

        return await program.methods
          .initialize()
          .accountsPartial({
            platformConfig: platformConfigPDA,
            treasury: treasuryPDA,
            admin: publicKey,
          })
          .rpc({
            commitment: 'confirmed',
            preflightCommitment: 'confirmed',
            skipPreflight: false,
            maxRetries: 5,
          });
      }, {
        description: 'Platform initialization',
        maxRetries: 5,
      });

      toast.success('Platform initialized successfully!');
      
      // Refresh status after successful initialization
      setTimeout(() => {
        checkPlatformStatus();
      }, 2000);

      return true;

    } catch (error: any) {
      console.error('Platform initialization failed:', error);
      
      // Handle specific errors
      if (error.message?.includes('already in use') || error.message?.includes('0x0')) {
        toast.success('Platform already initialized!');
        checkPlatformStatus();
        return true;
      } else {
        toast.error(`Failed to initialize platform: ${error.message}`);
        return false;
      }
    } finally {
      setIsInitializing(false);
    }
  };

  // Create user profile
  const createUserProfile = async (isPremium: boolean = false) => {
    if (!program || !publicKey || !connected) {
      toast.error('Wallet not connected');
      return false;
    }

    if (!state.isInitialized) {
      toast.error('Platform must be initialized first');
      return false;
    }

    setIsCreatingProfile(true);

    try {
      await executeTransaction(async () => {
        const [userProfilePDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("user_profile"), publicKey.toBuffer()],
          programId
        );

        const [platformConfigPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("platform_config")],
          programId
        );

        return await program.methods
          .initializeUserProfile(isPremium)
          .accountsPartial({
            userProfile: userProfilePDA,
            user: publicKey,
            platformConfig: platformConfigPDA,
          })
          .rpc({
            commitment: 'confirmed',
            preflightCommitment: 'confirmed',
            skipPreflight: false,
            maxRetries: 5,
          });
      }, {
        description: 'User profile creation',
        maxRetries: 5,
      });

      toast.success('User profile created successfully!');
      
      // Refresh status after successful creation
      setTimeout(() => {
        checkPlatformStatus();
      }, 2000);

      return true;

    } catch (error: any) {
      console.error('User profile creation failed:', error);
      
      // Handle specific errors
      if (error.message?.includes('already in use') || error.message?.includes('0x0')) {
        toast.success('User profile already exists!');
        checkPlatformStatus();
        return true;
      } else {
        toast.error(`Failed to create user profile: ${error.message}`);
        return false;
      }
    } finally {
      setIsCreatingProfile(false);
    }
  };

  // Auto-check status when wallet connects or program changes
  useEffect(() => {
    if (program && publicKey && connected) {
      checkPlatformStatus();
    } else {
      setState({
        isInitialized: false,
        hasUserProfile: false,
        isPlatformAdmin: false,
        loading: false,
        error: null,
      });
    }
  }, [program, publicKey, connected]);

  return {
    // State
    ...state,
    isInitializing,
    isCreatingProfile,

    // Actions
    initializePlatform,
    createUserProfile,
    checkPlatformStatus,
    refreshStatus: checkPlatformStatus,

    // Computed values
    isReady: state.isInitialized && state.hasUserProfile,
    needsPlatformInit: !state.isInitialized,
    needsUserProfile: state.isInitialized && !state.hasUserProfile,
  };
}