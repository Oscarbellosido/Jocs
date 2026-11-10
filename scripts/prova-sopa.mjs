// Comprova La Sopa de Lletres: que totes les sopes de tots els temes es
// puguin fer (deu paraules, cadascuna una sola vegada a la graella), que la
// del dia sigui igual per a tothom i no repeteixi tema dos dies seguits, i
// que es jugui amb el dit: lliscant, tocant la primera i l'última, del revés,
// la pista (que suma 30 s), desar i continuar, acabar-la (va a la taula del
// dia una sola vegada i diu el temps), la pràctica (que no compta), la pausa
// i que hi capiga a 320 px.
//
//   node scripts/prova-sopa.mjs

import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const ARREL = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const URL_JOC = 'file://' + resolve(ARREL, 'sopa.html');

let malament = 0;
function diu(be, text) { if (!be) malament++; console.log(`${be ? '✓' : '✗'} ${text}`); }

const b = await chromium.launch();
const errors = [], enviats = [];
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
  await p.evaluate(() => document.querySelectorAll('body > div[style*="position: fixed"]').forEach(d => { if (d.id !== 'msg') d.remove(); }));
  return { ctx, p };
};
// el centre de la casella (x, y) a la pantalla
const punt = (p, x, y) => p.evaluate(([x, y]) => { const r = document.getElementById('c').getBoundingClientRect(); return [r.x + (x + .5) * L.cela, r.y + (y + .5) * L.cela]; }, [x, y]);
const extrems = (p, i) => p.evaluate(i => { const q = S.paraules[i]; return [q.x, q.y, q.x + q.dx * (q.p.length - 1), q.y + q.dy * (q.p.length - 1)]; }, i);
const llisca = async (p, x0, y0, x1, y1) => {
  const [a, c] = await punt(p, x0, y0), [d, e] = await punt(p, x1, y1);
  await p.mouse.move(a, c); await p.mouse.down(); await p.mouse.move(d, e, { steps: 8 }); await p.mouse.up(); await p.waitForTimeout(60);
};
const toca = async (p, x, y) => { const [a, c] = await punt(p, x, y); await p.mouse.click(a, c); await p.waitForTimeout(60); };
const trobades = p => p.evaluate(() => P.trobades.length);

let { ctx, p } = await obre();

// ---------- 1. les sopes ----------
const g = await p.evaluate(() => {
  let mal = [];
  for (let t = 0; t < TEMES.length; t++) for (let k = 0; k < 25; k++) {
    const s = fesSopa('PROVA-' + k, t);
    if (!s) { mal.push(TEMES[t][0] + ' no surt'); continue; }
    if (s.paraules.length !== 10) mal.push(TEMES[t][0] + ' amb ' + s.paraules.length);
    for (const q of s.paraules) {
      if (vegades(s.graella, q.p) !== 1) mal.push(q.p + ' surt ' + vegades(s.graella, q.p) + ' vegades');
      for (let j = 0; j < q.p.length; j++) if (s.graella[q.y + q.dy * j][q.x + q.dx * j] !== q.p[j]) mal.push(q.p + ' no és on diu');
    }
  }
  let seguits = 0, ant = -1, iguals = true, temes = new Set();
  for (let n = 1; n <= 300; n++) { const t = temaDe(n); if (t === ant) seguits++; ant = t; if (n <= TEMES.length) temes.add(t); }
  for (let n = 1; n <= 20; n++) if (JSON.stringify(sopaDia(n)) !== JSON.stringify(sopaDia(n))) iguals = false;
  const primers = [1, 2, 3, 4, 5, 6].map(temaDe).join(), sis = sopaDia(6).paraules.map(q => q.p + ':' + q.x + ',' + q.y + ',' + q.dx + ',' + q.dy).sort().join(' ');
  const llargs = TEMES.flatMap(([nom, ws]) => ws.split(' ').filter(w => pla(w).length > N).map(w => nom + ': ' + w));
  const pocs = TEMES.filter(([, ws]) => ws.split(' ').filter(w => pla(w).length >= 3).length < 13).map(x => x[0]);
  return { mal: mal.slice(0, 5), nmal: mal.length, seguits, iguals, temes: temes.size, L: TEMES.length, u: numeroDe('2026-11-05'), primers, sis, llargs, pocs, lots: LOTS[LOTS.length - 1][1] };
});
diu(g.nmal === 0, `25 sopes de cada un dels ${g.L} temes surten bé, amb cada paraula una sola vegada (en qualsevol direcció) ${g.nmal ? JSON.stringify(g.mal) : ''}`);
diu(g.iguals, 'la del dia surt igual cada vegada (igual per a tothom)');
diu(g.seguits === 0 && g.temes === g.L, `cap tema dos dies seguits, i tots surten abans de repetir-ne cap (${g.temes} de ${g.L})`);
diu(g.u === 1, 'la #1 és la del 5 de novembre del 2026');
diu(g.primers === '14,27,3,18,21,22' && g.sis === 'CARENA:7,4,-1,0 CASCADA:0,7,0,-1 CINGLE:2,3,1,0 COLL:5,6,1,1 COVA:1,0,0,1 ESTANY:9,2,0,1 LLAC:1,4,1,1 REFUGI:3,9,1,-1 ROCA:4,0,1,0 VALL:5,1,1,0',
  'afegint-hi temes, les sis primeres sopes (les que ja s\'han jugat) no han canviat: ' + g.primers);
diu(g.lots === g.L && g.llargs.length === 0 && g.pocs.length === 0, `tots els temes són a LOTS (${g.lots} de ${g.L}), amb 13 paraules o més i cap de més de 10 lletres ${g.llargs.concat(g.pocs).slice(0, 3).join(' · ')}`);
const g3 = await p.evaluate(() => {
  const mal = [];const rev = t => [...t].reverse().join('');
  for (let n = 6; n <= 66; n++) { const s = sopaDia(n);
    const altres = TEMES[s.tema][1].split(' ').map(pla).filter(x => x.length >= 3 && x.length <= N && !s.paraules.some(q => q.p.includes(x) || q.p.includes(rev(x))));
    altres.forEach(x => { if (vegades(s.graella, x)) mal.push('#' + n + ' ' + x); }); }
  return { mal, cinc: JSON.stringify(sopaDia(5)) === JSON.stringify(fesSopa('DIA-5', temaDe(5), 2)) };
});
diu(g3.mal.length === 0, 'des de la #6, a la sopa no hi surt per casualitat cap altra paraula del tema ' + g3.mal.slice(0, 3).join(' '));
diu(g3.cinc, 'la #5, que ja s\'estava jugant, és la mateixa d\'abans');
const dirs = await p.evaluate(() => {
  let mal = 0;
  for (let n = 2; n <= 120; n++) { const c = { H: 0, V: 0, D: 0 }; sopaDia(n).paraules.forEach(q => c[tipus([q.dx, q.dy])]++); if (c.H < 3 || c.V < 2 || c.D < 2) mal++; }
  const u = sopaDia(1);
  return { mal, u: u.paraules.map(q => q.p + ':' + q.dx + ',' + q.dy).join(' ') };
});
diu(dirs.mal === 0, 'des de la #2, cada sopa té paraules de costat, de dalt a baix i en diagonal (la #1 eren totes verticals)');
diu(dirs.u === 'CARTERA:0,-1 CLASSE:0,1 DEURES:0,-1 ESTOIG:0,1 LLAPIS:0,-1 LLIBRETA:0,-1 MESTRE:0,-1 MOTXILLA:0,-1 PISSARRA:0,1 TISORES:0,1', 'la #1, que ja s\'estava jugant, és la mateixa d\'abans');

// ---------- 2. jugar la d'avui ----------
await p.click('#m-dia'); await p.waitForTimeout(150);
diu(await p.evaluate(() => mode === 'dia' && !!S && $('msg').style.display === 'none'), "LA D'AVUI obre la sopa");
let [x0, y0, x1, y1] = await extrems(p, 0);
await llisca(p, x0, y0, x1, y1);
diu(await trobades(p) === 1, 'lliscant per sobre d\'una paraula, es troba');
[x0, y0, x1, y1] = await extrems(p, 1);
await llisca(p, x1, y1, x0, y0);
diu(await trobades(p) === 2, 'lliscant-la del revés també val');
[x0, y0, x1, y1] = await extrems(p, 2);
await toca(p, x0, y0); await toca(p, x1, y1);
diu(await trobades(p) === 3, 'tocant la primera lletra i després l\'última, també');
await llisca(p, x0, y0, x1, y1);
diu(await trobades(p) === 3, 'una paraula ja trobada no torna a comptar');
// una línia que no és cap paraula
const dolenta = await p.evaluate(() => { for (let y = 0; y < N; y++) for (let x = 0; x + 2 < N; x++) { const t = S.graella[y][x] + S.graella[y][x + 1] + S.graella[y][x + 2]; if (!S.paraules.some(q => q.p.includes(t) || q.p.includes([...t].reverse().join('')))) return [x, y]; } return null; });
await llisca(p, dolenta[0], dolenta[1], dolenta[0] + 2, dolenta[1]);
diu(await trobades(p) === 3, 'tres lletres que no són cap paraula no compten');
diu(await p.evaluate(() => $('paraules').querySelectorAll('.feta').length === 3 && $('trobades').textContent === '3/10'), 'a la llista, les trobades surten ratllades i el comptador diu 3/10');

// les paraules que falten no es veuen: només quantes lletres tenen
const am = await p.evaluate(() => {
  const sp = [...$('paraules').children], falten = S.paraules.filter((q, i) => !P.trobades.includes(i));
  return { amagades: sp.filter(x => x.className === 'amagada').length, text: sp.map(x => x.textContent).join(' '), falten: falten.map(q => q.w.toUpperCase()), llargs: falten.map(q => q.p.length + ' lletres') };
});
diu(am.amagades === 7 && am.falten.every(w => !am.text.includes(w)) && am.llargs.every(l => am.text.includes(l)), `les que falten no es veuen, només quantes lletres tenen (${am.text})`);
// la pista: primer et diu el nom d'una que falta
const t0 = await p.evaluate(() => P.temps);
await p.click('#pista'); await p.waitForTimeout(100);
const pi = await p.evaluate(() => { const i = P.vistes[0], q = S.paraules[i];
  return { dt: P.temps, pistes: P.pistes, n: P.vistes.length, falta: !P.trobades.includes(i), llarga: S.paraules.every((r, k) => P.trobades.includes(k) || r.p.length <= q.p.length),
    llista: [...$('paraules').querySelectorAll('.vista')].map(x => x.textContent).join(), w: q.w.toUpperCase(), cercle: !!pistaVis }; });
diu(pi.dt - t0 >= 30 && pi.pistes === 1 && pi.n === 1 && pi.falta && pi.llarga && pi.llista === pi.w && !pi.cercle, `la PISTA et diu el nom de la més llarga que falta (${pi.w}), surt a la llista i suma 30 segons`);
// quan ja te les ha dit totes, t'encercla on comença una
for (let k = 0; k < 6; k++) await p.click('#pista');
const pc = await p.evaluate(() => ({ n: P.vistes.length, cercle: !!pistaVis, ok: pistaVis && !P.trobades.includes(pistaVis.i) && pistaVis.x === S.paraules[pistaVis.i].x && pistaVis.y === S.paraules[pistaVis.i].y, amagades: $('paraules').querySelectorAll('.amagada').length }));
diu(pc.n === 7 && !pc.cercle && pc.amagades === 0, 'amb set pistes, ja te les ha dit totes');
await p.click('#pista'); await p.waitForTimeout(100);
diu(await p.evaluate(() => !!pistaVis && !P.trobades.includes(pistaVis.i) && pistaVis.x === S.paraules[pistaVis.i].x && pistaVis.y === S.paraules[pistaVis.i].y && P.pistes === 8),
  'i la següent t\'encercla la primera lletra d\'una que falta');

// el rellotge corre jugant i s'atura en pausa
let a = await p.evaluate(() => P.temps); await p.waitForTimeout(1200);
let bb = await p.evaluate(() => P.temps);
diu(bb - a > .8, 'el rellotge corre mentre jugues');
await p.keyboard.press('KeyP');
a = await p.evaluate(() => P.temps); await p.waitForTimeout(1000); bb = await p.evaluate(() => P.temps);
diu(await p.evaluate(() => paused) && bb - a < .05, 'amb la P, pausa: el rellotge s\'atura');
await p.keyboard.press('KeyP');
diu(!(await p.evaluate(() => paused)), 'i amb la P torna');

// desar i continuar
const abans = await p.evaluate(() => ({ t: P.trobades.slice(), temps: P.temps }));
await p.evaluate(() => desaP());
await p.reload(); await p.waitForTimeout(400);
await p.evaluate(() => document.querySelectorAll('body > div[style*="position: fixed"]').forEach(d => { if (d.id !== 'msg') d.remove(); }));
diu(await p.evaluate(() => /CONTINUA LA D'AVUI/.test($('m-dia').textContent)), "en tornar, el menú diu CONTINUA LA D'AVUI");
await p.click('#m-dia'); await p.waitForTimeout(150);
const des = await p.evaluate(() => ({ t: P.trobades.slice(), temps: P.temps }));
diu(JSON.stringify(des.t) === JSON.stringify(abans.t) && Math.abs(des.temps - abans.temps) < 3, 'continua amb les mateixes trobades i el mateix temps');

// acabar-la
for (let i = 0; i < 10; i++) {
  if (await p.evaluate(i => P.trobades.includes(i), i)) continue;
  [x0, y0, x1, y1] = await extrems(p, i);
  await llisca(p, x0, y0, x1, y1);
}
await p.waitForTimeout(1000);
for (let k = 0; k < 30 && !await p.$('#rec-ok'); k++) await p.waitForTimeout(100);
if (await p.$('#rec-ok')) await p.click('#rec-ok');
await p.waitForTimeout(500);
const fi = await p.evaluate(() => ({ fi: P.fi, msg: $('msg').style.display, text: $('msg').textContent, temps: P.temps }));
diu(fi.fi && fi.msg === 'block' && /FETA!/.test(fi.text), 'trobant-les totes, surt FETA! amb el temps');
const env = enviats.filter(e => /sopa_dia\//.test(e.url));
diu(env.length === 1 && env[0].punts === 3600 - Math.round(fi.temps) && env[0].nom === 'TST', `va a la taula del dia, amb 3.600 menys els segons (${env.length} enviament, ${env[0] && env[0].punts})`);
diu(/ENVIA A TELEGRAM/.test(fi.text), 'es pot enviar al grup');
const tx = await p.evaluate(() => decodeURIComponent($('msg').querySelector('a[href*="wa.me"]').href));
const paraules = await p.evaluate(() => S.paraules.map(q => q.p));
diu(!paraules.some(w => w.length > 3 && tx.toUpperCase().includes(w)), 'el missatge per al grup no desvetlla cap paraula');
// tornar-hi no l'envia dues vegades
await p.reload(); await p.waitForTimeout(400);
await p.evaluate(() => document.querySelectorAll('body > div[style*="position: fixed"]').forEach(d => { if (d.id !== 'msg') d.remove(); }));
diu(await p.evaluate(() => /FETA EN/.test($('m-dia').textContent)), "el menú diu que la d'avui ja està feta");
await p.click('#m-dia'); await p.waitForTimeout(400);
diu(enviats.filter(e => /sopa_dia\//.test(e.url)).length === 1, 'tornant-la a obrir no es torna a enviar');

// ---------- 3. la pràctica ----------
await p.evaluate(() => menu()); await p.click('#m-prac'); await p.waitForTimeout(150);
const pr = await p.evaluate(() => ({ mode, t: P.tema, avui: temaDe(numeroDe(diaAvui())) }));
diu(pr.mode === 'practica' && pr.t !== pr.avui, "PRÀCTICA fa una altra sopa, d'un altre tema que la d'avui");
for (let i = 0; i < 10; i++) { [x0, y0, x1, y1] = await extrems(p, i); await llisca(p, x0, y0, x1, y1); }
await p.waitForTimeout(1200);
diu(await p.evaluate(() => P.fi && /pràctica no compten/.test($('msg').textContent)) && enviats.filter(e => /sopa/.test(e.url)).length === 1, 'acabar-ne una de pràctica no va a cap taula');
await ctx.close();

// ---------- 3b. la #5 encara té la llista a la vista ----------
({ ctx, p } = await obre(390, 780, true, '2026-11-09'));
await p.click('#m-dia'); await p.waitForTimeout(150);
diu(await p.evaluate(() => P.n === 5 && !amagades() && S.paraules.every(q => $('paraules').textContent.includes(q.w.toUpperCase()))), 'la d\'avui, la #5, encara ensenya les deu paraules');
await ctx.close();

// ---------- 4. hi cap ----------
for (const [w, h] of [[320, 568], [360, 640], [390, 844]]) {
  ({ ctx, p } = await obre(w, h));
  await p.click('#m-dia'); await p.waitForTimeout(150);
  const m = await p.evaluate(() => {
    const r = $('c').getBoundingClientRect(), bt = $('pista').getBoundingClientRect(), sm = document.querySelector('small').getBoundingClientRect();
    const spans = [...$('paraules').children].every(s => s.scrollWidth <= s.clientWidth + 1);
    return { scroll: document.documentElement.scrollWidth > innerWidth, cela: r.width / 10, fora: bt.bottom > innerHeight + 1 || sm.bottom > innerHeight + 1 || r.right > innerWidth, spans, hud: $('hud').getBoundingClientRect().height };
  });
  diu(!m.scroll && !m.fora && m.cela >= 24 && m.spans && m.hud < 40, `a ${w}×${h} hi cap tot (caselles de ${m.cela.toFixed(0)} px, totes les paraules senceres)`);
  await ctx.close();
}

diu(errors.length === 0, 'cap error de JavaScript ' + (errors.length ? errors.join(' | ') : ''));
await b.close();
console.log(malament ? `\n${malament} coses malament` : '\nTot bé');
process.exit(malament ? 1 : 0);
