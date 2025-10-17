import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Crown, Zap, Shield, Check, X, CreditCard, Loader, AlertCircle } from 'lucide-react';

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
  color: string;
  description: string;
}

interface PaymentState {
  processing: boolean;
  error: string | null;
  success: boolean;
  transactionSignature?: string;
}

const SubscriptionPayment: React.FC = () => {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [paymentState, setPaymentState] = useState<PaymentState>({
    processing: false,
    error: null,
    success: false
  });
  const [currentSubscription, setCurrentSubscription] = useState<string | null>(null);

  const subscriptionTiers: SubscriptionTier[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: 9.99,
      interval: 'monthly',
      description: 'Perfect for individuals getting started',
      icon: <Shield className="w-6 h-6" />,
      color: 'from-blue-600 to-cyan-500',
      features: [
        'Basic inheritance setup',
        'Up to 3 heirs',
        'Standard activity tracking',
        'Email notifications',
        'Basic smart contract protection',
        '24/7 support'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 19.99,
      interval: 'monthly',
      description: 'Advanced features for power users',
      icon: <Crown className="w-6 h-6" />,
      color: 'from-purple-600 to-pink-500',
      popular: true,
      features: [
        'Everything in Basic',
        'Unlimited heirs',
        'Advanced activity management',
        'Premium keeper bot service',
        'Multi-signature support',
        'Portfolio analytics',
        'Custom smart contracts',
        'Priority support'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 199,
      interval: 'monthly',
      description: 'Complete solution for organizations',
      icon: <Zap className="w-6 h-6" />,
      color: 'from-orange-600 to-red-500',
      features: [
        'Everything in Premium',
        'Enterprise keeper bot (99.9% SLA)',
        'Smart contract insurance',
        'Regulatory compliance tools',
        'Custom integrations',
        'Dedicated account manager',
        'Advanced reporting',
        'White-label options'
      ]
    }
  ];

  useEffect(() => {
    loadCurrentSubscription();
  }, [publicKey]);

  const loadCurrentSubscription = async () => {
    if (!publicKey) return;
    
    try {
      // Check user's current subscription from localStorage or blockchain
      const stored = localStorage.getItem(`subscription_${publicKey.toString()}`);
      if (stored) {
        const subscription = JSON.parse(stored);
        if (subscription.expiresAt > Date.now()) {
          setCurrentSubscription(subscription.tier);
        }
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  };

  const calculateSOLPrice = (usdPrice: number): number => {
    // In a real implementation, you'd fetch the current SOL/USD rate
    // For now, assuming 1 SOL = $25 USD (you should use a real price feed)
    const SOL_USD_RATE = 25;
    return usdPrice / SOL_USD_RATE;
  };

  const handleSubscribe = async (tier: SubscriptionTier) => {
    if (!publicKey || !signTransaction) {
      setPaymentState({
        processing: false,
        error: 'Please connect your wallet first',
        success: false
      });
      return;
    }

    setPaymentState({ processing: true, error: null, success: false });
    setSelectedTier(tier.id);

    try {
      // Create payment transaction
      const solAmount = calculateSOLPrice(tier.price);
      const lamports = Math.floor(solAmount * LAMPORTS_PER_SOL);

      // Treasury address (in production, use your actual treasury address)
      const treasuryAddress = new PublicKey('11111111111111111111111111111112'); // Replace with actual treasury

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: treasuryAddress,
          lamports: lamports,
        })
      );

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Sign transaction
      const signedTransaction = await signTransaction(transaction);
      
      // Send transaction
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      
      // Confirm transaction
      await connection.confirmTransaction(signature, 'confirmed');

      // Store subscription locally (in production, store on blockchain or backend)
      const subscriptionData = {
        tier: tier.id,
        startDate: Date.now(),
        expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
        transactionSignature: signature,
        price: tier.price,
        solAmount: solAmount
      };

      localStorage.setItem(`subscription_${publicKey.toString()}`, JSON.stringify(subscriptionData));

      setPaymentState({
        processing: false,
        error: null,
        success: true,
        transactionSignature: signature
      });

      setCurrentSubscription(tier.id);

    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentState({
        processing: false,
        error: error.message || 'Payment failed. Please try again.',
        success: false
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const isCurrentTier = (tierIdm: string) => currentSubscription === tierIdm;

  if (!publicKey) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Subscription Management</h3>
          <p className="text-gray-400">Connect your wallet to manage subscriptions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Choose Your Plan</h2>
        <p className="text-gray-300 text-lg mb-6">
          Unlock advanced features with our subscription plans
        </p>
        {currentSubscription && (
          <div className="inline-flex items-center space-x-2 bg-green-500/20 border border-green-500/30 rounded-full px-4 py-2 mb-6">
            <Check className="w-4 h-4 text-green-400" />
            <span className="text-green-300 font-medium">
              Current Plan: {subscriptionTiers.find(t => t.id === currentSubscription)?.name}
            </span>
          </div>
        )}
      </div>

      {/* Subscription Tiers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {subscriptionTiers.map((tier) => {
          const isActive = isCurrentTier(tier.id);
          const isProcessing = paymentState.processing && selectedTier === tier.id;
          
          return (
            <div
              key={tier.id}
              className={`relative bg-white/10 backdrop-blur-md border rounded-2xl p-6 transition-all duration-300 ${
                tier.popular 
                  ? 'border-purple-500/50 shadow-2xl shadow-purple-500/20 scale-105' 
                  : 'border-white/20 hover:border-white/30'
              } ${isActive ? 'ring-2 ring-green-500/50' : ''}`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white text-sm font-bold px-4 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                </div>
              )}

              {isActive && (
                <div className="absolute -top-3 right-4">
                  <div className="bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full flex items-center space-x-1">
                    <Check className="w-3 h-3" />
                    <span>ACTIVE</span>
                  </div>
                </div>
              )}

              {/* Tier Header */}
              <div className="text-center mb-6">
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${tier.color} mb-4`}>
                  {tier.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                <p className="text-gray-300 text-sm mb-4">{tier.description}</p>
                <div className="flex items-baseline justify-center space-x-1">
                  <span className="text-4xl font-bold text-white">{formatPrice(tier.price)}</span>
                  <span className="text-gray-400">/{tier.interval}</span>
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  ≈ {calculateSOLPrice(tier.price).toFixed(3)} SOL
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-3 mb-8">
                {tier.features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-200 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleSubscribe(tier)}
                disabled={isProcessing || isActive}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center space-x-2 ${
                  isActive
                    ? 'bg-green-600 cursor-not-allowed'
                    : isProcessing
                    ? 'bg-gray-600 cursor-not-allowed'
                    : `bg-gradient-to-r ${tier.color} hover:shadow-lg hover:scale-105 active:scale-95`
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : isActive ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Current Plan</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>Subscribe Now</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Payment Status */}
      {paymentState.error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-red-300">Payment Failed</h4>
            <p className="text-red-200 text-sm">{paymentState.error}</p>
          </div>
        </div>
      )}

      {paymentState.success && (
        <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 flex items-center space-x-3">
          <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-green-300">Payment Successful!</h4>
            <p className="text-green-200 text-sm">
              Your subscription is now active. Transaction: {paymentState.transactionSignature?.slice(0, 8)}...
            </p>
          </div>
        </div>
      )}

      {/* Features Comparison */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 text-center">Why Choose Premium?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 w-fit mx-auto mb-3">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-white mb-2">Enhanced Security</h4>
            <p className="text-gray-300 text-sm">Advanced smart contract protection and multi-signature support</p>
          </div>
          <div className="text-center">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 w-fit mx-auto mb-3">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-white mb-2">Premium Features</h4>
            <p className="text-gray-300 text-sm">Unlimited heirs, portfolio analytics, and custom contracts</p>
          </div>
          <div className="text-center">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-600 to-red-500 w-fit mx-auto mb-3">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-semibold text-white mb-2">Priority Support</h4>
            <p className="text-gray-300 text-sm">24/7 priority support and dedicated account management</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPayment;