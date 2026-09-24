import { ImageSourcePropType } from "react-native";
import { WORD_ILLUSTRATIONS } from "./illustrations";
import { slugify } from "../utils/slugify";

// Copertura parziale (le illustrazioni vengono generate progressivamente, vedi
// CLAUDE.md §2.6 "ogni parola ha un'immagine" — finché non sono tutte pronte,
// i chiamanti devono sempre prevedere il fallback all'emoji esistente.
export function getWordImage(parola: string): ImageSourcePropType | null {
  return WORD_ILLUSTRATIONS[slugify(parola)] ?? null;
}
