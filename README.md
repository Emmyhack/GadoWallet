# Gada Wallet: Secure Digital Inheritance on Solana

Gada Wallet is a decentralized application (DApp) that enables users to securely manage and transfer their Solana (SOL) and SPL tokens to designated heirs. Built with a custom Solana smart contract (Anchor framework) and a modern React/TypeScript frontend, Gada Wallet ensures your digital assets are protected and can be inherited according to your wishes.

---

## 🚀 Features
- **Secure Inheritance:** Designate heirs for your SOL and SPL tokens. Assets are claimable by heirs after a period of owner inactivity.
- **Batch Transfers:** Efficiently send SOL or SPL tokens to multiple recipients in a single transaction.
- **Time-Based Claims:** Heirs can only claim assets after a set period of owner inactivity (default: 1 year).
- **Multiple Heirs:** Add multiple heirs for different assets.
- **Activity Updates:** Owners can update their activity to prevent premature claims.
- **Modern UI:** Intuitive, responsive frontend with wallet integration (Phantom, Solflare).

---

## 🏗️ Architecture
- **Smart Contract:** Solana program written in Rust using Anchor, deployed to Devnet.
- **Frontend:** React + TypeScript + Vite + Tailwind CSS, using @coral-xyz/anchor for contract interaction.

---

## 📦 Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Yarn](https://classic.yarnpkg.com/en/docs/install/) or npm
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
- [Anchor CLI](https://book.anchor-lang.com/getting_started/installation.html)
- [Rust](https://www.rust-lang.org/tools/install)

---

## ⚡ Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Emmyhack/gada-Wallet.git
cd gada-Wallet
```

### 2. Install Dependencies
#### Backend (Smart Contract)
```bash
cd gada
yarn install
```
#### Frontend
```bash
cd frontend
yarn install
```

### 3. Build & Deploy the Smart Contract
- Configure your Solana CLI to devnet or localnet:
  ```bash
  solana config set --url devnet
  ```
- Deploy the contract:
  ```bash
  anchor build
  anchor deploy
  ```
- The program ID should match `Gf4b24oCZ6xGdVj5HyKfDBZKrd3JUuhQ87ApMAyg87t5` (see `Anchor.toml`).

### 4. Run the Frontend
```bash
cd gada/frontend
yarn dev
```
Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📝 Usage
- **Connect Wallet:** Use Phantom or Solflare to connect.
- **Add Heir:** Specify an heir's address and amount for SOL or SPL tokens.
- **Batch Transfer:** Send assets to multiple recipients in one go.
- **Claim Assets:** Heirs can claim assets after inactivity period.
- **Update Activity:** Owners can reset their activity timer.

---

## 🛠️ Smart Contract Overview
- **add_token_heir / add_coin_heir:** Register an heir for SPL tokens or SOL.
- **batch_transfer_tokens / batch_transfer_coins:** Batch send tokens or SOL from your wallet.
- **claim_heir_token_assets / claim_heir_coin_assets:** Heir claims assets after inactivity.
- **update_activity / update_coin_activity:** Owner updates activity to prevent claims.

All transfers require wallet signatures. The contract never has custody of your funds; it only enforces logic for inheritance and batch transfers.

---

## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License
This project is licensed under the MIT License. # gada-Wallet
# GadaWallet
