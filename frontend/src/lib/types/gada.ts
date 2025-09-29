/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/gada.json`.
 */
export type Gada = {
  "address": "EciS2vNDTe5S6WnNWEBmdBmKjQL5bsXyfauYmxPFKQGu",
  "metadata": {
    "name": "gada",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "addCoinHeir",
      "discriminator": [
        203,
        24,
        13,
        131,
        240,
        160,
        200,
        165
      ],
      "accounts": [
        {
          "name": "coinHeir",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  105,
                  110,
                  95,
                  104,
                  101,
                  105,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "account",
                "path": "heir"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "heir"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "inactivityPeriodSeconds",
          "type": "i64"
        }
      ]
    },
    {
      "name": "addTokenHeir",
      "discriminator": [
        53,
        128,
        146,
        36,
        167,
        184,
        246,
        61
      ],
      "accounts": [
        {
          "name": "tokenHeir",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  104,
                  101,
                  105,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "account",
                "path": "heir"
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "heir"
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "ownerTokenAccount",
          "writable": true
        },
        {
          "name": "escrowTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "tokenHeir"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "inactivityPeriodSeconds",
          "type": "i64"
        }
      ]
    },
    {
      "name": "batchTransferCoins",
      "discriminator": [
        145,
        172,
        71,
        101,
        181,
        21,
        251,
        203
      ],
      "accounts": [
        {
          "name": "fromAccount",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "recipients",
          "type": {
            "vec": "pubkey"
          }
        },
        {
          "name": "amounts",
          "type": {
            "vec": "u64"
          }
        }
      ]
    },
    {
      "name": "batchTransferTokens",
      "discriminator": [
        115,
        200,
        216,
        161,
        245,
        193,
        244,
        81
      ],
      "accounts": [
        {
          "name": "fromTokenAccount",
          "writable": true
        },
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "recipients",
          "type": {
            "vec": "pubkey"
          }
        },
        {
          "name": "amounts",
          "type": {
            "vec": "u64"
          }
        }
      ]
    },
    {
      "name": "claimHeirCoinAssets",
      "discriminator": [
        7,
        25,
        130,
        161,
        169,
        26,
        113,
        31
      ],
      "accounts": [
        {
          "name": "coinHeir",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  105,
                  110,
                  95,
                  104,
                  101,
                  105,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "ownerAccount"
              },
              {
                "kind": "account",
                "path": "heirAccount"
              }
            ]
          }
        },
        {
          "name": "ownerAccount"
        },
        {
          "name": "heirAccount",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "claimHeirTokenAssets",
      "discriminator": [
        246,
        253,
        49,
        215,
        114,
        172,
        129,
        228
      ],
      "accounts": [
        {
          "name": "tokenHeir",
          "writable": true
        },
        {
          "name": "heir",
          "signer": true
        },
        {
          "name": "heirTokenAccount",
          "writable": true
        },
        {
          "name": "escrowTokenAccount",
          "writable": true
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    },
    {
      "name": "createSmartWalletInheritance",
      "docs": [
        "Creates a Smart Wallet inheritance setup with PDA wallet ownership"
      ],
      "discriminator": [
        42,
        110,
        118,
        151,
        155,
        57,
        240,
        249
      ],
      "accounts": [
        {
          "name": "smartWallet",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  109,
                  97,
                  114,
                  116,
                  95,
                  119,
                  97,
                  108,
                  108,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "smartWalletPda",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  109,
                  97,
                  114,
                  116,
                  95,
                  119,
                  97,
                  108,
                  108,
                  101,
                  116,
                  95,
                  112,
                  100,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "heirs",
          "type": {
            "vec": {
              "defined": {
                "name": "heirData"
              }
            }
          }
        },
        {
          "name": "inactivityPeriodSeconds",
          "type": "i64"
        }
      ]
    },
    {
      "name": "depositToSmartWallet",
      "docs": [
        "Deposits SOL into the Smart Wallet PDA"
      ],
      "discriminator": [
        99,
        208,
        79,
        207,
        229,
        18,
        254,
        9
      ],
      "accounts": [
        {
          "name": "smartWallet",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  109,
                  97,
                  114,
                  116,
                  95,
                  119,
                  97,
                  108,
                  108,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "smartWalletPda",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  109,
                  97,
                  114,
                  116,
                  95,
                  119,
                  97,
                  108,
                  108,
                  101,
                  116,
                  95,
                  112,
                  100,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
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
      "name": "depositTokensToSmartWallet",
      "docs": [
        "Deposits SPL tokens into the Smart Wallet PDA"
      ],
      "discriminator": [
        216,
        40,
        142,
        115,
        155,
        6,
        0,
        107
      ],
      "accounts": [
        {
          "name": "smartWallet",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  109,
                  97,
                  114,
                  116,
                  95,
                  119,
                  97,
                  108,
                  108,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "ownerTokenAccount",
          "writable": true
        },
        {
          "name": "smartWalletTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "smartWalletPda"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "smartWalletPda",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  109,
                  97,
                  114,
                  116,
                  95,
                  119,
                  97,
                  108,
                  108,
                  101,
                  116,
                  95,
                  112,
                  100,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
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
      "name": "executeInheritance",
      "docs": [
        "Executes inheritance by transferring all Smart Wallet assets to heirs",
        "Called by keepers/bots when owner is inactive past threshold"
      ],
      "discriminator": [
        108,
        112,
        129,
        171,
        5,
        244,
        41,
        106
      ],
      "accounts": [
        {
          "name": "smartWallet",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  109,
                  97,
                  114,
                  116,
                  95,
                  119,
                  97,
                  108,
                  108,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "smart_wallet.owner",
                "account": "smartWallet"
              }
            ]
          }
        },
        {
          "name": "smartWalletPda",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  109,
                  97,
                  114,
                  116,
                  95,
                  119,
                  97,
                  108,
                  108,
                  101,
                  116,
                  95,
                  112,
                  100,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "smart_wallet.owner",
                "account": "smartWallet"
              }
            ]
          }
        },
        {
          "name": "caller",
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [],
      "args": []
    },
    {
      "name": "updateActivity",
      "discriminator": [
        137,
        101,
        27,
        43,
        221,
        52,
        130,
        149
      ],
      "accounts": [
        {
          "name": "tokenHeir",
          "writable": true
        },
        {
          "name": "owner",
          "signer": true,
          "relations": [
            "tokenHeir"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "updateCoinActivity",
      "discriminator": [
        43,
        228,
        24,
        17,
        112,
        211,
        237,
        242
      ],
      "accounts": [
        {
          "name": "coinHeir",
          "writable": true
        },
        {
          "name": "owner",
          "signer": true,
          "relations": [
            "coinHeir"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "updateSmartWalletActivity",
      "docs": [
        "Updates activity timestamp for Smart Wallet owner"
      ],
      "discriminator": [
        28,
        203,
        138,
        210,
        47,
        90,
        244,
        40
      ],
      "accounts": [
        {
          "name": "smartWallet",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  109,
                  97,
                  114,
                  116,
                  95,
                  119,
                  97,
                  108,
                  108,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "owner",
          "signer": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "coinHeir",
      "discriminator": [
        50,
        90,
        79,
        11,
        179,
        253,
        114,
        136
      ]
    },
    {
      "name": "smartWallet",
      "discriminator": [
        67,
        59,
        220,
        179,
        41,
        10,
        60,
        177
      ]
    },
    {
      "name": "tokenHeir",
      "discriminator": [
        236,
        46,
        241,
        163,
        137,
        253,
        231,
        68
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "ownerStillActive",
      "msg": "Owner is still active."
    },
    {
      "code": 6001,
      "name": "alreadyClaimed",
      "msg": "Assets have already been claimed."
    },
    {
      "code": 6002,
      "name": "tooManyTransfers",
      "msg": "Too many transfers in batch (max 10)."
    },
    {
      "code": 6003,
      "name": "unauthorized",
      "msg": "Unauthorized operation."
    },
    {
      "code": 6004,
      "name": "invalidMint",
      "msg": "Invalid token mint."
    },
    {
      "code": 6005,
      "name": "invalidInactivityPeriod",
      "msg": "Invalid inactivity period."
    },
    {
      "code": 6006,
      "name": "mismatchedArrays",
      "msg": "Recipients and amounts arrays must have the same length."
    },
    {
      "code": 6007,
      "name": "insufficientAccounts",
      "msg": "Insufficient accounts provided for batch transfer."
    },
    {
      "code": 6008,
      "name": "tooManyHeirs",
      "msg": "Too many heirs (max 10)."
    },
    {
      "code": 6009,
      "name": "noHeirsProvided",
      "msg": "No heirs provided."
    },
    {
      "code": 6010,
      "name": "invalidAllocation",
      "msg": "Heir allocation percentages must sum to 100."
    },
    {
      "code": 6011,
      "name": "alreadyExecuted",
      "msg": "Inheritance has already been executed."
    }
  ],
  "types": [
    {
      "name": "coinHeir",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "heir",
            "type": "pubkey"
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
            "name": "inactivityPeriodSeconds",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "heirData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "heirPubkey",
            "type": "pubkey"
          },
          {
            "name": "allocationPercentage",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "smartWallet",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "heirs",
            "type": {
              "vec": {
                "defined": {
                  "name": "heirData"
                }
              }
            }
          },
          {
            "name": "inactivityPeriodSeconds",
            "type": "i64"
          },
          {
            "name": "lastActiveTime",
            "type": "i64"
          },
          {
            "name": "isExecuted",
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
      "name": "tokenHeir",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "heir",
            "type": "pubkey"
          },
          {
            "name": "tokenMint",
            "type": "pubkey"
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
            "name": "inactivityPeriodSeconds",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
