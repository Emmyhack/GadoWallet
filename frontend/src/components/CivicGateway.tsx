import React from 'react';
import { GatewayProvider, IdentityButton, useGateway, GatewayStatus } from '@civic/solana-gateway-react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Shield, CheckCircle, AlertCircle, Info } from 'lucide-react';

// Civic Pass Gatekeeper Network for general identity verification
// This is a test network - in production you'd use a different network
const GATEKEEPER_NETWORK = new PublicKey('gatbGF9DvLAw3kNrLHNqHMdaio34d4PsqHPHDK5hTYwc');

interface CivicGatewayProps {
  children: React.ReactNode;
  requiredForAction?: string;
  className?: string;
}

function CivicVerificationStatus() {
  const { gatewayStatus } = useGateway();

  const getStatusInfo = () => {
    if (gatewayStatus === GatewayStatus.ACTIVE) {
      return {
        icon: CheckCircle,
        text: 'Identity Verified',
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-800'
      };
    } else if (gatewayStatus && 
               [GatewayStatus.REJECTED, GatewayStatus.REVOKED, GatewayStatus.FROZEN].includes(gatewayStatus)) {
      return {
        icon: AlertCircle,
        text: 'Identity Verification Issue',
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800'
      };
    } else {
      return {
        icon: Shield,
        text: 'Identity Not Verified',
        color: 'text-gray-600 dark:text-gray-400',
        bgColor: 'bg-gray-50 dark:bg-gray-900/20',
        borderColor: 'border-gray-200 dark:border-gray-800'
      };
    }
  };

  const status = getStatusInfo();
  const Icon = status.icon;

  return (
    <div className={`p-3 rounded-md border ${status.bgColor} ${status.borderColor}`}>
      <div className="flex items-center space-x-2">
        <Icon className={`w-5 h-5 ${status.color}`} />
        <span className={`font-medium ${status.color}`}>{status.text}</span>
      </div>
    </div>
  );
}

function CivicGatewayContent({ children, requiredForAction, className }: CivicGatewayProps) {
  const { gatewayStatus } = useGateway();
  const isVerified = gatewayStatus === GatewayStatus.ACTIVE;

  return (
    <div className={className}>
      {/* Civic Pass Status Display */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-md flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Identity Verification</h3>
            <p className="text-gray-600 dark:text-gray-300">Powered by Civic Pass</p>
          </div>
        </div>

        <CivicVerificationStatus />

        {!isVerified && (
          <div className="mt-4 p-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Why verify your identity?
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Ensures only legitimate users can create inheritance plans</li>
                  <li>• Provides additional security for your digital assets</li>
                  <li>• Helps prevent fraud and unauthorized access</li>
                  <li>• Required for {requiredForAction || 'this action'}</li>
                </ul>
                <div className="mt-3">
                  <IdentityButton />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content - only show if verified or if verification is not strictly required */}
      {isVerified ? (
        <div className="space-y-6">
          <div className="p-3 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-green-800 dark:text-green-200 font-medium">
                Identity verified! You can now proceed with inheritance operations.
              </span>
            </div>
          </div>
          {children}
        </div>
      ) : (
        <div className="p-6 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-900/20">
          <div className="text-center">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Identity Verification Required
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Please complete identity verification to access inheritance features.
            </p>
            <IdentityButton />
          </div>
        </div>
      )}
    </div>
  );
}

export function CivicGateway({ children, requiredForAction, className }: CivicGatewayProps) {
  const { publicKey } = useWallet();
  const { connection } = useConnection();

  if (!publicKey) {
    return (
      <div className={className}>
        <div className="p-6 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-900/20">
          <div className="text-center">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Wallet Connection Required
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Please connect your wallet to verify your identity.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <GatewayProvider
      wallet={{
        publicKey,
        signTransaction: async () => {
          // This will be handled by the wallet adapter
          throw new Error('Transaction signing should be handled by wallet adapter');
        },
      }}
      gatekeeperNetwork={GATEKEEPER_NETWORK}
      connection={connection}
      cluster="devnet" // Change to "mainnet-beta" for production
    >
      <CivicGatewayContent 
        requiredForAction={requiredForAction}
        className={className}
      >
        {children}
      </CivicGatewayContent>
    </GatewayProvider>
  );
}

// Hook to check if user has active Civic Pass
export function useCivicVerification() {
  const { gatewayStatus } = useGateway();
  
  return {
    isVerified: gatewayStatus === GatewayStatus.ACTIVE,
    status: gatewayStatus,
    needsVerification: gatewayStatus !== GatewayStatus.ACTIVE
  };
}