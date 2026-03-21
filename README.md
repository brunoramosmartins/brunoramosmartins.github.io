# Academic ML Engineering Portfolio

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Version](https://img.shields.io/badge/version-v0.4-blue)
![License](https://img.shields.io/badge/license-MIT-lightgrey)
![Deploy](https://img.shields.io/badge/deploy-GitHub%20Pages-222?logo=github)

> A structured, layered engineering portfolio for Machine Learning and Data Science work.
> Built to demonstrate engineering discipline, content automation, and separation of concerns — not just to host a website.

**Live:** [brunoramosmartins.github.io](https://brunoramosmartins.github.io)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Repository Structure](#repository-structure)
- [Technology Stack](#technology-stack)
- [Blog Engine](#blog-engine)
- [Roadmap](#roadmap)
- [Development Workflow](#development-workflow)
- [Branching Strategy](#branching-strategy)
- [Commit Convention](#commit-convention)

---

## Overview

This repository is the source of an academic-oriented ML and Data Science portfolio with four explicit goals:

| Goal | Implementation |
|---|---|
| Engineering discipline | Layered architecture, semantic commits, modular JS |
| Content automation | Python engine converts Markdown to HTML with MathJax support |
| Structured documentation | JSON-driven content, design system in `/docs` |
| Separation of concerns | Presentation, logic, and content are fully decoupled |

The site serves as a technical portfolio of ML projects, a structured log of short technical studies, a foundation for long-form academic articles with LaTeX math support, and a demonstration of Python-driven automation.

---

## Architecture

The system is divided into four logical layers, each with a single responsibility.

```
┌─────────────────────────────────────┐
│          Deployment Layer           │
│          (GitHub Pages)             │
└─────────────────────────────────────┘
                  ▲
┌─────────────────────────────────────┐
│         Client Logic Layer          │
│        (Vanilla JavaScript)         │
│  · Fetch JSON data                  │
│  · Render project and article cards │
│  · Dynamic category filtering       │
└─────────────────────────────────────┘
                  ▲
┌─────────────────────────────────────┐
│         Presentation Layer          │
│            (HTML + CSS)             │
│  · Static page structure            │
│  · Design system (variables, scale) │
│  · Responsive layout                │
└─────────────────────────────────────┘
                  ▲
┌─────────────────────────────────────┐
│          Content Engine             │
│             (Python)                │
│  · Markdown → HTML conversion       │
│  · YAML front matter parsing        │
│  · Template injection (MathJax)     │
│  · JSON metadata sync               │
│  · Orphan pruning (--prune)         │
└─────────────────────────────────────┘
```

### Content Flow

```
markdown_posts/*.md
        │
        ▼  build_blog.py
posts/*.html  +  data/articles.json
        │
        ▼  JavaScript fetch
Browser renders article list and cards
        │
        ▼  GitHub Pages
Public URL
```

> The JSON files (`projects.json`, `articles.json`) are the **contract** between the
> Python content engine and the JavaScript rendering layer. Neither layer depends
> directly on the other.

---

## Repository Structure

```
/
├── index.html                  # Home — featured projects + recent articles
├── projects.html               # Full project listing with tag filtering
├── articles.html               # Article listing with dynamic category filtering
├── about.html                  # About page with sidebar layout
│
├── assets/
│   ├── css/
│   │   ├── base.css            # CSS variables, reset, typography system
│   │   ├── layout.css          # Header, footer, grid, responsive breakpoints
│   │   └── components.css      # Cards, tags, article list, about layout
│   │
│   ├── js/
│   │   ├── main.js             # Entry point — detects page, coordinates modules
│   │   ├── dataService.js      # All fetch logic — single source of data access
│   │   ├── projectRenderer.js  # Generates and injects project card HTML
│   │   ├── articleRenderer.js  # Generates and injects article list HTML
│   │   ├── filters.js          # Client-side filtering + dynamic category buttons
│   │   └── navigation.js       # Mobile navigation toggle
│   │
│   ├── images/
│   └── favicon.svg
│
├── data/
│   ├── projects.json           # Project metadata — source of truth for projects
│   └── articles.json           # Article metadata — auto-updated by build_blog.py
│
├── markdown_posts/             # Source articles authored in Markdown
├── posts/                      # Generated HTML articles (output of build_blog.py)
├── figures/                    # Article figures (PNG charts, diagrams)
│
├── templates/
│   └── article_template.html   # HTML template with MathJax support
│
├── docs/
│   ├── design.md               # Typography, spacing, and color design decisions
│   └── diagrams.html           # Interactive architecture diagrams
│
├── build_blog.py               # Python content engine (Markdown → HTML + JSON)
├── requirements.txt            # Python dependencies (markdown==3.7)
└── README.md
```

---

## Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| Presentation | HTML5, CSS3 | Semantic structure, CSS custom properties, ARIA labels |
| Styling | IBM Plex Serif + IBM Plex Mono | Academic authority with technical identity |
| Client Logic | Vanilla JavaScript (ES Modules) | No framework dependency, portable |
| Content Engine | Python 3 + `markdown` lib | Markdown parsing, template injection, JSON output |
| Math Rendering | MathJax 3 | LaTeX math in articles ($...$ inline, $$...$$ display) |
| SEO | Open Graph meta tags | Social sharing previews on all pages |
| Deployment | GitHub Pages | Static hosting, zero infrastructure |

---

## Blog Engine

The blog engine (`build_blog.py`) converts Markdown articles into static HTML pages.

### Features

- YAML front matter parsing (title, description, date, category, reading_time)
- Markdown → HTML with fenced code blocks, tables, TOC, and line breaks
- MathJax 3 integration for LaTeX equations
- Automatic `articles.json` sync (insert/update, sorted by date)
- `--prune` flag to remove orphan entries when source `.md` files are deleted
- `--dry-run` to preview metadata without writing files
- `--file` to build a single article

### Publishing a New Article

```bash
# 1. Create the Markdown file with YAML front matter
#    File: markdown_posts/my-article.md

# 2. Copy any figures to figures/

# 3. Build
python build_blog.py

# 4. Commit generated files
git add markdown_posts/my-article.md posts/my-article.html data/articles.json figures/
git commit -m "feat(blog): add article — My Article Title"
git push
```

### Front Matter Format

```yaml
---
title: "Article Title"
description: "Short description shown in listings."
date: 2026-03-19
category: machine-learning
reading_time: "8 min"
---
```

Required fields: `title`, `description`, `date`, `category`
Optional fields: `reading_time`, `id` (defaults to filename stem)
Categories are generated dynamically as filter buttons — any new category works automatically.

---

## Roadmap

| Version | Milestone | Status |
|---|---|---|
| v0.1 | Foundation — repo structure, branching, conventions | ✅ Complete |
| v0.2 | Presentation Layer — HTML, CSS design system, responsive layout | ✅ Complete |
| v0.3 | Dynamic Rendering — JSON data models, JS modules, filtering | ✅ Complete |
| v0.4 | Blog Engine — `build_blog.py`, Markdown pipeline, MathJax, dynamic filters | ✅ Complete |
| v0.5 | UX Polish — loading states, accessibility, mobile nav fixes | 🔲 Planned |
| v1.0 | Public Release — Lighthouse audit, SEO hardening, structured data | 🔲 Planned |

---

## Development Workflow

**Serve locally** (required for ES module `fetch` to work):

```bash
python -m http.server 8000
# Open http://localhost:8000
```

**Add a new project:**

```bash
# Edit data/projects.json — no HTML modification required
```

**Publish a new article:**

```bash
# 1. Write article in Markdown with front matter
vim markdown_posts/my-article.md

# 2. Add figures if needed
cp path/to/figure.png figures/

# 3. Run content engine
python build_blog.py

# 4. Commit and push — GitHub Pages deploys automatically
git add markdown_posts/ posts/ data/articles.json figures/
git commit -m "feat(blog): add article — Title"
git push
```

**Remove a deleted article from the index:**

```bash
python build_blog.py --prune
```

---

## Branching Strategy

```
main        →  Production branch (deployed via GitHub Pages)
feature/*   →  Feature-specific branches, merged into main via PR
```

All changes follow the path `feature/* → main` via Pull Request.

---

## Commit Convention

Semantic commit messages are used throughout:

| Prefix | Usage |
|---|---|
| `feat:` | New feature or capability |
| `refactor:` | Structural change without behaviour addition |
| `docs:` | Documentation updates |
| `chore:` | Maintenance, dependency, or tooling tasks |
| `fix:` | Bug fixes |

**Examples:**

```
feat(blog): add article — Not All Errors Cost the Same
feat: implement dynamic category filtering
fix: front matter regex edge case on EOF
chore: remove unused JS stubs
docs: update README with v0.4 architecture
```
