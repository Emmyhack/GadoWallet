# Inheritance Keeper Bot

The Inheritance Keeper Bot monitors Smart Wallets and executes inheritance when wallet owners become inactive according to their configured inactivity periods.

## Features

- **Automated Monitoring**: Continuously monitors Smart Wallets for inactive owners
- **Batch Processing**: Efficiently processes multiple wallets in batches
- **Retry Logic**: Robust error handling with automatic retries
- **Configuration Management**: Flexible configuration via environment variables or config files
- **Logging**: Comprehensive logging with optional file output
- **Network Support**: Works on devnet, testnet, and mainnet
- **Wallet Management**: Automatic keeper wallet creation and funding

## Quick Start

1. **Basic Usage** (discovers all Smart Wallets on-chain):
   ```bash
   npx ts-node keeper-bot.ts
   ```

2. **Enhanced Usage** with configuration:
   ```bash
   # Copy and configure environment file
   cp .env.example .env
   
   # Run enhanced keeper bot
   npx ts-node -e "require('./enhanced-keeper-bot').runEnhancedKeeperBot()"
   ```

3. **Test the Keeper Bot**:
   ```bash
   npx ts-node test-keeper-bot.ts
   ```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `KEEPER_NETWORK` | Solana network (devnet/testnet/mainnet-beta) | devnet |
| `KEEPER_RPC_URL` | Custom RPC URL | Uses cluster default |
| `KEEPER_WALLET_PATH` | Path to keeper wallet JSON file | Auto-generated |
| `KEEPER_MIN_BALANCE` | Minimum SOL balance for keeper wallet | 0.01 |
| `KEEPER_CHECK_INTERVAL` | Check interval in minutes | 5 |
| `KEEPER_BATCH_SIZE` | Number of wallets to process in each batch | 10 |
| `KEEPER_TARGET_WALLETS` | Comma-separated list of wallet addresses | Auto-discover |
| `KEEPER_VERBOSE` | Enable verbose logging | true |
| `KEEPER_LOG_FILE` | Path to log file | Console only |

### Programmatic Configuration

```typescript
import { runEnhancedKeeperBot } from './enhanced-keeper-bot';

// Run with custom configuration
await runEnhancedKeeperBot({
  network: "mainnet-beta",
  checkIntervalMinutes: 60,
  targetWallets: ["wallet1...", "wallet2..."],
  logFile: "./keeper.log"
});
```

## Files

- `keeper-bot.ts` - Basic keeper bot implementation
- `enhanced-keeper-bot.ts` - Enhanced version with configuration support
- `keeper-config.ts` - Configuration types and utilities
- `test-keeper-bot.ts` - Test script
- `.env.example` - Environment variable template

## How It Works

1. **Discovery**: The bot discovers Smart Wallets either by:
   - Fetching all program accounts from the blockchain, or
   - Using a provided list of target wallet addresses

2. **Health Check**: For each Smart Wallet, the bot checks:
   - If the wallet exists and is properly configured
   - If inheritance has already been executed
   - If the owner is inactive (based on last activity time)
   - If there are assets to distribute

3. **Execution**: When conditions are met, the bot:
   - Ensures sufficient keeper wallet balance
   - Executes the inheritance transaction
   - Logs the distribution details

4. **Monitoring**: The process repeats at configured intervals

## Production Deployment

For production use:

1. **Use mainnet configuration**:
   ```bash
   export KEEPER_NETWORK=mainnet-beta
   export KEEPER_MIN_BALANCE=0.1
   export KEEPER_CHECK_INTERVAL=60
   ```

2. **Secure keeper wallet**:
   - Store keeper wallet in secure location
   - Ensure adequate SOL balance for transaction fees
   - Monitor keeper wallet balance

3. **Logging and monitoring**:
   - Enable file logging
   - Set up monitoring alerts
   - Review logs regularly

4. **Target specific wallets** (recommended):
   ```bash
   export KEEPER_TARGET_WALLETS="wallet1,wallet2,wallet3"
   ```

## Security Considerations

- The keeper bot only executes inheritance for wallets that meet all conditions
- The bot cannot access wallet funds directly - it only triggers the inheritance process
- Keeper wallet only needs minimal SOL for transaction fees
- All transactions are logged for audit purposes

## Troubleshooting

### Common Issues

1. **"Insufficient keeper wallet balance"**:
   - Solution: Ensure keeper wallet has sufficient SOL or enable auto-funding

2. **"Smart Wallet not found"**:
   - Solution: Verify wallet addresses and ensure Smart Wallets are deployed

3. **"RPC connection failed"**:
   - Solution: Check network connectivity and RPC URL configuration

4. **"Owner is still active"**:
   - This is normal - inheritance only executes when owners are inactive

### Debugging

Enable verbose logging to see detailed execution information:
```bash
export KEEPER_VERBOSE=true
```

## Examples

### Monitor All Wallets (Development)
```typescript
import { runKeeperBot } from './keeper-bot';
await runKeeperBot();
```

### Monitor Specific Wallets (Production)
```typescript
import { runEnhancedKeeperBot } from './enhanced-keeper-bot';

await runEnhancedKeeperBot({
  network: "mainnet-beta",
  targetWallets: [
    "11111111111111111111111111111112",
    "22222222222222222222222222222223"
  ],
  checkIntervalMinutes: 60,
  verbose: false,
  logFile: "./production-keeper.log"
});
```