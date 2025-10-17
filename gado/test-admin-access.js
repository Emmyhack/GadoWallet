// Test admin access and emergency controls
const anchor = require("@coral-xyz/anchor");
const { Connection, PublicKey, Keypair } = require("@solana/web3.js");
const fs = require("fs");

async function testAdminAccess() {
  console.log("🔍 Testing Admin Access and Emergency Controls...\n");
  
  try {
    // Setup connection
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    
    // Load wallet
    const walletPath = process.env.HOME + "/.config/solana/id.json";
    const keypairData = JSON.parse(fs.readFileSync(walletPath, "utf8"));
    const keypair = Keypair.fromSecretKey(new Uint8Array(keypairData));
    
    console.log("👤 Your wallet address:", keypair.publicKey.toString());
    
    // Load program
    const idl = JSON.parse(fs.readFileSync("./target/idl/gado.json", "utf8"));
    const programId = new PublicKey(idl.address);
    console.log("🎯 Program ID:", programId.toString());
    
    // Setup program
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
    
    // Check platform config
    const [platformConfigPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("platform_config")],
      programId
    );
    
    console.log("🏛️ Platform Config PDA:", platformConfigPDA.toString());
    
    // Fetch platform config
    try {
      const platformConfig = await program.account.platformConfig.fetch(platformConfigPDA);
      
      console.log("\n📊 Platform Configuration:");
      console.log("- Admin:", platformConfig.admin.toString());
      console.log("- Platform Fee:", platformConfig.platformFeeBps, "bps");
      console.log("- Is Paused:", platformConfig.isPaused || false);
      console.log("- Total Users:", platformConfig.totalUsers.toString());
      console.log("- Premium Users:", platformConfig.premiumUsers.toString());
      
      // Check if you're the admin
      const isAdmin = platformConfig.admin.equals(keypair.publicKey);
      console.log("\n🔐 Admin Status Check:");
      console.log("- Are you the admin?", isAdmin ? "✅ YES" : "❌ NO");
      
      if (isAdmin) {
        console.log("🎉 You have admin access to emergency controls!");
        console.log("\n📋 What you can do:");
        console.log("- Access emergency controls tab in the frontend");
        console.log("- Pause/Resume platform operations");
        console.log("- Modify platform fees");
        console.log("- Withdraw from treasury");
        console.log("- View platform analytics");
        
        console.log("\n🌐 Access Instructions:");
        console.log("1. Open your browser to: http://localhost:5173");
        console.log("2. Connect your wallet (" + keypair.publicKey.toString().slice(0, 8) + "...)");
        console.log("3. Look for the 'Emergency' tab with a red shield icon");
        console.log("4. Click on it to access admin controls");
      } else {
        console.log("❌ You don't have admin access. Current admin is:");
        console.log("   " + platformConfig.admin.toString());
      }
      
    } catch (error) {
      console.error("❌ Error fetching platform config:", error.message);
      console.log("💡 The platform might not be initialized yet.");
      console.log("   Run: node init-platform.js");
    }
    
  } catch (error) {
    console.error("💥 Error:", error);
  }
}

testAdminAccess().catch(console.error);