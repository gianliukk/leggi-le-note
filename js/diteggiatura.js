/* Diteggiatura del clarinetto in Si bemolle (sistema Boehm), per le note SCRITTE.
   Fonte: «Elenco delle posizioni» del metodo Ascolta, leggi & suona 3 (De Haske, pag. 52),
   confrontato nota per nota con il Woodwind Fingering Guide. Le chiavi hanno i numeri del metodo.
   Il suono reale è un tono sotto la nota scritta. */
window.LN = window.LN || {};
(function (LN) {
  "use strict";

  /* Fori: P portavoce, T foro del pollice, L1-L3 mano sinistra, R1-R3 mano destra (dall'alto). */
  var TUTTI = "T L1 L2 L3 R1 R2 R3", SX = "T L1 L2 L3";
  /* Chiavi con i numeri del metodo: mano che le preme, dito e sagoma nel disegno.
     f = riquadro [x, y, larghezza, altezza]: pillola arrotondata, oppure d = sagoma disegnata dentro il riquadro;
     n = dove scrivere il numero se la chiave è troppo sottile per contenerlo.
     come = come si preme, se non basta il nome del dito (11, 10 bis e 7 con il dorso dell'indice destro).
     Schema semplice, come lo strumento visto di fronte: chiavi del La e del La♭ in alto, chiavi laterali
     dell'indice destro a sinistra dei fori (11, 10 bis, 8, 7 dall'alto), chiavetta 7 bis tra il 2° e il 3° foro della mano sinistra,
     paletta 6 sotto il 3° foro; sotto la lineetta, a destra, la 3 bis di traverso e le chiavi lunghe 1 e 2
     del mignolo sinistro; chiavetta 5 tra il 2° e il 3° foro della mano destra, mignolo destro in basso a sinistra. */
  var CHIAVI = {
    "10": { testo: "chiave del La", mano: "sx", dito: "indice", f: [75, 34, 27, 32] },
    "9": { testo: "chiave del La♭", mano: "sx", dito: "indice", f: [104, 44, 22, 34], d: "M104,44h6a16,17 0 0 1 0,34h-6z" },
    "11": { testo: "chiave laterale", mano: "dx", dito: "indice", come: "dorso dell'indice destro, vicino alla nocca", f: [40, 148, 30, 16], lato: 1 },
    "10bis": { testo: "chiave laterale", mano: "dx", dito: "indice", come: "dorso dell'indice destro, vicino alla nocca", f: [36, 166, 34, 16], lato: 1 },
    "8": { testo: "chiave laterale", mano: "dx", dito: "indice", f: [32, 184, 38, 16], lato: 1 },
    "7": { testo: "chiave laterale", mano: "dx", dito: "indice", come: "dorso dell'indice destro, vicino alla nocca", f: [28, 202, 42, 16], lato: 1 },
    "7bis": { testo: "chiavetta Mi♭/Si♭", mano: "sx", dito: "anulare", f: [72, 159, 28, 10], d: "M72,164Q86,157 100,164Q86,170 72,164z", n: [130, 162] },
    "6": { testo: "paletta Do♯/Sol♯", mano: "sx", dito: "mignolo", f: [113, 201, 24, 18] },
    "3bis": { testo: "Fa/Do", mano: "sx", dito: "mignolo", f: [113, 226, 44, 16] },
    "1": { testo: "Mi/Si", mano: "sx", dito: "mignolo", f: [113, 246, 20, 44] },
    "2": { testo: "Fa♯/Do♯", mano: "sx", dito: "mignolo", f: [137, 246, 20, 44] },
    "5": { testo: "chiavetta Si/Fa♯", mano: "dx", dito: "anulare", f: [72, 308, 28, 10], d: "M72,313Q86,306 100,313Q86,319 72,313z", n: [130, 313] },
    "1bis": { testo: "Mi/Si", mano: "dx", dito: "mignolo", f: [16, 398, 40, 22] },
    "3": { testo: "Fa/Do", mano: "dx", dito: "mignolo", f: [60, 398, 40, 22] },
    "2bis": { testo: "Fa♯/Do♯", mano: "dx", dito: "mignolo", f: [16, 372, 40, 22] },
    "4": { testo: "La♭/Mi♭", mano: "dx", dito: "mignolo", f: [60, 372, 40, 22] }
  };
  /* Chiavi laterali a gradino, con il lato sinistro inclinato. */
  function lato(x, y, w, h) { return "M" + (x + 6) + "," + y + "H" + (x + w) + "V" + (y + h) + "H" + x + "z"; }

  /* sp: grafie [grado, alterazione]; pos: [fori, chiavi]. La prima posizione è quella principale. */
  var NOTE = [
    { sp: [[23, ""]], pos: [[TUTTI, "1 3"], [TUTTI, "1bis"]] },
    { sp: [[24, ""]], pos: [[TUTTI, "3"], [TUTTI, "3bis"]] },
    { sp: [[24, "#"], [25, "b"]], pos: [[TUTTI, "2bis"], [TUTTI, "2"]] },
    { sp: [[25, ""]], pos: [[TUTTI, ""]] },
    { sp: [[25, "#"], [26, "b"]], pos: [[TUTTI, "4"]] },
    { sp: [[26, ""]], pos: [["T L1 L2 L3 R1 R2", ""]] },
    { sp: [[26, "#"], [27, "b"]], pos: [["T L1 L2 L3 R1", ""]] },
    { sp: [[27, ""]], pos: [["T L1 L2 L3 R2", ""], ["T L1 L2 L3 R1", "5"]] },
    { sp: [[28, ""]], pos: [[SX, ""]] },
    { sp: [[28, "#"], [29, "b"]], pos: [[SX, "6"]] },
    { sp: [[29, ""]], pos: [["T L1 L2", ""]] },
    { sp: [[29, "#"], [30, "b"]], pos: [["T L1 L2", "7"], ["T L1 R1", ""]] },
    { sp: [[30, ""]], pos: [["T L1", ""]] },
    { sp: [[31, ""]], pos: [["T", ""]] },
    { sp: [[31, "#"], [32, "b"]], pos: [["L1", ""], ["T", "7 8"]] },
    { sp: [[32, ""]], pos: [["", ""]] },
    { sp: [[32, "#"], [33, "b"]], pos: [["", "9"]] },
    { sp: [[33, ""]], pos: [["", "10"]] },
    { sp: [[33, "#"], [34, "b"]], pos: [["P", "10"]] },
    { sp: [[34, ""]], pos: [["P " + TUTTI, "1 3"], ["P " + TUTTI, "1bis"]] },
    { sp: [[35, ""]], pos: [["P " + TUTTI, "3"], ["P " + TUTTI, "3bis"]] },
    { sp: [[35, "#"], [36, "b"]], pos: [["P " + TUTTI, "2bis"], ["P " + TUTTI, "2"]] },
    { sp: [[36, ""]], pos: [["P " + TUTTI, ""]] },
    { sp: [[36, "#"], [37, "b"]], pos: [["P " + TUTTI, "4"]] },
    { sp: [[37, ""]], pos: [["P T L1 L2 L3 R1 R2", ""]] },
    { sp: [[38, ""]], pos: [["P T L1 L2 L3 R1", ""]] },
    { sp: [[38, "#"], [39, "b"]], pos: [["P T L1 L2 L3 R2", ""], ["P T L1 L2 L3 R1", "5"]] },
    { sp: [[39, ""]], pos: [["P " + SX, ""]] },
    { sp: [[39, "#"], [40, "b"]], pos: [["P " + SX, "6"]] },
    { sp: [[40, ""]], pos: [["P T L1 L2", ""]] },
    { sp: [[40, "#"], [41, "b"]], pos: [["P T L1 L2", "7"], ["P T L1 R1", ""]] },
    { sp: [[41, ""]], pos: [["P T L1", ""]] },
    { sp: [[42, ""]], pos: [["P T", ""]] },
    { sp: [[42, "#"], [43, "b"]], pos: [["P T L2 L3 R1 R2", ""]] },
    { sp: [[43, ""]], pos: [["P T L2 L3 R1", "4"]] },
    { sp: [[43, "#"], [44, "b"]], pos: [["P T L2 L3 R1", "5 4"]] },
    { sp: [[44, ""]], pos: [["P T L2 L3", "4"]] },
    { sp: [[45, ""]], pos: [["P T L2 L3", "6 4"], ["P " + TUTTI, "6"]] }
  ];

  var IT = ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si"];
  function registro(d) { return d <= 27 ? "grave" : d <= 34 ? "medio" : d <= 41 ? "acuto" : "sovracuto"; }
  function grafia(s) { return IT[s[0] % 7] + (s[1] === "#" ? "♯" : s[1] === "b" ? "♭" : ""); }
  NOTE.forEach(function (n) {
    n.d = n.sp[0][0];
    n.id = grafia(n.sp[0]) + " " + registro(n.d);
    n.nome = n.sp.map(grafia).join(" / ") + " " + registro(n.d);
    n.scritto = LN.midiOf(n.sp[0][0]) + (n.sp[0][1] === "#" ? 1 : 0);
    n.pos = n.pos.map(function (p) { return { fori: p[0] ? p[0].split(" ") : [], chiavi: p[1] ? p[1].split(" ") : [] }; });
  });
  function firma(p) { return p.fori.slice().sort().join(",") + "|" + p.chiavi.slice().sort().join(","); }
  function trova(id) { return NOTE.find(function (n) { return n.id === id; }); }
  function mescola(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  /* ---------- Disegno della posizione, come nell'elenco del metodo ---------- */
  function etichetta(k) { return k.replace("bis", " bis"); }
  /* Ordine delle chiavi: dall'alto in basso, poi per numero (1 prima di 1 bis). */
  function ordina(a, b) { return CHIAVI[a].f[1] - CHIAVI[b].f[1] || parseInt(a, 10) - parseInt(b, 10) || a.length - b.length; }
  /* Il clarinetto visto di fronte: fori al centro, pollice e portavoce a sinistra (sono dietro),
     tutte le chiavi al loro posto. Le chiavi da premere sono colorate con il loro numero:
     gialle per la mano sinistra, azzurre per la mano destra. */
  var CX = 92, FORI = [["L1", 104], ["L2", 142], ["L3", 188], ["R1", 252], ["R2", 290], ["R3", 336]];
  /* o.legenda aggiunge le scritte «dietro», «mano sinistra», «mano destra» (per la guida). */
  function svg(p, o) {
    o = o || {};
    var on = {}; p.fori.forEach(function (f) { on[f] = 1; });
    var premute = {}; p.chiavi.forEach(function (k) { premute[k] = 1; });
    var s = '<svg class="dita-pos' + (o.cls ? " " + o.cls : "") + '" viewBox="0 0 180 430" role="img" aria-label="' + (o.aria || "Posizione") + '">';
    s += '<rect class="corpo" x="' + (CX - 20) + '" y="28" width="40" height="336" rx="20"/>';
    if (o.legenda) s += '<text class="scritta" x="35" y="12" text-anchor="middle">POLLICE</text><text class="scritta" x="35" y="23" text-anchor="middle">SINISTRO</text>' +
      '<text class="scritta" x="35" y="35" text-anchor="middle">(dietro)</text>' +
      '<text class="scritta" x="176" y="104" text-anchor="end">MANO</text><text class="scritta" x="176" y="115" text-anchor="end">SINISTRA</text>' +
      '<text class="scritta" x="4" y="236">MANO DESTRA</text>';
    // portavoce: chiavetta stretta e lunga, in verticale
    s += '<path class="pv' + (on.P ? " on" : "") + '" d="M35,40Q43,54 35,68Q27,54 35,40z"/>';
    s += '<circle class="fr pol' + (on.T ? " on" : "") + '" cx="35" cy="82" r="12"/>';
    FORI.forEach(function (f) { s += '<circle class="fr' + (on[f[0]] ? " on" : "") + '" cx="' + CX + '" cy="' + f[1] + '" r="14"/>'; });
    s += '<line class="sep" x1="4" x2="176" y1="222" y2="222"/>';
    Object.keys(CHIAVI).forEach(function (k) {
      var c = CHIAVI[k], f = c.f, su = premute[k], cl = "ch" + (su ? " su " + c.mano : ""), d = c.lato ? lato(f[0], f[1], f[2], f[3]) : c.d;
      s += d ? '<path class="' + cl + '" d="' + d + '"/>' :
        '<rect class="' + cl + '" x="' + f[0] + '" y="' + f[1] + '" width="' + f[2] + '" height="' + f[3] + '" rx="' + Math.min(f[2], f[3]) / 2 + '"/>';
      if (!su) return;
      var bis = /bis/.test(k), x = c.n ? c.n[0] : f[0] + f[2] / 2 + (c.lato ? 3 : 0), y = c.n ? c.n[1] : f[1] + f[3] / 2;
      var w = bis ? 30 : 22, fs = f[3] < 18 && !c.n ? ' style="font-size:13px"' : "";
      // segmento che collega il numero alla chiavetta sottile
      if (c.n) s += '<line class="guida ' + c.mano + '" x1="' + (f[0] + f[2] - 2) + '" y1="' + (f[1] + f[3] / 2) + '" x2="' + (x - w / 2) + '" y2="' + y + '"/>' +
        '<rect class="' + cl + '" x="' + (x - w / 2) + '" y="' + (y - 9) + '" width="' + w + '" height="18" rx="9"/>';
      // "bis" più piccolo: accanto al numero, o sotto se la chiave è stretta e alta
      var sotto = bis && f[2] < 26 && !c.n;
      s += '<text class="ch-t ' + c.mano + '"' + fs + ' x="' + x + '" y="' + (y + (sotto ? -1 : 5.5)) + '" text-anchor="middle">' + k.replace("bis", "") +
        (bis ? '<tspan class="bis"' + (sotto ? ' x="' + x + '" dy="11"' : ' dx="1"') + ">bis</tspan>" : "") + "</text>";
    });
    // firma dell'autore: piccola in ogni posizione, in filigrana grande nella guida
    if (o.legenda) s += '<text class="filigrana" x="96" y="215" text-anchor="middle" transform="rotate(-62 96 215)">© 2026 prof. Gianluca Marano</text>';
    s += '<text class="firma" x="176" y="428" text-anchor="end">© G. Marano</text>';
    return s + "</svg>";
  }

  /* Descrizione a parole: per il riepilogo dopo la risposta. */
  function aParole(p) {
    var on = {}; p.fori.forEach(function (f) { on[f] = 1; });
    var parti = [];
    if (on.P) parti.push("portavoce");
    if (on.T) parti.push("pollice");
    var sx = ["L1", "L2", "L3"].filter(function (f) { return on[f]; }).map(function (f) { return f[1]; });
    var dx = ["R1", "R2", "R3"].filter(function (f) { return on[f]; }).map(function (f) { return f[1]; });
    if (sx.length) parti.push("sinistra " + sx.join("-"));
    if (dx.length) parti.push("destra " + dx.join("-"));
    if (p.chiavi.length) parti.push((p.chiavi.length === 1 ? "chiave " : "chiavi ") + p.chiavi.map(function (k) {
      var c = CHIAVI[k];
      return etichetta(k) + " (" + (c.come ? c.come : c.dito + (c.mano === "sx" ? " sinistro" : " destro")) + ")";
    }).join(" e "));
    return parti.length ? parti.join(", ") : "tutto aperto";
  }

  /* ---------- Domande ---------- */
  /* Note vicine (per le risposte sbagliate): stesso livello prima, poi entro qualche semitono. */
  function vicine(n, ids) {
    var pool = ids.map(trova).filter(function (x) { return x !== n; });
    var altre = NOTE.filter(function (x) { return x !== n && pool.indexOf(x) < 0 && Math.abs(x.scritto - n.scritto) <= 4; });
    return mescola(pool).concat(mescola(altre));
  }
  function domanda(L, evita) {
    var ids = L.note.filter(function (id) { return id !== evita; });
    var n = trova(pick(ids)), modo = pick(L.modi || ["quale", "nome"]);
    var giuste = {}; n.pos.forEach(function (p) { giuste[firma(p)] = 1; });
    var q = { n: n, modo: modo, sp: pick(n.sp) };
    if (modo === "quale") {
      var corretta = pick(n.pos), opz = [corretta], viste = {};
      viste[firma(corretta)] = 1;
      vicine(n, L.note).some(function (x) {
        var p = pick(x.pos), f = firma(p);
        if (!giuste[f] && !viste[f]) { viste[f] = 1; opz.push(p); }
        return opz.length >= 3;
      });
      q.opzioni = mescola(opz);
      q.giusta = q.opzioni.indexOf(corretta);
    } else {
      q.pos = pick(n.pos);
      var f0 = firma(q.pos), nomi = [n];
      vicine(n, L.note).some(function (x) {
        if (!x.pos.some(function (p) { return firma(p) === f0; })) nomi.push(x);
        return nomi.length >= 4;
      });
      q.opzioni = mescola(nomi);
      q.giusta = q.opzioni.indexOf(n);
    }
    return q;
  }
  function descrivi(q) {
    var n = q.n, t = "È il " + n.nome + ": " + aParole(n.pos[0]) + ".";
    if (n.pos.length > 1) t += " Oppure: " + n.pos.slice(1).map(aParole).join("; ") + ".";
    return t;
  }

  LN.dita = {
    NOTE: NOTE,
    CHIAVI: CHIAVI,
    etichetta: etichetta,
    ordina: ordina,
    svg: svg,
    aParole: aParole,
    domanda: domanda,
    descrivi: descrivi,
    trova: trova,
    /* Suono reale del clarinetto in Si♭: un tono sotto la nota scritta. */
    reale: function (n) { return n.scritto - 2; }
  };
})(window.LN);
