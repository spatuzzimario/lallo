#!/usr/bin/env node
// Rigenera src/constants/wordAudio.ts a partire dai file presenti in
// assets/audio/parole/. Metro (React Native/Expo) richiede require() con percorsi
// statici e letterali: non si può leggere la cartella a runtime, quindi questa
// mappa va rigenerata ogni volta che si aggiungono nuovi audio parola.
// Uso: node scripts/generate-word-audio-index.js
const fs = require("fs");
const path = require("path");

const ASSETS_DIR = path.join(__dirname, "..", "assets", "audio", "parole");
const OUT_FILE = path.join(__dirname, "..", "src", "constants", "wordAudioAssets.ts");

const files = fs
  .readdirSync(ASSETS_DIR)
  .filter((f) => f.endsWith(".mp3"))
  .sort();

const entries = files
  .map((f) => {
    const slug = f.slice(0, -4);
    return `  "${slug}": require("../../assets/audio/parole/${f}"),`;
  })
  .join("\n");

const out = `// GENERATO AUTOMATICAMENTE da scripts/generate-word-audio-index.js — non modificare a mano.
// Rilancia lo script ogni volta che aggiungi audio in assets/audio/parole/.
export const WORD_AUDIO: Record<string, number> = {
${entries}
};
`;

fs.writeFileSync(OUT_FILE, out, "utf-8");
console.log(`Scritti ${files.length} audio parola in ${path.relative(process.cwd(), OUT_FILE)}`);
