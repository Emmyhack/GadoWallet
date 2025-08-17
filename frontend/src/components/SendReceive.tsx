import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, ComputeBudgetProgram } from '@solana/web3.js';
import { web3 } from '@project-serum/anchor';
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center space-x-3 mb-2">
        <div className="w-8 h-8 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-rose-600 rounded-md flex items-center justify-center">
          <Send className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">{t('sendReceive')}</h2>
          <p className="text-gray-600">{t('sendReceiveSubtitle')}</p>
        </div>
      </div>

      <div className="flex space-x-1 bg-gray-100 p-1 rounded-md">
        <button
          onClick={() => setTab('sol')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all ${tab === 'sol' ? 'bg-white/80 dark:bg-gray-900/60 text-gray-900 dark:text-white shadow-sm backdrop-blur' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
        >
          <Download className="w-4 h-4" /> <span>{t('sol')}</span>
        </button>
        <button
          onClick={() => setTab('token')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all ${tab === 'token' ? 'bg-white/80 dark:bg-gray-900/60 text-gray-900 dark:text-white shadow-sm backdrop-blur' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
        >
          <Coins className="w-4 h-4" /> <span>{t('splToken')}</span>
        </button>
      </div>

      <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-gray-900/60 backdrop-blur p-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('recipientAddress')}</label>
            <input className="input-field" placeholder={t('destinationPublicKey') || ''} value={toAddress} onChange={e => setToAddress(e.target.value)} />
            {toAddress && !isValidAddress(toAddress) && (<p className="text-red-500 text-sm mt-1">{t('invalidAddress')}</p>)}
          </div>

          {tab === 'token' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('tokenMintLabel')}</label>
              <input className="input-field" placeholder={t('tokenMintAddress') || ''} value={mint} onChange={e => setMint(e.target.value)} />
              {mint && !isValidAddress(mint) && (<p className="text-red-500 text-sm mt-1">{t('invalidTokenMint')}</p>)}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('amountLabel')}</label>
            <input className="input-field" placeholder={tab === 'sol' ? (t('amountInSol') || '') : (t('rawTokenAmount') || '')} value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
        </div>

        <button onClick={onSend} disabled={!toAddress || !amount || (tab === 'token' && !mint) || loading} className="btn-primary w-full mt-6 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-600">
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{t('sending')}</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>{t('send')}</span>
            </>
          )}
        </button>

        {message && (
          <div className={`mt-4 p-3 rounded-md ${message.startsWith('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>{message}</div>
        )}
      </div>
    </div>
  );
}