import { Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { NearbyFeedItem, VenueContextSummary } from "../../types/left-domain";
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
  sessionVisible,
  venueHidden,
  canChooseVenue,
  onActivate,
  onOpenFeed,
  onOpenProfile,
  onChooseVenue,
  onAddVenue,
}: {
  venue: VenueContextSummary;
  feed: NearbyFeedItem[];
  sessionVisible: boolean;
  venueHidden: boolean;
  canChooseVenue: boolean;
  onActivate: () => void;
  onOpenFeed: () => void;
  onOpenProfile: (item: NearbyFeedItem) => void;
  onChooseVenue: () => void;
  onAddVenue: () => void;
}) {
  const previewPeople = feed.slice(0, bubbleLayout.length);
  const extraCount = Math.max(0, venue.visibleCount - previewPeople.length);
  const buttonLabel = sessionVisible ? "Open nearby feed" : "Become visible";

  return (
    <View style={styles.venuePage}>
      <LinearGradient colors={["#12111b", "#0e0d15", "#0a0911"]} style={styles.venueHeroCard}>
        <View style={styles.venueHeaderRow}>
          <View style={styles.venueHeaderCopy}>
            <Text style={styles.venueName}>{venue.venueName}</Text>
            <Text style={styles.venueVisibleCount}>
              {venue.visibleCount} {venue.visibleCount === 1 ? "person" : "people"} visible
            </Text>
          </View>
          <View style={styles.venueEnergyPill}>
            <Text style={styles.venueEnergyIcon}>⚡</Text>
            <Text style={styles.venueEnergyLabel}>{venue.energyLevel.replaceAll("_", " ").toUpperCase()} ENERGY</Text>
          </View>
        </View>

        <View style={styles.venueClusterArea}>
          <View style={styles.venueClusterGlow} />
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

        <View style={styles.venueActions}>
          <PrimaryButton label={buttonLabel} onPress={sessionVisible ? onOpenFeed : onActivate} />
        </View>
      </LinearGradient>
      {canChooseVenue ? <GhostButton label="Choose a different nearby venue" onPress={onChooseVenue} /> : null}
      <GhostButton label="Can't find your venue? Add +" onPress={onAddVenue} />
    </View>
  );
}
