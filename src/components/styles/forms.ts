import { T } from "../theme";

export const formStyles = {
  input: {
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: T.radiusSm,
    backgroundColor: T.surfaceCard,
    color: T.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 110,
    textAlignVertical: "top",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: T.border,
    borderRadius: T.radius,
    padding: 16,
    gap: 16,
    backgroundColor: T.surfaceCard,
  },
  toggleTextWrap: {
    gap: 2,
    flex: 1,
  },
  toggleLabel: {
    color: T.textPrimary,
    fontSize: 15,
    fontWeight: "500",
  },
  toggleSub: {
    color: T.textSecondary,
    fontSize: 13,
  },
  fieldBlock: {
    gap: 12,
  },
  fieldLabel: {
    color: T.textMuted,
    fontSize: 10,
    fontWeight: "800",
    fontFamily: T.fontBodyBold,
    letterSpacing: 1.8,
  },
  fieldHint: {
    color: T.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: -2,
    fontFamily: T.fontBody,
  },
  infoBlock: {
    gap: 8,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
  },
  infoText: {
    color: T.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: T.fontBody,
  },
  icebreakerText: {
    color: T.accentBright,
    fontStyle: "italic",
  },
} as const;
