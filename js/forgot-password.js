// Initialize Firebase Auth
const auth = firebase.auth();

const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const resetEmailInput = document.getElementById('resetEmail');
const resetError = document.getElementById('resetError');
const resetSuccess = document.getElementById('resetSuccess');
const errorMessage = document.getElementById('errorMessage');

forgotPasswordForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const email = resetEmailInput.value.trim();
    resetError.style.display = 'none';
    resetSuccess.style.display = 'none';

    if (!email) {
        errorMessage.textContent = 'Please enter your email address.';
        resetError.style.display = 'block';
        return;
    }

    auth.sendPasswordResetEmail(email)
        .then(function () {
            resetSuccess.style.display = 'block';
            // Show spam warning modal
            const spamModal = new bootstrap.Modal(document.getElementById('spamWarningModal'));
            spamModal.show();
        })
        .catch(function (error) {
            let msg = 'Failed to send reset email. Please try again.';
            if (error.code === 'auth/user-not-found') {
                msg = 'No account found with that email address.';
            } else if (error.code === 'auth/invalid-email') {
                msg = 'Invalid email address.';
            }
            errorMessage.textContent = msg;
            resetError.style.display = 'block';
        });
});
