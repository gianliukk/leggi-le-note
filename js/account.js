/* Accesso, salvataggio online dei progressi e operazioni del docente (Supabase). */
window.LN = window.LN || {};
(function (LN) {
  "use strict";
  var C = LN.CONFIG;
  var client = null;
  var saveTimer = null, saving = Promise.resolve();

  function emailDa(nome) {
    nome = nome.trim();
    return nome.indexOf("@") > -1 ? nome.toLowerCase() : nome.toLowerCase() + "@" + C.dominio;
  }
  function traduci(err) {
    var m = (err && (err.message || err.error_description)) || String(err);
    if (/Invalid login credentials/i.test(m)) return "Nome utente o password non corretti.";
    if (/already registered|already been registered/i.test(m)) return "Esiste già un account con questo nome.";
    if (/Password should be at least/i.test(m)) return "La password deve avere almeno 6 caratteri.";
    if (/rate limit|too many/i.test(m)) return "Troppi tentativi in poco tempo: aspetta qualche minuto e riprova.";
    if (/Failed to fetch|NetworkError|network/i.test(m)) return "Connessione assente: controlla internet e riprova.";
    if (/duplicate key.*username/i.test(m)) return "Questo nome utente è già usato.";
    return m;
  }

  var A = {
    user: null,
    ruolo: null,      // "studente" | "docente" | null
    profilo: null,    // { username, classe, avatar }
    traduci: traduci,

    init: async function () {
      if (!window.supabase || !window.supabase.createClient) throw new Error("Failed to fetch");
      client = window.supabase.createClient(C.url, C.chiave);
      var res = await client.auth.getSession();
      var session = res.data && res.data.session;
      if (session) await this.caricaRuolo(session.user);
      return this.ruolo;
    },

    accedi: async function (nome, password) {
      var r = await client.auth.signInWithPassword({ email: emailDa(nome), password: password });
      if (r.error) throw new Error(traduci(r.error));
      await this.caricaRuolo(r.data.user);
      if (!this.ruolo) {
        await client.auth.signOut();
        throw new Error("Questo account non è ancora attivo. Chiedi al prof. Marano.");
      }
      return this.ruolo;
    },

    esci: async function () {
      try { await saving; await client.auth.signOut(); } catch (e) {}
      location.hash = "";
      location.reload();
    },

    caricaRuolo: async function (user) {
      this.user = user; this.ruolo = null; this.profilo = null;
      var d = await client.from("docenti").select("user_id").eq("user_id", user.id).maybeSingle();
      if (d.data) {
        this.ruolo = "docente";
        this.profilo = { username: "Docente", classe: "" };
        LN.store.attach("leggi-le-note-docente", null);
        LN.store.illimitata = true;
        LN.store.tuttoAperto = true;
        return;
      }
      var s = await client.from("studenti").select("username, avatar, classi(nome)").eq("user_id", user.id).maybeSingle();
      if (!s.data) return;
      this.ruolo = "studente";
      this.profilo = { username: s.data.username, classe: s.data.classi ? s.data.classi.nome : "", avatar: s.data.avatar || {} };
      var p = await client.from("progressi").select("dati").eq("user_id", user.id).maybeSingle();
      LN.store.attach("leggi-le-note-" + user.id, p.data ? p.data.dati : null);
      LN.store.onSave = function () { A.salvaProgressi(); };
      if (!p.data) A.salvaProgressi(true);
    },

    /* Salva lo stato completo, al massimo una volta al secondo. */
    salvaProgressi: function (subito) {
      if (this.ruolo !== "studente") return;
      clearTimeout(saveTimer);
      var self = this;
      saveTimer = setTimeout(function () {
        var S = LN.store.state;
        saving = saving.then(function () {
          return client.from("progressi").upsert({
            user_id: self.user.id, dati: S, xp: S.xp, serie: S.serie,
            ultimo_giorno: S.ultimoGiorno, aggiornato: new Date().toISOString()
          });
        }).then(function (r) { if (r && r.error) console.warn("Salvataggio progressi:", r.error.message); })
          .catch(function (e) { console.warn("Salvataggio progressi:", e); });
      }, subito ? 0 : 800);
    },

    registraSessione: function (tappa, esatte, totale, ms, xp) {
      if (this.ruolo !== "studente") return;
      client.from("sessioni").insert({ user_id: this.user.id, tappa: tappa, esatte: esatte, totale: totale, ms: Math.round(ms), xp: xp })
        .then(function (r) { if (r.error) console.warn("Registrazione tappa:", r.error.message); });
    },

    /* Progressi riassuntivi di tutti gli studenti (solo nomi utente). */
    compagni: async function () {
      var r = await client.rpc("compagni");
      if (r.error) throw new Error(traduci(r.error));
      return r.data || [];
    },

    /* Leghe a livelli della settimana; null se lo script 08_leghe.sql non è ancora stato eseguito. */
    leghe: async function () {
      var r = await client.rpc("leghe");
      if (r.error) {
        if (/leghe/.test(r.error.message || "") && /function|find/i.test(r.error.message || "")) return null;
        throw new Error(traduci(r.error));
      }
      return r.data || [];
    },

    /* Classifica di sempre: XP totali, dell'anno scolastico e anno per anno. */
    storico: async function () {
      var r = await client.rpc("storico");
      if (r.error) {
        if (/storico/.test(r.error.message || "") && /function|find/i.test(r.error.message || "")) throw new Error("La classifica di sempre non è ancora attiva: il docente deve eseguire lo script 07_storico.sql in Supabase.");
        throw new Error(traduci(r.error));
      }
      return r.data || [];
    },

    /* ---------- Docente ---------- */
    creaDocente: async function (email, password) {
      var r = await client.auth.signUp({ email: email.trim().toLowerCase(), password: password });
      if (r.error) throw new Error(traduci(r.error));
      await client.auth.signOut();
    },

    classi: async function () {
      var r = await client.from("classi").select("id, nome").order("nome");
      if (r.error) throw new Error(traduci(r.error));
      return r.data;
    },

    studenti: async function () {
      var r = await client.from("studenti").select("user_id, username, classe_id, creato, progressi(xp, serie, ultimo_giorno, aggiornato, dati)").order("username");
      if (r.error) throw new Error(traduci(r.error));
      return r.data.map(function (s) {
        var p = Array.isArray(s.progressi) ? s.progressi[0] : s.progressi;
        return { user_id: s.user_id, username: s.username, classe_id: s.classe_id, creato: s.creato, p: p || null };
      });
    },

    /* Crea l'account di uno studente direttamente nel database (funzione riservata al docente). */
    creaStudente: async function (username, classeId, password) {
      var r = await client.rpc("crea_studente", { p_username: username, p_classe_id: classeId, p_password: password });
      if (r.error) throw new Error(traduci(r.error));
    },

    nuovaPassword: async function (username, password) {
      var r = await client.rpc("reimposta_password", { p_username: username, p_password: password });
      if (r.error) throw new Error(traduci(r.error));
    },

    /* Copia leggibile delle password (solo docente): { username: {password, aggiornata} } */
    credenziali: async function () {
      var r = await client.rpc("elenco_credenziali");
      if (r.error) throw new Error(traduci(r.error));
      var map = {};
      (r.data || []).forEach(function (c) { map[c.username] = { password: c.password, aggiornata: c.aggiornata }; });
      return map;
    },

    cambiaClasse: async function (username, classe) {
      var r = await client.rpc("cambia_classe", { p_username: username, p_classe: classe });
      if (r.error) throw new Error(traduci(r.error));
    },

    passaggioAnno: async function () {
      var r = await client.rpc("passaggio_anno");
      if (r.error) throw new Error(traduci(r.error));
      return r.data;
    },

    nuovaClasse: async function (nome) {
      var r = await client.from("classi").insert({ nome: nome }).select("id, nome").single();
      if (r.error) throw new Error(traduci(r.error));
      return r.data;
    },

    eliminaStudente: async function (username) {
      var r = await client.rpc("elimina_studente", { p_username: username });
      if (r.error) throw new Error(traduci(r.error));
    },

    /* Copia di sicurezza: tutte le tabelle che il docente può leggere, a pagine da 1000 righe. */
    copiaDati: async function () {
      var copia = { sito: "Leggi le note", creata: new Date().toISOString(), tabelle: {} };
      var tabelle = ["classi", "studenti", "progressi", "sessioni", "compiti", "leghe_storia"];
      for (var i = 0; i < tabelle.length; i++) {
        var righe = [], da = 0;
        for (;;) {
          var r = await client.from(tabelle[i]).select("*").range(da, da + 999);
          if (r.error) throw new Error(tabelle[i] + ": " + traduci(r.error));
          righe = righe.concat(r.data);
          if (r.data.length < 1000) break;
          da += 1000;
        }
        copia.tabelle[tabelle[i]] = righe;
      }
      var c = await client.rpc("elenco_credenziali");
      copia.tabelle.credenziali = c.error ? [] : c.data;
      return copia;
    }
  };

  /* Password facili da leggere e da scrivere per ragazzi: strumento + tre cifre. */
  var PAROLE = ["arpa", "corno", "flauto", "oboe", "piano", "tromba", "tuba", "viola", "liuto", "banjo", "fagotto", "chitarra", "violino", "timpano"];
  A.generaPassword = function () {
    var a = new Uint32Array(2);
    (window.crypto || window.msCrypto).getRandomValues(a);
    return PAROLE[a[0] % PAROLE.length] + String(100 + (a[1] % 900));
  };

  LN.account = A;
})(window.LN);
