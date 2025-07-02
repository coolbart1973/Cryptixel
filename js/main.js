// Main application logic
class CryptixelApp {
    constructor() {
        this.qrGenerator = new CryptixelGenerator();
        this.backgroundParticles = null;
        this.currentPassword = null;
        
        this.init();
    }

    init() {
        // Initialize background particles
        this.initBackgroundParticles();
        
        // Bind event listeners
        this.bindEvents();
        
        // Initialize page state
        this.showInputPage();
    }

    initBackgroundParticles() {
        const bgContainer = document.querySelector('.floating-particles');
        if (bgContainer) {
            this.backgroundParticles = new ParticleSystem(bgContainer, {
                particleCount: 50,
                particleSize: 3,
                speed: 0.3,
                color: 'rgba(255, 255, 255, 0.4)',
                opacity: 0.6
            });
        }
    }

    bindEvents() {
        // Generate button
        const generateBtn = document.getElementById('generateBtn');
        generateBtn.addEventListener('click', () => this.handleGenerate());

        // Back button
        const backBtn = document.getElementById('backBtn');
        backBtn.addEventListener('click', () => this.showInputPage());

        // Scanner button
        const scannerBtn = document.getElementById('openScannerBtn');
        scannerBtn.addEventListener('click', () => this.openScanner());

        // Enter key support
        const textInput = document.getElementById('textInput');
        textInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.handleGenerate();
            }
        });

        // Auto-resize textarea
        textInput.addEventListener('input', this.autoResizeTextarea);
    }

    autoResizeTextarea(e) {
        const textarea = e.target;
        textarea.style.height = 'auto';
        textarea.style.height = Math.max(120, textarea.scrollHeight) + 'px';
    }

    async handleGenerate() {
        const textInput = document.getElementById('textInput');
        const passwordInput = document.getElementById('passwordInput');
        const generateBtn = document.getElementById('generateBtn');

        const text = textInput.value.trim();
        if (!text) {
            this.showNotification('Please enter some text to generate QR code', 'warning');
            textInput.focus();
            return;
        }

        const password = passwordInput.value.trim() || null;

        // Show loading state
        generateBtn.classList.add('loading');
        generateBtn.disabled = true;

        try {
            // Generate QR with smooth transition
            await this.transitionToQRPage();
            
            const qrContainer = document.getElementById('qrCanvas');
            const result = await this.qrGenerator.generateQR(text, password, qrContainer);

            if (result.success) {
                this.currentPassword = result.password;
                this.showNotification('Cryptixel QR code generated successfully!', 'success');
                
                // Update info display
                this.updateQRInfo(result.encryptedData);
            } else {
                this.showNotification(result.error, 'error');
                this.showInputPage();
            }
        } catch (error) {
            console.error('Generation error:', error);
            this.showNotification('Failed to generate QR code', 'error');
            this.showInputPage();
        } finally {
            generateBtn.classList.remove('loading');
            generateBtn.disabled = false;
        }
    }

    async transitionToQRPage() {
        return new Promise((resolve) => {
            const inputPage = document.getElementById('inputPage');
            const qrPage = document.getElementById('qrPage');

            // Fade out input page
            inputPage.style.transform = 'translateX(-100%)';
            inputPage.style.opacity = '0';

            setTimeout(() => {
                inputPage.classList.add('hidden');
                qrPage.classList.remove('hidden');
                
                // Animate QR page in
                qrPage.style.transform = 'translateX(100%)';
                qrPage.style.opacity = '0';
                
                setTimeout(() => {
                    qrPage.style.transform = 'translateX(0)';
                    qrPage.style.opacity = '1';
                    resolve();
                }, 50);
            }, 300);
        });
    }

    showInputPage() {
        const inputPage = document.getElementById('inputPage');
        const qrPage = document.getElementById('qrPage');

        // Clean up QR system
        this.qrGenerator.destroy();

        // Animate transition
        qrPage.style.transform = 'translateX(100%)';
        qrPage.style.opacity = '0';

        setTimeout(() => {
            qrPage.classList.add('hidden');
            inputPage.classList.remove('hidden');
            
            inputPage.style.transform = 'translateX(0)';
            inputPage.style.opacity = '1';
        }, 300);
    }

    updateQRInfo(encryptedData) {
        // Update hash display (show first 8 characters)
        const hashDisplay = document.querySelector('.info-item:last-child .info-value');
        if (hashDisplay && encryptedData.hash) {
            hashDisplay.textContent = `SHA-256 (${encryptedData.hash.substring(0, 8)}...)`;
        }
    }

    openScanner() {
        // Open scanner in new window/tab
        const scannerWindow = window.open('scanner.html', '_blank', 'width=800,height=600');
        
        // Pass current QR data to scanner if available
        if (this.qrGenerator.getCurrentEncryptedData() && this.currentPassword) {
            scannerWindow.addEventListener('load', () => {
                scannerWindow.postMessage({
                    type: 'QR_DATA',
                    data: this.qrGenerator.exportData(),
                    password: this.currentPassword
                }, '*');
            });
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(n => n.remove());

        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                z-index: 1000;
                transform: translateX(100%);
                transition: transform 0.3s ease;
                max-width: 400px;
            }
            
            .notification.show {
                transform: translateX(0);
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                padding: 16px 20px;
                gap: 12px;
            }
            
            .notification-icon {
                font-size: 1.2rem;
            }
            
            .notification-message {
                font-size: 0.9rem;
                font-weight: 500;
            }
            
            .notification-success {
                border-left: 4px solid #10b981;
            }
            
            .notification-error {
                border-left: 4px solid #ef4444;
            }
            
            .notification-warning {
                border-left: 4px solid #f59e0b;
            }
            
            .notification-info {
                border-left: 4px solid #3b82f6;
            }
        `;
        
        if (!document.querySelector('#notification-styles')) {
            style.id = 'notification-styles';
            document.head.appendChild(style);
        }

        // Add to DOM
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);

        // Auto remove
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.qrApp = new CryptixelApp();
});

// Handle page visibility change to pause/resume animations
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations when tab is not visible
        if (window.qrApp && window.qrApp.backgroundParticles) {
            // Could implement pause functionality
        }
    } else {
        // Resume animations when tab becomes visible
        if (window.qrApp && window.qrApp.backgroundParticles) {
            // Could implement resume functionality
        }
    }
});

