/* Medaglie: si guadagnano una volta sola e restano nel profilo con la data.
   Ognuna ha un traguardo (n) e una funzione che misura a che punto si è (val). */
window.LN = window.LN || {};
(function (LN) {
  "use strict";
  var S = LN.store;
  function st() { return S.state.stat || {}; }
  function unitaFatta(titolo) {
    var u = LN.PERCORSO.findIndex(function (x) { return x.titolo === titolo; });
    return LN.TAPPE.filter(function (t) { return t.unit === u; }).every(function (t) { return S.completata(t.key); }) ? 1 : 0;
  }
  function conStelle(k) { return LN.TAPPE.filter(function (t) { return S.best(t.key).stars >= k; }).length; }
  function perfette() {
    var dalRecord = LN.TAPPE.filter(function (t) { return S.best(t.key).score >= t.L.q; }).length;
    return Math.max(st().perfette || 0, dalRecord);
  }
  function serieMax() { return Math.max(st().serieMax || 0, S.serieAttuale()); }

  LN.MEDAGLIE = [
    { id: "primo", nome: "Primo concerto", descr: "Gioca la tua prima tappa", segno: "♩", n: 1, val: function () { return S.state.xp > 0 || Object.keys(S.state.best).length ? 1 : 0; } },
    { id: "domi", nome: "Do, Re, Mi", descr: "Supera l'unità «Le prime note»", segno: "\u{1D11E}", n: 1, val: function () { return unitaFatta("Le prime note"); } },
    { id: "durate", nome: "Tempo giusto", descr: "Supera l'unità «Quanto dura una nota»", segno: "\u{1D15E}", n: 1, val: function () { return unitaFatta("Quanto dura una nota"); } },
    { id: "scala", nome: "Scala completa", descr: "Supera l'unità «La scala»", segno: "♫", n: 1, val: function () { return unitaFatta("La scala"); } },
    { id: "pause", nome: "Il silenzio conta", descr: "Supera l'unità «Il silenzio conta»", segno: "\u{1D13D}", n: 1, val: function () { return unitaFatta("Il silenzio conta"); } },
    { id: "orecchio", nome: "Orecchio d'oro", descr: "Supera l'unità «Orecchio attento»", segno: "\u{1D192}", n: 1, val: function () { return unitaFatta("Orecchio attento"); } },
    { id: "ritmo", nome: "Senso del ritmo", descr: "Supera l'unità «Il ritmo»", segno: "\u{1D15F}\u{1D15F}", n: 1, val: function () { return unitaFatta("Il ritmo"); } },
    { id: "dita", nome: "Dita d'oro", descr: "Supera tutte le tappe sulle posizioni del clarinetto", segno: "\u{1D10B}", n: 6, val: function () { return LN.TAPPE.filter(function (t) { return t.track === "dita" && S.completata(t.key); }).length; } },
    { id: "finale", nome: "Gran finale", descr: "Supera tutte le tappe del percorso", segno: "\u{1D102}", sc: 1.3, n: LN.TAPPE.length, val: function () { return LN.TAPPE.filter(function (t) { return S.completata(t.key); }).length; } },
    { id: "perfetta", nome: "Esecuzione perfetta", descr: "Completa una tappa senza errori", segno: "♬", n: 1, val: perfette },
    { id: "leggio", nome: "Leggio d'oro", descr: "Prendi 3 stelle in 5 tappe", segno: "\u{1D11A}", n: 5, val: function () { return conStelle(3); } },
    { id: "vivace", nome: "Vivace", descr: "Dai 20 risposte giuste di fila in una tappa", segno: "\u{1D191}\u{1D191}", n: 20, val: function () { return st().filaMax || 0; } },
    { id: "metronomo", nome: "Metronomo", descr: "Allenati 7 giorni di fila", segno: "\u{1D134}", n: 7, val: serieMax },
    { id: "sinfonia", nome: "Sinfonia", descr: "Allenati 30 giorni di fila", segno: "\u{1D15D}", sc: 1.4, sy: -0.22, n: 30, val: serieMax },
    { id: "ritornello", nome: "Ritornello", descr: "Fai 5 ripassi degli errori", segno: "\u{1D107}", n: 5, val: function () { return st().ripassi || 0; } },
    { id: "missioni", nome: "Missione compiuta", descr: "Completa tutte le missioni di un giorno", segno: "♪", n: 1, val: function () { return st().giorniMissioni || 0; } },
    { id: "segni", nome: "Occhio ai segni", descr: "Supera l'unità «Leggere i segni»", segno: "\u{1D110}", n: 1, val: function () { return unitaFatta("Leggere i segni"); } },
    { id: "alterazioni", nome: "Diesis e bemolle", descr: "Supera l'unità «Toni, semitoni e alterazioni»", segno: "♯♭", n: 1, val: function () { return unitaFatta("Toni, semitoni e alterazioni"); } },
    { id: "classe", nome: "Orchestra unita", descr: "Completa una missione di classe", segno: "\u{1D121}", n: 1, val: function () { return st().missioniClasse || 0; } },
    { id: "brani", nome: "Repertorio classico", descr: "Supera i quattro brani di Beethoven, Mozart e Haydn", segno: "\u{1D122}", n: 4, val: function () { return LN.TAPPE.filter(function (t) { return t.icona === "brano" && S.completata(t.key); }).length; } },
    { id: "tesori", nome: "Cacciatore di tesori", descr: "Apri 10 casse del tesoro", segno: "\u{1D11F}", n: 10, val: function () { return st().casse || 0; } },
    { id: "mille", nome: "Mille note", descr: "Raggiungi 1000 XP", segno: "\u{1D160}", n: 1000, val: function () { return S.state.xp; } }
  ];
  var COLORI = ["var(--u0)", "var(--u1)", "var(--u2)", "var(--u3)"];
  LN.MEDAGLIE.forEach(function (m, i) { m.col = COLORI[i % 4]; });

  LN.medaglie = {
    /* Assegna le medaglie raggiunte e restituisce quelle nuove. */
    controlla: function () {
      var d = new Date(), oggi = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
      var mie = S.state.medaglie = S.state.medaglie || {}, nuove = [];
      LN.MEDAGLIE.forEach(function (m) {
        if (!mie[m.id] && (!m.nascosta || !m.nascosta()) && m.val() >= m.n) { mie[m.id] = oggi; nuove.push(m); }
      });
      if (nuove.length) S.salva();
      return nuove;
    },
    /* [{ m, data, val }] nell'ordine dell'elenco */
    elenco: function () {
      var mie = S.state.medaglie || {};
      // Le medaglie degli eventi a tempo si vedono durante l'evento o, dopo, solo se sono state prese.
      return LN.MEDAGLIE.filter(function (m) { return mie[m.id] || !m.nascosta || !m.nascosta(); })
        .map(function (m) { return { m: m, data: mie[m.id] || null, val: Math.min(m.n, m.val()) }; });
    },
    icona: function (m, presa) {
      return '<span class="medaglia' + (presa ? "" : " spenta") + '" style="--mc:' + m.col + (m.sc ? ";--ms:" + m.sc : "") + (m.sy ? ";--my:" + m.sy + "em" : "") + '" aria-hidden="true"><span>' + m.segno + "</span></span>";
    }
  };
})(window.LN);
