#!/usr/bin/env bash
# ============================================================
# create-roadmap.sh
# Creates GitHub milestones (v0.7–v1.0) and associated issues
# for the portfolio project roadmap.
#
# Usage:
#   chmod +x scripts/create-roadmap.sh
#   ./scripts/create-roadmap.sh
#
# Prerequisites:
#   - gh CLI authenticated (gh auth status)
#   - Run from repository root
# ============================================================

set -euo pipefail

REPO="brunoramosmartins/brunoramosmartins.github.io"

echo "============================================"
echo "  Portfolio Roadmap — Milestones & Issues"
echo "============================================"
echo ""

# ----------------------------------------------------------
# STEP 0: Close implemented issues (v0.5)
# ----------------------------------------------------------
echo "--- Closing implemented v0.5 issues ---"

gh issue close 29 --repo "$REPO" --comment "Implemented in feature/ux-polish — loading spinner added to all data-fetching pages."
gh issue close 30 --repo "$REPO" --comment "Implemented in feature/ux-polish — skip-to-content link added to all 6 HTML pages."
gh issue close 31 --repo "$REPO" --comment "Implemented in feature/ux-polish — nav links now close mobile menu on click."
gh issue close 32 --repo "$REPO" --comment "Already implemented — Google Fonts URL includes display=swap parameter on all pages."

echo ""
echo "--- Closing duplicate issues ---"

gh issue close 34 --repo "$REPO" --reason "not planned" --comment "Duplicate of #37."
gh issue close 35 --repo "$REPO" --reason "not planned" --comment "Duplicate of #38."
gh issue close 36 --repo "$REPO" --reason "not planned" --comment "Duplicate of #39."

echo ""

# ----------------------------------------------------------
# STEP 1: Create labels (idempotent — skips if exists)
# ----------------------------------------------------------
echo "--- Creating labels ---"

create_label() {
  gh label create "$1" --description "$2" --color "$3" --repo "$REPO" 2>/dev/null \
    && echo "  Created label: $1" \
    || echo "  Label exists: $1"
}

create_label "type:feature"       "New feature or page"                    "0E8A16"
create_label "type:automation"    "CI/CD, GitHub Actions, scripts"         "1D76DB"
create_label "type:content"       "Content creation (articles, reading)"   "D4C5F9"
create_label "type:docs"          "Documentation updates"                  "0075CA"
create_label "page:resume"        "Resume/CV page"                         "FBCA04"
create_label "page:reading"       "Reading list page"                      "FBCA04"
create_label "page:til"           "TIL / Short notes page"                 "FBCA04"
create_label "page:news"          "News feed page"                         "FBCA04"

echo ""

# ----------------------------------------------------------
# STEP 2: Create milestones
# ----------------------------------------------------------
echo "--- Creating milestones ---"

create_milestone() {
  local title="$1"
  local desc="$2"
  gh api repos/$REPO/milestones \
    --method POST \
    -f title="$title" \
    -f description="$desc" \
    -f state="open" \
    --jq '.number' 2>/dev/null \
    && echo "  Created milestone: $title" \
    || echo "  Milestone may already exist: $title"
}

M7=$(create_milestone "v0.7 — CV/Resume & Reading List" "$(cat <<'EOF'
Add two new JSON-driven pages to the portfolio: a professional CV/Resume page and a curated Reading List.

**Goals:**
- Provide recruiters a clean, printable resume page with PDF download
- Showcase continuous learning with a curated reading list (papers, books, courses)
- Follow the same architectural pattern: JSON data → JS rendering → static HTML shell

**Acceptance criteria:**
- `resume.html` renders CV from `data/resume.json` with print-friendly CSS
- `reading.html` renders reading list from `data/reading.json` with category filters
- Both pages include skip-to-content, loading spinner, and responsive design
- Navigation updated across all pages to include new links
- No regression in existing functionality
EOF
)")

M8=$(create_milestone "v0.8 — TIL / Short Notes" "$(cat <<'EOF'
Extend the blog engine to support short-form content (Today I Learned / quick notes). These are 2-5 minute reads that allow frequent publishing without the pressure of a full article.

**Goals:**
- Lower the barrier to publish content regularly
- Demonstrate continuous learning and experimentation
- Reuse the existing build_blog.py pipeline with minimal changes

**Acceptance criteria:**
- TIL posts use the same markdown pipeline (build_blog.py) with category `til`
- New `til.html` page lists TIL entries with date and tag filters
- TIL entries are visually distinct from full articles (shorter card, no reading_time)
- Navigation updated to include TIL link
- At least 2 TIL posts published to validate the pipeline
EOF
)")

M9=$(create_milestone "v0.9 — Automated News Feed" "$(cat <<'EOF'
Add a curated, automatically updated news feed page powered by GitHub Actions. A scheduled workflow fetches content from configured RSS/API sources and generates a static JSON file that the frontend renders.

**Goals:**
- Demonstrate CI/CD automation and editorial curation skills
- Keep the portfolio alive with fresh content without manual effort
- Showcase GitHub Actions as a free "serverless backend" for static sites

**Acceptance criteria:**
- GitHub Action runs on schedule (daily) and on manual dispatch
- Python script fetches from configured RSS feeds (arxiv, ML blogs, etc.)
- Generates `data/news.json` with title, source, date, URL, and category
- `news.html` renders the feed with source filters and date grouping
- Action commits updated JSON automatically (no manual step)
- Fallback: page shows last cached data if Action fails
EOF
)")

echo ""

# ----------------------------------------------------------
# STEP 3: Get milestone numbers
# ----------------------------------------------------------
echo "--- Resolving milestone numbers ---"

get_milestone_number() {
  gh api repos/$REPO/milestones --jq ".[] | select(.title | startswith(\"$1\")) | .number"
}

M7_NUM=$(get_milestone_number "v0.7")
M8_NUM=$(get_milestone_number "v0.8")
M9_NUM=$(get_milestone_number "v0.9")
M10_NUM=$(get_milestone_number "v1.0")

echo "  v0.7 = #$M7_NUM"
echo "  v0.8 = #$M8_NUM"
echo "  v0.9 = #$M9_NUM"
echo "  v1.0 = #$M10_NUM"
echo ""

# ----------------------------------------------------------
# STEP 4: Create issues
# ----------------------------------------------------------
echo "--- Creating issues ---"

# ===================== v0.7 ISSUES =====================

echo ""
echo "=== v0.7 — CV/Resume & Reading List ==="

gh issue create --repo "$REPO" \
  --title "Create resume.html page with JSON-driven CV rendering" \
  --milestone "$M7_NUM" \
  --label "type:feature,page:resume,priority:high" \
  --body "$(cat <<'EOF'
## Objective

Create a professional CV/Resume page that renders structured data from `data/resume.json`, following the same architectural pattern as the projects and articles pages.

## Requirements

- [ ] Create `data/resume.json` with sections: summary, experience, education, skills, certifications, publications
- [ ] Create `resume.html` shell page with `data-page="resume"` attribute
- [ ] Create `assets/js/resumeRenderer.js` module that fetches and renders the JSON
- [ ] Add print-friendly CSS (`@media print`) that hides nav/footer and optimizes layout for A4
- [ ] Add a "Download PDF" button that triggers `window.print()` (or link to a pre-generated PDF)
- [ ] Include skip-to-content link and loading spinner (reuse existing components)
- [ ] Update navigation links on all pages to include "Resume"
- [ ] Responsive: single-column on mobile, two-column (sidebar + content) on desktop

## Design notes

- Follow the existing design system (IBM Plex fonts, CSS variables, spacing scale)
- Timeline layout for experience/education (date on left, content on right)
- Skills as tag components (reuse `.tag` class)

## Acceptance criteria

- Page renders correctly from JSON data
- Print preview produces a clean, single-page (or two-page) CV
- Navigation links work from all pages
- No regression in existing pages
EOF
)"
echo "  Created: resume.html issue"

gh issue create --repo "$REPO" \
  --title "Create reading.html page with curated reading list" \
  --milestone "$M7_NUM" \
  --label "type:feature,page:reading,priority:high" \
  --body "$(cat <<'EOF'
## Objective

Create a Reading List page that showcases papers, books, and courses the author has read or is reading. Data-driven via `data/reading.json`, with category filtering.

## Requirements

- [ ] Create `data/reading.json` with schema: `{ id, title, author, type (paper|book|course), category, url, status (read|reading|queued), date_added, notes }`
- [ ] Create `reading.html` shell page with `data-page="reading"` attribute
- [ ] Create `assets/js/readingRenderer.js` module
- [ ] Dynamic filter buttons by type (All, Papers, Books, Courses) — reuse `buildCategoryButtons` pattern from `filters.js`
- [ ] Each entry shows: title (linked), author, type badge, status indicator, optional short note
- [ ] Include skip-to-content link and loading spinner
- [ ] Update navigation links on all pages
- [ ] Responsive card or list layout

## Design notes

- Status indicators: green dot (read), yellow dot (reading), grey dot (queued)
- Type badges reuse `.tag` styling
- Sort by `date_added` descending (most recent first)

## Acceptance criteria

- Page renders at least 5 seed entries from JSON
- Filters work correctly for each type
- Status indicators are visually distinct
- Navigation links work from all pages
EOF
)"
echo "  Created: reading.html issue"

gh issue create --repo "$REPO" \
  --title "Update global navigation to include Resume and Reading links" \
  --milestone "$M7_NUM" \
  --label "type:feature,priority:medium" \
  --body "$(cat <<'EOF'
## Objective

Add "Resume" and "Reading" links to the site navigation across all pages.

## Requirements

- [ ] Update `<nav>` in: `index.html`, `projects.html`, `articles.html`, `about.html`, `templates/article_template.html`
- [ ] Add `resume.html` and `reading.html` links after "Articles" and before "About"
- [ ] Update `aria-current="page"` attribute on new pages
- [ ] Verify mobile nav still works correctly with additional links
- [ ] Verify hamburger menu closes on link click (existing behavior)

## Notes

- Navigation order: Home | Projects | Articles | Resume | Reading | About
- Consider if 6 links is too many for mobile — may need a dropdown or two-row layout at 480px
EOF
)"
echo "  Created: navigation update issue"

# ===================== v0.8 ISSUES =====================

echo ""
echo "=== v0.8 — TIL / Short Notes ==="

gh issue create --repo "$REPO" \
  --title "Add TIL category support to build_blog.py" \
  --milestone "$M8_NUM" \
  --label "type:feature,page:til,priority:high" \
  --body "$(cat <<'EOF'
## Objective

Extend the blog engine to handle TIL (Today I Learned) posts as a distinct content type, using the existing markdown pipeline.

## Requirements

- [ ] TIL posts live in `markdown_posts/` with front matter `category: til`
- [ ] build_blog.py generates TIL HTML to `posts/` (same as articles)
- [ ] TIL entries are added to `data/articles.json` with category `til`
- [ ] Optionally: create a separate `data/til.json` if we want to keep the listing separate from full articles
- [ ] TIL front matter has relaxed requirements: `reading_time` not needed (auto-calculated or omitted)

## Design decision

**Option A:** TIL posts are articles with `category: til` — simplest, reuses everything.
**Option B:** Separate `data/til.json` and `til_template.html` — cleaner separation but more code.

Recommend **Option A** for now. The `til.html` page filters articles by `category === "til"`.

## Acceptance criteria

- `python build_blog.py --file til-post.md` builds correctly
- TIL entry appears in `data/articles.json` with category `til`
- Existing article builds are not affected
EOF
)"
echo "  Created: TIL build support issue"

gh issue create --repo "$REPO" \
  --title "Create til.html page for short notes listing" \
  --milestone "$M8_NUM" \
  --label "type:feature,page:til,priority:high" \
  --body "$(cat <<'EOF'
## Objective

Create a TIL (Today I Learned) page that lists short-form notes, filtered from the articles data.

## Requirements

- [ ] Create `til.html` shell page with `data-page="til"` attribute
- [ ] Fetch articles from `data/articles.json` and filter where `category === "til"`
- [ ] Render as compact cards: title, date, 1-2 line excerpt (no reading_time)
- [ ] Tag-based sub-filtering if TIL posts have varied tags (e.g., python, linux, ml)
- [ ] Include skip-to-content link and loading spinner
- [ ] Add "TIL" link to global navigation

## Design notes

- More compact than articles page — shorter cards, tighter spacing
- Consider a timeline/feed layout (date on left, content on right)
- Show total count: "12 notes" at the top

## Acceptance criteria

- Page renders TIL entries only (not full articles)
- Filters work
- At least 2 TIL posts published as seed content
EOF
)"
echo "  Created: til.html page issue"

gh issue create --repo "$REPO" \
  --title "Write and publish 2 seed TIL posts" \
  --milestone "$M8_NUM" \
  --label "type:content,page:til,priority:medium" \
  --body "$(cat <<'EOF'
## Objective

Write and publish at least 2 TIL posts to validate the pipeline and provide seed content for the TIL page.

## Suggested topics

Pick 2 from your recent work:

1. **TIL: Krippendorff's Alpha vs Cohen's Kappa** — quick comparison of when to use each for inter-annotator agreement
2. **TIL: LightGBM early_stopping gotcha** — the `eval_set` ordering matters for which metric is monitored
3. **TIL: GitHub Actions schedule cron is UTC** — timezone pitfall when scheduling daily jobs
4. **TIL: Survival analysis vs classification** — when to frame a problem as time-to-event instead of binary
5. **TIL: Pandera schema validation** — how to catch data drift before it reaches the model

## Requirements

- [ ] Each post is 2-5 minute read (300-800 words)
- [ ] Front matter with `category: til` and relevant tags
- [ ] At least one post includes a code snippet to test syntax highlighting
- [ ] Build with `python build_blog.py` and verify rendering

## Acceptance criteria

- 2 TIL posts visible on `til.html`
- Syntax highlighting works in code blocks
- Posts don't appear mixed with full articles on `articles.html` (filtered by category)
EOF
)"
echo "  Created: seed TIL posts issue"

# ===================== v0.9 ISSUES =====================

echo ""
echo "=== v0.9 — Automated News Feed ==="

gh issue create --repo "$REPO" \
  --title "Create Python script to fetch and curate RSS feeds" \
  --milestone "$M9_NUM" \
  --label "type:automation,page:news,priority:high" \
  --body "$(cat <<'EOF'
## Objective

Create a Python script (`scripts/fetch_news.py`) that fetches articles from configured RSS feeds and generates a static `data/news.json` file.

## Requirements

- [ ] Read feed URLs from a config file (`scripts/feeds.yaml` or `scripts/feeds.json`)
- [ ] Parse RSS/Atom feeds using `feedparser` library
- [ ] Extract: title, source name, published date, URL, summary (truncated to 200 chars)
- [ ] Auto-categorize by source (e.g., arxiv → "papers", blog → "engineering")
- [ ] Deduplicate entries by URL
- [ ] Keep only last 30 days of entries (configurable)
- [ ] Sort by date descending
- [ ] Write to `data/news.json`
- [ ] Add `feedparser` to `requirements.txt`

## Suggested initial feeds

- arxiv.org CS.LG (Machine Learning)
- arxiv.org CS.AI (Artificial Intelligence)
- Google AI Blog RSS
- OpenAI Blog RSS
- Towards Data Science (Medium RSS)
- MLOps Community Blog

## Error handling

- If a feed is unreachable, log warning and skip (don't fail entire run)
- If no new entries, keep existing `data/news.json` unchanged

## Acceptance criteria

- `python scripts/fetch_news.py` generates valid `data/news.json`
- At least 3 feed sources configured
- Script handles feed failures gracefully
EOF
)"
echo "  Created: RSS fetch script issue"

gh issue create --repo "$REPO" \
  --title "Create GitHub Action to run news feed on daily schedule" \
  --milestone "$M9_NUM" \
  --label "type:automation,page:news,priority:high" \
  --body "$(cat <<'EOF'
## Objective

Create a GitHub Actions workflow that runs the news feed script daily and commits the updated `data/news.json` automatically.

## Requirements

- [ ] Create `.github/workflows/update-news.yml`
- [ ] Schedule: `cron: '0 8 * * *'` (daily at 08:00 UTC)
- [ ] Also support `workflow_dispatch` for manual triggering
- [ ] Steps: checkout → setup Python → install deps → run fetch_news.py → commit & push if changed
- [ ] Commit message: `chore(news): update news feed [skip ci]`
- [ ] Use `actions/checkout` with `token: secrets.GITHUB_TOKEN` for push permissions
- [ ] Only commit if `data/news.json` actually changed (avoid empty commits)

## Workflow structure

```yaml
name: Update News Feed
on:
  schedule:
    - cron: '0 8 * * *'
  workflow_dispatch:
jobs:
  update-feed:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: pip install -r requirements.txt
      - run: python scripts/fetch_news.py
      - name: Commit if changed
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git diff --quiet data/news.json || \
            (git add data/news.json && git commit -m "chore(news): update news feed [skip ci]" && git push)
```

## Acceptance criteria

- Action runs successfully on manual dispatch
- `data/news.json` is updated and committed automatically
- No empty commits when feed has no changes
- Action logs show which feeds were fetched
EOF
)"
echo "  Created: GitHub Action issue"

gh issue create --repo "$REPO" \
  --title "Create news.html page with source filtering and date grouping" \
  --milestone "$M9_NUM" \
  --label "type:feature,page:news,priority:high" \
  --body "$(cat <<'EOF'
## Objective

Create a News Feed page that renders curated articles from `data/news.json` with source filtering and date-based grouping.

## Requirements

- [ ] Create `news.html` shell page with `data-page="news"` attribute
- [ ] Create `assets/js/newsRenderer.js` module
- [ ] Fetch from `data/news.json` and render as a feed
- [ ] Group entries by date (Today, Yesterday, This Week, Older)
- [ ] Dynamic filter buttons by source/category (All, Papers, Engineering, AI News)
- [ ] Each entry: title (linked to external URL), source badge, date, summary snippet
- [ ] External links open in new tab with `rel="noopener noreferrer"`
- [ ] Include skip-to-content link and loading spinner
- [ ] Update global navigation to include "News" link
- [ ] Show "Last updated: [date]" at top of page

## Design notes

- Feed layout (no grid — single column, timeline style)
- Source badges use `.tag` styling with distinct colors per source
- Compact entries — title + source + date on one line, summary below
- Empty state: "No news entries yet. Feed updates daily."

## Acceptance criteria

- Page renders news entries grouped by date
- Source filters work correctly
- External links work and open in new tabs
- Page shows gracefully when `data/news.json` is empty
EOF
)"
echo "  Created: news.html page issue"

# ===================== v1.0 UPDATE =====================

echo ""
echo "=== v1.0 — Public Release (existing milestone) ==="

gh issue create --repo "$REPO" \
  --title "Final navigation audit and consistency check across all pages" \
  --milestone "$M10_NUM" \
  --label "type:docs,priority:medium,ux" \
  --body "$(cat <<'EOF'
## Objective

Verify that all pages (including new ones from v0.7–v0.9) have consistent navigation, meta tags, accessibility features, and responsive behavior.

## Checklist

- [ ] All pages have identical navigation links in the same order
- [ ] `aria-current="page"` is set correctly on each page
- [ ] Skip-to-content link present on every page
- [ ] Loading spinner on every dynamic page
- [ ] Open Graph meta tags on every page
- [ ] Mobile nav works on all pages (toggle + auto-close)
- [ ] Footer links consistent across all pages
- [ ] No console errors on any page
- [ ] Print styles work on resume page

## Acceptance criteria

- Full manual walkthrough of all pages passes
- No inconsistencies in navigation, accessibility, or meta tags
EOF
)"
echo "  Created: navigation audit issue"

echo ""
echo "============================================"
echo "  Done! All milestones and issues created."
echo "============================================"
echo ""
echo "Summary:"
echo "  - Closed 4 implemented issues (#29-#32)"
echo "  - Closed 3 duplicate issues (#34-#36)"
echo "  - Created 3 new milestones (v0.7, v0.8, v0.9)"
echo "  - Created 10 new issues across v0.7-v1.0"
echo ""
echo "View your roadmap:"
echo "  gh issue list --repo $REPO --state open"
echo "  gh api repos/$REPO/milestones --jq '.[] | {title, open_issues, state}'"
