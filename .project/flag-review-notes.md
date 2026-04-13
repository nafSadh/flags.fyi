# Flag Review Notes — Full Audit (2026-04-12)

Reviewed all 296 construction sheet SVGs across 146 directories, plus 73 flag.md files and their corresponding flag.svg files.

## Systemic Issue: Construction Sheet Template Limitations

The CS generator uses a simplified template that can only express equal horizontal/vertical bands or solid fills. Any flag with a cross, saltire, emblem, chevron, sunburst, canton, or non-equal stripe proportions is rendered as a placeholder. **Many of these are intentional placeholders, not errors** — they show the correct ratio and color palette but not the full flag geometry.

**Only improve a placeholder CS when a proper reference exists** (e.g., on Wikimedia Commons [Category:SVG flag construction sheets](https://commons.wikimedia.org/wiki/Category:SVG_flag_construction_sheets), which has ~360 files).

## Wikimedia Commons Cross-Reference

These flags in our project have **placeholder/simplified CS files** AND a proper construction sheet exists on Wikimedia Commons that could be used as reference:

### National flags with available online CS reference
Algeria, Antigua & Barbuda, Australia, Austria, Bahrain, Bangladesh, Belgium,
Brazil, Canada, Chad, Chile, China, Colombia, Comoros, Cuba, Czech Republic,
Denmark, England, Finland, France, Germany, Ghana, Greece, Honduras, Hungary,
Iceland, India, Indonesia, Iraq, Ireland, Israel, Italy, Japan, Jordan, Kuwait,
Latvia, Libya, Lithuania, Malaysia, Mauritania, Mexico, Monaco, Morocco,
Netherlands, New Zealand, Nigeria, North Korea, Norway, Pakistan, Palestine,
Panama, Peru, Philippines, Poland, Portugal, Qatar, Romania, Russia, Rwanda,
Saudi Arabia, Scotland, Singapore, Slovakia, Slovenia, South Africa, South Korea,
Spain, Sudan, Sweden, Switzerland, Syria, Tanzania, Thailand, Trinidad, Tunisia,
Turkey, Ukraine, United States, and more.

### Notable ones where our CS is a placeholder but Commons has a proper one
- **Portugal** — Commons has `Flag of Portugal blank measures.svg`
- **Turkey** — Commons has `Flag of Turkey (construction sheet).svg` (ours is a stub)
- **Belgium** — Commons has `Flag of Belgium (construction sheet).svg` (our SVG also has wrong ratio)
- **England** — Commons has `Flag of England (construction sheet).svg` (ours is blank white)
- **Scotland** — Commons has `Flag of Scotland (construction sheet).svg` (ours is a bicolor)
- **Rising Sun** — Commons has `Rising sun flag(Construction sheet).svg` (ours is a bicolor)
- **North Korea** — Commons has `Flag of North Korea (construction sheet).svg`
- **Isle of Man** — Commons has `Flag of the Isle of Man (comparison).svg`
- **Honduras** — relevant because our Syria CS is mislabeled as Honduras

---

## 1. GENUINE BUGS (fix now)

These are real errors in the data, not just template limitations:

### Bugs in national flag CS/SVG (wrong colors, wrong structure)

| File | Bug | Fix |
|------|-----|-----|
| `syria/flag.cs.svg` | Title says "Honduras" (copy-paste!) | Fix title to Syria |
| `lebanon/flag.cs.svg` | Bottom stripe green `#008B45` | Should be red (Lebanese flag is red-white-red) |
| `angola/flag.cs.svg` | Bottom half yellow `#ffcd00` | Should be black (Angolan flag is red/black) |
| `portugal/flag.cs.svg` | 3 equal horizontal stripes | Should be vertical 2/5-3/5 split (use Commons ref) |
| `afghanistan/flag.cs.svg` | white/black/red stripes | Should be black/red/green |
| `belgium/flag.svg` | Ratio 3:2 (900x600) | Should be 13:15 (~900x780) |
| `argentina/flag.svg` + `flag.cs.svg` | Ratio 5:8 | Should be 9:14 |
| `qatar/flag.svg` | 10 serration points | Should be 9 |
| `malaysia/flag.svg` | Canton height 8.5 | Should be 8 |
| `china/flag.cs.svg` | Country code "CHI" | Should be "CHN" |
| `switzerland/flag.svg` | Red is `#FF0000` | Should be `#DA291C` (Pantone 485) |
| `andorra/flag.cs.svg` | Stripe proportions ~5:7:5 | Should be 8:9:8 |
| `chile/flag.cs.svg` | Canton shape is irregular quadrilateral | Should be rectangle |
| `mauritania/flag.cs.svg` | Equal triband | Should be green with narrow red borders |

### Bugs in flag.md text (factual errors)

| Flag | Error | Correction |
|------|-------|------------|
| Argentina | "12 February 1812" | **27 February** 1812 |
| Colombia | "vertical arrangement" | **horizontal** |
| Cuba | "red chevron" | It's a **triangle** |
| Iran | "22nd day of Bahram" | **Bahman** |
| India | Communal color interpretation | Official: saffron=renunciation, green=life |
| China | "scholars and merchants" | Working class, peasantry, petty bourgeoisie, national bourgeoisie |
| Kenya | "KANU in 1951" | KANU founded **1960** |
| Russia | "influenced by Dutch studies" (1693) | Dutch trip was **1697-98** |
| Russia | "readopted 21 August 1991" | **22 August** 1991 |
| Czech Republic | "dissolution in 1992" | **1 January 1993** |
| Ghana | "change in 1962" | **1964** |
| Nigeria | "1958 competition" | **1959** |
| Norway | "1899 after separation from Sweden" | Separation was **1905** |
| Pakistan | "created by Jinnah" | Designer was **Amiruddin Kidwai** |
| Comoros | "derives from derives from" | Duplicate words |
| Persia/Qajar | "1789" then "1785" in same file | Contradictory dates |
| Syria | CS has 3 red stars, SVG has 2 green | Inconsistent era representation |

---

## 2. PLACEHOLDER CS FILES (template limitations, not bugs)

Many CS files use a simplified equal-band template. These are acceptable as placeholders but could be improved when proper reference material exists online (see Wikimedia cross-reference above).

---

## 3. COLOR MISMATCHES (svg vs cs.svg)

These should be reconciled — pick the correct official color and use it consistently:

(see table below)

---

## 4. HISTORICAL REFERENCE: Previous "Wrong Design" Analysis

The following were flagged by automated review but are mostly **template placeholders**, not bugs. They could be improved using Wikimedia Commons references where available.

### Placeholder CS for national flags

| File | What CS Shows | What It Should Be |
|------|--------------|-------------------|
| `portugal/flag.cs.svg` | 3 horizontal stripes (green/red/yellow) | Vertical 2/5-3/5 green-red split + coat of arms |
| `lebanon/flag.cs.svg` | red-white-**green** triband | red-white-**red** (Lebanese flag) |
| `angola/flag.cs.svg` | Bottom half yellow | Bottom half should be **black** |
| `afghanistan/flag.cs.svg` | white/black/red stripes | black/red/**green** stripes |
| `kenya/flag.cs.svg` | Solid black rectangle | Non-functional placeholder, no actual construction |
| `andorra/flag.cs.svg` | Stripe proportions ~5:7:5 | Official proportions 8:9:8 |
| `chile/flag.cs.svg` | Canton drawn as irregular quadrilateral | Should be a rectangle |
| `turkey/flag.cs.svg` | Red-white bicolor stub | Solid red with white crescent/star |
| `mauritania/flag.cs.svg` | Equal green/gold/red triband | Green field with narrow red border stripes |
| `oman/flag.cs.svg` | 3 equal vertical stripes | Horizontal tricolor + vertical red hoist bar |
| `syria/flag.cs.svg` | Title says "Honduras" (copy-paste!); 3 red stars | SVG has 2 green stars; title wrong |

### Wrong flag design — British Ensigns shown as tribands

All these should be solid blue/red fields with Union Jack cantons:

| File | Wrong Design |
|------|-------------|
| `colonial/gh-gold-coast.cs.svg` | blue/red/white triband |
| `colonial/ke-colonial.cs.svg` | blue/red/white triband |
| `colonial/british-palestine.cs.svg` | blue/red/white triband |
| `colonial/british-somaliland.cs.svg` | blue/red/white triband |
| `british-antarctic-territory/flag.cs.svg` | white/blue/red triband |
| `india-hist/british-raj.cs.svg` | red/blue/white triband |
| `australia-sub/au-new-south-wales.cs.svg` | blue/red/white triband |

### Wrong flag design — Crown Dependencies (all show generic tribands)

| File | Actual Design |
|------|--------------|
| `guernsey/flag.cs.svg` | St George's Cross + gold cross |
| `jersey/flag.cs.svg` | Red saltire on white |
| `mann/flag.cs.svg` | Solid red + triskelion |
| `sark/flag.cs.svg` | White + red cross + lions |

### Wrong flag design — Historical Europe

| File | What CS Shows | Should Be |
|------|--------------|-----------|
| `germany-hist/de-nazi.cs.svg` | red/white/black triband | Solid red + white circle + symbol |
| `italy-hist/it-social-republic.cs.svg` | Horizontal stripes | **Vertical** stripes |
| `russia-hist/ru-sfsr.cs.svg` | Red/blue horizontal | Red field + blue vertical bar |
| `russia-hist/soviet-union.cs.svg` | Red/gold horizontal | Solid red field |
| `uk-hist/scotland-kingdom.cs.svg` | Gold/red horizontal | Gold field + red lion |
| `spain-hist/es-empire.cs.svg` | White/red horizontal | White + red raguly saltire |
| `spain-hist/es-francoist.cs.svg` | Solid red | Red-yellow-red triband |
| `spain-sub/es-basque.cs.svg` | Red/white/green triband | Red field + green saltire + white cross |
| `france-hist/fr-free-france.cs.svg` | Solid blue | Blue-white-red tricolor |
| `poland-hist/pl-november-uprising.cs.svg` | Plain white, no colors | Should have colored stripes |

### Wrong flag design — UK Sub-national

| File | What CS Shows | Should Be |
|------|--------------|-----------|
| `uk-sub/uk-northern-ireland.cs.svg` | white/red/blue triband | White + red cross + emblem |
| `uk-sub/uk-cornwall.cs.svg` | Black/white bicolor | White cross on black |
| `uk-sub/uk-scotland.cs.svg` | Blue/white bicolor | White diagonal saltire on blue |
| `uk-sub/uk-england.cs.svg` | Plain white | White + red St George's Cross |

### Wrong flag design — Historical Asia

| File | What CS Shows | Should Be |
|------|--------------|-----------|
| `japan-hist/jp-rising-sun-army.cs.svg` | White/red bicolor | Sunburst pattern |
| `japan-hist/jp-rising-sun-navy.cs.svg` | White/red bicolor (identical to army) | Sunburst with offset disc |
| `china-hist/cn-qing-dragon.cs.svg` | Yellow/blue bicolor | Solid yellow field |
| `china-hist/cn-five-coloured.cs.svg` | Solid red | Five horizontal stripes |
| `india-sub/in-sikkim.cs.svg` | Red/white/blue tricolor | White + red border + Buddhist wheel |
| `india-sub/in-tamil-nadu.cs.svg` | Solid black | Colored vertical stripes |
| `pakistan-hist/pk-muslim-league.cs.svg` | Green/white bicolor | Solid green field |
| `thailand-hist/th-siam-elephant.cs.svg` | Red/white bicolor | Solid red + white elephant |

### Wrong flag design — US States (most are wrong)

| File | What CS Shows | Should Be |
|------|--------------|-----------|
| `us-states/us-texas.cs.svg` | Horizontal blue/white bicolor | Vertical blue stripe + horiz white/red |
| `us-states/us-puerto-rico.cs.svg` | 3 stripes, red triangle | 5 stripes, **blue** triangle |
| `us-states/us-mississippi.cs.svg` | blue/red/white order | blue/**white**/**red** order |
| `us-states/us-colorado.cs.svg` | blue/white/**red** bottom | blue/white/**blue** bottom |
| `us-states/us-georgia.cs.svg` | red/white/**blue** bottom | red/white/**red** bottom |
| `us-states/us-new-york.cs.svg` | Blue/gold bicolor | Solid blue field |
| `us-states/us-alaska.cs.svg` | Blue/gold bicolor | Solid dark blue field |
| `us-states/us-south-carolina.cs.svg` | Blue/white bicolor | Solid indigo field |
| `us-states/us-new-mexico.cs.svg` | Red/gold bicolor | Solid gold + red Zia |
| `us-states/us-hawaii.cs.svg` | Solid blue | 8 stripes + UJ canton |
| `us-states/us-maryland.cs.svg` | Solid black | Quartered heraldic design |

### Wrong flag design — Other

| File | Issue |
|------|-------|
| `gibraltar/flag.cs.svg` | White/red/gold triband — actual is white-over-red bicolour (2:1) |
| `anguilla/anguilla-dolphin.cs.svg` | Bottom stripe orange — should be turquoise |
| `caliphates/ottoman.cs.svg` | Red/white bicolor — should be solid red |
| `intl/united-nations.cs.svg` | Blue/white bicolor — should be solid blue |
| `intl/nato.cs.svg` | Blue/white bicolor — should be solid blue |
| `intl/european-union.cs.svg` | Blue/yellow bicolor — should be solid blue + stars |
| `intl/red-cross.cs.svg` | White/red bicolor — should be white + red cross |
| `pride/pride-rainbow.cs.svg` | Solid red — should be 6-stripe rainbow |
| `pride/pride-progress.cs.svg` | Solid red — should be rainbow + chevron |
| `pride/pride-trans.cs.svg` | 3 stripes — should be 5 symmetric stripes |
| `juneteenth/flag.cs.svg` | Red/blue/white tricolor — completely different design |
| `canada-sub/ca-quebec.cs.svg` | Blue/white bicolor — should be blue + white cross |
| `canada-sub/ca-alberta.cs.svg` | Blue/gold bicolor — should be solid blue |
| `bangladesh-hist/bd-1971-map.cs.svg` | Green/red/gold triband — should be green field + red disc + map |
| `us-hist/us-confederate-stars-bars.cs.svg` | Red/white/blue — should be red/white/red + blue canton |

### Wrong aspect ratio

| File | Current | Official |
|------|---------|----------|
| `belgium/flag.svg` | 3:2 (900x600) | 13:15 (~900x780) |
| `argentina/flag.svg` + `flag.cs.svg` | 5:8 | 9:14 |
| `spain-sub/es-basque.cs.svg` | 2:3 | 14:25 |
| `germany-sub/de-bavaria.cs.svg` | 2:3 | 3:5 |

### Wrong SVG content

| File | Issue |
|------|-------|
| `afghanistan/flag.svg` | Shows old tricolour; text describes current Taliban flag |
| `qatar/flag.svg` | 10 serration points instead of 9 |
| `malaysia/flag.svg` | Canton height 8.5 instead of 8 |
| `tunisia/flag.svg` | Crescent proportions inaccurate vs CS |
| `china/flag.cs.svg` | Country code "CHI" — should be "CHN" |

---

## 2. TEXT ERRORS (flag.md)

### Factual errors

| Flag | Error | Correction |
|------|-------|------------|
| Argentina | "first raised on 12 February 1812" | Should be **27 February** 1812 |
| Colombia | "current vertical arrangement" | Stripes are **horizontal**, not vertical |
| Cuba | Calls the red triangle a "chevron" | It's a **triangle** |
| Iran | "22nd day of Bahram" | Correct month is **Bahman** |
| India | Uses rejected communal color interpretation (saffron=Hindus, green=Muslims) | Official: saffron=renunciation, green=life |
| China | "workers, peasants, scholars, and merchants" | Should be working class, peasantry, urban petty bourgeoisie, national bourgeoisie |
| Kenya | "KANU's flag introduced in 1951" | KANU founded in **1960** |
| Russia | Flag made in 1693 "influenced by Dutch studies" | Dutch trip was **1697-98** (after 1693) |
| Russia | "readopted on 21 August 1991" | Should be **22 August** 1991 |
| Czech Republic | "dissolution in 1992" | Dissolution was **1 January 1993** |
| Ghana | "brief change in 1962" | Should be **1964** |
| Nigeria | "1958 national competition" | Competition was **1959** |
| Norway | "approved in 1899 after separation from Sweden" | Separation was **1905** |
| Pakistan | "created by Muhammad Ali Jinnah" | Designer was **Syed Amiruddin Kidwai** |
| Persia/Qajar | "Qajar Dynasty (1789-1925)" then "1785-1925" | Contradictory dates in same file |
| Greece | "established in 1978" | Should say **re-adopted** in 1978 |

### Minor text issues

| Flag | Issue |
|------|-------|
| Comoros | Duplicate "derives from derives from" typo |
| Andorra | No adoption date mentioned |
| Comoros | No adoption date mentioned |
| Jordan | Missing `# Flag of Jordan` title heading |
| Lebanon | Missing `# Flag of Lebanon` title heading |
| Persia/Pahlavi | Missing sentence punctuation |
| Persia/Qajar | Missing sentence punctuation |

---

## 3. COLOR MISMATCHES (flag.svg vs flag.cs.svg)

Flags where the SVG and its construction sheet use different hex values:

| Flag | SVG Color | CS Color | Which is correct? |
|------|-----------|----------|-------------------|
| Hungary red | `#CE2939` | `#CD2A3E` | Debatable |
| Hungary green | `#477050` | `#436F4D` | Debatable |
| India saffron | `#FF6820` | `#FF671F` | Neither (official ~`#FF9933`) |
| India green | `#046A38` | `#046A38` | Both differ from official `#138808` |
| Iraq red | `#CE1126` | `#CD1125` | SVG closer to official |
| Iraq green | `#007A3D` | `#017B3D` | SVG closer |
| Bangladesh red | `#F42A41` | `#DA291C` | CS correct (Pantone 485) |
| Bangladesh green | `#006A4E` | `#006747` | SVG correct |
| Bahrain red | `#CE1126` | `#DA291C` | Neither (official `#C8102E`) |
| Brazil green | `#009440` | n/a | Official ~`#009B3A` |
| Brazil blue | `#302681` | n/a | Official ~`#002776` (SVG has purple tint) |
| Australia blue | `#012169` | `#00008B` | CS correct |
| Spain red | `#AD1519` | `#C60B1E` | SVG correct |
| Spain yellow | `#FABD00` | `#FFC400` | SVG correct |
| Switzerland red | `#FF0000` | `#DA291C` | CS correct (Pantone 485) |
| Thailand white | `#F4F5F8` | `#FFFFFF` | CS correct |
| Albania red | `#FF0000` | `#DA291C` | CS correct |
| Denmark red | `#C8102E` | `#C60C30` | SVG correct |
| Fiji blue | `#62B5E5` | `#68BFE5` | Inconsistent |
| Finland blue | `#002F6C` | `#003580` | Both approximations |
| Ukraine blue | `#0057B7` | `#005BBB` | SVG correct |
| Ukraine yellow | `#FFD700` | `#FFD500` | SVG correct |
| Lebanon red | `#ED1C24` | `#E4312B` | Inconsistent |
| Kuwait green | `#007A3D` | `#00965E` | SVG correct |
| Palestine green | `#007A5E` | `#009739` | Neither standard |
| Sudan green | `#007A5E` | `#007229` | CS correct |
| Sudan red | `#CE1126` | `#D21034` | CS correct |
| UAE green | `#007A5E` | `#00732F` | CS correct |
| Mauritania (all colors) | `#CD2A3E`/`#006233`/`#FFC400` | `#D01C1F`/`#00A95C`/`#FFD700` | Completely different |
| Saudi Arabia green | `#005430` | `#005430` | Both wrong (official `#006C35`) |
| Angola red | `#CC092F` | `#C8102E` | Inconsistent |
| Angola gold | `#FFCB00` | `#FFCD00` | Inconsistent |
| New Zealand blue | `#012169` | `#012169` | Both wrong (official `#00247D`) |
| Colombia (all colors) | `#FFCD00`/`#003087`/`#C8102E` | `#FCD116`/`#003893`/`#CE1126` | CS closer to official |

---

## 4. GOOD FLAGS (no significant issues)

These flags passed all checks (text, SVG, and construction sheet):

Austria, Antigua & Barbuda, Ireland, Italy, Indonesia, Libya, Netherlands,
South Africa, Tanzania, Sweden, US, UK, Japan (minor), France, Germany,
Egypt, Ethiopia, Djibouti, Romania (minor), Philippines, Denmark (minor),
Korea (South), Vietnam, Yemen, Tunisia (CS good, SVG crescent off)
