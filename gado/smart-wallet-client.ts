import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Gado } from "./target/types/gado";
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
  private program: Program<Gado>;
  public connection: Connection; // Made public for examples

  constructor(program: Program<Gado>, connection: Connection) {
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
   * Get Smart Wallet address (the actual wallet that can send/receive)
   * This is the Asset PDA that acts as the smart wallet's address
   */
  getSmartWalletAddress(owner: PublicKey): PublicKey {
    const [smartWalletAssetPDA] = this.getSmartWalletAssetPDA(owner);
    return smartWalletAssetPDA;
  }

  /**
   * Send SOL from Smart Wallet to recipient
   */
  async sendSolFromSmartWallet(
    owner: Keypair,
    recipient: PublicKey,
    amountSol: number
  ): Promise<string> {
    const [smartWalletPDA] = this.getSmartWalletPDA(owner.publicKey);
    const [smartWalletAssetPDA] = this.getSmartWalletAssetPDA(owner.publicKey);

    const amountLamports = amountSol * LAMPORTS_PER_SOL;

    const tx = await this.program.methods
      .withdrawFromSmartWallet(new anchor.BN(amountLamports))
      .accountsPartial({
        smartWallet: smartWalletPDA,
        smartWalletPda: smartWalletAssetPDA,
        owner: owner.publicKey,
        recipient: recipient,
        systemProgram: SystemProgram.programId,
      })
      .signers([owner])
      .rpc();

    console.log(`Sent ${amountSol} SOL from Smart Wallet to ${recipient.toString()}:`, tx);
    return tx;
  }

  /**
   * Send SPL tokens from Smart Wallet to recipient
   */
  async sendTokensFromSmartWallet(
    owner: Keypair,
    recipient: PublicKey,
    tokenMint: PublicKey,
    amount: number
  ): Promise<string> {
    const [smartWalletPDA] = this.getSmartWalletPDA(owner.publicKey);
    const [smartWalletAssetPDA] = this.getSmartWalletAssetPDA(owner.publicKey);

    // Get Smart Wallet's token account
    const smartWalletTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      smartWalletAssetPDA,
      true // allowOwnerOffCurve
    );

    // Get recipient's token account
    const recipientTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      recipient
    );

    const tx = await this.program.methods
      .withdrawTokensFromSmartWallet(new anchor.BN(amount))
      .accountsPartial({
        smartWallet: smartWalletPDA,
        smartWalletTokenAccount: smartWalletTokenAccount,
        recipientTokenAccount: recipientTokenAccount,
        smartWalletPda: smartWalletAssetPDA,
        tokenMint: tokenMint,
        owner: owner.publicKey,
        recipient: recipient,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([owner])
      .rpc();

    console.log(`Sent ${amount} tokens from Smart Wallet to ${recipient.toString()}:`, tx);
    return tx;
  }

  /**
   * Create associated token account for Smart Wallet (for receiving new token types)
   */
  async createSmartWalletTokenAccount(
    owner: Keypair,
    tokenMint: PublicKey
  ): Promise<string> {
    const [smartWalletAssetPDA] = this.getSmartWalletAssetPDA(owner.publicKey);

    // Get Smart Wallet's token account
    const smartWalletTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      smartWalletAssetPDA,
      true // allowOwnerOffCurve
    );

    // Check if token account already exists
    try {
      await getAccount(this.connection, smartWalletTokenAccount);
      console.log("Token account already exists:", smartWalletTokenAccount.toString());
      return smartWalletTokenAccount.toString();
    } catch (error) {
      // Token account doesn't exist, create it
    }

    const transaction = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        owner.publicKey, // payer
        smartWalletTokenAccount, // associated token account
        smartWalletAssetPDA, // owner (Smart Wallet PDA)
        tokenMint // mint
      )
    );

    const tx = await this.connection.sendTransaction(transaction, [owner]);
    await this.connection.confirmTransaction(tx);

    console.log(`Created token account for Smart Wallet:`, smartWalletTokenAccount.toString());
    console.log("Transaction:", tx);
    return tx;
  }

  /**
   * Get Smart Wallet's public address for receiving funds
   * This is what users share to receive SOL and tokens
   */
  async getSmartWalletReceiveAddress(owner: PublicKey): Promise<{
    solAddress: PublicKey;
    tokenAccounts: Map<string, PublicKey>;
  }> {
    const [smartWalletAssetPDA] = this.getSmartWalletAssetPDA(owner);
    const tokenAccounts = new Map<string, PublicKey>();

    // Common token mints to check for (you can expand this list)
    const commonTokenMints: string[] = [
      // Add common token mint addresses here
      // "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
      // "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // USDT
    ];

    for (const mintAddress of commonTokenMints) {
      try {
        const mint = new PublicKey(mintAddress);
        const tokenAccount = await getAssociatedTokenAddress(
          mint,
          smartWalletAssetPDA,
          true
        );
        
        // Check if token account exists
        try {
          await getAccount(this.connection, tokenAccount);
          tokenAccounts.set(mintAddress, tokenAccount);
        } catch {
          // Token account doesn't exist yet
        }
      } catch (error) {
        console.log("Error checking token account for mint:", mintAddress);
      }
    }

    return {
      solAddress: smartWalletAssetPDA,
      tokenAccounts
    };
  }

  /**
   * Get comprehensive Smart Wallet info including all balances
   */
  async getSmartWalletInfo(owner: PublicKey): Promise<{
    address: PublicKey;
    solBalance: number;
    tokenBalances: Array<{ mint: PublicKey; balance: number; symbol?: string }>;
    isActive: boolean;
    heirs: Array<{ address: PublicKey; percentage: number }>;
  } | null> {
    const smartWallet = await this.getSmartWallet(owner);
    if (!smartWallet) return null;

    const [smartWalletAssetPDA] = this.getSmartWalletAssetPDA(owner);
    
    // Get SOL balance
    const solBalance = await this.getSmartWalletBalance(owner);
    
    // Get token balances
    const tokenBalances: Array<{ mint: PublicKey; balance: number; symbol?: string }> = [];
    
    // Get all token accounts for this Smart Wallet
    const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
      smartWalletAssetPDA,
      { programId: TOKEN_PROGRAM_ID }
    );

    for (const tokenAccountInfo of tokenAccounts.value) {
      const accountData = tokenAccountInfo.account.data.parsed.info;
      const balance = accountData.tokenAmount.uiAmount || 0;
      
      if (balance > 0) {
        tokenBalances.push({
          mint: new PublicKey(accountData.mint),
          balance: balance,
          // You could add token symbol lookup here
        });
      }
    }

    return {
      address: smartWalletAssetPDA,
      solBalance,
      tokenBalances,
      isActive: !await this.isOwnerInactive(owner),
      heirs: smartWallet.data.heirs.map(heir => ({
        address: heir.heirPubkey,
        percentage: heir.allocationPercentage
      }))
    };
  }

  /**
   * Get all Smart Wallets that are eligible for inheritance execution
   */
  async getInactiveSmartWallets(): Promise<PublicKey[]> {
    // This would typically be done with a program-derived query
    // Return empty array - would contain historical events in production
    // In production, you'd maintain a registry or use indexing
    const inactiveWallets: PublicKey[] = [];
    
    // TODO: Implement indexing or registry pattern
    console.log("Note: getInactiveSmartWallets requires indexing implementation");
    
    return inactiveWallets;
  }
}
