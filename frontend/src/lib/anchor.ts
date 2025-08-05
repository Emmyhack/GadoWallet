import { Program, AnchorProvider, web3, BN } from '@project-serum/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';

// Real Gada IDL
const IDL: any = {
  "version": "0.1.0",
  "name": "gada",
  "instructions": [
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
    },
    {
      "name": "initialize",
      "accounts": [],
      "args": []
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
            "name": "lastActiveTime",
            "type": "i64"
          },
          {
            "name": "isClaimed",
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
            "name": "tokenMint",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "lastActiveTime",
            "type": "i64"
          },
          {
            "name": "isClaimed",
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
};

export type Gada = Program<typeof IDL>;

export function useAnchorProgram(): Gada | undefined {
  const { connection } = useConnection();
  const wallet = useWallet();

  return useMemo(() => {
    if (!wallet || !connection || !wallet.connected) {
      return undefined;
    }

    const provider = new AnchorProvider(
      connection,
      wallet as any,
      { commitment: 'confirmed' }
    );

    return new Program(IDL, 'Gf4b24oCZ6xGdVj5HyKfDBZKrd3JUuhQ87ApMAyg87t5', provider);
  }, [connection, wallet]);
}

export function getCoinHeirPDA(owner: web3.PublicKey, heir: web3.PublicKey): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from('coin_heir'),
      owner.toBuffer(),
      heir.toBuffer(),
    ],
    new web3.PublicKey('Gf4b24oCZ6xGdVj5HyKfDBZKrd3JUuhQ87ApMAyg87t5')
  );
}

export function getTokenHeirPDA(owner: web3.PublicKey, heir: web3.PublicKey, tokenMint: web3.PublicKey): [web3.PublicKey, number] {
  return web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from('token_heir'),
      owner.toBuffer(),
      heir.toBuffer(),
      tokenMint.toBuffer(),
    ],
    new web3.PublicKey('Gf4b24oCZ6xGdVj5HyKfDBZKrd3JUuhQ87ApMAyg87t5')
  );
}

export async function addCoinHeir(
  program: Gada,
  heir: web3.PublicKey,
  amount: BN
) {
  const [coinHeirPDA] = getCoinHeirPDA(program.provider.publicKey!, heir);
  
  return await program.methods
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
  program: Gada,
  heir: web3.PublicKey,
  tokenMint: web3.PublicKey,
  amount: BN
) {
  const [tokenHeirPDA] = getTokenHeirPDA(program.provider.publicKey!, heir, tokenMint);
  
  return await program.methods
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

export async function updateActivity(program: Gada, tokenHeirPDA: web3.PublicKey) {
  return await program.methods
    .updateActivity()
    .accounts({
      tokenHeir: tokenHeirPDA,
      owner: program.provider.publicKey!,
    })
    .rpc();
}

export async function updateCoinActivity(program: Gada, coinHeirPDA: web3.PublicKey) {
  return await program.methods
    .updateCoinActivity()
    .accounts({
      coinHeir: coinHeirPDA,
      owner: program.provider.publicKey!,
    })
    .rpc();
}

export async function claimHeirCoinAssets(
  program: Gada,
  coinHeirPDA: web3.PublicKey,
  ownerAccount: web3.PublicKey
) {
  return await program.methods
    .claimHeirCoinAssets()
    .accounts({
      coinHeir: coinHeirPDA,
      ownerAccount: ownerAccount,
      heirAccount: program.provider.publicKey!,
    })
    .rpc();
}

export async function claimHeirTokenAssets(
  program: Gada,
  tokenHeirPDA: web3.PublicKey,
  owner: web3.PublicKey,
  ownerTokenAccount: web3.PublicKey,
  heirTokenAccount: web3.PublicKey,
  authority: web3.PublicKey
) {
  return await program.methods
    .claimHeirTokenAssets()
    .accounts({
      tokenHeir: tokenHeirPDA,
      owner: owner,
      heir: program.provider.publicKey!,
      ownerTokenAccount: ownerTokenAccount,
      heirTokenAccount: heirTokenAccount,
      authority: authority,
      tokenProgram: new web3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
    })
    .rpc();
}

export async function batchTransferCoins(
  program: Gada,
  toAccount: web3.PublicKey,
  amounts: BN[]
) {
  return await program.methods
    .batchTransferCoins(amounts)
    .accounts({
      fromAccount: program.provider.publicKey!,
      toAccount: toAccount,
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc();
}

export async function batchTransferTokens(
  program: Gada,
  fromTokenAccount: web3.PublicKey,
  toTokenAccount: web3.PublicKey,
  amounts: BN[]
) {
  return await program.methods
    .batchTransferTokens(amounts)
    .accounts({
      fromTokenAccount: fromTokenAccount,
      toTokenAccount: toTokenAccount,
      authority: program.provider.publicKey!,
      tokenProgram: new web3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
    })
    .rpc();
}