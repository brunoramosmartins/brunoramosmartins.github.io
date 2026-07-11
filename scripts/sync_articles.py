#!/usr/bin/env python3
"""
sync_articles.py — Pull article sources from their GitHub repositories.

Each article lives in its own repo (single source of truth). This script
downloads the article Markdown and every figure it references, namespaces
the figures per article (figures/<slug>/), rewrites the image paths, and
writes the result to markdown_posts/<slug>.md.

The list of articles is data/sources.json:

    {
      "owner": "brunoramosmartins",
      "branch": "main",
      "articles": [
        {"slug": "monte-carlo-budget",
         "repo": "monte-carlo-budget-article",
         "path": "article/monte-carlo-budget.md"}
      ]
    }

Per-article "owner" and "branch" keys override the top-level defaults.
To register a new article, add one entry — nothing else changes.

Usage:
    python scripts/sync_articles.py                  # sync everything
    python scripts/sync_articles.py --only slug      # sync one article
    python scripts/sync_articles.py --dry-run        # fetch markdown only,
                                                     # report what would change
    python scripts/sync_articles.py --list           # show manifest and exit

After syncing, run `python build_blog.py` to regenerate the HTML.

Exit codes:
    0 — success
    1 — one or more articles failed to sync
"""

import argparse
import json
import posixpath
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT         = Path(__file__).resolve().parent.parent
SOURCES_JSON = ROOT / "data" / "sources.json"
MD_DIR       = ROOT / "markdown_posts"
FIGURES_DIR  = ROOT / "figures"

RAW_BASE = "https://raw.githubusercontent.com"

# Markdown image reference: ![alt](path "optional title")
_IMAGE_RE = re.compile(r'(!\[[^\]]*\]\()\s*(<?)([^)\s>]+)(>?)((?:\s+"[^"]*")?\s*\))')


def fetch(url: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": "sync-articles"})
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.read()


def raw_url(owner: str, repo: str, branch: str, path: str) -> str:
    return f"{RAW_BASE}/{owner}/{repo}/{branch}/{path}"


def has_front_matter(markdown_text: str) -> bool:
    return markdown_text.lstrip().startswith("---")


def rewrite_and_collect_images(markdown_text: str, md_repo_path: str, slug: str):
    """
    Rewrites every relative image reference to ../figures/<slug>/<name> and
    returns (new_text, figures) where figures is a list of
    (repo_source_path, local_filename) tuples.
    """
    md_dir  = posixpath.dirname(md_repo_path)
    figures: list[tuple[str, str]] = []

    def _replace(match: re.Match) -> str:
        ref = match.group(3)
        if ref.startswith(("http://", "https://", "data:")):
            return match.group(0)
        source_path = posixpath.normpath(posixpath.join(md_dir, ref))
        filename    = posixpath.basename(source_path)
        figures.append((source_path, filename))
        return f"{match.group(1)}../figures/{slug}/{filename}{match.group(5)}"

    new_text = _IMAGE_RE.sub(_replace, markdown_text)
    # De-duplicate while preserving order
    seen: set[tuple[str, str]] = set()
    unique = [f for f in figures if not (f in seen or seen.add(f))]
    return new_text, unique


def sync_article(entry: dict, defaults: dict, dry_run: bool) -> bool:
    """Syncs one article. Returns True on success."""
    slug   = entry["slug"]
    owner  = entry.get("owner", defaults.get("owner"))
    branch = entry.get("branch", defaults.get("branch", "main"))
    repo   = entry["repo"]
    path   = entry["path"]

    print(f"\n[{slug}]  {owner}/{repo}:{path}")

    try:
        markdown_text = fetch(raw_url(owner, repo, branch, path)).decode("utf-8")
    except (urllib.error.URLError, urllib.error.HTTPError) as exc:
        print(f"  [fail] could not fetch markdown: {exc}")
        return False

    if not has_front_matter(markdown_text):
        print("  [warn] no front matter — this article will NOT build "
              "until front matter is added in the source repo")

    new_text, figures = rewrite_and_collect_images(markdown_text, path, slug)

    md_target = MD_DIR / f"{slug}.md"
    md_status = (
        "new" if not md_target.exists()
        else "changed" if md_target.read_text(encoding="utf-8") != new_text
        else "unchanged"
    )
    print(f"  markdown : {md_status}  ({len(figures)} figure(s) referenced)")

    if dry_run:
        for source_path, filename in figures:
            print(f"    would fetch {source_path} -> figures/{slug}/{filename}")
        return True

    ok = True
    fig_dir = FIGURES_DIR / slug
    downloaded = updated = unchanged = 0
    for source_path, filename in figures:
        try:
            content = fetch(raw_url(owner, repo, branch, source_path))
        except (urllib.error.URLError, urllib.error.HTTPError) as exc:
            print(f"  [fail] figure {source_path}: {exc}")
            ok = False
            continue
        target = fig_dir / filename
        if target.exists():
            if target.read_bytes() == content:
                unchanged += 1
                continue
            updated += 1
        else:
            downloaded += 1
        fig_dir.mkdir(parents=True, exist_ok=True)
        target.write_bytes(content)
    print(f"  figures  : {downloaded} new, {updated} updated, {unchanged} unchanged")

    if md_status != "unchanged":
        MD_DIR.mkdir(parents=True, exist_ok=True)
        md_target.write_text(new_text, encoding="utf-8")
        print(f"  [ok] wrote markdown_posts/{slug}.md")

    return ok


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Sync article sources from their GitHub repositories."
    )
    parser.add_argument("--only", metavar="SLUG",
                        help="sync a single article by slug")
    parser.add_argument("--dry-run", action="store_true",
                        help="fetch markdown and report; write nothing")
    parser.add_argument("--list", action="store_true",
                        help="print the manifest and exit")
    args = parser.parse_args()

    with SOURCES_JSON.open(encoding="utf-8") as handle:
        manifest = json.load(handle)

    defaults = {k: v for k, v in manifest.items() if k != "articles"}
    articles = manifest["articles"]

    if args.list:
        for entry in articles:
            print(f"{entry['slug']:35} <- {entry['repo']}:{entry['path']}")
        return 0

    if args.only:
        articles = [a for a in articles if a["slug"] == args.only]
        if not articles:
            print(f"Error: no article with slug '{args.only}' in {SOURCES_JSON.name}")
            return 1

    failures = sum(not sync_article(entry, defaults, args.dry_run)
                   for entry in articles)

    print(f"\nDone: {len(articles) - failures}/{len(articles)} article(s) synced"
          + (" (dry run — nothing written)" if args.dry_run else ""))
    if not args.dry_run and failures == 0:
        print("Next step: python build_blog.py")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
