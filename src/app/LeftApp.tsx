import { useEffect, useMemo, useState } from "react";
import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import type { Session } from "@supabase/supabase-js";
import type {
  AppUser,
  ApproachAttempt,
  AuthProvider,
  AvatarStyle,
  NearbyFeedItem,
  VenueContextSummary,
} from "../types/left-domain";
import { supabase } from "../lib/supabase";
import { initialFeed, initialVenueSummary, viewerSeed } from "../mocks/seed";

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  ink: "#0d0c10",
  inkSoft: "#1a1820",
  inkMid: "#2e2b38",
  surface: "#f4f2ee",
  surfaceDim: "#e8e5df",
  surfaceMid: "rgba(244,242,238,0.06)",
  surfaceCard: "rgba(244,242,238,0.05)",
  accent: "#7c6cf5",
  accentDim: "rgba(124,108,245,0.18)",
  accentBright: "#9f94ff",
  teal: "#3ecfb2",
  tealDim: "rgba(62,207,178,0.12)",
  white: "#ffffff",
  textPrimary: "#f4f2ee",
  textSecondary: "rgba(244,242,238,0.52)",
  textMuted: "rgba(244,242,238,0.28)",
  border: "rgba(244,242,238,0.09)",
  borderAccent: "rgba(124,108,245,0.4)",
  radius: 20,
  radiusSm: 12,
  radiusXl: 28,
};

type Screen =
  | "loading"
  | "auth"
  | "onboarding-name"
  | "onboarding-avatar"
  | "onboarding-location"
  | "venue"
  | "activate"
  | "feed"
  | "profile"
  | "approach"
  | "safety";

type UserProfileRow = {
  id: string;
  auth_provider: AuthProvider;
  provider_subject: string;
  first_name: string;
  avatar_style: AvatarStyle;
  default_intent: AppUser["defaultIntent"];
  default_vibes: string[];
  focus_mode_enabled: boolean;
  prompts_enabled: boolean;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
};

const avatarStyles: AvatarStyle[] = ["geometric", "abstract", "minimal", "soft"];
const AVATAR_GLYPHS: Record<AvatarStyle, string> = {
  geometric: "◆",
  abstract: "◎",
  minimal: "—",
  soft: "◐",
};
const intents = [
  { id: "networking", label: "Networking" },
  { id: "open_to_conversation", label: "Open to chat" },
  { id: "group_discussion", label: "Group discussion" },
  { id: "casual_chat", label: "Casual chat" },
] as const;
const vibeOptions = ["AI/startups", "Design", "Travel", "Language exchange", "Creativity"];
const durationOptions = [30, 60, 120];
const logoMarkAsset = require("../../logo.png");

WebBrowser.maybeCompleteAuthSession();

function logAuthDebug(step: string, payload?: Record<string, unknown>) {
  if (payload) {
    console.info(`[auth] ${step}`, payload);
    return;
  }
  console.info(`[auth] ${step}`);
}

const AUTH_CALLBACK_PATH = "auth/callback";
const NATIVE_AUTH_REDIRECT = "left://auth/callback";

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

  const visibleFeed = useMemo(() => {
    if (venueHidden) return [];
    return feed;
  }, [feed, venueHidden]);

  useEffect(() => {
    void bootstrapSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncSession(session, false);
    });
    return () => { subscription.unsubscribe(); };
  }, []);

  async function bootstrapSession() {
    const { data: { session } } = await supabase.auth.getSession();
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
    if (!profile || !profile.onboarding_completed) { setUser(null); setScreen("onboarding-name"); return; }
    setUser(mapProfileToAppUser(profile));
    setFirstNameDraft(profile.first_name);
    setAuthProvider(profile.auth_provider);
    if (isInitialLoad) { setScreen("loading"); await delay(2000); }
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
    const { data, error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo, skipBrowserRedirect: true } });
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
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setAuthError("Sign in again to finish onboarding."); setScreen("auth"); return; }
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
    const { error } = await supabase.from("users").upsert({
      id: nextUser.id,
      auth_provider: nextUser.authProvider,
      provider_subject: nextUser.providerSubject,
      first_name: nextUser.firstName,
      avatar_style: nextUser.avatarStyle,
      default_intent: nextUser.defaultIntent,
      default_vibes: nextUser.defaultVibes,
      focus_mode_enabled: nextUser.focusModeEnabled,
      prompts_enabled: nextUser.promptsEnabled,
      onboarding_completed: nextUser.onboardingCompleted,
    }, { onConflict: "id" });
    if (error) { setAuthError("We could not save onboarding yet."); return; }
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
    setVenueSummary((current) => ({ ...current, visibleCount: Math.max(1, current.visibleCount), pulseCopy: "1 person is active nearby right now." }));
    setScreen("feed");
  }

  function openProfile(item: NearbyFeedItem) { setSelectedProfile(item); setScreen("profile"); }
  function sendWave(item: NearbyFeedItem) { setSelectedProfile(item); }

  function startApproach() {
    if (!selectedProfile || !user) return;
    setApproach({ id: "approach-1", fromUserId: user.id, toUserId: selectedProfile.profileUserId, presenceSessionId: selectedProfile.presenceSessionId, status: "started", startedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 60_000).toISOString(), completedAt: null, cancelledAt: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    setScreen("approach");
  }

  function confirmConnected() {
    setApproach((current) => current ? { ...current, status: "connected", completedAt: new Date().toISOString() } : current);
    setScreen("feed");
  }

  function hideUser() {
    if (!selectedProfile) return;
    setFeed((current) => current.filter((item) => item.profileUserId !== selectedProfile.profileUserId));
    setSelectedProfile(null);
    setScreen("feed");
  }

  function hideVenuePermanently() { setVenueHidden(true); setFeed([]); setScreen("venue"); }

  return (
    <View style={styles.shell}>
      {/* Noise grain overlay */}
      <View style={styles.grain} pointerEvents="none" />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          (screen === "auth" || screen === "loading") && styles.fullContent,
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
          <LocationScreen authError={authError} enabled={locationEnabled} onToggle={() => setLocationEnabled((c) => !c)} onContinue={() => void finishOnboarding()} />
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
          <ProfileScreen item={selectedProfile} onBack={() => setScreen("feed")} onWave={() => sendWave(selectedProfile)} onApproach={startApproach} onHide={hideUser} onOpenSafety={() => setScreen("safety")} />
        )}
        {screen === "approach" && selectedProfile && approach && (
          <ApproachScreen item={selectedProfile} onCancel={() => setScreen("feed")} onConfirmConnected={confirmConnected} onOpenSafety={() => setScreen("safety")} />
        )}
        {screen === "safety" && (
          <SafetyScreen venueName={venueSummary.venueName} sessionVisible={sessionVisible} onBack={() => setScreen(selectedProfile ? "profile" : "feed")} onPauseVisibility={() => setSessionVisible(false)} onEndSession={() => { setSessionVisible(false); setScreen("venue"); }} onHideVenue={hideVenuePermanently} />
        )}
      </ScrollView>
    </View>
  );
}

// ─── Loading ──────────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <View style={styles.loadingWrap}>
      <LinearGradient colors={[T.ink, "#110f1c", "#0d0c10"]} style={StyleSheet.absoluteFillObject} />
      <View style={styles.loadingCenter}>
        <View style={styles.loadingRing}>
          <Text style={styles.loadingChevron}>{"<"}</Text>
          <View style={styles.loadingDot} />
        </View>
        <Text style={styles.loadingWordmark}>LEFT</Text>
      </View>
      <Text style={styles.loadingCaption}>Loading your session.</Text>
    </View>
  );
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
function AuthScreen({ authError, onAuth }: { authError: string | null; onAuth: () => void }) {
  return (
    <View style={styles.authWrap}>
      <LinearGradient colors={["#0e0c18", "#141126", "#0c0b14"]} style={StyleSheet.absoluteFillObject} />
      {/* Subtle radial glow — top */}
      <View style={styles.authGlowTop} pointerEvents="none" />
      {/* Subtle radial glow — bottom teal */}
      <View style={styles.authGlowBottom} pointerEvents="none" />

      {/* Brand mark */}
      <View style={styles.authBrand}>
        <View style={styles.authMarkRing}>
          <Text style={styles.authMarkChevron}>{"<"}</Text>
          <View style={styles.authMarkDot} />
        </View>
        <Text style={styles.authMarkLabel}>LEFT</Text>
      </View>

      {/* Card */}
      <View style={styles.authCard}>
        {/* Hairline top border accent */}
        <View style={styles.authCardAccentLine} />
        <Text style={styles.authHeadline}>A reality-first{"\n"}social layer.</Text>
        <Text style={styles.authSub}>
          Set a first name, choose an avatar, and only appear when you intentionally activate.
        </Text>

        <Pressable onPress={onAuth} style={({ pressed }) => [styles.authBtn, pressed && styles.authBtnPressed]}>
          <View style={styles.authBtnGIcon}>
            <Text style={styles.authBtnG}>G</Text>
          </View>
          <Text style={styles.authBtnLabel}>Continue with Google</Text>
        </Pressable>

        {authError ? <Text style={styles.errorText}>{authError}</Text> : null}
      </View>

      <View style={styles.authFooter}>
        <View style={styles.authFooterLinks}>
          <Text style={styles.authFooterLink}>Privacy Policy</Text>
          <Text style={styles.authFooterDivider}>·</Text>
          <Text style={styles.authFooterLink}>Terms of Service</Text>
        </View>
        <Text style={styles.authFooterCopy}>© 2026 LEFT SOCIAL</Text>
      </View>
    </View>
  );
}

// ─── Onboarding: Name ─────────────────────────────────────────────────────────
function NameScreen({ firstNameDraft, onChangeFirstName, onContinue }: { firstNameDraft: string; onChangeFirstName: (v: string) => void; onContinue: () => void }) {
  return (
    <Card step="01" total="03">
      <Text style={styles.cardTitle}>First name{"\n"}only.</Text>
      <Text style={styles.cardBody}>No surnames, handles, or linked socials. Identity stays light.</Text>
      <TextInput
        value={firstNameDraft}
        onChangeText={(v) => onChangeFirstName(v.split(" ")[0] ?? "")}
        placeholder="Your first name"
        placeholderTextColor={T.textMuted}
        style={styles.input}
        autoCapitalize="words"
      />
      <PrimaryButton label="Continue" onPress={onContinue} />
    </Card>
  );
}

// ─── Onboarding: Avatar ───────────────────────────────────────────────────────
function AvatarScreen({ avatarStyle, onPick, onContinue }: { avatarStyle: AvatarStyle; onPick: (s: AvatarStyle) => void; onContinue: () => void }) {
  return (
    <Card step="02" total="03">
      <Text style={styles.cardTitle}>Choose your{"\n"}avatar style.</Text>
      <Text style={styles.cardBody}>No photo upload. Identity is intentionally abstract.</Text>
      <View style={styles.avatarGrid}>
        {avatarStyles.map((style) => (
          <Pressable key={style} onPress={() => onPick(style)} style={[styles.avatarTile, avatarStyle === style && styles.avatarTileActive]}>
            <Text style={[styles.avatarGlyph, avatarStyle === style && styles.avatarGlyphActive]}>
              {AVATAR_GLYPHS[style]}
            </Text>
            <Text style={[styles.avatarTileLabel, avatarStyle === style && styles.avatarTileLabelActive]}>
              {style}
            </Text>
          </Pressable>
        ))}
      </View>
      <PrimaryButton label="Continue" onPress={onContinue} />
    </Card>
  );
}

// ─── Onboarding: Location ─────────────────────────────────────────────────────
function LocationScreen({ authError, enabled, onToggle, onContinue }: { authError: string | null; enabled: boolean; onToggle: () => void; onContinue: () => void }) {
  return (
    <Card step="03" total="03">
      <Text style={styles.cardTitle}>Location is{"\n"}load-bearing.</Text>
      <Text style={styles.cardBody}>
        We use background location to detect when you're in a venue. We never share it.
      </Text>
      <Pressable onPress={onToggle} style={styles.toggleRow}>
        <View style={styles.toggleTextWrap}>
          <Text style={styles.toggleLabel}>Background location</Text>
          <Text style={styles.toggleSub}>{enabled ? "Enabled" : "Tap to enable"}</Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{ true: T.accent, false: T.inkMid }}
          thumbColor={T.textPrimary}
        />
      </Pressable>
      <PrimaryButton label="Finish setup" onPress={onContinue} />
      {authError ? <Text style={styles.errorText}>{authError}</Text> : null}
    </Card>
  );
}

// ─── Venue ────────────────────────────────────────────────────────────────────
function VenueScreen({ venue, sessionVisible, venueHidden, onActivate, onOpenFeed }: { venue: VenueContextSummary; sessionVisible: boolean; venueHidden: boolean; onActivate: () => void; onOpenFeed: () => void }) {
  return (
    <View style={styles.venuePage}>
      <View style={styles.venueHeader}>
        <Text style={styles.venueName}>{venue.venueName}</Text>
        <View style={styles.venueMeta}>
          <EnergyPill level={venue.energyLevel} />
          <View style={styles.visibleBadge}>
            <View style={[styles.pulseDot, sessionVisible && styles.pulseDotActive]} />
            <Text style={styles.visibleBadgeLabel}>{venue.visibleCount} visible</Text>
          </View>
        </View>
      </View>

      <Text style={styles.venuePulse}>
        {venueHidden
          ? "You're hidden at this venue."
          : venue.pulseCopy ?? "No pulse yet."}
      </Text>

      <View style={styles.vibeRow}>
        {venue.activeVibes.map((vibe) => <Chip key={vibe} label={vibe} />)}
      </View>

      <View style={styles.venueActions}>
        {!sessionVisible ? (
          <PrimaryButton label="Become visible" onPress={onActivate} />
        ) : (
          <PrimaryButton label="Open nearby feed" onPress={onOpenFeed} />
        )}
      </View>
    </View>
  );
}

// ─── Activate ─────────────────────────────────────────────────────────────────
function ActivationScreen(props: {
  selectedIntent: AppUser["defaultIntent"];
  selectedVibes: string[];
  selectedDuration: number;
  hintDraft: string;
  onPickIntent: (v: AppUser["defaultIntent"]) => void;
  onToggleVibe: (v: string) => void;
  onPickDuration: (v: number) => void;
  onChangeHint: (v: string) => void;
  onActivate: () => void;
}) {
  return (
    <Card>
      <Text style={styles.cardTitle}>Set your{"\n"}presence.</Text>
      <FieldBlock label="Intent">
        <View style={styles.chipWrap}>
          {intents.map((i) => (
            <SelectChip key={i.id} label={i.label} active={props.selectedIntent === i.id} onPress={() => props.onPickIntent(i.id)} />
          ))}
        </View>
      </FieldBlock>
      <FieldBlock label="Vibes">
        <View style={styles.chipWrap}>
          {vibeOptions.map((v) => (
            <SelectChip key={v} label={v} active={props.selectedVibes.includes(v)} onPress={() => props.onToggleVibe(v)} />
          ))}
        </View>
      </FieldBlock>
      <FieldBlock label="Duration">
        <View style={styles.chipWrap}>
          {durationOptions.map((d) => (
            <SelectChip key={d} label={`${d}m`} active={props.selectedDuration === d} onPress={() => props.onPickDuration(d)} />
          ))}
        </View>
      </FieldBlock>
      <FieldBlock label="Hint card">
        <TextInput
          value={props.hintDraft}
          onChangeText={props.onChangeHint}
          placeholder="e.g. Blue headphones, left table"
          placeholderTextColor={T.textMuted}
          style={styles.input}
        />
      </FieldBlock>
      <PrimaryButton label="Become visible" onPress={props.onActivate} />
    </Card>
  );
}

// ─── Feed ─────────────────────────────────────────────────────────────────────
function FeedScreen({ venue, feed, onOpenProfile, onWave, onOpenSafety }: { venue: VenueContextSummary; feed: NearbyFeedItem[]; onOpenProfile: (item: NearbyFeedItem) => void; onWave: (item: NearbyFeedItem) => void; onOpenSafety: () => void }) {
  return (
    <View>
      <View style={styles.feedHead}>
        <View>
          <Text style={styles.feedHeadVenue}>{venue.venueName}</Text>
          <Text style={styles.feedHeadCount}>{feed.length} {feed.length === 1 ? "person" : "people"} visible</Text>
        </View>
        <GhostButton label="Safety" onPress={onOpenSafety} compact />
      </View>
      {feed.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyGlyph}>{"<"}</Text>
          <Text style={styles.emptyText}>No one visible yet.</Text>
        </View>
      ) : (
        feed.map((item) => (
          <Pressable key={item.profileUserId} onPress={() => onOpenProfile(item)} style={({ pressed }) => [styles.feedCard, pressed && styles.feedCardPressed]}>
            <View style={styles.feedCardTop}>
              <View style={styles.feedAvatarCircle}>
                <Text style={styles.feedAvatarGlyph}>{item.firstName.slice(0, 1)}</Text>
              </View>
              <View style={styles.feedCardInfo}>
                <Text style={styles.feedCardName}>{item.firstName}</Text>
                <Text style={styles.feedCardIntent}>{formatIntent(item.intent)}</Text>
              </View>
              <Text style={styles.feedCardTime}>{formatRemaining(item.sessionDurationRemaining)}</Text>
            </View>
            {item.hintText ? <Text style={styles.feedCardHint}>{item.hintText}</Text> : null}
            <View style={styles.feedCardFooter}>
              <Chip label={item.primaryVibe ?? "Open"} />
              <GhostButton label="Wave →" onPress={() => onWave(item)} compact />
            </View>
          </Pressable>
        ))
      )}
    </View>
  );
}

// ─── Profile ──────────────────────────────────────────────────────────────────
function ProfileScreen({ item, onBack, onWave, onApproach, onHide, onOpenSafety }: { item: NearbyFeedItem; onBack: () => void; onWave: () => void; onApproach: () => void; onHide: () => void; onOpenSafety: () => void }) {
  return (
    <View>
      <View style={styles.navRow}>
        <GhostButton label="← Back" onPress={onBack} compact />
        <GhostButton label="Safety" onPress={onOpenSafety} compact />
      </View>

      <View style={styles.profileHeroBlock}>
        <View style={styles.profileAvatarLg}>
          <Text style={styles.profileAvatarGlyph}>{item.firstName.slice(0, 1)}</Text>
        </View>
        <Text style={styles.profileName}>{item.firstName}</Text>
        <Text style={styles.profileIntent}>{formatIntent(item.intent)}</Text>
        <View style={styles.chipWrapCenter}>
          <Chip label={item.primaryVibe ?? "Open"} />
          <Chip label="Design" subtle />
        </View>
      </View>

      <View style={styles.profileSections}>
        <InfoBlock label="Hint">
          <Text style={styles.infoText}>{item.hintText ?? "No hint set."}</Text>
        </InfoBlock>
        <InfoBlock label="Shared alignment">
          <Text style={styles.infoText}>You both selected AI/startups.</Text>
        </InfoBlock>
        <InfoBlock label="Icebreaker">
          <Text style={[styles.infoText, styles.icebreakerText]}>
            "Ask what they're building right now, not what they do generally."
          </Text>
        </InfoBlock>
      </View>

      <View style={styles.profileActions}>
        <GhostButton label="Wave" onPress={onWave} />
        <PrimaryButton label="I'm going over →" onPress={onApproach} />
      </View>
      <View style={styles.profileDestructive}>
        <GhostButton label="Hide this person" onPress={onHide} destructive />
      </View>
    </View>
  );
}

// ─── Approach ─────────────────────────────────────────────────────────────────
function ApproachScreen({ item, onCancel, onConfirmConnected, onOpenSafety }: { item: NearbyFeedItem; onCancel: () => void; onConfirmConnected: () => void; onOpenSafety: () => void }) {
  return (
    <View>
      <View style={styles.navRow}>
        <GhostButton label="← Cancel" onPress={onCancel} compact />
        <GhostButton label="Safety" onPress={onOpenSafety} compact />
      </View>
      <View style={styles.approachHero}>
        <Text style={styles.approachLabel}>Going over to</Text>
        <Text style={styles.approachName}>{item.firstName}</Text>
        <View style={styles.timerRing}>
          <Text style={styles.timerNum}>60</Text>
          <Text style={styles.timerUnit}>sec</Text>
        </View>
      </View>
      <View style={styles.approachSections}>
        <InfoBlock label="Look for">
          <Text style={styles.infoText}>{item.hintText}</Text>
        </InfoBlock>
        <InfoBlock label="Icebreaker">
          <Text style={[styles.infoText, styles.icebreakerText]}>
            "What are you working on that feels genuinely exciting?"
          </Text>
        </InfoBlock>
      </View>
      <PrimaryButton label="We connected ✓" onPress={onConfirmConnected} />
    </View>
  );
}

// ─── Safety ───────────────────────────────────────────────────────────────────
function SafetyScreen({ venueName, sessionVisible, onBack, onPauseVisibility, onEndSession, onHideVenue }: { venueName: string; sessionVisible: boolean; onBack: () => void; onPauseVisibility: () => void; onEndSession: () => void; onHideVenue: () => void }) {
  return (
    <View>
      <GhostButton label="← Back" onPress={onBack} compact />
      <Text style={[styles.cardTitle, { marginTop: 20 }]}>Safety{"\n"}controls.</Text>
      <Text style={styles.cardBody}>Blocks are immediate and bilateral. Reports auto-hide the person for this session.</Text>

      <FieldBlock label="Current session">
        <View style={styles.safetyStatusRow}>
          <View style={[styles.pulseDot, sessionVisible && styles.pulseDotActive]} />
          <Text style={styles.safetyStatusText}>{sessionVisible ? "Visible nearby" : "Not currently visible"}</Text>
        </View>
        <PrimaryButton label="Pause visibility" onPress={onPauseVisibility} />
        <GhostButton label="End session" onPress={onEndSession} />
      </FieldBlock>

      <FieldBlock label="Venue">
        <GhostButton label={`Hide me at ${venueName}`} onPress={onHideVenue} destructive />
      </FieldBlock>
    </View>
  );
}

// ─── Shared components ────────────────────────────────────────────────────────
function Card({ children, step, total }: { children: React.ReactNode; step?: string; total?: string }) {
  return (
    <View style={styles.card}>
      {step && total && (
        <View style={styles.cardStepRow}>
          <Text style={styles.cardStepText}>{step} / {total}</Text>
        </View>
      )}
      {children}
    </View>
  );
}

function FieldBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label.toUpperCase()}</Text>
      {children}
    </View>
  );
}

function InfoBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.infoBlock}>
      <Text style={styles.fieldLabel}>{label.toUpperCase()}</Text>
      {children}
    </View>
  );
}

function Chip({ label, subtle = false }: { label: string; subtle?: boolean }) {
  return (
    <View style={[styles.chip, subtle && styles.chipSubtle]}>
      <Text style={[styles.chipLabel, subtle && styles.chipLabelSubtle]}>{label}</Text>
    </View>
  );
}

function SelectChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.selectChip, active && styles.selectChipActive]}>
      <Text style={[styles.selectChipLabel, active && styles.selectChipLabelActive]}>{label}</Text>
    </Pressable>
  );
}

function EnergyPill({ level }: { level: string }) {
  const isHigh = level === "high";
  return (
    <View style={[styles.energyPill, isHigh && styles.energyPillHigh]}>
      <Text style={[styles.energyPillLabel, isHigh && styles.energyPillLabelHigh]}>
        {level.toUpperCase()}
      </Text>
    </View>
  );
}

function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.primaryBtn, pressed && styles.primaryBtnPressed]}>
      <Text style={styles.primaryBtnLabel}>{label}</Text>
    </Pressable>
  );
}

function GhostButton({ label, onPress, compact = false, destructive = false }: { label: string; onPress: () => void; compact?: boolean; destructive?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.ghostBtn, compact && styles.ghostBtnCompact, destructive && styles.ghostBtnDestructive]}>
      <Text style={[styles.ghostBtnLabel, destructive && styles.ghostBtnLabelDestructive]}>{label}</Text>
    </Pressable>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatIntent(intent: string) { return intent.replaceAll("_", " "); }
function formatRemaining(value: string) { return value.startsWith("00:") ? value.slice(3, 8) : value; }
function getProvider(session: Session): AuthProvider { return (session.user.app_metadata.provider as AuthProvider | undefined) ?? "google"; }
function getProviderSubject(session: Session, provider: AuthProvider) { return session.user.identities?.find((i) => i.provider === provider)?.id ?? session.user.id; }
function getFirstNameFromSession(session: Session) { return (session.user.user_metadata.first_name as string | undefined) ?? (session.user.user_metadata.name as string | undefined)?.split(" ")[0] ?? session.user.email?.split("@")[0] ?? "Friend"; }
function mapProfileToAppUser(profile: UserProfileRow): AppUser {
  return { id: profile.id, authProvider: profile.auth_provider, providerSubject: profile.provider_subject, firstName: profile.first_name, avatarStyle: profile.avatar_style, defaultIntent: profile.default_intent, defaultVibes: profile.default_vibes, focusModeEnabled: profile.focus_mode_enabled, promptsEnabled: profile.prompts_enabled, onboardingCompleted: profile.onboarding_completed, createdAt: profile.created_at, updatedAt: profile.updated_at };
}
function delay(ms: number) { return new Promise((resolve) => setTimeout(resolve, ms)); }

// ─── StyleSheet ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: T.ink,
  },
  grain: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.03,
    backgroundColor: "transparent",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 72,
    gap: 0,
  },
  fullContent: {
    flex: 1,
    padding: 0,
  },

  // Top bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  wordmark: {
    color: T.textPrimary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: T.teal,
  },

  // Loading
  loadingWrap: {
    flex: 1,
    minHeight: 700,
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  loadingCenter: {
    alignItems: "center",
    gap: 16,
  },
  loadingRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: T.border,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingChevron: {
    color: T.accent,
    fontSize: 44,
    fontWeight: "200",
    lineHeight: 52,
    marginRight: -6,
  },
  loadingDot: {
    position: "absolute",
    right: 28,
    top: 38,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: T.accent,
  },
  loadingWordmark: {
    color: T.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 5,
  },
  loadingCaption: {
    color: T.textMuted,
    fontSize: 14,
  },

  // Auth
  authWrap: {
    flex: 1,
    minHeight: 812,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  authGlowTop: {
    position: "absolute",
    top: -120,
    left: "15%",
    right: "15%",
    height: 400,
    borderRadius: 200,
    backgroundColor: "rgba(100,86,240,0.15)",
  },
  authGlowBottom: {
    position: "absolute",
    bottom: -80,
    left: "10%",
    right: "10%",
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(62,207,178,0.08)",
  },
  authBrand: {
    alignItems: "center",
    paddingTop: 100,
    gap: 14,
  },
  authMarkRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1,
    borderColor: "rgba(124,108,245,0.3)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(124,108,245,0.08)",
  },
  authMarkChevron: {
    color: T.accentBright,
    fontSize: 34,
    fontWeight: "200",
    lineHeight: 40,
    marginRight: -4,
  },
  authMarkDot: {
    position: "absolute",
    right: 17,
    top: 24,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: T.accent,
  },
  authMarkLabel: {
    color: T.textSecondary,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 4,
  },
  authCard: {
    marginHorizontal: 20,
    borderRadius: T.radiusXl,
    borderWidth: 1,
    borderColor: T.border,
    backgroundColor: "rgba(255,255,255,0.04)",
    paddingHorizontal: 26,
    paddingTop: 32,
    paddingBottom: 36,
    overflow: "hidden",
  },
  authCardAccentLine: {
    position: "absolute",
    top: 0,
    left: 40,
    right: 40,
    height: 1,
    backgroundColor: T.accent,
    opacity: 0.6,
  },
  authHeadline: {
    color: T.textPrimary,
    fontSize: 38,
    lineHeight: 44,
    fontWeight: "300",
    letterSpacing: -1.5,
    marginBottom: 14,
  },
  authSub: {
    color: T.textSecondary,
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 36,
  },
  authBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: T.accent,
    borderRadius: 16,
    paddingVertical: 17,
    paddingHorizontal: 20,
  },
  authBtnPressed: {
    opacity: 0.85,
  },
  authBtnGIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  authBtnG: {
    color: T.white,
    fontSize: 14,
    fontWeight: "800",
  },
  authBtnLabel: {
    color: T.white,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  authFooter: {
    alignItems: "center",
    paddingBottom: 36,
    gap: 8,
  },
  authFooterLinks: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  authFooterLink: {
    color: T.textMuted,
    fontSize: 13,
  },
  authFooterDivider: {
    color: T.textMuted,
    fontSize: 13,
  },
  authFooterCopy: {
    color: "rgba(244,242,238,0.15)",
    fontSize: 11,
    letterSpacing: 3,
  },

  // Card (onboarding wrapper)
  card: {
    gap: 18,
  },
  cardStepRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardStepText: {
    color: T.textMuted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
  },
  cardTitle: {
    color: T.textPrimary,
    fontSize: 40,
    lineHeight: 46,
    fontWeight: "300",
    letterSpacing: -1.8,
  },
  cardBody: {
    color: T.textSecondary,
    fontSize: 15,
    lineHeight: 23,
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  avatarTile: {
    width: "47%",
    minHeight: 132,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 18,
    backgroundColor: T.surfaceCard,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 14,
  },
  avatarTileActive: {
    borderColor: T.borderAccent,
    backgroundColor: "rgba(124,108,245,0.12)",
  },
  avatarGlyph: {
    color: T.textSecondary,
    fontSize: 32,
    lineHeight: 38,
  },
  avatarGlyphActive: {
    color: T.textPrimary,
  },
  avatarTileLabel: {
    color: T.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  avatarTileLabelActive: {
    color: T.textPrimary,
  },

  // Input
  input: {
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: T.radiusSm,
    backgroundColor: T.surfaceCard,
    color: T.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 16,
  },

  // Toggle row
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: T.radius,
    padding: 16,
    gap: 16,
    backgroundColor: T.surfaceCard,
  },
  toggleTextWrap: {
    gap: 2,
    flex: 1,
  },
  toggleLabel: {
    color: T.textPrimary,
    fontSize: 15,
    fontWeight: "500",
  },
  toggleSub: {
    color: T.textSecondary,
    fontSize: 13,
  },

  // Field block
  fieldBlock: {
    gap: 10,
  },
  fieldLabel: {
    color: T.textMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
  },
  infoBlock: {
    gap: 6,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  infoText: {
    color: T.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  icebreakerText: {
    color: T.accentBright,
    fontStyle: "italic",
  },

  // Venue
  venuePage: {
    gap: 16,
  },
  venueHeader: {
    gap: 10,
  },
  venueName: {
    color: T.textPrimary,
    fontSize: 32,
    fontWeight: "300",
    letterSpacing: -1.2,
  },
  venueMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  venuePulse: {
    color: T.textSecondary,
    fontSize: 15,
    lineHeight: 23,
  },
  venueActions: {
    marginTop: 8,
  },
  vibeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: T.textMuted,
  },
  pulseDotActive: {
    backgroundColor: T.teal,
  },
  visibleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  visibleBadgeLabel: {
    color: T.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  energyPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: T.border,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  energyPillHigh: {
    borderColor: "rgba(62,207,178,0.3)",
    backgroundColor: T.tealDim,
  },
  energyPillLabel: {
    color: T.textMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  energyPillLabelHigh: {
    color: T.teal,
  },

  // Feed
  feedHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  feedHeadVenue: {
    color: T.textPrimary,
    fontSize: 24,
    fontWeight: "300",
    letterSpacing: -0.8,
  },
  feedHeadCount: {
    color: T.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  feedCard: {
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: T.radius,
    padding: 16,
    gap: 12,
    marginBottom: 12,
    backgroundColor: T.surfaceCard,
  },
  feedCardPressed: {
    backgroundColor: "rgba(124,108,245,0.05)",
    borderColor: T.borderAccent,
  },
  feedCardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  feedAvatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: T.accentDim,
    borderWidth: 1,
    borderColor: T.borderAccent,
    alignItems: "center",
    justifyContent: "center",
  },
  feedAvatarGlyph: {
    color: T.accentBright,
    fontSize: 16,
    fontWeight: "600",
  },
  feedCardInfo: {
    flex: 1,
    gap: 2,
  },
  feedCardName: {
    color: T.textPrimary,
    fontSize: 17,
    fontWeight: "500",
  },
  feedCardIntent: {
    color: T.textSecondary,
    fontSize: 13,
    textTransform: "capitalize",
  },
  feedCardTime: {
    color: T.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  feedCardHint: {
    color: T.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  feedCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 80,
    gap: 12,
  },
  emptyGlyph: {
    color: T.textMuted,
    fontSize: 48,
    fontWeight: "200",
  },
  emptyText: {
    color: T.textMuted,
    fontSize: 15,
  },

  // Profile
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  profileHeroBlock: {
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
  },
  profileAvatarLg: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: T.accentDim,
    borderWidth: 1,
    borderColor: T.borderAccent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  profileAvatarGlyph: {
    color: T.accentBright,
    fontSize: 30,
    fontWeight: "500",
  },
  profileName: {
    color: T.textPrimary,
    fontSize: 30,
    fontWeight: "300",
    letterSpacing: -1,
  },
  profileIntent: {
    color: T.textSecondary,
    fontSize: 14,
    textTransform: "capitalize",
  },
  chipWrapCenter: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  profileSections: {
    gap: 0,
    marginBottom: 24,
  },
  profileActions: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  profileDestructive: {},

  // Approach
  approachHero: {
    alignItems: "center",
    gap: 8,
    marginBottom: 28,
    paddingTop: 8,
  },
  approachLabel: {
    color: T.textMuted,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  approachName: {
    color: T.accent,
    fontSize: 42,
    fontWeight: "200",
    letterSpacing: -1.5,
  },
  timerRing: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: T.borderAccent,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    gap: 0,
  },
  timerNum: {
    color: T.textPrimary,
    fontSize: 44,
    fontWeight: "200",
    letterSpacing: -2,
    lineHeight: 50,
  },
  timerUnit: {
    color: T.textMuted,
    fontSize: 12,
    letterSpacing: 1,
  },
  approachSections: {
    gap: 0,
    marginBottom: 24,
  },

  // Safety
  safetyStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  safetyStatusText: {
    color: T.textSecondary,
    fontSize: 14,
  },

  // Chips
  chip: {
    borderRadius: 999,
    backgroundColor: T.tealDim,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(62,207,178,0.2)",
  },
  chipSubtle: {
    backgroundColor: T.surfaceCard,
    borderColor: T.border,
  },
  chipLabel: {
    color: T.teal,
    fontSize: 12,
    fontWeight: "600",
  },
  chipLabelSubtle: {
    color: T.textSecondary,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  // Select chip
  selectChip: {
    borderRadius: T.radiusSm,
    borderWidth: 1,
    borderColor: T.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "transparent",
  },
  selectChipActive: {
    borderColor: T.accent,
    backgroundColor: T.accentDim,
  },
  selectChipLabel: {
    color: T.textSecondary,
    fontSize: 13,
    fontWeight: "500",
  },
  selectChipLabelActive: {
    color: T.accentBright,
    fontWeight: "600",
  },

  // Primary button
  primaryBtn: {
    backgroundColor: T.accent,
    borderRadius: T.radius,
    paddingVertical: 17,
    paddingHorizontal: 20,
    alignItems: "center",
    flex: 1,
  },
  primaryBtnPressed: {
    opacity: 0.85,
  },
  primaryBtnLabel: {
    color: T.white,
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: -0.2,
  },

  // Ghost button
  ghostBtn: {
    borderRadius: T.radius,
    borderWidth: 1,
    borderColor: T.border,
    paddingVertical: 17,
    paddingHorizontal: 20,
    alignItems: "center",
    flex: 1,
  },
  ghostBtnCompact: {
    flex: 0,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  ghostBtnDestructive: {
    borderColor: "rgba(255,80,80,0.25)",
  },
  ghostBtnLabel: {
    color: T.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },
  ghostBtnLabelDestructive: {
    color: "rgba(255,100,100,0.8)",
  },

  // Error
  errorText: {
    color: "#ff8080",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 12,
  },
});
