// Word bank — libreria parole per fonema (iniziale/mediana).
// Porta lo stesso contenuto usato nella demo landing (content/word-bank.json),
// tipizzato per l'app React Native. DA VALIDARE con un logopedista prima
// di uso clinico reale — vedi nota in word-bank.json.

import { ClinicalLevel, LEVEL_ORDER, LEVEL_POSITION } from "../types/gamification";

export interface WordEntry {
  parola: string;
  emoji: string;
  // Complessità sillabica — non ancora popolato per nessuna parola e senza alcun consumer
  // (era usato solo dai sotto-step L1/L2 di una scala precedente, rimossi: vedi
  // types/gamification.ts). TODO esplicito se servirà in futuro: da taggare in un giro
  // dedicato, a mano o validato da una logopedista, non con un conteggio automatico.
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
                    w("fumo","💨"),w("foca","🦭"),w("fata","🧚"),w("faro","🗼"),w("fiocco","🎀"),w("finestra","🪟"),w("foto","📸"),w("forbici","✂️"),w("farina","🌾"),w("famiglia","👪"),w("fionda","🎯"),w("focaccia","🍞"),w("fischietto","😗"),w("fiaba","📖"),w("falco","🦅"),w("fango","🟤"),w("fontana","⛲"),w("fumetto","💭"),w("fattoria","🚜"),w("fiamma","🔥"),w("forno","🍞"),w("fuso","🌀")],
                    mediana: [w("caffè","☕"),w("elefante","🐘"),w("telefono","📞"),w("giraffa","🦒"),w("buffo","🤡"),w("profumo","🌺"),w("sofà","🛋️"),w("gonfio","🎈"),
                    w("delfino","🐬"),w("gufo","🦉"),w("trifoglio","🍀"),w("soffitto","🏠"),w("stufa","🔥"),w("scaffale","📚"),w("zaffiro","💎")] },
  g: { label: "G (dura)", iniziale: [w("gatto","🐱"),w("gallina","🐔"),w("gomma","🧽"),w("gufo","🦉"),w("gonna","👗"),w("guanto","🧤"),w("gomito","💪"),w("gabbiano","🐦"),
                    w("gallo","🐓"),w("gomitolo","🧶"),w("guscio","🥚"),w("gancio","🪝"),w("ghiaccio","🧊"),w("ghepardo","🐆"),w("gorilla","🦍"),w("gondola","🛶"),w("guardia","💂"),w("gara","🏁"),w("gattino","🐱"),w("gazzella","🦌"),w("golfo","🌊")],
                    mediana: [w("fungo","🍄"),w("lago","🏞️"),w("mago","🧙"),w("igloo","🧊"),w("ago","🪡"),w("fuga","🏃"),w("rughe","👵"),w("sugo","🍝"),
                    w("spago","🧵"),w("riga","📏"),w("drago","🐉"),w("spiga","🌾"),w("strega","🧙‍♀️"),w("fragola","🍓")] },
  gi: { label: "GI (dolce)", iniziale: [w("giraffa","🦒"),w("gelato","🍦"),w("gioco","🎮"),w("giacca","🧥"),w("girasole","🌻"),w("ginocchio","🦵"),w("gemello","👯"),w("gelso","🌳"),
                    w("giardino","🌳"),w("gemma","💎"),w("gilet","🦺"),w("giornale","📰"),w("gigante","🧌"),w("gita","🚶"),w("girino","🐸"),w("gioiello","💍"),w("genio","🧞"),w("girotondo","🧑‍🤝‍🧑"),w("ginnastica","🤸"),w("gessetto","🖍️"),w("gelo","🥶"),w("gettone","🪙"),w("gelatina","🍮"),w("gerbillo","🐹"),w("gibbone","🐒"),w("ginepro","🌲")],
                    mediana: [w("formaggio","🧀"),w("valigia","🧳"),w("magia","✨"),w("orologio","⌚"),w("pagina","📄"),w("angelo","👼"),w("spiaggia","🏖️"),w("coraggio","🦁"),
                    w("pigiama","👕"),w("formaggino","🧀"),w("reggia","🏰"),w("pioggia","🌧️"),w("villaggio","🏘️"),w("raggio","☀️"),w("assaggio","😋"),w("paesaggio","🏞️")] },
  gli: { label: "GLI", iniziale: [],
                    mediana: [w("famiglia","👪"),w("figlio","🧒"),w("maglia","👕"),w("aglio","🧄"),w("foglia","🍃"),w("coniglio","🐰"),w("bottiglia","🍾"),w("sveglia","⏰"),
                    w("paglia","🌾"),w("giglio","🌸"),w("bagaglio","🧳"),w("sbadiglio","🥱"),w("caviglia","🦶"),w("scoglio","🪨"),w("sonaglio","🔔"),w("foglio","📄"),w("conchiglia","🐚"),w("maglione","🧥"),w("vaniglia","🍦"),w("medaglia","🏅"),w("quaglia","🐦"),w("biglia","⚪")] },
  gn: { label: "GN", iniziale: [w("gnomo","🧙‍♂️"),w("gnocchi","🍝"),w("gnu","🦌")],
                    mediana: [w("castagna","🌰"),w("montagna","⛰️"),w("ragno","🕷️"),w("bagno","🛁"),w("sogno","💭"),w("cigno","🦢"),w("legno","🪵"),w("lasagna","🍝"),
                    w("campagna","🌾"),w("compagno","👦"),w("disegno","🖍️"),w("spugna","🧽"),w("vigna","🍇"),w("stagno","🐟"),w("regno","👑"),w("pugno","✊"),w("ragnatela","🕸️"),w("agnello","🐑"),w("pigna","🌰"),w("magnete","🧲")] },
  l: { label: "L", iniziale: [w("luna","🌙"),w("leone","🦁"),w("limone","🍋"),w("lupo","🐺"),w("libro","📖"),w("lampada","💡"),w("lucertola","🦎"),w("latte","🥛"),
                    w("luce","💡"),w("lana","🧶"),w("lavagna","📝"),w("lumaca","🐌"),w("letto","🛏️"),w("lingua","👅"),w("lente","🔍")],
                    mediana: [w("palla","⚽"),w("gelato","🍦"),w("mela","🍎"),w("valigia","🧳"),w("colore","🎨"),w("salame","🥓"),w("elica","🚁"),w("isola","🏝️"),
                    w("scuola","🏫"),w("sole","☀️"),w("vela","⛵"),w("farfalla","🦋"),w("mulino","🌬️")] },
  m: { label: "M", iniziale: [w("mela","🍎"),w("mano","✋"),w("mare","🌊"),w("mucca","🐄"),w("moto","🏍️"),w("matita","✏️"),w("monte","⛰️"),w("mago","🧙"),
                    w("mamma","👩"),w("medusa","🪼"),w("miele","🍯"),w("musica","🎵"),w("mostro","👹"),w("mais","🌽"),w("maglione","🧥"),w("mulino","🌬️"),w("museo","🏛️"),w("medico","🩺"),w("melone","🍈"),w("martello","🔨"),w("maschera","🎭"),w("macchina","🚗"),w("micio","🐱"),w("medaglia","🏅"),w("materasso","🛏️"),w("mattone","🧱"),w("mongolfiera","🎈"),w("monopattino","🛴"),w("merenda","🍪"),w("mappa","🗺️")],
                    mediana: [w("gomma","🧽"),w("camera","🛏️"),w("limone","🍋"),w("animale","🐾"),w("camicia","👕"),w("camino","🔥"),w("fumo","💨"),w("gomito","💪"),
                    w("scimmia","🐒"),w("cammello","🐫"),w("pomodoro","🍅"),w("famiglia","👪"),w("fumetto","💭"),w("amaca","🏖️"),w("lumaca","🐌"),w("limonata","🍋"),w("amico","🧑‍🤝‍🧑"),w("tramonto","🌇"),w("gemello","👯"),w("salame","🥓"),w("gomitolo","🧶"),w("camion","🚚")] },
  n: { label: "N", iniziale: [w("naso","👃"),w("nave","🚢"),w("nido","🪺"),w("neve","❄️"),w("nonna","👵"),w("noce","🌰"),w("numero","🔢"),w("nuvola","☁️"),
                    w("nano","🧙"),w("nastro","🎀"),w("notte","🌙"),w("nuoto","🏊"),w("nocciolina","🥜"),w("nonno","👴"),w("nocciola","🌰"),w("navetta","🚐"),w("nocca","✊")],
                    // tenda/fontana/pinguino rimosse (settembre 2026): stesso problema di
                    // farfalla/forno per R — N incollata a un'altra consonante (te-n-d-,
                    // fo-n-t-, pi-n-gu-) invece che chiara tra due vocali.
                    mediana: [w("banana","🍌"),w("luna","🌙"),w("penna","🖊️"),w("farina","🌾"),w("gonna","👗"),w("ananas","🍍"),w("cannuccia","🥤"),
                    w("cena","🍽️"),w("zaino","🎒"),w("panino","🥪"),w("moneta","🪙"),w("canarino","🐤"),w("vaniglia","🍦"),w("catena","⛓️"),w("tonno","🐟"),w("nonna","👵"),w("balena","🐋"),w("funivia","🚡"),w("panna","🍦"),w("donna","👩"),w("zanna","🦷"),w("canoa","🛶"),w("vulcano","🌋"),w("panettone","🎄"),w("limonata","🍋")] },
  mnl_cons: { label: "M/N/L + cons.", iniziale: [],
                    mediana: [w("campo","🏕️"),w("ponte","🌉"),w("dolce","🍰"),w("elmo","⛑️"),w("salto","🤸"),w("angolo","📐"),w("mondo","🌍"),w("tempo","⏰"),
                    w("ombra","🌑"),w("gamba","🦵"),w("banco","🪑"),w("monte","⛰️"),w("vento","💨"),w("dente","🦷"),w("elefante","🐘"),w("pianta","🌱"),w("gonfio","🎈"),w("vulcano","🌋"),w("pantaloni","👖"),w("balcone","🏠"),w("fontana","⛲"),w("tenda","⛺"),w("pinguino","🐧"),w("palco","🎭"),w("calcio","⚽"),w("scintilla","✨"),w("pantofola","🥿"),w("mandarino","🍊"),w("gondola","🛶"),w("campana","🔔")] },
  p: { label: "P", iniziale: [w("pane","🍞"),w("palla","⚽"),w("pesce","🐟"),w("penna","🖊️"),w("porta","🚪"),w("pizza","🍕"),w("panda","🐼"),w("pollo","🐔"),
                    w("papera","🦆"),w("pappagallo","🦜"),w("pettine","🪮"),w("pattini","⛸️"),w("palloncino","🎈"),w("piuma","🪶"),w("pesca","🍑"),w("pupazzo","⛄"),w("pentola","🍲"),w("pettirosso","🐦"),w("pigiama","👕"),w("passero","🐦"),w("puzzle","🧩"),w("palazzo","🏰"),w("pompiere","👨‍🚒"),w("piscina","🏊"),w("pianoforte","🎹"),w("pinza","🔧"),w("pomodoro","🍅"),w("pompelmo","🍊"),w("panino","🥪"),w("pipistrello","🦇")],
                    mediana: [w("lampada","💡"),w("scopa","🧹"),w("capra","🐐"),w("sapone","🧼"),w("topo","🐭"),w("papero","🦆"),w("zoppo","🦯"),w("cupola","🕌"),
                    w("lupo","🐺"),w("zuppa","🍲"),w("lampo","⚡"),w("tappeto","🟫"),w("papavero","🌺"),w("cappotto","🧥"),w("cappello","🎩"),w("pupazzo","⛄"),w("cappuccio","🧢"),w("riposo","😴"),w("tappo","🍾"),w("ape","🐝"),w("rapa","🥕"),w("tulipano","🌷"),w("capitano","⚓")] },
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
                    w("grillo","🦗"),w("brontosauro","🦕"),w("trota","🐟"),w("grano","🌾"),w("prosciutto","🍖"),w("tromba","🎺"),w("principessa","👸"),w("traghetto","⛴️"),w("drone","🛸"),w("treccia","🎀"),w("freccia","➡️"),w("grattacielo","🏙️"),w("broccolo","🥦"),w("crema","🍮"),w("cravatta","👔"),w("gru","🏗️"),w("trifoglio","🍀"),w("criceto","🐹"),w("prugna","🍑"),w("grembiule","🥻"),w("frittata","🍳"),w("crostata","🥧")],
                    mediana: [w("sopra","⬆️"),w("aprile","📅"),w("vetro","🪟"),w("cetriolo","🥒"),w("fabbro","🔨"),w("quadro","🖼️"),w("ombra","🌑"),w("libro","📖"),
                    w("zebra","🦓"),w("cobra","🐍"),w("cifra","🔢"),w("vetrina","🪟")] },
  r_cons: { label: "R + cons.", iniziale: [],
                    mediana: [w("porta","🚪"),w("carta","📄"),w("cartone","📦"),w("forchetta","🍴"),w("tartaruga","🐢"),w("orso","🐻"),w("corda","🪢"),w("verde","🟢"),
                    w("inverno","❄️"),w("verme","🪱"),w("forbici","✂️"),w("sorpresa","🎁"),w("scarpa","👟"),w("torta","🎂"),w("corpo","🧍"),w("barca","⛵"),w("marca","🏷️"),w("orzo","🌾"),w("corvo","🐦‍⬛"),w("forno","🍞"),w("parco","🌳"),w("marzo","📅"),w("scorpione","🦂"),w("orto","🥕"),w("corno","📯"),w("formica","🐜"),w("borsa","👜"),w("cartolina","💌"),w("verdura","🥦"),w("corsa","🏃")] },
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
                    w("scarpa","👟"),w("scoiattolo","🐿️"),w("spugna","🧽"),w("scatola","📦"),w("scuola","🏫"),w("strega","🧙‍♀️"),w("spillo","📌"),w("specchio","🪞"),w("spirale","🌀"),w("stufa","🔥"),w("scaffale","📚"),w("stanza","🚪"),w("sport","⚽"),w("stadio","🏟️"),w("spuntino","🍎"),w("stampo","🧁"),w("scherzo","🤡"),w("stormo","🐦"),w("scrigno","💰"),w("stringa","🎀")],
                    mediana: [w("finestra","🪟"),w("orchestra","🎻"),w("minestra","🍲"),w("castello","🏰"),w("pastore","🐑"),w("canestro","🏀"),w("mostro","👹"),w("vestito","👗"),
                    w("cestino","🧺"),w("pesca","🍑"),w("maestro","👨‍🏫"),w("foresta","🌲"),w("pescatore","🎣"),w("maschera","🎭"),w("nastro","🎀"),w("boschetto","🌳"),w("agosto","☀️"),w("tempesta","⛈️"),w("testa","👤")] },
  sci_sce: { label: "SCI/SCE", iniziale: [w("sciarpa","🧣"),w("scivolo","🛝"),w("scienza","🔬"),w("scelta","🤔"),w("scimmia","🐒"),w("scintilla","✨"),w("sceriffo","🤠"),w("scienziato","🔬"),w("scimpanze","🐒"),w("scettro","👑")],
                    mediana: [w("pesce","🐟"),w("uscita","🚪"),w("ascensore","🛗"),w("cuscino","🛏️"),w("striscia","🌈"),w("nascita","👶"),w("crescita","📈"),w("prosciutto","🍖"),
                    w("asciugamano","🧻"),w("pesciolino","🐟"),w("guscio","🥚"),w("fascia","🩹")] },
  t: { label: "T", iniziale: [w("tavolo","🪑"),w("topo","🐭"),w("torta","🎂"),w("tigre","🐯"),w("tazza","☕"),w("tartaruga","🐢"),w("tenda","⛺"),w("toro","🐂"),
                    w("tuono","⛈️"),w("tacchino","🦃"),w("tappeto","🧶"),w("tamburo","🥁"),w("testa","👤"),w("tulipano","🌷"),w("torre","🏰"),w("tesoro","💰"),w("tappo","🍾"),w("tastiera","⌨️"),w("tempesta","⛈️"),w("tuta","👖"),w("tacco","👠"),w("tetto","🏠"),w("tortora","🕊️"),w("turbante","👳"),w("tuffo","🤿"),w("tegame","🍳"),w("teiera","🫖"),w("tunnel","🚇"),w("tucano","🦜"),w("tortellini","🍝")],
                    mediana: [w("gatto","🐱"),w("patata","🥔"),w("matita","✏️"),w("bottiglia","🍾"),w("latte","🥛"),w("dita","🖐️"),w("aquilotto","🦅"),w("gomito","💪"),
                    w("bottone","🔘"),w("lattuga","🥬"),w("pattini","⛸️"),w("fetta","🍰"),w("scatola","📦"),w("gattino","🐱"),w("biscotto","🍪"),w("letto","🛏️"),w("biglietto","🎫"),w("tortellini","🍝"),w("cravatta","👔"),w("cometa","☄️"),w("foto","📸"),w("gettone","🪙"),w("dattero","🌴"),w("cappotto","🧥"),w("scoiattolo","🐿️"),w("gomitolo","🧶"),w("tortora","🕊️"),w("pettine","🪮")] },
  v: { label: "V", iniziale: [w("vaso","🏺"),w("vela","⛵"),w("volpe","🦊"),w("vulcano","🌋"),w("vento","💨"),w("valigia","🧳"),w("vacca","🐄"),w("verme","🪱"),
                    w("violino","🎻"),w("vespa","🐝"),w("vagone","🚃"),w("verdura","🥦"),w("vetro","🪟"),w("vaniglia","🍦"),w("vetrina","🪟"),w("vassoio","🍽️"),w("vernice","🎨"),w("veliero","⛵"),w("vigile","👮"),w("volante","🚗"),w("vongola","🐚"),w("violetta","🌸"),w("vestito","👗"),w("vaporetto","🚤"),w("vitello","🐄"),w("veterinario","🩺"),w("vanga","🌱"),w("verde","🟢")],
                    mediana: [w("uovo","🥚"),w("avvocato","🥑"),w("chiave","🔑"),w("cavallo","🐴"),w("uva","🍇"),w("divano","🛋️"),w("nave","🚢"),w("polvere","💨"),
                    w("neve","❄️"),w("sveglia","⏰"),w("stivale","👢"),w("scivolo","🛝"),w("savana","🦁"),w("lavatrice","🧺"),w("lavandino","🚰"),w("lavagna","📝"),w("salvadanaio","🐷"),w("pavone","🦚"),w("cavolo","🥬"),w("favola","📖"),w("salvagente","🛟"),w("ravanello","🥕"),w("avocado","🥑")] },
  z_dz: { label: "Z (sonora, dz)", iniziale: [w("zaino","🎒"),w("zanzara","🦟"),w("zero","0️⃣"),w("zolla","🌱"),w("zebra","🦓"),w("zenzero","🫚"),w("zaffiro","💎"),w("zolletta","🍬"),w("zoo","🦁"),w("zecca","🐜")],
                    mediana: [w("orzo","🌾"),w("mezzo","🚌"),w("azzurro","🔵"),w("zenzero","🫚"),w("pranzo","🍽️")] },
  zeta: { label: "Zeta", iniziale: [w("zebra","🦓"),w("zucca","🎃"),w("zucchero","🍬"),w("zio","👨"),w("zoo","🦁"),w("zanna","🦷"),w("zattera","🛟"),w("zaino","🎒"),w("zanzara","🦟"),w("zenzero","🫚"),w("zolla","🌱"),w("zecca","🐜"),w("zolletta","🍬"),w("zaffiro","💎"),w("zia","👩"),w("zuppa","🍲")],
                    mediana: [w("pizza","🍕"),w("pazzo","🤪"),w("ragazzo","👦"),w("palazzo","🏰"),w("ragazza","👧"),w("spazzola","🪮"),w("mezzanotte","🌙"),w("tazza","☕"),w("puzzola","🦨")] },
  z_ts: { label: "Z (sorda, ts)", iniziale: [w("zucchero","🍬"),w("zucca","🎃"),w("zitto","🤫"),w("zampa","🐾"),w("zuppa","🍲")],
                    mediana: [w("pizza","🍕"),w("calzino","🧦"),w("marzo","📅"),w("piazza","🏛️")] },
};

// Coppie minime curate: solo per fonemi dove ha senso clinico un confronto a due parole
// (categorie a suono singolo). Le 4 categorie composite/cluster (cons_r, r_cons, s_cons,
// mnl_cons: TR/DR/FR..., -RT-/-RD-..., ST/SP/SC..., -MP-/-NT-/-LC-...) raggruppano più
// suoni diversi e non hanno un'unica coppia minima onesta da proporre — per quelle
// CoppieMinime (SessionScreen.tsx) pesca invece parole reali del fonema stesso dal word
// bank, invece di ricadere sempre sulla stessa coppia "sole/sale" di un suono non pertinente.
//
// Per posizione (settembre 2026 — prima era un unico pool generico riusato identico a
// Livello 1 e Livello 2, che mostrava per esempio "bagno/banco" anche al nodo "Parola
// iniziale" pur avendo GN in mezzo alla parola, non all'inizio): ogni coppia dichiara ora
// esplicitamente se la parola bersaglio ha il fonema in posizione iniziale o mediana, e
// CoppieMinime pesca solo dal pool del livello aperto. GN, SCI/SCE e la Z sorda (z_ts) non
// avevano ancora una coppia iniziale vera (quella esistente aveva il fonema in mezzo, es.
// "pesce" ha SCE mediana) — aggiunta qui usando le poche parole iniziali reali di questi
// fonemi (gn: solo gnomo/gnocchi/gnu esistono in italiano comune). GLI non ha invece
// NESSUNA parola iniziale possibile in italiano (il digramma non apre mai una parola comune,
// vedi WORD_BANK.gli.iniziale=[]): resta solo mediana, per costruzione linguistica, non per
// contenuto mancante da curare.
//
// Ogni posizione ha un ARRAY di coppie (brief riorganizzazione livelli, settembre 2026:
// "almeno 4 coppie diverse, 5 partite a coppia") — oggi ne è curata solo una per
// fonema/posizione, le altre arrivano nei prossimi giri di generazione contenuto insieme
// all'espansione del word bank. CoppieMinime cicla su quante coppie sono disponibili, quindi
// funziona già con 1 e scala automaticamente a 4 senza bisogno di un altro cambio di codice.
// DA VALIDARE con un logopedista prima di uso clinico reale, come il resto del word bank.
export const MINIMAL_PAIRS: Partial<Record<PhonemeKey, Partial<Record<"iniziale" | "mediana", Array<[WordEntry, WordEntry]>>>>> = {
  s: { iniziale: [[w("sole", "☀️"), w("sale", "🧂")]], mediana: [[w("naso", "👃"), w("nano", "🧙")]] },
  z_ts: { iniziale: [[w("zitto", "🤫"), w("dito", "☝️")]], mediana: [[w("razzo", "🚀"), w("riso", "🍚")]] },
  r: { iniziale: [[w("rana", "🐸"), w("lana", "🧶")]], mediana: [[w("torre", "🏰"), w("torta", "🎂")]] },
  l: { iniziale: [[w("luna", "🌙"), w("una", "1️⃣")]], mediana: [[w("mela", "🍎"), w("neve", "❄️")]] },
  t: { iniziale: [[w("tana", "🕳️"), w("dado", "🎲")]], mediana: [[w("latte", "🥛"), w("lago", "🏞️")]] },
  c: { iniziale: [[w("cane", "🐶"), w("pane", "🍞")]], mediana: [[w("baco", "🐛"), w("bacio", "💋")]] },
  p: { iniziale: [[w("palla", "⚽"), w("balla", "💃")]], mediana: [[w("topo", "🐭"), w("toro", "🐂")]] },
  b: { iniziale: [[w("barca", "⛵"), w("marca", "🏷️")]], mediana: [[w("gabbia", "🦜"), w("gamba", "🦵")]] },
  ci: { iniziale: [[w("cielo", "☁️"), w("gelo", "🥶")]], mediana: [[w("faccia", "😊"), w("vacca", "🐄")]] },
  d: { iniziale: [[w("dente", "🦷"), w("gente", "🧑‍🤝‍🧑")]], mediana: [[w("radio", "📻"), w("raggio", "☀️")]] },
  f: { iniziale: [[w("faro", "🗼"), w("caro", "💛")]], mediana: [[w("giraffa", "🦒"), w("giacca", "🧥")]] },
  g: { iniziale: [[w("gatto", "🐱"), w("matto", "🌀")]], mediana: [[w("mago", "🧙"), w("mano", "✋")]] },
  gi: { iniziale: [[w("gelo", "🥶"), w("cielo", "☁️")]], mediana: [[w("valigia", "🧳"), w("vaniglia", "🍦")]] },
  gli: { mediana: [[w("paglia", "🌾"), w("palla", "⚽")]] },
  gn: { iniziale: [[w("gnomo", "🧙‍♂️"), w("nonno", "👴")]], mediana: [[w("bagno", "🛁"), w("banco", "🪑")]] },
  m: { iniziale: [[w("mano", "✋"), w("nano", "🧙")]], mediana: [[w("gomma", "🧽"), w("gonna", "👗")]] },
  n: { iniziale: [[w("naso", "👃"), w("vaso", "🏺")]], mediana: [[w("luna", "🌙"), w("lupo", "🐺")]] },
  sci_sce: { iniziale: [[w("sciarpa", "🧣"), w("scarpa", "👟")]], mediana: [[w("pesce", "🐟"), w("cece", "🫘")]] },
  v: { iniziale: [[w("vento", "💨"), w("cento", "💯")]], mediana: [[w("neve", "❄️"), w("nonna", "👵")]] },
  z_dz: { iniziale: [[w("zero", "0️⃣"), w("vero", "✅")]], mediana: [[w("orzo", "🌾"), w("orso", "🐻")]] },
  zeta: { iniziale: [[w("zucca", "🎃"), w("buca", "🕳️")]], mediana: [[w("pazzo", "🤪"), w("matto", "🌀")]] },
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

export function wordsFor(key: PhonemeKey, position: "iniziale" | "mediana"): WordEntry[] {
  const entry = WORD_BANK[key];
  const primary = entry[position];
  if (primary && primary.length) return primary;
  // fallback alla posizione disponibile se quella richiesta è vuota
  return entry.iniziale.length ? entry.iniziale : entry.mediana;
}

// Tutte le parole del fonema, iniziale + mediana insieme — usato solo dai giochi di
// narrazione (L4, Sequenze illustrate) che non hanno un concetto di posizione (vedi
// LEVEL_POSITION). I giochi legati a un livello con posizione (Ripeti, Coppie minime,
// Memory, ecc.) usano invece wordsFor con la posizione del livello aperto.
export function allWordsFor(key: PhonemeKey): WordEntry[] {
  const entry = WORD_BANK[key];
  return [...entry.iniziale, ...entry.mediana];
}

// Livelli clinici che esistono davvero per QUESTO fonema — esclude un livello quando la sua
// posizione (LEVEL_POSITION) è strutturalmente vuota per il fonema, non per una lacuna di
// contenuto da curare: GLI e i due gruppi consonantici cons_r-reversed (r_cons: -RT-/-RD-/...)
// e M/N/L+cons. (mnl_cons) non hanno MAI una parola italiana comune con quel suono in
// posizione iniziale (sono cluster che in italiano si formano solo a cavallo tra due sillabe,
// mai in apertura di parola) — offrire comunque il nodo "Livello 1" per questi fonemi
// mostrerebbe parole mediana sotto l'etichetta "iniziale" (bug segnalato, vedi fallback di
// wordsFor sopra). Usata sia per la mappa (LivelliScreen) sia per inizializzare i progressi di
// un fonema nello store (freshLevels), così il livello nascosto non resta anche "saltato" per
// sempre nello sblocco a cascata: qui non esiste proprio, la progressione passa al successivo.
export function applicableLevelsFor(key: PhonemeKey): ClinicalLevel[] {
  return LEVEL_ORDER.filter((level) => {
    const position = LEVEL_POSITION[level];
    return !position || WORD_BANK[key][position].length > 0;
  });
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
