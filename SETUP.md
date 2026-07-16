# Setup — da qui a Claude Code

## 1. Installa Claude Code (se non l'hai già)
Da terminale (macOS):
```
npm install -g @anthropic-ai/claude-code
```
Oppure scarica l'app Claude Desktop, che include Claude Code nella tab "Code".

## 2. Scompatta questo progetto
Metti la cartella `lallo-handoff/` (o il suo contenuto) in una cartella di lavoro, es:
```
mkdir -p ~/dev/lallo
# copia dentro tutto il contenuto di lallo-handoff/
cd ~/dev/lallo
```

## 3. Avvia Claude Code dentro quella cartella
```
cd ~/dev/lallo
claude
```
Claude Code legge automaticamente i file nella cartella corrente.

## 4. Primo prompt da dare a Claude Code
Copia e incolla questo (o adattalo):

---

Leggi CLAUDE_CODE_BRIEF.md nella root di questo progetto — contiene tutto il contesto del prodotto Lallo e lo stato attuale del codice in app/.

Il codice in app/ è codice sorgente TypeScript/React Native ma non è ancora uno scaffold Expo completo (mancano app.json, babel.config.js, tsconfig.json, assets/).

Fammi questo, in ordine:
1. Genera un nuovo progetto Expo (SDK 51, TypeScript) in una cartella pulita
2. Importa tutti i file da app/src/ e app/App.tsx dentro il nuovo progetto, sovrascrivendo lo scaffold di default
3. Installa tutte le dipendenze elencate in app/package.json
4. Configura il supporto web (react-native-web + react-dom, già nel package.json) così l'app gira sia con `expo start --ios` che con `expo start --web`
5. Prova a far partire il progetto e correggi qualsiasi errore di build o di tipo che emerge — finora è stato verificato solo con un checker di sintassi (esbuild), non un vero compilatore TypeScript né il runtime React Native, quindi aspettati che qualcosa vada sistemato
6. Alla fine dimmi come lanciare l'app sia su iPhone (Expo Go) sia sul web

---

## 5. Testare su iPhone
- Installa **Expo Go** dall'App Store sul tuo iPhone
- Con il progetto in esecuzione (`npx expo start`), inquadra il QR code che appare nel terminale con la fotocamera dell'iPhone
- Si apre dentro Expo Go

## 6. Testare sul web (per farla provare ai primi utenti)
```
npx expo start --web
```
Si apre in `localhost` nel browser. Per farla vedere a qualcun altro fuori dalla tua rete, o per un vero link da condividere, chiedi a Claude Code di fare il deploy della build web (es. su Vercel, che già usi per la landing page) con:
```
npx expo export --platform web
```
e poi deploy della cartella `dist/` generata.

## Attenzione
- `react-native-purchases` (RevenueCat, per gli acquisti in-app) **non funziona** in Expo Go né sul web — se Claude Code segnala errori legati a quel pacchetto durante `expo start --web`, è normale: va isolato dietro un controllo di piattaforma (`Platform.OS !== 'web'`) o mockato finché non serve davvero.
- Il primo avvio potrebbe richiedere che Claude Code risolva conflitti di versione tra i pacchetti — è normale, fallo lavorare finché non ottieni un build pulito.
