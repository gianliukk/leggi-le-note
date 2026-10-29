/* Sezione "Classe": lega della settimana, bonus continuità e progressi dei compagni. */
window.LN = window.LN || {};
(function (LN) {
  "use strict";
  var A = LN.account, S = LN.store;
  function $(s) { return document.querySelector(s); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function molt(x) { return "×" + String(x).replace(".", ","); }
  var FLAME = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.5 2c.6 3.6 6.5 5.6 6.5 12a7 7 0 0 1-14 0c0-3.2 1.9-5.4 3.3-6.6.1 2 1 3.3 2.3 3.6C10.3 7.6 10.8 4.6 12.5 2z" fill="currentColor"/></svg>';
  var GEM = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 3h11l4.5 6.2L12 21 2 9.2z" fill="currentColor"/></svg>';

  function avatar(nome) {
    var h = 0; for (var i = 0; i < nome.length; i++) h = (h * 31 + nome.charCodeAt(i)) >>> 0;
    var c = h % 4;
    return '<span class="av" style="background:var(--u' + c + ');box-shadow:0 3px 0 var(--u' + c + 's)" aria-hidden="true">' + esc(nome.charAt(0).toUpperCase()) + "</span>";
  }
  function giorniAllaFine() {
    var d = new Date().getDay(); // 0 = domenica
    return d === 0 ? 1 : 8 - d;
  }

  var TROFEO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10v3h3v2a4 4 0 0 1-4 4h-.4A5 5 0 0 1 13 14.9V18h3v3H8v-3h3v-3.1A5 5 0 0 1 8.4 12H8a4 4 0 0 1-4-4V6h3zm-1 5a2 2 0 0 0 1 1.7V8zm12 0h-1v1.7A2 2 0 0 0 18 8z" fill="currentColor"/></svg>';

  var SCUDO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l8 3v6c0 5-3.4 9.3-8 11-4.6-1.7-8-6-8-11V5z" fill="currentColor"/><path d="M13.2 6.5v7.2a2.3 2.3 0 1 1-1.3-2.1V6.5z" fill="#FFFFFF"/></svg>';
  /* Leghe a livelli: i nomi dei tempi musicali, dal più lento al più veloce. */
  var LEGHE = [null, { nome: "Andante", col: "var(--u0)" }, { nome: "Allegro", col: "var(--u2)" }, { nome: "Presto", col: "#C08F00" }];
  function quanti(n) { return n >= 9 ? 3 : n >= 6 ? 2 : n >= 2 ? 1 : 0; } // come leghe_quanti in 08_leghe.sql

  var filtro = "tutti", dati = [], leghe = null, legaVista = 1;
  var modo = "settimana", storico = null, erroreStorico = "", aperto = null;

  function annoScolastico() {
    var d = new Date(), a = d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1;
    return a + "/" + String((a + 1) % 100).padStart(2, "0");
  }
  function data(s) {
    if (!s) return "";
    var p = String(s).split("-");
    return p[2] + "/" + p[1] + "/" + p[0];
  }
  function num(n) { return Number(n || 0).toLocaleString("it-IT"); }

  /* ---------- Missione di classe: un traguardo di XP da raggiungere tutti insieme entro domenica ---------- */
  var XP_A_TESTA = 100, XP_MINIMO = 300, cache = null;
  function lunedi() {
    var d = new Date(), g = (d.getDay() + 6) % 7; d.setDate(d.getDate() - g);
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function stato(lista, classe) {
    var membri = lista.filter(function (r) { return r.classe === classe; });
    var xp = membri.reduce(function (a, r) { return a + Number(r.xp_settimana || 0); }, 0);
    var obiettivo = Math.max(XP_MINIMO, membri.length * XP_A_TESTA);
    return { classe: classe, n: membri.length, attivi: membri.filter(function (r) { return Number(r.xp_settimana) > 0; }).length, xp: xp, obiettivo: obiettivo, fatta: xp >= obiettivo };
  }
  function classiDi(lista) {
    var c = [];
    lista.forEach(function (r) { if (r.classe && r.classe !== "Ex studenti" && c.indexOf(r.classe) < 0) c.push(r.classe); });
    return c.sort();
  }
  function barra(st, mia) {
    var pct = Math.min(100, Math.round(st.xp / st.obiettivo * 100)), g = giorniAllaFine();
    return '<div class="mc-classe' + (st.fatta ? " fatta" : "") + '">' +
      (mia ? "" : "<b>" + esc(st.classe) + "</b>") +
      '<div class="mc-bar" role="img" aria-label="' + num(st.xp) + " XP su " + num(st.obiettivo) + '"><i style="width:' + pct + '%"></i></div>' +
      '<div class="mc-num"><span><b>' + num(st.xp) + "</b> / " + num(st.obiettivo) + " XP</span><span>" +
      (st.fatta ? "Traguardo raggiunto!" : "mancano " + num(st.obiettivo - st.xp) + " XP · " + (g === 1 ? "ultimo giorno" : g + " giorni") ) + "</span></div>" +
      '<small class="muted">' + st.attivi + " su " + st.n + (st.n === 1 ? " studente ha" : " studenti hanno") + " già giocato questa settimana</small></div>";
  }
  /* Premio: una corona a testa, una volta a settimana, quando la propria classe arriva al traguardo. */
  function premia(st) {
    var sett = lunedi();
    if (!st.fatta || S.state.classeVinta === sett) return false;
    S.state.classeVinta = sett;
    var data = S.state.stat = S.state.stat || {};
    data.missioniClasse = (data.missioniClasse || 0) + 1;
    var corona = S.corone() < S.CORONE_MAX;
    if (corona) S.state.corone = S.corone() + 1;
    S.salva();
    return { corona: corona };
  }
  function cartaMissione(lista) {
    var doc = A.ruolo === "docente", mia = A.ruolo === "studente" ? A.profilo.classe : null;
    var head = '<div class="miss-head"><div><div class="eyebrow">Questa settimana</div><h2>Missione di classe</h2></div></div>';
    if (doc) {
      var cl = classiDi(lista);
      if (!cl.length) return "";
      return '<section class="missioni mc">' + head + '<p class="miss-nota">Ogni classe ha un traguardo di XP da raggiungere tutta insieme entro domenica: ' + XP_A_TESTA + " XP per studente (almeno " + XP_MINIMO + "). Chi arriva al traguardo riceve una corona.</p>" +
        cl.map(function (c) { return barra(stato(lista, c), false); }).join("") + "</section>";
    }
    if (!mia || mia === "Ex studenti") return "";
    var st = stato(lista, mia);
    return '<section class="missioni mc">' + head.replace("<h2>Missione di classe</h2>", "<h2>Missione della " + esc(mia) + "</h2>") +
      "<p>Tutta la classe insieme deve arrivare a <b>" + num(st.obiettivo) + " XP</b> entro domenica. Ogni tappa che giochi conta per tutti.</p>" +
      barra(st, true) +
      '<p class="miss-nota">' + (st.fatta ? (S.state.classeVinta === lunedi() ? "Missione compiuta: hai ricevuto il premio di questa settimana." : "Missione compiuta!") : "Premio: se la classe arriva al traguardo, ognuno riceve una corona \u{1D110}, che salva la serie se salti un giorno.") + "</p></section>";
  }
  /* Riquadro nel percorso: si riempie quando arrivano i dati (al massimo una richiesta al minuto). */
  async function missionePercorso(box) {
    if (!box || A.ruolo !== "studente") return;
    try {
      if (!cache || Date.now() - cache.t > 60000) cache = { t: Date.now(), dati: await A.compagni() };
      var p = premia(stato(cache.dati, A.profilo.classe));
      box.innerHTML = cartaMissione(cache.dati);
      if (p && LN.avvisa) LN.avvisa(p.corona ? "La tua classe ha completato la missione: hai guadagnato una corona!" : "La tua classe ha completato la missione! Hai già il massimo di corone.");
    } catch (e) { box.innerHTML = ""; }
  }

  async function carica() {
    var box = $("#classe");
    box.innerHTML = '<p class="muted">Caricamento della classe…</p>';
    try {
      var r = await Promise.all([A.compagni(), A.leghe().catch(function () { return null; })]);
      dati = r[0]; leghe = r[1]; storico = null;
      render();
      if (modo !== "settimana") caricaStorico();
    }
    catch (e) { box.innerHTML = '<p class="err">' + esc(e.message) + "</p>"; }
  }

  async function caricaStorico() {
    erroreStorico = "";
    try { storico = await A.storico(); }
    catch (e) { storico = null; erroreStorico = e.message; }
    render();
  }

  function riga(r, pos, xp, isMe, extra) {
    return '<span class="pos' + (pos <= 3 && xp > 0 ? " m" + pos : "") + '">' + pos + "</span>" + avatar(r.username) +
      '<span class="lega-nome"><b>' + esc(r.username) + "</b>" + (isMe ? ' <span class="tu">tu</span>' : "") + "<small>" + esc(r.classe || "") + "</small></span>" +
      '<span class="lega-xp"><span class="gem">' + GEM + "</span>" + num(xp) + " XP" + (extra || "") + "</span>";
  }

  function legaSettimana(me, g) {
    return leghe ? legaLivelli(me, g) : legaUnica(me, g);
  }

  /* Ognuno vede la propria lega; il docente può sfogliarle tutte e tre. */
  function legaLivelli(me, g) {
    var mio = me && leghe.find(function (r) { return r.username === me; });
    var liv = mio ? mio.livello : legaVista, L = LEGHE[liv];
    var membri = leghe.filter(function (r) { return r.livello === liv; })
      .sort(function (a, b) { return b.xp_settimana - a.xp_settimana || a.username.localeCompare(b.username); });
    var n = membri.length, k = quanti(n), su = liv < 3 ? k : 0, giu = liv > 1 ? k : 0;

    var html = '<div class="leghe-scudi">' + [1, 2, 3].map(function (i) {
      var on = i === liv, quanti_i = leghe.filter(function (r) { return r.livello === i; }).length;
      var inner = '<span class="scudo" style="color:' + LEGHE[i].col + '">' + SCUDO + "</span><b>" + LEGHE[i].nome + "</b>" +
        (mio ? "" : "<small>" + quanti_i + (quanti_i === 1 ? " studente" : " studenti") + "</small>");
      return mio ? '<div class="scudo-box' + (on ? " on" : "") + '">' + inner + "</div>"
        : '<button class="scudo-box' + (on ? " on" : "") + '" data-lega="' + i + '" aria-pressed="' + on + '">' + inner + "</button>";
    }).join("") + "</div>";

    var regola = [];
    if (su) regola.push((su === 1 ? "il primo sale" : "i primi " + su + " salgono") + " in " + LEGHE[liv + 1].nome);
    if (giu) regola.push((giu === 1 ? "l’ultimo scende" : "gli ultimi " + giu + " scendono") + " in " + LEGHE[liv - 1].nome);
    html += '<div class="head-block"><div class="eyebrow">Lega della settimana</div><h1>Lega ' + L.nome + "</h1>" +
      '<p class="muted">Conta gli XP guadagnati da lunedì. Domenica a mezzanotte la lega si chiude' +
      (regola.length ? ": " + regola.join(", ") + "." : ".") +
      (su ? " Per salire serve almeno 1 XP." : "") + "</p>" +
      '<span class="lega-chip">' + (g === 1 ? "Ultimo giorno: dai il massimo!" : "Mancano " + g + " giorni alla fine") + "</span></div>";

    if (mio && mio.esito) {
      var pos = mio.posizione + "° posto";
      html += mio.esito === "su" ? '<p class="lega-esito su">La settimana scorsa: ' + pos + " e promozione nella lega " + LEGHE[liv].nome + "!</p>"
        : mio.esito === "giu" ? '<p class="lega-esito giu">La settimana scorsa: ' + pos + " e retrocessione nella lega " + LEGHE[liv].nome + ". Questa settimana puoi risalire!</p>"
        : '<p class="lega-esito">La settimana scorsa: ' + pos + " nella lega " + LEGHE[liv].nome + ".</p>";
    }

    if (!n) return html + '<p class="muted">In questa lega non c\'è ancora nessuno.</p>';
    return html + '<ol class="lega">' + membri.map(function (r, i) {
      var isMe = r.username === me, zona = i < su ? " su" : i >= n - giu ? " giu" : "";
      var sep = su && i === su ? '<li class="lega-sep su">' + SU + "Zona promozione</li>" : "";
      if (giu && i === n - giu) sep += '<li class="lega-sep giu">' + GIU + "Zona retrocessione</li>";
      return sep + '<li class="lega-row' + zona + (isMe ? " me" : "") + (r.xp_settimana === 0 ? " zero" : "") + '">' + riga(r, i + 1, r.xp_settimana, isMe) + "</li>";
    }).join("") + "</ol>";
  }
  var SU = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5l7 8h-4.5v6h-5v-6H5z" fill="currentColor"/></svg>';
  var GIU = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19l-7-8h4.5V5h5v6H19z" fill="currentColor"/></svg>';

  /* Lega unica, finché lo script delle leghe a livelli non è attivo. */
  function legaUnica(me, g) {
    var lega = dati.slice().sort(function (a, b) { return b.xp_settimana - a.xp_settimana || a.username.localeCompare(b.username); });
    var html = '<div class="head-block"><div class="eyebrow">Lega della settimana</div><h1>Chi suona di più?</h1>' +
      '<p class="muted">Conta gli XP guadagnati da lunedì. Domenica a mezzanotte la lega si chiude e lunedì si riparte tutti da zero.</p>' +
      '<span class="lega-chip">' + (g === 1 ? "Ultimo giorno: dai il massimo!" : "Mancano " + g + " giorni alla fine") + "</span></div>";
    return html + '<ol class="lega">' + lega.map(function (r, i) {
      var isMe = r.username === me;
      return '<li class="lega-row' + (isMe ? " me" : "") + (r.xp_settimana === 0 ? " zero" : "") + '">' + riga(r, i + 1, r.xp_settimana, isMe) + "</li>";
    }).join("") + "</ol>";
  }

  /* Classifica dell'anno scolastico o di sempre: non si azzera mai. Toccando un nome si apre il suo storico. */
  function legaStorica(me) {
    var sempre = modo === "sempre";
    var html = '<div class="head-block"><div class="eyebrow">' + (sempre ? "Classifica di sempre" : "Anno scolastico " + annoScolastico()) + "</div>" +
      "<h1>" + (sempre ? "Chi ha suonato di più?" : "Il campione dell'anno") + "</h1>" +
      '<p class="muted">' + (sempre
        ? "Tutti gli XP raccolti dal primo allenamento, anno dopo anno. Questa classifica non si azzera mai: ogni allenamento resta."
        : "Gli XP raccolti dal 1° settembre. La classifica dell'anno riparte il 1° settembre, ma i punti restano nella classifica di sempre.") +
      " Tocca un nome per vedere il suo storico.</p></div>";
    if (erroreStorico) return html + '<p class="err">' + esc(erroreStorico) + "</p>";
    if (!storico) return html + '<p class="muted">Caricamento della classifica…</p>';

    var campo = sempre ? "xp_totale" : "xp_anno";
    var lista = storico.filter(function (r) { return sempre || r.classe !== "Ex studenti" || r[campo] > 0; })
      .sort(function (a, b) { return b[campo] - a[campo] || a.username.localeCompare(b.username); });
    if (!lista.length) return html + '<p class="muted">Nessuno studente ancora registrato.</p>';

    return html + '<ol class="lega">' + lista.map(function (r, i) {
      var isMe = r.username === me, open = aperto === r.username, xp = Number(r[campo]);
      var coppe = r.settimane_vinte > 0 ? '<span class="coppe" title="Settimane vinte">' + TROFEO + r.settimane_vinte + "</span>" : "";
      return '<li class="lega-item' + (isMe ? " me" : "") + (xp === 0 ? " zero" : "") + '">' +
        '<button class="lega-row lega-btn" data-storico="' + esc(r.username) + '" aria-expanded="' + open + '">' + riga(r, i + 1, xp, isMe, coppe) + "</button>" +
        (open ? dettaglio(r) : "") + "</li>";
    }).join("") + "</ol>";
  }

  function dettaglio(r) {
    if (!r.tappe) return '<div class="storico"><p class="muted">Non ha ancora giocato nessuna tappa.</p></div>';
    var anni = r.anni || [], max = Math.max.apply(null, anni.map(function (a) { return a.xp; }).concat([1]));
    return '<div class="storico">' +
      '<div class="storico-num">' +
        '<div><b>' + num(r.xp_totale) + "</b><span>XP di sempre</span></div>" +
        '<div><b>' + num(r.giorni) + "</b><span>" + (r.giorni == 1 ? "giorno" : "giorni") + " di pratica</span></div>" +
        '<div><b>' + num(r.tappe) + "</b><span>tappe giocate</span></div>" +
        '<div><b>' + num(r.settimane_vinte) + "</b><span>" + (r.settimane_vinte == 1 ? "settimana vinta" : "settimane vinte") + "</span></div>" +
        '<div><b>' + num(r.record_settimana) + "</b><span>record in una settimana</span></div>" +
      "</div>" +
      '<div class="storico-anni"><div class="eyebrow">Anno per anno</div>' + anni.map(function (a) {
        return '<div class="anno-row"><span>' + esc(a.anno) + '</span><span class="anno-bar"><i style="width:' + Math.max(2, Math.round(a.xp / max * 100)) + '%"></i></span><b>' + num(a.xp) + " XP</b></div>";
      }).join("") + "</div>" +
      '<p class="muted small">Si allena con Leggi le note dal ' + data(r.dal) + ".</p></div>";
  }

  function render() {
    var me = A.ruolo === "studente" ? A.profilo.username : null;
    var miaClasse = A.ruolo === "studente" ? A.profilo.classe : null;
    var g = giorniAllaFine();

    var pr = A.ruolo === "studente" && premia(stato(dati, miaClasse));
    if (pr && LN.avvisa) setTimeout(function () { LN.avvisa(pr.corona ? "La tua classe ha completato la missione: hai guadagnato una corona!" : "La tua classe ha completato la missione! Hai già il massimo di corone."); }, 0);
    var html = cartaMissione(dati) + '<div class="seg seg-lega" role="group" aria-label="Classifica">' +
      [["settimana", "Settimana"], ["anno", "Anno scolastico"], ["sempre", "Di sempre"]].map(function (m) {
        return '<button data-modo="' + m[0] + '" aria-pressed="' + (modo === m[0]) + '">' + m[1] + "</button>";
      }).join("") + "</div>";
    html += modo === "settimana" ? legaSettimana(me, g) : legaStorica(me);

    // Bonus continuità
    var serie = S.serieAttuale(), m = S.moltiplicatore(serie), next = S.prossimaSoglia(serie);
    html += '<div class="bonus-card"><h2>Bonus continuità</h2><p class="muted">Gioca tutti i giorni: più lunga è la serie, più XP vale ogni tappa. Se salti un giorno, la serie riparte da capo.</p>' +
      '<div class="soglie">' + S.SOGLIE.slice().reverse().map(function (s) {
        var raggiunta = me && serie >= s[0];
        return '<div class="soglia' + (raggiunta ? " on" : "") + '"><span class="fl">' + FLAME + "</span><b>" + s[0] + " giorni</b><span>XP " + molt(s[1]) + "</span></div>";
      }).join("") + "</div>" +
      (me ? '<p class="bonus-me">' + (serie ? "La tua serie: <b>" + serie + (serie === 1 ? " giorno" : " giorni") + "</b>" + (m > 1 ? ", bonus attuale <b>XP " + molt(m) + "</b>" : "") + "." : "Oggi non hai ancora giocato: fai una tappa per accendere la fiamma.") +
        (next ? " Ancora " + next.mancano + (next.mancano === 1 ? " giorno" : " giorni") + " di fila per XP " + molt(next.molt) + "." : " Hai il bonus massimo: continua così!") + "</p>" : "") +
      '<div class="corone-box"><span class="corona-grande" aria-hidden="true">\u{1D110}</span><div><b>Le corone</b>' +
      "<p class=\"muted\">Sul pentagramma la corona allunga una nota; qui allunga la serie. Ogni " + S.CORONA_OGNI + " giorni di fila ne guadagni una (al massimo " + S.CORONE_MAX + "): se salti un giorno, una corona tiene viva la serie.</p>" +
      (me ? "<p>Le tue corone: <b>" + S.corone() + " su " + S.CORONE_MAX + "</b>.</p>" : "") + "</div></div>" +
      "</div>";

    // Compagni
    var lista = dati.filter(function (r) { return filtro === "tutti" || r.classe === miaClasse; })
      .sort(function (a, b) { return b.serie - a.serie || b.xp - a.xp || a.username.localeCompare(b.username); });
    html += '<div class="comp-head"><h2>I compagni</h2>' +
      (miaClasse ? '<div class="seg" role="group" aria-label="Filtra"><button data-filtro="tutti" aria-pressed="' + (filtro === "tutti") + '">Tutti</button><button data-filtro="classe" aria-pressed="' + (filtro === "classe") + '">La mia classe</button></div>' : "") + "</div>";
    var tot = LN.TAPPE.length;
    html += '<div class="comp-grid">' + lista.map(function (r) {
      var isMe = r.username === me;
      return '<div class="comp' + (isMe ? " me" : "") + '">' + avatar(r.username) +
        '<div class="comp-main"><div class="comp-name"><b>' + esc(r.username) + "</b>" + (isMe ? ' <span class="tu">tu</span>' : "") + "<small>" + esc(r.classe || "") + "</small></div>" +
        '<div class="comp-stats"><span class="st' + (r.oggi ? " acceso" : "") + '" title="Giorni di fila">' + FLAME + r.serie + "</span>" +
        '<span class="st gemst" title="XP totali">' + GEM + r.xp + "</span>" +
        (r.oggi ? '<span class="oggi">ha giocato oggi</span>' : "") + "</div>" +
        '<div class="comp-bar" title="Tappe superate"><i style="width:' + Math.round(r.tappe / tot * 100) + '%"></i></div>' +
        '<small class="muted">' + r.tappe + " tappe su " + tot + "</small></div></div>";
    }).join("") + "</div>";
    if (!dati.length) html += '<p class="muted">Nessuno studente ancora registrato.</p>';
    $("#classe").innerHTML = html;
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-filtro]");
    if (b && $("#classe").contains(b)) { filtro = b.dataset.filtro; render(); return; }
    var lg = e.target.closest("[data-lega]");
    if (lg && $("#classe").contains(lg)) { legaVista = +lg.dataset.lega; render(); return; }
    var m = e.target.closest("[data-modo]");
    if (m && $("#classe").contains(m)) {
      modo = m.dataset.modo; aperto = null; render();
      if (modo !== "settimana" && !storico) caricaStorico();
      return;
    }
    var s = e.target.closest("[data-storico]");
    if (s && $("#classe").contains(s)) { aperto = aperto === s.dataset.storico ? null : s.dataset.storico; render(); }
  });

  LN.classe = { carica: carica, missionePercorso: missionePercorso };
})(window.LN);
