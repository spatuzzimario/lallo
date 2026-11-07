import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  signUpWithPassword,
  signInWithPassword,
  requestPasswordReset,
  verifyPasswordResetCode,
  updatePassword,
  signInWithGoogle,
  signInWithFacebook,
} from "../api/auth";
import { ensureParentProfile } from "../api/profiles";
import { createChild, getChildren } from "../api/children";
import { ensureTherapistProfile, registerTherapist } from "../api/therapists";
import { isSupabaseConfigured } from "../api/supabase";
import { useGamificationStore } from "../store/useGamificationStore";
import { PhonemeKey } from "../constants/wordBank";
import { DEFAULT_AVATAR_ID } from "../constants/avatars";

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
// password vera (novembre 2026: prima era solo un codice OTP, cambiato su richiesta esplicita
// del founder perché "Accedi" deve essere un vero login — vedi loginOnly sotto e
// ForgotPasswordScreen più in fondo al file per il recupero password).
export default function AuthScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const role: "parent" | "therapist" = route.params?.role === "therapist" ? "therapist" : "parent";
  // "Accedi" dalla homepage (route Login, vedi App.tsx) invece di "Registrati": dopo
  // l'accesso riprende i bambini già esistenti di questo account invece di provare a
  // crearne uno nuovo — stesso meccanismo di login (password/Google/Facebook), comportamento
  // diverso dopo che Supabase conferma la sessione.
  const loginOnly: boolean = !!route.params?.loginOnly;
  const name: string = route.params?.name || "il bambino";
  const gender: "maschio" | "femmina" | "preferisco_non_dire" | undefined = route.params?.gender;
  const avatarId: string | undefined = route.params?.avatarId;
  const sounds: PhonemeKey[] | undefined = route.params?.strugglingSounds;
  const birthdate: string | null = route.params?.birthdate ?? null;
  const therapistFullName: string = route.params?.fullName || "";
  const therapistAlboNumber: string = route.params?.alboNumber || "";

  // Pre-compilata con l'email già raccolta in ParentEmailScreen (prima dello screener) quando
  // c'è — evita di richiederla una seconda volta da zero dopo che il genitore l'ha già data.
  const [email, setEmail] = useState(route.params?.parentEmail || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "facebook" | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // Mostrato solo sull'errore di login (email/password errate O account inesistente — Supabase
  // li rende indistinguibili apposta, vedi commento in api/auth.ts): offre la via d'uscita più
  // probabile invece di lasciare l'utente bloccato su un errore generico.
  const [showRegisterHint, setShowRegisterHint] = useState(false);
  // Messaggio one-shot passato da ForgotPasswordScreen dopo un reset riuscito.
  const resetSuccessMsg: string | null = route.params?.passwordResetDone
    ? "Password aggiornata — accedi con la nuova password."
    : null;

  const startSelfDirectedPlan = useGamificationStore((s) => s.startSelfDirectedPlan);
  const setSupabaseChildId = useGamificationStore((s) => s.setSupabaseChildId);
  const setChildInfo = useGamificationStore((s) => s.setChildInfo);
  const children = useGamificationStore((s) => s.children);
  const setChildrenRoster = useGamificationStore((s) => s.setChildrenRoster);
  const hydrateFromSupabase = useGamificationStore((s) => s.hydrateFromSupabase);

  // Tutto quello che succede DOPO che Supabase ha una sessione valida — identico sia che ci
  // si sia arrivati con email+password sia con Google/Facebook, quindi vive qui una volta
  // sola invece che duplicato in submit() e handleOAuth(). Ritorna un messaggio d'errore da
  // mostrare, o null se è andato tutto bene (la navigazione l'ha già fatta lei stessa).
  async function completeSignIn(): Promise<string | null> {
    if (role === "therapist") {
      const { error: profileError } = await ensureTherapistProfile();
      if (profileError) return "Accesso riuscito, ma non siamo riusciti a creare il tuo profilo. Riprova.";
      const { data: therapist, error: registerError } = await registerTherapist({
        fullName: therapistFullName,
        alboNumber: therapistAlboNumber,
      });
      if (registerError || !therapist) {
        return "Accesso riuscito, ma non siamo riusciti a registrarti come logopedista. Riprova.";
      }
      navigation.navigate("TherapistCodeReady", { inviteCode: therapist.invite_code, fullName: therapist.full_name });
      return null;
    }

    if (loginOnly) {
      const { data: existingChildren, error: childrenError } = await getChildren();
      if (childrenError) return "Accesso riuscito, ma non siamo riusciti a recuperare il tuo profilo. Riprova.";
      if (existingChildren && existingChildren.length > 0) {
        setChildrenRoster(
          existingChildren.map((c) => ({ id: c.id, displayName: c.name, avatarId: c.avatar_id || DEFAULT_AVATAR_ID }))
        );
        const child = existingChildren[0];
        await hydrateFromSupabase({
          id: child.id,
          name: child.name,
          audioRecordingConsent: child.audio_recording_consent,
          avatarId: child.avatar_id,
          gender: child.gender,
        });
        navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
        return null;
      }
      // Account esistente ma nessun bambino ancora creato (es. registrazione mai finita) —
      // avvia l'onboarding del primo figlio; l'email è già verificata, si salta
      // ParentEmailScreen (che la richiederebbe di nuovo da zero).
      navigation.navigate("ChildName", {});
      return null;
    }

    const { error: profileError } = await ensureParentProfile();
    if (profileError) return "Accesso riuscito, ma non siamo riusciti a creare il tuo profilo. Riprova.";
    const { data: child, error: childError } = await createChild({ name, birthdate, gender, avatarId });
    if (childError) return "Accesso riuscito, ma non siamo riusciti a salvare il profilo di " + name + ". Riprova.";
    if (child) {
      setSupabaseChildId(child.id);
      // Senza questo, il bambino appena creato non comparirebbe nel selettore (ChildSwitcher)
      // finché l'app non viene riavviata (vedi il ripristino sessione in App.tsx, che
      // ripopola il roster da zero da Supabase) — bug segnalato: aggiungendo un secondo
      // bambino con "Aggiungi un altro bambino", il roster locale partiva vuoto e finiva
      // per contenere SOLO il nuovo, facendo sembrare sparito il primo.
      setChildrenRoster([...children, { id: child.id, displayName: child.name, avatarId: child.avatar_id || DEFAULT_AVATAR_ID }]);
    }
    setChildInfo({ displayName: name, gender, avatarId });
    if (sounds && sounds.length > 0) startSelfDirectedPlan(sounds);
    navigation.navigate("Paywall");
    return null;
  }

  async function submit() {
    if (!email.includes("@") || password.length < 6) return;
    setLoading(true);
    setErrorMsg(null);
    setShowRegisterHint(false);

    if (loginOnly) {
      const { error } = await signInWithPassword(email.trim(), password);
      if (error) {
        setLoading(false);
        setErrorMsg("Email o password errati.");
        setShowRegisterHint(true);
        return;
      }
    } else {
      const { data, error } = await signUpWithPassword(email.trim(), password);
      if (error) {
        setLoading(false);
        setErrorMsg(
          /already registered|already exists/i.test(error.message)
            ? "Esiste già un account con questa email — prova ad accedere invece di registrarti."
            : "Non siamo riusciti a creare l'account. Controlla la connessione e riprova."
        );
        return;
      }
      if (!data?.session) {
        // La conferma email è attiva lato Supabase (oggi non dovrebbe esserlo, ma non è
        // garantito da qui): niente sessione finché non si clicca il link ricevuto, quindi
        // non si può proseguire come se l'accesso fosse già avvenuto.
        setLoading(false);
        setErrorMsg("Ti abbiamo mandato un'email di conferma — aprila per completare la registrazione.");
        return;
      }
    }

    const resultError = await completeSignIn();
    setLoading(false);
    if (resultError) setErrorMsg(resultError);
  }

  async function handleOAuth(provider: "google" | "facebook") {
    setOauthLoading(provider);
    setErrorMsg(null);
    const { error, cancelled } = (await (provider === "google" ? signInWithGoogle() : signInWithFacebook())) as {
      error: Error | null;
      cancelled?: boolean;
    };
    if (cancelled) {
      setOauthLoading(null);
      return;
    }
    if (error) {
      setOauthLoading(null);
      setErrorMsg(`Accesso con ${provider === "google" ? "Google" : "Facebook"} non riuscito. Riprova.`);
      return;
    }
    const resultError = await completeSignIn();
    setOauthLoading(null);
    if (resultError) setErrorMsg(resultError);
  }

  if (!isSupabaseConfigured) {
    // Nessuna EXPO_PUBLIC_SUPABASE_ANON_KEY impostata: non blocchiamo lo sviluppo/i test
    // locali, si prosegue come prima (solo store locale, nessuna persistenza reale). Per il
    // logopedista non ha senso un percorso "locale": il codice invito deve essere vero e
    // persistito, quindi qui si ferma con un messaggio invece di fingere una registrazione.
    if (role === "therapist") {
      return (
        <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
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
      <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.title}>Accesso non ancora configurato</Text>
        <Text style={styles.subtitle}>
          Il backend non è collegato in questo ambiente — continuiamo senza salvare i dati.
        </Text>
        <View style={{ flex: 1 }} />
        <ContinueButton
          onPress={() => {
            setChildInfo({ displayName: name, gender, avatarId });
            if (sounds && sounds.length > 0) startSelfDirectedPlan(sounds);
            navigation.navigate("Paywall");
          }}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={[styles.container, { paddingTop: insets.top + 16 }]} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={styles.back}>←</Text>
      </Pressable>

      <Text style={styles.title}>{loginOnly ? "Accedi" : role === "therapist" ? "Registrati come logopedista" : "Crea il tuo account"}</Text>
      <Text style={styles.subtitle}>
        {role === "therapist"
          ? "Email e password per creare il tuo profilo logopedista."
          : loginOnly
            ? "Entra con l'email e la password che hai usato per registrarti."
            : `Email e password per salvare i progressi di ${name}.`}
      </Text>
      {resetSuccessMsg && <Text style={styles.successText}>{resetSuccessMsg}</Text>}
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="La tua email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        style={styles.input}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder={loginOnly ? "Password" : "Crea una password (almeno 6 caratteri)"}
        secureTextEntry
        autoCapitalize="none"
        autoComplete={loginOnly ? "password" : "new-password"}
        style={styles.input}
      />
      {loginOnly && (
        <Pressable onPress={() => navigation.navigate("ForgotPassword", { email })} style={styles.forgotLink}>
          <Text style={styles.forgotLinkText}>Password dimenticata?</Text>
        </Pressable>
      )}
      {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
      {showRegisterHint && (
        <Pressable onPress={() => navigation.navigate("Trust")} style={styles.retryLink}>
          <Text style={styles.retryLinkText}>Non hai un account? Registrati</Text>
        </Pressable>
      )}
      <View style={{ flex: 1 }} />
      {loading ? (
        <ActivityIndicator color={C.primary} />
      ) : (
        <ContinueButton
          label={loginOnly ? "Accedi" : "Continua"}
          disabled={!email.includes("@") || password.length < 6}
          onPress={submit}
        />
      )}

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>oppure</Text>
        <View style={styles.dividerLine} />
      </View>

      <Pressable
        onPress={() => handleOAuth("google")}
        disabled={!!oauthLoading}
        style={[styles.oauthBtn, oauthLoading && oauthLoading !== "google" && { opacity: 0.4 }]}
      >
        {oauthLoading === "google" ? (
          <ActivityIndicator color={C.text} />
        ) : (
          <Text style={styles.oauthBtnText}>Continua con Google</Text>
        )}
      </Pressable>
      <Pressable
        onPress={() => handleOAuth("facebook")}
        disabled={!!oauthLoading}
        style={[styles.oauthBtn, { marginTop: 10 }, oauthLoading && oauthLoading !== "facebook" && { opacity: 0.4 }]}
      >
        {oauthLoading === "facebook" ? (
          <ActivityIndicator color={C.text} />
        ) : (
          <Text style={styles.oauthBtnText}>Continua con Facebook</Text>
        )}
      </Pressable>
    </KeyboardAvoidingView>
  );
}

// Recupero password, in 2 passi — raggiunta dal link "Password dimenticata?" sopra. Non crea
// una sessione "normale": verifyPasswordResetCode apre una sessione temporanea di tipo
// recovery, usata solo per impostare la nuova password (updatePassword), poi si torna al
// login vero e proprio per entrare con le nuove credenziali (più semplice e più sicuro che
// provare a dedurre qui se l'account ha già dei bambini).
export function ForgotPasswordScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState(route?.params?.email || "");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<"email" | "reset">("email");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function sendResetCode() {
    if (!email.includes("@")) return;
    setLoading(true);
    setErrorMsg(null);
    const { error } = await requestPasswordReset(email.trim());
    setLoading(false);
    if (error) {
      setErrorMsg("Non siamo riusciti a inviare il codice. Controlla la connessione e riprova.");
      return;
    }
    setStep("reset");
  }

  async function resetPassword() {
    if (code.trim().length < 4 || newPassword.length < 6) return;
    setLoading(true);
    setErrorMsg(null);
    const { error: verifyError } = await verifyPasswordResetCode(email.trim(), code.trim());
    if (verifyError) {
      setLoading(false);
      setErrorMsg("Codice non valido o scaduto. Richiedine uno nuovo.");
      return;
    }
    const { error: updateError } = await updatePassword(newPassword);
    setLoading(false);
    if (updateError) {
      setErrorMsg("Non siamo riusciti a impostare la nuova password. Riprova.");
      return;
    }
    navigation.navigate("Login", { passwordResetDone: true });
  }

  return (
    <KeyboardAvoidingView style={[styles.container, { paddingTop: insets.top + 16 }]} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={styles.back}>←</Text>
      </Pressable>

      {step === "email" ? (
        <>
          <Text style={styles.title}>Password dimenticata</Text>
          <Text style={styles.subtitle}>Ti mandiamo un codice via email per impostarne una nuova.</Text>
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
            <ContinueButton label="Invia il codice" disabled={!email.includes("@")} onPress={sendResetCode} />
          )}
        </>
      ) : (
        <>
          <Text style={styles.title}>Inserisci il codice</Text>
          <Text style={styles.subtitle}>Te lo abbiamo appena mandato a {email}. Poi scegli la nuova password.</Text>
          <TextInput
            value={code}
            onChangeText={setCode}
            placeholder="Codice"
            keyboardType="number-pad"
            maxLength={10}
            style={styles.input}
          />
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Nuova password (almeno 6 caratteri)"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            style={styles.input}
          />
          {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
          <View style={{ flex: 1 }} />
          {loading ? (
            <ActivityIndicator color={C.primary} />
          ) : (
            <>
              <ContinueButton label="Imposta la nuova password" disabled={code.trim().length < 4 || newPassword.length < 6} onPress={resetPassword} />
              <Pressable onPress={() => setStep("email")} style={styles.retryLink}>
                <Text style={styles.retryLinkText}>Usa un'altra email</Text>
              </Pressable>
            </>
          )}
        </>
      )}
    </KeyboardAvoidingView>
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
  container: { flex: 1, backgroundColor: C.bg, padding: 24 },
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
  successText: { color: C.jade, fontSize: 13.5, marginTop: 12, fontWeight: "600" },
  forgotLink: { alignSelf: "flex-end", marginTop: 10 },
  forgotLinkText: { color: C.jade, fontSize: 13.5, textDecorationLine: "underline" },
  cta: {
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
  },
  ctaText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  retryLink: { alignItems: "center", marginTop: 16 },
  retryLinkText: { color: C.subtext, textDecorationLine: "underline" },
  dividerRow: { flexDirection: "row", alignItems: "center", marginTop: 20, marginBottom: 14 },
  dividerLine: { flex: 1, height: 1, backgroundColor: C.line },
  dividerText: { color: C.subtext, fontSize: 12.5, marginHorizontal: 10 },
  oauthBtn: {
    borderWidth: 1.5,
    borderColor: C.line,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  oauthBtnText: { color: C.text, fontSize: 15.5, fontWeight: "700" },
});
