import { useState } from 'react';
import { useAnchorProgram } from '../lib/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import { Clock, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function ActivityManager() {
  const program = useAnchorProgram();
  const { publicKey } = useWallet();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  const handleUpdateActivity = async (type: 'sol' | 'token') => {
    if (!program || !publicKey) return;

    try {
      setIsLoading(true);
      setMessage('');

      if (type === 'sol') {
        const heirs = await (program as any).account.coinHeir.all([
          { memcmp: { offset: 8, bytes: publicKey.toBase58() } },
        ]);
        if (!heirs.length) {
          setMessage(t('noSolHeirs') || '');
        } else {
          for (const h of heirs) {
            await program.methods.updateCoinActivity().accounts({
              coinHeir: h.publicKey,
              owner: publicKey,
            }).rpc();
          }
          setLastUpdateTime(new Date());
          setMessage(t('solUpdated') || '');
        }
      } else {
        const heirs = await (program as any).account.tokenHeir.all([
          { memcmp: { offset: 8, bytes: publicKey.toBase58() } },
        ]);
        if (!heirs.length) {
          setMessage(t('noTokenHeirs') || '');
        } else {
          for (const h of heirs) {
            await program.methods.updateActivity().accounts({
              tokenHeir: h.publicKey,
              owner: publicKey,
            }).rpc();
          }
          setLastUpdateTime(new Date());
          setMessage(t('tokenUpdated') || '');
        }
      }
    } catch (error) {
      console.error('Error updating activity:', error);
      setMessage(t('updateError') || '');
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
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-gray-900 rounded-md flex items-center justify-center">
          <Clock className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('activityManager') || 'Activity Manager'}</h2>
          <p className="text-gray-600 dark:text-gray-300">{t('updateActivitySub') || 'Update your activity status to prevent inheritance claims'}</p>
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
              <span className="font-medium text-gray-900 dark:text-white">{t('oneYear') || '1 year'}</span>
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
              <span className="font-medium text-gray-900 dark:text-white">{t('oneYear') || '1 year'}</span>
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
            <li>• {t('defaultInactivity') || 'Default inactivity period: 1 year'}</li>
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
            onClick={() => {
              setLastUpdateTime(new Date());
              setMessage(t('activityRefreshed') || '');
            }}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{t('checkStatus') || 'Check Status'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}