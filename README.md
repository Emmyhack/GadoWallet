# Gada Wallet

Gada Wallet is a decentralized application (DApp) for managing Solana (SOL) and SPL token inheritance. Users can designate heirs, set inactivity periods, and allow heirs to claim assets securely after the configured timeframe. The project consists of a Solana smart contract built with Anchor and modern React/TypeScript frontends.

## Features
- Secure inheritance with inactivity-based claims
- Batch transfers for SOL and SPL tokens
- Support for multiple heirs
- Owner activity updates to prevent premature claims
- Modern UI with wallet integration (Phantom, Solflare)

## Architecture
- Smart Contract: Solana program written in Rust using Anchor (Devnet)
- Frontend: React + TypeScript + Vite + Tailwind CSS

## Prerequisites
- Node.js (v20 or later)
- Yarn or npm
- Solana CLI
- Anchor CLI
- Rust toolchain

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
yarn install
```
#### Frontends
```bash
cd frontend && yarn install
cd ../gada/frontend && yarn install
```

### 3. Build and Deploy the Smart Contract
- Configure Solana CLI to devnet:
```bash
solana config set --url devnet
```
- Build and deploy:
```bash
anchor build
anchor deploy
```
- Ensure the program ID matches `Gf4b24oCZ6xGdVj5HyKfDBZKrd3JUuhQ87ApMAyg87t5` (see `Anchor.toml`).

### 4. Run the Frontends
```bash
cd frontend && yarn dev
# or
cd gada/frontend && yarn dev
```
Open http://localhost:5173 in your browser.

## Per-heir Inactivity Period
When adding an heir (SOL or SPL), you can now set the inactivity period (in days) per heir. This value is stored on-chain with the heir record and is used to determine when the heir can claim.

- In the UI: fill "Inactivity (days)" when adding an heir.
- Program API (Anchor):
  - `add_coin_heir(amount: u64, inactivity_period_seconds: i64)`
  - `add_token_heir(amount: u64, inactivity_period_seconds: i64)`

## Testing Inheritance Sooner
For testing, set a small inactivity value (e.g., 2 days) when adding the heir. No special build flags are required.

If you prefer, there is also a legacy feature flag for short default periods during development:
```bash
cd gada
anchor build -- --features short-claim-delay
anchor deploy
```

## Usage
- Connect a wallet (Phantom or Solflare)
- Add heirs for SOL or SPL tokens with amounts
- Choose an inactivity period per heir (in days)
- Heirs can claim assets after the inactivity period
- Owners can update their activity at any time

## Security
- CSP enforced in development and production
- External links use `rel="noopener noreferrer"`
- Strict TypeScript settings; no `eval` or unsafe HTML injection
- Rust release builds enable overflow checks and abort on panic

See `SECURITY.md` for reporting guidelines and details.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss your proposal.

## License
MIT License.
