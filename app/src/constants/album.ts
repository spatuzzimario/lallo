// Album fotografico delle parole: il bambino fotografa nel mondo reale gli oggetti che
// corrispondono alle parole del word bank. Sceglie lui la parola PRIMA di scattare — l'app
// non riconosce le immagini (nessun AI vision validata per bambini, stesso principio del
// niente-ASR automatico, vedi CLAUDE.md §10).

export interface AlbumTitle {
  threshold: number;
  name: string;
  emoji: string;
}

// Soglie sul numero di parole DIVERSE fotografate almeno una volta (non sul totale scatti:
// fotografare 10 volte la stessa banana non deve valere quanto 10 parole diverse).
export const ALBUM_TITLES: AlbumTitle[] = [
  { threshold: 5, name: "Esploratore", emoji: "🔎" },
  { threshold: 15, name: "Cercatore d'oro", emoji: "🏅" },
  { threshold: 30, name: "Grande esploratore", emoji: "🗺️" },
  { threshold: 60, name: "Maestro delle parole", emoji: "👑" },
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
