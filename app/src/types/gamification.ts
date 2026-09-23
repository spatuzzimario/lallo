// Scala clinica a 7 livelli (validata, settembre 2026 — sostituisce la precedente a 5
// livelli): separa posizione (iniziale/mediana) e complessità (parola/frase) invece di
// unirle in un'unica scala lineare. Il logopedista continua ad assegnare fonema e livello
// di partenza; qui cambia solo la granularità dei livelli stessi.
export type ClinicalLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const LEVEL_LABELS: Record<ClinicalLevel, string> = {
  1: "Suono isolato",
  2: "Parola iniziale",
  3: "Frase iniziale",
  4: "Parola mediana",
  5: "Frase mediana",
  6: "Racconto",
  7: "Racconto in rima",
};

// Posizione implicita nel livello stesso (prima era una scelta indipendente dal livello,
// applicata a tutta la mappa di un fonema) — i livelli 1/6/7 non hanno una posizione
// singola (1 = sillaba isolata, 6/7 = racconto che combina entrambe le posizioni).
export const LEVEL_POSITION: Partial<Record<ClinicalLevel, "iniziale" | "mediana">> = {
  2: "iniziale",
  3: "iniziale",
  4: "mediana",
  5: "mediana",
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
  exerciseType: "caccia" | "registratore" | "memory" | "coppie" | "oca" | "sequenze" | "ripeti" | "ascolta" | "frase" | "racconto";
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
  gender?: "maschio" | "femmina" | "preferisco_non_dire";
  avatarId: string;
  stars: number;
  gems: number;
  streak: StreakState;
  unlockedCosmetics: string[];
  phonemeGroups: PhonemeGroup[];
  preferredTopics: string[]; // es. ["spazio","animali","cibo"] — scelti in onboarding, usati per orientare i contenuti futuri
  // Sincronizzato con l'entitlement RevenueCat reale (vedi api/purchases.ts e
  // setSubscriptionActive nello store) — non un valore che si tocca da un tap locale.
  subscriptionActive?: boolean;
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
  // Stesso principio del consenso audio, ma per l'uso della fotocamera nell'Album (vedi
  // AlbumScreen). Finché è false la fotocamera non si apre. Le foto restano solo sul
  // dispositivo (expo-file-system), non vengono mai caricate su Supabase Storage.
  cameraConsent: boolean;
  // Ricompensa giornaliera (reward base, non clinica): date ISO (YYYY-MM-DD) in cui è
  // già stata assegnata. Ciclo di 7 giorni non spezzato da un giorno saltato — stesso
  // spirito "generoso" dei grace days dello streak, non è un contatore di fila rigido.
  dailyRewards: { claimedDates: string[] };
  // Storico delle sessioni completate — per la dashboard genitore (§6.5: uso nel tempo,
  // ultimi 7 giorni, andamento per fonema). Vedi SessionLogEntry.
  sessionLog: SessionLogEntry[];
  // Stato del Tamagotchi di Lallo (feature virale/retention) — la fame si calcola al volo
  // dal tempo trascorso da lastFedAt (vedi constants/lalloPet.ts), non è un numero salvato
  // che va "tickato": niente job in background, solo un calcolo quando l'app è aperta.
  lalloPet: { lastFedAt: string | null; lastInteractionAt: string | null };
  // Album fotografico delle parole (feature virale/retention, brief conversazione
  // settembre 2026): il bambino sceglie una parola dalla lista e la fotografa nel mondo
  // reale — nessun riconoscimento automatico dell'immagine (vedi CLAUDE.md §10, stesso
  // principio del niente-ASR: l'app non "capisce" le foto, è il bambino a scegliere cosa
  // sta fotografando). Ogni tot foto sblocca un titolo, vedi constants/album.ts.
  photoCatches: PhotoCatchEntry[];
}

export interface PhotoCatchEntry {
  id: string;
  word: string;   // slug della parola (stessa chiave di getWordImage)
  uri: string;    // percorso locale del file, mai caricato su un server
  takenAt: string;
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
  exerciseType: string;
  attempts: AttemptResult[];
  completedAt: string;
  durationSeconds: number;
}

// Una riga per sessione completata, per la dashboard genitore (uso nel tempo, ultimi 7
// giorni, andamento per fonema) — profile.stars/phonemeGroups restano gli aggregati usati
// dal resto dell'app, questo log serve solo alla vista genitore. Vive solo in memoria come
// il resto del profilo (nessuna persistenza reale finché Supabase non è collegato).
export interface SessionLogEntry {
  date: string;         // YYYY-MM-DD, per raggruppare per giorno
  completedAt: string;  // timestamp ISO completo
  phonemeGroupId: string;
  phonemeLabel: string;
  level: ClinicalLevel;
  exerciseType: string;
  starsEarned: number;
  starsPossible: number;
  avgConfidence: number; // 0-1
  durationSeconds: number;
}

export interface AttemptResult {
  targetPhoneme: string;
  confidenceScore: number; // 0-1, from articulatory feedback engine
  starsAwarded: number;    // partial credit, not binary pass/fail
}
