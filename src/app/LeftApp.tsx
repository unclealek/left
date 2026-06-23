import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, AppState, ScrollView, Text, View } from "react-native";
import * as Notifications from "expo-notifications";
import type { Session } from "@supabase/supabase-js";
import { BackgroundWaveLayer } from "../components/left/BackgroundWaveLayer";
import { SessionFooterNav } from "../components/left/navigation";
import {
  SESSION_NAV_SCREENS,
  defaultApproachPrompt,
  defaultProfilePrompt,
  getFooterDestination,
  type FooterDestination,
  type Screen,
  type UserProfileRow,
} from "./leftConfig";
import { styles } from "./leftTheme";
import { supabase } from "../lib/supabase";
import { initialFeed, initialVenueSummary, viewerSeed } from "../mocks/seed";
import type {
  AppUser,
  ApproachAttempt,
  AuthProvider,
  AvatarStyle,
  IntentType,
  NearbyFeedItem,
  ReportCategory,
  SocialInteractionEventType,
  VenueType,
  VenueContextSummary,
} from "../types/left-domain";
import { AuthScreen } from "../screens/left/AuthScreen";
import { LoadingScreen } from "../screens/left/LoadingScreen";
import { NameScreen, AvatarScreen, LocationScreen } from "../screens/left/OnboardingScreens";
import { VenueScreen } from "../screens/left/VenueScreen";
import { HomeScreen } from "../screens/left/HomeScreen";
import { ActivationScreen } from "../screens/left/ActivationScreen";
import { FeedScreen } from "../screens/left/FeedScreen";
import { ProfileScreen } from "../screens/left/ProfileScreen";
import { ApproachScreen } from "../screens/left/ApproachScreen";
import { ApproachFeedbackPrompt } from "../screens/left/ApproachFeedbackPrompt";
import { SafetyScreen } from "../screens/left/SafetyScreen";
import { SettingsScreen } from "../screens/left/SettingsScreen";
import { MeScreen } from "../screens/left/MeScreen";
import { VenueAddScreen, VenueSelectionScreen } from "../screens/left/VenueSelectionScreen";
import {
  consumePendingActivationLaunch,
  handleVenuePromptResponse,
  loadLastActivationDefaults,
  requestLocationAccess,
  saveLastActivationDefaults,
  selectNearbyVenue,
  setVenueHidden as persistVenueHidden,
  setVenueMuted,
  storeUserSubmittedVenue,
  syncLocationRegistrationState,
} from "../features/location/location-service";
import {
  getLocationRuntimeState,
  getVenuePreferences,
  saveVenuePreferences,
  type RuntimeCoords,
  type RuntimeVenueCandidate,
  type VenuePreference,
} from "../features/location/location-storage";
import {
  fetchVenuePreferencesForUser,
  upsertVenuePreferenceForUser,
} from "../features/location/venue-preference-service";
import {
  fetchUserProfile,
  submitIdentityRemovalRequest,
  updateUserSettings,
  upsertOnboardingProfile,
} from "../features/account/account-service";
import {
  blockUserForActor,
  createApproachAttempt,
  hideUserForActor,
  markApproachConnected,
  reportUserForActor,
} from "../features/interactions/interaction-service";
import {
  clearPendingApproachFeedback,
  clearStoredActiveApproach,
  getPendingApproachFeedback,
  getStoredActiveApproach,
  savePendingApproachFeedback,
  saveStoredActiveApproach,
  type PendingApproachFeedback,
} from "../features/interactions/approach-feedback-storage";
import {
  createPresenceSession,
  endOpenPresenceSessionsForUser,
  fetchActivePresenceSession,
  fetchNearbyFeed,
  fetchVenueContextSummary,
  updatePresenceSessionEndState,
} from "../features/presence/presence-service";
import {
  deriveSocialMomentum,
  fetchSocialMomentumEvents,
  recordSocialInteractionEvent as persistSocialInteractionEvent,
} from "../features/social-momentum/social-momentum-service";
import { submitVenueForReview } from "../features/venues/venue-submission-service";
import {
  getCurrentSession,
  getFirstNameFromSession,
  getProvider,
  getProviderSubject,
  startGoogleAuthSession,
} from "../features/auth/auth-service";

function logAuthDebug(step: string, payload?: Record<string, unknown>) {
  if (payload) {
    console.info(`[auth] ${step}`, payload);
    return;
  }
  console.info(`[auth] ${step}`);
}

function normalizeVenueName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function isUuid(value: string | null | undefined): value is string {
  return !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

type VenuePreferenceAction = "hide" | "mute" | "unhide" | "unmute";
type VenuePreferenceMessage = {
  venueId: string;
  tone: "success" | "error";
  text: string;
};

const PRIVATE_VENUE_SUMMARY: VenueContextSummary = {
  venueId: "private",
  venueName: "Visibility off",
  visibleCount: 0,
  energyLevel: "quiet",
  activeVibes: [],
  popularIntents: [],
  pulseCopy: "Your venue stays private until you become visible. Turn on visibility to detect your venue and unlock nearby people.",
};

export function LeftApp() {
  const [screen, setScreen] = useState<Screen>("loading");
  const [authProvider, setAuthProvider] = useState<AuthProvider | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [feed, setFeed] = useState<NearbyFeedItem[]>(initialFeed);
  const [selectedProfile, setSelectedProfile] = useState<NearbyFeedItem | null>(null);
  const [venueSummary, setVenueSummary] = useState<VenueContextSummary>(initialVenueSummary);
  const [firstNameDraft, setFirstNameDraft] = useState("Kelvin");
  const [avatarStyleDraft, setAvatarStyleDraft] = useState<AvatarStyle>("geometric");
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [locationBusy, setLocationBusy] = useState(false);
  const [selectedIntent, setSelectedIntent] = useState<AppUser["defaultIntent"]>("networking");
  const [selectedVibes, setSelectedVibes] = useState<string[]>(["AI/startups"]);
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [hintDraft, setHintDraft] = useState("Grey hoodie, corner seat");
  const [approach, setApproach] = useState<ApproachAttempt | null>(null);
  const [venueHidden, setVenueHidden] = useState(false);
  const [sessionVisible, setSessionVisible] = useState(false);
  const [sessionStartedAt, setSessionStartedAt] = useState<string | null>(null);
  const [sessionNowMs, setSessionNowMs] = useState(() => Date.now());
  const [activePresenceSessionId, setActivePresenceSessionId] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [settingsSaveState, setSettingsSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [deletionRequestState, setDeletionRequestState] = useState<"idle" | "submitting" | "submitted" | "error">("idle");
  const [venuePreferences, setVenuePreferences] = useState<Record<string, VenuePreference>>({});
  const [venuePreferenceAction, setVenuePreferenceAction] = useState<{
    venueId: string;
    action: VenuePreferenceAction;
  } | null>(null);
  const [venuePreferenceMessage, setVenuePreferenceMessage] = useState<VenuePreferenceMessage | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [nearbyVenueOptions, setNearbyVenueOptions] = useState<RuntimeVenueCandidate[]>([]);
  const [lastKnownCoords, setLastKnownCoords] = useState<RuntimeCoords | null>(null);
  const [venueSelectionRequired, setVenueSelectionRequired] = useState(false);
  const [venueDraftName, setVenueDraftName] = useState("");
  const [venueDraftAddress, setVenueDraftAddress] = useState("");
  const [venueDraftNotes, setVenueDraftNotes] = useState("");
  const [venueDraftType, setVenueDraftType] = useState<VenueType>("other");
  const [venueDraftSubmitting, setVenueDraftSubmitting] = useState(false);
  const [reportCategory, setReportCategory] = useState<ReportCategory>("unsafe_behavior");
  const [reportNotes, setReportNotes] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [activationSubmitting, setActivationSubmitting] = useState(false);
  const [profileAction, setProfileAction] = useState<"hide" | "block" | null>(null);
  const [visibilityAction, setVisibilityAction] = useState<"pause" | "end" | null>(null);
  const [socialMomentumEvents, setSocialMomentumEvents] = useState<SocialInteractionEventType[]>([]);
  const [pendingApproachFeedback, setPendingApproachFeedback] = useState<PendingApproachFeedback | null>(null);
  const [feedbackWentOver, setFeedbackWentOver] = useState<boolean | null>(null);
  const [feedbackUsedIcebreaker, setFeedbackUsedIcebreaker] = useState<boolean | null>(null);

  const visibleFeed = useMemo(() => {
    if (!sessionVisible || venueHidden) return [];
    return feed.map((item) => ({ ...item, venueName: venueSummary.venueName }));
  }, [feed, sessionVisible, venueHidden, venueSummary.venueName]);
  const displayVenueSummary = useMemo(() => {
    if (!sessionVisible) return PRIVATE_VENUE_SUMMARY;
    if (venueHidden) {
      return {
        ...venueSummary,
        visibleCount: 0,
        pulseCopy: "This venue is hidden from discovery for now.",
      };
    }
    return venueSummary;
  }, [sessionVisible, venueHidden, venueSummary]);

  const elapsedSessionSeconds = useMemo(() => {
    if (!sessionVisible || !sessionStartedAt) return 0;
    return Math.max(0, Math.floor((sessionNowMs - new Date(sessionStartedAt).getTime()) / 1000));
  }, [sessionNowMs, sessionStartedAt, sessionVisible]);

  const socialMomentum = useMemo(
    () =>
      deriveSocialMomentum({
        sessionVisible,
        elapsedSessionSeconds,
        eventTypes: socialMomentumEvents,
      }),
    [elapsedSessionSeconds, sessionVisible, socialMomentumEvents],
  );
  const approachRemainingSeconds = useMemo(() => {
    if (!approach || approach.status !== "started") return 0;
    return Math.max(0, Math.ceil((new Date(approach.expiresAt).getTime() - sessionNowMs) / 1000));
  }, [approach, sessionNowMs]);

  function showToast(message: string) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(message);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 2400);
  }

  useEffect(() => {
    void bootstrapSession();
    void bootstrapDeviceState();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncSession(session, false);
    });
    const notificationSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      void applyNotificationResponse(response);
    });
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      subscription.unsubscribe();
      notificationSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!sessionVisible && !venueSelectionRequired && screen !== "venue-select" && screen !== "venue-add") return;
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        void refreshVenueFromRuntime();
      }
    });
    const interval = setInterval(() => {
      void refreshVenueFromRuntime();
    }, 3000);
    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, [screen, sessionVisible, venueSelectionRequired]);

  useEffect(() => {
    if (!user) return;
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        void recoverActivePresenceSession(user);
      }
    });
    return () => subscription.remove();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    void maybeLaunchFromNotification();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    void syncApproachFollowUp(user);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        void syncApproachFollowUp(user);
      }
    });
    return () => subscription.remove();
  }, [user]);

  useEffect(() => {
    if (!user || !sessionVisible || !venueSelectionRequired) return;
    if (screen === "venue" || screen === "activate" || screen === "feed") {
      setScreen("venue-select");
    }
  }, [screen, sessionVisible, user, venueSelectionRequired]);

  useEffect(() => {
    if (!sessionVisible || !sessionStartedAt) return;
    const interval = setInterval(() => {
      setSessionNowMs(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionStartedAt, sessionVisible]);

  useEffect(() => {
    void refreshVenuePreferences();
  }, [venueSummary.venueId]);

  useEffect(() => {
    if (!user || !sessionVisible || !isUuid(user.id) || !isUuid(venueSummary.venueId)) {
      if (!sessionVisible) setFeed([]);
      return;
    }
    void refreshVenueContext(venueSummary.venueId);
    void refreshNearbyFeed(user.id, venueSummary.venueId);
  }, [user?.id, venueSummary.venueId, activePresenceSessionId, sessionVisible]);

  useEffect(() => {
    if (!approach || approach.status !== "started" || approachRemainingSeconds > 0) return;
    void handleApproachWindowElapsed();
  }, [approach, approachRemainingSeconds]);

  useEffect(() => {
    if (!pendingApproachFeedback) {
      setFeedbackWentOver(null);
      setFeedbackUsedIcebreaker(null);
    }
  }, [pendingApproachFeedback]);

  async function bootstrapSession() {
    const session = await getCurrentSession();
    logAuthDebug("bootstrap session", {
      hasSession: !!session,
      userId: session?.user.id ?? null,
      provider: session?.user.app_metadata.provider ?? null,
    });
    await syncSession(session, true);
  }

  async function bootstrapDeviceState() {
    const runtime = await syncLocationRegistrationState();
    setLocationEnabled(runtime.permissionGranted);
    await refreshVenueFromRuntime();
    const defaults = await loadLastActivationDefaults();
    if (defaults) {
      setSelectedIntent(defaults.intent);
      setSelectedVibes(defaults.vibes);
      setSelectedDuration(defaults.durationMinutes);
      setHintDraft(defaults.hintText);
    }
    await refreshVenuePreferences();
  }

  async function refreshVenueFromRuntime() {
    const runtime = await getLocationRuntimeState();
    setNearbyVenueOptions(runtime.nearbyVenues);
    setLastKnownCoords(runtime.lastKnownCoords);
    setVenueSelectionRequired(runtime.nearbyVenues.length > 1 && !runtime.selectedVenueId);
    if (!runtime.currentVenueId || !runtime.currentVenueName) return;
    const currentVenueId = runtime.currentVenueId;
    const currentVenueName = runtime.currentVenueName;

    setVenueSummary((current) => {
      if (
        current.venueId === currentVenueId &&
        current.venueName === currentVenueName
      ) {
        return current;
      }

      return {
        ...current,
        venueId: currentVenueId,
        venueName: currentVenueName,
        pulseCopy:
          runtime.nearbyVenues.length > 1 && !runtime.selectedVenueId
            ? "We found multiple nearby venues. Confirm yours before going visible."
            : `You're currently at ${currentVenueName}.`,
      };
    });
  }

  async function recoverActivePresenceSession(appUser: AppUser) {
    const activeSession = await fetchActivePresenceSession(appUser.id);
    if (!activeSession) {
      setActivePresenceSessionId(null);
      setSessionVisible(false);
      setSessionStartedAt(null);
      setSocialMomentumEvents([]);
      return false;
    }

    const preferences = await loadVenuePreferences(appUser.id);
    if (preferences[activeSession.venueId]?.hidden) {
      await updatePresenceSessionEndState(activeSession.id, "session_ended");
      setActivePresenceSessionId(null);
      setSessionVisible(false);
      setSessionStartedAt(null);
      setSocialMomentumEvents([]);
      setFeed([]);
      return false;
    }

    setActivePresenceSessionId(activeSession.id);
    await refreshSocialMomentumEvents(activeSession.id, appUser.id);
    setSessionStartedAt(activeSession.startedAt);
    setSessionNowMs(Date.now());
    setSessionVisible(true);
    setSelectedIntent(activeSession.intent);
    setSelectedVibes(activeSession.vibes.length > 0 ? activeSession.vibes : ["Open"]);
    setSelectedDuration(activeSession.durationMinutes);
    setHintDraft(activeSession.hintText ?? "");
    setVenueSummary((current) => ({
      ...current,
      venueId: activeSession.venueId,
      venueName: activeSession.venueName ?? current.venueName,
    }));

    await Promise.all([
      refreshVenueContext(activeSession.venueId),
      refreshNearbyFeed(appUser.id, activeSession.venueId),
    ]);

    return true;
  }

  async function refreshVenueContext(venueId: string) {
    const context = await fetchVenueContextSummary(venueId);
    if (!context) return;

    setVenueSummary(context);
  }

  async function refreshNearbyFeed(userId: string, venueId: string) {
    setFeed(await fetchNearbyFeed(userId, venueId));
  }

  async function refreshSocialMomentumEvents(visibilitySessionId: string | null, actorUserId = user?.id ?? null) {
    if (!isUuid(actorUserId) || !isUuid(visibilitySessionId)) {
      setSocialMomentumEvents([]);
      return;
    }

    setSocialMomentumEvents(await fetchSocialMomentumEvents(actorUserId, visibilitySessionId));
  }

  async function recordSocialInteractionEvent(
    eventType: SocialInteractionEventType,
    options: {
      targetUserId?: string | null;
      visibilitySessionId?: string | null;
      metadata?: Record<string, unknown>;
    } = {},
  ) {
    if (!user || !isUuid(user.id)) return;
    const targetUserId = isUuid(options.targetUserId) ? options.targetUserId : null;
    const visibilitySessionId = isUuid(options.visibilitySessionId) ? options.visibilitySessionId : activePresenceSessionId;
    const venueId = isUuid(venueSummary.venueId) ? venueSummary.venueId : null;

    setSocialMomentumEvents((current) => [...current, eventType]);

    await persistSocialInteractionEvent({
      actorUserId: user.id,
      eventType,
      targetUserId,
      venueId,
      visibilitySessionId,
      metadata: options.metadata,
    });
  }

  async function refreshVenuePreferences() {
    const preferences = await loadVenuePreferences(user?.id ?? null);
    setVenuePreferences(preferences);
    setVenueHidden(!!preferences[venueSummary.venueId]?.hidden);
  }

  async function loadVenuePreferences(userId: string | null) {
    const localPreferences = await getVenuePreferences();
    const serverPreferences = userId ? await fetchVenuePreferencesForUser(userId) : null;
    const mergedPreferences = mergeVenuePreferences(localPreferences, serverPreferences ?? {});
    if (serverPreferences) {
      await saveVenuePreferences(mergedPreferences);
    }
    return mergedPreferences;
  }

  async function syncVenuePreferencesForUser(userId: string) {
    const localPreferences = await getVenuePreferences();
    const serverPreferences = await fetchVenuePreferencesForUser(userId);
    if (!serverPreferences) return localPreferences;

    const mergedPreferences = mergeVenuePreferences(localPreferences, serverPreferences);
    await saveVenuePreferences(mergedPreferences);

    await Promise.all(
      Object.values(mergedPreferences).map(async (preference) => {
        const serverPreference = serverPreferences[preference.venueId];
        if (serverPreference && new Date(serverPreference.updatedAt).getTime() >= new Date(preference.updatedAt).getTime()) {
          return;
        }

        await upsertVenuePreferenceForUser({
          userId,
          venueId: preference.venueId,
          venueName: preference.venueName,
          hidden: preference.hidden,
          muted: preference.muted,
          cooldownUntil: preference.cooldownUntil,
        });
      }),
    );

    return mergedPreferences;
  }

  function mergeVenuePreferences(
    localPreferences: Record<string, VenuePreference>,
    serverPreferences: Record<string, VenuePreference>,
  ) {
    const merged = { ...localPreferences };
    for (const [venueId, serverPreference] of Object.entries(serverPreferences)) {
      const localPreference = merged[venueId];
      if (!localPreference || new Date(serverPreference.updatedAt).getTime() >= new Date(localPreference.updatedAt).getTime()) {
        merged[venueId] = serverPreference;
      }
    }
    return merged;
  }

  async function syncApproachFollowUp(appUser: AppUser) {
    const pending = await getPendingApproachFeedback(appUser.id);
    if (pending) {
      setPendingApproachFeedback(pending);
      return;
    }

    const storedApproach = await getStoredActiveApproach(appUser.id);
    if (!storedApproach) return;
    if (Date.now() < new Date(storedApproach.expiresAt).getTime()) return;

    const nextPending: PendingApproachFeedback = {
      userId: storedApproach.userId,
      approachId: storedApproach.approachId,
      targetUserId: storedApproach.targetUserId,
      targetFirstName: storedApproach.targetFirstName,
      presenceSessionId: storedApproach.presenceSessionId,
      approachPrompt: storedApproach.approachPrompt,
      startedAt: storedApproach.startedAt,
      expiresAt: storedApproach.expiresAt,
      createdAt: new Date().toISOString(),
    };

    await savePendingApproachFeedback(nextPending);
    await clearStoredActiveApproach();
    setPendingApproachFeedback(nextPending);
  }

  async function handleApproachWindowElapsed() {
    if (!approach || approach.status !== "started" || !user) return;

    const storedApproach = await getStoredActiveApproach(user.id);
    const nextPending: PendingApproachFeedback | null = storedApproach
      ? {
          userId: storedApproach.userId,
          approachId: storedApproach.approachId,
          targetUserId: storedApproach.targetUserId,
          targetFirstName: storedApproach.targetFirstName,
          presenceSessionId: storedApproach.presenceSessionId,
          approachPrompt: storedApproach.approachPrompt,
          startedAt: storedApproach.startedAt,
          expiresAt: storedApproach.expiresAt,
          createdAt: new Date().toISOString(),
        }
      : selectedProfile
        ? {
            userId: user.id,
            approachId: approach.id,
            targetUserId: selectedProfile.profileUserId,
            targetFirstName: selectedProfile.firstName,
            presenceSessionId: approach.presenceSessionId,
            approachPrompt: user.approachPrompt || defaultApproachPrompt,
            startedAt: approach.startedAt,
            expiresAt: approach.expiresAt,
            createdAt: new Date().toISOString(),
          }
        : null;

    if (!nextPending) return;

    await savePendingApproachFeedback(nextPending);
    await clearStoredActiveApproach();
    setApproach((current) => (current ? { ...current, status: "confirmed_going", updatedAt: new Date().toISOString() } : current));
    if (screen === "approach") {
      setScreen("feed");
    }
  }

  async function submitApproachFeedback() {
    if (!pendingApproachFeedback) return;
    if (feedbackWentOver === null) return;
    if (feedbackWentOver === true && feedbackUsedIcebreaker === null) return;

    await clearPendingApproachFeedback();
    setPendingApproachFeedback(null);
    setApproach(null);
    Alert.alert(
      "Feedback saved",
      feedbackWentOver
        ? feedbackUsedIcebreaker
          ? "Great — noted that you went over and used the icebreaker."
          : "Got it — noted that you went over without using the icebreaker."
        : "Got it — noted that you didn’t end up going over.",
    );
  }

  async function maybeLaunchFromNotification() {
    const shouldLaunch = await consumePendingActivationLaunch();
    if (shouldLaunch) {
      setScreen("activate");
    }
  }

  async function applyNotificationResponse(response: Notifications.NotificationResponse) {
    const result = await handleVenuePromptResponse(response);
    if (result.action === "activate") {
      setScreen("activate");
      return;
    }
    if (result.action === "cooldown") {
      await refreshVenuePreferences();
    }
  }

  async function confirmVenueSelection(venueId: string) {
    const selected = await selectNearbyVenue(venueId);
    if (!selected) {
      Alert.alert("Venue unavailable", "That nearby venue is no longer available. Try again from the refreshed list.");
      await refreshVenueFromRuntime();
      return;
    }
    await refreshVenueFromRuntime();
    setScreen(sessionVisible ? "venue" : "activate");
  }

  async function submitVenueSuggestion() {
    if (!user || !lastKnownCoords) {
      Alert.alert("Venue location missing", "Move around the venue once so Left has a recent device location.");
      return;
    }
    if (!venueDraftName.trim() || !venueDraftAddress.trim()) {
      Alert.alert("Missing venue details", "Add both a venue name and an address or landmark.");
      return;
    }

    const submittedName = venueDraftName.trim();
    const duplicateVenue = nearbyVenueOptions.find(
      (venue) => normalizeVenueName(venue.name) === normalizeVenueName(submittedName),
    );
    if (duplicateVenue) {
      setVenueDraftSubmitting(false);
      await confirmVenueSelection(duplicateVenue.id);
      Alert.alert("Venue already exists", `${duplicateVenue.name} is already pinned nearby, so Left reused it instead of creating a duplicate.`);
      return;
    }

    setVenueDraftSubmitting(true);
    const submittedVenue = await submitVenueForReview({
      submittedBy: user.id,
      name: submittedName,
      type: venueDraftType,
      addressText: venueDraftAddress.trim(),
      notes: venueDraftNotes.trim() || null,
      latitude: lastKnownCoords.latitude,
      longitude: lastKnownCoords.longitude,
    });

    if (!submittedVenue) {
      setVenueDraftSubmitting(false);
      Alert.alert("Venue submission failed", "We could not submit that venue yet.");
      return;
    }

    await storeUserSubmittedVenue({
      id: `submission:${submittedVenue.id}`,
      name: submittedVenue.name,
      latitude: lastKnownCoords.latitude,
      longitude: lastKnownCoords.longitude,
      radiusMeters: 60,
      source: "user_submission",
      distanceMeters: 0,
    });

    setVenueDraftSubmitting(false);
    setVenueDraftName("");
    setVenueDraftAddress("");
    setVenueDraftNotes("");
    setVenueDraftType("other");
    await refreshVenueFromRuntime();
    Alert.alert("Venue submitted", "Your venue was saved as a pending submission and is available for your current session.");
    setScreen("home");
  }

  async function syncSession(session: Session | null, isInitialLoad: boolean) {
    setAuthError(null);
    logAuthDebug("sync session", {
      hasSession: !!session,
      isInitialLoad,
      userId: session?.user.id ?? null,
      provider: session?.user.app_metadata.provider ?? null,
    });
    if (!session) {
      setUser(null);
      setAuthProvider(null);
      setScreen("auth");
      return;
    }

    const provider = getProvider(session);
    const inferredFirstName = getFirstNameFromSession(session);
    setAuthProvider(provider);
    setFirstNameDraft(inferredFirstName);

    const { profile, error } = await fetchUserProfile(session.user.id);
    if (error) {
      logAuthDebug("profile lookup failed", { message: error.message, code: error.code });
      setAuthError("Could not load your profile.");
      setScreen("auth");
      return;
    }

    logAuthDebug("profile lookup complete", {
      hasProfile: !!profile,
      identityRemoved: profile?.identity_removed ?? null,
      onboardingCompleted: profile?.onboarding_completed ?? null,
    });
    if (profile?.identity_removed) {
      logAuthDebug("identity removed account detected", { userId: profile.id });
      await forceLocalSignOut();
      setAuthError("This account has been removed.");
      return;
    }
    if (!profile || !profile.onboarding_completed) {
      setUser(null);
      setScreen("onboarding-name");
      return;
    }

    const appUser = mapProfileToAppUser(profile);
    setUser(appUser);
    setFirstNameDraft(profile.first_name);
    setAuthProvider(profile.auth_provider);
    const syncedVenuePreferences = await syncVenuePreferencesForUser(appUser.id);
    setVenuePreferences(syncedVenuePreferences);
    setVenueHidden(!!syncedVenuePreferences[venueSummary.venueId]?.hidden);
    if (isInitialLoad) {
      setScreen("loading");
      await delay(2000);
    }
    const recoveredActiveSession = await recoverActivePresenceSession(appUser);
    setScreen(recoveredActiveSession ? "activate" : "home");
  }

  async function startGoogleAuth() {
    setAuthError(null);
    const result = await startGoogleAuthSession(logAuthDebug);
    if (result.status === "failed") setAuthError(result.message);
  }

  async function finishOnboarding() {
    const session = await getCurrentSession();
    if (!session) {
      setAuthError("Sign in again to finish onboarding.");
      setScreen("auth");
      return;
    }

    setLocationBusy(true);
    const locationResult = await requestLocationAccess();
    setLocationEnabled(locationResult.granted);
    if (!locationResult.granted) {
      setLocationBusy(false);
      setAuthError(
        locationResult.reason === "registration_failed"
          ? "Background location could not start on this device yet."
          : "Background location is required to detect social venues.",
      );
      return;
    }

    const provider = getProvider(session);
    const nextUser: AppUser = {
      ...viewerSeed,
      id: session.user.id,
      authProvider: provider,
      providerSubject: getProviderSubject(session, provider),
      firstName: firstNameDraft.trim() || getFirstNameFromSession(session),
      avatarStyle: avatarStyleDraft,
      onboardingCompleted: true,
    };

    const saved = await upsertOnboardingProfile(nextUser);
    if (!saved) {
      setLocationBusy(false);
      setAuthError("We could not save onboarding yet.");
      return;
    }

    setUser(nextUser);
    setLocationBusy(false);
    setScreen("venue");
  }

  function toggleVibe(vibe: string) {
    setSelectedVibes((current) => {
      const exists = current.includes(vibe);
      if (exists) return current.filter((v) => v !== vibe);
      if (current.length >= 2) return [current[0], vibe];
      return [...current, vibe];
    });
  }

  async function activatePresence() {
    if (!user) return;
    if (activationSubmitting) return;
    if (venueSelectionRequired) {
      setScreen("venue-select");
      return;
    }
    if (venueHidden) {
      Alert.alert("Venue hidden", "Unhide this venue in Settings before becoming visible here again.");
      return;
    }
    if (!isUuid(venueSummary.venueId)) {
      Alert.alert("Venue not ready", "Left needs a confirmed nearby venue before visibility can start.");
      return;
    }
    const startedAtDate = new Date();
    const startedAt = startedAtDate.toISOString();
    const expiresAt = new Date(startedAtDate.getTime() + selectedDuration * 60_000).toISOString();
    const intent = selectedIntent ?? "networking";
    const vibes = selectedVibes.length > 0 ? selectedVibes : ["Open"];
    const hintText = hintDraft.trim() || null;
    setActivationSubmitting(true);

    try {
      void saveLastActivationDefaults({
        intent,
        vibes,
        durationMinutes: selectedDuration,
        hintText: hintDraft,
      });

      if (isUuid(user.id) && isUuid(venueSummary.venueId)) {
        await endOpenPresenceSessionsForUser(user.id);
        const presenceSessionId = await createPresenceSession({
          userId: user.id,
          venueId: venueSummary.venueId,
          intent,
          vibes,
          hintText,
          startedAt,
          expiresAt,
        });

        if (!presenceSessionId) {
          Alert.alert("Could not start visibility", "Your session was not saved. Try again before becoming visible.");
          return;
        }

        setActivePresenceSessionId(presenceSessionId);
        void recordSocialInteractionEvent("became_visible", { visibilitySessionId: presenceSessionId });
        await refreshVenueContext(venueSummary.venueId);
        await refreshNearbyFeed(user.id, venueSummary.venueId);
      } else {
        setActivePresenceSessionId(null);
        setSocialMomentumEvents([]);
      }

      setSessionNowMs(Date.now());
      setSessionStartedAt(startedAt);
      setSessionVisible(true);
      setVenueSummary((current) => ({
        ...current,
        visibleCount: Math.max(1, current.visibleCount),
        pulseCopy: "1 person is active nearby right now.",
      }));
      showToast("You are visible");
      setScreen("activate");
    } catch {
      Alert.alert("Could not start visibility", "Please try again.");
    } finally {
      setActivationSubmitting(false);
    }
  }

  function openProfile(item: NearbyFeedItem) {
    setSelectedProfile(item);
    void recordSocialInteractionEvent("profile_viewed", {
      targetUserId: item.profileUserId,
      visibilitySessionId: activePresenceSessionId ?? item.presenceSessionId,
    });
    setScreen("profile");
  }

  function handleSocialMomentumPrimary() {
    setScreen("feed");
  }

  function dismissSocialMomentumPrompt() {
    void recordSocialInteractionEvent("prompt_dismissed");
  }

  async function startApproach() {
    if (!selectedProfile || !user) return;
    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + 60_000);
    let approachId = "approach-1";

    if (isUuid(user.id) && isUuid(selectedProfile.profileUserId) && isUuid(selectedProfile.presenceSessionId)) {
      const persistedApproachId = await createApproachAttempt({
        fromUserId: user.id,
        toUserId: selectedProfile.profileUserId,
        presenceSessionId: selectedProfile.presenceSessionId,
        startedAt: startedAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
      });

      if (!persistedApproachId) {
        Alert.alert("Could not start approach", "Please try again.");
        return;
      }

      approachId = persistedApproachId;
    }

    await saveStoredActiveApproach({
      userId: user.id,
      approachId,
      targetUserId: selectedProfile.profileUserId,
      targetFirstName: selectedProfile.firstName,
      presenceSessionId: selectedProfile.presenceSessionId,
      approachPrompt: user.approachPrompt || defaultApproachPrompt,
      startedAt: startedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
    });

    void recordSocialInteractionEvent("approach_started", {
      targetUserId: selectedProfile.profileUserId,
      visibilitySessionId: activePresenceSessionId ?? selectedProfile.presenceSessionId,
      metadata: { approachId },
    });
    setApproach({
      id: approachId,
      fromUserId: user.id,
      toUserId: selectedProfile.profileUserId,
      presenceSessionId: selectedProfile.presenceSessionId,
      status: "started",
      startedAt: startedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      completedAt: null,
      cancelledAt: null,
      createdAt: startedAt.toISOString(),
      updatedAt: startedAt.toISOString(),
    });
    setScreen("approach");
  }

  async function confirmConnected() {
    const completedAt = new Date().toISOString();
    await clearStoredActiveApproach();
    await clearPendingApproachFeedback();
    setPendingApproachFeedback(null);
    if (approach && isUuid(approach.id)) {
      const updated = await markApproachConnected({
        approachId: approach.id,
        completedAt,
      });

      if (!updated) {
        Alert.alert("Could not confirm connection", "Please try again.");
        return;
      }
    }

    void recordSocialInteractionEvent("approach_connected", {
      targetUserId: approach?.toUserId ?? selectedProfile?.profileUserId ?? null,
      visibilitySessionId: activePresenceSessionId ?? approach?.presenceSessionId ?? null,
      metadata: { approachId: approach?.id ?? null },
    });
    setApproach((current) =>
      current ? { ...current, status: "connected", completedAt } : current,
    );
    setScreen("feed");
  }

  async function hideUser() {
    if (!selectedProfile) return;
    if (profileAction) return;
    setProfileAction("hide");
    const targetUserId = selectedProfile.profileUserId;
    try {
      if (user && isUuid(user.id) && isUuid(targetUserId)) {
        const hidden = await hideUserForActor({
          actorUserId: user.id,
          targetUserId,
        });

        if (!hidden) {
          Alert.alert("Could not hide person", "Please try again.");
          return;
        }
      }

      void recordSocialInteractionEvent("user_hidden", {
        targetUserId,
        visibilitySessionId: activePresenceSessionId ?? selectedProfile.presenceSessionId,
      });
      setFeed((current) => current.filter((item) => item.profileUserId !== selectedProfile.profileUserId));
      setSelectedProfile(null);
      setScreen("feed");
      showToast("Person hidden");
    } finally {
      setProfileAction(null);
    }
  }

  async function blockUser() {
    if (!selectedProfile || !user) return;
    if (profileAction) return;
    setProfileAction("block");
    const targetUserId = selectedProfile.profileUserId;

    try {
      if (isUuid(user.id) && isUuid(targetUserId)) {
        const blocked = await blockUserForActor({
          actorUserId: user.id,
          targetUserId,
          reason: "user_blocked_from_profile",
        });

        if (!blocked) {
          Alert.alert("Could not block person", "Please try again.");
          return;
        }
      }

      void recordSocialInteractionEvent("user_blocked", {
        targetUserId,
        visibilitySessionId: activePresenceSessionId ?? selectedProfile.presenceSessionId,
      });
      setFeed((current) => current.filter((item) => item.profileUserId !== targetUserId));
      setSelectedProfile(null);
      setScreen("feed");
      showToast("Person blocked");
    } finally {
      setProfileAction(null);
    }
  }

  async function reportUser(category: ReportCategory = reportCategory, notes = reportNotes) {
    if (!selectedProfile || !user) return;
    if (reportSubmitting) return;
    const targetUserId = selectedProfile.profileUserId;
    const presenceSessionId = isUuid(selectedProfile.presenceSessionId) ? selectedProfile.presenceSessionId : null;

    setReportSubmitting(true);
    if (isUuid(user.id) && isUuid(targetUserId)) {
      const reported = await reportUserForActor({
        actorUserId: user.id,
        targetUserId,
        presenceSessionId,
        category,
        notes,
      });

      if (!reported) {
        setReportSubmitting(false);
        Alert.alert("Could not submit report", "Please try again.");
        return;
      }
    }

    void recordSocialInteractionEvent("user_reported", {
      targetUserId,
      visibilitySessionId: activePresenceSessionId ?? presenceSessionId,
      metadata: { category },
    });
    setReportSubmitting(false);
    setReportCategory("unsafe_behavior");
    setReportNotes("");
    setFeed((current) => current.filter((item) => item.profileUserId !== targetUserId));
    setSelectedProfile(null);
    setScreen("feed");
    showToast("Report submitted");
  }

  async function hideVenuePermanently() {
    const venueId = venueSummary.venueId;
    const venueName = venueSummary.venueName;
    setVenuePreferenceAction({ venueId, action: "hide" });
    setVenuePreferenceMessage(null);

    try {
      await persistVenueHidden(venueId, venueName, true);
      let synced = true;
      if (user) {
        const savedPreference = await upsertVenuePreferenceForUser({
          userId: user.id,
          venueId,
          venueName,
          hidden: true,
          muted: !!currentVenuePreference?.muted,
          cooldownUntil: currentVenuePreference?.cooldownUntil ?? null,
        });

        synced = !!savedPreference || !isUuid(user.id) || !isUuid(venueId);
      }

      if (sessionVisible) {
        await endSessionState("session_ended", { toast: false });
      }
      setVenueHidden(true);
      setFeed([]);
      await refreshVenuePreferences();
      setVenuePreferenceMessage({
        venueId,
        tone: synced ? "success" : "error",
        text: synced
          ? `${venueName} is hidden. You will not be visible there until you unhide it.`
          : `${venueName} is hidden on this device, but server sync did not complete.`,
      });
      showToast(synced ? "Venue hidden" : "Venue hidden on this device");
      setScreen("venue");
    } catch {
      setVenuePreferenceMessage({
        venueId,
        tone: "error",
        text: `We could not hide ${venueName}. Please try again.`,
      });
    } finally {
      setVenuePreferenceAction(null);
    }
  }

  async function muteVenueNotifications() {
    const venueId = venueSummary.venueId;
    const venueName = venueSummary.venueName;
    setVenuePreferenceAction({ venueId, action: "mute" });
    setVenuePreferenceMessage(null);

    try {
      await setVenueMuted(venueId, venueName, true);
      let synced = true;
      if (user) {
        const savedPreference = await upsertVenuePreferenceForUser({
          userId: user.id,
          venueId,
          venueName,
          hidden: !!currentVenuePreference?.hidden,
          muted: true,
          cooldownUntil: null,
        });

        synced = !!savedPreference || !isUuid(user.id) || !isUuid(venueId);
      }

      await refreshVenuePreferences();
      setVenuePreferenceMessage({
        venueId,
        tone: synced ? "success" : "error",
        text: synced
          ? `Notifications are off at ${venueName}.`
          : `Notifications are off on this device, but server sync did not complete.`,
      });
      showToast(synced ? "Notifications muted" : "Notifications muted on this device");
    } catch {
      setVenuePreferenceMessage({
        venueId,
        tone: "error",
        text: `We could not mute ${venueName}. Please try again.`,
      });
    } finally {
      setVenuePreferenceAction(null);
    }
  }

  async function clearVenueHidden(venueId: string, venueName: string) {
    setVenuePreferenceAction({ venueId, action: "unhide" });
    setVenuePreferenceMessage(null);

    try {
      await persistVenueHidden(venueId, venueName, false);
      let synced = true;
      if (user) {
        const preference = venuePreferences[venueId];
        const savedPreference = await upsertVenuePreferenceForUser({
          userId: user.id,
          venueId,
          venueName,
          hidden: false,
          muted: !!preference?.muted,
          cooldownUntil: preference?.cooldownUntil ?? null,
        });

        synced = !!savedPreference || !isUuid(user.id) || !isUuid(venueId);
      }
      if (venueSummary.venueId === venueId) {
        setVenueHidden(false);
      }
      await refreshVenuePreferences();
      setVenuePreferenceMessage({
        venueId,
        tone: synced ? "success" : "error",
        text: synced
          ? `${venueName} is unhidden. You can become visible there again.`
          : `${venueName} is unhidden on this device, but server sync did not complete.`,
      });
      showToast(synced ? "Venue unhidden" : "Venue unhidden on this device");
    } catch {
      setVenuePreferenceMessage({
        venueId,
        tone: "error",
        text: `We could not unhide ${venueName}. Please try again.`,
      });
    } finally {
      setVenuePreferenceAction(null);
    }
  }

  async function clearVenueMuted(venueId: string, venueName: string) {
    setVenuePreferenceAction({ venueId, action: "unmute" });
    setVenuePreferenceMessage(null);

    try {
      await setVenueMuted(venueId, venueName, false);
      let synced = true;
      if (user) {
        const preference = venuePreferences[venueId];
        const savedPreference = await upsertVenuePreferenceForUser({
          userId: user.id,
          venueId,
          venueName,
          hidden: !!preference?.hidden,
          muted: false,
          cooldownUntil: preference?.cooldownUntil ?? null,
        });

        synced = !!savedPreference || !isUuid(user.id) || !isUuid(venueId);
      }
      await refreshVenuePreferences();
      setVenuePreferenceMessage({
        venueId,
        tone: synced ? "success" : "error",
        text: synced
          ? `Notifications are back on for ${venueName}.`
          : `Notifications are back on locally, but server sync did not complete.`,
      });
      showToast(synced ? "Notifications on" : "Notifications on locally");
    } catch {
      setVenuePreferenceMessage({
        venueId,
        tone: "error",
        text: `We could not update notifications for ${venueName}. Please try again.`,
      });
    } finally {
      setVenuePreferenceAction(null);
    }
  }

  async function saveSettings(input: {
    firstName: string;
    avatarStyle: AvatarStyle;
    defaultIntent: AppUser["defaultIntent"];
    defaultVibes: string[];
    profilePrompt: string;
    approachPrompt: string;
  }) {
    if (!user) return;
    setSettingsSaveState("saving");
    const nextUser: AppUser = {
      ...user,
      firstName: input.firstName.trim() || user.firstName,
      avatarStyle: input.avatarStyle,
      defaultIntent: input.defaultIntent,
      defaultVibes: input.defaultVibes,
      profilePrompt: input.profilePrompt.trim() || defaultProfilePrompt,
      approachPrompt: input.approachPrompt.trim() || defaultApproachPrompt,
      updatedAt: new Date().toISOString(),
    };
    const saved = await updateUserSettings({
      userId: user.id,
      firstName: nextUser.firstName,
      avatarStyle: nextUser.avatarStyle,
      defaultIntent: nextUser.defaultIntent,
      defaultVibes: nextUser.defaultVibes,
      profilePrompt: nextUser.profilePrompt,
      approachPrompt: nextUser.approachPrompt,
    });
    if (!saved) {
      setSettingsSaveState("error");
      return;
    }
    setUser(nextUser);
    setFirstNameDraft(nextUser.firstName);
    setAvatarStyleDraft(nextUser.avatarStyle);
    setSelectedIntent(nextUser.defaultIntent);
    setSelectedVibes(nextUser.defaultVibes);
    setSettingsSaveState("saved");
    showToast("Profile saved");
    setTimeout(() => setSettingsSaveState("idle"), 1500);
  }

  async function signOut() {
    await supabase.auth.signOut();
    clearLocalSessionState();
  }

  async function forceLocalSignOut() {
    await supabase.auth.signOut();
    clearLocalSessionState();
  }

  function clearLocalSessionState() {
    setUser(null);
    setAuthProvider(null);
    setSelectedProfile(null);
    void endSessionState("session_ended", { toast: false });
    setApproach(null);
    setAuthError(null);
    setSettingsSaveState("idle");
    setDeletionRequestState("idle");
    setReportSubmitting(false);
    setActivationSubmitting(false);
    setProfileAction(null);
    setVisibilityAction(null);
    setReportCategory("unsafe_behavior");
    setReportNotes("");
    setScreen("auth");
  }

  async function endSessionState(
    status: "paused" | "session_ended" = "session_ended",
    options: { toast?: boolean } = {},
  ) {
    if (visibilityAction) return;
    setVisibilityAction(status === "paused" ? "pause" : "end");
    const sessionId = activePresenceSessionId;
    try {
      setSessionVisible(false);
      setSessionStartedAt(null);
      setActivePresenceSessionId(null);
      setSocialMomentumEvents([]);
      setSessionNowMs(Date.now());
      setSelectedProfile(null);
      setFeed([]);

      if (isUuid(sessionId)) {
        const updated = await updatePresenceSessionEndState(sessionId, status);

        if (!updated) {
          Alert.alert("Could not update visibility", "Your local session is hidden, but the server did not confirm the change.");
        }
      }
      if (options.toast !== false) {
        showToast(status === "paused" ? "Visibility paused" : "Session ended");
      }
    } finally {
      setVisibilityAction(null);
    }
  }

  async function requestAccountDeletion() {
    if (!user) return;
    Alert.alert(
      "Request identity removal",
      "We will start a request to remove your direct identity details.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send request",
          style: "destructive",
          onPress: () => {
            void submitAccountDeletionRequest();
          },
        },
      ],
    );
  }

  async function submitAccountDeletionRequest() {
    if (!user) return;
    setDeletionRequestState("submitting");
    const result = await submitIdentityRemovalRequest(user);

    if (result === "duplicate") {
      setDeletionRequestState("submitted");
      Alert.alert("Identity removal", "You already have an open identity-removal request.");
      return;
    }

    if (result === "failed") {
      setDeletionRequestState("error");
      Alert.alert("Identity removal failed", "We could not create your identity-removal request.");
      return;
    }

    if (result === "queued") {
      setDeletionRequestState("submitted");
      Alert.alert(
        "Identity removal queued",
        "We recorded your request, but backend processing did not finish yet. Your request is still on file for follow-up.",
        [
          {
            text: "OK",
            onPress: () => {
              void signOut();
            },
          },
        ],
      );
      return;
    }

    setDeletionRequestState("submitted");
    Alert.alert(
      "Identity removed",
      "Direct identity fields were removed. Your retained records stay in place under the current policy.",
      [
        {
          text: "OK",
          onPress: () => {
            void signOut();
          },
        },
      ],
    );
  }

  function goToFooterDestination(destination: FooterDestination) {
    if (destination === "home") {
      setSelectedProfile(null);
      setScreen("home");
      return;
    }
    if (destination === "nearby") {
      setSelectedProfile(null);
      setScreen(sessionVisible ? "feed" : "activate");
      return;
    }
    if (destination === "session") {
      setSelectedProfile(null);
      setScreen("activate");
      return;
    }
    setSelectedProfile(null);
    setScreen("me");
  }

  const footerSummary = {
    venueName: displayVenueSummary.venueName,
    intent: selectedIntent,
    vibe: selectedVibes[0] ?? "Open",
    sessionVisible,
    activeDestination: getFooterDestination(screen),
  };
  const currentVenuePreference = venuePreferences[venueSummary.venueId];
  const currentVenuePreferenceAction =
    venuePreferenceAction?.venueId === venueSummary.venueId ? venuePreferenceAction.action : null;
  const safetyVenueAction =
    currentVenuePreferenceAction === "hide"
      ? "hiding"
      : currentVenuePreferenceAction === "mute"
        ? "muting"
        : null;
  const currentVenuePreferenceMessage =
    venuePreferenceMessage?.venueId === venueSummary.venueId ? venuePreferenceMessage : null;
  const locationStatus = locationEnabled
    ? "Background location is active. Venue matching runs on-device and only venue IDs are used for app state."
    : "Background location is not enabled yet.";

  return (
    <View style={styles.shell}>
      <BackgroundWaveLayer />
      <View style={styles.grain} pointerEvents="none" />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          (screen === "auth" || screen === "loading") && styles.fullContent,
          SESSION_NAV_SCREENS.includes(screen) && styles.contentWithFooter,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {screen === "loading" && <LoadingScreen />}
        {screen === "auth" && <AuthScreen authError={authError} onAuth={startGoogleAuth} />}
        {screen === "onboarding-name" && (
          <NameScreen firstNameDraft={firstNameDraft} onChangeFirstName={setFirstNameDraft} onContinue={() => setScreen("onboarding-avatar")} />
        )}
        {screen === "onboarding-avatar" && (
          <AvatarScreen avatarStyle={avatarStyleDraft} onPick={setAvatarStyleDraft} onContinue={() => setScreen("onboarding-location")} />
        )}
        {screen === "onboarding-location" && (
          <LocationScreen authError={authError} enabled={locationEnabled} busy={locationBusy} onToggle={() => setLocationEnabled((current) => !current)} onContinue={() => void finishOnboarding()} />
        )}
        {screen === "venue-select" && (
          <VenueSelectionScreen
            venues={nearbyVenueOptions}
            currentVenueId={venueSummary.venueId}
            onSelectVenue={(venueId) => void confirmVenueSelection(venueId)}
            onAddVenue={() => setScreen("venue-add")}
          />
        )}
        {screen === "venue-add" && (
          <VenueAddScreen
            name={venueDraftName}
            address={venueDraftAddress}
            notes={venueDraftNotes}
            venueType={venueDraftType}
            submitting={venueDraftSubmitting}
            onChangeName={setVenueDraftName}
            onChangeAddress={setVenueDraftAddress}
            onChangeNotes={setVenueDraftNotes}
            onChangeVenueType={setVenueDraftType}
            onSubmit={() => void submitVenueSuggestion()}
            onBack={() => setScreen("venue-select")}
          />
        )}
        {screen === "home" && (
          <HomeScreen
            firstName={user?.firstName ?? "there"}
            onBecomeVisible={() => setScreen("venue")}
            onOpenNearby={() => setScreen(sessionVisible ? "feed" : "venue")}
            onOpenSafety={() => setScreen("safety")}
            onComingSoon={showToast}
          />
        )}
        {screen === "venue" && (
          <VenueScreen
            venue={displayVenueSummary}
            feed={visibleFeed}
            socialMomentum={sessionVisible ? socialMomentum : null}
            sessionVisible={sessionVisible}
            venueHidden={venueHidden}
            allowVenueActions={sessionVisible}
            canChooseVenue={sessionVisible && nearbyVenueOptions.length > 1}
            onActivate={() => setScreen("activate")}
            onOpenFeed={() => setScreen(sessionVisible ? "feed" : "activate")}
            onOpenProfile={openProfile}
            onSocialMomentumPrimary={handleSocialMomentumPrimary}
            onDismissSocialMomentum={dismissSocialMomentumPrompt}
            onChooseVenue={() => setScreen("venue-select")}
            onAddVenue={() => setScreen("venue-add")}
            onOpenSafety={() => setScreen("safety")}
          />
        )}
        {screen === "activate" && (
          <ActivationScreen
            sessionVisible={sessionVisible}
            venueHidden={venueHidden}
            selectedIntent={selectedIntent}
            selectedVibes={selectedVibes}
            selectedDuration={selectedDuration}
            hintDraft={hintDraft}
            elapsedSeconds={elapsedSessionSeconds}
            activationSubmitting={activationSubmitting}
            endingSession={visibilityAction === "end"}
            onPickIntent={setSelectedIntent}
            onToggleVibe={toggleVibe}
            onPickDuration={setSelectedDuration}
            onChangeHint={setHintDraft}
            onActivate={activatePresence}
            onOpenFeed={() => setScreen("feed")}
            onEndSession={() => {
              endSessionState();
              setScreen("venue");
            }}
          />
        )}
        {screen === "feed" && (
          <FeedScreen venue={displayVenueSummary} feed={visibleFeed} sessionVisible={sessionVisible} onOpenProfile={openProfile} onOpenSafety={() => setScreen("safety")} />
        )}
        {screen === "profile" && selectedProfile && (
          <ProfileScreen
            item={selectedProfile}
            reportCategory={reportCategory}
            reportNotes={reportNotes}
            reportSubmitting={reportSubmitting}
            profileAction={profileAction}
            onBack={() => setScreen("feed")}
            onApproach={() => void startApproach()}
            onHide={() => void hideUser()}
            onBlock={() => void blockUser()}
            onChangeReportCategory={setReportCategory}
            onChangeReportNotes={setReportNotes}
            onReport={() => void reportUser()}
            onOpenSafety={() => setScreen("safety")}
          />
        )}
        {screen === "approach" && selectedProfile && approach && (
          <ApproachScreen
            item={selectedProfile}
            approachPrompt={user?.approachPrompt ?? defaultApproachPrompt}
            remainingSeconds={approachRemainingSeconds}
            onCancel={() => setScreen("feed")}
            onConfirmConnected={() => void confirmConnected()}
            onOpenSafety={() => setScreen("safety")}
          />
        )}
        {screen === "safety" && (
          <SafetyScreen
            venueName={sessionVisible ? venueSummary.venueName : "current venue"}
            venueMuted={!!currentVenuePreference?.muted}
            venueAction={safetyVenueAction}
            venueMessage={currentVenuePreferenceMessage}
            venuePreferences={Object.values(venuePreferences).filter((preference) => preference.hidden || preference.muted)}
            venuePreferenceAction={venuePreferenceAction}
            venuePreferenceMessage={venuePreferenceMessage}
            locationStatus={locationStatus}
            visibilityAction={visibilityAction}
            sessionVisible={sessionVisible}
            onBack={() => setScreen(selectedProfile && sessionVisible ? "profile" : sessionVisible ? "feed" : "venue")}
            onPauseVisibility={() => void endSessionState("paused")}
            onEndSession={() => {
              void endSessionState();
              setScreen("venue");
            }}
            onHideVenue={() => void hideVenuePermanently()}
            onMuteVenue={() => void muteVenueNotifications()}
            onClearVenueHidden={(venueId, venueName) => void clearVenueHidden(venueId, venueName)}
            onClearVenueMuted={(venueId, venueName) => void clearVenueMuted(venueId, venueName)}
          />
        )}
        {screen === "settings" && user && (
          <SettingsScreen
            user={user}
            deletionState={deletionRequestState}
            onOpenSafety={() => setScreen("safety")}
            onSignOut={() => void signOut()}
            onRequestDeletion={() => void requestAccountDeletion()}
            onBack={() => setScreen("me")}
          />
        )}
        {screen === "me" && user && (
          <MeScreen
            user={user}
            saveState={settingsSaveState}
            onSave={(input) => void saveSettings(input)}
            onOpenSettings={() => setScreen("settings")}
          />
        )}
      </ScrollView>
      {SESSION_NAV_SCREENS.includes(screen) && (
        <SessionFooterNav
          venueName={footerSummary.venueName}
          vibe={footerSummary.vibe}
          intent={footerSummary.intent}
          sessionVisible={footerSummary.sessionVisible}
          activeDestination={footerSummary.activeDestination}
          onNavigate={goToFooterDestination}
        />
      )}
      {pendingApproachFeedback ? (
        <ApproachFeedbackPrompt
          feedback={pendingApproachFeedback}
          wentOver={feedbackWentOver}
          usedIcebreaker={feedbackUsedIcebreaker}
          onSetWentOver={(value) => {
            setFeedbackWentOver(value);
            if (!value) setFeedbackUsedIcebreaker(null);
          }}
          onSetUsedIcebreaker={setFeedbackUsedIcebreaker}
          onSubmit={() => void submitApproachFeedback()}
          onLater={() => setPendingApproachFeedback(null)}
        />
      ) : null}
      {toastMessage ? (
        <View pointerEvents="none" style={styles.toast}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      ) : null}
    </View>
  );
}

function mapProfileToAppUser(profile: UserProfileRow): AppUser {
  return {
    id: profile.id,
    authProvider: profile.auth_provider,
    providerSubject: profile.provider_subject,
    firstName: profile.first_name,
    avatarStyle: profile.avatar_style,
    defaultIntent: profile.default_intent,
    defaultVibes: profile.default_vibes,
    profilePrompt: profile.profile_prompt,
    approachPrompt: profile.approach_prompt,
    focusModeEnabled: profile.focus_mode_enabled,
    promptsEnabled: profile.prompts_enabled,
    identityRemoved: profile.identity_removed,
    onboardingCompleted: profile.onboarding_completed,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
