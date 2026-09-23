#!/usr/bin/env node
// Rigenera src/constants/illustrations.ts a partire dai file presenti in
// assets/illustrations/parole/. Metro (React Native/Expo) richiede require()
// con percorsi statici e letterali: non si può leggere la cartella a runtime,
// quindi questa mappa va rigenerata ogni volta che si aggiungono nuove
// immagini. Uso: node scripts/generate-illustrations-index.js
const fs = require("fs");
const path = require("path");

const ASSETS_DIR = path.join(__dirname, "..", "assets", "illustrations", "parole");
const OUT_FILE = path.join(__dirname, "..", "src", "constants", "illustrations.ts");

const files = fs
  .readdirSync(ASSETS_DIR)
  .filter((f) => f.endsWith(".png"))
  .sort();

const entries = files
  .map((f) => {
    const slug = f.slice(0, -4);
    return `  "${slug}": require("../../assets/illustrations/parole/${f}"),`;
  })
  .join("\n");

const out = `// GENERATO AUTOMATICAMENTE da scripts/generate-illustrations-index.js — non modificare a mano.
// Rilancia lo script ogni volta che aggiungi immagini in assets/illustrations/parole/.
import { ImageSourcePropType } from "react-native";

export const WORD_ILLUSTRATIONS: Record<string, ImageSourcePropType> = {
${entries}
};
`;

fs.writeFileSync(OUT_FILE, out, "utf-8");
console.log(`Scritte ${files.length} illustrazioni in ${path.relative(process.cwd(), OUT_FILE)}`);
