import React, { useState } from "react";
import { ParentDashboardScreen } from "./ParentScreens";
import { AdultMathGate } from "../components/AdultMathGate";

// Settembre 2026 (feedback): prima "Genitori" era un'iconetta a parte in cima a Giochi, che
// apriva un gate a modale e poi la dashboard come schermata separata ("ParentDashboard").
// Ora è tutto qui, come 4ª e ultima tab: il calcolo protegge l'intera tab (si rifà ad ogni
// riavvio dell'app, ma resta sbloccata per il resto della sessione una volta risolto — non
// ha senso richiederlo ad ogni singolo tap sulla tab, il calcolo è un filtro di attrito, non
// una password). Dopo il calcolo, il contenuto è la dashboard genitore già esistente
// (ParentDashboardScreen): progressi dettagliati per fonema, uso settimanale, andamento,
// abbonamento, consensi.
export default function ProgressiScreen({ navigation }: any) {
  const [unlocked, setUnlocked] = useState(false);

  if (unlocked) {
    return <ParentDashboardScreen navigation={navigation} />;
  }

  return (
    <AdultMathGate
      subtitle="Questa parte è per i genitori. Risolvi il calcolo per continuare."
      onPass={() => setUnlocked(true)}
    />
  );
}
