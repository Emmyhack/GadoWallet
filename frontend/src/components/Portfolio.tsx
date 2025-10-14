import { useEffect, useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { Wallet, Coins, TrendingUp, ArrowUpRight, Eye, Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cacheUtils, useOptimizedBlockchainData, usePerformanceMonitor } from '../lib/performance-utils';

interface ParsedTokenHolding {
  mint: string;
  amount: number;
  decimals: number;
  ata: string;
}

export function Portfolio() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [tokens, setTokens] = useState<ParsedTokenHolding[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  // Performance monitoring
  usePerformanceMonitor('Portfolio');

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!publicKey) return;
      
      const cacheKey = `portfolio_${publicKey.toBase58()}`;
      const cached = cacheUtils.get(cacheKey) as { solBalance: number; tokens: any[] } | null;
      
      if (cached) {
        setSolBalance(cached.solBalance);
        setTokens(cached.tokens);
        return;
      }

      try {
        setIsLoading(true);

        // Fetch balance first for immediate feedback
        const balanceLamports = await connection.getBalance(publicKey);
        const balanceSOL = balanceLamports / LAMPORTS_PER_SOL;
        setSolBalance(balanceSOL);

        // Then fetch tokens in background
        setTimeout(async () => {
          try {
            const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
              publicKey, 
              { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
            );

            const holdings: ParsedTokenHolding[] = tokenAccounts.value
              .map((acc) => {
                const info: any = acc.account.data.parsed.info;
                const amount = Number(info.tokenAmount.uiAmount || 0);
                const decimals = Number(info.tokenAmount.decimals || 0);
                return {
                  mint: info.mint as string,
                  amount,
                  decimals,
                  ata: info.owner as string,
                };
              })
              .filter((h) => h.amount > 0)
              .sort((a, b) => b.amount - a.amount);

            setTokens(holdings);
            
            // Cache the complete portfolio data
            cacheUtils.set(cacheKey, { 
              solBalance: balanceSOL, 
              tokens: holdings 
            }, 30); // Cache for 30 seconds
            
          } catch (tokenError) {
            console.error('Error fetching tokens:', tokenError);
          } finally {
            setIsLoading(false);
          }
        }, 100); // Small delay to show SOL balance first

      } catch (error) {
        console.error('Error fetching portfolio:', error);
        setIsLoading(false);
      }
    };

    fetchPortfolio();
  }, [publicKey, connection]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!publicKey) {
    return (
      <div className="text-center py-12">
        <div className="relative mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto animate-float shadow-2xl shadow-blue-500/25">
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t('noWalletConnected')}</h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">{t('connectWalletToViewStats')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* SOL Balance Card */}
        <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-400/10 border border-blue-500/20 backdrop-blur-xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">
              {t('solBalance')}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {isLoading || solBalance === null ? (
                <div className="animate-pulse bg-gray-300 dark:bg-gray-700 h-8 w-24 rounded" />
              ) : (
                `${solBalance.toFixed(4)} SOL`
              )}
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
              <span>Primary balance</span>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-4 right-4 w-2 h-2 bg-blue-400/60 rounded-full animate-pulse" />
          <div className="absolute bottom-4 left-4 w-1 h-1 bg-cyan-400/60 rounded-full animate-ping delay-300" />
        </div>

        {/* Token Count Card */}
        <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-400/10 border border-emerald-500/20 backdrop-blur-xl hover:shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
              {t('tokenCount')}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {isLoading ? (
                <div className="animate-pulse bg-gray-300 dark:bg-gray-700 h-8 w-16 rounded" />
              ) : (
                tokens.length
              )}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              SPL Tokens held
            </div>
          </div>

          <div className="absolute top-4 right-4 w-2 h-2 bg-emerald-400/60 rounded-full animate-pulse delay-150" />
        </div>

        {/* Top Token Card */}
        <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-400/10 border border-violet-500/20 backdrop-blur-xl hover:shadow-2xl hover:shadow-violet-500/25 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-400 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <ArrowUpRight className="w-6 h-6 text-white" />
            </div>
            <div className="text-xs font-medium text-violet-600 dark:text-violet-400 bg-violet-500/10 px-2 py-1 rounded-full">
              {t('topToken')}
            </div>
          </div>
          
          <div className="space-y-2">
            {isLoading ? (
              <div className="animate-pulse bg-gray-300 dark:bg-gray-700 h-6 w-full rounded" />
            ) : tokens.length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">No tokens found</div>
            ) : (
              <>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {tokens[0]?.amount.toFixed(2)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 font-mono truncate">
                  {tokens[0]?.mint.slice(0, 8)}...{tokens[0]?.mint.slice(-4)}
                </div>
              </>
            )}
          </div>

          <div className="absolute top-4 right-4 w-2 h-2 bg-violet-400/60 rounded-full animate-pulse delay-300" />
        </div>
      </div>

      {/* Token Holdings Table */}
      <div className="rounded-2xl bg-white/70 dark:bg-gray-900/50 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200/50 dark:border-white/10 bg-gradient-to-r from-gray-50/80 to-white/60 dark:from-gray-900/60 dark:to-gray-800/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
                <Coins className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('splTokenHoldings')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your SPL token portfolio</p>
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
              {tokens.length} tokens
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200/50 dark:divide-white/5">
          {isLoading && (
            <div className="p-6 flex items-center justify-center">
              <div className="flex items-center space-x-3">
                <div className="animate-spin w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full" />
                <span className="text-gray-600 dark:text-gray-400">{t('loadingTokens')}</span>
              </div>
            </div>
          )}
          
          {!isLoading && tokens.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-gray-400" />
              </div>
              <div className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tokens found</div>
              <p className="text-gray-500 dark:text-gray-400">Your wallet doesn't hold any SPL tokens yet</p>
            </div>
          )}

          {tokens.map((token, index) => (
            <div 
              key={token.mint} 
              className="group p-6 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all duration-200 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 group-hover:from-violet-100 group-hover:to-purple-100 dark:group-hover:from-violet-900/30 dark:group-hover:to-purple-900/30 transition-all duration-200">
                      <Coins className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-violet-600 dark:group-hover:text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded group-hover:bg-violet-100 dark:group-hover:bg-violet-900/30 transition-colors">
                          {token.mint.slice(0, 8)}...{token.mint.slice(-4)}
                        </span>
                        <button
                          onClick={() => copyToClipboard(token.mint)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
                          title="Copy full address"
                        >
                          <Copy className="w-3 h-3 text-gray-500" />
                        </button>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        ATA: {token.ata.slice(0, 8)}...{token.ata.slice(-4)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-right space-y-1">
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {token.amount.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {token.decimals} decimals
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}