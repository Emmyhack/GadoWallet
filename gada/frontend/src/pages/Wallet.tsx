import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { 
  Wallet as WalletIcon, 
  Coins, 
  History, 
  Settings, 
  Copy, 
  ExternalLink, 
  QrCode,
  Eye,
  EyeOff,
  Download,
  Shield,
  Key,
  RefreshCw,
  Plus,
  Send,
  Star,
  Trash2,
  Lock,
  Unlock,
  ArrowRight
} from 'lucide-react';

interface Token {
  mint: string;
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  logo?: string;
}

interface Transaction {
  signature: string;
  type: 'send' | 'receive' | 'swap' | 'stake' | 'unstake';
  amount: string;
  token: string;
  timestamp: number;
  status: 'confirmed' | 'pending' | 'failed';
  from: string;
  to: string;
}

const Wallet = () => {
  const { connected, wallet, disconnect } = useWallet();
  const [activeTab, setActiveTab] = useState<'tokens' | 'history' | 'settings'>('tokens');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [balance, setBalance] = useState('0');

  // Mock data for demonstration
  useEffect(() => {
    if (connected && wallet?.publicKey) {
      // Mock tokens
      setTokens([
        {
          mint: 'So11111111111111111111111111111111111111112',
          symbol: 'SOL',
          name: 'Solana',
          balance: '2.456',
          decimals: 9,
          logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
        },
        {
          mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          symbol: 'USDC',
          name: 'USD Coin',
          balance: '150.00',
          decimals: 6,
          logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
        }
      ]);

      // Mock transactions
      setTransactions([
        {
          signature: '5J7X9K2M1N3P4Q5R6S7T8U9V0W1X2Y3Z4A5B6C7D8E9F0',
          type: 'receive',
          amount: '1.5',
          token: 'SOL',
          timestamp: Date.now() - 3600000,
          status: 'confirmed',
          from: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
          to: wallet.publicKey.toString()
        },
        {
          signature: '1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V',
          type: 'send',
          amount: '0.5',
          token: 'SOL',
          timestamp: Date.now() - 7200000,
          status: 'confirmed',
          from: wallet.publicKey.toString(),
          to: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'
        }
      ]);

      setBalance('2.456');
    }
  }, [connected, wallet?.publicKey]);

  const copyAddress = () => {
    if (wallet?.publicKey) {
      navigator.clipboard.writeText(wallet.publicKey.toString());
    }
  };

  const viewOnExplorer = () => {
    if (wallet?.publicKey) {
      window.open(`https://explorer.solana.com/address/${wallet.publicKey.toString()}`, '_blank');
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const formatAmount = (amount: string, decimals: number) => {
    return parseFloat(amount).toFixed(decimals === 9 ? 4 : 2);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'send': return <Send className="w-4 h-4" />;
      case 'receive': return <Download className="w-4 h-4" />;
      case 'swap': return <ArrowRight className="w-4 h-4" />;
      case 'stake': return <Lock className="w-4 h-4" />;
      case 'unstake': return <Unlock className="w-4 h-4" />;
      default: return <Coins className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-success-500';
      case 'pending': return 'text-warning-500';
      case 'failed': return 'text-error-500';
      default: return 'text-secondary-500';
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-metamask-50 to-metamask-100 flex items-center justify-center">
        <div className="metamask-card p-8 text-center max-w-md">
          <div className="w-20 h-20 bg-metamask-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <WalletIcon className="w-10 h-10 text-metamask-600" />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-metamask-900">Wallet Not Connected</h2>
          <p className="text-metamask-700 mb-6">Please connect your wallet to view your assets and transactions.</p>
          <button className="btn-primary">Connect Wallet</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-metamask-50 to-metamask-100">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="metamask-card p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <div className="w-12 h-12 bg-metamask-600 rounded-full flex items-center justify-center">
                <WalletIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-metamask-900">GadaWallet</h1>
                <p className="text-metamask-700">Your Solana Wallet</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={copyAddress} className="btn-secondary flex items-center gap-2">
                <Copy className="w-4 h-4" />
                {wallet?.publicKey && formatAddress(wallet.publicKey.toString())}
              </button>
              <button onClick={viewOnExplorer} className="btn-secondary">
                <ExternalLink className="w-4 h-4" />
              </button>
              <button className="btn-secondary">
                <QrCode className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <div className="metamask-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-metamask-900">Total Balance</h2>
            <button className="btn-secondary">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <div className="text-3xl font-bold text-metamask-900 mb-2">
            {balance} SOL
          </div>
          <div className="text-metamask-700">≈ $123.45 USD</div>
        </div>

        {/* Quick Actions */}
        <div className="metamask-card p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-metamask-900">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/send" className="btn-primary flex flex-col items-center gap-2 p-4">
              <Send className="w-6 h-6" />
              <span>Send</span>
            </Link>
            <Link to="/receive" className="btn-secondary flex flex-col items-center gap-2 p-4">
              <Download className="w-6 h-6" />
              <span>Receive</span>
            </Link>
            <Link to="/swap" className="btn-secondary flex flex-col items-center gap-2 p-4">
              <ArrowRight className="w-6 h-6" />
              <span>Swap</span>
            </Link>
            <button className="btn-secondary flex flex-col items-center gap-2 p-4">
              <Plus className="w-6 h-6" />
              <span>Buy</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="metamask-card p-6">
          <div className="flex border-b border-metamask-200 mb-6">
            <button
              onClick={() => setActiveTab('tokens')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'tokens'
                  ? 'text-metamask-600 border-b-2 border-metamask-600'
                  : 'text-metamask-700 hover:text-metamask-600'
              }`}
            >
              <Coins className="w-4 h-4 inline mr-2" />
              Tokens
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'history'
                  ? 'text-metamask-600 border-b-2 border-metamask-600'
                  : 'text-metamask-700 hover:text-metamask-600'
              }`}
            >
              <History className="w-4 h-4 inline mr-2" />
              History
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'settings'
                  ? 'text-metamask-600 border-b-2 border-metamask-600'
                  : 'text-metamask-700 hover:text-metamask-600'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Settings
            </button>
          </div>

          {/* Tokens Tab */}
          {activeTab === 'tokens' && (
            <div className="space-y-4">
              {tokens.map((token, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white rounded-xl border border-metamask-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-metamask-100 rounded-full flex items-center justify-center">
                      {token.logo ? (
                        <img src={token.logo} alt={token.symbol} className="w-6 h-6" />
                      ) : (
                        <Coins className="w-5 h-5 text-metamask-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-metamask-900">{token.symbol}</div>
                      <div className="text-sm text-metamask-700">{token.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-metamask-900">
                      {formatAmount(token.balance, token.decimals)} {token.symbol}
                    </div>
                    <div className="text-sm text-metamask-700">≈ $0.00</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {transactions.map((tx, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white rounded-xl border border-metamask-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === 'receive' ? 'bg-success-100' : 'bg-metamask-100'
                    }`}>
                      {getTransactionIcon(tx.type)}
                    </div>
                    <div>
                      <div className="font-semibold text-metamask-900 capitalize">{tx.type}</div>
                      <div className="text-sm text-metamask-700">
                        {new Date(tx.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${
                      tx.type === 'receive' ? 'text-success-600' : 'text-metamask-900'
                    }`}>
                      {tx.type === 'receive' ? '+' : '-'}{tx.amount} {tx.token}
                    </div>
                    <div className={`text-sm ${getStatusColor(tx.status)}`}>
                      {tx.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-metamask-900">Security</h4>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-metamask-200 hover:bg-metamask-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-metamask-600" />
                      <span>Change Password</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-metamask-400" />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-metamask-200 hover:bg-metamask-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Key className="w-5 h-5 text-metamask-600" />
                      <span>Export Private Key</span>
                    </div>
                    <button
                      onClick={() => setShowPrivateKey(!showPrivateKey)}
                      className="text-metamask-600"
                    >
                      {showPrivateKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-metamask-900">Preferences</h4>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-metamask-200 hover:bg-metamask-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Settings className="w-5 h-5 text-metamask-600" />
                      <span>Network Settings</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-metamask-400" />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-metamask-200 hover:bg-metamask-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-metamask-600" />
                      <span>Manage Tokens</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-metamask-400" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-metamask-900">Danger Zone</h4>
                <div className="space-y-3">
                  <button 
                    onClick={disconnect}
                    className="w-full flex items-center justify-between p-4 bg-error-50 rounded-xl border border-error-200 hover:bg-error-100 text-error-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Trash2 className="w-5 h-5" />
                      <span>Disconnect Wallet</span>
                    </div>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wallet;