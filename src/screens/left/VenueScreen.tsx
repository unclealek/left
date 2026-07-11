import { Feather } from "@expo/vector-icons";
import { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Camera,
  MapView,
} from "@rnmapbox/maps";
import type {
  RuntimeCoords,
  RuntimeVenueCandidate,
} from "../../features/location/location-storage";
import {
  getVenueConfidenceCopy,
  getVenueConfidenceLabel,
  resolveVenueConfidence,
} from "../../features/location/venue-confidence";
import type {
  NearbyFeedItem,
  VenueContextSummary,
} from "../../types/left-domain";
import { formatIntent } from "../../app/leftConfig";
import { T } from "../../app/leftTheme";
import { LeftDoorwayMark } from "../../components/left/LeftDoorwayMark";
import { GhostButton } from "../../components/left/ui";
import { MAPBOX_ENABLED } from "../../lib/mapbox";

const STAGE_SIZE = 350;
const STAGE_CENTER = STAGE_SIZE / 2;
const PERSON_RING_RADII = [72, 106, 136] as const;
const PERSON_ANGLES = [18, 58, 102, 138, 198, 236, 286, 332] as const;
const FALLBACK_VENUE_ANGLES = [32, 126, 214, 306] as const;
const MAX_DISPLAY_DISTANCE_METERS = 150;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function toMetersLabel(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Nearby";
  if (value < 1000) return `${Math.max(1, Math.round(value / 5) * 5)} m away`;
  return `${(value / 1000).toFixed(1)} km away`;
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

function projectVenueCandidate(
  candidate: RuntimeVenueCandidate,
  center: { latitude: number; longitude: number },
  index: number,
) {
  const latitudeDeltaMeters = (candidate.latitude - center.latitude) * 111_320;
  const longitudeDeltaMeters =
    (candidate.longitude - center.longitude) *
    111_320 *
    Math.cos(toRadians(center.latitude));

  const hasCoords =
    Number.isFinite(latitudeDeltaMeters) && Number.isFinite(longitudeDeltaMeters);
  const fallbackAngle = FALLBACK_VENUE_ANGLES[index % FALLBACK_VENUE_ANGLES.length];
  const fallbackRadius = 130;
  const fallbackX =
    STAGE_CENTER + Math.cos(toRadians(fallbackAngle)) * fallbackRadius;
  const fallbackY =
    STAGE_CENTER + Math.sin(toRadians(fallbackAngle)) * fallbackRadius;

  const limitedX = hasCoords
    ? Math.max(
        -MAX_DISPLAY_DISTANCE_METERS,
        Math.min(MAX_DISPLAY_DISTANCE_METERS, longitudeDeltaMeters),
      )
    : fallbackX - STAGE_CENTER;
  const limitedY = hasCoords
    ? Math.max(
        -MAX_DISPLAY_DISTANCE_METERS,
        Math.min(MAX_DISPLAY_DISTANCE_METERS, latitudeDeltaMeters),
      )
    : fallbackY - STAGE_CENTER;

  return {
    x: STAGE_CENTER + (limitedX / MAX_DISPLAY_DISTANCE_METERS) * 126,
    y: STAGE_CENTER - (limitedY / MAX_DISPLAY_DISTANCE_METERS) * 126,
  };
}

function buildVenuePlacements(
  nearbyVenues: RuntimeVenueCandidate[],
  currentVenueName: string,
  center: { latitude: number; longitude: number },
) {
  const filtered = nearbyVenues
    .filter((candidate) => candidate.name !== currentVenueName)
    .slice(0, 4);

  return filtered.map((candidate, index) => {
    const point = projectVenueCandidate(candidate, center, index);
    const cardWidth = 116;
    const cardHeight = 72;
    const left = Math.max(10, Math.min(STAGE_SIZE - cardWidth - 10, point.x - cardWidth / 2));
    const top = Math.max(18, Math.min(STAGE_SIZE - cardHeight - 18, point.y - cardHeight / 2));

    return {
      candidate,
      badgeLabel: String(index + 1),
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

function getVenueMarkerIcon(name: string) {
  const value = name.toLowerCase();
  if (value.includes("cafe") || value.includes("coffee")) return "coffee";
  if (value.includes("bar")) return "disc";
  if (value.includes("gym") || value.includes("studio")) return "activity";
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
  onSocialMomentumPrimary: () => void;
  onDismissSocialMomentum: () => void;
  onChooseVenue: () => void;
  onAddVenue: () => void;
  onOpenSafety: () => void;
  nearbyVenues: RuntimeVenueCandidate[];
  lastKnownCoords: RuntimeCoords | null;
}) {
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
  const confidenceLabel = getVenueConfidenceLabel(venueConfidence);
  const confidenceCopy = getVenueConfidenceCopy(venueConfidence);
  const nearbyCount = Math.max(venue.visibleCount, feed.length);
  const mapCenter = useMemo(
    () => resolveMapCenter(venue, nearbyVenues, lastKnownCoords),
    [lastKnownCoords, nearbyVenues, venue],
  );
  const personPlacements = useMemo(() => buildPersonPlacements(feed), [feed]);
  const venuePlacements = useMemo(
    () => buildVenuePlacements(nearbyVenues, displayVenueName, mapCenter),
    [displayVenueName, mapCenter, nearbyVenues],
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
  const helperCopy = isPubliclyVisible
    ? venue.pulseCopy?.trim() || "Open the nearby feed to see who has surfaced."
    : "Go visible to discover who's around and be discovered.";
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
  const intentTitle = formatIntent(venue.popularIntents[0] ?? "open_to_conversation");
  const intentSubtext = isPubliclyVisible ? "Most common here" : "Likely nearby";
  const primaryActionLabel = isPubliclyVisible ? "Open Nearby Feed" : "Go Visible";
  const primaryAction = isPubliclyVisible ? onOpenFeed : onActivate;

  return (
    <View style={screenStyles.page}>
      <View style={screenStyles.headerRow}>
        <View style={screenStyles.venueIdentity}>
          <View style={screenStyles.venueIdentityIcon}>
            <Feather name="map-pin" size={18} color={T.textPrimary} />
          </View>
          <View style={screenStyles.venueIdentityCopy}>
            <Text style={screenStyles.venueName} numberOfLines={1}>
              {displayVenueName}
            </Text>
            <View style={screenStyles.venueMetaRow}>
              <Feather
                name={isPubliclyVisible ? "users" : "radio"}
                size={16}
                color={T.primary}
              />
              <Text style={screenStyles.venueMetaText}>
                {isPubliclyVisible
                  ? nearbyCount > 0
                    ? `${nearbyCount} ${nearbyCount === 1 ? "person visible now" : "people visible now"}`
                    : "Nobody visible yet"
                  : confidenceLabel}
              </Text>
            </View>
          </View>
        </View>

        <Pressable
          onPress={onOpenSafety}
          style={({ pressed }) => [
            screenStyles.privacyButton,
            pressed && screenStyles.pressed,
          ]}
        >
          <Feather name="shield" size={18} color={T.accentBright} />
        </Pressable>
      </View>

      <View style={screenStyles.titleBlock}>
        <View style={screenStyles.statusPill}>
          <View
            style={[
              screenStyles.statusDot,
              isPubliclyVisible
                ? screenStyles.statusDotVisible
                : screenStyles.statusDotHidden,
            ]}
          />
          <Text style={screenStyles.statusPillText}>{statusLabel}</Text>
        </View>
        <View style={screenStyles.heroTitleRow}>
          <Text style={screenStyles.heroTitle}>Venue Radar</Text>
          <View style={screenStyles.heroSignalWrap}>
            <Feather name="radio" size={18} color={"#9BB39C"} />
          </View>
        </View>
        <Text style={screenStyles.heroSubtitle}>
          {isPubliclyVisible
            ? "See who's around while you stay visible."
            : confidenceCopy}
        </Text>
        <View style={screenStyles.insightRow}>
          <View style={screenStyles.insightCard}>
            <Text style={screenStyles.insightLabel}>Energy Pill</Text>
            <Text style={screenStyles.insightValue}>{energyTitle}</Text>
            <Text style={screenStyles.insightSubtext}>{energySubtext}</Text>
          </View>
          <View style={screenStyles.insightCard}>
            <Text style={screenStyles.insightLabel}>Top intent</Text>
            <Text style={screenStyles.insightValue}>{intentTitle}</Text>
            <Text style={screenStyles.insightSubtext}>{intentSubtext}</Text>
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
              colors={["#FBF8F1", "#F8F0E4", "#FBF7F0"]}
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
            colors={["rgba(255,255,255,0.08)", "rgba(255,190,64,0.08)"]}
            style={screenStyles.mapWarmWash}
            pointerEvents="none"
          />

          <View style={screenStyles.ringOuter} pointerEvents="none" />
          <View style={screenStyles.ringMid} pointerEvents="none" />
          <View style={screenStyles.ringInner} pointerEvents="none" />
          <Text style={[screenStyles.ringLabel, screenStyles.ringLabelOuter]}>
            150 m
          </Text>
          <Text style={[screenStyles.ringLabel, screenStyles.ringLabelMid]}>
            100 m
          </Text>
          <Text style={[screenStyles.ringLabel, screenStyles.ringLabelInner]}>
            50 m
          </Text>

          <View style={screenStyles.centerVenueGlow} pointerEvents="none" />
          <View style={screenStyles.centerVenueBoundary} pointerEvents="none" />

          {venuePlacements.map(({ candidate, badgeLabel, left, top }) => (
            <View
              key={candidate.id}
              style={[
                screenStyles.venueMarker,
                !isPubliclyVisible && screenStyles.venueMarkerHidden,
                { left, top },
              ]}
              pointerEvents="none"
            >
              <View style={screenStyles.venueMarkerBadge}>
                <Text style={screenStyles.venueMarkerBadgeText}>{badgeLabel}</Text>
              </View>
              <View style={screenStyles.venueMarkerPin}>
                <Feather
                  name={getVenueMarkerIcon(candidate.name)}
                  size={16}
                  color={T.white}
                />
              </View>
              <View style={screenStyles.venueMarkerCopy}>
                <Text style={screenStyles.venueMarkerName} numberOfLines={2}>
                  {candidate.name}
                </Text>
                <Text style={screenStyles.venueMarkerMeta}>
                  {toMetersLabel(candidate.distanceMeters)}
                </Text>
              </View>
            </View>
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
                  <Feather
                    name="user"
                    size={featured ? 17 : 15}
                    color={T.primary}
                  />
                </Pressable>
              ))
            : null}

          <View style={screenStyles.centerBadge} pointerEvents="none">
            <View style={screenStyles.centerBadgeIcon}>
              <LeftDoorwayMark
                size={22}
                archColor={T.white}
                innerColor={"rgba(255,246,232,0.10)"}
                baseColor={T.white}
                baseScale={0.5}
              />
            </View>
            <Text style={screenStyles.centerBadgeTitle}>YOU</Text>
            <Text style={screenStyles.centerBadgeSubtitle}>
              {isPubliclyVisible ? "Visible" : "Hidden"}
            </Text>
          </View>

          <View style={screenStyles.currentVenueChip} pointerEvents="none">
            <View style={screenStyles.currentVenuePin}>
              <Feather name="map-pin" size={14} color={T.white} />
            </View>
            <View style={screenStyles.currentVenueCopy}>
              <Text style={screenStyles.currentVenueChipText} numberOfLines={1}>
                You are here
              </Text>
              <Text style={screenStyles.currentVenueChipMeta}>
                {isPubliclyVisible ? displayVenueName : `${energyTitle} · ${intentTitle}`}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <Pressable
        onPress={onOpenSafety}
        style={({ pressed }) => [
          screenStyles.privacyNote,
          pressed && screenStyles.pressed,
        ]}
      >
        <Feather name="lock" size={16} color={T.textSecondary} />
        <Text style={screenStyles.privacyNoteInline}>
          {isPubliclyVisible
            ? "You are visible at this venue right now"
            : "Nearby venue details stay private until you go visible"}
        </Text>
      </Pressable>

      <View style={screenStyles.ctaBlock}>
        <Pressable
          onPress={primaryAction}
          style={({ pressed }) => [
            screenStyles.primaryCta,
            pressed && screenStyles.pressed,
          ]}
        >
          <LinearGradient
            colors={["#FFC94D", "#FFBE42", "#F4AE21"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={screenStyles.primaryCtaGradient}
          >
            <View style={screenStyles.primaryCtaIconWrap}>
              <LeftDoorwayMark
                size={22}
                archColor={T.primary}
                innerColor={"rgba(255,195,77,0.22)"}
                baseColor={T.primary}
                baseScale={0.52}
              />
            </View>
            <View style={screenStyles.primaryCtaCopy}>
              <Text style={screenStyles.primaryCtaLabel}>{primaryActionLabel}</Text>
              <Text style={screenStyles.primaryCtaSubtext}>
                {isPubliclyVisible ? "See who's nearby now" : "Let people discover you"}
              </Text>
            </View>
            {!isPubliclyVisible ? (
              <View style={screenStyles.primaryCtaSignal}>
                <View style={[screenStyles.primaryCtaSignalBar, { height: 6 }]} />
                <View style={[screenStyles.primaryCtaSignalBar, { height: 10 }]} />
                <View style={[screenStyles.primaryCtaSignalBar, { height: 14 }]} />
                <View style={[screenStyles.primaryCtaSignalBar, { height: 9 }]} />
              </View>
            ) : (
              <Feather name="arrow-right" size={18} color={T.primary} />
            )}
          </LinearGradient>
        </Pressable>
        <Text style={screenStyles.ctaFootnote}>{helperCopy}</Text>
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

const screenStyles = StyleSheet.create({
  page: {
    width: "100%",
    alignItems: "center",
    gap: 14,
  },
  headerRow: {
    width: "100%",
    maxWidth: 390,
    paddingHorizontal: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  venueIdentity: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
  },
  venueIdentityIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#DFA85A",
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  venueIdentityCopy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  venueName: {
    color: T.textPrimary,
    fontSize: 18,
    lineHeight: 22,
    fontFamily: T.fontBodyBold,
  },
  venueMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  venueMetaText: {
    color: T.primary,
    fontSize: 14,
    fontFamily: T.fontBodyMedium,
  },
  privacyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.82)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,107,74,0.10)",
  },
  titleBlock: {
    width: "100%",
    maxWidth: 390,
    gap: 10,
    alignItems: "flex-start",
  },
  heroTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#F4F6F2",
    borderWidth: 1,
    borderColor: "#E2E8E1",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusDotVisible: {
    backgroundColor: "#2E7D32",
  },
  statusDotHidden: {
    backgroundColor: "#FFC24D",
  },
  statusPillText: {
    color: T.textPrimary,
    fontSize: 14,
    fontFamily: T.fontBodyMedium,
  },
  heroTitle: {
    color: T.textPrimary,
    fontSize: 28,
    lineHeight: 34,
    fontFamily: T.fontDisplayBold,
    letterSpacing: -0.8,
  },
  heroSignalWrap: {
    marginTop: 3,
  },
  heroSubtitle: {
    color: T.textSecondary,
    fontSize: 15,
    lineHeight: 21,
    fontFamily: T.fontBody,
    maxWidth: 280,
  },
  insightRow: {
    width: "100%",
    flexDirection: "row",
    gap: 12,
  },
  insightCard: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(214,198,169,0.4)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    gap: 4,
  },
  insightLabel: {
    color: T.textMuted,
    fontSize: 12,
    lineHeight: 14,
    textTransform: "uppercase",
    fontFamily: T.fontBodyBold,
  },
  insightValue: {
    color: T.textPrimary,
    fontSize: 16,
    lineHeight: 20,
    fontFamily: T.fontBodyBold,
  },
  insightSubtext: {
    color: T.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: T.fontBody,
  },
  mapCard: {
    width: "100%",
    maxWidth: 390,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: "rgba(214,198,169,0.72)",
    backgroundColor: "rgba(255,252,247,0.92)",
    padding: 13,
    shadowColor: "#D8C3A3",
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 16 },
    elevation: 6,
  },
  mapFrame: {
    width: "100%",
    height: 364,
    borderRadius: 28,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FBF8F1",
  },
  mapbox: {
    ...StyleSheet.absoluteFillObject,
  },
  mapFallback: {
    ...StyleSheet.absoluteFillObject,
  },
  mapWarmWash: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.9,
  },
  mapPatchOne: {
    position: "absolute",
    top: 52,
    left: 30,
    width: 120,
    height: 84,
    borderRadius: 26,
    backgroundColor: "rgba(249,238,214,0.54)",
    transform: [{ rotate: "-14deg" }],
  },
  mapPatchTwo: {
    position: "absolute",
    right: 34,
    top: 92,
    width: 102,
    height: 68,
    borderRadius: 24,
    backgroundColor: "rgba(220,237,211,0.68)",
  },
  mapPatchThree: {
    position: "absolute",
    right: 44,
    bottom: 76,
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: "rgba(229,243,219,0.78)",
  },
  mapRoadHorizontal: {
    position: "absolute",
    left: -20,
    right: -20,
    top: 210,
    height: 26,
    borderRadius: 14,
    backgroundColor: "rgba(255,250,242,0.92)",
    borderWidth: 1,
    borderColor: "rgba(31,46,36,0.05)",
  },
  mapRoadVertical: {
    position: "absolute",
    top: 42,
    bottom: -20,
    left: 160,
    width: 24,
    borderRadius: 14,
    backgroundColor: "rgba(255,250,242,0.92)",
    borderWidth: 1,
    borderColor: "rgba(31,46,36,0.05)",
  },
  mapRoadDiagonal: {
    position: "absolute",
    left: 42,
    top: 132,
    width: 240,
    height: 22,
    borderRadius: 12,
    backgroundColor: "rgba(255,250,242,0.9)",
    borderWidth: 1,
    borderColor: "rgba(31,46,36,0.04)",
    transform: [{ rotate: "32deg" }],
  },
  ringOuter: {
    position: "absolute",
    width: 270,
    height: 270,
    borderRadius: 135,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(100,116,103,0.22)",
  },
  ringMid: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(100,116,103,0.18)",
  },
  ringInner: {
    position: "absolute",
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(255,194,77,0.35)",
  },
  ringLabel: {
    position: "absolute",
    color: T.textMuted,
    fontSize: 12,
    fontFamily: T.fontBodyMedium,
  },
  ringLabelOuter: {
    top: 66,
    right: 86,
  },
  ringLabelMid: {
    top: 102,
    right: 112,
  },
  ringLabelInner: {
    top: 138,
    right: 136,
  },
  centerVenueGlow: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,194,77,0.16)",
  },
  centerVenueBoundary: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 34,
    borderWidth: 1.6,
    borderColor: "#FFC24D",
    backgroundColor: "rgba(255,221,164,0.16)",
    transform: [{ rotate: "18deg" }],
  },
  venueMarker: {
    position: "absolute",
    width: 120,
    minHeight: 74,
  },
  venueMarkerHidden: {
    opacity: 0.78,
  },
  venueMarkerBadge: {
    position: "absolute",
    top: -6,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(214,198,169,0.52)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  venueMarkerBadgeText: {
    color: T.textPrimary,
    fontSize: 12,
    fontFamily: T.fontBodyBold,
  },
  venueMarkerPin: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1B4332",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1B4332",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  venueMarkerCopy: {
    marginTop: 8,
    gap: 2,
  },
  venueMarkerName: {
    color: T.textPrimary,
    fontSize: 13,
    lineHeight: 16,
    fontFamily: T.fontBodyMedium,
  },
  venueMarkerMeta: {
    color: T.primary,
    fontSize: 12,
    fontFamily: T.fontBodyMedium,
  },
  personPulse: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.98)",
    shadowColor: "#7A8E73",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  personPulseFeatured: {
    backgroundColor: "#F9FFF6",
  },
  personPulseHalo: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 999,
    backgroundColor: "rgba(106,138,102,0.16)",
    borderWidth: 1,
    borderColor: "rgba(106,138,102,0.18)",
  },
  centerBadge: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  centerBadgeIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: T.white,
    borderWidth: 5,
    borderColor: "rgba(255,252,247,0.96)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#D5B06D",
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  centerBadgeTitle: {
    color: T.textPrimary,
    fontSize: 13,
    fontFamily: T.fontBodyBold,
    letterSpacing: 0.8,
  },
  centerBadgeSubtitle: {
    color: T.textSecondary,
    fontSize: 13,
    fontFamily: T.fontBody,
  },
  currentVenueChip: {
    position: "absolute",
    bottom: 10,
    maxWidth: 186,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: "rgba(255,252,247,0.82)",
    borderWidth: 1,
    borderColor: "rgba(214,198,169,0.42)",
  },
  currentVenuePin: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F4AE21",
    alignItems: "center",
    justifyContent: "center",
  },
  currentVenueCopy: {
    flexShrink: 1,
    alignItems: "center",
  },
  currentVenueChipText: {
    flexShrink: 1,
    color: T.textPrimary,
    fontSize: 13,
    fontFamily: T.fontBodyMedium,
  },
  currentVenueChipMeta: {
    color: T.primary,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: T.fontBodyMedium,
  },
  primaryCta: {
    width: "100%",
    borderRadius: 18,
    overflow: "hidden",
  },
  ctaBlock: {
    width: "100%",
    maxWidth: 390,
    gap: 8,
  },
  primaryCtaGradient: {
    minHeight: 56,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 18,
  },
  primaryCtaIconWrap: {
    width: 32,
    alignItems: "center",
  },
  primaryCtaCopy: {
    flex: 1,
    gap: 2,
  },
  primaryCtaLabel: {
    color: T.primary,
    fontSize: 18,
    fontFamily: T.fontDisplayBold,
  },
  primaryCtaSubtext: {
    color: "rgba(31,46,36,0.84)",
    fontSize: 13,
    lineHeight: 17,
    fontFamily: T.fontBody,
  },
  primaryCtaSignal: {
    width: 28,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  primaryCtaSignalBar: {
    width: 3,
    borderRadius: 999,
    backgroundColor: T.white,
  },
  ctaFootnote: {
    color: T.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    fontFamily: T.fontBody,
  },
  privacyNote: {
    width: "100%",
    maxWidth: 390,
    minHeight: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.84)",
    borderWidth: 1,
    borderColor: "#EFE9DF",
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  privacyNoteInline: {
    color: T.textPrimary,
    fontSize: 13,
    lineHeight: 17,
    fontFamily: T.fontBodyMedium,
  },
  momentumCard: {
    width: "100%",
    maxWidth: 390,
    borderRadius: 24,
    backgroundColor: "rgba(255,252,247,0.92)",
    borderWidth: 1,
    borderColor: "rgba(214,198,169,0.44)",
    padding: 20,
    gap: 12,
  },
  momentumHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  momentumEyebrow: {
    color: T.textMuted,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1.1,
    fontFamily: T.fontBodyBold,
  },
  momentumDismiss: {
    color: T.accentBright,
    fontSize: 13,
    fontFamily: T.fontBodyBold,
  },
  momentumTitle: {
    color: T.textPrimary,
    fontSize: 20,
    lineHeight: 24,
    fontFamily: T.fontDisplayBold,
  },
  momentumBody: {
    color: T.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: T.fontBody,
  },
  momentumButton: {
    minHeight: 46,
    borderRadius: 16,
    backgroundColor: "rgba(53,102,77,0.08)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  momentumButtonLabel: {
    color: T.primary,
    fontSize: 15,
    fontFamily: T.fontBodyBold,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
