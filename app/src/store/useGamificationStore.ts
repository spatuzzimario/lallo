import { create } from "zustand";
import {
  ChildProfile,
  SessionResult,
  StreakState,
  LevelProgress,
} from "../types/gamification";

interface GamificationStore {
  profile: ChildProfile | null;
  setProfile: (p: ChildProfile) => void;
  recordSession: (result: SessionResult) => void;
  assignPlan: (phonemeGroupId: string, groupName: string, level: LevelProgress["level"]) => void;
}

const MASTERY_DEFAULT_THRESHOLD = 0.75;
const SESSIONS_TO_COUNT_WEEK = 3;
const GRACE_DAYS_PER_MONTH = 2;

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

  recordSession: (result: SessionResult) => {
    const profile = get().profile;
    if (!profile) return;

    const totalStars = result.attempts.reduce((sum, a) => sum + a.starsAwarded, 0);
    const avgConfidence =
      result.attempts.reduce((sum, a) => sum + a.confidenceScore, 0) /
      Math.max(result.attempts.length, 1);

    const updatedGroups = profile.phonemeGroups.map((group) => {
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

      // Auto-unlock next level's "available" status only if therapist
      // has enabled progression for this phoneme group — clinical gate,
      // not a pure algorithmic unlock. See design doc section 4.
      const masteredIdx = updatedLevels.findIndex((l) => l.level === result.level);
      if (
        group.unlockedByTherapist &&
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

    // Gems only from streak milestones, not from routine play —
    // keeps the cosmetic economy tied to consistency, not grinding.
    const justHitWeeklyMilestone =
      newStreak.currentWeeks > profile.streak.currentWeeks;
    const gemsAwarded = justHitWeeklyMilestone ? 5 : 0;

    set({
      profile: {
        ...profile,
        stars: profile.stars + totalStars,
        gems: profile.gems + gemsAwarded,
        streak: newStreak,
        phonemeGroups: updatedGroups,
      },
    });
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
        levels: [1, 2, 3, 4, 5].map((l) => ({
          level: l as LevelProgress["level"],
          status: (l === level ? "available" : "locked") as LevelProgress["status"],
          masteryThreshold: 0.75,
          starsEarned: 0,
          starsPossible: 0,
        })),
      };
      set({
        profile: {
          ...profile,
          phonemeGroups: [...profile.phonemeGroups, newGroup],
        },
      });
    }
  },
}));
