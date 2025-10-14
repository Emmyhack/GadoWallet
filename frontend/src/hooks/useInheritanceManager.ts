import { useState } from 'react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { toast } from 'react-hot-toast';
import { useWalletConnection } from './useWalletConnection';
import { usePlatformSetup } from './usePlatformSetup';

export interface HeirData {
  address: string;
  amount: string;
  tokenMint?: string;
  inactivityDays: string;
  email?: string;
  name?: string;
  personalMessage?: string;
}

export function useInheritanceManager() {
  const { 
    publicKey, 
    connected, 
    program, 
    programId, 
    executeTransaction 
  } = useWalletConnection();
  
  const { isReady } = usePlatformSetup();
  
  const [isLoading, setIsLoading] = useState(false);

  // Validate heir data
  const validateHeirData = (data: HeirData, type: 'sol' | 'token'): string | null => {
    if (!data.address.trim()) {
      return 'Please enter a valid heir wallet address.';
    }

    try {
      const heirPubkey = new PublicKey(data.address);
      if (publicKey && heirPubkey.equals(publicKey)) {
        return 'Heir address cannot be the same as your wallet address.';
      }
    } catch {
      return 'Invalid heir wallet address format.';
    }

    if (!data.amount.trim() || parseFloat(data.amount) <= 0) {
      return 'Please enter a valid amount greater than 0.';
    }

    if (!data.inactivityDays.trim() || parseFloat(data.inactivityDays) <= 0) {
      return 'Please enter a valid inactivity period in days.';
    }

    if (type === 'token') {
      if (!data.tokenMint?.trim()) {
        return 'Please enter a valid token mint address.';
      }
      try {
        new PublicKey(data.tokenMint);
      } catch {
        return 'Invalid token mint address format.';
      }
    }

    return null;
  };

  // Add SOL heir
  const addSolHeir = async (heirData: HeirData) => {
    if (!program || !publicKey || !connected) {
      toast.error('Wallet not connected');
      return false;
    }

    if (!isReady) {
      toast.error('Platform setup required. Please complete setup first.');
      return false;
    }

    const validationError = validateHeirData(heirData, 'sol');
    if (validationError) {
      toast.error(validationError);
      return false;
    }

    setIsLoading(true);

    try {
      const heirPubkey = new PublicKey(heirData.address);
      const amountBN = new BN(Math.floor(parseFloat(heirData.amount) * 1e9)); // Convert SOL to lamports
      const daysFloat = parseFloat(heirData.inactivityDays);
      const inactivitySeconds = Math.max(86400, Math.floor(daysFloat * 24 * 60 * 60)); // Minimum 1 day

      await executeTransaction(async () => {
        // Get required PDAs
        const [solHeirPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from('sol_heir'), publicKey.toBuffer(), heirPubkey.toBuffer()],
          programId
        );

        const [userProfilePDA] = PublicKey.findProgramAddressSync(
          [Buffer.from('user_profile'), publicKey.toBuffer()],
          programId
        );

        // Verify user profile exists
        const userProfileAccount = await program.provider.connection.getAccountInfo(userProfilePDA);
        if (!userProfileAccount) {
          throw new Error('User profile not found. Please create a user profile first.');
        }

        console.log('✅ Adding SOL heir:', {
          solHeir: solHeirPDA.toString(),
          userProfile: userProfilePDA.toString(),
          owner: publicKey.toString(),
          heir: heirPubkey.toString(),
          amount: `${amountBN.toString()} lamports (${parseFloat(heirData.amount)} SOL)`,
          inactivity: `${inactivitySeconds}s (${daysFloat} days)`,
        });

        return await program.methods
          .addSolHeir(amountBN, new BN(inactivitySeconds))
          .accountsPartial({
            solHeir: solHeirPDA,
            userProfile: userProfilePDA,
            owner: publicKey,
            heir: heirPubkey,
            systemProgram: SystemProgram.programId,
          })
          .rpc({
            commitment: 'confirmed',
            preflightCommitment: 'confirmed',
            skipPreflight: false,
            maxRetries: 5,
          });
      }, {
        description: 'SOL heir addition',
        maxRetries: 5,
      });

      toast.success(`✅ SOL heir added successfully! Amount: ${heirData.amount} SOL, Inactivity: ${daysFloat} days`);
      return true;

    } catch (error: any) {
      console.error('Failed to add SOL heir:', error);
      
      if (error.message?.includes('already in use') || error.message?.includes('0x0')) {
        toast.error('An heir with these details already exists.');
      } else if (error.message?.includes('insufficient funds')) {
        toast.error('Insufficient funds to complete this transaction.');
      } else if (error.message?.includes('user_profile') || error.message?.includes('AccountNotInitialized')) {
        toast.error('User profile required. Please create your profile first.');
      } else {
        toast.error(`Failed to add SOL heir: ${error.message}`);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Add Token heir
  const addTokenHeir = async (heirData: HeirData) => {
    if (!program || !publicKey || !connected) {
      toast.error('Wallet not connected');
      return false;
    }

    if (!isReady) {
      toast.error('Platform setup required. Please complete setup first.');
      return false;
    }

    const validationError = validateHeirData(heirData, 'token');
    if (validationError) {
      toast.error(validationError);
      return false;
    }

    if (!heirData.tokenMint) {
      toast.error('Token mint address required');
      return false;
    }

    setIsLoading(true);

    try {
      const heirPubkey = new PublicKey(heirData.address);
      const tokenMintPubkey = new PublicKey(heirData.tokenMint);
      const amountBN = new BN(Math.floor(parseFloat(heirData.amount))); // Keep tokens as whole numbers
      const daysFloat = parseFloat(heirData.inactivityDays);
      const inactivitySeconds = Math.max(86400, Math.floor(daysFloat * 24 * 60 * 60)); // Minimum 1 day

      await executeTransaction(async () => {
        // Get required PDAs
        const [tokenHeirPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from('token_heir'), publicKey.toBuffer(), heirPubkey.toBuffer(), tokenMintPubkey.toBuffer()],
          programId
        );

        const [userProfilePDA] = PublicKey.findProgramAddressSync(
          [Buffer.from('user_profile'), publicKey.toBuffer()],
          programId
        );

        // Verify user profile exists
        const userProfileAccount = await program.provider.connection.getAccountInfo(userProfilePDA);
        if (!userProfileAccount) {
          throw new Error('User profile not found. Please create a user profile first.');
        }

        console.log('✅ Adding token heir:', {
          tokenHeir: tokenHeirPDA.toString(),
          userProfile: userProfilePDA.toString(),
          owner: publicKey.toString(),
          heir: heirPubkey.toString(),
          tokenMint: tokenMintPubkey.toString(),
          amount: `${amountBN.toString()} tokens`,
          inactivity: `${inactivitySeconds}s (${daysFloat} days)`,
        });

        return await program.methods
          .addTokenHeir(amountBN, new BN(inactivitySeconds))
          .accountsPartial({
            tokenHeir: tokenHeirPDA,
            userProfile: userProfilePDA,
            owner: publicKey,
            heir: heirPubkey,
            tokenMint: tokenMintPubkey,
          })
          .rpc({
            commitment: 'confirmed',
            preflightCommitment: 'confirmed',
            skipPreflight: false,
            maxRetries: 5,
          });
      }, {
        description: 'Token heir addition',
        maxRetries: 5,
      });

      toast.success(`✅ Token heir added successfully! Amount: ${heirData.amount} tokens, Inactivity: ${daysFloat} days`);
      return true;

    } catch (error: any) {
      console.error('Failed to add token heir:', error);
      
      if (error.message?.includes('already in use') || error.message?.includes('0x0')) {
        toast.error('An heir with these details already exists.');
      } else if (error.message?.includes('insufficient funds')) {
        toast.error('Insufficient funds to complete this transaction.');
      } else if (error.message?.includes('user_profile') || error.message?.includes('AccountNotInitialized')) {
        toast.error('User profile required. Please create your profile first.');
      } else {
        toast.error(`Failed to add token heir: ${error.message}`);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Check if heir already exists
  const checkHeirExists = async (heirAddress: string, tokenMint?: string) => {
    if (!program || !publicKey || !connected) return false;

    try {
      const heirPubkey = new PublicKey(heirAddress);
      
      if (tokenMint) {
        // Check token heir
        const tokenMintPubkey = new PublicKey(tokenMint);
        const [tokenHeirPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from('token_heir'), publicKey.toBuffer(), heirPubkey.toBuffer(), tokenMintPubkey.toBuffer()],
          programId
        );
        const account = await program.provider.connection.getAccountInfo(tokenHeirPDA);
        return !!(account && account.data.length > 0);
      } else {
        // Check SOL heir
        const [coinHeirPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from('coin_heir'), publicKey.toBuffer(), heirPubkey.toBuffer()],
          programId
        );
        const account = await program.provider.connection.getAccountInfo(coinHeirPDA);
        return !!(account && account.data.length > 0);
      }
    } catch (error) {
      console.error('Error checking heir existence:', error);
      return false;
    }
  };

  return {
    // State
    isLoading,
    isReady,
    connected,
    
    // Actions
    addSolHeir,
    addTokenHeir,
    checkHeirExists,
    
    // Utilities
    validateHeirData,
  };
}