import React, { useState, useEffect } from 'react';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { KeeperBotService, SmartWalletInfo, formatSmartWalletAddress, calculateInheritanceAmount } from '../services/keeperBot';
import { 
  Clock, 
  Users, 
  Wallet, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  TrendingUp,
  Activity,
  Eye
} from 'lucide-react';

interface SmartWalletStatusProps {
  ownerAddresses?: PublicKey[];
}

export default function SmartWalletStatus({ ownerAddresses = [] }: SmartWalletStatusProps) {
  const [keeperService] = useState(() => new KeeperBotService(new Connection(clusterApiUrl('devnet'))));
  const [monitoring, setMonitoring] = useState(false);
  const [status, setStatus] = useState<{
    total: number;
    active: number;
    inactive: number;
    eligibleForInheritance: number;
    wallets: SmartWalletInfo[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const refreshStatus = async () => {
    if (ownerAddresses.length === 0) return;
    
    setLoading(true);
    try {
      await keeperService.initialize();
      const result = await keeperService.monitorSmartWallets(ownerAddresses);
      setStatus(result);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to refresh Smart Wallet status:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerAddresses]);

  useEffect(() => {
    if (monitoring && ownerAddresses.length > 0) {
      const interval = setInterval(refreshStatus, 60000); // Refresh every minute
      return () => clearInterval(interval);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monitoring, ownerAddresses]);

  if (ownerAddresses.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 text-center">
        <Eye className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold text-white mb-2">No Smart Wallets to Monitor</h3>
        <p className="text-gray-300">Add Smart Wallet owner addresses to start monitoring inheritance status.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Smart Wallet Monitor</h2>
          <p className="text-gray-300">Monitoring {ownerAddresses.length} Smart Wallet{ownerAddresses.length !== 1 ? 's' : ''}</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={refreshStatus}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button
            onClick={() => setMonitoring(!monitoring)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              monitoring 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            <Activity className="w-4 h-4" />
            {monitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </button>
        </div>
      </div>

      {/* Status Overview */}
      {status && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
            <div className="flex items-center gap-3">
              <Wallet className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">{status.total}</p>
                <p className="text-gray-300 text-sm">Total Wallets</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">{status.active}</p>
                <p className="text-gray-300 text-sm">Active</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-orange-400" />
              <div>
                <p className="text-2xl font-bold text-white">{status.inactive}</p>
                <p className="text-gray-300 text-sm">Inactive</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-400" />
              <div>
                <p className="text-2xl font-bold text-white">{status.eligibleForInheritance}</p>
                <p className="text-gray-300 text-sm">Eligible</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Smart Wallet Details */}
      {status && status.wallets.length > 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
          <h3 className="text-xl font-bold text-white mb-4">Smart Wallet Details</h3>
          
          <div className="space-y-4">
            {status.wallets.map((wallet, index) => {
              const isInactive = keeperService.isOwnerInactive(wallet);
              const isEligible = keeperService.isEligibleForInheritance(wallet);
              const timeRemaining = keeperService.getTimeUntilInheritance(wallet);
              
              return (
                <div 
                  key={wallet.address.toString()} 
                  className={`p-4 rounded-xl border-2 transition-all ${
                    isEligible 
                      ? 'border-red-400/50 bg-red-500/10' 
                      : isInactive 
                        ? 'border-orange-400/50 bg-orange-500/10'
                        : 'border-green-400/50 bg-green-500/10'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-white">
                        Smart Wallet #{index + 1}
                      </h4>
                      <p className="text-gray-300 text-sm font-mono">
                        Owner: {formatSmartWalletAddress(wallet.owner)}
                      </p>
                      <p className="text-gray-300 text-sm font-mono">
                        Address: {formatSmartWalletAddress(wallet.address)}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                        isEligible 
                          ? 'bg-red-500/20 text-red-300' 
                          : isInactive 
                            ? 'bg-orange-500/20 text-orange-300'
                            : 'bg-green-500/20 text-green-300'
                      }`}>
                        {isEligible ? (
                          <>
                            <AlertTriangle className="w-4 h-4" />
                            Eligible for Inheritance
                          </>
                        ) : isInactive ? (
                          <>
                            <Clock className="w-4 h-4" />
                            Inactive
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Active
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Wallet className="w-4 h-4 text-blue-400" />
                        <span className="text-gray-300 text-sm">Balance</span>
                      </div>
                      <p className="text-white font-bold">{wallet.balance.toFixed(4)} SOL</p>
                    </div>

                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-purple-400" />
                        <span className="text-gray-300 text-sm">Heirs</span>
                      </div>
                      <p className="text-white font-bold">{wallet.heirs.length}</p>
                    </div>

                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-orange-400" />
                        <span className="text-gray-300 text-sm">
                          {isEligible ? 'Eligible Now' : 'Time Remaining'}
                        </span>
                      </div>
                      <p className="text-white font-bold">
                        {isEligible ? 'Execute Now' : keeperService.formatTimeRemaining(timeRemaining)}
                      </p>
                    </div>
                  </div>

                  {/* Heir Information */}
                  <div className="mt-4">
                    <h5 className="text-white font-semibold mb-2">Inheritance Distribution:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {wallet.heirs.map((heir, heirIndex) => {
                        const inheritanceAmount = calculateInheritanceAmount(wallet.balance, heir.allocationPercentage);
                        return (
                          <div key={heirIndex} className="flex justify-between items-center bg-white/5 rounded-lg p-2">
                            <span className="text-gray-300 text-sm font-mono">
                              {formatSmartWalletAddress(heir.heirPubkey)}
                            </span>
                            <div className="text-right">
                              <span className="text-white font-semibold">{heir.allocationPercentage}%</span>
                              <span className="text-gray-400 text-sm ml-2">
                                ({inheritanceAmount.toFixed(4)} SOL)
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Last Activity */}
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-gray-400 text-sm">
                      Last Activity: {new Date(wallet.lastActiveTime * 1000).toLocaleString()}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Inactivity Period: {Math.round(wallet.inactivityPeriodSeconds / (24 * 60 * 60))} days
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Status Footer */}
      {lastUpdate && (
        <div className="text-center">
          <p className="text-gray-400 text-sm">
            Last updated: {lastUpdate.toLocaleString()}
            {monitoring && <span className="text-green-400 ml-2">• Live monitoring active</span>}
          </p>
        </div>
      )}

      {loading && (
        <div className="text-center">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-400 mx-auto" />
          <p className="text-gray-300 mt-2">Loading Smart Wallet status...</p>
        </div>
      )}
    </div>
  );
}