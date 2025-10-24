# Gada Wallet Inheritance Keeper Bot

The Inheritance Keeper Bot is an automated monitoring system that watches for claimable inheritances on the Gada Wallet platform and notifies heirs when their inheritances become available.

## 🔧 How It Works

The keeper bot continuously monitors the blockchain for:

1. **SOL Inheritances** - Direct Solana (SOL) inheritances set up by users
2. **Token Inheritances** - SPL token inheritances for various tokens

When an owner becomes inactive (based on their configured inactivity period), the bot:
- ✅ Detects eligible inheritances automatically
- 📬 Sends notifications to heirs
- 📊 Provides monitoring statistics and status updates
- 🔄 Runs continuously with configurable check intervals

## 🚀 Features

### Automated Monitoring
- **Real-time Discovery**: Automatically finds all inheritance accounts on-chain
- **Eligibility Checking**: Verifies inactivity periods and claim status
- **Continuous Operation**: Runs 24/7 with configurable check intervals
- **Error Handling**: Robust error handling and recovery

### Notification System
- **Heir Notifications**: Alerts heirs when inheritances become claimable
- **Multiple Types**: Supports both SOL and Token inheritance notifications
- **Detailed Information**: Provides amount, type, and claim instructions
- **Extensible**: Ready for integration with email, SMS, push notifications

### Monitoring & Status
- **Real-time Status**: Live statistics on monitored inheritances
- **Activity Tracking**: Monitors active vs. inactive inheritances
- **Balance Tracking**: Keeps track of total value locked in inheritances
- **Periodic Reports**: Regular status updates during operation

## 📋 Prerequisites

Before running the keeper bot, ensure you have:

1. **Node.js & npm/yarn** installed
2. **Anchor Framework** set up and program built
3. **SOL for keeper wallet** (minimum 0.01 SOL for operations)
4. **Program deployed** to your target network (devnet/mainnet)

## ⚡ Quick Start

### 1. Navigate to the gado directory
```bash
cd gado/
```

### 2. Install dependencies (if not already done)
```bash
npm install
# or
yarn install
```

### 3. Build the Anchor program (if not already done)
```bash
anchor build
```

### 4. Run the keeper bot
```bash
# Basic usage (devnet, 5-minute intervals)
./run-keeper.sh

# Custom network and interval
./run-keeper.sh devnet 3  # Check every 3 minutes on devnet
./run-keeper.sh mainnet-beta 10  # Check every 10 minutes on mainnet

# With custom keeper wallet
./run-keeper.sh devnet 5 ./my-keeper-wallet.json
```

## 🔑 Keeper Wallet Setup

The bot requires a keeper wallet for blockchain operations:

### First Run (New Wallet)
```bash
./run-keeper.sh
# ✅ A new wallet will be generated automatically
# 🚨 Fund the displayed wallet address with SOL
```

### Using Existing Wallet
```bash
./run-keeper.sh devnet 5 ./existing-wallet.json
```

### Fund Your Keeper Wallet
```bash
# For devnet (get test SOL)
solana airdrop 1 <KEEPER_WALLET_ADDRESS> --url devnet

# For mainnet (transfer real SOL)
solana transfer <KEEPER_WALLET_ADDRESS> 0.1 --url mainnet-beta
```

## 🎛️ Configuration Options

### Command Line Arguments
```bash
./run-keeper.sh [NETWORK] [CHECK_INTERVAL] [WALLET_PATH]
```

- **NETWORK**: `devnet` (default), `testnet`, `mainnet-beta`
- **CHECK_INTERVAL**: Minutes between checks (default: 5)
- **WALLET_PATH**: Path to keeper wallet JSON (default: `./keeper-wallet.json`)

### Examples
```bash
# Development setup
./run-keeper.sh devnet 1 ./dev-keeper.json

# Production setup  
./run-keeper.sh mainnet-beta 15 ./prod-keeper.json

# Fast monitoring
./run-keeper.sh devnet 30  # Check every 30 seconds (testing only)
```

## 📊 Monitoring Dashboard

While the keeper bot runs, you'll see real-time information:

```
🚀 Starting Automated Inheritance Keeper Bot
⏱️ Check interval: 5 minutes
🔑 Keeper wallet: BMw78F5KqbkHsjAPAytbK8wgW8Q1wsnU7DN1NLbhn1PA
💼 Program ID: EciS2vNDTe5S6WnNWEBmdBmKjQL5bsXyfauYmxPFKQGu

📊 Monitoring cycle complete:
   SOL heirs monitored: 12
   Token heirs monitored: 8
   SOL heirs eligible: 3
   Token heirs eligible: 1
   Notifications sent: 4

📈 Keeper Status Update:
   SOL heirs eligible: 3
   Token heirs eligible: 1
   Total SOL value: 2.5000 SOL
```

## 🔄 Operation Flow

### Discovery Phase
1. **Scan Blockchain**: Find all SOL and Token heir accounts
2. **Filter Active**: Exclude already claimed inheritances
3. **Load Details**: Extract owner, heir, amounts, and timing info

### Monitoring Phase
1. **Check Eligibility**: Calculate inactivity periods
2. **Identify Claimable**: Find inheritances ready for claiming
3. **Send Notifications**: Alert heirs about claimable inheritances

### Notification Details
```
📬 NOTIFICATION SENT:
   To: <HEIR_WALLET_ADDRESS>
   Type: SOL inheritance is now claimable
   Amount: 1.5000 SOL
   Action: Use the Gada Wallet app to claim your inheritance
```

## 🛠️ Development & Customization

### Adding Custom Notification Methods

The keeper bot is designed to be extensible. You can add custom notification methods:

```typescript
// Example: Add email notifications
async notifyHeir(heirPublicKey: PublicKey, type: 'SOL' | 'Token', amount: number) {
  // Console notification (current)
  console.log(`📬 NOTIFICATION SENT TO: ${heirPublicKey.toString()}`);
  
  // Add your custom notifications:
  await sendEmail(heirPublicKey, type, amount);
  await sendSMS(heirPublicKey, type, amount);  
  await sendPushNotification(heirPublicKey, type, amount);
  await postToDiscord(heirPublicKey, type, amount);
}
```

### Custom Check Intervals

For different use cases:

```bash
# High-frequency monitoring (testing)
./run-keeper.sh devnet 1   # Every minute

# Normal monitoring (production)  
./run-keeper.sh mainnet-beta 10  # Every 10 minutes

# Low-frequency monitoring (resource saving)
./run-keeper.sh mainnet-beta 60  # Every hour
```

## 🚨 Important Notes

### Security
- **Keeper Wallet**: Only needs minimal SOL for transaction fees
- **No Asset Access**: Keeper cannot claim or move inheritance funds
- **Read-Only Monitoring**: Only monitors and notifies, doesn't modify inheritances

### Network Considerations
- **RPC Limits**: Be mindful of RPC rate limits with very frequent checks
- **Cost**: Each check cycle makes multiple RPC calls
- **Reliability**: Use reliable RPC providers for production

### Heir Responsibility
- **Manual Claiming**: Heirs must still claim inheritances manually using their wallets
- **Wallet Security**: Heirs need secure access to their wallet to claim
- **Notification Channels**: Set up proper notification systems for heirs

## 🔍 Troubleshooting

### Common Issues

#### Keeper Wallet Balance
```
❌ Keeper wallet balance too low: 0.0000 SOL
```
**Solution**: Fund your keeper wallet with at least 0.01 SOL

#### Missing IDL
```  
❌ IDL file not found at target/idl/gado.json
```
**Solution**: Build the Anchor program first: `anchor build`

#### Network Connection
```
❌ Error discovering SOL heirs: Connection failed
```
**Solution**: Check network connectivity and RPC endpoint

#### No Inheritances Found
```
📭 No active inheritances found to monitor
```
**Normal**: This means no inheritances are set up yet, or all are claimed

### Logs and Debugging

Enable verbose logging by modifying the keeper bot:
```typescript
// Add more detailed logging
console.log("🔍 Checking heir:", solHeir.heir.toString());
console.log("⏰ Last activity:", new Date(solHeir.lastActivity * 1000));
```

## 📞 Support

For issues with the Inheritance Keeper Bot:

1. **Check Prerequisites**: Ensure all requirements are met
2. **Review Logs**: Look for error messages in the console output  
3. **Verify Setup**: Confirm program is deployed and wallet is funded
4. **Test Network**: Try running on devnet first before mainnet

## 🎯 Future Enhancements

Planned improvements for the keeper bot:

- **Email Integration**: Automatic email notifications to heirs
- **SMS Notifications**: Text message alerts for inheritance claims
- **Web Dashboard**: Browser-based monitoring interface
- **Mobile Notifications**: Push notifications through mobile apps
- **Multi-Network**: Support for multiple Solana networks simultaneously
- **Analytics**: Historical data and trends on inheritance activity

---

**Ready to start monitoring inheritances automatically?** 

```bash
./run-keeper.sh
```

The bot will handle the rest! 🤖✨