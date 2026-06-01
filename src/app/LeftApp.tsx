import { useEffect, useMemo, useState } from "react";
import { Alert, AppState, ScrollView, Text, View } from "react-native";
import * as Notifications from "expo-notifications";
import type { Session } from "@supabase/supabase-js";
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
import { ActivationScreen } from "../screens/left/ActivationScreen";
import { FeedScreen } from "../screens/left/FeedScreen";
import { ProfileScreen } from "../screens/left/ProfileScreen";
import { ApproachScreen } from "../screens/left/ApproachScreen";
import { SafetyScreen } from "../screens/left/SafetyScreen";
import { SettingsScreen } from "../screens/left/SettingsScreen";
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
  type RuntimeCoords,
  type RuntimeVenueCandidate,
  type VenuePreference,
} from "../features/location/location-storage";
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
  sendWaveToUser,
} from "../features/interactions/interaction-service";
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
  const [socialMomentumEvents, setSocialMomentumEvents] = useState<SocialInteractionEventType[]>([]);

  const visibleFeed = useMemo(() => {
    if (venueHidden) return [];
    return feed.map((item) => ({ ...item, venueName: venueSummary.venueName }));
  }, [feed, venueHidden, venueSummary.venueName]);

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
      subscription.unsubscribe();
      notificationSubscription.remove();
    };
  }, []);

  useEffect(() => {
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
  }, []);

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
    if (!user || !venueSelectionRequired) return;
    if (screen === "venue" || screen === "activate" || screen === "feed") {
      setScreen("venue-select");
    }
  }, [screen, user, venueSelectionRequired]);

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
    if (!user || !isUuid(user.id) || !isUuid(venueSummary.venueId)) return;
    void refreshVenueContext(venueSummary.venueId);
    void refreshNearbyFeed(user.id, venueSummary.venueId);
  }, [user?.id, venueSummary.venueId, activePresenceSessionId]);

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
    const preferences = await getVenuePreferences();
    setVenuePreferences(preferences);
    setVenueHidden(!!preferences[venueSummary.venueId]?.hidden);
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
    setScreen("venue");
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
    setScreen("venue");
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
    if (isInitialLoad) {
      setScreen("loading");
      await delay(2000);
    }
    const recoveredActiveSession = await recoverActivePresenceSession(appUser);
    setScreen(recoveredActiveSession ? "activate" : "venue");
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
    const startedAtDate = new Date();
    const startedAt = startedAtDate.toISOString();
    const expiresAt = new Date(startedAtDate.getTime() + selectedDuration * 60_000).toISOString();
    const intent = selectedIntent ?? "networking";
    const vibes = selectedVibes.length > 0 ? selectedVibes : ["Open"];
    const hintText = hintDraft.trim() || null;

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
    setScreen("activate");
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
    if (socialMomentum?.state === "warming_up" && visibleFeed[0]) {
      void sendWave(visibleFeed[0]);
      setScreen("profile");
      return;
    }
    setScreen("feed");
  }

  function dismissSocialMomentumPrompt() {
    void recordSocialInteractionEvent("prompt_dismissed");
  }

  async function sendWave(item: NearbyFeedItem) {
    if (!user) return;
    if (isUuid(user.id) && isUuid(item.profileUserId) && isUuid(item.presenceSessionId)) {
      const sent = await sendWaveToUser({
        fromUserId: user.id,
        toUserId: item.profileUserId,
        presenceSessionId: item.presenceSessionId,
      });

      if (!sent) {
        Alert.alert("Could not send wave", "Please try again.");
        return;
      }
    }

    void recordSocialInteractionEvent("wave_sent", {
      targetUserId: item.profileUserId,
      visibilitySessionId: activePresenceSessionId ?? item.presenceSessionId,
    });
    setSelectedProfile(item);
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
    const targetUserId = selectedProfile.profileUserId;
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
  }

  async function blockUser() {
    if (!selectedProfile || !user) return;
    const targetUserId = selectedProfile.profileUserId;

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
  }

  async function reportUser(category: ReportCategory = reportCategory, notes = reportNotes) {
    if (!selectedProfile || !user) return;
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
    Alert.alert("Report submitted", "This person is hidden from your current session.");
  }

  async function hideVenuePermanently() {
    await persistVenueHidden(venueSummary.venueId, venueSummary.venueName, true);
    setVenueHidden(true);
    setFeed([]);
    await refreshVenuePreferences();
    setScreen("venue");
  }

  async function muteVenueNotifications() {
    await setVenueMuted(venueSummary.venueId, venueSummary.venueName, true);
    await refreshVenuePreferences();
    Alert.alert("Venue muted", `Left will no longer send dwell notifications at ${venueSummary.venueName}.`);
  }

  async function clearVenueHidden(venueId: string, venueName: string) {
    await persistVenueHidden(venueId, venueName, false);
    if (venueSummary.venueId === venueId) {
      setVenueHidden(false);
    }
    await refreshVenuePreferences();
  }

  async function clearVenueMuted(venueId: string, venueName: string) {
    await setVenueMuted(venueId, venueName, false);
    await refreshVenuePreferences();
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
    void endSessionState();
    setApproach(null);
    setAuthError(null);
    setSettingsSaveState("idle");
    setDeletionRequestState("idle");
    setReportSubmitting(false);
    setReportCategory("unsafe_behavior");
    setReportNotes("");
    setScreen("auth");
  }

  async function endSessionState(status: "paused" | "session_ended" = "session_ended") {
    const sessionId = activePresenceSessionId;
    setSessionVisible(false);
    setSessionStartedAt(null);
    setActivePresenceSessionId(null);
    setSocialMomentumEvents([]);
    setSessionNowMs(Date.now());

    if (isUuid(sessionId)) {
      const updated = await updatePresenceSessionEndState(sessionId, status);

      if (!updated) {
        Alert.alert("Could not update visibility", "Your local session is hidden, but the server did not confirm the change.");
      }
    }
  }

  async function requestAccountDeletion() {
    if (!user) return;
    Alert.alert(
      "Request identity removal",
      "This submits a backend request to remove direct identity fields while retaining selected product records like hints, venue history, and safety zones.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Submit request",
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
      setScreen("venue");
      return;
    }
    if (destination === "nearby") {
      setSelectedProfile(null);
      setScreen("feed");
      return;
    }
    if (destination === "session") {
      setSelectedProfile(null);
      setScreen("activate");
      return;
    }
    setSelectedProfile(null);
    setScreen("settings");
  }

  const footerSummary = {
    venueName: venueSummary.venueName,
    intent: selectedIntent,
    vibe: selectedVibes[0] ?? "Open",
    sessionVisible,
    activeDestination: getFooterDestination(screen),
  };
  const currentVenuePreference = venuePreferences[venueSummary.venueId];
  const locationStatus = locationEnabled
    ? "Background location is active. Venue matching runs on-device and only venue IDs are used for app state."
    : "Background location is not enabled yet.";

  return (
    <View style={styles.shell}>
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
        {screen === "venue" && (
          <VenueScreen
            venue={venueSummary}
            feed={visibleFeed}
            socialMomentum={socialMomentum}
            sessionVisible={sessionVisible}
            venueHidden={venueHidden}
            canChooseVenue={nearbyVenueOptions.length > 1}
            onActivate={() => setScreen("activate")}
            onOpenFeed={() => setScreen("feed")}
            onOpenProfile={openProfile}
            onSocialMomentumPrimary={handleSocialMomentumPrimary}
            onDismissSocialMomentum={dismissSocialMomentumPrompt}
            onChooseVenue={() => setScreen("venue-select")}
            onAddVenue={() => setScreen("venue-add")}
          />
        )}
        {screen === "activate" && (
          <ActivationScreen
            sessionVisible={sessionVisible}
            selectedIntent={selectedIntent}
            selectedVibes={selectedVibes}
            selectedDuration={selectedDuration}
            hintDraft={hintDraft}
            elapsedSeconds={elapsedSessionSeconds}
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
          <FeedScreen venue={venueSummary} feed={visibleFeed} onOpenProfile={openProfile} onWave={sendWave} onOpenSafety={() => setScreen("safety")} />
        )}
        {screen === "profile" && selectedProfile && (
          <ProfileScreen
            item={selectedProfile}
            profilePrompt={user?.profilePrompt ?? defaultProfilePrompt}
            reportCategory={reportCategory}
            reportNotes={reportNotes}
            reportSubmitting={reportSubmitting}
            onBack={() => setScreen("feed")}
            onWave={() => void sendWave(selectedProfile)}
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
          <ApproachScreen item={selectedProfile} approachPrompt={user?.approachPrompt ?? defaultApproachPrompt} onCancel={() => setScreen("feed")} onConfirmConnected={() => void confirmConnected()} onOpenSafety={() => setScreen("safety")} />
        )}
        {screen === "safety" && (
          <SafetyScreen venueName={venueSummary.venueName} venueMuted={!!currentVenuePreference?.muted} sessionVisible={sessionVisible} onBack={() => setScreen(selectedProfile ? "profile" : "feed")} onPauseVisibility={() => void endSessionState("paused")} onEndSession={() => { void endSessionState(); setScreen("venue"); }} onHideVenue={() => void hideVenuePermanently()} onMuteVenue={() => void muteVenueNotifications()} />
        )}
        {screen === "settings" && user && (
          <SettingsScreen
            user={user}
            saveState={settingsSaveState}
            deletionState={deletionRequestState}
            venuePreferences={Object.values(venuePreferences).filter((preference) => preference.hidden || preference.muted)}
            locationStatus={locationStatus}
            onSave={(input) => void saveSettings(input)}
            onOpenSafety={() => setScreen("safety")}
            onClearVenueHidden={(venueId, venueName) => void clearVenueHidden(venueId, venueName)}
            onClearVenueMuted={(venueId, venueName) => void clearVenueMuted(venueId, venueName)}
            onSignOut={() => void signOut()}
            onRequestDeletion={() => void requestAccountDeletion()}
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
