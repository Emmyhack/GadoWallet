#!/usr/bin/env node

/**
 * Quick Profile Checker
 * Check if a wallet has existing user profiles
 */

const { Connection, PublicKey } = require('@solana/web3.js');

const NETWORK_URL = 'https://api.devnet.solana.com';
const PROGRAM_ID = new PublicKey('EciS2vNDTe5S6WnNWEBmdBmKjQL5bsXyfauYmxPFKQGu');

async function checkProfile(walletAddress) {
  console.log(`🔍 Checking profile for: ${walletAddress}`);
  console.log(`📡 Network: ${NETWORK_URL}`);
  console.log(`🎯 Program: ${PROGRAM_ID.toString()}`);
  console.log('');

  try {
    const connection = new Connection(NETWORK_URL, 'confirmed');
    
    // Check wallet balance first
    const walletPubkey = new PublicKey(walletAddress);
    const balance = await connection.getBalance(walletPubkey);
    console.log(`💰 Wallet Balance: ${balance / 1e9} SOL`);
    
    // Check user profile
    const [userProfilePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("user_profile"), walletPubkey.toBuffer()],
      PROGRAM_ID
    );
    
    console.log(`📋 Profile PDA: ${userProfilePDA.toString()}`);
    
    const profileAccount = await connection.getAccountInfo(userProfilePDA);
    
    if (profileAccount) {
      console.log('✅ USER PROFILE EXISTS');
      console.log(`   💳 Account Balance: ${profileAccount.lamports / 1e9} SOL`);
      console.log(`   📊 Data Length: ${profileAccount.data.length} bytes`);
      console.log(`   👑 Owner: ${profileAccount.owner.toString()}`);
      console.log('');
      console.log('🔄 TO RESET: This wallet already has a profile.');
      console.log('   • Use a different wallet for fresh testing, OR');
      console.log('   • Close the profile in Platform Status, OR');
      console.log('   • Continue with existing profile');
    } else {
      console.log('❌ NO USER PROFILE FOUND');
      console.log('');
      console.log('✨ FRESH WALLET: Perfect for clean testing!');
      console.log('   1. Connect this wallet to GadaWallet');
      console.log('   2. Go to Platform Status → Create User Profile');
      console.log('   3. Start testing with completely clean state');
    }
    
  } catch (error) {
    console.error('❌ Error checking profile:', error.message);
    
    if (error.message.includes('Invalid public key')) {
      console.log('💡 Make sure the wallet address is valid');
    } else if (error.message.includes('failed to get account info')) {
      console.log('💡 Network connection issue - try again');
    }
  }
}

// Main execution
const walletAddress = process.argv[2];

if (!walletAddress) {
  console.log('🔍 PROFILE CHECKER');
  console.log('==================');
  console.log('');
  console.log('Usage: node check-profile.js WALLET_ADDRESS');
  console.log('');
  console.log('Example:');
  console.log('node check-profile.js GTCgCfrQJNCnMMYveUvDHhHJx4L5cnFvuyHDAtVuoBVt');
  console.log('');
  process.exit(1);
}

checkProfile(walletAddress);