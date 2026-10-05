import worker from '../worker/records.js';

// KV de mentida, per provar sense desplegar res
const store = new Map();
const env = { RECORDS: {
  get: async k => (store.has(k) ? store.get(k) : null),
  put: async (k, v) => { store.set(k, v); },
  delete: async k => { store.delete(k); },
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
const envTg = { RECORDS: env.RECORDS, TELEGRAM_TOKEN: TOKEN };
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
ok(m && /Track &amp; Field/.test(m.cos.text), 'els noms amb «&» s\'escriuen bé (Track & Field)');

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
ok(missatges()[0] && /Lunar Lander/.test(missatges()[0].cos.text), '/records lunar: troba el Lunar Lander pel principi del nom');
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
  const avui = new Date().toISOString().slice(0, 10);
  r = await call('POST', '/records/gofra_dia/' + avui, { nom: 'CRE', punts: 4 });
  ok(r.status === 200 && r.data.posicio === 1, 'la Gofra: la gofra del dia té la seva taula');
  r = await call('POST', '/records/gofra_dia/' + avui, { nom: 'CRE', punts: 6 });
  ok(r.status === 400, 'la Gofra: més de 5 estrelles en un dia no pot ser');
}

// el podi de la partida del dia d'ahir, al grup, una sola vegada
{
  const madrid = enrere => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(new Date(Date.now() - enrere * 864e5));
  store.set('telegram:xat', '-1001');
  store.delete('telegram:anunciat:impremta_dia');
  store.delete('telegram:anunciat:gofra_dia');
  store.set('joc:impremta_dia:' + madrid(1), JSON.stringify([{ n: 'CRE', p: 5400, t: 1 }, { n: 'MAR', p: 3100, t: 2 }]));
  store.set('joc:gofra_dia:' + madrid(1), JSON.stringify([{ n: 'TRA', p: 5, t: 1 }, { n: 'CRE', p: 5, t: 2 }, { n: 'MAR', p: 3, t: 3 }]));
  enviats.length = 0;
  await crida(envTg, 'GET', '/records/tetris');
  const m = missatges();
  const imp = m.find(x => /Impremta/.test(x.cos.text)), gof = m.find(x => /Gofra/.test(x.cos.text));
  ok(m.length === 2 && imp && /CRE/.test(imp.cos.text) && /5\.400/.test(imp.cos.text) && /MAR/.test(imp.cos.text),
     'cada matí, el primer que obre un joc fa que el bot avisi qui va guanyar la partida del dia d\'ahir de La Impremta');
  ok(gof && /guanyar <b>TRA<\/b>/.test(gof.cos.text) && /★★★★★/.test(gof.cos.text) && /gofra\.html/.test(JSON.stringify(gof.cos.reply_markup)),
     'i la de La Gofra, amb les estrelles i qui la va acabar abans en cas d\'empat');
  enviats.length = 0;
  await crida(envTg, 'GET', '/records/ram');
  ok(missatges().length === 0, 'i només un cop: la segona vegada ja no avisa');
  store.set('joc:impremta_dia:' + madrid(0), JSON.stringify([{ n: 'TRA', p: 900, t: 1 }]));
  store.set('joc:gofra_dia:' + madrid(0), JSON.stringify([{ n: 'BOB', p: 4, t: 1 }]));
  enviats.length = 0;
  await crida(envTg, 'POST', '/telegram', msg('/avui'), { 'X-Telegram-Bot-Api-Secret-Token': SECRET });
  const t = (missatges()[0] || { cos: {} }).cos.text || '';
  ok(/TRA/.test(t) && /BOB/.test(t) && /★★★★☆/.test(t), '/avui ensenya com van les dues partides del dia d\'avui');
  store.delete('telegram:xat');
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
