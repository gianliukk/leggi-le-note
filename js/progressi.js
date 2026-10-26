/* Progressi e impostazioni. Restano anche nel browser come copia di lavoro;
   per gli studenti collegati vengono salvati online a ogni modifica (vedi account.js). */
window.LN = window.LN || {};
(function (LN) {
  "use strict";
  var KEY = "leggi-le-note-sito-v1";

  function vuoto() {
    return {
      xp: 0,
      serie: 0,
      ultimoGiorno: null,
      best: {},
      errori: {},
      impostazioni: { names: "it", sound: true, mode: "nomi", unlockAll: false }
    };
  }
  function normalizza(raw) {
    var s = Object.assign(vuoto(), raw || {});
    s.impostazioni = Object.assign(vuoto().impostazioni, (raw && raw.impostazioni) || {});
    s.best = Object.assign({}, (raw && raw.best) || {});
    s.errori = Object.assign({}, (raw && raw.errori) || {});
    return s;
  }
  function leggiLocale() {
    try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; }
  }
  var S = normalizza(leggiLocale());

  function salva() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
    if (typeof LN.store.onSave === "function") LN.store.onSave(S);
  }

  function giorno(d) {
    d = d || new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function ieri() { var d = new Date(); d.setDate(d.getDate() - 1); return giorno(d); }

  LN.store = {
    onSave: null,
    get state() { return S; },
    get set() { return S.impostazioni; },
    salva: salva,

    /* Usa i progressi di un utente: quelli online se ci sono, altrimenti la copia nel browser. */
    attach: function (key, datiOnline) {
      KEY = key;
      S = normalizza(datiOnline || leggiLocale());
      try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
    },

    best: function (key) { return S.best[key] || { score: 0, stars: 0, ms: 0 }; },
    completata: function (key) { return (S.best[key] || {}).stars >= 2; },

    /* Indice della prima tappa non ancora superata (due stelle). */
    corrente: function () {
      for (var i = 0; i < LN.TAPPE.length; i++) if (!this.completata(LN.TAPPE[i].key)) return i;
      return LN.TAPPE.length;
    },
    sbloccata: function (i) { return S.impostazioni.unlockAll || i <= this.corrente(); },

    /* La serie è "viva" se l'ultimo allenamento è di oggi o di ieri. */
    serieAttuale: function () {
      if (S.ultimoGiorno === giorno() || S.ultimoGiorno === ieri()) return S.serie;
      return 0;
    },
    oggiFatto: function () { return S.ultimoGiorno === giorno(); },

    /* Ripasso degli errori. Chiavi: "n30" = nota (grado 30), "f3" = figura (croma), "p3" = pausa.
       Ogni errore mette la figura nel ripasso; esce dopo RIPASSO_VOLTE risposte giuste, e un nuovo errore la riporta a capo. */
    RIPASSO_VOLTE: 3,
    aggiornaErrori: function (esiti) {
      var E = S.errori, n = this.RIPASSO_VOLTE;
      esiti.forEach(function (x) {
        var k = x[0], e = E[k];
        if (!x[1]) E[k] = { resta: n, sbagli: (e ? e.sbagli : 0) + 1 };
        else if (e && --e.resta <= 0) delete E[k];
      });
    },
    /* [{ k, resta, sbagli }] dalle più "difficili" */
    daRipassare: function () {
      return Object.keys(S.errori).map(function (k) { return { k: k, resta: S.errori[k].resta, sbagli: S.errori[k].sbagli }; })
        .sort(function (a, b) { return b.resta - a.resta || b.sbagli - a.sbagli; });
    },

    /* soloXp: per il ripasso, che dà XP e serie ma non è una tappa del percorso (niente stelle salvate). */
    registra: function (key, esatte, totale, ms, soloXp) {
      var pct = esatte / totale;
      var stelle = pct >= 0.95 ? 3 : pct >= 0.8 ? 2 : pct >= 0.6 ? 1 : 0;
      var prima = this.corrente();
      var prev = this.best(key);
      var migliore = !soloXp && (!prev.score || esatte > prev.score || (esatte === prev.score && ms < prev.ms));
      if (!soloXp) S.best[key] = migliore
        ? { score: esatte, stars: Math.max(stelle, prev.stars), ms: ms }
        : { score: prev.score, stars: Math.max(stelle, prev.stars), ms: prev.ms };

      // Prima si aggiorna la serie: il bonus vale già dal giorno in cui si raggiunge la soglia.
      var oggi = giorno(), serieSu = false;
      if (S.ultimoGiorno !== oggi) {
        S.serie = S.ultimoGiorno === ieri() ? S.serie + 1 : 1;
        S.ultimoGiorno = oggi;
        serieSu = true;
      }
      var base = esatte + 5 + (esatte === totale ? 5 : 0);
      var molt = this.moltiplicatore(S.serie);
      var carica = this.consumaEnergia();
      var xp = carica ? Math.round(base * molt) : 0;
      S.xp += xp;
      salva();
      return { stelle: stelle, xp: xp, base: base, molt: molt, senzaEnergia: !carica, record: migliore, serie: S.serie, serieSu: serieSu, sblocco: this.corrente() > prima };
    },

    /* Energia: 5 cariche, una per tappa; se ne ricarica una ogni 30 minuti.
       A energia finita si gioca ancora, ma la tappa non dà XP. */
    ENERGIA_MAX: 5,
    RICARICA_MS: 30 * 60 * 1000,
    illimitata: false,
    _energia: function () {
      var now = Date.now(), e = S.energia;
      if (!e || typeof e.valore !== "number") e = S.energia = { valore: this.ENERGIA_MAX, agg: now };
      if (e.valore < this.ENERGIA_MAX) {
        var gained = Math.floor((now - e.agg) / this.RICARICA_MS);
        if (gained > 0) {
          e.valore = Math.min(this.ENERGIA_MAX, e.valore + gained);
          e.agg = e.valore >= this.ENERGIA_MAX ? now : e.agg + gained * this.RICARICA_MS;
        }
      } else e.agg = now;
      return e;
    },
    /* { valore, max, prossima: millisecondi alla prossima carica oppure null se piena } */
    energia: function () {
      if (this.illimitata) return { valore: this.ENERGIA_MAX, max: this.ENERGIA_MAX, prossima: null, illimitata: true };
      var e = this._energia();
      return { valore: e.valore, max: this.ENERGIA_MAX, prossima: e.valore >= this.ENERGIA_MAX ? null : Math.max(0, e.agg + this.RICARICA_MS - Date.now()) };
    },
    consumaEnergia: function () {
      if (this.illimitata) return true;
      var e = this._energia();
      if (e.valore <= 0) return false;
      if (e.valore >= this.ENERGIA_MAX) e.agg = Date.now();
      e.valore -= 1;
      return true;
    },

    /* Bonus continuità: più giorni di fila, più XP per ogni tappa. */
    SOGLIE: [[14, 2], [7, 1.5], [3, 1.2]],
    moltiplicatore: function (serie) {
      for (var i = 0; i < this.SOGLIE.length; i++) if (serie >= this.SOGLIE[i][0]) return this.SOGLIE[i][1];
      return 1;
    },
    /* Prossima soglia da raggiungere: { giorni mancanti, moltiplicatore } oppure null. */
    prossimaSoglia: function (serie) {
      var s = this.SOGLIE.slice().reverse().find(function (x) { return serie < x[0]; });
      return s ? { mancano: s[0] - serie, molt: s[1] } : null;
    },

    azzera: function () {
      var imp = S.impostazioni;
      S = vuoto();
      S.impostazioni = imp;
      S.impostazioni.unlockAll = false;
      salva();
    }
  };
})(window.LN);
