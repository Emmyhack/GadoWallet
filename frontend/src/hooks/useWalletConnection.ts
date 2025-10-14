import { useState, useEffect, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { toast } from 'react-hot-toast';
import { Gado } from '../lib/types/gado';
import IDL from '../lib/idl/gado.json';
import { getProgramId, getRpcUrl } from '../lib/config';
import { handleError, WalletConnectionError, WalletAdapter } from '../types';

// Alternative RPC endpoints for reliability
const RPC_ENDPOINTS = [
  getRpcUrl(),
  'https://api.devnet.solana.com',
  'https://devnet.helius-rpc.com/?api-key=7c128dba-91b3-4bc8-a111-6dd41c07bc55',
  'https://api.devnet.solana.com',
];

interface WalletState {
  connected: boolean;
  connecting: boolean;
  program: Program<Gado> | null;
  connection: Connection;
  provider: AnchorProvider | null;
  programId: PublicKey;
  rpcEndpoint: string;
  rpcIndex: number;
}

export function useWalletConnection() {
  const { publicKey, wallet, connected, connecting } = useWallet();
  const [state, setState] = useState<WalletState>({
    connected: false,
    connecting: false,
    program: null,
    connection: new Connection(RPC_ENDPOINTS[0]!, 'confirmed'),
    provider: null,
    programId: getProgramId(),
    rpcEndpoint: RPC_ENDPOINTS[0]!,
    rpcIndex: 0,
  });

  // Switch to next RPC endpoint
  const switchRpcEndpoint = useCallback(() => {
    const nextIndex = (state.rpcIndex + 1) % RPC_ENDPOINTS.length;
    const newEndpoint = RPC_ENDPOINTS[nextIndex]!;
    const newConnection = new Connection(newEndpoint, 'confirmed');
    
    setState(prev => ({
      ...prev,
      connection: newConnection,
      rpcEndpoint: newEndpoint,
      rpcIndex: nextIndex,
      provider: null,
      program: null,
    }));

    // console.log(`🔄 Switched to RPC endpoint: ${newEndpoint}`);
    toast.success(`Switched to ${newEndpoint?.includes('helius') ? 'Helius' : newEndpoint?.includes('alchemy') ? 'Alchemy' : 'Default'} RPC`);
    
    return newConnection;
  }, [state.rpcIndex]);

  // Test current RPC connection
  const testRpcConnection = useCallback(async () => {
    try {
      const start = Date.now();
      const { blockhash } = await state.connection.getLatestBlockhash('confirmed');
      const duration = Date.now() - start;
      
      const rpcName = state.rpcEndpoint.includes('helius') ? 'Helius' : 
                      state.rpcEndpoint.includes('alchemy') ? 'Alchemy' : 
                      'Default Solana';
      
      toast.success(`✅ ${rpcName} RPC: ${duration}ms`);
      return { success: true, duration, blockhash };
    } catch (error) {
      const walletError = handleError(error, 'RPC Connection Test');
      toast.error(`❌ RPC Error: ${walletError.message}`);
      return { success: false, error: walletError };
    }
  }, [state.connection, state.rpcEndpoint]);

  // Initialize program with retry logic
  const initializeProgram = useCallback(async (retryCount = 0): Promise<void> => {
    if (!wallet || !publicKey || !connected) {
      setState(prev => ({ 
        ...prev, 
        program: null, 
        provider: null, 
        connected: false 
      }));
      return;
    }

    try {
      // console.log(`🔄 Initializing program (attempt ${retryCount + 1})`);
      
      const provider = new AnchorProvider(
        state.connection,
        wallet.adapter as any,
        { 
          commitment: 'confirmed',
          preflightCommitment: 'confirmed',
          skipPreflight: false
        }
      );

      const program = new Program(IDL as any, provider) as Program<Gado>;

      // Test program by fetching a simple account (platform config)
      const [platformConfigPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("platform_config")],
        state.programId
      );

      // Just test if we can query the account (don't fail if it doesn't exist)
      try {
        await state.connection.getAccountInfo(platformConfigPDA);
        // console.log(`✅ Program initialized successfully with ${state.rpcEndpoint}`);
      } catch (testError) {
        // console.log(`⚠️ Platform not initialized yet, but program connection works`);
      }

      setState(prev => ({
        ...prev,
        program,
        provider,
        connected: true,
        connecting: false,
      }));

      toast.success('Wallet connected successfully!');

    } catch (error) {
      const connectionError = handleError(error, 'Program Initialization');
      console.error(`Failed to initialize program (attempt ${retryCount + 1}):`, connectionError);

      // If it's a network error and we have more RPC endpoints to try
      if (retryCount < 2 && (
        connectionError.message?.includes('fetch') ||
        connectionError.message?.includes('network') ||
        connectionError.message?.includes('timeout') ||
        connectionError.message?.includes('503') ||
        connectionError.message?.includes('502')
      )) {
        // console.log(`🔄 Trying next RPC endpoint...`);
        switchRpcEndpoint();
        
        // Retry with new endpoint after a short delay
        setTimeout(() => {
          initializeProgram(retryCount + 1);
        }, 1000);
      } else {
        setState(prev => ({ 
          ...prev, 
          program: null, 
          provider: null, 
          connected: false, 
          connecting: false 
        }));
        toast.error(`Failed to connect: ${connectionError.message}`);
      }
    }
  }, [wallet, publicKey, connected, state.connection, state.programId, switchRpcEndpoint]);

  // Initialize program when wallet connects or connection changes
  useEffect(() => {
    if (connected && wallet && publicKey) {
      setState(prev => ({ ...prev, connecting: true }));
      initializeProgram();
    } else if (!connected) {
      setState(prev => ({ 
        ...prev, 
        program: null, 
        provider: null, 
        connected: false, 
        connecting: false 
      }));
    }
  }, [connected, wallet, publicKey, state.connection, initializeProgram]);

  // Enhanced transaction execution with retry logic
  const executeTransaction = useCallback(async <T>(
    transactionBuilder: () => Promise<T>,
    options: {
      description?: string;
      maxRetries?: number;
      retryDelay?: number;
    } = {}
  ): Promise<T> => {
    const { description = 'transaction', maxRetries = 3, retryDelay = 2000 } = options;
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // console.log(`🔄 Executing ${description} (attempt ${attempt}/${maxRetries})`);
        
        // Test connection health before transaction
        const health = await testRpcConnection();
        if (!health.success && attempt < maxRetries) {
          switchRpcEndpoint();
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }

        const result = await transactionBuilder();
        // console.log(`✅ ${description} completed successfully`);
        return result;

      } catch (error) {
        lastError = handleError(error, description);
        console.error(`❌ ${description} failed (attempt ${attempt}):`, lastError);

        const isRetryable = (
          lastError.message?.includes('Blockhash') ||
          lastError.message?.includes('blockhash') ||
          lastError.message?.includes('invalid') ||
          lastError.message?.includes('expired') ||
          lastError.message?.includes('timeout') ||
          lastError.message?.includes('network') ||
          lastError.message?.includes('503') ||
          lastError.message?.includes('502') ||
          lastError.message?.includes('429')
        );

        if (isRetryable && attempt < maxRetries) {
          // Switch RPC on every second retry
          if (attempt % 2 === 0) {
            switchRpcEndpoint();
            // Re-initialize program with new connection
            await initializeProgram();
          }

          const delay = Math.min(retryDelay * attempt, 8000);
          // console.log(`⏳ Retrying ${description} in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        // If not retryable or last attempt, throw the error
        break;
      }
    }

    throw lastError || new Error(`${description} failed after ${maxRetries} attempts`);
  }, [testRpcConnection, switchRpcEndpoint, initializeProgram]);

  return {
    // Wallet state
    publicKey,
    connected: state.connected,
    connecting: state.connecting || connecting,
    program: state.program,
    connection: state.connection,
    provider: state.provider,
    programId: state.programId,

    // RPC management
    rpcEndpoint: state.rpcEndpoint,
    rpcIndex: state.rpcIndex,
    switchRpcEndpoint,
    testRpcConnection,

    // Enhanced transaction execution
    executeTransaction,

    // Manual re-initialization
    reinitialize: () => initializeProgram(),
  };
}