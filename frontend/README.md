# Gado Wallet Frontend

This is the main React + TypeScript + Vite frontend for Gado Wallet. It provides a modern, secure interface for wallet connection, heir management, batch transfers, and inheritance activity management.

## 🚀 Live Status
- **Development Server**: http://localhost:5174 (auto port-conflict resolution)
- **Connected Program**: `EciS2vNDTe5S6WnNWEBmdBmKjQL5bsXyfauYmxPFKQGu` (Solana Devnet)
- **Build Status**: ✅ Production Ready

## 🎯 Key Features
- **Smart Wallet Connection** - Seamless integration with Phantom, Solflare, and other Solana wallets
- **Heir Management** - Add, remove, and manage inheritance beneficiaries
- **Batch Transfers** - Efficient multi-recipient transaction processing
- **Activity Monitoring** - Real-time tracking of inheritance wallet activities
- **Secure Interface** - CSP-enforced security with modern React patterns

## Tech Stack
- **React 18.2.0** with StrictMode wrapper
- **TypeScript 5.x** with strict mode enabled
- **Vite 7.1.7** with ES2022 target and ESM modules
- **Tailwind CSS** for styling and responsive design
- **Solana Wallet Adapter** for multi-wallet integration
- **Anchor Web3.js** for Solana program interaction
- **Content Security Policy** enforcement for enhanced security

## Development
```bash
# From repository root
cd frontend

# Install dependencies (legacy peer deps for wallet adapter compatibility)
npm install --legacy-peer-deps

# Start development server
npm run dev
```

The app will automatically start on http://localhost:5174 (port 5173 if available).

### Available Scripts
- `npm run dev` - Start development server with hot reloading
- `npm run build` - Build for production (outputs to `dist/`)
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint checks

## Build
```bash
npm run build  # or: yarn build
npm run preview
```

## Security & Environment
- **Content Security Policy** enforced in development server and production deployment
- **External link safety** with `rel="noopener noreferrer"` attributes
- **No client-side secrets** - All private keys handled via wallet extensions
- **Environment variables** - None required for frontend operation

⚠️ **Security Note**: Never commit private keys or mnemonics. Always use wallet extensions for transaction signing.
