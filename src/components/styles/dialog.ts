import { T } from "../theme";
import { leftShadows } from "../shadow";

export const dialogStyles = {
  dialogOverlay: {
    flex: 1,
    backgroundColor: "rgba(26,24,21,0.38)",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 22,
    zIndex: 50,
  },
  dialogCard: {
    backgroundColor: T.surfaceGlassStrong,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.88)",
    paddingTop: 18,
    paddingHorizontal: 20,
    paddingBottom: 20,
    width: "92%",
    gap: 14,
    marginBottom: 34,
    overflow: "hidden",
    ...leftShadows.medium,
  },
  dialogAccent: {
    height: 5,
    width: 34,
    borderRadius: 3,
    backgroundColor: T.primary,
    alignSelf: "center",
    marginBottom: 4,
  },
  dialogTextBlock: {
    gap: 7,
    paddingHorizontal: 4,
  },
  dialogTitle: {
    color: T.textPrimary,
    fontSize: 22,
    lineHeight: 27,
    textAlign: "left",
    fontFamily: T.fontDisplayBold,
    letterSpacing: -0.45,
  },
  dialogBody: {
    color: T.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "left",
    fontFamily: T.fontBodyMedium,
  },
  dialogActions: {
    gap: 8,
    marginTop: 2,
  },
  dialogAction: {
    minHeight: 50,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  dialogActionPrimary: {
    backgroundColor: T.actionSurface,
    borderColor: T.actionSurface,
  },
  dialogActionGhost: {
    backgroundColor: T.surfaceDim,
    borderColor: T.border,
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
    color: T.textSecondary,
    fontSize: 14,
    lineHeight: 18,
    fontFamily: T.fontBodyBold,
  },
  dialogActionLabelPrimary: {
    color: T.actionContent,
  },
  dialogActionLabelDestructive: {
    color: T.white,
  },
} as const;
