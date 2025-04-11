// Calories page specific animations
document.addEventListener('DOMContentLoaded', function() {

    const floatingCalories = document.querySelector('.floating-calories');
    if (floatingCalories) {
      // Make sure it's positioned correctly
      floatingCalories.style.position = 'fixed';
      floatingCalories.style.zIndex = '-1';
      floatingCalories.style.pointerEvents = 'none';
      
      // Ensure all icons are visible
      const icons = floatingCalories.querySelectorAll('.calorie-icon');
      icons.forEach(icon => {
        icon.style.position = 'absolute';
        icon.style.opacity = '0.1';
      });
    }

    // Add entrance animations to cards
    const cards = document.querySelectorAll('.card');
    if (cards.length > 0) {
        cards.forEach((card, index) => {
            card.classList.add('card-entrance');
            card.classList.add(`delay-${index % 3 + 1}`);
        });
    }

    // Animate metric boxes
    const metricBoxes = document.querySelectorAll('.metric-box');
    if (metricBoxes.length > 0) {
        metricBoxes.forEach((box, index) => {
            box.style.opacity = '0';
            box.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                box.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                box.style.opacity = '1';
                box.style.transform = 'translateY(0)';
            }, 500 + (index * 150));
        });
    }

    // Animated count-up for calorie numbers
    const calorieValues = document.querySelectorAll('.display-6, #total-burned-calories, #total-intake, #net-calories');
    calorieValues.forEach(value => {
        // Get the target number
        const targetValue = parseFloat(value.textContent) || 0;
        
        // Don't animate if the value is 0
        if (targetValue === 0) return;
        
        // Add the count animation class
        value.classList.add('count-animation');
        
        // Start from 0
        value.textContent = '0';
        
        // Counter animation
        let startValue = 0;
        const duration = 1500;
        const increment = targetValue / (duration / 20);
        const counter = setInterval(() => {
            startValue += increment;
            
            if (startValue >= targetValue) {
                value.textContent = Number.isInteger(targetValue) ? 
                    targetValue.toString() : 
                    targetValue.toFixed(2);
                clearInterval(counter);
            } else {
                value.textContent = Number.isInteger(targetValue) ? 
                    Math.floor(startValue).toString() : 
                    startValue.toFixed(2);
            }
        }, 20);
    });

    // Add number animation for input focus
    const numberInput = document.getElementById('calories-intake');
    if (numberInput) {
        numberInput.addEventListener('focus', function() {
            this.classList.add('highlight-pulse');
        });
        
        numberInput.addEventListener('blur', function() {
            this.classList.remove('highlight-pulse');
        });
    }

    // Chart hover animations
    const chart = document.getElementById('calories-chart');
    if (chart) {
        chart.style.opacity = '0.9';
        
        chart.addEventListener('mouseenter', function() {
            this.style.opacity = '1';
        });
        
        chart.addEventListener('mouseleave', function() {
            this.style.opacity = '0.9';
        });
    }

    // Add hover effects to form elements
    const formControls = document.querySelectorAll('.form-control');
    formControls.forEach(control => {
        control.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-3px)';
            this.parentElement.style.boxShadow = '0 6px 12px rgba(0, 123, 255, 0.15)';
        });
        
        control.addEventListener('blur', function() {
            this.parentElement.style.transform = '';
            this.parentElement.style.boxShadow = '';
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
    const decorations = document.querySelectorAll('.calories-decoration');
    if (decorations.length > 0) {
        decorations.forEach((decoration, index) => {
            decoration.style.animationDuration = `${20 + (index * 5)}s`;
            decoration.style.animationDelay = `${index * 2}s`;
        });
    }

    // Add highlight to calorie balance section
    const netCaloriesContainer = document.querySelector('#net-calories').closest('.rounded');
    if (netCaloriesContainer) {
        setTimeout(() => {
            netCaloriesContainer.classList.add('highlight-pulse');
        }, 2000);
    }

    // Add dynamic file upload animation
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
        input.addEventListener('change', function() {
            if (this.files.length > 0) {
                const label = this.previousElementSibling;
                if (label && label.classList.contains('form-label')) {
                    label.innerHTML = `<i class="fas fa-check-circle text-success me-2"></i>${label.textContent}`;
                }
                
                this.parentElement.style.backgroundColor = 'rgba(40, 167, 69, 0.05)';
                this.parentElement.style.borderColor = '#28a745';
            }
        });
    });

    // Create animated calorie icons to appear on form submission
    const caloriesForm = document.getElementById('daily-calories-form');
    if (caloriesForm) {
        caloriesForm.addEventListener('submit', function(e) {
            // Prevent the actual form submission for the animation demo
            // In a real application, you'd handle this differently
            e.preventDefault();
            
            // Create floating calorie icons as visual feedback
            createFloatingCalorieIcons();
            
            // You could add form processing logic here
            // Or add a success message
            alert('Calories saved successfully!');
        });
    }

    // Function to create floating calorie icons as visual feedback
    function createFloatingCalorieIcons() {
        const container = document.querySelector('.c-container');
        const icons = ['fa-apple-alt', 'fa-fire', 'fa-running', 'fa-heartbeat'];
        
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

    // Add CSS for the floating feedback icons
    const style = document.createElement('style');
    style.textContent = `
        .floating-feedback-icon {
            position: fixed;
            z-index: 1000;
            color: #007bff;
            font-size: 1.5rem;
            opacity: 0;
            bottom: 50%;
            animation: floatUp 2s forwards;
            pointer-events: none;
        }
        
        @keyframes floatUp {
            0% {
                opacity: 0;
                transform: translateY(0) scale(0.5);
            }
            10% {
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            100% {
                opacity: 0;
                transform: translateY(-100px) scale(1.5);
            }
        }
    `;
    document.head.appendChild(style);
});