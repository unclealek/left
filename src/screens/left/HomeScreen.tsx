import { useEffect, useRef, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { AccessibilityInfo, ActivityIndicator, Animated, Easing, Image, Linking, Pressable, Text, View } from "react-native";
import type { RuntimeVenueCandidate } from "../../features/location/location-storage";
import {
  getVenueConfidenceLabel,
  resolveVenueConfidence,
} from "../../features/location/venue-confidence";
import { formatIntent, formatRemaining } from "../../app/leftConfig";
import { styles, T } from "../../app/leftTheme";
import { LeftIcon } from "../../components/icons";
import { GlassSurface, glassRadii } from "../../components/glass";
import { LeftAvatar } from "../../components/left/LeftAvatar";
import { LeftLogoMark } from "../../components/left/LeftLogoMark";
import { VenueIdentityBlock } from "../../components/left/ui";
import type { AppUser, NearbyFeedItem, VenueActivityEnvelope, VenueContextSummary, VenueExperience } from "../../types/left-domain";
import { fetchVenuePracticalDetails } from "../../features/venues/venue-details-service";
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
  experiences,
  feed,
  intent,
  vibes,
  sessionVisible,
  venueHidden,
  activationSubmitting = false,
  activationError = false,
  onBecomeVisible,
  onOpenAllVenues,
  onOpenVenueDetail,
  onOpenProfile,
  onOpenExperience,
  onCreateExperience,
  onOpenSafety,
}: {
  firstName: string;
  venue: VenueContextSummary;
  nearbyVenues: RuntimeVenueCandidate[];
  venueActivityById: Record<string, VenueActivityEnvelope>;
  experiences: VenueExperience[];
  feed: NearbyFeedItem[];
  intent: AppUser["defaultIntent"];
  vibes: string[];
  sessionVisible: boolean;
  venueHidden: boolean;
  activationSubmitting?: boolean;
  activationError?: boolean;
  onBecomeVisible: () => void;
  onOpenAllVenues: () => void;
  onOpenVenueDetail: (venue: RuntimeVenueCandidate) => void;
  onOpenProfile: (item: NearbyFeedItem) => void;
  onOpenExperience: (experience: VenueExperience) => void;
  onCreateExperience: () => void;
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
  const photoVenueIds = JSON.stringify(nearbyCards.map((card) => card.id));
  const [photos, setPhotos] = useState<Record<string, NonNullable<RuntimeVenueCandidate["photo"]>>>({});
  const [loadedPhotos, setLoadedPhotos] = useState<Record<string, string>>({});
  const [failedPhotos, setFailedPhotos] = useState<Record<string, string>>({});
  useEffect(() => {
    let cancelled = false;
    setPhotos({});
    setLoadedPhotos({});
    setFailedPhotos({});
    void Promise.all((JSON.parse(photoVenueIds) as string[]).map(async (id) => {
      try {
        const details = await fetchVenuePracticalDetails(id);
        if (!cancelled && details?.photo) {
          const photo = details.photo;
          setPhotos((current) => ({ ...current, [id]: photo }));
        }
      } catch { /* Keep the illustration when photos are unavailable. */ }
    }));
    return () => { cancelled = true; };
  }, [photoVenueIds]);
  const photoImage = (id: string) => {
    const photo = photos[id];
    return photo && failedPhotos[id] !== photo.uri ? (
      <Image source={{ uri: photo.uri }} resizeMode="cover"
        style={{ position: "absolute", inset: 0 }}
        onLoad={() => setLoadedPhotos((current) => ({ ...current, [id]: photo.uri }))}
        onError={() => {
          setFailedPhotos((current) => ({ ...current, [id]: photo.uri }));
          setLoadedPhotos((current) => ({ ...current, [id]: "" }));
        }} />
    ) : null;
  };
  const photoCredit = (id: string) => {
    const photo = photos[id];
    if (!photo || loadedPhotos[id] !== photo.uri) return null;
    return (
      <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", paddingHorizontal: 16, paddingVertical: 8, gap: 6 }}>
        <Text numberOfLines={1} style={{ fontSize: 12, color: "#5E5E5E" }}>Google Maps</Text>
        {photo.attributions.map((author, index) => author.uri ? (
          <Pressable key={index} accessibilityRole="link" accessibilityLabel={`Photo by ${author.displayName}`}
            style={{ minHeight: 44, justifyContent: "center", flexShrink: 1 }}
            onPress={(event) => { event.stopPropagation(); void Linking.openURL(author.uri!).catch(() => {}); }}>
            <Text style={{ fontSize: 12, color: "#5E5E5E" }}>· {author.displayName}</Text>
          </Pressable>
        ) : <Text key={index} style={{ fontSize: 12, color: "#5E5E5E" }}>· {author.displayName}</Text>)}
      </View>
    );
  };
  const featuredPlace = nearbyCards[0] ?? null;
  const morePlaces = nearbyCards.slice(1);
  const featuredPerson = isVisible ? feed[0] ?? null : null;
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
    ? "We couldn't confirm this place yet. Check your current place before becoming visible."
    : "You're private until you choose to be discovered.";
  const presenceMessage = isVisible ? "You’re sharing this moment here." : hiddenMessage;
  const primaryLabel = isVisible ? "Manage visibility" : activationSubmitting ? "Going visible..." : "Go visible";
  const reportedVisibleCount =
    venueActivityById[venue.venueId]?.leftPresence.visible ??
    venueActivityById[currentVenueCandidate?.id ?? ""]?.leftPresence.visible ??
    0;
  const peopleNearbyCount = getNearbyPeopleCount(reportedVisibleCount, isVisible);
  const discoveryContext = buildDiscoveryContext(venueName, intent, vibes);

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

      <View style={styles.homeEditorialIntro}>
        <Text style={styles.homeEditorialEyebrow}>{`FOR ${firstName.toUpperCase()} · RIGHT NOW`}</Text>
        <View style={styles.homeGreetingInline}>
          <Text style={styles.homeEditorialTitle}>{"See what’s worth\nstepping into."}</Text>
          <Animated.View
            accessible
            accessibilityLabel={isVisible ? "Presence live" : "Presence hidden"}
            style={[styles.homeGreetingActivityIcon, greetingHeartbeatStyle]}
          >
            <LeftIcon name="activity" size={18} color={isVisible ? T.visibilityOn : T.venueAccent} />
          </Animated.View>
        </View>
        <Text style={styles.homeEditorialSupport}>{discoveryContext}</Text>
      </View>

      <View
        style={[
          styles.homePresenceCard,
          hiddenCardHasError && styles.homePresenceCardError,
        ]}
      >
        <View style={styles.homePresencePrimaryRow}>
          <View style={styles.homePresenceCopy}>
            <View style={styles.homePresenceStateRow}>
              <View
                style={[
                  styles.homePresenceStateDot,
                  !isVisible && styles.homePresenceStateDotHidden,
                  hiddenCardHasError && styles.homePresenceStateDotError,
                ]}
              />
              <Text style={styles.homePresenceStateLabel}>
                {isVisible ? "VISIBLE HERE" : "PRIVATE HERE"}
              </Text>
            </View>
            <Text numberOfLines={1} style={styles.homePresenceVenue}>{venueName}</Text>
            <Text style={styles.homePresenceMessage}>{presenceMessage}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={primaryLabel}
            accessibilityHint={hiddenCardHasError ? "Resolve the venue issue before becoming visible." : "Open venue visibility controls."}
            accessibilityState={{ disabled: (!isVisible && hiddenCardHasError) || activationSubmitting, busy: activationSubmitting }}
            disabled={(!isVisible && hiddenCardHasError) || activationSubmitting}
            onPress={onBecomeVisible}
            style={({ pressed }) => [
              styles.homePresenceAction,
              hiddenCardHasError && styles.homePresenceActionError,
              pressed && !activationSubmitting && !hiddenCardHasError && styles.iconButtonPressed,
            ]}
          >
            {activationSubmitting ? (
              <ActivityIndicator size="small" color={hiddenCardHasError ? T.danger : T.actionContent} />
            ) : (
              <LeftIcon
                name={isVisible ? "eye-off" : "eye"}
                size={18}
                color={hiddenCardHasError ? T.danger : T.actionContent}
              />
            )}
            <Text style={[styles.homePresenceActionText, hiddenCardHasError && styles.homePresenceActionTextError]}>
              {isVisible ? "Manage" : "Go visible"}
            </Text>
          </Pressable>
        </View>
        <Pressable
          onPress={onOpenSafety}
          accessibilityRole="button"
          accessibilityLabel="Open privacy and safety controls"
          style={({ pressed }) => [styles.homePresencePrivacyRow, pressed && styles.iconButtonPressed]}
        >
          <LeftIcon name="shield" size={15} color={T.primary} />
          <Text style={styles.homePresencePrivacyText}>Privacy and safety controls</Text>
          <LeftIcon name="chevron-right" size={16} color={T.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.homeEditorialSection}>
        <View style={styles.homeEditorialSectionHeader}>
          <View style={styles.homeEditorialSectionCopy}>
            <Text style={styles.homeEditorialSectionEyebrow}>ONE PLACE TO NOTICE</Text>
            <Text style={styles.homeEditorialSectionTitle}>Around you now</Text>
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

        {featuredPlace ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open ${featuredPlace.name}`}
            onPress={() => onOpenVenueDetail(featuredPlace.venue)}
            style={({ pressed }) => [styles.homeFeaturedPlaceCard, pressed && styles.homeFeaturedPlaceCardPressed]}
          >
            <View style={styles.homeFeaturedPlaceImageWrap}>
              <Image source={featuredPlace.illustration} style={styles.homeVenueIllustrationImage} resizeMode="cover" />
              {photoImage(featuredPlace.id)}
              <LinearGradient
                colors={["transparent", "rgba(26,24,21,0.28)"]}
                start={{ x: 0.5, y: 0.45 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.homeFeaturedPlaceShade}
              />
              <GlassSurface
                variant="soft"
                radius={glassRadii.pill}
                style={styles.homeFeaturedPlaceSignal}
                contentStyle={styles.homeFeaturedPlaceSignalContent}
              >
                <View style={[styles.homeFeaturedPlaceSignalDot, { backgroundColor: featuredPlace.signalBarColor }]} />
                <Text style={styles.homeFeaturedPlaceSignalText}>{featuredPlace.energyLabel}</Text>
              </GlassSurface>
            </View>
            {photoCredit(featuredPlace.id)}
            <View style={styles.homeFeaturedPlaceBody}>
              <View style={styles.homeFeaturedPlaceCopy}>
                <Text style={styles.homeFeaturedPlaceName}>{featuredPlace.name}</Text>
                <View style={styles.homeFeaturedPlaceMetaRow}>
                  <LeftIcon name="map-pin" size={14} color={T.primary} />
                  <Text style={styles.homeFeaturedPlaceMeta}>{featuredPlace.distanceLabel}</Text>
                </View>
              </View>
              <View style={styles.homeFeaturedPlaceArrow}>
                <LeftIcon name="arrow-up-right" size={19} color={T.actionContent} />
              </View>
            </View>
          </Pressable>
        ) : (
          <View accessibilityRole="text" style={styles.homeVenueEmptyState}>
            <LeftIcon name="map-pin" size={21} color={T.textMuted} />
            <Text style={styles.homeVenueEmptyTitle}>No live venue data yet</Text>
            <Text style={styles.homeVenueEmptyBody}>Keep location access on. Places detected near you will appear here.</Text>
          </View>
        )}
      </View>

      <View style={styles.homeEditorialSection}>
        <View style={styles.homeEditorialSectionHeader}>
          <View style={styles.homeEditorialSectionCopy}>
            <Text style={styles.homeEditorialSectionEyebrow}>PEOPLE, WITH PERMISSION</Text>
            <Text style={styles.homeEditorialSectionTitle}>
              {featuredPerson ? "Someone worth meeting" : isVisible ? "The room is still quiet" : "Meet when you’re ready"}
            </Text>
          </View>
          {isVisible && peopleNearbyCount > 0 ? (
            <Text style={styles.homePeopleCount}>{`${peopleNearbyCount} nearby`}</Text>
          ) : null}
        </View>

        {featuredPerson ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View ${featuredPerson.firstName}'s profile`}
            onPress={() => onOpenProfile(featuredPerson)}
            style={({ pressed }) => [styles.homePersonCard, pressed && styles.iconButtonPressed]}
          >
            <LeftAvatar name={featuredPerson.firstName} avatarStyle={featuredPerson.avatarStyle} />
            <View style={styles.homePersonCardCopy}>
              <View style={styles.homePersonNameRow}>
                <Text style={styles.homePersonName}>{featuredPerson.firstName}</Text>
                <Text style={styles.homePersonTime}>{formatRemaining(featuredPerson.sessionDurationRemaining)}</Text>
              </View>
              <Text style={styles.homePersonIntent}>{formatIntent(featuredPerson.intent)}</Text>
              <Text numberOfLines={2} style={styles.homePersonHint}>
                {featuredPerson.hintText ?? `Open to ${featuredPerson.primaryVibe?.toLowerCase() ?? "a meaningful conversation"}.`}
              </Text>
            </View>
            <View style={styles.homePersonArrow}>
              <LeftIcon name="chevron-right" size={18} color={T.textPrimary} />
            </View>
          </Pressable>
        ) : isVisible ? (
          <View style={styles.homePeopleEmptyCard}>
            <View style={styles.homePeopleEmptyIcon}>
              <LeftIcon name="users" size={20} color={T.primary} />
            </View>
            <View style={styles.homePeopleEmptyCopy}>
              <Text style={styles.homePeopleEmptyTitle}>You’re the first one here</Text>
              <Text style={styles.homePeopleEmptyText}>We’ll show someone only when they choose to be visible too.</Text>
            </View>
          </View>
        ) : (
          <View style={styles.homePeoplePrivateCard}>
            <View style={styles.homePeoplePrivateIcon}>
              <LeftIcon name="lock" size={20} color={T.primary} />
            </View>
            <View style={styles.homePeoplePrivateCopy}>
              <Text style={styles.homePeoplePrivateTitle}>No profiles are shown while you’re private</Text>
              <Text style={styles.homePeoplePrivateText}>Become visible when you want to see people who are open to meeting here.</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go visible"
              onPress={onBecomeVisible}
              style={({ pressed }) => [styles.homePeoplePrivateAction, pressed && styles.iconButtonPressed]}
            >
              <Text style={styles.homePeoplePrivateActionText}>Go visible</Text>
              <LeftIcon name="arrow-right" size={15} color={T.primary} />
            </Pressable>
          </View>
        )}
      </View>

      <View style={styles.homeEditorialSection}>
        <View style={styles.homeEditorialSectionHeader}>
          <View style={styles.homeEditorialSectionCopy}>
            <Text style={styles.homeEditorialSectionEyebrow}>SMALL, LOCAL, REVIEWED</Text>
            <Text style={styles.homeEditorialSectionTitle}>{experiences[0] ? "Something to join" : "Make a simple plan"}</Text>
          </View>
        </View>
        {experiences[0] ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open ${experiences[0].title}`}
            onPress={() => onOpenExperience(experiences[0])}
            style={({ pressed }) => [styles.homeExperienceCard, pressed && styles.iconButtonPressed]}
          >
            <View style={styles.homeExperienceDateBlock}>
              <Text style={styles.homeExperienceMonth}>{formatExperienceMonth(experiences[0].startsAt)}</Text>
              <Text style={styles.homeExperienceDay}>{formatExperienceDay(experiences[0].startsAt)}</Text>
            </View>
            <View style={styles.homeExperienceCopy}>
              <Text style={styles.homeExperienceTitle}>{experiences[0].title}</Text>
              <Text style={styles.homeExperienceMeta}>{`${formatExperienceTime(experiences[0].startsAt)} · ${experiences[0].venueName}`}</Text>
              <Text style={styles.homeExperienceSeats}>{`${experiences[0].attendeeCount}/${experiences[0].capacity} going`}</Text>
            </View>
            <View style={styles.homePersonArrow}>
              <LeftIcon name="arrow-up-right" size={17} color={T.textPrimary} />
            </View>
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Propose a small gathering"
            onPress={onCreateExperience}
            style={({ pressed }) => [styles.homeExperienceEmptyCard, pressed && styles.iconButtonPressed]}
          >
            <View style={styles.homeExperienceEmptyIcon}>
              <LeftIcon name="calendar" size={20} color={T.primary} />
            </View>
            <View style={styles.homeExperienceCopy}>
              <Text style={styles.homeExperienceTitle}>Host something small</Text>
              <Text style={styles.homeExperienceMeta}>Suggest a place and plan. Left reviews it before it appears nearby.</Text>
            </View>
            <View style={styles.homePersonArrow}>
              <LeftIcon name="arrow-up-right" size={17} color={T.textPrimary} />
            </View>
          </Pressable>
        )}
        {experiences[0] ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Propose a gathering"
            onPress={onCreateExperience}
            style={({ pressed }) => [styles.homeExperienceHostLink, pressed && styles.iconButtonPressed]}
          >
            <Text style={styles.homeExperienceHostLinkText}>Have an idea? Propose a gathering</Text>
            <LeftIcon name="arrow-right" size={15} color={T.primary} />
          </Pressable>
        ) : null}
      </View>

      {morePlaces.length > 0 ? (
        <View style={styles.homeEditorialSection}>
          <View style={styles.homeEditorialSectionHeader}>
            <View style={styles.homeEditorialSectionCopy}>
              <Text style={styles.homeEditorialSectionEyebrow}>KEEP EXPLORING</Text>
              <Text style={styles.homeEditorialSectionTitle}>More around you</Text>
              <Text style={styles.homeEditorialSectionMeta}>{placesContext}</Text>
            </View>
          </View>
          <View style={styles.homeVenueGrid}>
            {morePlaces.map((item) => (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={`Open ${item.name}`}
                accessibilityHint="Shows venue details"
                onPress={() => onOpenVenueDetail(item.venue)}
                style={({ pressed }) => [styles.homeVenueCard, pressed && styles.iconButtonPressed]}
              >
                <View style={styles.homeVenueCardRow}>
                  <View style={styles.homeVenueThumb}>
                    <Image source={item.illustration} style={styles.homeVenueIllustrationImage} resizeMode="cover" />
                    {photoImage(item.id)}
                  </View>
                  <View style={styles.homeVenueCardBody}>
                    <View style={styles.homeVenueCardTopGroup}>
                      <Text style={styles.homeVenueCardName}>{item.name}</Text>
                      <Text style={[styles.homeVenueStatusText, { color: item.signalBarColor }]}>{item.energyLabel}</Text>
                    </View>
                    <View style={styles.homeVenueDistanceRow}>
                      <LeftIcon name="map-pin" size={15} color={T.textMuted} />
                      <Text style={styles.homeVenueDistanceText}>{item.distanceLabel}</Text>
                    </View>
                  </View>
                  <View style={styles.homeVenueChevronBubble}>
                    <LeftIcon name="chevron-right" size={20} color={T.secondary} />
                  </View>
                </View>
                {photoCredit(item.id)}
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open privacy and safety controls"
        onPress={onOpenSafety}
        style={({ pressed }) => [styles.homeSafetyCard, pressed && styles.iconButtonPressed]}
      >
        <View style={styles.homeSafetyCardLeft}>
          <View style={styles.homeSafetyCardIconWrap}>
            <LeftIcon name="shield" size={20} color={T.primary} />
          </View>
          <View style={styles.homeSafetyCardCopy}>
            <Text style={styles.homeSafetyCardTitle}>You stay in control</Text>
            <Text style={styles.homeSafetyCardSubtitle}>Review visibility, hiding, blocking, and reporting.</Text>
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

function buildDiscoveryContext(
  venueName: string,
  intent: AppUser["defaultIntent"],
  vibes: string[],
) {
  const intentCopy = intent ? formatIntent(intent) : null;
  const vibeCopy = vibes.find((vibe) => vibe.trim())?.trim() ?? null;

  if (intentCopy && vibeCopy) {
    return `Selected around ${venueName} for ${intentCopy}, with a ${vibeCopy} mood.`;
  }
  if (intentCopy) {
    return `Selected around ${venueName} with your interest in ${intentCopy} in mind.`;
  }
  if (vibeCopy) {
    return `Places and people around ${venueName} that fit a ${vibeCopy} mood.`;
  }
  return `A small, live edit of meaningful places and people around ${venueName}.`;
}

function buildNearbyVenueCards(
  nearbyVenues: RuntimeVenueCandidate[],
  currentVenueName: string,
  venueActivityById: Record<string, VenueActivityEnvelope>,
) {
  const alternatives = nearbyVenues.filter((venue) => venue.name !== currentVenueName);
  const source = (alternatives.length ? alternatives : nearbyVenues).slice(0, 3);

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

function formatExperienceMonth(value: string) {
  return new Intl.DateTimeFormat(undefined, { month: "short" }).format(new Date(value)).toUpperCase();
}

function formatExperienceDay(value: string) {
  return new Intl.DateTimeFormat(undefined, { day: "numeric" }).format(new Date(value));
}

function formatExperienceTime(value: string) {
  return new Intl.DateTimeFormat(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}
