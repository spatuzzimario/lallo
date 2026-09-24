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

## Modelli — un solo modello per tutto

Il pilota (fonema R) aveva usato uno split a due modelli: `eleven_v3` per
le parole isolate, `eleven_multilingual_v2` per le righe di personalità.
Dopo la validazione del pilota, decisione dell'utente: **`eleven_v3` per
tutto** (parole isolate e frasi/template/righe di personalità), per
semplicità di pipeline e coerenza timbrica. Tutta la produzione degli
altri 24 fonemi (parole target, frasi guida caccia/memory/livelli, righe
titolo album) è stata generata con `eleven_v3`.

Parametri di chiamata di riferimento (tool `creative_generate_speech` del
connettore ElevenLabs):

```
model_id: "eleven_v3"
voice_id: "3DPhHWXDY263XJ1d2EPN"
prompt: "<testo italiano da leggere>"
```

## Costo

A differenza di Higgsfield (costo fisso per generazione), ElevenLabs
addebita per durata/caratteri: ~30-50 crediti per una parola isolata,
~30-130 crediti per una riga/frase template con `eleven_v3`. Produzione
completa: 441 parole + 94 righe = 535 clip, qualche migliaio di crediti
in totale.

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
   personalità, calore, ritmo giocoso.
2. **Lallo-che-pronuncia-la-parola-modello** (il fonema/la parola target che
   il bambino deve imitare): energia abbassata apposta — voce chiara, ritmo
   naturale, zero coloriture che possano confondere l'articolazione. Questa è
   la parte clinicamente sensibile: un errore di pronuncia qui modella
   un'articolazione scorretta al bambino.

Entrambe le modalità usano `eleven_v3` (vedi sopra); la distinzione è nel
testo/prompt scritto, non nel modello.

## Linee guida di scrittura del testo

- Frasi brevi, una sola idea per frase.
- Punteggiatura che detta il ritmo: virgole per pause brevi, punti per pause
  piene, punti esclamativi con parsimonia (non ogni frase).
- Niente maiuscolo per enfasi (letto male dai motori TTS).
- La parola modello va isolata in una frase a sé, con iniziale maiuscola e
  punto finale (es. "Rana."), mai incastrata in una frase più lunga.
- Mai umorismo che richieda un tono sarcastico o ambiguo — un bambino di 3-6
  anni prende tutto alla lettera.

## Produzione completa

Pilota (fonema R, 37 parole + 18 righe fisse/template) validato
dall'utente, poi produzione estesa a tutti gli altri 24 fonemi su
istruzione esplicita dell'utente ("eleven V3 per tutto"). Stato finale:

- **441 parole target** in `app/assets/audio/parole/<slug>.mp3` — tutti i
  25 fonemi del word bank (`app/src/constants/wordBank.ts`), posizione
  iniziale + mediana.
- **94 righe fisse/template** in `app/assets/audio/lines/<slug>.mp3` —
  18 righe di personalità/UI del pilota, 72 frasi guida
  (`tpl_caccia_<fonema>`, `tpl_memory_<fonema>`, `tpl_livelli_<fonema>` ×
  24 fonemi non-R) e le 4 righe di congratulazioni per i titoli album
  (Esploratore, Cercatore d'oro, Grande esploratore, Maestro delle parole).

Tutto generato con `creative_generate_speech` (connettore nativo
ElevenLabs), voce Linda Fiore, modello `eleven_v3`, download diretto da
`storage.googleapis.com` (raggiungibile senza passare dall'utente),
salvato in `app/assets/audio/parole/` o `app/assets/audio/lines/` a
seconda del tipo di contenuto. Nessun caso ha richiesto l'articolo come
workaround.

## Da validare prima dell'uso clinico reale

- **Pronuncia dei fonemi italiani target** (S/Z, SC/SCI, GN, GLI,
  TR/STR/PR...) va controllata da un madrelingua italiano — idealmente la
  logopedista di riferimento del progetto — fonema per fonema, non solo a
  campione in sessione di sviluppo. Tutti i 25 fonemi sono ora generati;
  la validazione clinica sistematica resta da fare prima dell'uso reale.
- Se una parola specifica risulta pronunciata in modo ambiguo o innaturale
  con `eleven_v3`, va segnalata: si rigenera puntualmente con un testo
  diverso (es. `eleven_multilingual_v2`, o un articolo davanti come
  workaround temporaneo se necessario).
