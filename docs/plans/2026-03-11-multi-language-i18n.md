# Multi-Language (EN/ES/PT) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a complete multi-language system (English, Spanish, Portuguese) to The Stone Surfaces static website with auto-detection, localStorage persistence, and a premium language selector UI.

**Architecture:** Client-side i18n using `data-i18n` HTML attributes + JSON translation files loaded via fetch. A single `js/i18n.js` engine handles language detection, text swapping, and persistence. Language selector lives in the header nav on all pages.

**Tech Stack:** Vanilla JavaScript (no libraries), JSON translation files, CSS for selector styling.

---

## Task 1: Create the i18n Engine (`js/i18n.js`)

**Files:**
- Create: `js/i18n.js`

**Step 1: Write the i18n engine**

```javascript
/* ============================================
   THE STONE SURFACES — i18n Engine
   ============================================ */

(function () {
  'use strict';

  const SUPPORTED_LANGS = ['en', 'es', 'pt'];
  const DEFAULT_LANG = 'en';
  const STORAGE_KEY = 'tss-lang';

  let translations = {};
  let currentLang = DEFAULT_LANG;

  // Determine base path for JSON files (handles root vs /pages/ subdir)
  function getBasePath() {
    const path = window.location.pathname;
    if (path.includes('/pages/')) {
      return '../i18n/';
    }
    return 'i18n/';
  }

  // Detect preferred language from browser
  function detectLanguage() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LANGS.includes(stored)) return stored;

    const browserLang = (navigator.language || navigator.userLanguage || '').slice(0, 2).toLowerCase();
    if (SUPPORTED_LANGS.includes(browserLang)) return browserLang;

    return DEFAULT_LANG;
  }

  // Get nested value from object by dot-notation key
  function getNestedValue(obj, key) {
    return key.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : null), obj);
  }

  // Apply translations to all elements with data-i18n attributes
  function applyTranslations() {
    // data-i18n → textContent
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const value = getNestedValue(translations, key);
      if (value) el.textContent = value;
    });

    // data-i18n-html → innerHTML
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      const value = getNestedValue(translations, key);
      if (value) el.innerHTML = value;
    });

    // data-i18n-placeholder → placeholder attribute
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const value = getNestedValue(translations, key);
      if (value) el.setAttribute('placeholder', value);
    });

    // data-i18n-alt → alt attribute
    document.querySelectorAll('[data-i18n-alt]').forEach(el => {
      const key = el.getAttribute('data-i18n-alt');
      const value = getNestedValue(translations, key);
      if (value) el.setAttribute('alt', value);
    });

    // data-i18n-title → title attribute (for iframe titles, etc.)
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      const value = getNestedValue(translations, key);
      if (value) el.setAttribute('title', value);
    });

    // Update html lang attribute
    document.documentElement.lang = currentLang;

    // Update selector display
    const currentLabel = document.querySelector('.lang-current');
    if (currentLabel) currentLabel.textContent = currentLang.toUpperCase();

    // Update active state in dropdown
    document.querySelectorAll('.lang-option').forEach(opt => {
      opt.classList.toggle('active', opt.dataset.lang === currentLang);
    });
  }

  // Load translation file and apply
  async function setLanguage(lang) {
    if (!SUPPORTED_LANGS.includes(lang)) lang = DEFAULT_LANG;
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);

    try {
      const basePath = getBasePath();
      const response = await fetch(basePath + lang + '.json');
      if (!response.ok) throw new Error('Failed to load ' + lang + '.json');
      translations = await response.json();
      applyTranslations();
    } catch (err) {
      console.error('[i18n] Error loading translations:', err);
      // Fallback: if not English, try loading English
      if (lang !== DEFAULT_LANG) {
        currentLang = DEFAULT_LANG;
        localStorage.setItem(STORAGE_KEY, DEFAULT_LANG);
        const basePath = getBasePath();
        const response = await fetch(basePath + DEFAULT_LANG + '.json');
        translations = await response.json();
        applyTranslations();
      }
    }
  }

  // Initialize language selector behavior
  function initSelector() {
    const toggle = document.querySelector('.lang-selector-toggle');
    const dropdown = document.querySelector('.lang-dropdown');

    if (!toggle || !dropdown) return;

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('active');
    });

    document.querySelectorAll('.lang-option').forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const lang = opt.dataset.lang;
        setLanguage(lang);
        dropdown.classList.remove('active');
      });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
      dropdown.classList.remove('active');
    });
  }

  // Boot
  function init() {
    initSelector();
    const lang = detectLanguage();
    setLanguage(lang);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for manual language switching if needed
  window.TSS_i18n = { setLanguage, getCurrentLang: () => currentLang };
})();
```

**Step 2: Verify file was created**

Run: `cat js/i18n.js | head -5`
Expected: Shows the file header comment.

---

## Task 2: Add Language Selector CSS to `css/styles.css`

**Files:**
- Modify: `css/styles.css` (append at end, before any media queries for the selector)

**Step 1: Add language selector styles**

Append these styles to `css/styles.css`:

```css
/* --- Language Selector --- */
.lang-selector {
  position: relative;
  margin-right: 16px;
}

.lang-selector-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 6px 10px;
  border: 1px solid var(--color-border-dark);
  border-radius: var(--radius-button);
  transition: border-color var(--transition-default), background var(--transition-default);
  background: transparent;
  color: var(--color-text-light);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.05em;
}

.lang-selector-toggle:hover {
  border-color: var(--color-accent-gold);
  background: rgba(196, 163, 90, 0.08);
}

.lang-selector-toggle svg {
  width: 16px;
  height: 16px;
  opacity: 0.7;
}

.lang-current {
  min-width: 20px;
  text-align: center;
}

.lang-chevron {
  width: 10px;
  height: 10px;
  opacity: 0.5;
  transition: transform var(--transition-default);
}

.lang-dropdown.active + .lang-selector-toggle .lang-chevron,
.lang-dropdown.active ~ .lang-selector-toggle .lang-chevron {
  transform: rotate(180deg);
}

.lang-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 160px;
  background: #1A1A1A;
  border: 1px solid var(--color-border-dark);
  border-radius: var(--radius-button);
  padding: 4px 0;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-8px);
  transition: opacity var(--transition-default), transform var(--transition-default), visibility var(--transition-default);
  z-index: 1001;
  box-shadow: 0 12px 40px rgba(0,0,0,0.5);
}

.lang-dropdown.active {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.lang-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background var(--transition-default);
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--color-text-light);
}

.lang-option:hover {
  background: rgba(196, 163, 90, 0.1);
}

.lang-option.active {
  color: var(--color-accent-gold);
}

.lang-option.active::after {
  content: '✓';
  margin-left: auto;
  font-size: 12px;
  color: var(--color-accent-gold);
}

.lang-option-label {
  font-weight: 400;
}

.lang-option-code {
  font-size: 11px;
  opacity: 0.5;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Mobile: language selector in mobile menu */
.mobile-menu .lang-selector-mobile {
  display: flex;
  gap: 12px;
  padding: 24px 0;
  justify-content: center;
  border-top: 1px solid var(--color-border-dark);
  margin-top: 16px;
}

.mobile-menu .lang-selector-mobile button {
  padding: 8px 16px;
  border: 1px solid var(--color-border-dark);
  border-radius: var(--radius-button);
  color: var(--color-text-light);
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-default);
  background: transparent;
}

.mobile-menu .lang-selector-mobile button:hover,
.mobile-menu .lang-selector-mobile button.active {
  border-color: var(--color-accent-gold);
  color: var(--color-accent-gold);
  background: rgba(196, 163, 90, 0.08);
}

@media (max-width: 768px) {
  .lang-selector {
    display: none;
  }
}
```

---

## Task 3: Add Language Selector HTML to Header (All Pages)

**Files:**
- Modify: `index.html` (header section)
- Modify: `pages/products.html` (header section)
- Modify: `pages/hanstone.html` (header section)
- Modify: `pages/lucciare.html` (header section)
- Modify: `pages/inspired.html` (header section)
- Modify: `pages/blog.html` (header section)
- Modify: `pages/about.html` (header section)
- Modify: `pages/contact.html` (header section)
- Modify: `pages/product-detail.html` (header section)
- Modify: `pages/trade.html` (header section)

**Step 1: Add language selector to `header-right` div**

In every page, find `<div class="header-right">` and insert the language selector BEFORE the CTA button:

```html
<div class="header-right">
  <!-- Language Selector -->
  <div class="lang-selector">
    <button class="lang-selector-toggle" aria-label="Select language">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
      <span class="lang-current">EN</span>
      <svg class="lang-chevron" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 1l4 4 4-4"/></svg>
    </button>
    <div class="lang-dropdown">
      <div class="lang-option active" data-lang="en">
        <span class="lang-option-label">English</span>
        <span class="lang-option-code">EN</span>
      </div>
      <div class="lang-option" data-lang="es">
        <span class="lang-option-label">Español</span>
        <span class="lang-option-code">ES</span>
      </div>
      <div class="lang-option" data-lang="pt">
        <span class="lang-option-label">Português</span>
        <span class="lang-option-code">PT</span>
      </div>
    </div>
  </div>
  <!-- End Language Selector -->
  <a href="..." class="btn btn--primary" data-i18n="nav.cta">Request a Quote</a>
  ...
</div>
```

**Step 2: Add mobile language selector to mobile menu**

In every page, add at the bottom of `.mobile-menu` div:

```html
<div class="lang-selector-mobile">
  <button data-lang="en" class="active">EN</button>
  <button data-lang="es">ES</button>
  <button data-lang="pt">PT</button>
</div>
```

**Step 3: Add `<script src="js/i18n.js">` to all pages**

In `index.html`, add BEFORE `main.js`:
```html
<script src="js/i18n.js"></script>
<script src="js/main.js"></script>
```

In all `pages/*.html`, add BEFORE `main.js`:
```html
<script src="../js/i18n.js"></script>
<script src="../js/main.js"></script>
```

**Step 4: Update `main.js` form handler for i18n**

In `main.js`, update the form submit handler to use translated text:

```javascript
// In the form handling section, change:
submitBtn.textContent = 'Sent! We\'ll be in touch.';
// To:
const sentText = document.querySelector('[data-i18n="form.sent"]');
submitBtn.textContent = sentText ? sentText.textContent : 'Sent! We\'ll be in touch.';
```

Actually, simpler approach — add a `data-i18n-sent` attribute to submit buttons and read it:

```javascript
const sentMsg = submitBtn.dataset.i18nSent || 'Sent! We\'ll be in touch.';
submitBtn.textContent = sentMsg;
```

---

## Task 4: Create English Translation File (`i18n/en.json`)

**Files:**
- Create: `i18n/en.json`

This is the source of truth. Extract ALL text strings from all 10 HTML pages into a structured JSON with dot-notation keys organized by section.

**Key naming convention:**
```
nav.*           — Navigation items (shared across all pages)
footer.*        — Footer content (shared across all pages)
home.*          — Homepage sections
products.*      — Products page
hanstone.*      — Hanstone page
lucciare.*      — Lucciare page
inspired.*      — Get Inspired page
blog.*          — Blog page
about.*         — About page
contact.*       — Contact page
trade.*         — Trade page
detail.*        — Product Detail page
chat.*          — Chat widget
common.*        — Shared UI elements (buttons, labels)
```

**Process:** Read each HTML file, extract every user-visible text string, assign a key, add to JSON.

**DO NOT translate:** Product names (Calacatta Gold, etc.), brand names (Hanstone, Lucciare, Hyundai L&C), addresses, phone numbers, email addresses, URLs.

---

## Task 5: Create Spanish Translation File (`i18n/es.json`)

**Files:**
- Create: `i18n/es.json`

Translate ALL keys from `en.json` to Spanish. Use professional, luxury-brand Spanish (not colloquial). Match the tone: professional yet warm, approachable luxury.

---

## Task 6: Create Portuguese Translation File (`i18n/pt.json`)

**Files:**
- Create: `i18n/pt.json`

Translate ALL keys from `en.json` to Brazilian Portuguese (PT-BR). Same premium tone.

---

## Task 7: Add `data-i18n` Attributes to `index.html`

**Files:**
- Modify: `index.html`

Add `data-i18n` attributes to every translatable text element. Example pattern:

```html
<!-- Before -->
<span class="label">SOUTH FLORIDA'S PREMIER STONE DISTRIBUTOR</span>
<h1>Where Natural Beauty Meets Precision Engineering</h1>

<!-- After -->
<span class="label" data-i18n="home.hero.label">SOUTH FLORIDA'S PREMIER STONE DISTRIBUTOR</span>
<h1 data-i18n="home.hero.title">Where Natural Beauty Meets Precision Engineering</h1>
```

Cover ALL sections: hero, hanstone spotlight, lucciare spotlight, collections, trust pillars, get inspired, testimonials, blog preview, locations, newsletter, footer, mobile menu, chat widget, mobile tab bar.

---

## Task 8: Add `data-i18n` Attributes to `pages/products.html`

**Files:**
- Modify: `pages/products.html`

Same pattern as Task 7. Cover: breadcrumb, page hero, filter sidebar (all filter labels, options), product cards (descriptions, CTAs), comparison bar, footer.

---

## Task 9: Add `data-i18n` Attributes to `pages/hanstone.html`

**Files:**
- Modify: `pages/hanstone.html`

Cover: brand hero, brand story, collections browser, color palette explorer, benefits, professional resources, CTA section, footer.

---

## Task 10: Add `data-i18n` Attributes to `pages/lucciare.html`

**Files:**
- Modify: `pages/lucciare.html`

Same pattern. Cover all Lucciare-specific content sections + shared nav/footer.

---

## Task 11: Add `data-i18n` Attributes to `pages/inspired.html`

**Files:**
- Modify: `pages/inspired.html`

Cover: hero, filter bar labels, gallery overlays (room types, material names), before/after section, submit project form, footer.

---

## Task 12: Add `data-i18n` Attributes to `pages/blog.html`

**Files:**
- Modify: `pages/blog.html`

Cover: featured post, category tabs, post cards (titles, excerpts, meta), sidebar sections, footer.

---

## Task 13: Add `data-i18n` Attributes to `pages/about.html`

**Files:**
- Modify: `pages/about.html`

Cover: page hero, timeline milestones, mission & values, team bios, showroom section, footer.

---

## Task 14: Add `data-i18n` Attributes to `pages/contact.html`

**Files:**
- Modify: `pages/contact.html`

Cover: form labels, placeholders, submit button, contact info panel, business hours, footer.

---

## Task 15: Add `data-i18n` Attributes to `pages/product-detail.html`

**Files:**
- Modify: `pages/product-detail.html`

Cover: breadcrumb, product info labels, CTA buttons, specs accordion labels, related products section, footer.

---

## Task 16: Add `data-i18n` Attributes to `pages/trade.html`

**Files:**
- Modify: `pages/trade.html`

Cover: hero, trade benefits, application form labels, resources section, promotions, trade rep contact, footer.

---

## Task 17: Wire Mobile Language Selector in `main.js`

**Files:**
- Modify: `js/main.js`

Add event listeners for mobile language buttons:

```javascript
// --- Mobile Language Selector ---
document.querySelectorAll('.lang-selector-mobile button').forEach(btn => {
  btn.addEventListener('click', () => {
    const lang = btn.dataset.lang;
    if (window.TSS_i18n) {
      window.TSS_i18n.setLanguage(lang);
      document.querySelectorAll('.lang-selector-mobile button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // Close mobile menu after selection
      const mobileMenu = document.querySelector('.mobile-menu');
      const navToggle = document.querySelector('.nav-toggle');
      if (mobileMenu) mobileMenu.classList.remove('active');
      if (navToggle) navToggle.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
});
```

---

## Task 18: Test & Verify

**Step 1:** Open `index.html` in browser, verify language selector appears in header.
**Step 2:** Click selector, switch to ES — verify ALL text changes to Spanish.
**Step 3:** Switch to PT — verify ALL text changes to Portuguese.
**Step 4:** Refresh page — verify language persists (localStorage).
**Step 5:** Navigate to each inner page — verify language persists across pages.
**Step 6:** Test mobile view — verify mobile language selector works.
**Step 7:** Verify brand names, product names, addresses remain unchanged.

---

## Execution Notes

- Tasks 4-6 (translation files) and Tasks 7-16 (data-i18n attributes) are tightly coupled — the JSON keys must match the data-i18n attributes exactly.
- Best approach: do one page at a time — add data-i18n attributes AND add corresponding keys to all 3 JSON files simultaneously.
- The nav and footer HTML repeat across all pages — extract nav/footer keys once, apply to all pages.
- Total estimated strings: ~800-1000 translatable strings across all pages.
