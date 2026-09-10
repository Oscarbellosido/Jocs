// Comprova que a cada joc que fa soroll surti el boto del so, que apagant-lo
// el volum es posi de debo a zero, i que el marcador no vessi a 320 px.
//
//   node scripts/prova-so.mjs
//
// El Tetris no fa cap so: alla el boto NO hi ha de ser.

import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readdirSync } from 'fs';

const ARREL = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SENSE_SO = ['tetris.html'];          // no fa soroll: no li toca boto
const FORA = ['index.html', 'asteroid_belt.html'];
const jocs = readdirSync(ARREL).filter(f => f.endsWith('.html') && !FORA.includes(f)).sort();

const b = await chromium.launch();
let malament = 0;

for (const joc of jocs) {
  const ctx = await b.newContext({ viewport: { width: 320, height: 568 } });
  await ctx.route('**/jocs-records*/**', r => r.fulfill({
    status: 200, contentType: 'application/json',
    headers: { 'access-control-allow-origin': '*' }, body: '[]',
  }));
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', e => errors.push(String(e)));
  await p.goto('file://' + resolve(ARREL, joc));
  await p.waitForTimeout(900);

  // fem sonar el joc: cada un escolta coses diferents, els hi donem totes
  await p.evaluate(() => {
    const c = document.querySelector('canvas');
    if (c) {
      const r = c.getBoundingClientRect();
      for (const t of ['pointerdown', 'mousedown', 'click', 'pointerup', 'mouseup']) {
        c.dispatchEvent(new PointerEvent(t, {
          bubbles: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2,
        }));
      }
    }
    for (const bt of document.querySelectorAll('#controls button, .ctrl button, button')) {
      if (bt.id === 'back' || bt.id === 'rec-so' || bt.id === 'rec-pausa') continue;
      bt.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
      bt.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    }
    for (const code of ['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'Enter', 'KeyA']) {
      document.dispatchEvent(new KeyboardEvent('keydown', { code, key: ' ', bubbles: true }));
      document.dispatchEvent(new KeyboardEvent('keyup', { code, key: ' ', bubbles: true }));
    }
  });
  await p.waitForTimeout(700);

  const abans = await p.evaluate(() => ({
    canals: Records.canalsSo(),
    boto: !!document.getElementById('rec-so'),
  }));

  let despres = { canals: [], boto: abans.boto, text: '' };
  if (abans.boto) {
    await p.click('#rec-so');
    despres = await p.evaluate(() => ({
      canals: Records.canalsSo(),
      so: Records.so(),
      text: document.getElementById('rec-so').textContent,
      // i que en tornar-hi torni a sonar
      tornaSonar: (document.getElementById('rec-so').click(),
                   Records.canalsSo().every(v => v === 1) && Records.so()),
    }));
  }

  const mesura = await p.evaluate(() => {
    const hud = document.getElementById('hud') || document.getElementById('h');
    const bs = document.getElementById('rec-so');
    return {
      vessa: hud ? hud.scrollWidth > hud.clientWidth + 1 : false,
      scrollPagina: document.documentElement.scrollWidth > window.innerWidth + 1,
      mida: bs ? [Math.round(bs.getBoundingClientRect().width),
                  Math.round(bs.getBoundingClientRect().height)] : null,
    };
  });

  const problemes = [];
  const hauriaDeSonar = !SENSE_SO.includes(joc);
  if (hauriaDeSonar && !abans.canals.length) problemes.push('el joc no ha fet cap so');
  if (hauriaDeSonar && !abans.boto) problemes.push('no hi ha el botó del so');
  if (!hauriaDeSonar && abans.boto) problemes.push('hi ha botó de so en un joc que no en fa');
  if (abans.boto) {
    if (!despres.canals.every(v => v === 0)) problemes.push('apagant-lo el so no s\'ha callat');
    if (despres.so !== false) problemes.push('l\'estat no diu que estigui apagat');
    if (despres.text !== '🔇') problemes.push('el botó no canvia de dibuix');
    if (!despres.tornaSonar) problemes.push('en tornar-hi el so no torna');
    if (mesura.mida && (mesura.mida[0] < 18 || mesura.mida[1] < 16)) {
      problemes.push(`botó massa petit (${mesura.mida.join('x')})`);
    }
  }
  if (mesura.vessa) problemes.push('el marcador vessa a 320 px');
  if (mesura.scrollPagina) problemes.push('scroll horitzontal');
  if (errors.length) problemes.push(errors[0]);

  if (problemes.length) malament++;
  console.log(`${problemes.length ? '✗' : '✓'} ${joc.replace('.html', '').padEnd(20)} ` +
    (problemes.length ? problemes.join(' · ')
      : hauriaDeSonar ? `botó de ${mesura.mida.join('x')}, calla i torna a sonar`
                      : 'sense so i sense botó, com toca'));
  await ctx.close();
}

console.log(malament ? `\n${malament} de ${jocs.length} jocs malament` : `\nels ${jocs.length} jocs, be`);
await b.close();
process.exit(malament ? 1 : 0);
