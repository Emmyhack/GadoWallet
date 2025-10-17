/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/gado.json`.
 */
export type Gado = {
  "address": "EciS2vNDTe5S6WnNWEBmdBmKjQL5bsXyfauYmxPFKQGu",
  "metadata": {
    "name": "gado",
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
          "name": "userProfile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
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
      "name": "addMultiTokenInheritance",
      "docs": [
        "Add multiple tokens to Smart Wallet inheritance"
      ],
      "discriminator": [
        164,
        63,
        127,
        252,
        58,
        254,
        84,
        99
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
          "name": "platformConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "userProfile",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
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
      "args": [
        {
          "name": "tokenAllocations",
          "type": {
            "vec": {
              "defined": {
                "name": "tokenAllocation"
              }
            }
          }
        }
      ]
    },
    {
      "name": "addSmartWalletHeir",
      "docs": [
        "Add additional heir to existing Smart Wallet (premium only)"
      ],
      "discriminator": [
        184,
        53,
        101,
        219,
        228,
        202,
        7,
        89
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
          "name": "userProfile",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
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
      "args": [
        {
          "name": "heirPubkey",
          "type": "pubkey"
        },
        {
          "name": "allocationPercentage",
          "type": "u8"
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
          "name": "userProfile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
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
      "name": "createPartner",
      "docs": [
        "Create a white-label partner configuration"
      ],
      "discriminator": [
        220,
        20,
        67,
        171,
        205,
        106,
        128,
        56
      ],
      "accounts": [
        {
          "name": "partnerConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  97,
                  114,
                  116,
                  110,
                  101,
                  114
                ]
              },
              {
                "kind": "arg",
                "path": "partnerName"
              }
            ]
          }
        },
        {
          "name": "platformConfig",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "partnerAuthority"
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "relations": [
            "platformConfig"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "partnerName",
          "type": "string"
        },
        {
          "name": "feeShareBps",
          "type": "u16"
        },
        {
          "name": "customBranding",
          "type": "bool"
        }
      ]
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
          "name": "userProfile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
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
      "name": "emergencyPause",
      "docs": [
        "Emergency pause/unpause platform (admin only)"
      ],
      "discriminator": [
        21,
        143,
        27,
        142,
        200,
        181,
        210,
        255
      ],
      "accounts": [
        {
          "name": "platformConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "platformConfig"
          ]
        }
      ],
      "args": [
        {
          "name": "paused",
          "type": "bool"
        }
      ]
    },
    {
      "name": "executeInheritance",
      "docs": [
        "Executes inheritance by transferring all Smart Wallet assets to heirs"
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
          "name": "platformConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "treasury",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "userProfile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
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
      "accounts": [
        {
          "name": "platformConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "treasury",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "admin",
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
      "name": "initializeUserProfile",
      "docs": [
        "Initialize or update user profile with subscription status"
      ],
      "discriminator": [
        192,
        144,
        204,
        140,
        113,
        25,
        59,
        102
      ],
      "accounts": [
        {
          "name": "userProfile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "platformConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "user",
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
          "name": "isPremium",
          "type": "bool"
        }
      ]
    },
    {
      "name": "logNotification",
      "docs": [
        "Log notification event for inheritance triggers"
      ],
      "discriminator": [
        203,
        173,
        83,
        232,
        3,
        171,
        248,
        127
      ],
      "accounts": [
        {
          "name": "notification",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  111,
                  116,
                  105,
                  102,
                  105,
                  99,
                  97,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "arg",
                "path": "timestamp"
              }
            ]
          }
        },
        {
          "name": "userProfile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user",
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
          "name": "timestamp",
          "type": "i64"
        },
        {
          "name": "message",
          "type": "string"
        },
        {
          "name": "notificationType",
          "type": {
            "defined": {
              "name": "notificationType"
            }
          }
        }
      ]
    },
    {
      "name": "transferAdmin",
      "docs": [
        "Transfer admin privileges to a new admin (current admin only)"
      ],
      "discriminator": [
        42,
        242,
        66,
        106,
        228,
        10,
        111,
        156
      ],
      "accounts": [
        {
          "name": "platformConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "treasury",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "platformConfig",
            "treasury"
          ]
        }
      ],
      "args": [
        {
          "name": "newAdmin",
          "type": "pubkey"
        }
      ]
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
      "name": "updatePlatformConfig",
      "docs": [
        "Update platform configuration (admin only)"
      ],
      "discriminator": [
        195,
        60,
        76,
        129,
        146,
        45,
        67,
        143
      ],
      "accounts": [
        {
          "name": "platformConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "platformConfig"
          ]
        }
      ],
      "args": [
        {
          "name": "newFeeBps",
          "type": "u16"
        }
      ]
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
    },
    {
      "name": "updateSmartWalletHeirAllocation",
      "docs": [
        "Update existing heir allocation (premium only)"
      ],
      "discriminator": [
        180,
        125,
        166,
        82,
        48,
        85,
        12,
        194
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
          "name": "userProfile",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
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
      "args": [
        {
          "name": "heirPubkey",
          "type": "pubkey"
        },
        {
          "name": "newAllocationPercentage",
          "type": "u8"
        }
      ]
    },
    {
      "name": "updateSmartWalletInactivityPeriod",
      "docs": [
        "Update Smart Wallet inactivity period (premium only)"
      ],
      "discriminator": [
        255,
        219,
        36,
        255,
        70,
        1,
        111,
        4
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
          "name": "userProfile",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
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
      "args": [
        {
          "name": "newInactivityPeriodSeconds",
          "type": "i64"
        }
      ]
    },
    {
      "name": "upgradeToPremium",
      "docs": [
        "Upgrade user to premium status"
      ],
      "discriminator": [
        6,
        48,
        79,
        125,
        248,
        142,
        53,
        115
      ],
      "accounts": [
        {
          "name": "userProfile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user",
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "withdrawFromSmartWallet",
      "docs": [
        "Withdraws SOL from Smart Wallet PDA to specified recipient"
      ],
      "discriminator": [
        100,
        23,
        79,
        146,
        142,
        1,
        141,
        49
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
          "name": "recipient",
          "writable": true
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
      "name": "withdrawTokensFromSmartWallet",
      "docs": [
        "Withdraws SPL tokens from Smart Wallet PDA to specified recipient"
      ],
      "discriminator": [
        53,
        198,
        10,
        23,
        235,
        61,
        97,
        42
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
          "name": "smartWalletTokenAccount",
          "writable": true
        },
        {
          "name": "recipientTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "recipient"
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
          "name": "recipient"
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
      "name": "withdrawTreasury",
      "docs": [
        "Withdraw fees from treasury (admin only)"
      ],
      "discriminator": [
        40,
        63,
        122,
        158,
        144,
        216,
        83,
        96
      ],
      "accounts": [
        {
          "name": "treasury",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "relations": [
            "treasury"
          ]
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
      "name": "notification",
      "discriminator": [
        68,
        105,
        46,
        119,
        132,
        75,
        193,
        214
      ]
    },
    {
      "name": "partnerConfig",
      "discriminator": [
        212,
        110,
        106,
        253,
        66,
        131,
        77,
        96
      ]
    },
    {
      "name": "platformConfig",
      "discriminator": [
        160,
        78,
        128,
        0,
        248,
        83,
        230,
        160
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
    },
    {
      "name": "treasury",
      "discriminator": [
        238,
        239,
        123,
        238,
        89,
        1,
        168,
        253
      ]
    },
    {
      "name": "userProfile",
      "discriminator": [
        32,
        37,
        119,
        205,
        179,
        180,
        13,
        194
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
    },
    {
      "code": 6012,
      "name": "feeTooHigh",
      "msg": "Platform fee is too high (max 2%)."
    },
    {
      "code": 6013,
      "name": "insufficientTreasuryBalance",
      "msg": "Insufficient treasury balance."
    },
    {
      "code": 6014,
      "name": "insufficientBalance",
      "msg": "Insufficient balance in Smart Wallet."
    },
    {
      "code": 6015,
      "name": "customInactivityNotAllowed",
      "msg": "Custom inactivity periods not allowed for free users."
    },
    {
      "code": 6016,
      "name": "notPlatformAdmin",
      "msg": "Not authorized as platform admin."
    },
    {
      "code": 6017,
      "name": "unauthorizedAdmin",
      "msg": "Unauthorized admin operation."
    },
    {
      "code": 6018,
      "name": "invalidFeeShare",
      "msg": "Invalid fee share percentage (max 50%)."
    },
    {
      "code": 6019,
      "name": "partnerNameTooLong",
      "msg": "Partner name too long (max 32 characters)."
    },
    {
      "code": 6020,
      "name": "messageTooLong",
      "msg": "Message too long (max 200 characters)."
    },
    {
      "code": 6021,
      "name": "tooManyTokens",
      "msg": "Too many tokens (max 20 per Smart Wallet)."
    },
    {
      "code": 6022,
      "name": "platformPaused",
      "msg": "Platform is currently paused."
    },
    {
      "code": 6023,
      "name": "pauseDurationExceeded",
      "msg": "Emergency pause duration exceeded."
    },
    {
      "code": 6024,
      "name": "premiumRequired",
      "msg": "Premium subscription required for this feature."
    },
    {
      "code": 6025,
      "name": "maxHeirsReached",
      "msg": "Maximum number of heirs reached."
    },
    {
      "code": 6026,
      "name": "heirAlreadyExists",
      "msg": "Heir already exists in the Smart Wallet."
    },
    {
      "code": 6027,
      "name": "heirNotFound",
      "msg": "Heir not found in the Smart Wallet."
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
      "name": "notification",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "notificationType",
            "type": {
              "defined": {
                "name": "notificationType"
              }
            }
          },
          {
            "name": "message",
            "type": "string"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "isRead",
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
      "name": "notificationPreferences",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "inactivityWarnings",
            "type": "bool"
          },
          {
            "name": "inheritanceUpdates",
            "type": "bool"
          },
          {
            "name": "feeNotifications",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "notificationType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "inheritanceTriggered"
          },
          {
            "name": "inactivityWarning"
          },
          {
            "name": "feeCollection"
          },
          {
            "name": "systemMaintenance"
          },
          {
            "name": "securityAlert"
          }
        ]
      }
    },
    {
      "name": "partnerConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "partnerAuthority",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "feeShareBps",
            "type": "u16"
          },
          {
            "name": "customBranding",
            "type": "bool"
          },
          {
            "name": "totalReferrals",
            "type": "u32"
          },
          {
            "name": "totalFeesEarned",
            "type": "u64"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "createdAt",
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
      "name": "platformConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "platformFeeBps",
            "type": "u16"
          },
          {
            "name": "treasury",
            "type": "pubkey"
          },
          {
            "name": "totalFeesCollected",
            "type": "u64"
          },
          {
            "name": "totalInheritancesExecuted",
            "type": "u64"
          },
          {
            "name": "isPaused",
            "type": "bool"
          },
          {
            "name": "pauseTimestamp",
            "type": "i64"
          },
          {
            "name": "totalUsers",
            "type": "u64"
          },
          {
            "name": "premiumUsers",
            "type": "u64"
          },
          {
            "name": "totalMultiTokenWallets",
            "type": "u64"
          },
          {
            "name": "totalInheritanceValue",
            "type": "u64"
          },
          {
            "name": "bump",
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
            "name": "tokenAllocations",
            "type": {
              "vec": {
                "defined": {
                  "name": "tokenAllocation"
                }
              }
            }
          },
          {
            "name": "notificationPreferences",
            "type": {
              "defined": {
                "name": "notificationPreferences"
              }
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "tokenAllocation",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tokenMint",
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
    },
    {
      "name": "treasury",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "totalBalance",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "userProfile",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "isPremium",
            "type": "bool"
          },
          {
            "name": "totalInheritancesCreated",
            "type": "u32"
          },
          {
            "name": "totalFeesPaid",
            "type": "u64"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "totalNotifications",
            "type": "u32"
          },
          {
            "name": "referralPartner",
            "type": {
              "option": "pubkey"
            }
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
