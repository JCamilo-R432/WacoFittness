/**
 * WacoPro i18n Locale Loader
 * Loads translation JSON files and provides a t() helper
 * Integrates with WacoI18n from app-init.js
 */
(async function () {
  'use strict';

  const SUPPORTED = ['es', 'en', 'pt'];
  const _cache = {};

  async function loadLocale(lang) {
    if (_cache[lang]) return _cache[lang];
    try {
      const res = await fetch(`/locales/${lang}.json`);
      if (!res.ok) throw new Error('load failed');
      _cache[lang] = await res.json();
      return _cache[lang];
    } catch (_) {
      if (lang !== 'es') return loadLocale('es');
      return {};
    }
  }

  function getKey(obj, path) {
    return path.split('.').reduce((o, k) => o && o[k], obj) ?? path;
  }

  const WacoLocales = {
    _data: {},
    _lang: 'es',

    async init(lang) {
      const l = SUPPORTED.includes(lang) ? lang : 'es';
      this._lang = l;
      this._data = await loadLocale(l);
      document.documentElement.lang = l;
      window.dispatchEvent(new CustomEvent('wacopro:locale-loaded', { detail: { lang: l } }));
    },

    t(key, vars) {
      let str = getKey(this._data, key);
      if (typeof str !== 'string') return key;
      if (vars) Object.entries(vars).forEach(([k, v]) => { str = str.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), v); });
      return str;
    },

    get lang() { return this._lang; }
  };

  window.WacoLocales = WacoLocales;

  // Upgrade WacoI18n to use full locale files once loaded
  const savedLang = localStorage.getItem('wacopro_language') || navigator.language?.slice(0, 2) || 'es';
  const lang = SUPPORTED.includes(savedLang) ? savedLang : 'es';
  await WacoLocales.init(lang);

  // Upgrade WacoI18n.t() to use the full locale data
  if (window.WacoI18n) {
    const origT = window.WacoI18n.t.bind(window.WacoI18n);
    window.WacoI18n.t = (key, vars) => {
      const full = WacoLocales.t(key, vars);
      return full !== key ? full : origT(key, vars);
    };
  }
})();
