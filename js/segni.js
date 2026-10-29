/* Esercizi sui segni musicali (track "segni"): parti della nota, punto di valore, segni, tono e semitono,
   alterazioni, enarmoniche. Ogni domanda: { id, domanda, stage, opzioni (HTML), giusta, spiega, suono, cols }. */
window.LN = window.LN || {};
(function (LN) {
  "use strict";
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function mescola(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  var SEG = { "#": "♯", b: "♭", n: "♮" };
  function nome(d, acc) { return LN.nm(d) + (SEG[acc] && acc !== "n" ? SEG[acc] : ""); }
  function rigo(o) { return LN.staffSVG(Object.assign({ play: false, scale: 2.1, gap: 46 }, o)); }
  /* Domanda a scelta: le opzioni si mescolano e si ricorda la posizione di quella giusta. */
  function scelta(q, giusta, altre) {
    var tutte = mescola([giusta].concat(altre));
    q.opzioni = tutte; q.giusta = tutte.indexOf(giusta);
    q.cols = q.cols || (tutte.length > 2 ? 2 : 2);
    return q;
  }
  var B = LN.BEAT;
  /* Diesis o bemolle, evitando Mi♯, Si♯, Fa♭ e Do♭ (sono enarmoniche di note naturali). */
  function accPer(d) { var l = d % 7; return l === 2 || l === 6 ? "b" : l === 3 || l === 0 ? "#" : pick(["#", "b"]); }

  /* ---------- 1. Le parti della nota ---------- */
  function croma(parte, v) {
    var k = 2.4, sx = 112, sy = 26;
    function f(x, y) { return (sx + x * k) + " " + (sy + y * k); }
    function c(p) { return p === parte ? " evid" : ""; }
    var s = '<svg class="parti-nota grande" viewBox="40 10 140 140" role="img" aria-label="Una nota con una parte colorata">' +
      '<ellipse class="pn-testa' + c("testa") + '" cx="98" cy="128" rx="15" ry="10.5" transform="rotate(-20 98 128)"/>' +
      '<line class="pn-gambo' + c("gambo") + '" x1="' + sx + '" x2="' + sx + '" y1="126" y2="' + sy + '"/>';
    for (var i = 0; i < v - 2; i++) {
      var y0 = i * 16;
      s += '<path class="pn-codetta' + c("codetta") + '" d="M' + f(0, y0 / k) + " C" + f(1, y0 / k + 7) + " " + f(11, y0 / k + 10) + " " + f(8, y0 / k + 21) + " C" + f(9, y0 / k + 13) + " " + f(4, y0 / k + 10) + " " + f(0, y0 / k + 8) + 'Z"/>';
    }
    return s + "</svg>";
  }
  function parti() {
    if (Math.random() < 0.6) {
      var parte = pick(["testa", "gambo", "codetta"]), v = pick([3, 4, 5]);
      if (parte !== "codetta" && Math.random() < 0.4) v = 2;
      var testo = { testa: "La testa è l'ovale: la sua posizione sul pentagramma dice il nome della nota.", gambo: "Il gambo è la stanghetta verticale attaccata alla testa.", codetta: "La codetta (o cediglia) è il ricciolo in cima al gambo: ogni codetta dimezza il valore." }[parte];
      return scelta({ id: "p-" + parte + v, domanda: "Come si chiama la parte colorata?", stage: croma(parte, v), spiega: testo }, cap(parte), ["Testa", "Gambo", "Codetta"].filter(function (x) { return x !== cap(parte); }));
    }
    var d = pick([28, 29, 30, 31, 32, 33, 35, 36, 37, 38]), su = d < 34;
    return scelta({ id: "g-" + d, domanda: "Dove va il gambo di questa nota?", stage: rigo({ notes: [{ d: d, v: 2, cls: "hl" }], stems: false, gap: 60, startX: 70 }),
      spiega: "La nota è " + (su ? "sotto" : "sopra") + " la terza riga: il gambo va " + (su ? "in su, a destra della testa." : "in giù, a sinistra della testa.") },
      su ? "In su, a destra" : "In giù, a sinistra", [su ? "In giù, a sinistra" : "In su, a destra"]);
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* ---------- 2. Il punto di valore ---------- */
  var PUNTATE = [
    { v: 0, nome: "semibreve puntata", vale: "6/4", senza: "4/4", calcolo: "4/4 + 2/4 = 6/4" },
    { v: 1, nome: "minima puntata", vale: "3/4", senza: "2/4", calcolo: "2/4 + 1/4 = 3/4" },
    { v: 2, nome: "semiminima puntata", vale: "3/8", senza: "1/4", calcolo: "1/4 + 1/8 = 3/8" },
    { v: 3, nome: "croma puntata", vale: "3/16", senza: "1/8", calcolo: "1/8 + 1/16 = 3/16" }
  ];
  function mini(v, punto) { return LN.staffSVG({ clef: null, notes: [{ d: 33, v: v, punto: punto }], gap: 44, startX: 6, scale: 1.25, crop: true, play: false }); }
  function punto() {
    var P = pick(PUNTATE);
    if (Math.random() < 0.6) {
      var altre = [P.senza].concat(mescola(PUNTATE.filter(function (x) { return x !== P; }).map(function (x) { return x.vale; })).slice(0, 2));
      return scelta({ id: "v-" + P.v, domanda: "Quanto vale questa figura?", stage: rigo({ notes: [{ d: 32, v: P.v, punto: true }], gap: 60, startX: 70, scale: 2.4 }),
        spiega: "È una " + P.nome + ": " + P.calcolo + ".", suono: [[LN.midiOf(32), Math.min(LN.VALUES[P.v].beats * 1.5 * B, 4)]] }, P.vale, altre);
    }
    var altra = pick(PUNTATE.filter(function (x) { return x !== P; }));
    var q = scelta({ id: "f-" + P.v, domanda: "Quale figura vale " + P.vale + "?", stage: '<p class="seg-grande">' + P.vale + "</p>",
      spiega: "La " + P.nome + " vale " + P.calcolo + "." }, mini(P.v, true), [mini(P.v, false), mini(altra.v, true)]);
    q.cols = 3; q.figure = true;
    return q;
  }

  /* ---------- 3. Che segno è? ---------- */
  var SEGNI = [
    { n: "Legatura di valore", s: function () { return rigo({ notes: [{ d: 32, v: 1 }, { d: 32, v: 2 }], legature: [[0, 1]], gap: 60 }); }, t: "unisce due note uguali: si suona una nota sola, lunga quanto tutte e due." },
    { n: "Legatura di portamento", s: function () { return rigo({ notes: [{ d: 29 }, { d: 31 }, { d: 33 }], legature: [[0, 2]], gap: 46 }); }, t: "unisce note diverse: si suonano legate, con un solo colpo di lingua sulla prima." },
    { n: "Ritornello", s: function () { return rigo({ notes: [{ d: 30 }, { d: 31 }, { d: 32 }], ritornello: { fine: true }, gap: 44, width: 50 + 3 * 44 + 22 }); }, t: "i due puntini e la doppia stanghetta dicono di ripetere la parte prima del segno." },
    { n: "Punto coronato", s: function () { return rigo({ notes: [{ d: 31, v: 1 }, { d: 30, v: 0, corona: true }], gap: 60 }); }, t: "l'arco con il punto sopra la nota dice di fermarsi e tenerla più a lungo." },
    { n: "Respiro", s: function () { return rigo({ notes: [{ d: 30 }, { d: 31 }, { d: 32 }, { d: 31 }], respiri: [1], gap: 44 }); }, t: "la virgola sopra il rigo indica dove prendere fiato." },
    { n: "Punto di valore", s: function () { return rigo({ notes: [{ d: 33, v: 1, punto: true }], gap: 60, startX: 70 }); }, t: "il puntino a destra della testa allunga la nota della metà del suo valore." }
  ];
  function segno() {
    var S = pick(SEGNI);
    var altre = mescola(SEGNI.filter(function (x) { return x !== S; }).map(function (x) { return x.n; })).slice(0, 3);
    return scelta({ id: "s-" + S.n, domanda: "Che segno è quello sul pentagramma?", stage: S.s(), spiega: S.n + ": " + S.t }, S.n, altre);
  }

  /* ---------- 4. Tono o semitono? ---------- */
  var COPPIE = [];
  LN.range(28, 34).forEach(function (d) {
    [["", ""], ["", ""], ["", ""], ["#", ""], ["", "#"], ["b", ""], ["", "b"]].forEach(function (a) {
      var diff = LN.midiAcc(d + 1, a[1]) - LN.midiAcc(d, a[0]);
      if (diff === 1 || diff === 2) COPPIE.push({ d: d, a1: a[0], a2: a[1], diff: diff });
    });
  });
  function tono() {
    var c = pick(COPPIE), n1 = nome(c.d, c.a1), n2 = nome(c.d + 1, c.a2), semi = c.diff === 1;
    return scelta({ id: "t-" + c.d + c.a1 + c.a2, domanda: "Tra queste due note c'è un tono o un semitono?",
      stage: rigo({ notes: [{ d: c.d, acc: c.a1 || undefined }, { d: c.d + 1, acc: c.a2 || undefined }], gap: 60, startX: 64 }),
      spiega: "Da " + n1 + " a " + n2 + (semi ? " c'è un semitono: sul pianoforte sono due tasti vicini." : " c'è un tono, cioè due semitoni: sul pianoforte c'è un tasto in mezzo."),
      suono: [[LN.midiAcc(c.d, c.a1), 0.8], [LN.midiAcc(c.d + 1, c.a2), 0.8]] }, semi ? "Semitono" : "Tono", [semi ? "Tono" : "Semitono"]);
  }

  /* ---------- 5. Le alterazioni ---------- */
  function alterazioni() {
    var tipo = pick(["nome", "nome", "battuta", "armatura", "fissa"]), d, acc, giusta, q;
    if (tipo === "nome") {
      d = pick(LN.range(29, 37)); acc = accPer(d);
      giusta = nome(d, acc);
      return scelta({ id: "a-" + d + acc, domanda: "Come si chiama questa nota?", stage: rigo({ notes: [{ d: d, acc: acc }], gap: 60, startX: 74, scale: 2.4 }),
        spiega: "Il " + (acc === "#" ? "diesis alza" : "bemolle abbassa") + " il " + LN.nm(d) + " di un semitono: è " + giusta + ".", suono: [[LN.midiAcc(d, acc), 0.9]] },
        giusta, [nome(d, ""), nome(d, acc === "#" ? "b" : "#"), nome(d + (acc === "#" ? 1 : -1), "")]);
    }
    if (tipo === "battuta") {
      d = pick([30, 31, 32, 33, 35]); acc = accPer(d);
      var dopo = Math.random() < 0.5, note = [{ d: d, acc: acc }, { d: d + 1 }];
      if (dopo) note.push({ d: d - 1 }, { d: d, cls: "hl" }); else note.push({ d: d, cls: "hl" }, { d: d - 1 });
      giusta = dopo ? nome(d, "") : nome(d, acc);
      return scelta({ id: "b-" + d + acc + dopo, domanda: "Come si suona la nota colorata?", stage: rigo({ notes: note, bars: dopo ? [2] : [], gap: 44 }),
        spiega: dopo ? "La stanghetta chiude la battuta: l'alterazione non vale più e la nota torna " + nome(d, "") + "." : "È nella stessa battuta del primo " + LN.nm(d) + ": l'alterazione vale ancora, quindi è " + nome(d, acc) + ".",
        suono: [[LN.midiAcc(d, dopo ? "" : acc), 0.9]] }, giusta, [dopo ? nome(d, acc) : nome(d, "")]);
    }
    if (tipo === "armatura") {
      var fa = Math.random() < 0.5, arm = fa ? [[38, "#"]] : [[34, "b"]], g = fa ? pick([31, 38]) : pick([27, 34]), a = fa ? "#" : "b";
      var beq = Math.random() < 0.35;
      giusta = beq ? nome(g, "") : nome(g, a);
      return scelta({ id: "k-" + g + beq, domanda: "Come si suona la nota colorata?", stage: rigo({ armatura: arm, notes: [{ d: g + (g > 33 ? -1 : 1) }, { d: g, cls: "hl", acc: beq ? "n" : undefined }], gap: 56 }),
        spiega: beq ? "Il bequadro annulla l'alterazione in chiave fino alla fine della battuta: è " + nome(g, "") + "." : "L'armatura ha il " + nome(fa ? 38 : 34, a) + ": vale per tutti i " + LN.nm(g) + " del brano, in ogni ottava. È " + nome(g, a) + ".",
        suono: [[LN.midiAcc(g, beq ? "" : a), 0.9]] }, giusta, [beq ? nome(g, a) : nome(g, "")]);
    }
    var fissa = Math.random() < 0.5;
    q = scelta({ id: "x-" + fissa, domanda: "L'alterazione su questo rigo è fissa o transitoria?",
      stage: fissa ? rigo({ armatura: pick([[[38, "#"]], [[34, "b"]]]), notes: [{ d: 30 }, { d: 32 }, { d: 33 }], gap: 46 }) : rigo({ notes: [{ d: 30 }, { d: 31, acc: "#" }, { d: 30 }], gap: 46 }),
      spiega: fissa ? "È scritta subito dopo la chiave, nell'armatura: è fissa e vale per tutto il brano." : "È scritta davanti a una nota durante il brano: è transitoria e vale solo fino alla fine della battuta." },
      fissa ? "Fissa" : "Transitoria", [fissa ? "Transitoria" : "Fissa"]);
    return q;
  }

  /* ---------- 6. Le note enarmoniche ---------- */
  var ENA = [[[28, "#"], [29, "b"]], [[29, "#"], [30, "b"]], [[31, "#"], [32, "b"]], [[32, "#"], [33, "b"]], [[33, "#"], [34, "b"]], [[30, "#"], [31, ""]], [[34, "#"], [35, ""]]];
  function enarmoniche() {
    var c = pick(ENA), i = Math.random() < 0.5 ? 0 : 1;
    if (c[i][1] === "") i = 0; // si chiede l'enarmonica della nota alterata
    var a = c[i], b = c[1 - i], m = LN.midiAcc(a[0], a[1]);
    var pool = [];
    ENA.forEach(function (x) { x.forEach(function (n) { if (LN.midiAcc(n[0], n[1]) !== m) pool.push(nome(n[0], n[1])); }); });
    pool = mescola(pool.filter(function (x, k) { return pool.indexOf(x) === k; }));
    return scelta({ id: "e-" + a[0] + a[1], domanda: "Qual è la nota enarmonica di questa?", stage: rigo({ notes: [{ d: a[0], acc: a[1] }], gap: 60, startX: 74, scale: 2.4 }),
      spiega: nome(a[0], a[1]) + " e " + nome(b[0], b[1]) + " hanno nomi diversi ma lo stesso suono: sul clarinetto si suonano con la stessa posizione.",
      suono: [[m, 0.8], [m, 0.8]] }, nome(b[0], b[1]), pool.slice(0, 3));
  }

  var GEN = { parti: parti, punto: punto, segno: segno, tono: tono, alterazioni: alterazioni, enarmoniche: enarmoniche };
  LN.segni = {
    /* Una domanda del livello L, diversa (quando si può) da quella con id "evita". */
    domanda: function (L, evita) {
      var q, n = 0;
      do { q = GEN[L.gen](); n++; } while (q.id === evita && n < 20);
      return q;
    }
  };
})(window.LN);
