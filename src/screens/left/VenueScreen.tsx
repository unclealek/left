import { Feather } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { NearbyFeedItem, VenueContextSummary } from "../../types/left-domain";
import { formatIntent } from "../../app/leftConfig";
import { styles, T } from "../../app/leftTheme";
import { GhostButton } from "../../components/left/ui";

const RADAR_STAGE_SIZE = 332;
const RADAR_CENTER = RADAR_STAGE_SIZE / 2;
const RADAR_RINGS = [126, 92, 62] as const;
const RADAR_ANGLES = [18, 58, 98, 142, 188, 228, 270, 314, 344, 122, 248, 36] as const;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function buildRadarPlacements(feed: NearbyFeedItem[]) {
  return feed.slice(0, RADAR_ANGLES.length).map((item, index) => {
    const ringRadius = RADAR_RINGS[index % RADAR_RINGS.length];
    const angle = RADAR_ANGLES[index];
    const size = index < 3 ? 48 : index < 8 ? 42 : 36;
    const radians = toRadians(angle);
    const x = RADAR_CENTER + Math.cos(radians) * ringRadius - size / 2;
    const y = RADAR_CENTER + Math.sin(radians) * ringRadius - size / 2;

    return {
      item,
      style: {
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: size / 2,
      } as const,
    };
  });
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
}) {
  const sweepRotation = useRef(new Animated.Value(0)).current;
  const pingPulse = useRef(new Animated.Value(0)).current;
  const chargePulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(sweepRotation, {
        toValue: 1,
        duration: 5200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [sweepRotation]);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pingPulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pingPulse, {
          toValue: 0,
          duration: 1400,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pingPulse]);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(chargePulse, {
        toValue: 1,
        duration: 2400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [chargePulse]);

  const sweepRotate = sweepRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  const pulseScale = pingPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.26],
  });
  const pulseOpacity = pingPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.28, 0],
  });
  const chargeScaleA = chargePulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.22, 1.92],
  });
  const chargeOpacityA = chargePulse.interpolate({
    inputRange: [0, 0.58, 1],
    outputRange: [0.36, 0.14, 0],
  });
  const chargeScaleB = chargePulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.12, 1.52],
  });
  const chargeOpacityB = chargePulse.interpolate({
    inputRange: [0, 0.44, 1],
    outputRange: [0, 0.24, 0],
  });
  const radarPeople = buildRadarPlacements(feed);
  const nearbyCount = Math.max(venue.visibleCount, feed.length);
  const buttonLabel = sessionVisible ? "Open nearby feed" : "Confirm venue";
  const pulseCopy = venue.pulseCopy?.trim() || "No one has surfaced yet.";
  const centerLabel = sessionVisible ? "Radar live" : "You're invisible";
  const centerCaption = sessionVisible
    ? `${venue.visibleCount} ${venue.visibleCount === 1 ? "person" : "people"} in range`
    : "Nobody can see you yet.";
  const privateHelper = "Confirm where you are before going visible. Nobody can see you yet.";
  const privacyFootnote = "Your location stays private. Only nearby people will be shown.";
  const showRadarPeople = radarPeople.length > 0;
  const showEmptyRadarCard = sessionVisible && radarPeople.length === 0;
  return (
    <View style={styles.venuePage}>
      <View style={styles.venuePageHeaderStack}>
        <View style={styles.venuePageBrandRow}>
          <View />
          <Pressable onPress={onOpenSafety} style={({ pressed }) => [styles.venueHeaderUtilityBadge, pressed && styles.venueBubblePressed]}>
            <Feather name="shield" size={18} color={T.accentBright} />
          </Pressable>
        </View>

        <View style={styles.venuePageTopRow}>
          <Text style={styles.venueHeroEyebrowRadar}>Venue radar</Text>
          <View style={styles.venueStatusPillRadar}>
            <View style={[styles.venueStatusDotRadar, sessionVisible && styles.venueStatusDotRadarActive]} />
            <Text style={styles.venueStatusLabelRadar}>{sessionVisible ? "Visible now" : "Browsing quietly"}</Text>
          </View>
        </View>
      </View>

      <View style={styles.venueMainStack}>
        <View style={styles.venueRadarSection}>
          {sessionVisible ? (
            <View style={styles.venueRadarHeader}>
              <View style={styles.venueHeaderCopyRadarCentered}>
                <Text style={styles.venueNameRadar} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.82}>
                  {venue.venueName}
                </Text>
                <Text style={styles.venueVisibleCountRadar}>
                  {`${venue.visibleCount} ${venue.visibleCount === 1 ? "person" : "people"} visible nearby`}
                </Text>
              </View>
            </View>
          ) : null}

          <View style={[styles.venueRadarStage, !sessionVisible && styles.venueRadarStagePrivate]}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.venueRadarSweepWrap,
              {
                transform: [{ rotate: sweepRotate }],
              },
            ]}
          >
            <View style={styles.venueRadarSweep} />
          </Animated.View>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.venueRadarChargeRing,
              {
                opacity: chargeOpacityA,
                transform: [{ scale: chargeScaleA }],
              },
            ]}
          />
          <Animated.View
            pointerEvents="none"
            style={[
              styles.venueRadarChargeRingSecondary,
              {
                opacity: chargeOpacityB,
                transform: [{ scale: chargeScaleB }],
              },
            ]}
          />
          <View style={styles.venueRadarGlow} />
          <View style={styles.venueRadarAuraOuter} />
          <View style={styles.venueRadarAuraInner} />
          <View style={styles.venueRadarRingOuter} />
          <View style={styles.venueRadarRingMid} />
          <View style={styles.venueRadarRingInner} />

          {showRadarPeople ? (
            <>
              {radarPeople.map(({ item, style }, index) => {
                return (
                  <Pressable
                    key={item.profileUserId}
                    onPress={() => onOpenProfile(item)}
                    style={({ pressed }) => [
                      styles.venueRadarPing,
                      style,
                      index < 3 && styles.venueRadarPingFeatured,
                      !sessionVisible && styles.venueRadarPingMuted,
                      pressed && styles.venueBubblePressed,
                    ]}
                  >
                    {index < 4 ? (
                      <Animated.View
                        pointerEvents="none"
                        style={[
                          styles.venueRadarPingPulse,
                          {
                            opacity: pulseOpacity,
                            transform: [{ scale: pulseScale }],
                          },
                        ]}
                      />
                    ) : null}
                    <LinearGradient colors={sessionVisible ? ["#D88A70", "#E8B9A7", "#ffffff"] : ["#F3E7DA", "#FCF8F0", "#ffffff"]} style={styles.venueRadarPingRing}>
                      <View style={styles.venueRadarPingInner}>
                        <Feather name="user" size={index < 3 ? 22 : 18} color={T.textMuted} />
                      </View>
                    </LinearGradient>
                    <View style={styles.venueRadarPingPresenceSoft} />
                  </Pressable>
                );
              })}
              {!sessionVisible ? (
                <>
                  <View style={[styles.venueRadarSignalDot, styles.venueRadarSignalDotA]} />
                  <View style={[styles.venueRadarSignalDot, styles.venueRadarSignalDotB]} />
                  <View style={[styles.venueRadarSignalDot, styles.venueRadarSignalDotC]} />
                </>
              ) : null}
            </>
          ) : showEmptyRadarCard ? (
            <View style={styles.venueRadarEmptyCard}>
              <Text style={styles.venueRadarEmptyTitle}>
                {venueHidden ? "Venue hidden" : "Quiet right now"}
              </Text>
              <Text style={styles.venueRadarEmptyBody}>
                {venueHidden
                  ? "This venue is hidden from discovery for now. You can manage that from Safety."
                  : "You're visible. Stay put and the first nearby person will appear here."}
              </Text>
            </View>
          ) : null}

          <View style={styles.venueRadarCenterWrap}>
            <LinearGradient colors={["rgba(201,106,74,0.98)", "rgba(201,106,74,0.74)"]} style={styles.venueRadarCenterRing}>
              <View style={styles.venueRadarCenterCore}>
                <View style={styles.venueRadarCenterHalo} />
                <View style={styles.venueRadarCenterLogoWrap}>
                  <Text style={styles.venueRadarCenterLogoChevron}>{"<"}</Text>
                  <View style={styles.venueRadarCenterLogoDot} />
                </View>
              </View>
            </LinearGradient>
          </View>
          </View>

          {sessionVisible ? (
            <View style={styles.venueRadarCaptionBlock}>
              <Text style={styles.venueRadarCenterLabel}>{centerLabel}</Text>
              <Text style={styles.venueRadarCenterCaption}>{centerCaption}</Text>
            </View>
          ) : null}
        </View>

        {sessionVisible ? (
          <View style={styles.venuePageSupportStack}>
            <View style={styles.venueRadarInfoRow}>
              <View style={styles.venueRadarInfoPill}>
                <Text style={styles.venueRadarInfoLabel}>Energy</Text>
                <Text style={styles.venueRadarInfoValue}>
                  {venue.energyLevel.replaceAll("_", " ")}
                </Text>
              </View>
              <View style={styles.venueRadarInfoPill}>
                <Text style={styles.venueRadarInfoLabel}>Top intent</Text>
                <Text style={styles.venueRadarInfoValue}>
                  {venue.popularIntents[0] ? formatIntent(venue.popularIntents[0]) : "Open to chat"}
                </Text>
              </View>
            </View>

            {venue.activeVibes.length > 0 ? (
              <View style={styles.venueVibesSectionRadar}>
                {venue.activeVibes.slice(0, 4).map((vibe) => (
                  <View key={vibe} style={styles.venueVibeChipRadar}>
                    <Text style={styles.venueVibeChipRadarText}>{vibe}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            <Text style={styles.venuePulseCopyRadarCentered}>{pulseCopy}</Text>
          </View>
        ) : (
          <View style={styles.venuePrivateStateStack}>
            <View style={styles.venueNearbyCard}>
              <View style={styles.venueNearbyCardIconWrap}>
                <Feather name="users" size={19} color={T.accentBright} />
              </View>
              <View style={styles.venueNearbyCardCopy}>
                <Text style={styles.venueNearbyCardTitle}>
                  {nearbyCount > 0 ? `${nearbyCount} ${nearbyCount === 1 ? "person" : "people"} nearby` : "Nobody nearby yet"}
                </Text>
                <Text style={styles.venueNearbyCardBody}>Start visibility to see who is around you.</Text>
              </View>
              <View style={styles.venueNearbyCardLockWrap}>
                <Feather name="lock" size={16} color={T.accentBright} />
              </View>
            </View>
            <View style={styles.venueRadarCaptionBlockPrivate}>
              <Text style={styles.venueRadarCenterLabel}>{centerLabel}</Text>
              <Text style={styles.venueRadarCenterCaption}>{centerCaption}</Text>
            </View>
            <Text style={styles.venuePrivateHelperText}>{privateHelper}</Text>
          </View>
        )}
      </View>

      {socialMomentum ? (
        <View style={styles.momentumCard}>
          <View style={styles.momentumHeaderRow}>
            <Text style={styles.momentumEyebrow}>Social momentum</Text>
            <Pressable onPress={onDismissSocialMomentum} hitSlop={10}>
              <Text style={styles.momentumDismiss}>Not now</Text>
            </Pressable>
          </View>
          <Text style={styles.momentumTitle}>{socialMomentum.title}</Text>
          <Text style={styles.momentumBody}>{socialMomentum.body}</Text>
          <View style={styles.momentumActions}>
            <Pressable onPress={onSocialMomentumPrimary} style={({ pressed }) => [styles.momentumPrimaryButton, pressed && styles.venueBubblePressed]}>
              <Text style={styles.momentumPrimaryLabel}>{socialMomentum.primaryLabel}</Text>
            </Pressable>
            <Pressable onPress={onDismissSocialMomentum} style={({ pressed }) => [styles.momentumGhostButton, pressed && styles.venueBubblePressed]}>
              <Text style={styles.momentumGhostLabel}>Stay low-key</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <View style={styles.venueActions}>
        <Pressable onPress={sessionVisible ? onOpenFeed : onActivate} style={({ pressed }) => [styles.venuePrimaryAction, pressed && styles.primaryBtnPressed]}>
          <Text style={styles.venuePrimaryActionLabel}>{buttonLabel}</Text>
        </Pressable>
        {!sessionVisible ? (
          <View style={styles.venuePrivacyNote}>
            <Feather name="shield" size={16} color={T.accentBright} />
            <Text style={styles.venuePrivacyNoteText}>{privacyFootnote}</Text>
          </View>
        ) : null}
      </View>
      {allowVenueActions && canChooseVenue ? <GhostButton label="Choose a different nearby venue" onPress={onChooseVenue} /> : null}
      {allowVenueActions ? <GhostButton label="Can't find your venue? Add +" onPress={onAddVenue} /> : null}
    </View>
  );
}
