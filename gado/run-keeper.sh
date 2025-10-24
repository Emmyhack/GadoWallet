#!/bin/bash

# Gada Wallet Inheritance Keeper Bot Runner
# This script runs the automated inheritance monitoring system

echo "🚀 Starting Gada Wallet Inheritance Keeper Bot"
echo "================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm/yarn is installed
if ! command -v npm &> /dev/null && ! command -v yarn &> /dev/null; then
    echo "❌ npm or yarn is not installed. Please install npm or yarn first."
    exit 1
fi

# Check if we're in the gado directory
if [ ! -f "Anchor.toml" ] || [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the gado directory (where Anchor.toml is located)"
    exit 1
fi

# Install dependencies if needed
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    if command -v yarn &> /dev/null; then
        yarn install
    else
        npm install
    fi
fi

# Build the TypeScript files
echo "🔨 Building TypeScript files..."
if command -v yarn &> /dev/null; then
    yarn build || npm run build 2>/dev/null || echo "⚠️ Build step skipped (not configured)"
else
    npm run build 2>/dev/null || echo "⚠️ Build step skipped (not configured)"
fi

# Set default values
NETWORK=${1:-devnet}
CHECK_INTERVAL=${2:-5}
WALLET_PATH=${3:-./keeper-wallet.json}

echo "⚙️ Configuration:"
echo "   Network: $NETWORK"
echo "   Check Interval: $CHECK_INTERVAL minutes"
echo "   Wallet Path: $WALLET_PATH"
echo ""

# Check if IDL exists
if [ ! -f "target/idl/gado.json" ]; then
    echo "❌ IDL file not found at target/idl/gado.json"
    echo "   Please build the Anchor program first:"
    echo "   anchor build"
    exit 1
fi

# Check if keeper wallet exists
if [ ! -f "$WALLET_PATH" ]; then
    echo "📱 Keeper wallet not found. A new one will be generated."
    echo "   Make sure to fund the generated wallet with SOL!"
else
    WALLET_PUBKEY=$(node -e "
        const fs = require('fs');
        const { Keypair } = require('@solana/web3.js');
        try {
            const secretKey = JSON.parse(fs.readFileSync('$WALLET_PATH', 'utf8'));
            const keypair = Keypair.fromSecretKey(new Uint8Array(secretKey));
            console.log(keypair.publicKey.toString());
        } catch (e) {
            console.log('Error loading wallet');
        }
    " 2>/dev/null)
    
    if [ "$WALLET_PUBKEY" != "Error loading wallet" ] && [ ! -z "$WALLET_PUBKEY" ]; then
        echo "🔑 Using existing keeper wallet: $WALLET_PUBKEY"
    fi
fi

echo ""
echo "🤖 Starting Inheritance Keeper Bot..."
echo "   The bot will monitor SOL and Token inheritances"
echo "   Heirs will be notified when their inheritances become claimable"
echo "   Press Ctrl+C to stop the bot"
echo ""

# Run the keeper bot
if command -v ts-node &> /dev/null; then
    # Use ts-node if available (for development)
    ts-node inheritance-keeper-bot.ts "$NETWORK" "$CHECK_INTERVAL" "$WALLET_PATH"
elif [ -f "inheritance-keeper-bot.js" ]; then
    # Use compiled JavaScript file
    node inheritance-keeper-bot.js "$NETWORK" "$CHECK_INTERVAL" "$WALLET_PATH"
else
    # Compile and run TypeScript directly
    echo "📝 Compiling TypeScript file..."
    if command -v tsc &> /dev/null; then
        tsc inheritance-keeper-bot.ts --target es2020 --module commonjs --moduleResolution node --esModuleInterop --allowSyntheticDefaultImports
        node inheritance-keeper-bot.js "$NETWORK" "$CHECK_INTERVAL" "$WALLET_PATH"
    else
        echo "❌ TypeScript compiler not found. Please install:"
        echo "   npm install -g typescript ts-node"
        echo "   OR compile manually and run the .js file"
        exit 1
    fi
fi