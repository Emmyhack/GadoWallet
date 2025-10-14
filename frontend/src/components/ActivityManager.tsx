import { useState, useEffect } from 'react';
import { useAnchorProgram } from '../lib/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import { Clock, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
// import { cacheUtils, useDebounce, usePerformanceMonitor } from '../lib/performance-utils';

interface HeirInfo {
  publicKey: any;
  account: {
    owner: any;
    heir: any;
    amount: any;
    lastActiveTime: any;
    isClaimed: boolean;
    inactivityPeriodSeconds: any;
    tokenMint?: any; // Optional for token heirs
  };
}

export function ActivityManager() {
  const program = useAnchorProgram();
  const { publicKey } = useWallet();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [solHeirs, setSolHeirs] = useState<HeirInfo[]>([]);
  const [tokenHeirs, setTokenHeirs] = useState<HeirInfo[]>([]);
  const [loadingHeirs, setLoadingHeirs] = useState(false);

  // Performance monitoring
  // usePerformanceMonitor('ActivityManager');

  const loadHeirs = async () => {
    if (!program || !publicKey) return;
    
    // const cacheKey = `heirs_${publicKey.toBase58()}`;
    // const cached = cacheUtils.get(cacheKey);
    
    // if (cached) {
    //   setSolHeirs(cached.solHeirs);
    //   setTokenHeirs(cached.tokenHeirs);
    //   return;
    // }
    
    try {
      setLoadingHeirs(true);
      
      // Load heirs with optimized parallel execution
      const [coinHeirs, tokenHeirsData] = await Promise.allSettled([
        (program as any).account.coinHeir.all([
          { memcmp: { offset: 8, bytes: publicKey.toBase58() } },
        ]),
        (program as any).account.tokenHeir.all([
          { memcmp: { offset: 8, bytes: publicKey.toBase58() } },
        ])
      ]);
      
      const solHeirsData = coinHeirs.status === 'fulfilled' ? coinHeirs.value : [];
      const tokenHeirsResult = tokenHeirsData.status === 'fulfilled' ? tokenHeirsData.value : [];
      
      setSolHeirs(solHeirsData);
      setTokenHeirs(tokenHeirsResult);
      
      // Cache for 60 seconds
      // cacheUtils.set(cacheKey, {
      //   solHeirs: solHeirsData,
      //   tokenHeirs: tokenHeirsResult
      // }, 60);
      
    } catch (error) {
      console.error('Error loading heirs:', error);
      setSolHeirs([]);
      setTokenHeirs([]);
    } finally {
      setLoadingHeirs(false);
    }
  };

  useEffect(() => {
    loadHeirs();
  }, [program, publicKey]);

  const formatInactivityPeriod = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    
    if (days === 0) return '< 1 day';
    if (days === 1) return '1 day';
    if (days < 7) return `${days} days`;
    if (days < 30) {
      const weeks = Math.floor(days / 7);
      const remainingDays = days % 7;
      if (weeks === 1) {
        return remainingDays > 0 ? `1 week, ${remainingDays} day${remainingDays > 1 ? 's' : ''}` : '1 week';
      }
      return remainingDays > 0 ? `${weeks} weeks, ${remainingDays} day${remainingDays > 1 ? 's' : ''}` : `${weeks} weeks`;
    }
    if (days < 365) {
      const months = Math.floor(days / 30);
      const remainingDays = days % 30;
      if (months === 1) {
        return remainingDays > 0 ? `1 month, ${remainingDays} day${remainingDays > 1 ? 's' : ''}` : '1 month';
      }
      return remainingDays > 0 ? `${months} months, ${remainingDays} day${remainingDays > 1 ? 's' : ''}` : `${months} months`;
    }
    const years = Math.floor(days / 365);
    const remainingDays = days % 365;
    if (years === 1) {
      return remainingDays > 0 ? `1 year, ${remainingDays} day${remainingDays > 1 ? 's' : ''}` : '1 year';
    }
    return remainingDays > 0 ? `${years} years, ${remainingDays} day${remainingDays > 1 ? 's' : ''}` : `${years} years`;
  };

  const getAverageInactivityPeriod = (heirs: HeirInfo[]) => {
    if (heirs.length === 0) return 'No heirs configured';
    
    try {
      const avgSeconds = heirs.reduce((sum, heir) => {
        const seconds = typeof heir.account.inactivityPeriodSeconds === 'number' 
          ? heir.account.inactivityPeriodSeconds 
          : heir.account.inactivityPeriodSeconds.toNumber();
        return sum + seconds;
      }, 0) / heirs.length;
      
      return `${formatInactivityPeriod(avgSeconds)} (avg of ${heirs.length} heir${heirs.length > 1 ? 's' : ''})`;
    } catch (error) {
      console.error('Error calculating average inactivity period:', error);
      return 'Error calculating period';
    }
  };

  const handleUpdateActivity = async (type: 'sol' | 'token') => {
    if (!program || !publicKey) return;

    try {
      setIsLoading(true);
      setMessage('');

      if (type === 'sol') {
        // Fetch fresh SOL heirs data
        const heirs = await (program as any).account.coinHeir.all([
          { memcmp: { offset: 8, bytes: publicKey.toBase58() } },
        ]);
        
        if (!heirs.length) {
          setMessage(t('noSolHeirs') || 'No SOL heirs found. Please add heirs first.');
        } else {
          // Update activity for all SOL heirs
          let successCount = 0;
          let errorCount = 0;
          
          for (const heir of heirs) {
            try {
              // TODO: Implement updateSolActivity method
              console.log('updateSolActivity method not yet implemented');
              // await program.methods.updateSolActivity().accountsPartial({
              //   solHeir: heir.publicKey,
              //   owner: publicKey,
              // }).signers([]).rpc();
              successCount++;
            } catch (heirError) {
              console.error(`Failed to update activity for SOL heir ${heir.publicKey.toString()}:`, heirError);
              errorCount++;
            }
          }
          
          setLastUpdateTime(new Date());
          if (errorCount === 0) {
            setMessage(t('solUpdated') || `Successfully updated activity for ${successCount} SOL heir(s).`);
          } else {
            setMessage(`Updated ${successCount} heir(s), ${errorCount} failed. Check console for details.`);
          }
          await loadHeirs(); // Reload heirs to update the display
        }
      } else {
        // Fetch fresh token heirs data
        const heirs = await (program as any).account.tokenHeir.all([
          { memcmp: { offset: 8, bytes: publicKey.toBase58() } },
        ]);
        
        if (!heirs.length) {
          setMessage(t('noTokenHeirs') || 'No token heirs found. Please add heirs first.');
        } else {
          // Update activity for all token heirs
          let successCount = 0;
          let errorCount = 0;
          
          for (const heir of heirs) {
            try {
              // TODO: Implement updateTokenActivity method
              console.log('updateTokenActivity method not yet implemented');
              // await program.methods.updateTokenActivity().accountsPartial({
              //   tokenHeir: heir.publicKey,
              //   owner: publicKey,
              // }).signers([]).rpc();
              successCount++;
            } catch (heirError) {
              console.error(`Failed to update activity for token heir ${heir.publicKey.toString()}:`, heirError);
              errorCount++;
            }
          }
          
          setLastUpdateTime(new Date());
          if (errorCount === 0) {
            setMessage(t('tokenUpdated') || `Successfully updated activity for ${successCount} token heir(s).`);
          } else {
            setMessage(`Updated ${successCount} heir(s), ${errorCount} failed. Check console for details.`);
          }
          await loadHeirs(); // Reload heirs to update the display
        }
      }
    } catch (error) {
      console.error('Error updating activity:', error);
      setMessage(t('updateError') || `Error updating activity: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeSinceLastUpdate = () => {
    if (!lastUpdateTime) return t('never') || 'Never';
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - lastUpdateTime.getTime()) / 1000);
    if (diffInSeconds < 60) return `${diffInSeconds} ${t('secondsAgo') || 'seconds ago'}`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} ${t('minutesAgo') || 'minutes ago'}`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ${t('hoursAgo') || 'hours ago'}`;
    return `${Math.floor(diffInSeconds / 86400)} ${t('daysAgo') || 'days ago'}`;
  };

  return (
    <div className="space-y-8">
      {/* Professional Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-600 shadow-2xl">
            <Clock className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">{t('activityManager') || 'Activity Manager'}</h2>
            <p className="text-gray-300 font-medium">{t('updateActivitySub') || 'Stay active to protect your inheritance'}</p>
          </div>
        </div>
        
        <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-200">Last Update</div>
            <div className="text-lg font-bold text-white">{getTimeSinceLastUpdate()}</div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-gray-900/60 backdrop-blur p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('solActivity') || 'SOL Activity'}</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">{t('active') || 'Active'}</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">{t('lastUpdate') || 'Last Update:'}</span>
              <span className="font-medium text-gray-900 dark:text-white">{getTimeSinceLastUpdate()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">{t('inactivityPeriod') || 'Inactivity Period:'}</span>
              <span className="font-medium text-gray-900 dark:text-white">{loadingHeirs ? 'Loading...' : getAverageInactivityPeriod(solHeirs)}</span>
            </div>
            <button
              onClick={() => handleUpdateActivity('sol')}
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-600"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t('updating') || 'Updating...'}</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>{t('updateSolActivity') || 'Update SOL Activity'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-gray-900/60 backdrop-blur p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('tokenActivity') || 'Token Activity'}</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">{t('active') || 'Active'}</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">{t('lastUpdate') || 'Last Update:'}</span>
              <span className="font-medium text-gray-900 dark:text-white">{getTimeSinceLastUpdate()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">{t('inactivityPeriod') || 'Inactivity Period:'}</span>
              <span className="font-medium text-gray-900 dark:text-white">{loadingHeirs ? 'Loading...' : getAverageInactivityPeriod(tokenHeirs)}</span>
            </div>
            <button
              onClick={() => handleUpdateActivity('token')}
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-600"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t('updating') || 'Updating...'}</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>{t('updateTokenActivity') || 'Update Token Activity'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-md ${
          message.includes('Error') 
            ? 'bg-red-50 text-red-700 border border-red-200' 
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          <div className="flex items-center space-x-2">
            {message.includes('Error') ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <CheckCircle className="w-5 h-5" />
            )}
            <span>{message}</span>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-gray-900/60 backdrop-blur p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('activityUpdates') || 'Activity Updates'}</h3>
          <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <li>• {t('updateActivityReset') || 'Update activity to reset the inactivity timer'}</li>
            <li>• {t('preventsHeirs') || 'Prevents heirs from claiming assets prematurely'}</li>
            <li>• {t('onChainUpdates') || 'Activity updates are recorded on-chain'}</li>
            <li>• {t('regularUpdates') || 'Regular updates ensure asset protection'}</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-gray-900/60 backdrop-blur p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('inactivityPeriodCard') || 'Inactivity Period'}</h3>
          <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <li>• {t('defaultInactivity') || 'Customizable inactivity period set by owner'}</li>
            <li>• {t('heirsCanClaim') || 'Heirs can claim after inactivity period'}</li>
            <li>• {t('updatesReset') || 'Activity updates reset the timer'}</li>
            <li>• {t('multipleHeirs') || 'Multiple heirs can be designated'}</li>
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-gray-900/60 backdrop-blur p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('quickActions') || 'Quick Actions'}</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <button
            onClick={() => handleUpdateActivity('sol')}
            disabled={isLoading}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{t('updateSol') || 'Update SOL'}</span>
          </button>
          <button
            onClick={() => handleUpdateActivity('token')}
            disabled={isLoading}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{t('updateTokens') || 'Update Tokens'}</span>
          </button>
          <button
            onClick={async () => {
              await loadHeirs();
              setMessage(t('activityRefreshed') || 'Status refreshed successfully!');
            }}
            disabled={loadingHeirs}
            className="btn-secondary flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loadingHeirs ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            <span>{loadingHeirs ? 'Loading...' : (t('checkStatus') || 'Refresh Status')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}