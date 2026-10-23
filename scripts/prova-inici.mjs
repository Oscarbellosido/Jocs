// Comprova que, en entrar a qualsevol joc, la taula de records surti uns
// segons, que el joc estigui aturat mentre es veu, que es tanqui sola i al
// primer toc, i que si no hi ha records no faci esperar ningu. I que el
// toc que la tanca no premi res del que queda a sota (a L'Abecedari, amb el
// dit, premia COMENÇA i la roda d'avui començava sola).
//
//   node scripts/prova-inici.mjs

import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const ARREL = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const jocs = readdirSync(ARREL)
  .filter(f => f.endsWith('.html') && f !== 'index.html' && f !== 'asteroid_belt.html')
  .sort();

const TAULA = [['CRE',18400],['ABC',15200],['XYZ',12100],['CRE',9600],['JPM',8300]]
  .map(([n,p],i)=>({n,p,t:i}));

const b = await chromium.launch();
let malament = 0;

const obre = async (fitxer, cos, dit = false) => {
  const ctx = await b.newContext({ viewport:{width:390,height:844}, hasTouch: dit, isMobile: dit });
  await ctx.route('**/jocs-records*/**', r => r.fulfill({
    status:200, contentType:'application/json',
    headers:{'access-control-allow-origin':'*'}, body: JSON.stringify(cos) }));
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', e => errors.push(String(e)));
  await p.goto('file://' + resolve(ARREL, fitxer));
  return { ctx, p, errors };
};
const quadre = p => p.evaluate(() =>
  [...document.querySelectorAll('div')].find(d =>
    /RÈCORDS/.test(d.textContent) && getComputedStyle(d).position === 'fixed') ? true : false);

for (const fitxer of jocs) {
  const problemes = [];

  // 1. amb records: surt, atura el joc, i es tanca sola
  let { ctx, p, errors } = await obre(fitxer, TAULA);
  await p.waitForTimeout(600);
  if (!await quadre(p)) problemes.push('no surt la taula');
  const enPausa = await p.evaluate(() => {
    try { return paused === true } catch { try { return on !== true } catch { return null } }
  });
  if (enPausa === false) problemes.push('el joc no s\'atura mentre la mires');
  await p.waitForTimeout(3600);
  if (await quadre(p)) problemes.push('no es tanca sola');
  const després = await p.evaluate(() => {
    try { return paused === false } catch { return true }
  });
  if (!després) problemes.push('el joc es queda en pausa després');
  if (errors.length) problemes.push(errors[0]);
  await ctx.close();

  // 2. es tanca al primer toc, i aquell toc no arriba al que hi ha a sota
  ({ ctx, p, errors } = await obre(fitxer, TAULA, true));
  await p.waitForTimeout(600);
  await p.evaluate(() => { window.__clics = 0; document.addEventListener('click', () => window.__clics++); });
  await p.touchscreen.tap(195, 422);
  await p.waitForTimeout(300);
  if (await quadre(p)) problemes.push('no es tanca quan la toques');
  if (await p.evaluate(() => window.__clics)) problemes.push('el toc que la tanca també prem el que hi ha a sota');
  await ctx.close();

  // 3. sense records, no fa esperar
  ({ ctx, p, errors } = await obre(fitxer, []));
  await p.waitForTimeout(700);
  if (await quadre(p)) problemes.push('sense records, fa esperar igual');
  await ctx.close();

  if (problemes.length) malament++;
  console.log(`${problemes.length ? '✗' : '✓'} ${fitxer.replace('.html','').padEnd(20)} ` +
    (problemes.length ? problemes.join(' · ') : 'la taula surt, atura el joc i marxa sola'));
}

console.log(malament ? `\n${malament} de ${jocs.length} malament` : `\nels ${jocs.length} jocs, be`);
await b.close();
process.exit(malament ? 1 : 0);
