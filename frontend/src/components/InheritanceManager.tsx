import { useState } from 'react';
import { useAnchorProgram } from '../lib/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import { web3, BN } from '@project-serum/anchor';
import { Shield, Plus, Coins, Coins as Token } from 'lucide-react';

export function InheritanceManager() {
  const program = useAnchorProgram();
  const { publicKey } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'sol' | 'token'>('sol');
  const [heirAddress, setHeirAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [tokenMint, setTokenMint] = useState('');
  const [message, setMessage] = useState('');

  const handleAddHeir = async () => {
    if (!program || !publicKey) return;

    try {
      setIsLoading(true);
      setMessage('');

      const heirPubkey = new web3.PublicKey(heirAddress);
      const amountBN = new BN(parseFloat(amount) * 1e9); // Convert SOL to lamports

      if (activeTab === 'sol') {
        await program.methods
          .addCoinHeir(amountBN)
          .accounts({
            coinHeir: web3.PublicKey.findProgramAddressSync(
              [Buffer.from('coin_heir'), publicKey.toBuffer(), heirPubkey.toBuffer()],
              program.programId
            )[0],
            owner: publicKey,
            heir: heirPubkey,
            systemProgram: web3.SystemProgram.programId,
          })
          .rpc();
        setMessage('SOL heir added successfully!');
      } else {
        const tokenMintPubkey = new web3.PublicKey(tokenMint);
        await program.methods
          .addTokenHeir(amountBN)
          .accounts({
            tokenHeir: web3.PublicKey.findProgramAddressSync(
              [Buffer.from('token_heir'), publicKey.toBuffer(), heirPubkey.toBuffer(), tokenMintPubkey.toBuffer()],
              program.programId
            )[0],
            owner: publicKey,
            heir: heirPubkey,
            tokenMint: tokenMintPubkey,
            systemProgram: web3.SystemProgram.programId,
          })
          .rpc();
        setMessage('Token heir added successfully!');
      }

      // Reset form
      setHeirAddress('');
      setAmount('');
      setTokenMint('');
    } catch (error) {
      console.error('Error adding heir:', error);
      setMessage('Error adding heir. Please check your inputs and try again.');
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
    if (!heirAddress || !amount) return false;
    if (!isValidAddress(heirAddress)) return false;
    if (!isValidAmount(amount)) return false;
    if (activeTab === 'token' && (!tokenMint || !isValidAddress(tokenMint))) return false;
    return true;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-gray-900 rounded-md flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Inheritance Manager</h2>
          <p className="text-gray-600">Designate heirs for your SOL and SPL tokens</p>
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

      {/* Form */}
      <div className="bg-gray-50 rounded-lg p-6">
        <form onSubmit={(e) => { e.preventDefault(); handleAddHeir(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Heir Wallet Address
            </label>
            <input
              type="text"
              value={heirAddress}
              onChange={(e) => setHeirAddress(e.target.value)}
              placeholder="Enter heir's wallet address"
              className="input-field"
            />
            {heirAddress && !isValidAddress(heirAddress) && (
              <p className="text-red-500 text-sm mt-1">Invalid wallet address</p>
            )}
          </div>

          {activeTab === 'token' && (
            <div>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount ({activeTab === 'sol' ? 'SOL' : 'Tokens'})
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Enter amount in ${activeTab === 'sol' ? 'SOL' : 'tokens'}`}
              step="0.000000001"
              className="input-field"
            />
            {amount && !isValidAmount(amount) && (
              <p className="text-red-500 text-sm mt-1">Invalid amount</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!isFormValid() || isLoading}
            className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Adding Heir...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Add Heir</span>
              </>
            )}
          </button>
        </form>

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
        <h3 className="font-semibold text-gray-900 mb-2">How it works</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Heirs can claim assets after 1 year of owner inactivity</li>
          <li>• Owners can update their activity to prevent premature claims</li>
          <li>• Multiple heirs can be designated for different assets</li>
          <li>• All transactions require wallet signatures for security</li>
        </ul>
      </div>
    </div>
  );
}