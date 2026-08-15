// Autenticazione genitore via Supabase Auth — email + codice OTP a 6 cifre (no password,
// no deep link): il genitore riceve un'email con un codice, lo digita nell'app. Scelta
// deliberata invece del "magic link" cliccabile: un link che riapre l'app via deep link
// (schema lallo://) è fragile da testare in Expo Go (usa un proprio schema URL e un IP di
// rete locale che cambia a ogni sessione) — il codice OTP raggiunge lo stesso obiettivo
// (accesso senza password) senza quella complessità.
import { supabase } from "./supabase";

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
