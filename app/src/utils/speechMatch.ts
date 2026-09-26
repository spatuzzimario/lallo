// Confronto permissivo tra trascrizione riconosciuta e parola target per il Gioco dell'oca
// (brief blocco B): NON è una valutazione clinica della pronuncia — quella è inaffidabile sui
// bambini 3-6 con difficoltà (vedi brief) — serve solo a distinguere "il bambino ha provato a
// dire qualcosa di simile" da "non ha detto niente/tutt'altro". Soglia deliberatamente
// generosa: meglio un falso positivo (avanza anche se non perfetto) che un falso negativo
// (blocca un bambino che ha detto bene ma il riconoscitore ha capito male, cosa comune sulle
// singole parole — limite noto della libreria di riconoscimento, non solo dell'italiano).

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // toglie gli accenti per il confronto
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const prev = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    let prevDiag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = prev[j];
      prev[j] = a[i - 1] === b[j - 1] ? prevDiag : 1 + Math.min(prev[j], prev[j - 1], prevDiag);
      prevDiag = temp;
    }
  }
  return prev[n];
}

export function isReasonableAttempt(transcript: string, target: string): boolean {
  const t = normalize(transcript);
  const w = normalize(target);
  if (!t || !w) return false;
  if (t === w || t.includes(w) || w.includes(t)) return true;
  const maxDist = Math.max(2, Math.ceil(w.length * 0.4));
  return levenshtein(t, w) <= maxDist;
}
