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
      impostazioni: { names: "it", sound: true, mode: "nomi", unlockAll: false }
    };
  }
  function normalizza(raw) {
    var s = Object.assign(vuoto(), raw || {});
    s.impostazioni = Object.assign(vuoto().impostazioni, (raw && raw.impostazioni) || {});
    s.best = Object.assign({}, (raw && raw.best) || {});
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

    registra: function (key, esatte, totale, ms) {
      var pct = esatte / totale;
      var stelle = pct >= 0.95 ? 3 : pct >= 0.8 ? 2 : pct >= 0.6 ? 1 : 0;
      var prima = this.corrente();
      var prev = this.best(key);
      var migliore = !prev.score || esatte > prev.score || (esatte === prev.score && ms < prev.ms);
      S.best[key] = migliore
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
      var xp = Math.round(base * molt);
      S.xp += xp;
      salva();
      return { stelle: stelle, xp: xp, base: base, molt: molt, record: migliore, serie: S.serie, serieSu: serieSu, sblocco: this.corrente() > prima };
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
