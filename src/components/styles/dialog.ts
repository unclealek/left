import { T } from "../theme";
import { leftShadows } from "../shadow";

export const dialogStyles = {
  dialogOverlay: {
    flex: 1,
    backgroundColor: "rgba(31,14,6,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 22,
    zIndex: 50,
  },
  dialogCard: {
    backgroundColor: T.onboardingInk,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(198,227,133,0.26)",
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 28,
    width: "88%",
    gap: 12,
    overflow: "hidden",
    ...leftShadows.medium,
  },
  dialogAccent: {
    height: 4,
    width: 40,
    borderRadius: 2,
    backgroundColor: T.onboardingAccent,
    alignSelf: "center",
    marginBottom: 16,
  },
  dialogTextBlock: {
    gap: 10,
    paddingHorizontal: 10,
  },
  dialogTitle: {
    color: T.onboardingAccent,
    fontSize: 20,
    lineHeight: 24,
    textAlign: "center",
    fontFamily: T.fontBodyBold,
    letterSpacing: -0.3,
  },
  dialogBody: {
    color: "rgba(251,247,245,0.78)",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    fontFamily: T.fontBody,
  },
  dialogActions: {
    gap: 10,
    marginTop: 4,
  },
  dialogAction: {
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  dialogActionPrimary: {
    backgroundColor: T.onboardingAccent,
    borderColor: T.onboardingAccent,
  },
  dialogActionGhost: {
    backgroundColor: "transparent",
    borderColor: "rgba(198,227,133,0.48)",
  },
  dialogActionDestructive: {
    backgroundColor: T.danger,
    borderColor: T.danger,
  },
  dialogActionPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.995 }],
  },
  dialogActionLabel: {
    color: T.onboardingAccent,
    fontSize: 16,
    lineHeight: 20,
    fontFamily: T.fontBodyBold,
  },
  dialogActionLabelPrimary: {
    color: T.onboardingInk,
  },
  dialogActionLabelDestructive: {
    color: T.white,
  },
} as const;
