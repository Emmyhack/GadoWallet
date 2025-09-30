import React, { useState, useEffect } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { checkProgramDeployment } from '../lib/programCheck';
import { AlertTriangle, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react';

const ProgramStatus: React.FC = () => {
  const { connection } = useConnection();
  const [isDeployed, setIsDeployed] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkStatus = async () => {
    if (!connection) return;
    
    setIsChecking(true);
    try {
      const deployed = await checkProgramDeployment(connection);
      setIsDeployed(deployed);
      setLastCheck(new Date());
    } catch (error) {
      console.error('Failed to check program status:', error);
      setIsDeployed(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, [connection]);

  if (isDeployed === null) {
    return null; // Still checking initially
  }

  if (isDeployed) {
    return (
      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2 text-green-400">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium text-white">Program Ready</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-medium text-white mb-2">
            Smart Contract Not Deployed
          </h3>
          <p className="text-white/80 text-sm mb-3">
            The Gado inheritance program is not deployed to this network. 
            You'll need to deploy it before you can add heirs or manage inheritance.
          </p>
          
          <div className="space-y-2 text-sm">
            <div className="bg-white/5 rounded p-3">
              <p className="font-medium text-white mb-2">Quick Fix Options:</p>
              <ol className="list-decimal list-inside space-y-1 text-white/80">
                <li>
                  <strong>Use Localnet:</strong> Run <code className="bg-white/10 px-1 rounded">solana-test-validator</code> 
                  and switch to localnet in wallet settings
                </li>
                <li>
                  <strong>Deploy to Devnet:</strong> Run deployment commands from the project root
                </li>
                <li>
                  <strong>Use Different Network:</strong> Switch to a network where the program is deployed
                </li>
              </ol>
            </div>
            
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={checkStatus}
                disabled={isChecking}
                className="flex items-center gap-1 px-3 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
                {isChecking ? 'Checking...' : 'Recheck Status'}
              </button>
              
              <a
                href="https://github.com/Emmyhack/GadoWallet/blob/main/gado/DEPLOYMENT_GUIDE.md"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
              >
                <ExternalLink className="w-3 h-3" />
                Deployment Guide
              </a>
            </div>
          </div>
          
          {lastCheck && (
            <p className="text-xs text-white/60 mt-2">
              Last checked: {lastCheck.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgramStatus;