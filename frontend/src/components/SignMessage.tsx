import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Key, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function SignMessage() {
  const { publicKey, signMessage } = useWallet();
  const [msg, setMsg] = useState('');
  const [sig, setSig] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const onSign = async () => {
    if (!publicKey || !signMessage) return;
    setLoading(true); setError(''); setSig('');
    try {
      const data = new TextEncoder().encode(msg);
      const signature = await signMessage(data);
      setSig(Buffer.from(signature).toString('base64'));
    } catch (e: any) {
      setError(e?.message || 'Failed to sign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Message Input Card */}
      <div className="relative p-6 rounded-2xl bg-white/60 dark:bg-gray-900/40 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300">
        {/* Decorative gradient background */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-500/5 to-gray-400/5 pointer-events-none" />
        
        <div className="relative space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-slate-500 to-gray-600 shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Message to Sign</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Enter your message for cryptographic signing</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
              Message Content
            </label>
            <textarea 
              value={msg} 
              onChange={(e) => setMsg(e.target.value)} 
              className="w-full px-4 py-3 rounded-xl border border-gray-300/50 dark:border-gray-600/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-slate-500 dark:focus:border-slate-400 focus:ring-2 focus:ring-slate-500/20 transition-all duration-200 resize-none"
              rows={4} 
              placeholder="Enter the message you want to sign..." 
            />
            
            <button 
              onClick={onSign} 
              disabled={!msg || loading || !signMessage} 
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-slate-600 to-gray-600 hover:from-slate-500 hover:to-gray-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white/20 border-t-white rounded-full" />
                  <span>Signing...</span>
                </>
              ) : (
                <>
                  <Key className="w-5 h-5" />
                  <span>{t('signMessage')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Success Result Card */}
      {sig && (
        <div className="relative p-6 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/5 backdrop-blur-xl border border-emerald-500/20 shadow-lg animate-fade-in">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 pointer-events-none" />
          
          <div className="relative space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">Signature Generated</h3>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">Message successfully signed</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-emerald-800 dark:text-emerald-200">
                Signature (Base64)
              </label>
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-500/20">
                <code className="text-xs font-mono text-emerald-800 dark:text-emerald-200 break-all leading-relaxed">
                  {sig}
                </code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Result Card */}
      {error && (
        <div className="relative p-6 rounded-2xl bg-red-500/10 dark:bg-red-500/5 backdrop-blur-xl border border-red-500/20 shadow-lg animate-fade-in">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500/5 to-rose-500/5 pointer-events-none" />
          
          <div className="relative space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 shadow-lg">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Signing Failed</h3>
                <p className="text-sm text-red-600 dark:text-red-400">An error occurred during signing</p>
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-500/20">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Connection Status */}
      {!publicKey && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Wallet Not Connected</h3>
          <p className="text-gray-600 dark:text-gray-400">Connect your wallet to sign messages</p>
        </div>
      )}
    </div>
  );
}