// Comprova que tots els jocs tinguin el boto de pausa al marcador, que
// funcioni de veritat (que el joc s'aturi i es torni a engegar) i que
// afegir-lo no faci vessar el marcador a cap mida de mobil.
//
//   node scripts/prova-pausa.mjs

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
  const problemes = [];
  const ctx = await b.newContext({ viewport: { width: 320, height: 568 } });
  await ctx.route('**/jocs-records*/**', r => r.fulfill({
    status: 200, contentType: 'application/json',
    headers: { 'access-control-allow-origin': '*' }, body: '[]' }));
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', e => errors.push(String(e)));
  await p.goto('file://' + resolve(ARREL, fitxer));
  await p.waitForTimeout(2600);

  // 1. hi ha un boto de pausa a la pantalla? (el compartit o el del propi joc)
  const hiEs = await p.evaluate(() => {
    window.__pausaBtn = document.getElementById('rec-pausa') ||
      [...document.querySelectorAll('#hud button, #h button')]
        .find(b => /[⏸▶]/.test(b.textContent)) || null;
    return !!window.__pausaBtn;
  });
  if (!hiEs) problemes.push('no hi ha el boto');

  // 2. el marcador no vessa i el boto es prou gran per al dit
  const mida = await p.evaluate(() => {
    const h = document.getElementById('hud') || document.getElementById('h'),
          b = window.__pausaBtn;
    if (!h || !b) return null;
    const rb = b.getBoundingClientRect();
    return { vessa: h.scrollWidth > h.clientWidth + 1, w: rb.width, h: rb.height };
  });
  if (mida) {
    if (mida.vessa) problemes.push('el marcador vessa');
    if (mida.w < 20 || mida.h < 18) problemes.push('boto massa petit ' + Math.round(mida.w) + 'x' + Math.round(mida.h));
  }

  // 3. prement-lo, el joc s'atura de veritat
  // Mirem l'estat de pausa del joc, no els pixels: als jocs amb estrelles que
  // parpellegen la pantalla canvia igualment encara que estigui aturat.
  if (hiEs) {
    const r = await p.evaluate(async () => {
      const estat = () => {
        if (typeof paused !== 'undefined') return paused;
        if (typeof pausa !== 'undefined') return pausa;
        return null;                       // el Tetris el te dins d'una funcio
      };
      const foto = () => {
        // el mes gran: el Tetris en te tres i el tauler es aquest
        const c = [...document.querySelectorAll('canvas')]
          .sort((a, b) => b.width * b.height - a.width * a.height)[0];
        return c ? c.toDataURL() : null;
      };
      const abans = estat(), fotoAbans = foto();
      window.__pausaBtn.click();
      await new Promise(r => setTimeout(r, 200));
      const durant = estat(), fotoDurant = foto();
      window.__pausaBtn.click();
      await new Promise(r => setTimeout(r, 200));
      return { abans, durant, despres: estat(),
               canviaPantalla: fotoAbans !== fotoDurant };
    });
    if (r.durant === null) {
      // sense variable a la vista: com a minim el clic ha de canviar la
      // pantalla (el Tetris hi pinta el rètol de PAUSA)
      if (!r.canviaPantalla) problemes.push('el clic no fa res visible');
    } else {
      if (r.durant !== true) problemes.push('prement-lo no s\'atura');
      if (r.despres !== false) problemes.push('no es torna a engegar');
    }
  }

  if (errors.length) problemes.push('error JS: ' + errors[0].slice(0, 60));
  const nom = fitxer.replace('.html', '').padEnd(20);
  if (problemes.length) { console.log('✗ ' + nom + problemes.join(' · ')); malament++; }
  else console.log('✓ ' + nom + 'boto de pausa, atura i torna a engegar');
  await ctx.close();
}

console.log('\n' + (malament ? malament + ' malament' : 'els ' + jocs.length + ' jocs, be'));
await b.close();
process.exit(malament ? 1 : 0);
