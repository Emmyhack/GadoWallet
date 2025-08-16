# Gada Wallet Frontend

This is the React + TypeScript + Vite frontend for Gada Wallet. It provides wallet connection, heir management, batch transfers, and activity views.

## Tech Stack
- React 19, TypeScript 5, Vite 7
- Tailwind CSS
- Solana Wallet Adapter

## Development
```bash
# from repository root
cd frontend
npm install  # or: yarn install
npm run dev  # or: yarn dev
```
The app runs at http://localhost:5173.

## Build
```bash
npm run build  # or: yarn build
npm run preview
```

## Security
- Content Security Policy enforced in dev server and Vercel
- External links use `rel="noopener noreferrer"`

## Environment
No secrets are required client-side. Do not commit private keys. Use wallet extensions for signing.
