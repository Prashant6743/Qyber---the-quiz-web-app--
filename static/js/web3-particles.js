// Web3 Particles Animation
document.addEventListener('DOMContentLoaded', function() {
    // Only run the animation on dashboard pages
    if (!document.querySelector('.dashboard-body')) return;
    
    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.id = 'particles-canvas';
    canvas.style.cssText = 'position:fixed; top:0; left:0; z-index:-2; width:100%; height:100%; pointer-events:none;';
    document.body.appendChild(canvas);
    
    // Canvas and context setup
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    
    // Resize canvas when window is resized
    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Particle class
    class Particle {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2 + 0.5;
            this.speed = Math.random() * 0.5 + 0.2;
            this.direction = Math.random() * Math.PI * 2;
            this.color = this.getRandomColor();
            this.alpha = Math.random() * 0.6 + 0.1;
            this.life = Math.random() * 100 + 50;
            this.maxLife = this.life;
        }
        
        getRandomColor() {
            const colors = [
                '59, 130, 246',  // blue
                '139, 92, 246',  // purple
                '6, 182, 212',   // cyan
                '236, 72, 153'   // pink
            ];
            return colors[Math.floor(Math.random() * colors.length)];
        }
        
        update() {
            this.x += Math.cos(this.direction) * this.speed;
            this.y += Math.sin(this.direction) * this.speed;
            this.life--;
            
            if (this.life <= 0 || this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
                this.reset();
            }
            
            this.alpha = (this.life / this.maxLife) * 0.7;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
            ctx.fill();
        }
    }
    
    // Connection between particles
    function drawConnections(particles) {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    
                    // Use color from first particle
                    const opacity = (1 - distance / 150) * 0.2 * Math.min(particles[i].alpha, particles[j].alpha);
                    ctx.strokeStyle = `rgba(${particles[i].color}, ${opacity})`;
                    
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }
    
    // Initialize particles
    const particleCount = Math.min(Math.floor(width * height / 9000), 100); // Responsive count
    const particles = [];
    
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Clear canvas with semi-transparent background for trailing effect
        ctx.fillStyle = 'rgba(15, 23, 42, 0.03)';
        ctx.fillRect(0, 0, width, height);
        
        // Update and draw particles
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        // Draw connections
        drawConnections(particles);
    }
    
    // Start animation
    animate();
    
    // Interactive effect - particles move away from cursor
    document.addEventListener('mousemove', function(e) {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        particles.forEach(particle => {
            const dx = particle.x - mouseX;
            const dy = particle.y - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 80) {
                const force = (80 - distance) / 80;
                const angle = Math.atan2(dy, dx);
                
                particle.x += Math.cos(angle) * force * 2;
                particle.y += Math.sin(angle) * force * 2;
            }
        });
    });
});
