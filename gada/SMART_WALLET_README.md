# Gada Wallet - Smart Wallet Inheritance System

## Overview

Gada Wallet now supports **two inheritance models**:

1. **Escrow-based Inheritance** (Original system) - Assets held in program-managed escrow accounts
2. **Smart Wallet Inheritance** (New system) - Assets held in PDA wallets with automatic distribution

The Smart Wallet inheritance model provides enhanced functionality including:
- **PDA-based asset management** - Assets stored in program-derived addresses
- **Multi-heir distribution** - Automatic percentage-based asset allocation
- **Keeper bot integration** - Automated inheritance execution
- **Activity tracking** - Reset inactivity timers with any wallet interaction
- **Both SOL and SPL token support** - Complete asset inheritance

## Program Information

- **Program ID**: `EciS2vNDTe5S6WnNWEBmdBmKjQL5bsXyfauYmxPFKQGu`
- **Network**: Solana Devnet
- **Anchor Version**: 0.31.1

## Smart Wallet Architecture

### Core Components

1. **SmartWallet Account**: Stores inheritance configuration and heir information
2. **Smart Wallet PDA**: Holds actual assets (SOL and SPL tokens)
3. **Keeper System**: Automated bots that execute inheritance when owners become inactive
4. **Activity Tracking**: Monitors owner activity and resets inactivity timers

### Account Structure

```rust
pub struct SmartWallet {
    pub owner: Pubkey,                    // Wallet owner
    pub heirs: Vec<HeirData>,            // List of heirs with allocation percentages
    pub inactivity_period_seconds: i64,   // Time before inheritance can be executed
    pub last_active_time: i64,           // Last activity timestamp
    pub is_executed: bool,               // Whether inheritance has been executed
    pub bump: u8,                        // PDA bump seed
}

pub struct HeirData {
    pub heir_pubkey: Pubkey,             // Heir's wallet address
    pub allocation_percentage: u8,        // Percentage of assets (1-100)
}
```

## Instructions

### 1. create_smart_wallet_inheritance

Creates a Smart Wallet inheritance setup with specified heirs and inactivity period.

**Parameters:**
- `heirs: Vec<HeirData>` - List of heirs with allocation percentages (must sum to 100%)
- `inactivity_period_seconds: i64` - Seconds of inactivity before inheritance can be executed

**Accounts:**
- `smart_wallet` - Smart Wallet account (PDA)
- `smart_wallet_pda` - Asset holding PDA
- `owner` - Wallet owner (signer)
- `system_program` - System program

### 2. deposit_to_smart_wallet

Deposits SOL into the Smart Wallet PDA.

**Parameters:**
- `amount: u64` - Amount in lamports

### 3. deposit_tokens_to_smart_wallet

Deposits SPL tokens into the Smart Wallet PDA.

**Parameters:**
- `amount: u64` - Token amount

### 4. update_smart_wallet_activity

Updates the owner's activity timestamp, resetting the inactivity timer.

### 5. execute_inheritance

Executes inheritance by distributing all Smart Wallet assets to heirs according to allocation percentages. Can only be called by keeper bots when the owner has been inactive beyond the threshold.

## TypeScript Client Usage

### Setup

```typescript
import { SmartWalletClient } from './smart-wallet-client';
import * as anchor from "@coral-xyz/anchor";

// Set up connection and program
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const program = new Program(IDL, provider);
const client = new SmartWalletClient(program, connection);
```

### Create Smart Wallet

```typescript
const heirs = [
  { heirPubkey: heir1.publicKey, allocationPercentage: 60 },
  { heirPubkey: heir2.publicKey, allocationPercentage: 40 },
];

const tx = await client.createSmartWalletInheritance(
  ownerKeypair,
  heirs,
  365 * 24 * 60 * 60 // 1 year inactivity period
);
```

### Deposit Assets

```typescript
// Deposit SOL
await client.depositToSmartWallet(ownerKeypair, 1.0); // 1 SOL

// Deposit SPL tokens
await client.depositTokensToSmartWallet(
  ownerKeypair,
  tokenMint,
  1000000 // Token amount
);
```

### Update Activity

```typescript
// Reset inactivity timer
await client.updateSmartWalletActivity(ownerKeypair);
```

### Check Status

```typescript
// Get Smart Wallet information
const smartWallet = await client.getSmartWallet(ownerPublicKey);

// Check balance
const balance = await client.getSmartWalletBalance(ownerPublicKey);

// Check if owner is inactive
const isInactive = await client.isOwnerInactive(ownerPublicKey);
```

## Keeper Bot System

The keeper bot monitors Smart Wallets and automatically executes inheritance when owners become inactive.

### Running the Keeper Bot

```typescript
import { InheritanceKeeperBot } from './keeper-bot';

const keeperBot = new InheritanceKeeperBot(program, connection, keeperKeypair);

// Monitor specific wallets
const ownerAddresses = [owner1.publicKey, owner2.publicKey];
await keeperBot.monitorSmartWallets(ownerAddresses);

// Run continuous monitoring
await keeperBot.runContinuous(ownerAddresses, 60); // Check every 60 minutes
```

### Keeper Bot Features

- **Automated monitoring** of multiple Smart Wallets
- **Inactive owner detection** based on configurable thresholds
- **Automatic inheritance execution** when conditions are met
- **Asset distribution logging** for transparency
- **Error handling and retry logic**
- **Configurable monitoring intervals**

## Testing

### Run Smart Wallet Tests

```bash
# Install dependencies
npm install

# Run TypeScript compilation
npx tsc --noEmit

# Run Smart Wallet test
npx ts-node test-smart-wallet.ts

# Run keeper bot (after creating Smart Wallets)
npx ts-node keeper-bot.ts
```

### Test Scenarios

1. **Basic Smart Wallet Creation**
   - Create Smart Wallet with multiple heirs
   - Verify heir allocation percentages sum to 100%
   - Check Smart Wallet PDA creation

2. **Asset Management**
   - Deposit SOL to Smart Wallet
   - Deposit SPL tokens to Smart Wallet
   - Verify asset balances

3. **Activity Tracking**
   - Update activity timestamp
   - Verify inactivity timer reset
   - Check inactive status

4. **Inheritance Execution**
   - Wait for inactivity period
   - Execute inheritance via keeper bot
   - Verify asset distribution to heirs

## Security Features

### Access Control
- Only wallet owners can create and manage their Smart Wallets
- Only authorized keeper bots can execute inheritance
- Heir allocation percentages must sum to exactly 100%

### Inactivity Validation
- Configurable inactivity periods (minimum enforcement)
- Activity timestamps prevent premature inheritance
- Multiple activity update mechanisms

### Asset Protection
- PDA-based asset storage prevents unauthorized access
- Atomic inheritance execution ensures complete distribution
- No partial inheritance executions allowed

## Error Codes

- `TooManyHeirs` (6008) - Maximum 10 heirs allowed
- `NoHeirsProvided` (6009) - At least one heir required
- `InvalidAllocation` (6010) - Heir percentages must sum to 100%
- `AlreadyExecuted` (6011) - Inheritance already completed
- `OwnerStillActive` (6000) - Owner hasn't been inactive long enough
- `InvalidInactivityPeriod` (6005) - Inactivity period validation failed

## Production Considerations

### Indexing and Monitoring
- Implement indexing service to track all Smart Wallets
- Set up monitoring alerts for keeper bot failures
- Create backup keeper systems for redundancy

### Keeper Bot Infrastructure
- Deploy keeper bots on reliable cloud infrastructure
- Implement proper key management for keeper wallets
- Set up logging and monitoring for keeper operations

### User Experience
- Integrate activity updates into regular wallet operations
- Provide clear inheritance status in wallet UI
- Implement notification systems for heirs

## Integration with Existing Escrow System

The Smart Wallet inheritance model works alongside the existing escrow-based inheritance system:

- **Escrow Model**: Individual asset escrows with manual heir claiming
- **Smart Wallet Model**: PDA wallets with automatic distribution
- **Dual Support**: Users can choose which model to use
- **Migration Path**: Users can migrate from escrow to Smart Wallet model

## Future Enhancements

1. **Multi-signature Support**: Require multiple signatures for inheritance execution
2. **Conditional Inheritance**: Execute inheritance based on external conditions
3. **Gradual Distribution**: Release assets to heirs over time
4. **NFT Support**: Extend inheritance to include NFT assets
5. **Cross-chain Assets**: Support assets on multiple blockchain networks

## Support and Documentation

- **GitHub Repository**: [GadaWallet](https://github.com/your-repo/GadaWallet)
- **Smart Contract**: `/gada/programs/gada/src/lib.rs`
- **TypeScript Client**: `/gada/smart-wallet-client.ts`
- **Test Scripts**: `/gada/test-smart-wallet.ts`
- **Keeper Bot**: `/gada/keeper-bot.ts`