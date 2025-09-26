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
    }
  ];

  if (!connected) {
    return <Landing />;
  }

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 backdrop-blur">
            <Wallet className="w-8 h-8 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-600 bg-clip-text text-transparent">
              Gada Wallet Functions
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your Solana inheritance and transactions</p>
          </div>
        </div>
      </div>

      {/* Function Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <div
              key={tab.id}
              className={`group relative cursor-pointer transition-all duration-300 animate-fade-in ${
                isActive ? 'scale-105' : 'hover:scale-102'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => setActiveTab(tab.id)}
            >
              {/* Card Background with Glassmorphism */}
              <div
                className={`relative p-6 rounded-2xl border backdrop-blur-xl transition-all duration-300 ${
                  isActive
                    ? `${tab.bgColor} shadow-2xl shadow-current/25`
                    : 'bg-white/60 dark:bg-gray-900/40 border-gray-200/50 dark:border-white/10 hover:bg-white/80 dark:hover:bg-gray-800/60 shadow-lg hover:shadow-xl'
                }`}
              >
                {/* Active Tab Glow Effect */}
                {isActive && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r opacity-20 blur-xl transition-opacity duration-300 group-hover:opacity-30"
                       style={{ background: `linear-gradient(135deg, ${tab.color.replace('from-', '').replace(' to-', ', ')})` }} />
                )}

                {/* Icon Container */}
                <div className={`relative mb-4 p-3 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? `bg-gradient-to-br ${tab.color} text-white shadow-lg` 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-700'
                }`}>
                  <Icon className={`w-6 h-6 transition-transform duration-300 ${
                    isActive ? 'scale-110' : 'group-hover:scale-105'
                  }`} />
                  
                  {/* Floating particles for active tab */}
                  {isActive && (
                    <>
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-white/60 rounded-full animate-ping" />
                      <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse delay-300" />
                    </>
                  )}
                </div>

                {/* Text Content */}
                <div className="relative">
                  <h3 className={`font-semibold text-sm mb-1 transition-colors duration-300 ${
                    isActive 
                      ? 'text-gray-900 dark:text-white' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {tab.name}
                  </h3>
                  <p className={`text-xs transition-colors duration-300 ${
                    isActive 
                      ? 'text-gray-600 dark:text-gray-400' 
                      : 'text-gray-500 dark:text-gray-500'
                  }`}>
                    {tab.description}
                  </p>
                </div>

                {/* Active Tab Border Accent */}
                {isActive && (
                  <div className="absolute inset-0 rounded-2xl border-2 border-white/20 pointer-events-none" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Content Panel */}
      <div className="relative">
        {/* Content Header */}
        <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-gray-50/80 to-white/80 dark:from-gray-900/60 dark:to-gray-800/60 backdrop-blur border border-gray-200/50 dark:border-white/10">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${activeTabData?.color} shadow-lg`}>
              {activeTabData?.icon && <activeTabData.icon className="w-6 h-6 text-white" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {activeTabData?.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {activeTabData?.description}
              </p>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="rounded-2xl bg-white/70 dark:bg-gray-900/50 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 shadow-2xl overflow-hidden">
          {/* Content with Animation */}
          <div key={activeTab} className="p-8 animate-fade-in">
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
          </div>
        </div>
      </div>
    </div>
  );
}