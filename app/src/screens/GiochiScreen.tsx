import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useGamificationStore } from "../store/useGamificationStore";

const C = { paper: "#FBF6EE", ink: "#1F2E2B", inkSoft: "#4A5A56", line: "#D9CEBC" };

const GAMES = [
  { type: "caccia", label: "Caccia al suono", meta: "Discriminazione · liv. 1–3", bg: "#FDECE7", emoji: "🔎" },
  { type: "registratore", label: "Registratore", meta: "Produzione · liv. 3–5", bg: "#E9F5F1", emoji: "🎤" },
  { type: "memory", label: "Memory", meta: "Discriminazione · liv. 2–3", bg: "#FFF3D6", emoji: "🧩" },
  { type: "coppie", label: "Coppie minime", meta: "Discriminazione fine · liv. 3", bg: "#FDECE7", emoji: "👯" },
  { type: "oca", label: "Gioco dell'oca", meta: "Produzione · liv. 3–4", bg: "#E9F5F1", emoji: "🎲" },
  { type: "sequenze", label: "Sequenze illustrate", meta: "Narrazione · liv. 5", bg: "#FFF3D6", emoji: "📖" },
] as const;

export default function GiochiScreen({ navigation }: any) {
  const profile = useGamificationStore((s) => s.profile);
  if (!profile) return null;

  // Usa il fonema/posizione dell'ultimo piano assegnato per oggi come default
  // quando il bambino esplora il catalogo fuori dalla lista "Oggi".
  const defaultPlan = profile.assignedToday[0];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 18, paddingTop: 24 }}>
      <Text style={styles.sectionLabel}>TUTTI I GIOCHI</Text>
      {GAMES.map((g) => (
        <Pressable
          key={g.type}
          style={styles.card}
          onPress={() =>
            defaultPlan &&
            navigation.navigate("Session", {
              phonemeGroupId: defaultPlan.phonemeGroupId,
              level: defaultPlan.level,
              position: defaultPlan.position,
              exerciseType: g.type,
            })
          }
        >
          <View style={[styles.iconBox, { backgroundColor: g.bg }]}>
            <Text style={styles.iconEmoji}>{g.emoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{g.label}</Text>
            <Text style={styles.cardMeta}>{g.meta}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      ))}
      {!defaultPlan && (
        <Text style={styles.emptyNote}>
          Ancora nessun piano assegnato — questi giochi si attiveranno appena il logopedista imposterà fonema e livello.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.paper },
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
