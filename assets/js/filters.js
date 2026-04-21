/**
 * filters.js
 * Responsible for client-side filtering logic.
 * Operates on the JSON dataset — no page reload required.
 */

/**
 * Filters a list of projects by a given tag.
 * Matches against both `tags` and `stack` arrays.
 *
 * @param {Array}  projectList - Full list of project objects.
 * @param {string} tag         - Tag to filter by. 'all' returns the full list.
 * @returns {Array}
 */
export function filterProjectsByTag(projectList, tag) {
  if (!tag || tag === 'all') return projectList;
  const normalised = tag.toLowerCase();
  return projectList.filter(project => {
    const combined = [
      ...(project.tags  || []),
      ...(project.stack || []),
    ].map(t => t.toLowerCase());
    return combined.includes(normalised);
  });
}

/**
 * Filters a list of articles by category.
 *
 * @param {Array}  articleList - Full list of article objects.
 * @param {string} category    - Category to filter by. 'all' returns full list.
 * @returns {Array}
 */
export function filterArticlesByCategory(articleList, category) {
  if (!category || category === 'all') return articleList;
  return articleList.filter(a => a.category === category);
}

/**
 * Builds filter buttons dynamically from article categories.
 * Always includes an "All" button first.
 *
 * @param {HTMLElement} filterBar  - Container element for filter buttons.
 * @param {Array}       articles  - Full list of article objects with .category.
 */
export function buildCategoryButtons(filterBar, articles) {
  if (!filterBar) return;

  const categories = [...new Set(
    articles.map(a => a.category).filter(Boolean)
  )].sort();

  const formatLabel = (cat) =>
    cat.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  let html = '<button class="tag tag--active" data-filter="all" type="button">All</button>';
  for (const cat of categories) {
    html += `<button class="tag" data-filter="${cat}" type="button">${formatLabel(cat)}</button>`;
  }
  filterBar.innerHTML = html;
}

/**
 * Filters a list of reading items by type.
 *
 * @param {Array}  readingList - Full list of reading item objects.
 * @param {string} type        - Type to filter by. 'all' returns full list.
 * @returns {Array}
 */
export function filterReadingByType(readingList, type) {
  if (!type || type === 'all') return readingList;
  return readingList.filter(item => item.type === type);
}

/**
 * Builds filter buttons dynamically from reading item types.
 *
 * @param {HTMLElement} filterBar   - Container element for filter buttons.
 * @param {Array}       readingList - Full list of reading item objects with .type.
 */
export function buildTypeButtons(filterBar, readingList) {
  if (!filterBar) return;

  const types = [...new Set(
    readingList.map(item => item.type).filter(Boolean)
  )].sort();

  const pluralise = (t) => {
    const map = { paper: 'Papers', book: 'Books', course: 'Courses' };
    return map[t] || t.replace(/\b\w/g, c => c.toUpperCase());
  };

  let html = '<button class="tag tag--active" data-filter="all" type="button">All</button>';
  for (const t of types) {
    html += `<button class="tag" data-filter="${t}" type="button">${pluralise(t)}</button>`;
  }
  filterBar.innerHTML = html;
}

/**
 * Initialises filter button UI behaviour for a given filter bar.
 * Marks the clicked button as active and triggers a callback.
 *
 * @param {HTMLElement} filterBar - Container element holding filter buttons.
 * @param {Function}    onFilter  - Callback invoked with the selected filter value.
 */
export function initFilterBar(filterBar, onFilter) {
  if (!filterBar) return;

  filterBar.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-filter]');
    if (!btn) return;

    // Update active state
    filterBar.querySelectorAll('[data-filter]').forEach(b => {
      b.classList.remove('tag--active');
    });
    btn.classList.add('tag--active');

    onFilter(btn.dataset.filter);
  });
}
