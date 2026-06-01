import { Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "../../app/leftTheme";

export function AuthScreen({ authError, onAuth }: { authError: string | null; onAuth: () => void }) {
  return (
    <View style={styles.authWrap}>
      <LinearGradient colors={["#0e0c18", "#141126", "#0c0b14"]} style={styles.absoluteFill} />
      <View style={styles.authGlowTop} pointerEvents="none" />
      <View style={styles.authGlowBottom} pointerEvents="none" />
      <View style={styles.authBrand}>
        <View style={styles.authMarkRing}>
          <Text style={styles.authMarkChevron}>{"<"}</Text>
          <View style={styles.authMarkDot} />
        </View>
        <View style={styles.authWordmarkWrap}>
          <View style={styles.authWordmarkRule} />
          <Text style={styles.authWordmark}>LEFT</Text>
          <View style={styles.authWordmarkRule} />
        </View>
      </View>
      <View style={styles.authCard}>
        <View style={styles.authCardAccentLine} />
        <Text style={styles.authHeadline}>A reality-first{"\n"}social layer.</Text>
        <Text style={styles.authSub}>
          Set a first name, choose an avatar, and only appear when you intentionally activate.
        </Text>
        <Pressable onPress={onAuth} style={({ pressed }) => [styles.authBtn, pressed && styles.authBtnPressed]}>
          <View style={styles.authBtnGIcon}>
            <Text style={styles.authBtnG}>G</Text>
          </View>
          <Text style={styles.authBtnLabel}>Continue with Google</Text>
        </Pressable>
        {authError ? <Text style={styles.errorText}>{authError}</Text> : null}
      </View>
      <View style={styles.authFooter}>
        <View style={styles.authFooterLinks}>
          <Text style={styles.authFooterLink}>Privacy Policy</Text>
          <Text style={styles.authFooterDivider}>·</Text>
          <Text style={styles.authFooterLink}>Terms of Service</Text>
        </View>
        <Text style={styles.authFooterCopy}>© 2026 LEFT SOCIAL</Text>
      </View>
    </View>
  );
}
