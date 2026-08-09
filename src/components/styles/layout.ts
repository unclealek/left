import { StyleSheet } from "react-native";
import { T } from "../theme";

export const layoutStyles = {
  absoluteFill: StyleSheet.absoluteFillObject,
  shell: {
    flex: 1,
    backgroundColor: T.ink,
  },
  grain: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.008,
    backgroundColor: "transparent",
  },
  toast: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 116,
    zIndex: 30,
    alignItems: "center",
  },
  toastText: {
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: "rgba(31,28,36,0.94)",
    color: T.white,
    fontSize: 14,
    fontWeight: "700",
    paddingHorizontal: 18,
    paddingVertical: 12,
    textAlign: "center",
  },
  waveLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  waveTrack: {
    position: "absolute",
    left: -240,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  waveSegmentClip: {
    width: 180,
    height: 52,
    overflow: "hidden",
    marginLeft: -2,
  },
  waveSegment: {
    width: 180,
    height: 104,
    borderRadius: 52,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.22)",
    backgroundColor: "transparent",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 72,
    gap: 0,
  },
  fullContent: {
    flex: 1,
    padding: 0,
  },
} as const;
