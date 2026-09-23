import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Image, Pressable, Animated, PanResponder, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import {
  useAudioRecorder,
  useAudioRecorderState,
  useAudioPlayer,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from "expo-audio";
import * as Speech from "expo-speech";
import { useGamificationStore } from "../store/useGamificationStore";
import { getHunger, getMood, LALLO_MOOD_COPY, LALLO_FOODS, LalloMood } from "../constants/lalloPet";
import { getWordImage } from "../constants/wordImage";

const C = {
  bg: "#FBF6EE", jade: "#137A6E", jadeDeep: "#0E5C53", coral: "#FF6A4D",
  ink: "#1F2E2B", inkSoft: "#4A5A56", line: "#D9CEBC", mist: "#E4EFEA",
};

const MOOD_IMAGES: Record<LalloMood, any> = {
  felice: require("../../assets/lallo-splash.png"),
  neutro: require("../../assets/lallo-pet-neutro.png"),
  affamato: require("../../assets/lallo-pet-affamato.png"),
};

// Frasi di reazione al tocco diretto su Lallo (stile Talking Tom, "poke") — non è mai la
// stessa per non stancare, e restano generiche/allegre, mai un vero dialogo intelligente:
// qui è solo audio preregistrato/di sistema, nessuna AI che genera risposte.
const POKE_REACTIONS = ["Hihi!", "Che solletico!", "Ehi!", "Mi piace giocare con te!", "Ahah, di nuovo!"];

// NOTA SU COSA È REALMENTE FATTIBILE QUI (senza asset di animazione veri): Lallo non ha
// fotogrammi disegnati per masticare/parlare come un vero personaggio animato (servirebbe
// uno sprite sheet o un'animazione Lottie/Spine appositi, non ancora prodotti) — quello che
// c'è sotto è un'illusione di vita costruita SOLO con l'Animated API nativa sulle 3
// immagini statiche già esistenti (felice/neutro/affamato): un piccolo dondolio continuo
// (idle), una reazione "boing" al tocco diretto, e una reazione più marcata quando viene
// sfamato. È un buon compromesso per l'MVP, non un vero personaggio animato frame-by-frame.
export default function LalloScreen() {
  const insets = useSafeAreaInsets();
  const profile = useGamificationStore((s) => s.profile);
  const feedLallo = useGamificationStore((s) => s.feedLallo);
  const talkToLallo = useGamificationStore((s) => s.talkToLallo);
  const hasConsent = useGamificationStore((s) => !!s.profile?.audioRecordingConsent);

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  const hunger = useMemo(() => getHunger(profile?.lalloPet.lastFedAt ?? null), [profile?.lalloPet.lastFedAt, now]);
  const mood = getMood(hunger);
  const moodCopy = LALLO_MOOD_COPY[mood];

  // Istruzione vocale ogni volta che il bambino apre questa tab (non solo la prima volta,
  // vedi stesso ragionamento in GiochiScreen).
  useFocusEffect(
    useCallback(() => {
      if (mood === "affamato") say("Lallo ha fame! Trascina un cibo su di lui per sfamarlo");
      else say("Trascina un cibo su Lallo per sfamarlo, o tocca il microfono per parlare con lui!");
    }, [mood])
  );

  // --- Lallo "vivo": dondolio continuo + reazione al tocco diretto + reazione al pasto ---
  const bob = useRef(new Animated.Value(0)).current;
  const petScale = useRef(new Animated.Value(1)).current;
  const petRotate = useRef(new Animated.Value(0)).current;
  const petBoxRef = useRef<View>(null);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(bob, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  const bobTranslate = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });

  function pokeLallo() {
    say(POKE_REACTIONS[Math.floor(Math.random() * POKE_REACTIONS.length)]);
    Animated.sequence([
      Animated.timing(petScale, { toValue: 1.12, duration: 120, useNativeDriver: true }),
      Animated.spring(petRotate, { toValue: 1, useNativeDriver: true, friction: 3 }),
      Animated.spring(petRotate, { toValue: -1, useNativeDriver: true, friction: 3 }),
      Animated.parallel([
        Animated.spring(petRotate, { toValue: 0, useNativeDriver: true }),
        Animated.spring(petScale, { toValue: 1, useNativeDriver: true }),
      ]),
    ]).start();
  }

  function eatReaction() {
    Animated.sequence([
      Animated.timing(petScale, { toValue: 1.25, duration: 150, useNativeDriver: true }),
      Animated.spring(petScale, { toValue: 1, useNativeDriver: true, friction: 3 }),
    ]).start();
  }

  function feed(food: string) {
    feedLallo();
    setJustFed(food);
    say("Mmm, che buono! Grazie!");
    eatReaction();
    setTimeout(() => setJustFed(null), 1200);
  }

  const [justFed, setJustFed] = useState<string | null>(null);

  // --- "Parla con Lallo": registra la voce del bambino e la ripete con l'effetto
  // pappagallo (velocità aumentata alza anche il pitch) — stesso meccanismo già validato
  // in precedenza, ora qui invece che come esercizio-fonema, perché è la feature virale
  // motivazionale del Tamagotchi, non legata a un suono specifico. Richiede lo stesso
  // consenso genitore del Registratore.
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const player = useAudioPlayer(recordedUri);

  async function startRecording() {
    if (!hasConsent) return;
    const perm = await requestRecordingPermissionsAsync();
    if (!perm.granted) {
      setPermissionDenied(true);
      return;
    }
    setPermissionDenied(false);
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    setRecordedUri(null);
    await recorder.prepareToRecordAsync();
    recorder.record();
  }

  async function stopRecording() {
    await recorder.stop();
    setRecordedUri(recorder.uri);
  }

  function repeatAsParrot() {
    if (!recordedUri) return;
    player.shouldCorrectPitch = false; // "effetto pappagallo": la velocità alza anche il pitch
    player.setPlaybackRate(1.6);
    player.seekTo(0);
    player.play();
    talkToLallo();
    eatReaction();
  }

  if (!profile) return null;

  const petRotateDeg = petRotate.interpolate({ inputRange: [-1, 1], outputRange: ["-6deg", "6deg"] });

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 16 }]}>
      <Text style={styles.title}>Lallo</Text>

      <View style={styles.petCard}>
        <View ref={petBoxRef} collapsable={false}>
          <Pressable onPress={pokeLallo}>
            <Animated.Image
              source={MOOD_IMAGES[mood]}
              style={[
                styles.petImage,
                { transform: [{ translateY: bobTranslate }, { scale: petScale }, { rotate: petRotateDeg }] },
              ]}
              resizeMode="contain"
            />
          </Pressable>
        </View>
        <Text style={styles.moodTitle}>{moodCopy.title}</Text>
        <Text style={styles.moodSub}>{moodCopy.sub}</Text>
        <View style={styles.hungerTrack}>
          <View style={[styles.hungerFill, { width: `${hunger}%` }, hunger < 33 && styles.hungerFillLow]} />
        </View>
      </View>

      <Text style={styles.sectionLabel}>TRASCINA UN CIBO SU LALLO PER SFAMARLO</Text>
      <View style={styles.foodRow}>
        {LALLO_FOODS.map((food) => {
          const img = getWordImage(food);
          return (
            <DraggableFood
              key={food}
              food={food}
              img={img}
              justFed={justFed === food}
              lalloRef={petBoxRef}
              onFeed={feed}
            />
          );
        })}
      </View>

      <Text style={styles.sectionLabel}>PARLA CON LALLO</Text>
      <View style={styles.talkCard}>
        {!hasConsent && (
          <Text style={styles.warnNote}>
            Serve il consenso di un genitore per registrare la voce. Vai su Genitori → Privacy e registrazioni per
            attivarlo.
          </Text>
        )}
        {permissionDenied && (
          <Text style={styles.warnNote}>Il microfono non è autorizzato per Lallo nelle impostazioni del telefono.</Text>
        )}
        <View style={styles.talkRow}>
          <Pressable
            style={[styles.micBtn, recorderState.isRecording && styles.micBtnActive, !hasConsent && styles.micBtnLocked]}
            onPress={recorderState.isRecording ? stopRecording : startRecording}
            disabled={!hasConsent}
          >
            <Text style={styles.micBtnText}>{!hasConsent ? "🔒" : recorderState.isRecording ? "⏸" : "🎤"}</Text>
          </Pressable>
          <Pressable
            style={[styles.parrotBtn, !recordedUri && { opacity: 0.35 }]}
            onPress={repeatAsParrot}
            disabled={!recordedUri}
          >
            <Text style={styles.micBtnText}>🦜</Text>
          </Pressable>
        </View>
        <Text style={styles.talkCap}>
          {!hasConsent
            ? " "
            : recorderState.isRecording
            ? "Sto registrando… tocca di nuovo per fermare"
            : recordedUri
            ? "Tocca il pappagallo per sentirlo ripetere!"
            : "Tocca il microfono e digli qualcosa"}
        </Text>
      </View>
    </View>
  );
}

// Tessera di cibo trascinabile: PanResponder + Animated (nessuna libreria di gesture in più
// — react-native-reanimated è già tra le dipendenze del progetto ma richiede il plugin
// Babel non ancora configurato, PanResponder invece è già incluso in React Native). Un tap
// secco (senza trascinamento) sfama comunque Lallo subito, come prima — il drag è
// l'interazione "divertente" in più, non sostituisce il tap per chi fatica a trascinare.
function DraggableFood({ food, img, justFed, lalloRef, onFeed }: {
  food: string; img: any; justFed: boolean; lalloRef: React.RefObject<View | null>; onFeed: (food: string) => void;
}) {
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;
  const [dragging, setDragging] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setDragging(true);
        Animated.spring(scale, { toValue: 1.15, useNativeDriver: false }).start();
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (_evt, gestureState) => {
        setDragging(false);
        Animated.spring(scale, { toValue: 1, useNativeDriver: false }).start();
        Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();

        const wasTap = Math.abs(gestureState.dx) < 6 && Math.abs(gestureState.dy) < 6;
        if (wasTap) {
          onFeed(food);
          return;
        }
        if (lalloRef.current) {
          lalloRef.current.measureInWindow((x, y, width, height) => {
            const { moveX, moveY } = gestureState;
            const overThePet = moveX >= x && moveX <= x + width && moveY >= y && moveY <= y + height;
            if (overThePet) onFeed(food);
          });
        }
      },
    })
  ).current;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      accessibilityLabel={`Dai da mangiare: ${food}`}
      style={[
        styles.foodTile,
        justFed && styles.foodTileFed,
        { zIndex: dragging ? 10 : 1, transform: [...pan.getTranslateTransform(), { scale }] },
      ]}
    >
      {img ? (
        <Image source={img} style={styles.foodImage} resizeMode="contain" />
      ) : (
        <Text style={styles.foodFallback}>{food}</Text>
      )}
    </Animated.View>
  );
}

function say(text: string) {
  Speech.stop();
  Speech.speak(text, { language: "it-IT", pitch: 1.05, rate: 0.92 });
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg, padding: 18 },
  title: { fontSize: 20, fontWeight: "800", color: C.ink, marginBottom: 12 },
  petCard: {
    backgroundColor: "#fff", borderRadius: 20, borderWidth: 1.5, borderColor: C.line,
    alignItems: "center", padding: 16, marginBottom: 18,
  },
  petImage: { width: 170, height: 170 },
  moodTitle: { fontSize: 17, fontWeight: "800", color: C.ink, marginTop: 6 },
  moodSub: { fontSize: 12.5, color: C.inkSoft, marginTop: 2, marginBottom: 12 },
  hungerTrack: { width: "100%", height: 12, backgroundColor: C.mist, borderRadius: 999, overflow: "hidden" },
  hungerFill: { height: "100%", backgroundColor: C.jade, borderRadius: 999 },
  hungerFillLow: { backgroundColor: C.coral },
  sectionLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5, color: C.inkSoft, marginBottom: 10 },
  foodRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 18 },
  foodTile: {
    width: 64, height: 64, borderRadius: 16, borderWidth: 1.5, borderColor: C.line,
    backgroundColor: "#fff", alignItems: "center", justifyContent: "center",
  },
  foodTileFed: { borderColor: C.jade, backgroundColor: C.mist },
  foodImage: { width: 44, height: 44 },
  foodFallback: { fontSize: 11, color: C.inkSoft, textAlign: "center" },
  talkCard: {
    backgroundColor: "#fff", borderRadius: 20, borderWidth: 1.5, borderColor: C.line,
    alignItems: "center", padding: 18,
  },
  talkRow: { flexDirection: "row", gap: 18 },
  micBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: C.coral, alignItems: "center", justifyContent: "center" },
  micBtnActive: { backgroundColor: "#E84B30" },
  micBtnLocked: { backgroundColor: "#B0A99A" },
  parrotBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: C.jade, alignItems: "center", justifyContent: "center" },
  micBtnText: { fontSize: 26, color: "#fff" },
  talkCap: { textAlign: "center", fontSize: 12, color: C.inkSoft, marginTop: 12 },
  warnNote: { textAlign: "center", fontSize: 11, color: "#B08900", fontStyle: "italic", marginBottom: 10 },
});
