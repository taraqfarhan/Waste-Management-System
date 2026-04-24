/* ═══════════════════════════════════════════
   app.js — Shared utilities for RCC WMS
   ═══════════════════════════════════════════ */

/**
 * Mark the correct nav link as active based on current page filename.
 * Call this in each page's DOMContentLoaded.
 */
function setActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === page);
  });
}

document.addEventListener('DOMContentLoaded', setActiveNav);
