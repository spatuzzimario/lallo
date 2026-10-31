// Variante web di reminders.ts — Metro la sceglie al posto del file nativo su
// Platform.OS === "web" (suffisso .web.ts). Il promemoria programmato (es. "domani alle
// 17:00") richiederebbe un service worker e il browser/tab aperto in quel momento, cosa che
// su un sito non possiamo garantire — niente stub che finga di funzionare: il permesso resta
// sempre negato, così PermissionsScreen mostra onestamente "Permesso non concesso" invece di
// un interruttore che sembra attivarsi ma non farà mai arrivare nulla.
export async function requestReminderPermission(): Promise<boolean> {
  return false;
}

export async function scheduleNextReminder(_childName: string) {}

export async function cancelReminders() {}
