import React from "react";
import { Image } from "react-native";

// Variante web di LalloRig.tsx — Metro la sceglie al posto del file nativo su
// Platform.OS === "web" (suffisso .web.tsx), così rive-react-native non viene mai importato
// qui. Il rig Rive vero (idle/coccola/nutrito/ascolta/ripete/festeggia/sonno) non ha
// equivalente su browser: il fallback è l'illustrazione statica di Lallo già usata altrove
// nell'app (onboarding, Album, splash) — stesso identico mascotte, solo senza animazione.
// `riveRef` è accettato e ignorato: su web i trigger di useLalloMachine (fireTouch/fireFeed/
// ecc.) restano no-op innocui perché quella ref non punta a nessun componente Rive reale.
export function LalloRig({ size }: { riveRef: React.RefObject<any>; size: number }) {
  return (
    <Image
      source={require("../../assets/lallo-splash.png")}
      resizeMode="contain"
      style={{ width: size, height: size }}
    />
  );
}
