/* Progressi e impostazioni. Per ora restano nel browser; nella fase 2 lo stesso
   oggetto verrà salvato nell'archivio online, legato al nome utente dello studente. */
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
  var S = vuoto();
  try {
    var raw = JSON.parse(localStorage.getItem(KEY) || "null");
    if (raw) {
      S = Object.assign(vuoto(), raw);
      S.impostazioni = Object.assign(vuoto().impostazioni, raw.impostazioni || {});
    }
  } catch (e) {}

  function salva() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

  function giorno(d) {
    d = d || new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function ieri() { var d = new Date(); d.setDate(d.getDate() - 1); return giorno(d); }

  LN.store = {
    get state() { return S; },
    get set() { return S.impostazioni; },
    salva: salva,

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

      var xp = esatte + 5 + (esatte === totale ? 5 : 0);
      S.xp += xp;

      var oggi = giorno(), serieSu = false;
      if (S.ultimoGiorno !== oggi) {
        S.serie = S.ultimoGiorno === ieri() ? S.serie + 1 : 1;
        S.ultimoGiorno = oggi;
        serieSu = true;
      }
      salva();
      return { stelle: stelle, xp: xp, record: migliore, serie: S.serie, serieSu: serieSu, sblocco: this.corrente() > prima };
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
