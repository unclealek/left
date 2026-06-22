import { Feather } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { styles, T } from "../../app/leftTheme";

export function HomeScreen({
  firstName,
  onBecomeVisible,
}: {
  firstName: string;
  onBecomeVisible: () => void;
}) {
  const events = [
    { title: "Coffee Meetup", meta: "Today · 10:00 AM", place: "Nearby venue", icon: "calendar" },
    { title: "Builder Hour", meta: "Tomorrow · 02:00 PM", place: "Main hall", icon: "users" },
  ] as const;

  const quickLinks = [
    { label: "Radar", icon: "radio" },
    { label: "Nearby", icon: "map-pin" },
    { label: "Safety", icon: "shield" },
    { label: "Resources", icon: "folder" },
  ] as const;

  return (
    <View style={styles.homePage}>
      <View style={styles.homeTopBar}>
        <Pressable accessibilityRole="button" style={({ pressed }) => [styles.homeIconButton, pressed && styles.iconButtonPressed]}>
          <Feather name="menu" size={24} color={T.textPrimary} />
        </Pressable>
        <Pressable accessibilityRole="button" style={({ pressed }) => [styles.homeIconButton, pressed && styles.iconButtonPressed]}>
          <Feather name="bell" size={23} color={T.textPrimary} />
          <View style={styles.homeNotificationDot} />
        </Pressable>
      </View>

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
        <Text style={styles.homeSectionAction}>View all</Text>
      </View>
      <View style={styles.homeEventList}>
        {events.map((event, index) => (
          <View key={event.title} style={[styles.homeEventRow, index === 0 && styles.homeEventRowFirst]}>
            <View style={styles.homeEventIconWrap}>
              <Feather name={event.icon} size={26} color={T.white} />
            </View>
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
            onPress={link.label === "Radar" ? onBecomeVisible : undefined}
            style={({ pressed }) => [styles.homeQuickTile, pressed && styles.iconButtonPressed]}
          >
            <View style={styles.homeQuickIconWrap}>
              <Feather name={link.icon} size={24} color={T.white} />
            </View>
            <Text style={styles.homeQuickLabel}>{link.label}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable onPress={onBecomeVisible} style={({ pressed }) => [styles.homeBecomeButton, pressed && styles.primaryBtnPressed]}>
        <Text style={styles.homeBecomeButtonText}>Become visible</Text>
      </Pressable>
    </View>
  );
}
