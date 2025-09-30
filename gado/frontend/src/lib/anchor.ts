import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
import { useConnection } from '@solana/wallet-adapter-react';
import { useMemo, useEffect, useState } from 'react';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from '@solana/spl-token';
import { useWallet } from '../contexts/WalletContext';
import { checkProgramDeployment } from './programCheck';
import { getProgramId, getCluster } from './shared-config';

// Simplified IDL that works with Anchor
const IDL = {
  "version": "0.1.0",
  "name": "gado",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [],
      "args": []
    },
    {
      "name": "add_coin_heir",
      "accounts": [
        { "name": "coin_heir", "isMut": true, "isSigner": false },
        { "name": "owner", "isMut": true, "isSigner": true },
        { "name": "heir", "isMut": false, "isSigner": false },
        { "name": "system_program", "isMut": false, "isSigner": false }
      ],
      "args": [
        { "name": "amount", "type": "u64" },
        { "name": "inactivity_period_seconds", "type": "i64" }
      ]
    },
    {
      "name": "add_token_heir",
      "accounts": [
        { "name": "token_heir", "isMut": true, "isSigner": false },
        { "name": "owner", "isMut": true, "isSigner": true },
        { "name": "heir", "isMut": false, "isSigner": false },
        { "name": "token_mint", "isMut": false, "isSigner": false },
        { "name": "owner_token_account", "isMut": true, "isSigner": false },
        { "name": "escrow_token_account", "isMut": true, "isSigner": false },
        { "name": "token_program", "isMut": false, "isSigner": false },
        { "name": "associated_token_program", "isMut": false, "isSigner": false },
        { "name": "system_program", "isMut": false, "isSigner": false }
      ],
      "args": [
        { "name": "amount", "type": "u64" },
        { "name": "inactivity_period_seconds", "type": "i64" }
      ]
    },
    {
      "name": "update_activity",
      "accounts": [
        { "name": "token_heir", "isMut": true, "isSigner": false },
        { "name": "owner", "isMut": false, "isSigner": true }
      ],
      "args": []
    },
    {
      "name": "update_coin_activity",
      "accounts": [
        { "name": "coin_heir", "isMut": true, "isSigner": false },
        { "name": "owner", "isMut": false, "isSigner": true }
      ],
      "args": []
    },
    {
      "name": "batch_transfer_tokens",
      "accounts": [
        { "name": "from_token_account", "isMut": true, "isSigner": false },
        { "name": "to_token_account", "isMut": true, "isSigner": false },
        { "name": "authority", "isMut": false, "isSigner": true },
        { "name": "token_program", "isMut": false, "isSigner": false }
      ],
      "args": [
        { "name": "amounts", "type": { "vec": "u64" } }
      ]
    },
    {
      "name": "batch_transfer_coins",
      "accounts": [
        { "name": "from_account", "isMut": true, "isSigner": true },
        { "name": "to_account", "isMut": true, "isSigner": false },
        { "name": "system_program", "isMut": false, "isSigner": false }
      ],
      "args": [
        { "name": "amounts", "type": { "vec": "u64" } }
      ]
    },
    {
      "name": "claim_heir_coin_assets",
      "accounts": [
        { "name": "coin_heir", "isMut": true, "isSigner": false },
        { "name": "owner_account", "isMut": false, "isSigner": false },
        { "name": "heir_account", "isMut": true, "isSigner": true },
        { "name": "system_program", "isMut": false, "isSigner": false }
      ],
      "args": []
    },
    {
      "name": "claim_heir_token_assets",
      "accounts": [
        { "name": "token_heir", "isMut": true, "isSigner": false },
        { "name": "heir", "isMut": false, "isSigner": true },
        { "name": "heir_token_account", "isMut": true, "isSigner": false },
        { "name": "escrow_token_account", "isMut": true, "isSigner": false },
        { "name": "token_mint", "isMut": false, "isSigner": false },
        { "name": "token_program", "isMut": false, "isSigner": false }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "CoinHeir",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "owner", "type": "publicKey" },
          { "name": "heir", "type": "publicKey" },
          { "name": "amount", "type": "u64" },
          { "name": "last_active_time", "type": "i64" },
          { "name": "is_claimed", "type": "bool" },
          { "name": "inactivity_period_seconds", "type": "i64" },
          { "name": "bump", "type": "u8" }
        ]
      }
    },
    {
      "name": "TokenHeir",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "owner", "type": "publicKey" },
          { "name": "heir", "type": "publicKey" },
          { "name": "token_mint", "type": "publicKey" },
          { "name": "amount", "type": "u64" },
          { "name": "last_active_time", "type": "i64" },
          { "name": "is_claimed", "type": "bool" },
          { "name": "inactivity_period_seconds", "type": "i64" },
          { "name": "bump", "type": "u8" }
        ]
      }
    }
  ],
  "errors": [
    { "code": 6000, "name": "OwnerStillActive", "msg": "Owner is still active." },
    { "code": 6001, "name": "AlreadyClaimed", "msg": "Assets have already been claimed." },
    { "code": 6002, "name": "TooManyTransfers", "msg": "Too many transfers in batch (max 10)." }
  ]
} as any; // Type assertion to bypass strict typing

// Program ID from environment
const PROGRAM_ID = getProgramId();

export function useAnchorProgram(): any {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [programDeployed, setProgramDeployed] = useState<boolean | null>(null);

  // Check if program is deployed when connection or wallet changes
  useEffect(() => {
    let isMounted = true;
    
    const checkDeployment = async () => {
      if (!connection) return;
      
      try {
        const isDeployed = await checkProgramDeployment(connection);
        if (isMounted) {
          setProgramDeployed(isDeployed);
          if (!isDeployed) {
            console.warn(`\n⚠️  Program ${PROGRAM_ID.toString()} not found on ${getCluster()}!\n`);
          }
        }
      } catch (error) {
        console.error('Failed to check program deployment:', error);
        if (isMounted) setProgramDeployed(false);
      }
    };

    checkDeployment();
    
    return () => {
      isMounted = false;
    };
  }, [connection]);

  return useMemo(() => {
    if (!wallet || !wallet.publicKey) return undefined;
    if (programDeployed === false) {
      console.error('Cannot create program instance - program not deployed');
      return undefined;
    }

    const provider = new AnchorProvider(
      connection,
      wallet as any,
      { commitment: 'confirmed' }
    );

    return new (Program as any)(IDL, PROGRAM_ID, provider);
  }, [connection, wallet, programDeployed]);
}

// Helper functions for PDA derivation
export function getCoinHeirPDA(owner: web3.PublicKey, heir: web3.PublicKey): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("coin_heir"),
      owner.toBuffer(),
      heir.toBuffer(),
    ],
    PROGRAM_ID
  );
}

export function getTokenHeirPDA(owner: web3.PublicKey, heir: web3.PublicKey, tokenMint: web3.PublicKey): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from("token_heir"),
      owner.toBuffer(),
      heir.toBuffer(),
      tokenMint.toBuffer(),
    ],
    PROGRAM_ID
  );
}

// Contract interaction functions - simplified to avoid type issues
export async function initialize(program: any) {
  return await (program as any).methods
    .initialize()
    .rpc();
}

export async function addCoinHeir(
  program: any,
  heir: web3.PublicKey,
  amount: BN,
  inactivityPeriodSeconds: number
) {
  const [coinHeirPDA] = getCoinHeirPDA(program.provider.publicKey!, heir);
  
  return await (program as any).methods
    .addCoinHeir(amount, new BN(inactivityPeriodSeconds))
    .accounts({
      coin_heir: coinHeirPDA,
      owner: program.provider.publicKey!,
      heir: heir,
      system_program: web3.SystemProgram.programId,
    })
    .rpc();
}

export async function addTokenHeir(
  program: any,
  heir: web3.PublicKey,
  tokenMint: web3.PublicKey,
  amount: BN,
  inactivityPeriodSeconds: number
) {
  const [tokenHeirPDA] = getTokenHeirPDA(program.provider.publicKey!, heir, tokenMint);
  // Derive owner's associated token account for the given mint
  const ownerTokenAccount = getAssociatedTokenAddressSync(tokenMint, program.provider.publicKey!, false, TOKEN_PROGRAM_ID);
  
  return await (program as any).methods
    .addTokenHeir(amount, new BN(inactivityPeriodSeconds))
    .accounts({
      token_heir: tokenHeirPDA,
      owner: program.provider.publicKey!,
      heir: heir,
      token_mint: tokenMint,
      owner_token_account: ownerTokenAccount,
      escrow_token_account: tokenHeirPDA /* ATA will be created for this PDA by program */,
      token_program: TOKEN_PROGRAM_ID,
      associated_token_program: new web3.PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'),
      system_program: web3.SystemProgram.programId,
    })
    .rpc();
}

export async function updateActivity(program: any, tokenHeirPDA: web3.PublicKey) {
  return await (program as any).methods
    .updateActivity()
    .accounts({
      token_heir: tokenHeirPDA,
      owner: program.provider.publicKey!,
    })
    .rpc();
}

export async function updateCoinActivity(program: any, coinHeirPDA: web3.PublicKey) {
  return await (program as any).methods
    .updateCoinActivity()
    .accounts({
      coin_heir: coinHeirPDA,
      owner: program.provider.publicKey!,
    })
    .rpc();
}

export async function batchTransferTokens(
  program: any,
  fromTokenAccount: web3.PublicKey,
  toTokenAccount: web3.PublicKey,
  amounts: BN[]
) {
  return await (program as any).methods
    .batchTransferTokens(amounts)
    .accounts({
      from_token_account: fromTokenAccount,
      to_token_account: toTokenAccount,
      authority: program.provider.publicKey!,
      token_program: TOKEN_PROGRAM_ID,
    })
    .rpc();
}

export async function batchTransferCoins(
  program: any,
  toAccount: web3.PublicKey,
  amounts: BN[]
) {
  return await (program as any).methods
    .batchTransferCoins(amounts)
    .accounts({
      from_account: program.provider.publicKey!,
      to_account: toAccount,
      system_program: web3.SystemProgram.programId,
    })
    .rpc();
}

export async function claimHeirCoinAssets(
  program: any,
  coinHeirPDA: web3.PublicKey,
  ownerAccount: web3.PublicKey
) {
  return await (program as any).methods
    .claimHeirCoinAssets()
    .accounts({
      coin_heir: coinHeirPDA,
      owner_account: ownerAccount,
      heir_account: program.provider.publicKey!,
      system_program: web3.SystemProgram.programId,
    })
    .rpc();
}

export async function claimHeirTokenAssets(
  program: any,
  tokenHeirPDA: web3.PublicKey,
  tokenMint: web3.PublicKey,
  heirTokenAccount: web3.PublicKey
) {
  return await (program as any).methods
    .claimHeirTokenAssets()
    .accounts({
      token_heir: tokenHeirPDA,
      heir: program.provider.publicKey!,
      heir_token_account: heirTokenAccount,
      escrow_token_account: tokenHeirPDA /* PDA ATA as escrow */,
      token_mint: tokenMint,
      token_program: TOKEN_PROGRAM_ID,
    })
    .rpc();
}

export function isHeirClaimable(lastActiveTimeSeconds: number, isClaimed: boolean, inactivitySeconds: number): boolean {
  if (isClaimed) return false;
  const nowSeconds = Math.floor(Date.now() / 1000);
  return nowSeconds - lastActiveTimeSeconds > inactivitySeconds;
} 