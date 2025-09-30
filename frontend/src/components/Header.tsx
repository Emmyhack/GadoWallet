import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import i18n from '../lib/i18n';
import { useTheme } from '../lib/theme';
import NotificationSystem from './NotificationSystem';
import Logo from './Logo';

export function Header() {
  const { gradient, setGradient, gradientClasses } = useTheme();
  const { connected } = useWallet();

  return (
    <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 text-white sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Professional Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Logo size="lg" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Gado Wallet
              </h1>
              <p className="text-sm text-gray-300 font-medium">Professional Web3 Inheritance</p>
            </div>
          </div>

          {/* Professional Controls */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <div className="relative">
              <select 
                defaultValue={i18n.language} 
                onChange={(e) => i18n.changeLanguage(e.target.value)} 
                className="appearance-none bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm font-medium"
              >
                <option value="en">🇺🇸 English</option>
                <option value="es">🇪🇸 Español</option>
                <option value="yo">🇳🇬 Yorùbá</option>
                <option value="ha">🇳🇬 Hausa</option>
                <option value="fr">🇫🇷 Français</option>
                <option value="zh">🇨🇳 中文</option>
              </select>
            </div>

            {/* Theme Selector */}
            <div className="relative">
              <select 
                value={gradient} 
                onChange={(e) => setGradient(e.target.value as any)} 
                className="appearance-none bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm font-medium"
              >
                <option value="brand">🎨 Brand</option>
                <option value="ocean">🌊 Ocean</option>
                <option value="sunset">🌅 Sunset</option>
                <option value="forest">🌲 Forest</option>
              </select>
            </div>

            {/* Notification System */}
            {connected && (
              <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                <NotificationSystem />
              </div>
            )}
            
            {/* Professional Wallet Button */}
            <WalletMultiButton className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 text-white font-bold py-3 px-6 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-200 border-none" />
          </div>
        </div>
      </div>
    </header>
  );
}