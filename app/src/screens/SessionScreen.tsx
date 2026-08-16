import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import * as Speech from "expo-speech";
import {
  useAudioRecorder,
  useAudioRecorderState,
  useAudioPlayer,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from "expo-audio";
import {
  PhonemeKey,
  WORD_BANK,
  WordEntry,
  wordsFor,
  pickRandom,
  distractorPool,
  MINIMAL_PAIRS,
  isPremium,
} from "../constants/wordBank";
import { useGamificationStore } from "../store/useGamificationStore";
import { AttemptResult, ClinicalLevel, SessionResult, LEVEL_LABELS } from "../types/gamification";

type ExerciseType = "caccia" | "memory" | "registratore" | "coppie" | "oca" | "sequenze" | "pappagallo";

// TODO (nice-to-have, priorità bassa): video dimostrativi della posizione linguale/labiale
// per fonema, integrati in-app e scaricabili on-demand per singolo pacchetto-fonema (non
// tutta la libreria insieme, non link esterni a YouTube) — promemoria per il bambino, non
// sostituto della spiegazione del logopedista in seduta. Non ancora implementato.

interface SessionParams {
  phonemeGroupId: string; // deve combaciare con una PhonemeKey del word bank
  level: ClinicalLevel;
  position?: "iniziale" | "mediana";
  exerciseType?: ExerciseType;
  // Prova rapida senza codice, non legata a un piano assegnato: non deve scrivere
  // progressi reali sul profilo (usata finché non esiste ancora un profilo bambino).
  demo?: boolean;
}

function say(text: string) {
  Speech.stop();
  Speech.speak(text, { language: "it-IT", pitch: 1.05, rate: 0.92 });
}

export default function SessionScreen({ navigation, route }: any) {
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
  // Livello appena sbloccato da festeggiare prima di tornare a MainTabs — un overlay
  // custom invece di Alert.alert(), che su React Native Web è un no-op totale (nessuna UI,
  // nessuna callback): usarlo per il proseguimento della navigazione avrebbe bloccato
  // l'app sulla schermata dell'esercizio finito su web, senza modo di continuare.
  const [celebration, setCelebration] = useState<{ level: ClinicalLevel } | null>(null);

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
      attempts,
      completedAt: new Date().toISOString(),
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
    navigation.navigate("MainTabs");
  }

  function logAttempt(word: string, correct: boolean) {
    setAttempts((prev) => [
      ...prev,
      { targetPhoneme: phonemeKey, confidenceScore: correct ? 1 : 0.35, starsAwarded: correct ? 3 : 1 },
    ]);
  }

  if (!meta || locked) return null;

  return (
    <View style={styles.container}>
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
            {exerciseType === "pappagallo" && "Ripeti con Lallo"}
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
        <MemoryGame phonemeKey={phonemeKey} position={position} onAttempt={logAttempt} onDone={finishSession} />
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
      {exerciseType === "pappagallo" && (
        <RipetiConLallo phonemeKey={phonemeKey} position={position} onAttempt={logAttempt} onDone={finishSession} />
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
            <Pressable style={styles.primaryBtn} onPress={() => navigation.navigate("MainTabs")}>
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

  useEffect(() => {
    say(`Trova le ${targetCount} parole con il suono ${meta.label}`);
  }, []);

  function handlePick(t: WordEntry & { correct: boolean }) {
    if (picked[t.parola] !== undefined) return;
    const next = { ...picked, [t.parola]: t.correct };
    setPicked(next);
    onAttempt(t.parola, t.correct);
    say(t.parola);

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
              <Text style={styles.tileEmoji}>{t.emoji}</Text>
              <Text style={styles.tileWord}>{t.parola}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/* ---------------- Memory ---------------- */
function MemoryGame({ phonemeKey, position, onAttempt, onDone }: {
  phonemeKey: PhonemeKey; position: "iniziale" | "mediana";
  onAttempt: (word: string, correct: boolean) => void; onDone: () => void;
}) {
  const meta = WORD_BANK[phonemeKey];
  const [round, setRound] = useState(0);
  const cards = useMemo(() => {
    const chosen = pickRandom(wordsFor(phonemeKey, position), 3);
    const doubled = pickRandom([...chosen, ...chosen], 6).map((w, idx) => ({ ...w, uid: `${w.parola}-${idx}` }));
    return doubled;
  }, [phonemeKey, position, round]);

  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [firstUid, setFirstUid] = useState<string | null>(null);

  function handleFlip(card: typeof cards[number]) {
    if (flipped.includes(card.uid) || matched.includes(card.parola)) return;
    say(card.parola);
    const newFlipped = [...flipped, card.uid];
    setFlipped(newFlipped);
    if (!firstUid) { setFirstUid(card.uid); return; }
    const first = cards.find((c) => c.uid === firstUid)!;
    if (first.parola === card.parola) {
      setMatched((m) => [...m, card.parola]);
      onAttempt(card.parola, true);
      setFirstUid(null);
      setFlipped((f) => f.filter((u) => u !== firstUid && u !== card.uid));
      if (matched.length + 1 === 3) setTimeout(onDone, 900);
    } else {
      onAttempt(card.parola, false);
      setTimeout(() => setFlipped((f) => f.filter((u) => u !== firstUid && u !== card.uid)), 700);
      setFirstUid(null);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.question}>Trova le coppie con {meta.label} 🦜</Text>
      <View style={styles.memGrid}>
        {cards.map((c) => {
          const shown = flipped.includes(c.uid) || matched.includes(c.parola);
          return (
            <Pressable key={c.uid} onPress={() => handleFlip(c)} style={[styles.memCard, shown && styles.memCardFlipped]}>
              <Text style={styles.memCardText}>{shown ? c.emoji : "?"}</Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable style={styles.secondaryBtn} onPress={() => { setFlipped([]); setMatched([]); setFirstUid(null); setRound((r) => r + 1); }}>
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

  function playModel() { say(word.parola); }

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
      <Text style={styles.recEmoji}>{word.emoji}</Text>
      <Text style={styles.recWord}>{word.parola}</Text>
      <Text style={styles.recMeta}>
        {meta.label} · {position} · parola {round + 1} di {PRODUCTION_ROUNDS}
      </Text>
      {!hasConsent && (
        <Text style={styles.warnNote}>
          Serve il consenso di un genitore per registrare la voce. Vai su Genitori → Privacy
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

/* ---------------- Ripeti con Lallo ----------------
   Feature virale (brief §6.4): il bambino dice una parola, Lallo la ripete con voce da
   pappagallo. Registra davvero la voce (expo-audio, richiede lo stesso consenso del
   Registratore) e la riproduce con l'"effetto scoiattolo/pappagallo": aumentare la
   velocità di riproduzione con shouldCorrectPitch=false alza anche il pitch, senza bisogno
   di un modulo DSP nativo — approccio MVP proposto, da affinare più avanti se serve un
   effetto più realistico. Salvare/condividere la clip resta una scelta del genitore (mai
   automatica) — qui "salva" è ancora un placeholder, non c'è ancora persistenza reale. */
// A differenza degli altri esercizi, qui NON auto-avanziamo dopo la prima risposta: il
// punto della feature è proprio poter far ripetere a Lallo la stessa parola più volte per
// gioco (brief §6.4) — auto-avanzare dopo un solo tap toglierebbe quella parte divertente.
// Resta un avanzamento manuale, ma con etichetta ed indicatore di round più chiari.
function RipetiConLallo({ phonemeKey, position, onAttempt, onDone }: {
  phonemeKey: PhonemeKey; position: "iniziale" | "mediana";
  onAttempt: (word: string, correct: boolean) => void; onDone: () => void;
}) {
  const meta = WORD_BANK[phonemeKey];
  const [round, setRound] = useState(0);
  const word = useMemo(() => pickRandom(wordsFor(phonemeKey, position), 1)[0], [phonemeKey, position, round]);
  const hasConsent = useGamificationStore((s) => !!s.profile?.audioRecordingConsent);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [repeats, setRepeats] = useState(0);
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
    setRepeats((r) => r + 1);
    onAttempt(word.parola, true);
  }

  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Text style={styles.question}>Dì la parola… e senti come la ripete Lallo! 🦜</Text>
      <Text style={styles.recEmoji}>{word.emoji}</Text>
      <Text style={styles.recWord}>{word.parola}</Text>
      <Text style={styles.recMeta}>
        {meta.label} · {position} · parola {round + 1} di {PRODUCTION_ROUNDS}
      </Text>
      {!hasConsent && (
        <Text style={styles.warnNote}>
          Serve il consenso di un genitore per registrare la voce. Vai su Genitori → Privacy
          e registrazioni per attivarlo.
        </Text>
      )}
      {permissionDenied && (
        <Text style={styles.warnNote}>
          Il microfono non è autorizzato per Lallo nelle impostazioni del telefono.
        </Text>
      )}
      <View style={styles.recRow}>
        <Pressable
          style={[styles.recMicBtn, recorderState.isRecording && styles.recMicBtnActive, !hasConsent && styles.recMicBtnLocked]}
          onPress={recorderState.isRecording ? stopRecording : startRecording}
          disabled={!hasConsent}
        >
          <Text style={styles.recBtnText}>{!hasConsent ? "🔒" : recorderState.isRecording ? "⏸" : "🎤"}</Text>
        </Pressable>
        <Pressable
          style={[styles.recListenBtn, !recordedUri && { opacity: 0.35 }]}
          onPress={repeatAsParrot}
          disabled={!recordedUri}
        >
          <Text style={styles.recBtnText}>🦜</Text>
        </Pressable>
      </View>
      <Text style={styles.recCap}>
        {!hasConsent
          ? " "
          : recorderState.isRecording
          ? "Sto registrando… tocca di nuovo per fermare"
          : recordedUri
          ? "Tocca il pappagallo per sentirlo ripetere!"
          : "Tocca il microfono e dì la parola"}
      </Text>
      <View style={styles.actionRow}>
        {recordedUri && (
          <Pressable style={styles.secondaryBtn} onPress={() => onAttempt(word.parola, true)}>
            <Text style={styles.secondaryBtnText}>🎬 Salva la clip</Text>
          </Pressable>
        )}
        {repeats > 0 && (
          <Pressable
            style={styles.primaryBtn}
            onPress={() => {
              if (round + 1 < PRODUCTION_ROUNDS) {
                setRecordedUri(null);
                setRepeats(0);
                setRound((r) => r + 1);
              } else {
                onDone();
              }
            }}
          >
            <Text style={styles.primaryBtnText}>
              {round + 1 < PRODUCTION_ROUNDS ? "Prossima parola →" : "Fatto ✓"}
            </Text>
          </Pressable>
        )}
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

  function playTarget() { say(target.parola); }

  useEffect(() => {
    playTarget();
  }, [round]);

  function pick(word: WordEntry) {
    if (picked) return;
    setPicked(word.parola);
    const correct = word.parola === target.parola;
    onAttempt(word.parola, correct);
    say(word.parola);
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
          return (
            <Pressable
              key={w.parola}
              onPress={() => pick(w)}
              style={[
                styles.tile,
                picked !== null && isTarget && styles.tileCorrect,
                state === true && !isTarget && styles.tileWrong,
              ]}
            >
              <Text style={styles.tileEmoji}>{w.emoji}</Text>
              <Text style={styles.tileWord}>{w.parola.toUpperCase()}</Text>
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

  function advance() {
    onAttempt(current.parola, true);
    say(current.parola);
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
      <Pressable onPress={() => say(current.parola)}>
        <Text style={ocaStyles.emoji}>{current.emoji}</Text>
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

  function tap(step: typeof steps[number]) {
    if (step.order < next) return;
    if (step.order === next) {
      say(step.said);
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
  container: { flex: 1, backgroundColor: "#FFF8EE", padding: 16, paddingTop: 56 },
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
  memGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 8 },
  memCard: {
    width: "30%", aspectRatio: 1, borderRadius: 13, borderWidth: 2, borderColor: "#D9CEBC",
    backgroundColor: "#137A6E", alignItems: "center", justifyContent: "center", marginBottom: 8,
  },
  memCardFlipped: { backgroundColor: "#fff", borderColor: "#137A6E" },
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
