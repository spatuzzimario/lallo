import { ImageSourcePropType } from "react-native";
import { WORD_ILLUSTRATIONS } from "./illustrations";

// Stessa logica di slugify usata per generare i nomi dei file in
// assets/illustrations/parole/ (vedi scratchpad Higgsfield): normalizza gli
// accenti, minuscolo, sostituisce tutto ciò che non è a-z0-9 con "_".
function slugify(parola: string): string {
  const stripped = parola
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "");
  return stripped
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

// Copertura parziale (le illustrazioni vengono generate progressivamente, vedi
// CLAUDE.md §2.6 "ogni parola ha un'immagine" — finché non sono tutte pronte,
// i chiamanti devono sempre prevedere il fallback all'emoji esistente.
export function getWordImage(parola: string): ImageSourcePropType | null {
  return WORD_ILLUSTRATIONS[slugify(parola)] ?? null;
}
