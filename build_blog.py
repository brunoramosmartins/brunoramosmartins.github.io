#!/usr/bin/env python3
"""
build_blog.py — Static blog generator for brunoramosmartins.github.io

Converts Markdown articles in markdown_posts/ into HTML pages in posts/ and
keeps data/articles.json in sync automatically.

Usage:
    python build_blog.py                        # build all posts
    python build_blog.py --file my_article.md   # build a single post
    python build_blog.py --dry-run              # preview metadata without writing

Front matter format (YAML block between --- delimiters at the top of the file):
    ---
    title: "Article Title"
    description: "Short description shown in listings."
    date: 2026-03-15
    category: machine-learning
    reading_time: "8 min"
    ---

    # Article content starts here

Supported categories: machine-learning, engineering, notes

Exit codes:
    0 — success
    1 — one or more articles failed to build
"""

import argparse
import json
import re
import sys
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

ROOT          = Path(__file__).parent
POSTS_DIR     = ROOT / "posts"
MD_DIR        = ROOT / "markdown_posts"
TEMPLATE_PATH = ROOT / "templates" / "article_template.html"
ARTICLES_JSON = ROOT / "data" / "articles.json"

# ---------------------------------------------------------------------------
# Front matter parser
# ---------------------------------------------------------------------------

_FRONT_MATTER_RE = re.compile(r"^---\s*\n(.*?)\n---\s*\n", re.DOTALL)
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
# Template rendering
# ---------------------------------------------------------------------------

def render_template(template: str, meta: dict, html_body: str) -> str:
    """Replaces {{placeholder}} tokens in the template with real values."""
    tags_html = "".join(
        f'<span class="tag">{t.strip()}</span>'
        for t in meta.get("category", "").split(",")
        if t.strip()
    )

    replacements = {
        "{{article_id}}":          meta["id"],
        "{{article_title}}":       meta["title"],
        "{{article_description}}": meta["description"],
        "{{article_date_iso}}":    meta["date"],
        "{{article_date}}":        format_date_display(meta["date"]),
        "{{article_tags}}":        tags_html,
        "{{article_content}}":     html_body,
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
    """
    entry = {
        "id":           meta["id"],
        "title":        meta["title"],
        "description":  meta["description"],
        "category":     meta["category"],
        "date":         meta["date"],
        "reading_time": meta.get("reading_time", ""),
        "url":          f"/posts/{meta['id']}.html",
    }

    updated = [a for a in articles if a.get("id") != meta["id"]]
    updated.append(entry)
    updated.sort(key=lambda a: a.get("date", ""), reverse=True)
    return updated


# ---------------------------------------------------------------------------
# Single article builder
# ---------------------------------------------------------------------------

def build_article(md_path: Path, template: str, dry_run: bool = False) -> dict | None:
    """
    Builds one article. Returns the metadata dict on success, None on failure.
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

    html_body = markdown.markdown(
        body,
        extensions=["fenced_code", "tables", "toc", "nl2br"],
    )

    output_html = render_template(template, meta, html_body)

    print(f"  title    : {meta['title']}")
    print(f"  category : {meta['category']}")
    print(f"  date     : {meta['date']}")
    print(f"  output   : posts/{meta['id']}.html")

    if dry_run:
        print("  [dry-run] — no files written")
        return meta

    output_path = POSTS_DIR / f"{meta['id']}.html"
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
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    # Validate paths
    for path, label in [
        (MD_DIR,        "markdown_posts/"),
        (POSTS_DIR,     "posts/"),
        (TEMPLATE_PATH, "templates/article_template.html"),
        (ARTICLES_JSON.parent, "data/"),
    ]:
        if not path.exists():
            print(f"Error: Required path not found: {path}")
            print(f"       Expected '{label}' to exist in the project root.")
            return 1

    # Load template
    template = TEMPLATE_PATH.read_text(encoding="utf-8")

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
        meta = build_article(md_path, template, dry_run=args.dry_run)
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
