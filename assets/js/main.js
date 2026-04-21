/**
 * main.js
 * Entry point for the client logic layer.
 * Detects the current page and initialises the appropriate rendering pipeline.
 *
 * Data flow:
 *   dataService → renderer → DOM
 *   filters     → renderer → DOM  (on user interaction)
 */

import { fetchProjects, fetchArticles, fetchFeaturedProjects, fetchRecentArticles, fetchResume } from './dataService.js';
import { renderProjects } from './projectRenderer.js';
import { renderArticles }  from './articleRenderer.js';
import { renderResume }    from './resumeRenderer.js';
import { filterProjectsByTag, filterArticlesByCategory, initFilterBar, buildCategoryButtons } from './filters.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function showSpinner(container) {
  if (container) container.innerHTML = '<div class="loading-spinner" aria-label="Loading content"></div>';
}

// ─── Page detection (after DOM: avoids rare races with body / data-page) ─────
function boot() {
  const page = document.body?.dataset?.page;

  if (page === 'index') {
    initIndexPage();
  } else if (page === 'projects') {
    initProjectsPage();
  } else if (page === 'articles') {
    initArticlesPage();
  } else if (page === 'resume') {
    initResumePage();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
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

/**
 * resume.html — loads resume with EN / PT-BR toggle; PDF button opens print dialog (Save as PDF).
 */
async function initResumePage() {
  const container = document.getElementById('resume-container');
  const btnEn     = document.getElementById('resume-lang-en');
  const btnPt     = document.getElementById('resume-lang-pt');
  const pdfBtn    = document.getElementById('resume-pdf');
  let currentLang = 'en';

  function setLangUI(lang) {
    currentLang = lang;
    const isEn = lang === 'en';
    if (btnEn) {
      btnEn.classList.toggle('tag--active', isEn);
      btnEn.setAttribute('aria-pressed', String(isEn));
    }
    if (btnPt) {
      btnPt.classList.toggle('tag--active', !isEn);
      btnPt.setAttribute('aria-pressed', String(!isEn));
    }
    document.documentElement.lang = isEn ? 'en' : 'pt-BR';
  }

  async function loadResume(lang) {
    showSpinner(container);
    const data = await fetchResume(lang);
    renderResume(data, container);
    setLangUI(lang);
  }

  await loadResume(currentLang);

  btnEn?.addEventListener('click', async () => {
    if (currentLang === 'en') return;
    await loadResume('en');
  });

  btnPt?.addEventListener('click', async () => {
    if (currentLang === 'pt') return;
    await loadResume('pt');
  });

  pdfBtn?.addEventListener('click', () => {
    window.print();
  });
}
