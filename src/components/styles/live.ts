import { T } from "../theme";

export const liveStyles = {
  venueChoiceList: {
    gap: 10,
  },
  energyPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(53,102,77,0.14)",
    backgroundColor: "rgba(255,248,236,0.92)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  energyPillHigh: {
    borderColor: "rgba(31,120,161,0.18)",
    backgroundColor: "rgba(31,120,161,0.12)",
  },
  energyPillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(53,102,77,0.42)",
  },
  energyPillDotHigh: {
    backgroundColor: T.teal,
  },
  energyPillLabel: {
    color: T.textSecondary,
    fontSize: 13,
    lineHeight: 16,
    fontFamily: T.fontBodyBold,
  },
  energyPillLabelHigh: {
    color: T.teal,
  },
} as const;
