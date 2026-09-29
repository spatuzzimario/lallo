// Insert-only sulla tabella `sessions` — una riga per ogni sessione di gioco completata
// (vedi useGamificationStore.recordSession, unica fonte di verità locale che genera questi
// dati). target_id è nullable: se il target non è ancora stato risolto/creato lato client
// per qualche motivo, la sessione si salva comunque (perdendo solo il collegamento a
// fonema/livello, recuperabile in seguito, non i dati della sessione in sé).
import { supabase } from "./supabase";

export interface SessionRow {
  id: string;
  child_id: string;
  target_id: string | null;
  game_type: string;
  completed_at: string;
  stars_earned: number;
  stars_possible: number;
  avg_confidence: number | null;
}

export async function recordSessionRemote(input: {
  childId: string;
  targetId: string | null;
  gameType: string;
  completedAt: string;
  starsEarned: number;
  starsPossible: number;
  avgConfidence: number;
}) {
  const { data, error } = await supabase
    .from("sessions")
    .insert({
      child_id: input.childId,
      target_id: input.targetId,
      game_type: input.gameType,
      completed_at: input.completedAt,
      stars_earned: input.starsEarned,
      stars_possible: input.starsPossible,
      avg_confidence: input.avgConfidence,
    })
    .select()
    .single<SessionRow>();
  return { data, error };
}

// Per il ripristino all'avvio (App.tsx) — join su targets per recuperare fonema/livello,
// persi sulla riga sessions stessa (vedi nota 2 in supabase/schema.sql). Ordinate per data
// per ricostruire sessionLog e rigiocare updateStreak nello stesso ordine in cui sono
// avvenute davvero.
export interface SessionWithTarget extends SessionRow {
  targets: { phoneme: string; level: string } | null;
}

export async function getSessions(childId: string) {
  const { data, error } = await supabase
    .from("sessions")
    .select("*, targets ( phoneme, level )")
    .eq("child_id", childId)
    .order("completed_at", { ascending: true })
    .returns<SessionWithTarget[]>();
  return { data, error };
}
