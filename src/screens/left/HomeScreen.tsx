import { Feather } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { VenueContextSummary } from "../../types/left-domain";
import { styles, T } from "../../app/leftTheme";

export function HomeScreen({
  firstName,
  venue,
  onBecomeVisible,
  onOpenNearby,
  onOpenSafety,
  onComingSoon,
}: {
  firstName: string;
  venue: VenueContextSummary;
  onBecomeVisible: () => void;
  onOpenNearby: () => void;
  onOpenSafety: () => void;
  onComingSoon: (label: string) => void;
}) {
  const favoriteVenues = [
    { title: venue.venueName, meta: "Current venue", place: `${venue.visibleCount} ${venue.visibleCount === 1 ? "person" : "people"} visible nearby`, icon: "map-pin", colors: ["#5BCBFF", "#FB8FFF"], onPress: onBecomeVisible },
    { title: "Add favorite venue", meta: "Coming soon", place: "Save places you visit often.", icon: "heart", colors: ["#86162F", "#FB8FFF"], onPress: () => onComingSoon("Favorite venues coming soon") },
  ] as const;

  const quickLinks = [
    { label: "Radar", icon: "radio", colors: ["#8065D8", "#B28AF0"], onPress: onBecomeVisible },
    { label: "Nearby", icon: "navigation", colors: ["#D86F8F", "#E8A7BA"], onPress: onOpenNearby },
    { label: "Safety", icon: "shield", colors: ["#CE6A4A", "#E8A071"], onPress: onOpenSafety },
    { label: "Resources", icon: "book-open", colors: ["#6F8DD8", "#A9BDF0"], onPress: () => onComingSoon("Resources coming soon") },
  ] as const;

  return (
    <View style={styles.homePage}>
      <View style={styles.homeGreetingBlock}>
        <Text style={styles.homeGreetingLabel}>Good Morning,</Text>
        <Text style={styles.homeGreetingName}>{firstName}</Text>
      </View>

      <Pressable onPress={onBecomeVisible} style={({ pressed }) => [styles.homeHeroCard, pressed && styles.primaryBtnPressed]}>
        <LinearGradient colors={["#5BCBFF", "#FB8FFF"]} style={styles.homeHeroGradient}>
          <View style={styles.homeHeroCopy}>
            <Text style={styles.homeQuoteMark}>“</Text>
            <Text style={styles.homeHeroText}>Every day is a chance to meet someone new.</Text>
          </View>
          <View style={styles.homeHeroPeople}>
            <Feather name="user" size={56} color="#171221" />
            <Feather name="user" size={62} color="#171221" />
            <Feather name="star" size={20} color="#5BCBFF" style={styles.homeHeroStar} />
          </View>
        </LinearGradient>
      </Pressable>

      <View style={styles.homeSectionHeader}>
        <Text style={styles.homeSectionTitle}>Favorite Venues</Text>
      </View>
      <View style={styles.homeEventList}>
        {favoriteVenues.map((venueItem, index) => (
          <Pressable
            key={venueItem.title}
            onPress={venueItem.onPress}
            style={({ pressed }) => [styles.homeEventRow, index === 0 && styles.homeEventRowFirst, pressed && styles.iconButtonPressed]}
          >
            <LinearGradient colors={venueItem.colors} style={styles.homeEventIconWrap}>
              <View style={styles.homeIconShine} />
              <Feather name={venueItem.icon} size={25} color={T.white} />
            </LinearGradient>
            <View style={styles.homeEventCopy}>
              <Text style={styles.homeEventTitle}>{venueItem.title}</Text>
              <Text style={styles.homeEventMeta}>{venueItem.meta}</Text>
              <Text style={styles.homeEventPlace}>{venueItem.place}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      <Text style={styles.homeSectionTitle}>Quick Links</Text>
      <View style={styles.homeQuickGrid}>
        {quickLinks.map((link) => (
          <Pressable
            key={link.label}
            onPress={link.onPress}
            style={({ pressed }) => [styles.homeQuickTile, pressed && styles.iconButtonPressed]}
          >
            <LinearGradient colors={link.colors} style={styles.homeQuickIconWrap}>
              <View style={styles.homeIconShine} />
              <Feather name={link.icon} size={22} color={T.white} />
            </LinearGradient>
            <Text style={styles.homeQuickLabel}>{link.label}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable onPress={onBecomeVisible} style={({ pressed }) => [styles.homeBecomeButton, pressed && styles.primaryBtnPressed]}>
        <Text style={styles.homeBecomeButtonText}>Start visibility</Text>
      </Pressable>
    </View>
  );
}
