import { useEffect, useRef, useState, type ReactNode } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { AppUser } from "../../types/left-domain";
import { formatIntent, type FooterDestination } from "../../app/leftConfig";
import { styles, T } from "../../app/leftTheme";
import { LeftIcon, type LeftIconName } from "../icons";
import { GlassSurface, glassRadii } from "../glass";
import { LeftLogoMark } from "./LeftLogoMark";

export function BackNavButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label || "Back"}
      onPress={onPress}
      style={({ pressed }) => [styles.backNavButton, pressed && styles.backNavButtonPressed]}
    >
      <GlassSurface
        variant="soft"
        radius={glassRadii.pill}
        style={styles.backNavIconWrap}
        contentStyle={styles.backNavIconContent}
      >
        <LeftIcon name="arrow-left" size={22} color={T.primary} />
      </GlassSurface>
      {label ? <Text style={styles.backNavLabel}>{label}</Text> : null}
    </Pressable>
  );
}

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  variant = "hero",
  trailing,
}: {
  title: string;
  subtitle?: string;
  onBack: () => void;
  variant?: "hero" | "utility";
  trailing?: ReactNode;
}) {
  if (variant === "utility") {
    return (
      <View style={styles.screenHeaderUtility}>
        <View style={styles.screenHeaderUtilityRow}>
          <View style={styles.screenHeaderSideSlot}>
            <BackNavButton label="" onPress={onBack} />
          </View>
          <Text numberOfLines={2} style={styles.screenHeaderUtilityTitle}>{title}</Text>
          <View style={[styles.screenHeaderSideSlot, styles.screenHeaderTrailingSlot]}>
            {trailing ?? null}
          </View>
        </View>
        {subtitle ? <Text style={styles.screenHeaderUtilitySubtitle}>{subtitle}</Text> : null}
      </View>
    );
  }

  return (
    <View style={styles.screenHeaderHero}>
      <BackNavButton label="" onPress={onBack} />
      <View style={styles.screenHeaderHeroCopy}>
        <Text style={styles.screenHeaderHeroTitle}>{title}</Text>
        {subtitle ? <Text style={styles.screenHeaderHeroSubtitle}>{subtitle}</Text> : null}
      </View>
      {trailing ? <View style={styles.screenHeaderHeroTrailing}>{trailing}</View> : null}
    </View>
  );
}

export function SessionFooterNav(props: {
  venueName: string;
  vibe: string;
  intent: AppUser["defaultIntent"];
  sessionVisible: boolean;
  activeDestination: FooterDestination;
  showContextSummary?: boolean;
  bottomInset?: number;
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

  const trackHorizontalInset = 32;
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
    <View style={[styles.footerShell, { paddingBottom: Math.max(props.bottomInset ?? 0, 8) }]}>
      {props.showContextSummary !== false && props.sessionVisible && props.activeDestination !== "home" ? (
        <GlassSurface
          variant="medium"
          radius={glassRadii.compactCard}
          contentStyle={styles.footerSummaryRow}
        >
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
        </GlassSurface>
      ) : showPrivateBadge ? (
        <View style={styles.footerPrivateRow}>
          <GlassSurface
            variant="soft"
            radius={glassRadii.pill}
            contentStyle={styles.footerPrivateBadge}
          >
            <View style={styles.footerPrivateDot} />
            <Text style={styles.footerPrivateText}>Private until you choose to be seen</Text>
          </GlassSurface>
        </View>
      ) : null}
      <View style={styles.footerNavRow}>
        <GlassSurface
          variant="soft"
          tone="creole"
          blurIntensity={42}
          radius={glassRadii.navigation}
          style={styles.footerNavTrack}
          contentStyle={styles.footerNavTrackContent}
          onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
        >
          <LinearGradient
            pointerEvents="none"
            colors={["rgba(255,255,255,0.09)", "rgba(255,255,255,0.02)", "rgba(66,79,45,0.10)"]}
            locations={[0, 0.42, 1]}
            style={styles.footerNavSpecular}
          />
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
                  size={16}
                  color={T.onboardingAccent}
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
                      <LeftIcon name={item.icon} size={18} color={T.navActiveMuted} />
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
        </GlassSurface>
      </View>
    </View>
  );
}
