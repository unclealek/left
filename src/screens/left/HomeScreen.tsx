import { useEffect, useRef } from "react";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator, Animated, Easing, Image, Pressable, Text, View } from "react-native";
import type { RuntimeVenueCandidate } from "../../features/location/location-storage";
import {
  getVenueConfidenceCopy,
  getVenueConfidenceLabel,
  resolveVenueConfidence,
} from "../../features/location/venue-confidence";
import { styles, T } from "../../app/leftTheme";
import { LeftDoorwayMark } from "../../components/left/LeftDoorwayMark";
import { VenueIdentityBlock } from "../../components/left/ui";
import type { VenueActivityEnvelope, VenueContextSummary } from "../../types/left-domain";

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
  venueActivityById,
  sessionVisible,
  venueHidden,
  activationSubmitting = false,
  activationError = false,
  onBecomeVisible,
  onOpenVenueDetail,
  onOpenSafety,
}: {
  firstName: string;
  venue: VenueContextSummary;
  nearbyVenues: RuntimeVenueCandidate[];
  venueActivityById: Record<string, VenueActivityEnvelope>;
  sessionVisible: boolean;
  venueHidden: boolean;
  activationSubmitting?: boolean;
  activationError?: boolean;
  onBecomeVisible: () => void;
  onOpenVenueDetail: (venue: RuntimeVenueCandidate) => void;
  onOpenSafety: () => void;
  onComingSoon: (label: string) => void;
}) {
  const venueName = resolveVenueName(venue.venueName, nearbyVenues);
  const isVisible = sessionVisible && !venueHidden;
  const venueConfidence = resolveVenueConfidence(venue, nearbyVenues);
  const nearbyCards = buildNearbyVenueCards(nearbyVenues, venueName, venueActivityById);
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
  const hiddenCardHasError = activationError || venueConfidence === "needs_confirmation";
  const hiddenMessage = hiddenCardHasError
    ? "We couldn't confirm this venue yet. Check your current venue before going visible."
    : "You're currently hidden from people here.";
  const presenceStatusLabel = isVisible ? "YOU’RE HERE" : hiddenCardHasError ? "NEEDS ATTENTION" : "HIDDEN";
  const presenceMessage = isVisible ? "You’re checked in here" : hiddenMessage;
  const presencePrivacyLabel = isVisible ? "Visible now" : "Private by default";
  const presencePrivacyAction = isVisible ? "Manage privacy" : "Go visible";
  const primaryLabel = isVisible ? "Manage\nvisibility" : activationSubmitting ? "Becoming\nvisible..." : "Become\nvisible";

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

      <View
        style={[
          styles.homeHeroCardV2,
          styles.homeHeroCardV2Unified,
          isVisible ? styles.homeHeroCardV2Visible : styles.homeHeroCardV2Hidden,
          hiddenCardHasError && styles.homeHeroCardV2Error,
        ]}
      >
        <View style={styles.homeHeroVisibleShell}>
          <LinearGradient
            colors={["#FFF4D8", "#FFF8EE", "#E9ECCE"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.homeHeroVenueArtStacked}
          >
            <Image source={heroIllustration} style={styles.homeVenueIllustrationImage} resizeMode="cover" />
          </LinearGradient>
          <View style={styles.homeHeroVisibleInfoRow}>
            <View style={styles.homeHeroVisibleInfoCopy}>
              <View style={styles.homeHeroPresenceEyebrowRow}>
                <View
                  style={[
                    styles.homeHeroPresenceEyebrowDot,
                    !isVisible && styles.homeHeroPresenceEyebrowDotHidden,
                    hiddenCardHasError && styles.homeHeroPresenceEyebrowDotError,
                  ]}
                />
                <Text
                  style={[
                    styles.homeHeroPresenceEyebrow,
                    !isVisible && styles.homeHeroPresenceEyebrowHidden,
                    hiddenCardHasError && styles.homeHeroPresenceEyebrowError,
                  ]}
                >
                  {presenceStatusLabel}
                </Text>
              </View>
              <Text style={styles.homeHeroVenueNameVisible} numberOfLines={2} ellipsizeMode="tail">
                {venueName}
              </Text>
              <Text style={styles.homeHeroCardCopyVisible}>{presenceMessage}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isVisible ? "Manage visibility" : activationSubmitting ? "Becoming visible" : "Become visible"}
              accessibilityHint={hiddenCardHasError ? "Resolve the venue issue before becoming visible." : "Open venue visibility controls."}
              accessibilityState={{ disabled: (!isVisible && hiddenCardHasError) || activationSubmitting, busy: activationSubmitting }}
              disabled={(!isVisible && hiddenCardHasError) || activationSubmitting}
              onPress={onBecomeVisible}
              style={({ pressed }) => [
                styles.homeVisibleHeroButtonInline,
                !isVisible && styles.homeVisibleHeroButtonInlineHidden,
                hiddenCardHasError && styles.homeVisibleHeroButtonInlineError,
                pressed && !activationSubmitting && !( !isVisible && hiddenCardHasError) && styles.iconButtonPressed,
              ]}
            >
              {activationSubmitting ? (
                <ActivityIndicator size="small" color={isVisible ? T.white : "#245C4A"} />
              ) : (
                <View style={styles.homeVisibleHeroButtonMark}>
                  <LeftDoorwayMark
                    size={20}
                    archColor={isVisible ? "#F5BC4C" : "#245C4A"}
                    innerColor={isVisible ? "#FFE3A0" : "#F3D88E"}
                    baseColor={isVisible ? "#FFE3A0" : "#F3D88E"}
                    baseScale={0.54}
                  />
                </View>
              )}
              <Text style={[styles.homeVisibleHeroButtonTextInline, !isVisible && styles.homeVisibleHeroButtonTextInlineHidden]}>
                {primaryLabel}
              </Text>
            </Pressable>
          </View>
          <View style={styles.homeHeroVisibleDivider} />
          <Pressable
            onPress={onOpenSafety}
            accessibilityRole="button"
            accessibilityLabel={presencePrivacyLabel}
            accessibilityHint="Open privacy and visibility controls."
            style={({ pressed }) => [
              styles.homeHeroPrivacyRowVisible,
              pressed && styles.iconButtonPressed,
            ]}
          >
            <View style={styles.homeHeroPrivacyIconWrapVisible}>
              <Feather name="lock" size={18} color={"#59675F"} />
            </View>
            <View style={styles.homeHeroPrivacyCopyVisible}>
              <Text style={styles.homeHeroPrivacyTextVisible}>
                {presencePrivacyLabel} <Text style={styles.homeHeroPrivacySeparator}>·</Text>{" "}
                <Text style={styles.homeHeroPrivacyHighlightVisible}>{presencePrivacyAction}</Text>
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={"#245842"} />
          </Pressable>
        </View>
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
                    <Text style={styles.homeVenueStatusText}>{item.energyLabel}</Text>
                  </View>
                </View>
                {item.signalBars ? (
                  <View
                    style={[
                      styles.homeVenuePeopleRow,
                      { backgroundColor: `${item.signalBarColor}12`, borderColor: `${item.signalBarColor}26` },
                    ]}
                  >
                    <View style={styles.homeVenueSignalIconWrap}>
                      <Feather name="users" size={15} color={item.signalBarColor} />
                    </View>
                    <View style={styles.homeVenueSignalBars}>
                      {item.signalBars.map((active, index) => (
                        <View
                          key={`${item.id}-signal-${index}`}
                          style={[
                            styles.homeVenueSignalBar,
                            getCompactSignalBarHeightStyle(index),
                            active
                              ? [styles.homeVenueSignalBarActive, { backgroundColor: item.signalBarColor, borderColor: item.signalBarColor }]
                              : [styles.homeVenueSignalBarInactive, { borderColor: `${item.signalBarColor}44` }],
                          ]}
                        />
                      ))}
                    </View>
                  </View>
                ) : null}
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
  venueActivityById: Record<string, VenueActivityEnvelope>,
) {
  const alternatives = nearbyVenues.filter((venue) => venue.name !== currentVenueName);
  const source = (alternatives.length ? alternatives : nearbyVenues).length
    ? (alternatives.length ? alternatives : nearbyVenues).slice(0, 2)
    : [{ id: "current", name: currentVenueName, venueType: "other" as const, distanceMeters: null, source: "google_places" as const, latitude: 0, longitude: 0, radiusMeters: 0 }];

  return source.map((venue, index) => {
    const venueType = venue.venueType ?? inferVenueTypeFromName(venue.name);
    const looksLikeCafe = venueType === "cafe";
    const looksLikeMarket = /market|hall/i.test(venue.name);
    const seed = Math.abs(hashVenueName(venue.name));
    const peopleCount = 3 + (seed % 10);
    const placeholderProfile = buildVenuePlaceholderProfile(venueType, looksLikeMarket, seed);
    const activity = venueActivityById[venue.id] ?? null;

    return {
      id: venue.id,
      venue,
      name: venue.name,
      venueType,
      illustration: getVenueIllustrationSource(venue.name, venueType),
      featured: index === 0,
      peopleCount,
      peopleText: activity ? `${activity.leftPresence.visible} on Left` : `${peopleCount} people visible`,
      peopleColor: placeholderProfile.peopleColor,
      energyLabel: activity ? activity.activity.displayText : placeholderProfile.energyLabel,
      signalBars: activity?.activity.score != null ? getSignalBarsForScore(activity.activity.score) : null,
      signalBarColor: activity?.activity.score != null ? getSignalBarColorForScore(activity.activity.score) : placeholderProfile.statusColor,
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

function getSignalBarsForScore(score: number) {
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

function getCompactSignalBarHeightStyle(index: number) {
  const heights = [8, 11, 14, 17, 20];
  return {
    height: heights[index] ?? heights[heights.length - 1],
  };
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
