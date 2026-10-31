// Client Supabase — NON ancora collegato a un progetto reale: EXPO_PUBLIC_SUPABASE_URL e
// EXPO_PUBLIC_SUPABASE_ANON_KEY non sono ancora impostate (vedi .env.example alla radice
// dell'app). Il progetto esistente è https://zrzrmarrhiityuoszdze.supabase.co (da CLAUDE.md)
// ma la anon key non è nel repo — va aggiunta come variabile d'ambiente, mai committata.
//
// Finché le env var non sono impostate, isSupabaseConfigured è false e tutte le schermate
// devono continuare a funzionare sullo store locale (useGamificationStore), come fanno oggi.
// Nessuna schermata scrive ancora su queste tabelle: questo file è solo lo scheletro del
// client + lo schema (supabase/schema.sql) pronti per quando le credenziali arriveranno.
import { Platform } from "react-native";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    "[supabase] EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY non impostate — " +
      "l'app resta in modalità locale (nessuna persistenza reale). Vedi app/.env.example."
  );
}

// Client "no-op" quando non configurato: evita di far esplodere l'app con una URL fittizia,
// ma qualunque chiamata reale fallirà finché non vengono impostate le env var vere.
//
// Senza `auth.storage` qui, il client supabase-js in React Native non ha nessun posto dove
// scrivere la sessione su disco: sopravvive solo finché il processo dell'app resta vivo, e
// sparisce ogni volta che l'app viene chiusa del tutto (il comportamento riportato dal
// founder su TestFlight — richiesto di nuovo login e onboarding a ogni riavvio, perché
// App.tsx non trovava più nessuna sessione da cui ripartire).
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key",
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      // Su web, dopo il redirect di ritorno da Google/Facebook la sessione arriva dentro
      // l'URL della pagina (hash o ?code=): true fa sì che supabase-js la legga da sola al
      // caricamento. Su nativo questo non si applica (non c'è un "URL della pagina" — il
      // ritorno da Google/Facebook lo intercettiamo noi via expo-web-browser in auth.ts) e
      // andava lasciato false per non far cercare a supabase-js un URL che qui non esiste.
      detectSessionInUrl: Platform.OS === "web",
    },
  }
);
