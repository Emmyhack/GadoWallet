import React, { createContext, useContext, useMemo } from 'react';
import { ConnectionProvider, WalletProvider, useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { PublicKey } from '@solana/web3.js';
import { handleWalletError } from '../utils/errorHandling';
import { getRpcUrl } from '../lib/shared-config';

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
  const endpoint = useMemo(() => getRpcUrl(), []);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  // Error handler for wallet connection issues
  const onError = useMemo(
    () => (error: any) => {
      handleWalletError(error);
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