// LumaQR QR Code Generator
class LumaQRGenerator {
    constructor() {
        this.cryptoManager = new CryptoManager();
        this.currentQRSystem = null;
    }

    async generateQR(text, password = null, container) {
        try {
            // Show loading state
            this.showLoading(container);

            // Encrypt the data
            const encryptedData = await this.cryptoManager.encrypt(text, password);
            
            // Store encrypted data for potential scanning
            this.currentEncryptedData = encryptedData;
            
            // Clear loading state
            this.hideLoading(container);
            
            // Create 3D particle QR system
            this.currentQRSystem = new QRParticleSystem(container, encryptedData);
            
            return {
                success: true,
                encryptedData: encryptedData,
                password: encryptedData.password
            };
            
        } catch (error) {
            console.error('QR Generation error:', error);
            this.hideLoading(container);
            this.showError(container, error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    showLoading(container) {
        container.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p class="loading-text">Encrypting and generating your LumaQR QR...</p>
            </div>
        `;
        
        // Add loading styles
        const style = document.createElement('style');
        style.textContent = `
            .loading-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100%;
                color: white;
            }
            
            .loading-spinner {
                width: 50px;
                height: 50px;
                border: 3px solid rgba(255, 255, 255, 0.3);
                border-top: 3px solid white;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-bottom: 20px;
            }
            
            .loading-text {
                font-size: 1.1rem;
                text-align: center;
                opacity: 0.9;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        
        if (!document.querySelector('#loading-styles')) {
            style.id = 'loading-styles';
            document.head.appendChild(style);
        }
    }

    hideLoading(container) {
        container.innerHTML = '';
    }

    showError(container, message) {
        container.innerHTML = `
            <div class="error-container">
                <div class="error-icon">⚠️</div>
                <p class="error-message">${message}</p>
                <button class="retry-btn" onclick="location.reload()">Try Again</button>
            </div>
        `;
        
        // Add error styles
        const style = document.createElement('style');
        style.textContent = `
            .error-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100%;
                color: white;
                text-align: center;
                padding: 20px;
            }
            
            .error-icon {
                font-size: 3rem;
                margin-bottom: 16px;
            }
            
            .error-message {
                font-size: 1.1rem;
                margin-bottom: 20px;
                opacity: 0.9;
            }
            
            .retry-btn {
                padding: 12px 24px;
                background: rgba(255, 255, 255, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 8px;
                color: white;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .retry-btn:hover {
                background: rgba(255, 255, 255, 0.3);
            }
        `;
        
        if (!document.querySelector('#error-styles')) {
            style.id = 'error-styles';
            document.head.appendChild(style);
        }
    }

    // Get current encrypted data for scanning
    getCurrentEncryptedData() {
        return this.currentEncryptedData;
    }

    // Destroy current QR system
    destroy() {
        if (this.currentQRSystem) {
            this.currentQRSystem.destroy();
            this.currentQRSystem = null;
        }
    }

    // Export encrypted data as base64 for sharing
    exportData() {
        if (!this.currentEncryptedData) {
            throw new Error('No QR data to export');
        }
        return this.cryptoManager.packageToBase64(this.currentEncryptedData);
    }

    // Import encrypted data from base64
    importData(base64String) {
        try {
            return this.cryptoManager.base64ToPackage(base64String);
        } catch (error) {
            throw new Error('Invalid QR data format');
        }
    }
}

// QR Scanner class
class LumaQRScanner {
    constructor() {
        this.cryptoManager = new CryptoManager();
    }

    async scanQR(encryptedData, password) {
        try {
            const decryptedText = await this.cryptoManager.decrypt(encryptedData, password);
            return {
                success: true,
                text: decryptedText
            };
        } catch (error) {
            console.error('Scan error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Scan from base64 string
    async scanFromBase64(base64String, password) {
        try {
            const encryptedData = this.cryptoManager.base64ToPackage(base64String);
            return await this.scanQR(encryptedData, password);
        } catch (error) {
            console.error('Scan from base64 error:', error);
            return {
                success: false,
                error: 'Invalid QR code format'
            };
        }
    }
}

// Export for use in other modules
window.LumaQRGenerator = LumaQRGenerator;
window.LumaQRScanner = LumaQRScanner;

