// Autenticazione genitore via Supabase Auth — email + codice OTP a 6 cifre (no password,
// no deep link): il genitore riceve un'email con un codice, lo digita nell'app. Scelta
// deliberata invece del "magic link" cliccabile: un link che riapre l'app via deep link
// (schema lallo://) è fragile da testare in Expo Go (usa un proprio schema URL e un IP di
// rete locale che cambia a ogni sessione) — il codice OTP raggiunge lo stesso obiettivo
// (accesso senza password) senza quella complessità.
//
// Login social (Google/Facebook): stesso backend Supabase Auth, via OAuth. Su web basta un
// redirect normale; su nativo serve aprire il browser di sistema e recuperare i token dal
// deep link di ritorno (schema "lallo://", già registrato in app.json) — vedi
// signInWithGoogle/signInWithFacebook più sotto.
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
  if (Platform.OS === "web") {
    // Su web il redirect torna semplicemente sulla stessa pagina: Supabase gestisce la
    // sessione da sola leggendo il token dall'URL al caricamento successivo.
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
    return { error };
  }

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
