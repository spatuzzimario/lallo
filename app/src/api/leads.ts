// Cattura leggera dell'email del genitore PRIMA dello screener (fine onboarding: molti
// genitori rispondevano alle domande dello screener e poi abbandonavano proprio davanti al
// vero gate di registrazione — AuthScreen — senza lasciare nessun contatto). Non è una
// registrazione vera: nessuna verifica email, nessun utente Supabase creato qui, nessuna
// sessione — solo un insert nella stessa tabella `waitlist` già usata dalla landing page
// (RLS solo-inserimento, non serve essere autenticati, a questo punto dell'onboarding
// l'account vero non esiste ancora). Se fallisce non deve mai bloccare l'onboarding: è un
// extra, non il percorso critico.
import { supabase } from "./supabase";

export async function captureLeadEmail(input: { email: string; childName?: string }) {
  const { error } = await supabase.from("waitlist").insert({
    role: "genitore",
    name: input.childName || "",
    email: input.email,
    source: "onboarding_app",
  });
  return { error };
}
