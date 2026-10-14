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

  /* o.notes: [{d, v, rest, label, cls}]; v = indice in LN.VALUES (assente = semiminima). */
  LN.staffSVG = function (o) {
    var clef = o.clef === undefined ? "treble" : o.clef;
    var bottomD = 30;
    var notes = o.notes || [];
    var startX = o.startX != null ? o.startX : (clef ? 50 : 18);
    var gap = o.gap || 30;
    var W = o.width || (startX + notes.length * gap + 12);
    var withLabels = notes.some(function (n) { return n.label != null; });
    var H = withLabels ? 140 : 120;
    function Y(d) { return 80 - (d - bottomD) * 5; }
    var s = '<svg class="staff" viewBox="0 ' + (o.crop ? "24 " + W + " 70" : "0 " + W + " " + H) + '" style="width:' + Math.round((o.scale || 1.6) * W) + 'px" role="img" aria-label="' + (o.aria || "Pentagramma") + '">';
    for (var i = 0; i < 5; i++) { var ly = 80 - i * 10; s += '<line class="sl" x1="2" x2="' + (W - 2) + '" y1="' + ly + '" y2="' + ly + '"/>'; }
    if (clef === "treble") s += '<text class="clef" x="6" y="' + (Y(32) + 10) + '" font-size="40">' + TREBLE + "</text>";
    notes.forEach(function (n, idx) {
      var x = startX + idx * gap + gap / 2, v = n.v == null ? 2 : n.v;
      var d = n.d == null ? 34 : n.d, y = Y(d);
      var playable = o.play !== false && !n.rest;
      var dur = n.v == null ? 1 : LN.VALUES[v].beats * LN.BEAT;
      s += '<g class="n' + (n.cls ? " " + n.cls : "") + '"' + (playable ? ' data-midi="' + LN.midiOf(d) + '" data-dur="' + dur + '" tabindex="0" role="button" aria-label="Ascolta"' : "") + ">";
      s += '<rect class="hit" x="' + (x - gap / 2) + '" y="0" width="' + gap + '" height="' + H + '"/>';
      if (n.rest) {
        if (v === 0) s += '<rect class="rs" x="' + (x - 6) + '" y="50" width="12" height="5"/>';
        else if (v === 1) s += '<rect class="rs" x="' + (x - 6) + '" y="55" width="12" height="5"/>';
        else s += '<text class="rest" x="' + x + '" y="80" font-size="40" text-anchor="middle">' + REST[v] + "</text>";
      } else {
        var L;
        if (d < bottomD) for (L = bottomD - 2; L >= d; L -= 2) s += '<line class="lg" x1="' + (x - 10) + '" x2="' + (x + 10) + '" y1="' + Y(L) + '" y2="' + Y(L) + '"/>';
        if (d > bottomD + 8) for (L = bottomD + 10; L <= d; L += 2) s += '<line class="lg" x1="' + (x - 10) + '" x2="' + (x + 10) + '" y1="' + Y(L) + '" y2="' + Y(L) + '"/>';
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
      if (n.label != null) {
        s += '<text class="lbl lbl-name" x="' + x + '" y="' + (H - 5) + '">' + n.label + "</text>";
        s += '<text class="lbl lbl-q" x="' + x + '" y="' + (H - 5) + '">?</text>';
      }
      s += "</g>";
    });
    return s + "</svg>";
  };
})(window.LN);
