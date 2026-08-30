import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, View } from "react-native";
import { LeftLogoMark } from "./LeftLogoMark";
import { styles } from "../../app/leftTheme";

type LeftLoadingAnimationProps = {
  label?: string;
  size?: "large" | "small";
};

export function LeftLoadingAnimation({
  label = "Loading",
  size = "large",
}: LeftLoadingAnimationProps) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const wave = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    wave.stopAnimation();
    pulse.stopAnimation();

    if (reduceMotion) {
      wave.setValue(0);
      pulse.setValue(0);
      return;
    }

    const waveMotion = Animated.loop(
      Animated.sequence([
        Animated.delay(120),
        Animated.timing(wave, {
          toValue: 1,
          duration: 320,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(wave, {
          toValue: -0.72,
          duration: 430,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(wave, {
          toValue: 0.36,
          duration: 340,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(wave, {
          toValue: 0,
          duration: 430,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.delay(300),
      ]),
    );
    const breathing = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1350,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1350,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ]),
    );
    waveMotion.start();
    breathing.start();

    return () => {
      waveMotion.stop();
      breathing.stop();
    };
  }, [pulse, reduceMotion, wave]);

  const pulseStyle = {
    opacity: pulse.interpolate({
      inputRange: [0, 1],
      outputRange: [0.2, 0.02],
    }),
    transform: [
      {
        scale: pulse.interpolate({
          inputRange: [0, 1],
          outputRange: [0.82, 1.08],
        }),
      },
    ],
  };
  const logoWaveStyle = {
    transform: [
      {
        translateY: wave.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [4, 0, -6],
        }),
      },
      {
        rotate: wave.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: ["3deg", "0deg", "-4deg"],
        }),
      },
      {
        scaleX: wave.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [0.99, 1, 1.018],
        }),
      },
      {
        scaleY: wave.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [0.98, 1, 1.04],
        }),
      },
    ],
  };
  const logoEchoStyle = {
    opacity: wave.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: [0.02, 0.08, 0.16],
    }),
    transform: [
      {
        translateY: wave.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [7, 2, -4],
        }),
      },
      {
        rotate: wave.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: ["2deg", "0deg", "-3deg"],
        }),
      },
      {
        scale: wave.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [0.97, 0.98, 1],
        }),
      },
    ],
  };
  const compact = size === "small";

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      style={[styles.loadingAnimation, compact && styles.loadingAnimationSmall]}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.loadingAnimationPulse,
          compact && styles.loadingAnimationPulseSmall,
          pulseStyle,
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[styles.loadingAnimationLogoEcho, compact && styles.loadingAnimationLogoEchoSmall, logoEchoStyle]}
      >
        <LeftLogoMark size={compact ? 16 : 43} />
      </Animated.View>
      <View style={[styles.loadingAnimationCore, compact && styles.loadingAnimationCoreSmall]}>
        <Animated.View style={[styles.loadingAnimationLogo, compact && styles.loadingAnimationLogoSmall, logoWaveStyle]}>
          <LeftLogoMark size={compact ? 16 : 43} />
        </Animated.View>
      </View>
    </View>
  );
}