// gado Wallet Chrome Extension - Popup Script
// Handles the main wallet interface and user interactions

class gadoWalletPopup {
    constructor() {
        this.wallet = null;
        this.network = 'devnet';
        this.isConnected = false;
        this.currentTab = 'dashboard';
        
        this.init();
    }

    async init() {
        await this.loadSettings();
        this.setupEventListeners();
        this.setupTabNavigation();
        await this.checkWalletConnection();
        this.startAutoRefresh();
    }

    async loadSettings() {
        const settings = await chrome.storage.local.get([
            'network', 'autoLockTimer', 'keeperNotifications', 'confirmationCount'
        ]);
        
        this.network = settings.network || 'devnet';
        document.getElementById('networkSelect').value = this.network;
        document.getElementById('autoLockTimer').value = settings.autoLockTimer || '900';
        document.getElementById('keeperNotifications').checked = settings.keeperNotifications !== false;
        document.getElementById('confirmationCount').value = settings.confirmationCount || '3';
    }

    setupEventListeners() {
        // Wallet Connection
        document.getElementById('connectWallet').addEventListener('click', () => this.connectWallet());
        
        // Network Selection
        document.getElementById('networkSelect').addEventListener('change', (e) => this.switchNetwork(e.target.value));
        
        // Quick Actions
        document.getElementById('sendBtn').addEventListener('click', () => this.openSendModal());
        document.getElementById('receiveBtn').addEventListener('click', () => this.openReceiveModal());
        document.getElementById('addHeirBtn').addEventListener('click', () => this.openInheritanceSetup());
        document.getElementById('viewKeeper').addEventListener('click', () => this.viewKeeperStatus());
        
        // Balance Refresh
        document.getElementById('refreshBalance').addEventListener('click', () => this.refreshBalance());
        document.getElementById('copyAddress').addEventListener('click', () => this.copyAddress());
        
        // Inheritance Setup
        document.getElementById('createInheritanceBtn').addEventListener('click', () => this.openInheritanceSetup());
        document.getElementById('setupFirstInheritance').addEventListener('click', () => this.openInheritanceSetup());
        
        // Modal Controls
        this.setupModalControls();
        
        // Settings
        this.setupSettingsControls();
    }

    setupModalControls() {
        // Send Modal
        document.getElementById('cancelSend').addEventListener('click', () => this.closeSendModal());
        document.getElementById('confirmSend').addEventListener('click', () => this.processSendTransaction());
        
        // Receive Modal
        document.getElementById('closeReceive').addEventListener('click', () => this.closeReceiveModal());
        document.getElementById('copyReceiveAddress').addEventListener('click', () => this.copyReceiveAddress());
        
        // Close modals when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeAllModals();
                }
            });
        });
        
        // Close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => this.closeAllModals());
        });
    }

    setupSettingsControls() {
        document.getElementById('autoLockTimer').addEventListener('change', (e) => {
            chrome.storage.local.set({ autoLockTimer: e.target.value });
        });
        
        document.getElementById('keeperNotifications').addEventListener('change', (e) => {
            chrome.storage.local.set({ keeperNotifications: e.target.checked });
        });
        
        document.getElementById('confirmationCount').addEventListener('change', (e) => {
            chrome.storage.local.set({ confirmationCount: e.target.value });
        });
        
        document.getElementById('exportWallet').addEventListener('click', () => this.exportWallet());
        document.getElementById('resetWallet').addEventListener('click', () => this.resetWallet());
    }

    setupTabNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        const tabPanes = document.querySelectorAll('.tab-pane');
        
        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;
                
                // Update active nav button
                navButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update active tab pane
                tabPanes.forEach(pane => pane.classList.remove('active'));
                document.getElementById(tabName).classList.add('active');
                
                this.currentTab = tabName;
                this.loadTabContent(tabName);
            });
        });
    }

    async loadTabContent(tabName) {
        switch(tabName) {
            case 'dashboard':
                await this.loadDashboard();
                break;
            case 'inheritance':
                await this.loadInheritanceTab();
                break;
            case 'transactions':
                await this.loadTransactions();
                break;
            case 'settings':
                // Settings are static, no need to load
                break;
        }
    }

    async connectWallet() {
        try {
            this.showLoading('Connecting wallet...');
            
            // Send message to background script to connect wallet
            const response = await chrome.runtime.sendMessage({
                type: 'CONNECT_WALLET',
                network: this.network
            });
            
            if (response.success) {
                this.wallet = response.wallet;
                this.isConnected = true;
                await this.updateWalletUI();
                await this.loadDashboard();
                this.showNotification('Wallet connected successfully!', 'success');
            } else {
                throw new Error(response.error || 'Failed to connect wallet');
            }
        } catch (error) {
            console.error('Wallet connection error:', error);
            this.showNotification('Failed to connect wallet: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async switchNetwork(network) {
        if (network === this.network) return;
        
        try {
            this.showLoading('Switching network...');
            
            const response = await chrome.runtime.sendMessage({
                type: 'SWITCH_NETWORK',
                network: network
            });
            
            if (response.success) {
                this.network = network;
                await chrome.storage.local.set({ network });
                
                if (this.isConnected) {
                    await this.refreshBalance();
                    await this.loadTabContent(this.currentTab);
                }
                
                this.showNotification(`Switched to ${network}`, 'success');
            } else {
                throw new Error(response.error || 'Failed to switch network');
            }
        } catch (error) {
            console.error('Network switch error:', error);
            this.showNotification('Failed to switch network: ' + error.message, 'error');
            document.getElementById('networkSelect').value = this.network;
        } finally {
            this.hideLoading();
        }
    }

    async checkWalletConnection() {
        try {
            const response = await chrome.runtime.sendMessage({
                type: 'GET_WALLET_STATUS'
            });
            
            if (response.success && response.isConnected) {
                this.wallet = response.wallet;
                this.isConnected = true;
                this.network = response.network || 'devnet';
                document.getElementById('networkSelect').value = this.network;
                await this.updateWalletUI();
                await this.loadDashboard();
            } else {
                this.showDisconnectedState();
            }
        } catch (error) {
            console.error('Wallet status check error:', error);
            this.showDisconnectedState();
        }
    }

    async updateWalletUI() {
        if (!this.wallet || !this.isConnected) {
            this.showDisconnectedState();
            return;
        }
        
        // Update address display
        const shortAddress = this.shortenAddress(this.wallet.publicKey);
        document.getElementById('walletAddress').textContent = shortAddress;
        document.getElementById('receiveAddress').value = this.wallet.publicKey;
        
        // Show connected state
        document.getElementById('disconnectedState').classList.add('hidden');
        document.getElementById('connectedState').classList.remove('hidden');
        document.getElementById('mainNav').classList.remove('hidden');
        
        // Update balance
        await this.refreshBalance();
    }

    showDisconnectedState() {
        document.getElementById('disconnectedState').classList.remove('hidden');
        document.getElementById('connectedState').classList.add('hidden');
        document.getElementById('mainNav').classList.add('hidden');
        this.isConnected = false;
    }

    async refreshBalance() {
        if (!this.isConnected) return;
        
        try {
            const response = await chrome.runtime.sendMessage({
                type: 'GET_BALANCE'
            });
            
            if (response.success) {
                const balance = response.balance.toFixed(4);
                document.getElementById('solBalance').textContent = `${balance} SOL`;
                document.getElementById('totalBalance').textContent = `${balance} SOL`;
            }
        } catch (error) {
            console.error('Balance refresh error:', error);
        }
    }

    async loadDashboard() {
        if (!this.isConnected) return;
        
        try {
            // Load inheritance stats
            const inheritanceResponse = await chrome.runtime.sendMessage({
                type: 'GET_INHERITANCE_STATS'
            });
            
            if (inheritanceResponse.success) {
                const stats = inheritanceResponse.stats;
                document.getElementById('protectedAssets').textContent = `${stats.protectedSOL.toFixed(4)} SOL`;
                document.getElementById('activeHeirs').textContent = stats.totalHeirs;
            }
            
            // Load recent activity
            await this.loadRecentActivity();
            
        } catch (error) {
            console.error('Dashboard load error:', error);
        }
    }

    async loadInheritanceTab() {
        if (!this.isConnected) return;
        
        try {
            const response = await chrome.runtime.sendMessage({
                type: 'GET_INHERITANCES'
            });
            
            if (response.success) {
                const inheritances = response.inheritances;
                
                // Update counts
                document.getElementById('solInheritanceCount').textContent = inheritances.sol.length;
                document.getElementById('tokenInheritanceCount').textContent = inheritances.tokens.length;
                
                // Render inheritance list
                this.renderInheritanceList(inheritances);
            }
        } catch (error) {
            console.error('Inheritance load error:', error);
        }
    }

    renderInheritanceList(inheritances) {
        const container = document.getElementById('inheritanceList');
        
        if (inheritances.sol.length === 0 && inheritances.tokens.length === 0) {
            // Show empty state
            return;
        }
        
        // Clear empty state
        container.innerHTML = '';
        
        // Render SOL inheritances
        inheritances.sol.forEach(inheritance => {
            container.appendChild(this.createInheritanceCard(inheritance, 'SOL'));
        });
        
        // Render token inheritances
        inheritances.tokens.forEach(inheritance => {
            container.appendChild(this.createInheritanceCard(inheritance, 'TOKEN'));
        });
    }

    createInheritanceCard(inheritance, type) {
        const card = document.createElement('div');
        card.className = 'inheritance-card';
        
        const statusClass = inheritance.isClaimed ? 'claimed' : 'active';
        const amount = type === 'SOL' 
            ? `${(inheritance.amount / 1000000000).toFixed(4)} SOL`
            : `${inheritance.amount} tokens`;
        
        card.innerHTML = `
            <div class="inheritance-header">
                <div class="inheritance-type">${type} Inheritance</div>
                <div class="inheritance-status ${statusClass}">
                    ${inheritance.isClaimed ? 'Claimed' : 'Active'}
                </div>
            </div>
            <div class="inheritance-details">
                <div class="detail-row">
                    <span class="detail-label">Heir:</span>
                    <span class="detail-value">${this.shortenAddress(inheritance.heir)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Amount:</span>
                    <span class="detail-value">${amount}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Inactivity Period:</span>
                    <span class="detail-value">${Math.floor(inheritance.inactivityPeriodSeconds / 86400)} days</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Last Activity:</span>
                    <span class="detail-value">${new Date(inheritance.lastActivity * 1000).toLocaleDateString()}</span>
                </div>
            </div>
            <div class="inheritance-actions">
                <button class="btn btn-secondary btn-sm" onclick="gadaWallet.updateActivity('${inheritance.address}')">
                    Update Activity
                </button>
                ${!inheritance.isClaimed ? `
                    <button class="btn btn-danger btn-sm" onclick="gadaWallet.cancelInheritance('${inheritance.address}')">
                        Cancel
                    </button>
                ` : ''}
            </div>
        `;
        
        return card;
    }

    async loadTransactions() {
        if (!this.isConnected) return;
        
        try {
            const response = await chrome.runtime.sendMessage({
                type: 'GET_TRANSACTIONS',
                limit: 20
            });
            
            if (response.success) {
                this.renderTransactionList(response.transactions);
            }
        } catch (error) {
            console.error('Transaction load error:', error);
        }
    }

    renderTransactionList(transactions) {
        const container = document.getElementById('transactionList');
        
        if (transactions.length === 0) {
            return; // Keep empty state
        }
        
        container.innerHTML = '';
        
        transactions.forEach(tx => {
            container.appendChild(this.createTransactionItem(tx));
        });
    }

    createTransactionItem(tx) {
        const item = document.createElement('div');
        item.className = 'transaction-item';
        
        const typeIcon = this.getTransactionIcon(tx.type);
        const amount = tx.type === 'inheritance' 
            ? `${(tx.amount / 1000000000).toFixed(4)} SOL`
            : `${(Math.abs(tx.amount) / 1000000000).toFixed(4)} SOL`;
        
        item.innerHTML = `
            <div class="tx-icon">${typeIcon}</div>
            <div class="tx-details">
                <div class="tx-title">${this.getTransactionTitle(tx)}</div>
                <div class="tx-subtitle">${new Date(tx.timestamp * 1000).toLocaleString()}</div>
            </div>
            <div class="tx-amount ${tx.amount > 0 ? 'positive' : 'negative'}">
                ${tx.amount > 0 ? '+' : ''}${amount}
            </div>
            <div class="tx-status ${tx.status}">
                ${tx.status}
            </div>
        `;
        
        item.addEventListener('click', () => {
            this.openTransactionDetails(tx);
        });
        
        return item;
    }

    getTransactionIcon(type) {
        switch(type) {
            case 'send': return '📤';
            case 'receive': return '📥';
            case 'inheritance': return '🏛️';
            case 'heir_setup': return '👨‍👩‍👧‍👦';
            default: return '📝';
        }
    }

    getTransactionTitle(tx) {
        switch(tx.type) {
            case 'send': return 'Sent SOL';
            case 'receive': return 'Received SOL';
            case 'inheritance': return 'Inheritance Setup';
            case 'heir_setup': return 'Heir Added';
            default: return 'Transaction';
        }
    }

    async loadRecentActivity() {
        try {
            const response = await chrome.runtime.sendMessage({
                type: 'GET_RECENT_ACTIVITY',
                limit: 5
            });
            
            if (response.success && response.activities.length > 0) {
                this.renderRecentActivity(response.activities);
            }
        } catch (error) {
            console.error('Recent activity load error:', error);
        }
    }

    renderRecentActivity(activities) {
        const container = document.getElementById('recentActivity');
        container.innerHTML = '';
        
        activities.forEach(activity => {
            container.appendChild(this.createActivityItem(activity));
        });
    }

    createActivityItem(activity) {
        const item = document.createElement('div');
        item.className = 'activity-item';
        
        item.innerHTML = `
            <div class="activity-icon">${this.getTransactionIcon(activity.type)}</div>
            <div class="activity-details">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-subtitle">${activity.subtitle}</div>
            </div>
        `;
        
        return item;
    }

    // Modal Functions
    openSendModal() {
        document.getElementById('sendModal').classList.remove('hidden');
    }

    closeSendModal() {
        document.getElementById('sendModal').classList.add('hidden');
        this.clearSendForm();
    }

    openReceiveModal() {
        document.getElementById('receiveModal').classList.remove('hidden');
        this.generateQRCode();
    }

    closeReceiveModal() {
        document.getElementById('receiveModal').classList.add('hidden');
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
        this.clearSendForm();
    }

    clearSendForm() {
        document.getElementById('sendAddress').value = '';
        document.getElementById('sendAmount').value = '';
        document.getElementById('sendMemo').value = '';
    }

    generateQRCode() {
        // Simple QR code placeholder - in production, use a QR code library
        const qrContainer = document.getElementById('qrCode');
        qrContainer.innerHTML = `
            <div class="qr-placeholder">
                📱<br>
                QR Code<br>
                <small>Install QR library for real QR codes</small>
            </div>
        `;
    }

    async processSendTransaction() {
        const address = document.getElementById('sendAddress').value.trim();
        const amount = parseFloat(document.getElementById('sendAmount').value);
        const memo = document.getElementById('sendMemo').value.trim();
        
        if (!address || !amount || amount <= 0) {
            this.showNotification('Please enter a valid address and amount', 'error');
            return;
        }
        
        try {
            this.showLoading('Sending transaction...');
            
            const response = await chrome.runtime.sendMessage({
                type: 'SEND_TRANSACTION',
                to: address,
                amount: amount,
                memo: memo
            });
            
            if (response.success) {
                this.closeSendModal();
                this.showNotification('Transaction sent successfully!', 'success');
                await this.refreshBalance();
                await this.loadRecentActivity();
            } else {
                throw new Error(response.error || 'Transaction failed');
            }
        } catch (error) {
            console.error('Send transaction error:', error);
            this.showNotification('Failed to send transaction: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async openInheritanceSetup() {
        // Switch to inheritance tab and open setup modal
        document.querySelector('[data-tab="inheritance"]').click();
        
        // Open inheritance setup in new window/tab
        chrome.tabs.create({
            url: chrome.runtime.getURL('inheritance.html')
        });
    }

    async viewKeeperStatus() {
        try {
            const response = await chrome.runtime.sendMessage({
                type: 'GET_KEEPER_STATUS'
            });
            
            if (response.success) {
                this.showKeeperStatusModal(response.status);
            }
        } catch (error) {
            console.error('Keeper status error:', error);
            this.showNotification('Failed to get keeper status', 'error');
        }
    }

    showKeeperStatusModal(status) {
        // Create and show keeper status modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🤖 Keeper Bot Status</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="keeper-stats">
                        <div class="stat-row">
                            <span>Status:</span>
                            <span class="status-${status.isRunning ? 'active' : 'inactive'}">
                                ${status.isRunning ? 'Running' : 'Stopped'}
                            </span>
                        </div>
                        <div class="stat-row">
                            <span>SOL Heirs:</span>
                            <span>${status.totalSolHeirs} (${status.eligibleSolHeirs} eligible)</span>
                        </div>
                        <div class="stat-row">
                            <span>Token Heirs:</span>
                            <span>${status.totalTokenHeirs} (${status.eligibleTokenHeirs} eligible)</span>
                        </div>
                        <div class="stat-row">
                            <span>Protected Value:</span>
                            <span>${status.totalSolValue.toFixed(4)} SOL</span>
                        </div>
                        <div class="stat-row">
                            <span>Check Interval:</span>
                            <span>${status.checkInterval} minutes</span>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="this.closest('.modal').remove()">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.classList.remove('hidden');
        
        // Add close event
        modal.querySelector('.modal-close').onclick = () => modal.remove();
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
    }

    // Utility Functions
    copyAddress() {
        if (this.wallet) {
            navigator.clipboard.writeText(this.wallet.publicKey);
            this.showNotification('Address copied to clipboard!', 'success');
        }
    }

    copyReceiveAddress() {
        const address = document.getElementById('receiveAddress').value;
        navigator.clipboard.writeText(address);
        this.showNotification('Address copied to clipboard!', 'success');
    }

    shortenAddress(address) {
        if (!address) return '';
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    }

    showLoading(text = 'Loading...') {
        const overlay = document.getElementById('loadingOverlay');
        overlay.querySelector('.loading-text').textContent = text;
        overlay.classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loadingOverlay').classList.add('hidden');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Show with animation
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    startAutoRefresh() {
        // Refresh balance and data every 30 seconds
        setInterval(() => {
            if (this.isConnected) {
                this.refreshBalance();
                this.loadRecentActivity();
            }
        }, 30000);
    }

    // Settings Functions
    async exportWallet() {
        if (confirm('⚠️ Are you sure you want to export your private key? Keep it secure!')) {
            try {
                const response = await chrome.runtime.sendMessage({
                    type: 'EXPORT_WALLET'
                });
                
                if (response.success) {
                    // Create download link
                    const blob = new Blob([response.privateKey], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'gada-wallet-private-key.txt';
                    a.click();
                    URL.revokeObjectURL(url);
                    
                    this.showNotification('Private key exported successfully!', 'success');
                }
            } catch (error) {
                console.error('Export error:', error);
                this.showNotification('Failed to export private key', 'error');
            }
        }
    }

    async resetWallet() {
        if (confirm('⚠️ Are you sure you want to reset your wallet? This action cannot be undone!')) {
            if (confirm('🚨 Final confirmation: All wallet data will be deleted!')) {
                try {
                    const response = await chrome.runtime.sendMessage({
                        type: 'RESET_WALLET'
                    });
                    
                    if (response.success) {
                        this.showNotification('Wallet reset successfully!', 'success');
                        window.location.reload();
                    }
                } catch (error) {
                    console.error('Reset error:', error);
                    this.showNotification('Failed to reset wallet', 'error');
                }
            }
        }
    }

    // Public methods for global access
    async updateActivity(inheritanceAddress) {
        try {
            this.showLoading('Updating activity...');
            
            const response = await chrome.runtime.sendMessage({
                type: 'UPDATE_ACTIVITY',
                inheritanceAddress: inheritanceAddress
            });
            
            if (response.success) {
                this.showNotification('Activity updated successfully!', 'success');
                await this.loadInheritanceTab();
            } else {
                throw new Error(response.error || 'Failed to update activity');
            }
        } catch (error) {
            console.error('Update activity error:', error);
            this.showNotification('Failed to update activity: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    async cancelInheritance(inheritanceAddress) {
        if (confirm('Are you sure you want to cancel this inheritance?')) {
            try {
                this.showLoading('Cancelling inheritance...');
                
                const response = await chrome.runtime.sendMessage({
                    type: 'CANCEL_INHERITANCE',
                    inheritanceAddress: inheritanceAddress
                });
                
                if (response.success) {
                    this.showNotification('Inheritance cancelled successfully!', 'success');
                    await this.loadInheritanceTab();
                } else {
                    throw new Error(response.error || 'Failed to cancel inheritance');
                }
            } catch (error) {
                console.error('Cancel inheritance error:', error);
                this.showNotification('Failed to cancel inheritance: ' + error.message, 'error');
            } finally {
                this.hideLoading();
            }
        }
    }

    openTransactionDetails(tx) {
        // Create transaction details modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Transaction Details</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="tx-details-grid">
                        <div class="detail-row">
                            <span class="detail-label">Signature:</span>
                            <span class="detail-value">${this.shortenAddress(tx.signature)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Type:</span>
                            <span class="detail-value">${tx.type}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Amount:</span>
                            <span class="detail-value">${(Math.abs(tx.amount) / 1000000000).toFixed(9)} SOL</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Status:</span>
                            <span class="detail-value">${tx.status}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Timestamp:</span>
                            <span class="detail-value">${new Date(tx.timestamp * 1000).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="window.open('https://solscan.io/tx/${tx.signature}?cluster=${this.network}')">
                        View on Solscan
                    </button>
                    <button class="btn btn-primary" onclick="this.closest('.modal').remove()">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add close events
        modal.querySelector('.modal-close').onclick = () => modal.remove();
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
    }
}

// Initialize the popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.gadoWallet = new gadoWalletPopup();
});

// Export for global access
window.gadoWalletPopup = gadoWalletPopup;