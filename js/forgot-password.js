// Password Reset Functionality

// Handle password reset form submission
async function handlePasswordReset(event) {
    event.preventDefault();
    
    const email = document.getElementById('resetEmail').value.trim();
    const errorDiv = document.getElementById('resetError');
    const successDiv = document.getElementById('resetSuccess');
    const submitBtn = event.target.querySelector('button[type="submit"]');
    
    // Hide previous messages
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    
    // Show loading state
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Sending...';
    submitBtn.disabled = true;
    
    try {
        // Send password reset email with continue URL to login page
        await firebase.auth().sendPasswordResetEmail(email, {
            url: window.location.origin + '/login.html'
        });
        
        // Show success message
        successDiv.style.display = 'block';
        // Show spam warning modal (Bootstrap 5)
        var spamModalEl = document.getElementById('spamWarningModal');
        if (spamModalEl) {
            var spamModal = bootstrap.Modal.getOrCreateInstance(spamModalEl);
            spamModal.show();
        }
        // Reset form
        document.getElementById('resetEmail').value = '';
    } catch (error) {
        console.error('Password reset error:', error);
        
        let errorMessage = 'Failed to send reset email. Please try again.';
        
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'No account found with this email address.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Please enter a valid email address.';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Too many attempts. Please try again later.';
                break;
        }
        
        document.getElementById('errorMessage').textContent = errorMessage;
        errorDiv.style.display = 'block';
    } finally {
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Initialize password reset form
document.addEventListener('DOMContentLoaded', function() {
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', handlePasswordReset);
    }
}); 