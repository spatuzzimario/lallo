// Word bank — libreria parole per fonema (iniziale/mediana).
// Porta lo stesso contenuto usato nella demo landing (content/word-bank.json),
// tipizzato per l'app React Native. DA VALIDARE con un logopedista prima
// di uso clinico reale — vedi nota in word-bank.json.

export interface WordEntry {
  parola: string;
  emoji: string;
}

export interface PhonemeEntry {
  label: string;
  iniziale: WordEntry[];
  mediana: WordEntry[];
}

export const PHONEME_ORDER = [
  "b","c","ci","d","f","g","gi","gli","gn","l","m","n","mnl_cons",
  "p","r","cons_r","r_cons","s","s_cons","sci_sce","t","v","z_dz","zeta","z_ts",
] as const;

export type PhonemeKey = typeof PHONEME_ORDER[number];

// Fonemi inclusi nel piano gratuito — un set di partenza clinicamente comune
// (m, n, p, t, l, s) pensato per far provare l'app con vero valore prima del
// paywall. Il resto richiede l'abbonamento. Numeri/scelta da validare col
// business — qui è un punto di partenza ragionevole, non una decisione finale.
export const FREE_PHONEMES: PhonemeKey[] = ["m", "n", "p", "t", "l", "s"];
export function isPremium(key: PhonemeKey): boolean {
  return !FREE_PHONEMES.includes(key);
}

const w = (parola: string, emoji: string): WordEntry => ({ parola, emoji });

export const WORD_BANK: Record<PhonemeKey, PhonemeEntry> = {
  b: { label: "B", iniziale: [w("balena","🐋"),w("banana","🍌"),w("bicicletta","🚲"),w("bambola","🪆"),w("barca","⛵"),w("bottone","🔘"),w("burro","🧈"),w("borsa","👜")],
                    mediana: [w("sabbia","🏖️"),w("gabbia","🦜"),w("tubo","🧴"),w("cubo","🧊"),w("nebbia","🌫️"),w("gobba","🐫"),w("abito","👗"),w("sabato","📅")] },
  c: { label: "C (dura)", iniziale: [w("cane","🐶"),w("casa","🏠"),w("cuore","❤️"),w("colore","🎨"),w("cavallo","🐴"),w("cucchiaio","🥄"),w("coccinella","🐞"),w("cappello","🎩")],
                    mediana: [w("fuoco","🔥"),w("secchio","🪣"),w("pacco","📦"),w("amico","🧑‍🤝‍🧑"),w("oca","🦆"),w("mucca","🐄"),w("ricco","💰"),w("baco","🐛")] },
  ci: { label: "CI (dolce)", iniziale: [w("ciliegia","🍒"),w("cioccolato","🍫"),w("cielo","☁️"),w("cerchio","⭕"),w("cena","🍽️"),w("cesto","🧺"),w("cintura","👖"),w("cinque","5️⃣")],
                    mediana: [w("bicicletta","🚲"),w("faccia","😊"),w("doccia","🚿"),w("arancia","🍊"),w("focaccia","🍞"),w("pancia","🫃"),w("caccia","🏹"),w("traccia","👣")] },
  d: { label: "D", iniziale: [w("dado","🎲"),w("dito","☝️"),w("delfino","🐬"),w("dente","🦷"),w("drago","🐉"),w("disegno","🖍️"),w("donna","👩"),w("dolce","🍰")],
                    mediana: [w("nido","🪺"),w("cadere","⬇️"),w("radio","📻"),w("moda","👗"),w("medaglia","🏅"),w("edera","🌿"),w("candela","🕯️"),w("freddo","🥶")] },
  f: { label: "F", iniziale: [w("fungo","🍄"),w("foglia","🍃"),w("farfalla","🦋"),w("fiore","🌸"),w("fuoco","🔥"),w("fragola","🍓"),w("forchetta","🍴"),w("formica","🐜")],
                    mediana: [w("caffè","☕"),w("elefante","🐘"),w("telefono","📞"),w("giraffa","🦒"),w("buffo","🤡"),w("profumo","🌺"),w("sofà","🛋️"),w("gonfio","🎈")] },
  g: { label: "G (dura)", iniziale: [w("gatto","🐱"),w("gallina","🐔"),w("gomma","🧽"),w("gufo","🦉"),w("gonna","👗"),w("guanto","🧤"),w("gomito","💪"),w("gabbiano","🐦")],
                    mediana: [w("fungo","🍄"),w("lago","🏞️"),w("mago","🧙"),w("igloo","🧊"),w("ago","🪡"),w("fuga","🏃"),w("rughe","👵"),w("sugo","🍝")] },
  gi: { label: "GI (dolce)", iniziale: [w("giraffa","🦒"),w("gelato","🍦"),w("gioco","🎮"),w("giacca","🧥"),w("girasole","🌻"),w("ginocchio","🦵"),w("gemello","👯"),w("gelso","🌳")],
                    mediana: [w("formaggio","🧀"),w("valigia","🧳"),w("magia","✨"),w("orologio","⌚"),w("pagina","📄"),w("angelo","👼"),w("spiaggia","🏖️"),w("coraggio","🦁")] },
  gli: { label: "GLI", iniziale: [],
                    mediana: [w("famiglia","👪"),w("figlio","🧒"),w("maglia","👕"),w("aglio","🧄"),w("foglia","🍃"),w("coniglio","🐰"),w("bottiglia","🍾"),w("sveglia","⏰")] },
  gn: { label: "GN", iniziale: [w("gnomo","🧙‍♂️"),w("gnocchi","🍝")],
                    mediana: [w("castagna","🌰"),w("montagna","⛰️"),w("ragno","🕷️"),w("bagno","🛁"),w("sogno","💭"),w("cigno","🦢"),w("legno","🪵"),w("lasagna","🍝")] },
  l: { label: "L", iniziale: [w("luna","🌙"),w("leone","🦁"),w("limone","🍋"),w("lupo","🐺"),w("libro","📖"),w("lampada","💡"),w("lucertola","🦎"),w("latte","🥛")],
                    mediana: [w("palla","⚽"),w("gelato","🍦"),w("mela","🍎"),w("valigia","🧳"),w("colore","🎨"),w("salame","🥓"),w("elica","🚁"),w("isola","🏝️")] },
  m: { label: "M", iniziale: [w("mela","🍎"),w("mano","✋"),w("mare","🌊"),w("mucca","🐄"),w("moto","🏍️"),w("matita","✏️"),w("monte","⛰️"),w("mago","🧙")],
                    mediana: [w("gomma","🧽"),w("camera","🛏️"),w("limone","🍋"),w("animale","🐾"),w("camicia","👕"),w("camino","🔥"),w("fumo","💨"),w("gomito","💪")] },
  n: { label: "N", iniziale: [w("naso","👃"),w("nave","🚢"),w("nido","🪺"),w("neve","❄️"),w("nonna","👵"),w("noce","🌰"),w("numero","🔢"),w("nuvola","☁️")],
                    mediana: [w("banana","🍌"),w("luna","🌙"),w("tenda","⛺"),w("penna","🖊️"),w("farina","🌾"),w("gonna","👗"),w("ananas","🍍"),w("cannuccia","🥤")] },
  mnl_cons: { label: "M/N/L + cons.", iniziale: [],
                    mediana: [w("campo","🏕️"),w("ponte","🌉"),w("dolce","🍰"),w("elmo","⛑️"),w("salto","🤸"),w("angolo","📐"),w("mondo","🌍"),w("tempo","⏰")] },
  p: { label: "P", iniziale: [w("pane","🍞"),w("palla","⚽"),w("pesce","🐟"),w("penna","🖊️"),w("porta","🚪"),w("pizza","🍕"),w("panda","🐼"),w("pollo","🐔")],
                    mediana: [w("lampada","💡"),w("scopa","🧹"),w("capra","🐐"),w("sapone","🧼"),w("topo","🐭"),w("papero","🦆"),w("zoppo","🦯"),w("cupola","🕌")] },
  r: { label: "R", iniziale: [w("rana","🐸"),w("razzo","🚀"),w("riso","🍚"),w("rosa","🌹"),w("ruota","🛞"),w("radio","📻"),w("robot","🤖"),w("riccio","🦔")],
                    mediana: [w("farfalla","🦋"),w("corona","👑"),w("sirena","🧜‍♀️"),w("faro","🗼"),w("forno","🔥"),w("carota","🥕"),w("cereali","🥣"),w("arancia","🍊")] },
  cons_r: { label: "cons. + R", iniziale: [w("treno","🚂"),w("drago","🐉"),w("fragola","🍓"),w("granchio","🦀"),w("prato","🌾"),w("trattore","🚜"),w("principe","🤴"),w("bruco","🐛")],
                    mediana: [w("sopra","⬆️"),w("aprile","📅"),w("vetro","🪟"),w("cetriolo","🥒"),w("fabbro","🔨"),w("quadro","🖼️"),w("ombra","🌑"),w("libro","📖")] },
  r_cons: { label: "R + cons.", iniziale: [],
                    mediana: [w("porta","🚪"),w("carta","📄"),w("cartone","📦"),w("forchetta","🍴"),w("tartaruga","🐢"),w("orso","🐻"),w("corda","🪢"),w("verde","🟢")] },
  s: { label: "S", iniziale: [w("sole","☀️"),w("sasso","🪨"),w("serpente","🐍"),w("sedia","🪑"),w("salame","🥓"),w("sette","7️⃣"),w("sacco","🎒"),w("settimana","📅")],
                    mediana: [w("cassa","📦"),w("tosse","🤧"),w("pasta","🍝"),w("vespa","🐝"),w("castello","🏰"),w("salsiccia","🌭"),w("riposo","😴"),w("musica","🎵")] },
  s_cons: { label: "S + cons.", iniziale: [w("spada","⚔️"),w("stella","⭐"),w("scala","🪜"),w("spazzolino","🪥"),w("stivale","👢"),w("spinaci","🥬"),w("sveglia","⏰"),w("sfera","🔮")],
                    mediana: [w("finestra","🪟"),w("orchestra","🎻"),w("minestra","🍲"),w("castello","🏰"),w("pastore","🐑"),w("canestro","🏀"),w("mostro","👹"),w("vestito","👗")] },
  sci_sce: { label: "SCI/SCE", iniziale: [w("sciarpa","🧣"),w("scivolo","🛝"),w("scienza","🔬"),w("scelta","🤔")],
                    mediana: [w("pesce","🐟"),w("uscita","🚪"),w("ascensore","🛗"),w("cuscino","🛏️"),w("striscia","🌈"),w("nascita","👶"),w("crescita","📈"),w("prosciutto","🍖")] },
  t: { label: "T", iniziale: [w("tavolo","🪑"),w("topo","🐭"),w("torta","🎂"),w("tigre","🐯"),w("tazza","☕"),w("tartaruga","🐢"),w("tenda","⛺"),w("toro","🐂")],
                    mediana: [w("gatto","🐱"),w("patata","🥔"),w("matita","✏️"),w("bottiglia","🍾"),w("latte","🥛"),w("dita","🖐️"),w("aquilotto","🦅"),w("gomito","💪")] },
  v: { label: "V", iniziale: [w("vaso","🏺"),w("vela","⛵"),w("volpe","🦊"),w("vulcano","🌋"),w("vento","💨"),w("valigia","🧳"),w("vacca","🐄"),w("verme","🪱")],
                    mediana: [w("uovo","🥚"),w("avvocato","🥑"),w("chiave","🔑"),w("cavallo","🐴"),w("uva","🍇"),w("divano","🛋️"),w("nave","🚢"),w("polvere","💨")] },
  z_dz: { label: "Z (sonora, dz)", iniziale: [w("zaino","🎒"),w("zanzara","🦟"),w("zero","0️⃣"),w("zolla","🌱")],
                    mediana: [w("orzo","🌾"),w("mezzo","🚌"),w("azzurro","🔵"),w("zenzero","🫚")] },
  zeta: { label: "Zeta", iniziale: [w("zebra","🦓"),w("zucca","🎃"),w("zucchero","🍬"),w("zio","👨")],
                    mediana: [w("pizza","🍕"),w("pazzo","🤪"),w("ragazzo","👦"),w("palazzo","🏰")] },
  z_ts: { label: "Z (sorda, ts)", iniziale: [w("zucchero","🍬"),w("zucca","🎃"),w("zitto","🤫"),w("zampa","🐾")],
                    mediana: [w("pizza","🍕"),w("calzino","🧦"),w("marzo","📅"),w("piazza","🏛️")] },
};

// Coppie minime curate: solo per fonemi dove ha senso clinico un confronto
// a due parole. Non tutte le 25 categorie hanno una coppia naturale — dove
// manca, il gioco usa una coppia di fallback (s) e lo segnala all'utente.
export const MINIMAL_PAIRS: Partial<Record<PhonemeKey, [WordEntry, WordEntry]>> = {
  s: [w("sole", "☀️"), w("sale", "🧂")],
  z_ts: [w("razzo", "🚀"), w("riso", "🍚")],
  r: [w("rana", "🐸"), w("lana", "🧶")],
  l: [w("luna", "🌙"), w("una", "1️⃣")],
  t: [w("tana", "🕳️"), w("dana", "➖")],
  c: [w("cane", "🐶"), w("pane", "🍞")],
  p: [w("palla", "⚽"), w("balla", "💃")],
};

export function wordsFor(key: PhonemeKey, position: "iniziale" | "mediana"): WordEntry[] {
  const entry = WORD_BANK[key];
  const primary = entry[position];
  if (primary && primary.length) return primary;
  // fallback alla posizione disponibile se quella richiesta è vuota
  return entry.iniziale.length ? entry.iniziale : entry.mediana;
}

export function pickRandom<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

// pool di distrattori per "Caccia al suono": pesca da altre categorie,
// con un filtro di sicurezza approssimativo (stesso limite della demo web —
// da rifinire con un logopedista, non è linguisticamente perfetto)
export function distractorPool(excludeKey: PhonemeKey, n: number): WordEntry[] {
  const others = PHONEME_ORDER.filter((k) => k !== excludeKey);
  let pool: WordEntry[] = [];
  pickRandom(others, 6).forEach((k) => {
    const entry = WORD_BANK[k];
    pool = pool.concat(entry.iniziale, entry.mediana);
  });
  const core = excludeKey.replace("_cons", "").replace("cons_", "").replace("_dz", "").replace("_ts", "").replace("mnl", "");
  if (core.length > 0 && core.length <= 2) {
    pool = pool.filter((word) => !word.parola.toLowerCase().includes(core));
  }
  return pickRandom(pool, n);
}
