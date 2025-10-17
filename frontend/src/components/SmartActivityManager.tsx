import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Clock, CheckCircle, Shield, Wallet, Activity } from 'lucide-react';

export function ActivityManager() {
  const { publicKey } = useWallet();

  if (!publicKey) {
    return (
      <div className="text-center p-8">
        <Wallet className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Wallet Connection Required
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Please connect your wallet to view activity status.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-md flex items-center justify-center">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Smart Wallet Activity</h2>
          <p className="text-gray-600 dark:text-gray-300">Automatic activity monitoring for smart wallets</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Activity Monitored Automatically</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Smart wallets track your activity automatically. No manual updates required!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700">
            <Clock className="w-8 h-8 text-green-600 dark:text-green-400 mb-3" />
            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Auto Tracking</h4>
            <p className="text-green-700 dark:text-green-300 text-sm">
              Every transaction automatically updates your activity timestamp
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
            <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3" />
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Secure Monitoring</h4>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              On-chain verification ensures accurate activity records
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
            <Wallet className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
            <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Smart Detection</h4>
            <p className="text-purple-700 dark:text-purple-300 text-sm">
              AI-powered detection of wallet activity across all assets
            </p>
          </div>
        </div>

        <div className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl border border-yellow-200 dark:border-yellow-700">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">How Smart Wallet Activity Works</h4>
              <div className="space-y-2 text-yellow-800 dark:text-yellow-200 text-sm">
                <p>• <strong>Automatic Detection:</strong> Every transaction you make updates your activity timestamp</p>
                <p>• <strong>Multi-Asset Tracking:</strong> Monitors SOL, tokens, and NFT transactions</p>
                <p>• <strong>Inheritance Protection:</strong> Prevents accidental inheritance triggers while you're active</p>
                <p>• <strong>Real-Time Updates:</strong> Activity is recorded immediately on-chain</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Current Status: <span className="text-green-600 dark:text-green-400 font-medium">Active & Monitored</span>
          </p>
        </div>
      </div>
    </div>
  );
}