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
// Third option added: hybrid marketplace interest capture (waitlist only —
// not a live booking flow yet, see reasoning in project notes on sequencing).
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
        onPress={() => navigation.navigate("RemoteTherapistWaitlist")}
        style={styles.secondaryOption}
      >
        <Text style={styles.secondaryOptionTitle}>Non ho un logopedista</Text>
        <Text style={styles.secondaryOptionSubtitle}>
          Fatti assegnare un logopedista Lallo da remoto
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

// Screen 2c — waitlist capture for the remote-therapist marketplace track.
// Intentionally NOT a live booking flow: collects interest + rough
// availability so demand can be sized before any therapist is contracted.
// See sequencing rationale: validate B2B2C first, pilot this with 2-3
// freelance logopedisti before treating it as a launch feature.
export function RemoteTherapistWaitlistScreen({ navigation, route }: any) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Ti abbiamo messo in lista ✅</Text>
        <Text style={styles.subtitle}>
          Ti contatteremo appena avremo un logopedista disponibile nella tua
          zona. Nel frattempo puoi comunque iniziare a usare Lallo.
        </Text>
        <View style={{ flex: 1 }} />
        <ContinueButton onPress={() => navigation.navigate("ChildName")} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={styles.back}>←</Text>
      </Pressable>
      <Text style={styles.title}>Presto disponibile</Text>
      <Text style={styles.subtitle}>
        Stiamo selezionando i primi logopedisti Lallo per le sedute da
        remoto. Lasciaci la tua email e sarai tra i primi ad essere
        contattato.
      </Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="La tua email"
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      <View style={{ flex: 1 }} />
      <ContinueButton
        label="Iscrivimi alla lista"
        disabled={email.length < 5}
        onPress={() => {
          // TODO: send to waitlist table (Supabase) keyed by email + rough
          // location, so pilot ops can see where demand clusters before
          // deciding which region to launch the freelance pilot in.
          setSubmitted(true);
        }}
      />
      <Pressable
        onPress={() => navigation.navigate("ChildName")}
        style={styles.skipLink}
      >
        <Text style={styles.skipText}>Continua senza iscrivermi</Text>
      </Pressable>
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
            ? navigation.navigate("MainTabs")
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
