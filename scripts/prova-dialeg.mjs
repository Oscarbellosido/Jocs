// Comprova, a tots els jocs, que el quadre que demana les inicials quan fas
// record es veu be.
//
// Per que existeix aquesta prova: cada joc te la seva regla
// button{width:NNpx;height:NNpx} per als botons dels controls, i aquesta
// regla tambe agafava el boto D'ACORD del quadre de records, que es crea des
// del records.js i no tenia amplada propia. Als jocs amb botons estrets (el
// Crazy Climber els te de 46 pixels) el text se'n sortia. En Carles ho va
// veure jugant al Defender.
//
//   node scripts/prova-dialeg.mjs
//
// El Worker es simula, que des de l'entorn de desenvolupament no s'hi arriba.

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
  // taula buida: la puntuacio hi entra i ha de demanar les inicials
  await ctx.route('**/jocs-records*/**', r => r.fulfill({
    status: 200, contentType: 'application/json',
    headers: { 'access-control-allow-origin': '*' },
    body: r.request().method() === 'POST' ? '{"top":[],"posicio":1}' : '[]',
  }));
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', e => errors.push(String(e)));
  await p.goto('file://' + resolve(ARREL, fitxer));
  await p.waitForTimeout(500);
  await p.evaluate(() => { Records.fiPartida(window.JOC || 'pong', 5000); null; });
  await p.waitForTimeout(400);

  const r = await p.evaluate(() => {
    const bt = document.getElementById('rec-ok');
    if (!bt) return { cap: true };
    const c = bt.getBoundingClientRect();
    const quadre = bt.closest('div[style*="border-radius"]').getBoundingClientRect();
    const camp = document.getElementById('rec-nom').getBoundingClientRect();
    return {
      ample: Math.round(c.width),
      textCal: bt.scrollWidth,
      sobreix: bt.scrollWidth > Math.ceil(c.width) + 1,
      fora: c.left < quadre.left - 1 || c.right > quadre.right + 1 ||
            c.top < quadre.top - 1 || c.bottom > quadre.bottom + 1 ||
            camp.left < quadre.left - 1 || camp.right > quadre.right + 1,
    };
  });

  const mal = r.cap || r.sobreix || r.fora || errors.length;
  if (mal) malament++;
  console.log(`${mal ? '✗' : '✓'} ${fitxer.replace('.html', '').padEnd(20)} ` +
    (r.cap ? 'no surt el quadre' :
     r.sobreix ? `el text (${r.textCal}px) no cap al boto (${r.ample}px)` :
     r.fora ? 'alguna cosa surt del quadre' :
     errors.length ? errors[0] : `boto de ${r.ample}px, hi cap`));
  await ctx.close();
}

console.log(malament ? `\n${malament} de ${jocs.length} malament` : `\nels ${jocs.length} jocs, be`);
await b.close();
process.exit(malament ? 1 : 0);
