/**
 * Records compartits entre tots els jugadors.
 *
 * Parla amb el Worker de Cloudflare que guarda els 10 millors de cada joc.
 * Si no hi ha connexio, tot segueix funcionant amb el record local de sempre:
 * cap joc no s'ha de quedar penjat perque falli la xarxa.
 */
const Records = (() => {
  const URL_BASE = 'https://jocs-records.oscarbellosido.workers.dev';
  const TEMPS_MAX = 6000;                 // no esperem mai mes de 6 segons

  // Quan una crida falla volem saber per que: no es el mateix que no hi
  // hagi xarxa que no que el servidor ens digui que no. Si un joc encara no
  // es a la llista del Worker, deiem "sense connexio" i era mentida.
  let ultimFall = null;                   // 'xarxa' o 'servidor'

  async function crida(cami, opcions) {
    const aborta = new AbortController();
    const t = setTimeout(() => aborta.abort(), TEMPS_MAX);
    try {
      const r = await fetch(URL_BASE + cami, { ...opcions, signal: aborta.signal });
      if (r.ok) { ultimFall = null; return await r.json(); }
      ultimFall = 'servidor';
      return null;
    } catch {
      ultimFall = 'xarxa';                // sense connexio: qui crida ja ho gestiona
      return null;
    } finally {
      clearTimeout(t);
    }
  }

  const avisFall = () => '<div style="color:#888;font-size:12px">' + (ultimFall === 'servidor'
    ? 'Aquest joc encara no és a la llista de rècords compartits.<br>El rècord s\'ha desat només en aquest mòbil.'
    : 'Sense connexió: rècord desat només aquí') + '</div>';

  const local = joc => parseInt(localStorage.getItem('best_' + joc) || '0', 10);
  // alguns jocs guardaven el record amb un altre nom; no el volem perdre
  const migra = (joc, clauAntiga) => {
    if (!clauAntiga) return;
    const vell = localStorage.getItem(clauAntiga);
    if (vell && !localStorage.getItem('best_' + joc)) localStorage.setItem('best_' + joc, vell);
  };
  const desaLocal = (joc, punts) => {
    if (punts > local(joc)) localStorage.setItem('best_' + joc, punts);
  };

  // les inicials es recorden d'una partida a l'altra
  const nom = () => localStorage.getItem('jugador') || '';
  const desaNom = n => localStorage.setItem('jugador', n);

  // ---- finestreta per demanar les inicials ----
  function demanaNom() {
    return new Promise(resolve => {
      const fons = document.createElement('div');
      fons.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:9999;' +
        'display:flex;align-items:center;justify-content:center;font-family:monospace';
      fons.innerHTML =
        '<div style="text-align:center;color:#fff;border:1px solid #666;border-radius:10px;' +
        'padding:20px 24px;background:#000;max-width:80%">' +
        '<div style="color:#ff0;font-size:18px;margin-bottom:4px">RÈCORD!</div>' +
        '<div style="font-size:13px;color:#aaa;margin-bottom:14px">Entres a la taula dels 10 millors</div>' +
        '<input id="rec-nom" maxlength="3" autocomplete="off" ' +
        'style="width:110px;height:auto;box-sizing:content-box;font:bold 30px monospace;' +
        'text-align:center;text-transform:uppercase;' +
        'letter-spacing:.2em;background:#111;color:#ff0;border:1px solid #666;border-radius:6px;padding:6px">' +
        // width i height han d'anar aqui si o si: cada joc te una regla
        // button{width:NNpx;height:NNpx} per als seus controls i, si no li
        // posem la nostra, tambe agafa aquest boto i el text se'n surt.
        '<div style="margin-top:14px"><button id="rec-ok" ' +
        'style="width:auto;height:auto;min-width:0;box-sizing:content-box;line-height:normal;' +
        'font:16px monospace;background:#111;color:#fff;border:1px solid #777;' +
        'border-radius:8px;padding:8px 22px">D\'ACORD</button></div></div>';
      document.body.appendChild(fons);

      const camp = fons.querySelector('#rec-nom');
      camp.value = nom();
      setTimeout(() => { try { camp.focus(); camp.select(); } catch {} }, 50);

      const tanca = () => {
        const n = (camp.value || 'AAA').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3) || 'AAA';
        desaNom(n);
        fons.remove();
        resolve(n);
      };
      // Si aquesta tecla arriba fins al joc, com que la partida ja es
      // "over", el fa comencar de nou en silenci mentre encara esperem
      // la resposta del Worker: quan arriba, torna a pintar el quadre
      // final pero el joc ja ha reiniciat per sota i cap tecla ni clic
      // hi torna a fer res.
      fons.addEventListener('keydown', e => e.stopPropagation());
      fons.querySelector('#rec-ok').addEventListener('click', tanca);
      camp.addEventListener('keydown', e => { if (e.key === 'Enter') tanca(); });
    });
  }

  // ---- el so, i el boto per apagar-lo ----
  // Vint dels vint-i-un jocs fan soroll i no hi havia manera de callar-los des
  // del joc: o baixaves el volum del telefon o res. Al llit o amb gent al
  // costat, aixo vol dir no jugar-hi.
  //
  // Cada joc es munta el so a la seva manera (uns en diuen MG i AC, altres
  // master i audioCtx, i el del Tetris es dins d'una funcio tancada), pero
  // tots fan el mateix: es fan un volum general i el connecten a la sortida
  // del navegador. Aixi que en comptes de tocar els vint-i-un fitxers,
  // aqui ens posem al mig: tot el que es connecti a la sortida passa abans
  // per un volum nostre, i apagar el so es posar-lo a zero.
  //
  // A zero i no aturant el rellotge del so (suspend): amb el rellotge aturat,
  // els sorolls que el joc va programant mentrestant s'amunteguen tots a la
  // mateixa hora i, en tornar a engegar, sonen tots de cop.
  const CLAU_SO = 'jocs-so';
  let soActiu = true;
  try { soActiu = localStorage.getItem(CLAU_SO) !== '0'; } catch (e) { }
  const volums = [];                      // un per cada joc que faci soroll

  function volumGeneral(ctx) {
    if (!ctx.__volumJocs) {
      const g = ctx.createGain();
      g.gain.value = soActiu ? 1 : 0;
      connectaOriginal.call(g, ctx.destination);
      ctx.__volumJocs = g;
      volums.push(g);
      // El boto surt quan el joc fa el primer soroll, no abans: el Tetris no
      // en fa cap i seria mentida oferir-li un boto per callar-lo.
      demanaBotoSo();
    }
    return ctx.__volumJocs;
  }

  // Es fa un cop per pagina, abans que el joc arrenqui: el records.js es
  // carrega sempre abans del codi del joc.
  let connectaOriginal = null;
  try {
    connectaOriginal = AudioNode.prototype.connect;
    AudioNode.prototype.connect = function (desti, ...resta) {
      // nomes ens interessa qui es connecta a la sortida; la resta de
      // connexions entre nodes (i les que van a un parametre) no les toquem
      if (desti && desti.context && desti === desti.context.destination) {
        connectaOriginal.call(this, volumGeneral(desti.context), ...resta);
        return desti;                     // el connect() torna sempre on li han dit
      }
      return connectaOriginal.call(this, desti, ...resta);
    };
  } catch (e) {
    connectaOriginal = null;              // navegador sense Web Audio: res a fer
  }

  function posaSo(actiu) {
    soActiu = !!actiu;
    for (const g of volums) g.gain.value = soActiu ? 1 : 0;
    try { localStorage.setItem(CLAU_SO, soActiu ? '1' : '0'); } catch (e) { }
    const b = document.getElementById('rec-so');
    if (b) pintaBotoSo(b);
  }
  function pintaBotoSo(b) {
    b.textContent = soActiu ? '🔊' : '🔇';
    b.style.color = soActiu ? '#aaa' : '#f66';
    b.style.borderColor = soActiu ? '#555' : '#a44';
    b.setAttribute('aria-label', soActiu ? 'Apagar el so' : 'Engegar el so');
    b.setAttribute('title', soActiu ? 'Apagar el so' : 'Engegar el so');
  }

  // ---- el boto de pausa, al marcador de tots els jocs ----
  // Al mobil no hi havia manera d'aturar una partida: la pausa nomes anava
  // amb la tecla P i al telefon no hi ha teclat. Si et trucaven, o perdies la
  // partida o havies de sortir. Aquest boto es posa sol al marcador de tots
  // els jocs i fa exactament el mateix que prement la P: la pausa de cada joc
  // ja esta feta i provada, aqui nomes la disparem.
  function posaBotoPausa() {
    // gairebe tots tenen el marcador a #hud; l'Asteroids, que es a pantalla
    // completa, l'hi diu #h
    const hud = document.getElementById('hud') || document.getElementById('h');
    if (!hud || document.getElementById('rec-pausa')) return;
    // si el joc ja en porta un de seu (el Tetris), no n'hi posem un segon
    for (const b of hud.querySelectorAll('button')) {
      if (/[⏸▶]/.test(b.textContent)) return;
    }
    const b = document.createElement('button');
    b.id = 'rec-pausa';
    b.type = 'button';
    b.textContent = '❚❚';
    b.setAttribute('aria-label', 'Pausa');
    // width i height han d'anar aqui si o si: cada joc te una regla
    // button{width:NNpx;height:NNpx} per als seus controls i tambe agafaria
    // aquest boto, que quedaria enorme al mig del marcador.
    b.setAttribute('style',
      'width:auto;height:auto;min-width:0;box-sizing:content-box;line-height:1;' +
      'font:11px monospace;background:transparent;color:#aaa;' +
      'border:1px solid #555;border-radius:6px;padding:5px 5px;' +
      'flex-shrink:0;cursor:pointer;font-family:monospace');
    b.addEventListener('click', () => {
      // uns jocs miren e.code==='KeyP' i altres e.key==='p': hi posem tots dos
      document.dispatchEvent(new KeyboardEvent('keydown',
        { code: 'KeyP', key: 'p', bubbles: true }));
    });
    // al costat del boto de tornar, si n'hi ha; si no, al principi del marcador
    const back = hud.querySelector('#back');
    if (back && back.parentNode === hud) hud.insertBefore(b, back.nextSibling);
    else hud.insertBefore(b, hud.firstChild);
  }

  // el boto del so, just despres del de pausa
  function posaBotoSo() {
    const hud = document.getElementById('hud') || document.getElementById('h');
    if (!hud || !connectaOriginal || document.getElementById('rec-so')) return;
    // Aixo abans posava flexWrap='wrap' aqui mateix i s'hi quedava per sempre:
    // el marcador baixava de linia en comptes de sortir-se'n, pero es quedava
    // partit i menjant camp de joc. Ara qui mana es l'ajustaMarcador, que
    // primer prova d'encongir la lletra i nomes deixa que es parteixi si ni
    // aixi hi cap.
    const b = document.createElement('button');
    b.id = 'rec-so';
    b.type = 'button';
    // mateix motiu que al de pausa: la regla button{width:NNpx} del joc
    // tambe agafaria aquest, i quedaria enorme
    b.setAttribute('style',
      'width:auto;height:auto;min-width:0;box-sizing:content-box;line-height:1;' +
      'font:11px monospace;background:transparent;' +
      'border:1px solid #555;border-radius:6px;padding:5px 5px;' +
      'flex-shrink:0;cursor:pointer;font-family:monospace');
    pintaBotoSo(b);
    b.addEventListener('click', e => { e.stopPropagation(); posaSo(!soActiu); });
    const pausa = document.getElementById('rec-pausa');
    if (pausa && pausa.parentNode === hud) hud.insertBefore(b, pausa.nextSibling);
    else {
      const back = hud.querySelector('#back');
      if (back && back.parentNode === hud) hud.insertBefore(b, back.nextSibling);
      else hud.insertBefore(b, hud.firstChild);
    }
  }
  function ajusta() { ajustaTot(); }
  function demanaBotoSo() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', posaBotoSo, { once: true });
    } else {
      posaBotoSo();
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { posaBotoPausa(); ajusta(); });
  } else {
    posaBotoPausa(); ajusta();
  }

  // ---- el marcador a les pantalles estretes ----
  // Amb els dos botons nous, a 320 px el marcador de catorze jocs ja no cabia
  // en una linia i baixava de linia: onze pixels menys de joc, i abans de
  // posar-los-hi no li passava a cap. El que hi sobra es el "← Tornar", que
  // ocupa 76 px a tot arreu; a les pantalles estretes n'hi ha prou amb la
  // fletxa. Es diu igual per a qui ho llegeixi en veu alta.
  const ESTRETA = 380;
  function ajustaTornar() {
    const hud = document.getElementById('hud') || document.getElementById('h');
    const back = hud && hud.querySelector('#back');
    if (!back) return;
    if (back.dataset.textLlarg === undefined) back.dataset.textLlarg = back.textContent;
    const estreta = window.innerWidth <= ESTRETA;
    const vol = estreta ? '←' : back.dataset.textLlarg;
    if (back.textContent !== vol) back.textContent = vol;
    back.setAttribute('aria-label', 'Tornar al menú');
    back.setAttribute('title', 'Tornar al menú');
  }

  // Nomes amb la fletxa encara no n'hi havia prou: el marcador de punts creix
  // durant la partida i el del Defender, amb cinc xifres, tornava a partir-se.
  // Com que cada joc ensenya coses diferents i els numeros creixen mentre
  // jugues, en comptes d'anar mida per mida a cada joc, aqui s'encongeix la
  // lletra del marcador fins que hi cap, i para de seguida que hi cap.
  // Mirava si dos retols havien quedat a alcades diferents. Aixo nomes passa
  // si el marcador pot baixar de linia, i cap no pot: tots son display:flex
  // sense flex-wrap. El que passa de debo es que es parteix el text de DINS
  // d'un retol ("PUNTS" a dalt i "999999" a sota): el marcador creix d'alt,
  // menja camp de joc i cap germa no s'ha mogut, aixi que no ho veiem mai i
  // la lletra no s'encongia. Al Defender, amb sis xifres, el marcador passava
  // de 38 a 52 px.
  // Ara s'obliga el marcador a una sola ratlla i es mira si el que hi ha a
  // dins es mes ample del que hi cap, que aixo si que es veu.
  function nocap(hud) {
    return hud.scrollWidth > hud.clientWidth + 1;
  }
  function ajustaMarcador() {
    const hud = document.getElementById('hud') || document.getElementById('h');
    if (!hud) return;
    if (hud.dataset.midaBase === undefined) {
      hud.dataset.midaBase = parseFloat(getComputedStyle(hud).fontSize) || 12;
    }
    const base = parseFloat(hud.dataset.midaBase);
    hud.style.gap = window.innerWidth <= ESTRETA ? '3px' : '';
    // no baixem de 10px: mes petit no es llegeix, i si ni aixi hi cap val
    // mes que baixi de linia que no pas que no es vegi
    const abans = hud.style.fontSize;
    // Una sola ratlla mentre es mesura: ni els retols es parteixen pel mig
    // (white-space) ni en baixa cap a sota (flex-wrap). Aixi el que no hi cap
    // sobresurt, i sobresortir si que es pot mesurar.
    hud.style.whiteSpace = 'nowrap';
    hud.style.flexWrap = 'nowrap';
    for (let mida = base; mida >= 10; mida -= 0.5) {
      hud.style.fontSize = mida >= base ? '' : mida + 'px';
      if (!nocap(hud)) break;
    }
    // Si ni a 10 px hi cap, val mes que es parteixi que no pas que se'n vagi
    // fora de la pantalla i no es pugui llegir.
    if (nocap(hud)) { hud.style.whiteSpace = ''; hud.style.flexWrap = 'wrap'; }
    // Si la lletra ha canviat, el marcador te una altra alcada. Hi ha jocs que
    // col·loquen el tauler a partir d'aquesta alcada (el Tetris ho fa al seu
    // resizeCanvas), i s'han d'assabentar del canvi.
    if (hud.style.fontSize !== abans) dispatchEvent(new Event('resize'));
  }
  function ajustaTot() { ajustaTornar(); ajustaMarcador(); }
  addEventListener('resize', ajustaTot);
  // els numeros creixen mentre jugues, aixi que s'ha de repassar de tant en
  // tant; llegir quatre rectangles cada segon i mig no costa res
  setInterval(ajustaMarcador, 1500);

  // ---- el peu del final de partida ----
  // Fins ara, en acabar la partida nomes podies tornar a jugar: per anar al
  // menu havies de comencar una partida i fer enrere. Aixo posa el boto del
  // menu al mateix quadre. Es un enllac i no un <button> a posta: cada joc te
  // la seva regla button{width:NNpx} i ens el faria petit.
  const ESTIL_MENU = 'display:inline-block;font:13px monospace;color:#ddd;' +
    'text-decoration:none;background:#111;border:1px solid #777;border-radius:8px;' +
    'padding:8px 14px;white-space:nowrap';
  function peuFinal(text = 'o toca la pantalla per tornar a jugar') {
    return '<div style="margin-top:12px;display:flex;gap:10px;justify-content:center;' +
      'align-items:center;flex-wrap:wrap">' +
      '<a href="index.html" data-menu-jocs="1" style="' + ESTIL_MENU + '">← MENÚ</a>' +
      '<small style="font-size:12px;color:#aaa">' + text + '</small></div>';
  }
  // Els jocs escolten el clic a tot el quadre per tornar a jugar. Si no
  // l'aturem aqui, tocar el boto del menu tambe els el dispararia.
  document.addEventListener('click', e => {
    const a = e.target && e.target.closest && e.target.closest('a[data-menu-jocs]');
    if (a) e.stopPropagation();
  }, true);

  // ---- la taula en entrar al joc ----
  // Com les maquines de debo, que mentre no hi jugava ningu anaven ensenyant
  // qui manava. Es tanca sola de seguida i tambe al primer toc, i mentrestant
  // el joc queda en pausa perque no perdis vides mirant-la. Si no hi ha
  // records o no s'hi pot connectar, no la ensenya: no fem esperar per res.
  async function pantallaInicial(joc, pausa, continua) {
    if (typeof pausa === 'function') { try { pausa(); } catch {} }
    const fons = document.createElement('div');
    fons.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:9997;' +
      'display:flex;align-items:center;justify-content:center;font-family:monospace;text-align:center';
    fons.innerHTML = '<div style="color:#fff;max-width:86%">' +
      '<div style="color:#ff0;font-size:20px;letter-spacing:.16em;margin-bottom:12px">RÈCORDS</div>' +
      '<div class="rec-taula" style="color:#888;font-size:12px">…</div>' +
      '<div class="rec-peu" style="font-size:12px;color:#aaa;margin-top:14px">&nbsp;</div></div>';
    document.body.appendChild(fons);

    let tancat = false;
    const tanca = () => {
      if (tancat) return;
      tancat = true;
      fons.remove();
      document.removeEventListener('keydown', perTecla, true);
      if (typeof continua === 'function') { try { continua(); } catch {} }
    };
    // la tecla que la tanca no ha de disparar ni saltar dins del joc
    const perTecla = e => { e.stopPropagation(); tanca(); };
    fons.addEventListener('pointerdown', tanca);
    document.addEventListener('keydown', perTecla, true);
    const sostre = setTimeout(tanca, 7000);      // per si la xarxa va lenta

    const llista = await crida('/records/' + joc);
    if (tancat) return;
    if (!llista || !llista.length) { clearTimeout(sostre); tanca(); return; }
    fons.querySelector('.rec-taula').innerHTML = taulaHTML(llista);
    fons.querySelector('.rec-peu').textContent = 'toca per començar';
    clearTimeout(sostre);
    setTimeout(tanca, 3500);
  }

  // ---- taula dels 10 millors ----
  function taulaHTML(llista, destacat) {
    if (!llista || !llista.length) return '<div style="color:#888;font-size:12px">Encara no hi ha cap rècord</div>';
    const files = llista.map((r, i) => {
      const meu = destacat && r.n === destacat.n && r.p === destacat.p;
      return '<tr style="color:' + (meu ? '#ff0' : '#ddd') + '">' +
        '<td style="text-align:right;padding:1px 6px;color:#888">' + (i + 1) + '</td>' +
        '<td style="padding:1px 6px">' + r.n + '</td>' +
        '<td style="text-align:right;padding:1px 6px">' + r.p + '</td></tr>';
    }).join('');
    return '<table style="margin:0 auto;font:13px monospace;border-collapse:collapse">' + files + '</table>';
  }

  // qui mana ara mateix a cada joc, per no haver de preguntar-ho a cada fotograma
  const lideres = {};

  // El marcador ensenya les inicials de qui va primer i la seva puntuacio,
  // com a les maquines. Mentre l'estas superant, hi surt TU amb la teva.
  function marcador(joc, element, punts = 0) {
    if (!element) return;
    const l = lideres[joc];
    const meu = Math.max(punts, local(joc));
    if (l && punts > l.p) element.textContent = 'TU ' + punts;
    else if (l) element.textContent = l.n + ' ' + l.p;
    else element.textContent = meu ? 'TU ' + meu : '—';
  }

  // plafo per als jocs que no en tenen cap on ensenyar la taula
  function panell(titol, cos) {
    const fons = document.createElement('div');
    fons.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:9998;' +
      'display:flex;align-items:center;justify-content:center;font-family:monospace';
    fons.innerHTML = '<div style="text-align:center;color:#fff;border:1px solid #555;border-radius:10px;' +
      'padding:16px 24px;background:rgba(0,0,0,.95);max-width:80%">' + titol +
      '<div style="margin:10px 0">' + cos + '</div>' +
      peuFinal('o toca per continuar') + '</div>';
    fons.addEventListener('click', () => fons.remove());
    document.body.appendChild(fons);
    return fons;
  }

  return {
    local, desaLocal, nom, marcador, migra, panell, peuFinal, pantallaInicial,

    // Els 10 millors de tots els jocs de cop, per a la pagina principal.
    async tots() {
      return await crida('/records');
    },

    // Qui va primer. Torna null si no s'hi pot connectar.
    async lider(joc) {
      const llista = await crida('/records/' + joc);
      if (llista === null) return null;
      lideres[joc] = llista.length ? { n: llista[0].n, p: llista[0].p } : null;
      return lideres[joc];
    },

    // Consulta qui mana i ho pinta al marcador. Sense xarxa hi deixa el
    // teu record local, perque el jugador sempre hi vegi alguna cosa.
    async pintaMillor(joc, element, punts = 0) {
      if (!element) return;
      marcador(joc, element, punts);
      await this.lider(joc);
      marcador(joc, element, punts);
    },

    // En acabar la partida: desa el local, envia la puntuacio i, si entra
    // entre els 10 millors, demana les inicials. Torna el HTML de la taula.
    async fiPartida(joc, punts) {
      desaLocal(joc, punts);
      if (!punts) return { html: taulaHTML(await crida('/records/' + joc)), posicio: 0 };

      const actual = await crida('/records/' + joc);
      if (actual === null) return { html: avisFall(), posicio: 0 };

      const hiEntra = actual.length < 10 || punts > actual[actual.length - 1].p;
      if (!hiEntra) return { html: taulaHTML(actual), posicio: 0 };

      const n = await demanaNom();
      const res = await crida('/records/' + joc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom: n, punts }),
      });
      if (!res) return { html: taulaHTML(actual) + avisFall(), posicio: 0 };
      if (res.top && res.top.length) lideres[joc] = { n: res.top[0].n, p: res.top[0].p };
      return { html: taulaHTML(res.top, { n, p: punts }), posicio: res.posicio };
    },

    taulaHTML,

    // per a les proves i per si algun joc vol saber si el so esta engegat
    so: () => soActiu,
    posaSo,
    canalsSo: () => volums.map(g => g.gain.value),
  };
})();
