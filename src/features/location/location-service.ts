import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import type { NotificationResponse } from "expo-notifications";
import {
  getActivationDefaults,
  getDefaultRuntimeState,
  getLocationRuntimeState,
  getVenuePreferences,
  saveActivationDefaults,
  saveLocationRuntimeState,
  updateLocationRuntimeState,
  upsertVenuePreference,
} from "./location-storage";
import { detectVenueFromCoords } from "./venue-detection";
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
  const foreground = await Location.requestForegroundPermissionsAsync();
  if (foreground.status !== "granted") {
    await saveLocationRuntimeState({
      ...getDefaultRuntimeState(),
      permissionGranted: false,
      backgroundRegistered: false,
    });
    return { granted: false, reason: "foreground_denied" as const };
  }

  const background = await Location.requestBackgroundPermissionsAsync();
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
  if (!alreadyStarted) {
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.Balanced,
      distanceInterval: 35,
      timeInterval: 60_000,
      showsBackgroundLocationIndicator: false,
      pausesUpdatesAutomatically: false,
      foregroundService: {
        notificationTitle: "Left is checking for social venues",
        notificationBody: "Location stays on-device until a venue is matched.",
      },
    });
  }

  await updateLocationRuntimeState((current) => ({
    ...current,
    permissionGranted: true,
    backgroundRegistered: true,
  }));
  return { granted: true as const };
}

export async function syncLocationRegistrationState() {
  const foreground = await Location.getForegroundPermissionsAsync();
  const background = await Location.getBackgroundPermissionsAsync();
  const backgroundRegistered = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
  const permissionGranted = foreground.status === "granted" && background.status === "granted";
  const next = await updateLocationRuntimeState((current) => ({
    ...current,
    permissionGranted,
    backgroundRegistered,
  }));
  return next;
}

export async function processLocationFix(coords: Location.LocationObjectCoords) {
  const runtime = await getLocationRuntimeState();

  if (
    runtime.prompt &&
    !runtime.prompt.responded &&
    Date.now() - new Date(runtime.prompt.sentAt).getTime() >= IGNORED_PROMPT_MS
  ) {
    await markPromptRejected(runtime.prompt.venueId, runtime.prompt.venueName);
  }

  const venue = await detectVenueFromCoords(coords);
  if (!venue) {
    await updateLocationRuntimeState((current) => ({
      ...current,
      currentVenueId: null,
      currentVenueName: null,
      dwellEnteredAt: null,
      dwellLastSeenAt: null,
    }));
    return;
  }

  const preferences = await getVenuePreferences();
  const venuePreference = preferences[venue.id];
  const sameVenue = runtime.currentVenueId === venue.id;
  const enteredAt = sameVenue && runtime.dwellEnteredAt ? runtime.dwellEnteredAt : nowIso();
  const lastSeenAt = nowIso();
  const nextPrompt =
    runtime.prompt && runtime.prompt.venueId === venue.id ? runtime.prompt : null;

  await saveLocationRuntimeState({
    ...runtime,
    permissionGranted: true,
    backgroundRegistered: true,
    currentVenueId: venue.id,
    currentVenueName: venue.name,
    dwellEnteredAt: enteredAt,
    dwellLastSeenAt: lastSeenAt,
    prompt: nextPrompt,
  });

  if (venuePreference?.muted || isCooldownActive(venuePreference?.cooldownUntil ?? null)) return;
  if (nextPrompt && !nextPrompt.responded) return;
  if (Date.now() - new Date(enteredAt).getTime() < VENUE_DWELL_MS) return;

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
  return upsertVenuePreference(venueId, venueName, (current) => ({
    ...current,
    hidden,
    updatedAt: nowIso(),
  }));
}

export async function setVenueMuted(venueId: string, venueName: string, muted: boolean) {
  return upsertVenuePreference(venueId, venueName, (current) => ({
    ...current,
    muted,
    cooldownUntil: muted ? null : current.cooldownUntil,
    updatedAt: nowIso(),
  }));
}
