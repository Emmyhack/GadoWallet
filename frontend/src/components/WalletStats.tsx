import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useAnchorProgram, listCoinHeirsByOwner, listTokenHeirsByOwner, isHeirClaimable } from '../lib/anchor';
import { BarChart3, Wallet, Shield, Users, TrendingUp, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface WalletStatsData {
  balance: number;
  heirsCount: number;
  totalInheritance: number;
  lastActivity: string;
  activeHeirs: number;
}

export function WalletStats() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const program = useAnchorProgram();
  const [stats, setStats] = useState<WalletStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchStats = async () => {
      if (!publicKey || !connection || !program) return;

      try {
        setIsLoading(true);

        const balance = await connection.getBalance(publicKey);
        const balanceInSOL = balance / LAMPORTS_PER_SOL;

        const [coinHeirs, tokenHeirs] = await Promise.all([
          listCoinHeirsByOwner(program, publicKey),
          listTokenHeirsByOwner(program, publicKey),
        ]);

        const allHeirs = [
          ...coinHeirs.map((c: any) => ({
            type: 'sol' as const,
            lastActiveTime: c.account.lastActiveTime.toNumber(),
            isClaimed: c.account.isClaimed,
            inactivitySeconds: c.account.inactivityPeriodSeconds?.toNumber?.() ?? c.account.inactivity_period_seconds?.toNumber?.() ?? 365 * 24 * 60 * 60,
            amount: Number(c.account.amount) / 1e9,
          })),
          ...tokenHeirs.map((t: any) => ({
            type: 'token' as const,
            lastActiveTime: t.account.lastActiveTime.toNumber(),
            isClaimed: t.account.isClaimed,
            inactivitySeconds: t.account.inactivityPeriodSeconds?.toNumber?.() ?? t.account.inactivity_period_seconds?.toNumber?.() ?? 365 * 24 * 60 * 60,
            amount: Number(t.account.amount),
          })),
        ];

        const heirsCount = allHeirs.length;
        const totalInheritance = allHeirs
          .filter(h => h.type === 'sol')
          .reduce((sum, h) => sum + (h.amount || 0), 0);

        const lastActivitySeconds = Math.max(
          0,
          ...allHeirs.map(h => h.lastActiveTime)
        );

        const activeHeirs = allHeirs.filter(h => isHeirClaimable(h.lastActiveTime, h.isClaimed, h.inactivitySeconds)).length;

        setStats({
          balance: balanceInSOL,
          heirsCount,
          totalInheritance,
          lastActivity: lastActivitySeconds ? new Date(lastActivitySeconds * 1000).toISOString() : new Date().toISOString(),
          activeHeirs,
        });
      } catch (error) {
        console.error('Error fetching wallet stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [publicKey, connection]);

  const formatSOL = (amount: number) => {
    return amount.toFixed(4);
  };

  const getTimeSinceLastActivity = (dateString: string) => {
    const lastActivity = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  if (!publicKey) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('noWalletConnected')}</h3>
        <p className="text-gray-600">{t('connectWalletToViewStats')}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">{t('loadingWalletStats')}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('unableToLoadStats')}</h3>
        <p className="text-gray-600">{t('pleaseTryAgainLater')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-rose-600 rounded-md flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">{t('walletStatistics')}</h2>
          <p className="text-gray-600">{t('walletStatsOverview')}</p>
        </div>
      </div>

      {/* Wallet Address */}
      <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-gray-900/60 backdrop-blur p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('walletInformation')}</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">{t('addressLabel')}</span>
            <span className="font-mono text-sm text-gray-900 break-all">{publicKey.toString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">{t('balanceLabel')}</span>
            <span className="font-semibold text-gray-900">{formatSOL(stats.balance)} SOL</span>
          </div>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-gray-900/60 backdrop-blur p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-2xl font-semibold text-gray-900">{formatSOL(stats.balance)}</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">{t('solBalance')}</h4>
          <p className="text-sm text-gray-600">{t('currentWalletBalance')}</p>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-gray-900/60 backdrop-blur p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-2xl font-semibold text-gray-900">{stats.heirsCount}</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">{t('totalHeirsLabel')}</h4>
          <p className="text-sm text-gray-600">{t('designatedBeneficiaries')}</p>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-gray-900/60 backdrop-blur p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-2xl font-semibold text-gray-900">{formatSOL(stats.totalInheritance)}</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">{t('totalInheritanceLabel')}</h4>
          <p className="text-sm text-gray-600">{t('solDesignatedForHeirs')}</p>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-gray-900/60 backdrop-blur p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-2xl font-semibold text-gray-900">{stats.activeHeirs}</span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">{t('activeHeirsLabel')}</h4>
          <p className="text-sm text-gray-600">{t('currentlyClaimable')}</p>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-gray-900/60 backdrop-blur p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('recentActivity')}</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{t('walletActivityUpdated')}</p>
              <p className="text-xs text-gray-600">{getTimeSinceLastActivity(stats.lastActivity)}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{t('heirDesignation')}</p>
              <p className="text-xs text-gray-600">{t('heirsDesignatedForInheritance', { count: 3 })}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{t('inheritanceSetup')}</p>
              <p className="text-xs text-gray-600">{t('solAllocatedForInheritance', { amount: '2.5' })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-gray-900/60 backdrop-blur p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('quickActionsTitle')}</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>{t('viewHistory')}</span>
          </button>
          
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <Users className="w-4 h-4" />
            <span>{t('manageHeirs')}</span>
          </button>
          
          <button className="btn-secondary flex items-center justify-center space-x-2">
            <Activity className="w-4 h-4" />
            <span>{t('updateActivityAction')}</span>
          </button>
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-gray-900/60 backdrop-blur p-4">
          <h3 className="font-semibold text-gray-900 mb-2">{t('walletSecurity')}</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• {t('allTransactionsRequireSignature')}</li>
            <li>• {t('keysNeverLeaveWallet')}</li>
            <li>• {t('contractsImmutable')}</li>
            <li>• {t('updatesPreventPrematureClaims')}</li>
          </ul>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-gray-900/60 backdrop-blur p-4">
          <h3 className="font-semibold text-gray-900 mb-2">{t('inheritanceStatus')}</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• {t('heirsDesignatedForInheritance', { count: stats.heirsCount })}</li>
            <li>• {t('solAllocatedForInheritance', { amount: formatSOL(stats.totalInheritance) })}</li>
            <li>• {stats.activeHeirs} {t('activeHeirsLabel').toLowerCase()}</li>
            <li>• {t('lastUpdate')} {getTimeSinceLastActivity(stats.lastActivity)}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}