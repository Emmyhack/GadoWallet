import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { 
  Connection, 
  Keypair, 
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram
} from "@solana/web3.js";
import { Gado } from "../lib/types/gado";
import IDL from "../lib/idl/gado.json";

const PROGRAM_ID = new PublicKey("EciS2vNDTe5S6WnNWEBmdBmKjQL5bsXyfauYmxPFKQGu");

export interface MonitoredWallet {
  owner: PublicKey;
  smartWalletPDA: PublicKey;
  smartWalletAssetPDA: PublicKey;
}

export interface ExecutionResult {
  success: boolean;
  txSignature?: string;
  error?: string;
  owner: PublicKey;
  amountDistributed?: number;
  heirsCount?: number;
}

export class SmartWalletKeeper {
  private connection: Connection;
  private program: Program<Gado>;
  private keeperWallet: Keypair;
  private monitoredWallets: MonitoredWallet[] = [];
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;
  private checkIntervalMs: number;

  constructor(
    connection: Connection, 
    keeperWallet: Keypair,
    checkIntervalMs: number = 60000 // Check every minute by default
  ) {
    this.connection = connection;
    this.keeperWallet = keeperWallet;
    this.checkIntervalMs = checkIntervalMs;

    const provider = new anchor.AnchorProvider(
      this.connection,
      new anchor.Wallet(keeperWallet),
      { commitment: 'confirmed' }
    );

    this.program = new Program(IDL as any, provider) as Program<Gado>;
  }

  /**
   * Add a Smart Wallet to monitor
   */
  addWalletToMonitor(ownerPublicKey: PublicKey): void {
    const [smartWalletPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("smart_wallet"), ownerPublicKey.toBuffer()],
      PROGRAM_ID
    );

    const [smartWalletAssetPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("smart_wallet_pda"), ownerPublicKey.toBuffer()],
      PROGRAM_ID
    );

    // Check if already monitoring
    const exists = this.monitoredWallets.some(wallet => 
      wallet.owner.equals(ownerPublicKey)
    );

    if (!exists) {
      this.monitoredWallets.push({
        owner: ownerPublicKey,
        smartWalletPDA,
        smartWalletAssetPDA,
      });
      
      console.log(`📋 Added Smart Wallet to monitoring: ${ownerPublicKey.toString()}`);
    }
  }

  /**
   * Remove a Smart Wallet from monitoring
   */
  removeWalletFromMonitoring(ownerPublicKey: PublicKey): void {
    this.monitoredWallets = this.monitoredWallets.filter(
      wallet => !wallet.owner.equals(ownerPublicKey)
    );
    console.log(`🗑️ Removed Smart Wallet from monitoring: ${ownerPublicKey.toString()}`);
  }

  /**
   * Check if a Smart Wallet is eligible for inheritance execution
   */
  private async checkWalletEligibility(monitoredWallet: MonitoredWallet): Promise<{
    eligible: boolean;
    smartWallet?: any;
    balance?: number;
    timeInactive?: number;
    reason?: string;
  }> {
    try {
      // Fetch Smart Wallet account data
      const smartWallet = await this.program.account.smartWallet.fetch(
        monitoredWallet.smartWalletPDA
      );

      // Check if already executed
      if (smartWallet.isExecuted) {
        return { 
          eligible: false, 
          reason: "Inheritance already executed",
          smartWallet 
        };
      }

      // Check balance
      const balance = await this.connection.getBalance(monitoredWallet.smartWalletAssetPDA);
      if (balance === 0) {
        return { 
          eligible: false, 
          reason: "No balance to distribute",
          smartWallet,
          balance: 0 
        };
      }

      // Check inactivity
      const currentTime = Math.floor(Date.now() / 1000);
      const timeSinceLastActive = currentTime - smartWallet.lastActiveTime.toNumber();
      const inactivityPeriod = smartWallet.inactivityPeriodSeconds.toNumber();

      if (timeSinceLastActive < inactivityPeriod) {
        return { 
          eligible: false, 
          reason: `Owner still active (${Math.floor((inactivityPeriod - timeSinceLastActive) / 60)} minutes remaining)`,
          smartWallet,
          balance: balance / LAMPORTS_PER_SOL,
          timeInactive: timeSinceLastActive 
        };
      }

      return { 
        eligible: true, 
        smartWallet,
        balance: balance / LAMPORTS_PER_SOL,
        timeInactive: timeSinceLastActive 
      };

    } catch (error) {
      return { 
        eligible: false, 
        reason: `Error checking wallet: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  /**
   * Execute inheritance for a specific Smart Wallet
   */
  private async executeInheritanceForWallet(monitoredWallet: MonitoredWallet): Promise<ExecutionResult> {
    try {
      console.log(`🎯 Executing inheritance for Smart Wallet: ${monitoredWallet.owner.toString()}`);

      // Get wallet info for logging
      const walletInfo = await this.checkWalletEligibility(monitoredWallet);
      if (!walletInfo.eligible || !walletInfo.smartWallet) {
        return {
          success: false,
          error: walletInfo.reason || "Wallet not eligible",
          owner: monitoredWallet.owner,
        };
      }

      // Execute the inheritance
      // Get required accounts for execution
      const [platformConfigPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("platform_config")],
        this.program.programId
      );

      const [treasuryPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("treasury")],
        this.program.programId
      );

      const [userProfilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("user_profile"), monitoredWallet.owner.toBuffer()],
        this.program.programId
      );

      const tx = await this.program.methods
        .executeInheritance()
        .accountsPartial({
          smartWallet: monitoredWallet.smartWalletPDA,
          platformConfig: platformConfigPda,
          treasury: treasuryPda,
          userProfile: userProfilePda,
          smartWalletPda: monitoredWallet.smartWalletAssetPDA,
          caller: this.keeperWallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([this.keeperWallet])
        .rpc();

      console.log(`✅ Inheritance executed successfully!`);
      console.log(`   Owner: ${monitoredWallet.owner.toString()}`);
      console.log(`   Transaction: ${tx}`);
      console.log(`   Amount distributed: ${walletInfo.balance} SOL`);
      console.log(`   Heirs: ${walletInfo.smartWallet.heirs.length}`);

      // Remove from monitoring since inheritance is executed
      this.removeWalletFromMonitoring(monitoredWallet.owner);

      return {
        success: true,
        txSignature: tx,
        owner: monitoredWallet.owner,
        ...(walletInfo.balance !== undefined && { amountDistributed: walletInfo.balance }),
        heirsCount: walletInfo.smartWallet.heirs.length,
      };

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Failed to execute inheritance for ${monitoredWallet.owner.toString()}:`, errorMsg);
      
      return {
        success: false,
        error: errorMsg,
        owner: monitoredWallet.owner,
      };
    }
  }

  /**
   * Check all monitored wallets and execute inheritances if eligible
   */
  private async checkAllWallets(): Promise<void> {
    if (this.monitoredWallets.length === 0) {
      return;
    }

    console.log(`\n🔍 Checking ${this.monitoredWallets.length} monitored Smart Wallets...`);
    
    const results: ExecutionResult[] = [];

    for (const monitoredWallet of this.monitoredWallets) {
      try {
        const eligibility = await this.checkWalletEligibility(monitoredWallet);
        
        if (eligibility.eligible) {
          console.log(`⚠️ Found eligible Smart Wallet: ${monitoredWallet.owner.toString()}`);
          console.log(`   Balance: ${eligibility.balance} SOL`);
          console.log(`   Inactive for: ${Math.floor((eligibility.timeInactive || 0) / 60)} minutes`);
          
          const result = await this.executeInheritanceForWallet(monitoredWallet);
          results.push(result);
          
          // Add delay between executions to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          // Optional: Log status for debugging (remove in production)
          // console.log(`ℹ️ Wallet ${monitoredWallet.owner.toString()}: ${eligibility.reason}`);
        }
      } catch (error) {
        console.error(`Error checking wallet ${monitoredWallet.owner.toString()}:`, error);
      }
    }

    if (results.length > 0) {
      console.log(`\n📊 Execution Summary:`);
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      
      console.log(`   ✅ Successful: ${successful.length}`);
      console.log(`   ❌ Failed: ${failed.length}`);
      
      if (successful.length > 0) {
        const totalDistributed = successful.reduce((sum, r) => sum + (r.amountDistributed || 0), 0);
        console.log(`   💰 Total distributed: ${totalDistributed.toFixed(4)} SOL`);
      }
    }
  }

  /**
   * Start the automated monitoring
   */
  start(): void {
    if (this.isRunning) {
      console.log("⚠️ Smart Wallet Keeper is already running");
      return;
    }

    this.isRunning = true;
    console.log(`🚀 Smart Wallet Keeper started (checking every ${this.checkIntervalMs / 1000} seconds)`);
    console.log(`   Keeper wallet: ${this.keeperWallet.publicKey.toString()}`);
    console.log(`   Monitored wallets: ${this.monitoredWallets.length}`);

    // Run initial check
    this.checkAllWallets();

    // Set up interval for continuous monitoring
    this.intervalId = setInterval(() => {
      this.checkAllWallets();
    }, this.checkIntervalMs);
  }

  /**
   * Stop the automated monitoring
   */
  stop(): void {
    if (!this.isRunning) {
      console.log("⚠️ Smart Wallet Keeper is not running");
      return;
    }

    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log("🛑 Smart Wallet Keeper stopped");
  }

  /**
   * Get monitoring status
   */
  getStatus(): {
    isRunning: boolean;
    monitoredWalletsCount: number;
    checkIntervalMs: number;
    keeperWallet: string;
  } {
    return {
      isRunning: this.isRunning,
      monitoredWalletsCount: this.monitoredWallets.length,
      checkIntervalMs: this.checkIntervalMs,
      keeperWallet: this.keeperWallet.publicKey.toString(),
    };
  }

  /**
   * Get list of monitored wallets with their status
   */
  async getMonitoredWalletsStatus(): Promise<Array<{
    owner: string;
    eligible: boolean;
    balance?: number;
    timeUntilEligible?: number;
    reason?: string;
  }>> {
    const statuses = [];

    for (const wallet of this.monitoredWallets) {
      const eligibility = await this.checkWalletEligibility(wallet);
      
      statuses.push({
        owner: wallet.owner.toString(),
        eligible: eligibility.eligible,
        ...(eligibility.balance !== undefined && { balance: eligibility.balance }),
        ...(eligibility.eligible ? { timeUntilEligible: 0 } : {}),
        ...(eligibility.reason !== undefined && { reason: eligibility.reason }),
      });
    }

    return statuses;
  }

  /**
   * Manually trigger a check (useful for testing)
   */
  async manualCheck(): Promise<void> {
    console.log("🔧 Manual check triggered");
    await this.checkAllWallets();
  }

  /**
   * Set new check interval
   */
  setCheckInterval(intervalMs: number): void {
    this.checkIntervalMs = intervalMs;
    
    if (this.isRunning && this.intervalId) {
      // Restart with new interval
      clearInterval(this.intervalId);
      this.intervalId = setInterval(() => {
        this.checkAllWallets();
      }, this.checkIntervalMs);
      
      console.log(`⚙️ Check interval updated to ${intervalMs / 1000} seconds`);
    }
  }
}

// Factory function for easier initialization
export const createSmartWalletKeeper = (
  connection: Connection,
  keeperWallet: Keypair,
  checkIntervalMs?: number
) => {
  return new SmartWalletKeeper(connection, keeperWallet, checkIntervalMs);
};

export default SmartWalletKeeper;