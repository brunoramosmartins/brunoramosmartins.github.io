/**
 * dataService.js
 * Responsible for all data retrieval from JSON sources.
 * All other modules consume data exclusively through this service.
 */

/**
 * Base URL for the /data directory, derived from this module's location.
 * This file lives at assets/js/dataService.js → ../../data/ is always the site root data folder,
 * regardless of which HTML page is open (index, projects, nested posts, etc.).
 * window.location-based resolution can fail for file://, odd IPv6 bases, or future subpath layouts.
 */
const DATA_DIR = new URL('../../data/', import.meta.url);

/**
 * @param {string} filename - Basename inside data/, e.g. 'projects.json'
 * @returns {string} Absolute URL for fetch()
 */
function dataFileUrl(filename) {
  return new URL(filename, DATA_DIR).href;
}

/**
 * Generic fetch wrapper with error handling.
 * @param {string} url - Full URL to the JSON file.
 * @returns {Promise<unknown>} Parsed JSON, or [] on failure (callers that need an object must handle []).
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
  const data = await fetchJSON(dataFileUrl('projects.json'));
  return Array.isArray(data) ? data : [];
}

/**
 * Fetches all article entries.
 * @returns {Promise<Array>} - Array of article objects.
 */
export async function fetchArticles() {
  const data = await fetchJSON(dataFileUrl('articles.json'));
  return Array.isArray(data) ? data : [];
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

/**
 * Fetches resume data for a given language.
 * @param {string} lang - 'en' or 'pt'
 * @returns {Promise<Object>} - Resume object, or empty object on failure.
 */
export async function fetchResume(lang = 'en') {
  const file = lang === 'pt' ? 'resume.pt.json' : 'resume.json';
  const raw = await fetchJSON(dataFileUrl(file));
  if (!raw || typeof raw !== 'object') return {};
  if (Array.isArray(raw)) {
    if (raw.length === 0) return {};
    const first = raw[0];
    return first && typeof first === 'object' ? first : {};
  }
  return raw;
}

