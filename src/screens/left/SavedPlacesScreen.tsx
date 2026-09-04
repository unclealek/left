import { Pressable, Text, View } from "react-native";
import { styles, T } from "../../app/leftTheme";
import { LeftIcon } from "../../components/icons";
import { ScreenHeader } from "../../components/left/navigation";
import type { SavedVenueEntry } from "../../features/discovery/discovery-service";

export function SavedPlacesScreen({
  venues,
  onBack,
  onOpenVenue,
  onExplore,
}: {
  venues: SavedVenueEntry[];
  onBack: () => void;
  onOpenVenue: (venue: SavedVenueEntry) => void;
  onExplore: () => void;
}) {
  return (
    <View style={styles.discoveryPage}>
      <ScreenHeader
        title="Saved places"
        subtitle="A private list for the next time you want to step out."
        onBack={onBack}
        variant="utility"
      />

      {venues.length === 0 ? (
        <View style={styles.discoveryEmptyCard}>
          <View style={styles.discoveryEmptyIcon}>
            <LeftIcon name="bookmark" size={22} color={T.primary} />
          </View>
          <Text style={styles.discoveryEmptyTitle}>Nothing saved yet</Text>
          <Text style={styles.discoveryEmptyText}>Save a nearby place and it will wait here across your devices.</Text>
          <Pressable
            accessibilityRole="button"
            onPress={onExplore}
            style={({ pressed }) => [styles.discoveryInlineAction, pressed && styles.iconButtonPressed]}
          >
            <Text style={styles.discoveryInlineActionText}>Explore nearby</Text>
            <LeftIcon name="arrow-right" size={16} color={T.primary} />
          </Pressable>
        </View>
      ) : (
        <View style={styles.discoveryList}>
          {venues.map((venue) => (
            <Pressable
              key={venue.venueId}
              accessibilityRole="button"
              accessibilityLabel={`Open ${venue.venueName}`}
              onPress={() => onOpenVenue(venue)}
              style={({ pressed }) => [styles.discoveryVenueRow, pressed && styles.iconButtonPressed]}
            >
              <View style={styles.discoveryVenueIcon}>
                <LeftIcon name="map-pin" size={20} color={T.primary} />
              </View>
              <View style={styles.discoveryVenueCopy}>
                <Text style={styles.discoveryVenueName}>{venue.venueName}</Text>
                <Text style={styles.discoveryVenueMeta}>{venue.formattedAddress ?? formatVenueType(venue.venueType)}</Text>
              </View>
              <LeftIcon name="chevron-right" size={20} color={T.textSecondary} />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function formatVenueType(value: SavedVenueEntry["venueType"]) {
  if (value === "coworking_space") return "Coworking space";
  return value === "other" ? "Saved venue" : `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
