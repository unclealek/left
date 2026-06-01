import { Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { NearbyFeedItem, VenueContextSummary } from "../../types/left-domain";
import { formatIntent, formatRemaining } from "../../app/leftConfig";
import { styles } from "../../app/leftTheme";
import { GhostButton, PrimaryButton } from "../../components/left/ui";

const bubbleLayout = [
  { top: 108, left: 168, size: 106, featured: true, glow: "#9f94ff" },
  { top: 42, left: 40, size: 72, featured: false, glow: "#6559d8" },
  { top: 22, right: 58, size: 84, featured: false, glow: "#31d7bf" },
  { top: 156, left: 24, size: 58, featured: false, glow: "#2ec9ff" },
  { top: 148, right: 70, size: 66, featured: false, glow: "#5f5cff" },
] as const;

export function VenueScreen({
  venue,
  feed,
  socialMomentum,
  sessionVisible,
  venueHidden,
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
  canChooseVenue: boolean;
  onActivate: () => void;
  onOpenFeed: () => void;
  onOpenProfile: (item: NearbyFeedItem) => void;
  onSocialMomentumPrimary: () => void;
  onDismissSocialMomentum: () => void;
  onChooseVenue: () => void;
  onAddVenue: () => void;
}) {
  const previewPeople = feed.slice(0, bubbleLayout.length);
  const extraCount = Math.max(0, venue.visibleCount - previewPeople.length);
  const buttonLabel = sessionVisible ? "Open nearby feed" : "Become visible";
  const topIntent = venue.popularIntents[0] ? formatIntent(venue.popularIntents[0]) : "Open to chat";
  const pulseCopy = venue.pulseCopy?.trim() || "No one has surfaced yet.";

  return (
    <View style={styles.venuePage}>
      <LinearGradient colors={["#12111b", "#0e0d15", "#0a0911"]} style={styles.venueHeroCard}>
        <View style={styles.venueHeroEyebrowRow}>
          <Text style={styles.venueHeroEyebrow}>Venue home</Text>
          <View style={styles.venueStatusPill}>
            <View style={[styles.venueStatusDot, sessionVisible && styles.venueStatusDotActive]} />
            <Text style={styles.venueStatusLabel}>{sessionVisible ? "Visible now" : "Browsing quietly"}</Text>
          </View>
        </View>
        <View style={styles.venueHeaderRow}>
          <View style={styles.venueHeaderCopy}>
            <Text style={styles.venueName} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.82}>
              {venue.venueName}
            </Text>
            <Text style={styles.venueVisibleCount}>
              {venue.visibleCount} {venue.visibleCount === 1 ? "person" : "people"} visible
            </Text>
            <Text style={styles.venuePulseCopy}>{pulseCopy}</Text>
          </View>
          <View style={styles.venueEnergyPill}>
            <Text style={styles.venueEnergyIcon}>⚡</Text>
            <Text style={styles.venueEnergyLabel}>{venue.energyLevel.replaceAll("_", " ").toUpperCase()} ENERGY</Text>
          </View>
        </View>

        <View style={styles.venueStatsRow}>
          <View style={styles.venueStatCard}>
            <Text style={styles.venueStatValue}>{venue.visibleCount}</Text>
            <Text style={styles.venueStatLabel}>visible now</Text>
          </View>
          <View style={styles.venueStatCard}>
            <Text style={styles.venueStatValue}>{venue.activeVibes.length}</Text>
            <Text style={styles.venueStatLabel}>active vibes</Text>
          </View>
          <View style={styles.venueStatCard}>
            <Text style={styles.venueStatValue} numberOfLines={1}>
              {topIntent}
            </Text>
            <Text style={styles.venueStatLabel}>top intent</Text>
          </View>
        </View>

        <View style={styles.venueClusterArea}>
          <View style={styles.venueClusterGlow} />
          {previewPeople.length > 0 ? (
            <>
              {previewPeople.map((item, index) => {
                const layout = bubbleLayout[index];
                const bubbleStyle = {
                  top: layout.top,
                  left: "left" in layout ? layout.left : undefined,
                  right: "right" in layout ? layout.right : undefined,
                  width: layout.size,
                  height: layout.size,
                  borderRadius: layout.size / 2,
                  shadowColor: layout.glow,
                } as const;

                return (
                  <Pressable
                    key={item.profileUserId}
                    onPress={() => onOpenProfile(item)}
                    style={({ pressed }) => [
                      styles.venueBubble,
                      layout.featured ? styles.venueBubbleFeatured : styles.venueBubbleStandard,
                      bubbleStyle,
                      pressed && styles.venueBubblePressed,
                    ]}
                  >
                    <LinearGradient
                      colors={layout.featured ? ["#26153a", "#121826", "#090911"] : ["#101322", "#0c0f1a", "#090910"]}
                      style={styles.venueBubbleInner}
                    >
                      <Text style={[styles.venueBubbleGlyph, layout.featured && styles.venueBubbleGlyphFeatured]}>
                        {item.firstName.slice(0, 1)}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                );
              })}
              {extraCount > 0 ? (
                <Pressable onPress={onOpenFeed} style={({ pressed }) => [styles.venueCountBubble, pressed && styles.venueBubblePressed]}>
                  <Text style={styles.venueCountBubbleLabel}>+{extraCount}</Text>
                </Pressable>
              ) : null}
            </>
          ) : (
            <View style={styles.venueEmptyClusterCard}>
              <Text style={styles.venueEmptyClusterTitle}>{venueHidden ? "Venue hidden" : "Quiet right now"}</Text>
              <Text style={styles.venueEmptyClusterBody}>
                {venueHidden
                  ? "This venue is hidden from discovery for now. You can manage that from Safety."
                  : sessionVisible
                    ? "You're visible. Stay put and the first nearby person will appear here."
                    : "Turn on visibility when you want to surface in the room and start seeing real nearby people."}
              </Text>
            </View>
          )}
          <Text style={styles.venueClusterHint}>
            {previewPeople.length > 0 ? "Tap a bubble to explore" : venueHidden ? "You're hidden at this venue" : venue.pulseCopy ?? "No pulse yet."}
          </Text>
        </View>

        <View style={styles.venueVibesSection}>
          <Text style={styles.venueSectionLabel}>Active vibes here</Text>
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

        {previewPeople.length > 0 ? (
          <View style={styles.venuePreviewSection}>
            <View style={styles.venuePreviewHeader}>
              <Text style={styles.venueSectionLabel}>People in the room</Text>
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
      {canChooseVenue ? <GhostButton label="Choose a different nearby venue" onPress={onChooseVenue} /> : null}
      <GhostButton label="Can't find your venue? Add +" onPress={onAddVenue} />
    </View>
  );
}
