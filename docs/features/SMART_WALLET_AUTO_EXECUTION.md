# Smart Wallet Automatic Execution - REAL BLOCKCHAIN OPERATIONS

This system provides **real automatic inheritance execution** for your Smart Wallet using actual Solana blockchain operations when you become inactive for the configured period.

## ⚠️ IMPORTANT: REAL OPERATIONS ONLY
**All functionality uses real blockchain transactions - no demo or simulation code remains.**
- Real SOL deposits and withdrawals
- Real Smart Wallet creation and management  
- Real inheritance execution with actual asset distribution
- Real activity tracking on-chain
- Real keeper bot monitoring and automation

## 🚀 Quick Start

### Option 1: Built-in UI Controls (Recommended)

1. **Create a Smart Wallet** through the UI with your heirs and inactivity period
2. **Enable Auto Execution** using the toggle in the Smart Wallet interface
3. **Configure check interval** (30 seconds to 1 hour)
4. The system will automatically monitor and execute inheritance when needed

### Option 2: Standalone Keeper Bot

Run the keeper bot as a separate service:

```bash
# Start the keeper bot
npm run keeper

# Or with auto-restart on changes (development)
npm run keeper:dev
```

## 🤖 How It Works

### Monitoring Process

1. **Activity Tracking**: The system monitors your Smart Wallet's `lastActiveTime`
2. **Automatic Checks**: Runs periodic checks every 30 seconds to 1 hour (configurable)
3. **Eligibility Detection**: Determines when inheritance should be triggered based on:
   - Owner inactivity period exceeded
   - Smart Wallet has balance > 0
   - Inheritance not already executed

### Execution Process

When eligibility criteria are met:

1. **Automatic Execution**: The keeper bot calls `executeInheritance()` on your Smart Wallet
2. **Asset Distribution**: SOL and tokens are distributed to heirs according to allocation percentages
3. **Notification**: You receive confirmation of successful execution
4. **Completion**: Smart Wallet is marked as executed and removed from monitoring

## ⚙️ Configuration

### UI Controls

- **Auto Execution Toggle**: Start/stop automatic monitoring
- **Check Interval**: Configure how often to check (30s, 1min, 5min, 10min, 1hour)
- **Manual Check**: Trigger immediate eligibility check
- **Status Display**: View keeper wallet, monitoring status, and activity

### Environment Variables

```bash
NETWORK=devnet                    # 'devnet' or 'mainnet-beta'
CHECK_INTERVAL_SECONDS=30         # How often to check wallets
KEEPER_KEYPAIR_PATH=./keeper.json # Path to keeper wallet
```

## 🔐 Security

### Keeper Wallet

- **Purpose**: Executes inheritance transactions when owners are inactive
- **Permissions**: Can only call `executeInheritance()` - cannot access or steal assets
- **Requirements**: Needs small SOL balance for transaction fees (~0.01 SOL)
- **Generation**: Automatically created or loaded from secure storage

### Safety Features

- **Read-only Monitoring**: Keeper can only observe Smart Wallet state
- **Execution-only Access**: Can only trigger inheritance, not modify or steal assets
- **Eligibility Verification**: Multiple checks ensure inheritance is legitimate
- **On-chain Validation**: All safety checks enforced by the Solana program

## 📊 Status Monitoring

### UI Dashboard

View real-time status of:
- Auto execution enabled/disabled
- Check interval and next check time
- Keeper wallet address and balance
- Monitored wallets count
- Last activity timestamps

### Command Line Interface

When running standalone keeper:

```
Available commands:
  status    - Show keeper status
  wallets   - Show monitored wallets  
  check     - Manually trigger check
  add <key> - Add wallet to monitor
  help      - Show available commands
  quit      - Stop and exit
```

## 🎯 Use Cases

### Personal Inheritance

```typescript
// 1. Create Smart Wallet with 30-day inactivity
// 2. Add family members as heirs with percentages
// 3. Enable auto execution with 1-hour check interval
// 4. System automatically distributes after 30 days of inactivity
```

### Business Continuity

```typescript
// 1. Create Smart Wallet with 7-day inactivity for critical business assets
// 2. Add key team members as heirs
// 3. Enable auto execution with 10-minute check interval
// 4. Ensures business assets are accessible if owner is unavailable
```

### Emergency Access

```typescript
// 1. Create Smart Wallet with 3-day inactivity for emergency funds
// 2. Add trusted contacts as heirs
// 3. Enable auto execution with 30-second check interval
// 4. Rapid asset recovery in emergency situations
```

## 🔧 Troubleshooting

### Common Issues

1. **Keeper Wallet Balance**
   - Issue: Transaction failures due to insufficient SOL
   - Solution: Send 0.01-0.1 SOL to keeper wallet

2. **Auto Execution Not Starting**
   - Issue: Keeper wallet not initialized
   - Solution: Refresh page or restart keeper service

3. **Inheritance Not Triggering**
   - Issue: Activity timer not expired or no balance
   - Solution: Check status panel for eligibility details

### Debug Commands

```bash
# Check keeper wallet balance
solana balance <KEEPER_WALLET_ADDRESS>

# View Smart Wallet account data
solana account <SMART_WALLET_PDA>

# Monitor transaction logs
solana logs --url devnet
```

## 📈 Advanced Features

### Multi-Wallet Monitoring

The keeper can monitor multiple Smart Wallets simultaneously:

```typescript
keeper.addWalletToMonitor(new PublicKey("wallet1..."));
keeper.addWalletToMonitor(new PublicKey("wallet2..."));
keeper.addWalletToMonitor(new PublicKey("wallet3..."));
```

### Custom Check Intervals

Different monitoring frequencies for different scenarios:

- **30 seconds**: Emergency or high-priority assets
- **1 minute**: Standard monitoring  
- **5-10 minutes**: Regular business assets
- **1 hour**: Long-term inheritance planning

### Notification Integration

Extend the keeper to send notifications:

```typescript
// Email notifications when inheritance is executed
// Webhook calls to external systems
// Discord/Slack bot integration
// SMS alerts for critical events
```

## 🛡️ Best Practices

### Setup

1. **Test on Devnet First**: Always test your configuration before mainnet
2. **Fund Keeper Wallet**: Ensure adequate SOL for transaction fees
3. **Verify Heir Addresses**: Double-check all heir wallet addresses
4. **Set Appropriate Intervals**: Balance monitoring frequency with resource usage

### Operation

1. **Regular Activity Updates**: Update your activity to prevent premature execution
2. **Monitor Keeper Status**: Check that auto execution remains active
3. **Maintain SOL Balance**: Keep keeper wallet funded for transactions
4. **Review Configurations**: Periodically verify heir allocations and periods

### Security

1. **Secure Keeper Keys**: Store keeper wallet securely (hardware wallet for production)
2. **Monitor Transactions**: Watch for unexpected inheritance executions
3. **Update Access**: Remove inactive heirs and update allocations as needed
4. **Backup Configuration**: Document your Smart Wallet setup for recovery

---

## 🚀 Getting Started Now

1. **Connect Your Wallet** to the Smart Wallet interface
2. **Create Smart Wallet** with your heirs and inactivity period  
3. **Enable Auto Execution** using the toggle switch
4. **Fund Keeper Wallet** with small SOL amount for fees
5. **Monitor Status** through the dashboard

Your assets will now be automatically distributed to heirs if you become inactive for the configured period!

## 🆘 Support

For technical support:
- Check the status dashboard for diagnostic information
- Review console logs for error messages
- Verify keeper wallet has sufficient SOL balance
- Ensure Smart Wallet has assets to distribute

The system is designed to be reliable and secure - your assets are protected while ensuring automatic inheritance when needed.