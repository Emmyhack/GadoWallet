// Transfer admin privileges to a new address
const anchor = require("@coral-xyz/anchor");
const { Connection, PublicKey, Keypair } = require("@solana/web3.js");
const fs = require("fs");

async function transferAdmin() {
  console.log("🔄 Transferring Admin Privileges...\n");
  
  try {
    // Setup connection
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    
    // Load wallet (current admin)
    const walletPath = process.env.HOME + "/.config/solana/id.json";
    const keypairData = JSON.parse(fs.readFileSync(walletPath, "utf8"));
    const keypair = Keypair.fromSecretKey(new Uint8Array(keypairData));
    
    console.log("👤 Current admin wallet:", keypair.publicKey.toString());
    
    // New admin address
    const newAdminAddress = "49wLubTmowVu8idEHdFQ6EAQnmktDJncGc7LnYcKEfzz";
    const newAdmin = new PublicKey(newAdminAddress);
    console.log("🎯 New admin address:", newAdmin.toString());
    
    // Load program
    const idl = JSON.parse(fs.readFileSync("./target/idl/gado.json", "utf8"));
    const programId = new PublicKey(idl.address);
    
    const wallet = {
      publicKey: keypair.publicKey,
      signTransaction: async (tx) => {
        tx.partialSign(keypair);
        return tx;
      },
      signAllTransactions: async (txs) => {
        txs.forEach(tx => tx.partialSign(keypair));
        return txs;
      },
    };
    
    const provider = new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" });
    const program = new anchor.Program(idl, provider);
    
    console.log("🎯 Program ID:", programId.toString());
    
    // Derive PDAs
    const [platformConfigPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("platform_config")],
      programId
    );
    
    const [treasuryPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("treasury")],
      programId
    );
    
    console.log("🏛️ Platform Config PDA:", platformConfigPda.toString());
    console.log("💰 Treasury PDA:", treasuryPda.toString());
    
    // Check current admin
    try {
      const config = await program.account.platformConfig.fetch(platformConfigPda);
      console.log("\n📊 Current Platform Configuration:");
      console.log("- Current Admin:", config.admin.toString());
      console.log("- Platform Fee:", config.platformFeeBps, "bps");
      console.log("- Is Paused:", config.isPaused || false);
      
      if (!config.admin.equals(keypair.publicKey)) {
        console.error("❌ You are not the current admin. Cannot transfer admin privileges.");
        process.exit(1);
      }
      
    } catch (error) {
      console.error("❌ Error fetching platform config:", error.message);
      process.exit(1);
    }
    
    console.log("\n🔄 Executing admin transfer...");
    
    // Transfer admin privileges
    const tx = await program.methods
      .transferAdmin(newAdmin)
      .accounts({
        platformConfig: platformConfigPda,
        treasury: treasuryPda,
        admin: keypair.publicKey,
      })
      .signers([keypair])
      .rpc();
    
    console.log("✅ Admin transfer completed!");
    console.log("📝 Transaction signature:", tx);
    
    // Verify the transfer
    console.log("\n🔍 Verifying admin transfer...");
    const updatedConfig = await program.account.platformConfig.fetch(platformConfigPda);
    const updatedTreasury = await program.account.treasury.fetch(treasuryPda);
    
    console.log("📊 Updated Configuration:");
    console.log("- Platform Config Admin:", updatedConfig.admin.toString());
    console.log("- Treasury Admin:", updatedTreasury.admin.toString());
    console.log("- Transfer successful:", updatedConfig.admin.equals(newAdmin) ? "✅ YES" : "❌ NO");
    
    if (updatedConfig.admin.equals(newAdmin) && updatedTreasury.admin.equals(newAdmin)) {
      console.log("\n🎉 Admin transfer completed successfully!");
      console.log("🔐 New admin can now:");
      console.log("- Access emergency controls in the frontend");
      console.log("- Pause/Resume platform operations");
      console.log("- Modify platform fees");
      console.log("- Withdraw from treasury");
      console.log("- View platform analytics");
      
      console.log("\n⚠️  Important:");
      console.log("- You (current wallet) no longer have admin privileges");
      console.log("- Make sure the new admin has access to their private key");
      console.log("- The frontend will now recognize the new admin address");
    } else {
      console.error("❌ Admin transfer verification failed!");
    }
    
  } catch (error) {
    console.error("💥 Error:", error);
    
    if (error.message && error.message.includes("UnauthorizedAdmin")) {
      console.error("❌ You are not authorized to transfer admin privileges.");
    } else if (error.message && error.message.includes("InvalidPublicKey")) {
      console.error("❌ Invalid new admin address provided.");
    }
    
    process.exit(1);
  }
}

transferAdmin()
  .then(() => {
    console.log("✅ Admin transfer process completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Failed:", error);
    process.exit(1);
  });