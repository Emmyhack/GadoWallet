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
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-16">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gray-900 rounded-lg flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">
            Welcome to Gada Wallet
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect your wallet to start managing your digital inheritance. 
            Secure your SOL and SPL tokens with designated heirs and ensure 
            your digital assets are protected for future generations.
          </p>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Key Features
            </h3>
            <ul className="space-y-3 text-left">
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                <span className="text-gray-700">Designate heirs for your assets</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                <span className="text-gray-700">Batch transfer to multiple recipients</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                <span className="text-gray-700">Time-based inheritance claims</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                <span className="text-gray-700">Activity monitoring and updates</span>
              </li>
            </ul>
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