// Frasi e filastrocche per L3 (Frase) e L4b (Racconto in rima) — brief aggiornamento
// livelli, blocco A/C. Copertura pilota sui 6 fonemi del piano gratuito (m, n, p, t, l, s):
// scrivere contenuto per tutti i 25 fonemi è un lavoro di autorialità a parte, non fatto qui
// per non improvvisare 25 filastrocche in un colpo solo — vedi CLAUDE.md "niente contenuti
// inventati, TODO esplicito se manca un dato reale". Ogni frase/rima usa solo parole già
// presenti e validate nel word bank (wordBank.ts) come parola-chiave illustrata; le altre
// parole di contorno sono italiano comune, non termini clinici. DA VALIDARE con una
// logopedista prima di uso clinico reale, come il resto del word bank.
//
// `slug` è la registrazione ElevenLabs dedicata (voce Linda Fiore), stesso principio del
// resto dell'app: contenuto che il bambino deve capire bene usa sempre l'audio registrato,
// mai solo il fallback TTS di sistema.

import { PhonemeKey } from "./wordBank";

export interface PhraseEntry {
  testo: string; // frase completa, letta/ripetuta per intero
  parola: string; // parola-chiave del word bank contenuta nella frase (immagine + audio)
  slug: string; // audio ElevenLabs dedicato per `testo`
}

export const PHRASES: Partial<Record<PhonemeKey, PhraseEntry[]>> = {
  m: [
    { testo: "La mamma mangia la mela.", parola: "mela", slug: "frase_m_0" },
    { testo: "Il mostro indossa un maglione.", parola: "maglione", slug: "frase_m_1" },
    { testo: "La mucca guarda la luna.", parola: "mucca", slug: "frase_m_2" },
    { testo: "Il mago ascolta la musica.", parola: "mago", slug: "frase_m_3" },
  ],
  n: [
    { testo: "La nonna guarda la luna.", parola: "nonna", slug: "frase_n_0" },
    { testo: "Il nido è tra le foglie.", parola: "nido", slug: "frase_n_1" },
    { testo: "La nave è sul mare.", parola: "nave", slug: "frase_n_2" },
    { testo: "Il naso del pupazzo è una carota.", parola: "naso", slug: "frase_n_3" },
  ],
  p: [
    { testo: "Il pesce nuota nel mare.", parola: "pesce", slug: "frase_p_0" },
    { testo: "Il pappagallo vola alto.", parola: "pappagallo", slug: "frase_p_1" },
    { testo: "La pizza è calda.", parola: "pizza", slug: "frase_p_2" },
    { testo: "Il panda mangia le foglie.", parola: "panda", slug: "frase_p_3" },
  ],
  t: [
    { testo: "La tartaruga cammina piano.", parola: "tartaruga", slug: "frase_t_0" },
    { testo: "Il topo corre veloce.", parola: "topo", slug: "frase_t_1" },
    { testo: "La tigre ruggisce forte.", parola: "tigre", slug: "frase_t_2" },
    { testo: "Il tacchino fa un verso buffo.", parola: "tacchino", slug: "frase_t_3" },
  ],
  l: [
    { testo: "Il leone dorme al sole.", parola: "leone", slug: "frase_l_0" },
    { testo: "La luna splende di notte.", parola: "luna", slug: "frase_l_1" },
    { testo: "Il lupo ulula nel bosco.", parola: "lupo", slug: "frase_l_2" },
    { testo: "La lumaca è lenta.", parola: "lumaca", slug: "frase_l_3" },
  ],
  s: [
    { testo: "Il sole scalda la sabbia.", parola: "sole", slug: "frase_s_0" },
    { testo: "Il serpente striscia piano.", parola: "serpente", slug: "frase_s_1" },
    { testo: "La sirena canta nel mare.", parola: "sirena", slug: "frase_s_2" },
    { testo: "Il sasso cade nell'acqua.", parola: "sasso", slug: "frase_s_3" },
  ],
};

export interface RhymeEntry {
  righe: string[]; // righe prima della parola finale, lette come un'unica frase
  parolaFinale: string; // parola-chiave del word bank che completa la rima (immagine + audio)
  distrattori: string[]; // 2 parole del word bank, non in rima, per la scelta multipla
  slug: string; // audio ElevenLabs dedicato per `righe.join(" ")`
}

export const RHYMES: Partial<Record<PhonemeKey, RhymeEntry[]>> = {
  m: [
    { righe: ["Sulla barca c'è una vela,", "e vicino c'è una..."], parolaFinale: "mela", distrattori: ["luna", "torta"], slug: "rima_m_0" },
    { righe: ["Il garage è tutto vuoto,", "c'è soltanto la mia..."], parolaFinale: "moto", distrattori: ["pizza", "sedia"], slug: "rima_m_1" },
  ],
  n: [
    { righe: ["Il gatto il latte beve,", "fuori intanto cade la..."], parolaFinale: "neve", distrattori: ["sole", "pizza"], slug: "rima_n_0" },
    { righe: ["Nel cielo c'è soltanto una,", "bella e tonda, è la..."], parolaFinale: "luna", distrattori: ["mela", "torta"], slug: "rima_n_1" },
  ],
  p: [
    { righe: ["Il pagliaccio salta e balla,", "poi rincorre la sua..."], parolaFinale: "palla", distrattori: ["luna", "mela"], slug: "rima_p_0" },
    { righe: ["Nel giardino corre un cane,", "in cucina c'è il..."], parolaFinale: "pane", distrattori: ["sole", "topo"], slug: "rima_p_1" },
  ],
  t: [
    { righe: ["Bussano piano alla porta,", "sul tavolo c'è una..."], parolaFinale: "torta", distrattori: ["luna", "palla"], slug: "rima_t_0" },
    { righe: ["Il cane sembra matto,", "e rincorre il..."], parolaFinale: "gatto", distrattori: ["sole", "pane"], slug: "rima_t_1" },
  ],
  l: [
    { righe: ["Il bambino tutto vuole,", "ma preferisce stare al..."], parolaFinale: "sole", distrattori: ["torta", "gatto"], slug: "rima_l_0" },
    { righe: ["Corriamo tutti nel prato,", "poi mangiamo il..."], parolaFinale: "gelato", distrattori: ["pane", "luna"], slug: "rima_l_1" },
  ],
  s: [
    { righe: ["Il bambino fa un passo,", "e inciampa in un..."], parolaFinale: "sasso", distrattori: ["gatto", "sole"], slug: "rima_s_0" },
    { righe: ["Guarda un po' che bella cosa,", "un fiore rosso, è una..."], parolaFinale: "rosa", distrattori: ["torta", "luna"], slug: "rima_s_1" },
  ],
};
