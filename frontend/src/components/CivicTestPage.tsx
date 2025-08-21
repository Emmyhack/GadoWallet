import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useCivicAuth, CivicIdentityButton, SignInButton, SignOutButton, UserButton } from '../lib/civic';
import { useCivicAuthContext } from '@civic/auth/react';
import { Shield, CheckCircle, AlertTriangle, Clock, User } from 'lucide-react';

export function CivicTestPage() {
  const { connected } = useWallet();
  const { verificationStatus, error, user } = useCivicAuth();
  const civicAuth = useCivicAuthContext();

  if (!connected) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Civic Verification Test
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Please connect your wallet to test the Civic verification functionality.
          </p>
        </div>
      </div>
    );
  }

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'verified':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'pending':
        return <Clock className="w-8 h-8 text-yellow-500" />;
      case 'rejected':
        return <AlertTriangle className="w-8 h-8 text-red-500" />;
      default:
        return <Shield className="w-8 h-8 text-gray-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (verificationStatus) {
      case 'verified':
        return 'Your identity has been verified successfully!';
      case 'pending':
        return 'Verification is in progress. Please complete the process in the popup window.';
      case 'rejected':
        return 'Verification was rejected. Please try again or contact support.';
      default:
        return 'Click the button below to start the identity verification process.';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Civic Identity Verification Test
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Test the Civic Pass integration and verification flow.
          </p>
        </div>

        {/* Status Display */}
        <div className="text-center mb-8">
          <div className="mb-4">
            {getStatusIcon()}
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Status: {verificationStatus.charAt(0).toUpperCase() + verificationStatus.slice(1)}
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            {getStatusMessage()}
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Verification Error
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Auth Info */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Authentication Information
          </h4>
          <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
            <div>Auth Status: {civicAuth.authStatus}</div>
            <div>User ID: {user?.sub || 'Not available'}</div>
            <div>Access Token: {civicAuth.accessToken ? 'Present' : 'Not present'}</div>
            <div>ID Token: {civicAuth.idToken ? 'Present' : 'Not present'}</div>
          </div>
        </div>

        {/* Civic Auth Buttons */}
        <div className="text-center space-y-6">
          {verificationStatus === 'verified' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <User className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Signed in as: {user?.email || user?.sub || 'Verified User'}
                </span>
              </div>
              <UserButton className="civic-user-button" />
              <SignOutButton className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-medium transition-colors" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Civic Authentication
                </h4>
                <SignInButton className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md font-medium transition-colors" />
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Custom Identity Button
                </h4>
                <CivicIdentityButton className="civic-test-button" variant="primary" />
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            Testing Instructions
          </h4>
          <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <li>1. Click on one of the Civic authentication buttons above</li>
            <li>2. A popup window or iframe will open with the Civic authentication flow</li>
            <li>3. Complete the authentication process with your credentials</li>
            <li>4. Return to this page to see the updated authentication status</li>
            <li>5. The status should change from "unverified" to "pending" to "verified"</li>
            <li>6. Once verified, you can proceed to add heirs with enhanced security</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
