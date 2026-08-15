import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, ActivityIndicator, Animated, Easing, Pressable, Text, useWindowDimensions, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { styles, T } from "../../app/leftTheme";
import { LeftLogoMark } from "../../components/left/LeftLogoMark";
import { LeftIcon } from "../../components/icons";
import { GlassSurface, glassRadii } from "../../components/glass";

export function AuthScreen({
  authError,
  busy = false,
  onAuth,
  onEmail,
}: {
  authError: string | null;
  busy?: boolean;
  onAuth: () => void;
  onEmail: () => void;
}) {
  const { height } = useWindowDimensions();
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
    <View style={[styles.authWrap, { minHeight: Math.max(790, height) }]}>
      <LinearGradient
        colors={["rgba(198,227,133,0.24)", "rgba(198,227,133,0.08)", "rgba(255,255,255,0)"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.authHeroArc}
      />

      <View style={styles.authBrand}>
        <Animated.View style={[styles.authMarkRing, { transform: [{ scale: logoScale }] }]}>
          <LeftLogoMark size={70} />
        </Animated.View>
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
              <>
                <Text style={styles.authGoogleLetter}>G</Text>
                <View style={[styles.authGoogleDot, styles.authGoogleDotRed]} />
                <View style={[styles.authGoogleDot, styles.authGoogleDotYellow]} />
                <View style={[styles.authGoogleDot, styles.authGoogleDotGreen]} />
              </>
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
          <LeftIcon name="chevron-right" size={19} color="rgba(31,14,6,0.42)" />
        </Pressable>

        {authError ? <Text style={styles.errorText}>{authError}</Text> : null}
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
