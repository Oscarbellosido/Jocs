// Comprova El Trencaclosques: que el paisatge del dia surti igual per a
// tothom, que les peces encaixin entre elles (pestanya contra forat), i que
// es jugui amb el dit: treure peces de la safata, que encaixin soles al seu
// lloc, deixar-les per la taula, tornar-les a la safata, les vores primer,
// desar i continuar, acabar-lo (la taula diu el temps, no punts) i fer-ne un
// amb una foto teva, que no compta per a res.
//
//   node scripts/prova-trencaclosques.mjs

import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync, mkdtempSync } from 'fs';
import { tmpdir } from 'os';

const ARREL = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const URL_JOC = 'file://' + resolve(ARREL, 'trencaclosques.html');

let malament = 0;
function diu(be, text) { if (!be) malament++; console.log(`${be ? '✓' : '✗'} ${text}`); }

const b = await chromium.launch();
const errors = [], enviats = [];
const obre = async (w = 390, h = 844, neteja = true) => {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: true });
  await ctx.route('**/jocs-records*/**', r => {
    const q = r.request();
    if (q.method() === 'POST') {
      const cos = JSON.parse(q.postData() || '{}'); enviats.push({ url: q.url(), ...cos });
      return r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ posicio: 1, top: [{ n: cos.nom, p: cos.punts, t: 1 }] }) });
    }
    r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '[]' });
  });
  const p = await ctx.newPage();
  p.on('pageerror', e => errors.push(String(e)));
  await p.goto(URL_JOC);
  if (neteja) { await p.evaluate(() => { localStorage.clear(); localStorage.setItem('jugador', 'TST'); }); await p.reload(); }
  await p.waitForTimeout(500);
  await p.evaluate(() => document.querySelectorAll('body > div[style*="position: fixed"]').forEach(d => { if (d.id !== 'msg') d.remove(); }));
  return { ctx, p };
};
// d'on a on s'arrossega, en punts de la pantalla
const lloc = (p, fn, arg) => p.evaluate(([fn, arg]) => { const r = document.getElementById('c').getBoundingClientRect(); const [x, y] = eval(fn)(arg); return [r.x + x, r.y + y]; }, [fn, arg]);
const arrossega = async (p, [x0, y0], [x1, y1]) => {
  await p.mouse.move(x0, y0); await p.mouse.down(); await p.mouse.move((x0 + x1) / 2, (y0 + y1) / 2, { steps: 4 }); await p.mouse.move(x1, y1, { steps: 4 }); await p.mouse.up();
  await p.waitForTimeout(60);
};
// la casella k de la safata (la pagina que es veu) i on s'ha de deixar anar una peça perque encaixi
const SLOT = 'k => { const [x, y, s] = slotRect(k); return [x + s / 2, y + s / 2]; }';
const CASA = 'i => { const q = G.peces[i], [hx, hy] = casa(q); return [hx + L.pw / 2, hy + L.ph / 2 + L.ph * .45]; }';

let { ctx, p } = await obre();

// ---------- 1. el paisatge i les peces ----------
const d = await p.evaluate(() => {
  const suma = n => { const c = paisatge(n), x = c.getContext('2d'), dd = x.getImageData(0, 0, c.width, c.height).data; let s = 0; for (let i = 0; i < dd.length; i += 397) s = (s * 31 + dd[i]) >>> 0; return s; };
  const G0 = novaPartida('dia', COLS_DIA, FILES_DIA, 'TRENCA-1'); let mal = 0;
  const vs = G0.peces.map(q => voresDe(q.c, q.f, G0.V, G0.cols, G0.files));
  G0.peces.forEach((q, i) => {
    const [dalt, dreta, baix, esq] = vs[i];
    if ((q.f === 0) !== (dalt.s === 0) || (q.c === G0.cols - 1) !== (dreta.s === 0) || (q.f === G0.files - 1) !== (baix.s === 0) || (q.c === 0) !== (esq.s === 0)) mal++;
    if (q.c < G0.cols - 1) { const v2 = vs[i + 1][3]; if (v2.s !== -dreta.s || v2.d !== -dreta.d) mal++; }
    if (q.f < G0.files - 1) { const v2 = vs[i + G0.cols][0]; if (v2.s !== -baix.s || v2.d !== -baix.d) mal++; }
  });
  return { igual: suma(5) === suma(5), diferent: suma(5) !== suma(6), n: G0.peces.length, mal };
});
diu(d.igual && d.diferent, 'el paisatge del dia surt igual per a tothom, i l\'endemà és un altre');
diu(d.n === 35 && d.mal === 0, `el del dia té ${d.n} peces; les vores de fora són planes i cada pestanya té el seu forat a la del costat`);

// ---------- 2. jugar amb el dit ----------
diu(await p.evaluate(() => /EL D'AVUI/.test(document.getElementById('msg').textContent) && !!document.getElementById('m-foto')), 'en entrar, el menú: el d\'avui o una foto teva');
await p.click('#m-dia');
await p.waitForTimeout(1300);
diu(await p.evaluate(() => G && G.safata.length === 35 && G.temps > .8), 'el d\'avui comença amb les 35 peces a la safata, i el rellotge corre');
let i0 = await p.evaluate(() => G.safata[0]);
await arrossega(p, await lloc(p, SLOT, 0), await lloc(p, CASA, i0));
diu(await p.evaluate(i => G.peces[i].e === 'l' && !G.safata.includes(i), i0), 'arrossegant una peça de la safata al seu lloc, hi encaixa');
// una altra, a qualsevol lloc de la taula
let i1 = await p.evaluate(() => G.safata[0]);
const lluny = await p.evaluate(i => { const q = G.peces[i], r = document.getElementById('c').getBoundingClientRect(); const x = q.c < 2 ? L.fx + L.fw * .8 : L.fx + L.fw * .1; return [r.x + x + L.pw / 2, r.y + L.fy + (q.f < 3 ? L.fh * .75 : L.fh * .1) + L.ph]; }, i1);
await arrossega(p, await lloc(p, SLOT, 0), lluny);
diu(await p.evaluate(i => G.peces[i].e === 't' && G.z.includes(i), i1), 'deixant-la lluny del seu lloc, es queda per la taula');
// i des de la taula, al seu lloc
const deTaula = await p.evaluate(i => { const q = G.peces[i], [x, y] = posDe(q), r = document.getElementById('c').getBoundingClientRect(); return [r.x + x + L.pw / 2, r.y + y + L.ph / 2]; }, i1);
const aCasa = await p.evaluate(i => { const q = G.peces[i], [hx, hy] = casa(q), r = document.getElementById('c').getBoundingClientRect(); return [r.x + hx + L.pw / 2, r.y + hy + L.ph / 2]; }, i1);
await arrossega(p, deTaula, aCasa);
diu(await p.evaluate(i => G.peces[i].e === 'l' && !G.z.includes(i), i1), 'una de la taula, portada al seu lloc, també hi encaixa');
// treure'n una i tornar-la a la safata
const abans = await p.evaluate(() => G.safata.length);
await arrossega(p, await lloc(p, SLOT, 1), await lloc(p, SLOT, 2));
diu(await p.evaluate(n => G.safata.length === n && !G.peces.some(q => q.e === 't'), abans), 'deixant-la a sobre de la safata, hi torna');
await p.tap('#vores');
const vores = await p.evaluate(() => { const v = i => { const q = G.peces[i]; return q.c === 0 || q.f === 0 || q.c === G.cols - 1 || q.f === G.files - 1; }; const n = G.safata.filter(v).length; return { n, primer: G.safata.slice(0, n).every(v), pag: L.pag }; });
diu(vores.n > 0 && vores.primer && vores.pag === 0, `VORES PRIMER posa les ${vores.n} de vora al davant de la safata`);
await p.tap('#model');
diu(await p.evaluate(() => model === true), 'MODEL ensenya la imatge, clareta, dins del marc');
await p.tap('#model');

// ---------- 3. desar i continuar ----------
const desat = await p.evaluate(() => ({ fetes: G.peces.filter(q => q.e === 'l').length, temps: G.temps }));
await p.reload(); await p.waitForTimeout(500);
await p.evaluate(() => document.querySelectorAll('body > div[style*="position: fixed"]').forEach(d => { if (d.id !== 'msg') d.remove(); }));
diu(await p.evaluate(() => /CONTINUA EL D'AVUI/.test(document.getElementById('msg').textContent)), 'tancant i tornant-hi, el menú ofereix CONTINUA EL D\'AVUI');
await p.click('#m-dia');
await p.waitForTimeout(200);
let e = await p.evaluate(() => ({ fetes: G.peces.filter(q => q.e === 'l').length, temps: G.temps }));
diu(e.fetes === desat.fetes && Math.abs(e.temps - desat.temps) < 3, `i continues on eres: ${e.fetes} peces fetes i el rellotge a ${Math.round(e.temps)} s`);

// ---------- 4. acabar-lo ----------
enviats.length = 0;
await p.evaluate(() => { const ultima = G.safata[0]; for (const q of G.peces) if (q !== G.peces[ultima]) q.e = 'l'; G.safata = [ultima]; G.z = []; L.pag = 0; G.temps = 192.2; brut = true; });
const iu = await p.evaluate(() => G.safata[0]);
await arrossega(p, await lloc(p, SLOT, 0), await lloc(p, CASA, iu));
await p.waitForTimeout(1200);
for (let k = 0; k < 30 && !await p.$('#rec-ok'); k++) await p.waitForTimeout(100);
if (await p.$('#rec-ok')) await p.click('#rec-ok');
await p.waitForTimeout(600);
e = await p.evaluate(() => ({ fi: G.fi, temps: G.temps, txt: document.getElementById('msg').textContent }));
const dia = await p.evaluate(() => diaAvui());
const env = enviats.find(x => x.url.includes('trencaclosques_dia/' + dia));
diu(e.fi && /FET!/.test(e.txt) && /3:1\d/.test(e.txt), `amb l'última peça s'acaba, i diu el temps (${e.txt.match(/\d+:\d\d/)?.[0]})`);
diu(env && env.punts === 3600 - Math.round(e.temps), `va a la taula d'avui (3.600 − ${Math.round(e.temps)} segons = ${env && env.punts})`);
diu(/TST\s*3:1\d/.test(e.txt) && !/TST\s*34\d\d/.test(e.txt), 'i a la taula hi surt el temps, no els punts');
enviats.length = 0;
await p.reload(); await p.waitForTimeout(800);
await p.evaluate(() => document.querySelectorAll('body > div[style*="position: fixed"]').forEach(d => { if (d.id !== 'msg') d.remove(); }));
diu(await p.evaluate(() => /FET EN 3:1\d/.test(document.getElementById('msg').textContent)), 'tornant-hi, el menú diu que ja l\'has fet i en quant de temps');
await p.click('#m-dia'); await p.waitForTimeout(500);
diu(await p.evaluate(() => G.fi && /FET!/.test(document.getElementById('msg').textContent)) && !enviats.length, 'i tocant-lo ensenya com va anar, sense tornar-lo a apuntar');

// ---------- 5. una foto teva ----------
const carpeta = mkdtempSync(resolve(tmpdir(), 'trenca-'));
const png = await p.evaluate(() => { const c = document.createElement('canvas'); c.width = 800; c.height = 600; const x = c.getContext('2d');
  for (let i = 0; i < 40; i++) { x.fillStyle = `hsl(${i * 37},70%,55%)`; x.fillRect((i % 8) * 100, Math.floor(i / 8) * 120, 100, 120); } return c.toDataURL('image/png'); });
const fitxer = resolve(carpeta, 'foto.png'); writeFileSync(fitxer, Buffer.from(png.split(',')[1], 'base64'));
await p.evaluate(() => { hideMsg(); menu(); });
await p.setInputFiles('#fitxer', fitxer);
await p.waitForTimeout(500);
diu(await p.evaluate(() => /QUANTES PECES/.test(document.getElementById('msg').textContent) && document.querySelectorAll('#msg .quantes a').length === 4), 'triant una foto, pregunta quantes peces');
await p.click('#msg .quantes a >> nth=0');
await p.waitForTimeout(300);
e = await p.evaluate(() => ({ mode, n: G.peces.length, ar: IMG.width / IMG.height, cols: G.cols, files: G.files, lider: document.getElementById('lider').textContent }));
diu(e.mode === 'foto' && e.n >= 10 && e.n <= 14 && e.cols > e.files && /no compta/.test(e.lider), `la foto (apaïsada) es talla en ${e.n} peces (${e.cols} × ${e.files}), i diu que no compta`);
await p.reload(); await p.waitForTimeout(500);
await p.evaluate(() => document.querySelectorAll('body > div[style*="position: fixed"]').forEach(d => { if (d.id !== 'msg') d.remove(); }));
diu(await p.evaluate(() => /CONTINUA LA TEVA FOTO/.test(document.getElementById('msg').textContent)), 'tancant a mig fer, la foto es pot continuar');
await p.click('#m-cont'); await p.waitForTimeout(400);
enviats.length = 0;
await p.evaluate(() => { const ultima = G.safata[0]; for (const q of G.peces) if (q !== G.peces[ultima]) q.e = 'l'; G.safata = [ultima]; L.pag = 0; brut = true; });
const iff = await p.evaluate(() => G.safata[0]);
await arrossega(p, await lloc(p, SLOT, 0), await lloc(p, CASA, iff));
await p.waitForTimeout(1300);
diu(await p.evaluate(() => mode === 'foto' && G.fi && /no compten/.test(document.getElementById('msg').textContent)) && !enviats.length, 'acabant la foto, no s\'apunta a cap taula');
await ctx.close();

// ---------- 6. que hi càpiga ----------
for (const [w, h] of [[320, 568], [360, 640], [390, 844]]) {
  ({ ctx, p } = await obre(w, h));
  await p.click('#m-dia'); await p.waitForTimeout(300);
  const r = await p.evaluate(() => {
    const dins = el => { const c = el.getBoundingClientRect(); return c.left >= -1 && c.right <= innerWidth + 1 && c.top >= -1 && c.bottom <= innerHeight + 1; };
    return { dins: [document.getElementById('c'), ...document.querySelectorAll('#controls button'), document.querySelector('#wrap > small')].every(dins),
      marc: L.fx >= 0 && L.fx + L.fw <= L.W && L.fy + L.fh <= L.sy, peca: Math.round(L.pw), slot: Math.round(L.slot), porPag: L.porPag };
  });
  diu(r.dins && r.marc && r.slot >= 44 && r.peca >= 40, `a ${w}×${h} hi cap tot: peces de ${r.peca} px al marc, i a la safata ${r.porPag} caselles de ${r.slot} px`);
  await ctx.close();
}

diu(!errors.length, 'cap error de JavaScript' + (errors.length ? ': ' + errors.join(' | ') : ''));
await b.close();
console.log(malament ? `\n${malament} coses malament` : '\nTot bé');
process.exit(malament ? 1 : 0);
