// Comprova el Lunar Lander: que aterrar a poc a poc i dret sobre una
// plataforma sigui bo, i de pressa, tort o fora sigui estavellar-se; que el
// descens mes barat possible costi mes que els 50 de combustible que dona un
// aterratge bo (si no, la partida no s'acabaria mai); i que un pilot
// automatic aterri de debo des de la sortida.
//
//   node scripts/prova-lander.mjs
//
// Si es toca la gravetat, l'empenta, el consum, l'altura de sortida o les
// plataformes, el segon punt es el que cal mirar.

import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const ARREL = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
await ctx.route('**/jocs-records*/**', r => r.fulfill({
  status: 200, contentType: 'application/json',
  headers: { 'access-control-allow-origin': '*' }, body: '[]',
}));
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', e => errors.push(String(e)));
await p.goto('file://' + resolve(ARREL, 'lunar_lander.html'));
await p.waitForTimeout(700);

let malament = 0;
const diu = (be, txt) => { if (!be) malament++; console.log(`${be ? '✓' : '✗'} ${txt}`); };

// ---- 1. què és aterrar i què és estavellar-se ----
const casos = await p.evaluate(() => {
  const out = [];
  const prova = (nom, fn, espera) => {
    start(); fn();
    ctrl = { esq: 0, dre: 0, motor: 0, aborta: 0 };
    for (let k = 0; k < 120 * 20 && state === 'vol'; k++) pas(PAS);
    out.push({ nom, que: missatge ? missatge.que : 'res', espera });
  };
  const pl = plats.find(q => q.m === 2), mig = (pl.x0 + pl.x1) / 2;
  const sobre = (vy, vx, ang) => () => { m.x = mig; m.y = pl.y - 13; m.vy = vy; m.vx = vx; m.ang = ang * Math.PI / 180; };
  prova('suau i dret damunt una plataforma', sobre(6, 0, 0), 'bo');
  prova('a 20 px/s: aterratge dur', sobre(20, 0, 0), 'dur');
  prova('a 40 px/s: estavellat', sobre(40, 0, 0), 'xoc');
  prova('suau però tort 12°: dur', sobre(6, 0, 12), 'dur');
  prova('suau però tort 25°: estavellat', sobre(6, 0, 25), 'xoc');
  prova('suau però de costat a 40 px/s: estavellat', sobre(6, 40, 0), 'xoc');
  let iMax = 0, dMax = 0;
  for (let i = 0; i < N; i++) { const d = Math.abs(terra[(i + 1) % N] - terra[i]); if (d > dMax) { dMax = d; iMax = i } }
  prova('suau en un pendent: estavellat', () => { m.x = iMax * SEG + 5; m.y = alcadaTerra(m.x) - 30; m.vy = 6; m.vx = 0; m.ang = 0; }, 'xoc');
  const p5 = plats.find(q => q.m === 5);
  prova('suau al mig de la 5X, la més estreta: hi cap', () => { m.x = (p5.x0 + p5.x1) / 2; m.y = p5.y - 13; m.vy = 6; m.vx = 0; m.ang = 0; }, 'bo');
  prova('a la 5X però 8 px descentrat: estavellat', () => { m.x = (p5.x0 + p5.x1) / 2 + 8; m.y = p5.y - 13; m.vy = 6; m.vx = 0; m.ang = 0; }, 'xoc');
  return out;
});
for (const c of casos) diu(c.que === c.espera, `${c.nom}${c.que === c.espera ? '' : ' (ha sortit ' + c.que + ')'}`);

// ---- 2. el descens més barat ha de costar més que el premi ----
const barat = await p.evaluate(() => {
  // per a cada plataforma: sortir just a sobre amb la velocitat de costat més
  // petita, caure lliure i frenar a fons al moment exacte, inclinat el just
  let pitjor = 1e9, on = '';
  for (const q of plats) {
    const alt0 = q.y - 11 - 46;
    for (let encen = 0; encen < alt0; encen += 2)
      for (const angG of [0, 6, 10, 14, 18, 24, 30, 36]) {
        let y = 0, vy = 6, vx = 30, f = 0, en = false;
        const a = angG * Math.PI / 180;
        for (let k = 0; k < 120 * 40; k++) {
          const dt = 1 / 120;
          if (!en && y >= encen) en = true;
          const T = en ? EMPENTA : 0, an = vx > 0.5 ? a : 0;
          vx = Math.max(0, vx - T * Math.sin(an) * dt);
          vy += (G - T * Math.cos(an)) * dt; y += vy * dt;
          if (en) f += CREMA * dt;
          if (en && vy <= 0) break;
          if (y >= alt0) { if (vy / 2 <= BO.vy && vx / 2 <= BO.vx && f < pitjor) { pitjor = f; on = q.m + 'X' } break; }
        }
      }
  }
  return { pitjor: Math.round(pitjor), on };
});
diu(barat.pitjor > 55, `l'aterratge bo més barat possible costa ${barat.pitjor} de combustible (a la ${barat.on}), més que els 50 de premi: la partida sempre s'acaba`);

// ---- 3. un pilot automàtic aterra des de la sortida de debò ----
const pil = await p.evaluate(() => {
  function pilot(obj) {
    const cxp = (obj.x0 + obj.x1) / 2, dx = dist(m.x, cxp), alt = obj.y - (m.y + 11);
    const aprop = Math.abs(dx) < Math.max(2, (obj.x1 - obj.x0) / 2 - 13);
    let cim = 1e9;
    for (let k = -2; k <= Math.ceil(Math.abs(dx) / 5) + 4; k++) cim = Math.min(cim, alcadaTerra(m.x + Math.sign(dx || 1) * k * 5));
    const segur = cim - 45;
    const vxd = Math.max(-40, Math.min(40, dx * 0.45));
    let vyd = !aprop ? (m.y > segur - 10 ? -18 : Math.min(25, (segur - m.y) * 0.5)) : Math.min(55, 4 + Math.max(0, alt) * 0.28);
    let angd = Math.asin(Math.max(-0.8, Math.min(0.8, Math.max(-30, Math.min(30, (vxd - m.vx) * 1.3)) / EMPENTA)));
    if (aprop && alt < 25) angd = 0;
    const tneed = (G - (vyd - m.vy) * 2.2) / Math.max(0.4, Math.cos(m.ang));
    ctrl.motor = tneed > EMPENTA * 0.45 ? 1 : 0;
    const e = angd - m.ang; ctrl.dre = e > 0.02 ? 1 : 0; ctrl.esq = e < -0.02 ? 1 : 0;
  }
  let bons = 0, total = 0, partides = 0;
  for (let g = 0; g < 12; g++) {
    start(); partides++;
    for (let d = 0; d < 40; d++) {
      let obj = null, bd = 1e9;
      for (const q of plats) { const dd = Math.abs(dist(m.x, (q.x0 + q.x1) / 2)); if (dd < bd) { bd = dd; obj = q } }
      let k = 0;
      while (state === 'vol' && k++ < 120 * 90) { pilot(obj); pas(PAS); }
      if (state !== 'missatge') break;
      total++; if (missatge.que === 'bo') bons++;
      if (combustible <= 0) break;
      nouDescens();
    }
  }
  return { bons, total, partides };
});
diu(pil.bons / pil.total >= 0.7, `un pilot automàtic aterra bé ${pil.bons} de ${pil.total} vegades (${Math.round(pil.bons / pil.total * 100)}%)`);
diu(pil.total / pil.partides <= 15, `i la partida s'acaba: ${(pil.total / pil.partides).toFixed(1)} descensos de mitjana`);

diu(errors.length === 0, errors.length ? 'error de JavaScript: ' + errors[0] : 'cap error de JavaScript');
console.log(malament ? `\n${malament} coses malament` : '\nel Lunar Lander, bé');
await b.close();
process.exit(malament ? 1 : 0);
