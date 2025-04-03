// Three.js Shader Setup
let scene, camera, renderer, material;
let mouseX = 0;
let mouseY = 0;
let scrollY = 0;

// Initialize Three.js
function initThree() {
    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('shaderCanvas'),
        alpha: true
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Shader material
    const vertexShader = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;
    
    const fragmentShader = `
        uniform float time;
        uniform float mouseX;
        uniform float mouseY;
        uniform float scrollY;
        varying vec2 vUv;
        
        void main() {
            vec2 uv = vUv;
            vec2 center = vec2(0.5, 0.5);
            float dist = length(uv - center);
            
            // Mouse interaction
            vec2 mousePos = vec2(mouseX, mouseY);
            float mouseDist = length(uv - mousePos);
            
            // Wave effect
            float wave = sin(dist * 10.0 - time * 2.0) * 0.5 + 0.5;
            wave *= sin(scrollY * 0.1) * 0.5 + 0.5;
            
            // Combine effects
            float color = wave * (1.0 - mouseDist);
            color = smoothstep(0.0, 1.0, color);
            
            gl_FragColor = vec4(vec3(color), 0.1);
        }
    `;
    
    material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            mouseX: { value: 0 },
            mouseY: { value: 0 },
            scrollY: { value: 0 }
        },
        vertexShader,
        fragmentShader,
        transparent: true
    });
    
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    camera.position.z = 1;
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    material.uniforms.time.value += 0.01;
    renderer.render(scene, camera);
}

// Mouse follow effect
function createMouseGlow() {
    const glow = document.createElement('div');
    glow.className = 'mouse-glow';
    document.body.appendChild(glow);
    
    document.addEventListener('mousemove', (e) => {
        glow.style.transform = `translate(${e.clientX - 50}px, ${e.clientY - 50}px)`;
        material.uniforms.mouseX.value = e.clientX / window.innerWidth;
        material.uniforms.mouseY.value = 1.0 - (e.clientY / window.innerHeight);
    });
}

// Scroll wave effect
function handleScroll() {
    window.addEventListener('scroll', () => {
        scrollY = window.scrollY;
        material.uniforms.scrollY.value = scrollY;
    });
}

// Theme handling
function initTheme() {
    // Check for saved theme preference, otherwise use system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
        return;
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const hour = new Date().getHours();
    const isNight = hour >= 20 || hour <= 6;
    
    const defaultTheme = (prefersDark || isNight) ? 'dark' : 'light';
    document.body.setAttribute('data-theme', defaultTheme);
    updateThemeIcon(defaultTheme);
}

function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('.theme-btn i');
    if (themeIcon) {
        themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('theme')) {
        const newTheme = e.matches ? 'dark' : 'light';
        document.body.setAttribute('data-theme', newTheme);
        updateThemeIcon(newTheme);
    }
});

// Language toggle
function toggleLanguage() {
    const body = document.body;
    const currentLang = body.getAttribute('data-language') || 'en';
    const newLang = currentLang === 'en' ? 'hi' : 'en';
    
    body.setAttribute('data-language', newLang);
    
    // Update the language button text
    const langBtn = document.querySelector('.current-lang');
    langBtn.textContent = newLang === 'en' ? 'EN' : 'हिं';
    
    // Add a smooth transition effect
    langBtn.style.opacity = '0';
    setTimeout(() => {
        langBtn.style.opacity = '1';
    }, 150);
}

// Initialize language
function initLanguage() {
    const body = document.body;
    const currentLang = body.getAttribute('data-language') || 'en';
    const langBtn = document.querySelector('.current-lang');
    langBtn.textContent = currentLang === 'en' ? 'EN' : 'हिं';
}

// Window resize handler
function handleResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Smooth Scrolling and Navigation
function initSmoothScroll() {
    // Get all navigation links
    const navLinks = document.querySelectorAll('.nav-links a');
    
    // Add click event listeners to all nav links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                // Calculate the target position with offset
                const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - 80;
                
                // Smooth scroll to target
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update active state
                updateActiveLink(link);
            }
        });
    });
    
    // Handle scroll events for active section highlighting
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section');
        const scrollPosition = window.scrollY + 100; // Offset for better trigger point
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                const sectionId = section.getAttribute('id');
                updateActiveLink(document.querySelector(`.nav-links a[href="#${sectionId}"]`));
            }
        });
    });
}

function updateActiveLink(activeLink) {
    // Remove active class from all links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to clicked link
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// Navbar background change on scroll
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.backgroundColor = 'var(--bg-color)';
            navbar.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
        } else {
            navbar.style.backgroundColor = 'transparent';
            navbar.style.boxShadow = 'none';
        }
    });
}

// Initialize all features
window.addEventListener('load', () => {
    initThree();
    animate();
    createMouseGlow();
    handleScroll();
    initSmoothScroll();
    initNavbarScroll();
    initTheme();
    initLanguage();
    window.addEventListener('resize', handleResize);
});

// Form Submissions
document.addEventListener('DOMContentLoaded', function() {
    // Join Form
    const joinForm = document.getElementById('joinForm');
    if (joinForm) {
        joinForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = this.querySelector('input[type="text"]').value;
            const email = this.querySelector('input[type="email"]').value;
            
            // Here you would typically send this data to your backend
            alert('Thank you for joining! We will contact you soon.');
            this.reset();
        });
    }

    // Newsletter Form
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            
            // Here you would typically send this data to your backend
            alert('Thank you for subscribing to our newsletter!');
            this.reset();
        });
    }

    // Smooth Scrolling for Navigation Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add active class to navigation links on scroll
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop - 60) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    });
}); 