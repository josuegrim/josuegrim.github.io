document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Custom Cursor ---
    const cursorDot = document.getElementById('cursor-dot');
    const cursorOutline = document.getElementById('cursor-outline');
    let mouseX = 0, mouseY = 0;
    let outlineX = 0, outlineY = 0;

    // Solo habilitar si no es un dispositivo táctil
    if (window.matchMedia("(pointer: fine)").matches) {
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Mover el punto principal instantáneamente
            cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
        });

        // Loop de animación para suavidad (Lerp) del contorno
        function animateCursor() {
            // Lerp (Linear Interpolation)
            let dx = mouseX - outlineX;
            let dy = mouseY - outlineY;
            
            outlineX += dx * 0.15;
            outlineY += dy * 0.15;
            
            cursorOutline.style.transform = `translate(${outlineX}px, ${outlineY}px)`;
            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        // Hover effects en elementos interactivos
        const interactables = document.querySelectorAll('.card, .map-point, .solution-card');
        interactables.forEach(el => {
            el.addEventListener('mouseenter', () => cursorOutline.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => cursorOutline.classList.remove('cursor-hover'));
        });
    }

    // --- 2. Spotlight & Glow Cards (Vanilla JS) ---
    const interactiveCards = document.querySelectorAll('.glass-card, .stat-card');
    
    // Solo asignar el rastreo de ratón si no es táctil para optimizar en móviles
    if (window.matchMedia("(pointer: fine)").matches) {
        interactiveCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            });
        });
    }

    // --- 3. Barra de Progreso de Scroll ---
    const progressBar = document.getElementById('scroll-progress');
    window.addEventListener('scroll', () => {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (scrollTop / scrollHeight) * 100;
        progressBar.style.width = scrolled + '%';
    });

    // --- 3. Animaciones al hacer Scroll (Intersection Observer) ---
    const reveals = document.querySelectorAll('.reveal');
    
    const revealOptions = {
        threshold: 0.15, // Ejecutar cuando el 15% del elemento sea visible
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Solo animar una vez
            }
        });
    }, revealOptions);

    reveals.forEach(reveal => {
        revealOnScroll.observe(reveal);
    });

    // --- 4. Sistema de Partículas Canvas (Humo y Contaminación) ---
    const canvas = document.getElementById('hero-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];

        function resizeCanvas() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }
        
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        class Particle {
            constructor() {
                this.reset();
                this.y = Math.random() * height; // Distribuir aleatoriamente al inicio
            }

            reset() {
                this.x = Math.random() * width;
                this.y = height + Math.random() * 100; // Empezar debajo de la pantalla
                this.size = Math.random() * 4 + 1; // Tamaño base
                this.speedY = -(Math.random() * 0.5 + 0.1); // Movimiento muy lento hacia arriba
                this.speedX = (Math.random() - 0.5) * 0.5; // Ligero desvío lateral
                this.opacity = Math.random() * 0.5 + 0.1;
                // Colores oscuros, grises y un toque de verde oscuro
                const colors = ['rgba(100, 100, 100, ', 'rgba(50, 50, 50, ', 'rgba(77, 124, 15, '];
                this.colorBase = colors[Math.floor(Math.random() * colors.length)];
            }

            update() {
                this.y += this.speedY;
                this.x += this.speedX;
                
                // Variación suave de opacidad
                if (this.y < height * 0.2) {
                    this.opacity -= 0.005; // Desvanecer al llegar arriba
                }

                if (this.opacity <= 0 || this.y < -50) {
                    this.reset();
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.colorBase + this.opacity + ')';
                
                // Añadir efecto de desenfoque para simular humo
                ctx.shadowBlur = this.size * 2;
                ctx.shadowColor = this.colorBase + '1)';
                
                ctx.fill();
                
                // Reset shadow para no afectar todo
                ctx.shadowBlur = 0;
            }
        }

        // Crear partículas
        for (let i = 0; i < 80; i++) {
            particles.push(new Particle());
        }

        function animateCanvas() {
            ctx.clearRect(0, 0, width, height);
            
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            
            requestAnimationFrame(animateCanvas);
        }

        animateCanvas();
    }
});
