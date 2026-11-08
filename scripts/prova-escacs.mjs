// Comprova Els Escacs: que les regles siguin les de debò (es compten totes
// les partides possibles des de cinc posicions conegudes i han de sortir els
// números de referència), les jugades especials, com s'acaba una partida, que
// la màquina trobi un mat i que com més nivell més guanyi; i que es jugui
// tocant: triar una peça, moure, coronar, desfer, desar i continuar, guanyar
// (els punts van a la taula), dos jugadors, abandonar i que hi capiga a 320 px.
//
//   node scripts/prova-escacs.mjs

import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const ARREL = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const URL_JOC = 'file://' + resolve(ARREL, 'escacs.html');
let malament = 0;
const diu = (be, text) => { if (!be) malament++; console.log(`${be ? '✓' : '✗'} ${text}`); };

// ---------- les regles, fora del navegador ----------
const codi = readFileSync(resolve(ARREL, 'escacs.html'), 'utf8').match(/\/\/ ==REGLES==([\s\S]*?)\/\/ ==FI REGLES==/)[1];
const M = new Function(codi + ';return {inicial,deFEN,perft,legals,cerca,jugadaMaquina,estat,fes,escac,nomCasella,jDe,jA,jCor,hashDe,copia,NIVELLS,CAV,DAM,PEO}')();
const nom = m => M.nomCasella(M.jDe(m)) + M.nomCasella(M.jA(m));

for (const [n, fen, exp] of [
  ['la de sortida', null, [20, 400, 8902, 197281]],
  ['«kiwipete» (enrocs, captures al pas, claus)', 'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1', [48, 2039, 97862]],
  ['un final de torres i peons', '8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1', [14, 191, 2812, 43238]],
  ['una plena de coronacions', 'r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1', [6, 264, 9467]],
  ['una amb escacs a la descoberta', 'rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8', [44, 1486, 62379]],
]) {
  const P = fen ? M.deFEN(fen) : M.inicial();
  const got = exp.map((_, i) => M.perft(P, i + 1));
  diu(got.every((v, i) => v === exp[i]) && M.hashDe(P) === P.h, `totes les partides possibles des de ${n}: ${got.join(', ')}`);
}

{ // l'enroc no es pot fer passant per una casella atacada, ni estant en escac
  let P = M.deFEN('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
  const enrocs = P => M.legals(P).filter(m => (m >> 15) & 2).map(nom).sort().join();
  const a = enrocs(P);
  P = M.deFEN('r3k2r/8/8/8/8/8/5r2/R3K2R w KQkq - 0 1');   // la torre negra ataca f1
  const b = enrocs(P);
  P = M.deFEN('r3k2r/8/8/8/8/8/4r3/R3K2R w KQkq - 0 1');   // el rei està en escac
  diu(a === 'e1c1,e1g1' && b === 'e1c1' && enrocs(P) === '', `enroc: els dos (${a}), sense el curt si f1 està atacada (${b}) i cap si estàs en escac`);
}
{ // captura al pas, només just després que el peó surti de dues
  const P = M.deFEN('4k3/3p4/8/4P3/8/8/8/4K3 b - - 0 1');
  const m = M.legals(P).find(m => nom(m) === 'd7d5'); M.fes(P, m);
  const pas = M.legals(P).find(m => nom(m) === 'e5d6');
  diu(pas && ((pas >> 15) & 1), 'captura al pas: el peó d\'e5 es pot menjar el que acaba de sortir de d7 a d5');
}
{ // coronació: a dama, torre, alfil o cavall
  const P = M.deFEN('8/P6k/8/8/8/8/8/K7 w - - 0 1');
  const c = M.legals(P).filter(m => nom(m) === 'a7a8').map(M.jCor).sort().join();
  diu(c === '2,3,4,5', 'un peó que arriba al final corona a cavall, alfil, torre o dama');
}
{ // com s'acaba
  const mat = M.estat(M.deFEN('6k1/5ppp/8/8/8/8/8/3R2K1 b - - 0 1'));
  const matB = M.estat(M.deFEN('3R2k1/5ppp/8/8/8/8/8/6K1 b - - 0 1'));
  const ofegat = M.estat(M.deFEN('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1'));
  const material = M.estat(M.deFEN('8/8/4k3/8/8/2N5/8/4K3 w - - 0 1'));
  const cinquanta = M.estat(M.deFEN('8/8/4k3/8/8/2R5/8/4K3 w - - 100 80'));
  diu(!mat && matB && matB.fi === 'mat' && matB.guanya === 1, 'escac i mat: el rei atrapat a la vuitena per la torre');
  diu(ofegat && ofegat.fi === 'ofegat', 'ofegat: el rei no es pot moure i no està en escac, i són taules');
  diu(material && material.fi === 'material' && cinquanta && cinquanta.fi === 'cinquanta', 'taules: rei i cavall contra rei, i cinquanta jugades sense menjar ni moure peons');
  // tres vegades la mateixa posició: els cavalls van i tornen
  const P = M.inicial(), vistes = { [P.h]: 1 }; let e = null;
  for (let k = 0; k < 2; k++) for (const j of ['g1f3', 'g8f6', 'f3g1', 'f6g8']) {
    M.fes(P, M.legals(P).find(m => nom(m) === j)); vistes[P.h] = (vistes[P.h] || 0) + 1; e = M.estat(P, vistes);
  }
  diu(e && e.fi === 'repeticio', 'taules per repetició: la mateixa posició tres vegades');
}
{ // la màquina troba el mat
  const P = M.deFEN('6k1/5ppp/8/8/8/8/8/3R2K1 w - - 0 1');
  const bons = [1, 2, 3].map(n => nom(M.jugadaMaquina(M.copia(P), n, {})));
  diu(bons.every(j => j === 'd1d8'), `del nivell d'aficionat amunt, la màquina veu el mat d'una jugada (${bons.join(', ')})`);
  const Q = M.deFEN('r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR b KQkq - 3 3');
  const def = nom(M.jugadaMaquina(M.copia(Q), 2, {}));
  const Q2 = M.copia(Q); M.fes(Q2, M.legals(Q2).find(m => nom(m) === def));
  const mata = M.legals(Q2).some(m => { const R = M.copia(Q2); M.fes(R, m); const e = M.estat(R); return e && e.fi === 'mat'; });
  diu(!mata, `i el jugador de cafè para el mat del pastor (juga ${def})`);
  const t0 = Date.now(); M.jugadaMaquina(M.inicial(), 3, {}); const t = Date.now() - t0;
  diu(t < 2600, `el mestre pensa com a molt uns dos segons (${t} ms)`);
}
{ // com més nivell, més guanya
  const partida = (blanques, negres, opc = {}) => {
    const P = M.inicial(), vistes = { [P.h]: 1 };
    for (let ply = 0; ply < 240; ply++) {
      const e = M.estat(P, vistes); if (e) return e.guanya || 0;
      const nv = P.torn > 0 ? blanques : negres, N = M.NIVELLS[nv];
      const m = nv === 3 ? M.cerca(M.copia(P), { ...N.opc, temps: 150, vistes }) : M.jugadaMaquina(M.copia(P), nv, vistes);
      M.fes(P, m); vistes[P.h] = (vistes[P.h] || 0) + 1;
    }
    return 0;
  };
  let a = 0, b = 0;
  for (let k = 0; k < 2; k++) { a += partida(2, 0) === 1; a += partida(0, 2) === -1; }
  for (let k = 0; k < 2; k++) { b += partida(3, 1) === 1; b += partida(1, 3) === -1; }
  diu(a >= 3 && b >= 3, `el jugador de cafè guanya el principiant (${a} de 4) i el mestre, l'aficionat (${b} de 4)`);
}

// ---------- al navegador, tocant ----------
const b = await chromium.launch();
const errors = [], enviats = [];
const obre = async (w = 390, h = 780, neteja = true) => {
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
  await p.waitForTimeout(400);
  await p.evaluate(() => { document.querySelectorAll('body > div[style*="position: fixed"]').forEach(d => { if (d.id !== 'msg') d.remove(); }); paused = false; });
  return { ctx, p };
};
const sq = n => (8 - +n[1]) * 8 + 'abcdefgh'.indexOf(n[0]);
const toca = async (p, casella) => {
  const [x, y] = await p.evaluate(s => { const r = CV.getBoundingClientRect(), [a, b] = aPantalla(s); return [r.x + a + MIDA / 16, r.y + b + MIDA / 16]; }, sq(casella));
  await p.mouse.click(x, y); await p.waitForTimeout(60);
};
const espera = async (p, cond, ms = 4000) => { for (let t = 0; t < ms && !await p.evaluate(cond); t += 100) await p.waitForTimeout(100); };

let { ctx, p } = await obre();
diu(await p.evaluate(() => /ELS ESCACS/.test($('msg').textContent) && /PRINCIPIANT/.test($('msg').textContent) && /MESTRE/.test($('msg').textContent) && /DOS JUGADORS/.test($('msg').textContent)),
  'en entrar surt el menú: els quatre nivells i dos jugadors');
await p.click('#n0'); await p.waitForTimeout(200);
await toca(p, 'e2');
diu(await p.evaluate(() => sel === 52 && destins.length === 2), 'tocant el peó d\'e2, surten les dues caselles on pot anar');
await toca(p, 'e5');
diu(await p.evaluate(() => Z.hist.length === 0 && sel === -1), 'tocant una casella on no pot anar, no es mou');
await toca(p, 'e2'); await toca(p, 'e4');
await espera(p, () => Z.hist.length === 2);
diu(await p.evaluate(() => Z.hist.length === 2 && P.torn === 1 && /Et toca a tu/.test($('estat').textContent)), 'el peó va a e4, la màquina contesta i torna a ser el teu torn');
await p.click('#desfes'); await p.waitForTimeout(150);
diu(await p.evaluate(() => Z.hist.length === 0 && Z.desfet === true && P.torn === 1), 'DESFÉS torna enrere la teva jugada i la de la màquina');
await toca(p, 'd2'); await toca(p, 'd4'); await espera(p, () => Z.hist.length === 2);
await p.evaluate(() => desa()); await p.reload(); await p.waitForTimeout(400);
await p.evaluate(() => document.querySelectorAll('body > div[style*="position: fixed"]').forEach(d => { if (d.id !== 'msg') d.remove(); }));
diu(await p.evaluate(() => /CONTINUA/.test($('msg').textContent) && /principiant · jugada 2/.test($('msg').textContent)), 'tornant a obrir el joc, ofereix CONTINUA (contra el principiant, jugada 2)');
await p.click('#m-cont'); await p.waitForTimeout(150);
diu(await p.evaluate(() => Z.hist.length === 2 && P.b[35] === 1), 'i continua on era, amb el peó a d4');

// guanyar: el mat del pastor, amb les respostes de la màquina posades a mà
enviats.length = 0;
await p.evaluate(() => {
  comenca('maquina', 2, 1); paused = false;
  const sq = n => (8 - +n[1]) * 8 + 'abcdefgh'.indexOf(n[0]);
  for (const j of ['e2e4', 'e7e5', 'f1c4', 'b8c6', 'd1h5', 'g8f6']) aplica(legals(P).find(m => jDe(m) === sq(j.slice(0, 2)) && jA(m) === sq(j.slice(2))), false);
});
await toca(p, 'h5'); await toca(p, 'f7');
await p.waitForTimeout(1200);
for (let k = 0; k < 30 && !await p.$('#rec-ok'); k++) await p.waitForTimeout(100);
if (await p.$('#rec-ok')) await p.click('#rec-ok');
await p.waitForTimeout(500);
const fi = await p.evaluate(() => ({ fi: Z.fi, msg: $('msg').textContent, punts: stats.punts, g: stats.n[2].g }));
diu(fi.fi && fi.fi.fi === 'mat' && /HAS GUANYAT/.test(fi.msg) && /escac i mat/.test(fi.msg), 'dama a f7: escac i mat, i surt HAS GUANYAT');
diu(fi.punts === 6 && fi.g === 1 && /\+6/.test(fi.msg), `guanyar el jugador de cafè dona 6 punts (${fi.punts})`);
const env = enviats.filter(e => /\/records\/escacs$/.test(e.url));
diu(env.length === 1 && env[0].punts === 6, 'i els punts acumulats van a la taula del joc');
await ctx.close();

// coronar i dos jugadors
({ ctx, p } = await obre());
await p.click('#m-dos'); await p.waitForTimeout(150);
await toca(p, 'e2'); await toca(p, 'e4'); await toca(p, 'e7'); await toca(p, 'e5');
diu(await p.evaluate(() => Z.hist.length === 2 && P.torn === 1 && /Mouen les blanques/.test($('estat').textContent)), 'dos jugadors: cadascú mou les seves, i diu a qui li toca');
await p.click('#desfes'); await p.waitForTimeout(100);
diu(await p.evaluate(() => Z.hist.length === 1 && P.torn === -1), 'a dos jugadors, DESFÉS només torna enrere una jugada');
await p.evaluate(() => { P = deFEN('8/P6k/8/8/8/8/8/K7 w - - 0 1'); sel = -1; destins = []; });
await toca(p, 'a7'); await toca(p, 'a8');
diu(await p.evaluate(() => corona && corona.ms.length === 4), 'portant el peó al final, pregunta a què corona');
const [cx, cy] = await p.evaluate(() => { const r = CV.getBoundingClientRect(), q = MIDA / 8, w = q * 1.3; return [r.x + MIDA / 2 + w * 1.5, r.y + MIDA / 2]; });
await p.mouse.click(cx, cy); await p.waitForTimeout(100);
diu(await p.evaluate(() => P.b[0] === CAV), 'i tocant el cavall, corona a cavall');
await p.evaluate(() => comenca('dos', 0, 1));
await toca(p, 'e2'); await toca(p, 'e4');
await p.click('#abandona'); await p.waitForTimeout(100);
diu(await p.evaluate(() => /ABANDONES/.test($('msg').textContent) && !Z.fi), 'ABANDONA pregunta abans');
await p.click('#a-si'); await p.waitForTimeout(800);
diu(await p.evaluate(() => Z.fi && /GUANYEN LES BLANQUES/.test($('msg').textContent)), 'i si abandonen les negres, guanyen les blanques');
await ctx.close();

// jugant amb les negres, el tauler es gira i la màquina comença
({ ctx, p } = await obre());
await p.click('#c0'); await p.waitForTimeout(100);
await p.click('#n1'); await p.waitForTimeout(100);
await espera(p, () => Z.hist.length === 1);
diu(await p.evaluate(() => Z.jo === -1 && girat() && Z.hist.length === 1 && P.torn === -1), 'amb les negres, el tauler es gira i la màquina fa la primera jugada');
await ctx.close();

// hi cap
for (const [w, h] of [[320, 568], [360, 640], [390, 844]]) {
  ({ ctx, p } = await obre(w, h));
  await p.click('#n0'); await p.waitForTimeout(200);
  const m = await p.evaluate(() => {
    const c = CV.getBoundingClientRect(), bt = $('abandona').getBoundingClientRect(), sm = document.querySelector('small').getBoundingClientRect(), hud = $('hud');
    return { scroll: document.documentElement.scrollWidth > innerWidth, cw: c.width, fora: Math.max(c.right, bt.right) > innerWidth || sm.bottom > innerHeight + 1, hud: hud.scrollWidth > hud.clientWidth + 1 };
  });
  diu(!m.scroll && !m.fora && !m.hud && m.cw >= 256, `a ${w}×${h} hi cap tot (tauler de ${Math.round(m.cw)} px)`);
  await ctx.close();
}

diu(errors.length === 0, 'cap error de JavaScript ' + (errors.length ? errors.join(' | ') : ''));
await b.close();
console.log(malament ? `\n${malament} coses malament` : '\nTot bé');
process.exit(malament ? 1 : 0);
