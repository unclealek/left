import { t } from "../../features/preferences/translation-runtime";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import type { AppUser } from "../../types/left-domain";
import { formatIntent, type FooterDestination } from "../../app/leftConfig";
import { styles, T } from "../../app/leftTheme";
import { LeftIcon } from "../icons";
import { GlassSurface, glassRadii } from "../glass";
import { LiquidGlassTabBar } from "./LiquidGlassTabBar";

export function BackNavButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label || t("Back")}
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
  onHeightChange?: (height: number) => void;
  onNavigate: (destination: FooterDestination) => void;
}) {
  const showPrivateBadge =
    !props.sessionVisible &&
    props.activeDestination !== "home" &&
    props.activeDestination !== "session" &&
    props.activeDestination !== "account";

  return (
    <View pointerEvents="box-none" onLayout={event => props.onHeightChange?.(event.nativeEvent.layout.height)} style={[styles.footerShell, { paddingBottom: Math.max(props.bottomInset ?? 0, 12) }]}>
      {props.showContextSummary !== false && props.sessionVisible && props.activeDestination !== "home" ? (
        <GlassSurface
          variant="medium"
          radius={glassRadii.compactCard}
          contentStyle={styles.footerSummaryRow}
        >
          <View style={styles.footerVenueBlock}>
            <Text style={styles.footerVenueLabel}>{t("AT")}</Text>
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
            <Text style={styles.footerPrivateText}>{t("Private until you choose to be seen")}</Text>
          </GlassSurface>
        </View>
      ) : null}
      <LiquidGlassTabBar activeDestination={props.activeDestination} onNavigate={props.onNavigate} />
    </View>
  );
}
