import { Feather } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import type { AppUser } from "../../types/left-domain";
import { formatIntent, type FooterDestination } from "../../app/leftConfig";
import { styles, T } from "../../app/leftTheme";

export function BackNavButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.backNavButton, pressed && styles.backNavButtonPressed]}>
      <View style={styles.backNavIconWrap}>
        <Text style={styles.backNavIcon}>{"<"}</Text>
        <View style={styles.backNavDot} />
      </View>
      <Text style={styles.backNavLabel}>{label}</Text>
    </Pressable>
  );
}

export function SessionFooterNav(props: {
  venueName: string;
  vibe: string;
  intent: AppUser["defaultIntent"];
  sessionVisible: boolean;
  activeDestination: FooterDestination;
  onNavigate: (destination: FooterDestination) => void;
}) {
  const items: Array<{ key: FooterDestination; label: string; icon: keyof typeof Feather.glyphMap }> = [
    { key: "home", label: "Home", icon: "home" },
    { key: "nearby", label: "Nearby", icon: "map-pin" },
    { key: "session", label: "Session", icon: "layers" },
    { key: "account", label: "You", icon: "user" },
  ];
  const activeIndex = items.findIndex((item) => item.key === props.activeDestination);

  return (
    <View style={styles.footerShell}>
      <View style={styles.footerSummaryRow}>
        <View style={styles.footerVenueBlock}>
          <Text style={styles.footerVenueLabel}>AT</Text>
          <Text style={styles.footerVenueName}>{props.venueName}</Text>
        </View>
        <View style={styles.footerSessionMeta}>
          <View style={[styles.footerPresenceDot, props.sessionVisible && styles.footerPresenceDotActive]} />
          <Text style={styles.footerSessionText}>
            {props.vibe} · {formatIntent(props.intent ?? "networking")}
          </Text>
        </View>
      </View>
      <View style={styles.footerNavRow}>
        <View style={styles.footerNavTrack}>
          <View
            pointerEvents="none"
            style={[
              styles.footerNavMoundWrap,
              {
                width: `${100 / items.length}%`,
                left: `${(Math.max(activeIndex, 0) * 100) / items.length}%`,
              },
            ]}
          >
            <View style={styles.footerNavMound} />
          </View>
          {items.map((item) => {
            const active = props.activeDestination === item.key;
            return (
              <Pressable
                key={item.key}
                onPress={() => props.onNavigate(item.key)}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                accessibilityState={{ selected: active }}
                style={({ pressed }) => [styles.footerNavItem, active && styles.footerNavItemActive, pressed && styles.footerNavItemPressed]}
              >
                <View style={[styles.footerNavIconBubble, active && styles.footerNavIconBubbleActive]}>
                  <Feather
                    name={item.icon}
                    size={active ? 26 : 22}
                    color={active ? "#21008e" : T.textMuted}
                  />
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
