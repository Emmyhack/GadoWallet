# Dynamic Fee Structure Implementation Guide

## Issue
The current smart contract uses a fixed platform fee percentage, but the business model requires dynamic fees based on inheritance amount:
- Small inheritances (< $10K): 0.5%
- Medium inheritances ($10K - $100K): 1%
- Large inheritances (> $100K): 2%

## Current Implementation
Located in `/gada/programs/gada/src/lib.rs`:
```rust
// Current fixed fee calculation (line ~690)
let total_platform_fee = (wallet_balance as u128 * config.platform_fee_bps as u128 / 10000) as u64;
```

## Required Changes

### 1. Add Dynamic Fee Function to PlatformConfig
Add this implementation to the `PlatformConfig` struct:

```rust
impl PlatformConfig {
    pub fn calculate_dynamic_fee(&self, inheritance_amount: u64) -> u64 {
        // Convert lamports to USD equivalent (simplified - use price oracle in production)
        // Assuming 1 SOL = $100 for calculation (update with real price feed)
        let sol_amount = inheritance_amount / 1_000_000_000; // Convert lamports to SOL
        let usd_equivalent = sol_amount * 100; // Rough SOL to USD conversion
        
        let fee_bps = if usd_equivalent < 10_000 {
            // Small inheritances (< $10K): 0.5%
            50 // 0.5% in basis points
        } else if usd_equivalent < 100_000 {
            // Medium inheritances ($10K - $100K): 1%
            100 // 1% in basis points
        } else {
            // Large inheritances (> $100K): 2%
            200 // 2% in basis points
        };
        
        (inheritance_amount as u128 * fee_bps as u128 / 10_000) as u64
    }
}
```

### 2. Update execute_inheritance Function
Replace the fixed fee calculation in `execute_inheritance`:

```rust
// OLD CODE (line ~690):
let total_platform_fee = (wallet_balance as u128 * config.platform_fee_bps as u128 / 10000) as u64;

// NEW CODE:
let total_platform_fee = config.calculate_dynamic_fee(wallet_balance);
```

### 3. Add Price Oracle Integration (Production)
For production, integrate with a price oracle like Pyth Network:

```rust
use pyth_solana_receiver_sdk::price_update::{get_feed_id_from_hex, PriceUpdateV2};

impl PlatformConfig {
    pub fn calculate_dynamic_fee_with_oracle(
        &self, 
        inheritance_amount: u64,
        sol_price_usd: f64
    ) -> u64 {
        let sol_amount = inheritance_amount as f64 / 1_000_000_000.0;
        let usd_equivalent = sol_amount * sol_price_usd;
        
        let fee_bps = if usd_equivalent < 10_000.0 {
            50   // 0.5%
        } else if usd_equivalent < 100_000.0 {
            100  // 1.0%
        } else {
            200  // 2.0%
        };
        
        (inheritance_amount as u128 * fee_bps as u128 / 10_000) as u64
    }
}
```

## Testing
Update the test files to verify dynamic fee calculation:

```rust
#[test]
fn test_dynamic_fee_calculation() {
    let config = PlatformConfig::default();
    
    // Test small inheritance ($5K = 50 SOL at $100/SOL)
    let small_amount = 50 * 1_000_000_000; // 50 SOL in lamports
    let small_fee = config.calculate_dynamic_fee(small_amount);
    assert_eq!(small_fee, small_amount * 50 / 10_000); // 0.5%
    
    // Test medium inheritance ($50K = 500 SOL at $100/SOL)
    let medium_amount = 500 * 1_000_000_000;
    let medium_fee = config.calculate_dynamic_fee(medium_amount);
    assert_eq!(medium_fee, medium_amount * 100 / 10_000); // 1.0%
    
    // Test large inheritance ($200K = 2000 SOL at $100/SOL)
    let large_amount = 2000 * 1_000_000_000;
    let large_fee = config.calculate_dynamic_fee(large_amount);
    assert_eq!(large_fee, large_amount * 200 / 10_000); // 2.0%
}
```

## Deployment Steps
1. Update the smart contract code in `/gada/programs/gada/src/lib.rs`
2. Add the new function to `PlatformConfig` implementation
3. Update `execute_inheritance` to use dynamic fees
4. Add tests for the new functionality
5. Deploy updated program to devnet for testing
6. Deploy to mainnet after thorough testing

## Revenue Impact
This implementation will align with the TIER 1 business model requirements and enable proper revenue scaling based on inheritance value as specified in the business model.