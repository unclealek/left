import { Pressable, Text, View } from "react-native";
import type { NearbyFeedItem, VenueContextSummary } from "../../types/left-domain";
import { formatIntent, formatRemaining } from "../../app/leftConfig";
import { styles, T } from "../../app/leftTheme";
import { LeftIcon } from "../../components/icons";
import { LeftAvatar } from "../../components/left/LeftAvatar";
import { SafetyActionButton } from "../../components/left/ui";

export function FeedScreen({
  venue,
  feed,
  sessionVisible,
  onOpenProfile,
  onOpenVenueDetail,
  onOpenSafety,
}: {
  venue: VenueContextSummary;
  feed: NearbyFeedItem[];
  sessionVisible: boolean;
  onOpenProfile: (item: NearbyFeedItem) => void;
  onOpenVenueDetail: () => void;
  onOpenSafety: () => void;
}) {
  const peopleLabel = `${feed.length} ${feed.length === 1 ? "person" : "people"} visible`;

  return (
    <View style={styles.feedPage}>
      <View style={styles.feedHead}>
        <View style={styles.feedHeadCopy}>
          <Text style={styles.feedTitle}>People nearby</Text>
          <Text style={styles.feedSubtitle}>
            {sessionVisible ? "People choosing to be visible at this venue." : "Go visible to see people at your venue."}
          </Text>
        </View>
        <SafetyActionButton onPress={onOpenSafety} compact />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open details for ${sessionVisible ? venue.venueName : "nearby venues"}`}
        onPress={onOpenVenueDetail}
        style={({ pressed }) => [styles.feedVenueRow, pressed && styles.feedCardPressed]}
      >
        <View style={styles.feedVenueIconWrap}>
          <LeftIcon name={sessionVisible ? "map-pin" : "lock"} size={18} color={sessionVisible ? T.venueAccent : T.textSecondary} active={sessionVisible} />
        </View>
        <View style={styles.feedVenueCopy}>
          <Text numberOfLines={1} style={styles.feedHeadVenue}>{sessionVisible ? venue.venueName : "Venue private"}</Text>
          <View style={styles.feedCountRow}>
            <View style={[styles.feedCountDot, sessionVisible && styles.feedCountDotVisible]} />
            <Text style={styles.feedHeadCount}>
              {sessionVisible ? peopleLabel : "Your venue stays private until visible"}
            </Text>
          </View>
        </View>
        <LeftIcon name="chevron-right" size={18} color={T.textSecondary} />
      </Pressable>

      {feed.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyGlyphWrap}>
            <LeftIcon name={sessionVisible ? "users" : "lock"} size={28} color={T.venueAccent} />
          </View>
          <Text style={styles.emptyTitle}>{sessionVisible ? "No one else is visible yet" : "Your nearby feed is private"}</Text>
          <Text style={styles.emptyText}>
            {sessionVisible
              ? "You are the first person showing up here. New people will appear automatically."
              : "Start a presence when you are ready to see and be seen by people at your venue."}
          </Text>
        </View>
      ) : (
        <View style={styles.feedList}>
          {feed.map((item) => (
            <PersonCard key={item.profileUserId} item={item} onPress={() => onOpenProfile(item)} />
          ))}
        </View>
      )}
    </View>
  );
}

function PersonCard({ item, onPress }: { item: NearbyFeedItem; onPress: () => void }) {
  const intent = formatIntent(item.intent);
  const intentLabel = intent.charAt(0).toUpperCase() + intent.slice(1);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View ${item.firstName}'s profile. ${intentLabel}. ${formatRemaining(item.sessionDurationRemaining)} remaining.`}
      onPress={onPress}
      style={({ pressed }) => [styles.feedCard, pressed && styles.feedCardPressed]}
    >
      <View style={styles.feedCardTop}>
        <LeftAvatar name={item.firstName} avatarStyle={item.avatarStyle} />
        <View style={styles.feedCardInfo}>
          <Text style={styles.feedCardName}>{item.firstName}</Text>
          <View style={styles.feedCardIntentRow}>
            <LeftIcon name="radio" size={14} color={T.venueAccent} />
            <Text style={styles.feedCardIntent}>{intentLabel}</Text>
          </View>
        </View>
        <View style={styles.feedCardTimePill}>
          <LeftIcon name="clock" size={13} color={T.textSecondary} />
          <Text style={styles.feedCardTime}>{formatRemaining(item.sessionDurationRemaining)}</Text>
        </View>
      </View>

      {item.hintText ? (
        <View style={styles.feedCardHintRow}>
          <LeftIcon name="edit" size={15} color={T.textMuted} />
          <Text style={styles.feedCardHint}>{item.hintText}</Text>
        </View>
      ) : null}

      <View style={styles.feedCardFooter}>
        <View style={styles.feedVibePill}>
          <LeftIcon name="activity" size={14} color={T.venueAccent} />
          <Text style={styles.feedVibeText}>{item.primaryVibe ?? "Open"}</Text>
        </View>
        <View style={styles.feedProfileAction}>
          <Text style={styles.feedProfileActionText}>View profile</Text>
          <LeftIcon name="chevron-right" size={16} color={T.textPrimary} />
        </View>
      </View>
    </Pressable>
  );
}
