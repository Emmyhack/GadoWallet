import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';
import { PROGRAM_ID, TOKEN_PROGRAM_ID } from './publickey-utils';

// Import the actual IDL from the gado target directory
// For production, you should import the actual generated IDL
const IDL: any = {
  "version": "0.1.0",
  "name": "gado",
  "instructions": [
    {
      "name": "add_coin_heir",
      "accounts": [
        { "name": "coinHeir", "isMut": true, "isSigner": false },
        { "name": "owner", "isMut": true, "isSigner": true },
        { "name": "heir", "isMut": false, "isSigner": false },
        { "name": "systemProgram", "isMut": false, "isSigner": false }
      ],
      "args": [
        { "name": "amount", "type": "u64" },
        { "name": "inactivity_period_seconds", "type": "i64" }
      ]
    },
    {
      "name": "add_token_heir",
      "accounts": [
        { "name": "tokenHeir", "isMut": true, "isSigner": false },
        { "name": "owner", "isMut": true, "isSigner": true },
        { "name": "heir", "isMut": false, "isSigner": false },
        { "name": "tokenMint", "isMut": false, "isSigner": false },
        { "name": "ownerTokenAccount", "isMut": true, "isSigner": false },
        { "name": "escrowTokenAccount", "isMut": true, "isSigner": false },
        { "name": "tokenProgram", "isMut": false, "isSigner": false },
        { "name": "associatedTokenProgram", "isMut": false, "isSigner": false },
        { "name": "systemProgram", "isMut": false, "isSigner": false }
      ],
      "args": [
        { "name": "amount", "type": "u64" },
        { "name": "inactivity_period_seconds", "type": "i64" }
      ]
    },
    {
      "name": "batch_transfer_coins",
      "accounts": [
        { "name": "fromAccount", "isMut": true, "isSigner": true },
        { "name": "systemProgram", "isMut": false, "isSigner": false }
      ],
      "args": [
        { "name": "recipients", "type": { "vec": "publicKey" } },
        { "name": "amounts", "type": { "vec": "u64" } }
      ]
    },
    {
      "name": "batch_transfer_tokens",
      "accounts": [
        { "name": "fromTokenAccount", "isMut": true, "isSigner": false },
        { "name": "authority", "isMut": false, "isSigner": true },
        { "name": "tokenProgram", "isMut": false, "isSigner": false }
      ],
      "args": [
        { "name": "recipients", "type": { "vec": "publicKey" } },
        { "name": "amounts", "type": { "vec": "u64" } }
      ]
    },
    {
      "name": "claim_heir_coin_assets",
      "accounts": [
        { "name": "coinHeir", "isMut": true, "isSigner": false },
        { "name": "ownerAccount", "isMut": false, "isSigner": false },
        { "name": "heirAccount", "isMut": true, "isSigner": true },
        { "name": "systemProgram", "isMut": false, "isSigner": false }
      ],
      "args": []
    },
    {
      "name": "claim_heir_token_assets",
      "accounts": [
        { "name": "tokenHeir", "isMut": true, "isSigner": false },
        { "name": "heir", "isMut": false, "isSigner": true },
        { "name": "heirTokenAccount", "isMut": true, "isSigner": false },
        { "name": "escrowTokenAccount", "isMut": true, "isSigner": false },
        { "name": "tokenMint", "isMut": false, "isSigner": false },
        { "name": "tokenProgram", "isMut": false, "isSigner": false }
      ],
      "args": []
    },
    { "name": "initialize", "accounts": [], "args": [] },
    {
      "name": "update_activity",
      "accounts": [
        { "name": "tokenHeir", "isMut": true, "isSigner": false },
        { "name": "owner", "isMut": false, "isSigner": true }
      ],
      "args": []
    },
    {
      "name": "update_coin_activity",
      "accounts": [
        { "name": "coinHeir", "isMut": true, "isSigner": false },
        { "name": "owner", "isMut": false, "isSigner": true }
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
          { "name": "lastActiveTime", "type": "i64" },
          { "name": "isClaimed", "type": "bool" },
          { "name": "inactivityPeriodSeconds", "type": "i64" },
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
          { "name": "tokenMint", "type": "publicKey" },
          { "name": "amount", "type": "u64" },
          { "name": "lastActiveTime", "type": "i64" },
          { "name": "isClaimed", "type": "bool" },
          { "name": "inactivityPeriodSeconds", "type": "i64" },
          { "name": "bump", "type": "u8" }
        ]
      }
    }
  ],
  "errors": [
    { "code": 6000, "name": "OwnerStillActive", "msg": "Owner is still active." },
    { "code": 6001, "name": "AlreadyClaimed", "msg": "Assets have already been claimed." },
    { "code": 6002, "name": "TooManyTransfers", "msg": "Too many transfers in batch (max 10)." },
    { "code": 6003, "name": "Unauthorized", "msg": "Unauthorized operation." },
    { "code": 6004, "name": "InvalidMint", "msg": "Invalid token mint." },
    { "code": 6005, "name": "InvalidInactivityPeriod", "msg": "Invalid inactivity period." },
    { "code": 6006, "name": "MismatchedArrays", "msg": "Recipients and amounts arrays must have the same length." },
    { "code": 6007, "name": "InsufficientAccounts", "msg": "Insufficient accounts provided for batch transfer." }
  ]
};

// Using any type to avoid complex type inference issues

export function useAnchorProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();

  return useMemo(() => {
    if (!wallet || !wallet.publicKey) return null;

    const provider = new AnchorProvider(
      connection,
      wallet as any,
      { commitment: 'confirmed' }
    );

    return new Program(IDL as any, provider) as any;
  }, [connection, wallet]);
}

export function getCoinHeirPDA(owner: web3.PublicKey, heir: web3.PublicKey): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from('coin_heir'), owner.toBuffer(), heir.toBuffer()],
    PROGRAM_ID
  );
}

export function getTokenHeirPDA(owner: web3.PublicKey, heir: web3.PublicKey, tokenMint: web3.PublicKey): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from('token_heir'), owner.toBuffer(), heir.toBuffer(), tokenMint.toBuffer()],
    PROGRAM_ID
  );
}

export async function addCoinHeir(
  program: any,
  heir: web3.PublicKey,
  amount: BN,
  inactivityPeriodSeconds: number
) {
  const [coinHeirPDA] = getCoinHeirPDA(program.provider.publicKey!, heir);
  return await ((program.methods as any) as any)
    .addCoinHeir(amount, new BN(inactivityPeriodSeconds))
    .accounts({
      coinHeir: coinHeirPDA,
      owner: program.provider.publicKey!,
      heir: heir,
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc();
}

export async function addTokenHeir(
  program: any,
  heir: web3.PublicKey,
  tokenMint: web3.PublicKey,
  ownerTokenAccount: web3.PublicKey,
  amount: BN,
  inactivityPeriodSeconds: number
) {
  const [tokenHeirPDA] = getTokenHeirPDA(program.provider.publicKey!, heir, tokenMint);
  const [escrowTokenAccount] = await web3.PublicKey.findProgramAddress(
    [Buffer.from('token_heir'), program.provider.publicKey!.toBuffer(), heir.toBuffer(), tokenMint.toBuffer()],
    PROGRAM_ID
  );
  return await (program.methods as any)
    .addTokenHeir(amount, new BN(inactivityPeriodSeconds))
    .accounts({
      tokenHeir: tokenHeirPDA,
      owner: program.provider.publicKey!,
      heir: heir,
      tokenMint: tokenMint,
      ownerTokenAccount: ownerTokenAccount,
      escrowTokenAccount: escrowTokenAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: new web3.PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'),
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc();
}

export async function updateActivity(program: any, tokenHeirPDA: web3.PublicKey) {
  return await (program.methods as any)
    .updateActivity()
    .accounts({
      tokenHeir: tokenHeirPDA,
      owner: program.provider.publicKey!,
    })
    .rpc();
}

export async function updateCoinActivity(program: any, coinHeirPDA: web3.PublicKey) {
  return await (program.methods as any)
    .updateCoinActivity()
    .accounts({
      coinHeir: coinHeirPDA,
      owner: program.provider.publicKey!,
    })
    .rpc();
}

export async function claimHeirCoinAssets(
  program: any,
  coinHeirPDA: web3.PublicKey,
  ownerAccount: web3.PublicKey
) {
  return await (program.methods as any)
    .claimHeirCoinAssets()
    .accounts({
      coinHeir: coinHeirPDA,
      ownerAccount: ownerAccount,
      heirAccount: program.provider.publicKey!,
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc();
}

export async function claimHeirTokenAssets(
  program: any,
  tokenHeirPDA: web3.PublicKey,
  tokenMint: web3.PublicKey,
  heirTokenAccount: web3.PublicKey,
) {
  const [escrowTokenAccount] = await web3.PublicKey.findProgramAddress(
    [Buffer.from('token_heir'), program.provider.publicKey!.toBuffer(), program.provider.publicKey!.toBuffer(), tokenMint.toBuffer()],
    PROGRAM_ID
  );
  return await (program.methods as any)
    .claimHeirTokenAssets()
    .accounts({
      tokenHeir: tokenHeirPDA,
      heir: program.provider.publicKey!,
      heirTokenAccount: heirTokenAccount,
      escrowTokenAccount: escrowTokenAccount,
      tokenMint: tokenMint,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();
}

export async function batchTransferCoins(
  program: any,
  recipients: web3.PublicKey[],
  amounts: BN[]
) {
  return await (program.methods as any)
    .batchTransferCoins(recipients, amounts)
    .accounts({
      fromAccount: program.provider.publicKey!,
      systemProgram: web3.SystemProgram.programId,
    })
    .remainingAccounts(recipients.map(recipient => ({
      pubkey: recipient,
      isWritable: true,
      isSigner: false,
    })))
    .rpc();
}

export async function batchTransferTokens(
  program: any,
  fromTokenAccount: web3.PublicKey,
  recipients: web3.PublicKey[],
  toTokenAccounts: web3.PublicKey[],
  amounts: BN[]
) {
  return await (program.methods as any)
    .batchTransferTokens(recipients, amounts)
    .accounts({
      fromTokenAccount: fromTokenAccount,
      authority: program.provider.publicKey!,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .remainingAccounts(toTokenAccounts.map(account => ({
      pubkey: account,
      isWritable: true,
      isSigner: false,
    })))
    .rpc();
}

export async function listCoinHeirsByOwner(program: any, owner: web3.PublicKey) {
  return await (program as any).account.coinHeir.all([
    { memcmp: { offset: 8, bytes: owner.toBase58() } },
  ]);
}

export async function listCoinHeirsByHeir(program: any, heir: web3.PublicKey) {
  return await (program as any).account.coinHeir.all([
    { memcmp: { offset: 8 + 32, bytes: heir.toBase58() } },
  ]);
}

export async function listCoinHeirsByOwnerAndHeir(
  program: any,
  owner: web3.PublicKey,
  heir: web3.PublicKey,
) {
  return await (program as any).account.coinHeir.all([
    { memcmp: { offset: 8, bytes: owner.toBase58() } },
    { memcmp: { offset: 8 + 32, bytes: heir.toBase58() } },
  ]);
}

export async function listTokenHeirsByOwner(program: any, owner: web3.PublicKey) {
  return await (program as any).account.tokenHeir.all([
    { memcmp: { offset: 8, bytes: owner.toBase58() } },
  ]);
}

export async function listTokenHeirsByHeir(program: any, heir: web3.PublicKey) {
  return await (program as any).account.tokenHeir.all([
    { memcmp: { offset: 8 + 32, bytes: heir.toBase58() } },
  ]);
}

export async function listTokenHeirsByOwnerAndHeir(
  program: any,
  owner: web3.PublicKey,
  heir: web3.PublicKey,
) {
  return await (program as any).account.tokenHeir.all([
    { memcmp: { offset: 8, bytes: owner.toBase58() } },
    { memcmp: { offset: 8 + 32, bytes: heir.toBase58() } },
  ]);
}

export const ONE_DAY_SECONDS = 24 * 60 * 60;
export function isHeirClaimable(lastActiveTimeSeconds: number, isClaimed: boolean, inactivitySeconds: number): boolean {
  if (isClaimed) return false;
  const nowSeconds = Math.floor(Date.now() / 1000);
  return nowSeconds - lastActiveTimeSeconds > inactivitySeconds;
}