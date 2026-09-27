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
  b: {
    title: "Beba la balena",
    scenes: [
      { testo: "Beba la balena vive nel grande mare blu.", parola: "balena", slug: "storia_b_0", image: require("../../assets/illustrations/racconti/scena_b_0.png") },
      { testo: "Un giorno vede passare una piccola barca a vela.", parola: "barca", slug: "storia_b_1", image: require("../../assets/illustrations/racconti/scena_b_1.png") },
      { testo: "Sulla barca c'è un bambino con un berretto colorato.", parola: "berretto", slug: "storia_b_2", image: require("../../assets/illustrations/racconti/scena_b_2.png") },
      { testo: "Beba saluta con la coda e il bambino sventola la bandiera.", parola: "bandiera", slug: "storia_b_3", image: require("../../assets/illustrations/racconti/scena_b_3.png") },
    ],
  },
  c: {
    title: "Coco il cavallo coraggioso",
    scenes: [
      { testo: "Coco il cavallo vive in una grande casa di campagna.", parola: "casa", slug: "storia_c_0", image: require("../../assets/illustrations/racconti/scena_c_0.png") },
      { testo: "Ogni mattina mette un cappello per proteggersi dal sole.", parola: "cappello", slug: "storia_c_1", image: require("../../assets/illustrations/racconti/scena_c_1.png") },
      { testo: "Un giorno incontra un coniglio che ha perso la strada.", parola: "coniglio", slug: "storia_c_2", image: require("../../assets/illustrations/racconti/scena_c_2.png") },
      { testo: "Coco aiuta il coniglio a tornare a casa, felice in cuore.", parola: "cuore", slug: "storia_c_3", image: require("../../assets/illustrations/racconti/scena_c_3.png") },
    ],
  },
  ci: {
    title: "Cicci la cicogna",
    scenes: [
      { testo: "Cicci la cicogna vola nel cielo azzurro.", parola: "cielo", slug: "storia_ci_0", image: require("../../assets/illustrations/racconti/scena_ci_0.png") },
      { testo: "Vede un cigno bianco nuotare nel lago.", parola: "cigno", slug: "storia_ci_1", image: require("../../assets/illustrations/racconti/scena_ci_1.png") },
      { testo: "Poi si ferma a mangiare una dolce ciliegia.", parola: "ciliegia", slug: "storia_ci_2", image: require("../../assets/illustrations/racconti/scena_ci_2.png") },
      { testo: "Alla sera torna al nido, pronta per la cena.", parola: "cena", slug: "storia_ci_3", image: require("../../assets/illustrations/racconti/scena_ci_3.png") },
    ],
  },
  d: {
    title: "Dado il draghetto",
    scenes: [
      { testo: "Dado il draghetto vive in un castello sulla montagna.", parola: "drago", slug: "storia_d_0", image: require("../../assets/illustrations/racconti/scena_d_0.png") },
      { testo: "Ogni giorno gioca con un grande dado colorato.", parola: "dado", slug: "storia_d_1", image: require("../../assets/illustrations/racconti/scena_d_1.png") },
      { testo: "Un giorno perde un dente e si spaventa un po'.", parola: "dente", slug: "storia_d_2", image: require("../../assets/illustrations/racconti/scena_d_2.png") },
      { testo: "Il dottore lo rassicura: è normale, ne crescerà uno nuovo!", parola: "dottore", slug: "storia_d_3", image: require("../../assets/illustrations/racconti/scena_d_3.png") },
    ],
  },
  f: {
    title: "Fifi la farfalla",
    scenes: [
      { testo: "Fifi la farfalla vola leggera tra i fiori.", parola: "farfalla", slug: "storia_f_0", image: require("../../assets/illustrations/racconti/scena_f_0.png") },
      { testo: "Si posa su un fungo colorato nel bosco.", parola: "fungo", slug: "storia_f_1", image: require("../../assets/illustrations/racconti/scena_f_1.png") },
      { testo: "Incontra una fata che le regala polvere magica.", parola: "fata", slug: "storia_f_2", image: require("../../assets/illustrations/racconti/scena_f_2.png") },
      { testo: "Alla sera vede accendersi il faro sulla scogliera.", parola: "faro", slug: "storia_f_3", image: require("../../assets/illustrations/racconti/scena_f_3.png") },
    ],
  },
  g: {
    title: "Gigi il gatto goloso",
    scenes: [
      { testo: "Gigi il gatto vive in una casa con un grande giardino.", parola: "gatto", slug: "storia_g_0", image: require("../../assets/illustrations/racconti/scena_g_0.png") },
      { testo: "Ogni mattina insegue la gallina nel cortile.", parola: "gallina", slug: "storia_g_1", image: require("../../assets/illustrations/racconti/scena_g_1.png") },
      { testo: "Di sera guarda il gufo volare sopra il tetto.", parola: "gufo", slug: "storia_g_2", image: require("../../assets/illustrations/racconti/scena_g_2.png") },
      { testo: "Prima di dormire si nasconde in un morbido gomitolo di lana.", parola: "gomitolo", slug: "storia_g_3", image: require("../../assets/illustrations/racconti/scena_g_3.png") },
    ],
  },
  gi: {
    title: "Gio la giraffa",
    scenes: [
      { testo: "Gio la giraffa vive nella savana.", parola: "giraffa", slug: "storia_gi_0", image: require("../../assets/illustrations/racconti/scena_gi_0.png") },
      { testo: "Ama guardare il girasole che segue il sole.", parola: "girasole", slug: "storia_gi_1", image: require("../../assets/illustrations/racconti/scena_gi_1.png") },
      { testo: "Un giorno incontra un gigante gentile.", parola: "gigante", slug: "storia_gi_2", image: require("../../assets/illustrations/racconti/scena_gi_2.png") },
      { testo: "Insieme mangiano un gelato fresco all'ombra.", parola: "gelato", slug: "storia_gi_3", image: require("../../assets/illustrations/racconti/scena_gi_3.png") },
    ],
  },
  gli: {
    title: "Coni il coniglietto",
    scenes: [
      { testo: "Coni il coniglietto vive con tutta la sua famiglia.", parola: "famiglia", slug: "storia_gli_0", image: require("../../assets/illustrations/racconti/scena_gli_0.png") },
      { testo: "Ogni notte dorme su un letto di morbida paglia.", parola: "paglia", slug: "storia_gli_1", image: require("../../assets/illustrations/racconti/scena_gli_1.png") },
      { testo: "Un giorno trova una bottiglia colorata nel prato.", parola: "bottiglia", slug: "storia_gli_2", image: require("../../assets/illustrations/racconti/scena_gli_2.png") },
      { testo: "La sera indossa la sua maglia preferita e va a dormire.", parola: "maglia", slug: "storia_gli_3", image: require("../../assets/illustrations/racconti/scena_gli_3.png") },
    ],
  },
  gn: {
    title: "Gino lo gnomo",
    scenes: [
      { testo: "Gino lo gnomo vive in una casetta di legno sulla montagna.", parola: "gnomo", slug: "storia_gn_0", image: require("../../assets/illustrations/racconti/scena_gn_0.png") },
      { testo: "Ogni giorno saluta il ragno che vive vicino alla porta.", parola: "ragno", slug: "storia_gn_1", image: require("../../assets/illustrations/racconti/scena_gn_1.png") },
      { testo: "Un pomeriggio disegna un bel sogno colorato.", parola: "sogno", slug: "storia_gn_2", image: require("../../assets/illustrations/racconti/scena_gn_2.png") },
      { testo: "Alla sera fa il bagno e va a dormire felice.", parola: "bagno", slug: "storia_gn_3", image: require("../../assets/illustrations/racconti/scena_gn_3.png") },
    ],
  },
  mnl_cons: {
    title: "Elmo l'elefantino",
    scenes: [
      { testo: "Elmo l'elefantino gioca felice nel campo verde.", parola: "campo", slug: "storia_mnl_cons_0", image: require("../../assets/illustrations/racconti/scena_mnl_cons_0.png") },
      { testo: "Un giorno attraversa un vecchio ponte di legno.", parola: "ponte", slug: "storia_mnl_cons_1", image: require("../../assets/illustrations/racconti/scena_mnl_cons_1.png") },
      { testo: "Sente soffiare un forte vento tra gli alberi.", parola: "vento", slug: "storia_mnl_cons_2", image: require("../../assets/illustrations/racconti/scena_mnl_cons_2.png") },
      { testo: "Alla sera torna a casa, il tempo di dormire è arrivato.", parola: "tempo", slug: "storia_mnl_cons_3", image: require("../../assets/illustrations/racconti/scena_mnl_cons_3.png") },
    ],
  },
  r: {
    title: "Rocco il robot",
    scenes: [
      { testo: "Rocco il robot vive in una fabbrica di giocattoli.", parola: "robot", slug: "storia_r_0", image: require("../../assets/illustrations/racconti/scena_r_0.png") },
      { testo: "Un giorno trova una rana che salta nel cortile.", parola: "rana", slug: "storia_r_1", image: require("../../assets/illustrations/racconti/scena_r_1.png") },
      { testo: "Insieme guardano un razzo volare nel cielo stellato.", parola: "razzo", slug: "storia_r_2", image: require("../../assets/illustrations/racconti/scena_r_2.png") },
      { testo: "Rocco regala alla rana una rosa rossa come ricordo.", parola: "rosa", slug: "storia_r_3", image: require("../../assets/illustrations/racconti/scena_r_3.png") },
    ],
  },
  cons_r: {
    title: "Dracorosso il draghetto",
    scenes: [
      { testo: "Dracorosso il draghetto vive vicino a un grande prato.", parola: "prato", slug: "storia_cons_r_0", image: require("../../assets/illustrations/racconti/scena_cons_r_0.png") },
      { testo: "Ogni giorno guarda passare il treno in lontananza.", parola: "treno", slug: "storia_cons_r_1", image: require("../../assets/illustrations/racconti/scena_cons_r_1.png") },
      { testo: "Ascolta cantare un grillo nascosto tra l'erba.", parola: "grillo", slug: "storia_cons_r_2", image: require("../../assets/illustrations/racconti/scena_cons_r_2.png") },
      { testo: "Alla sera vola sopra il castello della principessa.", parola: "principessa", slug: "storia_cons_r_3", image: require("../../assets/illustrations/racconti/scena_cons_r_3.png") },
    ],
  },
  r_cons: {
    title: "Tosca la tartaruga",
    scenes: [
      { testo: "Tosca la tartaruga cammina piano sul prato verde.", parola: "verde", slug: "storia_r_cons_0", image: require("../../assets/illustrations/racconti/scena_r_cons_0.png") },
      { testo: "Un giorno bussa alla porta di un vecchio orso gentile.", parola: "porta", slug: "storia_r_cons_1", image: require("../../assets/illustrations/racconti/scena_r_cons_1.png") },
      { testo: "L'orso le regala una sorpresa avvolta con un fiocco.", parola: "sorpresa", slug: "storia_r_cons_2", image: require("../../assets/illustrations/racconti/scena_r_cons_2.png") },
      { testo: "Tosca ripone la sorpresa in una scatola di cartone.", parola: "cartone", slug: "storia_r_cons_3", image: require("../../assets/illustrations/racconti/scena_r_cons_3.png") },
    ],
  },
  s_cons: {
    title: "Stella la streghetta",
    scenes: [
      { testo: "Stella la streghetta vive in un castello sulla collina.", parola: "castello", slug: "storia_s_cons_0", image: require("../../assets/illustrations/racconti/scena_s_cons_0.png") },
      { testo: "Il suo amico scoiattolo la aiuta a preparare pozioni.", parola: "scoiattolo", slug: "storia_s_cons_1", image: require("../../assets/illustrations/racconti/scena_s_cons_1.png") },
      { testo: "Ogni notte guarda le stelle dalla finestra.", parola: "stella", slug: "storia_s_cons_2", image: require("../../assets/illustrations/racconti/scena_s_cons_2.png") },
      { testo: "Prima di dormire mette le sue scarpe vicino al letto.", parola: "scarpa", slug: "storia_s_cons_3", image: require("../../assets/illustrations/racconti/scena_s_cons_3.png") },
    ],
  },
  sci_sce: {
    title: "Sci la scimmietta",
    scenes: [
      { testo: "Sci la scimmietta salta felice tra i rami degli alberi.", parola: "scimmia", slug: "storia_sci_sce_0", image: require("../../assets/illustrations/racconti/scena_sci_sce_0.png") },
      { testo: "Un giorno scende veloce da un grande scivolo colorato.", parola: "scivolo", slug: "storia_sci_sce_1", image: require("../../assets/illustrations/racconti/scena_sci_sce_1.png") },
      { testo: "Nel fiume vede nuotare un piccolo pesce argentato.", parola: "pesce", slug: "storia_sci_sce_2", image: require("../../assets/illustrations/racconti/scena_sci_sce_2.png") },
      { testo: "Quando fa freddo si copre con una sciarpa calda.", parola: "sciarpa", slug: "storia_sci_sce_3", image: require("../../assets/illustrations/racconti/scena_sci_sce_3.png") },
    ],
  },
  v: {
    title: "Vale la volpe",
    scenes: [
      { testo: "Vale la volpe vive vicino a un vulcano addormentato.", parola: "vulcano", slug: "storia_v_0", image: require("../../assets/illustrations/racconti/scena_v_0.png") },
      { testo: "Un giorno trova un violino abbandonato nel bosco.", parola: "violino", slug: "storia_v_1", image: require("../../assets/illustrations/racconti/scena_v_1.png") },
      { testo: "Prova a suonarlo mentre una vespa le ronza intorno.", parola: "vespa", slug: "storia_v_2", image: require("../../assets/illustrations/racconti/scena_v_2.png") },
      { testo: "Alla fine naviga sul mare con una barca a vela.", parola: "vela", slug: "storia_v_3", image: require("../../assets/illustrations/racconti/scena_v_3.png") },
    ],
  },
  z_dz: {
    title: "Zeno lo zebrino",
    scenes: [
      { testo: "Zeno lo zebrino vive nella savana con la sua mamma zebra.", parola: "zebra", slug: "storia_z_dz_0", image: require("../../assets/illustrations/racconti/scena_z_dz_0.png") },
      { testo: "Ogni mattina prepara lo zaino per andare a scuola.", parola: "zaino", slug: "storia_z_dz_1", image: require("../../assets/illustrations/racconti/scena_z_dz_1.png") },
      { testo: "Nel pomeriggio gioca vicino a una zolla di terra morbida.", parola: "zolla", slug: "storia_z_dz_2", image: require("../../assets/illustrations/racconti/scena_z_dz_2.png") },
      { testo: "La sera scaccia una fastidiosa zanzara prima di dormire.", parola: "zanzara", slug: "storia_z_dz_3", image: require("../../assets/illustrations/racconti/scena_z_dz_3.png") },
    ],
  },
  zeta: {
    title: "Zaza la zebra allo zoo",
    scenes: [
      { testo: "Zaza la zebra vive felice allo zoo.", parola: "zoo", slug: "storia_zeta_0", image: require("../../assets/illustrations/racconti/scena_zeta_0.png") },
      { testo: "Ogni giorno saluta lo zio guardiano gentile.", parola: "zio", slug: "storia_zeta_1", image: require("../../assets/illustrations/racconti/scena_zeta_1.png") },
      { testo: "In autunno decora il recinto con una grande zucca.", parola: "zucca", slug: "storia_zeta_2", image: require("../../assets/illustrations/racconti/scena_zeta_2.png") },
      { testo: "D'estate galleggia su una zattera nel laghetto dello zoo.", parola: "zattera", slug: "storia_zeta_3", image: require("../../assets/illustrations/racconti/scena_zeta_3.png") },
    ],
  },
  z_ts: {
    title: "Zizzi il topolino goloso",
    scenes: [
      { testo: "Zizzi il topolino adora lo zucchero dolce.", parola: "zucchero", slug: "storia_z_ts_0", image: require("../../assets/illustrations/racconti/scena_z_ts_0.png") },
      { testo: "Un giorno trova una grande zucca nell'orto.", parola: "zucca", slug: "storia_z_ts_1", image: require("../../assets/illustrations/racconti/scena_z_ts_1.png") },
      { testo: "Si nasconde zitto zitto per non farsi scoprire.", parola: "zitto", slug: "storia_z_ts_2", image: require("../../assets/illustrations/racconti/scena_z_ts_2.png") },
      { testo: "Alla fine scappa veloce sulle sue piccole zampe.", parola: "zampa", slug: "storia_z_ts_3", image: require("../../assets/illustrations/racconti/scena_z_ts_3.png") },
    ],
  },
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
