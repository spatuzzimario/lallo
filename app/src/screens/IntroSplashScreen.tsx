import React, { useEffect, useRef } from "react";
import { Animated, Easing, Image, StyleSheet } from "react-native";

// Animazione di apertura leggera: nessun video, solo l'illustrazione di Lallo (Higgsfield)
// animata con l'API Animated nativa di React Native — rimbalzo all'ingresso + un piccolo
// saluto con l'ala, poi dissolvenza verso l'app vera. ~1.7s totali, un solo passaggio.
const INTRO_DURATION_MS = 1700;

export default function IntroSplashScreen({ onDone }: { onDone: () => void }) {
  const scale = useRef(new Animated.Value(0.6)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.08,
        duration: 420,
        easing: Easing.out(Easing.back(1.8)),
        useNativeDriver: true,
      }),
      Animated.timing(scale, { toValue: 1, duration: 180, useNativeDriver: true }),
      // saluto con l'ala: un paio di piccole oscillazioni
      Animated.sequence([
        Animated.timing(rotate, { toValue: -1, duration: 170, useNativeDriver: true }),
        Animated.timing(rotate, { toValue: 1, duration: 170, useNativeDriver: true }),
        Animated.timing(rotate, { toValue: -0.6, duration: 140, useNativeDriver: true }),
        Animated.timing(rotate, { toValue: 0, duration: 140, useNativeDriver: true }),
      ]),
    ]).start();

    const t = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 280, useNativeDriver: true }).start(({ finished }) => {
        if (finished) onDone();
      });
    }, INTRO_DURATION_MS);
    return () => clearTimeout(t);
  }, []);

  const rotateDeg = rotate.interpolate({ inputRange: [-1, 1], outputRange: ["-8deg", "8deg"] });

  return (
    <Animated.View style={[styles.container, { opacity }]} pointerEvents="none">
      <Animated.View style={{ transform: [{ scale }, { rotate: rotateDeg }] }}>
        <Image source={require("../../assets/lallo-splash.png")} style={styles.image} resizeMode="contain" fadeDuration={0} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FBF6EE",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    elevation: 999,
  },
  image: { width: 240, height: 240 },
});
