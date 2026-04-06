/**
 * School Detail Page JavaScript
 * Handles interactive elements and functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all interactive components
    // initFAQAccordion();
    // initScrollToTop();
    // initSmoothScrolling();
    initHeroStats();
    initContactActions();
    initImageLazyLoading();
    initImageFallbacks();
    checkHeroBackground();
    
    console.log('School Detail page initialized');
});

/**
 * Initialize FAQ Accordion functionality
 */
// function initFAQAccordion() {
//     const faqItems = document.querySelectorAll('.faq-item');
    
//     faqItems.forEach(item => {
//         const question = item.querySelector('.faq-question');
//         const answer = item.querySelector('.faq-answer');
//         const icon = question.querySelector('i');
        
//         question.addEventListener('click', () => {
//             const isActive = item.classList.contains('active');
            
//             // Close all FAQ items
//             faqItems.forEach(otherItem => {
//                 otherItem.classList.remove('active');
//                 const otherIcon = otherItem.querySelector('.faq-question i');
//                 otherIcon.classList.remove('fa-minus');
//                 otherIcon.classList.add('fa-plus');
//             });
            
//             // Toggle current item
//             if (!isActive) {
//                 item.classList.add('active');
//                 icon.classList.remove('fa-plus');
//                 icon.classList.add('fa-minus');
//             }
//         });
//     });
// }

/**
 * Initialize Scroll to Top button
 */
// function initScrollToTop() {
//     // Create scroll to top button if not exists
//     let scrollBtn = document.querySelector('.scroll-to-top');
//     if (!scrollBtn) {
//         scrollBtn = document.createElement('button');
//         scrollBtn.className = 'scroll-to-top';
//         scrollBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
//         scrollBtn.style.cssText = `
//             position: fixed;
//             bottom: 30px;
//             right: 30px;
//             width: 50px;
//             height: 50px;
//             background: #667eea;
//             color: white;
//             border: none;
//             border-radius: 50%;
//             cursor: pointer;
//             display: none;
//             z-index: 1000;
//             transition: all 0.3s ease;
//         `;
//         document.body.appendChild(scrollBtn);
//     }
    
//     // Show/hide on scroll
//     window.addEventListener('scroll', () => {
//         if (window.pageYOffset > 300) {
//             scrollBtn.style.display = 'block';
//         } else {
//             scrollBtn.style.display = 'none';
//         }
//     });
    
//     // Scroll to top on click
//     scrollBtn.addEventListener('click', () => {
//         window.scrollTo({ top: 0, behavior: 'smooth' });
//     });
// }

/**
 * Initialize smooth scrolling for anchor links
 */
// function initSmoothScrolling() {
//     const links = document.querySelectorAll('a[href^="#"]');
    
//     links.forEach(link => {
//         link.addEventListener('click', function(e) {
//             const targetId = this.getAttribute('href');
//             const targetElement = document.querySelector(targetId);
            
//             if (targetElement) {
//                 e.preventDefault();
//                 targetElement.scrollIntoView({
//                     behavior: 'smooth',
//                     block: 'start'
//                 });
//             }
//         });
//     });
// }

/**
 * Initialize hero stats animation
 */
function initHeroStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumber(entry.target);
            }
        });
    });
    
    statNumbers.forEach(stat => {
        observer.observe(stat);
    });
}

/**
 * Animate number counting
 */
function animateNumber(element) {
    const text = element.textContent;
    const hasPercent = text.includes('%');
    const hasYen = text.includes('¥');
    const hasPlus = text.includes('+');
    const hasDash = text.includes('-');
    
    let number = parseInt(text.replace(/[^0-9]/g, ''));
    if (isNaN(number)) return;
    
    let current = 0;
    const increment = Math.ceil(number / 50);
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= number) {
            current = number;
            clearInterval(timer);
        }
        
        let displayText = current.toLocaleString();
        if (hasYen) displayText += '¥';
        if (hasPercent) displayText += '%';
        if (hasPlus) displayText += '+';
        if (hasDash && text.includes('-')) displayText = text.replace(/\d+/, current);
        
        element.textContent = displayText;
    }, 30);
}

/**
 * Initialize contact action buttons
 */
function initContactActions() {
    const applyBtn = document.querySelector('a[href="#apply"]');
    const contactBtn = document.querySelector('a[href="#contact"]');
    
    if (applyBtn) {
        applyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Add apply action here
            alert('Chức năng đăng ký đang được phát triển!');
        });
    }
    
    if (contactBtn) {
        contactBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Scroll to contact section or open contact modal
            const contactSection = document.querySelector('.contact-details');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
}

/**
 * Initialize lazy loading for images
 */
function initImageLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => {
        imageObserver.observe(img);
    });
}

/**
 * Initialize image fallbacks for broken images
 */
function initImageFallbacks() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        img.addEventListener('error', function() {
            // Replace with placeholder if image fails to load
            this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
            this.alt = 'Không thể tải hình ảnh';
        });
    });
}

/**
 * Check and handle hero background
 */
function checkHeroBackground() {
    const heroSection = document.querySelector('.school-hero');
    if (heroSection && !heroSection.style.backgroundImage) {
        // Set default background if none exists
        heroSection.style.cssText += `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        `;
    }
}

/**
 * Test hero background image loading
 */
function testHeroBackgroundImage() {
    // Test if background image loads
    const testImage = new Image();
    testImage.onload = function() {
        console.log('Hero background image loaded successfully');
    };
    testImage.onerror = function() {
        console.error('Hero background image failed to load');
        // Add fallback background
        const heroElement = document.querySelector('.school-hero');
        if (heroElement) {
            heroElement.style.setProperty('--bg-fallback', 'rgba(0,0,0,0.3)');
        }
    };
    testImage.src = 'assets/images/school-1.jpg';
}

/**
 * Handle image loading failures
 */
function initImageFallbacks() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('error', function() {
            // Replace with placeholder or hide
            if (!this.src.includes('placeholder')) {
                this.src = 'assets/images/placeholder.jpg';
                this.alt = 'Placeholder image';
            } else {
                this.style.display = 'none';
            }
        });
    });
}

/**
 * Scroll to top functionality
 */
// function initScrollToTop() {
//     // Create scroll to top button
//     const scrollButton = document.createElement('button');
//     scrollButton.innerHTML = '<i class="fas fa-chevron-up"></i>';
//     scrollButton.className = 'scroll-to-top';
//     scrollButton.setAttribute('aria-label', 'Scroll to top');
//     document.body.appendChild(scrollButton);
    
//     // Add styles
//     const style = document.createElement('style');
//     style.textContent = `
//         .scroll-to-top {
//             position: fixed;
//             bottom: 30px;
//             right: 30px;
//             width: 50px;
//             height: 50px;
//             background: linear-gradient(135deg, #d32f2f, #b71c1c);
//             color: white;
//             border: none;
//             border-radius: 50%;
//             cursor: pointer;
//             font-size: 1.2rem;
//             box-shadow: 0 4px 15px rgba(211, 47, 47, 0.3);
//             transform: translateY(100px);
//             opacity: 0;
//             transition: all 0.3s ease;
//             z-index: 1000;
//         }
        
//         .scroll-to-top.visible {
//             transform: translateY(0);
//             opacity: 1;
//         }
        
//         .scroll-to-top:hover {
//             background: linear-gradient(135deg, #b71c1c, #d32f2f);
//             transform: translateY(-2px);
//             box-shadow: 0 6px 20px rgba(211, 47, 47, 0.4);
//         }
        
//         @media (max-width: 768px) {
//             .scroll-to-top {
//                 bottom: 20px;
//                 right: 20px;
//                 width: 45px;
//                 height: 45px;
//                 font-size: 1.1rem;
//             }
//         }
//     `;
//     document.head.appendChild(style);
    
//     // Show/hide button based on scroll position
//     window.addEventListener('scroll', function() {
//         if (window.pageYOffset > 300) {
//             scrollButton.classList.add('visible');
//         } else {
//             scrollButton.classList.remove('visible');
//         }
//     });
    
//     // Scroll to top when clicked
//     scrollButton.addEventListener('click', function() {
//         window.scrollTo({
//             top: 0,
//             behavior: 'smooth'
//         });
//     });
// }

/**
 * Smooth scrolling for anchor links
 */
// function initSmoothScrolling() {
//     const links = document.querySelectorAll('a[href^="#"]');
    
//     links.forEach(link => {
//         link.addEventListener('click', function(e) {
//             e.preventDefault();
            
//             const targetId = this.getAttribute('href').substring(1);
//             const targetElement = document.getElementById(targetId);
            
//             if (targetElement) {
//                 const headerHeight = 100; // Account for fixed header
//                 const targetPosition = targetElement.offsetTop - headerHeight;
                
//                 window.scrollTo({
//                     top: targetPosition,
//                     behavior: 'smooth'
//                 });
//             }
//         });
//     });
// }

/**
 * Animate hero stats on scroll
 */
function initHeroStats() {
    const heroStats = document.querySelectorAll('.school-key-stats .stat-number, .hero-stat-number');
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                animateNumber(entry.target);
                entry.target.classList.add('animated');
            }
        });
    }, observerOptions);
    
    heroStats.forEach(stat => {
        observer.observe(stat);
    });
}

/**
 * Animate number counting
 */
function animateNumber(element) {
    const finalNumber = parseInt(element.textContent);
    const duration = 2000; // 2 seconds
    const increment = finalNumber / (duration / 16); // 60 FPS
    let currentNumber = 0;
    
    const timer = setInterval(function() {
        currentNumber += increment;
        
        if (currentNumber >= finalNumber) {
            element.textContent = finalNumber;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(currentNumber);
        }
    }, 16);
}

/**
 * Contact action handlers
 */
function initContactActions() {
    // Phone call handler
    const phoneButtons = document.querySelectorAll('[href^="tel:"]');
    phoneButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Analytics tracking could go here
            console.log('Phone call initiated');
        });
    });
    
    // Email handler
    const emailButtons = document.querySelectorAll('[href^="mailto:"]');
    emailButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Analytics tracking could go here
            console.log('Email initiated');
        });
    });
    
    // WhatsApp handler
    const whatsappButtons = document.querySelectorAll('[data-action="whatsapp"]');
    whatsappButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const phone = '84123456789'; // Replace with actual WhatsApp number
            const message = encodeURIComponent('Chào bạn! Tôi quan tâm đến việc du học Nhật Bản.');
            const whatsappUrl = `https://wa.me/${phone}?text=${message}`;
            window.open(whatsappUrl, '_blank');
        });
    });
    
    // Zalo handler
    const zaloButtons = document.querySelectorAll('[data-action="zalo"]');
    zaloButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            // Zalo implementation would depend on their API
            alert('Tính năng Zalo sẽ được triển khai sớm!');
        });
    });
}

/**
 * Lazy loading for images
 */
function initImageLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

/**
 * Utility function to handle admin content editing
 * This would be used by the admin interface
 */
window.SchoolDetailAdmin = {
    /**
     * Update editable content
     */
    updateContent: function(selector, content) {
        const element = document.querySelector(selector);
        if (element) {
            element.innerHTML = content;
            console.log(`Content updated for: ${selector}`);
        }
    },
    
    /**
     * Add new content block
     */
    addContentBlock: function(type, content, parentSelector) {
        const parent = document.querySelector(parentSelector);
        if (parent) {
            const block = document.createElement('div');
            block.className = `content-block editable-section`;
            block.setAttribute('data-type', type);
            block.innerHTML = content;
            parent.appendChild(block);
            console.log(`New ${type} block added`);
        }
    },
    
    /**
     * Update testimonial
     */
    updateTestimonial: function(index, data) {
        const testimonial = document.querySelector(`.testimonial-card:nth-child(${index + 1})`);
        if (testimonial) {
            const content = testimonial.querySelector('.testimonial-content');
            const authorName = testimonial.querySelector('.author-info h5');
            const authorRole = testimonial.querySelector('.author-info span');
            const avatar = testimonial.querySelector('.author-avatar');
            
            if (content) content.textContent = data.content;
            if (authorName) authorName.textContent = data.authorName;
            if (authorRole) authorRole.textContent = data.authorRole;
            if (avatar) avatar.textContent = data.authorName.charAt(0).toUpperCase();
            
            console.log(`Testimonial ${index} updated`);
        }
    },
    
    /**
     * Update FAQ item
     */
    updateFAQ: function(index, question, answer) {
        const faqItem = document.querySelector(`.faq-item:nth-child(${index + 1})`);
        if (faqItem) {
            const questionElement = faqItem.querySelector('.faq-question h4');
            const answerElement = faqItem.querySelector('.faq-answer-content');
            
            if (questionElement) questionElement.textContent = question;
            if (answerElement) answerElement.innerHTML = answer;
            
            console.log(`FAQ ${index} updated`);
        }
    }
};

/**
 * Contact form handler (if contact form exists)
 */
function initContactForm() {
    const contactForm = document.querySelector('#contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic form validation
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);
            
            // Validate required fields
            const requiredFields = ['name', 'email', 'phone'];
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!data[field] || data[field].trim() === '') {
                    isValid = false;
                    const input = contactForm.querySelector(`[name="${field}"]`);
                    if (input) {
                        input.classList.add('error');
                        input.addEventListener('input', function() {
                            this.classList.remove('error');
                        }, { once: true });
                    }
                }
            });
            
            if (isValid) {
                // Here you would normally send the data to your server
                console.log('Form data:', data);
                
                // Show success message
                showNotification('Cảm ơn bạn! Chúng tôi sẽ liên hệ lại sớm nhất.', 'success');
                
                // Reset form
                contactForm.reset();
            } else {
                showNotification('Vui lòng điền đầy đủ thông tin bắt buộc.', 'error');
            }
        });
    }
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 10000;
                transform: translateX(400px);
                opacity: 0;
                transition: all 0.3s ease;
                max-width: 300px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            }
            
            .notification.show {
                transform: translateX(0);
                opacity: 1;
            }
            
            .notification-success {
                background: linear-gradient(135deg, #4caf50, #2e7d32);
            }
            
            .notification-error {
                background: linear-gradient(135deg, #f44336, #c62828);
            }
            
            .notification-info {
                background: linear-gradient(135deg, #2196f3, #1565c0);
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}