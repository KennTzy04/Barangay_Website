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
            // Show confirmation modal with instructions
            const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
            const modalBody = document.getElementById('confirmationModalBody');
            modalBody.innerHTML = `
                <div class="mb-2"><i class="bi bi-check-circle text-success me-2"></i><strong>Password reset email sent!</strong></div>
                <div>Please check your inbox. If you don't see the email, check your <strong>Spam</strong> or <strong>Junk</strong> folder.<br>Mark the email as "Not Spam" to receive future emails in your inbox.</div>
            `;
            confirmationModal.show();
        })
        .catch(function (error) {
            let msg = 'Failed to send reset email. Please try again.';
            if (error.code === 'auth/user-not-found') {
                msg = 'No account found with that email address.';
            } else if (error.code === 'auth/invalid-email') {
                msg = 'Invalid email address.';
            }
            // Show confirmation modal with error
            const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
            const modalBody = document.getElementById('confirmationModalBody');
            modalBody.innerHTML = `
                <div class="mb-2"><i class="bi bi-x-circle text-danger me-2"></i><strong>${msg}</strong></div>
                <div>If you believe this is a mistake, please double-check your email address or contact support.</div>
            `;
            confirmationModal.show();
        });
});
