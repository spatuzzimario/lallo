import React, { useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useGamificationStore } from "../store/useGamificationStore";

const COLORS = {
  bg: "#FFF8EE",
  primary: "#2A20E0",
  text: "#1A1A1A",
  subtext: "#666",
  jade: "#137A6E",
  coral: "#FF6A4D",
};

/* ---------------- Adult gate ----------------
   Ispirato al "Are you a grown up?" di Speech Blubs: una domanda
   matematica semplice prima di entrare nella zona genitori/logopedista.
   Non è vera sicurezza (un bambino di 8 anni potrebbe risolverla), è
   un filtro di attrito intenzionale contro i click accidentali di chi
   ha 3-6 anni, che è il target reale dell'app. */
function randomProblem() {
  const a = Math.floor(Math.random() * 6) + 2;
  const b = Math.floor(Math.random() * 6) + 2;
  const correct = a + b;
  const distractors = new Set<number>();
  while (distractors.size < 2) {
    const d = correct + (Math.floor(Math.random() * 5) - 2);
    if (d !== correct && d > 0) distractors.add(d);
  }
  const options = [...distractors, correct].sort(() => Math.random() - 0.5);
  return { a, b, correct, options };
}

export function AdultGateScreen({ navigation }: any) {
  const [problem] = useState(randomProblem);
  const [wrong, setWrong] = useState(false);

  function check(value: number) {
    if (value === problem.correct) {
      navigation.replace("ParentDashboard");
    } else {
      setWrong(true);
      setTimeout(() => setWrong(false), 500);
    }
  }

  return (
    <View style={gateStyles.container}>
      <Pressable onPress={() => navigation.goBack()} style={gateStyles.close}>
        <Text style={gateStyles.closeText}>✕</Text>
      </Pressable>
      <Text style={gateStyles.lock}>🔒</Text>
      <Text style={gateStyles.title}>Sei un adulto?</Text>
      <Text style={gateStyles.subtitle}>
        Questa parte è per i genitori. Risolvi il calcolo per continuare.
      </Text>
      <Text style={[gateStyles.problem, wrong && gateStyles.problemWrong]}>
        {problem.a} + {problem.b} = ?
      </Text>
      <View style={gateStyles.optionsRow}>
        {problem.options.map((opt) => (
          <Pressable key={opt} onPress={() => check(opt)} style={gateStyles.optionBtn}>
            <Text style={gateStyles.optionText}>{opt}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const gateStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, alignItems: "center", padding: 24, paddingTop: 60 },
  close: { position: "absolute", top: 50, right: 20, width: 36, height: 36, borderRadius: 18, backgroundColor: "#EEE", alignItems: "center", justifyContent: "center" },
  closeText: { fontSize: 16, color: COLORS.primary, fontWeight: "700" },
  lock: { fontSize: 50, marginTop: 40 },
  title: { fontSize: 24, fontWeight: "800", marginTop: 16, color: COLORS.text },
  subtitle: { fontSize: 15, color: COLORS.subtext, textAlign: "center", marginTop: 10, marginBottom: 50 },
  problem: { fontSize: 40, fontWeight: "800", color: COLORS.text, marginBottom: 30 },
  problemWrong: { color: COLORS.coral },
  optionsRow: { flexDirection: "row", gap: 16 },
  optionBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center" },
  optionText: { color: "#fff", fontSize: 22, fontWeight: "800" },
});

/* ---------------- Parent dashboard ----------------
   Deliberatamente SOLO osservativa: mostra progressi e suggerisce
   dove concentrarsi, ma non permette di riassegnare fonema/livello.
   Quella responsabilità resta al logopedista — è la scelta di
   posizionamento B2B2C, diversa dal modello puro B2C di Speech Blubs. */
export function ParentDashboardScreen({ navigation }: any) {
  const profile = useGamificationStore((s) => s.profile);

  const focusSuggestion = useMemo<{ groupName: string; level: number; progress: number } | null>(() => {
    if (!profile) return null;
    let lowest: { groupName: string; level: number; progress: number } | null = null;
    profile.phonemeGroups.forEach((group) => {
      group.levels.forEach((lvl) => {
        if (lvl.status !== "in_progress") return;
        const progress = lvl.starsPossible ? lvl.starsEarned / lvl.starsPossible : 0;
        if (!lowest || progress < lowest.progress) {
          lowest = { groupName: group.name, level: lvl.level, progress };
        }
      });
    });
    return lowest;
  }, [profile]);

  if (!profile) return null;

  return (
    <View style={dashStyles.container}>
      <View style={dashStyles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={dashStyles.back}>‹</Text>
        </Pressable>
        <Text style={dashStyles.title}>Progressi di {profile.displayName}</Text>
      </View>

      <View style={dashStyles.summaryRow}>
        <View style={dashStyles.summaryCard}>
          <Text style={dashStyles.summaryNum}>{profile.streak.currentWeeks}</Text>
          <Text style={dashStyles.summaryLabel}>settimane di pratica</Text>
        </View>
        <View style={dashStyles.summaryCard}>
          <Text style={dashStyles.summaryNum}>{profile.streak.sessionsThisWeek}/3</Text>
          <Text style={dashStyles.summaryLabel}>sessioni questa settimana</Text>
        </View>
      </View>

      {focusSuggestion && (
        <View style={dashStyles.focusCard}>
          <Text style={dashStyles.focusLabel}>💡 Su cosa concentrarsi</Text>
          <Text style={dashStyles.focusText}>
            {focusSuggestion.groupName} — livello {focusSuggestion.level} è al{" "}
            {Math.round(focusSuggestion.progress * 100)}%. Qualche minuto in più qui aiuta di più che altrove.
          </Text>
        </View>
      )}

      <Text style={dashStyles.sectionLabel}>Dettaglio per fonema</Text>
      {profile.phonemeGroups.map((group) => (
        <View key={group.id} style={dashStyles.groupCard}>
          <Text style={dashStyles.groupName}>{group.name}</Text>
          {group.levels.map((lvl) => {
            const pct = lvl.starsPossible ? Math.round((lvl.starsEarned / lvl.starsPossible) * 100) : 0;
            return (
              <View key={lvl.level} style={dashStyles.levelRow}>
                <Text style={dashStyles.levelLabel}>Livello {lvl.level}</Text>
                <View style={dashStyles.barTrack}>
                  <View style={[dashStyles.barFill, { width: `${pct}%` }]} />
                </View>
                <Text style={dashStyles.levelPct}>{pct}%</Text>
              </View>
            );
          })}
        </View>
      ))}

      <View style={dashStyles.therapistNote}>
        <Text style={dashStyles.therapistNoteText}>
          Per cambiare fonema, posizione o livello assegnato, parlane con il logopedista di{" "}
          {profile.displayName} alla prossima seduta — questa vista serve a tenervi allineati, non sostituisce il piano clinico.
        </Text>
      </View>
    </View>
  );
}

const dashStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: 16, paddingTop: 56 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  back: { fontSize: 26, color: COLORS.primary },
  title: { fontSize: 20, fontWeight: "800", color: COLORS.text },
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  summaryCard: { flex: 1, backgroundColor: "#fff", borderRadius: 16, padding: 14, alignItems: "center" },
  summaryNum: { fontSize: 22, fontWeight: "800", color: COLORS.jade },
  summaryLabel: { fontSize: 11, color: COLORS.subtext, marginTop: 2, textAlign: "center" },
  focusCard: { backgroundColor: "#FFF3D6", borderRadius: 16, padding: 14, marginBottom: 18 },
  focusLabel: { fontWeight: "700", marginBottom: 4 },
  focusText: { fontSize: 13, color: COLORS.text, lineHeight: 18 },
  sectionLabel: { fontSize: 13, fontWeight: "700", color: COLORS.subtext, marginBottom: 8, textTransform: "uppercase" },
  groupCard: { backgroundColor: "#fff", borderRadius: 16, padding: 14, marginBottom: 12 },
  groupName: { fontWeight: "800", fontSize: 15, marginBottom: 8 },
  levelRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  levelLabel: { fontSize: 12, width: 64, color: COLORS.subtext },
  barTrack: { flex: 1, height: 8, backgroundColor: "#EEE", borderRadius: 999, overflow: "hidden" },
  barFill: { height: "100%", backgroundColor: COLORS.jade, borderRadius: 999 },
  levelPct: { fontSize: 12, width: 36, textAlign: "right", color: COLORS.text },
  therapistNote: { backgroundColor: "#E9F5F1", borderRadius: 14, padding: 14, marginTop: 8, marginBottom: 24 },
  therapistNoteText: { fontSize: 12.5, color: COLORS.jade, lineHeight: 18 },
});
