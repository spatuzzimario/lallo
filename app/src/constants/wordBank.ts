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
  b: { label: "B", iniziale: [w("balena","🐋"),w("banana","🍌"),w("bicicletta","🚲"),w("bambola","🪆"),w("barca","⛵"),w("bottone","🔘"),w("burro","🧈"),w("borsa","👜"),
                    w("banco","🪑"),w("bacio","💋"),w("ballerina","🩰"),w("bosco","🌲"),w("bue","🐂"),w("burattino","🎎"),w("bimbo","👶"),w("bagno","🛁"),w("biscotto","🍪"),w("bufalo","🐃"),w("baule","🧳"),w("bandiera","🚩"),w("berretto","🧢")],
                    mediana: [w("sabbia","🏖️"),w("gabbia","🦜"),w("tubo","🧴"),w("cubo","🧊"),w("nebbia","🌫️"),w("gobba","🐫"),w("abito","👗"),w("sabato","📅"),
                    w("albero","🌳"),w("ombrello","☂️"),w("gamba","🦵"),w("barba","🧔"),w("tromba","🎺"),w("zebra","🦓"),w("rubino","💎"),w("robot","🤖")] },
  c: { label: "C (dura)", iniziale: [w("cane","🐶"),w("casa","🏠"),w("cuore","❤️"),w("colore","🎨"),w("cavallo","🐴"),w("cucchiaio","🥄"),w("coccinella","🐞"),w("cappello","🎩"),
                    w("cappotto","🧥"),w("coniglio","🐰"),w("corona","👑"),w("cuoco","👨‍🍳"),w("cassa","📦"),w("cactus","🌵"),w("computer","💻"),w("corda","🪢"),w("cuscino","🛏️"),w("camion","🚚")],
                    mediana: [w("fuoco","🔥"),w("secchio","🪣"),w("pacco","📦"),w("amico","🧑‍🤝‍🧑"),w("oca","🦆"),w("mucca","🐄"),w("ricco","💰"),w("baco","🐛"),
                    w("specchio","🪞"),w("fiocco","🎀"),w("becco","🦜"),w("acqua","💧"),w("vacca","🐄"),w("fico","🍈")] },
  ci: { label: "CI (dolce)", iniziale: [w("ciliegia","🍒"),w("cioccolato","🍫"),w("cielo","☁️"),w("cerchio","⭕"),w("cena","🍽️"),w("cesto","🧺"),w("cintura","👖"),w("cinque","5️⃣"),
                    w("cinema","🎬"),w("cicogna","🦢"),w("ciambella","🍩"),w("cigno","🦢"),w("città","🏙️")],
                    mediana: [w("bicicletta","🚲"),w("faccia","😊"),w("doccia","🚿"),w("arancia","🍊"),w("focaccia","🍞"),w("pancia","🫃"),w("caccia","🏹"),w("traccia","👣"),
                    w("goccia","💧"),w("roccia","🪨"),w("micio","🐱"),w("bacio","💋"),w("riccio","🦔")] },
  d: { label: "D", iniziale: [w("dado","🎲"),w("dito","☝️"),w("delfino","🐬"),w("dente","🦷"),w("drago","🐉"),w("disegno","🖍️"),w("donna","👩"),w("dolce","🍰"),
                    w("doccia","🚿"),w("duomo","🏛️"),w("due","2️⃣"),w("dinosauro","🦕"),w("divano","🛋️"),w("diamante","💎"),w("dottore","👨‍⚕️")],
                    mediana: [w("nido","🪺"),w("cadere","⬇️"),w("radio","📻"),w("moda","👗"),w("medaglia","🏅"),w("edera","🌿"),w("candela","🕯️"),w("freddo","🥶"),
                    w("spada","⚔️"),w("strada","🛣️"),w("quadro","🖼️")] },
  f: { label: "F", iniziale: [w("fungo","🍄"),w("foglia","🍃"),w("farfalla","🦋"),w("fiore","🌸"),w("fuoco","🔥"),w("fragola","🍓"),w("forchetta","🍴"),w("formica","🐜"),
                    w("fumo","💨"),w("foca","🦭"),w("fata","🧚"),w("faro","🗼"),w("fiocco","🎀"),w("finestra","🪟"),w("foto","📸"),w("forbici","✂️"),w("farina","🌾"),w("famiglia","👪")],
                    mediana: [w("caffè","☕"),w("elefante","🐘"),w("telefono","📞"),w("giraffa","🦒"),w("buffo","🤡"),w("profumo","🌺"),w("sofà","🛋️"),w("gonfio","🎈"),
                    w("delfino","🐬"),w("gufo","🦉")] },
  g: { label: "G (dura)", iniziale: [w("gatto","🐱"),w("gallina","🐔"),w("gomma","🧽"),w("gufo","🦉"),w("gonna","👗"),w("guanto","🧤"),w("gomito","💪"),w("gabbiano","🐦"),
                    w("gallo","🐓"),w("gomitolo","🧶"),w("guscio","🥚"),w("gancio","🪝"),w("ghiaccio","🧊"),w("ghepardo","🐆"),w("gorilla","🦍")],
                    mediana: [w("fungo","🍄"),w("lago","🏞️"),w("mago","🧙"),w("igloo","🧊"),w("ago","🪡"),w("fuga","🏃"),w("rughe","👵"),w("sugo","🍝"),
                    w("spago","🧵"),w("riga","📏")] },
  gi: { label: "GI (dolce)", iniziale: [w("giraffa","🦒"),w("gelato","🍦"),w("gioco","🎮"),w("giacca","🧥"),w("girasole","🌻"),w("ginocchio","🦵"),w("gemello","👯"),w("gelso","🌳"),
                    w("giardino","🌳"),w("gemma","💎"),w("gilet","🦺"),w("giornale","📰"),w("gigante","🧌")],
                    mediana: [w("formaggio","🧀"),w("valigia","🧳"),w("magia","✨"),w("orologio","⌚"),w("pagina","📄"),w("angelo","👼"),w("spiaggia","🏖️"),w("coraggio","🦁"),
                    w("pigiama","👕")] },
  gli: { label: "GLI", iniziale: [],
                    mediana: [w("famiglia","👪"),w("figlio","🧒"),w("maglia","👕"),w("aglio","🧄"),w("foglia","🍃"),w("coniglio","🐰"),w("bottiglia","🍾"),w("sveglia","⏰"),
                    w("paglia","🌾"),w("giglio","🌸")] },
  gn: { label: "GN", iniziale: [w("gnomo","🧙‍♂️"),w("gnocchi","🍝"),w("gnu","🦌")],
                    mediana: [w("castagna","🌰"),w("montagna","⛰️"),w("ragno","🕷️"),w("bagno","🛁"),w("sogno","💭"),w("cigno","🦢"),w("legno","🪵"),w("lasagna","🍝"),
                    w("campagna","🌾"),w("compagno","👦"),w("disegno","🖍️"),w("spugna","🧽"),w("vigna","🍇")] },
  l: { label: "L", iniziale: [w("luna","🌙"),w("leone","🦁"),w("limone","🍋"),w("lupo","🐺"),w("libro","📖"),w("lampada","💡"),w("lucertola","🦎"),w("latte","🥛"),
                    w("luce","💡"),w("lana","🧶"),w("lavagna","📝"),w("lumaca","🐌"),w("letto","🛏️"),w("lingua","👅"),w("lente","🔍")],
                    mediana: [w("palla","⚽"),w("gelato","🍦"),w("mela","🍎"),w("valigia","🧳"),w("colore","🎨"),w("salame","🥓"),w("elica","🚁"),w("isola","🏝️"),
                    w("scuola","🏫"),w("sole","☀️"),w("vela","⛵"),w("farfalla","🦋"),w("mulino","🌬️")] },
  m: { label: "M", iniziale: [w("mela","🍎"),w("mano","✋"),w("mare","🌊"),w("mucca","🐄"),w("moto","🏍️"),w("matita","✏️"),w("monte","⛰️"),w("mago","🧙"),
                    w("mamma","👩"),w("medusa","🪼"),w("miele","🍯"),w("musica","🎵"),w("mostro","👹"),w("mais","🌽"),w("maglione","🧥")],
                    mediana: [w("gomma","🧽"),w("camera","🛏️"),w("limone","🍋"),w("animale","🐾"),w("camicia","👕"),w("camino","🔥"),w("fumo","💨"),w("gomito","💪"),
                    w("scimmia","🐒"),w("cammello","🐫"),w("pomodoro","🍅"),w("famiglia","👪")] },
  n: { label: "N", iniziale: [w("naso","👃"),w("nave","🚢"),w("nido","🪺"),w("neve","❄️"),w("nonna","👵"),w("noce","🌰"),w("numero","🔢"),w("nuvola","☁️"),
                    w("nano","🧙"),w("nastro","🎀"),w("notte","🌙"),w("nuoto","🏊"),w("nocciolina","🥜")],
                    mediana: [w("banana","🍌"),w("luna","🌙"),w("tenda","⛺"),w("penna","🖊️"),w("farina","🌾"),w("gonna","👗"),w("ananas","🍍"),w("cannuccia","🥤"),
                    w("cena","🍽️"),w("zaino","🎒"),w("fontana","⛲"),w("pinguino","🐧"),w("panino","🥪")] },
  mnl_cons: { label: "M/N/L + cons.", iniziale: [],
                    mediana: [w("campo","🏕️"),w("ponte","🌉"),w("dolce","🍰"),w("elmo","⛑️"),w("salto","🤸"),w("angolo","📐"),w("mondo","🌍"),w("tempo","⏰"),
                    w("ombra","🌑"),w("gamba","🦵"),w("banco","🪑"),w("monte","⛰️"),w("vento","💨"),w("dente","🦷"),w("elefante","🐘")] },
  p: { label: "P", iniziale: [w("pane","🍞"),w("palla","⚽"),w("pesce","🐟"),w("penna","🖊️"),w("porta","🚪"),w("pizza","🍕"),w("panda","🐼"),w("pollo","🐔"),
                    w("papera","🦆"),w("pappagallo","🦜"),w("pettine","🪮"),w("pattini","⛸️"),w("palloncino","🎈"),w("piuma","🪶"),w("pesca","🍑"),w("pupazzo","⛄")],
                    mediana: [w("lampada","💡"),w("scopa","🧹"),w("capra","🐐"),w("sapone","🧼"),w("topo","🐭"),w("papero","🦆"),w("zoppo","🦯"),w("cupola","🕌"),
                    w("lupo","🐺"),w("zuppa","🍲"),w("lampo","⚡")] },
  r: { label: "R", iniziale: [w("rana","🐸"),w("razzo","🚀"),w("riso","🍚"),w("rosa","🌹"),w("ruota","🛞"),w("radio","📻"),w("robot","🤖"),w("riccio","🦔"),
                    w("rete","🥅"),w("remo","🚣"),w("riga","📏"),w("rondine","🐦"),w("rospo","🐸"),w("ramo","🌿"),w("re","👑"),w("roccia","🪨"),w("ragno","🕷️"),w("raggio","☀️"),w("rinoceronte","🦏"),w("renna","🦌")],
                    mediana: [w("farfalla","🦋"),w("corona","👑"),w("sirena","🧜‍♀️"),w("faro","🗼"),w("forno","🔥"),w("carota","🥕"),w("cereali","🥣"),w("arancia","🍊"),
                    w("pera","🍐"),w("corallo","🪸"),w("moneta","🪙"),w("torre","🏰"),w("pirata","🏴‍☠️"),w("muro","🧱"),w("toro","🐂")] },
  cons_r: { label: "cons. + R", iniziale: [w("treno","🚂"),w("drago","🐉"),w("fragola","🍓"),w("granchio","🦀"),w("prato","🌾"),w("trattore","🚜"),w("principe","🤴"),w("bruco","🐛"),
                    w("grillo","🦗"),w("brontosauro","🦕"),w("trota","🐟"),w("grano","🌾"),w("prosciutto","🍖"),w("tromba","🎺"),w("principessa","👸")],
                    mediana: [w("sopra","⬆️"),w("aprile","📅"),w("vetro","🪟"),w("cetriolo","🥒"),w("fabbro","🔨"),w("quadro","🖼️"),w("ombra","🌑"),w("libro","📖"),
                    w("zebra","🦓")] },
  r_cons: { label: "R + cons.", iniziale: [],
                    mediana: [w("porta","🚪"),w("carta","📄"),w("cartone","📦"),w("forchetta","🍴"),w("tartaruga","🐢"),w("orso","🐻"),w("corda","🪢"),w("verde","🟢"),
                    w("inverno","❄️"),w("verme","🪱"),w("forbici","✂️"),w("sorpresa","🎁"),w("scarpa","👟")] },
  s: { label: "S", iniziale: [w("sole","☀️"),w("sasso","🪨"),w("serpente","🐍"),w("sedia","🪑"),w("salame","🥓"),w("sette","7️⃣"),w("sacco","🎒"),w("settimana","📅"),
                    w("sirena","🧜‍♀️"),w("salto","🤸"),w("sapone","🧼"),w("sabbia","🏖️"),w("secchio","🪣")],
                    mediana: [w("cassa","📦"),w("tosse","🤧"),w("pasta","🍝"),w("vespa","🐝"),w("castello","🏰"),w("salsiccia","🌭"),w("riposo","😴"),w("musica","🎵"),
                    w("casa","🏠"),w("rosa","🌹"),w("naso","👃"),w("rosso","🔴")] },
  s_cons: { label: "S + cons.", iniziale: [w("spada","⚔️"),w("stella","⭐"),w("scala","🪜"),w("spazzolino","🪥"),w("stivale","👢"),w("spinaci","🥬"),w("sveglia","⏰"),w("sfera","🔮"),
                    w("scarpa","👟"),w("scoiattolo","🐿️"),w("spugna","🧽"),w("scatola","📦"),w("scuola","🏫"),w("strega","🧙‍♀️")],
                    mediana: [w("finestra","🪟"),w("orchestra","🎻"),w("minestra","🍲"),w("castello","🏰"),w("pastore","🐑"),w("canestro","🏀"),w("mostro","👹"),w("vestito","👗"),
                    w("cestino","🧺"),w("pesca","🍑")] },
  sci_sce: { label: "SCI/SCE", iniziale: [w("sciarpa","🧣"),w("scivolo","🛝"),w("scienza","🔬"),w("scelta","🤔"),w("scimmia","🐒"),w("scintilla","✨")],
                    mediana: [w("pesce","🐟"),w("uscita","🚪"),w("ascensore","🛗"),w("cuscino","🛏️"),w("striscia","🌈"),w("nascita","👶"),w("crescita","📈"),w("prosciutto","🍖"),
                    w("asciugamano","🧻"),w("pesciolino","🐟")] },
  t: { label: "T", iniziale: [w("tavolo","🪑"),w("topo","🐭"),w("torta","🎂"),w("tigre","🐯"),w("tazza","☕"),w("tartaruga","🐢"),w("tenda","⛺"),w("toro","🐂"),
                    w("tuono","⛈️"),w("tacchino","🦃"),w("tappeto","🧶"),w("tamburo","🥁"),w("testa","👤"),w("tulipano","🌷")],
                    mediana: [w("gatto","🐱"),w("patata","🥔"),w("matita","✏️"),w("bottiglia","🍾"),w("latte","🥛"),w("dita","🖐️"),w("aquilotto","🦅"),w("gomito","💪"),
                    w("bottone","🔘"),w("lattuga","🥬"),w("pattini","⛸️")] },
  v: { label: "V", iniziale: [w("vaso","🏺"),w("vela","⛵"),w("volpe","🦊"),w("vulcano","🌋"),w("vento","💨"),w("valigia","🧳"),w("vacca","🐄"),w("verme","🪱"),
                    w("violino","🎻"),w("vespa","🐝"),w("vagone","🚃"),w("verdura","🥦"),w("vetro","🪟")],
                    mediana: [w("uovo","🥚"),w("avvocato","🥑"),w("chiave","🔑"),w("cavallo","🐴"),w("uva","🍇"),w("divano","🛋️"),w("nave","🚢"),w("polvere","💨"),
                    w("neve","❄️"),w("sveglia","⏰"),w("stivale","👢"),w("scivolo","🛝")] },
  z_dz: { label: "Z (sonora, dz)", iniziale: [w("zaino","🎒"),w("zanzara","🦟"),w("zero","0️⃣"),w("zolla","🌱"),w("zebra","🦓"),w("zenzero","🫚")],
                    mediana: [w("orzo","🌾"),w("mezzo","🚌"),w("azzurro","🔵"),w("zenzero","🫚")] },
  zeta: { label: "Zeta", iniziale: [w("zebra","🦓"),w("zucca","🎃"),w("zucchero","🍬"),w("zio","👨"),w("zoo","🦁"),w("zanna","🦷"),w("zattera","🛟")],
                    mediana: [w("pizza","🍕"),w("pazzo","🤪"),w("ragazzo","👦"),w("palazzo","🏰"),w("ragazza","👧"),w("spazzola","🪮")] },
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
