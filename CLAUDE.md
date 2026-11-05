# Jocs

Vint-i-tres jocs clàssics dels salons recreatius i disset que no ho són, fets amb HTML i
JavaScript sense cap llibreria. Cada joc és **un sol fitxer** autocontingut
(menys els diccionaris del Garbuix i de La Impremta, que van a part a `dades/`;
La Rotllana també fa servir el de La Impremta per a les extres). Pensat per jugar-hi al
mòbil, instal·lat com a aplicació.

- Publicat a: https://oscarbellosido.github.io/Jocs/ (compte: la **J majúscula**)
- Tot en català.

## Els jocs

| Fitxer | Nom a la web | De quina màquina | Any |
|---|---|---|---|
| `pong.html` | Les Raquetes | Pong | 1972 |
| `breakout.html` | El Trencamaons | Breakout | 1976 |
| `space_invaders.html` | Els Invasors | Space Invaders | 1978 |
| `lunar_lander.html` | L'Allunatge | Lunar Lander | 1979 |
| `galaxian.html` | L'Esquadra | Galaxian | 1979 |
| `asteroid_belt_joc.html` | Roques de l'Espai | Asteroids | 1979 |
| `comecocos.html` | Comecocos | Pac-Man | 1980 |
| `missile_command.html` | Els Míssils | Missile Command | 1980 |
| `crazy_climber.html` | L'Escalador | Crazy Climber | 1980 |
| `battlezone.html` | Els Tancs | Battlezone | 1980 |
| `defender.html` | L'Escorta | Defender | 1980 |
| `centipede.html` | El Centpeus | Centipede | 1981 |
| `frogger.html` | La Granota | Frogger | 1981 |
| `donkey_kong.html` | El Goril·la | Donkey Kong | 1981 |
| `galaga.html` | L'Eixam | Galaga | 1981 |
| `tempest.html` | El Túnel | Tempest | 1981 |
| `dig_dug.html` | L'Excavador | Dig Dug | 1982 |
| `moon_patrol.html` | El Totterreny | Moon Patrol | 1982 |
| `nibbler.html` | El Cuc | Nibbler | 1982 |
| `pole_position.html` | La Cursa | Pole Position | 1982 |
| `qbert.html` | La Piràmide | Q*bert | 1982 |
| `track_field.html` | L'Atletisme | Track & Field | 1983 |
| `tetris.html` | Els Blocs | Tetris | 1984 |

**Els noms de la web no són els de les màquines**, i no s'han de tornar a
posar. En Carles va preguntar si feia alguna il·legalitat: les regles d'un joc
no tenen drets, però els noms (Tetris, Donkey Kong, Space Invaders...) són
marques registrades d'empreses vives, i els dibuixos i personatges tenen drets
d'autor. Per això a la portada, als títols de les pàgines, a la descripció de
l'app i als missatges del bot (`FITXA`) cada clàssic es diu com diu el que
fa (Els Blocs, El Goril·la...), com el Pac-Man ja era el Comecocos. Els noms
dels fitxers i els identificadors de les taules (`tetris`, `donkey_kong`) es
van quedar com eren: canviar-los hauria fet perdre els rècords. **No se'n fan
de nous que copiïn un joc concret**, encara que sigui amb un altre nom: els
nous són nostres o «de l'estil de». El bot troba els jocs amb l'article o
sense (`/records blocs`) i també pel nom de sempre (`/records tetris`).

Aquest és l'ordre en què surten a la portada: **per any de sortida**, del primer
al darrer. Si s'hi afegeix un joc, va al lloc que li toca per data, no al final.

### I disset que no són de saló

| Fitxer | Joc | Any |
|---|---|---|
| `botifarra.html` | La Botifarra (el joc de cartes català, de cafè) | s. XIX |
| `xifres.html` | Xifres (la prova de números de *Des chiffres et des lettres*) | 1972 |
| `temple.html` | El Temple (de l'estil del *Prince of Persia*) | 1989 |
| `amunt.html` | Amunt (de l'estil del *Doodle Jump*) | 2009 |
| `boles.html` | Boles (de l'estil del *Ballz*) | 2016 |
| `sindria.html` | Síndria (de l'estil del *Suika Game*) | 2021 |
| `balanca.html` | Balança | 2026 |
| `ram.html` | El Ram | 2026 |
| `garbuix.html` | Garbuix | 2026 |
| `gofra.html` | La Gofra (de l'estil del *Waffle*) | 2026 |
| `impremta.html` | La Impremta (de l'estil del *Balatro*, amb paraules) | 2026 |
| `rotllana.html` | La Rotllana (de l'estil del *Wordscapes*) | 2026 |
| `abecedari.html` | L'Abecedari (de l'estil del *Rosco* del *Pasapalabra*) | 2026 |
| `conquesta.html` | La Conquesta (de l'estil del *Risk*, amb les comarques) | 2026 |
| `colles.html` | Les Quatre Colles (de l'estil del *Connections*) | 2026 |
| `trencaclosques.html` | El Trencaclosques (el de tota la vida, també amb les teves fotos) | 2026 |
| `poble.html` | El Poble del Dia (de l'estil del *Worldle*, amb els municipis) | 2026 |

La portada és un museu de màquines recreatives ordenat per any: un joc del 2021
al final de la fila trencaria la línia del temps. Per això la portada va partida
en dos apartats, cadascun amb el seu títol i la seva graella:

- `#classics` — **CLÀSSICS DELS SALONS 1972 — 1984**, per ordre d'any.
- `#moderns` — **FORA DELS SALONS, del cafè, la tele, l'ordinador i el mòbil**, també per ordre d'any.

El que separa els dos apartats **no és l'any, és si era una màquina de saló**.
L'apartat de sota es deia «MODERNS del mòbil» mentre només hi havia jocs de
mòbil; amb el Xifres, que és del 1972 i de la televisió, aquell nom ja era
mentida. Amb el Temple, que és d'ordinador, s'hi va afegir «l'ordinador», i amb la
Botifarra, «del cafè». La Botifarra no té un any de naixença clar (és del
segle XIX): a la fitxa diu «S. XIX» i per ordenar-la porta `data-any="1850"`,
que és el que llegeix la prova de la portada.
L'identificador de la graella segueix essent `moderns` perquè no es
trenqui res, però el que hi surt escrit és el que mana.

El `scripts/prova-portada.mjs` comprova que hi hagi els dos títols i que cada
apartat tingui els jocs que li toquen.

**A dalt de tot, abans dels dos apartats, hi ha ELS JOCS D'AVUI** (`#avui`):
les nou partides del dia (la Gofra, la Impremta, l'Abecedari i la seva
difícil, les Colles, el Poble del Dia, el Trencaclosques, la Botifarra i la
Conquesta), cadascuna
amb **✓ FET**, **A MIG FER** o **PER FER** i qui la guanya avui, i a sota **la
lliga de la setmana** (el podi i on vas tu). L'estat es llegeix del que cada
joc ja desa en aquest mòbil (`gofra-<data>`, `impremta-dia`, `conquesta-fi-<data>`...):
si algun joc canvia com desa la del dia, s'ha de canviar també aquí. Qui guanya
i la lliga venen del Worker (`/lliga`); sense connexió la llista surt igual,
sense noms. Es pot plegar, i es recorda (`jocs-avui-plegat`). **Tornant
d'un joc amb el botó d'enrere del mòbil**, el navegador ensenya la portada
tal com era quan en vas sortir, sense tornar-la a llegir, i la partida que
acabaves de fer seguia dient PER FER (ho va veure en Carles). Per això la
llista es torna a pintar amb el `pageshow` que porta `persisted` (i en tornar
a l'app), i també es tornen a demanar qui guanya i qui mana a cada fitxa. Al
navegador de les proves això no passa (allà la pàgina sempre es torna a
carregar), i la prova de la portada ho simula amb aquell mateix avís. Hi va perquè
cada dia n'hi ha nou, de partides del dia, escampades per la portada, i no
hi havia manera de saber d'una ullada quines et quedaven. **No porta
`h2.seccio` ni `a.btn`**: són els noms dels dos apartats i de les fitxes, i
la prova i el codi que recorda l'últim joc obert els compten.

**L'ordre es pot triar** (`#ordre`, a sota d'ELS JOCS D'AVUI): **PER ANY**,
que és el museu de sempre amb els dos apartats, o **MÉS JUGATS**, una sola
graella (`#jugats`, títol `h2.jugats`) amb els que més obres primer, cada un
amb quantes vegades (12×), i els altres darrere per any. En Carles ho va
demanar. **Ho compta el joc mateix en obrir-se** (el `records.js`, a
`jocs-obertes`, per nom de fitxer i amb l'hora de l'última vegada), i no si
el tornes a carregar o hi tornes enrere. Al principi ho comptava la portada en
tocar la fitxa (`jocs-jugats`, que es segueix sumant), però en Carles va fer
el Trencaclosques i hi deia 1×: el que obries des de l'enllaç del bot, o quan
l'app s'obria directament al joc, no comptava. **De quan encara no es
comptava**: els jocs del dia sumen els dies que hi ha partida desada en aquest
mòbil (`gofra-<data>`, `trencaclosques-<data>`...), i els altres, una vegada
si hi tens rècord local (`best_<joc>`). En empat, primer el que has obert més
recentment. La tria es recorda (`jocs-ordre`).
Les fitxes es mouen a la graella de MÉS JUGATS i, tornant a PER ANY, cadascuna
torna al seu apartat. El títol no és `h2.seccio`, que la prova en compta dos,
i cal `[hidden]{display:none!important}` perquè les graelles porten
`display:grid`, que si no manaria sobre l'atribut `hidden`.

I com que aquests sí que són jocs d'empreses vives —no màquines de fa quaranta
anys—, es fan **inspirats en**, amb nom, fruites i dibuixos propis, i mai amb el
nom de l'original.

La **Balança**, **el Ram** i **el Garbuix** són l'excepció: no s'assemblen a res, són nostres de
cap a peus. Les inventades van aquí mateix, amb l'any que es fan.

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

## Els dibuixos dels jocs

En Carles va trobar que l'Atletisme es veia molt millor redibuixat i va
demanar el mateix per a tots els que es poguessin millorar. **Només es toca
el dibuix**: les mides de tot el que et pot tocar, les regles i els punts
són els mateixos. Els que tenen aquest aspecte a posta no es toquen: les
Raquetes i el Trencamaons són ratlles blanques com a la màquina, i els de
vectors (Roques de l'Espai, els Tancs, el Túnel, l'Allunatge) són línies de
colors perquè les màquines eren així.

- **El Totterreny**: el paisatge va per capes (`capes`, pintades un sol cop
  en llenços de 960 px): la Terra al cel, una base amb cúpules, dues
  serralades i el terra de la lluna. Clots foscos amb vora, roques amb
  cares, mines que fan pampallugues, plat volador amb cúpula, i un cotxe
  lunar amb sis rodes que boten (`drawRover`, que també dibuixa l'enemic).
- **L'Amunt**: del prat (turons i núvols) a l'espai; el cel es fa de posta i
  de nit segons l'alçada. Plataformes de gespa, de metall amb motoret i de
  fusta esquerdada, i un ninot rodó amb antena que s'estira i s'aixafa.
- **El Goril·la**: bigues de ferro amb gelosia (`dibuixaBiga`), barrils de
  fusta amb cèrcols que giren, flames amb resplendor i una ciutat de nit
  apagada al fons. **Els personatges són nostres**: un obrer amb casc groc i
  armilla, i no el de la gorra vermella i la granota blava, que és d'una
  empresa viva; i una noia de verd que diu AJUDA!
- **La Granota**: vist des de dalt, amb ones al riu, troncs amb escorça i
  anells, tortugues amb closca que neden (i bombolles quan són a sota),
  asfalt amb ratlles grogues i vehicles amb vidres, rodes i llums
  (`drawVehicle`, que mira cap on va el carril). La granota mira cap on
  salta (`frog.ang`) i estira les potes.

## L'Atletisme: com es dibuixa

En Carles va preguntar si se'n podien millorar els gràfics: era un ninot de
pals sobre un fons llis. Ara és un estadi de nit (`draw` i `dibuixaAtleta`):
focus, graderia plena (es pinta un sol cop en dos llenços, `GRADA`, la gent
asseguda i la gent dreta, i s'aixeca quan vas de pressa), tanques de
publicitat amb noms inventats, la pista de tartan amb carrils, el fossar de
sorra del salt, la gespa de la javelina amb els metres, tanques de debò i la
meta escacada. L'atleta té cos (samarreta groga amb dorsal: la vermella no
es veia sobre el tartan), corre amb les cames i els braços al ritme dels
metres que fa, i té una postura per a cada cosa (a les marques, amb la
llança, enlaire al salt, per sobre de la tanca, assegut a la sorra).

- **Els carrils de més enllà van darrere l'atleta**: la pista comença 46 px
  per sobre de `TERRA`, que és on té els peus. Així el cos es veu sobre el
  tartan i no sobre la gent.
- **Quan el salt o la llança cauen, la càmera s'hi queda** mentre surt el
  resultat (`final`). Abans tornava de cop a la ratlla.
- Les regles, les velocitats i les puntuacions no s'han tocat: només el
  dibuix. Dibuixar-ho tot costa 0,1 mil·lèsimes per fotograma.

## El Lunar Lander: el combustible és la partida

Atari, agost del 1979: abans que el Galaxian (octubre) i que l'Asteroids
(novembre), que de fet va aprofitar la seva placa vectorial. Com a la màquina:
dos botons per girar, el motor, un botó d'**ABORTA** que et posa dret i tira a
fons gastant el doble, i **no hi ha vides**: la partida dura el combustible.
Aterratge bo, 50 punts pel multiplicador de la plataforma i 50 de combustible
de premi; dur, 15 pel multiplicador; estavellar-se, 5. Les plataformes estretes
multipliquen més (de 2X a 5X), el paisatge és sempre el mateix (surt d'una
llavor fixa, que a la màquina també ho era) i, quan t'acostes a terra, la
càmera s'hi apropa.

Tres coses que no s'han de tocar a la lleugera:

- **El consum va lligat al premi de 50.** Si el descens més barat possible
  costés menys de 50, un jugador fi guanyaria combustible a cada aterratge i
  la partida no s'acabaria mai. Va passar: amb 20 unitats per segon, a la 4X
  un aterratge perfecte en costava 47. Amb 26, el més barat de totes les
  plataformes en costa 61. Ho calcula el `scripts/prova-lander.mjs` (caure
  lliure i frenar a fons a l'últim moment, sortint amb la velocitat de costat
  més petita), i si es toca la gravetat, l'empenta, el consum, l'altura de
  sortida o les plataformes, és la primera prova que s'ha de mirar.
- **Els límits del bo i del dur són nostres.** Les fonts diuen que la màquina
  estavellava a més de 15 de vertical, però no deixen clar on acabava el bo.
  Aquí: bo fins a 7 de vertical, 6 de costat i 8 graus; dur fins a 15, 15 i
  16 graus. Els números de la pantalla són píxels per segon partits per dos.
- **Es mira si toca a cada passet de física, no a cada fotograma**, com al
  Space Invaders: a tota velocitat un peu podria travessar la cresta d'una
  muntanya sense tocar-la.

Coses on ens separem de la màquina, a posta:

- **Comences amb dues monedes de combustible (1.500), no amb una (750).** A
  la màquina, quan se t'acabava, en podies posar més per seguir; aquí no hi ha
  monedes, i amb 750 en Carles es quedava sense propulsió de seguida. El
  pilot automàtic que baixa ràpid i frena a l'últim moment feia 5 baixades;
  un de prudent, que baixa a poc a poc com fa una persona, 4. Ara en fan 10 i
  8. El consum i el premi no es van tocar: són els que fan que la partida
  sempre s'acabi.
- **Les velocitats van de colors**: verd si ara mateix aterraries bé, groc si
  seria dur, vermell si t'estavellaries. Allà eren números blancs i els límits
  te'ls havies de saber; al mòbil, d'una ullada mentre jugues, es veu el color.
- **El gir és més lent** (72 graus per segon): a 92, un toc ràpid al mòbil ja
  et passava dels 8 graus que admet un aterratge bo.
- **Els multiplicadors bateguen però no s'apaguen.** A la màquina pampallugaven
  i, de lluny i al mòbil, quan eren apagats no sabies on era cada plataforma.
- El motor no va de zero a tot de cop: puja i baixa en una fracció de segon,
  que és el que feia la palanca de la màquina.

Botons: `ABORTA` a l'esquerra, petit i d'un altre color, i `MOTOR`, que és el
que prems sense parar, gros i a l'altra punta (la trampa 3).

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

## El Xifres: que cap ronda no surti sense solució

És la prova de números de **«Des chiffres et des lettres»** (França, 1972, de
l'Armand Jammot), aquí coneguda com a *Cifras y letras*. Les regles són les
seves: sis fitxes d'una bossa amb dos jocs de l'1 al 10 i un 25, un 50, un 75 i
un 100; un objectiu de 101 a 999; només sumar, restar, multiplicar i dividir;
cada fitxa una sola vegada, i **cap resultat negatiu, zero ni decimal**. El nom
de l'original no es fa servir enlloc.

Tres coses que no s'han de desfer sense entendre-les:

- **Cap ronda no surt sense solució.** El joc porta un cercador (`busca`) que
  para de seguida que en troba una, i una ronda no es dóna per bona fins que
  n'hi ha. Va a dues o tres mil·lèsimes de mediana i 45 com a molt, o sigui que
  es pot fer al mòbil entre ronda i ronda. Al concurs de debò n'hi ha que no
  tenen solució exacta; aquí no, que això és una partida amb punts.
- **La dificultat no es pot deixar a l'atzar.** Mesurat amb el cercador
  complet, triant l'objectiu a l'atzar ja a la primera ronda calien quatre
  fitxes o més el 92% de les vegades: començar així és desanimar-se. Per això
  les rondes fins a la vuitena **fabriquen** l'objectiu combinant tres, quatre
  o cinc de les sis fitxes (les altres queden d'esquer), i només les dues
  últimes el trien a l'atzar. Ara la rampa va de 2,9 fitxes de mitjana a la
  ronda 1 fins a 5,3 a la 10, i ho vigila el `scripts/prova-xifres.mjs`.
- **L'objectiu no pot quedar a tocar d'una fitxa de sortida** (`A_PROP`). Amb
  un objectiu de 103 i un 100 a la mà, els punts de «t'hi has quedat a 3»
  et queien sense fer res.

Dues coses on ens separem del concurs, a posta:

- **Noranta segons per ronda i no trenta.** Allà hi juga gent entrenada; aquí,
  amb trenta, la majoria de rondes quedarien a zero i seria un joc de patir i
  no de pensar. Els segons que sobren són punts, o sigui que anar de pressa
  continua valent la pena.
- **El més a prop que has fet compta sol.** No has de dir cap número: el joc es
  mira tots els que has arribat a fer i es queda el millor. Així no es perden
  punts per haver-se equivocat de botó.

Quan no te n'has sortit, al final de la ronda s'ensenya **una** manera de
fer-ho: la que el cercador tenia desada. No és forçosament la més curta.

## La Balança: un joc nostre

No ve de cap màquina ni de cap joc de mòbil: la regla és **iguala el pes dels
dos plats i es buida**. Les peces són potències de dos i dues d'iguals de
seguides en una columna se'n fan una del doble.

Quatre decisions que no s'han de desfer sense entendre-les:

- **Ajuntar no canvia el pes** (1+1=2), només allibera un forat. És l'única
  manera de guanyar lloc, i per això el joc va de saber quan ajuntar i quan no.
  Si ajuntar canviés el pes, la meitat del joc —quadrar els dos costats—
  quedaria a mans de l'atzar.
- **El mínim per buidar-la puja cada nivell** (`minBuida()`). Amb un mínim fix,
  un jugador que compti bé no es mor mai: el vam provar amb un jugador
  automàtic que mira les sis columnes i n'hi va fer tres mil de tirades sense
  perdre. Ara, com més va, més pes has d'acumular per poder-la buidar, i el
  lloc dels plats no creix: al final no hi ha manera de quadrar-ho.
- **La peça més pesada que pot sortir és un 8 i la balança es tomba als 18 de
  diferència.** Ha de ser prou més que la peça més pesada: si una sola peça et
  pogués matar, no hi hauria res a fer i seria una loteria.
- **Els plats no giren, pengen.** Van lligats al braç amb cadenes i sempre
  queden plans, com una balança de debò, i així les peces s'hi apilen dretes
  sense haver de calcular res. El braç sí que es mou com una molla —passa una
  mica de llarg i torna—, que si el pes canviés de cop no es veuria.

Com està calibrat, amb dos jugadors automàtics: un que sempre tira al plat que
pesa menys aguanta unes 80 tirades i la buida dues vegades; un que mira les sis
columnes i tria la millor arriba a 367 tirades i a uns 50.000 punts. Trenta-cinc
vegades més punts per jugar bé: és la diferència que volem.

La regla i el mínim de cada moment **van escrits a la pantalla** (a dalt a
l'esquerra i a sota de tot): és un joc inventat i ningú no en sap les regles
d'abans.

## El Ram: el motor del Síndria amb un altre joc a sobre

És nostre, i és el que passa quan al motor de física del Síndria se li posa una
regla diferent: **quatre boles o més del mateix color que es toquen esclaten
totes**, el munt s'esfondra al forat i, si en caient se'n fa un altre ram,
torna a esclatar. Això és la cadena, i és la gràcia del joc.

- **Els rams es compten per contacte, no per caselles.** Aquí no hi ha graella:
  hi ha un munt de boles on es toca qui es toca. Es busca amb una inundació
  sobre el graf de contactes, amb el mateix marge de 2,5 px que el Síndria fa
  servir per ajuntar les fruites, i pel mateix motiu: el solucionador de xocs
  acaba cada pas deixant-les **just tocant-se**, no encavalcades. Demanant
  encavalcament no esclataria mai res.
- **Totes les boles fan igual de grosses.** Amb mides diferents no
  s'empaquetarien en rusc i el munt quedaria ple de forats; amb la mateixa
  mida, s'encaixen soles i es veu de seguida què toca què.
- **Els dibuixets de dins no són per fer bonic.** Amb sis colors sols, el
  vermell i el taronja o el verd i el groc es confonen d'un cop d'ull, i aquest
  és un joc que es juga mirant. Cada color porta la seva forma.
- **Les fileres que pugen des de sota són tota la dificultat de debò.** Els
  colors només arriben a sis (més ja no es distingeixen) i allà la dificultat
  es plantava: amb només els colors, un jugador automàtic que col·loca bé va
  fer **1.200 tirades sense morir-se**. Ara cada poques tirades puja una filera
  i el munt s'enfila cap a la ratlla, i cada vegada en puja una abans.
- Per posar la filera, primer **s'apuja tot el munt de cop** i després es posa
  la nova al terra. Posant-la al terra sense fer lloc abans, el solucionador de
  xocs hauria de desencavallar-ho tot alhora i el munt saltaria enlaire.

Com està calibrat, amb dos jugadors automàtics: un que deixa anar la bola a
l'atzar fa unes 144 tirades i uns 1.000 punts; un que mira on cauria i tria el
lloc on tocarà més boles del seu color arriba a 392 tirades i 5.300 punts. Tots
dos veuen cadenes llargues, que és el que ha de passar: el premi gros no pot
ser només per a qui hi juga bé.

Amb cent boles a la caixa, dibuixar costa 0,15 mil·lèsimes i la física més
buscar els rams 0,31: el pressupost sencer d'un fotograma són 16.

## El Garbuix: paraules amb lletres que es toquen

El motor del Síndria un altre cop, però les boles porten **lletres**: fas una
paraula resseguint boles que es toquen (lliscant el dit i aixecant-lo), les
boles desapareixen, el munt s'esfondra i en cauen de noves. Si
la caixa vessa, s'ha acabat. És nostre: els jocs de paraules en català que hi
ha (els de cada dia, d'endevinar una paraula o de fer-ne amb set lletres) són
de pensar quiets; aquí el tauler es mou sol i cada paraula canvia què toca què.

Coses que no s'han de desfer sense entendre-les:

- **El diccionari va a part** (`dades/paraules.txt`), i és l'única excepció a
  la regla d'un sol fitxer. Són 91.000 paraules i 820 KB (250 comprimit): dins
  de l'HTML el faria il·legible, i a més té **llicència pròpia**. Surt del
  diccionari de **Softcatalà** (`catalan-dict-tools`, LGPL 2.1 / GPL 2), que
  demana dir d'on surt i que la llista que en fem segueixi amb la mateixa
  llicència: per això la capçalera del fitxer ho explica i al costat hi ha
  `dades/LLICENCIA-paraules.txt`. El `sw.js` el desa, així que sense connexió
  també es juga.
- **Què hi entra**: noms, adjectius en masculí i en femení, i verbs en
  infinitiu; sense plurals, sense verbs conjugats, sense noms propis ni sigles
  ni paraules marcades d'antigues o de dialecte. Sense accents (la bola diu
  «A», no «À»), la `l·l` com a `ll`, i de 3 a 10 lletres. Amb els plurals, la
  meitat de les paraules serien «la mateixa amb una S», i la S sortiria a totes.
- **La QU i la NY van en una sola bola.** Una Q sola no serveix de res i una Y
  gairebé tampoc; així no et queden boles mortes al munt. Per això al
  diccionari només hi ha les paraules que es poden fer amb aquestes fitxes.
- **Quantes lletres de cada surten** ve de comptar-les en paraules catalanes de
  debò, ponderades per com de sovint es diuen (una llista de freqüències de
  subtítols). S'ensuavitza (`freq^0,75`) perquè la Z i la Ç surtin alguna
  vegada, i les vocals es mantenen entre el 36% i el 52% del munt: amb massa
  poques no es pot fer res, amb massa no surt cap paraula llarga.
- **Les lletres s'han de tocar**, amb el mateix marge de contacte que el Ram.
  Si mentre fas la paraula el munt es mou i dues boles triades se separen, la
  cadena es talla allà mateix.
- **El que fa difícil la partida és quantes en cauen** (`quantesNoves`): 3
  després de cada paraula al principi, i una més cada 12 paraules fins a 7.
  Fent paraules de tres lletres, com més va més en cauen que no pas en treus.
- **Només es juga lliscant el dit, i a sota només hi ha SACSEJA.** Al
  principi també es podien tocar les lletres d'una en una i prémer D'ACORD, i hi
  havia un botó d'ESBORRA. En Carles ho va veure jugant: en aixecar el dit la
  paraula ja s'envia sola, o sigui que cap dels dos botons no feia res. Tampoc
  no cal desfer: una paraula equivocada no costa res (les boles es queden on
  eren), i per treure lletres a mig dibuix es torna enrere pel mateix camí.
  SACSEJA primer va anar arraconat a la dreta i petit, perquè et fa caure tres
  lletres més; però com que és l'únic botó i no en tapa cap altre, en Carles el
  va voler **al mig i gros**.
- **Es pot triar entre fosc i clar** (el botó petit de la dreta, al costat de
  SACSEJA). En Carles el va demanar per jugar-hi de dia. Es recorda a
  `localStorage` (`garbuix-tema`) i només canvia el fons, la caixa i els
  rètols (`TEMES`); les boles són les mateixes. SACSEJA segueix al mig de
  debò: la filera és una graella de tres columnes.
- **Les lletres rares van en blau** (les que valen 4 o més: G, F, B, X, H, QU,
  J, NY, Ç, Z) i les triades **en or**, amb la cadena taronja dibuixada **per
  sobre** de les boles: per sota no es veia per on passava.

Com està calibrat, amb pilots automàtics que veuen totes les paraules que es
poden fer a cada moment: un que fa el que faria una persona (de les paraules
comunes, una qualsevol) arriba a unes 49 paraules i 330 punts; un que busca la
més llarga que coneix, a 57 i 735. A cap torn de cap partida no s'ha quedat
sense res per fer: la mediana és de 64 a 103 paraules possibles al munt.

**Per provar-lo cal un servidor**: el diccionari es llegeix amb `fetch`, i des
d'una pàgina `file://` el navegador no deixa llegir cap altre fitxer. El
`scripts/prova-garbuix.mjs` serveix el repositori ell mateix. Les altres proves
l'obren com a fitxer i el joc va igual, només que diu que no ha pogut carregar
el diccionari.

## La Gofra: una sola regla i colors

En Carles va trobar la Impremta massa complicada i va demanar un joc de
paraules **més senzill**, amb lletres i colors. Mirant per què han triomfat el
Wordle, el *Waffle*, el *Connections* o el *2048*, tots fan el mateix: **una
sola regla que s'explica en una frase**, colors que diuen d'una ullada com
vas, partides de tres minuts, **el mateix repte per a tothom cada dia**, i un
resultat que es pot enviar al grup sense desvetllar la solució. La Gofra és
**inspirada en** el *Waffle* (2022), amb nom i dibuix nostres.

- Sis paraules de cinc lletres, tres en horitzontal i tres en vertical, que es
  creuen en forma de gofra. Les lletres hi són totes, però barrejades.
- **L'única cosa que pots fer és intercanviar dues lletres** (tocant-ne dues o
  arrossegant-ne una sobre l'altra). Verd: al seu lloc, i ja no es mou. Groc:
  és d'aquella paraula però mal posada. Gris: no és d'aquí. Els grocs es
  compten com al Wordle: si la paraula només en té una de lliure, només una
  surt groga.
- **20 intercanvis, i amb 10 n'hi ha prou.** Cinc estrelles si l'acabes amb
  10 o menys, quatre amb 12, tres amb 14, dues amb 16 i una fins a 20
  (`TRAMS`). Al principi n'eren 15 i les estrelles eren els que et sobraven:
  en Carles la trobava massa dura per començar, i qui s'equivocava uns
  quants l'acabava amb zero estrelles, i llavors no sortia a cap taula. Ara
  qui l'acaba en treu almenys una, i les cinc segueixen costant el mateix.
  A sota del comptador hi diu les estrelles que encara pots treure i fins
  quants intercanvis.
  La regla també surt a la línia d'ajuda i, en acabar, el quadre ensenya la
  taula sencera amb la teva fila ressaltada: en Carles va fer una gofra amb
  19 intercanvis, en va treure una estrella i no entenia per què.
  El marcador de dalt (ESTRELLES) és el que porta acumulat **aquest mòbil**
  amb les del dia; la taula de sempre és la del Worker.

Coses que no s'han de desfer sense entendre-les:

- **No cal diccionari ni cap fitxer de fora.** Aquí no s'escriu res: la
  solució és la que és. Les 995 paraules van dins del joc, i són **paraules
  corrents**: les de cinc lletres del diccionari de Softcatalà que, a més, són
  entre les 14.000 més dites (els noms propis, les paraulotes i les estranyes
  es van treure a mà). Una solució ha de ser una paraula que tothom reconegui.
  Les fitxes van sense accents; al final s'ensenyen ben escrites (ÍNTIM, CANÇÓ).
- **Cada gofra es construeix al moment**, a partir de la llavor `GOFRA-<data>`:
  la de dalt a l'atzar, les tres verticals han de començar per la seva lletra,
  i les dues horitzontals de sota queden lligades (`construeix`). Tarda 0,3
  mil·lèsimes. La primera gofra, la #1, és la del 3 d'octubre del 2026.
- **La barreja es fa amb cicles que sumen exactament 10 intercanvis**
  (`barrejaGofra`): es mouen de 14 a 16 lletres, i un cicle de N lletres en
  demana N−1. Les que no es mouen comencen verdes (de 5 a 7). Si una lletra
  moguda cau per casualitat a una casella amb la mateixa lletra, es torna a
  barrejar, que si no la gofra sortiria més fàcil del compte. Amb lletres
  repetides, qui les va posant d'una en una sense pensar-hi pot necessitar-ne
  fins a 13: encara hi cap. Les del dia desades quan n'hi havia 15 (sense
  `v:2`) en reben cinc més en obrir-les.
- **La del dia es desa a cada intercanvi** (`localStorage`, `gofra-<data>`):
  tancant i obrint no es pot tornar a començar. Les estadístiques (ratxa,
  estrelles) es compten una sola vegada per dia.
- **Dues taules**: la del dia (`/records/gofra_dia/<data>`, les estrelles
  d'avui, de 0 a 5) i la de les **estrelles acumulades** (`gofra`), on
  **cadascú surt una sola vegada** (`UNA_PER_NOM` al Worker): si no, la taula
  s'ompliria del mateix jugador amb 12, 15, 19 estrelles. Per Telegram només
  s'avisa quan **canvia qui mana**, que si no el primer que juga cada dia
  avisaria cada dia. La segona taula s'envia sense tornar a demanar les
  inicials (`Records.envia`).
- **El que s'envia al grup és el dibuix de colors i les estrelles**, mai les
  paraules.
- **Cada matí el bot diu al grup qui va guanyar la Gofra d'ahir**, igual que
  amb la partida del dia de La Impremta (`ANUNCIA_DIARI` al Worker). Com que
  hi haurà molts empats a cinc estrelles, mana qui la va acabar abans, i el
  missatge ho diu. `/avui` ensenya com van totes dues.
- La **PRÀCTICA** són gofres a l'atzar per a qui en vol més: no compten per
  a res.

**A la Gofra i a la Impremta es veuen sempre les dues taules**, cadascuna
amb el seu títol, perquè en Carles deia que si no, no quedava clar quina era
quina ni qui guanyava la del dia: en entrar (`Records.pantallaInicial` amb el
quart paràmetre, una llista de `[títol, taula]`), a la pantalla del joc (una
filera amb qui mana a cadascuna) i al quadre del final.

## La Impremta: el Balatro amb paraules

En Carles va demanar un joc de paraules que **enganxés**. Mirant què enganxa
avui, el fenomen del 2024 va ser el *Balatro* (un joc de cartes): fas una
jugada, uns comodins la multipliquen, i entre ronda i ronda els compres i
muntes una combinació teva. Ja n'han sortit versions amb paraules
(*Wordatro*, *Letterlike*), però en anglès. La Impremta és **inspirada en**
aquell cicle, amb tema, noms i regles nostres: ets un impressor amb una caixa
de tipus de plom.

- **Vuit lletres a la mà**, fas una paraula i la imprimeixes. Punts =
  (base de la llargada + valor de cada lletra) × multiplicador. Cada pàgina
  demana uns punts amb 4 impressions i 3 descarts. Tres pàgines per capítol:
  la petita, la gran (×1,5) i la del **censor** (×2), que posa una
  prohibició (sense E, només paraules curtes, una impressió menys...).
- **Els segells són els comodins** (`SEGELLS`): com a molt cinc. **A la
  botiga, un sol toc compra**, i la casella diu «✓ COMPRAT». Abans el primer
  toc només el marcava i calia un segon toc: en Carles es pensava que ja el
  tenia i sortia de la botiga sense. Els manuals
  pugen el nivell d'una llargada, i els paquets afegeixen tipus a la caixa
  (n'hi ha de millorats i comodins), en milloren o en llimen.
- **Mentre compons, el número blau ja suma les lletres**: «4 per ser de 2
  lletres + 7 de les lletres» i 11 × 1 («de base» no s'entenia). Abans només hi sortia la base (4 × 1) i
  en Carles no entenia per què, amb QU (6) i E (1). Els segells i els tipus
  millorats s'hi afegeixen al recompte.
- **El recompte es veu pas a pas**: cada lletra i cada segell que fa alguna
  cosa salta i suma davant teu, amb un so que puja. És la gràcia del joc;
  tocant la pantalla va més de pressa.
- **El primer censor és dels suaus** (`CENSORS_SUAUS`): el primer capítol és
  per aprendre.
- **Les millores de la impremta** (`MILLORES_IMP`): a cada botiga n'hi ha una
  a sota, de punta a punta, que dura tota la partida i no ocupa lloc de
  segell: una impressió més (10 rals, dues vegades), un descart més (8, dues),
  una lletra més a la mà (10, dues) o un sisè lloc de segell (12, una). Abans,
  amb els cinc segells, no hi havia res en què gastar: en Carles en va
  acumular 28, i l'interès s'atura als 25.

Coses que no s'han de desfer sense entendre-les:

- **Tot el que surt a l'atzar surt d'una llavor** (`rng(...)`), i cada cosa
  té el seu fil: la bossa de la pàgina 4, la botiga de la pàgina 7, els
  censors. Així el que compres no canvia la sort de la resta, i **la mateixa
  llavor és la mateixa partida**. D'això depenen dues coses:
  - **La partida del dia**: llavor `DIA-<data de Madrid>`, igual per a
    tothom. Té una taula pròpia al Worker, `/records/impremta_dia/<data>`,
    que no surt a la llista de tots els jocs ni avisa per Telegram (el primer
    de cada matí ja seria el número 1). Només compta **la primera vegada**
    que la jugues (`localStorage` `impremta-dia`): si no, qui la repeteix ja
    sap quines lletres li tocaran. El Worker no hi deixa apuntar ningú a un
    dia passat, i cada taula s'esborra sola als 60 dies.
    **Són dues competicions separades**, i així ho va voler en Carles: la
    del dia només va a la taula d'avui, i les lliures i els reptes a la de
    sempre. Mentre jugues la del dia, el marcador de dalt diu qui guanya
    **avui** (`taula()`). Per un moment la del dia també anava a la de
    sempre, i en Carles va dir que s'havien de distingir. La marca es posa
    en **començar**-la, no en acabar-la: si la tornes a obrir, ja és la
    repetida, i el botó ho diu (PARTIDA DEL DIA (JA JUGADA)).
  - **Cada matí el bot diu al grup qui va guanyar la d'ahir**, amb el podi
    (`anunciaAhir` al Worker). No cal cap rellotge a Cloudflare: ho fa la
    primera petició del dia, de qualsevol joc, i es marca a
    `telegram:anunciat:impremta_dia` **abans** d'enviar perquè no surti dues
    vegades. `/avui` al grup ensenya com va la d'avui.
  - **El repte**: en acabar, els enllaços REPTA PER TELEGRAM / PER WHATSAPP /
    COPIA porten `#repte=LLAVOR&n=INICIALS&p=PUNTS&c=CAPÍTOL`. Qui l'obre juga
    la mateixa partida i, en acabar, veu qui ha guanyat. No cal cap servidor:
    els punts de l'altre van dins de l'enllaç.
- **El diccionari és un altre que el del Garbuix**: `dades/formes.txt`, amb
  **totes les formes** (plurals, femenins, verbs conjugats, també els
  valencians i balears, adverbis, numerals...). Amb vuit lletres a la mà,
  tothom prova CASES o MENJO, i rebutjar-les faria enfadar. Surt del
  `resultats/lt/diccionari.txt` de Softcatalà, quedant-se només els noms,
  adjectius i verbs el lema dels quals és a `dades/paraules.txt` (així els
  filtres d'obsoletes, noms propis i sigles del Garbuix hi valen igual). Són
  184.000 formes, 1,5 MB (425 KB comprimit). Mateixa llicència.
- **La caixa de sortida és de 57 tipus amb un 40% de vocals** (`CAIXA0`),
  com el català escrit. Amb les proporcions de freqüència pura, sortien massa
  lletres rares i massa poques vocals.
- **La mà sempre té almenys dues vocals i dues consonants** (`equilibra`).
  Tot i el 40%, en Carles va rebre M G L R H N NY X i no es podia fer res: era
  perdre el torn per mala sort. Si en falten, la que sobra es canvia per la
  propera bona de la pila (i tornarà a sortir més endavant). Com que tot surt
  de la pila, la mateixa llavor segueix donant la mateixa partida. El comodí
  compta com a vocal; la QU i la NY, com a consonants.

- **La partida es desa sola** (`desaPartida`, a `localStorage`
  `impremta-partida`), cada segon i en sortir de la pàgina, i a la portada
  del joc surt **CONTINUA LA PARTIDA**. En Carles va fer més punts que el
  rècord en una partida lliure, va tornar al menú a mig fer i es va perdre
  tot: els punts només s'apunten quan la partida s'acaba. Només es desa quan
  està quieta (mai a mig recompte), i cada tipus es desa un sol cop amb el seu
  número perquè, en tornar, la mà, la pila i la caixa segueixin compartint
  els mateixos tipus. La del dia d'un altre dia ja no es pot continuar.

Com està calibrat, amb jugadors automàtics que juguen amb el codi de debò: un
que juga com una persona (coneix 6.000 paraules corrents i en tria una de les
més llargues) arriba de mitjana a la pàgina 12 (capítol 4), i un que les
coneix totes i tria la que fa més punts, a la 21. Gairebé tots dos cauen a
la pàgina del censor, que és el que ha de passar, i quasi ningú no cau al
primer capítol. Els objectius són `OBJ` (i a partir del capítol 9, ×1,9 cada
capítol, que vol dir que la partida sempre s'acaba). Amb les millores, els
pilots arribaven a la 14 i a la 25: per això, des del capítol 3, els
objectius pugen més de pressa que abans (620, 1.300, 2.600... en lloc de 560,
1.100, 2.100). Els dos primers capítols no s'han tocat. Si es toca res de
l'economia, s'ha de tornar a mirar amb els pilots que les dues mitjanes
quedin on són.

Botons: `DESCARTA` a l'esquerra, petit i d'un altre color (gasta un
descart), `IMPRIMEIX` gros al mig i `BARREJA` (només remena la mà, per veure-hi
paraules) a la dreta. La trampa 3.

**Quan no queden descarts, `DESCARTA` es torna `PLEGA`**, i pregunta abans
(«NO, SEGUEIXO» / «SÍ, PLEGO»). En Carles s'hi va quedar encallat: sense
cap paraula a la mà i sense descarts, no hi havia manera d'acabar la
partida. Plegar fa el mateix que quan la impremta tanca sola: els punts
s'apunten a la taula.

## La Rotllana: el joc de paraules fàcil

En Carles va demanar, després dels altres tres, un joc de paraules **fàcil,
intuïtiu i divertit**. Mirant què es juga: el Wordle és el primer del món
(4.200 milions de partides el 2025 al New York Times), i el segon és el
*Wordscapes* (uns 10 milions de jugadors cada dia, sobretot gent de 35 anys
amunt). En català ja hi ha el Wordle, el Paraulògic i el Mot-li!, però **cap
de roda de lletres**. La Rotllana n'és **inspirada**, amb nom i dibuix nostres:
la rotllana és el rotllo de gent agafada de les mans, i aquí les lletres també.

- A sota hi ha de 4 a 7 lletres en rotllana; a dalt, uns mots encreuats buits.
  **Llisques el dit per les lletres** i, si la paraula hi és, hi vola sola.
  No hi ha temps, ni vides, ni manera de perdre: només nivells.
- Les paraules bones que no hi són són **extres**: donen una moneda. La
  **PISTA** costa 10 monedes i destapa una lletra (la primera que falta de la
  paraula on en falten menys). En comences amb 30 i en guanyes 3 per nivell.
- **La puntuació és el nivell**: la taula (`rotllana`) té cadascú una sola
  vegada (`UNA_PER_NOM`) i s'envia en acabar cada nivell, en silenci si ja hi
  ha inicials. Telegram diu «37 nivells» i no «37» (`UNITAT` al Worker), i
  només avisa quan canvia qui mana.
- Cada deu nivells, un paisatge de casa nostra al fons (`PAISOS`).

Coses que no s'han de desfer sense entendre-les:

- **Les paraules són les corrents**: les formes del diccionari de Softcatalà
  (amb plurals i verbs, que és el que la gent prova) ordenades per com de
  sovint es diuen, de 3 a 7 lletres, i les 9.000 primeres van dins del joc.
  S'han tret a mà els noms de persona i de lloc que també són paraules
  (ROGER, JAN, PARIS...), les paraulotes, les del castellà (COMO, ALTO) i els
  articles i contraccions (ELS, DEL, PELS), que en uns mots encreuats no fan
  gràcia. **Les extres** poden ser qualsevol forma de `dades/formes.txt`.
- **El nivell 37 és el mateix per a tothom**: tot surt de llavors
  (`ROTLLANA-<n>`), i així la taula és justa. Les paraules base de cada
  llargada van en una llista barrejada sempre igual, i cada nivell agafa la
  següent que dona prou paraules: **en mil nivells no se'n repeteix cap**.
- **La dificultat va a trams** (`TRAMS`): el nivell 1 té 4 lletres i 4
  paraules de les 1.500 més dites; a partir del 151, 7 lletres i unes 12
  paraules de les 7.500 més dites. Com més amunt, paraules menys corrents.
- **Els encreuats es fan sols** (`disposa`): la base primer, i cada altra
  paraula s'hi creua per una lletra que ja hi sigui. Cap lletra no pot tocar
  de costat una altra paraula, que si no en sortirien d'inexistents. Es prova
  trenta vegades i es queda la que en posa més i ocupa menys, sense passar de
  10 × 9 caselles (així no fan mai menys de 32 px). Un nivell tarda 3
  mil·lèsimes.
- **Una paraula queda feta quan té totes les lletres destapades**, encara
  que sigui a cops de pista o perquè les altres l'han anat creuant.
- **La rotllana es pot girar (BARREJA), però mentre gira no es pot fer res
  de nou**: el gir mou les lletres i el dit les buscaria on ja no són.
- **El nivell es recupera de la taula de rècords** (`recupera`). Es desa dins
  de cada navegador, i l'ordinador, el mòbil, l'app instal·lada i Telegram
  per dins són llocs diferents: en Carles anava molt endavant i, obrint-la
  des d'un altre lloc, va tornar al nivell 1. Ara, en entrar, si la taula diu
  que les teves inicials tenen més nivells fets, ofereix CONTINUA PEL N; i en
  un navegador nou (sense inicials, als tres primers nivells) les demana.

## L'Abecedari: una paraula per a cada lletra

En Carles el va demanar «com El Rosco»: la prova final del concurs de la tele,
una roda amb les lletres i una definició per a cadascuna. El format és d'una
empresa viva (ve d'un concurs anglès), així que és **inspirat en**, amb nom
nostre i sense dir mai el de l'original.

- **25 lletres**, de la A a la Z amb la Ç i sense la K ni la W, que en català
  gairebé no tenen paraules (com a la tele, que tampoc no les fa servir).
  Diu «COMENÇA PER» o, si la paraula no hi comença, «CONTÉ LA»: la Ç i la Y
  (paraules amb NY) sempre; a la Z, de vegades.
- **Escrius la resposta amb un teclat propi** a la pantalla: el del mòbil
  taparia mitja roda. No cal posar accents, ni la ç, ni la l·l: «canco» val
  per «cançó» (`pla`).
- **PASSA PARAULA** la deixa blava per a la volta següent. Fallar la posa
  vermella i ensenya quina era, amb **el rellotge aturat** mentre es veu.
- **Quatre minuts** (`TEMPS`), i no tres: a la tele parlen, aquí s'escriu.
  **100 punts per encert** i, si l'acabes sencera, els segons que sobren.
- **La roda del dia és igual per a tothom** (#1 = 21 d'octubre del 2026),
  amb dues taules com a la Gofra: la d'avui (`abecedari_dia/<data>`, els
  punts) i la dels **encerts de sempre** (`abecedari`, acumulats, cadascú una
  vegada). Cada matí el bot diu qui va guanyar la d'ahir. La del dia es desa
  a cada resposta i cada segon, amb el temps que queda: tancant no es pot
  tornar a començar. Si surts de l'app, el rellotge s'atura.
- **PRÀCTICA**: rodes a l'atzar, sense les paraules d'avui, que no compten.

**La difícil d'avui** (◆, en lila) és una segona roda del dia, amb paraules
difícils de la A a la Z. En Carles la va demanar per fer-la **a estones
durant tot el dia**:

- **Deu minuts** (`TEMPS_DIF`), però el rellotge **només corre mentre la tens
  oberta**: si surts de l'app es posa en pausa i es desa. Sense cap rellotge
  i amb tot el dia per davant, qualsevol les trobaria totes al diccionari, i
  en Carles va triar això abans que no pas fer-la sense temps.
- **A cada definició diu quantes lletres té** (`lletresDe`: la l·l en són
  dues i la ç, una), i a sota del que escrius, quantes en portes (3/7). Per
  això aquí **cap paraula no té una altra resposta bona**: amb dues
  respostes de llarg diferent, el número seria mentida. Les que van en plural
  ho diuen a la definició.
- **Les definicions són a part** (`DIFICILS`, 380, de 13 a 19 per lletra),
  escrites a mà com les altres, i **cap no és a la roda normal**. Paraules que
  se saben però costen (*atzucac*, *fal·lera*, *saurí*, *xafogor*), no de les
  que no ha sentit ningú. La llista és barrejada amb la seva llavor
  (`ABECEDARI-DIFICIL-`) i la #1 és la del 23 d'octubre del 2026.
- **Va a la seva taula del dia** (`abecedari_dificil_dia/<data>`, fins a
  3.100: 25 × 100 i els 600 segons), i el bot també diu cada matí qui la va
  guanyar. **No suma als encerts de sempre**, que són els de la roda normal;
  les seves estadístiques (ratxa...) van a part (`abecedari-stats-dificil`).
- **En entrar al joc, s'obre la que feies**: si l'última vegada eres a la
  difícil i la tens a mig fer, surt directament CONTINUA de la difícil
  (`abecedari-ultim`). Si no, la roda normal, amb el botó de la difícil a
  sota de COMENÇA i al quadre del final.

Coses que no s'han de desfer sense entendre-les:

- **Les definicions són nostres, escrites a mà** (941, de 33 a 42 per lletra,
  a `DEFINICIONS`, dins del joc). Les del diccionari de l'Institut tenen drets
  i no es poden copiar. Les respostes són paraules del diccionari, escrites com
  toca, que és com s'ensenyen al final; si n'hi ha una altra de bona, va
  darrere d'una barra (`zoo/zoològic`).
- **De fàcil a difícil dins de la roda**, que és el que va demanar en Carles:
  de la A a la G paraules de tota la vida (abella, cadira, gat), de la H a la
  P una mica menys, i de la Q a la Z les difícils (quiròfan, sextant,
  xamfrà). Si s'hi afegeixen paraules, han d'anar a la llista de la seva
  lletra i del seu nivell.
- **Cap paraula no es repeteix fins que no han sortit totes les de la seva
  lletra**: cada lletra té la seva llista barrejada sempre igual i cada dia
  n'agafa la següent (`indexDia`). Com que cada llista fa un llarg diferent,
  les combinacions no es repeteixen mai.
- **Una paraula, una sola lletra**: si la mateixa resposta fos a dues
  llistes, podria sortir dues vegades el mateix dia. També s'han evitat les
  definicions que es trepitgen (el ruc a la R i no a la A; la jungla a la J i
  no la selva a la S).
- **La P del teclat de l'ordinador s'escriu**: el botó de pausa del marcador
  envia una P de mentida (`isTrusted`), i només aquesta fa pausa.

El `scripts/prova-abecedari.mjs` mira totes les definicions (que cada
resposta tingui la seva lletra, que no se'n repeteixi cap i que cap definició
no porti la resposta a dins), que la roda del dia sigui igual per a tothom i
no repeteixi paraules, i que es jugui tocant: encertar, fallar, passar, el
rellotge, la pausa, desar i continuar, i les dues taules. I el mateix amb la
difícil: les seves definicions, el compte de lletres, que es reprengui on
era i que vagi a la seva taula.

## La Botifarra: el joc de cartes de casa

En Carles la va triar entre quatre idees de joc nou. És **el joc de tota la
vida**, no el d'una empresa: va amb el seu nom i les seves regles.

- **Baralla espanyola de 48 cartes**, quatre jugadors per parelles: tu i en
  Pere (a dalt) contra la Rosa (a la dreta) i en Jaume (a l'esquerra). Els
  altres tres els porta la màquina. **Es tira cap a la dreta**, i surt qui va
  després de qui dona.
- L'ordre i els punts: **manilla (9) 5, as 4, rei 3, cavall 2, sota 1**, i
  després del 8 al 2, que no valen res. Cada basa, un punt més: 72 en total.
  La parella que **passa de 36** s'apunta el que passa, pel multiplicador.
- **Qui dona fa trumfo** o el **delega** al company. **Botifarra** és sense
  trumfo i val el doble. Els rivals poden **contrar** (×2), aleshores
  **recontrar** (×4) i encara **sant vicenç** (×8). Si tu passes, el teu
  company encara pot contrar.
- **Les obligacions** (`legals`): seguir el pal; si pots, **matar** (menys si
  la basa ja és del company); sense el pal, **fallar**, i **sobrefallar** si
  un rival ja ha fallat. Si no pots sobrefallar, o si guanya el company,
  tires el que vols. Si toques una carta que no pots tirar, diu per què
  (`perQue`), i les que no pots tirar surten apagades.
- **Un toc aixeca la carta i el segon la tira.** Amb les cartes encavalcades
  a 320 px, un sol toc tiraria la del costat massa sovint.
- **Partida lliure a 101** (va a la taula de les **partides guanyades**,
  `botifarra`, acumulades i cadascú una vegada) i **la partida del dia**:
  **8 mans** (cadascú dona dues vegades) amb les **mateixes cartes per a
  tothom** (llavor `BOTIFARRA-<n>`, #1 = 1 de novembre del 2026). Hi compten
  els punts que fa la teva parella (`botifarra_dia/<data>`), i el bot diu
  cada matí qui la va guanyar.
- Es desa a cada basa (`botifarra-partida` i `botifarra-<data>`). Començar
  una lliure amb una a mig fer pregunta abans (SEGUR?), com al Temple.

Coses que no s'han de desfer sense entendre-les:

- **Les regles i la màquina són funcions pures** entre `==REGLES==` i
  `==FI REGLES==`: el joc i la prova fan servir les mateixes.
- **La màquina no fa servir l'atzar**: amb les mateixes cartes i jugant
  igual, fa el mateix. Si no, la partida del dia no seria la mateixa per a
  tothom. Només sap el que sabria una persona: les cartes que han sortit i
  qui ha fallat (`buits`: qui no ha seguit un pal no en té, i qui no ha
  fallat quan tocava tampoc no té trumfos).
- **Com juga**: surt amb la mestra de trumfo per fer-los caure si el trumfo
  és seu, després amb les cartes que ja no les mata ningú (`mestra`) si cap
  rival no les pot fallar, i si no, la més baixa del pal més llarg. Si la
  basa és del company i aguantarà (`aguanta`), hi **carrega** punts; si la
  guanya un rival, el mata amb la carta més baixa que aguanti, i si no,
  tira la que val menys.
- **Com tria el trumfo** (`valTrumfo`, `valBotifarra`): els pesos es van
  ajustar jugant 3.000 mans amb cadascun dels cinc trumfos possibles i
  mirant quin sortia millor. **Delega** per sota d'11 (`IA.delega`): per sota,
  de mitjana, el company ho fa millor. **Contra** (`valDefensa`) a partir de
  12, que és on qui ha fet trumfo ja perd més de la meitat de les vegades.
- Calibrat: contra qui tira a l'atzar fa uns 8-11 punts per mà; una partida
  a 101 entre màquines dura unes 13 mans, i una del dia fa uns 50 punts de
  mitjana per parella. Es contra un 15% de les mans i es fa botifarra en una
  de cada quatre o cinc.

## La Conquesta: el joc de conquesta de taula, amb les comarques

En Carles va demanar un joc de guerra. El problema de jugar contra la màquina
es resol amb **la batalla del dia**: tothom juga el mateix mapa contra la
mateixa màquina, i la taula diu qui ho ha fet millor. És **inspirat en** el
*Risk* (d'una empresa viva), amb nom nostre.

- **Les 43 comarques** (amb el Moianès i el Lluçanès) i **tres exèrcits**:
  tu (blau), els VERMELLS i els GROCS. Comences amb 15 comarques i 45
  soldats; ells, amb 14 i 35 cadascun (`SOLDATS_TU`, `SOLDATS_ELLS`).
- **Guanya qui arriba primer a 30 comarques** (`OBJECTIU`), i no qui les té
  totes: conquerir-les totes duraria massa per a una partida del dia. Si no
  hi arriba ningú en **25 rondes** (`MAX_RONDES`), s'acaba igual.
- Cada torn: **REFORÇA** (un soldat per cada tres comarques, com a mínim 3,
  **2 de propina només per a tu** (`PROPINA`), i el premi de cada **vegueria** sencera, que fan de continents), **ATACA**
  (fins a 3 daus contra 2, de gran a petit, i si empaten perd qui ataca) i
  **MOU** soldats un cop per comarques teves. Són les regles de tota la vida.
- **Punts**: guanyant, 1.000 i 50 més per cada ronda que sobra. Si no,
  10 per comarca teva. La batalla del dia va a `conquesta_dia/<data>` i les
  partides lliures, a `conquesta`.

Coses que no s'han de desfer sense entendre-les:

- **El mapa surt de la Base municipal de l'ICGC** (via `gmarull/cat-topojson`,
  amb llicència CC BY 4.0 de l'Institut, que demana dir-ne la font: és al
  menú del joc). Les comarques es fan **unint els municipis** i hi ha el
  Lluçanès (2023), que el mapa d'origen no tenia: els seus 13 municipis es
  van passar a la comarca 43 a mà. Les vores es simplifiquen arc per arc (així
  dues veïnes comparteixen exactament la mateixa ratlla), i **les veïnes
  surten de les vores compartides**, no escrites a mà. El script que el fa no
  és al repositori: si s'ha de refer, la manera és aquesta.
- **Els números de les comarques petites de la costa van al mar** amb una
  ratlleta (`mar`): el Barcelonès, el Garraf, el Baix Penedès, el Tarragonès
  i el Maresme són massa petits per al dit. I tocant el mar, compta el número
  més proper.
- **Cada dau surt de la llavor i del seu número d'ordre** (`dau`): la mateixa
  batalla, jugada igual, treu els mateixos daus. Per això la del dia és justa
  i, si tanques a mig torn dels altres, en tornar-hi el tornen a jugar igual.
- **La màquina** (`iaTorn`) reforça la frontera on té més a guanyar, ataca
  només quan té 2 soldats més (`AGRESSIU`), va a completar vegueries i, si
  algú s'acosta a les 30, li va al darrere.
- **Tu tens avantatge, a posta: 45 soldats contra 35 i 2 de propina cada
  torn.** Al principi anaven tots tres igualats, i en Carles la trobava molt
  difícil. Era veritat: són dos contra tu, i jugant tan bé com la màquina en
  guanyaves 27 de 80; un jugador automàtic que en sap poc (reforça una
  frontera qualsevol, ataca a l'atzar quan en té més i no mou mai), 2 de 25.
  Ara, jugant com la màquina, en guanyes unes 72 de 80 en unes 7 rondes, i el
  que en sap poc, unes 23. Guanyar és el normal, i la taula del dia la fa qui
  guanya **més de pressa** (50 punts per ronda que sobra). Ho mira el
  `scripts/prova-conquesta.mjs` amb tots dos jugadors.
  Les batalles començades abans del canvi (sense `S.ajut`) i la del 4 de
  novembre del 2026, que ja havia jugat algú, van sense avantatge
  (`AJUT_DES_DE`), que si no la taula d'aquell dia no seria justa.
- **Els torns dels altres es veuen a poc a poc** i amb **▶▶ DE PRESSA** (o
  tocant el mapa) passen de cop fins que et torna a tocar.
- **L'explicació de com es juga** (`PAGINES`, sis pàgines curtes amb
  exemples de daus i de comarques) surt sola el primer cop que comences una
  partida, i sempre amb el botó **?** de sota (a la pàgina del pas on ets) i
  des del menú. En Carles no va entendre com es jugava: el joc no ho
  explicava enlloc. Mentre és oberta, el joc queda aturat.
- **Els daus surten grossos a dalt del mapa** (`ensenyaDaus`): els de qui
  ataca a dalt, els de qui defensa a sota, cada un davant del que li toca, i
  el que perd la parella queda apagat. Rodolen una mica (de mentida: el
  resultat ja hi és) i se'n van sols. En Carles preguntava on eren els daus:
  abans només sortien petits a la ratlla de sota del mapa.
- **Els daus s'han de poder seguir.** Després en Carles no els entenia:
  surten massa daus diferents i van massa de pressa. Era veritat. Als torns
  dels altres, cada tirada durava 0,18 s i els daus en trigaven 0,28 a
  rodolar, o sigui que **mai no s'arribaven a veure els de debò**, només els
  de mentida de quan rodolen. Ara:
  - cada tirada **s'atura i es queda** (1,5 s; 0,9 s si n'hi ha més de 4),
    i **el resultat dels teus atacs es queda fins que toques la pantalla**
    (o 12 s). Tocant on sigui marxa; tocant el quadre mateix, aquell toc no
    fa res més al mapa. En Carles no tenia temps de llegir-lo;
  - **ATAC A FONS ensenya totes les tirades**, una darrere l'altra
    («tirada 2 de 5»), i al final el total;
  - als torns dels altres, **les tirades seguides contra la mateixa comarca
    es junten** (`iaSeguent`, que mira el pas següent abans d'hora): se'n
    veu l'última, quieta 2,2 s, amb el total. Una per una, cada torn duraria
    mig minut;
  - el dau que perd porta un **−1**, el que no té parella surt **ratllat**
    (no compta), cada filera diu de qui és (TU, VERMELLS...) i a sota hi ha
    la regla: el més alt contra el més alt, i si empaten guanya qui defensa.
  - **diu per què cadascú tira els daus que tira** («Tu tires 3 daus, el
    màxim. Els grocs tiren 1 dau: només hi tenen 1 soldat.»). En Carles va
    veure 3 daus seus contra 1 i no entenia com comptava;
  - **si l'atac és al nord del mapa, el quadre va a baix** (`abaix`), que a
    dalt tapava justament les comarques que estaves tocant.

## Les Quatre Colles: setze paraules, quatre colles

En Carles va demanar un joc «diferent i intel·ligent». És **inspirat en** el
*Connections* del New York Times (el segon joc de paraules més jugat del món
després del Wordle), amb nom nostre: en català no n'hi havia cap.

- **16 paraules** en una graella de 4 × 4; s'han d'agrupar en **4 colles de
  4** que tenen alguna cosa en comú. Toques quatre paraules i COMPROVA. Si
  és bona, es fa una barra de color amb el títol de la colla.
- **4 errors** i s'acaba. Si n'hi havia 3 de la mateixa colla, diu
  «Gairebé!». El mateix intent dues vegades no torna a comptar.
- **Colors per dificultat**: groga (la més fàcil), verda, blava i lila, que
  sol ser un joc de paraules (al revés, amaguen un número, comencen per una
  nota...).
- **Punts**: 100 per colla i, si les trobes totes, 50 per cada error que et
  sobra (600 sense cap error). Taula del dia (`colles_dia/<data>`) i **colles
  de sempre** (`colles`, acumulades, cadascú una vegada). El bot anuncia cada
  matí qui va guanyar la d'ahir.
- **El que s'envia al grup són els colors de cada intent** (🟨🟩🟦🟪), mai
  les paraules.
- **L'arxiu**: les dels dies passats (fins a 30 enrere), que no compten.
- Botons: `BARREJA` i `DESMARCA` petits als costats, `COMPROVA` gros al mig
  (la trampa 3).

Coses que no s'han de desfer sense entendre-les:

- **Les partides són escrites a mà** (`COLLES`, dins del joc), 60 de moment (la darrera, la #60, és la del 22 de desembre del 2026).
  Cada dia surt la següent **en l'ordre en què estan escrites** (no
  barrejades: així es tria quina va primer, i les fluixes no surten mai al
  principi). La #1 és la del 24 d'octubre del 2026. Quan s'acaben, tornen a
  començar: **cal anar-ne afegint al final**.
- **Els paranys són la gràcia, però només hi pot haver una solució.** Una
  paraula pot semblar de dues colles (la PINYA, fruita i part del castell),
  però aleshores l'altra colla ja ha de tenir les seves quatre: si dues
  paraules es poguessin intercanviar, hi hauria dues solucions bones i el
  joc en donaria una per dolenta.
- **La lletra de cada casella es mesura de debò** (`ajustaLletra`) i no baixa
  de 10 px; si CARNESTOLTES no hi cap ni així, s'estreny una mica. Calculant
  per lletres, les amples (M, W) se sortien.

El `scripts/prova-colles.mjs` mira que totes les partides tinguin 4 colles
de 4 i 16 paraules diferents, que la del dia sigui igual per a tothom, i
que es jugui tocant: encertar, el «gairebé», no pagar dues vegades el mateix
intent, desar i continuar, guanyar, perdre, l'arxiu, les dues taules i que
la paraula més llarga hi càpiga a 320 px.

## El Poble del Dia: endevina el municipi

En Carles el va triar entre quatre idees de millora. És **inspirat en** el
*Worldle* (endevinar un país per la silueta), amb els municipis de Catalunya
i nom nostre.

- Cada dia hi ha **un municipi amagat**: se'n veu la **silueta** (amb el nord
  a dalt i una regla de quilòmetres, que la mida també és una pista) i tens
  **6 intents**. A cada intent, **a quants km** és el bo, **cap on** (una
  fletxa, com en un mapa) i un **%** de com t'hi acostes (100% al bo, 0% a
  300 km). Els intents surten numerats al mapa de Catalunya del costat.
- **Pistes** (`PISTES_ARA`): al cap de 2 intents fallats, la comarca (i al
  mapa s'il·lumina); al cap de 4, per quina lletra comença (sense l'article),
  i al cap de 5, **com es veu el nom**, amb la primera lletra de cada paraula
  (`esquelet`: «S___ C____ d__ V_____»). Al principi eren al cap de 3 i de 5,
  i sense la del nom, i en Carles el trobava molt difícil: la silueta d'un
  poble no la coneix gaire ningú. Els tres primers dies (#1 a #3), que ja
  s'havien jugat, van amb les d'abans (`PISTES_ABANS`), que la taula del dia
  sigui justa.
- **Tocant el mapa surten els pobles d'aquell lloc** (`aPropDe`): el que hi
  ha a sota del dit i els dos que tenen el centre més a prop, al lloc dels
  suggeriments, i tocant-ne un és un intent. Per acostar-te amb els km i la
  fletxa calia saber noms de pobles de cada zona; ara n'hi ha prou de tocar
  cap on diu la fletxa. Escrivint, tornen a sortir els noms.
- **S'escriu amb un teclat propi**, que el del mòbil taparia la silueta i el
  mapa, i a sobre surten els municipis que hi encaixen: **es toca el nom**, no
  s'envia el que has escrit, i així no hi ha faltes d'ortografia possibles.
  Sense accents ni apòstrofs, i per qualsevol paraula del nom («hospi»,
  «llobregat» o «seu» troben el que toca; `busca`). A l'ordinador, la P
  s'escriu (Pals, Puigcerdà): només fa pausa la P de mentida del botó del
  marcador, com a L'Abecedari.
- **Punts** (`punts`): endevinar-lo al 1r intent, 1.000; al 2n, 900... al 6è,
  500. Si no, **400 menys els km** del que t'hi has quedat més a prop: també
  perdent, qui s'hi acosta més va davant. Taula del dia (`poble_dia/<data>`,
  surt «3/6» o «✗ 12 km», `Records.formata`) i **pobles endevinats**
  (`poble`, acumulats, cadascú una vegada). El bot anuncia cada matí qui el
  va guanyar, i compta per a la lliga.
- **El que s'envia al grup són els colors i les fletxes** (🟩🟩🟩⬜⬜ ↗️), mai
  els noms. Al final hi ha un enllaç a la Viquipèdia (una cerca, que si el
  títol no hi coincideix exactament et deixa a la llista).
- **PRÀCTICA**: un altre poble a l'atzar, que no compta.

Coses que no s'han de desfer sense entendre-les:

- **Les dades són les mateixes de La Conquesta**: la Base municipal de l'ICGC
  via `gmarull/cat-topojson` (CC BY 4.0), amb la mateixa
  projecció. Són **siluetes simplificades** (uns 16 punts per municipi de
  mitjana): no n'hi ha de més fines que es puguin baixar des d'aquí, i per al
  joc ja van bé. Van **dins del joc** (`NOMS`, `COMARCA`, `CENTRES`,
  `SILUETES`), codificades en enters de 5 en 5 bits: 79 KB. El script que les
  fa no és al repositori.
- **La llicència del mapa demana dir d'on surt, i a la vista**: al principi
  només ho deia el codi. Ara surt a la benvinguda i al quadre del final
  (`CREDIT`), com a La Conquesta surt al menú, i la prova ho mira.
- **Els noms són els d'ara**, no els del mapa d'origen: la Ràpita, Calonge i
  Sant Antoni, Bigues i Riells del Fai i Brunyola i Sant Martí Sapresa. El
  Lluçanès és la comarca 43, com a la Conquesta. **Medinyà** (2018) no hi és:
  el mapa d'origen és d'abans, i encara era de Sant Julià de Ramis.
- **Puigdàlber, al mapa d'origen, és una ratlla sense àrea**: no té silueta i
  el seu centre és el mig dels punts. Es pot provar com a intent, però no és
  a la llista dels del dia.
- **El centre de cada municipi és el centre de masses** del seu polígon, no
  l'ajuntament. Els municipis amb trossos (Barcelona en té quatre) el tenien
  a fora fins que es va arreglar el càlcul: amb els trossos en sentits
  diferents, les àrees es restaven, i Barcelona–Girona sortia a 98 km en lloc
  de 86. La prova mira tres distàncies de debò i quatre fletxes.
- **El del dia surt dels pobles coneguts** (`CONEGUTS`, 257, escrits a mà):
  les capitals de comarca, les viles grosses, els de la costa i els que surten
  a les postals. Amb un poble de 200 habitants que no coneix ningú, la silueta
  no diria res i seria una loteria. Van barrejats amb la seva llavor
  (`POBLE-<tanda>`), **cap no es repeteix fins que no han sortit tots** i
  mai dos dies seguits (`pobleDe`). El #1 és el del 2 de novembre del 2026.
  Els intents, en canvi, poden ser qualsevol dels 947.
- El del dia es desa a cada intent (`poble-<data>`), amb el poble: si algun
  dia canviés la llista, el desat d'un altre poble no es carrega.

## El Trencaclosques: el del dia i el de les teves fotos

En Carles va demanar poder pujar una foto i que el joc en fes un
trencaclosques. N'hi ha dos:

- **El d'avui**: un paisatge que **es pinta sol** a partir del número del
  dia (`paisatge(n)`: cel de quatre hores diferents, globus, ocells,
  muntanyes, a vegades una serra com Montserrat i un llac, camps, un poble
  amb campanar, arbres, un camí i flors). És igual per a tothom, té 35 peces
  (5 × 7, quadrades) i va a la taula del dia. El #1 és el del 25 d'octubre
  del 2026. Ha de tenir moltes coses diferents: amb un cel llis, la meitat de
  les peces serien iguals i seria una loteria.
  **Cada dia, una escena diferent** (`escenaDe(n)`): el poble, la cala (mar,
  far, barques, platja), l'alta muntanya (cims nevats, avets, refugi, ninot
  de neu), el castell i les vinyes (amb una barraca de pedra seca), el bosc
  a la tardor (riu, pont de pedra, ermita, bolets) i la masia amb els
  gira-sols. Van per tandes de sis barrejades amb la seva llavor, i **mai no
  surt la mateixa dos dies seguits**. Al principi tots eren el poble i només
  canviaven els colors i el lloc de les coses: en Carles es pensava que li
  tornava a sortir el d'ahir. Els sis primers (#1 a #6) es van quedar com
  eren, que el #6 ja s'estava jugant. El nom de l'escena surt al menú i a
  dalt del joc.
- **Amb una foto teva**: es tria de la galeria o es fa amb la càmera (un
  `<input type=file>`). **La foto no surt mai del mòbil**: es llegeix, es
  redueix a 1.200 px i es talla allà mateix; per poder continuar, es desa
  reduïda a `localStorage` (`trencaclosques-foto-img`). Es tria de 12 a 80
  peces, repartides perquè surtin com més quadrades millor (`graella`), i
  si és més llarga que 2 per 1 es retalla pel mig. No compta per a res.

Coses que no s'han de desfer sense entendre-les:

- **Peces de debò, amb pestanyes** (`fesVores`, `voresDe`, `cami`): cada
  vora de dins té una pestanya que surt d'una peça i entra a l'altra, amb un
  petit desplaçament (`d`) perquè no totes siguin iguals; la veïna la té al
  revés (`-s`, `-d`). La prova comprova que totes encaixin.
- **La peça encaixa sola** quan la deixes a menys d'un terç de peça del seu
  lloc, i ja no es mou. Si la deixes lluny, es queda per la taula (i es pot
  tornar a moure); si la deixes sobre la safata, hi torna.
- **La safata és a sota**, amb pàgines (◀ ▶) i, si hi ha lloc, dues fileres:
  amb una sola i de tres en tres, 35 peces eren 12 pàgines. **VORES PRIMER**
  posa les de la vora al davant, que és per on comença tothom. **MODEL**
  ensenya la imatge clareta dins del marc, com la foto de la capsa.
- **La peça que treus de la safata surt una mica per sobre del dit**, que si
  no el dit la tapa i no veus on la poses.
- **Un sol dit alhora, i cap peça pot quedar enlloc** (`repara`). En Carles
  va acabar amb 33 de 35 i la safata buida: tocant una segona peça mentre en
  portava una altra (dos dits, o el palmell), la primera es quedava a l'aire,
  fora de la safata i de la taula, i no es veia mai més. Ara el segon dit no
  agafa res, la peça que portes es desa a la safata si es desa a mig
  arrossegar, i en obrir una partida desada, la peça que no és enlloc torna a
  la safata.
- **Cada peça es pinta un sol cop** en un llenç a part i després només
  s'enganxa (com les fruites del Síndria): amb 80 peces, retallar-les a cada
  fotograma anava a batzegades.
- **La taula diu el temps, no punts.** La puntuació que es desa és 3.600
  menys els segons (com més de pressa, més punts), però a la taula, al
  marcador i al missatge del bot surt «3:12». Per això el `records.js` té
  `Records.formata(prefix, fn)`: el joc hi apunta com s'ha d'escriure la seva
  taula, i `taulaHTML` i el marcador ho fan servir. Al Worker, `temps()`.
- **El rellotge només corre mentre jugues**: no amb el menú obert, ni en
  pausa, ni si surts de l'app. Es desa cada dos segons i a cada peça.

El `scripts/prova-trencaclosques.mjs` mira que el paisatge surti igual per a
tothom, que totes les peces encaixin amb les veïnes, i que es jugui amb el
dit de debò (arrossegant): treure de la safata, encaixar, deixar per la
taula i tornar a moure, tornar a la safata, les vores, el model, desar i
continuar, acabar-lo (i que la taula digui el temps), i fer-ne un amb una
foto, que no s'apunta enlloc.

## El Temple: aventura per caselles

En Carles va demanar un joc d'aventura «de descobrir coses», com un Indiana
Jones o el Prince of Persia. El Prince of Persia (1989, de l'Apple II) és el
pare del gènere i el Temple n'és **inspirat**: sales que es veuen d'una en
una, trampes, reixes que s'obren amb una placa, terra que cau, i un explorador
amb barret i fuet que no és ningú en concret. De l'Indiana Jones només n'hi ha
l'aire: l'ídol d'or al fons i el temple que s'ensorra quan l'agafes.

- **El temple és una sola graella** (`MAPA`, 50 × 12 caselles), i cada sala
  en fa 10 × 3. Passar d'una sala a l'altra és anar a la casella del costat: no
  hi ha cap costura entre sales que es pugui descosir. Les sales sense res
  (tot `#`) no compten ni surten al mapa.
- **Tot va per caselles, com al Prince of Persia**: un pas, un salt o una
  enfilada fan sempre el mateix. Al mòbil no hi ha manera de fer un salt
  «just» amb el dit; així el que has de pensar és cap on, no si t'ha sortit
  bé. Les regles són les funcions `mou*` (entre `==REGLES==` i `==FI
  REGLES==`), i les fa servir tant el joc com la prova.
  - **SALTA** passa forats de fins a **dues** caselles i aterra a la primera
    rajola bona (les punxes no ho són). Amb una casella de carrerilla arriba
    una mica més lluny, però mai més de dues de forat.
  - **▲** t'enfila a un replà si tens un forat a sobre i el replà al costat.
  - **Caure un pis no fa res, dos pisos treu un cor, tres o més mata.**
    **▼** a la vora et fa baixar penjat i compta un pis menys: és la manera de
    baixar dos pisos sense fer-te mal.
  - **Caminant seguit et pares a la vora d'un forat**; per baixar-hi has de
    tornar a prémer. Al mòbil, sense això, et quedaves amb el dit a la fletxa
    i queies a cada clot.
  - **FUET**: primer fa fora la serp que tens davant (fins a dues caselles),
    si no, trenca la paret esquerdada del costat, i si no, si hi ha una anella
    al sostre a una o dues caselles, hi passes penjat. Les anelles són per als
    forats de tres, que no es poden saltar.
- **Les pedres amb lletres (`T`, textos a `TEXTOS`) són el tutorial**: diuen
  què fa cada botó just abans del primer lloc on cal. Ningú no llegeix les
  instruccions abans de jugar.
- **En perdre un cor, uns segons sense que et puguin fer res** (`IMUNE`) i
  parpelleges; la serp a més t'empeny una casella enrere. **En perdre una
  vida** tornes a la primera casella segura de la sala on vas entrar
  (`cp`), amb els cors plens i dos segons d'immunitat.
- **El temple s'ensorra** quan agafes l'ídol: 150 segons (`ENSORRA`) per
  tornar a la porta. El camí de tornada és nou: una torre per on s'enfila, i
  una reixa a dalt de tot que **s'obre des de dins** i fa de drecera fins a
  les primeres sales. El pilot automàtic hi tarda 16 segons; una persona que
  no ha vist mai la torre, molt més, i per això n'hi ha tants. Si s'acaba el
  temps, perds una vida i tornes on era l'ídol amb el temps sencer.
- **La partida es desa** a cada sala nova (`temple-partida`), com a La
  Impremta: tornant al menú a mig temple no es perd res.
- **El repte, com a La Impremta**: al quadre del final hi ha REPTA PER
  TELEGRAM / PER WHATSAPP / COPIA L'ENLLAÇ, amb
  `#repte=1&n=INICIALS&p=PUNTS&s=1` (`s=1` si va sortir amb l'ídol). Com que
  el temple és el mateix per a tothom, no cal llavor: qui l'obre veu al menú a
  qui ha de superar i, en acabar, qui ha guanyat. En Carles el va demanar.
- **El mapa de sota només ensenya les sales que ja has vist**, amb els
  tresors que hi queden. Les parets esquerdades hi surten com les altres: són
  secrets.

**Set nivells** (`NIVELLS`), i en sortir de cada un es baixa al següent amb els
punts, les vides i els cors que portes (la taula només rep els punts en
acabar-ho tot o en morir). En Carles va demanar un nivell més complicat «i que
vagin sortint més coses». **Les Catacumbes** (20 sales, la màscara de jade,
120 segons per sortir) en porten tres de noves:

- **Ratpenats** (`B` a sobre d'una rajola, `b` a l'aire): volen per la seva
  filera sense parar, **també per sobre dels forats**, i et toquen encara que
  saltis. El FUET també els fa fora (75).
- **La roca que rodola** (`O`, i la placa `R` que la desperta): tremola mig
  segon i rodola cap a la placa, és a dir, cap a tu. Si et toca, perds una
  vida. Cau pels forats i, on s'encalla contra una paret, **s'hi queda i fa de
  paret** (`camiRoca`): dins d'un clot, fa de pont. Quan parpelleges, no et fa
  res, que si no reapareixeries a sota d'una roca que encara roda.
- **La reixa que s'obre una estona** (placa `q`, amb un rellotge de sorra):
  quatre segons (`TEMPS_REIXA`) i es torna a tancar, baixant a poc a poc. Si
  ets a sota, espera que surtis. Es desa sempre tancada.

I la fossa: **sota el temple no hi ha res**. Un forat a la filera de baix de
tot no té fons i mata (`aguanta` no compta la paret de fora del mapa). El pont
de sobre és de terra que cau, de dues caselles: si cau, el forat encara es
pot saltar, que si no reapareixeries a l'altra banda sense poder passar.

**El Santuari**, el tercer (20 sales, la corona del sol, 100 segons per
sortir, comences mirant a l'esquerra: `dir:-1`), en porta dues més, perquè en
Carles el va voler «encara més difícil»:

- **Parets de fletxes** (`<` i `>`, fan de paret i disparen cap a on miren):
  cada 2,6 segons (`PERIODE_FLETXA`), cadascuna amb el seu ritme, i la boca
  s'encén mig segon abans. La fletxa va a l'alçada del cap i **s'ajupint-te
  (▼ quan no hi ha res per baixar) et passa per sobre**. Només disparen les
  de la sala on ets, i la fletxa desapareix en sortir de la sala. Compte a on
  es posen: a tocar d'una vora, ▼ et fa baixar penjat i no t'ajups.
- **Esquelets guardians** (`K`): patrullen com les serps però, si et veuen a
  la seva filera, venen cap a tu. **Dos cops de FUET**: el primer els fa
  trontollar i recular mitja casella, el segon els desfà (100).

I les roques maten les bestioles que troben pel camí. Al santuari n'hi ha una
que **et ve de cara**: per sobreviure has de pujar al replà i deixar-la passar
per sota (el pilot automàtic ho fa buscant una casella fora del camí de la
roca).

**No hi ha cap fletxa que digui on és la sortida.** N'hi va haver una
(en Carles va tornar pel camí d'anada fins a una reixa que només s'obria de
l'altra banda i es pensava que s'havia quedat tancat), però després la va
voler treure: trobar la sortida forma part del joc. El que sí que s'hi va
quedar: **les reixes amb temps tenen placa a totes dues bandes**, que davant
d'una reixa no et quedis mai sense res a fer.

**Les Profunditats**, el quart (20 sales, l'ull de maragda, 130 segons per
sortir), **a les fosques** (`fosc:true`): només s'hi veu al teu voltant, a les
torxes, a la porta, al tresor i a les boques de les fletxes quan van a
disparar (`dibuixaFoscor`). I una cosa nova:

- **Aranyes** (`X`): baixen del sostre per un fil i tornen a pujar
  (`CICLE_ARANYA`, 2,8 segons, 1,2 a dalt). Et piquen si ets a la seva casella
  quan han baixat, saltis o no. El FUET només les fa fora quan baixen (75).

El pilot automàtic hi necessita uns 46 segons per sortir amb el tresor (s'ha
d'esperar a les aranyes, als ratpenats i a les fletxes de la torre), i per
això el temps és més llarg que al tercer, no més curt.

**El Volcà**, el cinquè (20 sales, el cor de foc, 90 segons per sortir,
comences mirant a l'esquerra). En Carles va demanar el cinquè nivell, i en
porta tres coses noves:

- **Lava** (`L`): no s'hi pot caminar (`mouCamina` s'hi para, i diu que la
  saltis), i si hi caus —un salt que no hi arriba, terra que cau a sobre—,
  et cremes i perds una vida. No és `segur`, així que no hi aterres mai si
  hi ha una rajola bona a l'abast, i no hi pots reaparèixer. Les serps, els
  esquelets i el guardià s'hi giren, i **la roca que hi cau s'hi fon**
  (`camiRoca` torna `fi:null`): no fa de pont.
- **Estalactites** (`V`): quan passes per sota, tremolen mig segon i cauen
  (`TREMOLA`, `CAU_ESTAL`). Si encara hi ets, et treuen un cor; caminant
  seguit, cauen darrere teu. Només cauen una vegada, i es desa quines.
- **El guardià** (`G`): un esquelet més gros, amb casc i espasa, que guarda
  el tresor. **Quatre cops de FUET**, cada un el fa recular una casella
  sencera, i als punts vermells de sobre el cap es veu quants li queden
  (500 punts). És als `esquelets` amb `gran:true`.

El pilot automàtic, sota una estalactita que ja tremola, no espera res: hi
passa de llarg. Hi necessita 14 segons per sortir amb el tresor.

**La Cova de Gel**, el sisè (14 sales, la corona de gel, 100 segons per
sortir). En Carles va demanar un nivell més quan anava pel Volcà, i va triar
aquest entre tres idees. En porta tres coses noves, i les tres demanen pensar:

- **Gel** (`=`): **caminant-hi, llisques** fins que topes amb alguna cosa o
  s'acaba el gel (i si s'acaba en un forat, hi caus). **Saltant, no**: on
  caus del salt, t'hi quedes, encara que sigui gel. És la manera d'aturar-se
  a mig gel, i la inscripció ho diu. Ho fa `mouCamina` (i per això també el
  pilot i la prova del mapa); el salt no llisca a posta, que si no no hi
  hauria manera d'aturar-se. Caminant seguit, si el lliscament acabaria en
  un forat, et pares abans de començar, com a la vora de qualsevol forat.
- **Blocs de gel** (`C`): caminant-hi contra, **l'empenys** una casella i
  passes on era (`mouEmpeny`, `empenyBloc`, `aplicaBloc`). Al gel llisca
  fins que topa, i si es queda sense terra, cau. On s'atura **fa de paret**:
  a sobre s'hi pot caminar (dins d'un forat, fa de pont), s'hi pot pujar i
  **les fletxes no el travessen**. El que hi havia a sota de cada bloc es
  guarda a `SOTA`, i es desa amb la partida.
- **Fantasmes de gel** (`F`): **travessen les parets** i et venen a buscar a
  poc a poc (`VEL_FANT`), sense sortir mai de la seva sala. Si et toquen,
  et treuen un cor i s'allunyen un parell de segons. Un cop de FUET els
  desfà (100).

I els caramells del sostre són les estalactites del Volcà, i hi ha una
paret de fletxes.

Els blocs són perillosos per al mapa: **un bloc empès on no tocava pot
deixar el temple sense sortida**. Per això cada bloc està posat de manera
que **només es pot empènyer cap on cal** (no hi ha manera de posar-se a
l'altra banda) i, on va, ja hi fa la seva feina: al forat de la segona sala
fa de pont, a la quarta llisca fins a la paret de les fletxes (les tapa i fa
de graó per pujar), i a la del tresor llisca fins al forat i fa el pont per
saltar fins a la corona. **Sense moure'ls, al tresor no s'hi arriba**: la
prova ho mira. Si mai se n'hi afegeix un, ha de ser igual.

Els forats que s'han de creuar amb un bloc tenen **la columna de l'altra
banda fonda**: si el fons fos a un pis, caient-hi i enfilant-te per l'altra
banda creuaries sense el bloc. La columna on cau el bloc sí que és d'un pis,
que si no el bloc cauria massa avall i no faria de pont.

El camí de tornada és per sota: des de la corona baixes penjat (▼), corres
cap a l'oest per un passadís nou, una placa obre la reixa des de dins i
s'enfila per una torre fins a la porta. El pilot hi tarda uns 15-20 segons.

**La cova era massa fàcil**, va dir en Carles quan el va acabar. Era el nivell
més curt (14 sales) i tenia poca cosa a més del gel. Sense tocar els blocs
(que són el que fa que tingui sortida), s'hi va afegir: **80 segons per
sortir en lloc de 100**; **punxes on s'acaba el gel**, de manera que
lliscant hi vas a parar (a la segona sala i al passadís de tornada);
esquelets al costat del pont del bloc i a la sala de les gemmes; un
fantasma més a dalt de tot, i el passadís de tornada, que abans era una
cursa sense res, ara té un esquelet, un fantasma, un ratpenat, punxes i una
estalactita a la torre. El pilot hi tarda uns 22 segons.

**La Tomba del Rei**, el setè (19 sales, el ceptre del rei, **60 segons per
sortir**). En Carles va demanar un nivell més, i en porta dues coses noves:

- **Mòmies** (`M`): caminen com els esquelets, més a poc a poc, però **no
  es desfan mai**: un cop de FUET les tomba a terra uns segons
  (`JAU_MUMIA`, 4) i després s'aixequen. Mentre són a terra no fan mal i hi
  pots passar per sobre. No donen punts (si no, se'n farien a cops de fuet).
  Són als `esquelets` amb `mumia:true`.
- **Portals** (`1`, `2`, `3`): dues caselles amb el mateix número i el mateix
  color (`COLP`: lila, turquesa, taronja). **Arribant a l'un, surts per
  l'altre** (`surtPortal`, a `arriba`), i allà quiet no et torna a portar.
  Funcionen en tots dos sentits, i per això no et poden deixar mai tancat.
  El de la tercera sala de sota (lila) salta una paret que no es pot passar;
  tornant-hi, et torna enrere, i per seguir cal **saltar per sobre del
  portal**. El taronja porta a una cambra del tresor que no té cap altra
  entrada. I el turquesa és **el camí de tornada**: des del ceptre, cap a
  l'oest per un passadís amb fletxes, una aranya i una mòmia, et porta a dalt
  de tot, a un racó tancat amb una reixa que només s'obre des de dins (com
  al primer temple), i d'allà a la porta. Abans d'agafar el ceptre també hi
  pots entrar, saltant-lo, però a dalt no et deixen sortir sense ell.

El pilot automàtic i la prova del mapa tenen en compte els portals: un
moviment que acaba en un portal acaba a l'altre.

**Cada nivell es reconeix**: en començar-lo (o en continuar-lo) surt uns
segons un rètol gran al mig, NIVELL 2 DE 7 · LES CATACUMBES, i el nom del
nivell queda sempre escrit a sota del mapa. I **cada nivell té els seus
colors** (`colors` a `NIVELLS`, que es copien a `COL`): pedra de color sorra
al temple, grisa i blavosa amb foc blau a les catacumbes, vermellosa de
terracota al santuari, morada a les profunditats, i negra i cremada amb foc
taronja al volcà. En Carles ho va demanar. El fons de cada sala es desa
per nivell (`fonsCache`), que si no es veurien els colors de l'anterior.

**Tornar a començar és petit i pregunta.** Si tens una partida a mig fer (o
un punt de control), el menú no ensenya cap botó gros de COMENÇA DE NOU: el
gros és CONTINUA (o TORNA A...), i a sota de tot hi ha un text petit,
«començar des del primer nivell». Si hi ha partida a mig fer, abans pregunta
(SEGUR?, amb el nivell i els punts que perdries, i NO, TORNA ENRERE com a
botó gros). En Carles portava un parell de nivells i el podia tocar sense
voler. Sense partida a mig fer no pregunta: no es perd res, el punt de
control es queda.

**El punt de control** (`temple-control`): en arribar a un nivell que no és
el primer, es guarda quin és, amb els punts i els cors màxims que hi portes.
Si hi perds totes les vides, el quadre del final ofereix TORNA A LES
CATACUMBES, i el menú també (si no hi ha cap partida a mig fer): tornes a
començar aquell nivell amb tres vides i **els punts d'entrar-hi, no els que
tenies en caure**, que si no repetint-lo s'anirien sumant. En Carles ho va
demanar: fallant al segon havia de refer el primer, i la idea és que n'hi
hagi uns quants. Acabant-ho tot, el punt de control s'esborra.

En Carles es trobava, de tant en tant, que en tornar a entrar començava pel
primer nivell. Passaven dues coses:

- **Tancar en acabar un nivell ho perdia tot.** Al quadre de BAIXA-HI la
  partida ja s'havia esborrat, i el punt de control del nivell de sota no es
  guardava fins que no premies el botó. Ara es guarda en el moment d'acabar
  el nivell (`desaControl(nivell+1)` a `guanya`).
- **Un cop tornaves a començar pel primer, el nivell on havies arribat
  desapareixia del menú**, perquè només sortia si no hi havia cap partida a
  mig fer. Ara surt sempre que sigui més avall que la partida, i el punt de
  control **no recula mai**: tornant a passar pel segon nivell no esborra el
  quart.

**Els nivells on has arribat es recorden per sempre** (`temple-nivells`,
`apuntaNivell`): el més avall (`max`; si ho has acabat tot, `NIVELLS.length`)
i amb quants punts i cors vas entrar a cadascun. Al menú, **tria un nivell on
ja has arribat** (`triaNivell`) els ensenya tots, i hi tornes amb tres vides i
els punts d'entrar-hi (si tens una partida a mig fer, pregunta abans). Abans,
en acabar-ho tot, el punt de control s'esborrava i no en quedava res: quan es
va afegir el setè nivell, en Carles ja havia acabat la cova i hauria hagut de
tornar a començar pel primer. Per als que ja l'havien acabat abans d'això, el
joc mira el rècord (`PUNTS_COVA`, 35.000: cal haver passat cinc nivells) i,
si hi arriba, posa el punt de control a la cova de gel amb 0 punts (no se sap
amb quants hi havia entrat). Primer mira el d'aquest mòbil i, si no, **el de
la taula de tothom amb les teves inicials** (`covaDeLaTaula`, cada vegada que
surt el menú): en Carles tenia 54.730 punts a la taula però no li sortia res,
perquè l'app instal·lada i el navegador desen cadascun el seu rècord.

Una altra cosa que pot fer el mateix i que el joc no pot evitar: la partida
es desa dins de cada navegador, i l'app instal·lada, el navegador i Telegram
per dins són llocs diferents (com a La Rotllana).

Punts: tresor 100, gemma 300, serp 50, ratpenat 75, esquelet 100, guardià 500, aranya 75,
sala nova 25, l'ídol 2.000 (la màscara 3.000, la corona 4.000, l'ull 5.000, el cor de foc 6.000, la corona de gel 7.000, el ceptre 8.000), fantasma 100, i en sortir de cada nivell 1.000 més 500 per vida i
10 per segon de marge. Qui ho agafa tot sense morir fa uns 8.300 al primer i
uns 70.000 amb els set.

**Si es toca el mapa**, el `scripts/prova-temple.mjs` mira que s'arribi a
l'ídol i es torni a la sortida, que tots els objectes es puguin agafar i, el
més important, **que des de cap lloc on puguis arribar no et quedis tancat per
sempre** (amb el terra que cau ja caigut i tot obert). Les trampes que es
desfan soles (el terra que cau) no poden ser mai l'únic camí de tornada. I
dos pilots automàtics han d'acabar cada nivell: un que va de dret i un que ho agafa tot.

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
dades/              els diccionaris del Garbuix i de La Impremta, i la seva llicència
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
  **El toc que la tanca no ha de prémer res del que queda a sota.** El quadre
  es tanca en posar el dit, i en aixecar-lo el mòbil fa un clic a sobre del
  que hi ha al darrere: a L'Abecedari queia just sobre COMENÇA i la roda
  d'avui començava sola, sense poder triar la difícil. Ara aquell clic es
  llença (`perDit`). Amb el ratolí no passa, i per això la prova
  (`prova-inici.mjs`) toca amb el dit.
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
- **A les partides del dia només compta la primera de cada inicials**, encara
  que la tornis a fer des d'un altre mòbil o des de l'ordinador (al mateix
  mòbil ja no es podia). En Carles va veure que si no, una mateixa persona la
  podia fer dues vegades. El Worker apunta qui ja hi ha jugat a
  `jugat:<joc>_dia:<data>` (a part de la taula, que només té els 10 millors)
  i respon `repetida`; el `records.js` hi envia sempre la del dia, encara que
  no entri als 10, i si és repetida diu que només compta la primera. Amb
  unes altres inicials no es pot evitar: és una llista entre amics.
- **Que el servidor digui que no, no és el mateix que no tenir connexió.** Abans
  el `records.js` ho posava tot al mateix sac i deia "sense connexió" a algú que
  hi estava connectat. Ara distingeix la xarxa (`ultimFall = 'xarxa'`) del
  servidor (`'servidor'`) i el missatge diu la veritat.

## El bot de Telegram

Dues coses, i totes dues **opcionals**: sense la clau del bot, el Worker va
exactament igual que abans i no envia res a ningú.

- **Avisa el grup quan algú passa a ser el número 1** d'un joc: «🏆 MAR ha fet
  5.100 al Ram i passa davant de CAR (4.320)», amb un botó per anar a jugar a
  aquell joc. **Només el número 1**: amb cada entrada al top 10, el grup seria
  un degoteig. Ordres al grup: `/aqui` (avisa aquí), `/prou` (deixa d'avisar),
  `/records` (qui mana a cada joc) i `/records ram` (la taula d'un joc; troba el
  joc pel principi del nom i sense fer cas dels accents).
- **Al xat privat amb el bot hi ha un botó «Jocs»** que obre tota la col·lecció
  dins de Telegram. Als grups, Telegram no deixa posar aquest botó: per això
  allà els avisos porten un enllaç normal.
- **A la portada hi ha un botó «🏆 RÈCORDS AL MOMENT A TELEGRAM»** que porta al
  bot, **@jocs_carles_bot** (el nom d'usuari és públic; la clau, no). Enllaça al
  bot i **mai al grup**: la web és pública, i amb l'enllaç d'invitació del grup
  qualsevol desconegut s'hi podria apuntar. Quan ja jugues des de dins de
  Telegram no surt, que no té sentit. És `a.tg` i no `a.btn`, perquè `a.btn` el
  porten les fitxes dels jocs i el fa servir el codi que recorda l'últim joc
  obert. El `scripts/prova-portada.mjs` comprova que es vegi, que porti al bot i
  que el text hi càpiga a totes les mides.

Com està fet, i per què:

- **La clau del bot no és enlloc del repositori.** Va al tauler de Cloudflare
  com a *secret* amb el nom `TELEGRAM_TOKEN`. Aquest repositori és públic, i
  qui té la clau pot fer parlar el bot. Els secrets no es perden quan es torna a
  enganxar el codi del Worker.
- **Només Telegram pot parlar amb el Worker.** Telegram envia una contrasenya a
  cada missatge (`X-Telegram-Bot-Api-Secret-Token`), i qualsevol petició sense
  ella rep un 403. La contrasenya surt de la clau (un resum SHA-256), així no
  cal guardar-ne una segona.
- **Connectar-lo és obrir una pàgina**: `…/telegram/activa`. El Worker mateix
  diu a Telegram on ha d'enviar els missatges, posa el botó «Jocs» i registra
  la llista d'ordres. Ningú no ha d'escriure adreces amb la clau a dins.
- **L'avís va després de respondre al joc** (`ctx.waitUntil`). El joc rep la
  resposta de seguida i, si Telegram falla o va lent, la puntuació ja està
  desada igualment. Ho comprova la prova del Worker fent fallar Telegram.
- El xat on s'avisa es guarda al KV, a `telegram:xat`.
- Cada joc ha de ser a la llista `FITXA` del Worker (com es diu —«al Ram», «a les
  Boles»— i quin fitxer s'obre). La prova del Worker falla si n'hi falta cap o
  si el fitxer no existeix.

**Dins de Telegram, lliscar el dit cap avall tanca la finestra**, i al Síndria,
al Ram o al Tetris és just el que fas per jugar. El `records.js` ho desactiva
(`disableVerticalSwipes`), però **només dins de Telegram**: ho sap perquè la
primera pàgina arriba amb `#tgWebAppData` a l'adreça, i ho apunta a
`sessionStorage` per quan passes a un joc. Fora de Telegram no es carrega res
de nou. És l'únic codi de fora que carrega la col·lecció.

**La lliga de la setmana** suma totes les partides del dia de dilluns a
diumenge: a cada una, el primer s'emporta 10 punts, el segon 8, i 6, 5, 4, 3,
2, 1, 1, 1 (`PUNTS_LLIGA`), i qui hi ha jugat sense entrar als 10 millors, 1
(surt de `jugat:<joc>_dia:<data>`). **Fer 0 també és haver-hi jugat**: la
Gofra sense acabar, cap colla, cap encert, la Botifarra sense punts... Abans
aquestes partides no s'enviaven i, a la lliga, era com si no hi haguessis
jugat (en Carles ho va preguntar per la Gofra). Ara `Records.fiPartida` les
envia amb 0, sense demanar res, si ja hi ha inicials, i el Worker les apunta
a `jugat:` però no a la taula. No es desa enlloc: es calcula cada vegada
llegint les taules del dia (`lliga()`, 126 lectures del KV com a molt). En
empat, mana qui ha guanyat més partides. `GET /lliga` la torna amb qui guanya
avui cada partida (per a la portada), `/lliga` al grup l'ensenya, i **el
dilluns**, la primera petició del dia anuncia qui va guanyar la setmana
passada amb el podi (`anunciaLliga`, marcat a `telegram:anunciat:lliga` abans
d'enviar, com els de cada matí). És dilluns i no diumenge al vespre perquè el
Worker no té rellotge: tot ho engega la primera visita del dia.

**Les medalles de sempre** (el palmarès): cada dilluns, la setmana passada es
tanca i el seu podi s'apunta per sempre a `lliga:palmares` (copa al primer,
plata i bronze als altres dos), **amb bot o sense** (`tancaSetmana`, a la
primera petició del dia). Si en falta més d'una (el Worker no s'ha tocat en
setmanes), en tanca una per petició, que cada una són fins a 126 lectures. La
primera que compta és la del 26 d'octubre del 2026 (`PRIMERA_SETMANA`), la
que el bot ja va anunciar. Si dues peticions alhora tanquen la mateixa
setmana, en llegir-ho només compta un cop (`llegirPalmares`). A la portada
surten els cinc primers a sota de la lliga (i tu, si no hi ets), `/lliga` al
grup també les ensenya i l'anunci del dilluns diu quantes copes porta qui
guanya. En Carles ho va demanar.

Per posar-lo en marxa (ho fa en Carles, una sola vegada):

1. Enganxar el `worker/records.js` nou a Cloudflare i **Implementar**.
2. A Telegram, parlar amb **@BotFather**, `/newbot`, i copiar la clau que dona.
3. Al tauler de Cloudflare, al Worker, **Configuració → Variables i secrets →
   Afegir**, de tipus **Secret**, amb el nom `TELEGRAM_TOKEN` i la clau com a
   valor.
4. Obrir `https://jocs-records.oscarbellosido.workers.dev/telegram/activa`: ha
   de dir «Fet!».
5. Afegir el bot al grup i escriure-hi `/aqui`.
6. Recomanat: al @BotFather, `/setjoingroups` → *Disable*, perquè ningú més el
   pugui ficar al seu grup i fer-hi `/aqui`.

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

**Com es mira si hi cap** (això va estar malament molt de temps): es mirava si
dos rètols havien quedat a alçades diferents. Però el marcador es partia de
dues maneres que allò no veia:

- El `records.js` mateix posava `flex-wrap:wrap` al marcador en afegir-hi el
  botó del so, i s'hi quedava per sempre. Així no se sortia de la pantalla,
  però es quedava partit i menjant camp de joc, i la lletra no s'encongia mai
  perquè, un cop partit, ja hi cabia tot.
- O es partia el text de **dins** d'un rètol («PUNTS» a dalt i «999999» a
  sota). El marcador creix d'alt i cap germà no s'ha mogut de lloc.

Ara, mentre mesura, el marcador s'obliga a **una sola ratlla** (`white-space`
i `flex-wrap` a `nowrap`): el que no hi cap sobresurt, i sobresortir sí que es
pot mesurar (`scrollWidth`). Només si ni a 10 px hi cap se'l deixa partir.
Amb l'arreglo, el Galaxian i el Galaga ja no es parteixen amb un rècord de sis
xifres a la barra, i el Defender encongeix de debò fins a 10 px.

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

- `node scripts/prova-worker.mjs` — el Worker contra un KV simulat, i el bot de
  Telegram contra un Telegram de mentida (res no surt a internet).
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
- `node scripts/prova-xifres.mjs` — que cap ronda del Xifres surti sense
  solució, que la dificultat pugi de debò i que es pugui jugar tocant.
- `node scripts/prova-lander.mjs` — que al Lunar Lander aterrar i estavellar-se
  vagin com toca, que la partida sempre s'acabi (el descens més barat ha de
  costar més que el premi) i que un pilot automàtic hi aterri.
- `node scripts/prova-garbuix.mjs` — que el diccionari del Garbuix es
  carregui, que es rebutgin les paraules curtes i les que no existeixen, que
  només s'encadenin lletres que es toquen, que sempre hi hagi paraules per fer
  i que la partida s'acabi.
- `node scripts/prova-gofra.mjs` — que la Gofra del dia sigui la mateixa per
  a tothom, que les de l'any que ve es puguin fer i es resolguin amb 10
  intercanvis justos, que els colors diguin la veritat, que es jugui tocant i
  arrossegant, que guanyar i perdre vagin com toca, que la del dia no es
  pugui tornar a començar i que s'apunti a les dues taules.
- `node scripts/prova-impremta.mjs` — que La Impremta es pugui jugar tocant
  la pantalla, que les paraules inventades no costin res, que el censor
  prohibeixi de debò, que la mateixa llavor doni la mateixa partida, que la
  partida del dia vagi a la seva taula una sola vegada, que el repte s'obri
  des de l'enllaç i que un jugador automàtic hi arribi lluny i la partida
  s'acabi. També serveix el repositori per http, com la del Garbuix.
- `node scripts/prova-rotllana.mjs` — que els mil primers nivells de La
  Rotllana siguin uns mots encreuats ben fets (cap tira de lletres que no
  sigui una paraula, tot connectat, que capiga), amb paraules corrents que es
  poden fer amb la rotllana i sense bases repetides; que siguin iguals a tots
  els mòbils; i que es jugui lliscant el dit, amb extres, pista, barreja,
  nivell acabat apuntat a la taula i tot desat en tornar-hi.
- `node scripts/prova-temple.mjs` — que cada nivell del temple es pugui acabar i
  no tingui racons on quedar-te tancat, que dos pilots automàtics surtin amb
  el tresor de cada nivell i que la partida sencera passi pels set; que els
  ratpenats, la roca, la reixa amb temps, la fossa, les fletxes, els
  esquelets, les aranyes, la lava, les estalactites, el guardià, el gel, els blocs de gel, els fantasmes, les mòmies i els portals vagin com
  toca, i que les caigudes, les punxes, les serps, el terra que cau, les portes, les
  reixes, l'anella i el temple que s'ensorra vagin com toca; que es desi i es
  continuï, que els punts vagin a la taula i que els sis botons càpiguen a
  320 px.
- `node scripts/prova-abecedari.mjs` — que les definicions de L'Abecedari
  estiguin ben fetes, que la roda del dia sigui igual per a tothom i no
  repeteixi paraules, i que es jugui tocant, amb el rellotge, la pausa, el
  desar i les dues taules; i la difícil d'avui, amb el compte de lletres, a
  estones i a la seva taula.
- `node scripts/prova-colles.mjs` — que les partides de Les Quatre Colles
  estiguin ben fetes, que la del dia sigui igual per a tothom, i que es
  jugui tocant, amb errors, desar, guanyar, perdre, l'arxiu i les taules.
- `node scripts/prova-poble.mjs` — que els 947 municipis del Poble del Dia
  tinguin nom, comarca, centre i silueta, que les distàncies i les fletxes
  diguin la veritat, que el del dia sigui igual per a tothom i no es
  repeteixi, que el cercador trobi els noms com s'escriuen, i que es jugui
  tocant: intents, pistes, perdre, guanyar, desar, la pràctica, la P, les
  dues taules i que hi capiga a 320 px.
- `node scripts/prova-trencaclosques.mjs` — que el paisatge del dia sigui
  igual per a tothom, que mai no surti la mateixa escena dos dies seguits,
  que les peces encaixin, i que es jugui arrossegant amb
  el dit: safata, taula, vores, desar, acabar-lo i fer-ne un amb una foto.
- `node scripts/prova-botifarra.mjs` — les regles de La Botifarra (l'ordre,
  els punts, seguir, matar, fallar i sobrefallar), que la màquina no faci mai
  una jugada prohibida i jugui millor que l'atzar, que la del dia tingui les
  mateixes cartes per a tothom, i que es jugui tocant: trumfo, contro, la
  carta que no es pot tirar, desar i continuar, les dues taules i que hi
  capiga a 320 px.
- `node scripts/prova-conquesta.mjs` — que el mapa de La Conquesta estigui
  ben fet (43 comarques, veïnes que es corresponen, vegueries), que els daus i
  els reforços vagin com toca, que la batalla del dia sigui igual per a tothom,
  que la màquina no sigui ni regalada ni impossible, i que es jugui tocant.
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
  `sw.js` (el fitxer i la miniatura), a la descripció del `manifest.json`, a les
  llistes `JOCS` i `FITXA` de `worker/records.js`, a la taula d'aquí dalt i a la
  llista del `scripts/prova-portada.mjs`. I posar-li la línia d'ajuda
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
