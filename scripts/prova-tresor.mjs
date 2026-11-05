// Comprova El Tresor dels Templers jugant-lo sencer amb el dit, de
// Montserrat al castell de Miravet: que cada prova només es passi quan toca
// (i que les equivocacions no la passin), la motxilla (agafar, ajuntar,
// fer servir, llegir), les pistes (que treuen punts), desar i continuar, que
// el final vagi a la taula i que hi capiga a 320 px.
//
//   node scripts/prova-tresor.mjs

import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const ARREL = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const URL_JOC = 'file://' + resolve(ARREL, 'tresor.html');

let malament = 0;
function diu(be, text) { if (!be) malament++; console.log(`${be ? '✓' : '✗'} ${text}`); }

const b = await chromium.launch();
const errors = [], enviats = [];
const obre = async (w = 390, h = 780, neteja = true, ctx0 = null) => {
  const ctx = ctx0 || await b.newContext({ viewport: { width: w, height: h }, hasTouch: true });
  if (!ctx0) await ctx.route('**/jocs-records*/**', r => {
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
  await p.evaluate(() => document.querySelectorAll('body > div[style*="position: fixed"]').forEach(d => { if (d.id !== 'msg') d.remove(); }));
  await p.evaluate(() => { paused = false; });
  return { ctx, p };
};
// tocar un punt de l'escena (en les coordenades del joc, 360 × 270)
const toca = async (p, x, y, n = 1) => {
  for (let i = 0; i < n; i++) {
    const [sx, sy] = await p.evaluate(([x, y]) => { const r = CV.getBoundingClientRect(); return [r.x + x * K, r.y + y * K]; }, [x, y]);
    await p.mouse.click(sx, sy); await p.waitForTimeout(40);
  }
};
// tocar una cosa de l'escena pel seu nom (el mig del seu rectangle)
const cosa = async (p, id, n = 1) => {
  const c = await p.evaluate(id => { const o = objs(SALES[Z.sala]).find(o => o.id === id); return o ? [o.x + o.w / 2, o.y + o.h / 2] : null; }, id);
  if (!c) throw new Error('no hi ha ' + id);
  await toca(p, c[0], c[1], n);
};
const motxilla = async (p, id) => {
  const [sx, sy] = await p.evaluate(id => { const i = Z.inv.indexOf(id), r = IV.getBoundingClientRect(); return [r.x + i * (IS + 6) + IS / 2, r.y + IS / 2]; }, id);
  await p.mouse.click(sx, sy); await p.waitForTimeout(40);
};
const sala = p => p.evaluate(() => Z.sala);
const text = p => p.evaluate(() => $('text').textContent);
const f = (p, k) => p.evaluate(k => Z.f[k], k);

let { ctx, p } = await obre();
diu(await p.evaluate(() => /COMENÇA A MONTSERRAT/.test($('msg').textContent)), 'en entrar surt el menú amb COMENÇA A MONTSERRAT');
await p.click('#m-nova'); await p.waitForTimeout(200);

// ---------- 1. Montserrat ----------
await cosa(p, 'porta');
diu(await sala(p) === 0 && /no es pot moure/i.test(await text(p)), '1 · la porta tancada no deixa passar');
await p.click('#pista'); await p.waitForTimeout(60);
diu(await p.evaluate(() => Z.pis[0] === 1 && /Pista 1 de 3/.test($('text').textContent)), '1 · la PISTA ensenya la primera pista');
await cosa(p, 'roca');
diu(await f(p, 'lianes') === 1 && /sol, unes ones i una lluna/.test(await text(p)), "1 · apartant l'heura surten els tres dibuixos");
await cosa(p, 'r0', 3); await cosa(p, 'r1'); await cosa(p, 'r2');
diu(await f(p, 'obert0') === 1, '1 · posant sol, ones i lluna a les rodes, la porta s\'obre');
await cosa(p, 'porta');
diu(await sala(p) === 1, '1 · i entrant-hi, passes a la prova 2');

// ---------- 2. L'Ebre ----------
await cosa(p, 'barca');
diu(await sala(p) === 1 && /altra riba/.test(await text(p)), "2 · la barca és a l'altra riba i no es pot pujar");
await cosa(p, 'canyes'); await cosa(p, 'sorra');
diu(await p.evaluate(() => Z.inv.includes('corda') && Z.inv.includes('garfi')), '2 · la corda és entre les canyes i el garfi a la sorra');
await motxilla(p, 'corda'); await cosa(p, 'barca');
diu(await f(p, 'lligada') === 0 && /Sense res a la punta/.test(await text(p)), '2 · la corda sola no enganxa la barca');
await motxilla(p, 'corda'); await motxilla(p, 'garfi');
diu(await p.evaluate(() => Z.inv.includes('cordagarfi') && !Z.inv.includes('corda') && !Z.inv.includes('garfi')), '2 · tocant la corda i el garfi a la motxilla, s\'ajunten');
await motxilla(p, 'cordagarfi'); await cosa(p, 'barca');
diu(await f(p, 'lligada') === 1 && !(await p.evaluate(() => Z.inv.includes('cordagarfi'))), '2 · amb la corda amb garfi, la barca ve cap aquí');
await p.waitForTimeout(1900);
await cosa(p, 'barca');
diu(await sala(p) === 2, '2 · i pujant a la barca, passes a la prova 3');

// ---------- 3. El refugi ----------
await cosa(p, 'cova');
diu(await sala(p) === 2 && /Sense llum/.test(await text(p)), '3 · sense llum no entres a la cova');
await cosa(p, 'diari');
await motxilla(p, 'diari'); await motxilla(p, 'diari');
diu(await p.evaluate(() => $('msg').style.display === 'block' && /ocells/.test($('msg').textContent)), '3 · el diari es llegeix tocant-lo dues vegades a la motxilla');
await p.click('#msg'); await p.waitForTimeout(80);
await cosa(p, 'cofre');
diu(await p.evaluate(() => zoom === 'cadenat'), '3 · tocant el cofre surt el cadenat de prop');
await cosa(p, 'd0', 3); await cosa(p, 'd1', 2); await cosa(p, 'd2', 4);
diu(await f(p, 'cofre') === 0, '3 · amb 3-2-4 no s\'obre');
await cosa(p, 'd2', 1);
diu(await f(p, 'cofre') === 1 && await p.evaluate(() => zoom === null), '3 · amb 3-2-5 (ocells, ampolles, estrelles) el cofre s\'obre');
await p.waitForTimeout(650);
await cosa(p, 'llantia'); await cosa(p, 'cova');
diu(await sala(p) === 3, '3 · amb la llàntia entres a la cova');

// ---------- 4. La cova de les pintures ----------
await toca(p, 100, 60);
diu(await p.evaluate(() => Math.abs(focus.x - 100) < 2 && Math.abs(focus.y - 60) < 2), '4 · la llum va on toques');
await cosa(p, 'p0');
diu(await p.evaluate(() => Z.f.seq.length === 0) && /no era l'ordre/.test(await text(p)), "4 · estirant primer la de l'ocell, les palanques tornen a pujar");
await cosa(p, 'p2'); await cosa(p, 'p0'); await cosa(p, 'p1');
diu(await f(p, 'obert3') === 1 && await p.evaluate(() => Z.peces === 1 && Z.inv.includes('peca')), '4 · serp, ocell i peix obren la paret, i hi ha el primer tros del segell');
await cosa(p, 'sortida');
diu(await sala(p) === 4, '4 · i per la paret oberta, a la prova 5');

// desar i continuar
await p.evaluate(() => desa());
await p.reload(); await p.waitForTimeout(400);
await p.evaluate(() => document.querySelectorAll('body > div[style*="position: fixed"]').forEach(d => { if (d.id !== 'msg') d.remove(); }));
diu(await p.evaluate(() => /CONTINUA/.test($('msg').textContent) && /prova 5 de 10/.test($('msg').textContent)), 'tornant a obrir el joc, el menú ofereix CONTINUA a la prova 5');
await p.click('#m-cont'); await p.waitForTimeout(150);
diu(await p.evaluate(() => Z.sala === 4 && Z.inv.join() === 'diari,llantia,peca' && Z.peces === 1 && Z.pis[0] === 1), 'i continua on era, amb la motxilla i les pistes');

// ---------- 5. El mercat de Vic ----------
await cosa(p, 's3'); await cosa(p, 's3');
diu(await p.evaluate(() => Z.f.plat.length === 0), '5 · un pes es posa al plat i es torna a treure');
await cosa(p, 's1');
diu(/soldat/.test(await text(p)), "5 · el pes d'1 no es pot treure");
await cosa(p, 's5');
diu(await f(p, 'obert4') === 0, '5 · amb 1 + 5 la balança no queda plana');
await cosa(p, 's5'); await cosa(p, 's2'); await cosa(p, 's4');
diu(await f(p, 'obert4') === 1, '5 · amb 1 + 2 + 4 = 7, la balança queda plana i la porta s\'obre');
await p.waitForTimeout(300);
await cosa(p, 'porta');
diu(await sala(p) === 5, '5 · a la prova 6');

// ---------- 6. Poblet ----------
diu(!(await p.evaluate(() => feix().encert)), '6 · al principi la llum no arriba al sol');
await cosa(p, 'm0'); await cosa(p, 'm1'); await cosa(p, 'm2');
diu(await f(p, 'obert5') === 0, '6 · amb tres miralls girats encara no');
await cosa(p, 'm3');
diu(await f(p, 'obert5') === 1 && await p.evaluate(() => Z.peces === 2), '6 · amb els quatre, la llum toca el sol, la porta s\'obre i hi ha el segon tros');
await cosa(p, 'porta');
diu(await sala(p) === 6, '6 · a la prova 7');

// ---------- 7. El campanar ----------
for (const k of [2, 0, 3, 1]) await cosa(p, 'c' + k);
await cosa(p, 'lloro');
diu(/gana/.test(await text(p)), '7 · la cotorra té gana');
await cosa(p, 'arbre'); await motxilla(p, 'fruita'); await cosa(p, 'lloro');
diu(await f(p, 'menjat') === 1 && await p.evaluate(() => cancoT > 0), '7 · donant-li la nespra, canta');
await p.waitForTimeout(3000);
await cosa(p, 'c0');
diu(/No sona/.test(await text(p)), '7 · tocant malament, no sona com la cançó');
for (const k of [2, 0, 3, 1]) await cosa(p, 'c' + k);
diu(await f(p, 'obert6') === 0, '7 · la cançó a mitges no obre');
await cosa(p, 'c2');
diu(await f(p, 'obert6') === 1, '7 · la cançó sencera obre la porta');
await cosa(p, 'porta');
diu(await sala(p) === 7, '7 · a la prova 8');

// ---------- 8. Tàrraco ----------
await cosa(p, 'tauleta');
diu(/X val 10/.test(await text(p)), '8 · netejant la tauleta, surt què val cada lletra');
await cosa(p, 'bV'); await cosa(p, 'bV'); await cosa(p, 'bV'); await cosa(p, 'altar');
diu(await f(p, 'obert7') === 0 && /no està ben escrit/.test(await text(p)) && await f(p, 'rom') === '', '8 · VVV no és un número romà, i s\'esborra');
await cosa(p, 'bX'); await cosa(p, 'bI'); await cosa(p, 'bV'); await cosa(p, 'altar');
diu(await f(p, 'obert7') === 0 && /No era aquest/.test(await text(p)), '8 · XIV no és la resposta');
await cosa(p, 'bX'); await cosa(p, 'bV'); await cosa(p, 'altar');
diu(await f(p, 'obert7') === 1 && await p.evaluate(() => Z.peces === 3), '8 · XV obre la porta i hi ha el tercer tros');
await p.waitForTimeout(300);
await cosa(p, 'porta');
diu(await sala(p) === 8, '8 · a la prova 9');

// ---------- 9. La casa modernista ----------
await cosa(p, 'esquelet');
diu(await p.evaluate(() => Z.inv.includes('pergami')), "9 · l'armadura té el pergamí");
await cosa(p, 't12');
diu(/Massa lluny/.test(await text(p)), "9 · no es pot saltar més d'una rajola");
await cosa(p, 't32'); await cosa(p, 't31');
diu(await p.evaluate(() => Z.f.pr === 4 && Z.f.pc === 2) && /s'enfonsa/.test(await text(p)), "9 · trepitjant una estrella, cau i tornes a l'entrada");
for (const t of ['t32', 't22', 't12', 't11', 't01']) await cosa(p, t);
diu(await p.evaluate(() => Z.f.pr === 0 && Z.f.pc === 1 && Z.peces === 4), '9 · seguint les roses arribes a la porta, amb el quart tros');
await cosa(p, 'porta');
diu(await sala(p) === 9, '9 · a la prova 10');

// ---------- 10. Miravet ----------
await cosa(p, 'q0');
diu(/falta un tros/.test(await text(p)), '10 · el forat buit diu que hi falta un tros');
for (let i = 0; i < 4; i++) { await motxilla(p, 'peca'); await cosa(p, 'q' + i); }
diu(await p.evaluate(() => Z.f.pos === 4 && Z.peces === 0 && !Z.inv.includes('peca')), '10 · els quatre trossos encaixen al forat');
const rots = await p.evaluate(() => Z.f.rot.slice());
for (let q = 0; q < 4; q++) await cosa(p, 'q' + q, (4 - rots[q]) % 4 - (q === 3 ? 1 : 0));
diu(await f(p, 'obert9') === 0, '10 · amb un tros encara girat, no s\'obre');
await cosa(p, 'q3');
diu(await f(p, 'obert9') === 1, '10 · amb el segell sencer, la porta es parteix');
enviats.length = 0;
await p.waitForTimeout(2400);
await cosa(p, 'mascara');
await p.waitForTimeout(1000);
for (let k = 0; k < 30 && !await p.$('#rec-ok'); k++) await p.waitForTimeout(100);
if (await p.$('#rec-ok')) await p.click('#rec-ok');
await p.waitForTimeout(500);
const fi = await p.evaluate(() => ({ fi: Z.fi, total: Z.total, pt: Z.pt.slice(), bonus: Z.bonus, msg: $('msg').textContent }));
diu(fi.fi && /HAS TROBAT EL TRESOR/.test(fi.msg), 'agafant el tresor, s\'acaba la partida');
diu(fi.pt[0] === 70 && fi.pt.slice(1).every(v => v === 100) && fi.total === 970 + fi.bonus && fi.bonus > 500, `els punts: 100 per prova, 30 menys per la pista, i el temps (${fi.total})`);
const env = enviats.filter(e => /\/records\/tresor$/.test(e.url));
diu(env.length === 1 && env[0].punts === fi.total, 'els punts van a la taula del joc');
await p.reload(); await p.waitForTimeout(400);
diu(await p.evaluate(() => /TORNA A COMENÇAR/.test($('msg').textContent)), 'acabada, el menú ofereix tornar a començar');
await ctx.close();

// ---------- la pausa ----------
({ ctx, p } = await obre());
await p.click('#m-nova'); await p.waitForTimeout(200);
await p.keyboard.press('KeyP');
const t0 = await p.evaluate(() => Z.temps); await p.waitForTimeout(700); const t1 = await p.evaluate(() => Z.temps);
await cosa(p, 'roca').catch(() => {});
diu(await p.evaluate(() => paused) === false && t1 - t0 < .05, 'en pausa el rellotge s\'atura, i tocant la pantalla torna');
await ctx.close();

// ---------- hi cap ----------
for (const [w, h] of [[320, 568], [360, 640], [390, 844]]) {
  ({ ctx, p } = await obre(w, h));
  await p.click('#m-nova'); await p.waitForTimeout(200);
  const m = await p.evaluate(() => {
    const c = CV.getBoundingClientRect(), iv = IV.getBoundingClientRect(), bt = $('pista').getBoundingClientRect(), sm = document.querySelector('small').getBoundingClientRect(), hud = $('hud');
    return { scroll: document.documentElement.scrollWidth > innerWidth, cw: c.width, fora: Math.max(c.right, iv.right, bt.right) > innerWidth || sm.bottom > innerHeight + 1, slot: IS, hud: hud.scrollWidth > hud.clientWidth + 1 };
  });
  diu(!m.scroll && !m.fora && !m.hud && m.cw >= 280 && m.slot >= 34, `a ${w}×${h} hi cap tot (escena de ${Math.round(m.cw)} px, caselles de la motxilla de ${m.slot})`);
  await ctx.close();
}

diu(errors.length === 0, 'cap error de JavaScript ' + (errors.length ? errors.join(' | ') : ''));
await b.close();
console.log(malament ? `\n${malament} coses malament` : '\nTot bé');
process.exit(malament ? 1 : 0);
