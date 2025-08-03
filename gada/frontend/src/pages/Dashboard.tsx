import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wallet, 
  Users, 
  Coins, 
  Shield, 
  Activity, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  Plus,
  Clock,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const [isConnected] = useState(false);
  const [showBalance, setShowBalance] = useState(false);
  const [heirs] = useState([
    { id: 1, name: 'Sarah Johnson', address: '0x1234...5678', percentage: 60, status: 'active' },
    { id: 2, name: 'Michael Chen', address: '0x8765...4321', percentage: 40, status: 'active' }
  ]);
  const [assets] = useState([
    { id: 1, name: 'SOL', amount: '25.5', value: '$2,550', change: '+5.2%' },
    { id: 2, name: 'USDC', amount: '1,000', value: '$1,000', change: '+0.1%' },
    { id: 3, name: 'RAY', amount: '150', value: '$450', change: '+12.3%' }
  ]);

  const totalValue = assets.reduce((sum, asset) => sum + parseFloat(asset.value.replace('$', '').replace(',', '')), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Welcome back, <span className="gradient-text">User</span>
          </h1>
          <p className="text-white/70 text-lg">
            Manage your digital legacy and monitor your assets
          </p>
        </div>

        {/* Connection Status */}
        {!isConnected ? (
          <div className="glass-card p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Wallet Not Connected</h3>
                  <p className="text-white/70">Connect your wallet to access your dashboard</p>
                </div>
              </div>
              <button className="btn-primary">
                <Wallet className="w-5 h-5 mr-2" />
                Connect Wallet
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Coins className="w-6 h-6 text-blue-400" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Total Value</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-white">
                        {showBalance ? `$${totalValue.toLocaleString()}` : '****'}
                      </span>
                      <button
                        onClick={() => setShowBalance(!showBalance)}
                        className="text-white/60 hover:text-white transition-colors"
                      >
                        {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-400" />
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-white/70 text-sm">Active Heirs</p>
                  <p className="text-2xl font-bold text-white">{heirs.length}</p>
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-green-400" />
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-white/70 text-sm">Plan Status</p>
                  <p className="text-2xl font-bold text-white">Active</p>
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-orange-400" />
                  </div>
                  <Activity className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-white/70 text-sm">Last Activity</p>
                  <p className="text-2xl font-bold text-white">2 days</p>
                </div>
              </div>
            </div>

            {/* Assets Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">Your Assets</h3>
                  <Link to="/batch-transfer" className="btn-secondary text-sm px-4 py-2">
                    <Plus className="w-4 h-4 mr-2" />
                    Transfer
                  </Link>
                </div>
                <div className="space-y-4">
                  {assets.map((asset) => (
                    <div key={asset.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                          <Coins className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{asset.name}</p>
                          <p className="text-white/60 text-sm">{asset.amount} tokens</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">{asset.value}</p>
                        <p className="text-green-400 text-sm">{asset.change}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">Your Heirs</h3>
                  <Link to="/add-heir" className="btn-secondary text-sm px-4 py-2">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Heir
                  </Link>
                </div>
                <div className="space-y-4">
                  {heirs.map((heir) => (
                    <div key={heir.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{heir.name}</p>
                          <p className="text-white/60 text-sm">{heir.address}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">{heir.percentage}%</p>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <p className="text-green-400 text-sm">Active</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link to="/add-heir" className="glass-card-hover p-4 rounded-xl text-center group">
                  <Users className="w-8 h-8 text-purple-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="text-white font-medium mb-1">Add Heir</h4>
                  <p className="text-white/60 text-sm">Designate new beneficiaries</p>
                </Link>

                <Link to="/claim-assets" className="glass-card-hover p-4 rounded-xl text-center group">
                  <Coins className="w-8 h-8 text-green-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="text-white font-medium mb-1">Claim Assets</h4>
                  <p className="text-white/60 text-sm">Access inherited assets</p>
                </Link>

                <Link to="/update-activity" className="glass-card-hover p-4 rounded-xl text-center group">
                  <Activity className="w-8 h-8 text-blue-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="text-white font-medium mb-1">Update Activity</h4>
                  <p className="text-white/60 text-sm">Maintain account activity</p>
                </Link>

                <Link to="/batch-transfer" className="glass-card-hover p-4 rounded-xl text-center group">
                  <TrendingUp className="w-8 h-8 text-orange-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="text-white font-medium mb-1">Batch Transfer</h4>
                  <p className="text-white/60 text-sm">Transfer multiple assets</p>
                </Link>
              </div>
            </div>

            {/* Security Status */}
            <div className="glass-card p-6 mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Security Status</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">Secure</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-green-500/10 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-white font-medium text-sm">Wallet Connected</p>
                    <p className="text-white/60 text-xs">Secure connection active</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-500/10 rounded-lg">
                  <Lock className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-white font-medium text-sm">Smart Contracts</p>
                    <p className="text-white/60 text-xs">Verified and secure</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-500/10 rounded-lg">
                  <Shield className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-white font-medium text-sm">Inheritance Plan</p>
                    <p className="text-white/60 text-xs">Active and protected</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 