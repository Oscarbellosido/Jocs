// Comprova La Rotllana: que els nivells surtin ben fets (mots encreuats que
// quadren, paraules corrents, que caben a la pantalla i que pugen de
// dificultat), que siguin iguals per a tothom, que es jugui lliscant el dit,
// que les extres donin monedes, que la pista i la barreja vagin com toca, que
// en acabar un nivell s'apunti a la taula i que en tornar-hi tot sigui on era.
//
//   node scripts/prova-rotllana.mjs
//
// Les extres poden ser qualsevol forma del diccionari gran (dades/formes.txt),
// que es llegeix amb fetch(): per aixo la prova serveix el repositori per http.

import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http';
import fs from 'fs';
import { resolve, dirname, extname, join } from 'path';
import { fileURLToPath } from 'url';

const ARREL = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TIPUS = { '.html': 'text/html', '.js': 'text/javascript', '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png', '.json': 'application/json' };
const servidor = http.createServer((req, res) => {
  const cami = join(ARREL, decodeURIComponent(req.url.split('?')[0]));
  if (!cami.startsWith(ARREL) || !fs.existsSync(cami) || fs.statSync(cami).isDirectory()) {
    res.writeHead(404); res.end(); return;
  }
  res.writeHead(200, { 'content-type': TIPUS[extname(cami)] || 'application/octet-stream' });
  fs.createReadStream(cami).pipe(res);
});
await new Promise(r => servidor.listen(0, '127.0.0.1', r));
const URL_JOC = `http://127.0.0.1:${servidor.address().port}/rotllana.html`;

let malament = 0;
function diu(be, text) { if (!be) malament++; console.log(`${be ? '✓' : '✗'} ${text}`); }

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
const enviats = [];
await ctx.route('**/jocs-records*/**', r => {
  const q = r.request();
  if (q.method() === 'POST') enviats.push({ url: q.url(), cos: JSON.parse(q.postData() || '{}') });
  r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' },
    body: q.method() === 'POST' ? '{"top":[],"posicio":1}' : '[]' });
});
const p = await ctx.newPage();
const errors = []; p.on('pageerror', e => errors.push(String(e)));
await p.goto(URL_JOC);
await p.evaluate(() => localStorage.setItem('jugador', 'TST'));
await p.waitForFunction(() => DIC !== null, null, { timeout: 30000 }).catch(() => {});

// --- els nivells ---
const NIVELLS = 1000;
let r = await p.evaluate(NIVELLS => {
  const PROHIBIDES = ['merda', 'puta', 'cony', 'collons', 'polla', 'els', 'dels', 'pel', 'roger', 'peter'];
  const dolents = [], mides = [], perTram = {}, bases = new Map();
  let repetides = 0, maxMs = 0;
  for (let n = 1; n <= NIVELLS; n++) {
    const t0 = performance.now();
    const v = nivell(n);
    maxMs = Math.max(maxMs, performance.now() - t0);
    const t = tramDe(n);
    const mal = m => dolents.push(n + ' (' + v.base + '): ' + m);
    if (bases.has(v.base)) repetides++; else bases.set(v.base, n);
    // la graella: cada lletra on toca, i res de mes
    const g = Array.from({ length: v.files }, () => Array(v.cols).fill(null));
    for (const q of v.col) for (let i = 0; i < q.w.length; i++) {
      const f = q.f + (q.d ? i : 0), c = q.c + (q.d ? 0 : i);
      if (f < 0 || c < 0 || f >= v.files || c >= v.cols) { mal('fora de la graella'); continue; }
      if (g[f][c] && g[f][c] !== q.w[i]) mal('dues lletres a la mateixa casella');
      g[f][c] = q.w[i];
    }
    // cada tira de dues lletres o mes, en horitzontal i en vertical, ha de
    // ser una de les paraules: si no, sortirien paraules que no existeixen
    const tires = [];
    for (let f = 0; f < v.files; f++) { let s = ''; for (let c = 0; c <= v.cols; c++) { const l = c < v.cols && g[f][c]; if (l) s += l; else { if (s.length > 1) tires.push([s, f, c - s.length, 0]); s = ''; } } }
    for (let c = 0; c < v.cols; c++) { let s = ''; for (let f = 0; f <= v.files; f++) { const l = f < v.files && g[f][c]; if (l) s += l; else { if (s.length > 1) tires.push([s, f - s.length, c, 1]); s = ''; } } }
    for (const [s, f, c, d] of tires) if (!v.col.some(q => q.w === s && q.f === f && q.c === c && q.d === d)) mal('tira que no és cap paraula: ' + s);
    if (tires.length !== v.col.length) mal('hi ha ' + tires.length + ' tires i ' + v.col.length + ' paraules');
    // totes connectades: des de la primera casella s'arriba a totes
    const plenes = []; g.forEach((fi, f) => fi.forEach((l, c) => { if (l) plenes.push(f + ',' + c); }));
    const vist = new Set([plenes[0]]), cua = [plenes[0]];
    while (cua.length) { const [f, c] = cua.pop().split(',').map(Number); for (const [df, dc] of [[1,0],[-1,0],[0,1],[0,-1]]) { const k = (f+df) + ',' + (c+dc); if (plenes.includes(k) && !vist.has(k)) { vist.add(k); cua.push(k); } } }
    if (vist.size !== plenes.length) mal('encreuats partits en dos');
    // la rotllana: les lletres de la base, i totes les paraules s'hi poden fer
    if (v.roda.slice().sort().join('') !== v.base.split('').sort().join('')) mal('la rotllana no té les lletres de la base');
    if (v.roda.join('') === v.base) mal('la rotllana ja diu la paraula');
    if (!v.col.some(q => q.w === v.base)) mal('la base no és als encreuats');
    for (const q of v.col) {
      if (!RANG.has(q.w) || RANG.get(q.w) >= t.R) mal('paraula poc corrent: ' + q.w);
      if (PROHIBIDES.includes(q.w)) mal('paraula prohibida: ' + q.w);
      const resta = v.roda.slice(); for (const l of q.w) { const i = resta.indexOf(l); if (i < 0) mal('no es pot fer amb la rotllana: ' + q.w); else resta.splice(i, 1); }
    }
    if (v.col.length < t.min) mal('només ' + v.col.length + ' paraules');
    if (v.cols > MAXC || v.files > MAXF) mal('no cap: ' + v.files + 'x' + v.cols);
    mides.push(Math.min(AREA.w / v.cols, AREA.h / v.files));
    (perTram[t.des] = perTram[t.des] || []).push(v.col.length);
  }
  const mitjana = a => a.reduce((s, x) => s + x, 0) / a.length;
  return { dolents, repetides, maxMs, celMin: Math.min(...mides),
    trams: Object.entries(perTram).map(([d, a]) => [Number(d), mitjana(a)]) };
}, NIVELLS);
diu(r.dolents.length === 0, `els ${NIVELLS} primers nivells: encreuats que quadren, paraules corrents que es poden fer amb la rotllana` +
  (r.dolents.length ? ` (${r.dolents.length} malament: ${r.dolents.slice(0, 4).join(' | ')})` : ''));
diu(r.repetides === 0, `cap paraula base no es repeteix en ${NIVELLS} nivells (${r.repetides} repetides)`);
diu(r.trams.every(([, m], i, a) => i === 0 || m > a[i - 1][1]),
  `com més amunt, més paraules: ${r.trams.map(([d, m]) => 'des del ' + d + ', ' + m.toFixed(1)).join('; ')}`);
diu(r.celMin >= 28, `les caselles mai no són més petites de ${r.celMin.toFixed(0)} px (de 420)`);
diu(r.maxMs < 150, `fer un nivell no costa més de ${r.maxMs.toFixed(0)} mil·lèsimes`);
diu(await p.evaluate(() => DIC !== null && DIC.size > 150000), 'el diccionari gran es carrega per a les extres');

// el mateix nivell en un altre mobil
const p2 = await ctx.newPage();
await p2.goto(URL_JOC);
const iguals = await Promise.all([p, p2].map(q => q.evaluate(() => [7, 63, 222].map(n => JSON.stringify(nivell(n))).join('|'))));
diu(iguals[0] === iguals[1], 'el nivell 7, el 63 i el 222 són iguals a dos mòbils diferents');
await p2.close();

// --- jugar ---
await p.evaluate(() => { localStorage.removeItem('rotllana'); });
await p.reload();
await p.waitForFunction(() => DIC !== null, null, { timeout: 30000 }).catch(() => {});
await p.waitForTimeout(3800);                        // la taula de records d'entrada
// el marcador de dalt canvia de mida mentre jugues (hi surt el boto del so,
// la lletra s'encongeix...), i el canvas es mou: es mira a cada paraula
let box;
const aPant = (wx, wy) => [box.x + wx / 420 * box.width, box.y + wy / 640 * box.height];
async function llisca(w) {
  box = await p.locator('#game').boundingBox();
  const pos = await p.evaluate(w => {
    const usat = [];
    return w.split('').map(l => { const i = roda.findIndex((x, j) => x === l && !usat.includes(j)); usat.push(i); return posLletra(i); });
  }, w);
  const [x0, y0] = aPant(...pos[0]);
  await p.mouse.move(x0, y0); await p.mouse.down();
  for (const q of pos.slice(1)) { const [xx, yy] = aPant(...q); await p.mouse.move(xx, yy, { steps: 8 }); }
  await p.mouse.up(); await p.waitForTimeout(120);
}
r = await p.evaluate(() => ({ N, monedes, base: L.base, ps: L.col.map(q => q.w) }));
diu(r.N === 1 && r.monedes === 30 && r.ps.length >= 3, `es comença pel nivell 1, amb 30 monedes (${r.base.toUpperCase()}: ${r.ps.length} paraules)`);
const paraula = r.ps.find(w => w !== r.base);
await llisca(paraula);
let s = await p.evaluate(w => ({ oberta: trobada(L.col.find(q => q.w === w)), avis }), paraula);
diu(s.oberta, `lliscant el dit per ${paraula.toUpperCase()} la paraula surt als encreuats («${s.avis}»)`);
await llisca(paraula);
s = await p.evaluate(() => ({ avis, monedes }));
diu(/ja hi és/.test(s.avis) && s.monedes === 30, `tornar-la a fer no compta dues vegades («${s.avis}»)`);

// una paraula que no hi és: la rotllana sense la darrera lletra, al reves
const dolenta = await p.evaluate(() => { const w = roda.slice(0, 3).join(''); return existeix(w) ? null : w; });
if (dolenta) {
  await llisca(dolenta);
  s = await p.evaluate(() => ({ avis, monedes, obertes: obertes.size }));
  diu(/no hi és/.test(s.avis) && s.monedes === 30, `una que no existeix no fa res («${s.avis}»)`);
}

// una extra: la posem a ma en un nivell on n'hi ha
await p.evaluate(() => comenca(30));
const extra = await p.evaluate(() => {
  const totes = subparaules(L.base, PARAULES.length).filter(w => !L.col.some(q => q.w === w));
  return totes[0] || null;
});
await llisca(extra);
s = await p.evaluate(() => ({ avis, monedes, extres: [...extres] }));
diu(s.monedes === 31 && s.extres.includes(extra), `una paraula que no és als encreuats és extra i dona una moneda (${extra.toUpperCase()}: «${s.avis}»)`);
await llisca(extra);
s = await p.evaluate(() => monedes);
diu(s === 31, 'la mateixa extra dues vegades només en dona una');
// una forma que nomes es al diccionari gran
const deDic = await p.evaluate(() => {
  for (let n = 151; n < 400; n++) {
    const v = nivell(n), lletres = v.roda.join('');
    for (const w of DIC) {
      if (w.length < 4 || w.length > 7 || RANG.has(w)) continue;
      const resta = lletres.split(''); let ok = true;
      for (const l of w) { const i = resta.indexOf(l); if (i < 0) { ok = false; break; } resta.splice(i, 1); }
      if (ok) { comenca(n); return w; }
    }
  }
  return null;
});
if (deDic) {
  const abans = await p.evaluate(() => monedes);
  await llisca(deDic);
  s = await p.evaluate(() => ({ monedes, avis }));
  diu(s.monedes === abans + 1, `les extres també poden ser formes del diccionari gran (${deDic.toUpperCase()}: «${s.avis}»)`);
}

// la barreja
s = await p.evaluate(() => { const a = roda.join(''); barreja(); return { a, b: roda.join('') }; });
diu(s.a !== s.b && s.a.split('').sort().join('') === s.b.split('').sort().join(''), `BARREJA remena les lletres (${s.a.toUpperCase()} → ${s.b.toUpperCase()})`);

// la pista
s = await p.evaluate(() => { monedes = 25; const a = obertes.size; pista(); return { a, b: obertes.size, monedes }; });
diu(s.b === s.a + 1 && s.monedes === 15, `PISTA destapa una lletra i costa 10 monedes`);
s = await p.evaluate(() => { monedes = 5; const a = obertes.size; pista(); return { a, b: obertes.size, monedes, avis }; });
diu(s.b === s.a && s.monedes === 5, `sense prou monedes, la pista no fa res i t'ho diu («${s.avis}»)`);
// tocant el boto
await p.evaluate(() => { monedes = 40; updateHUD(); });
const obAbans = await p.evaluate(() => obertes.size);
await p.locator('#pista').dispatchEvent('pointerdown');
s = await p.evaluate(() => ({ ob: obertes.size, monedes }));
diu(s.ob === obAbans + 1 && s.monedes === 30, 'el botó de PISTA també funciona');

// --- acabar un nivell ---
await p.evaluate(() => comenca(12));
enviats.length = 0;
const ps = await p.evaluate(() => L.col.map(q => q.w));
for (const w of ps) await llisca(w);
await p.waitForTimeout(2200);
s = await p.evaluate(() => ({ state, monedes, text: document.getElementById('msg').textContent }));
diu(s.state === 'fet' && /NIVELL 12 FET/.test(s.text), `fetes totes les paraules, el nivell s'acaba («${s.text.slice(0, 40)}…»)`);
diu(enviats.some(e => /records\/rotllana$/.test(e.url) && e.cos.punts === 12 && e.cos.nom === 'TST'),
  `s'apunta a la taula amb els nivells fets (${JSON.stringify(enviats.map(e => e.cos))})`);
await p.click('#seguent');
s = await p.evaluate(() => ({ N, state, display: document.getElementById('msg').style.display }));
diu(s.N === 13 && s.state === 'play' && s.display === 'none', 'SEGÜENT porta al nivell 13');

// --- tancar i tornar ---
await llisca(await p.evaluate(() => L.col[L.col.length - 1].w));
const abans = await p.evaluate(() => ({ N, monedes, obertes: [...obertes].sort().join(), roda: roda.join('') }));
await p.reload();
await p.waitForTimeout(500);
const despres = await p.evaluate(() => ({ N, monedes, obertes: [...obertes].sort().join(), roda: roda.join('') }));
diu(JSON.stringify(abans) === JSON.stringify(despres), `tancant i tornant, el nivell és com el vas deixar (nivell ${despres.N}, ${despres.monedes} monedes)`);

// --- jugar en un altre lloc: el nivell es recupera de la taula ---
// El nivell es desa dins de cada navegador. En Carles anava molt endavant i,
// obrint-la des d'un altre lloc, va tornar al 1.
{
  const c2 = await b.newContext({ viewport: { width: 390, height: 844 } });
  await c2.route('**/jocs-records*/**', r => r.fulfill({ status: 200, contentType: 'application/json',
    headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify([{ n: 'CAR', p: 57, t: 1 }, { n: 'TST', p: 9, t: 2 }]) }));
  // un navegador nou, sense inicials: les demana
  const q = await c2.newPage();
  const errQ = []; q.on('pageerror', e => errQ.push(String(e)));
  await q.goto(URL_JOC);
  await q.waitForTimeout(4500);
  const demana = await q.evaluate(() => !!document.getElementById('rec-ini') && N === 1);
  await q.fill('#rec-ini', 'xyz'); await q.click('#rec-si');
  const avis = await q.evaluate(() => document.getElementById('rec-avis').textContent);
  await q.fill('#rec-ini', 'car'); await q.click('#rec-si');
  await q.waitForTimeout(200);
  const r1 = await q.evaluate(() => ({ N, nom: Records.nom(), desat: JSON.parse(localStorage.getItem('rotllana')).n }));
  diu(demana && /no és a la taula/.test(avis) && r1.N === 58 && r1.nom === 'CAR' && r1.desat === 58,
    `en un navegador nou demana les inicials i continua pel nivell que diu la taula (CAR, 57 fets: nivell ${r1.N})`);
  // un navegador amb les inicials ja posades, però més endarrere: ho ofereix
  const q2 = await c2.newPage();
  await q2.goto(URL_JOC);
  await q2.evaluate(() => { localStorage.setItem('jugador', 'CAR'); localStorage.setItem('rotllana', JSON.stringify({ n: 4, monedes: 12, obertes: [], extres: [] })); });
  await q2.reload();
  await q2.waitForTimeout(4500);
  const ofereix = await q2.evaluate(() => document.getElementById('rec-si') && document.getElementById('rec-si').textContent);
  await q2.click('#rec-si');
  const r2 = await q2.evaluate(() => ({ N, monedes }));
  diu(/CONTINUA PEL 58/.test(ofereix || '') && r2.N === 58 && r2.monedes === 30,
    `si aquí vas més endarrere que a la taula, ofereix continuar (${ofereix})`);
  errors.push(...errQ);
  await c2.close();
}

// a 320 px de pantalla la rotllana i els botons hi caben
await p.setViewportSize({ width: 320, height: 640 });
await p.waitForTimeout(300);
s = await p.evaluate(() => {
  const bs = [...document.querySelectorAll('#controls button')].map(b => b.getBoundingClientRect());
  const cv = document.getElementById('game').getBoundingClientRect();
  return { dins: bs.every(r => r.left >= 0 && r.right <= innerWidth), cv: cv.right <= innerWidth && cv.bottom <= innerHeight };
});
diu(s.dins && s.cv, 'a 320 px la rotllana i els botons hi caben');

diu(errors.length === 0, errors.length ? 'error de JavaScript: ' + errors[0] : 'cap error de JavaScript');

console.log(malament ? `\n${malament} coses malament` : '\nLa Rotllana, bé');
await b.close();
servidor.close();
process.exit(malament ? 1 : 0);
