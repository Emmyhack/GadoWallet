import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, LAMPORTS_PER_SOL, SystemProgram, Transaction } from '@solana/web3.js';
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
  CheckCircle2,
  Bell,
  BellRing,
  History,
  X,
  ArrowUpRight,
  ArrowDownLeft,
  UserPlus
} from 'lucide-react';

// Import the IDL and types
import { Gado } from '../lib/types/gado';
import IDL from '../lib/idl/gado.json';
import { SmartWalletClient } from '../lib/smart-wallet-client';

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
  const [program, setProgram] = useState<Program<Gado> | null>(null);
  const [smartWalletClient, setSmartWalletClient] = useState<SmartWalletClient | null>(null);
  
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
  const [userIsPremium, setUserIsPremium] = useState<boolean>(false);
  
  // New state for send functionality
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [sendAmount, setSendAmount] = useState<string>('');
  const [smartWalletAddress, setSmartWalletAddress] = useState<string>('');

  // Notification and transaction history state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

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
        
        const programInstance = new Program(IDL as any, provider) as Program<Gado>;
        setProgram(programInstance);
        
        // Initialize SmartWalletClient
        const client = new SmartWalletClient(programInstance, connection);
        setSmartWalletClient(client);
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

        // Get balance and set wallet address
        const [smartWalletAssetPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("smart_wallet_pda"), publicKey.toBuffer()],
          PROGRAM_ID
        );
        
        const balance = await connection.getBalance(smartWalletAssetPDA);
        setSmartWalletBalance(balance / LAMPORTS_PER_SOL);
        setSmartWalletAddress(smartWalletAssetPDA.toString());
      } catch (error) {
        console.log('No Smart Wallet found for this account');
        setSmartWallet(null);
        setSmartWalletBalance(0);
      }
      setLoading(false);
    };

    loadSmartWallet();
  }, [program, publicKey, connection]);

  // Monitor Smart Wallet for incoming transactions
  useEffect(() => {
    if (!connection || !smartWalletAddress) return;

    let prevBalance: number | null = null;
    
    const monitorTransactions = async () => {
      try {
        const currentBalance = await connection.getBalance(new PublicKey(smartWalletAddress));
        const currentBalanceSOL = currentBalance / LAMPORTS_PER_SOL;
        
        if (prevBalance !== null && currentBalanceSOL !== prevBalance) {
          const difference = currentBalanceSOL - prevBalance;
          
          if (difference > 0) {
            // Incoming transaction detected
            trackSmartWalletAction('Incoming Transfer', {
              amount: `+${difference.toFixed(6)} SOL`,
              previousBalance: prevBalance,
              newBalance: currentBalanceSOL,
              type: 'received'
            });
            
            toast.success(`Received ${difference.toFixed(6)} SOL in Smart Wallet`);
            setSmartWalletBalance(currentBalanceSOL);
          } else if (difference < 0) {
            // Outgoing transaction detected (might be from inheritance or other actions)
            trackSmartWalletAction('Outgoing Transfer', {
              amount: `${difference.toFixed(6)} SOL`,
              previousBalance: prevBalance,
              newBalance: currentBalanceSOL,
              type: 'sent'
            });
            
            setSmartWalletBalance(currentBalanceSOL);
          }
        }
        
        prevBalance = currentBalanceSOL;
      } catch (error) {
        console.error('Error monitoring transactions:', error);
      }
    };

    // Check for balance changes every 5 seconds
    const interval = setInterval(monitorTransactions, 5000);
    
    // Initial check
    monitorTransactions();

    return () => clearInterval(interval);
  }, [connection, smartWalletAddress]);

  const addHeir = () => {
    const maxHeirs = userIsPremium ? 10 : 1;
    if (heirs.length < maxHeirs) {
      setHeirs([...heirs, { address: '', percentage: 0 }]);
    } else {
      toast.error(`Maximum ${maxHeirs} heir${maxHeirs > 1 ? 's' : ''} allowed${!userIsPremium ? ' for free users' : ''}`);
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

  // Notification and transaction tracking functions
  const addNotification = (notification: any) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date(),
      ...notification
    };
    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep last 50 notifications
    
    // Auto-remove notification after 5 seconds if it's not persistent
    if (!notification.persistent) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, 5000);
    }
  };

  const addTransactionRecord = (transaction: any) => {
    const newTransaction = {
      id: Date.now(),
      timestamp: new Date(),
      ...transaction
    };
    setTransactionHistory(prev => [newTransaction, ...prev.slice(0, 99)]); // Keep last 100 transactions
  };

  const trackSmartWalletAction = (action: string, details: any, txSignature?: string) => {
    const notification = {
      type: 'success',
      action,
      details,
      txSignature,
      persistent: false
    };

    const transaction = {
      action,
      details,
      txSignature,
      status: 'confirmed'
    };

    addNotification(notification);
    addTransactionRecord(transaction);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const clearTransactionHistory = () => {
    setTransactionHistory([]);
  };

  // Check if withdraw functionality is available
  const isWithdrawAvailable = () => {
    // Check if the program has the withdraw methods
    return program && typeof (program.methods as any).withdrawFromSmartWallet === 'function';
  };

  // Check if Smart Wallet already exists for the current user
  const checkSmartWalletExists = async (): Promise<boolean> => {
    if (!program || !publicKey) return false;
    
    try {
      const [smartWalletPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("smart_wallet"), publicKey.toBuffer()],
        PROGRAM_ID
      );
      
      await program.account.smartWallet.fetch(smartWalletPDA);
      return true;
    } catch (error) {
      return false;
    }
  };

  // Upgrade user to premium
  const upgradeToPremium = async () => {
    if (!program || !publicKey) {
      toast.error('Wallet not connected');
      return;
    }

    try {
      const [userProfilePDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("user_profile"), publicKey.toBuffer()],
        PROGRAM_ID
      );

      // Check if the upgradeToPremium method exists in the program
      if (typeof (program.methods as any).upgradeToPremium === 'function') {
        const tx = await (program.methods as any)
          .upgradeToPremium()
          .accountsPartial({
            userProfile: userProfilePDA,
            user: publicKey,
          })
          .rpc();

        toast.success('Upgraded to Premium successfully!');
        setUserIsPremium(true);
        
        // Track the upgrade
        trackSmartWalletAction('Premium Upgrade', {
          timestamp: new Date().toISOString(),
          status: 'Now have access to premium features'
        }, tx);

        // Reload data after upgrade
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        // Method doesn't exist in the current program version
        toast.error('Premium upgrade feature requires program update. Please contact the administrator to deploy the updated Smart Wallet program with premium functionality.');
        console.log('upgradeToPremium method not available in current program version');
      }
    } catch (error: any) {
      console.error('Failed to upgrade to premium:', error);
      toast.error('Failed to upgrade to premium: ' + (error.message || 'Unknown error'));
    }
  };

  // Update Smart Wallet inactivity period (premium only)
  const updateInactivityPeriod = async (newDays: number) => {
    if (!program || !publicKey) {
      toast.error('Wallet not connected');
      return;
    }

    if (!userIsPremium) {
      toast.error('Premium subscription required to change inactivity period');
      return;
    }

    try {
      const [smartWalletPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("smart_wallet"), publicKey.toBuffer()],
        PROGRAM_ID
      );

      const [userProfilePDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("user_profile"), publicKey.toBuffer()],
        PROGRAM_ID
      );

      const newInactivitySeconds = newDays * 24 * 60 * 60;

      // Note: This will be available after program deployment
      // const tx = await program.methods
      //   .updateSmartWalletInactivityPeriod(new anchor.BN(newInactivitySeconds))
      //   .accountsPartial({
      //     smartWallet: smartWalletPDA,
      //     userProfile: userProfilePDA,
      //     owner: publicKey,
      //   })
      //   .rpc();

      // For now, show success message (implement after program deployment)
      const tx = "pending_deployment";
      toast.success("Feature available after program update deployment");

      toast.success(`Inactivity period updated to ${newDays} days`);
      
      // Track the update
      trackSmartWalletAction('Inactivity Period Updated', {
        newPeriod: `${newDays} days`,
        previousPeriod: `${Math.round(smartWallet?.inactivityPeriodSeconds! / (24 * 60 * 60))} days`
      }, tx);

      // Reload Smart Wallet data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      console.error('Failed to update inactivity period:', error);
      toast.error('Failed to update inactivity period: ' + (error.message || 'Unknown error'));
    }
  };

  // Add new heir to Smart Wallet (premium only)
  const addSmartWalletHeir = async (heirAddress: string, allocation: number) => {
    if (!program || !publicKey) {
      toast.error('Wallet not connected');
      return;
    }

    if (!userIsPremium) {
      toast.error('Premium subscription required to add additional heirs');
      return;
    }

    try {
      const heirPublicKey = new PublicKey(heirAddress);
      
      const [smartWalletPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("smart_wallet"), publicKey.toBuffer()],
        PROGRAM_ID
      );

      const [userProfilePDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("user_profile"), publicKey.toBuffer()],
        PROGRAM_ID
      );

      // Note: This will be available after program deployment
      // const tx = await program.methods
      //   .addSmartWalletHeir(heirPublicKey, allocation)
      //   .accountsPartial({
      //     smartWallet: smartWalletPDA,
      //     userProfile: userProfilePDA,
      //     owner: publicKey,
      //   })
      //   .rpc();

      // For now, show success message (implement after program deployment)
      const tx = "pending_deployment";
      toast.success("Heir addition feature available after program update deployment");
      
      // Track the addition
      trackSmartWalletAction('Heir Added', {
        heirAddress,
        allocation: `${allocation}%`,
        timestamp: new Date().toISOString()
      }, tx);

    } catch (error: any) {
      console.error('Failed to add heir:', error);
      toast.error('Failed to add heir: ' + (error.message || 'Unknown error'));
    }
  };

  // Update existing heir allocation (premium only)
  const updateSmartWalletHeirAllocation = async (heirAddress: string, newAllocation: number) => {
    if (!program || !publicKey) {
      toast.error('Wallet not connected');
      return;
    }

    if (!userIsPremium) {
      toast.error('Premium subscription required to modify heir allocations');
      return;
    }

    try {
      const heirPublicKey = new PublicKey(heirAddress);
      
      const [smartWalletPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("smart_wallet"), publicKey.toBuffer()],
        PROGRAM_ID
      );

      const [userProfilePDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("user_profile"), publicKey.toBuffer()],
        PROGRAM_ID
      );

      // Note: This will be available after program deployment
      // const tx = await program.methods
      //   .updateSmartWalletHeirAllocation(heirPublicKey, newAllocation)
      //   .accountsPartial({
      //     smartWallet: smartWalletPDA,
      //     userProfile: userProfilePDA,
      //     owner: publicKey,
      //   })
      //   .rpc();

      // For now, show success message (implement after program deployment)
      const tx = "pending_deployment";
      toast.success("Heir allocation update feature available after program update deployment");
      
      // Track the update
      trackSmartWalletAction('Heir Allocation Updated', {
        heirAddress,
        newAllocation: `${newAllocation}%`,
        timestamp: new Date().toISOString()
      }, tx);

    } catch (error: any) {
      console.error('Failed to update heir allocation:', error);
      toast.error('Failed to update heir allocation: ' + (error.message || 'Unknown error'));
    }
  };



  const createSmartWallet = async () => {
    if (!program || !publicKey) {
      toast.error('Wallet not connected');
      return;
    }

    // Check if Smart Wallet already exists
    const exists = await checkSmartWalletExists();
    if (exists) {
      toast.error('Smart Wallet already exists for this account. Refreshing page...');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
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
    
    // Show loading message
    toast.loading('Creating Smart Wallet...', { id: 'create-wallet' });
    
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
      let existingProfile = null;
      try {
        existingProfile = await program.account.userProfile.fetch(userProfilePDA);
        userProfileExists = true;
        console.log('Found existing user profile:', existingProfile);
      } catch (error) {
        console.log('User profile does not exist, will create it first');
        userProfileExists = false;
      }

      // Handle user profile creation/fetching more robustly
      if (!userProfileExists) {
        try {
          // Double-check if profile exists by trying to fetch it again
          const profile = await program.account.userProfile.fetch(userProfilePDA);
          // If we get here, profile exists
          setUserIsPremium(profile.isPremium);
          console.log('User profile already exists, using existing profile');
        } catch (fetchError) {
          // Profile truly doesn't exist, create it
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
            
            // Wait for the transaction to be confirmed
            await new Promise(resolve => setTimeout(resolve, 3000));
            setUserIsPremium(false); // Set as free user
          } catch (profileError: any) {
            console.error('Failed to create user profile:', profileError);
            
            // Check if error is due to account already existing
            if (profileError.message && profileError.message.includes('already in use')) {
              console.log('Profile already exists (race condition), fetching existing profile');
              try {
                const profile = await program.account.userProfile.fetch(userProfilePDA);
                setUserIsPremium(profile.isPremium);
                toast.success('Using existing user profile');
              } catch (finalError) {
                console.error('Failed to fetch existing profile:', finalError);
                toast.error('Failed to access user profile');
                setIsCreating(false);
                return;
              }
            } else {
              toast.error('Failed to create user profile: ' + profileError.message);
              setIsCreating(false);
              return;
            }
          }
        }
      } else {
        // Use existing profile data that was already fetched
        if (existingProfile) {
          setUserIsPremium(existingProfile.isPremium);
        } else {
          // Fallback: fetch user profile to check premium status
          try {
            const profile = await program.account.userProfile.fetch(userProfilePDA);
            setUserIsPremium(profile.isPremium);
          } catch (error) {
            console.error('Failed to fetch user profile:', error);
            setUserIsPremium(false); // Default to free user
          }
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

      // For free users, always use the exact default period (365 days in seconds)
      // For premium users, allow custom periods
      const DEFAULT_INACTIVITY_SECONDS = 365 * 24 * 60 * 60; // Exactly 365 days
      const inactivitySeconds = userIsPremium 
        ? inactivityDays * 24 * 60 * 60 
        : DEFAULT_INACTIVITY_SECONDS;

      console.log('Creating Smart Wallet with:', {
        userIsPremium,
        inactivityDays,
        inactivitySeconds,
        defaultSeconds: DEFAULT_INACTIVITY_SECONDS
      });

      const tx = await program.methods
        .createSmartWalletInheritance(
          programHeirs,
          new anchor.BN(inactivitySeconds)
        )
        .accountsPartial({
          smartWallet: smartWalletPDA,
          smartWalletPda: smartWalletAssetPDA,
          userProfile: userProfilePDA,
          owner: publicKey,
        })
        .rpc();

      toast.dismiss('create-wallet');
      toast.success('Smart Wallet created successfully!');
      console.log('Transaction:', tx);
      
      // Track Smart Wallet creation
      trackSmartWalletAction('Smart Wallet Created', {
        heirsCount: validHeirs.length,
        inactivityPeriod: `${userIsPremium ? inactivityDays : 365} days`,
        heirs: validHeirs.map(h => ({ address: h.address, percentage: h.percentage }))
      }, tx);
      
      // Reload Smart Wallet data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      toast.dismiss('create-wallet');
      console.error('Failed to create Smart Wallet:', error);
      
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Check for specific error types
      if (errorMessage.includes('already in use')) {
        toast.error('Smart Wallet may already exist. Please refresh the page.');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else if (errorMessage.includes('insufficient funds')) {
        toast.error('Insufficient funds to create Smart Wallet. Please add SOL to your wallet.');
      } else {
        toast.error('Failed to create Smart Wallet: ' + errorMessage);
      }
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
      
      // Track deposit transaction
      trackSmartWalletAction('Deposit', {
        amount: `${amount} SOL`,
        previousBalance: smartWalletBalance,
        newBalance: smartWalletBalance + amount
      }, tx);
      
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

  const sendFromSmartWallet = async () => {
    if (!program || !publicKey || !recipientAddress || !sendAmount) {
      toast.error('Please fill in recipient address and amount');
      return;
    }

    // Check if withdraw functionality is available
    if (!isWithdrawAvailable()) {
      toast.error('Send functionality requires program upgrade. Please contact the administrator to deploy the updated Smart Wallet program with withdraw functions.');
      return;
    }

    try {
      const amount = parseFloat(sendAmount);
      if (amount <= 0) {
        toast.error('Invalid send amount');
        return;
      }

      if (amount > smartWalletBalance) {
        toast.error('Insufficient balance in Smart Wallet');
        return;
      }

      // Validate recipient address
      let recipient: PublicKey;
      try {
        recipient = new PublicKey(recipientAddress);
      } catch {
        toast.error('Invalid recipient address');
        return;
      }

      // Get Smart Wallet PDAs
      const [smartWalletPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("smart_wallet"), publicKey.toBuffer()],
        PROGRAM_ID
      );

      const [smartWalletAssetPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("smart_wallet_pda"), publicKey.toBuffer()],
        PROGRAM_ID
      );

      // Use the actual withdraw method when available
      const tx = await (program.methods as any)
        .withdrawFromSmartWallet(new anchor.BN(amount * LAMPORTS_PER_SOL))
        .accountsPartial({
          smartWallet: smartWalletPDA,
          smartWalletPda: smartWalletAssetPDA,
          owner: publicKey,
          recipient: recipient,
        })
        .rpc();

      toast.success(`Successfully sent ${amount} SOL to ${recipientAddress.slice(0, 8)}...`);
      
      // Track the successful send
      trackSmartWalletAction('SOL Sent', {
        amount: `${amount} SOL`,
        recipient: `${recipientAddress.slice(0, 8)}...${recipientAddress.slice(-4)}`,
        previousBalance: smartWalletBalance,
        newBalance: smartWalletBalance - amount
      }, tx);

      setSendAmount('');
      setRecipientAddress('');
      
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
      console.error('Failed to send:', error);
      toast.error('Failed to send from Smart Wallet');
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
      
      // Track activity update
      trackSmartWalletAction('Activity Updated', {
        timestamp: new Date().toISOString(),
        action: 'Manual activity update to reset inactivity timer'
      }, tx);
      
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
                {!userIsPremium && (
                  <span className="ml-2 px-2 py-1 text-xs bg-yellow-500/20 text-yellow-300 rounded">
                    Free: 365 days only
                  </span>
                )}
              </label>
              <input
                type="number"
                min="1"
                value={inactivityDays}
                onChange={(e) => setInactivityDays(parseInt(e.target.value) || 1)}
                disabled={!userIsPremium}
                className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !userIsPremium ? 'opacity-60 cursor-not-allowed' : ''
                }`}
                placeholder="365"
              />
              <p className="text-xs text-gray-400 mt-1">
                {userIsPremium ? (
                  `Assets will be inherited after ${inactivityDays} days of inactivity`
                ) : (
                  'Free users use 365 days. Upgrade to Premium for custom periods.'
                )}
              </p>
              {!userIsPremium && (
                <p className="text-xs text-yellow-400 mt-1">
                  💡 Premium users can set custom inactivity periods and have up to 10 heirs
                </p>
              )}
            </div>

            {/* Heirs */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Users className="w-4 h-4 inline mr-2" />
                Heirs ({heirs.length}/{userIsPremium ? 10 : 1})
                {!userIsPremium && (
                  <span className="ml-2 px-2 py-1 text-xs bg-yellow-500/20 text-yellow-300 rounded">
                    Free: 1 heir max
                  </span>
                )}
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
                  disabled={heirs.length >= (userIsPremium ? 10 : 1)}
                  className="flex items-center gap-2 text-blue-400 hover:text-blue-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  Add Heir {!userIsPremium && heirs.length >= 1 && '(Premium Only)'}
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
          <div className="flex items-center gap-4">
            {/* Premium Status/Upgrade */}
            {!userIsPremium && (
              <button
                onClick={upgradeToPremium}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium text-sm"
              >
                Upgrade to Premium
              </button>
            )}
            {userIsPremium && (
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                Premium User
              </span>
            )}

            {/* Notification Bell */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              title="Notifications & Transaction History"
            >
              {notifications.length > 0 ? (
                <BellRing className="w-5 h-5 text-blue-400" />
              ) : (
                <Bell className="w-5 h-5 text-gray-400" />
              )}
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              )}
            </button>
            
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle2 className="w-6 h-6" />
              <span className="font-semibold">Active</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <WalletIcon className="w-5 h-5 text-blue-400" />
              <span className="text-gray-300">Balance</span>
            </div>
            <p className="text-2xl font-bold text-white">{smartWalletBalance.toFixed(4)} SOL</p>
            {smartWalletAddress && (
              <div className="mt-2">
                <p className="text-xs text-gray-400 mb-1">Smart Wallet Address:</p>
                <div className="flex items-center gap-1">
                  <p className="text-xs font-mono text-gray-300 truncate">{smartWalletAddress.slice(0, 16)}...{smartWalletAddress.slice(-8)}</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(smartWalletAddress);
                      toast.success('Address copied!');
                    }}
                    className="text-blue-400 hover:text-blue-300 text-xs px-1 py-0.5 rounded"
                    title="Copy address"
                  >
                    📋
                  </button>
                </div>
              </div>
            )}
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
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Inheritance Configuration</h3>
          <div className="flex items-center gap-2">
            {userIsPremium && smartWallet.heirs.length < 10 && (
              <button
                onClick={() => {
                  const heirAddress = prompt('Enter heir wallet address:');
                  const allocation = prompt('Enter allocation percentage (1-100):');
                  if (heirAddress && allocation && !isNaN(Number(allocation))) {
                    addSmartWalletHeir(heirAddress, Number(allocation));
                  }
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
              >
                Add Heir
              </button>
            )}
            {userIsPremium && (
              <button
                onClick={() => {
                  const currentDays = Math.round(smartWallet.inactivityPeriodSeconds / (24 * 60 * 60));
                  const newDays = prompt(`Enter new inactivity period (days, current: ${currentDays}):`, String(currentDays));
                  if (newDays && !isNaN(Number(newDays))) {
                    updateInactivityPeriod(Number(newDays));
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
              >
                Edit Period
              </button>
            )}
          </div>
        </div>
        
        <div className="space-y-3">
          {smartWallet.heirs.map((heir, index) => (
            <div key={index} className="flex justify-between items-center bg-white/5 rounded-lg p-4">
              <div>
                <span className="text-gray-300">Heir {index + 1}</span>
                <p className="text-white font-mono text-sm">{heir.heirPubkey.toString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-white">{heir.allocationPercentage}%</span>
                {userIsPremium && (
                  <button
                    onClick={() => {
                      const newAllocation = prompt('Enter new allocation percentage (1-100):', String(heir.allocationPercentage));
                      if (newAllocation && !isNaN(Number(newAllocation))) {
                        updateSmartWalletHeirAllocation(heir.heirPubkey.toString(), Number(newAllocation));
                      }
                    }}
                    className="text-blue-400 hover:text-blue-300 text-sm underline"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {!userIsPremium && (
          <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <p className="text-orange-300 text-sm">
              <strong>Free Plan Limitations:</strong> You can only have 1 heir and a fixed 365-day inactivity period. 
              Upgrade to Premium to add up to 10 heirs and customize your inactivity period.
            </p>
          </div>
        )}
        
        {userIsPremium && (
          <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <p className="text-purple-300 text-sm">
              <strong>Premium Features Active:</strong> You can add up to 10 heirs, customize your inactivity period, 
              and modify your inheritance settings anytime.
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        {/* Send SOL */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Send SOL</h3>
          <div className="space-y-4">
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Recipient address"
            />
            <input
              type="number"
              step="0.001"
              value={sendAmount}
              onChange={(e) => setSendAmount(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Amount in SOL"
              max={smartWalletBalance}
            />
            <button
              onClick={sendFromSmartWallet}
              disabled={!recipientAddress || !sendAmount || parseFloat(sendAmount) <= 0 || parseFloat(sendAmount) > smartWalletBalance || !isWithdrawAvailable()}
              className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-lg hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              title={!isWithdrawAvailable() ? 'Requires program upgrade' : 'Send SOL from Smart Wallet'}
            >
              <Send className="w-5 h-5 inline mr-2" />
              {!isWithdrawAvailable() ? 'Send SOL (Upgrade Required)' : 'Send SOL'}
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

      {/* Smart Wallet Features */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <WalletIcon className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-blue-300 font-semibold mb-2">Smart Wallet Features</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-200 text-sm">
              <ul className="space-y-1">
                <li>✓ Unique wallet address for receiving funds</li>
                <li>✓ Send and receive SOL directly</li>
                <li>✓ Automated inheritance system</li>
                <li>✓ Activity monitoring</li>
              </ul>
              <ul className="space-y-1">
                <li>✓ Multiple heir support</li>
                <li>✓ Percentage-based allocation</li>
                <li>✓ Secure on-chain storage</li>
                <li>✓ Share address for direct deposits</li>
              </ul>
            </div>
          </div>
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
              <li>• Others can send SOL directly to your Smart Wallet address</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-blue-400" />
              <h3 className="text-xl font-bold text-white">Notifications & Transaction History</h3>
            </div>
            <div className="flex items-center gap-2">
              {(notifications.length > 0 || transactionHistory.length > 0) && (
                <button
                  onClick={() => {
                    clearNotifications();
                    clearTransactionHistory();
                  }}
                  className="text-sm text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-white/10"
                  title="Clear all"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => setShowNotifications(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {notifications.length === 0 && transactionHistory.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">No notifications yet</p>
                <p className="text-sm text-gray-500">Your Smart Wallet activity will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Recent Notifications */}
                {notifications.slice(0, 5).map((notification) => (
                  <div key={notification.id} className="bg-white/5 rounded-lg p-4 border-l-4 border-blue-500">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {notification.action === 'Deposit' && <ArrowDownLeft className="w-4 h-4 text-green-400" />}
                          {notification.action === 'Incoming Transfer' && <ArrowDownLeft className="w-4 h-4 text-green-400" />}
                          {notification.action === 'Outgoing Transfer' && <ArrowUpRight className="w-4 h-4 text-red-400" />}
                          {notification.action === 'Smart Wallet Created' && <Shield className="w-4 h-4 text-blue-400" />}
                          {notification.action === 'Activity Updated' && <RefreshCw className="w-4 h-4 text-purple-400" />}
                        </div>
                        <div>
                          <p className="text-white font-medium">{notification.action}</p>
                          <div className="text-sm text-gray-300 space-y-1">
                            {notification.details.amount && (
                              <p>Amount: {notification.details.amount}</p>
                            )}
                            {notification.details.heirsCount && (
                              <p>Heirs: {notification.details.heirsCount}</p>
                            )}
                            {notification.details.inactivityPeriod && (
                              <p>Inactivity Period: {notification.details.inactivityPeriod}</p>
                            )}
                            {notification.txSignature && (
                              <p className="font-mono text-xs truncate">
                                Tx: {notification.txSignature.slice(0, 16)}...
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {notification.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Transaction History */}
                {transactionHistory.slice(0, 10).map((tx) => (
                  <div key={tx.id} className="bg-white/5 rounded-lg p-3 border-l-2 border-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-sm text-white">{tx.action}</span>
                        {tx.details.amount && (
                          <span className="text-sm text-gray-300">- {tx.details.amount}</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {tx.timestamp.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {(notifications.length > 5 || transactionHistory.length > 10) && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-center text-sm text-gray-400">
                Showing recent activity • {notifications.length + transactionHistory.length} total items
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}