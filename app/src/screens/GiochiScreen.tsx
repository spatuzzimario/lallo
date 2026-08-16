import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useGamificationStore, DAILY_REWARD_GEMS } from "../store/useGamificationStore";
import { PHONEME_ORDER, PhonemeKey, WORD_BANK, isPremium, FREE_PHONEMES } from "../constants/wordBank";
import { ClinicalLevel, LevelProgress, LEVEL_LABELS } from "../types/gamification";

const C = {
  paper: "#FBF6EE", ink: "#1F2E2B", inkSoft: "#4A5A56", line: "#D9CEBC",
  jade: "#137A6E", jadeDeep: "#0E5C53", coral: "#FF6A4D", sun: "#FFC53D", mist: "#E4EFEA",
};

// Ogni gioco dichiara a quali livelli clinici si applica (brief §6.3) — usato per filtrare
// cosa mostrare quando si apre un nodo della mappa. "Ripeti con Lallo" resta fuori: è una
// feature virale/motivazionale, non un asse clinico con un livello proprio.
const GAMES = [
  { type: "caccia", label: "Caccia al suono", meta: "Discriminazione", bg: "#FDECE7", emoji: "🔎", levels: [1, 2, 3] },
  { type: "registratore", label: "Registratore", meta: "Produzione", bg: "#E9F5F1", emoji: "🎤", levels: [3, 4, 5] },
  { type: "memory", label: "Memory", meta: "Discriminazione", bg: "#FFF3D6", emoji: "🧩", levels: [2, 3] },
  { type: "coppie", label: "Coppie minime", meta: "Discriminazione fine", bg: "#FDECE7", emoji: "👯", levels: [3] },
  { type: "oca", label: "Gioco dell'oca", meta: "Produzione", bg: "#E9F5F1", emoji: "🎲", levels: [3, 4] },
  { type: "sequenze", label: "Sequenze illustrate", meta: "Narrazione", bg: "#FFF3D6", emoji: "📖", levels: [5] },
] as const;

function freshLevelsForDisplay(): LevelProgress[] {
  return [1, 2, 3, 4, 5].map((level) => ({
    level: level as ClinicalLevel,
    status: (level === 1 ? "available" : "locked") as LevelProgress["status"],
    masteryThreshold: 0.75,
    starsEarned: 0,
    starsPossible: 0,
  }));
}

// Diventata la tab di partenza dell'app (agosto 2026): la tab "Oggi" separata non aveva più
// senso senza un logopedista che assegna un piano giornaliero (modello parent-first, vedi
// CLAUDE.md) — mostrava solo gli stessi 2 esercizi auto-generati dallo screener, già
// interamente coperti dal nodo "Livello 1" della mappa qui sotto. Saluto, streak, tasto
// genitori e reward giornaliero (prima in HomeScreen, ora rimosso) vivono qui in testa.
//
// Catalogo di tutti i 25 fonemi (non solo quelli scelti allo screener/dal logopedista):
// i giochi sono già generici per fonema (pescano da WORD_BANK), mancava solo un modo per
// sceglierne uno diverso da quello assegnato oggi. I fonemi premium (fuori FREE_PHONEMES)
// restano visibili ma bloccati finché non si sottoscrive — toccarli apre il Paywall invece
// di aprire il gioco. Sotto ai chip, il percorso a 5 nodi (mappa) sostituisce l'elenco
// piatto: ogni nodo è un livello clinico, lo stato (locked/available/mastered) viene da
// PhonemeGroup.levels, già tracciato dallo store — qui è solo nuova UI su dati esistenti.
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
  const [expandedLevel, setExpandedLevel] = useState<ClinicalLevel | null>(null);

  if (!profile) return null;

  // Reward giornaliero — vedi la stessa logica di lettura già usata in precedenza in
  // HomeScreen: solo lettura, l'assegnazione vera avviene in recordSession nello store.
  const claimedCount = profile.dailyRewards.claimedDates.length;
  const todayStr = new Date().toISOString().slice(0, 10);
  const claimedToday = profile.dailyRewards.claimedDates.includes(todayStr);
  const cyclePos = claimedToday ? (claimedCount - 1 + 7) % 7 : claimedCount % 7;

  function selectPhoneme(key: PhonemeKey) {
    if (isPremium(key) && !subscriptionActive) {
      navigation.navigate("Paywall");
      return;
    }
    setSelectedPhoneme(key);
    setExpandedLevel(null);
  }

  const meta = WORD_BANK[selectedPhoneme];
  const position = meta.iniziale.length ? "iniziale" : "mediana";
  const group = profile.phonemeGroups.find((g) => g.id === selectedPhoneme);
  // Se il fonema non è ancora stato toccato (nessun gruppo salvato), la mappa mostra comunque
  // il livello 1 come punto di partenza — il gruppo vero viene creato al primo Fatto (vedi
  // recordSession in useGamificationStore).
  const levels = group?.levels ?? freshLevelsForDisplay();
  const firstPlayableLevel = levels.find((l) => l.status !== "locked")?.level ?? 1;

  function openGame(exerciseType: string, level: ClinicalLevel) {
    navigation.navigate("Session", { phonemeGroupId: selectedPhoneme, level, position, exerciseType });
  }

  function tapNode(lvl: LevelProgress) {
    if (lvl.status === "locked") return;
    setExpandedLevel((cur) => (cur === lvl.level ? null : lvl.level));
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 18, paddingTop: 24 }}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.greeting}>Ciao, {profile.displayName}! 👋</Text>
          <Text style={styles.subGreeting}>Scegli un suono e continua da dove eri</Text>
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

      <Pressable
        style={[styles.card, styles.cardFeatured, { marginTop: 20 }]}
        onPress={() => openGame("pappagallo", firstPlayableLevel)}
      >
        <View style={[styles.iconBox, { backgroundColor: "#fff" }]}>
          <Text style={styles.iconEmoji}>🦜</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>Ripeti con Lallo</Text>
          <Text style={[styles.cardMeta, styles.cardMetaFeatured]}>Novità · il pappagallo ti ripete!</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </Pressable>

      <Text style={[styles.sectionLabel, { marginTop: 20 }]}>PERCORSO · {meta.label}</Text>
      <View style={styles.map}>
        {levels.map((lvl, idx) => {
          const locked = lvl.status === "locked";
          const mastered = lvl.status === "mastered";
          const nodeGames = GAMES.filter((g) => (g.levels as readonly number[]).includes(lvl.level));
          return (
            <View key={lvl.level}>
              <Pressable
                onPress={() => tapNode(lvl)}
                disabled={locked}
                style={styles.nodeRow}
              >
                <View style={[styles.node, mastered && styles.nodeMastered, locked && styles.nodeLocked]}>
                  <Text style={styles.nodeText}>{locked ? "🔒" : mastered ? "⭐" : lvl.level}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.nodeLabel, locked && styles.nodeLabelLocked]}>
                    Livello {lvl.level} · {LEVEL_LABELS[lvl.level]}
                  </Text>
                  {!locked && lvl.starsPossible > 0 && (
                    <Text style={styles.nodeSub}>
                      {lvl.starsEarned}/{lvl.starsPossible} ⭐ {mastered ? "· conquistato" : ""}
                    </Text>
                  )}
                </View>
                {!locked && <Text style={styles.chevron}>{expandedLevel === lvl.level ? "︿" : "›"}</Text>}
              </Pressable>
              {idx < levels.length - 1 && <View style={styles.connector} />}

              {expandedLevel === lvl.level && (
                <View style={styles.nodeGames}>
                  {nodeGames.map((g) => (
                    <Pressable key={g.type} style={styles.gameCard} onPress={() => openGame(g.type, lvl.level)}>
                      <View style={[styles.iconBoxSmall, { backgroundColor: g.bg }]}>
                        <Text style={styles.iconEmojiSmall}>{g.emoji}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.gameCardTitle}>{g.label}</Text>
                        <Text style={styles.gameCardMeta}>{g.meta}</Text>
                      </View>
                      <Text style={styles.chevron}>›</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
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
  rewardStrip: { flexDirection: "row", gap: 6, marginBottom: 20 },
  rewardCell: {
    flex: 1, aspectRatio: 0.8, borderRadius: 12, borderWidth: 1.5, borderColor: C.line,
    backgroundColor: "#fff", alignItems: "center", justifyContent: "center", gap: 2,
  },
  rewardCellDone: { backgroundColor: C.mist, borderColor: C.jade },
  rewardCellToday: { borderColor: C.sun, borderWidth: 2, backgroundColor: "#FFF8E0" },
  rewardCellEmoji: { fontSize: 14 },
  rewardCellGems: { fontSize: 10.5, fontWeight: "700", color: C.inkSoft },
  rewardCellGemsDone: { color: C.jadeDeep },
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
    borderRadius: 18, padding: 13,
  },
  cardFeatured: { borderWidth: 2, borderColor: "#FF6A4D", backgroundColor: "#FDECE7" },
  iconBox: { width: 42, height: 42, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  iconEmoji: { fontSize: 20 },
  cardTitle: { fontSize: 14.5, fontWeight: "700", color: C.ink },
  cardMeta: { fontSize: 11.5, color: C.inkSoft, marginTop: 2 },
  cardMetaFeatured: { color: "#E84B30", fontWeight: "700" },
  chevron: { fontSize: 18, color: C.line },
  map: { marginTop: 4 },
  nodeRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 },
  node: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: C.jade,
    alignItems: "center", justifyContent: "center",
  },
  nodeMastered: { backgroundColor: C.sun },
  nodeLocked: { backgroundColor: "#E4DFD3" },
  nodeText: { fontSize: 17, fontWeight: "800", color: "#fff" },
  nodeLabel: { fontSize: 14, fontWeight: "700", color: C.ink },
  nodeLabelLocked: { color: C.inkSoft },
  nodeSub: { fontSize: 11.5, color: C.inkSoft, marginTop: 2 },
  connector: { width: 2, height: 14, backgroundColor: C.line, marginLeft: 21 },
  nodeGames: { marginLeft: 56, marginBottom: 8, gap: 8 },
  gameCard: {
    flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#fff", borderWidth: 1.5, borderColor: C.line,
    borderRadius: 14, padding: 10,
  },
  iconBoxSmall: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  iconEmojiSmall: { fontSize: 16 },
  gameCardTitle: { fontSize: 13, fontWeight: "700", color: C.ink },
  gameCardMeta: { fontSize: 10.5, color: C.inkSoft, marginTop: 1 },
});
