// Authentication System for Barangay Website

// Admin credentials (in a real application, this would be server-side)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('adminLoggedIn') === 'true';
}

// Check if user is on admin page
function isAdminPage() {
    return window.location.pathname.includes('admin.html');
}

// Redirect to login if not authenticated
function requireAuth() {
    if (!isLoggedIn() && isAdminPage()) {
        window.location.href = 'login.html';
    }
}

// Login function
function login(username, password) {
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('adminUsername', username);
        return true;
    }
    return false;
}

// Logout function
function logout() {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    window.location.href = 'index.html';
}

// Update navigation based on login status
function updateNavigation() {
    const loginLink = document.getElementById('loginLink');
    const logoutLink = document.getElementById('logoutLink');
    const adminLink = document.getElementById('adminLink');
    
    if (isLoggedIn()) {
        if (loginLink) loginLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'block';
        if (adminLink) adminLink.style.display = 'block';
    } else {
        if (loginLink) loginLink.style.display = 'block';
        if (logoutLink) logoutLink.style.display = 'none';
        if (adminLink) adminLink.style.display = 'none';
    }
}

// Handle login form submission
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    
    if (login(username, password)) {
        window.location.href = 'admin.html';
    } else {
        errorDiv.style.display = 'block';
        document.getElementById('password').value = '';
    }
}

// Initialize authentication
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication on page load
    requireAuth();
    updateNavigation();
    
    // Handle login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Handle logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Auto-hide error message after 5 seconds
    const errorDiv = document.getElementById('loginError');
    if (errorDiv) {
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
});

// Export functions for use in other scripts
window.auth = {
    isLoggedIn,
    login,
    logout,
    requireAuth,
    updateNavigation
}; 