import { StyleSheet } from "react-native";
import { T } from "../../theme";

export const feedbackStyles = {
  feedbackPromptOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(251,143,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    zIndex: 30,
  },
  feedbackPromptCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: T.borderBlack,
    backgroundColor: T.surface,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 18,
    gap: 16,
  },
  feedbackPromptEyebrow: {
    color: T.textMuted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  feedbackPromptTitle: {
    color: T.textPrimary,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "300",
    fontFamily: T.fontDisplay,
    letterSpacing: -1,
    textAlign: "center",
  },
  feedbackPromptBody: {
    color: T.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
  feedbackPromptBlock: {
    gap: 10,
  },
  feedbackPromptChoiceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  feedbackPromptIcebreaker: {
    color: T.accentBright,
    fontSize: 14,
    lineHeight: 20,
    fontStyle: "italic",
  },
  feedbackPromptActions: {
    gap: 10,
  },
  feedbackPromptHint: {
    color: T.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
} as const;
