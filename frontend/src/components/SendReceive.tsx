import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
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

  const onSend = async () => {
    if (!publicKey) return;
    setMessage('');
    setLoading(true);
    try {
      const recipient = new PublicKey(toAddress);
      if (tab === 'sol') {
        const tx = new Transaction().add(SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipient,
          lamports: Math.floor(parseFloat(amount) * LAMPORTS_PER_SOL),
        }));
        const sig = await sendTransaction!(tx, connection);
        await connection.confirmTransaction(sig, 'confirmed');
        setMessage(t('solSentSuccess'));
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
        const tx = new Transaction().add(...(ix as any));
        const sig = await sendTransaction!(tx, connection);
        await connection.confirmTransaction(sig, 'confirmed');
        setMessage(t('tokensSentSuccess'));
      }
      setToAddress(''); setAmount(''); setMint('');
    } catch (e: any) {
      setMessage(t('sendErrorPrefix') + ' ' + (e?.message || 'failed to send'));
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
          className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all ${tab === 'sol' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
        >
          <Download className="w-4 h-4" /> <span>{t('sol')}</span>
        </button>
        <button
          onClick={() => setTab('token')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all ${tab === 'token' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
        >
          <Coins className="w-4 h-4" /> <span>{t('splToken')}</span>
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
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