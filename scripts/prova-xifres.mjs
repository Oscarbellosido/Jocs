// Comprova el Xifres: que cap ronda no surti sense solucio, que l'objectiu
// sigui sempre de 101 a 999 i no quedi a tocar d'una fitxa de sortida, que
// les operacions prohibides es rebutgin, i que es pugui jugar una partida
// sencera tocant la pantalla fins al quadre del final.
//
//   node scripts/prova-xifres.mjs
//
// La dificultat es mesura amb el cercador complet (de quantes fitxes com a
// minim es pot fer l'objectiu), no amb la primera solucio que surti: la
// primera que troba el cercador rapid en gasta gairebe sempre cinc i no diu
// res de com de dificil es la ronda.

import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const ARREL = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PER_RONDA = 40;

// Tots els valors que es poden fer, i amb quantes fitxes com a minim.
function minimFitxes(nums, objectiu) {
  const millor = new Map();
  const vist = new Set();
  function rec(llista) {
    const clau = llista.map(o => o.v + '/' + o.k).sort().join(',');
    if (vist.has(clau)) return;
    vist.add(clau);
    for (const o of llista) {
      const p = millor.get(o.v);
      if (p === undefined || o.k < p) millor.set(o.v, o.k);
    }
    if (llista.length < 2) return;
    for (let i = 0; i < llista.length; i++)
      for (let j = i + 1; j < llista.length; j++) {
        const a = llista[i], b = llista[j], k = a.k + b.k;
        const resta = [];
        for (let t = 0; t < llista.length; t++) if (t !== i && t !== j) resta.push(llista[t]);
        const gran = Math.max(a.v, b.v), petit = Math.min(a.v, b.v);
        const cands = [a.v + b.v];
        if (a.v !== b.v) cands.push(gran - petit);
        if (a.v !== 1 && b.v !== 1) cands.push(a.v * b.v);
        if (petit > 1 && gran % petit === 0) cands.push(gran / petit);
        for (const v of cands) if (v > 0 && v <= 100000) rec([...resta, { v, k }]);
      }
  }
  rec(nums.map(v => ({ v, k: 1 })));
  return millor.get(objectiu);
}

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
await ctx.route('**/jocs-records*/**', r => r.fulfill({
  status: 200, contentType: 'application/json',
  headers: { 'access-control-allow-origin': '*' }, body: '[]',
}));
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', e => errors.push(String(e)));
await p.goto('file://' + resolve(ARREL, 'xifres.html'));
await p.waitForTimeout(700);

let malament = 0;

// ---- les rondes ----
const rondes = await p.evaluate(N => {
  const out = [];
  for (let r = 1; r <= RONDES; r++)
    for (let k = 0; k < N; k++) {
      ronda = r;
      const t0 = performance.now();
      novaRonda();
      out.push({
        r, nums: fitxes.map(f => f.v), obj: objectiu,
        ms: performance.now() - t0,
        // el joc diu que en sap una: que sigui de debo
        seva: !!busca(fitxes.map(f => f.v), objectiu),
      });
    }
  return out;
}, PER_RONDA);

const perR = {};
let fora = 0, aProp = 0, senseSolucio = 0, pitjorMs = 0;
for (const x of rondes) {
  if (x.obj < 101 || x.obj > 999) fora++;
  if (x.nums.some(n => Math.abs(n - x.obj) <= 15)) aProp++;
  if (!x.seva) senseSolucio++;
  pitjorMs = Math.max(pitjorMs, x.ms);
  const m = minimFitxes(x.nums, x.obj);
  if (m === undefined) senseSolucio++;
  (perR[x.r] ||= {})[m] = ((perR[x.r] || {})[m] || 0) + 1;
}
const total = rondes.length;
const diu = (be, txt) => { if (!be) malament++; console.log(`${be ? '✓' : '✗'} ${txt}`); };
diu(senseSolucio === 0, `${total} rondes generades, totes amb solució exacta`);
diu(fora === 0, `l'objectiu sempre és de 101 a 999 (${fora} fora)`);
diu(aProp === 0, `cap objectiu no queda a tocar d'una fitxa de sortida (${aProp})`);
diu(pitjorMs < 400, `fer una ronda costa com a molt ${pitjorMs.toFixed(0)} ms`);

// La rampa: les primeres rondes s'han de poder veure a ull i les ultimes no.
const mitjana = r => {
  const d = perR[r]; let s = 0, n = 0;
  for (const [k, v] of Object.entries(d)) { s += Number(k) * v; n += v; }
  return s / n;
};
const primera = mitjana(1), ultima = mitjana(10);
diu(primera <= 3.3, `ronda 1: calen ${primera.toFixed(1)} fitxes de mitjana (curta, es veu a ull)`);
diu(ultima >= 4.5, `ronda 10: calen ${ultima.toFixed(1)} fitxes de mitjana (llarga, s'hi ha de pensar)`);
diu(ultima - primera >= 1.2, `la rampa puja de ${primera.toFixed(1)} a ${ultima.toFixed(1)} fitxes`);

// ---- les regles de les operacions ----
const regles = await p.evaluate(() => {
  const out = [];
  const prova = (a, o, bb, que, haDePassar) => {
    ronda = 1; novaRonda();
    fitxes = [{ id: 901, v: a, gran: false }, { id: 902, v: bb, gran: false }];
    inicials = fitxes.map(f => ({ ...f }));
    objectiu = 500; state = 'juga'; historial = []; pila = [];
    selA = 901; opSel = o;
    const abans = fitxes.length;
    opera(902);
    out.push({ que, be: (fitxes.length !== abans) === haDePassar });
  };
  prova(3, '-', 8, 'no deixa fer 3 − 8, que dona negatiu', false);
  prova(5, '-', 5, 'no deixa fer 5 − 5, que dona zero', false);
  prova(7, '/', 2, 'no deixa fer 7 ÷ 2, que dona decimal', false);
  prova(10, '/', 5, 'deixa fer 10 ÷ 5', true);
  prova(6, '*', 7, 'deixa fer 6 × 7', true);
  return out;
});
for (const r of regles) diu(r.be, r.que);

// ---- una partida sencera, tocant la pantalla ----
const box = await p.locator('#game').boundingBox();
const ALT = await p.evaluate(() => H);
await p.evaluate(() => { start(); });
await p.waitForTimeout(150);
const toca = async (cx, cy) => {
  await p.mouse.click(box.x + cx / 400 * box.width, box.y + cy / ALT * box.height);
  await p.waitForTimeout(30);
};
let exactes = 0;
for (let r = 0; r < 10; r++) {
  const sol = await p.evaluate(() => solucio);
  for (const [pp, op, qq] of sol) {
    const on = await p.evaluate(([pp, op, qq]) => {
      const iA = fitxes.findIndex(f => f.v === pp);
      const iB = fitxes.findIndex((f, k) => f.v === qq && k !== iA);
      if (iA < 0 || iB < 0) return null;
      const bA = caixaFitxa(iA), bB = caixaFitxa(iB), bO = caixaOp(OPS.findIndex(o => o[0] === op));
      return [[bA.x + bA.w / 2, bA.y + bA.h / 2], [bO.x + bO.w / 2, bO.y + bO.h / 2],
              [bB.x + bB.w / 2, bB.y + bB.h / 2]];
    }, [pp, op, qq]);
    if (!on) break;
    for (const [cx, cy] of on) await toca(cx, cy);
  }
  if (await p.evaluate(() => millorDist) === 0) exactes++;
  await p.evaluate(() => { esperaSeg = 0; });
  await toca(200, 300);
  await p.waitForTimeout(90);
}
await p.waitForTimeout(600);
const fi = await p.evaluate(() => ({ state, score }));
diu(exactes === 10, `les 10 rondes es poden encertar tocant la pantalla (${exactes}/10)`);
diu(fi.state === 'over', `la partida s'acaba sola a la ronda 10 (${fi.score} punts)`);
diu(errors.length === 0, errors.length ? 'error de JavaScript: ' + errors[0] : 'cap error de JavaScript');

console.log(malament ? `\n${malament} coses malament` : '\nel Xifres, bé');
await b.close();
process.exit(malament ? 1 : 0);
