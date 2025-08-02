import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Zap, TrendingUp, Lock, Globe, Smartphone, Wallet } from 'lucide-react';

const LandingPageStitch = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-metamask-50 via-white to-metamask-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-metamask-100 text-metamask-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              Trusted by 10M+ users worldwide
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-metamask-900 mb-6">
              GadaWallet
            </h1>
            <p className="text-xl md:text-2xl text-metamask-700 mb-8 max-w-3xl mx-auto leading-relaxed">
              The most secure and user-friendly Solana wallet. Manage your digital assets with confidence and style.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/wallet"
                className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/dashboard"
                className="btn-secondary text-lg px-8 py-4"
              >
                View Dashboard
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-metamask-600">$2.5B+</div>
                <div className="text-sm text-metamask-600">Assets Secured</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-metamask-600">10M+</div>
                <div className="text-sm text-metamask-600">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-metamask-600">99.9%</div>
                <div className="text-sm text-metamask-600">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-metamask-900 mb-4">
              Why Choose GadaWallet?
            </h2>
            <p className="text-xl text-metamask-700 max-w-2xl mx-auto">
              Built with security and ease of use in mind, GadaWallet provides everything you need for managing your Solana assets.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="metamask-card p-8 text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-metamask-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-metamask-200 transition-colors">
                <Lock className="w-8 h-8 text-metamask-600" />
              </div>
              <h3 className="text-2xl font-bold text-metamask-900 mb-4">Secure</h3>
              <p className="text-metamask-700 leading-relaxed">
                Your private keys are encrypted and stored securely. We never have access to your funds.
              </p>
            </div>
            
            <div className="metamask-card p-8 text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-metamask-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-metamask-200 transition-colors">
                <Zap className="w-8 h-8 text-metamask-600" />
              </div>
              <h3 className="text-2xl font-bold text-metamask-900 mb-4">Lightning Fast</h3>
              <p className="text-metamask-700 leading-relaxed">
                Lightning-fast transactions and real-time updates. Experience the speed of Solana.
              </p>
            </div>
            
            <div className="metamask-card p-8 text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-metamask-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-metamask-200 transition-colors">
                <Smartphone className="w-8 h-8 text-metamask-600" />
              </div>
              <h3 className="text-2xl font-bold text-metamask-900 mb-4">User-Friendly</h3>
              <p className="text-metamask-700 leading-relaxed">
                Intuitive interface designed for both beginners and advanced users.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gradient-to-br from-metamask-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-metamask-900 mb-6">
                Everything you need in one wallet
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-metamask-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-metamask-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-metamask-900 mb-2">Multi-Chain Support</h3>
                    <p className="text-metamask-700">Support for Solana and other major blockchains</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-metamask-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Globe className="w-4 h-4 text-metamask-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-metamask-900 mb-2">DeFi Integration</h3>
                    <p className="text-metamask-700">Access to all major DeFi protocols and dApps</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-metamask-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-metamask-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-metamask-900 mb-2">Portfolio Tracking</h3>
                    <p className="text-metamask-700">Real-time portfolio tracking and analytics</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="metamask-card p-8">
              <div className="aspect-square bg-gradient-to-br from-metamask-100 to-metamask-200 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-metamask-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Wallet className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-metamask-900 mb-2">Your Digital Wallet</h3>
                  <p className="text-metamask-700">Secure, fast, and reliable</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-metamask-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-metamask-700 max-w-2xl mx-auto">
              Get started with GadaWallet in just a few simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-metamask-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-lg font-semibold text-metamask-900 mb-2">Connect</h3>
              <p className="text-metamask-700">Connect your wallet securely</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-metamask-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-lg font-semibold text-metamask-900 mb-2">Import</h3>
              <p className="text-metamask-700">Import your existing assets</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-metamask-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-lg font-semibold text-metamask-900 mb-2">Manage</h3>
              <p className="text-metamask-700">Manage and track your portfolio</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-metamask-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">4</span>
              </div>
              <h3 className="text-lg font-semibold text-metamask-900 mb-2">Trade</h3>
              <p className="text-metamask-700">Send, receive, and swap tokens</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 metamask-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-8 leading-relaxed">
            Join millions of users who trust GadaWallet for their Solana transactions.
          </p>
          <Link
            to="/wallet"
            className="bg-white text-metamask-600 hover:bg-metamask-50 font-bold py-4 px-8 rounded-xl inline-flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Connect Wallet
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-metamask-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">GadaWallet</h3>
              <p className="text-metamask-300 text-sm">
                The most secure and user-friendly Solana wallet for managing your digital assets.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-metamask-300">
                <li><Link to="/wallet" className="hover:text-white transition-colors">Wallet</Link></li>
                <li><Link to="/send" className="hover:text-white transition-colors">Send</Link></li>
                <li><Link to="/receive" className="hover:text-white transition-colors">Receive</Link></li>
                <li><Link to="/swap" className="hover:text-white transition-colors">Swap</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-metamask-300">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-metamask-300">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-metamask-800 mt-8 pt-8 text-center">
            <p className="text-metamask-300 text-sm">
              © 2024 GadaWallet. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPageStitch; 