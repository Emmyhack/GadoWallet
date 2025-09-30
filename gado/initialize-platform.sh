#!/bin/bash

# 🚀 Initialize Gado Platform on Devnet
# This script initializes the platform configuration and treasury

set -e  # Exit on any error

echo "🎯 ======================================"
echo "🚀 INITIALIZING GADO PLATFORM ON DEVNET"
echo "📅 $(date)"
echo "======================================"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "Anchor.toml" ]; then
    print_error "Anchor.toml not found. Please run this script from the gado directory."
    exit 1
fi

# Check if Solana and Anchor are installed
if ! command -v solana &> /dev/null; then
    print_error "Solana CLI not found. Please install Solana CLI first."
    exit 1
fi

if ! command -v anchor &> /dev/null; then
    print_error "Anchor CLI not found. Please install Anchor CLI first."
    exit 1
fi

# Check network configuration
current_cluster=$(solana config get | grep "RPC URL" | awk '{print $3}')
print_status "Current Solana cluster: $current_cluster"

if [[ "$current_cluster" != *"devnet"* ]]; then
    print_warning "Not connected to devnet. Switching to devnet..."
    solana config set --url https://api.devnet.solana.com
    print_success "Switched to devnet"
fi

# Check wallet balance
balance=$(solana balance --lamports)
balance_sol=$(echo "scale=4; $balance / 1000000000" | bc -l)
print_status "Wallet balance: $balance_sol SOL"

if (( $(echo "$balance_sol < 1" | bc -l) )); then
    print_warning "Low balance detected. Requesting airdrop..."
    solana airdrop 2
    sleep 5
    balance=$(solana balance --lamports)
    balance_sol=$(echo "scale=4; $balance / 1000000000" | bc -l)
    print_success "New balance: $balance_sol SOL"
fi

# Get the program ID
program_id=$(grep 'gado = ' Anchor.toml | cut -d'"' -f2)
print_status "Program ID: $program_id"

# Check if program is deployed
print_status "Checking program deployment..."
if solana account $program_id > /dev/null 2>&1; then
    print_success "Program is deployed on devnet"
else
    print_warning "Program not found on devnet. Building and deploying..."
    
    # Build the program
    print_status "Building Anchor program..."
    anchor build
    
    # Deploy the program
    print_status "Deploying to devnet..."
    anchor deploy --provider.cluster devnet
    
    print_success "Program deployed successfully!"
fi

# Initialize the platform
print_status "Initializing platform configuration..."

# Create a temporary TypeScript file to run the initialization
cat > initialize_platform.ts << 'EOF'
import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { Gado } from "./target/types/gado";
import fs from "fs";

async function initializePlatform() {
  // Setup connection and provider
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  
  // Load wallet from Solana CLI config
  const walletPath = process.env.HOME + "/.config/solana/id.json";
  if (!fs.existsSync(walletPath)) {
    console.error("❌ Wallet not found. Please run 'solana-keygen new' first.");
    process.exit(1);
  }
  
  const keypairData = JSON.parse(fs.readFileSync(walletPath, "utf8"));
  const keypair = Keypair.fromSecretKey(new Uint8Array(keypairData));
  
  const wallet = {
    publicKey: keypair.publicKey,
    signTransaction: async (tx: any) => {
      tx.partialSign(keypair);
      return tx;
    },
    signAllTransactions: async (txs: any[]) => {
      txs.forEach(tx => tx.partialSign(keypair));
      return txs;
    },
  };
  
  const provider = new AnchorProvider(connection, wallet as any, {
    commitment: "confirmed",
  });
  
  // Load the program
  const idl = JSON.parse(fs.readFileSync("./target/idl/gado.json", "utf8"));
  const programId = new PublicKey(idl.address);
  const program = new Program(idl, provider) as Program<Gado>;
  
  console.log("🎯 Program ID:", programId.toString());
  console.log("👤 Admin wallet:", keypair.publicKey.toString());
  
  // Derive PDAs
  const [platformConfigPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("platform_config")],
    programId
  );
  
  const [treasuryPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("treasury")],
    programId
  );
  
  console.log("🏛️ Platform Config PDA:", platformConfigPda.toString());
  console.log("💰 Treasury PDA:", treasuryPda.toString());
  
  // Check if already initialized
  try {
    const config = await program.account.platformConfig.fetch(platformConfigPda);
    console.log("✅ Platform already initialized!");
    console.log("📊 Platform fee:", config.platformFeeBps, "bps (basis points)");
    console.log("👥 Total users:", config.totalUsers.toString());
    console.log("💎 Premium users:", config.premiumUsers.toString());
    console.log("💰 Total fees collected:", config.totalFeesCollected.toString());
    return;
  } catch (error) {
    console.log("🔧 Platform not initialized. Initializing now...");
  }
  
  try {
    // Initialize the platform
    const tx = await program.methods
      .initialize()
      .accountsPartial({
        platformConfig: platformConfigPda,
        treasury: treasuryPda,
        admin: keypair.publicKey,
      })
      .signers([keypair])
      .rpc();
    
    console.log("🎉 Platform initialized successfully!");
    console.log("📝 Transaction signature:", tx);
    
    // Verify initialization
    const config = await program.account.platformConfig.fetch(platformConfigPda);
    const treasury = await program.account.treasury.fetch(treasuryPda);
    
    console.log("\n✅ PLATFORM CONFIGURATION:");
    console.log("👤 Admin:", config.admin.toString());
    console.log("💰 Treasury:", config.treasury.toString());
    console.log("📊 Platform fee:", config.platformFeeBps, "bps (0.5%)");
    console.log("📈 Total users:", config.totalUsers.toString());
    console.log("💎 Premium users:", config.premiumUsers.toString());
    console.log("🏛️ Treasury admin:", treasury.admin.toString());
    console.log("💰 Treasury balance:", treasury.totalBalance.toString());
    
    console.log("\n🎯 Platform is ready for Smart Wallet creation!");
    
  } catch (error: any) {
    console.error("❌ Failed to initialize platform:", error);
    if (error.logs) {
      console.error("📋 Transaction logs:", error.logs);
    }
    process.exit(1);
  }
}

initializePlatform()
  .then(() => {
    console.log("✅ Platform initialization complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Error:", error);
    process.exit(1);
  });
EOF

# Run the initialization script
print_status "Running platform initialization script..."
npx ts-node initialize_platform.ts

# Clean up
rm -f initialize_platform.ts

print_success "🎉 Platform initialization complete!"
echo ""
echo "🎯 NEXT STEPS:"
echo "1. 🌐 Open your frontend at http://localhost:5173"
echo "2. 🔗 Connect your wallet"
echo "3. 📊 Check Platform Setup tab to verify status"  
echo "4. 🏗️ Create Smart Wallets without errors!"
echo ""
echo "✅ Platform is ready for use!"