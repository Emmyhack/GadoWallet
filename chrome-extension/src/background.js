// gado Wallet Chrome Extension - Background Service Worker
// Handles Web3 connections, wallet operations, and keeper bot integration

import { Connection, PublicKey, Keypair, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';

class gadoWalletBackground {
    constructor() {
        this.connection = null;
        this.wallet = null;
        this.network = 'devnet';
        this.program = null;
        this.isConnected = false;
        this.keeperBot = null;
        
        this.init();
    }

    async init() {
        console.log('gado Wallet Background Service Worker starting...');
        
        // Load saved settings
        await this.loadSettings();
        
        // Setup connection
        await this.setupConnection();
        
        // Setup message listeners
        this.setupMessageListeners();
        
        // Setup periodic tasks
        this.setupPeriodicTasks();
        
        console.log('✅ Background service worker initialized');
    }

    async loadSettings() {
        const result = await chrome.storage.local.get([
            'wallet', 'network', 'privateKey', 'isConnected'
        ]);
        
        this.network = result.network || 'devnet';
        this.isConnected = result.isConnected || false;
        
        if (result.privateKey && result.wallet) {
            try {
                const secretKey = new Uint8Array(JSON.parse(result.privateKey));
                this.wallet = {
                    keypair: Keypair.fromSecretKey(secretKey),
                    publicKey: result.wallet.publicKey
                };
                this.isConnected = true;
                console.log('🔑 Wallet restored from storage');
            } catch (error) {
                console.error('Failed to restore wallet:', error);
                await this.clearWallet();
            }
        }
    }

    async setupConnection() {
        const rpcUrl = this.getRpcUrl(this.network);
        this.connection = new Connection(rpcUrl, 'confirmed');
        
        // Setup Anchor program
        if (this.isConnected && this.wallet) {
            await this.setupProgram();
        }
        
        console.log(`🌐 Connected to ${this.network}: ${rpcUrl}`);
    }

    async setupProgram() {
        try {
            // Load IDL from the main project
            const response = await fetch(chrome.runtime.getURL('idl/gado.json'));
            const idl = await response.json();
            
            const provider = new anchor.AnchorProvider(
                this.connection,
                {
                    publicKey: this.wallet.keypair.publicKey,
                    signTransaction: async (tx) => {
                        tx.partialSign(this.wallet.keypair);
                        return tx;
                    },
                    signAllTransactions: async (txs) => {
                        txs.forEach(tx => tx.partialSign(this.wallet.keypair));
                        return txs;
                    }
                },
                { commitment: 'confirmed' }
            );

            this.program = new Program(idl, provider);
            console.log('📋 Anchor program setup complete');
        } catch (error) {
            console.error('Failed to setup program:', error);
        }
    }

    setupMessageListeners() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
            return true; // Keep message channel open for async responses
        });
    }

    async handleMessage(request, sender, sendResponse) {
        try {
            switch (request.type) {
                case 'CONNECT_WALLET':
                    await this.connectWallet(request.network, sendResponse);
                    break;
                
                case 'GET_WALLET_STATUS':
                    await this.getWalletStatus(sendResponse);
                    break;
                
                case 'SWITCH_NETWORK':
                    await this.switchNetwork(request.network, sendResponse);
                    break;
                
                case 'GET_BALANCE':
                    await this.getBalance(sendResponse);
                    break;
                
                case 'SEND_TRANSACTION':
                    await this.sendTransaction(request, sendResponse);
                    break;
                
                case 'GET_INHERITANCE_STATS':
                    await this.getInheritanceStats(sendResponse);
                    break;
                
                case 'GET_INHERITANCES':
                    await this.getInheritances(sendResponse);
                    break;
                
                case 'GET_TRANSACTIONS':
                    await this.getTransactions(request.limit, sendResponse);
                    break;
                
                case 'GET_RECENT_ACTIVITY':
                    await this.getRecentActivity(request.limit, sendResponse);
                    break;
                
                case 'GET_KEEPER_STATUS':
                    await this.getKeeperStatus(sendResponse);
                    break;
                
                case 'UPDATE_ACTIVITY':
                    await this.updateActivity(request.inheritanceAddress, sendResponse);
                    break;
                
                case 'CANCEL_INHERITANCE':
                    await this.cancelInheritance(request.inheritanceAddress, sendResponse);
                    break;
                
                case 'EXPORT_WALLET':
                    await this.exportWallet(sendResponse);
                    break;
                
                case 'RESET_WALLET':
                    await this.resetWallet(sendResponse);
                    break;
                
                case 'CREATE_INHERITANCE':
                    await this.createInheritance(request, sendResponse);
                    break;
                
                default:
                    sendResponse({ success: false, error: 'Unknown message type' });
            }
        } catch (error) {
            console.error('Message handling error:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    async connectWallet(network, sendResponse) {
        try {
            // Generate new wallet or restore existing
            let keypair;
            const stored = await chrome.storage.local.get(['privateKey']);
            
            if (stored.privateKey) {
                const secretKey = new Uint8Array(JSON.parse(stored.privateKey));
                keypair = Keypair.fromSecretKey(secretKey);
            } else {
                keypair = Keypair.generate();
                
                // Save to storage
                await chrome.storage.local.set({
                    privateKey: JSON.stringify(Array.from(keypair.secretKey))
                });
            }
            
            this.wallet = {
                keypair: keypair,
                publicKey: keypair.publicKey.toString()
            };
            
            this.network = network;
            this.isConnected = true;
            
            // Update connection and program
            await this.setupConnection();
            
            // Save to storage
            await chrome.storage.local.set({
                wallet: { publicKey: this.wallet.publicKey },
                network: this.network,
                isConnected: true
            });
            
            sendResponse({
                success: true,
                wallet: { publicKey: this.wallet.publicKey },
                network: this.network
            });
            
            console.log('✅ Wallet connected:', this.wallet.publicKey);
            
        } catch (error) {
            console.error('Wallet connection error:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    async getWalletStatus(sendResponse) {
        sendResponse({
            success: true,
            isConnected: this.isConnected,
            wallet: this.wallet ? { publicKey: this.wallet.publicKey } : null,
            network: this.network
        });
    }

    async switchNetwork(network, sendResponse) {
        try {
            this.network = network;
            await this.setupConnection();
            
            await chrome.storage.local.set({ network: this.network });
            
            sendResponse({
                success: true,
                network: this.network
            });
            
            console.log(`🌐 Switched to network: ${network}`);
            
        } catch (error) {
            console.error('Network switch error:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    async getBalance(sendResponse) {
        try {
            if (!this.isConnected || !this.wallet) {
                throw new Error('Wallet not connected');
            }
            
            const balance = await this.connection.getBalance(this.wallet.keypair.publicKey);
            const balanceSOL = balance / LAMPORTS_PER_SOL;
            
            sendResponse({
                success: true,
                balance: balanceSOL,
                lamports: balance
            });
            
        } catch (error) {
            console.error('Balance fetch error:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    async sendTransaction(request, sendResponse) {
        try {
            if (!this.isConnected || !this.wallet) {
                throw new Error('Wallet not connected');
            }
            
            const { to, amount, memo } = request;
            const toPublicKey = new PublicKey(to);
            const lamports = Math.floor(amount * LAMPORTS_PER_SOL);
            
            // Create transaction
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: this.wallet.keypair.publicKey,
                    toPubkey: toPublicKey,
                    lamports: lamports
                })
            );
            
            // Add memo if provided
            if (memo) {
                const memoInstruction = new anchor.web3.TransactionInstruction({
                    keys: [],
                    programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
                    data: Buffer.from(memo, 'utf8')
                });
                transaction.add(memoInstruction);
            }
            
            // Get recent blockhash and sign
            const { blockhash } = await this.connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = this.wallet.keypair.publicKey;
            
            // Sign and send
            const signature = await this.connection.sendTransaction(transaction, [this.wallet.keypair]);
            
            // Confirm transaction
            await this.connection.confirmTransaction(signature, 'confirmed');
            
            // Store transaction record
            await this.storeTransaction({
                signature,
                type: 'send',
                amount: -lamports,
                to: to,
                memo: memo,
                timestamp: Math.floor(Date.now() / 1000),
                status: 'confirmed'
            });
            
            sendResponse({
                success: true,
                signature: signature
            });
            
            console.log('✅ Transaction sent:', signature);
            
        } catch (error) {
            console.error('Send transaction error:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    async getInheritanceStats(sendResponse) {
        try {
            if (!this.program) {
                sendResponse({
                    success: true,
                    stats: {
                        totalHeirs: 0,
                        protectedSOL: 0,
                        solInheritances: 0,
                        tokenInheritances: 0
                    }
                });
                return;
            }
            
            // Get SOL heirs
            const solHeirs = await this.program.account.solHeir.all([
                {
                    memcmp: {
                        offset: 8, // After discriminator
                        bytes: this.wallet.keypair.publicKey.toBase58()
                    }
                }
            ]);
            
            // Get Token heirs
            const tokenHeirs = await this.program.account.tokenHeir.all([
                {
                    memcmp: {
                        offset: 8, // After discriminator
                        bytes: this.wallet.keypair.publicKey.toBase58()
                    }
                }
            ]);
            
            // Calculate protected SOL amount
            let protectedSOL = 0;
            for (const heir of solHeirs) {
                if (!heir.account.isClaimed) {
                    protectedSOL += heir.account.amount.toNumber() / LAMPORTS_PER_SOL;
                }
            }
            
            sendResponse({
                success: true,
                stats: {
                    totalHeirs: solHeirs.length + tokenHeirs.length,
                    protectedSOL: protectedSOL,
                    solInheritances: solHeirs.length,
                    tokenInheritances: tokenHeirs.length
                }
            });
            
        } catch (error) {
            console.error('Inheritance stats error:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    async getInheritances(sendResponse) {
        try {
            if (!this.program) {
                sendResponse({
                    success: true,
                    inheritances: { sol: [], tokens: [] }
                });
                return;
            }
            
            // Get SOL inheritances
            const solHeirs = await this.program.account.solHeir.all([
                {
                    memcmp: {
                        offset: 8,
                        bytes: this.wallet.keypair.publicKey.toBase58()
                    }
                }
            ]);
            
            // Get Token inheritances
            const tokenHeirs = await this.program.account.tokenHeir.all([
                {
                    memcmp: {
                        offset: 8,
                        bytes: this.wallet.keypair.publicKey.toBase58()
                    }
                }
            ]);
            
            const formatSolHeir = (heirAccount) => ({
                address: heirAccount.publicKey.toString(),
                owner: heirAccount.account.owner.toString(),
                heir: heirAccount.account.heir.toString(),
                amount: heirAccount.account.amount.toNumber(),
                inactivityPeriodSeconds: heirAccount.account.inactivityPeriodSeconds.toNumber(),
                lastActivity: heirAccount.account.lastActivity.toNumber(),
                isClaimed: heirAccount.account.isClaimed
            });
            
            const formatTokenHeir = (heirAccount) => ({
                address: heirAccount.publicKey.toString(),
                owner: heirAccount.account.owner.toString(),
                heir: heirAccount.account.heir.toString(),
                tokenMint: heirAccount.account.tokenMint.toString(),
                amount: heirAccount.account.amount.toNumber(),
                inactivityPeriodSeconds: heirAccount.account.inactivityPeriodSeconds.toNumber(),
                lastActivity: heirAccount.account.lastActivity.toNumber(),
                isClaimed: heirAccount.account.isClaimed
            });
            
            sendResponse({
                success: true,
                inheritances: {
                    sol: solHeirs.map(formatSolHeir),
                    tokens: tokenHeirs.map(formatTokenHeir)
                }
            });
            
        } catch (error) {
            console.error('Get inheritances error:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    async getTransactions(limit, sendResponse) {
        try {
            const stored = await chrome.storage.local.get(['transactions']);
            const transactions = stored.transactions || [];
            
            // Sort by timestamp and limit
            const sortedTxs = transactions
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, limit || 20);
            
            sendResponse({
                success: true,
                transactions: sortedTxs
            });
            
        } catch (error) {
            console.error('Get transactions error:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    async getRecentActivity(limit, sendResponse) {
        try {
            const stored = await chrome.storage.local.get(['activities']);
            const activities = stored.activities || [];
            
            // Sort and limit
            const recentActivities = activities
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, limit || 5);
            
            sendResponse({
                success: true,
                activities: recentActivities
            });
            
        } catch (error) {
            console.error('Get recent activity error:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    async getKeeperStatus(sendResponse) {
        try {
            // Mock keeper status - integrate with actual keeper bot
            const status = {
                isRunning: true,
                totalSolHeirs: 0,
                totalTokenHeirs: 0,
                eligibleSolHeirs: 0,
                eligibleTokenHeirs: 0,
                totalSolValue: 0,
                checkInterval: 5
            };
            
            if (this.program) {
                // Get actual stats from blockchain
                const solHeirs = await this.program.account.solHeir.all();
                const tokenHeirs = await this.program.account.tokenHeir.all();
                
                status.totalSolHeirs = solHeirs.length;
                status.totalTokenHeirs = tokenHeirs.length;
                
                // Calculate eligible heirs
                const currentTime = Math.floor(Date.now() / 1000);
                status.eligibleSolHeirs = solHeirs.filter(heir => {
                    const timeSinceActive = currentTime - heir.account.lastActivity.toNumber();
                    return timeSinceActive > heir.account.inactivityPeriodSeconds.toNumber() && !heir.account.isClaimed;
                }).length;
                
                status.eligibleTokenHeirs = tokenHeirs.filter(heir => {
                    const timeSinceActive = currentTime - heir.account.lastActivity.toNumber();
                    return timeSinceActive > heir.account.inactivityPeriodSeconds.toNumber() && !heir.account.isClaimed;
                }).length;
                
                status.totalSolValue = solHeirs.reduce((sum, heir) => {
                    return sum + (heir.account.amount.toNumber() / LAMPORTS_PER_SOL);
                }, 0);
            }
            
            sendResponse({
                success: true,
                status: status
            });
            
        } catch (error) {
            console.error('Keeper status error:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    async updateActivity(inheritanceAddress, sendResponse) {
        try {
            if (!this.program) {
                throw new Error('Program not initialized');
            }
            
            const inheritancePubkey = new PublicKey(inheritanceAddress);
            
            // Try SOL heir first
            try {
                const solHeirAccount = await this.program.account.solHeir.fetch(inheritancePubkey);
                
                const tx = await this.program.methods
                    .updateActivity()
                    .accounts({
                        solHeir: inheritancePubkey,
                        owner: this.wallet.keypair.publicKey
                    })
                    .rpc();
                
                await this.storeActivity({
                    type: 'activity_update',
                    title: 'Activity Updated',
                    subtitle: 'SOL inheritance activity updated',
                    timestamp: Math.floor(Date.now() / 1000)
                });
                
                sendResponse({
                    success: true,
                    signature: tx
                });
                return;
                
            } catch (solError) {
                // Try token heir
                try {
                    const tokenHeirAccount = await this.program.account.tokenHeir.fetch(inheritancePubkey);
                    
                    const tx = await this.program.methods
                        .updateTokenActivity()
                        .accounts({
                            tokenHeir: inheritancePubkey,
                            owner: this.wallet.keypair.publicKey
                        })
                        .rpc();
                    
                    await this.storeActivity({
                        type: 'activity_update',
                        title: 'Activity Updated',
                        subtitle: 'Token inheritance activity updated',
                        timestamp: Math.floor(Date.now() / 1000)
                    });
                    
                    sendResponse({
                        success: true,
                        signature: tx
                    });
                    return;
                    
                } catch (tokenError) {
                    throw new Error('Inheritance not found');
                }
            }
            
        } catch (error) {
            console.error('Update activity error:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    async cancelInheritance(inheritanceAddress, sendResponse) {
        try {
            if (!this.program) {
                throw new Error('Program not initialized');
            }
            
            const inheritancePubkey = new PublicKey(inheritanceAddress);
            
            // Try SOL heir first
            try {
                const solHeirAccount = await this.program.account.solHeir.fetch(inheritancePubkey);
                
                const tx = await this.program.methods
                    .cancelSolInheritance()
                    .accounts({
                        solHeir: inheritancePubkey,
                        owner: this.wallet.keypair.publicKey,
                        systemProgram: SystemProgram.programId
                    })
                    .rpc();
                
                await this.storeActivity({
                    type: 'inheritance_cancel',
                    title: 'Inheritance Cancelled',
                    subtitle: 'SOL inheritance cancelled and funds returned',
                    timestamp: Math.floor(Date.now() / 1000)
                });
                
                sendResponse({
                    success: true,
                    signature: tx
                });
                return;
                
            } catch (solError) {
                // Try token heir
                try {
                    const tokenHeirAccount = await this.program.account.tokenHeir.fetch(inheritancePubkey);
                    
                    // Get token accounts
                    const [escrowTokenAccount] = PublicKey.findProgramAddressSync(
                        [
                            inheritancePubkey.toBuffer(),
                            new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA").toBuffer(),
                            tokenHeirAccount.tokenMint.toBuffer()
                        ],
                        new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")
                    );
                    
                    const [ownerTokenAccount] = PublicKey.findProgramAddressSync(
                        [
                            this.wallet.keypair.publicKey.toBuffer(),
                            new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA").toBuffer(),
                            tokenHeirAccount.tokenMint.toBuffer()
                        ],
                        new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")
                    );
                    
                    const tx = await this.program.methods
                        .cancelTokenInheritance()
                        .accounts({
                            tokenHeir: inheritancePubkey,
                            escrowTokenAccount: escrowTokenAccount,
                            ownerTokenAccount: ownerTokenAccount,
                            tokenMint: tokenHeirAccount.tokenMint,
                            owner: this.wallet.keypair.publicKey,
                            tokenProgram: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
                            associatedTokenProgram: new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"),
                            systemProgram: SystemProgram.programId
                        })
                        .rpc();
                    
                    await this.storeActivity({
                        type: 'inheritance_cancel',
                        title: 'Inheritance Cancelled',
                        subtitle: 'Token inheritance cancelled and tokens returned',
                        timestamp: Math.floor(Date.now() / 1000)
                    });
                    
                    sendResponse({
                        success: true,
                        signature: tx
                    });
                    return;
                    
                } catch (tokenError) {
                    throw new Error('Inheritance not found');
                }
            }
            
        } catch (error) {
            console.error('Cancel inheritance error:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    async exportWallet(sendResponse) {
        try {
            if (!this.wallet) {
                throw new Error('No wallet to export');
            }
            
            const privateKeyArray = Array.from(this.wallet.keypair.secretKey);
            const privateKeyString = JSON.stringify(privateKeyArray);
            
            sendResponse({
                success: true,
                privateKey: privateKeyString
            });
            
        } catch (error) {
            console.error('Export wallet error:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    async resetWallet(sendResponse) {
        try {
            await this.clearWallet();
            
            sendResponse({
                success: true
            });
            
        } catch (error) {
            console.error('Reset wallet error:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    async createInheritance(request, sendResponse) {
        try {
            if (!this.program) {
                throw new Error('Program not initialized');
            }
            
            const { type, heirAddress, amount, inactivityDays, tokenMint } = request;
            const heirPubkey = new PublicKey(heirAddress);
            const inactivitySeconds = inactivityDays * 24 * 60 * 60;
            
            if (type === 'SOL') {
                const lamports = Math.floor(amount * LAMPORTS_PER_SOL);
                
                const [solHeirPDA] = PublicKey.findProgramAddressSync(
                    [
                        Buffer.from("sol_heir"),
                        this.wallet.keypair.publicKey.toBuffer(),
                        heirPubkey.toBuffer()
                    ],
                    this.program.programId
                );
                
                const tx = await this.program.methods
                    .createSolHeir(
                        heirPubkey,
                        new anchor.BN(lamports),
                        new anchor.BN(inactivitySeconds)
                    )
                    .accounts({
                        solHeir: solHeirPDA,
                        owner: this.wallet.keypair.publicKey,
                        systemProgram: SystemProgram.programId
                    })
                    .rpc();
                
                await this.storeActivity({
                    type: 'heir_setup',
                    title: 'SOL Inheritance Created',
                    subtitle: `${amount} SOL inheritance set up for ${heirAddress.slice(0, 8)}...`,
                    timestamp: Math.floor(Date.now() / 1000)
                });
                
                sendResponse({
                    success: true,
                    signature: tx,
                    heirAddress: solHeirPDA.toString()
                });
                
            } else if (type === 'TOKEN') {
                const tokenMintPubkey = new PublicKey(tokenMint);
                
                const [tokenHeirPDA] = PublicKey.findProgramAddressSync(
                    [
                        Buffer.from("token_heir"),
                        this.wallet.keypair.publicKey.toBuffer(),
                        heirPubkey.toBuffer(),
                        tokenMintPubkey.toBuffer()
                    ],
                    this.program.programId
                );
                
                // Get token accounts
                const [ownerTokenAccount] = PublicKey.findProgramAddressSync(
                    [
                        this.wallet.keypair.publicKey.toBuffer(),
                        new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA").toBuffer(),
                        tokenMintPubkey.toBuffer()
                    ],
                    new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")
                );
                
                const [escrowTokenAccount] = PublicKey.findProgramAddressSync(
                    [
                        tokenHeirPDA.toBuffer(),
                        new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA").toBuffer(),
                        tokenMintPubkey.toBuffer()
                    ],
                    new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")
                );
                
                const tx = await this.program.methods
                    .createTokenHeir(
                        heirPubkey,
                        new anchor.BN(amount),
                        new anchor.BN(inactivitySeconds)
                    )
                    .accounts({
                        tokenHeir: tokenHeirPDA,
                        ownerTokenAccount: ownerTokenAccount,
                        escrowTokenAccount: escrowTokenAccount,
                        tokenMint: tokenMintPubkey,
                        owner: this.wallet.keypair.publicKey,
                        tokenProgram: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
                        associatedTokenProgram: new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"),
                        systemProgram: SystemProgram.programId
                    })
                    .rpc();
                
                await this.storeActivity({
                    type: 'heir_setup',
                    title: 'Token Inheritance Created',
                    subtitle: `${amount} tokens inheritance set up for ${heirAddress.slice(0, 8)}...`,
                    timestamp: Math.floor(Date.now() / 1000)
                });
                
                sendResponse({
                    success: true,
                    signature: tx,
                    heirAddress: tokenHeirPDA.toString()
                });
            }
            
        } catch (error) {
            console.error('Create inheritance error:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    // Utility Methods
    getRpcUrl(network) {
        switch (network) {
            case 'mainnet-beta':
                return 'https://api.mainnet-beta.solana.com';
            case 'testnet':
                return 'https://api.testnet.solana.com';
            case 'devnet':
            default:
                return 'https://api.devnet.solana.com';
        }
    }

    async storeTransaction(transaction) {
        const stored = await chrome.storage.local.get(['transactions']);
        const transactions = stored.transactions || [];
        
        transactions.unshift(transaction);
        
        // Keep only last 100 transactions
        if (transactions.length > 100) {
            transactions.splice(100);
        }
        
        await chrome.storage.local.set({ transactions });
    }

    async storeActivity(activity) {
        const stored = await chrome.storage.local.get(['activities']);
        const activities = stored.activities || [];
        
        activities.unshift(activity);
        
        // Keep only last 50 activities
        if (activities.length > 50) {
            activities.splice(50);
        }
        
        await chrome.storage.local.set({ activities });
    }

    async clearWallet() {
        this.wallet = null;
        this.isConnected = false;
        this.program = null;
        
        await chrome.storage.local.clear();
        
        console.log('🧹 Wallet cleared');
    }

    setupPeriodicTasks() {
        // Create alarm for periodic balance updates
        chrome.alarms.create('updateBalance', { periodInMinutes: 5 });
        
        // Create alarm for keeper bot checks
        chrome.alarms.create('keeperCheck', { periodInMinutes: 1 });
        
        // Listen for alarms
        chrome.alarms.onAlarm.addListener((alarm) => {
            if (alarm.name === 'updateBalance' && this.isConnected) {
                this.updateBalance();
            } else if (alarm.name === 'keeperCheck' && this.isConnected) {
                this.checkKeeperBot();
            }
        });
    }

    async updateBalance() {
        if (!this.isConnected || !this.wallet) return;
        
        try {
            const balance = await this.connection.getBalance(this.wallet.keypair.publicKey);
            
            // Store balance update activity if significant change
            const stored = await chrome.storage.local.get(['lastBalance']);
            const lastBalance = stored.lastBalance || 0;
            
            if (Math.abs(balance - lastBalance) > 0.001 * LAMPORTS_PER_SOL) {
                await this.storeActivity({
                    type: 'balance_update',
                    title: 'Balance Updated',
                    subtitle: `New balance: ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL`,
                    timestamp: Math.floor(Date.now() / 1000)
                });
                
                await chrome.storage.local.set({ lastBalance: balance });
            }
            
        } catch (error) {
            console.error('Balance update error:', error);
        }
    }

    async checkKeeperBot() {
        // Integration point for keeper bot monitoring
        // This would connect to the actual keeper bot system
        console.log('🤖 Keeper bot check (placeholder)');
    }
}

// Initialize the background service worker
const gadoWalletBackgroundInstance = new gadoWalletBackground();