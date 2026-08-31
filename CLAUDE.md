# Jocs

Disset jocs clàssics dels salons recreatius, fets amb HTML i JavaScript sense cap
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
| `galaxian.html` | Galaxian | 1979 |
| `asteroid_belt_joc.html` | Asteroids | 1979 |
| `comecocos.html` | Pac-Man | 1980 |
| `missile_command.html` | Missile Command | 1980 |
| `crazy_climber.html` | Crazy Climber | 1980 |
| `battlezone.html` | Battlezone | 1980 |
| `defender.html` | Defender | 1980 |
| `centipede.html` | Centipede | 1981 |
| `frogger.html` | Frogger | 1981 |
| `donkey_kong.html` | Donkey Kong | 1981 |
| `tempest.html` | Tempest | 1981 |
| `dig_dug.html` | Dig Dug | 1982 |
| `qbert.html` | Q*bert | 1982 |
| `tetris.html` | Tetris | 1984 |

Aquest és l'ordre en què surten a la portada: **per any de sortida**, del primer
al darrer. Si s'hi afegeix un joc, va al lloc que li toca per data, no al final.

`asteroid_belt.html` és una versió antiga que ja no s'enllaça enlloc.

**El criteri és la fidelitat a l'original**: les regles, les puntuacions i les
mecàniques són les de la màquina de debò (per exemple, al Breakout el màxim són
896 punts; al Space Invaders només hi pot haver un tret teu a la pantalla i els
invasors es mengen els escuts a mesura que hi baixen a sobre; el
laberint del Comecocos té els 240 punts i 4 pastilles de l'arcade; al Crazy
Climber només es pot moure una mà cada vegada i mai no poden quedar a més d'un
pis de distància, que és el que feien les dues palanques de la màquina; el
Donkey Kong té les quatre pantalles de l'original —les botes, la fàbrica dels
pastissos, els ascensors i els reblons— i amb el martell a la mà no pots ni
pujar escales ni saltar). Quan calgui
decidir alguna cosa, tirar cap a com era l'original.

## Estructura

```
index.html          menú amb una miniatura de cada joc, per ordre d'any
records.js          codi comú dels rècords compartits (el carreguen tots els jocs)
sw.js               service worker (cache per poder jugar sense connexió)
manifest.json       perquè es pugui instal·lar com a app
thumbs/             captures reals de cada joc, 240x240
worker/             el Worker de Cloudflare dels rècords (còpia del que hi ha desplegat)
scripts/            proves
```

## Disposició: quatre trampes que ja ens han mossegat

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

**2. La regla `button{}` de cada joc també agafa els botons que fa el
`records.js`.** Tots els jocs tenen un `button{width:NNpx;height:NNpx}` per als
seus controls, i el botó D'ACORD del quadre de rècords, que es crea des del
`records.js`, no en tenia cap: als jocs amb botons estrets el text se'n sortia.
Per això ara aquell botó porta `width:auto;height:auto` escrit a la mateixa
etiqueta, que mana més que el full d'estil. Si algun dia s'hi afegeix cap altre
control, li ha de passar el mateix.

**3. Un botó que et pot matar no pot tocar el que prems sempre.** A
l'Asteroids el botó d'HIPERESPAI estava enganxat sis píxels sobre el de
disparar: el piquessis sense voler i, una de cada vuit vegades, et matava. Ara
és a la mateixa filera que la resta però arrambat a les fletxes i petit, per
deixar tot l'espai que hi hagi entre ell i el de disparar (46 px a 320, 80 a
390), i d'un altre color. Provat de posar-lo al mig de la pantalla i a la
cantonada de dalt de les fletxes: totes dues coses fan nosa mentre jugues,
perquè queden **dins del camp de joc**. Els controls han d'anar tots a la
mateixa alçada, a sota.

**4. Els botons han de cabre a 320 px.** Cinc botons de 76 px no hi caben. Abans
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
  - L'editor s'obre amb aquest enllaç, que ja et porta al Worker
    (des de l'**ordinador**, que al mòbil l'editor parteix el text):
    `https://dash.cloudflare.com/?to=/:account/workers/services/view/jocs-records/production`
    i després el botó **`</> Editar código`**. Enganxar el fitxer sencer,
    esborrant el que hi hagi, i prémer **Implementar**.
  - Per saber si un desplegament ha entrat, obrir
    `https://jocs-records.oscarbellosido.workers.dev/records/<joc>` al navegador:
    si surt `[]` o una llista, el Worker coneix el joc; si surt
    `{"error":"joc desconegut"}`, encara no.
- **Al navegador**: `records.js` (`Records.pintaMillor`, `Records.marcador`,
  `Records.fiPartida`, `Records.tots`, `Records.peuFinal`).
- En entrar a qualsevol joc, `Records.pantallaInicial(joc, pausa, continua)`
  ensenya la taula uns segons, com feien les màquines quan no hi jugava ningú.
  **El joc queda en pausa mentre es veu** (cada joc li passa el seu `paused`), es
  tanca sola als 3,5 s o al primer toc, i si no hi ha rècords no surt: no fem
  esperar per res.
- El quadre del final de partida l'acaba `Records.peuFinal()`, que hi posa el
  botó **← MENÚ**. És un enllaç i no un `<button>` a posta: si fos un botó, la
  regla `button{width:NNpx}` del joc el faria petit.

Regles que no s'han de trencar:

- **Sense connexió cap joc no es pot trencar.** Si el Worker no respon, el joc va
  igual i ensenya el rècord local. Tot passa per `try/catch` amb temps màxim.
- Com que el codi corre al navegador de qui juga, **qualsevol pot enviar una
  puntuació inventada**. El Worker valida el que pot (joc de la llista, nom de
  tres lletres, punts enters amb un sostre per joc), però no hi ha manera
  d'evitar-ho del tot. Per a una llista entre amics ja va bé.
- Els identificadors dels jocs al Worker no sempre coincideixen amb els noms de
  fitxer: `space_invaders`, `asteroids`, `missile_command`.
- **Un joc nou no funciona fins que el Worker no s'ha tornat a desplegar.** Si no
  és a la llista `JOCS`, el Worker respon 404 i el joc es queda sense taula i
  sense demanar les inicials. Ens va passar amb el Donkey Kong.
- **Que el servidor digui que no, no és el mateix que no tenir connexió.** Abans
  el `records.js` ho posava tot al mateix sac i deia "sense connexió" a algú que
  hi estava connectat. Ara distingeix la xarxa (`ultimFall = 'xarxa'`) del
  servidor (`'servidor'`) i el missatge diu la veritat.

## Com es prova

No hi ha framework: proves amb Playwright (ja instal·lat a
`/opt/node22/lib/node_modules/playwright`) que obren el joc de veritat i
comproven el comportament.

- `node scripts/prova-worker.mjs` — el Worker contra un KV simulat.
- `node scripts/prova-dialeg.mjs` — que el quadre de les inicials es vegi bé a
  tots els jocs.
- `node scripts/prova-menu.mjs` — que en acabar la partida tots els jocs
  tinguin el botó de tornar al menú i que hi porti.
- `node scripts/prova-portada.mjs` — que la portada estigui per ordre d'any i
  que no vessi a cap mida de pantalla.
- `node scripts/prova-inici.mjs` — que en entrar a cada joc surtin els rècords
  uns segons, amb el joc aturat, i que se'n vagin sols.
- Per als jocs: obrir la pàgina, forçar l'estat i comprovar. El **Worker es
  simula amb `page.route`**, perquè des de l'entorn de desenvolupament no s'hi
  arriba (el proxy bloqueja `workers.dev`): **la prova final sempre l'ha de fer
  en Carles al mòbil.**
- Comprovar sempre: que la partida acabi bé, que el marcador quadri, que no surti
  res de pantalla i que **no salti cap error de JavaScript**.
- **Si una cosa es mou més de pressa que el gruix del que ha de tocar, se
  l'endú.** Al Space Invaders el tret avança uns 9 píxels per fotograma i els
  maons dels escuts en fan 4: mirant només on havia quedat el tret, se'ls
  saltava i quedaven trossos que no queien mai. Ara es mira **tot el tram
  recorregut** des del fotograma anterior (`b.prevY`). Sempre que un projectil
  vagi més de pressa que el seu objectiu, ha de ser així.
- **Un objecte ja destruït no ha d'aturar res.** Al mateix lloc, els maons
  esborrats es guarden amb `w=0` i la comprovació no ho mirava: el tret es
  perdia dins d'un forat ja fet.
- **El que va damunt d'un escenari s'ha de calcular a partir de l'escenari, no
  amb números fixos.** Al Donkey Kong els vuit reblons anaven sempre a x=70 i
  x=370, però la biga de dalt de tot només va de 56 a 300: aquell rebló quedava
  surant a l'aire, no s'hi podia arribar i, com que la pantalla s'acaba quan els
  treus tots, no s'acabava mai. Ara es posen dins de la biga que els toca.
- **Si un joc genera l'escenari a l'atzar, comprovar que sempre es pugui acabar.**
  Al Crazy Climber sortien edificis on, a partir d'un pis, no hi havia manera de
  continuar i la partida es quedava morta. Es prova amb un recorregut automàtic
  sobre centenars d'escenaris generats, no jugant-hi.
- El Tetris té el codi dins d'una funció tancada: per inspeccionar-lo, fer-ne una
  còpia sense l'embolcall `(function(){...})()`.

## Rutines

- **Cada canvi de fitxers: pujar la versió de la cache a `sw.js`** (`jocs-vN`).
  Si no, l'app instal·lada pot seguir servint la versió antiga.
- **Cada joc nou**: afegir-lo a `index.html`, a `sw.js` (el fitxer i la
  miniatura), a la descripció del `manifest.json`, a la llista `JOCS` de
  `worker/records.js` i a la taula d'aquí dalt. I **tornar a desplegar el
  Worker**, que això no va sol.
- **Miniatures**: es generen obrint cada joc i capturant el canvas. Compte: el
  Tetris té tres canvas a la pàgina, cal agafar **el més gran** (el tauler). Si
  el canvas és vertical (Crazy Climber), retallar-ne un quadrat centrat a l'acció
  en comptes d'encabir-lo sencer, que si no queda tot negre pels costats. I no
  capturar amb el joc en pausa, que hi surt el rètol de PAUSA.
- Commits en català, explicant **què passava** i no només què s'ha tocat.

## Com treballa en Carles

Fa servir el mòbil gairebé sempre, i no és programador: les explicacions han de
dir què s'ha de tocar i per què, sense donar per suposat cap terme tècnic. Quan
alguna cosa falla, primer reproduir-la i després arreglar-la — més d'un cop el
que fallava era la prova, no el joc.
