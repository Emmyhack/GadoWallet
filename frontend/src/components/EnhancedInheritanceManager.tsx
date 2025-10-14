import React, { useState } from 'react';
import { Shield, Plus, Coins, Mail, Eye, CheckCircle2, AlertCircle, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useInheritanceManager, type HeirData } from '../hooks/useInheritanceManager';
import { usePlatformSetup } from '../hooks/usePlatformSetup';
import { useWalletConnection } from '../hooks/useWalletConnection';

export function EnhancedInheritanceManager() {
  const { t } = useTranslation();
  const { 
    addSolHeir, 
    addTokenHeir, 
    isLoading: isHeirLoading, 
    checkHeirExists,
    validateHeirData 
  } = useInheritanceManager();
  
  const { 
    isReady,
    needsPlatformInit, 
    needsUserProfile,
    initializePlatform,
    createUserProfile,
    isInitializing,
    isCreatingProfile 
  } = usePlatformSetup();
  
  const { 
    publicKey, 
    connected, 
    rpcEndpoint, 
    switchRpcEndpoint, 
    testRpcConnection 
  } = useWalletConnection();

  // Form state
  const [activeTab, setActiveTab] = useState<'sol' | 'token'>('sol');
  const [heirData, setHeirData] = useState<HeirData>({
    address: '',
    amount: '',
    tokenMint: '',
    inactivityDays: '2',
    email: '',
    name: '',
    personalMessage: ''
  });
  
  const [sendEmailNotification, setSendEmailNotification] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  // Real-time validation
  const validateField = (field: keyof HeirData, value: string) => {
    const tempData = { ...heirData, [field]: value };
    const error = validateHeirData(tempData, activeTab);
    
    setValidationErrors(prev => ({
      ...prev,
      [field]: error || ''
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setValidationErrors({});

    if (!connected) {
      setValidationErrors({ general: 'Please connect your wallet first.' });
      return;
    }

    if (!isReady) {
      setValidationErrors({ general: 'Platform setup required. Please complete setup first.' });
      return;
    }

    // Final validation
    const validationError = validateHeirData(heirData, activeTab);
    if (validationError) {
      setValidationErrors({ general: validationError });
      return;
    }

    // Check if heir already exists
    const exists = await checkHeirExists(heirData.address, activeTab === 'token' ? heirData.tokenMint : undefined);
    if (exists) {
      setValidationErrors({ address: 'An heir with these details already exists.' });
      return;
    }

    // Submit based on type
    let success = false;
    if (activeTab === 'sol') {
      success = await addSolHeir(heirData);
    } else {
      success = await addTokenHeir(heirData);
    }

    if (success) {
      // Reset form
      setHeirData({
        address: '',
        amount: '',
        tokenMint: '',
        inactivityDays: '2',
        email: '',
        name: '',
        personalMessage: ''
      });
      setSuccessMessage(`${activeTab.toUpperCase()} heir added successfully!`);
    }
  };

  // Render wallet connection prompt
  if (!connected) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Basic Inheritance Management</h2>
          <p className="text-gray-300 mb-6">Connect your wallet to start managing inheritance</p>
          <div className="text-sm text-gray-400">
            Make sure you're on Solana Devnet for testing
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <Shield className="w-12 h-12 text-blue-400 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-white mb-2">Basic Inheritance Management</h1>
        <p className="text-gray-300">Set up inheritance for your digital assets</p>
      </div>

      {/* Connection Status */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-white">
              {connected ? `Connected: ${publicKey?.toString().slice(0, 8)}...` : 'Not Connected'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={testRpcConnection}
              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded"
            >
              Test Network
            </button>
            <button
              onClick={switchRpcEndpoint}
              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Switch RPC
            </button>
            <span className="text-gray-400">
              {rpcEndpoint.includes('helius') ? 'Helius' : 
               rpcEndpoint.includes('alchemy') ? 'Alchemy' : 
               'Default'}
            </span>
          </div>
        </div>
      </div>

      {/* Platform Setup Status */}
      {needsPlatformInit && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-yellow-300 font-semibold mb-2">Platform Initialization Required</h3>
              <p className="text-yellow-200 text-sm mb-4">
                The platform needs to be initialized before you can create inheritance plans.
              </p>
              <button
                onClick={initializePlatform}
                disabled={isInitializing}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-800 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
              >
                {isInitializing ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Initialize Platform
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {needsUserProfile && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-blue-300 font-semibold mb-2">User Profile Required</h3>
              <p className="text-blue-200 text-sm mb-4">
                Create your user profile to start adding heirs and managing inheritance.
              </p>
              <button
                onClick={() => createUserProfile(false)}
                disabled={isCreatingProfile}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
              >
                {isCreatingProfile ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create User Profile
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span className="text-green-300">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Main Form */}
      {isReady && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          {/* Tab Selection */}
          <div className="flex mb-6">
            <button
              onClick={() => setActiveTab('sol')}
              className={`flex-1 py-3 px-4 rounded-l-lg font-medium transition-colors ${
                activeTab === 'sol'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Coins className="w-5 h-5 inline mr-2" />
              SOL Inheritance
            </button>
            <button
              onClick={() => setActiveTab('token')}
              className={`flex-1 py-3 px-4 rounded-r-lg font-medium transition-colors ${
                activeTab === 'token'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Coins className="w-5 h-5 inline mr-2" />
              Token Inheritance
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Heir Address */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Heir Wallet Address *
              </label>
              <input
                type="text"
                value={heirData.address}
                onChange={(e) => {
                  setHeirData(prev => ({ ...prev, address: e.target.value }));
                  validateField('address', e.target.value);
                }}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Enter heir's Solana wallet address"
                required
              />
              {validationErrors['address'] && (
                <p className="mt-1 text-sm text-red-400">{validationErrors['address']}</p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount ({activeTab === 'sol' ? 'SOL' : 'Tokens'}) *
              </label>
              <input
                type="number"
                step={activeTab === 'sol' ? '0.01' : '1'}
                min="0"
                value={heirData.amount}
                onChange={(e) => {
                  setHeirData(prev => ({ ...prev, amount: e.target.value }));
                  validateField('amount', e.target.value);
                }}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder={`Amount to inherit (${activeTab === 'sol' ? 'SOL' : 'tokens'})`}
                required
              />
              {validationErrors['amount'] && (
                <p className="mt-1 text-sm text-red-400">{validationErrors['amount']}</p>
              )}
            </div>

            {/* Token Mint (only for tokens) */}
            {activeTab === 'token' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Token Mint Address *
                </label>
                <input
                  type="text"
                  value={heirData.tokenMint}
                  onChange={(e) => {
                    setHeirData(prev => ({ ...prev, tokenMint: e.target.value }));
                    validateField('tokenMint', e.target.value);
                  }}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Token mint address"
                  required
                />
                {validationErrors['tokenMint'] && (
                  <p className="mt-1 text-sm text-red-400">{validationErrors['tokenMint']}</p>
                )}
              </div>
            )}

            {/* Inactivity Period */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Inactivity Period (Days) *
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={heirData.inactivityDays}
                onChange={(e) => {
                  setHeirData(prev => ({ ...prev, inactivityDays: e.target.value }));
                  validateField('inactivityDays', e.target.value);
                }}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Days of inactivity before inheritance activates"
                required
              />
              {validationErrors['inactivityDays'] && (
                <p className="mt-1 text-sm text-red-400">{validationErrors['inactivityDays']}</p>
              )}
              <p className="mt-1 text-sm text-gray-400">
                Minimum 1 day. After this period of inactivity, the heir can claim the inheritance.
              </p>
            </div>

            {/* General Errors */}
            {validationErrors['general'] && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <span className="text-red-400">{validationErrors['general']}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isHeirLoading || !isReady}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isHeirLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Adding Heir...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Add {activeTab === 'sol' ? 'SOL' : 'Token'} Heir
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Information Panel */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
        <h3 className="text-blue-300 font-semibold mb-3">How It Works</h3>
        <ul className="space-y-2 text-blue-200 text-sm">
          <li>• Set up inheritance for specific amounts of SOL or tokens</li>
          <li>• Define an inactivity period (minimum 1 day)</li>
          <li>• If you don't interact with your wallet for that period, heirs can claim</li>
          <li>• Multiple heirs can be set up for different assets</li>
          <li>• All inheritance data is stored securely on the Solana blockchain</li>
        </ul>
      </div>
    </div>
  );
}