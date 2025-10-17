import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Gado } from "./target/types/gado";
import { PublicKey, Keypair, Connection, LAMPORTS_PER_SOL, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from "@solana/spl-token";

export interface HeirData {
  heirPubkey: PublicKey;
  allocationPercentage: number;
}

export class SmartWalletClient {
  private program: Program<Gado>;
  public connection: Connection;

  constructor(program: Program<Gado>, connection: Connection) {
    this.program = program;
    this.connection = connection;
  }

  // Legacy method - redirect to new program structure
  async createSmartWalletInheritance(
    owner: Keypair,
    heirs: HeirData[],
    inactivityPeriodSeconds: number
  ): Promise<string> {
    console.log("⚠️  createSmartWalletInheritance redirecting to new inheritance structure");
    
    // Initialize user profile first
    const [userProfilePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("user_profile"), owner.publicKey.toBuffer()],
      this.program.programId
    );

    try {
      await this.program.methods
        .initializeUser()
        .accountsPartial({
          userProfile: userProfilePDA,
          owner: owner.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([owner])
        .rpc();
      console.log("✅ User profile initialized");
    } catch (error) {
      console.log("ℹ️ User profile might already exist");
    }

    // Create SOL heir for first heir with small default amount
    if (heirs.length > 0) {
      const firstHeir = heirs[0];
      const [solHeirPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("sol_heir"), owner.publicKey.toBuffer(), firstHeir.heirPubkey.toBuffer()],
        this.program.programId
      );

      const defaultAmount = 0.1 * LAMPORTS_PER_SOL; // 0.1 SOL default

      const tx = await this.program.methods
        .addSolHeir(new anchor.BN(defaultAmount), new anchor.BN(inactivityPeriodSeconds))
        .accountsPartial({
          solHeir: solHeirPDA,
          userProfile: userProfilePDA,
          owner: owner.publicKey,
          heir: firstHeir.heirPubkey,
          systemProgram: SystemProgram.programId,
        })
        .signers([owner])
        .rpc();

      console.log("✅ Legacy smart wallet created as SOL inheritance:", tx);
      return tx;
    }
    
    throw new Error("At least one heir is required");
  }

  getSmartWalletPDA(owner: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("user_profile"), owner.toBuffer()],
      this.program.programId
    );
  }

  async getSmartWallet(owner: PublicKey) {
    const [userProfilePDA] = this.getSmartWalletPDA(owner);
    try {
      const account = await this.program.account.userProfile.fetch(userProfilePDA);
      return { address: userProfilePDA, data: account };
    } catch (error) {
      return null;
    }
  }

  // Deprecated methods that throw errors
  async updateSmartWalletActivity(owner: Keypair): Promise<string> {
    throw new Error("updateSmartWalletActivity is deprecated. Use updateSolActivity or updateTokenActivity instead.");
  }

  async executeInheritance(ownerPublicKey: PublicKey, caller: Keypair): Promise<string> {
    throw new Error("executeInheritance is deprecated. Use claimSolInheritance or claimTokenInheritance instead.");
  }

  async depositToSmartWallet(owner: Keypair, amountSol: number): Promise<string> {
    throw new Error("depositToSmartWallet is deprecated. Send SOL directly to user wallet instead.");
  }

  async withdrawFromSmartWallet(owner: Keypair, amountSol: number): Promise<string> {
    throw new Error("withdrawFromSmartWallet is deprecated. Send SOL directly from user wallet instead.");
  }

  async depositTokensToSmartWallet(owner: Keypair, tokenMint: PublicKey, amount: number): Promise<string> {
    throw new Error("depositTokensToSmartWallet is deprecated. Use addTokenHeir to set up token inheritance instead.");
  }

  async withdrawTokensFromSmartWallet(owner: Keypair, tokenMint: PublicKey, amount: number): Promise<string> {
    throw new Error("withdrawTokensFromSmartWallet is deprecated. Use token transfers directly instead.");
  }
}
