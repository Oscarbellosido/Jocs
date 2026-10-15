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
  const serpPropera=()=>serps.find(s=>s.viu&&s.y===J.y&&Math.abs(s.x-J.x)<3.2&&Math.floor(s.x/RC)===Math.floor(J.x/RC));
  const segurPunxes=(x,y,dur)=>{if(cel(x,y)!=='^')return true;for(let t=0;t<=dur;t+=.05)if(punxes(x,rellotge+t)>0)return false;return true};
  const fes=(mv)=>{
    // serps: fora
    for(let k=0;k<400;k++){const s=serpPropera();if(!s)break;
      const dir=s.x>J.x?1:-1;
      if(Math.abs(s.x-J.x)<2.3){accio('fuet',dir);espera();pas(20);break}
      pas(3);}
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
  const habilita=(x,y)=>cel(x,y)==='k'||(cel(x,y)==='o'&&hiHaReixa(x,y));
  while(estat==='joc'&&iter<3000){iter++;
    if(J.mort){espera();morts++;continue}
    let c=null;
    if(!idol){
      if(opts.tot)c=planeja((x,y)=>'$*+Hk'.includes(cel(x,y))||(cel(x,y)==='o'&&hiHaReixa(x,y)));
      if(!c)c=planeja((x,y)=>cel(x,y)==='I');
    }else{
      if(opts.tot&&ensorra>60)c=planeja((x,y)=>'$*+'.includes(cel(x,y)));
      if(!c)c=planeja((x,y)=>cel(x,y)==='E');
    }
    if(!c)c=planeja(habilita);
    if(!c){log.push('sense cami a '+J.x+','+J.y+(idol?' (amb idol)':''));break}
    fes(c[0]);
  }
  function hiHaReixa(x,y){const sx=Math.floor(x/RC)*RC,sy=Math.floor(y/RF)*RF;for(let yy=sy;yy<sy+RF;yy++)for(let xx=sx;xx<sx+RC;xx++)if(cel(xx,yy)==='|')return true;return false}
  return{estat,punts,vides,cors,tresors,temps:Math.round(temps),ensorra:Math.round(ensorra),morts,iter,log,passos};
};
});

// ---------- 1. el mapa ----------
const mapa = await p.evaluate(() => {
  // Fa tot el que es pot fer sense temps: agafar claus, obrir portes,
  // trepitjar plaques i trencar parets esquerdades.
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
        if (t === 'k') { claus++; posa(x, y, '_'); canvis = true; }
        if (t === 'o') { const sx = Math.floor(x / RC) * RC, sy = Math.floor(y / RF) * RF;
          for (let yy = sy; yy < sy + RF; yy++) for (let xx = sx; xx < sx + RC; xx++)
            if (cel(xx, yy) === '|') { posa(xx, yy, '/'); canvis = true; } }
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
  // caigut, s'ha de poder tornar a la sortida.
  const obert = MON.map(t => t === '~' ? ' ' : t);
  const encallats = [];
  for (const k of tots) {
    const [x, y] = k.split(',').map(Number);
    MON = obert.slice();
    if (!resol(x, y, 1).A.has(SORTIDA.x + ',' + SORTIDA.y)) encallats.push(k);
  }
  MON = INICI.slice();
  return { idolOk, sortidaOk, objectes, perduts, encallats, sales: SALES_N, tresors: TOTAL_TRESORS };
});
diu(mapa.idolOk, "des de l'entrada s'arriba a l'ídol");
diu(mapa.sortidaOk, "des de l'ídol es torna a la sortida");
diu(!mapa.perduts.length, `tots els objectes (${mapa.objectes}) es poden agafar` + (mapa.perduts.length ? ': ' + mapa.perduts : ''));
diu(!mapa.encallats.length, 'cap racó on quedar-se tancat per sempre' + (mapa.encallats.length ? ': ' + mapa.encallats.join(' ') : ''));
diu(mapa.sales === 17 && mapa.tresors === 12, `${mapa.sales} sales i ${mapa.tresors} tresors`);

// ---------- 2. el pilot ----------
for (const tot of [false, true]) {
  const r = await p.evaluate(tot => { manual = true; novaPartida(); return pilot({ tot }); }, tot);
  diu(r.estat === 'fi' && r.morts === 0 && !r.log.length,
    `el pilot ${tot ? 'que ho agafa tot' : 'que va de dret'} surt amb l'ídol: ${r.punts} punts, ${r.temps} s de joc, ` +
    `${r.tresors} tresors, li sobren ${r.ensorra} s` + (r.log.length ? ' — ' + r.log : ''));
  if (tot) diu(r.tresors === 12 && r.punts > 8000, 'agafant-ho tot, els 12 tresors i més de 8.000 punts');
  await confirma();
  diu(150 - r.ensorra < 60, `per sortir amb l'ídol li calen ${150 - r.ensorra} s de 150: n'hi ha de sobres per a una persona`);
}
diu(enviats.length >= 1 && enviats.at(-1).punts > 0, `en sortir, els punts van a la taula (${enviats.map(e => e.punts).join(', ')})`);
diu(await p.evaluate(() => !localStorage.getItem('temple-partida')), 'en acabar, la partida desada s\'esborra');

// ---------- 3. les trampes ----------
// prepara una partida amb tu en una casella concreta
const posa = (x, y, dir = 1) => p.evaluate(([x, y, dir]) => {
  manual = true; novaPartida(); J = nouJugador(x, y, dir); cp = { x, y, dir }; cors = maxCors; actualitza(1 / 60);
}, [x, y, dir]);
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
diu(await p.evaluate(() => { const t = SORTIDA; J.x = t.x + 1; J.fx = J.x; J.y = t.y; J.fy = t.y; accio('camina', -1); for (let i = 0; i < 30; i++) actualitza(1 / 60); return estat; }) === 'fi',
  "arribant a la porta amb l'ídol, has guanyat");

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
