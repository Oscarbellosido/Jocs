// Comprova Les Dames: que les regles siguin les de casa nostra (es compten
// totes les partides possibles amb el motor del joc i amb un altre de fet a
// part, molt més simple, i han de sortir igual), menjar obligatori i per on
// se'n mengen més, que el peó no mengi enrere, la dama que va lluny, que no
// es pugui saltar dues vegades la mateixa peça, la coronació, com s'acaba, i
// que com més nivell més guanya; i que es jugui tocant: triar, moure, menjar,
// l'avís quan has de menjar amb una altra, desfer, desar i continuar,
// guanyar (els punts van a la taula), dos jugadors, abandonar, jugar amb
// negres i que hi capiga a 320 px.
//
//   node scripts/prova-dames.mjs

import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const ARREL = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const URL_JOC = 'file://' + resolve(ARREL, 'dames.html');
let malament = 0;
const diu = (be, text) => { if (!be) malament++; console.log(`${be ? '✓' : '✗'} ${text}`); };

// ---------- les regles, fora del navegador ----------
const codi = readFileSync(resolve(ARREL, 'dames.html'), 'utf8').match(/\/\/ ==REGLES==([\s\S]*?)\/\/ ==FI REGLES==/)[1];
const M = new Function(codi + ';return {inicial,legals,fes,desfes,estat,deText,cerca,jugadaMaquina,copia,hashDe,NIVELLS,PEO,DAMA}')();
const nom = s => 'abcdefgh'[s & 7] + (8 - (s >> 3));
const txt = m => nom(m.de) + (m.cap.length ? 'x' : '-') + m.cam.map(nom).join(m.cap.length ? 'x' : '-') + (m.cor ? '=D' : '');
const casos = P => M.legals(P).map(txt).sort().join(' ');

// Un altre motor, escrit d'una altra manera i sense cap pressa: copia el
// tauler a cada salt i no fa servir els raigs del joc
function altres(b, t) {
  const dins = (f, c) => f >= 0 && f < 8 && c >= 0 && c < 8;
  const totes = [];
  for (let s = 0; s < 64; s++) {
    const p = b[s]; if (p * t <= 0) continue;
    const dama = Math.abs(p) === 2;
    const salta = (bb, f, c, menjades, n) => {
      let res = false;
      for (const [df, dc] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
        if (!dama && df !== -t) continue;
        let ff = f + df, cc = c + dc;
        if (dama) while (dins(ff, cc) && bb[ff * 8 + cc] === 0) { ff += df; cc += dc; }
        if (!dins(ff, cc)) continue;
        const e = ff * 8 + cc;
        if (bb[e] * t >= 0 || bb[e] === 9) continue;         // 9: una peça ja menjada que encara hi és
        let lf = ff + df, lc = cc + dc;
        while (dins(lf, lc) && bb[lf * 8 + lc] === 0) {
          const nb = bb.slice(); const tipus = Math.abs(nb[e]); nb[e] = 9;
          res = true;
          const fi = !dama && lf === (t > 0 ? 0 : 7);
          if (fi || !salta(nb, lf, lc, [...menjades, [e, tipus]], n)) n.push({ de: s, a: lf * 8 + lc, cap: [...menjades, [e, tipus]] });
          if (!dama) break; lf += df; lc += dc;
        }
      }
      return res;
    };
    const bb = b.slice(); bb[s] = 0; const n = [];
    salta(bb, s >> 3, s & 7, [], n);
    totes.push(...n);
  }
  if (totes.length) {
    const max = Math.max(...totes.map(m => m.cap.length));
    let l = totes.filter(m => m.cap.length === max);
    const d = m => m.cap.filter(([, k]) => k === 2).length, maxd = Math.max(...l.map(d));
    l = l.filter(m => d(m) === maxd);
    const vist = new Set();
    return l.filter(m => { const k = m.de + '-' + m.a + '-' + m.cap.map(([e]) => e).sort((x, y) => x - y); if (vist.has(k)) return false; vist.add(k); return true; })
      .map(m => ({ de: m.de, a: m.a, cap: m.cap.map(([e]) => e), cor: Math.abs(b[m.de]) === 1 && (m.a >> 3) === (t > 0 ? 0 : 7) }));
  }
  const out = [];
  for (let s = 0; s < 64; s++) {
    const p = b[s]; if (p * t <= 0) continue;
    for (const [df, dc] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
      if (Math.abs(p) === 1 && df !== -t) continue;
      let f = (s >> 3) + df, c = (s & 7) + dc;
      while (dins(f, c) && b[f * 8 + c] === 0) { out.push({ de: s, a: f * 8 + c, cap: [], cor: Math.abs(p) === 1 && f === (t > 0 ? 0 : 7) }); if (Math.abs(p) === 1) break; f += df; c += dc; }
    }
  }
  return out;
}
const perft = (P, d) => { if (!d) return 1; let n = 0; for (const m of M.legals(P)) { const u = M.fes(P, m); n += perft(P, d - 1); M.desfes(P, u); } return n; };
const perftAltres = (b, t, d) => { if (!d) return 1; let n = 0; for (const m of altres(b, t)) { const nb = b.slice(); const p = nb[m.de]; nb[m.de] = 0; for (const c of m.cap) nb[c] = 0; nb[m.a] = m.cor ? Math.sign(p) * 2 : p; n += perftAltres(nb, -t, d - 1); } return n; };
{
  const a = [1, 2, 3, 4, 5, 6, 7].map(d => perft(M.inicial(), d));
  const b = [1, 2, 3, 4, 5, 6].map(d => perftAltres(Array.from(M.inicial().b), 1, d));
  diu(b.every((v, i) => v === a[i]) && a[0] === 7 && a[2] === 302, `totes les partides possibles des de la sortida, amb els dos motors: ${a.join(', ')}`);
}
{ // amb dames i moltes captures: posicions a l'atzar, els dos motors han de dir el mateix
  let x = 99, mal = 0, n = 0, dames = 0;
  const rnd = () => (x = (x * 1103515245 + 12345) % 2147483648) / 2147483648;
  for (let k = 0; k < 400; k++) {
    const b = new Int8Array(64);
    for (let s = 0; s < 64; s++) if (((s >> 3) + (s & 7)) % 2 && rnd() < .35) b[s] = [1, 1, 1, 2, -1, -1, -1, -2][Math.floor(rnd() * 8)];
    for (let c = 0; c < 8; c++) { if (b[c] === 1) b[c] = 2; if (b[56 + c] === -1) b[56 + c] = -2; }
    for (const t of [1, -1]) {
      const P = M.deText('', t); P.b = b; P.h = M.hashDe(P);
      const A = M.legals(P).map(m => m.de + '-' + m.a + '-' + m.cap.slice().sort((x, y) => x - y) + (m.cor ? '=D' : '')).sort().join(' ');
      const B = altres(Array.from(b), t).map(m => m.de + '-' + m.a + '-' + m.cap.slice().sort((x, y) => x - y) + (m.cor ? '=D' : '')).sort().join(' ');
      if (A !== B) mal++; n++; if (b.some(v => Math.abs(v) === 2)) dames++;
      const k2 = perft(P, 2), k2b = perftAltres(Array.from(b), t, 2); if (k2 !== k2b) mal++;
    }
  }
  diu(mal === 0, `${n} posicions a l'atzar (${dames} amb dames): els dos motors troben les mateixes jugades, i a dues jugades vista també`);
}
diu(casos(M.deText(`........ ........ ........ ........ ...n.... ....b... ........ ........`)) === 'e3xc5', 'el peó menja saltant en diagonal endavant');
diu(casos(M.deText(`........ ........ ........ ....b... ...n.... ........ ........ ........`, -1)) === 'd4-c3 d4-e3', 'el peó no menja enrere (el negre de d4 no es pot menjar el blanc d\'e5)');
diu(casos(M.deText(`........ ........ ........ ........ ...n.... ....b... ......b. ........`)) === 'e3xc5', 'menjar és obligatori: si un peó pot menjar, els altres no es poden moure');
diu(casos(M.deText(`........ ........ ...n.n.. ........ ...n.... ..b..... b....... ........`)) === 'c3xe5xc7 c3xe5xg7', 'la llei de la quantitat: s\'ha de fer la que en menja més (dues), no la d\'una');
diu(casos(M.deText(`........ ........ ........ ........ ...N.n.. ....b... ........ ........`)) === 'e3xc5', 'a igualtat, la de la qualitat: s\'ha de menjar la dama abans que el peó');
diu(casos(M.deText(`........ ........ ........ ........ ........ ........ .....n.. ......B.`)) === 'g1xa7 g1xb6 g1xc5 g1xd4 g1xe3', 'la dama menja de lluny i cau a qualsevol casella buida del darrere');
diu(casos(M.deText(`........ ........ ........ ........ ........ ........ ........ ......b.`)) === 'g1-f2 g1-h2', 'el peó només avança una casella');
diu(casos(M.deText(`........ .b...... ........ ........ ........ ........ ........ ........`)) === 'b7-a8=D b7-c8=D', 'el peó que arriba a l\'altra punta es fa dama');
diu(casos(M.deText(`........ ..n.n... .b...... ........ ........ ........ ........ ........`)) === 'b6xd8=D', 'si arriba a la darrera fila menjant, s\'acaba allà i es fa dama');
{ // la dama no pot saltar dues vegades la mateixa peça, i les que es menja fan nosa fins al final
  const P = M.deText(`........ ........ ........ ........ ........ ..n.n... ........ B.......`);
  diu(casos(P) === 'a1xd4xf2 a1xd4xg1', 'la dama menja dues peces seguides, i després cau a qualsevol casella buida');
}
{ // com s'acaba
  const P1 = M.deText(`........ ........ ........ ........ ........ ........ ........ ......b.`, -1);
  const P2 = M.deText(`.n...... b.b..... ...b.... ........ ........ ........ ........ ........`, -1);
  const P3 = M.deText(`........ ...N.... ........ ........ ........ ........ ........ ......B.`, 1);
  const P4 = M.deText(`........ ...N.... ........ ........ ....n... ........ ........ B.....B.`, 1); P4.quietes = 50;
  const e1 = M.estat(P1), e2 = M.estat(P2), e3 = M.estat(P3), e4 = M.estat(P4);
  diu(e1 && e1.fi === 'sense' && e1.guanya === 1 && e2 && e2.fi === 'tancat' && e2.guanya === 1 && e3 && e3.fi === 'dues' && !e3.guanya && e4 && e4.fi === 'quietes',
    'perd qui es queda sense peces o sense cap jugada; taules amb una dama contra una dama, o 25 jugades de cada sense menjar ni moure peons');
  const P = M.inicial(), v = { [P.h]: 1 };
  for (const j of [['g3', 'h4'], ['h6', 'g5']]) { const m = M.legals(P).find(m => nom(m.de) === j[0] && nom(m.a) === j[1]); M.fes(P, m); v[P.h] = (v[P.h] || 0) + 1; }
  diu(!M.estat(P, v), 'la partida no s\'acaba sola mentre es pot jugar');
}
{ // la màquina: veu una peça que es pot menjar de franc, i com més nivell, millor
  const P = M.deText(`........ ........ ........ ........ ...n.... ........ .....b.. ........`);
  const m = M.cerca(M.copia(P), { prof: 4 });
  diu(m && txt(m) === 'f2-g3', `la màquina no posa una peça on se la mengen de franc (${m && txt(m)})`);
  const P2 = M.deText(`........ ........ ........ ..n.n... ........ ..n..... ...b.... ........`);
  const m2 = M.cerca(M.copia(P2), { prof: 4 });
  diu(m2 && txt(m2) !== 'd2-e3', `ni es fica on el mengen sense tornar-s'hi (${m2 && txt(m2)})`);
  let x = 5; const rnd = () => (x = (x * 1103515245 + 12345) % 2147483648) / 2147483648;
  const partida = (a, b2, k) => {
    const P = M.inicial(), v = { [P.h]: 1 }; let e = null, pl = 0;
    while (!(e = M.estat(P, v)) && pl < 300) {
      const nv = (P.torn > 0) === (k % 2 === 0) ? a : b2;
      const m = pl < 2 ? (l => l[Math.floor(rnd() * l.length)])(M.legals(P)) : M.jugadaMaquina(M.copia(P), nv, v, rnd);
      M.fes(P, m); v[P.h] = (v[P.h] || 0) + 1; pl++;
    }
    return !e || !e.guanya ? 0 : ((e.guanya > 0) === (k % 2 === 0) ? 1 : -1);
  };
  for (const [a, b2, n] of [[0, 1, 10], [1, 2, 6]]) {
    let g = 0, p = 0; for (let k = 0; k < n; k++) { const r = partida(b2, a, k); if (r > 0) g++; else if (r < 0) p++; }
    diu(g > p * 2, `el ${M.NIVELLS[b2].nom.toLowerCase()} guanya el ${M.NIVELLS[a].nom.toLowerCase()} (${g} a ${p}, de ${n})`);
  }
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
const espera = async (p, cond, ms = 5000) => { for (let t = 0; t < ms && !await p.evaluate(cond); t += 100) await p.waitForTimeout(100); };
const quiet = p => espera(p, () => !anim && !pensant);

let { ctx, p } = await obre();
diu(await p.evaluate(() => /LES DAMES/.test($('msg').textContent) && /PRINCIPIANT/.test($('msg').textContent) && /MESTRE/.test($('msg').textContent) && /DOS JUGADORS/.test($('msg').textContent) && /COM ES JUGA/.test($('msg').textContent)),
  'en entrar surt el menú: els quatre nivells, dos jugadors i com es juga');
await p.click('#m-regles'); await p.waitForTimeout(100);
diu(await p.evaluate(() => /obligatori/.test($('msg').textContent) && /dama/.test($('msg').textContent)), 'COM ES JUGA explica les regles (menjar obligatori, la dama...)');
await p.click('#r-ok'); await p.waitForTimeout(100);
await p.click('#n0'); await p.waitForTimeout(200);
await toca(p, 'c3');
diu(await p.evaluate(() => sel === 42 && destins.length === 2), 'tocant el peó de c3, surten les dues caselles on pot anar');
await toca(p, 'c5');
diu(await p.evaluate(() => Z.hist.length === 0), 'tocant una casella on no pot anar, no es mou');
await toca(p, 'c3'); await toca(p, 'd4');
await espera(p, () => Z.hist.length === 2); await quiet(p);
diu(await p.evaluate(() => Z.hist.length === 2 && P.torn === 1 && /Et toca a tu/.test($('estat').textContent)), 'el peó va a d4, la màquina contesta i torna a ser el teu torn');
await p.click('#desfes'); await p.waitForTimeout(150);
diu(await p.evaluate(() => Z.hist.length === 0 && Z.desfet === true && P.torn === 1), 'DESFÉS torna enrere la teva jugada i la de la màquina');

// menjar obligatori: l'avís i la peça que s'ha de moure
await p.evaluate(() => { comenca('dos', 0, 1); P = deText(`........ ........ ........ ........ ...n.... ....b... b....... ........`); vistes = {}; sel = -1; destins = []; pintaEstat(); });
diu(await p.evaluate(() => /han de menjar/.test($('estat').textContent)), 'quan s\'ha de menjar, a dalt ho diu');
await toca(p, 'a2');
diu(await p.evaluate(() => destins.length === 0 && /Has de menjar/.test($('estat').textContent)), 'tocant una peça que no pot menjar, avisa que has de menjar amb una altra');
await toca(p, 'e3');
diu(await p.evaluate(() => destins.length === 1 && destins[0].cap.length === 1), 'tocant la que pot menjar, surt on va i quina es menja');
await toca(p, 'c5'); await quiet(p);
diu(await p.evaluate(() => P.b[26] === 1 && P.b[35] === 0 && P.torn === -1), 'i salta: el peó negre desapareix');
await ctx.close();

// desar i continuar
({ ctx, p } = await obre());
await p.click('#n0'); await p.waitForTimeout(150);
await toca(p, 'e3'); await toca(p, 'f4'); await espera(p, () => Z.hist.length === 2); await quiet(p);
await p.evaluate(() => desa()); await p.reload(); await p.waitForTimeout(400);
await p.evaluate(() => document.querySelectorAll('body > div[style*="position: fixed"]').forEach(d => { if (d.id !== 'msg') d.remove(); }));
diu(await p.evaluate(() => /CONTINUA/.test($('msg').textContent) && /principiant · jugada 2/.test($('msg').textContent)), 'tornant a obrir el joc, ofereix CONTINUA (contra el principiant, jugada 2)');
await p.click('#m-cont'); await p.waitForTimeout(150);
diu(await p.evaluate(() => Z.hist.length === 2 && P.b[37] === 1), 'i continua on era, amb el peó a f4');

// guanyar: una posició on la màquina ja no té res a fer
enviats.length = 0;
await p.evaluate(() => {
  comenca('maquina', 2, 1); paused = false;
  P = deText(`........ ........ ........ ........ ...n.... ....b... ........ ........`); vistes = { [P.h]: 1 };
});
await toca(p, 'e3'); await toca(p, 'c5');
await p.waitForTimeout(1500);
for (let k = 0; k < 30 && !await p.$('#rec-ok'); k++) await p.waitForTimeout(100);
if (await p.$('#rec-ok')) await p.click('#rec-ok');
await p.waitForTimeout(500);
const fi = await p.evaluate(() => ({ fi: Z.fi, msg: $('msg').textContent, punts: stats.punts, g: stats.n[2].g }));
diu(fi.fi && fi.fi.fi === 'sense' && /HAS GUANYAT/.test(fi.msg) && /no li queda cap peça/.test(fi.msg), 'menjant-se l\'última peça: HAS GUANYAT, a la màquina no li queda cap peça');
diu(fi.punts === 6 && fi.g === 1 && /\+6/.test(fi.msg), `guanyar el jugador de cafè dona 6 punts (${fi.punts})`);
const env = enviats.filter(e => /\/records\/dames$/.test(e.url));
diu(env.length === 1 && env[0].punts === 6, 'i els punts acumulats van a la taula del joc');
await ctx.close();

// dos jugadors i abandonar
({ ctx, p } = await obre());
await p.click('#m-dos'); await p.waitForTimeout(150);
await toca(p, 'c3'); await toca(p, 'd4'); await quiet(p); await toca(p, 'f6'); await toca(p, 'e5'); await quiet(p);
diu(await p.evaluate(() => Z.hist.length === 2 && P.torn === 1 && /blanques/.test($('estat').textContent)), 'dos jugadors: cadascú mou les seves, i diu a qui li toca');
await p.click('#desfes'); await p.waitForTimeout(100);
diu(await p.evaluate(() => Z.hist.length === 1 && P.torn === -1), 'a dos jugadors, DESFÉS només torna enrere una jugada');
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
  const menu = await p.evaluate(() => { const m = $('msg'); return m.scrollHeight <= m.clientHeight + 2; });
  await p.click('#n0'); await p.waitForTimeout(200);
  const m = await p.evaluate(() => {
    const c = CV.getBoundingClientRect(), bt = $('abandona').getBoundingClientRect(), sm = document.querySelector('small').getBoundingClientRect(), hud = $('hud');
    return { scroll: document.documentElement.scrollWidth > innerWidth, cw: c.width, fora: Math.max(c.right, bt.right) > innerWidth || sm.bottom > innerHeight + 1, hud: hud.scrollWidth > hud.clientWidth + 1 };
  });
  diu(!m.scroll && !m.fora && !m.hud && m.cw >= 256, `a ${w}×${h} hi cap tot (tauler de ${Math.round(m.cw)} px)${menu ? '' : ', el menú es pot fer córrer'}`);
  await ctx.close();
}

diu(errors.length === 0, 'cap error de JavaScript ' + (errors.length ? errors.join(' | ') : ''));
await b.close();
console.log(malament ? `\n${malament} coses malament` : '\nTot bé');
process.exit(malament ? 1 : 0);
