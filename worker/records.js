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
 *
 * TELEGRAM (opcional: sense la clau, tot va igual que abans i no s'envia res)
 *
 *   GET  /telegram/activa  -> connecta el bot amb aquest Worker. S'obre un
 *                             sol cop al navegador, despres d'haver posat la
 *                             clau. Tambe posa el boto "Jocs" al xat privat
 *                             amb el bot i la llista d'ordres.
 *   POST /telegram         -> on Telegram envia el que s'escriu al bot
 *
 *   Al grup:  /aqui         avisa aqui dels records nous
 *             /prou         deixa d'avisar
 *             /records ram  la taula d'un joc;  /records  qui mana a cada joc
 *
 * La clau del bot (la que dona el @BotFather) va al tauler de Cloudflare com
 * a SECRET amb el nom TELEGRAM_TOKEN. MAI en aquest fitxer: aquest fitxer es
 * public al GitHub, i qui tingui la clau pot fer parlar el bot.
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
  crazy_climber:    999999,
  dig_dug:          999999,
  defender:        9999999,
  qbert:           9999999,
  tempest:         9999999,
  galaga:          9999999,
  pole_position:   9999999,
  moon_patrol:     9999999,
  track_field:     9999999,
  nibbler:         9999999,
  sindria:          999999,
  amunt:            999999,
  boles:              9999,
  balanca:          999999,
  xifres:             9999,
  ram:               99999,
  lunar_lander:      99999,
  garbuix:          999999,
  impremta:      999999999,
  gofra:             99999,   // les estrelles acumulades de totes les gofres del dia
};

// Taules on cadascu surt una sola vegada, amb la seva millor puntuacio. A la
// Gofra la puntuacio son les estrelles acumulades i creix cada dia: sense
// aixo, la taula s'ompliria del mateix jugador amb 12, 15, 19 estrelles...
const UNA_PER_NOM = new Set(['gofra']);

// Les partides del dia: una taula per a cada dia (/records/impremta_dia/2026-10-02).
// No surten a la llista de tots els jocs ni avisen per Telegram: el primer
// que hi juga cada mati ja seria el numero 1, i el grup s'ompliria d'avisos.
// Cada taula s'esborra sola al cap de seixanta dies.
const DIARIS = {
  impremta_dia:  999999999,
  gofra_dia:             5,   // les estrelles d'avui, de 0 a 5
};
const DIES_DIARI = 60;
const TOP = 10;

// Per als missatges de Telegram: com es diu cada joc ("al Ram", "a les Boles")
// i quin fitxer s'obre per jugar-hi. Els identificadors no sempre coincideixen
// amb el nom del fitxer: l'Asteroids, per exemple.
const WEB = 'https://oscarbellosido.github.io/Jocs/';
const FITXA = {
  tetris:          ['Tetris',          'al Tetris',          'tetris.html'],
  comecocos:       ['Comecocos',       'al Comecocos',       'comecocos.html'],
  space_invaders:  ['Space Invaders',  'al Space Invaders',  'space_invaders.html'],
  asteroids:       ['Asteroids',       "a l'Asteroids",      'asteroid_belt_joc.html'],
  breakout:        ['Breakout',        'al Breakout',        'breakout.html'],
  missile_command: ['Missile Command', 'al Missile Command', 'missile_command.html'],
  galaxian:        ['Galaxian',        'al Galaxian',        'galaxian.html'],
  frogger:         ['Frogger',         'al Frogger',         'frogger.html'],
  battlezone:      ['Battlezone',      'al Battlezone',      'battlezone.html'],
  centipede:       ['Centipede',       'al Centipede',       'centipede.html'],
  pong:            ['Pong',            'al Pong',            'pong.html'],
  donkey_kong:     ['Donkey Kong',     'al Donkey Kong',     'donkey_kong.html'],
  crazy_climber:   ['Crazy Climber',   'al Crazy Climber',   'crazy_climber.html'],
  dig_dug:         ['Dig Dug',         'al Dig Dug',         'dig_dug.html'],
  defender:        ['Defender',        'al Defender',        'defender.html'],
  qbert:           ['Q*bert',          'al Q*bert',          'qbert.html'],
  tempest:         ['Tempest',         'al Tempest',         'tempest.html'],
  galaga:          ['Galaga',          'al Galaga',          'galaga.html'],
  pole_position:   ['Pole Position',   'al Pole Position',   'pole_position.html'],
  moon_patrol:     ['Moon Patrol',     'al Moon Patrol',     'moon_patrol.html'],
  track_field:     ['Track & Field',   'al Track & Field',   'track_field.html'],
  nibbler:         ['Nibbler',         'al Nibbler',         'nibbler.html'],
  sindria:         ['Síndria',         'al Síndria',         'sindria.html'],
  amunt:           ['Amunt',           "a l'Amunt",          'amunt.html'],
  boles:           ['Boles',           'a les Boles',        'boles.html'],
  balanca:         ['Balança',         'a la Balança',       'balanca.html'],
  xifres:          ['Xifres',          'al Xifres',          'xifres.html'],
  ram:             ['El Ram',          'al Ram',             'ram.html'],
  lunar_lander:    ['Lunar Lander',    'al Lunar Lander',    'lunar_lander.html'],
  garbuix:         ['Garbuix',         'al Garbuix',         'garbuix.html'],
  impremta:        ['La Impremta',     'a la Impremta',      'impremta.html'],
  gofra:           ['La Gofra',        'a la Gofra',         'gofra.html'],
};

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

// ===== TELEGRAM =====

const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// 4320 -> "4.320", com s'escriu aqui
const xifra = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

async function telegram(env, metode, dades) {
  const r = await fetch('https://api.telegram.org/bot' + env.TELEGRAM_TOKEN + '/' + metode, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dades),
  });
  return r.json().catch(() => ({}));
}

// La contrasenya que Telegram ens enviara a cada missatge, perque ningu mes
// pugui fer-se passar per Telegram. Surt de la clau del bot, aixi no cal
// guardar-ne una altra.
async function contrasenya(env) {
  const bytes = new TextEncoder().encode('jocs-records:' + env.TELEGRAM_TOKEN);
  const h = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(h)].map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 40);
}

// Quan algu passa a ser el numero 1 d'un joc, s'avisa el grup.
async function avisaRecord(env, joc, entrada, abans) {
  if (!env.TELEGRAM_TOKEN) return;
  const xat = await env.RECORDS.get('telegram:xat');
  if (!xat) return;
  const [nom, al, fitxer] = FITXA[joc] || [joc, 'a ' + joc, ''];
  const qui = '<b>' + esc(entrada.n) + '</b>', punts = '<b>' + xifra(entrada.p) + '</b>';
  let text;
  if (!abans) text = '🏆 Primer rècord ' + esc(al) + ': ' + qui + ' amb ' + punts;
  else if (abans.n === entrada.n)
    text = '🏆 ' + qui + ' millora el seu rècord ' + esc(al) + ': ' + punts + ' (abans ' + xifra(abans.p) + ')';
  else
    text = '🏆 ' + qui + ' ha fet ' + punts + ' ' + esc(al) + ' i passa davant de <b>' +
           esc(abans.n) + '</b> (' + xifra(abans.p) + ')';
  const dades = { chat_id: xat, text, parse_mode: 'HTML', disable_web_page_preview: true };
  if (fitxer) dades.reply_markup = { inline_keyboard: [[{ text: '🎮 Juga ' + al, url: WEB + fitxer }]] };
  await telegram(env, 'sendMessage', dades);
}

// "/records ram", "/records lunar", "/records@ElBot tetris": es busca el joc
// pel nom o pel principi del nom, sense fer cas d'accents ni majuscules.
const pla = t => String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
function trobaJoc(t) {
  const q = pla(t);
  if (!q) return null;
  for (const id of Object.keys(JOCS)) if (pla(id) === q || pla(FITXA[id][0]) === q) return id;
  for (const id of Object.keys(JOCS)) if (pla(id).startsWith(q) || pla(FITXA[id][0]).startsWith(q)) return id;
  return null;
}

async function taulaDe(env, joc) {
  const llista = await llegir(env, joc);
  const [nom] = FITXA[joc];
  if (!llista.length) return '🎮 <b>' + esc(nom) + '</b>\nEncara no hi ha cap rècord.';
  return '🎮 <b>' + esc(nom) + '</b>\n' +
    llista.map((e, i) => (i + 1 + '.').padEnd(4) + esc(e.n) + '  ' + xifra(e.p)).join('\n');
}

async function quiMana(env) {
  const noms = Object.keys(JOCS);
  const llistes = await Promise.all(noms.map(n => llegir(env, n)));
  const files = noms.map((n, i) => llistes[i][0]
    ? esc(FITXA[n][0]) + ': <b>' + esc(llistes[i][0].n) + '</b> ' + xifra(llistes[i][0].p) : null).filter(Boolean);
  if (!files.length) return 'Encara no hi ha cap rècord.';
  return '👑 <b>Qui mana a cada joc</b>\n' + files.join('\n');
}

// ===== QUI VA GUANYAR LA PARTIDA DEL DIA D'AHIR =====
// Cada mati, la primera vegada que algu obre qualsevol joc, el Worker mira la
// taula del dia d'ahir i avisa el grup del podi. No cal cap rellotge al
// Cloudflare: ho fa la primera peticio del dia. La marca es posa ABANS
// d'enviar, perque dues peticions alhora no l'avisin dues vegades.
// [nom, fitxer, com s'escriu la puntuacio]. A la Gofra son estrelles (de 0 a
// 5) i hi haura molts empats: mana qui la va acabar abans, i aixi es diu.
const estrelles = p => '★'.repeat(p) + '☆'.repeat(Math.max(0, 5 - p));
const ANUNCIA_DIARI = {
  impremta_dia: ['La Impremta', 'impremta.html', p => xifra(p) + ' punts'],
  gofra_dia:    ['La Gofra',    'gofra.html',    p => estrelles(p) + ' (a igualtat d\'estrelles, mana qui la va acabar abans)'],
};
const curt = (joc, p) => joc === 'gofra_dia' ? estrelles(p) : xifra(p);
function diaMadrid(enrere = 0) {
  const d = new Date(Date.now() - enrere * 86400e3);
  try { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(d); }
  catch { return d.toISOString().slice(0, 10); }
}
const MEDALLES = ['🥇', '🥈', '🥉'];
async function anunciaAhir(env) {
  if (!env.TELEGRAM_TOKEN) return;
  const xat = await env.RECORDS.get('telegram:xat');
  if (!xat) return;
  const ahir = diaMadrid(1);
  for (const [joc, [nom, fitxer, forma]] of Object.entries(ANUNCIA_DIARI)) {
    const marca = 'telegram:anunciat:' + joc;
    if (await env.RECORDS.get(marca) === ahir) continue;
    await env.RECORDS.put(marca, ahir);
    const llista = await llegir(env, joc + ':' + ahir);
    if (!llista.length) continue;
    const podi = llista.slice(0, 3).map((e, i) => MEDALLES[i] + ' <b>' + esc(e.n) + '</b> ' + curt(joc, e.p)).join('\n');
    const text = '☀️ La <b>partida del dia</b> d\'ahir a ' + esc(nom) + ' la va guanyar <b>' + esc(llista[0].n) +
      '</b> amb ' + forma(llista[0].p) + '.\n\n' + podi;
    await telegram(env, 'sendMessage', { chat_id: xat, text, parse_mode: 'HTML', disable_web_page_preview: true,
      reply_markup: { inline_keyboard: [[{ text: '🎮 Juga la d\'avui', url: WEB + fitxer }]] } });
  }
}

const AJUDA =
  'Sóc el bot dels Jocs. 🎮\n\n' +
  '/aqui — avisaré en aquest xat quan algú faci un rècord nou\n' +
  '/prou — deixaré d\'avisar\n' +
  '/records — qui mana a cada joc\n' +
  '/records ram — la taula d\'un joc\n' +
  '/avui — com van les partides del dia (La Impremta i La Gofra)\n\n' +
  'Al xat privat amb mi, el botó «Jocs» obre tota la col·lecció.';

async function ordre(env, msg) {
  const text = (msg.text || '').trim();
  if (!text.startsWith('/')) return;
  // a un grup, les ordres arriben com "/records@NomDelBot ram"
  const [cap, ...resta] = text.split(/\s+/);
  const o = cap.slice(1).split('@')[0].toLowerCase();
  const xat = msg.chat.id;
  const respon = (t) => telegram(env, 'sendMessage', { chat_id: xat, text: t, parse_mode: 'HTML', disable_web_page_preview: true });

  if (o === 'start' || o === 'ajuda' || o === 'help') return respon(AJUDA);
  if (o === 'aqui') {
    await env.RECORDS.put('telegram:xat', String(xat));
    return respon('D\'acord: a partir d\'ara avisaré aquí cada vegada que algú passi a ser el número 1 d\'un joc. 🏆');
  }
  if (o === 'prou') {
    const ara = await env.RECORDS.get('telegram:xat');
    if (ara !== String(xat)) return respon('Aquí no estava avisant de res.');
    await env.RECORDS.delete('telegram:xat');
    return respon('Fet: ja no avisaré dels rècords. Per tornar-hi, /aqui.');
  }
  if (o === 'avui') {
    const avui = diaMadrid(0), parts = [];
    for (const [joc, [nom]] of Object.entries(ANUNCIA_DIARI)) {
      const llista = await llegir(env, joc + ':' + avui);
      parts.push('☀️ <b>' + esc(nom) + '</b>\n' + (llista.length
        ? llista.map((e, i) => (i + 1 + '.').padEnd(4) + esc(e.n) + '  ' + curt(joc, e.p)).join('\n')
        : 'encara no l\'ha acabada ningú'));
    }
    return respon('Les partides del dia, com van avui:\n\n' + parts.join('\n\n'));
  }
  if (o === 'records' || o === 'rècords') {
    if (!resta.length) return respon(await quiMana(env));
    const joc = trobaJoc(resta.join(' '));
    if (!joc) return respon('No sé quin joc és «' + esc(resta.join(' ')) + '». Prova amb el nom, per exemple /records tetris.');
    return respon(await taulaDe(env, joc));
  }
}

async function activa(env, origen) {
  const pagina = (titol, cos) => new Response(
    '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width">' +
    '<body style="font:17px sans-serif;max-width:34em;margin:2em auto;padding:0 1em;line-height:1.5">' +
    '<h2>' + titol + '</h2>' + cos, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  if (!env.TELEGRAM_TOKEN)
    return pagina('Falta la clau del bot',
      '<p>Al tauler de Cloudflare, en aquest Worker, posa la clau que et va donar el @BotFather com a ' +
      '<b>secret</b> amb el nom <b>TELEGRAM_TOKEN</b>, i torna a obrir aquesta pàgina.</p>');
  const jo = await telegram(env, 'getMe', {});
  if (!jo.ok) return pagina('La clau no funciona',
    '<p>Telegram diu que la clau no és bona. Comprova que l\'has copiada sencera, sense espais.</p>');
  const r = await telegram(env, 'setWebhook', {
    url: origen + '/telegram', secret_token: await contrasenya(env),
    allowed_updates: ['message'], drop_pending_updates: true,
  });
  await telegram(env, 'setChatMenuButton', { menu_button: { type: 'web_app', text: 'Jocs', web_app: { url: WEB } } });
  await telegram(env, 'setMyCommands', { commands: [
    { command: 'records', description: 'qui mana a cada joc, o la taula d\'un joc' },
    { command: 'avui', description: 'com van les partides del dia' },
    { command: 'aqui', description: 'avisa en aquest xat dels rècords nous' },
    { command: 'prou', description: 'deixa d\'avisar' },
    { command: 'ajuda', description: 'què sé fer' },
  ]});
  if (!r.ok) return pagina('No s\'ha pogut connectar', '<p>Telegram ha dit: ' + esc(r.description || 'error') + '</p>');
  const nom = esc(jo.result.username);
  return pagina('Fet! 🎉',
    '<p>El bot <b>@' + nom + '</b> ja està connectat.</p><ol>' +
    '<li>Afegeix-lo al grup dels amics.</li>' +
    '<li>Al grup, escriu <b>/aqui</b>. Respondrà que a partir d\'ara avisarà allà.</li>' +
    '<li>Al xat privat amb el bot hi ha el botó <b>Jocs</b>, que obre tota la col·lecció dins de Telegram.</li></ol>');
}

// Una partida del dia. Nomes s'hi pot apuntar el mateix dia (amb un dia de
// marge per les hores de diferencia): les dels dies passats ja estan tancades.
async function diari(request, env, joc, dia) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dia || '') || isNaN(Date.parse(dia + 'T00:00:00Z')))
    return json({ error: 'dia invalid' }, 400);
  const clau = joc + ':' + dia;
  if (request.method === 'GET') return json(await llegir(env, clau));
  if (request.method !== 'POST') return json({ error: 'metode no permes' }, 405);
  const dif = Date.now() - Date.parse(dia + 'T00:00:00Z');
  if (dif < -36 * 3600e3 || dif > 60 * 3600e3) return json({ error: 'aquest dia ja esta tancat' }, 400);
  let cos;
  try { cos = await request.json(); } catch { return json({ error: 'cos invalid' }, 400); }
  const punts = Math.floor(Number(cos.punts));
  if (!Number.isFinite(punts) || punts <= 0 || punts > DIARIS[joc]) return json({ error: 'puntuacio fora de rang' }, 400);
  const entrada = { n: netejaNom(cos.nom), p: punts, t: Date.now() };
  const llista = await llegir(env, clau);
  llista.push(entrada);
  llista.sort((a, b) => b.p - a.p || a.t - b.t);
  const retallada = llista.slice(0, TOP);
  await env.RECORDS.put('joc:' + clau, JSON.stringify(retallada), { expirationTtl: DIES_DIARI * 86400 });
  return json({ top: retallada, posicio: retallada.indexOf(entrada) + 1 });
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    // el podi d'ahir, si encara no s'ha avisat (despres de respondre)
    if (env.TELEGRAM_TOKEN) {
      const a = anunciaAhir(env).catch(() => {});
      if (ctx && ctx.waitUntil) ctx.waitUntil(a); else await a;
    }

    const url = new URL(request.url);
    const parts = url.pathname.split('/').filter(Boolean);   // ['records', 'tetris']

    if (parts[0] === 'telegram') {
      if (parts[1] === 'activa' && request.method === 'GET') return activa(env, url.origin);
      if (!parts[1] && request.method === 'POST') {
        // Nomes Telegram coneix la contrasenya: qualsevol altre, fora.
        if (!env.TELEGRAM_TOKEN ||
            request.headers.get('X-Telegram-Bot-Api-Secret-Token') !== await contrasenya(env))
          return new Response('no', { status: 403 });
        let upd;
        try { upd = await request.json(); } catch { return new Response('ok'); }
        // Si una ordre falla, a Telegram li diem igualment que d'acord: si no,
        // la tornaria a enviar una vegada i una altra.
        if (upd && upd.message && upd.message.chat) { try { await ordre(env, upd.message); } catch {} }
        return new Response('ok');
      }
      return json({ error: 'no' }, 404);
    }

    if (parts[0] !== 'records') {
      return json({ ok: true, servei: 'jocs-records', jocs: Object.keys(JOCS) });
    }

    const joc = parts[1];

    if (joc in DIARIS) return diari(request, env, joc, parts[2]);

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
      let llista = await llegir(env, joc);
      const abans = llista[0] || null;
      if (UNA_PER_NOM.has(joc)) {
        const seva = llista.find(e => e.n === nom);
        // si ja hi era amb mes punts, no canvia res
        if (seva && seva.p >= punts) return json({ top: llista, posicio: 0 });
        llista = llista.filter(e => e.n !== nom);
      }
      llista.push(entrada);
      llista.sort((a, b) => b.p - a.p || a.t - b.t);   // a igualtat de punts, mana qui hi va arribar abans
      const retallada = llista.slice(0, TOP);
      await env.RECORDS.put('joc:' + joc, JSON.stringify(retallada));

      const posicio = retallada.indexOf(entrada) + 1;
      // Numero 1 nou: s'avisa el grup de Telegram. Es fa "despres" (waitUntil):
      // el joc rep la resposta de seguida, i si Telegram falla o va lent, la
      // puntuacio ja esta desada igualment.
      // A les taules d'una entrada per nom, el primer que suma estrelles cada
      // dia seguiria essent el numero 1: nomes s'avisa quan canvia qui mana.
      const mateix = UNA_PER_NOM.has(joc) && abans && abans.n === nom;
      if (posicio === 1 && !mateix && env.TELEGRAM_TOKEN) {
        const avis = avisaRecord(env, joc, entrada, abans).catch(() => {});
        if (ctx && ctx.waitUntil) ctx.waitUntil(avis); else await avis;
      }

      // posicio a la taula, o 0 si no ha entrat entre els deu millors
      return json({ top: retallada, posicio });
    }

    return json({ error: 'metode no permes' }, 405);
  },
};
