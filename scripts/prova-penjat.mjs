// Comprova El Penjat: que les paraules estiguin ben fetes (de 5 a 10 lletres,
// sense repetides, cadascuna amb el seu tema), que la del dia sigui igual per
// a tothom, que no se'n repeteixi cap fins que no han sortit totes i mai dos
// dies seguits del mateix tema; i que es jugui tocant: encertar, fallar, la
// lletra repetida, guanyar (les dues taules), perdre (el bruixot sencer),
// desar i continuar, la pràctica (que no compta), la P del teclat de
// l'ordinador i que hi capiga a 320 px.
//
//   node scripts/prova-penjat.mjs

import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const ARREL = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const URL_JOC = 'file://' + resolve(ARREL, 'penjat.html');
let malament = 0;
const diu = (be, text) => { if (!be) malament++; console.log(`${be ? '✓' : '✗'} ${text}`); };

const b = await chromium.launch();
const errors = [], enviats = [];
const obre = async (data, { w = 390, h = 780, neteja = false, ctx = null } = {}) => {
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
  if (neteja) { await p.evaluate(() => { localStorage.clear(); localStorage.setItem('jugador', 'TST'); }); await p.reload(); }
  await p.waitForTimeout(400);
  await p.evaluate(() => { document.querySelectorAll('body > div[style*="position: fixed"]').forEach(d => { if (d.id !== 'msg') d.remove(); }); paused = false; });
  return { ctx, p };
};
const toca = (p, l) => p.click(`#teclat button[data-l="${l}"]`);
// les lletres que hi són i les que no, de la paraula que s'està jugant
const lletres = p => p.evaluate(() => {
  const hi = [...new Set(lletresDe(P.w).map(x => x.p).filter(Boolean))];
  return { hi, no: [...'QWERTYUIOPASDFGHJKLZXCVBNM'].filter(l => !hi.includes(l)) };
});

// ---------- les paraules ----------
let { ctx, p } = await obre('2026-11-10', { neteja: true });
const d = await p.evaluate(() => {
  const pl = PARAULES.map(x => pla(x.w));
  const perTema = TEMES.map((_, i) => PARAULES.filter(x => x.t === i).length);
  const L = PARAULES.length, dies = [];
  for (let n = 1; n <= L; n++) dies.push(paraulaDe(n));
  let seguits = 0; for (let n = 2; n <= 400; n++) if (paraulaDe(n).t === paraulaDe(n - 1).t) seguits++;
  return {
    n: L, temes: TEMES.length, minTema: Math.min(...perTema),
    llargs: pl.every(x => x.length >= 5 && x.length <= 10 && /^[A-Z]+$/.test(x)),
    repetides: pl.length - new Set(pl).size,
    totes: new Set(dies.map(x => x.w)).size, seguits,
    igual: paraulaDe(7).w === paraulaDe(7).w && paraulaDe(1).w,
    trossos: TROSSOS.length, dins: TROSSOS.every(([, pol]) => pol.every(([x, y]) => x >= 0 && x <= 1024 && y >= 0 && y <= 1024)),
  };
});
diu(d.n >= 300 && d.temes >= 30 && d.minTema >= 5, `${d.n} paraules de ${d.temes} temes, com a mínim ${d.minTema} per tema`);
diu(d.llargs && d.repetides === 0, `totes fan de 5 a 10 lletres (sense accents) i no se'n repeteix cap (${d.repetides} repetides)`);
diu(d.totes === d.n, `en ${d.n} dies no surt cap paraula dues vegades (${d.totes} de diferents)`);
diu(d.seguits === 0, `en 400 dies, mai dos dies seguits del mateix tema (${d.seguits})`);
diu(d.trossos === 7 && d.dins, 'el bruixot surt en set trossos, i tots són dins de la imatge');
// la del dia, igual en un altre mòbil
const p2 = await (await b.newContext()).newPage();
await p2.clock.setFixedTime(new Date('2026-11-10T10:00:00+01:00'));
await p2.goto(URL_JOC); await p2.waitForTimeout(300);
diu(await p2.evaluate(() => paraulaDe(numero).w) === await p.evaluate(() => paraulaDe(numero).w), 'la paraula del dia és la mateixa a tots els mòbils');
await p2.close();

// ---------- jugar tocant: guanyar ----------
diu(await p.evaluate(() => /EL PENJAT/.test(document.getElementById('msg').textContent) && !!document.getElementById('m-dia')), 'en entrar surt el menú amb la paraula d\'avui i la pràctica');
await p.click('#m-dia'); await p.waitForTimeout(200);
let ll = await lletres(p);
const tema = await p.evaluate(() => document.getElementById('tema').textContent);
diu(await p.evaluate(() => numero === 2 && P.n === 2 && document.querySelectorAll('#paraula span:not(.fix)').length === lletresDe(P.w).filter(x => x.p).length) && /#2/.test(tema),
  `la d'avui és la #2, amb la pista del tema (${tema}) i una casella per lletra`);
await toca(p, ll.no[0]);
diu(await p.evaluate(l => P.errors === 1 && document.querySelector(`#teclat button[data-l="${l}"]`).className === 'no' && document.getElementById('errors').textContent === '1/7', ll.no[0]),
  'una lletra que no hi és: un error, i la tecla queda apagada');
await toca(p, ll.no[0]);
diu(await p.evaluate(() => P.errors === 1), 'tornar a tocar la mateixa lletra no compta');
await toca(p, ll.hi[0]);
diu(await p.evaluate(l => P.errors === 1 && document.querySelector(`#teclat button[data-l="${l}"]`).className === 'si' &&
  [...document.querySelectorAll('#paraula span')].some(s => s.textContent && pla(s.textContent) === l), ll.hi[0]), 'una lletra que hi és surt a la paraula i la tecla es posa verda');
await toca(p, ll.no[1]);
enviats.length = 0;
for (const l of ll.hi.slice(1)) await toca(p, l);
// entra a la taula: surt el quadre de les inicials (ja omplert) i es confirma
for (let k = 0; k < 40 && !await p.$('#rec-ok'); k++) await p.waitForTimeout(100);
if (await p.$('#rec-ok')) await p.click('#rec-ok');
await p.waitForTimeout(800);
const g = await p.evaluate(() => ({ fi: P.fi, guanyat: P.guanyat, errors: P.errors, text: document.getElementById('msg').textContent, w: P.w, comparteix: textCompartir() }));
diu(g.fi && g.guanyat && g.errors === 2 && /ENDEVINADA/.test(g.text) && g.text.includes(g.w.toUpperCase()), `endevinant totes les lletres, guanyes i surt la paraula (${g.w}, ${g.errors} errors)`);
diu(!g.comparteix.toUpperCase().includes(g.w.toUpperCase()) && /🟥🟥⬜/.test(g.comparteix), 'el que s\'envia al grup no diu la paraula');
const dia = enviats.find(e => /\/records\/penjat_dia\/2026-11-10$/.test(e.url)), sempre = enviats.find(e => /\/records\/penjat$/.test(e.url));
diu(dia && dia.punts === 600 && dia.nom === 'TST', `a la taula d'avui: 600 punts amb 2 errors (${dia && dia.punts})`);
diu(sempre && sempre.punts === 1, `i a la de sempre, 1 paraula endevinada (${sempre && sempre.punts})`);
// tornant-hi, no es torna a apuntar
enviats.length = 0;
await p.reload(); await p.waitForTimeout(400);
await p.evaluate(() => document.querySelectorAll('body > div[style*="position: fixed"]').forEach(d => { if (d.id !== 'msg') d.remove(); }));
diu(await p.evaluate(() => /ENDEVINADA/.test(document.getElementById('msg').textContent)), 'tornant a obrir el joc, el menú diu que la d\'avui ja és endevinada');
await p.click('#m-dia'); await p.waitForTimeout(600);
diu(!enviats.some(e => /penjat/.test(e.url)) && await p.evaluate(() => P.fi && P.guanyat), 'i tocant-la ensenya com va anar, sense tornar-la a apuntar');
await ctx.close();

// ---------- perdre ----------
({ ctx, p } = await obre('2026-11-11'));
await p.evaluate(() => { localStorage.setItem('jugador', 'TST'); });
await p.click('#m-dia'); await p.waitForTimeout(200);
ll = await lletres(p);
enviats.length = 0;
for (let i = 0; i < 6; i++) await toca(p, ll.no[i]);
diu(await p.evaluate(() => P.errors === 6 && !P.fi), 'amb sis errors encara es juga');
await toca(p, ll.no[6]); await p.waitForTimeout(2600);
const pe = await p.evaluate(() => ({ fi: P.fi, guanyat: P.guanyat, text: document.getElementById('msg').textContent, falta: document.querySelectorAll('#paraula span.falta').length, n: fi && !fi.guanyat }));
diu(pe.fi && !pe.guanyat && pe.n && /BRUIXOT/.test(pe.text) && pe.falta > 0, 'al setè error el bruixot surt sencer i guanya ell, i la paraula surt en vermell');
const zero = enviats.find(e => /\/records\/penjat_dia\/2026-11-11$/.test(e.url));
diu(zero && zero.punts === 0 && !enviats.some(e => /\/records\/penjat$/.test(e.url)), 'perdent, s\'envia 0 a la d\'avui (compta per a la lliga) i res a la de sempre');
await ctx.close();

// ---------- desar i continuar ----------
({ ctx, p } = await obre('2026-11-12'));
await p.click('#m-dia'); await p.waitForTimeout(200);
ll = await lletres(p);
await toca(p, ll.hi[0]); await toca(p, ll.no[0]);
await p.reload(); await p.waitForTimeout(400);
await p.evaluate(() => document.querySelectorAll('body > div[style*="position: fixed"]').forEach(d => { if (d.id !== 'msg') d.remove(); }));
diu(await p.evaluate(() => /CONTINUA LA D'AVUI/.test(document.getElementById('msg').textContent)), 'tancant a mig fer, el menú ofereix CONTINUA');
await p.click('#m-dia'); await p.waitForTimeout(200);
diu(await p.evaluate(([a, c]) => P.lletres.join() === a + ',' + c && P.errors === 1, [ll.hi[0], ll.no[0]]), 'i continua amb les mateixes lletres i el mateix error');
// la P del teclat de l'ordinador s'escriu
const teP = ll.hi.includes('P') || ll.no.includes('P');
await p.keyboard.press('p');
diu(teP && await p.evaluate(() => P.lletres.includes('P') && !paused), 'la P del teclat de l\'ordinador prova la lletra P, no fa pausa');

// ---------- la pràctica ----------
enviats.length = 0;
await p.click('#menu'); await p.waitForTimeout(150);
await p.click('#m-prac'); await p.waitForTimeout(200);
const pr = await p.evaluate(() => ({ m: mode, w: P.w, avui: paraulaDe(numero).w, tema: document.getElementById('tema').textContent }));
ll = await lletres(p);
for (const l of ll.hi) await toca(p, l);
await p.waitForTimeout(2000);
diu(pr.m === 'practica' && pr.w !== pr.avui && /PRÀCTICA/.test(pr.tema), 'la pràctica és una altra paraula que la d\'avui');
diu(await p.evaluate(() => P.fi && P.guanyat) && !enviats.some(e => /penjat/.test(e.url)), 'i acabant-la no s\'apunta a cap taula');
await ctx.close();

// ---------- hi cap ----------
for (const [w, h] of [[320, 568], [360, 640], [390, 844]]) {
  ({ ctx, p } = await obre('2026-11-13', { w, h }));
  await p.click('#m-dia'); await p.waitForTimeout(200);
  // la paraula més llarga que hi ha
  await p.evaluate(() => { P.w = PARAULES.slice().sort((a, b) => pla(b.w).length - pla(a.w).length)[0].w; pintaTot(); });
  const m = await p.evaluate(() => {
    const dins = el => { const r = el.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth + .5 && r.top >= 0 && r.bottom <= innerHeight + .5; };
    const caselles = [...document.querySelectorAll('#paraula span')];
    return { c: dins(document.getElementById('c')), teclat: dins(document.getElementById('teclat')), paraula: caselles.every(dins),
      scroll: document.documentElement.scrollWidth > innerWidth + 1, tecla: Math.round(document.querySelector('#teclat button').getBoundingClientRect().width), ll: caselles.length };
  });
  diu(m.c && m.teclat && m.paraula && !m.scroll && m.tecla >= 26, `a ${w}×${h} hi cap tot (la paraula de ${m.ll} lletres, tecles de ${m.tecla} px)`);
  await ctx.close();
}

diu(!errors.length, 'cap error de JavaScript ' + (errors[0] || ''));
await b.close();
console.log(malament ? `\n${malament} coses malament` : '\nTot bé');
process.exit(malament ? 1 : 0);
