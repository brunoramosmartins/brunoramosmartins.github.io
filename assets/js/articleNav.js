/**
 * articleNav.js — left-hand "All writing" panel for article and TIL pages.
 *
 * Fetches data/articles.json, lists every piece newest-first, links to each,
 * and highlights the current page. The panel is position:sticky (set in CSS),
 * so it stays put while the article scrolls — same behaviour as On This Page.
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

  fetch('../data/articles.json')
    .then(function (r) { return r.json(); })
    .then(function (items) {
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
        meta.textContent = formatDate(it.date) +
          (it.category === 'til' ? ' · TIL' : '');
        a.appendChild(meta);

        li.appendChild(a);
        frag.appendChild(li);
      });
      listEl.appendChild(frag);
    })
    .catch(function () { navEl.hidden = true; });
})();
