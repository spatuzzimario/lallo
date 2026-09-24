import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Promemoria giornaliero LOCALE (nessun server push, nessun tracker di terze parti — CLAUDE.md
// §2.3): se il bambino non ha ancora giocato in giornata, un'unica notifica calda nel tardo
// pomeriggio invita a tornare. Non è mai più di una al giorno: appena una sessione viene
// registrata (recordSession, vedi useGamificationStore) il promemoria di oggi viene annullato e
// riprogrammato per domani, quindi non arriva mai lo stesso giorno in cui si è già giocato.
// Va sul dispositivo di chi ha l'app aperta (il genitore, dato il target 3-6 anni) ed è
// attivabile solo dal genitore in Progressi → Privacy — mai un popup di permesso di sistema
// non richiesto all'avvio dell'app.
const REMINDER_HOUR = 17;
const REMINDER_MINUTE = 0;
const REMINDER_CHANNEL_ID = "promemoria";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
    name: "Promemoria",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export async function requestReminderPermission(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  const result = await Notifications.requestPermissionsAsync();
  return result.granted;
}

function nextReminderDate(): Date {
  const next = new Date();
  next.setHours(REMINDER_HOUR, REMINDER_MINUTE, 0, 0);
  if (next.getTime() <= Date.now()) next.setDate(next.getDate() + 1);
  return next;
}

// Chiamata quando il genitore attiva il promemoria (Privacy e registrazioni) e ogni volta che
// il bambino completa una sessione — in quel caso sposta semplicemente in avanti il prossimo
// promemoria, invece di lasciarne uno per "oggi" che arriverebbe dopo che si è già giocato.
export async function scheduleNextReminder(childName: string) {
  await ensureAndroidChannel();
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Lallo ti aspetta! 🦜",
      body: `Facciamo un gioco insieme, ${childName}?`,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: nextReminderDate(),
      channelId: REMINDER_CHANNEL_ID,
    },
  });
}

export async function cancelReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
