import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { CheckCircle } from 'lucide-react';
import i18n from '../lib/i18n';
import NotificationSystem from './NotificationSystem';
import Logo from './Logo';

export function Header() {
  const { connected } = useWallet();

  return (
    <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 text-white sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Logo size="md" />
          </div>

          {/* Navigation & Controls */}
          <div className="flex items-center space-x-6">
            {/* Language Controls */}
            <div className="flex items-center space-x-4">
              <select
                value={i18n.language}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="en" className="bg-gray-800">English</option>
                <option value="es" className="bg-gray-800">Español</option>
                <option value="fr" className="bg-gray-800">Français</option>
              </select>
            </div>

            {/* Status Indicators */}
            {connected && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 px-3 py-2 bg-green-500/20 rounded-lg border border-green-500/30">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-green-200">Connected</span>
                </div>
                
                <NotificationSystem />
              </div>
            )}

            {/* Wallet Connection */}
            <WalletMultiButton className="!bg-gradient-to-r !from-blue-600 !to-purple-600 hover:!from-blue-700 hover:!to-purple-700 !border-none !rounded-xl !px-6 !py-3 !font-semibold !transition-all !duration-300 transform hover:!scale-105" />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;