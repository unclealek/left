import { Text, View } from "react-native";
import type { VenueContextSummary } from "../../types/left-domain";
import { styles } from "../../app/leftTheme";
import { Chip, EnergyPill, PrimaryButton } from "../../components/left/ui";

export function VenueScreen({
  venue,
  sessionVisible,
  venueHidden,
  onActivate,
  onOpenFeed,
}: {
  venue: VenueContextSummary;
  sessionVisible: boolean;
  venueHidden: boolean;
  onActivate: () => void;
  onOpenFeed: () => void;
}) {
  return (
    <View style={styles.venuePage}>
      <View style={styles.venueHeader}>
        <Text style={styles.venueName}>{venue.venueName}</Text>
        <View style={styles.venueMeta}>
          <EnergyPill level={venue.energyLevel} />
          <View style={styles.visibleBadge}>
            <View style={[styles.pulseDot, sessionVisible && styles.pulseDotActive]} />
            <Text style={styles.visibleBadgeLabel}>{venue.visibleCount} visible</Text>
          </View>
        </View>
      </View>
      <Text style={styles.venuePulse}>
        {venueHidden ? "You're hidden at this venue." : venue.pulseCopy ?? "No pulse yet."}
      </Text>
      <View style={styles.vibeRow}>
        {venue.activeVibes.map((vibe) => <Chip key={vibe} label={vibe} />)}
      </View>
      <View style={styles.venueActions}>
        {!sessionVisible ? (
          <PrimaryButton label="Become visible" onPress={onActivate} />
        ) : (
          <PrimaryButton label="Open nearby feed" onPress={onOpenFeed} />
        )}
      </View>
    </View>
  );
}
