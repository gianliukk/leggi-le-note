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
    ]; } }
  ];
})(window.LN);
