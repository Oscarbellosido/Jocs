// Comprova L'Estel: que l'estel del dia sigui el mateix per a tothom, amb
// set lletres que surten d'una paraula del diccionari i de 30 a 110 paraules;
// els punts; i que es jugui tocant l'estel: paraules bones, curtes, sense la
// lletra del mig, que no existeixen i repetides, la paraula estel (+10), el
// canvi de tram (que envia els punts a la taula d'avui), desar i continuar,
// barrejar, les pistes, les d'ahir, el teclat de l'ordinador (la P
// s'escriu), el quadre de com vas i que hi capiga a 320 px.
//
// El diccionari es llegeix amb fetch: la prova serveix el repositori per
// http, com la del Garbuix.
//
//   node scripts/prova-estel.mjs

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
  if (!cami.startsWith(ARREL) || !fs.existsSync(cami) || fs.statSync(cami).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': TIPUS[extname(cami)] || 'application/octet-stream' });
  fs.createReadStream(cami).pipe(res);
});
await new Promise(r => servidor.listen(0, '127.0.0.1', r));
const URL_JOC = `http://127.0.0.1:${servidor.address().port}/estel.html`;

let malament = 0;
const diu = (be, text) => { if (!be) malament++; console.log(`${be ? '✓' : '✗'} ${text}`); };
const b = await chromium.launch();
const errors = [], enviats = [];
const obre = async (data, { w = 390, h = 800, neteja = false, ctx = null } = {}) => {
  ctx = ctx || await b.newContext({ viewport: { width: w, height: h }, hasTouch: true });
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
  await p.clock.setFixedTime(new Date(data + 'T10:00:00+01:00'));
  await p.goto(URL_JOC);
  if (neteja) { await p.evaluate(() => { localStorage.clear(); localStorage.setItem('jugador', 'TST'); localStorage.setItem('estel-vist', 'true'); }); await p.reload(); }
  await p.waitForFunction(() => typeof E !== 'undefined' && E && E.sol, null, { timeout: 20000 });
  await p.evaluate(() => { document.querySelectorAll('body > div[style*="position: fixed"]').forEach(d => { if (d.id !== 'msg') d.remove(); }); paused = false; hideMsg(); });
  return { ctx, p };
};
const toca = async (p, w) => { for (const c of w) await p.click(`#estel [data-l="${c}"]`); };
const envia = async p => { await p.click('#b-envia'); await p.waitForTimeout(150); };
const estat = p => p.evaluate(() => ({ trobades: P.trobades.slice(), punts: puntsP(), lider: document.getElementById('lider').textContent, escrit }));

// ===== LES REGLES =====
{
  const { ctx, p } = await obre('2026-11-19', { neteja: true });
  const r = await p.evaluate(() => {
    const dies = Array.from({ length: DIES.length + 100 }, (_, i) => estelDe(D, i + 1));
    return {
      iguals: estelDe(D, 1).lletres.join() === estelDe(D, 1).lletres.join() && estelDe(D, 1).c === estelDe(D, 1).c,
      diferents: new Set(dies.map(e => e.lletres.join())).size,
      be: dies.every(e => e.lletres.length === 7 && e.sol.length >= 28 && e.sol.length <= 115 && !(e.S & RARES)
        && e.sol.some(w => mascara(w) === e.S) && e.sol.every(w => w.length >= 3 && w.includes(e.c) && (mascara(w) & ~e.S) === 0)),
      n: dies.length, estel1: estelDe(D, 1).sol.filter(w => mascara(w) === estelDe(D, 1).S).join(' '),
      mitjana: Math.round(dies.reduce((a, e) => a + e.sol.length, 0) / dies.length),
      n1: numeroDe('2026-11-19'), punts: [puntsDe('sol', 0), puntsDe('casa', 0), puntsDe('cantar', 0)].join(),
      rangs: [rangDe(0, 200), rangDe(6, 200), rangDe(16, 200), rangDe(120, 200)].join(),
    };
  });
  diu(r.iguals && r.diferents === r.n && r.be && r.n1 === 1,
    `l'estel del dia és el mateix per a tothom i cada dia un altre: set lletres d'una paraula del diccionari, sense K, W ni Y, i de 30 a 110 paraules (${r.mitjana} de mitjana en ${r.n} dies, cap joc de lletres repetit; la paraula estel del #1: ${r.estel1})`);
  diu(r.punts === '1,2,6' && r.rangs === '0,1,2,6', `els punts (3 lletres: 1, 4: 2, 6: 6) i els trams (${r.rangs})`);
  const est = await p.evaluate(() => { const w = E.sol.find(x => mascara(x) === E.S); return { w, p: puntsDe(w, E.S) }; });
  diu(est.p === est.w.length + 10, `la paraula estel (${est.w}) val 10 punts més`);
  await ctx.close();
}

// ===== JUGAR TOCANT =====
{
  const { ctx, p } = await obre('2026-11-19', { neteja: true });
  const info = await p.evaluate(() => ({ c: P.c, ll: E.lletres, sol: E.sol, S: E.S, ordre: P.ordre.slice() }));
  const curta = info.sol.slice().sort((a, b) => a.length - b.length)[0];
  await toca(p, curta); await envia(p);
  let e = await estat(p);
  diu(e.trobades.includes(curta) && e.punts === (curta.length === 3 ? 1 : curta.length === 4 ? 2 : curta.length) && /Bé|Molt bé/.test(e.lider),
    `tocant les lletres de «${curta}» i ENVIA, la paraula és bona i suma (${e.punts} punts)`);
  const sum = e.punts;
  // massa curta, sense la del mig, que no existeix, repetida
  const altra = info.ll.find(x => x !== info.c);
  await toca(p, info.c + altra); await envia(p); e = await estat(p);
  const curtaOk = /Massa curta/.test(e.lider);
  await toca(p, altra + altra + altra); await envia(p); e = await estat(p);
  const mig = /Falta la lletra del mig/.test(e.lider);
  const inventada = await p.evaluate(() => { const al = E.lletres; for (let i = 0; i < 500; i++) { const w = P.c + al[i % 7] + al[(i * 3) % 7] + al[(i * 5 + 1) % 7] + P.c; if (!E.sol.includes(w)) return w; } return null; });
  await toca(p, inventada); await envia(p); e = await estat(p);
  const noDic = /No és al diccionari/.test(e.lider);
  await toca(p, curta); await envia(p); e = await estat(p);
  const rep = /ja la tens/.test(e.lider);
  diu(curtaOk && mig && noDic && rep && e.punts === sum && e.trobades.length === 1,
    `les paraules curtes, sense la lletra del mig, inventades («${inventada}») o repetides no compten i ho diu`);
  // esborra
  await toca(p, info.c + altra); await p.click('#b-esborra'); e = await estat(p);
  diu(e.escrit === info.c, 'ESBORRA treu l\'última lletra');
  await p.click('#b-esborra');
  // la paraula estel
  const estel = info.sol.find(w => (() => { let m = 0; for (const c of w) m |= 1 << 'abcdefghijklmnopqrstuvwxyzç'.indexOf(c); return m; })() === info.S);
  enviats.length = 0;
  await toca(p, estel); await envia(p); e = await estat(p);
  diu(e.trobades.includes(estel) && /PARAULA ESTEL/.test(e.lider), `la paraula estel («${estel}») surt anunciada i suma ${e.punts - sum}`);
  // trobar-ne moltes fins a pujar de tram: els punts van a la taula d'avui
  await p.evaluate(() => { for (const w of E.sol.slice(0, Math.ceil(E.sol.length / 3))) if (!P.trobades.includes(w)) P.trobades.push(w); desaP(); pintaTot(); });
  const una = await p.evaluate(() => E.sol.find(w => !P.trobades.includes(w)));
  await toca(p, una); await envia(p); await p.waitForTimeout(1500);
  e = await estat(p);
  const post = enviats.filter(x => /estel_dia\/2026-11-19$/.test(x.url)).pop();
  const nom = await p.evaluate(() => document.getElementById('nomrang').textContent);
  diu(post && post.punts > 0 && post.nom === 'TST', `en canviar de tram (${nom}), els punts s'envien a la taula d'avui (${post && post.punts})`);
  // desar i continuar
  const abans = await p.evaluate(() => ({ t: P.trobades.length, ll: P.lletres }));
  await p.reload();
  await p.waitForFunction(() => typeof E !== 'undefined' && E && E.sol, null, { timeout: 20000 });
  const despres = await p.evaluate(() => ({ t: P.trobades.length, ll: P.lletres, txt: document.getElementById('trobades').textContent }));
  diu(despres.t === abans.t && despres.ll === abans.ll && despres.txt.length > 10, `tancant i tornant a obrir, hi ha les mateixes lletres i les ${despres.t} paraules trobades`);
  // barreja: les mateixes lletres en un altre ordre
  await p.evaluate(() => { paused = false; hideMsg(); });
  const o1 = await p.evaluate(() => P.ordre.join(''));
  let o2 = o1; for (let i = 0; i < 5 && o2 === o1; i++) { await p.click('#b-barreja'); o2 = await p.evaluate(() => P.ordre.join('')); }
  diu(o2 !== o1 && [...o2].sort().join() === [...o1].sort().join(), 'BARREJA canvia l\'ordre de les lletres de fora, i la del mig no es mou');
  // les pistes
  await p.click('#l-pistes'); await p.waitForTimeout(200);
  const pi = await p.evaluate(() => ({ tot: [...document.querySelectorAll('#msg tr')].slice(1).reduce((a, tr) => a + Number(tr.lastElementChild.textContent), 0), falten: E.sol.length - P.trobades.length }));
  diu(pi.tot === pi.falten, `les pistes diuen quantes en falten, per inicial i llargada (${pi.falten})`);
  await p.evaluate(() => hideMsg());
  // el teclat de l'ordinador
  const per = await p.evaluate(() => E.sol.find(w => !P.trobades.includes(w)));
  await p.keyboard.type(per.toUpperCase()); await p.keyboard.press('Enter'); await p.waitForTimeout(150);
  e = await estat(p);
  diu(e.trobades.includes(per), `amb el teclat de l'ordinador també s'escriu i s'envia («${per}»)`);
  if (info.ll.includes('p')) {
    await p.keyboard.press('p'); const pp = await p.evaluate(() => ({ paused, escrit }));
    diu(!pp.paused && pp.escrit === 'p', 'la P del teclat de l\'ordinador s\'escriu, no fa pausa');
    await p.keyboard.press('Backspace');
  }
  await p.evaluate(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'p', code: 'KeyP' })));
  const pa = await p.evaluate(() => getComputedStyle(document.getElementById('pausa')).display);
  await p.click('#pausa');
  diu(pa === 'flex', 'el botó de pausa tapa l\'estel');
  // com vaig
  await p.click('#l-com'); await p.waitForTimeout(400);
  const cv = await p.evaluate(() => document.getElementById('msg').textContent);
  diu(/paraules/.test(cv) && /punts/.test(cv) && /LA D'AVUI/.test(cv) && /dura tot el dia/.test(cv), 'el quadre de com vas diu el tram, les paraules, els punts i la taula d\'avui');
  const tx = await p.evaluate(() => textCompartir());
  diu(/L'Estel #1/.test(tx) && !tx.includes(curta), 'el missatge per al grup no diu cap paraula');
  await ctx.close();
}

// ===== LES D'AHIR =====
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 800 }, hasTouch: true });
  let { p } = await obre('2026-11-19', { neteja: true, ctx });
  await p.evaluate(() => { P.trobades.push(E.sol[0], E.sol[1]); desaP(); });
  const ahirSol = await p.evaluate(() => E.sol.length);
  await p.close();
  ({ p } = await obre('2026-11-20', { ctx }));
  await p.click('#l-ahir'); await p.waitForTimeout(200);
  const r = await p.evaluate(() => ({ txt: document.getElementById('msg').textContent, no: document.querySelectorAll('#msg .llista .no').length, num: P.n }));
  diu(/#1/.test(r.txt) && new RegExp(ahirSol + ' paraules').test(r.txt) && /en vas trobar 2/.test(r.txt) && r.num === 2,
    `l'endemà, «les d'ahir» ensenya totes les paraules de l'estel #1 i quines vas trobar (${ahirSol})`);
  await ctx.close();
}

// ===== A 320 PX =====
for (const [w, h] of [[320, 568], [360, 640], [390, 844]]) {
  const { ctx, p } = await obre('2026-11-19', { w, h, neteja: true });
  await p.evaluate(() => { for (const x of E.sol.slice(0, 25)) P.trobades.push(x); pintaTot(); escrit = 'abcdefghij'; pintaParaula(); });
  const r = await p.evaluate(() => {
    const dins = el => { const c = el.getBoundingClientRect(); return c.top >= 0 && c.bottom <= innerHeight + .5 && c.left >= 0 && c.right <= innerWidth + .5 && c.width > 0; };
    const est = document.getElementById('estel').getBoundingClientRect();
    return { estel: Math.round(est.width), dins: [...document.querySelectorAll('#accions button, #enllacos a, #estel, #rang, #trobades')].every(dins), scroll: document.documentElement.scrollWidth > innerWidth };
  });
  diu(r.dins && r.estel >= 180 && !r.scroll, `a ${w}×${h} hi cap tot: l'estel fa ${r.estel} px`);
  await ctx.close();
}

diu(errors.length === 0, errors.length ? 'error de JavaScript: ' + errors[0] : 'cap error de JavaScript');
await b.close(); servidor.close();
console.log(malament ? `\n${malament} coses malament` : '\nL\'Estel, bé');
process.exit(malament ? 1 : 0);
