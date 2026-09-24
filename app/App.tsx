import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import IntroSplashScreen from "./src/screens/IntroSplashScreen";
import GiochiScreen from "./src/screens/GiochiScreen";
import LivelliScreen from "./src/screens/LivelliScreen";
import LalloScreen from "./src/screens/LalloScreen";
import AlbumScreen from "./src/screens/AlbumScreen";
import ProgressiScreen from "./src/screens/ProgressiScreen";
import SessionScreen from "./src/screens/SessionScreen";
import {
  TrustScreen,
  TherapistLinkScreen,
  TherapistCodeEntryScreen,
  TherapistOnboardingScreen,
  TherapistCodeReadyScreen,
  FindTherapistScreen,
  ChildNameScreen,
  ChildGenderScreen,
  ChildBirthdateScreen,
} from "./src/screens/OnboardingScreens";
import {
  WordCountScreen,
  EvaluatedByTherapistScreen,
  DiagnosedConditionsScreen,
  StrugglingSoundsScreen,
  TrustStatScreen,
  ResultsScreen,
} from "./src/screens/DiagnosticScreens";
import PaywallScreen from "./src/screens/PaywallScreen";
import AuthScreen from "./src/screens/AuthScreen";
import { PrivacyConsentScreen } from "./src/screens/ParentScreens";
// NOTA: TherapistAssignScreen è stato rimosso da questa app su richiesta esplicita —
// il logopedista avrà un'app separata con login proprio. Il file resta nel
// repository (src/screens/TherapistAssignScreen.tsx) per essere riusato lì,
// ma non è più importato né raggiungibile da qui.
//
// TODO (aperto, non implementare senza conferma esplicita — call con Carlotta Canclini,
// logopedista, luglio 2026): discusso se la scelta "professionista / bambino" debba restare
// una app separata (architettura attuale) o diventare la primissima schermata di questa
// stessa app. Nessuna decisione presa: non cambiare l'architettura finché non se ne riparla.
//
// NOTA (agosto 2026, brief aggiornato — vedi CLAUDE.md): il modello è ora parent-first,
// non più B2B2C con gate clinico. Il vecchio PlanPreviewScreen (piano bloccato in attesa di
// un logopedista) è stato rimosso — ResultsScreen ora sblocca il piano subito, si parte dal
// livello 1. PaywallScreen resta instradato ma non ancora ricollegato al flusso onboarding:
// il brief prevede un trial di 7 giorni prima del paywall (§7).
//
// AGGIORNAMENTO (settembre 2026): RevenueCat agganciato per davvero — vedi
// src/api/purchases.ts e PAYWALL_SETUP.md alla radice del repo per la checklist di setup
// (creazione abbonamenti su App Store Connect/Play Console, progetto RevenueCat).

import { useGamificationStore } from "./src/store/useGamificationStore";
import { ChildProfile } from "./src/types/gamification";
import { configurePurchases, getCustomerInfo, hasPremiumEntitlement, addCustomerInfoListener } from "./src/api/purchases";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Placeholder seed profile — replace with Supabase fetch keyed off
// the therapist-issued invite code used at onboarding (B2B2C entry point).
// "assignedToday" qui è seed/demo: in produzione arriva dal backend condiviso
// con l'app del logopedista (separata, da costruire), non è generato da questa app.
const seedProfile: ChildProfile = {
  id: "demo-child",
  displayName: "Marco",
  avatarId: "lallo-default",
  stars: 0,
  streak: {
    currentWeeks: 0,
    sessionsThisWeek: 0,
    graceDaysRemaining: 2,
    lastSessionDate: null,
  },
  unlockedCosmetics: [],
  preferredTopics: [],
  parentReportedConcerns: [],
  audioRecordingConsent: false,
  cameraConsent: false,
  remindersEnabled: false,
  introsSeen: { lallo: false, album: false },
  sessionLog: [],
  lalloPet: { lastFedAt: null, lastInteractionAt: null },
  photoCatches: [],
  phonemeGroups: [
    {
      id: "r",
      name: "Suono R",
      islandAsset: "island_r",
      unlockedByTherapist: true,
      levels: [1, 2, 3, 4, 5].map((level) => ({
        level: level as any,
        status: level <= 3 ? "in_progress" : "locked",
        masteryThreshold: 0.75,
        starsEarned: level === 1 ? 6 : level === 2 ? 3 : 0,
        starsPossible: level === 1 ? 9 : level === 2 ? 9 : 0,
      })),
    },
  ],
  assignedToday: [
    {
      id: "today-1",
      exerciseType: "caccia",
      exerciseLabel: "Caccia al suono",
      phonemeGroupId: "r",
      phonemeLabel: "R",
      position: "iniziale",
      level: 3,
      levelRangeLabel: "livello 3",
    },
    {
      id: "today-2",
      exerciseType: "registratore",
      exerciseLabel: "Registratore",
      phonemeGroupId: "r",
      phonemeLabel: "R",
      position: "mediana",
      level: 3,
      levelRangeLabel: "livello 3",
    },
    {
      id: "today-3",
      exerciseType: "memory",
      exerciseLabel: "Memory dei suoni",
      phonemeGroupId: "r",
      phonemeLabel: "R",
      position: "iniziale",
      level: 2,
      levelRangeLabel: "livello 2–3",
    },
  ],
};

// Settembre 2026 (feedback): l'app ora si apre sulla tab Lallo, non più su Giochi — la
// mascotte si presenta e da lì il bambino decide se dargli da mangiare, parlargli o
// giocare (che porta alla tab Giochi). L'ordine delle tab segue lo stesso ordine logico,
// con Lallo per prima. "Progressi" è stata unita all'area genitori (prima un'iconetta a
// parte in Giochi): ora è un'unica tab in fondo, protetta dallo stesso calcolo di prima —
// vedi ProgressiScreen.
function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Lallo"
      screenOptions={{ headerShown: false, tabBarActiveTintColor: "#137A6E" }}
    >
      <Tab.Screen
        name="Lallo"
        component={LalloScreen}
        options={{ tabBarIcon: () => <Text style={{ fontSize: 18 }}>🦜</Text> }}
      />
      <Tab.Screen
        name="Giochi"
        component={GiochiScreen}
        options={{ tabBarIcon: () => <Text style={{ fontSize: 18 }}>🎮</Text> }}
      />
      <Tab.Screen
        name="Album"
        component={AlbumScreen}
        options={{ tabBarIcon: () => <Text style={{ fontSize: 18 }}>📸</Text> }}
      />
      <Tab.Screen
        name="Progressi"
        component={ProgressiScreen}
        options={{ tabBarIcon: () => <Text style={{ fontSize: 18 }}>📈</Text> }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const setProfile = useGamificationStore((s) => s.setProfile);
  const setSubscriptionActive = useGamificationStore((s) => s.setSubscriptionActive);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    setProfile(seedProfile);
  }, []);

  // Configura RevenueCat all'avvio e sincronizza subscriptionActive con l'abbonamento
  // reale — non più un valore che si tocca da un tap locale (vedi PaywallScreen). Su web o
  // in Expo Go (nessun modulo nativo custom) configurePurchases esce subito e l'app resta
  // in modalità locale, come oggi.
  useEffect(() => {
    (async () => {
      await configurePurchases();
      const info = await getCustomerInfo();
      if (info) setSubscriptionActive(hasPremiumEntitlement(info));
    })();
    const unsubscribe = addCustomerInfoListener((info) => {
      setSubscriptionActive(hasPremiumEntitlement(info));
    });
    return unsubscribe;
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Trust" component={TrustScreen} />
          <Stack.Screen name="TherapistLink" component={TherapistLinkScreen} />
          <Stack.Screen name="TherapistCodeEntry" component={TherapistCodeEntryScreen} />
          <Stack.Screen name="TherapistOnboarding" component={TherapistOnboardingScreen} />
          <Stack.Screen name="TherapistCodeReady" component={TherapistCodeReadyScreen} />
          <Stack.Screen name="FindTherapist" component={FindTherapistScreen} />
          <Stack.Screen name="ChildName" component={ChildNameScreen} />
          <Stack.Screen name="ChildGender" component={ChildGenderScreen} />
          <Stack.Screen name="ChildBirthdate" component={ChildBirthdateScreen} />
          <Stack.Screen name="WordCount" component={WordCountScreen} />
          <Stack.Screen name="EvaluatedByTherapist" component={EvaluatedByTherapistScreen} />
          <Stack.Screen name="DiagnosedConditions" component={DiagnosedConditionsScreen} />
          <Stack.Screen name="StrugglingSounds" component={StrugglingSoundsScreen} />
          <Stack.Screen name="TrustStat" component={TrustStatScreen} />
          <Stack.Screen name="Results" component={ResultsScreen} />
          <Stack.Screen name="Auth" component={AuthScreen} />
          <Stack.Screen name="Paywall" component={PaywallScreen} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="Livelli" component={LivelliScreen} />
          <Stack.Screen name="Session" component={SessionScreen} />
          <Stack.Screen name="PrivacyConsent" component={PrivacyConsentScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      {showIntro && <IntroSplashScreen onDone={() => setShowIntro(false)} />}
    </SafeAreaProvider>
  );
}
