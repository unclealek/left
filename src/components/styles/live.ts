import { T } from "../theme";

export const liveStyles = {
  venueChoiceList: {
    gap: 10,
  },
  energyPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(95,115,63,0.14)",
    backgroundColor: "rgba(244,242,238,0.92)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  energyPillHigh: {
    borderColor: "rgba(96,124,112,0.18)",
    backgroundColor: "rgba(96,124,112,0.12)",
  },
  energyPillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(95,115,63,0.42)",
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
