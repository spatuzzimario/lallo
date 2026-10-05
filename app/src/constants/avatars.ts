// Avatar scelti in onboarding (AvatarPickerScreen) per il profilo bambino. Riusano
// illustrazioni già esistenti nel word bank (assets/illustrations/parole/) invece di
// generarne di nuove: niente dato sensibile da gestire (non è una foto del bambino), e
// nessun asset in più da produrre/validare. Scelti a mano tra le ~930 parole illustrate
// verificando che l'immagine mostri davvero un personaggio con un volto (molte parole del
// word bank illustrano un oggetto, non un personaggio — es. "pirata" è un cappello da
// pirata, non una persona), e cercando un mix che vada bene sia per un bambino sia per una
// bambina, nessuno legato a un genere in particolare.
import { ImageSourcePropType } from "react-native";
import { getWordImage } from "./wordImage";

export interface AvatarOption {
  id: string; // = parola nel word bank, usata anche per risolvere l'immagine altrove
  label: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: "pappagallo", label: "Pappagallo" }, // Lallo stesso: l'opzione neutra/di default
  { id: "principessa", label: "Principessa" },
  { id: "principe", label: "Principe" },
  { id: "fata", label: "Fata" },
  { id: "mago", label: "Mago" },
  { id: "strega", label: "Strega" },
  { id: "pompiere", label: "Pompiere" },
  { id: "scienziato", label: "Scienziato" },
  { id: "veterinario", label: "Veterinario" },
  { id: "ballerina", label: "Ballerina" },
];

export const DEFAULT_AVATAR_ID = "pappagallo";

// pappagallo.png è una delle illustrazioni verificate del word bank (vedi nota in alto):
// l'asserzione non-null è sicura finché DEFAULT_AVATAR_ID resta "pappagallo".
export function getAvatarImage(avatarId: string | undefined): ImageSourcePropType {
  return (getWordImage(avatarId || DEFAULT_AVATAR_ID) ?? getWordImage(DEFAULT_AVATAR_ID)) as ImageSourcePropType;
}
