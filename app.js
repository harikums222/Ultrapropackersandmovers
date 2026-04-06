// Ultra Pro Packers & Movers - JavaScript functionality

document.addEventListener('DOMContentLoaded', function () {
    // 1. Core Visuals & UI
    initializeNavigation();
    initializeNavigationObserver();
    initializeMobileMenu();
    initializeServiceCardTilt();
    initializeScrollEffects();
    initializeRevealObserver(); // Integrated animations & stats

    // 2. Interactive Lead Capture
    initializeContactForm(); // Restored
    initializeServicesTabs();
    initializeDynamicGallery();

    // 3. Authority & Tracking
    initializeEventTracking();
});

// Navigation functionality
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link, .footer-links .nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            if (href.startsWith('#') || href.includes(window.location.pathname.split('/').pop() + '#')) {
                const hash = href.includes('#') ? href.substring(href.indexOf('#')) : href;
                const targetSection = document.querySelector(hash);

                if (targetSection) {
                    e.preventDefault();
                    smoothScrollTo(targetSection);
                    closeMobileMenu();
                }
            }
        });
    });
}

// Smooth scrolling functionality
function smoothScrollTo(element) {
    const headerHeight = document.querySelector('.header').offsetHeight;
    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
}

// Scroll to contact section (used by quote buttons)
/**
 * Scrolls smoothly to the contact section of the page and focuses on the first input field.
 * If the contact section exists, it uses `smoothScrollTo` to scroll to it,
 * then after a short delay, focuses the input field with the ID 'name' if present.
 */
function scrollToContact() {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
        smoothScrollTo(contactSection);
        // Focus on the first form field after scrolling
        setTimeout(() => {
            const firstInput = document.getElementById('name');
            if (firstInput) {
                firstInput.focus();
            }
        }, 500);
    }
}

// Update active navigation link based on scroll position - Re-implemented with IntersectionObserver for efficiency
function initializeNavigationObserver() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    if (!sections.length || !navLinks.length) return;

    const options = {
        rootMargin: '-20% 0px -70% 0px', // Trigger when section is in top-ish part of viewport
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}` || link.getAttribute('href').endsWith(`#${id}`)) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, options);

    sections.forEach(section => observer.observe(section));
}

// Mobile menu functionality
function initializeMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.nav');

    if (mobileMenuToggle && nav) {
        // Close mobile menu when clicking outside
        document.addEventListener('click', function (e) {
            if (!nav.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                closeMobileMenu();
            }
        });

        // Close mobile menu on window resize
        window.addEventListener('resize', function () {
            if (window.innerWidth > 768) {
                closeMobileMenu();
            }
        });
    }
}

// Toggle mobile menu
function toggleMobileMenu() {
    const nav = document.querySelector('.nav');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');

    if (nav && mobileMenuToggle) {
        nav.classList.toggle('mobile-open');
        mobileMenuToggle.classList.toggle('active');
    }
}

// Close mobile menu
function closeMobileMenu() {
    const nav = document.querySelector('.nav');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');

    if (nav && mobileMenuToggle) {
        nav.classList.remove('mobile-open');
        mobileMenuToggle.classList.remove('active');
    }
}

// Contact form functionality
function initializeContactForm() {
    // 1. Main Landing Page Form
    const contactForm = document.getElementById('quoteForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmission);
        const formInputs = contactForm.querySelectorAll('input, select, textarea');
        formInputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', (e) => {
                clearFieldError(e);
                if (e.target.type === 'tel') formatPhoneInput(e);
            });
        });
    }

    // 2. Quote Modal Form
    const modalForm = document.getElementById('modalQuoteForm');
    if (modalForm) {
        modalForm.addEventListener('submit', handleFormSubmission);
        const modalInputs = modalForm.querySelectorAll('input, select, textarea');
        modalInputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', (e) => {
                clearFieldError(e);
                if (e.target.type === 'tel') formatPhoneInput(e);
            });
        });
    }
}

// Phone input formatter
function formatPhoneInput(e) {
    const input = e.target;
    // Strip non-numeric characters
    const cleaned = input.value.replace(/\D/g, '');
    if (input.value !== cleaned) {
        input.value = cleaned;
    }
}

// Handle form submission
function handleFormSubmission(e) {
    e.preventDefault();

    const form = e.target;

    // Validate all fields before submission
    if (validateForm(form)) {
        const formData = new FormData(form);
        const formValues = Object.fromEntries(formData.entries());

        // Show loading state
        showFormLoading(form);

        // Submit to Vercel API
        submitToAPI(formValues, form);
    } else {
        // Validation failed - red borders and error messages will be shown by validateForm
    }
}

// Form validation
function validateForm(form) {
    let isValid = true;
    const allFields = form.querySelectorAll('input, select, textarea');

    allFields.forEach(field => {
        const fieldValid = validateField({ target: field });
        if (!fieldValid) {
            isValid = false;
        }
    });

    return isValid;
}

// Validate individual field
function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    const fieldType = field.type;
    const fieldName = field.name;

    // Remove existing error
    clearFieldError(e);

    let isValid = true;
    let errorMessage = '';

    // 1. Check if required field is empty
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    }
    // 2. Name validation (Alphabet only, max 50)
    else if (fieldName === 'name') {
        const nameRegex = /^[A-Za-z\s]+$/;
        if (!nameRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please use alphabets only';
        } else if (value.length > 50) {
            isValid = false;
            errorMessage = 'Maximum 50 characters allowed';
        }
    }
    // 3. Phone validation (Exactly 10 digits, allows starting with 0)
    else if (fieldType === 'tel' && value) {
        const digits = value.replace(/\D/g, '');
        if (digits.length !== 10) {
            isValid = false;
            errorMessage = 'Please enter exactly 10 digits';
        }
    }
    // 4. Email validation (Standard format, max 60)
    else if (fieldType === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Invalid email address';
        } else if (value.length > 60) {
            isValid = false;
            errorMessage = 'Maximum 60 characters allowed';
        }
    }
    // 5. Select field validation
    else if (field.tagName === 'SELECT' && field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'Please select an option';
    }
    // 6. Generic length checks (Moving From/To: 124, Notes: 255)
    else if ((fieldName === 'moving_from' || fieldName === 'moving_to') && value.length > 124) {
        isValid = false;
        errorMessage = 'Maximum 124 characters allowed';
    }
    else if (fieldName === 'additional_info' && value.length > 255) {
        isValid = false;
        errorMessage = 'Maximum 255 characters allowed';
    }

    if (!isValid) {
        showFieldError(field, errorMessage);
    }

    return isValid;
}

// Show field error
function showFieldError(field, message) {
    field.classList.add('error');

    // Add error message class for CSS-based styling
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;

    field.parentNode.appendChild(errorElement);
}

// Clear field error
function clearFieldError(e) {
    const field = e.target;
    field.classList.remove('error');

    const errorMessage = field.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

// Show form loading state
function showFormLoading(form) {
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    }
}

// Show form success state
function showFormSuccess(form) {
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Send Quote Request';
    }

    // Clear form
    form.reset();

    // Close quote modal if open
    closeQuoteModal();

    // Show success modal
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.classList.add('active');
    }

    // Google Ads & GA4 Tracking
    if (typeof gtag === 'function') {
        // 1. Google Ads Lead Conversion (Change YOUR_LABEL to yours later)
        gtag('event', 'conversion', {
            'send_to': 'AW-17847560693/Quote_Submission',
            'value': 1.0,
            'currency': 'INR'
        });

        // 2. GA4 standard lead event
        gtag('event', 'generate_lead', {
            'event_category': 'Engagement',
            'event_label': 'Quote Form Submission',
            'value': 1.0,
            'currency': 'INR'
        });

        console.log('Lead conversion tracked successfully');
    }
}

function resetFormSubmitButton(form) {
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Send Quote Request';
    }
}

// API Submission
async function submitToAPI(data, form) {
    const API_ENDPOINT = '/.netlify/functions/quote';

    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showFormSuccess(form);
        } else {
            console.error('Submission failed with status:', response.status);
            // TR0UBLESH00TING: Uncomment line below to see detailed server error
            // alert('Server Error: ' + response.status + ' ' + response.statusText);
            resetFormSubmitButton(form);
        }
    } catch (error) {
        console.error('API Connection Error:', error);
        // TR0UBLESH00TING: Uncomment line below if form is stuck in 'Sending...'
        // alert('Connection Error: Could not reach the server.');
        resetFormSubmitButton(form);
    }
}

// Modal functions
function openQuoteModal() {
    const modal = document.getElementById('quoteModal');
    if (modal) {
        modal.classList.add('active');
        document.body.classList.add('modal-open');
        // Small delay to allow CSS transition, then focus
        setTimeout(() => {
            const firstInput = document.getElementById('modal-name');
            if (firstInput) firstInput.focus();
        }, 400);
    }
}

function closeQuoteModal() {
    const modal = document.getElementById('quoteModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
}

function closeModal(modalId = 'successModal') {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
}


// Initialize scroll effects
function initializeScrollEffects() {
    // Add scroll event for header background
    window.addEventListener('scroll', function () {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.style.backgroundColor = 'var(--color-surface)';
            header.style.boxShadow = 'var(--shadow-md)';
        } else {
            header.style.backgroundColor = 'var(--color-surface)';
            header.style.boxShadow = 'var(--shadow-sm)';
        }
    });
}

// Unified Reveal Observer for animations and custom triggers
function initializeRevealObserver() {
    const options = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;

                // 1. Core Animation Trigger
                target.classList.add('animate');

                // 2. Specialized Triggers (Stats Counter)
                if (target.id === 'stat-projects' && !target.dataset.started) {
                    target.dataset.started = 'true';
                    animateStatsCounter(target);
                }

                // Stop observing if it's a one-time animation
                if (!target.hasAttribute('data-animate-repeat')) {
                    obs.unobserve(target);
                }
            }
        });
    }, options);

    // Register all elements
    const revealElements = document.querySelectorAll('.service-card, .contact-item, .about-text, [data-animate], #stat-projects');
    revealElements.forEach(el => observer.observe(el));
}
function animateStatsCounter(el) {
    const targetText = el.textContent.trim();
    const match = targetText.match(/(\d[\d,]*)/);
    if (!match) return;

    const target = parseInt(match[1].replace(/,/g, ''), 10);
    const suffix = targetText.replace(match[1], '');
    const duration = 1400;
    const formatNumber = (n) => n.toLocaleString('en-IN');

    const start = performance.now();
    const tick = (now) => {
        const p = Math.min(1, (now - start) / duration);
        const ease = 1 - Math.pow(1 - p, 3); // cubic out
        const current = Math.floor(target * ease);
        el.textContent = `${formatNumber(current)}${suffix}`;
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = `${formatNumber(target)}${suffix}`;
    };
    requestAnimationFrame(tick);
}

function initializeServiceCardTilt() {
    const cards = document.querySelectorAll('.service-card');
    if (!cards.length) return;

    const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

    cards.forEach(card => {
        let rafId = null;

        const getRect = () => card.getBoundingClientRect();
        const maxTilt = 10; // degrees
        const maxZ = 30; // px

        const onMove = (e) => {
            const rect = getRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = e.clientX - cx;
            const dy = e.clientY - cy;

            const nx = clamp(dx / (rect.width / 2), -1, 1);
            const ny = clamp(dy / (rect.height / 2), -1, 1);

            const rotateY = nx * maxTilt;
            const rotateX = -ny * maxTilt;

            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                card.classList.add('is-tilting');
                card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px) scale(1.03)`;
                const inner = card.querySelector('.service-card-inner') || card;
                inner.style.transform = `translateZ(${(Math.abs(nx) + Math.abs(ny)) * (maxZ / 1.6)}px)`;
            });
        };

        const onLeave = () => {
            if (rafId) cancelAnimationFrame(rafId);
            card.classList.remove('is-tilting');
            card.style.transform = '';
            const inner = card.querySelector('.service-card-inner') || card;
            inner.style.transform = '';
        };

        card.addEventListener('mouseenter', () => card.classList.add('is-tilting'));
        card.addEventListener('mousemove', onMove);
        card.addEventListener('mouseleave', onLeave);

        // Touch fallback: gentle pop
        card.addEventListener('touchstart', () => {
            card.classList.add('is-tilting');
            card.style.transform = 'translateY(-8px) scale(1.03)';
            const inner = card.querySelector('.service-card-inner') || card;
            inner.style.transform = 'translateZ(20px)';
        }, { passive: true });
        card.addEventListener('touchend', onLeave, { passive: true });
        card.addEventListener('touchcancel', onLeave, { passive: true });
    });
}

// Consolidated Event Tracking
function initializeEventTracking() {
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        const button = e.target.closest('button');

        // 1. Link Tracking (Phone, Email, WhatsApp)
        if (link) {
            const href = link.getAttribute('href') || '';
            let type = '';

            if (href.startsWith('tel:')) type = 'phone';
            else if (href.startsWith('mailto:')) type = 'email';
            else if (href.includes('wa.me') || href.includes('whatsapp.com')) type = 'whatsapp';

            if (type) {
                console.log(`${type} link clicked:`, href);
                trackEvent(`${type}_click`, { 'event_label': type });
            }
        }

        // 2. Button Tracking (Quote triggers)
        if (button) {
            const isQuoteBtn = button.classList.contains('quote-btn') ||
                button.classList.contains('hero-cta') ||
                button.classList.contains('service-quote-btn');

            if (isQuoteBtn) {
                console.log('Quote button clicked');
                trackEvent('quote_button_click', { 'event_label': button.textContent.trim() });
            }
        }
    });
}

// Helper to fire both GA4 and Ads events
function trackEvent(name, params = {}) {
    if (typeof gtag !== 'function') return;

    // GA4 Event
    gtag('event', name, {
        'event_category': 'Engagement',
        ...params
    });

    // Ads Conversion (Optional secondary)
    gtag('event', 'conversion', {
        'send_to': `AW-17847560693/${name}`,
        'value': 1.0,
        'currency': 'INR'
    });
}

// Removed: Now handled by unified reveal observer

function initializeServicesTabs() {
    const serviceGroups = document.querySelectorAll('.service-group');
    if (!serviceGroups.length) return;

    serviceGroups.forEach(group => {
        const trigger = group.querySelector('.service-trigger');
        if (!trigger) return;

        trigger.addEventListener('click', () => {
            const isMobile = window.innerWidth <= 768;
            const isActive = group.classList.contains('active');

            if (isMobile && isActive) {
                // Collapse if already active on mobile
                group.classList.remove('active');
                return;
            }

            // Toggle active state for current item
            group.classList.toggle('active');
        });
    });
}

// Dynamic Gallery Logic
const GALLERY_CONFIG = {
    folder: 'images/gallery/',
    images: [
        { name: 'Bike Shifting Mar 2026.png', wide: true },
        { name: 'office shifting Mar 2026.png', wide: false },
        { name: 'office shifting 2 mar 2026.png', wide: true },
        { name: 'Packaging mar 2026.jpeg', wide: true }
    ]
};

function initializeDynamicGallery() {
    const wrapper = document.querySelector('.gallery-scroll-wrapper');
    if (!wrapper) return;

    const isFullPage = wrapper.id === 'full-gallery-wrapper';

    // Shuffle and pick 4 for homepage, or show all for gallery page
    const selected = isFullPage ? GALLERY_CONFIG.images : [...GALLERY_CONFIG.images].sort(() => 0.5 - Math.random()).slice(0, 4);

    wrapper.innerHTML = '';

    selected.forEach(imgData => {
        const item = document.createElement('div');
        item.className = `gallery-item ${imgData.wide ? 'gallery-item--wide' : ''}`;

        const caption = imgData.name.split('.')[0]
            .replace(/-/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());

        item.innerHTML = `
            <img src="${GALLERY_CONFIG.folder}${imgData.name}" alt="${caption}" loading="lazy">
            <div class="gallery-item-overlay">
                <span class="gallery-item-name">${caption}</span>
            </div>
        `;
        wrapper.appendChild(item);
    });
}


// Global functions to make them available
window.scrollToContact = scrollToContact;
window.toggleMobileMenu = toggleMobileMenu;
window.closeModal = closeModal;
window.openQuoteModal = openQuoteModal;
window.closeQuoteModal = closeQuoteModal;
window.initializeDynamicGallery = initializeDynamicGallery;

