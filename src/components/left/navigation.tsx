import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import type { AppUser } from "../../types/left-domain";
import { formatIntent, type FooterDestination } from "../../app/leftConfig";
import { styles, T } from "../../app/leftTheme";
import { LeftIcon, type LeftIconName } from "../icons";
import { LeftLogoMark } from "./LeftLogoMark";

export function BackNavButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.backNavButton, pressed && styles.backNavButtonPressed]}>
      <View style={styles.backNavIconWrap}>
        <LeftIcon name="arrow-left" size={22} color={T.primary} />
      </View>
      {label ? <Text style={styles.backNavLabel}>{label}</Text> : null}
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
  const items: Array<{ key: FooterDestination; label: string; icon: LeftIconName }> = [
    { key: "home", label: "Home", icon: "home" },
    { key: "nearby", label: "Map", icon: "map-pin" },
    { key: "session", label: "Venues", icon: "venue" },
    { key: "account", label: "Profile", icon: "user" },
  ];
  const activeIndex = items.findIndex((item) => item.key === props.activeDestination);
  const [trackWidth, setTrackWidth] = useState(0);
  const slideAnim = useRef(new Animated.Value(Math.max(activeIndex, 0))).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: Math.max(activeIndex, 0),
      useNativeDriver: true,
      tension: 170,
      friction: 18,
    }).start();
  }, [activeIndex, slideAnim]);

  const trackHorizontalInset = 24;
  const trackInnerWidth = trackWidth > 0 ? Math.max(trackWidth - trackHorizontalInset, 0) : 0;
  const slotWidth = trackInnerWidth > 0 ? trackInnerWidth / items.length : 0;
  const bubbleTranslateX = slideAnim.interpolate({
    inputRange: items.map((_, index) => index),
    outputRange: items.map((_, index) => index * slotWidth + trackHorizontalInset / 2),
  });
  const activeItem = items[Math.max(activeIndex, 0)];
  const showPrivateBadge =
    !props.sessionVisible &&
    props.activeDestination !== "home" &&
    props.activeDestination !== "session" &&
    props.activeDestination !== "account";

  return (
    <View style={styles.footerShell}>
      {props.sessionVisible && props.activeDestination !== "home" ? (
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
      ) : showPrivateBadge ? (
        <View style={styles.footerPrivateRow}>
          <View style={styles.footerPrivateBadge}>
            <View style={styles.footerPrivateDot} />
            <Text style={styles.footerPrivateText}>Your venue stays private until visible</Text>
          </View>
        </View>
      ) : null}
      <View style={styles.footerNavRow}>
        <View style={styles.footerNavTrack} onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}>
          {slotWidth > 0 && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.footerNavBubbleTrack,
                {
                  width: slotWidth,
                  transform: [{ translateX: bubbleTranslateX }],
                },
              ]}
            >
              <View style={styles.footerNavIconBubbleActive}>
                <LeftIcon
                  name={activeItem.icon}
                  size={19}
                  color={T.white}
                  active={activeItem.icon !== "home"}
                />
              </View>
            </Animated.View>
          )}
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
                {!active ? (
                  <>
                    <View style={styles.footerNavIconBubble}>
                      <LeftIcon name={item.icon} size={21} color={"rgba(31,46,36,0.78)"} />
                    </View>
                    <Text style={styles.footerNavLabel}>{item.label}</Text>
                  </>
                ) : (
                  <>
                    <View style={styles.footerNavIconPlaceholder} />
                    <Text style={[styles.footerNavLabel, styles.footerNavLabelActive]}>{item.label}</Text>
                  </>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
