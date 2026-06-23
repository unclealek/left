import { Text, View } from "react-native";
import type { AvatarStyle } from "../../types/left-domain";
import { AVATAR_GLYPHS } from "../../app/leftConfig";
import { styles } from "../../app/leftTheme";

function getInitials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "ME"
  );
}

export function LeftAvatar({
  name,
  avatarStyle = "geometric",
  size = "md",
}: {
  name: string;
  avatarStyle?: AvatarStyle | null;
  size?: "sm" | "md" | "lg";
}) {
  const resolvedStyle = avatarStyle ?? "geometric";
  const isLarge = size === "lg";
  const isSmall = size === "sm";

  const avatar = (
    <View
      style={[
        styles.leftAvatarCircle,
        isLarge && styles.leftAvatarCircleLg,
        isSmall && styles.leftAvatarCircleSm,
        resolvedStyle === "abstract" && styles.leftAvatarCircleAbstract,
        resolvedStyle === "minimal" && styles.leftAvatarCircleMinimal,
        resolvedStyle === "soft" && styles.leftAvatarCircleSoft,
      ]}
    >
      <Text
        style={[
          styles.leftAvatarGlyphMark,
          isLarge && styles.leftAvatarGlyphMarkLg,
          isSmall && styles.leftAvatarGlyphMarkSm,
        ]}
      >
        {AVATAR_GLYPHS[resolvedStyle]}
      </Text>
      <Text
        style={[
          styles.leftAvatarText,
          isLarge && styles.leftAvatarTextLg,
          isSmall && styles.leftAvatarTextSm,
          resolvedStyle === "minimal" && styles.leftAvatarTextMinimal,
        ]}
      >
        {getInitials(name)}
      </Text>
    </View>
  );

  if (!isLarge) return avatar;

  return (
    <View style={styles.leftAvatarRingLg}>
      {avatar}
    </View>
  );
}
