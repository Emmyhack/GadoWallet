const anchor = require("@coral-xyz/anchor");
const { Program, AnchorProvider, Wallet } = require("@coral-xyz/anchor");
const { 
  Connection, 
  Keypair, 
  clusterApiUrl,
  LAMPORTS_PER_SOL,
  PublicKey 
} = require("@solana/web3.js");

/**
 * Simple Keeper Bot for testing (CommonJS version)
 */
class SimpleKeeperBot {
  constructor(program, connection, keeperWallet) {
    this.program = program;
    this.connection = connection;
    this.keeperWallet = keeperWallet;
  }

  async getSmartWallet(ownerPublicKey) {
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

  async isOwnerInactive(ownerPublicKey) {
    const smartWallet = await this.getSmartWallet(ownerPublicKey);
    if (!smartWallet) return false;

    const currentTime = Math.floor(Date.now() / 1000);
    const timeSinceLastActivity = currentTime - smartWallet.data.lastActiveTime.toNumber();
    const inactivityPeriod = smartWallet.data.inactivityPeriodSeconds.toNumber();

    console.log(`   ⏰ Current time: ${new Date(currentTime * 1000).toISOString()}`);
    console.log(`   ⏰ Last activity: ${new Date(smartWallet.data.lastActiveTime.toNumber() * 1000).toISOString()}`);
    console.log(`   ⏰ Time since activity: ${timeSinceLastActivity} seconds`);
    console.log(`   ⏰ Required inactivity: ${inactivityPeriod} seconds`);
    console.log(`   ⏰ Days since activity: ${(timeSinceLastActivity / 86400).toFixed(2)} days`);
    console.log(`   ⏰ Required days: ${(inactivityPeriod / 86400).toFixed(2)} days`);

    return timeSinceLastActivity > inactivityPeriod;
  }

  async getSmartWalletBalance(ownerPublicKey) {
    const [smartWalletAssetPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("smart_wallet_pda"), ownerPublicKey.toBuffer()],
      this.program.programId
    );

    const balance = await this.connection.getBalance(smartWalletAssetPda);
    return balance / LAMPORTS_PER_SOL;
  }

  async checkAndExecuteInheritance(ownerPublicKey) {
    try {
      console.log(`🔍 Checking Smart Wallet for owner: ${ownerPublicKey.toString()}`);

      // Get Smart Wallet data
      const smartWallet = await this.getSmartWallet(ownerPublicKey);
      
      if (!smartWallet) {
        console.log("❌ Smart Wallet not found");
        return false;
      }

      console.log("✅ Smart Wallet found!");
      console.log(`   📋 Heirs: ${smartWallet.data.heirs.length}`);
      console.log(`   🔄 Executed: ${smartWallet.data.isExecuted}`);

      if (smartWallet.data.isExecuted) {
        console.log("✅ Inheritance already executed");
        return false;
      }

      // Check if owner is inactive
      console.log("⏰ Checking owner activity...");
      const isInactive = await this.isOwnerInactive(ownerPublicKey);
      
      if (!isInactive) {
        console.log("⏰ Owner is still active (not ready for inheritance)");
        return false;
      }

      // Get Smart Wallet balance
      const balance = await this.getSmartWalletBalance(ownerPublicKey);
      console.log(`💰 Smart Wallet balance: ${balance} SOL`);
      
      if (balance === 0) {
        console.log("💰 No assets to distribute");
        return false;
      }

      console.log(`💸 Found ${balance} SOL to distribute among ${smartWallet.data.heirs.length} heirs`);

      // In a real scenario, we would execute inheritance here
      console.log("🚀 Would execute inheritance now...");
      console.log("📋 Distribution plan:");
      
      for (let i = 0; i < smartWallet.data.heirs.length; i++) {
        const heir = smartWallet.data.heirs[i];
        const expectedAmount = (balance * heir.allocationPercentage) / 100;
        console.log(`   Heir ${i + 1}: ${heir.heirPubkey.toString()}`);
        console.log(`   Amount: ${expectedAmount.toFixed(6)} SOL (${heir.allocationPercentage}%)`);
      }

      // For testing, we'll just simulate the execution
      console.log("✅ Inheritance execution simulated successfully!");
      return true;

    } catch (error) {
      console.error(`❌ Error processing inheritance for ${ownerPublicKey.toString()}:`, error.message);
      return false;
    }
  }

  async monitorSmartWallets(ownerAddresses) {
    console.log(`🤖 Keeper Bot started - monitoring ${ownerAddresses.length} Smart Wallets\n`);

    for (const ownerAddress of ownerAddresses) {
      await this.checkAndExecuteInheritance(ownerAddress);
      console.log("\n" + "=".repeat(80) + "\n");
    }

    console.log("🏁 Monitoring cycle complete");
  }

  async getAllSmartWallets() {
    try {
      console.log("🔍 Fetching all Smart Wallet accounts...");
      const accounts = await this.program.account.smartWallet.all();
      
      console.log(`📊 Found ${accounts.length} Smart Wallet accounts`);
      
      return accounts.map(acc => ({
        owner: acc.account.owner,
        data: acc.account,
        address: acc.publicKey
      }));
    } catch (error) {
      console.error("❌ Error fetching Smart Wallet accounts:", error);
      return [];
    }
  }
}

/**
 * Test the keeper bot with existing Smart Wallets
 */
async function testKeeperBotWithExistingWallets() {
  console.log("🤖 Testing Keeper Bot with Existing Smart Wallets...\n");

  try {
    // Configure connection
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    
    // Create keeper wallet (no funding needed for read-only operations)
    const keeperWallet = Keypair.generate();
    
    console.log(`🔑 Keeper wallet: ${keeperWallet.publicKey.toString()}`);

    // Set up provider and program
    const wallet = new Wallet(keeperWallet);
    const provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
    anchor.setProvider(provider);

    // Load the IDL
    const IDL = require("./target/idl/gado.json");
    const program = new Program(IDL, provider);

    // Create keeper bot instance
    const keeperBot = new SimpleKeeperBot(program, connection, keeperWallet);

    // Get all Smart Wallets
    console.log("🔍 Discovering Smart Wallets...");
    const allWallets = await keeperBot.getAllSmartWallets();

    if (allWallets.length === 0) {
      console.log("⚠️  No Smart Wallets found on devnet");
      return;
    }

    // Test with existing wallets
    const ownerAddresses = allWallets.map(wallet => wallet.owner);
    console.log(`📋 Found ${ownerAddresses.length} Smart Wallets to monitor\n`);

    // Monitor all wallets
    await keeperBot.monitorSmartWallets(ownerAddresses);

    // Also test specific wallets if we have the saved data
    try {
      const savedData = require("./found-smart-wallets.json");
      console.log("\n🔄 Testing with saved wallet data...");
      
      const specificOwners = savedData.owners.map(addr => new PublicKey(addr));
      await keeperBot.monitorSmartWallets(specificOwners);
      
    } catch (err) {
      console.log("ℹ️  No saved wallet data found, skipping specific test");
    }

  } catch (error) {
    console.error("❌ Keeper bot test error:", error);
  }
}

// Run the test
if (require.main === module) {
  testKeeperBotWithExistingWallets().catch(console.error);
}

module.exports = { SimpleKeeperBot, testKeeperBotWithExistingWallets };