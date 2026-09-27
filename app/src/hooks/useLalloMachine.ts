import { useCallback, useEffect, useRef, useState } from "react";
import type { RiveRef } from "rive-react-native";

// Nomi dell'artboard/state machine e degli input della state machine: sono il "contratto"
// stabile deciso col rig .riv (vedi lallo-companion/plan.md) — vanno tenuti identici a quelli
// dentro app/assets/lallo.riv. Se il rig viene rigenerato con nomi diversi, va aggiornato solo
// qui, non nei punti dell'app che chiamano fireTouch()/fireFeed()/ecc.
export const LALLO_STATE_MACHINE = "LalloStateMachine";

const SLEEPY_AFTER_MS = 60_000; // inattività su questa schermata prima che Lallo si addormenti

// Pilota la state machine del rig Rive di Lallo: espone verbi semplici (fireTouch, fireFeed,
// setListening, ecc.) invece di far conoscere ai chiamanti i nomi esatti degli input Rive.
// L'unico stato che serve tenere anche lato JS è "sta dormendo", perché la UI intorno al rig
// (il titolo "Lallo si è addormentato") deve saperlo per cambiare testo.
export function useLalloMachine(riveRef: React.RefObject<RiveRef | null>) {
  const [isSleepy, setIsSleepy] = useState(false);
  const sleepyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const armSleepyTimer = useCallback(() => {
    if (sleepyTimer.current) clearTimeout(sleepyTimer.current);
    sleepyTimer.current = setTimeout(() => {
      setIsSleepy(true);
      riveRef.current?.setInputState(LALLO_STATE_MACHINE, "boolSleepy", true);
    }, SLEEPY_AFTER_MS);
  }, [riveRef]);

  useEffect(() => {
    armSleepyTimer();
    return () => {
      if (sleepyTimer.current) clearTimeout(sleepyTimer.current);
    };
  }, [armSleepyTimer]);

  // Qualunque interazione sveglia Lallo e rimanda il sonno, come da contratto (vedi plan.md,
  // "Da sapere per l'integrazione"): il rig si riaddormenta da solo a fine reazione se
  // boolSleepy è rimasto true, quindi va sempre riportato a false prima di ogni trigger.
  const wake = useCallback(() => {
    setIsSleepy((was) => {
      if (was) riveRef.current?.setInputState(LALLO_STATE_MACHINE, "boolSleepy", false);
      return false;
    });
    armSleepyTimer();
  }, [riveRef, armSleepyTimer]);

  const fireTouch = useCallback(() => {
    wake();
    riveRef.current?.fireState(LALLO_STATE_MACHINE, "trigTouch");
  }, [riveRef, wake]);

  const fireFeed = useCallback(() => {
    wake();
    riveRef.current?.fireState(LALLO_STATE_MACHINE, "trigFeed");
  }, [riveRef, wake]);

  const fireRepeat = useCallback(() => {
    wake();
    riveRef.current?.fireState(LALLO_STATE_MACHINE, "trigRepeat");
  }, [riveRef, wake]);

  const fireCelebrate = useCallback(() => {
    wake();
    riveRef.current?.fireState(LALLO_STATE_MACHINE, "trigCelebrate");
  }, [riveRef, wake]);

  const setListening = useCallback(
    (value: boolean) => {
      wake();
      riveRef.current?.setInputState(LALLO_STATE_MACHINE, "boolListening", value);
    },
    [riveRef, wake]
  );

  return { isSleepy, fireTouch, fireFeed, fireRepeat, fireCelebrate, setListening };
}
