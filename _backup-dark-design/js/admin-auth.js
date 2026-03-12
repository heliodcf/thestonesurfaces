/**
 * The Stone Surfaces — Admin Authentication
 * SHA-256 password hashing, session management, route guard
 */
const AdminAuth = (() => {
  /**
   * Hash a string using SHA-256 via Web Crypto API
   */
  async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Attempt login with password
   * Returns { success: boolean, error?: string }
   */
  async function login(password) {
    if (!password || password.trim() === '') {
      return { success: false, error: 'Please enter your password.' };
    }

    const hash = await hashPassword(password);

    if (hash !== ADMIN_CONFIG.AUTH_HASH) {
      return { success: false, error: 'Invalid password. Access denied.' };
    }

    const session = {
      authenticated: true,
      loginAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + ADMIN_CONFIG.SESSION_DURATION_MS).toISOString(),
    };

    sessionStorage.setItem(ADMIN_CONFIG.SESSION_KEY, JSON.stringify(session));
    return { success: true };
  }

  /**
   * Check if current session is valid
   * Returns boolean
   */
  function isAuthenticated() {
    const raw = sessionStorage.getItem(ADMIN_CONFIG.SESSION_KEY);
    if (!raw) return false;

    try {
      const session = JSON.parse(raw);
      if (!session.authenticated) return false;
      if (new Date(session.expiresAt) < new Date()) {
        sessionStorage.removeItem(ADMIN_CONFIG.SESSION_KEY);
        return false;
      }
      return true;
    } catch {
      sessionStorage.removeItem(ADMIN_CONFIG.SESSION_KEY);
      return false;
    }
  }

  /**
   * Guard function for admin pages
   * Redirects to login if not authenticated, reveals main content if valid
   */
  function guard() {
    if (!isAuthenticated()) {
      // Determine correct relative path to login page
      const path = window.location.pathname;
      if (path.includes('/admin/')) {
        window.location.href = '../admin-login.html';
      } else {
        window.location.href = 'admin-login.html';
      }
      return false;
    }

    // Reveal protected content
    const main = document.querySelector('main');
    if (main) main.style.display = '';
    return true;
  }

  /**
   * Logout and redirect to login page
   */
  function logout() {
    sessionStorage.removeItem(ADMIN_CONFIG.SESSION_KEY);
    const path = window.location.pathname;
    if (path.includes('/admin/')) {
      window.location.href = '../admin-login.html';
    } else {
      window.location.href = 'admin-login.html';
    }
  }

  return { hashPassword, login, isAuthenticated, guard, logout };
})();
