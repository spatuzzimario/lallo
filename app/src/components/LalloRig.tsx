import React from "react";
import Rive, { Fit, RiveRef } from "rive-react-native";

// Isolato in un file a parte (con una variante .web.tsx accanto) perché rive-react-native è
// un modulo nativo: importarlo direttamente dentro LalloScreen.tsx rischierebbe di far
// fallire il caricamento dell'intera schermata quando Metro la compila per il web, dove
// questo modulo non ha garanzia di uno stub. Qui LalloScreen.tsx vede solo riveRef/size,
// non sa nulla della libreria sotto.
export function LalloRig({ riveRef, size }: { riveRef: React.RefObject<RiveRef | null>; size: number }) {
  return (
    <Rive
      ref={riveRef}
      source={require("../../assets/lallo.riv")}
      artboardName="Lallo"
      stateMachineName="LalloStateMachine"
      autoplay
      fit={Fit.Contain}
      style={{ width: size, height: size }}
    />
  );
}
