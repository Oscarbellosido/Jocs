// Comprova Els Nou Quadres (el sudoku): que tots els que es fabriquen tinguin
// una sola solució, que es resolguin amb les tècniques del seu nivell i que
// el necessitin, que el del dia sigui igual per a tothom i del nivell que
// toca per dia de la setmana, i que es jugui tocant: posar un número, el que
// no hi va (que suma 30 s), les notes, esborrar, la pista (que pregunta i
// suma 60 s), la pausa, desar i continuar, acabar-lo (va a la taula del dia
// una sola vegada i diu el temps), la pràctica (que no compta) i que hi
// capiga a 320 px.
//
//   node scripts/prova-quadres.mjs

import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const ARREL = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const URL_JOC = 'file://' + resolve(ARREL, 'quadres.html');

let malament = 0;
function diu(be, text) { if (!be) malament++; console.log(`${be ? '✓' : '✗'} ${text}`); }

const b = await chromium.launch();
const errors = [], enviats = [];
const treuRecords = p => p.evaluate(() => document.querySelectorAll('body > div[style*="position: fixed"]').forEach(d => { if (d.id !== 'msg') d.remove(); }));
const obre = async (w = 390, h = 780, neteja = true, data = '2026-11-10') => {
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
  await p.clock.setFixedTime(new Date(data + 'T10:00:00+01:00'));
  await p.goto(URL_JOC);
  if (neteja) { await p.evaluate(() => { localStorage.clear(); localStorage.setItem('jugador', 'TST'); }); await p.reload(); }
  await p.waitForTimeout(400);
  await treuRecords(p);
  return { ctx, p };
};
// toca la casella i (0..80) i després el número d
const tocaCasella = async (p, i) => {
  const [x, y] = await p.evaluate(i => { const r = document.getElementById('c').getBoundingClientRect(); return [r.x + (i % 9 + .5) * L.cela, r.y + (Math.floor(i / 9) + .5) * L.cela]; }, i);
  await p.mouse.click(x, y); await p.waitForTimeout(25);
};
const tocaNumero = async (p, d) => { await p.click(`#teclat button[data-d="${d}"]`); await p.waitForTimeout(25); };
const posa = async (p, i, d) => { await tocaCasella(p, i); await tocaNumero(p, d); };
const buides = p => p.evaluate(() => [...Array(81).keys()].filter(i => !bona(i)));

let { ctx, p } = await obre();

// ---------- 1. els sudokus ----------
const g = await p.evaluate(() => {
  const mal = []; const don = [[], [], [], []]; let lent = 0;
  const valida = sol => UNITATS.every(u => u.map(i => sol[i]).sort().join('') === '123456789');
  for (const nv of [1, 2, 3]) for (let k = 0; k < 60; k++) {
    const t0 = performance.now(), s = fesSudoku('PROVA-' + k, nv); lent = Math.max(lent, performance.now() - t0);
    const nom = 'nivell ' + nv + ' #' + k;
    if (!valida(s.sol)) mal.push(nom + ': la solució no és bona');
    if (s.g.some((v, i) => v && v !== s.sol[i])) mal.push(nom + ': un número donat no és el de la solució');
    if (compta(s.g, 2) !== 1) mal.push(nom + ': no té una sola solució');
    const r = resol(s.g, nv);
    if (!r.resolt || r.v.join('') !== s.sol.join('')) mal.push(nom + ': no es resol amb les tècniques del nivell');
    if (nv > 1 && resol(s.g, nv - 1).resolt) mal.push(nom + ': es resol amb les del nivell de sota');
    if (s.g.some((v, i) => !!v !== !!s.g[80 - i])) mal.push(nom + ': no és simètric');
    const d = s.g.filter(Boolean).length; don[nv].push(d);
    if (d !== s.donades || d < DONADES_MIN[nv]) mal.push(nom + ': ' + d + ' números donats');
  }
  const rang = a => Math.min(...a) + '–' + Math.max(...a);
  // el del dia: igual cada vegada, diferent cada dia
  let iguals = true; const vistos = new Set();
  for (let n = 1; n <= 40; n++) { const nv = (n % 3) + 1, a = fesSudoku('DIA-' + n, nv), c = fesSudoku('DIA-' + n, nv); if (a.g.join('') !== c.g.join('')) iguals = false; vistos.add(a.sol.join('')); }
  const nivells = ['2026-11-09', '2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14', '2026-11-15'].map(nivellDia).join('');
  return { mal: mal.slice(0, 5), nmal: mal.length, rang: [1, 2, 3].map(n => rang(don[n])), lent, iguals, vistos: vistos.size, nivells, u: numeroDe('2026-11-10'),
    unitats: UNITATS.length, veines: VEINES.every(v => v.length === 20) };
});
diu(g.unitats === 27 && g.veines, 'la graella té 27 unitats (9 fileres, 9 columnes i 9 quadres) i cada casella, 20 veïnes');
diu(g.nmal === 0, `60 sudokus de cada nivell: tots amb una sola solució, simètrics, es resolen amb les tècniques del seu nivell i les necessiten ${g.nmal ? JSON.stringify(g.mal) : ''}`);
diu(true, `números donats: fàcil ${g.rang[0]}, mitjà ${g.rang[1]}, difícil ${g.rang[2]}; el que més triga a fer-se, ${g.lent.toFixed(0)} ms`);
diu(g.lent < 1500, 'cap no triga més d\'un segon i mig a fer-se');
diu(g.iguals && g.vistos === 40, 'el del dia surt igual cada vegada (igual per a tothom) i cada dia és un altre');
diu(g.nivells === '1122233', 'dilluns i dimarts és fàcil; de dimecres a divendres, mitjà; i el cap de setmana, difícil');
diu(g.u === 1, 'el #1 és el del 10 de novembre del 2026');

// ---------- 2. jugar tocant ----------
await p.click('#m-dia'); await p.waitForTimeout(200);
let e = await p.evaluate(() => ({ mode, n: P.n, nv: P.nivell, tema: $('tema').textContent, msg: $('msg').style.display }));
diu(e.mode === 'dia' && e.n === 1 && e.nv === 1 && /FÀCIL · #1/.test(e.tema) && e.msg !== 'block', "EL D'AVUI obre el sudoku del dia, i diu de quin nivell és");
let bs = await buides(p);
const sol = await p.evaluate(() => S.sol.slice());
// un número que hi va
await posa(p, bs[0], sol[bs[0]]);
e = await p.evaluate(i => ({ v: P.vals[i], bona: bona(i), err: P.errors }), bs[0]);
diu(e.v === sol[bs[0]] && e.bona && e.err === 0, 'tocant una casella i el número que hi va, s\'hi queda');
// ja no es pot canviar
await tocaNumero(p, sol[bs[0]] % 9 + 1);
e = await p.evaluate(i => ({ v: P.vals[i], err: P.errors }), bs[0]);
diu(e.v === sol[bs[0]] && e.err === 0, 'un número ben posat ja no es pot canviar (ni compta com a error)');
// un número donat tampoc
const donat = await p.evaluate(() => S.g.findIndex(Boolean));
await posa(p, donat, sol[donat] % 9 + 1);
diu(await p.evaluate(i => P.vals[i] === 0 && P.errors === 0, donat), 'els números que ja venien posats no es poden tocar');
// un que no hi va
const t0 = await p.evaluate(() => P.temps);
const dolent = sol[bs[1]] % 9 + 1;
await posa(p, bs[1], dolent);
e = await p.evaluate(i => ({ v: P.vals[i], bona: bona(i), err: P.errors, t: P.temps, hud: $('errors').textContent, avis: $('lider').textContent }), bs[1]);
diu(e.v === dolent && !e.bona && e.err === 1 && e.t - t0 >= 30 && e.t - t0 < 33 && e.hud === '1' && /no hi va/.test(e.avis), 'un número que no hi va surt en vermell, compta un error i suma 30 segons');
await tocaNumero(p, dolent);
e = await p.evaluate(i => ({ v: P.vals[i], err: P.errors, t: P.temps }), bs[1]);
diu(e.v === 0 && e.err === 1 && e.t - t0 < 33, 'tornant a tocar el mateix número, es treu i no torna a costar res');
// les notes
await p.click('#notes'); await p.waitForTimeout(40);
await posa(p, bs[2], 3); await tocaNumero(p, 7);
e = await p.evaluate(i => ({ n: P.notes[i], v: P.vals[i], err: P.errors, on: $('notes').classList.contains('on') }), bs[2]);
diu(e.on && e.n === ((1 << 3) | (1 << 7)) && e.v === 0 && e.err === 1, 'amb NOTES, els números s\'apunten en petit i no es comprova res');
await tocaNumero(p, 3);
diu(await p.evaluate(i => P.notes[i] === (1 << 7), bs[2]), 'tornant a tocar una nota, es treu');
await p.click('#esborra'); await p.waitForTimeout(40);
diu(await p.evaluate(i => P.notes[i] === 0, bs[2]), 'ESBORRA neteja la casella');
// posar un número treu les seves notes de la filera, la columna i el quadre
const [ca, cb] = await p.evaluate(() => { for (let i = 0; i < 81; i++) if (!bona(i)) for (const j of VEINES[i]) if (!bona(j)) return [i, j]; });
await posa(p, cb, sol[ca]);                    // una nota del número que anirà a la veïna
await p.click('#notes'); await p.waitForTimeout(40);
await posa(p, ca, sol[ca]);
e = await p.evaluate(([a, b2]) => ({ a: bona(a), n: P.notes[b2], on: $('notes').classList.contains('on') }), [ca, cb]);
diu(e.a && e.n === 0 && !e.on, 'en posar un número, les notes d\'aquell número a la seva filera, columna i quadre s\'esborren soles');
// la pista: pregunta, i a la segona destapa
bs = await buides(p);
await tocaCasella(p, bs[0]);
const t1 = await p.evaluate(() => P.temps);
await p.click('#pista'); await p.waitForTimeout(60);
e = await p.evaluate(i => ({ bona: bona(i), pistes: P.pistes, text: $('pista').textContent }), bs[0]);
diu(!e.bona && e.pistes === 0 && /SEGUR/.test(e.text), 'la PISTA pregunta abans (SEGUR? +60 s): un toc sol no fa res');
await p.click('#pista'); await p.waitForTimeout(60);
e = await p.evaluate(i => ({ bona: bona(i), pistes: P.pistes, t: P.temps, text: $('pista').textContent, avis: $('lider').textContent }), bs[0]);
diu(e.bona && e.pistes === 1 && e.t - t1 >= 60 && e.t - t1 < 63 && /PISTA/.test(e.text) && /Aquí hi va/.test(e.avis), 'al segon toc destapa la casella triada i suma 60 segons');
// sense casella triada, la pista en tria una de fàcil
await p.evaluate(() => { sel = -1; });
await p.click('#pista'); await p.waitForTimeout(3300);
diu(await p.evaluate(() => P.pistes === 1 && !/SEGUR/.test($('pista').textContent)), 'si no es torna a tocar, al cap de tres segons la pregunta se\'n va');
const nb = (await buides(p)).length;
await p.click('#pista'); await p.click('#pista'); await p.waitForTimeout(60);
e = await p.evaluate(() => ({ pistes: P.pistes, sel, bona: sel >= 0 && bona(sel) }));
diu(e.pistes === 2 && e.bona && (await buides(p)).length === nb - 1, 'sense cap casella triada, la pista en destapa una i te l\'ensenya');
// el rellotge i la pausa
const ta = await p.evaluate(() => P.temps); await p.waitForTimeout(700);
const tb = await p.evaluate(() => P.temps);
diu(tb - ta > .4 && tb - ta < 1.5, 'el rellotge corre mentre jugues');
await p.keyboard.press('p'); await p.waitForTimeout(600);
const tc = await p.evaluate(() => ({ t: P.temps, paused, vis: $('pausa').style.display }));
await p.waitForTimeout(500);
diu(tc.paused && tc.vis === 'flex' && Math.abs(await p.evaluate(() => P.temps) - tc.t) < .05, 'amb la P, pausa: el rellotge s\'atura i la graella es tapa');
await p.keyboard.press('p'); await p.waitForTimeout(100);
diu(await p.evaluate(() => !paused), 'i amb la P torna');
// amb el teclat de l'ordinador també es pot
bs = await buides(p);
await tocaCasella(p, bs[0]); await p.keyboard.press(String(sol[bs[0]])); await p.waitForTimeout(40);
diu(await p.evaluate(i => bona(i), bs[0]), 'a l\'ordinador, els números del teclat també hi van');

// desar i continuar
const abans = await p.evaluate(() => ({ v: P.vals.join(''), temps: P.temps, err: P.errors, pis: P.pistes }));
await p.evaluate(() => desaP());
await p.reload(); await p.waitForTimeout(400); await treuRecords(p);
diu(await p.evaluate(() => /CONTINUA EL D'AVUI/.test($('m-dia').textContent)), "en tornar, el menú diu CONTINUA EL D'AVUI");
await p.click('#m-dia'); await p.waitForTimeout(200);
const des = await p.evaluate(() => ({ v: P.vals.join(''), temps: P.temps, err: P.errors, pis: P.pistes }));
diu(des.v === abans.v && Math.abs(des.temps - abans.temps) < 3 && des.err === 1 && des.pis === 2, 'continua amb els mateixos números, el mateix temps, els errors i les pistes');

// el botó del número s'apaga quan ja hi són tots nou
bs = await buides(p);
const dNum = sol[bs[0]];
for (const i of bs.filter(i => sol[i] === dNum)) await posa(p, i, dNum);
diu(await p.evaluate(d => document.querySelector('#teclat button[data-d="' + d + '"]').classList.contains('ple') && faltenDe(d) === 0, dNum), 'quan un número ja hi és nou vegades, el seu botó s\'apaga');

// acabar-lo
bs = await buides(p);
for (const i of bs) await posa(p, i, sol[i]);
await p.waitForTimeout(1000);
for (let k = 0; k < 30 && !await p.$('#rec-ok'); k++) await p.waitForTimeout(100);
if (await p.$('#rec-ok')) await p.click('#rec-ok');
await p.waitForTimeout(500);
const fi = await p.evaluate(() => ({ fi: P.fi, msg: $('msg').style.display, text: $('msg').textContent, temps: P.temps }));
diu(fi.fi && fi.msg === 'block' && /FET!/.test(fi.text) && /1 error i 2 pistes/.test(fi.text), 'omplint-lo tot, surt FET! amb el temps, els errors i les pistes');
const env = enviats.filter(x => /quadres_dia\//.test(x.url));
diu(env.length === 1 && /quadres_dia\/2026-11-10$/.test(env[0].url) && env[0].punts === 3600 - Math.round(fi.temps) && env[0].nom === 'TST', `va a la taula del dia, amb 3.600 menys els segons (${env.length} enviament, ${env[0] && env[0].punts})`);
const tx = await p.evaluate(() => decodeURIComponent($('msg').querySelector('a[href*="wa.me"]').href));
diu(/ENVIA A TELEGRAM/.test(fi.text) && /Els Nou Quadres #1 · fàcil · \d+:\d\d ❌ 💡💡/.test(tx), 'es pot enviar al grup: el nivell, el temps, els errors i les pistes');
// tornar-hi no l'envia dues vegades
await p.reload(); await p.waitForTimeout(400); await treuRecords(p);
diu(await p.evaluate(() => /FET EN/.test($('m-dia').textContent)), "el menú diu que el d'avui ja està fet");
await p.click('#m-dia'); await p.waitForTimeout(400);
diu(enviats.filter(x => /quadres_dia\//.test(x.url)).length === 1, 'tornant-lo a obrir no es torna a enviar');

// ---------- 3. la pràctica ----------
await p.evaluate(() => menu()); await p.click('#m-p3'); await p.waitForTimeout(300);
let pr = await p.evaluate(() => ({ mode, nv: P.nivell, tema: $('tema').textContent, sol: S.sol.join(''), don: S.g.filter(Boolean).length }));
diu(pr.mode === 'practica' && pr.nv === 3 && /DIFÍCIL · PRÀCTICA/.test(pr.tema) && pr.sol !== sol.join(''), `PRÀCTICA DIFÍCIL en fa un altre, del nivell triat (${pr.don} números donats)`);
bs = await buides(p); const sol2 = await p.evaluate(() => S.sol.slice());
await posa(p, bs[0], sol2[bs[0]]);
await p.evaluate(() => menu());
diu(await p.evaluate(() => !!$('m-cont') && /difícil/.test($('msg').textContent)), 'el menú ofereix CONTINUA LA PRÀCTICA');
await p.click('#m-cont'); await p.waitForTimeout(200);
diu(await p.evaluate(([s, i]) => S.sol.join('') === s && bona(i), [pr.sol, bs[0]]), 'i continua on era');
await p.evaluate(() => { for (let i = 0; i < 81; i++) if (!bona(i)) { sel = i; posaNumero(S.sol[i]); } });
await p.waitForTimeout(1200);
diu(await p.evaluate(() => P.fi && /pràctica no compten/.test($('msg').textContent)) && enviats.filter(x => /quadres/.test(x.url)).length === 1, 'acabar-ne un de pràctica no va a cap taula');
await ctx.close();

// ---------- 3b. el cap de setmana, difícil ----------
({ ctx, p } = await obre(390, 780, true, '2026-11-14'));
diu(await p.evaluate(() => /difícil/.test($('msg').textContent)), 'el dissabte, el menú diu que el d\'avui és difícil');
await p.click('#m-dia'); await p.waitForTimeout(300);
e = await p.evaluate(() => ({ n: P.n, nv: P.nivell, cal: !resol(S.g, 2).resolt && resol(S.g, 3).resolt }));
diu(e.n === 5 && e.nv === 3 && e.cal, 'i ho és: el #5 no es resol amb les tècniques del mitjà');
await ctx.close();

// ---------- 4. hi cap ----------
for (const [w, h] of [[320, 568], [360, 640], [390, 844]]) {
  ({ ctx, p } = await obre(w, h));
  const menuCap = await p.evaluate(() => { const m = $('msg'); return m.scrollHeight <= m.clientHeight + 1; });
  await p.click('#m-dia'); await p.waitForTimeout(200);
  const m = await p.evaluate(() => {
    const r = $('c').getBoundingClientRect(), sm = document.querySelector('#wrap > small').getBoundingClientRect();
    const bts = [...document.querySelectorAll('#teclat button, #controls button')].map(x => x.getBoundingClientRect());
    const text = [...document.querySelectorAll('#controls button')].every(x => x.scrollWidth <= x.clientWidth + 1);
    return { scroll: document.documentElement.scrollWidth > innerWidth, cela: r.width / 9, fora: sm.bottom > innerHeight + 1 || r.right > innerWidth || bts.some(x => x.right > innerWidth + 1 || x.left < -1 || x.bottom > innerHeight),
      num: Math.min(...bts.slice(0, 9).map(x => x.width)), text, hud: $('hud').getBoundingClientRect().height };
  });
  diu(menuCap && !m.scroll && !m.fora && m.cela >= 30 && m.num >= 30 && m.text && m.hud < 40, `a ${w}×${h} hi cap tot (caselles de ${m.cela.toFixed(0)} px, botons dels números de ${m.num.toFixed(0)} px, el menú sencer)`);
  await ctx.close();
}

diu(errors.length === 0, 'cap error de JavaScript ' + (errors.length ? errors.join(' | ') : ''));
await b.close();
console.log(malament ? `\n${malament} coses malament` : '\nTot bé');
