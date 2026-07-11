import { StyleSheet, View } from "react-native";
import { T } from "../../app/leftTheme";

export function LeftDoorwayMark({
  size = 64,
  archColor = T.secondary,
  innerColor = T.surface,
  baseColor = T.primarySoft,
  baseScale = 0.58,
}: {
  size?: number;
  archColor?: string;
  innerColor?: string;
  baseColor?: string;
  baseScale?: number;
}) {
  const archWidth = size;
  const archHeight = size * 1.1;
  const innerWidth = archWidth * 0.38;
  const innerHeight = archHeight * 0.58;
  const pillarWidth = archWidth * 0.18;
  const baseWidth = archWidth * baseScale;
  const baseHeight = size * 0.18;

  return (
    <View style={[styles.wrap, { width: archWidth, height: archHeight + baseHeight * 0.7 }]}>
      <View
        style={[
          styles.arch,
          {
            width: archWidth,
            height: archHeight,
            borderTopLeftRadius: archWidth / 2,
            borderTopRightRadius: archWidth / 2,
            backgroundColor: archColor,
          },
        ]}
      />
      <View
        style={[
          styles.cutout,
          {
            width: innerWidth,
            height: innerHeight,
            left: (archWidth - innerWidth) / 2,
            top: archHeight * 0.18,
            borderTopLeftRadius: innerWidth / 2,
            borderTopRightRadius: innerWidth / 2,
            backgroundColor: innerColor,
          },
        ]}
      />
      <View
        style={[
          styles.base,
          {
            width: baseWidth,
            height: baseHeight,
            borderRadius: baseHeight,
            backgroundColor: baseColor,
            left: (archWidth - baseWidth) / 2,
            bottom: 0,
          },
        ]}
      />
      <View
        style={[
          styles.cutoutStem,
          {
            width: pillarWidth,
            height: archHeight * 0.42,
            left: (archWidth - pillarWidth) / 2,
            bottom: baseHeight * 0.42,
            backgroundColor: innerColor,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "flex-start",
  },
  arch: {
    position: "absolute",
    left: 0,
    top: 0,
  },
  cutout: {
    position: "absolute",
  },
  cutoutStem: {
    position: "absolute",
    borderBottomLeftRadius: 999,
    borderBottomRightRadius: 999,
  },
  base: {
    position: "absolute",
  },
});
