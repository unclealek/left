import { Feather } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { styles, T } from "../../app/leftTheme";

export function HomeScreen({
  firstName,
  onBecomeVisible,
  onOpenNearby,
  onOpenSafety,
  onComingSoon,
}: {
  firstName: string;
  onBecomeVisible: () => void;
  onOpenNearby: () => void;
  onOpenSafety: () => void;
  onComingSoon: (label: string) => void;
}) {
  const events = [
    { title: "Venue events", meta: "Coming soon", place: "Events near you will appear here.", icon: "calendar", colors: ["#D56FAF", "#E7A6CB"] },
    { title: "Community moments", meta: "Coming soon", place: "Discover planned meetups from nearby spaces.", icon: "activity", colors: ["#8A6ED8", "#B99BEF"] },
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
        <LinearGradient colors={["#d774b4", "#d989bf", "#e49cc9"]} style={styles.homeHeroGradient}>
          <View style={styles.homeHeroCopy}>
            <Text style={styles.homeQuoteMark}>“</Text>
            <Text style={styles.homeHeroText}>Every day is a chance to meet someone new.</Text>
          </View>
          <View style={styles.homeHeroPeople}>
            <Feather name="user" size={56} color="#171221" />
            <Feather name="user" size={62} color="#171221" />
            <Feather name="star" size={20} color="#5f4b96" style={styles.homeHeroStar} />
          </View>
        </LinearGradient>
      </Pressable>

      <View style={styles.homeSectionHeader}>
        <Text style={styles.homeSectionTitle}>Upcoming Events</Text>
        <Text style={styles.homeSectionAction}>Coming soon</Text>
      </View>
      <View style={styles.homeEventList}>
        {events.map((event, index) => (
          <View key={event.title} style={[styles.homeEventRow, index === 0 && styles.homeEventRowFirst]}>
            <LinearGradient colors={event.colors} style={styles.homeEventIconWrap}>
              <View style={styles.homeIconShine} />
              <Feather name={event.icon} size={25} color={T.white} />
            </LinearGradient>
            <View style={styles.homeEventCopy}>
              <Text style={styles.homeEventTitle}>{event.title}</Text>
              <Text style={styles.homeEventMeta}>{event.meta}</Text>
              <Text style={styles.homeEventPlace}>{event.place}</Text>
            </View>
          </View>
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
