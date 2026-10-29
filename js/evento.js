/* Evento a tempo «La notte delle note» (Halloween 2026): cinque tappe speciali con il prof. Marano travestito.
   Si vede in cima al percorso solo tra le date dal/al; i risultati restano (XP, serie, medaglia «Zucca d'oro»). */
window.LN = window.LN || {};
(function (LN) {
  "use strict";
  var S = LN.store;
  var V = "?v=20261029";

  /* Melodie da leggere nota per nota: [grado, durata in battiti]. 28 = Do centrale (vedi dati.js). */
  function melodia(note) { return note.map(function (n) { return { d: n[0], b: n[1] }; }); }
  var MAHLER = melodia([[29, 1], [30, 1], [31, 1], [29, 1], [29, 1], [30, 1], [31, 1], [29, 1], [31, 1], [32, 1], [33, 2], [31, 1], [32, 1], [33, 2]]);
  var GRIEG = melodia([[26, 0.5], [27, 0.5], [28, 0.5], [29, 0.5], [30, 0.5], [28, 0.5], [30, 1], [33, 0.5], [34, 0.5], [35, 0.5], [36, 0.5], [37, 0.5], [35, 0.5], [37, 1]]);
  var BACH = melodia([[40, 0.25], [39, 0.25], [40, 2], [39, 0.4], [38, 0.4], [37, 0.4], [36, 1.5], [33, 0.25], [32, 0.25], [33, 2], [32, 0.4], [31, 0.4], [30, 0.4], [29, 1.5]]);

  function lettura(titolo, seq) {
    var ds = seq.map(function (n) { return n.d; });
    var lo = Math.min.apply(null, ds), hi = Math.max.apply(null, ds);
    return { title: titolo, seq: seq, q: seq.length, items: seq.map(function (n) { return { d: n.d }; }), ds: LN.range(lo, hi), letters: LN.range(0, 6) };
  }
  function copia(track, livello, titolo) { return Object.assign({}, LN.TRACKS[track].levels[livello - 1], { title: titolo }); }

  var EV = {
    id: "halloween-2026",
    titolo: "La notte delle note",
    dal: "2026-10-29",
    al: "2026-11-08",
    tappe: [
      { key: "hw26-1", track: "note", L: lettura("Fra Martino da brivido", MAHLER),
        brano: { chi: "Gustav Mahler", cosa: "Sinfonia n. 1, terzo movimento (1888)",
          testo: "Mahler trasforma Fra Martino in una marcia funebre in minore: all'inizio la suona da solo il contrabbasso, sopra i colpi dei timpani." } },
      { key: "hw26-2", track: "ascolto", L: copia("ascolto", 1, "Il fantasma sale o scende?") },
      { key: "hw26-3", track: "note", L: lettura("Nell'antro del re della montagna", GRIEG),
        brano: { chi: "Edvard Grieg", cosa: "dal Peer Gynt (1875)",
          testo: "Il tema comincia piano e lento negli strumenti gravi e torna sempre più forte e veloce. Qui è trasportato da Si minore a La minore, così si legge senza alterazioni." } },
      { key: "hw26-4", track: "ritmo", L: copia("ritmo", 1, "Dolcetto o scherzetto") },
      { key: "hw26-5", track: "note", L: lettura("La Toccata dell'organo", BACH),
        brano: { chi: "Toccata e fuga in re minore BWV 565", cosa: "per organo, attribuita a Johann Sebastian Bach",
          testo: "Il famoso motivo d'inizio si ripete un'ottava più in basso. Qui leggi le prime sette note di ognuno: subito dopo arriva un Do diesis." } }
    ]
  };
  EV.tappe.forEach(function (T, i) { T.idx = i; T.evento = true; });

  var COSTUMI = {
    dracula: { src: "img/prof-dracula.png", alt: "Il prof. Marano travestito da Dracula" },
    zucca: { src: "img/prof-zucca.png", alt: "Il prof. Marano con un cappello a forma di zucca" },
    mago: { src: "img/prof-mago.png", alt: "Il prof. Marano travestito da mago" }
  };

  function oggi() { var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function fatte() { return EV.tappe.filter(function (T) { return S.completata(T.key); }).length; }

  LN.evento = {
    dati: EV,
    attivo: function () { var g = oggi(); return g >= EV.dal && g <= EV.al; },
    tappa: function (i) { return EV.tappe[i]; },
    /* Le tappe si aprono una dopo l'altra (due stelle nella precedente); il docente le ha tutte aperte. */
    aperta: function (i) { return S.tuttoAperto || i === 0 || S.completata(EV.tappe[i - 1].key) || S.completata(EV.tappe[i].key); },
    fatte: fatte,
    prof: function (costume, cls) {
      var c = COSTUMI[costume];
      return '<img class="prof-costume' + (cls ? " " + cls : "") + '" src="' + c.src + V + '" alt="' + c.alt + '">';
    },
    /* Mezzanotte: la Danse macabre di Saint-Saëns comincia con l'arpa che suona dodici volte il Re. */
    mezzanotte: function () {
      var n = [];
      for (var i = 0; i < 12; i++) n.push([LN.midiOf(36), 0.35]);
      LN.suono.sequenza(n, true);
    },
    /* La melodia letta in una tappa, con le sue durate. */
    suonaMelodia: function (T) {
      LN.suono.sequenza(T.L.seq.map(function (n) { return [LN.midiOf(n.d), n.b * 0.5]; }), true);
    },
    FRASI: {
      ok: ["Da paura!", "Mostruoso!", "Che brivido!", "Stregato dalla bravura!", "Neanche un fantasma sbaglia così poco!"],
      bad: ["Buuu! Guarda bene:", "Scherzetto! Era così:", "Brrr, quasi:"]
    }
  };

  LN.MEDAGLIE.push({ id: "zucca26", nome: "Zucca d'oro", descr: "Supera tutte le tappe de «La notte delle note» (Halloween 2026)", segno: "\u{1F383}",
    col: "#E8791A", n: EV.tappe.length, val: fatte, nascosta: function () { return !LN.evento.attivo(); } });
})(window.LN);
