// Ultra Pro Packers & Movers - JavaScript functionality

document.addEventListener('DOMContentLoaded', function () {
    // Initialize all functionality when DOM is loaded
    initializeNavigation();
    initializeContactForm();
    /*initializeScrollEffects(); */
    initializeServiceCardTilt();
    initializeMobileMenu();
    initializeFooterLinks();
    initializeAboutStatsCounter();
});

// Navigation functionality
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                smoothScrollTo(targetSection);
                closeMobileMenu();
            }
        });
    });

    // Update active nav link based on scroll position
    window.addEventListener('scroll', updateActiveNavLink);
}

// Initialize footer links
function initializeFooterLinks() {
    const footerNavLinks = document.querySelectorAll('.footer-links .nav-link');

    footerNavLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                smoothScrollTo(targetSection);
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

// Update active navigation link based on scroll position
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const headerHeight = document.querySelector('.header').offsetHeight;

    let currentSection = '';

    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        const sectionHeight = section.offsetHeight;

        if (sectionTop <= headerHeight + 100 && sectionTop + sectionHeight > headerHeight + 100) {
            currentSection = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
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
    const contactForm = document.getElementById('quoteForm');

    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmission);

        // Add real-time validation
        const formInputs = contactForm.querySelectorAll('input, select, textarea');
        formInputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', clearFieldError);
        });
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
        // Show error notification if validation fails
        showNotification('Please fill in all required fields correctly.', 'error');
    }
}

// Form validation
function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');

    requiredFields.forEach(field => {
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

    // Check if required field is empty
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    }
    // Validate email format
    else if (fieldType === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
    }
    // Validate phone number (Indian format)
    else if (fieldType === 'tel' && value) {
        const phoneRegex = /^[6-9]\d{9}$/; // 10 digits starting with 6-9
        if (!phoneRegex.test(value.replace(/\D/g, ''))) {
            isValid = false;
            errorMessage = 'Please enter a valid 10-digit mobile number';
        }
    }
    // Validate select field
    else if (field.tagName === 'SELECT' && field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'Please select an option';
    }

    if (!isValid) {
        showFieldError(field, errorMessage);
    }

    return isValid;
}

// Show field error
function showFieldError(field, message) {
    field.classList.add('error');

    // Remove existing error message
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Add error message
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.style.color = 'var(--color-error)';
    errorElement.style.fontSize = 'var(--font-size-sm)';
    errorElement.style.marginTop = 'var(--space-4)';

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

    // Show success modal
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.classList.add('active');
    } else {
        showNotification('Quote request sent successfully! We will contact you soon.', 'success');
    }
}

// Modal functions
function closeModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// API Submission
async function submitToAPI(data, form) {
    // Replace with your actual Netlify site URL once deployed
    // Example: https://ultra-pro0-packers.netlify.app/.netlify/functions/quote
    //const API_ENDPOINT = '/.netlify/functions/quote';
    const API_ENDPOINT = 'https://ultrapropackersandmovers.netlify.app/.netlify/functions/quote';

    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            mode: 'cors',
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showFormSuccess(form);
        } else {
            const errorData = await response.json();
            showNotification(errorData.error || 'Failed to send quote. Please try again or call us.', 'error');
            resetFormSubmitButton(form);
        }
    } catch (error) {
        console.error('API Error:', error);
        showNotification('Network error. Please check your connection and try again.', 'error');
        resetFormSubmitButton(form);
    }
}

function resetFormSubmitButton(form) {
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = 'Send Quote Request';
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--color-surface);
        color: var(--color-text);
        padding: var(--space-16);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        border-left: 4px solid ${getNotificationColor(type)};
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
    `;

    // Add notification styles
    const notificationContent = notification.querySelector('.notification-content');
    notificationContent.style.cssText = `
        display: flex;
        align-items: center;
        gap: var(--space-12);
    `;

    const closeButton = notification.querySelector('.notification-close');
    closeButton.style.cssText = `
        background: none;
        border: none;
        color: var(--color-text-secondary);
        cursor: pointer;
        padding: var(--space-4);
        margin-left: auto;
    `;

    // Add to page
    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Get notification icon based on type
function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}

// Get notification color based on type
function getNotificationColor(type) {
    switch (type) {
        case 'success': return 'var(--color-success)';
        case 'error': return 'var(--color-error)';
        case 'warning': return 'var(--color-warning)';
        default: return 'var(--color-info)';
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

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.service-card, .contact-item, .about-text');
    animatedElements.forEach(element => {
        observer.observe(element);
    });
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

// Phone number click tracking
document.addEventListener('DOMContentLoaded', function () {
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
    phoneLinks.forEach(link => {
        link.addEventListener('click', function () {
            console.log('Phone number clicked:', this.href);
        });
    });
});

// Email link click tracking
document.addEventListener('DOMContentLoaded', function () {
    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    emailLinks.forEach(link => {
        link.addEventListener('click', function () {
            console.log('Email link clicked:', this.href);
        });
    });
});

function initializeAboutStatsCounter() {
    const el = document.getElementById('stat-projects');
    if (!el) return;

    const targetText = el.textContent.trim();
    const match = targetText.match(/(\d[\d,]*)/);
    if (!match) return;

    const target = parseInt(match[1].replace(/,/g, ''), 10);
    const suffix = targetText.replace(match[1], '');

    let started = false;
    const duration = 1400;

    const formatNumber = (n) => n.toLocaleString('en-IN');

    const animate = () => {
        const start = performance.now();

        const tick = (now) => {
            const p = Math.min(1, (now - start) / duration);
            const ease = 1 - Math.pow(1 - p, 3); // cubic out
            const current = Math.floor(target * ease);
            el.textContent = `${formatNumber(current)}${suffix}`;
            if (p < 1) {
                requestAnimationFrame(tick);
            } else {
                el.textContent = `${formatNumber(target)}${suffix}`;
            }
        };

        requestAnimationFrame(tick);
    };

    const onIntersect = (entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !started) {
                started = true;
                animate();
                obs.disconnect();
            }
        });
    };

    const observer = new IntersectionObserver(onIntersect, { threshold: 0.3 });
    observer.observe(el);
}

// Global functions to make them available
window.scrollToContact = scrollToContact;
window.toggleMobileMenu = toggleMobileMenu;
window.closeModal = closeModal;
