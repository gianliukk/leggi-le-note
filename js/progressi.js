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
      missioni: null,
      impostazioni: { names: "it", sound: true, mode: "nomi", unlockAll: false }
    };
  }
  function normalizza(raw) {
    var s = Object.assign(vuoto(), raw || {});
    s.impostazioni = Object.assign(vuoto().impostazioni, (raw && raw.impostazioni) || {});
    s.best = Object.assign({}, (raw && raw.best) || {});
    s.errori = Object.assign({}, (raw && raw.errori) || {});
    s.missioni = (raw && raw.missioni) || null;
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
    /* Aperta se è la prossima da fare, se è già superata o se è superata quella prima
       (così, quando si aggiunge un'unità nuova nel mezzo, chi è più avanti non perde le tappe già aperte). */
    sbloccata: function (i) {
      if (S.impostazioni.unlockAll || i <= this.corrente()) return true;
      return this.completata(LN.TAPPE[i].key) || (i > 0 && this.completata(LN.TAPPE[i - 1].key));
    },

    /* Corone (𝄐): una ogni CORONA_OGNI giorni di fila, al massimo CORONE_MAX.
       Ogni giorno saltato ne consuma una e la serie resta viva (senza crescere). */
    CORONA_OGNI: 7,
    CORONE_MAX: 2,
    corone: function () { return S.corone || 0; },
    usaCorone: function () {
      if (!S.ultimoGiorno || !S.serie) return;
      var p = S.ultimoGiorno.split("-"), ultimo = new Date(+p[0], p[1] - 1, +p[2]);
      var oggi = new Date(); oggi.setHours(0, 0, 0, 0);
      var saltati = Math.round((oggi - ultimo) / 86400000) - 1;
      if (saltati < 1 || saltati > this.corone()) return;
      S.corone = this.corone() - saltati;
      S.ultimoGiorno = ieri();
      S.coroneUsate = { giorno: giorno(), n: saltati, serie: S.serie };
      salva();
    },
    /* { n giorni salvati, serie } se oggi una corona ha salvato la serie, altrimenti null */
    coroneUsateOggi: function () {
      return S.coroneUsate && S.coroneUsate.giorno === giorno() ? S.coroneUsate : null;
    },

    /* La serie è "viva" se l'ultimo allenamento è di oggi o di ieri. */
    serieAttuale: function () {
      this.usaCorone();
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

    /* Missioni del giorno: tre, una per gruppo, scelte dalla data (uguali per tutta la classe) e nuove a mezzanotte.
       Ogni missione completata vale MISSIONE_XP; completarle tutte ricarica l'energia. */
    MISSIONE_XP: 10,
    POOL_MISSIONI: [
      [{ t: "tappe", n: 2 }, { t: "tappe", n: 3 }, { t: "giuste", n: 30 }],
      [{ t: "fila", n: 8 }, { t: "fila", n: 12 }, { t: "perfetta", n: 1 }],
      [{ t: "xp", n: 40 }, { t: "ripasso", n: 1 }, { t: "valori", n: 1 }]
    ],
    missioni: function () {
      var oggi = giorno(), m = S.missioni;
      if (m && m.giorno === oggi) return m;
      var h = 0, self = this;
      for (var i = 0; i < oggi.length; i++) h = (h * 31 + oggi.charCodeAt(i)) >>> 0;
      var valoriAperti = LN.TAPPE.some(function (T, j) { return T.track === "valori" && self.sbloccata(j); });
      var lista = this.POOL_MISSIONI.map(function (gruppo, g) {
        var ok = gruppo.filter(function (x) {
          return (x.t !== "ripasso" || Object.keys(S.errori).length) && (x.t !== "valori" || valoriAperti);
        });
        var x = ok[(h >>> (g * 5)) % ok.length];
        return { t: x.t, n: x.n, fatto: 0, ok: false };
      });
      S.missioni = { giorno: oggi, lista: lista, premio: false };
      salva();
      return S.missioni;
    },
    /* r: { xp, giuste, fila, perfetta, ripasso, track } di una tappa appena finita. */
    aggiornaMissioni: function (r) {
      var m = this.missioni(), nuove = [];
      m.lista.forEach(function (x) {
        if (x.ok) return;
        if (x.t === "fila") x.fatto = Math.max(x.fatto, r.fila);
        else x.fatto += { tappe: 1, giuste: r.giuste, xp: r.xp, perfetta: r.perfetta ? 1 : 0, ripasso: r.ripasso ? 1 : 0, valori: r.track === "valori" ? 1 : 0 }[x.t];
        if (x.fatto >= x.n) { x.fatto = x.n; x.ok = true; nuove.push(x); }
      });
      var tutte = false;
      if (nuove.length && !m.premio && m.lista.every(function (x) { return x.ok; })) {
        m.premio = tutte = true;
        if (!this.illimitata) { var e = this._energia(); e.valore = this.ENERGIA_MAX; e.agg = Date.now(); }
      }
      var bonus = nuove.length * this.MISSIONE_XP;
      S.xp += bonus;
      salva();
      return { nuove: nuove, bonus: bonus, tutte: tutte };
    },

    /* Contatori per le medaglie (vedi medaglie.js). r: { fila, perfetta, ripasso, tutteMissioni } */
    aggiornaStat: function (r) {
      var st = S.stat = S.stat || {};
      st.tappe = (st.tappe || 0) + 1;
      if (r.perfetta) st.perfette = (st.perfette || 0) + 1;
      if (r.ripasso) st.ripassi = (st.ripassi || 0) + 1;
      if (r.tutteMissioni) st.giorniMissioni = (st.giorniMissioni || 0) + 1;
      st.filaMax = Math.max(st.filaMax || 0, r.fila);
      st.serieMax = Math.max(st.serieMax || 0, S.serie);
      salva();
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
      this.usaCorone();
      var oggi = giorno(), serieSu = false, coronaNuova = false;
      if (S.ultimoGiorno !== oggi) {
        S.serie = S.ultimoGiorno === ieri() ? S.serie + 1 : 1;
        S.ultimoGiorno = oggi;
        serieSu = true;
        if (S.serie % this.CORONA_OGNI === 0 && this.corone() < this.CORONE_MAX) { S.corone = this.corone() + 1; coronaNuova = true; }
      }
      var base = esatte + 5 + (esatte === totale ? 5 : 0);
      var molt = this.moltiplicatore(S.serie);
      var carica = this.consumaEnergia();
      var xp = carica ? Math.round(base * molt) : 0;
      S.xp += xp;
      salva();
      return { stelle: stelle, xp: xp, base: base, molt: molt, senzaEnergia: !carica, record: migliore, serie: S.serie, serieSu: serieSu, coronaNuova: coronaNuova, sblocco: this.corrente() > prima };
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
