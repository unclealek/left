import { T } from "../../theme";
import { leftShadows } from "../../shadow";

export const loadingStyles = {
  loadingWrap: {
    flex: 1,
    minHeight: 620,
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  loadingCenter: {
    alignItems: "center",
    gap: 16,
  },
  loadingAnimation: {
    width: 150,
    height: 150,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingAnimationSmall: {
    width: 42,
    height: 42,
  },
  loadingAnimationPulse: {
    position: "absolute",
    width: 142,
    height: 142,
    borderRadius: 71,
    backgroundColor: T.onboardingAccent,
  },
  loadingAnimationPulseSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  loadingAnimationLogoEcho: {
    position: "absolute",
    width: 92,
    height: 92,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingAnimationLogoEchoSmall: {
    width: 30,
    height: 30,
  },
  loadingAnimationLogo: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingAnimationLogoSmall: {
    width: 30,
    height: 30,
  },
  loadingAnimationCore: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 8,
    borderColor: T.glassBorder,
    backgroundColor: T.onboardingAccent,
    alignItems: "center",
    justifyContent: "center",
    ...leftShadows.small,
  },
  loadingAnimationCoreSmall: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
  },
  loadingWordmark: {
    color: T.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 5,
  },
  loadingCaption: {
    color: T.textMuted,
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 300,
    textAlign: "center",
    fontFamily: T.fontBody,
  },
  loadingErrorTitle: {
    color: T.textPrimary,
    fontSize: 21,
    lineHeight: 26,
    fontFamily: T.fontDisplayBold,
    textAlign: "center",
  },
  loadingRetryButton: {
    minHeight: 50,
    minWidth: 150,
    borderRadius: 18,
    backgroundColor: T.actionSurface,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  loadingRetryLabel: {
    color: T.actionContent,
    fontSize: 15,
    fontFamily: T.fontBodyBold,
  },
} as const;
