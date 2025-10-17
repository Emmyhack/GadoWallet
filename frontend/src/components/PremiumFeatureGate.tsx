import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Crown, Lock, Sparkles, Zap, Shield, ArrowRight, Check } from 'lucide-react';

interface PremiumGateProps {
  children: React.ReactNode;
  requiredTier: 'basic' | 'premium' | 'enterprise';
  featureName: string;
  featureDescription: string;
  onUpgrade?: () => void;
}

interface UserSubscription {
  tier: string;
  isActive: boolean;
  expiresAt: number;
}

const PremiumFeatureGate: React.FC<PremiumGateProps> = ({
  children,
  requiredTier,
  featureName,
  featureDescription,
  onUpgrade
}) => {
  const { publicKey } = useWallet();
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserSubscription();
  }, [publicKey]);

  const loadUserSubscription = async () => {
    if (!publicKey) {
      setLoading(false);
      return;
    }

    try {
      // Check user's current subscription
      const stored = localStorage.getItem(`subscription_${publicKey.toString()}`);
      if (stored) {
        const subscription = JSON.parse(stored);
        if (subscription.expiresAt > Date.now()) {
          setUserSubscription({
            tier: subscription.tier,
            isActive: true,
            expiresAt: subscription.expiresAt
          });
        } else {
          setUserSubscription({
            tier: 'free',
            isActive: false,
            expiresAt: 0
          });
        }
      } else {
        setUserSubscription({
          tier: 'free',
          isActive: false,
          expiresAt: 0
        });
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
      setUserSubscription({
        tier: 'free',
        isActive: false,
        expiresAt: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const tierHierarchy = {
    free: 0,
    basic: 1,
    premium: 2,
    enterprise: 3
  };

  const hasAccess = (): boolean => {
    if (!userSubscription) return false;
    if (!userSubscription.isActive) return requiredTier === 'basic' ? false : false;
    
    const userTierLevel = tierHierarchy[userSubscription.tier as keyof typeof tierHierarchy] || 0;
    const requiredTierLevel = tierHierarchy[requiredTier];
    
    return userTierLevel >= requiredTierLevel;
  };

  const getTierInfo = (tier: string) => {
    switch (tier) {
      case 'basic':
        return {
          name: 'Basic',
          price: '$9.99/month',
          color: 'from-blue-600 to-cyan-500',
          icon: <Shield className="w-6 h-6" />
        };
      case 'premium':
        return {
          name: 'Premium',
          price: '$19.99/month',
          color: 'from-purple-600 to-pink-500',
          icon: <Crown className="w-6 h-6" />
        };
      case 'enterprise':
        return {
          name: 'Enterprise',
          price: '$199/month',
          color: 'from-orange-600 to-red-500',
          icon: <Zap className="w-6 h-6" />
        };
      default:
        return {
          name: 'Free',
          price: 'Free',
          color: 'from-gray-600 to-gray-500',
          icon: <Lock className="w-6 h-6" />
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  // If user has access, render the children
  if (hasAccess()) {
    return <>{children}</>;
  }

  // If no access, show upgrade prompt
  const tierInfo = getTierInfo(requiredTier);
  const currentTierInfo = getTierInfo(userSubscription?.tier || 'free');

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="max-w-md mx-auto text-center">
        {/* Premium Badge */}
        <div className="mb-6">
          <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${tierInfo.color} shadow-2xl`}>
            {tierInfo.icon}
          </div>
        </div>

        {/* Header */}
        <h3 className="text-2xl font-bold text-white mb-2">{featureName}</h3>
        <p className="text-gray-300 mb-6">{featureDescription}</p>

        {/* Current vs Required */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-left">
              <div className="text-sm text-gray-400">Your Plan</div>
              <div className={`font-semibold bg-gradient-to-r ${currentTierInfo.color} bg-clip-text text-transparent`}>
                {currentTierInfo.name}
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
            <div className="text-right">
              <div className="text-sm text-gray-400">Required</div>
              <div className={`font-semibold bg-gradient-to-r ${tierInfo.color} bg-clip-text text-transparent`}>
                {tierInfo.name}
              </div>
            </div>
          </div>
        </div>

        {/* Feature Benefits */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
          <h4 className="font-semibold text-white mb-3">What you'll get:</h4>
          <div className="space-y-2 text-left">
            {requiredTier === 'basic' && (
              <>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300 text-sm">Up to 3 heirs</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300 text-sm">Basic smart contract protection</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300 text-sm">Email notifications</span>
                </div>
              </>
            )}
            {requiredTier === 'premium' && (
              <>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300 text-sm">Unlimited heirs</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300 text-sm">Premium keeper bot service</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300 text-sm">Multi-signature support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300 text-sm">Portfolio analytics</span>
                </div>
              </>
            )}
            {requiredTier === 'enterprise' && (
              <>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300 text-sm">Enterprise keeper bot (99.9% SLA)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300 text-sm">Smart contract insurance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300 text-sm">Regulatory compliance tools</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300 text-sm">Dedicated account manager</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Upgrade Button */}
        <button
          onClick={onUpgrade}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center space-x-3 bg-gradient-to-r ${tierInfo.color} hover:shadow-lg hover:scale-105 active:scale-95`}
        >
          <Sparkles className="w-5 h-5" />
          <span>Upgrade to {tierInfo.name}</span>
          <span className="text-sm opacity-80">({tierInfo.price})</span>
        </button>

        {/* Fine Print */}
        <div className="mt-4 text-xs text-gray-400">
          Secure payment via Solana blockchain • Cancel anytime
        </div>
      </div>
    </div>
  );
};

export default PremiumFeatureGate;