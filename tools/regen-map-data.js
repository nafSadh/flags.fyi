#!/usr/bin/env node
// Regenerates map/data.json by merging data/flags.json into the existing
// map dataset. Preserves iso/centroid from the prior map/data.json so the
// world-map geometry keeps working; rebuilds each country's flags[] array
// from data/flags.json and preserves year_start/year_end/hex_colors from
// the prior dataset when available.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const flagsJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/flags.json'), 'utf8'));
const includesJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/includes.json'), 'utf8'));
const prior = JSON.parse(fs.readFileSync(path.join(ROOT, 'map/data.json'), 'utf8'));

// Alias: map ids that changed between data/flags.json and the old map/data.json
const mapIdAliases = {
  'united-states': 'us',
  'united-arab-emirates': 'uae',
  'north-korea': 'korea-dprk',
  'mayotte': 'comoros-mayotte',
  'mohéli': 'moheli'
};
// Re-key prior by new id so lookups work
const priorAliased = {};
for (const [oldId, v] of Object.entries(prior)) {
  const newId = mapIdAliases[oldId] || oldId;
  priorAliased[newId] = { ...v, id: newId };
}
Object.assign(prior, priorAliased);

// Build prior flag-by-slug index for year/color carry-over
const priorFlagIndex = {};
for (const country of Object.values(prior)) {
  for (const f of country.flags || []) {
    priorFlagIndex[f.slug] = f;
  }
}

function parseYears(years) {
  if (!years) return { year_start: null, year_end: null };
  // "1234–1567", "550–330 BC", "247 BC–224 AD", "1789–1925", "1236–1795"
  const m = years.match(/(\d{1,4})\s*(BC)?\s*[–\-]\s*(\d{1,4})\s*(BC|AD)?/);
  if (m) {
    let [, s, sBC, e, eBC] = m;
    let ys = parseInt(s) * (sBC === 'BC' ? -1 : 1);
    let ye = parseInt(e) * (eBC === 'BC' ? -1 : 1);
    return { year_start: ys, year_end: ye };
  }
  const single = years.match(/(\d{1,4})/);
  if (single) return { year_start: parseInt(single[1]), year_end: null };
  return { year_start: null, year_end: null };
}

function getFlagSvg(id, fd) {
  if (fd.flag) return '/' + fd.flag;
  const ns = fd.ns || id.split('-')[0];
  let namePart;
  if (id === ns) {
    namePart = 'flag';
  } else if (id.includes('/')) {
    namePart = id.substring(id.indexOf('/') + 1);
  } else if (id.startsWith(ns + '-')) {
    namePart = id.substring(ns.length + 1);
  } else {
    namePart = id;
  }
  const folder = ns.split('.')[0];
  return '/' + folder + '/' + namePart + '.svg';
}

// Build new map data
const out = {};

// 1. Collect each current country
for (const [id, fd] of Object.entries(flagsJson)) {
  const g = (fd.g || '').split(',').map(s => s.trim());
  if (fd.now) continue; // historical
  if (g.includes('sub') || g.includes('bot')) continue;
  if (g.includes('intl') || g.includes('maritime') || g.includes('pride') || g.includes('pan')) continue;
  if (g.includes('empire') || g.includes('caliphate') || g.includes('colonial') || g.includes('h')) continue;
  if (g.includes('city')) continue;
  if (!g.includes('nf')) continue;

  const priorCountry = prior[id] || {};
  out[id] = {
    id,
    name: fd.name || id,
    current_flag: getFlagSvg(id, fd),
    flags: [],
    iso: priorCountry.iso || null,
    centroid: priorCountry.centroid || null
  };
}

// 2. For each flag in data/flags.json, route to appropriate country
for (const [id, fd] of Object.entries(flagsJson)) {
  const g = (fd.g || '').split(',').map(s => s.trim());

  // Skip non-national-attributable: intl, maritime, pride, pan, cities
  if (g.includes('intl') || g.includes('maritime') || g.includes('pride') || g.includes('pan')) continue;
  if (g.includes('city')) continue;

  // Determine target country
  let targetId = null;
  if (fd.now) {
    targetId = Array.isArray(fd.now) ? fd.now[0] : fd.now;
  } else if (id.includes('/')) {
    // Subdivision ids like "us/california" → parent country "us"
    targetId = id.substring(0, id.indexOf('/'));
  } else {
    targetId = id; // its own country
  }
  // Map parent-code aliases (us → us, uk → ? etc.)
  const codeToCountry = {
    'ca': 'canada', 'au': 'australia', 'de': 'germany', 'es': 'spain',
    'in': 'india', 'it': 'italy', 'fr': 'france', 'br': 'brazil',
    'mx': 'mexico', 'ar': 'argentina', 'ch': 'switzerland', 'jp': 'japan',
    'id': 'indonesia', 'ru': 'russia', 'pl': 'poland', 'ua': 'ukraine',
    'at': 'austria', 'cz': 'czech-republic', 'hu': 'hungary', 'ro': 'romania',
    'co': 'colombia', 'pe': 'peru', 'cl': 'chile', 've': 'venezuela',
    'bo': 'bolivia', 'nl': 'netherlands', 'be': 'belgium', 'gr': 'greece',
    'pt': 'portugal', 'ph': 'philippines', 'uk': 'uk'
  };
  if (codeToCountry[targetId]) targetId = codeToCountry[targetId];
  if (!out[targetId]) continue; // no matching map-country

  const priorFlag = priorFlagIndex[id] || {};
  const isCurrent = !fd.now && g.includes('nf');
  const isSub = g.includes('sub') || g.includes('bot');
  const years = parseYears(fd.years);

  const flagEntry = {
    slug: id,
    name: fd.name || id,
    full_name: fd.name + (fd.years ? ` (${fd.years})` : '') + (fd.now ? ` → ${Array.isArray(fd.now) ? fd.now.join(', ') : fd.now}` : ''),
    flag_svg: getFlagSvg(id, fd),
    year_start: priorFlag.year_start ?? years.year_start,
    year_end: priorFlag.year_end ?? years.year_end,
    is_sub: isSub,
    is_current: isCurrent,
    colors: priorFlag.colors || [],
    groups: g.filter(t => ['empire','caliphate','colonial','h','nf','sub','bot'].includes(t)).map(t => t === 'h' ? 'historic' : t),
    hex_colors: priorFlag.hex_colors || []
  };
  if (priorFlag.adopted != null) flagEntry.adopted = priorFlag.adopted;

  out[targetId].flags.push(flagEntry);
}

// 3. Sort flags within each country: current first, then by year
for (const country of Object.values(out)) {
  country.flags.sort((a, b) => {
    if (a.is_current && !b.is_current) return -1;
    if (!a.is_current && b.is_current) return 1;
    const ya = a.year_start ?? 9999;
    const yb = b.year_start ?? 9999;
    return ya - yb;
  });
}

// 4. Log missing iso/centroid so user can fill later
const missing = Object.values(out).filter(c => !c.iso || !c.centroid).map(c => c.id);
if (missing.length) {
  console.error('Countries without iso/centroid (won\'t appear on map):');
  for (const id of missing) console.error('  - ' + id);
}

const beforeCount = Object.keys(prior).length;
const afterCount = Object.keys(out).length;
const beforeFlagCount = Object.values(prior).reduce((a, c) => a + (c.flags || []).length, 0);
const afterFlagCount = Object.values(out).reduce((a, c) => a + c.flags.length, 0);

fs.writeFileSync(path.join(ROOT, 'map/data.json'), JSON.stringify(out));
console.log(`countries: ${beforeCount} → ${afterCount}`);
console.log(`flag entries on map: ${beforeFlagCount} → ${afterFlagCount}`);
