import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Wifi, RefreshCw, Zap } from 'lucide-react';
import { getCluster, getRpcUrl } from '../lib/config';

export function WalletConnectionStatus() {
  const { wallet, connected, connecting, publicKey, wallets } = useWallet();
  const { connection } = useConnection();
  const [rpcWorking, setRpcWorking] = useState<boolean | null>(null);
  const [walletExtensions, setWalletExtensions] = useState({
    phantom: false,
    solflare: false,
    backpack: false
  });

  useEffect(() => {
    // Check RPC connection
    const checkRpc = async () => {
      try {
        await connection.getSlot();
        setRpcWorking(true);
      } catch (error) {
        setRpcWorking(false);
      }
    };

    // Check wallet extensions
    const checkExtensions = () => {
      setWalletExtensions({
        phantom: typeof (window as any).phantom !== 'undefined',
        solflare: typeof (window as any).solflare !== 'undefined',
        backpack: typeof (window as any).backpack !== 'undefined'
      });
    };

    checkRpc();
    checkExtensions();
  }, [connection]);

  const StatusIcon = ({ condition }: { condition: boolean | null }) => {
    if (condition === null) return <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" />;
    return condition ? 
      <CheckCircle className="w-4 h-4 text-green-500" /> : 
      <AlertCircle className="w-4 h-4 text-red-500" />;
  };

  const hasAnyWallet = walletExtensions.phantom || walletExtensions.solflare || walletExtensions.backpack;

  if (connected) {
    return (
      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 text-green-400 mb-2">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Wallet Connected Successfully</span>
        </div>
        <div className="text-sm text-green-300 mb-2">
          Connected to {wallet?.adapter.name} - {publicKey?.toString().slice(0, 8)}...
        </div>
        <div className="flex items-center gap-2 text-blue-300 text-sm">
          <Zap className="w-4 h-4" />
          <span className="font-medium">REAL TRANSACTION MODE</span>
          <span>•</span>
          <span>Network: {getCluster().toUpperCase()}</span>
        </div>
        <div className="text-xs text-gray-400 mt-1">
          All transactions will be sent to the Solana blockchain. Not simulations.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Wifi className="w-5 h-5" />
        Wallet Connection Status
      </h3>

      <div className="space-y-3 text-sm">
        {/* Network Mode Info */}
        <div className="flex items-center gap-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded">
          <Zap className="w-4 h-4 text-blue-400" />
          <span className="text-blue-300 font-medium">REAL TRANSACTION MODE - {getCluster().toUpperCase()}</span>
        </div>

        {/* RPC Connection */}
        <div className="flex items-center gap-2">
          <StatusIcon condition={rpcWorking} />
          <span className="text-gray-300">
            Solana Network: {rpcWorking ? 'Connected' : rpcWorking === false ? 'Failed' : 'Checking...'}
          </span>
        </div>

        {/* Wallet Extensions */}
        <div className="flex items-center gap-2">
          <StatusIcon condition={hasAnyWallet} />
          <span className="text-gray-300">
            Wallet Extensions: {hasAnyWallet ? 'Detected' : 'Not Found'}
          </span>
        </div>

        {/* Available Wallets */}
        <div className="flex items-center gap-2">
          <StatusIcon condition={wallets.length > 0} />
          <span className="text-gray-300">
            Available Wallets: {wallets.length}
          </span>
        </div>

        {/* Connection Status */}
        {connecting && (
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
            <span className="text-blue-300">Connecting to wallet...</span>
          </div>
        )}
      </div>

      {/* Troubleshooting Hints */}
      {!hasAnyWallet && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded">
          <div className="text-red-300 text-sm">
            <strong>No wallet extensions found!</strong>
            <div className="mt-2 space-y-1">
              <div>• Install <a href="https://phantom.app/" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200 underline">Phantom Wallet</a></div>
              <div>• Or install <a href="https://solflare.com/" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200 underline">Solflare Wallet</a></div>
              <div>• Refresh the page after installation</div>
            </div>
          </div>
        </div>
      )}

      {hasAnyWallet && !connected && !connecting && (
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded">
          <div className="text-blue-300 text-sm">
            <strong>Wallet detected but not connected</strong>
            <div className="mt-2">
              Click the "Select Wallet" button above to connect your wallet
            </div>
          </div>
        </div>
      )}

      {rpcWorking === false && (
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
          <div className="text-yellow-300 text-sm">
            <strong>Network connection issue</strong>
            <div className="mt-2">
              Check your internet connection and try refreshing the page
            </div>
          </div>
        </div>
      )}
    </div>
  );
}