// Comprova L'Abecedari: que les definicions estiguin ben fetes (cada
// resposta comença per la seva lletra o la conté, cap no es repeteix, cap
// definicio no du la resposta a dins), que la roda del dia sigui la mateixa
// per a tothom i no repeteixi paraules, i que es jugui tocant: encertar,
// fallar, passar paraula, el rellotge, desar i continuar, i les dues taules.
//
//   node scripts/prova-abecedari.mjs

import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const ARREL = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const URL_JOC = 'file://' + resolve(ARREL, 'abecedari.html');

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
// treu la taula de l'entrada, si hi és
const netejaEntrada = () => p.evaluate(() => document.querySelectorAll('body > div[style*="position: fixed"]').forEach(d => { if (d.id !== 'msg') d.remove(); }));

// ---------- 1. les definicions ----------
const dades = await p.evaluate(() => {
  const mal = [], vist = {};
  for (const L of ORDRE) for (const q of POOLS[L]) {
    const n = pla(q.resp);
    if (L === 'Ç' ? !q.resp.includes('ç') : !n.includes(pla(L))) mal.push('sense la lletra: ' + L + ' ' + q.resp);
    if (vist[n] && vist[n] !== L) mal.push('repetida: ' + q.resp);
    vist[n] = L;
    const mots = q.def.toLowerCase().split(/[^a-zà-úçïü·]+/).map(pla);
    if (mots.some(m => m === n || (n.length >= 5 && m.startsWith(n.slice(0, 5))))) mal.push('la definició la conté: ' + q.resp);
    if (q.def.length < 8 || q.def.length > 140) mal.push('definició massa ' + (q.def.length < 8 ? 'curta' : 'llarga') + ': ' + q.resp);
  }
  return { mal, lletres: ORDRE.length, mides: ORDRE.map(L => POOLS[L].length), total: ORDRE.reduce((n, L) => n + POOLS[L].length, 0),
    comenca: comencaPer('A', { resp: 'abella' }), conte: !comencaPer('Ç', { resp: 'plaça' }) && !comencaPer('Y', { resp: 'canya' }) && !comencaPer('Z', { resp: 'onze' }) };
});
diu(dades.lletres === 25, 'la roda té 25 lletres, de la A a la Z amb la Ç i sense la K ni la W');
diu(Math.min(...dades.mides) >= 30, `cada lletra té prou paraules (${Math.min(...dades.mides)} a ${Math.max(...dades.mides)}; ${dades.total} definicions)`);
diu(!dades.mal.length, 'cada resposta comença per la seva lletra o la conté, cap es repeteix i cap definició la du a dins' + (dades.mal.length ? ': ' + dades.mal.slice(0, 5).join(' | ') : ''));
diu(dades.comenca && dades.conte, 'diu «COMENÇA PER» o «CONTÉ LA» segons la paraula');
diu(await p.evaluate(() => esBona('canco', { resp: 'cançó', alts: [] }) && esBona('INTELLIGENT', { resp: 'intel·ligent', alts: [] }) &&
  esBona('zigzag', POOLS.Z.find(q => q.resp === 'ziga-zaga')) && !esBona('canso', { resp: 'cançó', alts: [] })),
  'no cal posar accents ni la ç ni la l·l: «canco» val per «cançó»');

// ---------- 2. la roda del dia ----------
const roda = await p.evaluate(() => {
  const a = rodaDia(5).map(q => q.resp).join(), b2 = rodaDia(5).map(q => q.resp).join(), c = rodaDia(6).map(q => q.resp).join();
  // una paraula no torna fins que han sortit totes les de la seva lletra
  let repeteix = 0;
  for (const L of ORDRE) { const vistes = new Set(); for (let n = 1; n <= POOLS[L].length; n++) { const r = POOLS[L][indexDia(L, n)].resp; if (vistes.has(r)) repeteix++; vistes.add(r); } }
  const prac = rodaPractica(numero), avui = rodaDia(numero);
  return { igual: a === b2, diferent: a !== c, repeteix, practica: prac.every((q, i) => q.resp !== avui[i].resp), numero, dia };
});
diu(roda.igual && roda.diferent, 'la roda del dia surt sempre igual (per a tothom) i l\'endemà és una altra');
diu(roda.repeteix === 0, 'una paraula no torna a sortir fins que no han sortit totes les de la seva lletra');
diu(roda.practica, 'la de pràctica no porta cap paraula de la d\'avui');
diu(roda.numero >= 1, `la d'avui és la #${roda.numero} (${roda.dia})`);

// ---------- 3. jugar tocant ----------
await netejaEntrada();
diu(await p.evaluate(() => state === 'inici' && !!document.getElementById('b-comenca')), 'en entrar, explica com es juga i espera que premis COMENÇA');
const t0 = await p.evaluate(() => R.temps);
await p.waitForTimeout(600);
diu(await p.evaluate(t => R.temps === t, t0), 'mentre no comences, el rellotge no corre');
await p.tap('#b-comenca');
const escriu = async paraula => { for (const ch of paraula.toUpperCase()) await p.tap(`.k[data-t="${ch}"]`); };
const primera = await p.evaluate(() => R.lletres[0].resp);
await escriu(await p.evaluate(() => pla(R.lletres[0].resp).toUpperCase()));
await p.tap('#respon');
await p.waitForTimeout(150);
let e = await p.evaluate(() => ({ estat: R.estat[0], cur: R.cur, verd: document.querySelectorAll('.ll')[0].classList.contains('be') }));
diu(e.estat === 1 && e.cur === 1 && e.verd, `escrivint ${primera.toUpperCase()} amb el teclat i RESPON, la A es posa verda i passa a la B`);
await escriu('XXX'); await p.tap('.k[data-t="⌫"]');
diu(await p.evaluate(() => R.escrit === 'XX'), 'la tecla ⌫ esborra l\'última lletra');
await p.tap('#respon');
await p.waitForTimeout(100);
const fallada = await p.evaluate(() => ({ estat: R.estat[1], state, def: document.getElementById('def').textContent, resp: R.lletres[1].resp, t: R.temps }));
diu(fallada.estat === 2 && fallada.state === 'revela' && fallada.def.includes(fallada.resp.toUpperCase()), `fallant, la B es posa vermella i diu quina era (${fallada.def})`);
await p.waitForTimeout(1000);
diu(await p.evaluate(t => Math.abs(R.temps - t) < .05, fallada.t), 'mentre ensenya la resposta, el rellotge s\'atura');
await p.waitForTimeout(1500);
diu(await p.evaluate(() => state === 'joc' && R.cur === 2), 'i després passa a la lletra següent');
await p.tap('#passa');
diu(await p.evaluate(() => R.estat[2] === 0 && R.cur === 3), 'PASSA PARAULA deixa la C per més tard i va a la següent');
diu(await p.evaluate(() => esBona('anything', R.lletres[0]) === false && comencaPer(R.lletres[3].L, R.lletres[3]) === false && document.getElementById('mode').textContent === 'CONTÉ LA'),
  'a la Ç diu «CONTÉ LA»');
// la volta: després de la Z torna a la C, que havia passat
await p.evaluate(() => { for (let i = 3; i < 25; i++) R.estat[i] = 1; R.cur = 24; R.estat[24] = 0; });
await p.tap('#passa');
diu(await p.evaluate(() => R.cur === 2), 'acabada la volta, torna a les que havies passat');

// ---------- 4. desar i continuar ----------
await p.evaluate(() => { R.temps = 100; desaDia(); });
await p.reload(); await p.waitForTimeout(500); await netejaEntrada();
const cont = await p.evaluate(() => ({ state, estat: R.estat.slice(0, 3), temps: Math.round(R.temps), txt: document.getElementById('msg').textContent }));
diu(cont.state === 'inici' && cont.estat.join() === '1,2,0' && cont.temps === 100 && /CONTINUA/.test(cont.txt) && /100|1:40/.test(cont.txt),
  'tancant i tornant-hi, la roda d\'avui hi és tal com l\'havies deixada, amb el temps que et quedava');
await p.tap('#b-comenca');
// la pausa
await p.evaluate(() => document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyP', key: 'p', bubbles: true })));
const tp = await p.evaluate(() => R.temps);
await p.waitForTimeout(500);
diu(await p.evaluate(t => paused && R.temps === t && document.getElementById('def').textContent === 'PAUSA', tp), 'amb la pausa, el rellotge s\'atura i la definició s\'amaga');
await p.evaluate(() => document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyP', key: 'p', bubbles: true })));
await p.keyboard.press('p');
diu(await p.evaluate(() => !paused && R.escrit === 'P'), 'la P del teclat de l\'ordinador s\'escriu (només la del botó fa pausa)');
await p.keyboard.press('Backspace');

// ---------- 5. acabar: punts i taules ----------
enviats.length = 0;
await p.evaluate(() => { R.estat[24] = 1; const c = R.lletres[2]; R.escrit = c.resp; });
await p.tap('#respon');
await p.waitForTimeout(800);
for (let i = 0; i < 30 && !await p.$('#rec-ok'); i++) await p.waitForTimeout(100);
if (await p.$('#rec-ok')) await p.click('#rec-ok');
await p.waitForTimeout(800);
const fi = await p.evaluate(() => ({ state, fi: R.fi, punts: punts(), segons: Math.ceil(R.temps), txt: document.getElementById('msg').textContent, stats }));
diu(fi.state === 'fi' && fi.punts === 2400 + fi.segons && fi.segons > 90, `acabant la roda: 24 encerts × 100 + ${fi.segons} segons que sobren = ${fi.punts} punts`);
diu(/24 de 25/.test(fi.txt) && /1 fallada/.test(fi.txt), 'el quadre del final diu els encerts i les fallades');
diu(/vas posar XX/.test(fi.txt), 'i ensenya les que has fallat, amb la definició, la resposta i el que havies posat');
const dia = await p.evaluate(() => dia);
diu(enviats.some(x => x.url.includes('abecedari_dia/' + dia) && x.punts === fi.punts),
  'els punts van a la taula d\'avui (' + enviats.map(x => x.url.split('/records/')[1] + ' ' + x.punts).join(', ') + ')');
diu(enviats.some(x => /records\/abecedari$/.test(x.url) && x.punts === fi.stats.encerts), `i els encerts, als de sempre (${fi.stats.encerts})`);
diu(await p.evaluate(() => { const tx = textCompartir().toLowerCase(); return /ENVIA A TELEGRAM/.test(document.getElementById('msg').textContent) && /🟢/.test(tx) && !R.lletres.some(q => q.resp.length > 3 && tx.includes(q.resp)); }),
  'es pot enviar el resultat al grup, amb els colors i sense les paraules');
diu(fi.stats.jugades === 1 && fi.stats.encerts === 24, 'les estadístiques compten la roda d\'avui');
// tornar-hi: ja està feta
enviats.length = 0;
await p.reload(); await p.waitForTimeout(1200); await netejaEntrada();
diu(await p.evaluate(() => state === 'fi' && !document.getElementById('b-comenca') && stats.jugades === 1), 'tornant-hi el mateix dia, ja està feta i no es pot tornar a començar');
diu(!enviats.length, 'i no es torna a apuntar a la taula');
// la de pràctica no compta
await p.click('#b-prac');
diu(await p.evaluate(() => mode === 'practica' && state === 'joc' && R.temps > TEMPS - 1), 'PRÀCTICA obre una roda nova, que no compta');
await p.evaluate(() => { R.temps = .05; });
await p.waitForTimeout(800);
diu(await p.evaluate(() => state === 'fi' && /PRÀCTICA/.test(document.getElementById('msg').textContent) && stats.jugades === 1),
  'quan s\'acaba el temps, s\'acaba la roda; i la de pràctica no toca les estadístiques');
diu(!enviats.some(x => x.url.includes('abecedari')), 'ni s\'apunta a cap taula');

// ---------- 6. que hi càpiga tot ----------
for (const [w, h] of [[320, 568], [360, 640], [390, 844]]) {
  await p.setViewportSize({ width: w, height: h });
  await p.evaluate(() => { obrePractica(); });
  await p.waitForTimeout(250);
  const r = await p.evaluate(() => {
    const dins = el => { const c = el.getBoundingClientRect(); return c.left >= -1 && c.right <= innerWidth + 1 && c.top >= -1 && c.bottom <= innerHeight + 1; };
    const hud = document.getElementById('hud').getBoundingClientRect(), roda = [...document.querySelectorAll('.ll')].map(d => d.getBoundingClientRect());
    const def = document.getElementById('def').getBoundingClientRect();
    return { tecles: [...document.querySelectorAll('.k, #controls button')].every(dins), petita: Math.min(...[...document.querySelectorAll('.k')].map(k => k.getBoundingClientRect().width)),
      roda: roda.every(c => c.top >= hud.bottom - 2 && c.bottom <= def.top + 2 && c.left >= 0 && c.right <= innerWidth), mida: Math.round(document.getElementById('roda').getBoundingClientRect().width),
      ajuda: dins(document.querySelector('small')) };
  });
  diu(r.tecles && r.roda && r.ajuda && r.petita >= 24, `a ${w}×${h} hi cap tot: la roda de ${r.mida} px, el teclat (tecles de ${Math.round(r.petita)} px) i els botons` + (r.tecles && r.roda && r.ajuda ? '' : ' ' + JSON.stringify(r)));
}

// ---------- 7. tornar-la a fer des d'un altre mòbil ----------
// El Worker recorda qui ja ha jugat la del dia i, si hi tornes amb les mateixes
// inicials, respon que no compta. S'hi envia sempre, encara que no entris als 10.
{
  const c2 = await b.newContext({ viewport: { width: 390, height: 844 } });
  const posts = [];
  let plena = true;
  await c2.route('**/jocs-records*/**', r => {
    const q = r.request();
    if (q.method() === 'POST') { posts.push(JSON.parse(q.postData())); return r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ top: [{ n: 'TST', p: 2000, t: 1 }], posicio: 0, repetida: true }) }); }
    r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify(plena ? Array.from({ length: 10 }, (_, i) => ({ n: 'AAA', p: 2700 - i, t: i })) : []) });
  });
  const p2 = await c2.newPage();
  p2.on('pageerror', e => errors.push(String(e)));
  await p2.goto(URL_JOC);
  await p2.evaluate(() => localStorage.setItem('jugador', 'TST'));
  const fora = await p2.evaluate(() => Records.fiPartida('abecedari_dia/' + diaAvui(), 900));
  diu(posts.length === 1 && posts[0].nom === 'TST' && /Només compta la primera/.test(fora.html),
    'a la del dia s\'hi envia sempre, i si ja hi havies jugat des d\'un altre lloc, diu que només compta la primera');
  plena = false;
  const dins = p2.evaluate(() => Records.fiPartida('abecedari_dia/' + diaAvui(), 2500));
  for (let i = 0; i < 30 && !await p2.$('#rec-ok'); i++) await p2.waitForTimeout(100);
  await p2.click('#rec-ok');
  const r2 = await dins;
  diu(r2.posicio === 0 && /Només compta la primera/.test(r2.html), 'també quan la segona seria un rècord dels 10 millors');
  await c2.close();
}

diu(!errors.length, 'cap error de JavaScript' + (errors.length ? ': ' + errors.join(' | ') : ''));
await b.close();
console.log(malament ? `\n${malament} coses malament` : '\nTot bé');
process.exit(malament ? 1 : 0);
