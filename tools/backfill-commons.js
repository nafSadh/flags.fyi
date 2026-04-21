#!/usr/bin/env node
// Generates Wikimedia Commons filename mappings for entries that were
// bulk-downloaded with deterministic naming. Emits a JavaScript object
// literal that can be merged into build.js's commonsFileMap.
//
// Usage: node tools/backfill-commons.js > commons-backfill.json

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const flagsJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/flags.json'), 'utf8'));

// Build.js already has a commonsFileMap — parse it out so we don't overwrite.
const buildText = fs.readFileSync(path.join(ROOT, 'build.js'), 'utf8');
const mapMatch = buildText.match(/const commonsFileMap = (\{[\s\S]*?\n\});/);
const existing = eval('(' + mapMatch[1] + ')');

// Titleize: "new-york" → "New_York"
const title = (s) => s.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join('_');

const addMap = {};
function add(id, file) {
  if (existing[id]) return;
  addMap[id] = file;
}

// ─── Prefix-based bulk conventions ───
for (const [id, fd] of Object.entries(flagsJson)) {
  if (existing[id]) continue;
  const g = (fd.g || '').split(',').map(s => s.trim());

  // Japanese prefectures: jp/<slug> → Flag_of_<Name>_Prefecture.svg
  if (id.startsWith('jp/')) {
    const n = fd.name ? fd.name.replace(/ Prefecture$/, '') : title(id.slice(3));
    add(id, `Flag_of_${n.replace(/ /g, '_')}_Prefecture.svg`);
    continue;
  }

  // Swiss cantons: ch/<slug> → Flag_of_Canton_of_<Name>.svg
  if (id.startsWith('ch/')) {
    const slug = id.slice(3);
    const nameMap = {
      'zurich': 'Zürich', 'bern': 'Bern', 'lucerne': 'Lucerne', 'uri': 'Uri',
      'schwyz': 'Schwyz', 'obwalden': 'Obwalden', 'nidwalden': 'Nidwalden',
      'glarus': 'Glarus', 'zug': 'Zug', 'fribourg': 'Fribourg',
      'solothurn': 'Solothurn', 'schaffhausen': 'Schaffhausen',
      'appenzell-ar': 'Appenzell_Ausserrhoden', 'appenzell-ir': 'Appenzell_Innerrhoden',
      'graubunden': 'Graubünden', 'aargau': 'Aargau', 'thurgau': 'Thurgau',
      'ticino': 'Ticino', 'vaud': 'Vaud', 'valais': 'Valais',
      'neuchatel': 'Neuchâtel', 'geneva': 'Geneva', 'jura': 'Jura',
      'basel-landschaft': 'Basel-Landschaft'
    };
    if (nameMap[slug]) add(id, `Flag_of_Canton_of_${nameMap[slug]}.svg`);
    else if (slug === 'basel-stadt') add(id, 'Flag_of_Canton_of_Basel.svg');
    else if (slug === 'st-gallen') add(id, 'Flag_of_Canton_of_Sankt_Gallen.svg');
    continue;
  }

  // US states: us/<slug> → Flag_of_<Name>.svg with exceptions
  if (id.startsWith('us/')) {
    const slug = id.slice(3);
    const exceptions = {
      'texas': 'Flag_of_Texas.svg',
      'washington-dc': 'Flag_of_the_District_of_Columbia.svg',
      'georgia': 'Flag_of_Georgia_(U.S._state).svg'
    };
    if (exceptions[slug]) add(id, exceptions[slug]);
    else add(id, `Flag_of_${title(slug)}.svg`);
    continue;
  }

  // German Länder: de/<slug>
  if (id.startsWith('de/')) {
    const slug = id.slice(3);
    add(id, `Flag_of_${title(slug)}.svg`);
    continue;
  }

  // Brazilian states: br/<slug> use short slugs; Commons uses full names
  if (id.startsWith('br/')) {
    const slug = id.slice(3);
    const brMap = {
      ac:'Acre', al:'Alagoas', ap:'Amapá', am:'Amazonas', ba:'Bahia',
      ce:'Ceará', df:'Distrito_Federal_(Brazil)', es:'Espírito_Santo',
      go:'Goiás', ma:'Maranhão', mt:'Mato_Grosso', ms:'Mato_Grosso_do_Sul',
      mg:'Minas_Gerais', pa:'Pará', pb:'Paraíba', pr:'Paraná',
      pe:'Pernambuco', pi:'Piauí', rj:'Rio_de_Janeiro', rn:'Rio_Grande_do_Norte',
      rs:'Rio_Grande_do_Sul', ro:'Rondônia', rr:'Roraima', sc:'Santa_Catarina',
      se:'Sergipe', to:'Tocantins'
    };
    if (brMap[slug]) add(id, `Flag_of_${brMap[slug]}.svg`);
    else if (slug === 'sp') add(id, 'Bandeira_do_estado_de_São_Paulo.svg');
    continue;
  }

  // Italian regions
  if (id.startsWith('it/')) {
    const slug = id.slice(3);
    const exc = {
      'apulia': 'Flag_of_Apulia.svg',
      'marche': 'Flag_of_Marche.svg',
      'aosta-valley': 'Flag_of_Aosta_Valley.svg',
      'trentino-alto-adige': 'Flag_of_Trentino-South_Tyrol.svg',
      'emilia-romagna': 'Flag_of_Emilia-Romagna.svg',
      'friuli-venezia-giulia': 'Flag_of_Friuli-Venezia_Giulia.svg'
    };
    if (exc[slug]) add(id, exc[slug]);
    else add(id, `Flag_of_${title(slug)}.svg`);
    continue;
  }

  // Canadian provinces
  if (id.startsWith('ca/')) {
    const slug = id.slice(3);
    add(id, `Flag_of_${title(slug).replace('-', '_and_')}.svg`);
    continue;
  }

  // Australian states
  if (id.startsWith('au/')) {
    const slug = id.slice(3);
    add(id, `Flag_of_${title(slug)}.svg`);
    continue;
  }

  // Spanish autonomous communities
  if (id.startsWith('es/')) {
    const slug = id.slice(3);
    const exc = {
      'canary-islands': 'Flag_of_the_Canary_Islands.svg',
      'balearic-islands': 'Flag_of_the_Balearic_Islands.svg',
      'madrid': 'Flag_of_the_Community_of_Madrid.svg',
      'murcia': 'Flag_of_the_Region_of_Murcia.svg',
      'valencia': 'Flag_of_the_Valencian_Community_(2x3).svg',
      'castile-leon': 'Flag_of_Castile_and_León.svg',
      'castilla-la-mancha': 'Flag_of_Castilla-La_Mancha.svg',
      'la-rioja': 'Flag_of_La_Rioja_(with_coat_of_arms).svg'
    };
    if (exc[slug]) add(id, exc[slug]);
    else add(id, `Flag_of_${title(slug)}.svg`);
    continue;
  }

  // Indian states
  if (id.startsWith('in/')) {
    const slug = id.slice(3);
    const exc = {
      'punjab': 'Flag_of_Punjab,_India.svg'
    };
    if (exc[slug]) add(id, exc[slug]);
    else add(id, `Flag_of_${title(slug)}.svg`);
    continue;
  }

  // Polish voivodeships (guessed from my download script)
  if (id.startsWith('pl/')) continue; // variable — skip auto

  // Russian federal subjects
  if (id.startsWith('ru/')) {
    const slug = id.slice(3);
    const exc = {
      'moscow': 'Flag_of_Moscow.svg',
      'st-petersburg': 'Flag_of_Saint_Petersburg_Inscription.svg',
      'sevastopol': 'Flag_of_Sevastopol.svg',
      'chechnya': 'Flag_of_the_Chechen_Republic.svg',
      'altai-republic': 'Flag_of_the_Altai_Republic.svg',
      'karelia': 'Flag_of_the_Republic_of_Karelia.svg',
      'jewish-oblast': 'Flag_of_the_Jewish_Autonomous_Oblast.svg',
      'chukotka-okrug': 'Flag_of_Chukotka.svg',
      'khanty-mansi': 'Flag_of_Khanty-Mansi_Autonomous_Okrug.svg',
      'nenets-okrug': 'Flag_of_Nenets_Autonomous_Okrug.svg',
      'yamalo-nenets': 'Flag_of_Yamalo-Nenets_Autonomous_Okrug.svg'
    };
    if (exc[slug]) add(id, exc[slug]);
    else {
      // Default: Flag_of_<Title>.svg (with Title-case transformed)
      const name = title(slug).replace(/_Oblast$/, '_Oblast').replace(/_Krai$/, '_Krai');
      add(id, `Flag_of_${name}.svg`);
    }
    continue;
  }

  // Indonesian provinces
  if (id.startsWith('id/')) {
    const slug = id.slice(3);
    const exc = {
      'bangka-belitung': 'Flag_of_the_Bangka_Belitung_Islands.svg',
      'riau-islands': 'Flag_of_the_Riau_Islands.svg',
      'yogyakarta': 'Flag_of_Yogyakarta_(special_region).svg',
      'west-papua': 'Flag_of_West_Papua_(province).svg'
    };
    if (exc[slug]) add(id, exc[slug]);
    else add(id, `Flag_of_${title(slug)}.svg`);
    continue;
  }

  // UK subdivisions
  if (id.startsWith('uk/')) {
    const slug = id.slice(3);
    const exc = {
      'scotland': 'Flag_of_Scotland.svg',
      'wales': 'Flag_of_Wales.svg',
      'england': 'Flag_of_England.svg',
      'northern-ireland': 'Ulster_Banner.svg',
      'cornwall': 'Flag_of_Cornwall.svg'
    };
    if (exc[slug]) add(id, exc[slug]);
    continue;
  }

  // ICS signal flags
  if (id.startsWith('ics-')) {
    const letter = id.slice(4);
    const nato = {
      a:'Alfa', b:'Bravo', c:'Charlie', d:'Delta', e:'Echo', f:'Foxtrot',
      g:'Golf', h:'Hotel', i:'India', j:'Juliet', k:'Kilo', l:'Lima',
      m:'Mike', n:'November', o:'Oscar', p:'Papa', q:'Quebec', r:'Romeo',
      s:'Sierra', t:'Tango', u:'Uniform', v:'Victor', w:'Whiskey',
      x:'X-ray', y:'Yankee', z:'Zulu'
    };
    if (nato[letter]) add(id, `ICS_${nato[letter]}.svg`);
    continue;
  }

  // Pride subflags
  if (id.startsWith('pride-')) {
    const sub = id.slice(6);
    const exc = {
      bi: 'Bisexual_Pride_Flag.svg',
      pan: 'Pansexuality_flag.svg',
      asexual: 'Asexual_Pride_Flag.svg',
      nonbinary: 'Nonbinary_flag.svg',
      genderqueer: 'Genderqueer_Pride_Flag.svg',
      genderfluid: 'Genderfluidity_Pride-Flag.svg',
      agender: 'Agender_pride_flag.svg',
      intersex: 'Intersex_Pride_Flag.svg',
      lesbian: 'Globasa_lesbian_pride_flag.svg',
      aromantic: 'Aromantic_Pride_Flag.svg',
      demisexual: 'Demisexual_Pride_Flag.svg',
      bear: 'Bear_Brotherhood_flag.svg',
      leather: 'Leather,_Latex,_and_BDSM_pride_-_Light.svg',
      rubber: 'Rubber_Fetish_Pride_Flag.svg',
      polyamory: 'Polyamory_Pride_Flag.svg',
      philadelphia: 'More_Color_More_Pride_Flag.svg'
    };
    if (exc[sub]) add(id, exc[sub]);
    continue;
  }

  // Major cities
  if (fd.ns === 'cities') {
    const exc = {
      paris: 'Flag_of_Paris.svg', london: 'Flag_of_the_City_of_London.svg',
      rome: 'Flag_of_Rome.svg', berlin: 'Flag_of_Berlin.svg',
      vienna: 'Flag_of_Wien.svg', madrid: 'Flag_of_Madrid_City.svg',
      amsterdam: 'Flag_of_Amsterdam.svg', brussels: 'Flag_of_Brussels.svg',
      lisbon: 'Flag_of_Lisbon.svg', athens: 'Flag_of_Athens.svg',
      warsaw: 'Flag_of_Warsaw.svg', prague: 'Flag_of_Prague.svg',
      budapest: 'Flag_of_Budapest.svg', copenhagen: 'Flag_of_Copenhagen.svg',
      stockholm: 'Flag_of_Stockholm_Municipality.svg', oslo: 'Flag_of_Oslo.svg',
      helsinki: 'Flag_of_Helsinki.svg', reykjavik: 'Flag_of_Reykjavík.svg',
      dublin: 'Flag_of_Dublin_City_Council.svg', edinburgh: 'Flag_of_Edinburgh.svg',
      belfast: 'Flag_of_Belfast.svg', istanbul: 'Flag_of_Istanbul_Metropolitan_Municipality.svg',
      'moscow-city': 'Flag_of_Moscow.svg', kyiv: 'Flag_of_Kyiv.svg',
      bucharest: 'Flag_of_Bucharest.svg', sofia: 'Flag_of_Sofia.svg',
      belgrade: 'Flag_of_Belgrade.svg', zagreb: 'Flag_of_Zagreb.svg',
      sarajevo: 'Flag_of_Sarajevo.svg', skopje: 'Flag_of_Skopje.svg',
      tirana: 'Flag_of_Tirana.svg', chisinau: 'Flag_of_Chișinău.svg',
      tbilisi: 'Flag_of_Tbilisi.svg', yerevan: 'Flag_of_Yerevan.svg',
      baku: 'Flag_of_Baku.svg', minsk: 'Flag_of_Minsk.svg',
      riga: 'Flag_of_Riga.svg', tallinn: 'Flag_of_Tallinn.svg',
      vilnius: 'Flag_of_Vilnius.svg',
      'new-york-city': 'Flag_of_New_York_City.svg', chicago: 'Flag_of_Chicago.svg',
      'los-angeles': 'Flag_of_Los_Angeles,_California.svg',
      'san-francisco': 'Flag_of_San_Francisco.svg',
      boston: 'Flag_of_Boston,_Massachusetts.svg',
      'washington-dc-city': 'Flag_of_the_District_of_Columbia.svg',
      seattle: 'Flag_of_Seattle,_Washington.svg',
      denver: 'Flag_of_Denver,_Colorado.svg',
      miami: 'Flag_of_Miami,_Florida.svg',
      'philadelphia-city': 'Flag_of_Philadelphia,_Pennsylvania.svg',
      dallas: 'Flag_of_Dallas,_Texas.svg',
      'new-orleans': 'Flag_of_New_Orleans,_Louisiana.svg',
      'las-vegas': 'Flag_of_Las_Vegas,_Nevada.svg',
      'portland-or': 'Flag_of_Portland,_Oregon.svg',
      austin: 'Flag_of_Austin,_Texas.svg',
      'salt-lake-city': 'Flag_of_Salt_Lake_City,_Utah.svg',
      'phoenix-city': 'Flag_of_Phoenix,_Arizona.svg',
      toronto: 'Flag_of_Toronto.svg', montreal: 'Flag_of_Montreal.svg',
      vancouver: 'Flag_of_Vancouver.svg', ottawa: 'Flag_of_Ottawa.svg',
      'mexico-city-city': 'Flag_of_Mexico_City.svg',
      'rio-de-janeiro-city': 'Flag_of_Rio_de_Janeiro_city.svg',
      'sao-paulo-city': 'Flag_of_São_Paulo.svg',
      lima: 'Flag_of_Lima.svg', 'santiago-city': 'Flag_of_Santiago.svg',
      bogota: 'Flag_of_Bogotá.svg', caracas: 'Flag_of_Caracas.svg',
      havana: 'Flag_of_Havana.svg', kingston: 'Flag_of_Kingston,_Jamaica.svg',
      'san-juan-pr': 'Flag_of_San_Juan,_Puerto_Rico.svg',
      'tokyo-city': 'Flag_of_Tokyo_Metropolis.svg',
      'kyoto-city': 'Flag_of_Kyoto.svg', 'osaka-city': 'Flag_of_Osaka_City.svg',
      nagoya: 'Flag_of_Nagoya.svg', yokohama: 'Flag_of_Yokohama.svg',
      seoul: 'Flag_of_Seoul.svg', busan: 'Flag_of_Busan.svg',
      pyongyang: 'Flag_of_Pyongyang.svg', beijing: 'Flag_of_Beijing.svg',
      shanghai: 'Flag_of_Shanghai.svg', guangzhou: 'Flag_of_Guangzhou.svg',
      shenzhen: 'Flag_of_Shenzhen.svg',
      'hong-kong': 'Flag_of_Hong_Kong.svg', macau: 'Flag_of_Macau.svg',
      taipei: 'Flag_of_Taipei.svg', bangkok: 'Flag_of_Bangkok.svg',
      manila: 'Flag_of_Manila.svg', 'jakarta-city': 'Flag_of_Jakarta.svg',
      'singapore-city': 'Flag_of_Singapore.svg',
      'kuala-lumpur': 'Flag_of_Kuala_Lumpur.svg', hanoi: 'Flag_of_Hanoi.svg',
      'ho-chi-minh': 'Flag_of_Ho_Chi_Minh_City.svg',
      'delhi-city': 'Flag_of_Delhi.svg', mumbai: 'Flag_of_Mumbai.svg',
      cairo: 'Flag_of_Cairo.svg', jerusalem: 'Flag_of_Jerusalem.svg',
      dubai: 'Flag_of_Dubai_City.svg', tehran: 'Flag_of_Tehran.svg',
      'sydney-city': 'Flag_of_Sydney.svg', melbourne: 'Flag_of_Melbourne.svg',
      auckland: 'Flag_of_Auckland.svg'
    };
    if (exc[id]) add(id, exc[id]);
    continue;
  }

  // Historic empires added this session (empires/ namespace, new entries)
  if (fd.ns === 'empires') {
    const exc = {
      genoa: 'Flag_of_Genoa.svg',
      seljuk: 'Flag_of_Seljuk_Empire_(16_Great_Turkic_Empires)_1.svg',
      safavid: 'Safavid_Flag.svg',
      parthian: 'Flag_of_Parthian_Empire.svg',
      'delhi-sultanate': 'Flag_of_the_Delhi_Sultanate.svg',
      maratha: 'Flag_of_the_Maratha_Empire.svg',
      'mali-empire': 'Flag_of_the_Mali_Empire.svg',
      teutonic: 'Flag_of_the_Teutonic_Order.svg',
      templar: 'Flag_of_the_Knights_Templar.svg',
      smom: 'Flag_of_the_Sovereign_Military_Order_of_Malta.svg',
      'lithuania-gd': 'Royal_banner_of_the_Grand_Duchy_of_Lithuania.svg',
      majapahit: 'Majapahit_fictitious_flag.svg',
      khazar: 'Flag_of_the_Khazars_(16_Great_Turkic_Empires).svg',
      sokoto: 'Flag_of_the_Sokoto_Caliphate.svg',
      'kanem-bornu': 'Flag_of_the_Kanem-Bornu_Empire.svg',
      gokturk: 'Flag_of_the_Göktürks_Khaganate.svg',
      'uyghur-khaganate': 'Flag_of_Uyghur_Khaganate_(16_Great_Turkic_Empires)_1.svg',
      aragon: 'Flag_of_Aragon.svg',
      castile: 'Royal_Banner_of_the_Kingdom_of_Castile.svg',
      leon: 'Flag_of_Early_Medieval_Kingdom_of_Leon.svg',
      navarre: 'Flag_of_Navarre_(1212–1589).svg',
      nasrid: 'Nasrid_Flag.svg',
      florence: 'Flag_of_Florence.svg',
      pisa: 'Flag_of_Pisa_SC.svg',
      milan: 'Flag_of_the_Duchy_of_Milan_(1450,_2-3_ratio).svg',
      'kalmar-union': 'Flag_of_the_Kalmar_Union.svg',
      'austria-hungary': 'Austria-Hungary_naval_ensign_15-18.svg',
      bohemia: 'Flag_of_Bohemia.svg',
      'sultanate-rum': 'Flag_of_Sultanate_of_Rum.svg',
      'omani-empire': 'Flag_of_the_Omani_Empire.svg',
      'papal-states': 'Flag_of_the_Papal_States,_ca._1523.svg',
      afsharid: 'Afsharid_State_Flag.svg',
      'zanzibar-sultanate': 'Flag_of_the_Sultanate_of_Zanzibar_(1963).svg',
      transvaal: 'Flag_of_Transvaal.svg',
      'orange-free-state': 'Flag_of_the_Orange_Free_State.svg',
      'gran-colombia': 'Flag_of_Gran_Colombia.svg',
      wallachia: 'Flag_of_Wallachia.svg',
      moldavia: 'Flag_of_Moldavia.svg',
      transylvania: 'Flag_of_Transylvania_(Local).svg',
      ragusa: 'Libertas.svg',
      'aq-qoyunlu': 'Flag_of_the_Aq_Qoyunlu_Uzun_Hasan.svg',
      zand: 'Zand_Dynasty_flag.svg',
      'crimean-khanate': 'Flag_of_the_Crimean_Khanate_(15th_century).svg',
      ayutthaya: 'Flag_of_Thailand_(Ayutthaya_period).svg',
      konbaung: 'National_flag_of_the_Konbaung_Empire.svg',
      dahomey: 'Flag_of_Ghezo_of_Dahomey.svg',
      bukhara: 'Flag_of_the_Emirate_of_Bukhara.svg',
      khiva: 'Flag_of_the_Khanate_of_Khiva.svg',
      kokand: 'Flag_of_the_Khanate_of_Kokand.svg',
      hyderabad: 'Asafia_flag_of_Hyderabad_State.svg',
      merina: 'Merina_Kingdom_flag.svg',
      sulu: 'Late_19th_Century_Flag_of_Sulu.svg',
      mataram: 'Flag_of_the_Sultanate_of_Mataram.svg',
      parma: 'Flag_of_the_Duchy_of_Parma.svg'
    };
    if (exc[id]) add(id, exc[id]);
    continue;
  }
}

console.log('Total new mappings: ' + Object.keys(addMap).length);

// Emit as JS lines to paste into build.js
const lines = Object.entries(addMap).map(([id, file]) => {
  const key = /^[a-z_][a-z0-9_]*$/.test(id) ? id : `'${id}'`;
  return `  '${id}': '${file.replace(/'/g, "\\'")}',`;
});
fs.writeFileSync(path.join(ROOT, 'tools/commons-backfill.txt'), lines.join('\n') + '\n');
console.log('Written to tools/commons-backfill.txt');
