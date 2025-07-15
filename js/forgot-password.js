// Use global 'auth' from firebase-config.js

document.addEventListener('DOMContentLoaded', function () {
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
                // Show top message and scroll to it
                resetSuccess.style.display = 'block';
                resetSuccess.innerHTML = `
                    <i class="bi bi-check-circle me-2"></i>
                    Password reset email sent! Please check your inbox. If you don't see the email, check your <strong>Spam</strong> or <strong>Junk</strong> folder.`;
                window.scrollTo({ top: resetSuccess.offsetTop - 40, behavior: 'smooth' });
                // Show confirmation modal with instructions
                const confirmationModalEl = document.getElementById('confirmationModal');
                const modalBody = document.getElementById('confirmationModalBody');
                modalBody.innerHTML = `
                    <div class="mb-2"><i class="bi bi-check-circle text-success me-2"></i><strong>Password reset email sent!</strong></div>
                    <div>Please check your inbox. If you don't see the email, check your <strong>Spam</strong> or <strong>Junk</strong> folder.
                    <br>Mark the email as "Not Spam" to receive future emails in your inbox.</div>
                    <div class="mt-2">After you change your password, <strong>return here and <a href='login.html' class='text-primary fw-semibold'>log in</a> with your new password</strong>.</div>
                    <hr>
                `;
                if (window.bootstrap && confirmationModalEl) {
                    // Remove lingering modal-backdrop overlays
                    document.querySelectorAll('.modal-backdrop').forEach(function(backdrop) {
                        backdrop.parentNode.removeChild(backdrop);
                    });
                    // Hide any existing modals before showing new one
                    document.querySelectorAll('.modal.show').forEach(function(modal) {
                        bootstrap.Modal.getInstance(modal)?.hide();
                    });
                    setTimeout(function() {
                        const confirmationModal = new bootstrap.Modal(confirmationModalEl, {focus: true});
                        confirmationModalEl.classList.add('show');
                        confirmationModalEl.style.display = 'block';
                        confirmationModal.show();
                        confirmationModalEl.focus();
                        // Redirect to login.html after modal is closed
                        confirmationModalEl.addEventListener('hidden.bs.modal', function redirectToLogin() {
                            window.location.href = 'login.html';
                            confirmationModalEl.removeEventListener('hidden.bs.modal', redirectToLogin);
                        });
                    }, 100);
                }
            })
            .catch(function (error) {
                let msg = 'Failed to send reset email. Please try again.';
                if (error.code === 'auth/user-not-found') {
                    msg = 'No account found with that email address.';
                } else if (error.code === 'auth/invalid-email') {
                    msg = 'Invalid email address.';
                }
                // Show top error message and scroll to it
                resetError.style.display = 'block';
                errorMessage.textContent = msg;
                window.scrollTo({ top: resetError.offsetTop - 40, behavior: 'smooth' });
                // Show confirmation modal with error
                const confirmationModalEl = document.getElementById('confirmationModal');
                const modalBody = document.getElementById('confirmationModalBody');
                modalBody.innerHTML = `
                    <div class="mb-2"><i class="bi bi-x-circle text-danger me-2"></i><strong>${msg}</strong></div>
                    <div>If you believe this is a mistake, please double-check your email address or contact support.</div>
                `;
                if (window.bootstrap && confirmationModalEl) {
                    const confirmationModal = new bootstrap.Modal(confirmationModalEl);
                    confirmationModal.show();
                }
            });
    });
});
