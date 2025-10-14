// TypeScript interfaces and error handling utilities for GadaWallet
// This file provides type safety and standardized error handling across the application

export interface ImportMeta {
  readonly env: {
    readonly VITE_CLUSTER?: string;
    readonly VITE_RPC_URL?: string;
    readonly VITE_PROGRAM_ID?: string;
    readonly VITE_GATEWAY_API_KEY?: string;
    readonly VITE_GATEWAY_ENABLED?: string;
    readonly VITE_GATEWAY_API_URL?: string;
    readonly VITE_DEBUG?: string;
    readonly VITE_LOG_LEVEL?: string;
  };
}

// Extend the global types
declare global {
  interface Window {
    testGeoLanguage?: () => void;
    resetGeoLanguage?: () => void;
  }
}

// Standardized Error Classes
export class GadaWalletError extends Error {
  constructor(
    message: string, 
    public readonly code: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'GadaWalletError';
  }
}

export class WalletConnectionError extends GadaWalletError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'WALLET_CONNECTION_ERROR', details);
    this.name = 'WalletConnectionError';
  }
}

export class TransactionError extends GadaWalletError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'TRANSACTION_ERROR', details);
    this.name = 'TransactionError';
  }
}

export class ProgramError extends GadaWalletError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'PROGRAM_ERROR', details);
    this.name = 'ProgramError';
  }
}

export class InheritanceError extends GadaWalletError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'INHERITANCE_ERROR', details);
    this.name = 'InheritanceError';
  }
}

// Type guards for error handling
export function isGadaWalletError(error: unknown): error is GadaWalletError {
  return error instanceof GadaWalletError;
}

export function isWalletConnectionError(error: unknown): error is WalletConnectionError {
  return error instanceof WalletConnectionError;
}

export function isTransactionError(error: unknown): error is TransactionError {
  return error instanceof TransactionError;
}

export function isProgramError(error: unknown): error is ProgramError {
  return error instanceof ProgramError;
}

export function isInheritanceError(error: unknown): error is InheritanceError {
  return error instanceof InheritanceError;
}

// Generic error handler utility
export function handleError(error: unknown, context?: string): GadaWalletError {
  if (isGadaWalletError(error)) {
    return error;
  }
  
  if (error instanceof Error) {
    return new GadaWalletError(
      error.message,
      'UNKNOWN_ERROR',
      { originalError: error.message, context }
    );
  }
  
  return new GadaWalletError(
    'An unknown error occurred',
    'UNKNOWN_ERROR',
    { originalError: String(error), context }
  );
}

// Wallet adapter types
export interface WalletAdapter {
  name: string;
  url: string;
  icon: string;
  readyState: 'Installed' | 'NotDetected' | 'LoadError' | 'Unsupported';
  publicKey: import('@solana/web3.js').PublicKey | null;
  connecting: boolean;
  connected: boolean;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  sendTransaction(
    transaction: import('@solana/web3.js').Transaction,
    connection: import('@solana/web3.js').Connection,
    options?: SendTransactionOptions
  ): Promise<string>;
}

export interface SendTransactionOptions {
  skipPreflight?: boolean;
  preflightCommitment?: import('@solana/web3.js').Commitment;
  maxRetries?: number;
  minContextSlot?: number;
}

// Smart Wallet types
export interface SmartWalletData {
  authority: import('@solana/web3.js').PublicKey;
  lastActivity: import('bn.js');
  inactivityThreshold: import('bn.js');
  heirs: HeirInfo[];
  isActive: boolean;
}

export interface HeirInfo {
  address: import('@solana/web3.js').PublicKey;
  share: number; // Percentage as integer (e.g., 50 for 50%)
}

export interface SmartWalletAccount {
  publicKey: import('@solana/web3.js').PublicKey;
  data: SmartWalletData;
}

// Platform configuration types
export interface PlatformConfig {
  admin: import('@solana/web3.js').PublicKey;
  feeCollector: import('@solana/web3.js').PublicKey;
  baseFee: import('bn.js');
  isInitialized: boolean;
}

// Wallet diagnostics types
export interface WalletDiagnostics {
  isWalletInstalled: boolean;
  isWalletConnected: boolean;
  walletPublicKey: string | null;
  networkStatus: 'connected' | 'disconnected' | 'slow';
  balance: number | null;
  lastError: string | null;
}

// Cache types for performance utils
export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Performance monitoring types
export interface PerformanceMetrics {
  renderTime: number;
  componentMounts: number;
  reRenders: number;
  memoryUsage?: number;
}

// Gateway service types
export interface GatewayConfig {
  apiKey: string;
  enabled: boolean;
  apiUrl: string;
  network: string;
}

export interface GatewayWallet {
  sendTransaction?: (
    transaction: import('@solana/web3.js').Transaction, 
    connection: import('@solana/web3.js').Connection, 
    options?: SendTransactionOptions
  ) => Promise<string>;
}

// Export utility type for function parameters
export type FunctionParameters<T extends (...args: never[]) => unknown> = T extends (...args: infer P) => unknown ? P : never;

// Export utility type for React dependencies
export type DependencyList = ReadonlyArray<unknown>;