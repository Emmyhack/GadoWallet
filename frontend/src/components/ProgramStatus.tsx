import React, { useState, useEffect } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { PROGRAM_ID } from '../lib/publickey-utils';
import { AlertTriangle, CheckCircle, Info, ExternalLink } from 'lucide-react';

export function ProgramStatus() {
  const { connection } = useConnection();
  const [programExists, setProgramExists] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkProgramDeployment = async () => {
      try {
        setLoading(true);
        const accountInfo = await connection.getAccountInfo(PROGRAM_ID);
        setProgramExists(accountInfo !== null && accountInfo.executable);
      } catch (error) {
        console.error('Error checking program deployment:', error);
        setProgramExists(false);
      } finally {
        setLoading(false);
      }
    };

    checkProgramDeployment();
  }, [connection]);

  if (loading) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mt-0.5"></div>
          <div>
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Checking Program Status...
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Verifying if the Gado program is deployed on the network.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (programExists === false) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              Program Not Deployed
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              The Gado program is not deployed on Devnet. Heir functionality will not work until the program is deployed.
            </p>
            <div className="mt-3 space-y-2">
              <div className="text-xs text-red-600 dark:text-red-400">
                <strong>Program ID:</strong> {PROGRAM_ID.toBase58()}
              </div>
              <div className="text-xs text-red-600 dark:text-red-400">
                <strong>Network:</strong> Devnet
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <a
                  href={`https://explorer.solana.com/address/${PROGRAM_ID.toBase58()}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 underline"
                >
                  <span>View on Solana Explorer</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (programExists === true) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
              Program Deployed Successfully
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              The Gado program is deployed and ready to use on Devnet.
            </p>
            <div className="mt-2 text-xs text-green-600 dark:text-green-400">
              <strong>Program ID:</strong> {PROGRAM_ID.toBase58()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
      <div className="flex items-start space-x-3">
        <Info className="w-5 h-5 text-gray-500 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">
            Program Status Unknown
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Unable to determine program deployment status. Please try refreshing the page.
          </p>
        </div>
      </div>
    </div>
  );
}