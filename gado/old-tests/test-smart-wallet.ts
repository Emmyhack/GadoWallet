import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { Gado } from "./target/types/gado";
import { 
  Connection, 
  Keypair, 
  clusterApiUrl,
  LAMPORTS_PER_SOL 
} from "@solana/web3.js";
import { SmartWalletClient } from "./smart-wallet-client";

// Load the IDL
import IDL from "./target/idl/gado.json";

async function testSmartWallet() {
  console.log("🚀 Starting Smart Wallet Test...\n");

  // Configure the connection
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  
  // Create a wallet (in production, use a proper wallet)
  const wallet = new Wallet(Keypair.generate());

  // Airdrop some SOL to the wallet
  console.log("💰 Requesting airdrop for wallet...");
  try {
    const airdropTx = await connection.requestAirdrop(
      wallet.publicKey, 
      1 * LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropTx);
  } catch (error) {
    console.log("⚠️  Airdrop failed, continuing with existing balance");
  }
  
  const balance = await connection.getBalance(wallet.publicKey);
  console.log(`✅ Wallet balance: ${balance / LAMPORTS_PER_SOL} SOL\n`);

  // Set up the provider and program
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);

  // Your deployed program ID
  const programId = new anchor.web3.PublicKey("EciS2vNDTe5S6WnNWEBmdBmKjQL5bsXyfauYmxPFKQGu");
  
  const program = new Program(IDL as any, provider) as Program<Gado>;

  // Create Smart Wallet client
  const smartWalletClient = new SmartWalletClient(program, connection);

  console.log("📋 Smart Wallet Test Configuration:");
  console.log(`Program ID: ${programId.toString()}`);
  console.log(`Wallet: ${wallet.publicKey.toString()}\n`);

  try {
    // Test 1: Create Smart Wallet with multiple heirs
    console.log("🏗️  Test 1: Creating Smart Wallet inheritance setup...");
    
    const owner = wallet.payer;
    const heir1 = Keypair.generate();
    const heir2 = Keypair.generate();

    console.log(`Owner: ${owner.publicKey.toString()}`);
    console.log(`Heir 1: ${heir1.publicKey.toString()}`);
    console.log(`Heir 2: ${heir2.publicKey.toString()}`);

    const heirs = [
      { heirPubkey: heir1.publicKey, allocationPercentage: 70 },
      { heirPubkey: heir2.publicKey, allocationPercentage: 30 },
    ];

    const createTx = await smartWalletClient.createSmartWalletInheritance(
      owner,
      heirs,
      60 // 60 seconds for testing
    );
    console.log(`✅ Smart Wallet created: ${createTx}\n`);

    // Test 2: Get Smart Wallet info
    console.log("📊 Test 2: Fetching Smart Wallet information...");
    const smartWallet = await smartWalletClient.getSmartWallet(owner.publicKey);
    if (smartWallet) {
      console.log("Smart Wallet Data:");
      console.log(`- Owner: ${smartWallet.data.owner.toString()}`);
      console.log(`- Heirs count: ${smartWallet.data.heirs.length}`);
      console.log(`- Inactivity period: ${smartWallet.data.inactivityPeriodSeconds.toString()} seconds`);
      console.log(`- Last active: ${new Date(smartWallet.data.lastActiveTime.toNumber() * 1000).toISOString()}`);
      console.log(`- Is executed: ${smartWallet.data.isExecuted}`);
      
      smartWallet.data.heirs.forEach((heir, index) => {
        console.log(`- Heir ${index + 1}: ${heir.heirPubkey.toString()} (${heir.allocationPercentage}%)`);
      });
    }
    console.log();

    // Test 3: Deposit SOL to Smart Wallet
    console.log("💸 Test 3: Depositing SOL to Smart Wallet...");
    const depositTx = await smartWalletClient.depositToSmartWallet(
      owner,
      0.5 // 0.5 SOL
    );
    console.log(`✅ Deposited 0.5 SOL: ${depositTx}`);

    const smartWalletBalance = await smartWalletClient.getSmartWalletBalance(owner.publicKey);
    console.log(`Smart Wallet balance: ${smartWalletBalance} SOL\n`);

    // Test 4: Update activity
    console.log("🔄 Test 4: Updating Smart Wallet activity...");
    const activityTx = await smartWalletClient.updateSmartWalletActivity(owner);
    console.log(`✅ Activity updated: ${activityTx}\n`);

    // Test 5: Check if owner is inactive (should be false right after update)
    console.log("⏰ Test 5: Checking owner activity status...");
    const isInactive = await smartWalletClient.isOwnerInactive(owner.publicKey);
    console.log(`Owner is inactive: ${isInactive}\n`);

    console.log("🎉 All tests completed successfully!");
    console.log("\n📝 Note: To test inheritance execution:");
    console.log("1. Wait for the inactivity period (60 seconds)");
    console.log("2. Run executeInheritance() with a keeper account");
    console.log("3. Assets will be distributed to heirs according to allocation percentages");

  } catch (error) {
    console.error("❌ Test failed:", error);
    
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }
    
    // Try to get more details if it's an Anchor error
    if (typeof error === 'object' && error !== null && 'logs' in error) {
      console.error("Program logs:", (error as any).logs);
    }
  }
}

// Run the test
testSmartWallet().catch(console.error);