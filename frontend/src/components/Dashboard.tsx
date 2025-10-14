import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { BatchTransfer } from './BatchTransfer';
import { ActivityManager } from './SmartActivityManager';
import { WalletStats } from './WalletStats';
import Analytics from './Analytics';
import { Shield, Send, Clock, BarChart3, Wallet, Activity as ActivityIcon, Sparkles, Crown, Zap, Settings } from 'lucide-react';
import { Portfolio } from './Portfolio';
import { SendReceive } from './SendReceive';
import { Transactions } from './Transactions';
import { Landing } from './Landing';
import SmartWalletManager from './SmartWalletManager';
import SubscriptionManager from './SubscriptionManager';


export function Dashboard() {
  const { connected } = useWallet();
  const [activeTab, setActiveTab] = useState('smart-wallet');

  const tabs = [
    {
      id: 'portfolio',
      name: 'Portfolio',
      icon: Wallet,
      description: 'Wallet overview and assets',
      color: 'from-blue-500 to-cyan-400',
      bgColor: 'bg-blue-500/10 border-blue-500/20'
    },
    {
      id: 'smart-wallet',
      name: 'Smart Wallet',
      icon: Sparkles,
      description: 'Advanced inheritance management',
      color: 'from-yellow-500 to-amber-400',
      bgColor: 'bg-yellow-500/10 border-yellow-500/20'
    },
    {
      id: 'transactions',
      name: 'Transactions',
      icon: Send,
      description: 'Send, receive, and batch transfers',
      color: 'from-emerald-500 to-teal-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
      id: 'activity',
      name: 'Activity',
      icon: ActivityIcon,
      description: 'Transaction history and updates',
      color: 'from-amber-500 to-orange-400',
      bgColor: 'bg-amber-500/10 border-amber-500/20'
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: BarChart3,
      description: 'Wallet statistics and insights',
      color: 'from-indigo-500 to-purple-400',
      bgColor: 'bg-indigo-500/10 border-indigo-500/20'
    },
    {
      id: 'subscription',
      name: 'Subscription',
      icon: Crown,
      description: 'Manage your plan and billing',
      color: 'from-purple-500 to-pink-400',
      bgColor: 'bg-purple-500/10 border-purple-500/20'
    },

  ];

  if (!connected) {
    return <Landing />;
  }

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-500/20 via-purple-500/15 to-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-violet-500/15 via-fuchsia-500/10 to-pink-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative flex h-screen">
        {/* Sidebar */}
        <div className="w-72 bg-white/3 backdrop-blur-xl border-r border-white/10 overflow-y-auto">
          <div className="p-6">
            {/* Navigation */}
            <div className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full group flex items-center space-x-4 px-4 py-4 rounded-2xl transition-all duration-300 text-left relative overflow-hidden ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20 border border-blue-400/30 text-white shadow-2xl'
                        : 'text-gray-300 hover:text-white hover:bg-white/8 border border-transparent hover:border-white/10'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 via-purple-400 to-cyan-400 rounded-r-full"></div>
                    )}
                    
                    <div className={`relative p-3 rounded-xl transition-all duration-300 ${
                      isActive 
                        ? `bg-gradient-to-br ${tab.color} text-white shadow-xl` 
                        : 'bg-white/8 text-gray-300 group-hover:bg-white/12'
                    }`}>
                      <Icon className="w-5 h-5" />
                      {isActive && (
                        <div className="absolute inset-0 bg-white/20 rounded-xl animate-pulse"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold truncate ${isActive ? 'text-white' : 'text-gray-200'}`}>
                        {tab.name}
                      </div>
                      <div className={`text-xs truncate transition-all duration-300 ${
                        isActive ? 'text-blue-200' : 'text-gray-400 group-hover:text-gray-300'
                      }`}>
                        {tab.description}
                      </div>
                    </div>
                    
                    {isActive && (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center space-x-3 px-4 py-3 bg-white/5 rounded-xl border border-white/10">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Secure</div>
                  <div className="text-xs text-gray-400">Blockchain Protected</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${activeTabData?.color || 'from-gray-500 to-gray-600'}`}>
                  {activeTabData?.icon && <activeTabData.icon className="w-6 h-6 text-white" />}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{activeTabData?.name}</h1>
                  <p className="text-gray-300">{activeTabData?.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">Live</span>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-transparent to-white/5">
            <div className="p-6">
              <div key={activeTab} className="animate-fade-in">
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                  <div className="p-6">
                    {activeTab === 'portfolio' && <Portfolio />}
                    {activeTab === 'smart-wallet' && <SmartWalletManager />}
                    {activeTab === 'transactions' && (
                      <div className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                              <Send className="w-5 h-5 text-emerald-400" />
                              Send & Receive
                            </h3>
                            <SendReceive />
                          </div>
                          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                              <Send className="w-5 h-5 text-blue-400" />
                              Batch Transfer
                            </h3>
                            <BatchTransfer />
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-teal-400" />
                            Transaction History
                          </h3>
                          <Transactions />
                        </div>
                      </div>
                    )}
                    {activeTab === 'activity' && <ActivityManager />}
                    {activeTab === 'analytics' && <Analytics />}
                    {activeTab === 'subscription' && <SubscriptionManager />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;