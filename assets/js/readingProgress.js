/**
 * readingProgress.js — thin progress bar that fills as the reader scrolls.
 *
 * Plain script (no modules), loaded with `defer`. Reports whole-page scroll
 * progress, which maps directly to "how much of the article is left".
 */
(function () {
  'use strict';

  var bar = document.getElementById('reading-progress');
  if (!bar) return;

  function update() {
    var doc = document.documentElement;
    var scrollable = doc.scrollHeight - doc.clientHeight;
    var pct = scrollable > 0 ? window.scrollY / scrollable : 0;
    if (pct < 0) pct = 0;
    if (pct > 1) pct = 1;
    bar.style.width = (pct * 100) + '%';
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    setTimeout(function () {
      update();
      ticking = false;
    }, 50);
  }

  document.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
})();
