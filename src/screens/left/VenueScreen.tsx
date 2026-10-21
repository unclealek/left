import { t } from "../../features/preferences/translation-runtime";
import { useDistanceFormatter } from "../../features/preferences/use-distance";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Camera,
  MapView,
} from "@rnmapbox/maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type {
  RuntimeCoords,
  RuntimeVenueCandidate,
} from "../../features/location/location-storage";
import {
  getVenueConfidenceCopy,
  resolveVenueConfidence,
} from "../../features/location/venue-confidence";
import type {
  NearbyFeedItem,
  VenueActivityEnvelope,
  VenueContextSummary,
} from "../../types/left-domain";
import {
  filterMapVenues,
  filterShowsPeople,
  type DiscoveryMapFilter,
} from "../../features/discovery/map-filter";
import { formatIntent } from "../../app/leftConfig";
import { T } from "../../app/leftTheme";
import { venueRadarStyles as screenStyles } from "../../components/styles/features/venue";
import { LeftIcon, type LeftIconName } from "../../components/icons";
import { GlassSurface, glassRadii } from "../../components/glass";
import { LeftLogoMark } from "../../components/left/LeftLogoMark";
import { GhostButton } from "../../components/left/ui";
import { MAPBOX_ENABLED } from "../../lib/mapbox";

const STAGE_SIZE = 350;
const STAGE_CENTER = STAGE_SIZE / 2;
const PERSON_RING_RADII = [72, 106, 136] as const;
const PERSON_ANGLES = [18, 58, 102, 138, 198, 236, 286, 332] as const;
const VENUE_SLOT_ANGLES = [315, 225, 160, 20] as const;
const VENUE_SLOT_RADII = [106, 106, 92, 92] as const;
const MAP_FILTERS: Array<{ id: DiscoveryMapFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "places", label: "Places" },
  { id: "people", label: "People" },
  { id: "active", label: "Active now" },
];

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function buildPersonPlacements(feed: NearbyFeedItem[]) {
  return feed.slice(0, PERSON_ANGLES.length).map((item, index) => {
    const radius = PERSON_RING_RADII[index % PERSON_RING_RADII.length];
    const angle = PERSON_ANGLES[index];
    const size = index < 3 ? 40 : 34;
    const radians = toRadians(angle);
    const x = STAGE_CENTER + Math.cos(radians) * radius - size / 2;
    const y = STAGE_CENTER + Math.sin(radians) * radius - size / 2;

    return {
      item,
      size,
      left: x,
      top: y,
      featured: index < 3,
    };
  });
}

function buildVenuePlacements(
  nearbyVenues: RuntimeVenueCandidate[],
  currentVenueName: string,
) {
  const filtered = nearbyVenues
    .filter((candidate) => candidate.name !== currentVenueName)
    .sort((a, b) => (a.distanceMeters ?? Number.POSITIVE_INFINITY) - (b.distanceMeters ?? Number.POSITIVE_INFINITY))
    .slice(0, 4);

  return filtered.map((candidate, index) => {
    const angle = VENUE_SLOT_ANGLES[index % VENUE_SLOT_ANGLES.length];
    const radius = VENUE_SLOT_RADII[index % VENUE_SLOT_RADII.length];
    const point = {
      x: STAGE_CENTER + Math.cos(toRadians(angle)) * radius,
      y: STAGE_CENTER + Math.sin(toRadians(angle)) * radius,
    };
    const cardWidth = 74;
    const cardHeight = 48;
    const left = Math.max(10, Math.min(STAGE_SIZE - cardWidth - 10, point.x - cardWidth / 2));
    const top = Math.max(18, Math.min(STAGE_SIZE - cardHeight - 18, point.y - cardHeight / 2));

    return {
      candidate,
      left,
      top,
    };
  });
}

function resolveMapCenter(
  venue: VenueContextSummary,
  nearbyVenues: RuntimeVenueCandidate[],
  lastKnownCoords: RuntimeCoords | null,
) {
  const exactVenue = nearbyVenues.find((candidate) => candidate.id === venue.venueId);
  if (exactVenue) {
    return { latitude: exactVenue.latitude, longitude: exactVenue.longitude };
  }

  const matchingByName = nearbyVenues.find((candidate) => candidate.name === venue.venueName);
  if (matchingByName) {
    return { latitude: matchingByName.latitude, longitude: matchingByName.longitude };
  }

  if (lastKnownCoords) {
    return { latitude: lastKnownCoords.latitude, longitude: lastKnownCoords.longitude };
  }

  return { latitude: 60.1699, longitude: 24.9384 };
}

function getVenueMarkerIcon(name: string): LeftIconName {
  const value = name.toLowerCase();
  if (value.includes("cafe") || value.includes("coffee")) return "coffee";
  if (value.includes("bar")) return "circle";
  if (value.includes("gym") || value.includes("studio")) return "activity";
  if (value.includes("gift") || value.includes("shop") || value.includes("boutique")) return "gift";
  if (value.includes("press") || value.includes("library")) return "book-open";
  return "map-pin";
}

function resolveDisplayVenueName(
  venue: VenueContextSummary,
  nearbyVenues: RuntimeVenueCandidate[],
) {
  if (venue.venueId !== "private" && venue.venueName !== "Visibility off") {
    return venue.venueName;
  }

  const selected = nearbyVenues.find((candidate) => candidate.id === venue.venueId);
  if (selected) return selected.name;

  if (nearbyVenues[0]?.name) return nearbyVenues[0].name;

  return "Current venue";
}

export function VenueScreen({
  guest = false,
  venue,
  feed,
  socialMomentum,
  sessionVisible,
  venueHidden,
  allowVenueActions,
  canChooseVenue,
  onActivate,
  onOpenFeed,
  onOpenProfile,
  onOpenVenueDetail,
  onSocialMomentumPrimary,
  onDismissSocialMomentum,
  onChooseVenue,
  onAddVenue,
  onOpenSafety,
  nearbyVenues,
  venueActivityById,
  lastKnownCoords,
}: {
  guest?: boolean;
  venue: VenueContextSummary;
  feed: NearbyFeedItem[];
  socialMomentum: {
    state: "observing" | "warming_up" | "engaging" | "connected";
    title: string;
    body: string;
    primaryLabel: string;
  } | null;
  sessionVisible: boolean;
  venueHidden: boolean;
  allowVenueActions: boolean;
  canChooseVenue: boolean;
  onActivate: () => void;
  onOpenFeed: () => void;
  onOpenProfile: (item: NearbyFeedItem) => void;
  onOpenVenueDetail: (venue: RuntimeVenueCandidate) => void;
  onSocialMomentumPrimary: () => void;
  onDismissSocialMomentum: () => void;
  onChooseVenue: () => void;
  onAddVenue: () => void;
  onOpenSafety: () => void;
  nearbyVenues: RuntimeVenueCandidate[];
  venueActivityById: Record<string, VenueActivityEnvelope>;
  lastKnownCoords: RuntimeCoords | null;
}) {
  const insets = useSafeAreaInsets();
  const pingPulse = useRef(new Animated.Value(0)).current;
  const [mapFilter, setMapFilter] = useState<DiscoveryMapFilter>("all");
  const [selectedMapVenue, setSelectedMapVenue] = useState<RuntimeVenueCandidate | null>(null);
  const [selectedMapPerson, setSelectedMapPerson] = useState<NearbyFeedItem | null>(null);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pingPulse, {
          toValue: 1,
          duration: 1600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pingPulse, {
          toValue: 0,
          duration: 1600,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pingPulse]);

  const isPubliclyVisible = sessionVisible && !venueHidden;
  const displayVenueName = useMemo(
    () => resolveDisplayVenueName(venue, nearbyVenues),
    [nearbyVenues, venue],
  );
  const venueConfidence = useMemo(
    () => resolveVenueConfidence(venue, nearbyVenues),
    [nearbyVenues, venue],
  );
  const confidenceCopy = getVenueConfidenceCopy(venueConfidence);
  const mapCenter = useMemo(
    () => resolveMapCenter(venue, nearbyVenues, lastKnownCoords),
    [lastKnownCoords, nearbyVenues, venue],
  );
  const showPeopleOnMap = isPubliclyVisible && filterShowsPeople(mapFilter);
  const personPlacements = useMemo(
    () => buildPersonPlacements(showPeopleOnMap ? feed : []),
    [feed, showPeopleOnMap],
  );
  const activeVenueCandidate = useMemo(
    () =>
      nearbyVenues.find((candidate) => candidate.id === venue.venueId) ??
      nearbyVenues.find((candidate) => candidate.name === displayVenueName) ??
      nearbyVenues[0] ??
      null,
    [displayVenueName, nearbyVenues, venue.venueId],
  );
  const filteredVenues = useMemo(
    () => filterMapVenues(nearbyVenues, mapFilter, venueActivityById),
    [mapFilter, nearbyVenues, venueActivityById],
  );
  const venuePlacements = useMemo(
    () => buildVenuePlacements(filteredVenues, displayVenueName),
    [displayVenueName, filteredVenues],
  );
  const pulseScale = pingPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });
  const pulseOpacity = pingPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.28, 0],
  });

  const statusLabel = isPubliclyVisible ? "Visible" : "Hidden";
  const radarSubtitle = isPubliclyVisible
    ? "Your venue is confirmed.\nSee who's around while you stay visible."
    : venueConfidence === "nearby_guess"
      ? "Left found a likely nearby venue.\nIt has not been fully confirmed yet."
      : confidenceCopy;
  const energyTitle =
    venue.energyLevel === "busy"
      ? "Busy"
      : venue.energyLevel === "active"
        ? "Active"
        : venue.energyLevel === "focused"
          ? "Focused"
          : venue.energyLevel === "warm"
            ? "Warm"
            : "Calm";
  const energySubtext =
    venue.energyLevel === "busy"
      ? "A lot happening right now"
      : venue.energyLevel === "active"
        ? "People are moving around"
        : venue.energyLevel === "focused"
          ? "Heads-down but social"
          : venue.energyLevel === "warm"
            ? "Easy to join"
            : "Low activity";
  const energySignalColor =
    venue.energyLevel === "busy"
      ? T.visibilityOff
      : venue.energyLevel === "active" || venue.energyLevel === "warm"
        ? T.visibilityOn
        : T.venueAccent;
  const energyIsBusy = venue.energyLevel === "busy";
  const activeVibes = venue.activeVibes.slice(0, 3);
  const vibesTitle = activeVibes[0] ?? "Quiet room";
  const vibesSubtext = activeVibes.length > 1 ? activeVibes.slice(1).join(" · ") : "Live social signal";
  const currentVenueSummary = `${energyTitle} · ${vibesTitle}`;
  const selectedPreviewTitle = selectedMapPerson
    ? selectedMapPerson.firstName
    : selectedMapVenue?.name ?? "You are here";
  const formatDistanceLabel = useDistanceFormatter();
  const selectedPreviewMeta = selectedMapPerson
    ? `${formatIntent(selectedMapPerson.intent)} · ${selectedMapPerson.primaryVibe ?? "Open"}`
    : selectedMapVenue
      ? selectedMapVenue.distanceMeters != null
        ? `${formatDistanceLabel(selectedMapVenue.distanceMeters)} · Tap to view`
        : "Tap to view place"
      : currentVenueSummary;
  const previewCandidate = selectedMapVenue ?? activeVenueCandidate;
  const primaryAction = isPubliclyVisible ? onOpenFeed : onActivate;
  const pulseIconStyle = {
    transform: [{ scale: pulseScale }],
    opacity: pingPulse.interpolate({
      inputRange: [0, 1],
      outputRange: [0.62, 1],
    }),
  };

  if (!isPubliclyVisible) {
    return (
      <View style={[screenStyles.page, { paddingTop: Math.max(insets.top - 52, 10) }]}>
        <View style={screenStyles.titleBlock}>
          <Text style={screenStyles.heroTitle}>{guest ? t("Map") : t("Venue radar")}</Text>
          <Text style={screenStyles.heroSubtitle}>{guest ? t("Sign in for location-based discovery. Guest mode does not access your location.") : t("Go visible to unlock venue details, room energy, and the social vibes around you.")}</Text>
        </View>
        <View style={screenStyles.momentumCard}>
          <View style={screenStyles.insightIconBubble}>
            <LeftIcon name="eye-off" size={22} color={T.visibilityOff} />
          </View>
          <Text style={screenStyles.momentumTitle}>{guest ? t("Discover your surroundings") : t("Your venue is private")}</Text>
          <Text style={screenStyles.momentumBody}>{guest ? t("Explore real places and anonymous social signals after signing in and confirming your venue.") : t("When you are visible, you can see the venue’s live energy and vibes without exposing anyone’s headcount.")}</Text>
          <Pressable onPress={onActivate} style={({ pressed }) => [screenStyles.momentumButton, pressed && screenStyles.pressed]}>
            <Text style={screenStyles.momentumButtonLabel}>{guest ? t("Sign in to explore") : t("Choose vibes and go visible")}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[screenStyles.page, { paddingTop: Math.max(insets.top - 52, 10) }]}>
      <View style={screenStyles.titleBlock}>
        <View style={screenStyles.headerRow}>
          <View style={screenStyles.headerCopy}>
            <View style={screenStyles.heroTitleRow}>
              <Text style={screenStyles.heroTitle} maxFontSizeMultiplier={1.2}>{t("Venue radar")}{" "}</Text>
              <Animated.View style={[screenStyles.heroSignalWrap, pulseIconStyle]}>
                <LeftIcon name="radio" size={18} color={T.primary} active />
              </Animated.View>
            </View>
          </View>
          <GlassSurface
            variant="soft"
            radius={glassRadii.pill}
            contentStyle={screenStyles.statusActionPill}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isPubliclyVisible ? t("Open nearby feed") : t("Go visible")}
              onPress={primaryAction}
              style={({ pressed }) => [
                screenStyles.compactStatusPill,
                isPubliclyVisible ? screenStyles.compactStatusPillVisible : screenStyles.compactStatusPillHidden,
                pressed && screenStyles.pressed,
              ]}
            >
              <LeftIcon
                name={isPubliclyVisible ? "eye" : "eye-off"}
                size={17}
                color={isPubliclyVisible ? T.visibilityOn : T.visibilityOff}
                active={isPubliclyVisible}
              />
              <Text style={screenStyles.compactStatusLabel}>{t(statusLabel)}</Text>
            </Pressable>
            <View style={screenStyles.statusActionDivider} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("Privacy and safety")}
              onPress={onOpenSafety}
              hitSlop={8}
              style={({ pressed }) => [
                screenStyles.compactPrivacyButton,
                pressed && screenStyles.pressed,
              ]}
            >
              <LeftIcon name="shield" size={18} color={T.primary} />
            </Pressable>
          </GlassSurface>
        </View>
        <Text style={screenStyles.heroSubtitle} maxFontSizeMultiplier={1.3}>
          {t(radarSubtitle)}
        </Text>
        <View style={screenStyles.insightRow}>
          <View style={screenStyles.insightCard}>
            <Text style={screenStyles.insightLabel} maxFontSizeMultiplier={1.1}>{t("Energy")}{" "}</Text>
            <View style={screenStyles.insightValueRow}>
              <View
                style={[
                  screenStyles.insightIconBubble,
                  energyIsBusy ? screenStyles.insightIconBubbleBusy : screenStyles.insightIconBubbleEnergy,
                ]}
              >
                <LeftIcon name="activity" size={21} color={energySignalColor} />
              </View>
              <Text
                style={screenStyles.insightTitle}
                maxFontSizeMultiplier={1.2}
                numberOfLines={2}
              >
                {t(energyTitle)}
              </Text>
            </View>
            <Text style={screenStyles.insightSubtext} maxFontSizeMultiplier={1.2}>
              {t(energySubtext)}
            </Text>
          </View>
          <View style={screenStyles.insightCard}>
            <Text style={screenStyles.insightLabel} maxFontSizeMultiplier={1.1}>{t("Room vibes")}{" "}</Text>
            <View style={screenStyles.insightValueRow}>
              <View style={[screenStyles.insightIconBubble, screenStyles.insightIconBubbleIntent]}>
                <LeftIcon name="users" size={20} color={T.visibilityOff} />
              </View>
              <Text
                style={screenStyles.insightTitle}
                maxFontSizeMultiplier={1.2}
                numberOfLines={2}
              >
                {t(vibesTitle)}
              </Text>
            </View>
            <Text style={screenStyles.insightSubtext} maxFontSizeMultiplier={1.2}>
              {t(vibesSubtext)}
            </Text>
          </View>
        </View>
      </View>

      <View style={screenStyles.mapCard}>
        <View style={screenStyles.mapFilterRow} accessibilityRole="tablist">
          {MAP_FILTERS.map((filter) => {
            const active = mapFilter === filter.id;
            return (
              <Pressable
                key={filter.id}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                onPress={() => {
                  setMapFilter(filter.id);
                  setSelectedMapVenue(null);
                  setSelectedMapPerson(null);
                }}
                style={({ pressed }) => [
                  screenStyles.mapFilterChip,
                  active && screenStyles.mapFilterChipActive,
                  pressed && screenStyles.pressed,
                ]}
              >
                <Text
                  style={[
                    screenStyles.mapFilterLabel,
                    active && screenStyles.mapFilterLabelActive,
                  ]}
                  numberOfLines={1}
                >
                  {t(filter.label)}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={screenStyles.mapFrame}>
          {MAPBOX_ENABLED ? (
            <MapView
              style={screenStyles.mapbox}
              styleURL="mapbox://styles/mapbox/light-v11"
              compassEnabled={false}
              rotateEnabled={false}
              pitchEnabled={false}
              scrollEnabled={false}
              zoomEnabled={false}
              scaleBarEnabled={false}
              logoEnabled={false}
              attributionEnabled={false}
            >
              <Camera
                zoomLevel={16.3}
                centerCoordinate={[mapCenter.longitude, mapCenter.latitude]}
              />
            </MapView>
          ) : (
            <LinearGradient
              colors={[T.surface, T.surfaceDim, T.surface]}
              style={screenStyles.mapFallback}
            >
              <View style={screenStyles.mapPatchOne} />
              <View style={screenStyles.mapPatchTwo} />
              <View style={screenStyles.mapPatchThree} />
              <View style={screenStyles.mapRoadHorizontal} />
              <View style={screenStyles.mapRoadVertical} />
              <View style={screenStyles.mapRoadDiagonal} />
            </LinearGradient>
          )}

          <LinearGradient
            colors={isPubliclyVisible
              ? [T.surfaceGlassSoft, T.visibilityOnSoft]
              : [T.surfaceGlassSoft, T.visibilityOffSoft]}
            style={screenStyles.mapWarmWash}
            pointerEvents="none"
          />

          <View
            style={[screenStyles.ringInner, isPubliclyVisible && screenStyles.ringInnerVisible]}
            pointerEvents="none"
          />

          <View
            style={[screenStyles.centerVenueBoundary, isPubliclyVisible && screenStyles.centerVenueBoundaryVisible]}
            pointerEvents="none"
          />

          {venuePlacements.map(({ candidate, left, top }) => (
            <Pressable
              key={candidate.id}
              accessibilityRole="button"
              accessibilityLabel={`Select ${candidate.name}`}
              onPress={() => {
                setSelectedMapVenue(candidate);
                setSelectedMapPerson(null);
              }}
              style={[
                screenStyles.venueMarker,
                !isPubliclyVisible && screenStyles.venueMarkerHidden,
                selectedMapVenue?.id === candidate.id && screenStyles.venueMarkerSelected,
                { left, top },
            ]}
              hitSlop={8}
            >
              <View style={screenStyles.venueMarkerPin}>
                <LeftIcon
                  name={getVenueMarkerIcon(candidate.name)}
                  size={16}
                  color={T.white}
                />
              </View>
              <View style={screenStyles.venueMarkerCopy}>
                <Text style={screenStyles.venueMarkerName} numberOfLines={1}>
                  {candidate.name}
                </Text>
              </View>
            </Pressable>
          ))}

          {showPeopleOnMap
            ? personPlacements.map(({ item, size, left, top, featured }) => (
                <Pressable
                  key={item.profileUserId}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${item.firstName}`}
                  onPress={() => {
                    setSelectedMapPerson(item);
                    setSelectedMapVenue(null);
                  }}
                  style={({ pressed }) => [
                    screenStyles.personPulse,
                    featured && screenStyles.personPulseFeatured,
                    selectedMapPerson?.profileUserId === item.profileUserId && screenStyles.personPulseSelected,
                    {
                      width: size,
                      height: size,
                      borderRadius: size / 2,
                      left,
                      top,
                    },
                    pressed && screenStyles.pressed,
                  ]}
                >
                  {featured ? (
                    <Animated.View
                      pointerEvents="none"
                      style={[
                        screenStyles.personPulseHalo,
                        {
                          opacity: pulseOpacity,
                          transform: [{ scale: pulseScale }],
                        },
                      ]}
                    />
                  ) : null}
                  <LeftIcon
                    name="user"
                    size={featured ? 17 : 15}
                    color={T.primary}
                  />
                </Pressable>
              ))
            : null}

          {mapFilter === "people" && !isPubliclyVisible ? (
            <View style={screenStyles.mapPrivacyHint} pointerEvents="none">
              <LeftIcon name="eye-off" size={16} color={T.visibilityOff} />
              <Text style={screenStyles.mapPrivacyHintText}>{t("Go visible to see people nearby.")}{" "}</Text>
            </View>
          ) : null}

          {mapFilter === "active" && venuePlacements.length === 0 && personPlacements.length === 0 ? (
            <View style={screenStyles.mapPrivacyHint} pointerEvents="none">
              <LeftIcon name="activity" size={16} color={T.textSecondary} />
              <Text style={screenStyles.mapPrivacyHintText}>{t("No live activity signal yet.")}{" "}</Text>
            </View>
          ) : null}

          <GlassSurface
            pointerEvents="none"
            variant="soft"
            radius={glassRadii.pill}
            style={screenStyles.centerBadge}
            contentStyle={screenStyles.centerBadgeContent}
          >
            <LeftLogoMark size={22} />
            <Text style={screenStyles.centerBadgeSubtitle}>
              {isPubliclyVisible ? t("Visible") : t("Hidden")}
            </Text>
          </GlassSurface>

          <GlassSurface
            variant="medium"
            radius={glassRadii.card}
            style={screenStyles.currentVenueGlass}
          >
            <Pressable
              onPress={() => {
                if (selectedMapPerson) {
                  onOpenProfile(selectedMapPerson);
                } else if (previewCandidate) {
                  onOpenVenueDetail(previewCandidate);
                }
              }}
              style={({ pressed }) => [
                screenStyles.currentVenueChip,
                pressed && screenStyles.pressed,
              ]}
            >
              <View style={screenStyles.currentVenuePin}>
                <LeftIcon
                  name={selectedMapPerson ? "user" : "map-pin"}
                  size={18}
                  color={selectedMapPerson ? T.primary : T.venueAccent}
                />
              </View>
              <View style={screenStyles.currentVenueCopy}>
                <Text style={screenStyles.currentVenueChipText} numberOfLines={1}>
                  {selectedPreviewTitle}
                </Text>
                <Text style={screenStyles.currentVenueChipMeta} numberOfLines={1}>
                  {selectedPreviewMeta}
                </Text>
              </View>
              <View style={screenStyles.currentVenueArrowBubble}>
                <LeftIcon name="arrow-up-right" size={18} color={T.primary} />
              </View>
            </Pressable>
          </GlassSurface>
        </View>
      </View>

      {socialMomentum && isPubliclyVisible ? (
        <View style={screenStyles.momentumCard}>
          <View style={screenStyles.momentumHeader}>
            <Text style={screenStyles.momentumEyebrow}>{t("Social momentum")}</Text>
            <Pressable onPress={onDismissSocialMomentum} hitSlop={10}>
              <Text style={screenStyles.momentumDismiss}>{t("Not now")}</Text>
            </Pressable>
          </View>
          <Text style={screenStyles.momentumTitle}>{t(socialMomentum.title)}</Text>
          <Text style={screenStyles.momentumBody}>{t(socialMomentum.body)}</Text>
          <Pressable
            onPress={onSocialMomentumPrimary}
            style={({ pressed }) => [
              screenStyles.momentumButton,
              pressed && screenStyles.pressed,
            ]}
          >
            <Text style={screenStyles.momentumButtonLabel}>
              {socialMomentum.primaryLabel}
            </Text>
          </Pressable>
        </View>
      ) : null}

      {allowVenueActions && canChooseVenue ? (
        <GhostButton
          label={t("Choose a different nearby venue")}
          onPress={onChooseVenue}
        />
      ) : null}
      {allowVenueActions ? (
        <GhostButton label={t("Can't find your venue? Add +")} onPress={onAddVenue} />
      ) : null}
    </View>
  );
}
