// Stessa logica usata per generare i nomi dei file in assets/illustrations/parole/ e
// assets/audio/parole/ (vedi scratchpad Higgsfield/ElevenLabs): normalizza gli accenti,
// minuscolo, sostituisce tutto ciò che non è a-z0-9 con "_". Condivisa da wordImage.ts e
// wordAudio.ts perché le due mappe devono restare in sync sulla stessa convenzione.
export function slugify(parola: string): string {
  const stripped = parola.normalize("NFKD").replace(/[̀-ͯ]/g, "");
  return stripped
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}
