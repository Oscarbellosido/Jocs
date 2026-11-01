// Comprova La Botifarra: les regles (l'ordre de les cartes, els punts, les
// obligacions de seguir, matar, fallar i sobrefallar), que la maquina no faci
// mai una jugada prohibida i jugui millor que l'atzar, que la partida del dia
// tingui les mateixes cartes per a tothom, i que es jugui tocant: triar
// trumfo, contrar, la carta que no es pot tirar, aixecar-la i tirar-la, desar
// i continuar, acabar-la, les dues taules i que tot hi capiga.
//
//   node scripts/prova-botifarra.mjs

import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const ARREL = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const URL_JOC = 'file://' + resolve(ARREL, 'botifarra.html');

let malament = 0;
function diu(be, text) { if (!be) malament++; console.log(`${be ? '✓' : '✗'} ${text}`); }

const b = await chromium.launch();
const errors = [];
const enviats = [];
const obre = async (w = 390, h = 844, neta = true) => {
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
  if (neta) {
    await p.evaluate(() => { localStorage.clear(); localStorage.setItem('jugador', 'TST'); localStorage.setItem('botifarra-vist', '1'); });
    await p.reload();
  }
  await p.waitForTimeout(500);
  await neteja(p);
  return { ctx, p };
};
const neteja = p => p.evaluate(() => { document.querySelectorAll('body > div[style*="position: fixed"]').forEach(d => { if (d.id !== 'msg') d.remove(); }); paused = false; });
// fa correr el rellotge del joc fins que passi una cosa
const espera = async (p, cond, max = 400) => {
  for (let i = 0; i < max; i++) {
    if (await p.evaluate(cond)) return true;
    await p.evaluate(() => cuita());
    await p.waitForTimeout(30);
  }
  return false;
};
// on es una carta de la teva ma, a la pantalla
const onCarta = (p, c) => p.evaluate(c => {
  const r = cv.getBoundingClientRect(), q = posMa().find(x => x.c === c);
  return [r.left + q.x + 8, r.top + L.mansY - (sel === c ? L.aixeca : 0) + L.ch * .4];
}, c);

let { ctx, p } = await obre();

// ---------- 1. les regles ----------
const reg = await p.evaluate(() => {
  const C = (s, n) => s * 12 + n - 1;          // pal i numero
  const O = 0, Co = 1, E = 2, B = 3;
  const eq = (a, b2) => JSON.stringify([...a].sort((x, y) => x - y)) === JSON.stringify([...b2].sort((x, y) => x - y));
  const t = [];
  // l'ordre: manilla, as, rei, cavall, sota, 8... 2
  const ordre = [9, 1, 12, 11, 10, 8, 7, 6, 5, 4, 3, 2].map(n => C(Co, n));
  t.push(ordre.every((c, i) => i === 0 || forca(ordre[i - 1]) > forca(c)));
  t.push([0, 1, 2, 3].every(s => delPal(s).reduce((a, c) => a + punts(c), 0) === 15));
  t.push(punts(C(O, 9)) === 5 && punts(C(O, 1)) === 4 && punts(C(O, 12)) === 3 && punts(C(O, 11)) === 2 && punts(C(O, 10)) === 1 && punts(C(O, 8)) === 0);
  // el trumfo guanya; un altre pal no
  t.push(mata(C(E, 2), C(Co, 9), E) && !mata(C(O, 9), C(Co, 2), E) && mata(C(Co, 9), C(Co, 1), BOTI));
  const B1 = (...cs) => cs.map((c, i) => ({ j: (3 - cs.length + 1 + i + 4) % 4, c }));   // la basa, acabant a l'esquerra teva
  // seguir el pal
  const l1 = legals([C(Co, 3), C(O, 9)], [{ j: 3, c: C(Co, 5) }], 0, E);
  // matar si es pot
  const l2 = legals([C(Co, 3), C(Co, 1)], [{ j: 3, c: C(Co, 5) }], 0, E);
  // si guanya el company, no cal
  const l3 = legals([C(Co, 3), C(Co, 1)], [{ j: 2, c: C(Co, 5) }, { j: 3, c: C(Co, 4) }], 0, E);
  // sense el pal, fallar
  const l4 = legals([C(E, 2), C(O, 5)], [{ j: 3, c: C(Co, 5) }], 0, E);
  // un rival ja ha fallat amb un trumfo mes alt: tires el que vols
  const l5 = legals([C(E, 2), C(O, 5)], [{ j: 2, c: C(Co, 5) }, { j: 3, c: C(E, 7) }], 0, E);
  // ha fallat amb un de mes baix: sobrefallar
  const l6 = legals([C(E, 7), C(O, 5)], [{ j: 2, c: C(Co, 5) }, { j: 3, c: C(E, 2) }], 0, E);
  // sense el pal i guanyant el company: el que vulguis
  const l7 = legals([C(E, 2), C(O, 5)], [{ j: 2, c: C(Co, 9) }, { j: 3, c: C(Co, 5) }], 0, E);
  // a botifarra no hi ha trumfo
  const l8 = legals([C(E, 2), C(O, 5)], [{ j: 3, c: C(Co, 5) }], 0, BOTI);
  t.push(eq(l1, [C(Co, 3)]), eq(l2, [C(Co, 1)]), eq(l3, [C(Co, 3), C(Co, 1)]), eq(l4, [C(E, 2)]),
         eq(l5, [C(E, 2), C(O, 5)]), eq(l6, [C(E, 7)]), eq(l7, [C(E, 2), C(O, 5)]), eq(l8, [C(E, 2), C(O, 5)]));
  // i el que diu quan no es pot
  const m1 = perQue([C(Co, 3), C(O, 9)], [{ j: 3, c: C(Co, 5) }], 0, E, C(O, 9));
  const m2 = perQue([C(Co, 3), C(Co, 1)], [{ j: 3, c: C(Co, 5) }], 0, E, C(Co, 3));
  const m3 = perQue([C(E, 2), C(O, 5)], [{ j: 3, c: C(Co, 5) }], 0, E, C(O, 5));
  const m4 = perQue([C(E, 7), C(O, 5)], [{ j: 2, c: C(Co, 5) }, { j: 3, c: C(E, 2) }], 0, E, C(O, 5));
  t.push(/tirar copes/.test(m1), /matar/.test(m2), /fallar/.test(m3), /sobrefallar/.test(m4));
  // els punts de la ma: qui passa de 36 s'apunta el que passa, pel multiplicador
  const G0 = { punts: [0, 0], historia: [], ma: 0, trumfo: BOTI, contro: 2, triador: 1, puntsMa: [41, 31], bases: [7, 5] };
  const r1 = tancaMa(G0);
  const G1 = { punts: [0, 0], historia: [], ma: 0, trumfo: 1, contro: 1, triador: 1, puntsMa: [36, 36], bases: [6, 6] };
  const r2 = tancaMa(G1);
  t.push(r1.eq === 0 && r1.p === 20 && G0.punts[0] === 20, r2.eq === -1 && r2.p === 0);
  return { t, ok: t.every(Boolean) };
});
diu(reg.ok, 'l\'ordre de les cartes, els punts (15 per pal), les obligacions de seguir, matar, fallar i sobrefallar, i el que diu quan no es pot' + (reg.ok ? '' : ' ' + JSON.stringify(reg.t)));

// ---------- 2. la maquina ----------
const ia = await p.evaluate(() => {
  let rnd = 7; const atzar = () => ((rnd = Math.imul(rnd, 1103515245) + 12345 >>> 0) / 4294967296);
  let illegals = 0, mal72 = 0, netIA = 0, netAtz = 0, trumfos = [0, 0, 0, 0, 0], delega = 0;
  const N = 300;
  for (let i = 0; i < N; i++) {
    for (const contraAtzar of [true, false]) {
      const H = { llavor: 'PROVA-' + i, ma: 0, donador0: i % 4 }; novaMa(H);
      let t = iaTria(H.mans[H.donador], true), q = H.donador;
      if (t === -1) { delega++; q = (q + 2) % 4; t = iaTria(H.mans[q], false); }
      if (contraAtzar) trumfos[t]++;
      H.trumfo = t; H.triador = q; H.fase = 'joc'; H.torn = (H.donador + 1) % 4;
      while (H.fase === 'joc') {
        const j = H.torn, L2 = legals(H.mans[j], H.basa, j, H.trumfo);
        // la parella 0 la porta la maquina; la 1, l'atzar (o la maquina)
        const c = (j % 2 === 0 || !contraAtzar) ? iaJuga(H, j) : L2[Math.floor(atzar() * L2.length)];
        if (!L2.includes(c)) illegals++;
        tira(H, j, c);
      }
      if (H.puntsMa[0] + H.puntsMa[1] !== 72) mal72++;
      if (contraAtzar) netAtz += H.puntsMa[0] - 36; else netIA += H.puntsMa[0] - 36;
    }
  }
  return { illegals, mal72, contraAtzar: netAtz / N, igual: netIA / N, trumfos, delega: delega / (2 * N) };
});
diu(ia.illegals === 0 && ia.mal72 === 0, `en ${600} mans, la màquina no fa cap jugada prohibida i cada mà suma els 72 punts`);
diu(ia.contraAtzar > 8, `la màquina juga de debò: contra qui tira a l'atzar fa ${ia.contraAtzar.toFixed(1)} punts per mà de mitjana (entre màquines, ${ia.igual.toFixed(1)})`);
diu(ia.trumfos.every(x => x > 0) && ia.delega > .1 && ia.delega < .7,
  `tria tots els pals i també botifarra (${ia.trumfos.join(', ')}), i delega quan la mà és fluixa (${Math.round(ia.delega * 100)}%)`);

// ---------- 3. la partida del dia: les mateixes cartes ----------
const dia = await p.evaluate(() => {
  novaPartida('dia'); const a = JSON.stringify([G.mans, G.donador, G.llavor]);
  novaPartida('dia'); const b2 = JSON.stringify([G.mans, G.donador, G.llavor]);
  novaPartida('lliure'); const c = JSON.stringify([G.mans]);
  G = null; return { igual: a === b2, lliure: a !== c, llavor: JSON.parse(a)[2] };
});
diu(dia.igual && dia.lliure, `la partida del dia té les mateixes cartes per a tothom (${dia.llavor}), i la lliure no`);

// ---------- 4. jugar tocant ----------
await p.tap('#m-dia');
await p.waitForTimeout(200);
// fins que et toqui fer alguna cosa
const fins = async () => espera(p, () => document.getElementById('panell').style.display === 'block' ||
  (G.fase === 'joc' && G.torn === 0 && !vistaBasa) || G.fase === 'fi-ma' || G.fase === 'fi');
let vistTria = false, vistIllegal = '', aixeca = null, tirada = false, vistContro = false;
for (let pas = 0; pas < 60 && !tirada; pas++) {
  await fins();
  const st = await p.evaluate(() => ({ f: G.fase, t: G.torn, pan: document.getElementById('panell').style.display === 'block',
    tria: !!document.getElementById('tr0'), ct: !!document.getElementById('ct-no') }));
  if (st.pan && st.tria) { vistTria = true; await p.tap('#tr1'); continue; }
  if (st.pan && st.ct) { vistContro = true; await p.tap('#ct-no'); continue; }
  if (st.f === 'joc' && st.t === 0) {
    const [lg, ma] = await p.evaluate(() => [legals(G.mans[0], G.basa, 0, G.trumfo), G.mans[0].slice()]);
    const il = ma.find(c => !lg.includes(c));
    if (il !== undefined && !vistIllegal) {
      const [x, y] = await onCarta(p, il); await p.touchscreen.tap(x, y); await p.waitForTimeout(100);
      vistIllegal = await p.evaluate(() => document.getElementById('que').textContent);
    }
    if (il === undefined && !vistIllegal) {
      // a la primera basa sortim nosaltres: tirem i ja es veura a la seguent
      await p.evaluate(() => juga(0, iaJuga(G, 0))); continue;
    }
    const c = lg[0];
    let [x, y] = await onCarta(p, c); await p.touchscreen.tap(x, y); await p.waitForTimeout(100);
    aixeca = await p.evaluate(c => ({ sel: sel === c, queden: G.mans[0].length }), c);
    [x, y] = await onCarta(p, c); await p.touchscreen.tap(x, y); await p.waitForTimeout(100);
    tirada = await p.evaluate(([c, n]) => !G.mans[0].includes(c) && G.mans[0].length === n - 1, [c, aixeca.queden]);
    continue;
  }
  if (st.f === 'fi-ma' || st.f === 'fi') break;
}
diu(vistTria || await p.evaluate(() => G.historia.length > 0 || G.triador !== 0), 'quan et toca fer trumfo, surten els quatre pals, la botifarra i (si dones) delegar');
diu(/Has de|No tens/.test(vistIllegal), `tocant una carta que no es pot tirar, diu per què: «${vistIllegal}»`);
diu(aixeca && aixeca.sel && tirada, 'el primer toc aixeca la carta i el segon la tira');

// la resta de la ma, de pressa: tu jugues com la maquina
const acabaMa = async () => {
  for (let k = 0; k < 200; k++) {
    await fins();
    const st = await p.evaluate(() => ({ f: G.fase, t: G.torn, tria: !!document.getElementById('tr0') && document.getElementById('panell').style.display === 'block',
      ct: !!document.getElementById('ct-no') && document.getElementById('panell').style.display === 'block' }));
    if (st.f === 'fi-ma' || st.f === 'fi') return st.f;
    if (st.tria) await p.evaluate(() => { const t = iaTria(G.mans[0], false); declara(0, t === -1 ? 0 : t); segueix(); });
    else if (st.ct) await p.evaluate(() => { document.getElementById('ct-no').click(); });
    else if (st.f === 'joc' && st.t === 0) await p.evaluate(() => juga(0, iaJuga(G, 0)));
  }
  return null;
};
await acabaMa();
await espera(p, () => !!document.getElementById('b-seg') && document.getElementById('msg').style.display === 'block');
const res = await p.evaluate(() => ({ r: G.resultat, punts: G.punts, text: document.getElementById('msg').textContent }));
diu(res.r && res.r.punts[0] + res.r.punts[1] === 72 && res.punts[res.r.eq < 0 ? 0 : res.r.eq] === res.r.p && /36/.test(res.text),
  `en acabar la mà ensenya els punts de cada parella (${res.r && res.r.punts.join(' i ')}) i el que s'apunta qui passa de 36 (${res.r && res.r.p})`);

// ---------- 5. desar i continuar ----------
await p.tap('#b-seg');
await p.waitForTimeout(200);
const abans = await p.evaluate(() => JSON.stringify([G.ma, G.punts, G.mans[0]]));
await p.reload(); await p.waitForTimeout(500); await neteja(p);
const menuText = await p.evaluate(() => document.getElementById('msg').textContent);
await p.tap('#m-dia'); await p.waitForTimeout(200);
const despres = await p.evaluate(() => JSON.stringify([G.ma, G.punts, G.mans[0]]));
diu(/CONTINUA LA D'AVUI/.test(menuText) && /mà 2 de 8/.test(menuText) && abans === despres, 'tancant i tornant-hi, el menú diu CONTINUA LA D\'AVUI i continues a la mà 2 amb les mateixes cartes');

// ---------- 6. contrar ----------
const ctr = await p.evaluate(() => {
  // la Rosa fa trumfo: tu decideixes si el contres
  novaPartida('lliure'); comenca(); cues = []; G.fase = 'contro'; G.triador = 1; G.trumfo = 2; G.pas = 1; G.contro = 1; segueix();
  const hiEs = !!document.getElementById('ct-si') && document.getElementById('panell').style.display === 'block';
  document.getElementById('ct-si').click();
  return { hiEs, contro: G.contro, pas: G.pas, fase: G.fase };
});
diu(ctr.hiEs && ctr.contro === 2 && (ctr.pas === 2 || ctr.fase === 'joc'), 'si fan trumfo els rivals, pots contrar: la mà val el doble');
await p.evaluate(() => { try { localStorage.removeItem('botifarra-partida'); } catch (e) {} });

// ---------- 7. acabar la del dia ----------
await p.evaluate(() => { menu(); });
await p.tap('#m-dia'); await p.waitForTimeout(200);
for (let m = 0; m < 10; m++) {
  const f = await acabaMa();
  if (f === 'fi') break;
  await espera(p, () => !!document.getElementById('b-seg') && document.getElementById('msg').style.display === 'block');
  await p.tap('#b-seg'); await p.waitForTimeout(100);
}
// les inicials: la taula es buida i hi entra
for (let i = 0; i < 40 && !await p.$('#rec-ok'); i++) await p.waitForTimeout(100);
if (await p.$('#rec-ok')) await p.click('#rec-ok');
await espera(p, () => /LA PARTIDA DEL DIA/.test(document.getElementById('msg').textContent) && !/…/.test(document.getElementById('taula') ? document.getElementById('taula').textContent : '…'));
const fi = await p.evaluate(() => ({ punts: G.punts, mans: G.historia.length, text: document.getElementById('msg').textContent, dia: G.dia }));
const alDia = enviats.filter(e => e.url.includes('/records/botifarra_dia/' + fi.dia));
diu(fi.mans === 8 && /LA PARTIDA DEL DIA/.test(fi.text) && /PARTIDES GUANYADES/.test(fi.text),
  `la del dia s'acaba a les 8 mans (${fi.punts[0]} a ${fi.punts[1]}) i ensenya les dues taules`);
diu(fi.punts[0] === 0 ? alDia.length === 0 : (alDia.length === 1 && alDia[0].punts === fi.punts[0]),
  `a la taula d'avui hi van els punts de la teva parella (${fi.punts[0]}), una sola vegada`);
await p.evaluate(() => menu());
const fet = await p.evaluate(() => document.getElementById('m-dia').textContent);
diu(/LA D'AVUI: \d+ PUNTS/.test(fet), `tornant al menú, la del dia surt feta: «${fet}»`);

// ---------- 8. la partida lliure ----------
const n0 = enviats.length;
const ll = await p.evaluate(async () => {
  novaPartida('lliure'); comenca(); cues = []; desaPartida();
  menu(); const pregunta = (document.getElementById('m-nova').click(), /SEGUR/.test(document.getElementById('msg').textContent));
  G.punts = [104, 61]; G.fi = true; G.fase = 'fi';
  finalPartida();
  return { pregunta };
});
for (let i = 0; i < 40 && !await p.$('#rec-ok'); i++) await p.waitForTimeout(100);
if (await p.$('#rec-ok')) await p.click('#rec-ok');
await p.waitForTimeout(400);
Object.assign(ll, await p.evaluate(() => ({ text: document.getElementById('msg').textContent, stats, desada: localStorage.getItem('botifarra-partida') })));
const alSempre = enviats.slice(n0).filter(e => /\/records\/botifarra$/.test(e.url));
diu(ll.pregunta, 'amb una partida lliure a mig fer, començar-ne una altra pregunta abans (SEGUR?)');
diu(/HEU GUANYAT/.test(ll.text) && ll.stats.guanyades === 1 && alSempre.length === 1 && alSempre[0].punts === 1 && !ll.desada,
  'guanyant la lliure a 101, suma una partida guanyada a la taula de sempre i s\'esborra');
await ctx.close();

// ---------- 9. hi cap tot ----------
for (const [w, h] of [[320, 568], [360, 640], [390, 844]]) {
  ({ ctx, p } = await obre(w, h));
  await p.tap('#m-nova'); await p.waitForTimeout(200);
  const r = await p.evaluate(() => {
    cues = []; G.fase = 'tria'; G.torn = 0; G.donador = 0; G.delegat = false; segueix();
    const s = document.getElementById('screen').getBoundingClientRect(), pn = document.getElementById('panell').getBoundingClientRect();
    const ps = posMa(), mansTop = s.top + L.mansY;
    const dins = el => { const c = el.getBoundingClientRect(); return c.left >= -1 && c.right <= innerWidth + 1 && c.top >= -1 && c.bottom <= innerHeight + 1; };
    // la basa en creu: que no toqui els noms dels costats ni la ma
    const esq = L.cx - L.tw * 1.08 - L.tw / 2, baix = L.cy + L.th * .52 + L.th / 2;
    return { ma: ps[0].x >= 0 && ps[ps.length - 1].x + L.cw <= L.W, panell: pn.bottom <= mansTop + 1 && pn.top >= s.top - 1 && dins(document.getElementById('panell')),
      botons: [...document.querySelectorAll('#controls button')].every(dins), ajuda: dins(document.querySelector('#wrap > small')),
      basa: esq >= 40 && baix <= L.mansY - L.aixeca, cw: L.cw, tw: L.tw, pas: ps.length > 1 ? Math.round(ps[1].x - ps[0].x) : 0 };
  });
  diu(r.ma && r.panell && r.botons && r.ajuda && r.basa && r.pas >= 20,
    `a ${w}×${h} hi cap tot: cartes de ${r.cw} px a la mà (se'n veuen ${r.pas} de cadascuna) i de ${r.tw} a la basa, i el quadre del trumfo no tapa la mà` +
    (r.ma && r.panell && r.botons && r.ajuda && r.basa ? '' : ' ' + JSON.stringify(r)));
  await ctx.close();
}

diu(!errors.length, 'cap error de JavaScript' + (errors.length ? ': ' + errors.join(' | ') : ''));
await b.close();
console.log(malament ? `\n${malament} coses malament` : '\nTot bé');
process.exit(malament ? 1 : 0);
