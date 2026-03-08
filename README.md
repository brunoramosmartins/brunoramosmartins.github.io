# Academic ML Engineering Portfolio

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Version](https://img.shields.io/badge/version-v0.3-blue)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

> A structured, layered engineering portfolio for Machine Learning and Data Science work.
> Built to demonstrate engineering discipline, content automation, and separation of concerns — not just to host a website.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Repository Structure](#repository-structure)
- [Technology Stack](#technology-stack)
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
| Content automation | Python engine converts Markdown to HTML |
| Structured documentation | JSON-driven content, design system in `/docs` |
| Separation of concerns | Presentation, logic, and content are fully decoupled |

The site serves as a technical portfolio of ML projects, a structured log of short technical studies, a foundation for long-form academic articles, and a demonstration of Python-driven automation.

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
│  · Client-side filtering            │
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
│  · Markdown parsing                 │
│  · Template injection               │
│  · JSON metadata generation         │
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
├── articles.html               # Article listing with category filtering
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
│   │   ├── filters.js          # Client-side tag and category filtering
│   │   └── navigation.js       # Mobile navigation toggle
│   │
│   └── images/
│
├── data/
│   ├── projects.json           # Project metadata — source of truth for projects
│   └── articles.json           # Article metadata — updated by build_blog.py
│
├── markdown_posts/             # Source articles authored in Markdown
├── posts/                      # Generated HTML articles (output of build_blog.py)
│
├── templates/
│   └── article_template.html   # HTML template consumed by build_blog.py
│
├── docs/
│   ├── design.md               # Typography, spacing, and color design decisions
│   └── diagrams.html           # Interactive architecture diagrams
│
├── build_blog.py               # Python content engine
└── README.md
```

---

## Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| Presentation | HTML5, CSS3 | Semantic structure, CSS custom properties |
| Styling | IBM Plex Serif + IBM Plex Mono | Academic authority with technical identity |
| Client Logic | Vanilla JavaScript (ES Modules) | No framework dependency, portable |
| Content Engine | Python 3 | Markdown parsing, template injection, JSON output |
| Deployment | GitHub Pages | Static hosting, zero infrastructure |

---

## Roadmap

| Version | Milestone | Status |
|---|---|---|
| v0.1 | Foundation — repo structure, branching, conventions | ✅ Complete |
| v0.2 | Presentation Layer — HTML, CSS design system, responsive layout | ✅ Complete |
| v0.3 | Dynamic Rendering — JSON data models, JS modules, filtering | ✅ Complete |
| v0.4 | Blog Engine — `build_blog.py`, Markdown pipeline, template system | 🔲 Planned |
| v1.0 | Public Release — accessibility audit, Lighthouse validation | 🔲 Planned |
| v1.1 | Engineering Maturity — performance, SEO, structured metadata | 🔲 Planned |

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

**Publish a new article** *(available from v0.4)*:

```bash
# 1. Write article in Markdown
vim markdown_posts/my-article.md

# 2. Run content engine
python build_blog.py

# 3. Commit and push — GitHub Pages deploys automatically
```

---

## Branching Strategy

```
main        →  Production branch (deployed via GitHub Pages)
dev         →  Active development branch
feature/*   →  Feature-specific branches, merged into dev
```

All changes follow the path `feature/* → dev → main`. Direct commits to `main` are not made outside of hotfixes.

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
feat: implement article filtering by category
refactor: extract fetch logic into dataService module
docs: update README with v0.3 architecture
chore: add .gitignore for Python cache files
```
