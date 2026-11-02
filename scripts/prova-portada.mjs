// Comprova que la portada ensenyi els jocs per ordre d'any, amb l'any correcte
// a cada fitxa, i que res no se surti a cap mida de pantalla.
//
//   node scripts/prova-portada.mjs
//
// La llista d'anys d'aqui es a posta: si algu canvia un any a l'index.html
// sense voler, aixo ho ha de veure. No la treguis de l'index.

import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const ARREL = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// per ordre de sortida, que es com han de sortir
const ORDRE = [
  ['pong', 1972], ['breakout', 1976], ['space_invaders', 1978], ['lunar_lander', 1979],
  ['galaxian', 1979], ['asteroids', 1979],
  ['comecocos', 1980], ['missile_command', 1980], ['crazy_climber', 1980],
  ['battlezone', 1980], ['defender', 1980],
  ['centipede', 1981], ['frogger', 1981], ['donkey_kong', 1981], ['galaga', 1981], ['tempest', 1981],
  ['dig_dug', 1982], ['moon_patrol', 1982], ['nibbler', 1982], ['pole_position', 1982], ['qbert', 1982], ['track_field', 1983], ['tetris', 1984],
];
// La portada es un museu ordenat per any. Els jocs que no son de l'epoca de
// les recreatives van en un apartat a part, despres dels classics, perque no
// trenquin la linia del temps.
// No son de saló: van a part perquè no trenquin la línia del temps dels
// clàssics. Dins de l'apartat, també per ordre d'any.
const MODERNS = [['botifarra', 1850], ['xifres', 1972], ['temple', 1989], ['amunt', 2009], ['boles', 2016], ['sindria', 2021], ['balanca', 2026], ['ram', 2026], ['garbuix', 2026], ['gofra', 2026], ['impremta', 2026], ['rotllana', 2026], ['abecedari', 2026], ['conquesta', 2026], ['colles', 2026], ['trencaclosques', 2026]];
// les partides del dia, que surten a dalt de tot a ELS JOCS D'AVUI
const DIARIS = ['gofra_dia', 'impremta_dia', 'abecedari_dia', 'abecedari_dificil_dia', 'colles_dia', 'trencaclosques_dia', 'botifarra_dia', 'conquesta_dia'];
const MIDES = [[320, 568], [360, 640], [390, 844], [412, 915], [768, 1024], [1280, 800]];

const b = await chromium.launch();
let malament = 0;

for (const [w, h] of MIDES) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  // records de mentida, i ben llargs, per veure que l'any i el record hi caben
  // i la lliga de la setmana, amb noms i punts llargs a totes les partides del dia
  await ctx.route('**/jocs-records*/**', r => r.fulfill({
    status: 200, contentType: 'application/json',
    headers: { 'access-control-allow-origin': '*' },
    body: JSON.stringify(/\/lliga$/.test(r.request().url())
      ? { setmana: '2026-11-02', fins: '2026-11-02',
          classificacio: [{ n: 'BOB', p: 120 }, { n: 'TRA', p: 118 }, { n: 'MAR', p: 99 }, { n: 'CRE', p: 6 }],
          avui: Object.fromEntries(DIARIS.map(j => [j, j === 'conquesta_dia' ? null : { n: 'WWW', p: j === 'gofra_dia' ? 5 : 3400 }])) }
      : Object.fromEntries([...ORDRE, ...MODERNS].map(([joc]) => [joc, [{ n: 'CRE', p: 188400, t: 1 }]]))),
  }));
  const p = await ctx.newPage();
  // aquest mobil ja ha fet la Gofra d'avui i te les Colles a mig fer
  await p.addInitScript(() => {
    const d = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(new Date());
    localStorage.setItem('jugador', 'CRE');
    localStorage.setItem('gofra-' + d, JSON.stringify({ fi: { estrelles: 4 }, queden: 8, v: 2 }));
    localStorage.setItem('colles-' + d, JSON.stringify({ v: 1, fi: false, intents: [[1, 2, 3, 4]], fets: [] }));
  });
  const errors = [];
  p.on('pageerror', e => errors.push(String(e)));
  await p.goto('file://' + resolve(ARREL, 'index.html'));
  await p.waitForTimeout(900);

  const r = await p.evaluate(() => {
    const fitxes = [...document.querySelectorAll('a.btn')];
    // la Botifarra diu «S. XIX»: l'any per ordenar-la va a data-any
    const dades = f => { const a = f.querySelector('.any'); return [f.querySelector('.rec').dataset.joc, +(a.dataset.any || a.textContent)]; };
    const seccioModerns = document.getElementById('moderns');
    return {
      llista: [...document.querySelectorAll('#classics a.btn')].map(dades),
      moderns: seccioModerns ? [...seccioModerns.querySelectorAll('a.btn')].map(dades) : null,
      scrollHoritzontal: document.documentElement.scrollWidth > window.innerWidth + 1,
      tallades: fitxes.filter(f => f.getBoundingClientRect().top < 0).length,
      anyAmagat: fitxes.filter(f => f.querySelector('.any').getBoundingClientRect().width < 10).length,
      vessa: fitxes.filter(f => {
        const e = f.querySelector('em');
        return e.scrollWidth > e.clientWidth + 1;
      }).length,
      imgTrencades: [...document.images].filter(i => !i.complete || i.naturalWidth === 0).length,
      // les captures son quadrades: si surten estirades, alguna cosa mana
      // sobre l'aspect-ratio (ens va passar amb les etiquetes width/height)
      // els dos apartats han de tenir títol
      titols: [...document.querySelectorAll('h2.seccio')].map(h => h.textContent.trim()),
      // el boto del bot de Telegram: que es vegi, que porti al bot i que
      // no quedi tallat
      tg: (() => {
        const a = document.getElementById('tg');
        if (!a) return 'no hi és';
        if (a.hidden || a.getBoundingClientRect().height === 0) return 'no es veu';
        if (a.getAttribute('href') !== 'https://t.me/jocs_carles_bot') return 'no porta al bot';
        if (a.scrollWidth > a.clientWidth + 1) return 'el text no hi cap';
        return null;
      })(),
      // ELS JOCS D'AVUI: cada partida del dia, el seu estat i qui la guanya
      avui: (() => {
        const files = [...document.querySelectorAll('#avui-llista li a')];
        const lliga = document.getElementById('lliga');
        return {
          joc: files.map(a => a.querySelector('.lid').dataset.joc),
          est: files.map(a => a.querySelector('.est').textContent),
          lid: files.map(a => a.querySelector('.lid').textContent),
          vessa: files.filter(a => a.scrollWidth > a.clientWidth + 1 || a.getBoundingClientRect().height > 40).length,
          fets: document.getElementById('avui-fets').textContent,
          lliga: lliga && !lliga.hidden ? lliga.textContent : '',
          dalt: document.getElementById('avui').getBoundingClientRect().bottom < document.querySelector('h2.seccio').getBoundingClientRect().top,
        };
      })(),
      imgEstirades: [...document.images].filter(i => {
        const r = i.getBoundingClientRect();
        return Math.abs(r.width - r.height) > 2;
      }).length,
    };
  });

  const esperat = JSON.stringify(ORDRE);
  const problemes = [];
  if (JSON.stringify(r.llista) !== esperat) problemes.push('l\'ordre o algun any no quadra');
  if (r.moderns === null) problemes.push('falta l\'apartat dels moderns');
  else if (JSON.stringify(r.moderns) !== JSON.stringify(MODERNS)) {
    problemes.push('l\'apartat dels moderns no quadra');
  }
  if (r.scrollHoritzontal) problemes.push('scroll horitzontal');
  if (r.tallades) problemes.push(`${r.tallades} fitxes tallades per dalt`);
  if (r.anyAmagat) problemes.push(`${r.anyAmagat} anys que no es veuen`);
  if (r.vessa) problemes.push(`${r.vessa} línies on el record no cap`);
  if (r.imgTrencades) problemes.push(`${r.imgTrencades} miniatures trencades`);
  if (r.imgEstirades) problemes.push(`${r.imgEstirades} miniatures estirades`);
  if (r.titols.length !== 2) problemes.push(`hi ha ${r.titols.length} títols d'apartat i n'hi ha d'haver 2`);
  if (r.tg) problemes.push('el botó de Telegram: ' + r.tg);
  const a = r.avui;
  if (JSON.stringify(a.joc) !== JSON.stringify(DIARIS)) problemes.push('a ELS JOCS D\'AVUI hi falten partides del dia: ' + a.joc.join(','));
  if (a.est[0] !== '✓ FET' || a.est[4] !== 'A MIG FER' || a.est[1] !== 'PER FER' || a.fets !== '1 de 8 fets')
    problemes.push('els estats de les partides del dia no quadren: ' + a.est.join(','));
  if (a.lid[0] !== 'WWW ★★★★★' || a.lid[5] !== 'WWW 3:20' || a.lid[1] !== 'WWW 3.400' || a.lid[7] !== '')
    problemes.push('qui guanya avui no surt bé: ' + a.lid.join(','));
  if (a.vessa) problemes.push(`${a.vessa} files de les partides del dia que no hi caben`);
  if (!/BOB 120/.test(a.lliga) || !/Tu, CRE: 4t amb 6 punts/.test(a.lliga)) problemes.push('la lliga de la setmana no surt: ' + a.lliga);
  if (!a.dalt) problemes.push('ELS JOCS D\'AVUI no és a dalt de tot');
  if (errors.length) problemes.push(errors[0]);

  if (problemes.length) malament++;
  console.log(`${problemes.length ? '✗' : '✓'} ${String(w + 'x' + h).padEnd(10)} ` +
    (problemes.length ? problemes.join(' · ')
      : `els ${r.llista.length} clàssics per ordre, de ${r.llista[0][1]} a ${r.llista.at(-1)[1]}` +
        `, i ${r.moderns.length} de modern`));
  await ctx.close();
}

console.log(malament ? `\n${malament} de ${MIDES.length} mides malament` : `\nles ${MIDES.length} mides, be`);
await b.close();
process.exit(malament ? 1 : 0);
