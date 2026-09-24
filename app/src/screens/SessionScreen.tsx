import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Image, Pressable, ScrollView, StyleSheet, StyleProp, TextStyle } from "react-native";
import { useAudioPlayer } from "expo-audio";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  PhonemeKey,
  WORD_BANK,
  WordEntry,
  wordsFor,
  allWordsFor,
  syllableEntries,
  pickRandom,
  distractorPool,
  MINIMAL_PAIRS,
  isPremium,
} from "../constants/wordBank";
import { getWordImage } from "../constants/wordImage";
import { useGamificationStore } from "../store/useGamificationStore";
import { AttemptResult, ClinicalLevel, SessionResult, LEVEL_LABELS } from "../types/gamification";
import { useVoice } from "../hooks/useVoice";

type ExerciseType =
  | "caccia" | "memory" | "registratore" | "coppie" | "oca" | "sequenze"
  | "ripeti" | "ascolta" | "sillabe";

// Illustrazione reale della parola quando disponibile (vedi assets/illustrations/parole/),
// altrimenti l'emoji placeholder del word bank — copertura ancora parziale, generazione
// in corso (CLAUDE.md §2.6 "ogni parola ha un'immagine").
function WordVisual({ parola, emoji, size, textStyle, imageMarginTop }: {
  parola: string; emoji: string; size: number; textStyle: StyleProp<TextStyle>; imageMarginTop?: number;
}) {
  const img = getWordImage(parola);
  if (img) return <Image source={img} style={{ width: size, height: size, marginTop: imageMarginTop }} resizeMode="contain" />;
  return <Text style={textStyle}>{emoji}</Text>;
}

// TODO (nice-to-have, priorità bassa): video dimostrativi della posizione linguale/labiale
// per fonema, integrati in-app e scaricabili on-demand per singolo pacchetto-fonema (non
// tutta la libreria insieme, non link esterni a YouTube) — promemoria per il bambino, non
// sostituto della spiegazione del logopedista in seduta. Non ancora implementato. Casa
// naturale per questo: dentro SillabeIsolate (Livello 1), accanto alle 5 sillabe — è lì che
// il genitore/founder ha in mente un bambino che fa vedere il labiale delle 5 varianti
// vocaliche del suono, come rinforzo visivo prima di passare alla parola intera.

interface SessionParams {
  phonemeGroupId: string; // deve combaciare con una PhonemeKey del word bank
  level: ClinicalLevel;
  position?: "iniziale" | "mediana";
  exerciseType?: ExerciseType;
  // Prova rapida senza codice, non legata a un piano assegnato: non deve scrivere
  // progressi reali sul profilo (usata finché non esiste ancora un profilo bambino).
  demo?: boolean;
}

// Feedback sonoro per i giochi a scelta (Caccia al suono, Ascolta e scegli, Coppie minime,
// Memory): un suono immediato al tocco, prima ancora della pronuncia della parola, così il
// bambino sa subito se ha indovinato. "Sbagliato" resta incoraggiante, mai punitivo (CLAUDE.md
// §8: "mai punire l'errore, celebrare ogni tentativo") — niente buzzer, solo un invito a riprovare.
function useFeedbackSounds() {
  const correctPlayer = useAudioPlayer(require("../../assets/audio/lines/sess_risposta_giusta.mp3"));
  const wrongPlayer = useAudioPlayer(require("../../assets/audio/lines/sess_risposta_sbagliata.mp3"));

  function playCorrect() {
    correctPlayer.seekTo(0);
    correctPlayer.play();
  }
  function playWrong() {
    wrongPlayer.seekTo(0);
    wrongPlayer.play();
  }

  return { playCorrect, playWrong };
}

export default function SessionScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const params: SessionParams = route.params;
  const phonemeKey = params.phonemeGroupId as PhonemeKey;
  const position = params.position ?? "iniziale";
  const exerciseType = params.exerciseType ?? "caccia";
  const recordSession = useGamificationStore((s) => s.recordSession);
  const subscriptionActive = useGamificationStore((s) => !!s.profile?.subscriptionActive);
  const meta = WORD_BANK[phonemeKey];

  // Gate centrale: qualunque schermata mandi qui un fonema premium senza abbonamento
  // attivo viene rimbalzata al Paywall — un solo punto di applicazione invece di
  // ripetere il controllo in ogni schermata che avvia una sessione (Oggi, Giochi, ecc.).
  const locked = isPremium(phonemeKey) && !subscriptionActive;
  useEffect(() => {
    if (locked) navigation.replace("Paywall");
  }, [locked]);

  const [attempts, setAttempts] = useState<AttemptResult[]>([]);
  // Per stimare la durata della sessione, mostrata poi nella dashboard genitore — solo il
  // tempo dentro questo esercizio, dall'apertura al "Fatto" (non un vero time-on-task
  // articolatorio, solo un'approssimazione ragionevole per l'uso settimanale).
  const startedAtRef = useRef(Date.now());
  // Livello appena sbloccato da festeggiare prima di tornare a MainTabs — un overlay
  // custom invece di Alert.alert(), che su React Native Web è un no-op totale (nessuna UI,
  // nessuna callback): usarlo per il proseguimento della navigazione avrebbe bloccato
  // l'app sulla schermata dell'esercizio finito su web, senza modo di continuare.
  const [celebration, setCelebration] = useState<{ level: ClinicalLevel } | null>(null);
  // Feedback vocale sullo sblocco: molti bambini che usano l'app non sanno ancora leggere,
  // quindi il testo dell'overlay da solo non basta a indicargli cosa toccare per proseguire.
  const celebrationPlayer = useAudioPlayer(require("../../assets/audio/lines/sess_livello_sbloccato.mp3"));

  useEffect(() => {
    if (celebration) {
      celebrationPlayer.seekTo(0);
      celebrationPlayer.play();
    }
  }, [celebration]);

  function finishSession() {
    if (params.demo) {
      // Prova rapida senza codice: non c'è un piano assegnato dal logopedista su questo
      // fonema, quindi non scriviamo progressi reali sul profilo — torniamo semplicemente
      // all'anteprima del piano da cui si è partiti.
      navigation.goBack();
      return;
    }

    // Cattura lo stato del livello PRIMA di scrivere la sessione, per poter mostrare una
    // festa quando lo sblocco del livello successivo avviene proprio ora — altrimenti
    // l'avanzamento nella mappa (vedi GiochiScreen) succede silenziosamente in background
    // e non è mai chiaro al bambino/genitore che è successo qualcosa.
    const beforeGroup = useGamificationStore
      .getState()
      .profile?.phonemeGroups.find((g) => g.id === params.phonemeGroupId);
    const wasMastered = beforeGroup?.levels.find((l) => l.level === params.level)?.status === "mastered";

    const result: SessionResult = {
      phonemeGroupId: params.phonemeGroupId,
      level: params.level,
      exerciseType,
      attempts,
      completedAt: new Date().toISOString(),
      durationSeconds: Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000)),
    };
    recordSession(result);

    const afterGroup = useGamificationStore
      .getState()
      .profile?.phonemeGroups.find((g) => g.id === params.phonemeGroupId);
    const justMastered =
      !wasMastered && afterGroup?.levels.find((l) => l.level === params.level)?.status === "mastered";
    const nextLevel = afterGroup?.levels.find((l) => l.level === (params.level + 1) as ClinicalLevel);
    const justUnlocked = justMastered && nextLevel?.status === "available";

    if (justUnlocked && nextLevel) {
      setCelebration({ level: nextLevel.level });
      return;
    }
    // goBack() invece di navigate("MainTabs"): l'unico modo per arrivare qui è da
    // GiochiScreen, quindi MainTabs è già subito sotto in pila — navigate("MainTabs") lo
    // "ritrova" ma nel farlo perde lo stato locale di GiochiScreen (il suono scelto torna
    // sempre a quello di default invece di restare su quello appena giocato). goBack()
    // torna alla stessa istanza dello schermo senza toccarne lo stato, esattamente come fa
    // già la freccia "‹" qui sopra.
    navigation.goBack();
  }

  function logAttempt(word: string, correct: boolean) {
    setAttempts((prev) => [
      ...prev,
      { targetPhoneme: phonemeKey, confidenceScore: correct ? 1 : 0.35, starsAwarded: correct ? 3 : 1 },
    ]);
  }

  if (!meta || locked) return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <View>
          <Text style={styles.title}>
            {exerciseType === "caccia" && "Caccia al suono"}
            {exerciseType === "memory" && "Memory"}
            {exerciseType === "registratore" && "Registratore"}
            {exerciseType === "coppie" && "Coppie minime"}
            {exerciseType === "oca" && "Gioco dell'oca"}
            {exerciseType === "sequenze" && "Sequenze illustrate"}
            {exerciseType === "ripeti" && "Ripeti"}
            {exerciseType === "ascolta" && "Ascolta e scegli"}
            {exerciseType === "sillabe" && "Suono isolato"}
          </Text>
          {/* Rende visibile la difficoltà scelta: suono + livello clinico + posizione —
              prima non c'era modo di sapere, dentro l'esercizio, cosa si stava giocando. */}
          <Text style={styles.subtitle}>
            {meta.label} · Livello {params.level} · {LEVEL_LABELS[params.level]}
          </Text>
        </View>
      </View>

      {exerciseType === "caccia" && (
        <CacciaAlSuono phonemeKey={phonemeKey} position={position} onAttempt={logAttempt} onDone={finishSession} />
      )}
      {exerciseType === "memory" && (
        <MemoryGame phonemeKey={phonemeKey} level={params.level} onAttempt={logAttempt} onDone={finishSession} />
      )}
      {exerciseType === "registratore" && (
        <Registratore phonemeKey={phonemeKey} position={position} onAttempt={logAttempt} onDone={finishSession} />
      )}
      {exerciseType === "coppie" && (
        <CoppieMinime phonemeKey={phonemeKey} onAttempt={logAttempt} onDone={finishSession} />
      )}
      {exerciseType === "oca" && (
        <GiocoDellOca phonemeKey={phonemeKey} position={position} onAttempt={logAttempt} onDone={finishSession} />
      )}
      {exerciseType === "sequenze" && <SequenzeIllustrate onDone={finishSession} />}
      {exerciseType === "ripeti" && (
        <Ripeti phonemeKey={phonemeKey} onAttempt={logAttempt} onDone={finishSession} />
      )}
      {exerciseType === "ascolta" && (
        <AscoltaEScegli phonemeKey={phonemeKey} position={position} onAttempt={logAttempt} onDone={finishSession} />
      )}
      {exerciseType === "sillabe" && (
        <SillabeIsolate phonemeKey={phonemeKey} onAttempt={logAttempt} onDone={finishSession} />
      )}

      {celebration && (
        <View style={styles.celebrationOverlay}>
          <View style={styles.celebrationCard}>
            <Text style={styles.celebrationEmoji}>🎉</Text>
            <Text style={styles.celebrationTitle}>Livello conquistato!</Text>
            <Text style={styles.celebrationText}>
              Hai sbloccato il Livello {celebration.level} · {LEVEL_LABELS[celebration.level]} per il suono{" "}
              {meta.label}. Lo trovi nella mappa in Giochi.
            </Text>
            <Pressable style={styles.primaryBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.primaryBtnText}>Evviva!</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

/* ---------------- Caccia al suono ----------------
   Auto-avanza da sola: appena il bambino ha trovato tutte le parole giuste (o ha comunque
   toccato tutte le tessere), si passa all'esercizio successivo dopo una breve pausa — prima
   serviva un tap manuale su "Fatto" che non era ovvio dovesse comparire. */
function CacciaAlSuono({ phonemeKey, position, onAttempt, onDone }: {
  phonemeKey: PhonemeKey; position: "iniziale" | "mediana";
  onAttempt: (word: string, correct: boolean) => void; onDone: () => void;
}) {
  const tiles = useMemo(() => {
    const targets = pickRandom(wordsFor(phonemeKey, position), 3).map((w) => ({ ...w, correct: true }));
    const distractors = distractorPool(phonemeKey, 3).map((w) => ({ ...w, correct: false }));
    return pickRandom([...targets, ...distractors], 6);
  }, [phonemeKey, position]);

  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const meta = WORD_BANK[phonemeKey];
  const targetCount = tiles.filter((t) => t.correct).length;
  const { playCorrect, playWrong } = useFeedbackSounds();
  const { speak, speakWord } = useVoice();

  useEffect(() => {
    speak(`Trova le ${targetCount} parole con il suono ${meta.label}`, `tpl_caccia_${phonemeKey}`);
  }, []);

  function handlePick(t: WordEntry & { correct: boolean }) {
    if (picked[t.parola] !== undefined) return;
    const next = { ...picked, [t.parola]: t.correct };
    setPicked(next);
    onAttempt(t.parola, t.correct);
    if (t.correct) playCorrect(); else playWrong();
    setTimeout(() => speakWord(t.parola), 700);

    const targetsFound = tiles.filter((x) => x.correct && next[x.parola] === true).length;
    const allAnswered = Object.keys(next).length === tiles.length;
    if (targetsFound === targetCount || allAnswered) {
      setTimeout(onDone, 900);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.question}>Trova le {targetCount} parole con il suono {meta.label} 🦜</Text>
      <View style={styles.grid}>
        {tiles.map((t) => {
          const state = picked[t.parola];
          return (
            <Pressable
              key={t.parola}
              onPress={() => handlePick(t)}
              style={[
                styles.tile,
                state === true && styles.tileCorrect,
                state === false && styles.tileWrong,
              ]}
            >
              <WordVisual parola={t.parola} emoji={t.emoji} size={112} textStyle={styles.tileEmoji} />
              <Text style={styles.tileWord}>{t.parola}</Text>
              {state === true && <Text style={[styles.feedbackBadge, styles.feedbackBadgeCorrect]}>✓</Text>}
              {state === false && <Text style={styles.feedbackBadge}>🔄</Text>}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/* ---------------- Sillabe isolate (Livello 1) ----------------
   Sostituisce i 2 giochi che c'erano prima al livello 1: qui non si sceglie tra esercizi,
   si sentono/ripetono le 5 combinazioni sillabiche del suono (es. LA LE LI LO LU per la
   L) prima ancora di arrivare alla parola intera — il livello clinico "Suono isolato" del
   brief (§5). Ogni sillaba si pronuncia al tocco; quando sono state ascoltate tutte e 5 si
   passa in automatico. 4 categorie composite (cons_r, r_cons, s_cons, mnl_cons) non hanno
   una sillaba isolata onesta da proporre (raggruppano più cluster diversi, es. TR/DR/FR/
   GR/PR/BR) — per queste il livello 1 si completa da solo e si passa dritti al livello 2
   (vedi commento su SYLLABLES in wordBank.ts). */
function SillabeIsolate({ phonemeKey, onAttempt, onDone }: {
  phonemeKey: PhonemeKey; onAttempt: (word: string, correct: boolean) => void; onDone: () => void;
}) {
  const meta = WORD_BANK[phonemeKey];
  const syllables = useMemo(() => syllableEntries(phonemeKey), [phonemeKey]);
  const [tapped, setTapped] = useState<Set<string>>(new Set());
  const { speak, speakWord } = useVoice();

  useEffect(() => {
    if (syllables.length === 0) {
      speak("Per questo suono si parte direttamente dal livello 2!", "sess_livello2_diretto");
      onAttempt(phonemeKey, true);
      setTimeout(onDone, 1400);
      return;
    }
    speak("Tocca ogni sillaba e ripetila ad alta voce", "sess_tocca_sillabe");
  }, []);

  function tapSyllable(syl: WordEntry) {
    speakWord(syl.parola);
    onAttempt(syl.parola, true);
    setTapped((prev) => {
      if (prev.has(syl.parola)) return prev;
      const next = new Set(prev).add(syl.parola);
      if (next.size === syllables.length) setTimeout(onDone, 900);
      return next;
    });
  }

  if (syllables.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={styles.question}>Si passa al livello 2… 🦜</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.question}>Tocca ogni sillaba con il suono {meta.label} e ripetila ad alta voce 🦜</Text>
      <View style={syllableStyles.grid}>
        {syllables.map((syl) => {
          const done = tapped.has(syl.parola);
          return (
            <Pressable
              key={syl.parola}
              onPress={() => tapSyllable(syl)}
              style={[syllableStyles.tile, done && syllableStyles.tileDone]}
            >
              <Text style={[syllableStyles.tileText, done && syllableStyles.tileTextDone]}>{syl.parola}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.recCap}>{tapped.size}/{syllables.length} sillabe ascoltate</Text>
    </View>
  );
}

const syllableStyles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 12, marginTop: 10 },
  tile: {
    width: "28%", aspectRatio: 1, borderWidth: 2, borderColor: "#D9CEBC", borderRadius: 18,
    alignItems: "center", justifyContent: "center", backgroundColor: "#fff",
  },
  tileDone: { borderColor: "#137A6E", backgroundColor: "#E9F5F1" },
  tileText: { fontSize: 26, fontWeight: "800", color: "#1F2E2B" },
  tileTextDone: { color: "#0E5C53" },
});

/* ---------------- Memory ----------------
   4 livelli di difficoltà legati al Livello clinico della sessione (scala 1-7, vedi
   types/gamification.ts), con tabelloni crescenti da 6 a 16 carte — sempre un numero pari,
   altrimenti le coppie non tornano: 6/8/12/16, non 6/9/12/15. */
// La scala clinica va da 1 a 7 (vedi types/gamification.ts); qui la comprimiamo su 4 livelli
// di difficoltà del tabellone (in numero di coppie), dal più facile (Livello 1-2) al più
// difficile (Livello 7). 8 coppie al livello 7 è già il massimo di parole distinte che i
// suoni più poveri riescono a offrire (es. Z sorda: solo 8 parole in tutto tra iniziale e
// mediana, usate tutte senza scarto per la variazione tra un tentativo e l'altro).
const MEMORY_PAIRS_BY_LEVEL: Record<ClinicalLevel, number> = { 1: 3, 2: 3, 3: 4, 4: 4, 5: 6, 6: 6, 7: 8 };

function memoryCardWidth(totalCards: number): `${number}%` {
  if (totalCards <= 8) return "30%"; // 3 per riga
  if (totalCards === 12) return "22%"; // 4 per riga
  return "18%"; // 16 carte, 5 per riga
}

function MemoryGame({ phonemeKey, level, onAttempt, onDone }: {
  phonemeKey: PhonemeKey; level: ClinicalLevel;
  onAttempt: (word: string, correct: boolean) => void; onDone: () => void;
}) {
  const meta = WORD_BANK[phonemeKey];
  const pairCount = MEMORY_PAIRS_BY_LEVEL[level] ?? 3;
  const [round, setRound] = useState(0);
  const cards = useMemo(() => {
    // iniziale + mediana insieme: alcuni suoni non hanno abbastanza parole in una sola
    // posizione per i livelli più alti (fino a 8 parole distinte).
    const pool = allWordsFor(phonemeKey);
    const chosen = pickRandom(pool, Math.min(pairCount, pool.length));
    const doubled = chosen.flatMap((w) => [w, w]);
    return pickRandom(doubled, doubled.length).map((w, idx) => ({ ...w, uid: `${w.parola}-${idx}` }));
  }, [phonemeKey, pairCount, round]);
  const totalMatches = Math.min(pairCount, cards.length / 2);

  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [mismatched, setMismatched] = useState<string[]>([]);
  const [firstUid, setFirstUid] = useState<string | null>(null);
  const { playCorrect, playWrong } = useFeedbackSounds();
  const { speak, speakWord } = useVoice();

  useEffect(() => {
    speak(`Trova le coppie con il suono ${meta.label}`, `tpl_memory_${phonemeKey}`);
  }, [pairCount]);

  function handleFlip(card: typeof cards[number]) {
    if (flipped.includes(card.uid) || matched.includes(card.parola)) return;
    speakWord(card.parola);
    setFlipped((f) => [...f, card.uid]);
    if (!firstUid) { setFirstUid(card.uid); return; }
    const first = cards.find((c) => c.uid === firstUid)!;
    if (first.parola === card.parola) {
      playCorrect();
      onAttempt(card.parola, true);
      setFirstUid(null);
      setFlipped((f) => f.filter((u) => u !== firstUid && u !== card.uid));
      setMatched((m) => {
        const next = [...m, card.parola];
        if (next.length === totalMatches) setTimeout(onDone, 900);
        return next;
      });
    } else {
      playWrong();
      setMismatched([firstUid, card.uid]);
      onAttempt(card.parola, false);
      setTimeout(() => {
        setFlipped((f) => f.filter((u) => u !== firstUid && u !== card.uid));
        setMismatched([]);
      }, 900);
      setFirstUid(null);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.question}>
        Trova le coppie con {meta.label} · {cards.length} carte 🦜
      </Text>
      <ScrollView contentContainerStyle={styles.memGrid}>
        {cards.map((c) => {
          const shown = flipped.includes(c.uid) || matched.includes(c.parola);
          const isMatched = matched.includes(c.parola);
          const isMismatched = mismatched.includes(c.uid);
          return (
            <Pressable
              key={c.uid}
              onPress={() => handleFlip(c)}
              style={[
                styles.memCard,
                { width: memoryCardWidth(cards.length) },
                shown && styles.memCardFlipped,
                isMatched && styles.memCardMatched,
                isMismatched && styles.memCardWrong,
              ]}
            >
              {shown ? (
                <WordVisual parola={c.parola} emoji={c.emoji} size={80} textStyle={styles.memCardText} />
              ) : (
                <Text style={styles.memCardText}>?</Text>
              )}
              {isMatched && <Text style={[styles.feedbackBadge, styles.feedbackBadgeCorrect]}>✓</Text>}
              {isMismatched && <Text style={styles.feedbackBadge}>🔄</Text>}
            </Pressable>
          );
        })}
      </ScrollView>
      <Pressable style={styles.secondaryBtn} onPress={() => { setFlipped([]); setMatched([]); setMismatched([]); setFirstUid(null); setRound((r) => r + 1); }}>
        <Text style={styles.secondaryBtnText}>🔀 Nuove carte</Text>
      </Pressable>
    </View>
  );
}

const PRODUCTION_ROUNDS = 3;

/* ---------------- Registratore ----------------
   Registra la voce del bambino: richiede il consenso esplicito del genitore (dato dietro
   l'adult gate, in Genitori → Privacy e registrazioni) prima di attivare il microfono —
   vedi audioRecordingConsent su ChildProfile. Senza consenso il tasto resta bloccato.
   Auto-avanza tra le parole (3 a sessione): dopo ogni registrazione+riascolto non serve
   più un tap manuale su "Fatto" — prima non era chiaro quando l'esercizio fosse finito. */
function Registratore({ phonemeKey, position, onAttempt, onDone }: {
  phonemeKey: PhonemeKey; position: "iniziale" | "mediana";
  onAttempt: (word: string, correct: boolean) => void; onDone: () => void;
}) {
  const meta = WORD_BANK[phonemeKey];
  const [round, setRound] = useState(0);
  const word = useMemo(() => pickRandom(wordsFor(phonemeKey, position), 1)[0], [phonemeKey, position, round]);
  const [recording, setRecording] = useState(false);
  const [justDone, setJustDone] = useState(false);
  const hasConsent = useGamificationStore((s) => !!s.profile?.audioRecordingConsent);
  const { speakWord } = useVoice();

  useEffect(() => {
    speakWord(word.parola);
  }, [word.parola]);

  function playModel() { speakWord(word.parola); }

  function toggleRecord() {
    if (!hasConsent || justDone) return;
    if (!recording) {
      setRecording(true);
    } else {
      // NOTA: qui va agganciata la vera pipeline di registrazione audio
      // (expo-av + upload) e l'analisi di confidenza del motore articolatorio.
      // Per ora il completamento è marcato manualmente dal bambino/genitore.
      setRecording(false);
      setJustDone(true);
      onAttempt(word.parola, true);
      setTimeout(() => {
        setJustDone(false);
        if (round + 1 < PRODUCTION_ROUNDS) setRound((r) => r + 1);
        else onDone();
      }, 1100);
    }
  }

  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Text style={styles.question}>{justDone ? "Bravo! 🎉" : "Ascolta, poi prova tu"}</Text>
      <WordVisual parola={word.parola} emoji={word.emoji} size={150} textStyle={styles.recEmoji} imageMarginTop={20} />
      <Text style={styles.recWord}>{word.parola}</Text>
      <Text style={styles.recMeta}>
        {meta.label} · {position} · parola {round + 1} di {PRODUCTION_ROUNDS}
      </Text>
      {!hasConsent && (
        <Text style={styles.warnNote}>
          Serve il consenso di un genitore per registrare la voce. Vai su Progressi → Privacy
          e registrazioni per attivarlo.
        </Text>
      )}
      <View style={styles.recRow}>
        <Pressable style={styles.recListenBtn} onPress={playModel}>
          <Text style={styles.recBtnText}>▶</Text>
        </Pressable>
        <Pressable
          style={[styles.recMicBtn, recording && styles.recMicBtnActive, !hasConsent && styles.recMicBtnLocked]}
          onPress={toggleRecord}
          disabled={!hasConsent || justDone}
        >
          <Text style={styles.recBtnText}>{!hasConsent ? "🔒" : recording ? "⏸" : "🎤"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

/* ---------------- Ripeti ----------------
   Sfoglia TUTTE le parole del fonema (iniziale + mediana insieme, brief: farle vedere
   tutte) una alla volta: immagine grande, il modello audio parte da solo, il bambino
   ripete ad alta voce. Avanzamento sempre manuale (freccia) — niente registrazione né
   valutazione automatica della pronuncia: l'app non può "capire" se il bambino ha
   ripetuto bene (vedi CLAUDE.md §10, nessun ASR/scoring automatico sul bambino). */
function Ripeti({ phonemeKey, onAttempt, onDone }: {
  phonemeKey: PhonemeKey; onAttempt: (word: string, correct: boolean) => void; onDone: () => void;
}) {
  const meta = WORD_BANK[phonemeKey];
  const words = useMemo(() => allWordsFor(phonemeKey), [phonemeKey]);
  const [idx, setIdx] = useState(0);
  const word = words[idx];
  const { speak, speakWord } = useVoice();

  useEffect(() => {
    if (!word) return;
    if (idx === 0) {
      speak("Ascolta e ripeti ad alta voce", "sess_ascolta_ripeti");
      setTimeout(() => speakWord(word.parola), 1500);
    } else {
      speakWord(word.parola);
    }
  }, [idx, phonemeKey]);

  function next() {
    if (!word) return;
    onAttempt(word.parola, true);
    if (idx + 1 < words.length) setIdx((i) => i + 1);
    else onDone();
  }

  if (!word) return null;

  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Text style={styles.question}>Ascolta e ripeti ad alta voce 🦜</Text>
      <WordVisual parola={word.parola} emoji={word.emoji} size={170} textStyle={styles.recEmoji} imageMarginTop={10} />
      <Text style={styles.recWord}>{word.parola}</Text>
      <Text style={styles.recMeta}>
        {meta.label} · parola {idx + 1} di {words.length}
      </Text>
      <View style={styles.recRow}>
        <Pressable style={styles.recListenBtn} onPress={() => speakWord(word.parola)}>
          <Text style={styles.recBtnText}>▶</Text>
        </Pressable>
        <Pressable style={styles.recMicBtn} onPress={next}>
          <Text style={styles.recBtnText}>→</Text>
        </Pressable>
      </View>
      <Text style={styles.recCap}>Tocca la freccia quando hai ripetuto la parola</Text>
    </View>
  );
}

/* ---------------- Ascolta e scegli ----------------
   Discriminazione ricettiva: parte l'audio di UNA parola precisa (non "trova quelle col
   suono X" come Caccia al suono), il bambino la ripete ad alta voce e tocca l'immagine
   giusta tra 6 — stesso principio di Coppie minime ma con più distrattori invece di 2
   sole opzioni. */
const ASCOLTA_ROUNDS = 4;
function AscoltaEScegli({ phonemeKey, position, onAttempt, onDone }: {
  phonemeKey: PhonemeKey; position: "iniziale" | "mediana";
  onAttempt: (word: string, correct: boolean) => void; onDone: () => void;
}) {
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const { playCorrect, playWrong } = useFeedbackSounds();
  const { speak, speakWord } = useVoice();

  const roundData = useMemo(() => {
    const pool = wordsFor(phonemeKey, position);
    const target = pickRandom(pool, 1)[0];
    const sameGroupOthers = pool.filter((w) => w.parola !== target.parola);
    const distractors = pickRandom(sameGroupOthers, Math.min(5, sameGroupOthers.length));
    if (distractors.length < 5) {
      const seen = new Set(distractors.map((w) => w.parola));
      for (const w of distractorPool(phonemeKey, 5 - distractors.length + 3)) {
        if (distractors.length >= 5) break;
        if (seen.has(w.parola) || w.parola === target.parola) continue;
        distractors.push(w);
        seen.add(w.parola);
      }
    }
    const options = pickRandom([target, ...distractors.slice(0, 5)], Math.min(6, distractors.length + 1));
    return { target, options };
  }, [phonemeKey, position, round]);

  useEffect(() => {
    if (round === 0) {
      speak("Ripeti quello che hai sentito e tocca l'immagine giusta", "sess_ripeti_tocca_immagine");
      setTimeout(() => speakWord(roundData.target.parola), 1600);
    } else {
      speakWord(roundData.target.parola);
    }
  }, [round]);

  function pick(w: WordEntry) {
    if (picked) return;
    setPicked(w.parola);
    const correct = w.parola === roundData.target.parola;
    onAttempt(w.parola, correct);
    if (correct) playCorrect(); else playWrong();
    setTimeout(() => {
      setPicked(null);
      if (round + 1 < ASCOLTA_ROUNDS) setRound((r) => r + 1);
      else onDone();
    }, correct ? 900 : 1100);
  }

  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.question}>
        Ripeti quello che hai sentito e tocca l'immagine giusta · {round + 1} di {ASCOLTA_ROUNDS}
      </Text>
      <Pressable style={styles.playBtn} onPress={() => speakWord(roundData.target.parola)}>
        <Text style={styles.recBtnText}>▶</Text>
      </Pressable>
      <View style={styles.grid}>
        {roundData.options.map((w) => {
          const isTarget = w.parola === roundData.target.parola;
          const wasPicked = picked === w.parola;
          const showCorrect = picked !== null && isTarget;
          const showWrong = wasPicked && !isTarget;
          return (
            <Pressable
              key={w.parola}
              onPress={() => pick(w)}
              style={[styles.tile, showCorrect && styles.tileCorrect, showWrong && styles.tileWrong]}
            >
              <WordVisual parola={w.parola} emoji={w.emoji} size={90} textStyle={styles.tileEmoji} />
              <Text style={styles.tileWord}>{w.parola}</Text>
              {showCorrect && <Text style={[styles.feedbackBadge, styles.feedbackBadgeCorrect]}>✓</Text>}
              {showWrong && <Text style={styles.feedbackBadge}>🔄</Text>}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/* ---------------- Coppie minime ----------------
   3 round che alternano quale delle due parole della coppia è il target, invece di una
   singola domanda — più pratica per sessione, in linea con gli altri esercizi. Auto-avanza
   dopo ogni risposta, niente più tap manuale su "Fatto". */
function CoppieMinime({ phonemeKey, onAttempt, onDone }: {
  phonemeKey: PhonemeKey; onAttempt: (word: string, correct: boolean) => void; onDone: () => void;
}) {
  const pair = MINIMAL_PAIRS[phonemeKey] ?? MINIMAL_PAIRS.s!;
  const meta = WORD_BANK[phonemeKey];
  const [round, setRound] = useState(0);
  const target = pair[round % 2];
  const [picked, setPicked] = useState<string | null>(null);
  const { playCorrect, playWrong } = useFeedbackSounds();
  const { speak, speakWord } = useVoice();

  function playTarget() { speakWord(target.parola); }

  useEffect(() => {
    if (round === 0) {
      speak("Ascolta, poi tocca la parola che hai sentito", "sess_ascolta_tocca_parola");
      setTimeout(playTarget, 1600);
    } else {
      playTarget();
    }
  }, [round]);

  function pick(word: WordEntry) {
    if (picked) return;
    setPicked(word.parola);
    const correct = word.parola === target.parola;
    onAttempt(word.parola, correct);
    if (correct) playCorrect(); else playWrong();
    setTimeout(() => speakWord(word.parola), 700);
    setTimeout(() => {
      setPicked(null);
      if (round + 1 < PRODUCTION_ROUNDS) setRound((r) => r + 1);
      else onDone();
    }, 1100);
  }

  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.question}>
        Ascolta, poi tocca la parola che hai sentito · {round + 1} di {PRODUCTION_ROUNDS}
      </Text>
      {!MINIMAL_PAIRS[phonemeKey] && (
        <Text style={styles.warnNote}>Coppia di esempio — da personalizzare per {meta.label}</Text>
      )}
      <Pressable style={styles.playBtn} onPress={playTarget}>
        <Text style={styles.recBtnText}>▶</Text>
      </Pressable>
      <View style={styles.grid}>
        {pair.map((w) => {
          const state = picked === null ? null : w.parola === picked;
          const isTarget = w.parola === target.parola;
          const showCorrect = picked !== null && isTarget;
          const showWrong = state === true && !isTarget;
          return (
            <Pressable
              key={w.parola}
              onPress={() => pick(w)}
              style={[styles.tile, showCorrect && styles.tileCorrect, showWrong && styles.tileWrong]}
            >
              <WordVisual parola={w.parola} emoji={w.emoji} size={112} textStyle={styles.tileEmoji} />
              <Text style={styles.tileWord}>{w.parola.toUpperCase()}</Text>
              {showCorrect && <Text style={[styles.feedbackBadge, styles.feedbackBadgeCorrect]}>✓</Text>}
              {showWrong && <Text style={styles.feedbackBadge}>🔄</Text>}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/* ---------------- Gioco dell'oca ---------------- */
function GiocoDellOca({ phonemeKey, position, onAttempt, onDone }: {
  phonemeKey: PhonemeKey; position: "iniziale" | "mediana";
  onAttempt: (word: string, correct: boolean) => void; onDone: () => void;
}) {
  const words = useMemo(() => {
    const list = wordsFor(phonemeKey, position);
    const picked = pickRandom(list, Math.min(6, list.length));
    while (picked.length < 6 && list.length) picked.push(list[picked.length % list.length]);
    return picked;
  }, [phonemeKey, position]);
  const [pos, setPos] = useState(0);
  const current = words[pos];
  const { speak, speakWord } = useVoice();

  useEffect(() => {
    speak("Dì la parola per far avanzare il pappagallo!", "sess_di_parola_oca");
    if (current) setTimeout(() => speakWord(current.parola), 900);
  }, []);

  function advance() {
    onAttempt(current.parola, true);
    speakWord(current.parola);
    if (pos < 5) setPos(pos + 1);
    else setTimeout(onDone, 600);
  }

  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Text style={styles.question}>Dì la parola per far avanzare il pappagallo!</Text>
      <View style={ocaStyles.path}>
        {words.map((_, i) => (
          <View key={i} style={[ocaStyles.cell, i === pos && ocaStyles.cellActive]}>
            <Text style={ocaStyles.cellText}>{i === pos ? "🦜" : i + 1}</Text>
          </View>
        ))}
      </View>
      <Pressable onPress={() => speakWord(current.parola)} style={{ alignItems: "center" }}>
        <WordVisual parola={current.parola} emoji={current.emoji} size={130} textStyle={ocaStyles.emoji} imageMarginTop={10} />
        <Text style={ocaStyles.word}>{current.parola}</Text>
      </Pressable>
      <Pressable style={ocaStyles.sayBtn} onPress={advance}>
        <Text style={styles.primaryBtnText}>🦜 Dillo!</Text>
      </Pressable>
      <Text style={styles.recCap}>Casella {pos + 1} di 6</Text>
    </View>
  );
}

/* ---------------- Sequenze illustrate ----------------
   Narrazione fissa (livello 5, racconto) — non si presta alla rotazione
   automatica per parola come gli altri giochi. Un solo esempio per ora;
   costruire template aggiuntivi è un prossimo passo di contenuto. */
function SequenzeIllustrate({ onDone }: { onDone: () => void }) {
  const steps = [
    { order: 1, emoji: "🌧️", text: "Prima piove...", said: "Prima piove" },
    { order: 2, emoji: "🌈", text: "poi esce l'arcobaleno...", said: "Poi esce l'arcobaleno" },
    { order: 3, emoji: "☀️", text: "e infine torna il sole!", said: "E infine torna il sole" },
  ];
  const [next, setNext] = useState(1);
  const [story, setStory] = useState("Tocca l'immagine giusta per iniziare…");
  const [wrongOrder, setWrongOrder] = useState<number | null>(null);
  const { speak } = useVoice();

  useEffect(() => {
    speak("Tocca le immagini in ordine per raccontare la storia", "sess_tocca_immagini_ordine");
  }, []);

  function tap(step: typeof steps[number]) {
    if (step.order < next) return;
    if (step.order === next) {
      speak(step.said);
      setStory((s) => (next === 1 ? step.text : `${s} ${step.text}`));
      if (next === 3) setTimeout(onDone, 1200);
      setNext((n) => n + 1);
    } else {
      setWrongOrder(step.order);
      setTimeout(() => setWrongOrder(null), 400);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.question}>Tocca le immagini in ordine per raccontare la storia.</Text>
      <View style={seqStyles.row}>
        {steps.map((step) => (
          <Pressable
            key={step.order}
            onPress={() => tap(step)}
            style={[
              seqStyles.card,
              step.order < next && seqStyles.cardDone,
              wrongOrder === step.order && seqStyles.cardWrong,
            ]}
          >
            <Text style={seqStyles.emoji}>{step.emoji}</Text>
            {step.order < next && <Text style={seqStyles.badge}>{step.order}</Text>}
          </Pressable>
        ))}
      </View>
      <View style={seqStyles.storyBox}>
        <Text style={seqStyles.storyText}>{story}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF8EE", padding: 16 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  back: { fontSize: 26, color: "#137A6E" },
  title: { fontSize: 20, fontWeight: "800" },
  subtitle: { fontSize: 12, color: "#4A5A56", marginTop: 2 },
  question: { fontSize: 15, color: "#4A5A56", marginBottom: 14, textAlign: "center" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 10 },
  tile: {
    width: "47%", aspectRatio: 1, borderWidth: 2, borderColor: "#D9CEBC", borderRadius: 15,
    alignItems: "center", justifyContent: "center", backgroundColor: "#fff", marginBottom: 10,
  },
  tileCorrect: { borderColor: "#137A6E", backgroundColor: "#E9F5F1" },
  tileWrong: { borderColor: "#FF6A4D", backgroundColor: "#FDECE7" },
  tileEmoji: { fontSize: 30 },
  tileWord: { fontWeight: "700", marginTop: 4 },
  // Iconcina di rinforzo sulla tile, in aggiunta al colore: un bambino che non legge ancora
  // riconosce comunque "giusto/riprova" a colpo d'occhio. Mai una X: coerente con "mai punire
  // l'errore" (CLAUDE.md §8) — 🔄 invita a riprovare invece di segnalare una colpa.
  feedbackBadge: { position: "absolute", top: 6, right: 6, fontSize: 20 },
  feedbackBadgeCorrect: { color: "#0E5C53", fontWeight: "800" },
  memGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 8 },
  memCard: {
    width: "30%", aspectRatio: 1, borderRadius: 13, borderWidth: 2, borderColor: "#D9CEBC",
    backgroundColor: "#137A6E", alignItems: "center", justifyContent: "center", marginBottom: 8,
  },
  memCardFlipped: { backgroundColor: "#fff", borderColor: "#137A6E" },
  memCardMatched: { borderColor: "#137A6E", backgroundColor: "#E9F5F1" },
  memCardWrong: { borderColor: "#FF6A4D", backgroundColor: "#FDECE7" },
  memCardText: { fontSize: 24 },
  recEmoji: { fontSize: 60, marginTop: 20 },
  recWord: { fontSize: 34, fontWeight: "800", marginTop: 6 },
  recMeta: { fontSize: 13, color: "#4A5A56", marginBottom: 20 },
  recRow: { flexDirection: "row", gap: 18, marginBottom: 20 },
  recListenBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#137A6E", alignItems: "center", justifyContent: "center" },
  recMicBtn: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#FF6A4D", alignItems: "center", justifyContent: "center" },
  recMicBtnActive: { backgroundColor: "#E84B30" },
  recMicBtnLocked: { backgroundColor: "#B0A99A" },
  recBtnText: { fontSize: 26, color: "#fff" },
  actionRow: { flexDirection: "row", justifyContent: "center", gap: 10, marginTop: 16, flexWrap: "wrap" },
  secondaryBtn: { borderWidth: 1.5, borderColor: "#137A6E", borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14 },
  secondaryBtnText: { color: "#0E5C53", fontWeight: "600", fontSize: 13 },
  primaryBtn: { backgroundColor: "#FF6A4D", borderRadius: 999, paddingVertical: 10, paddingHorizontal: 20 },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
  recCap: { textAlign: "center", fontSize: 12, color: "#4A5A56", marginTop: 10 },
  warnNote: { textAlign: "center", fontSize: 11, color: "#B08900", fontStyle: "italic", marginBottom: 10 },
  playBtn: {
    alignSelf: "center", width: 60, height: 60, borderRadius: 30, backgroundColor: "#137A6E",
    alignItems: "center", justifyContent: "center", marginBottom: 20,
  },
  celebrationOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(31,46,43,0.55)", alignItems: "center", justifyContent: "center", padding: 24,
  },
  celebrationCard: {
    backgroundColor: "#fff", borderRadius: 22, padding: 26, alignItems: "center", maxWidth: 340,
  },
  celebrationEmoji: { fontSize: 48, marginBottom: 8 },
  celebrationTitle: { fontSize: 20, fontWeight: "800", color: "#1F2E2B", marginBottom: 10, textAlign: "center" },
  celebrationText: { fontSize: 14, color: "#4A5A56", textAlign: "center", lineHeight: 20, marginBottom: 20 },
});

const ocaStyles = StyleSheet.create({
  path: { flexDirection: "row", gap: 6, marginVertical: 14, flexWrap: "wrap", justifyContent: "center" },
  cell: {
    width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: "#D9CEBC",
    alignItems: "center", justifyContent: "center", backgroundColor: "#fff",
  },
  cellActive: { backgroundColor: "#FF6A4D", borderColor: "#FF6A4D" },
  cellText: { fontWeight: "700", fontSize: 13, color: "#4A5A56" },
  emoji: { fontSize: 46, textAlign: "center", marginTop: 10 },
  word: { fontSize: 28, fontWeight: "800", textAlign: "center", color: "#1F2E2B", marginBottom: 16 },
  sayBtn: {
    backgroundColor: "#137A6E", borderRadius: 14, paddingVertical: 12, paddingHorizontal: 22, marginBottom: 10,
  },
});

const seqStyles = StyleSheet.create({
  row: { flexDirection: "row", gap: 9, marginVertical: 14 },
  card: {
    flex: 1, height: 72, borderWidth: 2, borderColor: "#D9CEBC", borderRadius: 15,
    alignItems: "center", justifyContent: "center", backgroundColor: "#fff", position: "relative",
  },
  cardDone: { borderColor: "#137A6E", backgroundColor: "#E9F5F1" },
  cardWrong: { borderColor: "#FF6A4D", backgroundColor: "#FDECE7" },
  emoji: { fontSize: 30 },
  badge: {
    position: "absolute", top: 4, left: 5, width: 18, height: 18, borderRadius: 9,
    backgroundColor: "#137A6E", color: "#fff", fontSize: 10, fontWeight: "700", textAlign: "center",
    lineHeight: 18, overflow: "hidden",
  },
  storyBox: { backgroundColor: "#E4EFEA", borderRadius: 14, padding: 14 },
  storyText: { fontSize: 13.5, color: "#1F2E2B", lineHeight: 20 },
});
