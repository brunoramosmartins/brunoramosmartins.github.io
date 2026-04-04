/**
 * ============================================================
 * Navigation Controller
 * Academic ML Engineering Portfolio
 *
 * Handles responsive navigation toggle behavior.
 * Keeps presentation (HTML) separated from interaction logic.
 * ============================================================
 */

(function () {
  "use strict";

  const navToggle = document.querySelector(".nav-toggle");
  const siteNav   = document.querySelector(".site-nav");

  // Defensive guard: avoid runtime errors if elements are missing
  if (!navToggle || !siteNav) return;

  /**
   * Toggles mobile navigation state
   * - Updates CSS classes
   * - Synchronizes aria-expanded for accessibility
   */
  const toggleNavigation = () => {
    const isOpen = siteNav.classList.toggle("is-open");

    navToggle.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  };

  navToggle.addEventListener("click", toggleNavigation);

  // Close mobile nav when a link is clicked
  siteNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('is-open');
      navToggle.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
})();