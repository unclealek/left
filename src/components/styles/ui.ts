import { T } from "../theme";

export const uiStyles = {
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipSubtle: {
    opacity: 0.82,
  },
  chipLabel: {
    color: T.teal,
    fontSize: 12,
    fontWeight: "600",
  },
  chipLabelSubtle: {
    color: T.textSecondary,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  selectChip: {
    borderRadius: T.radius,
    borderWidth: 1,
    borderColor: T.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "transparent",
  },
  selectChipActive: {
    borderColor: T.accent,
    backgroundColor: T.accentDim,
  },
  selectChipLabel: {
    color: T.textSecondary,
    fontSize: 13,
    fontWeight: "500",
  },
  selectChipLabelActive: {
    color: T.accentBright,
    fontWeight: "600",
  },
  iconSelectChip: {
    position: "relative",
    minHeight: 46,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.border,
    backgroundColor: "rgba(255,255,255,0.72)",
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconSelectChipCompact: {
    minWidth: 88,
    flex: 1,
    justifyContent: "center",
  },
  iconSelectChipHalfWidth: {
    flexBasis: "47%",
    flexGrow: 1,
  },
  iconSelectChipActive: {
    borderColor: "rgba(214,138,40,0.44)",
    backgroundColor: "rgba(214,138,40,0.10)",
  },
  iconSelectChipLabel: {
    color: T.textSecondary,
    fontSize: 14,
    lineHeight: 18,
    fontFamily: T.fontBodyMedium,
  },
  iconSelectChipLabelCompact: {
    fontSize: 14,
    lineHeight: 17,
  },
  iconSelectChipLabelActive: {
    color: T.textPrimary,
    fontFamily: T.fontBodyBold,
  },
  iconSelectChipCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: T.visibilityOff,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "auto",
  },
  statusPillBase: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 36,
    paddingHorizontal: 14,
  },
  statusPillDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusPillDotVisible: {
    backgroundColor: T.visibilityOn,
  },
  statusPillDotHidden: {
    backgroundColor: "#FFC24D",
  },
  statusPillLabel: {
    color: T.textPrimary,
    fontSize: 16,
    fontFamily: T.fontBodyMedium,
  },
  utilityIconButton: {
    minWidth: 74,
    height: 74,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 10,
  },
  utilityIconButtonCompact: {
    minWidth: 52,
    width: 52,
    height: 52,
    borderRadius: 18,
    paddingHorizontal: 0,
  },
  utilityIconButtonIconOnly: {
    gap: 0,
  },
  utilityIconButtonLabel: {
    color: T.textPrimary,
    fontSize: 13,
    fontFamily: T.fontBodyMedium,
  },
  venueIdentityBlock: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
    minWidth: 0,
  },
  venueIdentityBlockIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: T.venueAccentSoft,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: T.venueAccent,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  venueIdentityBlockIconWrapHero: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  venueIdentityBlockCopy: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  venueIdentityBlockTitle: {
    color: T.textPrimary,
    fontSize: 17,
    lineHeight: 20,
    fontFamily: T.fontDisplayBold,
  },
  venueIdentityBlockTitleHero: {
    fontSize: 24,
    lineHeight: 29,
    letterSpacing: -0.5,
  },
  venueIdentityBlockMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  venueIdentityBlockMetaText: {
    color: T.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: T.fontBodyMedium,
  },
  venueIdentityBlockMetaTextHero: {
    color: T.primary,
    fontSize: 15,
  },
  venueIdentityBlockSecondaryText: {
    color: T.textSecondary,
    fontSize: 14,
    lineHeight: 18,
    fontFamily: T.fontBody,
  },
} as const;
