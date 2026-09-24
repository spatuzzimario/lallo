import React, { useState } from "react";
import { Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AdultMathGate } from "../components/AdultMathGate";
import { useGamificationStore } from "../store/useGamificationStore";

const C = { jade: "#137A6E", coral: "#FF6A4D", ink: "#1F2E2B", inkSoft: "#4A5A56", paper: "#FBF6EE" };

// Punto di accesso CONTESTUALE al consenso di registrazione: invece di mandare il genitore a
// cercare l'opzione in Progressi → Privacy mentre è nel mezzo di un esercizio (Registratore,
// Parla con Lallo), questa schermata propone subito lo stesso gate adulto + la stessa
// spiegazione del consenso, poi torna dritta all'esercizio. Cambia solo DOVE si raggiunge il
// consenso, non la verifica in sé: resta dietro l'adult gate ed è comunque un consenso
// esplicito e informato (CLAUDE.md §2.1, GDPR-K), non un tap cieco stile permesso di sistema.
export default function MicConsentScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [unlocked, setUnlocked] = useState(false);
  const profile = useGamificationStore((s) => s.profile);
  const setAudioRecordingConsent = useGamificationStore((s) => s.setAudioRecordingConsent);

  if (!profile) return null;

  if (!unlocked) {
    return (
      <AdultMathGate
        subtitle="Per attivare il microfono serve il consenso di un genitore. Risolvi il calcolo per continuare."
        onPass={() => setUnlocked(true)}
      />
    );
  }

  function confirm() {
    setAudioRecordingConsent(true);
    navigation.goBack();
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 20, paddingBottom: 40 }}
    >
      <Text style={styles.title}>Attiva il microfono</Text>
      <Text style={styles.text}>
        Alcuni esercizi (come il Registratore e "Parla con Lallo") usano la registrazione
        della voce di {profile.displayName} per confrontarla con la pronuncia corretta — ed
        eventualmente, in futuri aggiornamenti, anche un breve video. I file restano collegati
        al profilo di {profile.displayName} e vengono conservati solo per il tempo necessario a
        fornire il servizio, come descritto nella Privacy Policy. Puoi disattivarlo in
        qualsiasi momento da Progressi → Privacy e registrazioni.
      </Text>
      <Pressable style={styles.confirmBtn} onPress={confirm}>
        <Text style={styles.confirmBtnText}>Acconsento e attivo il microfono</Text>
      </Pressable>
      <Pressable style={styles.cancelBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelBtnText}>Non ora</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.paper },
  title: { fontSize: 22, fontWeight: "800", color: C.ink, marginBottom: 14 },
  text: { fontSize: 14, color: C.inkSoft, lineHeight: 21, marginBottom: 28 },
  confirmBtn: { backgroundColor: C.jade, borderRadius: 999, paddingVertical: 14, alignItems: "center", marginBottom: 12 },
  confirmBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  cancelBtn: { alignItems: "center", paddingVertical: 10 },
  cancelBtnText: { color: C.inkSoft, fontWeight: "600" },
});
