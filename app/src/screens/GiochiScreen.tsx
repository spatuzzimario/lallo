import React, { useCallback } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import * as Speech from "expo-speech";
import { useGamificationStore, DAILY_REWARD_GEMS } from "../store/useGamificationStore";
import { PHONEME_ORDER, PhonemeKey, WORD_BANK, isPremium } from "../constants/wordBank";
import { ClinicalLevel } from "../types/gamification";

const C = {
  paper: "#FBF6EE", ink: "#1F2E2B", inkSoft: "#4A5A56", line: "#D9CEBC",
  jade: "#137A6E", jadeDeep: "#0E5C53", coral: "#FF6A4D", sun: "#FFC53D", mist: "#E4EFEA",
};

function highestUnlockedLevel(levels?: { level: ClinicalLevel; status: string }[]): ClinicalLevel {
  if (!levels) return 1;
  const reached = levels.filter((l) => l.status !== "locked").map((l) => l.level);
  return reached.length ? (Math.max(...reached) as ClinicalLevel) : 1;
}

// Tab di partenza dell'app (agosto 2026): saluto, streak e reward giornaliero vivono qui in
// testa perché sono generali, non legati a un suono specifico.
//
// Settembre 2026 (feedback: "la scelta del fonema deve essere grande e prioritaria, altrimenti
// è confusionario"): prima questa schermata mischiava la scelta del suono (una riga di chip
// piccoli) con la mappa dei livelli del suono scelto, tutto insieme. Ora sono due passi
// separati: qui si sceglie SOLO il suono, con card grandi — poi si apre LivelliScreen (schermo
// a parte, vedi App.tsx) con la mappa a 5 livelli di quel suono soltanto. Il fonema è un
// parametro di navigazione, non più stato locale di un componente che potrebbe perderlo.
export default function GiochiScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const profile = useGamificationStore((s) => s.profile);
  const subscriptionActive = !!profile?.subscriptionActive;

  useFocusEffect(
    useCallback(() => {
      if (!profile) return;
      Speech.stop();
      Speech.speak(`Ciao ${profile.displayName}! Scegli un suono per iniziare a giocare`, {
        language: "it-IT", pitch: 1.05, rate: 0.92,
      });
    }, [profile?.displayName])
  );

  if (!profile) return null;

  const claimedCount = profile.dailyRewards.claimedDates.length;
  const todayStr = new Date().toISOString().slice(0, 10);
  const claimedToday = profile.dailyRewards.claimedDates.includes(todayStr);
  const cyclePos = claimedToday ? (claimedCount - 1 + 7) % 7 : claimedCount % 7;

  function openLivelli(key: PhonemeKey) {
    if (isPremium(key) && !subscriptionActive) {
      navigation.navigate("Paywall");
      return;
    }
    navigation.navigate("Livelli", { phonemeGroupId: key });
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 18, paddingTop: insets.top + 12 }}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.greeting}>Ciao, {profile.displayName}! 👋</Text>
          <Text style={styles.subGreeting}>Scegli un suono per iniziare</Text>
        </View>
        <View style={styles.topRight}>
          <Pressable onPress={() => navigation.navigate("AdultGate")} style={styles.parentBtn}>
            <Text style={styles.parentBtnText}>👪</Text>
          </Pressable>
          <View style={styles.streakPill}>
            <Text style={styles.streakText}>🔥 {profile.streak.currentWeeks || 1} giorni</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionLabel}>RICOMPENSA DEL GIORNO</Text>
      <View style={styles.rewardStrip}>
        {DAILY_REWARD_GEMS.map((gems, i) => {
          const done = i < cyclePos || (i === cyclePos && claimedToday);
          const isToday = i === cyclePos && !claimedToday;
          return (
            <View key={i} style={[styles.rewardCell, done && styles.rewardCellDone, isToday && styles.rewardCellToday]}>
              <Text style={styles.rewardCellEmoji}>{done ? "✅" : "💎"}</Text>
              <Text style={[styles.rewardCellGems, done && styles.rewardCellGemsDone]}>{gems}</Text>
            </View>
          );
        })}
      </View>

      <Text style={styles.sectionLabel}>SCEGLI UN SUONO</Text>
      <View style={styles.grid}>
        {PHONEME_ORDER.map((key) => {
          const locked = isPremium(key) && !subscriptionActive;
          const group = profile.phonemeGroups.find((g) => g.id === key);
          const level = highestUnlockedLevel(group?.levels);
          const started = !!group;
          return (
            <Pressable
              key={key}
              onPress={() => openLivelli(key)}
              style={[styles.card, locked && styles.cardLocked]}
            >
              <Text style={[styles.cardLabel, locked && styles.cardLabelLocked]}>{WORD_BANK[key].label}</Text>
              {locked ? (
                <Text style={styles.cardSub}>🔒 Premium</Text>
              ) : (
                <Text style={styles.cardSub}>{started ? `Livello ${level}` : "Da iniziare"}</Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.paper },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 },
  greeting: { fontSize: 17, fontWeight: "700", color: C.ink },
  subGreeting: { fontSize: 12.5, color: C.inkSoft, marginTop: 2 },
  topRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  parentBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#fff", borderWidth: 1.5, borderColor: C.line, alignItems: "center", justifyContent: "center" },
  parentBtnText: { fontSize: 15 },
  streakPill: { backgroundColor: C.mist, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 10 },
  streakText: { fontSize: 11.5, fontWeight: "600", color: C.jadeDeep },
  rewardStrip: { flexDirection: "row", gap: 6, marginBottom: 22 },
  rewardCell: {
    flex: 1, aspectRatio: 0.8, borderRadius: 12, borderWidth: 1.5, borderColor: C.line,
    backgroundColor: "#fff", alignItems: "center", justifyContent: "center", gap: 2,
  },
  rewardCellDone: { backgroundColor: C.mist, borderColor: C.jade },
  rewardCellToday: { borderColor: C.sun, borderWidth: 2, backgroundColor: "#FFF8E0" },
  rewardCellEmoji: { fontSize: 14 },
  rewardCellGems: { fontSize: 10.5, fontWeight: "700", color: C.inkSoft },
  rewardCellGemsDone: { color: C.jadeDeep },
  sectionLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5, color: C.inkSoft, marginBottom: 12 },
  // La scelta del suono è ora la cosa più grande e prioritaria della schermata (segnalato:
  // prima erano chip piccoli mischiati con la mappa dei livelli) — griglia di card larghe,
  // niente più scorrimento orizzontale da capire al volo.
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: {
    width: "31%", aspectRatio: 1, borderRadius: 18, borderWidth: 2, borderColor: C.line,
    backgroundColor: "#fff", alignItems: "center", justifyContent: "center", gap: 4,
  },
  cardLocked: { opacity: 0.55, backgroundColor: C.paper },
  cardLabel: { fontSize: 24, fontWeight: "800", color: C.jadeDeep },
  cardLabelLocked: { color: C.inkSoft },
  cardSub: { fontSize: 10.5, fontWeight: "700", color: C.inkSoft },
});
