import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { 
  PublicKey, 
  Keypair, 
  Connection, 
  LAMPORTS_PER_SOL 
} from "@solana/web3.js";

// Program ID
const PROGRAM_ID = new PublicKey("EciS2vNDTe5S6WnNWEBmdBmKjQL5bsXyfauYmxPFKQGu");

// Simple IDL for testing
const IDL = {
  version: "0.1.0",
  name: "gado",
  address: "EciS2vNDTe5S6WnNWEBmdBmKjQL5bsXyfauYmxPFKQGu",
  instructions: [
    {
      name: "initializeUserProfile",
      accounts: [
        { name: "userProfile", isMut: true, isSigner: false },
        { name: "platformConfig", isMut: true, isSigner: false },
        { name: "user", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false }
      ],
      args: [
        { name: "isPremium", type: "bool" }
      ]
    },
    {
      name: "addCoinHeir",
      accounts: [
        { name: "coinHeir", isMut: true, isSigner: false },
        { name: "userProfile", isMut: true, isSigner: false },
        { name: "owner", isMut: true, isSigner: true },
        { name: "heir", isMut: false, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false }
      ],
      args: [
        { name: "amount", type: "u64" },
        { name: "inactivityPeriodSeconds", type: "i64" }
      ]
    }
  ]
};

async function testInheritance() {
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  const wallet = Keypair.generate(); // Generate test wallet
  
  // Airdrop some SOL for testing
  console.log("Requesting airdrop...");
  const airdropTx = await connection.requestAirdrop(wallet.publicKey, 2 * LAMPORTS_PER_SOL);
  await connection.confirmTransaction(airdropTx);
  console.log("✅ Airdrop complete");

  // Create provider and program
  const provider = new anchor.AnchorProvider(connection, {
    publicKey: wallet.publicKey,
    signTransaction: async (tx) => {
      tx.partialSign(wallet);
      return tx;
    },
    signAllTransactions: async (txs) => {
      return txs.map(tx => {
        tx.partialSign(wallet);
        return tx;
      });
    }
  } as any, { commitment: "confirmed" });

  const program = new Program(IDL as any, provider);
  console.log("✅ Program initialized:", program.programId.toString());

  try {
    // Calculate PDAs
    const [userProfilePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("user_profile"), wallet.publicKey.toBuffer()],
      program.programId
    );

    const [platformConfigPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("platform_config")],
      program.programId
    );

    console.log("📍 PDAs:", {
      userProfile: userProfilePDA.toString(),
      platformConfig: platformConfigPDA.toString()
    });

    // Try to initialize user profile
    console.log("🔄 Initializing user profile...");
    try {
      const initTx = await program.methods
        .initializeUserProfile(false) // false = not premium
        .accounts({
          userProfile: userProfilePDA,
          platformConfig: platformConfigPDA,
          user: wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([wallet])
        .rpc();
      console.log("✅ User profile initialized:", initTx);
    } catch (error) {
      console.log("ℹ️ User profile might already exist or platform not initialized:", error.message);
    }

    // Create test heir
    const heirWallet = Keypair.generate();
    const amount = new anchor.BN(0.1 * LAMPORTS_PER_SOL); // 0.1 SOL
    const inactivityPeriod = new anchor.BN(60); // 1 minute for testing

    const [coinHeirPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("coin_heir"), wallet.publicKey.toBuffer(), heirWallet.publicKey.toBuffer()],
      program.programId
    );

    console.log("🔄 Adding coin heir...");
    const heirTx = await program.methods
      .addCoinHeir(amount, inactivityPeriod)
      .accounts({
        coinHeir: coinHeirPDA,
        userProfile: userProfilePDA,
        owner: wallet.publicKey,
        heir: heirWallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([wallet])
      .rpc();

    console.log("✅ Coin heir added successfully:", heirTx);
    console.log("🎯 Test completed successfully!");

  } catch (error) {
    console.error("❌ Test failed:", error);
    console.error("Error details:", error.message);
    
    // Check if it's an anchor error
    if (error.logs) {
      console.error("Program logs:");
      error.logs.forEach((log, i) => console.error(`${i}: ${log}`));
    }
  }
}

// Run the test
testInheritance().catch(console.error);