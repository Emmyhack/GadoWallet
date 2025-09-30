import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { getProgramId } from '../lib/config';
import { PublicKey, Connection } from '@solana/web3.js';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { AnchorProvider } from '@project-serum/anchor';

interface AnalyticsData {
  totalRevenue: number;
  totalFees: number;
  activeUsers: number;
  premiumUsers: number;
  inheritanceExecutions: number;
  averageFee: number;
  monthlyGrowth: number;
}

interface RevenueData {
  date: string;
  revenue: number;
  fees: number;
  users: number;
}

const Analytics: React.FC = () => {
  const { publicKey } = useWallet();
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalFees: 0,
    activeUsers: 0,
    premiumUsers: 0,
    inheritanceExecutions: 0,
    averageFee: 0,
    monthlyGrowth: 0,
  });
  const [revenueHistory, setRevenueHistory] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    if (publicKey && anchorWallet) {
      loadAnalytics();
    }
  }, [publicKey, anchorWallet, timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const provider = new AnchorProvider(connection, anchorWallet!, { commitment: 'confirmed' });
      
      // Get platform config to check admin privileges
      const [platformPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("platform")],
        getProgramId()
      );

      try {
        const platformData = await connection.getAccountInfo(platformPda);
        if (!platformData) {
          console.log("Platform not initialized");
          return;
        }

        // Mock analytics data for demonstration
        // In a real implementation, you would fetch this from your program accounts
        const mockData: AnalyticsData = {
          totalRevenue: 2547.89,
          totalFees: 45.32,
          activeUsers: 156,
          premiumUsers: 23,
          inheritanceExecutions: 89,
          averageFee: 0.51,
          monthlyGrowth: 15.2,
        };

        const mockHistory: RevenueData[] = generateMockHistory(timeRange);

        setAnalyticsData(mockData);
        setRevenueHistory(mockHistory);
      } catch (error) {
        console.error("Error loading analytics:", error);
      }
    } catch (error) {
      console.error("Error initializing analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockHistory = (range: string): RevenueData[] => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
    const history: RevenueData[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      history.push({
        date: date.toISOString().split('T')[0],
        revenue: Math.random() * 100 + 50,
        fees: Math.random() * 5 + 1,
        users: Math.floor(Math.random() * 20) + 5,
      });
    }
    
    return history;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (!publicKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Analytics Dashboard</h2>
          <p className="text-purple-200">Please connect your wallet to view analytics</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-purple-200">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
            <p className="text-purple-200">Platform performance and revenue metrics</p>
          </div>
          
          <div className="flex gap-2 mt-4 sm:mt-0">
            {(['7d', '30d', '90d', '1y'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  timeRange === range
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-white/10 text-purple-200 hover:bg-white/20'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-purple-200 text-sm font-medium">Total Revenue</h3>
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <span className="text-green-400 text-lg">💰</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-2">
              {formatCurrency(analyticsData.totalRevenue)}
            </div>
            <div className="text-green-400 text-sm">
              {formatPercentage(analyticsData.monthlyGrowth)} from last month
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-purple-200 text-sm font-medium">Platform Fees</h3>
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <span className="text-blue-400 text-lg">💳</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-2">
              {formatCurrency(analyticsData.totalFees)}
            </div>
            <div className="text-blue-400 text-sm">
              Avg: {formatCurrency(analyticsData.averageFee)} per transaction
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-purple-200 text-sm font-medium">Active Users</h3>
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <span className="text-purple-400 text-lg">👥</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-2">
              {analyticsData.activeUsers.toLocaleString()}
            </div>
            <div className="text-purple-400 text-sm">
              {analyticsData.premiumUsers} premium users
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-purple-200 text-sm font-medium">Executions</h3>
              <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <span className="text-orange-400 text-lg">⚡</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-2">
              {analyticsData.inheritanceExecutions}
            </div>
            <div className="text-orange-400 text-sm">
              Inheritance executions completed
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-6">Revenue Trends</h3>
          <div className="h-64 relative">
            <div className="absolute inset-0 flex items-end justify-between px-4">
              {revenueHistory.slice(-20).map((data, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center"
                  style={{ width: `${100 / Math.min(revenueHistory.length, 20)}%` }}
                >
                  <div
                    className="bg-gradient-to-t from-purple-600 to-blue-500 rounded-t-sm w-3 transition-all hover:opacity-80"
                    style={{
                      height: `${(data.revenue / Math.max(...revenueHistory.map(d => d.revenue))) * 200}px`,
                      minHeight: '4px'
                    }}
                  ></div>
                  <div className="text-xs text-purple-300 mt-2 rotate-45 origin-left">
                    {new Date(data.date).getMonth() + 1}/{new Date(data.date).getDate()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">User Growth</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-purple-200">Free Users</span>
                <span className="text-white font-semibold">
                  {analyticsData.activeUsers - analyticsData.premiumUsers}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-200">Premium Users</span>
                <span className="text-white font-semibold">{analyticsData.premiumUsers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-200">Conversion Rate</span>
                <span className="text-green-400 font-semibold">
                  {((analyticsData.premiumUsers / analyticsData.activeUsers) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Fee Analysis</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-purple-200">Average Fee Rate</span>
                <span className="text-white font-semibold">
                  {(analyticsData.averageFee * 100).toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-200">Total Transactions</span>
                <span className="text-white font-semibold">
                  {analyticsData.inheritanceExecutions}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-200">Revenue per Transaction</span>
                <span className="text-green-400 font-semibold">
                  {formatCurrency(analyticsData.totalRevenue / analyticsData.inheritanceExecutions)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;