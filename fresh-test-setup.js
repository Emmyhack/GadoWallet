#!/usr/bin/env node

/**
 * Fresh Test Setup Script
 * 
 * Creates fresh test wallets and provides tools for clean testing
 */

const { Keypair, PublicKey, Connection } = require('@solana/web3.js');

console.log('🧪 FRESH TEST SETUP FOR GADO WALLET');
console.log('=====================================\n');

// Generate fresh test keypairs
console.log('🔑 FRESH TEST WALLETS:');
console.log('Use these wallets for completely clean testing:\n');

for (let i = 1; i <= 5; i++) {
  const testKeypair = Keypair.generate();
  
  console.log(`👤 Test Wallet ${i}:`);
  console.log(`   Public Key:  ${testKeypair.publicKey.toString()}`);
  console.log(`   Secret Key:  [${testKeypair.secretKey.join(',')}]`);
  console.log(`   Import JSON: ${JSON.stringify(Array.from(testKeypair.secretKey))}`);
  console.log('');
}

console.log('📋 TESTING INSTRUCTIONS:');
console.log('1. Copy any of the secret keys above');
console.log('2. Import into Phantom wallet or use in code');
console.log('3. Get some devnet SOL from https://faucet.solana.com');
console.log('4. These wallets have no existing profiles - perfect for testing!');
console.log('');

console.log('🔄 RESET OPTIONS:');
console.log('');
console.log('OPTION A - Use Fresh Wallets (Recommended):');
console.log('• Use the wallets generated above');
console.log('• No existing data to worry about');
console.log('• Perfect for clean testing');
console.log('');
console.log('OPTION B - Check Existing Profiles:');
console.log('• Run: node reset-user-profiles.js check:YOUR_PUBLIC_KEY');
console.log('• See what profiles already exist');
console.log('');
console.log('OPTION C - Manual Profile Management:');
console.log('• Go to Platform Status in the app');
console.log('• Create/recreate user profiles as needed');
console.log('• Each wallet manages its own profile');
console.log('');

// Create a quick airdrop helper
console.log('💰 QUICK AIRDROP HELPER:');
console.log('');

const airdropHelper = `
// Quick airdrop function (paste in browser console or Node.js)
async function airdrop(publicKey) {
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  try {
    const signature = await connection.requestAirdrop(
      new PublicKey(publicKey),
      2 * 1000000000 // 2 SOL
    );
    await connection.confirmTransaction(signature);
    console.log('✅ Airdrop successful:', signature);
  } catch (error) {
    console.error('❌ Airdrop failed:', error.message);
  }
}

// Usage: airdrop('YOUR_PUBLIC_KEY_HERE')
`;

console.log(airdropHelper);

// Create wallet import helper for Phantom
console.log('📱 PHANTOM WALLET IMPORT:');
console.log('1. Open Phantom wallet');
console.log('2. Click Settings → Import Private Key');
console.log('3. Paste the secret key array (the [1,2,3,...] format)');
console.log('4. Give it a name like "Gado Test 1"');
console.log('5. Switch to Devnet in Phantom settings');
console.log('');

console.log('🚀 READY TO TEST!');
console.log('Your test environment is now ready with fresh wallets.');