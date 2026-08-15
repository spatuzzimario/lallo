# Lallo — Brief di build per Claude Code

Specifica completa del progetto. Leggila tutta prima di scrivere codice.

## 0. Come lavorare su questo progetto (leggi prima di tutto)

- **Piano prima del codice.** Per ogni nuova feature o schermata, proponi un piano (file da creare/toccare, approccio, dipendenze) e aspetta conferma prima di implementarla. Non costruire componenti nuovi in autonomia.
- **Correzioni cliniche, legali e di sicurezza:** applicale subito, senza aspettare conferma (es. rimozione di un claim, gate di consenso mancante).
- **Chiedi quando c'è un bivio.** Se una decisione di architettura o UX ha conseguenze (es. app unica vs separata, on-device vs cloud per la voce), fermati e chiedi.
- **Una fonte di verità.** Codebase unica React Native/Expo; il web esce da Expo Web dalla stessa codebase (niente preview React separata: ha già creato drift in passato).
- **Niente contenuti inventati.** Mai testimonial finti, nomi di esperti inventati, o claim di salute non fondati. Se manca un dato reale, lascialo come TODO esplicito.

## 1. Contesto e visione

Lallo è un'app di logopedia per bambini (circa 3–6 anni) per il mercato italiano. Trasforma gli esercizi di logopedia in giochi che il bambino vuole fare a casa. La fonologia è italiana (non tradotta dall'inglese). Mascotte: Lallo, un pappagallo (il pappagallo ripete i suoni → perfetto per l'articolazione).

Modello go-to-market: **parent-first (B2C)**, con integrazione logopedista opzionale.

- Il genitore è il protagonista: scarica, fa un breve screener, e inizia da solo.
- Il logopedista è un potenziamento opzionale, non un cancello: se il genitore ne ha uno, può collegare gli esercizi alla sua terapia.
- Lallo affianca la terapia, non la sostituisce.

Riferimento visivo/di interazione: la landing + demo HTML già realizzata (`landing/index.html`). Contiene la logica giocabile dei 7 giochi, la palette, la mascotte e i flussi — usala come specifica di comportamento e stile, adattandola a React Native.

## 2. Principi non negoziabili

1. **Sicurezza bambini + GDPR-K.** Utenti minori. In Italia il consenso digitale è a 16 anni: serve consenso genitoriale esplicito e verificabile. Gate di consenso prima di qualsiasi registrazione audio/video. DPIA prevista. Privacy policy e informativa a misura di famiglia.
2. **Voce del bambino = dato sensibilissimo.** Processa l'audio on-device dove possibile; non caricarlo su server se non necessario; cifratura a riposo; condivisione solo su azione esplicita del genitore, mai di default.
3. **Nessuna pubblicità, nessun ad-SDK, nessun tracker di terze parti verso i bambini.**
4. **Nessun claim clinico.** L'app orienta e fa esercitare, non diagnostica e non sostituisce la terapia. Lo screener suggerisce, non refertizza. Se emergono segnali importanti, invita a rivolgersi a un professionista.
5. **Tutto in italiano**, testi in-app inclusi.
6. **Ogni parola ha un'immagine.** I bambini non leggono: ogni parola-target è identificata da un'illustrazione. Le consegne sono in audio, non solo testo.
7. **Niente contenuti generati non controllati.** L'AI (se usata) resta un layer invisibile che varia i set di parole dentro strutture fisse validate — mai genera l'esercizio che il professionista/screener assegna.

## 3. Stack tecnico

- **App:** React Native + Expo SDK 51, TypeScript. Web via Expo Web dalla stessa codebase.
- **Backend/DB/Auth:** Supabase (Postgres + Auth + Storage). Progetto esistente: `https://zrzrmarrhiityuoszdze.supabase.co`.
- **Abbonamenti:** RevenueCat (iOS + Android, Small Business Program 15%).
- **Voce:** ElevenLabs per la voce-modello (pronuncia corretta) e le consegne audio; caching in Supabase Storage. In demo si può usare la TTS di sistema come fallback.
- **Audio bambino:** `expo-av` per registrazione; pitch-shift on-device per la feature "pappagallo".
- Testing su dispositivo reale (il motivo per cui siamo su Claude Code).

## 4. Modello dati (Supabase)

Proponi lo schema completo prima di crearlo. Punto di partenza:

- `profiles` — id, role (`parent` | `therapist`), created_at.
- `children` — id, owner_id (parent), name, age, interests[] (per personalizzare i set parole).
- `targets` — id, child_id, phoneme, position (`iniziale`|`intervocalica`|`gruppo`|`digramma`), syllable_complexity (`1`|`2`|`3`|`4plus`), level (`1..5`), set_by (`parent`|`screener`|`therapist`), status.
- `content` — id, target_id, type (game type), payload JSON (parole+immagini+audio ref), cached.
- `sessions` — id, child_id, content_id, completed_at, self_score.
- `achievements` — id, child_id, phoneme, unlocked_at (per le card traguardo).
- `therapist_links` — therapist_id, child_id, status (`pending`|`active`) — collegamento opzionale.
- `therapists` — id, profile_id, full_name, albo_number, albo_verified (bool), verified_at (accreditamento).
- `waitlist` — già esistente (role, name, email, extra, source).

RLS: il genitore vede solo i propri figli; il logopedista vede solo i bambini collegati e attivi; la anon key può solo inserire in `waitlist`. La tabella `therapists` con `albo_verified=false` non sblocca la dashboard pro.

## 5. Modello clinico (la spina dorsale)

Scala a 5 livelli (complessità dell'unità linguistica):

1. Suono isolato · 2. Sillaba · 3. Parola · 4. Frase · 5. Racconto.

Tre leve di difficoltà che si combinano (granularità italiana):

- **Posizione del fonema:** iniziale (rana), intervocalica (caro), gruppo consonantico (tra, str, pr, fr), digrammi/trigrammi (gn, gl, sc, sci).
- **Complessità sillabica:** 1 / 2 / 3 / 4+ sillabe. (Validata da una logopedista: rana ≠ arcobaleno.)
- **Livello linguistico:** la scala 1–5 sopra.

Assi distinti: produzione (registratore, gioco dell'oca, sequenze) vs discriminazione (caccia al suono, memory, coppie minime).

Fonemi prioritari MVP: R, sibilanti S/Z, poi SC/SCI, GN, gruppi TR/STR/PR. Parti da R e sibilanti.

## 6. Flussi e schermate

### 6.1 Onboarding + screener self-serve (chiave del B2C)

- Il genitore crea un profilo bambino (nome, età, interessi).
- Screener a immagini/audio (5–8 domande) che profila su quale suono lavorare e a che livello, e sblocca il primo gioco. Orienta, non diagnostica — con disclaimer.
- Gate di consenso genitoriale prima di qualsiasi microfono.
- Opzione visibile ma non obbligatoria: "Hai un logopedista? Collega la terapia" (codice/invito).

### 6.2 App bambino (3 tab)

- **Oggi:** i giochi del giorno + reward/streak.
- **Giochi:** galleria di tutti i giochi (vedi 6.3), con "Ripeti con Lallo" in evidenza.
- **Progressi:** barre per suono/posizione + card traguardo condivisibili + collezione sticker.

### 6.3 I 7 giochi (comportamento nella demo HTML)

Ognuno dichiara livello + asse clinico; ogni parola ha immagine + audio.

1. **Caccia al suono** — discriminazione (liv. 1–3): tocca le parole col fonema target.
2. **Registratore** — produzione + autoascolto (liv. 3–5): ascolta modello → registra → riascolta.
3. **Memory** — discriminazione + lessico (liv. 2–3): abbina coppie.
4. **Coppie minime** — discriminazione fine (liv. 3): sole/sale, tocca quella detta.
5. **Gioco dell'oca** — produzione ripetuta (liv. 3–4): avanza pronunciando.
6. **Sequenze illustrate** — narrazione (liv. 5): immagini in ordine → storia.
7. **Ripeti con Lallo 🦜** — feature virale (vedi 6.4).

### 6.4 Feature virali

- **Ripeti con Lallo:** il bambino dice una parola → Lallo la ripete con voce buffa da pappagallo. Nel prodotto reale: registra la voce del bambino (on-device, con consenso) e la ripete pitch-shiftata. Bottone "salva clip" → la condivisione la decide il genitore (mai pubblica di default).
- **Card traguardo:** quando il bambino conquista un suono, genera una cartolina condivisibile ("Marco ha conquistato la R!") — nessun volto/voce richiesti.

### 6.5 Area genitore (protetta da gate)

- Profili figli, progressi, paywall (vedi §8), consensi/privacy, gestione abbonamento.
- Impostazione "scegli il suono" quando non c'è un logopedista collegato.

### 6.6 Dashboard logopedista (opzionale)

- Accreditamento: nome, cognome, numero di iscrizione all'Albo dei Logopedisti (Ordine TSRM-PSTRP). Verifica manuale in fase fondatori (`albo_verified`), invite-only.
- Il logopedista imposta il piano (fonema/posizione/sillabe/livello/tipi di esercizio) e vede i progressi dei bambini collegati; può esportare un report.
- Anti-free-riding strutturale: il tier pro è la dashboard di gestione (gratis), NON contenuto premium gratis. Le famiglie pagano comunque l'abbonamento consumer. Un "logopedista" con 0 pazienti collegati = segnale d'abuso.

## 7. Monetizzazione (RevenueCat, stile Speech Blubs)

- Prova gratuita di 7 giorni, poi abbonamento.
- Annuale spinto rispetto al mensile, con framing per-mese e badge risparmio:
  - Annuale (in evidenza): ~€3,99/mese (fatturato ~€47,88/anno), "Risparmia ~50%", 7 giorni gratis.
  - Mensile: ~€7,99/mese.
  - (Prezzi di test — tarati sul mercato italiano, più bassi degli USA. Da validare.)
- Gratis per i logopedisti (dashboard pro), come da §6.6.
- Paywall in area genitore; profili multipli figlio su un solo abbonamento.

## 8. Brand & design system

- Colori: jade `#137A6E`, coral `#FF6A4D`, sun `#FFC53D`, paper `#FBF6EE`, ink `#1F2E2B`.
- Tipografia: Bricolage Grotesque (display), Figtree (body).
- Mascotte: Lallo il pappagallo.
- UX bambini: target grandi, gesti semplici (tap, drag), consegne in audio, feedback multisensoriale, mai punire l'errore, celebrare ogni tentativo. Navigazione protetta per l'area genitore.
- La grafica attuale (demo) usa emoji: placeholder. Prevedi un layer di illustrazioni reali coerenti (da definire con un logopedista per la non-ambiguità immagine→parola) — ma NON è priorità MVP.

## 9. Roadmap a fasi (non fare tutto insieme)

**Fase 1 — MVP (validare il loop):**

- Onboarding + screener self-serve + consenso genitoriale.
- Fonemi R e sibilanti, con le 3 leve (posizione, sillabe, livello).
- 3–4 giochi core: Caccia al suono, Registratore, Memory + Ripeti con Lallo.
- Card traguardo. Progressi base.
- Paywall RevenueCat (annuale spinto + trial).
- Supabase schema + RLS + consensi.

**Fase 2 — dopo i primi feedback:**

- Gioco dell'oca, Coppie minime, Sequenze illustrate.
- Dashboard logopedista + accreditamento albo + collegamento terapia.
- Voce ElevenLabs (sostituisce il fallback TTS).

**Fase 3:**

- Feedback articolatorio (video modello / specchio in camera — scelta clinica, da decidere coi piloti).
- Personalizzazione avatar/interessi, reminder quotidiani, pacchetti fonema offline.
- Illustrazioni definitive.

## 10. Cosa NON fare nell'MVP

- ❌ Diagnosi fonemica automatica / scoring ASR del bambino (non affidabile, rischio claim).
- ❌ Animazione 3D del feedback articolatorio (fase futura).
- ❌ Multilingua (l'italiano è il vantaggio).
- ❌ Acquisizione a pagamento / ad-SDK.
