# La voce di Lallo — scelta tecnica e personalità

Decisione presa in sessione (settembre 2026), sostituisce quanto scritto in
`CLAUDE.md` §3 ("ElevenLabs per la voce-modello... in demo si può usare la TTS
di sistema come fallback"): la voce di Lallo — sia le battute di personalità
sia la pronuncia delle parole/fonemi target — viene generata tramite
**Higgsfield → modello `text2speech_v2`, motore `variant: "elevenlabs"`**
(passa dall'abbonamento/crediti Higgsfield già disponibili, non serve una
chiave ElevenLabs separata). Il fallback a TTS di sistema resta valido solo
per l'ambiente di demo/sviluppo quando non è disponibile la generazione.

## Voce scelta

- **Nome preset:** Gracie (voce femminile)
- **voice_id:** `09878754-f20b-5330-9790-58a8027ab5b2`
- **voice_type:** `preset`
- Scelta dopo ascolto comparativo di 3 candidate (Gracie, Annie, Benji) su una
  riga di prova in italiano contenente la parola modello "rana" (fonema R
  iniziale) — Gracie è risultata la più convincente per timbro e chiarezza
  articolatoria.

Parametri di chiamata di riferimento (vedi Higgsfield MCP `generate_audio` /
`generate_audio_batch`):

```
model: "text2speech_v2"
variant: "elevenlabs"
voice_type: "preset"
voice_id: "09878754-f20b-5330-9790-58a8027ab5b2"
prompt: "<testo italiano da leggere>"
```

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

Nello script, le due modalità vanno scritte come righe separate (mai la
stessa frase a fare da intro *e* da modello), per poter eventualmente
applicare in futuro impostazioni diverse (es. `stability`/`style` più alte
sul modello, se il motore lo permetterà).

## Linee guida di scrittura del testo

L'API non espone un "prompt di stile" libero (a differenza dei modelli
immagine/video) — la caratterizzazione passa dalla voce scelta *e* da come è
scritto il testo:

- Frasi brevi, una sola idea per frase.
- Punteggiatura che detta il ritmo: virgole per pause brevi, punti per pause
  piene, punti esclamativi con parsimonia (non ogni frase).
- Niente maiuscolo per enfasi (letto male dai motori TTS).
- La parola modello va isolata in una frase a sé, non incastrata in una frase
  lunga: "Ascolta bene: rana." non "Adesso ti faccio sentire la parola rana
  che ha il suono R".
- Mai umorismo che richieda un tono sarcastico o ambiguo — un bambino di 3-6
  anni prende tutto alla lettera.

## Da validare prima dell'uso clinico reale

- **Pronuncia dei fonemi italiani target** (R, S/Z, SC/SCI, GN, GLI,
  TR/STR/PR...) va controllata da un madrelingua italiano — idealmente la
  logopedista di riferimento del progetto — fonema per fonema, non solo a
  orecchio in sessione di sviluppo.
- Se un fonema specifico risulta pronunciato in modo ambiguo o innaturale da
  Gracie/motore ElevenLabs, va segnalato: si può provare una voce diversa
  solo per quella parola, o rivedere il testo (es. spelling fonetico) prima
  di considerarlo pronto per un bambino reale.
