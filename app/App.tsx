import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import HomeScreen from "./src/screens/HomeScreen";
import GiochiScreen from "./src/screens/GiochiScreen";
import ProgressiScreen from "./src/screens/ProgressiScreen";
import SessionScreen from "./src/screens/SessionScreen";
import {
  TrustScreen,
  TherapistLinkScreen,
  TherapistCodeEntryScreen,
  RemoteTherapistWaitlistScreen,
  ChildNameScreen,
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
import { AdultGateScreen, ParentDashboardScreen } from "./src/screens/ParentScreens";
// NOTA: TherapistAssignScreen è stato rimosso da questa app su richiesta esplicita —
// il logopedista avrà un'app separata con login proprio. Il file resta nel
// repository (src/screens/TherapistAssignScreen.tsx) per essere riusato lì,
// ma non è più importato né raggiungibile da qui.

import { useGamificationStore } from "./src/store/useGamificationStore";
import { ChildProfile } from "./src/types/gamification";

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
  gems: 0,
  streak: {
    currentWeeks: 0,
    sessionsThisWeek: 0,
    graceDaysRemaining: 2,
    lastSessionDate: null,
  },
  unlockedCosmetics: [],
  preferredTopics: [],
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

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: "#137A6E" }}>
      <Tab.Screen
        name="Oggi"
        component={HomeScreen}
        options={{ tabBarIcon: () => <Text style={{ fontSize: 18 }}>🏠</Text> }}
      />
      <Tab.Screen
        name="Giochi"
        component={GiochiScreen}
        options={{ tabBarIcon: () => <Text style={{ fontSize: 18 }}>🎮</Text> }}
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

  useEffect(() => {
    setProfile(seedProfile);
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Trust" component={TrustScreen} />
          <Stack.Screen name="TherapistLink" component={TherapistLinkScreen} />
          <Stack.Screen name="TherapistCodeEntry" component={TherapistCodeEntryScreen} />
          <Stack.Screen name="RemoteTherapistWaitlist" component={RemoteTherapistWaitlistScreen} />
          <Stack.Screen name="ChildName" component={ChildNameScreen} />
          <Stack.Screen name="ChildBirthdate" component={ChildBirthdateScreen} />
          <Stack.Screen name="WordCount" component={WordCountScreen} />
          <Stack.Screen name="EvaluatedByTherapist" component={EvaluatedByTherapistScreen} />
          <Stack.Screen name="DiagnosedConditions" component={DiagnosedConditionsScreen} />
          <Stack.Screen name="StrugglingSounds" component={StrugglingSoundsScreen} />
          <Stack.Screen name="TrustStat" component={TrustStatScreen} />
          <Stack.Screen name="Results" component={ResultsScreen} />
          <Stack.Screen name="Paywall" component={PaywallScreen} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="Session" component={SessionScreen} />
          <Stack.Screen name="AdultGate" component={AdultGateScreen} options={{ presentation: "modal" }} />
          <Stack.Screen name="ParentDashboard" component={ParentDashboardScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
