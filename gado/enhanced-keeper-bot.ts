import * as anchor from "@coral-xyz/anchor";
import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { Program } from "@coral-xyz/anchor";
import { Gado } from "./target/types/gado";

/**
 * Simple inheritance keeper bot for the new program structure
 * The new program doesn't have smart wallets - it uses individual inheritance heirs
 * This is a minimal replacement to prevent compilation errors
 */
export class InheritanceKeeperBot {
  private program: Program<Gado>;
  private connection: Connection;
  private keeperKeypair: Keypair;

  constructor(
    program: Program<Gado>,
    connection: Connection,
    keeperKeypair: Keypair
  ) {
    this.program = program;
    this.connection = connection;
    this.keeperKeypair = keeperKeypair;
  }

  /**
   * Check a single SOL heir for claimable inheritance
   */
  async checkSolInheritance(ownerPublicKey: PublicKey, heirPublicKey: PublicKey): Promise<boolean> {
    try {
      const [solHeirPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("sol_heir"), ownerPublicKey.toBuffer(), heirPublicKey.toBuffer()],
        this.program.programId
      );

      const solHeir = await this.program.account.solHeir.fetch(solHeirPDA);
      
      if (solHeir.isClaimed) {
        console.log(`⚠️ SOL inheritance already claimed for heir ${heirPublicKey.toString()}`);
        return false;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      const timeSinceLastActive = currentTime - solHeir.lastActivity.toNumber();
      const isInactive = timeSinceLastActive > solHeir.inactivityPeriodSeconds.toNumber();

      if (isInactive) {
        console.log(`🚨 Found claimable SOL inheritance for heir ${heirPublicKey.toString()}`);
        console.log(`Owner: ${ownerPublicKey.toString()}`);
        console.log(`Amount: ${solHeir.amount.toNumber() / 1_000_000_000} SOL`);
        console.log(`Inactive for: ${timeSinceLastActive} seconds`);
        return true;
      }

      return false;
    } catch (error) {
      console.log(`❌ Error checking SOL inheritance: ${error}`);
      return false;
    }
  }

  /**
   * Check a single Token heir for claimable inheritance
   */
  async checkTokenInheritance(ownerPublicKey: PublicKey, heirPublicKey: PublicKey, tokenMint: PublicKey): Promise<boolean> {
    try {
      const [tokenHeirPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("token_heir"), ownerPublicKey.toBuffer(), heirPublicKey.toBuffer(), tokenMint.toBuffer()],
        this.program.programId
      );

      const tokenHeir = await this.program.account.tokenHeir.fetch(tokenHeirPDA);
      
      if (tokenHeir.isClaimed) {
        console.log(`⚠️ Token inheritance already claimed for heir ${heirPublicKey.toString()}`);
        return false;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      const timeSinceLastActive = currentTime - tokenHeir.lastActivity.toNumber();
      const isInactive = timeSinceLastActive > tokenHeir.inactivityPeriodSeconds.toNumber();

      if (isInactive) {
        console.log(`🚨 Found claimable Token inheritance for heir ${heirPublicKey.toString()}`);
        console.log(`Owner: ${ownerPublicKey.toString()}`);
        console.log(`Token: ${tokenMint.toString()}`);
        console.log(`Amount: ${tokenHeir.amount.toString()}`);
        console.log(`Inactive for: ${timeSinceLastActive} seconds`);
        return true;
      }

      return false;
    } catch (error) {
      console.log(`❌ Error checking Token inheritance: ${error}`);
      return false;
    }
  }

  /**
   * Scan for all inheritance accounts (requires manual list of known heirs)
   * In a production system, you would maintain an index of all heirs
   */
  async scanInheritances(knownHeirsList: Array<{owner: PublicKey, heir: PublicKey, type: 'sol' | 'token', tokenMint?: PublicKey}>): Promise<void> {
    console.log("🔍 Scanning for claimable inheritances...");

    for (const inheritance of knownHeirsList) {
      if (inheritance.type === 'sol') {
        const isClaimable = await this.checkSolInheritance(inheritance.owner, inheritance.heir);
        if (isClaimable) {
          console.log(`✨ Notify heir ${inheritance.heir.toString()} to claim SOL inheritance`);
        }
      } else if (inheritance.type === 'token' && inheritance.tokenMint) {
        const isClaimable = await this.checkTokenInheritance(inheritance.owner, inheritance.heir, inheritance.tokenMint);
        if (isClaimable) {
          console.log(`✨ Notify heir ${inheritance.heir.toString()} to claim Token inheritance`);
        }
      }
    }
  }

  /**
   * Legacy method compatibility
   */
  async executeInheritanceForOwner(ownerPublicKey: PublicKey): Promise<void> {
    console.log("⚠️ executeInheritanceForOwner is deprecated in the new inheritance system");
    console.log("Heirs must now claim their own inheritance using claimSolInheritance or claimTokenInheritance");
    console.log(`Owner: ${ownerPublicKey.toString()}`);
  }

  async monitorSmartWallets(ownerAddresses: PublicKey[]): Promise<void> {
    console.log("⚠️ monitorSmartWallets is deprecated - smart wallets no longer exist");
    console.log("Use scanInheritances with known heir list instead");
  }

  async monitorAllSmartWallets(): Promise<void> {
    console.log("⚠️ monitorAllSmartWallets is deprecated - smart wallets no longer exist");
    console.log("Use scanInheritances with known heir list instead");
  }

  async getAllSmartWallets(): Promise<Array<{ owner: PublicKey; data: any }>> {
    console.log("⚠️ getAllSmartWallets is deprecated - smart wallets no longer exist");
    return [];
  }
}

// Export with old name for compatibility
export class KeeperBot extends InheritanceKeeperBot {}
export default InheritanceKeeperBot;