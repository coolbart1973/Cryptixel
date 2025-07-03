// Crypto utilities using Web Crypto API
class CryptoManager {
    constructor() {
        this.encoder = new TextEncoder();
        this.decoder = new TextDecoder();
    }

    // Generate a random password if none provided
    generateRandomPassword(length = 32) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        
        for (let i = 0; i < length; i++) {
            password += chars[array[i] % chars.length];
        }
        return password;
    }

    // Derive key from password using PBKDF2
    async deriveKey(password, salt) {
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            this.encoder.encode(password),
            'PBKDF2',
            false,
            ['deriveKey']
        );

        return crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            {
                name: 'AES-GCM',
                length: 256
            },
            false,
            ['encrypt', 'decrypt']
        );
    }

    // Generate SHA-256 hash
    async generateHash(data) {
        const hashBuffer = await crypto.subtle.digest('SHA-256', this.encoder.encode(data));
        return Array.from(new Uint8Array(hashBuffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    // Encrypt data using AES-256-GCM
    async encrypt(plaintext, password = null) {
        try {
            // Use provided password or generate a random one
            const actualPassword = password || this.generateRandomPassword();
            
            // Generate random salt and IV
            const salt = crypto.getRandomValues(new Uint8Array(16));
            const iv = crypto.getRandomValues(new Uint8Array(12));
            
            // Derive key from password
            const key = await this.deriveKey(actualPassword, salt);
            
            // Encrypt the data
            const encodedData = this.encoder.encode(plaintext);
            const encryptedData = await crypto.subtle.encrypt(
                {
                    name: 'AES-GCM',
                    iv: iv
                },
                key,
                encodedData
            );

            // Generate hash of original data
            const dataHash = await this.generateHash(plaintext);

            // Combine salt, iv, encrypted data, and hash
            const result = {
                salt: Array.from(salt),
                iv: Array.from(iv),
                data: Array.from(new Uint8Array(encryptedData)),
                hash: dataHash,
                password: actualPassword
            };

            return result;
        } catch (error) {
            console.error('Encryption error:', error);
            throw new Error('Failed to encrypt data');
        }
    }

    // Decrypt data using AES-256-GCM
    async decrypt(encryptedPackage, password) {
        try {
            const { salt, iv, data, hash } = encryptedPackage;
            
            // Derive key from password
            const key = await this.deriveKey(password, new Uint8Array(salt));
            
            // Decrypt the data
            const decryptedData = await crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: new Uint8Array(iv)
                },
                key,
                new Uint8Array(data)
            );

            // Decode the decrypted data
            const plaintext = this.decoder.decode(decryptedData);
            
            // Verify hash
            const computedHash = await this.generateHash(plaintext);
            if (computedHash !== hash) {
                throw new Error('Data integrity check failed');
            }

            return plaintext;
        } catch (error) {
            console.error('Decryption error:', error);
            throw new Error('Failed to decrypt data');
        }
    }

    // Convert encrypted package to base64 for storage/transmission
    packageToBase64(encryptedPackage) {
        return btoa(JSON.stringify(encryptedPackage));
    }

    // Convert base64 back to encrypted package
    base64ToPackage(base64String) {
        return JSON.parse(atob(base64String));
    }
}

// Export for use in other modules
window.CryptoManager = CryptoManager;

