import { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { 
  ArrowLeft, 
  ArrowRight,
  ChevronDown,
  Coins,
  AlertCircle,
  CheckCircle,
  Clock,
  Settings,
  Copy
} from 'lucide-react';

interface Token {
  mint: string;
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  logo?: string;
  price?: number;
}

const Swap = () => {
  const { connected } = useWallet();
  const [step, setStep] = useState<'input' | 'confirm' | 'success'>('input');
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [showFromSelector, setShowFromSelector] = useState(false);
  const [showToSelector, setShowToSelector] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [showSlippage, setShowSlippage] = useState(false);

  // Mock tokens with prices
  const tokens: Token[] = [
    {
      mint: 'So11111111111111111111111111111111111111112',
      symbol: 'SOL',
      name: 'Solana',
      balance: '2.456',
      decimals: 9,
      price: 50.25,
      logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
    },
    {
      mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      symbol: 'USDC',
      name: 'USD Coin',
      balance: '150.00',
      decimals: 6,
      price: 1.00,
      logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
    },
    {
      mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
      symbol: 'USDT',
      name: 'Tether USD',
      balance: '0.00',
      decimals: 6,
      price: 1.00,
      logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png'
    }
  ];

  // Calculate swap amount
  useEffect(() => {
    if (fromToken && toToken && fromAmount && parseFloat(fromAmount) > 0) {
      const fromValue = parseFloat(fromAmount) * (fromToken.price || 0);
      const toValue = fromValue / (toToken.price || 1);
      setToAmount(toValue.toFixed(6));
    } else {
      setToAmount('');
    }
  }, [fromToken, toToken, fromAmount]);

  const handleTokenSelect = (token: Token, isFrom: boolean) => {
    if (isFrom) {
      setFromToken(token);
      setShowFromSelector(false);
    } else {
      setToToken(token);
      setShowToSelector(false);
    }
  };

  const switchTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(toAmount);
    setToAmount('');
  };

  const handleSwap = async () => {
    if (!fromToken || !toToken || !fromAmount || !toAmount) {
      setError('Please fill in all fields');
      return;
    }
    if (parseFloat(fromAmount) > parseFloat(fromToken.balance)) {
      setError('Insufficient balance');
      return;
    }
    setError('');
    setStep('confirm');
  };

  const executeSwap = async () => {
    setLoading(true);
    // Simulate swap transaction
    await new Promise(resolve => setTimeout(resolve, 3000));
    setLoading(false);
    setStep('success');
  };



  const getPriceImpact = () => {
    if (!fromToken || !toToken || !fromAmount || !toAmount) return 0;
    // Mock price impact calculation
    return 0.12;
  };

  const getMinimumReceived = () => {
    if (!toAmount) return '0';
    const slippageMultiplier = 1 - (slippage / 100);
    return (parseFloat(toAmount) * slippageMultiplier).toFixed(6);
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-phantom-50 to-phantom-100 flex items-center justify-center">
        <div className="glass-card p-8 text-center max-w-md">
          <ArrowRight className="w-16 h-16 mx-auto mb-4 text-phantom-600" />
          <h2 className="text-2xl font-bold mb-4">Wallet Not Connected</h2>
          <p className="text-secondary-600 mb-6">Please connect your wallet to swap tokens.</p>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => window.history.back()}
                className="btn-secondary"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-phantom-900">Swap</h1>
                <p className="text-secondary-600">Exchange tokens instantly</p>
              </div>
            </div>
            <button 
              onClick={() => setShowSlippage(!showSlippage)}
              className="btn-secondary"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {step === 'input' && (
          <div className="glass-card p-6 space-y-6">
            {/* Slippage Settings */}
            {showSlippage && (
              <div className="p-4 bg-phantom-50 rounded-lg">
                <h3 className="font-semibold text-phantom-900 mb-3">Slippage Tolerance</h3>
                <div className="flex gap-2 mb-3">
                  {[0.1, 0.5, 1.0].map((value) => (
                    <button
                      key={value}
                      onClick={() => setSlippage(value)}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        slippage === value
                          ? 'bg-phantom-600 text-white'
                          : 'bg-white text-phantom-600 border border-phantom-200'
                      }`}
                    >
                      {value}%
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={slippage}
                    onChange={(e) => setSlippage(parseFloat(e.target.value) || 0)}
                    className="flex-1 p-2 bg-white rounded border border-secondary-200 text-sm"
                    placeholder="Custom"
                  />
                  <span className="text-sm text-secondary-600">%</span>
                </div>
              </div>
            )}

            {/* From Token */}
            <div>
              <label className="block text-sm font-medium text-phantom-900 mb-2">
                From
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowFromSelector(!showFromSelector)}
                  className="w-full flex items-center justify-between p-4 bg-white rounded-lg border border-secondary-200 hover:border-phantom-300"
                >
                  <div className="flex items-center gap-3">
                    {fromToken ? (
                      <>
                        <div className="w-8 h-8 bg-phantom-100 rounded-full flex items-center justify-center">
                          {fromToken.logo ? (
                            <img src={fromToken.logo} alt={fromToken.symbol} className="w-5 h-5" />
                          ) : (
                            <Coins className="w-4 h-4 text-phantom-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-phantom-900">{fromToken.symbol}</div>
                          <div className="text-sm text-secondary-600">Balance: {fromToken.balance}</div>
                        </div>
                      </>
                    ) : (
                      <span className="text-secondary-500">Select token</span>
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-secondary-400" />
                </button>

                {showFromSelector && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-secondary-200 rounded-lg shadow-lg z-10">
                    {tokens.map((token, index) => (
                      <button
                        key={index}
                        onClick={() => handleTokenSelect(token, true)}
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

              <div className="mt-3">
                <input
                  type="number"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full p-4 bg-white rounded-lg border border-secondary-200 focus:border-phantom-500 focus:ring-1 focus:ring-phantom-500"
                />
                {fromToken && (
                  <div className="flex justify-between mt-2">
                    <span className="text-sm text-secondary-600">
                      ≈ ${fromAmount && fromToken.price ? (parseFloat(fromAmount) * fromToken.price).toFixed(2) : '0.00'}
                    </span>
                    <button
                      onClick={() => setFromAmount(fromToken.balance)}
                      className="text-phantom-600 text-sm font-medium"
                    >
                      MAX
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Switch Button */}
            <div className="flex justify-center">
              <button
                onClick={switchTokens}
                className="w-10 h-10 bg-phantom-100 rounded-full flex items-center justify-center hover:bg-phantom-200"
              >
                <ArrowRight className="w-5 h-5 text-phantom-600" />
              </button>
            </div>

            {/* To Token */}
            <div>
              <label className="block text-sm font-medium text-phantom-900 mb-2">
                To
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowToSelector(!showToSelector)}
                  className="w-full flex items-center justify-between p-4 bg-white rounded-lg border border-secondary-200 hover:border-phantom-300"
                >
                  <div className="flex items-center gap-3">
                    {toToken ? (
                      <>
                        <div className="w-8 h-8 bg-phantom-100 rounded-full flex items-center justify-center">
                          {toToken.logo ? (
                            <img src={toToken.logo} alt={toToken.symbol} className="w-5 h-5" />
                          ) : (
                            <Coins className="w-4 h-4 text-phantom-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-phantom-900">{toToken.symbol}</div>
                          <div className="text-sm text-secondary-600">Balance: {toToken.balance}</div>
                        </div>
                      </>
                    ) : (
                      <span className="text-secondary-500">Select token</span>
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-secondary-400" />
                </button>

                {showToSelector && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-secondary-200 rounded-lg shadow-lg z-10">
                    {tokens.map((token, index) => (
                      <button
                        key={index}
                        onClick={() => handleTokenSelect(token, false)}
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

              <div className="mt-3">
                <input
                  type="number"
                  value={toAmount}
                  onChange={(e) => setToAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full p-4 bg-white rounded-lg border border-secondary-200 focus:border-phantom-500 focus:ring-1 focus:ring-phantom-500"
                />
                {toToken && (
                  <div className="flex justify-between mt-2">
                    <span className="text-sm text-secondary-600">
                      ≈ ${toAmount && toToken.price ? (parseFloat(toAmount) * toToken.price).toFixed(2) : '0.00'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Swap Details */}
            {fromToken && toToken && fromAmount && toAmount && (
              <div className="p-4 bg-phantom-50 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-600">Rate</span>
                  <span className="text-sm text-phantom-900">
                    1 {fromToken.symbol} = {(toToken.price! / fromToken.price!).toFixed(6)} {toToken.symbol}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-600">Price Impact</span>
                  <span className={`text-sm ${getPriceImpact() > 1 ? 'text-error-600' : 'text-phantom-900'}`}>
                    {getPriceImpact().toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-600">Minimum Received</span>
                  <span className="text-sm text-phantom-900">
                    {getMinimumReceived()} {toToken.symbol}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-600">Network Fee</span>
                  <span className="text-sm text-phantom-900">~0.000005 SOL</span>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-4 bg-error-50 border border-error-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-error-500" />
                <span className="text-error-700">{error}</span>
              </div>
            )}

            <button
              onClick={handleSwap}
              disabled={!fromToken || !toToken || !fromAmount || !toAmount}
              className="w-full btn-primary"
            >
              Review Swap
            </button>
          </div>
        )}

        {step === 'confirm' && (
          <div className="glass-card p-6 space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-phantom-900 mb-2">Confirm Swap</h2>
              <p className="text-secondary-600">Review the details before swapping</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-secondary-200">
                <span className="text-secondary-600">You Pay</span>
                <div className="text-right">
                  <div className="font-semibold text-phantom-900">
                    {fromAmount} {fromToken?.symbol}
                  </div>
                  <div className="text-sm text-secondary-600">
                    ≈ ${fromAmount && fromToken?.price ? (parseFloat(fromAmount) * fromToken.price).toFixed(2) : '0.00'}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-secondary-200">
                <span className="text-secondary-600">You Receive</span>
                <div className="text-right">
                  <div className="font-semibold text-phantom-900">
                    {toAmount} {toToken?.symbol}
                  </div>
                  <div className="text-sm text-secondary-600">
                    ≈ ${toAmount && toToken?.price ? (parseFloat(toAmount) * toToken.price).toFixed(2) : '0.00'}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-secondary-200">
                <span className="text-secondary-600">Rate</span>
                <span className="text-sm text-phantom-900">
                  1 {fromToken?.symbol} = {(toToken?.price! / fromToken?.price!).toFixed(6)} {toToken?.symbol}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-secondary-200">
                <span className="text-secondary-600">Slippage</span>
                <span className="text-sm text-phantom-900">{slippage}%</span>
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
                onClick={executeSwap}
                disabled={loading}
                className="flex-1 btn-primary"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 animate-spin" />
                    Swapping...
                  </div>
                ) : (
                  'Confirm Swap'
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
              <h2 className="text-xl font-bold text-phantom-900 mb-2">Swap Successful!</h2>
              <p className="text-secondary-600">Your tokens have been swapped successfully.</p>
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
                Swap Again
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

export default Swap;