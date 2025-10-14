import { Connection, Keypair, clusterApiUrl } from "@solana/web3.js";
import { SmartWalletKeeper } from "../services/smartWalletKeeper";
import fs from 'fs';
import path from 'path';

// Configuration
const NETWORK = 'devnet'; // Change to 'mainnet-beta' for production
const CHECK_INTERVAL_SECONDS = 300; // How often to check (5 minutes for production use)
const KEEPER_KEYPAIR_PATH = './keeper-wallet.json'; // Path to keeper wallet file

/**
 * Load or create a keeper wallet
 */
function loadOrCreateKeeperWallet(): Keypair {
  try {
    // Try to load existing keeper wallet
    if (fs.existsSync(KEEPER_KEYPAIR_PATH)) {
      const secretKey = JSON.parse(fs.readFileSync(KEEPER_KEYPAIR_PATH, 'utf-8'));
      return Keypair.fromSecretKey(new Uint8Array(secretKey));
    } else {
      // Create new keeper wallet
      const keeperWallet = Keypair.generate();
      fs.writeFileSync(
        KEEPER_KEYPAIR_PATH,
        JSON.stringify(Array.from(keeperWallet.secretKey))
      );
      console.log(`🔑 Created new keeper wallet: ${keeperWallet.publicKey.toString()}`);
      console.log(`💾 Saved to: ${KEEPER_KEYPAIR_PATH}`);
      console.log(`⚠️ Make sure this wallet has some SOL for transaction fees!`);
      return keeperWallet;
    }
  } catch (error) {
    console.error("Error loading/creating keeper wallet:", error);
    throw error;
  }
}

/**
 * Setup and run the Smart Wallet Keeper
 */
async function runSmartWalletKeeper() {
  console.log("🏃 Starting Smart Wallet Keeper Setup...\n");

  try {
    // Initialize connection
    const connection = new Connection(
      NETWORK === 'devnet' ? clusterApiUrl('devnet') : clusterApiUrl('mainnet-beta'),
      'confirmed'
    );
    
    console.log(`🌐 Connected to ${NETWORK}`);

    // Load keeper wallet
    const keeperWallet = loadOrCreateKeeperWallet();
    console.log(`🔑 Keeper wallet loaded: ${keeperWallet.publicKey.toString()}`);

    // Check keeper wallet balance
    const balance = await connection.getBalance(keeperWallet.publicKey);
    console.log(`💰 Keeper wallet balance: ${balance / 1e9} SOL`);
    
    if (balance === 0) {
      console.log(`⚠️ WARNING: Keeper wallet has no SOL!`);
      console.log(`Please send some SOL to: ${keeperWallet.publicKey.toString()}`);
      console.log(`Minimum recommended: 0.01 SOL for transaction fees`);
    }

    // Create Smart Wallet Keeper
    const keeper = new SmartWalletKeeper(
      connection,
      keeperWallet,
      CHECK_INTERVAL_SECONDS * 1000
    );

    // Add example wallets to monitor (replace with actual Smart Wallet owner addresses)
    // You can add Smart Wallet owner public keys here to monitor them
    // Example:
    // keeper.addWalletToMonitor(new PublicKey("YourSmartWalletOwnerPublicKeyHere"));

    console.log("\n📋 Smart Wallet monitoring configuration:");
    console.log(`   Check interval: ${CHECK_INTERVAL_SECONDS} seconds`);
    console.log(`   Network: ${NETWORK}`);
    console.log(`   Monitored wallets: ${keeper.getStatus().monitoredWalletsCount}`);

    // Start the keeper
    console.log("\n🚀 Starting automated Smart Wallet monitoring...");
    keeper.start();

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down Smart Wallet Keeper...');
      keeper.stop();
      process.exit(0);
    });

    // Keep the process running
    console.log("\n✅ Smart Wallet Keeper is now running!");
    console.log("Press Ctrl+C to stop");
    console.log("\n" + "=".repeat(50));

    // Optional: Add a command interface
    setupCommandInterface(keeper);

  } catch (error) {
    console.error("❌ Error starting Smart Wallet Keeper:", error);
    process.exit(1);
  }
}

/**
 * Setup command line interface for managing the keeper
 */
function setupCommandInterface(keeper: SmartWalletKeeper) {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log("\nAvailable commands:");
  console.log("  status    - Show keeper status");
  console.log("  wallets   - Show monitored wallets");
  console.log("  check     - Manually trigger check");
  console.log("  add <key> - Add wallet to monitor");
  console.log("  help      - Show this help");
  console.log("  quit      - Stop and exit");

  const processCommand = async (input: string) => {
    const [command, ...args] = input.trim().split(' ');

    switch (command.toLowerCase()) {
      case 'status':
        const status = keeper.getStatus();
        console.log("\n📊 Keeper Status:");
        console.log(`   Running: ${status.isRunning ? '✅' : '❌'}`);
        console.log(`   Monitored wallets: ${status.monitoredWalletsCount}`);
        console.log(`   Check interval: ${status.checkIntervalMs / 1000}s`);
        console.log(`   Keeper wallet: ${status.keeperWallet.slice(0, 8)}...`);
        break;

      case 'wallets':
        const walletStatuses = await keeper.getMonitoredWalletsStatus();
        console.log("\n📋 Monitored Wallets:");
        if (walletStatuses.length === 0) {
          console.log("   No wallets being monitored");
        } else {
          walletStatuses.forEach((wallet, i) => {
            console.log(`   ${i + 1}. ${wallet.owner.slice(0, 8)}... - ${wallet.eligible ? '✅ Eligible' : '⏳ Not eligible'}`);
            if (wallet.balance !== undefined) {
              console.log(`      Balance: ${wallet.balance} SOL`);
            }
            if (wallet.reason) {
              console.log(`      Reason: ${wallet.reason}`);
            }
          });
        }
        break;

      case 'check':
        console.log("🔄 Triggering manual check...");
        await keeper.manualCheck();
        break;

      case 'add':
        if (args.length === 0) {
          console.log("❌ Usage: add <public_key>");
        } else {
          try {
            const { PublicKey } = await import("@solana/web3.js");
            const pubkey = new PublicKey(args[0]);
            keeper.addWalletToMonitor(pubkey);
            console.log(`✅ Added wallet to monitoring: ${pubkey.toString()}`);
          } catch (error) {
            console.log("❌ Invalid public key");
          }
        }
        break;

      case 'help':
        console.log("\nAvailable commands:");
        console.log("  status    - Show keeper status");
        console.log("  wallets   - Show monitored wallets");
        console.log("  check     - Manually trigger check");
        console.log("  add <key> - Add wallet to monitor");
        console.log("  help      - Show this help");
        console.log("  quit      - Stop and exit");
        break;

      case 'quit':
      case 'exit':
        console.log("👋 Goodbye!");
        keeper.stop();
        rl.close();
        process.exit(0);
        break;

      default:
        if (command) {
          console.log(`❌ Unknown command: ${command}. Type 'help' for available commands.`);
        }
        break;
    }

    rl.prompt();
  };

  rl.on('line', processCommand);
  rl.setPrompt('\nkeeper> ');
  rl.prompt();
}

// Run the keeper if this file is executed directly
if (require.main === module) {
  runSmartWalletKeeper().catch(console.error);
}

export { runSmartWalletKeeper, loadOrCreateKeeperWallet };