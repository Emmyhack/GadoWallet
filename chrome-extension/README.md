# gado Wallet Chrome Extension

A secure Solana wallet browser extension with automated crypto inheritance functionality.

## Features

### 🏛️ **Automated Inheritance System**
- Set up SOL and SPL token inheritances
- Automated keeper bot monitoring
- Customizable inactivity periods
- Secure heir management

### 💰 **Full Wallet Functionality**
- Send and receive SOL
- Transaction history and management
- Multi-network support (Mainnet, Devnet, Testnet)
- Portfolio overview and statistics

### 🔗 **dApp Integration**
- Compatible with Solana dApps
- Standard wallet interface (Phantom compatible)
- Secure transaction signing
- Auto-connect to trusted dApps

### 🔒 **Security Features**
- Local key storage with encryption
- Secure transaction signing
- Network isolation
- Permission-based dApp access

## Installation

### Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Emmyhack/gadoWallet.git
   cd gadoWallet/chrome-extension
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the extension:**
   ```bash
   npm run build
   ```

4. **Load in Chrome:**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

### Production Build

```bash
npm run package
```

This creates a `gado-wallet-extension.zip` file ready for Chrome Web Store submission.

## File Structure

```
chrome-extension/
├── src/                     # Source code
│   ├── background.js        # Service worker (Web3 connections)
│   ├── popup.js            # Main wallet interface
│   ├── content.js          # dApp integration
│   ├── injected.js         # Wallet provider injection
│   └── inheritance.js      # Inheritance setup
├── styles/                  # CSS stylesheets
│   ├── popup.css           # Popup interface styles
│   └── inheritance.css     # Inheritance setup styles
├── icons/                   # Extension icons
├── popup.html              # Main wallet interface
├── inheritance.html        # Inheritance setup page
├── manifest.json           # Extension manifest
├── package.json            # Dependencies and scripts
└── webpack.config.js       # Build configuration
```

## Usage

### Setting Up Your Wallet

1. **Install the Extension**: Load the extension in Chrome
2. **Create Wallet**: Click the extension icon and create a new wallet
3. **Secure Your Keys**: Export and securely store your private key
4. **Fund Your Wallet**: Send SOL to your wallet address

### Creating an Inheritance

1. **Open Inheritance Setup**: Click "Add Heir" in the dashboard
2. **Choose Type**: Select SOL or Token inheritance
3. **Configure Details**: 
   - Enter heir wallet address
   - Set amount to inherit
   - Choose inactivity period (7 days to 1 year)
4. **Confirm Setup**: Review and create the inheritance
5. **Keeper Monitoring**: The keeper bot automatically monitors your activity

### Using with dApps

1. **Connect to dApp**: Visit any Solana dApp website
2. **Wallet Detection**: gado Wallet is automatically detected
2. **Connect Wallet**: Click "Connect Wallet" and select gado
4. **Sign Transactions**: Approve transactions in the popup

## Development

### Scripts

- `npm run build` - Production build
- `npm run dev` - Development build with watching
- `npm run package` - Create distribution package
- `npm run clean` - Clean build directory
- `npm run lint` - Run ESLint

### Architecture

#### Background Service Worker
- Manages Web3 connections
- Handles wallet operations
- Keeper bot integration
- Secure key management

#### Content Script
- Injects wallet provider into web pages
- Handles dApp communication
- Message relay between popup and dApps

#### Popup Interface
- Main wallet dashboard
- Transaction management
- Settings and configuration
- Inheritance overview

#### Inheritance System
- Step-by-step inheritance setup
- SOL and token support
- Activity monitoring
- Automatic execution

## Security

### Key Management
- Private keys stored locally in browser storage
- Keys encrypted with browser's built-in security
- No keys sent to external servers
- User controls key export and import

### Transaction Security
- All transactions signed locally
- User confirmation required for each transaction
- dApp permissions managed per-origin
- Network requests isolated by manifest permissions

### dApp Integration Security
- Content Security Policy enforcement
- Origin-based permission system
- Secure message passing between contexts
- No direct DOM manipulation from dApps

## Inheritance System

### How It Works
1. **Setup**: User creates inheritance with heir address and conditions
2. **Monitoring**: Keeper bot watches for wallet activity
3. **Triggering**: If inactive for specified period, inheritance activates
4. **Execution**: Assets automatically transfer to heir
5. **Notification**: Heir receives notification about successful transfer

### Keeper Bot Features
- Runs in background service worker
- Checks activity every 5 minutes
- Automatic transaction execution
- Fallback to manual claiming if needed
- Email and push notification support (configurable)

## Supported Networks

- **Mainnet Beta**: Production Solana network
- **Devnet**: Development and testing
- **Testnet**: Pre-production testing
- **Custom RPC**: Configure custom endpoints

## Browser Compatibility

- Chrome 88+
- Edge 88+
- Brave (Chromium-based)
- Other Chromium-based browsers

## Troubleshooting

### Extension Won't Load
- Check manifest.json syntax
- Verify all required files are present
- Check Chrome developer console for errors

### Wallet Connection Issues
- Verify network connectivity
- Check RPC endpoint status
- Clear extension storage and restart

### dApp Integration Problems
- Check if dApp is compatible with standard Solana wallet API
- Verify content script injection
- Check browser console for errors

### Inheritance Setup Failures
- Verify heir address format (44-character base58)
- Check wallet balance for fees
- Ensure program is deployed on selected network

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## Support

- **Website**: [gadowallet.com](https://gadowallet.com)
- **Documentation**: [docs.gadowallet.com](https://docs.gadowallet.com)
- **Issues**: [GitHub Issues](https://github.com/Emmyhack/gadoWallet/issues)
- **Discord**: [Join our Discord](https://discord.gg/gadowallet)

## Roadmap

- [ ] Multi-signature inheritance support
- [ ] Hardware wallet integration
- [ ] Mobile app companion
- [ ] Advanced portfolio tracking
- [ ] DeFi protocol integration
- [ ] NFT inheritance support
- [ ] Multi-language support
- [ ] Dark mode theme

---

**⚠️ Important Security Notice**: This is beta software. Please use small amounts for testing and always backup your private keys securely. Never share your private keys with anyone.