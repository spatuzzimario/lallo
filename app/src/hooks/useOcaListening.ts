import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import { isReasonableAttempt } from "../utils/speechMatch";

export type OcaMicStatus = "checking" | "unavailable" | "idle" | "listening";

// Riconoscimento vocale on-device per il Gioco dell'oca "ascolta e avanza" (brief blocco B).
// Principio non negoziabile: è un gioco, non un giudice — mai una valutazione clinica della
// pronuncia (vedi isReasonableAttempt), e mai un fallback silenzioso al cloud se il
// riconoscimento on-device non è disponibile (GDPR-K: "il gating gira solo on-device, nessun
// audio caricato"). Se il device non supporta il riconoscimento on-device per l'italiano (o su
// Android non ha ancora il pacchetto lingua scaricato), lo stato resta "unavailable" e il
// chiamante (GiocoDellOca) nasconde il microfono, lasciando solo il tocco per avanzare — che
// resta sempre disponibile, indipendentemente da questo hook.
export function useOcaListening(onResult: (matched: boolean) => void) {
  const [status, setStatus] = useState<OcaMicStatus>("checking");
  const targetRef = useRef<string>("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
          if (!cancelled) setStatus("unavailable");
          return;
        }
        // Su Android il riconoscimento davvero on-device richiede il pacchetto lingua
        // scaricato sul device — se manca, niente cloud come ripiego: il microfono resta
        // "unavailable" (vedi nota GDPR-K sopra), non un errore da mostrare al bambino.
        if (Platform.OS === "android") {
          const { installedLocales } = await ExpoSpeechRecognitionModule.getSupportedLocales({});
          const hasItalian = installedLocales.some((l) => l.toLowerCase().startsWith("it"));
          if (!hasItalian) {
            if (!cancelled) setStatus("unavailable");
            return;
          }
        }
        if (!cancelled) setStatus("idle");
      } catch {
        if (!cancelled) setStatus("unavailable");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Chiude sempre la sessione nativa di riconoscimento in corso quando il gioco viene
  // smontato (es. il bambino torna indietro a metà ascolto) — stesso principio del fix
  // sull'audio delle istruzioni: niente resta "in ascolto" dopo che si è cambiato schermata.
  useEffect(() => {
    return () => {
      try {
        ExpoSpeechRecognitionModule.abort();
      } catch {
        // no-op: può fallire se il modulo non ha mai avviato una sessione, innocuo.
      }
    };
  }, []);

  useSpeechRecognitionEvent("result", (event) => {
    if (!event.isFinal) return;
    const transcript = event.results[0]?.transcript ?? "";
    setStatus("idle");
    onResult(isReasonableAttempt(transcript, targetRef.current));
  });

  useSpeechRecognitionEvent("error", (event) => {
    // "aborted" arriva anche quando siamo NOI a chiamare cancel() (tocco su "Dillo!" mentre si
    // ascolta, o cambio schermata) — non è un tentativo fallito del bambino, va ignorato.
    if (event.error === "aborted") {
      setStatus("idle");
      return;
    }
    // Il device ha smesso di supportare il riconoscimento on-device a metà sessione (raro,
    // es. permesso revocato): meglio disabilitare il microfono per il resto della sessione
    // che continuare a fallire in silenzio.
    if (event.error === "service-not-allowed" || event.error === "language-not-supported") {
      setStatus("unavailable");
      onResult(false);
      return;
    }
    setStatus("idle");
    onResult(false);
  });

  const listen = useCallback(async (targetWord: string) => {
    targetRef.current = targetWord;
    try {
      const perms = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!perms.granted) {
        setStatus("unavailable");
        return;
      }
    } catch {
      setStatus("unavailable");
      return;
    }
    setStatus("listening");
    ExpoSpeechRecognitionModule.start({
      lang: "it-IT",
      interimResults: false,
      continuous: false,
      // Non negoziabile (GDPR-K): se il device non supporta il riconoscimento on-device per
      // questa lingua, start() fallisce ed emette un evento "error" — non c'è mai un ripiego
      // automatico su un riconoscimento via rete.
      requiresOnDeviceRecognition: true,
      contextualStrings: [targetWord],
      // Empiricamente più affidabile di "dictation" per singole parole brevi (limite noto
      // della libreria sul riconoscimento di una sola parola, non specifico dell'italiano).
      iosTaskHint: "confirmation",
    });
  }, []);

  const cancel = useCallback(() => {
    ExpoSpeechRecognitionModule.abort();
  }, []);

  return { status, listen, cancel };
}
