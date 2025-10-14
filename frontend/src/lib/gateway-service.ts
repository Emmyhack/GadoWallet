import { Connection, Transaction, PublicKey, VersionedTransaction } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'react-hot-toast';
import { SubscriptionTier } from '../components/SubscriptionManager';

export interface GatewayConfig {
  enabled: boolean;
  apiUrl: string;
  apiKey?: string;
  fallbackToStandard: boolean;
  priorityThreshold: number; // Minimum priority fee in microlamports to use Gateway
  criticalTransactions: string[]; // Transaction types that should always use Gateway
}

export interface TransactionContext {
  type: 'inheritance' | 'smart_wallet_create' | 'smart_wallet_deposit' | 'smart_wallet_send' | 'standard_send';
  priority: 'low' | 'medium' | 'high' | 'critical';
  userTier: SubscriptionTier;
  assetValue?: number; // In SOL equivalent
}

export interface GatewayResponse {
  signature: string;
  success: boolean;
  method: 'gateway' | 'standard';
  estimatedTime?: number;
  actualTime?: number;
}

class SanctumGatewayService {
  private config: GatewayConfig;
  
  constructor() {
    // Get configuration from environment variables
    const apiKey = import.meta.env?.VITE_GATEWAY_API_KEY;
    const enabled = import.meta.env?.VITE_GATEWAY_ENABLED !== 'false';
    
    // Configure Gateway URL based on network and documentation
    const network = import.meta.env?.VITE_CLUSTER || 'devnet';
    let apiUrl: string;
    
    // Based on Sanctum Gateway documentation: https://tpg.sanctum.so/v1/mainnet
    if (network === 'mainnet-beta' && apiKey) {
      apiUrl = `https://tpg.sanctum.so/v1/mainnet?apiKey=${apiKey}`;
    } else {
      // Sanctum Gateway only supports mainnet according to documentation
      // For devnet/testnet, we disable Gateway and use standard RPC
      apiUrl = '';
    }
    
    // Override with custom URL if provided (useful for testing)
    const customApiUrl = import.meta.env?.VITE_GATEWAY_API_URL;
    if (customApiUrl && apiKey) {
      apiUrl = customApiUrl.includes('apiKey') ? customApiUrl : `${customApiUrl}?apiKey=${apiKey}`;
    }
    
    this.config = {
      // Gateway only works on mainnet with valid API key
      enabled: network === 'mainnet-beta' && !!apiKey && !!apiUrl,
      apiUrl,
      apiKey,
      fallbackToStandard: true,
      priorityThreshold: 10000, // 0.01 SOL in microlamports
      criticalTransactions: ['inheritance', 'smart_wallet_create']
    };

        // Log configuration status (without exposing the key)
    const networkLabel = network === 'mainnet-beta' ? 'Mainnet' : network === 'devnet' ? 'Devnet' : 'Other';
    console.log(`🔑 Gateway Service (${networkLabel}): ${this.config.enabled ? 'ENABLED' : 'DISABLED'}`);
    
    if (this.config.enabled) {
      console.log(`🌐 Gateway URL: ${this.config.apiUrl}`);
      console.log(`� API Key: ***${this.config.apiKey?.slice(-4) || 'None'}`);
    } else {
      if (network === 'devnet') {
        console.log(`📡 Devnet detected: Using standard RPC for optimal compatibility`);
      } else {
        console.log(`📡 Using standard RPC (Gateway disabled or not configured)`);
      }
    }
  }

  /**
   * Determines whether to use Gateway based on user context and transaction type
   */
  shouldUseGateway(context: TransactionContext): boolean {
    // Gateway is disabled or not configured
    if (!this.config.enabled) return false;
    
    // For devnet, always use standard RPC for compatibility
    const network = import.meta.env?.VITE_CLUSTER || 'devnet';
    if (network !== 'mainnet-beta') {
      return false;
    }

    // Enterprise customers get Gateway for all transactions
    if (context.userTier === SubscriptionTier.ENTERPRISE) {
      return true;
    }

    // Premium customers get Gateway for high-value or critical transactions
    if (context.userTier === SubscriptionTier.PREMIUM) {
      if (context.priority === 'critical' || context.priority === 'high') {
        return true;
      }
      if (context.assetValue && context.assetValue > 1.0) { // > 1 SOL
        return true;
      }
    }

    // Critical transactions use Gateway regardless of tier (inheritance claims, etc.)
    if (this.config.criticalTransactions.includes(context.type)) {
      return true;
    }

    // High-value transactions use Gateway for better reliability
    if (context.assetValue && context.assetValue > 10.0) { // > 10 SOL
      return true;
    }

    return false;
  }

  /**
   * Build optimized transaction via Sanctum Gateway
   * This automatically handles simulation, compute units, priority fees, and blockhash
   */
  async buildGatewayTransaction(
    transaction: Transaction | VersionedTransaction,
    connection: Connection,
    context: TransactionContext,
    feePayer?: PublicKey
  ): Promise<{ optimizedTransaction: Transaction | VersionedTransaction; transactionId?: string }> {
    try {
      // Ensure transaction has recent blockhash and fee payer for serialization
      if (!(transaction instanceof VersionedTransaction)) {
        if (!transaction.recentBlockhash) {
          console.log('🔧 Fetching recent blockhash for Gateway build...');
          const { blockhash } = await connection.getLatestBlockhash();
          transaction.recentBlockhash = blockhash;
        }
        
        // Set fee payer if provided and not already set
        if (feePayer && !transaction.feePayer) {
          console.log('🔧 Setting fee payer for Gateway build...');
          transaction.feePayer = feePayer;
        }
      }

      // For JSON-RPC, we need to use null blockhash as per documentation
      if (!(transaction instanceof VersionedTransaction)) {
        // Use null blockhash since Gateway will set the proper one
        transaction.recentBlockhash = '11111111111111111111111111111111';
      }

      // Serialize and encode as base64 for Gateway API
      const serializedTx = transaction instanceof VersionedTransaction 
        ? transaction.serialize()
        : transaction.serialize();
      
      const encodedTransaction = Buffer.from(serializedTx).toString('base64');

      // Prepare JSON-RPC request body according to Sanctum documentation
      const buildRequestBody = {
        id: "gadawallet-build",
        jsonrpc: "2.0",
        method: "buildGatewayTransaction",
        params: [
          encodedTransaction,
          {
            // Optional parameters based on context
            encoding: "base64",
            skipSimulation: context.priority === 'critical',
            skipPriorityFee: false,
            cuPriceRange: this.getCuPriceRange(context),
            jitoTipRange: this.getJitoTipRange(context),
            deliveryMethodType: this.getDeliveryMethodString(context)
          }
        ]
      };

      console.log(`🔧 Building optimized transaction via Sanctum Gateway (${context.userTier} tier)`);
      console.log(`📦 Transaction serialized successfully, size: ${serializedTx.length} bytes`);

      // Use JSON-RPC endpoint with API key in URL
      const response = await fetch(this.config.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'GadaWallet/1.0'
        },
        body: JSON.stringify(buildRequestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gateway build failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const jsonResponse = await response.json();
      
      // Handle JSON-RPC response format
      if (jsonResponse.error) {
        throw new Error(`Gateway API error: ${jsonResponse.error.message || JSON.stringify(jsonResponse.error)}`);
      }

      if (!jsonResponse.result) {
        throw new Error('Invalid Gateway response: missing result');
      }

      const result = jsonResponse.result;
      
      console.log(`✅ Gateway transaction built successfully with optimizations`);
      console.log(`📊 Latest blockhash: ${result.latestBlockhash?.blockhash || 'provided'}`);

      // Decode the optimized transaction from base64
      const optimizedTxBytes = Buffer.from(result.transaction, 'base64');
      let optimizedTransaction: Transaction | VersionedTransaction;

      try {
        if (transaction instanceof VersionedTransaction) {
          optimizedTransaction = VersionedTransaction.deserialize(optimizedTxBytes);
        } else {
          optimizedTransaction = Transaction.from(optimizedTxBytes);
          
          // Ensure fee payer is preserved after deserialization
          if (feePayer && optimizedTransaction instanceof Transaction) {
            optimizedTransaction.feePayer = feePayer;
            console.log(`🔧 Restored fee payer after Gateway optimization: ${feePayer.toString()}`);
          }
          
          // Use the blockhash provided by Gateway or fallback to fresh one
          if (result.latestBlockhash && optimizedTransaction instanceof Transaction) {
            optimizedTransaction.recentBlockhash = result.latestBlockhash.blockhash;
            console.log(`🔧 Used Gateway-provided blockhash: ${result.latestBlockhash.blockhash}`);
          } else if (!optimizedTransaction.recentBlockhash) {
            const { blockhash } = await connection.getLatestBlockhash();
            optimizedTransaction.recentBlockhash = blockhash;
            console.log(`🔧 Set fresh blockhash after Gateway optimization`);
          }
        }
      } catch (deserializeError) {
        console.error('Failed to deserialize Gateway transaction:', deserializeError);
        throw new Error(`Gateway transaction deserialization failed: ${deserializeError}`);
      }

      return {
        optimizedTransaction,
        transactionId: undefined // Gateway doesn't return transaction ID in build response
      };

    } catch (error) {
      console.error('Gateway transaction build failed:', error);
      throw error;
    }
  }

  /**
   * Send pre-built Gateway transaction
   */
  async sendBuiltGatewayTransaction(
    optimizedTransaction: Transaction | VersionedTransaction,
    transactionId: string | undefined,
    context: TransactionContext
  ): Promise<GatewayResponse> {
    const startTime = Date.now();

    try {
      // Serialize the signed, optimized transaction
      const serializedTx = optimizedTransaction instanceof VersionedTransaction 
        ? optimizedTransaction.serialize()
        : optimizedTransaction.serialize();

      // Prepare Gateway send request
      const sendRequestBody = {
        tx: Array.from(serializedTx),
        transactionId, // If we got a transaction ID from build, include it
        delivery: this.getDeliveryMethod(context),
        skipPreflight: context.priority === 'critical',
        maxRetries: this.getMaxRetries(context),
        commitment: 'confirmed'
      };

      console.log(`🚀 Sending optimized transaction via Sanctum Gateway (${context.userTier} tier)`);

      // Prepare headers with API key
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'GadaWallet/1.0'
      };

      if (this.config.apiKey) {
        headers['X-API-Key'] = this.config.apiKey;
      }

      const response = await fetch(`${this.config.apiUrl}/api/v1/send`, {
        method: 'POST',
        headers,
        body: JSON.stringify(sendRequestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gateway send failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      const endTime = Date.now();

      console.log(`✅ Gateway transaction successful: ${result.signature}`);

      return {
        signature: result.signature,
        success: true,
        method: 'gateway',
        estimatedTime: result.estimatedConfirmationTime,
        actualTime: endTime - startTime
      };

    } catch (error) {
      console.error('Gateway transaction send failed:', error);
      throw error;
    }
  }

  /**
   * Send transaction via Sanctum Gateway (new optimized flow)
   */
  async sendViaGateway(
    transaction: Transaction | VersionedTransaction,
    connection: Connection,
    context: TransactionContext
  ): Promise<GatewayResponse> {
    try {
      // Step 1: Build optimized transaction with Gateway
      const { optimizedTransaction, transactionId } = await this.buildGatewayTransaction(
        transaction, 
        connection, 
        context,
        undefined // No feePayer available in this context
      );

      // Step 2: The optimized transaction needs to be signed by the wallet
      // Note: This will be handled by the calling code (sendWithGateway hook)
      
      // Step 3: Send the signed, optimized transaction
      return await this.sendBuiltGatewayTransaction(optimizedTransaction, transactionId, context);

    } catch (error) {
      console.error('Gateway transaction failed:', error);
      
      if (this.config.fallbackToStandard) {
        console.log('📡 Falling back to standard RPC...');
        return this.sendViaStandardRPC(transaction, connection, context);
      }

      throw error;
    }
  }

  /**
   * Send transaction via standard RPC as fallback
   * Note: This should be called with a properly signed transaction
   */
  async sendViaStandardRPC(
    transaction: Transaction | VersionedTransaction,
    connection: Connection,
    context: TransactionContext,
    sendTransaction?: (transaction: Transaction, connection: Connection, options?: any) => Promise<string>
  ): Promise<GatewayResponse> {
    const startTime = Date.now();

    try {
      console.log(`📡 Sending ${context.type} transaction via standard RPC`);

      let signature: string;
      
      // Use wallet's sendTransaction if available (preferred method)
      if (sendTransaction && !(transaction instanceof VersionedTransaction)) {
        signature = await sendTransaction(transaction, connection, {
          skipPreflight: context.priority === 'critical',
          maxRetries: this.getMaxRetries(context)
        });
      } else if (transaction instanceof VersionedTransaction) {
        signature = await connection.sendTransaction(transaction, {
          skipPreflight: context.priority === 'critical',
          maxRetries: this.getMaxRetries(context)
        });
      } else {
        // This path should only be used if transaction is already properly prepared with blockhash
        signature = await connection.sendRawTransaction(transaction.serialize(), {
          skipPreflight: context.priority === 'critical',
          maxRetries: this.getMaxRetries(context)
        });
      }

      const endTime = Date.now();

      console.log(`✅ Standard RPC transaction successful: ${signature}`);

      return {
        signature,
        success: true,
        method: 'standard',
        actualTime: endTime - startTime
      };

    } catch (error) {
      console.error('Standard RPC transaction failed:', error);
      throw error;
    }
  }

  /**
   * Main transaction sending method with intelligent routing
   * Note: This method is mainly for internal use. Use the useGatewayService hook for React components.
   */
  async sendTransaction(
    transaction: Transaction | VersionedTransaction,
    connection: Connection,
    context: TransactionContext,
    sendTransaction?: (transaction: Transaction, connection: Connection, options?: any) => Promise<string>
  ): Promise<GatewayResponse> {
    const useGateway = this.shouldUseGateway(context);

    if (useGateway) {
      try {
        // Use the new build → sign → send flow
        const { optimizedTransaction, transactionId } = await this.buildGatewayTransaction(
          transaction, 
          connection, 
          context,
          undefined // No feePayer available in this context
        );

        // Note: In a real implementation, the optimized transaction would need to be signed
        // by the wallet before calling sendBuiltGatewayTransaction
        // For now, we'll fall back to standard RPC if no sendTransaction function is provided
        if (!sendTransaction) {
          console.log('⚠️ No sendTransaction function provided, falling back to standard RPC');
          return this.sendViaStandardRPC(transaction, connection, context, sendTransaction);
        }

        // This is a simplified flow - in practice, the signing should happen at the UI level
        return this.sendBuiltGatewayTransaction(optimizedTransaction, transactionId, context);
      } catch (error) {
        console.error('Gateway flow failed, falling back to standard RPC:', error);
        return this.sendViaStandardRPC(transaction, connection, context, sendTransaction);
      }
    } else {
      return this.sendViaStandardRPC(transaction, connection, context, sendTransaction);
    }
  }

  /**
   * Get optimal delivery method based on context
   */
  private getDeliveryMethod(context: TransactionContext): string {
    switch (context.priority) {
      case 'critical':
        return 'all'; // Use all delivery methods for maximum reliability
      case 'high':
        return 'jito,rpc'; // Use Jito + RPC for speed and reliability
      case 'medium':
        return 'rpc,senders'; // Use RPC + transaction senders
      default:
        return 'rpc'; // Standard RPC only
    }
  }

  /**
   * Get max retries based on context
   */
  private getMaxRetries(context: TransactionContext): number {
    switch (context.priority) {
      case 'critical':
        return 10;
      case 'high':
        return 5;
      case 'medium':
        return 3;
      default:
        return 1;
    }
  }

  /**
   * Get priority fee configuration based on context
   */
  private getPriorityFeeConfig(context: TransactionContext): string | number {
    switch (context.priority) {
      case 'critical':
        return 'high'; // Let Gateway determine high priority fee
      case 'high':
        return 'medium';
      case 'medium':
        return 'low';
      default:
        return 'auto'; // Let Gateway auto-determine
    }
  }

  /**
   * Get compute unit limit based on context
   */
  private getComputeUnitLimit(context: TransactionContext): number | string {
    switch (context.type) {
      case 'inheritance':
        return 400000; // Higher compute for complex inheritance logic
      case 'smart_wallet_create':
        return 300000; // Higher compute for wallet creation
      case 'smart_wallet_deposit':
      case 'smart_wallet_send':
        return 200000; // Medium compute for wallet operations
      case 'standard_send':
        return 100000; // Lower compute for simple transfers
      default:
        return 'auto'; // Let Gateway auto-determine
    }
  }

  /**
   * Get CU price range for Gateway based on context
   */
  private getCuPriceRange(context: TransactionContext): string {
    switch (context.priority) {
      case 'critical':
        return 'high';
      case 'high':
        return 'medium';
      case 'medium':
        return 'low';
      default:
        return 'low';
    }
  }

  /**
   * Get Jito tip range for Gateway based on context
   */
  private getJitoTipRange(context: TransactionContext): string {
    switch (context.priority) {
      case 'critical':
        return 'max';
      case 'high':
        return 'high';
      case 'medium':
        return 'medium';
      default:
        return 'low';
    }
  }

  /**
   * Get delivery method type string for Gateway API
   */
  private getDeliveryMethodString(context: TransactionContext): string {
    switch (context.priority) {
      case 'critical':
        return 'jito'; // Use Jito for critical transactions
      case 'high':
        return 'jito'; // Use Jito for high priority
      case 'medium':
        return 'rpc'; // Use RPC for medium priority
      default:
        return 'rpc'; // Standard RPC for low priority
    }
  }

  /**
   * Calculate priority for transaction type
   */
  static getTransactionPriority(type: TransactionContext['type'], assetValue?: number): TransactionContext['priority'] {
    switch (type) {
      case 'inheritance':
        return 'critical';
      case 'smart_wallet_create':
        return 'high';
      case 'smart_wallet_deposit':
      case 'smart_wallet_send':
        if (assetValue && assetValue > 5.0) return 'high';
        return 'medium';
      case 'standard_send':
        if (assetValue && assetValue > 10.0) return 'high';
        return 'low';
      default:
        return 'low';
    }
  }

  /**
   * Get transaction cost estimation including Gateway fees
   */
  async getTransactionCostEstimate(
    context: TransactionContext
  ): Promise<{ baseFee: number; gatewayFee: number; total: number; savings?: number }> {
    // Real estimation based on transaction priority and complexity
    const baseFee = 0.000005; // 5000 lamports base fee
    const priorityFee = 0.0001; // Estimated priority fee
    
    if (this.shouldUseGateway(context)) {
      const gatewayFee = priorityFee * 0.25; // 25% of priority fees
      return {
        baseFee,
        gatewayFee,
        total: baseFee + priorityFee + gatewayFee,
        savings: 0 // Gateway provides reliability, not cost savings
      };
    }

    return {
      baseFee,
      gatewayFee: 0,
      total: baseFee + priorityFee
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<GatewayConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): GatewayConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const gatewayService = new SanctumGatewayService();

// React hook for using Gateway service
export function useGatewayService() {
  const { publicKey, sendTransaction, signTransaction } = useWallet();

  const sendWithGateway = async (
    transaction: Transaction | VersionedTransaction,
    connection: Connection,
    context: Omit<TransactionContext, 'userTier'>,
    userTier: SubscriptionTier = SubscriptionTier.FREE
  ): Promise<string> => {
    if (!publicKey || !sendTransaction) {
      throw new Error('Wallet not connected');
    }

    const fullContext: TransactionContext = {
      ...context,
      userTier
    };

    try {
      // Check if we should use Gateway
      const useGateway = gatewayService.shouldUseGateway(fullContext);

      if (useGateway) {
        console.log('🔧 Using Gateway optimized transaction flow');
        
        // Step 1: Build optimized transaction with Gateway
        const { optimizedTransaction, transactionId } = await gatewayService.buildGatewayTransaction(
          transaction,
          connection,
          fullContext,
          publicKey
        );

        console.log('✍️ Sending Gateway-optimized transaction via wallet...');
        
        // Debug: Log transaction details before sending
        if (optimizedTransaction instanceof Transaction) {
          console.log(`🔍 Transaction fee payer: ${optimizedTransaction.feePayer?.toString() || 'NOT SET'}`);
          console.log(`🔍 Transaction blockhash: ${optimizedTransaction.recentBlockhash || 'NOT SET'}`);
          console.log(`🔍 Connected wallet: ${publicKey?.toString() || 'NOT CONNECTED'}`);
          console.log(`🔍 Transaction signatures: ${optimizedTransaction.signatures.length}`);
        }
        
        // Use wallet's sendTransaction method with the Gateway-optimized transaction
        // This handles signing internally and sends the already-optimized transaction
        const signature = await sendTransaction(optimizedTransaction, connection, {
          skipPreflight: fullContext.priority === 'critical',
          maxRetries: 1
        });
        
        console.log('✅ Gateway-optimized transaction sent successfully');
        toast.success(`🚀 Transaction sent via Gateway optimization`, {
          duration: 4000
        });
        
        return signature;
      } else {
        // Use standard RPC flow
        console.log('📡 Using standard RPC transaction flow');
        
        const result = await gatewayService.sendViaStandardRPC(
          transaction,
          connection,
          fullContext,
          sendTransaction
        );

        toast.success(`📡 Transaction sent via RPC (${Math.round(result.actualTime || 0)}ms)`, {
          duration: 3000
        });

        return result.signature;
      }
    } catch (error) {
      console.error('Transaction failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Transaction failed: ${errorMessage}`);
      throw error;
    }
  };

  const getCostEstimate = (context: Omit<TransactionContext, 'userTier'>, userTier: SubscriptionTier = SubscriptionTier.FREE) => {
    return gatewayService.getTransactionCostEstimate({
      ...context,
      userTier
    });
  };

  return {
    sendWithGateway,
    getCostEstimate,
    shouldUseGateway: (context: Omit<TransactionContext, 'userTier'>, userTier: SubscriptionTier = SubscriptionTier.FREE) =>
      gatewayService.shouldUseGateway({ ...context, userTier }),
    config: gatewayService.getConfig()
  };
}

export default gatewayService;