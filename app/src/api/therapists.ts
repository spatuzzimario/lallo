// Registrazione logopedista + collegamento genitore↔logopedista via codice invito.
// Il logopedista ha un proprio account (profiles.role='therapist'), separato da quello del
// genitore — stesso meccanismo email+OTP di auth.ts, diverso ruolo/tabella di destinazione.
// albo_verified resta false alla creazione: verifica manuale in fase fondatori (brief §6.6),
// il codice invito esiste comunque da subito — non sblocca contenuto premium per le
// famiglie collegate, solo la dashboard pro del logopedista resta dietro albo_verified.
import { supabase } from "./supabase";

export interface TherapistRow {
  id: string;
  profile_id: string;
  full_name: string;
  albo_number: string;
  albo_verified: boolean;
  invite_code: string | null;
}

export async function ensureTherapistProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: new Error("Nessun utente autenticato") };

  const { error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, role: "therapist" }, { onConflict: "id" });
  return { error };
}

// Niente 0/O/1/I nell'alfabeto: troppo facili da confondere quando il codice viene letto
// a voce o scritto a mano dal logopedista alla famiglia.
function randomCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
  return code;
}

export async function registerTherapist(input: { fullName: string; alboNumber: string }) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error("Nessun utente autenticato") };

  const { data: existing } = await supabase
    .from("therapists")
    .select("*")
    .eq("profile_id", user.id)
    .maybeSingle<TherapistRow>();
  if (existing) return { data: existing, error: null };

  // Retry solo su conflitto del codice (23505 unique_violation) — con un alfabeto di 32
  // caratteri su 6 posizioni la collisione è comunque rara.
  for (let attempt = 0; attempt < 5; attempt++) {
    const invite_code = randomCode();
    const { data, error } = await supabase
      .from("therapists")
      .insert({ profile_id: user.id, full_name: input.fullName, albo_number: input.alboNumber, invite_code })
      .select()
      .single<TherapistRow>();
    if (!error) return { data, error: null };
    if ((error as { code?: string }).code !== "23505") return { data: null, error };
  }
  return { data: null, error: new Error("Non siamo riusciti a generare un codice univoco. Riprova.") };
}

export async function findTherapistByCode(code: string) {
  const { data, error } = await supabase
    .from("therapists")
    .select("*")
    .eq("invite_code", code.trim().toUpperCase())
    .maybeSingle<TherapistRow>();
  return { data, error };
}

export async function linkChildToTherapist(childId: string, therapistId: string) {
  const { error } = await supabase
    .from("therapist_links")
    .upsert({ child_id: childId, therapist_id: therapistId, status: "pending" }, { onConflict: "therapist_id,child_id" });
  return { error };
}

export async function getLinkedTherapist(childId: string) {
  const { data, error } = await supabase
    .from("therapist_links")
    .select("status, therapists (full_name, albo_verified)")
    .eq("child_id", childId)
    .maybeSingle<{ status: string; therapists: { full_name: string; albo_verified: boolean } | null }>();
  return { data, error };
}
