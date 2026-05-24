import { Pressable, Text, View } from "react-native";
import type { AppUser } from "../../types/left-domain";
import { formatIntent, type FooterDestination } from "../../app/leftConfig";
import { styles } from "../../app/leftTheme";

export function BackNavButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.backNavButton, pressed && styles.backNavButtonPressed]}>
      <View style={styles.backNavIconWrap}>
        <Text style={styles.backNavIcon}>‹</Text>
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
  const items: Array<{ key: FooterDestination; label: string; icon: string }> = [
    { key: "home", label: "Home", icon: "⌂" },
    { key: "nearby", label: "Nearby", icon: "◎" },
    { key: "session", label: "Session", icon: "◉" },
    { key: "account", label: "You", icon: "◌" },
  ];

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
        {items.map((item) => {
          const active = props.activeDestination === item.key;
          return (
            <Pressable
              key={item.key}
              onPress={() => props.onNavigate(item.key)}
              style={({ pressed }) => [styles.footerNavItem, active && styles.footerNavItemActive, pressed && !active && styles.footerNavItemPressed]}
            >
              <Text style={[styles.footerNavIcon, active && styles.footerNavIconActive]}>{item.icon}</Text>
              <Text style={[styles.footerNavLabel, active && styles.footerNavLabelActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
