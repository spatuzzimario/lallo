import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { FREE_PHONEMES, PHONEME_ORDER, WORD_BANK } from "../constants/wordBank";
import { useGamificationStore } from "../store/useGamificationStore";

const C = { bg: "#FBF6EE", primary: "#FF6A4D", primaryDeep: "#E84B30", jade: "#137A6E", text: "#1F2E2B", subtext: "#4A5A56", line: "#D9CEBC", sun: "#FFC53D" };

// Prezzi allineati al brief (§7, stile Speech Blubs — prezzi di test per il mercato
// italiano, ancora da validare): annuale spinto con framing per-mese, 7 giorni di prova
// gratuita, mensile come alternativa flessibile. RevenueCat resta lo strumento scelto per
// l'IAP reale — qui c'è solo il flusso UI, nessuna integrazione pagamenti vera.
const PLANS = [
  { id: "annual", label: "Annuale", price: "3,99 €", sub: "/mese · 47,88 €/anno · 7 giorni gratis", badge: "Risparmia ~50%" },
  { id: "monthly", label: "Mensile", price: "7,99 €", sub: "/mese · disdici quando vuoi", badge: null },
];

export default function PaywallScreen({ navigation }: any) {
  const [selectedPlan, setSelectedPlan] = useState("annual");
  const setProfile = useGamificationStore((s) => s.setProfile);
  const profile = useGamificationStore((s) => s.profile);

  function subscribe() {
    // Segnaposto: in produzione qui parte il flusso RevenueCat reale (trial 7 giorni).
    if (profile) setProfile({ ...profile, subscriptionActive: true });
    navigation.navigate("MainTabs");
  }
  function continueFree() {
    navigation.navigate("MainTabs");
  }

  const premiumCount = PHONEME_ORDER.length - FREE_PHONEMES.length;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 22, paddingTop: 50 }}>
      <Text style={styles.title}>Sblocca tutti i {PHONEME_ORDER.length} fonemi</Text>
      <Text style={styles.subtitle}>
        Con il piano gratuito hai accesso a {FREE_PHONEMES.length} suoni comuni ({FREE_PHONEMES.map((k) => WORD_BANK[k].label).join(", ")}).
        L'abbonamento sblocca gli altri {premiumCount}, inclusi gruppi consonantici e digrammi. 7 giorni di prova gratuita.
      </Text>

      <View style={styles.plansWrap}>
        {PLANS.map((p) => {
          const on = selectedPlan === p.id;
          return (
            <Pressable key={p.id} onPress={() => setSelectedPlan(p.id)} style={[styles.planRow, on && styles.planRowOn]}>
              <View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={[styles.planLabel, on && styles.planLabelOn]}>{p.label}</Text>
                  {p.badge && (
                    <View style={styles.planBadge}>
                      <Text style={styles.planBadgeText}>{p.badge}</Text>
                    </View>
                  )}
                </View>
                {p.sub && <Text style={[styles.planSub, on && styles.planSubOn]}>{p.sub}</Text>}
              </View>
              <Text style={[styles.planPrice, on && styles.planLabelOn]}>{p.price}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable style={styles.subscribeBtn} onPress={subscribe}>
        <Text style={styles.subscribeBtnText}>Inizia la prova gratuita</Text>
      </Pressable>
      <Text style={styles.legalNote}>Annullabile in qualsiasi momento. Nessun addebito prima della fine dei 7 giorni di prova.</Text>

      <Pressable onPress={continueFree} style={{ marginTop: 18 }}>
        <Text style={styles.freeLink}>Continua con il piano gratuito ({FREE_PHONEMES.length} suoni)</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  title: { fontSize: 24, fontWeight: "800", color: C.text, textAlign: "center" },
  subtitle: { fontSize: 13.5, color: C.subtext, textAlign: "center", marginTop: 12, lineHeight: 20 },
  plansWrap: { marginTop: 28 },
  planRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    borderWidth: 2, borderColor: C.line, borderRadius: 14, padding: 16, marginBottom: 12, backgroundColor: "#fff",
  },
  planRowOn: { borderColor: C.jade, backgroundColor: "#E9F5F1" },
  planLabel: { fontSize: 16, fontWeight: "700", color: C.text },
  planLabelOn: { color: C.jade },
  planBadge: { backgroundColor: C.sun, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 8 },
  planBadgeText: { fontSize: 10.5, fontWeight: "700", color: C.text },
  planSub: { fontSize: 11.5, color: C.subtext, marginTop: 2 },
  planSubOn: { color: C.jade },
  planPrice: { fontSize: 18, fontWeight: "800", color: C.text },
  subscribeBtn: { backgroundColor: C.primary, borderRadius: 999, paddingVertical: 16, alignItems: "center", marginTop: 12 },
  subscribeBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  legalNote: { fontSize: 11, color: C.subtext, textAlign: "center", marginTop: 10 },
  freeLink: { textAlign: "center", color: C.jade, textDecorationLine: "underline", fontSize: 13.5 },
});
