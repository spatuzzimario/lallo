import { useAudioPlayer } from "expo-audio";
import * as Speech from "expo-speech";
import { getLineAudio } from "../constants/lineAudio";
import { getWordAudio } from "../constants/wordAudio";

// Sostituisce il vecchio helper say()/Speech.speak() diretto: usa la voce vera (Linda
// Fiore/eleven_v3, vedi docs/VOCE_LALLO.md) quando esiste un audio pre-registrato per il
// testo, altrimenti torna al TTS di sistema — mai un'app muta se manca una registrazione.
// Va chiamato dentro un componente React (usa un hook al suo interno), come già si fa per
// useFeedbackSounds(): ogni schermata/esercizio che parla chiama useVoice() una volta.
export function useVoice() {
  const player = useAudioPlayer(null);

  function playSource(source: number) {
    Speech.stop();
    player.replace(source);
    player.seekTo(0);
    player.play();
  }

  // Riga fissa/istruzione: passa lo slug esatto della registrazione (vedi lineAudio.ts) se
  // esiste; altrimenti lascia lineSlug undefined e resta sul TTS con fallbackText.
  function speak(fallbackText: string, lineSlug?: string) {
    const source = lineSlug ? getLineAudio(lineSlug) : null;
    if (source != null) {
      playSource(source);
    } else {
      Speech.stop();
      Speech.speak(fallbackText, { language: "it-IT", pitch: 1.05, rate: 0.92 });
    }
  }

  // Pronuncia di una singola parola del word bank.
  function speakWord(parola: string) {
    const source = getWordAudio(parola);
    if (source != null) {
      playSource(source);
    } else {
      Speech.stop();
      Speech.speak(parola, { language: "it-IT", pitch: 1.05, rate: 0.92 });
    }
  }

  return { speak, speakWord };
}
