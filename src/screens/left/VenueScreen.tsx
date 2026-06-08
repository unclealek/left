import { Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { NearbyFeedItem, VenueContextSummary } from "../../types/left-domain";
import { formatIntent, formatRemaining } from "../../app/leftConfig";
import { styles } from "../../app/leftTheme";
import { GhostButton, PrimaryButton } from "../../components/left/ui";

const radarLayout = [
  { top: 80, left: 38, size: 68 },
  { top: 42, right: 58, size: 78 },
  { top: 178, left: 26, size: 56 },
  { top: 212, right: 34, size: 62 },
  { top: 126, left: 146, size: 72 },
] as const;

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
}) {
  const previewPeople = feed.slice(0, radarLayout.length);
  const signalPeople = previewPeople.slice(0, 4);
  const extraCount = Math.max(0, venue.visibleCount - previewPeople.length);
  const buttonLabel = sessionVisible ? "Open nearby feed" : "Become visible";
  const topIntent = venue.popularIntents[0] ? formatIntent(venue.popularIntents[0]) : "Open to chat";
  const pulseCopy = venue.pulseCopy?.trim() || "No one has surfaced yet.";
  const centerLabel = sessionVisible ? "Radar live" : "Private until visible";
  const centerCaption = sessionVisible
    ? `${venue.visibleCount} ${venue.visibleCount === 1 ? "person" : "people"} in range`
    : "Turn on visibility to light up the room.";
  const venueInitial = venue.venueName.trim().charAt(0).toUpperCase() || "L";

  return (
    <View style={styles.venuePage}>
      <LinearGradient colors={["#18131f", "#24182d", "#37223f"]} style={styles.venueHeroCardRadar}>
        <View style={styles.venueHeroEyebrowRow}>
          <Text style={styles.venueHeroEyebrowRadar}>Venue radar</Text>
          <View style={styles.venueStatusPillRadar}>
            <View style={[styles.venueStatusDotRadar, sessionVisible && styles.venueStatusDotRadarActive]} />
            <Text style={styles.venueStatusLabelRadar}>{sessionVisible ? "Visible now" : "Browsing quietly"}</Text>
          </View>
        </View>

        <View style={styles.venueRadarHeader}>
          <View style={styles.venueHeaderCopyRadar}>
            <Text style={styles.venueNameRadar} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.82}>
              {venue.venueName}
            </Text>
            <Text style={styles.venueVisibleCountRadar}>
              {venue.visibleCount} {venue.visibleCount === 1 ? "person" : "people"} visible nearby
            </Text>
            <Text style={styles.venuePulseCopyRadar}>{pulseCopy}</Text>
          </View>

          <View style={styles.venueHeaderMetaStack}>
            <View style={styles.venueEnergyPillRadar}>
              <Text style={styles.venueEnergyIconRadar}>⚡</Text>
              <Text style={styles.venueEnergyLabelRadar}>
                {venue.energyLevel.replaceAll("_", " ").toUpperCase()} ENERGY
              </Text>
            </View>
            <View style={styles.venueIntentBadge}>
              <Text style={styles.venueIntentBadgeLabel}>{topIntent}</Text>
            </View>
          </View>
        </View>

        {signalPeople.length > 0 ? (
          <View style={styles.venueSignalRow}>
            {signalPeople.map((item) => (
              <Pressable
                key={`signal-${item.profileUserId}`}
                onPress={() => onOpenProfile(item)}
                style={({ pressed }) => [styles.venueSignalCard, pressed && styles.venueBubblePressed]}
              >
                <View style={styles.venueSignalAvatarWrap}>
                  <LinearGradient colors={["#ff8fd9", "#b388ff"]} style={styles.venueSignalAvatarRing}>
                    <View style={styles.venueSignalAvatarInner}>
                      <Text style={styles.venueSignalAvatarGlyph}>{item.firstName.slice(0, 1)}</Text>
                    </View>
                  </LinearGradient>
                  <View style={styles.venueSignalOnlineDot} />
                </View>
                <Text style={styles.venueSignalName} numberOfLines={1}>
                  {item.firstName}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <View style={[styles.venueRadarStage, !sessionVisible && styles.venueRadarStagePrivate]}>
          <View style={styles.venueRadarGlow} />
          <View style={styles.venueRadarAuraOuter} />
          <View style={styles.venueRadarAuraInner} />
          <View style={styles.venueRadarRingOuter} />
          <View style={styles.venueRadarRingMid} />
          <View style={styles.venueRadarRingInner} />

          {previewPeople.length > 0 ? (
            <>
              {previewPeople.map((item, index) => {
                const layout = radarLayout[index];
                const pingStyle = {
                  top: layout.top,
                  left: "left" in layout ? layout.left : undefined,
                  right: "right" in layout ? layout.right : undefined,
                  width: layout.size,
                  height: layout.size,
                  borderRadius: layout.size / 2,
                } as const;

                return (
                  <Pressable
                    key={item.profileUserId}
                    onPress={() => onOpenProfile(item)}
                    style={({ pressed }) => [
                      styles.venueRadarPing,
                      pingStyle,
                      pressed && styles.venueBubblePressed,
                    ]}
                  >
                    <LinearGradient colors={["#ff8fd9", "#c89bff", "#f9f2ff"]} style={styles.venueRadarPingRing}>
                      <View style={styles.venueRadarPingInner}>
                        <Text style={styles.venueRadarPingGlyph}>
                          {item.firstName.slice(0, 1)}
                        </Text>
                      </View>
                    </LinearGradient>
                    <View style={styles.venueRadarPingPresence} />
                    <View style={styles.venueRadarPingLabelWrap}>
                      <Text style={styles.venueRadarPingLabel} numberOfLines={1}>
                        {item.firstName.slice(0, 1)}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
              {extraCount > 0 ? (
                <Pressable
                  onPress={onOpenFeed}
                  style={({ pressed }) => [styles.venueRadarCountBadge, pressed && styles.venueBubblePressed]}
                >
                  <Text style={styles.venueRadarCountBadgeLabel}>+{extraCount}</Text>
                </Pressable>
              ) : null}
            </>
          ) : (
            <View style={styles.venueRadarEmptyCard}>
              <Text style={styles.venueRadarEmptyTitle}>
                {venueHidden ? "Venue hidden" : sessionVisible ? "Quiet right now" : "Private until visible"}
              </Text>
              <Text style={styles.venueRadarEmptyBody}>
                {venueHidden
                  ? "This venue is hidden from discovery for now. You can manage that from Safety."
                  : sessionVisible
                    ? "You're visible. Stay put and the first nearby person will appear here."
                    : "Your venue and nearby people stay hidden until you turn on visibility."}
              </Text>
            </View>
          )}

          <View style={styles.venueRadarCenterWrap}>
            <LinearGradient colors={["rgba(255,170,222,0.95)", "rgba(200,155,255,0.92)"]} style={styles.venueRadarCenterRing}>
              <View style={styles.venueRadarCenterCore}>
                <Text style={styles.venueRadarCenterGlyph}>{venueInitial}</Text>
              </View>
            </LinearGradient>
            <Text style={styles.venueRadarCenterLabel}>{centerLabel}</Text>
            <Text style={styles.venueRadarCenterCaption}>{centerCaption}</Text>
          </View>
        </View>

        {sessionVisible && venue.activeVibes.length > 0 ? (
          <View style={styles.venueVibesSection}>
            <Text style={styles.venueSectionLabelRadar}>Active vibes here</Text>
            <View style={styles.venueVibesGrid}>
              {venue.activeVibes.map((vibe, index) => (
                <View key={vibe} style={[styles.venueVibePill, index === 0 ? styles.venueVibePillPrimary : styles.venueVibePillSecondary]}>
                  <View style={[styles.venueVibeDot, index === 0 ? styles.venueVibeDotPrimary : styles.venueVibeDotSecondary]} />
                  <Text style={[styles.venueVibeText, index === 0 ? styles.venueVibeTextPrimary : styles.venueVibeTextSecondary]}>{vibe}</Text>
                </View>
              ))}
              {venue.activeVibes.length < 3 ? (
                <View style={styles.venueVibePillMuted}>
                  <Text style={styles.venueVibeTextMuted}>Live Music</Text>
                </View>
              ) : null}
            </View>
          </View>
        ) : null}

        {previewPeople.length > 0 ? (
          <View style={styles.venuePreviewSection}>
            <View style={styles.venuePreviewHeader}>
              <Text style={styles.venueSectionLabelRadar}>People in the room</Text>
              <Pressable onPress={onOpenFeed} hitSlop={10}>
                <Text style={styles.venuePreviewLink}>See all</Text>
              </Pressable>
            </View>
            <View style={styles.venuePreviewList}>
              {previewPeople.slice(0, 3).map((item) => (
                <Pressable
                  key={`preview-${item.profileUserId}`}
                  onPress={() => onOpenProfile(item)}
                  style={({ pressed }) => [styles.venuePreviewCard, pressed && styles.venuePreviewCardPressed]}
                >
                  <View style={styles.venuePreviewAvatar}>
                    <Text style={styles.venuePreviewAvatarGlyph}>{item.firstName.slice(0, 1)}</Text>
                  </View>
                  <View style={styles.venuePreviewCopy}>
                    <Text style={styles.venuePreviewName}>{item.firstName}</Text>
                    <Text style={styles.venuePreviewMeta}>
                      {formatIntent(item.intent)} · {item.primaryVibe ?? "Open"}
                    </Text>
                  </View>
                  <Text style={styles.venuePreviewTime}>{formatRemaining(item.sessionDurationRemaining)}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

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
          <PrimaryButton label={buttonLabel} onPress={sessionVisible ? onOpenFeed : onActivate} />
        </View>
      </LinearGradient>
      {allowVenueActions && canChooseVenue ? <GhostButton label="Choose a different nearby venue" onPress={onChooseVenue} /> : null}
      {allowVenueActions ? <GhostButton label="Can't find your venue? Add +" onPress={onAddVenue} /> : null}
    </View>
  );
}
