/**
 * Production-Safe Logging Utility
 * Replaces console.log with conditional logging based on environment
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: unknown;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private logHistory: LogEntry[] = [];
  private maxHistorySize = 100;

  /**
   * Debug logging - only shown in development
   */
  debug(message: string, data?: unknown, context?: string) {
    if (this.isDevelopment) {
      this.log('debug', message, data, context);
      console.debug(`🔍 [${context || 'DEBUG'}]`, message, data || '');
    }
  }

  /**
   * Info logging - shown in development, stored in production
   */
  info(message: string, data?: unknown, context?: string) {
    this.log('info', message, data, context);
    if (this.isDevelopment) {
      console.info(`ℹ️ [${context || 'INFO'}]`, message, data || '');
    }
  }

  /**
   * Warning logging - always shown
   */
  warn(message: string, data?: unknown, context?: string) {
    this.log('warn', message, data, context);
    console.warn(`⚠️ [${context || 'WARN'}]`, message, data || '');
  }

  /**
   * Error logging - always shown and tracked
   */
  error(message: string, error?: Error | unknown, context?: string) {
    this.log('error', message, error, context);
    console.error(`❌ [${context || 'ERROR'}]`, message, error || '');
    
    // In production, you might want to send errors to a monitoring service
    if (!this.isDevelopment && error instanceof Error) {
      this.reportError(error, message, context);
    }
  }

  /**
   * Transaction logging - for blockchain operations
   */
  transaction(operation: string, txHash?: string, data?: unknown) {
    const message = txHash 
      ? `Transaction ${operation}: ${txHash}`
      : `Transaction ${operation} initiated`;
    
    this.info(message, data, 'TRANSACTION');
  }

  /**
   * Performance logging - for timing operations
   */
  performance(operation: string, duration: number, context?: string) {
    const message = `${operation} completed in ${duration}ms`;
    this.debug(message, { duration }, context || 'PERFORMANCE');
  }

  /**
   * Wallet logging - for wallet operations
   */
  wallet(operation: string, address?: string, data?: unknown) {
    const message = address 
      ? `Wallet ${operation}: ${address}`
      : `Wallet ${operation}`;
    
    this.info(message, data, 'WALLET');
  }

  /**
   * Program logging - for smart contract interactions
   */
  program(method: string, programId?: string, data?: unknown) {
    const message = programId
      ? `Program method ${method} on ${programId}`
      : `Program method ${method}`;
    
    this.debug(message, data, 'PROGRAM');
  }

  private log(level: LogLevel, message: string, data?: unknown, context?: string) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      data: data && typeof data === 'object' ? JSON.stringify(data) : data
    };

    this.logHistory.push(entry);
    
    // Keep history size manageable
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory = this.logHistory.slice(-this.maxHistorySize);
    }
  }

  private reportError(error: Error, message: string, context?: string) {
    // In a real application, you'd send this to a monitoring service like Sentry
    // For now, we'll just store it locally
    const errorReport = {
      message,
      context,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    };

    // Store in localStorage for debugging (in development)
    if (this.isDevelopment) {
      const errors = JSON.parse(localStorage.getItem('gada_errors') || '[]');
      errors.push(errorReport);
      localStorage.setItem('gada_errors', JSON.stringify(errors.slice(-10))); // Keep last 10 errors
    }
  }

  /**
   * Get recent log entries for debugging
   */
  getRecentLogs(count = 20): LogEntry[] {
    return this.logHistory.slice(-count);
  }

  /**
   * Clear log history
   */
  clearHistory() {
    this.logHistory = [];
  }

  /**
   * Export logs for debugging
   */
  exportLogs(): string {
    return JSON.stringify(this.logHistory, null, 2);
  }
}

// Create singleton logger instance
export const logger = new Logger();

// Convenience functions for common logging patterns
export const logTransaction = (operation: string, txHash?: string, data?: unknown) =>
  logger.transaction(operation, txHash, data);

export const logWallet = (operation: string, address?: string, data?: unknown) =>
  logger.wallet(operation, address, data);

export const logProgram = (method: string, programId?: string, data?: unknown) =>
  logger.program(method, programId, data);

export const logPerformance = (operation: string, startTime: number) =>
  logger.performance(operation, Date.now() - startTime);

// Development-only logging helper
export const devLog = (...args: unknown[]) => {
  if (import.meta.env.DEV) {
    console.log(...args);
  }
};

export default logger;