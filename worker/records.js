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
  rotllana:          99999,   // el nivell mes alt que has acabat
  temple:            99999,
  abecedari:         99999,   // els encerts acumulats de totes les rodes del dia
  conquesta:          2200,   // partides lliures: 1.000 + 50 per cada ronda que sobra
  colles:            99999,   // les colles trobades, acumulades de totes les partides del dia
  botifarra:         99999,   // les partides lliures guanyades, acumulades
  poble:             99999,   // els pobles del dia endevinats, acumulats
  tresor:             1600,   // 100 per prova (30 menys per pista) i fins a 600 pel temps
};

// Taules on cadascu surt una sola vegada, amb la seva millor puntuacio. A la
// Gofra la puntuacio son les estrelles acumulades i creix cada dia: sense
// aixo, la taula s'ompliria del mateix jugador amb 12, 15, 19 estrelles...
const UNA_PER_NOM = new Set(['gofra', 'rotllana', 'abecedari', 'colles', 'botifarra', 'poble']);

// Les partides del dia: una taula per a cada dia (/records/impremta_dia/2026-10-02).
// No surten a la llista de tots els jocs ni avisen per Telegram: el primer
// que hi juga cada mati ja seria el numero 1, i el grup s'ompliria d'avisos.
// Cada taula s'esborra sola al cap de seixanta dies.
const DIARIS = {
  impremta_dia:  999999999,
  gofra_dia:             5,   // les estrelles d'avui, de 0 a 5
  abecedari_dia:      2740,   // 25 encerts × 100 i, com a molt, els 240 segons
  abecedari_dificil_dia: 3100, // la dificil: 25 × 100 i, com a molt, els 600 segons
  conquesta_dia:      2200,
  colles_dia:          600,   // 100 per colla i, si les trobes totes, 50 per error que sobra
  trencaclosques_dia: 3599,   // 3.600 menys els segons que hi has tardat
  sopa_dia:           3599,   // igual: 3.600 menys els segons (i 30 per pista)
  botifarra_dia:      4608,   // els punts de la parella en 8 mans: com a molt 36 × 2 × 8 cada una
  poble_dia:          1000,   // 1.000 al primer intent... 500 al sise; si no, 400 menys els km
};
const DIES_DIARI = 60;
const TOP = 10;

// Per als missatges de Telegram: com es diu cada joc ("al Ram", "a les Boles")
// i quin fitxer s'obre per jugar-hi. Els identificadors no sempre coincideixen
// amb el nom del fitxer: l'Asteroids, per exemple.
const WEB = 'https://oscarbellosido.github.io/Jocs/';
const FITXA = {
  tetris:          ['Els Blocs', 'als Blocs', 'tetris.html'],
  comecocos:       ['Comecocos',       'al Comecocos',       'comecocos.html'],
  space_invaders:  ['Els Invasors', 'als Invasors', 'space_invaders.html'],
  asteroids:       ["Roques de l'Espai", "a les Roques de l'Espai", 'asteroid_belt_joc.html'],
  breakout:        ['El Trencamaons', 'al Trencamaons', 'breakout.html'],
  missile_command: ['Els Míssils', 'als Míssils', 'missile_command.html'],
  galaxian:        ["L'Esquadra", "a l'Esquadra", 'galaxian.html'],
  frogger:         ['La Granota', 'a la Granota', 'frogger.html'],
  battlezone:      ['Els Tancs', 'als Tancs', 'battlezone.html'],
  centipede:       ['El Centpeus', 'al Centpeus', 'centipede.html'],
  pong:            ['Les Raquetes', 'a les Raquetes', 'pong.html'],
  donkey_kong:     ['El Goril·la', 'al Goril·la', 'donkey_kong.html'],
  crazy_climber:   ["L'Escalador", "a l'Escalador", 'crazy_climber.html'],
  dig_dug:         ["L'Excavador", "a l'Excavador", 'dig_dug.html'],
  defender:        ["L'Escorta", "a l'Escorta", 'defender.html'],
  qbert:           ['La Piràmide', 'a la Piràmide', 'qbert.html'],
  tempest:         ['El Túnel', 'al Túnel', 'tempest.html'],
  galaga:          ["L'Eixam", "a l'Eixam", 'galaga.html'],
  pole_position:   ['La Cursa', 'a la Cursa', 'pole_position.html'],
  moon_patrol:     ['El Totterreny', 'al Totterreny', 'moon_patrol.html'],
  track_field:     ["L'Atletisme", "a l'Atletisme", 'track_field.html'],
  nibbler:         ['El Cuc', 'al Cuc', 'nibbler.html'],
  sindria:         ['Síndria',         'al Síndria',         'sindria.html'],
  amunt:           ['Amunt',           "a l'Amunt",          'amunt.html'],
  boles:           ['Boles',           'a les Boles',        'boles.html'],
  balanca:         ['Balança',         'a la Balança',       'balanca.html'],
  xifres:          ['Xifres',          'al Xifres',          'xifres.html'],
  ram:             ['El Ram',          'al Ram',             'ram.html'],
  lunar_lander:    ["L'Allunatge", "a l'Allunatge", 'lunar_lander.html'],
  garbuix:         ['Garbuix',         'al Garbuix',         'garbuix.html'],
  impremta:        ['La Impremta',     'a la Impremta',      'impremta.html'],
  gofra:           ['La Gofra',        'a la Gofra',         'gofra.html'],
  rotllana:        ['La Rotllana',     'a la Rotllana',      'rotllana.html'],
  temple:          ['El Temple',       'al Temple',          'temple.html'],
  abecedari:       ["L'Abecedari",     "a l'Abecedari",      'abecedari.html'],
  conquesta:       ['La Conquesta',    'a la Conquesta',     'conquesta.html'],
  colles:          ['Les Quatre Colles', 'a les Quatre Colles', 'colles.html'],
  botifarra:       ['La Botifarra',    'a la Botifarra',     'botifarra.html'],
  poble:           ['El Poble del Dia', 'al Poble del Dia',  'poble.html'],
  tresor:          ['El Tresor dels Templers', 'al Tresor dels Templers', 'tresor.html'],
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

// Als jocs on el numero no son punts, que vol dir. A la Rotllana, «ha fet 37»
// no s'entendria: son 37 nivells.
const UNITAT = { rotllana: 'nivells', gofra: 'estrelles', abecedari: 'encerts', colles: 'colles', botifarra: 'partides guanyades', poble: 'pobles endevinats' };
const quant = (joc, p) => xifra(p) + (UNITAT[joc] ? ' ' + UNITAT[joc] : '');

// Quan algu passa a ser el numero 1 d'un joc, s'avisa el grup.
async function avisaRecord(env, joc, entrada, abans) {
  if (!env.TELEGRAM_TOKEN) return;
  const xat = await env.RECORDS.get('telegram:xat');
  if (!xat) return;
  const [nom, al, fitxer] = FITXA[joc] || [joc, 'a ' + joc, ''];
  const qui = '<b>' + esc(entrada.n) + '</b>', punts = '<b>' + quant(joc, entrada.p) + '</b>';
  let text;
  if (!abans) text = '🏆 Primer rècord ' + esc(al) + ': ' + qui + ' amb ' + punts;
  else if (abans.n === entrada.n)
    text = '🏆 ' + qui + ' millora el seu rècord ' + esc(al) + ': ' + punts + ' (abans ' + quant(joc, abans.p) + ')';
  else
    text = '🏆 ' + qui + ' ha fet ' + punts + ' ' + esc(al) + ' i passa davant de <b>' +
           esc(abans.n) + '</b> (' + quant(joc, abans.p) + ')';
  const dades = { chat_id: xat, text, parse_mode: 'HTML', disable_web_page_preview: true };
  if (fitxer) dades.reply_markup = { inline_keyboard: [[{ text: '🎮 Juga ' + al, url: WEB + fitxer }]] };
  await telegram(env, 'sendMessage', dades);
}

// "/records ram", "/records lunar", "/records@ElBot tetris": es busca el joc
// pel nom o pel principi del nom, sense fer cas d'accents ni majuscules.
const pla = t => String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
// (i amb l'article o sense: «/records blocs» troba Els Blocs)
const senseArticle = nom => pla(String(nom).replace(/^(els|les|el|la|l')\s*/i, ''));
function trobaJoc(t) {
  const q = pla(t);
  if (!q) return null;
  const noms = id => [pla(id), pla(FITXA[id][0]), senseArticle(FITXA[id][0])];
  for (const id of Object.keys(JOCS)) if (noms(id).some(n => n === q)) return id;
  for (const id of Object.keys(JOCS)) if (noms(id).some(n => n.startsWith(q))) return id;
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
const encerts = p => Math.min(25, Math.floor(p / 100));
const estrelles = p => '★'.repeat(p) + '☆'.repeat(Math.max(0, 5 - p));
const ANUNCIA_DIARI = {
  impremta_dia: ['La Impremta', 'impremta.html', p => xifra(p) + ' punts'],
  gofra_dia:    ['La Gofra',    'gofra.html',    p => estrelles(p) + ' (a igualtat d\'estrelles, mana qui la va acabar abans)'],
  // A l'Abecedari, 100 punts per encert i els segons que sobren. Els segons
  // nomes hi son si l'acabes sencera, o sigui que passat de 2.500 son 25.
  abecedari_dia: ["L'Abecedari", 'abecedari.html', p => encerts(p) + ' encerts (' + xifra(p) + ' punts)'],
  abecedari_dificil_dia: ["L'Abecedari difícil", 'abecedari.html', p => encerts(p) + ' encerts (' + xifra(p) + ' punts)'],
  // A Les Quatre Colles, 100 per colla; passat de 400 les has trobades totes
  // i la resta son els errors que et van sobrar (50 cadascun)
  colles_dia: ['Les Quatre Colles', 'colles.html', p => p >= 400
    ? 'les 4 colles ' + (p === 600 ? 'sense cap error' : 'i ' + (4 - (p - 400) / 50) + ((p - 400) / 50 === 3 ? ' error' : ' errors')) + ' (' + p + ' punts)'
    : Math.floor(p / 100) + (p < 200 ? ' colla' : ' colles') + ' de 4'],
  // Al Trencaclosques la puntuacio es 3.600 menys els segons: es diu el temps
  trencaclosques_dia: ['El Trencaclosques', 'trencaclosques.html', p => 'un temps de ' + temps(p)],
  sopa_dia: ['La Sopa de Lletres', 'sopa.html', p => 'un temps de ' + temps(p)],
  // A la Botifarra, els punts que va fer la parella en les 8 mans del dia
  botifarra_dia: ['La Botifarra', 'botifarra.html', p => xifra(p) + ' punts en 8 mans'],
  // Al Poble del Dia, 1.000 punts al primer intent i 100 menys per cada
  // intent de mes; per sota de 500 no el va trobar, i son 400 menys els km
  // del que s'hi va quedar mes a prop
  poble_dia: ['El Poble del Dia', 'poble.html', p => p >= 500
    ? 'el poble al ' + ordinal(11 - p / 100) + ' intent'
    : 'el més a prop: a ' + (400 - p) + ' km (no el va trobar ningú)'],
  conquesta_dia: ['La Conquesta', 'conquesta.html', p => xifra(p) + ' punts' + (p >= 1000 ? ' (va conquerir Catalunya a la ronda ' + (25 - (p - 1000) / 50) + ')' : '')],
};
const temps = p => { const s = 3600 - p; return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
const ordinal = n => n + (n === 1 ? 'r' : n === 2 ? 'n' : n === 3 ? 'r' : n === 4 ? 't' : 'è');
const curt = (joc, p) => joc === 'gofra_dia' ? estrelles(p) : (joc === 'trencaclosques_dia' || joc === 'sopa_dia') ? temps(p)
  : joc === 'poble_dia' ? (p >= 500 ? (11 - p / 100) + '/6' : '✗ ' + (400 - p) + ' km') : xifra(p);
// «a La Impremta», pero «al Trencaclosques» i «al Poble del Dia»
const aJoc = nom => nom.startsWith('El ') ? 'al ' + nom.slice(3) : 'a ' + nom;
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
    const text = '☀️ La <b>partida del dia</b> d\'ahir ' + esc(aJoc(nom)) + ' la va guanyar <b>' + esc(llista[0].n) +
      '</b> amb ' + forma(llista[0].p) + '.\n\n' + podi;
    await telegram(env, 'sendMessage', { chat_id: xat, text, parse_mode: 'HTML', disable_web_page_preview: true,
      reply_markup: { inline_keyboard: [[{ text: '🎮 Juga la d\'avui', url: WEB + fitxer }]] } });
  }
}

// ===== ELS JOCS NOUS =====
// En Carles va demanar que, quan surti un joc nou, s'avisi. Quan es torna a
// enganxar el Worker amb un joc nou a les llistes, la primera visita fa que
// el bot ho digui al grup, amb un botó per anar-hi. Es compara amb els
// fitxers ja anunciats (telegram:jocs-anunciats). La primera vegada encara
// no hi ha aquesta llista: llavors es fa amb tots menys ESTRENES, que són els
// que van sortir abans que el bot sabés fer-ho i encara no s'han anunciat.
const ESTRENES = ['sopa.html', 'tresor.html'];
function totsElsJocs() {
  const m = new Map();
  for (const [nom, , fitxer] of Object.values(FITXA)) if (fitxer) m.set(fitxer, nom);
  for (const [nom, fitxer] of Object.values(ANUNCIA_DIARI)) if (!m.has(fitxer)) m.set(fitxer, nom);
  return m;
}
async function anunciaNous(env) {
  if (!env.TELEGRAM_TOKEN) return;
  const xat = await env.RECORDS.get('telegram:xat');
  if (!xat) return;                       // sense grup, s'espera: ja ho dirà quan n'hi hagi
  const tots = totsElsJocs(), vell = await env.RECORDS.get('telegram:jocs-anunciats');
  const fets = vell ? JSON.parse(vell) : [...tots.keys()].filter(f => !ESTRENES.includes(f));
  const nous = [...tots.keys()].filter(f => !fets.includes(f));
  if (!nous.length) { if (!vell) await env.RECORDS.put('telegram:jocs-anunciats', JSON.stringify(fets)); return; }
  // s'apunta abans d'enviar, que dues visites alhora no l'anunciïn dues vegades
  await env.RECORDS.put('telegram:jocs-anunciats', JSON.stringify([...fets, ...nous]));
  const noms = nous.map(f => '<b>' + esc(tots.get(f)) + '</b>');
  const llista = noms.length === 1 ? noms[0] : noms.slice(0, -1).join(', ') + ' i ' + noms[noms.length - 1];
  const text = '🆕 ' + (nous.length === 1 ? 'Hi ha un <b>joc nou</b>' : 'Hi ha <b>jocs nous</b>') + ' a la col·lecció: ' + llista + '. Ja s\'hi pot jugar!';
  await telegram(env, 'sendMessage', { chat_id: xat, text, parse_mode: 'HTML', disable_web_page_preview: true,
    reply_markup: { inline_keyboard: nous.map(f => [{ text: '🎮 ' + tots.get(f), url: WEB + f }]) } });
}

// ===== LA LLIGA DE LA SETMANA =====
// Cada partida del dia dona punts de lliga: el primer d'aquell dia en treu
// 10, el segon 8, i aixi fins a 1; qui l'ha jugada i no ha entrat als 10
// millors (ho diu 'jugat:'), 1 punt per haver-hi jugat. La setmana va de
// dilluns a diumenge (hora de Madrid), i es calcula de les taules del dia,
// que ja hi son: els jocs no han de fer res de nou. Cada dilluns, el primer
// que obre un joc fa que el bot anunciï al grup qui va guanyar la setmana.
const PUNTS_LLIGA = [10, 8, 6, 5, 4, 3, 2, 1, 1, 1];
const NOM_DIARI = joc => (ANUNCIA_DIARI[joc] || [joc])[0];
function sumaDies(dia, n) { return new Date(Date.parse(dia + 'T12:00:00Z') + n * 86400e3).toISOString().slice(0, 10); }
// el dilluns de la setmana d'aquest dia
function dillunsDe(dia) { return sumaDies(dia, -((new Date(dia + 'T12:00:00Z').getUTCDay() + 6) % 7)); }
async function lliga(env, dilluns, fins) {
  const dies = [];
  for (let d = dilluns; d <= fins; d = sumaDies(d, 1)) dies.push(d);
  const jocs = Object.keys(DIARIS), feina = [];
  for (const dia of dies) for (const joc of jocs) feina.push((async () => {
    const clau = joc + ':' + dia;
    const [llista, jugatRaw] = await Promise.all([llegir(env, clau), env.RECORDS.get('jugat:' + clau)]);
    let jugat = [];
    try { jugat = JSON.parse(jugatRaw || '[]'); } catch {}
    return { joc, dia, llista, jugat };
  })());
  const taules = await Promise.all(feina), punts = {};
  const apunta = (n, p, primer) => {
    const e = punts[n] || (punts[n] = { n, p: 0, partides: 0, primers: 0 });
    e.p += p; e.partides++; if (primer) e.primers++;
  };
  for (const { llista, jugat } of taules) {
    llista.forEach((e, i) => apunta(e.n, PUNTS_LLIGA[i] || 1, i === 0));
    for (const n of jugat) if (!llista.some(e => e.n === n)) apunta(n, 1, false);
  }
  const classificacio = Object.values(punts).sort((a, b) => b.p - a.p || b.primers - a.primers || a.n.localeCompare(b.n));
  const avui = {};
  for (const { joc, dia, llista } of taules) if (dia === fins) avui[joc] = llista[0] || null;
  return { setmana: dilluns, fins, classificacio, avui };
}
// ===== LES MEDALLES DE SEMPRE =====
// Cada dilluns es tanca la setmana passada i el podi s'apunta per sempre al
// palmares (`lliga:palmares`): la copa al primer, la plata i el bronze als
// altres dos. Es fa amb o sense bot, a la primera peticio del dia, i una
// setmana cada vegada (si en falta mes d'una, la seguent peticio fa la
// seguent), que cada setmana son fins a 140 lectures. La primera que compta
// es la del 26 d'octubre del 2026, la que el bot ja va anunciar.
const PRIMERA_SETMANA = '2026-10-26';
async function llegirPalmares(env) {
  let llista = [];
  try { llista = JSON.parse(await env.RECORDS.get('lliga:palmares') || '[]'); } catch {}
  if (!Array.isArray(llista)) llista = [];
  // si dues peticions alhora han tancat la mateixa setmana, una sola vegada
  const vistes = new Set();
  return llista.filter(e => e && e.s && !vistes.has(e.s) && vistes.add(e.s)).sort((a, b) => a.s < b.s ? -1 : 1);
}
async function tancaSetmana(env) {
  const passada = sumaDies(dillunsDe(diaMadrid(0)), -7);
  const llista = await llegirPalmares(env);
  const ultima = llista.length ? llista[llista.length - 1].s : sumaDies(PRIMERA_SETMANA, -7);
  if (ultima >= passada) return;
  const s = sumaDies(ultima, 7);
  const l = await lliga(env, s, sumaDies(s, 6));
  llista.push({ s, podi: l.classificacio.slice(0, 3).map(e => ({ n: e.n, p: e.p })) });
  await env.RECORDS.put('lliga:palmares', JSON.stringify(llista));
}
// el palmares de cadascu: copes (primer), plates i bronzes
function medalles(llista) {
  const m = {};
  for (const { podi } of llista) (podi || []).forEach((e, i) => {
    const t = m[e.n] || (m[e.n] = { n: e.n, copes: 0, plates: 0, bronzes: 0 });
    t[['copes', 'plates', 'bronzes'][i]]++;
  });
  return Object.values(m).sort((a, b) => b.copes - a.copes || b.plates - a.plates || b.bronzes - a.bronzes || a.n.localeCompare(b.n));
}
const textMedalles = t => [t.copes && '🏆' + t.copes, t.plates && '🥈' + t.plates, t.bronzes && '🥉' + t.bronzes].filter(Boolean).join(' ');

async function anunciaLliga(env) {
  if (!env.TELEGRAM_TOKEN) return;
  const xat = await env.RECORDS.get('telegram:xat');
  if (!xat) return;
  const passada = sumaDies(dillunsDe(diaMadrid(0)), -7);
  const marca = 'telegram:anunciat:lliga';
  if (await env.RECORDS.get(marca) === passada) return;
  await env.RECORDS.put(marca, passada);
  const l = await lliga(env, passada, sumaDies(passada, 6));
  if (!l.classificacio.length) return;
  const g = l.classificacio[0];
  const podi = l.classificacio.slice(0, 3).map((e, i) => MEDALLES[i] + ' <b>' + esc(e.n) + '</b> ' + e.p + ' punts').join('\n');
  const meu = medalles(await llegirPalmares(env)).find(t => t.n === g.n);
  const copes = meu && meu.copes > 1 ? '\n\n🏆 És la seva copa número ' + meu.copes + '.' : '';
  const text = '🏆 La <b>lliga de la setmana</b> la guanya <b>' + esc(g.n) + '</b> amb ' + g.p + ' punts' +
    (g.primers ? ' (' + g.primers + (g.primers === 1 ? ' partida del dia guanyada' : ' partides del dia guanyades') + ')' : '') + '.\n\n' + podi +
    copes + '\n\nAvui en comença una de nova: totes les partides del dia hi compten.';
  await telegram(env, 'sendMessage', { chat_id: xat, text, parse_mode: 'HTML', disable_web_page_preview: true,
    reply_markup: { inline_keyboard: [[{ text: '🎮 Els jocs d\'avui', url: WEB }]] } });
}
function textLliga(l) {
  if (!l.classificacio.length) return '🏆 La lliga d\'aquesta setmana encara no ha començat: ningú no ha jugat cap partida del dia.';
  return '🏆 <b>La lliga de la setmana</b> (des del dilluns ' + Number(l.setmana.slice(8)) + ')\n' +
    l.classificacio.slice(0, 10).map((e, i) => (i + 1 + '.').padEnd(4) + esc(e.n) + '  ' + e.p + ' punts').join('\n') +
    '\n\nCada partida del dia: el primer 10 punts, el segon 8, el tercer 6... i 1 per haver-hi jugat.';
}

const AJUDA =
  'Sóc el bot dels Jocs. 🎮\n\n' +
  '/aqui — avisaré en aquest xat quan algú faci un rècord nou\n' +
  '/prou — deixaré d\'avisar\n' +
  '/records — qui mana a cada joc\n' +
  '/records ram — la taula d\'un joc\n' +
  '/lliga — la classificació de la setmana\n' +
  '/avui — com van les partides del dia (La Impremta, La Gofra, L\'Abecedari, la seva difícil, La Conquesta, Les Quatre Colles, El Trencaclosques, La Botifarra, El Poble del Dia i La Sopa de Lletres)\n\n' +
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
  if (o === 'lliga') {
    const avui = diaMadrid(0);
    const pal = medalles(await llegirPalmares(env));
    return respon(textLliga(await lliga(env, dillunsDe(avui), avui)) + (pal.length
      ? '\n\n🏆 <b>Les medalles de sempre</b>\n' + pal.slice(0, 10).map(t => esc(t.n) + '  ' + textMedalles(t)).join('\n') : ''));
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
    { command: 'lliga', description: 'la classificació de la setmana' },
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
  // 0 vol dir que hi has jugat i no has fet res (la Gofra sense acabar, cap
  // colla...): no entra a la taula, pero queda apuntat que hi has jugat, que
  // a la lliga de la setmana val un punt
  if (!Number.isFinite(punts) || punts < 0 || punts > DIARIS[joc]) return json({ error: 'puntuacio fora de rang' }, 400);
  const entrada = { n: netejaNom(cos.nom), p: punts, t: Date.now() };
  const llista = await llegir(env, clau);
  // Nomes compta la primera partida del dia de cada inicials. Al mateix mobil
  // ja no es pot tornar a jugar, pero des d'un altre (o des de l'ordinador)
  // si: en Carles va veure que algu la podia fer dues vegades. Es guarda qui
  // ja hi ha jugat a part de la taula, perque la taula nomes te els 10 millors.
  const clauJugat = 'jugat:' + clau;
  let jugat = [];
  try { jugat = JSON.parse(await env.RECORDS.get(clauJugat) || '[]'); } catch {}
  if (jugat.includes(entrada.n) || llista.some(e => e.n === entrada.n))
    return json({ top: llista, posicio: 0, repetida: true });
  jugat.push(entrada.n);
  await env.RECORDS.put(clauJugat, JSON.stringify(jugat), { expirationTtl: DIES_DIARI * 86400 });
  if (!punts) return json({ top: llista, posicio: 0, jugat: true });
  llista.push(entrada);
  llista.sort((a, b) => b.p - a.p || a.t - b.t);
  const retallada = llista.slice(0, TOP);
  await env.RECORDS.put('joc:' + clau, JSON.stringify(retallada), { expirationTtl: DIES_DIARI * 86400 });
  return json({ top: retallada, posicio: retallada.indexOf(entrada) + 1 });
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    // el podi d'ahir, si encara no s'ha avisat (despres de respondre), els jocs nous
    // i, els dilluns, la setmana passada al palmares (amb bot o sense)
    {
      const a = tancaSetmana(env).catch(() => {}).then(() => env.TELEGRAM_TOKEN &&
        anunciaAhir(env).catch(() => {}).then(() => anunciaLliga(env)).catch(() => {})
          .then(() => anunciaNous(env))).catch(() => {});
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

    // la lliga de la setmana i, de cada partida del dia, qui guanya avui
    if (parts[0] === 'lliga' && request.method === 'GET') {
      const avui = diaMadrid(0);
      const l = await lliga(env, dillunsDe(avui), avui);
      l.palmares = medalles(await llegirPalmares(env));
      return json(l);
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
