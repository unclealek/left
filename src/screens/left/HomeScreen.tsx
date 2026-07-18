import { useEffect, useRef } from "react";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Animated, Easing, Image, Pressable, Text, View } from "react-native";
import type { RuntimeVenueCandidate } from "../../features/location/location-storage";
import {
  getVenueConfidenceCopy,
  getVenueConfidenceLabel,
  resolveVenueConfidence,
} from "../../features/location/venue-confidence";
import { styles, T } from "../../app/leftTheme";
import { LeftDoorwayMark } from "../../components/left/LeftDoorwayMark";
import { BrandPrimaryButton, VenueIdentityBlock } from "../../components/left/ui";
import type { VenueContextSummary } from "../../types/left-domain";

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

export function HomeScreen({
  firstName,
  venue,
  nearbyVenues,
  sessionVisible,
  venueHidden,
  onBecomeVisible,
  onOpenVenueDetail,
  onOpenSafety,
}: {
  firstName: string;
  venue: VenueContextSummary;
  nearbyVenues: RuntimeVenueCandidate[];
  sessionVisible: boolean;
  venueHidden: boolean;
  onBecomeVisible: () => void;
  onOpenVenueDetail: (venue: RuntimeVenueCandidate) => void;
  onOpenSafety: () => void;
  onComingSoon: (label: string) => void;
}) {
  const venueName = resolveVenueName(venue.venueName, nearbyVenues);
  const isVisible = sessionVisible && !venueHidden;
  const venueConfidence = resolveVenueConfidence(venue, nearbyVenues);
  const nearbyCards = buildNearbyVenueCards(nearbyVenues, venueName);
  const heroVenueType = nearbyVenues[0]?.venueType ?? inferVenueTypeFromName(venueName);
  const heroIllustration = getVenueIllustrationSource(venueName, heroVenueType);
  const confidenceLabel = getVenueConfidenceLabel(venueConfidence);
  const confidenceCopy = getVenueConfidenceCopy(venueConfidence);
  const heroStatus = isVisible
    ? `Visible at ${venueName}`
    : venueConfidence === "confirmed"
      ? `Hidden at ${venueName}`
      : venueConfidence === "nearby_guess"
        ? `Nearby match: ${venueName}`
        : "Venue needs confirmation";
  const heroCopy = isVisible
    ? "You are currently present here."
    : venueConfidence === "confirmed"
      ? "People here can't see you yet."
      : confidenceCopy;
  const ctaLabel = isVisible ? "Manage visibility" : "Go visible";
  const placesContext =
    venueConfidence === "confirmed"
      ? nearbyCards[0]?.distanceLabel
        ? `Closest ${nearbyCards[0].distanceLabel}`
        : "Nearby right now"
      : venueConfidence === "nearby_guess"
        ? "Likely places around you"
        : "Venue confirmation may be needed";
  const venueMetaCopy = isVisible
    ? "Venue activity visible now"
    : venueConfidence === "confirmed"
      ? "Private until you go visible"
      : venueConfidence === "nearby_guess"
        ? "Nearby match pending confirmation"
        : "Current venue still needs confirmation";

  return (
    <View style={styles.homePage}>
      <View style={styles.homeVenueHeader}>
        <VenueIdentityBlock
          icon="map-pin"
          title={venueName}
          metaIcon={isVisible ? "users" : "radio"}
          metaText={isVisible ? venueMetaCopy : confidenceLabel}
        />
        <View style={styles.homeBrandMark}>
          <LeftDoorwayMark size={24} archColor={T.primary} innerColor={T.accent} baseColor={T.accent} baseScale={0.52} />
          <PresencePulseIndicator isVisible={isVisible} />
        </View>
      </View>

      <View style={styles.homeHeroHeading}>
        <View style={styles.homeGreetingInline}>
          <Text style={styles.homeGreetingInlineName}>{`Hey ${firstName}! 👋`}</Text>
        </View>
        <Text style={styles.homeHeroTitleAccent}>Are you ready</Text>
        <Text style={styles.homeHeroTitleBottom}>to connect ?</Text>
      </View>

      <View style={styles.homeHeroCardV2}>
        <View style={styles.homeHeroCardTopRow}>
          <View style={styles.homeHeroCardCopyBlock}>
            <View style={styles.homeHeroStatusRow}>
              <View style={[styles.homeHeroStatusDot, isVisible ? styles.homeHeroStatusDotVisible : styles.homeHeroStatusDotHidden]} />
              <Text
                style={[
                  styles.homeHeroStatusText,
                  isVisible ? styles.homeHeroStatusTextVisible : styles.homeHeroStatusTextHidden,
                ]}
              >
                {heroStatus}
              </Text>
            </View>
            <Text style={styles.homeHeroCardCopy}>{heroCopy}</Text>
          </View>
          <LinearGradient
            colors={["#FFF4D8", "#FFF8EE", "#E9ECCE"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.homeHeroVenueArt}
          >
            <Image source={heroIllustration} style={styles.homeVenueIllustrationImage} resizeMode="cover" />
          </LinearGradient>
        </View>
        <BrandPrimaryButton label={ctaLabel} onPress={onBecomeVisible} size="compact" />
        <Pressable onPress={onOpenSafety} style={({ pressed }) => [styles.homeHeroPrivacyRow, pressed && styles.iconButtonPressed]}>
          <View style={styles.homeHeroPrivacyIconWrap}>
            <Feather name="lock" size={17} color={"rgba(46,33,20,0.78)"} />
          </View>
          <View style={styles.homeHeroPrivacyCopy}>
            <Text style={styles.homeHeroPrivacyText}>
              Private by default, go be <Text style={styles.homeHeroPrivacyHighlight}>visible</Text>.
            </Text>
          </View>
        </Pressable>
      </View>

      <View style={styles.homeExploreHeader}>
        <View style={styles.homeExploreHeaderCopy}>
          <Text style={styles.homeExploreTitle}>Places around you</Text>
          <Text style={styles.homeExploreMeta}>{placesContext}</Text>
        </View>
        <Text style={styles.homeExploreSideNote}>Browse venue flavor first</Text>
      </View>

      <View style={[styles.homeVenueGrid, nearbyCards.length === 1 && styles.homeVenueGridSingle]}>
        {nearbyCards.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => onOpenVenueDetail(item.venue)}
            style={({ pressed }) => [
              styles.homeVenueCard,
              nearbyCards.length === 1 && styles.homeVenueCardSingle,
              pressed && styles.iconButtonPressed,
            ]}
          >
            <View style={styles.homeVenueCardRow}>
              <LinearGradient
                colors={item.featured ? ["#F6D6C5", "#FFF2E8", "#E9ECCE"] : ["#E7E0D3", "#FFF6EA", "#DCE8D8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.homeVenueThumb, item.featured && styles.homeVenueThumbFeatured]}
              >
                <Image source={item.illustration} style={styles.homeVenueIllustrationImage} resizeMode="cover" />
              </LinearGradient>
              <View style={styles.homeVenueCardBody}>
                <View style={styles.homeVenueCardTopGroup}>
                  <Text style={[styles.homeVenueCardName, item.featured && styles.homeVenueCardNameFeatured]}>{item.name}</Text>
                  <View style={styles.homeVenueStatusRow}>
                    <View style={[styles.homeVenueStatusDot, { backgroundColor: item.statusColor }]} />
                    <Text style={styles.homeVenueStatusText}>{item.energyLabel}</Text>
                  </View>
                </View>
                {isVisible ? (
                  <View style={styles.homeVenuePeopleRow}>
                    <Feather name="users" size={16} color={item.peopleColor} />
                    <Text style={[styles.homeVenuePeopleText, { color: item.peopleColor }]}>
                      {item.peopleText}
                    </Text>
                  </View>
                ) : null}
                <View style={styles.homeVenueChipRow}>
                  {item.tags.map((tag) => (
                    <View key={`${item.id}-${tag.label}`} style={[styles.homeVenueChip, { backgroundColor: tag.tint }]}>
                      <Text style={styles.homeVenueChipText}>{tag.label}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.homeVenueDistanceRow}>
                  <Feather name="map-pin" size={15} color={T.textMuted} />
                  <Text style={styles.homeVenueDistanceText}>{item.distanceLabel}</Text>
                </View>
              </View>
              <View style={styles.homeVenueChevronBubble}>
                <Feather name="chevron-right" size={22} color={T.secondary} />
              </View>
            </View>
          </Pressable>
        ))}
      </View>

      <Pressable onPress={onOpenSafety} style={({ pressed }) => [styles.homeSafetyCard, pressed && styles.iconButtonPressed]}>
        <View style={styles.homeSafetyCardLeft}>
          <View style={styles.homeSafetyCardIconWrap}>
            <Feather name="shield" size={20} color={T.primary} />
          </View>
          <View style={styles.homeSafetyCardCopy}>
            <Text style={styles.homeSafetyCardTitle}>Safety controls</Text>
            <Text style={styles.homeSafetyCardSubtitle}>Control how you are discovered.</Text>
          </View>
        </View>
        <Feather name="chevron-right" size={22} color={"rgba(46,33,20,0.72)"} />
      </Pressable>
    </View>
  );
}

function PresencePulseIndicator({ isVisible }: { isVisible: boolean }) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  const pulseStyle = {
    transform: [
      {
        scale: pulse.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1.85],
        }),
      },
    ],
    opacity: pulse.interpolate({
      inputRange: [0, 0.65, 1],
      outputRange: [0.28, 0.14, 0],
    }),
  };

  return (
    <View style={styles.homePresenceIndicatorWrap}>
      <Animated.View
        style={[
          styles.homePresenceIndicatorPulse,
          isVisible ? styles.homePresenceIndicatorPulseVisible : styles.homePresenceIndicatorPulseHidden,
          pulseStyle,
        ]}
      />
      <View
        style={[
          styles.homePresenceIndicatorDot,
          isVisible ? styles.homePresenceIndicatorDotVisible : styles.homePresenceIndicatorDotHidden,
        ]}
      />
    </View>
  );
}

function resolveVenueName(value: string, nearbyVenues: RuntimeVenueCandidate[]) {
  const trimmed = value.trim();
  if (trimmed && trimmed !== "Current venue" && trimmed !== "Visibility off") {
    return trimmed;
  }
  const fallbackVenue = nearbyVenues.find((candidate) => candidate.name.trim());
  return fallbackVenue?.name.trim() || "nearby venue";
}

function buildNearbyVenueCards(
  nearbyVenues: RuntimeVenueCandidate[],
  currentVenueName: string,
) {
  const alternatives = nearbyVenues.filter((venue) => venue.name !== currentVenueName);
  const source = (alternatives.length ? alternatives : nearbyVenues).length
    ? (alternatives.length ? alternatives : nearbyVenues).slice(0, 2)
    : [{ id: "current", name: currentVenueName, venueType: "other" as const, distanceMeters: null, source: "google_places" as const, latitude: 0, longitude: 0, radiusMeters: 0 }];

  return source.map((venue, index) => {
    const venueType = venue.venueType ?? inferVenueTypeFromName(venue.name);
    const looksLikeCafe = venueType === "cafe";
    const looksLikeMarket = /market|hall/i.test(venue.name);
    const emoji = looksLikeCafe ? "☕" : looksLikeMarket ? "🏛️" : "📍";
    const seed = Math.abs(hashVenueName(venue.name));
    const peopleCount = 3 + (seed % 10);
    const placeholderProfile = buildVenuePlaceholderProfile(venueType, looksLikeMarket, seed);

    return {
      id: venue.id,
      venue,
      name: venue.name,
      venueType,
      emoji,
      illustration: getVenueIllustrationSource(venue.name, venueType),
      featured: index === 0,
      peopleCount,
      peopleText: `${peopleCount} people visible`,
      peopleColor: placeholderProfile.peopleColor,
      energyLabel: placeholderProfile.energyLabel,
      statusColor: placeholderProfile.statusColor,
      tags: placeholderProfile.tags,
      distanceLabel: venue.distanceMeters != null ? formatDistanceLabel(venue.distanceMeters) : "Nearby now",
    };
  });
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

function inferVenueTypeFromName(venueName: string) {
  const normalized = venueName.toLowerCase();
  if (/cafe|coffee|espresso|roastery/.test(normalized)) return "cafe" as const;
  if (/library|books|reading/.test(normalized)) return "library" as const;
  if (/cowork|co-working|workspace|office|studio|hub/.test(normalized)) return "coworking_space" as const;
  if (/university|campus|college/.test(normalized)) return "university" as const;
  return "other" as const;
}

function hashVenueName(value: string) {
  return value.split("").reduce((total, char) => total * 31 + char.charCodeAt(0), 7);
}

function buildVenuePlaceholderProfile(
  venueType: RuntimeVenueCandidate["venueType"] | undefined,
  looksLikeMarket: boolean,
  seed: number,
) {
  const tags = buildVenueTags(venueType, looksLikeMarket, seed);

  if (venueType === "cafe") {
    return {
      energyLabel: "Warm",
      statusColor: "#D89A2B",
      peopleColor: "#35664D",
      tags,
    };
  }
  if (venueType === "library") {
    return {
      energyLabel: "Calm",
      statusColor: "#7A8A76",
      peopleColor: "#4D8164",
      tags,
    };
  }
  if (venueType === "coworking_space") {
    return {
      energyLabel: "Focused",
      statusColor: "#4D8164",
      peopleColor: "#35664D",
      tags,
    };
  }
  if (venueType === "university") {
    return {
      energyLabel: "Active",
      statusColor: "#FF6B4A",
      peopleColor: "#FF6B4A",
      tags,
    };
  }
  if (looksLikeMarket) {
    return {
      energyLabel: "Busy",
      statusColor: "#FF6B4A",
      peopleColor: "#D89A2B",
      tags,
    };
  }

  const fallbackProfiles = [
    { energyLabel: "Warm", statusColor: "#D89A2B", peopleColor: "#35664D" },
    { energyLabel: "Calm", statusColor: "#7A8A76", peopleColor: "#4D8164" },
    { energyLabel: "Active", statusColor: "#FF6B4A", peopleColor: "#FF6B4A" },
  ] as const;
  const fallbackProfile = fallbackProfiles[seed % fallbackProfiles.length];
  return {
    ...fallbackProfile,
    tags,
  };
}

function buildVenueTags(
  venueType: RuntimeVenueCandidate["venueType"] | undefined,
  looksLikeMarket: boolean,
  seed: number,
) {
  if (venueType === "cafe") {
    return [
      { label: "Networking", tint: "#E7EEDF" },
      { label: "Coffee", tint: "#F4E9D5" },
    ];
  }
  if (venueType === "library") {
    return [
      { label: "Study", tint: "#E7EEDF" },
      { label: "Quiet", tint: "#F4E9D5" },
    ];
  }
  if (venueType === "coworking_space") {
    return [
      { label: "Focus", tint: "#E9ECCE" },
      { label: "Builders", tint: "#F5EAD8" },
    ];
  }
  if (venueType === "university") {
    return [
      { label: "Campus", tint: "#E7EEDF" },
      { label: "Conversation", tint: "#F8E1D9" },
    ];
  }
  if (looksLikeMarket) {
    return [
      { label: "Browsing", tint: "#E9ECCE" },
      { label: "Shopping", tint: "#F5EAD8" },
    ];
  }

  const variants = [
    [
      { label: "Chill", tint: "#E9ECCE" },
      { label: "Drinks", tint: "#F4E9D5" },
      { label: "Music", tint: "#F8E1D9" },
    ],
    [
      { label: "Design", tint: "#E7EEDF" },
      { label: "Coffee", tint: "#F4E9D5" },
    ],
  ] as const;

  return variants[seed % variants.length];
}

function formatDistanceLabel(distanceMeters: number) {
  if (distanceMeters < 1000) return `${Math.round(distanceMeters)} m away`;
  const minutes = Math.max(1, Math.round(distanceMeters / 80));
  return `${minutes} min walk`;
}
