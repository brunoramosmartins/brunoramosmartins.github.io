/**
 * resumeRenderer.js
 * Responsible for generating and injecting resume/CV UI components.
 */

/**
 * Renders a resume section only if data is present.
 * @param {string} id - Section id for accessibility.
 * @param {string} title - Section heading.
 * @param {string} content - Inner HTML of the section.
 * @returns {string} HTML string, or empty string if no content.
 */
function section(id, title, content) {
  if (!content) return '';
  return `
    <section class="resume-section" id="${id}">
      <h2 class="resume-section__title">${title}</h2>
      ${content}
    </section>
  `;
}

/**
 * Renders the resume sidebar (name, role, contact).
 */
function renderSidebar(data) {
  const { name = '', role = '', contact = {} } = data;

  const contactLinks = [
    contact.email    ? `<a href="mailto:${contact.email}">${contact.email}</a>` : '',
    contact.github   ? `<a href="${contact.github}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>` : '',
    contact.linkedin ? `<a href="${contact.linkedin}" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>` : '',
    contact.location ? `<span class="resume-contact__location">${contact.location}</span>` : '',
  ].filter(Boolean).join('');

  return `
    <aside class="resume-sidebar">
      <h1 class="resume-name">${name}</h1>
      <p class="resume-role">${role}</p>
      <address class="resume-contact">
        ${contactLinks}
      </address>
    </aside>
  `;
}

/**
 * Renders the experience timeline.
 */
function renderExperience(items, lang) {
  if (!items?.length) return '';
  const html = items.map(item => `
    <div class="resume-timeline__item">
      <span class="resume-timeline__period">${item.period || ''}</span>
      <div class="resume-timeline__body">
        <h3 class="resume-timeline__title">${item.title || ''}</h3>
        <p class="resume-timeline__org">${item.company || ''}</p>
        ${item.description ? `<p class="resume-timeline__desc">${item.description}</p>` : ''}
        ${item.highlights?.length ? `
          <ul class="resume-timeline__highlights">
            ${item.highlights.map(h => `<li>${h}</li>`).join('')}
          </ul>
        ` : ''}
      </div>
    </div>
  `).join('');
  return section('experience', lang === 'pt' ? 'Experiência' : 'Experience', `<div class="resume-timeline">${html}</div>`);
}

/**
 * Renders the education timeline.
 */
function renderEducation(items, lang) {
  if (!items?.length) return '';
  const html = items.map(item => `
    <div class="resume-timeline__item">
      <span class="resume-timeline__period">${item.period || ''}</span>
      <div class="resume-timeline__body">
        <h3 class="resume-timeline__title">${item.degree || ''}</h3>
        <p class="resume-timeline__org">${item.institution || ''}</p>
        ${item.description ? `<p class="resume-timeline__desc">${item.description}</p>` : ''}
      </div>
    </div>
  `).join('');
  return section('education', lang === 'pt' ? 'Educação' : 'Education', `<div class="resume-timeline">${html}</div>`);
}

/**
 * Renders skill groups as tag lists.
 */
function renderSkills(skills, lang) {
  if (!skills || Object.keys(skills).length === 0) return '';
  const html = Object.entries(skills).map(([group, items]) => `
    <div class="resume-skills-group">
      <h3>${group}</h3>
      <div class="tags">
        ${items.map(s => `<span class="tag">${s}</span>`).join('')}
      </div>
    </div>
  `).join('');
  return section('skills', lang === 'pt' ? 'Competências' : 'Skills', html);
}

/**
 * Renders certifications list.
 */
function renderCertifications(items, lang) {
  if (!items?.length) return '';
  const html = `<ul class="resume-list">${items.map(c => `
    <li class="resume-list__item">
      <strong>${c.name}</strong> — ${c.issuer}
      <span class="resume-list__date">${c.date || ''}</span>
    </li>
  `).join('')}</ul>`;
  return section('certifications', lang === 'pt' ? 'Certificações' : 'Certifications', html);
}

/**
 * Renders publications list.
 */
function renderPublications(items, lang) {
  if (!items?.length) return '';
  const html = `<ul class="resume-list">${items.map(p => `
    <li class="resume-list__item">
      ${p.url ? `<a href="${p.url}" target="_blank" rel="noopener noreferrer">${p.title}</a>` : p.title}
      ${p.venue ? ` — ${p.venue}` : ''}
      ${p.date ? `<span class="resume-list__date">${p.date}</span>` : ''}
    </li>
  `).join('')}</ul>`;
  return section('publications', lang === 'pt' ? 'Publicações' : 'Publications', html);
}

/**
 * Renders the full resume into a container element.
 *
 * @param {Object}      resumeData - Resume data object.
 * @param {HTMLElement}  container  - DOM element to inject content into.
 */
export function renderResume(resumeData, container) {
  if (!container) {
    console.warn('[resumeRenderer] Container element not found.');
    return;
  }

  if (!resumeData || !resumeData.name) {
    container.innerHTML = `
      <div class="empty-state">
        <p class="empty-state__label">Resume data not available.</p>
      </div>
    `;
    return;
  }

  const lang = resumeData.lang || 'en';

  const summaryContent = resumeData.summary
    ? `<p class="resume-summary">${resumeData.summary}</p>`
    : '';

  container.innerHTML = `
    <div class="resume-layout">
      ${renderSidebar(resumeData)}
      <div class="resume-content">
        ${section('summary', lang === 'pt' ? 'Resumo' : 'Summary', summaryContent)}
        ${renderExperience(resumeData.experience, lang)}
        ${renderEducation(resumeData.education, lang)}
        ${renderSkills(resumeData.skills, lang)}
        ${renderCertifications(resumeData.certifications, lang)}
        ${renderPublications(resumeData.publications, lang)}
      </div>
    </div>
  `;
}
