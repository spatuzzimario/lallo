import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, Switch, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGamificationStore } from "../store/useGamificationStore";
import { getLinkedTherapist } from "../api/therapists";
import { isSupabaseConfigured } from "../api/supabase";
import { ClinicalLevel, LEVEL_LABELS } from "../types/gamification";

const COLORS = {
  bg: "#FFF8EE",
  primary: "#2A20E0",
  text: "#1A1A1A",
  subtext: "#666",
  jade: "#137A6E",
  coral: "#FF6A4D",
};

/* ---------------- Parent dashboard ----------------
   Deliberatamente SOLO osservativa: mostra progressi e suggerisce
   dove concentrarsi, ma non permette di riassegnare fonema/livello.
   Quella responsabilità resta al logopedista — è la scelta di
   posizionamento B2B2C, diversa dal modello puro B2C di Speech Blubs. */
export function ParentDashboardScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const profile = useGamificationStore((s) => s.profile);
  const supabaseChildId = profile?.supabaseChildId;

  // Stato del collegamento al logopedista — letto da therapist_links (vedi api/therapists.ts).
  // null = non ancora caricato/nessun collegamento; il caricamento è silenzioso, non blocca
  // il resto della dashboard.
  const [linkedTherapist, setLinkedTherapist] = useState<{ name: string; verified: boolean } | null>(null);
  useEffect(() => {
    if (!isSupabaseConfigured || !supabaseChildId) return;
    getLinkedTherapist(supabaseChildId).then(({ data }) => {
      if (data?.therapists) {
        setLinkedTherapist({ name: data.therapists.full_name, verified: data.therapists.albo_verified });
      }
    });
  }, [supabaseChildId]);

  const focusSuggestion = useMemo<{ groupName: string; level: ClinicalLevel; progress: number } | null>(() => {
    if (!profile) return null;
    let lowest: { groupName: string; level: ClinicalLevel; progress: number } | null = null;
    profile.phonemeGroups.forEach((group) => {
      group.levels.forEach((lvl) => {
        if (lvl.status !== "in_progress") return;
        const progress = lvl.starsPossible ? lvl.starsEarned / lvl.starsPossible : 0;
        if (!lowest || progress < lowest.progress) {
          lowest = { groupName: group.name, level: lvl.level, progress };
        }
      });
    });
    return lowest;
  }, [profile]);

  // "Quanto sta usando l'app" (ultimi 7 giorni, finestra mobile — diversa dallo streak sopra
  // che è allineato alla settimana di gioco): minuti totali + sessioni per giorno, dal log
  // sessionLog scritto da recordSession. Ancora poco significativo nei primissimi giorni di
  // un profilo nuovo, ma cresce naturalmente con l'uso.
  const weeklyUsage = useMemo(() => {
    if (!profile) return null;
    const today = new Date();
    const days = Array.from({ length: 7 }, (_, idx) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - idx));
      const date = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString("it-IT", { weekday: "short" }).slice(0, 3);
      const count = profile.sessionLog.filter((e) => e.date === date).length;
      return { date, label, count };
    });
    const windowStart = days[0].date;
    const entries = profile.sessionLog.filter((e) => e.date >= windowStart);
    const totalMinutes = Math.round(entries.reduce((sum, e) => sum + e.durationSeconds, 0) / 60);
    const maxCount = Math.max(1, ...days.map((d) => d.count));
    return { days, totalMinutes, totalSessions: entries.length, maxCount };
  }, [profile]);

  // Andamento per fonema, settimana corrente (ultimi 7 giorni) vs precedente (giorni 8-14) —
  // "quanto è migliorato": confidenza media delle sessioni giocate in ciascuna finestra.
  const phonemeTrend = useMemo(() => {
    if (!profile) return [];
    const dayOffset = (offset: number) => {
      const d = new Date();
      d.setDate(d.getDate() - offset);
      return d.toISOString().slice(0, 10);
    };
    const thisWeekStart = dayOffset(6);
    const lastWeekStart = dayOffset(13);
    const lastWeekEnd = dayOffset(7);

    const byPhoneme = new Map<string, { label: string; thisWeek: number[]; lastWeek: number[] }>();
    profile.sessionLog.forEach((e) => {
      if (e.date < lastWeekStart) return;
      if (!byPhoneme.has(e.phonemeGroupId)) {
        byPhoneme.set(e.phonemeGroupId, { label: e.phonemeLabel, thisWeek: [], lastWeek: [] });
      }
      const bucket = byPhoneme.get(e.phonemeGroupId)!;
      if (e.date >= thisWeekStart) bucket.thisWeek.push(e.avgConfidence);
      else if (e.date <= lastWeekEnd) bucket.lastWeek.push(e.avgConfidence);
    });
    const avg = (arr: number[]) => (arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : null);

    return Array.from(byPhoneme.entries())
      .map(([id, data]) => ({
        id,
        label: data.label,
        thisWeekPct: avg(data.thisWeek),
        lastWeekPct: avg(data.lastWeek),
      }))
      .filter((r) => r.thisWeekPct !== null)
      .sort((a, b) => (b.thisWeekPct ?? 0) - (a.thisWeekPct ?? 0));
  }, [profile]);

  if (!profile) return null;

  return (
    <ScrollView
      style={dashStyles.container}
      contentContainerStyle={{ padding: 16, paddingTop: insets.top + 16, paddingBottom: 40 }}
    >
      <View style={dashStyles.header}>
        <Text style={dashStyles.title}>Progressi di {profile.displayName}</Text>
      </View>

      <View style={dashStyles.summaryRow}>
        <View style={dashStyles.summaryCard}>
          <Text style={dashStyles.summaryNum}>{profile.streak.currentWeeks}</Text>
          <Text style={dashStyles.summaryLabel}>settimane di pratica</Text>
        </View>
        <View style={dashStyles.summaryCard}>
          <Text style={dashStyles.summaryNum}>{profile.streak.sessionsThisWeek}/3</Text>
          <Text style={dashStyles.summaryLabel}>sessioni questa settimana</Text>
        </View>
      </View>

      {weeklyUsage && (
        <View style={dashStyles.usageCard}>
          <Text style={dashStyles.sectionLabel}>Uso nell'app · ultimi 7 giorni</Text>
          <View style={dashStyles.usageStatsRow}>
            <View>
              <Text style={dashStyles.usageStatNum}>{weeklyUsage.totalMinutes}</Text>
              <Text style={dashStyles.usageStatLabel}>minuti totali</Text>
            </View>
            <View>
              <Text style={dashStyles.usageStatNum}>{weeklyUsage.totalSessions}</Text>
              <Text style={dashStyles.usageStatLabel}>sessioni</Text>
            </View>
          </View>
          <View style={dashStyles.usageChartRow}>
            {weeklyUsage.days.map((d) => (
              <View key={d.date} style={dashStyles.usageBarCol}>
                <View style={dashStyles.usageBarTrack}>
                  <View
                    style={[
                      dashStyles.usageBarFill,
                      { height: `${Math.max(6, (d.count / weeklyUsage.maxCount) * 100)}%` },
                      d.count === 0 && dashStyles.usageBarFillEmpty,
                    ]}
                  />
                </View>
                <Text style={dashStyles.usageBarLabel}>{d.label}</Text>
              </View>
            ))}
          </View>
          {weeklyUsage.totalSessions === 0 && (
            <Text style={dashStyles.usageEmptyNote}>
              Ancora nessuna sessione negli ultimi 7 giorni — qui vedrai quanto gioca {profile.displayName}.
            </Text>
          )}
        </View>
      )}

      {phonemeTrend.length > 0 && (
        <View style={dashStyles.usageCard}>
          <Text style={dashStyles.sectionLabel}>Andamento per suono · questa settimana vs scorsa</Text>
          {phonemeTrend.map((t) => (
            <View key={t.id} style={dashStyles.trendRow}>
              <Text style={dashStyles.trendLabel}>{t.label}</Text>
              <Text style={dashStyles.trendValue}>
                {t.lastWeekPct !== null ? `${Math.round(t.lastWeekPct * 100)}% → ` : ""}
                {Math.round((t.thisWeekPct ?? 0) * 100)}%
                {t.lastWeekPct === null && "  (nuovo questa settimana)"}
                {t.lastWeekPct !== null && t.thisWeekPct !== null && (
                  <Text style={t.thisWeekPct >= t.lastWeekPct ? dashStyles.trendUp : dashStyles.trendDown}>
                    {t.thisWeekPct >= t.lastWeekPct ? "  ↑" : "  ↓"}
                  </Text>
                )}
              </Text>
            </View>
          ))}
        </View>
      )}

      {focusSuggestion && (
        <View style={dashStyles.focusCard}>
          <Text style={dashStyles.focusLabel}>💡 Su cosa concentrarsi</Text>
          <Text style={dashStyles.focusText}>
            {focusSuggestion.groupName} — {LEVEL_LABELS[focusSuggestion.level]} è al{" "}
            {Math.round(focusSuggestion.progress * 100)}%. Qualche minuto in più qui aiuta di più che altrove.
          </Text>
        </View>
      )}

      <Text style={dashStyles.sectionLabel}>Dettaglio per fonema</Text>
      {profile.phonemeGroups.map((group) => (
        <View key={group.id} style={dashStyles.groupCard}>
          <Text style={dashStyles.groupName}>{group.name}</Text>
          {group.levels.map((lvl) => {
            const pct = lvl.starsPossible ? Math.round((lvl.starsEarned / lvl.starsPossible) * 100) : 0;
            return (
              <View key={lvl.level} style={dashStyles.levelRow}>
                <Text style={dashStyles.levelLabel}>{LEVEL_LABELS[lvl.level]}</Text>
                <View style={dashStyles.barTrack}>
                  <View style={[dashStyles.barFill, { width: `${pct}%` }]} />
                </View>
                <Text style={dashStyles.levelPct}>{pct}%</Text>
              </View>
            );
          })}
        </View>
      ))}

      {linkedTherapist ? (
        <View style={dashStyles.therapistNote}>
          <Text style={dashStyles.therapistNoteText}>
            {linkedTherapist.name} segue {profile.displayName}. Per cambiare fonema, posizione o livello, parlane con
            lui/lei alla prossima seduta — questa vista serve a tenervi allineati, non sostituisce il piano clinico.
          </Text>
        </View>
      ) : (
        <View style={dashStyles.therapistNote}>
          <Text style={dashStyles.therapistNoteText}>
            Nessun logopedista collegato — {profile.displayName} segue il piano scelto in autonomia. Puoi collegarne
            uno in qualsiasi momento qui sotto.
          </Text>
        </View>
      )}

      <Pressable
        style={dashStyles.privacyRow}
        onPress={() => navigation.navigate("Paywall", { fromParentDashboard: true })}
      >
        <Text style={dashStyles.privacyRowText}>
          {profile.subscriptionActive ? "⭐ Abbonamento attivo" : "🔓 Sblocca tutti i suoni"}
        </Text>
        <Text style={dashStyles.chevron}>›</Text>
      </Pressable>

      {linkedTherapist ? (
        <View style={dashStyles.privacyRow}>
          <Text style={dashStyles.privacyRowText}>
            🩺 {linkedTherapist.name} {linkedTherapist.verified ? "· verificato" : "· verifica in corso"}
          </Text>
        </View>
      ) : (
        <Pressable style={dashStyles.privacyRow} onPress={() => navigation.navigate("TherapistLink")}>
          <Text style={dashStyles.privacyRowText}>🩺 Collega il tuo logopedista</Text>
          <Text style={dashStyles.chevron}>›</Text>
        </Pressable>
      )}

      <Pressable style={dashStyles.privacyRow} onPress={() => navigation.navigate("PrivacyConsent")}>
        <Text style={dashStyles.privacyRowText}>🔒 Privacy e registrazioni</Text>
        <Text style={dashStyles.chevron}>›</Text>
      </Pressable>
    </ScrollView>
  );
}

const dashStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: "800", color: COLORS.text },
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  summaryCard: { flex: 1, backgroundColor: "#fff", borderRadius: 16, padding: 14, alignItems: "center" },
  summaryNum: { fontSize: 22, fontWeight: "800", color: COLORS.jade },
  summaryLabel: { fontSize: 11, color: COLORS.subtext, marginTop: 2, textAlign: "center" },
  focusCard: { backgroundColor: "#FFF3D6", borderRadius: 16, padding: 14, marginBottom: 18 },
  focusLabel: { fontWeight: "700", marginBottom: 4 },
  focusText: { fontSize: 13, color: COLORS.text, lineHeight: 18 },
  sectionLabel: { fontSize: 13, fontWeight: "700", color: COLORS.subtext, marginBottom: 8, textTransform: "uppercase" },
  usageCard: { backgroundColor: "#fff", borderRadius: 16, padding: 14, marginBottom: 16 },
  usageStatsRow: { flexDirection: "row", gap: 28, marginBottom: 14 },
  usageStatNum: { fontSize: 22, fontWeight: "800", color: COLORS.jade },
  usageStatLabel: { fontSize: 11, color: COLORS.subtext, marginTop: 1 },
  usageChartRow: { flexDirection: "row", justifyContent: "space-between", height: 70, alignItems: "flex-end" },
  usageBarCol: { alignItems: "center", width: 28 },
  usageBarTrack: { width: 14, height: 52, justifyContent: "flex-end" },
  usageBarFill: { width: 14, borderRadius: 7, backgroundColor: COLORS.jade, minHeight: 4 },
  usageBarFillEmpty: { backgroundColor: "#E4DFD3" },
  usageBarLabel: { fontSize: 10, color: COLORS.subtext, marginTop: 4, textTransform: "capitalize" },
  usageEmptyNote: { fontSize: 11.5, color: COLORS.subtext, marginTop: 10, fontStyle: "italic" },
  trendRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#F0EBE0",
  },
  trendLabel: { fontSize: 13.5, fontWeight: "700", color: COLORS.text },
  trendValue: { fontSize: 13, color: COLORS.text },
  trendUp: { color: COLORS.jade, fontWeight: "800" },
  trendDown: { color: "#B0402B", fontWeight: "800" },
  groupCard: { backgroundColor: "#fff", borderRadius: 16, padding: 14, marginBottom: 12 },
  groupName: { fontWeight: "800", fontSize: 15, marginBottom: 8 },
  levelRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  levelLabel: { fontSize: 12, width: 64, color: COLORS.subtext },
  barTrack: { flex: 1, height: 8, backgroundColor: "#EEE", borderRadius: 999, overflow: "hidden" },
  barFill: { height: "100%", backgroundColor: COLORS.jade, borderRadius: 999 },
  levelPct: { fontSize: 12, width: 36, textAlign: "right", color: COLORS.text },
  therapistNote: { backgroundColor: "#E9F5F1", borderRadius: 14, padding: 14, marginTop: 8, marginBottom: 24 },
  therapistNoteText: { fontSize: 12.5, color: COLORS.jade, lineHeight: 18 },
  privacyRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 24,
  },
  privacyRowText: { fontSize: 13.5, fontWeight: "700", color: COLORS.text },
  chevron: { fontSize: 18, color: COLORS.subtext },
});

/* ---------------- Privacy e registrazioni ----------------
   Consenso esplicito alla registrazione audio (punto 5 del feedback clinico/legale,
   luglio 2026): raggiungibile solo dalla sezione genitori, dietro l'adult gate. Finché
   audioRecordingConsent è false, esercizi come il Registratore restano bloccati (vedi
   SessionScreen.tsx). Link a Privacy Policy/Cookie Policy: strutturati qui ma i documenti
   legali veri non esistono ancora — vedi TODO sotto, non inventarne il contenuto. */
export function PrivacyConsentScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const profile = useGamificationStore((s) => s.profile);
  const setAudioRecordingConsent = useGamificationStore((s) => s.setAudioRecordingConsent);
  const setCameraConsent = useGamificationStore((s) => s.setCameraConsent);
  const setRemindersEnabled = useGamificationStore((s) => s.setRemindersEnabled);

  // setRemindersEnabled ritorna false se il genitore nega il permesso di sistema: lo switch
  // deve restare/tornare su "off" invece di mostrare uno stato che non corrisponde al vero
  // (il valore mostrato viene comunque da profile.remindersEnabled, non da uno stato locale).
  async function handleToggleReminders(value: boolean) {
    const ok = await setRemindersEnabled(value);
    if (value && !ok) {
      Alert.alert(
        "Permesso non concesso",
        "Per ricevere il promemoria devi consentire le notifiche a Lallo dalle impostazioni del telefono."
      );
    }
  }

  function openLegalDoc(name: string) {
    // TODO: collegare l'URL vero della Privacy Policy / Cookie Policy (probabilmente
    // ospitata sul dominio della landing page) prima della submission App Store/Play Store.
    // Non fabbricare qui un testo legale placeholder: meglio segnalare che manca.
    Alert.alert(`${name} — in preparazione`, "Il documento sarà collegato qui prima della pubblicazione sugli store.");
  }

  if (!profile) return null;

  return (
    <ScrollView style={privacyStyles.container} contentContainerStyle={{ padding: 16, paddingTop: insets.top + 16, paddingBottom: 40 }}>
      <View style={privacyStyles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={privacyStyles.back}>‹</Text>
        </Pressable>
        <Text style={privacyStyles.title}>Privacy e registrazioni</Text>
      </View>

      <View style={privacyStyles.card}>
        <Text style={privacyStyles.cardTitle}>Registrazione della voce</Text>
        <Text style={privacyStyles.cardText}>
          Alcuni esercizi (come il Registratore) usano la registrazione della voce di{" "}
          {profile.displayName} per confrontarla con la pronuncia corretta — ed
          eventualmente, in futuri aggiornamenti, anche un breve video. La registrazione
          avviene solo con il tuo consenso qui sotto. I file restano collegati al profilo
          di {profile.displayName} e vengono conservati solo per il tempo necessario a
          fornire il servizio, come descritto nella Privacy Policy.
        </Text>
        <View style={privacyStyles.consentRow}>
          <Text style={privacyStyles.consentLabel}>
            Acconsento alla registrazione vocale di {profile.displayName} per gli esercizi
            di pronuncia
          </Text>
          <Switch
            value={profile.audioRecordingConsent}
            onValueChange={setAudioRecordingConsent}
            trackColor={{ false: "#D9CEBC", true: COLORS.jade }}
          />
        </View>
      </View>

      <View style={privacyStyles.card}>
        <Text style={privacyStyles.cardTitle}>Fotocamera per l'Album</Text>
        <Text style={privacyStyles.cardText}>
          L'Album lascia {profile.displayName} fotografare oggetti reali che corrispondono
          alle parole che sta imparando. Le foto restano solo su questo dispositivo — non
          vengono mai caricate su internet o condivise. Puoi rivedere ed eliminare ogni foto
          in qualsiasi momento dall'Album.
        </Text>
        <View style={privacyStyles.consentRow}>
          <Text style={privacyStyles.consentLabel}>
            Acconsento all'uso della fotocamera per l'Album di {profile.displayName}
          </Text>
          <Switch
            value={profile.cameraConsent}
            onValueChange={setCameraConsent}
            trackColor={{ false: "#D9CEBC", true: COLORS.jade }}
          />
        </View>
      </View>

      <View style={privacyStyles.card}>
        <Text style={privacyStyles.cardTitle}>Promemoria</Text>
        <Text style={privacyStyles.cardText}>
          Se {profile.displayName} non ha ancora giocato in giornata, Lallo manda un
          promemoria nel tardo pomeriggio su questo dispositivo — mai più di uno al giorno,
          niente notifiche se ha già fatto l'esercizio.
        </Text>
        <View style={privacyStyles.consentRow}>
          <Text style={privacyStyles.consentLabel}>
            Ricordami di far giocare {profile.displayName} ogni giorno
          </Text>
          <Switch
            value={profile.remindersEnabled}
            onValueChange={handleToggleReminders}
            trackColor={{ false: "#D9CEBC", true: COLORS.jade }}
          />
        </View>
      </View>

      <Pressable style={privacyStyles.linkRow} onPress={() => openLegalDoc("Privacy Policy")}>
        <Text style={privacyStyles.linkRowText}>Privacy Policy</Text>
        <Text style={privacyStyles.chevronLink}>›</Text>
      </Pressable>
      <Pressable style={privacyStyles.linkRow} onPress={() => openLegalDoc("Cookie Policy")}>
        <Text style={privacyStyles.linkRowText}>Cookie Policy</Text>
        <Text style={privacyStyles.chevronLink}>›</Text>
      </Pressable>
    </ScrollView>
  );
}

const privacyStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  back: { fontSize: 26, color: COLORS.primary },
  title: { fontSize: 20, fontWeight: "800", color: COLORS.text },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 16 },
  cardTitle: { fontWeight: "800", fontSize: 15, color: COLORS.text, marginBottom: 8 },
  cardText: { fontSize: 13, color: COLORS.subtext, lineHeight: 19 },
  consentRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    gap: 12, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#EEE",
  },
  consentLabel: { flex: 1, fontSize: 13, color: COLORS.text, lineHeight: 18 },
  linkRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 10,
  },
  linkRowText: { fontSize: 13.5, fontWeight: "700", color: COLORS.text },
  chevronLink: { fontSize: 18, color: COLORS.subtext },
});
