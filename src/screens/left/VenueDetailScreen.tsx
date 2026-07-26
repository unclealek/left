import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { RuntimeVenueCandidate } from "../../features/location/location-storage";
import type { NearbyFeedItem, VenueActivityEnvelope, VenueContextSummary } from "../../types/left-domain";
import { T } from "../../app/leftTheme";
import { BackNavButton } from "../../components/left/navigation";

const VENUE_ILLUSTRATIONS = {
  cafe: require("../../../output/illustrations/venues/cafe.png"),
  restaurant: require("../../../output/illustrations/venues/restaurant.png"),
  bar: require("../../../output/illustrations/venues/bar.png"),
  coworking: require("../../../output/illustrations/venues/coworking.png"),
  market: require("../../../output/illustrations/venues/market.png"),
  park: require("../../../output/illustrations/venues/park.png"),
  library: require("../../../output/illustrations/venues/library.png"),
  generic: require("../../../output/illustrations/venues/generic-place.png"),
} as const;

const INTENT_TINT = "#F5EFE3";

type DetailIntent = {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  count: number;
  tint: string;
  iconColor: string;
};

export function VenueDetailScreen({
  venue,
  venueSummary,
  venueActivity,
  feed,
  sessionVisible,
  approachPrompt,
  approachPromptSaving,
  onChangeApproachPrompt,
  onSaveApproachPrompt,
  onBack,
  onPrimaryAction,
}: {
  venue: RuntimeVenueCandidate;
  venueSummary: VenueContextSummary;
  venueActivity: VenueActivityEnvelope | null;
  feed: NearbyFeedItem[];
  sessionVisible: boolean;
  approachPrompt: string;
  approachPromptSaving: boolean;
  onChangeApproachPrompt: (value: string) => void;
  onSaveApproachPrompt: () => void;
  onBack: () => void;
  onPrimaryAction: () => void;
}) {
  const insets = useSafeAreaInsets();
  const topInset = insets.top + 10;
  const isCurrentVenue =
    venue.id === venueSummary.venueId || venue.name === venueSummary.venueName;
  const seed = Math.abs(hashVenueName(venue.name));
  const venueType = venue.venueType ?? inferVenueTypeFromName(venue.name);
  const imageSource = getVenueIllustrationSource(venue.name, venueType);
  const fallbackEnergy = isCurrentVenue ? venueSummary.energyLevel : inferEnergyLevel(seed, venueType);
  const pulseBars = venueActivity?.activity.score != null
    ? getPulseBarsForScore(venueActivity.activity.score)
    : getPulseBars(fallbackEnergy);
  const visibleCount = venueActivity?.leftPresence.visible ?? (isCurrentVenue ? feed.length : 8 + (seed % 11));
  const openToMeetCount = venueActivity?.leftPresence.openToMeet ?? (isCurrentVenue
    ? feed.filter((item) => item.intent === "networking" || item.intent === "open_to_conversation").length
    : Math.max(2, Math.round(visibleCount * 0.42)));
  const usualCount = venueActivity?.activity.forecastScore ?? Math.max(1, visibleCount - 2 + (seed % 5));
  const intents = buildIntentBreakdown(isCurrentVenue ? feed : [], venueType, visibleCount, seed);
  const pulseTone = venueActivity?.activity
    ? getPulseToneForActivityLabel(venueActivity.activity.label)
    : getPulseTone(fallbackEnergy);
  const signalBarColor = venueActivity?.activity.score != null
    ? getSignalBarColorForScore(venueActivity.activity.score)
    : pulseTone.barColor;
  const signalBarBorderColor = `${signalBarColor}44`;
  const status = venueActivity?.activity
    ? {
        title: venueActivity.activity.displayText,
        subtitle: venueActivity.activity.liveAvailable
          ? venueActivity.activity.comparisonText
          : venueActivity.activity.forecastScore != null
            ? "Based on typical activity"
            : "Activity unavailable",
      }
    : getPulseStatus(fallbackEnergy);
  const primaryLabel = isCurrentVenue && sessionVisible ? "See People Here" : isCurrentVenue ? "Go Visible Here" : "Use This Venue";
  const primaryCaption = isCurrentVenue && sessionVisible ? "Open the people visible at this venue" : isCurrentVenue ? "Let others know you're here" : "Make this your active venue";
  const updatedAtCopy = venueActivity?.activity.updatedAt
    ? formatUpdatedAt(venueActivity.activity.updatedAt, venueActivity.activity.liveAvailable)
    : "Activity estimate";

  return (
    <View style={[screenStyles.page, { paddingTop: topInset }]}>
      <View style={[screenStyles.hero, { marginTop: -topInset }]}>
        <Image source={imageSource} style={screenStyles.heroImage} resizeMode="cover" />
        <LinearGradient
          colors={["rgba(17,15,12,0.04)", "rgba(17,15,12,0.10)", "rgba(253,249,238,0.88)"]}
          style={screenStyles.heroShade}
        />
        <View style={[screenStyles.heroControls, { top: topInset + 6 }]}>
          <BackNavButton label="" onPress={onBack} />
        </View>
      </View>

      <View style={screenStyles.sheet}>
        <View style={screenStyles.titleRow}>
          <View style={screenStyles.titleCopy}>
            <Text style={screenStyles.title}>{venue.name}</Text>
            <Text style={screenStyles.subtitle}>{formatVenueSubline(venue, isCurrentVenue, venueType)}</Text>
          </View>
        </View>

        <View style={screenStyles.divider} />

        <View style={screenStyles.pulseHeader}>
          <View style={screenStyles.pulseHeaderLeft}>
            <Feather name="activity" size={19} color={T.textPrimary} />
            <Text style={screenStyles.sectionTitle}>Live Pulse</Text>
          </View>
          <View style={screenStyles.pulseHeaderRight}>
            <Text style={screenStyles.pulseMeta}>{updatedAtCopy}</Text>
            <Feather name="rotate-cw" size={16} color={T.textSecondary} />
          </View>
        </View>

        <View style={screenStyles.pulseCard}>
          <LinearGradient
            colors={pulseTone.iconGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={screenStyles.pulseIconWrap}
          >
            <Feather name="users" size={26} color={pulseTone.iconColor} />
          </LinearGradient>
          <View style={screenStyles.pulseCopy}>
            <Text style={[screenStyles.pulseStatus, { color: pulseTone.titleColor }]}>
              {status.title}
            </Text>
            <Text numberOfLines={2} style={screenStyles.pulseSubtext}>{status.subtitle}</Text>
          </View>
          <View style={screenStyles.pulseBars}>
            {pulseBars.map((active, index) => (
              <View
                key={`pulse-${index}`}
                style={[
                  screenStyles.pulseBar,
                  getSignalBarHeightStyle(index),
                  active
                    ? [screenStyles.pulseBarActive, { backgroundColor: signalBarColor, borderColor: signalBarColor }]
                    : [screenStyles.pulseBarInactive, { borderColor: signalBarBorderColor }],
                ]}
              />
            ))}
          </View>
        </View>

        <View style={screenStyles.statsRow}>
          <View style={screenStyles.statCard}>
            <View style={[screenStyles.statIconBubble, screenStyles.statIconWarm]}>
              <Feather name="users" size={21} color={"#982206"} />
            </View>
            <Text style={screenStyles.statTitle}>People on Left</Text>
            <Text style={screenStyles.statValue}>{visibleCount}</Text>
            <Text style={screenStyles.statAccent}>{`${openToMeetCount} open to meet`}</Text>
          </View>
          <View style={screenStyles.statCard}>
            <View style={[screenStyles.statIconBubble, screenStyles.statIconCool]}>
              <Feather name="clock" size={21} color={"#325735"} />
            </View>
            <Text style={screenStyles.statTitle}>Usual at this time</Text>
            <Text style={screenStyles.statValue}>{usualCount}</Text>
            <Text style={screenStyles.statBody}>
              {venueActivity?.activity.liveAvailable ? "Typical level for this hour" : "Based on forecast"}
            </Text>
          </View>
        </View>

        <View style={screenStyles.intentSection}>
          <Text style={screenStyles.sectionHeading}>Social Intent</Text>
          <View style={screenStyles.intentCard}>
            <View style={screenStyles.intentRow}>
              {intents.map((intent) => (
                <View key={intent.label} style={screenStyles.intentItem}>
                  <View style={[screenStyles.intentIconBubble, { backgroundColor: intent.tint }]}>
                    <Feather name={intent.icon} size={23} color={intent.iconColor} />
                  </View>
                  <Text style={screenStyles.intentLabel}>{intent.label}</Text>
                  <Text style={screenStyles.intentCount}>{intent.count}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {sessionVisible ? (
          <View style={screenStyles.promptSection}>
            <View style={screenStyles.promptHeader}>
              <Text style={screenStyles.sectionHeading}>Venue-specific approach prompt</Text>
              <Text style={screenStyles.promptMeta}>Used when you approach someone here</Text>
            </View>
            <View style={screenStyles.promptCard}>
              <TextInput
                value={approachPrompt}
                onChangeText={onChangeApproachPrompt}
                placeholder="What should Left suggest when you're walking over here?"
                placeholderTextColor={T.textMuted}
                style={screenStyles.promptInput}
                multiline
                maxLength={160}
                textAlignVertical="top"
              />
              <Pressable
                onPress={onSaveApproachPrompt}
                style={({ pressed }) => [
                  screenStyles.promptSaveButton,
                  pressed && screenStyles.primaryButtonPressed,
                ]}
              >
                <Text style={screenStyles.promptSaveButtonText}>
                  {approachPromptSaving ? "Saving..." : "Save prompt"}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        <Text style={screenStyles.privacyNote}>
          Only your first name and current vibe are shared with others checked-in here. No photos or precise coordinates are ever broadcast.
        </Text>

        <Pressable onPress={onPrimaryAction} style={({ pressed }) => [screenStyles.primaryButton, pressed && screenStyles.primaryButtonPressed]}>
          <View style={screenStyles.primaryButtonFill}>
            <Text style={screenStyles.primaryButtonText}>
              {isCurrentVenue && sessionVisible ? "See People Here" : "Check-in at this Venue"}
            </Text>
            <Text style={screenStyles.primaryButtonSubtext}>
              {isCurrentVenue && sessionVisible ? primaryCaption : "Make this your active location"}
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

function formatVenueSubline(
  venue: RuntimeVenueCandidate,
  isCurrentVenue: boolean,
  venueType: RuntimeVenueCandidate["venueType"],
) {
  const distance = formatDistanceLabel(venue.distanceMeters);
  const venueLabel = formatVenueTypeLabel(venueType);
  if (isCurrentVenue) return `${venueLabel} · your current venue`;
  if (distance) return `${distance} · ${venueLabel.toLowerCase()}`;
  return `${venueLabel} nearby`;
}

function buildIntentBreakdown(
  feed: NearbyFeedItem[],
  venueType: RuntimeVenueCandidate["venueType"],
  visibleCount: number,
  seed: number,
) {
  if (feed.length > 0) {
    const intentMap: Record<string, number> = {};
    for (const item of feed) {
      const label = mapIntentToDisplay(item.intent);
      intentMap[label] = (intentMap[label] ?? 0) + 1;
    }
    const ordered = Object.entries(intentMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([label, count], index) => buildIntentItem(label, count, index === 0));
    if (ordered.length >= 4) return ordered;
  }

  const librarySet: DetailIntent[] = [
    buildIntentItem("Study", 4 + (seed % 5), true),
    buildIntentItem("Networking", 2 + (seed % 4)),
    buildIntentItem("Coffee", 2 + (seed % 3)),
    buildIntentItem("Focused", Math.max(1, visibleCount - 8)),
  ];
  const cafeSet: DetailIntent[] = [
    buildIntentItem("Coffee", 3 + (seed % 5), true),
    buildIntentItem("Networking", 2 + (seed % 4)),
    buildIntentItem("Open", 2 + (seed % 3)),
    buildIntentItem("Working", Math.max(1, visibleCount - 7)),
  ];
  const coworkingSet: DetailIntent[] = [
    buildIntentItem("Builders", 3 + (seed % 5), true),
    buildIntentItem("Networking", 2 + (seed % 4)),
    buildIntentItem("Focus", 2 + (seed % 4)),
    buildIntentItem("Coffee", Math.max(1, visibleCount - 6)),
  ];

  if (venueType === "library" || venueType === "university") return librarySet;
  if (venueType === "coworking_space") return coworkingSet;
  return cafeSet;
}

function buildIntentItem(label: string, count: number, highlighted = false): DetailIntent {
  const normalized = label.toLowerCase();
  const tint = highlighted ? "#FFB950" : INTENT_TINT;
  const iconColor = highlighted ? "#291800" : T.textPrimary;
  if (normalized.includes("study") || normalized.includes("focus")) {
    return { label, icon: "book-open", count, tint, iconColor };
  }
  if (normalized.includes("network")) {
    return { label, icon: "briefcase", count, tint, iconColor };
  }
  if (normalized.includes("coffee")) {
    return { label, icon: "coffee", count, tint, iconColor };
  }
  if (normalized.includes("work") || normalized.includes("builder")) {
    return { label, icon: "monitor", count, tint, iconColor };
  }
  return { label, icon: "message-circle", count, tint, iconColor };
}

function mapIntentToDisplay(intent: NearbyFeedItem["intent"]) {
  if (intent === "networking") return "Network";
  if (intent === "open_to_conversation") return "Open";
  if (intent === "group_discussion") return "Group";
  return "Coffee";
}

function inferVenueTypeFromName(venueName: string) {
  const normalized = venueName.toLowerCase();
  if (/cafe|coffee|espresso|roastery/.test(normalized)) return "cafe" as const;
  if (/library|books|reading|oodi/.test(normalized)) return "library" as const;
  if (/cowork|co-working|workspace|office|studio|hub/.test(normalized)) return "coworking_space" as const;
  if (/university|campus|college/.test(normalized)) return "university" as const;
  return "other" as const;
}

function inferEnergyLevel(seed: number, venueType: RuntimeVenueCandidate["venueType"]) {
  if (venueType === "library") return "focused" as const;
  if (venueType === "coworking_space") return "active" as const;
  const levels = ["warm", "active", "busy", "calm"] as const;
  return levels[seed % levels.length];
}

function getPulseStatus(level: VenueContextSummary["energyLevel"]) {
  if (level === "busy") return { title: "Busy now", subtitle: "Higher than usual" };
  if (level === "active") return { title: "Active now", subtitle: "Good moment to connect" };
  if (level === "focused") return { title: "Focused now", subtitle: "Quiet energy, more intentional" };
  if (level === "warm") return { title: "Warm now", subtitle: "Steady and social" };
  return { title: "Calm now", subtitle: "A softer moment here" };
}

function getPulseBars(level: VenueContextSummary["energyLevel"]) {
  const activeCount = level === "busy" ? 4 : level === "active" ? 4 : level === "focused" ? 3 : level === "warm" ? 3 : 2;
  return Array.from({ length: 5 }, (_, index) => index < activeCount);
}

function getPulseTone(level: VenueContextSummary["energyLevel"]) {
  switch (level) {
    case "busy":
      return {
        titleColor: "#C1462E",
        iconColor: "#C1462E",
        barColor: "#C1462E",
        barBorderColor: "rgba(193,70,46,0.24)",
        iconGradient: ["#F9DDD6", "#FFF4EF"] as [string, string],
      };
    case "active":
      return {
        titleColor: T.primary,
        iconColor: T.primary,
        barColor: T.primary,
        barBorderColor: "rgba(53,102,77,0.24)",
        iconGradient: [T.primarySoft, "#FFF7EB"] as [string, string],
      };
    case "warm":
      return {
        titleColor: "#825500",
        iconColor: "#825500",
        barColor: "#FDB64A",
        barBorderColor: "rgba(253,182,74,0.34)",
        iconGradient: ["#FFDDB3", "#FFF8EA"] as [string, string],
      };
    case "focused":
      return {
        titleColor: "#4C5B8F",
        iconColor: "#4C5B8F",
        barColor: "#4C5B8F",
        barBorderColor: "rgba(76,91,143,0.24)",
        iconGradient: ["#E8ECF8", "#F8F9FE"] as [string, string],
      };
    default:
      return {
        titleColor: "#7A8478",
        iconColor: "#7A8478",
        barColor: "#7A8478",
        barBorderColor: "rgba(122,132,120,0.24)",
        iconGradient: ["#EEF1EA", "#FAFBF8"] as [string, string],
      };
  }
}

function getVenueIllustrationSource(
  venueName: string,
  venueType: RuntimeVenueCandidate["venueType"] | undefined,
) {
  const resolvedVenueType = venueType ?? inferVenueTypeFromName(venueName);
  if (resolvedVenueType === "cafe") return VENUE_ILLUSTRATIONS.cafe;
  if (resolvedVenueType === "coworking_space") return VENUE_ILLUSTRATIONS.coworking;
  if (resolvedVenueType === "library") return VENUE_ILLUSTRATIONS.library;
  if (resolvedVenueType === "university") return VENUE_ILLUSTRATIONS.library;
  const normalized = venueName.toLowerCase();
  if (/restaurant|grill|steak|bistro|kitchen|diner|pizza|sushi|brasserie|eatery/.test(normalized)) return VENUE_ILLUSTRATIONS.restaurant;
  if (/bar|pub|tap|cocktail|wine|brew|club|lounge/.test(normalized)) return VENUE_ILLUSTRATIONS.bar;
  if (/market|hall|grocery|bazaar/.test(normalized)) return VENUE_ILLUSTRATIONS.market;
  if (/park|garden|green|square/.test(normalized)) return VENUE_ILLUSTRATIONS.park;
  return VENUE_ILLUSTRATIONS.generic;
}

function formatDistanceLabel(distanceMeters: number | null) {
  if (distanceMeters == null || distanceMeters <= 0) return null;
  if (distanceMeters < 1000) return `${Math.round(distanceMeters)} m away`;
  const minutes = Math.max(1, Math.round(distanceMeters / 80));
  return `${minutes} min walk`;
}

function formatVenueTypeLabel(venueType: RuntimeVenueCandidate["venueType"]) {
  if (venueType === "library") return "Library";
  if (venueType === "coworking_space") return "Coworking";
  if (venueType === "university") return "Campus";
  if (venueType === "cafe") return "Cafe";
  return "Venue";
}

function hashVenueName(value: string) {
  return value.split("").reduce((total, char) => total * 31 + char.charCodeAt(0), 7);
}

function getPulseBarsForScore(score: number) {
  const activeCount =
    score <= 20 ? 1 :
    score <= 40 ? 2 :
    score <= 60 ? 3 :
    score <= 80 ? 4 : 5;
  return Array.from({ length: 5 }, (_, index) => index < activeCount);
}

function getSignalBarColorForScore(score: number) {
  const activeCount =
    score <= 20 ? 1 :
    score <= 40 ? 2 :
    score <= 60 ? 3 :
    score <= 80 ? 4 : 5;
  return activeCount >= 3 ? T.primary : "#FDB64A";
}

function getPulseToneForActivityLabel(label: VenueActivityEnvelope["activity"]["label"]) {
  switch (label) {
    case "quiet":
      return {
        titleColor: "#7A8478",
        iconColor: "#7A8478",
        barColor: "#7A8478",
        barBorderColor: "rgba(122,132,120,0.24)",
        iconGradient: ["#EEF1EA", "#FAFBF8"] as [string, string],
      };
    case "light":
      return {
        titleColor: "#825500",
        iconColor: "#825500",
        barColor: "#FDB64A",
        barBorderColor: "rgba(253,182,74,0.34)",
        iconGradient: ["#FFDDB3", "#FFF8EA"] as [string, string],
      };
    case "active":
      return {
        titleColor: T.primary,
        iconColor: T.primary,
        barColor: T.primary,
        barBorderColor: "rgba(53,102,77,0.24)",
        iconGradient: [T.primarySoft, "#FFF7EB"] as [string, string],
      };
    case "busy":
    case "packed":
      return {
        titleColor: "#C1462E",
        iconColor: "#C1462E",
        barColor: "#C1462E",
        barBorderColor: "rgba(193,70,46,0.24)",
        iconGradient: ["#F9DDD6", "#FFF4EF"] as [string, string],
      };
    case "closed":
    case "unknown":
    default:
      return getPulseTone("calm");
  }
}

function formatUpdatedAt(updatedAt: string, liveAvailable: boolean) {
  const timestamp = new Date(updatedAt).getTime();
  if (Number.isNaN(timestamp)) {
    return liveAvailable ? "Updated this hour" : "Based on typical activity";
  }

  const diffMinutes = Math.max(0, Math.round((Date.now() - timestamp) / 60000));
  if (liveAvailable) {
    if (diffMinutes < 60) return "Updated this hour";
    return `Updated ${diffMinutes} min ago`;
  }
  return "Based on typical activity";
}

function getSignalBarHeightStyle(index: number) {
  const heights = [14, 20, 27, 34, 42];
  return {
    height: heights[index] ?? heights[heights.length - 1],
  };
}

const screenStyles = StyleSheet.create({
  page: {
    marginHorizontal: -20,
    paddingBottom: 28,
    gap: 0,
    backgroundColor: T.ink,
  },
  hero: {
    position: "relative",
    height: 392,
    overflow: "hidden",
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    backgroundColor: "#D7D0C2",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroShade: {
    ...StyleSheet.absoluteFillObject,
  },
  heroControls: {
    position: "absolute",
    left: 18,
    right: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  sheet: {
    marginTop: -34,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    backgroundColor: "#FDF9EE",
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 34,
    gap: 20,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  titleCopy: {
    flex: 1,
    gap: 6,
  },
  title: {
    color: "#211814",
    fontSize: 28,
    lineHeight: 34,
    fontFamily: T.fontDisplayBold,
    letterSpacing: -0.8,
  },
  subtitle: {
    color: T.textSecondary,
    fontSize: 16,
    lineHeight: 21,
    fontFamily: T.fontBody,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(31,46,36,0.10)",
  },
  pulseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pulseHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pulseHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    color: T.textPrimary,
    fontSize: 16,
    fontFamily: T.fontBodyBold,
  },
  pulseMeta: {
    color: T.textSecondary,
    fontSize: 14,
    fontFamily: T.fontBody,
  },
  pulseCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(31,46,36,0.10)",
    backgroundColor: "#F7F3E8",
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  pulseIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  pulseCopy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  pulseStatus: {
    fontSize: 18,
    fontFamily: T.fontBodyBold,
  },
  pulseSubtext: {
    color: T.textSecondary,
    fontSize: 14,
    fontFamily: T.fontBody,
  },
  pulseBars: {
    flexDirection: "row",
    gap: 4,
    marginLeft: "auto",
    alignItems: "flex-end",
  },
  pulseBar: {
    width: 12,
    borderRadius: 4,
    borderWidth: 1,
  },
  pulseBarActive: {
    backgroundColor: T.primary,
    borderColor: T.primary,
  },
  pulseBarInactive: {
    backgroundColor: "#FFF9F1",
    borderColor: "rgba(53,102,77,0.24)",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minHeight: 164,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(31,46,36,0.10)",
    backgroundColor: "#F7F3E8",
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 16,
    gap: 4,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  statIconBubble: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  statIconWarm: {
    backgroundColor: "#FFDAD2",
  },
  statIconCool: {
    backgroundColor: "#C3EEC0",
  },
  statTitle: {
    color: T.textPrimary,
    fontSize: 15,
    lineHeight: 18,
    fontFamily: T.fontBodyBold,
  },
  statValue: {
    color: T.textPrimary,
    fontSize: 44,
    lineHeight: 46,
    fontFamily: T.fontDisplayBold,
    letterSpacing: -1.2,
  },
  statAccent: {
    color: T.visibilityOn,
    fontSize: 14,
    lineHeight: 18,
    fontFamily: T.fontBodyMedium,
  },
  statBody: {
    color: T.textSecondary,
    fontSize: 14,
    lineHeight: 18,
    fontFamily: T.fontBody,
    maxWidth: 132,
  },
  intentSection: {
    gap: 14,
  },
  sectionHeading: {
    color: T.textPrimary,
    fontSize: 16,
    fontFamily: T.fontBodyBold,
  },
  intentCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(31,46,36,0.10)",
    backgroundColor: "#FBF8F1",
    paddingHorizontal: 16,
    paddingVertical: 18,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  intentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  intentItem: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  intentIconBubble: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
  },
  intentLabel: {
    color: T.textPrimary,
    minHeight: 34,
    fontSize: 12,
    lineHeight: 15,
    textAlign: "center",
    fontFamily: T.fontBodyMedium,
  },
  intentCount: {
    color: T.textPrimary,
    fontSize: 16,
    lineHeight: 18,
    fontFamily: T.fontBodyBold,
  },
  privacyNote: {
    color: "rgba(31,46,36,0.38)",
    fontSize: 12,
    lineHeight: 20,
    textAlign: "center",
    fontFamily: T.fontBodyBold,
    fontStyle: "italic",
    paddingHorizontal: 16,
    marginTop: 2,
  },
  promptSection: {
    gap: 10,
  },
  promptHeader: {
    gap: 4,
  },
  promptMeta: {
    color: T.textSecondary,
    fontSize: 13,
    lineHeight: 17,
    fontFamily: T.fontBody,
  },
  promptCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(31,46,36,0.10)",
    backgroundColor: "#FBF8F1",
    padding: 16,
    gap: 12,
  },
  promptInput: {
    minHeight: 92,
    borderRadius: 18,
    backgroundColor: "#F3EEE1",
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: T.textPrimary,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: T.fontBody,
  },
  promptSaveButton: {
    alignSelf: "flex-start",
    borderRadius: 16,
    backgroundColor: T.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  promptSaveButtonText: {
    color: T.white,
    fontSize: 14,
    fontFamily: T.fontBodyBold,
  },
  primaryButton: {
    borderRadius: 30,
    overflow: "hidden",
    marginTop: 6,
  },
  primaryButtonPressed: {
    opacity: 0.88,
  },
  primaryButtonFill: {
    backgroundColor: "#FDB64A",
    paddingVertical: 18,
    alignItems: "center",
    gap: 1,
  },
  primaryButtonText: {
    color: "#704800",
    fontSize: 17,
    fontFamily: T.fontBodyBold,
  },
  primaryButtonSubtext: {
    color: "rgba(112,72,0,0.82)",
    fontSize: 13,
    fontFamily: T.fontBody,
  },
});
