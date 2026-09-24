import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ParentDashboardScreen } from "./ParentScreens";

const C = { bg: "#FFF8EE", primary: "#2A20E0", text: "#1A1A1A", subtext: "#666", coral: "#FF6A4D" };

// Ispirato al "Are you a grown up?" di Speech Blubs: una domanda matematica semplice prima
// di entrare nella zona genitori. Non è vera sicurezza (un bambino di 8 anni potrebbe
// risolverla), è un filtro di attrito intenzionale contro i click accidentali di chi ha
// 3-6 anni, che è il target reale dell'app.
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

// Settembre 2026 (feedback): prima "Genitori" era un'iconetta a parte in cima a Giochi, che
// apriva un gate a modale e poi la dashboard come schermata separata ("ParentDashboard").
// Ora è tutto qui, come 4ª e ultima tab: il calcolo protegge l'intera tab (si rifà ad ogni
// riavvio dell'app, ma resta sbloccata per il resto della sessione una volta risolto — non
// ha senso richiederlo ad ogni singolo tap sulla tab, il calcolo è un filtro di attrito, non
// una password). Dopo il calcolo, il contenuto è la dashboard genitore già esistente
// (ParentDashboardScreen): progressi dettagliati per fonema, uso settimanale, andamento,
// abbonamento, consensi.
export default function ProgressiScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [problem, setProblem] = useState(randomProblem);
  const [wrong, setWrong] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  function check(value: number) {
    if (value === problem.correct) {
      setUnlocked(true);
    } else {
      setWrong(true);
      setTimeout(() => setWrong(false), 500);
      setProblem(randomProblem());
    }
  }

  if (unlocked) {
    return <ParentDashboardScreen navigation={navigation} />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <Text style={styles.lock}>🔒</Text>
      <Text style={styles.title}>Sei un adulto?</Text>
      <Text style={styles.subtitle}>Questa parte è per i genitori. Risolvi il calcolo per continuare.</Text>
      <Text style={[styles.problem, wrong && styles.problemWrong]}>
        {problem.a} + {problem.b} = ?
      </Text>
      <View style={styles.optionsRow}>
        {problem.options.map((opt) => (
          <Pressable key={opt} onPress={() => check(opt)} style={styles.optionBtn}>
            <Text style={styles.optionText}>{opt}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg, alignItems: "center", padding: 24 },
  lock: { fontSize: 50, marginTop: 40 },
  title: { fontSize: 24, fontWeight: "800", marginTop: 16, color: C.text },
  subtitle: { fontSize: 15, color: C.subtext, textAlign: "center", marginTop: 10, marginBottom: 50 },
  problem: { fontSize: 40, fontWeight: "800", color: C.text, marginBottom: 30 },
  problemWrong: { color: C.coral },
  optionsRow: { flexDirection: "row", gap: 16 },
  optionBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: C.primary, alignItems: "center", justifyContent: "center" },
  optionText: { color: "#fff", fontSize: 22, fontWeight: "800" },
});
