import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { requestOtpCode, verifyOtpCode } from "../api/auth";
import { ensureParentProfile } from "../api/profiles";
import { createChild } from "../api/children";
import { ensureTherapistProfile, registerTherapist } from "../api/therapists";
import { isSupabaseConfigured } from "../api/supabase";
import { useGamificationStore } from "../store/useGamificationStore";
import { PhonemeKey } from "../constants/wordBank";

const C = {
  bg: "#FBF6EE",
  primary: "#FF6A4D",
  jade: "#137A6E",
  text: "#1F2E2B",
  subtext: "#4A5A56",
  line: "#D9CEBC",
};

// Gate di autenticazione: compare una sola volta, nel momento in cui il piano del bambino
// sta per diventare reale (fine screener self-directed, oppure subito dopo aver inserito
// un codice del logopedista) — non prima, per non aggiungere attrito allo screener stesso
// (principio "genitore... fa un breve screener, e inizia da solo", brief §6.1). Email +
// codice OTP: niente password, coerente con "scarica e inizia da solo". La lunghezza del
// codice non è fissata lato app — dipende dal template email configurato in Supabase.
export default function AuthScreen({ navigation, route }: any) {
  const role: "parent" | "therapist" = route.params?.role === "therapist" ? "therapist" : "parent";
  const name: string = route.params?.name || "il bambino";
  const sounds: PhonemeKey[] | undefined = route.params?.strugglingSounds;
  const birthdate: string | null = route.params?.birthdate ?? null;
  const therapistFullName: string = route.params?.fullName || "";
  const therapistAlboNumber: string = route.params?.alboNumber || "";

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const startSelfDirectedPlan = useGamificationStore((s) => s.startSelfDirectedPlan);
  const setSupabaseChildId = useGamificationStore((s) => s.setSupabaseChildId);

  async function sendCode() {
    if (!email.includes("@")) return;
    setLoading(true);
    setErrorMsg(null);
    const { error } = await requestOtpCode(email.trim());
    setLoading(false);
    if (error) {
      setErrorMsg("Non siamo riusciti a inviare il codice. Controlla la connessione e riprova.");
      return;
    }
    setStep("code");
  }

  async function verifyCode() {
    if (code.trim().length < 4) return;
    setLoading(true);
    setErrorMsg(null);
    const { error } = await verifyOtpCode(email.trim(), code.trim());
    if (error) {
      setLoading(false);
      setErrorMsg("Codice non valido o scaduto. Richiedine uno nuovo.");
      return;
    }

    if (role === "therapist") {
      const { error: profileError } = await ensureTherapistProfile();
      if (profileError) {
        setLoading(false);
        setErrorMsg("Accesso riuscito, ma non siamo riusciti a creare il tuo profilo. Riprova.");
        return;
      }
      const { data: therapist, error: registerError } = await registerTherapist({
        fullName: therapistFullName,
        alboNumber: therapistAlboNumber,
      });
      setLoading(false);
      if (registerError || !therapist) {
        setErrorMsg("Accesso riuscito, ma non siamo riusciti a registrarti come logopedista. Riprova.");
        return;
      }
      navigation.navigate("TherapistCodeReady", { inviteCode: therapist.invite_code, fullName: therapist.full_name });
      return;
    }

    const { error: profileError } = await ensureParentProfile();
    if (profileError) {
      setLoading(false);
      setErrorMsg("Accesso riuscito, ma non siamo riusciti a creare il tuo profilo. Riprova.");
      return;
    }
    const { data: child, error: childError } = await createChild({ name, birthdate });
    setLoading(false);
    if (childError) {
      setErrorMsg("Accesso riuscito, ma non siamo riusciti a salvare il profilo di " + name + ". Riprova.");
      return;
    }
    if (child) setSupabaseChildId(child.id);
    if (sounds && sounds.length > 0) startSelfDirectedPlan(sounds);
    navigation.navigate("Paywall");
  }

  if (!isSupabaseConfigured) {
    // Nessuna EXPO_PUBLIC_SUPABASE_ANON_KEY impostata: non blocchiamo lo sviluppo/i test
    // locali, si prosegue come prima (solo store locale, nessuna persistenza reale). Per il
    // logopedista non ha senso un percorso "locale": il codice invito deve essere vero e
    // persistito, quindi qui si ferma con un messaggio invece di fingere una registrazione.
    if (role === "therapist") {
      return (
        <View style={styles.container}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.back}>←</Text>
          </Pressable>
          <Text style={styles.title}>Backend non collegato</Text>
          <Text style={styles.subtitle}>
            La registrazione come logopedista richiede il backend collegato — non è disponibile in questo ambiente di
            test.
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Accesso non ancora configurato</Text>
        <Text style={styles.subtitle}>
          Il backend non è collegato in questo ambiente — continuiamo senza salvare i dati.
        </Text>
        <View style={{ flex: 1 }} />
        <ContinueButton
          onPress={() => {
            if (sounds && sounds.length > 0) startSelfDirectedPlan(sounds);
            navigation.navigate("Paywall");
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={styles.back}>←</Text>
      </Pressable>

      {step === "email" ? (
        <>
          <Text style={styles.title}>La tua email</Text>
          <Text style={styles.subtitle}>
            {role === "therapist"
              ? "Ti mandiamo un codice per accedere — niente password. Serve per creare il tuo profilo logopedista."
              : `Ti mandiamo un codice per accedere — niente password. Serve per salvare i progressi di ${name}.`}
          </Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="La tua email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            style={styles.input}
          />
          {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
          <View style={{ flex: 1 }} />
          {loading ? (
            <ActivityIndicator color={C.primary} />
          ) : (
            <ContinueButton label="Invia il codice" disabled={!email.includes("@")} onPress={sendCode} />
          )}
        </>
      ) : (
        <>
          <Text style={styles.title}>Inserisci il codice</Text>
          <Text style={styles.subtitle}>Te lo abbiamo appena mandato a {email}.</Text>
          <TextInput
            value={code}
            onChangeText={setCode}
            placeholder="Codice"
            keyboardType="number-pad"
            maxLength={10}
            style={styles.input}
          />
          {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
          <View style={{ flex: 1 }} />
          {loading ? (
            <ActivityIndicator color={C.primary} />
          ) : (
            <>
              <ContinueButton label="Verifica" disabled={code.trim().length < 4} onPress={verifyCode} />
              <Pressable onPress={() => setStep("email")} style={styles.retryLink}>
                <Text style={styles.retryLinkText}>Usa un'altra email</Text>
              </Pressable>
            </>
          )}
        </>
      )}
    </View>
  );
}

function ContinueButton({ label = "Continua", onPress, disabled = false }: any) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.cta, disabled && { opacity: 0.4 }]}>
      <Text style={styles.ctaText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg, padding: 24, paddingTop: 60 },
  back: { fontSize: 24, color: C.jade, marginBottom: 20 },
  title: { fontSize: 26, fontWeight: "800", color: C.text, marginBottom: 12 },
  subtitle: { fontSize: 16, color: C.subtext, lineHeight: 22 },
  input: {
    marginTop: 24,
    borderWidth: 2,
    borderColor: C.primary,
    borderRadius: 12,
    padding: 14,
    fontSize: 18,
  },
  errorText: { color: C.primary, fontSize: 13.5, marginTop: 12 },
  cta: {
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
  },
  ctaText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  retryLink: { alignItems: "center", marginTop: 16 },
  retryLinkText: { color: C.subtext, textDecorationLine: "underline" },
});
