import { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { 
  Send as SendIcon, 
  ArrowLeft, 
  Copy, 
  QrCode, 
  Coins, 
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronDown,
  ExternalLink
} from 'lucide-react';

interface Token {
  mint: string;
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  logo?: string;
}

const Send = () => {
  const { connected } = useWallet();
  const [step, setStep] = useState<'input' | 'confirm' | 'success'>('input');
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [showTokenSelector, setShowTokenSelector] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Mock tokens
  const tokens: Token[] = [
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
  ];

  const handleTokenSelect = (token: Token) => {
    setSelectedToken(token);
    setShowTokenSelector(false);
  };

  const handleContinue = () => {
    if (!selectedToken) {
      setError('Please select a token');
      return;
    }
    if (!recipient) {
      setError('Please enter recipient address');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (parseFloat(amount) > parseFloat(selectedToken.balance)) {
      setError('Insufficient balance');
      return;
    }
    setError('');
    setStep('confirm');
  };

  const handleSend = async () => {
    setLoading(true);
    // Simulate transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    setStep('success');
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(recipient);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const isValidAddress = (address: string) => {
    return address.length === 44 && /^[A-Za-z0-9]+$/.test(address);
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-metamask-50 to-metamask-100 flex items-center justify-center">
        <div className="metamask-card p-8 text-center max-w-md">
          <div className="w-20 h-20 bg-metamask-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <SendIcon className="w-10 h-10 text-metamask-600" />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-metamask-900">Wallet Not Connected</h2>
          <p className="text-metamask-700 mb-6">Please connect your wallet to send tokens.</p>
          <button className="btn-primary">Connect Wallet</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-metamask-50 to-metamask-100">
      <div className="max-w-2xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="metamask-card p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button 
              onClick={() => window.history.back()}
              className="btn-secondary"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-metamask-900">Send</h1>
              <p className="text-metamask-700">Transfer tokens to another wallet</p>
            </div>
          </div>
        </div>

        {step === 'input' && (
          <div className="glass-card p-6 space-y-6">
            {/* Token Selection */}
            <div>
              <label className="block text-sm font-medium text-phantom-900 mb-2">
                Select Token
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowTokenSelector(!showTokenSelector)}
                  className="w-full flex items-center justify-between p-4 bg-white rounded-lg border border-secondary-200 hover:border-phantom-300"
                >
                  <div className="flex items-center gap-3">
                    {selectedToken ? (
                      <>
                        <div className="w-8 h-8 bg-phantom-100 rounded-full flex items-center justify-center">
                          {selectedToken.logo ? (
                            <img src={selectedToken.logo} alt={selectedToken.symbol} className="w-5 h-5" />
                          ) : (
                            <Coins className="w-4 h-4 text-phantom-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-phantom-900">{selectedToken.symbol}</div>
                          <div className="text-sm text-secondary-600">Balance: {selectedToken.balance}</div>
                        </div>
                      </>
                    ) : (
                      <span className="text-secondary-500">Select a token</span>
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-secondary-400" />
                </button>

                {showTokenSelector && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-secondary-200 rounded-lg shadow-lg z-10">
                    {tokens.map((token, index) => (
                      <button
                        key={index}
                        onClick={() => handleTokenSelect(token)}
                        className="w-full flex items-center gap-3 p-4 hover:bg-phantom-50 border-b border-secondary-100 last:border-b-0"
                      >
                        <div className="w-8 h-8 bg-phantom-100 rounded-full flex items-center justify-center">
                          {token.logo ? (
                            <img src={token.logo} alt={token.symbol} className="w-5 h-5" />
                          ) : (
                            <Coins className="w-4 h-4 text-phantom-600" />
                          )}
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-phantom-900">{token.symbol}</div>
                          <div className="text-sm text-secondary-600">{token.name}</div>
                        </div>
                        <div className="ml-auto text-right">
                          <div className="font-semibold text-phantom-900">{token.balance}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recipient Address */}
            <div>
              <label className="block text-sm font-medium text-phantom-900 mb-2">
                Recipient Address
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Enter Solana address"
                  className="w-full p-4 bg-white rounded-lg border border-secondary-200 focus:border-phantom-500 focus:ring-1 focus:ring-phantom-500"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                  <button onClick={copyAddress} className="btn-secondary p-2">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button className="btn-secondary p-2">
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {recipient && !isValidAddress(recipient) && (
                <p className="text-error-500 text-sm mt-1">Invalid Solana address</p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-phantom-900 mb-2">
                Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full p-4 bg-white rounded-lg border border-secondary-200 focus:border-phantom-500 focus:ring-1 focus:ring-phantom-500"
                />
                {selectedToken && (
                  <button
                    onClick={() => setAmount(selectedToken.balance)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-phantom-600 text-sm font-medium"
                  >
                    MAX
                  </button>
                )}
              </div>
              {selectedToken && (
                <p className="text-secondary-600 text-sm mt-1">
                  Available: {selectedToken.balance} {selectedToken.symbol}
                </p>
              )}
            </div>

            {/* Memo */}
            <div>
              <label className="block text-sm font-medium text-phantom-900 mb-2">
                Memo (Optional)
              </label>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="Add a note to this transaction"
                className="w-full p-4 bg-white rounded-lg border border-secondary-200 focus:border-phantom-500 focus:ring-1 focus:ring-phantom-500"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-4 bg-error-50 border border-error-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-error-500" />
                <span className="text-error-700">{error}</span>
              </div>
            )}

            <button
              onClick={handleContinue}
              disabled={!selectedToken || !recipient || !amount}
              className="w-full btn-primary"
            >
              Continue
            </button>
          </div>
        )}

        {step === 'confirm' && (
          <div className="glass-card p-6 space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-phantom-900 mb-2">Confirm Transaction</h2>
              <p className="text-secondary-600">Review the details before sending</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-secondary-200">
                <span className="text-secondary-600">Token</span>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-phantom-100 rounded-full flex items-center justify-center">
                    {selectedToken?.logo ? (
                      <img src={selectedToken.logo} alt={selectedToken.symbol} className="w-4 h-4" />
                    ) : (
                      <Coins className="w-3 h-3 text-phantom-600" />
                    )}
                  </div>
                  <span className="font-semibold text-phantom-900">{selectedToken?.symbol}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-secondary-200">
                <span className="text-secondary-600">Amount</span>
                <span className="font-semibold text-phantom-900">
                  {amount} {selectedToken?.symbol}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-secondary-200">
                <span className="text-secondary-600">To</span>
                <div className="text-right">
                  <div className="font-semibold text-phantom-900">{formatAddress(recipient)}</div>
                  <button 
                    onClick={() => window.open(`https://explorer.solana.com/address/${recipient}`, '_blank')}
                    className="text-sm text-phantom-600 hover:text-phantom-700"
                  >
                    View on Explorer <ExternalLink className="w-3 h-3 inline" />
                  </button>
                </div>
              </div>

              {memo && (
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-secondary-200">
                  <span className="text-secondary-600">Memo</span>
                  <span className="font-semibold text-phantom-900">{memo}</span>
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-secondary-200">
                <span className="text-secondary-600">Network Fee</span>
                <span className="font-semibold text-phantom-900">~0.000005 SOL</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep('input')}
                className="flex-1 btn-secondary"
              >
                Back
              </button>
              <button
                onClick={handleSend}
                disabled={loading}
                className="flex-1 btn-primary"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 animate-spin" />
                    Sending...
                  </div>
                ) : (
                  'Send Transaction'
                )}
              </button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="glass-card p-6 text-center space-y-6">
            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-success-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-phantom-900 mb-2">Transaction Sent!</h2>
              <p className="text-secondary-600">Your transaction has been submitted to the network.</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-secondary-200">
                <span className="text-secondary-600">Transaction ID</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-phantom-900">5J7X9K2M1N3P4Q5R6S7T8U9V0W1X2Y3Z4A5B6C7D8E9F0</span>
                  <button className="btn-secondary p-1">
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setStep('input')}
                className="flex-1 btn-secondary"
              >
                Send Another
              </button>
              <button
                onClick={() => window.history.back()}
                className="flex-1 btn-primary"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Send;