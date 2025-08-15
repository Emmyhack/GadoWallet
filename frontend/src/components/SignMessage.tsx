import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Key } from 'lucide-react';

export function SignMessage() {
  const { publicKey, signMessage } = useWallet();
  const [msg, setMsg] = useState('');
  const [sig, setSig] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

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
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center space-x-3 mb-2">
        <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-gray-700 rounded-md flex items-center justify-center">
          <Key className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Sign Message</h2>
          <p className="text-gray-600">Sign an arbitrary message with your wallet</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
        <textarea value={msg} onChange={(e) => setMsg(e.target.value)} className="input-field" rows={4} placeholder="Enter message to sign" />

        <button onClick={onSign} disabled={!msg || loading || !signMessage} className="btn-primary w-full mt-4 bg-gradient-to-r from-gray-900 to-gray-700">
          {loading ? 'Signing...' : 'Sign Message'}
        </button>

        {sig && (
          <div className="mt-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-md text-xs break-all">Signature (base64): {sig}</div>
        )}
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm">{error}</div>
        )}
      </div>
    </div>
  );
}