import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Gado, TokenHeir, CoinHeir } from "../target/types/gado";
import { 
  Keypair, 
  LAMPORTS_PER_SOL, 
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  PublicKey
} from "@solana/web3.js";
import { 
  TOKEN_PROGRAM_ID, 
  createMint, 
  createAccount, 
  mintTo,
  getAccount,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccount
} from "@solana/spl-token";
import { assert } from "chai";

describe("gado", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Gado as Program<Gado>;
  
  // Test keypairs
  let owner: Keypair;
  let heir: Keypair;
  let thirdParty: Keypair;
  
  // Token related
  let tokenMint: PublicKey;
  let ownerTokenAccount: PublicKey;
  let heirTokenAccount: PublicKey;
  
  // PDAs
  let tokenHeirPda: PublicKey;
  let coinHeirPda: PublicKey;
  let tokenHeirBump: number;
  let coinHeirBump: number;

  before(async () => {
    // Generate keypairs
    owner = Keypair.generate();
    heir = Keypair.generate();
    thirdParty = Keypair.generate();

    // Airdrop SOL to test accounts
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(owner.publicKey, 2 * LAMPORTS_PER_SOL)
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(heir.publicKey, 1 * LAMPORTS_PER_SOL)
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(thirdParty.publicKey, 1 * LAMPORTS_PER_SOL)
    );

    // Create token mint
    tokenMint = await createMint(
      provider.connection,
      owner,
      owner.publicKey,
      null,
      9
    );

    // Create token accounts
    ownerTokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      owner,
      tokenMint,
      owner.publicKey
    );
    
    heirTokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      heir,
      tokenMint,
      heir.publicKey
    );

    // Mint tokens to owner
    await mintTo(
      provider.connection,
      owner,
      tokenMint,
      ownerTokenAccount,
      owner.publicKey,
      1000000000 // 1000 tokens (with 9 decimals)
    );

    // Derive PDAs
    [tokenHeirPda, tokenHeirBump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("token_heir"),
        owner.publicKey.toBuffer(),
        heir.publicKey.toBuffer(),
        tokenMint.toBuffer()
      ],
      program.programId
    );

    [coinHeirPda, coinHeirBump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("coin_heir"),
        owner.publicKey.toBuffer(),
        heir.publicKey.toBuffer()
      ],
      program.programId
    );
  });

  it("Is initialized!", async () => {
    const tx = await program.methods.initialize().rpc();
    console.log("Initialize transaction signature:", tx);
  });

  it("Can add token heir", async () => {
    const amount = new anchor.BN(500000000); // 500 tokens

    await program.methods
      .addTokenHeir(amount, new anchor.BN(2 * 24 * 60 * 60))
      .accounts({
        tokenHeir: tokenHeirPda,
        owner: owner.publicKey,
        heir: heir.publicKey,
        tokenMint: tokenMint,
        systemProgram: SystemProgram.programId,
      } as any)
      .signers([owner])
      .rpc();

    // Verify the account was created correctly
    const tokenHeirAccount = await (program.account as any).tokenHeir.fetch(tokenHeirPda);
    assert.ok(tokenHeirAccount.owner.equals(owner.publicKey));
    assert.ok(tokenHeirAccount.heir.equals(heir.publicKey));
    assert.ok(tokenHeirAccount.tokenMint.equals(tokenMint));
    assert.ok(tokenHeirAccount.amount.eq(amount));
    assert.ok(!tokenHeirAccount.isClaimed);
    console.log("Token heir created successfully");
  });

  it("Can add coin heir", async () => {
    const amount = new anchor.BN(LAMPORTS_PER_SOL / 2); // 0.5 SOL

    await program.methods
      .addCoinHeir(amount, new anchor.BN(2))
      .accounts({
        coinHeir: coinHeirPda,
        owner: owner.publicKey,
        heir: heir.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([owner])
      .rpc();

    // Verify the account was created correctly and funded
    const coinHeirAccount = await (program.account as any).coinHeir.fetch(coinHeirPda);
    const coinHeirBalance = await provider.connection.getBalance(coinHeirPda);
    assert.ok(coinHeirAccount.owner.equals(owner.publicKey));
    assert.ok(coinHeirAccount.heir.equals(heir.publicKey));
    assert.ok(coinHeirAccount.amount.eq(amount));
    assert.ok(!coinHeirAccount.isClaimed);
    assert.ok(coinHeirBalance >= amount.toNumber());
    console.log("Coin heir created and funded successfully");
  });

  it("Can update activity", async () => {
    const beforeUpdate = await (program.account as any).tokenHeir.fetch(tokenHeirPda);
    
    // Wait a bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await program.methods
      .updateActivity()
      .accounts({
        tokenHeir: tokenHeirPda,
        owner: owner.publicKey,
      })
      .signers([owner])
      .rpc();

    const afterUpdate = await (program.account as any).tokenHeir.fetch(tokenHeirPda);
    assert.ok(afterUpdate.lastActiveTime.gt(beforeUpdate.lastActiveTime));
    console.log("Activity updated successfully");
  });

  it("Can perform batch token transfers", async () => {
    // Create additional token accounts for testing
    const recipientKeypair = Keypair.generate();
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(recipientKeypair.publicKey, LAMPORTS_PER_SOL)
    );
    
    const recipientTokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      recipientKeypair,
      tokenMint,
      recipientKeypair.publicKey
    );

    const amounts = [
      new anchor.BN(1000000), // 1 token
      new anchor.BN(2000000), // 2 tokens
      new anchor.BN(3000000), // 3 tokens
    ];

    await program.methods
      .batchTransferTokens(amounts)
      .accounts({
        fromTokenAccount: ownerTokenAccount,
        toTokenAccount: recipientTokenAccount,
        authority: owner.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([owner])
      .rpc();

    // Verify transfers
    const recipientBalance = await getAccount(provider.connection, recipientTokenAccount);
    const expectedTotal = amounts.reduce((sum, amount) => sum.add(amount), new anchor.BN(0));
    assert.ok(new anchor.BN(recipientBalance.amount.toString()).eq(expectedTotal));
    console.log("Batch token transfers completed successfully");
  });

  it("Can perform batch coin transfers", async () => {
    const recipient = Keypair.generate();
    const amounts = [
      new anchor.BN(LAMPORTS_PER_SOL / 100), // 0.01 SOL
      new anchor.BN(LAMPORTS_PER_SOL / 200), // 0.005 SOL
    ];

    const initialBalance = await provider.connection.getBalance(recipient.publicKey);

    await program.methods
      .batchTransferCoins(amounts)
      .accounts({
        fromAccount: owner.publicKey,
        toAccount: recipient.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([owner])
      .rpc();

    const finalBalance = await provider.connection.getBalance(recipient.publicKey);
    const expectedIncrease = amounts.reduce((sum, amount) => sum.add(amount), new anchor.BN(0));
    assert.ok(finalBalance - initialBalance >= expectedIncrease.toNumber());
    console.log("Batch coin transfers completed successfully");
  });

  it("Cannot claim heir assets when owner is still active", async () => {
    try {
      await program.methods
        .claimHeirTokenAssets()
        .accounts({
          tokenHeir: tokenHeirPda,
          owner: owner.publicKey,
          heir: heir.publicKey,
          ownerTokenAccount: ownerTokenAccount,
          heirTokenAccount: heirTokenAccount,
          authority: owner.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([heir])
        .rpc();
      
      assert.fail("Should have thrown an error");
    } catch (error) {
      assert.ok(error.toString().includes("OwnerStillActive"));
      console.log("Correctly prevented premature claiming");
    }
  });

  it("Cannot claim coin assets when owner is still active", async () => {
    try {
      await program.methods
        .updateCoinActivity()
        .accounts({
          coinHeir: coinHeirPda,
          owner: owner.publicKey,
        })
        .signers([owner])
        .rpc();

      await program.methods
        .claimHeirCoinAssets()
        .accounts({
          coinHeir: coinHeirPda,
          ownerAccount: owner.publicKey,
          heirAccount: heir.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([heir])
        .rpc();

      assert.fail("Should have thrown an error");
    } catch (error) {
      assert.ok(error.toString().includes("OwnerStillActive"));
      console.log("Correctly prevented premature coin claiming");
    }
  });

  it("Can claim coin assets after inactivity", async () => {
    await new Promise(resolve => setTimeout(resolve, 2100));
    const beforeBalance = await provider.connection.getBalance(heir.publicKey);

    await program.methods
      .claimHeirCoinAssets()
      .accounts({
        coinHeir: coinHeirPda,
        ownerAccount: owner.publicKey,
        heirAccount: heir.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([heir])
      .rpc();

    const afterBalance = await provider.connection.getBalance(heir.publicKey);
    const coinHeirAccount = await (program.account as any).coinHeir.fetch(coinHeirPda);
    assert.ok(afterBalance - beforeBalance >= LAMPORTS_PER_SOL / 2);
    assert.ok(coinHeirAccount.isClaimed);
    console.log("Coin assets claimed successfully");
  });

  // Note: Testing actual claiming after one year would require manipulating time
  // In a real test environment, you might want to modify the contract to use
  // a shorter time period for testing, or use a test framework that allows
  // time manipulation

  it("Fails with too many batch transfers", async () => {
    const tooManyAmounts = Array(11).fill(new anchor.BN(1000000));
    
    try {
      await program.methods
        .batchTransferTokens(tooManyAmounts)
        .accounts({
          fromTokenAccount: ownerTokenAccount,
          toTokenAccount: heirTokenAccount,
          authority: owner.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([owner])
        .rpc();
      
      assert.fail("Should have thrown an error");
    } catch (error) {
      assert.ok(error.toString().includes("TooManyTransfers"));
      console.log("Correctly limited batch transfers");
    }
  });

  it("Only owner can update activity", async () => {
    try {
      await program.methods
        .updateActivity()
        .accounts({
          tokenHeir: tokenHeirPda,
          owner: owner.publicKey,
        })
        .signers([thirdParty])
        .rpc();
      
      assert.fail("Should have thrown an error");
    } catch (error) {
      assert.ok(error.toString().includes("unknown signer"));
      console.log("Correctly prevented unauthorized activity update");
    }
  });

  // Additional integration test for edge cases
  it("Can handle zero amounts in batch transfers", async () => {
    const amounts = [
      new anchor.BN(0),
      new anchor.BN(1000000),
      new anchor.BN(0),
    ];

    await program.methods
      .batchTransferTokens(amounts)
      .accounts({
        fromTokenAccount: ownerTokenAccount,
        toTokenAccount: heirTokenAccount,
        authority: owner.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([owner])
      .rpc();
    
    console.log("Successfully handled zero amounts in batch transfers");
  });

  // Helper function to get account info
  async function getTokenHeirInfo() {
    const account = await (program.account as any).tokenHeir.fetch(tokenHeirPda);
    console.log("Token Heir Info:", {
      owner: account.owner.toString(),
      heir: account.heir.toString(),
      tokenMint: account.tokenMint.toString(),
      amount: account.amount.toString(),
      lastActiveTime: new Date(account.lastActiveTime.toNumber() * 1000),
      isClaimed: account.isClaimed,
    });
    return account;
  }

  async function getCoinHeirInfo() {
    const account = await (program.account as any).coinHeir.fetch(coinHeirPda);
    console.log("Coin Heir Info:", {
      owner: account.owner.toString(),
      heir: account.heir.toString(),
      amount: account.amount.toString(),
      lastActiveTime: new Date(account.lastActiveTime.toNumber() * 1000),
      isClaimed: account.isClaimed,
    });
    return account;
  }

  it("Can fetch account information", async () => {
    await getTokenHeirInfo();
    await getCoinHeirInfo();
    console.log("Successfully fetched account information");
  });
});

// Additional utility functions for manual testing
export async function setupTestEnvironment() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Gado as Program<Gado>;
  
  return { provider, program };
}

export async function createTestAccounts(provider: anchor.AnchorProvider) {
  const owner = Keypair.generate();
  const heir = Keypair.generate();
  
  // Fund accounts
  await provider.connection.confirmTransaction(
    await provider.connection.requestAirdrop(owner.publicKey, 2 * LAMPORTS_PER_SOL)
  );
  await provider.connection.confirmTransaction(
    await provider.connection.requestAirdrop(heir.publicKey, 1 * LAMPORTS_PER_SOL)
  );
  
  return { owner, heir };
}