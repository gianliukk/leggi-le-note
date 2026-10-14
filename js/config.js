/* Collegamento all'archivio online (Supabase). Indirizzo e chiave sono pubblici per natura:
   a proteggere i dati sono le regole di sicurezza del database. */
window.LN = window.LN || {};
LN.CONFIG = {
  url: "https://umcxtocpmpjozhzeqknv.supabase.co",
  chiave: "sb_publishable_Wzbhy1yXxsr10Y2e2QNOJQ_GM9p6mx8",
  // Gli studenti non hanno un'email: il nome utente diventa nome.utente@studenti.leggilenote.it
  dominio: "studenti.leggilenote.it",
  sito: "gianliukk.github.io/leggi-le-note"
};
