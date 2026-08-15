import { Image, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { RuntimeVenueCandidate } from "../../features/location/location-storage";
import type { NearbyFeedItem, VenueActivityEnvelope, VenueContextSummary } from "../../types/left-domain";
import { T } from "../../app/leftTheme";
import { PrimaryButton } from "../../components/buttons";
import { LeftIcon } from "../../components/icons";
import { GlassSurface, glassRadii } from "../../components/glass";
import { BackNavButton } from "../../components/left/navigation";
import { venueDetailStyles as styles } from "../../components/styles/features/venue-detail";

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

export function VenueDetailScreen({
  venue,
  venueSummary,
  venueActivity,
  feed,
  sessionVisible,
  onBack,
  onPrimaryAction,
}: {
  venue: RuntimeVenueCandidate;
  venueSummary: VenueContextSummary;
  venueActivity: VenueActivityEnvelope | null;
  feed: NearbyFeedItem[];
  sessionVisible: boolean;
  onBack: () => void;
  onPrimaryAction: () => void;
}) {
  const insets = useSafeAreaInsets();
  const isCurrentVenue = venue.id === venueSummary.venueId || venue.name === venueSummary.venueName;
  const venueType = venue.venueType ?? inferVenueTypeFromName(venue.name);
  const imageSource = getVenueIllustrationSource(venue.name, venueType);
  const currentFeed = isCurrentVenue ? feed : [];
  const visibleCount = venueActivity?.leftPresence.visible ?? (isCurrentVenue ? currentFeed.length : null);
  const openToMeetCount = venueActivity?.leftPresence.openToMeet ?? (isCurrentVenue
    ? currentFeed.filter((item) => item.intent === "networking" || item.intent === "open_to_conversation").length
    : null);
  const forecastCount = venueActivity?.activity.forecastScore ?? null;
  const activityState = getActivityState(venueActivity, isCurrentVenue ? venueSummary.energyLevel : null);
  const pulseBars = activityState.score == null
    ? Array.from({ length: 5 }, () => false)
    : getPulseBarsForScore(activityState.score);
  const subline = formatVenueSubline(venue, isCurrentVenue, venueType);
  const statusLabel = formatDistanceLabel(venue.distanceMeters) ?? "Nearby venue";
  const primaryLabel = isCurrentVenue && sessionVisible
    ? "See people here"
    : !sessionVisible
      ? "Go visible here"
      : "Use this venue";

  return (
    <View style={[styles.page, { paddingTop: Math.max(insets.top, 12) }]}>
      <View style={styles.hero}>
        <Image source={imageSource} style={styles.heroImage} resizeMode="cover" />
        <View style={styles.heroBackButton}>
          <BackNavButton label="" onPress={onBack} />
        </View>
        <GlassSurface
          variant="soft"
          radius={glassRadii.pill}
          style={styles.heroStatusGlass}
          contentStyle={styles.heroStatusPill}
        >
          <LeftIcon name="map-pin" size={15} color={T.textPrimary} />
          <Text style={styles.heroStatusText}>{statusLabel}</Text>
        </GlassSurface>
      </View>

      <View style={styles.content}>
        <View style={styles.identityBlock}>
          <Text style={styles.title}>{venue.name}</Text>
          <Text style={styles.subtitle}>{subline}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Live pulse</Text>
          <View style={styles.pulseCard}>
            <View style={[styles.pulseIconWrap, { backgroundColor: activityState.softColor }]}>
              <LeftIcon name="activity" size={21} color={activityState.color} />
            </View>
            <View style={styles.pulseCopy}>
              <Text style={[styles.pulseTitle, { color: activityState.color }]}>{activityState.title}</Text>
              <Text style={styles.pulseSubtitle}>{activityState.subtitle}</Text>
            </View>
            <View
              accessible
              accessibilityLabel={activityState.score == null
                ? "Activity score unavailable"
                : `Activity score ${activityState.score} out of 100`}
              style={styles.pulseBars}
            >
              {pulseBars.map((active, index) => (
                <View
                  key={`pulse-${index}`}
                  style={[
                    styles.pulseBar,
                    getSignalBarHeightStyle(index),
                    active
                      ? { backgroundColor: activityState.color, borderColor: activityState.color }
                      : styles.pulseBarInactive,
                  ]}
                />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.peopleHeading}>
            <Text style={styles.sectionTitle}>People on Left</Text>
            <Text style={styles.peopleSubtitle}>
              {visibleCount == null ? "Live presence is not available yet" : "Visible at this venue now"}
            </Text>
          </View>
          <View style={styles.peopleCard}>
            <View style={styles.peopleMetric}>
              <Text style={styles.peopleMetricValue}>{visibleCount ?? "—"}</Text>
              <Text style={styles.peopleMetricLabel}>Visible now</Text>
            </View>
            <View style={styles.peopleMetricDivider} />
            <View style={styles.peopleMetric}>
              <Text style={styles.peopleMetricValue}>{openToMeetCount ?? "—"}</Text>
              <Text style={styles.peopleMetricLabel}>Open to meet</Text>
            </View>
            {forecastCount != null ? (
              <>
                <View style={styles.peopleMetricDivider} />
                <View style={styles.peopleMetric}>
                  <Text style={styles.peopleMetricValue}>{forecastCount}</Text>
                  <Text style={styles.peopleMetricLabel}>Typical score</Text>
                </View>
              </>
            ) : null}
          </View>
        </View>

        <View style={styles.privacyRow}>
          <View style={styles.privacyIconWrap}>
            <LeftIcon name="lock" size={17} color={T.primary} />
          </View>
          <View style={styles.privacyCopy}>
            <Text style={styles.privacyTitle}>Your precise location stays private</Text>
            <Text style={styles.privacyText}>Only your first name, venue, intent, and vibe are shown while visible.</Text>
          </View>
        </View>

        <PrimaryButton
          label={primaryLabel}
          onPress={onPrimaryAction}
        />
      </View>
    </View>
  );
}

function getActivityState(
  venueActivity: VenueActivityEnvelope | null,
  fallbackEnergy: VenueContextSummary["energyLevel"] | null,
) {
  if (venueActivity?.activity) {
    const score = venueActivity.activity.score ?? venueActivity.activity.forecastScore;
    const tone = score == null
      ? { color: T.textSecondary, softColor: T.surfaceMid }
      : getActivityTone(score);
    return {
      title: venueActivity.activity.displayText,
      subtitle: venueActivity.activity.liveAvailable
        ? venueActivity.activity.comparisonText
        : venueActivity.activity.forecastScore != null
          ? "Based on typical activity"
          : "Live activity is unavailable",
      score,
      ...tone,
    };
  }

  if (fallbackEnergy) {
    const fallback = getFallbackActivity(fallbackEnergy);
    return fallback;
  }

  return {
    title: "No live activity yet",
    subtitle: "Activity will appear when verified signals are available.",
    score: null,
    color: T.textSecondary,
    softColor: T.surfaceMid,
  };
}

function getFallbackActivity(level: VenueContextSummary["energyLevel"]) {
  if (level === "busy") return { title: "Busy now", subtitle: "Higher activity than usual", score: 84, color: T.visibilityOff, softColor: T.visibilityOffSoft };
  if (level === "active") return { title: "Active now", subtitle: "A good moment to connect", score: 68, color: T.visibilityOn, softColor: T.visibilityOnSoft };
  if (level === "warm") return { title: "Warm now", subtitle: "Steady and social", score: 56, color: T.visibilityOn, softColor: T.visibilityOnSoft };
  if (level === "focused") return { title: "Focused now", subtitle: "Quiet, intentional energy", score: 42, color: T.venueAccent, softColor: T.venueAccentSoft };
  return { title: "Calm now", subtitle: "A quieter moment here", score: 28, color: T.textSecondary, softColor: T.surfaceMid };
}

function getActivityTone(score: number) {
  if (score >= 75) return { color: T.visibilityOff, softColor: T.visibilityOffSoft };
  if (score >= 45) return { color: T.visibilityOn, softColor: T.visibilityOnSoft };
  return { color: T.venueAccent, softColor: T.venueAccentSoft };
}

function formatVenueSubline(
  venue: RuntimeVenueCandidate,
  isCurrentVenue: boolean,
  venueType: RuntimeVenueCandidate["venueType"],
) {
  const venueLabel = formatVenueTypeLabel(venueType);
  const distance = formatDistanceLabel(venue.distanceMeters);
  if (distance) return `${venueLabel} · ${distance}`;
  return isCurrentVenue ? `${venueLabel} · current venue` : `${venueLabel} nearby`;
}

function getVenueIllustrationSource(
  venueName: string,
  venueType: RuntimeVenueCandidate["venueType"] | undefined,
) {
  const resolvedVenueType = venueType ?? inferVenueTypeFromName(venueName);
  if (resolvedVenueType === "cafe") return VENUE_ILLUSTRATIONS.cafe;
  if (resolvedVenueType === "coworking_space") return VENUE_ILLUSTRATIONS.coworking;
  if (resolvedVenueType === "library" || resolvedVenueType === "university") return VENUE_ILLUSTRATIONS.library;
  const normalized = venueName.toLowerCase();
  if (/restaurant|grill|steak|bistro|kitchen|diner|pizza|sushi|brasserie|eatery/.test(normalized)) return VENUE_ILLUSTRATIONS.restaurant;
  if (/bar|pub|tap|cocktail|wine|brew|club|lounge/.test(normalized)) return VENUE_ILLUSTRATIONS.bar;
  if (/market|hall|grocery|bazaar/.test(normalized)) return VENUE_ILLUSTRATIONS.market;
  if (/park|garden|green|square/.test(normalized)) return VENUE_ILLUSTRATIONS.park;
  return VENUE_ILLUSTRATIONS.generic;
}

function inferVenueTypeFromName(venueName: string) {
  const normalized = venueName.toLowerCase();
  if (/cafe|coffee|espresso|roastery/.test(normalized)) return "cafe" as const;
  if (/library|books|reading|oodi/.test(normalized)) return "library" as const;
  if (/cowork|co-working|workspace|office|studio|hub/.test(normalized)) return "coworking_space" as const;
  if (/university|campus|college/.test(normalized)) return "university" as const;
  return "other" as const;
}

function formatDistanceLabel(distanceMeters: number | null) {
  if (distanceMeters == null || distanceMeters <= 0) return null;
  if (distanceMeters < 1000) return `${Math.round(distanceMeters)} m away`;
  return `${Math.max(1, Math.round(distanceMeters / 80))} min walk`;
}

function formatVenueTypeLabel(venueType: RuntimeVenueCandidate["venueType"]) {
  if (venueType === "library") return "Library";
  if (venueType === "coworking_space") return "Coworking";
  if (venueType === "university") return "Campus";
  if (venueType === "cafe") return "Cafe";
  return "Venue";
}

function getPulseBarsForScore(score: number) {
  const activeCount = score <= 20 ? 1 : score <= 40 ? 2 : score <= 60 ? 3 : score <= 80 ? 4 : 5;
  return Array.from({ length: 5 }, (_, index) => index < activeCount);
}

function getSignalBarHeightStyle(index: number) {
  const heights = [12, 17, 22, 27, 32];
  return { height: heights[index] ?? heights[heights.length - 1] };
}
