// Comprova El Temple: que el temple es pugui acabar des de qualsevol lloc on
// puguis arribar (sense racons on quedar-te tancat per sempre), que un pilot
// automatic l'acabi agafant l'idol i tornant a la sortida, i que les trampes
// facin el que han de fer: les caigudes, les punxes, les serps, el terra que
// cau, les portes, les reixes i el temple que s'ensorra. Tambe que la partida
// es desi i es pugui continuar, que els punts vagin a la taula i que els
// botons capiguen a 320 px.
//
//   node scripts/prova-temple.mjs

import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const ARREL = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const URL_JOC = 'file://' + resolve(ARREL, 'temple.html');

let malament = 0;
function diu(be, text) { if (!be) malament++; console.log(`${be ? '✓' : '✗'} ${text}`); }

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
const enviats = [];
await ctx.route('**/jocs-records*/**', r => {
  const q = r.request();
  if (q.method() === 'POST') enviats.push(JSON.parse(q.postData() || '{}'));
  r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' },
    body: q.method() === 'POST' ? '{"ok":true,"posicio":0,"llista":[]}' : '[]' });
});
const p = await ctx.newPage();
// el quadre de les inicials (ja escrites): D'ACORD
async function confirma() {
  for (let i = 0; i < 30; i++) {
    if (await p.$('#rec-ok')) { await p.click('#rec-ok'); await p.waitForTimeout(300); return true; }
    await p.waitForTimeout(100);
  }
  return false;
}
const errors = [];
p.on('pageerror', e => errors.push(String(e)));
await p.goto(URL_JOC);
// amb inicials ja posades, els punts s'envien sense preguntar
await p.evaluate(() => localStorage.setItem('jugador', 'TST'));
await p.waitForTimeout(500);

// ---------- el pilot automatic ----------
// Busca el cami amb les mateixes regles del joc (mouCamina, mouSalta...) i
// el fa amb accio(), amb el rellotge a ma: fueteja les serps que se li
// acosten i espera que les punxes baixin.
await p.evaluate(() => {
// pilot automatic: s'executa dins de la pagina
window.pilot=function(opts={}){
  const DT=1/60,log=[];let passos=0;
  const pas=(n=1)=>{for(let i=0;i<n;i++){actualitza(DT);passos++}};
  const espera=()=>{let k=0;while((J.mov||J.mort)&&estat==='joc'&&k<2000){pas();k++}};
  const moves=(x,y)=>{
    const r=[];
    for(const d of[-1,1]){
      for(const[f,t]of[[mouCamina,'camina'],[mouEnfila,'enfila'],[mouBaixa,'baixa'],[mouSalta,'salta'],[mouPenja,'fuet']]){
        const m=f(x,y,d);if(m&&m.cau<3)r.push({a:t,dir:d,x:m.x,y:m.y,cost:m.cau===2?20:1,m});}
      if(cel(x+d,y)==='D'&&claus>0)r.push({a:'camina',dir:d,x:x+d,y,cost:1});
      if(cel(x+d,y)==='%')r.push({a:'trenca',dir:d,x:x+d,y:caiguda(x+d,y).y,cost:2});
    }
    if(cel(x,y)==='~'){const c=caiguda(x,y+0)/*amb terra*/;const t=MON[y*MW+x];MON[y*MW+x]=' ';const q=caiguda(x,y);MON[y*MW+x]=t;
      if(q.d<3)r.push({a:'espera',dir:J.dir,x:q.x,y:q.y,cost:q.d===2?20:3});}
    return r;
  };
  // Dijkstra cap a qualsevol de les caselles objectiu
  const planeja=(obj)=>{
    const k0=J.x+','+J.y,dist={[k0]:0},prev={},cua=[[0,J.x,J.y]];
    while(cua.length){cua.sort((a,b)=>a[0]-b[0]);const[d,x,y]=cua.shift();const k=x+','+y;
      if(d>dist[k])continue;
      if(obj(x,y)&&k!==k0){const cami=[];let c=k;while(c!==k0){cami.unshift(prev[c].mv);c=prev[c].de}return cami}
      for(const mv of moves(x,y)){const kk=mv.x+','+mv.y,nd=d+mv.cost;
        if(dist[kk]===undefined||nd<dist[kk]){dist[kk]=nd;prev[kk]={de:k,mv};cua.push([nd,mv.x,mv.y])}}}
    return null;
  };
  const serpPropera=()=>[...serps,...ratpenats,...esquelets].find(s=>s.viu&&s.y===J.y&&Math.abs(s.x-J.x)<3.2&&Math.floor(s.x/RC)===Math.floor(J.x/RC)&&Math.floor(s.y/RF)===Math.floor(J.y/RF));
  const segurPunxes=(x,y,dur)=>{if(cel(x,y)!=='^')return true;for(let t=0;t<=dur;t+=.05)if(punxes(x,rellotge+t)>0)return false;return true};
  const fes=(mv)=>{
    // abans de posar els peus a terra que cau, que no hi hagi cap bestiola a prop
    // (a sobre no s'hi pot esperar: cau)
    if(cel(mv.x,mv.y)==='~'||cel(J.x+mv.dir,J.y)==='~')
      for(let k=0;k<600;k++){const b=[...serps,...ratpenats,...esquelets].find(b=>b.viu&&b.y===J.y&&Math.abs(b.x-J.x)<6&&salaDe(Math.round(b.x),b.y)===salaDe(J.x,J.y));
        if(!b)break;if(Math.abs(b.x-J.x)<2.3){accio('fuet',b.x>J.x?1:-1);espera();pas(22)}else pas(3)}
    // serps: fora
    for(let k=0;k<400&&cel(J.x,J.y)!=='~';k++){const s=serpPropera();if(!s)break;
      const dir=s.x>J.x?1:-1;
      if(Math.abs(s.x-J.x)<2.3){accio('fuet',dir);espera();pas(22);if(!s.viu)break;continue}
      pas(3);}
    // fletxes: si en ve una i no hi ha cap vora al costat, s'ajup
    const fletxaVe=()=>fletxes.find(d=>d.y===J.y&&(J.x-d.x)*d.dir>-.3&&(J.x-d.x)*d.dir<3.5);
    for(let k=0;k<300&&fletxaVe();k++){if(!mouBaixa(J.x,J.y,J.dir)&&J.ajup<.15)accio('baixa');pas()}
    // i abans de ficar-se a una filera amb fletxes, que no n'hi hagi cap de camí
    for(let k=0;k<300;k++){const ve=fletxes.find(d=>d.y===mv.y&&Math.abs(d.x-mv.x)<4.5);if(!ve)break;
      if(!mouBaixa(J.x,J.y,J.dir)&&J.ajup<.15&&fletxaVe())accio('baixa');pas()}
    // abans de canviar de filera (enfilar-se, saltar a una altra), que a la de
    // destinació no hi hagi cap ratpenat a prop ni cap fletxa a punt de sortir
    if(mv.y!==J.y||mv.a==='enfila')for(let k=0;k<900;k++){
      const sala=salaDe(mv.x,mv.y),fila=mv.y;
      const rat=ratpenats.some(r=>r.viu&&r.y===fila&&Math.abs(r.x-mv.x)<1.6&&salaDe(Math.round(r.x),r.y)===sala);
      const tir=TIRADORS.some(f=>f.y===fila&&salaDe(f.x,f.y)===sala&&PERIODE_FLETXA-((rellotge+f.fase)%PERIODE_FLETXA)<1)||fletxes.some(d=>d.y===fila&&(mv.x-d.x)*d.dir>-.5);
      if(!rat&&!tir)break;pas();
    }
    // aranyes: no passar per la seva casella mentre baixen
    const xs=[];for(let x=Math.min(J.x,mv.x);x<=Math.max(J.x,mv.x);x++)xs.push(x);
    const aranyaLliure=()=>aranyes.every(a=>!a.viu||!(a.y===J.y||a.y===mv.y)||!xs.includes(a.x)||(a.x===J.x&&a.y===J.y)||[0,.15,.3,.45,.6,.75].every(t=>baixada(a,rellotge+t)<.5));
    for(let k=0;k<600&&!aranyaLliure();k++)pas();
    // punxes: on aniras i on ets
    const cells=[[mv.x,mv.y]];if(mv.a==='camina')cells.push([J.x+mv.dir,J.y]);
    for(let k=0;k<600;k++){if(cells.every(([x,y])=>segurPunxes(x,y,.75))&&segurPunxes(J.x,J.y,.3))break;pas()}
    if(mv.a==='trenca'){accio('fuet',mv.dir);espera();return}
    if(mv.a==='espera'){let k=0;while(!J.mov&&!J.mort&&k<200){pas();k++}espera();return}
    if(mv.a==='camina'&&cel(J.x+mv.dir,J.y)==='D'){accio('camina',mv.dir);pas()}
    if(J.dir!==mv.dir&&mv.a==='camina')J.dir=mv.dir;
    const ok=accio(mv.a,mv.dir);
    if(!ok)pas(5);
    espera();
  };
  let iter=0,morts=0;
  // una placa de reixa amb temps, com a molt tres vegades: si no, s'hi
  // queda donant voltes (l'obre, es torna a tancar, hi torna...)
  const trepitjades={};
  const habilita=(x,y)=>cel(x,y)==='k'||(cel(x,y)==='o'&&hiHaReixa(x,y))||(cel(x,y)==='q'&&hiHaReixa(x,y)&&(trepitjades[x+','+y]||0)<3)||(cel(x,y)==='R'&&hiHaRoca(x,y));
  while(estat==='joc'&&iter<3000){iter++;
    if(J.mort){espera();morts++;continue}
    if(cel(J.x,J.y)==='q'){const k=J.x+','+J.y;if(trepitjades.ara!==k){trepitjades[k]=(trepitjades[k]||0)+1;trepitjades.ara=k}}else trepitjades.ara='';
    // si hi ha una roca rodolant, s'aparta del seu camí i s'espera que passi
    if(roques.length){
      const perill=new Set();for(const r of roques)for(let i=Math.max(0,r.i-1);i<r.p.length;i++)perill.add(r.p[i].join(','));
      if(!perill.has(J.x+','+J.y)){pas(5);continue}
      const c=planeja((x,y)=>!perill.has(x+','+y));
      if(c){fes(c[0]);continue}
      pas(5);continue;
    }
    let c=null;
    if(!idol){
      if(opts.tot)c=planeja((x,y)=>'$*+Hk'.includes(cel(x,y))||(cel(x,y)==='o'&&hiHaReixa(x,y)));
      if(!c)c=planeja((x,y)=>cel(x,y)==='I');
    }else{
      if(opts.tot&&ensorra>60)c=planeja((x,y)=>'$*+'.includes(cel(x,y)));
      if(!c)c=planeja((x,y)=>cel(x,y)==='E');
    }
    if(!c)c=planeja(habilita);
    // damunt d'una placa que ja s'ha gastat: en baixa i hi torna
    if(!c&&'oqR'.includes(cel(J.x,J.y))){const m=moves(J.x,J.y).find(m=>m.cost===1&&m.a==='camina');if(m){fes(m);continue}}
    if(!c){log.push('sense cami a '+J.x+','+J.y+(idol?' (amb idol)':''));break}
    fes(c[0]);
  }
  function hiHaRoca(x,y){const sx=Math.floor(x/RC)*RC,sy=Math.floor(y/RF)*RF;for(let yy=sy;yy<sy+RF;yy++)for(let xx=sx;xx<sx+RC;xx++)if(cel(xx,yy)==='O')return true;return false}
  function hiHaReixa(x,y){const sx=Math.floor(x/RC)*RC,sy=Math.floor(y/RF)*RF;for(let yy=sy;yy<sy+RF;yy++)for(let xx=sx;xx<sx+RC;xx++)if(cel(xx,yy)==='|')return true;return false}
  return{estat,punts,vides,cors,tresors,temps:Math.round(temps),ensorra:Math.round(ensorra),morts,iter,log,passos};
};
});

// ---------- 1. el mapa de cada nivell ----------
for (let nv = 0; ; nv++) {
const mapa = await p.evaluate(nv => {
  if (nv >= NIVELLS.length) return null;
  carregaNivell(nv);
  // Fa tot el que es pot fer sense temps: agafar claus, obrir portes,
  // trepitjar plaques, trencar parets esquerdades i fer rodar les roques
  // (que on s'encallen fan de paret).
  const abast = (x0, y0) => {
    const vist = new Set([x0 + ',' + y0]), cua = [[x0, y0]];
    while (cua.length) {
      const [x, y] = cua.shift(), ms = [];
      for (const d of [-1, 1]) ms.push(mouCamina(x, y, d), mouEnfila(x, y, d), mouBaixa(x, y, d), mouSalta(x, y, d), mouPenja(x, y, d));
      if (cel(x, y) === '~') { const t = cel(x, y); posa(x, y, ' '); ms.push(caiguda(x, y)); posa(x, y, t); }
      for (const m of ms) {
        if (!m || (m.cau ?? m.d) >= 3) continue;
        const k = m.x + ',' + m.y;
        if (!vist.has(k)) { vist.add(k); cua.push([m.x, m.y]); }
      }
    }
    return vist;
  };
  const resol = (x0, y0, claus) => {
    let canvis = true;
    while (canvis) {
      canvis = false;
      for (const k of abast(x0, y0)) {
        const [x, y] = k.split(',').map(Number), t = cel(x, y);
        const sx = Math.floor(x / RC) * RC, sy = Math.floor(y / RF) * RF;
        if (t === 'k') { claus++; posa(x, y, '_'); canvis = true; }
        if (t === 'o' || t === 'q') {
          for (let yy = sy; yy < sy + RF; yy++) for (let xx = sx; xx < sx + RC; xx++)
            if (cel(xx, yy) === '|') { posa(xx, yy, '/'); canvis = true; } }
        if (t === 'R') {
          for (let yy = sy; yy < sy + RF; yy++) for (let xx = sx; xx < sx + RC; xx++)
            if (cel(xx, yy) === 'O') { posa(xx, yy, '_'); const c = camiRoca(xx, yy, Math.sign(x - xx) || 1); if (c.fi) posa(c.fi[0], c.fi[1], '#'); canvis = true; } }
        for (const d of [-1, 1]) {
          if (cel(x + d, y) === '%') { posa(x + d, y, '_'); canvis = true; }
          if (cel(x + d, y) === 'D' && claus > 0) { claus--; posa(x + d, y, 'd'); canvis = true; }
        }
      }
    }
    return { A: abast(x0, y0), claus };
  };
  MON = INICI.slice();
  const r1 = resol(COMENCA.x, COMENCA.y, 0);
  const idolOk = r1.A.has(IDOL.x + ',' + IDOL.y);
  const r2 = resol(IDOL.x, IDOL.y, r1.claus);
  const sortidaOk = r2.A.has(SORTIDA.x + ',' + SORTIDA.y);
  const tots = new Set([...r1.A, ...r2.A]);
  let objectes = 0, perduts = [];
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) if ('$*+Hk'.includes(INICI[y * MW + x])) {
    objectes++; if (!tots.has(x + ',' + y)) perduts.push(x + ',' + y);
  }
  // Des de qualsevol lloc on hagis pogut arribar, i amb el terra que cau ja
  // caigut, s'ha de poder tornar a la sortida: tant si les roques ja han
  // rodolat com si no.
  const encallats = [];
  for (const mon of [MON.map(t => t === '~' ? ' ' : t), INICI.map(t => t === '~' ? ' ' : t)])
    for (const k of tots) {
      const [x, y] = k.split(',').map(Number);
      MON = mon.slice();
      if (!resol(x, y, 2).A.has(SORTIDA.x + ',' + SORTIDA.y)) encallats.push(k);
    }
  MON = INICI.slice();
  return { nom: NV.nom, idolOk, sortidaOk, objectes, perduts, encallats, sales: SALES_N, tresors: TOTAL_TRESORS, rats: RATS0.length };
}, nv);
if (!mapa) break;
console.log('— ' + mapa.nom);
diu(mapa.idolOk, "des de l'entrada s'arriba al tresor del fons");
diu(mapa.sortidaOk, "des del tresor es torna a la sortida");
diu(!mapa.perduts.length, `tots els objectes (${mapa.objectes}) es poden agafar` + (mapa.perduts.length ? ': ' + mapa.perduts : ''));
diu(!mapa.encallats.length, 'cap racó on quedar-se tancat per sempre' + (mapa.encallats.length ? ': ' + [...new Set(mapa.encallats)].join(' ') : ''));
console.log(`  ${mapa.sales} sales, ${mapa.tresors} tresors, ${mapa.rats} ratpenats`);
}
await p.evaluate(() => carregaNivell(0));

// ---------- 2. el pilot ----------
// Primer cada nivell per separat, i després la partida sencera de cap a cap.
for (const [nv, tot] of [[0, false], [0, true], [1, false], [1, true], [2, false], [2, true], [3, false], [3, true]]) {
  const r = await p.evaluate(([nv, tot]) => { manual = true; novaPartida(nv); return Object.assign(pilot({ tot }), { nom: NV.nom, ens: ENSORRA }); }, [nv, tot]);
  const fi = nv < 3 ? 'entre' : 'fi';
  diu(r.estat === fi && r.morts === 0 && !r.log.length,
    `${r.nom}: el pilot ${tot ? 'que ho agafa tot' : 'que va de dret'} surt amb el tresor: ${r.punts} punts, ${r.temps} s de joc, ` +
    `${r.tresors} tresors, li sobren ${r.ensorra} s de ${r.ens}` + (r.log.length ? ' — ' + r.log : '') + (r.morts ? ` (${r.morts} morts)` : ''));
  if (fi === 'fi') await confirma();
  diu(r.ens - r.ensorra < r.ens / 2.5, `  per sortir amb el tresor li calen ${r.ens - r.ensorra} s: n'hi ha de sobres per a una persona`);
}
// la partida sencera: del primer nivell es passa al segon amb els punts i les vides
const sencera = await p.evaluate(() => {
  manual = true; novaPartida(0);
  const r1 = pilot({ tot: true });
  const abans = { punts, vides, msg: document.getElementById('msg').textContent };
  document.getElementById('m-seg').click();
  const enNivell2 = { nivell, punts, vides, estat };
  const r2 = pilot({ tot: true });
  document.getElementById('m-seg').click();
  const r3 = pilot({ tot: true });
  document.getElementById('m-seg').click();
  const r4 = pilot({ tot: true });
  return { r1, abans, enNivell2, r2, r3, r4 };
});
diu(sencera.r1.estat === 'entre' && /BAIXA-HI/.test(sencera.abans.msg) && /LES CATACUMBES/.test(sencera.abans.msg),
  'en sortir del primer temple, et convida a baixar a les catacumbes');
diu(sencera.enNivell2.nivell === 1 && sencera.enNivell2.punts === sencera.abans.punts && sencera.enNivell2.vides === sencera.abans.vides && sencera.enNivell2.estat === 'joc',
  `i hi baixes amb els punts (${sencera.abans.punts}) i les vides que portaves`);
diu(sencera.r2.estat === 'entre' && sencera.r3.estat === 'entre' && sencera.r4.estat === 'fi' && sencera.r4.punts > 35000, `la partida sencera, els quatre nivells agafant-ho tot: ${sencera.r4.punts} punts ` + JSON.stringify([sencera.r2, sencera.r3, sencera.r4].map(r => [r.estat, r.punts, r.vides, r.morts, r.log])));
await confirma();
diu(enviats.length >= 1 && enviats.at(-1).punts > 0, `en sortir, els punts van a la taula (${enviats.map(e => e.punts).join(', ')})`);
diu(await p.evaluate(() => !localStorage.getItem('temple-partida')), 'en acabar, la partida desada s\'esborra');

// el repte, com a La Impremta
const repte = await p.evaluate(() => {
  const as = [...document.querySelectorAll('#msg .reptes a')];
  const tg = as.find(a => /t\.me/.test(a.href)), wa = as.find(a => /wa\.me/.test(a.href));
  return { n: as.length, tg: tg && decodeURIComponent(tg.href), wa: !!wa, copia: !!document.getElementById('copia'), punts };
});
diu(repte.n === 3 && repte.wa && repte.copia && repte.tg.includes('#repte=1&n=TST&p=' + repte.punts + '&s=1') && repte.tg.includes("he sortit amb l'ídol"),
  'al final hi ha REPTA PER TELEGRAM, PER WHATSAPP i COPIA L\'ENLLAÇ, amb els teus punts a l\'enllaç');
const p2 = await ctx.newPage();
p2.on('pageerror', e => errors.push(String(e)));
await p2.goto(URL_JOC + '#repte=1&n=MAR&p=5000&s=1');
await p2.waitForTimeout(500);
diu(await p2.evaluate(() => /REPTE DE MAR: 5\.000 punts/.test(document.getElementById('msg').textContent)), 'qui obre l\'enllaç veu a qui ha de superar');
await p2.evaluate(() => localStorage.setItem('jugador', 'TST'));
await p2.evaluate(() => { manual = true; novaPartida(NIVELLS.length - 1); punts = 4000; guanya(); });
for (let i = 0; i < 30 && !await p2.$('#rec-ok'); i++) await p2.waitForTimeout(100);
if (await p2.$('#rec-ok')) await p2.click('#rec-ok');
await p2.waitForTimeout(500);
diu(await p2.evaluate(() => /REPTE DE MAR: 5\.000 punts\s*L'HAS GUANYAT!/.test(document.getElementById('msg').textContent)), 'i en acabar, qui ha guanyat');
await p2.close();

// ---------- 3. les trampes ----------
// prepara una partida amb tu en una casella concreta
const posa = (x, y, dir = 1, nv = 0) => p.evaluate(([x, y, dir, nv]) => {
  manual = true; novaPartida(nv); J = nouJugador(x, y, dir); cp = { x, y, dir }; cors = maxCors; actualitza(1 / 60);
}, [x, y, dir, nv]);
const corre = s => p.evaluate(s => { for (let i = 0; i < s * 60; i++) actualitza(1 / 60); }, s);
const estat = () => p.evaluate(() => ({ x: J.x, y: J.y, cors, vides, mort: J.mort, punts, claus, mov: !!J.mov }));

// caure dos pisos fa mal; baixant penjat (▼), no
await posa(34, 7);                                  // N, a la vora del forat que baixa a l'avantsala
await p.evaluate(() => { posa(37, 7, '/'); });       // la reixa, oberta
await p.evaluate(() => { J.x = 38; J.fx = 38; claus = 1; posa(38, 7, 'd'); });
await p.evaluate(() => accio('camina', 1)); await corre(1.2);
let e = await estat();
diu(e.y === 9 && e.cors === 2, `caure dos pisos treu un cor (${e.cors} de 3)`);
await posa(38, 7); await p.evaluate(() => { posa(37, 7, '/'); posa(38, 7, 'd'); });
await p.evaluate(() => accio('baixa', 1)); await corre(1.2);
e = await estat();
diu(e.y === 9 && e.cors === 3, `baixant penjat amb ▼, cap cor (${e.cors} de 3)`);

// tres pisos o mes: mort
await posa(14, 6, 1);                                // L, al replà de dalt
await p.evaluate(() => { for (let y = 7; y <= 10; y++) posa(15, y, ' '); posa(15, 11, '_'); });
await p.evaluate(() => accio('camina', 1)); await corre(1);
e = await estat();
diu(e.mort, 'caure cinc pisos et mata');
await corre(2.5);
e = await estat();
diu(!e.mort && e.vides === 2 && e.cors === 3 && e.x === 14 && e.y === 6, `perds una vida i tornes on eres, amb els cors plens (vides ${e.vides}, a ${e.x},${e.y})`);
diu(await p.evaluate(() => J.imune > 0), 'i uns segons sense que et puguin fer res');

// punxes
await posa(14, 2);                                   // B, el clot de les punxes
await corre(2.4);
e = await estat();
diu(e.cors < 3, `a sobre de les punxes quan surten, perds cors (${e.cors} de 3)`);
await posa(15, 1, -1);                               // B, salta per sobre de les punxes
let s = await p.evaluate(() => { const m = mouSalta(J.x, J.y, -1); return m && [m.x, m.y]; });
diu(s && s[0] === 13 && s[1] === 1, 'el salt passa per sobre del clot de punxes i aterra a la rajola bona');

// serps
await posa(23, 1, 1);                                // C, la serp hi es a 23,1
await p.evaluate(() => { const s = serps.find(s => s.x === 23 && s.y === 1); s.x = 23.3; s.dir = -1; J.x = 22; J.fx = 22; });
await corre(.3);
e = await estat();
diu(e.cors === 2, `la serp mossega i treu un cor (${e.cors} de 3)`);
await corre(1);
e = await estat();
diu(e.cors >= 1 && !e.mort, 'i no et treu tots els cors de cop: et fa enrere i parpelleges');
await posa(21, 1, 1);
await p.evaluate(() => { const s = serps.find(s => s.y === 1 && s.x > 20 && s.x < 30); s.x = 22.5; });
const abans = (await estat()).punts;
await p.evaluate(() => accio('fuet', 1)); await corre(.4);
diu(await p.evaluate(() => !serps.find(s => s.y === 1 && s.x > 20 && s.x < 30).viu) && (await estat()).punts === abans + 50,
  'el FUET fa fora la serp que tens davant (+50)');

// terra que cau
await posa(13, 4, 1);                                // G, a sobre d'una rajola que cau
await p.evaluate(() => arriba());
await corre(.4);
diu(await p.evaluate(() => cel(13, 4) === '~' && J.y === 4), 'la rajola tremola però encara aguanta');
await corre(1.2);
e = await estat();
diu(await p.evaluate(() => cel(13, 4) === ' ') && e.y === 6, `al cap de mig segon cau, i tu amb ella (a ${e.x},${e.y})`);

// paret esquerdada i passadis amagat
await posa(11, 4, -1);
await p.evaluate(() => accio('fuet', -1)); await corre(.4);
diu(await p.evaluate(() => cel(10, 4) === '_'), 'el FUET trenca la paret esquerdada i obre el passadís');

// anella
await posa(22, 7, 1);                                // M, davant del forat de tres
diu(await p.evaluate(() => !mouSalta(22, 7, 1) || mouSalta(22, 7, 1).y !== 7 || mouSalta(22, 7, 1).x < 26), 'el forat de tres caselles no es pot saltar');
await p.evaluate(() => accio('fuet', 1)); await corre(1.2);
e = await estat();
diu(e.x === 26 && e.y === 7 && e.cors === 3, `amb el FUET a l'anella passes penjat a l'altra banda (a ${e.x},${e.y})`);

// porta i clau
await posa(37, 7, 1);
await p.evaluate(() => { posa(37, 7, '/'); });
await p.evaluate(() => accio('camina', 1)); await corre(.4);
e = await estat();
diu(e.x === 37, 'sense clau, la porta no es passa');
await p.evaluate(() => { claus = 1; teclaFresca.dre = true; tecles.dre = true; });
await corre(.5); await p.evaluate(() => { tecles.dre = false; });
e = await estat();
diu(e.claus === 0 && await p.evaluate(() => cel(38, 7) === 'd'), 'amb clau, la porta s\'obre i la clau es gasta');

// placa i reixa
await posa(36, 7, -1);
await p.evaluate(() => accio('camina', -1)); await corre(.8);
diu(await p.evaluate(() => cel(37, 7) === '/'), 'trepitjant la placa del clot, la reixa s\'obre');

// caminant seguit, et pares a la vora; tornant a premer, hi baixes
await posa(32, 1, 1);                                // D, a dalt
await p.evaluate(() => { tecles.dre = true; teclaFresca.dre = true; });
await corre(1.5);
e = await estat();
diu(e.x === 34 && e.y === 1, `caminant seguit, et pares a la vora del forat (a ${e.x},${e.y})`);
await p.evaluate(() => { teclaFresca.dre = true; }); await corre(1);
await p.evaluate(() => { tecles.dre = false; });
e = await estat();
diu(e.y > 1, 'tornant a prémer, hi baixes');

// el temple s'ensorra
await posa(IDOL_X(), 10);
function IDOL_X() { return 45; }
await p.evaluate(() => arriba());
diu(await p.evaluate(() => idol && ensorra === 150), "en agafar l'ídol comença el compte enrere");
await p.evaluate(() => { J.x = 40; J.fx = 40; ensorra = .05; });
await corre(3);
e = await estat();
diu(e.vides === 2 && e.x === 45 && e.y === 10 && await p.evaluate(() => ensorra > 140),
  `si se t'acaba el temps perds una vida i tornes on era l'ídol amb el temps sencer`);
diu(await p.evaluate(() => { const t = SORTIDA; J.x = t.x + 1; J.fx = J.x; J.y = t.y; J.fy = t.y; accio('camina', -1); for (let i = 0; i < 30; i++) actualitza(1 / 60); return estat; }) === 'entre',
  "arribant a la porta amb l'ídol, has sortit del primer temple");

// ---------- les coses noves de les catacumbes ----------
// el ratpenat
await posa(12, 2, 1, 1);
await p.evaluate(() => { const r = ratpenats.find(r => r.y === 2 && r.x < 20); r.x = 12.8; r.dir = -1; });
await corre(.4);
e = await estat();
diu(e.cors === 2, `el ratpenat que et toca treu un cor (${e.cors} de 3)`);
await posa(12, 2, 1, 1);
await p.evaluate(() => { const r = ratpenats.find(r => r.y === 2 && r.x < 20); r.x = 13.6; r.dir = 1; });
let ab = (await estat()).punts;
await p.evaluate(() => accio('fuet', 1)); await corre(.3);
diu(await p.evaluate(() => !ratpenats.find(r => r.y === 2 && r.x < 20).viu) && (await estat()).punts === ab + 75, 'el FUET fa fora el ratpenat (+75)');
// la reixa que s'obre una estona
await posa(33, 2, 1, 1);                             // el clot amb la placa de la reixa
await p.evaluate(() => arriba());
diu(await p.evaluate(() => cel(38, 1) === '/'), 'la placa del rellotge de sorra obre la reixa');
await corre(2);
diu(await p.evaluate(() => cel(38, 1) === '/'), 'al cap de dos segons encara és oberta');
await corre(2.5);
diu(await p.evaluate(() => cel(38, 1) === '|'), 'i al cap de quatre es torna a tancar');
// la roca
await posa(23, 1, 1, 1);                             // a sobre de la placa, quiet
await p.evaluate(() => arriba());
diu(await p.evaluate(() => roques.length === 1 && cel(21, 0) === '_'), 'trepitjant la placa, la roca de dalt comença a rodolar');
await corre(2);
e = await estat();
diu(e.mort, 'si et quedes quiet, la roca t\'aixafa');
await corre(3);
diu(await p.evaluate(() => cel(28, 2) === '#' && !roques.length), 'i on s\'encalla, al clot, s\'hi queda i fa de pont');
await posa(23, 1, 1, 1);
await p.evaluate(() => { arriba(); tecles.dre = true; teclaFresca.dre = true; });
await corre(.75);
await p.evaluate(() => { tecles.dre = false; accio('salta', 1); });
await corre(3);
e = await estat();
diu(!e.mort && e.x === 29, `corrent i saltant el clot, te n'escapes (a ${e.x},${e.y})`);

// ---------- les coses noves del santuari ----------
// fletxes: dempeus et fan mal; ajupit, et passen per sobre
await posa(35, 2, -1, 2);
await p.evaluate(() => { for (let i = 0; i < 60 * 6 && cors === maxCors; i++) actualitza(1 / 60); });
e = await estat();
diu(e.cors === 2, `una fletxa de la paret et treu un cor si et quedes dret (${e.cors} de 3)`);
await posa(35, 2, -1, 2);
const ajupit = await p.evaluate(() => {
  let fletxesVistes = 0, ajupides = 0;
  for (let i = 0; i < 60 * 6; i++) {
    const d = fletxes.find(d => d.y === J.y && (J.x - d.x) * d.dir > 0 && (J.x - d.x) * d.dir < 1.5);
    if (d && J.ajup < .2) { accio('baixa'); ajupides++; }
    const n = fletxes.length; actualitza(1 / 60); if (fletxes.length < n) fletxesVistes++;
  }
  return { cors, fletxesVistes, ajupides };
});
diu(ajupit.cors === 3 && ajupit.ajupides >= 2, `ajupint-te (▼) quan en ve una, et passen per sobre: ${ajupit.ajupides} fletxes, cap cor perdut`);
// l'esquelet: dos cops de fuet
await posa(21, 1, 1, 2);
await p.evaluate(() => { const k = esquelets.find(k => k.y === 1 && k.x > 20 && k.x < 30); k.x = 22.6; k.atordit = 0; });
ab = (await estat()).punts;
await p.evaluate(() => accio('fuet', 1)); await corre(.4);
let ek = await p.evaluate(() => { const k = esquelets.find(k => k.y === 1 && k.x > 20 && k.x < 30); return { viu: k.viu, vida: k.vida, x: k.x }; });
diu(ek.viu && ek.vida === 1 && ek.x > 22.9, "el primer cop de FUET fa trontollar l'esquelet i l'empeny enrere");
await p.evaluate(() => accio('fuet', 1)); await corre(.4);
ek = await p.evaluate(() => esquelets.find(k => k.y === 1 && k.x > 20 && k.x < 30).viu);
diu(!ek && (await estat()).punts === ab + 100, "el segon el desfà (+100)");
// l'esquelet et busca
await posa(21, 1, 1, 2);
await p.evaluate(() => { const k = esquelets.find(k => k.y === 1 && k.x > 20 && k.x < 30); k.x = 25; k.dir = 1; });
await corre(1);
diu(await p.evaluate(() => esquelets.find(k => k.y === 1 && k.x > 20 && k.x < 30).x < 25), "si et veu a la seva filera, ve cap a tu");

// ---------- les coses noves de les profunditats ----------
// l'aranya: a dalt no fa res; quan baixa, et pica; i quan baixa, el FUET la fa fora
await posa(13, 2, 1, 3);
const ar = await p.evaluate(() => {
  const a = aranyes.find(a => a.x === 13 && a.y === 2);
  rellotge = (CICLE_ARANYA - a.fase + .3) % CICLE_ARANYA; J.imune = 0; cors = maxCors;   // a dalt de tot
  actualitza(1 / 60); const dalt = cors;
  rellotge = (CICLE_ARANYA - a.fase + 2.0) % CICLE_ARANYA;               // a baix
  actualitza(1 / 60); const baix = cors;
  return { dalt, baix };
});
diu(ar.dalt === 3 && ar.baix === 2, `l'aranya, a dalt no et toca i quan baixa et pica (${ar.dalt} → ${ar.baix} cors)`);
await posa(11, 2, 1, 3);
const ar2 = await p.evaluate(() => {
  const a = aranyes.find(a => a.x === 13 && a.y === 2);
  rellotge = (CICLE_ARANYA - a.fase + .3) % CICLE_ARANYA; accio('fuet', 1); for (let i = 0; i < 25; i++) actualitza(1 / 60);
  const viuDalt = a.viu;
  rellotge = (CICLE_ARANYA - a.fase + 2.0) % CICLE_ARANYA; const p0 = punts; accio('fuet', 1); for (let i = 0; i < 25; i++) actualitza(1 / 60);
  return { viuDalt, viu: a.viu, guany: punts - p0 };
});
diu(ar2.viuDalt && !ar2.viu && ar2.guany === 75, "a dalt el FUET no hi arriba; quan baixa, la fa fora (+75)");
// a les fosques: lluny teu no es veu res, i al teu voltant sí
const llum = await p.evaluate(() => {
  manual = true; novaPartida(3); J = nouJugador(11, 2, 1); salaAra = '1,0'; presentaT = 0; avisT = 0; dibuixa();
  const px = (x, y) => { const d = g.getImageData(x, y, 1, 1).data; return d[0] + d[1] + d[2]; };
  const lluny = px(380, 40), aprop = px(Math.round((J.fx - 10 + .5) * CW + 40), Math.round(J.fy % 3 * CH + CH - LLOSA + 2));   // el terra del costat
  novaPartida(0); J = nouJugador(14, 2, 1); salaAra = '1,0'; presentaT = 0; dibuixa();
  const llumPrimer = px(380, 40);
  return { lluny, aprop, llumPrimer };
});
diu(llum.lluny < 30 && llum.aprop > 60 && llum.llumPrimer > llum.lluny, `a les profunditats, lluny teu tot és fosc i al teu voltant s'hi veu (${llum.lluny} / ${llum.aprop})`);

// el pont sobre la fossa: si cau, no hi ha fons
await posa(24, 10, 1, 1);                            // a sobre del pont que cau
await p.evaluate(() => arriba());
await corre(1.5);
e = await estat();
diu(e.mort, 'si et quedes quiet al pont de les catacumbes, caus a la fossa i no hi ha fons');
// desar a les catacumbes i continuar-hi
await p.evaluate(() => { cp = { x: 31, y: 4, dir: -1 }; punts = 9000; estat = 'joc'; J.mort = false; desaPartida(); });
diu(await p.evaluate(() => { const q = partidaDesada(); return q && q.nivell === 1; }), 'la partida es desa amb el nivell on ets');
await p.evaluate(() => { carregaNivell(0); continuaPartida(); });
const cont = await p.evaluate(() => ({ nivell, x: J.x, punts, nom: NV.nom }));
diu(cont.nivell === 1 && cont.x === 31 && cont.punts >= 9000, 'i en continuar, tornes a les catacumbes ' + JSON.stringify(cont));
// el punt de control: si caus a les catacumbes, hi tornes sense refer el primer
await p.evaluate(() => { localStorage.removeItem('temple-control'); manual = true; novaPartida(0); punts = 8290; maxCors = 4;
  guanya(); document.getElementById('m-seg').click(); });
diu(await p.evaluate(() => { const q = JSON.parse(localStorage.getItem('temple-control')); return q.nivell === 1 && q.punts === 8290 + 1000 + 1500 && q.maxCors === 4; }),
  'en baixar a les catacumbes, es guarda el punt de control amb els punts que hi portes');
await p.evaluate(() => { punts += 1234; vides = 1; mor(); for (let i = 0; i < 150; i++) actualitza(1 / 60); });
await confirma();
await p.waitForTimeout(300);
diu(!!await p.$('#m-torna') && await p.evaluate(() => /TORNA A LES CATACUMBES/.test(document.getElementById('msg').textContent)),
  'perdent l\'última vida a les catacumbes, el quadre del final ofereix tornar-hi');
await p.click('#m-torna');
let tc = await p.evaluate(() => ({ nivell, punts, vides, maxCors, estat }));
diu(tc.nivell === 1 && tc.punts === 10790 && tc.vides === 3 && tc.maxCors === 4 && tc.estat === 'joc',
  `i hi tornes amb els punts d'entrar-hi (no els d'abans de caure), tres vides i els cors que tenies: ${JSON.stringify(tc)}`);
await p.evaluate(() => { esborraPartida(); menu(); });
diu(!!await p.$('#m-ctl'), 'i també des del menú, si tornes al joc un altre dia');
await p.click('#m-ctl');
tc = await p.evaluate(() => ({ nivell, punts }));
diu(tc.nivell === 1 && tc.punts === 10790, 'des del menú també tornes a les catacumbes');
await p.evaluate(() => { manual = true; comencaNivell(NIVELLS.length - 1); idol = true; ensorra = 50; const d = tancat(SORTIDA.x - 1, SORTIDA.y) ? 1 : -1; J.x = SORTIDA.x + d; J.fx = J.x; J.y = SORTIDA.y; J.fy = J.y; accio('camina', -d); for (let i = 0; i < 30; i++) actualitza(1 / 60); });
await confirma();
diu(await p.evaluate(() => estat === 'fi' && !localStorage.getItem('temple-control')), 'acabant-ho tot, el punt de control s\'esborra');
await p.evaluate(() => { manual = false; });

// ---------- 4. desar i continuar ----------
await confirma();
await p.evaluate(() => { manual = false; localStorage.removeItem('temple-partida'); menu(); });
await p.click('#m-nova');
await p.evaluate(() => { J.x = 23; J.fx = 23; J.y = 1; J.fy = 1; punts = 1234; claus = 1; posa(26, 2, '_'); visitades.add('2,0'); cp = { x: 23, y: 1, dir: 1 }; desaPartida(); });
await p.reload();
await p.waitForTimeout(600);
const hiHa = await p.$('#m-cont');
diu(!!hiHa, 'en tornar-hi, surt CONTINUA LA PARTIDA');
if (hiHa) {
  await p.click('#m-cont');
  e = await estat();
  diu(e.x === 23 && e.y === 1 && e.punts === 1234 && e.claus === 1 && await p.evaluate(() => cel(26, 2) === '_' && visitades.has('2,0')),
    'i continues on eres, amb els punts, la clau i el que ja havies agafat');
}

// ---------- 5. perdre totes les vides ----------
enviats.length = 0;
await p.evaluate(() => { punts = 777; vides = 1; mor(); });
await p.waitForTimeout(2000);
await confirma();
diu(await p.evaluate(() => estat === 'fi') && enviats.some(e => e.punts === 777), 'sense vides s\'acaba la partida i els punts van a la taula');
diu(!!await p.$('a[data-menu-jocs]'), 'i surt el botó de tornar al menú');

// ---------- 6. els botons, tocant ----------
await p.evaluate(() => { menu(); }); await p.click('#m-nova');
await p.tap('#salta'); await p.waitForTimeout(700);
e = await estat();
diu(e.x === 4, `tocant SALTA, salta (de 2 a ${e.x})`);
await p.tap('#fuet'); await p.waitForTimeout(100);
diu(await p.evaluate(() => J.fuet > 0), 'tocant FUET, fueteja');

for (const w of [320, 360, 390]) {
  await p.setViewportSize({ width: w, height: 640 });
  await p.waitForTimeout(150);
  const r = await p.evaluate(() => {
    const bs = [...document.querySelectorAll('#controls button')].map(b => b.getBoundingClientRect());
    const c = document.querySelector('canvas').getBoundingClientRect();
    return { dins: bs.every(r => r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight), petit: Math.min(...bs.map(r => r.width)),
      canvas: c.top >= 0 && c.bottom <= innerHeight && c.width > 250 };
  });
  diu(r.dins && r.petit >= 40 && r.canvas, `a ${w} px hi caben els sis botons (el més estret, ${Math.round(r.petit)} px) i el joc es veu sencer`);
}

diu(!errors.length, 'cap error de JavaScript' + (errors.length ? ': ' + errors.join(' | ') : ''));
await b.close();
console.log(malament ? `\n${malament} coses malament` : '\nTot bé');
process.exit(malament ? 1 : 0);
