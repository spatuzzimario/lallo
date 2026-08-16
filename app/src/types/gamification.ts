// Clinical scale: 5 levels, matches logopedista's phoneme progression
export type ClinicalLevel = 1 | 2 | 3 | 4 | 5;

export const LEVEL_LABELS: Record<ClinicalLevel, string> = {
  1: "Suono isolato",
  2: "Sillaba",
  3: "Parola",
  4: "Frase",
  5: "Racconto",
};

export interface PhonemeGroup {
  id: string;           // e.g. "r-sound", "s-sound"
  name: string;         // display name, e.g. "Suono R"
  islandAsset: string;  // map illustration key
  levels: LevelProgress[];
  unlockedByTherapist: boolean; // gate: therapist must enable in dashboard
}

export interface LevelProgress {
  level: ClinicalLevel;
  status: "locked" | "available" | "in_progress" | "mastered";
  masteryThreshold: number;  // 0-1, min avg confidence score to auto-unlock next
  starsEarned: number;
  starsPossible: number;
}

export interface AssignedExercise {
  id: string;
  exerciseType: "caccia" | "registratore" | "memory" | "coppie" | "oca" | "sequenze" | "pappagallo";
  exerciseLabel: string; // es. "Caccia al suono"
  phonemeGroupId: string;
  phonemeLabel: string; // es. "R"
  position: "iniziale" | "mediana";
  level: ClinicalLevel;
  levelRangeLabel: string; // es. "livello 3" oppure "livello 2-3" per discriminazione
}

export interface ChildProfile {
  id: string;
  // Id della riga `children` su Supabase — serve per qualunque scrittura reale collegata al
  // bambino (therapist_links, in futuro targets/sessions). Assente finché isSupabaseConfigured
  // è false o l'onboarding non ha ancora completato la creazione su Supabase.
  supabaseChildId?: string;
  displayName: string;
  avatarId: string;
  stars: number;
  gems: number;
  streak: StreakState;
  unlockedCosmetics: string[];
  phonemeGroups: PhonemeGroup[];
  preferredTopics: string[]; // es. ["spazio","animali","cibo"] — scelti in onboarding, usati per orientare i contenuti futuri
  subscriptionActive?: boolean; // segnaposto UI paywall — l'integrazione IAP reale (RevenueCat) va ancora agganciata
  // Piano di oggi. In produzione arriva dal backend condiviso con l'app
  // separata del logopedista (non ancora costruita) — qui è seed/demo.
  assignedToday: AssignedExercise[];
  // Suoni segnalati dal genitore nel questionario diagnostico self-directed (es. "non sa
  // dire la R"). È un FLAG per il logopedista da confermare/correggere in TherapistAssignScreen,
  // non un filtro automatico che decide quali esercizi vedere il bambino — vedi
  // `unlockedByTherapist` su PhonemeGroup, che resta l'unica cosa che sblocca davvero un esercizio.
  parentReportedConcerns: string[];
  // Consenso esplicito del genitore (dato dietro l'adult gate, sezione Privacy) alla
  // registrazione audio — ed eventualmente video in futuro — durante esercizi come il
  // Registratore. Finché è false, quegli esercizi non devono registrare nulla.
  audioRecordingConsent: boolean;
  // Ricompensa giornaliera (reward base, non clinica): date ISO (YYYY-MM-DD) in cui è
  // già stata assegnata. Ciclo di 7 giorni non spezzato da un giorno saltato — stesso
  // spirito "generoso" dei grace days dello streak, non è un contatore di fila rigido.
  dailyRewards: { claimedDates: string[] };
}

export interface StreakState {
  currentWeeks: number;
  sessionsThisWeek: number;       // needs >=3 to count the week
  graceDaysRemaining: number;     // resets monthly, default 2 — no paid streak freeze
  lastSessionDate: string | null; // ISO date
}

export interface SessionResult {
  phonemeGroupId: string;
  level: ClinicalLevel;
  attempts: AttemptResult[];
  completedAt: string;
}

export interface AttemptResult {
  targetPhoneme: string;
  confidenceScore: number; // 0-1, from articulatory feedback engine
  starsAwarded: number;    // partial credit, not binary pass/fail
}
