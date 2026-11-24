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
import { readFileSync } from 'fs';

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
const MODERNS = [['escacs', 1475], ['dames', 1547], ['botifarra', 1850], ['penjat', 1894], ['sopa', 1968], ['caixa', 1970], ['xifres', 1972], ['quadres', 1979], ['temple', 1989], ['amunt', 2009], ['boles', 2016], ['sindria', 2021], ['balanca', 2026], ['ram', 2026], ['garbuix', 2026], ['gofra', 2026], ['impremta', 2026], ['rotllana', 2026], ['abecedari', 2026], ['conquesta', 2026], ['colles', 2026], ['trencaclosques', 2026], ['poble', 2026], ['tresor', 2026], ['estel', 2026]];
// les partides del dia, que surten a dalt de tot a ELS JOCS D'AVUI
const DIARIS = ['gofra_dia', 'impremta_dia', 'abecedari_dia', 'colles_dia', 'poble_dia', 'trencaclosques_dia', 'sopa_dia', 'penjat_dia', 'quadres_dia', 'estel_dia'];
const MIDES = [[320, 568], [360, 640], [390, 844], [412, 915], [768, 1024], [1280, 800]];

const b = await chromium.launch();
// Les proves de sempre fan servir el dia d'avui. Del 30 de novembre al 27 de
// desembre del 2026 hi ha el concurs de Nadal (la llista d'avui i la lliga
// canvien): si es passen aquells dies, es fan com si fos el 24 de novembre.
const AVUI_REAL = new Date().toISOString().slice(0, 10);
const foraNadal = async p => { if (AVUI_REAL >= '2026-11-30' && AVUI_REAL <= '2026-12-27') await p.clock.setFixedTime(new Date('2026-11-24T12:00:00')); };
let malament = 0;

for (const [w, h] of MIDES) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  // records de mentida, i ben llargs, per veure que l'any i el record hi caben
  // i la lliga de la setmana, amb noms i punts llargs a totes les partides del dia
  await ctx.route('**/jocs-records*/**', r => r.fulfill({
    status: 200, contentType: 'application/json',
    headers: { 'access-control-allow-origin': '*' },
    body: JSON.stringify(/\/lliga(\?|$)/.test(r.request().url())
      ? { setmana: '2026-11-02', fins: '2026-11-02',
          // la Sopa d'avui, feta amb aquestes inicials en un altre mobil (només si les demana)
          fets: /nom=CRE/.test(r.request().url()) ? ['sopa_dia'] : [],
          classificacio: [{ n: 'BOB', p: 120 }, { n: 'TRA', p: 118 }, { n: 'MAR', p: 99 }, { n: 'CRE', p: 6 }],
          palmares: [{ n: 'BOB', copes: 3, plates: 1, bronzes: 0 }, { n: 'TRA', copes: 1, plates: 2, bronzes: 1 }, { n: 'MAR', copes: 0, plates: 1, bronzes: 2 },
            { n: 'AAA', copes: 0, plates: 0, bronzes: 2 }, { n: 'BBB', copes: 0, plates: 0, bronzes: 1 }, { n: 'CRE', copes: 0, plates: 0, bronzes: 1 }],
          avui: Object.fromEntries(DIARIS.map(j => [j, j === 'penjat_dia' ? null : { n: 'WWW', p: j === 'gofra_dia' ? 5 : j === 'poble_dia' ? 500 : 3400 }])) }
      : Object.fromEntries([...ORDRE, ...MODERNS].map(([joc]) => [joc, [{ n: 'CRE', p: 188400, t: 1 }]]))),
  }));
  const p = await ctx.newPage();
  await foraNadal(p);
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
  if (a.est[0] !== '✓ FET' || a.est[3] !== 'A MIG FER' || a.est[1] !== 'PER FER' || a.est[6] !== '✓ FET' || a.fets !== '2 de 10 fets')
    problemes.push('els estats de les partides del dia no quadren: ' + a.est.join(','));
  if (a.lid[0] !== 'WWW ★★★★★' || a.lid[5] !== 'WWW 3:20' || a.lid[4] !== 'WWW 6/6' || a.lid[1] !== 'WWW 3.400' || a.lid[6] !== 'WWW 3:20' || a.lid[7] !== '' || a.lid[8] !== 'WWW 3:20')
    problemes.push('qui guanya avui no surt bé: ' + a.lid.join(','));
  if (a.vessa) problemes.push(`${a.vessa} files de les partides del dia que no hi caben`);
  if (!/BOB 120/.test(a.lliga) || !/Tu, CRE: 4t amb 6 punts/.test(a.lliga)) problemes.push('la lliga de la setmana no surt: ' + a.lliga);
  if (!/MEDALLES DE SEMPRE/.test(a.lliga) || !/BOB 🏆3 🥈1/.test(a.lliga) || !/Tu: CRE 🥉1/.test(a.lliga)) problemes.push('les medalles de sempre no surten: ' + a.lliga);
  if (!a.dalt) problemes.push('ELS JOCS D\'AVUI no és a dalt de tot');
  if (errors.length) problemes.push(errors[0]);

  if (problemes.length) malament++;
  console.log(`${problemes.length ? '✗' : '✓'} ${String(w + 'x' + h).padEnd(10)} ` +
    (problemes.length ? problemes.join(' · ')
      : `els ${r.llista.length} clàssics per ordre, de ${r.llista[0][1]} a ${r.llista.at(-1)[1]}` +
        `, i ${r.moderns.length} de modern`));
  await ctx.close();
}

// El rètol LLIGA: a les fitxes dels jocs d'ELS JOCS D'AVUI (els que compten
// per a la lliga) i a cap altra, sense trepitjar el de NOU o NOVA VERSIÓ.
for (const [w, h] of [[320, 568], [390, 844]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  await ctx.route('**/jocs-records*/**', r => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '[]' }));
  const p = await ctx.newPage();
  await foraNadal(p);
  const errors = [];
  p.on('pageerror', e => errors.push(String(e)));
  await p.goto('file://' + resolve(ARREL, 'index.html'));
  await p.waitForTimeout(400);
  const r = await p.evaluate(() => {
    const amb = [...document.querySelectorAll('a.btn')].filter(a => a.querySelector('.lliga'));
    const jocs = amb.map(a => a.querySelector('.rec').dataset.joc).sort();
    const toca = (x, y) => x.left < y.right && y.left < x.right && x.top < y.bottom && y.top < x.bottom;
    const xoca = amb.filter(a => { const n = a.querySelector('.nou'); return n && toca(n.getBoundingClientRect(), a.querySelector('.lliga').getBoundingClientRect()); }).length;
    // dins de la miniatura, a baix
    const dins = amb.every(a => { const c = a.querySelector('img').getBoundingClientRect(), y = a.querySelector('.lliga').getBoundingClientRect();
      return y.left >= c.left && y.right <= c.right && y.top >= c.top + c.height / 2 && y.bottom <= c.bottom; });
    const ambNou = amb.filter(a => a.querySelector('.nou')).length;
    // la vora: daurada a les de la lliga, grisa a les altres
    const vora = a => getComputedStyle(a).borderTopColor;
    const totes = [...document.querySelectorAll('a.btn')];
    const vores = amb.every(a => vora(a) === 'rgb(224, 178, 58)') && totes.filter(a => !a.querySelector('.lliga')).every(a => vora(a) === 'rgb(58, 58, 58)');
    return { jocs: jocs.join(','), xoca, dins, ambNou, vores };
  });
  const esperat = DIARIS.map(j => j.replace('_dia', '')).sort().join(',');
  const be = r.jocs === esperat && !r.xoca && r.dins && r.vores && !errors.length;
  if (!be) malament++;
  console.log(`${be ? '✓' : '✗'} a ${w}px, el rètol LLIGA surt a les fitxes dels ${r.jocs.split(',').length} jocs que compten (${r.jocs}) i la vora daurada, i no trepitja el de NOU o NOVA VERSIÓ (${r.ambNou} en porten)` + (errors.length ? ' ' + errors[0] : ''));
  await ctx.close();
}

// Tornant d'un joc amb el boto d'enrere del mobil, el navegador ensenya la
// portada tal com era, sense tornar-la a llegir (avisa amb un «pageshow»
// amb persisted). La partida que acabaves de fer ha de sortir com a feta.
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.route('**/jocs-records*/**', r => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '[]' }));
  const p = await ctx.newPage();
  await foraNadal(p);
  const errors = [];
  p.on('pageerror', e => errors.push(String(e)));
  await p.goto('file://' + resolve(ARREL, 'index.html'));
  await p.waitForTimeout(400);
  const estat = () => p.evaluate(() => [[...document.querySelectorAll('#avui-llista li')].find(l => /POBLE/.test(l.textContent)).querySelector('.est').textContent, document.getElementById('avui-fets').textContent]);
  const abans = await estat();
  await p.evaluate(() => {
    const d = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(new Date());
    localStorage.setItem('poble-' + d, JSON.stringify({ v: 1, intents: [1, 2], fi: true, encert: true }));
    dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
  });
  await p.waitForTimeout(200);
  const despres = await estat();
  const be = abans[0] === 'PER FER' && despres[0] === '✓ FET' && despres[1] === '1 de 10 fets' && !errors.length;
  if (!be) malament++;
  console.log(`${be ? '✓' : '✗'} tornant enrere des d'un joc, la partida acabada surt com a feta (${abans[0]} → ${despres[0]}, ${despres[1]})` + (errors.length ? ' ' + errors[0] : ''));
  await ctx.close();
}

// L'ordre: per any (tots, el museu) o els que mes jugues primer. Es compta
// cada joc que obres des de la portada, i els que ja tenien record compten
// com a jugats un cop. Tornant a PER ANY, tot torna al seu lloc.
{
  const ctx = await b.newContext({ viewport: { width: 320, height: 568 } });
  await ctx.route('**/jocs-records*/**', r => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{}' }));
  const p = await ctx.newPage();
  await foraNadal(p);
  const errors = [];
  p.on('pageerror', e => errors.push(String(e)));
  await p.goto('file://' + resolve(ARREL, 'index.html'));
  await p.evaluate(() => {
    localStorage.clear();
    // el compte del primer dia (de la portada), un record d'abans i dos dies de trencaclosques desats
    localStorage.setItem('jocs-jugats', JSON.stringify({ colles: 3, pong: 1 }));
    // els jocs nous, com si ja s'haguessin obert (si no, van al davant: es prova a part)
    localStorage.setItem('jocs-obertes', JSON.stringify({ 'sopa.html': { n: 0, t: 0 }, 'tresor.html': { n: 0, t: 0 }, 'escacs.html': { n: 0, t: 0 }, 'dames.html': { n: 0, t: 0 }, 'penjat.html': { n: 0, t: 0 }, 'quadres.html': { n: 0, t: 0 }, 'caixa.html': { n: 0, t: 0 }, 'estel.html': { n: 0, t: 0 } }));
    localStorage.setItem('best_galaga', '3000'); localStorage.setItem('best_breakout', '50');
    localStorage.setItem('trencaclosques-2026-10-30', '{}'); localStorage.setItem('trencaclosques-2026-10-31', '{}');
  });
  // obrir un joc el compta el joc mateix (aquí el Tetris, cinc vegades)...
  for (let i = 0; i < 5; i++) { await p.goto('file://' + resolve(ARREL, 'tetris.html')); await p.waitForTimeout(150); }
  // ...tornar-lo a carregar no compta, i el Breakout, l'últim que has obert, va davant dels altres d'1×
  await p.reload(); await p.waitForTimeout(150);
  await p.goto('file://' + resolve(ARREL, 'breakout.html')); await p.waitForTimeout(150);
  const oberts = await p.evaluate(() => JSON.parse(localStorage.getItem('jocs-obertes') || '{}'));
  await p.goto('file://' + resolve(ARREL, 'index.html')); await p.waitForTimeout(300);
  await p.click('#ordre button[data-ordre="jugats"]');
  const ids = sel => p.evaluate(s => [...document.querySelectorAll(s)].map(a => a.querySelector('.rec').dataset.joc), sel);
  const jug = await ids('#jugats a.btn');
  const vist = await p.evaluate(() => ({
    titols: [...document.querySelectorAll('h2.seccio')].every(h => h.offsetParent === null), jugats: document.getElementById('jugats').offsetParent !== null,
    scroll: document.documentElement.scrollWidth > innerWidth + 1, boto: document.querySelector('#ordre').scrollWidth <= innerWidth,
  }));
  const tots = jug.length === ORDRE.length + MODERNS.length;
  let be = tots && jug.slice(0, 6).join() === 'tetris,colles,breakout,trencaclosques,pong,galaga' && jug[6] === 'space_invaders' && vist.titols && vist.jugats && !vist.scroll && vist.boto
    && oberts['tetris.html'].n === 5 && oberts['breakout.html'].n === 1;
  if (!be) malament++;
  console.log(`${be ? '✓' : '✗'} MÉS JUGATS: compta cada vegada que obres un joc (no si el tornes a carregar), els dies desats dels del dia i els records d'abans; en empat, l'últim obert (${jug.slice(0, 7).join(', ')}...)`);
  await p.reload(); await p.waitForTimeout(300);
  const recorda = (await ids('#jugats a.btn')).length === jug.length;
  await p.click('#ordre button[data-ordre="any"]');
  const cl = await ids('#classics a.btn'), mo = await ids('#moderns a.btn');
  be = recorda && cl.join() === ORDRE.map(x => x[0]).join() && mo.join() === MODERNS.map(x => x[0]).join() && !(await ids('#jugats a.btn')).length && !errors.length;
  if (!be) malament++;
  console.log(`${be ? '✓' : '✗'} es recorda en tornar-hi, i PER ANY ho torna tot al seu lloc` + (errors.length ? ' ' + errors[0] : ''));
  // JOCS D'AVUI: a dalt els deu que compten per a la lliga, primer els que et
  // queden (aquí la Gofra ja és feta i va l'última, amb un ✓), i la resta per any
  await p.evaluate(() => { const d = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(new Date());
    localStorage.setItem('gofra-' + d, JSON.stringify({ fi: { estrelles: 4 }, queden: 8, v: 2 })); });
  await p.reload(); await p.waitForTimeout(300);
  await p.click('#ordre button[data-ordre="avui"]');
  const av = await ids('#avuijocs a.btn'), resta = (await ids('#classics a.btn')).length + (await ids('#moderns a.btn')).length;
  const va = await p.evaluate(() => ({ fet: document.querySelector('#avuijocs a.btn[href="gofra.html"] .cops')?.textContent,
    filera: new Set([...document.querySelectorAll('#ordre button')].map(b => Math.round(b.getBoundingClientRect().top))).size,
    titol: document.getElementById('titol-avui').offsetParent !== null, seccions: [...document.querySelectorAll('h2.seccio')].every(h => h.offsetParent !== null),
    scroll: document.documentElement.scrollWidth > innerWidth + 1 }));
  await p.reload(); await p.waitForTimeout(300);
  const recordaAvui = (await ids('#avuijocs a.btn')).length;
  await p.click('#ordre button[data-ordre="any"]');
  const tornen = (await ids('#avuijocs a.btn')).length === 0 && (await ids('#moderns a.btn')).join() === MODERNS.map(x => x[0]).join();
  const esperatAvui = [...DIARIS.filter(j => j !== 'gofra_dia'), 'gofra_dia'].map(j => j.replace('_dia', '')).join();
  be = av.join() === esperatAvui && va.fet === '✓' && resta === ORDRE.length + MODERNS.length - DIARIS.length && va.filera === 1 && va.titol && va.seccions
    && !va.scroll && recordaAvui === DIARIS.length && tornen && !errors.length;
  if (!be) malament++;
  console.log(`${be ? '✓' : '✗'} JOCS D'AVUI: a dalt els ${av.length} de la lliga, primer els que et queden i la Gofra feta l'última amb ✓ (${av.slice(0, 3).join(', ')}... ${av.at(-1)}), la resta per any, els tres botons en una filera a 320 px, es recorda i PER ANY ho torna tot` + (errors.length ? ' ' + errors[0] : ''));
  await ctx.close();
}

// ELS JOCS NOUS: el rètol NOU a la fitxa i l'avís de dalt, fins que l'obres
// o fins que fa tres setmanes que hi és
{
  const ctx = await b.newContext({ viewport: { width: 320, height: 568 } });
  await ctx.route('**/jocs-records*/**', r => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{}' }));
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', e => errors.push(String(e)));
  await p.clock.setFixedTime(new Date('2026-11-06T12:00:00'));
  await p.goto('file://' + resolve(ARREL, 'index.html'));
  await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(200);
  // qui hi entra per primer cop en aquest aparell no veu cap avís: tot li és nou
  const primera = await p.evaluate(() => ({ primer: +localStorage.getItem('jocs-primer'), avis: document.getElementById('novetats').hidden,
    retols: document.querySelectorAll('a.btn .nou').length }));
  let be0 = primera.primer > 0 && primera.avis && primera.retols === 0;
  if (!be0) malament++;
  console.log(`${be0 ? '✓' : '✗'} el primer cop que s'hi entra en un aparell no surt cap JOC NOU ni NOVA VERSIÓ (${primera.retols} rètols)`);
  // a partir d'aquí, algú que ja hi jugava d'abans
  await p.evaluate(() => localStorage.setItem('jocs-primer', String(Date.parse('2026-10-01T00:00:00'))));
  await p.reload(); await p.waitForTimeout(200);
  const mira = () => p.evaluate(() => ({
    nous: [...document.querySelectorAll('a.btn .nou:not(.nova)')].map(r => r.closest('a').getAttribute('href')).sort().join(),
    avis: document.getElementById('novetats').hidden ? '' : [...document.querySelectorAll('#novetats a.nou-joc:not(.nova)')].map(a => a.getAttribute('href')).sort().join(),
    dalt: (() => { const n = document.getElementById('novetats'); return n.hidden || n.getBoundingClientRect().bottom <= document.getElementById('avui').getBoundingClientRect().top; })(),
    scroll: document.documentElement.scrollWidth > innerWidth + 1, fitxes: document.querySelectorAll('a.btn').length,
  }));
  let m = await mira();
  let be = m.nous === 'sopa.html,tresor.html' && m.avis === 'sopa.html,tresor.html' && m.dalt && !m.scroll && m.fitxes === ORDRE.length + MODERNS.length
    && await p.evaluate(() => [...document.querySelectorAll('#novetats a.nou-joc:not(.nova)')].every(a => /^JOC NOU!/.test(a.textContent) && a.scrollWidth <= a.clientWidth + 1));
  if (!be) malament++;
  console.log(`${be ? '✓' : '✗'} JOCS NOUS: els dos d'avui porten el rètol NOU i a dalt de tot diu JOC NOU! (${m.nous} / ${m.avis})`);
  await p.click('#ordre button[data-ordre="jugats"]');
  const primers = await p.evaluate(() => [...document.querySelectorAll('#jugats a.btn')].slice(0, 2).map(a => a.getAttribute('href')).sort().join());
  await p.click('#ordre button[data-ordre="any"]');
  be = primers === 'sopa.html,tresor.html';
  if (!be) malament++;
  console.log(`${be ? '✓' : '✗'} a MÉS JUGATS, els nous que no has obert van al davant de tot (${primers})`);
  await p.goto('file://' + resolve(ARREL, 'tresor.html')); await p.waitForTimeout(150);
  await p.goto('file://' + resolve(ARREL, 'index.html')); await p.waitForTimeout(200);
  m = await mira();
  be = m.nous === 'sopa.html' && m.avis === 'sopa.html';
  if (!be) malament++;
  console.log(`${be ? '✓' : '✗'} un cop obert, ja no és nou (${m.nous} / ${m.avis})`);
  // tres setmanes i un dia després del joc nou més nou de la portada
  const darrerNou = [...readFileSync(resolve(ARREL, 'index.html'), 'utf8').matchAll(/data-nou="(\d{4}-\d\d-\d\d)"/g)].map(m => m[1]).sort().pop();
  await p.clock.setFixedTime(new Date(Date.parse(darrerNou + 'T12:00:00') + 22 * 864e5));
  await p.reload(); await p.waitForTimeout(200);
  m = await mira();
  be = m.nous === '' && m.avis === '' && !errors.length;
  if (!be) malament++;
  console.log(`${be ? '✓' : '✗'} al cap de tres setmanes, ja no és nou encara que no l'hagis obert` + (errors.length ? ' ' + errors[0] : ''));
  await ctx.close();
}

// NOVA VERSIÓ: un joc que ha canviat i que no has obert des de llavors porta
// el rètol verd i surt a dalt (com a molt tres); en obrir-lo, un rètol diu què
// ha canviat, una sola vegada. Els avisos es llegeixen de NOVETATS, al
// records.js, i el rellotge es posa just després del més nou: així la prova
// no s'ha de tocar cada vegada que se n'hi afegeix un.
{
  const NOV = [...readFileSync(resolve(ARREL, 'records.js'), 'utf8').matchAll(/'([a-z_]+\.html)':\s*\['(\d{4}-\d\d-\d\dT\d\d:\d\dZ)',\s*'((?:[^'\\]|\\.)*)'\]/g)]
    .map(x => ({ f: x[1], d: Date.parse(x[2]), text: x[3].replace(/\\'/g, "'") })).sort((a, b) => b.d - a.d);
  const ARA = NOV[0].d + 3600e3, DIES = 14 * 864e5;
  const actius = NOV.filter(x => ARA - x.d < DIES);
  const ctx = await b.newContext({ viewport: { width: 320, height: 568 } });
  await ctx.route('**/jocs-records*/**', r => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{}' }));
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', e => errors.push(String(e)));
  await p.clock.setFixedTime(new Date(ARA));
  await p.goto('file://' + resolve(ARREL, 'index.html'));
  // tots oberts abans del seu canvi (així cap no és NOU, que aquests no diuen
  // NOVA VERSIÓ), i els jocs nous oberts també
  const nous = await p.evaluate(() => [...document.querySelectorAll('a.btn[data-nou]')].map(a => a.getAttribute('href')));
  const oberts = Object.fromEntries(nous.map(f => [f, { n: 1, t: ARA - 3600e3 }]));
  NOV.forEach(x => { oberts[x.f] = { n: 2, t: x.d - 864e5 }; });
  await p.evaluate(o => { localStorage.clear(); localStorage.setItem('jocs-obertes', JSON.stringify(o)) }, oberts);
  await p.reload(); await p.waitForTimeout(200);
  const mira = () => p.evaluate(() => ({
    noves: [...document.querySelectorAll('a.btn .nou.nova')].map(r => r.closest('a').getAttribute('href')).sort().join(),
    avis: [...document.querySelectorAll('#novetats a.nou-joc.nova')].map(a => a.getAttribute('href')).join(),
    mes: (document.querySelector('#novetats .nou-mes') || {}).textContent || '',
    cap: [...document.querySelectorAll('#novetats a.nou-joc, a.btn .nou')].every(a => a.scrollWidth <= a.clientWidth + 1)
      && document.documentElement.scrollWidth <= innerWidth + 1,
    text: [...document.querySelectorAll('#novetats a.nou-joc.nova')].every(a => /^NOVA VERSIÓ/.test(a.textContent)),
  }));
  let m = await mira();
  const resta = actius.length - 3;
  let be = m.noves === actius.map(x => x.f).sort().join() && m.avis === actius.slice(0, 3).map(x => x.f).join()
    && (resta > 0 ? new RegExp('^i ' + resta + ' jocs? més').test(m.mes) : !m.mes) && m.cap && m.text;
  if (!be) malament++;
  console.log(`${be ? '✓' : '✗'} NOVA VERSIÓ: rètol verd als ${actius.length} que han canviat i no has obert des de llavors, i a dalt els tres més nous (${m.avis} · ${m.mes})`);
  // els obres tots menys els dos més nous
  await p.evaluate(o => { const c = JSON.parse(localStorage.getItem('jocs-obertes')); Object.assign(c, o); localStorage.setItem('jocs-obertes', JSON.stringify(c)) },
    Object.fromEntries(actius.slice(2).map(x => [x.f, { n: 3, t: ARA - 60e3 }])));
  await p.reload(); await p.waitForTimeout(200);
  m = await mira();
  const dos = actius.slice(0, 2);
  be = m.noves === dos.map(x => x.f).sort().join() && m.avis === dos.map(x => x.f).join() && !m.mes && m.cap;
  if (!be) malament++;
  console.log(`${be ? '✓' : '✗'} els que ja has obert després del canvi ja no ho diuen (${m.noves})`);
  const X = actius[0];
  await p.goto('file://' + resolve(ARREL, X.f)); await p.waitForTimeout(600);
  const toast = await p.evaluate(() => { const r = document.getElementById('nova-versio'); return r && { t: r.textContent, cap: r.getBoundingClientRect().right <= innerWidth && r.getBoundingClientRect().left >= 0 }; });
  await p.goto('file://' + resolve(ARREL, X.f)); await p.waitForTimeout(600);
  const toast2 = await p.evaluate(() => !!document.getElementById('nova-versio'));
  await p.goto('file://' + resolve(ARREL, 'index.html')); await p.waitForTimeout(200);
  m = await mira();
  be = toast && /^NOVA VERSIÓ/.test(toast.t) && toast.t.toLowerCase().includes(X.text.toLowerCase()) && toast.cap && !toast2 && !m.noves.includes(X.f) && !m.avis.includes(X.f) && !errors.length;
  if (!be) malament++;
  console.log(`${be ? '✓' : '✗'} en obrir-lo, el rètol diu què ha canviat, i només la primera vegada (${toast && toast.t})` + (errors.length ? ' ' + errors[0] : ''));
  // un aparell nou, el mateix dia: ni a la portada ni en obrir el joc
  await p.evaluate(() => localStorage.clear());
  await p.goto('file://' + resolve(ARREL, 'index.html')); await p.waitForTimeout(200);
  const nou = await p.evaluate(() => ({ avis: document.getElementById('novetats').hidden, retols: document.querySelectorAll('a.btn .nou').length }));
  await p.goto('file://' + resolve(ARREL, actius[1].f)); await p.waitForTimeout(600);
  const toastNou = await p.evaluate(() => !!document.getElementById('nova-versio'));
  be = nou.avis && nou.retols === 0 && !toastNou;
  if (!be) malament++;
  console.log(`${be ? '✓' : '✗'} en un aparell nou no diu NOVA VERSIÓ enlloc, ni a la portada ni dins del joc`);
  // quinze dies després de la novetat més recent
  await p.clock.setFixedTime(new Date(NOV[0].d + 15 * 864e5));
  await p.reload(); await p.waitForTimeout(200);
  m = await mira();
  be = m.noves === '' && m.avis === '';
  if (!be) malament++;
  console.log(`${be ? '✓' : '✗'} al cap de dues setmanes, ja no diu NOVA VERSIÓ`);
  await ctx.close();
}

// EL CONCURS DE NADAL: de l'1 al 24 de desembre, a la llista d'avui només hi
// ha els seus sis jocs, les seves fitxes porten 🎄 NADAL i en lloc de la lliga
// hi ha la classificació del concurs; el 30 de novembre avisa que comença, i
// del 25 al 27 ensenya el resultat final. Les dates i els jocs han de ser els
// mateixos que al Worker.
{
  const codiW = readFileSync(resolve(ARREL, 'worker/records.js'), 'utf8'), codiP = readFileSync(resolve(ARREL, 'index.html'), 'utf8');
  const nw = codiW.match(/const NADAL = \{ any: \d+, des: '([\d-]+)', fins: '([\d-]+)',\s*jocs: \[([^\]]+)\] \}/);
  const pw = codiW.match(/const PAUSA_LLIGA = \{ des: '([\d-]+)', fins: '([\d-]+)' \}/);
  const np = codiP.match(/const NADAL=\{des:'([\d-]+)',fins:'([\d-]+)',pausa:'([\d-]+)',torna:'([\d-]+)',\s*jocs:"([^"]+)"/);
  const jw = nw && [...nw[3].matchAll(/'(\w+)'/g)].map(x => x[1]).join(' ');
  let be = nw && pw && np && nw[1] === np[1] && nw[2] === np[2] && pw[1] === np[3] && jw === np[5];
  if (!be) malament++;
  console.log(`${be ? '✓' : '✗'} el concurs de Nadal té les mateixes dates i els mateixos jocs a la portada i al Worker (${jw})`);
  const DE_NADAL = (jw || '').split(' ');
  const mira = async (dia, resposta, w = 320) => {
    const ctx = await b.newContext({ viewport: { width: w, height: 640 } });
    await ctx.route('**/jocs-records*/**', r => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify(/\/lliga(\?|$)/.test(r.request().url()) ? resposta : {}) }));
    const p = await ctx.newPage();
    const errors = []; p.on('pageerror', e => errors.push(String(e)));
    await p.clock.setFixedTime(new Date(dia + 'T12:00:00'));
    await p.addInitScript(() => { localStorage.setItem('jugador', 'CRE'); localStorage.setItem('jocs-primer', '0'); });
    await p.goto('file://' + resolve(ARREL, 'index.html')); await p.waitForTimeout(300);
    const r = await p.evaluate(() => ({
      llista: [...document.querySelectorAll('#avui-llista li a')].map(a => a.getAttribute('href').replace('.html', '')),
      fets: document.getElementById('avui-fets').textContent,
      retols: [...document.querySelectorAll('a.btn .lliga')].map(r => r.textContent + ':' + r.closest('a').getAttribute('href').replace('.html', '')),
      caixa: document.getElementById('lliga').hidden ? '' : document.getElementById('lliga').textContent,
      scroll: document.documentElement.scrollWidth > innerWidth + 1,
    }));
    await p.click('#ordre button[data-ordre="avui"]');
    r.primers = await p.evaluate(() => [...document.querySelectorAll('#avuijocs a.btn')].map(a => a.getAttribute('href').replace('.html', '')));
    r.errors = errors;
    await ctx.close();
    return r;
  };
  const pal = [{ n: 'BOB', nadals: 1, copes: 2, plates: 0, bronzes: 0 }, { n: 'CRE', nadals: 0, copes: 0, plates: 1, bronzes: 0 }];
  const avui6 = Object.fromEntries(DE_NADAL.map(j => [j, { n: 'WWW', p: j === 'gofra_dia' ? 5 : 300 }]));
  const nad = { mode: 'nadal', nadal: { des: '2026-12-01', fins: '2026-12-24', dies: 24, dia: 10, torna: '2026-12-28' }, avui: avui6, fets: [],
    classificacio: [{ n: 'BOB', p: 140 }, { n: 'ANA', p: 131 }, { n: 'CAR', p: 99 }, { n: 'CRE', p: 40 }], palmares: pal };
  for (const w of [320, 390]) {
    const r = await mira('2026-12-10', nad, w);
    const llista = DE_NADAL.map(j => j.replace('_dia', ''));
    be = r.llista.join() === llista.join() && r.fets === '0 de 6 fets' && r.retols.length === 6 && r.retols.every(t => /^🎄 NADAL:/.test(t)) &&
      r.retols.map(t => t.split(':')[1]).sort().join() === [...llista].sort().join() &&
      /CONCURS DE NADAL/.test(r.caixa) && /dia 10 de 24/.test(r.caixa) && /BOB 140/.test(r.caixa) && /Tu, CRE: 4t amb 40 punts/.test(r.caixa) &&
      /Queden 14 dies/.test(r.caixa) && /BOB 🎄1 🏆2/.test(r.caixa) && !r.scroll && r.primers.slice(0, 6).sort().join() === [...llista].sort().join() && !r.errors.length;
    if (!be) malament++;
    console.log(`${be ? '✓' : '✗'} a ${w}px, del 1 al 24 de desembre: la llista d'avui només té els 6 jocs del concurs (${r.llista.join(', ')}), amb 🎄 NADAL a les seves fitxes, i a sota el CONCURS DE NADAL amb el podi, on vas tu, quants dies queden i la copa de Nadal a les medalles` + (r.errors.length ? ' ' + r.errors[0] : ''));
  }
  {
    const r = await mira('2026-12-24', { ...nad, nadal: { ...nad.nadal, dia: 24 } });
    be = /Avui és l'últim dia!/.test(r.caixa);
    if (!be) malament++;
    console.log(`${be ? '✓' : '✗'} el dia 24 diu que és l'últim dia`);
  }
  {
    const r = await mira('2026-11-30', { mode: 'previ', nadal: nad.nadal, avui: {}, classificacio: [], palmares: pal });
    be = r.llista.length === 10 && /DEMÀ COMENÇA EL CONCURS DE NADAL/.test(r.caixa) && /la lliga descansa/.test(r.caixa) && r.retols.every(t => /^🏆 LLIGA/.test(t)) && !r.errors.length;
    if (!be) malament++;
    console.log(`${be ? '✓' : '✗'} el 30 de novembre, la llista té els 10 de sempre i diu que demà comença el concurs`);
  }
  {
    const r = await mira('2026-12-25', { mode: 'final', nadal: nad.nadal, avui: {}, classificacio: nad.classificacio, palmares: pal });
    be = r.llista.length === 10 && /RESULTAT FINAL/.test(r.caixa) && /BOB 140/.test(r.caixa) && /torna el dilluns 28/.test(r.caixa) && r.retols.every(t => /^🏆 LLIGA/.test(t)) && !r.errors.length;
    if (!be) malament++;
    console.log(`${be ? '✓' : '✗'} del 25 al 27 de desembre, la llista torna a tenir els 10 i a sota hi ha el resultat final del concurs`);
  }
  {
    const r = await mira('2026-12-28', { setmana: '2026-12-28', fins: '2026-12-28', avui: {}, classificacio: [], palmares: pal });
    be = r.llista.length === 10 && /LLIGA DE LA SETMANA/.test(r.caixa) && !/NADAL/.test(r.caixa) && /BOB 🎄1/.test(r.caixa);
    if (!be) malament++;
    console.log(`${be ? '✓' : '✗'} el dilluns 28 torna la lliga de la setmana (i la copa de Nadal es queda a les medalles)`);
  }
}

console.log(malament ? `\n${malament} de ${MIDES.length} mides malament` : `\nles ${MIDES.length} mides, be`);
await b.close();
process.exit(malament ? 1 : 0);
