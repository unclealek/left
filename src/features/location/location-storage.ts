import { supabase } from "../../lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { IntentType, VenueType } from "../../types/left-domain";
import { VENUE_DISCOVERY_RADIUS_METERS } from "./venue-distance-policy";

const STORAGE_KEYS = {
  runtime: "left/location/runtime",
  venuePreferences: "left/location/venue-preferences",
  activationDefaults: "left/location/activation-defaults",
  venueApproachPrompts: "left/location/venue-approach-prompts",
} as const;

const MAX_PERSISTED_VENUE_DISTANCE_METERS = VENUE_DISCOVERY_RADIUS_METERS;

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
  placeId?: string | null;
  timezone?: string | null;
  id: string;
  name: string;
  venueType?: VenueType;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  source: "google_places" | "local_catalog" | "community_added";
  distanceMeters: number | null;
  photoUrl?: string | null;
  // Returned only for the open details screen; never persist these expiring URLs.
  photo?: {
    uri: string;
    attributions: Array<{ displayName: string; uri: string | null }>;
  } | null;
  formattedAddress?: string | null;
  communityAddedByName?: string | null;
  communityNotes?: string | null;
  websiteUri?: string | null;
  phoneNumber?: string | null;
  rating?: number | null;
  userRatingCount?: number | null;
  priceLevel?: string | null;
  businessStatus?: string | null;
  openingHours?: {
    openNow?: boolean | null;
    weekdayDescriptions?: string[];
  } | null;
  accessibilityOptions?: Record<string, boolean | null> | null;
};

export type RuntimeCoords = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
};

export type LocationRuntimeState = {
  storageOwnerId?: string | null;
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

export type VenueApproachPrompt = {
  venueId: string;
  venueName: string;
  promptText: string;
  updatedAt: string;
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

const transientCoords = new Map<string, { coords: RuntimeCoords; at: number }>();

export async function getLocationStorageOwner() {
  const { data: { session }, error } = await supabase.auth.getSession();
  return error ? null : session?.user.id ?? null;
}

function scopedKey(key: string, owner: string) { return `${key}/account/${owner}`; }

async function readJson<T>(key: string, fallback: T, owner?: string | null): Promise<T> {
  const account = owner === undefined ? await getLocationStorageOwner() : owner;
  if (!account) return fallback;
  const raw = await AsyncStorage.getItem(scopedKey(key, account));
  if (!raw || await getLocationStorageOwner() !== account) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

async function writeJson<T>(key: string, value: T, owner?: string | null) {
  const account = owner === undefined ? await getLocationStorageOwner() : owner;
  if (!account || await getLocationStorageOwner() !== account) return;
  await AsyncStorage.setItem(scopedKey(key, account), JSON.stringify(value));
  // A logout racing the write must not leave data behind.
  if (await getLocationStorageOwner() !== account) await AsyncStorage.multiRemove([scopedKey(key, account)]);
}

export async function clearLocationAccountData(owner: string | null) {
  if (owner) transientCoords.delete(owner);
  await AsyncStorage.multiRemove([
    ...Object.values(STORAGE_KEYS), // Old unowned data must never migrate to another user.
    ...(owner ? Object.values(STORAGE_KEYS).map(key => scopedKey(key, owner)) : []),
  ]);
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
  const owner = await getLocationStorageOwner();
  const runtime = await readJson<Partial<LocationRuntimeState>>(STORAGE_KEYS.runtime, DEFAULT_RUNTIME_STATE, owner);
  const fix = owner ? transientCoords.get(owner) : null;
  const normalized = normalizeLocationRuntimeState(runtime);
  const fresh = fix && Date.now() - fix.at >= 0 && Date.now() - fix.at < 5 * 60_000;
  return { ...normalized, storageOwnerId: owner,
    ...(fresh ? { lastKnownCoords: fix.coords } : {
      lastKnownCoords: null,
      currentVenueId: null,
      currentVenueName: null,
      selectedVenueId: null,
      selectedVenueName: null,
      nearbyVenues: [],
      dwellEnteredAt: null,
      dwellLastSeenAt: null,
    }),
  };
}

export async function saveLocationRuntimeState(next: LocationRuntimeState) {
  const owner = next.storageOwnerId === undefined ? await getLocationStorageOwner() : next.storageOwnerId;
  if (!owner || owner !== await getLocationStorageOwner()) return;
  const normalized = normalizeLocationRuntimeState(next);
  if (normalized.lastKnownCoords) transientCoords.set(owner, { coords: normalized.lastKnownCoords, at: Date.now() });
  else transientCoords.delete(owner);
  await writeJson(STORAGE_KEYS.runtime, {
    ...normalized,
    lastKnownCoords: null,
    nearbyVenues: normalized.nearbyVenues.map(({ photo: _photo, ...venue }) => ({ ...venue, photoUrl: null })),
  }, owner);
}

export async function updateLocationRuntimeState(
  updater: (current: LocationRuntimeState) => LocationRuntimeState,
) {
  const current = await getLocationRuntimeState();
  const next = updater(current);
  await saveLocationRuntimeState(next);
  return next;
}

export async function getVenuePreferences(owner?: string | null) {
  return readJson<Record<string, VenuePreference>>(STORAGE_KEYS.venuePreferences, {}, owner);
}

export async function saveVenuePreferences(next: Record<string, VenuePreference>, owner?: string | null) {
  await writeJson(STORAGE_KEYS.venuePreferences, next, owner);
}

export async function upsertVenuePreference(
  venueId: string,
  venueName: string,
  updater: (current: VenuePreference) => VenuePreference,
) {
  const owner = await getLocationStorageOwner();
  const all = await getVenuePreferences(owner);
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
  await writeJson(STORAGE_KEYS.venuePreferences, all, owner);
  return next;
}

export async function clearVenuePreference(venueId: string) {
  const owner = await getLocationStorageOwner();
  const all = await getVenuePreferences(owner);
  delete all[venueId];
  await writeJson(STORAGE_KEYS.venuePreferences, all, owner);
}

export async function getActivationDefaults() {
  return readJson<ActivationDefaults | null>(STORAGE_KEYS.activationDefaults, null);
}

export async function saveActivationDefaults(next: ActivationDefaults) {
  await writeJson(STORAGE_KEYS.activationDefaults, next);
}

export async function getVenueApproachPrompts() {
  return readJson<Record<string, VenueApproachPrompt>>(STORAGE_KEYS.venueApproachPrompts, {});
}

export async function saveVenueApproachPrompts(next: Record<string, VenueApproachPrompt>) {
  await writeJson(STORAGE_KEYS.venueApproachPrompts, next);
}

export async function upsertVenueApproachPrompt(
  venueId: string,
  venueName: string,
  promptText: string,
) {
  const owner = await getLocationStorageOwner();
  const all = await readJson<Record<string, VenueApproachPrompt>>(STORAGE_KEYS.venueApproachPrompts, {}, owner);
  all[venueId] = {
    venueId,
    venueName,
    promptText,
    updatedAt: new Date().toISOString(),
  };
  await writeJson(STORAGE_KEYS.venueApproachPrompts, all, owner);
  return all[venueId];
}
