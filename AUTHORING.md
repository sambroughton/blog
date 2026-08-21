# Authoring reference

How to take an entry from draft to published. Quick reference, not a tutorial.

## 1. Create the file

```
src/content/blog/<slug>.md
```

The filename **is** the URL: `kql-identity-attack-investigation.md` → `/blog/posts/kql-identity-attack-investigation`. Lowercase, hyphens. Renaming the file changes the URL and breaks inbound links.

`.mdx` also works if you need components in the body.

## 2. Frontmatter

```yaml
---
title: Advanced KQL techniques for investigating identity-based attacks
description: Queries for password spray, failed-then-succeeded sequences, and unfamiliar sign-in properties.
pubDate: 2026-07-14
solutions:
  - Microsoft Sentinel
topics:
  - KQL
  - Identity Investigation
draft: true
---
```

| Field         | Required | Notes                                                        |
| ------------- | -------- | ------------------------------------------------------------ |
| `title`       | yes      | 1-120 chars                                                  |
| `description` | yes      | 1-300 chars. Shown on every listing row and in the hero card |
| `pubDate`     | yes      | `YYYY-MM-DD`. Drives sort order everywhere                   |
| `solutions`   | yes      | ≥1, from the fixed list below. **First one is primary**      |
| `topics`      | yes      | ≥1, from the fixed list below                                |
| `updatedDate` | no       | Renders a "Updated <date>" line on the entry page            |
| `series`      | no       | Free text. Shown above the title on the entry page           |
| `featured`    | no       | Defaults `false`. See §4                                     |
| `draft`       | no       | Defaults `false`. See §3                                     |
| `cover`       | no       | See §5                                                       |
| `coverAlt`    | no       | See §5                                                       |

Anything not in this table is rejected. Order in the file doesn't matter.

## 3. Draft → published

```yaml
draft: true # visible in `npm run dev`, excluded from production
draft: false # live
```

**This is the only switch you need to flip to publish.** Set it to `false`, commit, push to `main`.

Important consequences of `draft: true`:

- It shows in `npm run dev` but **not** in `npm run build`. So local dev shows more posts than production.
- It does **not** count toward solution pages, the nav dropdown, or the search filters in production.
- Schema errors still fail the build even on drafts. A typo can't hide behind `draft: true`.

## 4. Featured

```yaml
featured: true
```

Puts the entry in the hero carousel at the top of the homepage. Max **3** slots (`SITE.heroCount`), newest first — so a 4th featured entry silently pushes out the oldest.

If **nothing** is featured, the hero falls back to the 3 newest entries automatically. So the hero is never empty and you don't have to use this field at all.

## 5. Images

```yaml
cover: ./images/my-cover.png
coverAlt: Sign-in logs filtered to failed-then-succeeded sequences
```

- Path is **relative to the markdown file**. Put images in `src/content/blog/images/` (create it — it doesn't exist yet).
- Do **not** use `public/`. Images must go through `image()` to get optimised.
- Formats: png, jpg, webp, avif.
- **Minimum 1600px wide.** Largest variant generated (hero: 640/1024/1600; thumbnail: 190/380/760). Smaller sources are not upscaled and look soft in the hero.
- **The two placements crop differently, both with `object-fit: cover`:**
  - _Row thumbnail_ — fixed **16:10**, small (11.875rem wide). Anything outside that ratio is cut.
  - _Hero_ — no fixed ratio. It fills a box roughly 62rem × 19rem (about 3.3:1, a wide letterbox), and on screens ≥768px the text panel covers the **left 47%**.
- So: supply a wide 16:10 image at ≥1600px and **keep the subject in the right-hand third**. That survives both crops — the hero uses `object-position: center right` for exactly this reason. A centred subject gets hidden behind the hero text.
- Astro emits webp variants with a srcset automatically. You don't size anything by hand.

`coverAlt` becomes the `alt`. Omit it only if the image is purely decorative (it renders `alt=""`). **With no `cover` at all**, the layout still works — the thumbnail slot shows a styled placeholder, so a coverless entry doesn't look broken.

## 6. Vocabularies (fixed — build fails on anything else)

Mirrored from `src/consts.ts`, which is the source of truth. If this list and
`consts.ts` ever disagree, `consts.ts` wins and this file is stale.

**`solutions`** — first is primary; it's the tag under the row title and drives the entry's breadcrumb:

```
Microsoft Sentinel
Microsoft Entra ID
Microsoft Intune
Microsoft Defender XDR
Microsoft Defender for Endpoint
Microsoft Defender for Identity
Microsoft Defender for Office 365
Microsoft Defender for Cloud Apps
Microsoft Defender for Cloud
```

**`topics`**:

```
Advanced Hunting          Identity Investigation
Analytics Rules           Identity Protection
Attack Surface Reduction  Incident Investigation
Authentication            KQL
Conditional Access        Privileged Access
Data Collection           Projects
Detection Engineering
Detection Tuning
Device Investigation
Device Onboarding
Endpoint Hardening
External Access
Guest Accounts
```

To add a new product or subject, add one line to `SOLUTIONS` / `TOPICS` in `src/consts.ts`. Everything then follows automatically — nav dropdown, `/solutions/<slug>` page, `/solutions` index, search filter. The URL slug is derived from the label (lowercase, non-alphanumerics → hyphens).

A solution with **zero published entries appears nowhere** — no empty pages. It shows up the moment you publish something tagged with it.

## 7. `Projects` is special

Tagging `topics: [Projects]` moves the entry **off the homepage ledger** and onto `/projects`, plus the "Recent Projects" sidebar block (3 newest). It's an ordinary entry otherwise. Use it for things you built, not notes on a product.

## 8. Body

- Start headings at `##`. The `#` is the title from frontmatter — don't repeat it.
- The right-hand contents rail is built from `##` (sections) and `###` (nested). `####` and deeper are ignored. Fewer than one `##` and no rail renders.
- Code fences get syntax highlighting (`github-dark`). Prose wraps; `bash`, `sh` and `powershell` don't.
- Reading time is automatic: 200 words/min for prose, 25 lines/min for fenced code.

## 9. Ship it

```bash
npm run dev            # preview, drafts visible
npm run format         # prettier
npm run check          # astro check — must be 0 errors
npm run build          # must pass; drafts excluded here
```

Then commit and push to `main`. CI runs `format:check`, `check` and `build`; `deploy.yml` publishes to GitHub Pages on success.

## Gotchas

- **Never put a markdown file anywhere under `src/content/blog/` that isn't an entry.** The loader glob is `**/*.{md,mdx}` from that directory and it does not skip subdirectories — a stray `README.md` becomes a blog post and fails the build. (An `images/` folder is fine; it has no markdown.)
- **`pageSize` is 6.** A 7th published article creates `/page/2`. Those paginated routes only exist in production once you have >6 non-draft articles.
- **The sidebar hides below 3 published entries** (`SITE.sidebarMinEntries`).
- **Local build ≠ production count.** If a solution page or nav item is missing from `npm run build` but present in dev, the entries behind it are still drafts.
- Tuning knobs (`pageSize`, `heroCount`, `sidebarRecentCount`) are in `SITE` in `src/consts.ts`.
- **Deleting or renaming an article can leave a stale build.** Astro caches the collection in `.astro/`. If a removed entry still shows up after a build, clear it:
  ```bash
  rm -rf .astro dist && npm run build
  ```
- **An empty blog warns on build.** With no entries at all, Astro prints `The collection "blog" does not exist or is empty` once per page that reads it. Harmless — the build still exits 0 — and it stops with the first article.
