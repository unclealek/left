import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, ActivityIndicator, Animated, Easing, Pressable, Text, useWindowDimensions, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { styles, T } from "../../app/leftTheme";
import { LeftLogoMark } from "../../components/left/LeftLogoMark";
import { LeftIcon } from "../../components/icons";
import { GlassSurface, glassRadii } from "../../components/glass";

function GoogleLogo() {
  return (
    <Svg width={21} height={21} viewBox="0 0 24 24" accessibilityLabel="Google">
      <Path
        fill="#4285F4"
        d="M21.35 11.1h-9.18v3.8h5.26c-.23 1.22-.93 2.25-1.98 2.94l3.2 2.48c1.87-1.72 2.95-4.26 2.95-7.28 0-.69-.06-1.35-.25-1.94Z"
      />
      <Path
        fill="#34A853"
        d="M12.17 22c2.67 0 4.91-.88 6.55-2.38l-3.2-2.48c-.88.59-2.01.94-3.35.94-2.58 0-4.77-1.74-5.55-4.09H3.31v2.56A9.9 9.9 0 0 0 12.17 22Z"
      />
      <Path
        fill="#FBBC05"
        d="M6.62 13.99a5.98 5.98 0 0 1 0-3.81V7.62H3.31a9.93 9.93 0 0 0 0 8.94l3.31-2.57Z"
      />
      <Path
        fill="#EA4335"
        d="M12.17 6.09c1.45 0 2.75.5 3.78 1.48l2.84-2.84C17.08 3.14 14.84 2 12.17 2a9.9 9.9 0 0 0-8.86 5.62l3.31 2.56c.78-2.35 2.97-4.09 5.55-4.09Z"
      />
    </Svg>
  );
}

export function AuthScreen({
  authError,
  busy = false,
  onAuth,
  onEmail,
  onOpenLegal,
}: {
  authError: string | null;
  busy?: boolean;
  onAuth: () => void;
  onEmail: () => void;
  onOpenLegal: (document: "terms" | "privacy" | "community") => void;
}) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const logoPulse = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    logoPulse.stopAnimation();

    if (reduceMotion) {
      logoPulse.setValue(0);
      return;
    }

    logoPulse.setValue(0);
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(logoPulse, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(logoPulse, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [logoPulse, reduceMotion]);

  const logoScale = logoPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.055],
  });

  return (
    <View
      style={[
        styles.authWrap,
        {
          minHeight: Math.max(620, height),
          paddingTop: Math.max(48, insets.top + 16),
          paddingBottom: Math.max(24, insets.bottom + 16),
        },
      ]}
    >
      <LinearGradient
        colors={[T.onboardingAccentMedium, T.onboardingAccentFaint, "transparent"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.authHeroArc}
      />

      <View style={styles.authBrand}>
        <Animated.View style={[styles.authMarkRing, { transform: [{ scale: logoScale }] }]}>
          <LeftLogoMark size={58} />
        </Animated.View>
        <Text style={styles.authWordmark}>LEFT</Text>
      </View>

      <GlassSurface
        variant="medium"
        radius={glassRadii.largeCard}
        style={styles.authCardGlass}
        contentStyle={styles.authCard}
      >
        <Text style={styles.authEyebrow}>WELCOME TO LEFT</Text>
        <Text style={styles.authHeadline}>People. Places.{"\n"}Presence.</Text>
        <Text style={styles.authSub}>Connection starts with being there.{"\n"}See where the energy is.</Text>

        <Pressable
          onPress={onAuth}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel="Continue with Google"
          accessibilityState={{ disabled: busy, busy }}
          style={({ pressed }) => [
            styles.authGoogleButton,
            busy && styles.authButtonDisabled,
            pressed && !busy && styles.authBtnPressed,
          ]}
        >
          <View style={styles.authGoogleIcon}>
            {busy ? (
              <ActivityIndicator size="small" color={T.onboardingInk} />
            ) : (
              <GoogleLogo />
            )}
          </View>
          <Text style={styles.authGoogleLabel}>{busy ? "Opening Google..." : "Continue with Google"}</Text>
        </Pressable>

        <View style={styles.authDividerRow}>
          <View style={styles.authDivider} />
          <Text style={styles.authDividerLabel}>or</Text>
          <View style={styles.authDivider} />
        </View>

        <Pressable
          onPress={onEmail}
          accessibilityRole="button"
          accessibilityLabel="Email sign-in coming soon"
          style={({ pressed }) => [styles.authEmailButton, pressed && styles.authBtnPressed]}
        >
          <View>
            <Text style={styles.authEmailLabel}>Continue with email</Text>
            <Text style={styles.authEmailComingSoon}>Coming soon</Text>
          </View>
          <LeftIcon name="chevron-right" size={19} color={T.onboardingInkMuted} />
        </Pressable>

        {authError ? <Text style={styles.errorText}>{authError}</Text> : null}

        <View style={styles.authLegalRow}>
          <Pressable accessibilityRole="link" onPress={() => onOpenLegal("terms")}>
            <Text style={styles.authLegalLink}>Terms</Text>
          </Pressable>
          <Text style={styles.authLegalSeparator}>·</Text>
          <Pressable accessibilityRole="link" onPress={() => onOpenLegal("privacy")}>
            <Text style={styles.authLegalLink}>Privacy</Text>
          </Pressable>
          <Text style={styles.authLegalSeparator}>·</Text>
          <Pressable accessibilityRole="link" onPress={() => onOpenLegal("community")}>
            <Text style={styles.authLegalLink}>Guidelines</Text>
          </Pressable>
        </View>
      </GlassSurface>

      <View style={styles.authPrivacyRow}>
        <View style={styles.authPrivacyIcon}>
          <LeftIcon name="lock" size={23} color={T.onboardingInk} />
        </View>
        <View style={styles.authPrivacyCopy}>
          <Text style={styles.authPrivacyTitle}>Your presence. Your choice.</Text>
          <Text style={styles.authPrivacyBody}>Your exact location is not shown to other people. You choose when your presence becomes visible.</Text>
        </View>
      </View>
    </View>
  );
}
