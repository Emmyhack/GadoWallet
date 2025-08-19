import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletProviderProps {
  children: React.ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  console.log('💰 WalletProvider initializing');
  
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Devnet;

  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => {
    const url = clusterApiUrl(network);
    console.log('🌐 RPC endpoint:', url);
    return url;
  }, [network]);

  const wallets = useMemo(
    () => {
      console.log('👛 Initializing wallet adapters');
      try {
        return [
          new PhantomWalletAdapter(),
          new SolflareWalletAdapter(),
        ];
      } catch (error) {
        console.error('❌ Error initializing wallets:', error);
        return [];
      }
    },
    []
  );

  console.log('🔗 WalletProvider rendering with', wallets.length, 'wallets');
  
  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}