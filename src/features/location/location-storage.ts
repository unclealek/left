import AsyncStorage from "@react-native-async-storage/async-storage";
import type { IntentType } from "../../types/left-domain";

const STORAGE_KEYS = {
  runtime: "left/location/runtime",
  venuePreferences: "left/location/venue-preferences",
  activationDefaults: "left/location/activation-defaults",
} as const;

const MAX_PERSISTED_VENUE_DISTANCE_METERS = 120;

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

export type RuntimeVenueCandidate = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  source: "google_places" | "local_catalog" | "user_submission";
  distanceMeters: number | null;
};

export type RuntimeCoords = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
};

export type LocationRuntimeState = {
  permissionGranted: boolean;
  backgroundRegistered: boolean;
  currentVenueId: string | null;
  currentVenueName: string | null;
  selectedVenueId: string | null;
  selectedVenueName: string | null;
  nearbyVenues: RuntimeVenueCandidate[];
  lastKnownCoords: RuntimeCoords | null;
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
  selectedVenueId: null,
  selectedVenueName: null,
  nearbyVenues: [],
  lastKnownCoords: null,
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

function normalizeLocationRuntimeState(
  runtime: Partial<LocationRuntimeState> | null | undefined,
): LocationRuntimeState {
  const nearbyVenues = Array.isArray(runtime?.nearbyVenues)
    ? runtime.nearbyVenues.filter(
        (venue) =>
          venue &&
          typeof venue.id === "string" &&
          ((venue.distanceMeters ?? 0) <= MAX_PERSISTED_VENUE_DISTANCE_METERS),
      )
    : [];

  return {
    ...DEFAULT_RUNTIME_STATE,
    ...runtime,
    nearbyVenues,
    lastKnownCoords: runtime?.lastKnownCoords ?? null,
    prompt: runtime?.prompt ?? null,
  };
}

export async function getLocationRuntimeState() {
  const runtime = await readJson<Partial<LocationRuntimeState>>(STORAGE_KEYS.runtime, DEFAULT_RUNTIME_STATE);
  return normalizeLocationRuntimeState(runtime);
}

export async function saveLocationRuntimeState(next: LocationRuntimeState) {
  await writeJson(STORAGE_KEYS.runtime, normalizeLocationRuntimeState(next));
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

export async function saveVenuePreferences(next: Record<string, VenuePreference>) {
  await writeJson(STORAGE_KEYS.venuePreferences, next);
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
