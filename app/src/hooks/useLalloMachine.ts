import { useCallback, useEffect, useRef, useState } from "react";

// Stati di reazione di Lallo — i nomi sono pensati per restare identici quando arriverà il
// rig Rive vero (vedi brief "companion interattivo"): oggi guidano solo le animazioni
// Animated del placeholder in LalloScreen, ma saranno gli stessi trigger passati alla
// state machine del file .riv, così quel giorno cambia solo chi ascolta fire(), non chi
// lo chiama in giro per l'app.
export type LalloState = "idle" | "poked" | "fed" | "listening" | "repeating" | "celebrating" | "sleepy";
export type LalloTrigger = "poke" | "feed" | "listenStart" | "listenStop" | "repeat" | "celebrate";

const TRIGGER_TO_STATE: Record<LalloTrigger, LalloState> = {
  poke: "poked",
  feed: "fed",
  listenStart: "listening",
  listenStop: "idle",
  repeat: "repeating",
  celebrate: "celebrating",
};

// Stati "reattivi": tornano da soli a idle dopo un po'. listening invece resta finché non
// arriva esplicitamente listenStop (la registrazione può durare quanto vuole il bambino).
const AUTO_RETURN_MS: Partial<Record<LalloState, number>> = {
  poked: 900,
  fed: 1200,
  repeating: 1800,
  celebrating: 2400,
};

const SLEEPY_AFTER_MS = 60_000; // inattività su questa schermata prima che Lallo si addormenti

export function useLalloMachine() {
  const [state, setState] = useState<LalloState>("idle");
  const returnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sleepyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const armSleepyTimer = useCallback(() => {
    if (sleepyTimer.current) clearTimeout(sleepyTimer.current);
    sleepyTimer.current = setTimeout(() => setState("sleepy"), SLEEPY_AFTER_MS);
  }, []);

  useEffect(() => {
    armSleepyTimer();
    return () => {
      if (sleepyTimer.current) clearTimeout(sleepyTimer.current);
      if (returnTimer.current) clearTimeout(returnTimer.current);
    };
  }, [armSleepyTimer]);

  const fire = useCallback(
    (trigger: LalloTrigger) => {
      if (returnTimer.current) clearTimeout(returnTimer.current);
      const nextState = TRIGGER_TO_STATE[trigger];
      setState(nextState);
      armSleepyTimer(); // qualunque interazione rimanda il sonno

      const autoReturn = AUTO_RETURN_MS[nextState];
      if (autoReturn) {
        returnTimer.current = setTimeout(() => setState("idle"), autoReturn);
      }
    },
    [armSleepyTimer]
  );

  return { state, fire };
}
