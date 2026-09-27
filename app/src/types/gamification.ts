// Scala clinica L0-L4b (aggiornamento settembre 2026 — sostituisce la precedente scala
// numerica 1-7): il livello incorpora sia la posizione del fonema (L1 iniziale, L2 mediana)
// sia, dentro L1/L2, un sotto-step di complessità sillabica (1 → 2 → 3 → 4+ sillabe), reso
// come id composto (es. "L1-2") invece che come struttura annidata — resta un unico percorso
// lineare per fonema, la stessa forma di array di prima (vedi LEVEL_ORDER). L3 (frase) non è
// più diviso per posizione; L4a/L4b sono il racconto in prosa/rima. Vale per ogni fonema,
// semplice o gruppo consonantico (/tr/, /gn/...): nessun trattamento speciale, stessa scala.
export type ClinicalLevel =
  | "L0"
  | "L1-1" | "L1-2" | "L1-3" | "L1-4plus"
  | "L2-1" | "L2-2" | "L2-3" | "L2-4plus"
  | "L3" | "L4a" | "L4b";

// Ordine di progressione per fonema — sostituisce l'aritmetica su id numerici (level+1,
// Math.max) usata prima per "livello successivo"/"livello più alto raggiunto", che con id
// testuali non è più possibile: si cerca l'indice in questo array.
export const LEVEL_ORDER: ClinicalLevel[] = [
  "L0",
  "L1-1", "L1-2", "L1-3", "L1-4plus",
  "L2-1", "L2-2", "L2-3", "L2-4plus",
  "L3", "L4a", "L4b",
];

export const LEVEL_LABELS: Record<ClinicalLevel, string> = {
  "L0": "Suono isolato",
  "L1-1": "Parola iniziale · 1 sillaba",
  "L1-2": "Parola iniziale · 2 sillabe",
  "L1-3": "Parola iniziale · 3 sillabe",
  "L1-4plus": "Parola iniziale · 4+ sillabe",
  "L2-1": "Parola mediana · 1 sillaba",
  "L2-2": "Parola mediana · 2 sillabe",
  "L2-3": "Parola mediana · 3 sillabe",
  "L2-4plus": "Parola mediana · 4+ sillabe",
  "L3": "Frase",
  "L4a": "Racconto",
  "L4b": "Racconto in rima",
};

// Posizione implicita nel livello stesso: solo gli 8 sotto-step di L1/L2 ne hanno una — L0
// (sillaba isolata), L3 (frase) e L4a/L4b (racconto) non usano/combinano la posizione.
export const LEVEL_POSITION: Partial<Record<ClinicalLevel, "iniziale" | "mediana">> = {
  "L1-1": "iniziale", "L1-2": "iniziale", "L1-3": "iniziale", "L1-4plus": "iniziale",
  "L2-1": "mediana", "L2-2": "mediana", "L2-3": "mediana", "L2-4plus": "mediana",
};

// Complessità sillabica implicita nel livello, stesso principio di LEVEL_POSITION — solo per
// gli 8 sotto-step di L1/L2. Usata per filtrare il word bank una volta che le parole avranno
// un tag `syllables` (vedi WordEntry in wordBank.ts): finché il tag manca su una parola, il
// filtro la ignora (nessuna parola esclusa per un dato mancante, non un dato inventato).
export const LEVEL_SYLLABLES: Partial<Record<ClinicalLevel, 1 | 2 | 3 | "4plus">> = {
  "L1-1": 1, "L1-2": 2, "L1-3": 3, "L1-4plus": "4plus",
  "L2-1": 1, "L2-2": 2, "L2-3": 3, "L2-4plus": "4plus",
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
  // Assente per i livelli senza posizione (L0, L3, L4a, L4b) — vedi LEVEL_POSITION.
  position?: "iniziale" | "mediana";
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
  // Promemoria giornaliero locale (vedi notifications/reminders.ts): il genitore lo attiva da
  // Progressi → Privacy, mai un popup di permesso non richiesto. Finché è false non viene
  // programmata/richiesta nessuna notifica.
  remindersEnabled: boolean;
  // Prima volta che il bambino ha visto/sentito la presentazione di Lallo su ciascuna
  // sezione (settembre 2026, feedback: "Lallo si presenta solo la prima volta, poi solo le
  // istruzioni del gioco"). Vive solo in memoria come il resto del profilo — finché non c'è
  // una persistenza reale (Supabase/AsyncStorage), "la prima volta" vale per sessione
  // dell'app, si ripresenta se l'app viene chiusa e riaperta da zero.
  introsSeen: { lallo: boolean; album: boolean };
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
