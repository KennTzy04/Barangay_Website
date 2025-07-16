// Set current year in footer
document.getElementById("currentYear").textContent = new Date().getFullYear();

// Authentication Check

function requireAuth() {
  const publicPages = [
    "index.html",
    "",
    "login.html",
    "officials.html",
    "about.html",
  ];
  const currentPage = window.location.pathname.split("/").pop();

  if (publicPages.includes(currentPage)) {
    return;
  }

  if (!isLoggedIn()) {
    window.location.href = "login.html";
  }
}
