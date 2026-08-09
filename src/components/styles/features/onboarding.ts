import { T } from "../../theme";

export const onboardingStyles = {
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  avatarTile: {
    width: "47%",
    minHeight: 132,
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: 18,
    backgroundColor: T.surfaceCard,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 14,
  },
  avatarTileActive: {
    borderColor: T.borderAccent,
    backgroundColor: "rgba(244,200,90,0.10)",
  },
  avatarGlyph: {
    color: T.textSecondary,
    fontSize: 32,
    lineHeight: 38,
  },
  avatarGlyphActive: {
    color: T.textPrimary,
  },
  avatarTileLabel: {
    color: T.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  avatarTileLabelActive: {
    color: T.textPrimary,
  },
} as const;
