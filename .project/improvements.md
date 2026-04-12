# Flags.fyi — Improvement Plan

> **Created:** 2026-04-09
> **Status:** In Progress

---

## Execution Order

| # | Area | Status | Summary |
|---|------|--------|---------|
| 0 | Analytics | DONE | GoatCounter wired into all pages via `analyticsSnippet()` in build.js |
| 1 | Performance | DONE | SVG sprite dedup, lazy loading, fetchpriority, table scroll wrapper |
| 2 | SEO | DONE | Meta descriptions, OG/Twitter tags, JSON-LD, sitemap, robots.txt, canonical URLs, alt text fixes |
| 3 | Search | DONE | Build-time JSON index, vanilla JS filter, search bar on index pages, `/` shortcut, `?q=` URLs |
| 4 | Mobile | PENDING | Hamburger menu, touch targets, font floor, swipe gestures |
| 5 | Articles | PENDING | Fix 12 broken refs, generate ~220 missing articles |

---

## 0. Analytics (DONE)

- Added `analyticsSnippet()` function to build.js
- GoatCounter script (`flags-fyi.goatcounter.com`) injected before `</body>` on all 8 page templates
- Zero cookies, no consent banner, 3.5KB script
- User needs to sign up at goatcounter.com/signup with subdomain `flags-fyi`

---

## 1. Performance

### High Impact
- **SVGO on all flag SVGs** — Afghanistan flag.svg is 190KB, af-islamic-republic is 232KB. Expect 20-50% reduction on complex SVGs
- **Deduplicate inline SVG icons** — Wikipedia W icon (~1,800 bytes) inlined 2x per flag page across 250+ pages (~875KB total). Use `<symbol>`/`<use>` pattern
- **`loading="lazy"` on related thumbnails** — sidebar related flags and successor images lack it

### Medium Impact
- **Minify CSS** — 25.6KB with comments/whitespace, could be ~16-18KB
- **Minify HTML** — remove comments, collapse JSON in deep-dive `<details>`
- **Reduce favicon.ico** — currently 15.4KB, should be 2-5KB

### Low Impact
- **`fetchpriority="high"` on hero flag image**
- **`loading="lazy"` on construction sheet SVGs** (hidden panel)
- **Content-hash CSS/JS filenames** (limited benefit on GitHub Pages)

---

## 2. SEO

- **Meta descriptions** — auto-generate from flag data (title, first desc bullet, colors, ratio)
- **Open Graph tags** — og:title, og:description, og:image, og:url, og:type, og:site_name
- **Twitter Card tags** — twitter:card, twitter:title, twitter:description, twitter:image
- **JSON-LD structured data** — CreativeWork schema with Country nesting
- **sitemap.xml** — generate at build time with priority values per page type
- **robots.txt** — Allow all + sitemap reference
- **Canonical URLs** — `<link rel="canonical">` on every page
- **Fix alt text** — empty alt on flag-grid thumbnails, generic alt on construction sheets
- **Fix landing page title** — "Flags.fyi -- Flags.fyi" is redundant

---

## 3. Search

- **Build-time JSON index** (~25-35KB) with id, name, title, groups, colors, flag path, keywords
- **Search bar on `/flag-index/` and `/flag-index/all/`** — pill-shaped input in hero area
- **Vanilla JS filter** — `String.includes()` on pre-computed lowercase keywords field
- **Live filtering** on `/flag-index/all/` — toggle visibility of existing `.flag-grid` items
- **Results overlay** on `/flag-index/` hub — show matching flags below search bar
- **Keyboard shortcut** — `/` to focus search, Escape to clear
- **URL integration** — `?q=query` support for shareable search links
- **Searchable fields** — name, category, color names, years

---

## 4. Mobile

### Critical
- **Hamburger menu** — mobile users have zero navigation (left rail hides with no replacement)
- **Touch targets** — nav buttons 35px (need 44px min), deep-dive close 32px, cat-tags ~24px
- **Fixed bottom nav bar** — prev/next + index accessible without scrolling

### High Priority
- **Font size floor** — several elements at 7-8px (year labels, ref badges); need 12px minimum
- **Flag viewport** — reduce min-height from 55vh to ~40vh to show content below fold
- **Swipe gestures** — horizontal swipe on flag viewport for prev/next navigation
- **Color table** — add `overflow-x: auto` wrapper for 4-column table on narrow screens

### Medium Priority
- **Tablet breakpoint** — add ~1024px intermediate layout
- **Deep dive on mobile** — render as overlay instead of inline flex item
- **Landscape orientation** — add specific styles for mobile landscape

---

## 5. Articles

### Phase 1: Fix 12 broken references
Flags with `"article"` key but missing `.md` file:
uk, libya, albania, afghanistan, persia, bahrain, djibouti, angola, iraq, bangladesh, mauritania, us

### Phase 2: Generate articles for current national flags (~80-90)
AI-assisted from existing desc/trivia data. Template: 2 paragraphs, 80-150 words, no subheadings.

### Phase 3: Generate articles for historical/special flags (~120-130)
Lower priority. Extra care for politically sensitive flags.

---

## Research Sources

All recommendations based on sub-agent analysis completed 2026-04-09:
- Search agent: recommends vanilla JS over Lunr/Fuse for 294 items
- SEO agent: full audit of missing meta tags, structured data, sitemap
- Analytics agent: recommends GoatCounter (free, no cookies, 3.5KB)
- Mobile agent: critical gaps in navigation, touch targets, font sizes
- Performance agent: SVGO, SVG dedup, lazy loading as top wins
- Articles agent: 220 missing, 12 broken refs, AI-assisted generation plan
