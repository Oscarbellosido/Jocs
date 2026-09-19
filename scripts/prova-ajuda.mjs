// Comprova que tots els jocs tinguin la línia d'ajuda, que comenci dient
// l'objectiu, que es vegi sencera dins de la pantalla i que no faci vessar res.
//
//   node scripts/prova-ajuda.mjs
//
// L'Asteroid Belt va a pantalla completa i la seva línia queda dins del camp
// de joc: allà ha de ser-hi en entrar i marxar quan comences a jugar.

import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readdirSync } from 'fs';

const ARREL = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FORA = ['index.html', 'asteroid_belt.html'];
const PANTALLA_SENCERA = 'asteroid_belt_joc.html';
const jocs = readdirSync(ARREL).filter(f => f.endsWith('.html') && !FORA.includes(f)).sort();
const MIDES = [[320, 568], [390, 844]];

const b = await chromium.launch();
let malament = 0;

for (const joc of jocs) {
  const problemes = [];
  let objectiu = '';
  for (const [w, h] of MIDES) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } });
    await ctx.route('**/jocs-records*/**', r => r.fulfill({
      status: 200, contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' }, body: '[]',
    }));
    const p = await ctx.newPage();
    const errors = [];
    p.on('pageerror', e => errors.push(String(e)));
    await p.goto('file://' + resolve(ARREL, joc));
    await p.waitForTimeout(800);

    const r = await p.evaluate(() => {
      // la nostra es la que porta l'objectiu destacat, no els retols del joc
      const sm = [...document.querySelectorAll('small')].find(e => /color:#ddd/.test(e.innerHTML));
      if (!sm) return { cap: true };
      const rc = sm.getBoundingClientRect();
      return {
        cap: false,
        objectiu: (sm.querySelector('b') || {}).textContent || '',
        visible: getComputedStyle(sm).opacity !== '0' && rc.height > 0,
        dins: rc.top >= -1 && rc.bottom <= innerHeight + 1 &&
              rc.left >= -1 && rc.right <= innerWidth + 1,
        scroll: document.documentElement.scrollWidth > window.innerWidth + 1,
      };
    });

    if (r.cap) problemes.push(`${w}px: no té línia d'ajuda`);
    else {
      objectiu = r.objectiu;
      if (!r.objectiu.trim()) problemes.push(`${w}px: no diu l'objectiu`);
      if (!r.visible) problemes.push(`${w}px: no es veu en entrar`);
      if (!r.dins) problemes.push(`${w}px: se surt de la pantalla`);
      if (r.scroll) problemes.push(`${w}px: scroll horitzontal`);
    }

    // el de pantalla sencera ha de deixar el camp net quan comences a jugar
    if (!r.cap && joc === PANTALLA_SENCERA) {
      await p.evaluate(() => document.querySelector('[data-k]')
        .dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })));
      await p.waitForTimeout(700);
      const tapa = await p.evaluate(() =>
        getComputedStyle(document.getElementById('ajuda')).opacity !== '0');
      if (tapa) problemes.push(`${w}px: es queda dins del camp mentre jugues`);
    }
    if (errors.length) problemes.push(errors[0]);
    await ctx.close();
  }

  if (problemes.length) malament++;
  console.log(`${problemes.length ? '✗' : '✓'} ${joc.replace('.html', '').padEnd(20)} ` +
    (problemes.length ? problemes.join(' · ') : objectiu.slice(0, 52)));
}

console.log(malament ? `\n${malament} de ${jocs.length} jocs malament` : `\nels ${jocs.length} jocs, be`);
await b.close();
process.exit(malament ? 1 : 0);
