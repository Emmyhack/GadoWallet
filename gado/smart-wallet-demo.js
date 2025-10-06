// Smart Wallet Full Functionality Demo (JavaScript)
const anchor = require("@coral-xyz/anchor");
const { Connection, Keypair, clusterApiUrl, LAMPORTS_PER_SOL, PublicKey } = require("@solana/web3.js");
const fs = require("fs");

async function demoFullSmartWallet() {
  console.log("🚀 Smart Wallet Full Functionality Demo...\n");

  // Configure the connection
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  
  // Use existing wallet with funds
  const walletPath = process.env.HOME + "/.config/solana/id.json";
  const ownerKeypairData = JSON.parse(fs.readFileSync(walletPath, "utf8"));
  const ownerKeypair = Keypair.fromSecretKey(new Uint8Array(ownerKeypairData));
  const recipientKeypair = Keypair.generate();

  console.log("💰 Using existing wallet with funds...");
  
  const ownerBalance = await connection.getBalance(ownerKeypair.publicKey);
  console.log(`📊 Owner balance: ${ownerBalance / LAMPORTS_PER_SOL} SOL`);
  console.log(`📍 Recipient address: ${recipientKeypair.publicKey.toString()}\n`);

  // Set up the provider and program
  const wallet = {
    publicKey: ownerKeypair.publicKey,
    signTransaction: async (tx) => {
      tx.partialSign(ownerKeypair);
      return tx;
    },
    signAllTransactions: async (txs) => {
      txs.forEach(tx => tx.partialSign(ownerKeypair));
      return txs;
    },
  };

  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  anchor.setProvider(provider);

  // Load program
  const idl = JSON.parse(fs.readFileSync("./target/idl/gado.json", "utf8"));
  const programId = new PublicKey(idl.address);
  const program = new anchor.Program(idl, provider);

  console.log("📋 Demo Configuration:");
  console.log(`Program ID: ${programId.toString()}`);
  console.log(`Owner: ${ownerKeypair.publicKey.toString()}`);
  console.log(`Recipient: ${recipientKeypair.publicKey.toString()}\n`);

  try {
    // Helper functions for Smart Wallet operations
    const getSmartWalletPDA = (owner) => {
      return PublicKey.findProgramAddressSync(
        [Buffer.from("smart_wallet"), owner.toBuffer()],
        programId
      );
    };

    const getSmartWalletAssetPDA = (owner) => {
      return PublicKey.findProgramAddressSync(
        [Buffer.from("smart_wallet_pda"), owner.toBuffer()],
        programId
      );
    };

    // Step 1: Create Smart Wallet with inheritance setup
    console.log("🏗️  Step 1: Creating Smart Wallet inheritance setup...");
    
    const heir1 = Keypair.generate();
    
    // Free users can only have 1 heir, premium users can have up to 10
    const heirs = [
      { heirPubkey: heir1.publicKey, allocationPercentage: 100 }, // 100% to single heir
    ];

    const [smartWalletPDA] = getSmartWalletPDA(ownerKeypair.publicKey);
    const [smartWalletAssetPDA] = getSmartWalletAssetPDA(ownerKeypair.publicKey);

    // Initialize user profile first (required for smart wallet creation)
    try {
      const [userProfilePDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("user_profile"), ownerKeypair.publicKey.toBuffer()],
        programId
      );

      const [platformConfigPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("platform_config")],
        programId
      );

      await program.methods
        .initializeUserProfile(false) // free user
        .accounts({
          userProfile: userProfilePDA,
          platformConfig: platformConfigPDA,
          user: ownerKeypair.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([ownerKeypair])
        .rpc();

      console.log("✅ User profile initialized");
    } catch (error) {
      console.log("ℹ️  User profile already exists or initialization failed");
    }

    // Create Smart Wallet (free users must use default 2 day inactivity period)
    const INACTIVITY_PERIOD_SECONDS = 2 * 24 * 60 * 60; // 2 days for free users
    const createTx = await program.methods
      .createSmartWalletInheritance(heirs, new anchor.BN(INACTIVITY_PERIOD_SECONDS))
      .accounts({
        smartWallet: smartWalletPDA,
        smartWalletPda: smartWalletAssetPDA,
        owner: ownerKeypair.publicKey,
        userProfile: PublicKey.findProgramAddressSync(
          [Buffer.from("user_profile"), ownerKeypair.publicKey.toBuffer()],
          programId
        )[0],
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([ownerKeypair])
      .rpc();

    console.log(`✅ Smart Wallet created: ${createTx}`);

    // Step 2: Get Smart Wallet address
    console.log("\n📍 Step 2: Smart Wallet Address Information...");
    console.log(`🏠 Smart Wallet Address: ${smartWalletAssetPDA.toString()}`);
    console.log(`💡 This is the address you can share to receive SOL and tokens!`);
    console.log(`💡 Anyone can send funds to this address and it will be managed by the smart contract`);

    // Step 3: Deposit SOL to Smart Wallet
    console.log("\n💸 Step 3: Depositing SOL to Smart Wallet...");
    const depositAmount = 1.0 * LAMPORTS_PER_SOL;
    
    const depositTx = await program.methods
      .depositToSmartWallet(new anchor.BN(depositAmount))
      .accounts({
        smartWallet: smartWalletPDA,
        smartWalletPda: smartWalletAssetPDA,
        owner: ownerKeypair.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([ownerKeypair])
      .rpc();

    console.log(`✅ Deposited 1.0 SOL: ${depositTx}`);

    // Check Smart Wallet balance
    const smartWalletBalance = await connection.getBalance(smartWalletAssetPDA);
    console.log(`📊 Smart Wallet balance: ${smartWalletBalance / LAMPORTS_PER_SOL} SOL`);

    // Step 4: Send SOL from Smart Wallet
    console.log("\n📤 Step 4: Sending SOL from Smart Wallet...");
    const sendAmount = 0.3 * LAMPORTS_PER_SOL;
    
    const sendTx = await program.methods
      .withdrawFromSmartWallet(new anchor.BN(sendAmount))
      .accounts({
        smartWallet: smartWalletPDA,
        smartWalletPda: smartWalletAssetPDA,
        owner: ownerKeypair.publicKey,
        recipient: recipientKeypair.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([ownerKeypair])
      .rpc();

    console.log(`✅ Sent 0.3 SOL to recipient: ${sendTx}`);

    // Check balances after send
    const updatedSmartWalletBalance = await connection.getBalance(smartWalletAssetPDA);
    const recipientBalance = await connection.getBalance(recipientKeypair.publicKey);
    console.log(`📊 Smart Wallet balance after send: ${updatedSmartWalletBalance / LAMPORTS_PER_SOL} SOL`);
    console.log(`📊 Recipient balance: ${recipientBalance / LAMPORTS_PER_SOL} SOL`);

    // Step 5: Get Smart Wallet information
    console.log("\n📋 Step 5: Getting Smart Wallet information...");
    const smartWalletData = await program.account.smartWallet.fetch(smartWalletPDA);
    
    console.log("🏦 Smart Wallet Details:");
    console.log(`- Address: ${smartWalletAssetPDA.toString()}`);
    console.log(`- Owner: ${smartWalletData.owner.toString()}`);
    console.log(`- SOL Balance: ${updatedSmartWalletBalance / LAMPORTS_PER_SOL} SOL`);
    console.log(`- Heirs Count: ${smartWalletData.heirs.length}`);
    console.log(`- Is Executed: ${smartWalletData.isExecuted ? 'Yes' : 'No'}`);
    console.log(`- Inactivity Period: ${smartWalletData.inactivityPeriodSeconds.toString()} seconds`);
    console.log(`- Last Active: ${new Date(smartWalletData.lastActiveTime.toNumber() * 1000).toISOString()}`);
    
    console.log(`- Heirs:`);
    smartWalletData.heirs.forEach((heir, index) => {
      console.log(`  - Heir ${index + 1}: ${heir.heirPubkey.toString()} (${heir.allocationPercentage}%)`);
    });

    // Step 6: Update activity
    console.log("\n🔄 Step 6: Updating Smart Wallet activity...");
    const activityTx = await program.methods
      .updateSmartWalletActivity()
      .accounts({
        smartWallet: smartWalletPDA,
        owner: ownerKeypair.publicKey,
      })
      .signers([ownerKeypair])
      .rpc();
    console.log(`✅ Activity updated: ${activityTx}`);

    // Step 7: Demonstrate receiving funds
    console.log("\n📥 Step 7: How to receive funds...");
    console.log("💡 Your Smart Wallet can receive funds in several ways:");
    console.log(`   1. Direct SOL transfer: solana transfer ${smartWalletAssetPDA.toString()} 0.1`);
    console.log(`   2. From any wallet app using address: ${smartWalletAssetPDA.toString()}`);
    console.log(`   3. Smart contract interactions can send funds directly`);
    console.log(`   4. DeFi protocols can deposit rewards to this address`);

    console.log("\n🎉 Smart Wallet Demo Completed Successfully!");
    console.log("\n📝 Summary of Smart Wallet Features:");
    console.log("✅ Has its own unique wallet address that can receive funds from anyone");
    console.log("✅ Owner can send SOL and SPL tokens to any address");
    console.log("✅ Automatic inheritance distribution when owner becomes inactive");
    console.log("✅ Activity tracking prevents premature inheritance execution");
    console.log("✅ Support for multiple heirs with percentage allocation");
    console.log("✅ Platform fee handling for sustainability");
    console.log("✅ Integration with user profiles and subscription system");

    console.log("\n🔗 Real-World Use Cases:");
    console.log("1. 💰 Digital Estate Planning - Automatically distribute crypto assets to family");
    console.log("2. 🏢 Business Continuity - Transfer business wallets to partners/employees");
    console.log("3. 💳 Savings Account with Inheritance - Long-term savings with backup plan");
    console.log("4. 🤝 Escrow Services - Hold funds until conditions are met");
    console.log("5. 🎁 Gift Planning - Set up future distributions to beneficiaries");
    console.log("6. 🏦 Multi-generational Wealth - Pass wealth across generations automatically");

    console.log("\n💡 Integration Examples:");
    console.log("- E-commerce: Use as payment processor with inheritance backup");
    console.log("- DeFi: Yield farming with automatic beneficiary distribution");
    console.log("- NFT: Collectibles with inheritance to family/friends");
    console.log("- Gaming: In-game assets with succession planning");
    console.log("- DAO: Treasury management with fallback governance");

  } catch (error) {
    console.error("❌ Demo failed:", error);
    
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }
    
    // Try to get more details if it's an Anchor error
    if (typeof error === 'object' && error !== null && 'logs' in error) {
      console.error("Program logs:", error.logs);
    }
  }
}

// Run the demo
console.log("🌟 Starting Comprehensive Smart Wallet Demo");
console.log("============================================\n");

demoFullSmartWallet()
  .then(() => {
    console.log("\n✅ Demo completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Demo failed:", error);
    process.exit(1);
  });