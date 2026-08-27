/**
 * jocs-records — taula de records compartida per tothom qui juga a Jocs.
 *
 * Es desplega com un Worker de Cloudflare amb un espai KV lligat amb el
 * nom RECORDS. Cada joc hi guarda una llista dels 10 millors.
 *
 *   GET  /records          -> els 10 millors de tots els jocs
 *   GET  /records/tetris   -> els 10 millors d'un joc
 *   POST /records/tetris   -> {"nom":"ABC","punts":1234}
 *                             afegeix la puntuacio i retorna el top 10
 *
 * El codi corre al navegador de qui juga, aixi que qualsevol pot enviar
 * una puntuacio inventada. Per aixo es valida el que es pot: nom de tres
 * lletres, punts enters i un sostre raonable per joc.
 */

// nomes s'accepten aquests jocs, amb el maxim que es pot fer a cadascun
const JOCS = {
  tetris:          9999999,
  comecocos:       9999999,
  space_invaders:   999999,
  asteroids:       9999999,
  breakout:             896,   // el maxim real del Breakout original
  missile_command: 9999999,
  galaxian:         999999,
  frogger:          999999,
  battlezone:      9999999,
  centipede:       9999999,
  pong:                9999,
  donkey_kong:      999999,
};
const TOP = 10;

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...cors },
  });

async function llegir(env, joc) {
  const raw = await env.RECORDS.get('joc:' + joc);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];   // si el valor s'ha corromput, val mes tornar a comencar
  }
}

function netejaNom(nom) {
  return String(nom == null ? '' : nom)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 3) || 'AAA';
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    const url = new URL(request.url);
    const parts = url.pathname.split('/').filter(Boolean);   // ['records', 'tetris']

    if (parts[0] !== 'records') {
      return json({ ok: true, servei: 'jocs-records', jocs: Object.keys(JOCS) });
    }

    const joc = parts[1];

    // tots els jocs de cop, per pintar la taula de la pagina principal
    if (!joc) {
      if (request.method !== 'GET') return json({ error: 'metode no permes' }, 405);
      const noms = Object.keys(JOCS);
      const llistes = await Promise.all(noms.map(n => llegir(env, n)));
      const out = {};
      noms.forEach((n, i) => { out[n] = llistes[i]; });
      return json(out);
    }

    if (!(joc in JOCS)) return json({ error: 'joc desconegut' }, 404);

    if (request.method === 'GET') return json(await llegir(env, joc));

    if (request.method === 'POST') {
      let cos;
      try {
        cos = await request.json();
      } catch {
        return json({ error: 'cos invalid' }, 400);
      }

      const punts = Math.floor(Number(cos.punts));
      if (!Number.isFinite(punts) || punts <= 0 || punts > JOCS[joc]) {
        return json({ error: 'puntuacio fora de rang' }, 400);
      }
      const nom = netejaNom(cos.nom);

      const entrada = { n: nom, p: punts, t: Date.now() };
      const llista = await llegir(env, joc);
      llista.push(entrada);
      llista.sort((a, b) => b.p - a.p || a.t - b.t);   // a igualtat de punts, mana qui hi va arribar abans
      const retallada = llista.slice(0, TOP);
      await env.RECORDS.put('joc:' + joc, JSON.stringify(retallada));

      // posicio a la taula, o 0 si no ha entrat entre els deu millors
      return json({ top: retallada, posicio: retallada.indexOf(entrada) + 1 });
    }

    return json({ error: 'metode no permes' }, 405);
  },
};
