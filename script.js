(function () {
  'use strict';

  // Utility helpers
  const qs = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => Array.from((ctx || document).querySelectorAll(sel));
  const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

  // THEME TOGGLE
  function initThemeToggle(options = {}) {
    const btn = qs('#themeToggle') || qs('#themeToggle3');
    if (!btn) return;

    const body = document.body;
    const storageKey = options.storageKey || 'site-theme';
    const darkClass = options.darkClass || 'theme-dark';
    const lightClass = options.lightClass || 'theme-light';

    // Ensure body has a baseline class
    if (!body.classList.contains(darkClass) && !body.classList.contains(lightClass)) {
      body.classList.add(lightClass);
    }

    // Apply saved preference
    const saved = localStorage.getItem(storageKey);
    if (saved === 'dark') {
      body.classList.add(darkClass);
      body.classList.remove(lightClass);
      btn.textContent = '☀️';
      btn.setAttribute('aria-pressed', 'true');
    } else {
      body.classList.remove(darkClass);
      body.classList.add(lightClass);
      btn.textContent = '🌙';
      btn.setAttribute('aria-pressed', 'false');
    }

    // Toggle handler
    on(btn, 'click', () => {
      const isDark = body.classList.toggle(darkClass);
      if (isDark) body.classList.remove(lightClass);
      else body.classList.add(lightClass);

      btn.textContent = isDark ? '☀️' : '🌙';
      btn.setAttribute('aria-pressed', String(isDark));
      localStorage.setItem(storageKey, isDark ? 'dark' : 'light');
    });

    // Keyboard support (Enter/Space)
    on(btn, 'keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  }

  // RESPONSIVE NAV TOGGLE
  function initNavToggle() {
    const navToggle = qs('#navToggle');
    const mainNav = qs('#mainNav') || qs('.main-nav');

    if (!navToggle || !mainNav) return;

    // Ensure ARIA attributes exist
    navToggle.setAttribute('aria-controls', mainNav.id || 'mainNav');
    if (!mainNav.id) mainNav.id = 'mainNav';

    // Start closed if hidden attribute not present
    if (!mainNav.hasAttribute('hidden')) {
      mainNav.setAttribute('hidden', '');
      navToggle.setAttribute('aria-expanded', 'false');
    }

    on(navToggle, 'click', () => {
      const isOpen = mainNav.hasAttribute('hidden') === false;
      if (isOpen) {
        mainNav.setAttribute('hidden', '');
        navToggle.setAttribute('aria-expanded', 'false');
      } else {
        mainNav.removeAttribute('hidden');
        navToggle.setAttribute('aria-expanded', 'true');
      }
    });

    // Close nav when focus leaves (optional improvement)
    document.addEventListener('click', (e) => {
      if (!mainNav.contains(e.target) && !navToggle.contains(e.target)) {
        mainNav.setAttribute('hidden', '');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ACCORDION / COLLAPSIBLE SECTIONS
  function initAccordions() {
    const accordions = qsa('.accordion');
    if (!accordions.length) return;

    accordions.forEach((btn) => {
      const panelId = btn.getAttribute('aria-controls');
      const panel = panelId ? qs(`#${panelId}`) : btn.nextElementSibling;

      if (!panel) return;

      // Initialize state
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      if (!expanded) panel.setAttribute('hidden', '');
      else panel.removeAttribute('hidden');

      on(btn, 'click', () => {
        const isExpanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!isExpanded));
        if (isExpanded) panel.setAttribute('hidden', '');
        else panel.removeAttribute('hidden');
      });

      on(btn, 'keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
        }
      });
    });
  }

  // SIMPLE FORM HANDLER (client-side validation + fetch stub)
  function initFormHandler() {
    const form = qs('form#contactForm') || qs('form[data-ajax="true"]');
    if (!form) return;

    // Prevent default HTML validation UI if you want custom messages
    form.setAttribute('novalidate', '');

    on(form, 'submit', (e) => {
      e.preventDefault();

      // Use built-in validity first
      if (!form.checkValidity()) {
        // Show browser-native messages
        form.reportValidity();
        return;
      }

      // Collect form data
      const data = new FormData(form);
      // Convert to JSON example (optional)
      const payload = {};
      for (const [k, v] of data.entries()) payload[k] = v;

      // Replace URL with your endpoint
      const endpoint = form.getAttribute('action') || '/submit';

      // Basic UI feedback
      const submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        // Send request (example using fetch)
        fetch(endpoint, {
          method: form.method || 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
          .then((res) => {
            if (!res.ok) throw new Error('Network response was not ok');
            // Success handling
            form.reset();
            alert('Message sent. Thank you!');
          })
          .catch((err) => {
            console.error(err);
            alert('There was a problem sending your message. Please try again later.');
          })
          .finally(() => {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = originalText;
            }
          });
      } else {
        // If no submit button, just log payload
        console.log('Form payload:', payload);
      }
    });
  }

  // Initialize everything on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initNavToggle();
    initAccordions();
    initFormHandler();

    // Optional: keyboard shortcut to toggle theme (Shift+T)
    document.addEventListener('keydown', (e) => {
      if (e.shiftKey && e.key.toLowerCase() === 't') {
        const btn = qs('#themeToggle') || qs('#themeToggle3');
        if (btn) btn.click();
      }
    });
  });
})();

