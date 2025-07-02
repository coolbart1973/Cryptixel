
# 🌟 Cryptixel — Visual Encrypted QR Generator

**Cryptixel** is a next-gen QR code generator and scanner with 3D visuals, particle effects, and AES-256 encryption — all running securely in your browser.

> Inspired by visual pairing protocols, Cryptixel reimagines how encrypted QR codes can look and feel.

---

## 🔐 Features

- **AES-256-GCM Encryption** using Web Crypto API  
- **3D Particle Visuals** with Three.js  
- **Visual Mapping** of data into depth, color, and position  
- **Smooth Animations & Transitions**  
- **Modern UI** with gradients, glassmorphism & responsiveness  
- **Built-in QR Scanner** with manual and demo input

---

## 🚀 Quick Start
**1.Private deployment**

1. Clone or download the repository  
2. Open `index.html` in a browser  
3. Enter a message to encrypt  
4. (Optional) Add a password  
5. Click **Generate Visual QR**  
6. Open `scanner.html` to decode with the password

**2.Deployment via a third party**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/yinhao-ai/Cryptixel)
---

## 📁 Project Structure

```
Cryptixel/
├── index.html               # Generator UI
├── scanner.html             # Scanner UI
├── css/
│   ├── style.css            # Main styles
│   └── scanner.css          # Scanner styles
├── js/
│   ├── crypto.js            # AES-256 encryption/decryption
│   ├── particles.js         # Three.js particle system
│   ├── qr-generator.js      # QR code generator
│   ├── main.js              # Generator logic
│   └── scanner.js           # Scanner logic
├── assets/
│   ├── placeholder.txt
├── images/
│   ├── placeholder.png
└── README.md                # Project description
```

---

## 🔧 Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6)  
- **3D Rendering**: Three.js  
- **Encryption**: Web Crypto API (AES-256-GCM, PBKDF2, SHA-256)

---

## 🔐 Security Notes

- All encryption/decryption is performed **client-side**  
- Uses strong, random salt and IV per session  
- Supports password-based encryption (PBKDF2)  
- No data leaves your device

---

## 🌐 Browser Support

- Chrome 60+  
- Firefox 55+  
- Safari 11+  
- Edge 79+  

Requires WebGL and Web Crypto support.

---

## 📄 License

This project is for educational and demo purposes only. Not recommended for production use without security review.

---

## 🤝 Contact

Questions or suggestions?  
Email: cyinhaos@gmail.com

---

**Note**: This is a concept project demonstrating secure, visually enhanced QR code generation in modern browsers.

**Disclaimer**: The name "Cryptixel" used in this project is an independent concept and is used for technical research, education and non-commercial display purposes.
The terms in the name are common technical terms and do not constitute any brand suggestion or commercial association.
Any similarity in the name is purely coincidental and is not intended to be directional or commercially misleading.

Cryptixel is an independent project and is not affiliated with, endorsed by, or associated with Cryptix or any of its entities.

<sub><sup><span style="color:gray">
⚠️ Legal Disclaimer:  
“Cryptixel” is an independent open-source project and is in no way affiliated with, sponsored by, or endorsed by any entity with a similar name. All product and company names are trademarks™ or registered® trademarks of their respective holders. Use of them does not imply any affiliation with or endorsement by them.
</span></sup></sub>

<a class="copyrighted-badge" title="Copyrighted.com Registered &amp; Protected" target="_blank" href="https://app.copyrighted.com/work/tUAhCuOEHSke5URe/">
  <img alt="Copyrighted.com Registered &amp; Protected" border="0" width="125" height="25" srcset="https://static.copyrighted.com/badges/125x25/04_1_2x.png 2x" src="https://static.copyrighted.com/badges/125x25/04_1.png">
</a>
