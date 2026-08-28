const CACHE = 'jocs-v32';
const FILES = [
  '/Jocs/',
  '/Jocs/index.html',
  '/Jocs/records.js',
  '/Jocs/tetris.html',
  '/Jocs/comecocos.html',
  '/Jocs/space_invaders.html',
  '/Jocs/asteroid_belt_joc.html',
  '/Jocs/breakout.html',
  '/Jocs/missile_command.html',
  '/Jocs/galaxian.html',
  '/Jocs/frogger.html',
  '/Jocs/battlezone.html',
  '/Jocs/centipede.html',
  '/Jocs/pong.html',
  '/Jocs/donkey_kong.html',
  '/Jocs/crazy_climber.html',
  '/Jocs/dig_dug.html',
  '/Jocs/defender.html',
  '/Jocs/thumbs/tetris.png',
  '/Jocs/thumbs/comecocos.png',
  '/Jocs/thumbs/space_invaders.png',
  '/Jocs/thumbs/asteroids.png',
  '/Jocs/thumbs/breakout.png',
  '/Jocs/thumbs/missile_command.png',
  '/Jocs/thumbs/galaxian.png',
  '/Jocs/thumbs/frogger.png',
  '/Jocs/thumbs/battlezone.png',
  '/Jocs/thumbs/centipede.png',
  '/Jocs/thumbs/pong.png',
  '/Jocs/thumbs/donkey_kong.png',
  '/Jocs/thumbs/crazy_climber.png',
  '/Jocs/thumbs/dig_dug.png',
  '/Jocs/thumbs/defender.png',
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
