import { useEffect, useRef, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { AccessibilityInfo, ActivityIndicator, Animated, Easing, Image, Pressable, Text, View } from "react-native";
import type { RuntimeVenueCandidate } from "../../features/location/location-storage";
import {
  getVenueConfidenceLabel,
  resolveVenueConfidence,
} from "../../features/location/venue-confidence";
import { styles, T } from "../../app/leftTheme";
import { LeftIcon } from "../../components/icons";
import { GlassSurface, glassRadii } from "../../components/glass";
import { LeftLogoMark } from "../../components/left/LeftLogoMark";
import { VenueIdentityBlock } from "../../components/left/ui";
import type { VenueActivityEnvelope, VenueContextSummary } from "../../types/left-domain";
import { getNearbyPeopleCount } from "./home-presence";

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
  onOpenAllVenues,
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
  onOpenAllVenues: () => void;
  onOpenVenueDetail: (venue: RuntimeVenueCandidate) => void;
  onOpenSafety: () => void;
}) {
  const venueName = resolveVenueName(venue.venueName, nearbyVenues);
  const currentVenueCandidate =
    nearbyVenues.find((candidate) => candidate.id === venue.venueId) ??
    nearbyVenues.find((candidate) => candidate.name === venueName) ??
    null;
  const isVisible = sessionVisible && !venueHidden;
  const [reduceMotion, setReduceMotion] = useState(false);
  const greetingHeartbeat = useRef(new Animated.Value(0)).current;
  const venueConfidence = resolveVenueConfidence(venue, nearbyVenues);
  const nearbyCards = buildNearbyVenueCards(nearbyVenues, venueName, venueActivityById);
  const heroVenueType = nearbyVenues[0]?.venueType ?? inferVenueTypeFromName(venueName);
  const heroIllustration = getVenueIllustrationSource(venueName, heroVenueType);
  const confidenceLabel = getVenueConfidenceLabel(venueConfidence);
  const venueDistanceLabel = currentVenueCandidate?.distanceMeters != null
    ? formatDistanceLabel(currentVenueCandidate.distanceMeters)
    : nearbyCards[0]?.distanceLabel ?? "Nearby now";
  const placesContext =
    nearbyCards.length === 0
      ? "No nearby places detected yet"
      : venueConfidence === "confirmed"
      ? nearbyCards[0]?.distanceLabel
        ? `Closest ${nearbyCards[0].distanceLabel}`
        : "Nearby right now"
      : venueConfidence === "nearby_guess"
        ? "Likely places around you"
        : "Venue confirmation may be needed";
  const hiddenCardHasError = activationError || venueConfidence === "needs_confirmation";
  const hiddenMessage = hiddenCardHasError
    ? "We couldn't confirm this venue yet. Check your current venue before going visible."
    : "You're currently not visible to others here.";
  const presenceMessage = isVisible ? "You’re checked in here" : hiddenMessage;
  const primaryLabel = isVisible ? "Manage visibility" : activationSubmitting ? "Going visible..." : "Go visible";
  const reportedVisibleCount =
    venueActivityById[venue.venueId]?.leftPresence.visible ??
    venueActivityById[currentVenueCandidate?.id ?? ""]?.leftPresence.visible ??
    0;
  const peopleNearbyCount = getNearbyPeopleCount(reportedVisibleCount, isVisible);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!isVisible || reduceMotion) {
      greetingHeartbeat.stopAnimation();
      greetingHeartbeat.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(greetingHeartbeat, {
          toValue: 1,
          duration: 120,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(greetingHeartbeat, {
          toValue: 0,
          duration: 130,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(90),
        Animated.timing(greetingHeartbeat, {
          toValue: 0.72,
          duration: 110,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(greetingHeartbeat, {
          toValue: 0,
          duration: 170,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(900),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [greetingHeartbeat, isVisible, reduceMotion]);

  const greetingHeartbeatStyle = {
    transform: [
      {
        scale: greetingHeartbeat.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.22],
        }),
      },
    ],
    opacity: greetingHeartbeat.interpolate({
      inputRange: [0, 1],
      outputRange: [0.82, 1],
    }),
  };

  return (
    <View style={styles.homePage}>
      <View style={styles.homeVenueHeader}>
        <VenueIdentityBlock
          icon="map-pin"
          title={venueName}
          metaIcon="radio"
          metaText={`${confidenceLabel} · ${venueDistanceLabel}`}
        />
        <View style={styles.homeBrandLockup}>
          <View style={styles.homeBrandMark}>
            <LeftLogoMark size={24} tone="light" />
            <PresencePulseIndicator isVisible={isVisible} />
          </View>
          <Text style={styles.homeBrandLabel}>Left</Text>
        </View>
      </View>

      <View style={styles.homeHeroHeading}>
        <View style={styles.homeGreetingInline}>
          <Text style={styles.homeGreetingInlineName}>{`Hey ${firstName}!`}</Text>
          <Animated.View
            accessible
            accessibilityLabel={isVisible ? "Presence live" : "Presence hidden"}
            style={[styles.homeGreetingActivityIcon, greetingHeartbeatStyle]}
          >
            <LeftIcon name="activity" size={18} color={isVisible ? T.visibilityOn : T.venueAccent} />
          </Animated.View>
        </View>
        <Text style={styles.homeHeroTitleAccent}>{"Ready to\nconnect nearby?"}</Text>
        <Text style={styles.homeHeroSupportText}>Real people. Real places. Right now.</Text>
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
            colors={[T.surfaceDim, T.surface, T.primarySoft]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.homeHeroVenueArtStacked}
          >
            <Image source={heroIllustration} style={styles.homeVenueIllustrationImage} resizeMode="cover" />
            <LinearGradient
              colors={["rgba(255,247,235,0.34)", "rgba(255,247,235,0.08)", "transparent"]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.homeHeroVenueArtShade}
            />
            <GlassSurface
              variant="soft"
              radius={glassRadii.pill}
              style={styles.homeHeroImageStatusGlass}
              contentStyle={styles.homeHeroImageStatusPill}
            >
              <LeftIcon
                name={isVisible ? "eye" : "eye-off"}
                size={12}
                color={hiddenCardHasError ? T.danger : isVisible ? T.visibilityOn : T.visibilityOff}
                active={isVisible}
              />
              <Text style={styles.homeHeroImageStatusText}>{isVisible ? "VISIBLE" : "HIDDEN"}</Text>
            </GlassSurface>
            {isVisible && peopleNearbyCount > 0 ? (
              <GlassSurface
                variant="soft"
                radius={glassRadii.pill}
                style={styles.homeHeroPeopleGlass}
                contentStyle={styles.homeHeroPeopleOverlay}
              >
                  <View style={styles.homeHeroAvatarStack}>
                    <View style={[styles.homeHeroAvatarBubble, styles.homeHeroAvatarCountBubble]}>
                      <Text style={styles.homeHeroAvatarCountText}>{peopleNearbyCount}</Text>
                    </View>
                  </View>
                  <Text style={styles.homeHeroPeopleOverlayText}>
                    {peopleNearbyCount === 1 ? "Person nearby" : "People nearby"}
                  </Text>
              </GlassSurface>
            ) : null}
          </LinearGradient>
          <View style={styles.homeHeroVisibleInfoRow}>
            <View style={styles.homeHeroVisibleInfoCopy}>
              <Text style={styles.homeHeroVenueNameVisible} numberOfLines={2} ellipsizeMode="tail">
                {venueName}
              </Text>
              <View style={styles.homeHeroStatusLine}>
                <View
                  style={[
                    styles.homeHeroPresenceEyebrowDot,
                    !isVisible && styles.homeHeroPresenceEyebrowDotHidden,
                    hiddenCardHasError && styles.homeHeroPresenceEyebrowDotError,
                  ]}
                />
                <Text
                  style={[
                    styles.homeHeroStatusLineText,
                    hiddenCardHasError && styles.homeHeroPresenceEyebrowError,
                  ]}
                >
                  {isVisible ? "Visible to people here" : "Hidden from others"}
                </Text>
              </View>
              <Text style={styles.homeHeroCardCopyVisible}>{presenceMessage}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={primaryLabel}
              accessibilityHint={hiddenCardHasError ? "Resolve the venue issue before becoming visible." : "Open venue visibility controls."}
              accessibilityState={{ disabled: (!isVisible && hiddenCardHasError) || activationSubmitting, busy: activationSubmitting }}
              disabled={(!isVisible && hiddenCardHasError) || activationSubmitting}
              onPress={onBecomeVisible}
              style={({ pressed }) => [
                styles.homeVisibleHeroButtonInline,
                !isVisible && styles.homeVisibleHeroButtonInlineHidden,
                hiddenCardHasError && styles.homeVisibleHeroButtonInlineError,
                pressed && !activationSubmitting && !(!isVisible && hiddenCardHasError) && styles.iconButtonPressed,
              ]}
            >
              {activationSubmitting ? (
                <ActivityIndicator size="small" color={hiddenCardHasError ? T.textPrimary : T.actionContent} />
              ) : (
                <View style={styles.homeVisibleHeroButtonMark}>
                  <LeftIcon
                    name={isVisible ? "eye-off" : "eye"}
                    size={17}
                    color={hiddenCardHasError ? T.textPrimary : T.actionContent}
                  />
                </View>
              )}
              <Text
                style={[
                  styles.homeVisibleHeroButtonTextInline,
                  hiddenCardHasError && styles.homeVisibleHeroButtonTextInlineError,
                ]}
              >
                {primaryLabel}
              </Text>
            </Pressable>
          </View>
          <View style={styles.homeHeroVisibleDivider} />
          <Pressable
            onPress={onOpenSafety}
            accessibilityRole="button"
            accessibilityLabel={isVisible ? "Visibility controls" : "Private mode"}
            accessibilityHint="Open privacy and visibility controls."
            style={({ pressed }) => [
              styles.homeHeroPrivacyRowVisible,
              pressed && styles.iconButtonPressed,
            ]}
          >
            <View style={styles.homeHeroPrivacyIconWrapVisible}>
              <LeftIcon name={isVisible ? "eye" : "lock"} size={18} color={T.textSecondary} active={isVisible} />
            </View>
            <View style={styles.homeHeroPrivacyCopyVisible}>
              <Text style={styles.homeHeroPrivacyLabelVisible}>{isVisible ? "Visibility controls" : "Private mode"}</Text>
              <Text style={styles.homeHeroPrivacyTextVisible}>
                {isVisible ? "Manage how people discover you here." : "Only you control your presence."}
              </Text>
            </View>
            <LeftIcon name="chevron-right" size={18} color={T.textPrimary} />
          </Pressable>
        </View>
      </View>

      <View style={styles.homeExploreHeader}>
        <View style={styles.homeExploreHeaderCopy}>
          <Text style={styles.homeExploreTitle}>Places around you</Text>
          <Text style={styles.homeExploreMeta}>{placesContext}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="See all nearby venues"
          onPress={onOpenAllVenues}
          hitSlop={10}
          style={({ pressed }) => pressed && styles.iconButtonPressed}
        >
          <Text style={styles.homeExploreSideNote}>See all →</Text>
        </Pressable>
      </View>

      <View style={[styles.homeVenueGrid, nearbyCards.length === 1 && styles.homeVenueGridSingle]}>
        {nearbyCards.length === 0 ? (
          <View accessibilityRole="text" style={styles.homeVenueEmptyState}>
            <LeftIcon name="map-pin" size={21} color={T.textMuted} />
            <Text style={styles.homeVenueEmptyTitle}>No live venue data yet</Text>
            <Text style={styles.homeVenueEmptyBody}>
              Keep location access on. Places detected near you will appear here.
            </Text>
          </View>
        ) : null}
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
                colors={item.featured ? [T.primarySoft, T.surface, T.surfaceDim] : [T.surfaceDim, T.surface, T.primarySoft]}
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
                    <Text style={[styles.homeVenueStatusText, { color: item.signalBarColor }]}>{item.energyLabel}</Text>
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
                      <LeftIcon name="users" size={15} color={item.signalBarColor} />
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
                  <LeftIcon name="map-pin" size={15} color={T.textMuted} />
                  <Text style={styles.homeVenueDistanceText}>{item.distanceLabel}</Text>
                </View>
              </View>
              <View style={styles.homeVenueChevronBubble}>
                <LeftIcon name="chevron-right" size={22} color={T.secondary} />
              </View>
            </View>
          </Pressable>
        ))}
      </View>

      <Pressable onPress={onOpenSafety} style={({ pressed }) => [styles.homeSafetyCard, pressed && styles.iconButtonPressed]}>
        <View style={styles.homeSafetyCardLeft}>
          <View style={styles.homeSafetyCardIconWrap}>
            <LeftIcon name="shield" size={20} color={T.primary} />
          </View>
          <View style={styles.homeSafetyCardCopy}>
            <Text style={styles.homeSafetyCardTitle}>Safety controls</Text>
            <Text style={styles.homeSafetyCardSubtitle}>Control how you are discovered.</Text>
          </View>
        </View>
        <LeftIcon name="chevron-right" size={22} color={T.textSecondary} />
      </Pressable>
    </View>
  );
}

function PresencePulseIndicator({ isVisible }: { isVisible: boolean }) {
  const pulse = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!isVisible || reduceMotion) {
      pulse.stopAnimation();
      pulse.setValue(0);
      return;
    }

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
  }, [isVisible, pulse, reduceMotion]);

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
  const source = (alternatives.length ? alternatives : nearbyVenues).slice(0, 2);

  return source.map((venue, index) => {
    const venueType = venue.venueType ?? inferVenueTypeFromName(venue.name);
    const activity = venueActivityById[venue.id] ?? null;
    const signalColor = activity
      ? getActivitySignalColor(activity.activity.displayText, activity.activity.score, T.textMuted)
      : T.textMuted;

    return {
      id: venue.id,
      venue,
      name: venue.name,
      venueType,
      illustration: getVenueIllustrationSource(venue.name, venueType),
      featured: index === 0,
      peopleColor: T.textMuted,
      energyLabel: activity ? activity.activity.displayText : "Live activity unavailable",
      signalBars: activity?.activity.score != null ? getSignalBarsForScore(activity.activity.score) : null,
      signalBarColor: signalColor,
      statusColor: signalColor,
      tags: [],
      distanceLabel: venue.distanceMeters != null ? formatDistanceLabel(venue.distanceMeters) : "Distance unavailable",
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

function getSignalBarsForScore(score: number) {
  const activeCount =
    score <= 20 ? 1 :
    score <= 40 ? 2 :
    score <= 60 ? 3 :
    score <= 80 ? 4 : 5;
  return Array.from({ length: 5 }, (_, index) => index < activeCount);
}

function getActivitySignalColor(label: string, score: number | null | undefined, fallback: string) {
  const normalizedLabel = label.toLowerCase();
  if (/busy|lively|high/.test(normalizedLabel)) return T.visibilityOff;
  if (/active|steady|warm/.test(normalizedLabel)) return T.visibilityOn;
  if (/quiet|calm|low/.test(normalizedLabel)) return T.textMuted;
  if (score == null) return fallback;
  if (score > 70) return T.visibilityOff;
  if (score > 30) return T.visibilityOn;
  return T.textMuted;
}

function getCompactSignalBarHeightStyle(index: number) {
  const heights = [8, 11, 14, 17, 20];
  return {
    height: heights[index] ?? heights[heights.length - 1],
  };
}

function formatDistanceLabel(distanceMeters: number) {
  if (distanceMeters < 1000) return `${Math.round(distanceMeters)} m away`;
  const minutes = Math.max(1, Math.round(distanceMeters / 80));
  return `${minutes} min walk`;
}
