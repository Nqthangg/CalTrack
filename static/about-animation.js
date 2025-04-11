// About page specific animations
document.addEventListener('DOMContentLoaded', function() {
    // Create background decorations
    createBackgroundElements();
    
    // Add entrance animations to cards
    const cards = document.querySelectorAll('.card');
    if (cards.length > 0) {
        cards.forEach((card, index) => {
            card.classList.add('card-entrance');
            card.classList.add(`delay-${index % 3 + 1}`);
        });
    }

    // Add special animation to mission card
    const missionCard = document.querySelector('.card.bg-light');
    if (missionCard) {
        missionCard.classList.add('mission-card-highlight');
    }

    // Add hover effects to feature items
    const featureItems = document.querySelectorAll('.feature-icon');
    if (featureItems.length > 0) {
        featureItems.forEach(item => {
            item.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.2) rotate(5deg)';
            });
            
            item.addEventListener('mouseleave', function() {
                this.style.transform = '';
            });
        });
    }

    // Add hover effects to how it works steps
    const howItWorksCircles = document.querySelectorAll('.rounded-circle');
    if (howItWorksCircles.length > 0) {
        howItWorksCircles.forEach(circle => {
            circle.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px)';
                this.style.boxShadow = '0 8px 20px rgba(0, 123, 255, 0.2)';
            });
            
            circle.addEventListener('mouseleave', function() {
                this.style.transform = '';
                this.style.boxShadow = '';
            });
        });
    }

    // Add hover effects to list group items
    const listItems = document.querySelectorAll('.list-group-item');
    if (listItems.length > 0) {
        listItems.forEach(item => {
            item.addEventListener('mouseenter', function() {
                this.style.transform = 'translateX(5px)';
                this.style.backgroundColor = 'rgba(0, 123, 255, 0.05)';
                
                // Get the icon within the list item and animate it
                const icon = this.querySelector('i');
                if (icon) {
                    icon.style.transform = 'scale(1.2)';
                }
            });
            
            item.addEventListener('mouseleave', function() {
                this.style.transform = '';
                this.style.backgroundColor = '';
                
                const icon = this.querySelector('i');
                if (icon) {
                    icon.style.transform = '';
                }
            });
        });
    }

    // Add hover effects to badges
    const badges = document.querySelectorAll('.badge');
    if (badges.length > 0) {
        badges.forEach(badge => {
            badge.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.1)';
            });
            
            badge.addEventListener('mouseleave', function() {
                this.style.transform = '';
            });
        });
    }

    // Add hover effect to the image
    const images = document.querySelectorAll('.img-fluid');
    if (images.length > 0) {
        images.forEach(img => {
            img.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.03)';
                this.style.filter = 'brightness(1.05)';
            });
            
            img.addEventListener('mouseleave', function() {
                this.style.transform = '';
                this.style.filter = '';
            });
        });
    }

    // Add scroll animation to make items appear as they scroll into view
    window.addEventListener('scroll', revealOnScroll);
    // Trigger once on load to reveal items that are already in view
    revealOnScroll();
});

// Function to create background elements
function createBackgroundElements() {
    // Create about background
    const aboutBackground = document.createElement('div');
    aboutBackground.className = 'about-background';
    document.body.appendChild(aboutBackground);
    
    // Add decoration circles
    for (let i = 0; i < 3; i++) {
        const decoration = document.createElement('div');
        decoration.className = 'about-decoration';
        aboutBackground.appendChild(decoration);
    }
    
    // Create floating icons
    const floatingIcons = document.createElement('div');
    floatingIcons.className = 'floating-about';
    document.body.appendChild(floatingIcons);
    
    // Add different icons related to fitness and tracking
    const iconClasses = [
        'fas fa-running', 
        'fas fa-fire', 
        'fas fa-heartbeat', 
        'fas fa-microchip', 
        'fas fa-mobile-alt', 
        'fas fa-chart-line'
    ];
    
    // Create 6 floating icons
    for (let i = 0; i < 6; i++) {
        const icon = document.createElement('i');
        icon.className = `${iconClasses[i]} about-icon`;
        floatingIcons.appendChild(icon);
    }
}

// Function to reveal elements as they scroll into view
function revealOnScroll() {
    const elements = document.querySelectorAll('.card:not(.card-entrance), .feature-icon, .rounded-circle');
    
    elements.forEach(element => {
        // Check if element is already visible
        if (element.classList.contains('revealed')) return;
        
        // Get element position relative to viewport
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        
        // If element is in viewport
        if (elementTop < window.innerHeight && elementBottom > 0) {
            element.classList.add('revealed');
            
            // Apply a slight delay based on element position
            const delay = (elementTop / window.innerHeight) * 0.5;
            
            setTimeout(() => {
                element.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, delay * 1000);
        }
    });
}

// Add CSS for revealed items
const style = document.createElement('style');
style.textContent = `
    .card:not(.card-entrance):not(.revealed),
    .feature-icon:not(.revealed),
    .rounded-circle:not(.revealed) {
        opacity: 0;
        transform: translateY(20px);
    }
`;
document.head.appendChild(style);