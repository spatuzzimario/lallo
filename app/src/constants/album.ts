// Album fotografico delle parole: il bambino fotografa nel mondo reale gli oggetti che
// corrispondono alle parole del word bank. Sceglie lui la parola PRIMA di scattare — l'app
// non riconosce le immagini (nessun AI vision validata per bambini, stesso principio del
// niente-ASR automatico, vedi CLAUDE.md §10).

export interface AlbumTitle {
  threshold: number;
  // Scelto apposta invariante per genere grammaticale (vedi constants/reinforcement.ts) —
  // niente "Esploratore"/"Esploratrice" da scegliere in base al bambino, lo stesso nome vale
  // per tutti. Solo il saluto che lo introduce ("Bravo!"/"Brava!"/"Evviva!") cambia.
  name: string;
  emoji: string;
  // vedi app/assets/audio/lines/titolo_*_m.mp3 / _f.mp3 e src/constants/lineAudio.ts — la
  // frase intera (saluto + nome titolo) è pre-registrata, non solo il nome.
  audioSlugBase: string;
}

// Soglie sul numero di parole DIVERSE fotografate almeno una volta (non sul totale scatti:
// fotografare 10 volte la stessa banana non deve valere quanto 10 parole diverse).
export const ALBUM_TITLES: AlbumTitle[] = [
  { threshold: 5, name: "Mente curiosa", emoji: "🔎", audioSlugBase: "titolo_esploratore" },
  { threshold: 15, name: "Detective delle parole", emoji: "🏅", audioSlugBase: "titolo_cercatore_oro" },
  { threshold: 30, name: "Asso dell'esplorazione", emoji: "🗺️", audioSlugBase: "titolo_grande_esploratore" },
  { threshold: 60, name: "Fenomeno delle parole", emoji: "👑", audioSlugBase: "titolo_maestro_parole" },
];

export function currentTitle(distinctWordsCaught: number): AlbumTitle | null {
  let current: AlbumTitle | null = null;
  for (const t of ALBUM_TITLES) {
    if (distinctWordsCaught >= t.threshold) current = t;
  }
  return current;
}

export function nextTitle(distinctWordsCaught: number): AlbumTitle | null {
  return ALBUM_TITLES.find((t) => distinctWordsCaught < t.threshold) ?? null;
}
