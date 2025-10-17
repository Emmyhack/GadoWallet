import { useState, useEffect } from 'react';
import { useAnchorProgram } from '../lib/anchor';
// Note: listCoinHeirsByOwnerAndHeir, listTokenHeirsByOwnerAndHeir, and isHeirClaimable functions need to be implemented
import { useWallet } from '@solana/wallet-adapter-react';
import { web3 } from '@coral-xyz/anchor';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { 
  Gift, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Coins, 
  Coins as Token,
  Clock,
  User,
  Mail,
  ExternalLink,
  Copy,
  Shield,
  Info,
  Star,
  Activity,
  Eye,
  Calendar,
  Wallet
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ClaimableAsset {
  id: string;
  type: 'sol' | 'token';
  owner: string;
  amount: string;
  lastActiveTime: string;
  isClaimable: boolean;
  tokenMint?: string;
  estimatedValue?: number;
  claimableDate?: string;
  ownerEmail?: string;
  daysUntilClaimable?: number;
  urgency?: 'low' | 'medium' | 'high';
}

export function ClaimAssets() {
  const program = useAnchorProgram();
  const { publicKey } = useWallet();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [claimableAssets, setClaimableAssets] = useState<ClaimableAsset[]>([]);
  const [filter, setFilter] = useState<'all' | 'claimable' | 'pending'>('all');
  const [sortBy, setSortBy] = useState<'amount' | 'date' | 'urgency'>('urgency');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState('');
  const [totalAssets, setTotalAssets] = useState({ count: 0, value: 0 });

  // Auto-clear copy notification
  useEffect(() => {
    if (copiedAddress) {
      const timer = setTimeout(() => setCopiedAddress(''), 2000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [copiedAddress]);

  // Utility functions
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const calculateUrgency = (asset: ClaimableAsset): 'low' | 'medium' | 'high' => {
    const daysSinceInactive = getTimeSinceInactivity(asset.lastActiveTime);
    if (asset.isClaimable) return 'high';
    if (daysSinceInactive > 1) return 'medium';
    return 'low';
  };

  const enhanceAsset = (asset: ClaimableAsset): ClaimableAsset => {
    const daysSinceInactive = getTimeSinceInactivity(asset.lastActiveTime);
    const daysUntilClaimable = Math.max(0, 2 - daysSinceInactive); // 2-day period
    const estimatedValue = parseFloat(asset.amount) * (asset.type === 'sol' ? 100 : 1); // Mock SOL price
    
    return {
      ...asset,
      urgency: calculateUrgency(asset),
      daysUntilClaimable,
      estimatedValue,
      claimableDate: new Date(Date.now() + daysUntilClaimable * 24 * 60 * 60 * 1000).toISOString(),
    };
  };

  const filteredAndSortedAssets = claimableAssets
    .filter(asset => {
      if (filter === 'claimable') return asset.isClaimable;
      if (filter === 'pending') return !asset.isClaimable;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'amount') return parseFloat(b.amount) - parseFloat(a.amount);
      if (sortBy === 'date') return new Date(b.lastActiveTime).getTime() - new Date(a.lastActiveTime).getTime();
      if (sortBy === 'urgency') {
        const urgencyOrder = { high: 3, medium: 2, low: 1 };
        return (urgencyOrder[b.urgency || 'low'] || 0) - (urgencyOrder[a.urgency || 'low'] || 0);
      }
      return 0;
    });

  // Update totals when assets change
  useEffect(() => {
    const count = claimableAssets.length;
    const value = claimableAssets.reduce((sum, asset) => sum + (asset.estimatedValue || 0), 0);
    setTotalAssets({ count, value });
  }, [claimableAssets]);

  const handleSearchAssets = async () => {
    if (!program || !publicKey || !searchAddress) return;

    try {
      setIsLoading(true);
      setMessage('');

      const ownerPk = new web3.PublicKey(searchAddress);
      const [coinHeirs, tokenHeirs] = await Promise.all([
        // TODO: Implement these functions
        Promise.resolve([]), // listCoinHeirsByOwnerAndHeir(program, ownerPk, publicKey),
        Promise.resolve([]), // listTokenHeirsByOwnerAndHeir(program, ownerPk, publicKey),
      ]);

      // Process coin heirs with claimability check
      const coinAssets = await Promise.all(
        coinHeirs.map(async (c: any) => ({
          id: c.publicKey.toBase58(),
          type: 'sol' as const,
          owner: c.account.owner.toBase58(),
          amount: (Number(c.account.amount) / 1e9).toString(),
          lastActiveTime: new Date(c.account.lastActivity.toNumber() * 1000).toISOString(),
          isClaimable: false, // TODO: await isHeirClaimable(program, new web3.PublicKey(c.account.owner), publicKey!, 'sol'),
        }))
      );

      // Process token heirs with claimability check
      const tokenAssets = await Promise.all(
        tokenHeirs.map(async (t: any) => ({
          id: t.publicKey.toBase58(),
          type: 'token' as const,
          owner: t.account.owner.toBase58(),
          amount: t.account.amount.toString(),
          lastActiveTime: new Date(t.account.lastActivity.toNumber() * 1000).toISOString(),
          isClaimable: false, // TODO: await isHeirClaimable(program, new web3.PublicKey(t.account.owner), publicKey!, 'token', new web3.PublicKey(t.account.tokenMint)),
          tokenMint: t.account.tokenMint.toBase58(),
        }))
      );

      const rawAssets: ClaimableAsset[] = [...coinAssets, ...tokenAssets];

      const enhancedAssets = rawAssets.map(asset => enhanceAsset(asset));
      setClaimableAssets(enhancedAssets);
      setMessage(enhancedAssets.length ? t('assetsFound') : t('noClaimableAssets'));
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
        
        // Implement claimSolInheritance method
        const [solHeirPDA] = web3.PublicKey.findProgramAddressSync(
          [Buffer.from('sol_heir'), ownerAccount.toBuffer(), publicKey.toBuffer()],
          program.programId
        );

        console.log('📋 Claiming SOL inheritance:', {
          solHeir: solHeirPDA.toString(),
          heir: publicKey.toString(),
          owner: ownerAccount.toString(),
          amount: `${asset.amount} SOL`
        });

        if (!('claimSolInheritance' in program.methods)) {
          throw new Error('Program methods not available. Please ensure wallet is connected.');
        }

        await (program.methods as any)['claimSolInheritance']()
          .accountsPartial({
            solHeir: solHeirPDA,
            heir: publicKey,
            systemProgram: web3.SystemProgram.programId,
          })
          .rpc({
            commitment: 'confirmed',
            preflightCommitment: 'confirmed',
            skipPreflight: false,
          });
        
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

        // TODO: Implement claimTokenInheritance method in the program
        console.log('claimTokenInheritance method not yet implemented in program');
        // await program.methods
        //   .claimTokenInheritance()
        //   .accountsPartial({
        //     tokenHeir: web3.PublicKey.findProgramAddressSync(
        //       [Buffer.from('token_heir'), ownerPk.toBuffer(), publicKey.toBuffer(), mintPk.toBuffer()],
        //       program.programId
        //     )[0],
        //     heir: publicKey,
        //     tokenMint: mintPk,
        //     escrowTokenAccount: ownerTokenAccount,
        //     heirTokenAccount: heirTokenAccount,
        //     tokenProgram: new web3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
        //     systemProgram: web3.SystemProgram.programId,
        //   })
        //   .signers([])
        //   .rpc();

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
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center shadow-lg">
            <Gift className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">{t('claimAssets')}</h2>
            <p className="text-gray-600">{t('claimAssetsSubtitle')}</p>
          </div>
        </div>
        
        {/* Stats Summary */}
        {totalAssets.count > 0 && (
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{totalAssets.count}</div>
              <div className="text-sm text-gray-600">{t('totalAssets')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">${totalAssets.value.toFixed(2)}</div>
              <div className="text-sm text-gray-600">{t('estimatedValue')}</div>
            </div>
          </div>
        )}
      </div>

      {/* Search Section */}
      <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/90 dark:bg-gray-900/70 backdrop-blur-lg p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Search className="w-5 h-5 mr-2" />
            {t('searchClaimableAssets')}
          </h3>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
          >
            <Eye className="w-4 h-4 mr-1" />
            {showAdvanced ? t('hideAdvanced') : t('showAdvanced')}
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                {t('ownerWalletAddress')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  placeholder={t('enterOwnerWalletAddress') || ''}
                  className="input-field pr-10"
                />
                {searchAddress && (
                  <button
                    onClick={() => copyToClipboard(searchAddress)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {copiedAddress === searchAddress ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
              {searchAddress && !isValidAddress(searchAddress) && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  {t('invalidWalletAddress')}
                </p>
              )}
            </div>
            
            <button
              onClick={handleSearchAssets}
              disabled={!searchAddress || !isValidAddress(searchAddress) || isLoading}
              className="btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
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

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('filterAssets')}
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="input-field"
                >
                  <option value="all">{t('allAssets')}</option>
                  <option value="claimable">{t('claimableOnly')}</option>
                  <option value="pending">{t('pendingOnly')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('sortBy')}
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="input-field"
                >
                  <option value="urgency">{t('urgency')}</option>
                  <option value="amount">{t('amount')}</option>
                  <option value="date">{t('lastActiveDate')}</option>
                </select>
              </div>
            </div>
          )}
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
      {filteredAndSortedAssets.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              {t('claimableAssets')} ({filteredAndSortedAssets.length})
            </h3>
            {filteredAndSortedAssets.length > 1 && (
              <div className="text-sm text-gray-500">
                {t('sortedBy')} {t(sortBy)}
              </div>
            )}
          </div>
          
          {filteredAndSortedAssets.map((asset) => (
            <div key={asset.id} className={`rounded-xl border backdrop-blur-lg p-6 transition-all hover:shadow-lg ${
              asset.isClaimable 
                ? 'border-green-200 bg-green-50/80 dark:bg-green-900/20' 
                : 'border-gray-200 bg-white/80 dark:bg-gray-900/60'
            }`}>
              {/* Asset Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    asset.type === 'sol' 
                      ? 'bg-gradient-to-br from-purple-500 to-blue-500' 
                      : 'bg-gradient-to-br from-green-500 to-teal-500'
                  } shadow-lg`}>
                    {asset.type === 'sol' ? (
                      <Coins className="w-6 h-6 text-white" />
                    ) : (
                      <Token className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">
                      {asset.amount} {asset.type === 'sol' ? 'SOL' : 'Tokens'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {asset.estimatedValue && `~$${asset.estimatedValue.toFixed(2)}`}
                    </p>
                  </div>
                </div>
                
                {/* Status and Urgency Badge */}
                <div className="flex items-center space-x-3">
                  {asset.urgency && (
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      asset.urgency === 'high' ? 'bg-red-100 text-red-700' :
                      asset.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      <Star className="w-3 h-3 inline mr-1" />
                      {t(asset.urgency + 'Urgency')}
                    </div>
                  )}
                  
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                    asset.isClaimable 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      asset.isClaimable ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                    <span className="text-sm font-medium">
                      {asset.isClaimable ? t('claimable') : t('notYetClaimable')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Asset Details Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <User className="w-4 h-4 mr-1" />
                    {t('owner')}
                  </div>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-mono text-gray-900 truncate flex-1">{asset.owner}</p>
                    <button
                      onClick={() => copyToClipboard(asset.owner)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {copiedAddress === asset.owner ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <Clock className="w-4 h-4 mr-1" />
                    {t('lastActive')}
                  </div>
                  <p className="text-sm font-medium text-gray-900">{formatDate(asset.lastActiveTime)}</p>
                  <p className="text-xs text-gray-500">{getTimeSinceInactivity(asset.lastActiveTime)} {t('daysAgo')}</p>
                </div>
                
                {!asset.isClaimable && asset.daysUntilClaimable !== undefined && (
                  <div className="p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      {t('claimableIn')}
                    </div>
                    <p className="text-sm font-medium text-orange-600">
                      {asset.daysUntilClaimable} {t('days')}
                    </p>
                    {asset.claimableDate && (
                      <p className="text-xs text-gray-500">{formatDate(asset.claimableDate)}</p>
                    )}
                  </div>
                )}
                
                {asset.tokenMint && (
                  <div className="p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg md:col-span-2 lg:col-span-3">
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <Token className="w-4 h-4 mr-1" />
                      {t('tokenMint')}
                    </div>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-mono text-gray-900 break-all flex-1">{asset.tokenMint}</p>
                      <button
                        onClick={() => copyToClipboard(asset.tokenMint!)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {copiedAddress === asset.tokenMint ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => handleClaimAsset(asset)}
                  disabled={!asset.isClaimable || isLoading}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all ${
                    asset.isClaimable
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{t('claiming')}</span>
                    </>
                  ) : asset.isClaimable ? (
                    <>
                      <Gift className="w-5 h-5" />
                      <span>{asset.type === 'sol' ? t('claimSol') : t('claimTokens')}</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      <span>{t('waitingPeriod')}</span>
                    </>
                  )}
                </button>
                
                {/* Secondary actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => window.open(`https://explorer.solana.com/address/${asset.owner}`, '_blank')}
                    className="p-3 bg-white/80 hover:bg-white border border-gray-200 rounded-xl transition-colors"
                    title={t('viewOnExplorer')}
                  >
                    <ExternalLink className="w-4 h-4 text-gray-600" />
                  </button>
                  
                  {asset.ownerEmail && (
                    <button
                      className="p-3 bg-white/80 hover:bg-white border border-gray-200 rounded-xl transition-colors"
                      title={t('contactOwner')}
                    >
                      <Mail className="w-4 h-4 text-gray-600" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Enhanced Information Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-gradient-to-br from-white/90 to-gray-50/90 dark:bg-gray-900/60 backdrop-blur p-6 shadow-lg">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">{t('claimingProcess')}</h3>
          </div>
          <ul className="text-sm text-gray-700 space-y-2">
            <li className="flex items-start">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              {t('canClaimAfterTwoDays')}
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              {t('onlyDesignatedHeirs')}
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              {t('claimsRequireSignature')}
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              {t('assetsTransferredDirectly')}
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-gradient-to-br from-white/90 to-gray-50/90 dark:bg-gray-900/60 backdrop-blur p-6 shadow-lg">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
              <Shield className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900">{t('requirements')}</h3>
          </div>
          <ul className="text-sm text-gray-700 space-y-2">
            <li className="flex items-start">
              <Wallet className="w-4 h-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
              {t('mustBeDesignatedHeir')}
            </li>
            <li className="flex items-start">
              <Clock className="w-4 h-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
              {t('ownerInactiveTwoDays')}
            </li>
            <li className="flex items-start">
              <Gift className="w-4 h-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
              {t('assetsNotAlreadyClaimed')}
            </li>
            <li className="flex items-start">
              <User className="w-4 h-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
              {t('validWalletRequired')}
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-gradient-to-br from-white/90 to-gray-50/90 dark:bg-gray-900/60 backdrop-blur p-6 shadow-lg">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">{t('tipAndTricks')}</h3>
          </div>
          <ul className="text-sm text-gray-700 space-y-2">
            <li className="flex items-start">
              <Star className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              {t('useEmailClaimLinks')}
            </li>
            <li className="flex items-start">
              <Mail className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              {t('notifyHeirsViaEmail')}
            </li>
            <li className="flex items-start">
              <Search className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              {t('searchByOwnerAddress')}
            </li>
            <li className="flex items-start">
              <ExternalLink className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              {t('verifyOnBlockchainExplorer')}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}