// Comprova El Poble del Dia: que les dades dels municipis estiguin ben fetes
// (947, cadascun amb nom, comarca, centre i silueta), que les distancies i
// les fletxes diguin la veritat, que el poble del dia sigui el mateix per a
// tothom i no es repeteixi, que el cercador trobi els noms com els escriu la
// gent, i que es jugui tocant: intents, pistes, perdre, guanyar, desar i
// continuar, la practica, les dues taules i que tot hi capiga a 320 px.
//
//   node scripts/prova-poble.mjs

import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const ARREL = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const URL_JOC = 'file://' + resolve(ARREL, 'poble.html');

let malament = 0;
function diu(be, text) { if (!be) malament++; console.log(`${be ? '✓' : '✗'} ${text}`); }

const b = await chromium.launch();
const errors = [];
const enviats = [];
const obre = async (w = 390, h = 844) => {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: true });
  await ctx.route('**/jocs-records*/**', r => {
    const q = r.request();
    if (q.method() === 'POST') enviats.push({ url: q.url(), ...JSON.parse(q.postData() || '{}') });
    r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' },
      body: q.method() === 'POST' ? '{"ok":true,"posicio":1,"top":[]}' : '[]' });
  });
  const p = await ctx.newPage();
  p.on('pageerror', e => errors.push(String(e)));
  await p.goto(URL_JOC);
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('jugador', 'TST'); localStorage.setItem('poble-vist', '1'); });
  await p.reload();
  await p.waitForTimeout(500);
  await neteja(p);
  return { ctx, p };
};
// treu la taula de l'entrada, si hi és
const neteja = p => p.evaluate(() => { document.querySelectorAll('body > div[style*="position: fixed"]').forEach(d => { if (d.id !== 'msg') d.remove(); }); paused = false; });
// escriu amb el teclat de la pantalla i toca el suggeriment que és aquell municipi
const prova = async (p, nom) => {
  const q = await p.evaluate(n => pla(n.split(/[\s']+/).filter(t => !ARTICLES.has(t.toLowerCase()))[0] || n).slice(0, 6), nom);
  // (el que hi hagués escrit d'abans, s'esborra amb la tecla d'esborrar)
  while (await p.evaluate(() => escrit.length)) await p.tap('#teclat button[data-t="⌫"]');
  for (const ch of q) await p.tap(`#teclat button[data-t="${ch.toUpperCase()}"]`);
  const i = await p.evaluate(n => NOMS.indexOf(n), nom);
  const s = await p.$(`#suggeriments a[data-i="${i}"]`);
  if (!s) return false;
  await s.tap();
  await p.waitForTimeout(80);
  return true;
};
const esperaDialeg = async p => {
  for (let i = 0; i < 40 && !await p.$('#rec-ok'); i++) await p.waitForTimeout(100);
  if (await p.$('#rec-ok')) await p.click('#rec-ok');
  await p.waitForTimeout(400);
};

let { ctx, p } = await obre();

// ---------- 1. les dades ----------
const d = await p.evaluate(() => {
  const ix = n => NOMS.indexOf(n), mal = [];
  if (new Set(NOMS).size !== N) mal.push('noms repetits');
  for (let i = 0; i < N; i++) {
    const c = comarca(i), [x, y] = CENTRE[i];
    if (!(c >= 1 && c <= 43)) mal.push(NOMS[i] + ': sense comarca');
    if (!(x >= 0 && x <= AMPLE && y >= 0 && y <= ALT)) mal.push(NOMS[i] + ': el centre és fora de Catalunya');
    const rs = anells(i);
    // Puigdalber, al mapa d'origen, és una ratlla sense àrea: no surt mai com a poble del dia
    if (NOMS[i] !== 'Puigdàlber' && (!rs.length || rs.some(r => r.length < 3 || r.some(([a, b]) => !isFinite(a + b))))) mal.push(NOMS[i] + ': sense silueta');
  }
  const comarques = new Set(Array.from({ length: N }, (_, i) => comarca(i)));
  return {
    mal, n: N, comarques: comarques.size, coneguts: CONEGUTS.length, conegutsBons: CONEGUTS.every(i => i >= 0 && i < N && NOMS[i] !== 'Puigdàlber') && new Set(CONEGUTS).size === CONEGUTS.length,
    bcnGir: km(ix('Barcelona'), ix('Girona')), lleTgn: km(ix('Lleida'), ix('Tarragona')), vicTar: km(ix('Vic'), ix('Taradell')),
    dirs: [direccio(ix('Barcelona'), ix('Vic')), direccio(ix('Barcelona'), ix('Lleida')), direccio(ix('Tarragona'), ix('Vic')), direccio(ix('Girona'), ix('Tortosa'))].map(k => FLETXES[k]).join(''),
    nous: ['la Ràpita', 'Calonge i Sant Antoni', 'Bigues i Riells del Fai'].every(n => ix(n) >= 0) && ix('Sant Carles de la Ràpita') < 0,
    llucanes: comarca(ix('Prats de Lluçanès')) === 43 && COMARQUES[43] === 'Lluçanès',
    articles: [DE_COMARCA(comarca(ix('Vic'))), DE_COMARCA(comarca(ix('Igualada'))), DE_COMARCA(comarca(ix('Olot'))), DE_COMARCA(comarca(ix('les Borges Blanques')))].join(' / '),
  };
});
diu(d.n === 947 && !d.mal.length, `els ${d.n} municipis, cadascun amb nom, comarca, centre i silueta` + (d.mal.length ? ': ' + d.mal.slice(0, 4).join(' | ') : ''));
diu(d.comarques === 43 && d.llucanes, `hi són les 43 comarques, amb el Lluçanès`);
diu(d.nous, 'amb els noms d\'ara (la Ràpita, Calonge i Sant Antoni, Bigues i Riells del Fai)');
diu(d.coneguts >= 200 && d.conegutsBons, `${d.coneguts} pobles coneguts per al del dia, tots diferents i tots a la llista`);
diu(d.bcnGir > 80 && d.bcnGir < 92 && d.lleTgn > 70 && d.lleTgn < 86 && d.vicTar > 3 && d.vicTar < 9,
  `les distàncies diuen la veritat: Barcelona–Girona ${d.bcnGir.toFixed(0)} km, Lleida–Tarragona ${d.lleTgn.toFixed(0)}, Vic–Taradell ${d.vicTar.toFixed(1)}`);
diu(d.dirs === '↑←↗↙', `i les fletxes també: de Barcelona, Vic és ↑ i Lleida ←; de Tarragona, Vic ↗; de Girona, Tortosa ↙ (${d.dirs})`);
diu(d.articles === "d'Osona / de l'Anoia / de la Garrotxa / de les Garrigues", `la pista diu la comarca amb el seu article: ${d.articles}`);

// ---------- 2. el poble del dia ----------
const dia = await p.evaluate(() => {
  const L = CONEGUTS.length, primers = Array.from({ length: L }, (_, k) => pobleDe(k + 1));
  let seguits = 0;
  for (let n = 1; n < 3 * L + 5; n++) if (pobleDe(n) === pobleDe(n + 1)) seguits++;
  return { L, diferents: new Set(primers).size, seguits, avui: pobleDe(numeroDe(diaAvui())), obj: R.obj, u: numeroDe('2026-11-02'), d: diaDe(5) };
});
diu(dia.diferents === dia.L && dia.seguits === 0, `cap poble no es repeteix fins que no han sortit tots ${dia.L}, i mai dos dies seguits`);
diu(dia.u === 1 && dia.d === '2026-11-06' && dia.obj === dia.avui, 'el #1 és el del 2 de novembre, i el d\'avui és el que toca');
{
  const { ctx: c2, p: p2 } = await obre(360, 640);
  const altre = await p2.evaluate(() => R.obj);
  diu(altre === dia.obj, 'el poble d\'avui és el mateix en un altre mòbil');
  await c2.close();
}

// ---------- 3. el cercador ----------
const cerca = await p.evaluate(() => ({
  hospi: busca('hospi', 3).map(i => NOMS[i]),
  lhospi: busca("l'hospi", 3).map(i => NOMS[i]),
  seu: busca('seu', 3).map(i => NOMS[i]),
  urgell: busca('urgell', 5).map(i => NOMS[i]),
  canco: busca('cassa', 3).map(i => NOMS[i]),
  sant: busca('sant', 3).map(i => NOMS[i]).every(n => /^Sant/.test(n)),
  res: busca('zzz', 3).length,
}));
diu(cerca.hospi[0] === "l'Hospitalet de Llobregat" && cerca.lhospi[0] === "l'Hospitalet de Llobregat", 'escrivint «hospi» o «l\'hospi» surt primer l\'Hospitalet de Llobregat: ' + cerca.hospi.join(', '));
diu(cerca.seu[0] === "la Seu d'Urgell" && cerca.urgell.includes("la Seu d'Urgell"), 'sense l\'article també («seu»), i per qualsevol paraula del nom («urgell»)');
diu(cerca.canco[0] === 'Cassà de la Selva' && cerca.sant && cerca.res === 0, 'sense accents («cassa» → Cassà de la Selva), i si no n\'hi ha cap, res');

// ---------- 4. jugar tocant: perdre ----------
// el poble d'avui, de debò (es desa amb el poble, i en tornar a obrir ha de quadrar)
const T = await p.evaluate(() => ({ nom: NOMS[R.obj], com: COMARQUES[comarca(R.obj)], ini: inicial(R.obj) }));
const FALSOS = ['Lleida', 'Tarragona', 'Girona', 'Manresa', 'Vic', 'Figueres', 'Tremp'].filter(x => x !== T.nom).slice(0, 6);
const tocats = [];
for (const n of FALSOS.slice(0, 3)) tocats.push(await prova(p, n));
let e = await p.evaluate(() => ({
  files: [...document.querySelectorAll('.int')].slice(0, 3).map(x => x.textContent),
  pista: document.getElementById('pista').textContent, escrit: escrit,
}));
diu(tocats.every(Boolean) && e.files[0].includes(FALSOS[0].toUpperCase()) && /\d+ km/.test(e.files[0]) && /[↑↗→↘↓↙←↖]/.test(e.files[0]) && /%/.test(e.files[0]) && e.escrit === '',
  'escrivint al teclat i tocant el municipi, surt la fila amb els km, la fletxa i el %: ' + e.files[0]);
diu(e.pista.includes(T.com), `al cap de 3 intents, la pista diu la comarca (avui és ${T.nom}): ` + e.pista);
// el mateix dues vegades no compta
const repetit = await prova(p, FALSOS[0]);
let n = await p.evaluate(() => R.intents.length);
diu(n === 3 && !repetit, 'el mateix municipi no es pot provar dues vegades (ni surt als suggeriments)');
await prova(p, FALSOS[3]); await prova(p, FALSOS[4]);
e = await p.evaluate(() => ({ pista: document.getElementById('pista').textContent }));
diu(e.pista.includes('comença per ' + T.ini), 'al cap de 5, també per quina lletra comença: ' + e.pista);
// desar i continuar a mig fer
await p.reload(); await p.waitForTimeout(500); await neteja(p);
e = await p.evaluate(() => ({ n: R.intents.length, noms: R.intents.map(i => NOMS[i]) }));
diu(e.n === 5 && e.noms[0] === FALSOS[0] && e.noms[4] === FALSOS[4], 'tancant i tornant a obrir, els intents hi són: ' + e.noms.join(', '));
enviats.length = 0;
await prova(p, FALSOS[5]);
await p.waitForTimeout(2200);
await esperaDialeg(p);
e = await p.evaluate(() => ({ fi: R.fi, encert: R.encert, msg: document.getElementById('msg').textContent, pt: punts(), stats,
  esperat: Math.max(1, Math.min(399, 400 - Math.round(Math.min(...R.intents.map(i => km(i, R.obj)))))) }));
diu(e.fi && !e.encert && /NO L'HAS TROBAT/.test(e.msg) && e.msg.includes(T.nom.toUpperCase()) && e.pt === e.esperat && e.pt < 400,
  `al sisè sense encertar s'acaba, diu quin era, i els punts són 400 menys els km del més proper (${e.pt})`);
diu(enviats.some(x => x.url.includes('poble_dia/') && x.punts === e.pt) && !enviats.some(x => /records\/poble$/.test(x.url)),
  'va a la taula d\'avui; als pobles endevinats no, que no l\'ha endevinat: ' + enviats.map(x => x.url.split('/records/')[1] + ' ' + x.punts).join(', '));
diu(e.stats.jugades === 1 && e.stats.encerts === 0 && e.stats.ratxa === 0, 'les estadístiques: 1 dia jugat, 0 endevinats');
// ja no es pot tornar a jugar
enviats.length = 0;
await p.reload(); await p.waitForTimeout(800); await neteja(p);
e = await p.evaluate(() => ({ fi: R.fi, msg: document.getElementById('msg').style.display }));
diu(e.fi && e.msg === 'block' && !enviats.length, 'tornant-hi, el d\'avui ja està fet: surt el final i no es torna a apuntar');
// la practica
await p.evaluate(() => obre('practica', 0));
await p.waitForTimeout(200);
const pr = await p.evaluate(() => ({ mode, obj: R.obj, avui: pobleDe(numeroDe(diaAvui())), lider: document.getElementById('lider').textContent }));
diu(pr.mode === 'practica' && pr.obj !== pr.avui && /PRÀCTICA/.test(pr.lider), 'la pràctica és un altre poble, i ho diu');
await p.evaluate(() => { R.obj = NOMS.indexOf('Vic'); pinta(); });
await prova(p, 'Vic');
await p.waitForTimeout(1600);
e = await p.evaluate(() => ({ fi: R.fi, encert: R.encert, msg: document.getElementById('msg').textContent }));
diu(e.fi && e.encert && /PRÀCTICA/.test(e.msg) && !enviats.length, 'i encertant-la no compta per a cap taula');
await ctx.close();

// ---------- 5. guanyar ----------
enviats.length = 0;
({ ctx, p } = await obre(390, 844));
await prova(p, FALSOS[0]);
await prova(p, T.nom);
await p.waitForTimeout(1500);
await esperaDialeg(p);
e = await p.evaluate(() => ({ fi: R.fi, encert: R.encert, msg: document.getElementById('msg').textContent, pt: punts(), stats, graella: graella() }));
diu(e.fi && e.encert && /L'HAS ENDEVINAT/.test(e.msg) && e.pt === 900 && /al 2n intent/.test(e.msg),
  `endevinant-lo al segon intent (${T.nom}): 900 punts`);
diu(enviats.some(x => x.url.includes('poble_dia/') && x.punts === 900) && enviats.some(x => /records\/poble$/.test(x.url) && x.punts === 1),
  'va a la taula d\'avui (900) i als pobles endevinats (1): ' + enviats.map(x => x.url.split('/records/')[1] + ' ' + x.punts).join(', '));
diu(/🎯/.test(e.graella) && e.graella.split('\n').length === 2 && /(⬆️|↗️|➡️|↘️|⬇️|↙️|⬅️|↖️)/u.test(e.graella) && !/[A-Z]{3}/.test(e.graella),
  'el que s\'envia al grup són els colors i les fletxes, mai els noms:\n' + e.graella);
diu(e.stats.encerts === 1 && e.stats.ratxa === 1 && e.stats.intents[1] === 1, 'les estadístiques: 1 endevinat, ratxa 1');
await ctx.close();

// ---------- 6. la P i la pausa ----------
({ ctx, p } = await obre(390, 844));
await p.keyboard.type('pals');
e = await p.evaluate(() => ({ escrit, paused, sugs: sugs.map(i => NOMS[i]) }));
diu(e.escrit === 'pals' && !e.paused && e.sugs[0] === 'Pals', 'amb el teclat de l\'ordinador la P s\'escriu (Pals), no fa pausa');
await p.keyboard.press('Enter');
diu(await p.evaluate(() => R.intents.length === 1 && NOMS[R.intents[0]] === 'Pals'), 'i Enter prova el primer suggeriment');
await p.evaluate(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'p', code: 'KeyP' })));
e = await p.evaluate(() => ({ paused, vist: getComputedStyle(document.getElementById('pausa')).display }));
diu(e.paused && e.vist === 'flex', 'el botó de pausa del marcador (una P de mentida) sí que fa pausa');
await p.tap('#teclat button[data-t="A"]');
e = await p.evaluate(() => ({ paused, escrit }));
diu(!e.paused && e.escrit === '', 'i tocant, es treu la pausa sense escriure res');
await ctx.close();

// ---------- 7. la primera vegada ----------
({ ctx, p } = await obre(390, 844));
await p.evaluate(() => localStorage.removeItem('poble-vist'));
await p.reload(); await p.waitForTimeout(500); await neteja(p);
e = await p.evaluate(() => document.getElementById('msg').textContent);
diu(/6 intents/.test(e) && /quilòmetres/.test(e) && /comarca/.test(e), 'la primera vegada explica com es juga');
await ctx.close();

// ---------- 8. que hi capiga ----------
for (const [w, h] of [[320, 568], [360, 640], [390, 844]]) {
  ({ ctx, p } = await obre(w, h));
  for (const nn of ['Vandellòs i l\'Hospitalet de l\'Infant', 'Castellbell i el Vilar'].filter(x => x !== T.nom)) await prova(p, nn);
  await p.tap('#teclat button[data-t="S"]');
  const m = await p.evaluate(() => {
    const r = id => document.getElementById(id).getBoundingClientRect();
    const tecles = [...document.querySelectorAll('#teclat button')].map(b => b.getBoundingClientRect());
    return {
      scroll: document.documentElement.scrollWidth > innerWidth + 1,
      teclat: tecles.every(t => t.bottom <= innerHeight + 1 && t.right <= innerWidth + 1 && t.width >= 22),
      vista: r('vista').height, intents: [...document.querySelectorAll('.int')].every(x => x.scrollWidth <= x.clientWidth + 1),
      sug: [...document.querySelectorAll('#suggeriments a')].every(a => a.getBoundingClientRect().right <= innerWidth + 1),
      ajuda: r('wrap').bottom <= innerHeight + 1,
    };
  });
  diu(!m.scroll && m.teclat && m.vista >= 100 && m.intents && m.sug && m.ajuda,
    `a ${w}×${h} tot hi cap: la silueta i el mapa fan ${Math.round(m.vista)} px d'alt, i el teclat i els noms llargs no surten`);
  await ctx.close();
}

diu(!errors.length, 'cap error de JavaScript' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
await b.close();
console.log(malament ? `\n${malament} coses malament` : '\nEl Poble del Dia, bé');
process.exit(malament ? 1 : 0);
