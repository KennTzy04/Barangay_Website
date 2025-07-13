// Authentication System for Barangay Website

// Admin credentials (in a real application, this would be server-side)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// User credentials (in a real application, this would be server-side)
// Note: Users will be stored in localStorage after registration

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('adminLoggedIn') === 'true' || localStorage.getItem('userLoggedIn') === 'true';
}

// Check if admin is logged in
function isAdminLoggedIn() {
    return localStorage.getItem('adminLoggedIn') === 'true';
}

// Check if user is logged in
function isUserLoggedIn() {
    return localStorage.getItem('userLoggedIn') === 'true';
}

// Check if user is on admin page
function isAdminPage() {
    return window.location.pathname.includes('admin.html');
}

// Check if user is on login page
function isLoginPage() {
    return window.location.pathname.includes('login.html');
}

// Redirect to login if not authenticated
function requireAuth() {
    // Skip authentication check for login page and main page
    if (isLoginPage() || window.location.pathname.includes('index.html')) {
        return;
    }
    
    // If not logged in, redirect to main page
    if (!isLoggedIn()) {
        window.location.href = 'index.html';
    }
}

// Admin login function
function adminLogin(username, password) {
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('adminUsername', username);
        return true;
    }
    return false;
}

// User login function
function userLogin(email, password) {
    // Get registered users from localStorage
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    // Find user with matching email and password
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        localStorage.setItem('userLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userId', user.id);
        localStorage.setItem('userName', `${user.firstName} ${user.lastName}`);
        return true;
    }
    return false;
}

// Logout function
function logout() {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userEmail');
    window.location.href = 'index.html';
}

// Update navigation based on login status
function updateNavigation() {
    const loginLink = document.getElementById('loginLink');
    const adminLink = document.getElementById('adminLink');
    const logoutSection = document.getElementById('logoutSection');
    
    if (isAdminLoggedIn()) {
        if (loginLink) loginLink.style.display = 'none';
        if (adminLink) adminLink.style.display = 'block';
        if (logoutSection) {
            logoutSection.style.display = 'block';
            const statusText = logoutSection.querySelector('p');
            if (statusText) {
                statusText.textContent = 'Logged in as Admin';
            }
        }
    } else if (isUserLoggedIn()) {
        if (loginLink) loginLink.style.display = 'none';
        if (adminLink) adminLink.style.display = 'none';
        if (logoutSection) {
            logoutSection.style.display = 'block';
            const statusText = logoutSection.querySelector('p');
            if (statusText) {
                statusText.textContent = 'Logged in as Resident';
            }
        }
    } else {
        if (loginLink) loginLink.style.display = 'block';
        if (adminLink) adminLink.style.display = 'none';
        if (logoutSection) logoutSection.style.display = 'none';
    }
}

// Handle admin login form submission
function handleAdminLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    const errorDiv = document.getElementById('adminLoginError');
    
    if (adminLogin(username, password)) {
        // Redirect to admin dashboard after successful login
        window.location.href = 'admin.html';
    } else {
        errorDiv.style.display = 'block';
        document.getElementById('adminPassword').value = '';
    }
}

// Handle user login form submission
function handleUserLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('userEmail').value;
    const password = document.getElementById('userPassword').value;
    const errorDiv = document.getElementById('userLoginError');
    
    if (userLogin(email, password)) {
        // Redirect to dashboard after successful login
        window.location.href = 'dashboard.html';
    } else {
        errorDiv.style.display = 'block';
        document.getElementById('userPassword').value = '';
    }
}

// Initialize authentication
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication on page load
    requireAuth();
    updateNavigation();
    
    // Handle admin login form
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', handleAdminLogin);
    }
    
    // Handle user login form
    const userLoginForm = document.getElementById('userLoginForm');
    if (userLoginForm) {
        userLoginForm.addEventListener('submit', handleUserLogin);
    }
    
    // Handle logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Auto-hide error messages after 5 seconds
    const adminErrorDiv = document.getElementById('adminLoginError');
    if (adminErrorDiv) {
        setTimeout(() => {
            adminErrorDiv.style.display = 'none';
        }, 5000);
    }
    
    const userErrorDiv = document.getElementById('userLoginError');
    if (userErrorDiv) {
        setTimeout(() => {
            userErrorDiv.style.display = 'none';
        }, 5000);
    }
});

// Export functions for use in other scripts
window.auth = {
    isLoggedIn,
    isAdminLoggedIn,
    isUserLoggedIn,
    adminLogin,
    userLogin,
    logout,
    requireAuth,
    updateNavigation
}; 