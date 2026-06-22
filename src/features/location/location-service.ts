import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import type { NotificationResponse } from "expo-notifications";
import {
  getActivationDefaults,
  getDefaultRuntimeState,
  getLocationRuntimeState,
  type RuntimeVenueCandidate,
  getVenuePreferences,
  saveActivationDefaults,
  saveLocationRuntimeState,
  updateLocationRuntimeState,
  upsertVenuePreference,
} from "./location-storage";
import { detectVenueFromCoords, getNearbyVenues } from "./venue-detection";
import type { AppUser } from "../../types/left-domain";

export const LOCATION_TASK_NAME = "left/background-location";
export const VENUE_PROMPT_CATEGORY_ID = "left/venue-prompt";
const VENUE_DWELL_MS = 5 * 60_000;
const VENUE_COOLDOWN_MS = 2 * 60 * 60_000;
const IGNORED_PROMPT_MS = 15 * 60_000;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function nowIso() {
  return new Date().toISOString();
}

function isCooldownActive(cooldownUntil: string | null) {
  return !!cooldownUntil && new Date(cooldownUntil).getTime() > Date.now();
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

async function markPromptRejected(venueId: string, venueName: string) {
  await upsertVenuePreference(venueId, venueName, (current) => ({
    ...current,
    cooldownUntil: new Date(Date.now() + VENUE_COOLDOWN_MS).toISOString(),
    updatedAt: nowIso(),
  }));
  await updateLocationRuntimeState((current) => ({
    ...current,
    prompt: current.prompt ? { ...current.prompt, responded: true } : null,
  }));
}

export async function registerVenuePromptCategory() {
  await Notifications.setNotificationCategoryAsync(VENUE_PROMPT_CATEGORY_ID, [
    {
      identifier: "yes",
      buttonTitle: "Yes",
      options: {
        opensAppToForeground: true,
      },
    },
    {
      identifier: "no",
      buttonTitle: "No",
      options: {
        opensAppToForeground: false,
      },
    },
  ]);
}

export async function requestLocationAccess() {
  try {
    console.info("[location] requesting foreground permission");
    const foreground = await Location.requestForegroundPermissionsAsync();
    console.info("[location] foreground permission result", { status: foreground.status });
    if (foreground.status !== "granted") {
      await saveLocationRuntimeState({
        ...getDefaultRuntimeState(),
        permissionGranted: false,
        backgroundRegistered: false,
      });
      return { granted: false, reason: "foreground_denied" as const };
    }

    console.info("[location] requesting background permission");
    const background = await Location.requestBackgroundPermissionsAsync();
    console.info("[location] background permission result", { status: background.status });
    if (background.status !== "granted") {
      await saveLocationRuntimeState({
        ...getDefaultRuntimeState(),
        permissionGranted: false,
        backgroundRegistered: false,
      });
      return { granted: false, reason: "background_denied" as const };
    }

    await Notifications.requestPermissionsAsync();
    await registerVenuePromptCategory();
    const alreadyStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    console.info("[location] background registration state", { alreadyStarted });
    if (!alreadyStarted) {
      console.info("[location] starting background location updates");
      await withTimeout(
        Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 35,
          timeInterval: 60_000,
          showsBackgroundLocationIndicator: false,
          pausesUpdatesAutomatically: false,
          foregroundService: {
            notificationTitle: "Left is checking for social venues",
            notificationBody: "Location stays on-device until a venue is matched.",
          },
        }),
        10000,
        "Background location registration",
      );
      console.info("[location] background location updates started");
    }

    await updateLocationRuntimeState((current) => ({
      ...current,
      permissionGranted: true,
      backgroundRegistered: true,
    }));
    return { granted: true as const };
  } catch (error) {
    console.warn("[location] requestLocationAccess failed", error);
    await saveLocationRuntimeState({
      ...getDefaultRuntimeState(),
      permissionGranted: false,
      backgroundRegistered: false,
    });
    return { granted: false, reason: "registration_failed" as const };
  }
}

export async function syncLocationRegistrationState() {
  const foreground = await Location.getForegroundPermissionsAsync();
  const background = await Location.getBackgroundPermissionsAsync();
  const backgroundRegistered = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
  const permissionGranted = foreground.status === "granted" && background.status === "granted";
  console.info("[location] sync registration state", {
    foreground: foreground.status,
    background: background.status,
    backgroundRegistered,
    permissionGranted,
  });
  const next = await updateLocationRuntimeState((current) => ({
    ...current,
    permissionGranted,
    backgroundRegistered,
  }));
  return next;
}

export async function selectNearbyVenue(venueId: string) {
  const runtime = await getLocationRuntimeState();
  const venue = runtime.nearbyVenues.find((candidate) => candidate.id === venueId);
  if (!venue) return false;

  console.info("[location] selecting nearby venue", {
    venueId: venue.id,
    venueName: venue.name,
  });

  await saveLocationRuntimeState({
    ...runtime,
    currentVenueId: venue.id,
    currentVenueName: venue.name,
    selectedVenueId: venue.id,
    selectedVenueName: venue.name,
    dwellEnteredAt: nowIso(),
    dwellLastSeenAt: nowIso(),
    prompt: null,
  });
  return true;
}

export async function storeUserSubmittedVenue(candidate: RuntimeVenueCandidate) {
  const runtime = await getLocationRuntimeState();
  const nextNearbyVenues = [
    candidate,
    ...runtime.nearbyVenues.filter((venue) => venue.id !== candidate.id),
  ];

  console.info("[location] storing user submitted venue", {
    venueId: candidate.id,
    venueName: candidate.name,
  });

  await saveLocationRuntimeState({
    ...runtime,
    nearbyVenues: nextNearbyVenues,
    currentVenueId: candidate.id,
    currentVenueName: candidate.name,
    selectedVenueId: candidate.id,
    selectedVenueName: candidate.name,
    dwellEnteredAt: nowIso(),
    dwellLastSeenAt: nowIso(),
    prompt: null,
  });
}

export async function processLocationFix(coords: Location.LocationObjectCoords) {
  console.info("[location] processing location fix", {
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracy: coords.accuracy ?? null,
  });
  const runtime = await getLocationRuntimeState();

  if (
    runtime.prompt &&
    !runtime.prompt.responded &&
    Date.now() - new Date(runtime.prompt.sentAt).getTime() >= IGNORED_PROMPT_MS
  ) {
    await markPromptRejected(runtime.prompt.venueId, runtime.prompt.venueName);
  }

  const nearbyVenues = await getNearbyVenues(coords);
  if (!nearbyVenues.length) {
    console.info("[location] no venue detected, clearing dwell state");
    await updateLocationRuntimeState((current) => ({
      ...current,
      currentVenueId: null,
      currentVenueName: null,
      selectedVenueId: null,
      selectedVenueName: null,
      nearbyVenues: [],
      lastKnownCoords: {
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy ?? null,
      },
      dwellEnteredAt: null,
      dwellLastSeenAt: null,
    }));
    return;
  }

  const preferredVenueId = nearbyVenues.some((venue) => venue.id === runtime.selectedVenueId)
    ? runtime.selectedVenueId
    : null;
  const venue = await detectVenueFromCoords(coords, preferredVenueId);
  if (!venue) return;

  const preferences = await getVenuePreferences();
  const venuePreference = preferences[venue.id];
  const sameVenue = runtime.currentVenueId === venue.id;
  const enteredAt = sameVenue && runtime.dwellEnteredAt ? runtime.dwellEnteredAt : nowIso();
  const lastSeenAt = nowIso();
  const nextPrompt =
    runtime.prompt && runtime.prompt.venueId === venue.id ? runtime.prompt : null;

  console.info("[location] venue detected", {
    venueId: venue.id,
    venueName: venue.name,
    sameVenue,
    hidden: venuePreference?.hidden ?? false,
    muted: venuePreference?.muted ?? false,
    cooldownUntil: venuePreference?.cooldownUntil ?? null,
    enteredAt,
  });

  await saveLocationRuntimeState({
    ...runtime,
    permissionGranted: true,
    backgroundRegistered: true,
    currentVenueId: venue.id,
    currentVenueName: venue.name,
    selectedVenueId: preferredVenueId,
    selectedVenueName:
      preferredVenueId === venue.id && runtime.selectedVenueName ? runtime.selectedVenueName : null,
    nearbyVenues,
    lastKnownCoords: {
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: coords.accuracy ?? null,
    },
    dwellEnteredAt: enteredAt,
    dwellLastSeenAt: lastSeenAt,
    prompt: nextPrompt,
  });

  if (venuePreference?.muted) {
    console.info("[location] venue is muted, skipping prompt");
    return;
  }
  if (venuePreference?.hidden) {
    console.info("[location] venue is hidden, skipping prompt");
    return;
  }
  if (isCooldownActive(venuePreference?.cooldownUntil ?? null)) {
    console.info("[location] venue is cooling down, skipping prompt", {
      cooldownUntil: venuePreference?.cooldownUntil,
    });
    return;
  }
  if (nextPrompt && !nextPrompt.responded) {
    console.info("[location] outstanding prompt already exists for venue, skipping");
    return;
  }
  const dwellMs = Date.now() - new Date(enteredAt).getTime();
  if (dwellMs < VENUE_DWELL_MS) {
    console.info("[location] dwell threshold not reached", {
      dwellMs,
      dwellRemainingMs: VENUE_DWELL_MS - dwellMs,
    });
    return;
  }

  console.info("[location] scheduling venue prompt", {
    venueId: venue.id,
    venueName: venue.name,
  });
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Open to chat?",
      body: `You've been at ${venue.name} a while. Open to chat?`,
      categoryIdentifier: VENUE_PROMPT_CATEGORY_ID,
      data: {
        venueId: venue.id,
        venueName: venue.name,
      },
    },
    trigger: null,
  });

  await updateLocationRuntimeState((current) => ({
    ...current,
    prompt: {
      venueId: venue.id,
      venueName: venue.name,
      sentAt: nowIso(),
      responded: false,
    },
  }));
}

export async function handleVenuePromptResponse(response: NotificationResponse) {
  const data = response.notification.request.content.data ?? {};
  const venueId = String(data.venueId ?? "");
  const venueName = String(data.venueName ?? "");
  console.info("[location] notification response received", {
    actionIdentifier: response.actionIdentifier,
    venueId,
    venueName,
  });
  if (!venueId || !venueName) return { action: "unknown" as const };

  if (response.actionIdentifier === "yes" || response.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
    await updateLocationRuntimeState((current) => ({
      ...current,
      launchActivationFromNotification: true,
      currentVenueId: venueId,
      currentVenueName: venueName,
      prompt: current.prompt ? { ...current.prompt, responded: true } : null,
    }));
    return { action: "activate" as const, venueId, venueName };
  }

  if (response.actionIdentifier === "no") {
    await markPromptRejected(venueId, venueName);
    return { action: "cooldown" as const, venueId, venueName };
  }

  return { action: "unknown" as const };
}

export async function consumePendingActivationLaunch() {
  const runtime = await getLocationRuntimeState();
  if (!runtime.launchActivationFromNotification) return false;
  console.info("[location] consuming pending activation launch");
  await updateLocationRuntimeState((current) => ({
    ...current,
    launchActivationFromNotification: false,
  }));
  return true;
}

export async function saveLastActivationDefaults(input: {
  intent: AppUser["defaultIntent"];
  vibes: string[];
  durationMinutes: number;
  hintText: string;
}) {
  console.info("[location] saving activation defaults", input);
  await saveActivationDefaults({
    intent: input.intent,
    vibes: input.vibes,
    durationMinutes: input.durationMinutes,
    hintText: input.hintText,
  });
}

export async function loadLastActivationDefaults() {
  return getActivationDefaults();
}

export async function setVenueHidden(venueId: string, venueName: string, hidden: boolean) {
  console.info("[location] updating hidden venue preference", { venueId, venueName, hidden });
  return upsertVenuePreference(venueId, venueName, (current) => ({
    ...current,
    hidden,
    updatedAt: nowIso(),
  }));
}

export async function setVenueMuted(venueId: string, venueName: string, muted: boolean) {
  console.info("[location] updating muted venue preference", { venueId, venueName, muted });
  return upsertVenuePreference(venueId, venueName, (current) => ({
    ...current,
    muted,
    cooldownUntil: muted ? null : current.cooldownUntil,
    updatedAt: nowIso(),
  }));
}
