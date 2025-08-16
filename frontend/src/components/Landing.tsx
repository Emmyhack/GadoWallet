import { Shield, Send, Gift, BarChart3 } from 'lucide-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useTranslation } from 'react-i18next';

export function Landing() {
  const { t } = useTranslation();
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-gradient-to-br from-violet-600 via-fuchsia-600 to-rose-600 opacity-20 blur-3xl animate-float" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-gradient-to-br from-violet-600 via-fuchsia-600 to-rose-600 opacity-20 blur-3xl animate-float" />
      </div>

      <section className="relative container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
              Your Web3 Wallet for Life & Legacy
            </h1>
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-200 mb-8">
              {t('walletStatsOverview')}
            </p>
            <div className="flex items-center space-x-3">
              <WalletMultiButton className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-600 hover:from-violet-500 hover:to-rose-500 text-white font-medium py-2.5 px-4 rounded-md" />
              <a href="#features" className="btn-secondary">{t('exploreFeatures')}</a>
            </div>
          </div>
          <div className="md:justify-self-end">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur p-6 shadow-xl">
              <div className="grid grid-cols-2 gap-4">
                <div className="card">
                  <div className="w-8 h-8 rounded-md bg-gradient-to-br from-sky-500 to-indigo-500 text-white flex items-center justify-center mb-3">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white">{t('inheritance')}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">{t('designateHeirs')}</div>
                </div>
                <div className="card">
                  <div className="w-8 h-8 rounded-md bg-gradient-to-br from-rose-500 to-fuchsia-500 text-white flex items-center justify-center mb-3">
                    <Send className="w-5 h-5" />
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white">{t('sendReceive')}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">{t('sendReceiveSubtitle')}</div>
                </div>
                <div className="card">
                  <div className="w-8 h-8 rounded-md bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center mb-3">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white">{t('claimAssets')}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">{t('claimAssetsSubtitle')}</div>
                </div>
                <div className="card">
                  <div className="w-8 h-8 rounded-md bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center mb-3">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white">{t('statistics')}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">{t('walletStatsOverview')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="relative container mx-auto px-4 py-12">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">{t('exploreFeatures')}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-gray-900 dark:text-white font-semibold mb-1">{t('walletSecurity')}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{t('allTransactionsRequireSignature')}</div>
            </div>
            <div>
              <div className="text-gray-900 dark:text-white font-semibold mb-1">{t('batchTransfer')}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{t('batchTransferSubtitle')}</div>
            </div>
            <div>
              <div className="text-gray-900 dark:text-white font-semibold mb-1">{t('connectWallet')}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{t('connectWalletToViewStats')}</div>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="relative container mx-auto px-4 py-12">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">{t('whyGado')}</h2>
          <ol className="grid md:grid-cols-3 gap-6 list-decimal list-inside text-gray-800 dark:text-gray-200">
            <li>{t('connectWallet')}</li>
            <li>{t('updateActivitySub')}</li>
            <li>{t('sendReceiveSubtitle')}</li>
          </ol>
        </div>
      </section>

      <section id="security" className="relative container mx-auto px-4 py-12">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">{t('walletSecurity')}</h2>
          <div className="grid md:grid-cols-3 gap-6 text-gray-800 dark:text-gray-200">
            <div className="animate-fade-in">
              <div className="font-semibold mb-1">{t('walletSecurity')}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{t('keysNeverLeaveWallet')}</div>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '80ms' }}>
              <div className="font-semibold mb-1">{t('onChainUpdates')}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{t('updatesPreventPrematureClaims')}</div>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '160ms' }}>
              <div className="font-semibold mb-1">{t('whyGado')}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{t('inheritanceStatus')}</div>
            </div>
          </div>
        </div>
      </section>

      <section id="stats" className="relative container mx-auto px-4 py-12">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">{t('whyGado')}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{t('transactions')}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{t('transactions')}</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{t('heirDesignation')}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{t('heirDesignation')}</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{t('active')}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{t('active')}</div>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="relative container mx-auto px-4 py-12">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">FAQ</h2>
          <div className="space-y-4">
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">{t('claimAssets')}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{t('canClaimAfterYear')}</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">{t('connectWallet')}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Phantom / Solflare</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">{t('walletSecurity')}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{t('contractsImmutable')}</div>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative container mx-auto px-4 py-12">
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">© {new Date().getFullYear()} Gado Wallet.</div>
      </footer>
    </div>
  );
}