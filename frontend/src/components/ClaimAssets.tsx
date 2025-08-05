import { useState } from 'react';
import { useAnchorProgram } from '../lib/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import { web3 } from '@project-serum/anchor';
import { Gift, Search, AlertTriangle, CheckCircle, Coins, Coins as Token } from 'lucide-react';

interface ClaimableAsset {
  id: string;
  type: 'sol' | 'token';
  owner: string;
  amount: string;
  lastActiveTime: string;
  isClaimable: boolean;
  tokenMint?: string;
}

export function ClaimAssets() {
  const program = useAnchorProgram();
  const { publicKey } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [claimableAssets, setClaimableAssets] = useState<ClaimableAsset[]>([]);

  const handleSearchAssets = async () => {
    if (!publicKey || !searchAddress) return;

    try {
      setIsLoading(true);
      setMessage('');

      // This is a simplified implementation
      // In a real scenario, you would query the blockchain for actual heir accounts
      const mockAssets: ClaimableAsset[] = [
        {
          id: '1',
          type: 'sol',
          owner: searchAddress,
          amount: '0.5',
          lastActiveTime: '2023-01-01T00:00:00Z',
          isClaimable: true
        },
        {
          id: '2',
          type: 'token',
          owner: searchAddress,
          amount: '100',
          lastActiveTime: '2023-01-01T00:00:00Z',
          isClaimable: false,
          tokenMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
        }
      ];

      setClaimableAssets(mockAssets);
      setMessage('Assets found! Check the list below.');
    } catch (error) {
      console.error('Error searching assets:', error);
      setMessage('Error searching for assets. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimAsset = async (asset: ClaimableAsset) => {
    if (!program || !publicKey) return;

    try {
      setIsLoading(true);
      setMessage('');

      if (asset.type === 'sol') {
        // Claim SOL assets
        const ownerAccount = new web3.PublicKey(asset.owner);
        
        await program.methods
          .claimHeirCoinAssets()
          .accounts({
            coinHeir: web3.PublicKey.findProgramAddressSync(
              [Buffer.from('coin_heir'), ownerAccount.toBuffer(), publicKey.toBuffer()],
              program.programId
            )[0],
            ownerAccount: ownerAccount,
            heirAccount: publicKey,
          })
          .rpc();
        
        setMessage('SOL assets claimed successfully!');
      } else {
        // Claim token assets
        if (!asset.tokenMint) {
          setMessage('Token mint address is required for token claims');
          return;
        }

        // This is a simplified implementation
        // In a real scenario, you'd need proper token account handling
        setMessage('Token claim functionality requires proper token account setup');
        return;
      }

      // Remove claimed asset from list
      setClaimableAssets(prev => prev.filter(a => a.id !== asset.id));
    } catch (error) {
      console.error('Error claiming asset:', error);
      setMessage('Error claiming asset. Please try again.');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getTimeSinceInactivity = (dateString: string) => {
    const lastActive = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
    return diffInDays;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
          <Gift className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Claim Assets</h2>
          <p className="text-gray-600">Claim inherited SOL and tokens after inactivity period</p>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Search for Claimable Assets</h3>
        
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Owner Wallet Address
            </label>
            <input
              type="text"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              placeholder="Enter the owner's wallet address"
              className="input-field"
            />
            {searchAddress && !isValidAddress(searchAddress) && (
              <p className="text-red-500 text-sm mt-1">Invalid wallet address</p>
            )}
          </div>
          
          <button
            onClick={handleSearchAssets}
            disabled={!searchAddress || !isValidAddress(searchAddress) || isLoading}
            className="btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Search</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('Error') 
            ? 'bg-red-50 text-red-700 border border-red-200' 
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          <div className="flex items-center space-x-2">
            {message.includes('Error') ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <CheckCircle className="w-5 h-5" />
            )}
            <span>{message}</span>
          </div>
        </div>
      )}

      {/* Claimable Assets List */}
      {claimableAssets.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Claimable Assets</h3>
          
          {claimableAssets.map((asset) => (
            <div key={asset.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {asset.type === 'sol' ? (
                    <Coins className="w-6 h-6 text-yellow-600" />
                  ) : (
                    <Token className="w-6 h-6 text-blue-600" />
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {asset.type === 'sol' ? 'SOL' : 'SPL Token'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Amount: {asset.amount} {asset.type === 'sol' ? 'SOL' : 'tokens'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {asset.isClaimable ? (
                    <div className="flex items-center space-x-2 text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Claimable</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-orange-600">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-sm font-medium">Not Yet Claimable</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-sm text-gray-600">Owner:</span>
                  <p className="text-sm font-mono text-gray-900 break-all">{asset.owner}</p>
                </div>
                
                <div>
                  <span className="text-sm text-gray-600">Last Active:</span>
                  <p className="text-sm text-gray-900">{formatDate(asset.lastActiveTime)}</p>
                </div>
                
                <div>
                  <span className="text-sm text-gray-600">Days Since Inactivity:</span>
                  <p className="text-sm text-gray-900">{getTimeSinceInactivity(asset.lastActiveTime)} days</p>
                </div>
                
                {asset.tokenMint && (
                  <div>
                    <span className="text-sm text-gray-600">Token Mint:</span>
                    <p className="text-sm font-mono text-gray-900 break-all">{asset.tokenMint}</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleClaimAsset(asset)}
                disabled={!asset.isClaimable || isLoading}
                className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Claiming...</span>
                  </>
                ) : (
                  <>
                    <Gift className="w-4 h-4" />
                    <span>Claim {asset.type === 'sol' ? 'SOL' : 'Tokens'}</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Information Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <h3 className="font-semibold text-purple-900 mb-2">Claiming Process</h3>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>• Assets can be claimed after 1 year of owner inactivity</li>
            <li>• Only designated heirs can claim assets</li>
            <li>• Claims require wallet signature</li>
            <li>• Assets are transferred directly to heir's wallet</li>
          </ul>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <h3 className="font-semibold text-orange-900 mb-2">Requirements</h3>
          <ul className="text-sm text-orange-800 space-y-1">
            <li>• Must be designated as an heir</li>
            <li>• Owner must be inactive for 1 year</li>
            <li>• Assets must not be already claimed</li>
            <li>• Valid Solana wallet connection required</li>
          </ul>
        </div>
      </div>
    </div>
  );
}