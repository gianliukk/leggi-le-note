/* Esercizi di ritmo: una battuta in 4/4 da battere a tempo sul pulsante grande,
   dopo quattro colpi di metronomo. Tempi espressi in quarti (1 = una semiminima). */
window.LN = window.LN || {};
(function (LN) {
  "use strict";

  /* Mattoncini con cui si costruisce la battuta. forte = solo sul 1° o 3° tempo. */
  var SCELTE = {
    semibreve: { el: [{ v: 0, b: 4 }], peso: 0.6 },
    minima: { el: [{ v: 1, b: 2 }], peso: 2, forte: true },
    semiminima: { el: [{ v: 2, b: 1 }], peso: 3 },
    crome: { el: [{ v: 3, b: 0.5 }, { v: 3, b: 0.5 }], peso: 3 },
    pausa: { el: [{ v: 2, b: 1, rest: true }], peso: 1.5 },
    pausaMinima: { el: [{ v: 1, b: 2, rest: true }], peso: 0.7, forte: true }
  };
  function durata(k) { return SCELTE[k].el.reduce(function (s, e) { return s + e.b; }, 0); }
  function pesata(chiavi) {
    var tot = chiavi.reduce(function (s, k) { return s + SCELTE[k].peso; }, 0), r = Math.random() * tot;
    for (var i = 0; i < chiavi.length; i++) { r -= SCELTE[chiavi[i]].peso; if (r <= 0) return chiavi[i]; }
    return chiavi[chiavi.length - 1];
  }

  /* Una battuta casuale per il livello L, diversa da quella con chiave "evita". */
  function battuta(L, evita) {
    var out;
    for (var tent = 0; tent < 60; tent++) {
      var pos = 0;
      out = [];
      while (pos < 4) {
        var ok = L.figure.filter(function (k) {
          if (pos + durata(k) > 4) return false;
          if (k === "semibreve" && pos !== 0) return false;
          return !SCELTE[k].forte || pos % 2 === 0;
        });
        var k = pesata(ok);
        SCELTE[k].el.forEach(function (e, i) { out.push({ v: e.v, b: e.b, rest: !!e.rest, start: pos, trave: k === "crome" ? i : null }); pos += e.b; });
      }
      out.chiave = out.map(function (e) { return (e.rest ? "p" : "f") + e.v; }).join("");
      var note = out.filter(function (e) { return !e.rest; }).length;
      if (note < 2 || out.chiave === evita) continue;
      if (L.serve && !L.serve(out)) continue;
      return out;
    }
    return out;
  }

  /* ---------- Disegno: rigo di una sola linea, spaziatura proporzionale alla durata ---------- */
  var W = 360, Y = 50, X0 = 64, X1 = W - 22, BW = (X1 - X0) / 4;
  var PAUSA = "\u{1D13D}";
  function x(b) { return X0 + b * BW; }
  function svg(bt, o) {
    o = o || {};
    var H = o.esito ? 118 : 92, s = '<svg class="staff ritmo-svg" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Battuta da battere">';
    s += '<line class="sl" x1="6" x2="' + (X1 + 14) + '" y1="' + Y + '" y2="' + Y + '"/>';
    s += '<text class="tsig" x="26" y="' + (Y - 3) + '" text-anchor="middle">4</text><text class="tsig" x="26" y="' + (Y + 19) + '" text-anchor="middle">4</text>';
    s += '<line class="bar" x1="' + (X1 + 8) + '" x2="' + (X1 + 8) + '" y1="' + (Y - 16) + '" y2="' + (Y + 16) + '"/>';
    s += '<rect class="bar-fine" x="' + (X1 + 11) + '" y="' + (Y - 16) + '" width="3.5" height="32"/>';
    bt.forEach(function (e, i) {
      var cx = x(e.start) + 8;
      if (e.rest) {
        if (e.v === 1) s += '<rect class="rs" x="' + (cx - 7) + '" y="' + (Y - 6) + '" width="14" height="6"/>';
        else s += '<text class="rest" x="' + cx + '" y="' + (Y + 14) + '" font-size="40" text-anchor="middle">' + PAUSA + "</text>";
        return;
      }
      if (e.v === 0) { s += '<ellipse class="hdo" cx="' + cx + '" cy="' + Y + '" rx="7" ry="4.5" stroke-width="2.4"/>'; return; }
      if (e.v === 1) s += '<ellipse class="hdo" cx="' + cx + '" cy="' + Y + '" rx="6" ry="4" stroke-width="1.7" transform="rotate(-20 ' + cx + " " + Y + ')"/>';
      else s += '<ellipse class="hd" cx="' + cx + '" cy="' + Y + '" rx="6.2" ry="4.4" transform="rotate(-20 ' + cx + " " + Y + ')"/>';
      var sx = cx + 5.6;
      s += '<line class="stm" x1="' + sx + '" x2="' + sx + '" y1="' + (Y - 1) + '" y2="' + (Y - 32) + '"/>';
      if (e.trave === 0) { var nx = x(bt[i + 1].start) + 8 + 5.6; s += '<rect class="trave" x="' + (sx - 0.8) + '" y="' + (Y - 33) + '" width="' + (nx - sx + 1.6) + '" height="5"/>'; }
    });
    // Battiti sotto il rigo: 1 2 3 4, con "e" sulle crome
    for (var b = 0; b < 4; b++) s += '<text class="conta" x="' + (x(b) + 8) + '" y="' + (Y + 34) + '" text-anchor="middle">' + (b + 1) + "</text>";
    bt.forEach(function (e) { if (e.trave === 1) s += '<text class="conta e" x="' + (x(e.start) + 8) + '" y="' + (Y + 34) + '" text-anchor="middle">e</text>'; });
    if (o.testina) s += '<line class="testina" id="testina" x1="' + (x(0) + 8) + '" x2="' + (x(0) + 8) + '" y1="' + (Y - 40) + '" y2="' + (Y + 22) + '" style="visibility:hidden"/>';
    if (o.esito) {
      var ty = Y + 56;
      s += '<line class="linea-t" x1="' + x(0) + '" x2="' + (x(4) + 8) + '" y1="' + ty + '" y2="' + ty + '"/>';
      o.esito.attese.forEach(function (m) { s += '<circle class="atteso' + (m.colpo == null ? " mancato" : "") + '" cx="' + (x(m.t) + 8) + '" cy="' + ty + '" r="6"/>'; });
      o.esito.attese.forEach(function (m) { if (m.colpo != null) s += '<circle class="colpo ok" cx="' + (x(m.colpo) + 8) + '" cy="' + ty + '" r="3.6"/>'; });
      o.esito.extra.forEach(function (c) { s += '<circle class="colpo bad" cx="' + (x(Math.max(-0.2, Math.min(4.2, c))) + 8) + '" cy="' + ty + '" r="3.6"/>'; });
    }
    return s + "</svg>";
  }

  /* ---------- Valutazione ---------- */
  var TOLLERANZA = 0.33; // in quarti: un colpo vale se arriva entro un terzo di tempo
  function valuta(bt, colpi) {
    var usati = {};
    var attese = bt.filter(function (e) { return !e.rest; }).map(function (e) {
      var best = -1, bd = Infinity;
      colpi.forEach(function (c, i) { var d = Math.abs(c - e.start); if (!usati[i] && d < bd) { bd = d; best = i; } });
      if (best > -1 && bd <= TOLLERANZA) { usati[best] = 1; return { t: e.start, colpo: colpi[best] }; }
      return { t: e.start, colpo: null };
    });
    var extra = colpi.filter(function (c, i) { return !usati[i]; });
    var presi = attese.filter(function (m) { return m.colpo != null; });
    var media = presi.length ? presi.reduce(function (s, m) { return s + m.colpo - m.t; }, 0) / presi.length : 0;
    return { ok: presi.length === attese.length && !extra.length, attese: attese, extra: extra, giusti: presi.length, tot: attese.length, media: media,
      pause: bt.some(function (e) { return e.rest; }) };
  }
  function descrivi(r) {
    if (r.ok) return "Ritmo preciso: " + r.tot + " colpi su " + r.tot + "!";
    var t = "Colpi a tempo: " + r.giusti + " su " + r.tot + ".";
    var manca = r.tot - r.giusti;
    if (manca) t += manca === 1 ? " Ne manca uno." : " Ne mancano " + manca + ".";
    if (r.extra.length) {
      t += r.extra.length === 1 ? " C'è un colpo in più" : " Ci sono " + r.extra.length + " colpi in più";
      t += r.pause ? ": sulle pause non si batte." : ": batti solo all'inizio di ogni nota, poi aspetta che finisca.";
    }
    if (r.media > 0.12) t += " Sei un po' in ritardo.";
    else if (r.media < -0.12) t += " Sei un po' in anticipo.";
    return t;
  }

  /* ---------- Metronomo, ascolto e registrazione dei colpi ---------- */
  var stato = null, NOTA = 67; // Sol sulla seconda riga, suonato dal clarinetto
  function ferma() {
    if (stato) stato.timers.forEach(clearTimeout);
    stato = null;
    LN.suono.ferma();
  }
  /* Programma 4 colpi di attacco + la battuta; restituisce i tempi (ms di performance.now) del primo tempo. */
  function programma(bpm, conNote, bt) {
    var a = LN.suono.contesto(), beat = 60 / bpm, anticipo = 0.2;
    var lat = a ? (a.outputLatency || a.baseLatency || 0) : 0;
    var t0 = a ? a.currentTime + anticipo : 0;
    if (a) {
      for (var i = 0; i < 8; i++) LN.suono.click(t0 + i * beat, i % 4 === 0);
      if (conNote) bt.forEach(function (e) { if (!e.rest) LN.suono.notaA(NOTA, Math.min(e.b * beat * 0.9, 3), t0 + (4 + e.start) * beat); });
    }
    return { primo: performance.now() + (anticipo + 4 * beat + lat) * 1000, beatMs: beat * 1000, avvio: performance.now() + anticipo * 1000 };
  }

  LN.ritmo = {
    battuta: battuta,
    svg: svg,
    valuta: valuta,
    descrivi: descrivi,
    ferma: ferma,
    /* Fa sentire la battuta: 4 colpi di attacco, poi il clarinetto sul ritmo. */
    ascolta: function (bt, bpm, onConta, onFine) {
      ferma();
      var st = stato = { fase: "ascolto", timers: [] };
      LN.suono.prepara([NOTA]).then(function () {
        if (stato !== st) return;
        var p = programma(bpm, true, bt);
        st.primo = p.primo; st.beatMs = p.beatMs;
        for (var i = 0; i < 4; i++) st.timers.push(setTimeout(onConta.bind(null, i + 1), p.avvio - performance.now() + i * p.beatMs));
        st.timers.push(setTimeout(function () { st.fase = "suona"; onConta(0); }, p.primo - performance.now()));
        st.timers.push(setTimeout(function () { if (stato === st) stato = null; onFine(); }, p.primo - performance.now() + 4 * p.beatMs + 300));
      });
    },
    /* Prova dello studente: 4 colpi di attacco, poi registra i colpi per una battuta e la valuta. */
    prova: function (bt, bpm, onConta, onFine) {
      ferma();
      var p = programma(bpm, false, bt), st = stato = { fase: "conteggio", colpi: [], timers: [], primo: p.primo, beatMs: p.beatMs };
      for (var i = 0; i < 4; i++) st.timers.push(setTimeout(onConta.bind(null, i + 1), p.avvio - performance.now() + i * p.beatMs));
      // Si accettano colpi da un terzo di tempo prima del primo tempo.
      st.timers.push(setTimeout(function () { st.fase = "registra"; }, p.primo - performance.now() - TOLLERANZA * p.beatMs));
      st.timers.push(setTimeout(function () { onConta(0); }, p.primo - performance.now()));
      st.timers.push(setTimeout(function () {
        if (stato !== st) return;
        stato = null;
        onFine(valuta(bt, st.colpi));
      }, p.primo - performance.now() + (4 + TOLLERANZA + 0.1) * p.beatMs));
    },
    /* Un colpo sul pulsante: vale solo durante la registrazione. */
    colpo: function () {
      if (!stato || stato.fase !== "registra") return false;
      stato.colpi.push((performance.now() - stato.primo) / stato.beatMs);
      return true;
    },
    /* Posizione attuale nella battuta, in quarti (per la testina), oppure null. */
    posizione: function () {
      if (!stato || !stato.primo || (stato.fase !== "registra" && stato.fase !== "suona")) return null;
      var b = (performance.now() - stato.primo) / stato.beatMs;
      return b >= 0 && b <= 4 ? b : null;
    },
    xDi: function (b) { return x(b) + 8; },
    fase: function () { return stato ? stato.fase : null; }
  };
})(window.LN);
