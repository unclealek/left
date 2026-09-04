import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, Pressable, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { styles, T } from "../../app/leftTheme";
import { LeftLogoMark } from "../../components/left/LeftLogoMark";
import { LeftLoadingAnimation } from "../../components/left/LeftLoadingAnimation";
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
  onBack,
  onOpenLegal,
}: {
  authError: string | null;
  busy?: boolean;
  onAuth: () => void;
  onBack: () => void;
  onOpenLegal: (document: "terms" | "privacy" | "community") => void;
}) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const entrance = useRef(new Animated.Value(0)).current;
  const ambient = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    entrance.stopAnimation();
    ambient.stopAnimation();

    if (reduceMotion) {
      entrance.setValue(1);
      ambient.setValue(0);
      return;
    }

    entrance.setValue(0);
    ambient.setValue(0);

    Animated.timing(entrance, {
      toValue: 1,
      duration: 620,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    const ambientAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(ambient, {
          toValue: 1,
          duration: 3600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(ambient, {
          toValue: 0,
          duration: 3600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    ambientAnimation.start();
    return () => ambientAnimation.stop();
  }, [ambient, entrance, reduceMotion]);

  const contentTranslateY = entrance.interpolate({
    inputRange: [0, 1],
    outputRange: [18, 0],
  });
  const ambientScale = ambient.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1.06],
  });
  const ambientTranslateY = ambient.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 12],
  });
  const ambientOpacity = ambient.interpolate({
    inputRange: [0, 1],
    outputRange: [0.42, 0.68],
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
      <View pointerEvents="none" style={styles.authAmbientLayer}>
        <Animated.View
          style={[
            styles.authAmbientOrb,
            styles.authAmbientOrbOne,
            {
              opacity: ambientOpacity,
              transform: [{ translateY: ambientTranslateY }, { scale: ambientScale }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.authAmbientOrb,
            styles.authAmbientOrbTwo,
            {
              opacity: ambientOpacity,
              transform: [{ translateY: Animated.multiply(ambientTranslateY, -0.7) }],
            },
          ]}
        />
      </View>

      <Animated.View
        style={[
          styles.authStage,
          {
            opacity: entrance,
            transform: [{ translateY: contentTranslateY }],
          },
        ]}
      >
        <View style={styles.authFlowHeader}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to welcome"
            onPress={onBack}
            style={({ pressed }) => [styles.authBackButton, pressed && styles.authBtnPressed]}
          >
            <LeftIcon name="arrow-left" size={21} color={T.onboardingInk} />
          </Pressable>
          <View style={styles.authStepBadge}>
            <View style={styles.authStepDot} />
            <Text style={styles.authStepBadgeText}>SECURE SIGN IN</Text>
          </View>
          <View style={styles.authHeaderSpacer} />
        </View>

        <View style={styles.authBrand}>
          <View style={styles.authMarkRing}>
            <LeftLogoMark size={47} />
          </View>
          <Text style={styles.authWordmark}>LEFT</Text>
        </View>

        <GlassSurface
          variant="medium"
          radius={glassRadii.largeCard}
          style={styles.authCardGlass}
          contentStyle={styles.authCard}
        >
          <Text style={styles.authEyebrow}>FAST & SECURE</Text>
          <Text style={styles.authHeadline}>Let’s get you in.</Text>
          <Text style={styles.authSub}>Create your account or continue where you left off with one effortless sign-in.</Text>

          <View style={styles.authBenefitList}>
            {[
              { icon: "key" as const, title: "No passwords to remember", body: "Instant one-tap access without credential fatigue." },
              { icon: "shield" as const, title: "Zero spam or auto-posts", body: "We never share or post without your consent." },
              { icon: "users" as const, title: "Real human connections", body: "One account for genuine, place-based connection." },
            ].map((benefit, index, benefits) => (
              <View key={benefit.title} style={[styles.authBenefitRow, index < benefits.length - 1 && styles.authBenefitDivider]}>
                <View style={styles.authBenefitIcon}>
                  <LeftIcon name={benefit.icon} size={18} color={T.onboardingAccent} />
                </View>
                <View style={styles.authBenefitCopy}>
                  <Text style={styles.authBenefitTitle}>{benefit.title}</Text>
                  <Text style={styles.authBenefitBody}>{benefit.body}</Text>
                </View>
              </View>
            ))}
          </View>

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
            {busy ? (
              <View style={styles.authGoogleLoading}>
                <LeftLoadingAnimation size="small" label="Connecting securely with Google" />
              </View>
            ) : (
              <View style={styles.authGoogleIcon}>
                <GoogleLogo />
              </View>
            )}
            <Text style={styles.authGoogleLabel}>{busy ? "Connecting securely" : "Continue with Google"}</Text>
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

        <Text style={styles.authMemberNote}>Existing and new members sign in together.</Text>
      </Animated.View>
    </View>
  );
}
