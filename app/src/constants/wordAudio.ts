import { WORD_AUDIO } from "./wordAudioAssets";
import { slugify } from "../utils/slugify";

// Copertura: tutte le parole del word bank (iniziale + mediana, tutti i 25 fonemi) hanno un
// audio pre-registrato con voce Linda Fiore/eleven_v3 (vedi docs/VOCE_LALLO.md). I chiamanti
// devono comunque prevedere il fallback al TTS di sistema (expo-speech) per qualunque parola
// fuori da questa copertura (es. testo libero non presente nel word bank).
export function getWordAudio(parola: string): number | null {
  return WORD_AUDIO[slugify(parola)] ?? null;
}
