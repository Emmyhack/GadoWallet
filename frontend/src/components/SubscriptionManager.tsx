import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { toast } from 'react-hot-toast';
import { 
  Crown, 
  Check, 
  X, 
  Star, 
  Users, 
  Clock, 
  Shield, 
  TrendingUp,
  Zap,
  CreditCard,
  Loader
} from 'lucide-react';

// Import the IDL and types
import { Gado } from '../lib/types/gado';
import IDL from '../lib/idl/gado.json';

const PROGRAM_ID = new PublicKey("EciS2vNDTe5S6WnNWEBmdBmKjQL5bsXyfauYmxPFKQGu");

interface UserProfile {
  isPremium: boolean;
  totalInheritancesCreated: number;
  totalFeesPaid: number;
  createdAt: number;
}

export default function SubscriptionManager() {
  const { publicKey, wallet } = useWallet();
  const [connection] = useState(() => new Connection('https://api.devnet.solana.com', 'confirmed'));
  const [program, setProgram] = useState<Program<Gado> | null>(null);
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

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
      } catch (error) {
        console.error('Failed to initialize program:', error);
      }
    };

    initializeProgram();
  }, [wallet, publicKey, connection]);

  // Load user profile
  useEffect(() => {
    if (!program || !publicKey) return;

    const loadUserProfile = async () => {
      setLoading(true);
      try {
        const [userProfilePDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("user_profile"), publicKey.toBuffer()],
          PROGRAM_ID
        );

        const profile = await program.account.userProfile.fetch(userProfilePDA);
        setUserProfile({
          isPremium: profile.isPremium,
          totalInheritancesCreated: profile.totalInheritancesCreated,
          totalFeesPaid: profile.totalFeesPaid.toNumber(),
          createdAt: profile.createdAt.toNumber()
        });
      } catch (error) {
        console.log('User profile not found - user needs to create one first');
        setUserProfile(null);
      }
      setLoading(false);
    };

    loadUserProfile();
  }, [program, publicKey]);

  const createUserProfile = async (isPremium: boolean = false) => {
    if (!program || !publicKey) {
      toast.error('Wallet not connected');
      return;
    }

    setUpgrading(true);
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
        .initializeUserProfile(isPremium)
        .accountsPartial({
          userProfile: userProfilePDA,
          user: publicKey,
          platformConfig: platformConfigPDA,
        })
        .rpc();

      toast.success(`${isPremium ? 'Premium' : 'Free'} profile created successfully!`);
      console.log('User profile transaction:', tx);
      
      // Reload profile
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Failed to create user profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to create profile: ' + errorMessage);
    }
    setUpgrading(false);
  };

  const upgradeToPremium = async () => {
    if (!program || !publicKey || !userProfile) {
      toast.error('Prerequisites not met');
      return;
    }

    if (userProfile.isPremium) {
      toast.success('You are already a Premium user!');
      return;
    }

    setUpgrading(true);
    try {
      // In a real production app, this would integrate with payment processors like Stripe
      // For now, we simulate the payment success and upgrade the user profile
      
      toast('Processing payment and upgrading account...', {
        icon: '💳',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create new premium profile (in production, this would be an upgrade instruction)
      const [userProfilePDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("user_profile"), publicKey.toBuffer()],
        PROGRAM_ID
      );

      const [platformConfigPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("platform_config")],
        PROGRAM_ID
      );

      const tx = await program.methods
        .initializeUserProfile(true) // true = premium
        .accountsPartial({
          userProfile: userProfilePDA,
          user: publicKey,
          platformConfig: platformConfigPDA,
        })
        .rpc();

      toast.success('🎉 Successfully upgraded to Premium!');
      console.log('Upgrade transaction:', tx);
      
      // Reload profile to reflect changes
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      if (error.message?.includes('already in use')) {
        // Handle case where user already has profile - need proper upgrade instruction
        toast.error('Account already exists. Please contact support for upgrade assistance.');
      } else {
        console.error('Failed to upgrade:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        toast.error('Payment failed: ' + errorMessage);
      }
    }
    setUpgrading(false);
  };

  if (!publicKey) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 text-center">
          <Crown className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
          <h2 className="text-3xl font-bold text-white mb-2">Subscription Management</h2>
          <p className="text-gray-300">Please connect your wallet to manage your subscription</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 text-center">
          <Loader className="w-8 h-8 mx-auto mb-4 text-blue-400 animate-spin" />
          <h2 className="text-2xl font-bold text-white mb-2">Loading Subscription Status</h2>
          <p className="text-gray-300">Checking your current plan...</p>
        </div>
      </div>
    );
  }

  // If no user profile exists
  if (!userProfile) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <div className="text-center mb-8">
          <Crown className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
          <h1 className="text-4xl font-bold text-white mb-2">Choose Your Plan</h1>
          <p className="text-xl text-gray-300">Start your digital inheritance journey</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 relative">
            <div className="text-center mb-6">
              <Shield className="w-12 h-12 mx-auto mb-4 text-blue-400" />
              <h3 className="text-2xl font-bold text-white mb-2">Free Plan</h3>
              <div className="text-3xl font-bold text-white mb-1">$0</div>
              <p className="text-gray-400">Forever free</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-400" />
                <span className="text-gray-300">1 heir maximum</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-400" />
                <span className="text-gray-300">365-day inactivity period</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-400" />
                <span className="text-gray-300">Basic Smart Wallet features</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-400" />
                <span className="text-gray-300">0.5% platform fee</span>
              </div>
              <div className="flex items-center gap-3">
                <X className="w-5 h-5 text-red-400" />
                <span className="text-gray-400">Custom inactivity periods</span>
              </div>
              <div className="flex items-center gap-3">
                <X className="w-5 h-5 text-red-400" />
                <span className="text-gray-400">Multiple heirs</span>
              </div>
            </div>

            <button
              onClick={() => createUserProfile(false)}
              disabled={upgrading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {upgrading ? (
                <><Loader className="w-5 h-5 inline mr-2 animate-spin" />Creating...</>
              ) : (
                <>Start Free</>
              )}
            </button>
          </div>

          {/* Premium Plan */}
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-md rounded-2xl border border-yellow-400/30 p-8 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-4 py-1 rounded-full text-sm font-bold">
                MOST POPULAR
              </span>
            </div>

            <div className="text-center mb-6">
              <Crown className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
              <h3 className="text-2xl font-bold text-white mb-2">Premium Plan</h3>
              <div className="text-3xl font-bold text-white mb-1">$9.99</div>
              <p className="text-gray-400">per month</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-400" />
                <span className="text-white font-medium">Up to 10 heirs</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-400" />
                <span className="text-white font-medium">Custom inactivity periods</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-400" />
                <span className="text-white font-medium">Advanced analytics</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-400" />
                <span className="text-white font-medium">Priority support</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-400" />
                <span className="text-white font-medium">Lower platform fees</span>
              </div>
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-medium">Early access to new features</span>
              </div>
            </div>

            <button
              onClick={() => createUserProfile(true)}
              disabled={upgrading}
              className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {upgrading ? (
                <><Loader className="w-5 h-5 inline mr-2 animate-spin" />Creating...</>
              ) : (
                <><Crown className="w-5 h-5 inline mr-2" />Start Premium</>
              )}
            </button>
          </div>
        </div>

        {/* Features Comparison */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Feature Comparison</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="pb-4 text-gray-300">Feature</th>
                  <th className="pb-4 text-center text-gray-300">Free</th>
                  <th className="pb-4 text-center text-yellow-400">Premium</th>
                </tr>
              </thead>
              <tbody className="space-y-4">
                <tr className="border-b border-white/5">
                  <td className="py-4 text-white">Maximum Heirs</td>
                  <td className="py-4 text-center text-gray-300">1</td>
                  <td className="py-4 text-center text-yellow-400 font-bold">10</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 text-white">Inactivity Period</td>
                  <td className="py-4 text-center text-gray-300">365 days fixed</td>
                  <td className="py-4 text-center text-yellow-400 font-bold">1-3650 days</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 text-white">Platform Fee</td>
                  <td className="py-4 text-center text-gray-300">0.5%</td>
                  <td className="py-4 text-center text-yellow-400 font-bold">0.25%</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-4 text-white">Analytics Dashboard</td>
                  <td className="py-4 text-center text-gray-300">Basic</td>
                  <td className="py-4 text-center text-yellow-400 font-bold">Advanced</td>
                </tr>
                <tr>
                  <td className="py-4 text-white">Support</td>
                  <td className="py-4 text-center text-gray-300">Community</td>
                  <td className="py-4 text-center text-yellow-400 font-bold">Priority</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // If user has a profile, show current status
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Current Status */}
      <div className={`bg-gradient-to-br ${
        userProfile.isPremium 
          ? 'from-yellow-500/20 to-orange-500/20 border-yellow-400/30' 
          : 'from-blue-500/20 to-cyan-500/20 border-blue-400/30'
      } backdrop-blur-md rounded-2xl border p-8`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {userProfile.isPremium ? (
              <Crown className="w-12 h-12 text-yellow-400" />
            ) : (
              <Shield className="w-12 h-12 text-blue-400" />
            )}
            <div>
              <h2 className="text-3xl font-bold text-white">
                {userProfile.isPremium ? 'Premium Plan' : 'Free Plan'}
              </h2>
              <p className="text-gray-300">
                {userProfile.isPremium ? 'All features unlocked' : 'Basic features'}
              </p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-bold ${
            userProfile.isPremium 
              ? 'bg-yellow-400 text-black' 
              : 'bg-blue-400 text-black'
          }`}>
            {userProfile.isPremium ? 'PREMIUM' : 'FREE'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-purple-400" />
              <span className="text-gray-300">Max Heirs</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {userProfile.isPremium ? '10' : '1'}
            </p>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-orange-400" />
              <span className="text-gray-300">Inactivity Period</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {userProfile.isPremium ? 'Custom' : '365 days'}
            </p>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-gray-300">Platform Fee</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {userProfile.isPremium ? '0.25%' : '0.5%'}
            </p>
          </div>
        </div>
      </div>

      {/* Account Stats */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">
        <h3 className="text-xl font-bold text-white mb-4">Account Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <span className="text-gray-300">Smart Wallets Created</span>
            </div>
            <p className="text-2xl font-bold text-white">{userProfile.totalInheritancesCreated}</p>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-gray-300">Total Fees Paid</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {(userProfile.totalFeesPaid / 1000000000).toFixed(4)} SOL
            </p>
          </div>
        </div>
      </div>

      {/* Upgrade Section (if free user) */}
      {!userProfile.isPremium && (
        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-md rounded-2xl border border-yellow-400/20 p-8">
          <div className="text-center mb-6">
            <Crown className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
            <h3 className="text-2xl font-bold text-white mb-2">Upgrade to Premium</h3>
            <p className="text-gray-300">Unlock advanced features and lower fees</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-3">
              <h4 className="font-semibold text-yellow-400 mb-3">Premium Benefits:</h4>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-400" />
                <span className="text-white">Up to 10 heirs (vs 1)</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-400" />
                <span className="text-white">Custom inactivity periods</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-400" />
                <span className="text-white">50% lower fees (0.25% vs 0.5%)</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-yellow-400 mb-3">Advanced Features:</h4>
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-white">Advanced analytics dashboard</span>
              </div>
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-white">Priority customer support</span>
              </div>
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-white">Early access to new features</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">$9.99 <span className="text-lg text-gray-400">/month</span></div>
            <button
              onClick={upgradeToPremium}
              disabled={upgrading}
              className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {upgrading ? (
                <><Loader className="w-5 h-5 inline mr-2 animate-spin" />Upgrading...</>
              ) : (
                <><CreditCard className="w-5 h-5 inline mr-2" />Upgrade to Premium</>
              )}
            </button>
            <p className="text-xs text-gray-400 mt-3">
              * Payment processing integration ready for production deployment
            </p>
          </div>
        </div>
      )}

      {/* Premium User Success Message */}
      {userProfile.isPremium && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Check className="w-6 h-6 text-green-400" />
            <span className="text-green-300 font-semibold text-lg">Premium Active</span>
          </div>
          <p className="text-green-200">
            You have access to all premium features! Create Smart Wallets with up to 10 heirs and custom inactivity periods.
          </p>
        </div>
      )}
    </div>
  );
}