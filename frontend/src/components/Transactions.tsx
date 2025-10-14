import { useEffect, useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getExplorerClusterParam } from '../lib/config';
import { cacheUtils, batchAsyncOperations, usePerformanceMonitor } from '../lib/performance-utils';

interface TxRow {
  signature: string;
  slot: number;
  err: boolean;
  lamports: number | null;
  date: string;
}

export function Transactions() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [rows, setRows] = useState<TxRow[]>([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  // Performance monitoring
  usePerformanceMonitor('Transactions');

  useEffect(() => {
    const load = async () => {
      if (!publicKey) return;
      
      const cacheKey = `transactions_${publicKey.toBase58()}`;
      const cached = cacheUtils.get(cacheKey) as TxRow[] | null;
      
      if (cached) {
        setRows(cached);
        return;
      }
      
      setLoading(true);
      try {
        // First get signatures quickly
        const sigs = await connection.getSignaturesForAddress(publicKey, { limit: 10 }); // Reduced limit
        
        // Then batch the transaction details to avoid overwhelming RPC
        const sigInfos = await batchAsyncOperations(
          sigs,
          async (s) => {
            try {
              const conf = await connection.getTransaction(s.signature, { 
                maxSupportedTransactionVersion: 0,
                commitment: 'confirmed' // Faster than finalized
              });
              let lamports: number | null = null;
              if (conf?.meta) {
                const diff = (conf.meta.postBalances?.[0] ?? 0) - (conf.meta.preBalances?.[0] ?? 0);
                lamports = diff / LAMPORTS_PER_SOL;
              }
              return {
                signature: s.signature,
                slot: s.slot,
                err: !!s.err,
                lamports,
                date: s.blockTime ? new Date(s.blockTime * 1000).toLocaleString() : '-',
              } as TxRow;
            } catch (error) {
              // Return fallback data for failed requests
              return {
                signature: s.signature,
                slot: s.slot,
                err: !!s.err,
                lamports: null,
                date: s.blockTime ? new Date(s.blockTime * 1000).toLocaleString() : '-',
              } as TxRow;
            }
          },
          2, // Only 2 concurrent requests
          200 // 200ms delay between batches
        );
        
        setRows(sigInfos);
        cacheUtils.set(cacheKey, sigInfos, 30); // Cache for 30 seconds
      } catch (error) {
        console.error('Error loading transactions:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [publicKey, connection]);

  if (!publicKey) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-300">{t('connectWalletToSeeActivity')}</p>
      </div>
    );
  }

  const explorerCluster = getExplorerClusterParam();

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center space-x-3 mb-2">
        <div className="w-8 h-8 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-rose-600 rounded-md flex items-center justify-center">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('transactions')}</h2>
          <p className="text-gray-600 dark:text-gray-300">{t('recentSolTransactions')}</p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('latestActivity')}</h3>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {loading && <div className="p-4 text-sm text-gray-500 dark:text-gray-400">{t('loading')}</div>}
          {!loading && rows.length === 0 && <div className="p-4 text-sm text-gray-500 dark:text-gray-400">{t('noTransactionsFound')}</div>}
          {rows.map((r) => {
            const href = `https://explorer.solana.com/tx/${r.signature}${explorerCluster ? `?cluster=${explorerCluster}` : ''}`;
            return (
              <a key={r.signature} href={href} target="_blank" rel="noopener noreferrer" className="block hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="p-4 grid md:grid-cols-4 gap-2 items-center">
                  <div className={`text-xs ${r.err ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>{r.err ? t('failed') : t('success')}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{r.signature}</div>
                  <div className="text-sm text-gray-900 dark:text-white">{r.lamports === null ? '—' : r.lamports.toFixed(6)} {t('sol')}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{r.date}</div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}