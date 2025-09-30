import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { InheritanceManager } from './InheritanceManager';
import { BatchTransfer } from './BatchTransfer';
import { ActivityManager } from './ActivityManager';
import { ClaimAssets } from './ClaimAssets';
import { WalletStats } from './WalletStats';
import { Shield, Send, Clock, Gift, BarChart3, Wallet, Activity as ActivityIcon, Sparkles, TrendingUp, Zap, Crown } from 'lucide-react';
import { Portfolio } from './Portfolio';
import { SendReceive } from './SendReceive';
import { Transactions } from './Transactions';
import { Receive } from './Receive';
import { SignMessage } from './SignMessage';
import { Landing } from './Landing';
import SmartWalletManager from './SmartWalletManager';
import Analytics from './Analytics';
import EmergencyControls from './EmergencyControls';
import PlatformStatus from './PlatformStatus';
import SubscriptionManager from './SubscriptionManager';
import { useTranslation } from 'react-i18next';

export function Dashboard() {
  const { connected } = useWallet();
  const [activeTab, setActiveTab] = useState('inheritance');
  const { t } = useTranslation();

  const tabs = [
    {
      id: 'portfolio',
      name: t('wallet'),
      icon: Wallet,
      description: t('wallet'),
      color: 'from-blue-500 to-cyan-400',
      bgColor: 'bg-blue-500/10 border-blue-500/20'
    },
    {
      id: 'inheritance',
      name: t('inheritance'),
      icon: Shield,
      description: t('inheritance'),
      color: 'from-violet-500 to-purple-400',
      bgColor: 'bg-violet-500/10 border-violet-500/20'
    },
    {
      id: 'transfer',
      name: t('batchTransfer'),
      icon: Send,
      description: t('batchTransfer'),
      color: 'from-emerald-500 to-teal-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
      id: 'activity',
      name: t('activity'),
      icon: Clock,
      description: t('activity'),
      color: 'from-orange-500 to-amber-400',
      bgColor: 'bg-orange-500/10 border-orange-500/20'
    },
    {
      id: 'claim',
      name: t('claimAssets'),
      icon: Gift,
      description: t('claimAssets'),
      color: 'from-rose-500 to-pink-400',
      bgColor: 'bg-rose-500/10 border-rose-500/20'
    },
    {
      id: 'stats',
      name: t('statistics'),
      icon: TrendingUp,
      description: t('statistics'),
      color: 'from-indigo-500 to-blue-400',
      bgColor: 'bg-indigo-500/10 border-indigo-500/20'
    },
    {
      id: 'send',
      name: t('sendReceive'),
      icon: Zap,
      description: t('sendReceive'),
      color: 'from-yellow-500 to-orange-400',
      bgColor: 'bg-yellow-500/10 border-yellow-500/20'
    },
    {
      id: 'txs',
      name: t('transactions'),
      icon: ActivityIcon,
      description: t('transactions'),
      color: 'from-green-500 to-emerald-400',
      bgColor: 'bg-green-500/10 border-green-500/20'
    },
    {
      id: 'receive',
      name: t('receive'),
      icon: Sparkles,
      description: t('receive'),
      color: 'from-fuchsia-500 to-pink-400',
      bgColor: 'bg-fuchsia-500/10 border-fuchsia-500/20'
    },
    {
      id: 'sign',
      name: t('signMessage'),
      icon: Shield,
      description: t('signMessage'),
      color: 'from-slate-500 to-gray-400',
      bgColor: 'bg-slate-500/10 border-slate-500/20'
    },
    {
      id: 'smart-wallet',
      name: 'Smart Wallet',
      icon: Wallet,
      description: 'Automated inheritance with PDA wallets',
      color: 'from-purple-500 to-indigo-400',
      bgColor: 'bg-purple-500/10 border-purple-500/20'
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: TrendingUp,
      description: 'Platform metrics and revenue analytics',
      color: 'from-emerald-500 to-teal-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
      id: 'emergency',
      name: 'Emergency',
      icon: Shield,
      description: 'Platform administration and emergency controls',
      color: 'from-red-500 to-orange-400',
      bgColor: 'bg-red-500/10 border-red-500/20'
    },
    {
      id: 'platform-status',
      name: 'Platform Setup',
      icon: Shield,
      description: 'Platform initialization and account setup',
      color: 'from-gray-500 to-slate-400',
      bgColor: 'bg-gray-500/10 border-gray-500/20'
    }
  ];

  if (!connected) {
    return <Landing />;
  }

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 overflow-hidden">
      {/* Professional Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-500/20 via-purple-500/15 to-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-violet-500/15 via-fuchsia-500/10 to-pink-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Fixed Layout Container */}
      <div className="relative h-full flex flex-col">
        {/* Professional Header */}
        <div className="flex-shrink-0 bg-white/5 backdrop-blur-xl border-b border-white/10">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 shadow-2xl">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                    Gado Wallet
                  </h1>
                  <p className="text-gray-300 font-medium">Professional Web3 Inheritance Platform</p>
                </div>
              </div>
              
              {/* Professional Status Bar */}
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-6 px-6 py-3 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-200">Network: Live</span>
                  </div>
                  <div className="w-px h-4 bg-white/20"></div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-200">Security: Active</span>
                  </div>
                  <div className="w-px h-4 bg-white/20"></div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-200">Sync: Real-time</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area with Professional Sidebar */}
        <div className="flex-1 flex min-h-0">
          {/* Professional Sidebar Navigation */}
          <div className="flex-shrink-0 w-80 bg-white/3 backdrop-blur-xl border-r border-white/10 overflow-y-auto">
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Navigation</h3>
              </div>
              
              <div className="space-y-2">
                {tabs.map((tab, index) => {
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
                      {/* Active indicator */}
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
              
              {/* Professional Footer in Sidebar */}
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

          {/* Professional Content Area */}
          <div className="flex-1 flex flex-col min-w-0 bg-white/2 backdrop-blur-sm">
            {/* Professional Content Header */}
            <div className="flex-shrink-0 bg-white/5 backdrop-blur-md border-b border-white/10">
              <div className="px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className={`relative p-4 rounded-2xl bg-gradient-to-br ${activeTabData?.color} shadow-2xl`}>
                      {activeTabData?.icon && <activeTabData.icon className="w-7 h-7 text-white" />}
                      <div className="absolute inset-0 bg-white/20 rounded-2xl animate-pulse"></div>
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                        {activeTabData?.name}
                      </h2>
                      <p className="text-gray-300 font-medium mt-1">
                        {activeTabData?.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Action Indicators */}
                  <div className="flex items-center space-x-4">
                    <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-gray-200">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Scrollable Content */}
            <div className="flex-1 overflow-y-auto bg-gradient-to-b from-transparent to-white/5">
              <div className="p-8">
                <div key={activeTab} className="animate-fade-in">
                  <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                    <div className="p-8">
                      {activeTab === 'portfolio' && <Portfolio />}
                      {activeTab === 'inheritance' && <InheritanceManager />}
                      {activeTab === 'transfer' && <BatchTransfer />}
                      {activeTab === 'activity' && <ActivityManager />}
                      {activeTab === 'claim' && <ClaimAssets />}
                      {activeTab === 'stats' && <WalletStats />}
                      {activeTab === 'send' && <SendReceive />}
                      {activeTab === 'txs' && <Transactions />}
                      {activeTab === 'receive' && <Receive />}
                      {activeTab === 'sign' && <SignMessage />}
                      {activeTab === 'smart-wallet' && <SmartWalletManager />}
                      {activeTab === 'analytics' && <Analytics />}
                      {activeTab === 'emergency' && <EmergencyControls />}
                      {activeTab === 'platform-status' && <PlatformStatus />}
                      {activeTab === 'subscription' && <SubscriptionManager />}
                    </div>
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
