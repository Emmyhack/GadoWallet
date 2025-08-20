import React from 'react';
import { useCivic } from '../contexts/CivicContext';
import { GatewayStatus } from '@civic/solana-gateway-react';
import { Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface CivicVerificationProps {
  required?: boolean;
  onVerificationComplete?: () => void;
  className?: string;
}

const CivicVerification: React.FC<CivicVerificationProps> = ({
  required = false,
  onVerificationComplete,
  className = '',
}) => {
  const { isVerified, isLoading, requestGatewayToken, gatewayStatus } = useCivic();

  React.useEffect(() => {
    if (isVerified && onVerificationComplete) {
      onVerificationComplete();
    }
  }, [isVerified, onVerificationComplete]);

  const getStatusColor = () => {
    if (isVerified) return 'text-green-600';
    if (isLoading) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = () => {
    if (isLoading) return <Loader2 className="w-5 h-5 animate-spin" />;
    if (isVerified) return <CheckCircle className="w-5 h-5" />;
    return <AlertCircle className="w-5 h-5" />;
  };

  const getStatusText = () => {
    switch (gatewayStatus) {
      case GatewayStatus.ACTIVE:
        return 'Identity Verified ✓';
      case GatewayStatus.CHECKING:
        return 'Checking verification status...';
      case GatewayStatus.COLLECTING_USER_INFORMATION:
        return 'Please complete verification...';
      case GatewayStatus.REJECTED:
        return 'Verification rejected';
      case GatewayStatus.FROZEN:
        return 'Verification frozen';
      case GatewayStatus.NOT_REQUESTED:
        return 'Wallet not connected';
      default:
        return 'Identity verification required';
    }
  };

  const handleVerifyClick = () => {
    if (!isLoading && !isVerified && requestGatewayToken) {
      requestGatewayToken();
    }
  };

  if (!required && isVerified) {
    // If verification is optional and user is already verified, show minimal indicator
    return (
      <div className={`flex items-center gap-2 text-green-600 ${className}`}>
        <CheckCircle className="w-4 h-4" />
        <span className="text-sm">Verified</span>
      </div>
    );
  }

  return (
    <div className={`card p-6 border-2 ${isVerified ? 'border-green-200' : 'border-yellow-200'} ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <Shield className="w-6 h-6 text-purple-600" />
        <h3 className="text-lg font-semibold">Identity Verification</h3>
      </div>

      <div className="space-y-4">
        <div className={`flex items-center gap-2 ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="font-medium">{getStatusText()}</span>
        </div>

        {!isVerified && (
          <div className="space-y-3">
            <p className="text-gray-600 text-sm">
              {required 
                ? 'Identity verification is required to set up inheritance. This ensures only you can manage your assets.'
                : 'Verify your identity for enhanced security and trust in your inheritance setup.'
              }
            </p>

            <button
              onClick={handleVerifyClick}
              disabled={isLoading}
              className={`btn-primary w-full flex items-center justify-center gap-2 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Verify Identity with Civic
                </>
              )}
            </button>

            {!required && (
              <button
                onClick={() => {/* Allow skip for optional verification */}}
                className="btn-secondary w-full text-sm"
              >
                Skip for Now
              </button>
            )}
          </div>
        )}

        {isVerified && (
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-green-800 text-sm">
              🎉 Your identity has been successfully verified! You can now securely manage your inheritance settings.
            </p>
          </div>
        )}
      </div>

      {/* Security information */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <details className="text-sm text-gray-600">
          <summary className="cursor-pointer hover:text-gray-800 font-medium">
            Why do we need verification?
          </summary>
          <div className="mt-2 space-y-2">
            <p>• <strong>Security:</strong> Prevents unauthorized access to your inheritance settings</p>
            <p>• <strong>Trust:</strong> Ensures heirs can verify your identity</p>
            <p>• <strong>Compliance:</strong> Meets regulatory requirements for asset management</p>
            <p>• <strong>Privacy:</strong> Civic uses zero-knowledge proofs to protect your data</p>
          </div>
        </details>
      </div>
    </div>
  );
};

export default CivicVerification;