// DOM Elements
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const faqItems = document.querySelectorAll('.faq-item');
const contactForm = document.querySelector('.contact-form');
const header = document.querySelector('.header');
const headerTop = document.querySelector('.header-top');

// Header Scroll Effect
let lastScrollTop = 0;
let ticking = false;

function handleHeaderScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Header scrolled effect
    if (scrollTop > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    // Hide/show header-top on scroll with improved logic
    if (scrollTop > 80) {
        if (scrollTop > lastScrollTop && scrollTop > 150) {
            // Scrolling down past threshold
            headerTop.classList.add('hidden');
        } else if (scrollTop < lastScrollTop) {
            // Scrolling up
            headerTop.classList.remove('hidden');
        }
    } else {
        // At top of page
        headerTop.classList.remove('hidden');
    }
    
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    ticking = false;
}

function requestTick() {
    if (!ticking) {
        requestAnimationFrame(handleHeaderScroll);
        ticking = true;
    }
}

// Mobile Navigation Toggle
if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Close menu when clicking on nav links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        }
    });
}

// Smooth Scrolling for Navigation Links
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            const offsetTop = targetSection.offsetTop - 125; // Account for header-top + header
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Active Navigation Link on Scroll
function updateActiveNavLink() {
    const scrollPos = window.scrollY + 160; // Adjusted for new header height
    const sections = document.querySelectorAll('section[id]');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
        
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            navLinks.forEach(link => link.classList.remove('active'));
            if (navLink) {
                navLink.classList.add('active');
            }
        }
    });
}

// FAQ Toggle
if (faqItems.length > 0) {
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Close other open items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
        });
    });
}

// Contact Form Handling
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(contactForm);
        const formObject = {};
        
        // Get form data
        const inputs = contactForm.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.value.trim() !== '') {
                formObject[input.name || input.placeholder] = input.value;
            }
        });
        
        // Basic validation
        const name = contactForm.querySelector('input[type="text"]');
        const email = contactForm.querySelector('input[type="email"]');
        const phone = contactForm.querySelector('input[type="tel"]');
        
        if (!name.value.trim()) {
            alert('Vui lòng nhập họ tên');
            name.focus();
            return;
        }
        
        if (!email.value.trim() || !isValidEmail(email.value)) {
            alert('Vui lòng nhập email hợp lệ');
            email.focus();
            return;
        }
        
        if (!phone.value.trim()) {
            alert('Vui lòng nhập số điện thoại');
            phone.focus();
            return;
        }
        
        // Show success message
        showNotification('Cảm ơn bạn! Chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.', 'success');
        
        // Reset form
        contactForm.reset();
        
        // Log form data (replace with actual form submission)
        console.log('Form submitted:', formObject);
    });
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
    `;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Scroll Animations
function animateOnScroll() {
    const elements = document.querySelectorAll('.service-card, .school-card, .why-choose-text, .fee-text, .about-text');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('animate-fade-in-up');
        }
    });
}

// Back to Top Button
function createBackToTopButton() {
    const backToTopBtn = document.createElement('button');
    backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: #d32f2f;
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        display: none;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        z-index: 1000;
        transition: all 0.3s ease;
        box-shadow: 0 5px 15px rgba(211, 47, 47, 0.4);
    `;
    
    document.body.appendChild(backToTopBtn);
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.style.display = 'flex';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });
    
    // Smooth scroll to top
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Hover effect
    backToTopBtn.addEventListener('mouseenter', () => {
        backToTopBtn.style.background = '#b71c1c';
        backToTopBtn.style.transform = 'translateY(-2px)';
    });
    
    backToTopBtn.addEventListener('mouseleave', () => {
        backToTopBtn.style.background = '#d32f2f';
        backToTopBtn.style.transform = 'translateY(0)';
    });
}

// Loading Animation
function showLoadingAnimation() {
    const loader = document.createElement('div');
    loader.className = 'page-loader';
    loader.innerHTML = `
        <div class="loader-content">
            <div class="loader-logo">
                <img src="assets/images/logo02.png" alt="Du Học NB">
            </div>
            <div class="loader-spinner"></div>
            <p>Đang tải...</p>
        </div>
    `;
    
    loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #d32f2f;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        color: white;
        text-align: center;
    `;
    
    document.body.appendChild(loader);
    
    // Remove loader after page loads
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.remove();
            }, 500);
        }, 1000);
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Show loading animation
    showLoadingAnimation();
    
    // Create back to top button
    createBackToTopButton();
    
    // Add scroll event listeners
    window.addEventListener('scroll', () => {
        updateActiveNavLink();
        requestTick();
        animateOnScroll();
    });
    
    // Initial calls
    updateActiveNavLink();
    animateOnScroll();
    
    // Add keyboard navigation support
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        }
    });
});

// Service Worker Registration (for PWA support)
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
} else if (location.protocol === 'file:') {
    console.log('Service Worker không hỗ trợ với file:// protocol');
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .loader-spinner {
        width: 50px;
        height: 50px;
        border: 3px solid rgba(255, 255, 255, 0.3);
        border-top: 3px solid #ffeb3b;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 20px auto;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .loader-logo img {
        height: 180px;
        margin-bottom: 20px;
    }
`;
document.head.appendChild(style);