# Visual QR Generator

A QR code generator and scanner inspired by the aesthetics of Visual Pairing Protocol, featuring particle effects, 3D depth, AES-256 encryption, fluid animations, and a beautiful HTML interface.

## 🌟 Features

- **🔒 AES-256 Encryption**: Military-grade encryption using the Web Crypto API  
- **✨ Particle Effects**: 3D particle system powered by Three.js  
- **🎨 3D Visual Design**: Realistic depth and dimensionality  
- **🌊 Smooth Animations**: Seamless page transitions and interaction feedback  
- **📱 Responsive Design**: Fully optimized for both desktop and mobile  
- **🎯 Modern UI/UX**: Glassmorphism, rounded corners, and gradient backgrounds  

## 🚀 Quick Start

1. Download the project files  
2. Open `index.html` in your browser  
3. Enter the message you want to encrypt  
4. Optionally set a custom password (a secure one is auto-generated if left blank)  
5. Click “Generate Visual QR” to create a visual QR code  
6. Use “Open Scanner” to decode via the scanner page  

## 📁 Project Structure

visual-qr-generator/
├── index.html              # Main generator page
├── scanner.html            # Scanner page
├── css/
│   ├── style.css           # Main page styles
│   └── scanner.css         # Scanner styles
├── js/
│   ├── crypto.js           # Encryption logic
│   ├── particles.js        # 3D particle system
│   ├── qr-generator.js     # QR generation logic
│   ├── main.js             # Main page interactions
│   └── scanner.js          # Scanner interactions
├── assets/
│   └── placeholder.txt     # Placeholder file
├── images/
│   └── placeholder.png     # Placeholder image
└── README.md               # Project documentation

## 🔧 Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)  
- **3D Rendering**: Three.js  
- **Encryption**: Web Crypto API  
- **Design**: Modern CSS (Flexbox, Grid, gradients, glassmorphism)  

## 🛡️ Security Features

### Encryption Algorithms

- **AES-256-GCM**: Authenticated encryption providing confidentiality and integrity  
- **PBKDF2**: Key derivation function to resist rainbow table attacks  
- **SHA-256**: Secure hashing for integrity verification  

### Secure Implementation

- Client-side encryption — data never leaves the device  
- Random salt and initialization vector (IV)  
- Key strength validation  
- Integrity checks included  

## 🎨 Visual Design

### Design Philosophy

- Inspired by the aesthetics of visual pairing protocols  
- Particle effects evoke a futuristic, high-tech feel  
- 3D depth adds immersive visual impact  
- Gradient palettes reflect modern professional design  

### Animation Effects

- Page transitions  
- Particle motion  
- 3D rotation and float effects  
- Interactive feedback animations  

## 📱 How to Use

### Generate a Visual QR Code

1. Enter the message you want to encrypt  
2. Optionally enter a custom password (strongly recommended)  
3. Click the “Generate Visual QR” button  
4. A 3D visual QR code will be generated with particle effects  
5. Remember the password — it's required for decoding  

### Scan and Decode

1. Click “Open Scanner”  
2. Choose input method:  
   - **Manual Input**: Paste QR code data directly  
   - **Image Upload**: Upload QR code image (demo functionality)  
   - **Camera Scan**: Scan via webcam (demo functionality)  
3. Enter the decryption password  
4. Click “Decode QR Code”  
5. View the decrypted result  

## 🔍 Technical Overview

### Data Flow

1. **Input** → UTF-8 encoding → AES-256 encryption → Data bundling  
2. **Visual Mapping** → Matrix generation → Particle system → 3D rendering  
3. **Scanning** → Data extraction → AES-256 decryption → UTF-8 decoding  

### Particle System

- Built with Three.js `BufferGeometry`  
- Data values are mapped to particle attributes (color, size, position)  
- Z-axis depth enhances dimensional feel  
- Emoji particles add fun and playfulness  

## 🌐 Browser Compatibility

- Chrome 60+  
- Firefox 55+  
- Safari 11+  
- Edge 79+  

Modern browsers with WebGL and Web Crypto API support are required.

## 📄 License

This is a demo project intended for educational and research purposes only.

## 🤝 Contributing

Feel free to submit issues or pull requests to improve this project.

## 📞 Contact

For questions or suggestions, please reach out via email:  
📧 **cyinhaos@gmail.com**

---

**Note**: This is a proof-of-concept project demonstrating visually enriched encrypted data representation. **Perform a full security audit before using in production.**
