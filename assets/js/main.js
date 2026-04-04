/**
 * main.js
 * Entry point for the client logic layer.
 * Detects the current page and initialises the appropriate rendering pipeline.
 *
 * Data flow:
 *   dataService → renderer → DOM
 *   filters     → renderer → DOM  (on user interaction)
 */

import { fetchProjects, fetchArticles, fetchFeaturedProjects, fetchRecentArticles } from './dataService.js';
import { renderProjects } from './projectRenderer.js';
import { renderArticles }  from './articleRenderer.js';
import { filterProjectsByTag, filterArticlesByCategory, initFilterBar, buildCategoryButtons } from './filters.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function showSpinner(container) {
  if (container) container.innerHTML = '<div class="loading-spinner" aria-label="Loading content"></div>';
}

// ─── Page detection ────────────────────────────────────────────────────────────
const page = document.body.dataset.page;

// ─── Index page ───────────────────────────────────────────────────────────────
if (page === 'index') {
  initIndexPage();
}

// ─── Projects page ────────────────────────────────────────────────────────────
if (page === 'projects') {
  initProjectsPage();
}

// ─── Articles page ────────────────────────────────────────────────────────────
if (page === 'articles') {
  initArticlesPage();
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE INITIALISERS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * index.html — loads featured projects and recent articles.
 */
async function initIndexPage() {
  // Featured projects
  const featuredContainer = document.getElementById('featured-projects');
  showSpinner(featuredContainer);
  if (featuredContainer) {
    const featured = await fetchFeaturedProjects();
    renderProjects(featured, featuredContainer);
  }

  // Recent articles (latest 3)
  const recentContainer = document.getElementById('recent-articles');
  showSpinner(recentContainer);
  if (recentContainer) {
    const recent = await fetchRecentArticles(3);
    renderArticles(recent, recentContainer);
  }
}

/**
 * projects.html — loads all projects with filtering.
 */
async function initProjectsPage() {
  const container = document.getElementById('projects-grid');
  const filterBar = document.getElementById('projects-filter');

  showSpinner(container);
  const allProjects = await fetchProjects();
  renderProjects(allProjects, container);

  initFilterBar(filterBar, (tag) => {
    const filtered = filterProjectsByTag(allProjects, tag);
    renderProjects(filtered, container);
  });
}

/**
 * articles.html — loads all articles with category filtering.
 */
async function initArticlesPage() {
  const container = document.getElementById('articles-list');
  const filterBar = document.getElementById('articles-filter');

  showSpinner(container);
  const allArticles = await fetchArticles();
  buildCategoryButtons(filterBar, allArticles);
  renderArticles(allArticles, container);

  initFilterBar(filterBar, (category) => {
    const filtered = filterArticlesByCategory(allArticles, category);
    renderArticles(filtered, container);
  });
}
