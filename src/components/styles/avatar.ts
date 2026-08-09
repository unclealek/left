import { T } from "../theme";

export const avatarStyles = {
  leftAvatarRingLg: {
    width: 122,
    height: 122,
    borderRadius: 61,
    borderWidth: 3,
    borderColor: T.white,
    backgroundColor: "rgba(251,143,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FB8FFF",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  leftAvatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FB8FFF",
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
    backgroundColor: "#86162F",
  },
  leftAvatarCircleMinimal: {
    backgroundColor: "#F8F1EA",
    borderWidth: 2,
    borderColor: "#FB8FFF",
  },
  leftAvatarCircleSoft: {
    backgroundColor: "#FB8FFF",
  },
  leftAvatarGlyphMark: {
    position: "absolute",
    color: "rgba(255,255,255,0.22)",
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
    color: T.white,
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
  leftAvatarTextMinimal: {
    color: "#FB8FFF",
  },
} as const;
