# Lallo — Brief per Claude Code

## Cos'è
Lallo è un'app di logopedia pediatrica per il mercato italiano, modello B2B2C: il logopedista assegna fonema/posizione/livello, il bambino si esercita a casa con giochi, il genitore vede i progressi. Fondatore: solo founder, bootstrap.

Marchio: colori esatti — jade `#137A6E`, corallo `#FF6A4D`, sole `#FFC53D`, carta `#FBF6EE`, mist `#E4EFEA`, ink `#1F2E2B`. Font previsti (non ancora agganciati nell'app): Bricolage Grotesque (display) + Figtree (corpo) — vedi `landing/index.html` per l'uso reale.

## Cosa contiene questa cartella
- `app/` — codice sorgente TypeScript/React Native dell'app (Expo). **Non è ancora uno scaffold Expo completo** — mancano `app.json`, `babel.config.js`, `tsconfig.json`, cartella `assets/`. Il primo passo è generare un progetto Expo pulito e importare questi file dentro, non lanciarlo così com'è.
- `landing/index.html` — landing page di marketing, single-file, già funzionante e deployata (demo interattiva con vista bambino/logopedista). Non toccarla a meno che non venga chiesto esplicitamente.
- `docs/GAMIFICATION_DESIGN.md` — documento di design del sistema di gamification (stelle, streak, mastery).
- `docs/Lallo_Modello_Ibrido.xlsx` — modello economico per l'eventuale marketplace di logopedisti da remoto (scenario, non decisione presa).
- `reference/LalloPreview-legacy-chat-artifact.jsx` — versione React "clone" dell'app che usavo per darti anteprima visiva dentro la chat. **Superata da Expo Web** (vedi sotto) — tienila solo come riferimento storico di cosa è stato costruito, non svilupparci sopra.

## Architettura attuale (app/)
- Expo SDK 51, React Native 0.74, TypeScript
- Navigazione: `@react-navigation/native-stack` + `@react-navigation/bottom-tabs`
- Stato: store custom in stile Zustand (`src/store/useGamificationStore.ts`), nessuna persistenza reale — tutto in memoria, si perde al reload
- `src/constants/wordBank.ts` — 25 categorie fonemiche italiane (iniziale/mediana), 342 parole con emoji, + `FREE_PHONEMES`/`isPremium` per il paywall, + `MINIMAL_PAIRS` per il gioco Coppie minime
- `src/types/gamification.ts` — tipi condivisi
- `src/screens/`:
  - `OnboardingScreens.tsx` — Trust → collegamento logopedista (codice / waitlist remoto / salta) → nome → data di nascita
  - `DiagnosticScreens.tsx` — percorso lungo per chi NON ha un logopedista: quante parole dice, se è stato valutato, condizioni (domanda condizionale: se non valutato chiede "cosa pensi siano le difficoltà", non "diagnosi"), quali suoni fa fatica a pronunciare, statistica di fiducia (dati reali, **mai testimonianze finte**), riepilogo piano
  - `PaywallScreen.tsx` — 6 fonemi gratis, resto a pagamento, 3 fasce prezzo. **Prezzi segnaposto**, UI-only, nessuna integrazione pagamenti reale
  - `HomeScreen.tsx` / `GiochiScreen.tsx` / `ProgressiScreen.tsx` — le 3 tab principali (Oggi/Giochi/Progressi)
  - `SessionScreen.tsx` — i 6 giochi: Caccia al suono, Registratore, Memory, Coppie minime, Gioco dell'oca, Sequenze illustrate
  - `ParentScreens.tsx` — gate matematico + dashboard genitori (solo osservativa, non riassegna il piano — quello resta al logopedista)
  - `TherapistAssignScreen.tsx` — **non collegato all'app**, tenuto da parte per una futura app separata per logopedisti con login proprio (decisione già presa, non riaprire la discussione)

## Cosa manca / prossimi passi noti
1. **Scaffold Expo vero** — creare il progetto con `npx create-expo-app`, importare `app/src` e `app/App.tsx`
2. **Supporto Web** — aggiungere `react-native-web` + `react-dom` (già in `package.json`), verificare che tutti gli schermi rendano bene in browser con `npx expo start --web`. Expo-speech supporta il web nativamente; `react-native-purchases` (RevenueCat) NO — non funziona in Expo Go né sul web, richiede un dev client custom, va isolato/mockato per ora
3. **Persistenza reale** — Supabase è lo stack scelto (project ref già in memoria del progetto), ma non ancora collegato: tutto lo stato oggi è locale e volatile
4. **Registratore** — oggi il tasto microfono simula la registrazione, manca la vera pipeline audio (expo-av o simile) + analisi di confidenza
5. **Paywall enforcement** — oggi il paywall si vede solo a fine onboarding; non blocca ancora il tap su un fonema premium dentro Oggi/Giochi/Progressi
6. **Font custom** — Bricolage Grotesque + Figtree non ancora caricati nell'app (solo nella landing HTML)
7. **App logopedista separata** — non iniziata, sarà un progetto a parte con login proprio

## Cosa voglio da te ora
1. Genera uno scaffold Expo pulito e importa questi file
2. Fai girare l'app in locale, sia per iOS (Expo Go) sia per Web (`expo start --web`) — **stessa codebase per entrambi, non creare file paralleli separati**
3. Corregggi eventuali errori di build/tipo che emergono (finora ho potuto verificare solo la sintassi con esbuild, non un vero compilatore TypeScript né il runtime React Native)
4. Poi procediamo con la lista di correzioni che ti do via via

## Convenzioni da rispettare
- Testi e commenti in italiano (il pubblico e il founder sono italiani)
- Non inventare mai testimonianze, nomi, o credenziali finte per contenuti di marketing/onboarding
- Il logopedista resta sempre l'autorità clinica — la vista genitori è osservativa, mai editabile
- I colori del brand sono quelli sopra, non approssimarli
