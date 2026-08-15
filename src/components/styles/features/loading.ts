import { T } from "../../theme";

export const loadingStyles = {
  loadingWrap: {
    flex: 1,
    minHeight: 700,
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  loadingCenter: {
    alignItems: "center",
    gap: 16,
  },
  loadingLogo: {
    width: 118,
    height: 28,
  },
  loadingRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: "rgba(198,227,133,0.10)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.96)",
  },
  loadingChevron: {
    color: T.primary,
    fontSize: 44,
    fontWeight: "200",
    lineHeight: 52,
    marginRight: -6,
  },
  loadingDot: {
    position: "absolute",
    right: 28,
    top: 38,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: T.secondary,
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
  },
} as const;
