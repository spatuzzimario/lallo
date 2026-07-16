import React, { useState, useMemo, useEffect } from "react";

/* ============================================================
   COLORI ESATTI DEL BRAND — presi dalla demo HTML originale
   (lallo-landing/index.html), applicati via inline style invece
   che classi Tailwind arbitrarie (quelle non compilano negli
   artifact — è il bug della versione precedente di questo file).
   ============================================================ */
const C = {
  paper: "#FBF6EE",
  paper2: "#F3EBDD",
  ink: "#1F2E2B",
  inkSoft: "#4A5A56",
  jade: "#137A6E",
  jadeDeep: "#0E5C53",
  coral: "#FF6A4D",
  coralDeep: "#E84B30",
  sun: "#FFC53D",
  mist: "#E4EFEA",
  line: "#D9CEBC",
};

/* ============================================================
   WORD BANK — stessa libreria di src/constants/wordBank.ts
   ============================================================ */
const WORD_BANK = {
  b: { label:'B', iniziale:[["balena","🐋"],["banana","🍌"],["bicicletta","🚲"],["bambola","🪆"],["barca","⛵"],["bottone","🔘"],["burro","🧈"],["borsa","👜"]],
                   mediana:[["sabbia","🏖️"],["gabbia","🦜"],["tubo","🧴"],["cubo","🧊"],["nebbia","🌫️"],["gobba","🐫"],["abito","👗"],["sabato","📅"]] },
  c: { label:'C (dura)', iniziale:[["cane","🐶"],["casa","🏠"],["cuore","❤️"],["colore","🎨"],["cavallo","🐴"],["cucchiaio","🥄"],["coccinella","🐞"],["cappello","🎩"]],
                   mediana:[["fuoco","🔥"],["secchio","🪣"],["pacco","📦"],["amico","🧑‍🤝‍🧑"],["oca","🦆"],["mucca","🐄"],["ricco","💰"],["baco","🐛"]] },
  ci:{ label:'CI (dolce)', iniziale:[["ciliegia","🍒"],["cioccolato","🍫"],["cielo","☁️"],["cerchio","⭕"],["cena","🍽️"],["cesto","🧺"],["cintura","👖"],["cinque","5️⃣"]],
                   mediana:[["bicicletta","🚲"],["faccia","😊"],["doccia","🚿"],["arancia","🍊"],["focaccia","🍞"],["pancia","🫃"],["caccia","🏹"],["traccia","👣"]] },
  d: { label:'D', iniziale:[["dado","🎲"],["dito","☝️"],["delfino","🐬"],["dente","🦷"],["drago","🐉"],["disegno","🖍️"],["donna","👩"],["dolce","🍰"]],
                   mediana:[["nido","🪺"],["cadere","⬇️"],["radio","📻"],["moda","👗"],["medaglia","🏅"],["edera","🌿"],["candela","🕯️"],["freddo","🥶"]] },
  f: { label:'F', iniziale:[["fungo","🍄"],["foglia","🍃"],["farfalla","🦋"],["fiore","🌸"],["fuoco","🔥"],["fragola","🍓"],["forchetta","🍴"],["formica","🐜"]],
                   mediana:[["caffè","☕"],["elefante","🐘"],["telefono","📞"],["giraffa","🦒"],["buffo","🤡"],["profumo","🌺"],["sofà","🛋️"],["gonfio","🎈"]] },
  g: { label:'G (dura)', iniziale:[["gatto","🐱"],["gallina","🐔"],["gomma","🧽"],["gufo","🦉"],["gonna","👗"],["guanto","🧤"],["gomito","💪"],["gabbiano","🐦"]],
                   mediana:[["fungo","🍄"],["lago","🏞️"],["mago","🧙"],["igloo","🧊"],["ago","🪡"],["fuga","🏃"],["rughe","👵"],["sugo","🍝"]] },
  gi:{ label:'GI (dolce)', iniziale:[["giraffa","🦒"],["gelato","🍦"],["gioco","🎮"],["giacca","🧥"],["girasole","🌻"],["ginocchio","🦵"],["gemello","👯"],["gelso","🌳"]],
                   mediana:[["formaggio","🧀"],["valigia","🧳"],["magia","✨"],["orologio","⌚"],["pagina","📄"],["angelo","👼"],["spiaggia","🏖️"],["coraggio","🦁"]] },
  gli:{ label:'GLI', iniziale:[],
                   mediana:[["famiglia","👪"],["figlio","🧒"],["maglia","👕"],["aglio","🧄"],["foglia","🍃"],["coniglio","🐰"],["bottiglia","🍾"],["sveglia","⏰"]] },
  gn:{ label:'GN', iniziale:[["gnomo","🧙‍♂️"],["gnocchi","🍝"]],
                   mediana:[["castagna","🌰"],["montagna","⛰️"],["ragno","🕷️"],["bagno","🛁"],["sogno","💭"],["cigno","🦢"],["legno","🪵"],["lasagna","🍝"]] },
  l: { label:'L', iniziale:[["luna","🌙"],["leone","🦁"],["limone","🍋"],["lupo","🐺"],["libro","📖"],["lampada","💡"],["lucertola","🦎"],["latte","🥛"]],
                   mediana:[["palla","⚽"],["gelato","🍦"],["mela","🍎"],["valigia","🧳"],["colore","🎨"],["salame","🥓"],["elica","🚁"],["isola","🏝️"]] },
  m: { label:'M', iniziale:[["mela","🍎"],["mano","✋"],["mare","🌊"],["mucca","🐄"],["moto","🏍️"],["matita","✏️"],["monte","⛰️"],["mago","🧙"]],
                   mediana:[["gomma","🧽"],["camera","🛏️"],["limone","🍋"],["animale","🐾"],["camicia","👕"],["camino","🔥"],["fumo","💨"],["gomito","💪"]] },
  n: { label:'N', iniziale:[["naso","👃"],["nave","🚢"],["nido","🪺"],["neve","❄️"],["nonna","👵"],["noce","🌰"],["numero","🔢"],["nuvola","☁️"]],
                   mediana:[["banana","🍌"],["luna","🌙"],["tenda","⛺"],["penna","🖊️"],["farina","🌾"],["gonna","👗"],["ananas","🍍"],["cannuccia","🥤"]] },
  mnl_cons:{ label:'M/N/L + cons.', iniziale:[],
                   mediana:[["campo","🏕️"],["ponte","🌉"],["dolce","🍰"],["elmo","⛑️"],["salto","🤸"],["angolo","📐"],["mondo","🌍"],["tempo","⏰"]] },
  p: { label:'P', iniziale:[["pane","🍞"],["palla","⚽"],["pesce","🐟"],["penna","🖊️"],["porta","🚪"],["pizza","🍕"],["panda","🐼"],["pollo","🐔"]],
                   mediana:[["lampada","💡"],["scopa","🧹"],["capra","🐐"],["sapone","🧼"],["topo","🐭"],["papero","🦆"],["zoppo","🦯"],["cupola","🕌"]] },
  r: { label:'R', iniziale:[["rana","🐸"],["razzo","🚀"],["riso","🍚"],["rosa","🌹"],["ruota","🛞"],["radio","📻"],["robot","🤖"],["riccio","🦔"]],
                   mediana:[["farfalla","🦋"],["corona","👑"],["sirena","🧜‍♀️"],["faro","🗼"],["forno","🔥"],["carota","🥕"],["cereali","🥣"],["arancia","🍊"]] },
  cons_r:{ label:'cons. + R', iniziale:[["treno","🚂"],["drago","🐉"],["fragola","🍓"],["granchio","🦀"],["prato","🌾"],["trattore","🚜"],["principe","🤴"],["bruco","🐛"]],
                   mediana:[["sopra","⬆️"],["aprile","📅"],["vetro","🪟"],["cetriolo","🥒"],["fabbro","🔨"],["quadro","🖼️"],["ombra","🌑"],["libro","📖"]] },
  r_cons:{ label:'R + cons.', iniziale:[],
                   mediana:[["porta","🚪"],["carta","📄"],["cartone","📦"],["forchetta","🍴"],["tartaruga","🐢"],["orso","🐻"],["corda","🪢"],["verde","🟢"]] },
  s: { label:'S', iniziale:[["sole","☀️"],["sasso","🪨"],["serpente","🐍"],["sedia","🪑"],["salame","🥓"],["sette","7️⃣"],["sacco","🎒"],["settimana","📅"]],
                   mediana:[["cassa","📦"],["tosse","🤧"],["pasta","🍝"],["vespa","🐝"],["castello","🏰"],["salsiccia","🌭"],["riposo","😴"],["musica","🎵"]] },
  s_cons:{ label:'S + cons.', iniziale:[["spada","⚔️"],["stella","⭐"],["scala","🪜"],["spazzolino","🪥"],["stivale","👢"],["spinaci","🥬"],["sveglia","⏰"],["sfera","🔮"]],
                   mediana:[["finestra","🪟"],["orchestra","🎻"],["minestra","🍲"],["castello","🏰"],["pastore","🐑"],["canestro","🏀"],["mostro","👹"],["vestito","👗"]] },
  sci_sce:{ label:'SCI/SCE', iniziale:[["sciarpa","🧣"],["scivolo","🛝"],["scienza","🔬"],["scelta","🤔"]],
                   mediana:[["pesce","🐟"],["uscita","🚪"],["ascensore","🛗"],["cuscino","🛏️"],["striscia","🌈"],["nascita","👶"],["crescita","📈"],["prosciutto","🍖"]] },
  t: { label:'T', iniziale:[["tavolo","🪑"],["topo","🐭"],["torta","🎂"],["tigre","🐯"],["tazza","☕"],["tartaruga","🐢"],["tenda","⛺"],["toro","🐂"]],
                   mediana:[["gatto","🐱"],["patata","🥔"],["matita","✏️"],["bottiglia","🍾"],["latte","🥛"],["dita","🖐️"],["aquilotto","🦅"],["gomito","💪"]] },
  v: { label:'V', iniziale:[["vaso","🏺"],["vela","⛵"],["volpe","🦊"],["vulcano","🌋"],["vento","💨"],["valigia","🧳"],["vacca","🐄"],["verme","🪱"]],
                   mediana:[["uovo","🥚"],["avvocato","🥑"],["chiave","🔑"],["cavallo","🐴"],["uva","🍇"],["divano","🛋️"],["nave","🚢"],["polvere","💨"]] },
  z_dz:{ label:'Z (sonora)', iniziale:[["zaino","🎒"],["zanzara","🦟"],["zero","0️⃣"],["zolla","🌱"]],
                   mediana:[["orzo","🌾"],["mezzo","🚌"],["azzurro","🔵"],["zenzero","🫚"]] },
  zeta:{ label:'Zeta', iniziale:[["zebra","🦓"],["zucca","🎃"],["zucchero","🍬"],["zio","👨"]],
                   mediana:[["pizza","🍕"],["pazzo","🤪"],["ragazzo","👦"],["palazzo","🏰"]] },
  z_ts:{ label:'Z (sorda)', iniziale:[["zucchero","🍬"],["zucca","🎃"],["zitto","🤫"],["zampa","🐾"]],
                   mediana:[["pizza","🍕"],["calzino","🧦"],["marzo","📅"],["piazza","🏛️"]] },
};

// Fonemi inclusi nel piano gratuito — vedi nota in wordBank.ts (Expo app)
const FREE_PHONEMES = ["m", "n", "p", "t", "l", "s"];
const isPremium = (key) => !FREE_PHONEMES.includes(key);

// Coppie minime curate — stesso set di src/constants/wordBank.ts
const MINIMAL_PAIRS = {
  s: [["sole", "☀️"], ["sale", "🧂"]],
  z_ts: [["razzo", "🚀"], ["riso", "🍚"]],
  r: [["rana", "🐸"], ["lana", "🧶"]],
  l: [["luna", "🌙"], ["una", "1️⃣"]],
  t: [["tana", "🕳️"], ["dana", "➖"]],
  c: [["cane", "🐶"], ["pane", "🍞"]],
  p: [["palla", "⚽"], ["balla", "💃"]],
};

function wordsFor(key, position) {
  const entry = WORD_BANK[key];
  const primary = entry[position];
  if (primary && primary.length) return primary;
  return entry.iniziale.length ? entry.iniziale : entry.mediana;
}
function pickRandom(arr, n) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}
function distractorPool(excludeKey, n) {
  const others = Object.keys(WORD_BANK).filter((k) => k !== excludeKey);
  let pool = [];
  pickRandom(others, 6).forEach((k) => {
    const entry = WORD_BANK[k];
    pool = pool.concat(entry.iniziale, entry.mediana);
  });
  const core = excludeKey.replace("_cons", "").replace("cons_", "").replace("_dz", "").replace("_ts", "").replace("mnl", "");
  if (core.length > 0 && core.length <= 2) pool = pool.filter((pair) => !pair[0].toLowerCase().includes(core));
  return pickRandom(pool, n);
}
function say(text) {
  if (!window.speechSynthesis || !text) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "it-IT"; u.rate = 0.92; u.pitch = 1.05;
    window.speechSynthesis.speak(u);
  } catch (e) {}
}

/* ============================================================
   GAMIFICATION ENGINE — stesso di useGamificationStore.ts
   ============================================================ */
function isSameWeek(a, b) { return Math.abs(new Date(a).getTime() - new Date(b).getTime()) < 7 * 86400000; }
function updateStreak(streak, sessionDate) {
  if (!streak.lastSessionDate) return { ...streak, sessionsThisWeek: 1, lastSessionDate: sessionDate };
  const sameWeek = isSameWeek(streak.lastSessionDate, sessionDate);
  const daysSinceLast = (new Date(sessionDate).getTime() - new Date(streak.lastSessionDate).getTime()) / 86400000;
  let graceDaysRemaining = streak.graceDaysRemaining, currentWeeks = streak.currentWeeks;
  let sessionsThisWeek = sameWeek ? streak.sessionsThisWeek + 1 : 1;
  if (!sameWeek) {
    if (streak.sessionsThisWeek >= 3) currentWeeks += 1;
    else if (graceDaysRemaining > 0 && daysSinceLast <= 10) graceDaysRemaining -= 1;
    else currentWeeks = 0;
  }
  return { currentWeeks, sessionsThisWeek, graceDaysRemaining, lastSessionDate: sessionDate };
}
function recordSession(profile, result) {
  const totalStars = result.attempts.reduce((s, a) => s + a.starsAwarded, 0);
  const avgConfidence = result.attempts.reduce((s, a) => s + a.confidenceScore, 0) / Math.max(result.attempts.length, 1);
  const updatedGroups = profile.phonemeGroups.map((group) => {
    if (group.id !== result.phonemeGroupId) return group;
    const updatedLevels = group.levels.map((lvl) => {
      if (lvl.level !== result.level) return lvl;
      let status = lvl.status === "available" ? "in_progress" : lvl.status;
      const starsEarned = lvl.starsEarned + totalStars;
      const starsPossible = lvl.starsPossible + result.attempts.length * 3;
      if (avgConfidence >= lvl.masteryThreshold && status === "in_progress") status = "mastered";
      return { ...lvl, starsEarned, starsPossible, status };
    });
    const idx = updatedLevels.findIndex((l) => l.level === result.level);
    if (group.unlockedByTherapist && updatedLevels[idx].status === "mastered" &&
        idx + 1 < updatedLevels.length && updatedLevels[idx + 1].status === "locked") {
      updatedLevels[idx + 1] = { ...updatedLevels[idx + 1], status: "available" };
    }
    return { ...group, levels: updatedLevels };
  });
  const newStreak = updateStreak(profile.streak, result.completedAt.slice(0, 10));
  const gemsAwarded = newStreak.currentWeeks > profile.streak.currentWeeks ? 5 : 0;
  return { ...profile, stars: profile.stars + totalStars, gems: profile.gems + gemsAwarded, streak: newStreak, phonemeGroups: updatedGroups };
}

// Seed identico a App.tsx — "assignedToday" qui è demo: in produzione arriva
// dal backend condiviso con l'app separata del logopedista (non ancora
// costruita), non è generato da questa app.
const SEED_PROFILE = {
  displayName: "Marco",
  stars: 0, gems: 0,
  streak: { currentWeeks: 0, sessionsThisWeek: 0, graceDaysRemaining: 2, lastSessionDate: null },
  phonemeGroups: [{
    id: "r", name: "Suono R", unlockedByTherapist: true,
    levels: [1, 2, 3, 4, 5].map((level) => ({
      level, status: level <= 3 ? "in_progress" : "locked", masteryThreshold: 0.75,
      starsEarned: level === 1 ? 6 : level === 2 ? 3 : 0, starsPossible: level <= 2 ? 9 : 0,
    })),
  }],
  assignedToday: [
    { id: "today-1", exerciseType: "caccia", exerciseLabel: "Caccia al suono", phonemeGroupId: "r", phonemeLabel: "R", position: "iniziale", level: 3, levelRangeLabel: "livello 3" },
    { id: "today-2", exerciseType: "registratore", exerciseLabel: "Registratore", phonemeGroupId: "r", phonemeLabel: "R", position: "mediana", level: 3, levelRangeLabel: "livello 3" },
    { id: "today-3", exerciseType: "memory", exerciseLabel: "Memory dei suoni", phonemeGroupId: "r", phonemeLabel: "R", position: "iniziale", level: 2, levelRangeLabel: "livello 2–3" },
  ],
};

/* ============================================================
   COMPONENTI CONDIVISI
   ============================================================ */
function Button({ children, onClick, disabled, style }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="rounded-full font-bold px-6 py-3 text-white transition active:scale-95 disabled:opacity-30"
      style={{ backgroundColor: C.coral, boxShadow: `0 4px 0 ${C.coralDeep}`, ...style }}
    >
      {children}
    </button>
  );
}
function GhostButton({ children, onClick }) {
  return (
    <button onClick={onClick} className="rounded-full font-semibold px-4 py-2 text-xs"
      style={{ border: `1.5px solid ${C.jade}`, color: C.jadeDeep, background: "#fff" }}>
      {children}
    </button>
  );
}

/* ============================================================
   ONBOARDING
   ============================================================ */
function Screen({ children }) {
  return <div className="flex flex-col h-full p-6 pt-14" style={{ background: C.paper }}>{children}</div>;
}
function H1({ children }) { return <h1 className="text-2xl font-extrabold" style={{ color: C.ink }}>{children}</h1>; }
function P({ children }) { return <p className="mt-3" style={{ color: C.inkSoft }}>{children}</p>; }
function TextInput(props) {
  return <input {...props} className="mt-6 rounded-xl p-3 text-lg" style={{ border: `2px solid ${C.jade}` }} />;
}

function TrustScreen({ onNext }) {
  return (
    <Screen>
      <H1>Lallo segue la scala clinica{"\n"}usata dai logopedisti</H1>
      <P>Ogni esercizio è strutturato sui 5 livelli di sviluppo fonetico, così puoi seguire i progressi reali di tuo figlio.</P>
      <div className="flex-1" />
      <Button onClick={onNext}>Continua</Button>
    </Screen>
  );
}
function TherapistLinkScreen({ onCode, onWaitlist, onSkip }) {
  return (
    <Screen>
      <H1>Hai un codice del tuo logopedista?</H1>
      <P>Se il tuo logopedista ti ha dato un codice, collegalo per sbloccare gli esercizi assegnati.</P>
      <div className="flex-1" />
      <Button onClick={onCode}>Ho un codice</Button>
      <button onClick={onWaitlist} className="mt-3 rounded-2xl p-4 text-center" style={{ border: `2px solid ${C.jade}` }}>
        <div className="font-bold" style={{ color: C.jade }}>Non ho un logopedista</div>
        <div className="text-xs mt-1" style={{ color: C.inkSoft }}>Fatti assegnare un logopedista Lallo da remoto</div>
      </button>
      <button onClick={onSkip} className="mt-4 underline text-sm" style={{ color: C.inkSoft }}>Non ancora, continua senza codice</button>
    </Screen>
  );
}
function TherapistCodeEntryScreen({ onNext }) {
  const [code, setCode] = useState("");
  return (
    <Screen>
      <H1>Inserisci il codice</H1>
      <P>Te lo ha fornito il tuo logopedista.</P>
      <TextInput value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Es. LOGO-2024-XXXX" />
      <div className="flex-1" />
      <Button disabled={code.length < 4} onClick={onNext}>Continua</Button>
    </Screen>
  );
}
function RemoteTherapistWaitlistScreen({ onNext }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  if (submitted) {
    return (
      <Screen>
        <H1>Ti abbiamo messo in lista ✅</H1>
        <P>Ti contatteremo appena avremo un logopedista disponibile nella tua zona.</P>
        <div className="flex-1" />
        <Button onClick={onNext}>Continua</Button>
      </Screen>
    );
  }
  return (
    <Screen>
      <H1>Presto disponibile</H1>
      <P>Lasciaci la tua email e sarai tra i primi ad essere contattato.</P>
      <TextInput value={email} onChange={(e) => setEmail(e.target.value)} placeholder="La tua email" />
      <div className="flex-1" />
      <Button disabled={email.length < 5} onClick={() => setSubmitted(true)}>Iscrivimi alla lista</Button>
      <button onClick={onNext} className="mt-3 underline text-sm" style={{ color: C.inkSoft }}>Continua senza iscrivermi</button>
    </Screen>
  );
}
function ChildNameScreen({ onNext }) {
  const [name, setName] = useState("");
  return (
    <Screen>
      <H1>Come si chiama tuo figlio?</H1>
      <P>Ci aiuta a personalizzare l'esperienza nell'app.</P>
      <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" />
      <div className="flex-1" />
      <Button disabled={!name} onClick={() => onNext(name)}>Continua</Button>
    </Screen>
  );
}
function ChildBirthdateScreen({ name, onNext }) {
  return (
    <Screen>
      <H1>Quando è nato {name || "il tuo bambino"}?</H1>
      <P>Ci serve la data di nascita per proporre esercizi adatti alla sua età.</P>
      <TextInput type="date" />
      <div className="flex-1" />
      <Button onClick={onNext}>Continua</Button>
    </Screen>
  );
}
const WORD_COUNT_OPTIONS = ["0 parole", "1–5 parole", "6–10 parole", "11–50 parole", "50+ parole"];
function ProgressBar({ step, total }) {
  return <div className="h-1.5 rounded-full flex-1" style={{ background: C.mist }}><div className="h-full rounded-full" style={{ width: `${(step / total) * 100}%`, background: C.jade }} /></div>;
}
function DiagHeader({ onBack, step, total = 6 }) {
  return <div className="flex items-center gap-3 mb-6"><button onClick={onBack} style={{ color: C.jade }} className="text-xl">←</button><ProgressBar step={step} total={total} /></div>;
}

function WordCountScreen({ name, onNext, onBack }) {
  return (
    <Screen>
      <DiagHeader onBack={onBack} step={1} />
      <H1>All'incirca quante parole dice {name}?</H1>
      {WORD_COUNT_OPTIONS.map((opt) => (
        <button key={opt} onClick={() => onNext(opt)} className="rounded-2xl p-4 mt-3 text-center font-bold" style={{ border: `2px solid ${C.coral}`, color: C.coral }}>{opt}</button>
      ))}
      <button onClick={() => onNext(null)} className="mt-4 underline text-sm" style={{ color: C.inkSoft }}>Non so dirlo</button>
    </Screen>
  );
}
function EvaluatedByTherapistScreen({ name, onNext, onBack }) {
  return (
    <Screen>
      <DiagHeader onBack={onBack} step={2} />
      <H1>{name} è mai stato valutato da un logopedista?</H1>
      <div className="flex-1" />
      <div className="flex justify-center gap-5 mb-6">
        <button onClick={() => onNext(true)} className="w-24 h-24 rounded-full text-white font-extrabold" style={{ background: C.coral }}>Sì</button>
        <button onClick={() => onNext(false)} className="w-24 h-24 rounded-full font-extrabold" style={{ border: `2px solid ${C.coral}`, color: C.coral }}>No</button>
      </div>
      <button onClick={() => onNext(null)} className="underline text-sm text-center" style={{ color: C.inkSoft }}>Non so dirlo</button>
    </Screen>
  );
}
const CONDITIONS = ["Ritardo del linguaggio", "Disturbo dello spettro autistico", "Disprassia verbale", "Disturbo specifico del linguaggio (DSL)", "Ipoacusia", "Palatoschisi", "Balbuzie", "Nessuna di queste", "Non so"];
function DiagnosedConditionsScreen({ evaluated, onNext, onBack }) {
  const wasEvaluated = evaluated === true;
  const [selected, setSelected] = useState([]);
  const [other, setOther] = useState("");
  const toggle = (c) => setSelected((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));
  const title = wasEvaluated ? "Quali di queste condizioni sono state diagnosticate?" : "Cosa pensi possano essere le sue difficoltà?";
  return (
    <Screen>
      <DiagHeader onBack={onBack} step={3} />
      <H1>{title}</H1>
      {!wasEvaluated && <P>Nessun problema se non ne sei sicuro — è solo un'impressione, non serve una diagnosi.</P>}
      <div className="flex-1 overflow-y-auto mt-2">
        {CONDITIONS.map((c) => {
          const on = selected.includes(c);
          return (
            <button key={c} onClick={() => toggle(c)} className="w-full flex items-center gap-3 py-3 text-left" style={{ borderBottom: "1px solid #eee" }}>
              <div className="w-5 h-5 rounded flex items-center justify-center" style={{ border: `2px solid ${on ? C.coral : C.line}`, background: on ? C.coral : "#fff" }}>
                {on && <span className="text-white text-xs font-bold">✓</span>}
              </div>
              <span className="text-sm" style={{ color: C.ink }}>{c}</span>
            </button>
          );
        })}
        <div className="text-xs font-bold mt-4 mb-1" style={{ color: C.inkSoft }}>Altro (facoltativo)</div>
        <textarea
          value={other}
          onChange={(e) => setOther(e.target.value)}
          placeholder="Scrivi qui se manca qualcosa nell'elenco"
          className="w-full rounded-xl p-3 text-sm"
          style={{ border: `1.5px solid ${C.line}`, minHeight: 60 }}
        />
      </div>
      <Button onClick={() => onNext(selected)}>Continua</Button>
    </Screen>
  );
}
function StrugglingSoundsScreen({ onNext, onBack }) {
  const [selected, setSelected] = useState([]);
  const toggle = (k) => setSelected((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));
  return (
    <Screen>
      <DiagHeader onBack={onBack} step={4} />
      <H1>Quali suoni fa fatica a pronunciare?</H1>
      <P>Scegli quelli che riconosci — ti aiutiamo a costruire il punto di partenza.</P>
      <div className="flex-1 overflow-y-auto mt-3">
        <div className="grid grid-cols-3 gap-2">
          {Object.keys(WORD_BANK).map((key) => {
            const on = selected.includes(key);
            const example = WORD_BANK[key].iniziale[0] || WORD_BANK[key].mediana[0];
            return (
              <button key={key} onClick={() => toggle(key)} className="rounded-xl p-2 text-center"
                style={{ border: `1.5px solid ${C.line}`, background: on ? C.jade : "#fff" }}>
                <div className="font-extrabold text-sm" style={{ color: on ? "#fff" : C.ink }}>{WORD_BANK[key].label}</div>
                {example && <div className="text-xs mt-0.5" style={{ color: on ? "#fff" : C.inkSoft }}>{example[0]}</div>}
              </button>
            );
          })}
        </div>
      </div>
      <Button onClick={() => onNext(selected)}>Continua</Button>
    </Screen>
  );
}
function TrustStatScreen({ onNext, onBack }) {
  return (
    <Screen>
      <DiagHeader onBack={onBack} step={5} />
      <H1>Quasi 1 bambino su 10 in età prescolare mostra una difficoltà di linguaggio</H1>
      <P>Con esercizi mirati e pratica regolare, molte difficoltà di articolazione migliorano nel tempo — prima si inizia, più la pratica quotidiana aiuta.</P>
      <div className="flex-1" />
      <Button onClick={onNext}>Continua</Button>
    </Screen>
  );
}
function ResultsScreen({ name, strugglingSounds, onNext }) {
  const [calculating, setCalculating] = useState(true);
  useEffect(() => { const t = setTimeout(() => setCalculating(false), 1400); return () => clearTimeout(t); }, []);
  if (calculating) {
    return <Screen><div className="flex-1 flex items-center justify-center"><p className="font-semibold" style={{ color: C.jade }}>Prepariamo il piano di {name}…</p></div></Screen>;
  }
  const sounds = strugglingSounds.length ? strugglingSounds : ["r"];
  return (
    <Screen>
      <H1>Ecco da dove iniziamo</H1>
      <P>In base a quello che ci hai detto, il piano di {name} parte da questi suoni:</P>
      <div className="flex flex-wrap gap-2 mt-4">
        {sounds.map((k) => <div key={k} className="rounded-full px-4 py-2 text-white font-bold" style={{ background: C.jade }}>{WORD_BANK[k].label}</div>)}
      </div>
      <p className="text-xs italic mt-6" style={{ color: C.inkSoft }}>
        Non è una diagnosi. Se {name} non ha ancora un logopedista, ti consigliamo di farlo valutare — l'app resta uno strumento di pratica, non uno strumento clinico.
      </p>
      <div className="flex-1" />
      <Button onClick={onNext}>Vedi il piano completo</Button>
    </Screen>
  );
}

const PLANS = [
  { id: "monthly", label: "1 mese", price: "6,99 €", sub: null },
  { id: "biannual", label: "6 mesi", price: "34,99 €", sub: "≈ 5,83 €/mese" },
  { id: "annual", label: "12 mesi", price: "54,99 €", sub: "≈ 4,58 €/mese · più conveniente" },
];
function PaywallScreen({ onSubscribe, onFree }) {
  const [plan, setPlan] = useState("annual");
  const premiumCount = Object.keys(WORD_BANK).length - FREE_PHONEMES.length;
  return (
    <div className="h-full overflow-y-auto p-6 pt-12" style={{ background: C.paper }}>
      <h1 className="text-2xl font-extrabold text-center" style={{ color: C.ink }}>Sblocca tutti i {Object.keys(WORD_BANK).length} fonemi</h1>
      <p className="text-center text-sm mt-3" style={{ color: C.inkSoft }}>
        Con il piano gratuito hai accesso a {FREE_PHONEMES.length} suoni comuni ({FREE_PHONEMES.map((k) => WORD_BANK[k].label).join(", ")}).
        L'abbonamento sblocca gli altri {premiumCount}, inclusi gruppi consonantici e digrammi.
      </p>
      <div className="mt-7">
        {PLANS.map((p) => {
          const on = plan === p.id;
          return (
            <button key={p.id} onClick={() => setPlan(p.id)} className="w-full flex justify-between items-center rounded-2xl p-4 mb-3"
              style={{ border: `2px solid ${on ? C.jade : C.line}`, background: on ? "#E9F5F1" : "#fff" }}>
              <div className="text-left">
                <div className="font-bold" style={{ color: on ? C.jade : C.ink }}>{p.label}</div>
                {p.sub && <div className="text-xs mt-0.5" style={{ color: on ? C.jade : C.inkSoft }}>{p.sub}</div>}
              </div>
              <div className="font-extrabold text-lg" style={{ color: on ? C.jade : C.ink }}>{p.price}</div>
            </button>
          );
        })}
      </div>
      <button onClick={onSubscribe} className="w-full rounded-full py-4 text-white font-extrabold mt-2" style={{ background: C.coral, boxShadow: `0 4px 0 ${C.coralDeep}` }}>Continua</button>
      <p className="text-xs text-center mt-2" style={{ color: C.inkSoft }}>Annullabile in qualsiasi momento. Nessun addebito prima della conferma.</p>
      <button onClick={onFree} className="w-full mt-4 underline text-sm" style={{ color: C.jade }}>Continua con il piano gratuito ({FREE_PHONEMES.length} suoni)</button>
    </div>
  );
}

/* ============================================================
   HOME / OGGI — fedele alla demo (saluto, streak, reward, card)
   ============================================================ */
const ICON_BG = { caccia: "#FDECE7", registratore: "#E9F5F1", memory: "#FFF3D6", coppie: "#FDECE7", oca: "#E9F5F1", sequenze: "#FFF3D6" };
const ICON_EMOJI = { caccia: "🔎", registratore: "🎤", memory: "🧩", coppie: "👯", oca: "🎲", sequenze: "📖" };

function ExerciseCard({ icon, bg, title, meta, onClick }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 rounded-2xl p-3 mb-3 text-left"
      style={{ background: "#fff", border: `1.5px solid ${C.line}` }}>
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl" style={{ background: bg }}>{icon}</div>
      <div className="flex-1">
        <div className="font-bold text-sm" style={{ color: C.ink }}>{title}</div>
        <div className="text-xs mt-0.5" style={{ color: C.inkSoft }}>{meta}</div>
      </div>
      <div style={{ color: C.line }} className="text-lg">›</div>
    </button>
  );
}

function HomeScreen({ profile, onOpenExercise, onOpenParentGate }) {
  const todayKey = profile.assignedToday[0]?.phonemeGroupId;
  const todayLabel = todayKey ? WORD_BANK[todayKey].label : "—";
  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: C.paper }}>
      <div className="p-4 pt-6 flex items-start justify-between">
        <div>
          <div className="font-bold" style={{ color: C.ink }}>Ciao, {profile.displayName}! 👋</div>
          <div className="text-xs mt-0.5" style={{ color: C.inkSoft }}>Suono di oggi: la {todayLabel}</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onOpenParentGate} className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "#fff", border: `1.5px solid ${C.line}` }}>👪</button>
          <div className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: C.mist, color: C.jadeDeep }}>
            🔥 {profile.streak.currentWeeks || 1} giorni
          </div>
        </div>
      </div>
      <div className="mx-4 rounded-2xl p-4 mb-4 flex items-center" style={{ background: C.sun }}>
        <div>
          <div className="font-extrabold text-2xl" style={{ color: C.ink }}>{profile.assignedToday.length}</div>
          <div className="text-xs" style={{ color: C.ink }}>giochi per oggi</div>
        </div>
        <div className="ml-auto flex gap-1 text-lg">⭐🦜🎖️</div>
      </div>
      <div className="px-4">
        <div className="text-xs font-bold uppercase mb-2" style={{ color: C.inkSoft }}>Da fare oggi</div>
        {profile.assignedToday.map((ex) => (
          <ExerciseCard
            key={ex.id}
            icon={ICON_EMOJI[ex.exerciseType]}
            bg={ICON_BG[ex.exerciseType]}
            title={ex.exerciseLabel}
            meta={`${ex.phonemeLabel} ${ex.position} · ${ex.levelRangeLabel}`}
            onClick={() => onOpenExercise(ex)}
          />
        ))}
      </div>
    </div>
  );
}

function GiochiScreen({ profile, onOpenExercise }) {
  const defaultPlan = profile.assignedToday[0];
  const games = [
    { type: "caccia", label: "Caccia al suono", meta: "Discriminazione · liv. 1–3" },
    { type: "registratore", label: "Registratore", meta: "Produzione · liv. 3–5" },
    { type: "memory", label: "Memory", meta: "Discriminazione · liv. 2–3" },
    { type: "coppie", label: "Coppie minime", meta: "Discriminazione fine · liv. 3" },
    { type: "oca", label: "Gioco dell'oca", meta: "Produzione · liv. 3–4" },
    { type: "sequenze", label: "Sequenze illustrate", meta: "Narrazione · liv. 5" },
  ];
  return (
    <div className="h-full overflow-y-auto p-4 pt-6" style={{ background: C.paper }}>
      <div className="text-xs font-bold uppercase mb-2" style={{ color: C.inkSoft }}>Tutti i giochi</div>
      {games.map((g) => (
        <ExerciseCard
          key={g.type}
          icon={ICON_EMOJI[g.type]}
          bg={ICON_BG[g.type]}
          title={g.label}
          meta={g.meta}
          onClick={() => defaultPlan && onOpenExercise({ ...defaultPlan, exerciseType: g.type, exerciseLabel: g.label })}
        />
      ))}
    </div>
  );
}

function ProgressiScreen({ profile }) {
  const totalStickers = profile.phonemeGroups.reduce((s, g) => s + g.levels.filter((l) => l.status === "mastered").length, 0);
  return (
    <div className="h-full overflow-y-auto p-4 pt-6" style={{ background: C.paper }}>
      <div className="text-xs font-bold uppercase mb-3" style={{ color: C.inkSoft }}>
        I progressi di {profile.displayName?.toUpperCase()}
      </div>
      {profile.phonemeGroups.map((group) =>
        group.levels.filter((l) => l.status !== "locked").map((lvl) => {
          const pct = lvl.starsPossible ? Math.round((lvl.starsEarned / lvl.starsPossible) * 100) : 0;
          return (
            <div key={`${group.id}-${lvl.level}`} className="mb-3.5">
              <div className="flex justify-between text-xs font-semibold mb-1" style={{ color: C.ink }}>
                <span>{group.name} · livello {lvl.level}</span><span>{pct}%</span>
              </div>
              <div className="h-2.5 rounded-full overflow-hidden" style={{ background: C.mist }}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: C.jade }} />
              </div>
            </div>
          );
        })
      )}
      <div className="rounded-2xl p-4 mt-4 flex items-center" style={{ background: C.sun }}>
        <div>
          <div className="font-extrabold text-2xl" style={{ color: C.ink }}>{totalStickers}</div>
          <div className="text-xs" style={{ color: C.ink }}>stickers conquistati</div>
        </div>
        <div className="ml-auto flex gap-1 text-lg">🦜⭐🏆🎈</div>
      </div>
    </div>
  );
}

/* ============================================================
   SESSION — 3 giochi giocabili
   ============================================================ */
function SessionScreen({ ex, onDone, onBack }) {
  const [attempts, setAttempts] = useState([]);
  const meta = WORD_BANK[ex.phonemeGroupId];
  const logAttempt = (word, correct) => setAttempts((p) => [...p, { targetPhoneme: ex.phonemeGroupId, confidenceScore: correct ? 1 : 0.35, starsAwarded: correct ? 3 : 1 }]);
  const finish = () => onDone({ phonemeGroupId: ex.phonemeGroupId, level: ex.level, attempts, completedAt: new Date().toISOString() });

  return (
    <div className="h-full flex flex-col p-4 pt-6" style={{ background: C.paper }}>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-2xl" style={{ color: C.jade }}>‹</button>
        <div className="text-lg font-extrabold" style={{ color: C.ink }}>{ex.exerciseLabel}</div>
      </div>
      {ex.exerciseType === "caccia" && <CacciaAlSuono phonemeKey={ex.phonemeGroupId} position={ex.position} meta={meta} onAttempt={logAttempt} onDone={finish} />}
      {ex.exerciseType === "memory" && <MemoryGame phonemeKey={ex.phonemeGroupId} position={ex.position} meta={meta} onAttempt={logAttempt} onDone={finish} />}
      {ex.exerciseType === "registratore" && <Registratore phonemeKey={ex.phonemeGroupId} position={ex.position} meta={meta} onAttempt={logAttempt} onDone={finish} />}
      {ex.exerciseType === "coppie" && <CoppieMinime phonemeKey={ex.phonemeGroupId} meta={meta} onAttempt={logAttempt} onDone={finish} />}
      {ex.exerciseType === "oca" && <GiocoDellOca phonemeKey={ex.phonemeGroupId} position={ex.position} onAttempt={logAttempt} onDone={finish} />}
      {ex.exerciseType === "sequenze" && <SequenzeIllustrate onDone={finish} />}
    </div>
  );
}

function CacciaAlSuono({ phonemeKey, position, meta, onAttempt, onDone }) {
  const [round, setRound] = useState(0);
  const tiles = useMemo(() => {
    const targets = pickRandom(wordsFor(phonemeKey, position), 3).map((w) => ({ word: w[0], emoji: w[1], correct: true }));
    const distractors = distractorPool(phonemeKey, 3).map((w) => ({ word: w[0], emoji: w[1], correct: false }));
    return pickRandom([...targets, ...distractors], 6);
  }, [phonemeKey, position, round]);
  const targetCount = tiles.filter((t) => t.correct).length;
  const [picked, setPicked] = useState({});

  useEffect(() => { say(`Trova le ${targetCount} parole con il suono ${meta.label}`); }, [round]);

  const pick = (t) => {
    if (picked[t.word] !== undefined) return;
    setPicked((p) => ({ ...p, [t.word]: t.correct }));
    onAttempt(t.word, t.correct);
    say(t.word);
  };

  return (
    <div className="flex-1 flex flex-col">
      <p className="text-center mb-3" style={{ color: C.inkSoft }}>Trova le {targetCount} parole con il suono {meta.label} 🦜</p>
      <div className="grid grid-cols-2 gap-3">
        {tiles.map((t) => {
          const state = picked[t.word];
          const border = state === true ? C.jade : state === false ? C.coral : C.line;
          const bg = state === true ? "#E9F5F1" : state === false ? "#FDECE7" : "#fff";
          return (
            <button key={t.word} onClick={() => pick(t)} className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-1"
              style={{ border: `2px solid ${border}`, background: bg }}>
              <span className="text-3xl">{t.emoji}</span>
              <span className="font-bold text-sm">{t.word}</span>
            </button>
          );
        })}
      </div>
      <div className="flex justify-center gap-3 mt-4 flex-wrap">
        <GhostButton onClick={() => { setPicked({}); setRound((r) => r + 1); }}>🔀 Nuove parole</GhostButton>
        {Object.keys(picked).length >= 4 && <Button onClick={onDone}>Fatto ✓</Button>}
      </div>
    </div>
  );
}

function MemoryGame({ phonemeKey, position, meta, onAttempt, onDone }) {
  const [round, setRound] = useState(0);
  const cards = useMemo(() => {
    const chosen = pickRandom(wordsFor(phonemeKey, position), 3);
    return pickRandom([...chosen, ...chosen], 6).map((w, idx) => ({ word: w[0], emoji: w[1], uid: `${w[0]}-${idx}` }));
  }, [phonemeKey, position, round]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [firstUid, setFirstUid] = useState(null);

  function flip(card) {
    if (flipped.includes(card.uid) || matched.includes(card.word)) return;
    say(card.word);
    setFlipped((f) => [...f, card.uid]);
    if (!firstUid) { setFirstUid(card.uid); return; }
    const first = cards.find((c) => c.uid === firstUid);
    if (first.word === card.word) {
      setMatched((m) => { const next = [...m, card.word]; if (next.length === 3) setTimeout(onDone, 800); return next; });
      onAttempt(card.word, true);
      setFirstUid(null);
      setFlipped((f) => f.filter((u) => u !== firstUid && u !== card.uid));
    } else {
      onAttempt(card.word, false);
      setTimeout(() => setFlipped((f) => f.filter((u) => u !== firstUid && u !== card.uid)), 700);
      setFirstUid(null);
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <p className="text-center mb-3" style={{ color: C.inkSoft }}>Trova le coppie con {meta.label} 🦜</p>
      <div className="grid grid-cols-3 gap-2">
        {cards.map((c) => {
          const shown = flipped.includes(c.uid) || matched.includes(c.word);
          return (
            <button key={c.uid} onClick={() => flip(c)} className="aspect-square rounded-xl flex items-center justify-center text-2xl"
              style={{ border: `2px solid ${C.jade}`, background: shown ? "#fff" : C.jade, color: shown ? C.ink : "#fff" }}>
              {shown ? c.emoji : "?"}
            </button>
          );
        })}
      </div>
      <div className="flex justify-center mt-4">
        <GhostButton onClick={() => { setFlipped([]); setMatched([]); setFirstUid(null); setRound((r) => r + 1); }}>🔀 Nuove carte</GhostButton>
      </div>
    </div>
  );
}

function Registratore({ phonemeKey, position, meta, onAttempt, onDone }) {
  const [round, setRound] = useState(0);
  const word = useMemo(() => pickRandom(wordsFor(phonemeKey, position), 1)[0], [phonemeKey, position, round]);
  const [recording, setRecording] = useState(false);
  const [attemptsThisWord, setAttemptsThisWord] = useState(0);

  const toggleRecord = () => {
    if (!recording) setRecording(true);
    else { setRecording(false); setAttemptsThisWord((a) => a + 1); onAttempt(word[0], true); }
  };

  return (
    <div className="flex-1 flex flex-col items-center">
      <p className="mb-2" style={{ color: C.inkSoft }}>Ascolta, poi prova tu</p>
      <div className="text-6xl mt-4">{word[1]}</div>
      <div className="text-3xl font-extrabold mt-2" style={{ color: C.ink }}>{word[0]}</div>
      <div className="text-sm mb-6" style={{ color: C.inkSoft }}>{meta.label} · {position}</div>
      <div className="flex gap-5 mb-6">
        <button onClick={() => say(word[0])} className="w-14 h-14 rounded-full text-white text-2xl" style={{ background: C.jade }}>▶</button>
        <button onClick={toggleRecord} className="w-16 h-16 rounded-full text-white text-3xl" style={{ background: recording ? C.coralDeep : C.coral }}>
          {recording ? "⏸" : "🎤"}
        </button>
      </div>
      <div className="flex gap-3 flex-wrap justify-center">
        <GhostButton onClick={() => setRound((r) => r + 1)}>🔀 Nuova parola</GhostButton>
        {attemptsThisWord > 0 && <Button onClick={onDone}>Fatto ✓</Button>}
      </div>
    </div>
  );
}

function CoppieMinime({ phonemeKey, meta, onAttempt, onDone }) {
  const pair = MINIMAL_PAIRS[phonemeKey] || MINIMAL_PAIRS.s;
  const target = pair[1];
  const [picked, setPicked] = useState(null);

  function pick(w) {
    if (picked) return;
    setPicked(w[0]);
    onAttempt(w[0], w[0] === target[0]);
    say(w[0]);
  }

  return (
    <div className="flex-1 flex flex-col">
      <p className="text-center mb-2" style={{ color: C.inkSoft }}>Ascolta, poi tocca la parola che hai sentito.</p>
      {!MINIMAL_PAIRS[phonemeKey] && (
        <p className="text-center text-xs italic mb-2" style={{ color: "#B08900" }}>Coppia di esempio — da personalizzare per {meta.label}</p>
      )}
      <div className="flex justify-center mb-4">
        <button onClick={() => say(target[0])} className="w-14 h-14 rounded-full text-white text-2xl" style={{ background: C.jade }}>▶</button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {pair.map((w) => {
          const isTarget = w[0] === target[0];
          const state = picked === null ? null : w[0] === picked;
          const border = picked !== null && isTarget ? C.jade : state === true && !isTarget ? C.coral : C.line;
          const bg = picked !== null && isTarget ? "#E9F5F1" : state === true && !isTarget ? "#FDECE7" : "#fff";
          return (
            <button key={w[0]} onClick={() => pick(w)} className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-1"
              style={{ border: `2px solid ${border}`, background: bg }}>
              <span className="text-3xl">{w[1]}</span>
              <span className="font-bold text-sm">{w[0].toUpperCase()}</span>
            </button>
          );
        })}
      </div>
      {picked && <div className="flex justify-center mt-4"><Button onClick={onDone}>Fatto ✓</Button></div>}
    </div>
  );
}

function GiocoDellOca({ phonemeKey, position, onAttempt, onDone }) {
  const words = useMemo(() => {
    const list = wordsFor(phonemeKey, position);
    const picked = pickRandom(list, Math.min(6, list.length));
    while (picked.length < 6 && list.length) picked.push(list[picked.length % list.length]);
    return picked;
  }, [phonemeKey, position]);
  const [pos, setPos] = useState(0);
  const current = words[pos];

  function advance() {
    onAttempt(current[0], true);
    say(current[0]);
    if (pos < 5) setPos(pos + 1);
    else setTimeout(onDone, 600);
  }

  return (
    <div className="flex-1 flex flex-col items-center">
      <p className="text-center mb-2" style={{ color: C.inkSoft }}>Dì la parola per far avanzare il pappagallo!</p>
      <div className="flex gap-1.5 flex-wrap justify-center my-3">
        {words.map((_, i) => (
          <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ border: `2px solid ${i === pos ? C.coral : C.line}`, background: i === pos ? C.coral : "#fff", color: i === pos ? "#fff" : C.inkSoft }}>
            {i === pos ? "🦜" : i + 1}
          </div>
        ))}
      </div>
      <button onClick={() => say(current[0])}>
        <div className="text-5xl text-center mt-2">{current[1]}</div>
        <div className="text-2xl font-extrabold text-center mb-4" style={{ color: C.ink }}>{current[0]}</div>
      </button>
      <button onClick={advance} className="rounded-2xl py-3 px-6 text-white font-bold" style={{ background: C.jade }}>🦜 Dillo!</button>
      <p className="text-xs mt-3" style={{ color: C.inkSoft }}>Casella {pos + 1} di 6</p>
    </div>
  );
}

function SequenzeIllustrate({ onDone }) {
  const steps = [
    { order: 1, emoji: "🌧️", text: "Prima piove...", said: "Prima piove" },
    { order: 2, emoji: "🌈", text: "poi esce l'arcobaleno...", said: "Poi esce l'arcobaleno" },
    { order: 3, emoji: "☀️", text: "e infine torna il sole!", said: "E infine torna il sole" },
  ];
  const [next, setNext] = useState(1);
  const [story, setStory] = useState("Tocca l'immagine giusta per iniziare…");
  const [wrongOrder, setWrongOrder] = useState(null);

  function tap(step) {
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
    <div className="flex-1 flex flex-col">
      <p className="text-center mb-2" style={{ color: C.inkSoft }}>Tocca le immagini in ordine per raccontare la storia.</p>
      <div className="flex gap-2 my-3">
        {steps.map((step) => (
          <button key={step.order} onClick={() => tap(step)} className="flex-1 h-20 rounded-2xl flex items-center justify-center text-3xl relative"
            style={{
              border: `2px solid ${wrongOrder === step.order ? C.coral : step.order < next ? C.jade : C.line}`,
              background: wrongOrder === step.order ? "#FDECE7" : step.order < next ? "#E9F5F1" : "#fff",
            }}>
            {step.emoji}
            {step.order < next && (
              <span className="absolute top-1 left-1 w-4 h-4 rounded-full text-white text-xs flex items-center justify-center" style={{ background: C.jade }}>
                {step.order}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="rounded-2xl p-3" style={{ background: C.mist }}>
        <p className="text-sm" style={{ color: C.ink }}>{story}</p>
      </div>
    </div>
  );
}

/* ============================================================
   ZONA GENITORI — gate + dashboard osservativa
   ============================================================ */
function randomProblem() {
  const a = Math.floor(Math.random() * 6) + 2, b = Math.floor(Math.random() * 6) + 2, correct = a + b;
  const distractors = new Set();
  while (distractors.size < 2) { const d = correct + (Math.floor(Math.random() * 5) - 2); if (d !== correct && d > 0) distractors.add(d); }
  return { a, b, correct, options: [...distractors, correct].sort(() => Math.random() - 0.5) };
}
function AdultGateScreen({ onPass, onBack }) {
  const [problem] = useState(randomProblem);
  const [wrong, setWrong] = useState(false);
  const check = (v) => { if (v === problem.correct) onPass(); else { setWrong(true); setTimeout(() => setWrong(false), 500); } };
  return (
    <div className="flex flex-col items-center h-full p-6 pt-14 relative" style={{ background: C.paper }}>
      <button onClick={onBack} className="absolute top-12 right-5 w-9 h-9 rounded-full font-bold" style={{ background: "#EEE", color: C.jade }}>✕</button>
      <div className="text-5xl mt-10">🔒</div>
      <h1 className="text-2xl font-extrabold mt-4" style={{ color: C.ink }}>Sei un adulto?</h1>
      <p className="text-center mt-2 mb-12" style={{ color: C.inkSoft }}>Questa parte è per i genitori. Risolvi il calcolo per continuare.</p>
      <div className="text-4xl font-extrabold mb-8" style={{ color: wrong ? C.coral : C.ink }}>{problem.a} + {problem.b} = ?</div>
      <div className="flex gap-4">
        {problem.options.map((opt) => (
          <button key={opt} onClick={() => check(opt)} className="w-16 h-16 rounded-full text-white text-xl font-extrabold" style={{ background: C.jade }}>{opt}</button>
        ))}
      </div>
    </div>
  );
}
function ParentDashboardScreen({ profile, onBack }) {
  let focus = null;
  profile.phonemeGroups.forEach((group) => group.levels.forEach((lvl) => {
    if (lvl.status !== "in_progress") return;
    const progress = lvl.starsPossible ? lvl.starsEarned / lvl.starsPossible : 0;
    if (!focus || progress < focus.progress) focus = { groupName: group.name, level: lvl.level, progress };
  }));
  return (
    <div className="h-full overflow-y-auto p-4 pt-6" style={{ background: C.paper }}>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-2xl" style={{ color: C.jade }}>‹</button>
        <div className="text-lg font-extrabold" style={{ color: C.ink }}>Progressi di {profile.displayName}</div>
      </div>
      <div className="flex gap-2 mb-4">
        <div className="flex-1 rounded-2xl p-3 text-center" style={{ background: "#fff" }}>
          <div className="text-xl font-extrabold" style={{ color: C.jade }}>{profile.streak.currentWeeks}</div>
          <div className="text-xs mt-1" style={{ color: C.inkSoft }}>settimane di pratica</div>
        </div>
        <div className="flex-1 rounded-2xl p-3 text-center" style={{ background: "#fff" }}>
          <div className="text-xl font-extrabold" style={{ color: C.jade }}>{profile.streak.sessionsThisWeek}/3</div>
          <div className="text-xs mt-1" style={{ color: C.inkSoft }}>sessioni questa settimana</div>
        </div>
      </div>
      {focus && (
        <div className="rounded-2xl p-3 mb-4" style={{ background: "#FFF3D6" }}>
          <div className="font-bold text-sm mb-1">💡 Su cosa concentrarsi</div>
          <div className="text-xs leading-relaxed" style={{ color: C.ink }}>
            {focus.groupName} — livello {focus.level} è al {Math.round(focus.progress * 100)}%. Qualche minuto in più qui aiuta di più che altrove.
          </div>
        </div>
      )}
      <div className="text-xs font-bold uppercase mb-2" style={{ color: C.inkSoft }}>Dettaglio per fonema</div>
      {profile.phonemeGroups.map((group) => (
        <div key={group.id} className="rounded-2xl p-3 mb-3" style={{ background: "#fff" }}>
          <div className="font-extrabold text-sm mb-2">{group.name}</div>
          {group.levels.map((lvl) => {
            const pct = lvl.starsPossible ? Math.round((lvl.starsEarned / lvl.starsPossible) * 100) : 0;
            return (
              <div key={lvl.level} className="flex items-center gap-2 mb-1.5">
                <div className="text-xs w-16" style={{ color: C.inkSoft }}>Livello {lvl.level}</div>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "#eee" }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: C.jade }} />
                </div>
                <div className="text-xs w-9 text-right">{pct}%</div>
              </div>
            );
          })}
        </div>
      ))}
      <div className="rounded-2xl p-3 mt-2 mb-6" style={{ background: C.mist }}>
        <div className="text-xs leading-relaxed" style={{ color: C.jadeDeep }}>
          Per cambiare fonema, posizione o livello assegnato, parlane con il logopedista alla prossima seduta — questa vista serve a tenervi allineati, non sostituisce il piano clinico.
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   TAB BAR + APP ROOT
   ============================================================ */
function TabBar({ active, onChange }) {
  const tabs = [{ id: "oggi", label: "Oggi", icon: "🏠" }, { id: "giochi", label: "Giochi", icon: "🎮" }, { id: "progressi", label: "Progressi", icon: "📈" }];
  return (
    <div className="flex border-t" style={{ borderColor: C.line, background: "#fff" }}>
      {tabs.map((t) => (
        <button key={t.id} onClick={() => onChange(t.id)} className="flex-1 flex flex-col items-center gap-0.5 py-2"
          style={{ color: active === t.id ? C.jade : C.inkSoft }}>
          <span className="text-lg">{t.icon}</span>
          <span className="text-xs font-semibold">{t.label}</span>
        </button>
      ))}
    </div>
  );
}

export default function LalloPreview() {
  const [screen, setScreen] = useState("trust"); // onboarding step, poi "mainTabs" / "session" / "adultGate" / "parentDashboard"
  const [tab, setTab] = useState("oggi");
  const [childName, setChildName] = useState("");
  const [profile, setProfile] = useState(SEED_PROFILE);
  const [activeExercise, setActiveExercise] = useState(null);
  const [hasTherapistCode, setHasTherapistCode] = useState(false);
  const [diagEvaluated, setDiagEvaluated] = useState(null);
  const [diagStrugglingSounds, setDiagStrugglingSounds] = useState([]);

  const completeSession = (result) => {
    setProfile((p) => recordSession(p, result));
    setScreen("mainTabs");
  };

  return (
    <div className="w-full h-screen flex items-center justify-center" style={{ background: "#E7E5E4" }}>
      <div style={{ width: 380, height: 720, borderRadius: 36, border: "8px solid #292524" }} className="bg-white shadow-2xl overflow-hidden relative flex flex-col">
        <div className="flex-1 overflow-hidden">
          {screen === "trust" && <TrustScreen onNext={() => setScreen("therapistLink")} />}
          {screen === "therapistLink" && (
            <TherapistLinkScreen onCode={() => setScreen("therapistCode")} onWaitlist={() => setScreen("waitlist")} onSkip={() => setScreen("childName")} />
          )}
          {screen === "therapistCode" && (
            <TherapistCodeEntryScreen onNext={() => { setHasTherapistCode(true); setScreen("childName"); }} />
          )}
          {screen === "waitlist" && <RemoteTherapistWaitlistScreen onNext={() => setScreen("childName")} />}
          {screen === "childName" && <ChildNameScreen onNext={(name) => { setChildName(name); setProfile((p) => ({ ...p, displayName: name })); setScreen("childBirthdate"); }} />}
          {screen === "childBirthdate" && (
            <ChildBirthdateScreen name={childName} onNext={() => setScreen(hasTherapistCode ? "mainTabs" : "wordCount")} />
          )}
          {screen === "wordCount" && (
            <WordCountScreen name={childName} onBack={() => setScreen("childBirthdate")} onNext={() => setScreen("evaluated")} />
          )}
          {screen === "evaluated" && (
            <EvaluatedByTherapistScreen
              name={childName}
              onBack={() => setScreen("wordCount")}
              onNext={(val) => { setDiagEvaluated(val); setScreen("conditions"); }}
            />
          )}
          {screen === "conditions" && (
            <DiagnosedConditionsScreen evaluated={diagEvaluated} onBack={() => setScreen("evaluated")} onNext={() => setScreen("strugglingSounds")} />
          )}
          {screen === "strugglingSounds" && (
            <StrugglingSoundsScreen
              onBack={() => setScreen("conditions")}
              onNext={(sounds) => { setDiagStrugglingSounds(sounds); setScreen("trustStat"); }}
            />
          )}
          {screen === "trustStat" && <TrustStatScreen onBack={() => setScreen("strugglingSounds")} onNext={() => setScreen("results")} />}
          {screen === "results" && (
            <ResultsScreen name={childName} strugglingSounds={diagStrugglingSounds} onNext={() => setScreen("paywall")} />
          )}
          {screen === "paywall" && (
            <PaywallScreen
              onSubscribe={() => { setProfile((p) => ({ ...p, subscriptionActive: true })); setScreen("mainTabs"); }}
              onFree={() => setScreen("mainTabs")}
            />
          )}

          {screen === "mainTabs" && tab === "oggi" && (
            <HomeScreen profile={profile} onOpenExercise={(ex) => { setActiveExercise(ex); setScreen("session"); }} onOpenParentGate={() => setScreen("adultGate")} />
          )}
          {screen === "mainTabs" && tab === "giochi" && (
            <GiochiScreen profile={profile} onOpenExercise={(ex) => { setActiveExercise(ex); setScreen("session"); }} />
          )}
          {screen === "mainTabs" && tab === "progressi" && <ProgressiScreen profile={profile} />}

          {screen === "session" && activeExercise && (
            <SessionScreen ex={activeExercise} onDone={completeSession} onBack={() => setScreen("mainTabs")} />
          )}
          {screen === "adultGate" && <AdultGateScreen onPass={() => setScreen("parentDashboard")} onBack={() => setScreen("mainTabs")} />}
          {screen === "parentDashboard" && <ParentDashboardScreen profile={profile} onBack={() => setScreen("mainTabs")} />}
        </div>
        {screen === "mainTabs" && <TabBar active={tab} onChange={setTab} />}
      </div>
    </div>
  );
}
