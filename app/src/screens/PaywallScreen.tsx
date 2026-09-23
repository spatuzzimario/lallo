import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PurchasesOffering, PurchasesPackage } from "react-native-purchases";
import { FREE_PHONEMES, PHONEME_ORDER, WORD_BANK } from "../constants/wordBank";
import { useGamificationStore } from "../store/useGamificationStore";
import { getCurrentOffering, purchase, restore, hasPremiumEntitlement, isPurchasesConfigured } from "../api/purchases";

const C = { bg: "#FBF6EE", primary: "#FF6A4D", primaryDeep: "#E84B30", jade: "#137A6E", text: "#1F2E2B", subtext: "#4A5A56", line: "#D9CEBC", sun: "#FFC53D" };

// Prezzi di fallback (§7, stile Speech Blubs — prezzi di test per il mercato italiano,
// ancora da validare): mostrati SOLO quando RevenueCat non è disponibile (web, Expo Go,
// offerte non ancora configurate) — vedi PAYWALL_SETUP.md. Quando è disponibile, i prezzi
// veri arrivano dall'offerta RevenueCat/store (localizzati, sempre aggiornati).
const FALLBACK_PLANS = [
  { id: "annual", label: "Annuale", price: "3,99 €", sub: "/mese · 47,88 €/anno · 7 giorni gratis", badge: "Risparmia ~50%" },
  { id: "monthly", label: "Mensile", price: "7,99 €", sub: "/mese · disdici quando vuoi", badge: null as string | null },
];

// L'offerta RevenueCat va costruita con i due package standard "Annuale"/"Mensile" (vedi
// PAYWALL_SETUP.md) — qui li mappiamo sulla stessa forma di FALLBACK_PLANS per riusare la
// UI esistente senza duplicarla.
function planFromPackage(pkg: PurchasesPackage) {
  const isAnnual = pkg.packageType === "ANNUAL";
  const p = pkg.product;
  const perMonth = isAnnual && p.pricePerMonthString ? p.pricePerMonthString : p.priceString;
  return {
    id: pkg.identifier,
    label: isAnnual ? "Annuale" : "Mensile",
    price: perMonth,
    sub: isAnnual ? `/mese · ${p.priceString}/anno · 7 giorni gratis` : "/mese · disdici quando vuoi",
    badge: isAnnual ? "Risparmia" : null,
    pkg,
  };
}

export default function PaywallScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [loadingOffering, setLoadingOffering] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const setSubscriptionActive = useGamificationStore((s) => s.setSubscriptionActive);

  useEffect(() => {
    getCurrentOffering()
      .then(setOffering)
      .finally(() => setLoadingOffering(false));
  }, []);

  const plans = offering?.availablePackages.length
    ? offering.availablePackages.map(planFromPackage)
    : FALLBACK_PLANS.map((p) => ({ ...p, pkg: null as PurchasesPackage | null }));

  const [selectedPlanId, setSelectedPlanId] = useState<string>("annual");
  const selectedPlan = plans.find((p) => p.id === selectedPlanId) ?? plans[0];

  // Il Paywall si apre da due punti diversi: subito dopo l'onboarding (nessun posto dove
  // tornare indietro, si prosegue verso MainTabs) oppure da Genitori → Abbonamento (si torna
  // alla dashboard). fromParentDashboard distingue i due casi.
  const fromParentDashboard = !!route?.params?.fromParentDashboard;

  function afterDecision() {
    if (fromParentDashboard) navigation.goBack();
    else navigation.navigate("MainTabs");
  }

  async function subscribe() {
    if (!selectedPlan?.pkg) {
      // Nessuna offerta RevenueCat disponibile in questo ambiente (web, Expo Go, o offerte
      // non ancora configurate) — non si può acquistare davvero, lo segnaliamo invece di
      // fingere un acquisto riuscito.
      setErrorMsg(
        isPurchasesConfigured()
          ? "Offerta non disponibile al momento. Riprova più tardi."
          : "Gli acquisti non sono disponibili in questa modalità di anteprima — servono una build reale e le offerte configurate (vedi PAYWALL_SETUP.md)."
      );
      return;
    }
    setPurchasing(true);
    setErrorMsg(null);
    const result = await purchase(selectedPlan.pkg);
    setPurchasing(false);
    if (result.userCancelled) return;
    if (!result.success) {
      setErrorMsg("Non siamo riusciti a completare l'acquisto. Riprova.");
      return;
    }
    setSubscriptionActive(true);
    afterDecision();
  }

  async function restorePurchase() {
    setPurchasing(true);
    setErrorMsg(null);
    const info = await restore();
    setPurchasing(false);
    if (info && hasPremiumEntitlement(info)) {
      setSubscriptionActive(true);
      afterDecision();
      return;
    }
    setErrorMsg("Nessun acquisto da ripristinare per questo account.");
  }

  function continueFree() {
    afterDecision();
  }

  const premiumCount = PHONEME_ORDER.length - FREE_PHONEMES.length;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 22, paddingTop: insets.top + 16 }}>
      <Text style={styles.title}>Sblocca tutti i {PHONEME_ORDER.length} fonemi</Text>
      <Text style={styles.subtitle}>
        Con il piano gratuito hai accesso a {FREE_PHONEMES.length} suoni comuni ({FREE_PHONEMES.map((k) => WORD_BANK[k].label).join(", ")}).
        L'abbonamento sblocca gli altri {premiumCount}, inclusi gruppi consonantici e digrammi. 7 giorni di prova gratuita.
      </Text>

      {loadingOffering ? (
        <ActivityIndicator color={C.primary} style={{ marginTop: 28 }} />
      ) : (
        <View style={styles.plansWrap}>
          {plans.map((p) => {
            const on = selectedPlan?.id === p.id;
            return (
              <Pressable key={p.id} onPress={() => setSelectedPlanId(p.id)} style={[styles.planRow, on && styles.planRowOn]}>
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
      )}

      {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

      <Pressable style={[styles.subscribeBtn, purchasing && { opacity: 0.6 }]} onPress={subscribe} disabled={purchasing}>
        {purchasing ? <ActivityIndicator color="#fff" /> : <Text style={styles.subscribeBtnText}>Inizia la prova gratuita</Text>}
      </Pressable>
      <Text style={styles.legalNote}>Annullabile in qualsiasi momento. Nessun addebito prima della fine dei 7 giorni di prova.</Text>

      <Pressable onPress={continueFree} style={{ marginTop: 18 }}>
        <Text style={styles.freeLink}>Continua con il piano gratuito ({FREE_PHONEMES.length} suoni)</Text>
      </Pressable>
      <Pressable onPress={restorePurchase} style={{ marginTop: 10 }} disabled={purchasing}>
        <Text style={styles.restoreLink}>Ripristina acquisti</Text>
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
  restoreLink: { textAlign: "center", color: C.subtext, textDecorationLine: "underline", fontSize: 12 },
  errorText: { color: C.primaryDeep, fontSize: 12.5, textAlign: "center", marginTop: 14 },
});
