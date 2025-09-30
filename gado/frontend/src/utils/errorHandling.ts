/**
 * Utility functions for consistent error handling across the application
 */

export interface TransactionError extends Error {
  code?: string | number;
  logs?: string[];
}

export interface SendTransactionError extends Error {
  logs?: string[];
  getLogs?: () => string[];
  message: string;
}

/**
 * Converts raw transaction errors into user-friendly messages
 */
export function getTransactionErrorMessage(error: unknown, defaultMessage: string = 'Transaction failed'): string {
  if (!(error instanceof Error)) {
    return defaultMessage;
  }

  const message = error.message.toLowerCase();

  // Common Solana transaction errors
  if (message.includes('insufficient funds') || message.includes('insufficient lamports')) {
    return 'Insufficient funds in your wallet';
  }

  if (message.includes('transaction simulation failed')) {
    return 'Transaction failed. Please check your inputs and try again.';
  }

  if (message.includes('user rejected') || message.includes('user denied')) {
    return 'Transaction was cancelled by user';
  }

  if (message.includes('blockhash not found') || message.includes('block height exceeded')) {
    return 'Transaction expired. Please try again.';
  }

  if (message.includes('not authorized') || message.includes('unauthorized')) {
    return 'You are not authorized to perform this action';
  }

  if (message.includes('account not found')) {
    return 'Account not found. Please check the address.';
  }

  if (message.includes('invalid public key')) {
    return 'Invalid address format. Please check and try again.';
  }

  if (message.includes('network error') || message.includes('fetch failed')) {
    return 'Network error. Please check your connection and try again.';
  }

  if (message.includes('timeout')) {
    return 'Transaction timed out. Please try again.';
  }

  // Return the original message if it's user-friendly enough
  if (error.message.length < 100 && !message.includes('0x')) {
    return error.message;
  }

  // Fallback to default message for technical errors
  return defaultMessage;
}

/**
 * Logs error details for debugging while returning user-friendly message
 */
export function handleTransactionError(
  error: unknown, 
  context: string, 
  defaultMessage?: string
): string {
  console.error(`Error in ${context}:`, error);
  
  // Handle SendTransactionError specifically
  if (error && typeof error === 'object') {
    const txError = error as SendTransactionError;
    
    // Try to get logs using getLogs() method
    if (typeof txError.getLogs === 'function') {
      try {
        const logs = txError.getLogs();
        console.error('Transaction logs from getLogs():', logs);
      } catch (logError) {
        console.error('Failed to get transaction logs:', logError);
      }
    }
    
    // Also check for logs property
    if ('logs' in txError && Array.isArray(txError.logs)) {
      console.error('Transaction logs from property:', txError.logs);
    }

    // Log program-specific errors
    if (txError.message.includes('program that does not exist')) {
      console.error('Program deployment issue - check if program is deployed to the correct network');
      return 'Program not found. Please ensure the smart contract is deployed.';
    }
  }

  return getTransactionErrorMessage(error, defaultMessage);
}

/**
 * Wallet connection error handler
 */
export function handleWalletError(error: unknown): void {
  console.warn('Wallet connection error:', error);
  
  if (error instanceof Error) {
    // Don't throw for MetaMask detection errors from Solflare
    if (error.message.includes('MetaMask extension not found')) {
      console.info('MetaMask not detected, continuing with available wallets');
      return;
    }
    
    // Log other errors but don't break the app
    console.error('Wallet error:', error.message);
  }
}