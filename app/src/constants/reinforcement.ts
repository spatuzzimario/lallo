// Messaggi di rinforzo/incoraggiamento rivolti al bambino, centralizzati qui invece che
// sparsi per schermata — unico punto dove aggiungere una nuova riga quando serve, invece di
// if(maschio/femmina) ripetuti ovunque. Vedi CLAUDE.md: tutto in italiano, l'italiano
// declina per genere grammaticale ("Bravo"/"Brava"), quindi ogni riga ha tre forme:
// maschile, femminile e una neutra REALE (non la forma maschile riciclata) per quando il
// genere del bambino manca o non è specificato in onboarding — mai assumere un genere di
// default.
import { ChildProfile } from "../types/gamification";

export type ReinforcementKey = "registratore_bravo" | "oca_lallo_sentito" | "album_foto_aggiunta";

interface ReinforcementLine {
  maschile: string;
  femminile: string;
  neutro: string;
  // Se presente, cerca "<audioSlugBase>_m" / "<audioSlugBase>_f" nelle righe audio
  // pre-registrate (vedi assets/audio/lines/, lineAudio.ts). Il caso neutro non ha mai un
  // audio pre-registrato dedicato: usa sempre il fallback TTS di useVoice().speak(), che
  // legge comunque la forma testuale corretta — stesso pattern "copertura parziale, mai
  // un'app muta" già usato per le altre righe.
  audioSlugBase?: string;
}

const REINFORCEMENT: Record<ReinforcementKey, ReinforcementLine> = {
  registratore_bravo: {
    maschile: "Bravo! 🎉",
    femminile: "Brava! 🎉",
    neutro: "Evviva! 🎉",
  },
  oca_lallo_sentito: {
    maschile: "Lallo ti ha sentito! Bravissimo!",
    femminile: "Lallo ti ha sentito! Bravissima!",
    neutro: "Lallo ti ha sentito! Che forza!",
    audioSlugBase: "sess_lallo_ti_ha_sentito",
  },
  album_foto_aggiunta: {
    maschile: "Foto aggiunta al tuo album, bravo!",
    femminile: "Foto aggiunta al tuo album, brava!",
    neutro: "Foto aggiunta al tuo album, evviva!",
    audioSlugBase: "album_foto_aggiunta",
  },
};

type GenderForm = "maschile" | "femminile" | "neutro";

// "preferisco_non_dire" e l'assenza del dato (profilo non ancora completato, o onboarding
// più vecchio di questa feature) finiscono entrambi sul neutro — mai un default silenzioso
// su un genere.
function resolveGenderForm(gender: ChildProfile["gender"]): GenderForm {
  if (gender === "maschio") return "maschile";
  if (gender === "femmina") return "femminile";
  return "neutro";
}

function audioSuffix(form: GenderForm): "m" | "f" | null {
  if (form === "maschile") return "m";
  if (form === "femminile") return "f";
  return null;
}

export function getReinforcement(
  key: ReinforcementKey,
  gender: ChildProfile["gender"]
): { text: string; audioSlug: string | null } {
  const entry = REINFORCEMENT[key];
  const form = resolveGenderForm(gender);
  const suffix = audioSuffix(form);
  return {
    text: entry[form],
    audioSlug: entry.audioSlugBase && suffix ? `${entry.audioSlugBase}_${suffix}` : null,
  };
}

// Caso a parte: i titoli Album (vedi constants/album.ts) hanno un nome scelto apposta
// invariante per genere ("Mente curiosa", non "Esploratore/Esploratrice") — qui serve
// gendered solo il saluto che lo introduce ("Bravo!"/"Brava!"/"Evviva!"), il nome del titolo
// si incolla identico in tutti e tre i casi. audioSlugBase è diverso per ogni titolo (la
// frase intera, saluto incluso, è pre-registrata come un'unica riga), quindi resta un
// parametro invece di stare nella tabella sopra.
export function getNewTitleReinforcement(
  titleName: string,
  audioSlugBase: string,
  gender: ChildProfile["gender"]
): { text: string; audioSlug: string | null } {
  const greeting: Record<GenderForm, string> = { maschile: "Bravo!", femminile: "Brava!", neutro: "Evviva!" };
  const form = resolveGenderForm(gender);
  const suffix = audioSuffix(form);
  return {
    text: `${greeting[form]} Hai un nuovo titolo: ${titleName}!`,
    audioSlug: suffix ? `${audioSlugBase}_${suffix}` : null,
  };
}
