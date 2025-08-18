import { useState } from 'react';
import { useAnchorProgram, listCoinHeirsByOwnerAndHeir, listTokenHeirsByOwnerAndHeir, isHeirClaimable } from '../lib/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import { web3 } from '@project-serum/anchor';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { Gift, Search, AlertTriangle, CheckCircle, Coins, Coins as Token } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CivicGateway } from './CivicGateway';

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
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [claimableAssets, setClaimableAssets] = useState<ClaimableAsset[]>([]);

  const handleSearchAssets = async () => {
    if (!program || !publicKey || !searchAddress) return;

    try {
      setIsLoading(true);
      setMessage('');

      const ownerPk = new web3.PublicKey(searchAddress);
      const [coinHeirs, tokenHeirs] = await Promise.all([
        listCoinHeirsByOwnerAndHeir(program, ownerPk, publicKey),
        listTokenHeirsByOwnerAndHeir(program, ownerPk, publicKey),
      ]);

      const assets: ClaimableAsset[] = [
        ...coinHeirs.map((c: any) => ({
          id: c.publicKey.toBase58(),
          type: 'sol' as const,
          owner: c.account.owner.toBase58(),
          amount: (Number(c.account.amount) / 1e9).toString(),
          lastActiveTime: new Date(c.account.lastActiveTime.toNumber() * 1000).toISOString(),
          isClaimable: isHeirClaimable(
            c.account.lastActiveTime.toNumber(),
            c.account.isClaimed,
            c.account.inactivityPeriodSeconds?.toNumber?.() ?? c.account.inactivity_period_seconds?.toNumber?.() ?? 365 * 24 * 60 * 60,
          ),
        })),
        ...tokenHeirs.map((t: any) => ({
          id: t.publicKey.toBase58(),
          type: 'token' as const,
          owner: t.account.owner.toBase58(),
          amount: t.account.amount.toString(),
          lastActiveTime: new Date(t.account.lastActiveTime.toNumber() * 1000).toISOString(),
          isClaimable: isHeirClaimable(
            t.account.lastActiveTime.toNumber(),
            t.account.isClaimed,
            t.account.inactivityPeriodSeconds?.toNumber?.() ?? t.account.inactivity_period_seconds?.toNumber?.() ?? 365 * 24 * 60 * 60,
          ),
          tokenMint: t.account.tokenMint.toBase58(),
        })),
      ];

      setClaimableAssets(assets);
      setMessage(assets.length ? t('assetsFound') : t('noClaimableAssets'));
    } catch (error) {
      console.error('Error searching assets:', error);
      setMessage(t('errorSearchingAssets'));
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
            coin_heir: web3.PublicKey.findProgramAddressSync(
              [Buffer.from('coin_heir'), ownerAccount.toBuffer(), publicKey.toBuffer()],
              program.programId
            )[0],
            owner_account: ownerAccount,
            heir_account: publicKey,
          })
          .rpc();
        
        setMessage(t('solClaimedSuccess'));
      } else {
        if (!asset.tokenMint) {
          setMessage(t('tokenMintRequired'));
          return;
        }
        const ownerPk = new web3.PublicKey(asset.owner);
        const mintPk = new web3.PublicKey(asset.tokenMint);
        const ownerTokenAccount = await getAssociatedTokenAddress(mintPk, ownerPk);
        const heirTokenAccount = await getAssociatedTokenAddress(mintPk, publicKey);

        // Authority must be allowed to transfer from owner's token account. In this program,
        // 'authority' is a generic AccountInfo expected to sign; we use ownerPk which cannot sign here.
        // Practically, the owner must approve or asset must be held by a PDA. This front-end will
        // attempt with ownerPk as authority only if the connected wallet equals owner.
        if (publicKey.toBase58() !== ownerPk.toBase58()) {
          setMessage(t('tokenClaimRequiresOwnerAuth'));
          return;
        }

        await program.methods
          .claimHeirTokenAssets()
          .accounts({
            token_heir: web3.PublicKey.findProgramAddressSync(
              [Buffer.from('token_heir'), ownerPk.toBuffer(), publicKey.toBuffer(), mintPk.toBuffer()],
              program.programId
            )[0],
            owner: ownerPk,
            heir: publicKey,
            owner_token_account: ownerTokenAccount,
            heir_token_account: heirTokenAccount,
            authority: ownerPk,
            token_program: new web3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
          })
          .rpc();

        setMessage(t('tokenClaimedSuccess'));
      }

      // Remove claimed asset from list
      setClaimableAssets(prev => prev.filter(a => a.id !== asset.id));
    } catch (error) {
      console.error('Error claiming asset:', error);
      setMessage(t('errorClaimingAsset'));
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
    <CivicGateway 
      requiredForAction="claiming inherited assets"
      className="space-y-6"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-gray-900 rounded-md flex items-center justify-center">
          <Gift className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">{t('claimAssets')}</h2>
          <p className="text-gray-600">{t('claimAssetsSubtitle')}</p>
        </div>
      </div>

      {/* Search Section */}
      <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-gray-900/60 backdrop-blur p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('searchClaimableAssets')}</h3>
        
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('ownerWalletAddress')}
            </label>
            <input
              type="text"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              placeholder={t('enterOwnerWalletAddress') || ''}
              className="input-field"
            />
            {searchAddress && !isValidAddress(searchAddress) && (
              <p className="text-red-500 text-sm mt-1">{t('invalidWalletAddress')}</p>
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
                <span>{t('searching')}</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>{t('search')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-md ${
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
          <h3 className="text-lg font-semibold text-gray-900">{t('claimableAssets')}</h3>
          
          {claimableAssets.map((asset) => (
            <div key={asset.id} className="rounded-lg border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-gray-900/60 backdrop-blur p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {asset.type === 'sol' ? (
                    <Coins className="w-6 h-6 text-gray-600" />
                  ) : (
                    <Token className="w-6 h-6 text-gray-600" />
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {asset.type === 'sol' ? t('sol') : t('splToken')}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {t('amount')}: {asset.amount} {asset.type === 'sol' ? t('sol') : t('splToken')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {asset.isClaimable ? (
                    <div className="flex items-center space-x-2 text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">{t('claimable')}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-sm font-medium">{t('notYetClaimable')}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-sm text-gray-600">{t('owner')}:</span>
                  <p className="text-sm font-mono text-gray-900 break-all">{asset.owner}</p>
                </div>
                
                <div>
                  <span className="text-sm text-gray-600">{t('lastActiveShort')}:</span>
                  <p className="text-sm text-gray-900">{formatDate(asset.lastActiveTime)}</p>
                </div>
                
                <div>
                  <span className="text-sm text-gray-600">{t('daysSinceInactivity')}:</span>
                  <p className="text-sm text-gray-900">{getTimeSinceInactivity(asset.lastActiveTime)} {t('daysAgo')}</p>
                </div>
                
                {asset.tokenMint && (
                  <div>
                    <span className="text-sm text-gray-600">{t('tokenMint')}:</span>
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
                    <span>{t('claiming')}</span>
                  </>
                ) : (
                  <>
                    <Gift className="w-4 h-4" />
                    <span>{asset.type === 'sol' ? t('claimSol') : t('claimTokens')}</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Information Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-gray-900/60 backdrop-blur p-4">
          <h3 className="font-semibold text-gray-900 mb-2">{t('claimingProcess')}</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• {t('canClaimAfterYear')}</li>
            <li>• {t('onlyDesignatedHeirs')}</li>
            <li>• {t('claimsRequireSignature')}</li>
            <li>• {t('assetsTransferredDirectly')}</li>
          </ul>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-gray-900/60 backdrop-blur p-4">
          <h3 className="font-semibold text-gray-900 mb-2">{t('requirements')}</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• {t('mustBeDesignatedHeir')}</li>
            <li>• {t('ownerInactiveOneYear')}</li>
            <li>• {t('assetsNotAlreadyClaimed')}</li>
            <li>• {t('validWalletRequired')}</li>
          </ul>
        </div>
      </div>
    </CivicGateway>
  );
}