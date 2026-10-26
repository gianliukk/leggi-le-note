/* Suono: campioni di clarinetto General MIDI (banco FluidR3), con un suono sintetico di riserva. */
window.LN = window.LN || {};
(function (LN) {
  "use strict";
  var CHROMA = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
  var actx = null, bank = null, bankP = null, buffers = {};

  function ctx() {
    if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
    if (actx.state === "suspended") actx.resume();
    return actx;
  }
  function loadBank() {
    if (!bankP) {
      bankP = fetch("audio/clarinetto.json")
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) { bank = j; return j; })
        .catch(function () { return null; });
    }
    return bankP;
  }
  function getBuffer(key) {
    if (buffers[key]) return buffers[key];
    if (!bank || !bank[key] || !actx) return Promise.resolve(null);
    var bin = atob(bank[key]), u = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    buffers[key] = new Promise(function (res) { actx.decodeAudioData(u.buffer, res, function () { res(null); }); });
    return buffers[key];
  }
  function synth(m, dur, t0) {
    var a = ctx(); if (!a) return;
    var t = t0 || a.currentTime, f = 440 * Math.pow(2, (m - 69) / 12), g = a.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.25, t + 0.04);
    g.gain.setValueAtTime(0.25, t + Math.max(0.05, dur - 0.08));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.1);
    g.connect(a.destination);
    [[1, 0.9], [3, 0.35], [5, 0.15]].forEach(function (p) {
      var o = a.createOscillator(), og = a.createGain();
      o.type = "sine"; o.frequency.value = f * p[0]; og.gain.value = p[1];
      o.connect(og); og.connect(g); o.start(t); o.stop(t + dur + 0.15);
    });
  }

  function chiave(m) { return CHROMA[m % 12] + (Math.floor(m / 12) - 1); }
  function suona(a, buf, m, dur, t) {
    if (!buf) { synth(m, dur, t); return; }
    var src = a.createBufferSource(), g = a.createGain();
    src.buffer = buf;
    g.gain.setValueAtTime(0.9, t);
    g.gain.setValueAtTime(0.9, t + Math.max(0.04, dur - 0.06));
    g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.08);
    src.connect(g); g.connect(a.destination);
    src.start(t); src.stop(t + dur + 0.1);
  }

  LN.suono = {
    /* m = nota MIDI da far suonare (già trasposta se serve), dur = secondi */
    play: function (m, dur) {
      if (!LN.store.set.sound) return;
      dur = dur || 1;
      var a = ctx(); if (!a) return;
      loadBank().then(function () { return getBuffer(chiave(m)); }).then(function (buf) { suona(a, buf, m, dur, a.currentTime); });
    },
    /* Note una dopo l'altra: [[midi, secondi], ...]. forza = suona anche col suono spento (esercizi d'ascolto). */
    sequenza: function (note, forza) {
      if (!forza && !LN.store.set.sound) return;
      var a = ctx(); if (!a) return;
      loadBank().then(function () {
        return Promise.all(note.map(function (n) { return getBuffer(chiave(n[0])); }));
      }).then(function (bufs) {
        var t = a.currentTime + 0.05;
        note.forEach(function (n, i) { suona(a, bufs[i], n[0], n[1], t); t += n[1] + 0.15; });
      });
    },
    /* Clarinetto in Sib: il suono reale è un tono sotto la nota scritta. */
    SIB: -2
  };

  var warmed = false;
  document.addEventListener("pointerdown", function () {
    if (warmed) return;
    warmed = true;
    if (!ctx()) return;
    loadBank().then(function (b) { if (b) Object.keys(b).forEach(getBuffer); });
  }, { capture: true });
})(window.LN);
