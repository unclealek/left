import AsyncStorage from "@react-native-async-storage/async-storage";
import type { IntentType } from "../../types/left-domain";

const STORAGE_KEYS = {
  runtime: "left/location/runtime",
  venuePreferences: "left/location/venue-preferences",
  activationDefaults: "left/location/activation-defaults",
} as const;

export type VenuePreference = {
  venueId: string;
  venueName: string;
  hidden: boolean;
  muted: boolean;
  cooldownUntil: string | null;
  updatedAt: string;
};

export type LocationPromptState = {
  venueId: string;
  venueName: string;
  sentAt: string;
  responded: boolean;
};

export type LocationRuntimeState = {
  permissionGranted: boolean;
  backgroundRegistered: boolean;
  currentVenueId: string | null;
  currentVenueName: string | null;
  dwellEnteredAt: string | null;
  dwellLastSeenAt: string | null;
  prompt: LocationPromptState | null;
  launchActivationFromNotification: boolean;
};

export type ActivationDefaults = {
  intent: IntentType | null;
  vibes: string[];
  durationMinutes: number;
  hintText: string;
};

const DEFAULT_RUNTIME_STATE: LocationRuntimeState = {
  permissionGranted: false,
  backgroundRegistered: false,
  currentVenueId: null,
  currentVenueName: null,
  dwellEnteredAt: null,
  dwellLastSeenAt: null,
  prompt: null,
  launchActivationFromNotification: false,
};

async function readJson<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(key: string, value: T) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export function getDefaultRuntimeState() {
  return DEFAULT_RUNTIME_STATE;
}

export async function getLocationRuntimeState() {
  return readJson<LocationRuntimeState>(STORAGE_KEYS.runtime, DEFAULT_RUNTIME_STATE);
}

export async function saveLocationRuntimeState(next: LocationRuntimeState) {
  await writeJson(STORAGE_KEYS.runtime, next);
}

export async function updateLocationRuntimeState(
  updater: (current: LocationRuntimeState) => LocationRuntimeState,
) {
  const current = await getLocationRuntimeState();
  const next = updater(current);
  await saveLocationRuntimeState(next);
  return next;
}

export async function getVenuePreferences() {
  return readJson<Record<string, VenuePreference>>(STORAGE_KEYS.venuePreferences, {});
}

export async function upsertVenuePreference(
  venueId: string,
  venueName: string,
  updater: (current: VenuePreference) => VenuePreference,
) {
  const all = await getVenuePreferences();
  const current =
    all[venueId] ??
    ({
      venueId,
      venueName,
      hidden: false,
      muted: false,
      cooldownUntil: null,
      updatedAt: new Date(0).toISOString(),
    } satisfies VenuePreference);
  const next = updater(current);
  all[venueId] = next;
  await writeJson(STORAGE_KEYS.venuePreferences, all);
  return next;
}

export async function clearVenuePreference(venueId: string) {
  const all = await getVenuePreferences();
  delete all[venueId];
  await writeJson(STORAGE_KEYS.venuePreferences, all);
}

export async function getActivationDefaults() {
  return readJson<ActivationDefaults | null>(STORAGE_KEYS.activationDefaults, null);
}

export async function saveActivationDefaults(next: ActivationDefaults) {
  await writeJson(STORAGE_KEYS.activationDefaults, next);
}
