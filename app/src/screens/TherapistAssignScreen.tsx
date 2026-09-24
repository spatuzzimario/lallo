import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WORD_BANK, PHONEME_ORDER, PhonemeKey } from "../constants/wordBank";
import { useGamificationStore } from "../store/useGamificationStore";
import { ClinicalLevel, LEVEL_LABELS } from "../types/gamification";

// NOTA ARCHITETTURALE: in un vero prodotto B2B2C il logopedista avrebbe
// quasi certamente un portale/login separato dal device del bambino, non
// un toggle nella stessa app. Questo schermo replica la scelta fatta nella
// demo HTML (un solo device, due viste) per continuità con la presentazione
// — non è la scelta di architettura finale.

const COLORS = { bg: "#FFF8EE", primary: "#2A20E0", text: "#1A1A1A", subtext: "#666", jade: "#137A6E" };

export default function TherapistAssignScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const profile = useGamificationStore((s) => s.profile);
  const assignPlan = useGamificationStore((s) => s.assignPlan);
  const [phoneme, setPhoneme] = useState<PhonemeKey>("r");
  const [level, setLevel] = useState<ClinicalLevel>(1);

  const meta = WORD_BANK[phoneme];
  // Suoni segnalati dal genitore in onboarding (vedi punto 6, feedback clinico luglio 2026):
  // sono solo un suggerimento pre-compilato, non un'assegnazione — il logopedista deve
  // comunque toccare "Assegna piano della settimana" qui sotto per attivarli davvero.
  const parentReportedConcerns = profile?.parentReportedConcerns ?? [];

  function handleSelectPhoneme(key: PhonemeKey) {
    setPhoneme(key);
  }

  function handleAssign() {
    assignPlan(phoneme, `Suono ${meta.label}`, level);
    Alert.alert("Piano assegnato ✓", `${meta.label} · livello ${level} (${LEVEL_LABELS[level]}) sbloccato per il bambino.`, [
      { text: "OK", onPress: () => navigation.navigate("WorldMap") },
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingTop: insets.top + 16, paddingBottom: 40 }}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <Text style={styles.title}>Assegna piano</Text>
      </View>

      {parentReportedConcerns.length > 0 && (
        <>
          <Text style={styles.fieldLabel}>SEGNALATI DAL GENITORE (da confermare)</Text>
          <View style={styles.chipRow}>
            {parentReportedConcerns.map((key) => (
              <Pressable
                key={key}
                onPress={() => handleSelectPhoneme(key as PhonemeKey)}
                style={styles.suggestChip}
              >
                <Text style={styles.suggestChipText}>{WORD_BANK[key as PhonemeKey]?.label ?? key}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      <Text style={styles.fieldLabel}>FONEMA</Text>
      <View style={styles.chipRow}>
        {PHONEME_ORDER.map((key) => (
          <Pressable
            key={key}
            onPress={() => handleSelectPhoneme(key)}
            style={[styles.chip, phoneme === key && styles.chipSelected]}
          >
            <Text style={[styles.chipText, phoneme === key && styles.chipTextSelected]}>{WORD_BANK[key].label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.fieldLabel}>LIVELLO</Text>
      <View style={styles.chipRow}>
        {[1, 2, 3, 4, 5].map((l) => (
          <Pressable key={l} onPress={() => setLevel(l as ClinicalLevel)} style={[styles.chip, level === l && styles.chipSelected]}>
            <Text style={[styles.chipText, level === l && styles.chipTextSelected]}>{l} · {LEVEL_LABELS[l as ClinicalLevel]}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.assignBtn} onPress={handleAssign}>
        <Text style={styles.assignBtnText}>Assegna piano della settimana</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  back: { fontSize: 26, color: COLORS.primary },
  title: { fontSize: 20, fontWeight: "800", color: COLORS.text },
  fieldLabel: { fontSize: 12, fontWeight: "700", color: COLORS.subtext, marginTop: 16, marginBottom: 8, textTransform: "uppercase" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 13, borderRadius: 999, borderWidth: 1.5, borderColor: "#D9CEBC", backgroundColor: "#fff" },
  chipSelected: { backgroundColor: COLORS.jade, borderColor: COLORS.jade },
  chipDisabled: { opacity: 0.35 },
  chipText: { fontSize: 12, fontWeight: "600", color: COLORS.text },
  chipTextSelected: { color: "#fff" },
  suggestChip: { paddingVertical: 8, paddingHorizontal: 13, borderRadius: 999, borderWidth: 1.5, borderColor: "#FFC53D", backgroundColor: "#FFF3D6" },
  suggestChipText: { fontSize: 12, fontWeight: "700", color: "#8A6A00" },
  assignBtn: { marginTop: 28, backgroundColor: "#FF6A4D", borderRadius: 14, padding: 15, alignItems: "center" },
  assignBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
