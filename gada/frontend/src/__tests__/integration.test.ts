// Simple integration test to ensure core components can be imported without errors
import { describe, it, expect } from 'vitest';

describe('Core Integration', () => {
  it('should import core components without errors', async () => {
    // Test that our main components can be imported
    const { CivicProvider } = await import('../contexts/CivicContext');
    const { WalletContextProvider } = await import('../contexts/WalletContext');
    const { handleTransactionError } = await import('../utils/errorHandling');
    const { checkProgramDeployment } = await import('../lib/programCheck');
    
    expect(CivicProvider).toBeDefined();
    expect(WalletContextProvider).toBeDefined();
    expect(handleTransactionError).toBeDefined();
    expect(checkProgramDeployment).toBeDefined();
  });

  it('should handle error messages correctly', () => {
    const { getTransactionErrorMessage } = require('../utils/errorHandling');
    
    const error1 = new Error('insufficient funds');
    const error2 = new Error('Transaction simulation failed');
    const error3 = new Error('User rejected');
    
    expect(getTransactionErrorMessage(error1)).toBe('Insufficient funds in your wallet');
    expect(getTransactionErrorMessage(error2)).toBe('Transaction failed. Please check your inputs and try again.');
    expect(getTransactionErrorMessage(error3)).toBe('Transaction was cancelled by user');
  });
});