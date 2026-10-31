import { useWindowDimensions } from "react-native";

// Calcola quante colonne stanno nella larghezza disponibile ORA (reagisce da sola a
// ridimensionamento della finestra o rotazione di un iPad, perché useWindowDimensions è
// reattivo) invece di una percentuale fissa pensata per un telefono — che su un desktop largo
// produce 2-3 card enormi invece di riempire lo spazio con più colonne, e su una finestra
// stretta rischia di far traboccare il contenuto. minCardWidth è il pavimento (sotto non si
// scende, meglio una colonna in meno che card illeggibili); maxCardWidth è il soffitto (sopra
// non si sale, per non avere comunque card enormi su schermi larghissimi) — tra i due, la
// larghezza reale si ripartisce lo spazio disponibile tra le colonne scelte.
export function useResponsiveColumns({
  minCardWidth,
  maxCardWidth,
  gap,
  horizontalPadding = 0,
  containerWidth,
}: {
  minCardWidth: number;
  maxCardWidth: number;
  gap: number;
  horizontalPadding?: number;
  containerWidth?: number;
}) {
  const { width: windowWidth } = useWindowDimensions();
  const available = Math.max(0, (containerWidth ?? windowWidth) - horizontalPadding * 2);

  const columns = Math.max(1, Math.floor((available + gap) / (minCardWidth + gap)));
  const rawCardWidth = (available - gap * (columns - 1)) / columns;
  const cardWidth = Math.min(rawCardWidth, maxCardWidth);

  return { columns, cardWidth };
}
