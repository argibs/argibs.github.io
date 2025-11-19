// 30 Day Map Challenge 2025 - Calendar and Modal Logic
// Load and render November 2025 calendar with project cards

let challengeData = [];

document.addEventListener('DOMContentLoaded', () => {
    // Only run on challenge page
    if (document.getElementById('calendarGrid')) {
        loadChallengeData();
        initChallengeLightbox();
    }
});

async function loadChallengeData() {
    try {
        const response = await fetch('challenge2025.json');
        if (!response.ok) {
            throw new Error('Failed to load challenge data');
        }
        challengeData = await response.json();
        renderCalendar();
        initChallengeModal();
    } catch (error) {
        console.error('Error loading challenge data:', error);
        // Still render calendar structure even if data fails to load
        renderCalendar();
        initChallengeModal();
    }
}

// Generate algae SVG filler for days without images
// Returns same algae graphic for all days
function getAlgaeFiller() {
    const svg = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
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
    </svg>`;
    return 'data:image/svg+xml;base64,' + btoa(svg);
}

function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    if (!grid) return;

    grid.innerHTML = ''; // Clear existing content

    // Render all 30 days in a simple grid
    for (let day = 1; day <= 30; day++) {
        const dayData = challengeData.find(d => d.day === day) || { day: day };
        const dayCard = createDayCard(dayData);
        grid.appendChild(dayCard);
    }
}

function createDayCard(dayData) {
    const card = document.createElement('div');
    card.className = 'calendar-day';
    card.dataset.day = dayData.day;

    // Build card HTML
    let cardHTML = `<div class="calendar-day-number">${dayData.day}</div>`;

    // Add image - use algae filler if no real image
    if (dayData.image && dayData.image.trim() !== '') {
        cardHTML += `<img src="${escapeHtml(dayData.image)}" alt="Day ${dayData.day}" class="calendar-day-image">`;
    } else {
        // Use algae SVG for days without images
        const algaeDataUrl = getAlgaeFiller();
        cardHTML += `<img src="${algaeDataUrl}" alt="Day ${dayData.day}" class="calendar-day-image calendar-algae-filler">`;
    }

    // Add title if available
    if (dayData.title && dayData.title.trim() !== '') {
        cardHTML += `<div class="calendar-day-title">${escapeHtml(dayData.title)}</div>`;
    }

    card.innerHTML = cardHTML;

    // Add click handler to open modal (even for empty days)
    card.addEventListener('click', () => openChallengeModal(dayData));

    return card;
}

function initChallengeModal() {
    const modal = document.getElementById('challengeModal');
    const closeBtn = document.getElementById('modalClose');
    const overlay = document.getElementById('modalOverlay');

    if (!modal || !closeBtn || !overlay) return;

    // Close button click
    closeBtn.addEventListener('click', closeChallengeModal);

    // Overlay click
    overlay.addEventListener('click', closeChallengeModal);

    // ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeChallengeModal();
        }
    });
}

function openChallengeModal(dayData) {
    const modal = document.getElementById('challengeModal');
    if (!modal) return;

    // Populate modal content
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalDay = document.getElementById('modalDay');
    const modalDescription = document.getElementById('modalDescription');
    const modalFullDescription = document.getElementById('modalFullDescription');

    // Set image - use algae filler if no real image
    if (dayData.image && dayData.image.trim() !== '') {
        modalImage.src = dayData.image;
        modalImage.alt = dayData.title || `Day ${dayData.day}`;
        modalImage.style.display = 'block';

        // Make image clickable for lightbox
        modalImage.style.cursor = 'pointer';
        modalImage.onclick = () => openChallengeLightbox(dayData.image);
    } else {
        // Use algae SVG for modal
        const algaeDataUrl = getAlgaeFiller();
        modalImage.src = algaeDataUrl;
        modalImage.alt = `Day ${dayData.day}`;
        modalImage.style.display = 'block';

        // Make algae filler clickable for lightbox too
        modalImage.style.cursor = 'pointer';
        modalImage.onclick = () => openChallengeLightbox(algaeDataUrl);
    }

    // Set title
    modalTitle.textContent = dayData.title || `Day ${dayData.day}`;

    // Set day info
    modalDay.textContent = `November ${dayData.day}, 2025`;

    // Set short description (theme)
    if (dayData.description && dayData.description.trim() !== '') {
        modalDescription.textContent = dayData.description;
        modalDescription.style.display = 'block';
    } else {
        modalDescription.style.display = 'none';
    }

    // Set full description (detailed story)
    if (dayData.fullDescription && dayData.fullDescription.trim() !== '') {
        modalFullDescription.textContent = dayData.fullDescription;
        modalFullDescription.style.display = 'block';
    } else {
        modalFullDescription.style.display = 'none';
    }

    // If neither description exists, show placeholder
    if ((!dayData.description || dayData.description.trim() === '') &&
        (!dayData.fullDescription || dayData.fullDescription.trim() === '')) {
        modalDescription.textContent = 'No description available yet.';
        modalDescription.style.display = 'block';
    }

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeChallengeModal() {
    const modal = document.getElementById('challengeModal');
    if (!modal) return;

    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Lightbox functions for modal images
function openChallengeLightbox(imageSrc) {
    const lightbox = document.getElementById('challengeLightbox');
    const lightboxImage = document.getElementById('challengeLightboxImage');

    if (!lightbox || !lightboxImage || !imageSrc) return;

    lightboxImage.src = imageSrc;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeChallengeLightbox() {
    const lightbox = document.getElementById('challengeLightbox');
    if (!lightbox) return;

    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

// Initialize lightbox event handlers
function initChallengeLightbox() {
    const lightboxClose = document.getElementById('challengeLightboxClose');
    const lightbox = document.getElementById('challengeLightbox');

    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeChallengeLightbox);
    }

    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeChallengeLightbox();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox && lightbox.classList.contains('active')) {
            closeChallengeLightbox();
        }
    });
}

// Utility: Escape HTML to prevent XSS
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
