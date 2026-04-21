#!/usr/bin/env python3
"""
build_blog.py — Static blog generator for brunoramosmartins.github.io

Converts Markdown files in markdown_posts/ into HTML pages and keeps
data/articles.json in sync automatically. Output directory is picked from
the `category` field in the front matter:
    category: til              → til/<id>.html
    any other category         → posts/<id>.html

Usage:
    python build_blog.py                        # build all posts
    python build_blog.py --file my_article.md   # build a single post
    python build_blog.py --dry-run              # preview metadata without writing
    python build_blog.py --prune                # remove orphan entries (.md gone)

Front matter format (YAML block between --- delimiters at the top of the file):

    --- Long-form article --------------------------------------------------
    title: "Article Title"
    description: "Short description shown in listings."
    date: 2026-03-15
    category: machine-learning
    reading_time: "8 min"
    tags: bayesian, evaluation          # optional, comma-separated
    related_til: slug-1, slug-2         # optional, comma-separated TIL slugs
    ---

    --- Short TIL note -----------------------------------------------------
    title: "Pipe is just function composition"
    description: "df.pipe(f).pipe(g) is g(f(df)) with readable chaining."
    date: 2026-04-21
    category: til
    tags: python, pandas                # optional but strongly recommended
    leads_to_article: slug-of-article   # optional, links to a future article
    ---

Supported categories: machine-learning, engineering, notes, til

Exit codes:
    0 — success
    1 — one or more articles failed to build
"""

import argparse
import json
import re
import sys
import uuid
from datetime import datetime
from pathlib import Path

try:
    import markdown
except ImportError:
    print(
        "Error: 'markdown' package not found.\n"
        "Install it with:  pip install markdown\n"
        "Or:               pip install -r requirements.txt"
    )
    sys.exit(1)

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

ROOT              = Path(__file__).parent
POSTS_DIR         = ROOT / "posts"
TIL_DIR           = ROOT / "til"
MD_DIR            = ROOT / "markdown_posts"
TEMPLATE_PATH     = ROOT / "templates" / "article_template.html"
TIL_TEMPLATE_PATH = ROOT / "templates" / "til_template.html"
ARTICLES_JSON     = ROOT / "data" / "articles.json"

TIL_CATEGORY = "til"

# ---------------------------------------------------------------------------
# Front matter parser
# ---------------------------------------------------------------------------

_FRONT_MATTER_RE = re.compile(r"^---\s*\n(.*?)\n---\s*(?:\n|$)", re.DOTALL)
_KV_LINE_RE      = re.compile(r'^(\w[\w_-]*):\s*"?(.*?)"?\s*$')


def parse_front_matter(source: str) -> tuple[dict, str]:
    """
    Splits a Markdown source into (metadata dict, body string).

    Raises ValueError if the front matter block is missing or a required
    field is absent.
    """
    match = _FRONT_MATTER_RE.match(source)
    if not match:
        raise ValueError(
            "Missing front matter. Every article must start with a --- block."
        )

    raw_fm = match.group(1)
    body   = source[match.end():]

    meta: dict[str, str] = {}
    for line in raw_fm.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        kv = _KV_LINE_RE.match(line)
        if kv:
            meta[kv.group(1)] = kv.group(2)

    required = ("title", "description", "date", "category")
    missing  = [f for f in required if f not in meta]
    if missing:
        raise ValueError(f"Front matter is missing required fields: {missing}")

    return meta, body


# ---------------------------------------------------------------------------
# Date formatting
# ---------------------------------------------------------------------------

def format_date_display(date_str: str) -> str:
    """'2026-03-15'  →  'Mar 2026'"""
    try:
        dt = datetime.strptime(date_str.strip(), "%Y-%m-%d")
        return dt.strftime("%b %Y")
    except ValueError:
        return date_str


# ---------------------------------------------------------------------------
# LaTeX math protection (pre/post-processing)
# ---------------------------------------------------------------------------

def protect_math(text: str) -> tuple[str, list[tuple[str, str]]]:
    """
    Replace $$...$$ and $...$ with UUID placeholders before markdown parsing.

    This prevents python-markdown from interpreting LaTeX characters
    (_, *, |, {}) as formatting. Display math ($$) is processed first
    to avoid partial matches with inline math ($).
    """
    placeholders: list[tuple[str, str]] = []

    # Display math first ($$...$$) — may span multiple lines
    def _replace_display(m: re.Match) -> str:
        ph = f"MATHBLOCK{uuid.uuid4().hex}"
        placeholders.append((ph, m.group(0)))
        return ph

    text = re.sub(r"\$\$(.+?)\$\$", _replace_display, text, flags=re.DOTALL)

    # Inline math ($...$) — single line, non-greedy
    def _replace_inline(m: re.Match) -> str:
        ph = f"MATHINLINE{uuid.uuid4().hex}"
        placeholders.append((ph, m.group(0)))
        return ph

    text = re.sub(r"(?<!\$)\$(?!\$)(.+?)(?<!\$)\$(?!\$)", _replace_inline, text)

    return text, placeholders


def restore_math(html: str, placeholders: list[tuple[str, str]]) -> str:
    """Reinject original LaTeX strings in place of UUID placeholders."""
    for ph, original in placeholders:
        html = html.replace(ph, original)
    return html


# ---------------------------------------------------------------------------
# Post-processing: semantic figures
# ---------------------------------------------------------------------------

def wrap_figures(html: str) -> str:
    """
    Convert bare <p><img></p> blocks into semantic <figure> elements
    with <figcaption> derived from the alt text.
    """
    pattern = r'<p>\s*<img\s+alt="([^"]*?)"\s+src="([^"]*?)"\s*/?\s*>\s*</p>'
    replacement = (
        '<figure>'
        '<img src="\\2" alt="\\1" loading="lazy">'
        '<figcaption>\\1</figcaption>'
        '</figure>'
    )
    return re.sub(pattern, replacement, html)


# ---------------------------------------------------------------------------
# Template rendering
# ---------------------------------------------------------------------------

def _slug_to_title(slug: str) -> str:
    """'softmax-derivative-demystified' → 'Softmax derivative demystified'."""
    return slug.replace("-", " ").replace("_", " ").capitalize()


def _split_csv(value: str) -> list[str]:
    """Splits a comma-separated front matter value into a trimmed list."""
    if not value:
        return []
    return [item.strip() for item in value.split(",") if item.strip()]


def _render_cross_link_box(meta: dict) -> str:
    """
    Renders the cross-link box for an article or TIL:
      - TIL: 'Expanded in: <article>'           (from leads_to_article)
      - Article: 'Builds on: <til>, <til>'      (from related_til)
    Returns '' when no cross-link is declared.
    """
    category = meta.get("category", "")

    if category == TIL_CATEGORY:
        target = meta.get("leads_to_article", "").strip()
        if not target:
            return ""
        url = f"../posts/{target}.html"
        label = _slug_to_title(target)
        return (
            '<aside class="cross-link cross-link--til" aria-label="Related article">'
            '<span class="cross-link__label">Expanded in</span>'
            f'<a class="cross-link__link" href="{url}">{label}</a>'
            '</aside>'
        )

    related = _split_csv(meta.get("related_til", ""))
    if not related:
        return ""
    links = "".join(
        f'<a class="cross-link__link" href="../til/{slug}.html">{_slug_to_title(slug)}</a>'
        for slug in related
    )
    return (
        '<aside class="cross-link cross-link--article" aria-label="Related TILs">'
        '<span class="cross-link__label">Builds on</span>'
        f'<div class="cross-link__list">{links}</div>'
        '</aside>'
    )


def render_template(template: str, meta: dict, html_body: str) -> str:
    """Replaces {{placeholder}} tokens in the template with real values."""
    # Category tag (primary classification)
    category_tag = (
        f'<span class="tag" data-category="{meta["category"]}">{meta["category"]}</span>'
        if meta.get("category") else ""
    )

    # Free-form tags (optional, comma-separated in front matter)
    tag_spans = "".join(
        f'<span class="tag">{t}</span>'
        for t in _split_csv(meta.get("tags", ""))
    )
    tags_html = category_tag + tag_spans

    replacements = {
        "{{article_id}}":          meta["id"],
        "{{article_title}}":       meta["title"],
        "{{article_description}}": meta["description"],
        "{{article_date_iso}}":    meta["date"],
        "{{article_date}}":        format_date_display(meta["date"]),
        "{{article_tags}}":        tags_html,
        "{{article_content}}":     html_body,
        "{{cross_link_box}}":      _render_cross_link_box(meta),
    }

    result = template
    for placeholder, value in replacements.items():
        result = result.replace(placeholder, value)
    return result


# ---------------------------------------------------------------------------
# articles.json sync
# ---------------------------------------------------------------------------

def load_articles_json() -> list[dict]:
    if not ARTICLES_JSON.exists():
        return []
    with ARTICLES_JSON.open(encoding="utf-8") as f:
        return json.load(f)


def save_articles_json(articles: list[dict]) -> None:
    with ARTICLES_JSON.open("w", encoding="utf-8") as f:
        json.dump(articles, f, ensure_ascii=False, indent=2)
    print(f"  [ok] Updated {ARTICLES_JSON.relative_to(ROOT)}")


def upsert_article_entry(articles: list[dict], meta: dict) -> list[dict]:
    """
    Inserts or updates the entry for this article in the list.
    Entries are sorted by date descending after the update.

    TIL entries live under /til/<id>.html; regular articles under /posts/<id>.html.
    """
    is_til = meta.get("category") == TIL_CATEGORY
    url    = f"/til/{meta['id']}.html" if is_til else f"/posts/{meta['id']}.html"

    entry = {
        "id":           meta["id"],
        "title":        meta["title"],
        "description":  meta["description"],
        "category":     meta["category"],
        "date":         meta["date"],
        "reading_time": meta.get("reading_time", ""),
        "tags":         _split_csv(meta.get("tags", "")),
        "url":          url,
    }

    updated = [a for a in articles if a.get("id") != meta["id"]]
    updated.append(entry)
    updated.sort(key=lambda a: a.get("date", ""), reverse=True)
    return updated


# ---------------------------------------------------------------------------
# Single article builder
# ---------------------------------------------------------------------------

def build_article(md_path: Path, templates: dict[str, str], dry_run: bool = False) -> dict | None:
    """
    Builds one article (or TIL). Returns the metadata dict on success, None on failure.

    `templates` is a dict: {"article": <str>, "til": <str>}. The correct one is
    picked based on the `category` field in the front matter.
    """
    print(f"\nProcessing: {md_path.name}")

    try:
        source = md_path.read_text(encoding="utf-8")
    except OSError as exc:
        print(f"  [fail] Could not read file: {exc}")
        return None

    try:
        meta, body = parse_front_matter(source)
    except ValueError as exc:
        print(f"  [fail] Front matter error: {exc}")
        return None

    # Derive article id from filename if not provided in front matter
    meta.setdefault("id", md_path.stem)

    is_til      = meta.get("category") == TIL_CATEGORY
    template    = templates["til"] if is_til else templates["article"]
    output_dir  = TIL_DIR if is_til else POSTS_DIR
    output_rel  = f"{output_dir.name}/{meta['id']}.html"

    # Protect LaTeX math from markdown parser
    protected_body, math_placeholders = protect_math(body)

    html_body = markdown.markdown(
        protected_body,
        extensions=["fenced_code", "codehilite", "tables", "toc", "nl2br"],
        extension_configs={
            "codehilite": {"css_class": "highlight", "guess_lang": False},
        },
    )

    # Restore LaTeX and convert images to semantic figures
    html_body = restore_math(html_body, math_placeholders)
    html_body = wrap_figures(html_body)

    output_html = render_template(template, meta, html_body)

    print(f"  title    : {meta['title']}")
    print(f"  category : {meta['category']}")
    print(f"  date     : {meta['date']}")
    print(f"  output   : {output_rel}")

    if dry_run:
        print("  [dry-run] — no files written")
        return meta

    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"{meta['id']}.html"
    try:
        output_path.write_text(output_html, encoding="utf-8")
        print(f"  [ok] Written to {output_path.relative_to(ROOT)}")
    except OSError as exc:
        print(f"  [fail] Could not write output: {exc}")
        return None

    return meta


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Static blog generator — Markdown → HTML + articles.json"
    )
    parser.add_argument(
        "--file", "-f",
        metavar="FILENAME",
        help="Build a single Markdown file from markdown_posts/ (e.g. my_post.md)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Parse and preview metadata without writing any files",
    )
    parser.add_argument(
        "--prune",
        action="store_true",
        help="Remove orphan entries from articles.json (and their HTML) "
             "whose .md source no longer exists in markdown_posts/",
    )
    return parser.parse_args()


def prune_orphans() -> int:
    """Remove articles.json entries (and HTML files) whose .md source is gone."""
    articles = load_articles_json()
    if not articles:
        print("Nothing to prune — articles.json is empty.")
        return 0

    existing_stems = {p.stem for p in MD_DIR.glob("*.md")}
    orphans = [a for a in articles if a["id"] not in existing_stems]

    if not orphans:
        print("No orphan entries found.")
        return 0

    for entry in orphans:
        print(f"  Removing orphan: {entry['id']}")
        is_til    = entry.get("category") == TIL_CATEGORY
        html_path = (TIL_DIR if is_til else POSTS_DIR) / f"{entry['id']}.html"
        if html_path.exists():
            html_path.unlink()
            print(f"    Deleted {html_path.relative_to(ROOT)}")

    kept = [a for a in articles if a["id"] in existing_stems]
    save_articles_json(kept)
    print(f"Pruned {len(orphans)} orphan(s).")
    return 0


def main() -> int:
    args = parse_args()

    # Validate paths
    for path, label in [
        (MD_DIR,            "markdown_posts/"),
        (POSTS_DIR,         "posts/"),
        (TEMPLATE_PATH,     "templates/article_template.html"),
        (TIL_TEMPLATE_PATH, "templates/til_template.html"),
        (ARTICLES_JSON.parent, "data/"),
    ]:
        if not path.exists():
            print(f"Error: Required path not found: {path}")
            print(f"       Expected '{label}' to exist in the project root.")
            return 1

    # Prune mode
    if args.prune:
        return prune_orphans()

    # Load both templates — category in front matter decides which is used.
    templates = {
        "article": TEMPLATE_PATH.read_text(encoding="utf-8"),
        "til":     TIL_TEMPLATE_PATH.read_text(encoding="utf-8"),
    }

    # Resolve target files
    if args.file:
        target = MD_DIR / args.file
        if not target.exists():
            print(f"Error: File not found: {target}")
            return 1
        md_files = [target]
    else:
        md_files = sorted(MD_DIR.glob("*.md"))
        if not md_files:
            print("No Markdown files found in markdown_posts/. Nothing to build.")
            return 0

    print(f"Building {len(md_files)} article(s)...")

    # Build each article
    articles    = load_articles_json()
    failed      = 0
    built_metas = []

    for md_path in md_files:
        meta = build_article(md_path, templates, dry_run=args.dry_run)
        if meta is None:
            failed += 1
        else:
            built_metas.append(meta)

    # Update articles.json
    if not args.dry_run and built_metas:
        for meta in built_metas:
            articles = upsert_article_entry(articles, meta)
        save_articles_json(articles)

    # Summary
    total  = len(md_files)
    passed = total - failed
    print(f"\nDone: {passed}/{total} article(s) built successfully.")
    if failed:
        print(f"      {failed} article(s) failed — check output above.")

    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
