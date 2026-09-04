import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { T } from "../theme";

export function OnboardingAmbientScribbles() {
  const motion = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    motion.stopAnimation();
    if (reduceMotion) {
      motion.setValue(0.35);
      return;
    }

    motion.setValue(0);
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(motion, {
          toValue: 1,
          duration: 9000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(motion, {
          toValue: 0,
          duration: 9000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [motion, reduceMotion]);

  const driftRight = motion.interpolate({ inputRange: [0, 1], outputRange: [-8, 10] });
  const driftLeft = motion.interpolate({ inputRange: [0, 1], outputRange: [7, -9] });
  const driftDown = motion.interpolate({ inputRange: [0, 1], outputRange: [-5, 11] });
  const rotateSoft = motion.interpolate({ inputRange: [0, 1], outputRange: ["-3deg", "4deg"] });
  const rotateReverse = motion.interpolate({ inputRange: [0, 1], outputRange: ["4deg", "-3deg"] });

  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={StyleSheet.absoluteFill}
    >
      <Animated.View
        style={[
          styles.scribble,
          styles.scribbleTop,
          { transform: [{ translateX: driftRight }, { translateY: driftDown }, { rotate: rotateSoft }] },
        ]}
      >
        <Svg width={230} height={150} viewBox="0 0 230 150">
          <Path
            d="M9 92C38 19 96 8 131 43c30 30 2 72 31 88 20 11 45-4 58-26"
            fill="none"
            stroke={T.onboardingAccent}
            strokeDasharray="7 11"
            strokeLinecap="round"
            strokeWidth={2}
          />
          <Path
            d="M38 112c18-28 49-42 78-31 21 8 31 28 54 30"
            fill="none"
            stroke={T.onboardingInk}
            strokeLinecap="round"
            strokeWidth={1.5}
          />
        </Svg>
      </Animated.View>

      <Animated.View
        style={[
          styles.scribble,
          styles.scribbleMiddle,
          { transform: [{ translateX: driftLeft }, { rotate: rotateReverse }] },
        ]}
      >
        <Svg width={170} height={190} viewBox="0 0 170 190">
          <Path
            d="M151 12c-43 13-67 34-61 62 5 23 35 29 30 55-4 21-34 31-75 49"
            fill="none"
            stroke={T.onboardingAccent}
            strokeLinecap="round"
            strokeWidth={1.8}
          />
          <Path
            d="M139 55c-19 13-26 29-14 44 8 10 22 14 28 29"
            fill="none"
            stroke={T.onboardingInk}
            strokeDasharray="4 10"
            strokeLinecap="round"
            strokeWidth={1.5}
          />
        </Svg>
      </Animated.View>

      <Animated.View
        style={[
          styles.scribble,
          styles.scribbleBottom,
          { transform: [{ translateX: driftRight }, { translateY: driftDown }, { rotate: rotateSoft }] },
        ]}
      >
        <Svg width={210} height={125} viewBox="0 0 210 125">
          <Path
            d="M4 92c31-58 67-75 102-45 23 20 39 19 94-31"
            fill="none"
            stroke={T.onboardingAccent}
            strokeDasharray="6 12"
            strokeLinecap="round"
            strokeWidth={1.9}
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  scribble: {
    position: "absolute",
    opacity: 0.2,
  },
  scribbleTop: {
    top: 90,
    right: -72,
  },
  scribbleMiddle: {
    top: "43%",
    left: -72,
    opacity: 0.15,
  },
  scribbleBottom: {
    right: -52,
    bottom: 70,
    opacity: 0.17,
  },
});
