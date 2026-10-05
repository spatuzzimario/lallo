import { create } from "zustand";
import {
  AssignedExercise,
  ChildProfile,
  ClinicalLevel,
  PhonemeGroup,
  SessionResult,
  SessionLogEntry,
  StreakState,
  LevelProgress,
  LEVEL_LABELS,
} from "../types/gamification";
import { PhonemeKey, WORD_BANK, applicableLevelsFor } from "../constants/wordBank";
import { getHunger } from "../constants/lalloPet";
import { linkPurchasesToChild } from "../api/purchases";
import { requestReminderPermission, scheduleNextReminder, cancelReminders } from "../notifications/reminders";
import { isSupabaseConfigured } from "../api/supabase";
import { upsertTarget, updateTargetProgress, getTargets } from "../api/targets";
import { recordSessionRemote, getSessions } from "../api/sessions";
import { unlockAchievement, getAchievements } from "../api/achievements";
import { DEFAULT_AVATAR_ID } from "../constants/avatars";

// Riga leggera per il selettore multi-figlio (ChildSwitcher) — non è il ChildProfile
// completo (stelle/livelli/sessionLog...), solo quanto serve per mostrare la lista e capire
// quale cambiare. Il profilo pieno del figlio attivo resta solo in `profile`, ricostruito da
// hydrateFromSupabase al cambio — niente N profili completi tenuti in memoria insieme.
export interface ChildRosterEntry {
  id: string;
  displayName: string;
  avatarId: string;
}

interface GamificationStore {
  profile: ChildProfile | null;
  setProfile: (p: ChildProfile) => void;
  // Elenco di TUTTI i bambini collegati a questo genitore (brief §7 "profili multipli figlio
  // su un solo abbonamento") — popolato da App.tsx al ripristino sessione. Vuoto finché il
  // backend non è collegato o l'onboarding non è ancora stato completato.
  children: ChildRosterEntry[];
  setChildrenRoster: (roster: ChildRosterEntry[]) => void;
  // Segnale effimero (non persistito, non parte del profilo salvato): SessionScreen lo
  // accende quando un livello si sblocca proprio ora, LalloScreen lo consuma alla prossima
  // apertura per far festeggiare Lallo — così la festa non è legata a stare già su quella
  // schermata nel momento esatto dello sblocco.
  pendingLalloCelebration: boolean;
  triggerLalloCelebration: () => void;
  consumeLalloCelebration: () => void;
  recordSession: (result: SessionResult) => void;
  assignPlan: (phonemeGroupId: string, groupName: string, level: LevelProgress["level"]) => void;
  setParentReportedConcerns: (concerns: string[]) => void;
  setAudioRecordingConsent: (consent: boolean) => void;
  setCameraConsent: (consent: boolean) => void;
  setRemindersEnabled: (enabled: boolean) => Promise<boolean>;
  setSubscriptionActive: (active: boolean) => void;
  addPhotoCatch: (word: string, uri: string) => void;
  removePhotoCatch: (id: string) => void;
  startSelfDirectedPlan: (sounds: PhonemeKey[]) => void;
  setSupabaseChildId: (id: string) => void;
  setChildInfo: (info: { displayName?: string; gender?: ChildProfile["gender"]; avatarId?: string }) => void;
  feedLallo: () => void;
  talkToLallo: () => void;
  markIntroSeen: (section: "lallo" | "album") => void;
  // Ripristino all'avvio (App.tsx) quando esiste già una sessione Supabase valida — sostituisce
  // il profilo demo con i dati reali del bambino ricostruiti da targets/sessions/achievements.
  // Stessa funzione usata anche da ChildSwitcher per cambiare bambino attivo a sessione già
  // avviata, non solo all'avvio dell'app.
  hydrateFromSupabase: (child: {
    id: string;
    name: string;
    audioRecordingConsent: boolean;
    avatarId?: string | null;
    gender?: ChildProfile["gender"] | null;
  }) => Promise<void>;
}

const MASTERY_DEFAULT_THRESHOLD = 0.75;
const SESSIONS_TO_COUNT_WEEK = 3;
const GRACE_DAYS_PER_MONTH = 2;
const LALLO_SNACK_BOOST = 15; // punti sazietà per un'interazione "Parla con Lallo"

// Giorni consecutivi in cui il bambino ha completato almeno una sessione — un contatore
// onesto e semplice (niente gemme/ricompense inventate, tolte settembre 2026 su feedback:
// "non hanno senso, fai un tracker visivo dei giorni"). Calcolato al volo dal sessionLog
// reale invece di essere un altro numero salvato a parte, così non può mai disallinearsi
// dallo storico vero. Conta all'indietro da oggi; se oggi non si è ancora giocato ma ieri sì,
// lo streak è ancora "vivo" (si rompe solo quando passa un giorno intero senza sessioni).
export function getDayStreak(sessionLog: SessionLogEntry[]): number {
  if (sessionLog.length === 0) return 0;
  const days = new Set(sessionLog.map((e) => e.date));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let cursor = new Date(today);
  if (!days.has(cursor.toISOString().slice(0, 10))) {
    cursor.setDate(cursor.getDate() - 1); // oggi non ancora giocato: parti da ieri
  }
  let streak = 0;
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function freshLevels(phonemeKey: PhonemeKey): LevelProgress[] {
  return applicableLevelsFor(phonemeKey).map((level, idx) => ({
    level,
    status: (idx === 0 ? "available" : "locked") as LevelProgress["status"],
    masteryThreshold: MASTERY_DEFAULT_THRESHOLD,
    starsEarned: 0,
    starsPossible: 0,
  }));
}

function isSameWeek(a: string, b: string): boolean {
  const dA = new Date(a);
  const dB = new Date(b);
  const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
  return Math.abs(dA.getTime() - dB.getTime()) < oneWeekMs;
}

function updateStreak(streak: StreakState, sessionDate: string): StreakState {
  const today = sessionDate;

  if (!streak.lastSessionDate) {
    return {
      ...streak,
      sessionsThisWeek: 1,
      lastSessionDate: today,
    };
  }

  const sameWeek = isSameWeek(streak.lastSessionDate, today);
  const daysSinceLast =
    (new Date(today).getTime() - new Date(streak.lastSessionDate).getTime()) /
    (1000 * 60 * 60 * 24);

  // Gap handling: use a grace day automatically rather than breaking streak,
  // no purchase required — see GAMIFICATION_DESIGN.md section 3.
  let graceDaysRemaining = streak.graceDaysRemaining;
  let currentWeeks = streak.currentWeeks;
  let sessionsThisWeek = sameWeek ? streak.sessionsThisWeek + 1 : 1;

  if (!sameWeek) {
    const weekWasCompleted = streak.sessionsThisWeek >= SESSIONS_TO_COUNT_WEEK;
    if (weekWasCompleted) {
      currentWeeks += 1;
    } else if (graceDaysRemaining > 0 && daysSinceLast <= 10) {
      // forgive the gap, consume a grace day, don't reset streak count
      graceDaysRemaining -= 1;
    } else {
      currentWeeks = 0; // streak resets, but silently — no shame notification
    }
  }

  return {
    currentWeeks,
    sessionsThisWeek,
    graceDaysRemaining,
    lastSessionDate: today,
  };
}

// "Conquistato" a livello di intero fonema (CLAUDE.md §6.4) — non basta un singolo livello
// in "mastered" (quello è già gestito a parte come festa "Livello conquistato!"): serve che
// OGNI livello applicabile a quel fonema lo sia.
function isGroupFullyMastered(group: PhonemeGroup): boolean {
  return group.levels.length > 0 && group.levels.every((l) => l.status === "mastered");
}

// Specchio best-effort su Supabase di una sessione appena registrata in locale — mai
// bloccante (va sempre chiamata con .catch(() => {}), mai await-ata dal chiamante) e mai
// causa di errori visibili al bambino: se il backend non è raggiungibile, l'app continua a
// funzionare sullo store locale esattamente come oggi, i dati restano solo lì finché non
// riparte un sync successivo.
async function syncSessionToSupabase(params: {
  childId: string;
  phoneme: string;
  level: ClinicalLevel;
  levelStatus: "active" | "mastered";
  exerciseType: string;
  completedAt: string;
  starsEarned: number;
  starsPossible: number;
  avgConfidence: number;
  newlyConquered: boolean;
}) {
  const updated = await updateTargetProgress({
    childId: params.childId,
    phoneme: params.phoneme,
    level: params.level,
    status: params.levelStatus,
  });
  let targetId = updated.data?.id ?? null;

  if (!targetId) {
    // Nessun target esisteva ancora per questo fonema (es. esplorato liberamente da Giochi
    // senza passare da screener/logopedista) — lo creiamo ora. set_by "parent": è la
    // famiglia, non un professionista, ad aver scelto di giocarlo.
    const created = await upsertTarget({
      childId: params.childId,
      phoneme: params.phoneme,
      level: params.level,
      setBy: "parent",
    });
    targetId = created.data?.id ?? null;
  }

  await recordSessionRemote({
    childId: params.childId,
    targetId,
    gameType: params.exerciseType,
    completedAt: params.completedAt,
    starsEarned: params.starsEarned,
    starsPossible: params.starsPossible,
    avgConfidence: params.avgConfidence,
  });

  if (params.newlyConquered) {
    await unlockAchievement({ childId: params.childId, phoneme: params.phoneme });
  }
}

function updateLevelProgress(
  level: LevelProgress,
  earnedStars: number,
  possibleStars: number,
  avgConfidence: number
): LevelProgress {
  const starsEarned = level.starsEarned + earnedStars;
  const starsPossible = level.starsPossible + possibleStars;

  let status = level.status;
  if (status === "available") status = "in_progress";

  // Mastery unlock is confidence-based, not just star count —
  // keeps the clinical signal meaningful rather than gameable by repetition.
  if (avgConfidence >= level.masteryThreshold && status === "in_progress") {
    status = "mastered";
  }

  return { ...level, starsEarned, starsPossible, status };
}

export const useGamificationStore = create<GamificationStore>((set, get) => ({
  profile: null,
  setProfile: (p) => set({ profile: p }),

  children: [],
  setChildrenRoster: (roster) => set({ children: roster }),

  pendingLalloCelebration: false,
  triggerLalloCelebration: () => set({ pendingLalloCelebration: true }),
  consumeLalloCelebration: () => set({ pendingLalloCelebration: false }),

  recordSession: (result: SessionResult) => {
    const profile = get().profile;
    if (!profile) return;

    const totalStars = result.attempts.reduce((sum, a) => sum + a.starsAwarded, 0);
    const avgConfidence =
      result.attempts.reduce((sum, a) => sum + a.confidenceScore, 0) /
      Math.max(result.attempts.length, 1);

    // Se il fonema non ha ancora un gruppo (es. il bambino sta esplorando un suono dal
    // catalogo in Giochi, mai assegnato da screener o logopedista), lo crea al volo —
    // altrimenti la sessione non avrebbe nessun posto dove salvare i progressi.
    const hasGroup = profile.phonemeGroups.some((g) => g.id === result.phonemeGroupId);
    const baseGroups = hasGroup
      ? profile.phonemeGroups
      : [
          ...profile.phonemeGroups,
          {
            id: result.phonemeGroupId,
            name: `Suono ${WORD_BANK[result.phonemeGroupId as PhonemeKey]?.label ?? result.phonemeGroupId}`,
            islandAsset: "",
            unlockedByTherapist: false,
            levels: freshLevels(result.phonemeGroupId as PhonemeKey),
          },
        ];

    const updatedGroups = baseGroups.map((group) => {
      if (group.id !== result.phonemeGroupId) return group;

      const updatedLevels = group.levels.map((lvl) => {
        if (lvl.level !== result.level) return lvl;
        return updateLevelProgress(
          lvl,
          totalStars,
          result.attempts.length * 3, // max 3 stars per attempt
          avgConfidence
        );
      });

      // Auto-sblocco del livello successivo basato solo sulla soglia di mastery (confidenza
      // media, non ripetizione) — non più condizionato a unlockedByTherapist: nel modello
      // parent-first la maggior parte dei bambini non ha un logopedista collegato, quindi il
      // gate lasciava la mappa bloccata al livello 1 per la maggioranza. Il logopedista resta
      // l'unico che assegna un fonema NUOVO o un livello di partenza più avanzato — qui si
      // tratta solo di avanzare dentro un fonema già iniziato.
      const masteredIdx = updatedLevels.findIndex((l) => l.level === result.level);
      if (
        updatedLevels[masteredIdx].status === "mastered" &&
        masteredIdx + 1 < updatedLevels.length &&
        updatedLevels[masteredIdx + 1].status === "locked"
      ) {
        updatedLevels[masteredIdx + 1] = {
          ...updatedLevels[masteredIdx + 1],
          status: "available",
        };
      }

      return { ...group, levels: updatedLevels };
    });

    const newStreak = updateStreak(profile.streak, result.completedAt.slice(0, 10));
    const todayStr = result.completedAt.slice(0, 10);

    const logEntry: SessionLogEntry = {
      date: todayStr,
      completedAt: result.completedAt,
      phonemeGroupId: result.phonemeGroupId,
      phonemeLabel: WORD_BANK[result.phonemeGroupId as PhonemeKey]?.label ?? result.phonemeGroupId,
      level: result.level,
      exerciseType: result.exerciseType,
      starsEarned: totalStars,
      starsPossible: result.attempts.length * 3,
      avgConfidence,
      durationSeconds: result.durationSeconds,
    };

    // "Suono conquistato" (CLAUDE.md §6.4) = TUTTI i livelli del gruppo masterizzati, non
    // solo quello appena giocato — controllato prima/dopo per beccare solo la transizione
    // (evita di rifirmare l'unlock ad ogni sessione successiva sullo stesso fonema già
    // conquistato in passato).
    const beforeGroup = baseGroups.find((g) => g.id === result.phonemeGroupId);
    const afterGroup = updatedGroups.find((g) => g.id === result.phonemeGroupId);
    const wasFullyMastered = beforeGroup ? isGroupFullyMastered(beforeGroup) : false;
    const isFullyMasteredNow = afterGroup ? isGroupFullyMastered(afterGroup) : false;
    const newlyConquered =
      !wasFullyMastered &&
      isFullyMasteredNow &&
      !profile.unlockedAchievements.includes(result.phonemeGroupId);

    set({
      profile: {
        ...profile,
        stars: profile.stars + totalStars,
        streak: newStreak,
        phonemeGroups: updatedGroups,
        sessionLog: [...profile.sessionLog, logEntry],
        unlockedAchievements: newlyConquered
          ? [...profile.unlockedAchievements, result.phonemeGroupId]
          : profile.unlockedAchievements,
      },
    });

    // Ha appena giocato: sposta in avanti il prossimo promemoria (vedi
    // notifications/reminders.ts) invece di lasciarne uno per "oggi" che arriverebbe dopo che
    // ha già fatto l'esercizio.
    if (profile.remindersEnabled) scheduleNextReminder(profile.displayName).catch(() => {});

    // Specchio best-effort su Supabase — fire-and-forget, non deve mai bloccare né far
    // fallire il gameplay locale già aggiornato sopra.
    if (isSupabaseConfigured && profile.supabaseChildId) {
      const playedLevel = afterGroup?.levels.find((l) => l.level === result.level);
      syncSessionToSupabase({
        childId: profile.supabaseChildId,
        phoneme: result.phonemeGroupId,
        level: result.level,
        levelStatus: playedLevel?.status === "mastered" ? "mastered" : "active",
        exerciseType: result.exerciseType,
        completedAt: result.completedAt,
        starsEarned: totalStars,
        starsPossible: result.attempts.length * 3,
        avgConfidence,
        newlyConquered,
      }).catch(() => {});
    }
  },

  // Chiamata dallo schermo di assegnazione del logopedista (TherapistAssignScreen).
  // Se il gruppo fonema non esiste ancora nel profilo lo crea; se esiste, sblocca
  // il livello richiesto senza toccare i progressi già fatti sugli altri livelli.
  assignPlan: (phonemeGroupId, groupName, level) => {
    const profile = get().profile;
    if (!profile) return;

    const existing = profile.phonemeGroups.find((g) => g.id === phonemeGroupId);

    if (existing) {
      const levels = existing.levels.map((l) =>
        l.level === level && l.status === "locked" ? { ...l, status: "available" as const } : l
      );
      set({
        profile: {
          ...profile,
          phonemeGroups: profile.phonemeGroups.map((g) =>
            g.id === phonemeGroupId ? { ...g, unlockedByTherapist: true, levels } : g
          ),
        },
      });
    } else {
      const newGroup = {
        id: phonemeGroupId,
        name: groupName,
        islandAsset: "",
        unlockedByTherapist: true,
        levels: freshLevels(phonemeGroupId as PhonemeKey).map((l) =>
          l.level === level ? { ...l, status: "available" as const } : l
        ),
      };
      set({
        profile: {
          ...profile,
          phonemeGroups: [...profile.phonemeGroups, newGroup],
        },
      });
    }

    if (isSupabaseConfigured && profile.supabaseChildId) {
      upsertTarget({
        childId: profile.supabaseChildId,
        phoneme: phonemeGroupId,
        level,
        setBy: "therapist",
      }).catch(() => {});
    }
  },

  // Salva i suoni segnalati dal genitore nel questionario diagnostico come nota per il
  // logopedista — non tocca phonemeGroups/unlockedByTherapist, quindi non sblocca nulla da sola.
  setParentReportedConcerns: (concerns) => {
    const profile = get().profile;
    if (!profile) return;
    set({ profile: { ...profile, parentReportedConcerns: concerns } });
  },

  setAudioRecordingConsent: (consent) => {
    const profile = get().profile;
    if (!profile) return;
    set({ profile: { ...profile, audioRecordingConsent: consent } });
  },

  setCameraConsent: (consent) => {
    const profile = get().profile;
    if (!profile) return;
    set({ profile: { ...profile, cameraConsent: consent } });
  },

  // Ritorna false (senza attivare nulla) se il genitore nega il permesso di sistema, così lo
  // switch in Privacy e registrazioni può tornare visivamente su "off" invece di mentire.
  setRemindersEnabled: async (enabled) => {
    const profile = get().profile;
    if (!profile) return false;
    if (!enabled) {
      await cancelReminders();
      set({ profile: { ...profile, remindersEnabled: false } });
      return true;
    }
    const granted = await requestReminderPermission();
    if (!granted) return false;
    await scheduleNextReminder(profile.displayName);
    set({ profile: { ...profile, remindersEnabled: true } });
    return true;
  },

  // Fonte di verità: RevenueCat (vedi api/purchases.ts), mai un tap dell'utente. Chiamata
  // dopo un acquisto/ripristino andato a buon fine e dal listener di aggiornamento — legge
  // il profilo aggiornato con get() invece di catturarlo in una closure, per restare
  // corretta anche quando chiamata da un effect/listener asincrono.
  setSubscriptionActive: (active) => {
    const profile = get().profile;
    if (!profile) return;
    set({ profile: { ...profile, subscriptionActive: active } });
  },

  addPhotoCatch: (word, uri) => {
    const profile = get().profile;
    if (!profile) return;
    const entry = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, word, uri, takenAt: new Date().toISOString() };
    set({ profile: { ...profile, photoCatches: [...profile.photoCatches, entry] } });
  },

  // Il genitore può sempre eliminare una foto dalla sezione Privacy/Album — le foto sono
  // dati sensibili di un minore, deve restare facile rimuoverle.
  removePhotoCatch: (id) => {
    const profile = get().profile;
    if (!profile) return;
    set({ profile: { ...profile, photoCatches: profile.photoCatches.filter((p) => p.id !== id) } });
  },

  setSupabaseChildId: (id) => {
    const profile = get().profile;
    if (!profile) return;
    set({ profile: { ...profile, supabaseChildId: id } });
    // Collega l'utente anonimo di RevenueCat all'account reale, così gli acquisti restano
    // ritrovabili da un altro dispositivo con lo stesso account (vedi api/purchases.ts).
    linkPurchasesToChild(id);
  },

  // Scrive nel profilo nome e sesso raccolti in onboarding (ChildNameScreen/
  // ChildGenderScreen) — prima il nome restava quello del profilo seed ("Marco") perché
  // veniva solo passato come route param fino ad Auth, mai salvato davvero.
  setChildInfo: (info) => {
    const profile = get().profile;
    if (!profile) return;
    set({ profile: { ...profile, ...info } });
  },

  // Dare da mangiare resetta la sazietà al massimo (un pasto "dura" fino a farlo scendere
  // di nuovo con il tempo, vedi constants/lalloPet.ts) — un tocco su un cibo = pasto fatto.
  feedLallo: () => {
    const profile = get().profile;
    if (!profile) return;
    set({ profile: { ...profile, lalloPet: { ...profile.lalloPet, lastFedAt: new Date().toISOString() } } });
  },

  // Parlare con Lallo (Ripeti/pappagallo) conta come interazione e dà anche un piccolo
  // "spuntino" — non sazia come un pasto vero, ma premia comunque il bambino che torna a
  // giocare con lui invece di limitarsi a nutrirlo meccanicamente.
  talkToLallo: () => {
    const profile = get().profile;
    if (!profile) return;
    const boostedHunger = Math.min(100, getHunger(profile.lalloPet.lastFedAt) + LALLO_SNACK_BOOST);
    // Ricava un lastFedAt "virtuale" corrispondente alla sazietà appena aumentata, così la
    // stessa formula di decadimento (getHunger) resta l'unica fonte di verità.
    const hoursAgo = ((100 - boostedHunger) / 100) * 24;
    const newLastFedAt = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();
    set({
      profile: {
        ...profile,
        lalloPet: {
          lastFedAt: newLastFedAt,
          lastInteractionAt: new Date().toISOString(),
        },
      },
    });
  },

  // Segna vista la presentazione di Lallo su una sezione (tab Lallo o Album) — da lì in poi
  // il bambino sente solo le istruzioni brevi del gioco/schermata, non più la spiegazione
  // lunga di chi è Lallo e a cosa serve quella sezione (settembre 2026, vedi LalloScreen/
  // AlbumScreen). Vale per questa sessione dell'app, non persiste tra un riavvio e l'altro.
  markIntroSeen: (section) => {
    const profile = get().profile;
    if (!profile) return;
    set({ profile: { ...profile, introsSeen: { ...profile.introsSeen, [section]: true } } });
  },

  // Avvia il piano self-directed (nessun logopedista collegato) al termine dello screener.
  // Decisione parent-first (validata luglio 2026): niente più anteprima bloccata — il
  // genitore sceglie i suoni, si parte subito da L0 (suono isolato), che è il punto
  // di partenza corretto per QUALSIASI fonema nuovo, indipendentemente dall'età/vocabolario.
  // unlockedByTherapist resta false, ma da qui in poi (vedi recordSession) non è più quello
  // a decidere se si avanza al livello successivo — solo la soglia di mastery lo è. Il
  // logopedista resta l'unico che assegna un fonema nuovo o un livello di partenza avanzato.
  startSelfDirectedPlan: (sounds) => {
    const profile = get().profile;
    if (!profile) return;
    if (sounds.length === 0) return;

    const newGroups = sounds.map((key) => ({
      id: key,
      name: `Suono ${WORD_BANK[key].label}`,
      islandAsset: "",
      unlockedByTherapist: false,
      levels: freshLevels(key),
    }));

    const firstKey = sounds[0];
    const firstLabel = WORD_BANK[firstKey].label;
    const todayPlan: AssignedExercise[] = [
      {
        id: `self-${firstKey}-caccia`,
        exerciseType: "caccia",
        exerciseLabel: "Caccia al suono",
        phonemeGroupId: firstKey,
        phonemeLabel: firstLabel,
        position: "iniziale",
        level: "L1",
        levelRangeLabel: LEVEL_LABELS["L1"],
      },
      {
        id: `self-${firstKey}-memory`,
        exerciseType: "memory",
        exerciseLabel: "Memory dei suoni",
        phonemeGroupId: firstKey,
        phonemeLabel: firstLabel,
        position: "iniziale",
        level: "L1",
        levelRangeLabel: LEVEL_LABELS["L1"],
      },
    ];

    set({
      profile: {
        ...profile,
        parentReportedConcerns: sounds,
        phonemeGroups: [
          ...profile.phonemeGroups.filter((g) => !sounds.includes(g.id as PhonemeKey)),
          ...newGroups,
        ],
        assignedToday: todayPlan,
      },
    });

    // supabaseChildId potrebbe non esserci ancora qui: nell'onboarding self-directed questa
    // azione viene chiamata PRIMA che AuthScreen crei il bambino su Supabase (vedi
    // AuthScreen.tsx: startSelfDirectedPlan seguito da createChild + setSupabaseChildId).
    // In quel caso questi target non si scrivono ora — accettabile per l'MVP: al primo
    // recordSession su questi fonemi, syncSessionToSupabase li crea comunque al volo (con
    // set_by "parent" invece di "screener", unica differenza pratica).
    if (isSupabaseConfigured && profile.supabaseChildId) {
      const childId = profile.supabaseChildId;
      for (const key of sounds) {
        upsertTarget({
          childId,
          phoneme: key,
          level: freshLevels(key)[0].level,
          setBy: "screener",
        }).catch(() => {});
      }
    }
  },

  hydrateFromSupabase: async (child) => {
    const [{ data: targetRows }, { data: sessionRows }, { data: achievementRows }] = await Promise.all([
      getTargets(child.id),
      getSessions(child.id),
      getAchievements(child.id),
    ]);

    const targets = targetRows ?? [];
    const sessions = sessionRows ?? [];
    const achievements = achievementRows ?? [];

    // Un gruppo per ogni fonema con un target reale — freshLevels come scheletro, poi
    // stelle/stato per livello si ricostruiscono rigiocando le sessioni in ordine
    // cronologico attraverso la STESSA logica pura usata in tempo reale (updateLevelProgress
    // + auto-sblocco), per restare coerenti con recordSession invece di duplicare regole.
    const groups: PhonemeGroup[] = targets.map((t) => {
      const key = t.phoneme as PhonemeKey;
      let levels = freshLevels(key);
      const phonemeSessions = sessions.filter((s) => s.targets?.phoneme === t.phoneme);

      for (const s of phonemeSessions) {
        const playedLevel = s.targets?.level as ClinicalLevel | undefined;
        if (!playedLevel) continue;
        levels = levels.map((l) => {
          if (l.level !== playedLevel) return l;
          const unlockedIfNeeded = l.status === "locked" ? { ...l, status: "available" as const } : l;
          return updateLevelProgress(unlockedIfNeeded, s.stars_earned, s.stars_possible, s.avg_confidence ?? 0);
        });
        const idx = levels.findIndex((l) => l.level === playedLevel);
        if (
          levels[idx].status === "mastered" &&
          idx + 1 < levels.length &&
          levels[idx + 1].status === "locked"
        ) {
          levels[idx + 1] = { ...levels[idx + 1], status: "available" };
        }
      }

      // Il livello "corrente" da targets.level deve risultare almeno disponibile, anche
      // senza sessioni ancora giocate (es. appena assegnato dal logopedista).
      levels = levels.map((l) => (l.level === t.level && l.status === "locked" ? { ...l, status: "available" } : l));

      return {
        id: t.phoneme,
        name: `Suono ${WORD_BANK[key]?.label ?? t.phoneme}`,
        islandAsset: "",
        unlockedByTherapist: t.set_by === "therapist",
        levels,
      };
    });

    const sessionLog: SessionLogEntry[] = sessions.map((s) => ({
      date: s.completed_at.slice(0, 10),
      completedAt: s.completed_at,
      phonemeGroupId: s.targets?.phoneme ?? "",
      phonemeLabel: s.targets ? WORD_BANK[s.targets.phoneme as PhonemeKey]?.label ?? s.targets.phoneme : "",
      level: (s.targets?.level as ClinicalLevel) ?? "L0",
      exerciseType: s.game_type,
      starsEarned: s.stars_earned,
      starsPossible: s.stars_possible,
      avgConfidence: s.avg_confidence ?? 0,
      // Non persistita lato Supabase (vedi nota 2 in supabase/schema.sql) — persa nel
      // ripristino, non nella sessione locale originale.
      durationSeconds: 0,
    }));

    // Ricostruisce lo StreakState rigiocando ogni sessione in ordine cronologico attraverso
    // la stessa funzione pura usata in tempo reale — mai una seconda logica divergente.
    let streak: StreakState = {
      currentWeeks: 0,
      sessionsThisWeek: 0,
      graceDaysRemaining: GRACE_DAYS_PER_MONTH,
      lastSessionDate: null,
    };
    for (const entry of sessionLog) streak = updateStreak(streak, entry.date);

    const totalStars = sessions.reduce((sum, s) => sum + s.stars_earned, 0);

    set({
      profile: {
        id: child.id,
        supabaseChildId: child.id,
        displayName: child.name,
        gender: child.gender ?? undefined,
        avatarId: child.avatarId || DEFAULT_AVATAR_ID,
        stars: totalStars,
        streak,
        unlockedCosmetics: [],
        phonemeGroups: groups,
        preferredTopics: [],
        // Piano di oggi non ricostruito dal ripristino (richiederebbe ricalcolare quali
        // esercizi proporre da zero) — resta vuoto finché il bambino non gioca di nuovo;
        // non è dato perso, solo da ricalcolare, fuori scope per questo giro.
        assignedToday: [],
        parentReportedConcerns: [],
        // cameraConsent non ha una colonna su `children` — vedi CLAUDE.md §4. Nessun default
        // pericoloso: riparte sempre da false, mai assumere un consenso dato in passato.
        audioRecordingConsent: child.audioRecordingConsent,
        cameraConsent: false,
        remindersEnabled: false,
        introsSeen: { lallo: false, album: false },
        sessionLog,
        lalloPet: { lastFedAt: null, lastInteractionAt: null },
        photoCatches: [],
        unlockedAchievements: achievements.map((a) => a.phoneme),
      },
    });
  },
}));
