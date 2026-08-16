import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useGamificationStore } from "../store/useGamificationStore";
import { PHONEME_ORDER, PhonemeKey, WORD_BANK, isPremium, FREE_PHONEMES } from "../constants/wordBank";

const C = { paper: "#FBF6EE", ink: "#1F2E2B", inkSoft: "#4A5A56", line: "#D9CEBC", jade: "#137A6E", coral: "#FF6A4D" };

const GAMES = [
  { type: "pappagallo", label: "Ripeti con Lallo", meta: "Novità · il pappagallo ti ripete!", bg: "#fff", emoji: "🦜", featured: true },
  { type: "caccia", label: "Caccia al suono", meta: "Discriminazione · liv. 1–3", bg: "#FDECE7", emoji: "🔎" },
  { type: "registratore", label: "Registratore", meta: "Produzione · liv. 3–5", bg: "#E9F5F1", emoji: "🎤" },
  { type: "memory", label: "Memory", meta: "Discriminazione · liv. 2–3", bg: "#FFF3D6", emoji: "🧩" },
  { type: "coppie", label: "Coppie minime", meta: "Discriminazione fine · liv. 3", bg: "#FDECE7", emoji: "👯" },
  { type: "oca", label: "Gioco dell'oca", meta: "Produzione · liv. 3–4", bg: "#E9F5F1", emoji: "🎲" },
  { type: "sequenze", label: "Sequenze illustrate", meta: "Narrazione · liv. 5", bg: "#FFF3D6", emoji: "📖" },
] as const;

// Catalogo di tutti i 24 fonemi (non solo quelli scelti allo screener/dal logopedista):
// i 7 giochi sono già generici per fonema (pescano da WORD_BANK), mancava solo un modo
// per sceglierne uno diverso da quello assegnato oggi. I fonemi premium (fuori
// FREE_PHONEMES) restano visibili ma bloccati finché non si sottoscrive — toccarli apre
// il Paywall invece di aprire il gioco.
export default function GiochiScreen({ navigation }: any) {
  const profile = useGamificationStore((s) => s.profile);
  const subscriptionActive = !!profile?.subscriptionActive;
  const defaultPlan = profile?.assignedToday[0];
  const defaultPlanKey = defaultPlan?.phonemeGroupId as PhonemeKey | undefined;
  // Se il fonema assegnato oggi è premium e non c'è abbonamento, non aprire il catalogo
  // già su un suono bloccato — si parte da un suono gratuito, quello assegnato resta
  // comunque raggiungibile più avanti nella riga dei chip, con il lucchetto.
  const initialPhoneme: PhonemeKey =
    defaultPlanKey && !(isPremium(defaultPlanKey) && !subscriptionActive)
      ? defaultPlanKey
      : FREE_PHONEMES[0];

  const [selectedPhoneme, setSelectedPhoneme] = useState<PhonemeKey>(initialPhoneme);

  if (!profile) return null;

  function selectPhoneme(key: PhonemeKey) {
    if (isPremium(key) && !subscriptionActive) {
      navigation.navigate("Paywall");
      return;
    }
    setSelectedPhoneme(key);
  }

  const meta = WORD_BANK[selectedPhoneme];
  const position = meta.iniziale.length ? "iniziale" : "mediana";
  const group = profile.phonemeGroups.find((g) => g.id === selectedPhoneme);
  const level = group?.levels.find((l) => l.status !== "locked")?.level ?? 1;

  function openGame(exerciseType: string) {
    navigation.navigate("Session", {
      phonemeGroupId: selectedPhoneme,
      level,
      position,
      exerciseType,
    });
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 18, paddingTop: 24 }}>
      <Text style={styles.sectionLabel}>SUONO</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {PHONEME_ORDER.map((key) => {
          const locked = isPremium(key) && !subscriptionActive;
          const on = key === selectedPhoneme;
          return (
            <Pressable
              key={key}
              onPress={() => selectPhoneme(key)}
              style={[styles.chip, on && styles.chipOn, locked && styles.chipLocked]}
            >
              <Text style={[styles.chipText, on && styles.chipTextOn]}>{WORD_BANK[key].label}</Text>
              {locked && <Text style={styles.chipLock}>🔒</Text>}
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={[styles.sectionLabel, { marginTop: 20 }]}>TUTTI I GIOCHI · {meta.label}</Text>
      {GAMES.map((g) => (
        <Pressable
          key={g.type}
          style={[styles.card, "featured" in g && g.featured && styles.cardFeatured]}
          onPress={() => openGame(g.type)}
        >
          <View style={[styles.iconBox, { backgroundColor: g.bg }]}>
            <Text style={styles.iconEmoji}>{g.emoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{g.label}</Text>
            <Text style={[styles.cardMeta, "featured" in g && g.featured && styles.cardMetaFeatured]}>{g.meta}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.paper },
  sectionLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5, color: C.inkSoft, marginBottom: 10 },
  chipRow: { gap: 8, paddingRight: 8 },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1.5, borderColor: C.line,
    borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14, backgroundColor: "#fff",
  },
  chipOn: { borderColor: C.jade, backgroundColor: "#E9F5F1" },
  chipLocked: { opacity: 0.6 },
  chipText: { fontSize: 13, fontWeight: "700", color: C.ink },
  chipTextOn: { color: C.jade },
  chipLock: { fontSize: 11 },
  card: {
    flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#fff", borderWidth: 1.5, borderColor: C.line,
    borderRadius: 18, padding: 13, marginBottom: 11,
  },
  cardFeatured: { borderWidth: 2, borderColor: "#FF6A4D", backgroundColor: "#FDECE7" },
  iconBox: { width: 42, height: 42, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  iconEmoji: { fontSize: 20 },
  cardTitle: { fontSize: 14.5, fontWeight: "700", color: C.ink },
  cardMeta: { fontSize: 11.5, color: C.inkSoft, marginTop: 2 },
  cardMetaFeatured: { color: "#E84B30", fontWeight: "700" },
  chevron: { fontSize: 18, color: C.line },
});
