---
title: "Building the TIL pipeline itself"
description: "A meta-TIL that validates the new short-notes build pipeline end-to-end — front matter, tags, and cross-link rendering."
date: 2026-04-21
category: til
tags: meta, site-engineering, til
---

# Building the TIL pipeline itself

Short notes (Today I Learned) are now a first-class content type on this site. They live in `markdown_posts/` like regular articles, but the front matter field `category: til` routes the build output to `/til/<slug>.html` instead of `/posts/<slug>.html`, and the generator picks a leaner template.

## Why TIL is worth the plumbing

Full articles are expensive to write. A TIL is cheap: 2–5 minutes of reading, one self-contained idea, published the same day it clicked. Over time, a cluster of related TILs becomes the scaffolding for a longer piece — the article just synthesises what the TILs already demonstrated.

## What this TIL is actually testing

- [x] Front matter with `category: til` routes to the TIL template
- [x] Free-form `tags` are parsed into a list and render as filter buttons on `til.html`
- [x] Output file lands at `til/pipeline-sanity-check.html`
- [x] `data/articles.json` gets a new entry with `url: /til/...`
- [x] `articles.html` does **not** show this TIL (category filter excludes it)

If you're reading this on the live site, the pipeline works.

## Next

Replace this with real TILs — starting with the ones that will seed the upcoming article on evaluation metrics and agreement coefficients.
