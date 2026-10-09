// Comprova La Impremta: que el diccionari porti plurals i verbs conjugats,
// que es puguin fer paraules tocant la pantalla, que les que no existeixen no
// costin res, que descartar canviï lletres, que el censor prohibeixi de debo,
// que la mateixa llavor doni la mateixa partida (el repte i la del dia en
// depenen), que la partida del dia s'apunti a la taula del dia una sola
// vegada, que el repte es pugui obrir des de l'enllac, i que un jugador
// automatic arribi a uns quants capitols i la partida s'acabi.
//
//   node scripts/prova-impremta.mjs
//
// Com al Garbuix, el diccionari es llegeix amb fetch() i des de file:// el
// navegador no ho deixa fer: la prova serveix el repositori per http.

import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'http';
import fs from 'fs';
import { resolve, dirname, extname, join } from 'path';
import { fileURLToPath } from 'url';

const ARREL = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TIPUS = { '.html': 'text/html', '.js': 'text/javascript', '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png', '.json': 'application/json' };
const servidor = http.createServer((req, res) => {
  const cami = join(ARREL, decodeURIComponent(req.url.split('?')[0]));
  if (!cami.startsWith(ARREL) || !fs.existsSync(cami) || fs.statSync(cami).isDirectory()) {
    res.writeHead(404); res.end(); return;
  }
  res.writeHead(200, { 'content-type': TIPUS[extname(cami)] || 'application/octet-stream' });
  fs.createReadStream(cami).pipe(res);
});
await new Promise(r => servidor.listen(0, '127.0.0.1', r));
const URL_JOC = `http://127.0.0.1:${servidor.address().port}/impremta.html`;

let malament = 0;
function diu(be, text) { if (!be) malament++; console.log(`${be ? '✓' : '✗'} ${text}`); }

const b = await chromium.launch();
const enviats = [];
async function obre(hash = '') {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  await ctx.route('**/jocs-records*/**', r => {
    if (r.request().method() === 'POST') enviats.push(r.request().url());
    const cos = r.request().method() === 'POST'
      ? JSON.stringify({ top: [{ n: 'TST', p: 5, t: 1 }], posicio: 1 }) : '[]';
    return r.fulfill({ status: 200, contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' }, body: cos });
  });
  const p = await ctx.newPage();
  p.errors = [];
  p.on('pageerror', e => p.errors.push(String(e)));
  await p.goto(URL_JOC + hash);
  await p.waitForFunction(() => DIC !== null || errorDic, null, { timeout: 30000 });
  await p.waitForTimeout(300);
  return p;
}
const errorsDe = [];

let p = await obre();
errorsDe.push(p);

// --- el diccionari ---
const dic = await p.evaluate(() => ({
  error: errorDic, mida: DIC ? DIC.size : 0,
  hi: ['casa', 'cases', 'gats', 'menjo', 'cantaven', 'pinyols', 'avui', 'quatre', 'som'].filter(w => DIC.has(w)),
  noHi: ['xzt', 'barcelona', 'casess'].filter(w => DIC.has(w)),
}));
diu(!dic.error && dic.mida > 150000, `el diccionari es carrega (${dic.mida} formes)`);
diu(dic.hi.length === 9, `hi ha plurals, verbs conjugats i paraules petites (${dic.hi.join(' ')})`);
diu(dic.noHi.length === 0, `no hi ha paraules inventades ni noms propis`);

// Busca dins de la ma la paraula mes llarga que es pot fer (sense comodins).
const BUSCA = `(() => {
  let millor = null;
  for (const w of DIC) {
    const ts = w.match(/qu|ny|./g);
    if (ts.length > P.ma.length || ts.length < 3 || (millor && ts.length <= millor.length)) continue;
    const pool = P.ma.filter(t => !t.comodi); const usats = []; let ok = true;
    for (const t of ts) { const k = pool.findIndex(o => o.l === t); if (k < 0) { ok = false; break } usats.push(pool[k]); pool.splice(k, 1) }
    if (ok && resol(usats).ok) millor = usats;
  }
  return millor;
})()`;

// --- jugar tocant la pantalla ---
// l'objectiu, ben alt: aqui no volem acabar la pagina a la primera paraula
await p.evaluate(() => { novaPartida('lliure', 'PROVA'); P.objectiu = 999999; });
const box = await p.locator('#game').boundingBox();
const aPant = (wx, wy) => [box.x + wx / 420 * box.width, box.y + wy / 580 * box.height];
async function tocaTipus(ids) {
  for (const id of ids) {
    const [cx, cy] = await p.evaluate(id => {
      const n = Math.max(P.ma.length, 8), [w, h] = midaTipus(n), x0 = (W - P.ma.length * (w + 4) + 4) / 2;
      const i = P.ma.findIndex(t => t.id === id);
      return [x0 + i * (w + 4) + w / 2, Y_MA + h / 2];
    }, id);
    const [sx, sy] = aPant(cx, cy);
    await p.mouse.click(sx, sy);
    await p.waitForTimeout(60);
  }
}
let ids = await p.evaluate(`(${BUSCA}||[]).map(t => t.id)`);
await tocaTipus(ids);
let r = await p.evaluate(() => ({ comp: P.comp.map(t => t.l).join(''), n: P.comp.length }));
diu(r.n === ids.length && r.n >= 3, `tocant les lletres de la mà van al componedor («${r.comp}»)`);
const abans = await p.evaluate(() => ({ imp: P.impressions, ma: P.ma.length }));
await p.click('#b2');
await p.waitForFunction(() => state === 'pagina' || state === 'cobra', null, { timeout: 15000 });
r = await p.evaluate(() => ({ impres: P.impres, imp: P.impressions, ma: P.ma.length, fetes: P.fetes, total: P.total }));
diu(r.impres > 0 && r.imp === abans.imp - 1 && r.ma === abans.ma,
  `IMPRIMEIX: la paraula puntua (${r.fetes[0] && r.fetes[0].text}, ${r.impres} punts), gasta una impressió i la mà es torna a omplir`);

// una paraula que no existeix no costa res
await p.evaluate(() => {
  const ts = ['x', 'z', 'q'].map(l => nouTipus(l === 'q' ? 'qu' : l));
  P.ma.splice(0, 3, ...ts); P.comp = ts.slice();
});
await p.click('#b2'); await p.waitForTimeout(150);
r = await p.evaluate(() => ({ state, imp: P.impressions, avis }));
diu(r.state === 'pagina' && r.imp === abans.imp - 1, `una paraula que no existeix es rebutja sense gastar res («${r.avis}»)`);

// descartar
await p.evaluate(() => { P.comp = P.ma.slice(0, 3); });
const idsFora = await p.evaluate(() => P.comp.map(t => t.id));
await p.click('#b1'); await p.waitForTimeout(100);
r = await p.evaluate(fora => ({ desc: P.descarts, ma: P.ma.length, queden: P.ma.filter(t => fora.includes(t.id)).length }), idsFora);
diu(r.desc === 2 && r.ma === 8 && r.queden === 0, `DESCARTA llença les triades, gasta un descart i en treu de noves`);

// el censor: SENSE E no deixa imprimir cap paraula amb E
r = await p.evaluate(() => {
  P.censor = 'sense_e';
  const casa = ['c', 'a', 's', 'a'].map(l => nouTipus(l)), cel = ['c', 'e', 'l'].map(l => nouTipus(l));
  const a = resol(casa), b = resol(cel);
  P.censor = null;
  return { casa: a.ok, cel: b.ok, motiu: b.motiu };
});
diu(r.casa && !r.cel, `el censor SENSE E deixa passar CASA però no CEL («${r.motiu}»)`);

// el comodi fa de la lletra que calgui
r = await p.evaluate(() => {
  const ts = [nouTipus('g'), nouTipus('a', null, true), nouTipus('t')];
  const v = resol(ts);
  return { ok: v.ok, text: v.text };
});
diu(r.ok && r.text && r.text.length === 3, `el comodí fa de la lletra que calgui (G?T → ${r.text && r.text.toUpperCase()})`);

// un segell canvia la puntuacio
r = await p.evaluate(() => {
  const ts = ['c', 'a', 's', 'a'].map(l => nouTipus(l));
  const sense = resol(ts).res.total;
  P.segells = [{ id: 'tinta', n: 0 }];
  const amb = resol(ts).res.total;
  P.segells = [{ id: 'curta', n: 0 }];
  const doble = resol(ts).res.total;
  P.segells = [];
  return { sense, amb, doble };
});
diu(r.amb > r.sense && r.doble === r.sense * 2, `els segells sumen i multipliquen (CASA: ${r.sense}, amb Tinta fresca ${r.amb}, amb Poc i bo ${r.doble})`);

// --- la llavor: la mateixa partida per a tothom ---
r = await p.evaluate(() => {
  const foto = () => {
    novaPartida('lliure', 'LLAVOR-A');
    const ma = P.ma.map(t => t.l).join('');
    P.impres = P.objectiu; cobra(); aLaBotiga();
    return ma + '|' + P.botiga.items.map(i => i && (i.id || i.n || i.k)).join(',') + '|' + censorDe(3);
  };
  const a = foto(), b = foto();
  novaPartida('lliure', 'LLAVOR-B');
  const c = P.ma.map(t => t.l).join('');
  return { a, b, c };
});
diu(r.a === r.b, `la mateixa llavor dona les mateixes lletres, la mateixa botiga i els mateixos censors`);
diu(r.c !== r.a.split('|')[0], `una altra llavor, unes altres lletres`);

// --- la botiga ---
r = await p.evaluate(() => {
  novaPartida('lliure', 'BOTIGA'); P.impres = P.objectiu; cobra();
  const rals0 = P.rals, cobr = P.cobrament.total; aLaBotiga();
  P.rals = 50;
  const it = P.botiga.items[0]; compra(0);
  const teSeg = P.segells.length === 1 && P.segells[0].id === it.id;
  const canvi0 = P.botiga.items[1].id; canvia();
  const pg = P.pagina; seguentPagina();
  return { cobr, rals0, teSeg, rals: P.rals, pag: P.pagina, pg, state };
});
diu(r.cobr >= 3 && r.teSeg, `en acabar una pàgina es cobren rals (${r.cobr}) i a la botiga es pot comprar un segell`);
diu(r.pag === r.pg + 1 && r.state === 'pagina', `SEGÜENT PÀGINA porta a la pàgina següent`);

// un sol toc a la botiga i el segell ja es teu (abans en calien dos, i amb un
// semblava que ja el tenies)
{
  await p.evaluate(() => { novaPartida('lliure', 'BOTIGA2'); P.impres = P.objectiu; cobra(); aLaBotiga(); P.rals = 50; });
  const id = await p.evaluate(() => P.botiga.items[0].id);
  await p.waitForTimeout(100);
  const bb = await p.locator('#game').boundingBox();           // el marcador pot haver mogut el canvas
  await p.mouse.click(bb.x + (16 + 95) / 420 * bb.width, bb.y + (176 + 18 + 55) / 580 * bb.height);   // el mig de la primera casella
  await p.waitForTimeout(150);
  const s = await p.evaluate(() => ({ segells: P.segells.map(x => x.id), venut: !!P.botiga.items[0].venut, rals: P.rals }));
  diu(s.segells.includes(id) && s.venut && s.rals < 50, `a la botiga, un sol toc compra el segell (${id})`);
}

// --- la partida del dia: una sola vegada a la taula del dia ---
const dia = await p.evaluate(() => diaAvui());
enviats.length = 0;
await p.evaluate(() => { localStorage.removeItem('impremta-dia'); novaPartida('dia', 'DIA-' + diaAvui()); P.total = 777; perd(); });
await p.waitForSelector('#rec-ok', { timeout: 8000 }).catch(() => {});
if (await p.$('#rec-ok')) { await p.fill('#rec-nom', 'TST'); await p.click('#rec-ok'); }
await p.waitForTimeout(800);
const primer = enviats.slice();
enviats.length = 0;
await p.evaluate(() => { hideMsg(); novaPartida('dia', 'DIA-' + diaAvui()); P.total = 999; perd(); });
await p.waitForTimeout(2000);
const segon = await p.evaluate(() => ({ fora: P.fora, text: document.getElementById('msg').textContent }));
diu(primer.length === 1 && primer[0].endsWith('/records/impremta_dia/' + dia),
  `la partida del dia s'apunta només a la taula d'avui, separada de la de sempre (${primer.map(u => u.replace(/.*records/, '…')).join(' ')})`);
diu(enviats.length === 0 && segon.fora && /no compta/.test(segon.text), `tornar-la a jugar el mateix dia ja no compta`);

// el quadre final porta els enllaços per reptar, amb la llavor de la partida
r = await p.evaluate(() => [...document.querySelectorAll('#msg .reptes a')].map(a => a.getAttribute('href')));
diu(r.length === 3 && /t\.me\/share/.test(r[0]) && /wa\.me/.test(r[1]) && decodeURIComponent(r[0]).includes('repte=DIA-' + dia),
  `en acabar hi ha REPTA PER TELEGRAM, PER WHATSAPP i COPIA L'ENLLAÇ, amb la llavor de la partida`);
diu(await p.$('a[data-menu-jocs]') !== null, `i el botó de tornar al menú`);

// --- el repte: l'enllac obre la mateixa partida ---
const p2 = await obre('#repte=K7Q2PX&n=CRE&p=12340&c=4&g=2');
errorsDe.push(p2);
await p2.waitForTimeout(3800);
const box2 = await p2.locator('#game').boundingBox();
// el boto del repte es el primer de la portada del joc
await p2.mouse.click(box2.x + box2.width / 2, box2.y + (274 + 37) / 580 * box2.height);
await p2.waitForTimeout(200);
r = await p2.evaluate(() => ({ state, llavor: P && P.llavor, repte: P && P.repte && P.repte.n, ma: P && P.ma.map(t => t.l).join('') }));
const maRepte = await p.evaluate(() => { novaPartida('lliure', 'K7Q2PX'); return P.ma.map(t => t.l).join(''); });
diu(r.state === 'pagina' && r.llavor === 'K7Q2PX' && r.repte === 'CRE' && r.ma === maRepte,
  `l'enllaç del repte obre la mateixa partida (les mateixes lletres: ${r.ma && r.ma.toUpperCase()})`);
await p2.evaluate(() => { P.total = 20000; perd(); });
await p2.waitForTimeout(1500);
if (await p2.$('#rec-ok')) { await p2.fill('#rec-nom', 'TST'); await p2.click('#rec-ok'); }
await p2.waitForTimeout(800);
r = await p2.evaluate(() => document.getElementById('msg').textContent);
diu(/REPTE DE CRE/.test(r) && /GUANYAT/.test(r), `en acabar el repte diu qui ha guanyat`);

// --- cap ma sense vocals ---
// Moltes partides, i a cada pagina es descarta i s'imprimeix a l'atzar fins
// que s'acaba la bossa: cada ma ha de tenir dues vocals i dues consonants
// mentre a la pila n'hi quedin.
r = await p.evaluate(() => {
  let mans = 0, dolentes = [], semblants = 0;
  const comprova = () => {
    mans++;
    const v = P.ma.filter(esVocal).length, c = P.ma.length - v;
    const pilaV = P.pila.filter(esVocal).length, pilaC = P.pila.length - pilaV;
    if ((v < 2 && pilaV > 0) || (c < 2 && pilaC > 0)) dolentes.push(P.ma.map(t => t.l).join(''));
  };
  for (let k = 0; k < 150; k++) {
    novaPartida('lliure', 'VOCALS' + k);
    comprova();
    for (let d = 0; d < 6 && P.pila.length; d++) {
      P.comp = P.ma.slice(0, 1 + (k + d) % P.ma.length); P.descarts = 9; descarta(); comprova();
    }
  }
  // la mateixa llavor, la mateixa ma
  for (let k = 0; k < 20; k++) {
    novaPartida('lliure', 'IGUAL' + k); const a = P.ma.map(t => t.l).join('');
    novaPartida('lliure', 'IGUAL' + k); if (a === P.ma.map(t => t.l).join('')) semblants++;
  }
  return { mans, dolentes, semblants };
});
diu(r.dolentes.length === 0, `cap mà sense dues vocals i dues consonants (${r.mans} mans` +
  (r.dolentes.length ? `; dolentes: ${r.dolentes.slice(0, 3).join(' ')}` : '') + ')');
diu(r.semblants === 20, `i la mateixa llavor segueix donant la mateixa mà`);

// --- sortir a mig fer i tornar ---
// Abans, tornant al menu a mitja partida, es perdia amb tots els punts.
{
  const q = await obre();
  errorsDe.push(q);
  await q.waitForTimeout(3600);
  await q.evaluate(`(() => {
    novaPartida('lliure', 'DESA'); P.objectiu = 1;
    P.comp = ${BUSCA}; imprimeix();
  })()`);
  await q.waitForFunction(() => state === 'cobra', null, { timeout: 15000 });
  await q.evaluate(() => { aLaBotiga(); P.rals = 50; compra(3); if (state === 'paquet') triaPaquet(0); seguentPagina(); P.objectiu = 999999; });
  await q.evaluate(`(() => { P.comp = ${BUSCA}; imprimeix(); })()`);
  await q.waitForFunction(() => state === 'pagina' && !anim, null, { timeout: 15000 });
  const abans = await q.evaluate(() => { desaPartida(); return {
    total: P.total, cap: P.capitol, pag: P.pagina, imp: P.impressions, rals: P.rals,
    ma: P.ma.map(t => t.l + (t.e || '')).join(), caixa: P.caixa.length, pila: P.pila.length }; });
  await q.reload();
  await q.waitForFunction(() => DIC !== null || errorDic, null, { timeout: 30000 });
  await q.waitForTimeout(3600);
  const hiEs = await q.evaluate(() => state === 'inici' && !!partidaDesada());
  diu(hiEs, `en tornar al joc, la partida a mig fer hi és (${abans.total} punts, capítol ${abans.cap}, pàgina ${abans.pag})`);
  const bq = await q.locator('#game').boundingBox();
  await q.mouse.click(bq.x + bq.width / 2, bq.y + (262 + 33) / 580 * bq.height);    // CONTINUA, el primer boto
  await q.waitForTimeout(200);
  const despres = await q.evaluate(() => ({
    total: P.total, cap: P.capitol, pag: P.pagina, imp: P.impressions, rals: P.rals,
    ma: P.ma.map(t => t.l + (t.e || '')).join(), caixa: P.caixa.length, pila: P.pila.length,
    mateixos: P.ma.every(t => P.caixa.includes(t)) }));
  diu(JSON.stringify({ ...abans }) === JSON.stringify({ ...despres, mateixos: undefined }) && despres.mateixos,
    `CONTINUA la torna tal com era: punts, pàgina, rals, la mà i la caixa`);
  await q.evaluate(`(() => { P.comp = ${BUSCA}; imprimeix(); })()`);
  await q.waitForFunction(() => (state === 'pagina' || state === 'cobra') && !anim, null, { timeout: 15000 });
  const segueix = await q.evaluate(t => P.total > t, abans.total);
  diu(segueix, 'i s\'hi pot seguir imprimint');
  await q.evaluate(() => { perd(); });
  await q.waitForTimeout(1500);
  if (await q.$('#rec-ok')) { await q.fill('#rec-nom', 'TST'); await q.click('#rec-ok'); }
  diu(await q.evaluate(() => partidaDesada() === null), 'quan la partida s\'acaba, ja no queda desada');
}

// --- partides senceres amb un jugador automatic ---
// Juga com algu que comença: de les paraules que pot fer, una de les mes
// llargues fins a sis lletres, i compra segells quan pot.
r = await p.evaluate(() => {
  const llista = [];
  for (const w of DIC) { const ts = w.match(/qu|ny|./g); if (ts.length <= 6 && ts.length >= 3) llista.push(ts) }
  function millor() {
    const out = [];
    for (const ts of llista) {
      if (ts.length > P.ma.length) continue;
      const pool = P.ma.slice(); const usats = []; let ok = true;
      for (const t of ts) { let k = pool.findIndex(o => !o.comodi && o.l === t); if (k < 0) k = pool.findIndex(o => o.comodi); if (k < 0) { ok = false; break } usats.push(pool[k]); pool.splice(k, 1) }
      if (ok) out.push(usats);
    }
    out.sort((a, b) => b.length - a.length);
    for (const u of out.slice(0, 40)) { const v = resol(u); if (v.ok) return u }
    return null;
  }
  const res = [];
  for (let k = 0; k < 4; k++) {
    novaPartida('lliure', 'PILOT' + k);
    let voltes = 0;
    while (state !== 'over' && voltes++ < 400) {
      if (state === 'pagina') {
        const u = millor();
        if (u && (u.length >= 4 || P.descarts === 0)) { P.comp = u; anim = { r: resol(u) }; aplicaImpressio() }
        else if (P.descarts > 0) { P.comp = P.ma.filter(t => !u || !u.includes(t)).slice(0, 5); if (!P.comp.length) P.comp = P.ma.slice(0, 3); descarta() }
        else perd();
      } else if (state === 'cobra') {
        aLaBotiga();
        for (let i = 0; i < 2; i++) if (P.botiga.items[i] && P.botiga.items[i].preu <= P.rals && P.segells.length < 5) compra(i);
        if (state === 'paquet') triaPaquet(0);
        seguentPagina();
      }
    }
    res.push({ g: (P.capitol - 1) * 3 + P.pagina, cap: P.capitol, state, total: P.total });
  }
  return res;
});
diu(r.every(x => x.state === 'over'), `les partides s'acaben (pàgines ${r.map(x => x.g).join(', ')})`);
diu(r.every(x => x.g >= 3), `ningú no perd a la primera pàgina: com a mínim fins a la ${Math.min(...r.map(x => x.g))}`);

const errors = errorsDe.flatMap(q => q.errors);
diu(errors.length === 0, errors.length ? 'error de JavaScript: ' + errors[0] : 'cap error de JavaScript');

console.log(malament ? `\n${malament} coses malament` : '\nLa Impremta, bé');
await b.close();
servidor.close();
process.exit(malament ? 1 : 0);
