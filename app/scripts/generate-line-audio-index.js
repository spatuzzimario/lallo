#!/usr/bin/env node
// Rigenera src/constants/lineAudio.ts a partire dai file presenti in
// assets/audio/lines/. Stesso motivo del generate-word-audio-index.js: require()
// vuole percorsi statici e letterali. Qui la chiave è il nome del file (lo slug
// scelto a mano quando si genera la riga, es. "tpl_caccia_r", "sess_livello2_diretto"),
// non una parola slugificata — i chiamanti passano lo slug esplicitamente.
// Uso: node scripts/generate-line-audio-index.js
const fs = require("fs");
const path = require("path");

const ASSETS_DIR = path.join(__dirname, "..", "assets", "audio", "lines");
const OUT_FILE = path.join(__dirname, "..", "src", "constants", "lineAudioAssets.ts");

const files = fs
  .readdirSync(ASSETS_DIR)
  .filter((f) => f.endsWith(".mp3"))
  .sort();

const entries = files
  .map((f) => {
    const slug = f.slice(0, -4);
    return `  "${slug}": require("../../assets/audio/lines/${f}"),`;
  })
  .join("\n");

const out = `// GENERATO AUTOMATICAMENTE da scripts/generate-line-audio-index.js — non modificare a mano.
// Rilancia lo script ogni volta che aggiungi audio in assets/audio/lines/.
export const LINE_AUDIO: Record<string, number> = {
${entries}
};
`;

fs.writeFileSync(OUT_FILE, out, "utf-8");
console.log(`Scritte ${files.length} righe audio in ${path.relative(process.cwd(), OUT_FILE)}`);
