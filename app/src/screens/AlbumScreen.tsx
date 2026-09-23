import React, { useMemo, useState } from "react";
import { View, Text, Image, Pressable, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useGamificationStore } from "../store/useGamificationStore";
import { WORD_ILLUSTRATIONS } from "../constants/illustrations";
import { currentTitle, nextTitle } from "../constants/album";

const C = {
  bg: "#FBF6EE", jade: "#137A6E", jadeDeep: "#0E5C53", coral: "#FF6A4D",
  ink: "#1F2E2B", inkSoft: "#4A5A56", line: "#D9CEBC", mist: "#E4EFEA", sun: "#FFC53D",
};

// Le parole "cacciabili" sono quelle che hanno già un'illustrazione reale generata — così
// il bambino ha sempre un riferimento visivo chiaro di cosa cercare (WORD_ILLUSTRATIONS
// cresce nel tempo insieme alla generazione delle immagini, questo elenco con lei).
const HUNTABLE_WORDS = Object.keys(WORD_ILLUSTRATIONS).sort();

// Album fotografico delle parole (feature virale/retention): il bambino sceglie una parola
// PRIMA di scattare — l'app non riconosce le foto (nessun AI vision validata per bambini,
// stesso principio del niente-ASR automatico, vedi CLAUDE.md §10). Le foto restano solo sul
// dispositivo: l'URI restituito da expo-image-picker non viene mai caricato da nessuna
// parte. TODO (rifinitura futura, non bloccante): copiare il file in Paths.document con
// expo-file-system per renderlo più resistente alla pulizia cache del sistema operativo —
// per l'MVP l'URI di image-picker è già sufficientemente stabile.
export default function AlbumScreen() {
  const insets = useSafeAreaInsets();
  const profile = useGamificationStore((s) => s.profile);
  const addPhotoCatch = useGamificationStore((s) => s.addPhotoCatch);
  const hasConsent = useGamificationStore((s) => !!s.profile?.cameraConsent);

  const [activeWord, setActiveWord] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [justCaught, setJustCaught] = useState<string | null>(null);
  const [newTitleBanner, setNewTitleBanner] = useState<string | null>(null);

  const catchesByWord = useMemo(() => {
    const map = new Map<string, number>();
    (profile?.photoCatches ?? []).forEach((p) => map.set(p.word, (map.get(p.word) ?? 0) + 1));
    return map;
  }, [profile?.photoCatches]);

  const distinctCaught = catchesByWord.size;
  const title = currentTitle(distinctCaught);
  const upcoming = nextTitle(distinctCaught);

  async function hunt(word: string) {
    if (!hasConsent) return;
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      setPermissionDenied(true);
      return;
    }
    setPermissionDenied(false);
    setActiveWord(word);
    const result = await ImagePicker.launchCameraAsync({ quality: 0.5, allowsEditing: false });
    setActiveWord(null);
    if (result.canceled || !result.assets?.[0]) return;

    const wasNewWord = !catchesByWord.has(word);
    addPhotoCatch(word, result.assets[0].uri);
    setJustCaught(word);
    setTimeout(() => setJustCaught(null), 1200);

    if (wasNewWord) {
      const before = currentTitle(distinctCaught);
      const after = currentTitle(distinctCaught + 1);
      if (after && after.threshold !== before?.threshold) {
        setNewTitleBanner(`${after.emoji} Nuovo titolo: ${after.name}!`);
        setTimeout(() => setNewTitleBanner(null), 2500);
      }
    }
  }

  if (!profile) return null;

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 16 }]}>
      <Text style={styles.title}>Album</Text>
      <Text style={styles.subtitle}>
        {distinctCaught}/{HUNTABLE_WORDS.length} parole fotografate
        {title ? ` · ${title.emoji} ${title.name}` : ""}
      </Text>
      {upcoming && (
        <Text style={styles.nextTitleNote}>
          Ancora {upcoming.threshold - distinctCaught} per diventare {upcoming.name} {upcoming.emoji}
        </Text>
      )}

      {newTitleBanner && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{newTitleBanner}</Text>
        </View>
      )}

      {!hasConsent && (
        <Text style={styles.warnNote}>
          Serve il consenso di un genitore per usare la fotocamera. Vai su Genitori → Privacy e registrazioni per
          attivarlo.
        </Text>
      )}
      {permissionDenied && (
        <Text style={styles.warnNote}>La fotocamera non è autorizzata per Lallo nelle impostazioni del telefono.</Text>
      )}

      <ScrollView contentContainerStyle={styles.grid}>
        {HUNTABLE_WORDS.map((word) => {
          const count = catchesByWord.get(word) ?? 0;
          const caught = count > 0;
          return (
            <Pressable
              key={word}
              onPress={() => hunt(word)}
              disabled={!hasConsent || activeWord === word}
              accessibilityLabel={`Fotografa: ${word}`}
              style={[styles.tile, caught && styles.tileCaught, justCaught === word && styles.tileFlash]}
            >
              <Image source={WORD_ILLUSTRATIONS[word]} style={[styles.tileImage, !caught && styles.tileImageDim]} resizeMode="contain" />
              <Text style={styles.tileWord}>{word}</Text>
              {caught && (
                <View style={styles.tileBadge}>
                  <Text style={styles.tileBadgeText}>✓{count > 1 ? ` ×${count}` : ""}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg, padding: 18 },
  title: { fontSize: 20, fontWeight: "800", color: C.ink },
  subtitle: { fontSize: 13, color: C.inkSoft, marginTop: 4 },
  nextTitleNote: { fontSize: 11.5, color: C.jadeDeep, marginTop: 2, fontStyle: "italic" },
  banner: { backgroundColor: C.sun, borderRadius: 12, padding: 10, marginTop: 10, alignItems: "center" },
  bannerText: { fontWeight: "800", color: C.ink },
  warnNote: { fontSize: 11, color: "#B08900", fontStyle: "italic", marginTop: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingTop: 14, paddingBottom: 24 },
  tile: {
    width: 92, height: 108, borderRadius: 16, borderWidth: 1.5, borderColor: C.line,
    backgroundColor: "#fff", alignItems: "center", justifyContent: "center", padding: 6,
  },
  tileCaught: { borderColor: C.jade, backgroundColor: C.mist },
  tileFlash: { borderColor: C.sun, borderWidth: 2 },
  tileImage: { width: 56, height: 56 },
  tileImageDim: { opacity: 0.45 },
  tileWord: { fontSize: 10.5, color: C.inkSoft, marginTop: 4, textAlign: "center" },
  tileBadge: {
    position: "absolute", top: 4, right: 4, backgroundColor: C.jade, borderRadius: 8,
    paddingHorizontal: 5, paddingVertical: 1,
  },
  tileBadgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },
});
