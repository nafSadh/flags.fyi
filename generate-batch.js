#!/usr/bin/env node
/**
 * Batch-generate flag entries, SVGs, and data for all missing historical/symbolic flags.
 * Run from the flags.fyi root: node generate-batch.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DATA = path.join(ROOT, 'data');
const ASSETS = path.join(ROOT, 'assets', 'flags');

// ── Load existing data ──────────────────────────────────────────
const flagsJson = JSON.parse(fs.readFileSync(path.join(DATA, 'flags.json'), 'utf8'));
const includesJson = JSON.parse(fs.readFileSync(path.join(DATA, 'includes.json'), 'utf8'));
const groupInfo = JSON.parse(fs.readFileSync(path.join(DATA, 'group-info.json'), 'utf8'));

// ── New categories to add ───────────────────────────────────────
const newGroups = {
  "caliphate": {
    "title": "Islamic Caliphates & Dynasties",
    "note": "Flags of historical Islamic caliphates, sultanates, and dynasties"
  },
  "empire": {
    "title": "Empires & Ancient States",
    "note": "Flags of historical empires and ancient states"
  },
  "intl": {
    "title": "International Organizations",
    "note": "Flags of international and supranational organizations"
  },
  "pan": {
    "title": "Pan-Movement & Identity",
    "note": "Flags representing pan-national movements and cultural identities"
  },
  "pride": {
    "title": "Pride & Social Movement",
    "note": "Flags of social movements and pride"
  },
  "maritime": {
    "title": "Maritime & Signal",
    "note": "Naval ensigns, pirate flags, and maritime signal flags"
  },
  "sub": {
    "title": "Sub-national & State Flags",
    "note": "Flags of states, provinces, and constituent countries"
  },
  "colonial": {
    "title": "Colonial & Mandate",
    "note": "Flags from colonial and mandate periods"
  }
};

// ── All new flag entries ────────────────────────────────────────
// Format: { id, ns, name, g, title, ratio, colors[], desc[] }
const newFlags = [

  // ══ ISLAMIC CALIPHATES & DYNASTIES ══
  { id: 'rashidun', ns: 'caliphates', name: 'Rashidun Caliphate', g: 'h,caliphate',
    title: 'Flag of the Rashidun Caliphate', ratio: '2:3',
    colors: [{ color: 'white', hex: '#ffffff' }],
    desc: ['The Rashidun Caliphate (632–661) was the first of the four major Islamic caliphates. Its banner was plain white, symbolising purity and the legacy of the Prophet.'],
    svg: svgSolid('#ffffff', '#ccc') },

  { id: 'umayyad', ns: 'caliphates', name: 'Umayyad Caliphate', g: 'h,caliphate',
    title: 'Flag of the Umayyad Caliphate', ratio: '2:3',
    colors: [{ color: 'white', hex: '#ffffff' }],
    desc: ['The Umayyad Caliphate (661–750) continued the white banner tradition, representing the conquest of Mecca. Damascus served as its capital.'],
    svg: svgSolid('#ffffff', '#ccc') },

  { id: 'abbasid', ns: 'caliphates', name: 'Abbasid Caliphate', g: 'h,caliphate',
    title: 'Flag of the Abbasid Caliphate (Black Standard)', ratio: '2:3',
    colors: [{ color: 'black', hex: '#000000' }],
    desc: ['The Abbasid Caliphate (750–1258) adopted the Black Standard (al-Raya), referencing the turban of the Prophet. Baghdad was its great capital.'],
    svg: svgSolid('#000000') },

  { id: 'fatimid', ns: 'caliphates', name: 'Fatimid Caliphate', g: 'h,caliphate',
    title: 'Flag of the Fatimid Caliphate', ratio: '2:3',
    colors: [{ color: 'green', hex: '#006233' }],
    desc: ['The Fatimid Caliphate (909–1171) used a green banner, representing the house of Ali and the Prophet\'s cloak. Cairo was founded as its capital.'],
    svg: svgSolid('#006233') },

  { id: 'ayyubid', ns: 'caliphates', name: 'Ayyubid Dynasty', g: 'h,caliphate',
    title: 'Banner of the Ayyubid Dynasty', ratio: '2:3',
    colors: [{ color: 'yellow', hex: '#fcd116' }],
    desc: ['The Ayyubid Dynasty (1171–1260), founded by Saladin, carried a yellow banner adorned with an eagle — the origin of the Eagle of Saladin heraldic emblem.'],
    svg: svgSolidWithEagle('#fcd116', '#8b6914') },

  { id: 'ottoman', ns: 'caliphates', name: 'Ottoman Empire', g: 'h,caliphate,europe,asia',
    title: 'Flag of the Ottoman Empire', ratio: '2:3',
    colors: [{ color: 'red', hex: '#e30a17' }, { color: 'white', hex: '#ffffff' }],
    desc: ['The Ottoman Empire (1299–1922) adopted the red flag with white crescent and star in 1844. This flag influenced the modern Turkish flag and many other nations.'],
    svg: svgOttoman() },

  { id: 'ottoman-early', ns: 'caliphates', name: 'Ottoman Empire (Early)', g: 'h,caliphate',
    title: 'Early Ottoman Banner', ratio: '2:3',
    colors: [{ color: 'red', hex: '#e30a17' }, { color: 'green', hex: '#006233' }],
    desc: ['Early Ottoman banners varied; a common form was red with a green circle and crescents, used before the standardisation of the late Ottoman flag.'],
    svg: svgOttomanEarly() },

  { id: 'mughal', ns: 'caliphates', name: 'Mughal Empire', g: 'h,caliphate,south-asia',
    title: 'Flag of the Mughal Empire', ratio: '2:3',
    colors: [{ color: 'green', hex: '#006233' }, { color: 'gold', hex: '#ffd700' }],
    desc: ['The Mughal Empire (1526–1857) used green banners with gold lion-and-sun motifs. The empire ruled most of the Indian subcontinent.'],
    svg: svgMughal() },

  { id: 'almohad', ns: 'caliphates', name: 'Almohad Caliphate', g: 'h,caliphate,maghreb',
    title: 'Flag of the Almohad Caliphate', ratio: '2:3',
    colors: [{ color: 'red', hex: '#c1272d' }, { color: 'gold', hex: '#ffd700' }],
    desc: ['The Almohad Caliphate (1121–1269) ruled the Maghreb and Iberia. Its red banner featured a gold checkered square motif.'],
    svg: svgAlmohad() },

  { id: 'almoravid', ns: 'caliphates', name: 'Almoravid Dynasty', g: 'h,caliphate,maghreb',
    title: 'Flag of the Almoravid Dynasty', ratio: '2:3',
    colors: [{ color: 'white', hex: '#ffffff' }],
    desc: ['The Almoravid Dynasty (1040–1147) originated in present-day Mauritania and Morocco. They used white banners in the tradition of the Umayyads.'],
    svg: svgSolid('#ffffff', '#ccc') },

  { id: 'idrisid', ns: 'caliphates', name: 'Idrisid Dynasty', g: 'h,caliphate,maghreb',
    title: 'Flag of the Idrisid Dynasty', ratio: '2:3',
    colors: [{ color: 'white', hex: '#ffffff' }, { color: 'green', hex: '#006233' }],
    desc: ['The Idrisid Dynasty (788–974) was the first Moroccan state and first Shia dynasty in the western Maghreb. They used white and green banners.'],
    svg: svgBicolourV('#ffffff', '#006233') },

  { id: 'samanid', ns: 'caliphates', name: 'Samanid Empire', g: 'h,caliphate,asia',
    title: 'Flag of the Samanid Empire', ratio: '2:3',
    colors: [{ color: 'black', hex: '#000000' }, { color: 'white', hex: '#ffffff' }],
    desc: ['The Samanid Empire (819–999) was a Sunni Iranian dynasty in Central Asia. Their banners echoed the Abbasid black standard tradition.'],
    svg: svgSolid('#000000') },

  // ══ ANCIENT & MEDIEVAL EMPIRES ══
  { id: 'roman-empire', ns: 'empires', name: 'Roman Empire', g: 'h,empire,europe',
    title: 'Vexillum of the Roman Empire', ratio: '3:4',
    colors: [{ color: 'red', hex: '#8b0000' }, { color: 'gold', hex: '#ffd700' }],
    desc: ['The Roman vexillum was a banner hung from a crossbar, typically red or purple with SPQR and an eagle. It was the precursor to modern flags.'],
    svg: svgRoman() },

  { id: 'byzantine', ns: 'empires', name: 'Byzantine Empire', g: 'h,empire,europe',
    title: 'Flag of the Byzantine Empire', ratio: '2:3',
    colors: [{ color: 'gold', hex: '#ffd700' }, { color: 'purple', hex: '#6a0dad' }],
    desc: ['The Byzantine (Eastern Roman) Empire used a gold or purple field with a double-headed eagle, symbolising the empire spanning Europe and Asia.'],
    svg: svgByzantine() },

  { id: 'holy-roman-empire', ns: 'empires', name: 'Holy Roman Empire', g: 'h,empire,europe',
    title: 'Banner of the Holy Roman Empire', ratio: '2:3',
    colors: [{ color: 'gold', hex: '#ffd700' }, { color: 'black', hex: '#000000' }],
    desc: ['The Holy Roman Empire (800–1806) used a gold banner with a black double-headed eagle, representing universal sovereignty over Christendom.'],
    svg: svgHRE() },

  { id: 'mongol', ns: 'empires', name: 'Mongol Empire', g: 'h,empire,asia',
    title: 'Banner of the Mongol Empire', ratio: '2:3',
    colors: [{ color: 'white', hex: '#ffffff' }, { color: 'black', hex: '#000000' }],
    desc: ['The Mongol Empire (1206–1368) used the white sulde (spirit banner) with nine horse-hair tails, a sacred symbol representing the spirit of Genghis Khan.'],
    svg: svgMongol() },

  { id: 'achaemenid', ns: 'empires', name: 'Achaemenid Empire', g: 'h,empire,asia',
    title: 'Standard of the Achaemenid Empire', ratio: '2:3',
    colors: [{ color: 'gold', hex: '#ffd700' }, { color: 'purple', hex: '#702963' }],
    desc: ['The Achaemenid (Persian) Empire (550–330 BC) used the Derafsh Kaviani, a jewelled royal standard. It was the precursor to the Sassanid standard.'],
    svg: svgAchaemenid() },

  { id: 'kingdom-of-jerusalem', ns: 'empires', name: 'Kingdom of Jerusalem', g: 'h,empire,levant',
    title: 'Flag of the Kingdom of Jerusalem', ratio: '2:3',
    colors: [{ color: 'white', hex: '#ffffff' }, { color: 'gold', hex: '#ffd700' }],
    desc: ['The Crusader Kingdom of Jerusalem (1099–1291) used a white or silver field with a gold Jerusalem cross — unique as it broke the heraldic rule of tincture.'],
    svg: svgJerusalem() },

  { id: 'venice', ns: 'empires', name: 'Republic of Venice', g: 'h,empire,europe',
    title: 'Flag of the Republic of Venice', ratio: '1:2',
    colors: [{ color: 'red', hex: '#cc0000' }, { color: 'gold', hex: '#ffd700' }],
    desc: ['The Most Serene Republic of Venice (697–1797) flew the Lion of Saint Mark on a red field, one of the most recognisable maritime flags in history.'],
    svg: svgVenice() },

  // ══ IRAN / PERSIA (extends sassanid) ══
  { id: 'qajar', ns: 'persia', name: 'Qajar Dynasty', g: 'h,asia',
    title: 'Flag of the Qajar Dynasty', ratio: '2:3',
    colors: [{ color: 'white', hex: '#ffffff' }, { color: 'green', hex: '#009b3a' }, { color: 'gold', hex: '#ffd700' }],
    desc: ['The Qajar Dynasty (1789–1925) used a tricolour-style flag featuring a lion holding a sword with the rising sun behind it — the Shir-o-Khorshid.'],
    svg: svgQajar() },

  { id: 'pahlavi', ns: 'persia', name: 'Pahlavi Dynasty', g: 'h,fn,asia',
    title: 'Flag of the Pahlavi Dynasty (Imperial Iran)', ratio: '2:3',
    colors: [{ color: 'green', hex: '#239f40' }, { color: 'white', hex: '#ffffff' }, { color: 'red', hex: '#da0000' }],
    desc: ['The Pahlavi Dynasty (1925–1979) used the green-white-red tricolour with the lion-and-sun emblem. This was replaced after the 1979 Islamic Revolution.'],
    svg: svgTricolourH('#239f40', '#ffffff', '#da0000', svgLionSun()) },

  // ══ YEMEN SERIES ══
  { id: 'north-yemen', ns: 'yemen', name: 'North Yemen (YAR)', g: 'h,fn,arab',
    title: 'Flag of the Yemen Arab Republic', ratio: '2:3',
    colors: [{ color: 'red', hex: '#ce1126' }, { color: 'white', hex: '#ffffff' }, { color: 'black', hex: '#000000' }, { color: 'green', hex: '#007a3d' }],
    desc: ['The Yemen Arab Republic (North Yemen, 1962–1990) used red-white-black stripes with a green star in the centre of the white stripe.'],
    svg: svgTricolourH('#ce1126', '#ffffff', '#000000', svgStar('#007a3d')) },

  { id: 'south-yemen', ns: 'yemen', name: 'South Yemen (PDRY)', g: 'h,fn,arab',
    title: 'Flag of the People\'s Democratic Republic of Yemen', ratio: '2:3',
    colors: [{ color: 'red', hex: '#ce1126' }, { color: 'white', hex: '#ffffff' }, { color: 'black', hex: '#000000' }, { color: 'blue', hex: '#0035ad' }],
    desc: ['The People\'s Democratic Republic of Yemen (South Yemen, 1967–1990) used red-white-black stripes with a blue triangle and red star at the hoist.'],
    svg: svgSouthYemen() },

  // ══ OTHER ARAB HISTORICAL ══
  { id: 'hejaz', ns: 'arab-hist', name: 'Kingdom of Hejaz', g: 'h,arab',
    title: 'Flag of the Kingdom of Hejaz', ratio: '2:3',
    colors: [{ color: 'black', hex: '#000000' }, { color: 'green', hex: '#009736' }, { color: 'white', hex: '#ffffff' }, { color: 'red', hex: '#ce1126' }],
    desc: ['The Kingdom of Hejaz (1916–1925) flag was the original Arab Revolt flag — the direct ancestor of the Pan-Arab flag and the flags of Jordan, Palestine, and others.'],
    svg: svgHejaz() },

  { id: 'hatay', ns: 'arab-hist', name: 'Republic of Hatay', g: 'h',
    title: 'Flag of the Republic of Hatay', ratio: '2:3',
    colors: [{ color: 'red', hex: '#e30a17' }, { color: 'white', hex: '#ffffff' }],
    desc: ['The Republic of Hatay (1938–1939) was a brief transitional state between French Syria and Turkey. Its flag featured red and white stripes with a red star.'],
    svg: svgHatay() },

  { id: 'libya-united', ns: 'libya', name: 'United Kingdom of Libya', g: 'h',
    title: 'Flag of the United Kingdom of Libya', ratio: '1:2',
    colors: [{ color: 'red', hex: '#e70013' }, { color: 'black', hex: '#000000' }, { color: 'green', hex: '#009639' }, { color: 'white', hex: '#ffffff' }],
    desc: ['The United Kingdom of Libya (1951–1963) flag featured red-black-green stripes with a white crescent and star on the black band — predecessor to the Kingdom of Libya flag.'],
    svg: svgLibyaUnited() },

  // ══ SOUTH ASIA HISTORICAL ══
  { id: 'in-calcutta-flag', ns: 'india-hist', name: 'Calcutta Flag', g: 'h,south-asia',
    title: 'The Calcutta Flag (1906)', ratio: '2:3',
    colors: [{ color: 'red', hex: '#ff0000' }, { color: 'green', hex: '#138808' }, { color: 'yellow', hex: '#ffd700' }],
    desc: ['The Calcutta Flag (1906) was the first Indian nationalist flag, raised during the Swadeshi movement. It featured red and green stripes with a yellow central band.'],
    svg: svgTricolourH('#ff0000', '#ffd700', '#138808') },

  { id: 'in-independence', ns: 'india-hist', name: 'Indian Independence Movement Flag', g: 'h,fn,south-asia',
    title: 'Flag of the Indian Independence Movement', ratio: '2:3',
    colors: [{ color: 'saffron', hex: '#ff9933' }, { color: 'white', hex: '#ffffff' }, { color: 'green', hex: '#138808' }],
    desc: ['The 1931 Swaraj flag used by the Indian independence movement featured saffron, white, and green stripes with a spinning wheel (charkha) in the centre.'],
    svg: svgTricolourH('#ff9933', '#ffffff', '#138808', svgCharkha()) },

  { id: 'sikh-empire', ns: 'india-hist', name: 'Sikh Empire', g: 'h,empire,south-asia',
    title: 'Flag of the Sikh Empire', ratio: '2:3',
    colors: [{ color: 'blue', hex: '#003580' }, { color: 'yellow', hex: '#ffd700' }],
    desc: ['The Sikh Empire (1799–1849) used a triangular blue flag with a gold Khanda symbol, representing the martial and spiritual aspects of Sikh faith.'],
    svg: svgSikhEmpire() },

  { id: 'british-raj', ns: 'india-hist', name: 'British Raj', g: 'h,colonial,south-asia',
    title: 'Flag of British India (Star of India)', ratio: '1:2',
    colors: [{ color: 'red', hex: '#cf142b' }, { color: 'blue', hex: '#00247d' }, { color: 'white', hex: '#ffffff' }],
    desc: ['The British Raj (1858–1947) used a blue ensign defaced with the Star of India emblem. It represented British rule over the Indian subcontinent.'],
    svg: svgBlueEnsign('★') },

  { id: 'pk-muslim-league', ns: 'pakistan-hist', name: 'Muslim League Flag', g: 'h,south-asia',
    title: 'Flag of the All-India Muslim League', ratio: '2:3',
    colors: [{ color: 'green', hex: '#006233' }, { color: 'white', hex: '#ffffff' }],
    desc: ['The All-India Muslim League flag (1937–1947) was a green field with white crescent and star — the direct precursor to the flag of Pakistan.'],
    svg: svgCrescentStar('#006233', '#ffffff') },

  { id: 'east-pakistan', ns: 'pakistan-hist', name: 'East Pakistan', g: 'h,fn,south-asia',
    title: 'Flag of East Pakistan', ratio: '2:3',
    colors: [{ color: 'green', hex: '#006233' }, { color: 'white', hex: '#ffffff' }],
    desc: ['East Pakistan (1947–1971) used the same flag as Pakistan. After the Liberation War of 1971, it became the independent nation of Bangladesh.'],
    svg: svgCrescentStar('#006233', '#ffffff') },

  { id: 'bd-1971-map', ns: 'bangladesh-hist', name: 'Bangladesh 1971 (Map Version)', g: 'h,fn,south-asia',
    title: 'First Flag of Bangladesh (1971)', ratio: '2:3',
    colors: [{ color: 'green', hex: '#006a4e' }, { color: 'red', hex: '#f42a41' }, { color: 'yellow', hex: '#ffd700' }],
    desc: ['The first flag of Bangladesh (1971) featured a red disc with a golden map of Bangladesh on a green field. It was raised on 2 March 1971 at Dhaka University.'],
    svg: svgBD1971() },

  // ══ AFGHANISTAN SERIES ══
  { id: 'af-kingdom', ns: 'afghanistan', name: 'Afghanistan Kingdom', g: 'h,fn,asia',
    title: 'Flag of the Kingdom of Afghanistan', ratio: '2:3',
    colors: [{ color: 'black', hex: '#000000' }, { color: 'red', hex: '#d32011' }, { color: 'green', hex: '#007a36' }],
    desc: ['The Kingdom of Afghanistan (1929–1973) used black, red, and green vertical stripes with a white emblem in the centre.'],
    svg: svgTricolourV('#000000', '#d32011', '#007a36') },

  { id: 'af-republic', ns: 'afghanistan', name: 'Afghanistan Republic', g: 'h,fn,asia',
    title: 'Flag of the Republic of Afghanistan', ratio: '2:3',
    colors: [{ color: 'black', hex: '#000000' }, { color: 'red', hex: '#d32011' }, { color: 'green', hex: '#007a36' }],
    desc: ['The Republic of Afghanistan (1973–1978) used horizontal black, red, and green stripes with a new republican emblem featuring a wreath and pulpit.'],
    svg: svgTricolourH('#000000', '#d32011', '#007a36') },

  { id: 'af-soviet', ns: 'afghanistan', name: 'Afghanistan (Soviet era)', g: 'h,fn,asia',
    title: 'Flag of the Democratic Republic of Afghanistan', ratio: '2:3',
    colors: [{ color: 'red', hex: '#d32011' }],
    desc: ['The Democratic Republic of Afghanistan (1978–1992) initially used an all-red flag, later adding a cog-wheat emblem, reflecting its Soviet-backed communist government.'],
    svg: svgSolid('#d32011') },

  { id: 'af-taliban-1996', ns: 'afghanistan', name: 'Taliban (1996)', g: 'h,fn,asia',
    title: 'Flag of the Islamic Emirate of Afghanistan (1996)', ratio: '2:3',
    colors: [{ color: 'white', hex: '#ffffff' }],
    desc: ['The first Taliban regime (1996–2001) used a plain white flag with the shahada (Islamic declaration of faith) written in black Arabic script.'],
    svg: svgTaliban() },

  { id: 'af-islamic-republic', ns: 'afghanistan', name: 'Afghanistan Islamic Republic', g: 'h,fn,asia',
    title: 'Flag of the Islamic Republic of Afghanistan', ratio: '2:3',
    colors: [{ color: 'black', hex: '#000000' }, { color: 'red', hex: '#d32011' }, { color: 'green', hex: '#007a36' }, { color: 'white', hex: '#ffffff' }],
    desc: ['The Islamic Republic of Afghanistan (2002–2021) restored the tricolour of black, red, and green with the national emblem featuring a mosque, wreath, and shahada.'],
    svg: svgTricolourV('#000000', '#d32011', '#007a36') },

  // ══ EAST ASIA HISTORICAL ══
  { id: 'cn-qing-dragon', ns: 'china-hist', name: 'Qing Dynasty (Dragon Flag)', g: 'h,east-asia',
    title: 'Dragon Flag of the Qing Dynasty', ratio: '2:3',
    colors: [{ color: 'yellow', hex: '#ffde00' }, { color: 'blue', hex: '#0000cd' }],
    desc: ['The Qing Dynasty "Yellow Dragon Flag" (1889–1912) was the first national flag of China, featuring an azure dragon chasing a red pearl on a yellow field.'],
    svg: svgQingDragon() },

  { id: 'cn-five-coloured', ns: 'china-hist', name: 'Five-Coloured Flag (ROC)', g: 'h,fn,east-asia',
    title: 'Five-Coloured Flag of the Republic of China', ratio: '2:3',
    colors: [{ color: 'red', hex: '#de2910' }, { color: 'yellow', hex: '#ffde00' }, { color: 'blue', hex: '#0000cd' }, { color: 'white', hex: '#ffffff' }, { color: 'black', hex: '#000000' }],
    desc: ['The Five-Coloured Flag (1912–1928) represented the five ethnic groups of the Republic of China: Han (red), Manchu (yellow), Mongol (blue), Hui (white), and Tibetan (black).'],
    svg: svgFiveStripes() },

  { id: 'cn-blue-sky-white-sun', ns: 'china-hist', name: 'Blue Sky White Sun', g: 'h,fn,east-asia',
    title: 'Blue Sky with a White Sun Flag', ratio: '2:3',
    colors: [{ color: 'blue', hex: '#000095' }, { color: 'white', hex: '#ffffff' }, { color: 'red', hex: '#fe0000' }],
    desc: ['The Blue Sky with a White Sun on a wholly red earth (1928–1949) was the national flag of the Republic of China adopted after the Northern Expedition. It remains the flag of Taiwan (ROC).'],
    svg: svgROC() },

  { id: 'jp-tokugawa', ns: 'japan-hist', name: 'Tokugawa Shogunate', g: 'h,east-asia',
    title: 'Flag of the Tokugawa Shogunate', ratio: '2:3',
    colors: [{ color: 'white', hex: '#ffffff' }, { color: 'black', hex: '#000000' }],
    desc: ['The Tokugawa Shogunate (1603–1868) merchant ships flew a white field with horizontal black stripes. The Tokugawa mon (crest) featured a triple hollyhock.'],
    svg: svgTokugawa() },

  { id: 'jp-rising-sun-army', ns: 'japan-hist', name: 'Imperial Rising Sun (Army)', g: 'h,east-asia',
    title: 'War Flag of the Imperial Japanese Army', ratio: '2:3',
    colors: [{ color: 'white', hex: '#ffffff' }, { color: 'red', hex: '#bc002d' }],
    desc: ['The Imperial Japanese Army (1868–1945) used the Rising Sun flag with 16 rays emanating from a centred red disc on white.'],
    svg: svgRisingSun(true) },

  { id: 'jp-rising-sun-navy', ns: 'japan-hist', name: 'Imperial Rising Sun (Navy)', g: 'h,east-asia',
    title: 'Ensign of the Imperial Japanese Navy', ratio: '2:3',
    colors: [{ color: 'white', hex: '#ffffff' }, { color: 'red', hex: '#bc002d' }],
    desc: ['The Imperial Japanese Navy (1889–1945) used a Rising Sun flag with the red disc offset toward the hoist, with 16 rays.'],
    svg: svgRisingSun(false) },

  { id: 'kr-joseon', ns: 'korea-hist', name: 'Joseon Dynasty', g: 'h,east-asia',
    title: 'Royal Standard of the Joseon Dynasty', ratio: '2:3',
    colors: [{ color: 'red', hex: '#cd2e3a' }, { color: 'blue', hex: '#0047a0' }],
    desc: ['The Joseon Dynasty (1392–1897) royal standard featured a red field with the taegeuk (yin-yang) symbol and trigrams.'],
    svg: svgJoseon() },

  { id: 'kr-taegeukgi-1883', ns: 'korea-hist', name: 'Original Taegeukgi', g: 'h,fn,east-asia',
    title: 'Original Taegeukgi (1883)', ratio: '2:3',
    colors: [{ color: 'white', hex: '#ffffff' }, { color: 'red', hex: '#cd2e3a' }, { color: 'blue', hex: '#0047a0' }, { color: 'black', hex: '#000000' }],
    desc: ['The original Taegeukgi was designed in 1882 by Bak Yeong-hyo and adopted in 1883. It featured the taegeuk and four trigrams, similar to the modern Korean flag but with different proportions.'],
    svg: svgTaegeukgi() },

  // ══ SOUTHEAST ASIA HISTORICAL ══
  { id: 'vn-south', ns: 'vietnam-hist', name: 'South Vietnam', g: 'h,fn,southeast-asia',
    title: 'Flag of the Republic of Vietnam (South Vietnam)', ratio: '2:3',
    colors: [{ color: 'yellow', hex: '#ffff00' }, { color: 'red', hex: '#da251d' }],
    desc: ['The Republic of Vietnam (South Vietnam, 1955–1975) used a yellow field with three horizontal red stripes, representing the three regions of Vietnam and the people\'s blood.'],
    svg: svgSouthVietnam() },

  { id: 'vn-empire', ns: 'vietnam-hist', name: 'Empire of Vietnam', g: 'h,southeast-asia',
    title: 'Flag of the Empire of Vietnam', ratio: '2:3',
    colors: [{ color: 'yellow', hex: '#ffff00' }, { color: 'red', hex: '#da251d' }],
    desc: ['The Empire of Vietnam (March–August 1945) was a brief Japanese-proclaimed state. Its flag was yellow with a broken red quẻ ly (trigram) stripe pattern.'],
    svg: svgVietnamEmpire() },

  { id: 'id-dutch-east-indies', ns: 'indonesia-hist', name: 'Dutch East Indies', g: 'h,colonial,southeast-asia',
    title: 'Flag of the Dutch East Indies', ratio: '2:3',
    colors: [{ color: 'red', hex: '#ae1c28' }, { color: 'white', hex: '#ffffff' }, { color: 'blue', hex: '#21468b' }],
    desc: ['The Dutch East Indies (1800–1942) used the Dutch tricolour (red-white-blue). Indonesian nationalists tore off the blue stripe in protest, creating the Indonesian flag.'],
    svg: svgTricolourH('#ae1c28', '#ffffff', '#21468b') },

  { id: 'ph-katipunan', ns: 'philippines-hist', name: 'Katipunan Flag', g: 'h,southeast-asia',
    title: 'Flag of the Katipunan', ratio: '2:3',
    colors: [{ color: 'red', hex: '#ce1126' }, { color: 'white', hex: '#ffffff' }],
    desc: ['The Katipunan (1896) revolutionary flag featured a red field with a white sun and the letters K-K-K in a triangle — the symbol of the Philippine revolution against Spain.'],
    svg: svgKatipunan() },

  { id: 'ph-revolutionary', ns: 'philippines-hist', name: 'Philippine Revolutionary Flag', g: 'h,fn,southeast-asia',
    title: 'Flag of the First Philippine Republic', ratio: '1:2',
    colors: [{ color: 'blue', hex: '#0038a8' }, { color: 'red', hex: '#ce1126' }, { color: 'white', hex: '#ffffff' }, { color: 'yellow', hex: '#fcd116' }],
    desc: ['The revolutionary flag (1898) designed by Emilio Aguinaldo features a white triangle with golden sun and stars, blue and red horizontal stripes — essentially the modern Philippine flag.'],
    svg: svgPhilippineRevolutionary() },

  { id: 'th-siam-elephant', ns: 'thailand-hist', name: 'Siam White Elephant', g: 'h,fn,southeast-asia',
    title: 'Flag of Siam (White Elephant)', ratio: '2:3',
    colors: [{ color: 'red', hex: '#a51931' }, { color: 'white', hex: '#ffffff' }],
    desc: ['The Kingdom of Siam (1855–1916) used a red field with a white elephant in the centre — one of the most distinctive historical flags of Southeast Asia.'],
    svg: svgSiamElephant() },

  // ══ EUROPE HISTORICAL ══
  // France
  { id: 'fr-bourbon', ns: 'france-hist', name: 'Bourbon France', g: 'h,fn,europe',
    title: 'Flag of Bourbon France', ratio: '2:3',
    colors: [{ color: 'white', hex: '#ffffff' }],
    desc: ['The Bourbon Restoration (1815–1830) returned to the plain white flag of the Ancien Régime, abandoning the revolutionary tricolour.'],
    svg: svgBourbonFleur() },

  { id: 'fr-free-france', ns: 'france-hist', name: 'Free France', g: 'h,europe',
    title: 'Flag of Free France', ratio: '2:3',
    colors: [{ color: 'blue', hex: '#002395' }, { color: 'white', hex: '#ffffff' }, { color: 'red', hex: '#ed2939' }],
    desc: ['Free France (1940–1944) used the French tricolour with the red Cross of Lorraine superimposed, the emblem chosen by Charles de Gaulle to resist Nazi occupation.'],
    svg: svgFreeFrance() },

  // Germany
  { id: 'de-imperial', ns: 'germany-hist', name: 'Imperial Germany', g: 'h,fn,europe',
    title: 'Flag of the German Empire', ratio: '2:3',
    colors: [{ color: 'black', hex: '#000000' }, { color: 'white', hex: '#ffffff' }, { color: 'red', hex: '#dd0000' }],
    desc: ['The German Empire (1871–1919) used a black-white-red horizontal tricolour, combining the colours of Prussia (black-white) and the Hanseatic League (red-white).'],
    svg: svgTricolourH('#000000', '#ffffff', '#dd0000') },

  { id: 'de-weimar', ns: 'germany-hist', name: 'Weimar Republic', g: 'h,fn,europe',
    title: 'Flag of the Weimar Republic', ratio: '3:5',
    colors: [{ color: 'black', hex: '#000000' }, { color: 'red', hex: '#dd0000' }, { color: 'gold', hex: '#ffcc00' }],
    desc: ['The Weimar Republic (1919–1933) adopted the black-red-gold tricolour, the colours of German democratic tradition dating back to the 1848 revolutions.'],
    svg: svgTricolourH('#000000', '#dd0000', '#ffcc00') },

  { id: 'de-nazi', ns: 'germany-hist', name: 'Nazi Germany', g: 'h,fn,europe',
    title: 'Flag of Nazi Germany', ratio: '3:5',
    colors: [{ color: 'red', hex: '#dd0000' }, { color: 'white', hex: '#ffffff' }, { color: 'black', hex: '#000000' }],
    desc: ['Nazi Germany (1935–1945) used a red field with a white disc containing a black swastika (Hakenkreuz). It was the sole national flag from 1935.'],
    svg: svgNazi() },

  { id: 'de-east-germany', ns: 'germany-hist', name: 'East Germany (GDR)', g: 'h,fn,europe',
    title: 'Flag of the German Democratic Republic', ratio: '3:5',
    colors: [{ color: 'black', hex: '#000000' }, { color: 'red', hex: '#dd0000' }, { color: 'gold', hex: '#ffcc00' }],
    desc: ['East Germany (1959–1990) used the black-red-gold tricolour with a state emblem of hammer, compass, and wreath of rye — distinguishing it from the West German flag.'],
    svg: svgTricolourH('#000000', '#dd0000', '#ffcc00', svgGDRemblem()) },

  { id: 'de-west-germany', ns: 'germany-hist', name: 'West Germany', g: 'h,fn,europe',
    title: 'Flag of the Federal Republic of Germany (West)', ratio: '3:5',
    colors: [{ color: 'black', hex: '#000000' }, { color: 'red', hex: '#dd0000' }, { color: 'gold', hex: '#ffcc00' }],
    desc: ['West Germany (1949–1990) restored the plain black-red-gold tricolour of the Weimar Republic. It became the flag of reunified Germany in 1990.'],
    svg: svgTricolourH('#000000', '#dd0000', '#ffcc00') },

  // Russia
  { id: 'ru-imperial', ns: 'russia-hist', name: 'Imperial Russia', g: 'h,fn,europe',
    title: 'Flag of the Russian Empire', ratio: '2:3',
    colors: [{ color: 'black', hex: '#000000' }, { color: 'yellow', hex: '#ffcc00' }, { color: 'white', hex: '#ffffff' }],
    desc: ['The Russian Empire\'s official flag (1858–1917) was a black-yellow-white tricolour. The more familiar white-blue-red merchant flag was also widely used.'],
    svg: svgTricolourH('#000000', '#ffcc00', '#ffffff') },

  { id: 'ru-sfsr', ns: 'russia-hist', name: 'Russian SFSR', g: 'h,fn,europe',
    title: 'Flag of the Russian Soviet Federative Socialist Republic', ratio: '1:2',
    colors: [{ color: 'red', hex: '#cc0000' }, { color: 'blue', hex: '#0039a6' }],
    desc: ['The Russian SFSR (1954–1991) used a red field with a light blue stripe near the hoist and a gold hammer-sickle with star — the flag of Soviet Russia.'],
    svg: svgRSFSR() },

  { id: 'soviet-union', ns: 'russia-hist', name: 'Soviet Union', g: 'h,fn,europe',
    title: 'Flag of the Union of Soviet Socialist Republics', ratio: '1:2',
    colors: [{ color: 'red', hex: '#cc0000' }, { color: 'gold', hex: '#ffcc00' }],
    desc: ['The Soviet Union (1922–1991) used a red field with a gold hammer and sickle beneath a gold-bordered red star — one of the most recognisable political flags in history.'],
    svg: svgSoviet() },

  // Spain
  { id: 'es-republic', ns: 'spain-hist', name: 'Second Spanish Republic', g: 'h,fn,europe',
    title: 'Flag of the Second Spanish Republic', ratio: '2:3',
    colors: [{ color: 'red', hex: '#aa151b' }, { color: 'yellow', hex: '#f1bf00' }, { color: 'purple', hex: '#662d91' }],
    desc: ['The Second Spanish Republic (1931–1939) replaced the traditional red-yellow with a tricolour adding a purple stripe, representing the people of Castile.'],
    svg: svgTricolourH('#aa151b', '#f1bf00', '#662d91') },

  { id: 'es-francoist', ns: 'spain-hist', name: 'Francoist Spain', g: 'h,fn,europe',
    title: 'Flag of Francoist Spain', ratio: '2:3',
    colors: [{ color: 'red', hex: '#aa151b' }, { color: 'yellow', hex: '#f1bf00' }],
    desc: ['Francoist Spain (1938–1975) used the red-yellow-red bands with the Eagle of Saint John, a Francoist heraldic addition symbolising Catholic tradition.'],
    svg: svgBicolourH3('#aa151b', '#f1bf00', '#aa151b') },

  { id: 'es-empire', ns: 'spain-hist', name: 'Spanish Empire', g: 'h,empire,europe',
    title: 'Flag of the Spanish Empire (Cross of Burgundy)', ratio: '2:3',
    colors: [{ color: 'white', hex: '#ffffff' }, { color: 'red', hex: '#aa151b' }],
    desc: ['The Spanish Empire used the Cross of Burgundy (Cruz de Borgoña) — a red ragged saltire on white — from the 16th to 18th centuries across its global territories.'],
    svg: svgBurgundyCross() },

  // Italy
  { id: 'it-kingdom', ns: 'italy-hist', name: 'Kingdom of Italy', g: 'h,fn,europe',
    title: 'Flag of the Kingdom of Italy', ratio: '2:3',
    colors: [{ color: 'green', hex: '#008c45' }, { color: 'white', hex: '#ffffff' }, { color: 'red', hex: '#cd212a' }],
    desc: ['The Kingdom of Italy (1861–1946) used the Italian tricolour with the Savoy coat of arms (blue shield with white cross) in the centre white stripe.'],
    svg: svgTricolourV('#008c45', '#ffffff', '#cd212a', svgSavoyShield()) },

  { id: 'it-social-republic', ns: 'italy-hist', name: 'Italian Social Republic', g: 'h,fn,europe',
    title: 'Flag of the Italian Social Republic (Salò)', ratio: '2:3',
    colors: [{ color: 'green', hex: '#008c45' }, { color: 'white', hex: '#ffffff' }, { color: 'red', hex: '#cd212a' }],
    desc: ['The Italian Social Republic (1943–1945) was a German-backed fascist puppet state in northern Italy. It used the plain Italian tricolour without the Savoy arms.'],
    svg: svgTricolourV('#008c45', '#ffffff', '#cd212a') },

  // Poland
  { id: 'pl-duchy-warsaw', ns: 'poland-hist', name: 'Duchy of Warsaw', g: 'h,europe',
    title: 'Flag of the Duchy of Warsaw', ratio: '5:8',
    colors: [{ color: 'white', hex: '#ffffff' }, { color: 'red', hex: '#dc143c' }],
    desc: ['The Duchy of Warsaw (1807–1815) was a Napoleonic client state. Its flag was a white-and-crimson bicolour, establishing the Polish national colours.'],
    svg: svgBicolourH('#ffffff', '#dc143c') },

  { id: 'pl-november-uprising', ns: 'poland-hist', name: 'Polish November Uprising', g: 'h,europe',
    title: 'Flag of the Polish November Uprising', ratio: '5:8',
    colors: [{ color: 'white', hex: '#ffffff' }, { color: 'red', hex: '#dc143c' }],
    desc: ['The 1831 November Uprising flag solidified white and red as the Polish national colours. The white represented the White Eagle, red the setting sun of freedom.'],
    svg: svgBicolourH('#ffffff', '#dc143c') },

  // Greece
  { id: 'gr-independence', ns: 'greece-hist', name: 'Greek Independence Flag', g: 'h,europe',
    title: 'Flag of the Greek War of Independence', ratio: '2:3',
    colors: [{ color: 'blue', hex: '#004c98' }, { color: 'white', hex: '#ffffff' }],
    desc: ['The Greek War of Independence (1821) flag was a blue field with a white cross, the revolutionary banner that rallied Greeks against Ottoman rule.'],
    svg: svgGreekCross() },

  { id: 'gr-kingdom', ns: 'greece-hist', name: 'Greek Kingdom', g: 'h,fn,europe',
    title: 'Flag of the Kingdom of Greece', ratio: '2:3',
    colors: [{ color: 'blue', hex: '#004c98' }, { color: 'white', hex: '#ffffff' }],
    desc: ['The Kingdom of Greece (1833–1967) used nine blue and white horizontal stripes with a cross canton, topped with a royal crown.'],
    svg: svgGreekKingdom() },

  { id: 'gr-junta', ns: 'greece-hist', name: 'Greek Military Junta', g: 'h,fn,europe',
    title: 'Flag of the Greek Military Junta', ratio: '2:3',
    colors: [{ color: 'blue', hex: '#00247d' }, { color: 'white', hex: '#ffffff' }],
    desc: ['The Greek Military Junta (1967–1974) used a very dark blue version of the nine-stripe flag, stripped of the royal crown.'],
    svg: svgGreekStripes('#00247d') },

  // Turkey (already have ottoman above)
  { id: 'dannebrog', ns: 'nordic-hist', name: 'Dannebrog', g: 'h,nordic,europe',
    title: 'The Dannebrog (oldest national flag)', ratio: '28:37',
    colors: [{ color: 'red', hex: '#c8102e' }, { color: 'white', hex: '#ffffff' }],
    desc: ['The Danish Dannebrog dates to 1219, making it the oldest continuously used national flag in the world. A white Nordic cross on red, it inspired all Nordic cross flags.'],
    svg: svgNordicCross('#c8102e', '#ffffff') },

  { id: 'scotland-kingdom', ns: 'uk-hist', name: 'Kingdom of Scotland', g: 'h,europe',
    title: 'Royal Standard of Scotland', ratio: '2:3',
    colors: [{ color: 'gold', hex: '#ffd700' }, { color: 'red', hex: '#cf142b' }],
    desc: ['The Kingdom of Scotland\'s Royal Standard featured a red rampant lion on gold — one of the oldest heraldic designs in continuous use. The blue Saltire (St Andrew\'s Cross) was also used.'],
    svg: svgScotlandRoyal() },

  // ══ AMERICAS HISTORICAL ══
  { id: 'us-betsy-ross', ns: 'us-hist', name: 'Betsy Ross Flag', g: 'h,fn,north-america',
    title: 'Betsy Ross Flag (13 Stars)', ratio: '10:19',
    colors: [{ color: 'red', hex: '#b22234' }, { color: 'white', hex: '#ffffff' }, { color: 'blue', hex: '#3c3b6e' }],
    desc: ['The Betsy Ross Flag (1777–1795) featured 13 alternating red and white stripes with 13 white stars in a circle on a blue canton — the first Stars and Stripes.'],
    svg: svgBetsyRoss() },

  { id: 'us-confederate-stars-bars', ns: 'us-hist', name: 'Confederate Stars and Bars', g: 'h,north-america',
    title: 'First Flag of the Confederate States', ratio: '2:3',
    colors: [{ color: 'red', hex: '#bf0a30' }, { color: 'white', hex: '#ffffff' }, { color: 'blue', hex: '#002868' }],
    desc: ['The Confederate Stars and Bars (1861–1863) was the first official flag of the CSA, with red-white-red stripes and a blue canton with white stars in a circle.'],
    svg: svgConfederateStarsBars() },

  { id: 'us-confederate-stainless', ns: 'us-hist', name: 'Confederate Stainless Banner', g: 'h,north-america',
    title: 'Stainless Banner of the Confederate States', ratio: '1:2',
    colors: [{ color: 'white', hex: '#ffffff' }, { color: 'red', hex: '#bf0a30' }, { color: 'blue', hex: '#002868' }],
    desc: ['The Stainless Banner (1863–1865) was mostly white with the Confederate battle flag (blue saltire with stars on red) in the upper canton.'],
    svg: svgConfederateStainless() },

  // Mexico
  { id: 'mx-three-guarantees', ns: 'mexico-hist', name: 'Flag of Three Guarantees', g: 'h,fn,north-america',
    title: 'Flag of the Three Guarantees', ratio: '2:3',
    colors: [{ color: 'white', hex: '#ffffff' }, { color: 'green', hex: '#006847' }, { color: 'red', hex: '#ce1126' }],
    desc: ['The Flag of Three Guarantees (1821) used diagonal green, white, and red stripes with gold stars, representing independence, religion, and union.'],
    svg: svgThreeGuarantees() },

  { id: 'mx-empire', ns: 'mexico-hist', name: 'Mexican Empire', g: 'h,fn,north-america',
    title: 'Flag of the First Mexican Empire', ratio: '2:3',
    colors: [{ color: 'green', hex: '#006847' }, { color: 'white', hex: '#ffffff' }, { color: 'red', hex: '#ce1126' }],
    desc: ['The First Mexican Empire (1821–1823) under Iturbide used green-white-red vertical stripes with a crowned eagle on a cactus in the centre.'],
    svg: svgTricolourV('#006847', '#ffffff', '#ce1126') },

  { id: 'mx-federal-republic', ns: 'mexico-hist', name: 'Mexican Federal Republic', g: 'h,fn,north-america',
    title: 'Flag of the Mexican Federal Republic', ratio: '2:3',
    colors: [{ color: 'green', hex: '#006847' }, { color: 'white', hex: '#ffffff' }, { color: 'red', hex: '#ce1126' }],
    desc: ['The Mexican Federal Republic (1823–1864) replaced the crown with a republican eagle and serpent on the tricolour — establishing the design used to this day.'],
    svg: svgTricolourV('#006847', '#ffffff', '#ce1126') },

  // Brazil
  { id: 'br-empire', ns: 'brazil-hist', name: 'Empire of Brazil', g: 'h,fn,south-america',
    title: 'Flag of the Empire of Brazil', ratio: '7:10',
    colors: [{ color: 'green', hex: '#009c3b' }, { color: 'yellow', hex: '#ffdf00' }],
    desc: ['The Empire of Brazil (1822–1889) used a green field with a golden yellow rhombus and the imperial coat of arms — the green-and-gold design carried into the republic.'],
    svg: svgBrazilEmpire() },

  { id: 'br-provisional', ns: 'brazil-hist', name: 'Brazilian Provisional Republic', g: 'h,fn,south-america',
    title: 'Flag of the Provisional Republic of Brazil', ratio: '7:10',
    colors: [{ color: 'green', hex: '#009c3b' }, { color: 'yellow', hex: '#ffdf00' }, { color: 'blue', hex: '#002776' }],
    desc: ['The provisional flag of the Brazilian Republic (15–19 November 1889) used green and yellow stripes inspired by the US flag, lasting only four days.'],
    svg: svgBrazilProvisional() },

  // Argentina
  { id: 'ar-celeste-blanca', ns: 'argentina-hist', name: 'Argentine Celeste y Blanca', g: 'h,fn,south-america',
    title: 'First Flag of Argentina (Celeste y Blanca)', ratio: '5:8',
    colors: [{ color: 'celeste', hex: '#74acdf' }, { color: 'white', hex: '#ffffff' }],
    desc: ['The first Argentine flag (1812) was light blue (celeste) and white horizontal bands, created by Manuel Belgrano. The Sun of May was added in 1818.'],
    svg: svgTricolourH('#74acdf', '#ffffff', '#74acdf') },

  { id: 'ar-sun-of-may', ns: 'argentina-hist', name: 'Argentine Sun of May', g: 'h,fn,south-america',
    title: 'Flag of Argentina with Sun of May', ratio: '5:8',
    colors: [{ color: 'celeste', hex: '#74acdf' }, { color: 'white', hex: '#ffffff' }, { color: 'gold', hex: '#fcbf49' }],
    desc: ['The Sun of May (Sol de Mayo) was added to the Argentine flag in 1818, symbolising the May Revolution of 1810 and the Inca sun god Inti.'],
    svg: svgTricolourH('#74acdf', '#ffffff', '#74acdf', svgSunOfMay()) },

  // Cuba
  { id: 'cu-lone-star', ns: 'cuba-hist', name: 'Cuban Lone Star', g: 'h,fn,caribbean',
    title: 'Flag of Cuba (Lone Star Flag)', ratio: '1:2',
    colors: [{ color: 'blue', hex: '#002a8f' }, { color: 'white', hex: '#ffffff' }, { color: 'red', hex: '#cf142b' }],
    desc: ['The Cuban flag (designed 1850 by Teurbe Tolón) features five blue-white alternating stripes and a red triangle with a white star — used in the independence movement and kept as the national flag.'],
    svg: svgCubaLoneStar() },

  // ══ AFRICA HISTORICAL ══
  { id: 'et-imperial-lion', ns: 'ethiopia-hist', name: 'Ethiopian Imperial', g: 'h,fn,africa,horn-of-africa',
    title: 'Flag of Imperial Ethiopia (Lion of Judah)', ratio: '2:3',
    colors: [{ color: 'green', hex: '#078930' }, { color: 'yellow', hex: '#fcdd09' }, { color: 'red', hex: '#da121a' }],
    desc: ['Imperial Ethiopia (1913–1974) used the green-yellow-red tricolour with the crowned Lion of Judah, symbolising the Solomonic dynasty\'s descent from King Solomon.'],
    svg: svgEthiopiaImperial() },

  { id: 'et-derg', ns: 'ethiopia-hist', name: 'Ethiopian Derg', g: 'h,fn,africa,horn-of-africa',
    title: 'Flag of Ethiopia (Derg Period)', ratio: '2:3',
    colors: [{ color: 'green', hex: '#078930' }, { color: 'yellow', hex: '#fcdd09' }, { color: 'red', hex: '#da121a' }],
    desc: ['The Derg (1974–1987) initially used the tricolour with an uncrowned lion, then removed it entirely. The plain green-yellow-red tricolour represented the revolutionary period.'],
    svg: svgTricolourH('#078930', '#fcdd09', '#da121a') },

  { id: 'za-prinsevlag', ns: 'south-africa-hist', name: 'South Africa Prinsevlag', g: 'h,fn,africa',
    title: 'Flag of South Africa (1928–1994)', ratio: '2:3',
    colors: [{ color: 'orange', hex: '#e8712b' }, { color: 'white', hex: '#ffffff' }, { color: 'blue', hex: '#002395' }],
    desc: ['South Africa (1928–1994) used an orange-white-blue tricolour (Prinsevlag) with three small flags centred: the Union Jack, Orange Free State, and Transvaal.'],
    svg: svgPrinsevlag() },

  { id: 'gh-gold-coast', ns: 'ghana-hist', name: 'Gold Coast Colony', g: 'h,colonial,africa',
    title: 'Flag of the Gold Coast Colony', ratio: '1:2',
    colors: [{ color: 'blue', hex: '#00247d' }, { color: 'red', hex: '#cf142b' }, { color: 'white', hex: '#ffffff' }],
    desc: ['The Gold Coast Colony (1877–1957) used a British Blue Ensign defaced with a badge featuring an elephant and palm tree — predecessor to Ghana.'],
    svg: svgBlueEnsign('GC') },

  { id: 'ke-colonial', ns: 'kenya-hist', name: 'Kenya Colony', g: 'h,colonial,africa,horn-of-africa',
    title: 'Flag of the Kenya Colony', ratio: '1:2',
    colors: [{ color: 'blue', hex: '#00247d' }, { color: 'red', hex: '#cf142b' }, { color: 'white', hex: '#ffffff' }],
    desc: ['The Kenya Colony (1921–1963) used a British Blue Ensign defaced with a red lion — the colonial flag before independence.'],
    svg: svgBlueEnsign('KE') },

  // ══ COLONIAL & MANDATE ══
  { id: 'french-algeria', ns: 'colonial', name: 'French Algeria', g: 'h,colonial,maghreb',
    title: 'Flag of French Algeria', ratio: '2:3',
    colors: [{ color: 'blue', hex: '#002395' }, { color: 'white', hex: '#ffffff' }, { color: 'red', hex: '#ed2939' }],
    desc: ['French Algeria (1830–1962) was considered an integral part of France and flew the French tricolour as its official flag.'],
    svg: svgTricolourV('#002395', '#ffffff', '#ed2939') },

  { id: 'british-palestine', ns: 'colonial', name: 'British Palestine Mandate', g: 'h,colonial,levant',
    title: 'Flag of the British Mandate of Palestine', ratio: '1:2',
    colors: [{ color: 'blue', hex: '#00247d' }, { color: 'red', hex: '#cf142b' }, { color: 'white', hex: '#ffffff' }],
    desc: ['The British Mandate of Palestine (1920–1948) used a Blue Ensign defaced with a circle containing the word "Palestine" in English, Arabic, and Hebrew.'],
    svg: svgBlueEnsign('PS') },

  { id: 'french-syria', ns: 'colonial', name: 'French Mandate Syria', g: 'h,colonial,levant',
    title: 'Flag of the French Mandate of Syria', ratio: '2:3',
    colors: [{ color: 'green', hex: '#007a3d' }, { color: 'white', hex: '#ffffff' }, { color: 'blue', hex: '#002395' }],
    desc: ['The French Mandate of Syria (1920–1946) used a horizontal green-white-green flag with a French flag canton, symbolising French administrative control.'],
    svg: svgFrenchMandate('#007a3d', '#ffffff', '#007a3d') },

  { id: 'french-lebanon', ns: 'colonial', name: 'French Mandate Lebanon', g: 'h,colonial,levant',
    title: 'Flag of the French Mandate of Lebanon', ratio: '2:3',
    colors: [{ color: 'blue', hex: '#002395' }, { color: 'white', hex: '#ffffff' }, { color: 'red', hex: '#ed2939' }],
    desc: ['The French Mandate of Lebanon (1920–1943) used the French tricolour defaced with a green cedar of Lebanon in the centre white stripe.'],
    svg: svgFrenchLebanon() },

  { id: 'anglo-egyptian-sudan', ns: 'colonial', name: 'Anglo-Egyptian Sudan', g: 'h,colonial,africa',
    title: 'Flag of Anglo-Egyptian Sudan', ratio: '1:2',
    colors: [{ color: 'blue', hex: '#00247d' }, { color: 'red', hex: '#cf142b' }, { color: 'white', hex: '#ffffff' }],
    desc: ['The Anglo-Egyptian Sudan (1899–1956) was a condominium using the Union Jack and Egyptian flag together, symbolising joint British-Egyptian rule.'],
    svg: svgBlueEnsign('SD') },

  { id: 'italian-somaliland', ns: 'colonial', name: 'Italian Somaliland', g: 'h,colonial,africa,horn-of-africa',
    title: 'Flag of Italian Somaliland', ratio: '2:3',
    colors: [{ color: 'green', hex: '#008c45' }, { color: 'white', hex: '#ffffff' }, { color: 'red', hex: '#cd212a' }],
    desc: ['Italian Somaliland (1889–1960) used the Italian tricolour, representing Italian colonial rule over southern Somalia.'],
    svg: svgTricolourV('#008c45', '#ffffff', '#cd212a') },

  { id: 'british-somaliland', ns: 'colonial', name: 'British Somaliland', g: 'h,colonial,africa,horn-of-africa',
    title: 'Flag of British Somaliland', ratio: '1:2',
    colors: [{ color: 'blue', hex: '#00247d' }, { color: 'red', hex: '#cf142b' }, { color: 'white', hex: '#ffffff' }],
    desc: ['British Somaliland (1884–1960) used a Blue Ensign defaced with a crown badge — representing British rule over northern Somalia.'],
    svg: svgBlueEnsign('BS') },

  // ══ INTERNATIONAL ORGANISATIONS ══
  { id: 'united-nations', ns: 'intl', name: 'United Nations', g: 'intl',
    title: 'Flag of the United Nations', ratio: '2:3',
    colors: [{ color: 'blue', hex: '#4b92db' }, { color: 'white', hex: '#ffffff' }],
    desc: ['The United Nations flag (adopted 1947) features a white world map in azimuthal equidistant projection within olive branches on a light blue field.'],
    svg: svgUN() },

  { id: 'european-union', ns: 'intl', name: 'European Union', g: 'intl,europe',
    title: 'Flag of Europe / European Union', ratio: '2:3',
    colors: [{ color: 'blue', hex: '#003399' }, { color: 'gold', hex: '#ffcc00' }],
    desc: ['The European flag (adopted 1955 by Council of Europe, 1985 by the EU) features twelve gold stars in a circle on a blue field, symbolising unity and perfection.'],
    svg: svgEU() },

  { id: 'african-union', ns: 'intl', name: 'African Union', g: 'intl,africa',
    title: 'Flag of the African Union', ratio: '2:3',
    colors: [{ color: 'green', hex: '#009543' }, { color: 'gold', hex: '#ffcc00' }, { color: 'white', hex: '#ffffff' }],
    desc: ['The African Union flag features a green field with a gold outline of Africa surrounded by white stars and a green olive wreath border, adopted in 2010.'],
    svg: svgAU() },

  { id: 'arab-league', ns: 'intl', name: 'Arab League', g: 'intl,arab',
    title: 'Flag of the League of Arab States', ratio: '2:3',
    colors: [{ color: 'green', hex: '#006233' }, { color: 'gold', hex: '#ffd700' }],
    desc: ['The Arab League flag features a green field with a gold crescent, chain link, Arabic script for the League\'s name, and a wreath of laurels.'],
    svg: svgArabLeague() },

  { id: 'nato', ns: 'intl', name: 'NATO', g: 'intl',
    title: 'Flag of the North Atlantic Treaty Organization', ratio: '3:4',
    colors: [{ color: 'blue', hex: '#004990' }, { color: 'white', hex: '#ffffff' }],
    desc: ['The NATO flag features a dark blue field with a white compass rose symbolising the direction of peace. Adopted in 1953.'],
    svg: svgNATO() },

  { id: 'olympic', ns: 'intl', name: 'Olympic Flag', g: 'intl',
    title: 'The Olympic Flag', ratio: '2:3',
    colors: [{ color: 'white', hex: '#ffffff' }, { color: 'blue', hex: '#0081c8' }, { color: 'yellow', hex: '#fcb131' }, { color: 'black', hex: '#000000' }, { color: 'green', hex: '#00a651' }, { color: 'red', hex: '#ee334e' }],
    desc: ['The Olympic flag (designed 1913 by Pierre de Coubertin) features five interlocking rings on white, representing the five participating continents.'],
    svg: svgOlympic() },

  { id: 'red-cross', ns: 'intl', name: 'Red Cross / Red Crescent', g: 'intl',
    title: 'Emblems of the International Red Cross and Red Crescent Movement', ratio: '1:1',
    colors: [{ color: 'white', hex: '#ffffff' }, { color: 'red', hex: '#ff0000' }],
    desc: ['The Red Cross (1863) and Red Crescent (1876) emblems are protected symbols of humanitarian neutrality. The crystal (2005) serves as a third emblem.'],
    svg: svgRedCross() },

  { id: 'asean', ns: 'intl', name: 'ASEAN', g: 'intl,southeast-asia',
    title: 'Flag of ASEAN', ratio: '2:3',
    colors: [{ color: 'blue', hex: '#003f87' }, { color: 'red', hex: '#ed1c24' }, { color: 'white', hex: '#ffffff' }, { color: 'yellow', hex: '#f5cf00' }],
    desc: ['The ASEAN flag features a blue field with a red circle containing a stylised rice plant motif, representing the ten member states of Southeast Asia.'],
    svg: svgASEAN() },

  { id: 'commonwealth', ns: 'intl', name: 'Commonwealth of Nations', g: 'intl',
    title: 'Flag of the Commonwealth of Nations', ratio: '2:3',
    colors: [{ color: 'blue', hex: '#00247d' }, { color: 'gold', hex: '#ffd700' }],
    desc: ['The Commonwealth of Nations flag features a gold globe surrounded by radiating spearhead shapes on a blue field, symbolising global cooperation.'],
    svg: svgCommonwealth() },

  { id: 'oic', ns: 'intl', name: 'Organisation of Islamic Cooperation', g: 'intl,arab',
    title: 'Flag of the Organisation of Islamic Cooperation', ratio: '2:3',
    colors: [{ color: 'green', hex: '#006233' }, { color: 'white', hex: '#ffffff' }, { color: 'red', hex: '#ce1126' }],
    desc: ['The OIC flag features a green field with a red crescent and the Kaaba silhouette, representing the 57 member states of the Organisation of Islamic Cooperation.'],
    svg: svgOIC() },

  { id: 'gcc', ns: 'intl', name: 'Gulf Cooperation Council', g: 'intl,gulf',
    title: 'Flag of the Gulf Cooperation Council', ratio: '2:3',
    colors: [{ color: 'blue', hex: '#004990' }, { color: 'gold', hex: '#ffd700' }],
    desc: ['The GCC flag features a gold emblem on dark blue, representing the six Gulf states: Saudi Arabia, Kuwait, UAE, Qatar, Bahrain, and Oman.'],
    svg: svgSolid('#004990') },

  // ══ PAN-MOVEMENT & IDENTITY ══
  { id: 'pan-african', ns: 'movements', name: 'Pan-African Flag', g: 'pan,africa',
    title: 'Pan-African Flag (UNIA Flag)', ratio: '2:3',
    colors: [{ color: 'red', hex: '#e40010' }, { color: 'black', hex: '#000000' }, { color: 'green', hex: '#00853f' }],
    desc: ['The Pan-African flag (1920) was designed by Marcus Garvey with red (blood), black (people), and green (land). It inspired many African national flags.'],
    svg: svgTricolourH('#e40010', '#000000', '#00853f') },

  { id: 'pan-slavic', ns: 'movements', name: 'Pan-Slavic Flag', g: 'pan,europe',
    title: 'Pan-Slavic Flag', ratio: '2:3',
    colors: [{ color: 'blue', hex: '#0051a5' }, { color: 'white', hex: '#ffffff' }, { color: 'red', hex: '#ce1126' }],
    desc: ['The Pan-Slavic flag (1848) uses blue, white, and red — the colours of the Pan-Slavic movement. It influenced the flags of many Slavic nations.'],
    svg: svgTricolourH('#0051a5', '#ffffff', '#ce1126') },

  { id: 'amazigh', ns: 'movements', name: 'Amazigh (Berber) Flag', g: 'pan,maghreb',
    title: 'Flag of the Amazigh (Berber) People', ratio: '2:3',
    colors: [{ color: 'blue', hex: '#0067b0' }, { color: 'green', hex: '#007e3a' }, { color: 'yellow', hex: '#ffc200' }, { color: 'red', hex: '#ed1c24' }],
    desc: ['The Amazigh flag features blue (sea), green (mountains), and yellow (desert) stripes with a red yaz (ⵣ) symbol — representing the Berber identity across North Africa.'],
    svg: svgAmazigh() },

  { id: 'kurdish', ns: 'movements', name: 'Kurdish Flag', g: 'pan,levant',
    title: 'Flag of Kurdistan', ratio: '2:3',
    colors: [{ color: 'red', hex: '#ed1c24' }, { color: 'white', hex: '#ffffff' }, { color: 'green', hex: '#009639' }, { color: 'yellow', hex: '#ffc200' }],
    desc: ['The Kurdish flag features red, white, and green stripes with a golden sun disc in the centre — representing the Kurdish people across Iraq, Syria, Turkey, and Iran.'],
    svg: svgKurdish() },

  { id: 'romani', ns: 'movements', name: 'Romani Flag', g: 'pan',
    title: 'Flag of the Romani People', ratio: '2:3',
    colors: [{ color: 'blue', hex: '#0033a0' }, { color: 'green', hex: '#009739' }, { color: 'red', hex: '#ce1126' }],
    desc: ['The Romani flag (adopted 1971) features blue (sky/heaven) and green (earth/nature) halves with a red chakra wheel in the centre.'],
    svg: svgRomani() },

  { id: 'tibetan', ns: 'movements', name: 'Tibetan Flag', g: 'pan,asia',
    title: 'Flag of Tibet (Snow Lion Flag)', ratio: '2:3',
    colors: [{ color: 'white', hex: '#ffffff' }, { color: 'blue', hex: '#00247d' }, { color: 'red', hex: '#ce1126' }, { color: 'yellow', hex: '#ffd700' }],
    desc: ['The Tibetan flag features a snow mountain with two snow lions, a sun, and alternating red and blue rays. Banned in China, it represents Tibetan independence.'],
    svg: svgTibetan() },

  { id: 'catalan', ns: 'movements', name: 'Catalan Senyera', g: 'pan,europe',
    title: 'The Senyera (Flag of Catalonia)', ratio: '2:3',
    colors: [{ color: 'yellow', hex: '#fcdd09' }, { color: 'red', hex: '#da121a' }],
    desc: ['The Senyera is one of the oldest flags in Europe (9th century), featuring four red stripes on gold. It is the official flag of Catalonia, Aragon, and the Balearic Islands.'],
    svg: svgSenyera() },

  // ══ PRIDE & SOCIAL MOVEMENT ══
  { id: 'pride-rainbow', ns: 'pride', name: 'Rainbow Pride Flag', g: 'pride',
    title: 'Rainbow Pride Flag', ratio: '2:3',
    colors: [{ color: 'red', hex: '#e40303' }, { color: 'orange', hex: '#ff8c00' }, { color: 'yellow', hex: '#ffed00' }, { color: 'green', hex: '#008026' }, { color: 'blue', hex: '#004dff' }, { color: 'violet', hex: '#750787' }],
    desc: ['The Rainbow Pride Flag (1978) was designed by Gilbert Baker. The six stripes represent life (red), healing (orange), sunlight (yellow), nature (green), serenity (blue), and spirit (violet).'],
    svg: svgRainbow() },

  { id: 'pride-progress', ns: 'pride', name: 'Progress Pride Flag', g: 'pride',
    title: 'Progress Pride Flag', ratio: '2:3',
    colors: [{ color: 'red', hex: '#e40303' }, { color: 'white', hex: '#ffffff' }, { color: 'pink', hex: '#ffafc8' }, { color: 'light blue', hex: '#74d7ee' }, { color: 'brown', hex: '#613915' }, { color: 'black', hex: '#000000' }],
    desc: ['The Progress Pride Flag (2018, Daniel Quasar) adds a chevron of black, brown, light blue, pink, and white to the rainbow, representing people of colour and transgender people.'],
    svg: svgProgressPride() },

  { id: 'pride-trans', ns: 'pride', name: 'Transgender Pride Flag', g: 'pride',
    title: 'Transgender Pride Flag', ratio: '2:3',
    colors: [{ color: 'light blue', hex: '#5bcefa' }, { color: 'pink', hex: '#f5a9b8' }, { color: 'white', hex: '#ffffff' }],
    desc: ['The Transgender Pride Flag (1999, Monica Helms) features light blue, pink, and white stripes. The symmetry means no matter how you fly it, it is always correct.'],
    svg: svgFiveStripesCustom('#5bcefa', '#f5a9b8', '#ffffff', '#f5a9b8', '#5bcefa') },

  // ══ MARITIME & SIGNAL ══
  { id: 'jolly-roger', ns: 'maritime', name: 'Jolly Roger', g: 'maritime,h',
    title: 'The Jolly Roger (Pirate Flag)', ratio: '2:3',
    colors: [{ color: 'black', hex: '#000000' }, { color: 'white', hex: '#ffffff' }],
    desc: ['The Jolly Roger was the pirate flag of the Golden Age of Piracy (early 18th century). The skull and crossbones warned merchant ships to surrender or face no mercy.'],
    svg: svgJollyRoger() },

  { id: 'white-ensign', ns: 'maritime', name: 'White Ensign', g: 'maritime',
    title: 'White Ensign of the Royal Navy', ratio: '1:2',
    colors: [{ color: 'white', hex: '#ffffff' }, { color: 'red', hex: '#cf142b' }, { color: 'blue', hex: '#00247d' }],
    desc: ['The White Ensign (St George\'s Ensign) is flown by the Royal Navy and affiliated organisations. It features the St George\'s Cross with a Union Jack canton.'],
    svg: svgWhiteEnsign() },

  { id: 'red-ensign', ns: 'maritime', name: 'Red Ensign', g: 'maritime',
    title: 'Red Ensign of the British Merchant Navy', ratio: '1:2',
    colors: [{ color: 'red', hex: '#cf142b' }, { color: 'blue', hex: '#00247d' }, { color: 'white', hex: '#ffffff' }],
    desc: ['The Red Ensign (Red Duster) is the civil ensign of the United Kingdom, flown by British merchant ships. Many colonial flags were based on it.'],
    svg: svgRedEnsign() },

  { id: 'signal-flags', ns: 'maritime', name: 'International Signal Flags', g: 'maritime',
    title: 'International Maritime Signal Flags', ratio: '1:1',
    colors: [],
    desc: ['The International Code of Signals uses 26 letter flags, 10 numeral pennants, and 3 substitute pennants. Each flag represents a letter and has a specific meaning when flown alone.'],
    svg: svgSignalFlags() },

  // ══ SUB-NATIONAL ══
  { id: 'texas', ns: 'us-states', name: 'Texas', g: 'sub,north-america',
    title: 'Flag of Texas (Lone Star)', ratio: '2:3',
    colors: [{ color: 'blue', hex: '#002868' }, { color: 'white', hex: '#ffffff' }, { color: 'red', hex: '#bf0a30' }],
    desc: ['The Texas Lone Star flag (1839) features a vertical blue stripe with a white star, and horizontal white and red stripes. One of the most iconic US state flags.'],
    svg: svgTexas() },

  { id: 'hawaii', ns: 'us-states', name: 'Hawaii', g: 'sub,north-america,oceania',
    title: 'Flag of Hawaii', ratio: '1:2',
    colors: [{ color: 'blue', hex: '#00247d' }, { color: 'red', hex: '#cf142b' }, { color: 'white', hex: '#ffffff' }],
    desc: ['The Hawaiian flag uniquely features the Union Jack in its canton — the only US state flag to include the flag of a foreign country, reflecting Hawaii\'s historical ties to Britain.'],
    svg: svgHawaii() },

  { id: 'puerto-rico', ns: 'us-states', name: 'Puerto Rico', g: 'sub,caribbean',
    title: 'Flag of Puerto Rico', ratio: '2:3',
    colors: [{ color: 'red', hex: '#ce1126' }, { color: 'white', hex: '#ffffff' }, { color: 'blue', hex: '#0050a0' }],
    desc: ['The Puerto Rican flag (1895) features five red-white alternating stripes with a blue triangle and white star — mirroring the Cuban flag with reversed colours.'],
    svg: svgPuertoRico() },

  { id: 'washington-dc', ns: 'us-states', name: 'Washington D.C.', g: 'sub,north-america',
    title: 'Flag of the District of Columbia', ratio: '10:19',
    colors: [{ color: 'white', hex: '#ffffff' }, { color: 'red', hex: '#bf0a30' }],
    desc: ['The Washington D.C. flag features two red horizontal stripes and three red stars on white, based on George Washington\'s family coat of arms.'],
    svg: svgDC() },

  { id: 'quebec', ns: 'canada-sub', name: 'Quebec', g: 'sub,north-america',
    title: 'Flag of Quebec (Fleurdelisé)', ratio: '2:3',
    colors: [{ color: 'blue', hex: '#003da5' }, { color: 'white', hex: '#ffffff' }],
    desc: ['The Fleurdelisé (1948) features a white cross on blue with four white fleurs-de-lis. It represents Quebec\'s French heritage and Catholic roots.'],
    svg: svgQuebec() },

  { id: 'scotland', ns: 'uk-sub', name: 'Scotland (Saltire)', g: 'sub,europe',
    title: 'Flag of Scotland (St Andrew\'s Cross)', ratio: '3:5',
    colors: [{ color: 'blue', hex: '#005eb8' }, { color: 'white', hex: '#ffffff' }],
    desc: ['The Saltire (St Andrew\'s Cross) is a white diagonal cross on blue. Dating to the 9th century, it may be the oldest flag in continuous use in the world after the Dannebrog.'],
    svg: svgSaltire() },

  { id: 'wales', ns: 'uk-sub', name: 'Wales', g: 'sub,europe',
    title: 'Flag of Wales (Y Ddraig Goch)', ratio: '3:5',
    colors: [{ color: 'white', hex: '#ffffff' }, { color: 'green', hex: '#00ab39' }, { color: 'red', hex: '#d4003c' }],
    desc: ['The Welsh flag features a red dragon (Y Ddraig Goch) on a white-over-green field. Notably, Wales is not represented in the Union Jack.'],
    svg: svgWales() },

  { id: 'england', ns: 'uk-sub', name: 'England', g: 'sub,europe',
    title: 'Flag of England (St George\'s Cross)', ratio: '3:5',
    colors: [{ color: 'white', hex: '#ffffff' }, { color: 'red', hex: '#ce1124' }],
    desc: ['The St George\'s Cross is a red cross on a white field, used since the medieval period. It forms the dominant element of the Union Jack.'],
    svg: svgStGeorgeCross() },
];

// ══════════════════════════════════════════════════════════════════
// SVG GENERATORS
// ══════════════════════════════════════════════════════════════════

function svgWrap(w, h, inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">\n${inner}\n</svg>`;
}

function svgSolid(color, border) {
  let s = `<rect width="1200" height="800" fill="${color}"/>`;
  if (border) s += `\n<rect width="1200" height="800" fill="none" stroke="${border}" stroke-width="2"/>`;
  return svgWrap(1200, 800, s);
}

function svgBicolourH(c1, c2) {
  return svgWrap(1200, 800, `<rect width="1200" height="400" fill="${c1}"/><rect y="400" width="1200" height="400" fill="${c2}"/>`);
}

function svgBicolourV(c1, c2) {
  return svgWrap(1200, 800, `<rect width="600" height="800" fill="${c1}"/><rect x="600" width="600" height="800" fill="${c2}"/>`);
}

function svgBicolourH3(c1, c2, c3) {
  return svgWrap(1200, 800, `<rect width="1200" height="200" fill="${c1}"/><rect y="200" width="1200" height="400" fill="${c2}"/><rect y="600" width="1200" height="200" fill="${c3}"/>`);
}

function svgTricolourH(c1, c2, c3, emblem) {
  let s = `<rect width="1200" height="267" fill="${c1}"/><rect y="267" width="1200" height="266" fill="${c2}"/><rect y="533" width="1200" height="267" fill="${c3}"/>`;
  if (emblem) s += emblem;
  return svgWrap(1200, 800, s);
}

function svgTricolourV(c1, c2, c3, emblem) {
  let s = `<rect width="400" height="800" fill="${c1}"/><rect x="400" width="400" height="800" fill="${c2}"/><rect x="800" width="400" height="800" fill="${c3}"/>`;
  if (emblem) s += emblem;
  return svgWrap(1200, 800, s);
}

function svgFiveStripes() {
  return svgWrap(1200, 800, `<rect width="1200" height="160" fill="#de2910"/><rect y="160" width="1200" height="160" fill="#ffde00"/><rect y="320" width="1200" height="160" fill="#0000cd"/><rect y="480" width="1200" height="160" fill="#ffffff"/><rect y="640" width="1200" height="160" fill="#000000"/>`);
}

function svgFiveStripesCustom(c1,c2,c3,c4,c5) {
  return svgWrap(1200, 800, `<rect width="1200" height="160" fill="${c1}"/><rect y="160" width="1200" height="160" fill="${c2}"/><rect y="320" width="1200" height="160" fill="${c3}"/><rect y="480" width="1200" height="160" fill="${c4}"/><rect y="640" width="1200" height="160" fill="${c5}"/>`);
}

function svgCrescentStar(bg, fg) {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="${bg}"/><circle cx="560" cy="400" r="180" fill="${fg}"/><circle cx="610" cy="400" r="150" fill="${bg}"/><polygon points="700,320 718,374 775,374 728,406 746,460 700,428 654,460 672,406 625,374 682,374" fill="${fg}"/>`);
}

function svgStar(fill) {
  return `<polygon points="600,310 620,370 680,370 630,405 650,465 600,430 550,465 570,405 520,370 580,370" fill="${fill}"/>`;
}

function svgSunOfMay() {
  let s = '<g transform="translate(600,400)">';
  s += '<circle r="60" fill="#fcbf49"/>';
  for (let i = 0; i < 32; i++) {
    const a = (i * 360 / 32) * Math.PI / 180;
    const len = i % 2 === 0 ? 100 : 70;
    s += `<line x1="0" y1="0" x2="${Math.cos(a)*len}" y2="${Math.sin(a)*len}" stroke="#fcbf49" stroke-width="${i%2===0?4:2}"/>`;
  }
  s += '<circle r="40" fill="#fcbf49"/>';
  s += '<circle r="25" fill="#fcbf49" stroke="#8b6914" stroke-width="1.5"/>';
  s += '</g>';
  return s;
}

function svgCharkha() {
  return '<g transform="translate(600,400)"><circle r="60" fill="none" stroke="#000080" stroke-width="3"/><line x1="0" y1="-60" x2="0" y2="60" stroke="#000080" stroke-width="2"/><circle r="8" fill="#000080"/></g>';
}

function svgLionSun() {
  return '<g transform="translate(600,400)"><circle r="50" fill="#ffd700" opacity="0.6"/><text x="0" y="15" text-anchor="middle" font-size="60" fill="#c8102e">☼</text></g>';
}

function svgGDRemblem() {
  return '<g transform="translate(600,400)"><circle r="55" fill="none" stroke="#ffcc00" stroke-width="3"/><text x="0" y="12" text-anchor="middle" font-size="40" fill="#ffcc00">☭</text></g>';
}

function svgSavoyShield() {
  return '<g transform="translate(600,400)"><rect x="-25" y="-30" width="50" height="60" rx="5" fill="#003399"/><line x1="-25" y1="0" x2="25" y2="0" stroke="#fff" stroke-width="8"/><line x1="0" y1="-30" x2="0" y2="30" stroke="#fff" stroke-width="8"/></g>';
}

// Complex flag SVGs
function svgOttoman() {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="#e30a17"/><circle cx="520" cy="400" r="200" fill="#fff"/><circle cx="570" cy="400" r="160" fill="#e30a17"/><polygon points="720,310 740,370 800,370 750,408 770,468 720,430 670,468 690,408 640,370 700,370" fill="#fff"/>`);
}

function svgOttomanEarly() {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="#e30a17"/><circle cx="600" cy="400" r="200" fill="#006233"/><circle cx="580" cy="340" r="50" fill="none" stroke="#ffd700" stroke-width="3"/><circle cx="620" cy="340" r="50" fill="none" stroke="#ffd700" stroke-width="3"/><circle cx="600" cy="400" r="50" fill="none" stroke="#ffd700" stroke-width="3"/>`);
}

function svgMughal() {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="#006233"/><circle cx="600" cy="400" r="200" fill="#ffd700" opacity="0.3"/><circle cx="600" cy="350" r="80" fill="#ffd700" opacity="0.5"/><text x="600" y="450" text-anchor="middle" font-size="120" fill="#ffd700">☼</text>`);
}

function svgAlmohad() {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="#c1272d"/><rect x="440" y="240" width="320" height="320" fill="#ffd700"/><rect x="480" y="280" width="80" height="80" fill="#c1272d"/><rect x="640" y="280" width="80" height="80" fill="#c1272d"/><rect x="480" y="440" width="80" height="80" fill="#c1272d"/><rect x="640" y="440" width="80" height="80" fill="#c1272d"/>`);
}

function svgSolidWithEagle(bg, fg) {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="${bg}"/><g transform="translate(600,400)" fill="${fg}"><path d="M0-120 L30-60 60-80 40-20 80-10 40 20 60 80 0 50 -60 80 -40 20 -80-10 -40-20 -60-80 -30-60z" opacity="0.7"/></g>`);
}

function svgRoman() {
  return svgWrap(900, 1200, `<rect width="900" height="1200" fill="#8b0000"/><rect x="250" y="50" width="400" height="60" fill="#ffd700"/><rect x="430" y="50" width="40" height="1100" fill="#8b6914"/><text x="450" y="600" text-anchor="middle" font-family="serif" font-size="120" fill="#ffd700">SPQR</text>`);
}

function svgByzantine() {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="#ffd700"/><g transform="translate(600,400)" fill="#6a0dad"><path d="M-100-80 L-60-40 -100 0 -60 40 -100 80 -40 60 0 100 40 60 100 80 60 40 100 0 60-40 100-80 40-60 0-100 -40-60z" opacity="0.8"/></g>`);
}

function svgHRE() {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="#ffd700"/><g transform="translate(600,400)" fill="#000"><path d="M-100-80 L-60-40 -100 0 -60 40 -100 80 -40 60 0 100 40 60 100 80 60 40 100 0 60-40 100-80 40-60 0-100 -40-60z" opacity="0.85"/></g>`);
}

function svgMongol() {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="#fff"/><rect width="1200" height="800" fill="none" stroke="#ccc" stroke-width="2"/><g transform="translate(600,400)"><line x1="0" y1="-250" x2="0" y2="250" stroke="#000" stroke-width="8"/><circle cy="-200" r="20" fill="#000"/>${[...Array(9)].map((_,i)=>`<path d="M0,${-150+i*40} Q${i%2?30:-30},${-130+i*40} 0,${-110+i*40}" stroke="#000" stroke-width="3" fill="none"/>`).join('')}</g>`);
}

function svgAchaemenid() {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="#702963"/><g transform="translate(600,400)" fill="#ffd700"><rect x="-150" y="-80" width="300" height="160" rx="10"/><polygon points="0,-120 20,-80 -20,-80"/><polygon points="-120,-20 -80,-40 -80,0"/><polygon points="120,-20 80,-40 80,0"/></g>`);
}

function svgJerusalem() {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="#fff"/><rect width="1200" height="800" fill="none" stroke="#ccc" stroke-width="2"/><g transform="translate(600,400)" fill="none" stroke="#ffd700" stroke-width="12"><line x1="0" y1="-180" x2="0" y2="180"/><line x1="-240" y1="0" x2="240" y2="0"/><line x1="-120" y1="-100" x2="-120" y2="100"/><line x1="120" y1="-100" x2="120" y2="100"/><line x1="-60" y1="-100" x2="60" y2="-100"/><line x1="-60" y1="100" x2="60" y2="100"/></g>`);
}

function svgVenice() {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="#cc0000"/><g transform="translate(300,400)"><rect x="-80" y="-200" width="160" height="400" fill="#ffd700" rx="10"/><text x="0" y="20" text-anchor="middle" font-size="200" fill="#cc0000">☧</text></g>`);
}

function svgQajar() {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="#fff"/><rect width="1200" height="267" fill="#239f40"/><rect y="533" width="1200" height="267" fill="#da0000"/>${svgLionSun()}`);
}

function svgSouthYemen() {
  return svgWrap(1200, 800, `<rect width="1200" height="267" fill="#ce1126"/><rect y="267" width="1200" height="266" fill="#fff"/><rect y="533" width="1200" height="267" fill="#000"/><polygon points="0,0 350,400 0,800" fill="#0035ad"/><polygon points="100,400 140,360 160,385 180,360 140,400 180,440 160,415 140,440" fill="#ce1126"/>`);
}

function svgHejaz() {
  return svgWrap(1200, 800, `<rect width="1200" height="267" fill="#000"/><rect y="267" width="1200" height="266" fill="#009736"/><rect y="533" width="1200" height="267" fill="#fff"/><polygon points="0,0 400,400 0,800" fill="#ce1126"/>`);
}

function svgHatay() {
  return svgWrap(1200, 800, `<rect width="1200" height="267" fill="#e30a17"/><rect y="267" width="1200" height="266" fill="#fff"/><rect y="533" width="1200" height="267" fill="#e30a17"/><polygon points="550,360 570,400 550,440 590,420 610,440 590,400 610,360 590,380" fill="#e30a17"/>`);
}

function svgLibyaUnited() {
  return svgWrap(1200, 800, `<rect width="1200" height="200" fill="#e70013"/><rect y="200" width="1200" height="400" fill="#000"/><rect y="600" width="1200" height="200" fill="#009639"/><circle cx="600" cy="400" r="100" fill="none" stroke="#fff" stroke-width="0"/><circle cx="580" cy="400" r="80" fill="#fff"/><circle cx="610" cy="400" r="65" fill="#000"/><polygon points="680,340 695,380 735,380 702,405 715,445 680,420 645,445 658,405 625,380 665,380" fill="#fff"/>`);
}

function svgBD1971() {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="#006a4e"/><circle cx="550" cy="400" r="220" fill="#f42a41"/><g transform="translate(550,400) scale(0.6)" fill="#ffd700"><path d="M-100,-50 L-70,-30 -120,0 -70,30 -100,50 -60,40 -30,80 0,40 30,80 60,40 100,50 70,30 120,0 70,-30 100,-50 60,-40 30,-80 0,-40 -30,-80 -60,-40z"/></g>`);
}

function svgQingDragon() {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="#ffde00"/><g transform="translate(600,400) scale(2)" fill="#0000cd" opacity="0.7"><path d="M-80,-30 C-60,-60 -20,-80 20,-60 C40,-50 60,-40 80,-60 C60,-20 80,20 60,40 C40,60 20,40 0,60 C-20,40 -40,60 -60,40 C-80,20 -60,-20 -80,-30z"/></g><circle cx="750" cy="300" r="30" fill="#ce1126"/>`);
}

function svgROC() {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="#fe0000"/><rect width="600" height="400" fill="#000095"/><circle cx="300" cy="200" r="100" fill="#fff"/><circle cx="300" cy="200" r="60" fill="#000095"/>${[...Array(12)].map((_,i)=>{const a=i*30*Math.PI/180;return `<line x1="${300+Math.cos(a)*65}" y1="${200+Math.sin(a)*65}" x2="${300+Math.cos(a)*95}" y2="${200+Math.sin(a)*95}" stroke="#fff" stroke-width="8"/>`}).join('')}`);
}

function svgTokugawa() {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="#fff"/><rect width="1200" height="800" fill="none" stroke="#ccc" stroke-width="2"/><rect y="300" width="1200" height="80" fill="#000"/><rect y="420" width="1200" height="80" fill="#000"/>`);
}

function svgRisingSun(centered) {
  const cx = centered ? 600 : 420;
  let s = `<rect width="1200" height="800" fill="#fff"/>`;
  for (let i = 0; i < 16; i++) {
    const a = (i * 22.5) * Math.PI / 180;
    const x = cx + Math.cos(a) * 800;
    const y = 400 + Math.sin(a) * 800;
    const a2 = ((i + 0.5) * 22.5) * Math.PI / 180;
    const x2 = cx + Math.cos(a2) * 800;
    const y2 = 400 + Math.sin(a2) * 800;
    s += `<polygon points="${cx},400 ${x},${y} ${x2},${y2}" fill="#bc002d"/>`;
  }
  s += `<circle cx="${cx}" cy="400" r="120" fill="#bc002d"/>`;
  return svgWrap(1200, 800, s);
}

function svgJoseon() {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="#cd2e3a"/><circle cx="600" cy="400" r="150" fill="#0047a0"/><path d="M450,400 Q600,200 750,400" fill="#cd2e3a"/>`);
}

function svgTaegeukgi() {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="#fff"/><rect width="1200" height="800" fill="none" stroke="#ccc" stroke-width="2"/><circle cx="600" cy="400" r="150" fill="#0047a0"/><path d="M450,400 Q600,200 750,400" fill="#cd2e3a"/><g stroke="#000" stroke-width="14" fill="none"><line x1="380" y1="200" x2="440" y2="260"/><line x1="400" y1="180" x2="460" y2="240"/><line x1="760" y1="540" x2="820" y2="600"/><line x1="740" y1="560" x2="800" y2="620"/></g>`);
}

function svgSouthVietnam() {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="#ffff00"/><rect y="280" width="1200" height="48" fill="#da251d"/><rect y="376" width="1200" height="48" fill="#da251d"/><rect y="472" width="1200" height="48" fill="#da251d"/>`);
}

function svgVietnamEmpire() {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="#ffff00"/><rect y="320" width="1200" height="40" fill="#da251d"/><rect y="440" width="1200" height="40" fill="#da251d"/>`);
}

function svgKatipunan() {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="#ce1126"/><g transform="translate(600,400)" fill="#fff"><circle r="200" fill="none" stroke="#fff" stroke-width="3"/><text y="20" text-anchor="middle" font-size="180" font-weight="bold">KKK</text></g>`);
}

function svgPhilippineRevolutionary() {
  return svgWrap(1200, 800, `<rect width="1200" height="400" fill="#0038a8"/><rect y="400" width="1200" height="400" fill="#ce1126"/><polygon points="0,0 500,400 0,800" fill="#fff"/><circle cx="170" cy="400" r="50" fill="#fcd116"/>${[...Array(8)].map((_,i)=>{const a=i*45*Math.PI/180;return`<line x1="${170+Math.cos(a)*55}" y1="${400+Math.sin(a)*55}" x2="${170+Math.cos(a)*80}" y2="${400+Math.sin(a)*80}" stroke="#fcd116" stroke-width="4"/>`}).join('')}`);
}

function svgSiamElephant() {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="#a51931"/><g transform="translate(600,400)" fill="#fff"><ellipse rx="180" ry="150"/><ellipse cx="-100" cy="-80" rx="50" ry="70"/><ellipse cx="100" cy="-80" rx="50" ry="70"/><rect x="-60" y="90" width="30" height="80" rx="10"/><rect x="30" y="90" width="30" height="80" rx="10"/><path d="M-130,0 Q-180,-30 -170,40" stroke="#fff" stroke-width="8" fill="none"/></g>`);
}

function svgBourbonFleur() {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="#fff"/><rect width="1200" height="800" fill="none" stroke="#ccc" stroke-width="2"/><g transform="translate(600,400)" fill="#ffd700" opacity="0.3"><text y="40" text-anchor="middle" font-size="200">⚜</text></g>`);
}

function svgFreeFrance() {
  return svgWrap(1200, 800, `<rect width="400" height="800" fill="#002395"/><rect x="400" width="400" height="800" fill="#fff"/><rect x="800" width="400" height="800" fill="#ed2939"/><g transform="translate(600,400)" fill="#ed2939"><rect x="-8" y="-180" width="16" height="360"/><rect x="-80" y="-80" width="160" height="16"/><rect x="-50" y="60" width="100" height="16"/></g>`);
}

function svgNazi() {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="#dd0000"/><circle cx="600" cy="400" r="200" fill="#fff"/><g transform="translate(600,400) rotate(45)" fill="#000"><rect x="-120" y="-20" width="240" height="40"/><rect x="-20" y="-120" width="40" height="240"/><rect x="-120" y="-20" width="40" height="40"/><rect x="80" y="-20" width="40" height="40"/><rect x="-20" y="-120" width="40" height="40"/><rect x="-20" y="80" width="40" height="40"/></g>`);
}

function svgRSFSR() {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="#cc0000"/><rect y="0" width="120" height="800" fill="#0039a6"/><g transform="translate(180,80)" fill="#ffcc00"><polygon points="30,0 38,22 62,22 42,36 50,58 30,44 10,58 18,36 -2,22 22,22"/></g>`);
}

function svgSoviet() {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="#cc0000"/><g transform="translate(250,150)" fill="#ffcc00"><text font-size="150">☭</text></g><g transform="translate(380,100)" fill="#ffcc00"><polygon points="30,0 38,22 62,22 42,36 50,58 30,44 10,58 18,36 -2,22 22,22"/></g>`);
}

function svgBurgundyCross() {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="#fff"/><g stroke="#aa151b" stroke-width="40" fill="none" stroke-linecap="round"><line x1="100" y1="100" x2="1100" y2="700"/><line x1="1100" y1="100" x2="100" y2="700"/></g>`);
}

function svgGreekCross() {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="#004c98"/><rect x="440" width="320" height="800" fill="#fff"/><rect y="240" width="1200" height="320" fill="#fff"/><rect x="440" y="240" width="320" height="320" fill="#fff"/>`);
}

function svgGreekKingdom() {
  const s = [...Array(9)].map((_, i) => `<rect y="${i * 89}" width="1200" height="89" fill="${i % 2 === 0 ? '#004c98' : '#fff'}"/>`).join('');
  return svgWrap(1200, 800, s + `<rect width="400" height="356" fill="#004c98"/><rect x="140" width="120" height="356" fill="#fff"/><rect y="118" width="400" height="120" fill="#fff"/>`);
}

function svgGreekStripes(blue) {
  const s = [...Array(9)].map((_, i) => `<rect y="${i * 89}" width="1200" height="89" fill="${i % 2 === 0 ? blue : '#fff'}"/>`).join('');
  return svgWrap(1200, 800, s + `<rect width="400" height="356" fill="${blue}"/><rect x="140" width="120" height="356" fill="#fff"/><rect y="118" width="400" height="120" fill="#fff"/>`);
}

function svgNordicCross(bg, cross) {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="${bg}"/><rect x="340" width="120" height="800" fill="${cross}"/><rect y="280" width="1200" height="240" fill="${cross}"/>`);
}

function svgScotlandRoyal() {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="#ffd700"/><g transform="translate(600,400)" fill="#cf142b" opacity="0.8"><path d="M-80,-200 C-60,-160 -100,-120 -120,-80 L-100,-40 -80,-80 -40,-60 -60,-40 0,0 60,-40 40,-60 80,-80 100,-40 120,-80 100,-120 60,-160 80,-200z" transform="scale(1.2)"/></g>`);
}

function svgBetsyRoss() {
  let s = '';
  for (let i = 0; i < 13; i++) s += `<rect y="${i * 61.5}" width="1200" height="61.5" fill="${i % 2 === 0 ? '#b22234' : '#fff'}"/>`;
  s += `<rect width="480" height="430" fill="#3c3b6e"/>`;
  for (let i = 0; i < 13; i++) {
    const a = (i * 360 / 13 - 90) * Math.PI / 180;
    const cx = 240 + Math.cos(a) * 120, cy = 215 + Math.sin(a) * 120;
    s += `<polygon points="${cx},${cy-15} ${cx+5},${cy-5} ${cx+15},${cy-5} ${cx+7},${cy+3} ${cx+10},${cy+15} ${cx},${cy+8} ${cx-10},${cy+15} ${cx-7},${cy+3} ${cx-15},${cy-5} ${cx-5},${cy-5}" fill="#fff"/>`;
  }
  return svgWrap(1200, 800, s);
}

function svgConfederateStarsBars() {
  return svgWrap(1200, 800, `<rect width="1200" height="267" fill="#bf0a30"/><rect y="267" width="1200" height="266" fill="#fff"/><rect y="533" width="1200" height="267" fill="#bf0a30"/><rect width="400" height="533" fill="#002868"/>${[...Array(7)].map((_,i)=>{const a=(i*360/7-90)*Math.PI/180;const cx=200+Math.cos(a)*100,cy=267+Math.sin(a)*100;return`<polygon points="${cx},${cy-12} ${cx+4},${cy-4} ${cx+12},${cy-4} ${cx+6},${cy+2} ${cx+8},${cy+12} ${cx},${cy+6} ${cx-8},${cy+12} ${cx-6},${cy+2} ${cx-12},${cy-4} ${cx-4},${cy-4}" fill="#fff"/>`}).join('')}`);
}

function svgConfederateStainless() {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="#fff"/><rect width="1200" height="800" fill="none" stroke="#ccc" stroke-width="2"/><g transform="translate(0,0)"><rect width="400" height="400" fill="#bf0a30"/><g stroke="#002868" stroke-width="50" fill="none"><line x1="0" y1="0" x2="400" y2="400"/><line x1="400" y1="0" x2="0" y2="400"/></g><g stroke="#fff" stroke-width="30" fill="none"><line x1="0" y1="0" x2="400" y2="400"/><line x1="400" y1="0" x2="0" y2="400"/></g></g>`);
}

function svgThreeGuarantees() {
  return svgWrap(1200, 800, `<polygon points="0,0 1200,0 0,800" fill="#006847"/><polygon points="0,0 1200,0 1200,800" fill="#fff"/><polygon points="0,800 1200,0 1200,800" fill="#ce1126"/><polygon points="560,360 576,410 630,410 588,440 604,490 560,460 516,490 532,440 490,410 544,410" fill="#ffd700"/>`);
}

function svgBrazilEmpire() {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="#009c3b"/><polygon points="600,100 1100,400 600,700 100,400" fill="#ffdf00"/><circle cx="600" cy="400" r="120" fill="#002776"/>`);
}

function svgBrazilProvisional() {
  let s = '';
  for (let i = 0; i < 13; i++) s += `<rect y="${i * 61.5}" width="1200" height="61.5" fill="${i % 2 === 0 ? '#009c3b' : '#ffdf00'}"/>`;
  s += `<rect width="400" height="430" fill="#002776"/>`;
  for (let i = 0; i < 21; i++) {
    const row = Math.floor(i / 5), col = i % 5;
    s += `<circle cx="${80 + col * 60}" cy="${70 + row * 80}" r="10" fill="#fff"/>`;
  }
  return svgWrap(1200, 800, s);
}

function svgCubaLoneStar() {
  let s = '';
  for (let i = 0; i < 5; i++) s += `<rect y="${i * 160}" width="1200" height="160" fill="${i % 2 === 0 ? '#002a8f' : '#fff'}"/>`;
  s += `<polygon points="0,0 450,400 0,800" fill="#cf142b"/><polygon points="150,340 170,390 225,390 180,420 198,470 150,440 102,470 120,420 75,390 130,390" fill="#fff"/>`;
  return svgWrap(1200, 800, s);
}

function svgEthiopiaImperial() {
  return svgWrap(1200, 800, `<rect width="1200" height="267" fill="#078930"/><rect y="267" width="1200" height="266" fill="#fcdd09"/><rect y="533" width="1200" height="267" fill="#da121a"/><g transform="translate(600,400)" fill="#8b4513"><circle r="80" fill="#fcdd09" stroke="#8b4513" stroke-width="3"/><text y="25" text-anchor="middle" font-size="80">♛</text></g>`);
}

function svgPrinsevlag() {
  return svgWrap(1200, 800, `<rect width="1200" height="267" fill="#e8712b"/><rect y="267" width="1200" height="266" fill="#fff"/><rect y="533" width="1200" height="267" fill="#002395"/><g transform="translate(600,370)"><rect x="-100" y="-30" width="60" height="60" fill="#00247d" stroke="#fff" stroke-width="2"/><rect x="-20" y="-30" width="60" height="60" fill="#e8712b" stroke="#fff" stroke-width="2"/><rect x="60" y="-30" width="60" height="60" fill="#ce1126" stroke="#fff" stroke-width="2"/></g>`);
}

function svgBlueEnsign(code) {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="#00247d"/><g transform="translate(0,0)"><rect width="480" height="320" fill="#00247d"/><g stroke="#fff" stroke-width="60"><line x1="0" y1="0" x2="480" y2="320"/><line x1="480" y1="0" x2="0" y2="320"/></g><g stroke="#cf142b" stroke-width="30"><line x1="0" y1="0" x2="480" y2="320"/><line x1="480" y1="0" x2="0" y2="320"/></g><rect x="200" width="80" height="320" fill="#fff"/><rect y="120" width="480" height="80" fill="#fff"/><rect x="210" width="60" height="320" fill="#cf142b"/><rect y="130" width="480" height="60" fill="#cf142b"/></g><circle cx="850" cy="500" r="100" fill="none" stroke="#fff" stroke-width="3"/><text x="850" y="520" text-anchor="middle" font-size="60" fill="#fff">${code}</text>`);
}

function svgFrenchMandate(c1, c2, c3) {
  return svgWrap(1200, 800, `<rect width="1200" height="267" fill="${c1}"/><rect y="267" width="1200" height="266" fill="${c2}"/><rect y="533" width="1200" height="267" fill="${c3}"/><g transform="translate(0,0)"><rect width="180" height="120" fill="#fff"/><rect width="60" height="120" fill="#002395"/><rect x="60" width="60" height="120" fill="#fff"/><rect x="120" width="60" height="120" fill="#ed2939"/></g>`);
}

function svgFrenchLebanon() {
  return svgWrap(1200, 800, `<rect width="400" height="800" fill="#002395"/><rect x="400" width="400" height="800" fill="#fff"/><rect x="800" width="400" height="800" fill="#ed2939"/><g transform="translate(600,400)" fill="#007a3d"><polygon points="0,-100 -60,80 60,80"/><rect x="-5" y="40" width="10" height="60"/></g>`);
}

function svgTaliban() {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="#fff"/><rect width="1200" height="800" fill="none" stroke="#ccc" stroke-width="2"/><text x="600" y="420" text-anchor="middle" font-family="serif" font-size="60" fill="#000">لا إله إلا الله محمد رسول الله</text>`);
}

function svgUN() {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="#4b92db"/><circle cx="600" cy="400" r="250" fill="none" stroke="#fff" stroke-width="3"/><circle cx="600" cy="400" r="150" fill="none" stroke="#fff" stroke-width="2"/><g transform="translate(600,400)" fill="none" stroke="#fff" stroke-width="2">${[...Array(8)].map((_,i)=>`<line x1="0" y1="-150" x2="0" y2="-250" transform="rotate(${i*45})"/>`).join('')}</g><circle cx="600" cy="400" r="20" fill="#fff"/>`);
}

function svgEU() {
  let s = `<rect width="1200" height="800" fill="#003399"/>`;
  for (let i = 0; i < 12; i++) {
    const a = (i * 30 - 90) * Math.PI / 180;
    const cx = 600 + Math.cos(a) * 200, cy = 400 + Math.sin(a) * 200;
    s += `<polygon points="${cx},${cy-18} ${cx+7},${cy-7} ${cx+18},${cy-7} ${cx+10},${cy+2} ${cx+12},${cy+18} ${cx},${cy+10} ${cx-12},${cy+18} ${cx-10},${cy+2} ${cx-18},${cy-7} ${cx-7},${cy-7}" fill="#ffcc00"/>`;
  }
  return svgWrap(1200, 800, s);
}

function svgAU() {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="#009543"/><circle cx="600" cy="400" r="200" fill="#ffcc00" opacity="0.3"/><g transform="translate(600,400)" fill="#ffcc00" opacity="0.6"><path d="M-120,-80 L-80,-40 -120,0 -80,40 -120,80 -40,60 0,100 40,60 120,80 80,40 120,0 80,-40 120,-80 40,-60 0,-100 -40,-60z"/></g>`);
}

function svgArabLeague() {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="#006233"/><circle cx="600" cy="400" r="200" fill="none" stroke="#ffd700" stroke-width="4"/><circle cx="580" cy="400" r="80" fill="#ffd700" opacity="0.3"/><circle cx="610" cy="400" r="65" fill="#006233"/><text x="600" y="600" text-anchor="middle" font-family="serif" font-size="40" fill="#ffd700">جامعة الدول العربية</text>`);
}

function svgNATO() {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="#004990"/><circle cx="600" cy="400" r="250" fill="none" stroke="#fff" stroke-width="3"/><g transform="translate(600,400)" stroke="#fff" stroke-width="8">${[...Array(4)].map((_,i)=>`<line x1="0" y1="-250" x2="0" y2="250" transform="rotate(${i*45})"/>`).join('')}</g><circle cx="600" cy="400" r="40" fill="#fff"/>`);
}

function svgOlympic() {
  const colors = ['#0081c8','#000000','#ee334e','#fcb131','#00a651'];
  const xs = [320, 480, 640, 400, 560];
  const ys = [340, 340, 340, 440, 440];
  let s = `<rect width="1200" height="800" fill="#fff"/><rect width="1200" height="800" fill="none" stroke="#ccc" stroke-width="2"/>`;
  for (let i = 0; i < 5; i++) {
    s += `<circle cx="${xs[i]}" cy="${ys[i]}" r="80" fill="none" stroke="${colors[i]}" stroke-width="10"/>`;
  }
  return svgWrap(1200, 800, s);
}

function svgRedCross() {
  return svgWrap(800, 800, `<rect width="800" height="800" fill="#fff"/><rect x="300" y="100" width="200" height="600" fill="#ff0000"/><rect x="100" y="300" width="600" height="200" fill="#ff0000"/>`);
}

function svgASEAN() {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="#003f87"/><circle cx="600" cy="400" r="200" fill="#ed1c24"/><g transform="translate(600,400)" fill="#f5cf00">${[...Array(10)].map((_,i)=>{const a=(i*36-90)*Math.PI/180;return`<line x1="${Math.cos(a)*60}" y1="${Math.sin(a)*60}" x2="${Math.cos(a)*120}" y2="${Math.sin(a)*120}" stroke="#f5cf00" stroke-width="6"/>`}).join('')}<circle r="50" fill="none" stroke="#f5cf00" stroke-width="3"/></g>`);
}

function svgCommonwealth() {
  let s = `<rect width="1200" height="800" fill="#00247d"/>`;
  s += `<circle cx="600" cy="400" r="100" fill="none" stroke="#ffd700" stroke-width="4"/>`;
  for (let i = 0; i < 34; i++) {
    const a = (i * 360 / 34 - 90) * Math.PI / 180;
    s += `<line x1="${600+Math.cos(a)*110}" y1="${400+Math.sin(a)*110}" x2="${600+Math.cos(a)*200}" y2="${400+Math.sin(a)*200}" stroke="#ffd700" stroke-width="3"/>`;
  }
  return svgWrap(1200, 800, s);
}

function svgOIC() {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="#006233"/><circle cx="560" cy="400" r="150" fill="#fff" opacity="0.2"/><circle cx="600" cy="400" r="130" fill="#006233"/><text x="600" y="600" text-anchor="middle" font-size="40" fill="#fff">OIC</text>`);
}

function svgAmazigh() {
  return svgWrap(1200, 800, `<rect width="1200" height="267" fill="#0067b0"/><rect y="267" width="1200" height="266" fill="#007e3a"/><rect y="533" width="1200" height="267" fill="#ffc200"/><text x="600" y="460" text-anchor="middle" font-size="200" fill="#ed1c24">ⵣ</text>`);
}

function svgKurdish() {
  return svgWrap(1200, 800, `<rect width="1200" height="267" fill="#ed1c24"/><rect y="267" width="1200" height="266" fill="#fff"/><rect y="533" width="1200" height="267" fill="#009639"/><circle cx="600" cy="400" r="120" fill="#ffc200"/>${[...Array(21)].map((_,i)=>{const a=(i*360/21-90)*Math.PI/180;return`<line x1="${600+Math.cos(a)*125}" y1="${400+Math.sin(a)*125}" x2="${600+Math.cos(a)*160}" y2="${400+Math.sin(a)*160}" stroke="#ffc200" stroke-width="5"/>`}).join('')}`);
}

function svgRomani() {
  return svgWrap(1200, 800, `<rect width="1200" height="400" fill="#0033a0"/><rect y="400" width="1200" height="400" fill="#009739"/><circle cx="600" cy="400" r="120" fill="none" stroke="#ce1126" stroke-width="12"/><g transform="translate(600,400)" fill="none" stroke="#ce1126" stroke-width="4">${[...Array(16)].map((_,i)=>{const a=i*22.5*Math.PI/180;return`<line x1="${Math.cos(a)*50}" y1="${Math.sin(a)*50}" x2="${Math.cos(a)*80}" y2="${Math.sin(a)*80}"/>`}).join('')}</g>`);
}

function svgTibetan() {
  let s = `<rect width="1200" height="800" fill="#fff"/><rect width="1200" height="800" fill="none" stroke="#ccc" stroke-width="2"/>`;
  for (let i = 0; i < 12; i++) {
    s += `<polygon points="600,400 ${i%2===0?0:1200},${(i/12)*800} ${(i%2===0?0:1200)},${((i+1)/12)*800}" fill="${i%2===0?'#ce1126':'#00247d'}"/>`;
  }
  s += `<polygon points="400,600 600,400 800,600" fill="#fff"/><circle cx="600" cy="300" r="80" fill="#ffd700"/>`;
  return svgWrap(1200, 800, s);
}

function svgSenyera() {
  let s = '';
  for (let i = 0; i < 9; i++) s += `<rect y="${i * 89}" width="1200" height="89" fill="${i % 2 === 0 ? '#fcdd09' : '#da121a'}"/>`;
  return svgWrap(1200, 800, s);
}

function svgRainbow() {
  const colors = ['#e40303','#ff8c00','#ffed00','#008026','#004dff','#750787'];
  return svgWrap(1200, 800, colors.map((c,i)=>`<rect y="${i*133}" width="1200" height="134" fill="${c}"/>`).join(''));
}

function svgProgressPride() {
  const rainbow = ['#e40303','#ff8c00','#ffed00','#008026','#004dff','#750787'];
  let s = rainbow.map((c,i)=>`<rect y="${i*133}" width="1200" height="134" fill="${c}"/>`).join('');
  s += `<polygon points="0,0 300,400 0,800" fill="#000"/>`;
  s += `<polygon points="0,80 220,400 0,720" fill="#613915"/>`;
  s += `<polygon points="0,160 140,400 0,640" fill="#74d7ee"/>`;
  s += `<polygon points="0,240 60,400 0,560" fill="#ffafc8"/>`;
  s += `<polygon points="0,320 20,400 0,480" fill="#fff"/>`;
  return svgWrap(1200, 800, s);
}

function svgJollyRoger() {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="#000"/><g transform="translate(600,350)" fill="#fff"><circle r="100"/><circle cx="-35" cy="-20" r="25" fill="#000"/><circle cx="35" cy="-20" r="25" fill="#000"/><path d="M-40,30 Q0,60 40,30" fill="none" stroke="#000" stroke-width="6"/></g><g transform="translate(600,520)" fill="#fff"><rect x="-150" y="-15" width="300" height="30" rx="15" transform="rotate(30)"/><rect x="-150" y="-15" width="300" height="30" rx="15" transform="rotate(-30)"/></g>`);
}

function svgWhiteEnsign() {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="#fff"/><rect x="0" width="480" height="320" fill="#00247d"/><g stroke="#cf142b" stroke-width="2" fill="none"><rect width="480" height="320"/></g><rect x="540" width="120" height="800" fill="#cf142b"/><rect y="340" width="1200" height="120" fill="#cf142b"/>`);
}

function svgRedEnsign() {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="#cf142b"/><g transform="translate(0,0)"><rect width="480" height="320" fill="#00247d"/><g stroke="#fff" stroke-width="60"><line x1="0" y1="0" x2="480" y2="320"/><line x1="480" y1="0" x2="0" y2="320"/></g><g stroke="#cf142b" stroke-width="30"><line x1="0" y1="0" x2="480" y2="320"/><line x1="480" y1="0" x2="0" y2="320"/></g><rect x="200" width="80" height="320" fill="#fff"/><rect y="120" width="480" height="80" fill="#fff"/><rect x="210" width="60" height="320" fill="#cf142b"/><rect y="130" width="480" height="60" fill="#cf142b"/></g>`);
}

function svgSignalFlags() {
  return svgWrap(800, 800, `<rect width="800" height="800" fill="#fff"/><rect width="800" height="800" fill="none" stroke="#ccc" stroke-width="2"/><rect x="50" y="50" width="150" height="150" fill="#002868"/><rect x="200" y="50" width="75" height="150" fill="#ffcc00"/><rect x="275" y="50" width="75" height="150" fill="#002868"/><rect x="400" y="50" width="150" height="150" fill="#ce1126"/><rect x="600" y="50" width="150" height="150" fill="#fff" stroke="#000" stroke-width="2"/><rect x="50" y="250" width="150" height="150" fill="#ffcc00"/><rect x="250" y="250" width="150" height="150" fill="#009639"/><rect x="450" y="250" width="150" height="150" fill="#000"/><rect x="650" y="250" width="100" height="150" fill="#ce1126"/>`);
}

function svgTexas() {
  return svgWrap(1200, 800, `<rect x="0" width="400" height="800" fill="#002868"/><rect x="400" width="800" height="400" fill="#fff"/><rect x="400" y="400" width="800" height="400" fill="#bf0a30"/><polygon points="200,280 220,340 285,340 232,375 252,435 200,400 148,435 168,375 115,340 180,340" fill="#fff"/>`);
}

function svgHawaii() {
  let s = '';
  for (let i = 0; i < 8; i++) s += `<rect y="${i * 100}" width="1200" height="100" fill="${['#fff','#ce1126','#00247d','#fff','#ce1126','#00247d','#fff','#ce1126'][i]}"/>`;
  s += `<rect width="360" height="300" fill="#00247d"/>`;
  s += `<g stroke="#fff" stroke-width="20"><line x1="0" y1="0" x2="360" y2="300"/><line x1="360" y1="0" x2="0" y2="300"/></g>`;
  s += `<g stroke="#ce1126" stroke-width="10"><line x1="0" y1="0" x2="360" y2="300"/><line x1="360" y1="0" x2="0" y2="300"/></g>`;
  s += `<rect x="150" width="60" height="300" fill="#fff"/><rect y="120" width="360" height="60" fill="#fff"/>`;
  s += `<rect x="155" width="50" height="300" fill="#ce1126"/><rect y="125" width="360" height="50" fill="#ce1126"/>`;
  return svgWrap(1200, 800, s);
}

function svgPuertoRico() {
  let s = '';
  for (let i = 0; i < 5; i++) s += `<rect y="${i * 160}" width="1200" height="160" fill="${i % 2 === 0 ? '#ce1126' : '#fff'}"/>`;
  s += `<polygon points="0,0 450,400 0,800" fill="#0050a0"/><polygon points="150,340 170,390 225,390 180,420 198,470 150,440 102,470 120,420 75,390 130,390" fill="#fff"/>`;
  return svgWrap(1200, 800, s);
}

function svgDC() {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="#fff"/><rect y="550" width="1200" height="100" fill="#bf0a30"/><rect y="700" width="1200" height="100" fill="#bf0a30"/>${[...Array(3)].map((_,i)=>`<polygon points="${200+i*300},100 ${240+i*300},200 ${320+i*300},200 ${260+i*300},260 ${280+i*300},340 ${200+i*300},290 ${120+i*300},340 ${140+i*300},260 ${80+i*300},200 ${160+i*300},200" fill="#bf0a30"/>`).join('')}`);
}

function svgQuebec() {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="#003da5"/><rect x="540" width="120" height="800" fill="#fff"/><rect y="340" width="1200" height="120" fill="#fff"/><text x="300" y="280" text-anchor="middle" font-size="120" fill="#fff">⚜</text><text x="900" y="280" text-anchor="middle" font-size="120" fill="#fff">⚜</text><text x="300" y="620" text-anchor="middle" font-size="120" fill="#fff">⚜</text><text x="900" y="620" text-anchor="middle" font-size="120" fill="#fff">⚜</text>`);
}

function svgSaltire() {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="#005eb8"/><g stroke="#fff" stroke-width="100"><line x1="0" y1="0" x2="1200" y2="800"/><line x1="1200" y1="0" x2="0" y2="800"/></g>`);
}

function svgWales() {
  return svgWrap(1200, 800, `<rect width="1200" height="400" fill="#fff"/><rect y="400" width="1200" height="400" fill="#00ab39"/><g transform="translate(600,400)" fill="#d4003c"><path d="M-100,-80 C-80,-120 -40,-120 0,-80 C40,-120 80,-120 100,-80 L80,-20 100,40 60,80 20,40 0,80 -20,40 -60,80 -100,40 -80,-20z" opacity="0.8"/></g>`);
}

function svgStGeorgeCross() {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="#fff"/><rect x="480" width="240" height="800" fill="#ce1124"/><rect y="280" width="1200" height="240" fill="#ce1124"/>`);
}

function svgSikhEmpire() {
  return svgWrap(1200, 800, `<rect width="1200" height="800" fill="#003580"/><g transform="translate(600,400)" fill="#ffd700"><circle r="120" fill="none" stroke="#ffd700" stroke-width="8"/><path d="M0,-120 L0,120 M-100,-60 L100,60 M100,-60 L-100,60" stroke="#ffd700" stroke-width="8" fill="none"/><circle r="40"/></g>`);
}

// ══════════════════════════════════════════════════════════════════
// MAIN: Write all entries
// ══════════════════════════════════════════════════════════════════

// 1. Add new groups to group-info.json
for (const [key, info] of Object.entries(newGroups)) {
  if (!groupInfo[key]) groupInfo[key] = info;
}
fs.writeFileSync(path.join(DATA, 'group-info.json'), JSON.stringify(groupInfo, null, 2) + '\n');
console.log(`Updated group-info.json (${Object.keys(newGroups).length} new groups)`);

// 2. Add entries to flags.json and create SVGs
let added = 0;
for (const flag of newFlags) {
  // Add to flags.json
  if (!flagsJson[flag.id]) {
    flagsJson[flag.id] = { g: flag.g, ns: flag.ns, name: flag.name };
    added++;
  }

  // Add to includes.json
  if (!includesJson[flag.ns]) {
    includesJson[flag.ns] = 'flags.json';
  }

  // Create {ns}/ directory and files
  const nsDir = path.join(ASSETS, flag.ns.split('.')[0]);
  fs.mkdirSync(nsDir, { recursive: true });

  // Write SVG
  const svgPath = path.join(nsDir, (flag.id === flag.ns ? 'flag' : flag.id.replace(flag.ns + '-', '').replace(flag.ns, 'flag')) + '.svg');
  // Determine the correct SVG filename for infer logic
  const namePart = flag.id.replace(flag.ns + '-', '').replace(flag.ns, '');
  const svgFile = (namePart && namePart.length > 0 && flag.id !== flag.ns) ? namePart + '.svg' : 'flag.svg';
  const finalSvgPath = path.join(nsDir, svgFile);

  if (!fs.existsSync(finalSvgPath)) {
    fs.writeFileSync(finalSvgPath, flag.svg);
  }

  // Write/update flags.json in namespace dir
  const nsFlagsPath = path.join(nsDir, 'flags.json');
  let nsFlags = {};
  if (fs.existsSync(nsFlagsPath)) {
    nsFlags = JSON.parse(fs.readFileSync(nsFlagsPath, 'utf8'));
  }
  if (!nsFlags[flag.id]) {
    nsFlags[flag.id] = {
      title: flag.title,
      ratio: flag.ratio,
      colors: flag.colors,
      desc: flag.desc,
    };
    if (flag.id !== flag.ns) {
      // If the flag file isn't 'flag.svg', explicitly set it
      nsFlags[flag.id].flag = flag.ns.split('.')[0] + '/' + svgFile;
    }
  }
  fs.writeFileSync(nsFlagsPath, JSON.stringify(nsFlags, null, 2) + '\n');
}

// 3. Write updated main files
fs.writeFileSync(path.join(DATA, 'flags.json'), JSON.stringify(flagsJson, null, 2) + '\n');
fs.writeFileSync(path.join(DATA, 'includes.json'), JSON.stringify(includesJson, null, 2) + '\n');

console.log(`Added ${added} new flags to flags.json`);
console.log(`Total flags: ${Object.keys(flagsJson).length}`);
console.log('Done! Run "node build.js" to rebuild the site.');
