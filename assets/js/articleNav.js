/**
 * articleNav.js — left-hand navigator for article and TIL pages.
 *
 * Fetches data/articles.json and lists sibling pieces newest-first, linking to
 * each and highlighting the current page. The list is scoped to the page type:
 * on an article page it shows only articles, on a TIL page only TILs — a reader
 * inside Articles never sees TILs in the rail, and vice-versa. The panel is
 * position:sticky (set in CSS), so it stays put while the page scrolls.
 *
 * Plain script (no modules), loaded with `defer`.
 */
(function () {
  'use strict';

  var listEl = document.getElementById('article-nav-list');
  var navEl = document.querySelector('.article-nav');
  if (!listEl || !navEl) return;

  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function formatDate(d) {
    if (!d) return '';
    var p = d.split('-');
    var m = MONTHS[parseInt(p[1], 10) - 1] || '';
    return (m + ' ' + p[0]).trim();
  }

  var here = location.pathname; // e.g. /posts/foo.html or /til/bar.html
  var onTil = /\/til\//.test(here);

  // Retitle the rail to match the scope, since it no longer lists everything.
  var titleEl = navEl.querySelector('.article-nav__title');
  if (titleEl) titleEl.textContent = onTil ? 'All TILs' : 'All articles';

  fetch('../data/articles.json')
    .then(function (r) { return r.json(); })
    .then(function (items) {
      items = items.filter(function (it) {
        return (it.category === 'til') === onTil;
      });
      items.sort(function (a, b) {
        return (b.date || '').localeCompare(a.date || '');
      });

      var frag = document.createDocumentFragment();
      items.forEach(function (it) {
        var li = document.createElement('li');
        li.className = 'article-nav__item';

        var a = document.createElement('a');
        a.className = 'article-nav__link';
        a.href = '..' + it.url;               // /posts/x.html -> ../posts/x.html
        a.appendChild(document.createTextNode(it.title));

        if (here.slice(-it.url.length) === it.url) {
          a.classList.add('active');
          a.setAttribute('aria-current', 'page');
        }

        var meta = document.createElement('span');
        meta.className = 'article-nav__meta';
        meta.textContent = formatDate(it.date);
        a.appendChild(meta);

        li.appendChild(a);
        frag.appendChild(li);
      });
      listEl.appendChild(frag);
    })
    .catch(function () { navEl.hidden = true; });
})();
