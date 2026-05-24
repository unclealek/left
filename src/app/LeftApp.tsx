import { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import type { Session } from "@supabase/supabase-js";
import { SessionFooterNav } from "../components/left/navigation";
import {
  AUTH_CALLBACK_PATH,
  NATIVE_AUTH_REDIRECT,
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
  NearbyFeedItem,
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

WebBrowser.maybeCompleteAuthSession();

function logAuthDebug(step: string, payload?: Record<string, unknown>) {
  if (payload) {
    console.info(`[auth] ${step}`, payload);
    return;
  }
  console.info(`[auth] ${step}`);
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
  const [selectedIntent, setSelectedIntent] = useState<AppUser["defaultIntent"]>("networking");
  const [selectedVibes, setSelectedVibes] = useState<string[]>(["AI/startups"]);
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [hintDraft, setHintDraft] = useState("Grey hoodie, corner seat");
  const [approach, setApproach] = useState<ApproachAttempt | null>(null);
  const [venueHidden, setVenueHidden] = useState(false);
  const [sessionVisible, setSessionVisible] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [settingsSaveState, setSettingsSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [deletionRequestState, setDeletionRequestState] = useState<"idle" | "submitting" | "submitted" | "error">("idle");

  const visibleFeed = useMemo(() => (venueHidden ? [] : feed), [feed, venueHidden]);

  useEffect(() => {
    void bootstrapSession();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncSession(session, false);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function bootstrapSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    logAuthDebug("bootstrap session", {
      hasSession: !!session,
      userId: session?.user.id ?? null,
      provider: session?.user.app_metadata.provider ?? null,
    });
    await syncSession(session, true);
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

    const { data, error } = await supabase.from("users").select("*").eq("id", session.user.id).maybeSingle();
    if (error) {
      logAuthDebug("profile lookup failed", { message: error.message, code: error.code });
      setAuthError("Could not load your profile.");
      setScreen("auth");
      return;
    }

    const profile = data as UserProfileRow | null;
    logAuthDebug("profile lookup complete", {
      hasProfile: !!profile,
      onboardingCompleted: profile?.onboarding_completed ?? null,
    });
    if (!profile || !profile.onboarding_completed) {
      setUser(null);
      setScreen("onboarding-name");
      return;
    }

    setUser(mapProfileToAppUser(profile));
    setFirstNameDraft(profile.first_name);
    setAuthProvider(profile.auth_provider);
    if (isInitialLoad) {
      setScreen("loading");
      await delay(2000);
    }
    setScreen("venue");
  }

  async function startGoogleAuth() {
    setAuthError(null);
    const redirectTo = makeRedirectUri({
      scheme: "left",
      path: AUTH_CALLBACK_PATH,
      native: NATIVE_AUTH_REDIRECT,
    });
    logAuthDebug("starting google auth", {
      redirectTo,
      expectedNativeRedirect: NATIVE_AUTH_REDIRECT,
      usingExpoGo: redirectTo.startsWith("exp://"),
    });
    if (redirectTo.startsWith("exp://")) {
      logAuthDebug("expo go redirect detected", {
        message: "OAuth redirects are more reliable in a development build or standalone app with the native left:// scheme.",
      });
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error) {
      logAuthDebug("oauth url generation failed", { message: error.message, code: error.code, status: error.status });
      setAuthError("Google sign-in could not start.");
      return;
    }
    if (!data?.url) {
      logAuthDebug("oauth url missing");
      setAuthError("Google sign-in did not return an auth URL.");
      return;
    }

    logAuthDebug("oauth url generated", { authUrl: data.url });
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    logAuthDebug("browser auth result", result.type === "success" ? { type: result.type, url: result.url } : { type: result.type });
    if (result.type !== "success" || !result.url) return;

    const { params, errorCode } = QueryParams.getQueryParams(result.url);
    if (errorCode) {
      logAuthDebug("callback query parsing failed", { errorCode, url: result.url });
      setAuthError("Google sign-in did not complete.");
      return;
    }

    const accessToken = typeof params.access_token === "string" ? params.access_token : null;
    const refreshToken = typeof params.refresh_token === "string" ? params.refresh_token : null;
    const authCode = typeof params.code === "string" ? params.code : null;

    if (accessToken && refreshToken) {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (sessionError) {
        logAuthDebug("session set failed", { message: sessionError.message, code: sessionError.code, status: sessionError.status });
        setAuthError("Google sign-in did not complete.");
        return;
      }
      logAuthDebug("session set from callback tokens");
      return;
    }

    if (authCode) {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(authCode);
      if (exchangeError) {
        logAuthDebug("session exchange failed", { message: exchangeError.message, code: exchangeError.code, status: exchangeError.status });
        setAuthError("Google sign-in did not complete.");
        return;
      }
      logAuthDebug("session exchange complete");
      return;
    }

    logAuthDebug("callback missing auth tokens and code", { url: result.url, params });
    setAuthError("Google sign-in did not complete.");
  }

  async function finishOnboarding() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setAuthError("Sign in again to finish onboarding.");
      setScreen("auth");
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

    const { error } = await supabase.from("users").upsert(
      {
        id: nextUser.id,
        auth_provider: nextUser.authProvider,
        provider_subject: nextUser.providerSubject,
        first_name: nextUser.firstName,
        avatar_style: nextUser.avatarStyle,
        default_intent: nextUser.defaultIntent,
        default_vibes: nextUser.defaultVibes,
        profile_prompt: nextUser.profilePrompt,
        approach_prompt: nextUser.approachPrompt,
        focus_mode_enabled: nextUser.focusModeEnabled,
        prompts_enabled: nextUser.promptsEnabled,
        onboarding_completed: nextUser.onboardingCompleted,
      },
      { onConflict: "id" },
    );
    if (error) {
      setAuthError("We could not save onboarding yet.");
      return;
    }

    setUser(nextUser);
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

  function activatePresence() {
    setSessionVisible(true);
    setVenueSummary((current) => ({
      ...current,
      visibleCount: Math.max(1, current.visibleCount),
      pulseCopy: "1 person is active nearby right now.",
    }));
    setScreen("feed");
  }

  function openProfile(item: NearbyFeedItem) {
    setSelectedProfile(item);
    setScreen("profile");
  }

  function sendWave(item: NearbyFeedItem) {
    setSelectedProfile(item);
  }

  function startApproach() {
    if (!selectedProfile || !user) return;
    setApproach({
      id: "approach-1",
      fromUserId: user.id,
      toUserId: selectedProfile.profileUserId,
      presenceSessionId: selectedProfile.presenceSessionId,
      status: "started",
      startedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
      completedAt: null,
      cancelledAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setScreen("approach");
  }

  function confirmConnected() {
    setApproach((current) =>
      current ? { ...current, status: "connected", completedAt: new Date().toISOString() } : current,
    );
    setScreen("feed");
  }

  function hideUser() {
    if (!selectedProfile) return;
    setFeed((current) => current.filter((item) => item.profileUserId !== selectedProfile.profileUserId));
    setSelectedProfile(null);
    setScreen("feed");
  }

  function hideVenuePermanently() {
    setVenueHidden(true);
    setFeed([]);
    setScreen("venue");
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
    const { error } = await supabase
      .from("users")
      .update({
        first_name: nextUser.firstName,
        avatar_style: nextUser.avatarStyle,
        default_intent: nextUser.defaultIntent,
        default_vibes: nextUser.defaultVibes,
        profile_prompt: nextUser.profilePrompt,
        approach_prompt: nextUser.approachPrompt,
      })
      .eq("id", user.id);
    if (error) {
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
    setUser(null);
    setSelectedProfile(null);
    setSessionVisible(false);
    setApproach(null);
    setSettingsSaveState("idle");
    setDeletionRequestState("idle");
    setScreen("auth");
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
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    const { data: requestRow, error } = await supabase
      .from("identity_removal_requests")
      .insert({
        user_id: user.id,
        profile_user_id: user.id,
        contact_email: authUser?.email ?? "unknown@left.local",
        contact_name: user.firstName,
        auth_provider: user.authProvider,
        request_kind: "identity_removal",
        identity_fields_to_remove: [
          "email",
          "first_name",
          "provider_subject",
          "auth_provider_metadata",
          "direct_auth_credentials",
        ],
        retained_record_classes: ["hints", "venue_history", "safety_zones"],
        payload: {
          defaultIntent: user.defaultIntent,
          defaultVibes: user.defaultVibes,
          focusModeEnabled: user.focusModeEnabled,
          promptsEnabled: user.promptsEnabled,
        },
      })
      .select("id")
      .single();
    if (error) {
      if (error.code === "23505") {
        setDeletionRequestState("submitted");
        Alert.alert("Identity removal", "You already have an open identity-removal request.");
        return;
      }
      setDeletionRequestState("error");
      Alert.alert("Identity removal failed", "We could not create your identity-removal request.");
      return;
    }

    if (!requestRow?.id) {
      setDeletionRequestState("error");
      Alert.alert("Identity removal failed", "We could not start identity removal.");
      return;
    }

    const { error: processingError } = await supabase.functions.invoke("process-identity-removal", {
      body: { requestId: requestRow.id },
    });

    if (processingError) {
      setDeletionRequestState("submitted");
      Alert.alert(
        "Identity removal queued",
        "We recorded your request, but backend processing did not finish yet. Your request is still on file for follow-up.",
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
      setScreen(sessionVisible ? "feed" : "activate");
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
        {screen !== "auth" && screen !== "loading" && (
          <View style={styles.topBar}>
            <Text style={styles.wordmark}>LEFT</Text>
            <View style={styles.statusDot} />
          </View>
        )}

        {screen === "loading" && <LoadingScreen />}
        {screen === "auth" && <AuthScreen authError={authError} onAuth={startGoogleAuth} />}
        {screen === "onboarding-name" && (
          <NameScreen firstNameDraft={firstNameDraft} onChangeFirstName={setFirstNameDraft} onContinue={() => setScreen("onboarding-avatar")} />
        )}
        {screen === "onboarding-avatar" && (
          <AvatarScreen avatarStyle={avatarStyleDraft} onPick={setAvatarStyleDraft} onContinue={() => setScreen("onboarding-location")} />
        )}
        {screen === "onboarding-location" && (
          <LocationScreen authError={authError} enabled={locationEnabled} onToggle={() => setLocationEnabled((current) => !current)} onContinue={() => void finishOnboarding()} />
        )}
        {screen === "venue" && (
          <VenueScreen venue={venueSummary} sessionVisible={sessionVisible} venueHidden={venueHidden} onActivate={() => setScreen("activate")} onOpenFeed={() => setScreen("feed")} />
        )}
        {screen === "activate" && (
          <ActivationScreen selectedIntent={selectedIntent} selectedVibes={selectedVibes} selectedDuration={selectedDuration} hintDraft={hintDraft} onPickIntent={setSelectedIntent} onToggleVibe={toggleVibe} onPickDuration={setSelectedDuration} onChangeHint={setHintDraft} onActivate={activatePresence} />
        )}
        {screen === "feed" && (
          <FeedScreen venue={venueSummary} feed={visibleFeed} onOpenProfile={openProfile} onWave={sendWave} onOpenSafety={() => setScreen("safety")} />
        )}
        {screen === "profile" && selectedProfile && (
          <ProfileScreen item={selectedProfile} profilePrompt={user?.profilePrompt ?? defaultProfilePrompt} onBack={() => setScreen("feed")} onWave={() => sendWave(selectedProfile)} onApproach={startApproach} onHide={hideUser} onOpenSafety={() => setScreen("safety")} />
        )}
        {screen === "approach" && selectedProfile && approach && (
          <ApproachScreen item={selectedProfile} approachPrompt={user?.approachPrompt ?? defaultApproachPrompt} onCancel={() => setScreen("feed")} onConfirmConnected={confirmConnected} onOpenSafety={() => setScreen("safety")} />
        )}
        {screen === "safety" && (
          <SafetyScreen venueName={venueSummary.venueName} sessionVisible={sessionVisible} onBack={() => setScreen(selectedProfile ? "profile" : "feed")} onPauseVisibility={() => setSessionVisible(false)} onEndSession={() => { setSessionVisible(false); setScreen("venue"); }} onHideVenue={hideVenuePermanently} />
        )}
        {screen === "settings" && user && (
          <SettingsScreen
            user={user}
            saveState={settingsSaveState}
            deletionState={deletionRequestState}
            onSave={(input) => void saveSettings(input)}
            onOpenSafety={() => setScreen("safety")}
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

function getProvider(session: Session): AuthProvider {
  return (session.user.app_metadata.provider as AuthProvider | undefined) ?? "google";
}

function getProviderSubject(session: Session, provider: AuthProvider) {
  return session.user.identities?.find((identity) => identity.provider === provider)?.id ?? session.user.id;
}

function getFirstNameFromSession(session: Session) {
  return (
    (session.user.user_metadata.first_name as string | undefined) ??
    (session.user.user_metadata.name as string | undefined)?.split(" ")[0] ??
    session.user.email?.split("@")[0] ??
    "Friend"
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
    onboardingCompleted: profile.onboarding_completed,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  };
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
