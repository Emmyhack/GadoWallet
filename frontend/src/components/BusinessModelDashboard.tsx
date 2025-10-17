import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { TrendingUp, DollarSign, Users, Shield, Bot, Crown, Target, Zap } from 'lucide-react';

interface RevenueStream {
  tier: string;
  name: string;
  currentRevenue: number;
  projectedRevenue: number;
  growthRate: number;
  status: 'active' | 'developing' | 'planned';
  icon: React.ReactNode;
  color: string;
}

interface BusinessMetrics {
  totalARR: number;
  monthlyGrowth: number;
  userBase: {
    free: number;
    premium: number;
    enterprise: number;
  };
  conversionRate: number;
  ltv: number;
  cac: number;
}

const BusinessModelDashboard: React.FC = () => {
  const { connected } = useWallet();
  
  const [metrics, setMetrics] = useState<BusinessMetrics>({
    totalARR: 0,
    monthlyGrowth: 0,
    userBase: {
      free: 0,
      premium: 0,
      enterprise: 0
    },
    conversionRate: 0,
    ltv: 0,
    cac: 0
  });

  const revenueStreams: RevenueStream[] = [
    {
      tier: 'TIER 1',
      name: 'Platform Transaction Fees',
      currentRevenue: 1_200_000,
      projectedRevenue: 1_500_000,
      growthRate: 25,
      status: 'active',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'from-green-600 to-emerald-500'
    },
    {
      tier: 'TIER 1',
      name: 'Premium Subscriptions',
      currentRevenue: 180_000,
      projectedRevenue: 300_000,
      growthRate: 67,
      status: 'active',
      icon: <Crown className="w-6 h-6" />,
      color: 'from-purple-600 to-pink-500'
    },
    {
      tier: 'TIER 2',
      name: 'B2B API Services',
      currentRevenue: 500_000,
      projectedRevenue: 800_000,
      growthRate: 60,
      status: 'developing',
      icon: <Target className="w-6 h-6" />,
      color: 'from-blue-600 to-cyan-500'
    },
    {
      tier: 'TIER 3',
      name: 'Premium Keeper Bot',
      currentRevenue: 45_000,
      projectedRevenue: 120_000,
      growthRate: 167,
      status: 'active',
      icon: <Bot className="w-6 h-6" />,
      color: 'from-indigo-600 to-purple-500'
    },
    {
      tier: 'TIER 3',
      name: 'Insurance Commissions',
      currentRevenue: 75_000,
      projectedRevenue: 200_000,
      growthRate: 167,
      status: 'active',
      icon: <Shield className="w-6 h-6" />,
      color: 'from-emerald-600 to-teal-500'
    },
    {
      tier: 'TIER 4+',
      name: 'Advanced Services',
      currentRevenue: 0,
      projectedRevenue: 380_000,
      growthRate: 0,
      status: 'planned',
      icon: <Zap className="w-6 h-6" />,
      color: 'from-orange-600 to-red-500'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'developing': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'planned': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const totalCurrentRevenue = revenueStreams.reduce((sum, stream) => sum + stream.currentRevenue, 0);
  const totalProjectedRevenue = revenueStreams.reduce((sum, stream) => sum + stream.projectedRevenue, 0);

  if (!connected) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Business Model Dashboard</h3>
          <p className="text-gray-400">Connect your wallet to view business metrics</p>
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
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">Business Model Dashboard</h2>
            <p className="text-gray-300 font-medium">Revenue streams and growth metrics</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-400">Current ARR</div>
          <div className="text-2xl font-bold text-green-400">
            ${totalCurrentRevenue.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-green-400 text-sm font-semibold">+{metrics.monthlyGrowth}%</span>
          </div>
          <h3 className="text-white font-semibold">Monthly Growth</h3>
          <p className="text-gray-400 text-sm">Revenue growth rate</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-blue-400 text-sm font-semibold">
              {(metrics.userBase.free + metrics.userBase.premium + metrics.userBase.enterprise).toLocaleString()}
            </span>
          </div>
          <h3 className="text-white font-semibold">Total Users</h3>
          <p className="text-gray-400 text-sm">Active platform users</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-5 h-5 text-purple-400" />
            <span className="text-purple-400 text-sm font-semibold">{metrics.conversionRate}%</span>
          </div>
          <h3 className="text-white font-semibold">Conversion Rate</h3>
          <p className="text-gray-400 text-sm">Free to paid</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 text-sm font-semibold">
              {(metrics.ltv / metrics.cac).toFixed(1)}:1
            </span>
          </div>
          <h3 className="text-white font-semibold">LTV:CAC Ratio</h3>
          <p className="text-gray-400 text-sm">Unit economics</p>
        </div>
      </div>

      {/* Revenue Streams */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
        <h3 className="text-xl font-bold text-white mb-6">Revenue Streams by Tier</h3>
        
        <div className="space-y-4">
          {revenueStreams.map((stream, index) => {
            const growthAmount = stream.projectedRevenue - stream.currentRevenue;
            const progressPercentage = stream.currentRevenue / stream.projectedRevenue * 100;
            
            return (
              <div key={index} className="bg-white/5 rounded-lg border border-white/10 p-4 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stream.color}`}>
                      {stream.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="text-white font-semibold">{stream.name}</h4>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-600/50 text-gray-300">
                          {stream.tier}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-400">
                          Current: ${stream.currentRevenue.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-400">
                          Target: ${stream.projectedRevenue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(stream.status)}`}>
                      {stream.status.toUpperCase()}
                    </div>
                    {stream.growthRate > 0 && (
                      <div className="text-sm text-green-400 mt-1">
                        +{stream.growthRate}% growth
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                  <div 
                    className={`h-2 bg-gradient-to-r ${stream.color} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">
                    Progress: {progressPercentage.toFixed(1)}%
                  </span>
                  <span className="text-gray-400">
                    Growth needed: ${growthAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Revenue Projection Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current vs Projected */}
        <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/20 backdrop-blur-md rounded-xl border border-green-500/30 p-6">
          <h3 className="text-xl font-bold text-white mb-4">Revenue Targets</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-green-300">Current ARR:</span>
              <span className="text-green-400 font-bold text-lg">
                ${totalCurrentRevenue.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-300">Projected ARR:</span>
              <span className="text-green-400 font-bold text-lg">
                ${totalProjectedRevenue.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-green-500/20 pt-3">
              <span className="text-green-300">Growth Required:</span>
              <span className="text-green-400 font-bold text-xl">
                ${(totalProjectedRevenue - totalCurrentRevenue).toLocaleString()}
              </span>
            </div>
            <div className="text-center">
              <span className="text-green-200 text-sm">
                {((totalProjectedRevenue / totalCurrentRevenue - 1) * 100).toFixed(1)}% total growth needed
              </span>
            </div>
          </div>
        </div>

        {/* User Base Breakdown */}
        <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/20 backdrop-blur-md rounded-xl border border-blue-500/30 p-6">
          <h3 className="text-xl font-bold text-white mb-4">User Base</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-blue-300">Free Users:</span>
              <span className="text-blue-400 font-semibold">
                {metrics.userBase.free.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-300">Premium Users:</span>
              <span className="text-purple-400 font-semibold">
                {metrics.userBase.premium.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-300">Enterprise Users:</span>
              <span className="text-yellow-400 font-semibold">
                {metrics.userBase.enterprise.toLocaleString()}
              </span>
            </div>
            <div className="border-t border-blue-500/20 pt-3">
              <div className="text-center">
                <span className="text-blue-200 text-sm">
                  Revenue per user: ${(totalCurrentRevenue / (metrics.userBase.free + metrics.userBase.premium + metrics.userBase.enterprise)).toFixed(0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessModelDashboard;