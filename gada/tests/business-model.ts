import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Gada } from "../target/types/gada";
import { 
  Keypair, 
  LAMPORTS_PER_SOL, 
  SystemProgram,
  PublicKey
} from "@solana/web3.js";
import { 
  TOKEN_PROGRAM_ID, 
  createMint, 
  createAssociatedTokenAccount,
  mintTo,
  getAccount,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { assert } from "chai";

describe("Business Model Integration", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Gada as Program<Gada>;
  
  // Test accounts
  let admin: Keypair;
  let freeUser: Keypair;
  let premiumUser: Keypair;
  let heir1: Keypair;
  let heir2: Keypair;
  let keeper: Keypair;
  
  // Token setup
  let tokenMint: PublicKey;
  let freeUserTokenAccount: PublicKey;
  let premiumUserTokenAccount: PublicKey;
  let heir1TokenAccount: PublicKey;
  
  // PDAs
  let platformConfigPda: PublicKey;
  let treasuryPda: PublicKey;
  let freeUserProfilePda: PublicKey;
  let premiumUserProfilePda: PublicKey;
  let smartWalletPda: PublicKey;
  let smartWalletAssetsPda: PublicKey;

  before(async () => {
    // Generate keypairs
    admin = Keypair.generate();
    freeUser = Keypair.generate();
    premiumUser = Keypair.generate();
    heir1 = Keypair.generate();
    heir2 = Keypair.generate();
    keeper = Keypair.generate();

    // Airdrop SOL
    const accounts = [admin, freeUser, premiumUser, heir1, heir2, keeper];
    for (const account of accounts) {
      await provider.connection.confirmTransaction(
        await provider.connection.requestAirdrop(account.publicKey, 5 * LAMPORTS_PER_SOL)
      );
    }

    // Create token mint
    tokenMint = await createMint(
      provider.connection,
      admin,
      admin.publicKey,
      null,
      9
    );

    // Create token accounts
    freeUserTokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      freeUser,
      tokenMint,
      freeUser.publicKey
    );
    
    premiumUserTokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      premiumUser,
      tokenMint,
      premiumUser.publicKey
    );
    
    heir1TokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      heir1,
      tokenMint,
      heir1.publicKey
    );

    // Mint tokens
    await mintTo(
      provider.connection,
      admin,
      tokenMint,
      freeUserTokenAccount,
      admin.publicKey,
      1000000000000 // 1000 tokens
    );
    
    await mintTo(
      provider.connection,
      admin,
      tokenMint,
      premiumUserTokenAccount,
      admin.publicKey,
      1000000000000 // 1000 tokens
    );

    // Derive PDAs
    [platformConfigPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("platform_config")],
      program.programId
    );

    [treasuryPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("treasury")],
      program.programId
    );

    [freeUserProfilePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("user_profile"), freeUser.publicKey.toBuffer()],
      program.programId
    );

    [premiumUserProfilePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("user_profile"), premiumUser.publicKey.toBuffer()],
      program.programId
    );

    [smartWalletPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("smart_wallet"), premiumUser.publicKey.toBuffer()],
      program.programId
    );

    [smartWalletAssetsPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("smart_wallet_pda"), premiumUser.publicKey.toBuffer()],
      program.programId
    );
  });

  it("Initializes platform with default configuration", async () => {
    await program.methods
      .initialize()
      .accounts({
        platformConfig: platformConfigPda,
        treasury: treasuryPda,
        admin: admin.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([admin])
      .rpc();

    const config = await program.account.platformConfig.fetch(platformConfigPda);
    assert.ok(config.admin.equals(admin.publicKey));
    assert.equal(config.platformFeeBps, 50); // 0.5% default fee
    assert.equal(config.totalFeesCollected.toString(), "0");
    assert.equal(config.totalInheritancesExecuted.toString(), "0");

    const treasury = await program.account.treasury.fetch(treasuryPda);
    assert.ok(treasury.admin.equals(admin.publicKey));
    assert.equal(treasury.totalBalance.toString(), "0");

    console.log("✅ Platform initialized with 0.5% fee");
  });

  it("Creates user profiles (free and premium)", async () => {
    // Create free user profile
    await program.methods
      .initializeUserProfile(false)
      .accounts({
        userProfile: freeUserProfilePda,
        user: freeUser.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([freeUser])
      .rpc();

    // Create premium user profile
    await program.methods
      .initializeUserProfile(true)
      .accounts({
        userProfile: premiumUserProfilePda,
        user: premiumUser.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([premiumUser])
      .rpc();

    const freeProfile = await program.account.userProfile.fetch(freeUserProfilePda);
    const premiumProfile = await program.account.userProfile.fetch(premiumUserProfilePda);

    assert.equal(freeProfile.isPremium, false);
    assert.equal(premiumProfile.isPremium, true);
    assert.equal(freeProfile.totalInheritancesCreated, 0);
    assert.equal(premiumProfile.totalInheritancesCreated, 0);

    console.log("✅ User profiles created (Free: false, Premium: true)");
  });

  it("Premium user can create Smart Wallet with multiple heirs", async () => {
    const heirs = [
      {
        heirPubkey: heir1.publicKey,
        allocationPercentage: 60
      },
      {
        heirPubkey: heir2.publicKey,
        allocationPercentage: 40
      }
    ];

    await program.methods
      .createSmartWalletInheritance(heirs, new anchor.BN(2 * 24 * 60 * 60)) // 2 days custom period
      .accounts({
        smartWallet: smartWalletPda,
        userProfile: premiumUserProfilePda,
        smartWalletPda: smartWalletAssetsPda,
        owner: premiumUser.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([premiumUser])
      .rpc();

    const smartWallet = await program.account.smartWallet.fetch(smartWalletPda);
    const userProfile = await program.account.userProfile.fetch(premiumUserProfilePda);

    assert.equal(smartWallet.heirs.length, 2);
    assert.equal(smartWallet.heirs[0].allocationPercentage, 60);
    assert.equal(smartWallet.heirs[1].allocationPercentage, 40);
    assert.equal(userProfile.totalInheritancesCreated, 1);

    console.log("✅ Premium user created Smart Wallet with 2 heirs and custom inactivity period");
  });

  it("Deposits SOL into Smart Wallet", async () => {
    const depositAmount = new anchor.BN(2 * LAMPORTS_PER_SOL); // 2 SOL

    await program.methods
      .depositToSmartWallet(depositAmount)
      .accounts({
        smartWallet: smartWalletPda,
        smartWalletPda: smartWalletAssetsPda,
        owner: premiumUser.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([premiumUser])
      .rpc();

    const balance = await provider.connection.getBalance(smartWalletAssetsPda);
    assert.ok(balance >= depositAmount.toNumber());

    console.log(`✅ Deposited ${depositAmount.toNumber() / LAMPORTS_PER_SOL} SOL to Smart Wallet`);
  });

  it("Executes inheritance with platform fee deduction", async () => {
    // Wait for inactivity period (in real scenario this would be longer)
    console.log("⏳ Waiting for inactivity period...");
    await new Promise(resolve => setTimeout(resolve, 2100)); // Wait 2.1 seconds

    const initialTreasuryBalance = await provider.connection.getBalance(treasuryPda);
    const initialHeir1Balance = await provider.connection.getBalance(heir1.publicKey);
    const initialHeir2Balance = await provider.connection.getBalance(heir2.publicKey);
    const walletBalance = await provider.connection.getBalance(smartWalletAssetsPda);

    console.log(`💰 Wallet balance before inheritance: ${walletBalance / LAMPORTS_PER_SOL} SOL`);

    await program.methods
      .executeInheritance()
      .accounts({
        smartWallet: smartWalletPda,
        platformConfig: platformConfigPda,
        treasury: treasuryPda,
        userProfile: premiumUserProfilePda,
        smartWalletPda: smartWalletAssetsPda,
        caller: keeper.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([keeper])
      .rpc();

    const finalTreasuryBalance = await provider.connection.getBalance(treasuryPda);
    const finalHeir1Balance = await provider.connection.getBalance(heir1.publicKey);
    const finalHeir2Balance = await provider.connection.getBalance(heir2.publicKey);

    const treasury = await program.account.treasury.fetch(treasuryPda);
    const config = await program.account.platformConfig.fetch(platformConfigPda);
    const userProfile = await program.account.userProfile.fetch(premiumUserProfilePda);

    // Verify fee collection
    const expectedFee = Math.floor(walletBalance * 50 / 10000); // 0.5% fee
    const collectedFee = finalTreasuryBalance - initialTreasuryBalance;
    
    console.log(`💸 Platform fee collected: ${collectedFee / LAMPORTS_PER_SOL} SOL (expected: ${expectedFee / LAMPORTS_PER_SOL} SOL)`);
    console.log(`👨‍👩‍👧‍👦 Heir 1 received: ${(finalHeir1Balance - initialHeir1Balance) / LAMPORTS_PER_SOL} SOL (60%)`);
    console.log(`👨‍👩‍👧‍👦 Heir 2 received: ${(finalHeir2Balance - initialHeir2Balance) / LAMPORTS_PER_SOL} SOL (40%)`);

    assert.ok(collectedFee >= expectedFee * 0.9); // Allow for rounding
    assert.equal(config.totalInheritancesExecuted.toString(), "1");
    assert.ok(userProfile.totalFeesPaid.toNumber() > 0);

    console.log("✅ Inheritance executed with platform fee deduction");
  });

  it("Admin can withdraw treasury funds", async () => {
    const treasury = await program.account.treasury.fetch(treasuryPda);
    const withdrawAmount = treasury.totalBalance;
    
    const initialAdminBalance = await provider.connection.getBalance(admin.publicKey);

    await program.methods
      .withdrawTreasury(new anchor.BN(withdrawAmount))
      .accounts({
        treasury: treasuryPda,
        admin: admin.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([admin])
      .rpc();

    const finalAdminBalance = await provider.connection.getBalance(admin.publicKey);
    const finalTreasury = await program.account.treasury.fetch(treasuryPda);

    console.log(`💰 Admin withdrew: ${withdrawAmount / LAMPORTS_PER_SOL} SOL from treasury`);
    
    assert.ok(finalAdminBalance > initialAdminBalance);
    assert.equal(finalTreasury.totalBalance.toString(), "0");

    console.log("✅ Treasury withdrawal successful");
  });

  it("Admin can update platform fee", async () => {
    const newFeeBps = 100; // 1%

    await program.methods
      .updatePlatformConfig(newFeeBps)
      .accounts({
        platformConfig: platformConfigPda,
        admin: admin.publicKey,
      })
      .signers([admin])
      .rpc();

    const config = await program.account.platformConfig.fetch(platformConfigPda);
    assert.equal(config.platformFeeBps, newFeeBps);

    console.log(`✅ Platform fee updated to ${newFeeBps / 100}%`);
  });

  it("Free user is limited to default inactivity period", async () => {
    const [coinHeirPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("coin_heir"), freeUser.publicKey.toBuffer(), heir1.publicKey.toBuffer()],
      program.programId
    );

    try {
      // Try to create coin heir with custom inactivity period (should fail)
      await program.methods
        .addCoinHeir(new anchor.BN(LAMPORTS_PER_SOL), new anchor.BN(1 * 24 * 60 * 60)) // 1 day (custom)
        .accounts({
          coinHeir: coinHeirPda,
          userProfile: freeUserProfilePda,
          owner: freeUser.publicKey,
          heir: heir1.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([freeUser])
        .rpc();
      
      assert.fail("Should have failed for custom inactivity period");
    } catch (error) {
      assert.ok(error.toString().includes("CustomInactivityNotAllowed"));
      console.log("✅ Free user correctly restricted from custom inactivity periods");
    }
  });

  it("Displays platform statistics", async () => {
    const config = await program.account.platformConfig.fetch(platformConfigPda);
    const treasury = await program.account.treasury.fetch(treasuryPda);
    const freeProfile = await program.account.userProfile.fetch(freeUserProfilePda);
    const premiumProfile = await program.account.userProfile.fetch(premiumUserProfilePda);

    console.log("\n📊 PLATFORM STATISTICS:");
    console.log("========================");
    console.log(`Platform Fee: ${config.platformFeeBps / 100}%`);
    console.log(`Total Fees Collected: ${config.totalFeesCollected.toNumber() / LAMPORTS_PER_SOL} SOL`);
    console.log(`Total Inheritances Executed: ${config.totalInheritancesExecuted}`);
    console.log(`Treasury Balance: ${treasury.totalBalance.toNumber() / LAMPORTS_PER_SOL} SOL`);
    
    console.log("\n👥 USER STATISTICS:");
    console.log("===================");
    console.log(`Free User - Inheritances Created: ${freeProfile.totalInheritancesCreated}, Fees Paid: ${freeProfile.totalFeesPaid.toNumber() / LAMPORTS_PER_SOL} SOL`);
    console.log(`Premium User - Inheritances Created: ${premiumProfile.totalInheritancesCreated}, Fees Paid: ${premiumProfile.totalFeesPaid.toNumber() / LAMPORTS_PER_SOL} SOL`);
  });

  it("Demonstrates token inheritance with fees (Escrow Model)", async () => {
    console.log("\n🏦 TESTING ESCROW MODEL WITH FEES");
    console.log("=================================");

    const [tokenHeirPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("token_heir"),
        freeUser.publicKey.toBuffer(),
        heir1.publicKey.toBuffer(),
        tokenMint.toBuffer()
      ],
      program.programId
    );

    const [escrowTokenAccount] = PublicKey.findProgramAddressSync(
      [
        freeUser.publicKey.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        tokenMint.toBuffer(),
      ],
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const [treasuryTokenAccount] = PublicKey.findProgramAddressSync(
      [
        treasuryPda.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        tokenMint.toBuffer(),
      ],
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    // Create token heir with escrow
    const escrowAmount = new anchor.BN(100000000000); // 100 tokens
    
    await program.methods
      .addTokenHeir(escrowAmount, new anchor.BN(365 * 24 * 60 * 60)) // Default 1 year
      .accounts({
        tokenHeir: tokenHeirPda,
        userProfile: freeUserProfilePda,
        owner: freeUser.publicKey,
        heir: heir1.publicKey,
        tokenMint: tokenMint,
        ownerTokenAccount: freeUserTokenAccount,
        escrowTokenAccount: escrowTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([freeUser])
      .rpc();

    // Verify escrow balance
    const escrowBalance = await getAccount(provider.connection, escrowTokenAccount);
    console.log(`💰 Escrowed ${escrowBalance.amount.toString()} tokens`);

    // Note: In a real scenario, you would wait for the inactivity period
    // For testing purposes, we'll simulate the claim (this would fail in reality due to time constraint)
    console.log("ℹ️ Token inheritance created with escrow - fees will be deducted upon claiming");
    console.log(`ℹ️ Expected fee: ${escrowAmount.toNumber() * 100 / 10000 / 1e9} tokens (1% of ${escrowAmount.toNumber() / 1e9} tokens)`);

    const tokenHeir = await program.account.tokenHeir.fetch(tokenHeirPda);
    assert.ok(tokenHeir.amount.eq(escrowAmount));
    assert.equal(tokenHeir.isClaimed, false);

    console.log("✅ Token inheritance with escrow created successfully");
  });
});

// Utility functions for testing
export async function getAccountBalances(
  connection: anchor.web3.Connection,
  accounts: PublicKey[]
): Promise<number[]> {
  const balances = await Promise.all(
    accounts.map(account => connection.getBalance(account))
  );
  return balances;
}

export function calculateExpectedFee(amount: number, feeBps: number): number {
  return Math.floor(amount * feeBps / 10000);
}

export function logInheritanceEvent(
  totalAmount: number,
  platformFee: number,
  heirAllocations: { heir: string; percentage: number; amount: number }[]
) {
  console.log("\n💰 INHERITANCE EXECUTION SUMMARY:");
  console.log("================================");
  console.log(`Total Amount: ${totalAmount / LAMPORTS_PER_SOL} SOL`);
  console.log(`Platform Fee: ${platformFee / LAMPORTS_PER_SOL} SOL (${(platformFee / totalAmount * 100).toFixed(2)}%)`);
  console.log(`Distributed to Heirs: ${(totalAmount - platformFee) / LAMPORTS_PER_SOL} SOL`);
  
  heirAllocations.forEach((allocation, index) => {
    console.log(`  Heir ${index + 1}: ${allocation.amount / LAMPORTS_PER_SOL} SOL (${allocation.percentage}%)`);
  });
}