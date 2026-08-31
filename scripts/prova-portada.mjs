// Comprova que la portada ensenyi els jocs per ordre d'any, amb l'any correcte
// a cada fitxa, i que res no se surti a cap mida de pantalla.
//
//   node scripts/prova-portada.mjs
//
// La llista d'anys d'aqui es a posta: si algu canvia un any a l'index.html
// sense voler, aixo ho ha de veure. No la treguis de l'index.

import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const ARREL = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// per ordre de sortida, que es com han de sortir
const ORDRE = [
  ['pong', 1972], ['breakout', 1976], ['space_invaders', 1978],
  ['galaxian', 1979], ['asteroids', 1979],
  ['comecocos', 1980], ['missile_command', 1980], ['crazy_climber', 1980],
  ['battlezone', 1980], ['defender', 1980],
  ['centipede', 1981], ['frogger', 1981], ['donkey_kong', 1981], ['galaga', 1981], ['tempest', 1981],
  ['dig_dug', 1982], ['qbert', 1982], ['tetris', 1984],
];
const MIDES = [[320, 568], [360, 640], [390, 844], [412, 915], [768, 1024], [1280, 800]];

const b = await chromium.launch();
let malament = 0;

for (const [w, h] of MIDES) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  // records de mentida, i ben llargs, per veure que l'any i el record hi caben
  await ctx.route('**/jocs-records*/**', r => r.fulfill({
    status: 200, contentType: 'application/json',
    headers: { 'access-control-allow-origin': '*' },
    body: JSON.stringify(Object.fromEntries(
      ORDRE.map(([joc]) => [joc, [{ n: 'CRE', p: 188400, t: 1 }]]))),
  }));
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', e => errors.push(String(e)));
  await p.goto('file://' + resolve(ARREL, 'index.html'));
  await p.waitForTimeout(900);

  const r = await p.evaluate(() => {
    const fitxes = [...document.querySelectorAll('a.btn')];
    return {
      llista: fitxes.map(f => [f.querySelector('.rec').dataset.joc,
                               +f.querySelector('.any').textContent]),
      scrollHoritzontal: document.documentElement.scrollWidth > window.innerWidth + 1,
      tallades: fitxes.filter(f => f.getBoundingClientRect().top < 0).length,
      anyAmagat: fitxes.filter(f => f.querySelector('.any').getBoundingClientRect().width < 10).length,
      vessa: fitxes.filter(f => {
        const e = f.querySelector('em');
        return e.scrollWidth > e.clientWidth + 1;
      }).length,
      imgTrencades: [...document.images].filter(i => !i.complete || i.naturalWidth === 0).length,
    };
  });

  const esperat = JSON.stringify(ORDRE);
  const problemes = [];
  if (JSON.stringify(r.llista) !== esperat) problemes.push('l\'ordre o algun any no quadra');
  if (r.scrollHoritzontal) problemes.push('scroll horitzontal');
  if (r.tallades) problemes.push(`${r.tallades} fitxes tallades per dalt`);
  if (r.anyAmagat) problemes.push(`${r.anyAmagat} anys que no es veuen`);
  if (r.vessa) problemes.push(`${r.vessa} línies on el record no cap`);
  if (r.imgTrencades) problemes.push(`${r.imgTrencades} miniatures trencades`);
  if (errors.length) problemes.push(errors[0]);

  if (problemes.length) malament++;
  console.log(`${problemes.length ? '✗' : '✓'} ${String(w + 'x' + h).padEnd(10)} ` +
    (problemes.length ? problemes.join(' · ') : `els ${r.llista.length} jocs per ordre, de ${r.llista[0][1]} a ${r.llista.at(-1)[1]}`));
  await ctx.close();
}

console.log(malament ? `\n${malament} de ${MIDES.length} mides malament` : `\nles ${MIDES.length} mides, be`);
await b.close();
process.exit(malament ? 1 : 0);
