# Jocs

Onze jocs clàssics dels salons recreatius, fets amb HTML i JavaScript sense cap
llibreria. Cada joc és **un sol fitxer** autocontingut. Pensat per jugar-hi al
mòbil, instal·lat com a aplicació.

- Publicat a: https://oscarbellosido.github.io/Jocs/ (compte: la **J majúscula**)
- Tot en català.

## Els jocs

| Fitxer | Joc | Any |
|---|---|---|
| `pong.html` | Pong | 1972 |
| `breakout.html` | Breakout | 1976 |
| `space_invaders.html` | Space Invaders | 1978 |
| `asteroid_belt_joc.html` | Asteroids | 1979 |
| `galaxian.html` | Galaxian | 1979 |
| `comecocos.html` | Pac-Man | 1980 |
| `missile_command.html` | Missile Command | 1980 |
| `battlezone.html` | Battlezone | 1980 |
| `centipede.html` | Centipede | 1981 |
| `frogger.html` | Frogger | 1981 |
| `tetris.html` | Tetris | 1984 |

`asteroid_belt.html` és una versió antiga que ja no s'enllaça enlloc.

**El criteri és la fidelitat a l'original**: les regles, les puntuacions i les
mecàniques són les de la màquina de debò (per exemple, al Breakout el màxim són
896 punts; al Space Invaders només hi pot haver un tret teu a la pantalla; el
laberint del Comecocos té els 240 punts i 4 pastilles de l'arcade). Quan calgui
decidir alguna cosa, tirar cap a com era l'original.

## Estructura

```
index.html          menú amb una miniatura de cada joc
records.js          codi comú dels rècords compartits (el carreguen tots els jocs)
sw.js               service worker (cache per poder jugar sense connexió)
manifest.json       perquè es pugui instal·lar com a app
thumbs/             captures reals de cada joc, 240x240
worker/             el Worker de Cloudflare dels rècords (còpia del que hi ha desplegat)
scripts/            proves
```

## Disposició: dues trampes que ja ens han mossegat

**1. `100vh` no és l'alçada visible al mòbil.** Compta l'espai de la barra del
navegador, així que és més alt del que es veu. Si a més el contenidor centra
verticalment (`justify-content:center`), el sobrant es reparteix amunt i avall i
**la meitat de dalt queda fora i no s'hi pot arribar ni fent scroll**.

El patró correcte, que fan servir tots els jocs:

```css
html,body{height:100%}
body{display:flex;align-items:flex-start;justify-content:center}   /* mai center */
#wrap{height:100%;display:flex;flex-direction:column;
      padding:env(safe-area-inset-top) 0 env(safe-area-inset-bottom)}
#hud{flex:none}
#screen{flex:1 1 auto;min-height:0}                                 /* el canvas hi va a dins */
canvas{max-width:94%;max-height:100%;width:auto;height:auto}
```

Si el canvas és més petit que la pantalla i s'ha d'**ampliar** (Comecocos), fer
servir `width:96%;height:100%;object-fit:contain`.

**2. Els botons han de cabre a 320 px.** Cinc botons de 76 px no hi caben. Abans
de donar per bona una fila de controls, comprovar-la a 320, 360 i 390 px.

## Rècords compartits

Els rècords són de **tothom**, no de cada navegador. El marcador de dalt ensenya
les inicials de qui mana (`CRE 640`), o `TU 250` mentre l'estàs superant.

- **Worker**: https://jocs-records.oscarbellosido.workers.dev
  - `GET /records` tots els jocs de cop · `GET /records/<joc>` un joc ·
    `POST /records/<joc>` amb `{"nom":"ABC","punts":1234}`
  - Espai KV `jocs-records-kv` lligat com a `RECORDS`
  - El codi és a `worker/records.js`. **Es desplega enganxant-lo al tauler de
    Cloudflare**, no automàticament: si el canvies aquí, cal tornar-lo a enganxar.
- **Al navegador**: `records.js` (`Records.pintaMillor`, `Records.marcador`,
  `Records.fiPartida`, `Records.tots`).

Regles que no s'han de trencar:

- **Sense connexió cap joc no es pot trencar.** Si el Worker no respon, el joc va
  igual i ensenya el rècord local. Tot passa per `try/catch` amb temps màxim.
- Com que el codi corre al navegador de qui juga, **qualsevol pot enviar una
  puntuació inventada**. El Worker valida el que pot (joc de la llista, nom de
  tres lletres, punts enters amb un sostre per joc), però no hi ha manera
  d'evitar-ho del tot. Per a una llista entre amics ja va bé.
- Els identificadors dels jocs al Worker no sempre coincideixen amb els noms de
  fitxer: `space_invaders`, `asteroids`, `missile_command`.

## Com es prova

No hi ha framework: proves amb Playwright (ja instal·lat a
`/opt/node22/lib/node_modules/playwright`) que obren el joc de veritat i
comproven el comportament.

- `node scripts/prova-worker.mjs` — el Worker contra un KV simulat.
- Per als jocs: obrir la pàgina, forçar l'estat i comprovar. El **Worker es
  simula amb `page.route`**, perquè des de l'entorn de desenvolupament no s'hi
  arriba (el proxy bloqueja `workers.dev`): **la prova final sempre l'ha de fer
  en Carles al mòbil.**
- Comprovar sempre: que la partida acabi bé, que el marcador quadri, que no surti
  res de pantalla i que **no salti cap error de JavaScript**.
- El Tetris té el codi dins d'una funció tancada: per inspeccionar-lo, fer-ne una
  còpia sense l'embolcall `(function(){...})()`.

## Rutines

- **Cada canvi de fitxers: pujar la versió de la cache a `sw.js`** (`jocs-vN`).
  Si no, l'app instal·lada pot seguir servint la versió antiga.
- **Miniatures**: es generen obrint cada joc i capturant el canvas. Compte: el
  Tetris té tres canvas a la pàgina, cal agafar **el més gran** (el tauler).
- Commits en català, explicant **què passava** i no només què s'ha tocat.

## Com treballa en Carles

Fa servir el mòbil gairebé sempre, i no és programador: les explicacions han de
dir què s'ha de tocar i per què, sense donar per suposat cap terme tècnic. Quan
alguna cosa falla, primer reproduir-la i després arreglar-la — més d'un cop el
que fallava era la prova, no el joc.
