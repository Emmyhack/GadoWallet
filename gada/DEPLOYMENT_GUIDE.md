# Gada Wallet Guardian - Deployment Guide

## Quick Fix for "Program Does Not Exist" Error

The error occurs because the Solana program is not deployed to the network you're trying to use. Here are the solutions:

### Option 1: Use Localnet (Recommended for Development)

1. **Start local Solana validator:**
   ```bash
   solana-test-validator
   ```

2. **Update frontend to use localnet:**
   ```bash
   cd gada/frontend/src/contexts
   # Edit WalletContext.tsx and change:
   # const network = WalletAdapterNetwork.Devnet;
   # to:
   # const network = WalletAdapterNetwork.Localnet;
   ```

3. **Deploy program to localnet:**
   ```bash
   cd gada
   anchor build
   anchor deploy
   ```

### Option 2: Deploy to Devnet

1. **Install Anchor CLI:**
   ```bash
   npm install -g @coral-xyz/anchor-cli
   ```

2. **Set up Solana CLI for devnet:**
   ```bash
   solana config set --url devnet
   solana airdrop 2  # Get some SOL for deployment
   ```

3. **Deploy to devnet:**
   ```bash
   cd gada
   anchor build
   anchor deploy --provider.cluster devnet
   ```

### Option 3: Use Mock Program (For Frontend Testing)

If you can't deploy the program, you can temporarily mock the program calls for frontend testing:

1. **Create mock program functions** (already implemented in programCheck.ts)
2. **Use simulation mode** for testing UI without actual transactions

## Current Program Configuration

- **Program ID:** `JDiDDsbcxy1389gGQw26nVSuyn6WuhauAFQkFiozEPdM` (Updated to match Anchor.toml)
- **Current Network:** Devnet (configured in Anchor.toml)
- **Frontend Network:** Devnet (configured in WalletProvider.tsx)

⚠️ **IMPORTANT**: The program needs to be deployed to devnet before heir functionality will work.

## Civic Integration Setup

The Civic verification system is now fully integrated:

### Features Implemented:
- ✅ Identity verification before heir setup
- ✅ Civic Pass integration with proper CSP
- ✅ Graceful error handling for verification failures
- ✅ Optional vs required verification modes
- ✅ User-friendly verification flow

### Civic Networks Used:
- **Captcha Pass:** `tgnuXXNMDLK8dy7Xm1TdeGyc95MDym4bvAQCwcW21Bf`
- **Uniqueness Pass:** `49wLubTmowVu8idEHdFQ6EAQnmktDJncGc7LnYcKEfzz`

## Error Handling Improvements

Enhanced error handling now includes:
- ✅ SendTransactionError logging with getLogs()
- ✅ Program deployment status checking
- ✅ User-friendly error messages
- ✅ Detailed console logging for debugging

## Next Steps

1. **Choose deployment option** (localnet recommended for development)
2. **Deploy the program** using chosen method
3. **Test Civic verification flow**
4. **Test inheritance functionality**

## Troubleshooting

### Common Issues:

1. **"Program that does not exist"**
   - Solution: Deploy program using steps above

2. **Civic verification not working**
   - Check CSP settings (already configured)
   - Ensure wallet is connected
   - Check network connection

3. **Transaction simulation failed**
   - Usually means program not deployed
   - Check program deployment status in console

4. **Insufficient funds**
   - Get SOL from faucet: `solana airdrop 2`
   - For devnet: Use Solana faucet website

### Debug Information

The frontend now provides detailed error logging:
- Check browser console for deployment status
- Transaction errors include full logs
- Program deployment status is checked automatically

## Development Workflow

1. **Start local validator** (if using localnet)
2. **Deploy program** to chosen network
3. **Start frontend:** `cd gada/frontend && npm run dev`
4. **Connect wallet** and test functionality
5. **Complete Civic verification** when prompted
6. **Test inheritance features**

## Production Deployment

For production:
1. Deploy program to mainnet-beta
2. Update network configurations
3. Use production Civic gatekeeper networks
4. Ensure proper security configurations