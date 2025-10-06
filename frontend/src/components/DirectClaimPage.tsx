import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useAnchorProgram } from '../lib/anchor';
import { web3, BN } from '@coral-xyz/anchor';
import { Gift, Shield, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';

interface ClaimData {
  inheritanceId: string;
  secureToken: string;
  claimUrl: string;
  type: 'sol' | 'token';
  heirAddress: string;
  ownerAddress: string;
  amount: string;
  assetType: string;
  tokenMint?: string;
  inactivityPeriod: number;
  heirEmail: string;
  heirName: string;
  personalMessage: string;
  createdAt: string;
  expiresAt: string;
  isUsed: boolean;
}

export function DirectClaimPage() {
  const { inheritanceId, token } = useParams<{ inheritanceId: string; token: string }>();
  const navigate = useNavigate();
  const { publicKey, connected } = useWallet();
  const program = useAnchorProgram();
  
  const [claimData, setClaimData] = useState<ClaimData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);

  useEffect(() => {
    validateAndLoadClaim();
  }, [inheritanceId, token]);

  const validateAndLoadClaim = async () => {
    try {
      setIsLoading(true);
      
      // Get claim data from localStorage (in production, this would be an API call)
      const existingClaims = JSON.parse(localStorage.getItem('inheritanceClaimLinks') || '[]');
      const claimRecord = existingClaims.find((claim: ClaimData) => 
        claim.inheritanceId === inheritanceId && 
        claim.secureToken === token
      );
      
      if (!claimRecord) {
        setError('Claim link not found or has expired');
        return;
      }
      
      if (claimRecord.isUsed) {
        setError('This inheritance has already been claimed');
        return;
      }
      
      if (new Date(claimRecord.expiresAt) < new Date()) {
        setError('This claim link has expired');
        return;
      }
      
      // Check if inheritance is claimable on-chain
      const isClaimable = await checkInheritanceClaimable(claimRecord);
      if (!isClaimable) {
        setError('Inheritance is not yet claimable. The owner may still be active.');
        return;
      }
      
      setClaimData(claimRecord);
    } catch (err) {
      console.error('Failed to validate claim:', err);
      setError('Failed to validate claim link');
    } finally {
      setIsLoading(false);
    }
  };

  const checkInheritanceClaimable = async (claimRecord: ClaimData): Promise<boolean> => {
    if (!program) return false;
    
    try {
      const ownerPubkey = new web3.PublicKey(claimRecord.ownerAddress);
      const heirPubkey = new web3.PublicKey(claimRecord.heirAddress);
      
      if (claimRecord.type === 'sol') {
        // Check coin heir PDA
        const [coinHeirPDA] = web3.PublicKey.findProgramAddressSync(
          [Buffer.from('coin_heir'), ownerPubkey.toBuffer(), heirPubkey.toBuffer()],
          program.programId
        );
        
        const coinHeir = await program.account.coinHeir.fetch(coinHeirPDA);
        const currentTime = Math.floor(Date.now() / 1000);
        const timeSinceActive = currentTime - coinHeir.lastActiveTime.toNumber();
        
        return !coinHeir.isClaimed && timeSinceActive > coinHeir.inactivityPeriodSeconds.toNumber();
      } else {
        // Check token heir PDA
        const tokenMintPubkey = new web3.PublicKey(claimRecord.tokenMint!);
        const [tokenHeirPDA] = web3.PublicKey.findProgramAddressSync(
          [Buffer.from('token_heir'), ownerPubkey.toBuffer(), heirPubkey.toBuffer(), tokenMintPubkey.toBuffer()],
          program.programId
        );
        
        const tokenHeir = await program.account.tokenHeir.fetch(tokenHeirPDA);
        const currentTime = Math.floor(Date.now() / 1000);
        const timeSinceActive = currentTime - tokenHeir.lastActiveTime.toNumber();
        
        return !tokenHeir.isClaimed && timeSinceActive > tokenHeir.inactivityPeriodSeconds.toNumber();
      }
    } catch (error) {
      console.error('Error checking inheritance status:', error);
      return false;
    }
  };

  const handleClaim = async () => {
    if (!connected || !publicKey || !claimData || !program) return;
    
    // Verify connected wallet matches expected heir
    if (publicKey.toBase58() !== claimData.heirAddress) {
      setError(`Please connect the correct wallet address: ${claimData.heirAddress}`);
      return;
    }
    
    try {
      setIsClaiming(true);
      
      const ownerPubkey = new web3.PublicKey(claimData.ownerAddress);
      const heirPubkey = new web3.PublicKey(claimData.heirAddress);
      
      let txSignature: string;
      
      if (claimData.type === 'sol') {
        // Claim SOL inheritance
        const [coinHeirPDA] = web3.PublicKey.findProgramAddressSync(
          [Buffer.from('coin_heir'), ownerPubkey.toBuffer(), heirPubkey.toBuffer()],
          program.programId
        );
        
        txSignature = await program.methods
          .claimHeirCoinAssets()
          .accounts({
            coinHeir: coinHeirPDA,
            ownerAccount: ownerPubkey,
            heirAccount: heirPubkey,
            systemProgram: web3.SystemProgram.programId,
          })
          .rpc();
      } else {
        // Claim token inheritance
        const tokenMintPubkey = new web3.PublicKey(claimData.tokenMint!);
        const [tokenHeirPDA] = web3.PublicKey.findProgramAddressSync(
          [Buffer.from('token_heir'), ownerPubkey.toBuffer(), heirPubkey.toBuffer(), tokenMintPubkey.toBuffer()],
          program.programId
        );
        
        txSignature = await program.methods
          .claimHeirTokenAssets()
          .accounts({
            tokenHeir: tokenHeirPDA,
            owner: ownerPubkey,
            heir: heirPubkey,
            // Add other required token accounts here
            tokenProgram: new web3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
          })
          .rpc();
      }
      
      // Mark claim as used in localStorage
      const existingClaims = JSON.parse(localStorage.getItem('inheritanceClaimLinks') || '[]');
      const updatedClaims = existingClaims.map((claim: ClaimData) => 
        claim.inheritanceId === claimData.inheritanceId && claim.secureToken === claimData.secureToken
          ? { ...claim, isUsed: true }
          : claim
      );
      localStorage.setItem('inheritanceClaimLinks', JSON.stringify(updatedClaims));
      
      console.log('Inheritance claimed successfully:', txSignature);
      setClaimSuccess(true);
      
      // Redirect to success page after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
      
    } catch (err) {
      console.error('Failed to claim inheritance:', err);
      setError('Failed to claim inheritance. Please try again.');
    } finally {
      setIsClaiming(false);
    }
  };

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 text-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Validating Claim Link</h2>
          <p className="text-gray-300">Please wait while we verify your inheritance...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-pink-900 to-purple-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-red-500/20 p-8 text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-4">Claim Link Invalid</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (claimSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-green-500/20 p-8 text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-4">Inheritance Claimed Successfully!</h2>
          <p className="text-gray-300 mb-6">
            {claimData?.amount} {claimData?.assetType} has been transferred to your wallet.
          </p>
          <p className="text-sm text-gray-400">Redirecting to home page...</p>
        </div>
      </div>
    );
  }

  if (!claimData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 shadow-2xl">
                <Gift className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Digital Asset Inheritance</h1>
            <p className="text-gray-300">You've been designated as a beneficiary</p>
          </div>

          {/* Inheritance Details */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 mb-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Inheritance Details
            </h3>
            
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{claimData.amount}</div>
                  <div className="text-lg text-gray-300">{claimData.assetType}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">From:</span>
                  <div className="text-white font-mono">{formatWalletAddress(claimData.ownerAddress)}</div>
                </div>
                <div>
                  <span className="text-gray-400">To:</span>
                  <div className="text-white font-mono">{formatWalletAddress(claimData.heirAddress)}</div>
                </div>
                <div>
                  <span className="text-gray-400">Created:</span>
                  <div className="text-white">{formatDate(claimData.createdAt)}</div>
                </div>
                <div>
                  <span className="text-gray-400">Expires:</span>
                  <div className="text-white">{formatDate(claimData.expiresAt)}</div>
                </div>
              </div>
            </div>
            
            {claimData.personalMessage && (
              <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <h4 className="text-amber-200 font-medium mb-2">💌 Personal Message:</h4>
                <p className="text-white italic">"{claimData.personalMessage}"</p>
              </div>
            )}
          </div>

          {/* Claim Action */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
            {!connected ? (
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-4">Connect Your Wallet to Claim</h3>
                <p className="text-gray-300 mb-6">
                  Please connect the wallet address: <br />
                  <span className="font-mono text-white">{claimData.heirAddress}</span>
                </p>
                <WalletMultiButton className="!bg-gradient-to-r !from-violet-600 !via-purple-600 !to-indigo-600" />
              </div>
            ) : publicKey?.toBase58() !== claimData.heirAddress ? (
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Wrong Wallet Connected</h3>
                <p className="text-gray-300 mb-2">Expected:</p>
                <p className="font-mono text-white mb-4">{claimData.heirAddress}</p>
                <p className="text-gray-300 mb-2">Currently connected:</p>
                <p className="font-mono text-white mb-6">{publicKey?.toBase58()}</p>
                <p className="text-sm text-gray-400">Please connect the correct wallet to proceed with the claim.</p>
              </div>
            ) : (
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-4">Ready to Claim</h3>
                <p className="text-gray-300 mb-6">
                  Click below to claim {claimData.amount} {claimData.assetType} to your wallet.
                </p>
                <button
                  onClick={handleClaim}
                  disabled={isClaiming}
                  className="px-8 py-4 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all transform hover:scale-105 shadow-xl"
                >
                  {isClaiming ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Claiming...</span>
                    </div>
                  ) : (
                    `Claim ${claimData.amount} ${claimData.assetType}`
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Help Section */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm mb-2">Need help?</p>
            <a 
              href="mailto:support@gadawallet.com" 
              className="text-blue-400 hover:text-blue-300 text-sm flex items-center justify-center"
            >
              Contact Support <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}