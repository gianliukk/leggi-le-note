/* Area docente: crea gli account, segui i progressi, reimposta le password, stampa i bigliettini. */
window.LN = window.LN || {};
(function (LN) {
  "use strict";
  var A = LN.account;
  function $(s) { return document.querySelector(s); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function data(iso) { return iso ? new Date(iso).toLocaleDateString("it-IT", { day: "numeric", month: "short" }) : "mai"; }

  var classi = [], studenti = [], nuove = []; // nuove = credenziali appena create, da stampare

  function tappeSuperate(p) {
    if (!p || !p.dati || !p.dati.best) return 0;
    return LN.TAPPE.filter(function (t) { var b = p.dati.best[t.key]; return b && b.stars >= 2; }).length;
  }
  function nomeClasse(id) { var c = classi.find(function (x) { return x.id === id; }); return c ? c.nome : "–"; }

  async function carica() {
    $("#docente").innerHTML = '<p class="muted">Caricamento…</p>';
    try {
      classi = await A.classi();
      studenti = await A.studenti();
      render();
    } catch (e) {
      $("#docente").innerHTML = '<p class="err">' + esc(e.message) + "</p>";
    }
  }

  function render() {
    var filtro = $("#dClasse") ? $("#dClasse").value : "";
    var lista = studenti.filter(function (s) { return !filtro || s.classe_id === filtro; });
    var righe = lista.map(function (s) {
      var p = s.p || {};
      return "<tr><td class=\"who\">" + esc(s.username) + "</td><td>" + esc(nomeClasse(s.classe_id)) + "</td>" +
        '<td class="num">' + (p.xp || 0) + '</td><td class="num">' + tappeSuperate(p) + "/" + LN.TAPPE.length + "</td>" +
        '<td class="num">' + (p.serie || 0) + '</td><td class="num">' + data(p.aggiornato) + "</td>" +
        '<td class="num"><span class="pw-slot" data-pw="' + esc(s.username) + '"><button class="linkish" data-reset="' + esc(s.username) + '">Nuova password</button></span></td></tr>';
    }).join("");

    $("#docente").innerHTML =
      '<div class="head-block"><div class="eyebrow">Area docente</div><h1>I tuoi studenti</h1>' +
      '<p class="muted">' + studenti.length + " account attivi in " + classi.length + " classi. Gli studenti vedono solo i propri progressi; le classifiche mostrano soltanto i nomi utente.</p></div>" +

      '<div class="card"><div class="card-head"><h2>Progressi</h2>' +
      '<label class="check">Classe <select class="field" id="dClasse"><option value="">Tutte</option>' +
      classi.map(function (c) { return '<option value="' + c.id + '"' + (c.id === filtro ? " selected" : "") + ">" + esc(c.nome) + "</option>"; }).join("") +
      "</select></label></div>" +
      (lista.length
        ? '<div class="tbl-wrap"><table class="board"><thead><tr><th>Nome utente</th><th>Classe</th><th class="num">XP</th><th class="num">Tappe</th><th class="num">Serie</th><th class="num">Ultima attività</th><th class="num">Accesso</th></tr></thead><tbody>' + righe + "</tbody></table></div>"
        : '<p class="muted pad">Nessuno studente ancora. Crea gli account qui sotto.</p>') +
      "</div>" +

      '<div class="card"><div class="card-head"><h2>Crea account</h2></div><div class="pad grid-gap">' +
      '<p class="muted">Scrivi uno studente per riga: nome utente, punto e virgola, classe. Esempio: <code>lucia.l;1AL</code>. Usa solo minuscole, numeri e punti, senza cognomi completi. La password viene generata in automatico.</p>' +
      '<textarea class="field" id="dNuovi" rows="7" placeholder="salvatore.d;1AF&#10;michela.i;1AF"></textarea>' +
      '<div class="btn-row"><button class="btn3d primary" id="dCrea">Crea account</button><span class="muted" id="dStato" role="status"></span></div>' +
      '<div id="dEsito"></div></div></div>';

    $("#dClasse").addEventListener("change", render);
    renderEsito();
  }

  function renderEsito() {
    var box = $("#dEsito"); if (!box) return;
    if (!nuove.length) { box.innerHTML = ""; return; }
    box.innerHTML = '<div class="note-warn"><strong>Le password si vedono solo adesso.</strong> Stampa i bigliettini prima di lasciare la pagina; se una password va persa, puoi sempre crearne una nuova dalla tabella.</div>' +
      '<div class="tbl-wrap"><table class="board"><thead><tr><th>Nome utente</th><th>Classe</th><th>Password</th><th>Esito</th></tr></thead><tbody>' +
      nuove.map(function (n) { return '<tr><td class="who">' + esc(n.username) + "</td><td>" + esc(n.classe) + '</td><td><code>' + (n.ok ? esc(n.password) : "–") + "</code></td><td>" + (n.ok ? "Creato" : '<span class="err">' + esc(n.errore) + "</span>") + "</td></tr>"; }).join("") +
      '</tbody></table></div><div class="btn-row"><button class="btn3d" id="dStampa">Stampa i bigliettini</button></div>';
  }

  async function creaTutti() {
    var righe = $("#dNuovi").value.split(/\r?\n/).map(function (r) { return r.trim(); }).filter(Boolean);
    if (!righe.length) { $("#dStato").textContent = "Scrivi almeno una riga."; return; }
    var btn = $("#dCrea"); btn.disabled = true;
    nuove = [];
    for (var i = 0; i < righe.length; i++) {
      var parti = righe[i].split(/[;,\t]/).map(function (x) { return x.trim(); });
      var username = (parti[0] || "").toLowerCase(), cl = (parti[1] || "").toUpperCase();
      var classe = classi.find(function (c) { return c.nome.toUpperCase() === cl; });
      var voce = { username: username, classe: cl, password: A.generaPassword(), ok: false, errore: "" };
      $("#dStato").textContent = "Creo " + (i + 1) + " di " + righe.length + "…";
      if (!/^[a-z0-9._-]{3,30}$/.test(username)) voce.errore = "Nome utente non valido (3-30 caratteri: minuscole, numeri, punto).";
      else if (!classe) voce.errore = "Classe «" + cl + "» non trovata.";
      else {
        try { await A.creaStudente(username, classe.id, voce.password); voce.ok = true; }
        catch (e) { voce.errore = e.message; }
      }
      nuove.push(voce);
      renderEsito();
    }
    var ok = nuove.filter(function (n) { return n.ok; }).length;
    studenti = await A.studenti().catch(function () { return studenti; });
    var testo = $("#dNuovi").value;
    render();
    $("#dNuovi").value = testo;
    $("#dStato").textContent = ok + " account creati su " + righe.length + ".";
  }

  function stampa(voci) {
    var area = $("#printArea");
    area.innerHTML = voci.map(function (n) {
      return '<div class="slip"><div class="slip-owl">' + LN.gufo("ciao") + "</div><div>" +
        "<strong>Leggi le note</strong><span>" + esc(LN.CONFIG.sito) + "</span>" +
        "<span>Nome utente: <b>" + esc(n.username) + "</b></span><span>Password: <b>" + esc(n.password) + "</b></span>" +
        "<small>Classe " + esc(n.classe) + " · conserva questo foglietto</small></div></div>";
    }).join("");
    window.print();
  }

  document.addEventListener("click", async function (e) {
    if (!$("#v-docente") || $("#v-docente").hidden) return;
    if (e.target.closest("#dCrea")) { creaTutti(); return; }
    if (e.target.closest("#dStampa")) { stampa(nuove.filter(function (n) { return n.ok; })); return; }
    var r = e.target.closest("[data-reset]");
    if (r) {
      var u = r.dataset.reset, slot = r.parentNode;
      if (r.dataset.armed !== "1") { r.dataset.armed = "1"; r.textContent = "Conferma"; return; }
      var pw = A.generaPassword();
      slot.textContent = "…";
      try {
        await A.nuovaPassword(u, pw);
        var s = studenti.find(function (x) { return x.username === u; });
        slot.innerHTML = '<code>' + esc(pw) + '</code> <button class="linkish" data-slip="' + esc(u) + '" data-p="' + esc(pw) + '">Stampa</button>';
        slot.dataset.cl = s ? nomeClasse(s.classe_id) : "";
      } catch (err) { slot.innerHTML = '<span class="err">' + esc(err.message) + "</span>"; }
      return;
    }
    var sl = e.target.closest("[data-slip]");
    if (sl) stampa([{ username: sl.dataset.slip, password: sl.dataset.p, classe: sl.parentNode.dataset.cl || "" }]);
  });

  LN.docente = { carica: carica };
})(window.LN);
