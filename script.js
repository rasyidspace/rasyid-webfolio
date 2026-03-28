/* ============================================
   R24 Studio Portfolio — JavaScript
   Core Interactivity & Components
   ============================================ */

// ============================================
// i18n — LANGUAGE SYSTEM
// ============================================
let currentLang = localStorage.getItem('r24-lang') || 'en';
let translations = {};

async function loadLanguage(lang) {
    try {
        const res = await fetch(`data/lang/${lang}.json`);
        translations = await res.json();
        currentLang = lang;
        localStorage.setItem('r24-lang', lang);
        applyTranslations();
        // Re-render dynamic sections with new language
        if (typeof loadServices === 'function') loadServices();
        if (typeof loadProjects === 'function') loadProjects();
        // Update lang toggle label
        const label = document.getElementById('langLabel');
        if (label) label.textContent = lang === 'id' ? 'EN' : 'ID';
    } catch (err) {
        console.error('Failed to load language:', err);
    }
}

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[key]) el.textContent = translations[key];
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        if (translations[key]) el.innerHTML = translations[key];
    });
}

function t(key) {
    return translations[key] || key;
}

function tObj(obj) {
    if (typeof obj === 'string') return obj;
    if (typeof obj === 'object' && obj !== null) return obj[currentLang] || obj['id'] || '';
    return '';
}
// ============================================
// SVG ICON MAP (for services)
// ============================================
const iconMap = {
    cube: `<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27,6.96 12,12.01 20.73,6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>`,
    home: `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/>`,
    video: `<polygon points="23,7 16,12 23,17 23,7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>`,
    tool: `<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>`,
    monitor: `<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>`,
    globe: `<circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><line x1="2" y1="12" x2="22" y2="12"/>`,
    smartphone: `<rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>`
};

// ============================================
// SERVICES — loaded from JSON
// ============================================
async function loadServices() {
    try {
        const res = await fetch('data/services.json');
        const services = await res.json();
        renderServices(services);
    } catch (err) {
        console.error('Failed to load services:', err);
    }
}

function renderServices(services) {
    const grid = document.getElementById('servicesGrid');
    if (!grid || services.length === 0) return;

    grid.innerHTML = services.map((s, i) => {
        const featuredClass = s.featured ? ' featured' : '';
        const badge = s.featured ? `<div class="featured-badge">${s.featuredLabel || 'Popular'}</div>` : '';
        const tags = s.tags.map(t => `<span>${t}</span>`).join('');

        let platforms = '';
        if (s.platforms && s.platforms.length > 0) {
            platforms = `<div class="service-platforms">${s.platforms.map(p => `
                <div class="platform">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${iconMap[p.icon] || ''}</svg>
                    <span>${p.name}</span>
                </div>`).join('')}
            </div>`;
        }

        return `
            <div class="service-card${featuredClass} reveal cyber-card" data-delay="${i * 100}">
                ${badge}
                <div class="service-icon-wrap">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">${iconMap[s.icon] || ''}</svg>
                </div>
                <div class="service-info">
                    <div class="service-header-row">
                        <span class="service-category">${s.category}</span>
                        <span class="service-software">${s.tools}</span>
                    </div>
                <h3 class="service-title">${s.title}</h3>
                <p class="service-desc">${tObj(s.description)}</p>
                <div class="service-tags">${tags}</div>
                ${platforms}
            </div>
        </div>`;
    }).join('');

    // Trigger GSAP refresh
    if (window.initScrollAnimations) {
        setTimeout(window.initScrollAnimations, 100);
    }
}

// ============================================
// PROJECT DATA — loaded from JSON
// ============================================
let projects = [];

const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycby0GIERJt_gUgW6za9bsTWBGv4d5p8dLXZU1Ipxi3EbM0laxbuuPPPD6G6_t5SV3YNQ/exec';

// Helper to convert Google Drive share links to direct image links
function getDirectImageUrl(url) {
    if (!url) return '';
    try {
        const driveRegex1 = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
        const driveRegex2 = /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/;
        
        let match = url.match(driveRegex1) || url.match(driveRegex2);
        if (match && match[1]) {
            // Using lh3.googleusercontent.com is more stable for embedding images
            return `https://lh3.googleusercontent.com/d/${match[1]}`;
        }
    } catch(e) {}
    return url;
}

async function loadProjects() {
    try {
        const sheetRes = await fetch(WEB_APP_URL);
        const sheetProjects = await sheetRes.json();
        
        projects = sheetProjects.reverse();
        renderPortfolio();
    } catch (err) {
        console.error('Failed to load projects from API:', err);
    }
}

function renderPortfolio() {
    const grid = document.getElementById('portfolioGrid');
    if (!grid || projects.length === 0) return;

    grid.innerHTML = projects.map((p, i) => `
        <div class="portfolio-item reveal cyber-card" data-category="${p.filter}" data-delay="${i * 100}">
            <div class="portfolio-img-wrap">
                <img src="${getDirectImageUrl(p.thumbnail)}" alt="${p.title}" loading="lazy">
                <div class="portfolio-overlay">
                    <div class="overlay-content">
                        <span class="overlay-category">${p.category}</span>
                        <h3>${p.title}</h3>
                        <p>${p.shortDesc}</p>
                        <button class="btn btn-sm" onclick="openModal(${i})">View Details</button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    // Re-init portfolio filters
    initPortfolioFilters();

    // Trigger GSAP refresh since new elements were added
    if (window.initScrollAnimations) {
        setTimeout(window.initScrollAnimations, 100);
    }
}

function initPortfolioFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const items = document.querySelectorAll('.portfolio-item');

    filterBtns.forEach(btn => {
        // Remove old listeners by cloning
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        newBtn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            newBtn.classList.add('active');
            const filter = newBtn.getAttribute('data-filter');

            document.querySelectorAll('.portfolio-item').forEach(item => {
                const cats = item.getAttribute('data-category').split(',').map(c => c.trim());
                if (filter === 'all' || cats.includes(filter)) {
                    item.classList.remove('hidden');
                    item.style.animation = 'fadeInUp 0.5s ease-out forwards';
                } else {
                    item.classList.add('hidden');
                }
            });
        });
    });
}

// ============================================
// BEFORE & AFTER SLIDER
// ============================================
let baData = [];
let baCurrentIndex = 0;

async function loadBeforeAfter() {
    try {
        const res = await fetch('data/before-after.json');
        baData = await res.json();
        renderBeforeAfter(0);
        renderBaDots();
    } catch (err) {
        console.error('Failed to load before-after data:', err);
    }
}

function renderBeforeAfter(index) {
    const container = document.getElementById('baContainer');
    const titleEl = document.getElementById('baTitle');
    if (!container || baData.length === 0) return;

    baCurrentIndex = index;
    const pair = baData[index];

    container.innerHTML = `
        <img class="ba-img-after" src="${pair.imageAfter}" alt="${pair.labelAfter}">
        <img class="ba-img-before" src="${pair.imageBefore}" alt="${pair.labelBefore}" id="baBeforeImg">
        <div class="ba-handle" id="baHandle">
            <div class="ba-handle-line"></div>
            <div class="ba-handle-knob">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="8,4 4,12 8,20"/>
                    <polyline points="16,4 20,12 16,20"/>
                </svg>
            </div>
        </div>
        <span class="ba-label ba-label-before">${pair.labelBefore}</span>
        <span class="ba-label ba-label-after">${pair.labelAfter}</span>
    `;

    if (titleEl) titleEl.textContent = pair.title;

    // Update active dot
    document.querySelectorAll('.ba-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });

    // Init drag
    initBaDrag(container);
}

function renderBaDots() {
    const dotsContainer = document.getElementById('baDots');
    if (!dotsContainer) return;

    dotsContainer.innerHTML = baData.map((_, i) =>
        `<button class="ba-dot${i === 0 ? ' active' : ''}" onclick="renderBeforeAfter(${i})" aria-label="Pair ${i + 1}"></button>`
    ).join('');
}

function navigateBA(direction) {
    const next = (baCurrentIndex + direction + baData.length) % baData.length;
    renderBeforeAfter(next);
}

function initBaDrag(container) {
    let isDragging = false;

    function updateSlider(x) {
        const rect = container.getBoundingClientRect();
        let percent = ((x - rect.left) / rect.width) * 100;
        percent = Math.max(2, Math.min(98, percent));

        const beforeImg = document.getElementById('baBeforeImg');
        const handle = document.getElementById('baHandle');
        if (beforeImg) beforeImg.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
        if (handle) handle.style.left = percent + '%';
    }

    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        updateSlider(e.clientX);
    });
    document.addEventListener('mousemove', (e) => {
        if (isDragging) updateSlider(e.clientX);
    });
    document.addEventListener('mouseup', () => { isDragging = false; });

    container.addEventListener('touchstart', (e) => {
        isDragging = true;
        updateSlider(e.touches[0].clientX);
    }, { passive: true });
    container.addEventListener('touchmove', (e) => {
        if (isDragging) updateSlider(e.touches[0].clientX);
    }, { passive: true });
    container.addEventListener('touchend', () => { isDragging = false; });
}

// ============================================
// PARTICLE CANVAS BACKGROUND
// ============================================
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.connections = [];
        this.mouse = { x: null, y: null, radius: 150 };
        this.resize();
        this.init();
        this.animate();
        window.addEventListener('resize', () => this.resize());
        this.canvas.addEventListener('mousemove', (e) => {
            this.mouse.x = e.x;
            this.mouse.y = e.y;
        });
        this.canvas.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        this.particles = [];
        const numParticles = Math.min(80, Math.floor((this.canvas.width * this.canvas.height) / 12000));
        for (let i = 0; i < numParticles; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 0.5,
                color: Math.random() > 0.5 ? '0, 212, 255' : '124, 58, 237'
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            // Move
            p.x += p.vx;
            p.y += p.vy;
            // Bounce
            if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;
            // Mouse interaction
            if (this.mouse.x) {
                const dx = p.x - this.mouse.x;
                const dy = p.y - this.mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < this.mouse.radius) {
                    const force = (this.mouse.radius - dist) / this.mouse.radius;
                    p.x += dx * force * 0.02;
                    p.y += dy * force * 0.02;
                }
            }
            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${p.color}, 0.6)`;
            this.ctx.fill();
            // Draw connections
            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 140) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = `rgba(0, 212, 255, ${0.08 * (1 - dist / 140)})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            }
        }
        requestAnimationFrame(() => this.animate());
    }
}

// ============================================
// DOM READY
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // ============================================
    // THEME TOGGLE
    // ============================================
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('r24-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    themeToggle.addEventListener('click', () => {
        document.body.classList.add('theme-transitioning');
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('r24-theme', next);
        setTimeout(() => document.body.classList.remove('theme-transitioning'), 500);
    });

    // ============================================
    // LANGUAGE TOGGLE
    // ============================================
    const langToggle = document.getElementById('langToggle');
    const langLabel = document.getElementById('langLabel');
    if (langLabel) langLabel.textContent = currentLang === 'id' ? 'EN' : 'ID';

    langToggle.addEventListener('click', () => {
        const nextLang = currentLang === 'id' ? 'en' : 'id';
        loadLanguage(nextLang);
    });

    // Load initial language
    loadLanguage(currentLang);

    // Init particles
    const canvas = document.getElementById('particleCanvas');
    if (canvas) new ParticleSystem(canvas);

    // ============================================
    // THREE.JS INTERACTIVE HERO 3D
    // ============================================
    const heroCanvasContainer = document.getElementById('hero3DCanvas');
    if (heroCanvasContainer && typeof THREE !== 'undefined') {
        const scene = new THREE.Scene();

        // Setup Camera
        const camera = new THREE.PerspectiveCamera(45, heroCanvasContainer.clientWidth / heroCanvasContainer.clientHeight, 0.1, 100);
        camera.position.z = 5;

        // Setup Renderer
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(heroCanvasContainer.clientWidth, heroCanvasContainer.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap pixel ratio for performance
        // Adjust tone mapping to make colors pop
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        renderer.outputEncoding = THREE.sRGBEncoding;
        heroCanvasContainer.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
        dirLight.position.set(5, 5, 5);
        scene.add(dirLight);

        const blueLight = new THREE.PointLight(0x00d4ff, 2, 10);
        blueLight.position.set(-3, 2, 2);
        scene.add(blueLight);

        const purpleLight = new THREE.PointLight(0x7c3aed, 2, 10);
        purpleLight.position.set(3, -2, 2);
        scene.add(purpleLight);

        // Variables for animation and interaction
        let model = null;
        let mouseX = 0;
        let mouseY = 0;
        const targetRotation = new THREE.Vector2();
        let isHeroVisible = true;
        let clock = new THREE.Clock(); // For floating animation

        // Load Suzanne GLB
        const loader = new THREE.GLTFLoader();
        loader.load('assets/suzanne.glb', (gltf) => {
            model = gltf.scene;

            // ADJUSTMENT: Kurangi scale agar tidak terpotong
            model.scale.set(1, 1, 1);

            // Adjusment position
            model.position.set(0, -1, 0); // (X, Y, Z)


            // ADJUSTMENT: Set rotasi awal menghadap ke depan
            model.rotation.y = 0;

            scene.add(model);
        }, undefined, (error) => {
            console.error('Error loading 3D model:', error);
        });

        // Track Mouse
        document.addEventListener('mousemove', (event) => {
            // Normalize mouse coordinates (-1 to +1)
            mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

            // ADJUSTMENT: Sesuaikan arah rotasi
            // targetRotation.x (Mendongak/Menunduk) dibalik (minus) agar pas dengan mouseY
            // targetRotation.y (Kiri/Kanan) tetap positif agar pas dengan mouseX
            targetRotation.x = -mouseY * 0.4;
            targetRotation.y = mouseX * 0.4;
        });

        // Animation Loop
        const animate3D = () => {
            if (!isHeroVisible) return; // Pause rendering if not visible

            requestAnimationFrame(animate3D);

            const elapsedTime = clock.getElapsedTime();

            if (model) {
                // Lerp for smooth tracking
                model.rotation.x += (targetRotation.x - model.rotation.x) * 0.05;
                model.rotation.y += (targetRotation.y - model.rotation.y) * 0.05;

                // Animasi floating dihapus agar kamu bebas bereksperimen dengan posisi!
            }

            renderer.render(scene, camera);
        };

        animate3D();

        // Handle Window Resize
        window.addEventListener('resize', () => {
            if (!heroCanvasContainer) return;
            const width = heroCanvasContainer.clientWidth;
            const height = heroCanvasContainer.clientHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        });

        // Setup Intersection Observer to pause animation when scrolled past
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                isHeroVisible = entry.isIntersecting;
                if (isHeroVisible) {
                    clock.start(); // Resume clock smoothly
                    animate3D();
                } else {
                    clock.stop();
                }
            });
        }, { threshold: 0 });

        const heroSection = document.getElementById('hero');
        if (heroSection) observer.observe(heroSection);
    }

    // ============================================
    // NAVBAR
    // ============================================
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        updateActiveNav();
    });

    // Mobile toggle
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Active nav highlight
    function updateActiveNav() {
        const sections = document.querySelectorAll('.section, .hero');
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    // ============================================
    // STAT COUNTER ANIMATION
    // ============================================
    const statNumbers = document.querySelectorAll('.stat-number');
    let statsCounted = false;

    function animateStats() {
        if (statsCounted) return;
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'));
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;
            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    stat.textContent = target;
                    clearInterval(timer);
                } else {
                    stat.textContent = Math.floor(current);
                }
            }, 16);
        });
        statsCounted = true;
    }

    // ============================================
    // GSAP SCROLL REVEAL (IN-OUT ANIMATION)
    // ============================================
    gsap.registerPlugin(ScrollTrigger);

    window.initScrollAnimations = function () {
        // Clear previous triggers if re-initializing
        ScrollTrigger.getAll().forEach(t => t.kill());

        const revealElements = gsap.utils.toArray('.reveal');

        revealElements.forEach(el => {
            // Force transition to none so CSS doesn't fight GSAP
            gsap.set(el, { autoAlpha: 0, y: 50, scale: 0.95 });
            el.style.transition = "none";

            const delayAttr = el.getAttribute('data-delay') || 0;
            const delayTime = (parseFloat(delayAttr) / 1000) * 0.4; // 60% faster delays

            ScrollTrigger.create({
                trigger: el,
                start: "top 90%",
                end: "bottom 10%",
                toggleActions: "play reverse play reverse",
                animation: gsap.to(el, {
                    duration: 0.5,
                    autoAlpha: 1,
                    y: 0,
                    scale: 1,
                    delay: delayTime,
                    ease: "power3.out", // Smoother unified motion without scale bouncing weirdly
                    onStart: () => { el.style.transition = "none"; },
                    onComplete: () => { el.style.removeProperty("transition"); },
                    onReverseComplete: () => { el.style.transition = "none"; }
                })
            });
        });

        // Specialized Animation for Section Headers
        const sectionHeaders = gsap.utils.toArray('.section-header');
        sectionHeaders.forEach(header => {
            const tag = header.querySelector('.section-tag');
            const title = header.querySelector('.section-title');

            if (tag && title) {
                gsap.set(tag, { autoAlpha: 0, x: -30 });
                gsap.set(title, { autoAlpha: 0, x: 30 });
                tag.style.transition = "none";
                title.style.transition = "none";

                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: header,
                        start: "top 90%",
                        end: "bottom 10%",
                        toggleActions: "play reverse play reverse"
                    },
                    onStart: () => { tag.style.transition = "none"; title.style.transition = "none"; },
                    onComplete: () => { tag.style.removeProperty("transition"); title.style.removeProperty("transition"); },
                    onReverseComplete: () => { tag.style.transition = "none"; title.style.transition = "none"; }
                });

                tl.to(tag, { duration: 0.4, autoAlpha: 1, x: 0, ease: "power3.out" })
                    .to(title, { duration: 0.5, autoAlpha: 1, x: 0, ease: "power3.out" }, "-=0.2");
            }
        });
        ScrollTrigger.refresh();
    };

    // Run once immediately for static HTML elements
    initScrollAnimations();

    // Stats observer
    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        const statsObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                animateStats();
            }
        }, { threshold: 0.5 });
        statsObserver.observe(heroStats);
    }


    // ============================================
    // BEFORE & AFTER — Load from JSON
    // ============================================
    loadBeforeAfter();
    // ============================================
    // CONTACT FORM
    // ============================================
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('submitBtn');
            const originalContent = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span>Message Sent! ✓</span>';
            submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            submitBtn.disabled = true;

            setTimeout(() => {
                submitBtn.innerHTML = originalContent;
                submitBtn.style.background = '';
                submitBtn.disabled = false;
                form.reset();
            }, 3000);
        });
    }

    // ============================================
    // MAGNETIC BUTTON EFFECT
    // ============================================
    const magneticElements = document.querySelectorAll('.magnetic');
    
    magneticElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            gsap.to(el, {
                x: x * 0.4,
                y: y * 0.4,
                duration: 0.3,
                ease: "power2.out"
            });
        });

        el.addEventListener('mouseleave', () => {
            gsap.to(el, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: "elastic.out(1, 0.3)"
            });
        });
    });
});

// ============================================
// MODAL SLIDER (GLOBAL)
// ============================================
let currentSlide = 0;
let currentImages = [];

function openModal(index) {
    const modal = document.getElementById('projectModal');
    const project = projects[index];
    currentImages = project.images;
    currentSlide = 0;

    // Build slider images
    const track = document.getElementById('sliderTrack');
    track.innerHTML = currentImages.map(src =>
        `<img src="${getDirectImageUrl(src)}" alt="${project.title}" loading="lazy">`
    ).join('');
    track.style.transform = 'translateX(0)';

    // Build dots
    const dotsContainer = document.getElementById('sliderDots');
    dotsContainer.innerHTML = currentImages.map((_, i) =>
        `<button class="slider-dot${i === 0 ? ' active' : ''}" onclick="goToSlide(${i})"></button>`
    ).join('');

    // Fill info
    document.getElementById('modalCategory').textContent = project.category;
    document.getElementById('modalTitle').textContent = project.title;
    document.getElementById('modalDesc').textContent = project.description;
    document.getElementById('modalClient').textContent = project.client;
    document.getElementById('modalTools').textContent = project.tools;
    document.getElementById('modalDuration').textContent = project.duration;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function slideModal(direction) {
    currentSlide += direction;
    if (currentSlide < 0) currentSlide = currentImages.length - 1;
    if (currentSlide >= currentImages.length) currentSlide = 0;
    updateSlider();
}

function goToSlide(index) {
    currentSlide = index;
    updateSlider();
}

function updateSlider() {
    const track = document.getElementById('sliderTrack');
    track.style.transform = `translateX(-${currentSlide * 100}%)`;

    // Update dots
    const dots = document.querySelectorAll('.slider-dot');
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlide);
    });
}

function closeModal() {
    const modal = document.getElementById('projectModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('projectModal');
    if (!modal.classList.contains('active')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') slideModal(-1);
    if (e.key === 'ArrowRight') slideModal(1);
});
