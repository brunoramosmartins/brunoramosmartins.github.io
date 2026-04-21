/**
 * tilRenderer.js
 * Generates and injects the TIL (Today I Learned) list UI.
 *
 * TIL cards are deliberately more compact than article cards:
 *   - No reading_time badge
 *   - Tighter vertical rhythm
 *   - Tag-heavy (tags are the primary navigation device for TILs)
 */

function formatDate(dateStr) {
  if (!dateStr) return { display: '', iso: '' };
  const d = new Date(dateStr);
  const display = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  return { display, iso: dateStr };
}

/**
 * Creates the HTML string for a single TIL list item.
 *
 * @param {Object}   til
 * @param {string}   til.title
 * @param {string}   til.description
 * @param {string}   til.date
 * @param {string[]} til.tags
 * @param {string}   til.url
 * @returns {string}
 */
export function createTilCard(til) {
  const {
    title       = 'Untitled TIL',
    description = '',
    date        = '',
    tags        = [],
    url         = '#',
  } = til;

  const { display: dateDisplay, iso: dateISO } = formatDate(date);

  const tagSpans = (tags || [])
    .map(t => `<span class="tag til-card__tag" data-tag="${t}">${t}</span>`)
    .join('');

  return `
    <article class="til-card">
      <div class="til-card__body">
        <h2 class="til-card__title">
          <a href="${url}">${title}</a>
        </h2>
        <p class="til-card__excerpt">${description}</p>
        <div class="til-card__meta">
          <time class="til-card__date" datetime="${dateISO}">${dateDisplay}</time>
          <div class="tags til-card__tags">${tagSpans}</div>
        </div>
      </div>
    </article>
  `.trim();
}

/**
 * Renders a list of TILs into a container element.
 *
 * @param {Array}       tilList   - Array of TIL objects.
 * @param {HTMLElement} container - DOM element to inject items into.
 */
export function renderTils(tilList, container) {
  if (!container) {
    console.warn('[tilRenderer] Container element not found.');
    return;
  }

  if (tilList.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p class="empty-state__label">No TILs yet. First one is cooking.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = tilList.map(createTilCard).join('');
}
