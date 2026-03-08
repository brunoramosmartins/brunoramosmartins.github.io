/**
 * projectRenderer.js
 * Responsible for generating and injecting project card UI components.
 */

/**
 * Formats a date string (YYYY-MM-DD) into a display year.
 * @param {string} dateStr
 * @returns {string}
 */
function formatYear(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).getFullYear().toString();
}

/**
 * Normalises a status string into a display label.
 * @param {string} status - 'complete' | 'in-progress'
 * @returns {string}
 */
function formatStatus(status) {
  const map = {
    'complete':    'Complete',
    'in-progress': 'In Progress',
  };
  return map[status] || status;
}

/**
 * Creates the HTML string for a single project card.
 * Compatible with the .card component defined in components.css.
 *
 * @param {Object} project
 * @param {string} project.id
 * @param {string} project.title
 * @param {string} project.description
 * @param {string[]} project.tags
 * @param {string[]} project.stack
 * @param {string} project.github_url
 * @param {string} project.demo_url
 * @param {string} project.status
 * @param {string} project.date
 * @returns {string} HTML string
 */
export function createProjectCard(project) {
  const {
    title       = 'Untitled Project',
    description = '',
    tags        = [],
    stack       = [],
    github_url  = '',
    demo_url    = '',
    status      = '',
    date        = '',
  } = project;

  // Merge tags and stack into a single tag list for display
  const allTags = [...new Set([...tags, ...stack])];

  const tagsHTML = allTags
    .map(t => `<span class="tag" data-tag="${t.toLowerCase()}">${t}</span>`)
    .join('');

  const linksHTML = [
    github_url ? `<a href="${github_url}" class="card__link" target="_blank" rel="noopener noreferrer">GitHub →</a>` : '',
    demo_url   ? `<a href="${demo_url}"   class="card__link" target="_blank" rel="noopener noreferrer">Demo →</a>`   : '',
  ].filter(Boolean).join('');

  return `
    <article class="card" data-tags="${allTags.map(t => t.toLowerCase()).join(',')}">
      <div class="card__meta">
        <span class="card__date">${formatYear(date)}</span>
        ${status ? `<span class="card__status">${formatStatus(status)}</span>` : ''}
      </div>
      <h2 class="card__title">${title}</h2>
      <p class="card__description">${description}</p>
      <div class="card__footer">
        <div class="tags">${tagsHTML}</div>
        <div class="card__links">${linksHTML}</div>
      </div>
    </article>
  `.trim();
}

/**
 * Renders a list of projects into a container element.
 *
 * @param {Array}       projectList - Array of project objects.
 * @param {HTMLElement} container   - DOM element to inject cards into.
 */
export function renderProjects(projectList, container) {
  if (!container) {
    console.warn('[projectRenderer] Container element not found.');
    return;
  }

  if (projectList.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p class="empty-state__label">No projects found.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = projectList.map(createProjectCard).join('');
}
