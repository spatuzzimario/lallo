// Sequenze illustrate (L4a, narrazione) — una storia vera per fonema, non 3 parole a caso
// (bug segnalato: la versione precedente pescava 3 parole random dal word bank, senza un
// filo logico tra loro). Ogni storia è una catena causale/temporale reale (A porta a B, che
// porta a C — crescita, causa-effetto o routine quotidiana), con le parole il più possibile
// del fonema in allenamento. Scritte dal founder, revisionate su un file Excel prima di
// entrare qui (stesso processo di phrases.ts/stories.ts). DA VALIDARE con una logopedista
// prima di uso clinico reale, come il resto del word bank.
//
// Ogni step ha un "connector" (letto in TTS, nessuna registrazione dedicata — stesso principio
// delle istruzioni dinamiche di CacciaAlSuono) seguito dalla parola vera, pronunciata chiara
// con l'audio registrato di Linda Fiore (speakWord) e mostrata con la sua illustrazione reale
// (WordVisual) — mai solo un'emoji generica.
import { PhonemeKey } from "./wordBank";

export interface SequenceStep {
  connector: string;
  parola: string;
}

export interface Sequence {
  steps: [SequenceStep, SequenceStep, SequenceStep];
}

function seq(
  c1: string, p1: string,
  c2: string, p2: string,
  c3: string, p3: string
): Sequence {
  return { steps: [{ connector: c1, parola: p1 }, { connector: c2, parola: p2 }, { connector: c3, parola: p3 }] };
}

export const SEQUENCES: Record<PhonemeKey, Sequence> = {
  b: seq(
    "Ecco la", "mucca",
    "che dà il", "latte",
    "che poi diventa", "burro"
  ),
  c: seq(
    "Ecco l'", "uovo",
    "da cui nasce l'", "oca",
    "che va a nuotare nell'", "acqua"
  ),
  ci: seq(
    "Con la", "farina",
    "prepariamo una", "ciambella",
    "che si guarnisce col", "cioccolato"
  ),
  d: seq(
    "Con la", "farina",
    "prepariamo un", "dolce",
    "da portare in dono alla", "nonna"
  ),
  f: seq(
    "Ecco il", "fiore",
    "che attira la", "farfalla",
    "e poi arriva l'", "ape"
  ),
  g: seq(
    "Dal", "gomitolo",
    "con l'", "ago",
    "si cuce la", "gonna"
  ),
  gi: seq(
    "Nel", "giardino",
    "arriva la", "pioggia",
    "e cresce il", "girasole"
  ),
  gli: seq(
    "Ecco il", "coniglio",
    "che mangia una", "foglia",
    "e torna dalla", "famiglia"
  ),
  gn: seq(
    "Tra i rami di", "legno",
    "arriva il", "ragno",
    "che tesse la", "ragnatela"
  ),
  l: seq(
    "Tramonta il", "sole",
    "arriva la", "luna",
    "e accendiamo la", "lampada"
  ),
  m: seq(
    "Sul", "monte",
    "pascola la", "mucca",
    "fino al", "tramonto"
  ),
  n: seq(
    "Dalla", "nuvola",
    "cade la", "neve",
    "che copre la", "collina"
  ),
  mnl_cons: seq(
    "Cresce la", "pianta",
    "che fa", "ombra",
    "e si muove col", "vento"
  ),
  p: seq(
    "Nel", "pollaio",
    "c'è un", "uovo",
    "da cui nasce il", "pulcino"
  ),
  r: seq(
    "Il", "raggio",
    "scalda il", "roseto",
    "e fa sbocciare la", "rosa"
  ),
  cons_r: seq(
    "Nel", "prato",
    "cresce il", "trifoglio",
    "che sfama il", "bruco"
  ),
  r_cons: seq(
    "Nell'", "orto",
    "cresce la", "verdura",
    "che diventerà un", "minestrone"
  ),
  s: seq(
    "Il", "sole",
    "scalda il", "sasso",
    "dove si stende il", "serpente"
  ),
  s_cons: seq(
    "Suona la", "sveglia",
    "indossiamo il", "vestito",
    "e andiamo a", "scuola"
  ),
  sci_sce: seq(
    "Si rompe il guscio della", "noce",
    "esce il", "gheriglio",
    "che poi mangia lo", "scoiattolo"
  ),
  // "Teo" è solo un nome dentro il testo parlato (connector), non un'immagine a sé — stesso
  // principio di "Rocco il robot" in stories.ts: la parola vera resta "gatto".
  t: seq(
    "Ecco il", "gatto",
    "che si chiama Teo e salta sul", "tetto",
    "per cacciare il", "topo"
  ),
  v: seq(
    "Con la", "vanga",
    "raccogliamo il", "ravanello",
    "che disponiamo in un", "vassoio"
  ),
  z_dz: seq(
    "Ecco lo", "zio",
    "nel suo giardino coltiva l'", "orzo",
    "che cuciniamo per il", "pranzo"
  ),
  zeta: seq(
    "Nella", "zolla",
    "cresce la", "zucca",
    "che a Halloween intagliamo in una", "lanterna"
  ),
  z_ts: seq(
    "Matura la", "zucca",
    "si aggiunge lo", "zucchero",
    "e si prepara la", "zuppa"
  ),
};
