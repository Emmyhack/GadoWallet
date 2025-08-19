import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGateway } from '@civic/solana-gateway-react';

interface CivicAuthContextType {
  isVerified: boolean;
  isVerifying: boolean;
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  requestVerification: () => Promise<void>;
  gatewayToken: any;
  error: string | null;
}

const CivicAuthContext = createContext<CivicAuthContextType | undefined>(undefined);

export function CivicAuthProvider({ children }: { children: React.ReactNode }) {
  const { connected, publicKey } = useWallet();
  const gateway = useGateway();
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fallback for when Civic is not available
  const isCivicAvailable = useMemo(() => {
    try {
      return gateway !== undefined;
    } catch {
      return false;
    }
  }, [gateway]);

  const verificationStatus = useMemo(() => {
    if (!connected || !publicKey) return 'unverified';
    if (!gateway) return 'unverified';
    
    if (gateway.gatewayToken) {
      // Check if token is valid and not expired
      const now = Date.now() / 1000;
      if (gateway.gatewayToken.expiryTime && gateway.gatewayToken.expiryTime > now) {
        return 'verified';
      } else {
        return 'unverified'; // Token expired
      }
    }
    
    if (isVerifying) return 'pending';
    return 'unverified';
  }, [connected, publicKey, gateway, isVerifying]);

  const isVerified = verificationStatus === 'verified';

  const requestVerification = async () => {
    if (!connected || !publicKey) {
      setError('Wallet not connected');
      return;
    }

    if (!isCivicAvailable) {
      setError('Civic verification service is not available');
      return;
    }

    try {
      setIsVerifying(true);
      setError(null);
      if (gateway && typeof gateway.requestGatewayToken === 'function') {
        await gateway.requestGatewayToken();
      } else {
        throw new Error('Gateway not available or requestGatewayToken method not found');
      }
    } catch (err) {
      console.error('Civic verification error:', err);
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  // Clear error when wallet disconnects
  useEffect(() => {
    if (!connected) {
      setError(null);
      setIsVerifying(false);
    }
  }, [connected]);

  const value: CivicAuthContextType = {
    isVerified,
    isVerifying,
    verificationStatus,
    requestVerification,
    gatewayToken: gateway?.gatewayToken,
    error
  };

  return (
    <CivicAuthContext.Provider value={value}>
      {children}
    </CivicAuthContext.Provider>
  );
}

export function useCivicAuth() {
  const context = useContext(CivicAuthContext);
  if (context === undefined) {
    throw new Error('useCivicAuth must be used within a CivicAuthProvider');
  }
  return context;
}

// Helper function to check if verification is required for sensitive operations
export function isVerificationRequired(operation: 'addHeir' | 'batchTransfer' | 'claimAssets' | 'updateActivity'): boolean {
  // For now, only require verification for adding heirs and large batch transfers
  // This can be configured based on business requirements
  switch (operation) {
    case 'addHeir':
      return true; // Always require verification for inheritance setup
    case 'batchTransfer':
      return true; // Require verification for batch transfers
    case 'claimAssets':
      return true; // Require verification for claiming assets
    case 'updateActivity':
      return false; // Don't require verification for activity updates
    default:
      return false;
  }
}

// Helper component for verification prompts
export function VerificationPrompt({ 
  operation, 
  onVerify, 
  onSkip 
}: { 
  operation: string; 
  onVerify: () => void; 
  onSkip?: () => void; 
}) {
  const { isVerifying, error } = useCivicAuth();

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
      <div className="flex items-start space-x-3">
        <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
            Identity Verification Recommended
          </h3>
          <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
            For enhanced security when {operation}, we recommend completing identity verification through Civic.
          </p>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-2">
              Verification error: {error}
            </p>
          )}
          <div className="flex space-x-3 mt-3">
            <button
              onClick={onVerify}
              disabled={isVerifying}
              className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-sm px-3 py-1.5 rounded-md font-medium transition-colors"
            >
              {isVerifying ? 'Verifying...' : 'Verify Identity'}
            </button>
            {onSkip && (
              <button
                onClick={onSkip}
                className="bg-gray-500 hover:bg-gray-600 text-white text-sm px-3 py-1.5 rounded-md font-medium transition-colors"
              >
                Continue Without Verification
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}