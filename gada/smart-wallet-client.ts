import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Gada } from "./target/types/gada";
import { 
  PublicKey, 
  Keypair, 
  Connection, 
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction
} from "@solana/web3.js";
import { 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount
} from "@solana/spl-token";

export interface HeirData {
  heirPubkey: PublicKey;
  allocationPercentage: number;
}

export class SmartWalletClient {
  private program: Program<Gada>;
  public connection: Connection; // Made public for examples

  constructor(program: Program<Gada>, connection: Connection) {
    this.program = program;
    this.connection = connection;
  }

  /**
   * Get Smart Wallet PDA address
   */
  getSmartWalletPDA(owner: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("smart_wallet"), owner.toBuffer()],
      this.program.programId
    );
  }

  /**
   * Get Smart Wallet PDA address for holding assets
   */
  getSmartWalletAssetPDA(owner: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("smart_wallet_pda"), owner.toBuffer()],
      this.program.programId
    );
  }

  /**
   * Create Smart Wallet Inheritance setup
   */
  async createSmartWalletInheritance(
    owner: Keypair,
    heirs: HeirData[],
    inactivityPeriodSeconds: number
  ): Promise<string> {
    // Validate allocation percentages
    const totalAllocation = heirs.reduce((sum, heir) => sum + heir.allocationPercentage, 0);
    if (totalAllocation !== 100) {
      throw new Error(`Total allocation must be 100%, got ${totalAllocation}%`);
    }

    const [smartWalletPDA] = this.getSmartWalletPDA(owner.publicKey);
    const [smartWalletAssetPDA] = this.getSmartWalletAssetPDA(owner.publicKey);

    // Convert heirs to program format
    const programHeirs = heirs.map(heir => ({
      heirPubkey: heir.heirPubkey,
      allocationPercentage: heir.allocationPercentage,
    }));

    const tx = await this.program.methods
      .createSmartWalletInheritance(programHeirs, new anchor.BN(inactivityPeriodSeconds))
      .accountsPartial({
        smartWallet: smartWalletPDA,
        smartWalletPda: smartWalletAssetPDA,
        owner: owner.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([owner])
      .rpc();

    console.log("Smart Wallet inheritance created:", tx);
    console.log("Smart Wallet PDA:", smartWalletPDA.toString());
    console.log("Smart Wallet Asset PDA:", smartWalletAssetPDA.toString());

    return tx;
  }

  /**
   * Update Smart Wallet activity (call this to reset inactivity timer)
   */
  async updateSmartWalletActivity(owner: Keypair): Promise<string> {
    const [smartWalletPDA] = this.getSmartWalletPDA(owner.publicKey);

    const tx = await this.program.methods
      .updateSmartWalletActivity()
      .accountsPartial({
        smartWallet: smartWalletPDA,
        owner: owner.publicKey,
      })
      .signers([owner])
      .rpc();

    console.log("Smart Wallet activity updated:", tx);
    return tx;
  }

  /**
   * Deposit SOL to Smart Wallet
   */
  async depositToSmartWallet(
    owner: Keypair,
    amountSol: number
  ): Promise<string> {
    const [smartWalletPDA] = this.getSmartWalletPDA(owner.publicKey);
    const [smartWalletAssetPDA] = this.getSmartWalletAssetPDA(owner.publicKey);

    const amountLamports = amountSol * LAMPORTS_PER_SOL;

    const tx = await this.program.methods
      .depositToSmartWallet(new anchor.BN(amountLamports))
      .accountsPartial({
        smartWallet: smartWalletPDA,
        smartWalletPda: smartWalletAssetPDA,
        owner: owner.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([owner])
      .rpc();

    console.log(`Deposited ${amountSol} SOL to Smart Wallet:`, tx);
    return tx;
  }

  /**
   * Deposit SPL tokens to Smart Wallet
   */
  async depositTokensToSmartWallet(
    owner: Keypair,
    tokenMint: PublicKey,
    amount: number
  ): Promise<string> {
    const [smartWalletPDA] = this.getSmartWalletPDA(owner.publicKey);
    const [smartWalletAssetPDA] = this.getSmartWalletAssetPDA(owner.publicKey);

    // Get owner's token account
    const ownerTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      owner.publicKey
    );

    // Get Smart Wallet's token account
    const smartWalletTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      smartWalletAssetPDA,
      true // allowOwnerOffCurve
    );

    const tx = await this.program.methods
      .depositTokensToSmartWallet(new anchor.BN(amount))
      .accountsPartial({
        smartWallet: smartWalletPDA,
        ownerTokenAccount: ownerTokenAccount,
        smartWalletTokenAccount: smartWalletTokenAccount,
        smartWalletPda: smartWalletAssetPDA,
        tokenMint: tokenMint,
        owner: owner.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([owner])
      .rpc();

    console.log(`Deposited ${amount} tokens to Smart Wallet:`, tx);
    return tx;
  }

  /**
   * Execute inheritance (called by keeper/bot when owner is inactive)
   */
  async executeInheritance(
    ownerPublicKey: PublicKey,
    caller: Keypair
  ): Promise<string> {
    const [smartWalletPDA] = this.getSmartWalletPDA(ownerPublicKey);
    const [smartWalletAssetPDA] = this.getSmartWalletAssetPDA(ownerPublicKey);

    const tx = await this.program.methods
      .executeInheritance()
      .accountsPartial({
        smartWallet: smartWalletPDA,
        smartWalletPda: smartWalletAssetPDA,
        caller: caller.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([caller])
      .rpc();

    console.log("Inheritance executed:", tx);
    return tx;
  }

  /**
   * Get Smart Wallet account data
   */
  async getSmartWallet(owner: PublicKey) {
    const [smartWalletPDA] = this.getSmartWalletPDA(owner);
    
    try {
      const account = await this.program.account.smartWallet.fetch(smartWalletPDA);
      return {
        address: smartWalletPDA,
        data: account,
      };
    } catch (error) {
      console.log("Smart Wallet not found for owner:", owner.toString());
      return null;
    }
  }

  /**
   * Get Smart Wallet balance (SOL)
   */
  async getSmartWalletBalance(owner: PublicKey): Promise<number> {
    const [smartWalletAssetPDA] = this.getSmartWalletAssetPDA(owner);
    
    try {
      const balance = await this.connection.getBalance(smartWalletAssetPDA);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.log("Error getting Smart Wallet balance:", error);
      return 0;
    }
  }

  /**
   * Get Smart Wallet token balance
   */
  async getSmartWalletTokenBalance(
    owner: PublicKey,
    tokenMint: PublicKey
  ): Promise<number> {
    const [smartWalletAssetPDA] = this.getSmartWalletAssetPDA(owner);
    
    try {
      const tokenAccount = await getAssociatedTokenAddress(
        tokenMint,
        smartWalletAssetPDA,
        true
      );
      
      const account = await getAccount(this.connection, tokenAccount);
      return Number(account.amount);
    } catch (error) {
      console.log("Error getting Smart Wallet token balance:", error);
      return 0;
    }
  }

  /**
   * Check if owner is inactive (for keeper bots)
   */
  async isOwnerInactive(owner: PublicKey): Promise<boolean> {
    const smartWallet = await this.getSmartWallet(owner);
    
    if (!smartWallet) {
      return false;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const timeSinceLastActive = currentTime - smartWallet.data.lastActiveTime.toNumber();
    
    return timeSinceLastActive > smartWallet.data.inactivityPeriodSeconds.toNumber();
  }

  /**
   * Get all Smart Wallets that are eligible for inheritance execution
   */
  async getInactiveSmartWallets(): Promise<PublicKey[]> {
    // This would typically be done with a program-derived query
    // For now, we'll return an empty array as a placeholder
    // In production, you'd maintain a registry or use indexing
    const inactiveWallets: PublicKey[] = [];
    
    // TODO: Implement indexing or registry pattern
    console.log("Note: getInactiveSmartWallets requires indexing implementation");
    
    return inactiveWallets;
  }
}

/**
 * Example usage and testing functions
 */
export class SmartWalletExamples {
  private client: SmartWalletClient;

  constructor(client: SmartWalletClient) {
    this.client = client;
  }

  /**
   * Demo: Complete Smart Wallet lifecycle
   */
  async demoSmartWalletLifecycle() {
    console.log("=== Smart Wallet Lifecycle Demo ===");

    // Create test accounts
    const owner = Keypair.generate();
    const heir1 = Keypair.generate();
    const heir2 = Keypair.generate();
    const keeper = Keypair.generate();

    // Airdrop SOL for testing
    await this.client.connection.requestAirdrop(owner.publicKey, 2 * LAMPORTS_PER_SOL);
    await this.client.connection.requestAirdrop(keeper.publicKey, 0.1 * LAMPORTS_PER_SOL);
    
    // Wait for airdrop confirmation
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log("Owner:", owner.publicKey.toString());
    console.log("Heir1:", heir1.publicKey.toString());
    console.log("Heir2:", heir2.publicKey.toString());

    // Step 1: Create Smart Wallet with heirs
    const heirs: HeirData[] = [
      { heirPubkey: heir1.publicKey, allocationPercentage: 60 },
      { heirPubkey: heir2.publicKey, allocationPercentage: 40 },
    ];

    await this.client.createSmartWalletInheritance(
      owner,
      heirs,
      10 // 10 seconds for testing
    );

    // Step 2: Deposit SOL to Smart Wallet
    await this.client.depositToSmartWallet(owner, 1.0);

    // Step 3: Check Smart Wallet status
    const smartWallet = await this.client.getSmartWallet(owner.publicKey);
    console.log("Smart Wallet created:", smartWallet?.data);

    const balance = await this.client.getSmartWalletBalance(owner.publicKey);
    console.log("Smart Wallet balance:", balance, "SOL");

    // Step 4: Update activity (resets timer)
    await this.client.updateSmartWalletActivity(owner);
    console.log("Activity updated");

    // Step 5: Wait for inactivity period (10 seconds for demo)
    console.log("Waiting for inactivity period...");
    await new Promise(resolve => setTimeout(resolve, 12000));

    // Step 6: Check if owner is inactive
    const isInactive = await this.client.isOwnerInactive(owner.publicKey);
    console.log("Owner is inactive:", isInactive);

    // Step 7: Execute inheritance (called by keeper)
    if (isInactive) {
      await this.client.executeInheritance(owner.publicKey, keeper);
      console.log("Inheritance executed successfully!");

      // Check heir balances
      const heir1Balance = await this.client.connection.getBalance(heir1.publicKey);
      const heir2Balance = await this.client.connection.getBalance(heir2.publicKey);
      
      console.log("Heir1 balance:", heir1Balance / LAMPORTS_PER_SOL, "SOL");
      console.log("Heir2 balance:", heir2Balance / LAMPORTS_PER_SOL, "SOL");
    }

    console.log("=== Demo Complete ===");
  }
}