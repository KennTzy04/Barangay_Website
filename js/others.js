// Set current year in footer
document.getElementById("currentYear").textContent = new Date().getFullYear();

// Authentication Check

// Check if user is logged in before loading the page
if (localStorage.getItem("adminLoggedIn") !== "true") {
  window.location.href = "login.html";
}

