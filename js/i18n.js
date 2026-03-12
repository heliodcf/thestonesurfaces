/* ============================================
   THE STONE SURFACES — i18n Engine
   ============================================ */

(function () {
  'use strict';

  const SUPPORTED_LANGS = ['en', 'es', 'fr', 'pt'];
  const DEFAULT_LANG = 'en';
  const STORAGE_KEY = 'tss-lang';

  let translations = {};
  let currentLang = DEFAULT_LANG;

  function getBasePath() {
    var scripts = document.querySelectorAll('script[src*="i18n.js"]');
    if (scripts.length > 0) {
      var src = scripts[0].getAttribute('src');
      return src.replace('js/i18n.js', 'i18n/');
    }
    var path = window.location.pathname;
    if (path.includes('/pages/')) return '../i18n/';
    return 'i18n/';
  }

  function detectLanguage() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LANGS.indexOf(stored) !== -1) return stored;
    var browserLang = (navigator.language || navigator.userLanguage || '').slice(0, 2).toLowerCase();
    if (SUPPORTED_LANGS.indexOf(browserLang) !== -1) return browserLang;
    return DEFAULT_LANG;
  }

  function getNestedValue(obj, key) {
    return key.split('.').reduce(function (o, k) {
      return o && o[k] !== undefined ? o[k] : null;
    }, obj);
  }

  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var value = getNestedValue(translations, key);
      if (value) el.textContent = value;
    });

    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-html');
      var value = getNestedValue(translations, key);
      if (value) el.innerHTML = value;
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      var value = getNestedValue(translations, key);
      if (value) el.setAttribute('placeholder', value);
    });

    document.querySelectorAll('[data-i18n-alt]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-alt');
      var value = getNestedValue(translations, key);
      if (value) el.setAttribute('alt', value);
    });

    document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-title');
      var value = getNestedValue(translations, key);
      if (value) el.setAttribute('title', value);
    });

    document.documentElement.lang = currentLang;

    var currentLabel = document.querySelector('.lang-current');
    if (currentLabel) currentLabel.textContent = currentLang.toUpperCase();

    document.querySelectorAll('.lang-option').forEach(function (opt) {
      if (opt.dataset.lang === currentLang) {
        opt.classList.add('active');
      } else {
        opt.classList.remove('active');
      }
    });

    document.querySelectorAll('.lang-selector-mobile button').forEach(function (btn) {
      if (btn.dataset.lang === currentLang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  function setLanguage(lang) {
    if (SUPPORTED_LANGS.indexOf(lang) === -1) lang = DEFAULT_LANG;
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);

    var basePath = getBasePath();
    fetch(basePath + lang + '.json')
      .then(function (response) {
        if (!response.ok) throw new Error('Failed to load ' + lang + '.json');
        return response.json();
      })
      .then(function (data) {
        translations = data;
        applyTranslations();
      })
      .catch(function (err) {
        console.error('[i18n] Error loading translations:', err);
        if (lang !== DEFAULT_LANG) {
          currentLang = DEFAULT_LANG;
          localStorage.setItem(STORAGE_KEY, DEFAULT_LANG);
          fetch(basePath + DEFAULT_LANG + '.json')
            .then(function (r) { return r.json(); })
            .then(function (data) {
              translations = data;
              applyTranslations();
            });
        }
      });
  }

  function initSelector() {
    var toggle = document.querySelector('.lang-selector-toggle');
    var dropdown = document.querySelector('.lang-dropdown');

    if (toggle && dropdown) {
      toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        dropdown.classList.toggle('active');
      });

      document.querySelectorAll('.lang-option').forEach(function (opt) {
        opt.addEventListener('click', function (e) {
          e.stopPropagation();
          setLanguage(opt.dataset.lang);
          dropdown.classList.remove('active');
        });
      });

      document.addEventListener('click', function () {
        dropdown.classList.remove('active');
      });
    }

    document.querySelectorAll('.lang-selector-mobile button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setLanguage(btn.dataset.lang);
        var mobileMenu = document.querySelector('.mobile-menu');
        var navToggle = document.querySelector('.nav-toggle');
        if (mobileMenu) mobileMenu.classList.remove('active');
        if (navToggle) navToggle.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  function init() {
    initSelector();
    var lang = detectLanguage();
    setLanguage(lang);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.TSS_i18n = { setLanguage: setLanguage, getCurrentLang: function () { return currentLang; } };
})();
