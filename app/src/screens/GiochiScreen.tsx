import React, { useCallback } from "react";
import { View, Text, Image, ScrollView, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useGamificationStore } from "../store/useGamificationStore";
import { PHONEME_ORDER, PhonemeKey, WORD_BANK, isPremium } from "../constants/wordBank";
import { ClinicalLevel, LEVEL_ORDER, LEVEL_LABELS } from "../types/gamification";
import { useVoice } from "../hooks/useVoice";

const C = {
  paper: "#FBF6EE", ink: "#1F2E2B", inkSoft: "#4A5A56", line: "#D9CEBC",
  jade: "#137A6E", jadeDeep: "#0E5C53", coral: "#FF6A4D", sun: "#FFC53D", mist: "#E4EFEA",
};

// "Più alto" = indice più avanti in LEVEL_ORDER, non il valore numerico più grande (gli id
// sono stringhe, es. "L1-3" — niente più Math.max diretto sui livelli).
function highestUnlockedLevel(levels?: { level: ClinicalLevel; status: string }[]): ClinicalLevel {
  if (!levels) return LEVEL_ORDER[0];
  const reachedIdx = levels
    .filter((l) => l.status !== "locked")
    .map((l) => LEVEL_ORDER.indexOf(l.level));
  return reachedIdx.length ? LEVEL_ORDER[Math.max(...reachedIdx)] : LEVEL_ORDER[0];
}

// Settembre 2026 (feedback): saluto, streak e ricompensa giornaliera si sono spostati sulla
// tab Lallo, che è diventata la home dell'app — questa schermata fa solo una cosa, farla
// grande e chiara: scegliere il suono. Anche l'iconetta genitori in alto è stata tolta da
// qui, ora è la tab Progressi (ultima, protetta dal calcolo). La scelta del suono è una
// griglia di card larghe (non più una riga di chip minuscoli mischiata alla mappa dei
// livelli) — toccando una card si apre LivelliScreen con la mappa a 5 livelli di quel solo
// suono. Il fonema è un parametro di navigazione, non stato locale.
export default function GiochiScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const profile = useGamificationStore((s) => s.profile);
  const subscriptionActive = !!profile?.subscriptionActive;
  const { speak } = useVoice();

  useFocusEffect(
    useCallback(() => {
      speak("Scegli un suono per iniziare a giocare", "giochi_scegli_suono");
    }, [])
  );

  if (!profile) return null;

  function openLivelli(key: PhonemeKey) {
    if (isPremium(key) && !subscriptionActive) {
      navigation.navigate("Paywall");
      return;
    }
    navigation.navigate("Livelli", { phonemeGroupId: key });
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 18, paddingTop: insets.top + 12 }}>
      <View style={styles.header}>
        <Image source={require("../../assets/lallo-splash.png")} style={styles.mascot} resizeMode="contain" />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Scegli un suono</Text>
          <Text style={styles.subtitle}>Lallo ti aiuta ad allenarti su questo</Text>
        </View>
      </View>

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
                <Text style={styles.cardSub}>{started ? LEVEL_LABELS[level] : "Da iniziare"}</Text>
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
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  mascot: { width: 46, height: 46 },
  title: { fontSize: 18, fontWeight: "800", color: C.ink },
  subtitle: { fontSize: 12.5, color: C.inkSoft, marginTop: 2 },
  // La scelta del suono è la cosa più grande e prioritaria della schermata (segnalato:
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
