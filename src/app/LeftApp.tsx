import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type {
  AppUser,
  ApproachAttempt,
  AuthProvider,
  AvatarStyle,
  NearbyFeedItem,
  VenueContextSummary,
} from "../types/left-domain";
import { initialFeed, initialVenueSummary, viewerSeed } from "../mocks/seed";

type Screen =
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

const avatarStyles: AvatarStyle[] = ["geometric", "abstract", "minimal", "soft"];
const intents = [
  { id: "networking", label: "Networking" },
  { id: "open_to_conversation", label: "Open to chat" },
  { id: "group_discussion", label: "Group discussion" },
  { id: "casual_chat", label: "Casual chat" },
] as const;
const vibeOptions = ["AI/startups", "Design", "Travel", "Language exchange", "Creativity"];
const durationOptions = [30, 60, 120];

export function LeftApp() {
  const [screen, setScreen] = useState<Screen>("auth");
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

  const visibleFeed = useMemo(() => {
    if (venueHidden) return [];
    return feed;
  }, [feed, venueHidden]);

  function completeAuth(provider: AuthProvider) {
    setAuthProvider(provider);
    setFirstNameDraft("Kelvin");
    setScreen("onboarding-name");
  }

  function finishOnboarding() {
    setUser({
      ...viewerSeed,
      authProvider: authProvider ?? "apple",
      firstName: firstNameDraft.trim() || "Kelvin",
      avatarStyle: avatarStyleDraft,
      onboardingCompleted: true,
    });
    setScreen("venue");
  }

  function toggleVibe(vibe: string) {
    setSelectedVibes((current) => {
      const exists = current.includes(vibe);
      if (exists) return current.filter((value) => value !== vibe);
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
      current
        ? {
            ...current,
            status: "connected",
            completedAt: new Date().toISOString(),
          }
        : current,
    );
    setScreen("feed");
  }

  function hideUser() {
    if (!selectedProfile) return;
    setFeed((current) =>
      current.filter((item) => item.profileUserId !== selectedProfile.profileUserId),
    );
    setSelectedProfile(null);
    setScreen("feed");
  }

  function hideVenuePermanently() {
    setVenueHidden(true);
    setFeed([]);
    setScreen("venue");
  }

  return (
    <LinearGradient colors={["#0a0911", "#12111a", "#181626"]} style={styles.shell}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>LEFT</Text>
        {screen === "auth" && (
          <AuthScreen onAuth={completeAuth} />
        )}
        {screen === "onboarding-name" && (
          <NameScreen
            firstNameDraft={firstNameDraft}
            onChangeFirstName={setFirstNameDraft}
            onContinue={() => setScreen("onboarding-avatar")}
          />
        )}
        {screen === "onboarding-avatar" && (
          <AvatarScreen
            avatarStyle={avatarStyleDraft}
            onPick={setAvatarStyleDraft}
            onContinue={() => setScreen("onboarding-location")}
          />
        )}
        {screen === "onboarding-location" && (
          <LocationScreen
            enabled={locationEnabled}
            onToggle={() => setLocationEnabled((current) => !current)}
            onContinue={finishOnboarding}
          />
        )}
        {screen === "venue" && (
          <VenueScreen
            venue={venueSummary}
            sessionVisible={sessionVisible}
            venueHidden={venueHidden}
            onActivate={() => setScreen("activate")}
            onOpenFeed={() => setScreen("feed")}
          />
        )}
        {screen === "activate" && (
          <ActivationScreen
            selectedIntent={selectedIntent}
            selectedVibes={selectedVibes}
            selectedDuration={selectedDuration}
            hintDraft={hintDraft}
            onPickIntent={setSelectedIntent}
            onToggleVibe={toggleVibe}
            onPickDuration={setSelectedDuration}
            onChangeHint={setHintDraft}
            onActivate={activatePresence}
          />
        )}
        {screen === "feed" && (
          <FeedScreen
            venue={venueSummary}
            feed={visibleFeed}
            onOpenProfile={openProfile}
            onWave={sendWave}
            onOpenSafety={() => setScreen("safety")}
          />
        )}
        {screen === "profile" && selectedProfile && (
          <ProfileScreen
            item={selectedProfile}
            onBack={() => setScreen("feed")}
            onWave={() => sendWave(selectedProfile)}
            onApproach={startApproach}
            onHide={hideUser}
            onOpenSafety={() => setScreen("safety")}
          />
        )}
        {screen === "approach" && selectedProfile && approach && (
          <ApproachScreen
            item={selectedProfile}
            onCancel={() => setScreen("feed")}
            onConfirmConnected={confirmConnected}
            onOpenSafety={() => setScreen("safety")}
          />
        )}
        {screen === "safety" && (
          <SafetyScreen
            venueName={venueSummary.venueName}
            sessionVisible={sessionVisible}
            onBack={() => setScreen(selectedProfile ? "profile" : "feed")}
            onPauseVisibility={() => setSessionVisible(false)}
            onEndSession={() => {
              setSessionVisible(false);
              setScreen("venue");
            }}
            onHideVenue={hideVenuePermanently}
          />
        )}
      </ScrollView>
    </LinearGradient>
  );
}

function AuthScreen({ onAuth }: { onAuth: (provider: AuthProvider) => void }) {
  return (
    <Card>
      <Text style={styles.title}>A reality-first social activation layer.</Text>
      <Text style={styles.body}>
        Sign in, set a first name, choose an illustrated avatar, and only show up when you
        intentionally activate.
      </Text>
      <PrimaryButton label="Continue with Apple" onPress={() => onAuth("apple")} />
      <GhostButton label="Continue with Google" onPress={() => onAuth("google")} />
    </Card>
  );
}

function NameScreen({
  firstNameDraft,
  onChangeFirstName,
  onContinue,
}: {
  firstNameDraft: string;
  onChangeFirstName: (value: string) => void;
  onContinue: () => void;
}) {
  return (
    <Card>
      <Text style={styles.title}>First name only.</Text>
      <Text style={styles.body}>
        Left never exposes surnames, handles, or linked social accounts in MVP.
      </Text>
      <TextInput
        value={firstNameDraft}
        onChangeText={(value) => onChangeFirstName(value.split(" ")[0] ?? "")}
        placeholder="First name"
        placeholderTextColor="#746d86"
        style={styles.input}
        autoCapitalize="words"
      />
      <PrimaryButton label="Continue" onPress={onContinue} />
    </Card>
  );
}

function AvatarScreen({
  avatarStyle,
  onPick,
  onContinue,
}: {
  avatarStyle: AvatarStyle;
  onPick: (style: AvatarStyle) => void;
  onContinue: () => void;
}) {
  return (
    <Card>
      <Text style={styles.title}>Choose your avatar style.</Text>
      <Text style={styles.body}>No photo upload in MVP. Identity stays intentionally light.</Text>
      <View style={styles.avatarGrid}>
        {avatarStyles.map((style) => (
          <Pressable
            key={style}
            onPress={() => onPick(style)}
            style={[styles.avatarOption, avatarStyle === style && styles.avatarOptionActive]}
          >
            <Text style={styles.avatarGlyph}>{style.slice(0, 1).toUpperCase()}</Text>
            <Text style={styles.avatarLabel}>{style}</Text>
          </Pressable>
        ))}
      </View>
      <PrimaryButton label="Continue" onPress={onContinue} />
    </Card>
  );
}

function LocationScreen({
  enabled,
  onToggle,
  onContinue,
}: {
  enabled: boolean;
  onToggle: () => void;
  onContinue: () => void;
}) {
  return (
    <Card>
      <Text style={styles.title}>Background location is load-bearing.</Text>
      <Text style={styles.body}>
        We use your location in the background to detect when you are in a social venue. We
        never share it.
      </Text>
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Enable background location</Text>
        <Switch value={enabled} onValueChange={onToggle} trackColor={{ true: "#63e0c0" }} />
      </View>
      <PrimaryButton label="Finish onboarding" onPress={onContinue} />
    </Card>
  );
}

function VenueScreen({
  venue,
  sessionVisible,
  venueHidden,
  onActivate,
  onOpenFeed,
}: {
  venue: VenueContextSummary;
  sessionVisible: boolean;
  venueHidden: boolean;
  onActivate: () => void;
  onOpenFeed: () => void;
}) {
  return (
    <Card>
      <View style={styles.rowBetween}>
        <View>
          <Text style={styles.title}>{venue.venueName}</Text>
          <Text style={styles.meta}>{venue.energyLevel.toUpperCase()} ENERGY</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>{venue.visibleCount} visible</Text>
        </View>
      </View>
      <Text style={styles.body}>
        {venueHidden
          ? "You chose to hide yourself at this venue. Left will stay silent here."
          : venue.pulseCopy ?? "No venue pulse shown here yet."}
      </Text>
      <View style={styles.tagRow}>
        {venue.activeVibes.map((vibe) => (
          <Tag key={vibe} label={vibe} />
        ))}
      </View>
      {!sessionVisible ? (
        <PrimaryButton label="Become visible" onPress={onActivate} />
      ) : (
        <PrimaryButton label="Open nearby feed" onPress={onOpenFeed} />
      )}
    </Card>
  );
}

function ActivationScreen(props: {
  selectedIntent: AppUser["defaultIntent"];
  selectedVibes: string[];
  selectedDuration: number;
  hintDraft: string;
  onPickIntent: (value: AppUser["defaultIntent"]) => void;
  onToggleVibe: (vibe: string) => void;
  onPickDuration: (value: number) => void;
  onChangeHint: (value: string) => void;
  onActivate: () => void;
}) {
  return (
    <Card>
      <Text style={styles.title}>Open to interaction nearby?</Text>
      <Text style={styles.sectionLabel}>Intent</Text>
      <View style={styles.wrapRow}>
        {intents.map((intent) => (
          <SelectableTag
            key={intent.id}
            label={intent.label}
            active={props.selectedIntent === intent.id}
            onPress={() => props.onPickIntent(intent.id)}
          />
        ))}
      </View>
      <Text style={styles.sectionLabel}>Vibes</Text>
      <View style={styles.wrapRow}>
        {vibeOptions.map((vibe) => (
          <SelectableTag
            key={vibe}
            label={vibe}
            active={props.selectedVibes.includes(vibe)}
            onPress={() => props.onToggleVibe(vibe)}
          />
        ))}
      </View>
      <Text style={styles.sectionLabel}>Duration</Text>
      <View style={styles.wrapRow}>
        {durationOptions.map((duration) => (
          <SelectableTag
            key={duration}
            label={`${duration}m`}
            active={props.selectedDuration === duration}
            onPress={() => props.onPickDuration(duration)}
          />
        ))}
      </View>
      <Text style={styles.sectionLabel}>Hint card</Text>
      <TextInput
        value={props.hintDraft}
        onChangeText={props.onChangeHint}
        placeholder="Blue headphones"
        placeholderTextColor="#746d86"
        style={styles.input}
      />
      <PrimaryButton label="Become visible" onPress={props.onActivate} />
    </Card>
  );
}

function FeedScreen({
  venue,
  feed,
  onOpenProfile,
  onWave,
  onOpenSafety,
}: {
  venue: VenueContextSummary;
  feed: NearbyFeedItem[];
  onOpenProfile: (item: NearbyFeedItem) => void;
  onWave: (item: NearbyFeedItem) => void;
  onOpenSafety: () => void;
}) {
  return (
    <Card>
      <View style={styles.rowBetween}>
        <View>
          <Text style={styles.title}>{venue.venueName}</Text>
          <Text style={styles.meta}>{feed.length} people visible now</Text>
        </View>
        <GhostButton label="Safety" onPress={onOpenSafety} compact />
      </View>
      <View style={styles.stack}>
        {feed.map((item) => (
          <Pressable key={item.profileUserId} onPress={() => onOpenProfile(item)} style={styles.feedCard}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.feedName}>{item.firstName}</Text>
                <Text style={styles.feedMeta}>{formatIntent(item.intent)} • {item.primaryVibe ?? "General"}</Text>
              </View>
              <Text style={styles.feedMeta}>{formatRemaining(item.sessionDurationRemaining)}</Text>
            </View>
            <Text style={styles.body}>{item.hintText ?? "No hint set."}</Text>
            <View style={styles.rowBetween}>
              <Tag label={item.primaryVibe ?? "Open"} />
              <GhostButton label="Wave" onPress={() => onWave(item)} compact />
            </View>
          </Pressable>
        ))}
      </View>
    </Card>
  );
}

function ProfileScreen({
  item,
  onBack,
  onWave,
  onApproach,
  onHide,
  onOpenSafety,
}: {
  item: NearbyFeedItem;
  onBack: () => void;
  onWave: () => void;
  onApproach: () => void;
  onHide: () => void;
  onOpenSafety: () => void;
}) {
  return (
    <Card>
      <View style={styles.rowBetween}>
        <GhostButton label="Back" onPress={onBack} compact />
        <GhostButton label="Safety" onPress={onOpenSafety} compact />
      </View>
      <View style={styles.profileAvatar}>
        <Text style={styles.profileAvatarGlyph}>{item.firstName.slice(0, 1)}</Text>
      </View>
      <Text style={styles.title}>{item.firstName}</Text>
      <Text style={styles.feedMeta}>{formatIntent(item.intent)}</Text>
      <View style={styles.tagRow}>
        <Tag label={item.primaryVibe ?? "Open"} />
        <Tag label="Design" subtle />
      </View>
      <Text style={styles.sectionLabel}>Hint</Text>
      <Text style={styles.body}>{item.hintText ?? "No hint set."}</Text>
      <Text style={styles.sectionLabel}>Shared alignment</Text>
      <Text style={styles.body}>You both selected AI/startups.</Text>
      <Text style={styles.sectionLabel}>Icebreaker</Text>
      <Text style={styles.body}>
        Ask what they are building right now, not what they do in general.
      </Text>
      <View style={styles.wrapRow}>
        <GhostButton label="Wave" onPress={onWave} />
        <PrimaryButton label="I'm going over" onPress={onApproach} />
      </View>
      <GhostButton label="Hide this person" onPress={onHide} />
    </Card>
  );
}

function ApproachScreen({
  item,
  onCancel,
  onConfirmConnected,
  onOpenSafety,
}: {
  item: NearbyFeedItem;
  onCancel: () => void;
  onConfirmConnected: () => void;
  onOpenSafety: () => void;
}) {
  return (
    <Card>
      <View style={styles.rowBetween}>
        <GhostButton label="Cancel" onPress={onCancel} compact />
        <GhostButton label="Safety" onPress={onOpenSafety} compact />
      </View>
      <Text style={styles.title}>I&apos;m going over</Text>
      <Text style={styles.profileHero}>{item.firstName}</Text>
      <View style={styles.timerCircle}>
        <Text style={styles.timerValue}>60</Text>
        <Text style={styles.feedMeta}>sec</Text>
      </View>
      <Text style={styles.sectionLabel}>Look for</Text>
      <Text style={styles.body}>{item.hintText}</Text>
      <Text style={styles.sectionLabel}>Icebreaker</Text>
      <Text style={styles.body}>“What are you working on that feels genuinely exciting?”</Text>
      <PrimaryButton label="We connected!" onPress={onConfirmConnected} />
    </Card>
  );
}

function SafetyScreen({
  venueName,
  sessionVisible,
  onBack,
  onPauseVisibility,
  onEndSession,
  onHideVenue,
}: {
  venueName: string;
  sessionVisible: boolean;
  onBack: () => void;
  onPauseVisibility: () => void;
  onEndSession: () => void;
  onHideVenue: () => void;
}) {
  return (
    <Card>
      <GhostButton label="Back" onPress={onBack} compact />
      <Text style={styles.title}>Safety controls</Text>
      <Text style={styles.body}>
        Blocks are immediate and bilateral. Reports auto-hide the other user for the rest of
        the session.
      </Text>
      <Text style={styles.sectionLabel}>Current session</Text>
      <Text style={styles.body}>{sessionVisible ? "Visible nearby" : "Not visible right now"}</Text>
      <PrimaryButton label="Pause visibility" onPress={onPauseVisibility} />
      <GhostButton label="End session" onPress={onEndSession} />
      <Text style={styles.sectionLabel}>Venue protection</Text>
      <GhostButton label={`Hide me at ${venueName}`} onPress={onHideVenue} />
    </Card>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function Tag({ label, subtle = false }: { label: string; subtle?: boolean }) {
  return (
    <View style={[styles.tag, subtle && styles.tagSubtle]}>
      <Text style={[styles.tagLabel, subtle && styles.tagLabelSubtle]}>{label}</Text>
    </View>
  );
}

function SelectableTag({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.selectTag, active && styles.selectTagActive]}>
      <Text style={[styles.selectTagLabel, active && styles.selectTagLabelActive]}>{label}</Text>
    </Pressable>
  );
}

function PrimaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.primaryButton}>
      <Text style={styles.primaryButtonLabel}>{label}</Text>
    </Pressable>
  );
}

function GhostButton({
  label,
  onPress,
  compact = false,
}: {
  label: string;
  onPress: () => void;
  compact?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.ghostButton, compact && styles.ghostButtonCompact]}>
      <Text style={styles.ghostButtonLabel}>{label}</Text>
    </Pressable>
  );
}

function formatIntent(intent: string) {
  return intent.replaceAll("_", " ");
}

function formatRemaining(value: string) {
  if (value.startsWith("00:")) return value.slice(3, 8);
  return value;
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 72,
    paddingBottom: 64,
    gap: 16,
  },
  kicker: {
    color: "#7cf0d4",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.2,
  },
  card: {
    backgroundColor: "rgba(20, 20, 31, 0.94)",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 20,
    gap: 14,
  },
  title: {
    color: "#f3effa",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
  },
  body: {
    color: "#c5bfd4",
    fontSize: 15,
    lineHeight: 22,
  },
  meta: {
    color: "#8f86a7",
    fontSize: 12,
    letterSpacing: 1.3,
    fontWeight: "700",
  },
  badge: {
    backgroundColor: "rgba(124,240,212,0.12)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeLabel: {
    color: "#7cf0d4",
    fontSize: 12,
    fontWeight: "700",
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.03)",
    color: "#f3effa",
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: "#8d7cff",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryButtonLabel: {
    color: "#100d1d",
    fontSize: 15,
    fontWeight: "800",
  },
  ghostButton: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(141,124,255,0.4)",
    paddingHorizontal: 18,
    paddingVertical: 16,
    alignItems: "center",
  },
  ghostButtonCompact: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  ghostButtonLabel: {
    color: "#cfc7ff",
    fontSize: 14,
    fontWeight: "700",
  },
  sectionLabel: {
    color: "#8f86a7",
    fontSize: 12,
    letterSpacing: 1.5,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  wrapRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    borderRadius: 999,
    backgroundColor: "rgba(124,240,212,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  tagSubtle: {
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  tagLabel: {
    color: "#7cf0d4",
    fontSize: 12,
    fontWeight: "700",
  },
  tagLabelSubtle: {
    color: "#d2cde0",
  },
  selectTag: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selectTagActive: {
    backgroundColor: "rgba(141,124,255,0.2)",
    borderColor: "rgba(141,124,255,0.6)",
  },
  selectTagLabel: {
    color: "#d2cde0",
    fontSize: 13,
    fontWeight: "700",
  },
  selectTagLabelActive: {
    color: "#f3effa",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  stack: {
    gap: 12,
  },
  feedCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 16,
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  feedName: {
    color: "#f3effa",
    fontSize: 20,
    fontWeight: "700",
  },
  feedMeta: {
    color: "#8f86a7",
    fontSize: 13,
    fontWeight: "600",
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  avatarOption: {
    width: "47%",
    minHeight: 120,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  avatarOptionActive: {
    borderColor: "rgba(124,240,212,0.6)",
    backgroundColor: "rgba(124,240,212,0.08)",
  },
  avatarGlyph: {
    color: "#f3effa",
    fontSize: 28,
    fontWeight: "800",
  },
  avatarLabel: {
    color: "#c5bfd4",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  toggleLabel: {
    color: "#f3effa",
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  profileAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(141,124,255,0.24)",
    borderWidth: 1,
    borderColor: "rgba(141,124,255,0.5)",
  },
  profileAvatarGlyph: {
    color: "#f3effa",
    fontSize: 34,
    fontWeight: "800",
  },
  profileHero: {
    color: "#8d7cff",
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
  },
  timerCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: "rgba(141,124,255,0.6)",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  timerValue: {
    color: "#f3effa",
    fontSize: 42,
    fontWeight: "800",
  },
});
