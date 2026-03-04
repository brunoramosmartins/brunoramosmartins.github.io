# Design System — Bruno Ramos Martins Portfolio

**Version:** v0.2 — Presentation Layer  
**Last updated:** 2025

---

## Philosophy

The visual standard targets an academic, minimal, and structured aesthetic — consistent with the reference design of CS50's OpenCourseWare notes (cs50.harvard.edu/web/notes/) but adapted for a multi-page engineering portfolio.

The guiding principle: **typography carries the weight**. Color, motion, and decoration are secondary to legibility, hierarchy, and structural clarity.

---

## Color Palette

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#ffffff` | Page background |
| `--color-surface` | `#f7f6f3` | Cards, code blocks, tags |
| `--color-border` | `#e2dfd9` | Dividers, card borders |
| `--color-text-primary` | `#1c1c1c` | Headings, body copy |
| `--color-text-secondary` | `#5c5c5c` | Body paragraphs, descriptions |
| `--color-text-muted` | `#8a8a8a` | Dates, labels, captions |
| `--color-accent` | `#1d3557` | Links, active nav, borders |
| `--color-accent-hover` | `#457b9d` | Hover state for links |
| `--color-code-bg` | `#f0ede8` | Inline code, pre blocks |

**Rationale:** White background + near-black text produces maximum contrast (WCAG AA compliant). The deep navy accent (`#1d3557`) conveys academic authority while remaining neutral enough not to distract from content. Warm off-whites (`#f7f6f3`, `#f0ede8`) prevent the interface from feeling sterile.

---

## Typography

### Font Families

| Token | Font | Fallbacks | Usage |
|---|---|---|---|
| `--font-serif` | IBM Plex Serif | Georgia, serif | All headings and body text |
| `--font-mono` | IBM Plex Mono | Courier New, monospace | Code, labels, dates, nav links, captions |

**Rationale:** IBM Plex Serif carries the dual identity of academic seriousness (serifs) and technical origin (IBM's engineering heritage). IBM Plex Mono reinforces the engineering context in metadata and UI labels. Both fonts belong to the same type family, ensuring visual cohesion.

### Type Scale

| Token | Value | px equivalent | Usage |
|---|---|---|---|
| `--text-xs` | `0.75rem` | 12px | Labels, tags, dates, mono UI |
| `--text-sm` | `0.875rem` | 14px | Captions, card descriptions, code |
| `--text-base` | `1rem` | 16px | Body paragraphs |
| `--text-lg` | `1.125rem` | 18px | Card titles, lead text |
| `--text-xl` | `1.25rem` | 20px | Section titles (h5 equivalent) |
| `--text-2xl` | `1.5rem` | 24px | h4 |
| `--text-3xl` | `1.875rem` | 30px | h3, article h2 |
| `--text-4xl` | `2.25rem` | 36px | h2, page titles |
| `--text-5xl` | `3rem` | 48px | h1, hero title |

### Font Weight Mapping

| Token | Value | Elements |
|---|---|---|
| `--weight-regular` | 400 | Body text, descriptions |
| `--weight-medium` | 500 | h5, h6, mono UI elements |
| `--weight-semibold` | 600 | h3, h4, card titles, section titles |
| `--weight-bold` | 700 | h1, h2, hero title |

### Line Heights

| Token | Value | Usage |
|---|---|---|
| `--leading-tight` | 1.25 | Headings |
| `--leading-snug` | 1.4 | Card titles |
| `--leading-normal` | 1.6 | — |
| `--leading-relaxed` | 1.75 | Body paragraphs, article prose |

---

## Spacing System

**Base unit: 8px**

All spacing values are multiples of 4px (half-unit) or 8px (base unit), producing a consistent vertical and horizontal rhythm.

| Token | Value | px | Usage |
|---|---|---|---|
| `--space-1` | `0.25rem` | 4px | Micro gaps |
| `--space-2` | `0.5rem` | 8px | Tag gaps, small gaps |
| `--space-3` | `0.75rem` | 12px | Tight internal spacing |
| `--space-4` | `1rem` | 16px | Paragraph margin, small padding |
| `--space-5` | `1.25rem` | 20px | — |
| `--space-6` | `1.5rem` | 24px | Card padding, container padding |
| `--space-8` | `2rem` | 32px | Nav gap, section gaps |
| `--space-10` | `2.5rem` | 40px | Section-header margin |
| `--space-12` | `3rem` | 48px | Footer padding |
| `--space-16` | `4rem` | 64px | Section padding |
| `--space-20` | `5rem` | 80px | Empty state padding |
| `--space-24` | `6rem` | 96px | Hero top padding |

### Container Widths

| Token | Value | Usage |
|---|---|---|
| `--container-max` | `780px` | Reading content (articles, about) |
| `--container-wide` | `1100px` | Full-page layout (header, footer, grids) |

**Rationale:** A 780px max-width for reading content is within the optimal line length range (60–80 characters per line at 16px). The wider container (1100px) allows the header and card grids to breathe on large screens.

### Section Padding Standard

- Page hero: `96px` top, `64px` bottom
- Page sections: `64px` top and bottom
- Page title (inner pages): `64px` top, `48px` bottom
- Cards: `24px` all sides
- Footer: `48px` top and bottom

---

## Responsive Breakpoints

| Breakpoint | Value | Changes |
|---|---|---|
| Desktop | `> 768px` | Full header nav, 2-column card grid, sidebar on about |
| Tablet/Mobile | `≤ 768px` | Hamburger nav, single-column grid, stacked about layout |
| Small mobile | `≤ 480px` | Hero title reduced to `--text-3xl` |

---

## Layout Decisions

- **Header:** Fixed at top (`64px` height), white background, 1px bottom border. Name on left, mono nav links on right. Active state indicated by accent-colored underline.
- **Card grid:** 1-column on mobile, 2-column on `≥ 640px`.
- **Article list:** Date column (88px) + content column, collapses to single column on mobile.
- **About page:** Sticky sidebar (220px) + content column, collapses on mobile.

---

## Accessibility Notes

- All interactive elements have visible focus states (inherited from browser defaults, not overridden).
- Nav toggle uses `aria-expanded` and `aria-controls`.
- Active nav links use `aria-current="page"`.
- Landmark elements: `<header>`, `<nav>`, `<main>`, `<footer>`, `<aside>`, `<article>`, `<section>`.
- Color contrast between `--color-text-primary` (`#1c1c1c`) and `--color-bg` (`#ffffff`): 18.1:1 — exceeds WCAG AAA.
- Color contrast between `--color-text-secondary` (`#5c5c5c`) and `--color-bg` (`#ffffff`): 7.0:1 — exceeds WCAG AA.
