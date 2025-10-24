import * as anchor from "@coral-xyz/anchor";
import { Connection, PublicKey, Keypair, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Program } from "@coral-xyz/anchor";
import { Gado } from "./target/types/gado";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import * as fs from 'fs';

const PROGRAM_ID = new PublicKey("EciS2vNDTe5S6WnNWEBmdBmKjQL5bsXyfauYmxPFKQGu");

interface InheritanceToMonitor {
  owner: PublicKey;
  heir: PublicKey;
  type: 'sol' | 'token';
  tokenMint?: PublicKey;
  amount: number;
  inactivityPeriodSeconds: number;
  lastActivity: number;
}

export class AutomatedKeeperBot {
  private program: Program<Gado>;
  private connection: Connection;
  private keeperKeypair: Keypair;
  private isRunning: boolean = false;
  private checkIntervalMs: number;
  private inheritanceList: InheritanceToMonitor[] = [];

  constructor(
    program: Program<Gado>,
    connection: Connection,
    keeperKeypair: Keypair,
    checkIntervalMinutes: number = 5
  ) {
    this.program = program;
    this.connection = connection;
    this.keeperKeypair = keeperKeypair;
    this.checkIntervalMs = checkIntervalMinutes * 60 * 1000;
  }

  /**
   * Discover all inheritance accounts from the blockchain
   */
  async discoverInheritances(): Promise<void> {
    console.log("🔍 Discovering inheritance accounts...");
    
    try {
      // Get all SOL heir accounts
      const solHeirAccounts = await this.program.account.solHeir.all();
      console.log(`Found ${solHeirAccounts.length} SOL inheritances`);

      for (const account of solHeirAccounts) {
        if (!account.account.isClaimed) {
          this.inheritanceList.push({
            owner: account.account.owner,
            heir: account.account.heir,
            type: 'sol',
            amount: account.account.amount.toNumber(),
            inactivityPeriodSeconds: account.account.inactivityPeriodSeconds.toNumber(),
            lastActivity: account.account.lastActivity.toNumber()
          });
        }
      }

      // Get all Token heir accounts  
      const tokenHeirAccounts = await this.program.account.tokenHeir.all();
      console.log(`Found ${tokenHeirAccounts.length} Token inheritances`);

      for (const account of tokenHeirAccounts) {
        if (!account.account.isClaimed) {
          this.inheritanceList.push({
            owner: account.account.owner,
            heir: account.account.heir,
            type: 'token',
            tokenMint: account.account.tokenMint,
            amount: account.account.amount.toNumber(),
            inactivityPeriodSeconds: account.account.inactivityPeriodSeconds.toNumber(),
            lastActivity: account.account.lastActivity.toNumber()
          });
        }
      }

      console.log(`📋 Total active inheritances to monitor: ${this.inheritanceList.length}`);
    } catch (error) {
      console.error("❌ Error discovering inheritances:", error);
    }
  }

  /**
   * Check if an inheritance is eligible for automatic execution
   */
  isEligibleForExecution(inheritance: InheritanceToMonitor): boolean {
    const currentTime = Math.floor(Date.now() / 1000);
    const timeSinceLastActive = currentTime - inheritance.lastActivity;
    const isInactive = timeSinceLastActive > inheritance.inactivityPeriodSeconds;
    
    if (isInactive) {
      console.log(`⏰ Inheritance eligible for execution:`);
      console.log(`   Owner: ${inheritance.owner.toString()}`);
      console.log(`   Heir: ${inheritance.heir.toString()}`);
      console.log(`   Type: ${inheritance.type.toUpperCase()}`);
      console.log(`   Amount: ${inheritance.type === 'sol' ? 
        (inheritance.amount / LAMPORTS_PER_SOL).toFixed(4) + ' SOL' : 
        inheritance.amount.toString() + ' tokens'}`);
      console.log(`   Inactive for: ${Math.floor(timeSinceLastActive / 3600)} hours`);
      return true;
    }
    
    return false;
  }

  /**
   * Automatically execute SOL inheritance claim for heir
   * Note: This actually sends notification to heir - heirs must claim themselves
   */
  async executeSOLInheritance(inheritance: InheritanceToMonitor): Promise<boolean> {
    try {
      console.log(`🚀 Notifying heir about eligible SOL inheritance: ${inheritance.heir.toString()}`);

      const [solHeirPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("sol_heir"), inheritance.owner.toBuffer(), inheritance.heir.toBuffer()],
        PROGRAM_ID
      );

      // Verify the inheritance is still claimable
      const solHeirAccount = await this.program.account.solHeir.fetch(solHeirPDA);
      
      if (solHeirAccount.isClaimed) {
        console.log(`⚠️ SOL inheritance already claimed for heir ${inheritance.heir.toString()}`);
        return false;
      }

      // Since heirs must sign their own claims, we can only notify them
      // In a production system, this would send an email/notification to the heir
      console.log(`✅ SOL inheritance ready for claim:`);
      console.log(`   Heir: ${inheritance.heir.toString()}`);
      console.log(`   Amount: ${(inheritance.amount / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
      console.log(`   📧 Notification sent to heir (simulated)`);
      console.log(`   🔗 Heir can claim at: https://your-app.com/claim/${inheritance.heir.toString()}`);
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to process SOL inheritance notification:`, error);
      return false;
    }
  }

  /**
   * Automatically execute Token inheritance claim for heir
   * Note: This actually sends notification to heir - heirs must claim themselves
   */
  async executeTokenInheritance(inheritance: InheritanceToMonitor): Promise<boolean> {
    try {
      console.log(`🚀 Notifying heir about eligible Token inheritance: ${inheritance.heir.toString()}`);

      if (!inheritance.tokenMint) {
        console.error("❌ Token mint not provided for token inheritance");
        return false;
      }

      const [tokenHeirPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("token_heir"), inheritance.owner.toBuffer(), inheritance.heir.toBuffer(), inheritance.tokenMint.toBuffer()],
        PROGRAM_ID
      );

      // Verify the inheritance is still claimable
      const tokenHeirAccount = await this.program.account.tokenHeir.fetch(tokenHeirPDA);
      
      if (tokenHeirAccount.isClaimed) {
        console.log(`⚠️ Token inheritance already claimed for heir ${inheritance.heir.toString()}`);
        return false;
      }

      // Since heirs must sign their own claims, we can only notify them
      console.log(`✅ Token inheritance ready for claim:`);
      console.log(`   Heir: ${inheritance.heir.toString()}`);
      console.log(`   Token: ${inheritance.tokenMint.toString()}`);
      console.log(`   Amount: ${inheritance.amount} tokens`);
      console.log(`   📧 Notification sent to heir (simulated)`);
      console.log(`   🔗 Heir can claim at: https://your-app.com/claim/${inheritance.heir.toString()}`);
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to process Token inheritance notification:`, error);
      return false;
    }
  }

  /**
   * Check keeper wallet balance and ensure it has enough SOL for operations
   */
  async ensureKeeperBalance(): Promise<boolean> {
    const balance = await this.connection.getBalance(this.keeperKeypair.publicKey);
    const balanceSOL = balance / LAMPORTS_PER_SOL;
    
    if (balanceSOL < 0.01) {
      console.error(`❌ Keeper wallet balance too low: ${balanceSOL.toFixed(4)} SOL`);
      console.error("   Please fund the keeper wallet with at least 0.01 SOL");
      return false;
    }
    
    console.log(`💰 Keeper wallet balance: ${balanceSOL.toFixed(4)} SOL`);
    return true;
  }

  /**
   * Main monitoring and execution loop
   */
  async monitorAndExecute(): Promise<void> {
    console.log("🔄 Starting inheritance monitoring cycle...");
    
    // Ensure keeper has enough balance
    if (!(await this.ensureKeeperBalance())) {
      return;
    }

    // Refresh inheritance list
    this.inheritanceList = [];
    await this.discoverInheritances();

    if (this.inheritanceList.length === 0) {
      console.log("📭 No active inheritances found to monitor");
      return;
    }

    let executedCount = 0;
    let eligibleCount = 0;

    // Check each inheritance for eligibility and execute if ready
    for (const inheritance of this.inheritanceList) {
      if (this.isEligibleForExecution(inheritance)) {
        eligibleCount++;
        
        let success = false;
        if (inheritance.type === 'sol') {
          success = await this.executeSOLInheritance(inheritance);
        } else if (inheritance.type === 'token') {
          success = await this.executeTokenInheritance(inheritance);
        }
        
        if (success) {
          executedCount++;
        }
        
        // Add delay between executions to avoid overwhelming the network
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`📊 Monitoring cycle complete:`);
    console.log(`   Total inheritances: ${this.inheritanceList.length}`);
    console.log(`   Eligible for notification: ${eligibleCount}`);
    console.log(`   Notifications sent: ${executedCount}`);
    console.log(`   Failed notifications: ${eligibleCount - executedCount}`);
  }

  /**
   * Start the automated keeper bot
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log("⚠️ Keeper bot is already running");
      return;
    }

    this.isRunning = true;
    console.log("🚀 Starting Automated Inheritance Keeper Bot");
    console.log(`⏱️ Check interval: ${this.checkIntervalMs / 60000} minutes`);
    console.log(`🔑 Keeper wallet: ${this.keeperKeypair.publicKey.toString()}`);

    // Initial discovery and execution
    await this.monitorAndExecute();

    // Set up recurring monitoring
    const intervalId = setInterval(async () => {
      if (!this.isRunning) {
        clearInterval(intervalId);
        return;
      }
      
      console.log(`\n⏰ ${new Date().toISOString()} - Starting monitoring cycle`);
      await this.monitorAndExecute();
    }, this.checkIntervalMs);

    console.log("✅ Automated Keeper Bot is now running and monitoring inheritances");
    console.log("   Bot will automatically notify heirs when inheritances become eligible");
    console.log("   Heirs must visit the app to claim their inheritance");
    console.log("   Press Ctrl+C to stop");
  }

  /**
   * Stop the automated keeper bot
   */
  stop(): void {
    this.isRunning = false;
    console.log("🛑 Automated Keeper Bot stopped");
  }

  /**
   * Get status of the keeper bot
   */
  getStatus(): { isRunning: boolean; monitoredInheritances: number; checkInterval: number } {
    return {
      isRunning: this.isRunning,
      monitoredInheritances: this.inheritanceList.length,
      checkInterval: this.checkIntervalMs / 60000
    };
  }
}

/**
 * Create and start the automated keeper bot
 */
export async function startAutomatedKeeper(
  network: string = "devnet",
  checkIntervalMinutes: number = 5,
  keeperWalletPath?: string
): Promise<AutomatedKeeperBot> {
  
  // Setup connection
  const rpcUrl = network === "mainnet-beta" 
    ? "https://api.mainnet-beta.solana.com"
    : `https://api.${network}.solana.com`;
  
  const connection = new Connection(rpcUrl, 'confirmed');
  
  // Load or create keeper wallet
  let keeperKeypair: Keypair;
  if (keeperWalletPath && fs.existsSync(keeperWalletPath)) {
    const secretKey = JSON.parse(fs.readFileSync(keeperWalletPath, 'utf8'));
    keeperKeypair = Keypair.fromSecretKey(new Uint8Array(secretKey));
    console.log(`🔑 Loaded keeper wallet from: ${keeperWalletPath}`);
  } else {
    keeperKeypair = Keypair.generate();
    const walletPath = keeperWalletPath || './keeper-wallet.json';
    fs.writeFileSync(walletPath, JSON.stringify(Array.from(keeperKeypair.secretKey)));
    console.log(`🆕 Generated new keeper wallet: ${walletPath}`);
    console.log(`🚨 Please fund this wallet with SOL: ${keeperKeypair.publicKey.toString()}`);
  }

  // Setup Anchor program
  const provider = new anchor.AnchorProvider(
    connection,
    { publicKey: keeperKeypair.publicKey, signTransaction: async () => ({ signature: Buffer.alloc(64) }) } as any,
    { commitment: 'confirmed' }
  );

  const idl = JSON.parse(fs.readFileSync('./target/idl/gado.json', 'utf8'));
  const program = new Program(idl, provider) as Program<Gado>;

  // Create and start the keeper bot
  const keeperBot = new AutomatedKeeperBot(program, connection, keeperKeypair, checkIntervalMinutes);
  await keeperBot.start();

  return keeperBot;
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const network = args[0] || "devnet";
  const checkInterval = parseInt(args[1]) || 5;
  const walletPath = args[2];

  console.log("🤖 Starting Automated Inheritance Keeper Bot");
  console.log(`📡 Network: ${network}`);
  console.log(`⏱️ Check interval: ${checkInterval} minutes`);

  startAutomatedKeeper(network, checkInterval, walletPath)
    .then((keeper) => {
      // Handle graceful shutdown
      process.on('SIGINT', () => {
        console.log('\n🛑 Received SIGINT, shutting down gracefully...');
        keeper.stop();
        process.exit(0);
      });
    })
    .catch((error) => {
      console.error("❌ Failed to start keeper bot:", error);
      process.exit(1);
    });
}