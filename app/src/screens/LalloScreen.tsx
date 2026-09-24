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
import { useGamificationStore, getDayStreak } from "../store/useGamificationStore";
import { getHunger, getMood, LALLO_MOOD_COPY, LALLO_FOODS, LalloMood } from "../constants/lalloPet";
import { getWordImage } from "../constants/wordImage";
import { useVoice } from "../hooks/useVoice";

// Presentazione lunga di Lallo, sentita/vista solo la prima volta che si apre questa tab
// (settembre 2026, feedback: "Lallo si presenta solo la prima volta, poi solo le
// istruzioni del gioco") — spiega chi è e a cosa serve, prima di lasciare il bambino
// scegliere cosa fare. Le volte successive si sente solo la riga breve legata all'umore
// (vedi più sotto), come già prima.
const INTRO_TEXT =
  "Ciao, sono Lallo! Sono un pappagallo e ripeto tutto quello che mi dici — sono qui per " +
  "aiutarti a esercitarti con le parole. Puoi darmi da mangiare, parlarmi, oppure premere " +
  "Gioca per allenarti insieme a me!";

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
const POKE_REACTIONS = [
  { text: "Hihi!", slug: "lallo_poke_1" },
  { text: "Che solletico!", slug: "lallo_poke_2" },
  { text: "Ehi!", slug: "lallo_poke_3" },
  { text: "Mi piace giocare con te!", slug: "lallo_poke_4" },
  { text: "Ahah, di nuovo!", slug: "lallo_poke_5" },
];

// NOTA SU COSA È REALMENTE FATTIBILE QUI (senza asset di animazione veri): Lallo non ha
// fotogrammi disegnati per masticare/parlare come un vero personaggio animato (servirebbe
// uno sprite sheet o un'animazione Lottie/Spine appositi, non ancora prodotti) — quello che
// c'è sotto è un'illusione di vita costruita SOLO con l'Animated API nativa sulle 3
// immagini statiche già esistenti (felice/neutro/affamato): un piccolo dondolio continuo
// (idle), una reazione "boing" al tocco diretto, e una reazione più marcata quando viene
// sfamato. È un buon compromesso per l'MVP, non un vero personaggio animato frame-by-frame.
export default function LalloScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const profile = useGamificationStore((s) => s.profile);
  const feedLallo = useGamificationStore((s) => s.feedLallo);
  const talkToLallo = useGamificationStore((s) => s.talkToLallo);
  const markIntroSeen = useGamificationStore((s) => s.markIntroSeen);
  const hasConsent = useGamificationStore((s) => !!s.profile?.audioRecordingConsent);
  const { speak } = useVoice();

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  const hunger = useMemo(() => getHunger(profile?.lalloPet.lastFedAt ?? null), [profile?.lalloPet.lastFedAt, now]);
  const mood = getMood(hunger);
  const moodCopy = LALLO_MOOD_COPY[mood];
  const dayStreak = useMemo(() => getDayStreak(profile?.sessionLog ?? []), [profile?.sessionLog]);

  // Mostra la presentazione lunga solo alla prima apertura di questa tab in assoluto (per
  // questa sessione dell'app — vedi nota su introsSeen in types/gamification.ts). Stato
  // locale invece di leggere direttamente introsSeen dal profilo nel render: altrimenti la
  // bolla sparirebbe al primo re-render dopo markIntroSeen(), un istante dopo essere apparsa.
  const [showIntro, setShowIntro] = useState(false);

  // Istruzione vocale ogni volta che il bambino apre questa tab (non solo la prima volta,
  // vedi stesso ragionamento in GiochiScreen) — tranne la primissima volta in assoluto, che
  // sente la presentazione lunga invece della riga breve sull'umore.
  useFocusEffect(
    useCallback(() => {
      const seen = useGamificationStore.getState().profile?.introsSeen.lallo;
      if (!seen) {
        setShowIntro(true);
        speak(INTRO_TEXT, "lallo_intro");
        markIntroSeen("lallo");
        return;
      }
      setShowIntro(false);
      if (mood === "affamato") speak("Lallo ha fame! Trascina un cibo su di lui per sfamarlo", "lallo_ha_fame");
      else speak("Trascina un cibo su Lallo per sfamarlo, o tocca il microfono per parlare con lui!", "lallo_trascina_cibo");
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
    const reaction = POKE_REACTIONS[Math.floor(Math.random() * POKE_REACTIONS.length)];
    speak(reaction.text, reaction.slug);
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
    speak("Mmm, che buono! Grazie!", "lallo_grazie_cibo");
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
    if (!hasConsent) {
      navigation.navigate("MicConsent");
      return;
    }
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
      <View style={styles.header}>
        <Text style={styles.title}>Lallo</Text>
        {dayStreak > 0 && (
          <View style={styles.streakPill}>
            <Text style={styles.streakText}>🔥 {dayStreak} {dayStreak === 1 ? "giorno" : "giorni"} di fila</Text>
          </View>
        )}
      </View>

      {showIntro && (
        <View style={styles.introBubble}>
          <Text style={styles.introText}>{INTRO_TEXT}</Text>
        </View>
      )}

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

      <Pressable style={styles.playBtn} onPress={() => navigation.navigate("Giochi")}>
        <Text style={styles.playBtnText}>🎮 Vai a giocare con Lallo!</Text>
      </Pressable>

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
            Tocca il microfono per attivarlo: serve il consenso di un genitore per registrare la voce.
          </Text>
        )}
        {permissionDenied && (
          <Text style={styles.warnNote}>Il microfono non è autorizzato per Lallo nelle impostazioni del telefono.</Text>
        )}
        <View style={styles.talkRow}>
          <Pressable
            style={[styles.micBtn, recorderState.isRecording && styles.micBtnActive, !hasConsent && styles.micBtnLocked]}
            onPress={recorderState.isRecording ? stopRecording : startRecording}
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
            ? "Tocca il microfono per attivarlo"
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


const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg, padding: 18 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  title: { fontSize: 20, fontWeight: "800", color: C.ink },
  streakPill: { backgroundColor: C.mist, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 10 },
  streakText: { fontSize: 11.5, fontWeight: "600", color: C.jadeDeep },
  introBubble: {
    backgroundColor: "#fff", borderRadius: 16, borderWidth: 1.5, borderColor: C.jade,
    padding: 14, marginBottom: 14,
  },
  introText: { fontSize: 13, color: C.ink, lineHeight: 19 },
  playBtn: {
    backgroundColor: C.coral, borderRadius: 16, paddingVertical: 14, alignItems: "center",
    marginBottom: 18, shadowColor: C.coral, shadowOpacity: 0.25, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  playBtnText: { color: "#fff", fontSize: 15.5, fontWeight: "800" },
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
