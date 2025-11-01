// GIS Portfolio

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavigation();
    initScrollProgress();
    loadProjects(); // This will load projects and init filters & modal
    initSmoothScroll();
    initAnimations();
    initParallax();
    initLightbox();
    initLazyLoading();
});

// Scroll Progress Indicator
function initScrollProgress() {
    const progressBar = document.getElementById('scrollProgress');
    if (!progressBar) return;

    window.addEventListener('scroll', function() {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.pageYOffset / windowHeight) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

// Navigation functionality
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!navbar || !navToggle || !navMenu) return;

    // Mobile menu toggle
    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Close mobile menu when link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // Navbar scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Hide/show navbar on scroll
        if (currentScroll > lastScroll && currentScroll > 500) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        lastScroll = currentScroll;
    });

    // Active nav link highlighting
    const sections = document.querySelectorAll('section[id]');

    function highlightNavLink() {
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => link.classList.remove('active'));
                if (navLink) navLink.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', highlightNavLink);
}

// Project filtering system (for card grid)
function initProjectFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card[data-category]');

    if (filterButtons.length === 0) return;

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');

            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Hide non-matching cards
            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filter !== 'all' && category !== filter) {
                    hideCard(card);
                }
            });

            // Show matching cards
            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    showCard(card);
                }
            });
        });
    });

    function showCard(card) {
        card.style.display = 'flex';
        card.style.opacity = '0';
        card.style.opacity = '1';
    }

    function hideCard(card) {
        card.style.opacity = '0';
        card.style.display = 'none';
    }
}

// Smooth scrolling for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');

            if (targetId === '#' || targetId === '') return;

            e.preventDefault();

            const target = document.querySelector(targetId);
            if (target) {
                const offset = 100; // Navbar offset
                const targetPosition = target.offsetTop - offset;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Parallax scrolling effect
function initParallax() {
    const parallaxElements = document.querySelectorAll('.parallax-image');

    if (parallaxElements.length === 0) return;

    window.addEventListener('scroll', function() {
        parallaxElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            // Apply in viewport only
            if (rect.top < windowHeight && rect.bottom > 0) {
                const scrolled = window.pageYOffset;
                const elementTop = element.offsetTop;
                const distance = scrolled - elementTop;
                const movement = distance * 0.1; // Parallax speed

                element.style.transform = `translateY(${movement}px)`;
            }
        });
    });
}

// Lightbox modal for images
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxClose = document.getElementById('lightboxClose');
    const clickableImages = document.querySelectorAll('[data-lightbox="true"]');

    if (!lightbox || !lightboxImage || !lightboxClose) return;

    // Open lightbox when image is clicked
    clickableImages.forEach(image => {
        image.addEventListener('click', function() {
            const imageSrc = this.src || this.getAttribute('src');
            const imageAlt = this.alt || 'Project Image';

            lightboxImage.src = imageSrc;
            lightboxImage.alt = imageAlt;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        image.style.cursor = 'pointer';
    });

    // Close lightbox on close button click
    lightboxClose.addEventListener('click', closeLightbox);

    // Close lightbox on background click
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Close lightbox on ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        // Clear image after animation
        setTimeout(() => {
            if (!lightbox.classList.contains('active')) {
                lightboxImage.src = '';
            }
        }, 300);
    }
}

// Load and render projects from JSON
let projectsData = [];

async function loadProjects() {
    try {
        const response = await fetch('projects.json');
        projectsData = await response.json();
        renderProjectCards();
        initProjectFilters();
        initProjectModal();
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

// Render project cards dynamically
function renderProjectCards() {
    const projectsGrid = document.getElementById('projectsGrid');
    if (!projectsGrid) return;

    projectsGrid.innerHTML = '';

    projectsData.forEach(project => {
        const article = document.createElement('article');
        article.className = 'project-card';
        article.setAttribute('data-category', project.category);
        article.setAttribute('data-project-id', project.id);

        // Handle special SVG case for project 8
        let imageHTML;
        if (project.image === 'svg') {
            imageHTML = `
                <div class="project-card-image hab-card-image">
                    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <radialGradient id="algaeGradient">
                                <stop offset="0%" stop-color="#27ae60" stop-opacity="0.8"/>
                                <stop offset="100%" stop-color="#16a085" stop-opacity="0.3"/>
                            </radialGradient>
                        </defs>
                        <ellipse cx="200" cy="150" rx="150" ry="100" fill="url(#algaeGradient)"/>
                        <circle cx="180" cy="130" r="15" fill="#27ae60" opacity="0.6"/>
                        <circle cx="220" cy="160" r="12" fill="#27ae60" opacity="0.7"/>
                        <circle cx="200" cy="145" r="18" fill="#2ecc71" opacity="0.8"/>
                        <path d="M150 150 Q200 120 250 150" stroke="#16a085" stroke-width="2" fill="none" opacity="0.5"/>
                    </svg>
                    <div class="project-card-overlay">
                        <span class="view-details-btn">View Details</span>
                    </div>
                </div>
            `;
        } else {
            imageHTML = `
                <div class="project-card-image">
                    <img src="${project.image}" alt="${project.title}">
                    <div class="project-card-overlay">
                        <span class="view-details-btn">View Details</span>
                    </div>
                </div>
            `;
        }

        // Capitalize category for display
        const categoryDisplay = project.category.charAt(0).toUpperCase() + project.category.slice(1);

        article.innerHTML = `
            ${imageHTML}
            <div class="project-card-content">
                <span class="project-card-category">${categoryDisplay}</span>
                <h3 class="project-card-title">${project.title}</h3>
                <p class="project-card-description">${project.description}</p>
            </div>
        `;

        projectsGrid.appendChild(article);
    });
}

// Project Modal System
function initProjectModal() {
    const modal = document.getElementById('projectModal');
    const modalClose = document.getElementById('projectModalClose');
    const modalOverlay = document.getElementById('projectModalOverlay');

    if (!modal) return;

    // Open modal when card is clicked
    document.addEventListener('click', function(e) {
        const card = e.target.closest('.project-card');
        if (!card) return;

        // Don't open if clicking on a link
        if (e.target.tagName === 'A') return;

        const projectId = card.getAttribute('data-project-id');
        const project = projectsData.find(p => p.id === projectId);

        if (!project) return;

        // Populate modal
        const modalImage = document.getElementById('projectModalImage');
        if (project.image === 'svg') {
            modalImage.src = 'assets/images/Liquefaction-Risk-Layout.jpg'; // Placeholder image
        } else {
            modalImage.src = project.image;
        }
        modalImage.alt = project.title;

        const categoryDisplay = project.category.charAt(0).toUpperCase() + project.category.slice(1);
        document.getElementById('projectModalCategory').textContent = categoryDisplay;
        document.getElementById('projectModalTitle').textContent = project.title;
        document.getElementById('projectModalLead').textContent = project.lead;
        document.getElementById('projectModalDescription').textContent = project.fullDescription;

        // Add PDF link if exists
        const actionsContainer = document.getElementById('projectModalActions');
        actionsContainer.innerHTML = '';
        if (project.pdfLink) {
            const pdfButton = document.createElement('a');
            pdfButton.href = project.pdfLink;
            pdfButton.className = 'btn btn-primary';
            pdfButton.target = '_blank';
            pdfButton.textContent = 'View Research Poster';
            actionsContainer.appendChild(pdfButton);
        }

        // Show modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    // Close modal handlers
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

    // ESC key closes modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

// Scroll animations with IntersectionObserver
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                // Optional: unobserve after animation
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const elementsToAnimate = document.querySelectorAll(
        '.hero-bio-section, .skill-chip, .connect-btn, .project-card, .section-title'
    );

    elementsToAnimate.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Add fade-in class handler
    const style = document.createElement('style');
    style.textContent = `
        .fade-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
}

// Lazy loading for images
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');

    if (images.length === 0) return;

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback
        images.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
}

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
    const navMenu = document.getElementById('navMenu');
    const navToggle = document.getElementById('navToggle');

    // ESC key closes mobile menu
    if (e.key === 'Escape') {
        if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            if (navToggle) navToggle.classList.remove('active');
        }
    }
});

// Print-friendly version
window.addEventListener('beforeprint', function() {
    document.body.classList.add('print-mode');
});

window.addEventListener('afterprint', function() {
    document.body.classList.remove('print-mode');
});

// Export utilities for external use
window.portfolioUtils = {
    initLightbox,
    initParallax
};

// Smooth reveal on load
window.addEventListener('load', function() {
    document.body.style.opacity = '1';
    document.body.style.transition = 'opacity 0.3s ease';
});

// For fun
console.log('%c Ashton Gibson - GIS Portfolio ', 'background: #4a90e2; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;');

// Topographic Background
// Perlin Noise Generator
class PerlinNoise {
  constructor() {
    this.permutation = [];
    this.p = [];
    for(let i=0;i<256;i++) this.permutation[i]=i;
    for(let i=255;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [this.permutation[i],this.permutation[j]]=[this.permutation[j],this.permutation[i]];
    }
    for(let i=0;i<512;i++) this.p[i]=this.permutation[i%256];
  }
  fade(t){ return t*t*t*(t*(t*6-15)+10); }
  lerp(t,a,b){ return a+t*(b-a); }
  grad(hash,x,y,z){
    const h=hash&15,u=h<8?x:y,v=h<4?y:h===12||h===14?x:z;
    return ((h&1)===0?u:-u)+((h&2)===0?v:-v);
  }
  noise(x,y,z=0){
    const X=Math.floor(x)&255,Y=Math.floor(y)&255,Z=Math.floor(z)&255;
    x-=Math.floor(x);y-=Math.floor(y);z-=Math.floor(z);
    const u=this.fade(x),v=this.fade(y),w=this.fade(z);
    const A=this.p[X]+Y,AA=this.p[A]+Z,AB=this.p[A+1]+Z,B=this.p[X+1]+Y,BA=this.p[B]+Z,BB=this.p[B+1]+Z;
    const res=this.lerp(w,
      this.lerp(v,
        this.lerp(u,this.grad(this.p[AA],x,y,z),this.grad(this.p[BA],x-1,y,z)),
        this.lerp(u,this.grad(this.p[AB],x,y-1,z),this.grad(this.p[BB],x-1,y-1,z))
      ),
      this.lerp(v,
        this.lerp(u,this.grad(this.p[AA+1],x,y,z-1),this.grad(this.p[BA+1],x-1,y,z-1)),
        this.lerp(u,this.grad(this.p[AB+1],x,y-1,z-1),this.grad(this.p[BB+1],x-1,y-1,z-1))
      )
    );
    return (res+1)/2;
  }
  terrainNoise(x,y,z,octaves=4,persistence=0.5,lacunarity=2){
    let total=0,amp=1,freq=1,max=0;
    for(let i=0;i<octaves;i++){
      total+=this.noise(x*freq,y*freq,z)*amp;
      max+=amp;
      amp*=persistence; freq*=lacunarity;
    }
    return total/max;
  }
}

// Static Topographic Map
class FastTopographicMap {
  constructor() {
    this.canvas = document.getElementById("topographic-background");
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext("2d");
    this.perlin = new PerlinNoise();

    this.cellSize = 16;
    this.noiseScale = 0.03;

    this.elevationColors = [
      { threshold:0.0,color:{r:5,g:45,b:110}},
      { threshold:0.15,color:{r:15,g:75,b:140}},
      { threshold:0.25,color:{r:35,g:105,b:170}},
      { threshold:0.3,color:{r:65,g:145,b:200}},
      { threshold:0.35,color:{r:235,g:220,b:180}},
      { threshold:0.4,color:{r:140,g:200,b:120}},
      { threshold:0.5,color:{r:80,g:160,b:80}},
      { threshold:0.6,color:{r:50,g:120,b:50}},
      { threshold:0.7,color:{r:140,g:120,b:80}},
      { threshold:0.8,color:{r:120,g:100,b:70}},
      { threshold:0.88,color:{r:140,g:140,b:140}},
      { threshold:0.95,color:{r:250,g:250,b:250}}
    ];

    this.contourLevels = 20;
    this.contourColors = {
      water: 'rgba(0,50,100,0.3)',
      land: 'rgba(80,60,40,0.4)',
      mountain: 'rgba(60,60,60,0.5)'
    };

    window.addEventListener("resize",()=>this.onResize());
    this.onResize(); // initial render
  }

  onResize(){
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.cols = Math.ceil(this.width/this.cellSize)+2;
    this.rows = Math.ceil(this.height/this.cellSize)+2;
    this.grid = new Float32Array(this.cols*this.rows);

    this.renderStaticMap();
  }

  generateTerrain(){
    for(let y=0;y<this.rows;y++){
      for(let x=0;x<this.cols;x++){
        const idx=y*this.cols+x;
        let e=this.perlin.terrainNoise(x*this.noiseScale,y*this.noiseScale,0.5,4,0.55,2);
        this.grid[idx]=Math.pow(e,1.2);
      }
    }
  }

  sampleGrid(x,y){
    const gx=x/this.cellSize, gy=y/this.cellSize;
    const x0=Math.floor(gx), x1=Math.min(x0+1,this.cols-1);
    const y0=Math.floor(gy), y1=Math.min(y0+1,this.rows-1);
    const sx=gx-x0, sy=gy-y0;
    const v00=this.grid[y0*this.cols+x0], v10=this.grid[y0*this.cols+x1],
          v01=this.grid[y1*this.cols+x0], v11=this.grid[y1*this.cols+x1];
    const v0=v00*(1-sx)+v10*sx;
    const v1=v01*(1-sx)+v11*sx;
    return v0*(1-sy)+v1*sy;
  }

  getColor(e){
    for(let i=0;i<this.elevationColors.length-1;i++){
      const c0=this.elevationColors[i], c1=this.elevationColors[i+1];
      if(e>=c0.threshold && e<c1.threshold){
        const t=(e-c0.threshold)/(c1.threshold-c0.threshold);
        const r=Math.floor(c0.color.r+(c1.color.r-c0.color.r)*t);
        const g=Math.floor(c0.color.g+(c1.color.g-c0.color.g)*t);
        const b=Math.floor(c0.color.b+(c1.color.b-c0.color.b)*t);
        return [r,g,b];
      }
    }
    const last=this.elevationColors[this.elevationColors.length-1].color;
    return [last.r,last.g,last.b];
  }

  renderBackground(){
    const img=this.ctx.createImageData(this.width,this.height);
    const d=img.data;
    for(let y=0;y<this.height;y++){
      for(let x=0;x<this.width;x++){
        const e=this.sampleGrid(x,y);
        const [r,g,b]=this.getColor(e);
        const i=(y*this.width+x)*4;
        d[i]=r; d[i+1]=g; d[i+2]=b; d[i+3]=255;
      }
    }
    this.ctx.putImageData(img,0,0);
  }

  renderContours(){
    const ctx=this.ctx;
    for(let level=0;level<this.contourLevels;level++){
      const threshold=level/this.contourLevels;
      ctx.beginPath();
      let style=this.contourColors.land;
      if(threshold<0.35) style=this.contourColors.water;
      else if(threshold>0.8) style=this.contourColors.mountain;
      ctx.strokeStyle=style;
      ctx.lineWidth=(level%5===0)?1.2:0.5;

      for(let y=0;y<this.rows-1;y++){
        for(let x=0;x<this.cols-1;x++){
          const i=y*this.cols+x;
          const tl=this.grid[i], tr=this.grid[i+1],
                bl=this.grid[i+this.cols], br=this.grid[i+this.cols+1];
          const state=(tl>threshold)<<3|(tr>threshold)<<2|(br>threshold)<<1|(bl>threshold);
          if(state&&state!==15){
            const px=x*this.cellSize, py=y*this.cellSize, s=this.cellSize;
            const lerp=(a,b)=>(threshold-a)/(b-a);
            switch(state){
              case 1:case 14: ctx.moveTo(px,py+s*lerp(tl,bl));ctx.lineTo(px+s*lerp(bl,br),py+s);break;
              case 2:case 13: ctx.moveTo(px+s*lerp(bl,br),py+s);ctx.lineTo(px+s,py+s*lerp(tr,br));break;
              case 3:case 12: ctx.moveTo(px,py+s*lerp(tl,bl));ctx.lineTo(px+s,py+s*lerp(tr,br));break;
              case 4:case 11: ctx.moveTo(px+s*lerp(tl,tr),py);ctx.lineTo(px+s,py+s*lerp(tr,br));break;
              case 6:case 9: ctx.moveTo(px+s*lerp(tl,tr),py);ctx.lineTo(px+s*lerp(bl,br),py+s);break;
              case 7:case 8: ctx.moveTo(px,py+s*lerp(tl,bl));ctx.lineTo(px+s*lerp(tl,tr),py);break;
            }
          }
        }
      }
      ctx.stroke();
    }
  }

  renderStaticMap(){
    const t0=performance.now();
    this.generateTerrain();
    this.renderBackground();
    this.renderContours();
    // console.log("Rendered in",(performance.now()-t0).toFixed(1),"ms");
  }
}

// Initialize static topographic background
document.addEventListener('DOMContentLoaded', () => {
    new FastTopographicMap();
});
