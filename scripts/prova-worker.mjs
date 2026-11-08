import worker from '../worker/records.js';

// KV de mentida, per provar sense desplegar res
const store = new Map(), meta = new Map();
let escriptures = 0;
const env = { ESPERA_RECLAMA: 30, RECORDS: {
  get: async k => (store.has(k) ? store.get(k) : null),
  getWithMetadata: async k => (store.has(k) ? { value: store.get(k), metadata: meta.get(k) || null } : { value: null, metadata: null }),
  put: async (k, v, o) => { escriptures++; store.set(k, v); if (o && o.metadata) meta.set(k, o.metadata); else meta.delete(k); },
  delete: async k => { store.delete(k); meta.delete(k); },
  // com el de debò: de 2 en 2 aquí, perquè es provi el cursor
  list: async ({ prefix = '', cursor } = {}) => {
    const totes = [...store.keys()].filter(k => k.startsWith(prefix)).sort();
    const i = cursor ? Number(cursor) : 0, tros = totes.slice(i, i + 2);
    const fi = i + 2 >= totes.length;
    return { keys: tros.map(name => ({ name, metadata: meta.get(name) })), list_complete: fi, cursor: fi ? undefined : String(i + 2) };
  },
}};
const call = async (method, path, body) => {
  const r = await worker.fetch(new Request('https://x.dev' + path, {
    method, headers: body ? {'Content-Type':'application/json'} : {},
    body: body === undefined ? undefined : JSON.stringify(body),
  }), env);
  let data = null;
  try { data = await r.json(); } catch {}
  return { status: r.status, data, cors: r.headers.get('Access-Control-Allow-Origin') };
};
let malament = 0;
const ok = (c, msg) => { if (!c) malament++; console.log(`${c ? '✓' : '✗'} ${msg}`); };

// 1. llista buida al principi
let r = await call('GET', '/records/tetris');
ok(r.status === 200 && Array.isArray(r.data) && r.data.length === 0, 'joc nou: llista buida');

// 2. enviar una puntuacio
r = await call('POST', '/records/tetris', { nom: 'CRE', punts: 4200 });
ok(r.status === 200 && r.data.top[0].n === 'CRE' && r.data.top[0].p === 4200 && r.data.posicio === 1,
   'primera puntuacio: entra al numero 1');

// 3. ordena de mes a menys
await call('POST', '/records/tetris', { nom: 'ABC', punts: 9000 });
await call('POST', '/records/tetris', { nom: 'XYZ', punts: 100 });
r = await call('GET', '/records/tetris');
ok(r.data.map(x => x.p).join() === '9000,4200,100', 'ordenades de mes a menys');

// 4. nomes es guarden les 10 millors
for (let i = 0; i < 20; i++) await call('POST', '/records/tetris', { nom: 'B' + i, punts: 1000 + i });
r = await call('GET', '/records/tetris');
ok(r.data.length === 10, 'nomes en guarda 10');
ok(r.data.every((x, i, a) => i === 0 || a[i-1].p >= x.p), 'segueixen ordenades');

// 5. una puntuacio dolenta no entra i ho diu
r = await call('POST', '/records/tetris', { nom: 'ZZZ', punts: 5 });
ok(r.data.posicio === 0 && !r.data.top.some(x => x.n === 'ZZZ'), 'puntuacio fluixa: no entra (posicio 0)');

// 6. validacions
r = await call('POST', '/records/tetris', { nom: 'AAA', punts: 99999999 });
ok(r.status === 400, 'rebutja punts per sobre del maxim del joc');
r = await call('POST', '/records/breakout', { nom: 'AAA', punts: 900 });
ok(r.status === 400, 'Breakout: rebutja mes de 896, que es el maxim real');
r = await call('POST', '/records/breakout', { nom: 'AAA', punts: 896 });
ok(r.status === 200, 'Breakout: accepta exactament 896');
r = await call('POST', '/records/tetris', { nom: 'AAA', punts: -5 });
ok(r.status === 400, 'rebutja punts negatius');
r = await call('POST', '/records/tetris', { nom: 'AAA', punts: 'molts' });
ok(r.status === 400, 'rebutja punts que no son un numero');
r = await call('POST', '/records/inventat', { nom: 'AAA', punts: 10 });
ok(r.status === 404, 'rebutja un joc que no existeix');
r = await call('POST', '/records/tetris', undefined);
ok(r.status === 400, 'rebutja un cos buit');

// 7. neteja del nom
await call('POST', '/records/pong', { nom: '  cr€!e-xtra  ', punts: 50 });
r = await call('GET', '/records/pong');
ok(r.data[0].n === 'CRE', 'el nom es neteja i es retalla a tres lletres: ' + r.data[0].n);
await call('POST', '/records/pong', { nom: '', punts: 40 });
r = await call('GET', '/records/pong');
ok(r.data.some(x => x.n === 'AAA'), 'sense nom, hi posa AAA');

// 8. tots els jocs de cop
// no hi posem un numero a pel: cada joc nou el canviaria
const fitxerWorker = new URL('../worker/records.js', import.meta.url);
const quantsJocs = (await import('fs')).readFileSync(fitxerWorker,'utf8')
  .match(/const JOCS = \{([\s\S]*?)\}/)[1].split('\n').filter(l => /^\s*\w+:/.test(l)).length;
r = await call('GET', '/records');
ok(r.status === 200 && Object.keys(r.data).length === quantsJocs && r.data.tetris.length === 10,
   `GET /records retorna els ${quantsJocs} jocs`);

// 9. CORS i metodes
r = await call('OPTIONS', '/records/tetris');
ok(r.status === 204, 'respon al preflight OPTIONS');
ok(r.cors === '*', 'envia la capcalera de CORS');
r = await call('DELETE', '/records/tetris');
ok(r.status === 405, 'rebutja metodes que no toquen');

// 10. si el valor guardat es corromp, no peta
store.set('joc:galaxian', 'aixo no es json');
r = await call('GET', '/records/galaxian');
ok(r.status === 200 && Array.isArray(r.data), 'aguanta un valor corromput al KV');


// ===== 11. TELEGRAM =====
// Un Telegram de mentida que apunta tot el que se li envia. Res no surt a
// internet.
const enviats = [];
let telegramFalla = false;
globalThis.fetch = async (u, opts) => {
  const metode = String(u).split('/').pop();
  enviats.push({ url: String(u), metode, cos: opts && opts.body ? JSON.parse(opts.body) : null });
  if (telegramFalla) throw new Error('sense xarxa');
  if (metode === 'getMe') return new Response(JSON.stringify({ ok: true, result: { username: 'JocsBot' } }));
  return new Response(JSON.stringify({ ok: true, result: true }));
};
const TOKEN = '123456:clau-de-prova';
const envTg = { RECORDS: env.RECORDS, TELEGRAM_TOKEN: TOKEN, ESPERA_RECLAMA: 30 };
const crida = async (e, method, path, body, capcaleres = {}) => {
  const r = await worker.fetch(new Request('https://jocs-records.x.dev' + path, {
    method, headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...capcaleres },
    body: body === undefined ? undefined : JSON.stringify(body),
  }), e);
  const text = await r.text();
  let data = null; try { data = JSON.parse(text); } catch {}
  return { status: r.status, data, text };
};
const missatges = () => enviats.filter(x => x.metode === 'sendMessage');
// els jocs ja anunciats: tots, que l'avís dels jocs nous (es prova a part,
// al final) no es fiqui pel mig de les altres proves
const fsTots = await import('fs');
const totsHtml = fsTots.readdirSync(new URL('..', import.meta.url)).filter(f => f.endsWith('.html'));
store.set('telegram:jocs-anunciats', JSON.stringify(totsHtml));

// sense clau no s'envia res, i tot va com abans
r = await crida(env, 'POST', '/records/ram', { nom: 'ZZZ', punts: 10 });
ok(r.status === 200 && enviats.length === 0, 'sense la clau de Telegram, un rècord no envia res a ningú');
store.delete('joc:ram');

r = await crida(env, 'GET', '/telegram/activa');
ok(r.status === 200 && /Falta la clau/.test(r.text), 'activar sense clau: diu que falta la clau, en una pàgina que es llegeix');

// activar
r = await crida(envTg, 'GET', '/telegram/activa');
const hook = enviats.find(x => x.metode === 'setWebhook');
ok(r.status === 200 && /@JocsBot/.test(r.text), 'activar: la pàgina diu que el bot @JocsBot ja està connectat');
ok(hook && hook.cos.url === 'https://jocs-records.x.dev/telegram' && hook.cos.secret_token,
   'activar: diu a Telegram on ha d\'enviar els missatges, amb contrasenya');
const menu = enviats.find(x => x.metode === 'setChatMenuButton');
ok(menu && menu.cos.menu_button.type === 'web_app' && menu.cos.menu_button.web_app.url === 'https://oscarbellosido.github.io/Jocs/',
   'activar: posa el botó «Jocs» que obre la web dins de Telegram');
ok(enviats.some(x => x.metode === 'setMyCommands'), 'activar: registra la llista d\'ordres');
ok(!enviats.some(x => JSON.stringify(x.cos || '').includes(TOKEN)), 'la clau no viatja dins de cap missatge');
const SECRET = hook.cos.secret_token;

// només Telegram pot parlar amb el Worker
const msg = (text, chat = -1001) => ({ update_id: 1, message: { message_id: 1, text, chat: { id: chat, type: 'supergroup' } } });
r = await crida(envTg, 'POST', '/telegram', msg('/aqui'));
ok(r.status === 403 && !store.has('telegram:xat'), 'un missatge sense la contrasenya de Telegram: fora');
r = await crida(envTg, 'POST', '/telegram', msg('/aqui'), { 'X-Telegram-Bot-Api-Secret-Token': 'inventada' });
ok(r.status === 403 && !store.has('telegram:xat'), 'amb una contrasenya inventada: fora');

const tg = (text, chat) => crida(envTg, 'POST', '/telegram', msg(text, chat), { 'X-Telegram-Bot-Api-Secret-Token': SECRET });

// /aqui
enviats.length = 0;
r = await tg('/aqui@JocsBot');
ok(r.status === 200 && store.get('telegram:xat') === '-1001', '/aqui al grup: a partir d\'ara avisa en aquell grup');
ok(missatges().length === 1 && missatges()[0].cos.chat_id === -1001, '/aqui: respon al grup que d\'acord');

// els avisos
enviats.length = 0;
await crida(envTg, 'POST', '/records/ram', { nom: 'CAR', punts: 4320 });
let m = missatges()[0];
ok(m && m.cos.chat_id === '-1001' && /Primer rècord al Ram/.test(m.cos.text) && /CAR/.test(m.cos.text) && /4\.320/.test(m.cos.text),
   'primer rècord d\'un joc: «' + (m ? m.cos.text.replace(/<[^>]+>/g, '') : '—') + '»');
ok(m && m.cos.reply_markup.inline_keyboard[0][0].url === 'https://oscarbellosido.github.io/Jocs/ram.html',
   'l\'avís porta el botó per anar a jugar a aquell joc');

enviats.length = 0;
await crida(envTg, 'POST', '/records/ram', { nom: 'MAR', punts: 5100 });
m = missatges()[0];
ok(m && /MAR.*5\.100.*passa davant de.*CAR.*4\.320/.test(m.cos.text),
   'algú passa davant: «' + (m ? m.cos.text.replace(/<[^>]+>/g, '') : '—') + '»');

// a la Rotllana el numero son nivells, i el missatge ho ha de dir
enviats.length = 0;
await crida(envTg, 'POST', '/records/rotllana', { nom: 'CAR', punts: 12 });
await crida(envTg, 'POST', '/records/rotllana', { nom: 'MAR', punts: 37 });
m = missatges()[1];
ok(m && /MAR.*37 nivells.*a la Rotllana.*passa davant de.*CAR.*12 nivells/.test(m.cos.text),
   'a la Rotllana diu nivells: «' + (m ? m.cos.text.replace(/<[^>]+>/g, '') : '—') + '»');
enviats.length = 0;
await crida(envTg, 'POST', '/records/rotllana', { nom: 'MAR', punts: 38 });
ok(missatges().length === 0, 'a la Rotllana, passar un nivell més quan ja manes no avisa ningú');

enviats.length = 0;
await crida(envTg, 'POST', '/records/ram', { nom: 'MAR', punts: 6000 });
m = missatges()[0];
ok(m && /MAR.*millora el seu rècord.*6\.000.*abans 5\.100/.test(m.cos.text),
   'es millora a si mateix: «' + (m ? m.cos.text.replace(/<[^>]+>/g, '') : '—') + '»');

enviats.length = 0;
await crida(envTg, 'POST', '/records/ram', { nom: 'JOA', punts: 5500 });
ok(missatges().length === 0, 'un segon lloc no avisa: només el número 1, que si no seria massa');

enviats.length = 0;
await crida(envTg, 'POST', '/records/track_field', { nom: 'CAR', punts: 80000 });
m = missatges()[0];
ok(m && /a l'Atletisme/.test(m.cos.text) && !/Track/.test(m.cos.text), "el bot diu els noms nous dels clàssics, sense les marques (a l'Atletisme)");

// si Telegram falla, el rècord es desa igualment
telegramFalla = true;
r = await crida(envTg, 'POST', '/records/ram', { nom: 'ERR', punts: 7000 });
telegramFalla = false;
ok(r.status === 200 && r.data.posicio === 1 && JSON.parse(store.get('joc:ram'))[0].n === 'ERR',
   'si Telegram no respon, el rècord es desa igualment i el joc no se n\'assabenta');

// /records
enviats.length = 0;
await tg('/records ram');
m = missatges()[0];
ok(m && /El Ram/.test(m.cos.text) && /1\.\s+ERR\s+7\.000/.test(m.cos.text) && /MAR\s+6\.000/.test(m.cos.text),
   '/records ram: respon amb la taula');
enviats.length = 0;
await tg('/records@JocsBot lunar');
ok(missatges()[0] && /L'Allunatge/.test(missatges()[0].cos.text), "/records lunar: encara troba l'Allunatge pel nom de sempre (lunar_lander)");
enviats.length = 0;
await tg('/records blocs');
ok(missatges()[0] && /Els Blocs/.test(missatges()[0].cos.text), "/records blocs troba Els Blocs, sense haver de dir l'article");
enviats.length = 0;
await tg('/records síndria');
ok(missatges()[0] && /Síndria/.test(missatges()[0].cos.text), '/records síndria: amb accent també');
enviats.length = 0;
await tg('/records patata');
ok(missatges()[0] && /No sé quin joc/.test(missatges()[0].cos.text), '/records d\'un joc que no existeix: ho diu');
enviats.length = 0;
await tg('/records');
ok(missatges()[0] && /Qui mana/.test(missatges()[0].cos.text) && /El Ram: <b>ERR<\/b> 7\.000/.test(missatges()[0].cos.text),
   '/records sol: qui mana a cada joc');

// el que no és una ordre, ni es contesta
enviats.length = 0;
r = await tg('hola a tothom');
ok(r.status === 200 && enviats.length === 0, 'el que s\'escriu al grup que no és una ordre, el bot ni ho mira');

// /prou
enviats.length = 0;
await tg('/prou', -2002);
ok(store.get('telegram:xat') === '-1001' && /no estava avisant/.test(missatges()[0].cos.text),
   '/prou des d\'un altre xat: no toca res');
await tg('/prou');
ok(!store.has('telegram:xat'), '/prou al grup: deixa d\'avisar');
enviats.length = 0;
await crida(envTg, 'POST', '/records/ram', { nom: 'NOU', punts: 9000 });
ok(missatges().length === 0, 'després de /prou, un rècord ja no avisa');

// la partida del dia de La Impremta: una taula per a cada dia
{
  const avui = new Date().toISOString().slice(0, 10);
  const fa = d => new Date(Date.now() - d * 86400e3).toISOString().slice(0, 10);
  let r = await call('GET', '/records/impremta_dia/' + avui);
  ok(r.status === 200 && Array.isArray(r.data) && !r.data.length, 'partida del dia: la taula d\'avui comença buida');
  r = await call('POST', '/records/impremta_dia/' + avui, { nom: 'CRE', punts: 5400 });
  ok(r.status === 200 && r.data.posicio === 1, 'partida del dia: s\'hi apunta qui juga avui');
  r = await call('GET', '/records/impremta_dia/' + fa(1));
  ok(r.status === 200 && !r.data.length, 'partida del dia: la d\'ahir és una altra taula');
  r = await call('POST', '/records/impremta_dia/' + fa(5), { nom: 'TRA', punts: 99 });
  ok(r.status === 400, 'partida del dia: a la d\'un dia passat ja no s\'hi pot apuntar ningú');
  r = await call('GET', '/records/impremta_dia/ahir');
  ok(r.status === 400, 'partida del dia: un dia mal escrit es rebutja');
  r = await call('GET', '/records');
  ok(r.status === 200 && !Object.keys(r.data).some(k => k.includes('dia')), 'les partides del dia no surten a la llista de tots els jocs');
}

// La Gofra: la taula de les estrelles acumulades te cadascu una sola vegada
{
  await call('POST', '/records/gofra', { nom: 'CRE', punts: 12 });
  await call('POST', '/records/gofra', { nom: 'TRA', punts: 9 });
  await call('POST', '/records/gofra', { nom: 'CRE', punts: 15 });
  let r = await call('GET', '/records/gofra');
  ok(r.data.length === 2 && r.data[0].n === 'CRE' && r.data[0].p === 15,
     'la Gofra: cadascú surt una sola vegada a la taula, amb les estrelles que té ara');
  await call('POST', '/records/gofra', { nom: 'CRE', punts: 3 });
  r = await call('GET', '/records/gofra');
  ok(r.data[0].p === 15, 'la Gofra: una puntuació més baixa no li treu la que tenia');
  await call('POST', '/records/rotllana', { nom: 'CRE', punts: 5 });
  await call('POST', '/records/rotllana', { nom: 'CRE', punts: 6 });
  r = await call('GET', '/records/rotllana');
  ok(r.data.filter(e => e.n === 'CRE').length === 1 && r.data.find(e => e.n === 'CRE').p === 6, 'la Rotllana: cadascú hi surt una sola vegada, amb el nivell més alt');
  const avui = new Date().toISOString().slice(0, 10);
  r = await call('POST', '/records/gofra_dia/' + avui, { nom: 'CRE', punts: 4 });
  ok(r.status === 200 && r.data.posicio === 1, 'la Gofra: la gofra del dia té la seva taula');
  r = await call('POST', '/records/gofra_dia/' + avui, { nom: 'CRE', punts: 6 });
  ok(r.status === 400, 'la Gofra: més de 5 estrelles en un dia no pot ser');
  r = await call('POST', '/records/abecedari_dia/' + avui, { nom: 'CRE', punts: 2134 });
  ok(r.status === 200 && r.data.posicio === 1, "l'Abecedari: la roda del dia té la seva taula");
  r = await call('POST', '/records/abecedari_dia/' + avui, { nom: 'CRE', punts: 2741 });
  ok(r.status === 400, "l'Abecedari: més de 25 encerts i 240 segons no pot ser");
  r = await call('POST', '/records/abecedari_dificil_dia/' + avui, { nom: 'CRE', punts: 3100 });
  ok(r.status === 200 && r.data.posicio === 1, "l'Abecedari: la difícil del dia té la seva taula, fins a 25 encerts i 600 segons");
  r = await call('POST', '/records/abecedari_dificil_dia/' + avui, { nom: 'MAR', punts: 3101 });
  ok(r.status === 400, "l'Abecedari: a la difícil, més de 3.100 no pot ser");
  r = await call('POST', '/records/colles_dia/' + avui, { nom: 'CRE', punts: 600 });
  ok(r.status === 200 && r.data.posicio === 1, 'Les Quatre Colles: la del dia té la seva taula, fins a 600');
  r = await call('POST', '/records/colles_dia/' + avui, { nom: 'MAR', punts: 601 });
  ok(r.status === 400, 'Les Quatre Colles: més de 600 en un dia no pot ser');
  // fer 0 (la Gofra sense acabar, cap colla...) també és haver-hi jugat
  r = await call('POST', '/records/gofra_dia/' + avui, { nom: 'ZER', punts: 0 });
  ok(r.status === 200 && r.data.jugat && r.data.posicio === 0 && !r.data.top.some(e => e.n === 'ZER') && JSON.parse(store.get('jugat:gofra_dia:' + avui)).includes('ZER'),
     'una partida del dia amb 0 no entra a la taula, però queda apuntat que hi has jugat (per a la lliga)');
  r = await call('POST', '/records/gofra_dia/' + avui, { nom: 'ZER', punts: 5 });
  ok(r.status === 200 && r.data.repetida && !r.data.top.some(e => e.n === 'ZER'), 'i compta com la primera: tornar-la a fer amb més punts ja és repetida');
  r = await call('POST', '/records/gofra_dia/' + avui, { nom: 'ZER', punts: -1 });
  ok(r.status === 400, 'els punts negatius, en canvi, no');
  await call('POST', '/records/colles', { nom: 'MAR', punts: 4 });
  await call('POST', '/records/colles', { nom: 'MAR', punts: 7 });
  r = await call('GET', '/records/colles');
  ok(r.data.length === 1 && r.data[0].p === 7, 'Les Quatre Colles: a les colles de sempre cadascú hi surt una vegada');
  r = await call('POST', '/records/trencaclosques_dia/' + avui, { nom: 'CRE', punts: 3600 - 192 });
  ok(r.status === 200 && r.data.posicio === 1, 'El Trencaclosques: el del dia té la seva taula');
  r = await call('POST', '/records/trencaclosques_dia/' + avui, { nom: 'MAR', punts: 3600 });
  ok(r.status === 400, 'El Trencaclosques: fer-lo en zero segons no pot ser');
  r = await call('POST', '/records/botifarra_dia/' + avui, { nom: 'CRE', punts: 120 });
  ok(r.status === 200 && r.data.posicio === 1, 'La Botifarra: la partida del dia té la seva taula');
  r = await call('POST', '/records/botifarra_dia/' + avui, { nom: 'MAR', punts: 4609 });
  ok(r.status === 400, 'La Botifarra: més de 4.608 en 8 mans no pot ser');
  await call('POST', '/records/botifarra', { nom: 'MAR', punts: 2 });
  await call('POST', '/records/botifarra', { nom: 'MAR', punts: 3 });
  r = await call('GET', '/records/botifarra');
  ok(r.data.length === 1 && r.data[0].p === 3, 'La Botifarra: a les partides guanyades cadascú hi surt una vegada');
  r = await call('POST', '/records/poble_dia/' + avui, { nom: 'CRE', punts: 800 });
  ok(r.status === 200 && r.data.posicio === 1, 'El Poble del Dia: el del dia té la seva taula');
  r = await call('POST', '/records/poble_dia/' + avui, { nom: 'MAR', punts: 1001 });
  ok(r.status === 400, 'El Poble del Dia: més de 1.000 (al primer intent) no pot ser');
  await call('POST', '/records/poble', { nom: 'MAR', punts: 5 });
  await call('POST', '/records/poble', { nom: 'MAR', punts: 6 });
  r = await call('GET', '/records/poble');
  ok(r.data.length === 1 && r.data[0].p === 6, 'El Poble del Dia: als pobles endevinats cadascú hi surt una vegada');
  await call('POST', '/records/abecedari', { nom: 'MAR', punts: 21 });
  await call('POST', '/records/abecedari', { nom: 'MAR', punts: 44 });
  r = await call('GET', '/records/abecedari');
  ok(r.data.length === 1 && r.data[0].p === 44, "l'Abecedari: als encerts de sempre cadascú hi surt una vegada");
  // a les partides del dia, només la primera de cada inicials (des d'un altre mòbil també)
  r = await call('POST', '/records/abecedari_dia/' + avui, { nom: 'CRE', punts: 2600 });
  ok(r.status === 200 && r.data.repetida && r.data.posicio === 0 && r.data.top.find(e => e.n === 'CRE').p === 2134,
     'partida del dia: si les mateixes inicials hi tornen a jugar, no compta i es queda la primera');
  r = await call('POST', '/records/gofra_dia/' + avui, { nom: 'NOU', punts: 1 });
  ok(r.status === 200 && !r.data.repetida, 'partida del dia: unes altres inicials sí que hi entren');
  for (let i = 0; i < 11; i++) await call('POST', '/records/gofra_dia/' + avui, { nom: 'G' + String(i).padStart(2, '0'), punts: 5 });
  r = await call('GET', '/records/gofra_dia/' + avui);
  ok(!r.data.some(e => e.n === 'NOU'), 'partida del dia: qui ha quedat fora dels 10 millors...');
  r = await call('POST', '/records/gofra_dia/' + avui, { nom: 'NOU', punts: 5 });
  ok(r.data.repetida, '...tampoc no hi pot tornar a jugar per entrar-hi');
}

// el podi de la partida del dia d'ahir, al grup, una sola vegada
{
  const madrid = enrere => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(new Date(Date.now() - enrere * 864e5));
  store.set('telegram:xat', '-1001');
  store.delete('telegram:anunciat:impremta_dia');
  store.delete('telegram:anunciat:gofra_dia');
  store.delete('telegram:anunciat:abecedari_dia');
  store.delete('telegram:anunciat:abecedari_dificil_dia');
  store.delete('telegram:anunciat:colles_dia');
  store.delete('telegram:anunciat:trencaclosques_dia');
  store.delete('telegram:anunciat:botifarra_dia');
  store.delete('telegram:anunciat:poble_dia');
  store.delete('telegram:anunciat:ahir');
  store.set('joc:botifarra_dia:' + madrid(1), JSON.stringify([{ n: 'JAU', p: 1234, t: 1 }]));
  store.set('joc:poble_dia:' + madrid(1), JSON.stringify([{ n: 'POB', p: 800, t: 1 }, { n: 'CRE', p: 320, t: 2 }]));
  store.set('joc:trencaclosques_dia:' + madrid(1), JSON.stringify([{ n: 'MAR', p: 3600 - 192, t: 1 }]));
  store.set('joc:colles_dia:' + madrid(1), JSON.stringify([{ n: 'OBE', p: 550, t: 1 }, { n: 'CRE', p: 200, t: 2 }]));
  store.set('joc:abecedari_dificil_dia:' + madrid(1), JSON.stringify([{ n: 'TRA', p: 2850, t: 1 }]));
  store.set('joc:impremta_dia:' + madrid(1), JSON.stringify([{ n: 'CRE', p: 5400, t: 1 }, { n: 'MAR', p: 3100, t: 2 }]));
  store.set('joc:gofra_dia:' + madrid(1), JSON.stringify([{ n: 'TRA', p: 5, t: 1 }, { n: 'CRE', p: 5, t: 2 }, { n: 'MAR', p: 3, t: 3 }]));
  store.set('joc:abecedari_dia:' + madrid(1), JSON.stringify([{ n: 'MAR', p: 2134, t: 1 }, { n: 'CRE', p: 1900, t: 2 }]));
  // (la lliga de la setmana passada, ja anunciada: aqui es proven els dies)
  const dia12 = d => new Date(d + 'T12:00:00Z'), mesDies = (d, n) => new Date(dia12(d).getTime() + n * 864e5).toISOString().slice(0, 10);
  const dilluns = mesDies(madrid(0), -((dia12(madrid(0)).getUTCDay() + 6) % 7)), passada = mesDies(dilluns, -7);
  store.set('telegram:anunciat:lliga', passada);
  enviats.length = 0;
  await crida(envTg, 'GET', '/records/tetris');
  const m = missatges();
  const imp = m.find(x => /Impremta/.test(x.cos.text)), gof = m.find(x => /Gofra/.test(x.cos.text));
  const abc = m.find(x => /Abecedari/.test(x.cos.text) && !/difícil/.test(x.cos.text)), dif = m.find(x => /Abecedari difícil/.test(x.cos.text));
  ok(abc && /guanyar <b>MAR<\/b>/.test(abc.cos.text) && /21 encerts \(2\.134 punts\)/.test(abc.cos.text) && /abecedari\.html/.test(JSON.stringify(abc.cos.reply_markup)),
     "i la de L'Abecedari, amb els encerts i els punts");
  ok(dif && /guanyar <b>TRA<\/b>/.test(dif.cos.text) && /25 encerts \(2\.850 punts\)/.test(dif.cos.text),
     "i la difícil de L'Abecedari: amb els segons que sobren, segueixen essent 25 encerts");
  const col = m.find(x => /Quatre Colles/.test(x.cos.text));
  ok(col && /guanyar <b>OBE<\/b>/.test(col.cos.text) && /les 4 colles i 1 error \(550 punts\)/.test(col.cos.text) && /colles\.html/.test(JSON.stringify(col.cos.reply_markup)),
     'i la de Les Quatre Colles, amb les colles i els errors');
  const tre = m.find(x => /Trencaclosques/.test(x.cos.text));
  ok(tre && /guanyar <b>MAR<\/b>/.test(tre.cos.text) && /un temps de 3:12/.test(tre.cos.text), 'i la del Trencaclosques, amb el temps i no amb punts');
  const bot = m.find(x => /Botifarra/.test(x.cos.text));
  ok(bot && /guanyar <b>JAU<\/b>/.test(bot.cos.text) && /1\.234 punts en 8 mans/.test(bot.cos.text) && /botifarra\.html/.test(JSON.stringify(bot.cos.reply_markup)),
     'i la de La Botifarra, amb els punts de les 8 mans');
  const pob = m.find(x => /Poble del Dia/.test(x.cos.text));
  ok(pob && /d'ahir al Poble del Dia la va guanyar <b>POB<\/b>/.test(pob.cos.text) && /el poble al 3r intent/.test(pob.cos.text) && /✗ 80 km/.test(pob.cos.text) && /poble\.html/.test(JSON.stringify(pob.cos.reply_markup)),
     'i la del Poble del Dia, amb a quin intent el va endevinar (i «al Poble», no «a El Poble»)');
  ok(m.length === 8 && imp && /CRE/.test(imp.cos.text) && /5\.400/.test(imp.cos.text) && /MAR/.test(imp.cos.text),
     'cada matí, el primer que obre un joc fa que el bot avisi qui va guanyar la partida del dia d\'ahir de La Impremta');
  ok(gof && /guanyar <b>TRA<\/b>/.test(gof.cos.text) && /★★★★★/.test(gof.cos.text) && /gofra\.html/.test(JSON.stringify(gof.cos.reply_markup)),
     'i la de La Gofra, amb les estrelles i qui la va acabar abans en cas d\'empat');
  enviats.length = 0;
  await crida(envTg, 'GET', '/records/ram');
  ok(missatges().length === 0, 'i només un cop: la segona vegada ja no avisa');
  // la portada fa tres peticions de cop en obrir-se: el grup rebia cada
  // missatge tres vegades
  for (const k of [...store.keys()]) if (k.startsWith('telegram:anunciat:') && k !== 'telegram:anunciat:lliga') store.delete(k);
  enviats.length = 0;
  // el KV de debò triga uns mil·lisegons a respondre: així les tres llegeixen abans que cap escrigui
  const lent = f => async (...a) => { await new Promise(r => setTimeout(r, 4)); return f(...a); };
  const envLent = { ...envTg, RECORDS: Object.fromEntries(Object.entries(env.RECORDS).map(([k, f]) => [k, lent(f)])) };
  await Promise.all([crida(envLent, 'GET', '/lliga'), crida(envLent, 'GET', '/records'), crida(envLent, 'POST', '/visita', { a: 'aparell77', j: 'index' })]);
  const quants = missatges().filter(x => /Impremta/.test(x.cos.text)).length;
  ok(quants === 1 && missatges().length === 8, `tres peticions alhora només avisen una vegada (${quants} de La Impremta, ${missatges().length} en total)`);
  for (const k of [...store.keys()]) if (k.startsWith('visita:')) { store.delete(k); meta.delete(k); }
  store.set('joc:impremta_dia:' + madrid(0), JSON.stringify([{ n: 'TRA', p: 900, t: 1 }]));
  store.set('joc:gofra_dia:' + madrid(0), JSON.stringify([{ n: 'BOB', p: 4, t: 1 }]));
  enviats.length = 0;
  await crida(envTg, 'POST', '/telegram', msg('/avui'), { 'X-Telegram-Bot-Api-Secret-Token': SECRET });
  const t = (missatges()[0] || { cos: {} }).cos.text || '';
  ok(/TRA/.test(t) && /BOB/.test(t) && /★★★★☆/.test(t), '/avui ensenya com van les dues partides del dia d\'avui');

  // la lliga de la setmana: 10 al primer de cada partida del dia, 8 al segon...
  // i 1 per haver-hi jugat sense entrar als 10 millors
  const netejaDies = () => { for (const k of [...store.keys()]) if (/^(joc|jugat):\w+_dia:/.test(k)) store.delete(k); };
  netejaDies();
  store.set('joc:impremta_dia:' + madrid(0), JSON.stringify([{ n: 'TRA', p: 900, t: 1 }]));
  store.set('joc:gofra_dia:' + madrid(0), JSON.stringify([{ n: 'BOB', p: 4, t: 1 }]));
  store.set('joc:colles_dia:' + madrid(0), JSON.stringify([{ n: 'BOB', p: 500, t: 1 }, { n: 'TRA', p: 300, t: 2 }]));
  store.set('jugat:colles_dia:' + madrid(0), JSON.stringify(['BOB', 'TRA', 'ZZZ']));
  r = await crida(envTg, 'GET', '/lliga');
  const pl = n => (r.data.classificacio.find(e => e.n === n) || {}).p;
  ok(r.status === 200 && r.data.setmana === dilluns && pl('BOB') === 20 && pl('TRA') === 18 && pl('ZZZ') === 1 && r.data.classificacio[0].n === 'BOB',
     `la lliga de la setmana: BOB ${pl('BOB')} (dos primers), TRA ${pl('TRA')} (un primer i un segon), ZZZ ${pl('ZZZ')} (hi ha jugat)`);
  ok(r.data.avui.gofra_dia && r.data.avui.gofra_dia.n === 'BOB' && r.data.avui.colles_dia.n === 'BOB' && r.data.avui.trencaclosques_dia === null,
     'i diu qui guanya avui cada partida del dia (per a la portada)');
  enviats.length = 0;
  await crida(envTg, 'POST', '/telegram', msg('/lliga'), { 'X-Telegram-Bot-Api-Secret-Token': SECRET });
  const tl = (missatges()[0] || { cos: {} }).cos.text || '';
  ok(/lliga de la setmana/.test(tl) && /1\.\s+BOB\s+20 punts/.test(tl), '/lliga ensenya la classificació de la setmana');
  // dilluns, el bot anuncia qui va guanyar la setmana passada, un sol cop
  store.delete('telegram:anunciat:lliga');
  netejaDies();
  // (al palmarès, GUA ja havia guanyat la setmana d'abans)
  store.set('lliga:palmares', JSON.stringify([{ s: mesDies(passada, -7), podi: [{ n: 'GUA', p: 30 }, { n: 'SEG', p: 20 }, { n: 'TRA', p: 10 }] }]));
  store.set('joc:conquesta_dia:' + mesDies(passada, 2), JSON.stringify([{ n: 'GUA', p: 1500, t: 1 }, { n: 'SEG', p: 300, t: 2 }]));
  store.set('joc:gofra_dia:' + mesDies(passada, 4), JSON.stringify([{ n: 'GUA', p: 5, t: 1 }]));
  enviats.length = 0;
  await crida(envTg, 'GET', '/records/tetris');
  const al = missatges().find(x => /lliga de la setmana/.test(x.cos.text));
  ok(al && /guanya <b>GUA<\/b> amb 20 punts/.test(al.cos.text) && /2 partides del dia guanyades/.test(al.cos.text) && /SEG/.test(al.cos.text),
     'cada dilluns, el bot anuncia qui va guanyar la lliga de la setmana passada, amb el podi');
  enviats.length = 0;
  await crida(envTg, 'GET', '/records/tetris');
  ok(!missatges().some(x => /lliga/.test(x.cos.text)), 'i només un cop');
  // les medalles de sempre
  ok(/És la seva copa número 2/.test(al.cos.text), "i, si ja n'havia guanyat alguna, diu quantes copes porta");
  let pal = JSON.parse(store.get('lliga:palmares'));
  ok(pal.length === 2 && pal[1].s === passada && pal[1].podi.map(e => e.n + e.p).join() === 'GUA20,SEG8',
     'el dilluns, el podi de la setmana passada queda apuntat per sempre al palmarès');
  r = await crida(envTg, 'GET', '/lliga');
  const med = n => r.data.palmares.find(t => t.n === n) || {};
  ok(r.data.palmares[0].n === 'GUA' && med('GUA').copes === 2 && med('SEG').plates === 2 && med('TRA').bronzes === 1,
     'i /lliga torna el palmarès de cadascú: GUA 2 copes, SEG 2 plates, TRA 1 bronze');
  enviats.length = 0;
  await crida(envTg, 'POST', '/telegram', msg('/lliga'), { 'X-Telegram-Bot-Api-Secret-Token': SECRET });
  const tm = (missatges()[0] || { cos: {} }).cos.text || '';
  ok(/medalles de sempre/.test(tm) && /GUA\s+🏆2/.test(tm) && /SEG\s+🥈2/.test(tm), '/lliga al grup també ensenya les medalles de sempre');
  // sense bot també s'apunten, una setmana per petició, i mai dues vegades
  store.set('lliga:palmares', JSON.stringify([{ s: mesDies(passada, -14), podi: [] }, { s: mesDies(passada, -14), podi: [] }]));
  await call('GET', '/records/tetris');
  pal = JSON.parse(store.get('lliga:palmares'));
  ok(pal.length === 2 && pal[1].s === mesDies(passada, -7), 'sense el bot també es tanca la setmana, i si en falta més d\'una, de una en una');
  await call('GET', '/records/tetris');
  await call('GET', '/records/tetris');
  pal = JSON.parse(store.get('lliga:palmares'));
  ok(pal.length === 3 && pal[2].s === passada && pal[2].podi[0].n === 'GUA', 'i quan ja és al dia, ja no n\'hi afegeix cap més');
  store.delete('telegram:xat');
}

// ===== ELS JOCS NOUS =====
{
  const nous = () => missatges().filter(x => /🆕/.test(x.cos.text));
  store.set('telegram:xat', '-1001');
  store.delete('telegram:jocs-anunciats');
  enviats.length = 0;
  await crida(envTg, 'GET', '/records/tetris');
  let m = nous()[0];
  ok(nous().length === 1 && /jocs nous/.test(m.cos.text) && /La Sopa de Lletres/.test(m.cos.text) && /El Tresor dels Templers/.test(m.cos.text)
     && m.cos.reply_markup.inline_keyboard.length === 2 && m.cos.reply_markup.inline_keyboard.some(b => /tresor\.html$/.test(b[0].url)),
     'la primera vegada, el bot anuncia els dos jocs que encara no havia anunciat, amb un botó per a cada un');
  ok(!/Els Blocs|Comecocos/.test(m.cos.text), 'i no anuncia els de sempre');
  enviats.length = 0;
  await crida(envTg, 'GET', '/records/tetris');
  ok(nous().length === 0, 'la visita següent ja no torna a avisar');
  const ll = JSON.parse(store.get('telegram:jocs-anunciats'));
  store.set('telegram:jocs-anunciats', JSON.stringify(ll.filter(f => f !== 'tresor.html')));
  store.delete('telegram:xat');
  enviats.length = 0;
  await crida(envTg, 'GET', '/records/tetris');
  ok(nous().length === 0 && !JSON.parse(store.get('telegram:jocs-anunciats')).includes('tresor.html'), 'sense grup no avisa ningú, i el joc nou s\'espera');
  store.set('telegram:xat', '-1001');
  await crida(envTg, 'GET', '/records/tetris');
  m = nous()[0];
  ok(nous().length === 1 && /Hi ha un <b>joc nou<\/b>/.test(m.cos.text) && /El Tresor dels Templers/.test(m.cos.text), 'quan hi ha grup, anuncia el joc nou: «Hi ha un joc nou a la col·lecció»');
  enviats.length = 0;
  store.delete('telegram:jocs-anunciats');
  await crida(env, 'GET', '/records/tetris');
  ok(enviats.length === 0, 'sense la clau del bot, no s\'envia res');
  store.delete('telegram:xat');
}

// QUANTA GENT HI JUGA: cada aparell, un cop al dia per joc; /visites ho compta
{
  const dia = d => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(new Date(Date.now() - d * 864e5));
  let r = await crida(env, 'POST', '/visita', { a: 'aparell01', j: 'tetris' });
  ok(r.status === 200 && JSON.stringify(meta.get('visita:' + dia(0) + ':aparell01')) === '{"j":["tetris"]}', 'una visita queda apuntada al dia d\'avui, amb el joc');
  const abans = escriptures;
  await crida(env, 'POST', '/visita', { a: 'aparell01', j: 'tetris' });
  ok(escriptures === abans, 'el mateix aparell al mateix joc el mateix dia no torna a escriure res');
  await crida(env, 'POST', '/visita', { a: 'aparell01', j: 'sopa' });
  ok(JSON.stringify(meta.get('visita:' + dia(0) + ':aparell01').j) === '["tetris","sopa"]' && escriptures === abans + 1, 'un altre joc s\'afegeix a la mateixa clau (una escriptura)');
  r = await crida(env, 'POST', '/visita', { a: 'aparell01', j: 'nosequè' });
  const r2 = await crida(env, 'POST', '/visita', { a: 'x', j: 'tetris' });
  const r3 = await crida(env, 'POST', '/visita', { a: 'aparell01', j: 'index' });
  ok(r.status === 400 && r2.status === 400 && r3.status === 200, 'un joc que no existeix o un aparell estrany es rebutgen; la portada (index) compta');
  for (const [a, j] of [['aparell02', 'tetris'], ['aparell03', 'gofra'], ['aparell04', 'tetris']]) await crida(env, 'POST', '/visita', { a, j });
  // d'ahir i de fa 3 dies, posats a mà
  store.set('visita:' + dia(1) + ':aparell01', ''); meta.set('visita:' + dia(1) + ':aparell01', { j: ['gofra'] });
  store.set('visita:' + dia(3) + ':aparell09', ''); meta.set('visita:' + dia(3) + ':aparell09', { j: ['tetris'] });
  store.set('visita:' + dia(9) + ':aparell08', ''); meta.set('visita:' + dia(9) + ':aparell08', { j: ['tetris'] });
  store.set('telegram:xat', '-1001'); store.set('telegram:jocs-anunciats', JSON.stringify(totsHtml)); enviats.length = 0;
  await tg('/visites@JocsBot');
  const t = (missatges().find(m => /Quanta gent/.test(m.cos.text)) || { cos: {} }).cos.text || '';
  ok(/Avui: <b>4 persones<\/b>/.test(t) && /Ahir: 1 persona\b/.test(t) && /últims 7 dies: <b>5 persones diferents/.test(t),
    '/visites diu quanta gent avui (4), ahir (1) i en 7 dies (5), sense comptar la de fa 9 dies');
  ok(/1\.\s+Els Blocs\s+4/.test(t) && /Gofra\s+2/.test(t) && /Sopa de Lletres\s+1/.test(t) && !/index/.test(t), '/visites diu els més jugats per quanta gent hi ha entrat, i la portada no hi surt');
  store.delete('telegram:xat');
  for (const k of [...store.keys()]) if (k.startsWith('visita:')) { store.delete(k); meta.delete(k); }
}

// cada joc té el seu nom i el seu fitxer, i el fitxer existeix
const fsm = await import('fs');
const codi = fsm.readFileSync(fitxerWorker, 'utf8');
const idsJocs = codi.match(/const JOCS = \{([\s\S]*?)\}/)[1].split('\n').map(l => (l.match(/^\s*(\w+):/) || [])[1]).filter(Boolean);
const fitxa = codi.match(/const FITXA = \{([\s\S]*?)\n\};/)[1];
const fitxers = [...fitxa.matchAll(/^\s*(\w+):\s*\[.*'([\w.]+\.html)'\]/gm)].map(x => [x[1], x[2]]);
const ids = fitxers.map(x => x[0]);
const falten = idsJocs.filter(id => !ids.includes(id));
const noHiSon = fitxers.filter(([, f]) => !fsm.existsSync(new URL('../' + f, import.meta.url)));
ok(!falten.length && !noHiSon.length,
   falten.length ? 'a la FITXA hi falten: ' + falten.join(', ')
   : noHiSon.length ? 'fitxers que no existeixen: ' + noHiSon.map(x => x[1]).join(', ')
   : `els ${ids.length} jocs tenen nom per als missatges i el seu fitxer existeix`);

console.log(malament ? `\n${malament} coses malament` : '\nel Worker, bé');
process.exit(malament ? 1 : 0);
