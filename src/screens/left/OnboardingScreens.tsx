import { Pressable, Switch, Text, TextInput, View } from "react-native";
import type { AvatarStyle } from "../../types/left-domain";
import { AVATAR_GLYPHS, avatarStyles } from "../../app/leftConfig";
import { T, styles } from "../../app/leftTheme";
import { Card, PrimaryButton } from "../../components/left/ui";

export function NameScreen({
  firstNameDraft,
  onChangeFirstName,
  onContinue,
}: {
  firstNameDraft: string;
  onChangeFirstName: (v: string) => void;
  onContinue: () => void;
}) {
  return (
    <Card step="01" total="03">
      <Text style={styles.cardTitle}>First name{"\n"}only.</Text>
      <Text style={styles.cardBody}>No surnames, handles, or linked socials. Identity stays light.</Text>
      <TextInput
        value={firstNameDraft}
        onChangeText={(v) => onChangeFirstName(v.split(" ")[0] ?? "")}
        placeholder="Your first name"
        placeholderTextColor={T.textMuted}
        style={styles.input}
        autoCapitalize="words"
      />
      <PrimaryButton label="Continue" onPress={onContinue} />
    </Card>
  );
}

export function AvatarScreen({
  avatarStyle,
  onPick,
  onContinue,
}: {
  avatarStyle: AvatarStyle;
  onPick: (s: AvatarStyle) => void;
  onContinue: () => void;
}) {
  return (
    <Card step="02" total="03">
      <Text style={styles.cardTitle}>Choose your{"\n"}avatar style.</Text>
      <Text style={styles.cardBody}>No photo upload. Identity is intentionally abstract.</Text>
      <View style={styles.avatarGrid}>
        {avatarStyles.map((style) => (
          <Pressable key={style} onPress={() => onPick(style)} style={[styles.avatarTile, avatarStyle === style && styles.avatarTileActive]}>
            <Text style={[styles.avatarGlyph, avatarStyle === style && styles.avatarGlyphActive]}>
              {AVATAR_GLYPHS[style]}
            </Text>
            <Text style={[styles.avatarTileLabel, avatarStyle === style && styles.avatarTileLabelActive]}>
              {style}
            </Text>
          </Pressable>
        ))}
      </View>
      <PrimaryButton label="Continue" onPress={onContinue} />
    </Card>
  );
}

export function LocationScreen({
  authError,
  enabled,
  onToggle,
  onContinue,
}: {
  authError: string | null;
  enabled: boolean;
  onToggle: () => void;
  onContinue: () => void;
}) {
  return (
    <Card step="03" total="03">
      <Text style={styles.cardTitle}>Location is{"\n"}load-bearing.</Text>
      <Text style={styles.cardBody}>
        We use background location to detect when you're in a venue. We never share it.
      </Text>
      <Pressable onPress={onToggle} style={styles.toggleRow}>
        <View style={styles.toggleTextWrap}>
          <Text style={styles.toggleLabel}>Background location</Text>
          <Text style={styles.toggleSub}>{enabled ? "Enabled" : "Tap to enable"}</Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{ true: T.accent, false: T.inkMid }}
          thumbColor={T.textPrimary}
        />
      </Pressable>
      <PrimaryButton label="Finish setup" onPress={onContinue} />
      {authError ? <Text style={styles.errorText}>{authError}</Text> : null}
    </Card>
  );
}
