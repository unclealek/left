import { T } from "../theme";
import { leftShadows } from "../shadow";

export const dialogStyles = {
  dialogOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 22,
    zIndex: 50,
  },
  dialogCard: {
    backgroundColor: T.white,
    borderRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 28,
    width: "88%",
    gap: 12,
    overflow: "hidden",
    ...leftShadows.medium,
  },
  dialogAccent: {
    height: 4,
    width: 40,
    borderRadius: 2,
    backgroundColor: T.secondary,
    alignSelf: "center",
    marginBottom: 16,
  },
  dialogTextBlock: {
    gap: 10,
    paddingHorizontal: 10,
  },
  dialogTitle: {
    color: T.textPrimary,
    fontSize: 20,
    lineHeight: 24,
    textAlign: "center",
    fontFamily: T.fontBodyBold,
    letterSpacing: -0.3,
  },
  dialogBody: {
    color: T.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    fontFamily: T.fontBody,
  },
  dialogActions: {
    gap: 10,
    marginTop: 4,
  },
} as const;
