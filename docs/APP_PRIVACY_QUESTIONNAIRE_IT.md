# Questionario "App Privacy" di App Store Connect — risposte per Lallo

Guida compilata controllando il codice reale dell'app (non supposizioni): cosa viene
davvero raccolto, cosa resta sul dispositivo, e con chi viene condiviso. I nomi delle
voci sono quelli esatti che trovi nel modulo di App Store Connect (App Privacy →
"Get Started"), in inglese, con la spiegazione in italiano a fianco.

## Prima domanda del modulo

**"Does this app collect data?"** → **Yes** (l'email del genitore e i dati del
profilo bambino sono raccolti sul nostro backend Supabase).

## Riepilogo di cosa NON raccogliamo (e perché puoi rispondere "no" con sicurezza)

Prima delle voci da marcare, è utile sapere cosa ho verificato riga per riga nel
codice per poter escludere queste categorie — altrimenti rischieresti di
dichiarare più del vero, che è un problema quanto dichiarare meno:

- **Audio Data (voce del bambino)**: il riconoscimento vocale del Gioco dell'oca è
  configurato con `requiresOnDeviceRecognition: true` (vedi `useOcaListening.ts`) e
  commentato esplicitamente come scelta "non negoziabile GDPR-K: nessun fallback al
  cloud". Non esiste nel codice dell'app nessuna chiamata che carichi un file audio
  su un server (né nostro né di terzi). L'audio non lascia mai il telefono: per la
  definizione di Apple ("dati trasmessi fuori dal dispositivo"), questo non conta
  come dato raccolto.
- **Photos or Videos (Album)**: le foto scattate restano un URI locale nel
  dispositivo; la tabella `children` su Supabase non ha nessuna colonna per foto, e
  non c'è nel codice nessuna chiamata di upload verso Supabase Storage. Le foto non
  vengono mai trasmesse.
- **Precise/Coarse Location**: l'app non chiede il permesso di localizzazione e non
  usa nessuna API di posizione.
- **Contacts**: non usati.
- **Browsing/Search History**: non applicabile, l'app non ha un browser o una
  ricerca web.
- **Diagnostics (Crash Data, Performance Data)**: nessun SDK di crash-reporting o
  analytics è installato (controllato in `package.json`: niente Sentry, Firebase,
  Amplitude, Mixpanel o simili). Se in futuro ne aggiungi uno, questa risposta andrà
  aggiornata.
- **Advertising Data**: nessun SDK pubblicitario, coerente con CLAUDE.md §2.3.
- **Device ID / push token verso un server**: i promemoria usano solo notifiche
  locali pianificate sul dispositivo (`scheduleNotificationAsync`); nessun token
  viene inviato a un server.

## Domanda su tracciamento (App Tracking Transparency)

**"Do you use data collected from this app to track users?"** → **No**. Significa
anche che l'app non deve mostrare il prompt ATT ("Chiedi di non tracciare") — non ce
n'è bisogno perché non tracciamo nessuno tra app/siti di terzi, e non vendiamo né
condividiamo dati con data broker.

## Tipi di dati da dichiarare come raccolti

Per ciascuno, il modulo chiede: a che scopo lo usi (**Purpose**), se è collegato
all'identità della persona (**Linked to the user's identity**) e se è usato per
tracciare (**Used for tracking** — sempre **No** qui, vedi sopra).

### Contact Info → Email Address
- **Raccolto**: sì — email del genitore, per l'accesso con codice temporaneo (OTP)
  via Supabase Auth.
- **Linked to identity**: **Yes**.
- **Used for tracking**: **No**.
- **Purpose**: **App Functionality** (accesso all'account).

### Contact Info → Name
- **Raccolto**: sì — il nome che il genitore inserisce per il bambino (e, se un
  logopedista si registra, nome e cognome professionali in `therapists`).
- **Linked to identity**: **Yes**.
- **Used for tracking**: **No**.
- **Purpose**: **App Functionality** (personalizzare l'app con il nome del
  bambino).

### Identifiers → User ID
- **Raccolto**: sì — l'id dell'account/bambino su Supabase, usato anche come
  identificativo RevenueCat (`Purchases.logIn`) per collegare l'abbonamento
  all'account giusto.
- **Linked to identity**: **Yes**.
- **Used for tracking**: **No**.
- **Purpose**: **App Functionality**.

### Other Data
- **Raccolto**: sì — data di nascita, interessi, avatar scelto, genere del
  bambino (il genere serve solo per la grammatica italiana dei testi, "bravo"/
  "brava" — non è un dato clinico).
- **Linked to identity**: **Yes**.
- **Used for tracking**: **No**.
- **Purpose**: **App Functionality** e **Product Personalization** (personalizza
  i set di parole in base a età/interessi).

### Usage Data → Product Interaction
- **Raccolto**: sì — suoni allenati, livello, stelle, sessioni completate, traguardi
  conquistati (tabelle `targets`/`sessions`/`achievements`).
- **Linked to identity**: **Yes** (collegato al bambino).
- **Used for tracking**: **No**.
- **Purpose**: **App Functionality** (è il meccanismo stesso dei progressi/gioco,
  non analytics esterna: non abbiamo nessun tool di analytics che legga questi
  dati in aggregato).

### Purchases → Purchase History
- **Raccolto**: sì — stato dell'abbonamento, gestito da RevenueCat e collegato
  all'account (vedi User ID sopra). Non vediamo mai i dati della carta di
  pagamento: quelli restano tra l'utente e Apple/Google.
- **Linked to identity**: **Yes**.
- **Used for tracking**: **No**.
- **Purpose**: **App Functionality**.

## Nota su "collegato all'identità" per tutte le voci sopra

Tutte le voci sono legate all'account del genitore (o alla riga `children` del
bambino, che è sempre collegata a `owner_id`), quindi in ogni caso vanno dichiarate
come **"Linked to the user's identity" = Yes** — non esiste raccolta anonima nel
nostro backend per queste categorie.

## Promemoria

Questa pagina riflette il codice **di oggi**. Se in futuro aggiungi un SDK di
analytics, crash reporting o pubblicità, o inizi a caricare audio/foto su un
server, questo documento (e la dichiarazione reale su App Store Connect) vanno
aggiornati di conseguenza — altrimenti l'app rischia un rifiuto in review per
dichiarazione privacy non accurata.
