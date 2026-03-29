/**
 * WacoPro Fitness - Auth Guard
 * Protects pages from unauthorized access
 */

// Requires user to be logged in
function requireAuth() {
  if (!window.api.isLoggedIn()) {
    window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname);
    return false;
  }
  return true;
}

// Requires user to NOT be logged in (guest pages like login/register)
function requireGuest() {
  if (window.api.isLoggedIn()) {
    window.location.href = '/dashboard.html';
    return false;
  }
  return true;
}

// Global logout function
async function logout() {
  if (confirm('¿Cerrar sesión?')) {
    window.api.logout();
  }
}
