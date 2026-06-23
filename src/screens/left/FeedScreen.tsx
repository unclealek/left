import { Pressable, Text, View } from "react-native";
import type { NearbyFeedItem, VenueContextSummary } from "../../types/left-domain";
import { formatRemaining } from "../../app/leftConfig";
import { styles } from "../../app/leftTheme";
import { LeftAvatar } from "../../components/left/LeftAvatar";
import { Chip, GhostButton } from "../../components/left/ui";

export function FeedScreen({
  venue,
  feed,
  sessionVisible,
  onOpenProfile,
  onOpenSafety,
}: {
  venue: VenueContextSummary;
  feed: NearbyFeedItem[];
  sessionVisible: boolean;
  onOpenProfile: (item: NearbyFeedItem) => void;
  onOpenSafety: () => void;
}) {
  return (
    <View>
      <View style={styles.feedHead}>
        <View>
          <Text style={styles.feedHeadVenue}>{sessionVisible ? venue.venueName : "Nearby"}</Text>
          <Text style={styles.feedHeadCount}>
            {sessionVisible ? `${feed.length} ${feed.length === 1 ? "person" : "people"} visible` : "Your venue stays private until you start visibility"}
          </Text>
        </View>
        <GhostButton label="Safety" onPress={onOpenSafety} compact />
      </View>
      {feed.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyGlyph}>{"<"}</Text>
          <Text style={styles.emptyText}>{sessionVisible ? "No one visible yet." : "Start visibility to reveal your venue and see nearby people."}</Text>
        </View>
      ) : (
        feed.map((item) => (
          <Pressable key={item.profileUserId} onPress={() => onOpenProfile(item)} style={({ pressed }) => [styles.feedCard, pressed && styles.feedCardPressed]}>
            <View style={styles.feedCardTop}>
              <LeftAvatar name={item.firstName} avatarStyle={item.avatarStyle} size="sm" />
              <View style={styles.feedCardInfo}>
                <Text style={styles.feedCardName}>{item.firstName}</Text>
                <Text style={styles.feedCardIntent}>{item.intent.replaceAll("_", " ")}</Text>
              </View>
              <Text style={styles.feedCardTime}>{formatRemaining(item.sessionDurationRemaining)}</Text>
            </View>
            {item.hintText ? <Text style={styles.feedCardHint}>{item.hintText}</Text> : null}
            <View style={styles.feedCardFooter}>
              <Chip label={item.primaryVibe ?? "Open"} />
              <GhostButton label="View profile →" onPress={() => onOpenProfile(item)} compact />
            </View>
          </Pressable>
        ))
      )}
    </View>
  );
}
