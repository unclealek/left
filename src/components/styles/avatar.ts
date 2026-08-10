import { T } from "../theme";

export const avatarStyles = {
  leftAvatarRingLg: {
    width: 122,
    height: 122,
    borderRadius: 61,
    borderWidth: 3,
    borderColor: T.white,
    backgroundColor: T.surfaceCard,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: T.primary,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  leftAvatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: T.venueAccentSoft,
    overflow: "hidden",
  },
  leftAvatarCircleSm: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  leftAvatarCircleLg: {
    width: 108,
    height: 108,
    borderRadius: 54,
  },
  leftAvatarCircleAbstract: {
    backgroundColor: T.secondary,
  },
  leftAvatarCircleMinimal: {
    backgroundColor: T.surfaceCard,
    borderWidth: 1,
    borderColor: T.borderAccent,
  },
  leftAvatarCircleSoft: {
    backgroundColor: T.venueSurface,
  },
  leftAvatarGlyphMark: {
    position: "absolute",
    color: T.borderAccent,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "800",
  },
  leftAvatarGlyphMarkSm: {
    fontSize: 24,
    lineHeight: 28,
  },
  leftAvatarGlyphMarkLg: {
    fontSize: 58,
    lineHeight: 64,
  },
  leftAvatarText: {
    color: T.textPrimary,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "800",
    fontFamily: T.fontDisplayBold,
    zIndex: 1,
  },
  leftAvatarTextSm: {
    fontSize: 15,
    lineHeight: 20,
  },
  leftAvatarTextLg: {
    fontSize: 34,
    lineHeight: 40,
  },
  leftAvatarTextAbstract: {
    color: T.white,
  },
  leftAvatarTextMinimal: {
    color: T.venueAccent,
  },
} as const;
