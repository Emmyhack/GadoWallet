// Simple platform initialization utility
const anchor = require("@coral-xyz/anchor");
const { Connection, Keypair, PublicKey } = require("@solana/web3.js");
const fs = require("fs");

async function initializePlatform() {
  try {
    console.log("🎯 Initializing Gado Platform on Devnet...");
    
    // Setup connection
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    
    // Load wallet
    const walletPath = process.env.HOME + "/.config/solana/id.json";
    if (!fs.existsSync(walletPath)) {
      console.error("❌ Wallet not found. Please run 'solana-keygen new' first.");
      process.exit(1);
    }
    
    const keypairData = JSON.parse(fs.readFileSync(walletPath, "utf8"));
    const keypair = Keypair.fromSecretKey(new Uint8Array(keypairData));
    
    console.log("👤 Admin wallet:", keypair.publicKey.toString());
    
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
    
    const provider = new anchor.AnchorProvider(
      connection,
      wallet,
      { commitment: "confirmed" }
    );
    
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
    
    // Check if already initialized
    try {
      const config = await program.account.platformConfig.fetch(platformConfigPda);
      console.log("✅ Platform already initialized!");
      console.log("📊 Platform fee:", config.platformFeeBps, "bps");
      console.log("👥 Total users:", config.totalUsers.toString());
      return;
    } catch (error) {
      console.log("🔧 Platform not initialized. Initializing now...");
    }
    
    // Initialize platform
    const tx = await program.methods
      .initialize()
      .accounts({
        platformConfig: platformConfigPda,
        treasury: treasuryPda,
        admin: keypair.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([keypair])
      .rpc();
    
    console.log("🎉 Platform initialized!");
    console.log("📝 Transaction:", tx);
    
    // Verify
    const config = await program.account.platformConfig.fetch(platformConfigPda);
    console.log("✅ Verification successful!");
    console.log("📊 Platform fee:", config.platformFeeBps, "bps (0.5%)");
    console.log("👥 Total users:", config.totalUsers.toString());
    
  } catch (error) {
    console.error("💥 Error:", error);
    process.exit(1);
  }
}

initializePlatform()
  .then(() => {
    console.log("✅ Platform ready!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Failed:", error);
    process.exit(1);
  });