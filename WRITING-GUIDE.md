# Writing Guide

Editorial standard for every article and TIL published on
[brunoramosmartins.github.io](https://brunoramosmartins.github.io).
Every piece of content is reviewed against this document before publishing.
When an existing article disagrees with this guide, the guide wins.

---

## Source of truth and pipeline

Each article lives in its **own GitHub repository** and is the single source
of truth. This site repository holds only synchronised copies.

```
<article-repo>/article/<name>.md      ← EDIT HERE (always)
        │
        ▼  python scripts/sync_articles.py
markdown_posts/<slug>.md              ← generated copy (never edit by hand)
figures/<slug>/*.png                  ← figures pulled from the repo
        │
        ▼  python build_blog.py
posts/<slug>.html + data/articles.json
```

Rules:

1. **Never edit `markdown_posts/` directly.** Any manual edit will be
   overwritten by the next sync. Edit in the article repo, merge, then sync.
2. New articles are registered by adding one entry to `data/sources.json`.
3. Front matter lives **inside the article file in its repo** — it travels
   with the sync. An article without front matter will not build.
4. Figures live in the article repo's `figures/` directory and are referenced
   relatively (`../figures/name.png`). The sync script namespaces them per
   article (`figures/<slug>/name.png`) so file names never collide across
   articles.

---

## Content types

| | Article | TIL |
|---|---|---|
| Length | 3,000+ words | under ~1,000 words |
| Scope | full treatment: theory → experiments → framework | one insight, one example, one takeaway |
| Skeleton | full skeleton below | Title → orientation note (2–3 lines) → body → takeaway |
| Category | `machine-learning`, `statistics`, … | `til` |

If a "TIL" grows past ~1,500 words or needs numbered experiments, it is an
article — promote it.

---

## Front matter

```yaml
---
title: "Short Title"                    # required — no subtitle here
description: "One-sentence subtitle."   # required — rendered under the title
date: 2026-07-11                        # required
category: machine-learning              # required
reading_time: "25 min"                  # optional (will become build-computed)
tags: bayesian, forecasting             # optional, comma-separated
related_til: slug-1                     # optional (articles only)
leads_to_article: slug-1                # optional (TILs only)
---
```

The `description` doubles as the article subtitle and the OG/social preview
text. Do **not** repeat a subtitle inside the body (no bold/italic/H2
subtitle under the H1).

---

## Article skeleton

```markdown
# Short Title

> **Orientation block** — one blockquote, always the first element after
> the title. See spec below.

## First content section
...

## Experiments
...

## Limitations
...

## Conclusion
...

## References
...

*Reproducibility footer — see spec below.*
```

### The orientation block

One blockquote, directly under the H1, with exactly these four parts in
this order:

1. **What this is and why it matters** — 2–3 sentences. Lead with the
   headline result when there is one ("assuming Normal instead of Pareto
   underestimates tail risk by 138×").
2. **What you should know before reading** — three labelled lists:
   *Required*, *Helpful but not required*, *Out of scope*.
3. **What you will take away** — 1–2 sentences: what the reader will be
   able to do or explain after finishing.
4. **Code** — link to the companion repository plus one line on
   reproducibility ("all figures regenerate from `scripts/` with seed N").

This block **replaces** every previous opening convention: Executive
Summary, Abstract, "What This Article Is", "§0 What You Need to Know",
"Who this article is for", Roadmap, TL;DR. Do not keep any of those as
separate sections.

A short personal note on why you wrote the piece (an interview, a book
you reread) is welcome — keep it inside part 1, at most 3 sentences.

### Sections and headings

- **No chapter numbers.** Not in headings, not in cross-references.
- Cross-reference sections by name with an anchor link:
  `see [Heavy Tails](#heavy-tails)` — never "see Section 8" or "§5.3".
- Titles are short noun phrases (2–5 words). A question is fine for the
  opening section.
- Maximum depth: `###`. If you need `####`, restructure.
- Never reference internal production artefacts: development phases
  ("Phase 2"), issue numbers, template labels (Hook/Insight/Takeaway),
  or files that only exist in the repo (`notation.md`).

### Experiments

Every experiment uses the same template:

```markdown
### Experiment A — Short name

**Claim.** The theoretical statement being tested, one sentence.

**Setup.** Data, parameters, seed, what varies.

**Result.** What happened, with the key numbers.

**Connection.** Which part of the theory this confirms (link the section),
and what it means in practice.
```

The **Connection** field is mandatory — closing the loop between theory
and experiment is the house signature.

### Figures

- The build converts image alt text into the visible `<figcaption>`.
  Write the full caption **as the alt text**.
- Do **not** add a manual caption paragraph (`*Figure 3: ...*`) below the
  image — it renders duplicated.
- Do not number figures unless the text cross-references them.
- Reference figures relatively from the article file:
  `![Caption text.](../figures/name.png)`. The sync script rewrites paths.
- Every figure is generated by a versioned script with a fixed seed.

### Math and notation

- Inline math `$...$`, display math `$$...$$` (MathJax).
- Include a Notation table only when the symbol load is heavy (roughly:
  more than ~10 recurring symbols). Place it immediately after the
  orientation block, wrapped in `<details><summary>Notation</summary>…</details>`.
- Currency: `R$ 50,000` in prose; `R\$\,50{,}000` inside math mode.

### Limitations

Mandatory in every article. State the boundaries of the method honestly:
assumptions, regimes where it breaks, what a real deployment must
re-validate. This section is a feature, not an apology.

### Conclusion

At most **three takeaways**, then one short paragraph on what comes next.
No new material.

### References

Single format — author–year, alphabetical, with DOI or link when one exists:

```markdown
- Krippendorff, K. (2004). *Content Analysis: An Introduction to Its
  Methodology* (2nd ed.). Sage.
- Davis, J. & Goadrich, M. (2006). The relationship between Precision-Recall
  and ROC curves. *ICML 2006*. [doi:10.1145/1143844.1143874](https://doi.org/10.1145/1143844.1143874)
```

No numbered `[1]` citations, no bold author names, no core/supplementary
split.

### Reproducibility footer

Last element of every article, after References:

```markdown
---

*All figures and numbers in this article are reproduced by versioned
scripts in the [companion repository](https://github.com/brunoramosmartins/<repo>),
with fixed seeds. See the repository README for how to run them.*
```

The repository URL is **mandatory** — "the companion repository" without a
link is not acceptable.

---

## Series and companion articles

When an article belongs to a series or cites a companion article, every
mention links to the published page by title:

```markdown
the companion article [Why Your Budget Never Hits the Exact Number](/posts/monte-carlo-budget.html)
```

Never "Article 1", "the previous article", or a title without a link.

---

## Style

- **Language:** English, **British spelling** (-ise, modelling, behaviour) —
  this matches the majority of the existing corpus. Be consistent within
  and across articles.
- **Voice:** first person plural for derivations ("we derive"), first
  person singular for personal notes. Confident, concrete, no hedging.
- Translate every technical result into its decision consequence — the
  "executive translation" is part of the house style.
- One idea per paragraph; prefer short sentences around displayed math.
- Portuguese versions (`*-ptbr.md`) follow the same structure as the
  English source.

---

## Pre-publication checklist

- [ ] Front matter complete (title, description, date, category) **in the article repo**
- [ ] Orientation block present, four parts, first element after the H1
- [ ] No numbered chapters; no "Section N" / "§N" cross-references
- [ ] No internal artefacts (Phase N, template labels, repo-only file links)
- [ ] Experiments follow Claim / Setup / Result / Connection
- [ ] Figure captions live in alt text; no duplicated caption paragraphs
- [ ] Limitations section present
- [ ] Conclusion has ≤ 3 takeaways
- [ ] References in author–year format
- [ ] Reproducibility footer with clickable repo URL
- [ ] All companion/series mentions are links
- [ ] Synced (`python scripts/sync_articles.py --only <slug>`) and built
      (`python build_blog.py`) without errors; page reviewed locally
