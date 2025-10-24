#!/bin/bash

# Gada Wallet AUTOMATIC INHERITANCE EXECUTION BOT
# This script runs the bot that AUTOMATICALLY TRANSFERS ASSETS to heirs

echo "🤖 AUTOMATIC INHERITANCE EXECUTION BOT"
echo "========================================"
echo "⚡ This bot AUTOMATICALLY TRANSFERS assets to heirs when conditions are met"
echo "💰 NO MANUAL ACTION required from heirs - transfers happen automatically"
echo "🔄 Assets are transferred immediately when owners become inactive"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
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

# Set default values
NETWORK=${1:-devnet}
CHECK_INTERVAL=${2:-5}
WALLET_PATH=${3:-./auto-execution-keeper-wallet.json}

echo "⚙️ Configuration:"
echo "   Network: $NETWORK"
echo "   Check Interval: $CHECK_INTERVAL minutes"
echo "   Keeper Wallet: $WALLET_PATH"
echo ""

# Check if IDL exists
if [ ! -f "target/idl/gado.json" ]; then
    echo "❌ IDL file not found at target/idl/gado.json"
    echo "   Please build the Anchor program first:"
    echo "   anchor build"
    exit 1
fi

# Check keeper wallet and balance
if [ ! -f "$WALLET_PATH" ]; then
    echo "🆕 Keeper wallet will be generated automatically"
    echo "⚠️  IMPORTANT: You'll need to fund the generated wallet with at least 0.5 SOL"
    echo "   The bot needs SOL to pay for transaction fees when executing transfers"
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
        
        # Check wallet balance
        echo "💰 Checking wallet balance..."
        BALANCE=$(solana balance $WALLET_PUBKEY --url $NETWORK 2>/dev/null | grep -oE '[0-9]+\.?[0-9]*' | head -1)
        
        if [ ! -z "$BALANCE" ]; then
            echo "   Current balance: $BALANCE SOL"
            
            # Check if balance is sufficient (compare with bc if available, otherwise basic check)
            if command -v bc &> /dev/null; then
                SUFFICIENT=$(echo "$BALANCE >= 0.1" | bc -l)
                if [ "$SUFFICIENT" -eq 0 ]; then
                    echo "⚠️  WARNING: Low balance! Consider adding more SOL for reliable operations"
                fi
            else
                echo "   Make sure you have at least 0.1 SOL for transaction fees"
            fi
        else
            echo "   Could not check balance (wallet may be new or network issue)"
        fi
    fi
fi

echo ""
echo "🚀 STARTING AUTOMATIC EXECUTION BOT..."
echo "⚡ The bot will AUTOMATICALLY TRANSFER ASSETS when conditions are met:"
echo "   • Monitors SOL and Token inheritances continuously"
echo "   • Detects when owners become inactive (based on inactivity period)"
echo "   • AUTOMATICALLY executes transfers to heirs"
echo "   • No manual action needed from heirs"
echo ""
echo "🔥 AUTOMATIC TRANSFERS: ENABLED"
echo "   Press Ctrl+C to stop the bot"
echo ""

# Run the auto-execution keeper bot
if command -v ts-node &> /dev/null; then
    # Use ts-node if available (for development)
    ts-node auto-execution-keeper.ts "$NETWORK" "$CHECK_INTERVAL" "$WALLET_PATH"
elif [ -f "auto-execution-keeper.js" ]; then
    # Use compiled JavaScript file
    node auto-execution-keeper.js "$NETWORK" "$CHECK_INTERVAL" "$WALLET_PATH"
else
    # Compile and run TypeScript directly
    echo "📝 Compiling TypeScript file..."
    if command -v tsc &> /dev/null; then
        tsc auto-execution-keeper.ts --target es2020 --module commonjs --moduleResolution node --esModuleInterop --allowSyntheticDefaultImports --skipLibCheck
        node auto-execution-keeper.js "$NETWORK" "$CHECK_INTERVAL" "$WALLET_PATH"
    else
        echo "❌ TypeScript compiler not found. Please install:"
        echo "   npm install -g typescript ts-node"
        echo "   OR compile manually and run the .js file"
        exit 1
    fi
fi