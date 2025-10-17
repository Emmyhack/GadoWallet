import { PublicKey } from "@solana/web3.js";

/**
 * Configuration for the Inheritance Keeper Bot
 */
export interface KeeperConfig {
  // Network configuration
  network: "devnet" | "testnet" | "mainnet-beta";
  rpcUrl?: string;
  
  // Keeper wallet configuration
  keeperWalletPath?: string; // Path to keeper wallet JSON file
  minKeeperBalance: number; // Minimum SOL balance for keeper wallet
  
  // Monitoring configuration
  checkIntervalMinutes: number; // How often to check for inactive wallets
  batchSize: number; // How many wallets to check in one batch
  
  // Smart Wallet addresses to monitor (optional - if empty, will discover all)
  targetWallets: string[];
  
  // Logging configuration
  verbose: boolean;
  logFile?: string;
}

/**
 * Default configuration for development/testing
 */
export const defaultConfig: KeeperConfig = {
  network: "devnet",
  minKeeperBalance: 0.01, // 0.01 SOL minimum
  checkIntervalMinutes: 5, // Check every 5 minutes
  batchSize: 10, // Process 10 wallets at a time
  targetWallets: [], // Empty = discover all wallets
  verbose: true,
};

/**
 * Production configuration template
 */
export const productionConfig: KeeperConfig = {
  network: "mainnet-beta",
  minKeeperBalance: 0.1, // 0.1 SOL minimum for mainnet
  checkIntervalMinutes: 60, // Check every hour
  batchSize: 50, // Process more wallets at once
  targetWallets: [], // Add specific wallet addresses here
  verbose: false,
  logFile: "./keeper-bot.log",
};

/**
 * Load configuration from environment variables
 */
export function loadConfigFromEnv(): Partial<KeeperConfig> {
  return {
    network: (process.env.KEEPER_NETWORK as any) || "devnet",
    rpcUrl: process.env.KEEPER_RPC_URL,
    keeperWalletPath: process.env.KEEPER_WALLET_PATH,
    minKeeperBalance: process.env.KEEPER_MIN_BALANCE ? 
      parseFloat(process.env.KEEPER_MIN_BALANCE) : undefined,
    checkIntervalMinutes: process.env.KEEPER_CHECK_INTERVAL ? 
      parseInt(process.env.KEEPER_CHECK_INTERVAL) : undefined,
    batchSize: process.env.KEEPER_BATCH_SIZE ? 
      parseInt(process.env.KEEPER_BATCH_SIZE) : undefined,
    targetWallets: process.env.KEEPER_TARGET_WALLETS ? 
      process.env.KEEPER_TARGET_WALLETS.split(",") : undefined,
    verbose: process.env.KEEPER_VERBOSE === "true",
    logFile: process.env.KEEPER_LOG_FILE,
  };
}

/**
 * Merge configurations with defaults
 */
export function mergeConfig(base: KeeperConfig, override: Partial<KeeperConfig>): KeeperConfig {
  return {
    ...base,
    ...override,
    targetWallets: override.targetWallets || base.targetWallets,
  };
}

/**
 * Validate configuration
 */
export function validateConfig(config: KeeperConfig): void {
  if (config.minKeeperBalance <= 0) {
    throw new Error("minKeeperBalance must be positive");
  }
  
  if (config.checkIntervalMinutes <= 0) {
    throw new Error("checkIntervalMinutes must be positive");
  }
  
  if (config.batchSize <= 0) {
    throw new Error("batchSize must be positive");
  }
  
  // Validate wallet addresses
  for (const walletAddress of config.targetWallets) {
    try {
      new PublicKey(walletAddress);
    } catch (error) {
      throw new Error(`Invalid wallet address: ${walletAddress}`);
    }
  }
}