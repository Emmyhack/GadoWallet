# Gada Wallet Frontend (App)

This is the Vite + React frontend located under `gada/frontend`. It integrates with the Anchor-based Solana program to manage digital inheritance and batch transfers.

## Stack
- React 18, TypeScript 5, Vite 6
- Tailwind CSS
- @coral-xyz/anchor client

## Development
```bash
cd gada/frontend
npm install  # or: yarn install
npm run dev
```
The app runs at http://localhost:5173.

## Build
```bash
npm run build
npm run preview
```

## Configuration
No client-side secrets are required. RPC endpoints are configured via the wallet adapter and defaults.

## Security
- CSP headers configured for dev and production
- External links use `rel="noopener noreferrer"`
