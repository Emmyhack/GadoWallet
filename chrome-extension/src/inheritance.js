// gado Wallet Chrome Extension - Inheritance Setup Script
// Handles the inheritance setup process

class InheritanceSetup {
    constructor() {
        this.currentStep = 1;
        this.selectedType = null;
        this.inheritanceConfig = {};
        this.wallet = null;
        this.network = 'devnet';
        
        this.init();
    }

    async init() {
        await this.checkWalletStatus();
        this.setupEventListeners();
        this.updateStepUI();
        await this.loadWalletBalance();
    }

    async checkWalletStatus() {
        try {
            const response = await chrome.runtime.sendMessage({
                type: 'GET_WALLET_STATUS'
            });
            
            if (response.success && response.isConnected) {
                this.wallet = response.wallet;
                this.network = response.network || 'devnet';
                document.getElementById('networkIndicator').textContent = 
                    this.network.charAt(0).toUpperCase() + this.network.slice(1);
            } else {
                this.showError('Wallet not connected. Please connect your wallet first.');
                setTimeout(() => {
                    window.close();
                }, 3000);
            }
        } catch (error) {
            console.error('Wallet status check error:', error);
            this.showError('Failed to check wallet status');
        }
    }

    setupEventListeners() {
        // Back button
        document.getElementById('backButton').addEventListener('click', () => {
            window.close();
        });

        // Type selection
        document.querySelectorAll('.select-type').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectedType = e.target.dataset.type;
                this.nextStep();
            });
        });

        // Navigation buttons
        document.getElementById('prevStep').addEventListener('click', () => this.prevStep());
        document.getElementById('nextStep').addEventListener('click', () => this.nextStep());
        document.getElementById('prevStep2').addEventListener('click', () => this.prevStep());
        document.getElementById('createInheritance').addEventListener('click', () => this.createInheritance());

        // Success actions
        document.getElementById('backToWallet').addEventListener('click', () => window.close());
        document.getElementById('viewExplorer').addEventListener('click', () => this.viewOnExplorer());

        // Form inputs
        this.setupFormInputs();
    }

    setupFormInputs() {
        // SOL form inputs
        document.getElementById('heirAddress').addEventListener('input', () => this.updateSummary());
        document.getElementById('solAmount').addEventListener('input', () => this.updateSummary());
        document.getElementById('inactivityPeriod').addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                document.getElementById('customPeriodGroup').classList.remove('hidden');
            } else {
                document.getElementById('customPeriodGroup').classList.add('hidden');
            }
            this.updateSummary();
        });
        document.getElementById('customDays').addEventListener('input', () => this.updateSummary());

        // Token form inputs
        document.getElementById('tokenHeirAddress').addEventListener('input', () => this.updateTokenSummary());
        document.getElementById('tokenMint').addEventListener('input', () => this.updateTokenSummary());
        document.getElementById('tokenAmount').addEventListener('input', () => this.updateTokenSummary());
        document.getElementById('tokenInactivityPeriod').addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                document.getElementById('tokenCustomPeriodGroup').classList.remove('hidden');
            } else {
                document.getElementById('tokenCustomPeriodGroup').classList.add('hidden');
            }
            this.updateTokenSummary();
        });
        document.getElementById('tokenCustomDays').addEventListener('input', () => this.updateTokenSummary());
    }

    async loadWalletBalance() {
        if (!this.wallet) return;
        
        try {
            const response = await chrome.runtime.sendMessage({
                type: 'GET_BALANCE'
            });
            
            if (response.success) {
                const balance = response.balance.toFixed(4);
                document.getElementById('availableBalance').textContent = `${balance} SOL`;
            }
        } catch (error) {
            console.error('Balance load error:', error);
        }
    }

    nextStep() {
        if (this.currentStep === 1) {
            if (!this.selectedType) {
                this.showError('Please select an inheritance type');
                return;
            }
            this.setupStep2();
        } else if (this.currentStep === 2) {
            if (!this.validateStep2()) {
                return;
            }
            this.setupStep3();
        }
        
        this.currentStep++;
        this.updateStepUI();
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepUI();
        }
    }

    updateStepUI() {
        // Update progress indicators
        document.querySelectorAll('.step').forEach((step, index) => {
            if (index + 1 <= this.currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        // Update step content
        document.querySelectorAll('.setup-step').forEach((step, index) => {
            if (index + 1 === this.currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }

    setupStep2() {
        if (this.selectedType === 'SOL') {
            document.getElementById('step2Title').textContent = 'Configure SOL Inheritance';
            document.getElementById('solConfig').style.display = 'block';
            document.getElementById('tokenConfig').style.display = 'none';
        } else if (this.selectedType === 'TOKEN') {
            document.getElementById('step2Title').textContent = 'Configure Token Inheritance';
            document.getElementById('solConfig').style.display = 'none';
            document.getElementById('tokenConfig').style.display = 'block';
        }
    }

    validateStep2() {
        if (this.selectedType === 'SOL') {
            const heirAddress = document.getElementById('heirAddress').value.trim();
            const amount = parseFloat(document.getElementById('solAmount').value);
            
            if (!heirAddress) {
                this.showError('Please enter heir wallet address');
                return false;
            }
            
            if (!this.validateSolanaAddress(heirAddress)) {
                this.showError('Invalid Solana address format');
                return false;
            }
            
            if (!amount || amount <= 0) {
                this.showError('Please enter a valid SOL amount');
                return false;
            }
            
            // Store configuration
            this.inheritanceConfig = {
                type: 'SOL',
                heirAddress,
                amount,
                inactivityDays: this.getInactivityDays('inactivityPeriod', 'customDays')
            };
            
        } else if (this.selectedType === 'TOKEN') {
            const heirAddress = document.getElementById('tokenHeirAddress').value.trim();
            const tokenMint = document.getElementById('tokenMint').value.trim();
            const amount = parseFloat(document.getElementById('tokenAmount').value);
            
            if (!heirAddress) {
                this.showError('Please enter heir wallet address');
                return false;
            }
            
            if (!this.validateSolanaAddress(heirAddress)) {
                this.showError('Invalid heir address format');
                return false;
            }
            
            if (!tokenMint) {
                this.showError('Please enter token mint address');
                return false;
            }
            
            if (!this.validateSolanaAddress(tokenMint)) {
                this.showError('Invalid token mint address format');
                return false;
            }
            
            if (!amount || amount <= 0) {
                this.showError('Please enter a valid token amount');
                return false;
            }
            
            // Store configuration
            this.inheritanceConfig = {
                type: 'TOKEN',
                heirAddress,
                tokenMint,
                amount,
                inactivityDays: this.getInactivityDays('tokenInactivityPeriod', 'tokenCustomDays')
            };
        }
        
        return true;
    }

    setupStep3() {
        const detailsContainer = document.getElementById('confirmationDetails');
        
        if (this.selectedType === 'SOL') {
            document.getElementById('confirmIcon').textContent = '◎';
            document.getElementById('confirmTitle').textContent = 'SOL Inheritance Configuration';
            
            detailsContainer.innerHTML = `
                <div class="detail-row">
                    <span class="detail-label">Type:</span>
                    <span class="detail-value">SOL Inheritance</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Amount:</span>
                    <span class="detail-value">${this.inheritanceConfig.amount} SOL</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Heir Address:</span>
                    <span class="detail-value">${this.shortenAddress(this.inheritanceConfig.heirAddress)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Inactivity Period:</span>
                    <span class="detail-value">${this.inheritanceConfig.inactivityDays} days</span>
                </div>
            `;
        } else if (this.selectedType === 'TOKEN') {
            document.getElementById('confirmIcon').textContent = '🪙';
            document.getElementById('confirmTitle').textContent = 'Token Inheritance Configuration';
            
            detailsContainer.innerHTML = `
                <div class="detail-row">
                    <span class="detail-label">Type:</span>
                    <span class="detail-value">Token Inheritance</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Token Mint:</span>
                    <span class="detail-value">${this.shortenAddress(this.inheritanceConfig.tokenMint)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Amount:</span>
                    <span class="detail-value">${this.inheritanceConfig.amount} tokens</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Heir Address:</span>
                    <span class="detail-value">${this.shortenAddress(this.inheritanceConfig.heirAddress)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Inactivity Period:</span>
                    <span class="detail-value">${this.inheritanceConfig.inactivityDays} days</span>
                </div>
            `;
        }
    }

    async createInheritance() {
        try {
            // Show loading
            this.showLoading('Creating inheritance...');
            const createBtn = document.getElementById('createInheritance');
            createBtn.querySelector('.btn-text').classList.add('hidden');
            createBtn.querySelector('.btn-loader').classList.remove('hidden');
            createBtn.disabled = true;
            
            const response = await chrome.runtime.sendMessage({
                type: 'CREATE_INHERITANCE',
                ...this.inheritanceConfig
            });
            
            if (response.success) {
                this.showSuccess(response.signature, response.heirAddress);
            } else {
                throw new Error(response.error || 'Failed to create inheritance');
            }
            
        } catch (error) {
            console.error('Create inheritance error:', error);
            this.showError('Failed to create inheritance: ' + error.message);
            
            // Reset button
            const createBtn = document.getElementById('createInheritance');
            createBtn.querySelector('.btn-text').classList.remove('hidden');
            createBtn.querySelector('.btn-loader').classList.add('hidden');
            createBtn.disabled = false;
        } finally {
            this.hideLoading();
        }
    }

    showSuccess(signature, heirAddress) {
        // Hide current step and show success
        document.querySelectorAll('.setup-step').forEach(step => step.classList.remove('active'));
        document.getElementById('stepSuccess').style.display = 'block';
        
        // Update success details
        document.getElementById('successTxId').textContent = this.shortenAddress(signature);
        document.getElementById('successHeirAddress').textContent = this.shortenAddress(heirAddress);
        
        this.successSignature = signature;
    }

    updateSummary() {
        const heirAddress = document.getElementById('heirAddress').value.trim();
        const amount = document.getElementById('solAmount').value;
        const days = this.getInactivityDays('inactivityPeriod', 'customDays');
        
        document.getElementById('summaryAmount').textContent = amount ? `${amount} SOL` : '0 SOL';
        document.getElementById('summaryHeir').textContent = heirAddress ? this.shortenAddress(heirAddress) : 'Not set';
        document.getElementById('summaryPeriod').textContent = `${days} days`;
    }

    updateTokenSummary() {
        const heirAddress = document.getElementById('tokenHeirAddress').value.trim();
        const amount = document.getElementById('tokenAmount').value;
        const tokenMint = document.getElementById('tokenMint').value.trim();
        const days = this.getInactivityDays('tokenInactivityPeriod', 'tokenCustomDays');
        
        document.getElementById('tokenSummaryAmount').textContent = amount ? `${amount} tokens` : '0 tokens';
        document.getElementById('tokenSummaryHeir').textContent = heirAddress ? this.shortenAddress(heirAddress) : 'Not set';
        document.getElementById('tokenSummaryMint').textContent = tokenMint ? this.shortenAddress(tokenMint) : 'Not set';
        document.getElementById('tokenSummaryPeriod').textContent = `${days} days`;
    }

    getInactivityDays(selectId, customId) {
        const select = document.getElementById(selectId);
        const customInput = document.getElementById(customId);
        
        if (select.value === 'custom') {
            return parseInt(customInput.value) || 30;
        } else {
            return parseInt(select.value) || 30;
        }
    }

    validateSolanaAddress(address) {
        // Basic Solana address validation (44 characters, base58)
        if (!address || address.length !== 44) {
            return false;
        }
        
        const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
        return base58Regex.test(address);
    }

    shortenAddress(address) {
        if (!address) return '';
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    }

    viewOnExplorer() {
        if (this.successSignature) {
            const explorerUrl = this.network === 'mainnet-beta' 
                ? `https://solscan.io/tx/${this.successSignature}`
                : `https://solscan.io/tx/${this.successSignature}?cluster=${this.network}`;
            
            window.open(explorerUrl, '_blank');
        }
    }

    showLoading(message = 'Loading...') {
        const overlay = document.getElementById('loadingOverlay');
        overlay.querySelector('.loading-text').textContent = message;
        overlay.classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loadingOverlay').classList.add('hidden');
    }

    showError(message) {
        // Create error notification
        const notification = document.createElement('div');
        notification.className = 'notification notification-error';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">❌</span>
                <span class="notification-message">${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Show with animation
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto remove
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    showSuccess(message) {
        // Create success notification
        const notification = document.createElement('div');
        notification.className = 'notification notification-success';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">✅</span>
                <span class="notification-message">${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Show with animation
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto remove
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.inheritanceSetup = new InheritanceSetup();
});