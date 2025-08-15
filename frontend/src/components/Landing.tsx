import { Shield, Send, Gift, BarChart3 } from 'lucide-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export function Landing() {
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
              Gada Wallet combines professional wallet features with secure digital inheritance. Manage assets, send and receive, and protect your legacy.
            </p>
            <div className="flex items-center space-x-3">
              <WalletMultiButton className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-600 hover:from-violet-500 hover:to-rose-500 text-white font-medium py-2.5 px-4 rounded-md" />
              <a href="#features" className="btn-secondary">Explore Features</a>
            </div>
          </div>
          <div className="md:justify-self-end">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur p-6 shadow-xl">
              <div className="grid grid-cols-2 gap-4">
                <div className="card">
                  <div className="w-8 h-8 rounded-md bg-gradient-to-br from-sky-500 to-indigo-500 text-white flex items-center justify-center mb-3">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white">Inheritance</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Designate heirs & claim after inactivity</div>
                </div>
                <div className="card">
                  <div className="w-8 h-8 rounded-md bg-gradient-to-br from-rose-500 to-fuchsia-500 text-white flex items-center justify-center mb-3">
                    <Send className="w-5 h-5" />
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white">Send/Receive</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">SOL and tokens with ATA support</div>
                </div>
                <div className="card">
                  <div className="w-8 h-8 rounded-md bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center mb-3">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white">Claim Assets</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Time-based, on-chain safety</div>
                </div>
                <div className="card">
                  <div className="w-8 h-8 rounded-md bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center mb-3">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div className="font-semibold text-gray-900 dark:text-white">Portfolio</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Balance, tokens, transactions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="relative container mx-auto px-4 py-12">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">Features built for everyone</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-gray-900 dark:text-white font-semibold mb-1">Secure by design</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Non-custodial, on-chain logic with wallet signatures.</div>
            </div>
            <div>
              <div className="text-gray-900 dark:text-white font-semibold mb-1">Simple & powerful</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Batch transfers, portfolio view, and one-click claim.</div>
            </div>
            <div>
              <div className="text-gray-900 dark:text-white font-semibold mb-1">Multi-wallet support</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Phantom, Solflare, and more via Wallet Adapter.</div>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="relative container mx-auto px-4 py-12">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">How it works</h2>
          <ol className="grid md:grid-cols-3 gap-6 list-decimal list-inside text-gray-800 dark:text-gray-200">
            <li>Connect your wallet and set heirs for SOL/tokens</li>
            <li>Keep your activity updated; heirs can claim after the timer</li>
            <li>Manage portfolio, send/receive, and claims in one place</li>
          </ol>
        </div>
      </section>

      <section id="security" className="relative container mx-auto px-4 py-12">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">Security & Trust</h2>
          <div className="grid md:grid-cols-3 gap-6 text-gray-800 dark:text-gray-200">
            <div className="animate-fade-in">
              <div className="font-semibold mb-1">Non-custodial</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Your keys stay in your wallet. All actions require signatures.</div>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '80ms' }}>
              <div className="font-semibold mb-1">On-chain logic</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Inheritance, claims, and activity checks enforced by program.</div>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '160ms' }}>
              <div className="font-semibold mb-1">Open-source</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Transparent codebase with community-driven improvements.</div>
            </div>
          </div>
        </div>
      </section>

      <section id="stats" className="relative container mx-auto px-4 py-12">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">Why users choose Gada</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">1K+</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Transactions processed</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">500+</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Heir designations</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">99.9%</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Uptime & reliability</div>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="relative container mx-auto px-4 py-12">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">FAQ</h2>
          <div className="space-y-4">
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">How do claims work?</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">If the owner is inactive for the set period, designated heirs can claim assets using on-chain verification.</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">Which wallets are supported?</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Phantom and Solflare out of the box; more can be enabled via Wallet Adapter.</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">Are my assets safe?</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Yes. Gada does not custody assets; all logic is executed by audited on-chain programs.</div>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative container mx-auto px-4 py-12">
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">© {new Date().getFullYear()} Gada Wallet. Non-custodial. Open-source.</div>
      </footer>
    </div>
  );
}