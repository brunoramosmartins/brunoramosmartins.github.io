/**
 * articleRenderer.js
 * Responsible for generating and injecting article list UI components.
 */

/**
 * Formats a date string (YYYY-MM-DD) to "Mon YYYY" display format.
 * @param {string} dateStr
 * @returns {{ display: string, iso: string }}
 */
function formatDate(dateStr) {
  if (!dateStr) return { display: '', iso: '' };
  const d = new Date(dateStr);
  const display = d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  return { display, iso: dateStr };
}

/**
 * Creates the HTML string for a single article list item.
 * Compatible with .article-item component defined in components.css.
 *
 * @param {Object} article
 * @param {string} article.title
 * @param {string} article.description
 * @param {string} article.category
 * @param {string} article.date
 * @param {string} article.reading_time
 * @param {string} article.url
 * @returns {string} HTML string
 */
export function createArticleCard(article) {
  const {
    title        = 'Untitled Article',
    description  = '',
    category     = '',
    date         = '',
    reading_time = '',
    url          = '#',
  } = article;

  const { display: dateDisplay, iso: dateISO } = formatDate(date);

  const categoryTag = category
    ? `<span class="tag" data-category="${category}">${category}</span>`
    : '';

  const readingTimeTag = reading_time
    ? `<span class="tag">${reading_time}</span>`
    : '';

  return `
    <article class="article-item" data-category="${category}">
      <time class="article-item__date" datetime="${dateISO}">
        ${dateDisplay}
      </time>
      <div class="article-item__body">
        <h2 class="article-item__title">
          <a href="${url}">${title}</a>
        </h2>
        <p class="article-item__excerpt">${description}</p>
        <div class="tags">
          ${categoryTag}
          ${readingTimeTag}
        </div>
      </div>
    </article>
  `.trim();
}

/**
 * Renders a list of articles into a container element.
 *
 * @param {Array}       articleList - Array of article objects.
 * @param {HTMLElement} container   - DOM element to inject items into.
 */
export function renderArticles(articleList, container) {
  if (!container) {
    console.warn('[articleRenderer] Container element not found.');
    return;
  }

  if (articleList.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p class="empty-state__label">No articles found.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = articleList.map(createArticleCard).join('');
}
