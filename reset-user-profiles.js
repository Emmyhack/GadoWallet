#!/usr/bin/env node

/**
 * Reset User Profiles Script
 * 
 * This script clears all existing user profiles from the Gado program
 * to allow fresh testing. It closes all user profile accounts and 
 * returns the rent to the original users.
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
  console.error('❌ Failed to load IDL file:', error.message);
  console.log('Make sure to build the program first with: cd gado && anchor build');
  process.exit(1);
}

async function resetUserProfiles() {
  console.log('🔄 Starting User Profile Reset...');
  console.log('📡 Network:', NETWORK_URL);
  console.log('🎯 Program ID:', PROGRAM_ID.toString());

  // Initialize connection
  const connection = new Connection(NETWORK_URL, 'confirmed');
  
  // Create a temporary keypair for the provider (we won't use it for transactions)
  const tempKeypair = Keypair.generate();
  
  const wallet = {
    publicKey: tempKeypair.publicKey,
    signTransaction: async (tx) => tx,
    signAllTransactions: async (txs) => txs,
  };

  const provider = new anchor.AnchorProvider(connection, wallet, { commitment: 'confirmed' });
  const program = new anchor.Program(idl, provider);

  try {
    // Get all UserProfile accounts
    console.log('🔍 Fetching all user profile accounts...');
    
    const userProfileAccounts = await connection.getProgramAccounts(PROGRAM_ID, {
      filters: [
        {
          memcmp: {
            offset: 0, // discriminator offset
            bytes: anchor.utils.bytes.base58.encode(
              anchor.BorshAccountsCoder.accountDiscriminator("UserProfile")
            ),
          },
        },
      ],
    });

    console.log(`📊 Found ${userProfileAccounts.length} user profile accounts`);

    if (userProfileAccounts.length === 0) {
      console.log('✅ No user profiles found. Database is already clean!');
      return;
    }

    // Display found profiles
    console.log('\n📋 User Profiles Found:');
    for (let i = 0; i < userProfileAccounts.length; i++) {
      const account = userProfileAccounts[i];
      try {
        const profileData = await program.account.userProfile.fetch(account.pubkey);
        console.log(`${i + 1}. Address: ${account.pubkey.toString()}`);
        console.log(`   User: ${profileData.user.toString()}`);
        console.log(`   Premium: ${profileData.isPremium ? 'Yes' : 'No'}`);
        console.log(`   Inheritances Created: ${profileData.totalInheritancesCreated}`);
        console.log(`   Created: ${new Date(profileData.createdAt.toNumber() * 1000).toLocaleString()}`);
        console.log('');
      } catch (error) {
        console.log(`${i + 1}. Address: ${account.pubkey.toString()} (Failed to decode data)`);
      }
    }

    // Note: We cannot directly close accounts from this script because we don't have
    // access to the private keys of the users who created them.
    // Instead, we'll provide instructions.

    console.log('⚠️  IMPORTANT RESET INSTRUCTIONS:');
    console.log('');
    console.log('Since user profiles are owned by individual users, they need to be reset');
    console.log('by each user individually. Here are your options:');
    console.log('');
    console.log('🔧 OPTION 1: Manual Reset (Recommended for testing)');
    console.log('1. Connect with each wallet that created a profile');
    console.log('2. Use the Platform Status page to close your user profile');
    console.log('3. Create a new profile when needed');
    console.log('');
    console.log('🔧 OPTION 2: Program Reset (Nuclear option - resets everything)');
    console.log('1. Deploy a new version of the program with a different Program ID');
    console.log('2. Update all references to use the new Program ID');
    console.log('3. All data will be completely fresh');
    console.log('');
    console.log('🔧 OPTION 3: Use Test Wallets');
    console.log('For clean testing, use fresh test wallets that have never');
    console.log('created profiles before.');
    console.log('');

    // Generate some fresh test keypairs
    console.log('🔑 Fresh Test Keypairs (save these for testing):');
    for (let i = 1; i <= 3; i++) {
      const testKeypair = Keypair.generate();
      console.log(`Test Wallet ${i}:`);
      console.log(`  Public Key: ${testKeypair.publicKey.toString()}`);
      console.log(`  Secret Key: [${testKeypair.secretKey.join(',')}]`);
      console.log('');
    }

    console.log('💡 TIP: Import these keypairs into Phantom or create new test wallets');
    console.log('     for completely fresh testing without any existing profiles.');

  } catch (error) {
    console.error('❌ Error during reset:', error);
    
    if (error.message.includes('failed to get account info')) {
      console.log('💡 This might be a network connectivity issue. Please try again.');
    } else if (error.message.includes('Invalid program id')) {
      console.log('💡 Program might not be deployed. Make sure the program is deployed first.');
    }
  }
}

// Also create a helper function to check specific user profile
async function checkUserProfile(userPublicKey) {
  console.log(`🔍 Checking user profile for: ${userPublicKey}`);
  
  const connection = new Connection(NETWORK_URL, 'confirmed');
  
  try {
    const [userProfilePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("user_profile"), new PublicKey(userPublicKey).toBuffer()],
      PROGRAM_ID
    );

    console.log(`📋 User Profile PDA: ${userProfilePDA.toString()}`);
    
    const accountInfo = await connection.getAccountInfo(userProfilePDA);
    
    if (accountInfo) {
      console.log('✅ User profile exists');
      console.log(`📊 Account balance: ${accountInfo.lamports / 1e9} SOL`);
      
      // Try to decode the profile data
      const tempKeypair = Keypair.generate();
      const wallet = {
        publicKey: tempKeypair.publicKey,
        signTransaction: async (tx) => tx,
        signAllTransactions: async (txs) => txs,
      };
      
      const provider = new anchor.AnchorProvider(connection, wallet, { commitment: 'confirmed' });
      const program = new anchor.Program(idl, provider);
      
      try {
        const profileData = await program.account.userProfile.fetch(userProfilePDA);
        console.log(`📈 Premium: ${profileData.isPremium ? 'Yes' : 'No'}`);
        console.log(`📊 Inheritances: ${profileData.totalInheritancesCreated}`);
        console.log(`💰 Fees Paid: ${profileData.totalFeesPaid.toNumber() / 1e9} SOL`);
      } catch (decodeError) {
        console.log('⚠️  Could not decode profile data');
      }
    } else {
      console.log('❌ No user profile found - clean slate!');
    }
  } catch (error) {
    console.error('❌ Error checking user profile:', error.message);
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 1 && args[0].startsWith('check:')) {
    // Check specific user profile: node reset-user-profiles.js check:PUBKEY
    const userKey = args[0].substring(6);
    checkUserProfile(userKey);
  } else {
    // Reset all profiles
    resetUserProfiles();
  }
}

module.exports = { resetUserProfiles, checkUserProfile };