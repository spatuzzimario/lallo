# Login con Google e Facebook — checklist di setup

Il codice lato app è pronto (vedi `app/src/api/auth.ts` e `app/src/screens/AuthScreen.tsx`).
Quello che manca è la parte che solo tu puoi fare: creare le app OAuth vere su Google e Meta,
poi collegarle a Supabase. Segui questi passaggi in ordine.

## 1. Trova l'URL di callback di Supabase

Ti servirà uguale per entrambi i provider:

```
https://zrzrmarrhiityuoszdze.supabase.co/auth/v1/callback
```

## 2. Crea le credenziali OAuth su Google Cloud Console

1. Vai su [console.cloud.google.com](https://console.cloud.google.com) → crea un progetto (o usane
   uno esistente), es. "Lallo"
2. **APIs & Services → OAuth consent screen**: tipo "External", compila nome app (Lallo), email
   di supporto, logo (usa `app/assets/icon.png`)
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
4. Tipo applicazione: **Web application** (basta questa: il flusso usato dall'app passa comunque
   dal browser di sistema verso Supabase, non serve un client ID separato per iOS/Android)
5. In **Authorized redirect URIs** incolla l'URL del punto 1
6. Salva: ottieni **Client ID** e **Client Secret**

## 3. Crea l'app su Meta for Developers (Facebook)

1. Vai su [developers.facebook.com](https://developers.facebook.com) → **My Apps → Create App**
   → tipo "Consumer"
2. Aggiungi il prodotto **Facebook Login** dalla dashboard dell'app
3. **Facebook Login → Settings**: in **Valid OAuth Redirect URIs** incolla lo stesso URL del
   punto 1
4. **Impostazioni → Base**: qui trovi **App ID** e **App Secret**
5. Le permission usate (`email`, `public_profile`) sono standard e non richiedono una review di
   Meta per iniziare a testare — ma prima di pubblicare per davvero controlla che l'app non sia
   più in modalità "Development" (altrimenti solo gli account che aggiungi come tester possono
   accedere)

## 4. Collega entrambi a Supabase

**Authentication → Providers**:
- **Google**: attiva, incolla Client ID e Client Secret dal punto 2
- **Facebook**: attiva, incolla App ID e App Secret dal punto 3

**Authentication → URL Configuration → Redirect URLs**: aggiungi

```
lallo://
```

(lo schema dell'app, già impostato in `app.json` — senza questo in lista, Supabase rifiuta il
redirect di ritorno dal browser verso l'app dopo il login)

## 5. Testa

Serve una build reale (non Expo Go, come per RevenueCat) — da TestFlight o una development
build, tocca "Continua con Google"/"Continua con Facebook" nella schermata di accesso e
verifica che torni nell'app già loggato.
