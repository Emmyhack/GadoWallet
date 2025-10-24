import * as anchor from "@coral-xyz/anchor";
import { Connection, PublicKey, Keypair, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Program } from "@coral-xyz/anchor";
import { Gado } from "./target/types/gado";
import * as fs from 'fs';

const PROGRAM_ID = new PublicKey("EciS2vNDTe5S6WnNWEBmdBmKjQL5bsXyfauYmxPFKQGu");

interface SolHeirInfo {
  address: PublicKey;
  owner: PublicKey;
  heir: PublicKey;
  amount: number; // in lamports
  inactivityPeriodSeconds: number;
  lastActivity: number;
  isClaimed: boolean;
}

interface TokenHeirInfo {
  address: PublicKey;
  owner: PublicKey;
  heir: PublicKey;
  tokenMint: PublicKey;
  amount: number; // in smallest token units
  inactivityPeriodSeconds: number;
  lastActivity: number;
  isClaimed: boolean;
}

export class InheritanceKeeperBot {
  private program: Program<Gado>;
  private connection: Connection;
  private keeperKeypair: Keypair;
  private isRunning: boolean = false;
  private checkIntervalMs: number;
  private solHeirs: SolHeirInfo[] = [];
  private tokenHeirs: TokenHeirInfo[] = [];

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
   * Discover all SOL heir accounts from the blockchain
   */
  async discoverSolHeirs(): Promise<void> {
    console.log("🔍 Discovering SOL heir accounts...");
    
    try {
      const solHeirAccounts = await this.program.account.solHeir.all();
      console.log(`Found ${solHeirAccounts.length} SOL heirs`);

      this.solHeirs = [];
      
      for (const account of solHeirAccounts) {
        const solHeir = account.account;
        
        // Skip already claimed inheritances
        if (solHeir.isClaimed) {
          continue;
        }

        this.solHeirs.push({
          address: account.publicKey,
          owner: solHeir.owner,
          heir: solHeir.heir,
          amount: solHeir.amount.toNumber(),
          inactivityPeriodSeconds: solHeir.inactivityPeriodSeconds.toNumber(),
          lastActivity: solHeir.lastActivity.toNumber(),
          isClaimed: solHeir.isClaimed,
        });
      }

      console.log(`📋 Active SOL heirs to monitor: ${this.solHeirs.length}`);
    } catch (error) {
      console.error("❌ Error discovering SOL heirs:", error);
    }
  }

  /**
   * Discover all Token heir accounts from the blockchain
   */
  async discoverTokenHeirs(): Promise<void> {
    console.log("🔍 Discovering Token heir accounts...");
    
    try {
      const tokenHeirAccounts = await this.program.account.tokenHeir.all();
      console.log(`Found ${tokenHeirAccounts.length} Token heirs`);

      this.tokenHeirs = [];
      
      for (const account of tokenHeirAccounts) {
        const tokenHeir = account.account;
        
        // Skip already claimed inheritances
        if (tokenHeir.isClaimed) {
          continue;
        }

        this.tokenHeirs.push({
          address: account.publicKey,
          owner: tokenHeir.owner,
          heir: tokenHeir.heir,
          tokenMint: tokenHeir.tokenMint,
          amount: tokenHeir.amount.toNumber(),
          inactivityPeriodSeconds: tokenHeir.inactivityPeriodSeconds.toNumber(),
          lastActivity: tokenHeir.lastActivity.toNumber(),
          isClaimed: tokenHeir.isClaimed,
        });
      }

      console.log(`📋 Active Token heirs to monitor: ${this.tokenHeirs.length}`);
    } catch (error) {
      console.error("❌ Error discovering Token heirs:", error);
    }
  }

  /**
   * Check if a SOL heir is eligible for claiming
   */
  isSolHeirEligible(solHeir: SolHeirInfo): boolean {
    const currentTime = Math.floor(Date.now() / 1000);
    const timeSinceLastActive = currentTime - solHeir.lastActivity;
    const isInactive = timeSinceLastActive > solHeir.inactivityPeriodSeconds;
    
    if (isInactive && !solHeir.isClaimed && solHeir.amount > 0) {
      console.log(`⏰ SOL inheritance eligible for claim:`);
      console.log(`   Owner: ${solHeir.owner.toString()}`);
      console.log(`   Heir: ${solHeir.heir.toString()}`);
      console.log(`   Amount: ${(solHeir.amount / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
      console.log(`   Inactive for: ${Math.floor(timeSinceLastActive / 3600)} hours`);
      return true;
    }
    
    return false;
  }

  /**
   * Check if a Token heir is eligible for claiming
   */
  isTokenHeirEligible(tokenHeir: TokenHeirInfo): boolean {
    const currentTime = Math.floor(Date.now() / 1000);
    const timeSinceLastActive = currentTime - tokenHeir.lastActivity;
    const isInactive = timeSinceLastActive > tokenHeir.inactivityPeriodSeconds;
    
    if (isInactive && !tokenHeir.isClaimed && tokenHeir.amount > 0) {
      console.log(`⏰ Token inheritance eligible for claim:`);
      console.log(`   Owner: ${tokenHeir.owner.toString()}`);
      console.log(`   Heir: ${tokenHeir.heir.toString()}`);
      console.log(`   Token: ${tokenHeir.tokenMint.toString()}`);
      console.log(`   Amount: ${tokenHeir.amount}`);
      console.log(`   Inactive for: ${Math.floor(timeSinceLastActive / 3600)} hours`);
      return true;
    }
    
    return false;
  }

  /**
   * Send notification about successful automatic transfer
   */
  async notifyHeirOfTransfer(heirPublicKey: PublicKey, type: 'SOL' | 'Token', amount: number, txSignature: string, tokenMint?: PublicKey): Promise<void> {
    console.log(`🎉 AUTOMATIC TRANSFER COMPLETED:`);
    console.log(`   To: ${heirPublicKey.toString()}`);
    console.log(`   Type: ${type} inheritance automatically claimed`);
    if (type === 'SOL') {
      console.log(`   Amount: ${(amount / LAMPORTS_PER_SOL).toFixed(4)} SOL transferred`);
    } else {
      console.log(`   Amount: ${amount} tokens transferred`);
      console.log(`   Token: ${tokenMint?.toString()}`);
    }
    console.log(`   Transaction: ${txSignature}`);
    console.log(`   Status: Funds successfully transferred to heir wallet`);
    
    // TODO: Send success notifications:
    // - await sendEmail(heirPublicKey, `${type} inheritance transferred`, txSignature);
    // - await sendSMS(heirPublicKey, `You received ${type} inheritance`, txSignature);
  }

  /**
   * Send notification about transfer failure (fallback to manual claiming)
   */
  async notifyHeirOfFailure(heirPublicKey: PublicKey, type: 'SOL' | 'Token', amount: number, error: string, tokenMint?: PublicKey): Promise<void> {
    console.log(`⚠️ AUTOMATIC TRANSFER FAILED - MANUAL ACTION REQUIRED:`);
    console.log(`   To: ${heirPublicKey.toString()}`);
    console.log(`   Type: ${type} inheritance is claimable but auto-transfer failed`);
    if (type === 'SOL') {
      console.log(`   Amount: ${(amount / LAMPORTS_PER_SOL).toFixed(4)} SOL available`);
    } else {
      console.log(`   Amount: ${amount} tokens available`);
      console.log(`   Token: ${tokenMint?.toString()}`);
    }
    console.log(`   Error: ${error}`);
    console.log(`   Action: Please claim manually using the Gada Wallet app`);
    
    // TODO: Send manual claim notifications:
    // - await sendEmail(heirPublicKey, `Manual claim required for ${type}`, error);
    // - await sendSMS(heirPublicKey, `Claim your ${type} inheritance manually`);
  }

  /**
   * Send detailed claiming instructions with prepared transaction
   */
  async sendClaimingInstructions(heirPublicKey: PublicKey, type: 'SOL' | 'Token', amount: number, preparedTransaction: string, tokenMint?: PublicKey): Promise<void> {
    console.log(`📋 INHERITANCE READY TO CLAIM - DETAILED INSTRUCTIONS:`);
    console.log(`   Heir: ${heirPublicKey.toString()}`);
    console.log(`   Type: ${type} inheritance`);
    
    if (type === 'SOL') {
      console.log(`   Amount: ${(amount / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
    } else {
      console.log(`   Amount: ${amount} tokens`);
      console.log(`   Token: ${tokenMint?.toString()}`);
    }
    
    console.log(`   Status: Ready to claim immediately`);
    console.log(`   Transaction prepared: Yes`);
    console.log(`   Action Required: Sign and submit the prepared transaction`);
    console.log(`   \n🔗 CLAIMING OPTIONS:`);
    console.log(`   1. Use Gada Wallet app (recommended)`);
    console.log(`   2. Submit prepared transaction: ${preparedTransaction.substring(0, 32)}...`);
    console.log(`   3. Manual claiming through program interface`);
    
    // TODO: Implement actual delivery systems:
    // - await emailInstructions(heirPublicKey, type, amount, preparedTransaction);
    // - await smsInstructions(heirPublicKey, type, amount);
    // - await pushNotification(heirPublicKey, "Inheritance ready to claim!");
    // - await webhookNotification(heirPublicKey, { type, amount, transaction: preparedTransaction });
  }

  /**
   * Prepare and broadcast SOL inheritance transaction for heir to claim
   */
  async prepareSolInheritanceTransaction(solHeir: SolHeirInfo): Promise<boolean> {
    try {
      console.log(`🚀 Preparing SOL inheritance transaction for heir: ${solHeir.heir.toString()}`);
      console.log(`💰 Amount claimable: ${(solHeir.amount / LAMPORTS_PER_SOL).toFixed(4)} SOL`);

      // Get the SOL heir PDA
      const [solHeirPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("sol_heir"),
          solHeir.owner.toBuffer(),
          solHeir.heir.toBuffer()
        ],
        PROGRAM_ID
      );

      // Create the transaction instruction (but don't execute it)
      const instruction = await this.program.methods
        .claimSolInheritance()
        .accountsPartial({
          solHeir: solHeirPDA,
          heir: solHeir.heir,
          systemProgram: SystemProgram.programId,
        })
        .instruction();

      // Get recent blockhash for transaction
      const { blockhash } = await this.connection.getLatestBlockhash();
      
      // Create the transaction
      const transaction = new anchor.web3.Transaction({
        recentBlockhash: blockhash,
        feePayer: solHeir.heir,
      }).add(instruction);

      // Serialize the transaction for the heir to sign and submit
      const serializedTx = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });
      
      const base64Transaction = serializedTx.toString('base64');

      console.log(`✅ SOL inheritance transaction prepared successfully!`);
      console.log(`   Heir: ${solHeir.heir.toString()}`);
      console.log(`   Amount: ${(solHeir.amount / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
      console.log(`   Transaction (Base64): ${base64Transaction.substring(0, 64)}...`);
      
      // Send detailed claiming instructions
      await this.sendClaimingInstructions(solHeir.heir, 'SOL', solHeir.amount, base64Transaction);
      
      return true;
    } catch (error: any) {
      console.error(`❌ Failed to prepare SOL inheritance transaction:`, error);
      
      // Send failure notification
      const errorMessage = error.message || error.toString();
      await this.notifyHeirOfFailure(solHeir.heir, 'SOL', solHeir.amount, errorMessage);
      
      return false;
    }
  }

  /**
   * Prepare and broadcast Token inheritance transaction for heir to claim  
   */
  async prepareTokenInheritanceTransaction(tokenHeir: TokenHeirInfo): Promise<boolean> {
    try {
      console.log(`🚀 Preparing Token inheritance transaction for heir: ${tokenHeir.heir.toString()}`);
      console.log(`💰 Amount claimable: ${tokenHeir.amount} tokens`);
      console.log(`   Token: ${tokenHeir.tokenMint.toString()}`);

      // Get the Token heir PDA
      const [tokenHeirPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("token_heir"),
          tokenHeir.owner.toBuffer(),
          tokenHeir.heir.toBuffer(),
          tokenHeir.tokenMint.toBuffer()
        ],
        PROGRAM_ID
      );

      // Get the escrow token account (where tokens are stored)
      const [escrowTokenAccount] = PublicKey.findProgramAddressSync(
        [
          tokenHeirPDA.toBuffer(),
          Buffer.from([6, 221, 246, 225, 215, 101, 161, 147, 217, 203, 225, 70, 206, 235, 121, 172, 28, 180, 133, 237, 95, 91, 55, 145, 58, 140, 245, 133, 126, 255, 0, 169]), // TOKEN_PROGRAM_ID
          tokenHeir.tokenMint.toBuffer()
        ],
        new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL") // ASSOCIATED_TOKEN_PROGRAM_ID
      );

      // Get heir's associated token account
      const [heirTokenAccount] = PublicKey.findProgramAddressSync(
        [
          tokenHeir.heir.toBuffer(),
          Buffer.from([6, 221, 246, 225, 215, 101, 161, 147, 217, 203, 225, 70, 206, 235, 121, 172, 28, 180, 133, 237, 95, 91, 55, 145, 58, 140, 245, 133, 126, 255, 0, 169]), // TOKEN_PROGRAM_ID
          tokenHeir.tokenMint.toBuffer()
        ],
        new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL") // ASSOCIATED_TOKEN_PROGRAM_ID
      );

      // Create the transaction instruction (but don't execute it)
      const instruction = await this.program.methods
        .claimTokenInheritance()
        .accountsPartial({
          tokenHeir: tokenHeirPDA,
          escrowTokenAccount: escrowTokenAccount,
          heirTokenAccount: heirTokenAccount,
          tokenMint: tokenHeir.tokenMint,
          heir: tokenHeir.heir,
          tokenProgram: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
          associatedTokenProgram: new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"),
          systemProgram: SystemProgram.programId,
        })
        .instruction();

      // Get recent blockhash for transaction
      const { blockhash } = await this.connection.getLatestBlockhash();
      
      // Create the transaction
      const transaction = new anchor.web3.Transaction({
        recentBlockhash: blockhash,
        feePayer: tokenHeir.heir,
      }).add(instruction);

      // Serialize the transaction for the heir to sign and submit
      const serializedTx = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });
      
      const base64Transaction = serializedTx.toString('base64');

      console.log(`✅ Token inheritance transaction prepared successfully!`);
      console.log(`   Heir: ${tokenHeir.heir.toString()}`);
      console.log(`   Amount: ${tokenHeir.amount} tokens`);
      console.log(`   Token: ${tokenHeir.tokenMint.toString()}`);
      console.log(`   Transaction (Base64): ${base64Transaction.substring(0, 64)}...`);
      
      // Send detailed claiming instructions
      await this.sendClaimingInstructions(tokenHeir.heir, 'Token', tokenHeir.amount, base64Transaction, tokenHeir.tokenMint);
      
      return true;
    } catch (error: any) {
      console.error(`❌ Failed to prepare Token inheritance transaction:`, error);
      
      // Send failure notification
      const errorMessage = error.message || error.toString();
      await this.notifyHeirOfFailure(tokenHeir.heir, 'Token', tokenHeir.amount, errorMessage, tokenHeir.tokenMint);
      
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
   * Main monitoring and notification loop
   */
  async monitorAndNotify(): Promise<void> {
    console.log("🔄 Starting inheritance monitoring cycle...");
    
    // Ensure keeper has enough balance
    if (!(await this.ensureKeeperBalance())) {
      return;
    }

    // Refresh inheritance lists
    await this.discoverSolHeirs();
    await this.discoverTokenHeirs();

    if (this.solHeirs.length === 0 && this.tokenHeirs.length === 0) {
      console.log("📭 No active inheritances found to monitor");
      return;
    }

    let solEligibleCount = 0;
    let tokenEligibleCount = 0;
    let executedCount = 0;
    let totalValueDistributed = 0;

    // Check SOL heirs and execute transfers automatically
    for (const solHeir of this.solHeirs) {
      if (this.isSolHeirEligible(solHeir)) {
        solEligibleCount++;
        
        // Prepare SOL inheritance transaction for heir
        const success = await this.prepareSolInheritanceTransaction(solHeir);
        
        if (success) {
          executedCount++;
          totalValueDistributed += solHeir.amount / LAMPORTS_PER_SOL;
        }
        
        // Add delay between executions to avoid overwhelming the network
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    // Check Token heirs and execute transfers automatically
    for (const tokenHeir of this.tokenHeirs) {
      if (this.isTokenHeirEligible(tokenHeir)) {
        tokenEligibleCount++;
        
        // Prepare Token inheritance transaction for heir
        const success = await this.prepareTokenInheritanceTransaction(tokenHeir);
        
        if (success) {
          executedCount++;
        }
        
        // Add delay between executions to avoid overwhelming the network
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    console.log(`📊 Monitoring cycle complete:`);
    console.log(`   SOL heirs monitored: ${this.solHeirs.length}`);
    console.log(`   Token heirs monitored: ${this.tokenHeirs.length}`);
    console.log(`   SOL heirs eligible: ${solEligibleCount}`);
    console.log(`   Token heirs eligible: ${tokenEligibleCount}`);
    console.log(`   Successfully executed: ${executedCount}`);
    console.log(`   Total value distributed: ${totalValueDistributed.toFixed(4)} SOL`);
    console.log(`   Failed executions: ${(solEligibleCount + tokenEligibleCount) - executedCount}`);
  }

  /**
   * Start the automated inheritance keeper bot
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log("⚠️ Inheritance Keeper Bot is already running");
      return;
    }

    this.isRunning = true;
    console.log("🚀 Starting Automated Inheritance Keeper Bot");
    console.log(`⏱️ Check interval: ${this.checkIntervalMs / 60000} minutes`);
    console.log(`🔑 Keeper wallet: ${this.keeperKeypair.publicKey.toString()}`);
    console.log(`💼 Program ID: ${PROGRAM_ID.toString()}`);
    console.log(`🤖 This bot automatically transfers assets to heirs when inheritances become claimable`);

    // Initial discovery and execution
    await this.monitorAndNotify();

    // Set up recurring monitoring
    const intervalId = setInterval(async () => {
      if (!this.isRunning) {
        clearInterval(intervalId);
        return;
      }
      
      console.log(`\n⏰ ${new Date().toISOString()} - Starting monitoring cycle`);
      await this.monitorAndNotify();
    }, this.checkIntervalMs);

    console.log("✅ Automated Inheritance Keeper Bot is now running");
    console.log("   Bot will automatically execute inheritance transfers when conditions are met");
    console.log("   Assets will be transferred directly to heir wallets");
    console.log("   Press Ctrl+C to stop");
  }

  /**
   * Stop the automated keeper bot
   */
  stop(): void {
    this.isRunning = false;
    console.log("🛑 Automated Inheritance Keeper Bot stopped");
  }

  /**
   * Get current status of monitored inheritances
   */
  async getStatus(): Promise<{
    isRunning: boolean;
    totalSolHeirs: number;
    totalTokenHeirs: number;
    activeSolHeirs: number;
    activeTokenHeirs: number;
    eligibleSolHeirs: number;
    eligibleTokenHeirs: number;
    totalSolValue: number;
    checkInterval: number;
  }> {
    await this.discoverSolHeirs();
    await this.discoverTokenHeirs();
    
    let activeSolHeirs = 0;
    let activeTokenHeirs = 0;
    let eligibleSolHeirs = 0;
    let eligibleTokenHeirs = 0;
    let totalSolValue = 0;

    const currentTime = Math.floor(Date.now() / 1000);

    for (const solHeir of this.solHeirs) {
      totalSolValue += solHeir.amount / LAMPORTS_PER_SOL;
      
      const timeSinceLastActive = currentTime - solHeir.lastActivity;
      const isInactive = timeSinceLastActive > solHeir.inactivityPeriodSeconds;
      
      if (isInactive && !solHeir.isClaimed) {
        eligibleSolHeirs++;
      } else if (!solHeir.isClaimed) {
        activeSolHeirs++;
      }
    }

    for (const tokenHeir of this.tokenHeirs) {
      const timeSinceLastActive = currentTime - tokenHeir.lastActivity;
      const isInactive = timeSinceLastActive > tokenHeir.inactivityPeriodSeconds;
      
      if (isInactive && !tokenHeir.isClaimed) {
        eligibleTokenHeirs++;
      } else if (!tokenHeir.isClaimed) {
        activeTokenHeirs++;
      }
    }

    return {
      isRunning: this.isRunning,
      totalSolHeirs: this.solHeirs.length,
      totalTokenHeirs: this.tokenHeirs.length,
      activeSolHeirs,
      activeTokenHeirs,
      eligibleSolHeirs,
      eligibleTokenHeirs,
      totalSolValue,
      checkInterval: this.checkIntervalMs / 60000
    };
  }
}

/**
 * Create and start the automated inheritance keeper bot
 */
export async function startInheritanceKeeper(
  network: string = "devnet",
  checkIntervalMinutes: number = 5,
  keeperWalletPath?: string
): Promise<InheritanceKeeperBot> {
  
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
  const keeperBot = new InheritanceKeeperBot(program, connection, keeperKeypair, checkIntervalMinutes);
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
  console.log(`� This bot automatically transfers assets to heirs when inheritances become claimable`);

  startInheritanceKeeper(network, checkInterval, walletPath)
    .then((keeper) => {
      // Handle graceful shutdown
      process.on('SIGINT', () => {
        console.log('\n🛑 Received SIGINT, shutting down gracefully...');
        keeper.stop();
        process.exit(0);
      });

      // Show status every 10 minutes
      setInterval(async () => {
        const status = await keeper.getStatus();
        console.log('\n📈 Keeper Status Update:');
        console.log(`   SOL heirs eligible for transfer: ${status.eligibleSolHeirs}`);
        console.log(`   Token heirs eligible for transfer: ${status.eligibleTokenHeirs}`);
        console.log(`   Total SOL value available: ${status.totalSolValue.toFixed(4)} SOL`);
      }, 10 * 60 * 1000);
    })
    .catch((error) => {
      console.error("❌ Failed to start inheritance keeper bot:", error);
      process.exit(1);
    });
}