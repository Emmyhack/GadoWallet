import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { AnchorProvider, BN } from '@project-serum/anchor';
import { getProgramId } from '../lib/config';
import { AlertTriangle, Shield, Pause, Play, Settings, DollarSign, Users, Lock } from 'lucide-react';

interface EmergencyControlsProps {}

const EmergencyControls: React.FC<EmergencyControlsProps> = () => {
  const { publicKey } = useWallet();
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [platformPaused, setPlatformPaused] = useState(false);
  const [feePercentage, setFeePercentage] = useState(0.5);
  const [newFeePercentage, setNewFeePercentage] = useState(0.5);
  const [emergencyMode, setEmergencyMode] = useState(false);

  useEffect(() => {
    if (publicKey && anchorWallet) {
      checkAdminStatus();
    }
  }, [publicKey, anchorWallet]);

  const checkAdminStatus = async () => {
    try {
      const [platformPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("platform")],
        getProgramId()
      );

      const platformData = await connection.getAccountInfo(platformPda);
      if (platformData) {
        // Mock admin check - in real implementation, decode the account data
        // and check if the current wallet is the admin
        setIsAdmin(true);
        
        // Mock platform status
        setPlatformPaused(false);
        setFeePercentage(0.5);
        setNewFeePercentage(0.5);
        setEmergencyMode(false);
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
    }
  };

  const handlePausePlatform = async () => {
    if (!anchorWallet || !isAdmin) return;
    
    setLoading(true);
    try {
      // Mock pause functionality
      console.log("Pausing platform...");
      setPlatformPaused(true);
      
      // In real implementation, call the pause_platform instruction
      // const provider = new AnchorProvider(connection, anchorWallet, { commitment: 'confirmed' });
      // const program = new Program(IDL, getProgramId(), provider);
      // await program.methods.pausePlatform().rpc();
      
    } catch (error) {
      console.error("Error pausing platform:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResumePlatform = async () => {
    if (!anchorWallet || !isAdmin) return;
    
    setLoading(true);
    try {
      // Mock resume functionality
      console.log("Resuming platform...");
      setPlatformPaused(false);
      
      // In real implementation, call the resume_platform instruction
      
    } catch (error) {
      console.error("Error resuming platform:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFee = async () => {
    if (!anchorWallet || !isAdmin) return;
    
    setLoading(true);
    try {
      // Mock fee update
      console.log(`Updating fee to ${newFeePercentage}%`);
      setFeePercentage(newFeePercentage);
      
      // In real implementation, call the update_platform_fee instruction
      
    } catch (error) {
      console.error("Error updating fee:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyMode = async () => {
    if (!anchorWallet || !isAdmin) return;
    
    setLoading(true);
    try {
      // Mock emergency mode toggle
      console.log(`${emergencyMode ? 'Disabling' : 'Enabling'} emergency mode...`);
      setEmergencyMode(!emergencyMode);
      
      // In real implementation, call the toggle_emergency_mode instruction
      
    } catch (error) {
      console.error("Error toggling emergency mode:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawFees = async () => {
    if (!anchorWallet || !isAdmin) return;
    
    setLoading(true);
    try {
      // Mock fee withdrawal
      console.log("Withdrawing collected fees...");
      
      // In real implementation, call the withdraw_fees instruction
      
    } catch (error) {
      console.error("Error withdrawing fees:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Emergency Controls</h2>
          <p className="text-purple-200">Please connect your wallet to access admin controls</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-purple-200">You don't have administrator privileges to access these controls</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Emergency Controls</h1>
            <p className="text-purple-200">Platform administration and emergency functions</p>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                platformPaused ? 'bg-red-500/20' : 'bg-green-500/20'
              }`}>
                {platformPaused ? 
                  <Pause className="w-4 h-4 text-red-400" /> : 
                  <Play className="w-4 h-4 text-green-400" />
                }
              </div>
              <h3 className="text-lg font-semibold text-white">Platform Status</h3>
            </div>
            <div className={`text-2xl font-bold ${
              platformPaused ? 'text-red-400' : 'text-green-400'
            }`}>
              {platformPaused ? 'PAUSED' : 'ACTIVE'}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                emergencyMode ? 'bg-orange-500/20' : 'bg-blue-500/20'
              }`}>
                <Shield className={`w-4 h-4 ${emergencyMode ? 'text-orange-400' : 'text-blue-400'}`} />
              </div>
              <h3 className="text-lg font-semibold text-white">Emergency Mode</h3>
            </div>
            <div className={`text-2xl font-bold ${
              emergencyMode ? 'text-orange-400' : 'text-blue-400'
            }`}>
              {emergencyMode ? 'ENABLED' : 'DISABLED'}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Platform Fee</h3>
            </div>
            <div className="text-2xl font-bold text-purple-400">
              {feePercentage}%
            </div>
          </div>
        </div>

        {/* Control Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Platform Controls */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Platform Controls
            </h3>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <button
                  onClick={handlePausePlatform}
                  disabled={loading || platformPaused}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Pause className="w-4 h-4" />
                  Pause Platform
                </button>
                
                <button
                  onClick={handleResumePlatform}
                  disabled={loading || !platformPaused}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Resume Platform
                </button>
              </div>

              <button
                onClick={handleEmergencyMode}
                disabled={loading}
                className={`w-full font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 ${
                  emergencyMode
                    ? 'bg-orange-600 hover:bg-orange-700 text-white'
                    : 'bg-orange-600/20 hover:bg-orange-600/30 text-orange-400'
                }`}
              >
                <Shield className="w-4 h-4" />
                {emergencyMode ? 'Disable Emergency Mode' : 'Enable Emergency Mode'}
              </button>
            </div>
          </div>

          {/* Fee Management */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Fee Management
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Platform Fee Percentage
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={newFeePercentage}
                    onChange={(e) => setNewFeePercentage(parseFloat(e.target.value))}
                    className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="0.5"
                  />
                  <span className="flex items-center text-purple-200 font-medium">%</span>
                </div>
              </div>

              <button
                onClick={handleUpdateFee}
                disabled={loading || newFeePercentage === feePercentage}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all"
              >
                Update Fee Percentage
              </button>

              <button
                onClick={handleWithdrawFees}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <DollarSign className="w-4 h-4" />
                Withdraw Collected Fees
              </button>
            </div>
          </div>
        </div>

        {/* Warning Notice */}
        <div className="mt-8 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-lg font-semibold text-yellow-400 mb-2">Important Notice</h4>
              <p className="text-yellow-200 leading-relaxed">
                These are emergency controls that should only be used in critical situations. 
                Pausing the platform will prevent all inheritance executions and new Smart Wallet creations. 
                Emergency mode enables additional security restrictions. Always communicate with users 
                before making changes that affect platform functionality.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyControls;