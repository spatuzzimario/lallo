import React, { useCallback, useState } from "react";
import { View, Text, Image, ScrollView, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useGamificationStore } from "../store/useGamificationStore";
import { PhonemeKey, WORD_BANK } from "../constants/wordBank";
import { ClinicalLevel, LevelProgress, LEVEL_LABELS } from "../types/gamification";
import { useVoice } from "../hooks/useVoice";

const C = {
  paper: "#FBF6EE", ink: "#1F2E2B", inkSoft: "#4A5A56", line: "#D9CEBC",
  jade: "#137A6E", jadeDeep: "#0E5C53", coral: "#FF6A4D", sun: "#FFC53D", mist: "#E4EFEA",
};

// Ogni gioco dichiara a quali livelli clinici si applica (brief §6.3) — usato per filtrare
// cosa mostrare quando si apre un nodo della mappa. "Ripeti con Lallo" resta fuori: è una
// feature virale/motivazionale, non un asse clinico con un livello proprio.
//
// Livello 1 non è qui: niente più 2 giochi a scelta, è lo schermo dedicato alle sillabe
// isolate (vedi SillabeIsolate in SessionScreen) — un solo percorso obbligato.
//
// Ordine dell'array = ordine di difficoltà crescente mostrato nella mappa (dal più semplice
// al più difficile): Ripeti (ascolta e ripeti, nessuna scelta da sbagliare) → Ascolta e
// scegli → Memory → Caccia al suono (il più difficile: serve aver già capito bene il
// suono). I giochi di produzione più avanzati (Registratore, Coppie minime, Gioco dell'oca,
// Sequenze) restano dopo, nel loro ordine originale.
const GAMES = [
  { type: "ripeti", label: "Ripeti", meta: "Produzione · tutte le parole", bg: "#E9F5F1", icon: require("../../assets/icons/game_ripeti.png"), levels: [2, 3] },
  { type: "ascolta", label: "Ascolta e scegli", meta: "Discriminazione", bg: "#FFF3D6", icon: require("../../assets/icons/game_ascolta.png"), levels: [2, 3] },
  { type: "memory", label: "Memory", meta: "Discriminazione", bg: "#FFF3D6", icon: require("../../assets/icons/game_memory.png"), levels: [2, 3] },
  { type: "caccia", label: "Caccia al suono", meta: "Discriminazione", bg: "#FDECE7", icon: require("../../assets/icons/game_caccia.png"), levels: [2, 3] },
  { type: "registratore", label: "Registratore", meta: "Produzione", bg: "#E9F5F1", icon: require("../../assets/icons/game_registratore.png"), levels: [3, 4, 5] },
  { type: "coppie", label: "Coppie minime", meta: "Discriminazione fine", bg: "#FDECE7", icon: require("../../assets/icons/game_coppie.png"), levels: [3] },
  { type: "oca", label: "Gioco dell'oca", meta: "Produzione", bg: "#E9F5F1", icon: require("../../assets/icons/game_oca.png"), levels: [3, 4] },
  { type: "sequenze", label: "Sequenze illustrate", meta: "Narrazione", bg: "#FFF3D6", icon: require("../../assets/icons/game_sequenze.png"), levels: [5] },
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

// Mappa a 5 livelli per UN SOLO suono — raggiunta da GiochiScreen dopo la scelta del suono
// (settembre 2026: prima le due cose vivevano nella stessa schermata, confusionario). Il
// suono arriva come parametro di navigazione, non più come stato locale.
export default function LivelliScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const profile = useGamificationStore((s) => s.profile);
  const phonemeKey = route.params.phonemeGroupId as PhonemeKey;
  const [expandedLevel, setExpandedLevel] = useState<ClinicalLevel | null>(null);
  const { speak } = useVoice();

  useFocusEffect(
    useCallback(() => {
      speak(`Scegli un livello per allenare il suono ${WORD_BANK[phonemeKey].label}`, `tpl_livelli_${phonemeKey}`);
    }, [phonemeKey])
  );

  if (!profile) return null;

  const meta = WORD_BANK[phonemeKey];
  const group = profile.phonemeGroups.find((g) => g.id === phonemeKey);
  // Se il fonema non è ancora stato toccato (nessun gruppo salvato), la mappa mostra comunque
  // il livello 1 come punto di partenza — il gruppo vero viene creato al primo Fatto (vedi
  // recordSession in useGamificationStore).
  const levels = group?.levels ?? freshLevelsForDisplay();

  // La posizione del fonema è determinata dal LIVELLO, non è una scelta indipendente: la
  // scala clinica lo dice già nell'etichetta stessa (LEVEL_LABELS: 2 "Parola iniziale", 3
  // "Frase iniziale", 4 "Parola mediana", 5 "Frase mediana"). wordsFor() ha comunque un
  // fallback se la posizione richiesta è vuota per quel fonema (es. "gli" non ha parole
  // iniziali).
  function positionForLevel(level: ClinicalLevel): "iniziale" | "mediana" {
    return level >= 4 ? "mediana" : "iniziale";
  }

  function openGame(exerciseType: string, level: ClinicalLevel) {
    navigation.navigate("Session", { phonemeGroupId: phonemeKey, level, position: positionForLevel(level), exerciseType });
  }

  function tapNode(lvl: LevelProgress) {
    if (lvl.status === "locked") return;
    // Livello 1 non ha una lista di giochi tra cui scegliere: un solo percorso, le sillabe
    // isolate — tap diretto invece di espandere un elenco con un'unica voce.
    if (lvl.level === 1) {
      openGame("sillabe", 1);
      return;
    }
    setExpandedLevel((cur) => (cur === lvl.level ? null : lvl.level));
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 18, paddingTop: insets.top + 12 }}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <View style={styles.pathBadge}>
          <Text style={styles.pathBadgeText}>{meta.label}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.pathHeaderTitle}>Giochi per il suono {meta.label}</Text>
          <Text style={styles.pathHeaderSub}>Tutti i giochi di questo percorso allenano questo suono</Text>
        </View>
      </View>

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
                {!locked && (
                  <Text style={styles.chevron}>{lvl.level !== 1 && expandedLevel === lvl.level ? "︿" : "›"}</Text>
                )}
              </Pressable>
              {idx < levels.length - 1 && <View style={styles.connector} />}

              {expandedLevel === lvl.level && (
                <View style={styles.nodeGames}>
                  {nodeGames.map((g) => (
                    <Pressable key={g.type} style={styles.gameCard} onPress={() => openGame(g.type, lvl.level)}>
                      <View style={[styles.iconBoxSmall, { backgroundColor: g.bg }]}>
                        <Image source={g.icon} style={styles.iconImageSmall} resizeMode="contain" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.gameCardTitle}>{g.label}</Text>
                        <Text style={styles.gameCardMeta}>{g.meta} · suono {meta.label}</Text>
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
  header: {
    flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 18,
    backgroundColor: C.mist, borderRadius: 16, padding: 12,
  },
  backBtn: { paddingRight: 2 },
  back: { fontSize: 26, color: C.jadeDeep },
  pathBadge: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: C.jade,
    alignItems: "center", justifyContent: "center",
  },
  pathBadgeText: { color: "#fff", fontSize: 17, fontWeight: "800" },
  pathHeaderTitle: { fontSize: 14.5, fontWeight: "800", color: C.jadeDeep },
  pathHeaderSub: { fontSize: 11.5, color: C.inkSoft, marginTop: 2 },
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
  iconImageSmall: { width: 22, height: 22 },
  gameCardTitle: { fontSize: 13, fontWeight: "700", color: C.ink },
  gameCardMeta: { fontSize: 10.5, color: C.inkSoft, marginTop: 1 },
});
