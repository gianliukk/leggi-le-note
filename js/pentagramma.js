/* Disegno del pentagramma in chiave di violino (SVG). */
window.LN = window.LN || {};
(function (LN) {
  "use strict";
  var TREBLE = "\u{1D11E}";
  var REST = { 2: "\u{1D13D}", 3: "\u{1D13E}", 4: "\u{1D13F}", 5: "\u{1D140}" };

  LN.midiOf = function (d) { return 12 * (Math.floor(d / 7) + 1) + LN.SEMI[d % 7]; };
  LN.nm = function (d) { return LN.store.set.names === "en" ? LN.EN[d % 7] : LN.IT[d % 7]; };

  function flag(sx, sy, dir) {
    return '<path class="fl" d="M' + sx + " " + sy + " C" + (sx + 1) + " " + (sy + 7 * dir) + " " + (sx + 11) + " " + (sy + 10 * dir) + " " + (sx + 8) + " " + (sy + 21 * dir) +
      " C" + (sx + 9) + " " + (sy + 13 * dir) + " " + (sx + 4) + " " + (sy + 10 * dir) + " " + sx + " " + (sy + 8 * dir) + 'Z"/>';
  }

  /* Altezza MIDI di una nota con alterazione ("#" diesis, "b" bemolle, "n" o "" naturale). */
  LN.midiAcc = function (d, acc) { return LN.midiOf(d) + (acc === "#" ? 1 : acc === "b" ? -1 : 0); };
  var ACC = { "#": ["♯", 21, 6.5], b: ["♭", 23, 4.5], n: ["♮", 21, 6.5] };

  /* o.notes: [{d, v, rest, label, cls, acc, suona, punto, corona}]; suona = alterazione che vale senza essere scritta (nella stessa battuta); v = indice in LN.VALUES (assente = semiminima).
     o.legature: [[da, a]] archi tra due note (indici); o.respiri: [indice] virgola dopo la nota;
     o.ritornello: { inizio, fine }; o.armatura: [[grado, alterazione]] segni di ritornello all'inizio e alla fine del rigo. */
  LN.staffSVG = function (o) {
    var clef = o.clef === undefined ? "treble" : o.clef;
    var bottomD = 30;
    var notes = o.notes || [];
    // armatura di chiave: [[grado, "#" o "b"]], scritta subito dopo la chiave
    var arm = o.armatura || [], aw = arm.length ? arm.length * 11 + 4 : 0;
    var startX = o.startX != null ? o.startX : (clef ? 50 : 18) + aw + (o.time ? 24 : 0);
    var gap = o.gap || 30;
    var W = o.width || (startX + notes.length * gap + 12);
    var withLabels = notes.some(function (n) { return n.label != null; });
    var H = withLabels ? 140 : 120;
    function Y(d) { return 80 - (d - bottomD) * 5; }
    var s = '<svg class="staff" viewBox="0 ' + (o.crop ? "24 " + W + " 70" : "0 " + W + " " + H) + '" style="width:' + Math.round((o.scale || 1.6) * W) + 'px" role="img" aria-label="' + (o.aria || "Pentagramma") + '">';
    for (var i = 0; i < 5; i++) { var ly = 80 - i * 10; s += '<line class="sl" x1="2" x2="' + (W - 2) + '" y1="' + ly + '" y2="' + ly + '"/>'; }
    if (clef === "treble") s += '<text class="clef" x="6" y="' + (Y(32) + 10) + '" font-size="40">' + TREBLE + "</text>";
    arm.forEach(function (a, i) {
      var A = ACC[a[1]];
      s += '<text class="acc arm" x="' + ((clef ? 46 : 14) + i * 11 + 6) + '" y="' + (Y(a[0]) + A[2]) + '" font-size="' + A[1] + '" text-anchor="middle">' + A[0] + "</text>";
    });
    if (o.time) {
      var tx = (clef ? 50 : 18) + aw + 9, parts = o.time.split("/");
      s += '<text class="tsig" x="' + tx + '" y="58" text-anchor="middle">' + parts[0] + '</text><text class="tsig" x="' + tx + '" y="78" text-anchor="middle">' + parts[1] + "</text>";
    }
    var rit = o.ritornello || {};
    if (rit.inizio) {
      var rx = startX - 4;
      s += '<rect class="bar-fine" x="' + (rx - 9) + '" y="40" width="3.5" height="40"/><line class="bar" x1="' + (rx - 3) + '" x2="' + (rx - 3) + '" y1="40" y2="80"/>' +
        '<circle class="rit-p" cx="' + (rx + 2) + '" cy="55" r="2"/><circle class="rit-p" cx="' + (rx + 2) + '" cy="65" r="2"/>';
    }
    if (rit.fine) {
      s += '<circle class="rit-p" cx="' + (W - 15) + '" cy="55" r="2"/><circle class="rit-p" cx="' + (W - 15) + '" cy="65" r="2"/>' +
        '<line class="bar" x1="' + (W - 10) + '" x2="' + (W - 10) + '" y1="40" y2="80"/><rect class="bar-fine" x="' + (W - 6.5) + '" y="40" width="3.5" height="40"/>';
    }
    (o.bars || []).forEach(function (i) {
      var bx = startX + (i + 1) * gap;
      s += '<line class="bar" x1="' + bx + '" x2="' + bx + '" y1="40" y2="80"/>';
    });
    if (o.fine && !rit.fine) s += '<line class="bar" x1="' + (W - 9) + '" x2="' + (W - 9) + '" y1="40" y2="80"/><rect class="bar-fine" x="' + (W - 6) + '" y="40" width="3.5" height="40"/>';
    notes.forEach(function (n, idx) {
      var x = startX + idx * gap + gap / 2, v = n.v == null ? 2 : n.v;
      var d = n.d == null ? 34 : n.d, y = Y(d);
      var playable = o.play !== false && !n.rest;
      var dur = (n.v == null ? 1 : LN.VALUES[v].beats * LN.BEAT) * (n.punto ? 1.5 : 1);
      s += '<g class="n' + (n.cls ? " " + n.cls : "") + '"' + (playable ? ' data-midi="' + LN.midiAcc(d, n.suona != null ? n.suona : n.acc) + '" data-dur="' + dur + '" tabindex="0" role="button" aria-label="Ascolta"' : "") + ">";
      s += '<rect class="hit" x="' + (x - gap / 2) + '" y="0" width="' + gap + '" height="' + H + '"/>';
      if (n.rest) {
        if (v === 0) s += '<rect class="rs" x="' + (x - 6) + '" y="50" width="12" height="5"/>';
        else if (v === 1) s += '<rect class="rs" x="' + (x - 6) + '" y="55" width="12" height="5"/>';
        else s += '<text class="rest" x="' + x + '" y="80" font-size="40" text-anchor="middle">' + REST[v] + "</text>";
      } else {
        var L;
        if (d < bottomD) for (L = bottomD - 2; L >= d; L -= 2) s += '<line class="lg" x1="' + (x - 10) + '" x2="' + (x + 10) + '" y1="' + Y(L) + '" y2="' + Y(L) + '"/>';
        if (d > bottomD + 8) for (L = bottomD + 10; L <= d; L += 2) s += '<line class="lg" x1="' + (x - 10) + '" x2="' + (x + 10) + '" y1="' + Y(L) + '" y2="' + Y(L) + '"/>';
        var A = ACC[n.acc];
        if (A) s += '<text class="acc" x="' + (x - 14) + '" y="' + (y + A[2]) + '" font-size="' + A[1] + '" text-anchor="middle">' + A[0] + "</text>";
        // punto di valore: a destra della testa; se la nota è su una riga, nello spazio sopra
        if (n.punto) s += '<circle class="punto" cx="' + (x + 10) + '" cy="' + (y - ((d - bottomD) % 2 === 0 ? 5 : 0)) + '" r="1.9"/>';
        if (v === 0) s += '<ellipse class="hdo" cx="' + x + '" cy="' + y + '" rx="6.6" ry="4.2" stroke-width="2.3"/>';
        else if (v === 1) s += '<ellipse class="hdo" cx="' + x + '" cy="' + y + '" rx="5.6" ry="3.7" stroke-width="1.6" transform="rotate(-20 ' + x + " " + y + ')"/>';
        else s += '<ellipse class="hd" cx="' + x + '" cy="' + y + '" rx="6" ry="4.3" transform="rotate(-20 ' + x + " " + y + ')"/>';
        if (v >= 1 && o.stems !== false) {
          var len = 34 + Math.max(0, v - 4) * 7, k;
          if (d < bottomD + 4) {
            var ux = x + 5.5;
            s += '<line class="stm" x1="' + ux + '" x2="' + ux + '" y1="' + (y - 1) + '" y2="' + (y - len) + '"/>';
            for (k = 0; k < v - 2; k++) s += flag(ux, y - len + k * 7, 1);
          } else {
            var dx = x - 5.5;
            s += '<line class="stm" x1="' + dx + '" x2="' + dx + '" y1="' + (y + 1) + '" y2="' + (y + len) + '"/>';
            for (k = 0; k < v - 2; k++) s += flag(dx, y + len - k * 7, -1);
          }
        }
      }
      if (n.corona) {
        // sopra il rigo, oppure sopra il gambo se la nota è alta o ha il gambo in su
        var cy = Math.max(12, Math.min(32, v >= 1 && !n.rest && d < bottomD + 4 ? y - 42 : y - 10));
        s += '<path class="corona" d="M' + (x - 8) + " " + cy + " A8 7.5 0 0 1 " + (x + 8) + " " + cy + '"/><circle class="punto" cx="' + x + '" cy="' + (cy - 2.6) + '" r="1.7"/>';
      }
      if (n.label != null) {
        s += '<text class="lbl lbl-name" x="' + x + '" y="' + (H - 5) + '">' + n.label + "</text>";
        s += '<text class="lbl lbl-q" x="' + x + '" y="' + (H - 5) + '">?</text>';
      }
      s += "</g>";
    });
    // legature: arco dalla parte opposta ai gambi, tra le teste delle due note
    (o.legature || []).forEach(function (L) {
      var a = notes[L[0]], b = notes[L[1]];
      var xa = startX + L[0] * gap + gap / 2 + 4, xb = startX + L[1] * gap + gap / 2 - 4;
      var ya = Y(a.d == null ? 34 : a.d), yb = Y(b.d == null ? 34 : b.d), sotto = (a.d + b.d) / 2 < bottomD + 4;
      var k = sotto ? 1 : -1, y1 = ya + 7 * k, y2 = yb + 7 * k, cx = (xa + xb) / 2, cyc = (y1 + y2) / 2 + Math.min(14, 6 + (xb - xa) / 10) * k;
      s += '<path class="leg" d="M' + xa + " " + y1 + " Q" + cx + " " + cyc + " " + xb + " " + y2 + " Q" + cx + " " + (cyc - 2.2 * k) + " " + xa + " " + y1 + 'Z"/>';
    });
    // respiri: virgola sopra il rigo, tra una nota e la successiva
    (o.respiri || []).forEach(function (i) {
      var bx = startX + (i + 1) * gap;
      s += '<text class="respiro" x="' + bx + '" y="31" text-anchor="middle">,</text>';
    });
    return s + "</svg>";
  };
})(window.LN);
