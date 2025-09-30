import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { 
  Connection, 
  Keypair, 
  PublicKey,
  LAMPORTS_PER_SOL 
} from "@solana/web3.js";
import { Gado } from "../lib/types/gado";
import IDL from "../lib/idl/gado.json";

const PROGRAM_ID = new PublicKey("EciS2vNDTe5S6WnNWEBmdBmKjQL5bsXyfauYmxPFKQGu");

export interface SmartWalletInfo {
  address: PublicKey;
  owner: PublicKey;
  heirs: Array<{
    heirPubkey: PublicKey;
    allocationPercentage: number;
  }>;
  inactivityPeriodSeconds: number;
  lastActiveTime: number;
  isExecuted: boolean;
  balance: number;
}

export class KeeperBotService {
  private connection: Connection;
  private program: Program<Gado> | null = null;
  private keeperWallet: Keypair | null = null;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  async initialize(keeperWallet?: Keypair) {
    if (keeperWallet) {
      this.keeperWallet = keeperWallet;
      
      const provider = new anchor.AnchorProvider(
        this.connection,
        { publicKey: keeperWallet.publicKey, signTransaction: async () => ({ signature: Buffer.alloc(64) }) } as any,
        { commitment: 'confirmed' }
      );
      
      this.program = new Program(IDL as any, provider) as Program<Gado>;
    }
  }

  /**
   * Get Smart Wallet information for monitoring
   */
  async getSmartWalletInfo(ownerPublicKey: PublicKey): Promise<SmartWalletInfo | null> {
    if (!this.program) {
      throw new Error('Keeper bot not initialized');
    }

    try {
      const [smartWalletPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("smart_wallet"), ownerPublicKey.toBuffer()],
        PROGRAM_ID
      );

      const [smartWalletAssetPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("smart_wallet_pda"), ownerPublicKey.toBuffer()],
        PROGRAM_ID
      );

      const smartWalletAccount = await this.program.account.smartWallet.fetch(smartWalletPDA);
      const balance = await this.connection.getBalance(smartWalletAssetPDA);

      return {
        address: smartWalletPDA,
        owner: smartWalletAccount.owner,
        heirs: smartWalletAccount.heirs.map((heir: any) => ({
          heirPubkey: heir.heirPubkey,
          allocationPercentage: heir.allocationPercentage,
        })),
        inactivityPeriodSeconds: smartWalletAccount.inactivityPeriodSeconds.toNumber(),
        lastActiveTime: smartWalletAccount.lastActiveTime.toNumber(),
        isExecuted: smartWalletAccount.isExecuted,
        balance: balance / LAMPORTS_PER_SOL,
      };
    } catch (error) {
      console.log(`No Smart Wallet found for owner: ${ownerPublicKey.toString()}`);
      return null;
    }
  }

  /**
   * Check if a Smart Wallet owner is inactive
   */
  isOwnerInactive(smartWalletInfo: SmartWalletInfo): boolean {
    const currentTime = Math.floor(Date.now() / 1000);
    const timeSinceLastActive = currentTime - smartWalletInfo.lastActiveTime;
    
    return timeSinceLastActive > smartWalletInfo.inactivityPeriodSeconds;
  }

  /**
   * Check if Smart Wallet is eligible for inheritance execution
   */
  isEligibleForInheritance(smartWalletInfo: SmartWalletInfo): boolean {
    return (
      !smartWalletInfo.isExecuted &&
      smartWalletInfo.balance > 0 &&
      this.isOwnerInactive(smartWalletInfo)
    );
  }

  /**
   * Execute inheritance for a Smart Wallet (requires keeper wallet)
   */
  async executeInheritance(ownerPublicKey: PublicKey): Promise<boolean> {
    if (!this.program || !this.keeperWallet) {
      throw new Error('Keeper bot not properly initialized with wallet');
    }

    try {
      const [smartWalletPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("smart_wallet"), ownerPublicKey.toBuffer()],
        PROGRAM_ID
      );

      const [smartWalletAssetPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("smart_wallet_pda"), ownerPublicKey.toBuffer()],
        PROGRAM_ID
      );

      const tx = await this.program.methods
        .executeInheritance()
        .accountsPartial({
          smartWallet: smartWalletPDA,
          smartWalletPda: smartWalletAssetPDA,
          caller: this.keeperWallet.publicKey,
        })
        .signers([this.keeperWallet])
        .rpc();

      console.log(`Inheritance executed for ${ownerPublicKey.toString()}: ${tx}`);
      return true;
    } catch (error) {
      console.error(`Failed to execute inheritance for ${ownerPublicKey.toString()}:`, error);
      return false;
    }
  }

  /**
   * Monitor multiple Smart Wallets and return status
   */
  async monitorSmartWallets(ownerAddresses: PublicKey[]): Promise<{
    total: number;
    active: number;
    inactive: number;
    eligibleForInheritance: number;
    wallets: SmartWalletInfo[];
  }> {
    const wallets: SmartWalletInfo[] = [];
    let active = 0;
    let inactive = 0;
    let eligibleForInheritance = 0;

    for (const ownerAddress of ownerAddresses) {
      try {
        const walletInfo = await this.getSmartWalletInfo(ownerAddress);
        if (walletInfo) {
          wallets.push(walletInfo);
          
          if (this.isOwnerInactive(walletInfo)) {
            inactive++;
            if (this.isEligibleForInheritance(walletInfo)) {
              eligibleForInheritance++;
            }
          } else {
            active++;
          }
        }
      } catch (error) {
        console.error(`Error monitoring wallet ${ownerAddress.toString()}:`, error);
      }
    }

    return {
      total: wallets.length,
      active,
      inactive,
      eligibleForInheritance,
      wallets,
    };
  }

  /**
   * Get time until inheritance becomes available
   */
  getTimeUntilInheritance(smartWalletInfo: SmartWalletInfo): number {
    const currentTime = Math.floor(Date.now() / 1000);
    const timeSinceLastActive = currentTime - smartWalletInfo.lastActiveTime;
    const timeRemaining = smartWalletInfo.inactivityPeriodSeconds - timeSinceLastActive;
    
    return Math.max(0, timeRemaining);
  }

  /**
   * Format time remaining as human readable string
   */
  formatTimeRemaining(seconds: number): string {
    if (seconds <= 0) return "Eligible now";
    
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }
}

// Utility functions for frontend integration
export const createKeeperBotService = (connection: Connection) => {
  return new KeeperBotService(connection);
};

export const formatSmartWalletAddress = (address: PublicKey) => {
  const str = address.toString();
  return `${str.slice(0, 4)}...${str.slice(-4)}`;
};

export const calculateInheritanceAmount = (totalAmount: number, percentage: number) => {
  return (totalAmount * percentage) / 100;
};