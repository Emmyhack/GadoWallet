import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Shield } from 'lucide-react';
import i18n from '../lib/i18n';
import { useTheme } from '../lib/theme';

export function Header() {
  const { gradient, setGradient, gradientClasses } = useTheme();

  return (
    <header className={`bg-gradient-to-r ${gradientClasses} text-white sticky top-0 z-50`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-white/10 rounded-md">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">
                Gada Wallet
              </h1>
              <p className="text-xs text-white/80">Secure Digital Inheritance</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-3">
            <select defaultValue={i18n.language} onChange={(e) => i18n.changeLanguage(e.target.value)} className="text-sm bg-white/10 border border-white/20 rounded-md px-2 py-1 focus:outline-none">
              <option value="en">EN</option>
              <option value="es">ES</option>
            </select>

            <select value={gradient} onChange={(e) => setGradient(e.target.value as any)} className="text-sm bg-white/10 border border-white/20 rounded-md px-2 py-1 focus:outline-none">
              <option value="brand">Brand</option>
              <option value="ocean">Ocean</option>
              <option value="sunset">Sunset</option>
              <option value="forest">Forest</option>
            </select>
            <WalletMultiButton className="bg-white text-gray-900 hover:bg-gray-100 font-medium py-2 px-3 rounded-md" />
          </div>
        </div>
      </div>
    </header>
  );
}