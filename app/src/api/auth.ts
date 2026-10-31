// Autenticazione genitore via Supabase Auth — email + codice OTP a 6 cifre (no password,
// no deep link): il genitore riceve un'email con un codice, lo digita nell'app. Scelta
// deliberata invece del "magic link" cliccabile: un link che riapre l'app via deep link
// (schema lallo://) è fragile da testare in Expo Go (usa un proprio schema URL e un IP di
// rete locale che cambia a ogni sessione) — il codice OTP raggiunge lo stesso obiettivo
// (accesso senza password) senza quella complessità.
//
// Login social (Google/Facebook): stesso backend Supabase Auth, via OAuth. Su nativo si apre
// il browser di sistema e si recuperano i token dal deep link di ritorno (schema "lallo://",
// già registrato in app.json). Su web NON si fa un redirect a piena pagina: ricaricherebbe
// tutta l'app e perderebbe lo stato dell'onboarding (nome/avatar/suoni del bambino, tenuti
// nei parametri di navigazione finché non si arriva qui) prima ancora di salvarlo — si apre
// invece una finestra popup, stessa logica del browser di sistema su nativo, così la pagina
// principale non si ricarica mai. Vedi signInWithGoogle/signInWithFacebook più sotto.
import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import { supabase } from "./supabase";

WebBrowser.maybeCompleteAuthSession();

// Invia il codice via email. shouldCreateUser:true perché nel modello parent-first non
// c'è un passaggio di "registrazione" separato — il primo accesso crea l'account.
export async function requestOtpCode(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });
  return { error };
}

export async function verifyOtpCode(email: string, code: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: "email",
  });
  return { data, error };
}

// Richiede il provider Google/Facebook già abilitato su Supabase (Authentication → Providers,
// con Client ID/Secret reali creati su Google Cloud Console / Meta for Developers) — senza
// quello, signInWithOAuth restituisce un errore chiaro invece di aprire un browser a vuoto.
async function signInWithProvider(provider: "google" | "facebook") {
  if (Platform.OS === "web") return signInWithProviderWeb(provider);

  const redirectTo = makeRedirectUri({ scheme: "lallo" });
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error || !data?.url) {
    return { error: error ?? new Error("Nessun URL di autenticazione ricevuto da Supabase") };
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type === "cancel" || result.type === "dismiss") {
    return { error: null, cancelled: true };
  }
  if (result.type !== "success" || !result.url) {
    return { error: new Error("Accesso non riuscito, riprova.") };
  }

  // Supabase rimanda i token nel frammento dell'URL (dopo il #), non come query string.
  const fragment = result.url.split("#")[1] ?? "";
  const params = new URLSearchParams(fragment);
  const access_token = params.get("access_token");
  const refresh_token = params.get("refresh_token");
  if (!access_token || !refresh_token) {
    return { error: new Error("Token di accesso mancanti nella risposta.") };
  }

  const { error: sessionError } = await supabase.auth.setSession({ access_token, refresh_token });
  return { error: sessionError };
}

// Apre Google/Facebook in un popup invece di un redirect a piena pagina (vedi motivo sopra),
// e aspetta che torni sulla nostra stessa origine prima di leggere i token dal frammento
// dell'URL — identico a come il ramo nativo legge l'URL restituito da expo-web-browser.
function signInWithProviderWeb(provider: "google" | "facebook"): Promise<{ error: Error | null; cancelled?: boolean }> {
  return new Promise((resolve) => {
    const redirectTo = window.location.origin;
    // Il popup va aperto QUI, in modo sincrono e PRIMA di qualunque await — altrimenti il
    // browser non lo riconosce più come conseguenza diretta del tap dell'utente e lo blocca
    // in silenzio. Si apre vuoto e lo si naviga verso l'URL vero solo dopo averlo ricevuto.
    const popup = window.open("", "lallo-oauth", "width=480,height=640");
    if (!popup) {
      resolve({ error: new Error("Il browser ha bloccato la finestra di accesso. Consenti i popup per lallo.app e riprova.") });
      return;
    }

    (async () => {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (error || !data?.url) {
        popup.close();
        resolve({ error: error ?? new Error("Nessun URL di autenticazione ricevuto da Supabase") });
        return;
      }
      popup.location.href = data.url;

      // Finché il popup è su Google/Facebook/Supabase (un'altra origine), leggere
      // popup.location.href lancia un errore di sicurezza del browser — normale, continuiamo
      // a riprovare finché non torna sulla nostra stessa origine dopo il login.
      const TIMEOUT_MS = 120_000;
      const startedAt = Date.now();
      const interval = setInterval(() => {
        if (popup.closed) {
          clearInterval(interval);
          resolve({ error: null, cancelled: true });
          return;
        }
        if (Date.now() - startedAt > TIMEOUT_MS) {
          clearInterval(interval);
          popup.close();
          resolve({ error: new Error("Accesso scaduto, riprova.") });
          return;
        }
        let currentUrl: string | null = null;
        try {
          currentUrl = popup.location.href;
        } catch {
          return; // ancora su un'altra origine, va bene, riprova al prossimo giro
        }
        if (!currentUrl.startsWith(redirectTo)) return;

        clearInterval(interval);
        popup.close();
        const fragment = currentUrl.split("#")[1] ?? "";
        const params = new URLSearchParams(fragment);
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");
        if (!access_token || !refresh_token) {
          resolve({ error: new Error("Token di accesso mancanti nella risposta.") });
          return;
        }
        supabase.auth.setSession({ access_token, refresh_token }).then(({ error: sessionError }) => {
          resolve({ error: sessionError });
        });
      }, 500);
    })();
  });
}

export async function signInWithGoogle() {
  return signInWithProvider("google");
}

export async function signInWithFacebook() {
  return signInWithProvider("facebook");
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// Notifica ad ogni cambio di sessione (login/logout/refresh token). Ritorna la funzione
// per annullare l'iscrizione.
export function onAuthStateChange(callback: (session: import("@supabase/supabase-js").Session | null) => void) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
}
