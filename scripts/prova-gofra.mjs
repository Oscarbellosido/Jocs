// Comprova La Gofra: que la del dia sigui la mateixa per a tothom, que totes
// les gofres de l'any que ve es puguin fer i es resolguin amb 10 intercanvis,
// que els colors diguin la veritat, que es jugui tocant i arrossegant, que
// les verdes no es moguin, que guanyar i perdre vagin com toca, que la del
// dia no es pugui tornar a començar tancant i obrint, i que s'apunti a la
// taula del dia i a la de les estrelles.
//
//   node scripts/prova-gofra.mjs

import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const ARREL = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const URL_JOC = 'file://' + resolve(ARREL, 'gofra.html');

let malament = 0;
function diu(be, text) { if (!be) malament++; console.log(`${be ? '✓' : '✗'} ${text}`); }

const b = await chromium.launch();
const enviats = [];
const errors = [];
async function obre(ctx) {
  const p = await ctx.newPage();
  p.on('pageerror', e => errors.push(String(e)));
  await p.goto(URL_JOC);
  await p.waitForTimeout(400);
  return p;
}
async function context() {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  await ctx.route('**/jocs-records*/**', r => {
    const post = r.request().method() === 'POST';
    if (post) enviats.push(r.request().url());
    return r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' },
      body: post ? JSON.stringify({ top: [{ n: 'TST', p: 5, t: 1 }], posicio: 1 }) : '[]' });
  });
  return ctx;
}

// Resol la gofra com ho faria algu que no s'equivoca: primer els intercanvis
// que posen dues lletres al seu lloc de cop, i si no n'hi ha, un que en posi una.
const RESOL = `(() => {
  let n = 0;
  for (let g = 0; g < 40 && !resolta(G); g++) {
    let fet = false;
    for (const [f, k] of CASELLES) { if (G.cur[f][k] === G.sol[f][k]) continue;
      for (const [a, c] of CASELLES) { if ((a === f && c === k) || G.cur[a][c] === G.sol[a][c]) continue;
        if (G.cur[a][c] === G.sol[f][k] && G.cur[f][k] === G.sol[a][c]) { intercanvia([f, k], [a, c]); n++; fet = true; break } }
      if (fet) break; }
    if (fet) continue;
    for (const [f, k] of CASELLES) { if (G.cur[f][k] === G.sol[f][k]) continue;
      const o = CASELLES.find(([a, c]) => G.cur[a][c] === G.sol[f][k] && G.cur[a][c] !== G.sol[a][c]);
      intercanvia([f, k], o); n++; break; }
  }
  return n;
})()`;

const ctx1 = await context();
let p = await obre(ctx1);

// --- la del dia, la mateixa per a tothom ---
const ctx2 = await context();
const p2 = await obre(ctx2);
const a = await p.evaluate(() => ({ par: G.paraules.join(), cur: G.cur.map(f => f.join('')).join('/'), num: numero }));
const b2 = await p2.evaluate(() => ({ par: G.paraules.join(), cur: G.cur.map(f => f.join('')).join('/') }));
diu(a.par === b2.par && a.cur === b2.cur, `la gofra del dia (#${a.num}) és la mateixa a dos mòbils diferents`);
await ctx2.close();

// --- un any de gofres ---
r = await p.evaluate(() => {
  const res = { mal: [], verdesMin: 99, verdesMax: 0, resol: [], bo: [], llista: true };
  const d0 = Date.parse('2026-10-03T12:00:00Z');
  for (let i = 0; i < 365; i++) {
    const d = new Date(d0 + i * 864e5).toISOString().slice(0, 10);
    const g = novaGofra('GOFRA-' + d);
    if (!g.paraules || new Set(g.paraules).size !== 6) { res.mal.push(d); continue; }
    if (!g.paraules.every(w => LLISTA.includes(w))) res.llista = false;
    // les sis paraules es llegeixen de debo a la solucio
    const llegides = [0, 2, 4].map(f => g.sol[f].join('')).concat([0, 2, 4].map(k => [0, 1, 2, 3, 4].map(f => g.sol[f][k]).join('')));
    if (llegides.join() !== g.paraules.join()) res.mal.push(d + ' no quadra');
    // les mateixes lletres, nomes canviades de lloc
    const lletres = G2 => CASELLES.map(([f, k]) => G2[f][k]).sort().join('');
    if (lletres(g.cur) !== lletres(g.sol)) res.mal.push(d + ' lletres diferents');
    const v = CASELLES.filter(([f, k]) => g.cur[f][k] === g.sol[f][k]).length;
    res.verdesMin = Math.min(res.verdesMin, v); res.verdesMax = Math.max(res.verdesMax, v);
    // quants intercanvis calen seguint els cicles
    const G0 = G; G = { ...g, cur: g.cur.map(f => f.slice()), queden: 99, fi: null }; state = 'play';
    G.verdesAbans = verdes(G); G.paraulesFetes = new Set();
    let n = 0;
    for (let t = 0; t < 40 && !resolta(G); t++) {
      let fet = false;
      for (const [f, k] of CASELLES) { if (G.cur[f][k] === G.sol[f][k]) continue;
        for (const [a, c] of CASELLES) { if ((a === f && c === k) || G.cur[a][c] === G.sol[a][c]) continue;
          if (G.cur[a][c] === G.sol[f][k] && G.cur[f][k] === G.sol[a][c]) { [G.cur[f][k], G.cur[a][c]] = [G.cur[a][c], G.cur[f][k]]; n++; fet = true; break } }
        if (fet) break; }
      if (fet) continue;
      for (const [f, k] of CASELLES) { if (G.cur[f][k] === G.sol[f][k]) continue;
        const o = CASELLES.find(([a, c]) => G.cur[a][c] === G.sol[f][k] && G.cur[a][c] !== G.sol[a][c]);
        [G.cur[f][k], G.cur[o[0]][o[1]]] = [G.cur[o[0]][o[1]], G.cur[f][k]]; n++; break; }
    }
    res.resol.push(n);
    G = G0;
    // el cami bo: desfer els cicles de la barreja
    const c2 = g.cur.map(f => f.slice());
    for (const [[f1, k1], [f2, k2]] of g.desfer) [c2[f1][k1], c2[f2][k2]] = [c2[f2][k2], c2[f1][k1]];
    res.bo.push(CASELLES.every(([f, k]) => c2[f][k] === g.sol[f][k]) ? g.desfer.length : 99);
  }
  return res;
});
var r;
diu(!r.mal.length && r.llista, `les gofres dels 365 dies que vénen es poden fer, amb sis paraules de la llista` + (r.mal.length ? ' (' + r.mal.slice(0, 3).join(', ') + ')' : ''));
diu(r.bo.every(n => n === 10), `totes es resolen amb 10 intercanvis justos, i n'hi ha 15`);
diu(Math.max(...r.resol) <= 15, `fins i tot posant lletres d'una en una sense pensar-hi, n'hi ha prou amb ${Math.max(...r.resol)}`);
diu(r.verdesMin >= 5 && r.verdesMax <= 7, `comencen amb ${r.verdesMin} a ${r.verdesMax} lletres verdes`);

// --- els colors ---
r = await p.evaluate(() => {
  const sol = Array.from({ length: 5 }, () => Array(5).fill(null));
  const ps = ['casat', 'tirar', 'serra', 'cotxe', 'serps', 'tarta'];
  [0, 2, 4].forEach((f, i) => { for (let k = 0; k < 5; k++) sol[f][k] = ps[i][k] });
  [0, 2, 4].forEach((k, i) => { for (let f = 0; f < 5; f++) sol[f][k] = ps[3 + i][f] });
  const cur = sol.map(f => f.slice());
  // canvia la A (0,1) per la X de COTXE (3,0): la X no es de CASAT ni la A de COTXE
  [cur[0][1], cur[3][0]] = [cur[3][0], cur[0][1]];
  // canvia la S (0,2) de CASAT per la T (0,4): totes dues son de CASAT
  [cur[0][2], cur[0][4]] = [cur[0][4], cur[0][2]];
  const col = colors({ sol, cur });
  return { x: col[0][1], a: col[3][0], s: col[0][4], t: col[0][2], c: col[0][0] };
});
diu(r.c === 'v' && r.x === 'x' && r.a === 'x', `verd la que és al seu lloc, gris la que no és de la seva paraula`);
diu(r.t === 'g' && r.s === 'g', `groc la que és de la paraula però mal posada`);

// --- jugar amb el dit ---
const box = await p.locator('#game').boundingBox();
const aPant = (f, k) => {
  const cx = 34 + k * 72 + 30, cy = 104 + f * 72 + 30;
  return [box.x + cx / 420 * box.width, box.y + cy / 600 * box.height];
};
await p.evaluate(() => obrePractica());
let parella = await p.evaluate(() => {
  const mal = CASELLES.filter(([f, k]) => G.cur[f][k] !== G.sol[f][k]);
  return [mal[0], mal[1], G.cur[mal[0][0]][mal[0][1]], G.cur[mal[1][0]][mal[1][1]]];
});
await p.mouse.click(...aPant(...parella[0])); await p.waitForTimeout(80);
await p.mouse.click(...aPant(...parella[1])); await p.waitForTimeout(300);
r = await p.evaluate(([a, c]) => ({ x: G.cur[a[0]][a[1]], y: G.cur[c[0]][c[1]], q: G.queden }), parella);
diu(r.x === parella[3] && r.y === parella[2] && r.q === 14, `tocant dues lletres s'intercanvien i en queden 14`);

parella = await p.evaluate(() => {
  const mal = CASELLES.filter(([f, k]) => G.cur[f][k] !== G.sol[f][k]);
  return [mal[2], mal[3], G.cur[mal[2][0]][mal[2][1]], G.cur[mal[3][0]][mal[3][1]]];
});
await p.mouse.move(...aPant(...parella[0])); await p.mouse.down();
await p.mouse.move(...aPant(...parella[1]), { steps: 8 }); await p.mouse.up();
await p.waitForTimeout(300);
r = await p.evaluate(([a, c]) => ({ x: G.cur[a[0]][a[1]], y: G.cur[c[0]][c[1]], q: G.queden }), parella);
diu(r.x === parella[3] && r.y === parella[2] && r.q === 13, `arrossegant una lletra sobre una altra també`);

const verda = await p.evaluate(() => CASELLES.find(([f, k]) => G.cur[f][k] === G.sol[f][k]));
const mal1 = await p.evaluate(() => CASELLES.find(([f, k]) => G.cur[f][k] !== G.sol[f][k]));
await p.mouse.click(...aPant(...verda)); await p.waitForTimeout(80);
await p.mouse.click(...aPant(...mal1)); await p.waitForTimeout(300);
r = await p.evaluate(v => ({ q: G.queden, encara: G.cur[v[0]][v[1]] === G.sol[v[0]][v[1]] }), verda);
diu(r.q === 13 && r.encara, `les verdes no es mouen ni gasten intercanvis`);

// --- perdre ---
enviats.length = 0;
r = await p.evaluate(() => {
  obrePractica();
  // intercanvia sempre dues mal posades que no es posen be
  for (let i = 0; i < 20 && state === 'play'; i++) {
    const mal = CASELLES.filter(([f, k]) => G.cur[f][k] !== G.sol[f][k]);
    let fet = false;
    for (const a of mal) { for (const c of mal) { if (a === c) continue;
      if (G.cur[c[0]][c[1]] !== G.sol[a[0]][a[1]] && G.cur[a[0]][a[1]] !== G.sol[c[0]][c[1]]) { intercanvia(a, c); fet = true; break } }
      if (fet) break; }
    if (!fet) intercanvia(mal[0], mal[1]);
  }
  return { fi: G.fi, q: G.queden };
});
await p.waitForTimeout(1300);
let text = await p.evaluate(() => document.getElementById('msg').textContent);
diu(r.fi === 'perdut' && r.q === 0 && /SENSE INTERCANVIS/.test(text), `sense intercanvis s'acaba i ensenya les sis paraules`);
diu(enviats.length === 0, `la de pràctica no s'apunta enlloc`);

// --- guanyar la del dia ---
enviats.length = 0;
await p.evaluate(() => { localStorage.clear(); stats = { jugades: 0, guanyades: 0, estrelles: 0, ratxa: 0, millor: 0, ultim: '' }; obreDia(); });
const usats = await p.evaluate(RESOL);
await p.waitForTimeout(1800);
await p.waitForSelector('#rec-ok', { timeout: 4000 }).catch(() => {});
if (await p.$('#rec-ok')) { await p.fill('#rec-nom', 'TST'); await p.click('#rec-ok'); }
await p.waitForTimeout(1000);
r = await p.evaluate(() => ({ fi: G.fi, q: G.queden, est: estrelles(), stats, text: document.getElementById('msg').textContent,
  links: [...document.querySelectorAll('#msg .reptes a')].map(a => decodeURIComponent(a.getAttribute('href'))), comparteix: textCompartir() }));
const dia = await p.evaluate(() => dia);
diu(r.fi === 'guanyat' && r.est === Math.min(5, r.q) && /FETA/.test(r.text), `resolta en ${usats} intercanvis: ${r.est} estrelles`);
diu(r.links.length === 3 && /t\.me\/share/.test(r.links[0]) && r.comparteix.includes('#') && r.comparteix.includes('🟩') &&
  !r.comparteix.toLowerCase().includes(await p.evaluate(() => G.paraules[0])),
  `es pot enviar a Telegram o WhatsApp el dibuix de colors, sense desvetllar les paraules`);
diu(enviats.some(u => u.endsWith('/records/gofra_dia/' + dia)) && enviats.some(u => u.endsWith('/records/gofra')),
  `s'apunta a la taula d'avui i a la de les estrelles (${enviats.map(u => u.replace(/.*records/, '…')).join(' ')})`);
diu(r.stats.jugades === 1 && r.stats.estrelles === r.est && r.stats.ratxa === 1, `les estadístiques: 1 dia, ${r.stats.estrelles} estrelles, ratxa 1`);

// tancar i tornar a obrir: la del dia ja esta feta i no compta dues vegades
enviats.length = 0;
const p3 = await obre(ctx1);
await p3.waitForTimeout(1500);
r = await p3.evaluate(() => ({ fi: G.fi, estat: state, stats }));
diu(r.fi === 'guanyat' && r.estat === 'over' && r.stats.jugades === 1 && enviats.length === 0,
  `si tanques i tornes a obrir, la del dia surt acabada i no es torna a comptar`);

// a mitges: es desa
await p3.evaluate(() => { localStorage.removeItem('gofra-' + dia); obreDia(); });
const mig = await p3.evaluate(() => { const mal = CASELLES.filter(([f, k]) => G.cur[f][k] !== G.sol[f][k]); intercanvia(mal[0], mal[1]); return { q: G.queden, cur: G.cur.map(f => f.join('')).join('/') } });
const p4 = await obre(ctx1);
r = await p4.evaluate(() => ({ q: G.queden, cur: G.cur.map(f => f.join('')).join('/') }));
diu(r.q === mig.q && r.cur === mig.cur, `una del dia a mig fer es troba igual en tornar-hi (en queden ${r.q})`);

diu(errors.length === 0, errors.length ? 'error de JavaScript: ' + errors[0] : 'cap error de JavaScript');
console.log(malament ? `\n${malament} coses malament` : '\nLa Gofra, bé');
await b.close();
process.exit(malament ? 1 : 0);
