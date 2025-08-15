import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { InheritanceManager } from './InheritanceManager';
import { BatchTransfer } from './BatchTransfer';
import { ActivityManager } from './ActivityManager';
import { ClaimAssets } from './ClaimAssets';
import { WalletStats } from './WalletStats';
import { Shield, Send, Clock, Gift, BarChart3, Wallet, Activity as ActivityIcon } from 'lucide-react';
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
      description: t('wallet')
    },
    {
      id: 'inheritance',
      name: t('inheritance'),
      icon: Shield,
      description: t('inheritance')
    },
    {
      id: 'transfer',
      name: t('batchTransfer'),
      icon: Send,
      description: t('batchTransfer')
    },
    {
      id: 'activity',
      name: t('activity'),
      icon: Clock,
      description: t('activity')
    },
    {
      id: 'claim',
      name: t('claimAssets'),
      icon: Gift,
      description: t('claimAssets')
    },
    {
      id: 'stats',
      name: t('statistics'),
      icon: BarChart3,
      description: t('statistics')
    },
    {
      id: 'send',
      name: t('sendReceive'),
      icon: Send,
      description: t('sendReceive')
    },
    {
      id: 'txs',
      name: t('transactions'),
      icon: ActivityIcon,
      description: t('transactions')
    },
    {
      id: 'receive',
      name: t('receive'),
      icon: Send,
      description: t('receive')
    },
    {
      id: 'sign',
      name: t('signMessage'),
      icon: Shield,
      description: t('signMessage')
    }
  ];

  if (!connected) {
    return <Landing />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-md font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'bg-white/80 dark:bg-gray-900/60 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-white/90 dark:hover:bg-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="rounded-2xl shadow-sm border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-gray-900/60 backdrop-blur overflow-hidden">
        <div className="p-6">
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
  );
}