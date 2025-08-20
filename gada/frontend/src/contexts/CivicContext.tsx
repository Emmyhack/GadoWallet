import React, { createContext, useContext, ReactNode } from 'react';
import { SolanaGatewayProvider, useGateway } from '@civic/solana-gateway-react';
import { useWallet } from './WalletContext';
import { useConnection } from '@solana/wallet-adapter-react';

// Civic Gateway configuration
const GATEKEEPER_NETWORK = 'tgnuXXNMDLK8dy7Xm1TdeGyc95MDym4bvAQCwcW21Bf'; // Civic Captcha Pass
const GATEKEEPER_NETWORK_UNIQUENESS = '49wLubTmowVu8idEHdFQ6EAQnmktDJncGc7LnYcKEfzz'; // Civic Uniqueness Pass

interface CivicContextType {
  isVerified: boolean;
  isLoading: boolean;
  requestGatewayToken: () => void;
  gatewayToken: any;
  gatewayStatus: string;
}

const CivicContext = createContext<CivicContextType | undefined>(undefined);

export const useCivic = () => {
  const context = useContext(CivicContext);
  if (!context) {
    throw new Error('useCivic must be used within a CivicProvider');
  }
  return context;
};

// Inner provider that uses the Gateway hook
const CivicInnerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { gatewayToken, gatewayStatus, requestGatewayToken } = useGateway();
  
  const isVerified = gatewayStatus === 'ACTIVE' && gatewayToken;
  const isLoading = gatewayStatus === 'CHECKING' || gatewayStatus === 'COLLECTING_USER_INFORMATION';

  const value: CivicContextType = {
    isVerified,
    isLoading,
    requestGatewayToken,
    gatewayToken,
    gatewayStatus,
  };

  return (
    <CivicContext.Provider value={value}>
      {children}
    </CivicContext.Provider>
  );
};

// Main provider that wraps with SolanaGatewayProvider
export const CivicProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { connection } = useConnection();
  const wallet = useWallet();

  if (!wallet?.publicKey) {
    // Return children without Civic verification if wallet not connected
    return (
      <CivicContext.Provider value={{
        isVerified: false,
        isLoading: false,
        requestGatewayToken: () => console.warn('Wallet not connected'),
        gatewayToken: null,
        gatewayStatus: 'NOT_CONNECTED',
      }}>
        {children}
      </CivicContext.Provider>
    );
  }

  return (
    <SolanaGatewayProvider
      wallet={wallet as any}
      connection={connection}
      cluster="devnet"
      gatekeeperNetwork={GATEKEEPER_NETWORK}
      options={{
        autoShowModal: false, // We'll control when to show the modal
        logo: 'https://avatars.githubusercontent.com/u/89479282?s=200&v=4', // Your app logo
        title: 'Gada Wallet Guardian',
        description: 'Verify your identity to secure your inheritance setup',
      }}
    >
      <CivicInnerProvider>
        {children}
      </CivicInnerProvider>
    </SolanaGatewayProvider>
  );
};