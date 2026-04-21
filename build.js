#!/usr/bin/env node
/**
 * build.js — Static site generator for flags.fyi
 *
 * Reads flag data from data/ and per-namespace /{ns}/ dirs at repo root,
 * then generates static HTML pages into the repo root so that
 * the repo itself IS the gh-pages deployable (no separate build output).
 *
 * Usage:  node build.js
 */

const fs = require('fs');
const path = require('path');

// ─── paths ───────────────────────────────────────────────────────────────────
// Flag sources live directly in /{namespace}/ dirs at repo root — flag.svg,
// flag.md, flags.json co-located with the generated index.html. No separate
// assets/ staging dir; build.js reads and writes in the same tree.
const ROOT = __dirname;
const DATA = path.join(ROOT, 'data');
const ASSETS_FLAGS = ROOT;

// ─── simple Markdown renderer (no external dep needed) ───────────────────────
// Handles: headings, paragraphs, bold, italic, links, lists, tables, code
function renderMarkdown(md) {
  if (!md) return '';
  let html = '';
  const lines = md.split('\n');
  let i = 0;
  let inList = false;
  let inTable = false;

  while (i < lines.length) {
    let line = lines[i];

    // blank line
    if (line.trim() === '') {
      if (inList) { html += '</ul>\n'; inList = false; }
      if (inTable) { html += '</tbody></table>\n'; inTable = false; }
      i++;
      continue;
    }

    // table detection
    if (line.includes('|') && i + 1 < lines.length && /^\s*\|?\s*[-:]+/.test(lines[i + 1])) {
      if (inList) { html += '</ul>\n'; inList = false; }
      const headers = line.split('|').map(c => c.trim()).filter(c => c);
      html += '<table class="striped">\n<thead><tr>';
      for (const h of headers) html += `<th>${inlineFormat(h)}</th>`;
      html += '</tr></thead>\n<tbody>\n';
      inTable = true;
      i += 2; // skip separator
      continue;
    }

    // table row
    if (inTable && line.includes('|')) {
      const cells = line.split('|').map(c => c.trim()).filter(c => c);
      html += '<tr>';
      for (const c of cells) html += `<td>${inlineFormat(c)}</td>`;
      html += '</tr>\n';
      i++;
      continue;
    }

    // heading
    const headingMatch = line.match(/^(#{1,6})\s+(.*)/);
    if (headingMatch) {
      if (inList) { html += '</ul>\n'; inList = false; }
      if (inTable) { html += '</tbody></table>\n'; inTable = false; }
      const level = headingMatch[1].length;
      html += `<h${level}>${inlineFormat(headingMatch[2])}</h${level}>\n`;
      i++;
      continue;
    }

    // unordered list
    if (/^\s*[-*]\s+/.test(line)) {
      if (!inList) { html += '<ul>\n'; inList = true; }
      const content = line.replace(/^\s*[-*]\s+/, '');
      html += `  <li>${inlineFormat(content)}</li>\n`;
      i++;
      continue;
    }

    // paragraph
    if (inList) { html += '</ul>\n'; inList = false; }
    if (inTable) { html += '</tbody></table>\n'; inTable = false; }
    let para = '';
    while (i < lines.length && lines[i].trim() !== '' && !/^#{1,6}\s/.test(lines[i]) && !/^\s*[-*]\s+/.test(lines[i])) {
      para += (para ? ' ' : '') + lines[i].trim();
      i++;
    }
    html += `<p>${inlineFormat(para)}</p>\n`;
    continue;
  }

  if (inList) html += '</ul>\n';
  if (inTable) html += '</tbody></table>\n';
  return html;
}

function inlineFormat(text) {
  if (!text) return '';
  // bold
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/__(.+?)__/g, '<strong>$1</strong>');
  // italic
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
  text = text.replace(/_(.+?)_/g, '<em>$1</em>');
  // code
  text = text.replace(/`(.+?)`/g, '<code>$1</code>');
  // links
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return text;
}

// ─── load data ───────────────────────────────────────────────────────────────
const flagsJson = JSON.parse(fs.readFileSync(path.join(DATA, 'flags.json'), 'utf8'));
const includesJson = JSON.parse(fs.readFileSync(path.join(DATA, 'includes.json'), 'utf8'));
const colorInfoJson = JSON.parse(fs.readFileSync(path.join(DATA, 'color-info.json'), 'utf8'));
const groupInfoJson = JSON.parse(fs.readFileSync(path.join(DATA, 'group-info.json'), 'utf8'));

// ─── build navigation order ─────────────────────────────────────────────────
// Tiers: 1) Countries (current first, then historic reverse-chrono)
//        2) Subdivisions
//        3) Active intl orgs, then defunct
//        4) Pan-movements, pride, maritime, misc
//        5) Empires / caliphates / historic regions not tied to one country
const metaJson = (() => {
  const allIds = Object.keys(flagsJson);
  const gs = id => (flagsJson[id].g || '').split(',').map(s => s.trim()).filter(Boolean);

  const regionGroups = new Set([
    'nf','africa','asia','europe','oceania','caribbean',
    'south-america','north-america','nordic','south-asia','southeast-asia',
    'east-asia','central-asia','arab','gulf','levant','maghreb','horn-of-africa'
  ]);

  // Build country -> historic predecessors map
  // When a flag has multiple successors (e.g., british-raj → india,pakistan,bangladesh),
  // only attach it to the FIRST successor's nav chain to avoid duplicates/loops.
  const countryHistoric = {}; // successor-id -> [predecessor-ids]
  const historicAssignedTo = {}; // predecessor-id -> successor-id (first only)
  for (const id of allIds) {
    const f = flagsJson[id];
    if (!f.now) continue;
    const nowIds = Array.isArray(f.now) ? f.now : [f.now];
    const primaryNow = nowIds[0]; // attach to first successor only for nav
    if (!countryHistoric[primaryNow]) countryHistoric[primaryNow] = [];
    countryHistoric[primaryNow].push(id);
    historicAssignedTo[id] = primaryNow;
  }

  // Parse start year from "years" field like "1918–1990" or "adopted" field
  function startYear(id) {
    const f = flagsJson[id];
    if (f.years) {
      const m = f.years.match(/(\d{3,4})/);
      return m ? parseInt(m[1]) : 9999;
    }
    return 9999;
  }

  // Sort historic flags: reverse chronological (most recent first)
  function sortHistoricReverseChrono(ids) {
    return ids.slice().sort((a, b) => startYear(b) - startYear(a));
  }

  const assigned = new Set();

  // ── Tier 1: Countries ──
  // A "current country" flag: has a region/continent group, no 'now' field,
  // and is not tagged as empire/caliphate/intl/sub/bot/pan/pride/maritime
  const nonCountryTags = new Set(['empire','caliphate','intl','sub','bot','pan','pride','maritime','colonial','fn']);
  function isCurrentCountry(id) {
    const f = flagsJson[id];
    if (f.now) return false; // historic
    const g = gs(id);
    if (g.some(t => nonCountryTags.has(t))) return false;
    if (g.some(t => regionGroups.has(t))) return true;
    return false;
  }

  // Collect country groups: current flag + its historic predecessors
  const countryGroups = []; // [{name, ids: [current, ...historic]}]
  for (const id of allIds) {
    if (!isCurrentCountry(id)) continue;
    const name = (flagsJson[id].name || id).toLowerCase();
    const group = [id];
    assigned.add(id);
    if (countryHistoric[id]) {
      const sorted = sortHistoricReverseChrono(countryHistoric[id]);
      for (const hid of sorted) {
        group.push(hid);
        assigned.add(hid);
      }
    }
    countryGroups.push({ name, ids: group });
  }
  // Also add defunct countries (have 'now' but not empire/caliphate, not already assigned)
  for (const id of allIds) {
    if (assigned.has(id)) continue;
    const f = flagsJson[id];
    const g = gs(id);
    if (f.now && !g.includes('empire') && !g.includes('caliphate') && !g.includes('colonial')) {
      // This is a historic flag that maps to a country but the country isn't in our list
      // (e.g., points to multiple countries) — assign to first successor alphabetically
      assigned.add(id);
      // Try to attach to an existing country group
      const nowIds = Array.isArray(f.now) ? f.now : [f.now];
      let attached = false;
      for (const cg of countryGroups) {
        if (nowIds.includes(cg.ids[0])) {
          // Already should be there, but double check
          if (!cg.ids.includes(id)) cg.ids.push(id);
          attached = true;
          break;
        }
      }
      if (!attached) {
        // Standalone defunct country (like yugoslavia)
        const name = (f.name || id).toLowerCase();
        countryGroups.push({ name, ids: [id] });
      }
    }
  }
  countryGroups.sort((a, b) => a.name.localeCompare(b.name));
  const tier1 = countryGroups.flatMap(cg => cg.ids);

  // ── Tier 2: Subdivisions (sub, bot) ──
  const tier2 = allIds.filter(id => {
    if (assigned.has(id)) return false;
    const g = gs(id);
    return g.includes('sub') || g.includes('bot');
  }).sort((a, b) => (flagsJson[a].name || a).localeCompare(flagsJson[b].name || b));
  tier2.forEach(id => assigned.add(id));

  // ── Tier 3: International organizations (active, then defunct) ──
  const tier3active = allIds.filter(id => {
    if (assigned.has(id)) return false;
    return gs(id).includes('intl') && !flagsJson[id].now;
  }).sort((a, b) => (flagsJson[a].name || a).localeCompare(flagsJson[b].name || b));
  const tier3defunct = allIds.filter(id => {
    if (assigned.has(id)) return false;
    return gs(id).includes('intl') && flagsJson[id].now;
  }).sort((a, b) => (flagsJson[a].name || a).localeCompare(flagsJson[b].name || b));
  const tier3 = [...tier3active, ...tier3defunct];
  tier3.forEach(id => assigned.add(id));

  // ── Tier 4: Empires, caliphates, colonial, historic regions ──
  // Exclude flags that belong in tier 5 by category even if they carry the h tag
  // (h = historical; a maritime/pride/pan flag can be historical without being an empire).
  const tier4 = allIds.filter(id => {
    if (assigned.has(id)) return false;
    const g = gs(id);
    if (g.includes('maritime') || g.includes('pride') || g.includes('pan')) return false;
    return g.includes('empire') || g.includes('caliphate') || g.includes('colonial') || g.includes('h');
  }).sort((a, b) => (flagsJson[a].name || a).localeCompare(flagsJson[b].name || b));
  tier4.forEach(id => assigned.add(id));

  // ── Tier 5: Everything else (pan, pride, maritime, misc) ──
  const tier5 = allIds.filter(id => !assigned.has(id))
    .sort((a, b) => (flagsJson[a].name || a).localeCompare(flagsJson[b].name || b));

  const ordered = [...tier1, ...tier2, ...tier3, ...tier4, ...tier5];

  // Build circular prev/next WITHIN each tier (nav stays in category)
  const meta = {};
  const tierLabel = {};
  const tiers = [
    { ids: tier1, label: 'countries' },
    { ids: tier2, label: 'subdivisions' },
    { ids: tier3, label: 'intl' },
    { ids: tier4, label: 'empires' },
    { ids: tier5, label: 'other' },
  ];
  for (const { ids, label } of tiers) {
    if (!ids.length) continue;
    for (let i = 0; i < ids.length; i++) {
      const prev = ids[(i - 1 + ids.length) % ids.length];
      const next = ids[(i + 1) % ids.length];
      meta[ids[i]] = { prev, next, cat: label };
      tierLabel[ids[i]] = label;
    }
  }

  // Write updated meta.json
  fs.writeFileSync(path.join(DATA, 'meta.json'), JSON.stringify(meta, null, 2) + '\n');
  console.log(`  Navigation order: ${ordered.length} flags (${tier1.length} countries, ${tier2.length} subdivisions, ${tier3.length} intl, ${tier4.length} empires/hist, ${tier5.length} other)`);

  return { meta, tiers: { countries: tier1, subdivisions: tier2, intl: tier3, empires: tier4, other: tier5 }, countryGroups };
})();
const navTiers = metaJson.tiers;

// ─── assign id + index fields to flags.json ─────────────────────────────────
(() => {
  const allIds = Object.keys(flagsJson);

  // Map subdivision prefix → parent country name
  const subCountryMap = {
    'us': 'us', 'ca': 'ca', 'uk': 'uk', 'de': 'de', 'es': 'es',
    'au': 'au', 'in': 'in',
  };

  // Map BOT flags to uk
  const botParent = 'uk';

  function startYear(id) {
    const f = flagsJson[id];
    if (f.years) { const m = f.years.match(/(\d{3,4})/); return m ? parseInt(m[1]) : null; }
    return null;
  }

  // Build a set for tier membership lookups
  const subSet = new Set(navTiers.subdivisions);
  const intlSet = new Set(navTiers.intl);
  const empireSet = new Set(navTiers.empires);
  const countrySet = new Set(navTiers.countries);

  for (const [id, f] of Object.entries(flagsJson)) {
    f.id = id;
    const gs = (f.g || '').split(',').map(s => s.trim()).filter(Boolean);

    if (subSet.has(id)) {
      // Subdivision: c/{parent}/{suffix-from-id}
      // Ids use "/" for renamed subs (us/california) or legacy "-" (bermuda, anguilla-governor).
      const sep = id.includes('/') ? '/' : '-';
      const prefix = id.split(sep)[0];
      const parent = subCountryMap[prefix] || (gs.includes('bot') ? botParent : prefix);
      const suffix = id.startsWith(prefix + sep) ? id.substring(prefix.length + 1) : id;
      f.index = 'c/' + parent + '/' + suffix;
    } else if (intlSet.has(id)) {
      const name = (f.name || id).toLowerCase().replace(/\s+/g, '-');
      f.index = 'i/' + name;
    } else if (empireSet.has(id)) {
      const name = (f.name || id).toLowerCase().replace(/\s+/g, '-');
      f.index = 'e/' + name;
    } else if (f.now) {
      // Historic flag → c/{successor}:{year}
      const nowIds = Array.isArray(f.now) ? f.now : [f.now];
      const primaryNow = nowIds[0];
      const successorName = (flagsJson[primaryNow] ? flagsJson[primaryNow].name || primaryNow : primaryNow).toLowerCase().replace(/\s+/g, '-');
      const yr = startYear(id);
      f.index = 'c/' + successorName + (yr ? ':' + yr : '');
    } else if (countrySet.has(id)) {
      // Current country
      const name = (f.name || id).toLowerCase().replace(/\s+/g, '-');
      f.index = 'c/' + name;
    } else {
      // Other (pan, pride, maritime, misc)
      const prefix = gs.includes('pan') ? 'p' : gs.includes('pride') ? 'r' : gs.includes('maritime') ? 'm' : 'o';
      const name = (f.name || id).toLowerCase().replace(/\s+/g, '-');
      f.index = prefix + '/' + name;
    }
  }

  fs.writeFileSync(path.join(DATA, 'flags.json'), JSON.stringify(flagsJson, null, 2) + '\n');
})();

// ─── utility functions (ported from plugins/utils.js) ────────────────────────
const noTitleCase = new Set(['a', 'an', 'and', 'of', 'the']);

function titleCase(str) {
  if (!str) return '';
  if (str.length < 3) return str.toUpperCase();
  return str.replace(/[-_]/g, ' ').split(/\s+/)
    .map(w => noTitleCase.has(w.toLowerCase()) ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function namePartFromId(flagId, namespace) {
  if (flagId === namespace) return '';
  // Subdivision ids use slash: "us/california" → namePart "california".
  // Aux flags.json entries with explicit "flag" fields override this inference.
  if (flagId.includes('/')) {
    return flagId.substring(flagId.indexOf('/') + 1);
  }
  if (flagId.startsWith(namespace + '-')) {
    return flagId.substring(namespace.length + 1);
  }
  const dashIndex = flagId.indexOf('-');
  if (dashIndex > 0 && flagId.substring(0, dashIndex) === namespace) {
    return flagId.substring(dashIndex + 1);
  }
  return flagId;
}

// Namespaces can use dot notation (e.g. "british.cd") to encode a sub-namespace
// that shares its parent's asset directory. "british.cd" → files live in /british/.
function dirName(namespace) {
  return namespace.split('.')[0];
}

function inferFlagSvg(namespace, namePart) {
  const fileNamePart = namePart && namePart.length > 0 ? namePart : 'flag';
  const folderPart = dirName(namespace);
  return folderPart + '/' + fileNamePart + '.svg';
}

function arrayText(val) {
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) return val.join(' ');
  return '';
}

function parseUse(use) {
  const useObj = { as: typeof use === 'string' ? use : 'flag' };
  if (use && typeof use === 'object') Object.assign(useObj, use);
  return useObj;
}

function rgbHex(str) {
  if (!str) return undefined;
  str = str.trim().toLowerCase();
  const expand3 = s => s[0]+s[0]+s[1]+s[1]+s[2]+s[2];
  switch (str.length) {
    case 7: return str;
    case 6: return '#' + str;
    case 4: return '#' + expand3(str.substr(1));
    case 3: return '#' + expand3(str);
  }
  return undefined;
}

function rgbParse(str) {
  const hex = rgbHex(str);
  if (!hex) return undefined;
  return {
    r: parseInt(hex.substr(1, 2), 16),
    g: parseInt(hex.substr(3, 2), 16),
    b: parseInt(hex.substr(5, 2), 16)
  };
}

function luminance(str) {
  const rgb = rgbParse(str);
  if (!rgb) return undefined;
  return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255.0;
}

// ─── resolve full flag data (merge aux data) ─────────────────────────────────
function getFullFlagData(flagId) {
  let flagData = { ...flagsJson[flagId] };
  const namespace = flagData.ns || flagId.split('-')[0];
  const namePart = namePartFromId(flagId, namespace);

  // merge aux data from includes
  if (includesJson[namespace]) {
    const auxJsonPath = path.join(ASSETS_FLAGS, dirName(namespace), includesJson[namespace]);
    if (fs.existsSync(auxJsonPath)) {
      const auxJson = JSON.parse(fs.readFileSync(auxJsonPath, 'utf8'));
      if (auxJson[flagId]) {
        flagData = { ...flagData, ...auxJson[flagId] };
      }
    }
  }

  // infer flag SVG if missing
  if (!flagData.flag) {
    flagData.flag = inferFlagSvg(namespace, namePart);
  }

  // resolve desc as text
  if (flagData.desc) {
    flagData.desc = arrayText(flagData.desc);
  }

  // resolve trivia as text
  if (flagData.trivia) {
    flagData.trivia = arrayText(flagData.trivia);
  }

  // compute title
  const name = flagData.name || titleCase(flagId);
  if (!flagData.title) {
    const usedAs = titleCase(parseUse(flagData.use).as);
    flagData.title = usedAs + ' of ' + name;
  }

  // compute display name
  flagData._name = name;
  flagData._namespace = namespace;
  flagData._namePart = namePart;

  return flagData;
}

// ─── HTML helpers ────────────────────────────────────────────────────────────
function escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function flagImgPath(flagSvgPath) {
  return '/' + flagSvgPath;
}

// ─── SEO helpers ────────────────────────────────────────────────────────────

const SITE_URL = 'https://flags.fyi';

function metaDescription(fd, flagId) {
  const title = fd.title || '';
  // Try building from desc (first bullet, truncated to ~120 chars)
  if (fd.desc) {
    const descText = typeof fd.desc === 'string' ? fd.desc : arrayText(fd.desc);
    // Extract first bullet or first sentence
    const firstBullet = descText.replace(/^[\s\-*]+/, '').split('\n')[0].trim();
    const truncated = firstBullet.length > 120 ? firstBullet.substring(0, 117) + '...' : firstBullet;
    const colorList = fd.colors ? fd.colors.map(c => titleCase(c.color)).join(', ') : '';
    const ratio = fd.ratio || '';
    let desc = title + ': ' + truncated + '.';
    if (colorList) desc += ' Colors: ' + colorList + '.';
    if (ratio) desc += ' Ratio ' + ratio + '.';
    return desc;
  }
  // Fallback: use use.as and use.since
  const useObj = parseUse(fd.use);
  const since = (typeof fd.use === 'object' && fd.use.since) ? fd.use.since : '';
  const ratio = fd.ratio || '';
  let desc = title + '.';
  if (useObj.as) desc += ' Used as ' + useObj.as;
  if (since) desc += ' since ' + since;
  if (useObj.as) desc += '.';
  if (ratio) desc += ' Aspect ratio ' + ratio + '.';
  return desc;
}

function ogTags(title, description, imagePath, urlPath) {
  return `<meta property="og:title" content="${escHtml(title)}">
  <meta property="og:description" content="${escHtml(description)}">
  <meta property="og:image" content="${SITE_URL}${imagePath}">
  <meta property="og:url" content="${SITE_URL}${urlPath}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Flags.fyi">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escHtml(title)}">
  <meta name="twitter:description" content="${escHtml(description)}">
  <meta name="twitter:image" content="${SITE_URL}${imagePath}">`;
}

function canonicalTag(urlPath) {
  return `<link rel="canonical" href="${SITE_URL}${urlPath}">`;
}

function jsonLdScript(fd, flagId) {
  const desc = metaDescription(fd, flagId);
  const imgPath = (fd.flag && fd.flag !== 'none') ? '/' + fd.flag : '/logo.svg';
  const data = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    'name': fd.title || '',
    'description': desc,
    'image': SITE_URL + imgPath,
    'url': SITE_URL + '/' + flagId + '/',
    'isPartOf': { '@type': 'WebSite', 'name': 'Flags.fyi', 'url': SITE_URL + '/' }
  };
  if (fd.of && fd.of.country) {
    data.about = { '@type': 'Country', 'name': titleCase(fd.of.country) };
  }
  return '<script type="application/ld+json">' + JSON.stringify(data) + '</script>';
}

function jsonLdWebSite() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'Flags.fyi',
    'url': SITE_URL + '/',
    'description': 'Flags.fyi: explore national, historical, and organizational flags with colors, construction sheets, and detailed descriptions.'
  };
  return '<script type="application/ld+json">' + JSON.stringify(data) + '</script>';
}

function jsonLdCollectionPage(title, description, urlPath) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': title,
    'description': description,
    'url': SITE_URL + urlPath,
    'isPartOf': { '@type': 'WebSite', 'name': 'Flags.fyi', 'url': SITE_URL + '/' }
  };
  return '<script type="application/ld+json">' + JSON.stringify(data) + '</script>';
}

// ─── shared HTML pieces (Pico CSS) ───────────────────────────────────────────
const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://gc.zgo.at",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self'",
  "connect-src 'self' https://flags-fyi.goatcounter.com https://gc.zgo.at",
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'"
].join('; ');

function htmlHead(title, extraHead = '') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="Content-Security-Policy" content="${CSP_DIRECTIVES}">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escHtml(title)} — Flags.fyi</title>
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="stylesheet" href="/style.css">
  ${extraHead}
</head>`;
}

function analyticsSnippet() {
  return `<script data-goatcounter="https://flags-fyi.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>`;
}

function navbar() {
  return `<nav class="site-nav">
  <ul>
    <li><a href="/" class="site-logo" aria-label="Flags.fyi home"><img src="/logo.svg" alt="">Flags.fyi</a></li>
  </ul>
  <ul>
    <li class="desktop-only"><a href="/flag-index/">Index of Flags</a></li>
    <li><button class="burger-btn" id="burgerBtn" aria-label="Menu" aria-expanded="false"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button></li>
  </ul>
</nav>
<div class="mobile-drawer-overlay" id="mobileDrawerOverlay"></div>
<div class="mobile-drawer" id="mobileDrawer" role="dialog" aria-label="Navigation menu">
  <div class="mobile-drawer-header">
    <span class="mobile-drawer-title">Navigation</span>
    <button class="mobile-drawer-close" id="mobileDrawerClose" aria-label="Close menu"><svg width="20" height="20" viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg></button>
  </div>
  <nav class="mobile-drawer-nav" aria-label="Mobile navigation">
    <a href="/" class="mobile-drawer-link"><svg width="20" height="20" viewBox="0 0 16 16"><path d="M8 1L1 7h2v6h4V9h2v4h4V7h2L8 1z" fill="currentColor"/></svg>Home</a>
    <a href="/flag-index/" class="mobile-drawer-link"><svg width="20" height="20" viewBox="0 0 16 16"><path d="M2 3h12M2 6.5h8M2 10h10M2 13.5h6" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>Index of Flags</a>
    <a href="/flag-index/all/" class="mobile-drawer-link"><svg width="20" height="20" viewBox="0 0 16 16"><path d="M1 3h4v4H1zM6 3h4v4H6zM11 3h4v4h-4zM1 9h4v4H1zM6 9h4v4H6zM11 9h4v4h-4z" fill="currentColor" opacity="0.6"/></svg>All Flags</a>
  </nav>
</div>`;
}

// ─── compact colors list (sidebar) ───────────────────────────────────────────
// Simple swatch + name + hex, one per row. Full table (CMYK/Pantone + meanings)
// is in the deep-dive panel via colorsTableHtml.
function colorsCompactHtml(colors) {
  if (!colors || colors.length === 0) return '';
  const items = colors.map(row => {
    const hex = rgbHex(row.hex);
    return `<span class="cc-item"><span class="color-swatch" style="background:${hex}"></span>${escHtml(row.color.toLowerCase())} <span class="cc-hex">${hex}</span></span>`;
  });
  return `<div class="colors-compact">${items.join('<span class="cc-sep">|</span>')}</div>`;
}

// ─── colors table ────────────────────────────────────────────────────────────
function colorsTableHtml(colors, colorNote) {
  if (!colors || colors.length === 0) return '';

  const specificCols = new Set(['color', 'hex', 'note']);
  const seen = new Set();
  const genericCols = [];
  for (const row of colors) {
    for (const col of Object.keys(row)) {
      if (!specificCols.has(col) && !seen.has(col)) {
        seen.add(col);
        const info = colorInfoJson[col] || {};
        genericCols.push({
          field: col,
          label: info.label || titleCase(col),
          hint: info.hint || '',
          ref: info.ref || ''
        });
      }
    }
  }

  let html = `<div class="colors-header">Colors</div>
  <div class="color-table-wrap">
  <table>
    <thead><tr>
      <th>Color</th>
      <th>${colorInfoJson.hex ? `<a target="_blank" href="${colorInfoJson.hex.ref}" title="${escHtml(colorInfoJson.hex.hint || '')}">RGB Hex</a>` : 'Hex'}</th>`;

  for (const gc of genericCols) {
    const label = gc.ref
      ? `<a target="_blank" href="${gc.ref}" title="${escHtml(gc.hint)}">${escHtml(gc.label)}</a>`
      : escHtml(gc.label);
    html += `\n      <th>${label}</th>`;
  }

  html += `\n    </tr></thead>\n    <tbody>`;

  for (const row of colors) {
    const hex = rgbHex(row.hex);
    const lum = luminance(row.hex);
    const textColor = lum > 0.5 ? '#222' : '#fff';
    html += `\n    <tr>
      <td><span class="color-swatch" style="background:${hex}"></span>${escHtml(titleCase(row.color))}</td>
      <td><span class="hex-badge" style="background:${hex};color:${textColor}">${hex}</span></td>`;
    for (const gc of genericCols) {
      html += `\n      <td>${escHtml(row[gc.field] || '')}</td>`;
    }
    html += `\n    </tr>`;
    if (row.note) {
      html += `\n    <tr><td colspan="${2 + genericCols.length}" class="text-muted text-small">${escHtml(row.note)}</td></tr>`;
    }
  }

  html += `\n    </tbody>`;
  if (colorNote) {
    html += `\n    <tfoot><tr><td colspan="${2 + genericCols.length}"><small class="text-muted">&dagger; ${escHtml(colorNote)}</small></td></tr></tfoot>`;
  }
  html += `\n  </table>
  </div>`;
  return html;
}

// ─── generate landing page (index.html) ──────────────────────────────────────
function generateLanding() {
  const landingDesc = 'Flags.fyi: explore national, historical, and organizational flags with colors, construction sheets, and detailed descriptions.';
  const landingExtra = `<meta name="description" content="${escHtml(landingDesc)}">
  ${ogTags('Explore Flags of the World', landingDesc, '/logo.svg', '/')}
  ${canonicalTag('/')}
  ${jsonLdWebSite()}`;
  const html = `${htmlHead('Explore Flags of the World', landingExtra)}
<body>
  <div class="hero-landing">
    <div>
      <img src="/logo.svg" alt="Flagstaff" class="logo-img">
      <h1>Flags.fyi</h1>
      <p>by Flagstaff</p>
      <div class="landing-btns">
        <a href="/flag-index/" class="btn">Index of Flags</a>
        <a href="/map/" class="btn">World Map</a>
        <a href="/map/timeline.html" class="btn">Timeline</a>
      </div>
    </div>
  </div>
  ${analyticsSnippet()}
</body>
</html>`;
  fs.writeFileSync(path.join(ROOT, 'index.html'), html);
  console.log('  index.html');
}

// ─── collect all flag IDs (main + includes auxiliary) ─────────────────────────
function getAllFlagIds() {
  const idSet = new Set(Object.keys(flagsJson));
  for (const [namespace, jsonFile] of Object.entries(includesJson)) {
    const auxPath = path.join(ASSETS_FLAGS, dirName(namespace), jsonFile);
    if (fs.existsSync(auxPath)) {
      const auxData = JSON.parse(fs.readFileSync(auxPath, 'utf8'));
      for (const id of Object.keys(auxData)) idSet.add(id);
    }
  }
  return [...idSet];
}

// ─── generate flag-index page ────────────────────────────────────────────────
function generateFlagIndex() {
  const baseDir = path.join(ROOT, 'flag-index');
  fs.mkdirSync(baseDir, { recursive: true });

  const allIds = getAllFlagIds();

  // Build category → flags mapping
  const catFlags = {}; // categoryId → {title, icon, flags[]}
  const uncategorized = [];
  for (const flagId of allIds) {
    const fd = getFullFlagData(flagId);
    const cats = getFlagCategories(fd);
    if (cats.length === 0) {
      uncategorized.push({ flagId, fd });
    } else {
      for (const cat of cats) {
        if (!catFlags[cat.id]) catFlags[cat.id] = { title: cat.title, icon: cat.icon, flags: [] };
        catFlags[cat.id].flags.push({ flagId, fd });
      }
    }
  }

  // Render a flag grid item
  function flagItem(flagId, fd) {
    const flagSrc = fd.flag && fd.flag !== 'none' ? flagImgPath(fd.flag) : '';
    return `<a href="/${flagId}/">${flagSrc ? `<img src="${flagSrc}" alt="${escHtml(fd._name || fd.name || '')}" class="thumb" loading="lazy">` : ''}${escHtml(fd._name)}</a>`;
  }

  // Category ordering
  const catOrder = [
    'africa', 'asia', 'europe', 'north-america', 'south-america', 'oceania',
    'arab', 'gulf', 'south-asia', 'east-asia', 'southeast-asia',
    'nordic', 'levant', 'maghreb', 'horn-of-africa', 'british-overseas',
    'caribbean', 'european-union',
    'national-flag', 'historic', 'former-flag', 'special',
    'caliphate', 'empire', 'intl', 'pan', 'pride', 'maritime', 'sub', 'colonial'
  ];

  // Collect ordered categories that have flags
  const orderedCats = [];
  const rendered = new Set();
  for (const catId of catOrder) {
    if (!catFlags[catId]) continue;
    rendered.add(catId);
    orderedCats.push({ id: catId, ...catFlags[catId] });
  }
  for (const [catId, cat] of Object.entries(catFlags)) {
    if (rendered.has(catId)) continue;
    orderedCats.push({ id: catId, ...cat });
  }

  // Group categories into sections for the hub
  const continentIds = new Set(['africa','asia','europe','north-america','south-america','oceania']);
  const regionIds = new Set(['arab','gulf','south-asia','east-asia','southeast-asia','nordic','levant','maghreb','horn-of-africa','british-overseas','caribbean','european-union']);
  const typeIds = new Set(['national-flag','historic','former-flag','special','caliphate','empire','intl','pan','pride','maritime','sub','colonial']);

  // Shorter display titles for the hub cards
  const hubTitles = {
    'africa': 'Africa', 'asia': 'Asia', 'europe': 'Europe',
    'north-america': 'North America', 'south-america': 'South America',
    'oceania': 'Oceania', 'national-flag': 'National Flags',
    'former-flag': 'Former Flags', 'historic': 'Historic',
    'british-overseas': 'British Overseas', 'european-union': 'EU',
    'caliphate': 'Caliphates', 'empire': 'Empires',
    'intl': 'International', 'pan': 'Pan-Movement',
    'pride': 'Pride', 'maritime': 'Maritime',
    'sub': 'Sub-national', 'colonial': 'Colonial',
  };
  function catSection(cats) {
    return cats.map(cat => {
      const unique = [];
      const seen = new Set();
      for (const { flagId, fd } of cat.flags) {
        if (seen.has(flagId)) continue;
        seen.add(flagId);
        unique.push({ flagId, fd });
      }
      const count = unique.length;
      // Pick up to 6 preview thumbnails
      const previews = unique.slice(0, 6).map(({ flagId, fd }) => {
        const flagSrc = fd.flag && fd.flag !== 'none' ? flagImgPath(fd.flag) : '';
        return flagSrc ? `<img src="${flagSrc}" alt="${escHtml(fd._name)}" class="hub-preview" loading="lazy">` : '';
      }).join('');
      return `<a href="/flag-index/${cat.id}/" class="hub-card">
        <div class="hub-card-top">
          <span class="hub-icon">${cat.icon || ''}</span>
          <span class="hub-count">${count}</span>
        </div>
        <div class="hub-title">${escHtml(hubTitles[cat.id] || cat.title)}</div>
        <div class="hub-thumbs">${previews}</div>
      </a>`;
    }).join('');
  }

  const continents = orderedCats.filter(c => continentIds.has(c.id));
  const regions = orderedCats.filter(c => regionIds.has(c.id));
  const types = orderedCats.filter(c => typeIds.has(c.id));
  const rest = orderedCats.filter(c => !continentIds.has(c.id) && !regionIds.has(c.id) && !typeIds.has(c.id));

  let hubSections = '';
  if (continents.length) hubSections += `<h2 class="hub-section-title">Continents</h2><div class="hub-grid">${catSection(continents)}</div>`;
  if (regions.length) hubSections += `<h2 class="hub-section-title">Regions</h2><div class="hub-grid">${catSection(regions)}</div>`;
  if (types.length) hubSections += `<h2 class="hub-section-title">By Type</h2><div class="hub-grid">${catSection(types)}</div>`;
  if (rest.length) hubSections += `<h2 class="hub-section-title">Other</h2><div class="hub-grid">${catSection(rest)}</div>`;
  if (uncategorized.length > 0) {
    hubSections += `<h2 class="hub-section-title">Uncategorized</h2><div class="hub-grid"><a href="/flag-index/other/" class="hub-card"><div class="hub-card-top"><span class="hub-count">${uncategorized.length}</span></div><div class="hub-title">Other</div></a></div>`;
  }

  const totalFlags = allIds.length;
  const hubDesc = 'Browse flags by category. Explore national, historical, and organizational flags with color details and construction sheets.';
  const hubExtra = `<meta name="description" content="${escHtml(hubDesc)}">
  <link rel="prefetch" href="/search-index.json" as="fetch" crossorigin="anonymous">
  ${ogTags('Index of Flags', hubDesc, '/logo.svg', '/flag-index/')}
  ${canonicalTag('/flag-index/')}
  ${jsonLdCollectionPage('Index of Flags', hubDesc, '/flag-index/')}`;
  const indexHtml = `${htmlHead('Index of Flags', hubExtra)}
<body>
  ${navbar()}
  <div class="hero-banner">
    <div class="container"><h1>Index of Flags</h1><p class="hero-sub">${totalFlags} flags across ${orderedCats.length} categories</p>
    <div class="search-box">
      <input type="text" id="flagSearch" class="search-input" placeholder="Search flags by name, color, or category..." autocomplete="off" aria-label="Search flags">
      <span class="search-count" id="searchCount"></span>
    </div>
    </div>
  </div>
  <main class="container hub-container">
    <div class="hub-top-links">
      <a href="/flag-index/all/">Alphabetical (${totalFlags})</a>
      <a href="/flag-index/ordered/">Navigation Order</a>
    </div>
    ${hubSections}
  </main>
  <script src="/app.js"><\/script>
  ${analyticsSnippet()}
</body>
</html>`;

  fs.writeFileSync(path.join(baseDir, 'index.html'), indexHtml);
  console.log('  flag-index/index.html');

  // --- All-flags page (alphabetical) ---
  const alphabeticalIds = allIds.slice().sort((a, b) => {
    const na = (getFullFlagData(a)._name || a).toLowerCase();
    const nb = (getFullFlagData(b)._name || b).toLowerCase();
    return na.localeCompare(nb);
  });
  let allItems = '';
  for (const flagId of alphabeticalIds) {
    const fd = getFullFlagData(flagId);
    const name = fd._name || flagId;
    const flagPath = fd.flag ? '/' + fd.flag : ('/' + flagId + '/flag.svg');
    allItems += `<a href="/${flagId}/" class="flag-block"><img src="${escHtml(flagPath)}" alt="${escHtml(name)}" loading="lazy"><span class="fb-name">${escHtml(name)}</span></a>`;
  }
  const allDir = path.join(baseDir, 'all');
  fs.mkdirSync(allDir, { recursive: true });
  const allDesc = 'Browse all flags alphabetically on Flags.fyi.';
  const allExtra = `<meta name="description" content="${escHtml(allDesc)}">
  <link rel="prefetch" href="/search-index.json" as="fetch" crossorigin="anonymous">
  ${ogTags('All Flags', allDesc, '/logo.svg', '/flag-index/all/')}
  ${canonicalTag('/flag-index/all/')}
  ${jsonLdCollectionPage('All Flags', allDesc, '/flag-index/all/')}`;
  const allHtml = `${htmlHead('All Flags', allExtra)}
<body>
  ${navbar()}
  <div class="hero-banner">
    <div class="container"><h1>All Flags</h1><p class="hero-sub">${totalFlags} flags</p></div>
  </div>
  <main class="container">
    <p style="margin:1rem 0"><a href="/flag-index/">&larr; Categories</a></p>
    <div class="search-box">
      <input type="text" id="flagSearch" class="search-input" placeholder="Search flags by name, color, or category..." autocomplete="off" aria-label="Search flags">
      <span class="search-count" id="searchCount"></span>
    </div>
    <div class="flag-blocks">${allItems}
    </div>
  </main>
  <script src="/app.js"><\/script>
  ${analyticsSnippet()}
</body>
</html>`;
  fs.writeFileSync(path.join(allDir, 'index.html'), allHtml);
  console.log('  flag-index/all/index.html');

  // --- Ordered page (navigation order, grouped by tier) ---
  const tierSections = [
    { title: 'Countries', ids: navTiers.countries },
    { title: 'Subdivisions', ids: navTiers.subdivisions },
    { title: 'International Organizations', ids: navTiers.intl },
    { title: 'Empires & Historical', ids: navTiers.empires },
    { title: 'Other', ids: navTiers.other },
  ];
  let orderedItems = '';
  for (const sec of tierSections) {
    if (!sec.ids.length) continue;
    orderedItems += `\n      <h3 class="tier-heading">${escHtml(sec.title)} <span class="tier-count">(${sec.ids.length})</span></h3>`;
    orderedItems += `\n      <div class="flag-blocks">`;
    for (const fid of sec.ids) {
      const fd = getFullFlagData(fid);
      const name = fd._name || fid;
      const flagPath = fd.flag ? '/' + fd.flag : ('/' + fid + '/flag.svg');
      orderedItems += `<a href="/${fid}/" class="flag-block"><img src="${escHtml(flagPath)}" alt="${escHtml(name)}" loading="lazy"><span class="fb-name">${escHtml(name)}</span></a>`;
    }
    orderedItems += `\n      </div>`;
  }
  const ordDir = path.join(baseDir, 'ordered');
  fs.mkdirSync(ordDir, { recursive: true });
  const ordDesc = 'Browse flags in navigation order on Flags.fyi.';
  const ordExtra = `<meta name="description" content="${escHtml(ordDesc)}">
  ${ogTags('Flags — Navigation Order', ordDesc, '/logo.svg', '/flag-index/ordered/')}
  ${canonicalTag('/flag-index/ordered/')}
  ${jsonLdCollectionPage('Flags — Navigation Order', ordDesc, '/flag-index/ordered/')}`;
  const ordHtml = `${htmlHead('Flags — Navigation Order', ordExtra)}
<body>
  ${navbar()}
  <div class="hero-banner">
    <div class="container"><h1>Navigation Order</h1><p class="hero-sub">${totalFlags} flags</p></div>
  </div>
  <main class="container">
    <p style="margin:1rem 0"><a href="/flag-index/">&larr; Categories</a> &middot; <a href="/flag-index/all/">Alphabetical</a></p>
    <div class="ordered-grid">${orderedItems}
    </div>
  </main>
  <script src="/app.js"><\/script>
  ${analyticsSnippet()}
</body>
</html>`;
  fs.writeFileSync(path.join(ordDir, 'index.html'), ordHtml);
  console.log('  flag-index/ordered/index.html');

  // --- Per-category pages ---
  for (const cat of orderedCats) {
    const catDir = path.join(baseDir, cat.id);
    fs.mkdirSync(catDir, { recursive: true });

    const seen = new Set();
    let items = '';
    for (const { flagId, fd } of cat.flags) {
      if (seen.has(flagId)) continue;
      seen.add(flagId);
      items += flagItem(flagId, fd);
    }

    const catDesc = `Browse ${cat.title} flags on Flags.fyi.`;
    const catExtra = `<meta name="description" content="${escHtml(catDesc)}">
  ${ogTags(cat.title + ' — Flags', catDesc, '/logo.svg', '/flag-index/' + cat.id + '/')}
  ${canonicalTag('/flag-index/' + cat.id + '/')}
  ${jsonLdCollectionPage(cat.title + ' — Flags', catDesc, '/flag-index/' + cat.id + '/')}`;
    const catHtml = `${htmlHead(cat.title + ' — Flags', catExtra)}
<body>
  ${navbar()}
  <div class="hero-banner">
    <div class="container"><h1>${cat.icon ? cat.icon + ' ' : ''}${escHtml(cat.title)}</h1></div>
  </div>
  <main class="container">
    <p style="margin:1rem 0"><a href="/flag-index/">&larr; Categories</a></p>
    <div class="flag-grid">${items}
    </div>
  </main>
  <script src="/app.js"><\/script>
  ${analyticsSnippet()}
</body>
</html>`;

    fs.writeFileSync(path.join(catDir, 'index.html'), catHtml);
    console.log(`  flag-index/${cat.id}/index.html`);
  }

  // Uncategorized page
  if (uncategorized.length > 0) {
    const otherDir = path.join(baseDir, 'other');
    fs.mkdirSync(otherDir, { recursive: true });
    let items = '';
    for (const { flagId, fd } of uncategorized) {
      items += flagItem(flagId, fd);
    }
    const otherDesc = 'Browse Other flags on Flags.fyi.';
    const otherExtra = `<meta name="description" content="${escHtml(otherDesc)}">
  ${ogTags('Other Flags', otherDesc, '/logo.svg', '/flag-index/other/')}
  ${canonicalTag('/flag-index/other/')}
  ${jsonLdCollectionPage('Other Flags', otherDesc, '/flag-index/other/')}`;
    const otherHtml = `${htmlHead('Other Flags', otherExtra)}
<body>
  ${navbar()}
  <div class="hero-banner">
    <div class="container"><h1>Other Flags</h1></div>
  </div>
  <main class="container">
    <p style="margin:1rem 0"><a href="/flag-index/">&larr; Categories</a></p>
    <div class="flag-grid">${items}
    </div>
  </main>
  <script src="/app.js"><\/script>
  ${analyticsSnippet()}
</body>
</html>`;
    fs.writeFileSync(path.join(otherDir, 'index.html'), otherHtml);
    console.log('  flag-index/other/index.html');
  }
}

// ─── category icon SVGs (inline, small) ──────────────────────────────────────
const categoryIcons = {
  // Continents — globe with highlighted continent (orthographic projection)
  'africa': `<svg viewBox="0 0 20 20" width="20" height="20"><circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" stroke-width="0.8"/><path d="M2.5 10L17.5 10" fill="none" stroke="currentColor" stroke-width="0.3" opacity="0.3"/><path d="M10 17.4L10 2.5" fill="none" stroke="currentColor" stroke-width="0.3" opacity="0.3"/><path d="M7.4 6.1L9 6L9.1 6.4L11.3 6.6L12.9 9L13.8 9L12.6 10.9L12.5 12.2L11.6 14.7L10.9 14.6L9.8 14.8L9 12.8L8.6 11.2L7.3 10L6.5 10.1L6 9.5L5.6 8.6Z" fill="currentColor" opacity="0.85" stroke="none"/></svg>`,
  'asia': `<svg viewBox="0 0 20 20" width="20" height="20"><circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" stroke-width="0.8"/><path d="M2.5 10L17.5 10" fill="none" stroke="currentColor" stroke-width="0.3" opacity="0.3"/><path d="M10 17.4L10 2.5" fill="none" stroke="currentColor" stroke-width="0.3" opacity="0.3"/><path d="M4.5 8L4.8 8.8L4.7 11.6L6.3 10.7L7.4 10.9L8.3 13.3L8.7 12.4L9.8 11.7L10.2 11.7L11.3 13.9L11.9 13.6L12.5 12.3L13.4 10.9L13.9 9.2L13.6 8.2L13.9 7L13 6.7L12.7 5.9L13 5.1L11.2 5.3L9.2 5.4L7.6 5.6L7.7 4.9L6.8 5.8L6.2 7.3L5.2 8.3Z" fill="currentColor" opacity="0.85" stroke="none"/></svg>`,
  'europe': `<svg viewBox="0 0 20 20" width="20" height="20"><circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" stroke-width="0.8"/><path d="M10 17.4L10 2.5" fill="none" stroke="currentColor" stroke-width="0.3" opacity="0.3"/><path d="M7.4 11.4L7.8 10.6L8.8 10.3L8.6 8.8L9.4 8.4L10 7.6L10.5 7.3L11 8.6L10.7 9.2L9.9 9.5L10.8 10.2L11.1 11L10.7 11.3L11.2 11.9L9.7 11.6L9.1 10.7Z" fill="currentColor" opacity="0.85" stroke="none"/></svg>`,
  'north-america': `<svg viewBox="0 0 20 20" width="20" height="20"><circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" stroke-width="0.8"/><path d="M10 17.5L10 2.5" fill="none" stroke="currentColor" stroke-width="0.3" opacity="0.3"/><path d="M7.2 6L7.6 7.4L7.8 8.3L8 9L7.6 10.3L8.2 11.4L10 12.2L10.4 13.2L11.6 13.6L12.2 14.1L12.3 12.3L12 11.7L12.6 10.9L13.1 9.4L13.6 8.7L12.8 8.1L12.2 7.6L11.4 7.5L10.2 7.1L10.2 6.6L8.8 6.4L8.3 6.4Z" fill="currentColor" opacity="0.85" stroke="none"/></svg>`,
  'south-america': `<svg viewBox="0 0 20 20" width="20" height="20"><circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" stroke-width="0.8"/><path d="M10 17.2L10 2.5" fill="none" stroke="currentColor" stroke-width="0.3" opacity="0.3"/><path d="M7.2 7.1L7.8 8L7.4 8.8L8.1 10.1L8.8 10.4L9.4 10.9L10.2 12.6L9.3 14.3L8.8 14.6L8.7 13.9L8.8 12L8.8 10.4L7.9 8.8L8.3 7.5L10 7.2L11 7.7L11.3 8.2L13.2 9L13.1 9.8L12.4 11.2L11.4 11.7L10.8 12.3L10.2 12.6Z" fill="currentColor" opacity="0.85" stroke="none"/></svg>`,
  'oceania': `<svg viewBox="0 0 20 20" width="20" height="20"><circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" stroke-width="0.8"/><path d="M2.5 10L17.5 10" fill="none" stroke="currentColor" stroke-width="0.3" opacity="0.3"/><path d="M10 17.4L10 2.5" fill="none" stroke="currentColor" stroke-width="0.3" opacity="0.3"/><path d="M7.5 9.8L7.8 11.3L8.1 11.4L8.6 11.2L9.7 10.9L10.2 11.3L10.7 11.7L11.3 11.8L12 10.5L11.8 9.7L11.4 9.3L11.3 8.7L11 8.3L10.1 8.3L9.5 8.6L9.2 8.7L8.4 9.2Z" fill="currentColor" opacity="0.85" stroke="none"/><circle cx="14.5" cy="7" r="0.8" fill="currentColor" opacity="0.85"/></svg>`,
  // Types
  'national-flag': `<svg viewBox="0 0 20 20" width="20" height="20"><path d="M4 3v14M4 3h10l-2 3 2 3H4" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  'historic': `<svg viewBox="0 0 20 20" width="20" height="20"><circle cx="10" cy="10" r="6" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M10 5v5l3 2" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
  'former-flag': `<svg viewBox="0 0 20 20" width="20" height="20"><circle cx="10" cy="10" r="6" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M10 5v5l3 2" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
  'caribbean': `<svg viewBox="0 0 20 20" width="20" height="20"><circle cx="7" cy="9" r="2" fill="none" stroke="currentColor" stroke-width="1.1"/><circle cx="11" cy="11" r="1.5" fill="none" stroke="currentColor" stroke-width="1.1"/><circle cx="14" cy="8" r="1" fill="none" stroke="currentColor" stroke-width="1.1"/><path d="M3 14c3-1 6-.5 9 0s5 .5 5-.5" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round"/></svg>`,
  'special': `<svg viewBox="0 0 20 20" width="20" height="20"><path d="M10 3l2 4.5 5 .5-3.5 3.5 1 5L10 14l-4.5 2.5 1-5L3 8l5-.5z" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>`,
  // Regions
  'arab': `<svg viewBox="0 0 20 20" width="20" height="20"><path d="M10 2C6 2 3 5.5 3 9c0 2 .8 3.8 2 5l5 4 5-4c1.2-1.2 2-3 2-5 0-3.5-3-7-7-7z" fill="none" stroke="currentColor" stroke-width="1.1"/><text x="10" y="12.5" text-anchor="middle" font-family="serif" font-size="9" fill="currentColor">ع</text></svg>`,
  'gulf': `<svg viewBox="0 0 20 20" width="20" height="20"><path d="M5 3h7l1 2 1 4-1 3-3 3-3 2-2-1v-3l-1-3V6z" fill="currentColor" stroke="none"/></svg>`,
  'south-asia': `<svg viewBox="0 0 20 20" width="20" height="20"><path d="M7 2h5l2 3 1 4-1 3-3 4-2 1-3-2-1-4 1-5z" fill="currentColor" stroke="none"/></svg>`,
  'east-asia': `<svg viewBox="0 0 20 20" width="20" height="20"><path d="M4 4h4l3 1 3-1 2 2v4l-1 3-3 2-2 2H8l-2-2-2-3V7z" fill="currentColor" stroke="none"/></svg>`,
  'southeast-asia': `<svg viewBox="0 0 20 20" width="20" height="20"><path d="M5 4l3-1h3l2 2v3l-1 2-2 1" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><ellipse cx="8" cy="14" rx="2.5" ry="1.5" fill="currentColor"/><circle cx="13" cy="15" r="1.3" fill="currentColor"/></svg>`,
  'nordic': `<svg viewBox="0 0 20 20" width="20" height="20"><rect x="3" y="5" width="14" height="10" rx="1" fill="none" stroke="currentColor" stroke-width="1.1"/><path d="M3 10h14M8 5v10" stroke="currentColor" stroke-width="1.8"/></svg>`,
  'levant': `<svg viewBox="0 0 20 20" width="20" height="20"><path d="M10 2l-5 8h2l-3 7h12l-3-7h2z" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>`,
  'maghreb': `<svg viewBox="0 0 20 20" width="20" height="20"><path d="M2 7h4l3-2h4l3 2h2v3l-2 2-3 1H7L4 12l-2-2z" fill="currentColor" stroke="none"/></svg>`,
  'horn-of-africa': `<svg viewBox="0 0 20 20" width="20" height="20"><path d="M9 3l2 2 1 3-1 3-1 3-2 2-2-1-1-3 1-4 1-3z" fill="currentColor" stroke="none"/></svg>`,
  'british-overseas': `<svg viewBox="0 0 20 20" width="20" height="20"><rect x="2" y="4" width="16" height="12" rx="1" fill="none" stroke="currentColor" stroke-width="1.1"/><path d="M2 4l16 12M18 4L2 16" stroke="currentColor" stroke-width="0.8"/><path d="M10 4v12M2 10h16" stroke="currentColor" stroke-width="1.8"/></svg>`,
  // New categories
  'caliphate': `<svg viewBox="0 0 20 20" width="20" height="20"><path d="M10 2a5.5 5.5 0 00-1.8 10.7L10 17l1.8-4.3A5.5 5.5 0 0010 2z" fill="none" stroke="currentColor" stroke-width="1.1"/><path d="M8.5 7.5a2.5 2.5 0 014 0" fill="none" stroke="currentColor" stroke-width="1"/><circle cx="10" cy="9.5" r="0.8" fill="currentColor"/></svg>`,
  'empire': `<svg viewBox="0 0 20 20" width="20" height="20"><path d="M10 2l-6 4v5l6 6 6-6V6z" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><path d="M10 5v7M7 8h6" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg>`,
  'intl': `<svg viewBox="0 0 20 20" width="20" height="20"><circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" stroke-width="1.1"/><ellipse cx="10" cy="10" rx="3.5" ry="7" fill="none" stroke="currentColor" stroke-width="0.8"/><path d="M3 10h14M4.5 6h11M4.5 14h11" fill="none" stroke="currentColor" stroke-width="0.6"/></svg>`,
  'pan': `<svg viewBox="0 0 20 20" width="20" height="20"><rect x="3" y="4" width="14" height="4" rx="0.5" fill="currentColor" opacity="0.3"/><rect x="3" y="8" width="14" height="4" rx="0" fill="currentColor" opacity="0.55"/><rect x="3" y="12" width="14" height="4" rx="0.5" fill="currentColor" opacity="0.85"/></svg>`,
  'pride': `<svg viewBox="0 0 20 20" width="20" height="20"><rect x="3" y="4" width="14" height="2" fill="#E40303"/><rect x="3" y="6" width="14" height="2" fill="#FF8C00"/><rect x="3" y="8" width="14" height="2" fill="#FFED00"/><rect x="3" y="10" width="14" height="2" fill="#008026"/><rect x="3" y="12" width="14" height="2" fill="#004DFF"/><rect x="3" y="14" width="14" height="2" fill="#750787"/></svg>`,
  'maritime': `<svg viewBox="0 0 20 20" width="20" height="20"><path d="M10 3v10M4 16c2-2 4-3 6-3s4 1 6 3" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path d="M10 4l6 4-6 2z" fill="currentColor" opacity="0.7"/></svg>`,
  'sub': `<svg viewBox="0 0 20 20" width="20" height="20"><rect x="3" y="4" width="14" height="12" rx="1" fill="none" stroke="currentColor" stroke-width="1.1"/><path d="M3 10h14" stroke="currentColor" stroke-width="0.6" stroke-dasharray="1.5 1"/><path d="M10 4v12" stroke="currentColor" stroke-width="0.6" stroke-dasharray="1.5 1"/></svg>`,
  'colonial': `<svg viewBox="0 0 20 20" width="20" height="20"><path d="M4 3v14M4 3h10l-2 3 2 3H4" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/><circle cx="13" cy="14" r="3" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="1.5 1"/></svg>`,
  'european-union': `<svg viewBox="0 0 20 20" width="20" height="20"><circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" stroke-width="1.1"/><g fill="currentColor">${[0,30,60,90,120,150,180,210,240,270,300,330].map(a=>`<circle cx="${10+5*Math.cos((a-90)*Math.PI/180)}" cy="${10+5*Math.sin((a-90)*Math.PI/180)}" r="0.7"/>`).join('')}</g></svg>`,
};

// Resolve a group code to its full category name
function resolveGroup(g) {
  if (!g) return null;
  const info = groupInfoJson[g];
  if (typeof info === 'string') return info; // alias
  if (info && info.title) return g; // already resolved
  return null;
}

// Get category labels for a flag
function getFlagCategories(fd) {
  if (!fd.g) return [];
  const groups = fd.g.split(',');
  const cats = [];
  for (const g of groups) {
    const resolved = resolveGroup(g.trim());
    if (resolved && categoryIcons[resolved]) {
      const info = groupInfoJson[resolved];
      cats.push({ id: resolved, title: info ? info.title : titleCase(resolved), icon: categoryIcons[resolved] });
    }
  }
  return cats;
}

// Get related flags (same namespace, excluding self)
function getRelatedFlags(flagId, fd) {
  const ns = fd._namespace;
  const allIds = getAllFlagIds();
  const related = [];
  for (const id of allIds) {
    if (id === flagId) continue;
    const other = getFullFlagData(id);
    if (other._namespace === ns) {
      related.push({ id, name: other._name, flag: other.flag });
    }
  }
  return related;
}

function relatedFlagsHtml(related) {
  if (related.length === 0) return '';
  let html = '<div class="related-flags"><div class="related-header">Related</div><div class="related-list">';
  for (const r of related) {
    const src = r.flag && r.flag !== 'none' ? flagImgPath(r.flag) : '';
    html += `<a href="/${r.id}/" title="${escHtml(r.name)}">${src ? `<img src="${src}" alt="${escHtml(r.name)}" class="related-thumb" loading="lazy">` : ''}</a>`;
  }
  html += '</div></div>';
  return html;
}

// ─── Wikipedia article URL inference ─────────────────────────────────────────
const wikiOverrides = {
  'us': 'Flag_of_the_United_States', 'uk': 'Flag_of_the_United_Kingdom',
  'uae': 'Flag_of_the_United_Arab_Emirates', 'korea': 'Flag_of_South_Korea',
  'korea-dprk': 'Flag_of_North_Korea', 'mann': 'Flag_of_the_Isle_of_Man',
  'sgssi': 'Flag_of_South_Georgia_and_the_South_Sandwich_Islands',
  'tci': 'Flag_of_the_Turks_and_Caicos_Islands',
  'rashidun': 'Rashidun_(Caliph_Umar).svg', 'umayyad': 'Umayyad_Caliphate',
  'abbasid': 'Black_flag.svg', 'fatimid': 'Fatimid_Caliphate',
  'ayyubid': 'Flag_of_Saladin.svg', 'ottoman': 'Flag_of_the_Ottoman_Empire',
  'ottoman-early': 'Flag_of_the_Ottoman_Empire', 'mughal': 'Mughal_Empire',
  'almohad': 'Flag_of_Almohad_Dynasty.svg', 'almoravid': 'Almoravid_dynasty',
  'idrisid': 'Black_flag.svg', 'samanid': 'Samanid_Empire',
  'roman-empire': 'Roman_Empire', 'byzantine': 'Byzantine_Empire',
  'holy-roman-empire': 'Holy_Roman_Empire', 'mongol': 'Mongol_Empire',
  'achaemenid': 'Achaemenid_Empire', 'kingdom-of-jerusalem': 'Kingdom_of_Jerusalem',
  'venice': 'Republic_of_Venice', 'sassanid': 'Sasanian_Empire', 'sassanid-alt': 'Derafsh_Kaviani',
  'qajar': 'Qajar_Iran', 'pahlavi': 'Pahlavi_dynasty',
  'north-yemen': 'North_Yemen', 'south-yemen': 'South_Yemen',
  'hejaz': 'Kingdom_of_Hejaz', 'hatay': 'Hatay_State',
  'in-calcutta-flag': 'Flag_of_India', 'in-independence': 'Flag_of_India',
  'sikh-empire': 'Sikh_Empire', 'british-raj': 'British_Raj',
  'pk-muslim-league': 'All-India_Muslim_League',
  'east-pakistan': 'East_Pakistan', 'bd-1971-map': 'Flag_of_Bangladesh',
  'af-kingdom': 'Kingdom_of_Afghanistan', 'af-republic': 'Republic_of_Afghanistan_(1973–1978)',
  'af-soviet': 'Democratic_Republic_of_Afghanistan', 'af-taliban-1996': 'Islamic_Emirate_of_Afghanistan',
  'af-islamic-republic': 'Flag_of_Afghanistan',
  'cn-qing-dragon': 'Flag_of_the_Qing_dynasty', 'cn-five-coloured': 'Five_Races_Under_One_Union',
  'cn-blue-sky-white-sun': 'Flag_of_the_Republic_of_China',
  'jp-tokugawa': 'Tokugawa_shogunate', 'jp-rising-sun-army': 'Rising_Sun_Flag',
  'jp-rising-sun-navy': 'Rising_Sun_Flag', 'kr-joseon': 'Joseon', 'kr-taegeukgi-1883': 'Flag_of_South_Korea',
  'vn-south': 'Flag_of_South_Vietnam', 'vn-empire': 'Empire_of_Vietnam',
  'id-dutch-east-indies': 'Dutch_East_Indies', 'ph-katipunan': 'Katipunan',
  'ph-revolutionary': 'Flag_of_the_Philippines', 'th-siam-elephant': 'Flag_of_Thailand',
  'fr-bourbon': 'Flag_of_France', 'fr-free-france': 'Free_France',
  'de-imperial': 'German_Empire', 'de-weimar': 'Flag_of_Germany',
  'de-nazi': 'Flag_of_Nazi_Germany', 'de-east-germany': 'Flag_of_East_Germany',
  'de-west-germany': 'Flag_of_Germany', 'ru-imperial': 'Flag_of_Russia',
  'ru-sfsr': 'Russian_Soviet_Federative_Socialist_Republic', 'soviet-union': 'Flag_of_the_Soviet_Union',
  'es-republic': 'Second_Spanish_Republic', 'es-francoist': 'Francoist_Spain',
  'es-empire': 'Cross_of_Burgundy_flag', 'it-kingdom': 'Kingdom_of_Italy',
  'it-social-republic': 'Italian_Social_Republic',
  'pl-duchy-warsaw': 'Duchy_of_Warsaw', 'pl-november-uprising': 'November_Uprising',
  'gr-independence': 'Flag_of_Greece', 'gr-kingdom': 'Flag_of_Greece', 'gr-junta': 'Greek_junta',
  'scotland-kingdom': 'Flag_of_Scotland',
  'us-betsy-ross': 'Betsy_Ross_flag',
  'us-confederate-stars-bars': 'Flags_of_the_Confederate_States_of_America',
  'us-confederate-stainless': 'Flags_of_the_Confederate_States_of_America',
  'mx-three-guarantees': 'Army_of_the_Three_Guarantees', 'mx-empire': 'First_Mexican_Empire',
  'mx-federal-republic': 'Flag_of_Mexico',
  'br-empire': 'Empire_of_Brazil', 'br-provisional': 'Flag_of_Brazil',
  'ar-celeste-blanca': 'Flag_of_Argentina', 'ar-sun-of-may': 'Flag_of_Argentina',
  'cu-lone-star': 'Flag_of_Cuba',
  'et-imperial-lion': 'Flag_of_Ethiopia_(1897-1936;_1941-1974)_squared.svg', 'et-derg': 'Derg',
  'za-prinsevlag': 'Flag_of_South_Africa_(1928–1994)', 'gh-gold-coast': 'Gold_Coast_(British_colony)',
  'ke-colonial': 'Kenya_Colony',
  'french-algeria': 'French_Algeria', 'british-palestine': 'Mandatory_Palestine',
  'french-syria': 'Mandate_for_Syria_and_the_Lebanon', 'french-lebanon': 'Greater_Lebanon',
  'anglo-egyptian-sudan': 'Anglo-Egyptian_Sudan', 'italian-somaliland': 'Italian_Somaliland',
  'british-somaliland': 'British_Somaliland',
  'united-nations': 'Flag_of_the_United_Nations', 'european-union': 'Flag_of_Europe',
  'african-union': 'African_Union', 'arab-league': 'Arab_League', 'nato': 'NATO',
  'olympic': 'Olympic_symbols', 'red-cross': 'International_Red_Cross_and_Red_Crescent_Movement',
  'asean': 'Association_of_Southeast_Asian_Nations', 'commonwealth': 'Commonwealth_of_Nations',
  'oic': 'Organisation_of_Islamic_Cooperation', 'gcc': 'Gulf_Cooperation_Council',
  'pan-african': 'Pan-African_flag', 'pan-slavic': 'Pan-Slavic_colors',
  'amazigh': 'Berber_flag', 'kurdish': 'Flag_of_Kurdistan', 'romani': 'Flag_of_the_Romani_people',
  'tibetan': 'Flag_of_Tibet', 'catalan': 'Senyera',
  'pride-rainbow': 'Rainbow_flag_(LGBT)', 'pride-progress': 'Progress_Pride_flag',
  'pride-trans': 'Transgender_flag', 'juneteenth': 'Juneteenth_flag',
  'jolly-roger': 'Jolly_Roger', 'white-ensign': 'White_Ensign', 'red-ensign': 'Red_Ensign',
  'signal-flags': 'International_maritime_signal_flags',
  'texas': 'Flag_of_Texas', 'hawaii': 'Flag_of_Hawaii', 'california': 'Flag_of_California',
  'puerto-rico': 'Flag_of_Puerto_Rico', 'washington-dc': 'Flag_of_Washington,_D.C.',
  'quebec': 'Flag_of_Quebec', 'scotland': 'Flag_of_Scotland',
  'wales': 'Flag_of_Wales', 'england': 'Flag_of_England',
  'eagle-of-saladin': 'Eagle_of_Saladin', 'arab-federation': 'Arab_Federation',
  'libya-united': 'Kingdom_of_Libya',
};

function getWikiUrl(flagId, fd) {
  // Explicit override
  if (wikiOverrides[flagId]) return 'https://en.wikipedia.org/wiki/' + wikiOverrides[flagId];
  // If flag data has a wiki field
  if (fd.wiki) return fd.wiki.startsWith('http') ? fd.wiki : 'https://en.wikipedia.org/wiki/' + fd.wiki;
  // Infer from title: "Flag of X" -> "Flag_of_X"
  const title = fd.title || fd._name || '';
  if (title.startsWith('Flag of ')) return 'https://en.wikipedia.org/wiki/' + title.replace(/ /g, '_');
  // Infer from name: country name -> "Flag_of_Name"
  const name = fd._name || '';
  return 'https://en.wikipedia.org/wiki/Flag_of_' + name.replace(/ /g, '_');
}

// Wikipedia article for the entity itself (country, empire, city, etc.),
// as opposed to the flag-of-X article returned by getWikiUrl.
function getEntityWikiUrl(flagId, fd) {
  if (fd.wikiEntity) return fd.wikiEntity.startsWith('http') ? fd.wikiEntity : 'https://en.wikipedia.org/wiki/' + fd.wikiEntity;
  const name = fd._name || '';
  return 'https://en.wikipedia.org/wiki/' + name.replace(/ /g, '_');
}

// Wikipedia entity extracts (2-3 sentence summaries) cached at build time.
let wikiExtracts = {};
try {
  wikiExtracts = JSON.parse(fs.readFileSync(path.join(DATA, 'wiki-extracts.json'), 'utf8'));
} catch (e) { /* no cache yet */ }

function getWikiExtract(flagId) {
  const entry = wikiExtracts[flagId];
  return entry && entry.extract ? entry.extract : null;
}

// Short summary for sidebar: Wikipedia extract if available, otherwise fall back
// to the first 1–2 sentences of the local desc (the flag's own description).
function getSidebarSummary(flagId, fd) {
  const wiki = getWikiExtract(flagId);
  if (wiki) return { text: wiki, source: 'wiki' };
  const desc = fd.desc ? arrayText(fd.desc) : '';
  if (desc) {
    // Strip leading "- " or "* " bullet markers from the first line
    const firstLine = desc.split('\n').map(l => l.replace(/^[-*]\s+/, '').trim()).filter(Boolean)[0] || '';
    if (firstLine) return { text: firstLine, source: 'local' };
  }
  return null;
}

// ─── Wikimedia Commons reference map ────────────────────────────────────────
// Known Wikimedia Commons filenames for flags (verified sources)
const commonsFileMap = {
  // Countries (current)
  'abkhazia': 'Flag_of_the_Republic_of_Abkhazia.svg',
  'afghanistan': 'Flag_of_the_Islamic_Republic_of_Afghanistan.svg',
  'ayyubid': 'Flag_of_Saladin.svg',
  'ar-sun-of-may': 'Sun_of_May_(Argentine_Confederation).svg',
  'ar-celeste-blanca': 'Flag_of_argentina_(1810-1812).svg',
  'yerevan': 'Flag_of_Yerevan.svg',
  'somaliland': 'Flag_of_Somaliland.svg',
  'n-cyprus': 'Flag_of_the_Turkish_Republic_of_Northern_Cyprus.svg',
  'greenland': 'Flag_of_Greenland.svg',
  'uk': 'Flag_of_the_United_Kingdom.svg',
  'albania': 'Flag_of_Albania.svg',
  'algeria': 'Flag_of_Algeria.svg',
  'andorra': 'Flag_of_Andorra.svg',
  'angola': 'Flag_of_Angola.svg',
  'antigua-and-barbuda': 'Flag_of_Antigua_and_Barbuda.svg',
  'argentina': 'Flag_of_Argentina.svg',
  'australia': 'Flag_of_Australia.svg',
  'austria': 'Flag_of_Austria.svg',
  'bahrain': 'Flag_of_Bahrain.svg',
  'bangladesh': 'Flag_of_Bangladesh.svg',
  'belgium': 'Flag_of_Belgium.svg',
  'brazil': 'Flag_of_Brazil.svg',
  'canada': 'Flag_of_Canada.svg',
  'chile': 'Flag_of_Chile.svg',
  'china': 'Flag_of_the_People%27s_Republic_of_China.svg',
  'colombia': 'Flag_of_Colombia.svg',
  'comoros': 'Flag_of_the_Comoros.svg',
  'croatia': 'Flag_of_Croatia.svg',
  'cuba': 'Flag_of_Cuba.svg',
  'czech-republic': 'Flag_of_the_Czech_Republic.svg',
  'denmark': 'Flag_of_Denmark.svg',
  'djibouti': 'Flag_of_Djibouti.svg',
  'egypt': 'Flag_of_Egypt.svg',
  'ethiopia': 'Flag_of_Ethiopia.svg',
  'fiji': 'Flag_of_Fiji.svg',
  'finland': 'Flag_of_Finland.svg',
  'france': 'Flag_of_France.svg',
  'germany': 'Flag_of_Germany.svg',
  'ghana': 'Flag_of_Ghana.svg',
  'greece': 'Flag_of_Greece.svg',
  'hungary': 'Flag_of_Hungary.svg',
  'india': 'Flag_of_India.svg',
  'indonesia': 'Flag_of_Indonesia.svg',
  'iran': 'Flag_of_Iran.svg',
  'iraq': 'Flag_of_Iraq.svg',
  'ireland': 'Flag_of_Ireland.svg',
  'israel': 'Flag_of_Israel.svg',
  'italy': 'Flag_of_Italy.svg',
  'japan': 'Flag_of_Japan.svg',
  'jordan': 'Flag_of_Jordan.svg',
  'kenya': 'Flag_of_Kenya.svg',
  'korea': 'Flag_of_South_Korea.svg',
  'kuwait': 'Flag_of_Kuwait.svg',
  'lebanon': 'Flag_of_Lebanon.svg',
  'libya': 'Flag_of_Libya.svg',
  'malaysia': 'Flag_of_Malaysia.svg',
  'mauritania': 'Flag_of_Mauritania.svg',
  'mexico': 'Flag_of_Mexico.svg',
  'morocco': 'Flag_of_Morocco.svg',
  'nepal': 'Flag_of_Nepal.svg',
  'netherlands': 'Flag_of_the_Netherlands.svg',
  'new-zealand': 'Flag_of_New_Zealand.svg',
  'nigeria': 'Flag_of_Nigeria.svg',
  'norway': 'Flag_of_Norway.svg',
  'oman': 'Flag_of_Oman.svg',
  'pakistan': 'Flag_of_Pakistan.svg',
  'palestine': 'Flag_of_Palestine.svg',
  'peru': 'Flag_of_Peru.svg',
  'philippines': 'Flag_of_the_Philippines.svg',
  'poland': 'Flag_of_Poland.svg',
  'portugal': 'Flag_of_Portugal.svg',
  'qatar': 'Flag_of_Qatar.svg',
  'romania': 'Flag_of_Romania.svg',
  'russia': 'Flag_of_Russia.svg',
  'saudi-arabia': 'Flag_of_Saudi_Arabia.svg',
  'singapore': 'Flag_of_Singapore.svg',
  'somalia': 'Flag_of_Somalia.svg',
  'south-africa': 'Flag_of_South_Africa.svg',
  'spain': 'Flag_of_Spain.svg',
  'sudan': 'Flag_of_Sudan.svg',
  'sweden': 'Flag_of_Sweden.svg',
  'switzerland': 'Flag_of_Switzerland.svg',
  'syria': 'Flag_of_Syria.svg',
  'tanzania': 'Flag_of_Tanzania.svg',
  'thailand': 'Flag_of_Thailand.svg',
  'tunisia': 'Flag_of_Tunisia.svg',
  'turkey': 'Flag_of_Turkey.svg',
  'uae': 'Flag_of_the_United_Arab_Emirates.svg',
  'uk': 'Flag_of_the_United_Kingdom.svg',
  'ukraine': 'Flag_of_Ukraine.svg',
  'us': 'Flag_of_the_United_States.svg',
  'vietnam': 'Flag_of_Vietnam.svg',
  'yemen': 'Flag_of_Yemen.svg',
  // Historical — from fetch-wiki-svgs.py
  'ottoman': 'Flag_of_the_Ottoman_Empire_(1844–1922).svg',
  'mughal': 'Flag_of_the_Mughal_Empire.svg',
  'roman-empire': 'Vexilloid_of_the_Roman_Empire.svg',
  'byzantine': 'Byzantine_imperial_flag,_14th_century.svg',
  'holy-roman-empire': 'Banner_of_the_Holy_Roman_Emperor_with_haloes_(1400-1806).svg',
  'mongol': 'Flag_of_the_Mongol_Empire_3.svg',
  'achaemenid': 'Standard_of_Cyrus_the_Great_(Achaemenid_Empire).svg',
  'venice': 'Flag_of_Most_Serene_Republic_of_Venice.svg',
  'pahlavi': 'State_flag_of_Iran_(1933–1964).svg',
  'north-yemen': 'Flag_of_North_Yemen.svg',
  'south-yemen': 'Flag_of_South_Yemen.svg',
  'hejaz': 'Flag_of_Hejaz_1917.svg',
  'hatay': 'Flag_of_Hatay.svg',
  'sikh-empire': 'Nishan_Sahib.svg',
  'british-raj': 'British_Raj_Red_Ensign.svg',
  'bd-1971-map': 'Flag_of_Bangladesh_(1971).svg',
  'east-pakistan': 'Flag_of_Pakistan.svg',
  'af-republic': 'Flag_of_Afghanistan_(1974–1978).svg',
  'af-soviet': 'Flag_of_Afghanistan_(1980–1987).svg',
  'af-taliban-1996': 'Flag_of_the_Taliban.svg',
  'af-islamic-republic': 'Flag_of_Afghanistan_(2013–2021).svg',
  'cn-qing-dragon': 'Flag_of_the_Qing_Dynasty_(1889-1912).svg',
  'cn-five-coloured': 'Flag_of_China_(1912–1928).svg',
  'cn-blue-sky-white-sun': 'Flag_of_the_Republic_of_China.svg',
  'jp-tokugawa': 'Flag_of_the_Tokugawa_Shogunate.svg',
  'jp-rising-sun-army': 'War_flag_of_the_Imperial_Japanese_Army_(1868–1945).svg',
  'jp-rising-sun-navy': 'Naval_ensign_of_the_Empire_of_Japan.svg',
  'kr-taegeukgi-1883': 'Flag_of_Korea_(1882–1910).svg',
  'vn-south': 'Flag_of_South_Vietnam.svg',
  'vn-empire': 'Flag_of_the_Empire_of_Vietnam_(1945).svg',
  'th-siam-elephant': 'Flag_of_Siam_(1855).svg',
  'fr-bourbon': 'Royal_Standard_of_the_King_of_France.svg',
  'fr-free-france': 'Flag_of_Free_France_(1940–1944).svg',
  'de-imperial': 'Flag_of_the_German_Empire.svg',
  'de-nazi': 'Flag_of_Germany_(1935–1945).svg',
  'de-east-germany': 'Flag_of_East_Germany.svg',
  'soviet-union': 'Flag_of_the_Soviet_Union.svg',
  'es-republic': 'Flag_of_Spain_(1931–1939).svg',
  'es-francoist': 'Flag_of_Spain_(1945–1977).svg',
  'es-empire': 'Flag_of_Cross_of_Burgundy.svg',
  'it-kingdom': 'Flag_of_Italy_(1861–1946).svg',
  'it-social-republic': 'War_flag_of_the_Italian_Social_Republic.svg',
  'gr-independence': 'Flag_of_Greece_(1822-1978).svg',
  'gr-junta': 'Flag_of_Greece_(1970–1975).svg',
  // dannebrog merged into denmark
  'us-betsy-ross': 'Betsy_Ross_flag.svg',
  'us-confederate-stars-bars': 'Flag_of_the_Confederate_States_of_America_(1861–1863).svg',
  'us-confederate-stainless': 'Flag_of_the_Confederate_States_of_America_(1863–1865).svg',
  'mx-three-guarantees': 'Flag_of_the_Three_Guarantees.svg',
  'br-provisional': 'Flag_of_Brazil_(November_1889).svg',
  'et-derg': 'Flag_of_Ethiopia_(1975–1987).svg',
  'za-prinsevlag': 'Flag_of_South_Africa_(1928–1994).svg',
  'gh-gold-coast': 'Flag_of_the_Gold_Coast.svg',
  'anglo-egyptian-sudan': 'Flag_of_Anglo-Egyptian_Sudan.svg',
  'british-somaliland': 'Flag_of_British_Somaliland_(1952–1960).svg',
  // Intl
  'united-nations': 'Flag_of_the_United_Nations.svg',
  'european-union': 'Flag_of_Europe.svg',
  'african-union': 'Flag_of_the_African_Union.svg',
  'arab-league': 'Flag_of_the_Arab_League.svg',
  'nato': 'Flag_of_NATO.svg',
  'olympic': 'Olympic_flag.svg',
  'red-cross': 'Flag_of_the_Red_Cross.svg',
  'commonwealth': 'Commonwealth_Flag_2013.svg',
  // Pan / movements
  'pan-slavic': 'Pan-Slavic_flag.svg',
  'amazigh': 'Berber_flag.svg',
  'kurdish': 'Flag_of_Kurdistan.svg',
  'romani': 'Flag_of_the_Romani_people.svg',
  'tibetan': 'Flag_of_Tibet.svg',
  'catalan': 'Flag_of_Catalonia.svg',
  // Pride
  'pride-rainbow': 'Gay_Pride_Flag.svg',
  'pride-progress': 'Intersex-inclusive_pride_flag.svg',
  'pride-trans': 'Transgender_Pride_flag.svg',
  // Maritime
  'jolly-roger': 'Pirate_Flag_of_Jack_Rackham.svg',
  'white-ensign': 'Naval_Ensign_of_the_United_Kingdom.svg',
  'red-ensign': 'Civil_Ensign_of_the_United_Kingdom.svg',
  // Subdivisions
  'us-california': 'Flag_of_California.svg',
  'us-texas': 'Flag_of_Texas.svg',
  'us-hawaii': 'Flag_of_Hawaii.svg',
  'us-puerto-rico': 'Flag_of_Puerto_Rico.svg',
  'us-washington-dc': 'Flag_of_the_District_of_Columbia.svg',
  'us-new-york': 'Flag_of_New_York.svg',
  'us-alaska': 'Flag_of_Alaska.svg',
  'us-maryland': 'Flag_of_Maryland.svg',
  'us-new-mexico': 'Flag_of_New_Mexico.svg',
  'us-arizona': 'Flag_of_Arizona.svg',
  'us-colorado': 'Flag_of_Colorado.svg',
  'us-south-carolina': 'Flag_of_South_Carolina.svg',
  'us-ohio': 'Flag_of_Ohio.svg',
  'us-mississippi': 'Flag_of_Mississippi.svg',
  'us-georgia': 'Flag_of_Georgia_(U.S._state).svg',
  'ca-quebec': 'Flag_of_Quebec.svg',
  'ca-ontario': 'Flag_of_Ontario.svg',
  'ca-british-columbia': 'Flag_of_British_Columbia.svg',
  'ca-alberta': 'Flag_of_Alberta.svg',
  'uk-scotland': 'Flag_of_Scotland.svg',
  'uk-wales': 'Flag_of_Wales.svg',
  'uk-england': 'Flag_of_England.svg',
  'uk-northern-ireland': 'Ulster_Banner.svg',
  'uk-cornwall': 'Flag_of_Cornwall.svg',
  'de-bavaria': 'Flag_of_Bavaria_(lozengy).svg',
  'de-prussia': 'Flag_of_Prussia_(1892-1918).svg',
  'es-basque': 'Flag_of_the_Basque_Country.svg',
  'es-andalusia': 'Flag_of_Andalucía.svg',
  'au-aboriginal': 'Australian_Aboriginal_Flag.svg',
  'au-new-south-wales': 'Flag_of_New_South_Wales.svg',
  'in-jammu-kashmir': 'Flag_of_Jammu_and_Kashmir_(1952–2019).svg',
  'in-sikkim': 'Flag_of_Sikkim_(1967-1975).svg',
  // BOTs
  'anguilla': 'Flag_of_Anguilla.svg',
  'bermuda': 'Flag_of_Bermuda.svg',
  'cayman-islands': 'Flag_of_the_Cayman_Islands.svg',
  'gibraltar': 'Flag_of_Gibraltar.svg',
  'guernsey': 'Flag_of_Guernsey.svg',
  'jersey': 'Flag_of_Jersey.svg',
  'mann': 'Flag_of_the_Isle_of_Man.svg',
  'montserrat': 'Flag_of_Montserrat.svg',
  'pitcairn': 'Flag_of_the_Pitcairn_Islands.svg',
  'turks-and-caicos': 'Flag_of_the_Turks_and_Caicos_Islands.svg',
  'sark': 'Flag_of_Sark.svg',
  // Session bulk backfill (subdivisions, cities, historical empires)
  'br/ac': 'Flag_of_Acre.svg',
  'br/al': 'Flag_of_Alagoas.svg',
  'br/ap': 'Flag_of_Amapá.svg',
  'br/am': 'Flag_of_Amazonas.svg',
  'br/ba': 'Flag_of_Bahia.svg',
  'br/ce': 'Flag_of_Ceará.svg',
  'br/df': 'Flag_of_Distrito_Federal_(Brazil).svg',
  'br/es': 'Flag_of_Espírito_Santo.svg',
  'br/go': 'Flag_of_Goiás.svg',
  'br/ma': 'Flag_of_Maranhão.svg',
  'br/mt': 'Flag_of_Mato_Grosso.svg',
  'br/ms': 'Flag_of_Mato_Grosso_do_Sul.svg',
  'br/mg': 'Flag_of_Minas_Gerais.svg',
  'br/pa': 'Flag_of_Pará.svg',
  'br/pb': 'Flag_of_Paraíba.svg',
  'br/pr': 'Flag_of_Paraná.svg',
  'br/pe': 'Flag_of_Pernambuco.svg',
  'br/pi': 'Flag_of_Piauí.svg',
  'br/rj': 'Flag_of_Rio_de_Janeiro.svg',
  'br/rn': 'Flag_of_Rio_Grande_do_Norte.svg',
  'br/rs': 'Flag_of_Rio_Grande_do_Sul.svg',
  'br/ro': 'Flag_of_Rondônia.svg',
  'br/rr': 'Flag_of_Roraima.svg',
  'br/sc': 'Flag_of_Santa_Catarina.svg',
  'br/sp': 'Bandeira_do_estado_de_São_Paulo.svg',
  'br/se': 'Flag_of_Sergipe.svg',
  'br/to': 'Flag_of_Tocantins.svg',
  'id/aceh': 'Flag_of_Aceh.svg',
  'id/bali': 'Flag_of_Bali.svg',
  'id/banten': 'Flag_of_Banten.svg',
  'id/bengkulu': 'Flag_of_Bengkulu.svg',
  'id/central-java': 'Flag_of_Central_Java.svg',
  'id/central-kalimantan': 'Flag_of_Central_Kalimantan.svg',
  'id/central-sulawesi': 'Flag_of_Central_Sulawesi.svg',
  'id/east-java': 'Flag_of_East_Java.svg',
  'id/east-kalimantan': 'Flag_of_East_Kalimantan.svg',
  'id/east-nusa-tenggara': 'Flag_of_East_Nusa_Tenggara.svg',
  'id/gorontalo': 'Flag_of_Gorontalo.svg',
  'id/jambi': 'Flag_of_Jambi.svg',
  'id/lampung': 'Flag_of_Lampung.svg',
  'id/maluku': 'Flag_of_Maluku.svg',
  'id/north-kalimantan': 'Flag_of_North_Kalimantan.svg',
  'id/north-maluku': 'Flag_of_North_Maluku.svg',
  'id/north-sulawesi': 'Flag_of_North_Sulawesi.svg',
  'id/north-sumatra': 'Flag_of_North_Sumatra.svg',
  'id/papua': 'Flag_of_Papua.svg',
  'id/riau': 'Flag_of_Riau.svg',
  'id/south-kalimantan': 'Flag_of_South_Kalimantan.svg',
  'id/south-sulawesi': 'Flag_of_South_Sulawesi.svg',
  'id/south-sumatra': 'Flag_of_South_Sumatra.svg',
  'id/southeast-sulawesi': 'Flag_of_Southeast_Sulawesi.svg',
  'id/west-java': 'Flag_of_West_Java.svg',
  'id/west-kalimantan': 'Flag_of_West_Kalimantan.svg',
  'id/west-nusa-tenggara': 'Flag_of_West_Nusa_Tenggara.svg',
  'id/west-sulawesi': 'Flag_of_West_Sulawesi.svg',
  'id/west-sumatra': 'Flag_of_West_Sumatra.svg',
  'it/abruzzo': 'Flag_of_Abruzzo.svg',
  'it/aosta-valley': 'Flag_of_Aosta_Valley.svg',
  'it/apulia': 'Flag_of_Apulia.svg',
  'it/basilicata': 'Flag_of_Basilicata.svg',
  'it/calabria': 'Flag_of_Calabria.svg',
  'it/campania': 'Flag_of_Campania.svg',
  'it/emilia-romagna': 'Flag_of_Emilia-Romagna.svg',
  'it/friuli-venezia-giulia': 'Flag_of_Friuli-Venezia_Giulia.svg',
  'it/lazio': 'Flag_of_Lazio.svg',
  'it/liguria': 'Flag_of_Liguria.svg',
  'it/lombardy': 'Flag_of_Lombardy.svg',
  'it/marche': 'Flag_of_Marche.svg',
  'it/molise': 'Flag_of_Molise.svg',
  'it/piedmont': 'Flag_of_Piedmont.svg',
  'it/sardinia': 'Flag_of_Sardinia.svg',
  'it/sicily': 'Flag_of_Sicily.svg',
  'it/trentino-alto-adige': 'Flag_of_Trentino-South_Tyrol.svg',
  'it/tuscany': 'Flag_of_Tuscany.svg',
  'it/umbria': 'Flag_of_Umbria.svg',
  'it/veneto': 'Flag_of_Veneto.svg',
  'ru/adygea': 'Flag_of_Adygea.svg',
  'ru/altai-krai': 'Flag_of_Altai_Krai.svg',
  'ru/amur-oblast': 'Flag_of_Amur_Oblast.svg',
  'ru/arkhangelsk-oblast': 'Flag_of_Arkhangelsk_Oblast.svg',
  'ru/astrakhan-oblast': 'Flag_of_Astrakhan_Oblast.svg',
  'ru/bashkortostan': 'Flag_of_Bashkortostan.svg',
  'ru/belgorod-oblast': 'Flag_of_Belgorod_Oblast.svg',
  'ru/bryansk-oblast': 'Flag_of_Bryansk_Oblast.svg',
  'ru/buryatia': 'Flag_of_Buryatia.svg',
  'ru/chechnya': 'Flag_of_the_Chechen_Republic.svg',
  'ru/chelyabinsk-oblast': 'Flag_of_Chelyabinsk_Oblast.svg',
  'ru/chukotka-okrug': 'Flag_of_Chukotka.svg',
  'ru/chuvashia': 'Flag_of_Chuvashia.svg',
  'ru/dagestan': 'Flag_of_Dagestan.svg',
  'ru/ingushetia': 'Flag_of_Ingushetia.svg',
  'ru/irkutsk-oblast': 'Flag_of_Irkutsk_Oblast.svg',
  'ru/ivanovo-oblast': 'Flag_of_Ivanovo_Oblast.svg',
  'ru/jewish-oblast': 'Flag_of_the_Jewish_Autonomous_Oblast.svg',
  'ru/kabardino-balkaria': 'Flag_of_Kabardino_Balkaria.svg',
  'ru/kaliningrad-oblast': 'Flag_of_Kaliningrad_Oblast.svg',
  'ru/kalmykia': 'Flag_of_Kalmykia.svg',
  'ru/kaluga-oblast': 'Flag_of_Kaluga_Oblast.svg',
  'ru/kamchatka-krai': 'Flag_of_Kamchatka_Krai.svg',
  'ru/kemerovo-oblast': 'Flag_of_Kemerovo_Oblast.svg',
  'ru/khabarovsk-krai': 'Flag_of_Khabarovsk_Krai.svg',
  'ru/kirov-oblast': 'Flag_of_Kirov_Oblast.svg',
  'ru/kostroma-oblast': 'Flag_of_Kostroma_Oblast.svg',
  'ru/krasnodar-krai': 'Flag_of_Krasnodar_Krai.svg',
  'ru/krasnoyarsk-krai': 'Flag_of_Krasnoyarsk_Krai.svg',
  'ru/kurgan-oblast': 'Flag_of_Kurgan_Oblast.svg',
  'ru/kursk-oblast': 'Flag_of_Kursk_Oblast.svg',
  'ru/leningrad-oblast': 'Flag_of_Leningrad_Oblast.svg',
  'ru/lipetsk-oblast': 'Flag_of_Lipetsk_Oblast.svg',
  'ru/magadan-oblast': 'Flag_of_Magadan_Oblast.svg',
  'ru/mordovia': 'Flag_of_Mordovia.svg',
  'ru/moscow-oblast': 'Flag_of_Moscow_Oblast.svg',
  'ru/moscow': 'Flag_of_Moscow.svg',
  'ru/murmansk-oblast': 'Flag_of_Murmansk_Oblast.svg',
  'ru/north-ossetia': 'Flag_of_North_Ossetia.svg',
  'ru/novgorod-oblast': 'Flag_of_Novgorod_Oblast.svg',
  'ru/novosibirsk-oblast': 'Flag_of_Novosibirsk_Oblast.svg',
  'ru/omsk-oblast': 'Flag_of_Omsk_Oblast.svg',
  'ru/orenburg-oblast': 'Flag_of_Orenburg_Oblast.svg',
  'ru/oryol-oblast': 'Flag_of_Oryol_Oblast.svg',
  'ru/penza-oblast': 'Flag_of_Penza_Oblast.svg',
  'ru/perm-krai': 'Flag_of_Perm_Krai.svg',
  'ru/primorsky-krai': 'Flag_of_Primorsky_Krai.svg',
  'ru/pskov-oblast': 'Flag_of_Pskov_Oblast.svg',
  'ru/rostov-oblast': 'Flag_of_Rostov_Oblast.svg',
  'ru/ryazan-oblast': 'Flag_of_Ryazan_Oblast.svg',
  'ru/sakha': 'Flag_of_Sakha.svg',
  'ru/sakhalin-oblast': 'Flag_of_Sakhalin_Oblast.svg',
  'ru/samara-oblast': 'Flag_of_Samara_Oblast.svg',
  'ru/saratov-oblast': 'Flag_of_Saratov_Oblast.svg',
  'ru/sevastopol': 'Flag_of_Sevastopol.svg',
  'ru/smolensk-oblast': 'Flag_of_Smolensk_Oblast.svg',
  'ru/stavropol-krai': 'Flag_of_Stavropol_Krai.svg',
  'ru/sverdlovsk-oblast': 'Flag_of_Sverdlovsk_Oblast.svg',
  'ru/tambov-oblast': 'Flag_of_Tambov_Oblast.svg',
  'ru/tatarstan': 'Flag_of_Tatarstan.svg',
  'ru/tomsk-oblast': 'Flag_of_Tomsk_Oblast.svg',
  'ru/tula-oblast': 'Flag_of_Tula_Oblast.svg',
  'ru/tuva': 'Flag_of_Tuva.svg',
  'ru/tver-oblast': 'Flag_of_Tver_Oblast.svg',
  'ru/tyumen-oblast': 'Flag_of_Tyumen_Oblast.svg',
  'ru/udmurtia': 'Flag_of_Udmurtia.svg',
  'ru/ulyanovsk-oblast': 'Flag_of_Ulyanovsk_Oblast.svg',
  'ru/vladimir-oblast': 'Flag_of_Vladimir_Oblast.svg',
  'ru/volgograd-oblast': 'Flag_of_Volgograd_Oblast.svg',
  'ru/vologda-oblast': 'Flag_of_Vologda_Oblast.svg',
  'ru/voronezh-oblast': 'Flag_of_Voronezh_Oblast.svg',
  'ru/yamalo-nenets': 'Flag_of_Yamalo-Nenets_Autonomous_Okrug.svg',
  'ru/yaroslavl-oblast': 'Flag_of_Yaroslavl_Oblast.svg',
  'ru/zabaykalsky-krai': 'Flag_of_Zabaykalsky_Krai.svg',
  'ch/zurich': 'Flag_of_Canton_of_Zürich.svg',
  'ch/bern': 'Flag_of_Canton_of_Bern.svg',
  'ch/lucerne': 'Flag_of_Canton_of_Lucerne.svg',
  'ch/uri': 'Flag_of_Canton_of_Uri.svg',
  'ch/schwyz': 'Flag_of_Canton_of_Schwyz.svg',
  'ch/obwalden': 'Flag_of_Canton_of_Obwalden.svg',
  'ch/nidwalden': 'Flag_of_Canton_of_Nidwalden.svg',
  'ch/glarus': 'Flag_of_Canton_of_Glarus.svg',
  'ch/zug': 'Flag_of_Canton_of_Zug.svg',
  'ch/fribourg': 'Flag_of_Canton_of_Fribourg.svg',
  'ch/solothurn': 'Flag_of_Canton_of_Solothurn.svg',
  'ch/basel-stadt': 'Flag_of_Canton_of_Basel.svg',
  'ch/basel-landschaft': 'Flag_of_Canton_of_Basel-Landschaft.svg',
  'ch/schaffhausen': 'Flag_of_Canton_of_Schaffhausen.svg',
  'ch/appenzell-ar': 'Flag_of_Canton_of_Appenzell_Ausserrhoden.svg',
  'ch/appenzell-ir': 'Flag_of_Canton_of_Appenzell_Innerrhoden.svg',
  'ch/st-gallen': 'Flag_of_Canton_of_Sankt_Gallen.svg',
  'ch/graubunden': 'Flag_of_Canton_of_Graubünden.svg',
  'ch/aargau': 'Flag_of_Canton_of_Aargau.svg',
  'ch/thurgau': 'Flag_of_Canton_of_Thurgau.svg',
  'ch/ticino': 'Flag_of_Canton_of_Ticino.svg',
  'ch/vaud': 'Flag_of_Canton_of_Vaud.svg',
  'ch/valais': 'Flag_of_Canton_of_Valais.svg',
  'ch/neuchatel': 'Flag_of_Canton_of_Neuchâtel.svg',
  'ch/geneva': 'Flag_of_Canton_of_Geneva.svg',
  'ch/jura': 'Flag_of_Canton_of_Jura.svg',
  'genoa': 'Flag_of_Genoa.svg',
  'seljuk': 'Flag_of_Seljuk_Empire_(16_Great_Turkic_Empires)_1.svg',
  'safavid': 'Safavid_Flag.svg',
  'parthian': 'Flag_of_Parthian_Empire.svg',
  'delhi-sultanate': 'Flag_of_the_Delhi_Sultanate.svg',
  'maratha': 'Flag_of_the_Maratha_Empire.svg',
  'mali-empire': 'Flag_of_the_Mali_Empire.svg',
  'teutonic': 'Flag_of_the_Teutonic_Order.svg',
  'templar': 'Flag_of_the_Knights_Templar.svg',
  'smom': 'Flag_of_the_Sovereign_Military_Order_of_Malta.svg',
  'lithuania-gd': 'Royal_banner_of_the_Grand_Duchy_of_Lithuania.svg',
  'majapahit': 'Majapahit_fictitious_flag.svg',
  'khazar': 'Flag_of_the_Khazars_(16_Great_Turkic_Empires).svg',
  'sokoto': 'Flag_of_the_Sokoto_Caliphate.svg',
  'kanem-bornu': 'Flag_of_the_Kanem-Bornu_Empire.svg',
  'gokturk': 'Flag_of_the_Göktürks_Khaganate.svg',
  'uyghur-khaganate': 'Flag_of_Uyghur_Khaganate_(16_Great_Turkic_Empires)_1.svg',
  'aragon': 'Flag_of_Aragon.svg',
  'castile': 'Royal_Banner_of_the_Kingdom_of_Castile.svg',
  'nasrid': 'Nasrid_Flag.svg',
  'florence': 'Flag_of_Florence.svg',
  'pisa': 'Flag_of_Pisa_SC.svg',
  'papal-states': 'Flag_of_the_Papal_States,_ca._1523.svg',
  'kalmar-union': 'Flag_of_the_Kalmar_Union.svg',
  'austria-hungary': 'Austria-Hungary_naval_ensign_15-18.svg',
  'bohemia': 'Flag_of_Bohemia.svg',
  'sultanate-rum': 'Flag_of_Sultanate_of_Rum.svg',
  'omani-empire': 'Flag_of_the_Omani_Empire.svg',
  'leon': 'Flag_of_Early_Medieval_Kingdom_of_Leon.svg',
  'navarre': 'Flag_of_Navarre_(1212–1589).svg',
  'milan': 'Flag_of_the_Duchy_of_Milan_(1450,_2-3_ratio).svg',
  'afsharid': 'Afsharid_State_Flag.svg',
  'zanzibar-sultanate': 'Flag_of_the_Sultanate_of_Zanzibar_(1963).svg',
  'transvaal': 'Flag_of_Transvaal.svg',
  'orange-free-state': 'Flag_of_the_Orange_Free_State.svg',
  'gran-colombia': 'Flag_of_Gran_Colombia.svg',
  'wallachia': 'Flag_of_Wallachia.svg',
  'moldavia': 'Flag_of_Moldavia.svg',
  'transylvania': 'Flag_of_Transylvania_(Local).svg',
  'ragusa': 'Libertas.svg',
  'aq-qoyunlu': 'Flag_of_the_Aq_Qoyunlu_Uzun_Hasan.svg',
  'zand': 'Zand_Dynasty_flag.svg',
  'crimean-khanate': 'Flag_of_the_Crimean_Khanate_(15th_century).svg',
  'ayutthaya': 'Flag_of_Thailand_(Ayutthaya_period).svg',
  'konbaung': 'National_flag_of_the_Konbaung_Empire.svg',
  'dahomey': 'Flag_of_Ghezo_of_Dahomey.svg',
  'bukhara': 'Flag_of_the_Emirate_of_Bukhara.svg',
  'khiva': 'Flag_of_the_Khanate_of_Khiva.svg',
  'kokand': 'Flag_of_the_Khanate_of_Kokand.svg',
  'hyderabad': 'Asafia_flag_of_Hyderabad_State.svg',
  'merina': 'Merina_Kingdom_flag.svg',
  'sulu': 'Late_19th_Century_Flag_of_Sulu.svg',
  'mataram': 'Flag_of_the_Sultanate_of_Mataram.svg',
  'parma': 'Flag_of_the_Duchy_of_Parma.svg',
  'jp/hokkaido': 'Flag_of_Hokkaido_Prefecture.svg',
  'jp/aomori': 'Flag_of_Aomori_Prefecture.svg',
  'jp/iwate': 'Flag_of_Iwate_Prefecture.svg',
  'jp/miyagi': 'Flag_of_Miyagi_Prefecture.svg',
  'jp/akita': 'Flag_of_Akita_Prefecture.svg',
  'jp/yamagata': 'Flag_of_Yamagata_Prefecture.svg',
  'jp/fukushima': 'Flag_of_Fukushima_Prefecture.svg',
  'jp/ibaraki': 'Flag_of_Ibaraki_Prefecture.svg',
  'jp/tochigi': 'Flag_of_Tochigi_Prefecture.svg',
  'jp/gunma': 'Flag_of_Gunma_Prefecture.svg',
  'jp/saitama': 'Flag_of_Saitama_Prefecture.svg',
  'jp/chiba': 'Flag_of_Chiba_Prefecture.svg',
  'jp/tokyo': 'Flag_of_Tokyo_Prefecture.svg',
  'jp/kanagawa': 'Flag_of_Kanagawa_Prefecture.svg',
  'jp/niigata': 'Flag_of_Niigata_Prefecture.svg',
  'jp/toyama': 'Flag_of_Toyama_Prefecture.svg',
  'jp/ishikawa': 'Flag_of_Ishikawa_Prefecture.svg',
  'jp/fukui': 'Flag_of_Fukui_Prefecture.svg',
  'jp/yamanashi': 'Flag_of_Yamanashi_Prefecture.svg',
  'jp/nagano': 'Flag_of_Nagano_Prefecture.svg',
  'jp/gifu': 'Flag_of_Gifu_Prefecture.svg',
  'jp/shizuoka': 'Flag_of_Shizuoka_Prefecture.svg',
  'jp/aichi': 'Flag_of_Aichi_Prefecture.svg',
  'jp/mie': 'Flag_of_Mie_Prefecture.svg',
  'jp/shiga': 'Flag_of_Shiga_Prefecture.svg',
  'jp/kyoto': 'Flag_of_Kyoto_Prefecture.svg',
  'jp/osaka': 'Flag_of_Osaka_Prefecture.svg',
  'jp/hyogo': 'Flag_of_Hyōgo_Prefecture.svg',
  'jp/nara': 'Flag_of_Nara_Prefecture.svg',
  'jp/wakayama': 'Flag_of_Wakayama_Prefecture.svg',
  'jp/tottori': 'Flag_of_Tottori_Prefecture.svg',
  'jp/shimane': 'Flag_of_Shimane_Prefecture.svg',
  'jp/okayama': 'Flag_of_Okayama_Prefecture.svg',
  'jp/hiroshima': 'Flag_of_Hiroshima_Prefecture.svg',
  'jp/yamaguchi': 'Flag_of_Yamaguchi_Prefecture.svg',
  'jp/tokushima': 'Flag_of_Tokushima_Prefecture.svg',
  'jp/kagawa': 'Flag_of_Kagawa_Prefecture.svg',
  'jp/ehime': 'Flag_of_Ehime_Prefecture.svg',
  'jp/kochi': 'Flag_of_Kōchi_Prefecture.svg',
  'jp/fukuoka': 'Flag_of_Fukuoka_Prefecture.svg',
  'jp/saga': 'Flag_of_Saga_Prefecture.svg',
  'jp/nagasaki': 'Flag_of_Nagasaki_Prefecture.svg',
  'jp/kumamoto': 'Flag_of_Kumamoto_Prefecture.svg',
  'jp/oita': 'Flag_of_Ōita_Prefecture.svg',
  'jp/miyazaki': 'Flag_of_Miyazaki_Prefecture.svg',
  'jp/kagoshima': 'Flag_of_Kagoshima_Prefecture.svg',
  'jp/okinawa': 'Flag_of_Okinawa_Prefecture.svg',
  'pride-bi': 'Bisexual_Pride_Flag.svg',
  'pride-pan': 'Pansexuality_flag.svg',
  'pride-asexual': 'Asexual_Pride_Flag.svg',
  'pride-nonbinary': 'Nonbinary_flag.svg',
  'pride-genderqueer': 'Genderqueer_Pride_Flag.svg',
  'pride-genderfluid': 'Genderfluidity_Pride-Flag.svg',
  'pride-agender': 'Agender_pride_flag.svg',
  'pride-intersex': 'Intersex_Pride_Flag.svg',
  'pride-lesbian': 'Globasa_lesbian_pride_flag.svg',
  'pride-aromantic': 'Aromantic_Pride_Flag.svg',
  'pride-demisexual': 'Demisexual_Pride_Flag.svg',
  'pride-bear': 'Bear_Brotherhood_flag.svg',
  'pride-leather': 'Leather,_Latex,_and_BDSM_pride_-_Light.svg',
  'pride-rubber': 'Rubber_Fetish_Pride_Flag.svg',
  'pride-polyamory': 'Polyamory_Pride_Flag.svg',
  'pride-philadelphia': 'More_Color_More_Pride_Flag.svg',
  'amsterdam': 'Flag_of_Amsterdam.svg',
  'auckland': 'Flag_of_Auckland.svg',
  'austin': 'Flag_of_Austin,_Texas.svg',
  'bangkok': 'Flag_of_Bangkok.svg',
  'belfast': 'Flag_of_Belfast.svg',
  'belgrade': 'Flag_of_Belgrade.svg',
  'berlin': 'Flag_of_Berlin.svg',
  'bogota': 'Flag_of_Bogotá.svg',
  'bucharest': 'Flag_of_Bucharest.svg',
  'budapest': 'Flag_of_Budapest.svg',
  'busan': 'Flag_of_Busan.svg',
  'cairo': 'Flag_of_Cairo.svg',
  'caracas': 'Flag_of_Caracas.svg',
  'chisinau': 'Flag_of_Chișinău.svg',
  'delhi-city': 'Flag_of_Delhi.svg',
  'denver': 'Flag_of_Denver,_Colorado.svg',
  'edinburgh': 'Flag_of_Edinburgh.svg',
  'helsinki': 'Flag_of_Helsinki.svg',
  'hong-kong': 'Flag_of_Hong_Kong.svg',
  'jerusalem': 'Flag_of_Jerusalem.svg',
  'kuala-lumpur': 'Flag_of_Kuala_Lumpur.svg',
  'las-vegas': 'Flag_of_Las_Vegas,_Nevada.svg',
  'lima': 'Flag_of_Lima.svg',
  'lisbon': 'Flag_of_Lisbon.svg',
  'london': 'Flag_of_the_City_of_London.svg',
  'los-angeles': 'Flag_of_Los_Angeles,_California.svg',
  'macau': 'Flag_of_Macau.svg',
  'manila': 'Flag_of_Manila.svg',
  'melbourne': 'Flag_of_Melbourne.svg',
  'mexico-city-city': 'Flag_of_Mexico_City.svg',
  'miami': 'Flag_of_Miami,_Florida.svg',
  'minsk': 'Flag_of_Minsk.svg',
  'montreal': 'Flag_of_Montreal.svg',
  'moscow-city': 'Flag_of_Moscow.svg',
  'nagoya': 'Flag_of_Nagoya.svg',
  'new-orleans': 'Flag_of_New_Orleans,_Louisiana.svg',
  'new-york-city': 'Flag_of_New_York_City.svg',
  'osaka-city': 'Flag_of_Osaka_City.svg',
  'oslo': 'Flag_of_Oslo.svg',
  'paris': 'Flag_of_Paris.svg',
  'philadelphia-city': 'Flag_of_Philadelphia,_Pennsylvania.svg',
  'phoenix-city': 'Flag_of_Phoenix,_Arizona.svg',
  'portland-or': 'Flag_of_Portland,_Oregon.svg',
  'prague': 'Flag_of_Prague.svg',
  'riga': 'Flag_of_Riga.svg',
  'rome': 'Flag_of_Rome.svg',
  'san-francisco': 'Flag_of_San_Francisco.svg',
  'san-juan-pr': 'Flag_of_San_Juan,_Puerto_Rico.svg',
  'sarajevo': 'Flag_of_Sarajevo.svg',
  'seoul': 'Flag_of_Seoul.svg',
  'singapore-city': 'Flag_of_Singapore.svg',
  'tallinn': 'Flag_of_Tallinn.svg',
  'tbilisi': 'Flag_of_Tbilisi.svg',
  'tehran': 'Flag_of_Tehran.svg',
  'tirana': 'Flag_of_Tirana.svg',
  'tokyo-city': 'Flag_of_Tokyo_Metropolis.svg',
  'vancouver': 'Flag_of_Vancouver.svg',
  'vienna': 'Flag_of_Wien.svg',
  'vilnius': 'Flag_of_Vilnius.svg',
  'warsaw': 'Flag_of_Warsaw.svg',
  'washington-dc-city': 'Flag_of_the_District_of_Columbia.svg',
  'zagreb': 'Flag_of_Zagreb.svg',
  'ics-a': 'ICS_Alfa.svg',
  'ics-b': 'ICS_Bravo.svg',
  'ics-c': 'ICS_Charlie.svg',
  'ics-d': 'ICS_Delta.svg',
  'ics-e': 'ICS_Echo.svg',
  'ics-f': 'ICS_Foxtrot.svg',
  'ics-g': 'ICS_Golf.svg',
  'ics-h': 'ICS_Hotel.svg',
  'ics-i': 'ICS_India.svg',
  'ics-j': 'ICS_Juliet.svg',
  'ics-k': 'ICS_Kilo.svg',
  'ics-l': 'ICS_Lima.svg',
  'ics-m': 'ICS_Mike.svg',
  'ics-n': 'ICS_November.svg',
  'ics-o': 'ICS_Oscar.svg',
  'ics-p': 'ICS_Papa.svg',
  'ics-q': 'ICS_Quebec.svg',
  'ics-r': 'ICS_Romeo.svg',
  'ics-s': 'ICS_Sierra.svg',
  'ics-t': 'ICS_Tango.svg',
  'ics-u': 'ICS_Uniform.svg',
  'ics-v': 'ICS_Victor.svg',
  'ics-w': 'ICS_Whiskey.svg',
  'ics-x': 'ICS_X-ray.svg',
  'ics-y': 'ICS_Yankee.svg',
  'ics-z': 'ICS_Zulu.svg',
  'us/california': 'Flag_of_California.svg',
  'us/alabama': 'Flag_of_Alabama.svg',
  'us/arkansas': 'Flag_of_Arkansas.svg',
  'us/connecticut': 'Flag_of_Connecticut.svg',
  'us/delaware': 'Flag_of_Delaware.svg',
  'us/florida': 'Flag_of_Florida.svg',
  'us/idaho': 'Flag_of_Idaho.svg',
  'us/illinois': 'Flag_of_Illinois.svg',
  'us/indiana': 'Flag_of_Indiana.svg',
  'us/iowa': 'Flag_of_Iowa.svg',
  'us/kansas': 'Flag_of_Kansas.svg',
  'us/kentucky': 'Flag_of_Kentucky.svg',
  'us/louisiana': 'Flag_of_Louisiana.svg',
  'us/maine': 'Flag_of_Maine.svg',
  'us/massachusetts': 'Flag_of_Massachusetts.svg',
  'us/michigan': 'Flag_of_Michigan.svg',
  'us/minnesota': 'Flag_of_Minnesota.svg',
  'us/missouri': 'Flag_of_Missouri.svg',
  'us/montana': 'Flag_of_Montana.svg',
  'us/nebraska': 'Flag_of_Nebraska.svg',
  'us/nevada': 'Flag_of_Nevada.svg',
  'us/new-hampshire': 'Flag_of_New_Hampshire.svg',
  'us/new-jersey': 'Flag_of_New_Jersey.svg',
  'us/north-carolina': 'Flag_of_North_Carolina.svg',
  'us/north-dakota': 'Flag_of_North_Dakota.svg',
  'us/oklahoma': 'Flag_of_Oklahoma.svg',
  'us/oregon': 'Flag_of_Oregon.svg',
  'us/pennsylvania': 'Flag_of_Pennsylvania.svg',
  'us/rhode-island': 'Flag_of_Rhode_Island.svg',
  'us/south-dakota': 'Flag_of_South_Dakota.svg',
  'us/tennessee': 'Flag_of_Tennessee.svg',
  'us/utah': 'Flag_of_Utah.svg',
  'us/vermont': 'Flag_of_Vermont.svg',
  'us/virginia': 'Flag_of_Virginia.svg',
  'us/washington': 'Flag_of_Washington.svg',
  'us/west-virginia': 'Flag_of_West_Virginia.svg',
  'us/wisconsin': 'Flag_of_Wisconsin.svg',
  'us/wyoming': 'Flag_of_Wyoming.svg',
  'us/texas': 'Flag_of_Texas.svg',
  'us/hawaii': 'Flag_of_Hawaii.svg',
  'us/puerto-rico': 'Flag_of_Puerto_Rico.svg',
  'us/washington-dc': 'Flag_of_the_District_of_Columbia.svg',
  'ca/quebec': 'Flag_of_Quebec.svg',
  'ca/manitoba': 'Flag_of_Manitoba.svg',
  'ca/new-brunswick': 'Flag_of_New_Brunswick.svg',
  'ca/newfoundland-labrador': 'Flag_of_Newfoundland_Labrador.svg',
  'ca/nova-scotia': 'Flag_of_Nova_Scotia.svg',
  'ca/prince-edward-island': 'Flag_of_Prince_Edward_Island.svg',
  'ca/saskatchewan': 'Flag_of_Saskatchewan.svg',
  'ca/northwest-territories': 'Flag_of_Northwest_Territories.svg',
  'ca/nunavut': 'Flag_of_Nunavut.svg',
  'ca/yukon': 'Flag_of_Yukon.svg',
  'uk/scotland': 'Flag_of_Scotland.svg',
  'uk/wales': 'Flag_of_Wales.svg',
  'uk/england': 'Flag_of_England.svg',
  'us/new-york': 'Flag_of_New_York.svg',
  'us/alaska': 'Flag_of_Alaska.svg',
  'us/maryland': 'Flag_of_Maryland.svg',
  'us/new-mexico': 'Flag_of_New_Mexico.svg',
  'us/arizona': 'Flag_of_Arizona.svg',
  'us/colorado': 'Flag_of_Colorado.svg',
  'us/south-carolina': 'Flag_of_South_Carolina.svg',
  'us/ohio': 'Flag_of_Ohio.svg',
  'us/mississippi': 'Flag_of_Mississippi.svg',
  'us/georgia': 'Flag_of_Georgia_(U.S._state).svg',
  'ca/ontario': 'Flag_of_Ontario.svg',
  'ca/british-columbia': 'Flag_of_British_Columbia.svg',
  'ca/alberta': 'Flag_of_Alberta.svg',
  'uk/northern-ireland': 'Ulster_Banner.svg',
  'uk/cornwall': 'Flag_of_Cornwall.svg',
  'in/jammu-kashmir': 'Flag_of_Jammu_Kashmir.svg',
  'in/tamil-nadu': 'Flag_of_Tamil_Nadu.svg',
  'in/arunachal-pradesh': 'Flag_of_Arunachal_Pradesh.svg',
  'in/assam': 'Flag_of_Assam.svg',
  'in/chandigarh': 'Flag_of_Chandigarh.svg',
  'in/dadra-nagar-haveli': 'Flag_of_Dadra_Nagar_Haveli.svg',
  'in/delhi': 'Flag_of_Delhi.svg',
  'in/goa': 'Flag_of_Goa.svg',
  'in/gujarat': 'Flag_of_Gujarat.svg',
  'in/haryana': 'Flag_of_Haryana.svg',
  'in/jharkhand': 'Flag_of_Jharkhand.svg',
  'in/karnataka': 'Flag_of_Karnataka.svg',
  'in/ladakh': 'Flag_of_Ladakh.svg',
  'in/madhya-pradesh': 'Flag_of_Madhya_Pradesh.svg',
  'in/maharashtra': 'Flag_of_Maharashtra.svg',
  'in/manipur': 'Flag_of_Manipur.svg',
  'in/nagaland': 'Flag_of_Nagaland.svg',
  'in/odisha': 'Flag_of_Odisha.svg',
  'in/punjab': 'Flag_of_Punjab,_India.svg',
  'in/rajasthan': 'Flag_of_Rajasthan.svg',
  'in/telangana': 'Flag_of_Telangana.svg',
  'in/tripura': 'Flag_of_Tripura.svg',
  'in/uttar-pradesh': 'Flag_of_Uttar_Pradesh.svg',
  'in/uttarakhand': 'Flag_of_Uttarakhand.svg',
  'in/sikkim': 'Flag_of_Sikkim.svg',
  'de/bavaria': 'Flag_of_Bavaria.svg',
  'de/prussia': 'Flag_of_Prussia.svg',
  'de/baden-wurttemberg': 'Flag_of_Baden_Wurttemberg.svg',
  'de/berlin': 'Flag_of_Berlin.svg',
  'de/brandenburg': 'Flag_of_Brandenburg.svg',
  'de/bremen': 'Flag_of_Bremen.svg',
  'de/hamburg': 'Flag_of_Hamburg.svg',
  'de/hesse': 'Flag_of_Hesse.svg',
  'de/mecklenburg-vorpommern': 'Flag_of_Mecklenburg_Vorpommern.svg',
  'de/lower-saxony': 'Flag_of_Lower_Saxony.svg',
  'de/north-rhine-westphalia': 'Flag_of_North_Rhine_Westphalia.svg',
  'de/rhineland-palatinate': 'Flag_of_Rhineland_Palatinate.svg',
  'de/saarland': 'Flag_of_Saarland.svg',
  'de/saxony': 'Flag_of_Saxony.svg',
  'de/saxony-anhalt': 'Flag_of_Saxony_Anhalt.svg',
  'de/schleswig-holstein': 'Flag_of_Schleswig_Holstein.svg',
  'de/thuringia': 'Flag_of_Thuringia.svg',
  'es/basque': 'Flag_of_Basque.svg',
  'es/aragon': 'Flag_of_Aragon.svg',
  'es/asturias': 'Flag_of_Asturias.svg',
  'es/balearic-islands': 'Flag_of_the_Balearic_Islands.svg',
  'es/canary-islands': 'Flag_of_the_Canary_Islands.svg',
  'es/cantabria': 'Flag_of_Cantabria.svg',
  'es/castile-leon': 'Flag_of_Castile_and_León.svg',
  'es/castilla-la-mancha': 'Flag_of_Castilla-La_Mancha.svg',
  'es/catalonia': 'Flag_of_Catalonia.svg',
  'es/extremadura': 'Flag_of_Extremadura.svg',
  'es/galicia': 'Flag_of_Galicia.svg',
  'es/la-rioja': 'Flag_of_La_Rioja_(with_coat_of_arms).svg',
  'es/madrid': 'Flag_of_the_Community_of_Madrid.svg',
  'es/murcia': 'Flag_of_the_Region_of_Murcia.svg',
  'es/navarre': 'Flag_of_Navarre.svg',
  'es/valencia': 'Flag_of_the_Valencian_Community_(2x3).svg',
  'es/ceuta': 'Flag_of_Ceuta.svg',
  'es/melilla': 'Flag_of_Melilla.svg',
  'es/andalusia': 'Flag_of_Andalusia.svg',
  'au/aboriginal': 'Flag_of_Aboriginal.svg',
  'au/new-south-wales': 'Flag_of_New_South_Wales.svg',
  'au/victoria': 'Flag_of_Victoria.svg',
  'au/queensland': 'Flag_of_Queensland.svg',
  'au/south-australia': 'Flag_of_South_Australia.svg',
  'au/western-australia': 'Flag_of_Western_Australia.svg',
  'au/tasmania': 'Flag_of_Tasmania.svg',
  'au/act': 'Flag_of_Act.svg',
  'au/nt': 'Flag_of_Nt.svg',
  'au/torres-strait': 'Flag_of_Torres_Strait.svg',
};

function getCommonsUrl(flagId) {
  if (commonsFileMap[flagId]) {
    return 'https://commons.wikimedia.org/wiki/File:' + commonsFileMap[flagId];
  }
  return null;
}

const wikiIcon = `<svg width="20" height="20" viewBox="0 0 128 128"><path d="M120.85,29.21C120.85,29.62 120.72,29.99 120.47,30.33C120.21,30.66 119.94,30.83 119.63,30.83C117.14,31.07 115.09,31.87 113.51,33.24C111.92,34.6 110.29,37.21 108.6,41.05L82.8,99.19C82.63,99.73 82.16,100 81.38,100C80.77,100 80.3,99.73 79.96,99.19L65.49,68.93L48.85,99.19C48.51,99.73 48.04,100 47.43,100C46.69,100 46.2,99.73 45.96,99.19L20.61,41.05C19.03,37.44 17.36,34.92 15.6,33.49C13.85,32.06 11.4,31.17 8.27,30.83C8,30.83 7.74,30.69 7.51,30.4C7.27,30.12 7.15,29.79 7.15,29.42C7.15,28.47 7.42,28 7.96,28C10.22,28 12.58,28.1 15.05,28.3C17.34,28.51 19.5,28.61 21.52,28.61C23.58,28.61 26.01,28.51 28.81,28.3C31.74,28.1 34.34,28 36.6,28C37.14,28 37.41,28.47 37.41,29.42C37.41,30.36 37.24,30.83 36.91,30.83C34.65,31 32.87,31.58 31.57,32.55C30.27,33.53 29.62,34.81 29.62,36.4C29.62,37.21 29.89,38.22 30.43,39.43L51.38,86.74L63.27,64.28L52.19,41.05C50.2,36.91 48.56,34.23 47.28,33.03C46,31.84 44.06,31.1 41.46,30.83C41.22,30.83 41,30.69 40.78,30.4C40.56,30.12 40.45,29.79 40.45,29.42C40.45,28.47 40.68,28 41.16,28C43.42,28 45.49,28.1 47.38,28.3C49.2,28.51 51.14,28.61 53.2,28.61C55.22,28.61 57.36,28.51 59.62,28.3C61.95,28.1 64.24,28 66.5,28C67.04,28 67.31,28.47 67.31,29.42C67.31,30.36 67.15,30.83 66.81,30.83C62.29,31.14 60.03,32.42 60.03,34.68C60.03,35.69 60.55,37.26 61.6,39.38L68.93,54.26L76.22,40.65C77.23,38.73 77.74,37.11 77.74,35.79C77.74,32.69 75.48,31.04 70.96,30.83C70.55,30.83 70.35,30.36 70.35,29.42C70.35,29.08 70.45,28.76 70.65,28.46C70.86,28.15 71.06,28 71.26,28C72.88,28 74.87,28.1 77.23,28.3C79.49,28.51 81.35,28.61 82.8,28.61C83.84,28.61 85.38,28.52 87.4,28.35C89.96,28.12 92.11,28 93.83,28C94.23,28 94.43,28.4 94.43,29.21C94.43,30.29 94.06,30.83 93.32,30.83C90.69,31.1 88.57,31.83 86.97,33.01C85.37,34.19 83.37,36.87 80.98,41.05L71.26,59.02L84.42,85.83L103.85,40.65C104.52,39 104.86,37.48 104.86,36.1C104.86,32.79 102.6,31.04 98.08,30.83C97.67,30.83 97.47,29.42 97.47,28.47C97.47,28.47 97.77,28 98.38,28C100.03,28 101.99,28.1 104.25,28.3C106.34,28.51 108.1,28.61 109.51,28.61C111,28.61 112.72,28.51 114.67,28.3C116.7,28.1 118.52,28 120.14,28C120.61,28 120.85,28.4 120.85,29.21z" fill="currentColor"/></svg>`;

// ─── SVG sprite for deduplicating repeated icons ────────────────────────────
function svgSprite() {
  return `<svg style="display:none" xmlns="http://www.w3.org/2000/svg">
  <symbol id="icon-wiki" viewBox="0 0 128 128"><path d="M120.85,29.21C120.85,29.62 120.72,29.99 120.47,30.33C120.21,30.66 119.94,30.83 119.63,30.83C117.14,31.07 115.09,31.87 113.51,33.24C111.92,34.6 110.29,37.21 108.6,41.05L82.8,99.19C82.63,99.73 82.16,100 81.38,100C80.77,100 80.3,99.73 79.96,99.19L65.49,68.93L48.85,99.19C48.51,99.73 48.04,100 47.43,100C46.69,100 46.2,99.73 45.96,99.19L20.61,41.05C19.03,37.44 17.36,34.92 15.6,33.49C13.85,32.06 11.4,31.17 8.27,30.83C8,30.83 7.74,30.69 7.51,30.4C7.27,30.12 7.15,29.79 7.15,29.42C7.15,28.47 7.42,28 7.96,28C10.22,28 12.58,28.1 15.05,28.3C17.34,28.51 19.5,28.61 21.52,28.61C23.58,28.61 26.01,28.51 28.81,28.3C31.74,28.1 34.34,28 36.6,28C37.14,28 37.41,28.47 37.41,29.42C37.41,30.36 37.24,30.83 36.91,30.83C34.65,31 32.87,31.58 31.57,32.55C30.27,33.53 29.62,34.81 29.62,36.4C29.62,37.21 29.89,38.22 30.43,39.43L51.38,86.74L63.27,64.28L52.19,41.05C50.2,36.91 48.56,34.23 47.28,33.03C46,31.84 44.06,31.1 41.46,30.83C41.22,30.83 41,30.69 40.78,30.4C40.56,30.12 40.45,29.79 40.45,29.42C40.45,28.47 40.68,28 41.16,28C43.42,28 45.49,28.1 47.38,28.3C49.2,28.51 51.14,28.61 53.2,28.61C55.22,28.61 57.36,28.51 59.62,28.3C61.95,28.1 64.24,28 66.5,28C67.04,28 67.31,28.47 67.31,29.42C67.31,30.36 67.15,30.83 66.81,30.83C62.29,31.14 60.03,32.42 60.03,34.68C60.03,35.69 60.55,37.26 61.6,39.38L68.93,54.26L76.22,40.65C77.23,38.73 77.74,37.11 77.74,35.79C77.74,32.69 75.48,31.04 70.96,30.83C70.55,30.83 70.35,30.36 70.35,29.42C70.35,29.08 70.45,28.76 70.65,28.46C70.86,28.15 71.06,28 71.26,28C72.88,28 74.87,28.1 77.23,28.3C79.49,28.51 81.35,28.61 82.8,28.61C83.84,28.61 85.38,28.52 87.4,28.35C89.96,28.12 92.11,28 93.83,28C94.23,28 94.43,28.4 94.43,29.21C94.43,30.29 94.06,30.83 93.32,30.83C90.69,31.1 88.57,31.83 86.97,33.01C85.37,34.19 83.37,36.87 80.98,41.05L71.26,59.02L84.42,85.83L103.85,40.65C104.52,39 104.86,37.48 104.86,36.1C104.86,32.79 102.6,31.04 98.08,30.83C97.67,30.83 97.47,29.42 97.47,28.47C97.47,28.47 97.77,28 98.38,28C100.03,28 101.99,28.1 104.25,28.3C106.34,28.51 108.1,28.61 109.51,28.61C111,28.61 112.72,28.51 114.67,28.3C116.7,28.1 118.52,28 120.14,28C120.61,28 120.85,28.4 120.85,29.21z" fill="currentColor"/></symbol>
  <symbol id="icon-index" viewBox="0 0 16 16"><path d="M2 3h12M2 6.5h8M2 10h10M2 13.5h6" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/></symbol>
  <symbol id="icon-prev" viewBox="0 0 16 16"><path d="M10.5 2.5L4.5 8l6 5.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  <symbol id="icon-next" viewBox="0 0 16 16"><path d="M5.5 2.5L11.5 8l-6 5.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></symbol>
  <symbol id="icon-details" viewBox="0 0 16 16"><path d="M2 4h12M2 8h12M2 12h8" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/></symbol>
  <symbol id="icon-close" viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></symbol>
  <symbol id="icon-verified" viewBox="0 0 16 16"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm3.3 5.7l-4 4a1 1 0 01-1.4 0l-2-2a1 1 0 111.4-1.4L6.6 8.6l3.3-3.3a1 1 0 011.4 1.4z" fill="currentColor"/></symbol>
  <symbol id="icon-unverified" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 4.5v4M8 10.5v1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></symbol>
</svg>`;
}

// ─── generate individual flag pages ──────────────────────────────────────────
function generateFlagPage(flagId) {
  const fd = getFullFlagData(flagId);
  const dir = path.join(ROOT, flagId);
  fs.mkdirSync(dir, { recursive: true });

  // Flag image
  const flagSrc = (fd.flag && fd.flag !== 'none') ? flagImgPath(fd.flag) : '';

  // Subtitle
  const subtitleHtml = fd.subtitle
    ? `<p class="text-muted">${escHtml(fd.subtitle)}</p>`
    : '';

  // Nav buttons (prev/next)
  const meta = metaJson.meta[flagId];
  let prevBtn = '', nextBtn = '';
  if (meta && meta.prev) {
    const prevName = getFullFlagData(meta.prev)._name;
    prevBtn = `<a href="/${meta.prev}/" class="nav-btn" title="${escHtml(prevName)}"><svg width="18" height="18" viewBox="0 0 16 16"><use href="#icon-prev"/></svg></a>`;
  }
  if (meta && meta.next) {
    const nextName = getFullFlagData(meta.next)._name;
    nextBtn = `<a href="/${meta.next}/" class="nav-btn" title="${escHtml(nextName)}"><svg width="18" height="18" viewBox="0 0 16 16"><use href="#icon-next"/></svg></a>`;
  }

  // Colors table
  const colorsSidebarHtml = fd.colors ? colorsCompactHtml(fd.colors) : '';
  const colorsFullHtml = fd.colors ? colorsTableHtml(fd.colors, fd.colorNote) : '';
  const colorsHtml = colorsSidebarHtml; // sidebar uses compact list

  // Check if deep-dive content exists
  const hasDeepDive = !!(fd.cs || fd.desc || fd.article || fd.trivia);

  // Construction sheet
  let csHtml = '';
  if (fd.cs) {
    csHtml = `<figure class="cs-block">
      <img src="${flagImgPath(fd.cs)}" alt="Construction sheet: ${escHtml(fd.title)}" loading="lazy">
      <figcaption>Construction sheet</figcaption>
    </figure>`;
  }

  // Description markdown
  let descHtml = '';
  if (fd.desc) {
    if (fd.colors) descHtml += '<h3>Description</h3>';
    descHtml += renderMarkdown(fd.desc);
  }

  // Trivia
  let triviaHtml = '';
  if (fd.trivia) {
    const triviaText = arrayText(fd.trivia);
    if (triviaText) {
      triviaHtml += '<h3>Trivia</h3>';
      triviaHtml += renderMarkdown(triviaText);
    }
  }

  // Article
  let articleHtml = '';
  if (fd.article) {
    if (Array.isArray(fd.article)) {
      articleHtml = renderMarkdown(arrayText(fd.article));
    } else {
      const mdPath = path.join(ASSETS_FLAGS, fd.article);
      if (fs.existsSync(mdPath)) {
        articleHtml = renderMarkdown(fs.readFileSync(mdPath, 'utf8'));
      }
    }
    // Deep-dive sits under an h2 header and sibling h3 sections (Description, Trivia).
    // Demote article headings by 2 so md h1 → h3, preserving page outline.
    articleHtml = articleHtml.replace(/<(\/?)h([1-4])>/g,
      (_, slash, n) => `<${slash}h${Math.min(parseInt(n) + 2, 6)}>`);
  }

  // JSON data
  const safeJson = escHtml(JSON.stringify(fd, null, 2));

  // Deep dive toggle button (only if there's content)
  const deepDiveBtn = hasDeepDive
    ? `<button class="deep-dive-btn" id="deepDiveToggle" title="Deep dive (d)">
        <svg width="18" height="18" viewBox="0 0 16 16"><use href="#icon-details"/></svg>
        <span>Details</span>
      </button>`
    : '';

  // Related flags (same namespace)
  const related = getRelatedFlags(flagId, fd);
  const relatedHtml = relatedFlagsHtml(related);

  // Categories for left rail
  const categories = getFlagCategories(fd);
  let categoryRailHtml = '';
  for (const cat of categories) {
    categoryRailHtml += `<a href="/flag-index/${cat.id}/" class="rail-btn" title="${escHtml(cat.title)}">${cat.icon}</a>\n`;
  }

  // Wikipedia links: flag article + entity article
  const wikiUrl = getWikiUrl(flagId, fd);
  const entityWikiUrl = getEntityWikiUrl(flagId, fd);
  const wikiRailBtn = `<a href="${escHtml(wikiUrl)}" class="rail-btn" title="Wikipedia: ${escHtml(fd.title || 'Flag')}" target="_blank" rel="noopener"><svg width="20" height="20" viewBox="0 0 128 128"><use href="#icon-wiki"/></svg></a>\n`;
  // Entity/flag summary: Wikipedia extract if cached, else first line of local desc.
  const summaryInfo = getSidebarSummary(flagId, fd);
  const entitySummaryHtml = summaryInfo
    ? (summaryInfo.source === 'wiki'
      ? `<div class="entity-summary"><p>${escHtml(summaryInfo.text)} <a href="${escHtml(entityWikiUrl)}" class="entity-wiki-link" target="_blank" rel="noopener">read more <span aria-hidden="true">\u2197</span></a></p></div>`
      : `<div class="entity-summary"><p>${escHtml(summaryInfo.text)}</p></div>`)
    : (entityWikiUrl && entityWikiUrl !== wikiUrl
      ? `<a href="${escHtml(entityWikiUrl)}" class="entity-wiki-link" target="_blank" rel="noopener">${escHtml(fd._name)} on Wikipedia <span aria-hidden="true">\u2197</span></a>`
      : '');
  const entityWikiLink = entitySummaryHtml;

  // Wikimedia Commons reference
  const commonsUrl = getCommonsUrl(flagId);
  // Provenance tiers:
  //   reconstructed  — modern re-creation, no contemporary source
  //   disputed       — attribution contested
  //   verified       — official: national flag of a sovereign state (has commonsUrl)
  //   wikimedia      — commonsUrl exists but not an official national flag
  //   unverified     — no Commons source
  const gTags = (fd.g || '').split(',').map(s => s.trim());
  const isOfficial = gTags.includes('nf') && !fd.now; // current national flag
  let commonsBtn;
  if (fd.reconstructed) {
    commonsBtn = commonsUrl
      ? `<a href="${escHtml(commonsUrl)}" class="ref-badge reconstructed" title="Modern reconstruction — no contemporary flag of this design is historically attested. Click to view the source image on Wikimedia Commons." target="_blank" rel="noopener">reconstruction</a>`
      : `<span class="ref-badge reconstructed" title="Modern reconstruction — no contemporary flag of this design is historically attested.">reconstruction</span>`;
  } else if (fd.disputed) {
    commonsBtn = commonsUrl
      ? `<a href="${escHtml(commonsUrl)}" class="ref-badge disputed" title="Attribution is historically disputed — limited primary-source evidence. Click to view the source image on Wikimedia Commons." target="_blank" rel="noopener">approximation</a>`
      : `<span class="ref-badge disputed" title="Attribution is historically disputed — limited primary-source evidence.">approximation</span>`;
  } else if (commonsUrl && isOfficial) {
    commonsBtn = `<a href="${escHtml(commonsUrl)}" class="ref-badge verified" title="Verified national flag — source on Wikimedia Commons" target="_blank" rel="noopener"><svg width="12" height="12" viewBox="0 0 16 16"><use href="#icon-verified"/></svg> verified</a>`;
  } else if (commonsUrl) {
    commonsBtn = `<a href="${escHtml(commonsUrl)}" class="ref-badge wikimedia" title="Source: Wikimedia Commons (not an authoritative/official flag)" target="_blank" rel="noopener">wikimedia</a>`;
  } else {
    // No Commons source — always cite Wikipedia as fallback attribution
    commonsBtn = `<a href="${escHtml(wikiUrl)}" class="ref-badge unverified" title="No verified Commons source. Linking to Wikipedia for reference." target="_blank" rel="noopener"><svg width="12" height="12" viewBox="0 0 16 16"><use href="#icon-unverified"/></svg> wikipedia</a>`;
  }
  const provenanceBadge = '';

  // Year ribbon — for historical flags: "former" style; for current flags: "since YYYY" style
  let yearRibbonHtml = '';
  if (fd.now && fd.years) {
    // Historical flag — purple ribbon
    yearRibbonHtml = `<span class="year-ribbon former">${escHtml(fd.years)}</span>`;
  } else if (fd.adopted || fd.use) {
    // Current flag — compute "since" year
    const adopted = fd.adopted || (typeof fd.use === 'object' && fd.use.since ? fd.use.since : '');
    if (adopted) yearRibbonHtml = `<span class="year-ribbon current"><span class="yr-label">since</span> ${escHtml(String(adopted))}</span>`;
  }

  // Successor ("now" field) — for historical flags that map to current ones
  let successorHtml = '';
  if (fd.now) {
    const nowIds = Array.isArray(fd.now) ? fd.now : [fd.now];
    const nowItems = nowIds.map(nid => {
      const nfd = getFullFlagData(nid);
      const nflagSrc = (nfd.flag && nfd.flag !== 'none') ? flagImgPath(nfd.flag) : '';
      return `<a href="/${nid}/" class="successor-flag" title="${escHtml(nfd._name)}">${nflagSrc ? `<img src="${nflagSrc}" alt="${escHtml(nfd._name)}" loading="lazy">` : ''}</a>`;
    }).join('');
    successorHtml = `<div class="successor-row">${yearRibbonHtml}<span class="successor-arrow">→</span>${nowItems}</div>`;
  } else if (yearRibbonHtml) {
    successorHtml = `<div class="successor-row">${yearRibbonHtml}</div>`;
  }

  // Category tags strip
  let categoryTagsHtml = '';
  if (categories.length) {
    const tags = categories.map(cat =>
      `<a href="/flag-index/${cat.id}/" class="cat-tag">#${cat.id}</a>`
    ).join('');
    categoryTagsHtml = `<div class="category-tags">${tags}</div>`;
  }

  const flagMetaDesc = metaDescription(fd, flagId);
  const flagOgImage = flagSrc || '/logo.svg';
  const flagExtra = `<meta name="description" content="${escHtml(flagMetaDesc)}">
  ${ogTags(fd.title, flagMetaDesc, flagOgImage, '/' + flagId + '/')}
  ${canonicalTag('/' + flagId + '/')}
  ${jsonLdScript(fd, flagId)}`;
  const html = `${htmlHead(fd.title, flagExtra)}
<body class="flag-page">
  ${svgSprite()}
  <!-- Top navbar with centered title -->
  <nav class="site-nav">
    <ul><li><a href="/" class="site-logo" aria-label="Flags.fyi home"><img src="/logo.svg" alt="">Flags.fyi</a></li></ul>
    <div class="nav-title">${escHtml(fd.title)}</div>
    <ul><li><button class="burger-btn" id="burgerBtn" aria-label="Menu" aria-expanded="false"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button></li></ul>
  </nav>
  <div class="mobile-drawer-overlay" id="mobileDrawerOverlay"></div>
  <div class="mobile-drawer" id="mobileDrawer" role="dialog" aria-label="Navigation menu">
    <div class="mobile-drawer-header">
      <span class="mobile-drawer-title">Navigation</span>
      <button class="mobile-drawer-close" id="mobileDrawerClose" aria-label="Close menu"><svg width="20" height="20" viewBox="0 0 16 16"><use href="#icon-close"/></svg></button>
    </div>
    <nav class="mobile-drawer-nav" aria-label="Mobile navigation">
      <a href="/flag-index/" class="mobile-drawer-link"><svg width="20" height="20" viewBox="0 0 16 16"><use href="#icon-index"/></svg>Index of Flags</a>
      ${categories.map(cat => '<a href="/flag-index/' + cat.id + '/" class="mobile-drawer-link">' + cat.icon + ' ' + escHtml(cat.title) + '</a>').join('\n      ')}
      <a href="${escHtml(wikiUrl)}" class="mobile-drawer-link" target="_blank" rel="noopener"><svg width="20" height="20" viewBox="0 0 128 128"><use href="#icon-wiki"/></svg>Wikipedia</a>
    </nav>
  </div>

  <!-- Thin left sidebar -->
  <div class="left-rail">
    <a href="/flag-index/" class="rail-btn" title="Index of Flags (i)">
      <svg width="20" height="20" viewBox="0 0 16 16"><use href="#icon-index"/></svg>
    </a>
    ${categoryRailHtml}
    ${wikiRailBtn}
  </div>

  <!-- Main area: flag column + sidebar + deep dive -->
  <div class="flag-layout">
    <!-- Left column: flag + (sidebar content moves here when dive open) -->
    <div class="flag-column" id="flagColumn">
      <div class="flag-viewport" id="flagViewport">
        ${flagSrc ? `<img src="${flagSrc}" alt="${escHtml(fd.title)}" class="flag-img" id="flagImg" fetchpriority="high">` : '<div class="flag-img-placeholder"></div>'}
      </div>
    </div>

    <!-- Right sidebar -->
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-nav">
        ${prevBtn ? prevBtn.replace('class="nav-btn"', 'class="nav-btn sidebar-nav-btn"') : ''}
        ${deepDiveBtn}
        ${nextBtn ? nextBtn.replace('class="nav-btn"', 'class="nav-btn sidebar-nav-btn"') : ''}
      </div>
      <div class="sidebar-info" id="sidebarInfo">
        ${subtitleHtml}
        ${entityWikiLink}
        ${colorsHtml}
        <a href="${escHtml(wikiUrl)}" class="wiki-link" target="_blank" rel="noopener" aria-label="View on Wikipedia"><svg width="20" height="20" viewBox="0 0 128 128" aria-hidden="true"><use href="#icon-wiki"/></svg></a>
        ${commonsBtn}
      </div>
      <div class="sidebar-bottom">
        ${relatedHtml}
        ${categoryTagsHtml}
        ${successorHtml}
      </div>
    </aside>

    <!-- Deep dive panel (inside flex layout so flag adjusts) -->
    <div class="deep-dive" id="deepDive">
      <div class="deep-dive-header">
        <h2>${escHtml(fd.title)}</h2>
        <button class="deep-dive-close" id="deepDiveClose" title="Close (Esc)">
          <svg width="20" height="20" viewBox="0 0 16 16"><use href="#icon-close"/></svg>
        </button>
      </div>
      <div class="deep-dive-body">
        ${csHtml}
        ${descHtml}
        ${colorsFullHtml ? '<h3>Colors in detail</h3>' + colorsFullHtml : ''}
        ${triviaHtml}
        ${articleHtml}
        <details class="json-data">
          <summary>json:data</summary>
          <pre><code>${safeJson}</code></pre>
        </details>
      </div>
    </div>
  </div>

  <div class="mobile-bottom-nav" id="mobileBottomNav">
    ${meta && meta.prev ? '<a href="/' + meta.prev + '/" class="mobile-bottom-btn" aria-label="Previous flag: ' + escHtml(getFullFlagData(meta.prev)._name) + '"><svg width="20" height="20" viewBox="0 0 16 16"><use href="#icon-prev"/></svg><span>Prev</span></a>' : '<span class="mobile-bottom-btn disabled" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 16 16"><use href="#icon-prev"/></svg><span>Prev</span></span>'}
    <a href="/flag-index/" class="mobile-bottom-btn" aria-label="Index of Flags"><svg width="20" height="20" viewBox="0 0 16 16"><use href="#icon-index"/></svg><span>Index</span></a>
    ${meta && meta.next ? '<a href="/' + meta.next + '/" class="mobile-bottom-btn" aria-label="Next flag: ' + escHtml(getFullFlagData(meta.next)._name) + '"><svg width="20" height="20" viewBox="0 0 16 16"><use href="#icon-next"/></svg><span>Next</span></a>' : '<span class="mobile-bottom-btn disabled" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 16 16"><use href="#icon-next"/></svg><span>Next</span></span>'}
  </div>
  <script src="/app.js"><\/script>
  ${analyticsSnippet()}
</body>
</html>`;

  fs.writeFileSync(path.join(dir, 'index.html'), html);
}

// ─── 200.html / 404.html ────────────────────────────────────────────────────
function generate404() {
  const notFoundExtra = `<meta name="description" content="Page not found on Flags.fyi.">
  ${canonicalTag('/404.html')}`;
  const html = `${htmlHead('Page Not Found', notFoundExtra)}
<body>
  ${navbar()}
  <main class="container" style="text-align:center;padding-top:4rem">
    <h1>Page Not Found</h1>
    <p>The flag you're looking for doesn't exist yet.</p>
    <a href="/flag-index/" class="btn">Browse All Flags</a>
  </main>
  <script src="/app.js"><\/script>
  ${analyticsSnippet()}
</body>
</html>`;
  fs.writeFileSync(path.join(ROOT, '200.html'), html);
  fs.writeFileSync(path.join(ROOT, '404.html'), html);
  console.log('  200.html, 404.html');
}


// ─── sitemap.xml ────────────────────────────────────────────────────────────
function generateSitemap() {
  const today = new Date().toISOString().split('T')[0];
  let urls = '';

  function addUrl(loc, priority, changefreq) {
    urls += `  <url>\n    <loc>${SITE_URL}${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${changefreq || 'monthly'}</changefreq>\n    <priority>${priority}</priority>\n  </url>\n`;
  }

  // Landing page
  addUrl('/', '1.0', 'monthly');

  // Flag-index hub
  addUrl('/flag-index/', '0.9', 'monthly');

  // All flags page
  addUrl('/flag-index/all/', '0.7', 'monthly');

  // Ordered page
  addUrl('/flag-index/ordered/', '0.7', 'monthly');

  // Category pages
  const allIds = getAllFlagIds();
  const catFlagsSet = new Set();
  for (const flagId of allIds) {
    const fd = getFullFlagData(flagId);
    const cats = getFlagCategories(fd);
    for (const cat of cats) catFlagsSet.add(cat.id);
  }
  for (const catId of catFlagsSet) {
    addUrl('/flag-index/' + catId + '/', '0.7', 'monthly');
  }

  // Flag pages
  for (const flagId of allIds) {
    const fd = getFullFlagData(flagId);
    const gs = (fd.g || '').split(',').map(s => s.trim()).filter(Boolean);
    const isHistorical = !!(fd.now || gs.includes('h'));
    const priority = isHistorical ? '0.5' : '0.8';
    addUrl('/' + flagId + '/', priority, 'monthly');
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}</urlset>\n`;
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap);
  console.log('  sitemap.xml');
}

// ─── robots.txt ─────────────────────────────────────────────────────────────
function generateRobotsTxt() {
  const txt = `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
  fs.writeFileSync(path.join(ROOT, 'robots.txt'), txt);
  console.log('  robots.txt');
}

// ─── main ────────────────────────────────────────────────────────────────────
function main() {
  console.log('Building flags.fyi static site...\n');

  console.log('Generating pages:');
  generateLanding();
  generateFlagIndex();
  generate404();

  const flagIds = getAllFlagIds();
  for (const flagId of flagIds) {
    generateFlagPage(flagId);
    console.log(`  ${flagId}/index.html`);
  }

  // ─── Redirects (aliases for merged/renamed flags) ───
  const redirects = {
    'dannebrog': '/denmark/',
  };
  for (const [from, to] of Object.entries(redirects)) {
    const dir = path.join(ROOT, from);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'),
      `<!DOCTYPE html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${to}"><link rel="canonical" href="${to}"><title>Redirecting…</title></head><body><a href="${to}">Redirecting to ${to}</a></body></html>`);
    console.log(`  ${from}/ → ${to} (redirect)`);
  }

  // ─── Generate FLAGS.md ───
  generateFlagsMd(flagIds);

  // ─── SEO: sitemap + robots.txt ───
  generateSitemap();
  generateRobotsTxt();

  // ─── Search index ───
  generateSearchIndex();

  console.log(`\nDone! Generated ${flagIds.length} flag pages + index + landing + 404 + FLAGS.md + sitemap.xml + robots.txt`);
}

// ─── search-index.json — client-side search data ────────────────────────────
function generateSearchIndex() {
  const allIds = getAllFlagIds();
  const index = [];

  // Build a map from group codes to expanded display names
  // For aliases (string values like "nf" -> "national-flag"), use the value
  // For objects with a "title" field, use the key itself
  function expandGroupCode(code) {
    const info = groupInfoJson[code];
    if (typeof info === 'string') return info;       // alias → resolved name
    if (info && info.title) return code;             // already a full name
    return code;                                     // fallback: use as-is
  }

  for (const flagId of allIds) {
    const fd = getFullFlagData(flagId);
    const name = fd._name || titleCase(flagId);
    const title = fd.title || '';

    // Expand group codes to display names
    const rawGroups = (fd.g || '').split(',').map(s => s.trim()).filter(Boolean);
    const groups = rawGroups.map(expandGroupCode);

    // Collect color names
    const colors = (fd.colors || []).map(c => c.color).filter(Boolean);

    // Resolve flag path
    const flag = fd.flag && fd.flag !== 'none' ? '/' + fd.flag : '';

    // Build keywords: lowercase concatenation of name, title, groups, colors
    const keywordParts = [name, title, ...groups, ...colors];
    const keywords = keywordParts.join(' ').toLowerCase();

    index.push({
      id: flagId,
      name: name,
      title: title,
      groups: groups,
      colors: colors,
      flag: flag,
      keywords: keywords
    });
  }

  // Sort alphabetically by name for consistency
  index.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

  fs.writeFileSync(path.join(ROOT, 'search-index.json'), JSON.stringify(index, null, 2) + '\n');
  console.log('  search-index.json');
}

// ─── FLAGS.md — master list of all flags ──────────────────────────────────────
function generateFlagsMd(flagIds) {
  const allFlags = flagIds.map(id => {
    const fd = getFullFlagData(id);
    return { id, name: fd._name || id, title: fd.title || '', index: fd.index || '', now: fd.now, years: fd.years };
  }).sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

  // Group by index prefix
  const groups = { c: [], s: [], i: [], e: [], p: [], r: [], m: [], o: [] };
  for (const f of allFlags) {
    const prefix = f.index ? f.index[0] : 'o';
    if (groups[prefix]) groups[prefix].push(f);
    else groups[prefix].push(f);
  }

  const lines = [];
  lines.push('# flags.fyi — All Flags');
  lines.push('');
  lines.push(`${allFlags.length} flags total.`);
  lines.push('');

  function section(title, flags) {
    if (!flags.length) return;
    lines.push(`## ${title} (${flags.length})`);
    lines.push('');
    lines.push('| # | Flag | ID | Index |');
    lines.push('|---|------|----|-------|');
    flags.forEach((f, i) => {
      const suffix = f.now ? ` → ${Array.isArray(f.now) ? f.now.join(', ') : f.now}` : '';
      const yr = f.years ? ` (${f.years})` : '';
      lines.push(`| ${i + 1} | ${f.name}${yr}${suffix} | \`${f.id}\` | \`${f.index}\` |`);
    });
    lines.push('');
  }

  section('Countries', groups.c);
  section('Subdivisions', groups.s);
  section('International Organizations', groups.i);
  section('Empires & Caliphates', groups.e);
  section('Pan-Movements', groups.p);
  section('Pride', groups.r);
  section('Maritime', groups.m);
  section('Other', groups.o);

  const md = lines.join('\n') + '\n';
  fs.writeFileSync(path.join(ROOT, 'FLAGS.md'), md);
  console.log('  FLAGS.md');
}

main();
