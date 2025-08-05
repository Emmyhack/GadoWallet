import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Shield, Users, Zap } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-gray-900 rounded-md">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Gada Wallet
              </h1>
              <p className="text-xs text-gray-500">Secure Digital Inheritance</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
              <Zap className="w-4 h-4" />
              <span>Features</span>
            </a>
            <a href="#about" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
              <Users className="w-4 h-4" />
              <span>About</span>
            </a>
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            <WalletMultiButton className="btn-primary" />
          </div>
        </div>
      </div>
    </header>
  );
}