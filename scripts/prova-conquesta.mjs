// Comprova La Conquesta: que el mapa de les comarques estigui ben fet (43,
// veines que es corresponen, tot connectat, vegueries que no se solapen), que
// les regles dels daus i dels reforços vagin com toca, que la batalla del dia
// sigui igual per a tothom, que la maquina jugui prou be (ni regalada ni
// impossible) i que es jugui tocant: reforçar, atacar, conquerir, moure, els
// torns dels altres, desar i continuar, el final i les taules.
//
//   node scripts/prova-conquesta.mjs

import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const ARREL = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const URL_JOC = 'file://' + resolve(ARREL, 'conquesta.html');

let malament = 0;
function diu(be, text) { if (!be) malament++; console.log(`${be ? '✓' : '✗'} ${text}`); }

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
const enviats = [];
await ctx.route('**/jocs-records*/**', r => {
  const q = r.request();
  if (q.method() === 'POST') enviats.push({ url: q.url(), ...JSON.parse(q.postData() || '{}') });
  r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' },
    body: q.method() === 'POST' ? '{"ok":true,"posicio":1,"top":[]}' : '[]' });
});
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', e => errors.push(String(e)));
await p.goto(URL_JOC);
await p.evaluate(() => { localStorage.clear(); localStorage.setItem('jugador', 'TST'); });
await p.reload();
await p.waitForTimeout(500);
const netejaEntrada = () => p.evaluate(() => document.querySelectorAll('body > div[style*="position: fixed"]').forEach(d => { if (d.id !== 'msg') d.remove(); }));
await netejaEntrada();

// ---------- 1. el mapa ----------
const mapa = await p.evaluate(() => {
  const C = MAPA.comarques, mal = [];
  C.forEach((c, i) => { for (const v of VEI[i]) if (!VEI[v].includes(i)) mal.push(c.nom + '→' + C[v].nom); });
  const vist = new Set([0]), cua = [0];
  while (cua.length) { const c = cua.pop(); for (const v of VEI[c]) if (!vist.has(v)) { vist.add(v); cua.push(v); } }
  const vegs = VEGS.flatMap(v => v.cs);
  return { n: C.length, mal, connex: vist.size === C.length, vegs: vegs.length === 43 && new Set(vegs).size === 43, nVegs: VEGS.length,
    noms: C.map(c => c.nom), camins: C.every(c => c.d && c.d.length > 50), etiq: C.every(c => c.r > 8) };
});
diu(mapa.n === 43 && mapa.noms.includes('Moianès') && mapa.noms.includes('Lluçanès'), 'el mapa té les 43 comarques, amb el Moianès i el Lluçanès');
diu(!mapa.mal.length, 'les veïnes es corresponen (si A toca B, B toca A)' + (mapa.mal.length ? ': ' + mapa.mal.join(', ') : ''));
diu(mapa.connex, 'des de qualsevol comarca es pot arribar a totes les altres');
diu(mapa.vegs && mapa.nVegs === 8, 'les vuit vegueries es reparteixen les 43 comarques sense solapar-se');
diu(mapa.camins && mapa.etiq, 'cada comarca té el seu dibuix i lloc per al número');

// ---------- 2. les regles ----------
const regles = await p.evaluate(() => {
  const S = novaPartida('PROVA');
  const r = {};
  r.repartiment = [0, 1, 2].map(q => comarquesDe(S, q)).join(',');
  r.soldats = [0, 1, 2].map(q => S.soldats.reduce((n, s, c) => n + (S.dueny[c] === q ? s : 0), 0)).join(',');
  r.minim = (() => { const T = structuredClone(S); T.dueny.fill(1); T.dueny[0] = 0; return reforcos(T, 0); })();
  r.ambVegueria = (() => { const T = structuredClone(S); T.dueny.fill(1); for (const c of VEGS[0].cs) T.dueny[c] = 0; return reforcos(T, 0) === 3 + VEGS[0].bonus; })();
  // els daus a ma: 6 5 4 contra 6 3 → el 6 empata (perd qui ataca) i el 5 guanya
  const vell = dau; let cua = [6, 5, 4, 6, 3]; dau = () => cua.shift();
  const T = structuredClone(S); const a = T.dueny.indexOf(0), d = VEI[a].find(v => T.dueny[v] !== 0) ?? VEI[a][0];
  T.dueny[d] = 1; T.soldats[a] = 10; T.soldats[d] = 5;
  const t = tirada(T, a, d); r.daus = t.pa === 1 && t.pd === 1 && T.soldats[a] === 9 && T.soldats[d] === 4;
  cua = [2, 1, 6, 6]; T.soldats[a] = 2; T.soldats[d] = 3; const t2 = tirada(T, a, d); r.unDau = t2.da.length === 1 && t2.dd.length === 2 && t2.pa === 1 && T.soldats[a] === 1;
  cua = [6, 6, 6, 1]; T.soldats[a] = 9; T.soldats[d] = 1; const t3 = tirada(T, a, d);
  r.conquesta = t3.conquesta && T.dueny[d] === 0 && t3.min === 3;
  r.ocupa = ocupa(T, a, d, 1, t3.min) === 3 && T.soldats[d] === 3;
  dau = vell;
  r.noSolta = !potAtacar(T, a, d) || T.dueny[d] !== T.dueny[a];
  // moure: nomes per comarques teves
  const U = structuredClone(S); U.dueny.fill(1); U.dueny[0] = 0; U.soldats[0] = 5; const v = VEI[0][0]; U.dueny[v] = 0; U.soldats[v] = 1;
  const llunyana = U.dueny.findIndex((dd, c) => c !== 0 && c !== v && !VEI[0].includes(c));
  U.dueny[llunyana] = 0;
  r.mou = mou(U, 0, v, 10) === 4 && U.soldats[0] === 1 && mou(U, v, llunyana, 1) === 0;
  // la mateixa llavor, la mateixa partida (i els mateixos daus)
  const A = novaPartida('DIA-2026-10-22'), B = novaPartida('DIA-2026-10-22'), Cc = novaPartida('DIA-2026-10-23');
  r.mateixa = JSON.stringify(A) === JSON.stringify(B) && JSON.stringify(A) !== JSON.stringify(Cc);
  for (const _ of iaTorn(A, 1)) {} for (const _ of iaTorn(B, 1)) {}
  r.mateixosDaus = JSON.stringify(A) === JSON.stringify(B);
  return r;
});
diu(regles.repartiment === '15,14,14' && regles.soldats === '35,35,35', `en començar, 15, 14 i 14 comarques, i 35 soldats cadascú (${regles.repartiment} / ${regles.soldats})`);
diu(regles.minim === 3, 'amb poques comarques, com a mínim 3 soldats de reforç');
diu(regles.ambVegueria, 'amb una vegueria sencera, el seu premi a sobre');
diu(regles.daus, 'els daus es comparen de gran a petit, i en cas d\'empat perd qui ataca');
diu(regles.unDau, 'amb 2 soldats només es tira un dau, i el defensor en tira fins a dos');
diu(regles.conquesta && regles.ocupa, 'buidant-la, és teva, i hi passes com a mínim tants soldats com daus has tirat');
diu(regles.mou, 'moure soldats només es pot per comarques teves, i sempre en queda un');
diu(regles.mateixa && regles.mateixosDaus, 'la batalla del dia és la mateixa per a tothom, amb els mateixos daus');

// ---------- 3. la maquina, ni regalada ni impossible ----------
const cal = await p.evaluate(() => {
  let tu = 0, ells = 0, rondes = [], llarga = 0;
  for (let s = 0; s < 80; s++) {
    const S = novaPartida('CAL' + s); let g = -1;
    for (let k = 0; k < 400; k++) {
      for (const _ of iaTorn(S, S.torn)) {}
      g = guanyador(S); if (g >= 0 || !S.vius[0]) break;
      seguentTorn(S); if (S.ronda > MAX_RONDES) { llarga++; break; }
    }
    if (g === 0) { tu++; rondes.push(S.ronda); } else if (g > 0) ells++;
  }
  rondes.sort((a, b) => a - b);
  return { tu, ells, llarga, mediana: rondes[rondes.length >> 1] };
});
diu(cal.tu >= 16 && cal.tu <= 50 && cal.mediana >= 7 && cal.mediana <= 16,
  `jugant com la màquina, de 80 partides en guanyes ${cal.tu} i ells ${cal.ells} (${cal.llarga} sense guanyador); les guanyades duren ${cal.mediana} rondes`);

// ---------- 4. jugar tocant ----------
await p.click('#m-dia');
// la primera vegada, l'explicació surt sola, pàgina a pàgina
let ajuda = await p.evaluate(() => ({ obert: ajudaObert, paused, txt: document.getElementById('msg').textContent }));
diu(ajuda.obert && ajuda.paused && /QUÈ HAS DE FER/.test(ajuda.txt) && /tu ets el BLAU/.test(ajuda.txt), 'el primer cop que hi jugues, surt sola l\'explicació de com es juga');
const titols = [];
for (let i = 0; i < 10 && await p.$('#a-seg'); i++) { titols.push(await p.evaluate(() => document.querySelector('#msg div').textContent)); await p.click('#a-seg'); }
titols.push(await p.evaluate(() => document.querySelector('#msg div').textContent));
diu(titols.length === 6 && titols.some(t => /REFORÇA/.test(t)) && titols.some(t => /ATACA/.test(t)) && titols.some(t => /MOU/.test(t)) && titols.some(t => /VEGUERIES/.test(t)),
  'explica l\'objectiu, els tres passos del torn i les vegueries (' + titols.join(' / ') + ')');
await p.click('#a-tanca');
diu(await p.evaluate(() => !ajudaObert && !paused && document.getElementById('msg').style.display === 'none'), 'i en acabar, a jugar');
await p.click('#controls .ajuda');
diu(await p.evaluate(() => ajudaObert && /REFORÇA/.test(document.querySelector('#msg div').textContent)), 'el botó ? torna a obrir l\'explicació, a la pàgina del pas on ets');
await p.click('#a-salta');
diu(await p.evaluate(() => !ajudaObert && !paused), 'i «ja ho sé» la tanca');
const toca = c => p.evaluate(c => { const e = ETIQ[c].cer.getBoundingClientRect(); return [e.x + e.width / 2, e.y + e.height / 2]; }, c).then(([x, y]) => p.touchscreen.tap(x, y));
let e = await p.evaluate(() => ({ fase: S.fase, posar: S.posar, torn: S.torn, n: numero }));
diu(e.fase === 'reforc' && e.posar === 5 && e.torn === 0, `la batalla d'avui (#${e.n}) comença amb el teu torn: ${e.posar} soldats per reforçar`);
const meva = await p.evaluate(() => { for (let c = 0; c < 43; c++) if (S.dueny[c] === 0 && VEI[c].some(v => S.dueny[v] !== 0)) return c; });
const abans = await p.evaluate(c => S.soldats[c], meva);
await toca(meva);
diu(await p.evaluate(([c, a]) => S.soldats[c] === a + 1 && S.posar === 4, [meva, abans]), 'tocant una comarca teva, hi poses un soldat');
const enemiga = await p.evaluate(() => S.dueny.findIndex(d => d !== 0));
await toca(enemiga);
diu(await p.evaluate(() => S.posar === 4 && /comarques teves/.test(document.getElementById('info').textContent)), 'a les dels altres no, i et diu per què');
await p.click('#controls button:has-text("POSA\'LS TOTS")');
diu(await p.evaluate(([c, a]) => S.fase === 'atac' && S.soldats[c] === a + 5, [meva, abans]), 'POSA\'LS TOTS AQUÍ posa la resta on havies tocat, i passes a atacar');
// atacar: amb molts soldats contra una del costat
const [at, df] = await p.evaluate(c => { S.soldats[c] = 30; const d = VEI[c].find(v => S.dueny[v] !== 0); S.soldats[d] = 2; pinta(); return [c, d]; }, meva);
await toca(at); await toca(df);
e = await p.evaluate(() => ({ daus: S.daus, info: document.getElementById('info').textContent }));
diu(e.daus > 0 && /contra/.test(e.info), 'tocant la teva i després la del costat, es tiren els daus i surten a sota');
await p.waitForTimeout(500);
const dd = await p.evaluate(() => {
  const el = document.getElementById('daus'), r = ultima, c = el.getBoundingClientRect(), m = document.getElementById('mapa').getBoundingClientRect();
  const files = [...el.querySelectorAll('.fila')].map(f => [...f.querySelectorAll('.dg')].map(d => ({ n: +d.textContent, apagat: d.classList.contains('perd') })));
  const parells = Math.min(r.da.length, r.dd.length);
  let be = files.length === 2 && files[0].length === r.da.length && files[1].length === r.dd.length;
  for (let i = 0; i < parells && be; i++) {
    const guanyaAtac = r.da[i] > r.dd[i];
    be = files[0][i].n === r.da[i] && files[1][i].n === r.dd[i] && files[0][i].apagat === !guanyaAtac && files[1][i].apagat === guanyaAtac;
  }
  return { visible: el.style.display === 'block' && c.height > 60 && c.top >= m.top - 5, be, mida: Math.round(el.querySelector('.dg').getBoundingClientRect().width) };
});
diu(dd.visible && dd.be && dd.mida >= 30, `els daus surten grossos a dalt del mapa (${dd.mida} px), i el que perd cada parella queda apagat`);
await p.evaluate(() => { while (!pendent && S.dueny[obj] !== 0 && S.soldats[sel] >= 2) ataca(false); });
e = await p.evaluate(() => ({ pend: !!pendent, botons: [...document.querySelectorAll('#controls button')].map(b => b.textContent) }));
diu(e.pend && e.botons.length >= 3 && e.botons.some(t => /TOTS/.test(t)), `conquerida: tries quants soldats hi passes (${e.botons.join(' / ')})`);
await p.click('#controls button.tria >> nth=0');
diu(await p.evaluate(([a, d]) => S.dueny[d] === 0 && S.soldats[d] >= 3 && !pendent && S.fase === 'atac', [at, df]), 'i la comarca és teva, amb els soldats que hi has passat');
await p.click('#controls button:has-text("PROU ATACS")');
diu(await p.evaluate(() => S.fase === 'mou'), 'PROU ATACS passa a moure soldats');
// moure: de la gran a una de connectada
const [ma, mb] = await p.evaluate(a => { const b = [...connectades(S, a)][0]; return [a, b]; }, at);
if (mb !== undefined) {
  await toca(ma); await toca(mb);
  diu(await p.evaluate(() => pendent && pendent.t === 'mou'), 'tocant dues comarques teves connectades, pregunta quants hi passes');
  await p.click('#controls button.tria >> nth=0');
} else await p.click('#controls button:has-text("ACABA EL TORN")');
diu(await p.evaluate(() => S.torn === 1 && !!ia), 'moure acaba el teu torn i comencen els VERMELLS');
// els torns de la maquina, de pressa
await p.click('#controls button:has-text("DE PRESSA")');
for (let i = 0; i < 80 && await p.evaluate(() => !!ia || S.torn !== 0); i++) await p.waitForTimeout(150);
e = await p.evaluate(() => ({ torn: S.torn, ronda: S.ronda, fase: S.fase, posar: S.posar, daus: S.daus }));
diu(e.torn === 0 && e.ronda === 2 && e.fase === 'reforc' && e.posar >= 3, `després dels VERMELLS i dels GROCS, torna a ser el teu torn (ronda ${e.ronda}, ${e.posar} soldats per reforçar)`);

// ---------- 4b. els daus, que es puguin seguir ----------
// ATAC A FONS ensenya les tirades una darrere l'altra, i als torns dels altres
// cada atac es queda quiet una estona, amb els daus de debo (abans canviaven
// abans d'haver parat de rodolar i nomes se'n veien els de mentida).
await p.evaluate(() => { S.fase = 'atac'; S.posar = 0;
  const a = S.dueny.findIndex((d, c) => d === 0 && VEI[c].some(v => S.dueny[v] !== 0)); const d = VEI[a].find(v => S.dueny[v] !== 0);
  S.soldats[a] = 40; S.soldats[d] = 7; sel = a; obj = d; pinta(); ataca(true); });
await p.waitForTimeout(250);
const fons = await p.evaluate(() => ({ txt: document.getElementById('daus').textContent }));
const nT = +(fons.txt.match(/tirada 1 de (\d+)/) || [])[1];
diu(nT > 1, `ATAC A FONS ensenya les tirades una per una (tirada 1 de ${nT})`);
let fiFons = '';
for (let i = 0; i < 100 && !/\(\d+ tirades\)|En \d+ tirades/.test(fiFons); i++) { await p.waitForTimeout(150); fiFons = await p.evaluate(() => document.getElementById('daus').textContent); }
diu(new RegExp('\\(' + nT + ' tirades\\)|En ' + nT + ' tirades').test(fiFons), `i al final, el total de les ${nT} tirades`);
if (await p.evaluate(() => !!pendent)) await p.evaluate(() => triaQuants(pendent.min));
await p.evaluate(() => { pendent = null; sel = null; obj = null; S.fase = 'mou'; acabaTorn(); document.getElementById('daus').style.display = 'none'; ultima = null; });
// el primer atac dels altres: s'espera que s'aturi i es mira que sigui el de debo i que s'hi quedi
let quiet = null;
for (let i = 0; i < 120 && !quiet; i++) {
  await p.waitForTimeout(50);
  quiet = await p.evaluate(() => { const el = document.getElementById('daus');
    if (el.style.display !== 'block' || el.querySelector('.roda') || !ultima || S.torn === 0) return null;
    const files = [...el.querySelectorAll('.fila')].map(f => [...f.querySelectorAll('.dg')].map(d => +d.textContent));
    return { de_debo: files[0].join() === ultima.da.join() && files[1].join() === ultima.dd.join(), html: el.innerHTML,
      cap: el.getBoundingClientRect().right <= innerWidth + 1 && el.getBoundingClientRect().left >= -1 }; });
}
await p.waitForTimeout(900);
const seguix = quiet && await p.evaluate(h => document.getElementById('daus').innerHTML === h, quiet.html);
diu(quiet && quiet.de_debo && seguix, 'als torns dels altres, els daus s\'aturen amb els de debò i s\'hi queden prou estona per llegir-los');
diu(quiet && quiet.cap, 'i el quadre dels daus hi cap');
await p.click('#controls button:has-text("DE PRESSA")');
for (let i = 0; i < 80 && await p.evaluate(() => !!ia || S.torn !== 0); i++) await p.waitForTimeout(150);

// 3 daus teus contra 1 dels altres: el quadre diu per què, i si ataques al
// nord se'n va a baix per no tapar les comarques que toques
{
  const r = await p.evaluate(() => {
    S.fase = 'atac'; S.posar = 0; S.torn = 0;
    let a = -1, d = -1;
    for (let c = 0; c < N && a < 0; c++) for (const v of VEI[c]) if ((MAPA.comarques[c].y + MAPA.comarques[v].y) / 2 < MAPA.alt * .4) { a = c; d = v; break; }
    S.dueny[a] = 0; S.dueny[d] = 2; S.soldats[a] = 4; S.soldats[d] = 1; sel = a; obj = d; pinta(); ataca(false);
    return true;
  });
  await p.waitForTimeout(700);
  const q = await p.evaluate(() => { const el = document.getElementById('daus'), c = el.getBoundingClientRect(), s = document.getElementById('screen').getBoundingClientRect();
    return { txt: el.querySelector('.quants') ? el.querySelector('.quants').textContent : '', abaix: c.bottom > s.top + s.height * .6, dins: c.left >= -1 && c.right <= innerWidth + 1 && c.bottom <= s.bottom + 1 }; });
  diu(/Tu tires 3 daus, el màxim/.test(q.txt) && /Els grocs tiren 1 dau: només hi tenen 1 soldat/.test(q.txt), `el quadre diu per què cadascú tira els daus que tira («${q.txt}»)`);
  diu(q.abaix && q.dins, 'atacant al nord, el quadre dels daus va a baix i no tapa les comarques que toques');
  if (await p.evaluate(() => !!pendent)) await p.evaluate(() => triaQuants(pendent.min));
}

// ---------- 5. desar i continuar ----------
const desat = await p.evaluate(() => JSON.stringify(S));
await p.reload(); await p.waitForTimeout(600); await netejaEntrada();
diu(await p.evaluate(() => /CONTINUA LA D'AVUI/.test(document.getElementById('msg').textContent)), 'tancant i tornant-hi, el menú ofereix CONTINUA LA D\'AVUI');
await p.click('#m-dia');
diu(await p.evaluate(d => JSON.stringify(S) === d, desat), 'i continues exactament on eres');
// tancar a mig torn de la maquina: es torna a jugar igual
const igual = await p.evaluate(() => {
  const T = structuredClone(S); T.torn = 1; T.fase = 'reforc'; T.posar = reforcos(T, 1);
  const A = structuredClone(T), B = structuredClone(T);
  for (const _ of iaTorn(A, 1)) {} const g = iaTorn(B, 1); g.next(); g.next();
  const C = structuredClone(T); for (const _ of iaTorn(C, 1)) {}
  return JSON.stringify(A) === JSON.stringify(C);
});
diu(igual, 'si tanques a mig torn dels altres, en tornar-hi el tornen a jugar igual (mateixos daus)');

// ---------- 6. el final ----------
enviats.length = 0;
await p.evaluate(() => { const lliures = S.dueny.map((d, c) => c).filter(c => S.dueny[c] !== 0);
  for (let i = 0; i < lliures.length; i++) if (comarquesDe(S, 0) < OBJECTIU - 1) { S.dueny[lliures[i]] = 0; S.soldats[lliures[i]] = 1; }
  S.fase = 'atac'; S.posar = 0;
  const a = S.dueny.findIndex((d, c) => d === 0 && VEI[c].some(v => S.dueny[v] !== 0)); const d = VEI[a].find(v => S.dueny[v] !== 0);
  S.soldats[a] = 40; S.soldats[d] = 1; sel = a; obj = d; pinta(); });
await p.evaluate(() => ataca(true));
await p.waitForTimeout(1200);
for (let i = 0; i < 30 && !await p.$('#rec-ok'); i++) await p.waitForTimeout(100);
if (await p.$('#rec-ok')) await p.click('#rec-ok');
await p.waitForTimeout(600);
e = await p.evaluate(() => ({ fi: S.fi, txt: document.getElementById('msg').textContent, punts: punts(S), MAX: MAX_RONDES }));
const MAX = e.MAX;
diu(e.fi && e.fi.guanya === 0 && /HAS CONQUERIT CATALUNYA/.test(e.txt) && e.punts === 1000 + 50 * (MAX - e.fi.ronda), `arribant a 30 comarques a la ronda ${e.fi.ronda}, guanyes: ${e.punts} punts (1.000 + 50 per ronda que sobra)`);
const dia = await p.evaluate(() => dia);
diu(enviats.length === 1 && enviats[0].url.includes('conquesta_dia/' + dia) && enviats[0].punts === e.punts, 'els punts van a la taula d\'avui (' + enviats.map(x => x.url.split('/records/')[1]).join(', ') + ')');
diu(/LA BATALLA D'AVUI/.test(e.txt) && /DE SEMPRE/.test(e.txt) && /ENVIA A TELEGRAM/.test(e.txt), 'el quadre del final ensenya les dues taules i es pot enviar al grup');
await p.evaluate(() => menu());
diu(await p.evaluate(() => /JA JUGADA/.test(document.getElementById('msg').textContent)), 'la d\'avui, un cop jugada, ja no es pot tornar a fer');
enviats.length = 0;
await p.click('#m-dia'); await p.waitForTimeout(500);
diu(!enviats.length && await p.evaluate(() => /HAS CONQUERIT/.test(document.getElementById('msg').textContent)), 'tocant-la, ensenya com va anar, i no es torna a apuntar');
// partida lliure: perdre i a la taula de sempre
await p.evaluate(() => menu());
await p.click('#m-lliure');
enviats.length = 0;
await p.evaluate(() => { for (let c = 0; c < 43; c++) if (S.dueny[c] === 0 && c % 3) S.dueny[c] = 1; acabaPartida(1); });
await p.waitForTimeout(1200);
for (let i = 0; i < 30 && !await p.$('#rec-ok'); i++) await p.waitForTimeout(100);
if (await p.$('#rec-ok')) await p.click('#rec-ok');
await p.waitForTimeout(500);
e = await p.evaluate(() => ({ txt: document.getElementById('msg').textContent, punts: punts(S), n: comarquesDe(S, 0) }));
diu(/ELS VERMELLS HAN ARRIBAT A 30/.test(e.txt) && e.punts === e.n * 10, `si un altre hi arriba abans, 10 punts per comarca teva (${e.punts})`);
diu(enviats.length === 1 && /records\/conquesta$/.test(enviats[0].url), 'les partides lliures van a la taula de sempre');
// el boto de sota: en acabar obre el menu del joc, i amb el menu obert no hi es
await p.evaluate(() => hideMsg());
await p.click('#controls button:has-text("MENÚ DEL JOC")');
await p.waitForTimeout(200);
e = await p.evaluate(() => ({ menu: /PARTIDA LLIURE/.test(document.getElementById('msg').textContent) && document.getElementById('msg').style.display !== 'none',
  botons: document.querySelectorAll('#controls button').length, alt: Math.round(document.getElementById('controls').getBoundingClientRect().height) }));
diu(e.menu && e.botons === 0 && e.alt >= 46, `en acabar, MENÚ DEL JOC obre el menu, i amb el menu obert ja no hi ha cap botó a sota (${e.botons} botons, ${e.alt} px)`);

// ---------- 7. que hi càpiga ----------
for (const [w, h] of [[320, 568], [360, 640], [390, 844]]) {
  await p.setViewportSize({ width: w, height: h });
  await p.evaluate(() => { comenca('lliure'); });
  await p.waitForTimeout(200);
  const r = await p.evaluate(() => {
    const dins = el => { const c = el.getBoundingClientRect(); return c.width > 0 && c.left >= -1 && c.right <= innerWidth + 1 && c.top >= -1 && c.bottom <= innerHeight + 1; };
    const m = document.getElementById('mapa').getBoundingClientRect(), est = document.getElementById('estat').getBoundingClientRect(), inf = document.getElementById('info').getBoundingClientRect();
    return { botons: [...document.querySelectorAll('#controls button')].every(dins), mapa: dins(document.getElementById('mapa')) && m.top >= est.bottom - 1 && m.bottom <= inf.top + 1,
      ample: Math.round(m.width), marca: document.getElementById('marca').scrollWidth <= document.getElementById('marca').clientWidth + 1, ajuda: dins(document.querySelector('#wrap > small')) };
  });
  diu(r.botons && r.mapa && r.marca && r.ajuda && r.ample >= 280, `a ${w}×${h} hi cap tot: el mapa fa ${r.ample} px d'ample` + (r.botons && r.mapa && r.marca && r.ajuda ? '' : ' ' + JSON.stringify(r)));
}

diu(!errors.length, 'cap error de JavaScript' + (errors.length ? ': ' + errors.join(' | ') : ''));
await b.close();
console.log(malament ? `\n${malament} coses malament` : '\nTot bé');
process.exit(malament ? 1 : 0);
