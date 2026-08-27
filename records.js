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

  async function crida(cami, opcions) {
    const aborta = new AbortController();
    const t = setTimeout(() => aborta.abort(), TEMPS_MAX);
    try {
      const r = await fetch(URL_BASE + cami, { ...opcions, signal: aborta.signal });
      return r.ok ? await r.json() : null;
    } catch {
      return null;                        // sense connexio: qui crida ja ho gestiona
    } finally {
      clearTimeout(t);
    }
  }

  const local = joc => parseInt(localStorage.getItem('best_' + joc) || '0', 10);
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
        'style="width:110px;font:bold 30px monospace;text-align:center;text-transform:uppercase;' +
        'letter-spacing:.2em;background:#111;color:#ff0;border:1px solid #666;border-radius:6px;padding:6px">' +
        '<div style="margin-top:14px"><button id="rec-ok" ' +
        'style="font:16px monospace;background:#111;color:#fff;border:1px solid #777;' +
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
      fons.querySelector('#rec-ok').addEventListener('click', tanca);
      camp.addEventListener('keydown', e => { if (e.key === 'Enter') tanca(); });
    });
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

  return {
    local, desaLocal, nom, marcador,

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
      if (actual === null) return { html: '<div style="color:#888;font-size:12px">Sense connexió: rècord desat només aquí</div>', posicio: 0 };

      const hiEntra = actual.length < 10 || punts > actual[actual.length - 1].p;
      if (!hiEntra) return { html: taulaHTML(actual), posicio: 0 };

      const n = await demanaNom();
      const res = await crida('/records/' + joc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom: n, punts }),
      });
      if (!res) return { html: taulaHTML(actual), posicio: 0 };
      if (res.top && res.top.length) lideres[joc] = { n: res.top[0].n, p: res.top[0].p };
      return { html: taulaHTML(res.top, { n, p: punts }), posicio: res.posicio };
    },

    taulaHTML,
  };
})();
