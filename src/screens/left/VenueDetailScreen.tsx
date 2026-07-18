import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { RuntimeVenueCandidate } from "../../features/location/location-storage";
import type { NearbyFeedItem, VenueContextSummary } from "../../types/left-domain";
import { T } from "../../app/leftTheme";

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

type DetailIntent = {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  count: number;
  tint: string;
};

export function VenueDetailScreen({
  venue,
  venueSummary,
  feed,
  sessionVisible,
  onBack,
  onPrimaryAction,
}: {
  venue: RuntimeVenueCandidate;
  venueSummary: VenueContextSummary;
  feed: NearbyFeedItem[];
  sessionVisible: boolean;
  onBack: () => void;
  onPrimaryAction: () => void;
}) {
  const isCurrentVenue =
    venue.id === venueSummary.venueId || venue.name === venueSummary.venueName;
  const seed = Math.abs(hashVenueName(venue.name));
  const venueType = venue.venueType ?? inferVenueTypeFromName(venue.name);
  const imageSource = getVenueIllustrationSource(venue.name, venueType);
  const pulseBars = getPulseBars(isCurrentVenue ? venueSummary.energyLevel : inferEnergyLevel(seed, venueType));
  const visibleCount = isCurrentVenue ? feed.length : 8 + (seed % 11);
  const openToMeetCount = isCurrentVenue
    ? feed.filter((item) => item.intent === "networking" || item.intent === "open_to_conversation").length
    : Math.max(2, Math.round(visibleCount * 0.42));
  const usualCount = Math.max(1, visibleCount - 2 + (seed % 5));
  const intents = buildIntentBreakdown(isCurrentVenue ? feed : [], venueType, visibleCount, seed);
  const pulseTone = getPulseTone(isCurrentVenue ? venueSummary.energyLevel : inferEnergyLevel(seed, venueType));
  const status = getPulseStatus(isCurrentVenue ? venueSummary.energyLevel : inferEnergyLevel(seed, venueType));
  const primaryLabel = isCurrentVenue && sessionVisible ? "See People Here" : isCurrentVenue ? "Go Visible Here" : "Use This Venue";
  const primaryCaption = isCurrentVenue && sessionVisible ? "Open the people visible at this venue" : isCurrentVenue ? "Let others know you're here" : "Make this your active venue";

  return (
    <View style={screenStyles.page}>
      <View style={screenStyles.hero}>
        <Image source={imageSource} style={screenStyles.heroImage} resizeMode="cover" />
        <LinearGradient
          colors={["rgba(17,15,12,0.12)", "rgba(17,15,12,0.28)", "rgba(17,15,12,0.48)"]}
          style={screenStyles.heroShade}
        />
        <View style={screenStyles.heroControls}>
          <IconCircleButton icon="chevron-left" onPress={onBack} />
          <View style={screenStyles.heroActions}>
            <IconCircleButton icon="share" />
            <IconCircleButton icon="more-vertical" />
          </View>
        </View>
      </View>

      <View style={screenStyles.sheet}>
        <View style={screenStyles.titleRow}>
          <View style={screenStyles.titleCopy}>
            <Text style={screenStyles.title}>{venue.name}</Text>
            <Text style={screenStyles.subtitle}>{formatVenueSubline(venue, isCurrentVenue, venueType)}</Text>
          </View>
          <View style={screenStyles.saveCircle}>
            <Feather name="bookmark" size={24} color={T.textSecondary} />
          </View>
        </View>

        <View style={screenStyles.divider} />

        <View style={screenStyles.pulseHeader}>
          <View style={screenStyles.pulseHeaderLeft}>
            <Feather name="activity" size={19} color={T.textPrimary} />
            <Text style={screenStyles.sectionTitle}>Live Pulse</Text>
          </View>
          <View style={screenStyles.pulseHeaderRight}>
            <Text style={screenStyles.pulseMeta}>Updated 3 min ago</Text>
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
            <Text numberOfLines={1} style={[screenStyles.pulseStatus, { color: pulseTone.titleColor }]}>
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
                  active
                    ? [screenStyles.pulseBarActive, { backgroundColor: pulseTone.barColor, borderColor: pulseTone.barColor }]
                    : [screenStyles.pulseBarInactive, { borderColor: pulseTone.barBorderColor }],
                ]}
              />
            ))}
          </View>
        </View>

        <View style={screenStyles.statsRow}>
          <View style={screenStyles.statCard}>
            <View style={[screenStyles.statIconBubble, screenStyles.statIconWarm]}>
              <Feather name="users" size={21} color={"#A55B2D"} />
            </View>
            <Text style={screenStyles.statTitle}>People on Left</Text>
            <Text style={screenStyles.statValue}>{visibleCount}</Text>
            <Text style={screenStyles.statAccent}>{`${openToMeetCount} open to meet`}</Text>
          </View>
          <View style={screenStyles.statCard}>
            <View style={[screenStyles.statIconBubble, screenStyles.statIconCool]}>
              <Feather name="clock" size={21} color={T.primary} />
            </View>
            <Text style={screenStyles.statTitle}>Usual at this time</Text>
            <Text style={screenStyles.statValue}>{usualCount}</Text>
            <Text style={screenStyles.statBody}>Based on live patterns</Text>
          </View>
        </View>

        <View style={screenStyles.intentSection}>
          <Text style={screenStyles.sectionHeading}>What people are here for</Text>
          <View style={screenStyles.intentRow}>
            {intents.map((intent) => (
              <View key={intent.label} style={screenStyles.intentItem}>
                <View style={[screenStyles.intentIconBubble, { backgroundColor: intent.tint }]}>
                  <Feather name={intent.icon} size={25} color={T.textPrimary} />
                </View>
                <Text style={screenStyles.intentLabel}>{intent.label}</Text>
                <Text style={screenStyles.intentCount}>{intent.count}</Text>
              </View>
            ))}
          </View>
        </View>

        <Pressable onPress={onPrimaryAction} style={({ pressed }) => [screenStyles.primaryButton, pressed && screenStyles.primaryButtonPressed]}>
          <LinearGradient
            colors={["#BE4D31", "#D35A38", "#C6482F"]}
            start={{ x: 0, y: 0.4 }}
            end={{ x: 1, y: 0.8 }}
            style={screenStyles.primaryButtonFill}
          >
            <Text style={screenStyles.primaryButtonText}>{primaryLabel}</Text>
            <Text style={screenStyles.primaryButtonSubtext}>{primaryCaption}</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

function IconCircleButton({
  icon,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [screenStyles.iconCircle, pressed && screenStyles.iconCirclePressed]}>
      <Feather name={icon} size={22} color={T.white} />
    </Pressable>
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
      .map(([label, count]) => buildIntentItem(label, count));
    if (ordered.length >= 4) return ordered;
  }

  const librarySet: DetailIntent[] = [
    buildIntentItem("Study", 4 + (seed % 5)),
    buildIntentItem("Networking", 2 + (seed % 4)),
    buildIntentItem("Coffee", 2 + (seed % 3)),
    buildIntentItem("Focused", Math.max(1, visibleCount - 8)),
  ];
  const cafeSet: DetailIntent[] = [
    buildIntentItem("Coffee", 3 + (seed % 5)),
    buildIntentItem("Networking", 2 + (seed % 4)),
    buildIntentItem("Open", 2 + (seed % 3)),
    buildIntentItem("Working", Math.max(1, visibleCount - 7)),
  ];
  const coworkingSet: DetailIntent[] = [
    buildIntentItem("Builders", 3 + (seed % 5)),
    buildIntentItem("Networking", 2 + (seed % 4)),
    buildIntentItem("Focus", 2 + (seed % 4)),
    buildIntentItem("Coffee", Math.max(1, visibleCount - 6)),
  ];

  if (venueType === "library" || venueType === "university") return librarySet;
  if (venueType === "coworking_space") return coworkingSet;
  return cafeSet;
}

function buildIntentItem(label: string, count: number): DetailIntent {
  const normalized = label.toLowerCase();
  if (normalized.includes("study") || normalized.includes("focus")) {
    return { label, icon: "book-open", count, tint: "#ECECE7" };
  }
  if (normalized.includes("network")) {
    return { label, icon: "briefcase", count, tint: "#F6E9D4" };
  }
  if (normalized.includes("coffee")) {
    return { label, icon: "coffee", count, tint: "#FAEBD9" };
  }
  if (normalized.includes("work") || normalized.includes("builder")) {
    return { label, icon: "monitor", count, tint: "#E9EBEE" };
  }
  return { label, icon: "message-circle", count, tint: "#F1ECE8" };
}

function mapIntentToDisplay(intent: NearbyFeedItem["intent"]) {
  if (intent === "networking") return "Networking";
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
  if (level === "busy" || level === "active") {
    return {
      titleColor: T.primary,
      iconColor: T.primary,
      barColor: T.primary,
      barBorderColor: "rgba(53,102,77,0.24)",
      iconGradient: [T.primarySoft, "#FFF7EB"] as [string, string],
    };
  }

  return {
    titleColor: "#B88A1B",
    iconColor: "#B88A1B",
    barColor: T.accent,
    barBorderColor: "rgba(255,195,77,0.34)",
    iconGradient: ["#FFF1CC", "#FFF8EA"] as [string, string],
  };
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

const screenStyles = StyleSheet.create({
  page: {
    gap: 0,
  },
  hero: {
    position: "relative",
    height: 306,
    overflow: "hidden",
    borderRadius: 34,
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
    top: 22,
    left: 18,
    right: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroActions: {
    flexDirection: "row",
    gap: 10,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(16,15,13,0.22)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  iconCirclePressed: {
    opacity: 0.84,
  },
  sheet: {
    marginTop: -18,
    borderRadius: 34,
    backgroundColor: "#FFF9F1",
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 26,
    gap: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -6 },
    elevation: 10,
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
    fontSize: 30,
    lineHeight: 34,
    fontFamily: T.fontDisplayLight,
    letterSpacing: -1.1,
  },
  subtitle: {
    color: T.textSecondary,
    fontSize: 16,
    lineHeight: 21,
    fontFamily: T.fontBody,
  },
  saveCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(31,46,36,0.14)",
    backgroundColor: "#FFFDF8",
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
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(31,46,36,0.10)",
    backgroundColor: "#FFFCF7",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  pulseIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
    gap: 6,
    marginLeft: "auto",
  },
  pulseBar: {
    width: 18,
    height: 44,
    borderRadius: 5,
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
    gap: 14,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(31,46,36,0.10)",
    backgroundColor: "#FFFCF7",
    padding: 16,
    gap: 6,
  },
  statIconBubble: {
    alignSelf: "flex-end",
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  statIconWarm: {
    backgroundColor: "#FFF0DF",
  },
  statIconCool: {
    backgroundColor: "#E5F0E5",
  },
  statTitle: {
    color: T.textPrimary,
    fontSize: 16,
    fontFamily: T.fontBodyMedium,
  },
  statValue: {
    color: T.textPrimary,
    fontSize: 43,
    lineHeight: 46,
    fontFamily: T.fontDisplayLight,
    letterSpacing: -1.8,
  },
  statAccent: {
    color: T.visibilityOn,
    fontSize: 15,
    fontFamily: T.fontBodyMedium,
  },
  statBody: {
    color: T.textSecondary,
    fontSize: 15,
    fontFamily: T.fontBody,
  },
  intentSection: {
    gap: 16,
  },
  sectionHeading: {
    color: T.textPrimary,
    fontSize: 16,
    fontFamily: T.fontBodyBold,
  },
  intentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  intentItem: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  intentIconBubble: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  intentLabel: {
    color: T.textPrimary,
    fontSize: 15,
    lineHeight: 18,
    textAlign: "center",
    fontFamily: T.fontBodyMedium,
  },
  intentCount: {
    color: T.textPrimary,
    fontSize: 24,
    lineHeight: 26,
    fontFamily: T.fontDisplayLight,
  },
  primaryButton: {
    borderRadius: 28,
    overflow: "hidden",
    marginTop: 2,
  },
  primaryButtonPressed: {
    opacity: 0.88,
  },
  primaryButtonFill: {
    paddingVertical: 16,
    alignItems: "center",
    gap: 2,
  },
  primaryButtonText: {
    color: T.white,
    fontSize: 18,
    fontFamily: T.fontBodyBold,
  },
  primaryButtonSubtext: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 14,
    fontFamily: T.fontBody,
  },
});
