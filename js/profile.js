// Show initials in avatar based on full name and display name below avatar
function getInitials(name) {
  if (!name) return "";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
function updateAvatarAndName() {
  const name = document.getElementById("fullName").value;
  const avatar = document.getElementById("profileAvatar");
  const nameDisplay = document.getElementById("profileNameDisplay");
  const initials = getInitials(name);
  avatar.innerHTML = initials ? initials : '<i class="bi bi-person"></i>';
  nameDisplay.textContent = name || "";
}
document
  .getElementById("fullName")
  .addEventListener("input", updateAvatarAndName);
// Initialize avatar and name on page load
updateAvatarAndName();

// Update Profile: After success, update the avatar and name display

// Change Password: After success, log out and redirect to login, and ensure password is updated in Firebase
document
  .getElementById("changePasswordForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match.");
      return;
    }
    const user = firebase.auth().currentUser;
    if (!user) {
      alert("No user is currently signed in.");
      return;
    }
    const email = user.email;
    // Re-authenticate user (Firebase v8 uses user.reauthenticateWithCredential)
    const credential = firebase.auth.EmailAuthProvider.credential(email, currentPassword);
    user.reauthenticateWithCredential(credential)
      .then(function() {
        // Update password in Firebase
        return user.updatePassword(newPassword);
      })
      .then(function() {
        alert("Password changed successfully. You will be logged out.");
        // Log out and redirect to login page
        return firebase.auth().signOut();
      })
      .then(function() {
        window.location.href = "login.html";
      })
      .catch(function(error) {
        alert(error.message);
      });
  });
