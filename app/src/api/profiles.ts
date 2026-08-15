// Crea/aggiorna la riga `profiles` collegata all'utente Supabase Auth appena loggato.
// Nel modello parent-first non c'è un passaggio di registrazione separato: il primo
// accesso (via OTP) crea sia l'utente Auth sia il suo profilo "parent" in un colpo solo.
import { supabase } from "./supabase";

export async function ensureParentProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: new Error("Nessun utente autenticato") };

  const { error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, role: "parent" }, { onConflict: "id" });
  return { error };
}
