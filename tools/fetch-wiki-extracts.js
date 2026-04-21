#!/usr/bin/env node
// Fetches Wikipedia short summaries for each flag's entity (not the flag article).
// Caches to data/wiki-extracts.json so builds are offline.
//
// Usage: node tools/fetch-wiki-extracts.js [--force]
// Re-run to pick up new entries. Existing entries aren't re-fetched unless
// --force is passed.

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.resolve(__dirname, '..');
const FORCE = process.argv.includes('--force');
const flagsJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/flags.json'), 'utf8'));

const cachePath = path.join(ROOT, 'data/wiki-extracts.json');
const cache = fs.existsSync(cachePath)
  ? JSON.parse(fs.readFileSync(cachePath, 'utf8'))
  : {};

function entityTitle(id, fd) {
  if (fd.wikiEntity) return fd.wikiEntity;
  return (fd.name || id).replace(/ /g, '_');
}

// Wikipedia article about the flag itself (fallback when the entity has no article
// or when the flag IS the subject, e.g., pride flags, ICS signal flags).
function flagArticleTitle(id, fd) {
  if (fd.wiki) return fd.wiki;
  const name = (fd.name || id).replace(/ /g, '_');
  return `Flag_of_${name}`;
}


function fetchSummary(title) {
  return new Promise((resolve) => {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    https.get(url, { headers: { 'User-Agent': 'flags.fyi content pipeline (https://flags.fyi)' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        // Follow redirect
        const loc = res.headers.location;
        if (loc) return fetchSummary(loc.replace('https://en.wikipedia.org/api/rest_v1/page/summary/', '')).then(resolve);
      }
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try {
          const d = JSON.parse(body);
          if (d.extract) {
            resolve({
              extract: d.extract,
              title: d.titles && d.titles.normalized || d.title || title,
              thumbnail: d.thumbnail && d.thumbnail.source
            });
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function main() {
  const entries = Object.entries(flagsJson);
  let fetched = 0, cached = 0, failed = 0, flagFallback = 0;
  for (let i = 0; i < entries.length; i++) {
    const [id, fd] = entries[i];
    const existing = cache[id];
    const hasExtract = existing && existing.extract;
    if (hasExtract && !FORCE) { cached++; continue; }

    const g = (fd.g || '').split(',').map(s => s.trim());
    const subjectIsFlag = g.includes('pride') || id.startsWith('ics-') || (g.includes('maritime') && !fd.now);

    // Build a candidate list of Wikipedia titles to try in order.
    const candidates = [];
    if (!subjectIsFlag) candidates.push(entityTitle(id, fd));
    candidates.push(flagArticleTitle(id, fd));
    // For pride/maritime flags the article often has a custom name; try _name + "_flag" variations
    if (subjectIsFlag && fd.name) {
      const base = fd.name.replace(/ /g, '_');
      candidates.push(base);
      candidates.push(base + '_flag');
      candidates.push(base + '_Flag');
      candidates.push(base.replace('Pride', 'pride_flag'));
    }
    // ICS alphabet: NATO name
    if (id.startsWith('ics-') && fd.name && fd.name.startsWith('ICS ')) {
      const nato = fd.name.slice(4);
      candidates.push('ICS_' + nato);
      candidates.push(nato + '_(NATO_phonetic_alphabet)');
    }

    let summary = null;
    let attempted = 0;
    for (const title of candidates) {
      if (summary) break;
      attempted++;
      summary = await fetchSummary(title);
      await new Promise(r => setTimeout(r, 30));
    }
    if (summary && attempted > 1) flagFallback++;
    if (summary) {
      cache[id] = summary;
      fetched++;
    } else {
      cache[id] = null;
      failed++;
    }
    if (i % 20 === 0) {
      fs.writeFileSync(cachePath, JSON.stringify(cache, null, 0) + '\n');
      process.stderr.write(`\r  ${i + 1}/${entries.length}  fetched=${fetched}  cached=${cached}  flagFallback=${flagFallback}  failed=${failed}`);
    }
  }
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 0) + '\n');
  process.stderr.write('\n');
  console.log(`Done. fetched=${fetched} cached=${cached} flagFallback=${flagFallback} failed=${failed}`);
}

main();
