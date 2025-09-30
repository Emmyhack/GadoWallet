"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const anchor = require("@coral-xyz/anchor");
const anchor_1 = require("@coral-xyz/anchor");
const web3_js_1 = require("@solana/web3.js");
const smart_wallet_client_1 = require("./smart-wallet-client");
// Load the IDL
const gado_json_1 = require("./target/idl/gado.json");
async function demoFullSmartWallet() {
    console.log("🚀 Smart Wallet Full Functionality Demo...\n");
    // Configure the connection
    const connection = new web3_js_1.Connection((0, web3_js_1.clusterApiUrl)("devnet"), "confirmed");
    // Create wallets for testing
    const ownerWallet = new anchor_1.Wallet(web3_js_1.Keypair.generate());
    const recipientWallet = new anchor_1.Wallet(web3_js_1.Keypair.generate());
    console.log("💰 Setting up test wallets...");
    // Airdrop SOL to owner wallet
    try {
        const airdropTx = await connection.requestAirdrop(ownerWallet.publicKey, 2 * web3_js_1.LAMPORTS_PER_SOL);
        await connection.confirmTransaction(airdropTx);
        console.log(`✅ Airdropped 2 SOL to owner: ${ownerWallet.publicKey.toString()}`);
    }
    catch (error) {
        console.log("⚠️  Owner airdrop failed, continuing with existing balance");
    }
    const ownerBalance = await connection.getBalance(ownerWallet.publicKey);
    console.log(`📊 Owner balance: ${ownerBalance / web3_js_1.LAMPORTS_PER_SOL} SOL`);
    console.log(`📍 Recipient address: ${recipientWallet.publicKey.toString()}\n`);
    // Set up the provider and program
    const provider = new anchor_1.AnchorProvider(connection, ownerWallet, {
        commitment: "confirmed",
    });
    anchor.setProvider(provider);
    const programId = new anchor.web3.PublicKey("EciS2vNDTe5S6WnNWEBmdBmKjQL5bsXyfauYmxPFKQGu");
    const program = new anchor_1.Program(gado_json_1.default, provider);
    // Create Smart Wallet client
    const smartWalletClient = new smart_wallet_client_1.SmartWalletClient(program, connection);
    console.log("📋 Demo Configuration:");
    console.log(`Program ID: ${programId.toString()}`);
    console.log(`Owner: ${ownerWallet.publicKey.toString()}`);
    console.log(`Recipient: ${recipientWallet.publicKey.toString()}\n`);
    try {
        // Step 1: Create Smart Wallet with inheritance setup
        console.log("🏗️  Step 1: Creating Smart Wallet inheritance setup...");
        const owner = ownerWallet.payer;
        const heir1 = web3_js_1.Keypair.generate();
        const heir2 = web3_js_1.Keypair.generate();
        const heirs = [
            { heirPubkey: heir1.publicKey, allocationPercentage: 60 },
            { heirPubkey: heir2.publicKey, allocationPercentage: 40 },
        ];
        const createTx = await smartWalletClient.createSmartWalletInheritance(owner, heirs, 60 // 60 seconds for testing
        );
        console.log(`✅ Smart Wallet created: ${createTx}`);
        // Step 2: Get Smart Wallet address
        console.log("\n📍 Step 2: Getting Smart Wallet address...");
        const smartWalletAddress = smartWalletClient.getSmartWalletAddress(owner.publicKey);
        console.log(`🏠 Smart Wallet Address: ${smartWalletAddress.toString()}`);
        console.log(`💡 This is the address you can share to receive SOL and tokens!`);
        // Step 3: Deposit SOL to Smart Wallet
        console.log("\n💸 Step 3: Depositing SOL to Smart Wallet...");
        const depositTx = await smartWalletClient.depositToSmartWallet(owner, 1.0 // 1.0 SOL
        );
        console.log(`✅ Deposited 1.0 SOL: ${depositTx}`);
        // Check Smart Wallet balance
        const smartWalletBalance = await smartWalletClient.getSmartWalletBalance(owner.publicKey);
        console.log(`📊 Smart Wallet balance: ${smartWalletBalance} SOL`);
        // Step 4: Send SOL from Smart Wallet
        console.log("\n📤 Step 4: Sending SOL from Smart Wallet...");
        const sendAmount = 0.3;
        const sendTx = await smartWalletClient.sendSolFromSmartWallet(owner, recipientWallet.publicKey, sendAmount);
        console.log(`✅ Sent ${sendAmount} SOL to recipient: ${sendTx}`);
        // Check balances after send
        const updatedSmartWalletBalance = await smartWalletClient.getSmartWalletBalance(owner.publicKey);
        const recipientBalance = await connection.getBalance(recipientWallet.publicKey);
        console.log(`📊 Smart Wallet balance after send: ${updatedSmartWalletBalance} SOL`);
        console.log(`📊 Recipient balance: ${recipientBalance / web3_js_1.LAMPORTS_PER_SOL} SOL`);
        // Step 5: Get comprehensive Smart Wallet info
        console.log("\n📋 Step 5: Getting complete Smart Wallet information...");
        const walletInfo = await smartWalletClient.getSmartWalletInfo(owner.publicKey);
        if (walletInfo) {
            console.log("🏦 Smart Wallet Details:");
            console.log(`- Address: ${walletInfo.address.toString()}`);
            console.log(`- SOL Balance: ${walletInfo.solBalance} SOL`);
            console.log(`- Token Balances: ${walletInfo.tokenBalances.length} different tokens`);
            console.log(`- Is Active: ${walletInfo.isActive ? 'Yes' : 'No'}`);
            console.log(`- Heirs:`);
            walletInfo.heirs.forEach((heir, index) => {
                console.log(`  - Heir ${index + 1}: ${heir.address.toString()} (${heir.percentage}%)`);
            });
        }
        // Step 6: Get receive addresses
        console.log("\n📨 Step 6: Getting receive addresses...");
        const receiveInfo = await smartWalletClient.getSmartWalletReceiveAddress(owner.publicKey);
        console.log(`💰 SOL Receive Address: ${receiveInfo.solAddress.toString()}`);
        console.log(`🪙 Token Accounts: ${receiveInfo.tokenAccounts.size} configured`);
        // Step 7: Update activity
        console.log("\n🔄 Step 7: Updating Smart Wallet activity...");
        const activityTx = await smartWalletClient.updateSmartWalletActivity(owner);
        console.log(`✅ Activity updated: ${activityTx}`);
        // Step 8: Demonstrate external transfer to Smart Wallet
        console.log("\n📥 Step 8: Demonstrating external transfer to Smart Wallet...");
        console.log("💡 Anyone can send SOL directly to your Smart Wallet address:");
        console.log(`   solana transfer ${smartWalletAddress.toString()} 0.1`);
        console.log("💡 Or use any wallet app with this address as recipient");
        console.log("\n🎉 Smart Wallet Demo Completed Successfully!");
        console.log("\n📝 Summary of Smart Wallet Features:");
        console.log("✅ Has its own unique wallet address");
        console.log("✅ Can receive SOL and SPL tokens from anyone");
        console.log("✅ Owner can send SOL and tokens to others");
        console.log("✅ Inheritance distribution when owner inactive");
        console.log("✅ Activity tracking and management");
        console.log("✅ Multi-token support");
        console.log("✅ Comprehensive balance and info queries");
        console.log("\n🔗 Integration Options:");
        console.log("1. Share Smart Wallet address for receiving payments");
        console.log("2. Use as a savings account with inheritance");
        console.log("3. Multi-signature-like functionality with heirs");
        console.log("4. Business escrow with automatic distribution");
        console.log("5. Estate planning with automated execution");
    }
    catch (error) {
        console.error("❌ Demo failed:", error);
        if (error instanceof Error) {
            console.error("Error message:", error.message);
        }
        // Try to get more details if it's an Anchor error
        if (typeof error === 'object' && error !== null && 'logs' in error) {
            console.error("Program logs:", error.logs);
        }
    }
}
// Run the demo
demoFullSmartWallet().catch(console.error);
