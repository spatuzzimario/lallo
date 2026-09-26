// Racconti (L4a, "Racconta la storia") — brief blocco C. Copertura pilota sui 6 fonemi del
// piano gratuito (m, n, p, t, l, s), stesso principio di phrases.ts: scrivere racconti per
// tutti i 25 fonemi è un lavoro di autorialità a parte. Ogni scena usa una parola-chiave già
// presente e validata nel word bank (audio+illustrazione). DA VALIDARE con una logopedista
// prima di uso clinico reale, come il resto del word bank.
//
// Le illustrazioni sono generate ad hoc per ogni scena (Higgsfield, stesso stile kawaii
// flat delle carte-parola esistenti — vedi CLAUDE.md §8), non le stesse carte-parola: una
// scena mostra il soggetto/l'azione del racconto, non solo la parola isolata.

import { PhonemeKey } from "./wordBank";

export interface StoryScene {
  testo: string; // frase della scena, letta/ripetuta per intero
  parola: string; // parola-chiave del word bank (audio via speakWord)
  slug: string; // audio ElevenLabs dedicato per `testo`
  image: any; // require() dell'illustrazione di scena (kawaii flat, style-lock esistente)
}

export interface Story {
  title: string;
  scenes: StoryScene[];
}

export const STORIES: Partial<Record<PhonemeKey, Story>> = {
  m: {
    title: "Il compleanno di Marta la mucca",
    scenes: [
      { testo: "Marta la mucca si sveglia felice: oggi è il suo compleanno!", parola: "mucca", slug: "storia_m_0", image: require("../../assets/illustrations/racconti/scena_m_0.png") },
      { testo: "La mamma le prepara una torta con sopra una bella mela.", parola: "mela", slug: "storia_m_1", image: require("../../assets/illustrations/racconti/scena_m_1.png") },
      { testo: "Arriva il mago con la sua musica per festeggiare insieme.", parola: "mago", slug: "storia_m_2", image: require("../../assets/illustrations/racconti/scena_m_2.png") },
      { testo: "Alla fine della festa, Marta guarda la luna e fa un desiderio.", parola: "luna", slug: "storia_m_3", image: require("../../assets/illustrations/racconti/scena_m_3.png") },
    ],
  },
  n: {
    title: "La nave di Nino",
    scenes: [
      { testo: "Nino il nano vive vicino al mare, dentro un piccolo nido.", parola: "nido", slug: "storia_n_0", image: require("../../assets/illustrations/racconti/scena_n_0.png") },
      { testo: "Un giorno vede una grande nave arrivare dal mare.", parola: "nave", slug: "storia_n_1", image: require("../../assets/illustrations/racconti/scena_n_1.png") },
      { testo: "Sale a bordo e saluta la nonna del capitano.", parola: "nonna", slug: "storia_n_2", image: require("../../assets/illustrations/racconti/scena_n_2.png") },
      { testo: "Di notte, sul ponte, Nino conta le stelle e guarda la luna.", parola: "luna", slug: "storia_n_3", image: require("../../assets/illustrations/racconti/scena_n_3.png") },
    ],
  },
  p: {
    title: "Pino il pappagallo",
    scenes: [
      { testo: "Pino il pappagallo vive su una palma vicino al mare.", parola: "pappagallo", slug: "storia_p_0", image: require("../../assets/illustrations/racconti/scena_p_0.png") },
      { testo: "Ogni giorno vola sopra il pesce che nuota vicino alla riva.", parola: "pesce", slug: "storia_p_1", image: require("../../assets/illustrations/racconti/scena_p_1.png") },
      { testo: "Alla sera torna a casa e mangia una fetta di pizza.", parola: "pizza", slug: "storia_p_2", image: require("../../assets/illustrations/racconti/scena_p_2.png") },
      { testo: "Poi saluta il suo amico panda prima di andare a dormire.", parola: "panda", slug: "storia_p_3", image: require("../../assets/illustrations/racconti/scena_p_3.png") },
    ],
  },
  t: {
    title: "Tina la tartaruga",
    scenes: [
      { testo: "Tina la tartaruga cammina piano nel prato.", parola: "tartaruga", slug: "storia_t_0", image: require("../../assets/illustrations/racconti/scena_t_0.png") },
      { testo: "Incontra un topo che corre veloce tra i fiori.", parola: "topo", slug: "storia_t_1", image: require("../../assets/illustrations/racconti/scena_t_1.png") },
      { testo: "Poi vede una tigre disegnata su un grande libro.", parola: "tigre", slug: "storia_t_2", image: require("../../assets/illustrations/racconti/scena_t_2.png") },
      { testo: "Alla fine sentono il verso buffo di un tacchino e ridono insieme.", parola: "tacchino", slug: "storia_t_3", image: require("../../assets/illustrations/racconti/scena_t_3.png") },
    ],
  },
  l: {
    title: "Leo il leoncino",
    scenes: [
      { testo: "Leo il leone dorme tutto il giorno al caldo sole.", parola: "leone", slug: "storia_l_0", image: require("../../assets/illustrations/racconti/scena_l_0.png") },
      { testo: "Di notte si sveglia e guarda la luna splendere nel cielo.", parola: "luna", slug: "storia_l_1", image: require("../../assets/illustrations/racconti/scena_l_1.png") },
      { testo: "Sente in lontananza un lupo ululare nel bosco.", parola: "lupo", slug: "storia_l_2", image: require("../../assets/illustrations/racconti/scena_l_2.png") },
      { testo: "Prima di riaddormentarsi saluta una lumaca lenta che passa vicino.", parola: "lumaca", slug: "storia_l_3", image: require("../../assets/illustrations/racconti/scena_l_3.png") },
    ],
  },
  s: {
    title: "Sara e il mare",
    scenes: [
      { testo: "Sara va al mare e si sdraia sotto il sole caldo.", parola: "sole", slug: "storia_s_0", image: require("../../assets/illustrations/racconti/scena_s_0.png") },
      { testo: "Vede un serpente colorato che striscia piano sulla sabbia.", parola: "serpente", slug: "storia_s_1", image: require("../../assets/illustrations/racconti/scena_s_1.png") },
      { testo: "In lontananza sente cantare una sirena in mezzo al mare.", parola: "sirena", slug: "storia_s_2", image: require("../../assets/illustrations/racconti/scena_s_2.png") },
      { testo: "Alla fine trova un sasso a forma di cuore e lo porta a casa.", parola: "sasso", slug: "storia_s_3", image: require("../../assets/illustrations/racconti/scena_s_3.png") },
    ],
  },
};
