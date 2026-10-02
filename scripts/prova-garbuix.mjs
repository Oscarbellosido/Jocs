// Comprova el Garbuix: que el diccionari es carregui, que les paraules curtes
// i les que no existeixen es rebutgin, que nomes s'encadenin lletres que es
// toquen, que una paraula bona faci desapareixer les boles i en faci caure de
// noves, que al munt sempre hi hagi paraules per fer, i que la partida
// s'acabi.
//
//   node scripts/prova-garbuix.mjs
//
// El joc carrega el diccionari amb fetch(), i des d'una pagina file:// el
// navegador no deixa llegir cap altre fitxer. Per aixo la prova serveix el
// repositori ella mateixa per http, en un port qualsevol de la maquina.

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
const URL_JOC = `http://127.0.0.1:${servidor.address().port}/garbuix.html`;

let malament = 0;
function diu(be, text) { if (!be) malament++; console.log(`${be ? '✓' : '✗'} ${text}`); }

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
await ctx.route('**/jocs-records*/**', r => r.fulfill({ status: 200, contentType: 'application/json',
  headers: { 'access-control-allow-origin': '*' }, body: '[]' }));
const p = await ctx.newPage();
const errors = []; p.on('pageerror', e => errors.push(String(e)));
await p.goto(URL_JOC);
await p.waitForFunction(() => DIC !== null || errorDic, null, { timeout: 20000 });

// --- el diccionari ---
const dic = await p.evaluate(() => ({
  error: errorDic, mida: DIC ? DIC.size : 0,
  hi: ['casa', 'gat', 'formatge', 'cantar', 'bonic', 'bonica', 'pinyol', 'quatre', 'paella', 'cel']
    .filter(w => DIC.has(w)),
  noHi: ['cases', 'cantava', 'xzt', 'barcelona', 'ab'].filter(w => DIC.has(w)),
}));
diu(!dic.error && dic.mida > 80000, `el diccionari es carrega (${dic.mida} paraules)`);
diu(dic.hi.length === 10, `hi ha les paraules de cada dia (${dic.hi.join(' ')})`);
diu(dic.noHi.length === 0, `no hi ha plurals, verbs conjugats, noms propis ni paraules de dues lletres` +
  (dic.noHi.length ? ` (hi són: ${dic.noHi.join(' ')})` : ''));

await p.waitForTimeout(3800);                      // la taula de records d'entrada
const box = await p.locator('#game').boundingBox();
const aPant = (wx, wy) => [box.x + wx / 420 * box.width, box.y + wy / 640 * box.height];

// Posa una paraula a ma al terra de la caixa, en filera i tocant-se.
async function posa(paraula, separa = []) {
  return p.evaluate(({ w, separa }) => {
    start(); boles = []; cua = 0;
    let x0 = CAIXA_E + R;
    (w.match(/qu|ny|./g)).forEach((t, i) => {
      if (separa.includes(i)) x0 += 6 * R;
      afegeix(t, x0 + i * 2 * R, TERRA - R);
    });
    for (let k = 0; k < 90; k++) update(0.016);
    return boles.map(o => [o.x, o.y]);
  }, { w: paraula, separa });
}
async function llisca(pos) {
  const [x0, y0] = aPant(...pos[0]);
  await p.mouse.move(x0, y0); await p.mouse.down();
  for (const q of pos.slice(1)) { const [xx, yy] = aPant(...q); await p.mouse.move(xx, yy, { steps: 6 }); }
  await p.mouse.up(); await p.waitForTimeout(200);
}

// --- jugar amb el dit ---
let pos = await posa('casa');
const idsCasa = await p.evaluate(() => boles.map(o => o.id));
await llisca(pos);
let r = await p.evaluate(ids => ({ fetes, score, ultima, cua, boles: boles.length,
  queden: boles.filter(o => ids.includes(o.id)).length }), idsCasa);
diu(r.fetes === 1 && r.score > 0 && r.queden === 0,
  `lliscant el dit per C-A-S-A es fa la paraula i les boles desapareixen (${r.score} punts)`);
diu(r.cua + r.boles >= 3, `després en cauen de noves (${r.cua + r.boles})`);

// tornant enrere pel mateix cami es treuen lletres: G-A-T-A i enrere fins a la T
pos = await posa('gata');
{
  const [x0, y0] = aPant(...pos[0]);
  await p.mouse.move(x0, y0); await p.mouse.down();
  for (const q of [...pos.slice(1), pos[2]]) { const [xx, yy] = aPant(...q); await p.mouse.move(xx, yy, { steps: 6 }); }
  await p.mouse.up(); await p.waitForTimeout(150);
}
r = await p.evaluate(() => ({ fetes, ultima }));
diu(r.fetes === 1 && r.ultima && r.ultima.p === 'gat',
  `lliscant per G-A-T-A i tornant enrere fins a la T queda «gat» (${JSON.stringify(r.ultima)})`);

// tocar lletres d'una en una ja no fa cap paraula, i sota la caixa nomes hi ha SACSEJA
pos = await posa('gat');
for (const q of pos) { const [xx, yy] = aPant(...q); await p.mouse.click(xx, yy); await p.waitForTimeout(80); }
r = await p.evaluate(() => ({ sel: sel.length, fetes,
  botons: [...document.querySelectorAll('#controls button')].map(b => b.id) }));
diu(r.sel === 0 && r.fetes === 0, `tocar les lletres d'una en una no deixa res marcat`);
diu(r.botons.join() === 'sacseja', `sota la caixa només hi ha el botó SACSEJA (${r.botons.join(', ')})`);

pos = await posa('xzt');
await llisca(pos);
r = await p.evaluate(() => ({ fetes, avis, boles: boles.length }));
diu(r.fetes === 0 && r.boles === 3, `X-Z-T es rebutja i les boles es queden («${r.avis}»)`);

pos = await posa('sol');
await p.evaluate(() => { sel = boles.slice(0, 2).map(o => o.id); envia(); });
r = await p.evaluate(() => ({ fetes, avis, boles: boles.length }));
diu(r.fetes === 0 && r.boles === 3, `una de dues lletres no compta («${r.avis}»)`);

pos = await posa('sol', [2]);
{
  const [x0, y0] = aPant(...pos[0]);
  await p.mouse.move(x0, y0); await p.mouse.down();
  for (const q of pos.slice(1)) { const [xx, yy] = aPant(...q); await p.mouse.move(xx, yy, { steps: 6 }); }
}
r = await p.evaluate(() => sel.map(id => perId(id).t).join(''));
await p.mouse.up(); await p.waitForTimeout(150);
const fetesSol = await p.evaluate(() => fetes);
diu(r === 'so' && fetesSol === 0, `S, O i una L que no els toca no s'encadenen (la tria és «${r}»)`);

pos = await posa('pinyol');
await llisca(pos);
r = await p.evaluate(() => ({ fetes, ultima }));
diu(r.fetes === 1, `la NY va en una sola bola: PI-NY-O-L és «pinyol» (${JSON.stringify(r.ultima)})`);

// --- partides senceres amb un pilot ---
// El pilot fa el que faria una persona amb poca traça: de les paraules que hi
// ha al munt, nomes en veu de tres i quatre lletres, i en tria una a l'atzar.
const partides = await p.evaluate(() => {
  const arrel = {};
  for (const w of DIC) { let n = arrel; for (const ch of w) n = n[ch] || (n[ch] = {}); n.$ = 1; }
  function totes() {
    const veins = new Map(boles.map(a => [a.id, boles.filter(o => o !== a && toquen(a, o))]));
    const trobades = new Map();
    function dfs(o, node, cami, text) {
      let n = node;
      for (const ch of o.t) { n = n[ch]; if (!n) return; }
      cami.push(o.id); text += o.t;
      if (n.$ && text.length >= 3) trobades.set(text, cami.slice());
      if (text.length < 10) for (const nb of veins.get(o.id)) if (!cami.includes(nb.id)) dfs(nb, n, cami, text);
      cami.pop();
    }
    for (const o of boles) dfs(o, arrel, [], '');
    return [...trobades.entries()];
  }
  function assenta() {
    for (let k = 0; k < 600; k++) {
      update(0.033);
      if (state !== 'play' || cua > 0) continue;
      let quiet = true;
      for (const o of boles) if (Math.hypot(o.x - o.px, o.y - o.py) > 0.5) { quiet = false; break; }
      if (quiet && k > 10) return;
    }
  }
  const out = [];
  for (let g = 0; g < 4; g++) {
    start(); assenta();
    const res = { paraules: 0, minim: Infinity, torns: 0, fi: '' };
    while (state === 'play' && res.torns < 400) {
      res.torns++;
      const tot = totes();
      res.minim = Math.min(res.minim, tot.length);
      const curtes = tot.filter(([w]) => w.length <= 4);
      const llista = curtes.length ? curtes : tot;
      if (!llista.length) { sacseja(); assenta(); continue; }
      sel = llista[Math.floor(Math.random() * llista.length)][1].slice();
      envia(); res.paraules++;
      assenta();
    }
    res.fi = state;
    out.push(res);
  }
  return out;
});
const minim = Math.min(...partides.map(x => x.minim));
diu(minim > 0, `a cada torn hi havia paraules per fer (com a mínim ${minim})`);
diu(partides.every(x => x.fi === 'over'),
  `les partides s'acaben, la caixa acaba vessant (${partides.map(x => x.paraules).join(', ')} paraules)`);
diu(partides.every(x => x.paraules >= 15),
  `ningú no es mor de seguida: com a mínim ${Math.min(...partides.map(x => x.paraules))} paraules`);

// el quadre del final: la darrera partida del pilot ha vessat
await p.waitForTimeout(1200);
r = await p.evaluate(() => ({ state, display: document.getElementById('msg').style.display,
  text: document.getElementById('msg').textContent }));
diu(r.state === 'over' && r.display === 'block' && r.text.includes('VESSAT'),
  `quan vessa surt el quadre del final («${r.text.slice(0, 40)}…»)`);

diu(errors.length === 0, errors.length ? 'error de JavaScript: ' + errors[0] : 'cap error de JavaScript');

console.log(malament ? `\n${malament} coses malament` : '\nel Garbuix, bé');
await b.close();
servidor.close();
process.exit(malament ? 1 : 0);
