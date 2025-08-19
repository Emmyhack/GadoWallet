import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl, PublicKey, Connection } from '@solana/web3.js';
import { GatewayProvider } from '@civic/solana-gateway-react';
import { CivicAuthProvider } from '../lib/civic';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletProviderProps {
  children: React.ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Devnet;

  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const connection = useMemo(() => new Connection(endpoint), [endpoint]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  // Civic Auth configuration
  const civicConfig = useMemo(() => ({
    // Civic Client ID for Gado Wallet
    clientId: 'f2fc33e0-3b6b-4ea7-bb5e-a5f60b45e808',
    // Gatekeeper network for identity verification
    gatekeeperNetwork: new PublicKey('ignREusXmGrscGNUesoU9mxfds9AiYTezUKex2PsZV6'),
    // Cluster URL
    cluster: endpoint,
    // Options for non-blocking integration
    options: {
      autoShowModal: false, // Don't block app usage
      logo: '/logo.png',
      title: 'Verify Identity for Gado Wallet',
      description: 'Complete identity verification to access enhanced security features for inheritance management',
      // Allow users to use the app without verification initially
      allowUnverified: true,
    }
  }), [endpoint]);
  
  // Inner component to access wallet context
  function GatewayWrapper({ children }: { children: React.ReactNode }) {
    const wallet = useWallet();
    
    // Create a compatible wallet adapter for Civic
    const civicWalletAdapter = useMemo(() => {
      if (!wallet.wallet || !wallet.publicKey) return undefined;
      
      return {
        ...wallet.wallet,
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions,
      };
    }, [wallet.wallet, wallet.publicKey, wallet.signTransaction, wallet.signAllTransactions]);
    
    return (
      <GatewayProvider
        wallet={civicWalletAdapter}
        gatekeeperNetwork={civicConfig.gatekeeperNetwork}
        connection={connection}
        cluster={civicConfig.cluster}
        options={civicConfig.options}
      >
        <CivicAuthProvider>
          {children}
        </CivicAuthProvider>
      </GatewayProvider>
    );
  }

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>
          <GatewayWrapper>
            {children}
          </GatewayWrapper>
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}