#!/bin/bash

echo "🤖 Starting Gada Wallet Automated Keeper Bot"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "Anchor.toml" ]; then
    echo "❌ Error: Not in gado directory. Please run this from /home/dextonicx/GadaWallet/gado"
    exit 1
fi

# Check if keeper wallet exists, if not generate one
KEEPER_WALLET="./keeper-wallet.json"
if [ ! -f "$KEEPER_WALLET" ]; then
    echo "🔑 Generating keeper wallet..."
    solana-keygen new --outfile "$KEEPER_WALLET" --no-bip39-passphrase
    echo "💰 Please fund this wallet with some SOL for transaction fees:"
    echo "   Wallet address: $(solana-keygen pubkey $KEEPER_WALLET)"
    echo "   For devnet: solana airdrop 1 $(solana-keygen pubkey $KEEPER_WALLET) --url devnet"
    echo ""
    read -p "Press Enter after funding the wallet to continue..."
fi

# Check wallet balance
WALLET_ADDRESS=$(solana-keygen pubkey $KEEPER_WALLET)
BALANCE=$(solana balance $WALLET_ADDRESS --url devnet 2>/dev/null | cut -d' ' -f1)

echo "💰 Keeper wallet balance: $BALANCE SOL"

if (( $(echo "$BALANCE < 0.01" | bc -l) )); then
    echo "⚠️ Warning: Low balance. Consider funding the wallet:"
    echo "   solana airdrop 1 $WALLET_ADDRESS --url devnet"
fi

echo ""
echo "🚀 Starting Automated Keeper Bot..."
echo "📡 Network: devnet"
echo "⏱️ Check interval: 5 minutes"
echo "🔑 Keeper wallet: $WALLET_ADDRESS"
echo ""
echo "The bot will monitor all inheritances and notify heirs when eligible."
echo "Press Ctrl+C to stop the bot."
echo ""

# Start the keeper bot
npx ts-node automated-keeper-bot.ts devnet 5 "$KEEPER_WALLET"