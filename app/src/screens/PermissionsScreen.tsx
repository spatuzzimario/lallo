import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, Switch, Alert, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { requestRecordingPermissionsAsync } from "expo-audio";
import { AdultMathGate } from "../components/AdultMathGate";
import { useGamificationStore } from "../store/useGamificationStore";

const C = {
  bg: "#FBF6EE", jade: "#137A6E", jadeDeep: "#0E5C53", coral: "#FF6A4D",
  ink: "#1F2E2B", inkSoft: "#4A5A56", line: "#D9CEBC",
};

// Ultimo passo dell'onboarding, dopo il Paywall (vedi PaywallScreen → afterDecision): un
// unico blocco che chiede i 3 consensi/permessi opzionali dell'app (microfono, fotocamera,
// notifiche) invece di lasciarli sparsi e scoperti solo al primo uso di ciascuna feature.
// Resta comunque un consenso esplicito e informato dietro l'adult gate (CLAUDE.md §2, GDPR-K),
// non un tap cieco: ogni switch spiega a cosa serve prima di chiamare il popup di sistema
// vero. Nessuno switch è obbligatorio per continuare — "Continua" è sempre disponibile, e chi
// cambia idea può attivare/disattivare tutto in seguito da Progressi → Privacy.
export default function PermissionsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [unlocked, setUnlocked] = useState(false);
  const profile = useGamificationStore((s) => s.profile);
  const setAudioRecordingConsent = useGamificationStore((s) => s.setAudioRecordingConsent);
  const setCameraConsent = useGamificationStore((s) => s.setCameraConsent);
  const setRemindersEnabled = useGamificationStore((s) => s.setRemindersEnabled);

  if (!profile) return null;

  if (!unlocked) {
    return (
      <AdultMathGate
        subtitle="Per attivare microfono, fotocamera e notifiche serve il consenso di un genitore. Risolvi il calcolo per continuare."
        onPass={() => setUnlocked(true)}
      />
    );
  }

  async function handleToggleMic(value: boolean) {
    if (!value) {
      setAudioRecordingConsent(false);
      return;
    }
    const perm = await requestRecordingPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        "Permesso non concesso",
        "Per registrare la voce devi consentire il microfono a Lallo dalle impostazioni del telefono."
      );
      return;
    }
    setAudioRecordingConsent(true);
  }

  async function handleToggleCamera(value: boolean) {
    if (!value) {
      setCameraConsent(false);
      return;
    }
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        "Permesso non concesso",
        "Per usare l'Album devi consentire la fotocamera a Lallo dalle impostazioni del telefono."
      );
      return;
    }
    setCameraConsent(true);
  }

  async function handleToggleReminders(value: boolean) {
    const ok = await setRemindersEnabled(value);
    if (value && !ok) {
      Alert.alert(
        "Permesso non concesso",
        "Per ricevere il promemoria devi consentire le notifiche a Lallo dalle impostazioni del telefono."
      );
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 20, paddingBottom: 40 }}
    >
      <Text style={styles.title}>Ultimo passo</Text>
      <Text style={styles.subtitle}>
        Alcune funzioni di Lallo sono opzionali e restano spente finché non le attivi tu. Puoi
        cambiare idea in ogni momento da Progressi → Privacy.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Microfono</Text>
        <Text style={styles.cardText}>
          Serve per esercizi come il Registratore e "Parla con Lallo", che registrano la voce
          di {profile.displayName} per confrontarla con la pronuncia corretta. La registrazione
          e l'elaborazione avvengono sul dispositivo.
        </Text>
        <View style={styles.consentRow}>
          <Text style={styles.consentLabel}>Attiva il microfono</Text>
          <Switch
            value={profile.audioRecordingConsent}
            onValueChange={handleToggleMic}
            trackColor={{ false: C.line, true: C.jade }}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Fotocamera</Text>
        <Text style={styles.cardText}>
          Serve per l'Album, dove {profile.displayName} fotografa oggetti reali che
          corrispondono alle parole che sta imparando. Le foto restano solo su questo
          dispositivo, non vengono mai caricate su internet.
        </Text>
        <View style={styles.consentRow}>
          <Text style={styles.consentLabel}>Attiva la fotocamera</Text>
          <Switch
            value={profile.cameraConsent}
            onValueChange={handleToggleCamera}
            trackColor={{ false: C.line, true: C.jade }}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Notifiche</Text>
        <Text style={styles.cardText}>
          Se {profile.displayName} non ha ancora giocato in giornata, Lallo manda un promemoria
          nel tardo pomeriggio su questo dispositivo — mai più di uno al giorno.
        </Text>
        <View style={styles.consentRow}>
          <Text style={styles.consentLabel}>Attiva il promemoria</Text>
          <Switch
            value={profile.remindersEnabled}
            onValueChange={handleToggleReminders}
            trackColor={{ false: C.line, true: C.jade }}
          />
        </View>
      </View>

      <Pressable style={styles.confirmBtn} onPress={() => navigation.navigate("MainTabs")}>
        <Text style={styles.confirmBtnText}>Continua</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  title: { fontSize: 22, fontWeight: "800", color: C.ink, marginBottom: 8 },
  subtitle: { fontSize: 14, color: C.inkSoft, lineHeight: 20, marginBottom: 24 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 16 },
  cardTitle: { fontWeight: "800", fontSize: 15, color: C.ink, marginBottom: 8 },
  cardText: { fontSize: 13, color: C.inkSoft, lineHeight: 19 },
  consentRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    gap: 12, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#EEE",
  },
  consentLabel: { flex: 1, fontSize: 13, fontWeight: "700", color: C.ink },
  confirmBtn: { backgroundColor: C.jade, borderRadius: 999, paddingVertical: 14, alignItems: "center", marginTop: 8 },
  confirmBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
