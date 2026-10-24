// Comprova Les Quatre Colles: que les partides estiguin ben fetes (quatre
// colles de quatre, setze paraules diferents), que la del dia sigui la
// mateixa per a tothom, i que es jugui tocant: encertar una colla, el
// «gairebé», no pagar dues vegades el mateix intent, desar i continuar,
// guanyar, perdre, l'arxiu, les dues taules i que tot hi capiga.
//
//   node scripts/prova-colles.mjs

import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const ARREL = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const URL_JOC = 'file://' + resolve(ARREL, 'colles.html');

let malament = 0;
function diu(be, text) { if (!be) malament++; console.log(`${be ? '✓' : '✗'} ${text}`); }

const b = await chromium.launch();
const errors = [];
const enviats = [];
const obre = async (w = 390, h = 844) => {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: true });
  await ctx.route('**/jocs-records*/**', r => {
    const q = r.request();
    if (q.method() === 'POST') enviats.push({ url: q.url(), ...JSON.parse(q.postData() || '{}') });
    r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' },
      body: q.method() === 'POST' ? '{"ok":true,"posicio":1,"top":[]}' : '[]' });
  });
  const p = await ctx.newPage();
  p.on('pageerror', e => errors.push(String(e)));
  await p.goto(URL_JOC);
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('jugador', 'TST'); });
  await p.reload();
  await p.waitForTimeout(500);
  await neteja(p);
  return { ctx, p };
};
// treu la taula de l'entrada, si hi és
const neteja = p => p.evaluate(() => { document.querySelectorAll('body > div[style*="position: fixed"]').forEach(d => { if (d.id !== 'msg') d.remove(); }); paused = false; });
const deLaColla = (p, g) => p.evaluate(g => W.map((x, i) => [x, i]).filter(([x]) => x.g === g).map(([, i]) => i), g);
const tria = async (p, ids) => { for (const i of ids) await p.tap(`.p[data-i="${i}"]`); };

let { ctx, p } = await obre();

// ---------- 1. les partides ----------
const dades = await p.evaluate(() => {
  const pla = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zç]/g, '');
  const mal = [];
  PARTIDES.forEach((P, k) => {
    if (P.length !== 4) mal.push('#' + (k + 1) + ': no té 4 colles');
    P.forEach(g => { if (g.w.length !== 4) mal.push('#' + (k + 1) + ': ' + g.t + ' no té 4 paraules'); if (!g.t.trim()) mal.push('#' + (k + 1) + ': colla sense títol'); });
    const totes = P.flatMap(g => g.w.map(pla));
    if (new Set(totes).size !== 16) mal.push('#' + (k + 1) + ': paraules repetides');
    if (totes.some(w => w.length < 2 || w.length > 14)) mal.push('#' + (k + 1) + ': paraula massa curta o massa llarga');
  });
  return { mal, n: PARTIDES.length };
});
diu(dades.n >= 30 && !dades.mal.length, `${dades.n} partides, totes de 4 colles de 4 i setze paraules diferents` + (dades.mal.length ? ': ' + dades.mal.slice(0, 4).join(' | ') : ''));
const dia = await p.evaluate(() => {
  const a = JSON.stringify(nova(5).ordre.map(i => paraulesDe(5)[i].w)), b2 = JSON.stringify(nova(5).ordre.map(i => paraulesDe(5)[i].w)), c = JSON.stringify(nova(6).ordre.map(i => paraulesDe(6)[i].w));
  return { igual: a === b2, diferent: a !== c, primera: partidaDe(1) === PARTIDES[0], torna: partidaDe(PARTIDES.length + 1) === PARTIDES[0], numero: numeroDe(diaAvui()), avui: diaAvui() };
});
diu(dia.igual && dia.diferent && dia.primera && dia.torna, 'la partida del dia és la mateixa per a tothom (paraules i ordre), l\'endemà és una altra, i quan s\'acaben torna a començar');
diu(dia.numero >= 1, `la d'avui és la #${dia.numero} (${dia.avui})`);

// ---------- 2. jugar tocant ----------
diu(await p.evaluate(() => /COLLES DE 4/.test(document.getElementById('msg').textContent.toUpperCase()) && !!document.getElementById('b-jugar')),
  'el primer cop, explica com es juga');
await p.click('#b-jugar');
const g0 = await deLaColla(p, 0);
await tria(p, g0.slice(0, 3));
diu(await p.evaluate(() => sel.size === 3 && document.getElementById('comprova').disabled && document.querySelectorAll('.p.sel').length === 3),
  'tocant paraules es marquen, i COMPROVA no es pot prémer fins que n\'hi ha 4');
await tria(p, [g0[3]]);
await p.tap('#comprova');
await p.waitForTimeout(600);
let e = await p.evaluate(() => ({ fets: R.fets, barra: document.querySelector('.barra') && document.querySelector('.barra').textContent, tiles: document.querySelectorAll('.p').length, sel: sel.size }));
diu(e.fets.join() === '0' && e.tiles === 12 && e.sel === 0 && e.barra && e.barra.includes(await p.evaluate(() => P[0].t)),
  `una colla bona es fa una barra de color amb el títol (${e.barra})`);
// tres d'una colla i una d'una altra: «gairebé» i un error
const g1 = await deLaColla(p, 1), g2 = await deLaColla(p, 2), g3 = await deLaColla(p, 3);
await tria(p, [...g1.slice(0, 3), g2[0]]);
await p.tap('#comprova');
await p.waitForTimeout(200);
e = await p.evaluate(() => ({ err: R.errors, que: document.getElementById('que').textContent, punts: document.querySelectorAll('#errors i.gastat').length }));
diu(e.err === 1 && /Gairebé/.test(e.que) && e.punts === 1, `si n'hi ha 3 de la mateixa colla, diu «${e.que}» i compta un error`);
await p.tap('#comprova');
await p.waitForTimeout(200);
diu(await p.evaluate(() => R.errors === 1 && /ja les has provat/.test(document.getElementById('que').textContent)), 'el mateix intent dues vegades no torna a comptar com a error');
await p.tap('#desmarca');
diu(await p.evaluate(() => sel.size === 0 && !document.querySelector('.p.sel')), 'DESMARCA ho desmarca tot');
const abans = await p.evaluate(() => R.ordre.join());
await p.tap('#barreja');
diu(await p.evaluate(a => R.ordre.join() !== a && R.ordre.length === 16 && new Set(R.ordre).size === 16 && document.querySelectorAll('.barra').length === 1, abans),
  'BARREJA canvia l\'ordre de les que queden, i la colla trobada es queda a dalt');

// ---------- 3. desar i continuar ----------
await p.reload(); await p.waitForTimeout(500); await neteja(p);
e = await p.evaluate(() => ({ fets: R.fets.join(), err: R.errors, msg: document.getElementById('msg').style.display }));
diu(e.fets === '0' && e.err === 1 && e.msg !== 'block', 'tancant i tornant-hi, la partida hi és tal com l\'havies deixada (i ja no torna a explicar com es juga)');

// ---------- 4. guanyar: punts, taules, compartir ----------
enviats.length = 0;
for (const g of [g1, g2, g3]) { await tria(p, g); await p.tap('#comprova'); await p.waitForTimeout(550); }
await p.waitForTimeout(1000);
for (let i = 0; i < 30 && !await p.$('#rec-ok'); i++) await p.waitForTimeout(100);
if (await p.$('#rec-ok')) await p.click('#rec-ok');
await p.waitForTimeout(800);
e = await p.evaluate(() => ({ fi: R.fi, punts: punts(), txt: document.getElementById('msg').textContent, stats, tx: textCompartir(), titols: P.map(g => g.t) }));
diu(e.fi && e.punts === 550 && /LES HAS TROBADES TOTES/.test(e.txt), `trobant-les totes amb un error: 4 × 100 + 3 errors que sobren × 50 = ${e.punts} punts`);
diu(enviats.some(x => x.url.includes('colles_dia/' + dia.avui) && x.punts === 550) && enviats.some(x => /records\/colles$/.test(x.url) && x.punts === 4),
  'va a la taula d\'avui (550) i a les colles de sempre (4): ' + enviats.map(x => x.url.split('/records/')[1] + ' ' + x.punts).join(', '));
const paraules = await p.evaluate(() => W.map(x => x.w.toLowerCase()));
const files = e.tx.split('\n').slice(1), compta = (f, c) => f.split(c).length - 1;
diu(files.length === 5 && files[0] === '🟨🟨🟨🟨' && compta(files[1], '🟩') === 3 && compta(files[1], '🟦') === 1 && !paraules.some(w => w.length > 2 && e.tx.toLowerCase().includes(w)),
  'el que s\'envia al grup són els colors de cada intent, sense cap paraula');
diu(e.titols.every(t => e.txt.includes(t)) && e.stats.jugades === 1 && e.stats.colles === 4, 'el quadre del final ensenya la solució sencera, i les estadístiques compten la d\'avui');
enviats.length = 0;
await p.reload(); await p.waitForTimeout(1200); await neteja(p);
diu(await p.evaluate(() => R.fi && document.getElementById('msg').style.display === 'block' && /LES HAS TROBADES/.test(document.getElementById('msg').textContent)) && !enviats.length,
  'tornant-hi el mateix dia, ja està feta: ensenya com va anar i no es torna a apuntar');
await ctx.close();

// ---------- 5. perdre ----------
({ ctx, p } = await obre());
await p.click('#b-jugar');
enviats.length = 0;
{
  const [a, c, d] = [await deLaColla(p, 0), await deLaColla(p, 1), await deLaColla(p, 2)];
  await tria(p, a); await p.tap('#comprova'); await p.waitForTimeout(550);
  const proves = [[c[0], c[1], d[0], d[1]], [c[0], c[2], d[0], d[2]], [c[1], c[2], d[1], d[2]], [c[0], c[3], d[0], d[3]]];
  for (const pr of proves) { await tria(p, pr); await p.tap('#comprova'); await p.waitForTimeout(250); if (await p.evaluate(() => !R.fi)) await p.tap('#desmarca'); }
}
await p.waitForTimeout(1800);
for (let i = 0; i < 30 && !await p.$('#rec-ok'); i++) await p.waitForTimeout(100);
if (await p.$('#rec-ok')) await p.click('#rec-ok');
await p.waitForTimeout(800);
e = await p.evaluate(() => ({ fi: R.fi, punts: punts(), trobades: R.trobades, revelades: R.revelades.length, barres: document.querySelectorAll('.barra').length, txt: document.getElementById('msg').textContent }));
diu(e.fi && e.trobades === 1 && e.revelades === 3 && e.barres === 4 && e.punts === 100 && /ACABAT ELS ERRORS/.test(e.txt),
  `amb 4 errors s'acaba: surten les colles que faltaven i compta les trobades (${e.punts} punts)`);
diu(enviats.some(x => x.url.includes('colles_dia/') && x.punts === 100), 'i també va a la taula d\'avui');

// ---------- 6. l'arxiu ----------
enviats.length = 0;
await p.evaluate(() => { hideMsg(); obre('arxiu', 7); });
await p.waitForTimeout(200);
e = await p.evaluate(() => ({ mode, n: R.n, p0: P === PARTIDES[6], lider: document.getElementById('lider').textContent }));
diu(e.mode === 'arxiu' && e.n === 7 && e.p0 && /ARXIU/.test(e.lider), 'l\'arxiu obre la partida d\'un altre dia, i ho diu a dalt');
for (let g = 0; g < 4; g++) { await tria(p, await deLaColla(p, g)); await p.tap('#comprova'); await p.waitForTimeout(550); }
await p.waitForTimeout(1500);
diu(await p.evaluate(() => R.fi && /ARXIU/.test(document.getElementById('msg').textContent)) && !enviats.length, 'i acabant-la no compta per a cap taula');
await ctx.close();

// ---------- 7. que hi càpiga tot ----------
for (const [w, h] of [[320, 568], [360, 640], [390, 844]]) {
  ({ ctx, p } = await obre(w, h));
  // la partida amb la paraula mes llarga
  const r = await p.evaluate(() => {
    let k = 0, mx = 0; PARTIDES.forEach((P, i) => P.forEach(g => g.w.forEach(x => { if (x.length > mx) { mx = x.length; k = i; } })));
    obre('arxiu', k + 1); R.fets = [3]; pinta();
    const dins = el => { const c = el.getBoundingClientRect(); return c.left >= -1 && c.right <= innerWidth + 1 && c.top >= -1 && c.bottom <= innerHeight + 1; };
    const tiles = [...document.querySelectorAll('.p')];
    const cap = t => { const a = t.getBoundingClientRect(), s2 = t.firstChild.getBoundingClientRect(); return s2.left >= a.left - .5 && s2.right <= a.right + .5; };
    return { dins: [...tiles, ...document.querySelectorAll('#controls button, .barra')].every(dins), caben: tiles.every(cap),
      lletra: Math.min(...tiles.map(t => parseFloat(t.style.fontSize))), alt: Math.round(tiles[0].getBoundingClientRect().height),
      barra: [...document.querySelectorAll('.barra')].every(b2 => b2.scrollHeight <= b2.clientHeight + 2), ajuda: dins(document.querySelector('#wrap > small')) };
  });
  diu(r.dins && r.caben && r.barra && r.ajuda && r.lletra >= 10 && r.alt >= 40,
    `a ${w}×${h} hi cap tot: caselles de ${r.alt} px d'alt, i la paraula més llarga hi cap (lletra de ${r.lletra} px)` + (r.dins && r.caben && r.barra && r.ajuda ? '' : ' ' + JSON.stringify(r)));
  await ctx.close();
}

diu(!errors.length, 'cap error de JavaScript' + (errors.length ? ': ' + errors.join(' | ') : ''));
await b.close();
console.log(malament ? `\n${malament} coses malament` : '\nTot bé');
process.exit(malament ? 1 : 0);
