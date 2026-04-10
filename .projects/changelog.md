# Flags.fyi — Changelog

## Full Run — 2026-03-23

### Summary

- **295 flag entries** now have `countryData` (was 13)
- **232 flag entries** now have `of` field linking to parent country
- **94 flag entries** now have Pantone codes (was 19)
- **295 flag entries** now have construction/layout descriptions (was ~128)
- **295 flag entries** now have construction sheet SVGs (`cs` field)
- **295 flag entries** now have trivia/fun facts (`trivia` field)
- **295 flag entries** now use bullet-point descriptions (markdown `- ` format)
- **567 CMYK values** added; **350 color notes** added
- **29 new flag entries** created from scratch (was 0)
- **5 flags** had data corrections (hex values, ratios, CMYK)
- **0 flags** remain missing from assets
- **0 thin entries** remaining (was 190)
- **0 validation errors** — all JSON files pass

### Phase 1: Fact-check corrections (5 flags — manual review)

#### Albania (`assets/flags/albania/flags.json`)
- **Fixed** red hex: `#ff0000` → `#DA291C` (Pantone 485 accurate mapping)
- **Fixed** black hex: `#000` → `#000000` (normalized)
- **Fixed** red CMYK: `0/100/100/0` → `0/95/100/0`
- **Added** `pantone` for both colors: `485` (red), `Black` (black)
- **Added** `of` and `countryData` fields (officialName: Republic of Albania, UN: member)
- **Added** note about Law Nr. 8926 (22 July 2002) standardization to `desc`

#### France (`assets/flags/france/flags.json`)
- **Fixed** blue hex: `#0055A4` → `#000091` (2020 Macron navy blue restoration)
- **Fixed** red hex: `#EF4135` → `#E1000F` (updated to current official shade)
- **Fixed** blue CMYK: `100/92/21/6` → `100/90/20/7`
- **Added** `pantone` for blue (`072 C`) and red (`485 C`)
- **Added** `officialSpec` for blue noting 2020 Macron change
- **Added** `of` and `countryData` fields (officialName: French Republic, UN: member)
- **Added** second `desc` paragraph about the 2020 colour change

#### Japan (`assets/flags/japan/flags.json`)
- **Updated** title: added Nisshōki alongside Hinomaru
- **Added** `officialSpec` Munsell values: `N9` (white), `5R 4/12` (red)
- **Added** `of` and `countryData` fields (officialName: Japan, UN: member)
- **Expanded** `desc` with disc proportion detail (3/5 of hoist length)

#### Finland (`assets/flags/finland/flags.json`)
- **Added** `pantone`: `294 C` for blue
- **Added** `officialSpec`: `NCS 4060-R90B` for blue
- **Added** `of` and `countryData` fields (officialName: Republic of Finland, UN: member)
- **Expanded** `desc` with note about 1995 CIE colour standards
- **Updated** blue color note: added "sea blue" designation

#### Argentina (`assets/flags/argentina/flags.json`)
- **Fixed** ratio: `9:14` → `5:8` (per IRAM-DEF D 7674:2004, ratified by Decree 1650/2010)
- **Fixed** light blue hex: `#74ACDF` → `#75AADB` (per official IRAM standard)
- **Added** `pantone` for blue (`284`), yellow (`1235`)
- **Added** fourth color entry: brown (`#843511`, Pantone `725`) for Sun of May features
- **Added** `of` and `countryData` fields (officialName: Argentine Republic, UN: member)
- **Expanded** `desc` with IRAM standardization note

### Phase 1+3: Automated enrichment — sovereign state flags (73 flags)

Added `countryData` (name, officialName, UN status), `of` (country link), and Pantone codes to all sovereign state flags. Key additions:

afghanistan, algeria, andorra, angola, antigua-and-barbuda, australia, austria, bahrain, belgium, brazil, canada, chile, china, colombia, croatia, cuba, czech-republic, denmark, djibouti, egypt, ethiopia, fiji, germany, ghana, greece, hungary, india, indonesia, iran, ireland, israel, italy, jordan, kenya, lebanon, libya, malaysia, mauritania, mexico, morocco, netherlands, new-zealand, nigeria, norway, oman, pakistan, palestine (UN: observer), peru, philippines, poland, portugal, qatar, romania, russia, saudi-arabia, singapore, somalia, south-africa, spain, sudan, sweden, switzerland, syria, tanzania, thailand, tunisia, turkey, uae, uk, ukraine, us, vietnam, yemen

### Phase 1+3: Automated enrichment — international org flags (11 flags)

african-union, arab-league, asean, commonwealth, european-union, gcc, nato, oic, olympic, red-cross, united-nations

### Phase 1+3: Automated enrichment — historical, sub-national, movement flags (172 flags)

Added `countryData` and `of` fields to all remaining flags, including:

- **Afghanistan variants**: af-islamic-republic, af-kingdom, af-republic, af-soviet, af-taliban-1996
- **Argentina historical**: ar-celeste-blanca, ar-sun-of-may
- **Arab historical**: arab-federation, hatay, hejaz
- **Australia sub-national**: au-aboriginal, au-new-south-wales, au-torres-strait
- **Bangladesh**: bangladesh-navy, bd-1971-map
- **Brazil historical**: br-empire, br-provisional
- **Caliphates & dynasties**: abbasid, almohad, almoravid, ayyubid, fatimid, idrisid, mughal, ottoman, ottoman-early, rashidun, samanid, umayyad
- **Canada sub-national**: ca-alberta, ca-british-columbia, ca-ontario, ca-quebec
- **China historical**: cn-blue-sky-white-sun, cn-five-coloured, cn-qing-dragon
- **Colonial**: anglo-egyptian-sudan, british-palestine, british-raj, british-somaliland, french-algeria, french-lebanon, french-syria, italian-somaliland
- **Comoros**: anjouan, comoros-mayotte, grande-comore, moheli
- **Cuba historical**: cu-lone-star
- **Germany sub-national**: de-bavaria, de-prussia
- **Germany historical**: de-east-germany, de-imperial, de-nazi, de-weimar, de-west-germany
- **Egypt variants**: eagle-of-saladin, egypt-eyalet, egypt-khedivate, egypt-mamluk, egypt-revolution, egypt-sultanate, egypt-uar
- **Empires**: achaemenid, byzantine, holy-roman-empire, kingdom-of-jerusalem, mongol, roman-empire, venice
- **Spain**: es-andalusia, es-basque, es-empire, es-francoist, es-republic
- **Ethiopia historical**: et-derg, et-imperial-lion
- **France historical**: fr-bourbon, fr-free-france
- **Ghana historical**: gh-gold-coast
- **Greece historical**: gr-independence, gr-junta, gr-kingdom
- **India**: in-calcutta-flag, in-independence, sikh-empire, in-jammu-kashmir, in-sikkim, in-tamil-nadu
- **Indonesia historical**: id-dutch-east-indies
- **Iraq variants**: iraq-baath, iraq-hashemite, iraq-mandatory, iraq-republic
- **Italy historical**: it-kingdom, it-social-republic
- **Japan historical**: jp-rising-sun-army, jp-rising-sun-navy, jp-tokugawa
- **Kenya historical**: ke-colonial
- **Korea historical**: kr-joseon, kr-taegeukgi-1883
- **Libya variants**: libya-ar, libya-civil, libya-cyrenaica, libya-italian, libya-jamahiriya, libya-kingdom, libya-ottoman, libya-tripolitanian-republic, libya-united
- **Maritime**: jolly-roger, red-ensign, signal-flags, white-ensign
- **Mauritania**: mauritania-1959
- **Mexico historical**: mx-empire, mx-federal-republic, mx-three-guarantees
- **Movements**: amazigh, catalan, kurdish, pan-african, pan-slavic, romani, tibetan
- **Pakistan historical**: east-pakistan, pk-muslim-league
- **Persia**: pahlavi, qajar, sassanid, sassanid-alt
- **Philippines historical**: ph-katipunan, ph-revolutionary
- **Poland historical**: pl-duchy-warsaw, pl-november-uprising
- **Pride**: pride-progress, pride-rainbow, pride-trans
- **Russia historical**: ru-imperial, ru-sfsr, soviet-union
- **Scotland**: scotland-kingdom
- **South Africa historical**: za-prinsevlag
- **Thailand historical**: th-siam-elephant
- **UK sub-national**: uk-cornwall, uk-england, uk-northern-ireland, uk-scotland, uk-wales
- **US historical & states**: us-betsy-ross, us-confederate-stainless, us-confederate-stars-bars, us-california, us-alaska, us-arizona, us-colorado, us-georgia, us-hawaii, us-maryland, us-mississippi, us-new-mexico, us-new-york, us-ohio, us-puerto-rico, us-south-carolina, us-texas, us-washington-dc
- **Vietnam historical**: vn-empire, vn-south
- **Yemen variants**: north-yemen, south-yemen

### Phase 2: New flag entries created from scratch (29 flags)

| Flag | Directory | Ratio | Adoption |
|------|-----------|-------|----------|
| abkhazia | abkhazia | 1:2 | 1992-07-23 |
| alderney | alderney | 3:5 | 1993 |
| anguilla | anguilla | 1:2 | 1990-05-30 |
| anguilla-dolphin | anguilla | 1:2 | (unofficial) |
| anguilla-governor | anguilla | 1:2 | (governor's flag) |
| ascension-island | ascension-island | 1:2 | (unofficial) |
| bermuda | bermuda | 1:2 | 1910-10-04 |
| british-antarctic-territory | british-antarctic-territory | 1:2 | 1963-03-21 |
| british-falkland-islands | british-falkland-islands | 1:2 | 1999-01-25 |
| british-indian-ocean-territory | british-indian-ocean-territory | 1:2 | 1990-11-08 |
| british-overseas-territories | british-overseas-territories | 1:2 | (collective) |
| british-virgin-islands | british-virgin-islands | 1:2 | 1960-11-15 |
| cayman-islands | cayman-islands | 1:2 | 1958 |
| chad | chad | 2:3 | 1959-11-06 |
| gibraltar | gibraltar | 1:2 | 1502 |
| guernsey | guernsey | 2:3 | 1985-02-15 |
| jersey | jersey | 3:5 | 1981-06-12 |
| juneteenth | juneteenth | 2:3 | 1997 |
| korea (South Korea) | korea | 2:3 | 1949-10-15 |
| korea-dprk (North Korea) | korea | 1:2 | 1948-09-08 |
| kuwait | kuwait | 1:2 | 1961-09-07 |
| mann (Isle of Man) | mann | 1:2 | 1931-07-01 |
| montserrat | montserrat | 1:2 | 1960 |
| pitcairn | pitcairn | 1:2 | 1984-04-02 |
| saint-helena | saint-helena | 1:2 | 1984 |
| sark | sark | 3:5 | 1938-11-16 |
| sgssi | sgssi | 1:2 | 1999-02-03 |
| tci (Turks and Caicos) | tci | 1:2 | 1968 |
| tristan (Tristan da Cunha) | tristan | 1:2 | 2002-10-20 |

### Deep Enrichment Pass — 2026-03-23 (session 2)

Quality audit before: Good=56, OK=111, Thin=190
Quality audit after:  Good=110, OK=185, Thin=0

#### 22 sovereign flags: deep enrichment
- Croatia: 6 colors (was 3) with full hex/CMYK/Pantone/notes; desc 29→150 words; includes šahovnica construction detail
- Afghanistan, Djibouti, Lebanon, Libya, Mauritania, Oman, Palestine, Qatar, Somalia, Sudan, Syria, Tunisia, UAE, Yemen: full color notes, CMYK, and multi-paragraph descriptions with construction info
- UK, US, Korea, Korea-DPRK: added CMYK values and enriched color notes
- Antigua and Barbuda, Abkhazia, Anguilla-dolphin: deep enrichment

#### Batch CMYK and color notes (206 flags)
- 567 CMYK values computed from hex and added
- 350 color notes added with historical/symbolic context
- 9 notable flags (Aboriginal, Pride flags, Ottoman, Soviet Union, Nazi Germany, Jolly Roger, Qing Dragon) given rich multi-paragraph descriptions

#### 51 description expansions
- All remaining short descriptions (<30 words) expanded to 60-100+ words
- Added construction info and historical context to: Afghan variants, Argentina historical, Australia sub-national, Bangladesh, Brazil, British territories, Canada provinces, Colonial flags, Egypt historical, France historical, Germany historical, Greece historical, India historical, Indonesia, Iraq variants, Italy, Japan historical, Korea historical, Libya variants, Maritime, Mexico historical, Movements (Amazigh, Kurdish, Catalan), Philippines, Spain historical, US states and historical, Vietnam, Yemen variants

#### Phase 4: Site rebuild
- [x] `node build.js` — 294 flag pages + index generated successfully
- [x] 0 JSON parse errors across all files
- [x] 0 thin entries remaining (was 190)

### Content & Format Enrichment — 2026-03-23 (session 2, part 2)

#### Construction sheet SVGs (290 new + 6 preserved)
- Generated programmatic construction sheet SVGs for ALL 295 flags
- Each SVG shows: flag outline, stripe/division lines (dashed), dimension arrows with ratio labels
- 9 flag type templates used: horizontal tricolour, vertical tricolour, horizontal/vertical bicolour, field with circle, canton + stripes, hoist triangle, Nordic cross, simple field
- Classification done automatically by parsing desc text for keywords ("horizontal", "vertical", "canton", "Nordic", etc.)
- SVGs are lightweight (~1KB each), use clean dimension annotations
- 6 original hand-crafted SVGs preserved (Algeria, Andorra, Bahrain, Bangladesh, Libya, US-California)
- Ratios correctly interpreted as height:width (e.g., "1:2" = landscape flag)
- All `flags.json` files updated with `cs` field pointing to construction sheet path

#### Description reformatting (295 flags)
- Converted ALL desc arrays from paragraph text to markdown bullet points
- Each bullet starts with `- ` and uses `\n` separators for proper `<li>` rendering
- Construction paragraphs bolded: `**Construction:** ...`
- Long paragraphs (>150 chars) split at natural sentence breaks
- Trailing periods stripped for cleaner bullet appearance

#### Trivia added (295 flags)
- Added `trivia` field to all 295 flag entries
- 2–4 factual, engaging trivia items per flag
- Formatted as markdown bullets matching desc format
- Updated `build.js` to render trivia as `<h3>Trivia</h3>` section in deep dive panel
- Coverage: sovereign flags, historical flags, empires, pride flags, sub-national, movements, maritime, international organizations
- Examples: Bangladesh disc offset trick, Qatar's sun-bleached maroon, US flag designed by a 17-year-old for a B- grade, Nepal's non-rectangular shape, Denmark as oldest continuously used flag

#### build.js changes
- Added trivia field support: `arrayText()` resolution, `renderMarkdown()` rendering
- Trivia section appears between description and article in the deep dive panel
- `hasDeepDive` check updated to include trivia

#### Site rebuild
- `node build.js` regenerated all 294 pages
- All pages verified: construction sheets, bullet descriptions, and trivia rendering correctly
- 295/295 flags have all three features (cs + bullets + trivia)

### Methodology notes

- Wikipedia was inaccessible via WebFetch (403 errors). Color data was sourced from flagcolorcodes.com, WebSearch results, and well-established vexillological references.
- Pantone codes were added to sovereign state flags based on commonly cited official specifications.
- Historical, sub-national, and movement flags received `countryData` but not Pantone codes (these are rarely standardized for non-sovereign flags).
- All JSON files validated — 0 parse errors, 0 missing countryData fields.
