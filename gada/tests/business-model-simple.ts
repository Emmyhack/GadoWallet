import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Gada } from "../target/types/gada";
import { 
  Keypair, 
  LAMPORTS_PER_SOL, 
  SystemProgram,
  PublicKey
} from "@solana/web3.js";
import { assert } from "chai";

describe("Business Model Integration - Basic", () => {
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
        platform_config: platformConfigPda,
        treasury: treasuryPda,
        admin: admin.publicKey,
        system_program: SystemProgram.programId,
      } as any)
      .signers([admin])
      .rpc();

    const config = await program.account.platformConfig.fetch(platformConfigPda);
    assert.ok(config.admin.equals(admin.publicKey));
    assert.equal(config.platformFeeBps, 50); // 0.5% default fee
    assert.equal(config.totalFeesCollected.toString(), "0");
    assert.equal(config.totalInheritancesExecuted.toString(), "0");

    console.log("✅ Platform initialized with 0.5% fee");
  });

  it("Creates user profiles (free and premium)", async () => {
    // Create free user profile
    await program.methods
      .initializeUserProfile(false)
      .accounts({
        user_profile: freeUserProfilePda,
        user: freeUser.publicKey,
        system_program: SystemProgram.programId,
      } as any)
      .signers([freeUser])
      .rpc();

    // Create premium user profile
    await program.methods
      .initializeUserProfile(true)
      .accounts({
        user_profile: premiumUserProfilePda,
        user: premiumUser.publicKey,
        system_program: SystemProgram.programId,
      } as any)
      .signers([premiumUser])
      .rpc();

    const freeProfile = await program.account.userProfile.fetch(freeUserProfilePda);
    const premiumProfile = await program.account.userProfile.fetch(premiumUserProfilePda);

    assert.equal(freeProfile.isPremium, false);
    assert.equal(premiumProfile.isPremium, true);

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
        smart_wallet: smartWalletPda,
        user_profile: premiumUserProfilePda,
        smart_wallet_pda: smartWalletAssetsPda,
        owner: premiumUser.publicKey,
        system_program: SystemProgram.programId,
      } as any)
      .signers([premiumUser])
      .rpc();

    const smartWallet = await program.account.smartWallet.fetch(smartWalletPda);
    assert.equal(smartWallet.heirs.length, 2);
    assert.equal(smartWallet.heirs[0].allocationPercentage, 60);
    assert.equal(smartWallet.heirs[1].allocationPercentage, 40);

    console.log("✅ Premium user created Smart Wallet with 2 heirs and custom inactivity period");
  });

  it("Deposits SOL into Smart Wallet", async () => {
    const depositAmount = new anchor.BN(2 * LAMPORTS_PER_SOL); // 2 SOL

    await program.methods
      .depositToSmartWallet(depositAmount)
      .accounts({
        smart_wallet_pda: smartWalletAssetsPda,
        owner: premiumUser.publicKey,
        system_program: SystemProgram.programId,
      } as any)
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
        smart_wallet: smartWalletPda,
        platform_config: platformConfigPda,
        treasury: treasuryPda,
        user_profile: premiumUserProfilePda,
        smart_wallet_pda: smartWalletAssetsPda,
        caller: keeper.publicKey,
        system_program: SystemProgram.programId,
      } as any)
      .signers([keeper])
      .rpc();

    const finalTreasuryBalance = await provider.connection.getBalance(treasuryPda);
    const finalHeir1Balance = await provider.connection.getBalance(heir1.publicKey);
    const finalHeir2Balance = await provider.connection.getBalance(heir2.publicKey);

    const treasury = await program.account.treasury.fetch(treasuryPda);
    const config = await program.account.platformConfig.fetch(platformConfigPda);

    // Verify fee collection
    const expectedFee = Math.floor(walletBalance * 50 / 10000); // 0.5% fee
    const collectedFee = finalTreasuryBalance - initialTreasuryBalance;
    
    console.log(`💸 Platform fee collected: ${collectedFee / LAMPORTS_PER_SOL} SOL (expected: ${expectedFee / LAMPORTS_PER_SOL} SOL)`);
    console.log(`👨‍👩‍👧‍👦 Heir 1 received: ${(finalHeir1Balance - initialHeir1Balance) / LAMPORTS_PER_SOL} SOL (60%)`);
    console.log(`👨‍👩‍👧‍👦 Heir 2 received: ${(finalHeir2Balance - initialHeir2Balance) / LAMPORTS_PER_SOL} SOL (40%)`);

    assert.ok(collectedFee >= expectedFee * 0.9); // Allow for rounding
    assert.equal(config.totalInheritancesExecuted.toString(), "1");

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
        system_program: SystemProgram.programId,
      } as any)
      .signers([admin])
      .rpc();

    const finalAdminBalance = await provider.connection.getBalance(admin.publicKey);
    const finalTreasury = await program.account.treasury.fetch(treasuryPda);

    console.log(`💰 Admin withdrew: ${withdrawAmount.toNumber() / LAMPORTS_PER_SOL} SOL from treasury`);
    
    assert.ok(finalAdminBalance > initialAdminBalance);
    assert.equal(finalTreasury.totalBalance.toString(), "0");

    console.log("✅ Treasury withdrawal successful");
  });

  it("Admin can update platform fee", async () => {
    const newFeeBps = 100; // 1%

    await program.methods
      .updatePlatformConfig(newFeeBps)
      .accounts({
        platform_config: platformConfigPda,
        admin: admin.publicKey,
      } as any)
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
          coin_heir: coinHeirPda,
          user_profile: freeUserProfilePda,
          owner: freeUser.publicKey,
          heir: heir1.publicKey,
          system_program: SystemProgram.programId,
        } as any)
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
});

// Export utility functions for manual testing

function calculateExpectedFee(amount: number, feeBps: number): number {
  return Math.floor(amount * feeBps / 10000);
}

function logInheritanceEvent(
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