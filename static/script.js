let taskIntervals = {};
let notifications = JSON.parse(localStorage.getItem("notifications")) || [];
let calorieGoals = JSON.parse(localStorage.getItem("calorieGoals")) || [];

const taskNames = {
    "football": "Football",
    "basketball": "Basketball",
    "run": "Running",
    "swimming": "Swimming",
    "badminton": "Badminton"
};

const calorieRates = {
    "football": 7,
    "basketball": 8,
    "run": 10,
    "swimming": 9,
    "badminton": 6
};

function formatTime(seconds) {
    let hrs = Math.floor(seconds / 3600);
    let mins = Math.floor((seconds % 3600) / 60);
    let secs = seconds % 60;
    return `${hrs} hour(s) ${mins} minute(s) ${secs} seccond(s)`;
}

// Hiển thị hoặc ẩn các tùy chọn khi chọn loại nhiệm vụ
function toggleTaskOptions() {
    let taskType = document.getElementById("task-type").value;
    document.getElementById("sport-options").style.display = (taskType === "sport") ? "block" : "none";
}

// Xử lý khi nhấn "Lưu nhiệm vụ"
function saveTask() {
    let taskType = document.getElementById("task-type").value;
    let sportType = document.getElementById("sport-type").value;
    let goal = document.getElementById("goal").value;
    let goalDays = parseInt(document.getElementById("goal").value) || 1;
    let hours = parseInt(document.getElementById("hours").value) || 0;
    let minutes = parseInt(document.getElementById("minutes").value) || 0;
    let seconds = parseInt(document.getElementById("seconds").value) || 0;
    let totalSeconds = (hours * 3600) + (minutes * 60) + seconds;

    if (totalSeconds === 0) {
        alert("Please enter a valid time!");
        return;
    }

    let selectedType = (taskType === "sport") ? sportType : taskType;

    let task = {
        id: Date.now(),
        sportType: selectedType,
        time: totalSeconds,
        remainingTime: totalSeconds,
        run: false,  // 🚀 Mặc định chưa chạy
        consumedCalories: 0,
        goal: goal,
        goalDays: goal,
        currentDay: 1,
        lastCompletedDate: null,
        completedToday: false
    };

    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    displayTasks();
}

function displayTasks() {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let pendingList = document.getElementById("pending-tasks");
    let inProgressList = document.getElementById("in-progress-tasks");
    let completedList = document.getElementById("completed-tasks");

    if (!pendingList || !inProgressList || !completedList) {
        console.log("Task list elements not found in the DOM");
        return;
    }

    pendingList.innerHTML = "";
    inProgressList.innerHTML = "";
    completedList.innerHTML = "";

    tasks.forEach(task => {
        let taskName = taskNames[task.sportType] || task.sportType;
        let actionVerb = (task.sportType === "run") ? "Ran" : "Played";

        let progress = ((task.time - task.remainingTime) / task.time) * 100;
        let elapsedTime = task.time - task.remainingTime;

        let li = document.createElement("li");
        li.classList.add("task-item");

        let goalProgress = "";
        if (task.goalDays > 1) {
            goalProgress = `<p>🎯 Progress: <strong>Day ${task.currentDay}/${task.goalDays}</strong></p>`;
        }

        li.innerHTML = `
            <p><strong>${taskName}</strong></p>
            <p>🟢 ${actionVerb}: <strong>${formatTime(elapsedTime)}</strong></p>
            <p>⏳ Remaining: <strong>${formatTime(task.remainingTime)}</strong></p>
            <p>🔥 Burned: <strong>${task.consumedCalories.toFixed(2)} calo</strong></p>
            ${goalProgress}

            <div class="progress-container">
                <div class="progress-bar" style="width: ${progress}%"></div>
            </div>
            <button class="start-btn" onclick="startTask(${task.id})">Start</button>
            <button class="reset-btn" onclick="resetTask(${task.id})">Reset</button>
            <button class="delete-btn" onclick="deleteTask(${task.id})">Cancel</button>
        `;

        if (task.remainingTime === 0) {
            li.classList.add("completed");
            completedList.appendChild(li);
        } else if (task.run) {
            li.classList.add("in-progress");
            inProgressList.appendChild(li);
        } else {
            li.classList.add("pending");
            pendingList.appendChild(li);
        }
    });
}

// Bắt đầu nhiệm vụ
function startTask(taskId) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let task = tasks.find(t => t.id === taskId);

    if (!task || task.run) return;

    if (taskIntervals[taskId]) {
        clearInterval(taskIntervals[taskId]);
        delete taskIntervals[taskId];
    }

    task.run = true;
    task.startTime = Date.now(); // Lưu thời gian bắt đầu

    taskIntervals[taskId] = setInterval(() => {
        updateTaskTime(taskId);
    }, 1000);

    notifyTaskStarted(taskNames[task.sportType] || task.sportType);

    localStorage.setItem("tasks", JSON.stringify(tasks));
    displayTasks();
}

function updateTaskTime(taskId) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let task = tasks.find(t => t.id === taskId);

    if (!task) return;

    let elapsedTime = Math.floor((Date.now() - task.startTime) / 1000);
    task.remainingTime = Math.max(0, task.time - elapsedTime);

    if (task.remainingTime <= 0) {
        clearInterval(taskIntervals[taskId]);
        delete taskIntervals[taskId];
        task.run = false;
        task.remainingTime = 0;

        task.completedToday = true;
        task.lastCompletedDate = new Date().toDateString();

        if (task.goalDays > 1) {
            if (task.currentDay < task.goalDays) {
                task.currentDay++;

                task.remainingTime = task.time;
                task.consumedCalories = 0;

                const daysRemaining = task.goalDays - task.currentDay + 1;
                notifyDayGoalProgress(taskNames[task.sportType] || task.sportType, daysRemaining);
            } else {
                notifyGoalCompleted(taskNames[task.sportType] || task.sportType, task.goalDays);
            }
        } else {
            notifyTaskCompleted(taskNames[task.sportType] || task.sportType);
            alert("Task completed!");
        }
    }

    task.consumedCalories = (task.time - task.remainingTime) * (calorieRates[task.sportType] || 5) / 60;
    localStorage.setItem("tasks", JSON.stringify(tasks));
    displayTasks(); // Cập nhật giao diện mỗi giây
}

function resetTask(taskId) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let task = tasks.find(t => t.id === taskId);

    if (task) {
        if (taskIntervals[taskId]) {
            clearInterval(taskIntervals[taskId]);
            delete taskIntervals[taskId];
        }
        task.remainingTime = task.time;
        task.consumedCalories = 0;
        task.run = false;
        delete task.startTime;

        notifyTaskReset(taskNames[task.sportType] || task.sportType);

        localStorage.setItem("tasks", JSON.stringify(tasks));
        displayTasks();
    }
}

function deleteTask(taskId) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let task = tasks.find(t => t.id === taskId);

    if (taskIntervals[taskId]) {
        clearInterval(taskIntervals[taskId]);
        delete taskIntervals[taskId];
    }

    if (task) {
        notifyTaskDeleted(taskNames[task.sportType] || task.sportType);
    }

    tasks = tasks.filter(task => task.id !== taskId);

    localStorage.setItem("tasks", JSON.stringify(tasks));
    window.tasks = tasks;
    displayTasks();
}



// Initialize when window loads
window.addEventListener('DOMContentLoaded', function() {
    initNotificationSystem();
    initQuickActions();
    initBMICalculator();
    initProfilePreview();
    initAccelerometerUpload();

    setTimeout(updateAchievementCounters, 500);

    modifyExistingFunctions();

    const taskTypeSelect = document.getElementById("task-type");
    if (taskTypeSelect) {
        taskTypeSelect.addEventListener("change", toggleTaskOptions);
    }

    let tasks = JSON.parse(this.localStorage.getItem("tasks")) || [];

    tasks.forEach(task => {
        if (task.run) {
            if (taskIntervals[task.id]) {
                clearInterval(taskIntervals[task.id]);
                delete taskIntervals[task.id];
            }

            if (task.startTime) {
                let currentTime = Date.now();
                let elapsedSeconds = Math.floor((currentTime - task.startTime) / 1000);
                task.remainingTime = Math.max(0, task.time - elapsedSeconds);

                if (task.remainingTime > 0) {
                    taskIntervals[task.id] = setInterval(() => {
                        updateTaskTime(task.id);
                    }, 1000);
                } else {
                    task.run = false;
                    task.remainingTime = 0;
                }
            } else {
                task.run = false;
            }
        }
    });

    localStorage.setItem("tasks", JSON.stringify(tasks));

    if (document.getElementById("pending-tasks") &&
        document.getElementById("in-progress-tasks") &&
        document.getElementById("completed-tasks")) {
        displayTasks();
    }

    setTimeout(() => {
        fetchCaloriesData();
    }, 500);
});

function initQuickActions() {
    const quickActionsToggle = document.querySelector('.quick-actions-toggle');
    const quickActionsMenu = document.querySelector('.quick-actions-menu');

    if (quickActionsToggle && quickActionsMenu) {
        quickActionsToggle.addEventListener('mouseenter', () => {
            quickActionsMenu.style.opacity = '1';
            quickActionsMenu.style.visibility = 'visible';
        });
        quickActionsToggle.addEventListener('mouseleeave', (e) => {
            if (!quickActionsMenu.contains(e.relatedTarget)) {
                quickActionsMenu.style.opacity = '0';
                quickActionsMenu.style.visibility = 'hidden';
            }
        });
        quickActionsMenu.addEventListener('mouseleave', () => {
            quickActionsMenu.style.opacity = '0';
            quickActionsMenu.style.visibility = 'hidden';
        });
    }
}

// Notification functions
function addNotification(message, type = "info") {
    const newNotification = {
        id: Date.now(),
        message: message,
        type: type, // info, success, warning, error
        timestamp: new Date().toISOString(),
        read: false
    };

    notifications.push(newNotification);
    localStorage.setItem("notifications", JSON.stringify(notifications));
    updateNotificationBadge();

    showNotificationToast(newNotification);
}

function showNotificationToast(notification) {
    const toast = document.createElement("div");
    toast.className = `notification-toast ${notification.type}`;
    toast.innerHTML = `
        <div class="notification-toast-content">
            <i class="fas ${getIconForType(notification.type)}"></i>
            <span>${notification.message}</span>
        </div>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

function getIconForType(type) {
    switch(type) {
        case "success": return "fa-check-circle";
        case "warning": return "fa-exclamation-triangle";
        case "error": return "fa-times-circle";
        default: return "fa-info-circle";
    }
}

function loadNotifications() {
    const notificationList = document.getElementById("notification-list");
    if (!notificationList) return;
    
    notificationList.innerHTML = ''; // Clear existing notifications
    
    if (notifications.length === 0) {
        const emptyMessage = document.createElement("li");
        emptyMessage.className = "empty-notification";
        emptyMessage.textContent = "No notifications yet";
        notificationList.appendChild(emptyMessage);
        return;
    }
    
    // Sort notifications by timestamp (newest first)
    const sortedNotifications = [...notifications].sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    sortedNotifications.forEach((notification) => {
        const li = document.createElement("li");
        li.className = notification.read ? "notification-item read" : "notification-item unread";
        li.dataset.id = notification.id;
        
        // Format the time
        const notificationTime = new Date(notification.timestamp);
        const timeString = formatNotificationTime(notificationTime);
        
        li.innerHTML = `
            <div class="notification-content">
                <i class="fas ${getIconForType(notification.type)} notification-icon"></i>
                <div class="notification-message">${notification.message}</div>
                <div class="notification-time">${timeString}</div>
            </div>
            <div class="notification-actions">
                <button class="mark-read-btn" title="Mark as ${notification.read ? 'unread' : 'read'}">
                    <i class="fas ${notification.read ? 'fa-envelope' : 'fa-envelope-open'}"></i>
                </button>
                <button class="delete-notification-btn" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add event listeners
        li.querySelector('.mark-read-btn').addEventListener('click', () => {
            toggleNotificationRead(notification.id);
        });
        
        li.querySelector('.delete-notification-btn').addEventListener('click', () => {
            removeNotification(notification.id);
        });
        
        notificationList.appendChild(li);
    });
}

function formatNotificationTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
}

function toggleNotificationRead(id) {
    const index = notifications.findIndex(n => n.id === id);
    if (index !== -1) {
        notifications[index].read = !notifications[index].read;
        localStorage.setItem("notifications", JSON.stringify(notifications));
        loadNotifications();
        updateNotificationBadge();
    }
}

function removeNotification(id) {
    notifications = notifications.filter(n => n.id !== id);
    localStorage.setItem("notifications", JSON.stringify(notifications));
    loadNotifications();
    updateNotificationBadge();
}

function markAllAsRead() {
    notifications.forEach(notification => {
        notification.read = true;
    });
    localStorage.setItem("notifications", JSON.stringify(notifications));
    loadNotifications();
    updateNotificationBadge();
}

function clearAllNotifications() {
    notifications = [];
    localStorage.setItem("notifications", JSON.stringify(notifications));
    loadNotifications();
    updateNotificationBadge();
}

function updateNotificationBadge() {
    const bellIcon = document.getElementById("notification-bell");
    if (!bellIcon) return;
    
    const unreadCount = notifications.filter(n => !n.read).length;
    
    const badge = document.getElementById("notification-badge") || document.createElement("span");
    badge.id = "notification-badge";
    badge.className = "notification-badge";
    
    if (unreadCount > 0) {
        badge.textContent = unreadCount > 99 ? "99+" : unreadCount;

        if (!document.getElementById("notification-badge")) {
            bellIcon.appendChild(badge);
            badge.classList.add('animated');
        }
    } else if (document.getElementById("notification-badge")) {
        bellIcon.removeChild(document.getElementById("notification-badge"));
    }
}

// Task notification functions
function notifyTaskStarted(taskName) {
    addNotification(`You have started ${taskName}!`, "info");
}

function notifyTaskCompleted(taskName) {
    addNotification(`Congratulation! You have done your task ${taskName}!`, "success");
}

function notifyDayGoalProgress(taskName, daysRemaining) {
    addNotification(`You have completed your workout day. ${taskName}. Remaining ${daysRemaining} day(s)!`, "info");
}

function notifyGoalCompleted(taskName, days) {
    addNotification(`Congratulation! You have done your goal ${days} day of ${taskName}!`, "success");
}

function notifyTaskReset(taskName) {
    addNotification(`You have reseted ${taskName}`, "warning");
}

function notifyTaskDeleted(taskName) {
    addNotification(`You have cancelled ${taskName}`, "error");
}

// Initialize notification system
function initNotificationSystem() {
    // Reference the bell icon and notification box
    const notificationBell = document.getElementById("notification-bell");
    const notificationBox = document.getElementById("notification-box");
    
    if (!notificationBell) {
        console.error("Notification bell not found!");
        return;  // Early exit if the bell is not found
    }

    if (!notificationBox) {
        createNotificationBox();
    } else {

        notificationBell.removeEventListener("click", handleBellClick);
        notificationBell.addEventListener("click", handleBellClick);
    }
    updateNotificationBadge();
    
    // Set up mark all as read button
    const markAllReadBtn = document.getElementById("mark-all-read");
    if (markAllReadBtn) {
        markAllReadBtn.removeEventListener("click", markAllAsRead);
        markAllReadBtn.addEventListener("click", markAllAsRead);
    }
        
    // Set up clear all button
    const clearAllBtn = document.getElementById("clear-all");
    if (clearAllBtn) {
        clearAllBtn.removeEventListener("click", clearAllNotifications);
        clearAllBtn.addEventListener("click", clearAllNotifications);
    }
}

// Separate function to handle bell click
function handleBellClick(event) {
    event.stopPropagation();
    const notificationBox = document.getElementById("notification-box");
    if (notificationBox) {
        notificationBox.classList.toggle('show');
        if (notificationBox.classList.contains('show')) {
            loadNotifications();
        }
    }
}

// Function to create the notification box if it doesn't exist
function createNotificationBox() {
    const notificationBell = document.getElementById("notification-bell");
    if (!notificationBell) return;
    
    const notificationBox = document.createElement("div");
    notificationBox.id = "notification-box";
    notificationBox.className = "notification-box";
    
    notificationBox.innerHTML = `
        <div class="notification-header">
            <h3>Thông báo</h3>
            <div class="notification-actions-container">
                <button id="mark-all-read" title="Đánh dấu tất cả là đã đọc">
                    <i class="fas fa-envelope-open"></i> Đã đọc tất cả
                </button>
                <button id="clear-all" title="Xóa tất cả thông báo">
                    <i class="fas fa-trash"></i> Xóa tất cả
                </button>
            </div>
        </div>
        <ul id="notification-list"></ul>
    `;
    
    document.body.appendChild(notificationBox);
    
    // Re-initialize the notification system
    initNotificationSystem();
}

function checkForNewDay(tasks) {
    const today = new Date().toDateString();
    
    tasks.forEach(task => {
        if (task.completedToday && task.lastCompletedDate !== today) {
            task.completedToday = false;
        }
    });
    
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function updateBMI() {
    const heightElement = document.getElementById('height');
    const weightElement = document.getElementById('weight');

    if (heightElement && weightElement ) {
        const heightValue = parseFloat(heightElement.value);
        const weightValue = parseFloat(weightElement.value);

        if (heightValue > 0 && weightValue > 0) {

            const heightInMeters = heightValue / 100;
            const bmi = (weightValue / (heightInMeters * heightInMeters)).toFixed(2);

            const displayBmiElement = document.getElementById('display-bmi');
            if (displayBmiElement) {
                displayBmiElement.textContent = bmi;
            }
        }
    }
}

function initBMICalculator() {
    const heightElement = document.getElementById('height');
    const weightElement = document.getElementById('weight');

    if (heightElement && weightElement) {
        heightElement.addEventListener('input', updateBMI);
        weightElement.addEventListener('input', updateBMI);

        updateBMI();
    }
}

function initProfilePreview() {
    const heightElement = document.getElementById('height');
    const weightElement = document.getElementById('weight');
    const genderElement = document.getElementById('gender');
    
    if (heightElement) {
        heightElement.addEventListener('input', function() {
            const displayElement = document.getElementById('profile-height');
            if (displayElement) {
                displayElement.textContent = this.value;
            }
        });
    }
    
    if (weightElement) {
        weightElement.addEventListener('input', function() {
            const displayElement = document.getElementById('profile-weight');
            if (displayElement) {
                displayElement.textContent = this.value;
            }
        });
    }
    
    if (genderElement) {
        genderElement.addEventListener('change', function() {
            const displayElement = document.getElementById('profile-gender');
            if (displayElement) {
                displayElement.textContent = this.options[this.selectedIndex].text;
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const updateProfileForm = document.getElementById('updateProfileForm');

    if (updateProfileForm) {
        initializeProfileForm();
        updateProfileForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const formData = new FormData(this);
            const submitButton = document.querySelector('.submit-btn');
            submitButton.disabled = true;
            submitButton.textContent = 'Updating...';

            fetch('/update_info', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Resquested-With': 'XMLHttpRequest'
                }
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(data => {
                        throw new Error(data.error || "An error occurred");
                    });
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {

                    document.getElementById('profile-height').textContent = data.user_info.height;
                    document.getElementById('profile-weight').textContent = data.user_info.weight;
                    document.getElementById('profile-age').textContent = data.user_info.age;
                    document.getElementById('profile-gender').textContent = data.user_info.gender;
                    document.getElementById('profile-activity').textContent = data.user_info.activity_level;
                    document.getElementById('display-bmi').textContent = data.user_info.bmi;

                    showMessage('Profile updated successfully!', 'success');

                    if (window.location.pathname === '/profile') {
                        updateProfileForm.reset();

                        setTimeout(() => {
                            initializeProfieForm();
                        }, 100);
                    }
                }
            })
            .catch(error => {
                showMessage(error.message || "An error occurred while updating the profile", 'error');
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.textContent = 'Update Profile';
            });
        });
    }
});

function initializeProfileForm() {
    const heightDisplay = document.getElementById('profile-height');
    const weightDisplay = document.getElementById('profile-weight');
    const ageDisplay = document.getElementById('profile-age');
    const genderDisplay = document.getElementById('profile-gender');
    const activityDisplay = document.getElementById('profile-activity');
    
    // Set form field values from display
    const heightInput = document.getElementById('height');
    const weightInput = document.getElementById('weight');
    const ageInput = document.getElementById('age');
    const genderSelect = document.getElementById('gender');
    const activitySelect = document.getElementById('activity_level');
    
    if (heightDisplay && heightInput) heightInput.value = heightDisplay.textContent;
    if (weightDisplay && weightInput) weightInput.value = weightDisplay.textContent;
    if (ageDisplay && ageInput) ageInput.value = ageDisplay.textContent;
    
    if (genderDisplay && genderSelect) {
        const genderText = genderDisplay.textContent.trim();
        for (let i = 0; i < genderSelect.options.length; i++) {
            if (genderSelect.options[i].text === genderText) {
                genderSelect.selectedIndex = i;
                break;
            }
        }
    }
    
    if (activityDisplay && activitySelect) {
        const activityText = activityDisplay.textContent.trim();
        for (let i = 0; i < activitySelect.options.length; i++) {
            if (activitySelect.options[i].text.includes(activityText)) {
                activitySelect.selectedIndex = i;
                break;
            }
        }
    }
}

// Show message function
function showMessage(message, type) {
    // Check if notification system is available
    if (typeof addNotification === 'function') {
        addNotification(message, type);
        return;
    }
    
    // Create a simple message element if notification system is not available
    const messageElement = document.createElement('div');
    messageElement.className = `alert alert-${type === 'error' ? 'danger' : 'success'} position-fixed`;
    messageElement.style.top = '10px';
    messageElement.style.right = '10px';
    messageElement.style.zIndex = '9999';
    messageElement.textContent = message;
    
    document.body.appendChild(messageElement);
    
    // Remove after 3 seconds
    setTimeout(() => {
        messageElement.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(messageElement);
        }, 300);
    }, 3000);
}

function fetchCaloriesData() {
    return fetch('/calories/month')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            return []; // Return empty array on error
        });
}

// Update this part of your document.addEventListener for calories form submission:
document.addEventListener('DOMContentLoaded', function() {
    // Set up the form submission
    const caloriesForm = document.getElementById("daily-calories-form");
    if (caloriesForm) {
        const goalCompletionInput = document.getElementById("goal-completion");
        if (goalCompletionInput) {
            const caloriesBurned = calculateCaloriesBurned();
            goalCompletionInput.value = caloriesBurned.toFixed(2);

            goalCompletionInput.readOnly = true;
        }

        const caloriesIntakeInput = document.getElementById("calories-intake");
        const totalCaloriesInput = document.getElementById("total-calories-input");

        if (caloriesIntakeInput && totalCaloriesInput) {
            caloriesIntakeInput.addEventListener("input", function() {
                const caloriesIntake = parseFloat(this.value) || 0;
                const goalCompletion = parseFloat(goalCompletionInput.value) || 0;
                totalCaloriesInput.value = (caloriesIntake - goalCompletion).toFixed(2);
            });
        }

        caloriesForm.addEventListener("submit", function(event) {
            event.preventDefault();

            const caloriesIntake = parseInt(document.getElementById("calories-intake").value) || 0;
            const taskCaloriesBurned = parseFloat(document.getElementById("goal-completion").value) || 0;
            const accCaloriesBurned = parseFloat(document.getElementById('acc-calories-burned').textContent) || 0;

            const netCalories = caloriesIntake - (taskCaloriesBurned + accCaloriesBurned);

            const formData = new URLSearchParams({
                'calories': netCalories.toFixed(2),
                'intake': caloriesIntake.toFixed(2),
                'burned_tasks': taskCaloriesBurned.toFixed(2),
                'burned_accelerometer': accCaloriesBurned.toFixed(2)
            });
        
            const submitButton = this.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            }

            fetch('/update_calories', {
                method: 'POST',
                body: formData,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            })
            .then(response => response.json())
            .then(data => {
                if(data.success) {
                    if (typeof addNotification === 'function') {
                        addNotification(`Successfully saved your calorie data!`, "success");
                    }

                    // Adding delay before refreshing the chart
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                }
            })
            .catch(error => {
                console.log("Error updating calories", error);
                if (typeof addNotification === 'function') {
                    addNotification(`Error saving calorie data: ${error.message}`, "error");
                }

                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = '<i class="fas fa-save me-2"></i>Save Daily Calories';
                }
            });
        });
    }
});

function initAccelerometerUpload() {
    const accelerometerForm = document.getElementById('accelerometer-form');
    if (accelerometerForm) {
        accelerometerForm.addEventListener('submit', handleAccelerometerUpload);
        
        // Set default date to today
        const dateInput = document.getElementById('accelerometer-date');
        if (dateInput && !dateInput.value) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
        }
        // Add validation to file inputs
        const fileInputs = accelerometerForm.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => {
            input.addEventListener('change', function() {
                validateFile(this);
            });
        });
    }
    
    // Check if there's already accelerometer data for today
    fetchAccelerometerData();
}

function ValidityAccelerometerFile(fileInput) {
    if (fileInput.files.length === 0) return;
    
    const file = fileInput.files[0];
    const fileSize = file.size / 1024 / 1024; // Convert to MB
    const fileType = file.name.split('.').pop().toLowerCase();
    
    // Reset any previous error messages
    const errorElement = document.getElementById('accelerometer-file-error');
    if (errorElement) errorElement.remove();
    
    // Check file size (10MB limit)
    if (fileSize > 10) {
        const error = document.createElement('div');
        error.id = 'accelerometer-file-error';
        error.className = 'text-danger mt-1';
        error.textContent = 'File is too large (max 10MB)';
        fileInput.parentNode.appendChild(error);
        fileInput.value = '';
        return false;
    }
    
    // Check file type
    const allowedTypes = ['csv', 'xlsx', 'xls'];
    if (!allowedTypes.includes(fileType)) {
        const error = document.createElement('div');
        error.id = 'accelerometer-file-error';
        error.className = 'text-danger mt-1';
        error.textContent = 'Invalid file type. Please upload CSV or Excel files only.';
        fileInput.parentNode.appendChild(error);
        fileInput.value = '';
        return false;
    }
    
    return true;
}

function handleAccelerometerUpload(event) {
    event.preventDefault();
    
    const form = document.getElementById('accelerometer-form');
    const fileX = document.getElementById('file-x');
    const fileY = document.getElementById('file-y');
    const fileZ = document.getElementById('file-z');

    // Check if files are selected
    if (!fileX.files.length) {
        alert('Please select X-axis file');
        return;
    }
    if (!fileY.files.length) {
        alert('Please select Y-axis file');
        return;
    }
    if (!fileZ.files.length) {
        alert('Please select Z-axis file');
        return;
    }

    const formData = new FormData(form);

    formData.append('file', fileX.files[0]); 
    formData.append('file_y', fileY.files[0]);
    formData.append('file_z', fileZ.files[0]);

    const dateInput = document.getElementById('accelerometer-date');
    if (dateInput && dateInput.value) {
        formData.append('date', dateInput.value);
    }
    
    console.log('Form data keys:', [...formData.keys()]);

    const submitButton = form.querySelector('button[type="submit"]');
    const resultsContainer = document.getElementById('accelerometer-results');

    let statusElement = document.getElementById('accelerometer-status');
    if (!statusElement) {
        statusElement = document.createElement('span');
        statusElement.id = 'accelerometer-status';
        statusElement.className = 'badge bg-secondary';
    
        if (resultsContainer) {
            const statusContainer = resultsContainer.querySelector('.col-md-6:last-child');
            if (statusContainer) {
                statusContainer.appendChild(statusElement);
            }
        }
    }
    
    // Show loading state
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    }
    
    if (statusElement) {
        statusElement.textContent = 'Uploading and processing data...';
        statusElement.className = 'badge bg-info';
    }
    
    // Show results container
    if (resultsContainer) {
        resultsContainer.style.display = 'block';
    }
    
    fetch('/upload_accelerometer_data', {
        method: 'POST',
        body: formData,
    })
    .then(response => {
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            return response.text().then(text => {
                console.log('Error response text:', text);
                try {
                    return JSON.parse(text); // Try to parse as JSON
                } catch (e) {
                    throw new Error(`Server error: ${response.status} ${text}`);
                }
            });
        }
        
        return response.json();
    })
    .then(data => {
        console.log('Response data:', data);
        
        if (data.success) {
            // Show results
            const caloriesElement = document.getElementById('accelerometer-calories');
            if (caloriesElement) {
                caloriesElement.textContent = data.calories_burned;
            }
            
            if (statusElement) {
                statusElement.textContent = 'Processed successfully';
                statusElement.className = 'badge bg-success';
            }
            
            // Update the summary
            const accCaloriesElement = document.getElementById('acc-calories-burned');
            if (accCaloriesElement) {
                accCaloriesElement.textContent = data.calories_burned;
                console.log("Set acc-calories-burned to:", data.calories_burned);
                updateNetCalories();
                
                // IMPORTANT: Update the achievement counters after setting the new value
                setTimeout(() => {
                    console.log("Updating achievement counters after accelerometer upload");
                    updateAchievementCounters();
                }, 500);
            }
            
            // Show notification if available
            if (typeof addNotification === 'function') {
                addNotification(`Successfully calculated ${data.calories_burned} calories from accelerometer data!`, "success");
            } else {
                alert(`Successfully calculated ${data.calories_burned} calories!`);
            }
            
            // Reset file inputs
            fileX.value = '';
            fileY.value = '';
            fileZ.value = '';
        } else {
            // Show error
            if (statusElement) {
                statusElement.textContent = `Error: ${data.error || 'Unknown error'}`;
                statusElement.className = 'badge bg-danger';
            }
            
            if (typeof addNotification === 'function') {
                addNotification(`Error processing accelerometer data: ${data.error || 'Unknown error'}`, "error");
            } else {
                alert(`Error: ${data.error || 'Unknown error'}`);
            }
        }
    })
    .catch(error => {
        console.error('Fetch error:', error);
        
        if (statusElement) {
            statusElement.textContent = `Upload failed: ${error.message}`;
            statusElement.className = 'badge bg-danger';
        }
        
        if (typeof addNotification === 'function') {
            addNotification(`Failed to upload accelerometer data: ${error.message}`, "error");
        } else {
            alert(`Upload failed: ${error.message}`);
        }
    })
    .finally(() => {
        // Reset button state
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fas fa-upload me-2"></i>Upload & Calculate';
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('accelerometer-form');
    if (form) {
        // Add event listener for form submission
        form.addEventListener('submit', handleAccelerometerUpload);
        
        // Set default date to today
        const dateInput = document.getElementById('accelerometer-date');
        if (dateInput && !dateInput.value) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
        }
        
        console.log('Accelerometer form initialized');
    } else {
        console.warn('Accelerometer form not found');
    }
    
    // Check if there's already accelerometer data for today
    fetchAccelerometerData();
});

function fetchAccelerometerData() {
    fetch('/get_accelerometer_calories')
    .then(response => response.json())
    .then(data => {
        if (data.success && data.calories_burned > 0) {
            // Show results section
            const resultsContainer = document.getElementById('accelerometer-results');
            if (resultsContainer) {
                resultsContainer.style.display = 'block';
            }
            
            // Update calories display
            const caloriesElement = document.getElementById('accelerometer-calories');
            if (caloriesElement) {
                caloriesElement.textContent = data.calories_burned;
            }
            
            // Update status
            const statusElement = document.getElementById('accelerometer-status');
            if (statusElement) {
                statusElement.textContent = 'Data available';
                statusElement.className = 'badge bg-success';
            }
            
            // Update summary
            const accCaloriesElement = document.getElementById('acc-calories-burned');
            if (accCaloriesElement) {
                accCaloriesElement.textContent = data.calories_burned;
                updateNetCalories();
            }
        }
    })
    .catch(error => {
        console.error('Error fetching accelerometer data:', error);
    });
}

// Modify your existing updateTotalCalories function
function updateNetCalories() {
    // Get all calorie-related elements
    const elements = {
        intake: document.getElementById('total-intake'),
        tasksBurned: document.getElementById('tasks-calories-burned'),
        accBurned: document.getElementById('acc-calories-burned'),
        netCalories: document.getElementById('net-calories')
    };
    
    // If any required element is missing, exit early
    if (!elements.netCalories) return;
    
    // Default values to 0 if elements don't exist
    const values = {
        intake: elements.intake && elements.intake.textContent ? parseFloat(elements.intake.textContent) || 0 : 0,
        tasksBurned: elements.tasksBurned && elements.tasksBurned.textContent ? parseFloat(elements.tasksBurned.textContent) || 0 : 0,
        accBurned: elements.accBurned && elements.accBurned.textContent ? parseFloat(elements.accBurned.textContent) || 0 : 0
    };
    
    // Calculate total burned and net calories
    const totalBurned = values.tasksBurned + values.accBurned;
    const netCalories = values.intake - totalBurned;
    
    // Update total burned calories display if it exists
    const totalBurnedElement = document.getElementById('total-burned-calories');
    if (totalBurnedElement) {
        totalBurnedElement.textContent = totalBurned.toFixed(2);
    }

    const totalBurnedDisplayElement = document.getElementById('total-burned-calories-display');
    if (totalBurnedDisplayElement) {
        totalBurnedDisplayElement.textContent = totalBurned.toFixed(2);
    }
    
    // Update net calories
    elements.netCalories.textContent = netCalories.toFixed(2);
    
    // Update color based on calorie balance
    if (netCalories > 0) {
        elements.netCalories.classList.add('text-success');
        elements.netCalories.classList.remove('text-danger');
    } else {
        elements.netCalories.classList.add('text-danger');
        elements.netCalories.classList.remove('text-success');
    }
    
    // Also update the hidden input field if it exists
    const totalCaloriesInput = document.getElementById('total-calories-input');
    if (totalCaloriesInput) {
        totalCaloriesInput.value = netCalories.toFixed(2);
    }
}

function calculateCaloriesBurned() {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let totalCaloriesBurned = 0;

    const today = new Date().toDateString();

    tasks.forEach(task => {
        if (task.completedToday && task.lastCompletedDate !== today) {
            task.completedToday = false;
        }
    });

    const completedTasks = tasks.filter(task =>
        task.completedToday && task.lastCompletedDate === today
    );

    completedTasks.forEach(task => {
        totalCaloriesBurned += task.consumedCalories;
    });

    localStorage.setItem("tasks", JSON.stringify(tasks));
    
    // Update the tasks calories display
    const tasksCaloriesElement = document.getElementById('tasks-calories-burned');
    if (tasksCaloriesElement) {
        tasksCaloriesElement.textContent = totalCaloriesBurned.toFixed(2);
    }

    return totalCaloriesBurned;
}

// Modify your existing calories form submission handler to incorporate accelerometer data
document.addEventListener('DOMContentLoaded', function() {
    window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto'
    });
    initializeCalorieSummary();
    enhanceAccelerometerUpload();
    fetchAccelerometerCaloriesAndUpdateCounters();

    setTimeout(() => {
        fetchAccelerometerCaloriesAndUpdateCounters();
    }, 300);
    setInterval(fetchAccelerometerCaloriesAndUpdateCounters, 30000);
    // Set up the form submission
    const caloriesForm = document.getElementById("daily-calories-form");
    if (caloriesForm) {
        // Initialize task calories
        const caloriesBurned = calculateCaloriesBurned();
        
        // Display in the hidden input
        const goalCompletionInput = document.getElementById("goal-completion");
        if (goalCompletionInput) {
            goalCompletionInput.value = caloriesBurned.toFixed(2);
        }
        
        // Setup intake input change handler
        const caloriesIntakeInput = document.getElementById("calories-intake");
        if (caloriesIntakeInput) {

            if (!caloriesIntakeInput.getAttribute('placeholder')) {
                caloriesIntakeInput.setAttribute('placeholder', 'Enter calories consumed');
            }

            caloriesIntakeInput.addEventListener("input", function() {
                const caloriesIntake = parseFloat(this.value) || 0;

                const intakeElement = document.getElementById('totak-intake');
                if(intakeElement) {
                    intakeElement.textContent = caloriesIntake.toFixed(2);
                }

                // Update net calories
                updateNetCalories();
            }); 
        }
    

        // Form submission handler
        caloriesForm.addEventListener("submit", function(event) {
            event.preventDefault();

            const caloriesIntake = parseFloat(document.getElementById("calories-intake").value) || 0;
            const taskCaloriesBurned = parseFloat(document.getElementById("goal-completion").value) || 0;
            const accCaloriesBurned = parseFloat(document.getElementById('acc-calories-burned').textContent) || 0;

            const netCalories = caloriesIntake - (taskCaloriesBurned + accCaloriesBurned);
            
            // Gather data for submission
            const formData = new URLSearchParams({
                'calories': (caloriesIntake - (taskCaloriesBurned + accCaloriesBurned)).toFixed(2),
                'intake': caloriesIntake.toFixed(2),
                'burned_tasks': taskCaloriesBurned.toFixed(2),
                'burned_accelerometer': accCaloriesBurned.toFixed(2)
            });
            
            // Disable the submit button during request
            const submitButton = this.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            }

            fetch('/update_calories', {
                method: 'POST',
                body: formData,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            })
            .then(response => response.json())
            .then(data => {
                if(data.success) {
                    // Update UI with returned values if they differ from what we sent
                    if (typeof addNotification === 'function') {
                        addNotification(`Successfully saved your calorie data!`, "success");
                    }
                    
                    // Refresh chart - wait a moment to allow server to process data
                    setTimeout(() => {
                        // Refresh the chart by fetching new data
                        fetchCaloriesData()
                            .then(chartData => {
                                createCaloriesChart(chartData);
                            })
                            .catch(error => {
                                console.error("Error refreshing chart:", error);
                            });
                            
                        // Reset the input field
                        if (caloriesIntakeInput) {
                            caloriesIntakeInput.value = '';
                        }
                        
                        // Ensure the intakeElement shows the saved value
                        const intakeElement = document.getElementById('total-intake');
                        if (intakeElement && data.intake) {
                            intakeElement.textContent = data.intake;
                        }
                    }, 800);
                }
            })
            .catch(error => {
                console.error("Error updating calories:", error);
                if (typeof addNotification === 'function') {
                    addNotification(`Error saving calorie data: ${error.message}`, "error");
                }
            })
            .finally(() => {
                // Re-enable submit button
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = '<i class="fas fa-save me-2"></i>Save Daily Calories';
                }
            });
        });
    }
});

// Extra initialization code to ensure burned calories summary is displayed correctly
document.addEventListener('DOMContentLoaded', function() {
    // Mirror the values between the two burned calories displays
    const totalBurned = document.getElementById('total-burned-calories');
    const totalBurnedDisplay = document.getElementById('total-burned-calories-display');
    
    if (totalBurned && totalBurnedDisplay) {
        // Initial sync
        totalBurnedDisplay.textContent = totalBurned.textContent;
        
        // Set up an observer to keep them in sync
        const observer = new MutationObserver(function(mutations) {
            totalBurnedDisplay.textContent = totalBurned.textContent;
        });
        
        observer.observe(totalBurned, { childList: true, characterData: true, subtree: true });
    }
});

function updateFormForMultiFileUpload() {
    const fileInputContainer = document.querySelector('#accelerometer-form .mb-3');
    if (!fileInputContainer) return;
    
    // Create a template with three file inputs
    const newHtml = `
        <div class="file-upload-container">
            <div class="mb-3">
                <label for="file-x" class="form-label">X-Axis Data File (CSV/Excel):</label>
                <input type="file" id="file-x" name="file_x" accept=".xlsx,.xls,.csv" required class="form-control">
                <small class="form-text text-muted">Upload file containing X-axis accelerometer data</small>
            </div>
            
            <div class="mb-3">
                <label for="file-y" class="form-label">Y-Axis Data File (CSV/Excel):</label>
                <input type="file" id="file-y" name="file_y" accept=".xlsx,.xls,.csv" required class="form-control">
                <small class="form-text text-muted">Upload file containing Y-axis accelerometer data</small>
            </div>
            
            <div class="mb-3">
                <label for="file-z" class="form-label">Z-Axis Data File (CSV/Excel):</label>
                <input type="file" id="file-z" name="file_z" accept=".xlsx,.xls,.csv" required class="form-control">
                <small class="form-text text-muted">Upload file containing Z-axis accelerometer data</small>
            </div>
        </div>
    `;
    
    // Replace the original file input with our new multi-file input
    fileInputContainer.outerHTML = newHtml;
    
    // Add change event listeners for validation
    document.getElementById('file-x').addEventListener('change', validateFile);
    document.getElementById('file-y').addEventListener('change', validateFile);
    document.getElementById('file-z').addEventListener('change', validateFile);
}

function validateFile(fileInput) {
    if (fileInput.files.length === 0) return true;
    
    const file = fileInput.files[0];
    const fileSize = file.size / 1024 / 1024; // Convert to MB
    const fileType = file.name.split('.').pop().toLowerCase();
    
    // Remove any previous error message
    const parent = fileInput.parentNode;
    const errorElement = parent.querySelector('.text-danger');
    const successElement = parent.querySelector('.text-success');

    if (errorElement) errorElement.remove();
    if (successElement) successElement.remove();
    
    // Check file size (10MB limit)
    if (fileSize > 10) {
        const error = document.createElement('div');
        error.className = 'text-danger mt-1';
        error.textContent = 'File is too large (max 10MB)';
        parent.appendChild(error);
        fileInput.value = '';
        return false;
    }
    
    // Check file type
    const allowedTypes = ['csv', 'xlsx', 'xls'];
    if (!allowedTypes.includes(fileType)) {
        const error = document.createElement('div');
        error.className = 'text-danger mt-1';
        error.textContent = 'Invalid file type. Please upload CSV or Excel files only.';
        parent.appendChild(error);
        fileInput.value = '';
        return false;
    }
    
    // Add success indicator
    const success = document.createElement('div');
    success.className = 'text-success mt-1';
    success.textContent = 'File ready for upload';
    parent.appendChild(success);
    
    return true;
}

function initializeCalorieSummary() {
    // Get the elements
    const intakeElement = document.getElementById('total-intake');
    const intakeInput = document.getElementById('calories-intake');
    const accCaloriesElement = document.getElementById('acc-calories-burned');

    if (intakeInput) {
        intakeInput.value = '';
    }
    
    if (accCaloriesElement && accCaloriesElement.textContent === '0') {
        fetchAccelerometerData();
    }
    
    setTimeout(() => {
        updateNetCalories();
    }, 100);
}

function saveCalorieGoal() {
    const goalDuration = parseInt(document.getElementById("calorie-goal-duration").value) || 1;
    const calorieTarget = parseFloat(document.getElementById("calorie-target").value);
    const includeExercises = document.getElementById("include-exercises").checked;
    const includeAccelerometer = document.getElementById("include-accelerometer").checked;
    
    // Validate input
    if (!calorieTarget || calorieTarget <= 0) {
        if (typeof addNotification === 'function') {
            addNotification("Please enter a valid calorie target", "warning");
        } else {
            alert("Please enter a valid calorie target");
        }
        return;
    }
    
    // Calculate end date based on duration
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + goalDuration);
    
    // Create the goal object
    const goal = {
        id: Date.now(),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        duration: goalDuration,
        dailyTarget: calorieTarget,
        totalTarget: calorieTarget * goalDuration,
        progress: 0,
        includeExercises: includeExercises,
        includeAccelerometer: includeAccelerometer,
        dailyProgress: [],
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    // Add the new goal to the array
    calorieGoals.push(goal);
    
    // Save to localStorage
    localStorage.setItem("calorieGoals", JSON.stringify(calorieGoals));
    
    // Show notification
    if (typeof addNotification === 'function') {
        addNotification(`New ${goalDuration}-day calorie goal created successfully!`, "success");
    } else {
        alert(`New ${goalDuration}-day calorie goal created successfully!`);
    }
    
    // Reset form
    document.getElementById("calorie-target").value = "";
    
    // Update the UI
    displayCalorieGoals();
}

// Display all calorie goals in the UI
function displayCalorieGoals() {
    const activeGoalsList = document.getElementById("calorie-goals-list");
    const completedGoalsList = document.getElementById("completed-calorie-goals");
    const progressContainer = document.getElementById("calorie-goal-progress");
    
    if (!activeGoalsList || !completedGoalsList || !progressContainer) {
        console.log("Required DOM elements for calorie goals not found");
        return;
    }
    
    // Clear the lists
    activeGoalsList.innerHTML = "";
    completedGoalsList.innerHTML = "";

    let calorieGoals = JSON.parse(localStorage.getItem('calorieGoals')) || [];

    if (calorieGoals.length === 0) {
        progressContainer.innerHTML = '<p class="text-center">No active calorie goals found. Create your first goal!</p>';
        return;
    }
    
    // Filter goals by active and completed
    const currentDate = new Date();
    const activeGoals = calorieGoals.filter(goal => !goal.completed && new Date(goal.endDate) >= currentDate);
    const completedGoals = calorieGoals.filter(goal => goal.completed || new Date(goal.endDate) < currentDate);
    
    // Update goals that have ended automatically
    calorieGoals.forEach(goal => {
        if (!goal.completed && new Date(goal.endDate) < currentDate) {
            goal.completed = true;
        }
    });
    localStorage.setItem("calorieGoals", JSON.stringify(calorieGoals));
    
    // Display active goals
    if (activeGoals.length === 0) {
        activeGoalsList.innerHTML = '<li class="no-goals">No active calorie goals. Create one to get started!</li>';
    } else {
        activeGoals.forEach(goal => {
            const startDate = new Date(goal.startDate);
            const endDate = new Date(goal.endDate);
            const daysLeft = Math.ceil((endDate - currentDate) / (1000 * 60 * 60 * 24));
            
            const progressPercentage = Math.min(100, Math.round((goal.progress / goal.totalTarget) * 100));
            
            const li = document.createElement("li");
            li.className = "calorie-goal-item mb-3";
            li.innerHTML = `
                <div class="justify-content-between align-items-start mb-2">
                    <div>
                        <h5 class="mb-1">Burn ${goal.dailyTarget} calories daily</h5>
                        <p class="mb-1 text-muted">
                            ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()} 
                            (${daysLeft > 0 ? daysLeft + ' days left' : 'Ends today'})
                        </p>
                    </div>
                    <div class="btn-group-cal">
                        <button class="btn btn-sm btn-outline-primary" onclick="recordDailyProgress(${goal.id})">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteCalorieGoal(${goal.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="progress mb-1" style="height: 10px;">
                    <div class="progress-bar bg-danger" role="progressbar" style="width: ${progressPercentage}%"></div>
                </div>
                <div class="d-flex justify-content-between">
                    <small>${goal.progress.toFixed(1)} / ${goal.totalTarget} calories</small>
                    <small>${progressPercentage}% complete</small>
                </div>
            `;
            
            activeGoalsList.appendChild(li);
        });
    }
    
    // Display completed goals
    if (completedGoals.length === 0) {
        completedGoalsList.innerHTML = '<li class="no-goals">No completed calorie goals yet.</li>';
    } else {
        // Sort completed goals by date (most recent first)
        completedGoals.sort((a, b) => new Date(b.endDate) - new Date(a.endDate));
        
        // Only show the last 5 completed goals
        const recentCompletedGoals = completedGoals.slice(0, 5);
        
        recentCompletedGoals.forEach(goal => {
            const startDate = new Date(goal.startDate);
            const endDate = new Date(goal.endDate);
            
            const progressPercentage = Math.min(100, Math.round((goal.progress / goal.totalTarget) * 100));
            const status = progressPercentage >= 100 ? 'success' : 'warning';
            
            const li = document.createElement("li");
            li.className = "calorie-goal-item mb-3";
            li.innerHTML = `
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                        <h5 class="mb-1">
                            <span class="badge bg-${status} me-2">
                                ${progressPercentage >= 100 ? 'Achieved' : 'Incomplete'}
                            </span>
                            ${goal.dailyTarget} calories daily
                        </h5>
                        <p class="mb-1 text-muted">
                            ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}
                        </p>
                    </div>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteCalorieGoal(${goal.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="progress mb-1" style="height: 10px;">
                    <div class="progress-bar bg-${status}" role="progressbar" style="width: ${progressPercentage}%"></div>
                </div>
                <div class="d-flex justify-content-between">
                    <small>${goal.progress.toFixed(1)} / ${goal.totalTarget} calories</small>
                    <small>${progressPercentage}% complete</small>
                </div>
            `;
            
            completedGoalsList.appendChild(li);
        });
    }
    
    // Update the progress section
    if (activeGoals.length > 0) {
        const mostRecentGoal = activeGoals.sort((a, b) => new Date(b.startDate) - new Date(a.startDate))[0];
        
        const startDate = new Date(mostRecentGoal.startDate);
        const endDate = new Date(mostRecentGoal.endDate);
        const daysPassed = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24));
        const totalDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
        
        // Calculate expected progress based on days passed
        const expectedProgress = mostRecentGoal.dailyTarget * Math.min(daysPassed, totalDays);
        const progressPercentage = Math.min(100, Math.round((mostRecentGoal.progress / mostRecentGoal.totalTarget) * 100));
        const dailyAverage = daysPassed > 0 ? mostRecentGoal.progress / daysPassed : 0;
        
        // Calculate if on track
        const isOnTrack = mostRecentGoal.progress >= expectedProgress;
        
        progressContainer.innerHTML = `
            <h5>Current Goal Progress</h5>
            <div class="progress mb-3" style="height: 20px;">
                <div class="progress-bar bg-danger" role="progressbar" style="width: ${progressPercentage}%">
                    ${progressPercentage}%
                </div>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <p><strong>Daily Target:</strong> ${mostRecentGoal.dailyTarget} calories</p>
                    <p><strong>Days Completed:</strong> ${daysPassed} of ${totalDays}</p>
                    <p><strong>Daily Average:</strong> ${dailyAverage.toFixed(1)} calories</p>
                </div>
                <div class="col-md-6">
                    <p><strong>Total Progress:</strong> ${mostRecentGoal.progress.toFixed(1)} / ${mostRecentGoal.totalTarget} calories</p>
                    <p><strong>Status:</strong> 
                        <span class="badge bg-${isOnTrack ? 'success' : 'warning'}">
                            ${isOnTrack ? 'On Track' : 'Behind Schedule'}
                        </span>
                    </p>
                    <p><strong>Needed Daily:</strong> ${calculateNeededDaily(mostRecentGoal).toFixed(1)} calories</p>
                </div>
            </div>
        `;
    } else {
        progressContainer.innerHTML = `
            <p class="text-center text-muted">No active calorie goals. Create one to see your progress!</p>
        `;
    }
}

// Calculate needed daily calories to reach goal
function calculateNeededDaily(goal) {
    const currentDate = new Date();
    const endDate = new Date(goal.endDate);
    const daysLeft = Math.max(1, Math.ceil((endDate - currentDate) / (1000 * 60 * 60 * 24)));
    
    const remaining = goal.totalTarget - goal.progress;
    return remaining / daysLeft;
}

// Record daily progress manually
function recordDailyProgress(goalId) {
    const goal = calorieGoals.find(g => g.id === goalId);
    if (!goal) return;
    
    // First check if we already have automatic data from tasks/accelerometer
    const today = new Date().toDateString();
    let todayProgress = 0;
    
    // Get task calories
    if (goal.includeExercises) {
        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        const todayTasks = tasks.filter(task => 
            task.completedToday && task.lastCompletedDate === today
        );
        
        todayTasks.forEach(task => {
            todayProgress += task.consumedCalories;
        });
    }
    
    // Prompt for manual entry
    let manualInput;
    const defaultValue = todayProgress > 0 ? todayProgress.toFixed(1) : '';
    
    if (todayProgress > 0) {
        manualInput = prompt(`You've burned ${todayProgress.toFixed(1)} calories today from tracked activities. Enter the total calories burned today:`, defaultValue);
    } else {
        manualInput = prompt("Enter calories burned today:", "0");
    }
    
    if (manualInput === null) return; // User cancelled
    
    const caloriesBurned = parseFloat(manualInput);
    if (isNaN(caloriesBurned) || caloriesBurned < 0) {
        if (typeof addNotification === 'function') {
            addNotification("Please enter a valid calorie value", "warning");
        } else {
            alert("Please enter a valid calorie value");
        }
        return;
    }
    
    // Check if we already have an entry for today
    const dateString = new Date().toISOString().split('T')[0];
    const existingEntryIndex = goal.dailyProgress.findIndex(entry => entry.date === dateString);
    
    if (existingEntryIndex >= 0) {
        // Update existing entry
        goal.dailyProgress[existingEntryIndex].calories = caloriesBurned;
    } else {
        // Add new entry
        goal.dailyProgress.push({
            date: dateString,
            calories: caloriesBurned
        });
    }
    
    // Recalculate total progress
    goal.progress = goal.dailyProgress.reduce((sum, entry) => sum + entry.calories, 0);
    
    // Check if goal is completed
    if (goal.progress >= goal.totalTarget) {
        if (typeof addNotification === 'function') {
            addNotification("Congratulations! You've achieved your calorie goal!", "success");
        } else {
            alert("Congratulations! You've achieved your calorie goal!");
        }
    }
    
    // Save to localStorage
    localStorage.setItem("calorieGoals", JSON.stringify(calorieGoals));
    
    // Update the UI
    displayCalorieGoals();
}

// Delete a calorie goal
function deleteCalorieGoal(goalId) {
    if (!confirm("Are you sure you want to delete this calorie goal?")) {
        return;
    }
    
    calorieGoals = calorieGoals.filter(goal => goal.id !== goalId);
    localStorage.setItem("calorieGoals", JSON.stringify(calorieGoals));
    
    if (typeof addNotification === 'function') {
        addNotification("Calorie goal deleted successfully", "info");
    } else {
        alert("Calorie goal deleted successfully");
    }
    
    displayCalorieGoals();
}

// Auto-update goal progress when task calories are recorded
function updateGoalFromTasks() {
    const today = new Date().toDateString();
    const dateString = new Date().toISOString().split('T')[0];
    
    // Get all tasks completed today
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const todayTasks = tasks.filter(task => 
        task.completedToday && task.lastCompletedDate === today
    );
    
    // Calculate total calories from tasks
    let totalTaskCalories = 0;
    todayTasks.forEach(task => {
        totalTaskCalories += task.consumedCalories;
    });
    
    let accelerometerCalories = 0;
    const accCaloriesElement = document.getElementById('acc-calories-burned');
    if (accCaloriesElement) {
        accelerometerCalories = parseFloat(accCaloriesElement.textContent) || 0;
    }

    // Update all active goals that include exercises
    calorieGoals.forEach(goal => {
        if (!goal.completed) {
            let todayCalories = 0;
            
            // Add task calories if enabled
            if (goal.includeExercises) {
                todayCalories += totalTaskCalories;
            }
            
            // Add accelerometer calories if enabled
            if (goal.includeAccelerometer) {
                todayCalories += accelerometerCalories;
            }
            
            const existingEntryIndex = goal.dailyProgress.findIndex(entry => entry.date === dateString);
            
            if (existingEntryIndex >= 0) {
                // Update existing entry
                goal.dailyProgress[existingEntryIndex].taskCalories = totalTaskCalories;
                goal.dailyProgress[existingEntryIndex].accelerometerCalories = accelerometerCalories;
                
                // If there was manual input, preserve it
                if (!goal.dailyProgress[existingEntryIndex].manualInput) {
                    goal.dailyProgress[existingEntryIndex].calories = todayCalories;
                }
            } else {
                // Add new entry
                goal.dailyProgress.push({
                    date: dateString,
                    calories: todayCalories,
                    taskCalories: totalTaskCalories,
                    accelerometerCalories: accelerometerCalories,
                    manualInput: false
                });
            }
            
            // Recalculate total progress
            goal.progress = goal.dailyProgress.reduce((sum, entry) => sum + entry.calories, 0);
            
            // Check if goal is completed
            if (goal.progress >= goal.totalTarget && !goal.completed) {
                goal.completed = true;
                if (typeof addNotification === 'function') {
                    addNotification("Congratulations! You've achieved your calorie goal!", "success");
                }
            }
        }
    });
    
    // Save to localStorage
    localStorage.setItem("calorieGoals", JSON.stringify(calorieGoals));
    
    // Update the UI
    displayCalorieGoals();
}

// Initialize when window loads
window.addEventListener('DOMContentLoaded', function() {
    displayCalorieGoals();
    
    setTimeout(() => {
        updateGoalFromTasks();
    }, 500);
});

const originalStartTask = window.startTask;
const originalUpdateTaskTime = window.updateTaskTime;
const originalResetTask = window.resetTask;
const originalDeleteTask = window.deleteTask;

// Override task functions to update calorie goals
if (typeof window.startTask === 'function') {
    window.startTask = function(taskId) {
        originalStartTask(taskId);
        // We don't update goals here since the task is just starting
    };
}

if (typeof window.updateTaskTime === 'function') {
    window.updateTaskTime = function(taskId) {
        originalUpdateTaskTime(taskId);
        
        // Get the task
        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        const task = tasks.find(t => t.id === taskId);
        
        // If task is completed, update goals
        if (task && task.remainingTime <= 0) {
            setTimeout(() => {
                updateGoalFromTasks();
            }, 100);
        }
    };
}

if (typeof window.resetTask === 'function') {
    window.resetTask = function(taskId) {
        originalResetTask(taskId);
        setTimeout(() => {
            updateGoalFromTasks();
        }, 100);
    };
}

if (typeof window.deleteTask === 'function') {
    window.deleteTask = function(taskId) {
        originalDeleteTask(taskId);
        setTimeout(() => {
            updateGoalFromTasks();
        }, 100);
    };
}

// Function to update the achievement counters
function updateAchievementCounters() {
    // Get all tasks from localStorage
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    
    // Calculate statistics
    let taskCaloriesBurned = 0;
    let totalActiveSeconds = 0;
    let completedTasks = 0;
    let ongoingTasks = 0;
    
    tasks.forEach(task => {
        // Calculate calories burned
        taskCaloriesBurned += task.consumedCalories;
        
        // Calculate active time (time - remaining time)
        const activeTime = task.time - task.remainingTime;
        totalActiveSeconds += activeTime;
        
        // Count completed and ongoing tasks
        if (task.remainingTime === 0) {
            completedTasks++;
        } else if (task.run) {
            ongoingTasks++;
        } else if (task.remainingTime > 0) {
            ongoingTasks++;
        }
    });
    
    // Convert seconds to hours for display
    const totalActiveHours = (totalActiveSeconds / 3600).toFixed(1);

    let accelerometerCalories = 0;
    const accCaloriesElement = document.getElementById('acc-calories-burned')

    if (accCaloriesElement) {
        accelerometerCalories = parseFloat(accCaloriesElement.textContent) || 0;
        updateDashboard();
    } else {
        // Element not found, fetch from server instead
        fetch('/get_accelerometer_calories')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    accelerometerCalories = parseFloat(data.calories_burned) || 0;
                    updateDashboard();
                }
            })
            .catch(error => {
                console.error('Error fetching accelerometer data:', error);
                // Continue with 0 calories
                updateDashboard();
            });
    }

    function updateDashboard() {
        // Calculate total calories burned
        const totalCaloriesBurned = taskCaloriesBurned + accelerometerCalories;
        
        // Update the counters on the dashboard if they exist
        const dashboardCards = document.querySelectorAll('.dashboard-card .value');
        if (dashboardCards.length >= 4) {
            // Update total calories burned
            dashboardCards[0].textContent = totalCaloriesBurned.toFixed(1);
            
            // Update total active hours
            dashboardCards[1].textContent = totalActiveHours;
            
            // Update completed tasks
            dashboardCards[2].textContent = completedTasks;
            
            // Update ongoing tasks
            dashboardCards[3].textContent = ongoingTasks;
            
            console.log("Dashboard cards updated with total calories:", totalCaloriesBurned.toFixed(1));
        }
        
        // Send the updated data to the server
        updateServerCounters(totalCaloriesBurned, totalActiveHours, completedTasks, ongoingTasks);
    }
}

// Function to send the updated counters to the server
function updateServerCounters(burnedCalories, activeHours, completed, ongoing) {
    // Only proceed if we're on a page with dashboard cards
    if (!document.querySelector('.dashboard-card')) {
        return;
    }
    
    const data = new URLSearchParams({
        'burned_calories': burnedCalories.toFixed(1),
        'active_hours': activeHours,
        'completed_tasks': completed,
        'ongoing_tasks': ongoing
    });
    
    fetch('/update_counters', {
        method: 'POST',
        body: data,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => {
        if (!response.ok) {
            console.error('Error updating counters:', response.statusText);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            console.log('Achievement counters updated successfully');
        }
    })
    .catch(error => {
        console.error('Error updating achievement counters:', error);
    });
}

// Call this function whenever a task is added, started, completed, reset, or deleted
function modifyExistingFunctions() {
    // Store references to original functions
    const originalSaveTask = window.saveTask;
    const originalStartTask = window.startTask;
    const originalUpdateTaskTime = window.updateTaskTime;
    const originalResetTask = window.resetTask;
    const originalDeleteTask = window.deleteTask;
    
    // Override saveTask to update counters when a task is created
    window.saveTask = function() {
        originalSaveTask.apply(this, arguments);
        updateAchievementCounters();
    };
    
    // Override startTask to update counters when a task is started
    window.startTask = function() {
        originalStartTask.apply(this, arguments);
        updateAchievementCounters();
    };
    
    // Override updateTaskTime to update counters when task progress changes
    window.updateTaskTime = function() {
        originalUpdateTaskTime.apply(this, arguments);
        // Only update periodically to avoid too many updates
        if (Math.random() < 0.1) { // Update roughly 10% of the time
            updateAchievementCounters();
        }
    };
    
    // Override resetTask to update counters when a task is reset
    window.resetTask = function() {
        originalResetTask.apply(this, arguments);
        updateAchievementCounters();
    };
    
    // Override deleteTask to update counters when a task is deleted
    window.deleteTask = function() {
        originalDeleteTask.apply(this, arguments);
        updateAchievementCounters();
    };
}

function fetchAccelerometerCaloriesAndUpdateCounters() {
    fetch('/get_accelerometer_calories')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const calories = data.calories_burned || 0;
                
                // Update the accelerometer calories display if it exists
                const accCaloriesElement = document.getElementById('acc-calories-burned');
                if (accCaloriesElement) {
                    accCaloriesElement.textContent = calories;
                }
                
                // Update the achievement counters
                updateAchievementCounters();
                
                console.log('Fetched accelerometer calories:', calories);
            }
        })
        .catch(error => {
            console.error('Error fetching accelerometer calories:', error);
        });
}

// Modify the existing handleAccelerometerUpload function
function enhanceAccelerometerUpload() {
    if (typeof window.handleAccelerometerUpload !== 'function') {
        console.warn('handleAccelerometerUpload function not found');
        return;
    }
    
    const originalHandleAccelerometerUpload = window.handleAccelerometerUpload;
    
    window.handleAccelerometerUpload = function(event) {
        // Store the original implementation
        const originalImplementation = originalHandleAccelerometerUpload;
        
        // Call the original function with the current context and arguments
        originalImplementation.apply(this, arguments);
        
        // After a delay, fetch the latest accelerometer data and update counters
        setTimeout(() => {
            fetch('/get_accelerometer_calories')
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Update the accelerometer calories display
                        const accCaloriesElement = document.getElementById('acc-calories-burned');
                        if (accCaloriesElement) {
                            accCaloriesElement.textContent = data.calories_burned;
                        }
                        
                        // Update achievement counters
                        updateAchievementCounters();
                        
                        console.log('Accelerometer calories updated: ', data.calories_burned);
                    }
                })
                .catch(error => {
                    console.error('Error fetching accelerometer data after upload:', error);
                });
        }, 1000); // Wait for server to process the upload
    };
}