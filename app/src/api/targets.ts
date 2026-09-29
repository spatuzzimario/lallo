// CRUD sulla tabella `targets` — un solo target "vivo" per (child_id, phoneme): il livello
// avanza aggiornando la stessa riga, non creandone una nuova (vedi nota 4 in
// supabase/schema.sql). La storia dei livelli passati resta comunque in `sessions` via
// target_id, quindi qui non si perde nulla.
import { supabase } from "./supabase";
import { ClinicalLevel } from "../types/gamification";

export interface TargetRow {
  id: string;
  child_id: string;
  phoneme: string;
  level: ClinicalLevel;
  set_by: "parent" | "screener" | "therapist";
  status: "active" | "mastered" | "paused";
  created_at: string;
}

// Crea o rimpiazza il target per un fonema, includendo set_by — usata solo quando il
// fonema viene assegnato/scelto da capo (screener self-directed, assegnazione logopedista,
// o esplorazione libera in Giochi). Sovrascrive set_by anche se il target esisteva già: va
// bene perché queste sono tutte "nuove assegnazioni", non semplice avanzamento.
export async function upsertTarget(input: {
  childId: string;
  phoneme: string;
  level: ClinicalLevel;
  setBy: "parent" | "screener" | "therapist";
}) {
  const { data, error } = await supabase
    .from("targets")
    .upsert(
      {
        child_id: input.childId,
        phoneme: input.phoneme,
        level: input.level,
        set_by: input.setBy,
        status: "active",
      },
      { onConflict: "child_id,phoneme" }
    )
    .select()
    .single<TargetRow>();
  return { data, error };
}

// Avanzamento all'interno di un fonema già assegnato (chiamata da recordSession ad ogni
// sessione completata): aggiorna solo level/status, non tocca set_by — chi ha assegnato il
// fonema in origine resta quello, anche se il bambino avanza da solo di livello in livello.
// Se il target non esiste ancora (fonema esplorato senza assegnazione precedente, es. da
// Giochi), non fa nulla: il chiamante deve creare il target con upsertTarget prima.
export async function updateTargetProgress(input: {
  childId: string;
  phoneme: string;
  level: ClinicalLevel;
  status: "active" | "mastered" | "paused";
}) {
  const { data, error } = await supabase
    .from("targets")
    .update({ level: input.level, status: input.status })
    .eq("child_id", input.childId)
    .eq("phoneme", input.phoneme)
    .select()
    .maybeSingle<TargetRow>();
  return { data, error };
}

// Per il ripristino all'avvio (App.tsx) — tutti i target di un bambino, usati per
// ricostruire phonemeGroups.
export async function getTargets(childId: string) {
  const { data, error } = await supabase
    .from("targets")
    .select("*")
    .eq("child_id", childId)
    .returns<TargetRow[]>();
  return { data, error };
}
