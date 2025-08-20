import React, { createContext, useContext, useMemo } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider, useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl, PublicKey } from '@solana/web3.js';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

// Type for the custom context, matching useSolanaWallet's return type
interface CustomWalletContextType {
  wallet: any; // Using any for the wallet object to avoid import issues
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>; // disconnect is also a Promise
}

const WalletContext = createContext<CustomWalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider (custom)');
  }
  return context;
};

// This component will live *inside* the Solana WalletAdapter's WalletProvider
// It will use useSolanaWallet and then provide our custom context
const WalletInnerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { wallet, publicKey, connected, connecting, connect, disconnect } = useSolanaWallet();

  // Memoize the context value
  const value: CustomWalletContextType = useMemo(() => ({
    wallet,
    publicKey,
    connected,
    connecting,
    connect,
    disconnect,
  }), [wallet, publicKey, connected, connecting, connect, disconnect]);

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const WalletContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    [network]
  );

  // Error handler for wallet connection issues
  const onError = useMemo(
    () => (error: any) => {
      console.warn('Wallet connection error:', error);
      // Don't throw for MetaMask detection errors from Solflare
      if (error?.message?.includes('MetaMask extension not found')) {
        console.info('MetaMask not detected, continuing with available wallets');
        return;
      }
      // Log other errors but don't break the app
      if (error?.message) {
        console.error('Wallet error:', error.message);
      }
    },
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect onError={onError}>
        <WalletModalProvider>
          {/* Crucial change: WalletInnerProvider wraps the children */}
          <WalletInnerProvider>
            {children}
          </WalletInnerProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}; 