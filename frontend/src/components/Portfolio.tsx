import { useEffect, useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { Wallet, Coins } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ParsedTokenHolding {
  mint: string;
  amount: number;
  decimals: number;
  ata: string;
}

export function Portfolio() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [tokens, setTokens] = useState<ParsedTokenHolding[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!publicKey) return;
      try {
        setIsLoading(true);

        const [balanceLamports, tokenAccounts] = await Promise.all([
          connection.getBalance(publicKey),
          connection.getParsedTokenAccountsByOwner(publicKey, { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') })
        ]);

        setSolBalance(balanceLamports / LAMPORTS_PER_SOL);

        const holdings: ParsedTokenHolding[] = tokenAccounts.value
          .map((acc) => {
            const info: any = acc.account.data.parsed.info;
            const amount = Number(info.tokenAmount.uiAmount || 0);
            const decimals = Number(info.tokenAmount.decimals || 0);
            return {
              mint: info.mint as string,
              amount,
              decimals,
              ata: info.owner as string,
            };
          })
          .filter((h) => h.amount > 0)
          .sort((a, b) => b.amount - a.amount);

        setTokens(holdings);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolio();
  }, [publicKey, connection]);

  if (!publicKey) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-rose-600 rounded-lg flex items-center justify-center mx-auto mb-4 animate-fade-in">
          <Wallet className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('noWalletConnected')}</h3>
        <p className="text-gray-600">{t('connectWalletToViewStats')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center space-x-3 mb-2">
        <div className="w-8 h-8 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-rose-600 rounded-md flex items-center justify-center">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">{t('wallet')}</h2>
          <p className="text-gray-600">{t('walletStatsOverview')}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-white to-gray-50">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-xs text-gray-500">{t('solBalance')}</span>
          </div>
          <div className="text-3xl font-semibold text-gray-900">
            {isLoading || solBalance === null ? '—' : solBalance.toFixed(4)}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Coins className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-xs text-gray-500">{t('tokenCount')}</span>
          </div>
          <div className="text-3xl font-semibold text-gray-900">
            {isLoading ? '—' : tokens.length}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Coins className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-xs text-gray-500">{t('topToken')}</span>
          </div>
          <div className="text-sm text-gray-900 break-all">
            {isLoading || tokens.length === 0 ? '—' : tokens[0].mint}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <h3 className="text-sm font-semibold text-gray-900">{t('splTokenHoldings')}</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {isLoading && (
            <div className="p-4 text-sm text-gray-500">{t('loadingTokens')}</div>
          )}
          {!isLoading && tokens.length === 0 && (
            <div className="p-4 text-sm text-gray-500">{t('noTokensFound')}</div>
          )}
          {tokens.map((token) => (
            <div key={token.mint} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="min-w-0 pr-4">
                <div className="text-sm font-medium text-gray-900 break-all">{token.mint}</div>
                <div className="text-xs text-gray-500 break-all">{t('ataLabel')} {token.ata}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900">{token.amount}</div>
                <div className="text-xs text-gray-500">{t('decimalsLabel')} {token.decimals}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}