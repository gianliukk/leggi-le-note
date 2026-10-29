/* Le lezioni di teoria: ogni unità del percorso ne apre una come "guida". */
window.LN = window.LN || {};
(function (LN) {
  "use strict";
  var range = LN.range;
  function nm(d) { return LN.nm(d); }
  function named(ds, hl) { return ds.map(function (d) { return { d: d, label: nm(d), cls: hl && hl.indexOf(d) > -1 ? "hl" : "" }; }); }
  function fig(o, caption) { return '<figure class="fig">' + LN.staffSVG(o) + "<figcaption>" + caption + "</figcaption></figure>"; }
  function valueTable(rest) {
    var rows = LN.VALUES.map(function (V, v) {
      return '<tr><td class="mini">' + LN.staffSVG({ clef: null, notes: [{ d: 32, v: v, rest: rest }], gap: 44, startX: 6, scale: 1, crop: true }) + "</td>" +
        "<td><strong>" + (rest ? "Pausa di " + V.name.toLowerCase() : V.name) + "</strong></td>" +
        '<td class="frac">' + V.frac + "</td><td>" + V.per + "</td></tr>";
    }).join("");
    return '<div class="tbl-wrap"><table class="vtable"><thead><tr><th>Figura</th><th>Nome</th><th>Valore</th><th>Quante in una semibreve</th></tr></thead><tbody>' + rows + "</tbody></table></div>";
  }

  /* Pulsante che fa ascoltare una sequenza [[midi, secondi], ...] e domanda con risposta da scoprire. */
  function ascolta(testo, note) { return "<button class=\"btn3d ascolta-btn\" data-seq='" + JSON.stringify(note) + "'>" + testo + "</button>"; }
  function prova(domanda, risposta) { return '<details class="prova"><summary><b>Prova tu:</b> ' + domanda + "</summary><p>" + risposta + "</p></details>"; }
  /* Disegno grande di una croma con i nomi delle parti. */
  function partiNota() {
    var k = 2.4, sx = 112, sy = 26;
    function f(x, y) { return (sx + x * k) + " " + (sy + y * k); }
    return '<svg class="parti-nota" viewBox="0 0 300 160" role="img" aria-label="Le parti della nota: testa, gambo e codetta">' +
      '<ellipse class="pn-testa" cx="98" cy="128" rx="15" ry="10.5" transform="rotate(-20 98 128)"/>' +
      '<line class="pn-gambo" x1="' + sx + '" x2="' + sx + '" y1="126" y2="' + sy + '"/>' +
      '<path class="pn-codetta" d="M' + f(0, 0) + " C" + f(1, 7) + " " + f(11, 10) + " " + f(8, 21) + " C" + f(9, 13) + " " + f(4, 10) + " " + f(0, 8) + 'Z"/>' +
      '<line class="pn-filo" x1="18" y1="140" x2="80" y2="134"/><text class="pn-nome" x="14" y="152">testa</text>' +
      '<line class="pn-filo" x1="40" y1="84" x2="108" y2="84"/><text class="pn-nome" x="14" y="80">gambo</text>' +
      '<line class="pn-filo" x1="142" y1="52" x2="210" y2="40"/><text class="pn-nome" x="214" y="44">codetta</text></svg>';
  }
  /* Tastiera da Do centrale a Mi acuto; o.t e o.s: tasti (MIDI) da colorare come tono o semitono. Si toccano per ascoltarli. */
  function tastiera(o) {
    var bianchi = [60, 62, 64, 65, 67, 69, 71, 72, 74, 76], W = 30, s = '<svg class="tastiera-lez" viewBox="0 0 ' + (bianchi.length * W + 2) + ' 112" role="img" aria-label="Tastiera del pianoforte">';
    function cl(m) { return (o.t || []).indexOf(m) > -1 ? " tk-t" : (o.s || []).indexOf(m) > -1 ? " tk-s" : ""; }
    bianchi.forEach(function (m, i) {
      s += '<g class="n tk tk-b' + cl(m) + '" data-midi="' + m + '" data-dur="0.8"><rect x="' + (1 + i * W) + '" y="1" width="' + W + '" height="110" rx="3"/>' +
        '<text x="' + (1 + i * W + W / 2) + '" y="102" text-anchor="middle">' + LN.nm(LN.IT.length * 4 + [0, 1, 2, 3, 4, 5, 6, 0, 1, 2][i]) + "</text></g>";
    });
    bianchi.forEach(function (m, i) {
      if (i < bianchi.length - 1 && bianchi[i + 1] - m === 2) s += '<g class="n tk tk-n' + cl(m + 1) + '" data-midi="' + (m + 1) + '" data-dur="0.8"><rect x="' + (1 + (i + 1) * W - 9) + '" y="1" width="18" height="68" rx="2"/></g>';
    });
    return s + "</svg>";
  }

  LN.LESSONS = [
    { t: "Il pentagramma", quiz: false, body: function () { return [
      "<p>La musica si scrive sul <strong>pentagramma</strong>: cinque righe orizzontali, parallele ed equidistanti, che racchiudono quattro spazi.</p>",
      "<p>Righe e spazi si contano sempre <strong>dal basso verso l'alto</strong>: la prima riga è quella più in basso.</p>",
      fig({ clef: null, play: false, stems: false, notes: [30, 32, 34, 36, 38].map(function (d, i) { return { d: d, label: (i + 1) + "ª" }; }) }, "Le cinque righe, contate dal basso"),
      fig({ clef: null, play: false, stems: false, notes: [31, 33, 35, 37].map(function (d, i) { return { d: d, label: (i + 1) + "°" }; }) }, "I quattro spazi"),
      "<p>Una nota può stare <strong>su una riga</strong>, quando la riga attraversa la testa della nota, oppure <strong>in uno spazio</strong>, quando la testa è compresa tra due righe. Più la nota è in alto, più il suono è acuto.</p>"
    ]; } },
    { t: "La chiave di violino", body: function () { return [
      "<p>Il pentagramma da solo non basta: serve una <strong>chiave</strong>, il simbolo posto all'inizio del rigo che stabilisce il nome delle note.</p>",
      "<p>La <strong>chiave di violino</strong> si chiama anche <strong>chiave di Sol</strong>: il suo ricciolo si avvolge attorno alla <strong>seconda riga</strong>, che diventa la riga del Sol.</p>",
      fig({ notes: named([32], [32]), gap: 40 }, "La seconda riga è il Sol: tocca la nota per ascoltarla"),
      "<p>Partendo dal Sol basta salire o scendere in ordine per trovare tutte le altre note. In chiave di violino si scrive la musica per clarinetto, flauto, violino, tromba, per la voce e per la mano destra del pianoforte.</p>"
    ]; } },
    { t: "Do, Re, Mi: le prime note", body: function () { return [
      "<p>Cominciamo da tre note vicine. Il <strong>Do</strong> si scrive sul primo <strong>taglio addizionale</strong>, una breve riga sotto il pentagramma. Il <strong>Re</strong> sta appena sotto la prima riga. Il <strong>Mi</strong> è sulla prima riga.</p>",
      fig({ notes: named([28, 29, 30]), gap: 36 }, "Do, Re, Mi: tocca ogni nota per ascoltarla al clarinetto"),
      "<p>Subito dopo arriva il <strong>Fa</strong>, nel primo spazio.</p>",
      fig({ notes: named([28, 29, 30, 31], [31]), gap: 36 }, "Il Fa sta nel primo spazio"),
      '<p class="tip">Attiva «Nascondi i nomi» e prova a dire il nome di ogni nota prima di toccarla.</p>'
    ]; } },
    { t: "La scala: dal Do al Do", body: function () { return [
      "<p>I nomi delle note sono sette e si ripetono sempre nello stesso ordine: <strong>" + range(0, 6).map(nm).join(", ") + "</strong>. Dopo il Si si ricomincia da un nuovo Do, più acuto.</p>",
      fig({ notes: named(range(28, 35)), gap: 28 }, "Dal Do al Do acuto: ogni nota sale di un gradino"),
      "<p>Sul pentagramma ogni nota sale di un gradino rispetto alla precedente: da una riga allo spazio immediatamente sopra, da uno spazio alla riga successiva. Nessun gradino viene saltato.</p>"
    ]; } },
    { t: "Righe e spazi", body: function () { return [
      "<p>Queste sono le note che si trovano sulle cinque righe, dal basso: <strong>" + [30, 32, 34, 36, 38].map(nm).join(", ") + "</strong>.</p>",
      fig({ notes: named([30, 32, 34, 36, 38]) }, "Le note sulle righe"),
      "<p>E queste sono le note dei quattro spazi: <strong>" + [31, 33, 35, 37].map(nm).join(", ") + "</strong>.</p>",
      fig({ notes: named([31, 33, 35, 37]) }, "Le note negli spazi"),
      '<p class="tip">Se riconosci una nota con sicurezza, puoi trovare tutte le altre contando i gradini verso l\'alto o verso il basso.</p>'
    ]; } },
    { t: "I tagli addizionali", body: function () { return [
      "<p>Quando una nota è troppo grave o troppo acuta per stare nel pentagramma, si aggiungono brevi righe chiamate <strong>tagli addizionali</strong>, che prolungano il rigo verso il basso o verso l'alto.</p>",
      fig({ notes: named([26, 27, 28, 29], [28]) }, "Sotto il pentagramma: il Do è sul primo taglio, il La sul secondo"),
      fig({ notes: named([39, 40, 41, 42]) }, "Sopra il pentagramma: il La è sul primo taglio, il Do sul secondo"),
      "<p>Il Do sul primo taglio sotto il pentagramma si chiama <strong>Do centrale</strong>, perché si trova a metà della tastiera del pianoforte.</p>"
    ]; } },
    { t: "Le figure musicali", body: function () { return [
      "<p>La forma della nota indica <strong>quanto dura</strong> il suono. Ogni forma si chiama <strong>figura</strong> e ha un <strong>valore</strong>, che in un tempo di 4/4 si misura in quarti.</p>",
      "<h3>Le parti della nota</h3>",
      '<figure class="fig">' + partiNota() + "<figcaption>Una croma con le sue tre parti</figcaption></figure>",
      '<ul class="lista-parti"><li><strong>Testa</strong>: l\'ovale, vuoto o pieno. La sua posizione sul pentagramma dice il nome della nota.</li>' +
        "<li><strong>Gambo</strong>: la stanghetta verticale attaccata alla testa. La semibreve non ce l'ha.</li>" +
        "<li><strong>Codetta</strong>, chiamata anche cediglia: il ricciolo in cima al gambo. Ce l'hanno la croma (una), la semicroma (due) e la biscroma (tre).</li></ul>",
      "<p>Il gambo va <strong>in su, a destra</strong> della testa, se la nota è sotto la terza riga; va <strong>in giù, a sinistra</strong>, se è sopra. Sulla terza riga di solito va in giù. Quando ci sono più crome vicine, le codette si possono sostituire con una <strong>trave</strong> che unisce i gambi.</p>",
      fig({ notes: [{ d: 29, v: 2, label: nm(29) }, { d: 33, v: 2, label: nm(33) }, { d: 34, v: 2, label: nm(34) }, { d: 37, v: 2, label: nm(37) }], gap: 46 }, "Re e La: gambo in su a destra. Si (terza riga) e Mi acuto: gambo in giù a sinistra"),
      "<h3>Le figure e il loro valore</h3>",
      valueTable(false),
      "<p>Ogni figura vale la metà della precedente: una semibreve dura quanto due minime, una minima quanto due semiminime, e così via. La semibreve e la minima hanno la testa vuota; dalla croma in poi si aggiungono le <strong>codette</strong>, una per ogni dimezzamento.</p>",
      '<p class="tip">Tocca le figure nella tabella: il clarinetto tiene il suono per la durata giusta, a 80 battiti al minuto.</p>'
    ]; } },
    { t: "Le pause", body: function () { return [
      "<p>La <strong>pausa</strong> indica un silenzio. Ogni figura ha la sua pausa, che dura esattamente quanto lei.</p>",
      valueTable(true),
      "<p>Attenzione alle prime due: la pausa di semibreve è un rettangolino <strong>appeso</strong> sotto la quarta riga, la pausa di minima è <strong>appoggiata</strong> sopra la terza riga.</p>"
    ]; } },
    { t: "Acuto e grave", body: function () { return [
      "<p>Un suono può essere <strong>acuto</strong>, cioè alto, come il canto di un uccellino, oppure <strong>grave</strong>, cioè basso, come la voce di un orso. Questa qualità del suono si chiama <strong>altezza</strong>.</p>",
      "<p>Quando ascolti due note una dopo l'altra, la seconda può <strong>salire</strong> (è più acuta), <strong>scendere</strong> (è più grave) oppure <strong>restare uguale</strong>.</p>",
      fig({ notes: named([28, 32]), gap: 48 }, "Dal Do al Sol: la melodia sale. Tocca le note per ascoltarle"),
      fig({ notes: named([33, 29]), gap: 48 }, "Dal La al Re: la melodia scende"),
      fig({ notes: named([31, 31]), gap: 48 }, "Fa e ancora Fa: la nota resta uguale"),
      "<p>Sul pentagramma succede la stessa cosa: se la seconda nota è scritta <strong>più in alto</strong>, il suono sale; se è scritta <strong>più in basso</strong>, il suono scende.</p>",
      '<p class="tip">Più le due note sono vicine, più è difficile sentire la differenza: ascolta con attenzione, anche più volte.</p>'
    ]; } },
    { t: "Il ritmo", quiz: false, body: function () {
      // Battute di esempio: [figura o pausa, indice in LN.VALUES, posizione nella coppia di crome]
      function bt(lista) {
        var pos = 0;
        return lista.map(function (x) { var e = { v: x[1], rest: x[0] === "p", b: LN.VALUES[x[1]].beats, start: pos, trave: x[2] == null ? null : x[2] }; pos += e.b; return e; });
      }
      function es(lista, caption) { return '<figure class="fig fig-ritmo">' + LN.ritmo.svg(bt(lista)) + "<figcaption>" + caption + "</figcaption></figure>"; }
      return [
        "<p>La musica ha un battito regolare, come il cuore: si chiama <strong>pulsazione</strong>. Il <strong>metronomo</strong> la fa sentire con un colpo a ogni tempo.</p>",
        "<p>Nel tempo di <strong>4/4</strong> ogni battuta contiene quattro tempi: si conta <strong>1, 2, 3, 4</strong>. La semiminima dura un tempo, la minima due, la semibreve tutti e quattro.</p>",
        es([["f", 2], ["f", 2], ["f", 2], ["f", 2]], "Quattro semiminime: un colpo su ogni tempo"),
        es([["f", 1], ["f", 2], ["f", 2]], "Una minima e due semiminime: sulla minima si batte una volta sola e si aspetta il 3"),
        "<p>Le <strong>crome</strong> sono due per ogni tempo: si conta <strong>1 e 2 e…</strong> e si batte su tutte e due.</p>",
        es([["f", 2], ["f", 3, 0], ["f", 3, 1], ["f", 2], ["f", 2]], "Sulle due crome unite si batte «2 e»"),
        "<p>Sulle <strong>pause</strong> non si batte: si conta in silenzio.</p>",
        es([["f", 2], ["p", 2], ["f", 2], ["p", 2]], "Si batte sull'1 e sul 3; sul 2 e sul 4 si conta in silenzio"),
        '<p class="tip">Negli esercizi premi <strong>Ascolta</strong> per sentire il ritmo dal clarinetto, poi <strong>Inizia</strong>: dopo quattro colpi di metronomo batti sul pulsante grande o con la barra spaziatrice.</p>'
      ];
    } },
    { t: "Il punto di valore", body: function () {
      var B = LN.BEAT;
      var righe = [["Semibreve puntata", 0, "4/4 + 2/4 = 6/4"], ["Minima puntata", 1, "2/4 + 1/4 = 3/4"], ["Semiminima puntata", 2, "1/4 + 1/8 = 3/8"], ["Croma puntata", 3, "1/8 + 1/16 = 3/16"]].map(function (r) {
        return '<tr><td class="mini">' + LN.staffSVG({ clef: null, notes: [{ d: 33, v: r[1], punto: true }], gap: 44, startX: 6, scale: 1, crop: true }) + "</td><td><strong>" + r[0] + '</strong></td><td class="frac">' + r[2] + "</td></tr>";
      }).join("");
      return [
        "<p>Il <strong>punto di valore</strong> è un puntino scritto a destra della testa della nota. Allunga la nota della <strong>metà del suo valore</strong>: si prende il valore della figura, se ne calcola la metà e la si aggiunge.</p>",
        fig({ notes: [{ d: 32, v: 1, punto: true, label: nm(32) }], gap: 50, startX: 60 }, "Minima puntata: 2/4 della minima + 1/4 (la metà di 2/4) = 3/4"),
        '<div class="tbl-wrap"><table class="vtable"><thead><tr><th>Figura</th><th>Nome</th><th>Quanto vale</th></tr></thead><tbody>' + righe + "</tbody></table></div>",
        "<p>Se la nota è <strong>su una riga</strong>, il punto si scrive nello <strong>spazio subito sopra</strong>, così si vede bene.</p>",
        fig({ notes: [{ d: 30, v: 1, punto: true, label: nm(30) }, { d: 31, v: 1, punto: true, label: nm(31) }], gap: 50 }, "Il Mi è su una riga: il punto sale nello spazio. Il Fa è in uno spazio: il punto resta lì"),
        "<p>Una coppia che incontrerai spesso è la <strong>semiminima puntata seguita da una croma</strong>: insieme valgono 3/8 + 1/8 = 4/8, cioè 2/4.</p>",
        fig({ time: "4/4", notes: [{ d: 28, v: 2, punto: true }, { d: 29, v: 3 }, { d: 30, v: 1 }], gap: 46, fine: true }, "Semiminima puntata (3/8) + croma (1/8) + minima (2/4) = 4/4"),
        ascolta("Ascolta il ritmo", [[LN.midiOf(28), 1.5 * B], [LN.midiOf(29), 0.5 * B], [LN.midiOf(30), 2 * B]]),
        prova("Quanto vale una semiminima puntata?", "3/8: 1/4 della semiminima più 1/8, che è la metà di 1/4.")
      ];
    } },
    { t: "La legatura di valore", body: function () {
      var B = LN.BEAT;
      return [
        "<p>La <strong>legatura di valore</strong> è un arco che unisce <strong>due note della stessa altezza</strong>. Si suona solo la prima e si tiene il suono per la durata di tutte e due, senza ripetere la nota.</p>",
        fig({ notes: [{ d: 32, v: 1, label: nm(32) }, { d: 32, v: 2, label: nm(32) }], legature: [[0, 1]], gap: 56, startX: 60 }, "Minima legata a una semiminima: un solo Sol lungo 2 + 1 = 3 tempi"),
        ascolta("Con la legatura", [[LN.midiOf(32), 3 * B]]) + " " + ascolta("Senza legatura", [[LN.midiOf(32), 2 * B], [LN.midiOf(32), 1 * B]]),
        "<p>Serve soprattutto quando una nota deve durare <strong>oltre la stanghetta</strong>: la battuta è piena, e la legatura porta il suono nella battuta dopo.</p>",
        fig({ time: "4/4", notes: [{ d: 28, label: nm(28) }, { d: 29, label: nm(29) }, { d: 30, label: nm(30) }, { d: 31, label: nm(31) }, { d: 31, v: 1, label: nm(31) }, { d: 30, v: 1, label: nm(30) }], bars: [3], legature: [[3, 4]], gap: 40, fine: true }, "L'ultimo Fa della prima battuta continua nella seconda: dura 1 + 2 = 3 tempi"),
        ascolta("Ascolta", [[LN.midiOf(28), B], [LN.midiOf(29), B], [LN.midiOf(30), B], [LN.midiOf(31), 3 * B], [LN.midiOf(30), 2 * B]]),
        prova("Due Re uniti da una legatura di valore, una semiminima e una minima: quante volte suoni il Re e per quanti tempi?", "Una volta sola, per 1 + 2 = 3 tempi.")
      ];
    } },
    { t: "La legatura di portamento", body: function () {
      return [
        "<p>La <strong>legatura di portamento</strong> è un arco che unisce <strong>note di altezza diversa</strong>. Le note sotto l'arco si suonano <strong>legate</strong>: una dopo l'altra, senza staccare il suono.</p>",
        fig({ notes: named(range(28, 32)), legature: [[0, 4]], gap: 36 }, "Cinque note sotto la stessa legatura: si suonano tutte legate"),
        "<p>Sul clarinetto dai il <strong>colpo di lingua solo sulla prima nota</strong> della legatura. Per le altre muovi soltanto le dita, mentre il fiato continua senza fermarsi. Le note senza legatura, invece, si attaccano una per una con la lingua.</p>",
        "<p>Come distinguere le due legature? Guarda le note che l'arco unisce: se sono <strong>uguali</strong> è una legatura di valore, se sono <strong>diverse</strong> è una legatura di portamento.</p>",
        fig({ notes: [{ d: 33, v: 1, label: nm(33) }, { d: 33, v: 1, label: nm(33) }, { d: 33, v: 1, label: nm(33) }, { d: 35, v: 1, label: nm(35) }], legature: [[0, 1], [2, 3]], bars: [1], gap: 48 }, "A sinistra due La uguali: legatura di valore. A destra La e Do: legatura di portamento"),
        prova("Un arco unisce un Mi e un Sol: è una legatura di valore o di portamento?", "Di portamento, perché le due note sono diverse: si suonano legate, con un solo colpo di lingua sul Mi.")
      ];
    } },
    { t: "Il ritornello", quiz: false, body: function () {
      var B = LN.BEAT, frase = [28, 29, 30, 31, 32, 31, 30, 29];
      function note(ds) { return ds.map(function (d) { return { d: d, label: nm(d) }; }); }
      var due = frase.concat(frase).map(function (d) { return [LN.midiOf(d), B]; });
      return [
        "<p>Il <strong>ritornello</strong> indica che una parte del brano va <strong>suonata due volte</strong>. Si scrive con una doppia stanghetta, una sottile e una spessa, e due puntini rivolti verso la parte da ripetere.</p>",
        fig({ notes: note(frase), bars: [3], ritornello: { fine: true }, gap: 30, width: 50 + 8 * 30 + 22 }, "Arrivato ai due puntini, torni all'inizio del brano e suoni tutto un'altra volta"),
        ascolta("Ascolta con il ritornello", due),
        "<p>Se più indietro trovi lo stesso segno con i puntini <strong>a destra</strong>, il ritornello parte da lì: torni a quel segno, non all'inizio del brano.</p>",
        fig({ notes: note([28, 30, 32, 33, 32, 30]), bars: [2], ritornello: { inizio: true, fine: true }, startX: 70, gap: 30, width: 70 + 6 * 30 + 22 }, "Le due battute tra i segni di ritornello si suonano due volte"),
        "<p>Dopo la ripetizione si va avanti senza ripetere di nuovo.</p>",
        prova("Un brano ha 4 battute e il segno di ritornello alla fine. Quante battute suoni in tutto?", "Otto: le quattro battute due volte.")
      ];
    } },
    { t: "Il punto coronato", quiz: false, body: function () {
      var B = LN.BEAT, frase = [32, 31, 30, 29];
      return [
        "<p>Il <strong>punto coronato</strong>, chiamato anche <strong>corona</strong>, è un piccolo arco con un punto al centro, scritto sopra (a volte sotto) una nota o una pausa. Indica di <strong>fermarsi</strong> su quella nota e tenerla più a lungo del suo valore.</p>",
        fig({ notes: frase.map(function (d) { return { d: d, label: nm(d) }; }).concat([{ d: 28, v: 0, corona: true, label: nm(28) }]), bars: [3], gap: 38, fine: true }, "La corona sul Do finale: il suono si tiene più a lungo, poi si chiude"),
        ascolta("Senza corona", frase.map(function (d) { return [LN.midiOf(d), B]; }).concat([[LN.midiOf(28), 4 * B]])) + " " +
          ascolta("Con la corona", frase.map(function (d) { return [LN.midiOf(d), B]; }).concat([[LN.midiOf(28), 7 * B]])),
        "<p>Quanto tenerla non è scritto: lo decide chi suona o, nell'orchestra, il <strong>direttore</strong>. Per questo durante una corona si guarda il direttore e si chiude il suono tutti insieme, al suo gesto.</p>",
        "<p>La trovi spesso sull'<strong>ultima nota</strong> di un brano o alla fine di una frase importante.</p>",
        prova("Nell'orchestra, chi decide quanto dura una nota con la corona?", "Il direttore: chi suona lo guarda e chiude il suono insieme agli altri.")
      ];
    } },
    { t: "Il respiro", quiz: false, body: function () {
      return [
        "<p>Chi suona uno strumento a fiato deve sapere <strong>dove prendere fiato</strong>. Una piccola <strong>virgola</strong> scritta sopra il rigo indica il punto giusto per respirare.</p>",
        fig({ time: "4/4", notes: [28, 29, 30, 31, 32, 33].map(function (d, i) { return { d: d, v: i === 2 || i === 5 ? 1 : 2, label: nm(d) }; }), bars: [2], respiri: [2], gap: 40, fine: true }, "La virgola dopo il Mi: si respira tra la prima e la seconda frase"),
        "<p>Per respirare senza perdere il tempo si <strong>accorcia un poco la nota prima della virgola</strong>, si prende fiato in fretta dagli angoli della bocca, senza alzare le spalle, e si riparte puntuali sulla nota dopo.</p>",
        "<p>Non si respira in mezzo a una <strong>legatura di portamento</strong>: si spezzerebbe il legato. Se la virgola non c'è, si respira alla fine di una frase, come quando si legge una poesia ad alta voce.</p>",
        prova("Dove prendi fiato: in mezzo a una legatura di portamento o dove c'è la virgola?", "Dove c'è la virgola. In mezzo alla legatura il suono deve continuare senza interruzioni.")
      ];
    } },
    { t: "Tono e semitono", quiz: false, body: function () {
      return [
        "<p>Il <strong>semitono</strong> è la distanza più piccola tra due suoni nella nostra musica. Sul pianoforte è la distanza tra due <strong>tasti vicini</strong>, bianchi o neri, senza nessun tasto in mezzo.</p>",
        "<p>Il <strong>tono</strong> è formato da <strong>due semitoni</strong>: tra le due note c'è un tasto in mezzo.</p>",
        '<figure class="fig">' + tastiera({ t: [60, 62], s: [64, 65, 71, 72] }) + '<figcaption><span class="lg-tono"></span>Do–Re: un tono, c\'è il tasto nero in mezzo. <span class="lg-semi"></span>Mi–Fa e Si–Do: un semitono, nessun tasto in mezzo. Tocca i tasti per ascoltarli.</figcaption></figure>',
        ascolta("Un tono: Do–Re", [[60, 0.8], [62, 0.8]]) + " " + ascolta("Un semitono: Mi–Fa", [[64, 0.8], [65, 0.8]]),
        "<p>Tra le note naturali, cioè i tasti bianchi, quasi tutte le distanze sono di un tono. Solo due sono di un semitono: <strong>Mi–Fa</strong> e <strong>Si–Do</strong>, perché tra loro non c'è il tasto nero.</p>",
        fig({ notes: named(range(28, 35), [30, 31, 34, 35]), gap: 30 }, "La scala di Do: tono, tono, semitono (Mi–Fa), tono, tono, tono, semitono (Si–Do)"),
        prova("Da Si a Do c'è un tono o un semitono?", "Un semitono: sul pianoforte tra Si e Do non c'è nessun tasto nero.")
      ];
    } },
    { t: "Le alterazioni", body: function () {
      function A(d, acc, suona) { return { d: d, acc: acc, suona: suona, label: nm(d) + ({ "#": "♯", b: "♭" }[acc || suona] || "") }; }
      return [
        "<p>Le <strong>alterazioni</strong> sono segni che cambiano l'altezza di una nota di <strong>un semitono</strong>. Si scrivono <strong>prima</strong> della nota, sulla stessa riga o nello stesso spazio, ma si leggono <strong>dopo</strong> il nome: «Fa diesis».</p>",
        '<ul class="lista-alt"><li><span class="alt-seg">♯</span><span><strong>Diesis</strong>: alza la nota di un semitono.</span></li>' +
          '<li><span class="alt-seg">♭</span><span><strong>Bemolle</strong>: abbassa la nota di un semitono.</span></li>' +
          '<li><span class="alt-seg">♮</span><span><strong>Bequadro</strong>: annulla il diesis o il bemolle e riporta la nota naturale.</span></li></ul>',
        fig({ notes: [A(31), A(31, "#"), A(34), A(34, "b")], bars: [1], gap: 48 }, "Fa e Fa diesis, Si e Si bemolle: tocca le note e ascolta la differenza"),
        "<h3>Alterazioni transitorie</h3>",
        "<p>Le alterazioni <strong>transitorie</strong>, dette anche momentanee, si scrivono davanti a una nota durante il brano. Valgono per <strong>tutta la battuta</strong>: anche le note uguali che vengono dopo, nella stessa battuta, restano alterate. Alla stanghetta l'effetto finisce e nella battuta dopo la nota torna naturale.</p>",
        fig({ notes: [A(31, "#"), A(32), A(31, null, "#"), A(30), A(31), A(32), A(33, "b"), A(33, "n")], bars: [3], gap: 40, fine: true }, "Prima battuta: anche il secondo Fa è diesis. Seconda battuta: il Fa è naturale, e il bequadro annulla il bemolle del La"),
        prova("Un Sol con il diesis, poi un altro Sol nella stessa battuta senza segni: come suoni il secondo?", "Ancora Sol diesis: l'alterazione vale fino alla fine della battuta."),
        "<h3>Alterazioni fisse</h3>",
        "<p>Le alterazioni <strong>fisse</strong>, dette anche costanti, si scrivono all'inizio di <strong>ogni rigo</strong>, subito dopo la chiave, e insieme formano l'<strong>armatura di chiave</strong>. Valgono per <strong>tutto il brano</strong> e per tutte le note con quel nome, in qualsiasi ottava.</p>",
        fig({ armatura: [[38, "#"]], notes: [A(31, null, "#"), A(32), A(33), A(38, null, "#")], gap: 44 }, "Il diesis in chiave è sulla riga del Fa: tutti i Fa del brano sono Fa diesis, anche quello nel primo spazio"),
        fig({ armatura: [[34, "b"]], notes: [A(33), A(34, null, "b"), A(35), A(34, null, "b")], gap: 44 }, "Con il bemolle in chiave sulla terza riga, ogni Si si suona Si bemolle"),
        "<p>Un <strong>bequadro</strong> davanti a una nota annulla l'alterazione fissa, ma solo fino alla fine della battuta: nella battuta dopo vale di nuovo l'armatura.</p>",
        fig({ armatura: [[38, "#"]], notes: [A(31, null, "#"), A(31, "n"), A(31, null, ""), A(32), A(31, null, "#")], bars: [3], gap: 42 }, "Il bequadro rende naturale il Fa fino alla stanghetta; dopo, il Fa torna diesis"),
        prova("Nell'armatura c'è il Si bemolle. Trovi un Si senza segni: come lo suoni?", "Si bemolle: l'alterazione in chiave vale per tutto il brano.")
      ];
    } },
    { t: "Le note enarmoniche", body: function () {
      var coppie = [[28, 29], [29, 30], [31, 32], [32, 33], [33, 34]], note = [], bars = [];
      coppie.forEach(function (c, i) {
        note.push({ d: c[0], acc: "#", label: nm(c[0]) + "♯" }, { d: c[1], acc: "b", label: nm(c[1]) + "♭" });
        if (i < coppie.length - 1) bars.push(i * 2 + 1);
      });
      return [
        "<p>Due note sono <strong>enarmoniche</strong> quando hanno <strong>nomi diversi ma lo stesso suono</strong>. Per esempio Do♯ e Re♭: alzare il Do di un semitono o abbassare il Re di un semitono porta allo stesso tasto nero del pianoforte.</p>",
        '<figure class="fig">' + tastiera({ s: [61] }) + '<figcaption><span class="lg-semi"></span>Questo tasto nero si chiama Do♯ o Re♭: è lo stesso suono.</figcaption></figure>',
        fig({ notes: note, bars: bars, gap: 36 }, "Le cinque coppie dei tasti neri: tocca le due note di ogni coppia, suonano uguali"),
        ascolta("Do♯ e poi Re♭", [[61, 0.9], [61, 0.9]]),
        "<p>Sono enarmoniche anche <strong>Mi♯ e Fa</strong>, <strong>Si♯ e Do</strong>: tra Mi e Fa, come tra Si e Do, c'è un semitono soltanto.</p>",
        "<p>Sul clarinetto due note enarmoniche si suonano con la <strong>stessa posizione</strong>: nella tavola delle posizioni le trovi scritte una accanto all'altra.</p>",
        prova("Qual è la nota enarmonica di La♯?", "Si♭: tutte e due sono il tasto nero tra La e Si.")
      ];
    } },
    { t: "Le posizioni del clarinetto", quiz: false, body: function () {
      var D = LN.dita, esempio = { fori: ["P", "T", "L1", "L2", "L3"], chiavi: ["6"] };
      var chiavi = Object.keys(D.CHIAVI).sort(D.ordina);
      function colonna(m) {
        return '<div class="mappa-col ' + m + '"><h4>' + (m === "sx" ? "Mano sinistra" : "Mano destra") + "</h4><ul>" + chiavi.filter(function (k) { return D.CHIAVI[k].mano === m; }).map(function (k) {
          var c = D.CHIAVI[k]; return '<li><span class="ch-num ' + m + '">' + D.etichetta(k) + "</span> " + c.testo + " <small>(" + (c.come || c.dito) + ")</small></li>";
        }).join("") + "</ul></div>";
      }
      var mappa = '<figure class="fig mappa-chiavi">' + colonna("sx") + D.svg({ fori: [], chiavi: chiavi }, { legenda: true, aria: "Tutte le chiavi: a sinistra quelle della mano sinistra, a destra quelle della mano destra" }) + colonna("dx") +
        "<figcaption>Tutte le chiavi con il loro numero: le gialle si premono con la mano sinistra, le azzurre con la mano destra.</figcaption></figure>";
      var tavola = D.NOTE.map(function (n) {
        // le note enarmoniche (La♯ / Si♭) compaiono tutte e due sul pentagramma
        var note = n.sp.map(function (g) { return { d: g[0], v: 0, acc: g[1] }; });
        return '<div class="tav-nota"><div class="tav-pent">' + LN.staffSVG({ notes: note, gap: 40, startX: 44, scale: note.length > 1 ? 0.95 : 1, aria: n.nome }) + "</div>" +
          "<b>" + n.nome + '</b><div class="tav-pos">' + n.pos.map(function (p, i) { return (i ? '<span class="tav-o">o</span>' : "") + D.svg(p, { aria: D.aParole(p) }); }).join("") + "</div></div>";
      }).join("");
      return [
        "<p>Ogni posizione è disegnata come il clarinetto visto di fronte. Al centro i fori: tre per la <strong>mano sinistra</strong>, una lineetta, tre per la <strong>mano destra</strong>. A sinistra, perché stanno dietro lo strumento, il <strong>portavoce</strong> e il <strong>foro del pollice</strong>, tutti e due per il pollice sinistro. Intorno, al loro posto, tutte le chiavi.</p>",
        '<figure class="fig tav-esempio">' + D.svg(esempio, { aria: "Esempio" }) + "<figcaption>Foro pieno = chiuso; vuoto = aperto. Le chiavi colorate con il numero sono quelle da premere, le altre restano libere. Qui: Sol♯ acuto.</figcaption></figure>",
        "<p>I <strong>numeri</strong> sono le chiavi da premere, numerate come nell'«Elenco delle posizioni» del metodo <em>Ascolta, leggi &amp; suona</em>. Il colore dice con quale mano premere: <strong>gialle</strong> con la mano sinistra, <strong>azzurre</strong> con la mano destra. Ogni chiave ha la sua sagoma ed è disegnata dove si trova sullo strumento visto di fronte: in alto le chiavi del La e del La♭; a sinistra dei fori le chiavi laterali 11, 10 bis, 8 e 7, che si premono con l'indice destro (11, 10 bis e 7 con il dorso dell'indice, vicino alla nocca); tra il secondo e il terzo foro della mano sinistra la chiavetta 7 bis e, sotto il terzo foro, la paletta 6; subito sotto la lineetta, a destra, le chiavi del mignolo sinistro: la 3 bis di traverso e, sotto, le chiavi lunghe 1 e 2; tra il secondo e il terzo foro della mano destra la chiavetta 5; in basso a sinistra le chiavi del mignolo destro.</p>",
        mappa,
        "<p>Le note sono <strong>scritte</strong> per il clarinetto in Si♭: il suono reale è un tono sotto. Quando ci sono due posizioni, separate da «o», vanno bene tutte e due: si sceglie quella più comoda per la nota che viene prima o dopo.</p>",
        "<h3>La tavola completa</h3>",
        '<div class="tavola">' + tavola + "</div>"
      ];
    } }
  ];
})(window.LN);
