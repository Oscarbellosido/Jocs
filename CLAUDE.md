# Jocs

Vint-i-dos jocs clàssics dels salons recreatius i un de modern, fets amb HTML i
JavaScript sense cap llibreria. Cada joc és **un sol fitxer** autocontingut. Pensat per jugar-hi al
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
| `galaga.html` | Galaga | 1981 |
| `tempest.html` | Tempest | 1981 |
| `dig_dug.html` | Dig Dug | 1982 |
| `moon_patrol.html` | Moon Patrol | 1982 |
| `nibbler.html` | Nibbler | 1982 |
| `pole_position.html` | Pole Position | 1982 |
| `qbert.html` | Q*bert | 1982 |
| `track_field.html` | Track & Field | 1983 |
| `tetris.html` | Tetris | 1984 |

Aquest és l'ordre en què surten a la portada: **per any de sortida**, del primer
al darrer. Si s'hi afegeix un joc, va al lloc que li toca per data, no al final.

### I un de modern

| Fitxer | Joc | Any |
|---|---|---|
| `amunt.html` | Amunt (de l'estil del *Doodle Jump*) | 2009 |
| `boles.html` | Boles (de l'estil del *Ballz*) | 2016 |
| `sindria.html` | Síndria (de l'estil del *Suika Game*) | 2021 |

La portada és un museu de màquines recreatives ordenat per any: un joc del 2021
al final de la fila trencaria la línia del temps. Per això la portada va partida
en dos apartats, cadascun amb el seu títol i la seva graella:

- `#classics` — **CLÀSSICS DELS SALONS 1972 — 1984**, per ordre d'any.
- `#moderns` — **MODERNS del mòbil**, també per ordre d'any.

El `scripts/prova-portada.mjs` comprova que hi hagi els dos títols i que cada
apartat tingui els jocs que li toquen.

I com que aquests sí que són jocs d'empreses vives —no màquines de fa quaranta
anys—, es fan **inspirats en**, amb nom, fruites i dibuixos propis, i mai amb el
nom de l'original.

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

## El Nibbler és el Snake de debò

Quan es diu «el Snake», tothom pensa en la serp que menja i es fa llarga. La
màquina d'aquell joc és el **Nibbler (1982, Rock-Ola)**, no pas el *Blockade*
(1976, Gremlin): el Blockade era per a **dos jugadors**, no hi havia res per
menjar i la serp creixia sola. Si algun dia es fa el Blockade, va a part i és
del 1976.

Tres coses del Nibbler que no s'han de tocar a la lleugera:

- **Els pilars fan una casella i les columnes senars queden sempre obertes.**
  Així, des d'on siguis i anant on vagis, tens una sortida a una casella de
  distància. Els primers laberints els vaig fer amb blocs de tres i les files
  de pilars només s'obrien cada quatre columnes: llliscaves amunt i dues
  caselles després t'estampaves sense haver pogut fer res, i un d'ells tenia
  deu racons on era impossible sortir-ne. Ho comprova el
  `scripts/prova-cuc.mjs`, que tampoc no deixa passar passadissos de més de
  dues caselles sense poder girar.
- **Un punt de cada tres et fa més llarg** (`CREIX_CADA`). Amb un per punt, a
  mig laberint la serp ja no cabia enlloc: hi ha unes 200 caselles buides i el
  laberint s'ha de poder acabar. Provat amb un jugador automàtic que evita
  ficar-se en racons: neteja un laberint i arriba a fer 62 de llarg.
- **Girar contra una paret no mata.** El cuc segueix recte i el gir es guarda
  per a la primera obertura, com a la màquina i com al Comecocos.

On comença cada laberint no està escrit enlloc: es busca **el tram recte més
llarg del mig** (`trobaInici`). El cap va al **principi** del tram i no al
final: sortint al final tenia la paret a la casella del costat i, a 160
mil·lèsimes per casella, o giraves a l'acte o t'estampaves. Ara hi ha mitja
filera per davant, i el cuc no arrenca fins al cap de vuit dècimes.

I el més important de tot: **un gir contra una paret no mata**. El cuc segueix
recte i el gir es guarda per a la primera obertura que trobi, com a la màquina
i com al Comecocos. Els passadissos entre files només s'obren a les columnes 1,
5, 9, 13 i 17: si girar entre dos pilars matés, la primera corba de totes ja
seria mort segura.

## L'Amunt: el salt mana sobre tota la resta

Saltes sol i sense parar; l'única cosa que fas és triar cap on. Per això
**l'impuls, la gravetat i la separació entre plataformes van lligats**:

```
el salt puja IMPULS² / (2·GRAV) = 149 px
les plataformes no se separen mai més de 105 px
```

Si es toca un dels tres números, s'han de tornar a quadrar tots tres. Amb un
impuls més gros volaves per sobre de tres plataformes de cop i el joc es feia
sol; amb un de més petit hi ha separacions a les quals no s'arriba i és una
loteria.

Altres coses que ja s'han hagut d'ajustar:

- **Només toques plataforma quan baixes**, i es mira tot el tram recorregut des
  del fotograma anterior. A tota velocitat el salt avança més que el gruix
  d'una plataforma: mirant només on has acabat, hi passaries a través. És la
  mateixa trampa del tret del Space Invaders.
- **La dificultat va per alçada, no per temps**: qui puja a poc a poc no s'ho
  ha de trobar més fàcil. La funció `dificultat()` només mira els metres.
- L'alçada es compta des d'`ALTURA0`. Comptant-la amb la `y` en negatiu, a
  baix de tot sortien alçades negatives i les plataformes es generaven més
  juntes del compte.
- Si el joc es queda sense plataformes, el bucle que en fabrica no acaba mai
  (`mesAlta` queda a `Infinity`). Hi ha una xarxa de seguretat.

## Les Boles: el mateix cicle que el Síndria

Prepares el tret, el deixes anar i mires com la física ho resol sola. Coses
que ja s'han hagut d'ajustar:

- **El pas de la bola es parteix en trossets** (`mouBola`). A 640 píxels per
  segon avança deu píxels per fotograma i un maó en fa quaranta-quatre, però
  una cantonada es cola: mirant només on ha acabat, travessaria maons sencers.
  És la trampa del tret del Space Invaders.
- **El xoc es mira eix per eix**: primer s'avança en horitzontal i, si toca,
  es rebota i es desfà; després el mateix en vertical. Amb un sol test per als
  dos eixos, les cantonades donaven rebots impossibles.
- **Mai es tira gairebé horitzontal** (`ANGLE_MIN`): les boles es quedarien
  rebotant de paret a paret sense tocar res i la ronda no s'acabaria mai. I si
  tot i així es queden voltant, als catorze segons se'ls dóna caiguda. Mirant
  només si pujaven, una bola encallada entre dos maons amb caiguda zero no
  baixava mai.
- **El color del maó va pel que li queda, no pel número de sortida.** Anant
  pel de sortida, tots els d'una ronda eren del mateix color i no es veia
  quins ja estaven tocats.
- Amb moltes boles, **només la sortida ja durava dos segons i mig**: ara la
  separació entre bola i bola s'escurça a mesura que en tens més, i tocant la
  pantalla mentre volen van més de pressa.

Provat amb dos jugadors automàtics: un que apunta a ull arriba a la ronda 15,
i un que prova seixanta angles i tria el millor passa de la 28.

## El Síndria: com funciona la física

És l'únic joc amb física de debò, i té dues decisions que no s'han de desfer
sense entendre-les:

- **Verlet i no velocitats.** Cada fruita recorda on era el pas anterior i la
  velocitat en surt sola. Amb velocitats i rebots, les fruites de sota d'una
  pila tremolen i la pila no para mai quieta. El temps avança **sempre igual**
  (`PAS = 1/120`), passi el que passi amb els fotogrames.
- **Es fonen quan es TOQUEN, no quan s'encavalquen.** El solucionador de xocs
  acaba cada pas separant les fruites fins que just es toquen, així que demanant
  encavalcament no s'ajuntaven mai: en una prova, 88 fruites i 1 punt.

Altres coses que ja s'han hagut d'ajustar:

- Les mides de les fruites van **lligades a l'amplada de la caixa**: hi caben
  dues síndries just just, com a l'original. Amb la síndria més grossa la caixa
  vessava abans d'hora i no hi havia manera d'arribar-hi.
- **Vessar només compta si la fruita està quieta** i fa dos segons que sobresurt.
  Si no, perdies cada cop que en deixaves anar una de grossa i rebotava amunt.
- Cada fruita es pinta **un sol cop** en un llençol a part i després només
  s'enganxa. Fent el degradat i les ratlles a cada fotograma, amb la caixa plena
  el dibuix costava 4 mil·lèsimes per fotograma, i el pressupost sencer d'un
  fotograma són 16.
- És l'únic joc **sense `image-rendering:pixelated`**: són cercles grossos i amb
  els píxels quadrats quedaven dentats.

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

Hi vam tornar a caure amb el Pole Position: el FRE al mig de la filera, que és
**on tots els altres jocs tenen el botó que prems sense parar**. Prement-lo per
costum el cotxe es quedava clavat i saltava TEMPS ESGOTAT sense haver arribat
enlloc. El lloc del mig és el de l'acció que es fa sempre; qualsevol cosa que
et perjudiqui va a l'altra punta i més petita.

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

## El marcador de dalt: pausa i so

Tots dos botons els posa el `records.js` sol, a `#hud` (o `#h`, a l'Asteroids).
Cap joc no els ha de fer.

- **Pausa** (`❚❚`): dispara la tecla `P`, que la pausa de cada joc ja estava
  feta. Si el joc ja en porta un de seu (el Tetris), no n'hi posa un segon.
- **So** (`🔊`/`🔇`): surt **quan el joc fa el primer soroll**, no abans, perquè
  el Tetris no en fa cap i seria mentida oferir-li un botó per callar-lo. La
  tria es recorda a `localStorage` (`jocs-so`) i val per a tots els jocs.

Cada joc es munta el so a la seva manera (uns en diuen `MG` i `AC`, altres
`master` i `audioCtx`, i el del Tetris és dins d'una funció tancada), però tots
fan el mateix: es fan un volum general i el connecten a la sortida del
navegador. Per no haver de tocar vint-i-un fitxers, el `records.js` es posa al
mig: canvia `AudioNode.prototype.connect` perquè tot el que es connecti a la
sortida passi abans per un volum nostre. **Apagar el so és posar aquell volum a
zero, no aturar el rellotge del so** (`suspend`): amb el rellotge aturat, els
sorolls que el joc va programant s'amunteguen a la mateixa hora i, en tornar a
engegar, sonen tots de cop.

### El marcador ha de cabre en UNA línia

Els dos botons ocupen lloc, i això va costar car sense que se'n veiés el
rastre: amb ells posats, **a 320 px catorze jocs partien el marcador en dues
línies** i perdien onze píxels de joc. Abans de posar-los no li passava a cap.
El `flex-wrap:wrap` evitava que sortissin de la pantalla, però amagava el
problema en comptes de resoldre'l.

Ara el `records.js` fa tres coses, per aquest ordre:

1. A les pantalles de **380 px o menys**, el botó de tornar es queda només amb
   la fletxa (`←`). Són 50 px que es recuperen a tots els jocs; l'etiqueta per
   a qui ho llegeixi en veu alta segueix dient «Tornar al menú».
2. Encongeix la lletra del marcador **fins que hi cap**, i para de seguida que
   hi cap. No baixa de 10 px: més petit no es llegeix. Cal repassar-ho de tant
   en tant (cada segon i mig) perquè **els números creixen mentre jugues**: el
   Defender cabia amb quatre xifres i es partia amb cinc.
3. Si tot i així no hi cap, baixa de línia abans que sortir de la pantalla.

Dos jocs han hagut d'escurçar els seus rètols perquè en tenen més que ningú:
`EDIFICI` → `EDIF.` al Crazy Climber, i `ONADA`/`NAUS`/`BOMBES` →
`ONA.`/`NAU`/`BOM.` al Defender.

Això ho vigila el `scripts/prova-so.mjs`, que a 320 px comprova que cap joc
parteixi el marcador.

## La línia d'ajuda de cada joc

Cada joc porta un `<small>` que **comença dient què has de fer** i després diu
quins botons ho fan:

```html
<small><b style="color:#ddd">Primer a 11 punts.</b> ↑ ↓ o arrossega el dit · pausa: P</small>
```

Els vint-i-un només deien quina tecla feia què, i cap no deia l'objectiu: al
Q*bert, «salta en diagonal», però no que has de pintar tots els cubs; al Dig
Dug, «fletxes per cavar», però no que has de netejar el nivell. És el mateix que
passava amb el botó del Track & Field: sabies prémer-lo i no sabies per què.

Va a sota dels controls, que és on hi ha lloc. Les dues excepcions són els jocs
que van a pantalla completa: al **Tetris** va dins de `#hudbar` (el
`resizeCanvas()` ja mesura l'alçada d'aquesta barra i abaixa el tauler tot sol),
i a l'**Asteroid Belt** és fixa just damunt dels controls.

A l'Asteroid Belt, com que el joc ocupa tota la pantalla, **la línia queda dins
del camp i els asteroides hi passen per sobre**. Per això allà només es veu
mentre no jugues: se'n va al primer toc i torna quan s'acaba la partida, que és
quan la pots tornar a llegir sense que faci nosa. Si algun dia hi ha un altre
joc a pantalla completa, li ha de passar el mateix.

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
- `node scripts/prova-pausa.mjs` — que tots els jocs tinguin el botó de pausa
  al marcador, que aturi la partida de debò i que la torni a engegar.
- `node scripts/prova-so.mjs` — que als jocs que fan soroll surti el botó del
  so, que apagant-lo el volum es posi de debò a zero i torni en tornar-hi, i
  que el marcador no vessi a 320 px.
- `node scripts/prova-cuc.mjs` — que els laberints del Nibbler no tinguin
  racons sense sortida ni passadissos llargs on no puguis girar.
- `node scripts/prova-ajuda.mjs` — que tots els jocs tinguin la línia d'ajuda,
  que comenci dient l'objectiu i que es vegi sencera; i que la de l'Asteroid
  Belt marxi del camp quan comences a jugar.
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

  El mateix, però amagat, al Comecocos: el moviment va d'un píxel en un píxel i
  en fa uns quants per fotograma (1,01 de mitjana, o sigui que de tant en tant
  en fa dos), mentre que el «que hi ha en aquesta casella?» es mirava **un sol
  cop per fotograma**. Quan passava pel centre a mitja passa, aquell punt no es
  menjava mai. **Si el moviment va a passes, la comprovació ha d'anar a dins de
  cada passa**, no al final del fotograma.
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
- **En perdre una vida, tornar amb immunitat i en un lloc segur.** Si reapareixes
  al mateix lloc, el que t'acaba de matar encara hi és i et torna a matar
  immediatament: tres vides en cinc segons sense poder fer res. Al Tempest
  passava amb un enemic a la vora del tub (ara tornes al carril més lluny i amb
  2 segons d'immunitat), i al Pole Position amb els cotxes que t'atrapaven
  mentre estaves clavat després d'un xoc. La nau ha de **parpellejar** mentre
  duri, perquè es vegi que encara no et poden tocar. Es prova deixant un enemic
  fix a sobre teu i comprovant que només perds **una** vida, no totes.
- El Tetris té el codi dins d'una funció tancada: per inspeccionar-lo, fer-ne una
  còpia sense l'embolcall `(function(){...})()`.

## Rutines

- **Cada canvi de fitxers: pujar la versió de la cache a `sw.js`** (`jocs-vN`).
  Si no, l'app instal·lada pot seguir servint la versió antiga.
- **Cada joc nou**: afegir-lo a `index.html` (a l'apartat que li toqui), a
  `sw.js` (el fitxer i la miniatura), a la descripció del `manifest.json`, a la
  llista `JOCS` de `worker/records.js`, a la taula d'aquí dalt i a la llista del
  `scripts/prova-portada.mjs`. I posar-li la línia d'ajuda
  començant per l'objectiu. I **tornar a desplegar el
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
