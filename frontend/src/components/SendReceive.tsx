import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, ComputeBudgetProgram } from '@solana/web3.js';
import { web3 } from '@coral-xyz/anchor';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createTransferInstruction } from '@solana/spl-token';
import { Send, Download, Coins, Zap, Gauge } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useGatewayService, TransactionContext } from '../lib/gateway-service';
import { SubscriptionTier } from './SubscriptionManager';

export function SendReceive() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { t } = useTranslation();
  const { sendWithGateway, shouldUseGateway, getCostEstimate } = useGatewayService();

  const [tab, setTab] = useState<'sol' | 'token'>('sol');
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [mint, setMint] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [userTier, setUserTier] = useState<SubscriptionTier>(SubscriptionTier.FREE);
  const [costEstimate, setCostEstimate] = useState<{ baseFee: number; gatewayFee: number; total: number; savings?: number } | null>(null);

  const isValidAddress = (addr: string) => {
    try { new PublicKey(addr); return true; } catch { return false; }
  };

  const updateCostEstimate = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      setCostEstimate(null);
      return;
    }

    const amountValue = parseFloat(amount);
    const context: Omit<TransactionContext, 'userTier'> = {
      type: 'standard_send',
      priority: amountValue > 10 ? 'high' : amountValue > 1 ? 'medium' : 'low',
      ...(tab === 'sol' && !isNaN(amountValue) && { assetValue: amountValue })
    };

    const estimate = await getCostEstimate(context, userTier);
    setCostEstimate(estimate);
  };

  // Update cost estimate when amount or tab changes
  useEffect(() => {
    updateCostEstimate();
  }, [amount, tab, userTier]);

  const estimatePriorityFee = async (fallback: number): Promise<number> => {
    try {
      const getFees = (connection as any).getRecentPrioritizationFees;
      if (typeof getFees === 'function') {
        const fees = await getFees();
        if (Array.isArray(fees) && fees.length) {
          const values = fees
            .map((f: any) => (typeof f?.prioritizationFee === 'number' ? f.prioritizationFee : 0))
            .filter((n: number) => n > 0)
            .sort((a: number, b: number) => a - b);
          if (values.length) {
            const p75 = values[Math.floor(values.length * 0.75)];
            return Math.max(fallback, Math.floor(p75 * 2));
          }
        }
      }
    } catch {}
    return fallback;
  };

  const onSend = async () => {
    if (!publicKey) return;
    setMessage('');
    setLoading(true);
    let lastSignature: string | undefined;
    const isSolTransfer = tab === 'sol';
    try {
      const recipient = new PublicKey(toAddress);
      const fallbackPriority = isSolTransfer ? 100_000 : 400_000;
      let priorityFeeMicroLamports = await estimatePriorityFee(fallbackPriority);
      let computeUnitLimit = isSolTransfer ? 200_000 : 600_000;

      const buildTx = async () => {
        if (isSolTransfer) {
          const priorityIxs = [
            ComputeBudgetProgram.setComputeUnitPrice({ microLamports: priorityFeeMicroLamports }),
            ComputeBudgetProgram.setComputeUnitLimit({ units: computeUnitLimit }),
          ];
          const tx = new Transaction().add(
            ...priorityIxs,
            SystemProgram.transfer({
              fromPubkey: publicKey,
              toPubkey: recipient,
              lamports: Math.floor(parseFloat(amount) * LAMPORTS_PER_SOL),
            }),
          );
          tx.feePayer = publicKey;
          return tx;
        } else {
          const mintPk = new PublicKey(mint);
          const fromAta = await getAssociatedTokenAddress(mintPk, publicKey);
          const toAta = await getAssociatedTokenAddress(mintPk, recipient);
          const ix: web3.TransactionInstruction[] = [];
          const toInfo = await connection.getAccountInfo(toAta);
          if (!toInfo) {
            ix.push(createAssociatedTokenAccountInstruction(publicKey, toAta, recipient, mintPk));
          }
          const tokenAmount = Math.floor(parseFloat(amount));
          ix.push(createTransferInstruction(fromAta, toAta, publicKey, tokenAmount));
          const priorityIxs = [
            ComputeBudgetProgram.setComputeUnitPrice({ microLamports: priorityFeeMicroLamports }),
            ComputeBudgetProgram.setComputeUnitLimit({ units: computeUnitLimit }),
          ];
          const tx = new Transaction().add(...priorityIxs, ...(ix as any));
          tx.feePayer = publicKey;
          return tx;
        }
      };

      const sendOpts = { preflightCommitment: 'processed' as const, skipPreflight: true, maxRetries: 60 };

      try {
        const tx = await buildTx();
        
        // Prepare Gateway context
        const amountValue = parseFloat(amount);
        const context: Omit<TransactionContext, 'userTier'> = {
          type: 'standard_send',
          priority: amountValue > 10 ? 'high' : amountValue > 1 ? 'medium' : 'low',
          ...(tab === 'sol' && !isNaN(amountValue) && { assetValue: amountValue })
        };

        // Use Gateway service for intelligent routing
        const sig = await sendWithGateway(tx, connection, context, userTier);
        lastSignature = sig;
      } catch (sendErr: any) {
        const msg = String(sendErr?.message || '');
        if (msg.includes('block height exceeded') || msg.toLowerCase().includes('blockhash') || msg.toLowerCase().includes('expired')) {
          // Escalate priority and retry once
          priorityFeeMicroLamports = Math.max(priorityFeeMicroLamports * 3, fallbackPriority * 3);
          computeUnitLimit = Math.floor(computeUnitLimit * 1.5);
          const tx = await buildTx();
          
          // Retry with Gateway service
          const amountValue = parseFloat(amount);
          const retryContext: Omit<TransactionContext, 'userTier'> = {
            type: 'standard_send',
            priority: 'high', // Escalated priority
            ...(tab === 'sol' && !isNaN(amountValue) && { assetValue: amountValue })
          };
          
          const sig = await sendWithGateway(tx, connection, retryContext, userTier);
          lastSignature = sig;
        } else {
          throw sendErr;
        }
      }

      // Poll for confirmation up to ~45s, treating confirmed/finalized as success
      if (lastSignature) {
        const start = Date.now();
        const maxWaitMs = 45_000;
        let confirmed = false;
        while (Date.now() - start < maxWaitMs) {
          const statuses = await connection.getSignatureStatuses([lastSignature]);
          const status = statuses?.value?.[0];
          if (status?.confirmationStatus === 'confirmed' || status?.confirmationStatus === 'finalized') {
            confirmed = true;
            break;
          }
          if (status?.err) {
            throw new Error('Transaction failed');
          }
          await new Promise(r => setTimeout(r, 1000));
        }
        if (!confirmed) {
          throw new Error('Confirmation timeout');
        }
      }

      setMessage(isSolTransfer ? t('solSentSuccess') : t('tokensSentSuccess'));
      setToAddress(''); setAmount(''); setMint('');
    } catch (e: any) {
      // If expiration or generic timeout, provide a clearer message and do a last status check
      if (lastSignature) {
        try {
          const statuses = await connection.getSignatureStatuses([lastSignature]);
          const status = statuses?.value?.[0];
          if (status?.confirmationStatus === 'confirmed' || status?.confirmationStatus === 'finalized') {
            setMessage(isSolTransfer ? t('solSentSuccess') : t('tokensSentSuccess'));
            setToAddress(''); setAmount(''); setMint('');
            setLoading(false);
            return;
          }
        } catch {}
      }
      const msg = e?.message || '';
      if (msg.includes('block height exceeded') || msg.toLowerCase().includes('expired')) {
        setMessage(t('sendErrorPrefix') + ' ' + 'Network was busy and the transaction expired before confirmation. It was retried automatically; if it still fails, please try again.');
      } else if (msg.includes('Confirmation timeout')) {
        setMessage(t('sendErrorPrefix') + ' ' + 'Confirmation is taking longer than expected. Please check the explorer; it may still succeed.');
      } else {
        setMessage(t('sendErrorPrefix') + ' ' + (e?.message || 'failed to send'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Professional Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 shadow-2xl">
            <Send className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">{t('sendReceive')}</h2>
            <p className="text-gray-300 font-medium">{t('sendReceiveSubtitle')}</p>
          </div>
        </div>
        
        <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-200">Ready to Send</span>
          </div>
        </div>
      </div>

      {/* Professional Tab Selector */}
      <div className="flex space-x-2 p-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
        <button
          onClick={() => setTab('sol')}
          className={`flex items-center space-x-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex-1 ${
            tab === 'sol' 
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-xl transform scale-105' 
              : 'text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Download className="w-5 h-5" />
          <div className="text-left">
            <div className="font-bold">{t('sol')}</div>
            <div className="text-xs opacity-75">Native Solana</div>
          </div>
        </button>
        <button
          onClick={() => setTab('token')}
          className={`flex items-center space-x-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex-1 ${
            tab === 'token' 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl transform scale-105' 
              : 'text-gray-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Coins className="w-5 h-5" />
          <div className="text-left">
            <div className="font-bold">{t('splToken')}</div>
            <div className="text-xs opacity-75">SPL Tokens</div>
          </div>
        </button>
      </div>

      {/* Professional Form Card */}
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
        <div className="p-8">
          <div className="space-y-6">
            {/* Recipient Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-3 uppercase tracking-wider">
                {t('recipientAddress')}
              </label>
              <div className="relative">
                <input 
                  className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 font-mono text-sm"
                  placeholder={t('destinationPublicKey') || 'Enter recipient wallet address'} 
                  value={toAddress} 
                  onChange={e => setToAddress(e.target.value)} 
                />
                {toAddress && isValidAddress(toAddress) && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                )}
              </div>
              {toAddress && !isValidAddress(toAddress) && (
                <div className="mt-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-xl">
                  <p className="text-red-300 text-sm font-medium">{t('invalidAddress')}</p>
                </div>
              )}
            </div>

            {/* Token Mint (for SPL tokens) */}
            {tab === 'token' && (
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-3 uppercase tracking-wider">
                  {t('tokenMintLabel')}
                </label>
                <div className="relative">
                  <input 
                    className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 font-mono text-sm"
                    placeholder={t('tokenMintAddress') || 'Enter token mint address'} 
                    value={mint} 
                    onChange={e => setMint(e.target.value)} 
                  />
                  {mint && isValidAddress(mint) && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                  )}
                </div>
                {mint && !isValidAddress(mint) && (
                  <div className="mt-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-xl">
                    <p className="text-red-300 text-sm font-medium">{t('invalidTokenMint')}</p>
                  </div>
                )}
              </div>
            )}

            {/* Amount */}
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-3 uppercase tracking-wider">
                {t('amountLabel')}
              </label>
              <div className="relative">
                <input 
                  className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 text-xl font-bold"
                  placeholder={tab === 'sol' ? (t('amountInSol') || '0.001') : (t('rawTokenAmount') || '100')} 
                  value={amount} 
                  onChange={e => setAmount(e.target.value)}
                  type="number"
                  step={tab === 'sol' ? '0.001' : '1'}
                />
                <div className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold">
                  {tab === 'sol' ? 'SOL' : 'TOKENS'}
                </div>
              </div>
            </div>
          </div>

          {/* Gateway Cost Estimation & Info */}
          {amount && parseFloat(amount) > 0 && (
            <div className="mt-6 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-400/20 rounded-2xl">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  {shouldUseGateway({
                    type: 'standard_send',
                    priority: parseFloat(amount) > 10 ? 'high' : parseFloat(amount) > 1 ? 'medium' : 'low',
                    ...(tab === 'sol' && !isNaN(parseFloat(amount)) && { assetValue: parseFloat(amount) })
                  }, userTier) ? (
                    <Zap className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <Gauge className="w-5 h-5 text-blue-400" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-blue-300 font-semibold">
                      {shouldUseGateway({
                        type: 'standard_send',
                        priority: parseFloat(amount) > 10 ? 'high' : parseFloat(amount) > 1 ? 'medium' : 'low',
                        ...(tab === 'sol' && !isNaN(parseFloat(amount)) && { assetValue: parseFloat(amount) })
                      }, userTier) ? (
                        <>⚡ Gateway Optimization Active</>
                      ) : (
                        <>📡 Standard RPC Delivery</>
                      )}
                    </h4>
                    
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-medium rounded-full">
                        {userTier} TIER
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-300 mb-2">Delivery Method:</div>
                      {shouldUseGateway({
                        type: 'standard_send',
                        priority: parseFloat(amount) > 10 ? 'high' : parseFloat(amount) > 1 ? 'medium' : 'low',
                        ...(tab === 'sol' && !isNaN(parseFloat(amount)) && { assetValue: parseFloat(amount) })
                      }, userTier) ? (
                        <ul className="text-blue-200 space-y-1">
                          <li>✓ Multi-path delivery (RPC + Jito)</li>
                          <li>✓ Priority fee optimization</li>
                          <li>✓ 95%+ success rate</li>
                          {userTier === SubscriptionTier.ENTERPRISE && (
                            <li>✓ SLA guarantee</li>
                          )}
                        </ul>
                      ) : (
                        <ul className="text-gray-300 space-y-1">
                          <li>• Standard RPC delivery</li>
                          <li>• Basic retry logic</li>
                          <li>• Standard success rate</li>
                        </ul>
                      )}
                    </div>
                    
                    {costEstimate && (
                      <div>
                        <div className="text-gray-300 mb-2">Estimated Cost:</div>
                        <div className="text-blue-200 space-y-1">
                          <div>Base fee: ~{(costEstimate.baseFee * 1000000).toFixed(0)} lamports</div>
                          {costEstimate.gatewayFee > 0 && (
                            <div>Gateway fee: ~{(costEstimate.gatewayFee * 1000000).toFixed(0)} lamports</div>
                          )}
                          <div className="font-medium">Total: ~{(costEstimate.total * 1000000).toFixed(0)} lamports</div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {parseFloat(amount) > 1 && userTier === SubscriptionTier.FREE && (
                    <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-400/20 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-300">
                        <Zap className="w-4 h-4" />
                        <span className="text-sm">
                          High-value transaction detected! Upgrade to Premium for Gateway optimization and better success rates.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Professional Send Button */}
          <div className="mt-8">
            <button 
              onClick={onSend} 
              disabled={!toAddress || !amount || (tab === 'token' && !mint) || loading} 
              className="w-full py-6 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-2xl transform hover:scale-105 flex items-center justify-center space-x-3 text-lg"
            >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t('sending')}...</span>
                </>
              ) : (
                <>
                  <Send className="w-6 h-6" />
                  <span>Send {tab === 'sol' ? 'SOL' : 'Tokens'}</span>
                </>
              )}
            </button>
          </div>

          {/* Status Message */}
          {message && (
            <div className={`mt-6 p-6 rounded-2xl border ${
              message.startsWith('Error') 
                ? 'bg-red-500/20 text-red-200 border-red-500/30' 
                : 'bg-green-500/20 text-green-200 border-green-500/30'
            }`}>
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${
                  message.startsWith('Error') ? 'bg-red-400' : 'bg-green-400'
                }`}></div>
                <p className="font-medium">{message}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}