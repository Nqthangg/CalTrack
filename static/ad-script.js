// Enhanced admin dashboard functionality with direct localStorage manipulation
document.addEventListener('DOMContentLoaded', function() {
    // -------------------- PIN Authentication --------------------
    const correctPin = "654321"; // Primary PIN for dashboard access
    const resetAllPin = "123456"; // Secondary PIN for reset all functionality
    
    // Get elements
    const submitPinBtn = document.getElementById('submitPin');
    const pinInput = document.getElementById('pinInput');
    const pinErrorAlert = document.getElementById('pinErrorAlert');
    const pinEntryForm = document.getElementById('pinEntryForm');
    const adminContent = document.getElementById('adminContent');
    
    // Handle PIN submission
    if (submitPinBtn) {
        submitPinBtn.addEventListener('click', function() {
            const enteredPin = pinInput.value;
            
            if (enteredPin === correctPin) {
                // PIN is correct, show admin content
                pinEntryForm.style.display = 'none';
                adminContent.style.display = 'block';
                
                // Initialize admin panel with current stats
                updateAdminStats();
            } else {
                // PIN is incorrect, show error
                pinErrorAlert.style.display = 'block';
                setTimeout(function() {
                    pinErrorAlert.style.display = 'none';
                }, 3000);
                pinInput.value = '';
                pinInput.focus();
            }
        });
    }    
    
    // Get buttons by their IDs
    const resetAchievementBtn = document.getElementById('resetAchievementBtn');
    const resetCaloriesBtn = document.getElementById('resetCaloriesBtn');
    const resetTodayBtn = document.getElementById('resetTodayBtn');
    const resetAccelerometerBtn = document.getElementById('resetAccelerometerBtn');
    const resetAllBtn = document.getElementById('resetAllBtn');
    
    // Function to show notification using the main script's notification system
    function showAdminNotification(message, type) {
        if (typeof addNotification === 'function') {
            addNotification(message, type);
        } else {
            alert(message);
        }
    }
    
    // Function to update admin panel statistics
    function updateAdminStats() {
        // Get data from localStorage
        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        const notifications = JSON.parse(localStorage.getItem("notifications")) || [];
        const calorieGoals = JSON.parse(localStorage.getItem("calorieGoals")) || [];
        
        // Update stats in the admin panel if elements exist
        const tasksCountEl = document.getElementById('tasksCount');
        const completedTasksEl = document.getElementById('completedTasksCount');
        const calorieGoalsEl = document.getElementById('calorieGoalsCount');
        const notificationsEl = document.getElementById('notificationsCount');
        
        if (tasksCountEl) tasksCountEl.textContent = tasks.length;
        if (completedTasksEl) {
            const completedTasks = tasks.filter(t => t.remainingTime === 0).length;
            completedTasksEl.textContent = completedTasks;
        }
        if (calorieGoalsEl) calorieGoalsEl.textContent = calorieGoals.length;
        if (notificationsEl) notificationsEl.textContent = notifications.length;
    }
    
    // ------ Reset Functions ------
    
    // Reset Achievements (Tasks)
    if (resetAchievementBtn) {
        resetAchievementBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to reset all task statistics?')) {
                // Clear tasks from localStorage
                localStorage.removeItem("tasks");
                
                // Show success notification
                showAdminNotification('All task statistics have been reset successfully!', 'success');
                
                // Update admin panel stats
                updateAdminStats();
                
                // If the main displayTasks function is available, refresh the task display
                if (typeof displayTasks === 'function') {
                    displayTasks();
                }
            }
        });
    }
    
    // Reset Calories Log
    if (resetCaloriesBtn) {
        resetCaloriesBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to reset the entire calories log?')) {
                // Clear calorie goals from localStorage
                localStorage.removeItem("calorieGoals");
                
                // Show success notification
                showAdminNotification('Calories log has been reset successfully!', 'success');
                
                // Update admin panel stats
                updateAdminStats();
                
                // If the calories display function is available, refresh it
                if (typeof displayCalorieGoals === 'function') {
                    displayCalorieGoals();
                }
            }
        });
    }
    
    // Reset Today's Data
    if (resetTodayBtn) {
        resetTodayBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to reset today\'s data?')) {
                // Get today's date string
                const today = new Date().toDateString();
                
                // Reset completion status for today's tasks
                const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
                let tasksModified = false;
                
                tasks.forEach(task => {
                    if (task.lastCompletedDate === today) {
                        task.completedToday = false;
                        task.remainingTime = task.time;
                        task.consumedCalories = 0;
                        task.run = false;
                        delete task.startTime;
                        tasksModified = true;
                    }
                });
                
                if (tasksModified) {
                    localStorage.setItem("tasks", JSON.stringify(tasks));
                    
                    // If the display function is available, refresh the task display
                    if (typeof displayTasks === 'function') {
                        displayTasks();
                    }
                }
                
                // Reset today's entry in calorie goals
                const calorieGoals = JSON.parse(localStorage.getItem("calorieGoals")) || [];
                let goalsModified = false;
                const dateString = new Date().toISOString().split('T')[0];
                
                calorieGoals.forEach(goal => {
                    const todayEntryIndex = goal.dailyProgress.findIndex(entry => entry.date === dateString);
                    if (todayEntryIndex >= 0) {
                        // Remove today's entry
                        goal.dailyProgress.splice(todayEntryIndex, 1);
                        
                        // Recalculate total progress
                        goal.progress = goal.dailyProgress.reduce((sum, entry) => sum + entry.calories, 0);
                        goalsModified = true;
                    }
                });
                
                if (goalsModified) {
                    localStorage.setItem("calorieGoals", JSON.stringify(calorieGoals));
                    
                    // If the display function is available, refresh the goals display
                    if (typeof displayCalorieGoals === 'function') {
                        displayCalorieGoals();
                    }
                }
                
                // Show success notification
                showAdminNotification('Today\'s data has been reset successfully!', 'success');
                
                // Update admin panel stats
                updateAdminStats();
            }
        });
    }
    
    // Reset Accelerometer Data
    if (resetAccelerometerBtn) {
        resetAccelerometerBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to reset all accelerometer data?')) {
                // Clear accelerometer data - this will need server-side implementation
                // For client-side, we can update the UI to reflect a reset
                
                // Reset displayed values
                const accCaloriesElement = document.getElementById('acc-calories-burned');
                if (accCaloriesElement) {
                    accCaloriesElement.textContent = '0';
                }
                
                const accelerometerCalories = document.getElementById('accelerometer-calories');
                if (accelerometerCalories) {
                    accelerometerCalories.textContent = '0';
                }
                
                // Hide the results container
                const resultsContainer = document.getElementById('accelerometer-results');
                if (resultsContainer) {
                    resultsContainer.style.display = 'none';
                }
                
                // Also need to send a request to server if accelerometer data is stored there
                fetch('/reset_accelerometer_data', {
                    method: 'POST',
                    headers: { 'X-Requested-With': 'XMLHttpRequest' }
                }).catch(err => {
                    console.error('Server request failed, but UI was updated:', err);
                });
                
                // Update net calories calculation
                if (typeof updateNetCalories === 'function') {
                    updateNetCalories();
                }
                
                // Show success notification
                showAdminNotification('Accelerometer data has been reset successfully!', 'success');
            }
        });
    }
    
    // Reset ALL Data
    if (resetAllBtn) {
        resetAllBtn.addEventListener('click', function() {
            // For the most critical action, add extra security
            if (confirm('WARNING: This will reset ALL user data. This action cannot be undone. Are you sure?')) {
                // Ask for a PIN as a second layer of security
                const pin = prompt('Enter your security PIN to confirm:');
                if (pin === resetAllPin) {
                    // Clear all relevant localStorage items
                    localStorage.removeItem("tasks");
                    localStorage.removeItem("notifications");
                    localStorage.removeItem("calorieGoals");
                    
                    // Send request to server for any server-side data that needs to be reset
                    fetch('/reset_all_data', {
                        method: 'POST',
                        headers: { 'X-Requested-With': 'XMLHttpRequest' }
                    }).catch(err => {
                        console.error('Server request failed, but client data was reset:', err);
                    });
                    
                    // Show success notification
                    showAdminNotification('All data has been reset to default values!', 'warning');
                    
                    // Update admin panel stats
                    updateAdminStats();
                    
                    // Refresh UI components
                    if (typeof displayTasks === 'function') displayTasks();
                    if (typeof displayCalorieGoals === 'function') displayCalorieGoals();
                    if (typeof updateNetCalories === 'function') updateNetCalories();
                    
                    // Clear any displayed notifications
                    const notificationList = document.getElementById("notification-list");
                    if (notificationList) {
                        notificationList.innerHTML = '<li class="empty-notification">No notifications yet</li>';
                    }
                    
                    // Reload page after a short delay to ensure everything is reset properly
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                } else {
                    showAdminNotification('Incorrect PIN. Operation cancelled.', 'error');
                }
            }
        });
    }
});