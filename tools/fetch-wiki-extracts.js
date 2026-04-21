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
  let fetched = 0, cached = 0, failed = 0;
  for (let i = 0; i < entries.length; i++) {
    const [id, fd] = entries[i];
    if (cache[id] && !FORCE) { cached++; continue; }
    const title = entityTitle(id, fd);
    const summary = await fetchSummary(title);
    if (summary) {
      cache[id] = summary;
      fetched++;
    } else {
      cache[id] = null;
      failed++;
    }
    if (i % 20 === 0) {
      fs.writeFileSync(cachePath, JSON.stringify(cache, null, 0) + '\n');
      process.stderr.write(`\r  ${i + 1}/${entries.length}  fetched=${fetched}  cached=${cached}  failed=${failed}`);
    }
    // Rate-limit: 30ms between requests
    await new Promise(r => setTimeout(r, 30));
  }
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 0) + '\n');
  process.stderr.write('\n');
  console.log(`Done. fetched=${fetched} cached=${cached} failed=${failed}`);
}

main();
