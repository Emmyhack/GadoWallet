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
    }
  ];

  if (!connected) {
    return <Landing />;
  }

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* Enhanced Header Section */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="relative p-4 rounded-3xl bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 backdrop-blur-xl border border-white/20 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-400/20 to-fuchsia-400/20 rounded-3xl blur-xl"></div>
              <Wallet className="relative w-12 h-12 text-white drop-shadow-lg" />
            </div>
            <div className="text-left">
              <h1 className="text-5xl font-black bg-gradient-to-r from-violet-300 via-fuchsia-300 to-rose-300 bg-clip-text text-transparent mb-2 drop-shadow-sm">
                Gada Wallet
              </h1>
              <p className="text-xl text-gray-300 font-medium">Next-Generation Digital Asset Management</p>
              <p className="text-gray-400">Secure • Automated • Decentralized</p>
            </div>
          </div>
          
          {/* Feature Highlights */}
          <div className="flex justify-center space-x-8 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-300">Live on Devnet</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-gray-300">Smart Contracts Verified</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span className="text-gray-300">Multi-Inheritance Support</span>
            </div>
          </div>
        </div>

        {/* Enhanced Function Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <div
                key={tab.id}
                className={`group relative cursor-pointer transition-all duration-500 hover:scale-105 ${
                  isActive ? 'scale-105 z-10' : ''
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => setActiveTab(tab.id)}
              >
                {/* Enhanced Card with Modern Glassmorphism */}
                <div
                  className={`relative p-6 rounded-3xl border backdrop-blur-2xl transition-all duration-500 overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-br from-white/20 to-white/5 border-white/30 shadow-2xl shadow-purple-500/25'
                      : 'bg-white/10 border-white/10 hover:bg-white/15 hover:border-white/20 shadow-xl hover:shadow-2xl'
                  }`}
                >
                  {/* Animated Background Gradient */}
                  <div 
                    className={`absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 ${
                      isActive ? 'opacity-10' : 'group-hover:opacity-5'
                    }`}
                    style={{ 
                      background: `linear-gradient(135deg, ${tab.color.replace('from-', '').replace(' to-', ', ')})` 
                    }}
                  />

                  {/* Floating Orbs */}
                  {isActive && (
                    <>
                      <div className="absolute top-2 right-2 w-3 h-3 bg-gradient-to-r from-white/60 to-transparent rounded-full animate-pulse" />
                      <div className="absolute bottom-3 left-3 w-2 h-2 bg-gradient-to-r from-purple-300/60 to-transparent rounded-full animate-pulse delay-1000" />
                    </>
                  )}

                  {/* Enhanced Icon Container */}
                  <div className={`relative mb-6 p-4 rounded-2xl transition-all duration-500 ${
                    isActive 
                      ? `bg-gradient-to-br ${tab.color} text-white shadow-2xl shadow-current/40` 
                      : 'bg-white/20 text-white/80 group-hover:bg-white/30 group-hover:scale-110'
                  }`}>
                    <Icon className={`w-8 h-8 transition-all duration-500 ${
                      isActive ? 'scale-110 drop-shadow-lg' : 'group-hover:scale-105'
                    }`} />
                    
                    {/* Enhanced Particle Effects */}
                    {isActive && (
                      <>
                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-white/40 rounded-full animate-ping" />
                        <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white/30 rounded-full animate-pulse delay-500" />
                        <div className="absolute top-1 left-1 w-1 h-1 bg-white/60 rounded-full animate-pulse delay-700" />
                      </>
                    )}
                  </div>

                  {/* Enhanced Text Content */}
                  <div className="relative space-y-2">
                    <h3 className={`font-bold text-lg transition-all duration-300 ${
                      isActive 
                        ? 'text-white drop-shadow-sm' 
                        : 'text-white/90 group-hover:text-white'
                    }`}>
                      {tab.name}
                    </h3>
                    <p className={`text-sm leading-relaxed transition-all duration-300 ${
                      isActive 
                        ? 'text-white/80' 
                        : 'text-white/60 group-hover:text-white/70'
                    }`}>
                      {tab.description}
                    </p>
                    
                    {/* Progress indicator for active tab */}
                    {isActive && (
                      <div className="pt-3">
                        <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-white/60 to-white/80 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Border Effects */}
                  {isActive && (
                    <>
                      <div className="absolute inset-0 rounded-3xl border-2 border-white/30 pointer-events-none" />
                      <div className="absolute inset-0 rounded-3xl border border-purple-300/50 pointer-events-none animate-pulse" />
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Enhanced Active Content Panel */}
        <div className="relative">
          {/* Modern Content Header */}
          <div className="mb-8 p-8 rounded-3xl bg-gradient-to-r from-white/15 to-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl">
            <div className="flex items-center space-x-6">
              <div className={`relative p-4 rounded-2xl bg-gradient-to-br ${activeTabData?.color} shadow-2xl`}>
                <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl"></div>
                {activeTabData?.icon && <activeTabData.icon className="relative w-8 h-8 text-white drop-shadow-lg" />}
              </div>
              <div>
                <h2 className="text-4xl font-black text-white mb-2 drop-shadow-sm">
                  {activeTabData?.name}
                </h2>
                <p className="text-xl text-white/80 font-medium">
                  {activeTabData?.description}
                </p>
                <div className="flex items-center space-x-4 mt-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-white/60">Ready</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-300"></div>
                    <span className="text-sm text-white/60">Secure</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Content Container */}
          <div className="rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/20 shadow-2xl overflow-hidden">
            {/* Content with Enhanced Animation */}
            <div key={activeTab} className="p-8 animate-fade-in"
                 style={{
                   animation: 'fadeIn 0.5s ease-out forwards, slideUp 0.5s ease-out forwards'
                 }}>
            {activeTab === 'portfolio' && <Portfolio />}
            {activeTab === 'inheritance' && <InheritanceManager />}
            {activeTab === 'transfer' && <BatchTransfer />}
            {activeTab === 'activity' && <ActivityManager />}
            {activeTab === 'claim' && <ClaimAssets />}
            {activeTab === 'stats' && <WalletStats />}
            {activeTab === 'send' && <SendReceive />}
            {activeTab === 'txs' && <Transactions />}
            {activeTab === 'receive' && <Receive />}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}