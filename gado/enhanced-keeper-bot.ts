import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { Gado } from "./target/types/gado";
import { 
  Connection, 
  Keypair, 
  clusterApiUrl,
  LAMPORTS_PER_SOL,
  PublicKey 
} from "@solana/web3.js";
import { SmartWalletClient } from "./smart-wallet-client";
import { 
  KeeperConfig, 
  defaultConfig, 
  loadConfigFromEnv, 
  mergeConfig, 
  validateConfig 
} from "./keeper-config";
import * as fs from "fs";

/**
 * Enhanced Inheritance Keeper Bot with configuration support
 */
export class EnhancedInheritanceKeeperBot {
  private program: Program<Gado>;
  private smartWalletClient: SmartWalletClient;
  private keeperWallet: Keypair;
  private connection: Connection;
  private config: KeeperConfig;

  constructor(
    program: Program<Gado>,
    connection: Connection,
    keeperWallet: Keypair,
    config: KeeperConfig
  ) {
    this.program = program;
    this.connection = connection;
    this.keeperWallet = keeperWallet;
    this.config = config;
    this.smartWalletClient = new SmartWalletClient(program, connection);
  }

  /**
   * Log message with optional file output
   */
  private log(message: string, level: "info" | "error" | "warn" = "info"): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    
    if (this.config.verbose) {
      console.log(logMessage);
    }
    
    if (this.config.logFile) {
      fs.appendFileSync(this.config.logFile, logMessage + "\n");
    }
  }

  /**
   * Check and execute inheritance for a specific owner with retry logic
   */
  async checkAndExecuteInheritance(ownerPublicKey: PublicKey, retries: number = 3): Promise<boolean> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        this.log(`🔍 Checking Smart Wallet for owner: ${ownerPublicKey.toString()} (attempt ${attempt})`);

        // Ensure keeper wallet has sufficient balance
        await this.ensureFunding();

        // Get Smart Wallet data
        const smartWallet = await this.smartWalletClient.getSmartWallet(ownerPublicKey);
        
        if (!smartWallet) {
          this.log("❌ Smart Wallet not found", "warn");
          return false;
        }

        if (smartWallet.data.isExecuted) {
          this.log("✅ Inheritance already executed");
          return false;
        }

        // Check if owner is inactive
        const isInactive = await this.smartWalletClient.isOwnerInactive(ownerPublicKey);
        
        if (!isInactive) {
          this.log("⏰ Owner is still active");
          return false;
        }

        // Get Smart Wallet balance
        const balance = await this.smartWalletClient.getSmartWalletBalance(ownerPublicKey);
        
        if (balance === 0) {
          this.log("💰 No assets to distribute");
          return false;
        }

        this.log(`💸 Found ${balance} SOL to distribute among ${smartWallet.data.heirs.length} heirs`);

        // Execute inheritance
        this.log("🚀 Executing inheritance...");
        const tx = await this.smartWalletClient.executeInheritance(
          ownerPublicKey,
          this.keeperWallet
        );

        this.log(`✅ Inheritance executed successfully: ${tx}`);
        
        // Log distribution details
        for (let i = 0; i < smartWallet.data.heirs.length; i++) {
          const heir = smartWallet.data.heirs[i];
          const expectedAmount = (balance * heir.allocationPercentage) / 100;
          this.log(`📋 Heir ${i + 1}: ${heir.heirPubkey.toString()} should receive ${expectedAmount.toFixed(6)} SOL (${heir.allocationPercentage}%)`);
        }

        return true;

      } catch (error) {
        this.log(`❌ Error on attempt ${attempt} for ${ownerPublicKey.toString()}: ${error}`, "error");
        
        if (attempt === retries) {
          this.log(`❌ Failed after ${retries} attempts`, "error");
          return false;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    
    return false;
  }

  /**
   * Monitor Smart Wallets in batches
   */
  async monitorSmartWalletsBatch(ownerAddresses: PublicKey[]): Promise<void> {
    this.log(`🤖 Keeper Bot started - monitoring ${ownerAddresses.length} Smart Wallets`);

    const batchSize = this.config.batchSize;
    let processedCount = 0;
    let successCount = 0;

    for (let i = 0; i < ownerAddresses.length; i += batchSize) {
      const batch = ownerAddresses.slice(i, i + batchSize);
      this.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1} (${batch.length} wallets)`);

      const promises = batch.map(async (ownerAddress) => {
        const result = await this.checkAndExecuteInheritance(ownerAddress);
        processedCount++;
        if (result) successCount++;
        return result;
      });

      await Promise.allSettled(promises);
      
      // Small delay between batches to avoid overwhelming the RPC
      if (i + batchSize < ownerAddresses.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    this.log(`🏁 Monitoring cycle complete - processed ${processedCount} wallets, executed ${successCount} inheritances`);
  }

  /**
   * Get all Smart Wallets on-chain
   */
  async getAllSmartWallets(): Promise<Array<{ owner: PublicKey; data: any }>> {
    try {
      this.log("🔍 Fetching all Smart Wallet accounts...");
      const accounts = await this.program.account.smartWallet.all();
      
      this.log(`📊 Found ${accounts.length} Smart Wallet accounts`);
      
      return accounts.map(acc => ({
        owner: acc.account.owner,
        data: acc.account
      }));
    } catch (error) {
      this.log(`❌ Error fetching Smart Wallet accounts: ${error}`, "error");
      return [];
    }
  }

  /**
   * Run continuous monitoring
   */
  async runContinuous(): Promise<void> {
    this.log(`🤖 Starting continuous keeper bot (checking every ${this.config.checkIntervalMinutes} minutes)`);

    const intervalMs = this.config.checkIntervalMinutes * 60 * 1000;

    // Get target wallets
    const targetWallets = this.config.targetWallets.length > 0 
      ? this.config.targetWallets.map(addr => new PublicKey(addr))
      : (await this.getAllSmartWallets()).map(wallet => wallet.owner);

    if (targetWallets.length === 0) {
      this.log("⚠️  No Smart Wallets to monitor", "warn");
      return;
    }

    // Run initial check
    await this.monitorSmartWalletsBatch(targetWallets);

    // Set up interval for continuous monitoring
    setInterval(async () => {
      this.log(`⏰ Running scheduled check at ${new Date().toISOString()}`);
      await this.monitorSmartWalletsBatch(targetWallets);
    }, intervalMs);
  }

  /**
   * Ensure keeper wallet has sufficient balance
   */
  async ensureFunding(): Promise<void> {
    const balance = await this.connection.getBalance(this.keeperWallet.publicKey);
    const balanceSOL = balance / LAMPORTS_PER_SOL;
    
    if (balanceSOL < this.config.minKeeperBalance) {
      this.log(`💰 Keeper wallet balance low (${balanceSOL} SOL), requesting airdrop...`);
      
      try {
        const airdropAmount = Math.max(0.1, this.config.minKeeperBalance * 2);
        const airdropTx = await this.connection.requestAirdrop(
          this.keeperWallet.publicKey,
          airdropAmount * LAMPORTS_PER_SOL
        );
        await this.connection.confirmTransaction(airdropTx);
        this.log(`✅ Keeper wallet funded with ${airdropAmount} SOL`);
      } catch (error) {
        this.log(`❌ Failed to fund keeper wallet: ${error}`, "error");
        throw new Error("Insufficient keeper wallet balance and unable to fund");
      }
    }
  }

  /**
   * Get keeper wallet info
   */
  async getKeeperInfo(): Promise<{ address: string; balance: number }> {
    const balance = await this.connection.getBalance(this.keeperWallet.publicKey);
    return {
      address: this.keeperWallet.publicKey.toString(),
      balance: balance / LAMPORTS_PER_SOL
    };
  }
}

/**
 * Create and run enhanced keeper bot
 */
export async function runEnhancedKeeperBot(customConfig?: Partial<KeeperConfig>): Promise<void> {
  // Load and merge configuration
  const envConfig = loadConfigFromEnv();
  const config = mergeConfig(defaultConfig, { ...envConfig, ...customConfig });
  
  // Validate configuration
  validateConfig(config);

  console.log("🤖 Starting Enhanced Inheritance Keeper Bot...\n");
  console.log("Configuration:", JSON.stringify(config, null, 2));

  // Configure connection
  const connection = new Connection(
    config.rpcUrl || clusterApiUrl(config.network), 
    "confirmed"
  );
  
  // Create or load keeper wallet
  let keeperWallet: Keypair;
  
  if (config.keeperWalletPath && fs.existsSync(config.keeperWalletPath)) {
    console.log(`📂 Loading keeper wallet from: ${config.keeperWalletPath}`);
    const walletData = JSON.parse(fs.readFileSync(config.keeperWalletPath, "utf8"));
    keeperWallet = Keypair.fromSecretKey(new Uint8Array(walletData));
  } else {
    console.log("🆕 Generating new keeper wallet");
    keeperWallet = Keypair.generate();
    
    // Save wallet if path is provided
    if (config.keeperWalletPath) {
      fs.writeFileSync(
        config.keeperWalletPath, 
        JSON.stringify(Array.from(keeperWallet.secretKey))
      );
      console.log(`💾 Keeper wallet saved to: ${config.keeperWalletPath}`);
    }
  }

  // Set up provider and program
  const wallet = new Wallet(keeperWallet);
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);

  // Load the IDL
  const IDL = require("./target/idl/gado.json");
  const program = new Program(IDL as any, provider) as Program<Gado>;

  // Create enhanced keeper bot instance
  const keeperBot = new EnhancedInheritanceKeeperBot(program, connection, keeperWallet, config);

  // Get keeper info
  const keeperInfo = await keeperBot.getKeeperInfo();
  console.log(`Keeper wallet: ${keeperInfo.address}`);
  console.log(`Keeper balance: ${keeperInfo.balance} SOL\n`);

  try {
    // Run continuous monitoring
    await keeperBot.runContinuous();
  } catch (error) {
    console.error("❌ Enhanced keeper bot error:", error);
    throw error;
  }
}