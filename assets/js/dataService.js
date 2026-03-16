/**
 * dataService.js
 * Responsible for all data retrieval from JSON sources.
 * All other modules consume data exclusively through this service.
 */

const BASE_PATH = '';

/**
 * Generic fetch wrapper with error handling.
 * @param {string} url - Path to the JSON file.
 * @returns {Promise<Array>} - Parsed JSON array, or empty array on failure.
 */
async function fetchJSON(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: failed to fetch ${url}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[dataService] Fetch error:', error.message);
    return [];
  }
}

/**
 * Fetches all project entries.
 * @returns {Promise<Array>} - Array of project objects.
 */
export async function fetchProjects() {
  return fetchJSON(`${BASE_PATH}/data/projects.json`);
}

/**
 * Fetches all article entries.
 * @returns {Promise<Array>} - Array of article objects.
 */
export async function fetchArticles() {
  return fetchJSON(`${BASE_PATH}/data/articles.json`);
}

/**
 * Fetches only featured projects.
 * @returns {Promise<Array>} - Filtered array of featured project objects.
 */
export async function fetchFeaturedProjects() {
  const projects = await fetchProjects();
  return projects.filter(p => p.featured === true);
}

/**
 * Fetches the N most recent articles sorted by date descending.
 * @param {number} limit - Maximum number of articles to return.
 * @returns {Promise<Array>}
 */
export async function fetchRecentArticles(limit = 3) {
  const articles = await fetchArticles();
  return articles
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
}
