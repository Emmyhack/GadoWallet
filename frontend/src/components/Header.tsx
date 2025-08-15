import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Shield, Users, Zap } from 'lucide-react';
import { useState } from 'react';
import i18n from '../lib/i18n';

export function Header() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [lang, setLang] = useState<'en' | 'es'>('en');

  const onTheme = (t: 'light' | 'dark') => {
    setTheme(t);
    document.documentElement.classList.toggle('dark', t === 'dark');
    document.body.className = t === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900';
  };

  const onLang = (l: 'en' | 'es') => {
    setLang(l);
    i18n.changeLanguage(l);
  };

  return (
    <header className="bg-gradient-to-r from-gray-900 to-gray-700 text-white sticky top-0 z-50">
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
            <select value={lang} onChange={(e) => onLang(e.target.value as any)} className="text-sm bg-white/10 border border-white/20 rounded-md px-2 py-1 focus:outline-none">
              <option value="en">EN</option>
              <option value="es">ES</option>
            </select>
            <select value={theme} onChange={(e) => onTheme(e.target.value as any)} className="text-sm bg-white/10 border border-white/20 rounded-md px-2 py-1 focus:outline-none">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
            <WalletMultiButton className="bg-white text-gray-900 hover:bg-gray-100 font-medium py-2 px-3 rounded-md" />
          </div>
        </div>
      </div>
    </header>
  );
}