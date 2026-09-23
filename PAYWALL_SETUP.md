# Paywall reale (RevenueCat) — checklist di setup

Il codice lato app è pronto (vedi `app/src/api/purchases.ts` e `app/src/screens/PaywallScreen.tsx`).
Quello che manca è la parte che solo tu puoi fare: creare gli abbonamenti veri su App Store
Connect e Google Play Console, poi collegarli a RevenueCat. Segui questi passaggi in ordine.

## 1. Crea i due abbonamenti su App Store Connect (iOS)

Hai già l'account sviluppatore Apple attivo, quindi:

1. App Store Connect → la tua app → **Funzionalità → Acquisti in-app** → **+**
2. Crea un **gruppo di abbonamenti** (es. "Lallo Premium") se non esiste già
3. Dentro il gruppo, crea due abbonamenti auto-rinnovabili:
   - **Annuale**: ID prodotto `lallo_annual` — prezzo che corrisponda a ~€47,88/anno
     (framing "€3,99/mese" nell'app)
   - **Mensile**: ID prodotto `lallo_monthly` — prezzo ~€7,99/mese
4. Su entrambi, configura **7 giorni di prova gratuita** (Introductory Offer → Free Trial)
5. Aggiungi le informazioni di localizzazione italiane richieste (nome visualizzato,
   descrizione) — obbligatorie per la review

Gli ID prodotto (`lallo_annual`, `lallo_monthly`) devono corrispondere esattamente a quelli
che userai in RevenueCat al punto 3.

## 2. Crea i due abbonamenti su Google Play Console (Android)

1. Play Console → la tua app → **Monetizza → Prodotti → Abbonamenti**
2. Crea un abbonamento con ID `lallo_annual`, poi al suo interno un **piano base** annuale
   con **offerta di prova gratuita di 7 giorni**
3. Crea un secondo abbonamento con ID `lallo_monthly`, piano base mensile
4. Stessi prezzi indicativi del punto 1 (Play Console converte automaticamente nelle altre
   valute)

## 3. Crea l'account RevenueCat e collega i due store

1. Vai su [app.revenuecat.com](https://app.revenuecat.com) e crea un account (piano
   gratuito, sufficiente per iniziare)
2. Crea un nuovo progetto, es. "Lallo"
3. **Project settings → Integrations → App Store Connect**: collega il tuo account Apple
   (serve una chiave API di App Store Connect, RevenueCat ti guida nella creazione)
4. **Project settings → Integrations → Google Play**: collega il tuo account Google Play
   (serve un service account con permessi, anche qui RevenueCat guida passo passo)
5. **Products**: importa/crea i 4 prodotti (`lallo_annual` e `lallo_monthly` per iOS,
   stessi ID per Android — RevenueCat li unifica automaticamente per ID)
6. **Entitlements**: crea un entitlement con ID esatto **`premium`** (deve combaciare con
   `PREMIUM_ENTITLEMENT_ID` in `app/src/api/purchases.ts`) e collega ad esso entrambi i
   prodotti (annuale e mensile)
7. **Offerings**: crea un'offerta "default" (current) con due package:
   - package `$rc_annual` → prodotto `lallo_annual`
   - package `$rc_monthly` → prodotto `lallo_monthly`

## 4. Prendi le due API key pubbliche

**Project settings → API keys**: copia la chiave iOS e la chiave Android (sono chiavi
pubbliche, pensate per stare nel bundle client-side — diverse dalle secret key usate per le
API server-to-server, quelle non servono qui).

Mettile in `app/.env.local` (mai committato):

```
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxxxxxxx
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_xxxxxxxx
```

## 5. Build e test (niente Expo Go da qui in poi)

`react-native-purchases` è un modulo nativo: **non funziona in Expo Go** e **non esiste sul
web** — per testare acquisti veri serve una EAS development build:

```
cd app
npx eas build --profile development --platform ios
# oppure --platform android
```

Installa la build sul telefono, poi:
- **iOS**: usa un [Sandbox Tester](https://developer.apple.com/documentation/storekit/testing-in-app-purchases-with-sandbox) (App Store Connect → Utenti e accessi → Sandbox) per acquistare senza pagare davvero
- **Android**: aggiungi il tuo account come **internal tester** nel canale di test interno di Play Console, gli acquisti in quel canale sono automaticamente in modalità test

## Cosa succede nell'app finché questo non è fatto

- Sul **web** e in **Expo Go**: il Paywall mostra i prezzi di fallback (statici, quelli nel
  brief) e il tasto "Inizia la prova gratuita" mostra un messaggio onesto invece di fingere
  un acquisto riuscito — niente più sblocco finto come nella versione precedente.
- Il piano gratuito (`Continua con il piano gratuito`) funziona sempre, in ogni ambiente.
- Appena le chiavi RevenueCat sono impostate E sei su una build reale (non Expo Go), il
  Paywall mostra automaticamente i prezzi veri dallo store e gli acquisti/ripristini
  funzionano davvero.
