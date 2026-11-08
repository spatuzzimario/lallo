import React, { useEffect, useRef, useState } from "react";
import { Image } from "react-native";
import { Asset } from "expo-asset";
import { Rive, Layout, Fit } from "@rive-app/canvas";

// Variante web di LalloRig.tsx — Metro la sceglie al posto del file nativo su
// Platform.OS === "web" (suffisso .web.tsx), così rive-react-native (modulo nativo) non viene
// mai importato qui. Non è più un'illustrazione statica: @rive-app/canvas è il runtime web
// ufficiale di Rive, lo STESSO rig .riv (app/assets/lallo.riv) e la stessa state machine
// girano già nella demo della landing page (landing/index.html, initLalloRive) — qui si
// riusa esattamente quel meccanismo, solo dentro un componente React invece di script vanilla.
//
// riveRef qui non è un vero ref React verso un componente nativo (come su mobile): è un
// oggetto su cui ASSEGNIAMO a mano, dopo il caricamento, un piccolo adattatore con
// setInputState/fireState — la stessa identica forma dell'API di rive-react-native — così
// useLalloMachine.ts (fireTouch/fireFeed/ecc.) funziona senza sapere se sta parlando col
// rig nativo o con quello web.
export function LalloRig({ riveRef, size }: { riveRef: React.RefObject<any>; size: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const riveInstanceRef = useRef<Rive | null>(null);
  const inputsRef = useRef<Record<string, any>>({});
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    // react-native-web non implementa Image.resolveAssetSource (esiste solo lato nativo) —
    // expo-asset invece risolve require() in un URI reale su entrambe le piattaforme, qui
    // serve solo per leggere .uri, sincrono, nessun downloadAsync() necessario sul web.
    const asset = Asset.fromModule(require("../../assets/lallo.riv"));
    const instance = new Rive({
      src: asset.uri,
      canvas: canvasRef.current,
      stateMachines: "LalloStateMachine",
      autoplay: true,
      layout: new Layout({ fit: Fit.Contain }),
      onLoad: () => {
        instance.resizeDrawingSurfaceToCanvas();
        const inputs = instance.stateMachineInputs("LalloStateMachine") || [];
        const map: Record<string, any> = {};
        inputs.forEach((input: any) => {
          map[input.name] = input;
        });
        inputsRef.current = map;
      },
      onLoadError: () => setFailed(true),
    });
    riveInstanceRef.current = instance;
    riveRef.current = {
      setInputState: (_stateMachineName: string, inputName: string, value: boolean | number) => {
        const input = inputsRef.current[inputName];
        if (input) input.value = value;
      },
      fireState: (_stateMachineName: string, inputName: string) => {
        const input = inputsRef.current[inputName];
        if (input) input.fire();
      },
    };
    return () => {
      instance.cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    riveInstanceRef.current?.resizeDrawingSurfaceToCanvas();
  }, [size]);

  if (failed) {
    return <Image source={require("../../assets/lallo-splash.png")} resizeMode="contain" style={{ width: size, height: size }} />;
  }

  return <canvas ref={canvasRef} width={size} height={size} style={{ width: size, height: size }} />;
}
