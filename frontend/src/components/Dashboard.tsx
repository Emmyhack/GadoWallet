import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { InheritanceManager } from './InheritanceManager';
import { BatchTransfer } from './BatchTransfer';
import { ActivityManager } from './ActivityManager';
import { ClaimAssets } from './ClaimAssets';
import { WalletStats } from './WalletStats';
import { Shield, Send, Clock, Gift, BarChart3, Wallet, Activity as ActivityIcon, Sparkles, TrendingUp, Zap } from 'lucide-react';
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
    <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Fixed Layout Container */}
      <div className="relative h-full flex flex-col">
        {/* Compact Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 backdrop-blur-xl border border-white/20">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
                  Gada Wallet
                </h1>
                <p className="text-sm text-gray-400">Digital Asset Management</p>
              </div>
            </div>
            
            {/* Status Indicators */}
            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-gray-300">Live</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-gray-300">Secure</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area with Sidebar */}
        <div className="flex-1 flex min-h-0">
          {/* Sidebar Navigation */}
          <div className="flex-shrink-0 w-80 bg-white/5 backdrop-blur-xl border-r border-white/10 p-4 overflow-y-auto">
            <div className="space-y-2">
              {tabs.map((tab, index) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 text-left ${
                      isActive
                        ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-400/30 text-white shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-all duration-300 ${
                      isActive 
                        ? `bg-gradient-to-br ${tab.color} text-white shadow-lg` 
                        : 'bg-white/10 text-gray-300'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{tab.name}</div>
                      <div className="text-xs opacity-75 truncate">{tab.description}</div>
                    </div>
                    {isActive && (
                      <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Content Header */}
            <div className="flex-shrink-0 px-6 py-4 border-b border-white/10">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${activeTabData?.color} shadow-lg`}>
                  {activeTabData?.icon && <activeTabData.icon className="w-6 h-6 text-white" />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {activeTabData?.name}
                  </h2>
                  <p className="text-gray-300">
                    {activeTabData?.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <div key={activeTab} className="animate-fade-in">
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}