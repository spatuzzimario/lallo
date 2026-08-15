import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";

const COLORS = {
  bg: "#FBF6EE", // --paper della demo HTML
  primary: "#FF6A4D", // --coral, CTA principale come in demo
  jade: "#137A6E",
  text: "#1F2E2B",
  subtext: "#4A5A56",
};

function ContinueButton({ label = "Continua", onPress, disabled = false }: any) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.cta, disabled && { opacity: 0.4 }]}
    >
      <Text style={styles.ctaText}>{label}</Text>
    </Pressable>
  );
}

// Screen 1 — Trust/process screen, replaces Speech Blubs' unsourced stat bars.
// Framed around the clinical scale rather than an outcome % we can't back yet.
export function TrustScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lallo segue la scala clinica{"\n"}usata dai logopedisti</Text>
      <Text style={styles.subtitle}>
        Ogni esercizio è strutturato sui 5 livelli di sviluppo fonetico,
        così puoi seguire i progressi reali di tuo figlio — non solo il tempo di gioco.
      </Text>
      <View style={{ flex: 1 }} />
      <ContinueButton onPress={() => navigation.navigate("TherapistLink")} />
    </View>
  );
}

// Screen 2 — the branch point Speech Blubs doesn't need. This is the key
// B2B2C moment: does this family already have a prescribing therapist?
export function TherapistLinkScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hai un codice del tuo logopedista?</Text>
      <Text style={styles.subtitle}>
        Se il tuo logopedista ti ha dato un codice, collegalo per sbloccare
        gli esercizi assegnati e monitorare i progressi insieme.
      </Text>
      <View style={{ flex: 1 }} />
      <ContinueButton
        label="Ho un codice"
        onPress={() => navigation.navigate("TherapistCodeEntry")}
      />
      <Pressable
        onPress={() => navigation.navigate("FindTherapist")}
        style={styles.secondaryOption}
      >
        <Text style={styles.secondaryOptionTitle}>Non ho un logopedista</Text>
        <Text style={styles.secondaryOptionSubtitle}>
          Trova un logopedista vicino a te
        </Text>
      </Pressable>
      <Pressable
        onPress={() => navigation.navigate("ChildName")}
        style={styles.skipLink}
      >
        <Text style={styles.skipText}>Non ancora, continua senza codice</Text>
      </Pressable>
    </View>
  );
}

// Screen 2c — sostituisce il vecchio flusso "logopedista da remoto" (telemedicina):
// validato con Carlotta Canclini, logopedista, in una call di luglio 2026 — per bambini
// piccoli con disturbi fonetico-fonologici il lavoro in presenza è considerato necessario,
// quindi non proponiamo più una presa in carico da remoto. La mappa dei logopedisti Lallo
// è a roadmap ma non ancora costruita: questo schermo comunica lo stato reale, senza
// promettere una rete di professionisti che non esiste ancora.
export function FindTherapistScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={styles.back}>←</Text>
      </Pressable>
      <Text style={styles.title}>Trova un logopedista vicino a te</Text>
      <Text style={styles.subtitle}>
        Per i disturbi fonetico-fonologici nei bambini piccoli il lavoro in presenza con un
        logopedista fa la differenza. La mappa dei logopedisti Lallo è in arrivo: nel
        frattempo puoi chiedere indicazioni al pediatra o cercare un logopedista
        specializzato in disturbi del linguaggio infantile nella tua zona.
      </Text>
      <View style={{ flex: 1 }} />
      <ContinueButton label="Ho capito" onPress={() => navigation.goBack()} />
    </View>
  );
}

// Screen 2b — code entry, only reached if they said yes above
export function TherapistCodeEntryScreen({ navigation }: any) {
  const [code, setCode] = useState("");
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inserisci il codice</Text>
      <Text style={styles.subtitle}>Te lo ha fornito il tuo logopedista.</Text>
      <TextInput
        value={code}
        onChangeText={setCode}
        placeholder="Es. LOGO-2024-XXXX"
        autoCapitalize="characters"
        style={styles.input}
      />
      <View style={{ flex: 1 }} />
      <ContinueButton
        disabled={code.length < 4}
        onPress={() => navigation.navigate("ChildName", { therapistCode: code })}
      />
    </View>
  );
}

// Screen 3 — name entry, direct port of the Speech Blubs pattern (illustration,
// input, Skip in the top right). Their affirmative-nickname framing works well
// for a sensitive context like speech delay, kept as-is.
export function ChildNameScreen({ navigation, route }: any) {
  const [name, setName] = useState("");
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate("ChildBirthdate", { name: "" })}>
          <Text style={styles.skip}>Salta</Text>
        </Pressable>
      </View>
      <Text style={styles.title}>Come si chiama tuo figlio?</Text>
      <Text style={styles.subtitle}>
        O un soprannome. Ci aiuta a personalizzare l'esperienza nell'app.
      </Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Nome"
        style={styles.input}
      />
      <View style={{ flex: 1 }} />
      <ContinueButton
        disabled={name.length === 0}
        onPress={() =>
          navigation.navigate("ChildBirthdate", {
            name,
            therapistCode: route?.params?.therapistCode,
          })
        }
      />
    </View>
  );
}

// reference screenshots do ("When was Luigi born?"). Age drives which
// phoneme levels are age-appropriate to surface first.
export function ChildBirthdateScreen({ navigation, route }: any) {
  const name = route?.params?.name || "il tuo bambino";
  const hasTherapistCode = !!route?.params?.therapistCode;
  return (
    <View style={styles.container}>
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={styles.back}>←</Text>
      </Pressable>
      <Text style={styles.title}>Quando è nato {name}?</Text>
      <Text style={styles.subtitle}>
        Ci serve la data di nascita per proporre esercizi adatti alla sua età.
      </Text>
      {/* Date picker component goes here — native wheel picker,
          same interaction as the reference screenshots */}
      <View style={{ flex: 1 }} />
      <ContinueButton
        onPress={() =>
          hasTherapistCode
            ? navigation.navigate("Auth", { name })
            : navigation.navigate("WordCount", { name })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: 24, paddingTop: 60 },
  topRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  back: { fontSize: 24, color: COLORS.jade },
  skip: { fontSize: 16, color: COLORS.jade, fontWeight: "700" },
  skipLink: { alignItems: "center", marginTop: 16 },
  skipText: { color: COLORS.subtext, textDecorationLine: "underline" },
  secondaryOption: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
    alignItems: "center",
  },
  secondaryOptionTitle: { fontSize: 16, fontWeight: "700", color: COLORS.primary },
  secondaryOptionSubtitle: { fontSize: 13, color: COLORS.subtext, marginTop: 2 },
  title: { fontSize: 26, fontWeight: "800", color: COLORS.text, marginTop: 24, marginBottom: 12 },
  subtitle: { fontSize: 16, color: COLORS.subtext, lineHeight: 22 },
  input: {
    marginTop: 24,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 12,
    padding: 14,
    fontSize: 18,
  },
  cta: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
  },
  ctaText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});
