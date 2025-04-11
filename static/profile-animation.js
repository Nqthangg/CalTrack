// Profile page specific animations
document.addEventListener('DOMContentLoaded', function() {
    // Animate profile items with staggered delay
    const profileItems = document.querySelectorAll('.profile-item');
    if (profileItems.length > 0) {
        profileItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';
            
            setTimeout(() => {
                item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, 100 + (index * 100));
        });
    }

    // Basic info items animation
    const basicInfoItems = document.querySelectorAll('.basic-info p');
    if (basicInfoItems.length > 0) {
        basicInfoItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(10px)';
            
            setTimeout(() => {
                item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, 300 + (index * 100));
        });
    }

    // Avatar entrance animation
    const avatar = document.querySelector('.avatar');
    if (avatar) {
        avatar.style.opacity = '0';
        avatar.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            avatar.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            avatar.style.opacity = '1';
            avatar.style.transform = 'scale(1)';
        }, 200);
    }

    // Form inputs animation
    const formInputs = document.querySelectorAll('.profile-edit input, .profile-edit select');
    if (formInputs.length > 0) {
        formInputs.forEach((input, index) => {
            input.style.opacity = '0';
            input.style.transform = 'translateX(10px)';
            
            setTimeout(() => {
                input.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                input.style.opacity = '1';
                input.style.transform = 'translateX(0)';
            }, 400 + (index * 100));
        });
    }

    // Update button special effect
    const submitBtn = document.querySelector('.submit-btn');
    if (submitBtn) {
        submitBtn.style.opacity = '0';
        submitBtn.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            submitBtn.style.transition = 'all 0.5s ease';
            submitBtn.style.opacity = '1';
            submitBtn.style.transform = 'translateY(0)';
        }, 1000);
        
        // Add pulsing effect after appearance
        setTimeout(() => {
            submitBtn.style.animation = 'pulse 2s infinite';
        }, 1500);
    }

    // Add interactive hover effects to profile items
    profileItems.forEach(item => {
        const icon = item.querySelector('i');
        
        item.addEventListener('mouseenter', function() {
            if (icon) {
                icon.style.transform = 'scale(1.2) rotate(5deg)';
                icon.style.color = '#0056b3';
            }
            this.style.backgroundColor = 'rgba(0, 123, 255, 0.05)';
            this.style.transform = 'translateX(5px)';
        });
        
        item.addEventListener('mouseleave', function() {
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0deg)';
                icon.style.color = '#007bff';
            }
            this.style.backgroundColor = 'transparent';
            this.style.transform = 'translateX(0)';
        });
    });

    // Animate profile background decorations
    const decorations = document.querySelectorAll('.profile-decoration');
    if (decorations.length > 0) {
        decorations.forEach((decoration, index) => {
            // Add some randomness to the animation
            decoration.style.animationDuration = `${20 + (index * 5)}s`;
            decoration.style.animationDelay = `${index * 2}s`;
        });
    }

    // Add input field focus animations
    const inputFields = document.querySelectorAll('input, select');
    inputFields.forEach(input => {
        input.addEventListener('focus', function() {
            this.style.boxShadow = '0 0 0 3px rgba(0, 123, 255, 0.25)';
            this.style.borderColor = '#007bff';
            
            // Also animate the corresponding label icon
            const label = this.previousElementSibling;
            if (label && label.tagName === 'LABEL') {
                const icon = label.querySelector('i');
                if (icon) {
                    icon.style.transform = 'scale(1.2)';
                    icon.style.color = '#0056b3';
                }
            }
        });
        
        input.addEventListener('blur', function() {
            this.style.boxShadow = '';
            this.style.borderColor = '';
            
            // Reset the label icon
            const label = this.previousElementSibling;
            if (label && label.tagName === 'LABEL') {
                const icon = label.querySelector('i');
                if (icon) {
                    icon.style.transform = '';
                    icon.style.color = '';
                }
            }
        });
    });

    // Add subtle animation to the heading
    const heading = document.querySelector('.profile-edit h2');
    if (heading) {
        heading.style.opacity = '0';
        heading.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            heading.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            heading.style.opacity = '1';
            heading.style.transform = 'translateY(0)';
        }, 300);
    }
});