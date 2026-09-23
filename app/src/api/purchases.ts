import { Platform } from "react-native";
import Purchases, { CustomerInfo, PurchasesOffering, PurchasesPackage } from "react-native-purchases";

// Integrazione RevenueCat (brief §7). react-native-purchases è un modulo nativo:
// - Non esiste build web — ogni funzione qui esce subito su Platform.OS === "web",
//   l'app resta in modalità locale (nessun paywall reale, come oggi).
// - Non funziona in Expo Go (che non include moduli nativi custom): configure() fallisce
//   con un errore catturato qui sotto, e l'app resta in modalità locale invece di
//   schiantarsi. Serve una EAS development/production build per testare acquisti veri —
//   vedi PAYWALL_SETUP.md.
const REVENUECAT_IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
const REVENUECAT_ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;

// Entitlement unico che sblocca tutti i fonemi premium — deve corrispondere esattamente
// all'Entitlement creato nel dashboard RevenueCat (vedi PAYWALL_SETUP.md).
export const PREMIUM_ENTITLEMENT_ID = "premium";

let configured = false;

export function isPurchasesConfigured() {
  return configured;
}

export async function configurePurchases(): Promise<void> {
  if (Platform.OS === "web") return;
  const apiKey = Platform.OS === "ios" ? REVENUECAT_IOS_KEY : REVENUECAT_ANDROID_KEY;
  if (!apiKey) {
    console.warn("[purchases] Chiave RevenueCat mancante in .env.local — vedi PAYWALL_SETUP.md.");
    return;
  }
  try {
    Purchases.configure({ apiKey });
    configured = true;
  } catch (e) {
    console.warn(
      "[purchases] RevenueCat non disponibile in questo ambiente (serve una EAS development build, non Expo Go):",
      e
    );
  }
}

// Collega l'utente anonimo di RevenueCat all'id reale del bambino su Supabase, così gli
// acquisti restano ritrovabili anche da un altro dispositivo con lo stesso account. Va
// chiamata quando supabaseChildId diventa disponibile (vedi setSupabaseChildId nello store).
export async function linkPurchasesToChild(supabaseChildId: string): Promise<void> {
  if (!configured) return;
  try {
    await Purchases.logIn(supabaseChildId);
  } catch (e) {
    console.warn("[purchases] logIn fallito:", e);
  }
}

export async function getCurrentOffering(): Promise<PurchasesOffering | null> {
  if (!configured) return null;
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current ?? null;
  } catch (e) {
    console.warn("[purchases] getOfferings fallita:", e);
    return null;
  }
}

export async function purchase(
  pkg: PurchasesPackage
): Promise<{ success: boolean; userCancelled?: boolean; customerInfo?: CustomerInfo }> {
  if (!configured) return { success: false };
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { success: hasPremiumEntitlement(customerInfo), customerInfo };
  } catch (e: any) {
    if (e?.userCancelled) return { success: false, userCancelled: true };
    console.warn("[purchases] Acquisto fallito:", e);
    return { success: false };
  }
}

export async function restore(): Promise<CustomerInfo | null> {
  if (!configured) return null;
  try {
    return await Purchases.restorePurchases();
  } catch (e) {
    console.warn("[purchases] Ripristino fallito:", e);
    return null;
  }
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (!configured) return null;
  try {
    return await Purchases.getCustomerInfo();
  } catch (e) {
    console.warn("[purchases] getCustomerInfo fallita:", e);
    return null;
  }
}

export function hasPremiumEntitlement(customerInfo: CustomerInfo | null | undefined): boolean {
  if (!customerInfo) return false;
  return !!customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID];
}

// Notificata anche da rinnovi/cancellazioni/acquisti fatti su un altro dispositivo con lo
// stesso account — così subscriptionActive resta vero senza dover riaprire l'app.
export function addCustomerInfoListener(callback: (info: CustomerInfo) => void): () => void {
  if (!configured) return () => {};
  Purchases.addCustomerInfoUpdateListener(callback);
  return () => Purchases.removeCustomerInfoUpdateListener(callback);
}
