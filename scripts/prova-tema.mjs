// Comprova el fons fosc o clar dels jocs del dia i de paraules: que hi hagi
// el botó ◐ al marcador, que en tocar-lo el fons es torni clar (i la línia
// d'ajuda es llegeixi), que la tria valgui per a tots els jocs alhora i es
// recordi, i que un altre toc el torni fosc.
//
//   node scripts/prova-tema.mjs

import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const ARREL = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const JOCS = ['gofra', 'impremta', 'abecedari', 'colles', 'poble', 'sopa', 'penjat', 'quadres', 'estel'];

let malament = 0;
function diu(be, text) { if (!be) malament++; console.log(`${be ? '✓' : '✗'} ${text}`); }

// la lluminositat d'un color rgb(...) de 0 a 255
const llum = c => { const m = c.match(/\d+(\.\d+)?/g).map(Number); return (m[0] * 299 + m[1] * 587 + m[2] * 114) / 1000; };

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 320, height: 568 }, hasTouch: true });
await ctx.route('**/jocs-records*/**', r => r.fulfill({ status: 200, contentType: 'application/json',
  headers: { 'access-control-allow-origin': '*' }, body: '[]' }));
const p = await ctx.newPage();
const errors = []; p.on('pageerror', e => errors.push(String(e)));
const obre = async joc => {
  await p.goto('file://' + resolve(ARREL, joc + '.html'));
  await p.waitForTimeout(400);
  return p.evaluate(() => {
    const hud = document.getElementById('hud'), btn = document.getElementById('rec-tema');
    const fons = getComputedStyle(document.body).backgroundColor, ajuda = document.querySelector('#wrap > small');
    return { btn: !!btn && btn.parentNode === hud, text: btn && btn.textContent, clar: document.documentElement.classList.contains('clar'),
      fons, ajuda: ajuda ? getComputedStyle(ajuda).color : '', cap: hud.scrollWidth <= hud.clientWidth + 1 };
  });
};

// comença fosc
await p.goto('file://' + resolve(ARREL, 'sopa.html'));
await p.evaluate(() => { localStorage.clear(); localStorage.setItem('jugador', 'TST'); });

for (const joc of JOCS) {
  const r = await obre(joc);
  diu(r.btn && r.text === '◐' && !r.clar && llum(r.fons) < 80 && r.cap,
    `${joc}: hi ha el botó ◐ al marcador, el fons és fosc (${r.fons}) i el marcador hi cap a 320 px`);
}

// a la Sopa es toca el botó: tot passa a clar, i val per a tots els altres
await obre('sopa');
await p.evaluate(() => document.querySelectorAll('body > div[style*="position: fixed"]').forEach(d => { if (d.id !== 'msg') d.remove(); }));
await p.click('#rec-tema'); await p.waitForTimeout(150);
const s = await p.evaluate(() => ({ clar: document.documentElement.classList.contains('clar'), desat: localStorage.getItem('jocs-tema'),
  text: document.getElementById('rec-tema').textContent, fons: getComputedStyle(document.body).backgroundColor }));
diu(s.clar && s.desat === 'clar' && s.text === '☾' && llum(s.fons) > 200, `tocant-lo, el fons es torna clar (${s.fons}) i es recorda`);

for (const joc of JOCS) {
  const r = await obre(joc);
  diu(r.clar && r.text === '☾' && llum(r.fons) > 200 && llum(r.ajuda) < 120 && r.cap,
    `${joc}: obert després, ja surt clar (${r.fons}), la línia d'ajuda es llegeix (${r.ajuda}) i el marcador hi cap`);
}

// i un altre toc el torna fosc
await obre('estel');
await p.evaluate(() => document.querySelectorAll('body > div[style*="position: fixed"]').forEach(d => { if (d.id !== 'msg') d.remove(); }));
await p.click('#rec-tema'); await p.waitForTimeout(150);
const f = await obre('gofra');
diu(!f.clar && f.text === '◐' && llum(f.fons) < 80, 'un altre toc el torna fosc, també als altres jocs');

diu(errors.length === 0, errors.length ? 'error de JavaScript: ' + errors[0] : 'cap error de JavaScript');
console.log(malament ? `\n${malament} coses malament` : '\nel fons clar, bé');
await b.close();
process.exit(malament ? 1 : 0);
