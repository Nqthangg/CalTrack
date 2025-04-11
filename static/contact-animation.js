// Contact page specific animations
document.addEventListener('DOMContentLoaded', function() {
    // Create background elements
    createBackgroundElements();
    
    // Add entrance animation to container
    const contactContainer = document.querySelector('.contact-container');
    if (contactContainer) {
        contactContainer.classList.add('contact-entrance');
    }

    // Add hover effects to form elements
    const formControls = document.querySelectorAll('.form-control');
    formControls.forEach(control => {
        control.addEventListener('focus', function() {
            if (this.parentElement.classList.contains('input-group')) {
                this.parentElement.style.transform = 'translateY(-3px)';
                this.parentElement.style.boxShadow = '0 6px 12px rgba(0, 123, 255, 0.15)';
            } else {
                this.style.transform = 'translateY(-3px)';
                this.style.boxShadow = '0 6px 12px rgba(0, 123, 255, 0.15)';
            }
        });
        
        control.addEventListener('blur', function() {
            if (this.parentElement.classList.contains('input-group')) {
                this.parentElement.style.transform = '';
                this.parentElement.style.boxShadow = '';
            } else {
                this.style.transform = '';
                this.style.boxShadow = '';
            }
        });
    });

    // Button hover effects
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px)';
            this.style.boxShadow = '0 8px 16px rgba(0, 123, 255, 0.3)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
    });

    // Add floating animations to background decorations
    const decorations = document.querySelectorAll('.contact-decoration');
    if (decorations.length > 0) {
        decorations.forEach((decoration, index) => {
            decoration.style.animationDuration = `${20 + (index * 5)}s`;
            decoration.style.animationDelay = `${index * 2}s`;
        });
    }

    // Add animations to contact list items
    animateContactItems();
    
    // Handle contact form submission
    setupContactForm();
});

// Function to create background elements
function createBackgroundElements() {
    // Create contact background
    const contactBackground = document.createElement('div');
    contactBackground.className = 'contact-background';
    document.body.appendChild(contactBackground);
    
    // Add decoration circles
    for (let i = 0; i < 3; i++) {
        const decoration = document.createElement('div');
        decoration.className = 'contact-decoration';
        contactBackground.appendChild(decoration);
    }
    
    // Create floating icons
    const floatingIcons = document.createElement('div');
    floatingIcons.className = 'floating-contact';
    document.body.appendChild(floatingIcons);
    
    // Add different icons related to contact and communication
    const iconClasses = [
        'fas fa-envelope', 
        'fas fa-phone', 
        'fas fa-comments', 
        'fas fa-map-marker-alt', 
        'fas fa-paper-plane', 
        'fas fa-headset'
    ];
    
    // Create 6 floating icons
    for (let i = 0; i < 6; i++) {
        const icon = document.createElement('i');
        icon.className = `${iconClasses[i]} contact-icon`;
        floatingIcons.appendChild(icon);
    }
}

// Function to animate contact items with staggered delay
function animateContactItems() {
    const contactItems = document.querySelectorAll('.contact-list li');
    
    if (contactItems.length > 0) {
        contactItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, 300 + (index * 150));
        });
    }
}

// Function to handle contact form and create floating feedback
function setupContactForm() {
    const contactForm = document.querySelector('form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            // Prevent the actual form submission for the animation demo
            e.preventDefault();
            
            // Create floating contact icons as visual feedback
            createFloatingContactIcons();
            
            // Show success message
            showSuccessMessage();
            
            // Reset form
            setTimeout(() => {
                this.reset();
            }, 500);
        });
    }
}

// Function to create floating contact icons as visual feedback
function createFloatingContactIcons() {
    const container = document.querySelector('.contact-container');
    const icons = ['fa-envelope', 'fa-check-circle', 'fa-paper-plane', 'fa-thumbs-up'];
    
    for (let i = 0; i < 8; i++) {
        const icon = document.createElement('i');
        icon.className = `fas ${icons[i % icons.length]} floating-feedback-icon`;
        icon.style.left = `${Math.random() * 80 + 10}%`;
        icon.style.animationDuration = `${1 + Math.random() * 2}s`;
        icon.style.animationDelay = `${i * 0.1}s`;
        
        container.appendChild(icon);
        
        // Remove the icon after animation completes
        setTimeout(() => {
            icon.remove();
        }, 3000);
    }
}

// Function to show success message
function showSuccessMessage() {
    // Check if success message already exists
    let successMessage = document.querySelector('.success-message');
    
    // If not, create it
    if (!successMessage) {
        successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = '<i class="fas fa-check-circle text-success me-2"></i> Your message has been sent successfully! We\'ll get back to you soon.';
        
        // Add it to the form
        const contactForm = document.querySelector('form');
        contactForm.appendChild(successMessage);
    }
    
    // Show and animate it
    successMessage.style.display = 'block';
    
    setTimeout(() => {
        successMessage.classList.add('show');
        successMessage.classList.add('highlight-pulse');
    }, 100);
    
    // Hide after some time
    setTimeout(() => {
        successMessage.classList.remove('show');
        
        setTimeout(() => {
            successMessage.style.display = 'none';
            successMessage.classList.remove('highlight-pulse');
        }, 500);
    }, 5000);
}