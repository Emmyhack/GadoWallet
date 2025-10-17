import { useEffect, useRef, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import QRCode from 'qrcode';
import { QrCode, Copy, CheckCircle, Sparkles, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function Receive() {
  const { publicKey } = useWallet();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const render = async () => {
      if (publicKey && canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, publicKey.toBase58(), { 
          width: 200, 
          margin: 1,
          color: {
            dark: '#1f2937',
            light: '#ffffff'
          }
        });
      }
    };
    render();
  }, [publicKey]);

  const copy = async () => {
    if (publicKey) {
      try {
        await navigator.clipboard.writeText(publicKey.toBase58());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  if (!publicKey) {
    return (
      <div className="text-center py-12">
        <div className="relative mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-fuchsia-500 to-pink-400 rounded-2xl flex items-center justify-center mx-auto animate-float shadow-2xl shadow-fuchsia-500/25">
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Wallet Not Connected</h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">{t('connectWalletToReceiveFunds')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Receive Card */}
      <div className="relative p-6 rounded-2xl bg-white/60 dark:bg-gray-900/40 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300">
        {/* Decorative gradient background */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-fuchsia-500/5 to-pink-400/5 pointer-events-none" />
        
        <div className="relative">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-400 shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t('receiveSolTokens')}</h3>
              <p className="text-gray-600 dark:text-gray-400">Share your address or QR code to receive funds</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Address Section */}
            <div className="space-y-4">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wide">
                  Your Wallet Address
                </label>
                
                {/* Address Display Card */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 border border-gray-200/50 dark:border-gray-600/50 shadow-inner">
                  <div className="font-mono text-sm leading-relaxed break-all text-gray-900 dark:text-gray-100 bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text text-transparent font-semibold">
                    {publicKey.toBase58()}
                  </div>
                </div>

                {/* Copy Button */}
                <button 
                  onClick={copy} 
                  disabled={copied}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Address Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      <span>{t('copyAddress')}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Address Info */}
              <div className="p-4 rounded-xl bg-blue-500/10 dark:bg-blue-500/5 border border-blue-500/20">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <QrCode className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200">How to Receive</h4>
                    <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                      Share this address or QR code with the sender. Works for SOL and all SPL tokens.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="text-center space-y-2">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">QR Code</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Scan to get wallet address</p>
              </div>

              {/* QR Code Container */}
              <div className="relative">
                <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
                  <div className="relative">
                    <canvas ref={canvasRef} className="block rounded-lg" width={200} height={200} />
                    
                    {/* QR Code Decorative Corner */}
                    <div className="absolute -top-2 -left-2 w-4 h-4 border-l-2 border-t-2 border-fuchsia-500 rounded-tl-md" />
                    <div className="absolute -top-2 -right-2 w-4 h-4 border-r-2 border-t-2 border-fuchsia-500 rounded-tr-md" />
                    <div className="absolute -bottom-2 -left-2 w-4 h-4 border-l-2 border-b-2 border-fuchsia-500 rounded-bl-md" />
                    <div className="absolute -bottom-2 -right-2 w-4 h-4 border-r-2 border-b-2 border-fuchsia-500 rounded-br-md" />
                  </div>
                </div>

                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-fuchsia-500/20 to-pink-500/20 blur-xl -z-10 animate-pulse-soft" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="p-4 rounded-xl bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-amber-500/20 flex-shrink-0">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-200">Security Note</h4>
            <p className="text-xs text-amber-600 dark:text-amber-300 mt-1">
              This address is safe to share publicly. Only send Solana (SOL) or SPL tokens to this address.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}