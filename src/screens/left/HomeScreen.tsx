import { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator, Image, Linking, Pressable, Text, View } from "react-native";
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
  venue,
  nearbyVenues,
  venueActivityById,
  experiences,
  feed,
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
  profileCompletion: number;
  onCompleteProfile: () => void;
}) {
  const venueName = resolveVenueName(venue.venueName, nearbyVenues);
  const currentVenueCandidate =
    nearbyVenues.find((candidate) => candidate.id === venue.venueId) ??
    nearbyVenues.find((candidate) => candidate.name === venueName) ??
    null;
  const isVisible = sessionVisible && !venueHidden;
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
        <Text numberOfLines={1} style={{ fontSize: 12, color: T.textSecondary }}>Google Maps</Text>
        {photo.attributions.map((author, index) => author.uri ? (
          <Pressable key={index} accessibilityRole="link" accessibilityLabel={`Photo by ${author.displayName}`}
            style={{ minHeight: 44, justifyContent: "center", flexShrink: 1 }}
            onPress={(event) => { event.stopPropagation(); void Linking.openURL(author.uri!).catch(() => {}); }}>
            <Text style={{ fontSize: 12, color: T.textSecondary }}>· {author.displayName}</Text>
          </Pressable>
        ) : <Text key={index} style={{ fontSize: 12, color: T.textSecondary }}>· {author.displayName}</Text>)}
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
            <PresenceIndicator isVisible={isVisible} />
          </View>
          <Text style={styles.homeBrandLabel}>Left</Text>
        </View>
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
                {isVisible ? "Visible here" : "Private here"}
              </Text>
            </View>
            <Text style={styles.homePresenceVenue}>{venueName}</Text>
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
              {isVisible ? "Manage visibility" : "Go visible"}
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
            <Text style={styles.homeEditorialSectionTitle}>People here</Text>
          </View>
        </View>

        {featuredPerson ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View ${featuredPerson.firstName}'s profile`}
            onPress={() => onOpenProfile(featuredPerson)}
            style={({ pressed }) => [styles.homePersonCard, pressed && styles.iconButtonPressed]}
          >
            <View style={styles.homePersonAvatarShell}>
              <LeftAvatar name={featuredPerson.firstName} avatarStyle={featuredPerson.avatarStyle} />
            </View>
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

function PresenceIndicator({ isVisible }: { isVisible: boolean }) {
  return (
    <View style={styles.homePresenceIndicatorWrap}>
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
