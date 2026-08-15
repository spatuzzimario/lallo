// CRUD minimo sulla tabella `children` — solo quanto serve per creare il profilo bambino
// alla fine dell'onboarding e rileggerlo. Niente ancora su targets/sessions/achievements:
// quello arriva quando si collega davvero il loop di gioco al backend (prossimo passo).
import { supabase } from "./supabase";

export interface ChildRow {
  id: string;
  owner_id: string;
  name: string;
  birthdate: string | null;
  interests: string[];
  audio_recording_consent: boolean;
  consent_given_at: string | null;
  created_at: string;
}

export async function createChild(input: {
  name: string;
  birthdate?: string | null;
  interests?: string[];
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("Nessun utente autenticato") };

  const { data, error } = await supabase
    .from("children")
    .insert({
      owner_id: user.id,
      name: input.name,
      birthdate: input.birthdate ?? null,
      interests: input.interests ?? [],
    })
    .select()
    .single<ChildRow>();

  return { data, error };
}

export async function getChildren() {
  const { data, error } = await supabase
    .from("children")
    .select("*")
    .order("created_at", { ascending: true })
    .returns<ChildRow[]>();
  return { data, error };
}
