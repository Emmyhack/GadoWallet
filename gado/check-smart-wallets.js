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
 * Simple test to check existing Smart Wallets without creating new ones
 */
async function checkExistingSmartWallets() {
  console.log("🔍 Checking for existing Smart Wallets on devnet...\n");

  try {
    // Configure connection
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    
    // Create a dummy wallet for the provider
    const wallet = Keypair.generate();
    const anchorWallet = new Wallet(wallet);
    const provider = new AnchorProvider(connection, anchorWallet, {
      commitment: "confirmed",
    });
    anchor.setProvider(provider);

    // Load the IDL
    const IDL = require("./target/idl/gado.json");
    const program = new Program(IDL, provider);

    console.log("📡 Connecting to devnet...");
    console.log("Program ID:", program.programId.toString());
    
    // Try to fetch all Smart Wallet accounts
    console.log("🔍 Fetching Smart Wallet accounts...");
    const accounts = await program.account.smartWallet.all();
    
    console.log(`📊 Found ${accounts.length} Smart Wallet accounts\n`);
    
    if (accounts.length === 0) {
      console.log("⚠️  No Smart Wallets found on devnet");
      console.log("💡 To create test Smart Wallets:");
      console.log("   1. Fund a wallet with devnet SOL");
      console.log("   2. Run the Smart Wallet creation script");
      console.log("   3. Come back and run the keeper bot\n");
    } else {
      console.log("✅ Found Smart Wallets:");
      const ownerAddresses = [];
      
      accounts.forEach((acc, index) => {
        console.log(`  ${index + 1}. Smart Wallet ${acc.publicKey.toString()}`);
        console.log(`     Owner: ${acc.account.owner.toString()}`);
        console.log(`     Heirs: ${acc.account.heirs.length}`);
        console.log(`     Executed: ${acc.account.isExecuted}`);
        console.log(`     Last Activity: ${new Date(acc.account.lastActiveTime.toNumber() * 1000).toISOString()}`);
        console.log(`     Inactivity Period: ${acc.account.inactivityPeriodSeconds.toNumber()} seconds`);
        console.log("");
        
        ownerAddresses.push(acc.account.owner.toString());
      });
      
      // Save owner addresses for keeper bot testing
      const testData = {
        owners: ownerAddresses,
        foundAt: new Date().toISOString(),
        network: "devnet"
      };
      
      require("fs").writeFileSync("found-smart-wallets.json", JSON.stringify(testData, null, 2));
      console.log("💾 Smart Wallet owners saved to found-smart-wallets.json");
      console.log("🤖 You can now test the keeper bot with these wallets!");
    }

  } catch (error) {
    console.error("❌ Error checking Smart Wallets:", error.message);
    
    if (error.message.includes("Account does not exist")) {
      console.log("ℹ️  This error suggests no Smart Wallet accounts exist yet.");
    }
  }
}

// Run the check
if (require.main === module) {
  checkExistingSmartWallets().catch(console.error);
}

module.exports = { checkExistingSmartWallets };