/* Area docente: progressi, password (vedi, cambia, copia, stampa), creazione ed eliminazione degli studenti. */
window.LN = window.LN || {};
(function (LN) {
  "use strict";
  var A = LN.account;
  function $(s) { return document.querySelector(s); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function data(iso) { return iso ? new Date(iso).toLocaleDateString("it-IT", { day: "numeric", month: "short" }) : "mai"; }
  var toastT = null;
  function toast(msg) {
    var t = $("#toast"); t.textContent = msg; t.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(function () { t.hidden = true; }, 2600);
  }

  var classi = [], studenti = [], cred = {}, nuove = [];
  var filtro = "", mostra = false, editing = null, armato = null, lavoro = false;

  function tappeSuperate(p) {
    if (!p || !p.dati || !p.dati.best) return 0;
    return LN.TAPPE.filter(function (t) { var b = p.dati.best[t.key]; return b && b.stars >= 2; }).length;
  }
  function nomeClasse(id) { var c = classi.find(function (x) { return x.id === id; }); return c ? c.nome : "–"; }
  function visibili() { return studenti.filter(function (s) { return !filtro || s.classe_id === filtro; }); }
  function conPassword(lista) { return lista.filter(function (s) { return cred[s.username]; }); }
  function messaggio(s) {
    return "Leggi le note - https://" + LN.CONFIG.sito + "/\nNome utente: " + s.username + "\nPassword: " + cred[s.username].password;
  }

  async function carica() {
    $("#docente").innerHTML = '<p class="muted">Caricamento…</p>';
    try {
      var r = await Promise.all([A.classi(), A.studenti(), A.credenziali().catch(function () { return null; })]);
      classi = r[0]; studenti = r[1];
      if (r[2] === null) { cred = {}; render('<div class="note-warn"><strong>Manca un aggiornamento del database.</strong> Esegui in Supabase lo script <code>05_credenziali.sql</code> per vedere le password e poter eliminare gli studenti.</div>'); return; }
      cred = r[2];
      render();
    } catch (e) {
      $("#docente").innerHTML = '<p class="err">' + esc(e.message) + "</p>";
    }
  }

  function riga(s) {
    var p = s.p || {}, c = cred[s.username], u = esc(s.username);
    var pw = c ? (mostra ? "<code>" + esc(c.password) + "</code>" : '<span class="masked" title="Premi «Mostra le password»">••••••</span>')
      : '<span class="muted small">non salvata</span>';
    var del = armato === s.username
      ? '<button class="act danger" data-del="' + u + '">Conferma eliminazione</button><button class="act" data-undel="1">Annulla</button>'
      : '<button class="act danger-soft" data-arm="' + u + '">Elimina</button>';
    var sel = '<select class="field cls-sel" data-classe="' + u + '" aria-label="Classe di ' + u + '">' +
      classi.map(function (k) { return '<option value="' + esc(k.nome) + '"' + (k.id === s.classe_id ? " selected" : "") + ">" + esc(k.nome) + "</option>"; }).join("") + "</select>";
    var html = "<tr" + (editing === s.username ? ' class="editing"' : "") + '><td class="who">' + u + "</td><td>" + sel + "</td>" +
      '<td class="num">' + (p.xp || 0) + '</td><td class="num">' + tappeSuperate(p) + "/" + LN.TAPPE.length + "</td>" +
      '<td class="num">' + (p.serie || 0) + '</td><td class="num">' + data(p.aggiornato) + "</td>" +
      "<td>" + pw + "</td>" +
      '<td class="acts">' +
      (c ? '<button class="act" data-copy="' + u + '">Copia</button><button class="act" data-print="' + u + '">Stampa</button>' : "") +
      '<button class="act" data-edit="' + u + '">' + (c ? "Cambia" : "Crea password") + "</button>" + del + "</td></tr>";
    if (editing === s.username) {
      html += '<tr class="edit-row"><td colspan="8"><div class="pw-edit">' +
        '<label class="fld"><span>Nuova password per <b>' + u + "</b></span>" +
        '<input class="field" id="pwNew" maxlength="40" autocomplete="off" spellcheck="false" value="' + esc(A.generaPassword()) + '"></label>' +
        '<button class="btn3d" data-gen="1">Genera a caso</button>' +
        '<button class="btn3d primary" data-save="' + u + '">Salva</button>' +
        '<button class="btn-plain" data-cancel="1">Annulla</button>' +
        '<p class="muted small">Scrivi tu la password oppure usa quella proposta. Almeno 6 caratteri; meglio evitare lettere che si confondono, come l maiuscola e I.</p>' +
        "</div></td></tr>";
    }
    return html;
  }

  function render(avviso) {
    var lista = visibili(), conPw = conPassword(lista), senza = lista.length - conPw.length;
    $("#docente").innerHTML =
      '<div class="head-block"><div class="eyebrow">Area docente</div><h1>I tuoi studenti</h1>' +
      '<p class="muted">' + studenti.length + " account in " + classi.length + " classi. Gli studenti vedono solo i propri progressi; le classifiche mostrano soltanto i nomi utente.</p></div>" +
      (avviso || "") +

      '<div class="card"><div class="card-head"><h2>Studenti e password</h2>' +
      '<div class="tools"><label class="check">Classe <select class="field" id="dClasse"><option value="">Tutte</option>' +
      classi.map(function (c) { return '<option value="' + c.id + '"' + (c.id === filtro ? " selected" : "") + ">" + esc(c.nome) + "</option>"; }).join("") +
      '</select></label><button class="btn3d" id="dMostra">' + (mostra ? "Nascondi le password" : "Mostra le password") + "</button></div></div>" +

      '<div class="bulk"><span class="muted small">' + (filtro ? "Classe " + esc(nomeClasse(filtro)) : "Tutti gli studenti") + ":</span>" +
      '<button class="btn3d" id="dStampaTutti"' + (conPw.length ? "" : " disabled") + ">Stampa bigliettini (" + conPw.length + ")</button>" +
      '<button class="btn3d" id="dCopiaTutti"' + (conPw.length ? "" : " disabled") + ">Copia per messaggio (" + conPw.length + ")</button>" +
      (senza ? '<button class="btn3d primary" id="dRigenera">' + (armato === "*rigenera" ? "Confermi? Le vecchie password smetteranno di funzionare" : "Genera le password mancanti (" + senza + ")") + "</button>" : "") +
      "</div>" +
      (senza ? '<p class="muted small pad-x">Le password create prima di questo aggiornamento non sono recuperabili: per vederle, generane di nuove con il pulsante qui sopra oppure con «Crea password» sulla singola riga.</p>' : "") +

      (lista.length
        ? '<div class="tbl-wrap"><table class="board"><thead><tr><th>Nome utente</th><th>Classe</th><th class="num">XP</th><th class="num">Tappe</th><th class="num">Serie</th><th class="num">Ultima attività</th><th>Password</th><th>Azioni</th></tr></thead><tbody>' +
          lista.map(riga).join("") + "</tbody></table></div>"
        : '<p class="muted pad">Nessuno studente in questa classe.</p>') +
      '<div id="copyBox" hidden></div>' +
      "</div>" +

      '<div class="card"><div class="card-head"><h2>Crea account</h2></div><div class="pad grid-gap">' +
      '<p class="muted">Scrivi uno studente per riga: nome utente, punto e virgola, classe. Esempio: <code>lucia.l;1AL</code>. Usa solo minuscole, numeri e punti, senza cognomi completi. Per scegliere tu la password aggiungi un altro punto e virgola: <code>lucia.l;1AL;flauto123</code>.</p>' +
      '<textarea class="field" id="dNuovi" rows="6" placeholder="lucia.l;1AL"></textarea>' +
      '<div class="btn-row"><button class="btn3d primary" id="dCrea">Crea account</button><span class="muted" id="dStato" role="status"></span></div>' +
      '<div id="dEsito"></div></div></div>' +

      '<div class="card"><div class="card-head"><h2>Nuovo anno scolastico</h2></div><div class="pad grid-gap">' +
      '<p class="muted">A settembre sposta tutti gli studenti nella classe successiva: 1AF diventa 2AF, 2BF diventa 3BF. Chi era in terza passa tra gli «Ex studenti»: conserva account e progressi, ma esce dalla lega e dalla sezione Classe. Le classi nuove vengono create in automatico. Per un singolo studente usa invece il menu Classe nella tabella.</p>' +
      '<div class="btn-row"><button class="btn3d' + (armato === "*anno" ? " go-bad" : "") + '" id="dAnno">' + (armato === "*anno" ? "Confermi il passaggio d'anno per tutti?" : "Passaggio d'anno") + "</button>" +
      (armato === "*anno" ? '<button class="btn-plain" data-undel="1">Annulla</button>' : "") + "</div></div></div>";
    renderEsito();
  }

  function renderEsito() {
    var box = $("#dEsito"); if (!box || !nuove.length) return;
    box.innerHTML = '<div class="tbl-wrap"><table class="board"><thead><tr><th>Nome utente</th><th>Classe</th><th>Esito</th></tr></thead><tbody>' +
      nuove.map(function (n) { return '<tr><td class="who">' + esc(n.username) + "</td><td>" + esc(n.classe) + "</td><td>" + (n.ok ? "Creato: la password è nella tabella qui sopra" : '<span class="err">' + esc(n.errore) + "</span>") + "</td></tr>"; }).join("") +
      "</tbody></table></div>";
  }

  async function creaTutti() {
    var righe = $("#dNuovi").value.split(/\r?\n/).map(function (r) { return r.trim(); }).filter(Boolean);
    if (!righe.length) { $("#dStato").textContent = "Scrivi almeno una riga."; return; }
    $("#dCrea").disabled = true;
    nuove = [];
    for (var i = 0; i < righe.length; i++) {
      var parti = righe[i].split(/[;,\t]/).map(function (x) { return x.trim(); });
      var username = (parti[0] || "").toLowerCase(), cl = (parti[1] || "").toUpperCase(), pw = parti[2] || A.generaPassword();
      var classe = classi.find(function (c) { return c.nome.toUpperCase() === cl; });
      if (!classe && /^[1-3][A-Z]{1,3}$/.test(cl)) {
        try { classe = await A.nuovaClasse(cl); classi.push(classe); } catch (e) {}
      }
      var voce = { username: username, classe: cl, ok: false, errore: "" };
      $("#dStato").textContent = "Creo " + (i + 1) + " di " + righe.length + "…";
      if (!/^[a-z0-9._-]{3,30}$/.test(username)) voce.errore = "Nome utente non valido (3-30 caratteri: minuscole, numeri, punto).";
      else if (!classe) voce.errore = "Classe «" + cl + "» non valida: usa il formato 1AF, 2BF, 3AL.";
      else if (pw.length < 6) voce.errore = "La password deve avere almeno 6 caratteri.";
      else {
        try { await A.creaStudente(username, classe.id, pw); voce.ok = true; }
        catch (e) { voce.errore = e.message; }
      }
      nuove.push(voce);
    }
    var ok = nuove.filter(function (n) { return n.ok; }).length;
    var testo = $("#dNuovi").value;
    await carica();
    $("#dNuovi").value = ok === righe.length ? "" : testo;
    $("#dStato").textContent = ok + " account creati su " + righe.length + ".";
  }

  async function rigeneraMancanti() {
    if (lavoro) return;
    lavoro = true;
    var lista = visibili().filter(function (s) { return !cred[s.username]; }), fatti = 0;
    var btn = $("#dRigenera");
    for (var i = 0; i < lista.length; i++) {
      if (btn) btn.textContent = "Genero " + (i + 1) + " di " + lista.length + "…";
      try { await A.nuovaPassword(lista[i].username, A.generaPassword()); fatti++; } catch (e) {}
    }
    lavoro = false; armato = null; mostra = true;
    cred = await A.credenziali().catch(function () { return cred; });
    render();
    toast(fatti + " password generate. Ora puoi stamparle o copiarle.");
  }

  function stampa(lista) {
    var area = $("#printArea");
    area.innerHTML = lista.map(function (s) {
      return '<div class="slip"><div class="slip-owl">' + LN.gufo("ciao") + "</div><div>" +
        "<strong>Leggi le note</strong><span>" + esc(LN.CONFIG.sito) + "</span>" +
        "<span>Nome utente: <b>" + esc(s.username) + "</b></span><span>Password: <b>" + esc(cred[s.username].password) + "</b></span>" +
        "<small>Classe " + esc(nomeClasse(s.classe_id)) + " · conserva questo foglietto</small></div></div>";
    }).join("");
    window.print();
  }

  function copia(testo, quanti) {
    function fallback() {
      var box = $("#copyBox");
      box.hidden = false;
      box.innerHTML = '<div class="pad grid-gap"><p class="muted small">Copia questo testo con Ctrl+C e incollalo nel messaggio:</p><textarea class="field" rows="8" id="copyTxt" readonly></textarea></div>';
      var ta = $("#copyTxt"); ta.value = testo; ta.focus(); ta.select();
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(testo).then(function () {
        toast(quanti > 1 ? "Copiate le credenziali di " + quanti + " studenti: incollale nel messaggio." : "Copiato: incollalo nel messaggio.");
      }, fallback);
    } else fallback();
  }

  document.addEventListener("change", async function (e) {
    if (e.target.id === "dClasse") { filtro = e.target.value; editing = null; armato = null; render(); return; }
    var sel = e.target.closest && e.target.closest("[data-classe]");
    if (sel) {
      var u = sel.dataset.classe, nuova = sel.value;
      sel.disabled = true;
      try {
        await A.cambiaClasse(u, nuova);
        var k = classi.find(function (x) { return x.nome === nuova; }), st = studenti.find(function (x) { return x.username === u; });
        if (k && st) st.classe_id = k.id;
        toast(u + " ora è in " + nuova + ".");
      } catch (err) { toast(err.message); }
      render();
    }
  });
  document.addEventListener("click", async function (e) {
    if (!$("#v-docente") || $("#v-docente").hidden) return;
    var t = e.target, b;
    if (t.closest("#dCrea")) { creaTutti(); return; }
    if (t.closest("#dMostra")) { mostra = !mostra; render(); return; }
    if (t.closest("#dStampaTutti")) { stampa(conPassword(visibili())); return; }
    if (t.closest("#dCopiaTutti")) { var l = conPassword(visibili()); copia(l.map(messaggio).join("\n\n"), l.length); return; }
    if (t.closest("#dAnno")) {
      if (armato !== "*anno") { armato = "*anno"; render(); return; }
      t.closest("#dAnno").disabled = true;
      try { var n = await A.passaggioAnno(); armato = null; await carica(); toast("Passaggio d'anno fatto: " + n + " studenti spostati."); }
      catch (err) { armato = null; render(); toast(err.message); }
      return;
    }
    if (t.closest("#dRigenera")) {
      if (armato !== "*rigenera") { armato = "*rigenera"; render(); return; }
      rigeneraMancanti(); return;
    }
    if ((b = t.closest("[data-copy]"))) { var s = studenti.find(function (x) { return x.username === b.dataset.copy; }); copia(messaggio(s), 1); return; }
    if ((b = t.closest("[data-print]"))) { stampa(studenti.filter(function (x) { return x.username === b.dataset.print; })); return; }
    if ((b = t.closest("[data-edit]"))) { editing = b.dataset.edit; armato = null; render(); var inp = $("#pwNew"); if (inp) { inp.focus(); inp.select(); } return; }
    if (t.closest("[data-cancel]")) { editing = null; render(); return; }
    if (t.closest("[data-gen]")) { $("#pwNew").value = A.generaPassword(); return; }
    if ((b = t.closest("[data-save]"))) {
      var pw = $("#pwNew").value.trim(), u = b.dataset.save;
      if (pw.length < 6) { toast("La password deve avere almeno 6 caratteri."); return; }
      b.disabled = true;
      try {
        await A.nuovaPassword(u, pw);
        cred[u] = { password: pw, aggiornata: new Date().toISOString() };
        editing = null; mostra = true; render();
        toast("Password di " + u + " aggiornata.");
      } catch (err) { b.disabled = false; toast(err.message); }
      return;
    }
    if ((b = t.closest("[data-arm]"))) { armato = b.dataset.arm; editing = null; render(); return; }
    if (t.closest("[data-undel]")) { armato = null; render(); return; }
    if ((b = t.closest("[data-del]"))) {
      var nome = b.dataset.del;
      b.disabled = true; b.textContent = "Elimino…";
      try {
        await A.eliminaStudente(nome);
        studenti = studenti.filter(function (x) { return x.username !== nome; });
        delete cred[nome]; armato = null; render();
        toast(nome + " è stato eliminato, insieme ai suoi progressi.");
      } catch (err) { armato = null; render(); toast(err.message); }
    }
  });

  LN.docente = { carica: carica };
})(window.LN);
