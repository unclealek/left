import { Platform } from "react-native";
import { leftShadows } from "../../shadow";
import { T } from "../../theme";

export const preAuthStyles = {
  preAuthWrap: {
    position: "relative",
    overflow: "hidden",
    width: "100%",
    backgroundColor: "#171812",
  },
  preAuthBackgroundImage: {
    transform: [{ scale: 1.04 }],
  },
  preAuthScrim: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(12,14,10,0.58)",
  },
  preAuthHeroContent: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  preAuthBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  preAuthLogo: {
    width: 46,
    height: 46,
  },
  preAuthWordmark: {
    color: "#FFFFFF",
    fontSize: 13,
    letterSpacing: 4,
    fontFamily: T.fontBodyBold,
  },
  preAuthHeroBottom: {
    gap: 22,
  },
  preAuthCopy: {
    gap: 12,
  },
  preAuthEyebrow: {
    color: "rgba(255,255,255,0.70)",
    fontSize: 11,
    letterSpacing: 2.7,
    fontFamily: T.fontBodyBold,
  },
  preAuthTitle: {
    maxWidth: 360,
    color: "#FFFFFF",
    fontSize: 45,
    lineHeight: 47,
    letterSpacing: -2.1,
    fontFamily: Platform.select({ ios: "Georgia", default: T.fontDisplayLight }),
  },
  preAuthBody: {
    maxWidth: 335,
    color: "rgba(255,255,255,0.80)",
    fontSize: 16,
    lineHeight: 24,
    fontFamily: T.fontBody,
  },
  preAuthNotes: {
    gap: 10,
  },
  preAuthNoteRow: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  preAuthNoteIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  preAuthNoteText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: T.fontBodyMedium,
  },
  preAuthCta: {
    minHeight: 52,
    alignSelf: "flex-start",
    borderRadius: 26,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 28,
    backgroundColor: "#D5EE91",
    ...leftShadows.medium,
  },
  preAuthCtaLabel: {
    color: "#11110F",
    fontSize: 15,
    fontFamily: T.fontBodyBold,
  },
  preAuthFootnote: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 11,
    letterSpacing: 0.4,
    textAlign: "center",
    fontFamily: T.fontBodyMedium,
  },
  preAuthPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
} as const;
