/* Applicazione: percorso, tappe, esito, lezioni e profilo. */
(function (LN) {
  "use strict";
  var S = LN.store;
  function $(s) { return document.querySelector(s); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function fmtTime(ms) { var s = Math.round(ms / 1000); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  var ICON = {
    note: '<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="9" cy="17" rx="5.2" ry="3.7" transform="rotate(-20 9 17)" fill="currentColor"/><rect x="12.7" y="3" width="2.3" height="14" fill="currentColor"/></svg>',
    valori: '<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="8" cy="18" rx="5" ry="3.6" transform="rotate(-20 8 18)" fill="currentColor"/><rect x="11.4" y="3" width="2.3" height="15" fill="currentColor"/><path d="M13.7 3 C14 6.5 20 7.5 18.6 13 C18 10 16 8.8 13.7 8.6 Z" fill="currentColor"/></svg>',
    ascolto: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.6 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    ritmo: '<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="9" rx="8.5" ry="3.2" fill="currentColor"/><path d="M3.5 9v7c0 1.8 3.8 3.2 8.5 3.2s8.5-1.4 8.5-3.2V9c0 1.8-3.8 3.2-8.5 3.2S3.5 10.8 3.5 9z" fill="currentColor" opacity=".75"/><path d="M14 2.5 18.5 7M10 2.5 5.5 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10.5" rx="2.5" fill="currentColor"/><path d="M8.2 10.5V7.6a3.8 3.8 0 0 1 7.6 0v2.9" fill="none" stroke="currentColor" stroke-width="2.6"/></svg>',
    flame: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.5 2c.6 3.6 6.5 5.6 6.5 12a7 7 0 0 1-14 0c0-3.2 1.9-5.4 3.3-6.6.1 2 1 3.3 2.3 3.6C10.3 7.6 10.8 4.6 12.5 2z" fill="currentColor"/></svg>',
    gem: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 3h11l4.5 6.2L12 21 2 9.2z" fill="currentColor"/><path d="M2 9.2h20M8.5 9.2 12 21l3.5-11.8" stroke="#FFFFFF" stroke-opacity=".45" stroke-width="1.2" fill="none"/></svg>',
    book: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="currentColor"/><path d="M7 12.4l3.3 3.3L17 9" fill="none" stroke="#FFFFFF" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    bolt: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 2 4.5 13.5h6L9.5 22l9-11.5h-6z" fill="currentColor"/></svg>',
    star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.5l1.3-6.6L2.5 9.3l6.6-.8z" fill="currentColor"/></svg>'
  };
  function starRow(k, cls) {
    var s = '<span class="' + cls + '" aria-label="' + k + ' stelle su 3">';
    for (var i = 1; i <= 3; i++) s += '<span class="' + (i <= k ? "on" : "off") + '" aria-hidden="true">★</span>';
    return s + "</span>";
  }
  var toastT = null;
  function toast(msg) {
    var t = $("#toast"); t.textContent = msg; t.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(function () { t.hidden = true; }, 2600);
  }

  /* ---------- Barra superiore ---------- */
  function updateChips() {
    var c = $("#chipSerie");
    var cor = S.corone();
    c.innerHTML = ICON.flame + "<span>" + S.serieAttuale() + "</span>" +
      (cor ? '<span class="chip-corona" aria-label="' + cor + (cor === 1 ? " corona" : " corone") + '">\u{1D110}' + (cor > 1 ? cor : "") + "</span>" : "");
    c.title = "Giorni di fila con almeno un allenamento" + (cor ? ". Corone: " + cor + " (salvano la serie se salti un giorno)" : "");
    c.style.color = S.oggiFatto() ? "var(--flame)" : "";
    c.classList.toggle("spenta", !S.oggiFatto());
    $("#chipXp").innerHTML = '<span style="color:var(--gem);display:inline-flex">' + ICON.gem + "</span><span>" + S.state.xp + "</span>";
    var e = S.energia(), ce = $("#chipEnergia");
    ce.hidden = !!e.illimitata;
    ce.innerHTML = '<span style="color:var(--energy);display:inline-flex">' + ICON.bolt + "</span><span>" + e.valore + "/" + e.max + "</span>";
    ce.classList.toggle("spenta", e.valore === 0);
    ce.title = e.prossima == null ? "Energia piena: ogni tappa ne usa una" : "Energia: la prossima carica arriva tra " + minuti(e.prossima);
  }
  function minuti(ms) { var m = Math.max(1, Math.ceil(ms / 60000)); return m + (m === 1 ? " minuto" : " minuti"); }
  function energiaHint() {
    var e = S.energia();
    if (e.illimitata || e.valore > 0) return "";
    return '<p class="energy-line">Energia finita: puoi allenarti lo stesso, ma le tappe non danno XP. La prossima carica arriva tra ' + minuti(e.prossima) + ".</p>";
  }
  setInterval(function () { if (!document.body.classList.contains("no-auth")) updateChips(); }, 30000);

  function bonusHint(serie) {
    var m = S.moltiplicatore(serie), n = S.prossimaSoglia(serie), t;
    if (!serie) return "";
    t = m > 1 ? "Bonus continuità attivo: XP ×" + String(m).replace(".", ",") + "." : "";
    if (n) t += (t ? " " : "") + "Ancora " + n.mancano + (n.mancano === 1 ? " giorno" : " giorni") + " di fila per XP ×" + String(n.molt).replace(".", ",") + ".";
    return t ? '<p class="bonus-line">' + t + "</p>" : "";
  }

  function avvisoCorone() {
    S.serieAttuale();
    var u = S.coroneUsateOggi();
    if (!u) return "";
    return '<p class="corona-line"><span class="corona-ic">\u{1D110}</span>' +
      (u.n === 1 ? "Hai saltato un giorno, ma una corona" : "Hai saltato " + u.n + " giorni, ma " + u.n + " corone") +
      " " + (u.n === 1 ? "ha" : "hanno") + " salvato la tua serie di " + u.serie + " giorni. Allenati oggi per farla crescere!</p>";
  }

  /* ---------- Percorso ---------- */
  var OFFSETS = [0, 56, 84, 56, 0, -56, -84, -56];
  function renderPercorso() {
    LN.medaglie.controlla(); // assegna senza annuncio quelle già meritate (per esempio prima dell'arrivo delle medaglie)
    var cur = S.corrente(), tot = LN.TAPPE.length, hero;
    if (cur >= tot) {
      hero = LN.gufo("festa") + '<div class="bubble"><h1>Percorso completato!</h1><p>Hai superato tutte le tappe. Ora puoi tornare indietro e battere i tuoi record.</p></div>';
    } else {
      var t = LN.TAPPE[cur], primo = S.state.xp === 0;
      var chi = LN.account.ruolo === "studente" ? ", " + esc(LN.account.profilo.username) : "";
      hero = LN.gufo(primo ? "ciao" : "felice") + '<div class="bubble">' +
        (primo
          ? "<h1>Ciao" + chi + "! Sono il prof. Marano.</h1><p>Ti accompagno tappa dopo tappa a leggere la musica. Si comincia dalle prime tre note.</p>"
          : "<h1>Ciao di nuovo" + chi + "!</h1>" + avvisoCorone() + "<p>Prossima tappa: <strong>" + t.L.title + "</strong>." + (S.oggiFatto() ? " Oggi la serie è già salva." : " Allenati oggi per tenere viva la serie.") + "</p>" + bonusHint(S.serieAttuale()) + energiaHint()) +
        '<button class="btn3d primary" id="heroGo">' + (primo ? "Inizia" : "Continua") + "</button></div>";
    }
    $("#hero").innerHTML = hero;

    var html = "", gi = 0;
    LN.PERCORSO.forEach(function (u, ui) {
      var c = ui % 4;
      html += '<section class="unit" style="--u:var(--u' + c + ');--us:var(--u' + c + 's)">' +
        '<div class="unit-banner" style="--u:var(--u' + c + ');--us:var(--u' + c + 's)"><div><div class="eyebrow">Unità ' + (ui + 1) + "</div><h2>" + u.titolo + "</h2><p>" + u.descr + "</p></div>" +
        '<button class="guide-btn" data-lesson="' + u.lezione + '">' + ICON.book + "Guida</button></div>" +
        '<div class="nodes">';
      u.tappe.forEach(function () {
        var T = LN.TAPPE[gi], b = S.best(T.key), open = S.sbloccata(gi), done = S.completata(T.key), isCur = gi === cur;
        var cls = "node" + (!open ? " locked" : done ? " done" : "") + (isCur ? " current" : "");
        var icon = !open ? ICON.lock : ICON[T.track];
        html += '<div class="node-wrap" style="--x:' + OFFSETS[gi % 8] + 'px">' +
          (isCur ? '<span class="start-tip">' + (b.score ? "Riprova" : "Inizia") + "</span>" : "") +
          '<button class="' + cls + '" data-tappa="' + gi + '" aria-label="' + esc(T.L.title) + (open ? "" : ", bloccata") + '">' + icon + "</button>" +
          (b.stars || done ? starRow(b.stars, "node-stars") : "") +
          '<span class="node-label">' + T.L.title + "</span></div>";
        gi++;
      });
      html += "</div></section>";
    });
    html += '<p class="path-end">Nuova unità in arrivo: la diteggiatura del clarinetto.</p>';
    $("#path").innerHTML = cartaMissioni() + cartaRipasso() + html;
    updateChips();
  }
  $("#hero").addEventListener("click", function (e) { if (e.target.closest("#heroGo")) startSession(S.corrente()); });
  $("#path").addEventListener("click", function (e) {
    if (e.target.closest("[data-ripasso]")) { startSession("ripasso"); return; }
    var nr = e.target.closest(".ripasso-card g.n[data-midi]");
    if (nr) { LN.suono.play(+nr.dataset.midi, +nr.dataset.dur || 1); return; }
    var g = e.target.closest("[data-lesson]");
    if (g) { lessonIdx = +g.dataset.lesson; show("lezioni"); return; }
    var n = e.target.closest("[data-tappa]");
    if (!n) return;
    var i = +n.dataset.tappa;
    if (!S.sbloccata(i)) { toast("Supera prima la tappa precedente con almeno due stelle."); return; }
    startSession(i);
  });

  /* ---------- Ripasso degli errori ---------- */
  /* Chiavi come in progressi.js: "n30" nota, "f3" figura, "p3" pausa. */
  function trackDi(it) { return it.r != null ? "ritmo" : it.a != null ? "ascolto" : it.v != null ? "valori" : "note"; }
  function chiave(it) {
    var t = trackDi(it);
    return t === "ritmo" ? "r" : t === "ascolto" ? "a" + it.a + "-" + it.b : t === "note" ? "n" + it.d : (it.rest ? "p" : "f") + it.v;
  }
  /* Solo la lettura di note e figure entra nel ripasso degli errori. */
  function daLeggere(track) { return track === "note" || track === "valori"; }
  function daChiave(k) { return k[0] === "n" ? { d: +k.slice(1) } : { v: +k.slice(1), rest: k[0] === "p" }; }
  function nomeChiave(k) {
    var it = daChiave(k);
    if (it.d != null) return LN.nm(it.d);
    var V = LN.VALUES[it.v];
    return it.rest ? "pausa di " + V.name.toLowerCase() : V.name.toLowerCase();
  }
  function staffDi(chiavi, gap) {
    return LN.staffSVG({ gap: gap || 34, notes: chiavi.map(function (k) {
      var it = daChiave(k);
      return it.d != null ? { d: it.d, label: LN.nm(it.d) } : { v: it.v, rest: it.rest, d: it.rest ? 34 : 32, label: LN.VALUES[it.v].frac };
    }) });
  }
  /* Note e figure delle tappe già aperte: solo queste possono uscire nel ripasso. */
  function conosciute() {
    var set = {};
    LN.TAPPE.forEach(function (T, i) { if (daLeggere(T.track) && S.sbloccata(i)) T.L.items.forEach(function (it) { set[chiave(it)] = it; }); });
    return set;
  }
  /* Una tappa di 10 domande: gli errori escono più spesso (quanto più "resta" da indovinare),
     insieme alle note e figure vicine, che sono quelle con cui si confondono. */
  function lezioneRipasso() {
    var noti = conosciute(), items = [], letters = {}, vs = {}, ds = {};
    function metti(it, volte) {
      for (var i = 0; i < volte; i++) items.push(it);
      if (it.d != null) { letters[it.d % 7] = 1; ds[it.d] = 1; } else vs[it.v] = 1;
    }
    S.daRipassare().forEach(function (x) {
      var it = daChiave(x.k);
      metti(it, x.resta + 1);
      (it.d != null ? [{ d: it.d - 1 }, { d: it.d + 1 }] : [{ v: it.v - 1, rest: it.rest }, { v: it.v + 1, rest: it.rest }])
        .forEach(function (n) { if (noti[chiave(n)]) metti(n, 1); });
    });
    // Tra le risposte possibili ci sono tutte le note e le figure già studiate, non solo quelle del ripasso.
    var conNote = items.some(function (it) { return it.d != null; }), conValori = items.some(function (it) { return it.v != null; });
    Object.keys(noti).forEach(function (k) {
      var it = noti[k];
      if (it.d != null && conNote) letters[it.d % 7] = 1;
      if (it.v != null && conValori) vs[it.v] = 1;
    });
    function num(o) { return Object.keys(o).map(Number).sort(function (a, b) { return a - b; }); }
    return { title: "Ripasso degli errori", q: 10, items: items, letters: num(letters), vs: num(vs), ds: num(ds) };
  }
  /* Errori da ripassare che appartengono a una tappa: escono anche lì, ogni tanto. */
  function erroriDellaTappa(T) {
    var mie = {};
    T.L.items.forEach(function (it) { mie[chiave(it)] = it; });
    return S.daRipassare().filter(function (x) { return mie[x.k]; }).map(function (x) { return mie[x.k]; });
  }
  function cartaRipasso() {
    var lista = S.daRipassare();
    if (!lista.length) return "";
    var mostra = lista.slice(0, 6).map(function (x) { return x.k; });
    return '<section class="ripasso-card"><div class="ripasso-testo"><div class="eyebrow">Ripasso</div>' +
      "<h2>Ripassa i tuoi errori</h2><p>" + (lista.length === 1 ? "Hai 1 nota o figura da sistemare" : "Hai " + lista.length + " note o figure da sistemare") +
      ": ognuna esce dal ripasso quando la indovini " + S.RIPASSO_VOLTE + " volte.</p></div>" +
      '<figure class="fig">' + staffDi(mostra, 32) + "<figcaption>" + lista.slice(0, 6).map(function (x) { return esc(nomeChiave(x.k)); }).join(" · ") +
      (lista.length > 6 ? " e altre " + (lista.length - 6) : "") + "</figcaption></figure>" +
      '<button class="btn3d primary" data-ripasso="1">Ripassa</button></section>';
  }

  /* ---------- Missioni del giorno ---------- */
  function testoMissione(x) {
    return {
      tappe: "Gioca " + x.n + " tappe",
      giuste: "Dai " + x.n + " risposte giuste",
      fila: "Dai " + x.n + " risposte giuste di fila in una tappa",
      perfetta: "Completa una tappa senza errori",
      xp: "Guadagna " + x.n + " XP nelle tappe",
      ripasso: "Fai un ripasso degli errori",
      valori: "Gioca una tappa su figure e pause"
    }[x.t];
  }
  function cartaMissioni() {
    var m = S.missioni(), fatte = m.lista.filter(function (x) { return x.ok; }).length;
    return '<section class="missioni"><div class="miss-head"><div><div class="eyebrow">Oggi</div><h2>Missioni del giorno</h2></div>' +
      '<span class="miss-conta">' + fatte + "/" + m.lista.length + "</span></div>" +
      '<ul class="miss-lista">' + m.lista.map(function (x) {
        return '<li class="miss' + (x.ok ? " ok" : "") + '"><span class="miss-ic">' + (x.ok ? ICON.check : ICON.star) + "</span>" +
          '<div class="miss-main"><span class="miss-testo">' + testoMissione(x) + "</span>" +
          '<span class="miss-bar" aria-hidden="true"><i style="width:' + Math.round(x.fatto / x.n * 100) + '%"></i></span></div>' +
          '<span class="miss-num">' + (x.ok ? "+" + S.MISSIONE_XP + " XP" : x.fatto + "/" + x.n) + "</span></li>";
      }).join("") + "</ul>" +
      '<p class="miss-nota">' + (m.premio ? "Tutte completate: energia ricaricata al massimo. Domani arrivano missioni nuove!"
        : "Ogni missione vale " + S.MISSIONE_XP + " XP. Completale tutte e tre e l'energia si ricarica al massimo. Si rinnovano a mezzanotte.") + "</p></section>";
  }

  /* ---------- Sessione ---------- */
  var sess = null;
  function startSession(gi) {
    var rip = gi === "ripasso", en = S.energia();
    var T = rip ? { key: "ripasso", track: null, L: lezioneRipasso() } : LN.TAPPE[gi];
    if (rip && !T.L.items.length) { toast("Non hai errori da ripassare: bravo!"); return; }
    if (!en.illimitata && en.valore === 0) toast("Energia finita: questa tappa non darà XP. Si ricarica tra " + minuti(en.prossima) + ".");
    sess = { gi: gi, rip: rip, T: T, track: T.track, L: T.L, i: 0, ok: 0, misses: {}, esiti: [], extra: rip ? [] : erroriDellaTappa(T),
      fila: 0, filaMax: 0, ms: 0, qStart: 0, cur: null, curKey: null, locked: false, timer: null };
    show("sessione");
    if (!rip) renderAnswers();
    next();
  }
  function next() {
    if (!sess) return;
    clearTimeout(sess.timer);
    $("#sheet").hidden = true;
    if (sess.i >= sess.L.q) { finish(); return; }
    // Nelle tappe normali, una domanda su quattro (circa) ripropone un errore da ripassare.
    var pool = sess.extra.length && Math.random() < 0.25 ? sess.extra : sess.L.items;
    var it, guard = 0;
    do { it = pick(pool); guard++; } while (chiave(it) === sess.curKey && guard < 30);
    if (sess.rip && trackDi(it) !== sess.track) { sess.track = trackDi(it); renderAnswers(); }
    sess.curKey = chiave(it);
    if (sess.track === "valori") it = { v: it.v, rest: it.rest, d: it.rest ? 34 : 29 + Math.floor(Math.random() * 9) };
    if (sess.track === "ritmo") { LN.ritmo.ferma(); it = LN.ritmo.battuta(sess.L, sess.cur && sess.cur.chiave); sess.ritRes = null; }
    sess.cur = it; sess.locked = false;
    if (sess.track === "ritmo") statoRitmo("");
    $("#prompt").textContent = sess.track === "ritmo" ? "Batti questo ritmo" : sess.track === "ascolto" ? (sess.L.uguali ? "La seconda nota sale, scende o resta uguale?" : "La seconda nota sale o scende?")
      : sess.track === "note" ? "Come si chiama questa nota?" : it.rest ? "Che pausa è? Quanto vale?" : "Che figura è? Quanto vale?";
    drawStage("");
    if (sess.track === "ascolto") suonaCoppia();
    $("#sessCount").textContent = (sess.i + 1) + "/" + sess.L.q;
    $("#pFill").style.width = (sess.i / sess.L.q * 100) + "%";
    document.querySelectorAll(".ans").forEach(function (b) { b.classList.remove("ok", "bad"); });
    if (pianoMode()) renderPiano();
    sess.qStart = performance.now();
  }
  /* Ascolto: prima della risposta si vede solo il pulsante per riascoltare; dopo, le due note sul pentagramma. */
  function nomeAsc(d) { return LN.nm(d) + (d >= 35 ? " acuto" : ""); } // nell'ascolto c'è il Do centrale e il Do acuto
  function suonaCoppia() { LN.suono.sequenza([[LN.midiOf(sess.cur.a), 0.8], [LN.midiOf(sess.cur.b), 0.8]], true); }
  var ORECCHIO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 9v6h4l5 4V5L9 9z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  /* Ritmo: Ascolta (facoltativo), poi Inizia: 4 colpi di metronomo e si batte sul pulsante grande. */
  var testinaRaf = 0;
  function statoRitmo(fase) {
    var occupato = fase === "ascolto" || fase === "prova";
    ["#rAscolta", "#rInizia"].forEach(function (s) { var b = $(s); if (b) b.disabled = occupato || sess.locked; });
    var pad = $("#tapPad"); if (pad) pad.classList.toggle("attivo", fase === "prova");
  }
  function conta(n, testo) {
    var c = $("#contaGrande"); if (!c) return;
    c.textContent = n ? String(n) : testo || "";
    c.classList.remove("batti"); void c.offsetWidth; c.classList.add("batti");
  }
  function muoviTestina() {
    cancelAnimationFrame(testinaRaf);
    (function passo() {
      var t = $("#testina"); if (!t) return;
      var b = LN.ritmo.posizione();
      if (b == null) { t.style.visibility = "hidden"; if (LN.ritmo.fase()) testinaRaf = requestAnimationFrame(passo); return; }
      var xx = LN.ritmo.xDi(b);
      t.setAttribute("x1", xx); t.setAttribute("x2", xx); t.style.visibility = "visible";
      testinaRaf = requestAnimationFrame(passo);
    })();
  }
  function ritmoAscolta() {
    if (!sess || sess.locked || LN.ritmo.fase()) return;
    statoRitmo("ascolto");
    LN.ritmo.ascolta(sess.cur, sess.L.bpm, function (n) { conta(n, "Ascolta"); }, function () { conta(0, ""); statoRitmo(""); });
    muoviTestina();
  }
  function ritmoInizia() {
    if (!sess || sess.locked || LN.ritmo.fase()) return;
    statoRitmo("prova");
    LN.ritmo.prova(sess.cur, sess.L.bpm, function (n) { conta(n, "Batti!"); }, function (res) {
      if (!sess) return;
      sess.ritRes = res;
      grade(res.ok);
      statoRitmo("");
    });
    muoviTestina();
  }
  function ritmoColpo() {
    if (!LN.ritmo.colpo()) return;
    var p = $("#tapPad"); if (p) { p.classList.remove("colpito"); void p.offsetWidth; p.classList.add("colpito"); }
  }

  function drawStage(cls) {
    var it = sess.cur;
    if (sess.track === "ritmo") {
      $("#stage").innerHTML = cls
        ? '<div class="rit-dopo">' + LN.ritmo.svg(it, { esito: sess.ritRes }) + '<p class="rit-legenda"><span class="lg-att"></span>dove andava il colpo <span class="lg-ok"></span>colpo a tempo <span class="lg-bad"></span>colpo fuori tempo</p></div>'
        : '<div class="rit">' + LN.ritmo.svg(it, { testina: true }) + '<div class="conta-grande" id="contaGrande" aria-live="polite"></div></div>';
      return;
    }
    if (sess.track === "ascolto") {
      $("#stage").innerHTML = cls
        ? '<div class="asc-dopo">' + LN.staffSVG({ notes: [{ d: it.a, label: nomeAsc(it.a) }, { d: it.b, label: nomeAsc(it.b), cls: cls }], gap: 56, startX: 70, scale: 2, aria: "Le due note ascoltate" }) + "</div>"
        : '<div class="asc"><button class="asc-btn" id="riascolta" aria-label="Ascolta di nuovo le due note">' + ORECCHIO + "</button>" +
          '<span>Tocca per ascoltare di nuovo</span><small class="muted">Se non senti nulla, alza il volume.</small></div>';
      return;
    }
    $("#stage").innerHTML = LN.staffSVG({ notes: [{ d: it.d, v: it.v, rest: it.rest, cls: cls }], width: 170, startX: 82, gap: 40, play: false, scale: 2.5, aria: "Figura da riconoscere" });
  }
  function keysOf() { return sess.track === "ascolto" ? sess.L.keys : sess.track === "note" ? sess.L.letters : sess.L.vs; }
  var DIREZIONI = [["↗", "Sale"], ["↘", "Scende"], ["=", "Uguale"]];
  function pianoMode() { return sess && sess.track === "note" && S.set.mode === "tastiera"; }
  function renderAnswers() {
    var keys = keysOf(), box = $("#answers");
    box.classList.toggle("rit-box", sess.track === "ritmo");
    if (sess.track === "ritmo") {
      box.hidden = false; $("#pianoWrap").hidden = true;
      box.innerHTML = '<div class="rit-ctl"><button class="btn3d" id="rAscolta">' + ICON.ascolto + 'Ascolta</button><button class="btn3d primary" id="rInizia">Inizia</button></div>' +
        '<button class="tap-pad" id="tapPad" aria-label="Batti qui">Batti qui</button>';
      $("#hint").innerHTML = 'Premi <b>Inizia</b>: dopo 4 colpi di metronomo batti il ritmo sul pulsante grande. Tasti: <span class="kbd">Spazio</span> per battere · <span class="kbd">Invio</span> per continuare';
      return;
    }
    box.classList.toggle("values", sess.track === "valori");
    box.classList.toggle("dir", sess.track === "ascolto");
    box.style.setProperty("--cols", sess.track === "note" ? Math.min(keys.length, 4) : Math.min(keys.length, 3));
    box.innerHTML = keys.map(function (k) {
      var inner = sess.track === "ascolto" ? '<span class="dir-ic" aria-hidden="true">' + DIREZIONI[k][0] + "</span>" + DIREZIONI[k][1]
        : sess.track === "note" ? LN.nm(k) : LN.VALUES[k].name + "<small>" + LN.VALUES[k].frac + "</small>";
      return '<button class="ans" data-k="' + k + '" id="ans-' + k + '">' + inner + "</button>";
    }).join("");
    var kb = pianoMode();
    box.hidden = kb;
    $("#pianoWrap").hidden = !kb;
    $("#hint").innerHTML = kb ? "Tocca il tasto giusto sulla tastiera." :
      'Tasti rapidi: <span class="kbd">1</span>–<span class="kbd">' + keys.length + "</span>" +
      (sess.track === "note" ? ' oppure <span class="kbd">' + keys.map(function (l) { return LN.EN[l]; }).join(" ") + "</span>" : "") +
      (sess.track === "ascolto" ? ' oppure le frecce <span class="kbd">↑</span> <span class="kbd">↓</span> · <span class="kbd">Spazio</span> per riascoltare' : "") +
      ' · <span class="kbd">Invio</span> per continuare';
  }
  function renderPiano() {
    var lo = sess.L.ds[0] - 1, hi = sess.L.ds[sess.L.ds.length - 1] + 1, N = hi - lo + 1, html = "", d;
    for (d = lo; d <= hi; d++) {
      var label = d % 7 === 0 ? (S.set.names === "en" ? "C" : "Do") + (d === 28 ? '<span class="mid">centrale</span>' : "") : "";
      html += '<button class="wk" data-midi="' + LN.midiOf(d) + '" aria-label="Tasto bianco">' + label + "</button>";
    }
    for (d = lo; d < hi; d++) {
      if ([0, 1, 3, 4, 5].indexOf(d % 7) > -1) html += '<button class="bk" data-midi="' + (LN.midiOf(d) + 1) + '" style="left:' + ((d - lo + 1) / N * 100) + '%" aria-label="Tasto nero"></button>';
    }
    var p = $("#piano"); p.style.setProperty("--n", N); p.innerHTML = html;
  }
  function describe(it) {
    if (sess.track === "ritmo") return LN.ritmo.descrivi(sess.ritRes);
    if (sess.track === "ascolto") {
      var da = "Da " + nomeAsc(it.a) + " a " + nomeAsc(it.b);
      return it.b > it.a ? da + ": la seconda nota è più acuta, sale." : it.b < it.a ? da + ": la seconda nota è più grave, scende." : "È la stessa nota, " + nomeAsc(it.a) + ": resta uguale.";
    }
    if (sess.track === "note") return "È " + LN.nm(it.d) + ".";
    var V = LN.VALUES[it.v];
    return (it.rest ? "È una pausa di " + V.name.toLowerCase() : "È una " + V.name.toLowerCase()) + ": vale " + V.frac + ".";
  }
  function grade(ok) {
    var it = sess.cur;
    sess.locked = true;
    sess.ms += performance.now() - sess.qStart;
    sess.i++;
    $("#pFill").style.width = (sess.i / sess.L.q * 100) + "%";
    if (sess.track === "ritmo") { /* il suono c'è già stato */ }
    else if (sess.track === "ascolto") { if (!ok) suonaCoppia(); }
    else if (sess.track === "note") LN.suono.play(LN.midiOf(it.d), 0.9);
    else if (!it.rest) LN.suono.play(LN.midiOf(it.d), Math.min(LN.VALUES[it.v].beats * LN.BEAT, 3));
    sess.fila = ok ? sess.fila + 1 : 0;
    sess.filaMax = Math.max(sess.filaMax, sess.fila);
    if (ok) sess.ok++;
    // Gli errori di ascolto e ritmo non entrano nel ripasso, che è fatto di note e figure da leggere.
    if (daLeggere(sess.track)) {
      sess.esiti.push([sess.curKey, ok]);
      if (!ok) sess.misses[sess.curKey] = (sess.misses[sess.curKey] || 0) + 1;
    }
    drawStage(ok ? "ok" : "bad");
    var sh = $("#sheet");
    sh.className = "sheet " + (ok ? "ok" : "bad");
    $("#sheetOwl").innerHTML = LN.gufo(ok ? "felice" : "incoraggia");
    $("#sheetTitle").textContent = pick(ok ? LN.FRASI.ok : LN.FRASI.bad);
    $("#sheetMsg").textContent = describe(it);
    $("#sheetBtn").className = "btn3d " + (ok ? "go-ok" : "go-bad");
    sh.hidden = false;
    if (ok) sess.timer = setTimeout(next, sess.track === "ritmo" ? 2200 : 1100);
    else $("#sheetBtn").focus();
  }
  function answer(k) {
    if (!sess || sess.locked) return;
    var it = sess.cur, ok;
    var right = sess.track === "ascolto" ? (it.b > it.a ? 0 : it.b < it.a ? 1 : 2) : sess.track === "note" ? it.d % 7 : it.v;
    ok = k === right;
    var b = $("#ans-" + k); if (b) b.classList.add(ok ? "ok" : "bad");
    if (!ok) { var c = $("#ans-" + right); if (c) c.classList.add("ok"); }
    grade(ok);
  }
  function answerKey(btn) {
    if (!sess || sess.locked) return;
    var target = LN.midiOf(sess.cur.d), ok = +btn.dataset.midi === target;
    btn.classList.add(ok ? "ok" : "bad");
    if (!ok) { var r = $('#piano [data-midi="' + target + '"]'); if (r) r.classList.add("ok"); }
    grade(ok);
  }
  $("#answers").addEventListener("click", function (e) {
    var b = e.target.closest(".ans"); if (b) { answer(+b.dataset.k); return; }
    if (e.target.closest("#rAscolta")) ritmoAscolta();
    else if (e.target.closest("#rInizia")) ritmoInizia();
  });
  // Il colpo si registra appena il dito tocca il pulsante (pointerdown), non al rilascio.
  $("#answers").addEventListener("pointerdown", function (e) { if (e.target.closest("#tapPad")) { e.preventDefault(); ritmoColpo(); } });
  $("#stage").addEventListener("click", function (e) {
    if (e.target.closest("#riascolta")) { suonaCoppia(); return; }
    var g = e.target.closest(".asc-dopo g.n[data-midi]"); if (g) LN.suono.play(+g.dataset.midi, 0.8);
  });
  $("#piano").addEventListener("click", function (e) { var b = e.target.closest("[data-midi]"); if (b) answerKey(b); });
  $("#sheetBtn").addEventListener("click", next);
  document.addEventListener("keydown", function (e) {
    if (!sess || $("#v-sessione").hidden || e.ctrlKey || e.metaKey || e.altKey || !$("#exitModal").hidden) return;
    if (e.key === "Enter" && !$("#sheet").hidden) { e.preventDefault(); next(); return; }
    if (sess.locked || pianoMode()) return;
    if (sess.track === "ritmo") {
      if (e.key === " " && !e.repeat) { e.preventDefault(); if (LN.ritmo.fase() === "registra" || LN.ritmo.fase() === "conteggio") ritmoColpo(); else if (!LN.ritmo.fase()) ritmoInizia(); }
      return;
    }
    if (sess.track === "ascolto") {
      if (e.key === " ") { e.preventDefault(); suonaCoppia(); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); answer(0); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); answer(1); return; }
    }
    var keys = keysOf(), k = e.key.toLowerCase(), num = parseInt(k, 10);
    if (num >= 1 && num <= keys.length) { e.preventDefault(); answer(keys[num - 1]); return; }
    var map = { c: 0, d: 1, e: 2, f: 3, g: 4, a: 5, b: 6 };
    if (sess.track === "note" && map[k] != null && keys.indexOf(map[k]) > -1) { e.preventDefault(); answer(map[k]); }
  });
  $("#exitBtn").addEventListener("click", function () {
    $("#exitOwl").innerHTML = LN.gufo("incoraggia");
    $("#exitModal").hidden = false; $("#stayBtn").focus();
  });
  $("#stayBtn").addEventListener("click", function () { $("#exitModal").hidden = true; });
  $("#leaveBtn").addEventListener("click", function () {
    $("#exitModal").hidden = true;
    LN.ritmo.ferma();
    if (sess) clearTimeout(sess.timer);
    sess = null; $("#sheet").hidden = true;
    show("percorso");
  });

  /* ---------- Esito ---------- */
  function finish() {
    var s = sess, q = s.L.q;
    var primaRipasso = S.daRipassare().length;
    S.aggiornaErrori(s.esiti);
    var restano = S.daRipassare().length;
    var res = S.registra(s.T.key, s.ok, q, Math.round(s.ms), s.rip);
    var mis = S.aggiornaMissioni({ xp: res.xp, giuste: s.ok, fila: s.filaMax, perfetta: s.ok === q, ripasso: s.rip, track: s.T.track });
    // Gli XP delle missioni vanno nella stessa riga della tappa (il database accetta al massimo 100 XP per riga).
    var xpRiga = Math.min(100, res.xp + mis.bonus);
    if (res.xp + mis.bonus > xpRiga) { S.state.xp -= res.xp + mis.bonus - xpRiga; S.salva(); }
    LN.account.registraSessione(s.T.key, s.ok, q, s.ms, xpRiga);
    S.aggiornaStat({ fila: s.filaMax, perfetta: s.ok === q, ripasso: s.rip, tutteMissioni: mis.tutte });
    var medNuove = LN.medaglie.controlla();
    var medaglieHtml = medNuove.length ? '<div class="med-nuove">' + medNuove.map(function (m) {
      return '<div class="med-nuova">' + LN.medaglie.icona(m, true) + "<div><small>Nuova medaglia!</small><b>" + m.nome + "</b><span>" + m.descr + "</span></div></div>";
    }).join("") + "</div>" : "";
    var missioniHtml = mis.nuove.length ? '<div class="miss-fatte">' + mis.nuove.map(function (x) {
      return '<p><span class="miss-ic">' + ICON.check + "</span>Missione completata: " + testoMissione(x).toLowerCase() + " <b>+" + S.MISSIONE_XP + " XP</b></p>";
    }).join("") + (mis.tutte ? '<p class="miss-tutte">Tutte le missioni di oggi completate: energia ricaricata al massimo!</p>' : "") + "</div>" : "";
    var pct = Math.round(s.ok / q * 100), passed = res.stelle >= 2;
    var nextT = s.rip ? null : LN.TAPPE[s.gi + 1];
    var title, sub;
    if (s.rip) {
      var sistemati = Math.max(0, primaRipasso - restano);
      title = restano ? "Ripasso fatto!" : "Errori sistemati!";
      sub = (sistemati ? "Hai tolto dal ripasso " + (sistemati === 1 ? "1 nota o figura" : sistemati + " note o figure") + ". " : "") +
        (restano ? "Te ne " + (restano === 1 ? "resta 1" : "restano " + restano) + " da ripassare: ognuna esce quando la indovini " + S.RIPASSO_VOLTE + " volte." : "Non hai più nulla da ripassare: complimenti!");
    } else {
      title = passed ? (res.sblocco ? "Tappa superata!" : "Ottimo lavoro!") : "Ci sei quasi!";
      sub = passed
        ? (res.sblocco && nextT ? "Si apre la tappa successiva: " + nextT.L.title + "." : res.record ? "Nuovo record personale in questa tappa." : "Un ottimo ripasso.")
        : "Per superare la tappa servono almeno " + Math.ceil(q * 0.8) + " risposte esatte su " + q + ". Ne hai date " + s.ok + ": riprova, ce la puoi fare.";
    }
    var ORD = { n: 0, f: 1, p: 2 };
    var review = "", keys = Object.keys(s.misses).sort(function (a, b) { return ORD[a[0]] - ORD[b[0]] || +a.slice(1) - +b.slice(1); });
    if (keys.length) {
      var cap = keys.map(function (k) { return nomeChiave(k) + (s.misses[k] > 1 ? " (" + s.misses[k] + " errori)" : ""); }).join(" · ");
      review = '<div class="review"><h3>Da ripassare</h3><figure class="fig">' + staffDi(keys, 32) + "<figcaption>" + esc(cap) +
        ". Tocca le note per ascoltarle. Le trovi anche nel ripasso del percorso.</figcaption></figure></div>";
    }
    $("#esito").innerHTML = '<div class="esito">' +
      LN.gufo(passed ? "festa" : res.stelle === 1 ? "pensa" : "incoraggia") +
      "<h1>" + title + "</h1>" + starRow(res.stelle, "big-stars") +
      '<p class="sub">' + sub + "</p>" +
      '<div class="tiles">' +
      '<div class="tile" style="--tc:var(--gem)"><div class="t-head" style="color:var(--surface)">XP guadagnati</div><div class="t-val"><span style="color:var(--gem);display:inline-flex">' + ICON.gem + "</span>" + res.xp + "</div></div>" +
      '<div class="tile" style="--tc:var(--ok)"><div class="t-head" style="color:var(--surface)">Precisione</div><div class="t-val">' + pct + "%</div></div>" +
      '<div class="tile" style="--tc:var(--accent)"><div class="t-head" style="color:var(--accent-ink)">Tempo</div><div class="t-val">' + fmtTime(s.ms) + "</div></div></div>" +
      (res.serieSu ? '<p class="sub"><span style="color:var(--flame);display:inline-flex;width:20px;vertical-align:-4px">' + ICON.flame + "</span> <strong>Serie: " + res.serie + (res.serie === 1 ? " giorno" : " giorni di fila") + "</strong></p>" : "") +
      (res.senzaEnergia ? '<p class="energy-line">Energia finita: la tappa vale per stelle e serie, ma non per gli XP. La prossima carica arriva tra ' + minuti(S.energia().prossima) + ".</p>" :
       res.molt > 1 ? '<p class="bonus-line">Bonus continuità XP ×' + String(res.molt).replace(".", ",") + ": +" + (res.xp - res.base) + " XP extra!</p>" : bonusHint(res.serie)) +
      (res.coronaNuova ? '<p class="corona-line"><span class="corona-ic">\u{1D110}</span>' + res.serie + " giorni di fila: hai guadagnato una corona! Se un giorno non riesci ad allenarti, salverà la tua serie.</p>" : "") +
      medaglieHtml + missioniHtml + review +
      '<div class="esito-actions"><button class="btn3d primary" id="goPath">Continua</button>' +
      (s.rip ? (restano ? '<button class="btn-plain" id="retry">Ripassa ancora</button>' : "") : '<button class="btn-plain" id="retry">Rifai la tappa</button>') + "</div></div>";
    var gi = s.gi;
    sess = null;
    show("esito");
    $("#goPath").addEventListener("click", function () { show("percorso"); scrollToCurrent(); });
    if ($("#retry")) $("#retry").addEventListener("click", function () { startSession(gi); });
  }
  $("#esito").addEventListener("click", function (e) { var g = e.target.closest("g.n[data-midi]"); if (g) LN.suono.play(+g.dataset.midi, +g.dataset.dur || 1); });
  function scrollToCurrent() {
    var n = document.querySelector(".node.current");
    if (n) n.scrollIntoView({ block: "center" });
  }

  /* ---------- Lezioni ---------- */
  var lessonIdx = 0, quizMode = false;
  function renderLesson() {
    var L = LN.LESSONS[lessonIdx], prev = LN.LESSONS[lessonIdx - 1], nextL = LN.LESSONS[lessonIdx + 1], el = $("#lesson");
    el.innerHTML = '<div class="lesson-bar"><span class="eyebrow">Lezione ' + (lessonIdx + 1) + " di " + LN.LESSONS.length + "</span>" +
      (L.quiz === false ? "" : '<label class="check"><input type="checkbox" id="quizToggle"' + (quizMode ? " checked" : "") + "> Nascondi i nomi</label>") + "</div>" +
      "<h2>" + L.t + "</h2>" + L.body().join("") +
      '<div class="lesson-nav">' +
      (prev ? '<button class="btn3d" data-go="' + (lessonIdx - 1) + '">&larr; ' + prev.t + "</button>" : "<span></span>") +
      '<button class="btn3d primary" data-path="1">Vai al percorso</button>' +
      (nextL ? '<button class="btn3d" data-go="' + (lessonIdx + 1) + '">' + nextL.t + " &rarr;</button>" : "") + "</div>";
    el.classList.toggle("quiz", quizMode && L.quiz !== false);
    $("#toc").innerHTML = LN.LESSONS.map(function (x, i) { return '<li><button data-lesson="' + i + '"' + (i === lessonIdx ? ' aria-current="true"' : "") + ">" + x.t + "</button></li>"; }).join("");
  }
  $("#toc").addEventListener("click", function (e) { var b = e.target.closest("[data-lesson]"); if (b) { lessonIdx = +b.dataset.lesson; renderLesson(); window.scrollTo({ top: 0 }); } });
  $("#lesson").addEventListener("click", function (e) {
    var go = e.target.closest("[data-go]"); if (go) { lessonIdx = +go.dataset.go; renderLesson(); window.scrollTo({ top: 0 }); return; }
    if (e.target.closest("[data-path]")) { show("percorso"); return; }
    var g = e.target.closest("g.n[data-midi]"); if (g) { g.classList.add("revealed"); LN.suono.play(+g.dataset.midi, +g.dataset.dur || 1); }
  });
  $("#lesson").addEventListener("keydown", function (e) {
    var g = e.target.closest && e.target.closest("g.n[data-midi]");
    if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); g.classList.add("revealed"); LN.suono.play(+g.dataset.midi, +g.dataset.dur || 1); }
  });
  $("#lesson").addEventListener("change", function (e) {
    if (e.target.id !== "quizToggle") return;
    quizMode = e.target.checked; $("#lesson").classList.toggle("quiz", quizMode);
    $("#lesson").querySelectorAll(".revealed").forEach(function (g) { g.classList.remove("revealed"); });
  });

  /* ---------- Profilo ---------- */
  function seg(name, opts, val) {
    return '<div class="seg" role="group">' + opts.map(function (o) {
      return '<button data-set="' + name + '" data-val="' + o[0] + '" aria-pressed="' + (String(val) === String(o[0])) + '">' + o[1] + "</button>";
    }).join("") + "</div>";
  }
  function sezioneMedaglie() {
    LN.medaglie.controlla();
    var el = LN.medaglie.elenco(), prese = el.filter(function (x) { return x.data; }).length;
    function data(s) { var p = s.split("-"); return p[2] + "/" + p[1] + "/" + p[0]; }
    return '<div class="medaglie-sez"><div class="miss-head"><h2>Medaglie</h2><span class="miss-conta">' + prese + "/" + el.length + "</span></div>" +
      '<div class="med-grid">' + el.map(function (x) {
        return '<div class="med' + (x.data ? " presa" : "") + '">' + LN.medaglie.icona(x.m, !!x.data) +
          "<b>" + x.m.nome + "</b><span>" + x.m.descr + "</span>" +
          (x.data ? "<small>Presa il " + data(x.data) + "</small>"
            : x.m.n > 1 ? '<span class="miss-bar" aria-label="' + x.val + " su " + x.m.n + '"><i style="width:' + Math.round(x.val / x.m.n * 100) + '%"></i></span><small>' + x.val + "/" + x.m.n + "</small>" : "") +
          "</div>";
      }).join("") + "</div></div>";
  }
  function renderProfilo() {
    var done = LN.TAPPE.filter(function (t) { return S.completata(t.key); }).length;
    var stars = LN.TAPPE.reduce(function (a, t) { return a + S.best(t.key).stars; }, 0);
    var acc = LN.account, doc = acc.ruolo === "docente";
    var nome = doc ? "Prof. Marano" : esc(acc.profilo ? acc.profilo.username : "Ospite");
    var info = doc
      ? "Qui giochi in prova: i tuoi risultati restano su questo dispositivo e non entrano nelle classifiche. Gli studenti li segui dalla sezione Docente."
      : "Classe " + esc(acc.profilo && acc.profilo.classe || "–") + ". I tuoi progressi sono salvati online: ti seguono su ogni computer, tablet o telefono.";
    $("#profilo").innerHTML =
      '<div class="profile-head">' + LN.gufo("ciao") + "<div><h1>" + nome + "</h1><p>" + info + '</p><button class="btn3d" id="logoutBtn">Esci</button></div></div>' +
      '<div class="ptiles">' +
      '<div class="ptile"><span style="color:var(--flame)">' + ICON.flame + "</span><b>" + S.serieAttuale() + "</b><span>Giorni di fila</span></div>" +
      '<div class="ptile"><span style="color:var(--gem)">' + ICON.gem + "</span><b>" + S.state.xp + "</b><span>XP totali</span></div>" +
      '<div class="ptile"><span style="color:var(--ok)">' + ICON.check + "</span><b>" + done + "/" + LN.TAPPE.length + "</b><span>Tappe superate</span></div>" +
      '<div class="ptile"><span style="color:var(--accent)">' + ICON.star + "</span><b>" + stars + "/" + LN.TAPPE.length * 3 + "</b><span>Stelle</span></div></div>" +
      sezioneMedaglie() +
      '<div class="settings"><h2>Impostazioni</h2>' +
      '<div class="set-row"><span class="lbl">Nomi delle note</span>' + seg("names", [["it", "Do Re Mi"], ["en", "C D E"]], S.set.names) + "</div>" +
      '<div class="set-row"><span class="lbl">Suono del clarinetto</span>' + seg("sound", [["true", "Sì"], ["false", "No"]], S.set.sound) + "</div>" +
      '<div class="set-row"><span class="lbl">Rispondi alle note con<span class="desc">La tastiera mostra il pianoforte al posto dei pulsanti.</span></span>' + seg("mode", [["nomi", "Nomi"], ["tastiera", "Tastiera"]], S.set.mode) + "</div>" +
      (doc
        ? '<div class="set-row"><span class="lbl">Sblocca tutte le tappe<span class="desc">Per mostrarle in classe alla LIM.</span></span>' + seg("unlockAll", [["false", "No"], ["true", "Sì"]], S.set.unlockAll) + "</div>" +
          '<div class="set-row"><span class="lbl">Azzera le tue prove<span class="desc">Cancella XP, serie e stelle del profilo docente.</span></span><span id="resetBox"><button class="linkish" id="resetBtn">Azzera</button></span></div>'
        : "") +
      "</div>";
  }
  $("#profilo").addEventListener("click", function (e) {
    if (e.target.closest("#logoutBtn")) { e.target.closest("#logoutBtn").disabled = true; LN.account.esci(); return; }
    var b = e.target.closest("[data-set]");
    if (b) {
      var k = b.dataset.set, v = b.dataset.val;
      S.set[k] = v === "true" ? true : v === "false" ? false : v;
      S.salva(); renderProfilo(); return;
    }
    if (e.target.closest("#resetBtn")) {
      $("#resetBox").innerHTML = 'Sicuro? <button class="linkish" id="resetYes">Sì, azzera</button>';
      return;
    }
    if (e.target.closest("#resetYes")) { S.azzera(); renderProfilo(); updateChips(); toast("Progressi azzerati."); }
  });

  /* ---------- Navigazione ---------- */
  var VIEWS = ["accesso", "percorso", "classe", "lezioni", "profilo", "docente", "sessione", "esito"];
  var TABS = ["percorso", "classe", "lezioni", "profilo", "docente"];
  function show(v) {
    VIEWS.forEach(function (x) { $("#v-" + x).hidden = x !== v; });
    document.body.classList.toggle("in-sessione", v === "sessione");
    document.body.classList.toggle("no-auth", v === "accesso");
    $("#tab-docente").hidden = LN.account.ruolo !== "docente";
    TABS.forEach(function (x) {
      if (x === v) $("#tab-" + x).setAttribute("aria-current", "page"); else $("#tab-" + x).removeAttribute("aria-current");
    });
    if (v !== "sessione") $("#sheet").hidden = true;
    if (v === "percorso") renderPercorso();
    if (v === "lezioni") renderLesson();
    if (v === "profilo") renderProfilo();
    if (v === "docente") LN.docente.carica();
    if (v === "classe") LN.classe.carica();
    if (TABS.indexOf(v) > -1) { try { history.replaceState(null, "", "#" + v); } catch (e) {} }
    if (v !== "accesso") updateChips();
    window.scrollTo({ top: 0 });
  }
  document.querySelectorAll(".tab").forEach(function (b) { b.addEventListener("click", function () { show(b.dataset.view); }); });

  /* ---------- Accesso ---------- */
  function entra() {
    var h = location.hash.slice(1);
    var ok = ["classe", "lezioni", "profilo"].concat(LN.account.ruolo === "docente" ? ["docente"] : []);
    show(ok.indexOf(h) > -1 ? h : LN.account.ruolo === "docente" ? "docente" : "percorso");
  }
  function mostraAccesso(docente) {
    $("#loginOwl").innerHTML = LN.gufo(docente ? "pensa" : "ciao");
    $("#loginForm").hidden = !!docente;
    $("#teacherForm").hidden = !docente;
    show("accesso");
    (docente ? $("#tEmail") : $("#lUser")).focus();
  }
  $("#lShow").addEventListener("click", function () {
    var p = $("#lPass"), vis = p.type === "password";
    p.type = vis ? "text" : "password"; this.textContent = vis ? "Nascondi" : "Mostra";
  });
  $("#loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    var u = $("#lUser").value.trim(), p = $("#lPass").value;
    if (!u || !p) { $("#lErr").textContent = "Scrivi nome utente e password."; return; }
    $("#lErr").textContent = ""; $("#lGo").disabled = true; $("#lGo").textContent = "Accesso…";
    try { await LN.account.accedi(u, p); $("#lPass").value = ""; entra(); }
    catch (err) { $("#lErr").textContent = err.message; $("#loginOwl").innerHTML = LN.gufo("incoraggia"); }
    $("#lGo").disabled = false; $("#lGo").textContent = "Entra";
  });
  $("#teacherForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    var em = $("#tEmail").value.trim(), p = $("#tPass").value, p2 = $("#tPass2").value;
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { $("#tErr").textContent = "Scrivi un indirizzo email valido."; return; }
    if (p.length < 10) { $("#tErr").textContent = "La password deve avere almeno 10 caratteri."; return; }
    if (p !== p2) { $("#tErr").textContent = "Le due password non coincidono."; return; }
    $("#tErr").textContent = ""; $("#tGo").disabled = true;
    try {
      await LN.account.creaDocente(em, p);
      $("#teacherForm").innerHTML = "<h1>Account creato</h1><p>Ora va attivato come docente: è un'operazione da fare una sola volta. Dopo l'attivazione potrai entrare dalla pagina principale con la tua email e la tua password.</p>";
      $("#loginOwl").innerHTML = LN.gufo("festa");
    } catch (err) { $("#tErr").textContent = err.message; $("#tGo").disabled = false; }
  });

  (async function avvio() {
    $("#loginOwl").innerHTML = LN.gufo("ciao");
    if (location.hash === "#crea-docente") { try { await LN.account.init(); } catch (e) {} mostraAccesso(true); return; }
    try {
      var ruolo = await LN.account.init();
      if (ruolo) entra(); else mostraAccesso(false);
    } catch (e) {
      mostraAccesso(false);
      $("#lErr").textContent = LN.account.traduci(e);
    }
  })();
})(window.LN);
