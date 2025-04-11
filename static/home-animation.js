document.addEventListener('DOMContentLoaded', function() {    
    // Calorie counter animation for dashboard
    const calorieValue = document.querySelector('.dashboard-card:first-child .value');
    if (calorieValue) {
        const originalValue = parseInt(calorieValue.textContent) || 0;
        const hiddenValue = document.getElementById('acc-calories-burned');
        const totalCalories = hiddenValue ? parseInt(hiddenValue.textContent) || originalValue : originalValue;
        
        calorieValue.closest('.dashboard-card').addEventListener('mouseenter', function() {
            let count = 0;
            const duration = 1000; // 1 second animation
            const interval = 20; // Update every 20ms
            const increment = totalCalories / (duration / interval);
            
            const counter = setInterval(function() {
                count += increment;
                if (count >= totalCalories) {
                    calorieValue.textContent = totalCalories;
                    clearInterval(counter);
                } else {
                    calorieValue.textContent = Math.floor(count);
                }
            }, interval);
        });
        
        calorieValue.closest('.dashboard-card').addEventListener('mouseleave', function() {
            calorieValue.textContent = originalValue;
        });
    }
    
    // Add animated scale effect to all icons
    const icons = document.querySelectorAll('.dashboard-card .icon i');
    icons.forEach(icon => {
        icon.addEventListener('mouseover', function() {
            this.style.transform = 'scale(1.2)';
        });
        
        icon.addEventListener('mouseout', function() {
            this.style.transform = 'scale(1)';
        });
    });

    const cards = document.querySelectorAll('.dashboard-card');
    if (cards.length > 0) {
        const infoColumn = document.querySelector('.info-column');
        
        // Check if cards are displaying in a single column when they shouldn't
        const firstCardRect = cards[0].getBoundingClientRect();
        const secondCardRect = cards[1].getBoundingClientRect();
        
        // If cards are stacked (same X position) on a wide screen, fix the layout
        if (window.innerWidth > 768 && Math.abs(firstCardRect.left - secondCardRect.left) < 10) {
            infoColumn.style.display = 'flex';
            infoColumn.style.flexWrap = 'wrap';
            infoColumn.style.justifyContent = 'center';
            
            cards.forEach(card => {
                card.style.width = '250px';
                card.style.height = '180px';
                card.style.margin = '15px';
                card.style.display = 'flex';
                card.style.flexDirection = 'column';
                card.style.justifyContent = 'center';
                card.style.alignItems = 'center';
            });
        }
    }
});