import { StyleSheet, Text, View } from "react-native";
import { T } from "../../app/leftTheme";
import { LeftLoadingAnimation } from "./LeftLoadingAnimation";

const REFRESH_TRIGGER_DISTANCE = 72;

export function LeftRefreshIndicator({
  pullDistance,
  refreshing,
  topInset,
}: {
  pullDistance: number;
  refreshing: boolean;
  topInset: number;
}) {
  const progress = Math.min(pullDistance / REFRESH_TRIGGER_DISTANCE, 1);
  const visible = refreshing || pullDistance > 8;
  if (!visible) return null;

  const label = refreshing
    ? "Refreshing nearby"
    : progress >= 1
      ? "Release to refresh"
      : "Pull to refresh";

  return (
    <View
      pointerEvents="none"
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: refreshing ? 100 : Math.round(progress * 100) }}
      style={[
        localStyles.anchor,
        {
          top: topInset + 5,
          opacity: refreshing ? 1 : Math.max(0.2, progress),
          transform: [{ scale: refreshing ? 1 : 0.9 + progress * 0.1 }],
        },
      ]}
    >
      <View style={localStyles.pill}>
        <LeftLoadingAnimation size="small" label={label} accessible={false} />
        <Text style={localStyles.label}>{label}</Text>
      </View>
    </View>
  );
}

const localStyles = StyleSheet.create({
  anchor: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 20,
    alignItems: "center",
  },
  pill: {
    minHeight: 48,
    paddingLeft: 4,
    paddingRight: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: T.border,
    backgroundColor: T.surfaceGlassStrong,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    shadowColor: T.primary,
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  label: {
    color: T.textPrimary,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: T.fontBodyBold,
  },
});
