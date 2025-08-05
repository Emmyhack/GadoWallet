import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Shield, Users, Zap } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Gada Wallet
              </h1>
              <p className="text-xs text-gray-500">Secure Digital Inheritance</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
              <Zap className="w-4 h-4" />
              <span>Features</span>
            </a>
            <a href="#about" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
              <Users className="w-4 h-4" />
              <span>About</span>
            </a>
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            <WalletMultiButton className="btn-primary !bg-blue-600 hover:!bg-blue-700 !text-white !font-medium !py-2 !px-4 !rounded-lg !transition-colors !duration-200 !focus:outline-none !focus:ring-2 !focus:ring-blue-500 !focus:ring-offset-2" />
          </div>
        </div>
      </div>
    </header>
  );
}