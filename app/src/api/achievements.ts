// CRUD minimo sulla tabella `achievements` — una riga per fonema completamente conquistato
// (tutti i livelli del gruppo a status "mastered", non solo un livello). Vedi
// useGamificationStore per il calcolo della transizione locale che triggera la scrittura.
// Solo il dato per ora: niente cartolina condivisibile ancora (CLAUDE.md §6.4), quella resta
// un task a parte.
import { supabase } from "./supabase";

export interface AchievementRow {
  id: string;
  child_id: string;
  phoneme: string;
  unlocked_at: string;
}

// ignoreDuplicates: il vincolo UNIQUE (child_id, phoneme) fa da rete di sicurezza finale
// se questa venisse chiamata due volte per lo stesso fonema (es. due sessioni ravvicinate
// prima che lo stato locale unlockedAchievements si aggiorni) — non deve mai fallire
// rumorosamente per un duplicato, è un'scrittura "almeno una volta", non "esattamente una".
export async function unlockAchievement(input: { childId: string; phoneme: string }) {
  const { data, error } = await supabase
    .from("achievements")
    .upsert(
      { child_id: input.childId, phoneme: input.phoneme },
      { onConflict: "child_id,phoneme", ignoreDuplicates: true }
    )
    .select()
    .maybeSingle<AchievementRow>();
  return { data, error };
}

// Per il ripristino all'avvio (App.tsx).
export async function getAchievements(childId: string) {
  const { data, error } = await supabase
    .from("achievements")
    .select("*")
    .eq("child_id", childId)
    .returns<AchievementRow[]>();
  return { data, error };
}
