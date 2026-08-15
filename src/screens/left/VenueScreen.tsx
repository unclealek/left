import { useEffect, useMemo, useRef } from "react";
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
  VenueContextSummary,
} from "../../types/left-domain";
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

function getCompactIntentLabel(intent: string) {
  const value = intent.toLowerCase();
  if (value.includes("open to conversation") || value.includes("conversation")) return "Open";
  if (value.includes("group discussion") || value.includes("discussion")) return "Discussion";
  if (value.includes("network")) return "Networking";
  if (value.includes("study")) return "Study";
  if (value.includes("coffee")) return "Coffee";
  return intent;
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
  lastKnownCoords,
}: {
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
  lastKnownCoords: RuntimeCoords | null;
}) {
  const insets = useSafeAreaInsets();
  const pingPulse = useRef(new Animated.Value(0)).current;

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
  const personPlacements = useMemo(() => buildPersonPlacements(feed), [feed]);
  const activeVenueCandidate = useMemo(
    () =>
      nearbyVenues.find((candidate) => candidate.id === venue.venueId) ??
      nearbyVenues.find((candidate) => candidate.name === displayVenueName) ??
      nearbyVenues[0] ??
      null,
    [displayVenueName, nearbyVenues, venue.venueId],
  );
  const venuePlacements = useMemo(
    () => buildVenuePlacements(nearbyVenues, displayVenueName),
    [displayVenueName, nearbyVenues],
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
  const intentTitle = useMemo(() => {
    const raw = formatIntent(venue.popularIntents[0] ?? "open_to_conversation");
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }, [venue.popularIntents]);
  const intentSubtext = isPubliclyVisible ? "Most common here" : "Likely nearby";
  const currentVenueSummary = `${energyTitle} · ${getCompactIntentLabel(intentTitle)}`;
  const primaryAction = isPubliclyVisible ? onOpenFeed : onActivate;
  const pulseIconStyle = {
    transform: [{ scale: pulseScale }],
    opacity: pingPulse.interpolate({
      inputRange: [0, 1],
      outputRange: [0.62, 1],
    }),
  };

  return (
    <View style={[screenStyles.page, { paddingTop: Math.max(insets.top - 52, 10) }]}>
      <View style={screenStyles.titleBlock}>
        <View style={screenStyles.headerRow}>
          <View style={screenStyles.headerCopy}>
            <View style={screenStyles.heroTitleRow}>
              <Text style={screenStyles.heroTitle} maxFontSizeMultiplier={1.2}>
                Venue radar
              </Text>
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
              accessibilityLabel={isPubliclyVisible ? "Open nearby feed" : "Go visible"}
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
              <Text style={screenStyles.compactStatusLabel}>{statusLabel}</Text>
            </Pressable>
            <View style={screenStyles.statusActionDivider} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Privacy and safety"
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
          {radarSubtitle}
        </Text>
        <View style={screenStyles.insightRow}>
          <View style={screenStyles.insightCard}>
            <Text style={screenStyles.insightLabel} maxFontSizeMultiplier={1.1}>
              Energy
            </Text>
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
                {energyTitle}
              </Text>
            </View>
            <Text style={screenStyles.insightSubtext} maxFontSizeMultiplier={1.2}>
              {energySubtext}
            </Text>
          </View>
          <View style={screenStyles.insightCard}>
            <Text style={screenStyles.insightLabel} maxFontSizeMultiplier={1.1}>
              Top intent
            </Text>
            <View style={screenStyles.insightValueRow}>
              <View style={[screenStyles.insightIconBubble, screenStyles.insightIconBubbleIntent]}>
                <LeftIcon name="users" size={20} color={T.visibilityOff} />
              </View>
              <Text
                style={screenStyles.insightTitle}
                maxFontSizeMultiplier={1.2}
                numberOfLines={2}
              >
                {intentTitle}
              </Text>
            </View>
            <Text style={screenStyles.insightSubtext} maxFontSizeMultiplier={1.2}>
              {intentSubtext}
            </Text>
          </View>
        </View>
      </View>

      <View style={screenStyles.mapCard}>
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
              onPress={() => onOpenVenueDetail(candidate)}
              style={[
                screenStyles.venueMarker,
                !isPubliclyVisible && screenStyles.venueMarkerHidden,
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

          {isPubliclyVisible
            ? personPlacements.map(({ item, size, left, top, featured }) => (
                <Pressable
                  key={item.profileUserId}
                  onPress={() => onOpenProfile(item)}
                  style={({ pressed }) => [
                    screenStyles.personPulse,
                    featured && screenStyles.personPulseFeatured,
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

          <GlassSurface
            pointerEvents="none"
            variant="soft"
            radius={glassRadii.pill}
            style={screenStyles.centerBadge}
            contentStyle={screenStyles.centerBadgeContent}
          >
            <LeftLogoMark size={22} />
            <Text style={screenStyles.centerBadgeSubtitle}>
              {isPubliclyVisible ? "Visible" : "Hidden"}
            </Text>
          </GlassSurface>

          <GlassSurface
            variant="medium"
            radius={glassRadii.card}
            style={screenStyles.currentVenueGlass}
          >
            <Pressable
              onPress={() => {
                if (activeVenueCandidate) onOpenVenueDetail(activeVenueCandidate);
              }}
              style={({ pressed }) => [
                screenStyles.currentVenueChip,
                pressed && screenStyles.pressed,
              ]}
            >
              <View style={screenStyles.currentVenuePin}>
                <LeftIcon name="map-pin" size={18} color={T.venueAccent} />
              </View>
              <View style={screenStyles.currentVenueCopy}>
                <Text style={screenStyles.currentVenueChipText} numberOfLines={1}>
                  You are here
                </Text>
                <Text style={screenStyles.currentVenueChipMeta} numberOfLines={1}>
                  {currentVenueSummary}
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
            <Text style={screenStyles.momentumEyebrow}>Social momentum</Text>
            <Pressable onPress={onDismissSocialMomentum} hitSlop={10}>
              <Text style={screenStyles.momentumDismiss}>Not now</Text>
            </Pressable>
          </View>
          <Text style={screenStyles.momentumTitle}>{socialMomentum.title}</Text>
          <Text style={screenStyles.momentumBody}>{socialMomentum.body}</Text>
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
          label="Choose a different nearby venue"
          onPress={onChooseVenue}
        />
      ) : null}
      {allowVenueActions ? (
        <GhostButton label="Can't find your venue? Add +" onPress={onAddVenue} />
      ) : null}
    </View>
  );
}
