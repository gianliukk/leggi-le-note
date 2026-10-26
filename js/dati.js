/* Dati del percorso: note, valori, livelli e unità. */
window.LN = window.LN || {};
(function (LN) {
  "use strict";

  LN.IT = ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si"];
  LN.EN = ["C", "D", "E", "F", "G", "A", "B"];
  LN.SEMI = [0, 2, 4, 5, 7, 9, 11];
  LN.BEAT = 0.75; // secondi per una semiminima (80 battiti al minuto)

  LN.range = function (a, b) { var r = []; for (var i = a; i <= b; i++) r.push(i); return r; };

  LN.VALUES = [
    { name: "Semibreve", frac: "4/4", beats: 4, per: 1 },
    { name: "Minima", frac: "2/4", beats: 2, per: 2 },
    { name: "Semiminima", frac: "1/4", beats: 1, per: 4 },
    { name: "Croma", frac: "1/8", beats: 0.5, per: 8 },
    { name: "Semicroma", frac: "1/16", beats: 0.25, per: 16 },
    { name: "Biscroma", frac: "1/32", beats: 0.125, per: 32 }
  ];

  /* Le note sono indicate come gradi diatonici: 28 = Do centrale, 30 = Mi sulla prima riga. */
  var r = LN.range;
  var NOTE_LEVELS = [
    { title: "Do, Re, Mi", ds: r(28, 30), q: 10 },
    { title: "Arriva il Fa", ds: r(28, 31), q: 12 },
    { title: "Arriva il Sol", ds: r(28, 32), q: 14 },
    { title: "Arriva il La", ds: r(28, 33), q: 16 },
    { title: "Tutte e sette", ds: r(28, 34), q: 18 },
    { title: "Fino al Do acuto", ds: r(28, 35), q: 20 },
    { title: "Fino al Mi acuto", ds: r(28, 37), q: 22 },
    { title: "Tutto il pentagramma", ds: r(28, 39), q: 24 },
    { title: "Tagli addizionali", ds: r(26, 40), q: 26 },
    { title: "Dal La grave al Do acuto", ds: r(26, 42), q: 28 }
  ];
  NOTE_LEVELS.forEach(function (L, i) {
    var prev = i ? NOTE_LEVELS[i - 1].ds : [];
    L.items = [];
    L.ds.forEach(function (d) {
      L.items.push({ d: d });
      if (i && prev.indexOf(d) < 0) L.items.push({ d: d }); // le note nuove escono più spesso
    });
    L.letters = r(0, 6).filter(function (l) { return L.ds.some(function (d) { return d % 7 === l; }); });
  });

  var VAL_LEVELS = [
    { title: "Semibreve, minima, semiminima", kind: "nota", vs: [0, 1, 2], q: 8 },
    { title: "Arriva la croma", kind: "nota", vs: [0, 1, 2, 3], q: 10 },
    { title: "Semicroma e biscroma", kind: "nota", vs: [0, 1, 2, 3, 4, 5], q: 12 },
    { title: "Le prime pause", kind: "pausa", vs: [0, 1, 2], q: 12 },
    { title: "Tutte le pause", kind: "pausa", vs: [0, 1, 2, 3, 4, 5], q: 14 },
    { title: "Note e pause insieme", kind: "both", vs: [0, 1, 2, 3, 4, 5], q: 16 }
  ];
  VAL_LEVELS.forEach(function (L) {
    L.items = [];
    L.vs.forEach(function (v) {
      if (L.kind !== "pausa") L.items.push({ v: v, rest: false });
      if (L.kind !== "nota") L.items.push({ v: v, rest: true });
    });
  });

  /* Ascolto: due note una dopo l'altra (a, poi b), entro un'ottava dal Do centrale.
     Risposte: 0 = sale, 1 = scende, 2 = resta uguale. */
  var ASC_LEVELS = [
    { title: "Sale o scende?", min: 3, max: 7, uguali: false, q: 10 },
    { title: "Passi vicini", min: 1, max: 2, uguali: false, q: 12 },
    { title: "Sale, scende o resta?", min: 1, max: 4, uguali: true, q: 14 }
  ];
  ASC_LEVELS.forEach(function (L) {
    L.items = [];
    r(28, 35).forEach(function (a) {
      r(28, 35).forEach(function (b) {
        var dist = Math.abs(a - b);
        if (dist >= L.min && dist <= L.max) L.items.push({ a: a, b: b });
      });
    });
    // Le note ripetute escono più o meno una volta su tre.
    if (L.uguali) { var n = Math.round(L.items.length / 2); for (var i = 0; i < n; i++) { var a = 28 + (i % 8); L.items.push({ a: a, b: a }); } }
    L.keys = L.uguali ? [0, 1, 2] : [0, 1];
  });

  /* Ritmo: battute in 4/4 costruite a caso con queste figure (vedi ritmo.js), a bpm battiti al minuto. */
  function conPausa(bt) { return bt.some(function (e) { return e.rest; }); }
  function conCrome(bt) { return bt.some(function (e) { return e.trave === 0; }); }
  var RIT_LEVELS = [
    { title: "Batti il tempo", figure: ["semibreve", "minima", "semiminima"], bpm: 66, q: 5 },
    { title: "Arrivano le crome", figure: ["minima", "semiminima", "crome"], bpm: 66, q: 6, serve: conCrome },
    { title: "Ritmo e pause", figure: ["minima", "semiminima", "crome", "pausa", "pausaMinima"], bpm: 72, q: 6, serve: conPausa }
  ];
  RIT_LEVELS.forEach(function (L) { L.items = [{ r: 1 }]; L.keys = []; });

  LN.TRACKS = {
    note: { levels: NOTE_LEVELS, label: "Note" },
    valori: { levels: VAL_LEVELS, label: "Valori" },
    ascolto: { levels: ASC_LEVELS, label: "Ascolto" },
    ritmo: { levels: RIT_LEVELS, label: "Ritmo" }
  };

  /* Il percorso: unità in ordine, ognuna con la sua lezione di guida e le sue tappe. */
  LN.PERCORSO = [
    { titolo: "Le prime note", descr: "Do, Re, Mi e poi il Fa", lezione: 2, tappe: [["note", 1], ["note", 2]] },
    { titolo: "Quanto dura una nota", descr: "Semibreve, minima, semiminima, croma", lezione: 6, tappe: [["valori", 1], ["valori", 2]] },
    { titolo: "La scala", descr: "Sol, La, Si: tutte e sette le note", lezione: 3, tappe: [["note", 3], ["note", 4], ["note", 5]] },
    { titolo: "Orecchio attento", descr: "Ascolta: la nota sale o scende?", lezione: 8, tappe: [["ascolto", 1], ["ascolto", 2], ["ascolto", 3]] },
    { titolo: "Figure veloci", descr: "Semicroma e biscroma", lezione: 6, tappe: [["valori", 3]] },
    { titolo: "Verso l'acuto", descr: "Dal Do al Mi acuto", lezione: 4, tappe: [["note", 6], ["note", 7]] },
    { titolo: "Il silenzio conta", descr: "Le pause", lezione: 7, tappe: [["valori", 4], ["valori", 5]] },
    { titolo: "Il ritmo", descr: "Batti a tempo quello che leggi", lezione: 9, tappe: [["ritmo", 1], ["ritmo", 2], ["ritmo", 3]] },
    { titolo: "Tutto il pentagramma", descr: "Righe, spazi, note e pause", lezione: 4, tappe: [["note", 8], ["valori", 6]] },
    { titolo: "Oltre il pentagramma", descr: "I tagli addizionali", lezione: 5, tappe: [["note", 9], ["note", 10]] }
  ];
  LN.TAPPE = [];
  LN.PERCORSO.forEach(function (u, ui) {
    u.tappe.forEach(function (t) {
      LN.TAPPE.push({ unit: ui, track: t[0], level: t[1], key: t[0] + "-" + t[1], L: LN.TRACKS[t[0]].levels[t[1] - 1] });
    });
  });
})(window.LN);
