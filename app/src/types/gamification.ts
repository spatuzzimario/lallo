// Scala clinica L0-L4 (aggiornamento settembre 2026, riorganizzazione livelli — sostituisce
// gli 8 sotto-step per complessità sillabica di L1/L2 di una versione precedente: nessuna
// parola ha mai avuto il tag `syllables` popolato, quindi quei sotto-step mostravano sempre
// lo stesso identico pool di parole — un unico livello per posizione è più onesto). L1 =
// parola iniziale, L2 = parola mediana, L3 = frase, L4 = racconto (include sia il racconto in
// prosa che la filastrocca/rima, più giochi sotto lo stesso nodo). Vale per ogni fonema,
// semplice o gruppo consonantico (/tr/, /gn/...): nessun trattamento speciale, stessa scala.
export type ClinicalLevel = "L0" | "L1" | "L2" | "L3" | "L4";

// Ordine di progressione per fonema — sostituisce l'aritmetica su id numerici (level+1,
// Math.max) usata prima per "livello successivo"/"livello più alto raggiunto", che con id
// testuali non è più possibile: si cerca l'indice in questo array.
export const LEVEL_ORDER: ClinicalLevel[] = ["L0", "L1", "L2", "L3", "L4"];

export const LEVEL_LABELS: Record<ClinicalLevel, string> = {
  "L0": "Suono isolato",
  "L1": "Parola iniziale",
  "L2": "Parola mediana",
  "L3": "Frase",
  "L4": "Racconto",
};

// Posizione implicita nel livello stesso: solo L1/L2 ne hanno una — L0 (sillaba isolata), L3
// (frase) e L4 (racconto) non usano/combinano la posizione.
export const LEVEL_POSITION: Partial<Record<ClinicalLevel, "iniziale" | "mediana">> = {
  "L1": "iniziale",
  "L2": "mediana",
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
  // Assente per i livelli senza posizione (L0, L3, L4) — vedi LEVEL_POSITION.
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
