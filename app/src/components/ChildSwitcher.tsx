import React, { useState } from "react";
import { View, Text, Image, Pressable, Modal, StyleSheet, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGamificationStore } from "../store/useGamificationStore";
import { getAvatarImage } from "../constants/avatars";
import { getChildren } from "../api/children";
import { isSupabaseConfigured } from "../api/supabase";

const C = {
  jade: "#137A6E", jadeDeep: "#0E5C53", coral: "#FF6A4D", ink: "#1F2E2B",
  inkSoft: "#4A5A56", line: "#D9CEBC", paper: "#FBF6EE",
};

// Chip sempre visibile in alto (Lallo/Giochi, per scelta esplicita del genitore — brief
// §7 "profili multipli figlio su un solo abbonamento") — tocco apre l'elenco dei bambini
// collegati e "Aggiungi un bambino". Senza backend collegato o con un solo figlio, il chip
// resta comunque utile come punto da cui aggiungerne un secondo in futuro, ma non mostra un
// elenco vuoto: qui il tap apre direttamente "aggiungi" se non c'è nessun altro con cui
// cambiare.
export function ChildSwitcher({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const profile = useGamificationStore((s) => s.profile);
  const roster = useGamificationStore((s) => s.children);
  const hydrateFromSupabase = useGamificationStore((s) => s.hydrateFromSupabase);
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);

  if (!profile) return null;

  async function switchTo(childId: string) {
    if (childId === profile?.supabaseChildId || switching) return;
    setSwitching(childId);
    // Il roster in store è leggero (solo id/nome/avatar, per la lista) — per ricostruire il
    // profilo completo (sessionLog/livelli/consensi) serve rileggere la riga vera da
    // Supabase, stessa chiamata del ripristino all'avvio in App.tsx.
    const { data: children } = await getChildren();
    const row = children?.find((c) => c.id === childId);
    setSwitching(null);
    setOpen(false);
    if (!row) return;
    await hydrateFromSupabase({
      id: row.id,
      name: row.name,
      audioRecordingConsent: row.audio_recording_consent,
      avatarId: row.avatar_id,
      gender: row.gender,
    });
  }

  function addChild() {
    setOpen(false);
    navigation.navigate("ChildName", { addingChild: true });
  }

  return (
    <>
      <Pressable style={switcherStyles.chip} onPress={() => setOpen(true)}>
        <Image source={getAvatarImage(profile.avatarId)} style={switcherStyles.chipImage} resizeMode="contain" />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={switcherStyles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={[switcherStyles.sheet, { paddingBottom: insets.bottom + 16 }]} onPress={() => {}}>
            <Text style={switcherStyles.sheetTitle}>I tuoi bambini</Text>
            {roster.length === 0 ? (
              <Text style={switcherStyles.emptyText}>
                {isSupabaseConfigured
                  ? "Nessun altro bambino collegato ancora."
                  : "I profili multipli richiedono una build reale con il backend collegato."}
              </Text>
            ) : (
              roster.map((c) => {
                const active = c.id === profile.supabaseChildId;
                return (
                  <Pressable key={c.id} style={switcherStyles.row} onPress={() => switchTo(c.id)}>
                    <Image source={getAvatarImage(c.avatarId)} style={switcherStyles.rowImage} resizeMode="contain" />
                    <Text style={[switcherStyles.rowName, active && switcherStyles.rowNameActive]}>{c.displayName}</Text>
                    {switching === c.id && <ActivityIndicator color={C.jade} />}
                    {active && switching !== c.id && <Text style={switcherStyles.activeBadge}>✓</Text>}
                  </Pressable>
                );
              })
            )}
            {isSupabaseConfigured && (
              <Pressable style={switcherStyles.addRow} onPress={addChild}>
                <Text style={switcherStyles.addRowText}>+ Aggiungi un bambino</Text>
              </Pressable>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const switcherStyles = StyleSheet.create({
  chip: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: "#fff", borderWidth: 2, borderColor: C.jade,
    alignItems: "center", justifyContent: "center", overflow: "hidden",
  },
  chipImage: { width: 26, height: 26 },
  backdrop: { flex: 1, backgroundColor: "rgba(31,46,43,0.4)", justifyContent: "flex-end" },
  sheet: { backgroundColor: C.paper, borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20 },
  sheetTitle: { fontSize: 17, fontWeight: "800", color: C.ink, marginBottom: 12 },
  emptyText: { fontSize: 13, color: C.inkSoft, marginBottom: 8 },
  row: {
    flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: C.line,
  },
  rowImage: { width: 36, height: 36 },
  rowName: { flex: 1, fontSize: 15.5, fontWeight: "600", color: C.ink },
  rowNameActive: { color: C.jadeDeep, fontWeight: "800" },
  activeBadge: { color: C.jadeDeep, fontWeight: "800", fontSize: 16 },
  addRow: { alignItems: "center", marginTop: 16 },
  addRowText: { color: C.coral, fontWeight: "700", fontSize: 15 },
});
