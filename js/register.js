// User Registration System

// Get registered users from localStorage or initialize empty array
function getRegisteredUsers() {
    const users = localStorage.getItem('registeredUsers');
    return users ? JSON.parse(users) : [];
}

// Save registered users to localStorage
function saveRegisteredUsers(users) {
    localStorage.setItem('registeredUsers', JSON.stringify(users));
}

// Check if email already exists
function isEmailExists(email) {
    const users = getRegisteredUsers();
    return users.some(user => user.email === email);
}

// Register new user
function registerUser(userData) {
    const users = getRegisteredUsers();
    
    // Check if email already exists
    if (isEmailExists(userData.email)) {
        return { success: false, message: 'Email address already exists. Please use a different email.' };
    }
    
    // Add user to the list
    users.push({
        ...userData,
        id: Date.now().toString(), // Simple ID generation
        registeredAt: new Date().toISOString(),
        status: 'active'
    });
    
    // Save to localStorage
    saveRegisteredUsers(users);
    
    return { success: true, message: 'Account created successfully!' };
}

// Validate password strength
function validatePassword(password) {
    const minLength = 6;
    if (password.length < minLength) {
        return { valid: false, message: `Password must be at least ${minLength} characters long.` };
    }
    return { valid: true };
}

// Validate form data
function validateForm(formData) {
    const errors = [];
    
    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
        errors.push('Passwords do not match.');
    }
    
    // Validate password strength
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
        errors.push(passwordValidation.message);
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        errors.push('Please enter a valid email address.');
    }
    
    // Validate phone number (basic validation)
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(formData.phone)) {
        errors.push('Please enter a valid phone number.');
    }
    
    return errors;
}

// Handle registration form submission
function handleRegistration(event) {
    event.preventDefault();
    
    // Get form data
    const formData = {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        email: document.getElementById('email').value.trim().toLowerCase(),
        phone: document.getElementById('phone').value.trim(),
        address: document.getElementById('address').value.trim(),
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirmPassword').value
    };
    
    // Hide previous messages
    document.getElementById('registerError').style.display = 'none';
    document.getElementById('registerSuccess').style.display = 'none';
    
    // Validate form data
    const validationErrors = validateForm(formData);
    
    if (validationErrors.length > 0) {
        showError(validationErrors.join(' '));
        return;
    }
    
    // Try to register user
    const result = registerUser(formData);
    
    if (result.success) {
        showSuccess();
        // Redirect to login page after 2 seconds
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    } else {
        showError(result.message);
    }
}

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('registerError');
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorDiv.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// Show success message
function showSuccess() {
    const successDiv = document.getElementById('registerSuccess');
    successDiv.style.display = 'block';
}

// Initialize registration form
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }
    
    // Add real-time password confirmation validation
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    
    if (confirmPassword) {
        confirmPassword.addEventListener('input', function() {
            const passwordValue = password.value;
            const confirmValue = this.value;
            
            if (confirmValue && passwordValue !== confirmValue) {
                this.setCustomValidity('Passwords do not match');
            } else {
                this.setCustomValidity('');
            }
        });
    }
    
    // Add password strength indicator
    if (password) {
        password.addEventListener('input', function() {
            const strength = validatePassword(this.value);
            const confirmField = document.getElementById('confirmPassword');
            
            if (!strength.valid && this.value) {
                this.setCustomValidity(strength.message);
            } else {
                this.setCustomValidity('');
            }
            
            // Update confirm password validation
            if (confirmField && confirmField.value) {
                if (this.value !== confirmField.value) {
                    confirmField.setCustomValidity('Passwords do not match');
                } else {
                    confirmField.setCustomValidity('');
                }
            }
        });
    }
});

// Export functions for use in other scripts
window.register = {
    getRegisteredUsers,
    saveRegisteredUsers,
    isEmailExists,
    registerUser,
    validatePassword
}; 