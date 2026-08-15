import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, TextInput } from "react-native";
import { PHONEME_ORDER, WORD_BANK, PhonemeKey } from "../constants/wordBank";

const C = {
  bg: "#FBF6EE",
  primary: "#FF6A4D",
  jade: "#137A6E",
  text: "#1F2E2B",
  subtext: "#4A5A56",
  line: "#D9CEBC",
};

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${(step / total) * 100}%` }]} />
    </View>
  );
}
function Header({ onBack, step, total }: { onBack: () => void; step: number; total: number }) {
  return (
    <View style={styles.headerRow}>
      <Pressable onPress={onBack}>
        <Text style={styles.back}>←</Text>
      </Pressable>
      <ProgressBar step={step} total={total} />
    </View>
  );
}
function ContinueBtn({ onPress, disabled, label = "Continua" }: { onPress: () => void; disabled?: boolean; label?: string }) {
  return (
    <Pressable disabled={disabled} onPress={onPress} style={[styles.cta, disabled && { opacity: 0.35 }]}>
      <Text style={styles.ctaText}>{label}</Text>
    </Pressable>
  );
}

const TOTAL_STEPS = 6;

/* 1 — quante parole dice */
export function WordCountScreen({ navigation, route }: any) {
  const name = route.params?.name || "il bambino";
  const options = ["0 parole", "1–5 parole", "6–10 parole", "11–50 parole", "50+ parole"];
  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 24, paddingTop: 50 }}>
      <Header onBack={() => navigation.goBack()} step={1} total={TOTAL_STEPS} />
      <Text style={styles.title}>All'incirca quante parole dice {name}?</Text>
      {options.map((opt) => (
        <Pressable
          key={opt}
          style={styles.optionBtn}
          onPress={() => navigation.navigate("EvaluatedByTherapist", { ...route.params, wordCount: opt })}
        >
          <Text style={styles.optionText}>{opt}</Text>
        </Pressable>
      ))}
      <Pressable onPress={() => navigation.navigate("EvaluatedByTherapist", { ...route.params, wordCount: null })}>
        <Text style={styles.skipText}>Non so dirlo</Text>
      </Pressable>
    </ScrollView>
  );
}

/* 2 — valutato da uno specialista? NOTA CLINICA (validata con Carlotta Canclini,
   logopedista, luglio 2026): il logopedista NON fa diagnosi — non attribuirgliela mai
   in questo testo. La valutazione arriva da un neuropsichiatra infantile, un'équipe
   multidisciplinare, o un invio ad accertamenti dal pediatra. */
export function EvaluatedByTherapistScreen({ navigation, route }: any) {
  const name = route.params?.name || "il bambino";
  function next(evaluated: boolean) {
    navigation.navigate("DiagnosedConditions", { ...route.params, evaluated });
  }
  return (
    <View style={styles.screen}>
      <View style={{ padding: 24, paddingTop: 50, flex: 1 }}>
        <Header onBack={() => navigation.goBack()} step={2} total={TOTAL_STEPS} />
        <Text style={styles.title}>
          {name} è mai stato valutato da uno specialista (neuropsichiatra infantile, équipe
          multidisciplinare, o pediatra che lo ha inviato ad accertamenti)?
        </Text>
        <View style={{ flex: 1 }} />
        <View style={styles.yesNoRow}>
          <Pressable style={styles.yesBtn} onPress={() => next(true)}>
            <Text style={styles.yesText}>Sì</Text>
          </Pressable>
          <Pressable style={styles.noBtn} onPress={() => next(false)}>
            <Text style={styles.noText}>No</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/* 3 — condizioni diagnosticate. Lista ridotta ai disturbi fonetico-fonologici pertinenti
   all'app (validata con Carlotta Canclini, logopedista, luglio 2026) — niente spettro
   neuroevolutivo generico (autismo, ipoacusia, disprassia, palatoschisi...), non è il
   target di Lallo. Balbuzie rimossa: non abbiamo esercizi per la fluenza. */
const CONDITIONS = [
  "Disturbo Specifico del Linguaggio (generico)",
  "Ritardo del linguaggio",
  "Disturbi fonetico-fonologici",
];
export function DiagnosedConditionsScreen({ navigation, route }: any) {
  const wasEvaluated = route.params?.evaluated === true;
  const [selected, setSelected] = useState<string[]>([]);
  const [other, setOther] = useState("");
  const toggle = (c: string) => setSelected((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  // Se non è mai stato valutato, non esiste ancora una diagnosi da riportare —
  // chiediamo l'impressione del genitore, non una diagnosi che non c'è.
  const title = wasEvaluated
    ? "Quali di queste condizioni sono state diagnosticate?"
    : "Cosa pensi possano essere le sue difficoltà?";
  const subtitle = wasEvaluated
    ? undefined
    : "Nessun problema se non ne sei sicuro — è solo un'impressione, non serve una diagnosi.";

  return (
    <View style={styles.screen}>
      <View style={{ padding: 24, paddingTop: 50, flex: 1 }}>
        <Header onBack={() => navigation.goBack()} step={3} total={TOTAL_STEPS} />
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        <ScrollView style={{ marginTop: 10 }}>
          {CONDITIONS.map((c) => {
            const on = selected.includes(c);
            return (
              <Pressable key={c} onPress={() => toggle(c)} style={styles.checkRow}>
                <View style={[styles.checkbox, on && styles.checkboxOn]}>
                  {on && <Text style={styles.checkMark}>✓</Text>}
                </View>
                <Text style={styles.checkLabel}>{c}</Text>
              </Pressable>
            );
          })}
          <Text style={styles.otherLabel}>Altro (facoltativo)</Text>
          <TextInput
            value={other}
            onChangeText={setOther}
            placeholder="Scrivi qui se manca qualcosa nell'elenco"
            style={styles.otherInput}
            multiline
          />
        </ScrollView>
      </View>
      <View style={{ padding: 24 }}>
        <ContinueBtn
          onPress={() =>
            navigation.navigate("StrugglingSounds", { ...route.params, conditions: selected, conditionsOther: other })
          }
        />
      </View>
    </View>
  );
}

/* 4 — quali suoni fa fatica a pronunciare — diventa il punto di partenza
   dei contenuti per le famiglie senza logopedista (sostituisce l'assegnazione
   clinica finché non ne agganciano una). */
export function StrugglingSoundsScreen({ navigation, route }: any) {
  const [selected, setSelected] = useState<PhonemeKey[]>([]);
  const toggle = (k: PhonemeKey) => setSelected((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));
  return (
    <View style={styles.screen}>
      <View style={{ padding: 24, paddingTop: 50, flex: 1 }}>
        <Header onBack={() => navigation.goBack()} step={4} total={TOTAL_STEPS} />
        <Text style={styles.title}>Quali suoni fa fatica a pronunciare?</Text>
        <Text style={styles.subtitle}>Scegli quelli che riconosci — ti aiutiamo a costruire il punto di partenza.</Text>
        <ScrollView style={{ marginTop: 14 }}>
          <View style={styles.chipWrap}>
            {PHONEME_ORDER.map((key) => {
              const on = selected.includes(key);
              const example = WORD_BANK[key].iniziale[0] || WORD_BANK[key].mediana[0];
              return (
                <Pressable key={key} onPress={() => toggle(key)} style={[styles.soundChip, on && styles.soundChipOn]}>
                  <Text style={[styles.soundChipLabel, on && styles.soundChipLabelOn]}>{WORD_BANK[key].label}</Text>
                  {example && <Text style={[styles.soundChipExample, on && styles.soundChipLabelOn]}>{example.parola}</Text>}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>
      <View style={{ padding: 24 }}>
        <ContinueBtn onPress={() => navigation.navigate("TrustStat", { ...route.params, strugglingSounds: selected })} />
      </View>
    </View>
  );
}

/* 5 — schermata di fiducia con dati reali, NIENTE testimonianze inventate */
export function TrustStatScreen({ navigation, route }: any) {
  return (
    <View style={styles.screen}>
      <View style={{ padding: 24, paddingTop: 50, flex: 1 }}>
        <Header onBack={() => navigation.goBack()} step={5} total={TOTAL_STEPS} />
        <Text style={styles.title}>Quasi 1 bambino su 10 in età prescolare mostra una difficoltà di linguaggio</Text>
        <Text style={styles.subtitle}>
          Con esercizi mirati e pratica regolare, molte difficoltà di articolazione migliorano nel tempo — prima si
          inizia, più la pratica quotidiana aiuta.
        </Text>
      </View>
      <View style={{ padding: 24 }}>
        <ContinueBtn onPress={() => navigation.navigate("Results", route.params)} />
      </View>
    </View>
  );
}

/* 6 — breve attesa "calcolo" poi riepilogo del piano proposto. GATING (punto 2, validato
   con Carlotta Canclini, logopedista, luglio 2026 — poi rivisto: modello parent-first,
   vedi CLAUDE.md §1): il genitore sceglie i suoni e inizia subito, si parte dal livello 1
   (suono isolato) su ciascun fonema — non è "a freddo" perché level 1 è il punto di
   partenza corretto per qualsiasi fonema nuovo. Il logopedista resta un potenziamento
   opzionale (vedi TherapistLinkScreen/FindTherapistScreen), non un cancello. I suoni
   scelti diventano `parentReportedConcerns` (nota per un eventuale logopedista futuro da
   confermare) E, contemporaneamente, il piano attivo del bambino — le due cose insieme,
   non in alternativa, ora che l'accesso non è più bloccato. */
export function ResultsScreen({ navigation, route }: any) {
  const [calculating, setCalculating] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setCalculating(false), 1400);
    return () => clearTimeout(t);
  }, []);

  if (calculating) {
    return (
      <View style={[styles.screen, styles.centerAll]}>
        <Text style={styles.calcText}>Prepariamo il piano di {route.params?.name || "tuo figlio"}…</Text>
      </View>
    );
  }

  const sounds: PhonemeKey[] = route.params?.strugglingSounds?.length ? route.params.strugglingSounds : ["r"];
  return (
    <View style={styles.screen}>
      <View style={{ padding: 24, paddingTop: 50, flex: 1 }}>
        <Text style={styles.title}>Ecco da dove iniziamo</Text>
        <Text style={styles.subtitle}>
          In base a quello che ci hai detto, il piano di {route.params?.name || "tuo figlio"} parte da questi suoni,
          dal livello base:
        </Text>
        <View style={[styles.chipWrap, { marginTop: 16 }]}>
          {sounds.map((key) => (
            <View key={key} style={styles.resultChip}>
              <Text style={styles.resultChipText}>{WORD_BANK[key].label}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.disclaimerText}>
          Non è una diagnosi. Se {route.params?.name || "tuo figlio"} non ha ancora un logopedista, ti consigliamo di
          farlo valutare — l'app resta uno strumento di pratica, non uno strumento clinico.
        </Text>
      </View>
      <View style={{ padding: 24 }}>
        <ContinueBtn
          label="Inizia a giocare"
          onPress={() => navigation.navigate("Auth", { name: route.params?.name, strugglingSounds: sounds })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  centerAll: { alignItems: "center", justifyContent: "center" },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 26 },
  back: { fontSize: 22, color: C.jade },
  progressTrack: { flex: 1, height: 6, backgroundColor: "#E4EFEA", borderRadius: 999 },
  progressFill: { height: "100%", backgroundColor: C.jade, borderRadius: 999 },
  title: { fontSize: 22, fontWeight: "800", color: C.text, lineHeight: 28 },
  subtitle: { fontSize: 14, color: C.subtext, marginTop: 10, lineHeight: 20 },
  optionBtn: { borderWidth: 2, borderColor: C.primary, borderRadius: 14, padding: 16, marginTop: 14, alignItems: "center" },
  optionText: { color: C.primary, fontWeight: "700", fontSize: 15 },
  skipText: { textAlign: "center", color: C.subtext, marginTop: 18, textDecorationLine: "underline" },
  yesNoRow: { flexDirection: "row", justifyContent: "center", gap: 20, marginBottom: 24 },
  yesBtn: { width: 100, height: 100, borderRadius: 50, backgroundColor: C.primary, alignItems: "center", justifyContent: "center" },
  yesText: { color: "#fff", fontWeight: "800", fontSize: 17 },
  noBtn: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: C.primary, alignItems: "center", justifyContent: "center" },
  noText: { color: C.primary, fontWeight: "800", fontSize: 17 },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: C.line, alignItems: "center", justifyContent: "center" },
  checkboxOn: { backgroundColor: C.primary, borderColor: C.primary },
  checkMark: { color: "#fff", fontWeight: "800", fontSize: 13 },
  checkLabel: { fontSize: 14.5, color: C.text, flex: 1 },
  otherLabel: { fontSize: 12.5, fontWeight: "700", color: C.subtext, marginTop: 16, marginBottom: 6 },
  otherInput: {
    borderWidth: 1.5, borderColor: C.line, borderRadius: 12, padding: 12, minHeight: 60,
    fontSize: 14, color: C.text, backgroundColor: "#fff", textAlignVertical: "top",
  },
  cta: { backgroundColor: C.primary, borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  ctaText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  soundChip: {
    width: "31%", borderWidth: 1.5, borderColor: C.line, borderRadius: 12, padding: 10, alignItems: "center",
    backgroundColor: "#fff", marginBottom: 8,
  },
  soundChipOn: { backgroundColor: C.jade, borderColor: C.jade },
  soundChipLabel: { fontWeight: "800", fontSize: 14, color: C.text },
  soundChipExample: { fontSize: 10, color: C.subtext, marginTop: 2 },
  soundChipLabelOn: { color: "#fff" },
  calcText: { fontSize: 16, fontWeight: "600", color: C.jade },
  resultChip: { backgroundColor: C.jade, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 16, marginBottom: 8 },
  resultChipText: { color: "#fff", fontWeight: "700" },
  disclaimerText: { fontSize: 11.5, color: C.subtext, marginTop: 24, lineHeight: 17, fontStyle: "italic" },
});
