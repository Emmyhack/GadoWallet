import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, ComputeBudgetProgram } from '@solana/web3.js';
import { web3 } from '@coral-xyz/anchor';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createTransferInstruction } from '@solana/spl-token';
import { Send, Download, Coins } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function SendReceive() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { t } = useTranslation();

  const [tab, setTab] = useState<'sol' | 'token'>('sol');
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [mint, setMint] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const isValidAddress = (addr: string) => {
    try { new PublicKey(addr); return true; } catch { return false; }
  };

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
        const sig = await sendTransaction!(tx, connection, sendOpts);
        lastSignature = sig;
      } catch (sendErr: any) {
        const msg = String(sendErr?.message || '');
        if (msg.includes('block height exceeded') || msg.toLowerCase().includes('blockhash') || msg.toLowerCase().includes('expired')) {
          // Escalate priority and retry once
          priorityFeeMicroLamports = Math.max(priorityFeeMicroLamports * 3, fallbackPriority * 3);
          computeUnitLimit = Math.floor(computeUnitLimit * 1.5);
          const tx = await buildTx();
          const sig = await sendTransaction!(tx, connection, sendOpts);
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