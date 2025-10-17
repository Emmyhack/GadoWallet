// Wallet Connection Troubleshooting Guide

export const walletTroubleshooting = {
  commonIssues: [
    {
      issue: "Wallet extension not installed",
      description: "The browser doesn't have a compatible wallet extension installed",
      solutions: [
        "Install Phantom wallet extension from https://phantom.app/",
        "Install Solflare wallet extension from https://solflare.com/",
        "Refresh the page after installation",
        "Make sure the extension is enabled"
      ]
    },
    {
      issue: "Wallet locked or not set up",
      description: "The wallet extension is installed but not properly configured",
      solutions: [
        "Open the wallet extension and unlock it with your password",
        "Create a new wallet if you don't have one",
        "Import an existing wallet using seed phrase",
        "Make sure you're on the correct network (Devnet/Mainnet)"
      ]
    },
    {
      issue: "Browser compatibility issues",
      description: "The browser doesn't support Web3 or has security restrictions",
      solutions: [
        "Use Chrome, Firefox, or Brave browser",
        "Disable ad blockers that might interfere with wallet connections",
        "Check if the site is accessible over HTTPS",
        "Clear browser cache and cookies for the site"
      ]
    },
    {
      issue: "Network connectivity problems",
      description: "Issues connecting to the Solana RPC endpoints",
      solutions: [
        "Check your internet connection",
        "Try switching between Devnet and Mainnet",
        "Wait a few minutes and try again (RPC might be temporarily down)",
        "Use a different RPC endpoint if possible"
      ]
    },
    {
      issue: "Wallet adapter configuration",
      description: "The wallet adapter is misconfigured or has missing dependencies",
      solutions: [
        "Check that all @solana/wallet-adapter packages are up to date",
        "Verify the WalletProvider wraps the entire app",
        "Check browser console for JavaScript errors",
        "Ensure polyfills for Buffer and Process are properly set up"
      ]
    },
    {
      issue: "Auto-connect disabled",
      description: "The wallet doesn't automatically connect on page load",
      solutions: [
        "Click the wallet button to manually connect",
        "Check if auto-connect is disabled in wallet settings",
        "Grant permission to the website in your wallet",
        "Reset wallet permissions and reconnect"
      ]
    }
  ],
  
  diagnosticSteps: [
    "Open browser developer tools (F12)",
    "Check the Console tab for JavaScript errors",
    "Look for wallet-related errors or warnings",
    "Verify that window.phantom or window.solflare exists",
    "Check Network tab for failed API requests",
    "Test the wallet connection on other Solana dApps"
  ],

  quickFixes: [
    "Refresh the page",
    "Disconnect and reconnect the wallet",
    "Switch to a different wallet (Phantom → Solflare or vice versa)",
    "Clear browser cache and restart",
    "Update the wallet extension",
    "Try in an incognito/private browser window"
  ]
};

export function getWalletTroubleshootingSuggestions(diagnostics: any) {
  const suggestions: string[] = [];

  if (!diagnostics.walletExtensions?.phantom && !diagnostics.walletExtensions?.solflare) {
    suggestions.push("🚨 No wallet extensions detected. Install Phantom or Solflare wallet.");
  }

  if (!diagnostics.connectionChecks?.rpcWorking) {
    suggestions.push("🌐 RPC connection failed. Check your internet connection or try a different network.");
  }

  if (!diagnostics.browserChecks?.hasBuffer || !diagnostics.browserChecks?.hasProcess) {
    suggestions.push("⚙️ Browser polyfills missing. The app may not work properly.");
  }

  if (diagnostics.walletState?.availableWallets === 0) {
    suggestions.push("🔌 No wallets available. Make sure your wallet extension is enabled and unlocked.");
  }

  if (!diagnostics.walletState?.connected && diagnostics.walletState?.availableWallets > 0) {
    suggestions.push("🔗 Wallet detected but not connected. Click the wallet button to connect.");
  }

  if (suggestions.length === 0) {
    suggestions.push("✅ All checks passed. Wallet should be working properly.");
  }

  return suggestions;
}