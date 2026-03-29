/**
 * WacoPro Fitness — App Initialization
 * Handles: Service Worker, Theme, Language, Offline indicator, Analytics
 */
(function () {
  'use strict';

  // ── Service Worker Registration ──────────────────────────────────────────
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then((reg) => {
          console.log('[WacoPro] Service Worker registered:', reg.scope);
          // Check for updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            newWorker?.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                showUpdateNotification();
              }
            });
          });
        })
        .catch((err) => console.warn('[WacoPro] SW registration failed:', err));
    });
  }

  // ── Theme System ─────────────────────────────────────────────────────────
  const THEME_KEY = 'wacopro_theme';
  const themes = { dark: 'dark', light: 'light', auto: 'auto' };

  function applyTheme(theme) {
    const root = document.documentElement;
    let actual = theme;
    if (theme === 'auto') {
      actual = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    root.setAttribute('data-theme', actual);
    root.classList.toggle('theme-light', actual === 'light');
    root.classList.toggle('theme-dark', actual === 'dark');
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY) || 'dark';
    applyTheme(saved);
    // Listen for system changes when auto
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if ((localStorage.getItem(THEME_KEY) || 'dark') === 'auto') applyTheme('auto');
    });
  }

  window.WacoTheme = {
    set: (theme) => {
      localStorage.setItem(THEME_KEY, theme);
      applyTheme(theme);
      // Sync with backend
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        fetch('/api/settings/theme', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ theme }),
        }).catch(() => {});
      }
    },
    get: () => localStorage.getItem(THEME_KEY) || 'dark',
  };

  // ── Language System ───────────────────────────────────────────────────────
  const LANG_KEY = 'wacopro_language';

  const translations = {
    es: {
      dashboard: 'Dashboard', training: 'Entrenamiento', nutrition: 'Nutrición',
      recovery: 'Recuperación', settings: 'Ajustes', logout: 'Salir',
      save: 'Guardar', cancel: 'Cancelar', delete: 'Eliminar', edit: 'Editar',
      loading: 'Cargando...', error: 'Error', success: 'Éxito',
      offline: 'Sin conexión — trabajando en modo offline',
      online: 'Conexión restaurada',
    },
    en: {
      dashboard: 'Dashboard', training: 'Training', nutrition: 'Nutrition',
      recovery: 'Recovery', settings: 'Settings', logout: 'Logout',
      save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit',
      loading: 'Loading...', error: 'Error', success: 'Success',
      offline: 'Offline — working in offline mode',
      online: 'Connection restored',
    },
    pt: {
      dashboard: 'Painel', training: 'Treinamento', nutrition: 'Nutrição',
      recovery: 'Recuperação', settings: 'Configurações', logout: 'Sair',
      save: 'Salvar', cancel: 'Cancelar', delete: 'Excluir', edit: 'Editar',
      loading: 'Carregando...', error: 'Erro', success: 'Sucesso',
      offline: 'Sem conexão — trabalhando no modo offline',
      online: 'Conexão restaurada',
    },
  };

  window.WacoI18n = {
    t: (key) => {
      const lang = localStorage.getItem(LANG_KEY) || 'es';
      return (translations[lang] || translations.es)[key] || key;
    },
    setLang: (lang) => {
      if (!translations[lang]) return;
      localStorage.setItem(LANG_KEY, lang);
      document.documentElement.lang = lang;
      // Sync with backend
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        fetch('/api/settings/language', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ language: lang }),
        }).catch(() => {});
      }
      // Reload to apply translations
      window.location.reload();
    },
    getLang: () => localStorage.getItem(LANG_KEY) || 'es',
  };

  // ── Offline Indicator ─────────────────────────────────────────────────────
  function createOfflineIndicator() {
    const el = document.createElement('div');
    el.id = 'offline-indicator';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.style.cssText = `
      position: fixed; bottom: 1rem; left: 50%; transform: translateX(-50%) translateY(100px);
      background: rgba(255,107,107,0.95); color: #fff; padding: .6rem 1.4rem;
      border-radius: 999px; font-size: .85rem; font-weight: 700; z-index: 9999;
      transition: transform .3s ease; pointer-events: none;
      display: flex; align-items: center; gap: .5rem;
      box-shadow: 0 4px 20px rgba(0,0,0,.4);
    `;
    el.innerHTML = '📡 Sin conexión — Modo Offline';
    document.body.appendChild(el);
    return el;
  }

  function updateOfflineIndicator(isOffline) {
    let el = document.getElementById('offline-indicator');
    if (!el) el = createOfflineIndicator();
    if (isOffline) {
      el.innerHTML = '📡 Sin conexión — Modo Offline';
      el.style.background = 'rgba(255,107,107,0.95)';
      el.style.transform = 'translateX(-50%) translateY(0)';
    } else {
      el.innerHTML = '✅ Conexión restaurada';
      el.style.background = 'rgba(0,217,166,0.95)';
      el.style.transform = 'translateX(-50%) translateY(0)';
      setTimeout(() => { el.style.transform = 'translateX(-50%) translateY(100px)'; }, 3000);
    }
  }

  window.addEventListener('offline', () => updateOfflineIndicator(true));
  window.addEventListener('online', () => updateOfflineIndicator(false));
  if (!navigator.onLine) updateOfflineIndicator(true);

  // ── Update Notification ───────────────────────────────────────────────────
  function showUpdateNotification() {
    const el = document.createElement('div');
    el.style.cssText = `
      position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 9999;
      background: rgba(18,18,42,.98); border: 1px solid rgba(108,99,255,.4);
      border-radius: 14px; padding: 1rem 1.25rem; max-width: 320px;
      box-shadow: 0 8px 30px rgba(0,0,0,.5);
    `;
    el.innerHTML = `
      <p style="font-size:.88rem;font-weight:700;color:#e2e8f0;margin-bottom:.4rem;">🚀 Nueva versión disponible</p>
      <p style="font-size:.78rem;color:#718096;margin-bottom:.8rem;">Recarga para obtener las últimas mejoras.</p>
      <button onclick="window.location.reload()" style="background:linear-gradient(135deg,#6c63ff,#00d9a6);border:none;color:#fff;padding:.4rem 1rem;border-radius:8px;font-size:.8rem;font-weight:700;cursor:pointer;margin-right:.5rem;">Actualizar</button>
      <button onclick="this.parentElement.remove()" style="background:transparent;border:1px solid rgba(255,255,255,.15);color:#718096;padding:.4rem .8rem;border-radius:8px;font-size:.8rem;cursor:pointer;">Ahora no</button>
    `;
    document.body.appendChild(el);
  }

  // ── WCAG: Skip to Content ─────────────────────────────────────────────────
  function addSkipLink() {
    if (document.getElementById('skip-link')) return;
    const skip = document.createElement('a');
    skip.id = 'skip-link';
    skip.href = '#main-content';
    skip.textContent = 'Saltar al contenido principal';
    skip.style.cssText = `
      position: absolute; left: -9999px; top: 1rem; z-index: 99999;
      background: #6c63ff; color: #fff; padding: .6rem 1.2rem;
      border-radius: 8px; font-size: .9rem; font-weight: 700;
      text-decoration: none; transition: left .1s;
    `;
    skip.addEventListener('focus', () => { skip.style.left = '1rem'; });
    skip.addEventListener('blur', () => { skip.style.left = '-9999px'; });
    document.body.prepend(skip);
  }

  // ── Light Theme CSS Variables ─────────────────────────────────────────────
  function injectLightThemeCSS() {
    if (document.getElementById('light-theme-vars')) return;
    const style = document.createElement('style');
    style.id = 'light-theme-vars';
    style.textContent = `
      [data-theme="light"] {
        --bg: #f0f0fa;
        --surface: #ffffff;
        --surface2: #eeeef8;
        --text: #1a1a2e;
        --muted: #6c757d;
        --border: rgba(108,99,255,0.2);
      }
      [data-theme="light"] body {
        background: var(--bg) !important;
        color: var(--text) !important;
      }
      [data-theme="light"] nav {
        background: rgba(240,240,250,.98) !important;
        border-bottom-color: rgba(108,99,255,.2) !important;
      }
      [data-theme="light"] .dash-sidebar .sidebar-card,
      [data-theme="light"] .dash-card,
      [data-theme="light"] .stat-card {
        background: #ffffff !important;
        border-color: rgba(108,99,255,.15) !important;
      }
      [data-theme="light"] input,
      [data-theme="light"] select,
      [data-theme="light"] textarea {
        background: #f8f8ff !important;
        color: #1a1a2e !important;
        border-color: rgba(108,99,255,.2) !important;
      }
    `;
    document.head.appendChild(style);
  }

  // ── Reduced Motion ────────────────────────────────────────────────────────
  function applyReducedMotion() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const style = document.createElement('style');
      style.textContent = '*, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }';
      document.head.appendChild(style);
    }
  }

  // ── Offline DB + Locale Loader ────────────────────────────────────────────
  function loadScript(src, id) {
    if (document.getElementById(id)) return Promise.resolve();
    return new Promise((resolve) => {
      const s = document.createElement('script');
      s.id = id;
      s.src = src;
      s.onload = resolve;
      s.onerror = resolve; // fail silently
      document.head.appendChild(s);
    });
  }

  // ── Initialize ────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    injectLightThemeCSS();
    applyReducedMotion();
    addSkipLink();
    // Set lang attribute
    document.documentElement.lang = localStorage.getItem(LANG_KEY) || 'es';
    // Load offline DB (non-blocking)
    loadScript('/js/offline-db.js', 'wacopro-offline-db').catch(() => {});
    // Load full locale system (non-blocking)
    loadScript('/locales/index.js', 'wacopro-locales').catch(() => {});
  });

  // Apply theme immediately to prevent flash
  initTheme();
  injectLightThemeCSS();

})();
