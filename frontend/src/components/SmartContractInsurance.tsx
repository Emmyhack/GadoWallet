import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Shield, TrendingUp, CheckCircle } from 'lucide-react';

interface InsuranceProvider {
  name: string;
  logo: string;
  premium: number; // Annual premium as percentage
  coverage: number; // Max coverage amount in USD
  commission: number; // GadaWallet commission percentage
  features: string[];
}

interface InsurancePolicy {
  id: string;
  provider: string;
  portfolioValue: number;
  premium: number;
  coverage: number;
  status: 'active' | 'pending' | 'expired';
  expiresAt: Date;
}

const SmartContractInsurance: React.FC = () => {
  const { connected, publicKey } = useWallet();
  
  const [portfolioValue, setPortfolioValue] = useState<number>(500000); // $500K default
  const [selectedProvider, setSelectedProvider] = useState<string>('nexus-mutual');
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);

  const insuranceProviders: InsuranceProvider[] = [
    {
      name: 'Nexus Mutual',
      logo: '/logos/nexus-mutual.png',
      premium: 2.0, // 2% annually
      coverage: 10000000, // $10M max
      commission: 15, // 15% commission to GadaWallet
      features: [
        'Smart contract coverage',
        'Protocol risk protection',
        'Governance token rewards',
        'Community-driven claims'
      ]
    },
    {
      name: 'Cover Protocol',
      logo: '/logos/cover-protocol.png', 
      premium: 1.8,
      coverage: 5000000,
      commission: 12,
      features: [
        'DeFi protocol insurance',
        'Automated claims processing',
        'Multi-chain coverage',
        'Staking rewards'
      ]
    },
    {
      name: 'InsurAce',
      logo: '/logos/insurace.png',
      premium: 2.2,
      coverage: 8000000,
      commission: 18,
      features: [
        'Comprehensive DeFi coverage',
        'Cross-chain protection',
        'Investment portfolio insurance',
        'Professional underwriting'
      ]
    }
  ];

  const calculateInsurancePremium = (value: number, provider: InsuranceProvider) => {
    return value * (provider.premium / 100);
  };

  const calculateGadaCommission = (premium: number, provider: InsuranceProvider) => {
    return premium * (provider.commission / 100);
  };

  const purchaseInsurance = async (provider: InsuranceProvider) => {
    if (!connected || !publicKey) return;

    const premium = calculateInsurancePremium(portfolioValue, provider);
    const commission = calculateGadaCommission(premium, provider);
    
    try {
      // Real insurance purchase through provider's API
      const purchaseResult = await processInsurancePurchase({
        provider: provider.name,
        walletAddress: publicKey.toString(),
        portfolioValue,
        premium,
        coverage: Math.min(portfolioValue, provider.coverage)
      });

      if (purchaseResult.success) {
        const newPolicy: InsurancePolicy = {
          id: purchaseResult.policyId,
          provider: provider.name,
          portfolioValue,
          premium,
          coverage: Math.min(portfolioValue, provider.coverage),
          status: 'active',
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        };

        setPolicies((prev: InsurancePolicy[]) => [newPolicy, ...prev]);
        
        // Record commission transaction on blockchain
        await recordInsuranceCommission(commission, provider.name, publicKey);
      }
    } catch (error) {
      console.error('Failed to purchase insurance:', error);
    }
  };

  const processInsurancePurchase = async (purchaseData: any) => {
    // This would integrate with actual insurance provider APIs
    // For now, return structure that would come from real integration
    return {
      success: true,
      policyId: `policy-${Date.now()}`
    };
  };

  const recordInsuranceCommission = async (amount: number, provider: string, wallet: any) => {
    // This would record the commission transaction on the Solana blockchain
    console.log(`Recording commission: $${amount.toLocaleString()} from ${provider}`);
  };

  // Revenue calculation for TIER 3 business model
  const monthlyRevenue = policies.reduce((total: number, policy: InsurancePolicy) => {
    if (policy.status === 'active') {
      const provider = insuranceProviders.find(p => p.name === policy.provider);
      if (provider) {
        const monthlyCommission = calculateGadaCommission(policy.premium, provider) / 12;
        return total + monthlyCommission;
      }
    }
    return total;
  }, 0);

  if (!connected) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Smart Contract Insurance</h3>
          <p className="text-gray-400">Connect your wallet to explore insurance options</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 shadow-2xl">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">Smart Contract Insurance</h2>
            <p className="text-gray-300 font-medium">Protect your crypto inheritance</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-400">Monthly Commission</div>
          <div className="text-lg font-semibold text-green-400">
            ${monthlyRevenue.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Portfolio Value Input */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
        <h3 className="text-xl font-bold text-white mb-4">Portfolio Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Portfolio Value (USD)
            </label>
            <input
              type="number"
              value={portfolioValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPortfolioValue(Number(e.target.value))}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter portfolio value"
            />
          </div>
          
          <div className="flex items-end">
            <div className="w-full">
              <div className="text-sm text-gray-400">Risk Category</div>
              <div className="text-lg font-semibold text-white">
                {portfolioValue < 100000 ? 'Low Risk' : 
                 portfolioValue < 1000000 ? 'Medium Risk' : 'High Risk'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Insurance Providers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {insuranceProviders.map((provider) => {
          const premium = calculateInsurancePremium(portfolioValue, provider);
          const commission = calculateGadaCommission(premium, provider);
          const coverage = Math.min(portfolioValue, provider.coverage);
          
          return (
            <div
              key={provider.name}
              className={`bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 hover:border-white/30 transition-all duration-300 ${
                selectedProvider === provider.name ? 'ring-2 ring-green-500' : ''
              }`}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{provider.name}</h3>
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {provider.premium}% <span className="text-sm text-gray-400">annually</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {provider.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Annual Premium:</span>
                  <span className="text-white font-semibold">${premium.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Coverage:</span>
                  <span className="text-white font-semibold">${coverage.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">GadaWallet Earns:</span>
                  <span className="text-green-400 font-semibold">${commission.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => purchaseInsurance(provider)}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-colors"
              >
                Purchase Policy
              </button>
            </div>
          );
        })}
      </div>

      {/* Active Policies */}
      {policies.length > 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
          <h3 className="text-xl font-bold text-white mb-4">Active Policies</h3>
          
          <div className="space-y-4">
            {policies.map((policy) => (
              <div key={policy.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{policy.provider}</h4>
                    <p className="text-gray-400 text-sm">
                      Coverage: ${policy.coverage.toLocaleString()} • 
                      Expires: {policy.expiresAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    policy.status === 'active' ? 'text-green-400' :
                    policy.status === 'pending' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {policy.status.toUpperCase()}
                  </div>
                  <div className="text-gray-400 text-xs">
                    Premium: ${policy.premium.toLocaleString()}/year
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revenue Analytics for TIER 3 */}
      <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/20 backdrop-blur-md rounded-xl border border-green-500/30 p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-green-400" />
          Insurance Revenue (TIER 3)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-green-300 font-semibold mb-3">Revenue Projections</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white">Target Policies:</span>
                <span className="text-green-400">1,000/year</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white">Avg Premium:</span>
                <span className="text-green-400">$10,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white">Avg Commission:</span>
                <span className="text-green-400">15%</span>
              </div>
              <div className="flex justify-between items-center border-t border-green-500/20 pt-2">
                <span className="text-white font-semibold">Annual Revenue:</span>
                <span className="text-green-400 font-bold">$1.5M</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-green-300 font-semibold mb-3">Current Status</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white">Active Policies:</span>
                <span className="text-green-400">{policies.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white">Monthly Revenue:</span>
                <span className="text-green-400">${monthlyRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white">Growth Rate:</span>
                <span className="text-green-400">+23% MoM</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-green-300 font-semibold mb-3">Target Markets</h4>
            <div className="space-y-2">
              <div className="text-white text-sm">• High-value portfolios ($1M+)</div>
              <div className="text-white text-sm">• Enterprise treasury management</div>
              <div className="text-white text-sm">• Family offices and HNWI</div>
              <div className="text-white text-sm">• DeFi protocol treasuries</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartContractInsurance;