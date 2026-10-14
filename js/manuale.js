/* Il manuale dei piccoli musicisti: teoria musicale di base per giovani clarinettisti. */
(function (LN) {
  "use strict";
  var IT = LN.IT, V = LN.VALUES;
  function nm(d) { return IT[d % 7]; }
  function named(ds, hl) { return ds.map(function (d) { return { d: d, label: nm(d), cls: hl && hl.indexOf(d) > -1 ? "hl" : "" }; }); }
  function fig(o, caption, attrs) { return '<figure class="fig"' + (attrs || "") + ">" + LN.staffSVG(o) + "<figcaption>" + caption + "</figcaption></figure>"; }
  function tip(t) { return '<p class="tip">' + t + "</p>"; }
  function owlSays(expr, t) { return '<div class="owl-note"><div class="owl-mini">' + LN.gufo(expr) + '</div><p>' + t + "</p></div>"; }

  function valueTable(rest) {
    var rows = V.map(function (X, v) {
      return '<tr><td class="mini">' + LN.staffSVG({ clef: null, notes: [{ d: 32, v: v, rest: rest }], gap: 44, startX: 6, scale: 1, crop: true }) + "</td>" +
        "<td><strong>" + (rest ? "Pausa di " + X.name.toLowerCase() : X.name) + '</strong></td><td class="frac">' + X.frac + "</td><td>" + X.per + "</td></tr>";
    }).join("");
    return '<div class="tbl-wrap"><table class="vtable"><thead><tr><th>Figura</th><th>Nome</th><th>Valore</th><th>Quante in una semibreve</th></tr></thead><tbody>' + rows + "</tbody></table></div>";
  }

  /* Albero dei valori: ogni riga dura quanto una semibreve. */
  function albero() {
    var righe = [[0, 1], [1, 2], [2, 4], [3, 8]];
    return '<div class="albero">' + righe.map(function (r) {
      var notes = []; for (var i = 0; i < r[1]; i++) notes.push({ d: 32, v: r[0] });
      return '<div class="alb-row"><span class="alb-lbl">' + r[1] + " " + (r[1] === 1 ? V[r[0]].name.toLowerCase() : plurale(r[0])) + '</span><div class="alb-staff">' +
        LN.staffSVG({ clef: null, notes: notes, gap: 300 / r[1], startX: 4, width: 312, scale: 1.25, crop: true }) + "</div></div>";
    }).join("") + "</div>";
  }
  function plurale(v) { return ["semibrevi", "minime", "semiminime", "crome", "semicrome", "biscrome"][v]; }

  /* Schema delle dita: [pollice, sinistra 1-2-3, destra 1-2-3]; pieno = foro chiuso. */
  function dita(chiusi, nome) {
    var s = '<svg class="dita" viewBox="0 0 96 200" role="img" aria-label="Diteggiatura del ' + nome + '">';
    s += '<rect x="34" y="6" width="22" height="188" rx="8" class="dita-corpo"/>';
    s += '<circle cx="14" cy="26" r="8.5" class="' + (chiusi[0] ? "foro chiuso" : "foro") + '"/><text x="14" y="48" class="dita-lbl" text-anchor="middle">P</text>';
    [30, 56, 82].forEach(function (y, i) { s += '<circle cx="45" cy="' + y + '" r="9.5" class="' + (chiusi[1 + i] ? "foro chiuso" : "foro") + '"/>'; });
    s += '<line x1="30" x2="60" y1="102" y2="102" class="dita-sep"/>';
    [122, 148, 174].forEach(function (y, i) { s += '<circle cx="45" cy="' + y + '" r="9.5" class="' + (chiusi[4 + i] ? "foro chiuso" : "foro") + '"/>'; });
    s += '<text x="66" y="60" class="dita-lbl">sin.</text><text x="66" y="152" class="dita-lbl">des.</text>';
    return s + "</svg>";
  }

  function clarinetto() {
    var s = '<svg class="clar-svg" viewBox="0 0 640 150" role="img" aria-label="Le parti del clarinetto">';
    s += '<path d="M14 66 L74 60 L74 80 L14 74 Z" class="cl-legno"/>';
    s += '<rect x="18" y="74" width="50" height="4" class="cl-ancia"/>';
    s += '<rect x="44" y="57" width="16" height="26" rx="3" class="cl-metallo"/>';
    s += '<rect x="76" y="57" width="52" height="26" rx="6" class="cl-legno"/>';
    s += '<rect x="130" y="60" width="200" height="20" rx="4" class="cl-legno"/>';
    s += '<rect x="332" y="60" width="180" height="20" rx="4" class="cl-legno"/>';
    s += '<path d="M514 60 L560 58 Q600 44 628 34 L628 106 Q600 96 560 82 L514 80 Z" class="cl-legno"/>';
    [170, 200, 230, 290, 380, 410, 440].forEach(function (x) { s += '<circle cx="' + x + '" cy="70" r="5" class="cl-metallo"/>'; });
    [150, 260, 360, 470].forEach(function (x) { s += '<rect x="' + x + '" y="56" width="22" height="4" rx="2" class="cl-metallo"/>'; });
    var lbl = [[40, 30, "bocchino"], [100, 30, "barilotto"], [230, 30, "corpo superiore"], [422, 30, "corpo inferiore"], [585, 22, "campana"], [44, 120, "ancia e legatura"]];
    lbl.forEach(function (l) {
      var up = l[1] < 60;
      s += '<line x1="' + l[0] + '" x2="' + l[0] + '" y1="' + (up ? l[1] + 6 : 84) + '" y2="' + (up ? 56 : l[1] - 14) + '" class="cl-lead"/>';
      var tx = l[2] === "ancia e legatura" ? 10 : l[0], anchor = l[2] === "ancia e legatura" ? "start" : "middle";
      s += '<text x="' + tx + '" y="' + l[1] + '" class="cl-lbl" text-anchor="' + anchor + '">' + l[2] + "</text>";
    });
    return s + "</svg>";
  }

  var PRIME = [
    { d: 32, nome: "Sol", dita: [0, 0, 0, 0, 0, 0, 0], come: "Nessun foro chiuso: è il «Sol vuoto»." },
    { d: 31, nome: "Fa", dita: [1, 0, 0, 0, 0, 0, 0], come: "Chiudi solo il foro del pollice sinistro." },
    { d: 30, nome: "Mi", dita: [1, 1, 0, 0, 0, 0, 0], come: "Pollice e primo dito della mano sinistra." },
    { d: 29, nome: "Re", dita: [1, 1, 1, 0, 0, 0, 0], come: "Pollice, primo e secondo dito della mano sinistra." },
    { d: 28, nome: "Do", dita: [1, 1, 1, 1, 0, 0, 0], come: "Pollice e tutte e tre le dita della mano sinistra." }
  ];

  var ES_NOTE = [32, 35, 30, 33, 37, 31, 34, 28];

  var CAPITOLI = [
    { id: "suono", t: "Il suono", body: [
      "<p>La musica è fatta di <strong>suoni</strong> e di <strong>silenzi</strong>. Ogni suono ha quattro caratteristiche:</p>",
      '<ul class="lista"><li><strong>altezza</strong>: un suono può essere acuto, come il cinguettio di un uccellino, o grave, come il brontolio di un tuono;</li>' +
      "<li><strong>durata</strong>: un suono può essere lungo o breve;</li>" +
      "<li><strong>intensità</strong>: un suono può essere forte o piano;</li>" +
      "<li><strong>timbro</strong>: è la «voce» di ogni strumento, quella che ci fa riconoscere un clarinetto da una tromba anche a occhi chiusi.</li></ul>",
      "<p>Quando scriviamo la musica indichiamo soprattutto l'<strong>altezza</strong>, con la posizione della nota sul pentagramma, e la <strong>durata</strong>, con la forma della nota. In questo manuale impari a leggerle entrambe.</p>"
    ] },
    { id: "pentagramma", t: "Il pentagramma", body: [
      "<p>La musica si scrive sul <strong>pentagramma</strong>: cinque righe orizzontali, parallele ed equidistanti, che racchiudono quattro spazi.</p>",
      "<p>Righe e spazi si contano sempre <strong>dal basso verso l'alto</strong>: la prima riga è quella più in basso.</p>",
      fig({ clef: null, play: false, stems: false, notes: [30, 32, 34, 36, 38].map(function (d, i) { return { d: d, label: (i + 1) + "ª riga" }; }), gap: 50 }, "Le cinque righe, contate dal basso"),
      fig({ clef: null, play: false, stems: false, notes: [31, 33, 35, 37].map(function (d, i) { return { d: d, label: (i + 1) + "° spazio" }; }), gap: 50 }, "I quattro spazi"),
      "<p>Una nota può stare <strong>su una riga</strong>, quando la riga attraversa la testa della nota, oppure <strong>in uno spazio</strong>, quando la testa è compresa tra due righe. Più la nota è in alto, più il suono è acuto.</p>"
    ] },
    { id: "chiave", t: "La chiave di violino", body: [
      "<p>All'inizio del pentagramma si trova la <strong>chiave</strong>, il simbolo che dà il nome alle note.</p>",
      "<p>La <strong>chiave di violino</strong> si chiama anche <strong>chiave di Sol</strong>: il suo ricciolo si avvolge attorno alla <strong>seconda riga</strong>, che diventa la riga del Sol.</p>",
      fig({ notes: named([32], [32]), gap: 44 }, "La seconda riga è il Sol: tocca la nota per ascoltarla"),
      owlSays("ciao", "La musica per clarinetto si scrive proprio in chiave di violino. È la chiave che userai sempre!")
    ] },
    { id: "note", t: "Le note", body: [
      "<p>I nomi delle note sono sette e si ripetono sempre nello stesso ordine: <strong>Do, Re, Mi, Fa, Sol, La, Si</strong>. Dopo il Si si ricomincia da un nuovo Do, più acuto. Questa successione si chiama <strong>scala</strong>.</p>",
      fig({ notes: named(LN.range(28, 35)), gap: 30 }, "La scala di Do: ogni nota sale di un gradino"),
      "<p>Ogni nota sale di un gradino rispetto alla precedente: da una riga allo spazio immediatamente sopra, da uno spazio alla riga successiva.</p>",
      "<h3>Le note sulle righe</h3>",
      fig({ notes: named([30, 32, 34, 36, 38]), gap: 34 }, "Dal basso: Mi, Sol, Si, Re, Fa"),
      "<h3>Le note negli spazi</h3>",
      fig({ notes: named([31, 33, 35, 37]), gap: 34 }, "Dal basso: Fa, La, Do, Mi"),
      tip("Un trucco: se riconosci con sicurezza una nota, puoi trovare tutte le altre contando i gradini verso l'alto o verso il basso.")
    ] },
    { id: "tagli", t: "I tagli addizionali", body: [
      "<p>Quando una nota è troppo grave o troppo acuta per stare nel pentagramma, si aggiungono brevi righe chiamate <strong>tagli addizionali</strong>, che prolungano il rigo verso il basso o verso l'alto.</p>",
      fig({ notes: named([26, 27, 28, 29], [28]), gap: 34 }, "Sotto il pentagramma: il Do sta sul primo taglio, il La sul secondo"),
      "<p>Il Do sul primo taglio sotto il pentagramma si chiama <strong>Do centrale</strong>, perché si trova a metà della tastiera del pianoforte.</p>",
      fig({ notes: named([39, 40, 41, 42]), gap: 34 }, "Sopra il pentagramma: il La sta sul primo taglio, il Do sul secondo")
    ] },
    { id: "figure", t: "Le figure e i valori", body: [
      "<p>La forma della nota indica <strong>quanto dura</strong> il suono. Ogni forma si chiama <strong>figura</strong> e ha un <strong>valore</strong>, che misuriamo in quarti.</p>",
      valueTable(false),
      "<p>Ogni figura vale <strong>la metà</strong> della precedente. La semibreve e la minima hanno la testa vuota; la semiminima ha la testa piena; dalla croma in poi si aggiunge una <strong>codetta</strong> per ogni dimezzamento.</p>",
      "<h3>L'albero dei valori</h3><p>Ogni riga dura esattamente quanto una semibreve:</p>",
      albero(),
      tip("Tocca le figure nella tabella: il clarinetto tiene il suono per la durata giusta.")
    ] },
    { id: "pause", t: "Le pause", body: [
      "<p>La <strong>pausa</strong> indica un silenzio. Ogni figura ha la sua pausa, che dura esattamente quanto lei.</p>",
      valueTable(true),
      "<p>Attenzione alle prime due, che si somigliano: la pausa di semibreve è un rettangolino <strong>appeso</strong> sotto la quarta riga, la pausa di minima è <strong>appoggiata</strong> sopra la terza riga.</p>",
      owlSays("pensa", "Un trucco per ricordarle: la semibreve è più «pesante», per questo pende verso il basso!")
    ] },
    { id: "battuta", t: "La battuta e il tempo", body: [
      "<p>La musica si divide in <strong>battute</strong>, dette anche <strong>misure</strong>, separate da linee verticali chiamate <strong>stanghette</strong>. Alla fine del brano si trova la <strong>doppia stanghetta</strong>.</p>",
      "<p>Dopo la chiave si scrive il <strong>tempo</strong>, con due numeri uno sopra l'altro. Nel tempo <strong>4/4</strong> il numero in basso indica che l'unità di misura è il quarto, cioè la semiminima; il numero in alto indica che in ogni battuta ci sono <strong>quattro quarti</strong>.</p>",
      fig({ time: "4/4", notes: [
        { d: 32, v: 0, label: "1 2 3 4" },
        { d: 30, v: 1, label: "1 2" }, { d: 32, v: 1, label: "3 4" },
        { d: 30, v: 2, label: "1" }, { d: 31, v: 2, label: "2" }, { d: 32, v: 2, label: "3" }, { d: 33, v: 2, label: "4" },
        { d: 32, v: 1, label: "1 2" }, { d: 32, v: 2, label: "3" }, { d: 32, v: 2, rest: true, label: "4" }
      ], gap: 40, bars: [0, 2, 6], fine: true }, "Quattro battute in 4/4: sotto ogni figura, i quarti da contare"),
      "<p>In ogni battuta la somma dei valori deve fare 4/4: una semibreve, oppure due minime, oppure quattro semiminime, oppure una minima, una semiminima e una pausa di semiminima.</p>",
      tip("Prova a battere le mani contando ad alta voce «uno, due, tre, quattro», con un battito per ogni quarto.")
    ] },
    { id: "alterazioni", t: "Diesis, bemolle e bequadro", body: [
      "<p>Le <strong>alterazioni</strong> si scrivono davanti alla nota e ne cambiano l'altezza di un <strong>semitono</strong>, la distanza più piccola tra due suoni vicini.</p>",
      '<ul class="lista"><li><span class="sym">♯</span> <strong>diesis</strong>: alza la nota di un semitono;</li>' +
      '<li><span class="sym">♭</span> <strong>bemolle</strong>: abbassa la nota di un semitono;</li>' +
      '<li><span class="sym">♮</span> <strong>bequadro</strong>: annulla l\'alterazione e riporta la nota al suono naturale.</li></ul>',
      "<p>Un'alterazione scritta accanto a una nota vale per tutta la battuta. Le alterazioni scritte subito dopo la chiave, all'inizio di ogni rigo, si chiamano <strong>alterazioni in chiave</strong> e valgono per tutto il brano.</p>"
    ] },
    { id: "clarinetto", t: "Il clarinetto", body: [
      "<p>Il clarinetto è uno strumento a fiato della famiglia dei <strong>legni</strong>. Il suono nasce dall'<strong>ancia</strong>, una sottile lamella di canna che vibra contro il bocchino quando soffi.</p>",
      '<figure class="fig clar-fig">' + clarinetto() + "<figcaption>Le parti del clarinetto</figcaption></figure>",
      '<ul class="lista"><li><strong>bocchino</strong>: è la parte che si mette in bocca; l\'<strong>ancia</strong> vi è fissata con la <strong>legatura</strong>;</li>' +
      "<li><strong>barilotto</strong>: collega il bocchino al corpo e serve anche ad accordare lo strumento;</li>" +
      "<li><strong>corpo superiore</strong>: lo suona la mano sinistra;</li>" +
      "<li><strong>corpo inferiore</strong>: lo suona la mano destra, con il pollice appoggiato sotto il reggipollice;</li>" +
      "<li><strong>campana</strong>: la parte finale, svasata, da cui esce il suono.</li></ul>",
      "<h3>Il clarinetto in Si bemolle</h3>",
      "<p>Il clarinetto più diffuso è in <strong>Si bemolle</strong>: quando leggi e suoni un Do, si sente un Si bemolle, un tono più in basso. Per questo si dice che il clarinetto è uno strumento <strong>traspositore</strong>.</p>",
      owlSays("felice", "Niente calcoli: tu leggi le note esattamente come le hai imparate in questo manuale. Pensano i compositori a scrivere la parte già trasportata per te.")
    ] },
    { id: "prima", t: "Prima di suonare", body: [
      "<h3>Montare lo strumento</h3>",
      '<ol class="lista"><li>Unisci la <strong>campana</strong> al corpo inferiore, con un leggero movimento a vite.</li>' +
      "<li>Unisci il <strong>corpo superiore</strong> a quello inferiore. Premi gli anelli del corpo superiore: così la chiave che collega le due parti, detta ponte, si solleva e non si piega.</li>" +
      "<li>Aggiungi il <strong>barilotto</strong> e poi il <strong>bocchino</strong>.</li>" +
      "<li>Inumidisci l'<strong>ancia</strong>, appoggiala sulla parte piatta del bocchino con la punta allineata alla punta del bocchino e fissala con la legatura, senza stringere troppo.</li></ol>",
      "<h3>La postura</h3>",
      "<p>Siediti sul bordo della sedia con la schiena dritta e i piedi ben appoggiati a terra. La mano <strong>sinistra</strong> sta in alto, la mano <strong>destra</strong> in basso. Tieni le spalle rilassate e il clarinetto leggermente inclinato in avanti, con la campana lontana dal corpo.</p>",
      "<h3>Il respiro</h3>",
      "<p>Prendi aria dalla bocca e senti la <strong>pancia</strong> che si gonfia, mentre le spalle restano ferme. Poi soffia con un getto d'aria costante, come se volessi far ondeggiare a lungo la fiamma di una candela senza spegnerla.</p>",
      "<h3>L'imboccatura</h3>",
      '<ul class="lista"><li>il labbro inferiore copre leggermente i denti inferiori, e l\'ancia si appoggia su di esso;</li>' +
      "<li>i denti superiori si appoggiano sopra il bocchino;</li>" +
      "<li>gli angoli della bocca stanno fermi e chiusi attorno al bocchino, perché l'aria non esca dai lati;</li>" +
      "<li>il mento resta disteso, non arricciato.</li></ul>",
      owlSays("incoraggia", "I primi suoni possono uscire stridenti: è normalissimo! Segui sempre i consigli del tuo insegnante e fai pause frequenti.")
    ] },
    { id: "prime-note", t: "Le prime cinque note", body: [
      "<p>Ecco le prime note da suonare: <strong>Sol, Fa, Mi, Re, Do</strong>. Si suonano tutte con la mano sinistra. Nello schema i cerchi <strong>pieni</strong> sono i fori da chiudere; «P» è il foro del pollice, sul retro dello strumento.</p>",
      '<div class="prime">' + PRIME.map(function (p) {
        return '<div class="prima-nota"><div class="pn-staff" data-trasporta="sib">' + LN.staffSVG({ notes: [{ d: p.d, label: p.nome }], gap: 40, scale: 1.2, startX: 46 }) + "</div>" +
          dita(p.dita, p.nome) + "<p>" + p.come + "</p></div>";
      }).join("") + "</div>",
      tip("Tocca le note: senti il loro suono reale al clarinetto in Si bemolle, un tono più in basso di come sono scritte."),
      "<p><strong>Esercizio:</strong> suona lentamente Sol, Fa, Mi, Re, Do, tenendo ogni nota per quattro quarti, come una semibreve. Poi risali: Do, Re, Mi, Fa, Sol.</p>"
    ] },
    { id: "esercizi", t: "Esercizi", body: [
      "<h3>1. Scrivi il nome delle note</h3>",
      fig({ notes: ES_NOTE.map(function (d, i) { return { d: d, label: String(i + 1) }; }), gap: 34, play: false }, "Scrivi su un foglio il nome di ogni nota, da 1 a 8"),
      "<h3>2. Quanto valgono?</h3>",
      '<ol class="lista"><li>Quante semiminime ci sono in una semibreve?</li><li>Quante crome ci sono in una minima?</li>' +
      "<li>Quanto valgono insieme una minima e una semiminima?</li><li>Quante semicrome ci sono in una semiminima?</li>" +
      "<li>Quale pausa dura quanto una minima? Dove si scrive sul pentagramma?</li></ol>",
      "<h3>3. Completa la battuta in 4/4</h3>",
      "<p>In una battuta ci sono già una minima e una semiminima. Quale figura manca per arrivare a 4/4?</p>",
      '<details class="sol"><summary>Soluzioni</summary>' +
      "<p><strong>1.</strong> " + ES_NOTE.map(function (d, i) { return (i + 1) + " " + nm(d); }).join(", ") + ".</p>" +
      "<p><strong>2.</strong> 4 semiminime; 4 crome; 3/4; 4 semicrome; la pausa di minima, appoggiata sopra la terza riga.</p>" +
      "<p><strong>3.</strong> Una semiminima, oppure una pausa di semiminima.</p></details>"
    ] },
    { id: "glossario", t: "Piccolo glossario", body: [
      '<dl class="gloss">' + [
        ["Alterazione", "segno (diesis, bemolle, bequadro) che cambia l'altezza di una nota di un semitono."],
        ["Battuta", "ciascuna delle parti, separate da stanghette, in cui si divide un brano; detta anche misura."],
        ["Chiave", "simbolo all'inizio del pentagramma che dà il nome alle note."],
        ["Figura", "forma della nota che ne indica la durata."],
        ["Pausa", "segno che indica un silenzio di durata precisa."],
        ["Pentagramma", "insieme di cinque righe e quattro spazi su cui si scrive la musica."],
        ["Scala", "successione ordinata delle note, per esempio da un Do al Do successivo."],
        ["Semitono", "la distanza più piccola tra due suoni vicini."],
        ["Stanghetta", "linea verticale che separa due battute."],
        ["Taglio addizionale", "breve riga che prolunga il pentagramma verso l'alto o verso il basso."],
        ["Tempo", "indicazione, con due numeri, di quanti movimenti ci sono in ogni battuta e di quale figura vale un movimento."],
        ["Traspositore", "strumento il cui suono reale è diverso dalla nota scritta, come il clarinetto in Si bemolle."]
      ].map(function (g) { return "<dt>" + g[0] + "</dt><dd>" + g[1] + "</dd>"; }).join("") + "</dl>"
    ] }
  ];

  function render() {
    var html = '<section class="cover">' + LN.gufo("festa") +
      '<div><div class="eyebrow">Leggi le note</div><h1>Il manuale dei piccoli musicisti</h1>' +
      '<p class="cover-sub">Teoria musicale per giovani clarinettisti, prima di prendere in mano lo strumento</p>' +
      '<p class="cover-by">con il prof. Marano</p></div></section>';
    html += owlSays("ciao", "Ciao! Questo è il tuo manuale: leggilo un capitolo alla volta, tocca le note per ascoltarle e poi allenati sul percorso del sito. Quando avrai finito, sarai pronto per suonare le tue prime note al clarinetto.");
    html += '<nav class="indice" aria-label="Indice"><h2>Indice</h2><ol>' +
      CAPITOLI.map(function (c) { return '<li><a href="#' + c.id + '">' + c.t + "</a></li>"; }).join("") + "</ol></nav>";
    CAPITOLI.forEach(function (c, i) {
      html += '<section class="cap" id="' + c.id + '"><div class="cap-num">Capitolo ' + (i + 1) + "</div><h2>" + c.t + "</h2>" + c.body.join("") + "</section>";
    });
    html += '<section class="cap fine">' + owlSays("festa", 'Complimenti, hai finito il manuale! Ora allenati sul <a href="./">percorso Leggi le note</a> per diventare velocissimo a leggere.') + "</section>";
    document.getElementById("libro").innerHTML = html;
  }

  render();
  document.getElementById("libro").addEventListener("click", function (e) {
    var g = e.target.closest("g.n[data-midi]");
    if (!g) return;
    var sib = e.target.closest("[data-trasporta]") ? LN.suono.SIB : 0;
    LN.suono.play(+g.dataset.midi + sib, +g.dataset.dur || 1);
  });
  document.getElementById("printBtn").addEventListener("click", function () {
    document.querySelectorAll("details").forEach(function (d) { d.open = true; });
    window.print();
  });
})(window.LN);
