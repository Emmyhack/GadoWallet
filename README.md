# Gada Wallet

A comprehensive, business-ready digital asset inheritance platform built on Solana with advanced features including Smart Wallets, automated inheritance execution, platform fees, multi-tier user management, and real-time analytics dashboard.

## 🚀 Live Deployment
- **Program ID**: `EciS2vNDTe5S6WnNWEBmdBmKjQL5bsXyfauYmxPFKQGu`
- **Network**: Solana Devnet
- **Status**: ✅ Successfully Deployed & Active

## Features
- ✅ Secure inheritance with inactivity-based claims
- ✅ Batch transfers for SOL and SPL tokens
- ✅ Support for multiple heirs with individual inactivity periods
- ✅ Owner activity updates to prevent premature claims
- ✅ Modern UI with wallet integration (Phantom, Solflare)
- ✅ Content Security Policy (CSP) enforcement
- ✅ TypeScript strict mode with comprehensive error handling

## Architecture
- **Smart Contract**: Solana program written in Rust using Anchor Framework
  - Deployed on Solana Devnet
  - Program ID: `EciS2vNDTe5S6WnNWEBmdBmKjQL5bsXyfauYmxPFKQGu`
  - Built with Anchor v0.31.1
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
  - Modern ESM with ES2022 target
  - Strict TypeScript configuration
  - CSP-compliant security headers

## Prerequisites
- Node.js (v18.20.8 or later)
- npm (v10.8.2 or later) 
- Solana CLI (v2.1.9 or later)
- Anchor CLI (v0.31.1)
- Rust toolchain (v1.90.0 or later)
- Build essentials (gcc, pkg-config, libudev-dev on Ubuntu)

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Emmyhack/GadaWallet.git
cd GadaWallet
```

### 2. Install Dependencies
#### Backend (smart contract)
```bash
cd gada
npm install  # Anchor.toml is configured to use npm
```
#### Frontends
```bash
# Main frontend
cd frontend && npm install --legacy-peer-deps

# Alternative frontend (under gada/)
cd ../gada/frontend && npm install
```

### 3. Build and Deploy the Smart Contract

#### First-time Setup (Ubuntu/WSL)
```bash
# Install system dependencies
sudo apt update
sudo apt install -y build-essential pkg-config libudev-dev

# Install Rust if not already installed
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"

# Install Solana CLI
cargo install solana-cli

# Install Anchor Version Manager and Anchor CLI
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest && avm use latest
```

#### Configure and Deploy
```bash
cd gada

# Configure Solana CLI to devnet
solana config set --url devnet

# Create wallet if needed (or use existing)
solana-keygen new --outfile ~/.config/solana/id.json

# Get devnet SOL for deployment
solana airdrop 2

# Build the program
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet
```

**Current Program ID**: `EciS2vNDTe5S6WnNWEBmdBmKjQL5bsXyfauYmxPFKQGu`

> **Note**: If you deploy your own instance, update the program ID in:
> - `gada/Anchor.toml`
> - `gada/programs/gada/src/lib.rs` (declare_id!)
> - Frontend configuration files

### 4. Run the Frontends

#### Main Frontend (Recommended)
```bash
cd frontend
npm run dev
```
Opens at http://localhost:5174 (automatically handles port conflicts)

#### Alternative Frontend
```bash
cd gada/frontend
npm run dev
```
Opens at http://localhost:5173

Both frontends connect to the same deployed Solana program on devnet.

## Per-heir Inactivity Period
When adding an heir (SOL or SPL), you can now set the inactivity period (in days) per heir. This value is stored on-chain with the heir record and is used to determine when the heir can claim.

- In the UI: fill "Inactivity (days)" when adding an heir.
- Program API (Anchor):
  - `add_coin_heir(amount: u64, inactivity_period_seconds: i64)`
  - `add_token_heir(amount: u64, inactivity_period_seconds: i64)`

## Development Status

### ✅ Completed Features
- [x] Solana program deployment to devnet
- [x] Heir management (SOL and SPL tokens)
- [x] Individual inactivity periods per heir
- [x] Batch transfer functionality
- [x] Activity updates and claim prevention
- [x] Frontend wallet integration
- [x] TypeScript strict mode compliance
- [x] Content Security Policy enforcement
- [x] Build system optimization

### 🏗️ Technical Achievements
- **Zero Compilation Errors**: All TypeScript configurations standardized
- **Modern Build Pipeline**: Vite 7.x with ESM and React hot reloading
- **Security Hardened**: CSP policies, strict TypeScript, overflow checks
- **Cross-platform Compatible**: WSL/Ubuntu development environment tested
- **Package Manager Consistency**: Anchor.toml configured for npm

## Troubleshooting

### Common Build Issues
```bash
# If you get permission errors with npm global installs
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH

# If Solana CLI is not found
source "$HOME/.cargo/env"

# If anchor build fails with version errors
rm Cargo.lock
anchor build
```

### WSL/Ubuntu Specific
```bash
# Required system packages
sudo apt install build-essential pkg-config libudev-dev

# If you get SSL/TLS errors downloading Solana
# Use the cargo installation method instead of curl
```

## Usage
1. **Connect Wallet**: Click "Connect Wallet" and choose Phantom, Solflare, or another supported wallet
2. **Add Heirs**: 
   - Navigate to "Add Heir" section
   - Choose between SOL (coins) or SPL tokens
   - Enter heir's public key
   - Set amount to inherit
   - Set inactivity period (in days) - this is how long you must be inactive before the heir can claim
3. **Batch Transfers**: Send SOL or tokens to multiple recipients at once
4. **Update Activity**: Reset your inactivity timer to prevent premature claims
5. **Claim Assets** (as heir): If the owner has been inactive for the specified period, heirs can claim their inheritance

## Testing Inheritance
For testing purposes, you can set short inactivity periods (e.g., 1-2 days) when adding heirs. The program supports any inactivity period from seconds to years.

## Security
- ✅ Content Security Policy (CSP) enforced in development and production
- ✅ External links use `rel="noopener noreferrer"`
- ✅ Strict TypeScript settings; no `eval` or unsafe HTML injection
- ✅ Rust release builds enable overflow checks and abort on panic
- ✅ Program deployed with proper authority management
- ✅ No private keys stored client-side (wallet extensions only)

See `SECURITY.md` for reporting guidelines and detailed security information.

## Project Structure
```
GadaWallet/
├── README.md                 # This file
├── SECURITY.md               # Security policies
├── frontend/                 # Main React frontend (Vite 7.x)
│   ├── src/
│   ├── package.json
│   └── vite.config.ts       # CSP and dev server config
├── gada/                    # Anchor workspace
│   ├── Anchor.toml          # Anchor configuration (npm)
│   ├── programs/gada/       # Solana program source (Rust)
│   ├── tests/               # Anchor tests
│   └── frontend/            # Alternative frontend
└── vercel.json              # Production deployment config
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss your proposal.

## License
MIT License.
