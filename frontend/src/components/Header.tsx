import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import i18n from '../lib/i18n';
import { useTheme } from '../lib/theme';
import { useCivicAuth } from '../lib/civic';

export function Header() {
  const { gradient, setGradient, gradientClasses } = useTheme();
  const { connected } = useWallet();
  
  // Use Civic auth with error boundary protection
  let civicAuthData;
  try {
    civicAuthData = useCivicAuth();
  } catch (error) {
    console.info('Civic auth not available in Header - using defaults');
    civicAuthData = {
      isVerified: false,
      verificationStatus: 'unverified' as const,
      requestVerification: async () => {},
      isVerifying: false
    };
  }
  
  const { isVerified, verificationStatus, requestVerification, isVerifying } = civicAuthData;

  return (
    <header className={`bg-gradient-to-r ${gradientClasses} text-white sticky top-0 z-50`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-white/10 rounded-md overflow-hidden">
              <img src="/logo.png" alt="Gado Wallet Logo" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">
                Gado Wallet
              </h1>
              <p className="text-xs text-white/80">{i18n.t('tagline')}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-3">
            <select defaultValue={i18n.language} onChange={(e) => i18n.changeLanguage(e.target.value)} className="text-sm bg-black/30 text-white border border-white/20 rounded-md px-2 py-1 focus:outline-none">
              <option value="en">EN</option>
              <option value="es">ES</option>
              <option value="yo">Yorùbá</option>
              <option value="ha">Hausa</option>
              <option value="fr">Français</option>
              <option value="zh">中文</option>
            </select>

            <select value={gradient} onChange={(e) => setGradient(e.target.value as any)} className="text-sm bg-black/30 text-white border border-white/20 rounded-md px-2 py-1 focus:outline-none">
              <option value="brand">Brand</option>
              <option value="ocean">Ocean</option>
              <option value="sunset">Sunset</option>
              <option value="forest">Forest</option>
            </select>
            
            {/* Civic Verification Badge */}
            {connected && (
              <div className="flex items-center space-x-2">
                {verificationStatus === 'verified' ? (
                  <div className="flex items-center space-x-1 bg-green-500/20 text-green-100 px-2 py-1 rounded-md text-xs font-medium">
                    <CheckCircle className="w-3 h-3" />
                    <span>Verified</span>
                  </div>
                ) : verificationStatus === 'pending' ? (
                  <div className="flex items-center space-x-1 bg-yellow-500/20 text-yellow-100 px-2 py-1 rounded-md text-xs font-medium">
                    <div className="w-3 h-3 border border-yellow-300 border-t-transparent rounded-full animate-spin"></div>
                    <span>Verifying</span>
                  </div>
                ) : (
                  <button
                    onClick={requestVerification}
                    disabled={isVerifying}
                    className="flex items-center space-x-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 px-2 py-1 rounded-md text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    <Shield className="w-3 h-3" />
                    <span>Verify</span>
                  </button>
                )}
              </div>
            )}
            
            <WalletMultiButton className="bg-white text-gray-900 hover:bg-gray-100 font-medium py-2 px-3 rounded-md" />
          </div>
        </div>
      </div>
    </header>
  );
}