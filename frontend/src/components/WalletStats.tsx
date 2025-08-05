import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { BarChart3, Wallet, Shield, Users, TrendingUp, Activity } from 'lucide-react';

interface WalletStatsData {
  balance: number;
  heirsCount: number;
  totalInheritance: number;
  lastActivity: string;
  activeHeirs: number;
}

export function WalletStats() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [stats, setStats] = useState<WalletStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!publicKey || !connection) return;

      try {
        setIsLoading(true);

        // Get wallet balance
        const balance = await connection.getBalance(publicKey);
        const balanceInSOL = balance / LAMPORTS_PER_SOL;

        // Mock data for demonstration
        // In a real implementation, you would query the blockchain for actual data
        const mockStats: WalletStatsData = {
          balance: balanceInSOL,
          heirsCount: 3,
          totalInheritance: 2.5,
          lastActivity: new Date().toISOString(),
          activeHeirs: 2
        };

        setStats(mockStats);
      } catch (error) {
        console.error('Error fetching wallet stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [publicKey, connection]);

  const formatSOL = (amount: number) => {
    return amount.toFixed(4);
  };

  const getTimeSinceLastActivity = (dateString: string) => {
    const lastActivity = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  if (!publicKey) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Wallet Connected</h3>
        <p className="text-gray-600">Connect your wallet to view statistics</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading wallet statistics...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Stats</h3>
        <p className="text-gray-600">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-gray-900 rounded-md flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Wallet Statistics</h2>
          <p className="text-gray-600">Overview of your wallet and inheritance status</p>
        </div>
      </div>

      {/* Wallet Address */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Wallet Information</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Address:</span>
            <span className="font-mono text-sm text-gray-900 break-all">{publicKey.toString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Balance:</span>
            <span className="font-semibold text-gray-900">{formatSOL(stats.balance)} SOL</span>
          </div>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-2xl font-semibold text-gray-900">{formatSOL(stats.balance)}</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">SOL Balance</h4>
          <p className="text-sm text-gray-600">Current wallet balance</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-2xl font-semibold text-gray-900">{stats.heirsCount}</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Total Heirs</h4>
          <p className="text-sm text-gray-600">Designated beneficiaries</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-2xl font-semibold text-gray-900">{formatSOL(stats.totalInheritance)}</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Total Inheritance</h4>
          <p className="text-sm text-gray-600">SOL designated for heirs</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-2xl font-semibold text-gray-900">{stats.activeHeirs}</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">Active Heirs</h4>
          <p className="text-sm text-gray-600">Currently claimable</p>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Wallet Activity Updated</p>
              <p className="text-xs text-gray-600">{getTimeSinceLastActivity(stats.lastActivity)}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Heir Designation</p>
              <p className="text-xs text-gray-600">3 heirs designated for inheritance</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Inheritance Setup</p>
              <p className="text-xs text-gray-600">2.5 SOL allocated for inheritance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>View History</span>
          </button>
          
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Manage Heirs</span>
          </button>
          
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <Activity className="w-4 h-4" />
            <span>Update Activity</span>
          </button>
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Wallet Security</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• All transactions require wallet signature</li>
            <li>• Private keys never leave your wallet</li>
            <li>• Inheritance contracts are immutable</li>
            <li>• Activity updates prevent premature claims</li>
          </ul>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Inheritance Status</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• {stats.heirsCount} heirs designated</li>
            <li>• {formatSOL(stats.totalInheritance)} SOL allocated</li>
            <li>• {stats.activeHeirs} heirs can claim</li>
            <li>• Last activity: {getTimeSinceLastActivity(stats.lastActivity)}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}