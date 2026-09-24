# La voce di Lallo — scelta tecnica e personalità

Decisione finale presa in sessione (settembre 2026), sostituisce quanto
scritto in `CLAUDE.md` §3. Storico: nella stessa sessione si era prima
scelto un percorso via Higgsfield (`text2speech_v2`, voce preset "Gracie")
— abbandonato perché sulle **parole isolate** (non frasi) quella voce
leggeva l'italiano con un accento inglese marcato, non correggibile né
cambiando motore (elevenlabs/seed_speech/minimax/seed_audio) né cambiando
preset all'interno del catalogo Higgsfield (nessuno dei ~136 preset
disponibili — verificato per intero — ha un tag di lingua, e nessuno
testato leggeva bene l'italiano isolato).

## Decisione finale

La voce di Lallo — sia le battute di personalità sia la pronuncia delle
parole/fonemi target — viene generata tramite il **connettore nativo
ElevenLabs** (non più Higgsfield), usando una voce reale dalla libreria
ElevenLabs dell'utente. Il connettore nativo raggiunge i server ElevenLabs
direttamente (a differenza del wrapper Higgsfield, che accetta solo i suoi
136 preset ed è rifiutato per qualunque voice_id esterno con "Voice not
found").

## Voce scelta

- **Nome:** Linda Fiore — Prickly, Cheerful and Full
- **voice_id:** `3DPhHWXDY263XJ1d2EPN`
- Fornita direttamente dall'utente dalla propria libreria ElevenLabs.
  Validata su parola isolata ("rana") e su frase lunga (intro di Lallo),
  poi su un campione di parole target diverse: sole (S), gnomo (GN),
  scivolo (SC), treno (gruppo TR), casa (controllo base) — tutte corrette
  tranne "gnomo" con le impostazioni di default (vedi sotto).

## Modelli — due usi diversi

- **Parole modello isolate** → `eleven_v3`. Necessario per i casi limite
  (es. "gnomo" pronunciato male con `eleven_multilingual_v2` da solo,
  corretto passando a `eleven_v3` senza bisogno di aggiungere un articolo
  davanti). Usare `eleven_v3` per tutte le ~445 parole del word bank per
  coerenza, anche se la maggior parte avrebbe funzionato anche con
  `eleven_multilingual_v2`.
- **Righe di personalità/istruzioni** (frasi lunghe: intro, consegne dei
  giochi, incoraggiamenti) → `eleven_multilingual_v2`. Validato bene sulla
  frase intro completa di Lallo (~15 secondi).

Parametri di chiamata di riferimento (tool `creative_generate_speech` del
connettore ElevenLabs):

```
model_id: "eleven_v3"              # parole isolate
model_id: "eleven_multilingual_v2" # frasi/personalità
voice_id: "3DPhHWXDY263XJ1d2EPN"
prompt: "<testo italiano da leggere>"
```

## Costo

A differenza di Higgsfield (costo fisso per generazione), ElevenLabs
addebita per durata/caratteri: ~5-8 crediti per una parola isolata,
~200 crediti per una frase lunga (~15s). Per l'intera produzione (539
clip: 445 parole + 94 righe fisse/template) il totale stimato è
nell'ordine di alcune migliaia di crediti — verificare il piano/i crediti
disponibili prima di lanciare la produzione completa.

## Chi è Lallo quando parla

Un pappagallo curioso, affettuoso, un po' pasticcione ma mai preso in giro —
è l'amico del bambino, non l'insegnante. Non giudica mai gli errori (coerente
con CLAUDE.md §8: "mai punire l'errore, celebrare ogni tentativo").

- **Registro:** informale, caldo, sorridente — un adulto che gioca sul serio
  con un bambino, non un cartone urlato né un audiolibro piatto.
- **Ritmo:** più lento del parlato adulto normale, frasi brevi, pause
  naturali — dà tempo al bambino di elaborare prima di rispondere.
- **Energia:** entusiasta ma non isterica — l'eccitazione si sente nelle
  parole scelte ("Bravissimo!", "Ce l'hai fatta!"), non in un tono sempre a
  mille.

## Due modalità di lettura — distinzione importante

1. **Lallo-che-parla-con-te** (intro, istruzioni, incoraggiamento): piena
   personalità, calore, ritmo giocoso. Modello `eleven_multilingual_v2`.
2. **Lallo-che-pronuncia-la-parola-modello** (il fonema/la parola target che
   il bambino deve imitare): energia abbassata apposta — voce chiara, ritmo
   naturale, zero coloriture che possano confondere l'articolazione. Questa è
   la parte clinicamente sensibile: un errore di pronuncia qui modella
   un'articolazione scorretta al bambino. Modello `eleven_v3`.

## Linee guida di scrittura del testo

- Frasi brevi, una sola idea per frase.
- Punteggiatura che detta il ritmo: virgole per pause brevi, punti per pause
  piene, punti esclamativi con parsimonia (non ogni frase).
- Niente maiuscolo per enfasi (letto male dai motori TTS).
- La parola modello va isolata in una frase a sé, con iniziale maiuscola e
  punto finale (es. "Rana."), mai incastrata in una frase più lunga.
- Mai umorismo che richieda un tono sarcastico o ambiguo — un bambino di 3-6
  anni prende tutto alla lettera.

## Da validare prima dell'uso clinico reale

- **Pronuncia dei fonemi italiani target** (R, S/Z, SC/SCI, GN, GLI,
  TR/STR/PR...) va controllata da un madrelingua italiano — idealmente la
  logopedista di riferimento del progetto — fonema per fonema, non solo a
  campione in sessione di sviluppo. Il campione testato in sessione (rana,
  sole, gnomo, scivolo, treno, casa) copre solo una minima parte dei fonemi
  prioritari.
- Se una parola specifica risulta pronunciata in modo ambiguo o innaturale
  con `eleven_v3`, va segnalata: si rigenera puntualmente con un testo
  diverso (es. `eleven_multilingual_v2`, o un articolo davanti come
  workaround temporaneo — non più necessario per "gnomo" ma potenzialmente
  utile per altri casi non ancora scoperti).
