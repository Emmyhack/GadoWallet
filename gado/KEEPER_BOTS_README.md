# 🤖 Gada Wallet Keeper Bot System

The Gada Wallet platform includes **two powerful keeper bot options** for automating inheritance processes. Choose the one that best fits your needs:

## 🎯 Bot Options

### 1. 🔔 **Notification Keeper Bot** (`inheritance-keeper-bot.ts`)
- **Purpose**: Monitors inheritances and **prepares transactions** for heirs to sign
- **Action**: Creates ready-to-sign transactions and sends detailed claiming instructions  
- **Heir Action**: Heirs receive prepared transactions and can claim with their own wallets
- **Security**: High - Heirs maintain full control of their private keys

### 2. ⚡ **Auto-Execution Keeper Bot** (`auto-execution-keeper.ts`)  
- **Purpose**: **AUTOMATICALLY TRANSFERS ASSETS** to heirs when conditions are met
- **Action**: Executes inheritance transfers immediately without heir intervention
- **Heir Action**: None required - assets appear directly in heir wallets
- **Security**: Medium - Uses temporary wallets and relay system for execution

---

## ⚡ **AUTOMATIC ASSET TRANSFER BOT** (Recommended)

**This bot automatically transfers SOL and tokens to heirs when inheritances become claimable.**

### 🚀 Quick Start - Auto Execution

```bash
cd gado/

# Install dependencies  
npm install

# Build the program
anchor build

# Start automatic execution bot
./run-auto-execution.sh

# Custom configurations
./run-auto-execution.sh devnet 3          # Check every 3 minutes  
./run-auto-execution.sh mainnet-beta 10   # Production with 10-minute intervals
```

### 🔥 What the Auto-Execution Bot Does

1. **🔍 Continuous Monitoring**: Scans blockchain for all SOL and Token inheritances
2. **⏰ Eligibility Detection**: Identifies when owners become inactive (based on inactivity periods)
3. **💰 Automatic Transfer**: **IMMEDIATELY TRANSFERS ASSETS** to heirs when conditions are met
4. **✅ Direct Delivery**: Assets appear directly in heir wallets - no manual action needed
5. **📊 Real-time Reporting**: Provides detailed logs of all automatic transfers

### 💡 Auto-Execution Method

The bot uses an innovative **temporary wallet relay system**:

```typescript
// 1. Creates temporary keypair for claiming
const tempKeypair = Keypair.generate();

// 2. Funds temporary wallet for transaction fees
await fundTemporaryWallet(tempKeypair);

// 3. Claims inheritance to temporary wallet
await claimToTemporary(tempKeypair, solHeir);

// 4. Forwards assets to real heir wallet  
await forwardToHeir(tempKeypair, realHeir, amount);
```

### 🎯 Example Auto-Execution Output

```
🚀 EXECUTING AUTOMATIC SOL TRANSFER
   Amount: 2.5000 SOL
   From: Program escrow account
   To: 8K2J9...heir_wallet_address

💰 Funded temporary wallet: 4F7N2...temp_wallet
✅ Claimed inheritance to temporary wallet: 5Bx8k...claim_tx
🎉 AUTOMATIC TRANSFER COMPLETED SUCCESSFULLY!
   Claim Transaction: 5Bx8k...claim_tx
   Transfer Transaction: 9M3P4...transfer_tx
   Amount: 2.5000 SOL
   Heir: 8K2J9...heir_wallet
   Status: Inheritance automatically transferred to heir
```

---

## 🔔 **NOTIFICATION & PREPARATION BOT** (Conservative Option)

**This bot prepares transactions for heirs and sends detailed claiming instructions.**

### 🚀 Quick Start - Notification Bot

```bash
cd gado/

# Start notification bot
./run-keeper.sh

# Custom configurations  
./run-keeper.sh devnet 5           # Check every 5 minutes
./run-keeper.sh mainnet-beta 15    # Production with 15-minute intervals
```

### 📋 What the Notification Bot Does

1. **🔍 Discovery**: Finds all inheritance accounts on the blockchain
2. **⏰ Monitoring**: Tracks inactivity periods and eligibility status
3. **🛠️ Preparation**: Creates ready-to-sign transactions for eligible inheritances  
4. **📬 Notification**: Sends detailed instructions to heirs with prepared transactions
5. **🔗 Multiple Options**: Provides heirs with various claiming methods

### 🎯 Example Notification Output

```
📋 INHERITANCE READY TO CLAIM - DETAILED INSTRUCTIONS:
   Heir: 8K2J9...heir_wallet_address
   Type: SOL inheritance
   Amount: 2.5000 SOL
   Status: Ready to claim immediately
   Transaction prepared: Yes
   
🔗 CLAIMING OPTIONS:
   1. Use Gada Wallet app (recommended)
   2. Submit prepared transaction: base64_encoded_tx...
   3. Manual claiming through program interface
```

---

## 📋 Prerequisites

Both bots require:

1. **Node.js & npm/yarn** installed
2. **Anchor Framework** set up  
3. **Program built** with `anchor build`
4. **Keeper wallet funded** with SOL for transaction fees
5. **Program deployed** to target network

## 💰 Keeper Wallet Setup

### Auto-Execution Bot Funding
```bash
# Needs more SOL for executing transfers (0.5+ SOL recommended)
solana airdrop 1 <AUTO_EXECUTION_KEEPER_ADDRESS> --url devnet

# For mainnet
solana transfer <AUTO_EXECUTION_KEEPER_ADDRESS> 0.5 --url mainnet-beta
```

### Notification Bot Funding
```bash
# Needs minimal SOL for RPC calls (0.1 SOL sufficient)
solana airdrop 0.2 <NOTIFICATION_KEEPER_ADDRESS> --url devnet
```

## 🔧 Configuration Options

### Auto-Execution Bot
```bash
# Basic usage
./run-auto-execution.sh

# Custom network and interval
./run-auto-execution.sh devnet 3     # Every 3 minutes on devnet
./run-auto-execution.sh mainnet-beta 10   # Every 10 minutes on mainnet

# Custom keeper wallet
./run-auto-execution.sh devnet 5 ./my-execution-wallet.json
```

### Notification Bot  
```bash
# Basic usage
./run-keeper.sh

# Custom configurations
./run-keeper.sh devnet 5     # Every 5 minutes on devnet  
./run-keeper.sh mainnet-beta 15   # Every 15 minutes on mainnet
```

## 📊 Monitoring Dashboard

### Auto-Execution Bot Status
```
📊 Automatic execution cycle complete:
   SOL inheritances monitored: 12
   Token inheritances monitored: 8
   SOL transfers executed: 5
   Token transfers executed: 2
   Total SOL value transferred: 12.7500 SOL
```

### Notification Bot Status
```
📊 Monitoring cycle complete:
   SOL heirs monitored: 12
   Token heirs monitored: 8
   SOL heirs eligible for transfer: 5
   Token heirs eligible for transfer: 2
   Total SOL value available: 12.7500 SOL
```

## 🚨 Security Considerations

### Auto-Execution Bot
- **✅ Secure**: Uses temporary wallets that are immediately discarded
- **✅ No Key Storage**: Never stores heir private keys
- **⚠️ Gas Costs**: Keeper pays for all transaction fees
- **⚠️ Network Dependency**: Relies on RPC availability for execution

### Notification Bot
- **✅ Maximum Security**: Heirs maintain full control of private keys
- **✅ No Execution Risk**: Only prepares transactions, doesn't execute
- **✅ Minimal Gas**: Low transaction fee requirements
- **⚠️ Manual Action**: Requires heir to take action to claim

## 🎯 Use Case Recommendations

### Use Auto-Execution Bot When:
- **Maximum Convenience**: Want completely hands-off inheritance execution
- **Tech-Savvy Users**: Comfortable with automated systems
- **Active Monitoring**: Can ensure keeper wallet stays funded
- **Immediate Transfer**: Want assets transferred as soon as conditions are met

### Use Notification Bot When:
- **Maximum Security**: Want heirs to have full control
- **Conservative Approach**: Prefer manual verification before transfers
- **Regulatory Compliance**: Need audit trails of heir actions
- **Lower Costs**: Want to minimize keeper operational costs

## 🛠️ Development & Customization

### Adding Notification Channels

Both bots support extensible notification systems:

```typescript
// Add custom notification methods
async notifyHeir(heirPublicKey: PublicKey, type: string, details: any) {
  // Email notifications
  await sendEmail(heirPublicKey, type, details);
  
  // SMS notifications  
  await sendSMS(heirPublicKey, type, details);
  
  // Push notifications
  await sendPushNotification(heirPublicKey, type, details);
  
  // Discord/Telegram bots
  await notifyDiscord(heirPublicKey, type, details);
  
  // Custom webhooks
  await webhookNotification(heirPublicKey, type, details);
}
```

### Custom Execution Logic

For the auto-execution bot, you can modify the execution strategy:

```typescript
// Custom execution methods
async executeInheritance(heir: HeirInfo) {
  // Method 1: Temporary wallet relay (current)
  await tempWalletRelay(heir);
  
  // Method 2: Direct program execution (if supported)
  await directProgramExecution(heir);
  
  // Method 3: Multi-signature approach
  await multiSigExecution(heir);
}
```

## 🔍 Troubleshooting

### Common Issues

#### Auto-Execution Bot Issues
```
❌ Keeper wallet balance too low
Solution: Fund keeper wallet with more SOL

❌ Temporary wallet creation failed
Solution: Check network connection and RPC limits

❌ Transfer execution failed  
Solution: Verify program permissions and account states
```

#### Notification Bot Issues
```
❌ Cannot prepare transactions
Solution: Check program IDL and account addresses

❌ Heir notification failed
Solution: Verify notification delivery systems are configured
```

### Debugging

Enable detailed logging:
```typescript
// Add verbose logging
console.log("🔍 Debugging Info:");
console.log("   Heir eligibility:", isEligible);
console.log("   Account states:", accountStates);  
console.log("   Transaction details:", txDetails);
```

## 🎯 Future Enhancements

### Planned Features

- **Smart Contract Integration**: Direct program-level automatic execution
- **Multi-Network Support**: Cross-chain inheritance monitoring
- **Advanced Notifications**: Email, SMS, push notification integrations
- **Web Dashboard**: Browser-based monitoring and control interface
- **Analytics & Reporting**: Historical data and transfer analytics
- **Governance Integration**: DAO-based keeper management

---

## 🚀 **Ready to Start?**

### For Automatic Asset Transfers:
```bash  
./run-auto-execution.sh
```

### For Notification & Manual Claiming:
```bash
./run-keeper.sh  
```

Both bots will handle the rest automatically! 🤖✨

**The auto-execution bot provides the true "smart wallet" experience you wanted - assets are automatically transferred to heirs when conditions are met, with no manual action required.**