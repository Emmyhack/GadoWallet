const anchor = require("@coral-xyz/anchor");
const { Program, AnchorProvider, Wallet } = require("@coral-xyz/anchor");
const { 
  Connection, 
  Keypair, 
  clusterApiUrl,
  LAMPORTS_PER_SOL,
  PublicKey 
} = require("@solana/web3.js");

/**
 * Simple test to check for existing Smart Wallets and create test data
 */
async function testSmartWalletDiscovery() {
  console.log("🧪 Testing Smart Wallet Discovery...\n");

  try {
    // Configure connection
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    
    // Create a test wallet
    const wallet = Keypair.generate();
    
    console.log("💰 Funding test wallet...");
    const airdropTx = await connection.requestAirdrop(
      wallet.publicKey,
      0.1 * LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropTx);

    // Set up provider and program
    const anchorWallet = new Wallet(wallet);
    const provider = new AnchorProvider(connection, anchorWallet, {
      commitment: "confirmed",
    });
    anchor.setProvider(provider);

    // Load the IDL
    const IDL = require("./target/idl/gado.json");
    const program = new Program(IDL, provider);

    console.log("🔍 Checking for existing Smart Wallets...");
    
    // Try to fetch all Smart Wallet accounts
    const accounts = await program.account.smartWallet.all();
    
    console.log(`📊 Found ${accounts.length} Smart Wallet accounts on devnet`);
    
    if (accounts.length === 0) {
      console.log("⚠️  No Smart Wallets found. Let's create some test wallets!\n");
      
      // Create test Smart Wallets
      await createTestSmartWallets(program, connection);
    } else {
      console.log("✅ Found existing Smart Wallets:");
      accounts.forEach((acc, index) => {
        console.log(`  ${index + 1}. Owner: ${acc.account.owner.toString()}`);
        console.log(`     Address: ${acc.publicKey.toString()}`);
        console.log(`     Heirs: ${acc.account.heirs.length}`);
        console.log(`     Executed: ${acc.account.isExecuted}`);
        console.log("");
      });
    }

  } catch (error) {
    console.error("❌ Error testing Smart Wallet discovery:", error);
  }
}

/**
 * Create test Smart Wallets for keeper bot testing
 */
async function createTestSmartWallets(program, connection) {
  console.log("🏗️  Creating test Smart Wallets...\n");

  try {
    // Create test owners and heirs
    const owner1 = Keypair.generate();
    const owner2 = Keypair.generate();
    const heir1 = Keypair.generate();
    const heir2 = Keypair.generate();
    const heir3 = Keypair.generate();

    // Fund the owners
    console.log("💰 Funding test owners...");
    await connection.requestAirdrop(owner1.publicKey, 0.5 * LAMPORTS_PER_SOL);
    await connection.requestAirdrop(owner2.publicKey, 0.5 * LAMPORTS_PER_SOL);
    
    // Wait a bit for funding
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create Smart Wallet 1
    console.log("📋 Creating Smart Wallet 1...");
    const [smartWallet1PDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("smart_wallet"), owner1.publicKey.toBuffer()],
      program.programId
    );

    const [smartWallet1AssetPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("smart_wallet_pda"), owner1.publicKey.toBuffer()],
      program.programId
    );

    const heirs1 = [
      { heirPubkey: heir1.publicKey, allocationPercentage: 60 },
      { heirPubkey: heir2.publicKey, allocationPercentage: 40 }
    ];

    const provider1 = new AnchorProvider(connection, new Wallet(owner1), { commitment: "confirmed" });
    const program1 = new Program(require("./target/idl/gado.json"), provider1);

    const tx1 = await program1.methods
      .createSmartWalletInheritance(heirs1, new anchor.BN(300)) // 5 minutes for testing
      .accountsPartial({
        smartWallet: smartWallet1PDA,
        smartWalletPda: smartWallet1AssetPDA,
        owner: owner1.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([owner1])
      .rpc();

    console.log("✅ Smart Wallet 1 created:", tx1);
    console.log("   Owner:", owner1.publicKey.toString());
    console.log("   Smart Wallet PDA:", smartWallet1PDA.toString());

    // Deposit some SOL to Smart Wallet 1
    console.log("💸 Depositing SOL to Smart Wallet 1...");
    const depositTx1 = await program1.methods
      .depositToSmartWallet(new anchor.BN(0.1 * LAMPORTS_PER_SOL))
      .accountsPartial({
        smartWallet: smartWallet1PDA,
        smartWalletPda: smartWallet1AssetPDA,
        owner: owner1.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([owner1])
      .rpc();

    console.log("✅ Deposited 0.1 SOL to Smart Wallet 1:", depositTx1);

    // Create Smart Wallet 2
    console.log("\n📋 Creating Smart Wallet 2...");
    const [smartWallet2PDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("smart_wallet"), owner2.publicKey.toBuffer()],
      program.programId
    );

    const [smartWallet2AssetPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("smart_wallet_pda"), owner2.publicKey.toBuffer()],
      program.programId
    );

    const heirs2 = [
      { heirPubkey: heir2.publicKey, allocationPercentage: 30 },
      { heirPubkey: heir3.publicKey, allocationPercentage: 70 }
    ];

    const provider2 = new AnchorProvider(connection, new Wallet(owner2), { commitment: "confirmed" });
    const program2 = new Program(require("./target/idl/gado.json"), provider2);

    const tx2 = await program2.methods
      .createSmartWalletInheritance(heirs2, new anchor.BN(600)) // 10 minutes for testing
      .accountsPartial({
        smartWallet: smartWallet2PDA,
        smartWalletPda: smartWallet2AssetPDA,
        owner: owner2.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([owner2])
      .rpc();

    console.log("✅ Smart Wallet 2 created:", tx2);
    console.log("   Owner:", owner2.publicKey.toString());
    console.log("   Smart Wallet PDA:", smartWallet2PDA.toString());

    // Deposit some SOL to Smart Wallet 2
    console.log("💸 Depositing SOL to Smart Wallet 2...");
    const depositTx2 = await program2.methods
      .depositToSmartWallet(new anchor.BN(0.05 * LAMPORTS_PER_SOL))
      .accountsPartial({
        smartWallet: smartWallet2PDA,
        smartWalletPda: smartWallet2AssetPDA,
        owner: owner2.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([owner2])
      .rpc();

    console.log("✅ Deposited 0.05 SOL to Smart Wallet 2:", depositTx2);

    console.log("\n🎉 Test Smart Wallets created successfully!");
    console.log("📝 Summary:");
    console.log(`   Smart Wallet 1: ${owner1.publicKey.toString()} (5min inactivity, 0.1 SOL)`);
    console.log(`   Smart Wallet 2: ${owner2.publicKey.toString()} (10min inactivity, 0.05 SOL)`);
    console.log("\n⏰ Wait 5-10 minutes and run the keeper bot to test inheritance execution!");

    // Save the owner keys for later use
    const testData = {
      owners: [
        {
          publicKey: owner1.publicKey.toString(),
          secretKey: Array.from(owner1.secretKey),
          smartWalletPDA: smartWallet1PDA.toString(),
          inactivityPeriod: 300,
          balance: 0.1
        },
        {
          publicKey: owner2.publicKey.toString(),
          secretKey: Array.from(owner2.secretKey),
          smartWalletPDA: smartWallet2PDA.toString(),
          inactivityPeriod: 600,
          balance: 0.05
        }
      ],
      heirs: [
        { publicKey: heir1.publicKey.toString(), secretKey: Array.from(heir1.secretKey) },
        { publicKey: heir2.publicKey.toString(), secretKey: Array.from(heir2.secretKey) },
        { publicKey: heir3.publicKey.toString(), secretKey: Array.from(heir3.secretKey) }
      ]
    };

    require("fs").writeFileSync("test-smart-wallets.json", JSON.stringify(testData, null, 2));
    console.log("💾 Test data saved to test-smart-wallets.json");

  } catch (error) {
    console.error("❌ Error creating test Smart Wallets:", error);
  }
}

// Run the test
if (require.main === module) {
  testSmartWalletDiscovery().catch(console.error);
}

module.exports = { testSmartWalletDiscovery, createTestSmartWallets };