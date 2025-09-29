import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { Gada } from "./target/types/gada";
import { 
  Connection, 
  Keypair, 
  clusterApiUrl,
  LAMPORTS_PER_SOL,
  PublicKey
} from "@solana/web3.js";
import { SmartWalletClient } from "./smart-wallet-client";

// Load the IDL
import IDL from "./target/idl/gada.json";

/**
 * Demonstration of Smart Wallet Inheritance System
 * This script shows the key features without requiring large SOL amounts
 */
async function demonstrateSmartWallet() {
  console.log("🎯 Smart Wallet Inheritance System Demo\n");

  // Program configuration
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const programId = new PublicKey("EciS2vNDTe5S6WnNWEBmdBmKjQL5bsXyfauYmxPFKQGu");

  console.log("📋 Configuration:");
  console.log(`Program ID: ${programId.toString()}`);
  console.log(`Network: Devnet`);
  console.log(`RPC: ${connection.rpcEndpoint}\n`);

  // Create demo accounts
  const owner = Keypair.generate();
  const heir1 = Keypair.generate();
  const heir2 = Keypair.generate();
  const keeper = Keypair.generate();

  console.log("👥 Demo Accounts:");
  console.log(`Owner: ${owner.publicKey.toString()}`);
  console.log(`Heir 1: ${heir1.publicKey.toString()}`);
  console.log(`Heir 2: ${heir2.publicKey.toString()}`);
  console.log(`Keeper: ${keeper.publicKey.toString()}\n`);

  // Set up provider with owner wallet
  const wallet = new Wallet(owner);
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);

  const program = new Program(IDL as any, provider) as Program<Gada>;
  const smartWalletClient = new SmartWalletClient(program, connection);

  console.log("🔧 Smart Wallet Client initialized\n");

  // Calculate PDA addresses (these are deterministic)
  const [smartWalletPDA] = smartWalletClient.getSmartWalletPDA(owner.publicKey);
  const [smartWalletAssetPDA] = smartWalletClient.getSmartWalletAssetPDA(owner.publicKey);

  console.log("📍 Smart Wallet Addresses:");
  console.log(`Smart Wallet PDA: ${smartWalletPDA.toString()}`);
  console.log(`Asset PDA: ${smartWalletAssetPDA.toString()}\n`);

  // Show heir allocation setup
  const heirs = [
    { heirPubkey: heir1.publicKey, allocationPercentage: 70 },
    { heirPubkey: heir2.publicKey, allocationPercentage: 30 },
  ];

  console.log("👪 Inheritance Configuration:");
  heirs.forEach((heir, index) => {
    console.log(`Heir ${index + 1}: ${heir.heirPubkey.toString()} (${heir.allocationPercentage}%)`);
  });
  console.log(`Inactivity Period: 60 seconds (for demo)`);
  console.log(`Total Allocation: ${heirs.reduce((sum, h) => sum + h.allocationPercentage, 0)}%\n`);

  // Show what the Smart Wallet would look like
  console.log("📊 Smart Wallet Structure Preview:");
  console.log(`{`);
  console.log(`  owner: "${owner.publicKey.toString()}",`);
  console.log(`  heirs: [`);
  heirs.forEach((heir, index) => {
    console.log(`    { heir_pubkey: "${heir.heirPubkey.toString()}", allocation_percentage: ${heir.allocationPercentage} }${index < heirs.length - 1 ? ',' : ''}`);
  });
  console.log(`  ],`);
  console.log(`  inactivity_period_seconds: 60,`);
  console.log(`  last_active_time: ${Math.floor(Date.now() / 1000)},`);
  console.log(`  is_executed: false,`);
  console.log(`  bump: [calculated]`);
  console.log(`}\n`);

  // Show instruction calls that would be made
  console.log("🔄 Smart Wallet Operations Flow:");
  console.log("1. create_smart_wallet_inheritance()");
  console.log("   ├─ Creates Smart Wallet account");
  console.log("   ├─ Creates Asset PDA");
  console.log("   └─ Sets up heir configuration");
  console.log();
  console.log("2. deposit_to_smart_wallet(amount)");
  console.log("   ├─ Transfers SOL to Asset PDA");
  console.log("   └─ Updates activity timestamp");
  console.log();
  console.log("3. deposit_tokens_to_smart_wallet(amount, mint)");
  console.log("   ├─ Creates ATA for Asset PDA");
  console.log("   ├─ Transfers tokens to Smart Wallet");
  console.log("   └─ Updates activity timestamp");
  console.log();
  console.log("4. update_smart_wallet_activity()");
  console.log("   └─ Resets inactivity timer");
  console.log();
  console.log("5. execute_inheritance() [Keeper Bot]");
  console.log("   ├─ Validates owner inactivity");
  console.log("   ├─ Distributes SOL to heirs");
  console.log("   ├─ Distributes tokens to heirs");
  console.log("   └─ Marks inheritance as executed\n");

  // Show keeper bot workflow
  console.log("🤖 Keeper Bot Workflow:");
  console.log("1. Monitor Smart Wallets every N minutes");
  console.log("2. For each Smart Wallet:");
  console.log("   ├─ Check if owner is inactive");
  console.log("   ├─ Check if inheritance already executed");
  console.log("   ├─ Check if assets exist to distribute");
  console.log("   └─ Execute inheritance if conditions met");
  console.log("3. Log all distributions for transparency");
  console.log("4. Handle errors and retry failed executions\n");

  // Show example asset distribution
  console.log("💰 Example Asset Distribution (1.0 SOL):");
  const exampleAmount = 1.0;
  heirs.forEach((heir, index) => {
    const amount = (exampleAmount * heir.allocationPercentage) / 100;
    console.log(`Heir ${index + 1}: ${amount.toFixed(3)} SOL (${heir.allocationPercentage}%)`);
  });
  console.log();

  // Show security features
  console.log("🔒 Security Features:");
  console.log("✅ Only owner can create and manage Smart Wallet");
  console.log("✅ Only authorized keepers can execute inheritance");
  console.log("✅ Heir allocations must sum to exactly 100%");
  console.log("✅ Inactivity period prevents premature execution");
  console.log("✅ Assets stored in secure PDAs");
  console.log("✅ Atomic inheritance execution");
  console.log("✅ No partial distributions allowed\n");

  console.log("🎉 Smart Wallet Inheritance System Ready!");
  console.log("\n📝 To use this system:");
  console.log("1. Fund your wallet with SOL for transaction fees");
  console.log("2. Run: npx ts-node test-smart-wallet.ts");
  console.log("3. Set up keeper bot monitoring");
  console.log("4. Integrate with your wallet application");
}

// Run the demonstration
demonstrateSmartWallet().catch(console.error);