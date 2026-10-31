import { useCallback, useState } from "react";

export type OcaMicStatus = "checking" | "unavailable" | "idle" | "listening";

// Variante web di useOcaListening.ts — Metro la sceglie al posto del file nativo su
// Platform.OS === "web" (suffisso .web.ts), così expo-speech-recognition (modulo nativo,
// nessuno stub garantito per browser) non viene mai nemmeno importato qui. Scelta esplicita
// del founder: sul sito il Gioco dell'oca non ha un riconoscimento vocale reale, resta solo
// il tocco per avanzare — lo stato "unavailable" è già gestito dal chiamante (GiocoDellOca)
// esattamente come quando il riconoscimento manca su un telefono vero.
export function useOcaListening(_onResult: (matched: boolean) => void) {
  const [status] = useState<OcaMicStatus>("unavailable");

  const listen = useCallback(async (_targetWord: string) => {}, []);
  const cancel = useCallback(() => {}, []);

  return { status, listen, cancel };
}
