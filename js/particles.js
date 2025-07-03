// Particle system for background and QR code effects
class ParticleSystem {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            particleCount: options.particleCount || 100,
            particleSize: options.particleSize || 2,
            speed: options.speed || 0.5,
            color: options.color || '#ffffff',
            opacity: options.opacity || 0.6,
            ...options
        };
        
        this.particles = [];
        this.animationId = null;
        this.init();
    }

    init() {
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '1';
        
        this.container.appendChild(this.canvas);
        
        // Set canvas size
        this.resize();
        
        // Create particles
        this.createParticles();
        
        // Start animation
        this.animate();
        
        // Handle resize
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const rect = this.container.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.options.particleCount; i++) {
            this.particles.push(this.createParticle());
        }
    }

    createParticle() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            vx: (Math.random() - 0.5) * this.options.speed,
            vy: (Math.random() - 0.5) * this.options.speed,
            size: Math.random() * this.options.particleSize + 1,
            opacity: Math.random() * this.options.opacity,
            life: Math.random() * 100,
            maxLife: 100
        };
    }

    updateParticle(particle) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life += 1;

        // Wrap around edges
        if (particle.x < 0) particle.x = this.canvas.width;
        if (particle.x > this.canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = this.canvas.height;
        if (particle.y > this.canvas.height) particle.y = 0;

        // Reset particle if it's too old
        if (particle.life > particle.maxLife) {
            Object.assign(particle, this.createParticle());
        }
    }

    drawParticle(particle) {
        this.ctx.save();
        this.ctx.globalAlpha = particle.opacity * (1 - particle.life / particle.maxLife);
        this.ctx.fillStyle = this.options.color;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            this.updateParticle(particle);
            this.drawParticle(particle);
        });

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// 3D QR Code Particle System using Three.js
class QRParticleSystem {
    constructor(container, encryptedData) {
        this.container = container;
        this.encryptedData = encryptedData;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = null;
        this.animationId = null;
        
        this.init();
    }

    init() {
        // Create Three.js scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1e3a8a);

        // Create camera
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.z = 30;

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        // Create particle system
        this.createQRParticles();

        // Add lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        this.scene.add(directionalLight);

        // Start animation
        this.animate();

        // Handle resize
        window.addEventListener('resize', () => this.resize());
    }

    createQRParticles() {
        // Convert encrypted data to visual matrix
        const matrix = this.dataToMatrix(this.encryptedData);
        const gridSize = matrix.length;
        const spacing = 0.8;
        const offset = (gridSize - 1) * spacing / 2;

        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const sizes = [];

        // Create particles based on data matrix
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const value = matrix[i][j];
                const particleCount = Math.floor(value * 20) + 5; // 5-25 particles per cell

                for (let k = 0; k < particleCount; k++) {
                    // Position
                    const x = (i - offset) * spacing + (Math.random() - 0.5) * 0.6;
                    const y = (j - offset) * spacing + (Math.random() - 0.5) * 0.6;
                    const z = (Math.random() - 0.5) * 2 + value * 3; // Z-depth based on data value

                    positions.push(x, y, z);

                    // Color based on data value
                    const hue = (value * 360 + i * 10 + j * 10) % 360;
                    const color = new THREE.Color().setHSL(hue / 360, 0.8, 0.6);
                    colors.push(color.r, color.g, color.b);

                    // Size based on data value
                    sizes.push(value * 3 + 1);
                }
            }
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

        // Create material
        const material = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true
        });

        // Create particle system
        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);

        // Add emoji particles
        this.addEmojiParticles();
    }

    dataToMatrix(encryptedData) {
        // Convert encrypted data to a visual matrix
        const dataString = JSON.stringify(encryptedData);
        const bytes = new TextEncoder().encode(dataString);
        
        // Determine matrix size based on data length
        const matrixSize = Math.ceil(Math.sqrt(bytes.length));
        const matrix = [];

        for (let i = 0; i < matrixSize; i++) {
            matrix[i] = [];
            for (let j = 0; j < matrixSize; j++) {
                const index = i * matrixSize + j;
                const value = index < bytes.length ? bytes[index] / 255 : Math.random() * 0.3;
                matrix[i][j] = value;
            }
        }

        return matrix;
    }

    addEmojiParticles() {
        // Add some emoji-like particle clusters
        const emojiPositions = [
            { x: -8, y: 8, emoji: '🔒' },
            { x: 8, y: 8, emoji: '✨' },
            { x: 0, y: -8, emoji: '🎨' }
        ];

        emojiPositions.forEach(pos => {
            this.createEmojiCluster(pos.x, pos.y, pos.emoji);
        });
    }

    createEmojiCluster(centerX, centerY, emoji) {
        const particleCount = 50;
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];

        // Get emoji color (simplified)
        const emojiColors = {
            '🔒': new THREE.Color(0xffd700),
            '✨': new THREE.Color(0x87ceeb),
            '🎨': new THREE.Color(0xff69b4)
        };
        
        const baseColor = emojiColors[emoji] || new THREE.Color(0xffffff);

        for (let i = 0; i < particleCount; i++) {
            // Create circular pattern
            const angle = (i / particleCount) * Math.PI * 2;
            const radius = Math.random() * 2 + 1;
            
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            const z = Math.random() * 2;

            positions.push(x, y, z);
            colors.push(baseColor.r, baseColor.g, baseColor.b);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.2,
            vertexColors: true,
            transparent: true,
            opacity: 0.9
        });

        const emojiParticles = new THREE.Points(geometry, material);
        this.scene.add(emojiParticles);

        // Add animation to emoji particles
        emojiParticles.userData = { 
            rotationSpeed: Math.random() * 0.02 + 0.01,
            floatSpeed: Math.random() * 0.01 + 0.005
        };
    }

    animate() {
        // Rotate main particle system
        if (this.particles) {
            this.particles.rotation.y += 0.005;
            this.particles.rotation.x += 0.002;
        }

        // Animate emoji particles
        this.scene.children.forEach(child => {
            if (child.userData && child.userData.rotationSpeed) {
                child.rotation.z += child.userData.rotationSpeed;
                child.position.y += Math.sin(Date.now() * child.userData.floatSpeed) * 0.01;
            }
        });

        // Camera orbit
        const time = Date.now() * 0.0005;
        this.camera.position.x = Math.cos(time) * 35;
        this.camera.position.z = Math.sin(time) * 35;
        this.camera.lookAt(this.scene.position);

        this.renderer.render(this.scene, this.camera);
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    resize() {
        if (!this.renderer || !this.camera) return;
        
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.renderer && this.renderer.domElement && this.renderer.domElement.parentNode) {
            this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
        }
    }
}

// Export for use in other modules
window.ParticleSystem = ParticleSystem;
window.QRParticleSystem = QRParticleSystem;

