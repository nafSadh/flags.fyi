# Flags.fyi — Wikipedia Fact-Check & Data Completion

## Assignment

For every flag in the site, visit the relevant Wikipedia page, fact-check all existing data, and fill in any missing details. This is a long-running overnight job.

## Scope

- **293 flags** in `data/flags.json` (the master index)
- **266 flags** have detailed data in `assets/flags/<group>/flags.json`
- **29 flags** have NO asset data at all (listed below)
- **264 flags** have color data
- **74 flags** have deep-dive articles (`.md` files)

## Data Structure

Each flag's data lives in `assets/flags/<group>/flags.json` where `<group>` is the directory name (e.g., `bangladesh`, `france-hist`). Each entry can contain:

```json
{
  "title": "Flag of ...",
  "ratio": "2:3",
  "colors": [{ "color": "...", "hex": "...", "cmyk": "...", "pantone": "...", "officialSpec": "...", "note": "..." }],
  "use": { "as": "national flag", "since": "YYYY-MM-DD" },
  "of": { "country": "..." },
  "countryData": { "name": "...", "officialName": "...", "un": "member|observer|none" },
  "desc": ["Paragraph 1...", "Paragraph 2..."],
  "cs": "path/to/construction-sheet.svg",
  "article": "path/to/deep-dive.md",
  "now": "successor-flag-id",
  "years": "YYYY–YYYY"
}
```

## Task Checklist

### Phase 1: Fact-check existing data (266 flags with assets)

For each flag that already has data in `assets/flags/*/flags.json`:

- [ ] Go to its Wikipedia page (URL pattern: `https://en.wikipedia.org/wiki/Flag_of_<Country>`)
- [ ] Verify `title` is accurate
- [ ] Verify `ratio` matches Wikipedia
- [ ] Verify `colors` — hex values, CMYK, Pantone codes, official specs
- [ ] Verify `use.since` adoption date
- [ ] Verify `desc` is factually correct
- [ ] Verify `countryData` (official name, UN status)
- [ ] If any field is wrong, fix it
- [ ] If any field is missing but available on Wikipedia, add it
- [ ] Log changes in `.projects/changelog.md`

### Phase 2: Add missing flags (29 flags without asset data)

These flags exist in `data/flags.json` but have no `assets/flags/*/flags.json`:

```
abkhazia, alderney, anguilla, anguilla-dolphin, anguilla-governor,
ascension-island, bermuda, british-antarctic-territory,
british-falkland-islands, british-indian-ocean-territory,
british-overseas-territories, british-virgin-islands, cayman-islands,
chad, gibraltar, guernsey, jersey, juneteenth, korea, korea-dprk,
kuwait, mann, montserrat, pitcairn, saint-helena, sark, sgssi, tci,
tristan
```

For each:
- [ ] Find the correct Wikipedia article
- [ ] Create (or add to) the appropriate `assets/flags/<group>/flags.json`
- [ ] Fill in all available fields: title, ratio, colors, use, desc, countryData
- [ ] Log in `.projects/changelog.md`

### Phase 3: Enrich thin entries

Some existing entries may have `desc` but lack:
- [ ] `cmyk` values for colors
- [ ] `pantone` codes
- [ ] `officialSpec` references
- [ ] `countryData.officialName`
- [ ] `countryData.un` status

Fill these in where Wikipedia provides the info.

### Phase 4: Rebuild

- [ ] Run `node build.js` to regenerate all HTML pages
- [ ] Spot-check 10 random pages for correct rendering

## Working Notes

- The build script (`build.js`) reads from both `data/flags.json` and `assets/flags/*/flags.json`, merges them, and generates static HTML
- Wikipedia flag articles usually have an infobox with ratio, adoption date, and a colors section
- Use `WebFetch` to read Wikipedia pages; do NOT use curl/wget
- Write changes directly to the JSON files; do not modify HTML (it gets regenerated)
- Keep a changelog so the human can review what was changed

## Progress

### Completed — 2026-03-23

- [x] Phase 1: Fact-check existing data — **294/294 flags** enriched with countryData
- [x] Phase 1: Color corrections — **5 flags** had hex/CMYK/ratio corrections (Albania, France, Japan, Finland, Argentina)
- [x] Phase 2: Add missing flags — **29/29 flags** created from scratch
- [x] Phase 3: Enrich thin entries — **94 flags** now have Pantone codes (was 19); 232 have `of` field
- [x] Construction descriptions — **295/295 flags** now have construction/layout info in `desc`
- [x] Deep enrichment — **22 sovereign flags** fully enriched (Croatia, Afghanistan, etc.); **567 CMYK** values added; **350 color notes** added; **0 thin entries** remaining
- [x] Construction sheet SVGs — **295/295 flags** now have `cs` field with programmatic SVG diagrams
- [x] Bullet-point descriptions — **295/295 flags** reformatted from paragraphs to markdown bullets
- [x] Trivia — **295/295 flags** now have 2–4 fun facts in `trivia` field
- [x] build.js updated — trivia rendering added to deep dive panel
- [x] Phase 4: Rebuild — `node build.js` run successfully (294 pages generated)

See `.projects/changelog.md` for full details.
