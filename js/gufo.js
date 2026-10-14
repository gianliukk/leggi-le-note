/* Il prof. Marano: gufo musicista con occhiali, papillon e clarinetto.
   Espressioni: "ciao", "felice", "festa", "pensa", "incoraggia". */
window.LN = window.LN || {};
(function (LN) {
  "use strict";
  var C = {
    body: "#2B7A78", shade: "#1D5A58", face: "#EAF4F1", belly: "#F7D893", bellyLine: "#DDB054",
    beak: "#F29F17", ink: "#17213B", tie: "#D9483B", tieKnot: "#A93429", clar: "#1E1E27",
    clarTop: "#34343F", key: "#C9CFDA", cheek: "#F39A8B", white: "#FFFFFF"
  };

  function eyes(expr) {
    var s = "";
    [72, 128].forEach(function (cx, i) {
      if (expr === "felice" || expr === "festa") {
        s += '<path d="M' + (cx - 14) + " 99 Q" + cx + " 82 " + (cx + 14) + ' 99" stroke="' + C.ink + '" stroke-width="5" fill="none" stroke-linecap="round"/>';
      } else {
        var px = expr === "pensa" ? 5 : 0, py = expr === "pensa" ? -5 : expr === "incoraggia" ? 3 : 0;
        s += '<circle cx="' + cx + '" cy="94" r="19" fill="' + C.white + '"/>';
        s += '<circle cx="' + (cx + px) + '" cy="' + (94 + py) + '" r="9.5" fill="' + C.ink + '"/>';
        s += '<circle cx="' + (cx + px + 3) + '" cy="' + (90 + py) + '" r="3.3" fill="' + C.white + '"/>';
      }
      // occhiali
      s += '<circle cx="' + cx + '" cy="94" r="24" fill="none" stroke="' + C.ink + '" stroke-width="3.5"/>';
      // sopracciglia
      if (expr === "incoraggia") {
        s += i === 0
          ? '<path d="M54 66 L86 58" stroke="' + C.ink + '" stroke-width="4.5" stroke-linecap="round"/>'
          : '<path d="M114 58 L146 66" stroke="' + C.ink + '" stroke-width="4.5" stroke-linecap="round"/>';
      }
      if (expr === "pensa") {
        s += i === 0
          ? '<path d="M56 64 L86 64" stroke="' + C.ink + '" stroke-width="4.5" stroke-linecap="round"/>'
          : '<path d="M112 62 Q128 48 146 58" stroke="' + C.ink + '" stroke-width="4.5" fill="none" stroke-linecap="round"/>';
      }
    });
    s += '<path d="M96 91 Q100 86 104 91" stroke="' + C.ink + '" stroke-width="3.5" fill="none"/>';
    return s;
  }

  function clarinet() {
    var s = '<g transform="rotate(16 165 140)">';
    s += '<rect x="160" y="56" width="9" height="16" rx="3" fill="' + C.clarTop + '"/>';
    s += '<rect x="159" y="70" width="11" height="128" rx="3" fill="' + C.clar + '"/>';
    s += '<path d="M157 194 L172 194 L182 218 L147 218 Z" fill="' + C.clar + '"/>';
    [88, 128, 168].forEach(function (y) { s += '<rect x="158" y="' + y + '" width="13" height="3" rx="1" fill="' + C.key + '"/>'; });
    [100, 112, 142, 154, 180].forEach(function (y) { s += '<circle cx="164.5" cy="' + y + '" r="2.6" fill="' + C.key + '"/>'; });
    return s + "</g>";
  }

  LN.gufo = function (expr, cls) {
    expr = expr || "ciao";
    var festa = expr === "festa";
    var s = '<svg class="gufo' + (cls ? " " + cls : "") + '" viewBox="0 0 200 232" role="img" aria-label="Il prof. Marano, gufo musicista">';
    // ciuffi
    s += '<path d="M50 56 L40 12 L82 42 Z" fill="' + C.body + '"/><path d="M150 56 L160 12 L118 42 Z" fill="' + C.body + '"/>';
    // corpo e pancia
    s += '<ellipse cx="100" cy="130" rx="74" ry="88" fill="' + C.body + '"/>';
    s += '<ellipse cx="100" cy="160" rx="48" ry="54" fill="' + C.belly + '"/>';
    [[86, 162], [114, 162], [100, 178], [86, 194], [114, 194]].forEach(function (p) {
      s += '<path d="M' + (p[0] - 8) + " " + p[1] + " q8 8 16 0" + '" stroke="' + C.bellyLine + '" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
    });
    // ala sinistra
    s += festa
      ? '<path d="M34 116 Q0 82 16 44 Q42 84 50 112 Z" fill="' + C.shade + '"/>'
      : '<path d="M30 118 Q14 166 46 202 Q54 160 46 120 Z" fill="' + C.shade + '"/>';
    // clarinetto e ala destra che lo tiene
    if (!festa) s += clarinet();
    s += festa
      ? '<path d="M166 116 Q200 82 184 44 Q158 84 150 112 Z" fill="' + C.shade + '"/>'
      : '<path d="M170 118 Q186 166 154 202 Q146 160 154 120 Z" fill="' + C.shade + '"/>';
    // muso
    s += '<circle cx="72" cy="94" r="31" fill="' + C.face + '"/><circle cx="128" cy="94" r="31" fill="' + C.face + '"/>';
    s += eyes(expr);
    if (expr === "felice" || festa) s += '<circle cx="50" cy="118" r="7" fill="' + C.cheek + '" opacity="0.65"/><circle cx="150" cy="118" r="7" fill="' + C.cheek + '" opacity="0.65"/>';
    // becco
    s += festa
      ? '<path d="M91 110 L109 110 L100 121 Z" fill="' + C.beak + '"/><path d="M94 124 L106 124 L100 132 Z" fill="' + C.beak + '"/>'
      : '<path d="M91 111 L109 111 L100 128 Z" fill="' + C.beak + '"/>';
    // papillon
    s += '<path d="M100 145 L79 134 L79 156 Z" fill="' + C.tie + '"/><path d="M100 145 L121 134 L121 156 Z" fill="' + C.tie + '"/><circle cx="100" cy="145" r="5.5" fill="' + C.tieKnot + '"/>';
    // zampe
    s += '<ellipse cx="80" cy="218" rx="11" ry="5.5" fill="' + C.beak + '"/><ellipse cx="120" cy="218" rx="11" ry="5.5" fill="' + C.beak + '"/>';
    if (festa) {
      s += '<text x="6" y="40" font-size="30" fill="' + C.beak + '" font-family="Noto Music, serif">♪</text>';
      s += '<text x="170" y="30" font-size="30" fill="' + C.tie + '" font-family="Noto Music, serif">♫</text>';
      s += '<rect x="24" y="8" width="6" height="6" fill="' + C.tie + '" transform="rotate(20 27 11)"/><rect x="176" y="62" width="6" height="6" fill="' + C.body + '" transform="rotate(35 179 65)"/><rect x="186" y="10" width="5" height="5" fill="' + C.beak + '"/>';
    }
    return s + "</svg>";
  };

  LN.FRASI = {
    ok: ["Esatto!", "Perfetto!", "Ben fatto!", "Così si legge!", "Ottimo!", "Giusto!"],
    bad: ["Quasi! Guarda bene:", "Niente paura, capita:", "Riprova alla prossima:"]
  };
})(window.LN);
