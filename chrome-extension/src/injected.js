// gado Wallet Chrome Extension - Injected Script
// Provides Solana wallet interface to dApps

(function() {
    'use strict';

    // Don't inject if already present
    if (window.solana && window.solana.isgadoWallet) {
        console.log('🚫 gado Wallet already injected');
        return;
    }

    console.log('🔗 Injecting gado Wallet provider...');

    let requestId = 0;
    const pendingRequests = new Map();

    // Create gado Wallet provider
    class gadoWalletProvider {
        constructor() {
            this.isgadoWallet = true;
            this.isPhantom = false; // For compatibility
            this._publicKey = null;
            this._connected = false;
            this._connecting = false;
            this._readyState = 'NotDetected';
            
            this.setupMessageListener();
            this.checkAutoConnect();
        }

        get publicKey() {
            return this._publicKey;
        }

        get connected() {
            return this._connected;
        }

        get readyState() {
            return this._readyState;
        }

        setupMessageListener() {
            window.addEventListener('message', (event) => {
                if (event.source !== window || event.origin !== window.location.origin) {
                    return;
                }

                if (event.data && event.data.source === 'gada-wallet-content') {
                    this.handleMessage(event.data);
                }
            });
        }

        handleMessage(message) {
            switch (message.type) {
                case 'CONNECT_RESPONSE':
                    this.handleConnectResponse(message);
                    break;
                
                case 'SIGN_TRANSACTION_RESPONSE':
                    this.handleSignTransactionResponse(message);
                    break;
                
                case 'SIGN_ALL_TRANSACTIONS_RESPONSE':
                    this.handleSignAllTransactionsResponse(message);
                    break;
                
                case 'SIGN_MESSAGE_RESPONSE':
                    this.handleSignMessageResponse(message);
                    break;
                
                case 'GET_ACCOUNT_RESPONSE':
                    this.handleGetAccountResponse(message);
                    break;
                
                case 'AUTO_CONNECTED':
                    this.handleAutoConnected(message);
                    break;
                
                case 'WALLET_DISCONNECTED':
                    this.handleDisconnected();
                    break;
                
                case 'ACCOUNT_CHANGED':
                    this.handleAccountChanged(message);
                    break;
                
                case 'NETWORK_CHANGED':
                    this.handleNetworkChanged(message);
                    break;
            }
        }

        async connect(options = {}) {
            if (this._connected) {
                return { publicKey: this._publicKey };
            }

            if (this._connecting) {
                // Wait for existing connection attempt
                return new Promise((resolve, reject) => {
                    const checkConnection = () => {
                        if (this._connected) {
                            resolve({ publicKey: this._publicKey });
                        } else if (!this._connecting) {
                            reject(new Error('Connection failed'));
                        } else {
                            setTimeout(checkConnection, 100);
                        }
                    };
                    checkConnection();
                });
            }

            this._connecting = true;

            try {
                const requestData = {
                    source: 'gada-wallet-injected',
                    type: 'CONNECT_REQUEST',
                    requestId: ++requestId,
                    appName: options.name || document.title,
                    appIcon: options.icon || this.getFaviconUrl(),
                    onlyIfTrusted: options.onlyIfTrusted || false
                };

                const response = await this.sendRequest(requestData);
                
                if (response.success) {
                    this._publicKey = this.createPublicKey(response.publicKey);
                    this._connected = true;
                    this._readyState = 'Connected';
                    
                    this.emit('connect', this._publicKey);
                    
                    return { publicKey: this._publicKey };
                } else {
                    throw new Error(response.error || 'Connection failed');
                }
            } finally {
                this._connecting = false;
            }
        }

        async disconnect() {
            if (!this._connected) {
                return;
            }

            this._publicKey = null;
            this._connected = false;
            this._readyState = 'NotDetected';
            
            this.emit('disconnect');
        }

        async signTransaction(transaction) {
            if (!this._connected) {
                throw new Error('Wallet not connected');
            }

            const requestData = {
                source: 'gada-wallet-injected',
                type: 'SIGN_TRANSACTION',
                requestId: ++requestId,
                transaction: this.serializeTransaction(transaction),
                message: `Sign transaction from ${window.location.hostname}`
            };

            const response = await this.sendRequest(requestData);
            
            if (response.success) {
                return this.deserializeTransaction(response.signature);
            } else {
                throw new Error(response.error || 'Transaction signing failed');
            }
        }

        async signAllTransactions(transactions) {
            if (!this._connected) {
                throw new Error('Wallet not connected');
            }

            const requestData = {
                source: 'gada-wallet-injected',
                type: 'SIGN_ALL_TRANSACTIONS',
                requestId: ++requestId,
                transactions: transactions.map(tx => this.serializeTransaction(tx)),
                message: `Sign ${transactions.length} transactions from ${window.location.hostname}`
            };

            const response = await this.sendRequest(requestData);
            
            if (response.success) {
                return response.signatures.map(sig => this.deserializeTransaction(sig));
            } else {
                throw new Error(response.error || 'Transaction signing failed');
            }
        }

        async signMessage(message, display = 'utf8') {
            if (!this._connected) {
                throw new Error('Wallet not connected');
            }

            const requestData = {
                source: 'gada-wallet-injected',
                type: 'SIGN_MESSAGE',
                requestId: ++requestId,
                message: this.encodeMessage(message),
                display: display
            };

            const response = await this.sendRequest(requestData);
            
            if (response.success) {
                return {
                    signature: new Uint8Array(response.signature),
                    publicKey: this.createPublicKey(response.publicKey)
                };
            } else {
                throw new Error(response.error || 'Message signing failed');
            }
        }

        async request(method, params) {
            switch (method) {
                case 'connect':
                    return await this.connect(params);
                
                case 'disconnect':
                    return await this.disconnect();
                
                case 'signTransaction':
                    return await this.signTransaction(params.transaction);
                
                case 'signAllTransactions':
                    return await this.signAllTransactions(params.transactions);
                
                case 'signMessage':
                    return await this.signMessage(params.message, params.display);
                
                default:
                    throw new Error(`Unsupported method: ${method}`);
            }
        }

        // Event handling
        on(event, handler) {
            if (!this._eventHandlers) {
                this._eventHandlers = {};
            }
            if (!this._eventHandlers[event]) {
                this._eventHandlers[event] = [];
            }
            this._eventHandlers[event].push(handler);
        }

        off(event, handler) {
            if (!this._eventHandlers || !this._eventHandlers[event]) {
                return;
            }
            const index = this._eventHandlers[event].indexOf(handler);
            if (index > -1) {
                this._eventHandlers[event].splice(index, 1);
            }
        }

        emit(event, ...args) {
            if (!this._eventHandlers || !this._eventHandlers[event]) {
                return;
            }
            this._eventHandlers[event].forEach(handler => {
                try {
                    handler(...args);
                } catch (error) {
                    console.error('Event handler error:', error);
                }
            });
        }

        // Helper methods
        sendRequest(requestData) {
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    pendingRequests.delete(requestData.requestId);
                    reject(new Error('Request timeout'));
                }, 30000); // 30 second timeout

                pendingRequests.set(requestData.requestId, { resolve, reject, timeout });
                
                window.postMessage(requestData, window.location.origin);
            });
        }

        handleConnectResponse(message) {
            const request = pendingRequests.get(message.requestId);
            if (!request) return;

            clearTimeout(request.timeout);
            pendingRequests.delete(message.requestId);

            if (message.success) {
                request.resolve(message);
            } else {
                request.reject(new Error(message.error));
            }
        }

        handleSignTransactionResponse(message) {
            const request = pendingRequests.get(message.requestId);
            if (!request) return;

            clearTimeout(request.timeout);
            pendingRequests.delete(message.requestId);

            if (message.success) {
                request.resolve(message);
            } else {
                request.reject(new Error(message.error));
            }
        }

        handleSignAllTransactionsResponse(message) {
            const request = pendingRequests.get(message.requestId);
            if (!request) return;

            clearTimeout(request.timeout);
            pendingRequests.delete(message.requestId);

            if (message.success) {
                request.resolve(message);
            } else {
                request.reject(new Error(message.error));
            }
        }

        handleSignMessageResponse(message) {
            const request = pendingRequests.get(message.requestId);
            if (!request) return;

            clearTimeout(request.timeout);
            pendingRequests.delete(message.requestId);

            if (message.success) {
                request.resolve(message);
            } else {
                request.reject(new Error(message.error));
            }
        }

        handleGetAccountResponse(message) {
            const request = pendingRequests.get(message.requestId);
            if (!request) return;

            clearTimeout(request.timeout);
            pendingRequests.delete(message.requestId);

            if (message.success) {
                request.resolve(message);
            } else {
                request.reject(new Error(message.error));
            }
        }

        handleAutoConnected(message) {
            this._publicKey = this.createPublicKey(message.publicKey);
            this._connected = true;
            this._readyState = 'Connected';
            
            console.log('✅ Auto-connected to gado Wallet');
            this.emit('connect', this._publicKey);
        }

        handleDisconnected() {
            const wasConnected = this._connected;
            
            this._publicKey = null;
            this._connected = false;
            this._readyState = 'NotDetected';
            
            if (wasConnected) {
                this.emit('disconnect');
            }
        }

        handleAccountChanged(message) {
            const oldPublicKey = this._publicKey;
            this._publicKey = this.createPublicKey(message.publicKey);
            
            if (oldPublicKey && oldPublicKey.toString() !== this._publicKey.toString()) {
                this.emit('accountChanged', this._publicKey);
            }
        }

        handleNetworkChanged(message) {
            this.emit('networkChanged', message.network);
        }

        async checkAutoConnect() {
            try {
                const requestData = {
                    source: 'gada-wallet-injected',
                    type: 'GET_ACCOUNT',
                    requestId: ++requestId
                };

                const response = await this.sendRequest(requestData);
                
                if (response.success) {
                    this._publicKey = this.createPublicKey(response.publicKey);
                    this._connected = true;
                    this._readyState = 'Connected';
                }
            } catch (error) {
                // No auto-connect available
                this._readyState = 'NotDetected';
            }
        }

        createPublicKey(publicKeyString) {
            // Create a minimal PublicKey-like object
            return {
                toString: () => publicKeyString,
                toBase58: () => publicKeyString,
                toBuffer: () => {
                    // Simple base58 decode (for compatibility)
                    const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
                    let result = [];
                    let carry, j;
                    
                    for (let i = 0; i < publicKeyString.length; i++) {
                        carry = ALPHABET.indexOf(publicKeyString[i]);
                        if (carry < 0) throw new Error('Invalid character');
                        
                        for (j = 0; j < result.length; ++j) {
                            carry += result[j] * 58;
                            result[j] = carry & 255;
                            carry >>= 8;
                        }
                        
                        while (carry > 0) {
                            result.push(carry & 255);
                            carry >>= 8;
                        }
                    }
                    
                    return new Uint8Array(result.reverse());
                },
                equals: (other) => {
                    return publicKeyString === (other.toString ? other.toString() : other);
                }
            };
        }

        serializeTransaction(transaction) {
            // Convert transaction to serializable format
            if (transaction.serialize) {
                return Array.from(transaction.serialize({ requireAllSignatures: false }));
            } else if (transaction instanceof Uint8Array) {
                return Array.from(transaction);
            } else {
                throw new Error('Invalid transaction format');
            }
        }

        deserializeTransaction(signatureData) {
            // Create a transaction with signature
            return {
                signature: new Uint8Array(signatureData),
                publicKey: this._publicKey
            };
        }

        encodeMessage(message) {
            if (typeof message === 'string') {
                return Array.from(new TextEncoder().encode(message));
            } else if (message instanceof Uint8Array) {
                return Array.from(message);
            } else {
                throw new Error('Invalid message format');
            }
        }

        getFaviconUrl() {
            const favicon = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
            if (favicon) {
                return favicon.href;
            }
            return `${window.location.origin}/favicon.ico`;
        }
    }

    // Create and expose the wallet provider
    const gadoWallet = new gadoWalletProvider();

    // Make it available as window.solana for compatibility
    Object.defineProperty(window, 'solana', {
        value: gadoWallet,
        writable: false,
        configurable: false
    });

    // Also expose as gadoWallet for explicit access
    Object.defineProperty(window, 'gadoWallet', {
        value: gadoWallet,
        writable: false,
        configurable: false
    });

    // Dispatch ready event
    setTimeout(() => {
        window.dispatchEvent(new CustomEvent('gado-wallet-loaded', {
            detail: { gadoWallet }
        }));
        
        // Also dispatch standard Solana wallet events for compatibility
        window.dispatchEvent(new CustomEvent('solana-wallet-loaded', {
            detail: { solana: gadoWallet }
        }));
        
        console.log('✅ gado Wallet provider ready');
    }, 100);

})();