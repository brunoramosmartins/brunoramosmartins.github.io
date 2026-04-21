/**
 * readingRenderer.js
 * Responsible for generating and injecting reading list UI components.
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
 * Maps status to a display label.
 * @param {string} status
 * @returns {string}
 */
function formatStatus(status) {
  const map = { read: 'Read', reading: 'Reading', queued: 'Queued' };
  return map[status] || status;
}

/**
 * Maps type to a display label.
 * @param {string} type
 * @returns {string}
 */
function formatType(type) {
  const map = { paper: 'Paper', book: 'Book', course: 'Course' };
  return map[type] || type;
}

/**
 * Creates the HTML string for a single reading list item.
 *
 * @param {Object} item
 * @returns {string} HTML string
 */
export function createReadingItem(item) {
  const {
    title      = 'Untitled',
    author     = '',
    type       = '',
    status     = '',
    url        = '#',
    date_added = '',
    notes      = '',
  } = item;

  const { display: dateDisplay, iso: dateISO } = formatDate(date_added);

  const titleHTML = url && url !== '#'
    ? `<a href="${url}" target="_blank" rel="noopener noreferrer">${title}</a>`
    : title;

  return `
    <article class="reading-item" data-type="${type}" data-status="${status}">
      <span class="reading-item__dot reading-item__dot--${status}" aria-label="${formatStatus(status)}"></span>
      <div class="reading-item__body">
        <h2 class="reading-item__title">${titleHTML}</h2>
        <p class="reading-item__meta">
          ${author ? `<span class="reading-item__author">${author}</span>` : ''}
          <span class="tag">${formatType(type)}</span>
          <span class="tag reading-item__status-tag reading-item__status-tag--${status}">${formatStatus(status)}</span>
        </p>
        ${notes ? `<p class="reading-item__notes">${notes}</p>` : ''}
      </div>
      <time class="reading-item__date" datetime="${dateISO}">
        ${dateDisplay}
      </time>
    </article>
  `.trim();
}

/**
 * Renders a list of reading items into a container element.
 *
 * @param {Array}       readingList - Array of reading item objects.
 * @param {HTMLElement} container   - DOM element to inject items into.
 */
export function renderReading(readingList, container) {
  if (!container) {
    console.warn('[readingRenderer] Container element not found.');
    return;
  }

  if (readingList.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p class="empty-state__label">No reading items found.</p>
      </div>
    `;
    return;
  }

  // Sort by date_added descending
  const sorted = [...readingList].sort(
    (a, b) => new Date(b.date_added) - new Date(a.date_added)
  );

  container.innerHTML = sorted.map(createReadingItem).join('');
}
