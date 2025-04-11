// Updates for the existing goal-animation.js file
// These functions need to be added or modified to work with the new layout

document.addEventListener('DOMContentLoaded', function() {    
    // New additions from calories page
    addFloatingIcons();
    addCardEntranceAnimations();

    // Add column-specific effects
    addColumnSpecificEffects();
    
    // Make sure existing functionality works
    fixCalorieGoalDisplay();
});

/**
 * Add specific effects to each column
 */
function addColumnSpecificEffects() {
    // Add subtle hover effect to columns
    const exerciseColumn = document.querySelector('.exercise-column');
    const calorieColumn = document.querySelector('.calorie-column');
    
    if (!exerciseColumn || !calorieColumn) return;
    
    // Add decoration elements to exercise column
    const exerciseDecoration = document.createElement('div');
    exerciseDecoration.className = 'column-decoration exercise-decoration';
    exerciseDecoration.innerHTML = `
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none" opacity="0.05" style="position: absolute; right: 20px; bottom: 20px; pointer-events: none;">
            <circle cx="50" cy="50" r="45" stroke="#007bff" stroke-width="2"/>
            <path d="M30 50 L70 50" stroke="#007bff" stroke-width="4" stroke-linecap="round"/>
            <path d="M50 30 L50 70" stroke="#007bff" stroke-width="4" stroke-linecap="round"/>
        </svg>
    `;
    exerciseColumn.appendChild(exerciseDecoration);
    
    // Add decoration elements to calorie column
    const calorieDecoration = document.createElement('div');
    calorieDecoration.className = 'column-decoration calorie-decoration';
    calorieDecoration.innerHTML = `
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none" opacity="0.05" style="position: absolute; right: 20px; bottom: 20px; pointer-events: none;">
            <path d="M50 20 C30 40 30 60 50 80 C70 60 70 40 50 20 Z" stroke="#ff7b00" stroke-width="2" fill="none"/>
            <circle cx="50" cy="50" r="15" stroke="#ff7b00" stroke-width="2"/>
        </svg>
    `;
    calorieColumn.appendChild(calorieDecoration);
    
    // Set position relative for the columns to properly position the decorations
    exerciseColumn.style.position = 'relative';
    calorieColumn.style.position = 'relative';
}

/**
 * Modified function for adding card entrance animations to work with the new layout
 */
function addCardEntranceAnimations() {
    // Apply to form panels
    const formPanels = document.querySelectorAll('.form-panel');
    formPanels.forEach((panel, index) => {
        panel.style.opacity = '0';
        panel.style.transform = 'translateY(30px)';
        panel.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        panel.style.transitionDelay = `${0.3 + (0.1 * index)}s`;
        
        setTimeout(() => {
            panel.style.opacity = '1';
            panel.style.transform = 'translateY(0)';
        }, 300 + (100 * index));
    });
    
    // Apply to task sections
    const taskSections = document.querySelectorAll('.task-section');
    taskSections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        section.style.transitionDelay = `${0.5 + (0.1 * index)}s`;
        
        setTimeout(() => {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }, 500 + (100 * index));
    });
    
    // Apply to calorie goals section
    const calorieGoalsSection = document.querySelector('.calorie-goals-section');
    if (calorieGoalsSection) {
        calorieGoalsSection.style.opacity = '0';
        calorieGoalsSection.style.transform = 'translateY(30px)';
        calorieGoalsSection.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        calorieGoalsSection.style.transitionDelay = '0.7s';
        
        setTimeout(() => {
            calorieGoalsSection.style.opacity = '1';
            calorieGoalsSection.style.transform = 'translateY(0)';
        }, 700);
    }
}

/**
 * Modified function to enhance background for two-column layout
 */
function enhanceBackground() {
    const container = document.querySelector('.g-container');
    if (!container) return;
    
    // Add SVG pattern background
    const patternBg = document.createElement('div');
    patternBg.className = 'goals-pattern-background';
    patternBg.style.position = 'fixed';
    patternBg.style.top = '0';
    patternBg.style.left = '0';
    patternBg.style.width = '100%';
    patternBg.style.height = '100%';
    patternBg.style.zIndex = '-2';
    patternBg.style.opacity = '0.8';
    patternBg.style.pointerEvents = 'none';
    
    // Apply SVG pattern
    patternBg.style.backgroundImage = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cpath fill='%23007bff' fill-opacity='0.05' d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z'/%3E%3C/svg%3E")`;
    
    // Create gradient overlay
    const gradientOverlay = document.createElement('div');
    gradientOverlay.className = 'gradient-overlay';
    gradientOverlay.style.position = 'fixed';
    gradientOverlay.style.top = '0';
    gradientOverlay.style.left = '0';
    gradientOverlay.style.width = '100%';
    gradientOverlay.style.height = '100%';
    gradientOverlay.style.zIndex = '-2';
    gradientOverlay.style.background = 'linear-gradient(135deg, rgba(0,123,255,0.05) 0%, rgba(255,123,0,0.05) 100%)';
    gradientOverlay.style.pointerEvents = 'none';
    
    document.body.insertBefore(patternBg, document.body.firstChild);
    document.body.insertBefore(gradientOverlay, document.body.firstChild);
    
    // Enhance container background
    container.style.background = 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)';
}

// Call the new background function at load
document.addEventListener('DOMContentLoaded', function() {
    enhanceBackground();
});

/**
 * Add floating icons with split design for exercise and calorie columns
 */
function addFloatingIcons() {
    const exerciseColumn = document.querySelector('.exercise-column');
    const calorieColumn = document.querySelector('.calorie-column');
    
    if (!exerciseColumn || !calorieColumn) return;
    
    // Exercise column floating icons
    const exerciseIcons = document.createElement('div');
    exerciseIcons.className = 'floating-icons exercise-icons';
    exerciseIcons.style.position = 'absolute';
    exerciseIcons.style.top = '0';
    exerciseIcons.style.left = '0';
    exerciseIcons.style.width = '100%';
    exerciseIcons.style.height = '100%';
    exerciseIcons.style.pointerEvents = 'none';
    exerciseIcons.style.zIndex = '1';
    exerciseIcons.style.overflow = 'hidden';
    
    // Icon types for exercise
    const exerciseIconTypes = [
        'fa-dumbbell',
        'fa-running',
        'fa-biking',
        'fa-heartbeat'
    ];
    
    // Create 4 floating icons for exercise
    for (let i = 0; i < 4; i++) {
        const icon = document.createElement('i');
        icon.className = `fas ${exerciseIconTypes[i % exerciseIconTypes.length]} floating-icon`;
        icon.style.position = 'absolute';
        icon.style.color = 'rgba(0, 123, 255, 0.05)';
        icon.style.fontSize = `${Math.random() * 15 + 15}px`;
        icon.style.top = `${Math.random() * 90 + 5}%`;
        icon.style.left = `${Math.random() * 90 + 5}%`;
        icon.style.transform = 'translateY(0) rotate(0deg)';
        icon.style.animation = `float ${15 + Math.random() * 10}s infinite ease-in-out alternate`;
        icon.style.animationDelay = `${i * 2}s`;
        
        exerciseIcons.appendChild(icon);
    }
    
    exerciseColumn.appendChild(exerciseIcons);
    
    // Calorie column floating icons
    const calorieIcons = document.createElement('div');
    calorieIcons.className = 'floating-icons calorie-icons';
    calorieIcons.style.position = 'absolute';
    calorieIcons.style.top = '0';
    calorieIcons.style.left = '0';
    calorieIcons.style.width = '100%';
    calorieIcons.style.height = '100%';
    calorieIcons.style.pointerEvents = 'none';
    calorieIcons.style.zIndex = '1';
    calorieIcons.style.overflow = 'hidden';
    
    // Icon types for calories
    const calorieIconTypes = [
        'fa-fire',
        'fa-trophy',
        'fa-medal',
        'fa-stopwatch'
    ];
    
    // Create 4 floating icons for calories
    for (let i = 0; i < 4; i++) {
        const icon = document.createElement('i');
        icon.className = `fas ${calorieIconTypes[i % calorieIconTypes.length]} floating-icon`;
        icon.style.position = 'absolute';
        icon.style.color = 'rgba(255, 123, 0, 0.05)';
        icon.style.fontSize = `${Math.random() * 15 + 15}px`;
        icon.style.top = `${Math.random() * 90 + 5}%`;
        icon.style.left = `${Math.random() * 90 + 5}%`;
        icon.style.transform = 'translateY(0) rotate(0deg)';
        icon.style.animation = `float ${15 + Math.random() * 10}s infinite ease-in-out alternate`;
        icon.style.animationDelay = `${i * 2}s`;
        
        calorieIcons.appendChild(icon);
    }
    
    calorieColumn.appendChild(calorieIcons);
    
    // Add the float animation if it doesn't exist
    if (!document.getElementById('float-animation')) {
        const style = document.createElement('style');
        style.id = 'float-animation';
        style.textContent = `
            @keyframes float {
                0% {
                    transform: translateY(0) rotate(0deg);
                }
                50% {
                    transform: translateY(-20px) rotate(180deg);
                }
                100% {
                    transform: translateY(0) rotate(360deg);
                }
            }
        `;
        document.head.appendChild(style);
    }
    function createColumnBlobs() {
        const exerciseColumn = document.querySelector('.exercise-column');
        const calorieColumn = document.querySelector('.calorie-column');
        
        if (!exerciseColumn || !calorieColumn) return;
        
        // Exercise column blobs
        for (let i = 0; i < 2; i++) {
            const blob = document.createElement('div');
            blob.className = 'column-blob exercise-blob';
            blob.style.position = 'absolute';
            blob.style.borderRadius = '50%';
            blob.style.background = 'radial-gradient(circle, rgba(0,123,255,0.05) 0%, rgba(0,123,255,0) 70%)';
            blob.style.width = `${Math.random() * 100 + 100}px`;
            blob.style.height = blob.style.width;
            blob.style.top = `${Math.random() * 70}%`;
            blob.style.left = `${Math.random() * 70}%`;
            blob.style.animation = `blobMove ${15 + Math.random() * 10}s infinite alternate ease-in-out`;
            blob.style.animationDelay = `${i * 5}s`;
            blob.style.zIndex = '0';
            blob.style.pointerEvents = 'none';
            
            exerciseColumn.appendChild(blob);
        }
        
        // Calorie column blobs
        for (let i = 0; i < 2; i++) {
            const blob = document.createElement('div');
            blob.className = 'column-blob calorie-blob';
            blob.style.position = 'absolute';
            blob.style.borderRadius = '50%';
            blob.style.background = 'radial-gradient(circle, rgba(255,123,0,0.05) 0%, rgba(255,123,0,0) 70%)';
            blob.style.width = `${Math.random() * 100 + 100}px`;
            blob.style.height = blob.style.width;
            blob.style.top = `${Math.random() * 70}%`;
            blob.style.left = `${Math.random() * 70}%`;
            blob.style.animation = `blobMove ${15 + Math.random() * 10}s infinite alternate ease-in-out`;
            blob.style.animationDelay = `${i * 5}s`;
            blob.style.zIndex = '0';
            blob.style.pointerEvents = 'none';
            
            calorieColumn.appendChild(blob);
        }
        
        // Add the blob animation if it doesn't exist
        if (!document.getElementById('blob-animation')) {
            const style = document.createElement('style');
            style.id = 'blob-animation';
            style.textContent = `
                @keyframes blobMove {
                    0% {
                        transform: scale(1) translate(0, 0);
                    }
                    50% {
                        transform: scale(1.2) translate(20px, 10px);
                    }
                    100% {
                        transform: scale(0.8) translate(-20px, 20px);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
}
function createColumnBlobs() {
    const exerciseColumn = document.querySelector('.exercise-column');
    const calorieColumn = document.querySelector('.calorie-column');
    
    if (!exerciseColumn || !calorieColumn) return;
    
    // Exercise column blobs
    for (let i = 0; i < 2; i++) {
        const blob = document.createElement('div');
        blob.className = 'column-blob exercise-blob';
        blob.style.position = 'absolute';
        blob.style.borderRadius = '50%';
        blob.style.background = 'radial-gradient(circle, rgba(0,123,255,0.05) 0%, rgba(0,123,255,0) 70%)';
        blob.style.width = `${Math.random() * 100 + 100}px`;
        blob.style.height = blob.style.width;
        blob.style.top = `${Math.random() * 70}%`;
        blob.style.left = `${Math.random() * 70}%`;
        blob.style.animation = `blobMove ${15 + Math.random() * 10}s infinite alternate ease-in-out`;
        blob.style.animationDelay = `${i * 5}s`;
        blob.style.zIndex = '0';
        blob.style.pointerEvents = 'none';
        
        exerciseColumn.appendChild(blob);
    }
    
    // Calorie column blobs
    for (let i = 0; i < 2; i++) {
        const blob = document.createElement('div');
        blob.className = 'column-blob calorie-blob';
        blob.style.position = 'absolute';
        blob.style.borderRadius = '50%';
        blob.style.background = 'radial-gradient(circle, rgba(255,123,0,0.05) 0%, rgba(255,123,0,0) 70%)';
        blob.style.width = `${Math.random() * 100 + 100}px`;
        blob.style.height = blob.style.width;
        blob.style.top = `${Math.random() * 70}%`;
        blob.style.left = `${Math.random() * 70}%`;
        blob.style.animation = `blobMove ${15 + Math.random() * 10}s infinite alternate ease-in-out`;
        blob.style.animationDelay = `${i * 5}s`;
        blob.style.zIndex = '0';
        blob.style.pointerEvents = 'none';
        
        calorieColumn.appendChild(blob);
    }
    
    // Add the blob animation if it doesn't exist
    if (!document.getElementById('blob-animation')) {
        const style = document.createElement('style');
        style.id = 'blob-animation';
        style.textContent = `
            @keyframes blobMove {
                0% {
                    transform: scale(1) translate(0, 0);
                }
                50% {
                    transform: scale(1.2) translate(20px, 10px);
                }
                100% {
                    transform: scale(0.8) translate(-20px, 20px);
                }
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Add custom hover effects to task sections
 */
function addTaskSectionHoverEffects() {
    const taskSections = document.querySelectorAll('.task-section');
    
    taskSections.forEach(section => {
        section.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 8px 16px rgba(0, 123, 255, 0.1)';
            this.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        });
        
        section.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
            this.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
        });
    });
}

/**
 * Add custom scroll effect for horizontal goals list
 */
function enhanceHorizontalScrolling() {
    const horizontalContainer = document.querySelector('.horizontal-goals-container');
    if (!horizontalContainer) return;
    
    // Add scroll arrow indicators
    const leftArrow = document.createElement('div');
    leftArrow.className = 'scroll-arrow left-arrow';
    leftArrow.innerHTML = '<i class="fas fa-chevron-left"></i>';
    leftArrow.style.position = 'absolute';
    leftArrow.style.left = '5px';
    leftArrow.style.top = '50%';
    leftArrow.style.transform = 'translateY(-50%)';
    leftArrow.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    leftArrow.style.borderRadius = '50%';
    leftArrow.style.width = '30px';
    leftArrow.style.height = '30px';
    leftArrow.style.display = 'flex';
    leftArrow.style.alignItems = 'center';
    leftArrow.style.justifyContent = 'center';
    leftArrow.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.1)';
    leftArrow.style.cursor = 'pointer';
    leftArrow.style.zIndex = '5';
    leftArrow.style.opacity = '0.7';
    leftArrow.style.transition = 'opacity 0.3s ease';
    
    const rightArrow = document.createElement('div');
    rightArrow.className = 'scroll-arrow right-arrow';
    rightArrow.innerHTML = '<i class="fas fa-chevron-right"></i>';
    rightArrow.style.position = 'absolute';
    rightArrow.style.right = '5px';
    rightArrow.style.top = '50%';
    rightArrow.style.transform = 'translateY(-50%)';
    rightArrow.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    rightArrow.style.borderRadius = '50%';
    rightArrow.style.width = '30px';
    rightArrow.style.height = '30px';
    rightArrow.style.display = 'flex';
    rightArrow.style.alignItems = 'center';
    rightArrow.style.justifyContent = 'center';
    rightArrow.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.1)';
    rightArrow.style.cursor = 'pointer';
    rightArrow.style.zIndex = '5';
    rightArrow.style.opacity = '0.7';
    rightArrow.style.transition = 'opacity 0.3s ease';
    
    horizontalContainer.style.position = 'relative';
    horizontalContainer.appendChild(leftArrow);
    horizontalContainer.appendChild(rightArrow);
    
    // Add scroll event handlers
    leftArrow.addEventListener('click', function() {
        horizontalContainer.scrollBy({ left: -200, behavior: 'smooth' });
    });
    
    rightArrow.addEventListener('mouseenter', function() {
        this.style.opacity = '1';
    });
    
    rightArrow.addEventListener('mouseleave', function() {
        this.style.opacity = '0.7';
    });
    
    leftArrow.addEventListener('mouseenter', function() {
        this.style.opacity = '1';
    });
    
    leftArrow.addEventListener('mouseleave', function() {
        this.style.opacity = '0.7';
    });
    
    rightArrow.addEventListener('click', function() {
        horizontalContainer.scrollBy({ left: 200, behavior: 'smooth' });
    });
    
    // Show/hide arrows based on scroll position
    horizontalContainer.addEventListener('scroll', function() {
        if (this.scrollLeft === 0) {
            leftArrow.style.opacity = '0';
            leftArrow.style.pointerEvents = 'none';
        } else {
            leftArrow.style.opacity = '0.7';
            leftArrow.style.pointerEvents = 'auto';
        }
        
        if (this.scrollLeft + this.clientWidth >= this.scrollWidth - 5) {
            rightArrow.style.opacity = '0';
            rightArrow.style.pointerEvents = 'none';
        } else {
            rightArrow.style.opacity = '0.7';
            rightArrow.style.pointerEvents = 'auto';
        }
    });
    
    // Initial check
    if (horizontalContainer.scrollWidth <= horizontalContainer.clientWidth) {
        leftArrow.style.display = 'none';
        rightArrow.style.display = 'none';
    }
}

/**
 * Fix the calorie goal display to work with the new layout
 */
function fixCalorieGoalDisplay() {
    // Wait a bit for the DOM to be fully loaded
    setTimeout(() => {
        // Make sure the calorie goals container exists
        const calorieGoalsContainer = document.getElementById('calorie-goals-container');
        if (!calorieGoalsContainer) return;
        
        // Check if the lists need to be adjusted
        const goalsList = document.getElementById('calorie-goals-list');
        const completedGoalsList = document.getElementById('completed-calorie-goals');
        
        if (goalsList && goalsList.children.length === 0) {
            // If there are no active goals, make sure the progress message is visible
            const progressElement = document.getElementById('calorie-goal-progress');
            if (progressElement) {
                progressElement.style.display = 'block';
            }
        } else if (goalsList) {
            // There are active goals, hide the "no goals" message
            const progressElement = document.getElementById('calorie-goal-progress');
            if (progressElement) {
                progressElement.style.display = 'none';
            }
            
            // Add horizontal scrolling container if there are multiple goals
            if (goalsList.children.length > 1 && !document.querySelector('.horizontal-goals-container')) {
                // Create horizontal container
                const horizontalContainer = document.createElement('div');
                horizontalContainer.className = 'horizontal-goals-container';
                
                // Move items to horizontal list
                const horizontalList = document.createElement('div');
                horizontalList.className = 'horizontal-goals-list';
                horizontalList.id = 'horizontal-goals-list';
                
                // Move children to the new list
                while (goalsList.firstChild) {
                    horizontalList.appendChild(goalsList.firstChild);
                }
                
                horizontalContainer.appendChild(horizontalList);
                goalsList.parentNode.insertBefore(horizontalContainer, goalsList);
                
                // Add scroll enhancement
                enhanceHorizontalScrolling();
            }
        }
    }, 500);
}

// Add these new functions to the DOMContentLoaded event
document.addEventListener('DOMContentLoaded', function() {
    // Existing functions...
    
    // New functions
    createColumnBlobs();
    addTaskSectionHoverEffects();
    
    // Make sure the calorie goal display works with the new layout
    fixCalorieGoalDisplay();
    
    // Initialize both panels to be visible initially
    document.getElementById('exercise-form').style.display = 'block';
    document.getElementById('calorie-form').style.display = 'block';
});