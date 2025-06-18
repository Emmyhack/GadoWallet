import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
import { useConnection } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { useWallet } from '../contexts/WalletContext';

// Simplified IDL that works with Anchor
const IDL = {
  "version": "0.1.0",
  "name": "gada",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [],
      "args": []
    },
    {
      "name": "add_coin_heir",
      "accounts": [
        {
          "name": "coin_heir",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "heir",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "system_program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "add_token_heir",
      "accounts": [
        {
          "name": "token_heir",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "heir",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "token_mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "system_program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "update_activity",
      "accounts": [
        {
          "name": "token_heir",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "update_coin_activity",
      "accounts": [
        {
          "name": "coin_heir",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "batch_transfer_tokens",
      "accounts": [
        {
          "name": "from_token_account",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "to_token_account",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "token_program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amounts",
          "type": {
            "vec": "u64"
          }
        }
      ]
    },
    {
      "name": "batch_transfer_coins",
      "accounts": [
        {
          "name": "from_account",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "to_account",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "system_program",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amounts",
          "type": {
            "vec": "u64"
          }
        }
      ]
    },
    {
      "name": "claim_heir_coin_assets",
      "accounts": [
        {
          "name": "coin_heir",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner_account",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "heir_account",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "claim_heir_token_assets",
      "accounts": [
        {
          "name": "token_heir",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "heir",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "owner_token_account",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "heir_token_account",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "token_program",
          "isMut": false,
          "isSigner": false
        }
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
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "heir",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "last_active_time",
            "type": "i64"
          },
          {
            "name": "is_claimed",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "TokenHeir",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "heir",
            "type": "publicKey"
          },
          {
            "name": "token_mint",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "last_active_time",
            "type": "i64"
          },
          {
            "name": "is_claimed",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "OwnerStillActive",
      "msg": "Owner is still active."
    },
    {
      "code": 6001,
      "name": "AlreadyClaimed",
      "msg": "Assets have already been claimed."
    },
    {
      "code": 6002,
      "name": "TooManyTransfers",
      "msg": "Too many transfers in batch (max 10)."
    }
  ]
} as any; // Type assertion to bypass strict typing

// Program ID from your IDL
const PROGRAM_ID = new web3.PublicKey("Gf4b24oCZ6xGdVj5HyKfDBZKrd3JUuhQ87ApMAyg87t5");

export function useAnchorProgram(): any {
  const { connection } = useConnection();
  const wallet = useWallet();

  return useMemo(() => {
    if (!wallet || !wallet.publicKey) return undefined;

    const provider = new AnchorProvider(
      connection,
      wallet as any,
      { commitment: 'confirmed' }
    );

    return new (Program as any)(IDL, PROGRAM_ID, provider);
  }, [connection, wallet]);
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
  amount: BN
) {
  const [coinHeirPDA] = getCoinHeirPDA(program.provider.publicKey!, heir);
  
  return await (program as any).methods
    .addCoinHeir(amount)
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
  amount: BN
) {
  const [tokenHeirPDA] = getTokenHeirPDA(program.provider.publicKey!, heir, tokenMint);
  
  return await (program as any).methods
    .addTokenHeir(amount)
    .accounts({
      tokenHeir: tokenHeirPDA,
      owner: program.provider.publicKey!,
      heir: heir,
      tokenMint: tokenMint,
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc();
}

export async function updateActivity(program: any, tokenHeirPDA: web3.PublicKey) {
  return await (program as any).methods
    .updateActivity()
    .accounts({
      tokenHeir: tokenHeirPDA,
      owner: program.provider.publicKey!,
    })
    .rpc();
}

export async function updateCoinActivity(program: any, coinHeirPDA: web3.PublicKey) {
  return await (program as any).methods
    .updateCoinActivity()
    .accounts({
      coinHeir: coinHeirPDA,
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
      fromTokenAccount: fromTokenAccount,
      toTokenAccount: toTokenAccount,
      authority: program.provider.publicKey!,
      tokenProgram: TOKEN_PROGRAM_ID,
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
      fromAccount: program.provider.publicKey!,
      toAccount: toAccount,
      systemProgram: web3.SystemProgram.programId,
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
      coinHeir: coinHeirPDA,
      ownerAccount: ownerAccount,
      heirAccount: program.provider.publicKey!,
    })
    .rpc();
}

export async function claimHeirTokenAssets(
  program: any,
  tokenHeirPDA: web3.PublicKey,
  owner: web3.PublicKey,
  ownerTokenAccount: web3.PublicKey,
  heirTokenAccount: web3.PublicKey,
  authority: web3.PublicKey
) {
  return await (program as any).methods
    .claimHeirTokenAssets()
    .accounts({
      tokenHeir: tokenHeirPDA,
      owner: owner,
      heir: program.provider.publicKey!,
      ownerTokenAccount: ownerTokenAccount,
      heirTokenAccount: heirTokenAccount,
      authority: authority,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();
} 