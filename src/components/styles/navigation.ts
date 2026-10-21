import { T } from "../theme";
import { screenTypography } from "../token";

export function createNavigationStyles() {
  return {
    backNavButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 0,
      paddingRight: 0,
      paddingVertical: 4,
    },
    backNavButtonPressed: {
      opacity: 0.8,
    },
    backNavIconWrap: {
      width: 44,
      height: 44,
    },
    backNavIconContent: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    backNavLabel: {
      color: T.textSecondary,
      fontSize: 14,
      fontWeight: "600",
    },
    screenHeaderHero: {
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    screenHeaderHeroCopy: {
      flex: 1,
      minWidth: 0,
      gap: 3,
    },
    screenHeaderHeroTitle: {
      color: T.textPrimary,
      fontSize: screenTypography.heroTitle,
      lineHeight: screenTypography.heroTitleLineHeight,
      fontFamily: T.fontDisplayBold,
      letterSpacing: -0.7,
    },
    screenHeaderHeroSubtitle: {
      color: T.textSecondary,
      fontSize: screenTypography.subtitle,
      lineHeight: screenTypography.subtitleLineHeight,
      fontFamily: T.fontBody,
    },
    screenHeaderHeroTrailing: {
      alignSelf: "center",
    },
    screenHeaderUtility: {
      gap: 6,
    },
    screenHeaderUtilityRow: {
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
    },
    screenHeaderSideSlot: {
      width: 64,
      alignItems: "flex-start",
      justifyContent: "center",
    },
    screenHeaderTrailingSlot: {
      alignItems: "flex-end",
    },
    screenHeaderUtilityTitle: {
      flex: 1,
      color: T.textPrimary,
      fontSize: screenTypography.utilityTitle,
      lineHeight: screenTypography.utilityTitleLineHeight,
      fontFamily: T.fontBodyBold,
      textAlign: "center",
    },
    screenHeaderUtilitySubtitle: {
      alignSelf: "center",
      maxWidth: 320,
      color: T.textSecondary,
      fontSize: 13,
      lineHeight: 19,
      fontFamily: T.fontBody,
      textAlign: "center",
    },
    footerShell: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 24,
      paddingTop: 2,
      paddingBottom: 8,
      backgroundColor: "transparent",
      overflow: "visible",
    },
    footerSummaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
      marginBottom: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    footerPrivateRow: {
      marginBottom: 10,
      alignItems: "center",
    },
    footerPrivateBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    footerPrivateDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: T.visibilityOff,
    },
    footerPrivateText: {
      color: T.textSecondary,
      fontSize: 12,
      fontWeight: "600",
    },
    footerVenueBlock: {
      flex: 1,
      gap: 3,
    },
    footerVenueLabel: {
      color: T.textMuted,
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 2,
    },
    footerVenueName: {
      color: T.textPrimary,
      fontSize: 18,
      fontWeight: "700",
      letterSpacing: -0.4,
    },
    footerSessionMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 9,
      borderRadius: T.radiusLg,
      backgroundColor: T.borderBlackSoft,
      borderWidth: 1,
      borderColor: T.borderAccent,
      maxWidth: "58%",
    },
    footerPresenceDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: T.textMuted,
    },
    footerPresenceDotActive: {
      backgroundColor: T.visibilityOn,
    },
    footerSessionText: {
      color: T.textPrimary,
      fontSize: 12,
      fontWeight: "600",
      textTransform: "capitalize",
    },
  } as const;
}
