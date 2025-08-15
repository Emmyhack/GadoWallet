import { useState } from 'react';
import { useAnchorProgram } from '../lib/anchor';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { web3, BN } from '@project-serum/anchor';
import { Send, Plus, Trash2, Coins, Coins as Token } from 'lucide-react';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';

interface Recipient {
  id: string;
  address: string;
  amount: string;
}

export function BatchTransfer() {
  const program = useAnchorProgram();
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'sol' | 'token'>('sol');
  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: '1', address: '', amount: '' }
  ]);
  const [tokenMint, setTokenMint] = useState('');
  const [message, setMessage] = useState('');

  const addRecipient = () => {
    if (recipients.length < 10) {
      const newId = (recipients.length + 1).toString();
      setRecipients([...recipients, { id: newId, address: '', amount: '' }]);
    }
  };

  const removeRecipient = (id: string) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter(r => r.id !== id));
    }
  };

  const updateRecipient = (id: string, field: 'address' | 'amount', value: string) => {
    setRecipients(recipients.map(r => 
      r.id === id ? { ...r, [field]: value } : r
    ));
  };

  const handleBatchTransfer = async () => {
    if (!program || !publicKey) return;

    try {
      setIsLoading(true);
      setMessage('');

      // Filter out empty recipients
      const validRecipients = recipients.filter(r => r.address && r.amount);
      
      if (validRecipients.length === 0) {
        setMessage('Please add at least one recipient');
        return;
      }

      if (activeTab === 'sol') {
        for (const recipient of validRecipients) {
          const toAddress = new web3.PublicKey(recipient.address);
          const amount = new BN(parseFloat(recipient.amount) * 1e9);
          await program.methods
            .batchTransferCoins([amount])
            .accounts({
              fromAccount: publicKey,
              toAccount: toAddress,
              systemProgram: web3.SystemProgram.programId,
            })
            .rpc();
        }
        setMessage('SOL transfers completed successfully!');
      } else {
        if (!tokenMint) {
          setMessage('Please provide a token mint address');
          return;
        }
        const mintPk = new web3.PublicKey(tokenMint);
        for (const recipient of validRecipients) {
          const toOwner = new web3.PublicKey(recipient.address);
          const fromTokenAccount = await getAssociatedTokenAddress(mintPk, publicKey);
          const toTokenAccount = await getAssociatedTokenAddress(mintPk, toOwner);

          const ix: web3.TransactionInstruction[] = [];
          const toAccountInfo = await connection.getAccountInfo(toTokenAccount);
          if (!toAccountInfo) {
            ix.push(
              createAssociatedTokenAccountInstruction(
                publicKey,
                toTokenAccount,
                toOwner,
                mintPk
              )
            );
          }

          const amount = new BN(parseFloat(recipient.amount));
          await program.methods
            .batchTransferTokens([amount])
            .accounts({
              fromTokenAccount,
              toTokenAccount,
              authority: publicKey,
              tokenProgram: new web3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
            })
            .preInstructions(ix)
            .rpc();
        }
        setMessage('Token transfers completed successfully!');
      }

      // Reset form
      setRecipients([{ id: '1', address: '', amount: '' }]);
      setTokenMint('');
    } catch (error) {
      console.error('Error in batch transfer:', error);
      setMessage('Error performing batch transfer. Please check your inputs and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isValidAddress = (address: string) => {
    try {
      new web3.PublicKey(address);
      return true;
    } catch {
      return false;
    }
  };

  const isValidAmount = (amount: string) => {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0;
  };

  const isFormValid = () => {
    const validRecipients = recipients.filter(r => r.address && r.amount);
    if (validRecipients.length === 0) return false;
    
    for (const recipient of validRecipients) {
      if (!isValidAddress(recipient.address) || !isValidAmount(recipient.amount)) {
        return false;
      }
    }

    if (activeTab === 'token' && (!tokenMint || !isValidAddress(tokenMint))) {
      return false;
    }

    return true;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-gray-900 rounded-md flex items-center justify-center">
          <Send className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Batch Transfer</h2>
          <p className="text-gray-600">Send SOL and tokens to multiple recipients</p>
        </div>
      </div>

      {/* Asset Type Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-md">
        <button
          onClick={() => setActiveTab('sol')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all ${
            activeTab === 'sol'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>SOL</span>
        </button>
        <button
          onClick={() => setActiveTab('token')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all ${
            activeTab === 'token'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Token className="w-4 h-4" />
          <span>SPL Token</span>
        </button>
      </div>

      {/* Token Mint Input */}
      {activeTab === 'token' && (
        <div className="bg-gray-50 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Token Mint Address
          </label>
          <input
            type="text"
            value={tokenMint}
            onChange={(e) => setTokenMint(e.target.value)}
            placeholder="Enter token mint address"
            className="input-field"
          />
          {tokenMint && !isValidAddress(tokenMint) && (
            <p className="text-red-500 text-sm mt-1">Invalid token mint address</p>
          )}
        </div>
      )}

      {/* Recipients */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recipients</h3>
          <button
            onClick={addRecipient}
            disabled={recipients.length >= 10}
            className="btn-secondary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Recipient</span>
          </button>
        </div>

        <div className="space-y-4">
          {recipients.map((recipient) => (
            <div key={recipient.id} className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wallet Address
                </label>
                <input
                  type="text"
                  value={recipient.address}
                  onChange={(e) => updateRecipient(recipient.id, 'address', e.target.value)}
                  placeholder="Enter wallet address"
                  className="input-field"
                />
                {recipient.address && !isValidAddress(recipient.address) && (
                  <p className="text-red-500 text-sm mt-1">Invalid address</p>
                )}
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount ({activeTab === 'sol' ? 'SOL' : 'Tokens'})
                </label>
                <input
                  type="number"
                  value={recipient.amount}
                  onChange={(e) => updateRecipient(recipient.id, 'amount', e.target.value)}
                  placeholder={`Enter amount`}
                  step="0.000000001"
                  className="input-field"
                />
                {recipient.amount && !isValidAmount(recipient.amount) && (
                  <p className="text-red-500 text-sm mt-1">Invalid amount</p>
                )}
              </div>

              {recipients.length > 1 && (
                <button
                  onClick={() => removeRecipient(recipient.id)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleBatchTransfer}
          disabled={!isFormValid() || isLoading}
          className="btn-primary w-full mt-6 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing Transfer...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Send Batch Transfer</span>
            </>
          )}
        </button>

        {message && (
          <div className={`mt-4 p-3 rounded-md ${
            message.includes('Error') 
              ? 'bg-red-50 text-red-700 border border-red-200' 
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {message}
          </div>
        )}
      </div>

      {/* Information Card */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Batch Transfer Info</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Send to up to 10 recipients in a single transaction</li>
          <li>• Reduce transaction fees by batching transfers</li>
          <li>• All transfers require wallet signature</li>
          <li>• Recipients must have valid Solana addresses</li>
        </ul>
      </div>
    </div>
  );
}