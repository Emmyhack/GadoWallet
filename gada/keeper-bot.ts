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

export class SmartWalletClient {
  private program: Program<Gado>;
  private connection: Connection;

  constructor(program: Program<Gado>, connection: Connection) {
    this.program = program;
    this.connection = connection;
  }

  async getSmartWallet(ownerPublicKey: PublicKey) {
    try {
      const [smartWalletPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("smart_wallet"), ownerPublicKey.toBuffer()],
        this.program.programId
      );

      const smartWallet = await this.program.account.smartWallet.fetch(smartWalletPda);
      return { data: smartWallet, publicKey: smartWalletPda };
    } catch (error) {
      return null;
    }
  }

  async isOwnerInactive(ownerPublicKey: PublicKey): Promise<boolean> {
    const smartWallet = await this.getSmartWallet(ownerPublicKey);
    if (!smartWallet) return false;

    const currentTime = Math.floor(Date.now() / 1000);
    const timeSinceLastActivity = currentTime - smartWallet.data.lastActivityTimestamp.toNumber();
    const inactivityPeriod = smartWallet.data.inactivityPeriod.toNumber();

    return timeSinceLastActivity > inactivityPeriod;
  }

  async getSmartWalletBalance(ownerPublicKey: PublicKey): Promise<number> {
    const [smartWalletPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("smart_wallet"), ownerPublicKey.toBuffer()],
      this.program.programId
    );

    const balance = await this.connection.getBalance(smartWalletPda);
    return balance / LAMPORTS_PER_SOL;
  }

  async executeInheritance(ownerPublicKey: PublicKey, keeper: Keypair): Promise<string> {
    const [smartWalletPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("smart_wallet"), ownerPublicKey.toBuffer()],
      this.program.programId
    );

    const tx = await this.program.methods
      .executeInheritance()
      .accounts({
        smartWallet: smartWalletPda,
        keeper: keeper.publicKey,
      })
      .signers([keeper])
      .rpc();

    return tx;
  }
}

// Load the IDL
const IDL = require("./target/idl/gada.json");

/**
 * Keeper Bot for Smart Wallet Inheritance
 * 
 * This bot monitors Smart Wallets and executes inheritance when owners become inactive.
 * In production, this would run as a scheduled service (cron job, cloud function, etc.)
 */
export class InheritanceKeeperBot {
  private program: Program<Gado>;
  private keeperWallet: Keypair;
  private connection: Connection;

  constructor(
    program: Program<Gado>, 
    connection: Connection,
    keeperWallet: Keypair
  ) {
    this.program = program;
    this.connection = connection;
    this.keeperWallet = keeperWallet;
  }

  /**
   * Check and execute inheritance for a specific owner
   */
  async checkAndExecuteInheritance(ownerPublicKey: PublicKey): Promise<boolean> {
    try {
      console.log(`🔍 Checking Smart Wallet for owner: ${ownerPublicKey.toString()}`);

      // Get Smart Wallet data
      const smartWallet = await this.getSmartWallet(ownerPublicKey);
      
      if (!smartWallet) {
        console.log("❌ Smart Wallet not found");
        return false;
      }

      if (smartWallet.data.isExecuted) {
        console.log("✅ Inheritance already executed");
        return false;
      }

      // Check if owner is inactive
      const isInactive = await this.isOwnerInactive(ownerPublicKey);
      
      if (!isInactive) {
        console.log("⏰ Owner is still active");
        return false;
      }

      // Get Smart Wallet balance to see if there are assets to distribute
      const balance = await this.getSmartWalletBalance(ownerPublicKey);
      
      if (balance === 0) {
        console.log("💰 No assets to distribute");
        return false;
      }

      console.log(`💸 Found ${balance} SOL to distribute among ${smartWallet.data.heirs.length} heirs`);

      // Execute inheritance
      console.log("🚀 Executing inheritance...");
      const tx = await this.executeInheritance(
        ownerPublicKey,
        this.keeperWallet
      );

      console.log(`✅ Inheritance executed successfully: ${tx}`);
      
      // Log distribution details
      for (let i = 0; i < smartWallet.data.heirs.length; i++) {
        const heir = smartWallet.data.heirs[i];
        const expectedAmount = (balance * heir.allocationPercentage) / 100;
        console.log(`📋 Heir ${i + 1}: ${heir.heirPubkey.toString()} should receive ${expectedAmount.toFixed(6)} SOL (${heir.allocationPercentage}%)`);
      }

      return true;

    } catch (error) {
      console.error(`❌ Error processing inheritance for ${ownerPublicKey.toString()}:`, error);
      return false;
    }
  }

  /**
   * Monitor multiple Smart Wallets (in production, you'd get this list from indexing)
   */
  async monitorSmartWallets(ownerAddresses: PublicKey[]): Promise<void> {
    console.log(`🤖 Keeper Bot started - monitoring ${ownerAddresses.length} Smart Wallets\n`);

    for (const ownerAddress of ownerAddresses) {
      await this.checkAndExecuteInheritance(ownerAddress);
      console.log(); // Add spacing between checks
    }

    console.log("🏁 Monitoring cycle complete");
  }

  /**
   * Run keeper bot in continuous mode (for production)
   */
  async runContinuous(ownerAddresses: PublicKey[], intervalMinutes: number = 60): Promise<void> {
    console.log(`🤖 Starting continuous keeper bot (checking every ${intervalMinutes} minutes)`);

    const intervalMs = intervalMinutes * 60 * 1000;

    // Run initial check
    await this.monitorSmartWallets(ownerAddresses);

    // Set up interval for continuous monitoring
    setInterval(async () => {
      console.log(`\n⏰ Running scheduled check at ${new Date().toISOString()}`);
      await this.monitorSmartWallets(ownerAddresses);
    }, intervalMs);
  }

  /**
   * Get keeper wallet address and balance
   */
  async getKeeperInfo(): Promise<{ address: string; balance: number }> {
    const balance = await this.connection.getBalance(this.keeperWallet.publicKey);
    return {
      address: this.keeperWallet.publicKey.toString(),
      balance: balance / LAMPORTS_PER_SOL
    };
  }

  async getSmartWallet(ownerPublicKey: PublicKey) {
    try {
      const [smartWalletPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("smart_wallet"), ownerPublicKey.toBuffer()],
        this.program.programId
      );

      const smartWallet = await this.program.account.smartWallet.fetch(smartWalletPda);
      return { data: smartWallet, publicKey: smartWalletPda };
    } catch (error) {
      return null;
    }
  }

  async isOwnerInactive(ownerPublicKey: PublicKey): Promise<boolean> {
    const smartWallet = await this.getSmartWallet(ownerPublicKey);
    if (!smartWallet) return false;

    const currentTime = Math.floor(Date.now() / 1000);
    const timeSinceLastActivity = currentTime - smartWallet.data.lastActivityTimestamp.toNumber();
    const inactivityPeriod = smartWallet.data.inactivityPeriod.toNumber();

    return timeSinceLastActivity > inactivityPeriod;
  }

  async getSmartWalletBalance(ownerPublicKey: PublicKey): Promise<number> {
    const [smartWalletPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("smart_wallet"), ownerPublicKey.toBuffer()],
      this.program.programId
    );

    const balance = await this.connection.getBalance(smartWalletPda);
    return balance / LAMPORTS_PER_SOL;
  }

  async executeInheritance(ownerPublicKey: PublicKey, keeper: Keypair): Promise<string> {
    const [smartWalletPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("smart_wallet"), ownerPublicKey.toBuffer()],
      this.program.programId
    );

    const tx = await this.program.methods
      .executeInheritance()
      .accounts({
        smartWallet: smartWalletPda,
        keeper: keeper.publicKey,
      })
      .signers([keeper])
      .rpc();

    return tx;
  }
}

/**
 * Example usage of the Keeper Bot
 */
async function runKeeperBot() {
  console.log("🤖 Starting Inheritance Keeper Bot...\n");

  // Configure connection
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  
  // Create keeper wallet (in production, load from secure storage)
  const keeperWallet = Keypair.generate();
  
  // Fund keeper wallet for transaction fees
  console.log("💰 Funding keeper wallet...");
  const airdropTx = await connection.requestAirdrop(
    keeperWallet.publicKey,
    0.1 * LAMPORTS_PER_SOL
  );
  await connection.confirmTransaction(airdropTx);

  // Set up provider and program
  const wallet = new Wallet(keeperWallet);
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);

  const program = new Program(IDL as any, provider) as Program<Gado>;

  // Create keeper bot instance
  const keeperBot = new InheritanceKeeperBot(program, connection, keeperWallet);

  // Get keeper info
  const keeperInfo = await keeperBot.getKeeperInfo();
  console.log(`Keeper wallet: ${keeperInfo.address}`);
  console.log(`Keeper balance: ${keeperInfo.balance} SOL\n`);

  // Example: Monitor specific Smart Wallet owners
  // In production, you'd get this list from your indexing service or database
  const ownerAddresses: PublicKey[] = [
    // Add actual owner addresses here
    // new PublicKey("..."),
  ];

  if (ownerAddresses.length === 0) {
    console.log("⚠️  No Smart Wallet owners to monitor");
    console.log("To use this keeper bot:");
    console.log("1. Create Smart Wallets using the test script");
    console.log("2. Add the owner addresses to the ownerAddresses array");
    console.log("3. Run this script again");
    return;
  }

  try {
    // Run single monitoring cycle
    await keeperBot.monitorSmartWallets(ownerAddresses);

    // Uncomment to run continuous monitoring:
    // await keeperBot.runContinuous(ownerAddresses, 5); // Check every 5 minutes

  } catch (error) {
    console.error("❌ Keeper bot error:", error);
  }
}

// Run the keeper bot if this file is executed directly
if (require.main === module) {
  runKeeperBot().catch(console.error);
}

export { runKeeperBot };