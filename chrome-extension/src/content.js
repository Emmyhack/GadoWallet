// gado Wallet Chrome Extension - Content Script
// Injects wallet provider into web pages for dApp interaction

(function() {
    'use strict';

    console.log('🔗 gado Wallet content script loaded');

    // Check if we should inject wallet provider
    if (shouldInjectProvider()) {
        injectWalletProvider();
    }

    function shouldInjectProvider() {
        // Don't inject on extension pages or non-https pages
        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
            return false;
        }
        
        // Don't inject if another wallet is already present
        if (window.solana || window.phantom || window.solflare) {
            console.log('🚫 Another Solana wallet already detected');
            return false;
        }
        
        return true;
    }

    function injectWalletProvider() {
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('injected.js');
        script.onload = function() {
            this.remove();
        };
        
        // Inject before any other scripts
        (document.head || document.documentElement).appendChild(script);
        
        console.log('✅ gado Wallet provider injected');
    }

    // Listen for messages from injected script
    window.addEventListener('message', function(event) {
        // Only accept messages from same origin
        if (event.source !== window || event.origin !== window.location.origin) {
            return;
        }

        if (event.data && event.data.source === 'gada-wallet-injected') {
            handleInjectedMessage(event.data);
        }
    });

    async function handleInjectedMessage(message) {
        try {
            switch (message.type) {
                case 'CONNECT_REQUEST':
                    await handleConnectRequest(message);
                    break;
                
                case 'SIGN_TRANSACTION':
                    await handleSignTransaction(message);
                    break;
                
                case 'SIGN_ALL_TRANSACTIONS':
                    await handleSignAllTransactions(message);
                    break;
                
                case 'SIGN_MESSAGE':
                    await handleSignMessage(message);
                    break;
                
                case 'GET_ACCOUNT':
                    await handleGetAccount(message);
                    break;
                
                default:
                    console.warn('Unknown message type:', message.type);
            }
        } catch (error) {
            console.error('Content script message handling error:', error);
            
            // Send error response back to injected script
            window.postMessage({
                source: 'gada-wallet-content',
                type: message.type + '_RESPONSE',
                requestId: message.requestId,
                error: error.message
            }, window.location.origin);
        }
    }

    async function handleConnectRequest(message) {
        try {
            // Request connection approval from user
            const response = await chrome.runtime.sendMessage({
                type: 'DAPP_CONNECT_REQUEST',
                origin: window.location.origin,
                name: message.appName || document.title,
                icon: message.appIcon || getFaviconUrl()
            });

            if (response.success) {
                // Send successful connection response
                window.postMessage({
                    source: 'gada-wallet-content',
                    type: 'CONNECT_RESPONSE',
                    requestId: message.requestId,
                    publicKey: response.publicKey,
                    success: true
                }, window.location.origin);
                
                // Store connection for this origin
                await storeConnection(window.location.origin, {
                    name: message.appName || document.title,
                    icon: message.appIcon || getFaviconUrl(),
                    connectedAt: Date.now()
                });
                
            } else {
                throw new Error(response.error || 'Connection rejected');
            }
            
        } catch (error) {
            window.postMessage({
                source: 'gada-wallet-content',
                type: 'CONNECT_RESPONSE',
                requestId: message.requestId,
                error: error.message,
                success: false
            }, window.location.origin);
        }
    }

    async function handleSignTransaction(message) {
        try {
            // Check if origin is connected
            const isConnected = await checkConnection(window.location.origin);
            if (!isConnected) {
                throw new Error('Not connected to this dApp');
            }

            // Request transaction signing
            const response = await chrome.runtime.sendMessage({
                type: 'DAPP_SIGN_TRANSACTION',
                origin: window.location.origin,
                transaction: message.transaction,
                message: message.message
            });

            if (response.success) {
                window.postMessage({
                    source: 'gada-wallet-content',
                    type: 'SIGN_TRANSACTION_RESPONSE',
                    requestId: message.requestId,
                    signature: response.signature,
                    publicKey: response.publicKey,
                    success: true
                }, window.location.origin);
            } else {
                throw new Error(response.error || 'Transaction signing failed');
            }
            
        } catch (error) {
            window.postMessage({
                source: 'gada-wallet-content',
                type: 'SIGN_TRANSACTION_RESPONSE',
                requestId: message.requestId,
                error: error.message,
                success: false
            }, window.location.origin);
        }
    }

    async function handleSignAllTransactions(message) {
        try {
            const isConnected = await checkConnection(window.location.origin);
            if (!isConnected) {
                throw new Error('Not connected to this dApp');
            }

            const response = await chrome.runtime.sendMessage({
                type: 'DAPP_SIGN_ALL_TRANSACTIONS',
                origin: window.location.origin,
                transactions: message.transactions,
                message: message.message
            });

            if (response.success) {
                window.postMessage({
                    source: 'gada-wallet-content',
                    type: 'SIGN_ALL_TRANSACTIONS_RESPONSE',
                    requestId: message.requestId,
                    signatures: response.signatures,
                    publicKey: response.publicKey,
                    success: true
                }, window.location.origin);
            } else {
                throw new Error(response.error || 'Transaction signing failed');
            }
            
        } catch (error) {
            window.postMessage({
                source: 'gada-wallet-content',
                type: 'SIGN_ALL_TRANSACTIONS_RESPONSE',
                requestId: message.requestId,
                error: error.message,
                success: false
            }, window.location.origin);
        }
    }

    async function handleSignMessage(message) {
        try {
            const isConnected = await checkConnection(window.location.origin);
            if (!isConnected) {
                throw new Error('Not connected to this dApp');
            }

            const response = await chrome.runtime.sendMessage({
                type: 'DAPP_SIGN_MESSAGE',
                origin: window.location.origin,
                message: message.message,
                display: message.display
            });

            if (response.success) {
                window.postMessage({
                    source: 'gada-wallet-content',
                    type: 'SIGN_MESSAGE_RESPONSE',
                    requestId: message.requestId,
                    signature: response.signature,
                    publicKey: response.publicKey,
                    success: true
                }, window.location.origin);
            } else {
                throw new Error(response.error || 'Message signing failed');
            }
            
        } catch (error) {
            window.postMessage({
                source: 'gada-wallet-content',
                type: 'SIGN_MESSAGE_RESPONSE',
                requestId: message.requestId,
                error: error.message,
                success: false
            }, window.location.origin);
        }
    }

    async function handleGetAccount(message) {
        try {
            const isConnected = await checkConnection(window.location.origin);
            if (!isConnected) {
                throw new Error('Not connected to this dApp');
            }

            const response = await chrome.runtime.sendMessage({
                type: 'GET_WALLET_STATUS'
            });

            if (response.success && response.isConnected) {
                window.postMessage({
                    source: 'gada-wallet-content',
                    type: 'GET_ACCOUNT_RESPONSE',
                    requestId: message.requestId,
                    publicKey: response.wallet.publicKey,
                    success: true
                }, window.location.origin);
            } else {
                throw new Error('Wallet not connected');
            }
            
        } catch (error) {
            window.postMessage({
                source: 'gada-wallet-content',
                type: 'GET_ACCOUNT_RESPONSE',
                requestId: message.requestId,
                error: error.message,
                success: false
            }, window.location.origin);
        }
    }

    async function checkConnection(origin) {
        try {
            const result = await chrome.storage.local.get(['dappConnections']);
            const connections = result.dappConnections || {};
            return !!connections[origin];
        } catch (error) {
            console.error('Connection check error:', error);
            return false;
        }
    }

    async function storeConnection(origin, connectionData) {
        try {
            const result = await chrome.storage.local.get(['dappConnections']);
            const connections = result.dappConnections || {};
            
            connections[origin] = connectionData;
            
            await chrome.storage.local.set({ dappConnections: connections });
        } catch (error) {
            console.error('Store connection error:', error);
        }
    }

    function getFaviconUrl() {
        const favicon = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
        if (favicon) {
            return favicon.href;
        }
        
        // Default favicon location
        return `${window.location.origin}/favicon.ico`;
    }

    // Listen for wallet events from background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'WALLET_DISCONNECTED') {
            // Notify dApp that wallet was disconnected
            window.postMessage({
                source: 'gada-wallet-content',
                type: 'WALLET_DISCONNECTED'
            }, window.location.origin);
        }
        
        if (message.type === 'ACCOUNT_CHANGED') {
            // Notify dApp about account change
            window.postMessage({
                source: 'gada-wallet-content',
                type: 'ACCOUNT_CHANGED',
                publicKey: message.publicKey
            }, window.location.origin);
        }
        
        if (message.type === 'NETWORK_CHANGED') {
            // Notify dApp about network change
            window.postMessage({
                source: 'gada-wallet-content',
                type: 'NETWORK_CHANGED',
                network: message.network
            }, window.location.origin);
        }
    });

    // Auto-connect to previously connected dApps
    async function autoConnect() {
        try {
            const isConnected = await checkConnection(window.location.origin);
            if (isConnected) {
                // Get current wallet status
                const response = await chrome.runtime.sendMessage({
                    type: 'GET_WALLET_STATUS'
                });

                if (response.success && response.isConnected) {
                    // Notify dApp about auto-connection
                    window.postMessage({
                        source: 'gada-wallet-content',
                        type: 'AUTO_CONNECTED',
                        publicKey: response.wallet.publicKey
                    }, window.location.origin);
                }
            }
        } catch (error) {
            console.error('Auto-connect error:', error);
        }
    }

    // Run auto-connect after a short delay to ensure dApp is ready
    setTimeout(autoConnect, 1000);

    // Clean up disconnected dApps periodically
    setInterval(async () => {
        try {
            const result = await chrome.storage.local.get(['dappConnections']);
            const connections = result.dappConnections || {};
            
            // Remove connections older than 30 days
            const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
            let hasChanges = false;
            
            for (const [origin, connection] of Object.entries(connections)) {
                if (connection.connectedAt < thirtyDaysAgo) {
                    delete connections[origin];
                    hasChanges = true;
                }
            }
            
            if (hasChanges) {
                await chrome.storage.local.set({ dappConnections: connections });
            }
            
        } catch (error) {
            console.error('Connection cleanup error:', error);
        }
    }, 60000); // Check every minute

})();