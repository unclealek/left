import { T } from "../../theme";

export const feedStyles = {
  feedHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  feedHeadVenue: {
    color: T.textPrimary,
    fontSize: 22,
    fontWeight: "500",
    fontFamily: T.fontDisplay,
    letterSpacing: -0.5,
    textAlign: "center",
  },
  feedHeadCount: {
    color: T.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  feedCard: {
    borderWidth: 1,
    borderColor: T.borderBlackSoft,
    borderRadius: T.radius,
    padding: 18,
    gap: 14,
    marginBottom: 14,
    backgroundColor: T.surfaceGlassLilac,
  },
  feedCardPressed: {
    backgroundColor: T.accentDim,
    borderColor: T.borderAccent,
  },
  feedCardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  feedAvatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: T.accentDim,
    borderWidth: 1,
    borderColor: T.borderAccent,
    alignItems: "center",
    justifyContent: "center",
  },
  feedAvatarGlyph: {
    color: T.accentBright,
    fontSize: 16,
    fontWeight: "600",
  },
  feedCardInfo: {
    flex: 1,
    gap: 2,
  },
  feedCardName: {
    color: T.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  feedCardIntent: {
    color: T.textSecondary,
    fontSize: 13,
    textTransform: "capitalize",
  },
  feedCardTime: {
    color: T.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  feedCardHint: {
    color: T.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  feedCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 80,
    gap: 12,
  },
  emptyGlyphWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.28)",
  },
  emptyGlyphMark: {
    opacity: 0.38,
  },
  emptyGlyph: {
    color: T.textMuted,
    fontSize: 48,
    fontWeight: "200",
  },
  emptyText: {
    color: T.textMuted,
    fontSize: 15,
  },
} as const;
