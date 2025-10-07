#!/usr/bin/env node

/**
 * Inheritance Debug Tool
 * Helps diagnose issues with the Add Heir functionality
 */

const anchor = require('@coral-xyz/anchor');
const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

// Configuration
const NETWORK_URL = 'https://api.devnet.solana.com';
const PROGRAM_ID = new PublicKey('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM');

// Load program IDL
const idlPath = path.join(__dirname, 'gado/target/idl/gado.json');
let idl;
try {
  idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
} catch (error) {
  console.error('❌ Failed to load IDL file. Make sure to build the program first.');
  process.exit(1);
}

async function diagnoseInheritanceIssue(userWallet) {
  console.log('🔍 INHERITANCE DEBUG TOOL');
  console.log('========================');
  console.log(`👤 User Wallet: ${userWallet}`);
  console.log(`🌐 Network: ${NETWORK_URL}`);
  console.log(`🎯 Program: ${PROGRAM_ID.toString()}`);
  console.log('');

  try {
    const connection = new Connection(NETWORK_URL, 'confirmed');
    const userPublicKey = new PublicKey(userWallet);
    
    // Create temporary wallet for provider
    const tempKeypair = Keypair.generate();
    const wallet = {
      publicKey: tempKeypair.publicKey,
      signTransaction: async (tx) => tx,
      signAllTransactions: async (txs) => txs,
    };

    const provider = new anchor.AnchorProvider(connection, wallet, { commitment: 'confirmed' });
    const program = new anchor.Program(idl, provider);

    console.log('📊 DIAGNOSTIC CHECKS:');
    console.log('====================');

    // 1. Check wallet balance
    console.log('1️⃣ Wallet Balance:');
    const balance = await connection.getBalance(userPublicKey);
    console.log(`   💰 ${balance / 1e9} SOL`);
    
    if (balance < 0.01 * 1e9) {
      console.log('   ⚠️  LOW BALANCE: May not have enough SOL for transaction fees');
      console.log('   💡 Get more SOL from: https://faucet.solana.com');
    } else {
      console.log('   ✅ Balance is sufficient');
    }
    console.log('');

    // 2. Check platform initialization
    console.log('2️⃣ Platform Status:');
    const [platformConfigPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("platform_config")],
      PROGRAM_ID
    );
    
    try {
      const platformConfig = await program.account.platformConfig.fetch(platformConfigPDA);
      console.log('   ✅ Platform is initialized');
      console.log(`   👑 Admin: ${platformConfig.admin.toString()}`);
      console.log(`   💸 Platform Fee: ${platformConfig.platformFeeBps} bps`);
      console.log(`   📊 Total Users: ${platformConfig.totalUsers}`);
    } catch (error) {
      console.log('   ❌ Platform not initialized');
      console.log('   💡 Initialize platform first in Platform Status');
    }
    console.log('');

    // 3. Check user profile
    console.log('3️⃣ User Profile:');
    const [userProfilePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("user_profile"), userPublicKey.toBuffer()],
      PROGRAM_ID
    );
    
    console.log(`   📋 Profile PDA: ${userProfilePDA.toString()}`);
    
    try {
      const userProfile = await program.account.userProfile.fetch(userProfilePDA);
      console.log('   ✅ User profile exists');
      console.log(`   🔓 Premium: ${userProfile.isPremium ? 'Yes' : 'No'}`);
      console.log(`   📈 Inheritances Created: ${userProfile.totalInheritancesCreated}`);
      console.log(`   💰 Total Fees Paid: ${userProfile.totalFeesPaid.toNumber() / 1e9} SOL`);
      console.log(`   📅 Created: ${new Date(userProfile.createdAt.toNumber() * 1000).toLocaleString()}`);
      
      // Check limits for free users
      if (!userProfile.isPremium) {
        console.log('   ℹ️  FREE USER LIMITS:');
        console.log('       • Max 1 heir per inheritance');
        console.log('       • Fixed inactivity period (2 days)');
        console.log('       • Cannot set custom periods');
      }
    } catch (error) {
      console.log('   ❌ User profile does not exist');
      console.log('   💡 Create user profile first:');
      console.log('      1. Go to Platform Status');
      console.log('      2. Click "Create User Profile"');
      console.log('      3. Wait for confirmation');
      return false;
    }
    console.log('');

    // 4. Test heir PDA calculation
    console.log('4️⃣ Heir PDA Test:');
    const testHeirAddress = 'GTCgCfrQJNCnMMYveUvDHhHJx4L5cnFvuyHDAtVuoBVt'; // Using one of our test wallets
    const heirPublicKey = new PublicKey(testHeirAddress);
    
    const [coinHeirPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('coin_heir'), userPublicKey.toBuffer(), heirPublicKey.toBuffer()],
      PROGRAM_ID
    );
    
    console.log(`   🎯 Test Heir: ${testHeirAddress}`);
    console.log(`   📋 Coin Heir PDA: ${coinHeirPDA.toString()}`);
    
    // Check if heir already exists
    try {
      const existingHeir = await program.account.coinHeir.fetch(coinHeirPDA);
      console.log('   ⚠️  Heir already exists for this combination');
      console.log(`   💰 Amount: ${existingHeir.amount.toNumber() / 1e9} SOL`);
      console.log(`   ⏰ Inactivity Period: ${existingHeir.inactivityPeriodSeconds.toNumber() / 86400} days`);
      console.log('   💡 Use different heir address or different amount');
    } catch (error) {
      console.log('   ✅ No existing heir found - ready for new heir');
    }
    console.log('');

    // 5. Simulation test
    console.log('5️⃣ Transaction Simulation:');
    console.log('   🔄 This would simulate the actual transaction...');
    console.log('   💡 Make sure to:');
    console.log('      • Use valid heir wallet address');
    console.log('      • Set amount > 0');
    console.log('      • Set inactivity days ≥ 1');
    console.log('      • Ensure sufficient SOL balance');
    console.log('      • Use unique heir addresses');
    console.log('');

    console.log('📋 SUMMARY:');
    console.log('==========');
    console.log('If all checks above passed, the Add Heir function should work.');
    console.log('Common issues:');
    console.log('• User profile missing → Create in Platform Status');
    console.log('• Insufficient balance → Get SOL from faucet');
    console.log('• Heir already exists → Use different heir address');
    console.log('• Invalid addresses → Double-check wallet addresses');
    console.log('• Platform not initialized → Initialize platform first');

    return true;

  } catch (error) {
    console.error('❌ Diagnostic failed:', error.message);
    return false;
  }
}

// Main execution
const userWallet = process.argv[2];

if (!userWallet) {
  console.log('🔍 INHERITANCE DEBUG TOOL');
  console.log('=========================');
  console.log('');
  console.log('Usage: node diagnose-inheritance.js YOUR_WALLET_ADDRESS');
  console.log('');
  console.log('Example:');
  console.log('node diagnose-inheritance.js GTCgCfrQJNCnMMYveUvDHhHJx4L5cnFvuyHDAtVuoBVt');
  console.log('');
  console.log('This tool will check:');
  console.log('• Wallet balance');
  console.log('• Platform initialization');
  console.log('• User profile status');
  console.log('• Potential heir conflicts');
  console.log('• Transaction requirements');
  process.exit(1);
}

diagnoseInheritanceIssue(userWallet);