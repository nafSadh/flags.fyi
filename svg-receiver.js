const http = require('http');
const fs = require('fs');
const path = require('path');

// Map of flag_id -> { wiki, local_path }
const WIKI_MAP = {
  'rashidun': { wiki: 'Flag_of_the_Rashidun_Caliphate.svg', local: 'caliphates/rashidun.svg' },
  'umayyad': { wiki: 'Flag_of_the_Umayyad_Caliphate.svg', local: 'caliphates/umayyad.svg' },
  'abbasid': { wiki: 'Flag_of_the_Abbasid_Caliphate.svg', local: 'caliphates/abbasid.svg' },
  'fatimid': { wiki: 'Flag_of_the_Fatimid_Caliphate.svg', local: 'caliphates/fatimid.svg' },
  'ayyubid': { wiki: 'Flag_of_the_Ayyubid_Dynasty.svg', local: 'caliphates/ayyubid.svg' },
  'ottoman': { wiki: 'Flag_of_the_Ottoman_Empire.svg', local: 'caliphates/ottoman.svg' },
  'ottoman-early': { wiki: 'Flag_of_the_Ottoman_Empire_(1844%E2%80%931922).svg', local: 'caliphates/ottoman-early.svg' },
  'mughal': { wiki: 'Flag_of_the_Mughal_Empire.svg', local: 'caliphates/mughal.svg' },
  'almohad': { wiki: 'Flag_of_the_Almohad_Caliphate.svg', local: 'caliphates/almohad.svg' },
  'almoravid': { wiki: 'Flag_of_the_Almoravid_dynasty.svg', local: 'caliphates/almoravid.svg' },
  'idrisid': { wiki: 'Flag_of_the_Idrisid_dynasty.svg', local: 'caliphates/idrisid.svg' },
  'samanid': { wiki: 'Flag_of_the_Samanid_dynasty.svg', local: 'caliphates/samanid.svg' },
  'roman-empire': { wiki: 'Vexilloid_of_the_Roman_Empire.svg', local: 'empires/roman-empire.svg' },
  'byzantine': { wiki: 'Flag_of_Palaeologus_Emperor.svg', local: 'empires/byzantine.svg' },
  'holy-roman-empire': { wiki: 'Banner_of_the_Holy_Roman_Emperor_with_haloes_(1400-1806).svg', local: 'empires/holy-roman-empire.svg' },
  'mongol': { wiki: 'Flag_of_the_Mongol_Empire.svg', local: 'empires/mongol.svg' },
  'achaemenid': { wiki: 'Standard_of_Cyrus_the_Great_(Achaemenid_Empire).svg', local: 'empires/achaemenid.svg' },
  'kingdom-of-jerusalem': { wiki: 'Flag_of_the_Kingdom_of_Jerusalem.svg', local: 'empires/kingdom-of-jerusalem.svg' },
  'venice': { wiki: 'Flag_of_Republic_of_Venice.svg', local: 'empires/venice.svg' },
  'qajar': { wiki: 'State_Flag_of_Iran_(1907).svg', local: 'iran-hist/qajar.svg' },
  'pahlavi': { wiki: 'State_flag_of_Iran_(1933%E2%80%931964).svg', local: 'iran-hist/pahlavi.svg' },
  'north-yemen': { wiki: 'Flag_of_North_Yemen.svg', local: 'yemen-hist/north-yemen.svg' },
  'south-yemen': { wiki: 'Flag_of_South_Yemen.svg', local: 'yemen-hist/south-yemen.svg' },
  'hejaz': { wiki: 'Flag_of_Hejaz_1917.svg', local: 'arab-hist/hejaz.svg' },
  'hatay': { wiki: 'Flag_of_Hatay.svg', local: 'arab-hist/hatay.svg' },
  'in-calcutta-flag': { wiki: 'Calcutta_Flag_(7_August_1906).svg', local: 'india-hist/in-calcutta-flag.svg' },
  'in-independence': { wiki: 'Flag_of_India_in_1931.svg', local: 'india-hist/in-independence.svg' },
  'sikh-empire': { wiki: 'Flag_of_the_Sikh_Empire.svg', local: 'india-hist/sikh-empire.svg' },
  'british-raj': { wiki: 'British_Raj_Red_Ensign.svg', local: 'india-hist/british-raj.svg' },
  'pk-muslim-league': { wiki: 'Muslim_League_flag.svg', local: 'pakistan-hist/pk-muslim-league.svg' },
  'east-pakistan': { wiki: 'Flag_of_Pakistan.svg', local: 'pakistan-hist/east-pakistan.svg' },
  'bd-1971-map': { wiki: 'Flag_of_Bangladesh_(1971).svg', local: 'bangladesh-hist/bd-1971-map.svg' },
  'af-kingdom': { wiki: 'Flag_of_Afghanistan_(1930%E2%80%931973).svg', local: 'afghanistan/af-kingdom.svg' },
  'af-republic': { wiki: 'Flag_of_Afghanistan_(1973%E2%80%931978).svg', local: 'afghanistan/af-republic.svg' },
  'af-soviet': { wiki: 'Flag_of_Afghanistan_(1980%E2%80%931987).svg', local: 'afghanistan/af-soviet.svg' },
  'af-taliban-1996': { wiki: 'Flag_of_the_Taliban.svg', local: 'afghanistan/af-taliban-1996.svg' },
  'af-islamic-republic': { wiki: 'Flag_of_Afghanistan_(2013%E2%80%932021).svg', local: 'afghanistan/af-islamic-republic.svg' },
  'cn-qing-dragon': { wiki: 'Flag_of_the_Qing_Dynasty_(1889-1912).svg', local: 'china-hist/cn-qing-dragon.svg' },
  'cn-five-coloured': { wiki: 'Flag_of_China_(1912%E2%80%931928).svg', local: 'china-hist/cn-five-coloured.svg' },
  'cn-blue-sky-white-sun': { wiki: 'Flag_of_the_Republic_of_China.svg', local: 'china-hist/cn-blue-sky-white-sun.svg' },
  'jp-tokugawa': { wiki: 'Flag_of_the_Tokugawa_Shogunate.svg', local: 'japan-hist/jp-tokugawa.svg' },
  'jp-rising-sun-army': { wiki: 'War_flag_of_the_Imperial_Japanese_Army_(1868%E2%80%931945).svg', local: 'japan-hist/jp-rising-sun-army.svg' },
  'jp-rising-sun-navy': { wiki: 'Naval_ensign_of_the_Empire_of_Japan.svg', local: 'japan-hist/jp-rising-sun-navy.svg' },
  'kr-joseon': { wiki: 'Flag_of_the_King_of_Joseon.svg', local: 'korea-hist/kr-joseon.svg' },
  'kr-taegeukgi-1883': { wiki: 'Flag_of_Korea_(1882%E2%80%931910).svg', local: 'korea-hist/kr-taegeukgi-1883.svg' },
  'vn-south': { wiki: 'Flag_of_South_Vietnam.svg', local: 'vietnam-hist/vn-south.svg' },
  'vn-empire': { wiki: 'Flag_of_the_Empire_of_Vietnam_(1945).svg', local: 'vietnam-hist/vn-empire.svg' },
  'id-dutch-east-indies': { wiki: 'Flag_of_the_Netherlands.svg', local: 'indonesia-hist/id-dutch-east-indies.svg' },
  'ph-katipunan': { wiki: 'Flag_of_the_Katipunan.svg', local: 'philippines-hist/ph-katipunan.svg' },
  'ph-revolutionary': { wiki: 'Flag_of_the_Philippines.svg', local: 'philippines-hist/ph-revolutionary.svg' },
  'th-siam-elephant': { wiki: 'Flag_of_Siam_(1855).svg', local: 'thailand-hist/th-siam-elephant.svg' },
  'fr-bourbon': { wiki: 'Royal_Standard_of_the_King_of_France.svg', local: 'france-hist/fr-bourbon.svg' },
  'fr-free-france': { wiki: 'Flag_of_Free_France_(1940-1944).svg', local: 'france-hist/fr-free-france.svg' },
  'de-imperial': { wiki: 'Flag_of_the_German_Empire.svg', local: 'germany-hist/de-imperial.svg' },
  'de-weimar': { wiki: 'Flag_of_Germany_(3-2_aspect_ratio).svg', local: 'germany-hist/de-weimar.svg' },
  'de-nazi': { wiki: 'Flag_of_Germany_(1935%E2%80%931945).svg', local: 'germany-hist/de-nazi.svg' },
  'de-east-germany': { wiki: 'Flag_of_East_Germany.svg', local: 'germany-hist/de-east-germany.svg' },
  'de-west-germany': { wiki: 'Flag_of_Germany.svg', local: 'germany-hist/de-west-germany.svg' },
  'ru-imperial': { wiki: 'Flag_of_Russia.svg', local: 'russia-hist/ru-imperial.svg' },
  'ru-sfsr': { wiki: 'Flag_of_Russian_Soviet_Federative_Socialist_Republic_(1918%E2%80%931937).svg', local: 'russia-hist/ru-sfsr.svg' },
  'soviet-union': { wiki: 'Flag_of_the_Soviet_Union.svg', local: 'russia-hist/soviet-union.svg' },
  'es-republic': { wiki: 'Flag_of_Spain_(1931%E2%80%931939).svg', local: 'spain-hist/es-republic.svg' },
  'es-francoist': { wiki: 'Flag_of_Spain_(1945%E2%80%931977).svg', local: 'spain-hist/es-francoist.svg' },
  'es-empire': { wiki: 'Flag_of_Cross_of_Burgundy.svg', local: 'spain-hist/es-empire.svg' },
  'it-kingdom': { wiki: 'Flag_of_Italy_(1861%E2%80%931946).svg', local: 'italy-hist/it-kingdom.svg' },
  'it-social-republic': { wiki: 'War_flag_of_the_Italian_Social_Republic.svg', local: 'italy-hist/it-social-republic.svg' },
  'pl-duchy-warsaw': { wiki: 'Flag_of_the_Duchy_of_Warsaw.svg', local: 'poland-hist/pl-duchy-warsaw.svg' },
  'pl-november-uprising': { wiki: 'Flag_of_Poland.svg', local: 'poland-hist/pl-november-uprising.svg' },
  'gr-independence': { wiki: 'Flag_of_Greece_(1822-1978).svg', local: 'greece-hist/gr-independence.svg' },
  'gr-kingdom': { wiki: 'State_Flag_of_Greece_(1863-1924_and_1935-1973).svg', local: 'greece-hist/gr-kingdom.svg' },
  'gr-junta': { wiki: 'Flag_of_Greece_(1970-1975).svg', local: 'greece-hist/gr-junta.svg' },
  'dannebrog': { wiki: 'Flag_of_Denmark.svg', local: 'denmark-hist/dannebrog.svg' },
  'scotland-kingdom': { wiki: 'Flag_of_Scotland.svg', local: 'uk-hist/scotland-kingdom.svg' },
  'us-betsy-ross': { wiki: 'Betsy_Ross_flag.svg', local: 'us-hist/us-betsy-ross.svg' },
  'us-confederate-stars-bars': { wiki: 'Flag_of_the_Confederate_States_of_America_(1861%E2%80%931863).svg', local: 'us-hist/us-confederate-stars-bars.svg' },
  'us-confederate-stainless': { wiki: 'Flag_of_the_Confederate_States_of_America_(1863%E2%80%931865).svg', local: 'us-hist/us-confederate-stainless.svg' },
  'mx-three-guarantees': { wiki: 'Flag_of_the_Three_Guarantees.svg', local: 'mexico-hist/mx-three-guarantees.svg' },
  'mx-empire': { wiki: 'Flag_of_Mexico_(1821%E2%80%931823).svg', local: 'mexico-hist/mx-empire.svg' },
  'mx-federal-republic': { wiki: 'Flag_of_Mexico_(1823-1864).svg', local: 'mexico-hist/mx-federal-republic.svg' },
  'br-empire': { wiki: 'Flag_of_Empire_of_Brazil_(1870-1889).svg', local: 'brazil-hist/br-empire.svg' },
  'br-provisional': { wiki: 'Flag_of_Brazil_(November_1889).svg', local: 'brazil-hist/br-provisional.svg' },
  'ar-celeste-blanca': { wiki: 'Flag_of_Argentina_(alternative).svg', local: 'argentina-hist/ar-celeste-blanca.svg' },
  'ar-sun-of-may': { wiki: 'Flag_of_Argentina.svg', local: 'argentina-hist/ar-sun-of-may.svg' },
  'cu-lone-star': { wiki: 'Flag_of_Cuba.svg', local: 'cuba-hist/cu-lone-star.svg' },
  'et-imperial-lion': { wiki: 'Flag_of_Ethiopia_(1897-1936;_1941-1974).svg', local: 'ethiopia-hist/et-imperial-lion.svg' },
  'et-derg': { wiki: 'Flag_of_Ethiopia_(1975%E2%80%931987).svg', local: 'ethiopia-hist/et-derg.svg' },
  'za-prinsevlag': { wiki: 'Flag_of_South_Africa_(1928%E2%80%931994).svg', local: 'south-africa-hist/za-prinsevlag.svg' },
  'gh-gold-coast': { wiki: 'Flag_of_the_Gold_Coast.svg', local: 'ghana-hist/gh-gold-coast.svg' },
  'ke-colonial': { wiki: 'Flag_of_Kenya_(1921%E2%80%931963).svg', local: 'kenya-hist/ke-colonial.svg' },
  'french-algeria': { wiki: 'Flag_of_France.svg', local: 'colonial/french-algeria.svg' },
  'british-palestine': { wiki: 'Flag_of_Mandatory_Palestine.svg', local: 'colonial/british-palestine.svg' },
  'french-syria': { wiki: 'Flag_of_the_French_Mandate_of_Syria_(1920%E2%80%931922).svg', local: 'colonial/french-syria.svg' },
  'french-lebanon': { wiki: 'Flag_of_Lebanon_during_French_Mandate_(1920%E2%80%931943).svg', local: 'colonial/french-lebanon.svg' },
  'anglo-egyptian-sudan': { wiki: 'Flag_of_Anglo-Egyptian_Sudan.svg', local: 'colonial/anglo-egyptian-sudan.svg' },
  'italian-somaliland': { wiki: 'Flag_of_Italy.svg', local: 'colonial/italian-somaliland.svg' },
  'british-somaliland': { wiki: 'Flag_of_British_Somaliland.svg', local: 'colonial/british-somaliland.svg' },
  'united-nations': { wiki: 'Flag_of_the_United_Nations.svg', local: 'intl/united-nations.svg' },
  'european-union': { wiki: 'Flag_of_Europe.svg', local: 'intl/european-union.svg' },
  'african-union': { wiki: 'Flag_of_the_African_Union.svg', local: 'intl/african-union.svg' },
  'arab-league': { wiki: 'Flag_of_the_Arab_League.svg', local: 'intl/arab-league.svg' },
  'nato': { wiki: 'Flag_of_NATO.svg', local: 'intl/nato.svg' },
  'olympic': { wiki: 'Olympic_flag.svg', local: 'intl/olympic.svg' },
  'red-cross': { wiki: 'Flag_of_the_Red_Cross.svg', local: 'intl/red-cross.svg' },
  'asean': { wiki: 'Flag_of_ASEAN.svg', local: 'intl/asean.svg' },
  'commonwealth': { wiki: 'Flag_of_the_Commonwealth_of_Nations.svg', local: 'intl/commonwealth.svg' },
  'oic': { wiki: 'OIC_Flag.svg', local: 'intl/oic.svg' },
  'gcc': { wiki: 'Flag_of_the_Cooperation_Council_for_the_Arab_States_of_the_Gulf.svg', local: 'intl/gcc.svg' },
  'pan-african': { wiki: 'Flag_of_the_UNIA.svg', local: 'movements/pan-african.svg' },
  'pan-slavic': { wiki: 'Pan-Slavic_flag.svg', local: 'movements/pan-slavic.svg' },
  'amazigh': { wiki: 'Flag_of_the_Berber_people.svg', local: 'movements/amazigh.svg' },
  'kurdish': { wiki: 'Flag_of_Kurdistan.svg', local: 'movements/kurdish.svg' },
  'romani': { wiki: 'Flag_of_the_Romani_people.svg', local: 'movements/romani.svg' },
  'tibetan': { wiki: 'Flag_of_Tibet.svg', local: 'movements/tibetan.svg' },
  'catalan': { wiki: 'Flag_of_Catalonia.svg', local: 'movements/catalan.svg' },
  'pride-rainbow': { wiki: 'Gay_Pride_Flag.svg', local: 'pride/pride-rainbow.svg' },
  'pride-progress': { wiki: 'Intersex-inclusive_pride_flag.svg', local: 'pride/pride-progress.svg' },
  'pride-trans': { wiki: 'Transgender_Pride_flag.svg', local: 'pride/pride-trans.svg' },
  'jolly-roger': { wiki: 'Pirate_Flag_of_Rack_Rackham.svg', local: 'maritime/jolly-roger.svg' },
  'white-ensign': { wiki: 'Naval_Ensign_of_the_United_Kingdom.svg', local: 'maritime/white-ensign.svg' },
  'red-ensign': { wiki: 'Civil_Ensign_of_the_United_Kingdom.svg', local: 'maritime/red-ensign.svg' },
  'texas': { wiki: 'Flag_of_Texas.svg', local: 'us/texas.svg' },
  'hawaii': { wiki: 'Flag_of_Hawaii.svg', local: 'us/hawaii.svg' },
  'puerto-rico': { wiki: 'Flag_of_Puerto_Rico.svg', local: 'us/puerto-rico.svg' },
  'washington-dc': { wiki: 'Flag_of_the_District_of_Columbia.svg', local: 'us/washington-dc.svg' },
  'quebec': { wiki: 'Flag_of_Quebec.svg', local: 'canada-sub/quebec.svg' },
  'scotland': { wiki: 'Flag_of_Scotland.svg', local: 'uk/scotland.svg' },
  'wales': { wiki: 'Flag_of_Wales.svg', local: 'uk/wales.svg' },
  'england': { wiki: 'Flag_of_England.svg', local: 'uk/england.svg' },
};

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  if (req.url === '/manifest') {
    // Return list of flags to fetch
    const items = Object.entries(WIKI_MAP).map(([id, info]) => ({
      id,
      wiki_url: `https://upload.wikimedia.org/wikipedia/commons/wiki/Special:FilePath/${info.wiki}`,
      // Use the Special:FilePath redirect
      fetch_url: `https://commons.wikimedia.org/wiki/Special:FilePath/${info.wiki}`,
    }));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(items));
    return;
  }

  if (req.url === '/save' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { id, svg } = JSON.parse(body);
        const info = WIKI_MAP[id];
        if (!info) {
          res.writeHead(404); res.end('Unknown flag: ' + id); return;
        }
        // Make sure directory exists
        const dir = path.dirname(info.local);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(info.local, svg);
        console.log(`  OK ${id} -> ${info.local} (${svg.length} bytes)`);
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('ok');
      } catch (e) {
        console.error(`  ERR: ${e.message}`);
        res.writeHead(500); res.end(e.message);
      }
    });
    return;
  }

  if (req.url === '/status') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ready');
    return;
  }

  // Serve a fetcher page
  if (req.url === '/' || req.url === '/fetch') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<!DOCTYPE html><html><head><title>SVG Fetcher</title></head><body>
<h2>Flag SVG Fetcher</h2>
<div id="log" style="font-family:monospace;font-size:12px;white-space:pre-wrap;max-height:80vh;overflow:auto"></div>
<script>
const log = document.getElementById('log');
function addLog(msg) { log.textContent += msg + '\\n'; log.scrollTop = log.scrollHeight; }

async function run() {
  addLog('Fetching manifest...');
  const resp = await fetch('http://localhost:4444/manifest');
  const items = await resp.json();
  addLog('Got ' + items.length + ' flags to fetch');

  let ok = 0, fail = 0;
  for (const item of items) {
    try {
      const r = await fetch(item.fetch_url);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const svg = await r.text();
      if (!svg.includes('<svg') && !svg.includes('<?xml')) throw new Error('Not SVG');

      const save = await fetch('http://localhost:4444/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, svg })
      });
      if (save.ok) {
        addLog('OK  ' + item.id + ' (' + svg.length + ' bytes)');
        ok++;
      } else {
        throw new Error('Save failed: ' + await save.text());
      }
    } catch (e) {
      addLog('FAIL ' + item.id + ': ' + e.message);
      fail++;
    }
    // Small delay to be polite
    await new Promise(r => setTimeout(r, 200));
  }
  addLog('\\nDone: ' + ok + ' ok, ' + fail + ' failed');
}
run();
</script></body></html>`);
    return;
  }

  res.writeHead(404); res.end('Not found');
});

server.listen(4444, () => {
  console.log('SVG receiver listening on http://localhost:4444');
  console.log('Open http://localhost:4444/ in browser to start fetching');
  console.log(`${Object.keys(WIKI_MAP).length} flags to fetch`);
});
