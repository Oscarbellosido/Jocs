// Comprova que, en acabar la partida, tots els jocs ensenyen la taula de
// records amb un boto per tornar al menu, que es veu i que hi porta de debo.
//
// Abans no hi era: per anar al menu havies de comencar una partida nova i fer
// enrere. En Carles ho va demanar despres de jugar al Defender.
//
//   node scripts/prova-menu.mjs

import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const ARREL = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const jocs = readdirSync(ARREL)
  .filter(f => f.endsWith('.html') && f !== 'index.html' && f !== 'asteroid_belt.html')
  .sort();

const b = await chromium.launch();
let malament = 0;

for (const fitxer of jocs) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  // el Worker es simula: hi ha taula i la puntuacio no hi entra, aixi no
  // demana les inicials i anem de dret al quadre final
  await ctx.route('**/jocs-records*/**', r => r.fulfill({
    status: 200, contentType: 'application/json',
    headers: { 'access-control-allow-origin': '*' },
    body: JSON.stringify(Array.from({ length: 10 }, (_, i) => ({ n: 'CRE', p: 999999 - i, t: i }))),
  }));
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', e => errors.push(String(e)));
  await p.goto('file://' + resolve(ARREL, fitxer));
  await p.waitForTimeout(500);

  // Fem sortir el quadre final. El Tetris te el codi dins d'una funcio
  // tancada i no s'hi pot cridar des de fora: aquell el juguem de debo,
  // deixant caure peces al mig fins que es vessa.
  if (fitxer === 'tetris.html') {
    for (let i = 0; i < 60 && !await p.$('a[data-menu-jocs]'); i++) {
      await p.keyboard.press(' ');
      await p.waitForTimeout(120);
    }
  } else {
    await p.evaluate(() => {
      // molts jocs amaguen el quadre sols si no els consta que s'ha acabat
      try { state = 'over'; } catch {}
      try { readyTimer = 0; } catch {}
      try { waveTimer = 0; } catch {}
      try { on = false; } catch {}
      if (typeof finalPartida === 'function') finalPartida('GAME OVER');
      else if (typeof gameOver === 'function') gameOver();
      null;
    }).catch(() => {});
    await p.waitForTimeout(900);
  }

  const r = await p.evaluate(() => {
    const a = document.querySelector('a[data-menu-jocs]');
    if (!a) return { cap: true };
    const c = a.getBoundingClientRect();
    const visible = c.width > 20 && c.height > 20 &&
                    c.top >= 0 && c.bottom <= window.innerHeight &&
                    c.left >= 0 && c.right <= window.innerWidth;
    return { visible, mida: [Math.round(c.width), Math.round(c.height)], desti: a.getAttribute('href') };
  });

  let arriba = false;
  if (!r.cap && r.visible) {
    await p.click('a[data-menu-jocs]').catch(() => {});
    await p.waitForTimeout(600);
    arriba = /index\.html$/.test(p.url());
  }

  const mal = r.cap || !r.visible || !arriba || errors.length;
  if (mal) malament++;
  console.log(`${mal ? '✗' : '✓'} ${fitxer.replace('.html', '').padEnd(20)} ` +
    (r.cap ? 'no hi ha cap botó de menú' :
     !r.visible ? `el botó no es veu bé: ${JSON.stringify(r.mida)}` :
     !arriba ? 'el botó no porta al menú' :
     errors.length ? errors[0] : `botó de ${r.mida[0]}x${r.mida[1]}, porta a ${r.desti}`));
  await ctx.close();
}

console.log(malament ? `\n${malament} de ${jocs.length} malament` : `\nels ${jocs.length} jocs, be`);
await b.close();
process.exit(malament ? 1 : 0);
