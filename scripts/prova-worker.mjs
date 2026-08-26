import worker from '../worker/records.js';

// KV de mentida, per provar sense desplegar res
const store = new Map();
const env = { RECORDS: {
  get: async k => (store.has(k) ? store.get(k) : null),
  put: async (k, v) => { store.set(k, v); },
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
const ok = (c, msg) => console.log(`${c ? '✓' : '✗'} ${msg}`);

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
r = await call('GET', '/records');
ok(r.status === 200 && Object.keys(r.data).length === 11 && r.data.tetris.length === 10,
   'GET /records retorna els 11 jocs');

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
