// LumaQR QR Scanner Application
class LumaQRScannerApp {
    constructor() {
        this.qrScanner = new LumaQRScanner();
        this.backgroundParticles = null;
        this.cameraStream = null;
        this.currentTab = 'manual';
        
        this.init();
    }

    init() {
        // Initialize background particles
        this.initBackgroundParticles();
        
        // Bind event listeners
        this.bindEvents();
        
        // Listen for messages from parent window (QR data from generator)
        this.listenForQRData();
    }

    initBackgroundParticles() {
        const bgContainer = document.querySelector('.scanning-particles');
        if (bgContainer) {
            this.backgroundParticles = new ParticleSystem(bgContainer, {
                particleCount: 30,
                particleSize: 2,
                speed: 0.4,
                color: 'rgba(255, 255, 255, 0.3)',
                opacity: 0.5
            });
        }
    }

    bindEvents() {
        // Tab switching
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        // Manual scan
        const scanBtn = document.getElementById('scanBtn');
        scanBtn.addEventListener('click', () => this.handleManualScan());

        // Password toggle
        const togglePassword = document.getElementById('togglePassword');
        togglePassword.addEventListener('click', () => this.togglePasswordVisibility());

        // File upload
        const fileInput = document.getElementById('fileInput');
        const fileUploadArea = document.getElementById('fileUploadArea');
        const fileScanBtn = document.getElementById('fileScanBtn');

        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        fileScanBtn.addEventListener('click', () => this.handleFileScan());

        // Drag and drop
        fileUploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        fileUploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        fileUploadArea.addEventListener('drop', (e) => this.handleFileDrop(e));

        // Camera controls
        const startCameraBtn = document.getElementById('startCameraBtn');
        const stopCameraBtn = document.getElementById('stopCameraBtn');
        const captureBtn = document.getElementById('captureBtn');

        startCameraBtn.addEventListener('click', () => this.startCamera());
        stopCameraBtn.addEventListener('click', () => this.stopCamera());
        captureBtn.addEventListener('click', () => this.captureFromCamera());

        // Result actions
        const copyBtn = document.getElementById('copyBtn');
        const saveBtn = document.getElementById('saveBtn');
        const shareBtn = document.getElementById('shareBtn');
        const newScanBtn = document.getElementById('newScanBtn');

        copyBtn.addEventListener('click', () => this.copyResult());
        saveBtn.addEventListener('click', () => this.saveResult());
        shareBtn.addEventListener('click', () => this.shareResult());
        newScanBtn.addEventListener('click', () => this.newScan());

        // Enter key support
        const passwordInput = document.getElementById('passwordInput');
        passwordInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.handleManualScan();
            }
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update tab content
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}Tab`);
        });

        this.currentTab = tabName;

        // Stop camera if switching away from camera tab
        if (tabName !== 'camera' && this.cameraStream) {
            this.stopCamera();
        }
    }

    async handleManualScan() {
        const qrDataInput = document.getElementById('qrDataInput');
        const passwordInput = document.getElementById('passwordInput');
        const scanBtn = document.getElementById('scanBtn');

        const qrData = qrDataInput.value.trim();
        const password = passwordInput.value.trim();

        if (!qrData) {
            this.showNotification('Please enter QR code data', 'warning');
            qrDataInput.focus();
            return;
        }

        if (!password) {
            this.showNotification('Please enter the decryption password', 'warning');
            passwordInput.focus();
            return;
        }

        // Show loading state
        scanBtn.classList.add('loading');
        scanBtn.disabled = true;

        try {
            const result = await this.qrScanner.scanFromBase64(qrData, password);
            
            if (result.success) {
                this.showResult(result.text);
                this.showNotification('QR code decoded successfully!', 'success');
            } else {
                this.showNotification(result.error, 'error');
            }
        } catch (error) {
            console.error('Scan error:', error);
            this.showNotification('Failed to decode QR code', 'error');
        } finally {
            scanBtn.classList.remove('loading');
            scanBtn.disabled = false;
        }
    }

    togglePasswordVisibility() {
        const passwordInputs = document.querySelectorAll('.password-input');
        const toggleBtn = document.getElementById('togglePassword');
        
        passwordInputs.forEach(input => {
            if (input.type === 'password') {
                input.type = 'text';
                toggleBtn.textContent = '🙈';
            } else {
                input.type = 'password';
                toggleBtn.textContent = '👁️';
            }
        });
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.processImageFile(file);
        }
    }

    handleDragOver(event) {
        event.preventDefault();
        event.currentTarget.classList.add('dragover');
    }

    handleDragLeave(event) {
        event.currentTarget.classList.remove('dragover');
    }

    handleFileDrop(event) {
        event.preventDefault();
        event.currentTarget.classList.remove('dragover');
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            this.processImageFile(files[0]);
        }
    }

    processImageFile(file) {
        if (!file.type.startsWith('image/')) {
            this.showNotification('Please select an image file', 'warning');
            return;
        }

        const fileScanBtn = document.getElementById('fileScanBtn');
        fileScanBtn.disabled = false;
        fileScanBtn.querySelector('.btn-text').textContent = `Decode from ${file.name}`;
        
        // Store file for processing
        this.selectedFile = file;
        
        this.showNotification('Image selected. Enter password and click decode.', 'info');
    }

    async handleFileScan() {
        if (!this.selectedFile) {
            this.showNotification('Please select an image file first', 'warning');
            return;
        }

        const password = document.getElementById('filePasswordInput').value.trim();
        if (!password) {
            this.showNotification('Please enter the decryption password', 'warning');
            return;
        }

        const fileScanBtn = document.getElementById('fileScanBtn');
        fileScanBtn.classList.add('loading');
        fileScanBtn.disabled = true;

        try {
            // For demo purposes, we'll simulate QR code extraction from image
            // In a real implementation, you would use a QR code detection library
            this.showNotification('Image QR scanning is a demo feature. Use manual input for now.', 'info');
        } catch (error) {
            console.error('File scan error:', error);
            this.showNotification('Failed to scan image', 'error');
        } finally {
            fileScanBtn.classList.remove('loading');
            fileScanBtn.disabled = false;
        }
    }

    async startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            
            const video = document.getElementById('cameraVideo');
            video.srcObject = stream;
            this.cameraStream = stream;

            // Update button states
            document.getElementById('startCameraBtn').disabled = true;
            document.getElementById('stopCameraBtn').disabled = false;
            document.getElementById('captureBtn').disabled = false;

            this.showNotification('Camera started successfully', 'success');
        } catch (error) {
            console.error('Camera error:', error);
            this.showNotification('Failed to access camera', 'error');
        }
    }

    stopCamera() {
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
            this.cameraStream = null;

            const video = document.getElementById('cameraVideo');
            video.srcObject = null;

            // Update button states
            document.getElementById('startCameraBtn').disabled = false;
            document.getElementById('stopCameraBtn').disabled = true;
            document.getElementById('captureBtn').disabled = true;

            this.showNotification('Camera stopped', 'info');
        }
    }

    captureFromCamera() {
        if (!this.cameraStream) {
            this.showNotification('Camera not started', 'warning');
            return;
        }

        // For demo purposes, simulate capture
        // In a real implementation, you would capture the video frame and process it
        this.showNotification('Camera capture is a demo feature. Use manual input for now.', 'info');
    }

    showResult(text) {
        const scannerMain = document.getElementById('scannerMain');
        const resultSection = document.getElementById('resultSection');
        const resultText = document.getElementById('resultText');

        // Hide scanner main and show result
        scannerMain.classList.add('hidden');
        resultSection.classList.remove('hidden');

        // Set result text
        resultText.textContent = text;

        // Store result for actions
        this.currentResult = text;
    }

    newScan() {
        const scannerMain = document.getElementById('scannerMain');
        const resultSection = document.getElementById('resultSection');

        // Show scanner main and hide result
        scannerMain.classList.remove('hidden');
        resultSection.classList.add('hidden');

        // Clear inputs
        document.getElementById('qrDataInput').value = '';
        document.getElementById('passwordInput').value = '';
        document.getElementById('filePasswordInput').value = '';
        document.getElementById('cameraPasswordInput').value = '';

        // Reset file input
        document.getElementById('fileInput').value = '';
        const fileScanBtn = document.getElementById('fileScanBtn');
        fileScanBtn.disabled = true;
        fileScanBtn.querySelector('.btn-text').textContent = 'Decode from Image';
        this.selectedFile = null;

        // Stop camera if running
        this.stopCamera();

        this.currentResult = null;
    }

    async copyResult() {
        if (!this.currentResult) return;

        try {
            await navigator.clipboard.writeText(this.currentResult);
            this.showNotification('Result copied to clipboard', 'success');
        } catch (error) {
            console.error('Copy error:', error);
            this.showNotification('Failed to copy result', 'error');
        }
    }

    saveResult() {
        if (!this.currentResult) return;

        const blob = new Blob([this.currentResult], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `qr-result-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        this.showNotification('Result saved as file', 'success');
    }

    async shareResult() {
        if (!this.currentResult) return;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'QR Code Result',
                    text: this.currentResult
                });
                this.showNotification('Result shared successfully', 'success');
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Share error:', error);
                    this.fallbackShare();
                }
            }
        } else {
            this.fallbackShare();
        }
    }

    fallbackShare() {
        // Fallback: copy to clipboard
        this.copyResult();
        this.showNotification('Share not supported. Result copied to clipboard.', 'info');
    }

    listenForQRData() {
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'QR_DATA') {
                // Auto-fill with received QR data
                document.getElementById('qrDataInput').value = event.data.data;
                document.getElementById('passwordInput').value = event.data.password;
                
                this.showNotification('QR data received from generator', 'success');
                
                // Auto-scan if both data and password are available
                setTimeout(() => {
                    this.handleManualScan();
                }, 1000);
            }
        });
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

        // Add styles if not already present
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
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

// Initialize scanner app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.scannerApp = new LumaQRScannerApp();
});

// Clean up camera stream when page is unloaded
window.addEventListener('beforeunload', () => {
    if (window.scannerApp && window.scannerApp.cameraStream) {
        window.scannerApp.stopCamera();
    }
});

