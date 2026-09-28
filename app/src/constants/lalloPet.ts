// Tamagotchi di Lallo: la sazietà è sempre calcolata al volo dal tempo trascorso
// dall'ultimo pasto (lastFedAt), mai un numero salvato che va "aggiornato a orologio" —
// niente timer né job in background, basta ricalcolare quando l'app è aperta.
const FULL_HUNGER_HOURS = 24; // tempo perché la sazietà scenda da pieno a "affamato"

export function getHunger(lastFedAt: string | null): number {
  if (!lastFedAt) return 70; // valore di partenza per chi non ha ancora dato da mangiare
  const hoursSince = (Date.now() - new Date(lastFedAt).getTime()) / (1000 * 60 * 60);
  return Math.max(0, Math.min(100, Math.round(100 - (hoursSince / FULL_HUNGER_HOURS) * 100)));
}

export type LalloMood = "felice" | "neutro" | "affamato";

export function getMood(hunger: number): LalloMood {
  if (hunger >= 66) return "felice";
  if (hunger >= 33) return "neutro";
  return "affamato";
}

export const LALLO_MOOD_COPY: Record<LalloMood, { title: string; sub: string }> = {
  felice: { title: "Lallo è felice!", sub: "È sazio e vuole giocare con te." },
  neutro: { title: "Lallo sta bene", sub: "Tra un po' avrà di nuovo fame." },
  affamato: { title: "Lallo ha fame!", sub: "Dagli qualcosa da mangiare." },
};

// Cibi disponibili: parole del word bank che hanno già un'illustrazione reale generata —
// niente nuove immagini per questo, riusa quelle già fatte per gli esercizi.
// Solo frutta, verdura e cereali — niente carne né pesce: Lallo è un pappagallo, non un
// onnivoro (salame e sugo tolti dopo il feedback: biologicamente sbagliati per l'animale).
// Ridotti da 7 a 4 (feedback settembre 2026): i comandi ora stanno in una colonna stretta
// a fianco di Lallo, non in una griglia sotto — "riso" resta perché la ciotola di riso è
// visivamente il cibo più simile a una ciotola di semi, il pasto "vero" di un pappagallo.
export const LALLO_FOODS = ["riso", "banana", "carota", "pisello"];

// Il cibo preferito di Lallo: dargli questo invece degli altri fa scattare la reazione di
// festa (trigCelebrate) invece della reazione normale di pasto (trigFeed) — stesso trigger
// già usato per festeggiare uno sblocco di livello (vedi LalloScreen), qui riusato per
// rendere il feeding un po' più sorprendente senza inventare un nuovo stato nel rig.
export const LALLO_CELEBRATE_FOODS = ["riso"];
