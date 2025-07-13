// User Dashboard System

// Get current user information
function getCurrentUser() {
    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');
    
    return {
        id: userId,
        email: userEmail,
        name: userName
    };
}

// Update user information display
function updateUserDisplay() {
    const user = getCurrentUser();
    const userNameElement = document.getElementById('userName');
    const userStatusElement = document.getElementById('userStatus');
    
    if (userNameElement && user.name) {
        userNameElement.textContent = user.name;
    }
    
    if (userStatusElement) {
        userStatusElement.textContent = `Logged in as ${user.name || 'Resident'}`;
    }
}

// Set current date
function setCurrentDate() {
    const currentDateElement = document.getElementById('currentDate');
    if (currentDateElement) {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        currentDateElement.textContent = now.toLocaleDateString('en-US', options);
    }
}

// Load user activities
function loadUserActivities() {
    const activitiesContainer = document.getElementById('recentActivities');
    if (!activitiesContainer) return;
    
    // Get user activities from localStorage or create default
    const activities = JSON.parse(localStorage.getItem('userActivities') || '[]');
    
    if (activities.length === 0) {
        // Add default activities for new users
        const defaultActivities = [
            {
                type: 'account_created',
                title: 'Account Created',
                description: 'Welcome to Barangay Patag CDO!',
                date: new Date().toISOString(),
                icon: 'bi-check-circle',
                color: 'bg-primary'
            },
            {
                type: 'profile_updated',
                title: 'Profile Updated',
                description: 'Your account information has been verified.',
                date: new Date().toISOString(),
                icon: 'bi-info-circle',
                color: 'bg-info'
            }
        ];
        
        localStorage.setItem('userActivities', JSON.stringify(defaultActivities));
        displayActivities(defaultActivities);
    } else {
        displayActivities(activities);
    }
}

// Display activities
function displayActivities(activities) {
    const activitiesContainer = document.getElementById('recentActivities');
    if (!activitiesContainer) return;
    
    activitiesContainer.innerHTML = '';
    
    activities.slice(0, 5).forEach(activity => {
        const activityElement = document.createElement('div');
        activityElement.className = 'd-flex align-items-center mb-3';
        activityElement.innerHTML = `
            <div class="${activity.color} rounded-circle p-2 me-3">
                <i class="bi ${activity.icon} text-white"></i>
            </div>
            <div>
                <h6 class="mb-1">${activity.title}</h6>
                <small class="text-muted">${activity.description}</small>
                <br>
                <small class="text-muted">${new Date(activity.date).toLocaleDateString()}</small>
            </div>
        `;
        activitiesContainer.appendChild(activityElement);
    });
}

// Add new activity
function addActivity(type, title, description) {
    const activities = JSON.parse(localStorage.getItem('userActivities') || '[]');
    
    const newActivity = {
        type,
        title,
        description,
        date: new Date().toISOString(),
        icon: getActivityIcon(type),
        color: getActivityColor(type)
    };
    
    activities.unshift(newActivity);
    
    // Keep only last 10 activities
    if (activities.length > 10) {
        activities.splice(10);
    }
    
    localStorage.setItem('userActivities', JSON.stringify(activities));
    displayActivities(activities);
}

// Get activity icon based on type
function getActivityIcon(type) {
    const icons = {
        'account_created': 'bi-check-circle',
        'profile_updated': 'bi-info-circle',
        'service_requested': 'bi-file-earmark-text',
        'violation_reported': 'bi-exclamation-triangle',
        'announcement_read': 'bi-megaphone',
        'login': 'bi-box-arrow-in-right',
        'logout': 'bi-box-arrow-right'
    };
    return icons[type] || 'bi-info-circle';
}

// Get activity color based on type
function getActivityColor(type) {
    const colors = {
        'account_created': 'bg-primary',
        'profile_updated': 'bg-info',
        'service_requested': 'bg-success',
        'violation_reported': 'bg-warning',
        'announcement_read': 'bg-secondary',
        'login': 'bg-success',
        'logout': 'bg-secondary'
    };
    return colors[type] || 'bg-info';
}

// Load notifications
function loadNotifications() {
    const notificationsContainer = document.getElementById('notifications');
    if (!notificationsContainer) return;
    
    // Get notifications from localStorage or create default
    const notifications = JSON.parse(localStorage.getItem('userNotifications') || '[]');
    
    if (notifications.length === 0) {
        // Add default notifications for new users
        const defaultNotifications = [
            {
                type: 'info',
                message: 'Welcome to your dashboard!',
                icon: 'bi-info-circle'
            },
            {
                type: 'warning',
                message: 'Complete your profile information.',
                icon: 'bi-exclamation-triangle'
            }
        ];
        
        localStorage.setItem('userNotifications', JSON.stringify(defaultNotifications));
        displayNotifications(defaultNotifications);
    } else {
        displayNotifications(notifications);
    }
}

// Display notifications
function displayNotifications(notifications) {
    const notificationsContainer = document.getElementById('notifications');
    if (!notificationsContainer) return;
    
    notificationsContainer.innerHTML = '';
    
    notifications.slice(0, 5).forEach(notification => {
        const notificationElement = document.createElement('div');
        notificationElement.className = `alert alert-${notification.type} alert-sm mb-2`;
        notificationElement.innerHTML = `
            <small><i class="bi ${notification.icon} me-1"></i>${notification.message}</small>
        `;
        notificationsContainer.appendChild(notificationElement);
    });
}

// Add new notification
function addNotification(type, message, icon) {
    const notifications = JSON.parse(localStorage.getItem('userNotifications') || '[]');
    
    const newNotification = {
        type,
        message,
        icon: icon || getNotificationIcon(type),
        date: new Date().toISOString()
    };
    
    notifications.unshift(newNotification);
    
    // Keep only last 10 notifications
    if (notifications.length > 10) {
        notifications.splice(10);
    }
    
    localStorage.setItem('userNotifications', JSON.stringify(notifications));
    displayNotifications(notifications);
}

// Get notification icon based on type
function getNotificationIcon(type) {
    const icons = {
        'info': 'bi-info-circle',
        'success': 'bi-check-circle',
        'warning': 'bi-exclamation-triangle',
        'danger': 'bi-x-circle'
    };
    return icons[type] || 'bi-info-circle';
}

// Handle logout
function handleLogout() {
    // Add logout activity
    addActivity('logout', 'Logged Out', 'You have successfully logged out.');
    
    // Clear user session
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    
    // Redirect to login page
    window.location.href = 'login.html';
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Update user display
    updateUserDisplay();
    
    // Set current date
    setCurrentDate();
    
    // Load user activities
    loadUserActivities();
    
    // Load notifications
    loadNotifications();
    
    // Handle logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Add login activity
    addActivity('login', 'Logged In', 'You have successfully logged in to your dashboard.');
    
    // Add welcome notification
    addNotification('info', 'Welcome to your dashboard!', 'bi-info-circle');
});

// Export functions for use in other scripts
window.dashboard = {
    getCurrentUser,
    updateUserDisplay,
    addActivity,
    addNotification,
    handleLogout
}; 