# Academic ML Engineering Portfolio

## Overview

This repository contains the source code for my academic-oriented Machine Learning and Data Science portfolio.

The goal of this project is not merely to host a personal website, but to demonstrate:

- Engineering discipline
- Content automation
- Structured technical documentation
- Separation of concerns in web architecture
- Continuous learning and public knowledge tracking

The website functions as:

- A technical portfolio of ML and DS projects
- A structured log of short technical studies
- A foundation for long-form academic articles
- A demonstration of automation using Python

---

## Architectural Philosophy

This project follows a layered architecture to ensure scalability, maintainability, and engineering clarity.

The system is divided into four logical layers.

---

## Layered Architecture Diagram

```
                        ┌───────────────────────────────┐
                        │         Deployment Layer       │
                        │        (GitHub Pages)          │
                        └───────────────────────────────┘
                                      ▲
                                      │
                                      │
                        ┌───────────────────────────────┐
                        │        Client Logic Layer      │
                        │      (Vanilla JavaScript)      │
                        │  - Fetch JSON                  │
                        │  - Render dynamic content      │
                        │  - Filtering                   │
                        └───────────────────────────────┘
                                      ▲
                                      │
                                      │
                        ┌───────────────────────────────┐
                        │        Presentation Layer      │
                        │        (HTML + CSS)            │
                        │  - Static structure            │
                        │  - Styling                     │
                        └───────────────────────────────┘
                                      ▲
                                      │
                                      │
                        ┌───────────────────────────────┐
                        │         Content Engine         │
                        │           (Python)             │
                        │  - Markdown parsing            │
                        │  - Template injection          │
                        │  - JSON metadata update        │
                        └───────────────────────────────┘
```

---

## Content Flow Diagram

```
Markdown Files (markdown_posts/)
            │
            ▼
   build_blog.py (Python Engine)
            │
            ▼
Generated HTML (posts/)
            │
            ▼
articles.json updated
            │
            ▼
JavaScript fetch + rendering
            │
            ▼
Deployed via GitHub Pages
```

---

## Repository Structure

```
/
├── index.html
├── projects.html
├── articles.html
├── about.html
│
├── assets/
│   ├── css/
│   │   ├── base.css
│   │   ├── layout.css
│   │   └── components.css
│   │
│   ├── js/
│   │   ├── main.js
│   │   ├── projects.js
│   │   └── articles.js
│   │
│   └── images/
│
├── data/
│   ├── projects.json
│   └── articles.json
│
├── markdown_posts/
├── posts/
├── templates/
│   └── article_template.html
│
├── build_blog.py
└── README.md
```

This structure enforces separation between presentation, client logic, and automated content generation.

---

## Architectural Layers

### 1. Presentation Layer

Responsible for structure and styling.

Technologies:
- HTML
- CSS

Location:
- Root HTML files
- assets/css/

This layer contains no business logic and no hardcoded project data.

---

### 2. Client Logic Layer

Responsible for dynamic rendering and client-side interaction.

Technology:
- Vanilla JavaScript

Location:
- assets/js/

Responsibilities:
- Fetch JSON data
- Render project and article cards
- Handle filtering and dynamic content updates

---

### 3. Content Engine

Responsible for automated content generation.

Technology:
- Python

Core Script:
- build_blog.py

Input:
- markdown_posts/

Output:
- posts/

Template System:
- templates/article_template.html

---

### 4. Deployment Layer

The site is deployed using GitHub Pages from the main branch.

Deployment platform:
- GitHub Pages

---

## Branching Strategy

- main → Production branch (deployed)
- dev → Active development branch
- feature/* → Feature-specific branches

All changes are developed in feature branches, merged into dev, and later promoted to main.

---

## Commit Convention

Semantic commit style is used:

- feat: new feature
- refactor: structural change without feature addition
- docs: documentation updates
- chore: maintenance tasks
- fix: bug fixes

---

## Roadmap

- v0.1 — Foundation
- v0.2 — Presentation Layer
- v0.3 — Dynamic Rendering
- v0.4 — Blog Engine
- v1.0 — Public Release
- v1.1 — Engineering Maturity

---

## Development Workflow

Initialize structure:

```
./setup_project.sh
```

Generate blog posts:

```
python build_blog.py
```

Deployment occurs automatically via GitHub Pages.

---

## Purpose

This repository is intentionally structured to reflect:

- Engineering mindset applied to content publishing
- Automation in technical writing
- Continuous ML study and experimentation
- Transparent development evolution

It serves both as a professional portfolio and as a living engineering artifact.