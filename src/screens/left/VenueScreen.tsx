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
import { BrandPrimaryButton, GhostButton } from "../../components/left/ui";
import { LeftDoorwayMark } from "../../components/left/LeftDoorwayMark";
import { MAPBOX_ENABLED } from "../../lib/mapbox";

const STAGE_SIZE = 350;
const STAGE_CENTER = STAGE_SIZE / 2;
const PERSON_RING_RADII = [72, 106, 136] as const;
const PERSON_ANGLES = [18, 58, 102, 138, 198, 236, 286, 332] as const;
const VENUE_SLOT_ANGLES = [315, 225, 160, 20] as const;
const VENUE_SLOT_RADII = [106, 106, 92, 92] as const;
const MAX_DISPLAY_DISTANCE_METERS = 150;

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

function getVenueMarkerIcon(name: string): keyof typeof Feather.glyphMap {
  const value = name.toLowerCase();
  if (value.includes("cafe") || value.includes("coffee")) return "coffee";
  if (value.includes("bar")) return "circle";
  if (value.includes("gym") || value.includes("studio")) return "activity";
  if (value.includes("gift") || value.includes("shop") || value.includes("boutique")) return "gift";
  if (value.includes("press") || value.includes("library")) return "book-open";
  return "map-pin";
}

function getIntentIcon(intent: string): keyof typeof Feather.glyphMap {
  const value = intent.toLowerCase();
  if (value.includes("conversation") || value.includes("group")) return "message-circle";
  if (value.includes("network")) return "users";
  if (value.includes("study") || value.includes("focus")) return "book-open";
  return "message-circle";
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
  const intentTitle = useMemo(() => {
    const raw = formatIntent(venue.popularIntents[0] ?? "open_to_conversation");
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }, [venue.popularIntents]);
  const intentSubtext = isPubliclyVisible ? "Most common here" : "Likely nearby";
  const currentVenueSummary = `${energyTitle} · ${getCompactIntentLabel(intentTitle)}`;
  const primaryActionLabel = isPubliclyVisible ? "Open Nearby Feed" : "Go Visible";
  const primaryAction = isPubliclyVisible ? onOpenFeed : onActivate;
  const showPrimaryCta = !isPubliclyVisible || !socialMomentum;
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
                Venue Radar
              </Text>
              <Animated.View style={[screenStyles.heroSignalWrap, pulseIconStyle]}>
                <Feather name="radio" size={18} color={"#5D9A7B"} />
              </Animated.View>
            </View>
          </View>
          <View style={screenStyles.statusActionPill}>
            <View style={screenStyles.compactStatusPill}>
              <Feather
                name={isPubliclyVisible ? "eye" : "eye-off"}
                size={17}
                color={isPubliclyVisible ? T.primary : "#35664D"}
              />
              <Text style={screenStyles.compactStatusLabel}>{statusLabel}</Text>
            </View>
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
              <Feather name="shield" size={18} color={T.primary} />
            </Pressable>
          </View>
        </View>
        <Text style={screenStyles.heroSubtitle} maxFontSizeMultiplier={1.3}>
          {isPubliclyVisible
            ? "See who's around while you stay visible."
            : confidenceCopy}
        </Text>
        <View style={screenStyles.insightRow}>
          <View style={screenStyles.insightCard}>
            <Text style={screenStyles.insightLabel} maxFontSizeMultiplier={1.1}>
              Energy
            </Text>
            <View style={screenStyles.insightValueRow}>
              <View style={screenStyles.insightIconBubble}>
                <Feather name="wind" size={24} color={T.primary} />
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
              <View style={screenStyles.insightIconBubble}>
                <Feather name={getIntentIcon(intentTitle)} size={23} color={T.primary} />
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

          <View style={screenStyles.centerVenueGlow} pointerEvents="none" />
          <View style={screenStyles.centerVenueBoundary} pointerEvents="none" />

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
                <Feather
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
                  <Feather
                    name="user"
                    size={featured ? 17 : 15}
                    color={T.primary}
                  />
                </Pressable>
              ))
            : null}

          <View style={screenStyles.centerBadge} pointerEvents="none">
            <LeftDoorwayMark
              size={22}
              archColor={isPubliclyVisible ? T.accent : T.primary}
              innerColor={"rgba(255,252,247,0.98)"}
              baseColor={isPubliclyVisible ? T.accent : T.primary}
              baseScale={0.52}
            />
            <Text style={screenStyles.centerBadgeSubtitle}>
              {isPubliclyVisible ? "Visible" : "Hidden"}
            </Text>
          </View>

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
              <Feather name="map-pin" size={18} color={T.primary} />
            </View>
            <View style={screenStyles.currentVenueCopy}>
              <Text style={screenStyles.currentVenueChipText} numberOfLines={1}>
                You are here
              </Text>
              <Text style={screenStyles.currentVenueChipMeta} numberOfLines={1}>
                {currentVenueSummary}
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color={T.textPrimary} />
          </Pressable>
        </View>
      </View>

      {showPrimaryCta ? (
        <View style={screenStyles.ctaBlock}>
          <BrandPrimaryButton
            label={primaryActionLabel}
            subtitle={isPubliclyVisible ? "See who's nearby now" : "Let people discover you"}
            onPress={primaryAction}
            size="hero"
            trailingIcon="arrow"
          />
          <Text style={screenStyles.ctaFootnote}>{helperCopy}</Text>
        </View>
      ) : null}

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
    gap: 16,
  },
  titleBlock: {
    width: "100%",
    maxWidth: 390,
    gap: 12,
  },
  headerRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    paddingRight: 4,
  },
  statusActionPill: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
    borderRadius: 999,
    backgroundColor: "rgba(255,252,247,0.96)",
    borderWidth: 1,
    borderColor: "rgba(226,212,190,0.9)",
    paddingLeft: 4,
    paddingRight: 1,
    paddingVertical: 2,
    gap: 2,
  },
  compactStatusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingLeft: 7,
    paddingRight: 8,
    paddingVertical: 6,
  },
  compactStatusLabel: {
    color: T.textPrimary,
    fontSize: 13,
    lineHeight: 17,
    fontFamily: T.fontBodyMedium,
  },
  statusActionDivider: {
    width: 1,
    height: 20,
    backgroundColor: "rgba(214,198,169,0.46)",
    marginVertical: 0,
  },
  compactPrivacyButton: {
    width: 34,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  heroTitle: {
    flexShrink: 1,
    color: T.textPrimary,
    fontSize: 26,
    lineHeight: 31,
    fontFamily: T.fontDisplayBold,
    letterSpacing: -0.7,
  },
  heroSignalWrap: {
    marginTop: 2,
  },
  heroSubtitle: {
    color: "rgba(31,46,36,0.82)",
    fontSize: 15,
    lineHeight: 22,
    fontFamily: T.fontBody,
    maxWidth: 360,
  },
  insightRow: {
    width: "100%",
    flexDirection: "row",
    gap: 14,
  },
  insightCard: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: "rgba(255,252,247,0.96)",
    borderWidth: 1,
    borderColor: "rgba(214,198,169,0.34)",
    paddingHorizontal: 14,
    paddingVertical: 18,
    shadowColor: "#DBC6A7",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
    gap: 14,
  },
  insightLabel: {
    color: "rgba(31,46,36,0.56)",
    fontSize: 10,
    lineHeight: 14,
    textTransform: "uppercase",
    fontFamily: T.fontBodyBold,
    letterSpacing: 2,
  },
  insightValueRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  insightIconBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(233,236,206,0.72)",
    alignItems: "center",
    justifyContent: "center",
  },
  insightTitle: {
    color: T.textPrimary,
    flex: 1,
    flexShrink: 1,
    fontSize: 12.5,
    lineHeight: 16,
    fontFamily: T.fontBodyBold,
  },
  insightSubtext: {
    color: "rgba(31,46,36,0.7)",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: T.fontBody,
  },
  mapCard: {
    width: "100%",
    maxWidth: 390,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(214,198,169,0.34)",
    backgroundColor: "rgba(255,252,247,0.98)",
    padding: 8,
    shadowColor: "#DBC6A7",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  mapFrame: {
    width: "100%",
    height: 438,
    borderRadius: 24,
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
    opacity: 0.58,
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
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(103,128,113,0.14)",
  },
  ringMid: {
    position: "absolute",
    width: 204,
    height: 204,
    borderRadius: 102,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(103,128,113,0.14)",
  },
  ringInner: {
    position: "absolute",
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(255,194,77,0.18)",
  },
  centerVenueGlow: {
    position: "absolute",
    width: 146,
    height: 146,
    borderRadius: 73,
    backgroundColor: "rgba(255,194,77,0.07)",
  },
  centerVenueBoundary: {
    position: "absolute",
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1,
    borderColor: "rgba(255,194,77,0.58)",
    backgroundColor: "rgba(255,221,164,0.06)",
  },
  venueMarker: {
    position: "absolute",
    width: 74,
    minHeight: 48,
    alignItems: "center",
  },
  venueMarkerHidden: {
    opacity: 0.78,
  },
  venueMarkerPin: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#1B4332",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1B4332",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  venueMarkerCopy: {
    marginTop: 6,
    alignItems: "center",
  },
  venueMarkerName: {
    color: T.textPrimary,
    fontSize: 10.5,
    lineHeight: 13,
    fontFamily: T.fontBodyMedium,
    textAlign: "center",
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
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "rgba(255,252,247,0.98)",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    shadowColor: "#DBC6A7",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  centerBadgeSubtitle: {
    color: T.textSecondary,
    fontSize: 10,
    lineHeight: 12,
    fontFamily: T.fontBody,
    textAlign: "center",
  },
  currentVenueChip: {
    position: "absolute",
    left: 42,
    right: 42,
    bottom: 66,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 22,
    backgroundColor: "rgba(255,252,247,0.98)",
    borderWidth: 1,
    borderColor: "rgba(214,198,169,0.34)",
    shadowColor: "#DBC6A7",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  currentVenuePin: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(233,236,206,0.78)",
    alignItems: "center",
    justifyContent: "center",
  },
  currentVenueCopy: {
    flex: 1,
    alignItems: "flex-start",
    gap: 1,
  },
  currentVenueChipText: {
    color: T.textPrimary,
    fontSize: 14,
    lineHeight: 18,
    fontFamily: T.fontBodyMedium,
  },
  currentVenueChipMeta: {
    color: T.primary,
    fontSize: 13,
    lineHeight: 17,
    fontFamily: T.fontBodyMedium,
  },
  ctaBlock: {
    width: "100%",
    maxWidth: 390,
    gap: 8,
  },
  ctaFootnote: {
    color: T.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    fontFamily: T.fontBody,
  },
  momentumCard: {
    width: "100%",
    maxWidth: 390,
    borderRadius: 22,
    backgroundColor: "rgba(255,252,247,0.92)",
    borderWidth: 1,
    borderColor: "rgba(214,198,169,0.44)",
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 10,
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
    fontSize: 18,
    lineHeight: 22,
    fontFamily: T.fontDisplayBold,
  },
  momentumBody: {
    color: T.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: T.fontBody,
  },
  momentumButton: {
    minHeight: 44,
    borderRadius: 15,
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
