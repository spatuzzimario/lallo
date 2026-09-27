// Word bank — libreria parole per fonema (iniziale/mediana).
// Porta lo stesso contenuto usato nella demo landing (content/word-bank.json),
// tipizzato per l'app React Native. DA VALIDARE con un logopedista prima
// di uso clinico reale — vedi nota in word-bank.json.

export interface WordEntry {
  parola: string;
  emoji: string;
  // Complessità sillabica (brief aggiornamento livelli, L1/L2 §A) — non ancora popolato per
  // nessuna parola: TODO esplicito, da taggare in un giro dedicato (a mano o validato da una
  // logopedista, non un conteggio automatico non verificato). Finché manca, filterBySyllables
  // sotto include comunque la parola invece di escluderla per un dato che non esiste.
  syllables?: 1 | 2 | 3 | "4plus";
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
                    // tenda/fontana/pinguino rimosse (settembre 2026): stesso problema di
                    // farfalla/forno per R — N incollata a un'altra consonante (te-n-d-,
                    // fo-n-t-, pi-n-gu-) invece che chiara tra due vocali.
                    mediana: [w("banana","🍌"),w("luna","🌙"),w("penna","🖊️"),w("farina","🌾"),w("gonna","👗"),w("ananas","🍍"),w("cannuccia","🥤"),
                    w("cena","🍽️"),w("zaino","🎒"),w("panino","🥪"),w("moneta","🪙"),w("canarino","🐤"),w("vaniglia","🍦")] },
  mnl_cons: { label: "M/N/L + cons.", iniziale: [],
                    mediana: [w("campo","🏕️"),w("ponte","🌉"),w("dolce","🍰"),w("elmo","⛑️"),w("salto","🤸"),w("angolo","📐"),w("mondo","🌍"),w("tempo","⏰"),
                    w("ombra","🌑"),w("gamba","🦵"),w("banco","🪑"),w("monte","⛰️"),w("vento","💨"),w("dente","🦷"),w("elefante","🐘")] },
  p: { label: "P", iniziale: [w("pane","🍞"),w("palla","⚽"),w("pesce","🐟"),w("penna","🖊️"),w("porta","🚪"),w("pizza","🍕"),w("panda","🐼"),w("pollo","🐔"),
                    w("papera","🦆"),w("pappagallo","🦜"),w("pettine","🪮"),w("pattini","⛸️"),w("palloncino","🎈"),w("piuma","🪶"),w("pesca","🍑"),w("pupazzo","⛄")],
                    mediana: [w("lampada","💡"),w("scopa","🧹"),w("capra","🐐"),w("sapone","🧼"),w("topo","🐭"),w("papero","🦆"),w("zoppo","🦯"),w("cupola","🕌"),
                    w("lupo","🐺"),w("zuppa","🍲"),w("lampo","⚡")] },
  r: { label: "R", iniziale: [w("rana","🐸"),w("razzo","🚀"),w("riso","🍚"),w("rosa","🌹"),w("ruota","🛞"),w("radio","📻"),w("robot","🤖"),w("riccio","🦔"),
                    w("rete","🥅"),w("remo","🚣"),w("riga","📏"),w("rondine","🐦"),w("rospo","🐸"),w("ramo","🌿"),w("re","👑"),w("roccia","🪨"),w("ragno","🕷️"),w("raggio","☀️"),w("rinoceronte","🦏"),w("renna","🦌")],
                    // farfalla/forno/moneta rimosse (settembre 2026): R in posizione di coda
                    // seguita da un'altra consonante (far-f-, for-n-, e "moneta" non ha
                    // nemmeno la R) non è un buon esempio di "R mediana" — serve R chiara,
                    // tra due vocali, come in corona/faro/torre.
                    mediana: [w("corona","👑"),w("sirena","🧜‍♀️"),w("faro","🗼"),w("carota","🥕"),w("cereali","🥣"),w("arancia","🍊"),
                    w("pera","🍐"),w("corallo","🪸"),w("torre","🏰"),w("pirata","🏴‍☠️"),w("muro","🧱"),w("toro","🐂"),
                    w("aroma","🌸"),w("oro","🥇"),w("cuore","❤️"),w("canguro","🦘"),w("tesoro","💰")] },
  cons_r: { label: "cons. + R", iniziale: [w("treno","🚂"),w("drago","🐉"),w("fragola","🍓"),w("granchio","🦀"),w("prato","🌾"),w("trattore","🚜"),w("principe","🤴"),w("bruco","🐛"),
                    w("grillo","🦗"),w("brontosauro","🦕"),w("trota","🐟"),w("grano","🌾"),w("prosciutto","🍖"),w("tromba","🎺"),w("principessa","👸")],
                    mediana: [w("sopra","⬆️"),w("aprile","📅"),w("vetro","🪟"),w("cetriolo","🥒"),w("fabbro","🔨"),w("quadro","🖼️"),w("ombra","🌑"),w("libro","📖"),
                    w("zebra","🦓")] },
  r_cons: { label: "R + cons.", iniziale: [],
                    mediana: [w("porta","🚪"),w("carta","📄"),w("cartone","📦"),w("forchetta","🍴"),w("tartaruga","🐢"),w("orso","🐻"),w("corda","🪢"),w("verde","🟢"),
                    w("inverno","❄️"),w("verme","🪱"),w("forbici","✂️"),w("sorpresa","🎁"),w("scarpa","👟")] },
  s: { label: "S", iniziale: [w("sole","☀️"),w("sasso","🪨"),w("serpente","🐍"),w("sedia","🪑"),w("salame","🥓"),w("sette","7️⃣"),w("sacco","🎒"),w("settimana","📅"),
                    w("sirena","🧜‍♀️"),w("salto","🤸"),w("sapone","🧼"),w("sabbia","🏖️"),w("secchio","🪣")],
                    // pasta/vespa/castello/salsiccia rimosse (settembre 2026): S incollata a
                    // un'altra consonante (pa-st-, ve-sp-, ca-st-, sal-s-) non è un buon
                    // esempio di "S mediana" — serve S chiara, tra due vocali, come in
                    // casa/naso/rosa.
                    mediana: [w("cassa","📦"),w("tosse","🤧"),w("riposo","😴"),w("musica","🎵"),
                    w("casa","🏠"),w("rosa","🌹"),w("naso","👃"),w("rosso","🔴"),
                    w("viso","😊"),w("museo","🏛️"),w("isola","🏝️"),w("asilo","🏫")] },
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

// Coppie minime curate: solo per fonemi dove ha senso clinico un confronto a due parole
// (categorie a suono singolo). Le 4 categorie composite/cluster (cons_r, r_cons, s_cons,
// mnl_cons: TR/DR/FR..., -RT-/-RD-..., ST/SP/SC..., -MP-/-NT-/-LC-...) raggruppano più
// suoni diversi e non hanno un'unica coppia minima onesta da proporre — per quelle
// CoppieMinime (SessionScreen.tsx) pesca invece due parole reali del fonema stesso dal
// word bank, invece di ricadere sempre sulla stessa coppia "sole/sale" di un suono non
// pertinente (bug segnalato: la coppia doveva riguardare il suono in allenamento).
// DA VALIDARE con un logopedista prima di uso clinico reale, come il resto del word bank.
export const MINIMAL_PAIRS: Partial<Record<PhonemeKey, [WordEntry, WordEntry]>> = {
  s: [w("sole", "☀️"), w("sale", "🧂")],
  z_ts: [w("razzo", "🚀"), w("riso", "🍚")],
  r: [w("rana", "🐸"), w("lana", "🧶")],
  l: [w("luna", "🌙"), w("una", "1️⃣")],
  t: [w("tana", "🕳️"), w("dado", "🎲")],
  c: [w("cane", "🐶"), w("pane", "🍞")],
  p: [w("palla", "⚽"), w("balla", "💃")],
  b: [w("barca", "⛵"), w("marca", "🏷️")],
  ci: [w("cielo", "☁️"), w("gelo", "🥶")],
  d: [w("dente", "🦷"), w("gente", "🧑‍🤝‍🧑")],
  f: [w("faro", "🗼"), w("caro", "💛")],
  g: [w("gatto", "🐱"), w("matto", "🌀")],
  gi: [w("gelo", "🥶"), w("cielo", "☁️")],
  gli: [w("paglia", "🌾"), w("palla", "⚽")],
  gn: [w("bagno", "🛁"), w("banco", "🪑")],
  m: [w("mano", "✋"), w("nano", "🧙")],
  n: [w("naso", "👃"), w("vaso", "🏺")],
  sci_sce: [w("pesce", "🐟"), w("cece", "🫘")],
  v: [w("vento", "💨"), w("cento", "💯")],
  z_dz: [w("zero", "0️⃣"), w("vero", "✅")],
  zeta: [w("zucca", "🎃"), w("buca", "🕳️")],
};

// Cerca una parola per testo in TUTTO il word bank, a prescindere dal fonema — serve alle
// frasi/filastrocche (constants/phrases.ts, L3/L4b): la parola-chiave di una frase è sempre
// del fonema in allenamento, ma i distrattori di una rima sono deliberatamente di ALTRI
// fonemi (servono solo a non far rima, non a esercitare quel suono). Costo O(n) su ~550
// parole: va bene per un lookup occasionale, non per un ciclo caldo.
export function findWordEntry(parola: string): WordEntry | null {
  for (const key of PHONEME_ORDER) {
    const entry = WORD_BANK[key];
    const found = [...entry.iniziale, ...entry.mediana].find((w) => w.parola === parola);
    if (found) return found;
  }
  return null;
}

// Filtra per complessità sillabica (sotto-step L1/L2, brief aggiornamento livelli §A) — una
// parola senza tag `syllables` resta inclusa: finché il word bank non è taggato, il filtro
// non deve far sparire parole per un dato mancante (vedi nota su WordEntry.syllables).
export function filterBySyllables(words: WordEntry[], complexity?: WordEntry["syllables"]): WordEntry[] {
  if (complexity === undefined) return words;
  return words.filter((w) => w.syllables === undefined || w.syllables === complexity);
}

export function wordsFor(key: PhonemeKey, position: "iniziale" | "mediana"): WordEntry[] {
  const entry = WORD_BANK[key];
  const primary = entry[position];
  if (primary && primary.length) return primary;
  // fallback alla posizione disponibile se quella richiesta è vuota
  return entry.iniziale.length ? entry.iniziale : entry.mediana;
}

// Tutte le parole del fonema, iniziale + mediana insieme — usato dal gioco "Ripeti"
// (brief: far vedere tutte le parole disponibili per il suono, entrambe le posizioni).
export function allWordsFor(key: PhonemeKey): WordEntry[] {
  const entry = WORD_BANK[key];
  return [...entry.iniziale, ...entry.mediana];
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

// ---------- L0 (Suono isolato) — sillabe consonante+vocale ----------
// Far sentire/produrre il suono in tutte le combinazioni sillabiche prima di passare alla
// parola. Ortografia italiana verificabile a tavolino (dura/dolce, digrammi) — non serve una
// logopedista per questo pezzo, a differenza delle frasi/racconti più sotto.
// 4 categorie composite (cons_r, r_cons, s_cons, mnl_cons) restano vuote di proposito:
// raggruppano più cluster consonantici diversi sotto un'unica chiave (es. cons_r copre
// TR/DR/FR/GR/PR/BR), quindi non esiste un'unica "sillaba isolata" onesta da proporre — il
// fallback in SessionScreen (SillabeIsolate) salta questi gruppi direttamente a L1 (parola).
export const SYLLABLES: Record<PhonemeKey, string[]> = {
  b: ["BA", "BE", "BI", "BO", "BU"],
  c: ["CA", "CO", "CU", "CHE", "CHI"],
  ci: ["CE", "CI", "CIA", "CIO", "CIU"],
  d: ["DA", "DE", "DI", "DO", "DU"],
  f: ["FA", "FE", "FI", "FO", "FU"],
  g: ["GA", "GO", "GU", "GHE", "GHI"],
  gi: ["GE", "GI", "GIA", "GIO", "GIU"],
  gli: ["GLIA", "GLIE", "GLI", "GLIO", "GLIU"],
  gn: ["GNA", "GNE", "GNI", "GNO", "GNU"],
  l: ["LA", "LE", "LI", "LO", "LU"],
  m: ["MA", "ME", "MI", "MO", "MU"],
  mnl_cons: [],
  n: ["NA", "NE", "NI", "NO", "NU"],
  p: ["PA", "PE", "PI", "PO", "PU"],
  r: ["RA", "RE", "RI", "RO", "RU"],
  cons_r: [],
  r_cons: [],
  s: ["SA", "SE", "SI", "SO", "SU"],
  s_cons: [],
  sci_sce: ["SCIA", "SCE", "SCI", "SCIO", "SCIU"],
  t: ["TA", "TE", "TI", "TO", "TU"],
  v: ["VA", "VE", "VI", "VO", "VU"],
  // L'ortografia italiana non distingue Z sonora/sorda (zaino e zucchero si scrivono
  // entrambi con "za") — la differenza è solo fonetica, quindi le 3 categorie Z condividono
  // le stesse sillabe scritte.
  z_dz: ["ZA", "ZE", "ZI", "ZO", "ZU"],
  zeta: ["ZA", "ZE", "ZI", "ZO", "ZU"],
  z_ts: ["ZA", "ZE", "ZI", "ZO", "ZU"],
};

// Le sillabe non hanno un significato da illustrare (a differenza delle parole, dove vale
// sempre "ogni parola ha un'immagine", vedi CLAUDE.md §2.6) — l'audio è il segnale
// primario, l'emoji è solo un'ancora visiva generica, non una parola-immagine.
export function syllableEntries(key: PhonemeKey): WordEntry[] {
  return (SYLLABLES[key] ?? []).map((syl) => w(syl, "🔊"));
}

export function distractorSyllables(excludeKey: PhonemeKey, n: number): WordEntry[] {
  const others = PHONEME_ORDER.filter((k) => k !== excludeKey && SYLLABLES[k]?.length > 0);
  let pool: WordEntry[] = [];
  pickRandom(others, Math.min(6, others.length)).forEach((k) => {
    pool = pool.concat(syllableEntries(k));
  });
  return pickRandom(pool, n);
}

// Parole/frasi/racconti per i livelli 2-7 (Parola/Frase iniziale-mediana, Racconto) sono
// in revisione col founder (spreadsheet Excel, settembre 2026) prima di entrare qui — vedi
// conversazione. Non aggiungere contenuto per questi livelli finché non arrivano le
// correzioni.
