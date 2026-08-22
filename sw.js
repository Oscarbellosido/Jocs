const CACHE = 'jocs-v2';
const FILES = [
  '/Jocs/',
  '/Jocs/index.html',
  '/Jocs/tetris.html',
  '/Jocs/comecocos.html',
  '/Jocs/space_invaders.html',
  '/Jocs/asteroid_belt_joc.html',
  '/Jocs/breakout.html',
  '/Jocs/icon-192.png',
  '/Jocs/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(r => {
        const clone = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});
