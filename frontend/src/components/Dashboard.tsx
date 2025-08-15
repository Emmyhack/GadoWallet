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

export function Dashboard() {
  const { connected } = useWallet();
  const [activeTab, setActiveTab] = useState('inheritance');

  const tabs = [
    {
      id: 'portfolio',
      name: 'Wallet',
      icon: Wallet,
      description: 'View balances and token holdings'
    },
    {
      id: 'inheritance',
      name: 'Inheritance',
      icon: Shield,
      description: 'Manage heirs and inheritance settings'
    },
    {
      id: 'transfer',
      name: 'Batch Transfer',
      icon: Send,
      description: 'Send SOL and tokens to multiple recipients'
    },
    {
      id: 'activity',
      name: 'Activity',
      icon: Clock,
      description: 'Update your activity status'
    },
    {
      id: 'claim',
      name: 'Claim Assets',
      icon: Gift,
      description: 'Claim inherited assets'
    },
    {
      id: 'stats',
      name: 'Statistics',
      icon: BarChart3,
      description: 'View wallet statistics'
    },
    {
      id: 'send',
      name: 'Send/Receive',
      icon: Send,
      description: 'Send SOL or tokens'
    },
    {
      id: 'txs',
      name: 'Transactions',
      icon: ActivityIcon,
      description: 'Recent activity'
    },
    {
      id: 'receive',
      name: 'Receive',
      icon: Send,
      description: 'Show address and QR'
    },
    {
      id: 'sign',
      name: 'Sign Msg',
      icon: Shield,
      description: 'Sign an arbitrary message'
    }
  ];

  if (!connected) {
    return (
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500 via-indigo-500 to-purple-600 opacity-20" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-xl mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Gada Wallet</h2>
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-200 mb-8">Secure digital inheritance and everyday wallet in one sleek, professional interface.</p>
            <div className="bg-white/80 dark:bg-gray-800/70 backdrop-blur rounded-2xl shadow-lg border border-white/30 p-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Why Gada</h3>
              <ul className="grid md:grid-cols-2 gap-3 text-left">
                <li className="flex items-center space-x-2 text-gray-800 dark:text-gray-200"><span className="w-1.5 h-1.5 rounded-full bg-indigo-600" /> <span>Designate heirs for SOL & SPL tokens</span></li>
                <li className="flex items-center space-x-2 text-gray-800 dark:text-gray-200"><span className="w-1.5 h-1.5 rounded-full bg-indigo-600" /> <span>Batch transfers with ease</span></li>
                <li className="flex items-center space-x-2 text-gray-800 dark:text-gray-200"><span className="w-1.5 h-1.5 rounded-full bg-indigo-600" /> <span>Time-based, on-chain claims</span></li>
                <li className="flex items-center space-x-2 text-gray-800 dark:text-gray-200"><span className="w-1.5 h-1.5 rounded-full bg-indigo-600" /> <span>Portfolio, send/receive, activity</span></li>
              </ul>
              <div className="mt-8 flex items-center justify-center space-x-3">
                <a href="#" className="btn-primary bg-gradient-to-r from-sky-600 to-indigo-600">Connect Wallet</a>
                <a href="#features" className="btn-secondary">Learn More</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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