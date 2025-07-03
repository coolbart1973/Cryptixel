// QR Code Scanner Library Integration
// Using jsQR library for QR code detection from images

class QRCodeDetector {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    // Scan QR code from image file
    async scanFromFile(file) {
        return new Promise((resolve, reject) => {
            if (!file || !file.type.startsWith('image/')) {
                reject(new Error('Invalid file type. Please select an image file.'));
                return;
            }

            const img = new Image();
            img.onload = () => {
                try {
                    // Set canvas size to image size
                    this.canvas.width = img.width;
                    this.canvas.height = img.height;
                    
                    // Draw image to canvas
                    this.ctx.drawImage(img, 0, 0);
                    
                    // Get image data
                    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
                    
                    // Scan for QR code using jsQR
                    const code = jsQR(imageData.data, imageData.width, imageData.height);
                    
                    if (code) {
                        resolve({
                            success: true,
                            data: code.data,
                            location: code.location
                        });
                    } else {
                        reject(new Error('No QR code found in the image. Please try a clearer image.'));
                    }
                } catch (error) {
                    reject(new Error('Failed to process image: ' + error.message));
                }
            };
            
            img.onerror = () => {
                reject(new Error('Failed to load image file.'));
            };
            
            // Load image from file
            const reader = new FileReader();
            reader.onload = (e) => {
                img.src = e.target.result;
            };
            reader.onerror = () => {
                reject(new Error('Failed to read file.'));
            };
            reader.readAsDataURL(file);
        });
    }

    // Scan QR code from video stream
    scanFromVideo(video) {
        if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
            return null;
        }

        try {
            // Set canvas size to video size
            this.canvas.width = video.videoWidth;
            this.canvas.height = video.videoHeight;
            
            // Draw current video frame to canvas
            this.ctx.drawImage(video, 0, 0, this.canvas.width, this.canvas.height);
            
            // Get image data
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            
            // Scan for QR code using jsQR
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            
            if (code) {
                return {
                    success: true,
                    data: code.data,
                    location: code.location
                };
            }
            
            return null;
        } catch (error) {
            console.error('Video scan error:', error);
            return null;
        }
    }

    // Enhanced image preprocessing for better QR detection
    preprocessImage(imageData) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        
        // Convert to grayscale and enhance contrast
        for (let i = 0; i < data.length; i += 4) {
            const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
            
            // Enhance contrast
            const enhanced = gray > 128 ? Math.min(255, gray * 1.2) : Math.max(0, gray * 0.8);
            
            data[i] = enhanced;     // Red
            data[i + 1] = enhanced; // Green
            data[i + 2] = enhanced; // Blue
            // Alpha channel remains unchanged
        }
        
        return imageData;
    }

    // Scan with preprocessing for difficult images
    async scanFromFileEnhanced(file) {
        return new Promise((resolve, reject) => {
            if (!file || !file.type.startsWith('image/')) {
                reject(new Error('Invalid file type. Please select an image file.'));
                return;
            }

            const img = new Image();
            img.onload = () => {
                try {
                    // Set canvas size to image size
                    this.canvas.width = img.width;
                    this.canvas.height = img.height;
                    
                    // Draw image to canvas
                    this.ctx.drawImage(img, 0, 0);
                    
                    // Get image data
                    let imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
                    
                    // Try normal scan first
                    let code = jsQR(imageData.data, imageData.width, imageData.height);
                    
                    if (!code) {
                        // Try with preprocessing
                        imageData = this.preprocessImage(imageData);
                        this.ctx.putImageData(imageData, 0, 0);
                        code = jsQR(imageData.data, imageData.width, imageData.height);
                    }
                    
                    if (code) {
                        resolve({
                            success: true,
                            data: code.data,
                            location: code.location
                        });
                    } else {
                        reject(new Error('No QR code found in the image. Please try a clearer image or ensure the QR code is fully visible.'));
                    }
                } catch (error) {
                    reject(new Error('Failed to process image: ' + error.message));
                }
            };
            
            img.onerror = () => {
                reject(new Error('Failed to load image file.'));
            };
            
            // Load image from file
            const reader = new FileReader();
            reader.onload = (e) => {
                img.src = e.target.result;
            };
            reader.onerror = () => {
                reject(new Error('Failed to read file.'));
            };
            reader.readAsDataURL(file);
        });
    }
}

// Camera QR Scanner class
class CameraQRScanner {
    constructor() {
        this.detector = new QRCodeDetector();
        this.stream = null;
        this.scanning = false;
        this.scanCallback = null;
    }

    async startCamera(videoElement, constraints = { video: { facingMode: 'environment' } }) {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            videoElement.srcObject = this.stream;
            
            return new Promise((resolve, reject) => {
                videoElement.onloadedmetadata = () => {
                    videoElement.play();
                    resolve(this.stream);
                };
                videoElement.onerror = reject;
            });
        } catch (error) {
            throw new Error('Failed to access camera: ' + error.message);
        }
    }

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        this.stopScanning();
    }

    startScanning(videoElement, callback) {
        if (this.scanning) return;
        
        this.scanning = true;
        this.scanCallback = callback;
        
        const scan = () => {
            if (!this.scanning) return;
            
            const result = this.detector.scanFromVideo(videoElement);
            if (result && this.scanCallback) {
                this.scanCallback(result);
                return; // Stop scanning after successful detection
            }
            
            // Continue scanning
            requestAnimationFrame(scan);
        };
        
        scan();
    }

    stopScanning() {
        this.scanning = false;
        this.scanCallback = null;
    }

    captureFrame(videoElement) {
        return this.detector.scanFromVideo(videoElement);
    }
}

// Export classes for use in other modules
window.QRCodeDetector = QRCodeDetector;
window.CameraQRScanner = CameraQRScanner;

