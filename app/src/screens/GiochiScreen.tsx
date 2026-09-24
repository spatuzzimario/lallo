import React, { useState, useCallback, useEffect, useRef } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import * as Speech from "expo-speech";
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
//
// Livello 1 non è più qui (settembre 2026): niente più 2 giochi a scelta, ora è lo schermo
// dedicato alle sillabe isolate (vedi SillabeIsolate in SessionScreen) — un solo percorso
// obbligato, non una lista di esercizi tra cui scegliere.
//
// Ordine dell'array = ordine di difficoltà crescente mostrato nella mappa (dal più semplice
// al più difficile): Ripeti (ascolta e ripeti, nessuna scelta da sbagliare) → Ascolta e
// scegli → Memory → Caccia al suono (il più difficile: serve aver già capito bene il
// suono). I giochi di produzione più avanzati (Registratore, Coppie minime, Gioco dell'oca,
// Sequenze) restano dopo, nel loro ordine originale.
const GAMES = [
  { type: "ripeti", label: "Ripeti", meta: "Produzione · tutte le parole", bg: "#E9F5F1", emoji: "🔁", levels: [2, 3] },
  { type: "ascolta", label: "Ascolta e scegli", meta: "Discriminazione", bg: "#FFF3D6", emoji: "👂", levels: [2, 3] },
  { type: "memory", label: "Memory", meta: "Discriminazione", bg: "#FFF3D6", emoji: "🧩", levels: [2, 3] },
  { type: "caccia", label: "Caccia al suono", meta: "Discriminazione", bg: "#FDECE7", emoji: "🔎", levels: [2, 3] },
  { type: "registratore", label: "Registratore", meta: "Produzione", bg: "#E9F5F1", emoji: "🎤", levels: [3, 4, 5] },
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
  const insets = useSafeAreaInsets();
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

  // Il chip del suono selezionato deve essere sempre visibile senza dover scorrere a mano
  // (segnalato: la scelta del suono era poco visibile) — teniamo la posizione x di ogni
  // chip via onLayout e scorriamo lì ogni volta che il suono selezionato cambia.
  const soundRowRef = useRef<ScrollView>(null);
  const chipX = useRef<Partial<Record<PhonemeKey, number>>>({});
  useEffect(() => {
    const x = chipX.current[selectedPhoneme];
    if (x !== undefined) {
      soundRowRef.current?.scrollTo({ x: Math.max(0, x - 16), animated: true });
    }
  }, [selectedPhoneme]);

  // Istruzione vocale ogni volta che il bambino apre questa tab (non solo la prima volta):
  // non sa leggere, quindi il "cosa fare qui" deve passare dall'audio — useFocusEffect
  // invece di un semplice useEffect perché le tab restano montate, un useEffect normale
  // parlerebbe solo al primissimo avvio dell'app.
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
  const group = profile.phonemeGroups.find((g) => g.id === selectedPhoneme);
  // Se il fonema non è ancora stato toccato (nessun gruppo salvato), la mappa mostra comunque
  // il livello 1 come punto di partenza — il gruppo vero viene creato al primo Fatto (vedi
  // recordSession in useGamificationStore).
  const levels = group?.levels ?? freshLevelsForDisplay();

  // La posizione del fonema è determinata dal LIVELLO, non è una scelta indipendente: la
  // scala clinica lo dice già nell'etichetta stessa (LEVEL_LABELS: 2 "Parola iniziale", 3
  // "Frase iniziale", 4 "Parola mediana", 5 "Frase mediana"). Prima qui veniva calcolata una
  // sola volta per fonema, sempre "iniziale" se disponibile, identica per tutti i livelli —
  // per questo i giochi di Livello 4/5 non mostravano mai le parole con il fonema in mezzo
  // come dovrebbero (bug segnalato: la posizione nel database non si rifletteva negli
  // esercizi). wordsFor() ha comunque un fallback se la posizione richiesta è vuota per quel
  // fonema (es. "gli" non ha parole iniziali).
  function positionForLevel(level: ClinicalLevel): "iniziale" | "mediana" {
    return level >= 4 ? "mediana" : "iniziale";
  }

  function openGame(exerciseType: string, level: ClinicalLevel) {
    navigation.navigate("Session", { phonemeGroupId: selectedPhoneme, level, position: positionForLevel(level), exerciseType });
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

      <Text style={styles.sectionLabel}>SUONO SU CUI STAI GIOCANDO</Text>
      <ScrollView
        ref={soundRowRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {PHONEME_ORDER.map((key) => {
          const locked = isPremium(key) && !subscriptionActive;
          const on = key === selectedPhoneme;
          return (
            <Pressable
              key={key}
              onPress={() => selectPhoneme(key)}
              onLayout={(e) => { chipX.current[key] = e.nativeEvent.layout.x; }}
              style={[styles.chip, on && styles.chipOn, locked && styles.chipLocked]}
            >
              <Text style={[styles.chipText, on && styles.chipTextOn]}>{WORD_BANK[key].label}</Text>
              {locked && <Text style={[styles.chipLock, on && styles.chipTextOn]}>🔒</Text>}
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.pathHeader}>
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
                        <Text style={styles.iconEmojiSmall}>{g.emoji}</Text>
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
  chipRow: { gap: 8, paddingRight: 8, paddingVertical: 2 },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1.5, borderColor: C.line,
    borderRadius: 999, paddingVertical: 9, paddingHorizontal: 16, backgroundColor: "#fff",
  },
  // Prima il chip selezionato aveva solo un bordo verde e uno sfondo appena diverso dal
  // bianco — troppo poco per essere notato al volo mentre si sceglie il suono. Ora è pieno
  // (stesso trattamento del badge "suono" qui sotto), con un'ombra leggera per farlo
  // "saltare fuori" dalla riga.
  chipOn: {
    borderColor: C.jade, backgroundColor: C.jade,
    shadowColor: C.jade, shadowOpacity: 0.3, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  chipLocked: { opacity: 0.6 },
  chipText: { fontSize: 13.5, fontWeight: "700", color: C.ink },
  chipTextOn: { color: "#fff" },
  chipLock: { fontSize: 11 },
  chevron: { fontSize: 18, color: C.line },
  pathHeader: {
    flexDirection: "row", alignItems: "center", gap: 12, marginTop: 20, marginBottom: 12,
    backgroundColor: C.mist, borderRadius: 16, padding: 12,
  },
  pathBadge: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: C.jade,
    alignItems: "center", justifyContent: "center",
  },
  pathBadgeText: { color: "#fff", fontSize: 17, fontWeight: "800" },
  pathHeaderTitle: { fontSize: 14.5, fontWeight: "800", color: C.jadeDeep },
  pathHeaderSub: { fontSize: 11.5, color: C.inkSoft, marginTop: 2 },
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
