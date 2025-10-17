import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram,
  LAMPORTS_PER_SOL,
  Keypair
} from '@solana/web3.js';
import { toast } from 'react-hot-toast';
import * as anchor from '@coral-xyz/anchor';
import { web3 } from '@coral-xyz/anchor';
import idl from '../lib/idl/gado.json';
import { 
  Crown, 
  Check, 
  X, 
  Users, 
  Clock, 
  Shield, 
  TrendingUp,
  CreditCard,
  Loader,
  Building,
  Lock,
  DollarSign,
  Wallet
} from 'lucide-react';
import { useGatewayService } from '../lib/gateway-service';

// Subscription tiers
export enum SubscriptionTier {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM', 
  ENTERPRISE = 'ENTERPRISE'
}

interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  price: number;
  priceSOL: number; // Price in SOL
  priceUSDC: number; // Price in USDC (same as USD)
  maxHeirs: number;
  inactivityPeriod: string;
  platformFee: number;
  features: string[];
  limitations: string[];
  popular?: boolean;
  enterprise?: boolean;
  icon: any;
  color: string;
  gradient: string;
}

interface UserProfile {
  tier: SubscriptionTier;
  subscriptionExpiry?: number;
  totalInheritancesCreated: number;
  totalFeesPaid: number;
  createdAt: number;
  autoRenewal: boolean;
  lastPayment?: number;
}

// Treasury wallet for collecting subscription payments (replace with your treasury wallet)
const TREASURY_WALLET = new PublicKey("EciS2vNDTe5S6WnNWEBmdBmKjQL5bsXyfauYmxPFKQGu"); // Using program ID as treasury for now

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    tier: SubscriptionTier.FREE,
    name: 'Free',
    price: 0,
    priceSOL: 0,
    priceUSDC: 0,
    maxHeirs: 1,
    inactivityPeriod: '365 days (fixed)',
    platformFee: 0.5,
    features: [
      '1 Smart Wallet',
      '1 heir maximum',
      'Basic inheritance features',
      'Community support',
      'Standard security'
    ],
    limitations: [
      'No custom inactivity periods',
      'Limited analytics',
      'No priority support'
    ],
    icon: Shield,
    color: 'text-blue-400',
    gradient: 'from-blue-500/20 to-cyan-500/20 border-blue-400/30'
  },
  {
    tier: SubscriptionTier.PREMIUM,
    name: 'Premium',
    price: 9.99,
    priceSOL: 0.05, // ~$10 worth of SOL (adjust based on current SOL price)
    priceUSDC: 9.99, // Same as USD price
    maxHeirs: 10,
    inactivityPeriod: '1-3650 days (custom)',
    platformFee: 0.25,
    features: [
      'Unlimited Smart Wallets',
      'Up to 10 heirs per wallet',
      'Custom inactivity periods',
      'Advanced analytics dashboard',
      'Priority email support',
      'Lower platform fees (0.25%)',
      'Early access to features',
      'Backup & recovery tools'
    ],
    limitations: [
      'No white-label solutions',
      'Standard API rate limits'
    ],
    popular: true,
    icon: Crown,
    color: 'text-yellow-400',
    gradient: 'from-yellow-500/20 to-orange-500/20 border-yellow-400/30'
  },
  {
    tier: SubscriptionTier.ENTERPRISE,
    name: 'Enterprise',
    price: 99.99,
    priceSOL: 0.5, // ~$100 worth of SOL (adjust based on current SOL price)
    priceUSDC: 99.99, // Same as USD price
    maxHeirs: 100,
    inactivityPeriod: 'Fully customizable',
    platformFee: 0.1,
    features: [
      'Unlimited Smart Wallets',
      'Up to 100 heirs per wallet',
      'Fully customizable inactivity periods',
      'White-label solutions',
      'Advanced enterprise analytics',
      'Dedicated account manager',
      '24/7 phone & chat support',
      'Lowest platform fees (0.1%)',
      'Custom integrations & APIs',
      'Multi-signature capabilities',
      'Compliance reporting',
      'SLA guarantees'
    ],
    limitations: [],
    enterprise: true,
    icon: Building,
    color: 'text-purple-400',
    gradient: 'from-purple-500/20 to-pink-500/20 border-purple-400/30'
  }
];

export default function SubscriptionManager() {
  const { publicKey, connected, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { sendWithGateway } = useGatewayService();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'SOL' | 'USDC'>('SOL');
  const [walletBalance, setWalletBalance] = useState<number>(0);

  useEffect(() => {
    if (!connected || !publicKey) {
      setLoading(false);
      return;
    }

    const loadUserProfile = async () => {
      setLoading(true);
      
      try {
        // Get wallet balance
        const balance = await connection.getBalance(publicKey);
        setWalletBalance(balance / LAMPORTS_PER_SOL);
        
        // Load real user profile from blockchain
        try {
          const program = new anchor.Program(idl as any, new anchor.AnchorProvider(
            connection,
            { publicKey: Keypair.generate().publicKey, signTransaction: async () => { throw new Error('Read-only'); }, signAllTransactions: async () => { throw new Error('Read-only'); } }, // Temp wallet for reading
            { commitment: 'confirmed' }
          ));

          const [userProfilePda] = web3.PublicKey.findProgramAddressSync(
            [Buffer.from("user_profile"), publicKey.toBuffer()],
            new PublicKey("EciS2vNDTe5S6WnNWEBmdBmKjQL5bsXyfauYmxPFKQGu")
          );

          const userProfileAccount = await (program.account as any)['userProfile'].fetch(userProfilePda);
          
          const realProfile: UserProfile = {
            tier: userProfileAccount.isPremium ? SubscriptionTier.PREMIUM : SubscriptionTier.FREE,
            totalInheritancesCreated: userProfileAccount.totalInheritancesCreated || 0,
            totalFeesPaid: (userProfileAccount.totalFeesPaid?.toNumber() || 0) / LAMPORTS_PER_SOL,
            createdAt: userProfileAccount.createdAt ? userProfileAccount.createdAt.toNumber() * 1000 : Date.now(),
            autoRenewal: userProfileAccount.autoRenewal !== false,
            subscriptionExpiry: userProfileAccount.subscriptionExpiry ? userProfileAccount.subscriptionExpiry.toNumber() * 1000 : 0,
          };
          
          setUserProfile(realProfile);
        } catch (error) {
          console.log('No user profile found, setting defaults:', error);
          // Set default free tier for new users
          const defaultProfile: UserProfile = {
            tier: SubscriptionTier.FREE,
            totalInheritancesCreated: 0,
            totalFeesPaid: 0,
            createdAt: Date.now(),
            autoRenewal: false,
            subscriptionExpiry: 0,
          };
          setUserProfile(defaultProfile);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        toast.error('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [connected, publicKey, connection]);

  // Function to process wallet payment
  const processWalletPayment = async (plan: SubscriptionPlan) => {
    if (!publicKey || !sendTransaction) {
      throw new Error('Wallet not connected');
    }

    const paymentAmount = paymentMethod === 'SOL' ? plan.priceSOL : plan.priceUSDC;
    
    if (paymentMethod === 'SOL') {
      // Check SOL balance
      if (walletBalance < paymentAmount) {
        throw new Error(`Insufficient SOL balance. Need ${paymentAmount} SOL, have ${walletBalance.toFixed(4)} SOL`);
      }

      // Create SOL payment transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: TREASURY_WALLET,
          lamports: Math.floor(paymentAmount * LAMPORTS_PER_SOL)
        })
      );

      // Use Gateway for payment reliability if available
      try {
        const signature = await sendWithGateway(
          transaction,
          connection,
          {
            type: 'standard_send',
            priority: 'high', // High priority for subscription payments
            assetValue: paymentAmount
          }
        );
        
        return signature;
      } catch (error) {
        // Fallback to regular wallet transaction
        const signature = await sendTransaction(transaction, connection);
        await connection.confirmTransaction(signature);
        return signature;
      }
    } else {
      // For USDC payments, we'd need to implement SPL token transfer
      // For now, throw error as USDC support needs additional implementation
      throw new Error('USDC payments not yet implemented. Please use SOL payment.');
    }
  };

  const handleSubscribe = async (tier: SubscriptionTier) => {
    if (!publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    const plan = SUBSCRIPTION_PLANS.find(p => p.tier === tier);
    if (!plan) return;

    setUpgrading(true);
    setSelectedPlan(tier);

    try {
      if (tier === SubscriptionTier.FREE) {
        setUserProfile(prev => prev ? { ...prev, tier: SubscriptionTier.FREE } : null);
        toast.success('Switched to Free plan');
      } else {
        const paymentAmount = paymentMethod === 'SOL' ? plan.priceSOL : plan.priceUSDC;
        
        toast.loading(
          `Processing ${paymentAmount} ${paymentMethod} payment for ${plan.name} plan...`, 
          { id: 'payment' }
        );
        
        // Process the wallet payment
        const signature = await processWalletPayment(plan);
        
        // Update user profile after successful payment
        const newExpiry = Date.now() + (30 * 24 * 60 * 60 * 1000);
        
        setUserProfile(prev => prev ? {
          ...prev,
          tier,
          subscriptionExpiry: newExpiry,
          lastPayment: Date.now(),
          autoRenewal: true
        } : null);

        // Update wallet balance
        const newBalance = await connection.getBalance(publicKey);
        setWalletBalance(newBalance / LAMPORTS_PER_SOL);

        toast.dismiss('payment');
        toast.success(
          `🎉 Successfully subscribed to ${plan.name} plan! Transaction: ${signature.slice(0, 8)}...`
        );
        
        setTimeout(() => {
          toast.success(`You now have access to ${plan.maxHeirs} heirs and ${plan.platformFee}% platform fees!`);
        }, 2000);
      }
    } catch (error) {
      toast.dismiss('payment');
      const errorMessage = error instanceof Error ? error.message : 'Payment failed. Please try again.';
      toast.error(errorMessage);
      console.error('Subscription payment error:', error);
    } finally {
      setUpgrading(false);
      setSelectedPlan(null);
    }
  };

  const getDaysUntilExpiry = () => {
    if (!userProfile?.subscriptionExpiry) return null;
    const days = Math.ceil((userProfile.subscriptionExpiry - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const formatPrice = (plan: SubscriptionPlan) => {
    if (plan.price === 0) return 'Free';
    if (paymentMethod === 'SOL') {
      return `${plan.priceSOL} SOL/mo`;
    }
    return `${plan.priceUSDC} USDC/mo`;
  };

  const canAffordPlan = (plan: SubscriptionPlan) => {
    if (plan.price === 0) return true;
    if (paymentMethod === 'SOL') {
      return walletBalance >= plan.priceSOL;
    }
    // For USDC, we'd need to check USDC balance - simplified for now
    return true;
  };

  if (!connected) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 text-center">
          <Crown className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
          <h2 className="text-3xl font-bold text-white mb-2">Subscription Management</h2>
          <p className="text-gray-300 mb-6">Please connect your wallet to manage your subscription</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-lg text-blue-300">
            <Lock className="w-4 h-4" />
            Wallet connection required
          </div>
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

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <Crown className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
        <h1 className="text-4xl font-bold text-white mb-2">Subscription Plans</h1>
        <p className="text-xl text-gray-300">Choose the perfect plan for your digital inheritance needs</p>
        
        {/* Payment Method Selector */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-1 flex">
            <button
              onClick={() => setPaymentMethod('SOL')}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                paymentMethod === 'SOL'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Wallet className="w-4 h-4 inline mr-2" />
              Pay with SOL
            </button>
            <button
              onClick={() => setPaymentMethod('USDC')}
              disabled={true} // Disable USDC for now
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 opacity-50 cursor-not-allowed ${
                paymentMethod === 'USDC'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'text-gray-300'
              }`}
            >
              <DollarSign className="w-4 h-4 inline mr-2" />
              Pay with USDC (Coming Soon)
            </button>
          </div>
        </div>

        {/* Wallet Balance Display */}
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-lg text-blue-300">
          <Wallet className="w-4 h-4" />
          <span className="text-sm">
            Wallet Balance: {walletBalance.toFixed(4)} SOL
          </span>
        </div>
      </div>

      {/* Current Plan Status */}
      {userProfile && (
        <div className={`bg-gradient-to-br ${
          SUBSCRIPTION_PLANS.find(p => p.tier === userProfile.tier)?.gradient || 'from-gray-500/20 to-gray-600/20'
        } backdrop-blur-md rounded-2xl border p-6 mb-8`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                {React.createElement(
                  SUBSCRIPTION_PLANS.find(p => p.tier === userProfile.tier)?.icon || Shield,
                  { className: `w-6 h-6 ${SUBSCRIPTION_PLANS.find(p => p.tier === userProfile.tier)?.color || 'text-gray-400'}` }
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Current Plan: {SUBSCRIPTION_PLANS.find(p => p.tier === userProfile.tier)?.name}
                </h3>
                <p className="text-gray-300">
                  {userProfile.tier === SubscriptionTier.FREE 
                    ? 'Forever free' 
                    : `${getDaysUntilExpiry()} days remaining`}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-300">Smart Wallets</span>
              </div>
              <p className="text-lg font-bold text-white">{userProfile.totalInheritancesCreated}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-300">Max Heirs</span>
              </div>
              <p className="text-lg font-bold text-white">
                {SUBSCRIPTION_PLANS.find(p => p.tier === userProfile.tier)?.maxHeirs}
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-300">Platform Fee</span>
              </div>
              <p className="text-lg font-bold text-white">
                {SUBSCRIPTION_PLANS.find(p => p.tier === userProfile.tier)?.platformFee}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <div
            key={plan.tier}
            className={`relative bg-gradient-to-br ${plan.gradient} backdrop-blur-md rounded-2xl border p-8 transition-all duration-300 hover:scale-105 ${
              plan.popular ? 'ring-2 ring-yellow-400/50' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-4 py-1 rounded-full text-xs font-bold">
                  MOST POPULAR
                </span>
              </div>
            )}

            {plan.enterprise && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 text-black px-4 py-1 rounded-full text-xs font-bold">
                  ENTERPRISE
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <plan.icon className={`w-12 h-12 mx-auto mb-4 ${plan.color}`} />
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="text-3xl font-bold text-white mb-1">{formatPrice(plan)}</div>
            </div>

            <div className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span className="text-sm text-gray-200">{feature}</span>
                </div>
              ))}
              
              {plan.limitations.map((limitation, index) => (
                <div key={index} className="flex items-center gap-3">
                  <X className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span className="text-sm text-gray-400">{limitation}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleSubscribe(plan.tier)}
              disabled={upgrading || userProfile?.tier === plan.tier || (plan.price > 0 && !canAffordPlan(plan))}
              className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                userProfile?.tier === plan.tier
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                  : !canAffordPlan(plan) && plan.price > 0
                  ? 'bg-red-600/50 text-red-200 cursor-not-allowed'
                  : plan.tier === SubscriptionTier.FREE
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : plan.tier === SubscriptionTier.PREMIUM
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
              }`}
            >
              {upgrading && selectedPlan === plan.tier ? (
                <>
                  <Loader className="w-4 h-4 inline mr-2 animate-spin" />
                  Processing Payment...
                </>
              ) : userProfile?.tier === plan.tier ? (
                'Current Plan'
              ) : !canAffordPlan(plan) && plan.price > 0 ? (
                <>
                  <X className="w-4 h-4 inline mr-2" />
                  Insufficient Balance
                </>
              ) : plan.enterprise ? (
                <>
                  <Building className="w-4 h-4 inline mr-2" />
                  Contact Sales
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 inline mr-2" />
                  {plan.price === 0 ? 'Get Started' : `Pay ${formatPrice(plan).split('/')[0]}`}
                </>
              )}
            </button>

            {plan.enterprise && (
              <p className="text-xs text-center text-gray-400 mt-3">
                Custom pricing available
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Feature Comparison */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">Feature Comparison</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10">
                <th className="pb-4 text-gray-300 font-medium">Feature</th>
                <th className="pb-4 text-center text-blue-400 font-medium">Free</th>
                <th className="pb-4 text-center text-yellow-400 font-medium">Premium</th>
                <th className="pb-4 text-center text-purple-400 font-medium">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5">
                <td className="py-4 text-white font-medium">Maximum Heirs per Wallet</td>
                <td className="py-4 text-center text-gray-300">1</td>
                <td className="py-4 text-center text-yellow-400">10</td>
                <td className="py-4 text-center text-purple-400">100</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-4 text-white font-medium">Smart Wallets</td>
                <td className="py-4 text-center text-gray-300">1</td>
                <td className="py-4 text-center text-yellow-400">Unlimited</td>
                <td className="py-4 text-center text-purple-400">Unlimited</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-4 text-white font-medium">Platform Fee</td>
                <td className="py-4 text-center text-gray-300">0.5%</td>
                <td className="py-4 text-center text-yellow-400">0.25%</td>
                <td className="py-4 text-center text-purple-400">0.1%</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-4 text-white font-medium">Support</td>
                <td className="py-4 text-center text-gray-300">Community</td>
                <td className="py-4 text-center text-yellow-400">Priority Email</td>
                <td className="py-4 text-center text-purple-400">24/7 Dedicated</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Info */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-400/20 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <Wallet className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <h4 className="text-blue-300 font-semibold mb-2">Wallet Payment & Billing Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-blue-200">
              <div>
                <h5 className="font-medium mb-2">💳 Wallet Payments:</h5>
                <ul className="space-y-1 ml-4">
                  <li>✅ SOL (Solana native token)</li>
                  <li>🚧 USDC (Coming soon)</li>
                  <li>• Direct from your connected wallet</li>
                  <li>• Instant payment processing</li>
                  <li>• No middleman fees</li>
                  <li>• Secured by blockchain</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2">🔄 Billing Details:</h5>
                <ul className="space-y-1 ml-4">
                  <li>• Monthly subscription cycle</li>
                  <li>• Manual renewal (wallet-based)</li>
                  <li>• Transparent on-chain payments</li>
                  <li>• No hidden fees or charges</li>
                  <li>• Enterprise: Custom arrangements</li>
                  <li>• Payment history on blockchain</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-400/30 rounded-lg">
              <div className="flex items-start gap-2">
                <DollarSign className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-yellow-200">
                  <p className="font-medium text-sm">Web3 Native Payments</p>
                  <p className="text-xs mt-1">
                    Payments are processed directly from your connected wallet to our treasury. 
                    No credit cards or traditional payment processors required. 
                    All transactions are transparent and verifiable on the Solana blockchain.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
