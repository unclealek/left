import { useEffect, useMemo, useRef, useState } from "react";
import { AppState, BackHandler, Linking, Platform, RefreshControl, ScrollView, Text, View } from "react-native";
import * as Notifications from "expo-notifications";
import type { Session } from "@supabase/supabase-js";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BackgroundWaveLayer } from "../components/left/BackgroundWaveLayer";
import { LeftRefreshIndicator } from "../components/left/LeftRefreshIndicator";
import { SessionFooterNav } from "../components/left/navigation";
import { AppDialog } from "../components/left/ui";
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
import { EMPTY_NEARBY_FEED, INITIAL_VENUE_SUMMARY } from "./initialState";
import type {
  AppUser,
  ApproachAttempt,
  AvatarStyle,
  NearbyFeedItem,
  ReportCategory,
  SocialInteractionEventType,
  VenueActivityEnvelope,
  VenueExperience,
  VenueType,
  VenueContextSummary,
} from "../types/left-domain";
import { AuthScreen } from "../screens/left/AuthScreen";
import { LegalScreen } from "../screens/left/LegalScreen";
import { LoadingScreen } from "../screens/left/LoadingScreen";
import { PreAuthOnboardingScreen } from "../screens/left/PreAuthOnboardingScreen";
import {
  NameScreen,
  LegalAcknowledgementScreen,
  LocationScreen,
  NotificationScreen,
} from "../screens/left/OnboardingScreens";
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
import { VenueDetailScreen } from "../screens/left/VenueDetailScreen";
import { ExperienceDetailScreen } from "../screens/left/ExperienceDetailScreen";
import { ExperienceCreateScreen } from "../screens/left/ExperienceCreateScreen";
import { SavedPlacesScreen } from "../screens/left/SavedPlacesScreen";
import {
  consumePendingActivationLaunch,
  handleVenuePromptResponse,
  loadLastActivationDefaults,
  primeLocationFix,
  requestNotificationAccess,
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
  getVenueApproachPrompts,
  getVenuePreferences,
  saveVenuePreferences,
  type RuntimeCoords,
  type RuntimeVenueCandidate,
  type VenueApproachPrompt,
  type VenuePreference,
} from "../features/location/location-storage";
import {
  getVenueConfidenceCopy,
  getVenueConfidenceLabel,
  resolveVenueConfidence,
} from "../features/location/venue-confidence";
import {
  fetchVenuePreferencesForUser,
  upsertVenuePreferenceForUser,
} from "../features/location/venue-preference-service";
import {
  fetchUserProfile,
  hasAcceptedLegalVersions,
  recordLegalAcceptance,
  submitIdentityRemovalRequest,
  updateUserSettings,
  upsertOnboardingProfile,
} from "../features/account/account-service";
import {
  fetchPublishedExperiences,
  fetchSavedVenues,
  setExperienceAttendance,
  setVenueSaved,
  submitExperienceProposal,
  type ExperienceProposalInput,
  type SavedVenueEntry,
} from "../features/discovery/discovery-service";
import { fetchVenuePracticalDetails } from "../features/venues/venue-details-service";
import {
  blockUserForActor,
  createApproachAttempt,
  hideUserForActor,
  markApproachCancelled,
  markApproachConnected,
  markApproachExpired,
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
  hasSeenPreAuthOnboarding,
  markPreAuthOnboardingSeen,
} from "../features/onboarding/pre-auth-storage";
import {
  clearOnboardingDraft,
  loadOnboardingDraft,
  saveOnboardingDraft,
  type OnboardingDraftStep,
} from "../features/onboarding/onboarding-storage";
import { validateFirstName } from "../features/onboarding/onboarding-validation";
import { getLocationRecoveryMessage } from "../features/onboarding/onboarding-flow";
import {
  CURRENT_LEGAL_VERSIONS,
  legalContentReady,
  type LegalDocumentId,
} from "../features/legal/legal-content";
import { fetchVenueActivity } from "../features/activity/besttime-activity-service";
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
  UnsupportedAuthProviderError,
} from "../features/auth/auth-service";
import { getRemainingSeconds, hasExpired } from "../features/lifecycle/session-lifecycle";

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

function normalizeSingleVibe(vibes: string[] | null | undefined, fallback = "Open") {
  const first = Array.isArray(vibes) ? vibes.find((value) => value.trim().length > 0) : null;
  return first ? [first] : [fallback];
}

function pickBestNearbyVenueMatch(
  venues: RuntimeVenueCandidate[],
  submittedName: string,
) {
  const normalizedName = normalizeVenueName(submittedName);
  const exactMatches = venues.filter(
    (venue) => normalizeVenueName(venue.name) === normalizedName,
  );
  if (!exactMatches.length) return null;

  return (
    exactMatches.find((venue) => isUuid(venue.id)) ??
    exactMatches[0]
  );
}

function summarizeVenueCandidates(venues: RuntimeVenueCandidate[]) {
  return venues.map((venue) => ({
    id: venue.id,
    name: venue.name,
    venueType: venue.venueType ?? "other",
    source: venue.source,
    distanceMeters: venue.distanceMeters ?? null,
    isUuid: isUuid(venue.id),
  }));
}

type VenuePreferenceAction = "hide" | "mute" | "unhide" | "unmute";
type DialogAction = {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "ghost" | "destructive";
};
type VenuePreferenceMessage = {
  venueId: string;
  tone: "success" | "error";
  text: string;
};

const REFRESHABLE_SCREENS: Screen[] = ["home", "venue", "venue-detail", "feed", "saved"];

const PRIVATE_VENUE_SUMMARY: VenueContextSummary = {
  venueId: "private",
  venueName: "Visibility off",
  visibleCount: 0,
  energyLevel: "calm",
  activeVibes: [],
  popularIntents: [],
  pulseCopy: "Your venue stays private until you become visible. Turn on visibility to detect your venue and unlock nearby people.",
};

export function LeftApp() {
  const insets = useSafeAreaInsets();
  const [screen, setScreen] = useState<Screen>("loading");
  const [activationReturnScreen, setActivationReturnScreen] = useState<Screen>("home");
  const [safetyReturnScreen, setSafetyReturnScreen] = useState<Screen>("home");
  const [venueFooterDestination, setVenueFooterDestination] = useState<"nearby" | "session">("session");
  const [user, setUser] = useState<AppUser | null>(null);
  const [feed, setFeed] = useState<NearbyFeedItem[]>(EMPTY_NEARBY_FEED);
  const [selectedProfile, setSelectedProfile] = useState<NearbyFeedItem | null>(null);
  const [profileReturnScreen, setProfileReturnScreen] = useState<Screen>("feed");
  const [venueSummary, setVenueSummary] = useState<VenueContextSummary>(INITIAL_VENUE_SUMMARY);
  const [firstNameDraft, setFirstNameDraft] = useState("");
  const [avatarStyleDraft, setAvatarStyleDraft] = useState<AvatarStyle>("geometric");
  const [onboardingUserId, setOnboardingUserId] = useState<string | null>(null);
  const [legalChecks, setLegalChecks] = useState<Record<LegalDocumentId, boolean>>({
    terms: false,
    privacy: false,
    community: false,
  });
  const [activeLegalDocument, setActiveLegalDocument] = useState<LegalDocumentId>("terms");
  const [legalReturnScreen, setLegalReturnScreen] = useState<Screen>("auth");
  const [bootError, setBootError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [onboardingSaveBusy, setOnboardingSaveBusy] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [notificationBusy, setNotificationBusy] = useState(false);
  const [locationBusy, setLocationBusy] = useState(false);
  const [selectedIntent, setSelectedIntent] = useState<AppUser["defaultIntent"]>("networking");
  const [selectedVibes, setSelectedVibes] = useState<string[]>(["AI/startups"]);
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [hintDraft, setHintDraft] = useState("Grey hoodie, corner seat");
  const [approach, setApproach] = useState<ApproachAttempt | null>(null);
  const [activeApproachPrompt, setActiveApproachPrompt] = useState(defaultApproachPrompt);
  const [venueHidden, setVenueHidden] = useState(false);
  const [sessionVisible, setSessionVisible] = useState(false);
  const [sessionStartedAt, setSessionStartedAt] = useState<string | null>(null);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<string | null>(null);
  const [sessionNowMs, setSessionNowMs] = useState(() => Date.now());
  const [activePresenceSessionId, setActivePresenceSessionId] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [settingsSaveState, setSettingsSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [deletionRequestState, setDeletionRequestState] = useState<"idle" | "submitting" | "submitted" | "error">("idle");
  const [venuePreferences, setVenuePreferences] = useState<Record<string, VenuePreference>>({});
  const [venuePreferenceAction, setVenuePreferenceAction] = useState<{
    venueId: string;
    action: VenuePreferenceAction;
  } | null>(null);
  const [venuePreferenceMessage, setVenuePreferenceMessage] = useState<VenuePreferenceMessage | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [dialogState, setDialogState] = useState<{
    title: string;
    message: string;
    actions: DialogAction[];
  } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mainScrollRef = useRef<ScrollView>(null);
  const preAuthSeenRef = useRef(false);
  const preAuthReadyRef = useRef(false);
  const activationAttemptRef = useRef(false);
  const [nearbyVenueOptions, setNearbyVenueOptions] = useState<RuntimeVenueCandidate[]>([]);
  const [lastKnownCoords, setLastKnownCoords] = useState<RuntimeCoords | null>(null);
  const [venueSelectionRequired, setVenueSelectionRequired] = useState(false);
  const [venueDraftName, setVenueDraftName] = useState("");
  const [venueDraftAddress, setVenueDraftAddress] = useState("");
  const [venueDraftNotes, setVenueDraftNotes] = useState("");
  const [venueDraftType, setVenueDraftType] = useState<VenueType>("other");
  const [venueDraftSubmitting, setVenueDraftSubmitting] = useState(false);
  const [selectedVenueDetail, setSelectedVenueDetail] = useState<RuntimeVenueCandidate | null>(null);
  const [venueDetailsLoading, setVenueDetailsLoading] = useState(false);
  const [savedVenues, setSavedVenues] = useState<SavedVenueEntry[]>([]);
  const [savingVenueId, setSavingVenueId] = useState<string | null>(null);
  const [experiences, setExperiences] = useState<VenueExperience[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<VenueExperience | null>(null);
  const [experienceReturnScreen, setExperienceReturnScreen] = useState<Screen>("home");
  const [attendanceBusy, setAttendanceBusy] = useState(false);
  const [experienceProposalBusy, setExperienceProposalBusy] = useState(false);
  const [experienceProposalError, setExperienceProposalError] = useState<string | null>(null);
  const [venueActivityById, setVenueActivityById] = useState<Record<string, VenueActivityEnvelope>>({});
  const [discoveryRefreshing, setDiscoveryRefreshing] = useState(false);
  const [refreshPullDistance, setRefreshPullDistance] = useState(0);
  const [venueDetailReturnScreen, setVenueDetailReturnScreen] = useState<Screen>("home");
  const [venueApproachPrompts, setVenueApproachPrompts] = useState<Record<string, VenueApproachPrompt>>({});
  const [reportCategory, setReportCategory] = useState<ReportCategory>("unsafe_behavior");
  const [reportNotes, setReportNotes] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [activationSubmitting, setActivationSubmitting] = useState(false);
  const [profileAction, setProfileAction] = useState<"hide" | "block" | null>(null);
  const [visibilityAction, setVisibilityAction] = useState<"pause" | "end" | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      mainScrollRef.current?.scrollTo({ y: 0, animated: false });
    });
    setRefreshPullDistance(0);
    return () => cancelAnimationFrame(frame);
  }, [screen]);
  const [socialMomentumEvents, setSocialMomentumEvents] = useState<SocialInteractionEventType[]>([]);
  const [pendingApproachFeedback, setPendingApproachFeedback] = useState<PendingApproachFeedback | null>(null);
  const [feedbackWentOver, setFeedbackWentOver] = useState<boolean | null>(null);
  const [feedbackUsedIcebreaker, setFeedbackUsedIcebreaker] = useState<boolean | null>(null);

  const visibleFeed = useMemo(() => {
    if (!sessionVisible || venueHidden) return [];
    return feed.map((item) => ({ ...item, venueName: venueSummary.venueName }));
  }, [feed, sessionVisible, venueHidden, venueSummary.venueName]);
  const discoveryVenueIdsKey = useMemo(
    () => nearbyVenueOptions.map((venue) => venue.id).filter(isUuid).sort().join(","),
    [nearbyVenueOptions],
  );

  useEffect(() => {
    const userId = user?.id;
    if (!userId) {
      setSavedVenues([]);
      setExperiences([]);
      return;
    }

    let current = true;
    const venueIds = discoveryVenueIdsKey ? discoveryVenueIdsKey.split(",") : [];
    void Promise.all([
      fetchSavedVenues(userId),
      fetchPublishedExperiences(venueIds),
    ]).then(([nextSavedVenues, nextExperiences]) => {
      if (!current) return;
      setSavedVenues(nextSavedVenues);
      setExperiences(nextExperiences);
    });

    return () => {
      current = false;
    };
  }, [discoveryVenueIdsKey, user?.id]);
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
    return getRemainingSeconds(approach.expiresAt, sessionNowMs);
  }, [approach, sessionNowMs]);

  function showToast(message: string) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(message);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 2400);
  }

  function showDialog(title: string, message: string, actions?: DialogAction[]) {
    setDialogState({
      title,
      message,
      actions: actions?.length ? actions : [{ label: "OK", variant: "primary" }],
    });
  }

  function dismissDialog() {
    setDialogState(null);
  }

  function openActivationFrom(origin: Screen) {
    setActivationReturnScreen(origin);
    setScreen("activate");
  }

  function openSafetyFrom(origin: Screen) {
    setSafetyReturnScreen(origin);
    setScreen("safety");
  }

  function openLegalDocument(document: LegalDocumentId, origin: Screen) {
    setActiveLegalDocument(document);
    setLegalReturnScreen(origin);
    setScreen("legal");
  }

  function onboardingScreenForStep(step: OnboardingDraftStep): Screen {
    if (step === "avatar") return "onboarding-name";
    if (step === "legal") return "onboarding-legal";
    if (step === "notifications") return "onboarding-notifications";
    if (step === "location") return "onboarding-location";
    if (step === "complete") return "legal-consent";
    return "onboarding-name";
  }

  function onboardingStepForScreen(value: Screen): OnboardingDraftStep | null {
    if (value === "onboarding-name") return "name";
    if (value === "onboarding-legal") return "legal";
    if (value === "onboarding-notifications") return "notifications";
    if (value === "onboarding-location") return "location";
    if (value === "legal-consent") return "complete";
    return null;
  }

  async function persistOnboardingStep(step: OnboardingDraftStep) {
    if (!onboardingUserId) return;
    await saveOnboardingDraft(onboardingUserId, {
      firstName: firstNameDraft,
      avatarStyle: avatarStyleDraft,
      step,
    });
  }

  function goBackInOnboarding() {
    setAuthError(null);
    setLocationError(null);
    if (screen === "legal-consent") {
      void persistOnboardingStep("location");
      setScreen("onboarding-location");
      return;
    }
    if (screen === "onboarding-location") {
      void persistOnboardingStep("notifications");
      setScreen("onboarding-notifications");
      return;
    }
    if (screen === "onboarding-notifications") {
      void persistOnboardingStep("legal");
      setScreen("onboarding-legal");
      return;
    }
    if (screen === "onboarding-legal") {
      void persistOnboardingStep("name");
      setScreen("onboarding-name");
      return;
    }
    if (screen === "onboarding-name") {
      void persistOnboardingStep("name");
      setScreen("auth");
    }
  }

  function resolveApproachPromptForVenue(venueId: string | null | undefined) {
    if (venueId && venueApproachPrompts[venueId]?.promptText?.trim()) {
      return venueApproachPrompts[venueId].promptText.trim();
    }
    return user?.approachPrompt?.trim() || defaultApproachPrompt;
  }

  function resolveVenueDetailCandidate(candidate?: RuntimeVenueCandidate | null) {
    if (candidate) return candidate;
    return (
      nearbyVenueOptions.find((item) => item.id === venueSummary.venueId) ??
      nearbyVenueOptions.find((item) => item.name === venueSummary.venueName) ??
      (venueSummary.venueName
        ? {
            id: venueSummary.venueId,
            name: venueSummary.venueName,
            venueType: undefined,
            latitude: lastKnownCoords?.latitude ?? 0,
            longitude: lastKnownCoords?.longitude ?? 0,
            radiusMeters: 60,
            source: "local_catalog" as const,
            distanceMeters: 0,
          }
        : null)
    );
  }

  function openVenueDetail(candidate?: RuntimeVenueCandidate | null, origin: Screen = screen) {
    const resolvedCandidate = resolveVenueDetailCandidate(candidate);
    if (!resolvedCandidate) return;
    setSelectedVenueDetail(resolvedCandidate);
    setVenueDetailReturnScreen(origin);
    setScreen("venue-detail");
    if (isUuid(resolvedCandidate.id)) {
      setVenueDetailsLoading(true);
      void fetchVenuePracticalDetails(resolvedCandidate.id)
        .then((details) => {
          if (!details) return;
          setSelectedVenueDetail((current) =>
            current?.id === resolvedCandidate.id ? { ...current, ...details } : current,
          );
        })
        .finally(() => setVenueDetailsLoading(false));
    } else {
      setVenueDetailsLoading(false);
    }
  }

  function openSavedVenue(entry: SavedVenueEntry) {
    const nearbyCandidate = nearbyVenueOptions.find((candidate) => candidate.id === entry.venueId);
    openVenueDetail(
      nearbyCandidate ?? {
        id: entry.venueId,
        name: entry.venueName,
        venueType: entry.venueType,
        latitude: 0,
        longitude: 0,
        radiusMeters: 60,
        source: "local_catalog",
        distanceMeters: null,
        formattedAddress: entry.formattedAddress,
      },
      "saved",
    );
  }

  async function toggleSavedVenue(candidate: RuntimeVenueCandidate) {
    if (!user || savingVenueId) return;
    if (!isUuid(candidate.id)) {
      showDialog("Could not save this place", "Left can save a place after it has been confirmed in the venue directory.");
      return;
    }
    const isSaved = savedVenues.some((entry) => entry.venueId === candidate.id);
    setSavingVenueId(candidate.id);
    try {
      const saved = await setVenueSaved(user.id, candidate.id, !isSaved);
      if (!saved) {
        showDialog("Could not update saved places", "Check your connection and try again.");
        return;
      }
      setSavedVenues(await fetchSavedVenues(user.id));
      showToast(isSaved ? "Removed from saved places" : "Place saved");
    } finally {
      setSavingVenueId(null);
    }
  }

  function openExperience(experience: VenueExperience, origin: Screen = screen) {
    setSelectedExperience(experience);
    setExperienceReturnScreen(origin);
    setScreen("experience-detail");
  }

  function openSelectedExperienceVenue() {
    if (!selectedExperience) return;
    const candidate = nearbyVenueOptions.find((venue) => venue.id === selectedExperience.venueId) ?? {
      id: selectedExperience.venueId,
      name: selectedExperience.venueName,
      venueType: "other" as const,
      latitude: 0,
      longitude: 0,
      radiusMeters: 60,
      source: "local_catalog" as const,
      distanceMeters: null,
    };
    openVenueDetail(candidate, "experience-detail");
  }

  async function toggleSelectedExperienceAttendance() {
    if (!selectedExperience || attendanceBusy) return;
    setAttendanceBusy(true);
    try {
      const nextAttending = await setExperienceAttendance(selectedExperience.id, !selectedExperience.viewerAttending);
      if (nextAttending == null) {
        showDialog("Could not update attendance", "This gathering may be full or unavailable. Try again shortly.");
        return;
      }
      const delta = nextAttending ? 1 : -1;
      const updateExperience = (experience: VenueExperience) => experience.id === selectedExperience.id
        ? {
            ...experience,
            viewerAttending: nextAttending,
            attendeeCount: Math.max(0, experience.attendeeCount + delta),
          }
        : experience;
      setExperiences((current) => current.map(updateExperience));
      setSelectedExperience((current) => current ? updateExperience(current) : null);
      showToast(nextAttending ? "You’re going" : "Plans updated");
    } finally {
      setAttendanceBusy(false);
    }
  }

  useEffect(() => {
    void bootstrapSession();
    void bootstrapDeviceState();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncSession(session, false).catch((error) => {
        console.warn("[auth] session synchronization failed", error);
        setBootError("We could not restore your account state. Your session is still secure.");
        setScreen("loading");
      });
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
    const step = onboardingStepForScreen(screen);
    if (!step || !onboardingUserId) return;
    const timer = setTimeout(() => {
      void saveOnboardingDraft(onboardingUserId, {
        firstName: firstNameDraft,
        avatarStyle: avatarStyleDraft,
        step,
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [screen, firstNameDraft, avatarStyleDraft, onboardingUserId]);

  useEffect(() => {
    const isOnboarding = screen.startsWith("onboarding-");
    if (!isOnboarding && screen !== "legal-consent" && screen !== "legal") return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (isOnboarding) {
        goBackInOnboarding();
      } else if (screen === "legal") {
        setScreen(legalReturnScreen);
      } else {
        void forceLocalSignOut();
      }
      return true;
    });
    return () => subscription.remove();
  }, [
    screen,
    firstNameDraft,
    avatarStyleDraft,
    onboardingUserId,
    legalReturnScreen,
  ]);

  useEffect(() => {
    const destinations: Partial<Record<Screen, Screen>> = {
      "venue-detail": venueDetailReturnScreen,
      "experience-detail": experienceReturnScreen,
      "experience-create": "home",
      saved: "me",
      settings: "me",
      profile: profileReturnScreen,
      "venue-select": sessionVisible ? "venue" : "home",
      "venue-add": "venue-select",
      activate: activationReturnScreen,
      safety: safetyReturnScreen,
    };
    const destination = destinations[screen];
    if (!destination) return;

    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      setScreen(destination);
      return true;
    });
    return () => subscription.remove();
  }, [
    activationReturnScreen,
    experienceReturnScreen,
    profileReturnScreen,
    safetyReturnScreen,
    screen,
    sessionVisible,
    venueDetailReturnScreen,
  ]);

  useEffect(() => {
    const shouldMonitorVenueRuntime =
      SESSION_NAV_SCREENS.includes(screen) ||
      screen === "venue-select" ||
      screen === "venue-add";
    if (!shouldMonitorVenueRuntime) return;
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
    if (!sessionVisible || !hasExpired(sessionExpiresAt, sessionNowMs)) return;
    void endSessionState("session_ended", { toastMessage: "Visibility session expired" });
  }, [sessionExpiresAt, sessionNowMs, sessionVisible]);

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
    if (
      screen !== "feed" ||
      !user ||
      !sessionVisible ||
      !isUuid(user.id) ||
      !isUuid(venueSummary.venueId)
    ) {
      return;
    }

    void refreshNearbyFeed(user.id, venueSummary.venueId);
    const interval = setInterval(() => {
      void refreshNearbyFeed(user.id, venueSummary.venueId);
    }, 30_000);
    return () => clearInterval(interval);
  }, [screen, user?.id, venueSummary.venueId, sessionVisible]);

  useEffect(() => {
    const venueIds = nearbyVenueOptions
      .map((venue) => venue.id)
      .filter((venueId): venueId is string => isUuid(venueId));
    if (isUuid(venueSummary.venueId)) {
      venueIds.unshift(venueSummary.venueId);
    }
    const uniqueVenueIds = Array.from(new Set(venueIds));
    if (!uniqueVenueIds.length) return;
    void refreshVenueActivityForIds(uniqueVenueIds);
  }, [nearbyVenueOptions, venueSummary.venueId]);

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
    setBootError(null);
    setScreen("loading");
    try {
      preAuthSeenRef.current = await hasSeenPreAuthOnboarding();
      preAuthReadyRef.current = true;
      const session = await getCurrentSession();
      logAuthDebug("bootstrap session", {
        hasSession: !!session,
        userId: session?.user.id ?? null,
        provider: session?.user.app_metadata.provider ?? null,
      });
      await syncSession(session, true);
    } catch (error) {
      console.warn("[auth] bootstrap failed", error);
      setBootError("Check your connection, then try again.");
      setScreen("loading");
    }
  }

  async function completePreAuthOnboarding() {
    try {
      await markPreAuthOnboardingSeen();
    } catch (error) {
      console.warn("[onboarding] could not persist intro completion", error);
    }
    preAuthSeenRef.current = true;
    setScreen("auth");
  }

  async function bootstrapDeviceState() {
    try {
      const runtime = await syncLocationRegistrationState();
      setLocationEnabled(runtime.permissionGranted);
      const notificationPermission = await Notifications.getPermissionsAsync();
      setNotificationEnabled(notificationPermission.status === "granted");
      if (runtime.permissionGranted) {
        await primeLocationFix();
      }
      await refreshVenueFromRuntime();
      const defaults = await loadLastActivationDefaults();
      if (defaults) {
        setSelectedIntent(defaults.intent);
        setSelectedVibes(normalizeSingleVibe(defaults.vibes));
        setSelectedDuration(defaults.durationMinutes);
        setHintDraft(defaults.hintText);
      }
      setVenueApproachPrompts(await getVenueApproachPrompts());
      await refreshVenuePreferences();
    } catch (error) {
      console.warn("[location] device bootstrap failed", error);
      setLocationEnabled(false);
    }
  }

  async function refreshVenueFromRuntime() {
    const runtime = await getLocationRuntimeState();
    setNearbyVenueOptions(runtime.nearbyVenues);
    setLastKnownCoords(runtime.lastKnownCoords);
    setVenueSelectionRequired(
      runtime.nearbyVenues.length > 0 &&
      !runtime.selectedVenueId &&
      (!runtime.currentVenueId || runtime.nearbyVenues.length > 1),
    );
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

  async function refreshVenueActivityForIds(venueIds: string[]) {
    const uniqueVenueIds = Array.from(new Set(venueIds.filter((venueId) => isUuid(venueId))));
    if (!uniqueVenueIds.length) return;

    const results = await fetchVenueActivity(uniqueVenueIds);
    if (!results.length) return;

    setVenueActivityById((current) => {
      const next = { ...current };
      for (const result of results) {
        next[result.venueId] = result;
      }
      return next;
    });
  }

  async function refreshDiscoverySurface() {
    if (discoveryRefreshing) return;
    const refreshStartedAt = Date.now();
    setDiscoveryRefreshing(true);
    try {
      if (locationEnabled) {
        await primeLocationFix();
      }
      await refreshVenueFromRuntime();
      const runtime = await getLocationRuntimeState();
      const venueIds = runtime.nearbyVenues.map((venue) => venue.id).filter(isUuid);
      const tasks: Promise<unknown>[] = [refreshVenueActivityForIds(venueIds)];

      if (user) {
        tasks.push(
          Promise.all([
            fetchSavedVenues(user.id),
            fetchPublishedExperiences(venueIds),
          ]).then(([nextSavedVenues, nextExperiences]) => {
            setSavedVenues(nextSavedVenues);
            setExperiences(nextExperiences);
          }),
        );
      }

      if (user && sessionVisible && !venueHidden && isUuid(venueSummary.venueId)) {
        tasks.push(
          refreshVenueContext(venueSummary.venueId),
          refreshNearbyFeed(user.id, venueSummary.venueId),
          refreshSocialMomentumEvents(activePresenceSessionId, user.id),
        );
      }

      if (screen === "venue-detail" && selectedVenueDetail && isUuid(selectedVenueDetail.id)) {
        tasks.push(
          fetchVenuePracticalDetails(selectedVenueDetail.id).then((details) => {
            if (!details) return;
            setSelectedVenueDetail((current) =>
              current?.id === selectedVenueDetail.id ? { ...current, ...details } : current,
            );
          }),
        );
      }

      await Promise.all(tasks);
    } catch (error) {
      console.warn("[discovery] pull to refresh failed", error);
      showToast("Couldn’t refresh right now");
    } finally {
      const remainingLoaderTime = 650 - (Date.now() - refreshStartedAt);
      if (remainingLoaderTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingLoaderTime));
      }
      setDiscoveryRefreshing(false);
    }
  }

  async function recoverActivePresenceSession(appUser: AppUser) {
    const activeSession = await fetchActivePresenceSession(appUser.id);
    if (!activeSession) {
      setActivePresenceSessionId(null);
      setSessionVisible(false);
      setSessionStartedAt(null);
      setSessionExpiresAt(null);
      setSocialMomentumEvents([]);
      return false;
    }

    const preferences = await loadVenuePreferences(appUser.id);
    if (preferences[activeSession.venueId]?.hidden) {
      await updatePresenceSessionEndState(activeSession.id, "session_ended");
      setActivePresenceSessionId(null);
      setSessionVisible(false);
      setSessionStartedAt(null);
      setSessionExpiresAt(null);
      setSocialMomentumEvents([]);
      setFeed([]);
      return false;
    }

    setActivePresenceSessionId(activeSession.id);
    await refreshSocialMomentumEvents(activeSession.id, appUser.id);
    setSessionStartedAt(activeSession.startedAt);
    setSessionExpiresAt(activeSession.expiresAt);
    setSessionNowMs(Date.now());
    setSessionVisible(true);
    setSelectedIntent(activeSession.intent);
    setSelectedVibes(normalizeSingleVibe(activeSession.vibes));
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

    if (isUuid(storedApproach.approachId)) {
      await markApproachExpired({
        approachId: storedApproach.approachId,
        expiredAt: storedApproach.expiresAt,
      });
    }

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
            approachPrompt: resolveApproachPromptForVenue(venueSummary.venueId),
            startedAt: approach.startedAt,
            expiresAt: approach.expiresAt,
            createdAt: new Date().toISOString(),
          }
        : null;

    if (!nextPending) return;

    if (isUuid(approach.id)) {
      await markApproachExpired({
        approachId: approach.id,
        expiredAt: approach.expiresAt,
      });
    }

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
    showDialog(
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
    const runtime = await getLocationRuntimeState();
    const chosenVenue = runtime.nearbyVenues.find((venue) => venue.id === venueId) ?? null;
    const selected = await selectNearbyVenue(venueId);
    if (!selected) {
      showDialog("Venue unavailable", "That nearby venue is no longer available. Try again from the refreshed list.");
      await refreshVenueFromRuntime();
      return;
    }
    await refreshVenueFromRuntime();
    if (chosenVenue && !isUuid(chosenVenue.id)) {
      setVenueDraftName(chosenVenue.name);
      setVenueDraftAddress("");
      setVenueDraftNotes("");
      setVenueDraftType("other");
      showDialog(
        "Add this venue first",
        `${chosenVenue.name} was detected nearby, but it is not in Left's venue database yet. Add it once before you can go visible there.`,
        [
          { label: "Cancel", onPress: () => setScreen("venue-select") },
          { label: "Add venue", variant: "primary", onPress: () => setScreen("venue-add") },
        ],
      );
      return;
    }
    setScreen(sessionVisible ? "venue" : "activate");
  }

  async function handleVenueDetailPrimaryAction() {
    if (!selectedVenueDetail) return;
    const isCurrentVenue =
      selectedVenueDetail.id === venueSummary.venueId ||
      selectedVenueDetail.name === venueSummary.venueName;

    if (isCurrentVenue) {
      if (sessionVisible) {
        setScreen("feed");
        return;
      }
      openActivationFrom("venue-detail");
      return;
    }

    await confirmVenueSelection(selectedVenueDetail.id);
  }

  async function submitVenueSuggestion() {
    if (!user || !lastKnownCoords) {
      showDialog("Venue location missing", "Move around the venue once so Left has a recent device location.");
      return;
    }
    if (!venueDraftName.trim() || !venueDraftAddress.trim()) {
      showDialog("Missing venue details", "Add both a venue name and an address or landmark.");
      return;
    }

    const submittedName = venueDraftName.trim();
    const duplicateVenue = pickBestNearbyVenueMatch(nearbyVenueOptions, submittedName);
    if (duplicateVenue) {
      setVenueDraftSubmitting(false);
      await confirmVenueSelection(duplicateVenue.id);
      showDialog("Venue already exists", `${duplicateVenue.name} is already pinned nearby, so Left reused it instead of creating a duplicate.`);
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
      showDialog("Venue submission failed", "We could not submit that venue yet.");
      return;
    }

    await storeUserSubmittedVenue({
      id: submittedVenue.id,
      name: submittedVenue.name,
      venueType: venueDraftType,
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
    showDialog(
      "Venue saved",
      `Use ${submittedVenue.name} as your current venue now?`,
      [
        { label: "Not now", onPress: () => setScreen("home") },
        {
          label: "Use this venue",
          variant: "primary",
          onPress: () => setScreen(sessionVisible ? "venue" : "activate"),
        },
      ],
    );
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
      setOnboardingUserId(null);
      setScreen(preAuthReadyRef.current && !preAuthSeenRef.current ? "preauth" : "auth");
      return;
    }

    const inferredFirstName = getFirstNameFromSession(session);
    setFirstNameDraft(inferredFirstName);

    const { profile, error } = await fetchUserProfile(session.user.id);
    if (error) {
      logAuthDebug("profile lookup failed", { message: error.message, code: error.code });
      setBootError("We could not load your profile. Your session is still secure.");
      setScreen("loading");
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
      setOnboardingUserId(session.user.id);
      const draft = await loadOnboardingDraft(session.user.id);
      if (draft) {
        setFirstNameDraft(draft.firstName || inferredFirstName);
        setAvatarStyleDraft(draft.avatarStyle);
        setScreen(onboardingScreenForStep(draft.step));
      } else {
        setFirstNameDraft(inferredFirstName);
        setAvatarStyleDraft("geometric");
        setScreen("onboarding-name");
      }
      return;
    }

    const appUser = mapProfileToAppUser(profile);
    if (
      legalContentReady &&
      CURRENT_LEGAL_VERSIONS.terms &&
      CURRENT_LEGAL_VERSIONS.privacy &&
      CURRENT_LEGAL_VERSIONS.community
    ) {
      const currentVersions = {
        terms: CURRENT_LEGAL_VERSIONS.terms,
        privacy: CURRENT_LEGAL_VERSIONS.privacy,
        community: CURRENT_LEGAL_VERSIONS.community,
      };
      const acceptance = await hasAcceptedLegalVersions(session.user.id, currentVersions);
      if (acceptance.error) {
        console.warn("[legal] acceptance lookup failed", acceptance.error);
        setBootError("We could not verify your policy choices. Your session is still secure.");
        setScreen("loading");
        return;
      }
      if (!acceptance.accepted) {
        setUser(appUser);
        setOnboardingUserId(session.user.id);
        setFirstNameDraft(appUser.firstName);
        setAvatarStyleDraft(appUser.avatarStyle);
        setScreen("legal-consent");
        return;
      }
    }
    setUser(appUser);
    setOnboardingUserId(null);
    void clearOnboardingDraft(session.user.id);
    setFirstNameDraft(profile.first_name);
    const syncedVenuePreferences = await syncVenuePreferencesForUser(appUser.id);
    setVenuePreferences(syncedVenuePreferences);
    setVenueHidden(!!syncedVenuePreferences[venueSummary.venueId]?.hidden);
    const recoveredActiveSession = await recoverActivePresenceSession(appUser);
    setScreen(recoveredActiveSession ? "venue" : "home");
  }

  async function startGoogleAuth() {
    setAuthError(null);
    setAuthBusy(true);
    try {
      const result = await startGoogleAuthSession(logAuthDebug);
      if (result.status === "failed") setAuthError(result.message);
      if (result.status === "cancelled") {
        setAuthError("Google sign-in was cancelled. Try again when you’re ready.");
      }
    } catch (error) {
      console.warn("[auth] Google sign-in failed", error);
      setAuthError("Google sign-in could not complete. Check your connection and try again.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function finishLocationStep() {
    setLocationError(null);
    setLocationBusy(true);
    try {
      const session = await getCurrentSession();
      if (!session) {
        setAuthError("Sign in again to finish onboarding.");
        setScreen("auth");
        return;
      }

      const locationResult = await requestLocationAccess();
      setLocationEnabled(locationResult.granted);
      setNotificationEnabled(locationResult.notificationsGranted);
      if (!locationResult.granted) {
        setLocationError(getLocationRecoveryMessage(locationResult.reason));
        return;
      }
      await primeLocationFix();
      await refreshVenueFromRuntime();
      await persistOnboardingStep("complete");
      setScreen("legal-consent");
    } catch (error) {
      console.warn("[onboarding] location step failed", error);
      setLocationError("Left could not finish the permission check. Try again, or review device settings.");
    } finally {
      setLocationBusy(false);
    }
  }

  async function finishOnboarding() {
    const validation = validateFirstName(firstNameDraft);
    if (!validation.valid) {
      setAuthError(validation.message);
      setScreen("onboarding-name");
      return;
    }
    if (legalContentReady && !Object.values(legalChecks).every(Boolean)) {
      setAuthError("Review and accept all published policies to finish.");
      return;
    }

    setOnboardingSaveBusy(true);
    setAuthError(null);
    try {
      const session = await getCurrentSession();
      if (!session) {
        setAuthError("Sign in again to finish onboarding.");
        setScreen("auth");
        return;
      }

      const now = new Date().toISOString();
      const authProvider = getProvider(session);
      const nextUser: AppUser = {
        id: session.user.id,
        authProvider,
        providerSubject: getProviderSubject(session, authProvider),
        firstName: validation.normalized,
        avatarStyle: avatarStyleDraft,
        defaultIntent: "networking",
        defaultVibes: ["Open"],
        interests: [],
        offering: "",
        socialRhythm: "",
        conversationStyle: "",
        profilePrompt: defaultProfilePrompt,
        approachPrompt: defaultApproachPrompt,
        focusModeEnabled: false,
        promptsEnabled: true,
        identityRemoved: false,
        onboardingCompleted: true,
        createdAt: now,
        updatedAt: now,
      };

      const versions =
        legalContentReady &&
        CURRENT_LEGAL_VERSIONS.terms &&
        CURRENT_LEGAL_VERSIONS.privacy &&
        CURRENT_LEGAL_VERSIONS.community
          ? {
              terms: CURRENT_LEGAL_VERSIONS.terms,
              privacy: CURRENT_LEGAL_VERSIONS.privacy,
              community: CURRENT_LEGAL_VERSIONS.community,
            }
          : null;
      if (user?.onboardingCompleted) {
        if (!versions) {
          setScreen("home");
          return;
        }
        const acceptance = await recordLegalAcceptance(versions);
        if (!acceptance.ok) {
          console.warn("[legal] acceptance save failed", acceptance.error);
          setAuthError("Your acceptance could not be saved. Check your connection and try again.");
          return;
        }
        setAuthError(null);
        setScreen("home");
        return;
      }

      const result = await upsertOnboardingProfile(
        nextUser,
        versions ? { versions } : null,
      );
      if (!result.ok) {
        console.warn("[onboarding] profile save failed", result.error);
        setAuthError("Your choices could not be saved. Check your connection and try again.");
        return;
      }

      setUser(nextUser);
      setOnboardingUserId(null);
      await clearOnboardingDraft(session.user.id);
      setScreen("home");
    } catch (error) {
      console.warn("[onboarding] completion failed", error);
      setAuthError(
        error instanceof UnsupportedAuthProviderError
          ? "This session is not linked to Google or Apple. Sign out, then continue with Google."
          : "Left could not finish setting up your profile. Check your connection and try again.",
      );
    } finally {
      setOnboardingSaveBusy(false);
    }
  }

  function openDeviceSettings() {
    void Linking.openSettings().catch(() => {
      showDialog("Open device settings", "Open your device settings and allow location access for Left.");
    });
  }

  async function continueNameStep() {
    const validation = validateFirstName(firstNameDraft);
    if (!validation.valid) {
      setAuthError(validation.message);
      return;
    }
    setFirstNameDraft(validation.normalized);
    setAuthError(null);
    await persistOnboardingStep("legal");
    setScreen("onboarding-legal");
  }

  async function continueLegalStep() {
    if (!legalChecks.community) {
      setAuthError("Agree to the community pledge to continue.");
      return;
    }
    setAuthError(null);
    await persistOnboardingStep("notifications");
    setScreen("onboarding-notifications");
  }

  async function finishNotificationStep(requestPermission: boolean) {
    setNotificationBusy(true);
    try {
      const enabled = requestPermission
        ? await requestNotificationAccess()
        : notificationEnabled;
      setNotificationEnabled(enabled);
      await persistOnboardingStep("location");
      setScreen("onboarding-location");
    } finally {
      setNotificationBusy(false);
    }
  }

  function toggleVibe(vibe: string) {
    setSelectedVibes((current) => {
      const exists = current.includes(vibe);
      if (exists) return current;
      return [vibe];
    });
  }

  async function activatePresence() {
    if (!user) return;
    if (activationAttemptRef.current) return;
    activationAttemptRef.current = true;
    setActivationSubmitting(true);

    try {
      await performPresenceActivation();
    } catch {
      showDialog("Could not start visibility", "Left could not complete the location check. Please try again.");
    } finally {
      activationAttemptRef.current = false;
      setActivationSubmitting(false);
    }
  }

  async function performPresenceActivation() {
    if (!user) return;
    let runtime = await getLocationRuntimeState();
    console.info("[activation] starting presence activation", {
      permissionGranted: runtime.permissionGranted,
      hasLocationFix: !!runtime.lastKnownCoords,
      currentVenueId: runtime.currentVenueId,
      currentVenueName: runtime.currentVenueName,
      selectedVenueId: runtime.selectedVenueId,
      selectedVenueName: runtime.selectedVenueName,
      nearbyVenues: summarizeVenueCandidates(runtime.nearbyVenues),
    });
    if (!runtime.permissionGranted) {
      const locationResult = await requestLocationAccess();
      setLocationEnabled(locationResult.granted);
      if (!locationResult.granted) {
        showDialog(
          "Location needed",
          locationResult.reason === "background_denied"
            ? "Allow 'Always' location access so Left can confirm your venue before you go visible."
            : "Left needs location access to confirm your venue before you go visible.",
        );
        return;
      }

      await primeLocationFix();
      await refreshVenueFromRuntime();
      runtime = await getLocationRuntimeState();
    } else {
      await primeLocationFix();
      await refreshVenueFromRuntime();
      runtime = await getLocationRuntimeState();
    }

    console.info("[activation] runtime after location refresh", {
      permissionGranted: runtime.permissionGranted,
      hasLocationFix: !!runtime.lastKnownCoords,
      currentVenueId: runtime.currentVenueId,
      currentVenueName: runtime.currentVenueName,
      selectedVenueId: runtime.selectedVenueId,
      selectedVenueName: runtime.selectedVenueName,
      nearbyVenues: summarizeVenueCandidates(runtime.nearbyVenues),
    });

    const matchedCanonicalVenue =
      runtime.selectedVenueId && isUuid(runtime.selectedVenueId)
        ? runtime.nearbyVenues.find((venue) => venue.id === runtime.selectedVenueId) ?? null
        : runtime.nearbyVenues.find((venue) => isUuid(venue.id)) ?? null;
    const resolvedVenueId = isUuid(venueSummary.venueId)
      ? venueSummary.venueId
      : matchedCanonicalVenue?.id ?? null;
    const resolvedVenueName =
      venueSummary.venueName !== "Visibility off"
        ? venueSummary.venueName
        : matchedCanonicalVenue?.name ?? runtime.currentVenueName ?? runtime.selectedVenueName ?? venueSummary.venueName;

    console.info("[activation] resolved venue candidate", {
      venueSummaryVenueId: venueSummary.venueId,
      venueSummaryVenueName: venueSummary.venueName,
      matchedCanonicalVenueId: matchedCanonicalVenue?.id ?? null,
      matchedCanonicalVenueName: matchedCanonicalVenue?.name ?? null,
      resolvedVenueId,
      resolvedVenueName,
    });

    if (venueSelectionRequired) {
      setScreen("venue-select");
      return;
    }
    if (venueHidden) {
      showDialog("Venue hidden", "Unhide this venue in Settings before becoming visible here again.");
      return;
    }
    if (!resolvedVenueId || !isUuid(resolvedVenueId)) {
      const detectedVenue = runtime.nearbyVenues[0] ?? null;
      console.warn("[activation] venue unresolved after refresh", {
        permissionGranted: runtime.permissionGranted,
        hasLocationFix: !!runtime.lastKnownCoords,
        currentVenueId: runtime.currentVenueId,
        currentVenueName: runtime.currentVenueName,
        selectedVenueId: runtime.selectedVenueId,
        selectedVenueName: runtime.selectedVenueName,
        resolvedVenueId,
        detectedVenue: detectedVenue
          ? {
              id: detectedVenue.id,
              name: detectedVenue.name,
              source: detectedVenue.source,
              isUuid: isUuid(detectedVenue.id),
              distanceMeters: detectedVenue.distanceMeters ?? null,
            }
          : null,
        nearbyVenues: summarizeVenueCandidates(runtime.nearbyVenues),
      });
      if (detectedVenue && !isUuid(detectedVenue.id)) {
        setVenueDraftName(detectedVenue.name);
        setVenueDraftAddress("");
        setVenueDraftNotes("");
        setVenueDraftType("other");
        showDialog(
          "Venue found nearby",
          `${detectedVenue.name} was detected nearby, but it is not a confirmed Left venue yet. Add it first, then you can go visible there.`,
          [
            { label: "Cancel" },
            { label: "Add venue", variant: "primary", onPress: () => setScreen("venue-add") },
          ],
        );
        return;
      }

      if (!runtime.permissionGranted) {
        showDialog("Location needed", "Left does not have location permission yet, so it cannot confirm your venue.");
        return;
      }

      if (!runtime.lastKnownCoords) {
        showDialog("Location not ready", "Left does not have a recent location fix yet. Wait a moment and try again.");
        return;
      }

      showDialog("Venue not ready", "Left could not confirm a nearby venue from your current location yet.");
      return;
    }
    const startedAtDate = new Date();
    const startedAt = startedAtDate.toISOString();
    const expiresAt = new Date(startedAtDate.getTime() + selectedDuration * 60_000).toISOString();
    const intent = selectedIntent ?? "networking";
    const vibes = normalizeSingleVibe(selectedVibes);
    const hintText = hintDraft.trim() || null;
    try {
      void saveLastActivationDefaults({
        intent,
        vibes,
        durationMinutes: selectedDuration,
        hintText: hintDraft,
      });

      if (isUuid(user.id) && isUuid(resolvedVenueId)) {
        await endOpenPresenceSessionsForUser(user.id);
        const presenceSessionId = await createPresenceSession({
          userId: user.id,
          venueId: resolvedVenueId,
          intent,
          vibes,
          hintText,
          startedAt,
          expiresAt,
        });

        if (!presenceSessionId) {
          showDialog("Could not start visibility", "Your session was not saved. Try again before becoming visible.");
          return;
        }

        setActivePresenceSessionId(presenceSessionId);
        void recordSocialInteractionEvent("became_visible", { visibilitySessionId: presenceSessionId });
        await refreshVenueContext(resolvedVenueId);
        await refreshNearbyFeed(user.id, resolvedVenueId);
      } else {
        setActivePresenceSessionId(null);
        setSocialMomentumEvents([]);
      }

      setSessionNowMs(Date.now());
      setSessionStartedAt(startedAt);
      setSessionExpiresAt(expiresAt);
      setSessionVisible(true);
      setVenueSummary((current) => ({
        ...current,
        venueId: resolvedVenueId,
        venueName: resolvedVenueName,
        pulseCopy: "You are now visible at this venue.",
      }));
      showToast("You are visible");
      setVenueFooterDestination("session");
      setScreen("venue");
    } catch {
      showDialog("Could not start visibility", "Please try again.");
    }
  }

  function openProfile(item: NearbyFeedItem) {
    setProfileReturnScreen(screen === "profile" ? "feed" : screen);
    setSelectedProfile(item);
    void recordSocialInteractionEvent("profile_viewed", {
      targetUserId: item.profileUserId,
      visibilitySessionId: activePresenceSessionId ?? item.presenceSessionId,
    });
    setScreen("profile");
  }

  async function submitExperienceDraft(draft: Omit<ExperienceProposalInput, "hostUserId">) {
    if (!user) return;
    setExperienceProposalBusy(true);
    setExperienceProposalError(null);
    try {
      const submitted = await submitExperienceProposal({ ...draft, hostUserId: user.id });
      if (!submitted) {
        setExperienceProposalError("We couldn’t submit this plan. Check your connection and try again.");
        return;
      }
      showToast("Sent for review");
      setScreen("home");
    } finally {
      setExperienceProposalBusy(false);
    }
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
    const nextApproachPrompt = resolveApproachPromptForVenue(venueSummary.venueId);
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
        showDialog("Could not start approach", "Please try again.");
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
      approachPrompt: nextApproachPrompt,
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
    setActiveApproachPrompt(nextApproachPrompt);
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
        showDialog("Could not confirm connection", "Please try again.");
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

  async function cancelApproach() {
    const cancelledAt = new Date().toISOString();
    if (approach && isUuid(approach.id)) {
      const updated = await markApproachCancelled({ approachId: approach.id, cancelledAt });
      if (!updated) {
        showDialog("Could not cancel approach", "Please try again so the cancellation is saved.");
        return;
      }
    }

    await clearStoredActiveApproach();
    await clearPendingApproachFeedback();
    setPendingApproachFeedback(null);
    void recordSocialInteractionEvent("approach_cancelled", {
      targetUserId: approach?.toUserId ?? selectedProfile?.profileUserId ?? null,
      visibilitySessionId: activePresenceSessionId ?? approach?.presenceSessionId ?? null,
      metadata: { approachId: approach?.id ?? null },
    });
    setApproach(null);
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
          showDialog("Could not hide person", "Please try again.");
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
          showDialog("Could not block person", "Please try again.");
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
        showDialog("Could not submit report", "Please try again.");
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
      setScreen("home");
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
    interests: string[];
    offering: string;
    socialRhythm: string;
    conversationStyle: string;
    profilePrompt: string;
  }) {
    if (!user) return;
    setSettingsSaveState("saving");
    const nextUser: AppUser = {
      ...user,
      firstName: input.firstName.trim() || user.firstName,
      avatarStyle: input.avatarStyle,
      defaultIntent: input.defaultIntent,
      defaultVibes: input.defaultVibes,
      interests: input.interests,
      offering: input.offering.trim(),
      socialRhythm: input.socialRhythm.trim(),
      conversationStyle: input.conversationStyle.trim(),
      profilePrompt: input.profilePrompt.trim() || defaultProfilePrompt,
      approachPrompt: user.approachPrompt.trim() || defaultApproachPrompt,
      updatedAt: new Date().toISOString(),
    };
    const saved = await updateUserSettings({
      userId: user.id,
      firstName: nextUser.firstName,
      avatarStyle: nextUser.avatarStyle,
      defaultIntent: nextUser.defaultIntent,
      defaultVibes: normalizeSingleVibe(nextUser.defaultVibes),
      interests: nextUser.interests,
      offering: nextUser.offering,
      socialRhythm: nextUser.socialRhythm,
      conversationStyle: nextUser.conversationStyle,
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
    setSelectedVibes(normalizeSingleVibe(nextUser.defaultVibes));
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
    setSelectedProfile(null);
    setSelectedExperience(null);
    setSavedVenues([]);
    setExperiences([]);
    void endSessionState("session_ended", { toast: false });
    setApproach(null);
    setActiveApproachPrompt(defaultApproachPrompt);
    setAuthError(null);
    setSettingsSaveState("idle");
    setDeletionRequestState("idle");
    setReportSubmitting(false);
    setActivationSubmitting(false);
    activationAttemptRef.current = false;
    setProfileAction(null);
    setVisibilityAction(null);
    setReportCategory("unsafe_behavior");
    setReportNotes("");
    setScreen("auth");
  }

  async function endSessionState(
    status: "paused" | "session_ended" = "session_ended",
    options: { toast?: boolean; toastMessage?: string } = {},
  ) {
    if (visibilityAction) return;
    setVisibilityAction(status === "paused" ? "pause" : "end");
    const sessionId = activePresenceSessionId;
    try {
      setSessionVisible(false);
      setSessionStartedAt(null);
      setSessionExpiresAt(null);
      setActivePresenceSessionId(null);
      setSocialMomentumEvents([]);
      setSessionNowMs(Date.now());
      setSelectedProfile(null);
      setFeed([]);

      if (isUuid(sessionId)) {
        const updated = await updatePresenceSessionEndState(sessionId, status);

        if (!updated) {
          showDialog("Could not update visibility", "Your local session is hidden, but the server did not confirm the change.");
        }
      }
      if (options.toast !== false) {
        showToast(options.toastMessage ?? (status === "paused" ? "Visibility paused" : "Session ended"));
      }
    } finally {
      setVisibilityAction(null);
    }
  }

  async function requestAccountDeletion() {
    if (!user) return;
    showDialog(
      "Remove your identity from Left?",
      "This requests removal of your direct identity details and may sign you out when processing completes. Retained safety and operational records remain under the current policy.",
      [
        { label: "Keep my identity", variant: "ghost" },
        {
          label: "Request removal",
          variant: "destructive",
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
      showDialog("Identity removal", "You already have an open identity-removal request.");
      return;
    }

    if (result === "failed") {
      setDeletionRequestState("error");
      showDialog("Identity removal failed", "We could not create your identity-removal request.");
      return;
    }

    if (result === "queued") {
      setDeletionRequestState("submitted");
      showDialog(
        "Identity removal queued",
        "We recorded your request, but backend processing did not finish yet. Your request is still on file for follow-up.",
        [
          {
            label: "OK",
            variant: "primary",
            onPress: () => {
              void signOut();
            },
          },
        ],
      );
      return;
    }

    setDeletionRequestState("submitted");
    showDialog(
      "Identity removed",
      "Direct identity fields were removed. Your retained records stay in place under the current policy.",
      [
        {
          label: "OK",
          variant: "primary",
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
      setSelectedVenueDetail(null);
      setScreen("home");
      return;
    }
    if (destination === "nearby") {
      setSelectedProfile(null);
      setSelectedVenueDetail(null);
      if (sessionVisible) {
        setScreen("feed");
      } else {
        setVenueFooterDestination("nearby");
        setScreen("venue");
      }
      return;
    }
    if (destination === "session") {
      setSelectedProfile(null);
      setSelectedVenueDetail(null);
      setVenueFooterDestination("session");
      setScreen("venue");
      return;
    }
    setSelectedProfile(null);
    setSelectedVenueDetail(null);
    setScreen("me");
  }

  const footerSummary = {
    venueName: displayVenueSummary.venueName,
    intent: selectedIntent,
    vibe: selectedVibes[0] ?? "Open",
    sessionVisible,
    activeDestination: getFooterDestination(screen, {
      safetyReturnScreen,
      venueDestination: venueFooterDestination,
    }),
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
  const venueConfidence = resolveVenueConfidence(venueSummary, nearbyVenueOptions);
  const venueConfidenceLabel = getVenueConfidenceLabel(venueConfidence);
  const venueConfidenceCopy = getVenueConfidenceCopy(venueConfidence);
  const locationStatus = locationEnabled
    ? Platform.OS === "web"
      ? "Foreground location is available while this preview is open."
      : "Background location is active. Venue matching runs on-device and only venue IDs are used for app state."
    : "Background location is not enabled yet.";
  const isOnboardingScreen = screen.startsWith("onboarding-") || screen === "legal-consent";
  const isPreAuthScreen = screen === "preauth";
  const isFullBleedScreen = screen === "auth" || screen === "legal" || screen === "loading" || isPreAuthScreen;
  const isSessionNavScreen = SESSION_NAV_SCREENS.includes(screen);
  const isRefreshableScreen = REFRESHABLE_SCREENS.includes(screen);
  const scrollContentPaddingTop =
    isSessionNavScreen ? 20 : screen === "venue-detail" || isFullBleedScreen ? 0 : Math.max(56, insets.top + 20);
  const scrollContentPaddingBottom = isSessionNavScreen
    ? 36
    : isOnboardingScreen || screen === "venue-detail"
    ? 24 + insets.bottom
    : 72 + insets.bottom;

  return (
    <View style={styles.shell}>
      {screen !== "me" && !isOnboardingScreen && !isFullBleedScreen ? <BackgroundWaveLayer /> : null}
      {isRefreshableScreen ? (
        <LeftRefreshIndicator
          pullDistance={refreshPullDistance}
          refreshing={discoveryRefreshing}
          topInset={insets.top}
        />
      ) : null}
      <ScrollView
        ref={mainScrollRef}
        contentInsetAdjustmentBehavior={isFullBleedScreen || isSessionNavScreen || screen === "venue-detail" ? "never" : "automatic"}
        style={isSessionNavScreen
          ? { marginTop: insets.top, marginBottom: 62 + insets.bottom }
          : screen === "venue-detail" ? { marginTop: insets.top } : undefined}
        bounces={isRefreshableScreen}
        alwaysBounceVertical={isRefreshableScreen}
        refreshControl={isRefreshableScreen ? (
          <RefreshControl
            refreshing={discoveryRefreshing}
            onRefresh={() => void refreshDiscoverySurface()}
            tintColor="transparent"
            colors={["transparent"]}
            progressBackgroundColor="transparent"
          />
        ) : undefined}
        onScroll={isRefreshableScreen ? (event) => {
          const nextDistance = Math.max(0, Math.round(-event.nativeEvent.contentOffset.y));
          setRefreshPullDistance((current) => current === nextDistance ? current : nextDistance);
        } : undefined}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: scrollContentPaddingTop,
            paddingBottom: scrollContentPaddingBottom,
          },
          isFullBleedScreen && styles.fullContent,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {screen === "loading" && <LoadingScreen error={bootError} onRetry={() => void bootstrapSession()} />}
        {screen === "preauth" && <PreAuthOnboardingScreen onComplete={() => void completePreAuthOnboarding()} />}
        {screen === "auth" && (
          <AuthScreen
            authError={authError}
            busy={authBusy}
            onAuth={startGoogleAuth}
            onBack={() => setScreen("preauth")}
            onOpenLegal={(document) => openLegalDocument(document, "auth")}
          />
        )}
        {screen === "legal" && (
          <LegalScreen documentId={activeLegalDocument} onBack={() => setScreen(legalReturnScreen)} />
        )}
        {screen === "onboarding-name" && (
          <NameScreen
            firstNameDraft={firstNameDraft}
            onChangeFirstName={setFirstNameDraft}
            avatarStyle={avatarStyleDraft}
            onPickAvatar={setAvatarStyleDraft}
            onContinue={() => void continueNameStep()}
            onBack={goBackInOnboarding}
          />
        )}
        {screen === "onboarding-legal" && (
          <LegalAcknowledgementScreen
            checks={legalChecks}
            onToggle={(document) =>
              setLegalChecks((current) => ({ ...current, [document]: !current[document] }))
            }
            onOpenDocument={(document) => openLegalDocument(document, "onboarding-legal")}
            onBack={goBackInOnboarding}
            onContinue={() => void continueLegalStep()}
            error={authError}
          />
        )}
        {screen === "onboarding-notifications" && (
          <NotificationScreen
            enabled={notificationEnabled}
            busy={notificationBusy}
            onContinue={() => void finishNotificationStep(true)}
            onSkip={() => void finishNotificationStep(false)}
            onBack={goBackInOnboarding}
          />
        )}
        {screen === "onboarding-location" && (
          <LocationScreen
            authError={locationError || authError}
            busy={locationBusy || onboardingSaveBusy}
            onContinue={() => void finishLocationStep()}
            onBack={goBackInOnboarding}
            onOpenSettings={openDeviceSettings}
          />
        )}
        {screen === "legal-consent" && (
          <LegalAcknowledgementScreen
            checks={legalChecks}
            onToggle={(document) =>
              setLegalChecks((current) => ({ ...current, [document]: !current[document] }))
            }
            onOpenDocument={(document) => openLegalDocument(document, "legal-consent")}
            onBack={user?.onboardingCompleted ? () => void forceLocalSignOut() : goBackInOnboarding}
            onContinue={() => void finishOnboarding()}
            busy={onboardingSaveBusy}
            error={authError}
            standalone
          />
        )}
        {screen === "venue-select" && (
          <VenueSelectionScreen
            venues={nearbyVenueOptions}
            currentVenueId={venueSummary.venueId}
            onSelectVenue={(venueId) => void confirmVenueSelection(venueId)}
            onAddVenue={() => setScreen("venue-add")}
            onBack={() => setScreen(sessionVisible ? "venue" : "home")}
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
            venue={venueSummary}
            nearbyVenues={nearbyVenueOptions}
            venueActivityById={venueActivityById}
            experiences={experiences}
            feed={visibleFeed}
            intent={selectedIntent}
            vibes={selectedVibes}
            sessionVisible={sessionVisible}
            venueHidden={venueHidden}
            activationSubmitting={activationSubmitting}
            onBecomeVisible={() => openActivationFrom("home")}
            onOpenAllVenues={() => {
              setVenueFooterDestination("session");
              setScreen("venue");
            }}
            onOpenVenueDetail={(venueCandidate) => openVenueDetail(venueCandidate, "home")}
            onOpenProfile={openProfile}
            onOpenExperience={(experience) => openExperience(experience, "home")}
            onCreateExperience={() => {
              setExperienceProposalError(null);
              setScreen("experience-create");
            }}
            onOpenSafety={() => openSafetyFrom("home")}
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
            onActivate={() => openActivationFrom("venue")}
            onOpenFeed={() => setScreen(sessionVisible ? "feed" : "venue")}
            onOpenProfile={openProfile}
            onOpenVenueDetail={(venueCandidate) => openVenueDetail(venueCandidate, "venue")}
            onSocialMomentumPrimary={handleSocialMomentumPrimary}
            onDismissSocialMomentum={dismissSocialMomentumPrompt}
            onChooseVenue={() => setScreen("venue-select")}
            onAddVenue={() => setScreen("venue-add")}
            onOpenSafety={() => openSafetyFrom("venue")}
            nearbyVenues={nearbyVenueOptions}
            venueActivityById={venueActivityById}
            lastKnownCoords={lastKnownCoords}
          />
        )}
        {screen === "venue-detail" && selectedVenueDetail && (
          <VenueDetailScreen
            venue={selectedVenueDetail}
            venueSummary={venueSummary}
            venueActivity={isUuid(selectedVenueDetail.id) ? venueActivityById[selectedVenueDetail.id] ?? null : null}
            feed={visibleFeed}
            sessionVisible={sessionVisible}
            detailsLoading={venueDetailsLoading}
            saved={savedVenues.some((entry) => entry.venueId === selectedVenueDetail.id)}
            saving={savingVenueId === selectedVenueDetail.id}
            onBack={() => setScreen(venueDetailReturnScreen)}
            onPrimaryAction={() => void handleVenueDetailPrimaryAction()}
            onToggleSaved={() => void toggleSavedVenue(selectedVenueDetail)}
          />
        )}
        {screen === "experience-detail" && selectedExperience && (
          <ExperienceDetailScreen
            experience={selectedExperience}
            attendanceBusy={attendanceBusy}
            onBack={() => setScreen(experienceReturnScreen)}
            onToggleAttendance={() => void toggleSelectedExperienceAttendance()}
            onOpenVenue={openSelectedExperienceVenue}
          />
        )}
        {screen === "experience-create" && (
          <ExperienceCreateScreen
            venues={nearbyVenueOptions}
            defaultVenueId={isUuid(venueSummary.venueId) ? venueSummary.venueId : null}
            submitting={experienceProposalBusy}
            submitError={experienceProposalError}
            onBack={() => setScreen("home")}
            onSubmit={(draft) => void submitExperienceDraft(draft)}
          />
        )}
        {screen === "activate" && (
          <ActivationScreen
            sessionVisible={sessionVisible}
            venueHidden={venueHidden}
            venueName={venueSummary.venueName}
            venueConfidenceLabel={venueConfidenceLabel}
            venueConfidenceCopy={venueConfidenceCopy}
            selectedIntent={selectedIntent}
            selectedVibes={selectedVibes}
            selectedDuration={selectedDuration}
            hintDraft={hintDraft}
            elapsedSeconds={elapsedSessionSeconds}
            activationSubmitting={activationSubmitting}
            endingSession={visibilityAction === "end"}
            onBack={() => setScreen(activationReturnScreen)}
            onPickIntent={setSelectedIntent}
            onToggleVibe={toggleVibe}
            onPickDuration={setSelectedDuration}
            onChangeHint={setHintDraft}
            onActivate={activatePresence}
            onOpenFeed={() => setScreen("feed")}
            onEndSession={() => {
              endSessionState();
              setScreen("home");
            }}
          />
        )}
        {screen === "feed" && (
          <FeedScreen
            venue={displayVenueSummary}
            feed={visibleFeed}
            sessionVisible={sessionVisible}
            onOpenProfile={openProfile}
            onOpenVenueDetail={() => openVenueDetail(undefined, "feed")}
            onOpenSafety={() => openSafetyFrom("feed")}
          />
        )}
        {screen === "profile" && selectedProfile && (
          <ProfileScreen
            item={selectedProfile}
            reportCategory={reportCategory}
            reportNotes={reportNotes}
            reportSubmitting={reportSubmitting}
            profileAction={profileAction}
            viewerInterests={user?.interests ?? []}
            onBack={() => setScreen(profileReturnScreen)}
            onApproach={() => void startApproach()}
            onHide={() => void hideUser()}
            onBlock={() => void blockUser()}
            onChangeReportCategory={setReportCategory}
            onChangeReportNotes={setReportNotes}
            onReport={() => void reportUser()}
            onOpenSafety={() => openSafetyFrom("profile")}
            onShowDialog={showDialog}
          />
        )}
        {screen === "approach" && selectedProfile && approach && (
          <ApproachScreen
            item={selectedProfile}
            approachPrompt={activeApproachPrompt}
            remainingSeconds={approachRemainingSeconds}
            onCancel={() => void cancelApproach()}
            onConfirmConnected={() => void confirmConnected()}
            onOpenSafety={() => openSafetyFrom("approach")}
          />
        )}
        {screen === "safety" && (
          <SafetyScreen
            venueName={sessionVisible ? venueSummary.venueName : "current venue"}
            venueHidden={venueHidden || !!currentVenuePreference?.hidden}
            venueMuted={!!currentVenuePreference?.muted}
            venueAction={safetyVenueAction}
            venueMessage={currentVenuePreferenceMessage}
            venuePreferences={Object.values(venuePreferences).filter((preference) => preference.hidden || preference.muted)}
            venuePreferenceAction={venuePreferenceAction}
            venuePreferenceMessage={venuePreferenceMessage}
            locationStatus={locationStatus}
            visibilityAction={visibilityAction}
            sessionVisible={sessionVisible}
            onBack={() => setScreen(safetyReturnScreen)}
            onGoVisible={() => openActivationFrom("safety")}
            onPauseVisibility={() => void endSessionState("paused")}
            onEndSession={() => {
              void endSessionState();
              setScreen("home");
            }}
            onHideVenue={() => void hideVenuePermanently()}
            onMuteVenue={() => void muteVenueNotifications()}
            onClearVenueHidden={(venueId, venueName) => void clearVenueHidden(venueId, venueName)}
            onClearVenueMuted={(venueId, venueName) => void clearVenueMuted(venueId, venueName)}
            onShowDialog={showDialog}
          />
        )}
        {screen === "settings" && user && (
          <SettingsScreen
            user={user}
            deletionState={deletionRequestState}
            onOpenSafety={() => openSafetyFrom("settings")}
            onSignOut={() => void signOut()}
            onRequestDeletion={() => void requestAccountDeletion()}
            onShowDialog={showDialog}
            onBack={() => setScreen("me")}
            onOpenLegal={(document) => openLegalDocument(document, "settings")}
          />
        )}
        {screen === "saved" && (
          <SavedPlacesScreen
            venues={savedVenues}
            onBack={() => setScreen("me")}
            onOpenVenue={openSavedVenue}
            onExplore={() => {
              setVenueFooterDestination("session");
              setScreen("venue");
            }}
          />
        )}
        {screen === "me" && user && (
          <MeScreen
            user={user}
            saveState={settingsSaveState}
            onSave={(input) => void saveSettings(input)}
            onOpenSettings={() => setScreen("settings")}
            sessionVisible={sessionVisible}
            currentVenueName={displayVenueSummary.venueName}
            currentIntent={selectedIntent}
            currentVibes={selectedVibes}
            nearbyVenueCount={nearbyVenueOptions.length}
            approachCount={socialMomentumEvents.filter((eventType) => eventType === "approach_started").length}
            savedVenueCount={savedVenues.length}
            onOpenSaved={() => setScreen("saved")}
            onBecomeVisible={() => openActivationFrom("me")}
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
          showContextSummary={false}
          bottomInset={insets.bottom}
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
      <AppDialog
        visible={!!dialogState}
        title={dialogState?.title ?? ""}
        message={dialogState?.message ?? ""}
        actions={(dialogState?.actions ?? [{ label: "OK", variant: "primary" }]).map((action) => ({
          label: action.label,
          variant: action.variant,
          onPress: () => {
            dismissDialog();
            action.onPress?.();
          },
        }))}
      />
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
    interests: profile.interests ?? [],
    offering: profile.offering?.trim() ?? "",
    socialRhythm: profile.social_rhythm?.trim() ?? "",
    conversationStyle: profile.conversation_style?.trim() ?? "",
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
