// Client Supabase — NON ancora collegato a un progetto reale: EXPO_PUBLIC_SUPABASE_URL e
// EXPO_PUBLIC_SUPABASE_ANON_KEY non sono ancora impostate (vedi .env.example alla radice
// dell'app). Il progetto esistente è https://zrzrmarrhiityuoszdze.supabase.co (da CLAUDE.md)
// ma la anon key non è nel repo — va aggiunta come variabile d'ambiente, mai committata.
//
// Finché le env var non sono impostate, isSupabaseConfigured è false e tutte le schermate
// devono continuare a funzionare sullo store locale (useGamificationStore), come fanno oggi.
// Nessuna schermata scrive ancora su queste tabelle: questo file è solo lo scheletro del
// client + lo schema (supabase/schema.sql) pronti per quando le credenziali arriveranno.
import { createClient } from "@supabase/supabase-js";

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
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
);
