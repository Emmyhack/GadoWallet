import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { Gado } from "./target/types/gado";
import fs from "fs";

async function initializePlatform() {
  // Setup connection and provider
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  
  // Load wallet from Solana CLI config
  const walletPath = process.env.HOME + "/.config/solana/id.json";
  if (!fs.existsSync(walletPath)) {
    console.error("❌ Wallet not found. Please run 'solana-keygen new' first.");
    process.exit(1);
  }
  
  const keypairData = JSON.parse(fs.readFileSync(walletPath, "utf8"));
  const keypair = Keypair.fromSecretKey(new Uint8Array(keypairData));
  
  const wallet = {
    publicKey: keypair.publicKey,
    signTransaction: async (tx: any) => {
      tx.partialSign(keypair);
      return tx;
    },
    signAllTransactions: async (txs: any[]) => {
      txs.forEach(tx => tx.partialSign(keypair));
      return txs;
    },
  };
  
  const provider = new AnchorProvider(connection, wallet as any, {
    commitment: "confirmed",
  });
  
  // Load the program
  const idl = JSON.parse(fs.readFileSync("./target/idl/gado.json", "utf8"));
  const programId = new PublicKey(idl.address);
  const program = new Program(idl, provider) as Program<Gado>;
  
  console.log("🎯 Program ID:", programId.toString());
  console.log("👤 Admin wallet:", keypair.publicKey.toString());
  
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
    console.log("📊 Platform fee:", config.platformFeeBps, "bps (basis points)");
    console.log("👥 Total users:", config.totalUsers.toString());
    console.log("💎 Premium users:", config.premiumUsers.toString());
    console.log("💰 Total fees collected:", config.totalFeesCollected.toString());
    return;
  } catch (error) {
    console.log("🔧 Platform not initialized. Initializing now...");
  }
  
  try {
    // Initialize the platform
    const tx = await program.methods
      .initialize()
      .accountsPartial({
        platform_config: platformConfigPda,
        treasury: treasuryPda,
        admin: keypair.publicKey,
      })
      .signers([keypair])
      .rpc();
    
    console.log("🎉 Platform initialized successfully!");
    console.log("📝 Transaction signature:", tx);
    
    // Verify initialization
    const config = await program.account.platformConfig.fetch(platformConfigPda);
    const treasury = await program.account.treasury.fetch(treasuryPda);
    
    console.log("\n✅ PLATFORM CONFIGURATION:");
    console.log("👤 Admin:", config.admin.toString());
    console.log("💰 Treasury:", config.treasury.toString());
    console.log("📊 Platform fee:", config.platformFeeBps, "bps (0.5%)");
    console.log("📈 Total users:", config.totalUsers.toString());
    console.log("💎 Premium users:", config.premiumUsers.toString());
    console.log("🏛️ Treasury admin:", treasury.admin.toString());
    console.log("💰 Treasury balance:", treasury.totalBalance.toString());
    
    console.log("\n🎯 Platform is ready for Smart Wallet creation!");
    
  } catch (error: any) {
    console.error("❌ Failed to initialize platform:", error);
    if (error.logs) {
      console.error("📋 Transaction logs:", error.logs);
    }
    process.exit(1);
  }
}

initializePlatform()
  .then(() => {
    console.log("✅ Platform initialization complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Error:", error);
    process.exit(1);
  });
