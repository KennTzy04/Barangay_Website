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

// Register new user with Firebase
async function registerUser(userData) {
    try {
        // Create user with Firebase Authentication
        const userCredential = await firebaseAuth.createUserWithEmailAndPassword(
            userData.email, 
            userData.password
        );
        
        const user = userCredential.user;
        
        // Save additional user data to Firestore
        await firebaseDB.collection('users').doc(user.uid).set({
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            phone: userData.phone,
            address: userData.address,
            registeredAt: new Date().toISOString(),
            status: 'active',
            role: 'resident',
            emailVerified: false
        });
        
        // Send email verification
        await user.sendEmailVerification();
        
        return { success: true, message: 'Account created successfully!' };
    } catch (error) {
        console.error('Registration error:', error);
        
        let errorMessage = 'Registration failed. Please try again.';
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'Email address already exists. Please use a different email.';
                break;
            case 'auth/weak-password':
                errorMessage = 'Password is too weak. Please choose a stronger password.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Please enter a valid email address.';
                break;
        }
        
        return { success: false, message: errorMessage };
    }
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
async function handleRegistration(event) {
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
    
    // Show loading state
    const submitBtn = document.querySelector('#registerForm button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Creating Account...';
    submitBtn.disabled = true;
    
    try {
        // Try to register user
        const result = await registerUser(formData);
        
            if (result.success) {
        showSuccess();
        // Show email verification message
        document.getElementById('registerSuccess').innerHTML = `
            <i class="bi bi-check-circle me-2"></i>
            Account created successfully! Please check your email for verification link.
        `;
        // Redirect to login page after 5 seconds
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 5000);
    } else {
        showError(result.message);
    }
    } catch (error) {
        showError('Registration failed. Please try again.');
    } finally {
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
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
    
    // Create sample user if no users exist
    // (Remove createSampleUser function and its call)
});

// Export functions for use in other scripts
window.register = {
    getRegisteredUsers,
    saveRegisteredUsers,
    isEmailExists,
    registerUser,
    validatePassword
}; 