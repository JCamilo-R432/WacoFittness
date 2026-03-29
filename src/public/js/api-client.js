/**
 * WacoPro Fitness - API Client
 * Handles all communication with the backend API
 */

class APIClient {
  constructor() {
    this.baseURL = '';
  }

  isLoggedIn() {
    return !!localStorage.getItem('token');
  }

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  async request(methodOrEndpoint, endpointOrOptions = null, body = null, requiresAuth = false) {
    let method, endpoint, fetchOptions, newStyle;

    // Detect calling convention:
    // New style: request('/api/path', { method, body, headers })  → returns full response { success, data }
    // Old style: request('GET', '/api/path', body, requiresAuth)  → returns data.data (backward compat)
    if (methodOrEndpoint.startsWith('/') || methodOrEndpoint.startsWith('http')) {
      newStyle = true;
      endpoint = methodOrEndpoint;
      const opts = endpointOrOptions || {};
      method = opts.method || 'GET';
      fetchOptions = opts;
    } else {
      newStyle = false;
      method = methodOrEndpoint;
      endpoint = endpointOrOptions;
      fetchOptions = {};
    }

    const headers = { 'Content-Type': 'application/json', ...(fetchOptions.headers || {}) };

    // Always attach token if present
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = { method, headers };

    // Handle body from both conventions
    const bodyData = fetchOptions.body || (body && ['POST', 'PUT', 'PATCH'].includes(method) ? JSON.stringify(body) : null);
    if (bodyData) options.body = bodyData;

    const response = await fetch(endpoint, options);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Error en la solicitud');
    }

    // New style returns full { success, data, ... }; old style returns data.data for backward compat
    return newStyle ? data : data.data;
  }

  async login(email, password) {
    const data = await this.request('POST', '/api/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  }

  async register(userData) {
    const data = await this.request('POST', '/api/auth/register', userData);
    localStorage.setItem('token', data.token);
    if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  }

  async getProfile() {
    return this.request('GET', '/api/auth/profile', null, true);
  }

  async updateProfile(profileData) {
    return this.request('PUT', '/api/auth/profile', profileData, true);
  }

  async testEndpoint(method, endpoint, body = null) {
    return this.request(method, endpoint, body, true);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/';
  }
}

// Global API instance
window.api = new APIClient();

// Global notification system
window.showNotification = function(message, type = 'info') {
  const typeStyles = {
    success: 'border-green-500/50 text-green-400',
    error: 'border-red-500/50 text-red-400',
    warning: 'border-yellow-500/50 text-yellow-400',
    info: 'border-cyan-500/50 text-cyan-400',
  };

  const notification = document.createElement('div');
  notification.className = `fixed top-6 right-6 z-[9999] px-5 py-3 rounded-lg border glass font-mono text-sm transition-all duration-300 max-w-sm ${typeStyles[type] || typeStyles.info}`;
  notification.style.cssText = 'backdrop-filter: blur(10px); background: rgba(5,5,5,0.9);';
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(20px)';
    setTimeout(() => notification.remove(), 300);
  }, 3500);
};
