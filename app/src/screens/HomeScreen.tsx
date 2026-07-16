import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useGamificationStore } from "../store/useGamificationStore";
import { WORD_BANK } from "../constants/wordBank";

// Colori esatti del brand, presi dalla demo HTML (lallo-landing/index.html),
// non approssimati — vedi --paper/--jade/--coral/--sun/--mist/--ink lì.
const C = {
  paper: "#FBF6EE",
  ink: "#1F2E2B",
  inkSoft: "#4A5A56",
  jade: "#137A6E",
  jadeDeep: "#0E5C53",
  coral: "#FF6A4D",
  coralDeep: "#E84B30",
  sun: "#FFC53D",
  mist: "#E4EFEA",
  line: "#D9CEBC",
};

const ICON_BG: Record<string, string> = {
  caccia: "#FDECE7",
  registratore: "#E9F5F1",
  memory: "#FFF3D6",
  coppie: "#FDECE7",
  oca: "#E9F5F1",
  sequenze: "#FFF3D6",
};
const ICON_EMOJI: Record<string, string> = {
  caccia: "🔎",
  registratore: "🎤",
  memory: "🧩",
  coppie: "👯",
  oca: "🎲",
  sequenze: "📖",
};

export default function HomeScreen({ navigation }: any) {
  const profile = useGamificationStore((s) => s.profile);
  if (!profile) return null;

  // "Suono di oggi" = il fonema del primo esercizio assegnato — stessa logica
  // della demo, che mostrava un solo fonema focus nell'header.
  const todayPhonemeKey = profile.assignedToday[0]?.phonemeGroupId;
  const todayLabel = todayPhonemeKey ? WORD_BANK[todayPhonemeKey as keyof typeof WORD_BANK]?.label : "—";

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 18, paddingTop: 24 }}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.greeting}>Ciao, {profile.displayName}! 👋</Text>
          <Text style={styles.subGreeting}>Suono di oggi: la {todayLabel}</Text>
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

      <View style={styles.rewardCard}>
        <View>
          <Text style={styles.rewardBig}>{profile.assignedToday.length}</Text>
          <Text style={styles.rewardLabel}>giochi per oggi</Text>
        </View>
        <View style={styles.stickerRow}>
          <Text style={styles.sticker}>⭐</Text>
          <Text style={styles.sticker}>🦜</Text>
          <Text style={styles.sticker}>🎖️</Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>DA FARE OGGI</Text>

      {profile.assignedToday.map((ex) => (
        <Pressable
          key={ex.id}
          style={styles.card}
          onPress={() =>
            navigation.navigate("Session", {
              phonemeGroupId: ex.phonemeGroupId,
              level: ex.level,
              position: ex.position,
              exerciseType: ex.exerciseType,
            })
          }
        >
          <View style={[styles.iconBox, { backgroundColor: ICON_BG[ex.exerciseType] }]}>
            <Text style={styles.iconEmoji}>{ICON_EMOJI[ex.exerciseType]}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{ex.exerciseLabel}</Text>
            <Text style={styles.cardMeta}>
              {ex.phonemeLabel} {ex.position} · {ex.levelRangeLabel}
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      ))}

      {profile.assignedToday.length === 0 && (
        <Text style={styles.emptyNote}>
          Nessun esercizio assegnato ancora. Il logopedista di {profile.displayName} imposterà il piano alla
          prossima seduta.
        </Text>
      )}
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
  rewardCard: {
    flexDirection: "row", alignItems: "center", backgroundColor: C.sun, borderRadius: 18, padding: 14, marginBottom: 16,
  },
  rewardBig: { fontFamily: undefined, fontWeight: "800", fontSize: 26, color: C.ink },
  rewardLabel: { fontSize: 11, color: C.ink },
  stickerRow: { flexDirection: "row", gap: 5, marginLeft: "auto" },
  sticker: { fontSize: 19 },
  sectionLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5, color: C.inkSoft, marginBottom: 10 },
  card: {
    flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#fff", borderWidth: 1.5, borderColor: C.line,
    borderRadius: 18, padding: 13, marginBottom: 11,
  },
  iconBox: { width: 42, height: 42, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  iconEmoji: { fontSize: 20 },
  cardTitle: { fontSize: 14.5, fontWeight: "700", color: C.ink },
  cardMeta: { fontSize: 11.5, color: C.inkSoft, marginTop: 2 },
  chevron: { fontSize: 18, color: C.line },
  emptyNote: { fontSize: 13, color: C.inkSoft, textAlign: "center", marginTop: 20, lineHeight: 20 },
});
