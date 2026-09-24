import { LINE_AUDIO } from "./lineAudioAssets";

// Righe fisse/template (istruzioni di gioco, personalità di Lallo, congratulazioni) — lo
// slug è scelto a mano da chi genera l'audio (vedi docs/VOCE_LALLO.md per la convenzione:
// tpl_<gioco>_<fonema>, sess_<azione>, lallo_<azione>, album_<azione>, titolo_<traguardo>),
// non derivato dal testo. Copertura parziale per costruzione: nuove righe di UI vanno
// generate esplicitamente, quindi i chiamanti prevedono sempre il fallback al TTS.
export function getLineAudio(slug: string): number | null {
  return LINE_AUDIO[slug] ?? null;
}
