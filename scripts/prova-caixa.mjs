// Comprova La Caixa Forta: les pistes (al seu lloc i en un altre lloc, amb
// colors repetits), que la del dia sigui igual per a tothom, que totes les
// combinacions es puguin obrir dins dels intents jugant amb cap (un jugador
// automàtic que només prova combinacions que encaixen amb les pistes), i que
// es jugui tocant: posar colors, treure'n, esborrar, comprovar, la
// combinació repetida, guanyar (les dues taules), perdre (0 per a la lliga),
// desar i continuar, la pràctica difícil, la pausa i que hi capiga a 320 px.
//
//   node scripts/prova-caixa.mjs

import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const ARREL = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const URL_JOC = 'file://' + resolve(ARREL, 'caixa.html');
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
const color = (p, c) => p.click(`#paleta button[data-c="${c}"]`);
const comprova = async p => { await p.click('#b-comprova'); await p.waitForTimeout(800); };
const posaTots = async (p, g) => { for (const c of g) await color(p, c); };
// el jugador automàtic: la primera combinació que encaixa amb totes les pistes
const seguent = p => p.evaluate(() => {
  const tots = []; const N = P.N, K = P.K;
  const rec = a => { if (a.length === N) { tots.push(a); return; } for (let c = 0; c < K; c++) rec([...a, c]); };
  rec([]);
  return tots.find(g => P.intents.every(x => { const q = pistes(g, x.g); return q.lloc === x.lloc && q.mal === x.mal; }));
});

// ===== LES REGLES =====
{
  const { ctx, p } = await obre('2026-11-18', { neteja: true });
  const r = await p.evaluate(() => [
    pistes([0, 1, 2, 3], [0, 1, 2, 3]), pistes([0, 0, 1, 1], [1, 1, 0, 0]), pistes([0, 1, 2, 3], [0, 2, 1, 5]),
    pistes([0, 0, 0, 1], [0, 1, 1, 1]), pistes([2, 2, 3, 3], [2, 2, 2, 2]), pistes([5, 4, 3, 2], [0, 1, 0, 1]),
  ].map(x => x.lloc + '/' + x.mal).join(' '));
  diu(r === '4/0 0/4 1/2 2/0 2/0 0/0', `les pistes compten bé, també amb colors repetits (${r})`);

  const d = await p.evaluate(() => ({
    a: codiDe(1).join(), b: codiDe(1).join(), c: codiDe(2).join(), n: numeroDe('2026-11-18'), n2: numeroDe('2026-12-01'),
    rang: Array.from({ length: 300 }, (_, i) => codiDe(i + 1)).every(c => c.length === 4 && c.every(x => x >= 0 && x < 6)),
    iguals: new Set(Array.from({ length: 300 }, (_, i) => codiDe(i + 1).join())).size,
  }));
  diu(d.a === d.b && d.a !== d.c && d.n === 1 && d.n2 === 14 && d.rang && d.iguals > 250,
    `la caixa del dia és la mateixa per a tothom, l'endemà és una altra, i la #1 és la del 18 de novembre (${d.iguals} diferents en 300 dies)`);

  // Totes les 1.296 combinacions (4 de 6) s'obren en 10 intents jugant amb cap,
  // i en el difícil (5 de 8), una mostra de 400 en 12.
  const s = await p.evaluate(() => {
    const totes = (N, K) => { const t = []; const rec = a => { if (a.length === N) { t.push(a); return; } for (let c = 0; c < K; c++) rec([...a, c]); }; rec([]); return t; };
    const juga = (codi, N, K, tots) => {
      const fets = [];
      for (let k = 1; k <= 20; k++) {
        const g = tots.find(c => fets.every(x => { const q = pistes(c, x.g); return q.lloc === x.lloc && q.mal === x.mal; }));
        const q = pistes(codi, g); fets.push({ g, ...q });
        if (q.lloc === N) return k;
      }
      return 99;
    };
    const t4 = totes(4, 6), r4 = t4.map(c => juga(c, 4, 6, t4));
    const t5 = totes(5, 8), rn = (() => { let a = 7; return () => (a = (a * 16807) % 2147483647) / 2147483647; })();
    const r5 = Array.from({ length: 400 }, () => juga(Array.from({ length: 5 }, () => Math.floor(rn() * 8)), 5, 8, t5));
    return { max4: Math.max(...r4), mitja4: (r4.reduce((a, b) => a + b) / r4.length).toFixed(1), max5: Math.max(...r5), mitja5: (r5.reduce((a, b) => a + b) / r5.length).toFixed(1) };
  });
  diu(s.max4 <= 10 && s.max5 <= 12,
    `jugant amb cap, totes les caixes s'obren a temps: la normal en ${s.mitja4} intents de mitjana (${s.max4} com a molt de 10), la difícil en ${s.mitja5} (${s.max5} de 12)`);
  await ctx.close();
}

// ===== JUGAR LA D'AVUI TOCANT =====
{
  const { ctx, p } = await obre('2026-11-18', { neteja: true });
  const menu = await p.evaluate(() => document.getElementById('msg').textContent);
  diu(/4 colors/.test(menu) && /al seu lloc/.test(menu) && !!(await p.$('#m-dia')), 'en entrar, el menú explica com es juga i ofereix la caixa d\'avui');
  await p.click('#m-dia'); await p.waitForTimeout(200);
  const codi = await p.evaluate(() => P.codi);

  // posar, treure i esborrar
  await color(p, 0); await color(p, 1);
  let e = await p.evaluate(() => P.ara.join());
  await p.click('#tauler .fila.ara .forat[data-i="0"]'); await p.click('#tauler .fila.ara .forat[data-i="0"]');
  const tret = await p.evaluate(() => P.ara.join());
  await p.click('#b-esborra');
  const esborrat = await p.evaluate(() => P.ara.join());
  diu(e === '0,1,,' && tret === ',1,,' && esborrat === ',,,', `tocant un color es posa, tocant el forat dues vegades es treu, i ESBORRA treu l'últim (${e} → ${tret} → ${esborrat})`);

  await color(p, 2); await comprova(p);
  e = await p.evaluate(() => ({ n: P.intents.length, txt: document.getElementById('lider').textContent }));
  diu(e.n === 0 && /Falten 3 colors/.test(e.txt), 'amb forats buits no comprova, i diu quants en falten');

  // un intent que no és la bona: surten les pistes de debò
  let g = codi.map(c => (c + 1) % 6);
  await p.evaluate(() => { P.ara = [null, null, null, null]; P.cursor = 0; P.ordre = []; pintaFila(); });
  await posaTots(p, g); await comprova(p);
  e = await p.evaluate(() => ({ x: P.intents[0], vermelles: document.querySelectorAll('#tauler .fila')[0].querySelectorAll('.pistes i.lloc').length,
    blanques: document.querySelectorAll('#tauler .fila')[0].querySelectorAll('.pistes i.mal').length, hud: document.getElementById('intent').textContent, txt: document.getElementById('lider').textContent }));
  const esperat = await p.evaluate(([c, g]) => pistes(c, g), [codi, g]);
  diu(e.x.lloc === esperat.lloc && e.x.mal === esperat.mal && e.vermelles === esperat.lloc && e.blanques === esperat.mal && e.hud === '2/10',
    `cada intent posa tantes pistes vermelles i blanques com toca (${e.vermelles} i ${e.blanques}: «${e.txt}»), i el marcador passa a l'intent 2`);

  await posaTots(p, g); await comprova(p);
  e = await p.evaluate(() => ({ n: P.intents.length, txt: document.getElementById('lider').textContent }));
  diu(e.n === 1 && /ja l'has provada/.test(e.txt), 'la mateixa combinació dues vegades no gasta cap intent');
  await p.click('#b-esborra'); await p.click('#b-esborra'); await p.click('#b-esborra'); await p.click('#b-esborra');

  // desar i continuar
  await p.reload(); await p.waitForTimeout(400);
  await p.evaluate(() => { document.querySelectorAll('body > div[style*="position: fixed"]').forEach(d => { if (d.id !== 'msg') d.remove(); }); paused = false; });
  const m2 = await p.evaluate(() => document.getElementById('m-dia').textContent);
  await p.click('#m-dia'); await p.waitForTimeout(200);
  e = await p.evaluate(() => P.intents.length);
  diu(/CONTINUA/.test(m2) && e === 1, `tancant i tornant a obrir, la d'avui continua on era (${m2})`);

  // la pausa tapa el tauler
  await p.evaluate(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'p', code: 'KeyP' })));
  const pa = await p.evaluate(() => getComputedStyle(document.getElementById('pausa')).display);
  await color(p, 3);
  const pa2 = await p.evaluate(() => ({ d: getComputedStyle(document.getElementById('pausa')).display, ara: P.ara.join() }));
  diu(pa === 'flex' && pa2.d === 'none' && pa2.ara === ',,,', 'la pausa tapa el tauler, i el primer toc la treu sense posar cap color');

  // obrir-la jugant amb cap
  enviats.length = 0;
  for (let k = 0; k < 10; k++) {
    const s = await seguent(p);
    await posaTots(p, s); await comprova(p);
    if (await p.evaluate(() => P.fi)) break;
  }
  // entra a la taula: demana les inicials (ja escrites) i D'ACORD
  for (let k = 0; k < 40 && !await p.$('#rec-ok'); k++) await p.waitForTimeout(100);
  if (await p.$('#rec-ok')) await p.click('#rec-ok');
  await p.waitForTimeout(800);
  e = await p.evaluate(() => ({ fi: P.fi, guanyat: P.guanyat, n: P.intents.length, msg: document.getElementById('msg').textContent, stats, porta: document.querySelectorAll('#porta .forat svg').length }));
  const dia = enviats.find(x => /caixa_dia\/2026-11-18$/.test(x.url)), sempre = enviats.find(x => /\/records\/caixa$/.test(x.url));
  diu(e.fi && e.guanyat && /OBERTA/.test(e.msg) && e.porta === 4 && dia && dia.punts === 100 * (11 - e.n) && sempre && sempre.punts === 1 && e.stats.obertes === 1 && e.stats.ratxa === 1,
    `obrint-la (en ${e.n} intents) surt la combinació, i s'apunta a la taula d'avui (${dia && dia.punts} punts) i a les caixes obertes (${sempre && sempre.punts})`);
  const tx = await p.evaluate(() => textCompartir());
  diu(/#1/.test(tx) && /🟥/.test(tx) && !/vermell|groc|verd|blau/.test(tx), 'el missatge per al grup ensenya les pistes de cada intent, mai els colors');

  // tornant-hi, ja és feta
  enviats.length = 0;
  await p.reload(); await p.waitForTimeout(400);
  await p.evaluate(() => { document.querySelectorAll('body > div[style*="position: fixed"]').forEach(d => { if (d.id !== 'msg') d.remove(); }); paused = false; });
  const m3 = await p.evaluate(() => document.getElementById('m-dia').textContent);
  await p.click('#m-dia'); await p.waitForTimeout(1200);
  e = await p.evaluate(() => ({ fi: P.fi, stats }));
  diu(/OBERTA EN/.test(m3) && e.fi && !enviats.some(x => /caixa_dia/.test(x.url)) && e.stats.jugades === 1, `la d'avui feta no es torna a jugar ni a apuntar (${m3})`);

  // la pràctica difícil: 5 forats, 8 colors, 12 intents, i no compta
  await p.click('#f-prac').catch(() => {});
  await p.evaluate(() => obrePractica('dificil')); await p.waitForTimeout(200);
  e = await p.evaluate(() => ({ forats: document.querySelectorAll('#tauler .fila')[0].querySelectorAll('.forat').length, files: document.querySelectorAll('#tauler .fila').length, colors: document.querySelectorAll('#paleta button').length, hud: document.getElementById('intent').textContent }));
  enviats.length = 0;
  for (let k = 0; k < 12; k++) {
    const s = await seguent(p);
    await posaTots(p, s); await comprova(p);
    if (await p.evaluate(() => P.fi)) break;
  }
  await p.waitForTimeout(2000);
  const fp = await p.evaluate(() => ({ fi: P.fi, guanyat: P.guanyat, msg: document.getElementById('msg').textContent }));
  diu(e.forats === 5 && e.files === 12 && e.colors === 8 && e.hud === '1/12' && fp.fi && fp.guanyat && /no compten/.test(fp.msg) && !enviats.length,
    'la pràctica difícil té 5 forats, 8 colors i 12 intents, i obrir-la no s\'apunta enlloc');
  await ctx.close();
}

// ===== PERDRE LA D'AVUI =====
{
  const { ctx, p } = await obre('2026-11-19', { neteja: true });
  await p.click('#m-dia'); await p.waitForTimeout(200);
  const codi = await p.evaluate(() => P.codi);
  enviats.length = 0;
  // deu combinacions que no són la bona
  const dolentes = [];
  for (let a = 0; dolentes.length < 10; a++) { const g = [a % 6, Math.floor(a / 6) % 6, Math.floor(a / 36) % 6, 5 - (a % 6)]; if (g.join() !== codi.join()) dolentes.push(g); }
  for (const g of dolentes) { await posaTots(p, g); await comprova(p); }
  await p.waitForTimeout(2200);
  const e = await p.evaluate(() => ({ fi: P.fi, guanyat: P.guanyat, msg: document.getElementById('msg').textContent, stats }));
  const dia = enviats.find(x => /caixa_dia\/2026-11-19$/.test(x.url));
  diu(e.fi && !e.guanyat && /NO S'HA OBERT/.test(e.msg) && dia && dia.punts === 0 && !enviats.some(x => /\/records\/caixa$/.test(x.url)) && e.stats.ratxa === 0,
    'gastant els 10 intents s\'acaba, ensenya la combinació i s\'envia amb 0 (compta com a jugada per a la lliga)');
  await ctx.close();
}

// ===== A 320 PX =====
for (const [w, h, niv] of [[320, 568, 'normal'], [320, 568, 'dificil'], [360, 640, 'normal'], [390, 844, 'dificil']]) {
  const { ctx, p } = await obre('2026-11-18', { w, h, neteja: true });
  await p.evaluate(n => n === 'normal' ? obreDia() : obrePractica('dificil'), niv); await p.waitForTimeout(200);
  const r = await p.evaluate(() => {
    const dins = el => { const c = el.getBoundingClientRect(); return c.top >= 0 && c.bottom <= innerHeight + .5 && c.left >= 0 && c.right <= innerWidth + .5 && c.width > 0; };
    const forats = [...document.querySelectorAll('#tauler .forat')];
    const mida = Math.min(...forats.map(f => f.getBoundingClientRect().height));
    const botons = [...document.querySelectorAll('#paleta button, #accions button')];
    return { forats: forats.every(dins), botons: botons.every(dins), mida: Math.round(mida), boto: Math.round(Math.min(...[...document.querySelectorAll('#paleta button')].map(b => b.getBoundingClientRect().width))),
      scroll: document.documentElement.scrollWidth > innerWidth };
  });
  diu(r.forats && r.botons && r.mida >= 18 && r.boto >= 28 && !r.scroll,
    `a ${w}×${h} (${niv}) hi cap tot: forats de ${r.mida} px i colors de ${r.boto} px d'ample`);
  await ctx.close();
}

diu(errors.length === 0, errors.length ? 'error de JavaScript: ' + errors[0] : 'cap error de JavaScript');
await b.close();
console.log(malament ? `\n${malament} coses malament` : '\nLa Caixa Forta, bé');
process.exit(malament ? 1 : 0);
