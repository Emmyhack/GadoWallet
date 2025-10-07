#!/bin/bash

# Fresh Test Environment Setup
# This script helps set up a completely clean testing environment

echo "🧪 GADO WALLET - FRESH TEST ENVIRONMENT SETUP"
echo "=============================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -d "gado" ]; then
    echo "❌ Please run this script from the GadaWallet root directory"
    exit 1
fi

echo "🔄 Setting up fresh test environment..."
echo ""

# Option 1: Use completely fresh wallets
echo "✨ OPTION 1: FRESH WALLETS (RECOMMENDED)"
echo "----------------------------------------"
echo "Use these brand new wallets for testing:"
echo ""

# Generate and display fresh keypairs using Node.js
node -e "
const { Keypair } = require('@solana/web3.js');

for (let i = 1; i <= 3; i++) {
  const kp = Keypair.generate();
  console.log(\`👤 Test Wallet \${i}:\`);
  console.log(\`   📋 Public:  \${kp.publicKey.toString()}\`);
  console.log(\`   🔐 Private: [\${kp.secretKey.join(',')}]\`);
  console.log('');
}
"

echo "📱 To use these wallets:"
echo "1. Copy any private key above (the [1,2,3...] array)"
echo "2. Import into Phantom: Settings → Import Private Key"
echo "3. Switch Phantom to Devnet"
echo "4. Get SOL from: https://faucet.solana.com"
echo "5. Connect to GadaWallet - no existing profiles!"
echo ""

# Option 2: Check existing profiles
echo "🔍 OPTION 2: CHECK CURRENT PROFILES"
echo "-----------------------------------"
echo "To check if a wallet has existing profiles:"
echo ""
echo "node -e \""
echo "const { Connection, PublicKey } = require('@solana/web3.js');"
echo "const connection = new Connection('https://api.devnet.solana.com');"
echo "const PROGRAM_ID = new PublicKey('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM');"
echo ""
echo "async function checkProfile(userKey) {"
echo "  const [pda] = PublicKey.findProgramAddressSync("
echo "    [Buffer.from('user_profile'), new PublicKey(userKey).toBuffer()],"
echo "    PROGRAM_ID"
echo "  );"
echo "  const account = await connection.getAccountInfo(pda);"
echo "  console.log(\`Profile for \${userKey}: \${account ? 'EXISTS' : 'NONE'}\`);"
echo "}"
echo ""
echo "checkProfile('YOUR_WALLET_ADDRESS_HERE');"
echo "\""
echo ""

# Option 3: Platform reset
echo "🔧 OPTION 3: CLEAN PLATFORM STATE"
echo "---------------------------------"
echo "For a completely fresh platform (if you're the admin):"
echo "1. Go to Platform Status in the app"
echo "2. Initialize platform (if not done)"
echo "3. Each user creates fresh profiles"
echo ""

echo "🚀 RECOMMENDED TESTING FLOW"
echo "============================"
echo "1. Use one of the fresh wallets above"
echo "2. Import into Phantom wallet"
echo "3. Switch to Devnet and get SOL from faucet"
echo "4. Connect to GadaWallet app"
echo "5. Go to Platform Status → Create User Profile"
echo "6. Go to Inheritance Manager → Add Heir"
echo "7. Test the complete flow with clean data!"
echo ""

echo "✅ Fresh test environment ready!"
echo "💡 Use fresh wallets for the cleanest testing experience."