import { useEffect, useState } from "react";
import { Text, TextInput, View } from "react-native";
import type { AppUser, AvatarStyle } from "../../types/left-domain";
import { AVATAR_GLYPHS, avatarStyles, intents, vibeOptions } from "../../app/leftConfig";
import { T, styles } from "../../app/leftTheme";
import { GhostButton, FieldBlock, PrimaryButton, SelectChip } from "../../components/left/ui";

export function SettingsScreen({
  user,
  saveState,
  deletionState,
  onSave,
  onOpenSafety,
  onSignOut,
  onRequestDeletion,
}: {
  user: AppUser;
  saveState: "idle" | "saving" | "saved" | "error";
  deletionState: "idle" | "submitting" | "submitted" | "error";
  onSave: (input: {
    firstName: string;
    avatarStyle: AvatarStyle;
    defaultIntent: AppUser["defaultIntent"];
    defaultVibes: string[];
  }) => void;
  onOpenSafety: () => void;
  onSignOut: () => void;
  onRequestDeletion: () => void;
}) {
  const [firstName, setFirstName] = useState(user.firstName);
  const [avatarStyle, setAvatarStyle] = useState<AvatarStyle>(user.avatarStyle);
  const [defaultIntent, setDefaultIntent] = useState<AppUser["defaultIntent"]>(user.defaultIntent);
  const [defaultVibes, setDefaultVibes] = useState<string[]>(user.defaultVibes);

  useEffect(() => {
    setFirstName(user.firstName);
    setAvatarStyle(user.avatarStyle);
    setDefaultIntent(user.defaultIntent);
    setDefaultVibes(user.defaultVibes);
  }, [user]);

  function toggleVibe(vibe: string) {
    setDefaultVibes((current) => {
      const exists = current.includes(vibe);
      if (exists) return current.filter((value) => value !== vibe);
      if (current.length >= 2) return [current[0], vibe];
      return [...current, vibe];
    });
  }

  return (
    <View style={styles.settingsPage}>
      <View style={styles.settingsHeader}>
        <View style={styles.settingsAvatar}>
          <Text style={styles.settingsAvatarGlyph}>{AVATAR_GLYPHS[avatarStyle]}</Text>
        </View>
        <View style={styles.settingsIdentity}>
          <Text style={styles.settingsTitle}>Your profile</Text>
          <Text style={styles.settingsSubtitle}>Manage your defaults, visibility preferences, and account actions.</Text>
        </View>
      </View>

      <FieldBlock label="First name">
        <TextInput
          value={firstName}
          onChangeText={(value) => setFirstName(value.split(" ")[0] ?? "")}
          placeholder="Your first name"
          placeholderTextColor={T.textMuted}
          style={styles.input}
          autoCapitalize="words"
        />
      </FieldBlock>

      <FieldBlock label="Avatar style">
        <View style={styles.avatarGrid}>
          {avatarStyles.map((style) => (
            <SelectChip
              key={style}
              label={style}
              active={avatarStyle === style}
              onPress={() => setAvatarStyle(style)}
            />
          ))}
        </View>
      </FieldBlock>

      <FieldBlock label="Default intent">
        <View style={styles.chipWrap}>
          {intents.map((intent) => (
            <SelectChip
              key={intent.id}
              label={intent.label}
              active={defaultIntent === intent.id}
              onPress={() => setDefaultIntent(intent.id)}
            />
          ))}
        </View>
      </FieldBlock>

      <FieldBlock label="Default vibes">
        <View style={styles.chipWrap}>
          {vibeOptions.map((vibe) => (
            <SelectChip
              key={vibe}
              label={vibe}
              active={defaultVibes.includes(vibe)}
              onPress={() => toggleVibe(vibe)}
            />
          ))}
        </View>
      </FieldBlock>

      <View style={styles.settingsActionStack}>
        <PrimaryButton
          label={saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved ✓" : "Save profile defaults"}
          onPress={() => onSave({ firstName, avatarStyle, defaultIntent, defaultVibes })}
        />
        <GhostButton label="Safety controls" onPress={onOpenSafety} />
      </View>

      <View style={styles.settingsInfoCard}>
        <Text style={styles.settingsInfoTitle}>Account</Text>
        <Text style={styles.settingsInfoBody}>
          Signed in with {user.authProvider}. Identity removal strips direct identity fields while retaining selected product records like hints, venue history, and safety zones.
        </Text>
      </View>

      <View style={styles.settingsDangerStack}>
        <GhostButton label="Sign out" onPress={onSignOut} />
        <GhostButton
          label={
            deletionState === "submitting"
              ? "Submitting identity removal..."
              : deletionState === "submitted"
                ? "Identity removal requested"
                : "Request identity removal"
          }
          onPress={onRequestDeletion}
          destructive
        />
      </View>

      {saveState === "error" ? <Text style={styles.errorText}>We could not save your profile settings yet.</Text> : null}
      {deletionState === "submitted" ? (
        <Text style={styles.settingsSuccessText}>We recorded your identity-removal request and the backend can now process it under the retention policy.</Text>
      ) : null}
      {deletionState === "error" ? (
        <Text style={styles.errorText}>We could not submit your identity-removal request yet.</Text>
      ) : null}
    </View>
  );
}
