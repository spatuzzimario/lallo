import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useGamificationStore } from "../store/useGamificationStore";

const C = { paper: "#FBF6EE", ink: "#1F2E2B", inkSoft: "#4A5A56", jade: "#137A6E", mist: "#E4EFEA", sun: "#FFC53D", line: "#D9CEBC" };

export default function ProgressiScreen() {
  const profile = useGamificationStore((s) => s.profile);
  if (!profile) return null;

  const totalStickers = profile.phonemeGroups.reduce(
    (sum, g) => sum + g.levels.filter((l) => l.status === "mastered").length,
    0
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 18, paddingTop: 24 }}>
      <Text style={styles.sectionLabel}>I PROGRESSI DI {profile.displayName?.toUpperCase()}</Text>

      {profile.phonemeGroups.map((group) =>
        group.levels
          .filter((lvl) => lvl.status !== "locked")
          .map((lvl) => {
            const pct = lvl.starsPossible ? Math.round((lvl.starsEarned / lvl.starsPossible) * 100) : 0;
            return (
              <View key={`${group.id}-${lvl.level}`} style={styles.barRow}>
                <View style={styles.barTop}>
                  <Text style={styles.barLabel}>{group.name} · livello {lvl.level}</Text>
                  <Text style={styles.barPct}>{pct}%</Text>
                </View>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${pct}%` }]} />
                </View>
              </View>
            );
          })
      )}

      <View style={styles.rewardCard}>
        <View>
          <Text style={styles.rewardBig}>{totalStickers}</Text>
          <Text style={styles.rewardLabel}>stickers conquistati</Text>
        </View>
        <View style={styles.stickerRow}>
          <Text style={styles.sticker}>🦜</Text>
          <Text style={styles.sticker}>⭐</Text>
          <Text style={styles.sticker}>🏆</Text>
          <Text style={styles.sticker}>🎈</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.paper },
  sectionLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5, color: C.inkSoft, marginBottom: 12 },
  barRow: { marginBottom: 14 },
  barTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  barLabel: { fontSize: 12.5, fontWeight: "600", color: C.ink },
  barPct: { fontSize: 12.5, fontWeight: "600", color: C.ink },
  barTrack: { height: 11, backgroundColor: C.mist, borderRadius: 999, overflow: "hidden" },
  barFill: { height: "100%", backgroundColor: C.jade, borderRadius: 999 },
  rewardCard: {
    flexDirection: "row", alignItems: "center", backgroundColor: C.sun, borderRadius: 18, padding: 14, marginTop: 18,
  },
  rewardBig: { fontWeight: "800", fontSize: 26, color: C.ink },
  rewardLabel: { fontSize: 11, color: C.ink },
  stickerRow: { flexDirection: "row", gap: 5, marginLeft: "auto" },
  sticker: { fontSize: 19 },
});
