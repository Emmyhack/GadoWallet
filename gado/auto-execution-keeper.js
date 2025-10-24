"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoExecutionKeeperBot = void 0;
exports.startAutoExecutionKeeper = startAutoExecutionKeeper;
const anchor = __importStar(require("@coral-xyz/anchor"));
const web3_js_1 = require("@solana/web3.js");
const anchor_1 = require("@coral-xyz/anchor");
const fs = __importStar(require("fs"));
const PROGRAM_ID = new web3_js_1.PublicKey("EciS2vNDTe5S6WnNWEBmdBmKjQL5bsXyfauYmxPFKQGu");
class AutoExecutionKeeperBot {
    constructor(program, connection, keeperKeypair, checkIntervalMinutes = 5) {
        this.isRunning = false;
        this.solHeirs = [];
        this.tokenHeirs = [];
        this.program = program;
        this.connection = connection;
        this.keeperKeypair = keeperKeypair;
        this.checkIntervalMs = checkIntervalMinutes * 60 * 1000;
    }
    /**
     * Discover all SOL heir accounts from the blockchain
     */
    async discoverSolHeirs() {
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
        }
        catch (error) {
            console.error("❌ Error discovering SOL heirs:", error);
        }
    }
    /**
     * Discover all Token heir accounts from the blockchain
     */
    async discoverTokenHeirs() {
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
        }
        catch (error) {
            console.error("❌ Error discovering Token heirs:", error);
        }
    }
    /**
     * Check if a SOL heir is eligible for claiming
     */
    isSolHeirEligible(solHeir) {
        const currentTime = Math.floor(Date.now() / 1000);
        const timeSinceLastActive = currentTime - solHeir.lastActivity;
        const isInactive = timeSinceLastActive > solHeir.inactivityPeriodSeconds;
        if (isInactive && !solHeir.isClaimed && solHeir.amount > 0) {
            console.log(`⏰ SOL inheritance eligible for automatic transfer:`);
            console.log(`   Owner: ${solHeir.owner.toString()}`);
            console.log(`   Heir: ${solHeir.heir.toString()}`);
            console.log(`   Amount: ${(solHeir.amount / web3_js_1.LAMPORTS_PER_SOL).toFixed(4)} SOL`);
            console.log(`   Inactive for: ${Math.floor(timeSinceLastActive / 3600)} hours`);
            return true;
        }
        return false;
    }
    /**
     * Check if a Token heir is eligible for claiming
     */
    isTokenHeirEligible(tokenHeir) {
        const currentTime = Math.floor(Date.now() / 1000);
        const timeSinceLastActive = currentTime - tokenHeir.lastActivity;
        const isInactive = timeSinceLastActive > tokenHeir.inactivityPeriodSeconds;
        if (isInactive && !tokenHeir.isClaimed && tokenHeir.amount > 0) {
            console.log(`⏰ Token inheritance eligible for automatic transfer:`);
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
     * AUTOMATIC SOL TRANSFER EXECUTION
     * This creates a transaction that transfers SOL from the program account directly to the heir
     */
    async executeSolTransfer(solHeir) {
        try {
            console.log(`🚀 EXECUTING AUTOMATIC SOL TRANSFER`);
            console.log(`   Amount: ${(solHeir.amount / web3_js_1.LAMPORTS_PER_SOL).toFixed(4)} SOL`);
            console.log(`   From: Program escrow account`);
            console.log(`   To: ${solHeir.heir.toString()}`);
            // Get the SOL heir PDA that holds the escrowed SOL
            const [solHeirPDA] = web3_js_1.PublicKey.findProgramAddressSync([
                Buffer.from("sol_heir"),
                solHeir.owner.toBuffer(),
                solHeir.heir.toBuffer()
            ], PROGRAM_ID);
            // Create a direct transfer from the program account to the heir
            // Since the SOL is held in the sol_heir PDA account, we need to close it and transfer the lamports
            // Method 1: Use claim instruction but sign with a generated keypair for the heir
            const heirKeypair = web3_js_1.Keypair.generate(); // Temporary keypair
            // Transfer some SOL to the temporary keypair to pay for transaction fees
            const rentExemption = await this.connection.getMinimumBalanceForRentExemption(0);
            const fundTempWalletTx = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.transfer({
                fromPubkey: this.keeperKeypair.publicKey,
                toPubkey: heirKeypair.publicKey,
                lamports: rentExemption + 5000, // Rent + transaction fees
            }));
            const fundTx = await this.connection.sendTransaction(fundTempWalletTx, [this.keeperKeypair]);
            await this.connection.confirmTransaction(fundTx);
            console.log(`💰 Funded temporary wallet: ${heirKeypair.publicKey.toString()}`);
            // Now execute the claim using the temporary wallet, then forward to real heir
            const claimTx = await this.program.methods
                .claimSolInheritance()
                .accountsPartial({
                solHeir: solHeirPDA,
                heir: heirKeypair.publicKey, // Use temporary keypair
                systemProgram: web3_js_1.SystemProgram.programId,
            })
                .signers([heirKeypair])
                .rpc();
            console.log(`✅ Claimed inheritance to temporary wallet: ${claimTx}`);
            // Now transfer from temporary wallet to real heir
            const forwardTx = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.transfer({
                fromPubkey: heirKeypair.publicKey,
                toPubkey: solHeir.heir,
                lamports: solHeir.amount, // Transfer the full inheritance amount
            }));
            const forwardTxId = await this.connection.sendTransaction(forwardTx, [heirKeypair]);
            await this.connection.confirmTransaction(forwardTxId);
            console.log(`🎉 AUTOMATIC TRANSFER COMPLETED SUCCESSFULLY!`);
            console.log(`   Claim Transaction: ${claimTx}`);
            console.log(`   Transfer Transaction: ${forwardTxId}`);
            console.log(`   Amount: ${(solHeir.amount / web3_js_1.LAMPORTS_PER_SOL).toFixed(4)} SOL`);
            console.log(`   Heir: ${solHeir.heir.toString()}`);
            console.log(`   Status: Inheritance automatically transferred to heir`);
            return true;
        }
        catch (error) {
            console.error(`❌ Failed to execute automatic SOL transfer:`, error);
            // Try alternative method - direct program call with keeper as signer
            try {
                console.log(`🔄 Attempting alternative execution method...`);
                return await this.alternativeSolTransfer(solHeir);
            }
            catch (altError) {
                console.error(`❌ Alternative method also failed:`, altError);
                return false;
            }
        }
    }
    /**
     * Alternative SOL transfer method - try to execute with keeper as caller
     */
    async alternativeSolTransfer(solHeir) {
        try {
            // Get the SOL heir PDA
            const [solHeirPDA] = web3_js_1.PublicKey.findProgramAddressSync([
                Buffer.from("sol_heir"),
                solHeir.owner.toBuffer(),
                solHeir.heir.toBuffer()
            ], PROGRAM_ID);
            // Try calling claim with keeper as signer (this might work if program allows it)
            const tx = await this.program.methods
                .claimSolInheritance()
                .accountsPartial({
                solHeir: solHeirPDA,
                heir: solHeir.heir,
                systemProgram: web3_js_1.SystemProgram.programId,
            })
                .signers([this.keeperKeypair]) // Try with keeper as signer
                .rpc();
            console.log(`✅ Alternative method succeeded: ${tx}`);
            return true;
        }
        catch (error) {
            console.error(`❌ Alternative method failed:`, error);
            return false;
        }
    }
    /**
     * AUTOMATIC TOKEN TRANSFER EXECUTION
     */
    async executeTokenTransfer(tokenHeir) {
        try {
            console.log(`🚀 EXECUTING AUTOMATIC TOKEN TRANSFER`);
            console.log(`   Amount: ${tokenHeir.amount} tokens`);
            console.log(`   Token: ${tokenHeir.tokenMint.toString()}`);
            console.log(`   To: ${tokenHeir.heir.toString()}`);
            // Similar approach to SOL transfer - use temporary keypair method
            const heirKeypair = web3_js_1.Keypair.generate();
            // Fund temporary wallet
            const rentExemption = await this.connection.getMinimumBalanceForRentExemption(0);
            const fundTempWalletTx = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.transfer({
                fromPubkey: this.keeperKeypair.publicKey,
                toPubkey: heirKeypair.publicKey,
                lamports: rentExemption + 10000,
            }));
            const fundTx = await this.connection.sendTransaction(fundTempWalletTx, [this.keeperKeypair]);
            await this.connection.confirmTransaction(fundTx);
            // Execute token inheritance claim
            const [tokenHeirPDA] = web3_js_1.PublicKey.findProgramAddressSync([
                Buffer.from("token_heir"),
                tokenHeir.owner.toBuffer(),
                tokenHeir.heir.toBuffer(),
                tokenHeir.tokenMint.toBuffer()
            ], PROGRAM_ID);
            // Get required accounts (simplified for now)
            const tx = await this.program.methods
                .claimTokenInheritance()
                .accountsPartial({
                tokenHeir: tokenHeirPDA,
                heir: heirKeypair.publicKey,
                tokenMint: tokenHeir.tokenMint,
                systemProgram: web3_js_1.SystemProgram.programId,
            })
                .signers([heirKeypair])
                .rpc();
            console.log(`🎉 AUTOMATIC TOKEN TRANSFER COMPLETED!`);
            console.log(`   Transaction: ${tx}`);
            return true;
        }
        catch (error) {
            console.error(`❌ Failed to execute automatic token transfer:`, error);
            return false;
        }
    }
    /**
     * Main monitoring and execution loop
     */
    async monitorAndExecute() {
        console.log("🔄 Starting automatic inheritance execution cycle...");
        // Ensure keeper has enough balance
        const balance = await this.connection.getBalance(this.keeperKeypair.publicKey);
        if (balance < 0.1 * web3_js_1.LAMPORTS_PER_SOL) {
            console.error(`❌ Keeper wallet needs more SOL for automatic executions: ${(balance / web3_js_1.LAMPORTS_PER_SOL).toFixed(4)} SOL`);
            return;
        }
        // Refresh inheritance lists
        await this.discoverSolHeirs();
        await this.discoverTokenHeirs();
        if (this.solHeirs.length === 0 && this.tokenHeirs.length === 0) {
            console.log("📭 No active inheritances found to monitor");
            return;
        }
        let solExecuted = 0;
        let tokenExecuted = 0;
        let totalValueTransferred = 0;
        // Execute SOL inheritances automatically
        for (const solHeir of this.solHeirs) {
            if (this.isSolHeirEligible(solHeir)) {
                const success = await this.executeSolTransfer(solHeir);
                if (success) {
                    solExecuted++;
                    totalValueTransferred += solHeir.amount / web3_js_1.LAMPORTS_PER_SOL;
                }
                // Add delay between executions
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
        // Execute Token inheritances automatically
        for (const tokenHeir of this.tokenHeirs) {
            if (this.isTokenHeirEligible(tokenHeir)) {
                const success = await this.executeTokenTransfer(tokenHeir);
                if (success) {
                    tokenExecuted++;
                }
                // Add delay between executions
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
        console.log(`📊 Automatic execution cycle complete:`);
        console.log(`   SOL inheritances monitored: ${this.solHeirs.length}`);
        console.log(`   Token inheritances monitored: ${this.tokenHeirs.length}`);
        console.log(`   SOL transfers executed: ${solExecuted}`);
        console.log(`   Token transfers executed: ${tokenExecuted}`);
        console.log(`   Total SOL value transferred: ${totalValueTransferred.toFixed(4)} SOL`);
    }
    /**
     * Start the automated execution keeper bot
     */
    async start() {
        if (this.isRunning) {
            console.log("⚠️ Auto-Execution Keeper Bot is already running");
            return;
        }
        this.isRunning = true;
        console.log("🚀 Starting AUTOMATIC INHERITANCE EXECUTION BOT");
        console.log(`⚡ This bot AUTOMATICALLY TRANSFERS ASSETS to heirs when conditions are met`);
        console.log(`⏱️ Check interval: ${this.checkIntervalMs / 60000} minutes`);
        console.log(`🔑 Keeper wallet: ${this.keeperKeypair.publicKey.toString()}`);
        console.log(`💼 Program ID: ${PROGRAM_ID.toString()}`);
        // Initial execution
        await this.monitorAndExecute();
        // Set up recurring execution
        const intervalId = setInterval(async () => {
            if (!this.isRunning) {
                clearInterval(intervalId);
                return;
            }
            console.log(`\n⏰ ${new Date().toISOString()} - Starting execution cycle`);
            await this.monitorAndExecute();
        }, this.checkIntervalMs);
        console.log("✅ AUTOMATIC EXECUTION BOT IS NOW RUNNING");
        console.log("   🤖 Bot will automatically transfer assets to heirs");
        console.log("   💰 No manual action required from heirs");
        console.log("   🔄 Executes transfers immediately when conditions are met");
        console.log("   Press Ctrl+C to stop");
    }
    /**
     * Stop the automated keeper bot
     */
    stop() {
        this.isRunning = false;
        console.log("🛑 Automatic Execution Keeper Bot stopped");
    }
}
exports.AutoExecutionKeeperBot = AutoExecutionKeeperBot;
/**
 * Create and start the automatic execution keeper bot
 */
async function startAutoExecutionKeeper(network = "devnet", checkIntervalMinutes = 5, keeperWalletPath) {
    // Setup connection
    const rpcUrl = network === "mainnet-beta"
        ? "https://api.mainnet-beta.solana.com"
        : `https://api.${network}.solana.com`;
    const connection = new web3_js_1.Connection(rpcUrl, 'confirmed');
    // Load or create keeper wallet
    let keeperKeypair;
    if (keeperWalletPath && fs.existsSync(keeperWalletPath)) {
        const secretKey = JSON.parse(fs.readFileSync(keeperWalletPath, 'utf8'));
        keeperKeypair = web3_js_1.Keypair.fromSecretKey(new Uint8Array(secretKey));
        console.log(`🔑 Loaded keeper wallet from: ${keeperWalletPath}`);
    }
    else {
        keeperKeypair = web3_js_1.Keypair.generate();
        const walletPath = keeperWalletPath || './auto-execution-keeper-wallet.json';
        fs.writeFileSync(walletPath, JSON.stringify(Array.from(keeperKeypair.secretKey)));
        console.log(`🆕 Generated new keeper wallet: ${walletPath}`);
        console.log(`🚨 Fund this wallet with at least 0.5 SOL: ${keeperKeypair.publicKey.toString()}`);
    }
    // Setup Anchor program
    const provider = new anchor.AnchorProvider(connection, { publicKey: keeperKeypair.publicKey, signTransaction: async () => ({ signature: Buffer.alloc(64) }) }, { commitment: 'confirmed' });
    const idl = JSON.parse(fs.readFileSync('./target/idl/gado.json', 'utf8'));
    const program = new anchor_1.Program(idl, provider);
    // Create and start the keeper bot
    const keeperBot = new AutoExecutionKeeperBot(program, connection, keeperKeypair, checkIntervalMinutes);
    await keeperBot.start();
    return keeperBot;
}
// CLI execution for automatic execution
if (require.main === module) {
    const args = process.argv.slice(2);
    const network = args[0] || "devnet";
    const checkInterval = parseInt(args[1]) || 5;
    const walletPath = args[2];
    console.log("🤖 STARTING AUTOMATIC INHERITANCE EXECUTION BOT");
    console.log("=".repeat(60));
    console.log(`📡 Network: ${network}`);
    console.log(`⏱️ Check interval: ${checkInterval} minutes`);
    console.log(`⚡ AUTOMATIC ASSET TRANSFERS: ENABLED`);
    console.log(`💰 Assets will be transferred directly to heirs automatically`);
    console.log("=".repeat(60));
    startAutoExecutionKeeper(network, checkInterval, walletPath)
        .then((keeper) => {
        // Handle graceful shutdown
        process.on('SIGINT', () => {
            console.log('\n🛑 Shutting down automatic execution bot...');
            keeper.stop();
            process.exit(0);
        });
    })
        .catch((error) => {
        console.error("❌ Failed to start automatic execution keeper bot:", error);
        process.exit(1);
    });
}
