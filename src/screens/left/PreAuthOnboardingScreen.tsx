import { Image, ImageBackground, Pressable, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LeftIcon, type LeftIconName } from "../../components/icons";
import { styles } from "../../app/leftTheme";

const NOTES: Array<{ icon: LeftIconName; label: string }> = [
  { icon: "users", label: "People in the same place" },
  { icon: "eye", label: "Visible only when it is mutual" },
  { icon: "lock", label: "Venue context, never a public trail" },
];

export function PreAuthOnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  return (
    <ImageBackground
      source={require("../../../assets/onboarding/real-world-connection.jpg")}
      resizeMode="cover"
      blurRadius={5}
      style={[styles.preAuthWrap, { minHeight: Math.max(620, height), width }]}
      imageStyle={styles.preAuthBackgroundImage}
      accessibilityIgnoresInvertColors
    >
      <View style={styles.preAuthScrim} />

      <View
        style={[
          styles.preAuthHeroContent,
          {
            paddingTop: Math.max(24, insets.top + 12),
            paddingBottom: Math.max(24, insets.bottom + 18),
          },
        ]}
      >
        <View style={styles.preAuthBrand}>
          <Image
            source={require("../../../assets/brand/left-mark-white.png")}
            resizeMode="contain"
            style={styles.preAuthLogo}
            accessibilityLabel="Left"
            accessibilityIgnoresInvertColors
          />
          <Text style={styles.preAuthWordmark}>LEFT</Text>
        </View>

        <View style={styles.preAuthHeroBottom}>
          <View style={styles.preAuthCopy}>
            <Text style={styles.preAuthEyebrow}>MEET THE ROOM</Text>
            <Text accessibilityRole="header" style={styles.preAuthTitle}>
              A quieter way to find your people.
            </Text>
            <Text style={styles.preAuthBody}>
              Left helps real conversations begin in the places you already share.
            </Text>
          </View>

          <View accessibilityLabel="What Left is for" style={styles.preAuthNotes}>
            {NOTES.map((note) => (
              <View key={note.label} style={styles.preAuthNoteRow}>
                <View style={styles.preAuthNoteIcon}>
                  <LeftIcon name={note.icon} size={16} color="#FFFFFF" />
                </View>
                <Text style={styles.preAuthNoteText}>{note.label}</Text>
              </View>
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Get started"
            onPress={onComplete}
            style={({ pressed }) => [styles.preAuthCta, pressed && styles.preAuthPressed]}
          >
            <Text style={styles.preAuthCtaLabel}>Get started</Text>
            <LeftIcon name="arrow-up-right" size={19} color="#11110F" />
          </Pressable>

          <Text style={styles.preAuthFootnote}>18+ · Community first · Private by default</Text>
        </View>
      </View>
    </ImageBackground>
  );
}
