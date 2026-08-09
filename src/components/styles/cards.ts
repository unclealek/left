import { T } from "../theme";

export const cardStyles = {
  card: {
    gap: 20,
  },
  cardStepRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardStepText: {
    color: T.textMuted,
    fontSize: 11,
    fontWeight: "700",
    fontFamily: T.fontBodyBold,
    letterSpacing: 2,
  },
  cardTitle: {
    color: T.textPrimary,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "400",
    fontFamily: T.fontDisplayLight,
    letterSpacing: -1.2,
    textAlign: "center",
  },
  cardBody: {
    color: T.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: T.fontBody,
  },
} as const;
