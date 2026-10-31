import { useCallback, useState } from "react";
import { LayoutChangeEvent } from "react-native";

// A differenza di useResponsiveColumns (che calcola la larghezza carta solo dalla larghezza
// finestra), questo hook misura lo spazio REALE del contenitore via onLayout — larghezza E
// altezza — e sceglie insieme colonne + dimensione carta per riempire quello spazio senza
// lasciarne la maggior parte vuota (bug segnalato: su iPad le carte di un gioco (es. Memory)
// restavano piccole in alto, tutto il resto della finestra restava vuoto, perché prima si
// guardava solo quanto entrava in larghezza, mai quanto spazio c'era in verticale).
// Il pavimento (minCardWidth) evita carte illeggibili su schermi piccoli; il soffitto
// (maxCardWidth) evita carte assurde quando restano pochissimi elementi (es. le ultime 2
// carte di un Memory quasi finito).
export function useFillGrid({
  itemCount,
  gap,
  minCardWidth,
  maxCardWidth,
  aspectRatio = 1,
  columnsFromWidthOnly = false,
}: {
  itemCount: number;
  gap: number;
  minCardWidth: number;
  maxCardWidth: number;
  aspectRatio?: number; // larghezza / altezza della carta
  // Quando true, il numero di colonne dipende SOLO dalla larghezza disponibile, mai da
  // quanti elementi ci sono in gioco — serve per i giochi dove il numero di carte cresce con
  // la difficoltà (es. Memory, 6→12→18 carte) e le colonne devono restare le stesse a parità
  // di schermo, altrimenti più carte = più colonne = carte più piccole proprio quando
  // servirebbero più grandi. La dimensione della carta resta comunque libera di crescere in
  // altezza per riempire lo spazio verticale disponibile.
  columnsFromWidthOnly?: boolean;
}) {
  const [box, setBox] = useState<{ width: number; height: number } | null>(null);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setBox((prev) => (prev && prev.width === width && prev.height === height ? prev : { width, height }));
  }, []);

  if (!box || !itemCount || box.width <= 0 || box.height <= 0) {
    return { cardWidth: minCardWidth, cardHeight: minCardWidth / aspectRatio, columns: 1, onLayout };
  }

  function sizeForColumns(cols: number) {
    const rows = Math.ceil(itemCount / cols);
    const widthPerCard = (box!.width - gap * (cols - 1)) / cols;
    const heightPerCard = (box!.height - gap * (rows - 1)) / rows;
    return Math.min(widthPerCard, heightPerCard * aspectRatio);
  }

  let bestCols: number;
  let bestWidth: number;
  if (columnsFromWidthOnly) {
    bestCols = Math.max(1, Math.min(itemCount, Math.floor((box.width + gap) / (minCardWidth + gap))));
    bestWidth = sizeForColumns(bestCols);
  } else {
    // Prova ogni possibile numero di colonne: per ognuno, calcola quanto grande potrebbe
    // essere una carta sia in larghezza (spazio diviso per le colonne) sia in altezza (spazio
    // diviso per le righe che ne risulterebbero) — la carta è vincolata dal più piccolo dei
    // due. Tiene il numero di colonne che permette la carta più grande.
    bestCols = 1;
    bestWidth = 0;
    for (let cols = 1; cols <= itemCount; cols++) {
      const candidate = sizeForColumns(cols);
      if (candidate > bestWidth) {
        bestWidth = candidate;
        bestCols = cols;
      }
    }
  }

  const cardWidth = Math.min(Math.max(bestWidth, minCardWidth), maxCardWidth);
  return { cardWidth, cardHeight: cardWidth / aspectRatio, columns: bestCols, onLayout };
}
