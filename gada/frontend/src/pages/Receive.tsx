import { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { 
  Download, 
  ArrowLeft, 
  Copy, 
  Share2,
  ExternalLink,
  CheckCircle,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';

const Receive = () => {
  const { connected, wallet } = useWallet();
  const [copied, setCopied] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  const copyAddress = () => {
    if (wallet?.publicKey) {
      navigator.clipboard.writeText(wallet.publicKey.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareAddress = () => {
    if (wallet?.publicKey && navigator.share) {
      navigator.share({
        title: 'My Solana Address',
        text: `Send me SOL: ${wallet.publicKey.toString()}`,
        url: `https://explorer.solana.com/address/${wallet.publicKey.toString()}`
      });
    }
  };

  const viewOnExplorer = () => {
    if (wallet?.publicKey) {
      window.open(`https://explorer.solana.com/address/${wallet.publicKey.toString()}`, '_blank');
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  // Generate QR code data URL (simplified)
  const generateQRCode = (text: string) => {
    // In a real implementation, you'd use a QR code library
    // For now, we'll use a placeholder
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <text x="100" y="100" text-anchor="middle" dy=".3em" font-family="monospace" font-size="8">${text}</text>
      </svg>
    `)}`;
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-phantom-50 to-phantom-100 flex items-center justify-center">
        <div className="glass-card p-8 text-center max-w-md">
          <Download className="w-16 h-16 mx-auto mb-4 text-phantom-600" />
          <h2 className="text-2xl font-bold mb-4">Wallet Not Connected</h2>
          <p className="text-secondary-600 mb-6">Please connect your wallet to receive tokens.</p>
          <button className="btn-primary">Connect Wallet</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-phantom-50 to-phantom-100">
      <div className="max-w-2xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button 
              onClick={() => window.history.back()}
              className="btn-secondary"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-phantom-900">Receive</h1>
              <p className="text-secondary-600">Share your address to receive tokens</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 space-y-6">
          {/* QR Code */}
          <div className="text-center">
            <div className="inline-block p-4 bg-white rounded-lg border border-secondary-200">
              <img 
                src={generateQRCode(wallet?.publicKey?.toString() || '')}
                alt="QR Code"
                className="w-48 h-48"
              />
            </div>
            <p className="text-sm text-secondary-600 mt-2">Scan to send SOL</p>
          </div>

          {/* Address Display */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-phantom-900 mb-2">
                Your Address
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={wallet?.publicKey?.toString() || ''}
                  readOnly
                  className="w-full p-4 bg-white rounded-lg border border-secondary-200 font-mono text-sm"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                  <button 
                    onClick={copyAddress}
                    className={`btn-secondary p-2 ${copied ? 'text-success-600' : ''}`}
                  >
                    {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button onClick={shareAddress} className="btn-secondary p-2">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {copied && (
                <p className="text-success-600 text-sm mt-1">Address copied to clipboard!</p>
              )}
            </div>

            {/* Short Address */}
            <div className="flex items-center justify-between p-4 bg-phantom-50 rounded-lg">
              <div>
                <div className="text-sm text-secondary-600">Short Address</div>
                <div className="font-mono text-phantom-900">
                  {wallet?.publicKey && formatAddress(wallet.publicKey.toString())}
                </div>
              </div>
              <button onClick={copyAddress} className="btn-secondary">
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <button 
              onClick={viewOnExplorer}
              className="w-full flex items-center justify-between p-4 bg-white rounded-lg border border-secondary-200 hover:bg-phantom-50"
            >
              <div className="flex items-center gap-3">
                <ExternalLink className="w-5 h-5 text-phantom-600" />
                <span>View on Explorer</span>
              </div>
              <ExternalLink className="w-4 h-4 text-secondary-400" />
            </button>

            <button 
              onClick={() => setShowPrivateKey(!showPrivateKey)}
              className="w-full flex items-center justify-between p-4 bg-white rounded-lg border border-secondary-200 hover:bg-phantom-50"
            >
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-phantom-600" />
                <span>Show Private Key</span>
              </div>
              <button className="text-phantom-600">
                {showPrivateKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </button>
          </div>

          {/* Private Key Display */}
          {showPrivateKey && (
            <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-warning-600" />
                <span className="font-semibold text-warning-800">Security Warning</span>
              </div>
              <p className="text-warning-700 text-sm mb-3">
                Never share your private key with anyone. Anyone with access to your private key can control your wallet.
              </p>
              <div className="bg-white p-3 rounded border border-warning-200">
                <div className="font-mono text-xs text-warning-800 break-all">
                  {wallet?.publicKey ? 'Private key would be displayed here in a real implementation' : 'No private key available'}
                </div>
              </div>
            </div>
          )}

          {/* Information */}
          <div className="space-y-4">
            <div className="p-4 bg-phantom-50 rounded-lg">
              <h3 className="font-semibold text-phantom-900 mb-2">How to receive tokens</h3>
              <ul className="text-sm text-secondary-600 space-y-1">
                <li>• Share your address with the sender</li>
                <li>• They can scan the QR code or copy the address</li>
                <li>• Tokens will appear in your wallet once confirmed</li>
                <li>• Only send SOL and SPL tokens to this address</li>
              </ul>
            </div>

            <div className="p-4 bg-warning-50 rounded-lg">
              <h3 className="font-semibold text-warning-800 mb-2">Important</h3>
              <ul className="text-sm text-warning-700 space-y-1">
                <li>• Only send SOL and SPL tokens to this address</li>
                <li>• Sending other cryptocurrencies may result in permanent loss</li>
                <li>• Double-check the address before sending</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Receive;