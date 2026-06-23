import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import type { AppUser, AvatarStyle } from "../../types/left-domain";
import { AVATAR_GLYPHS, avatarStyles, intents, vibeOptions } from "../../app/leftConfig";
import { T, styles } from "../../app/leftTheme";
import { LeftAvatar } from "../../components/left/LeftAvatar";
import { PrimaryButton, SelectChip } from "../../components/left/ui";

export function MeScreen({
  user,
  saveState,
  onSave,
  onOpenSettings,
}: {
  user: AppUser;
  saveState: "idle" | "saving" | "saved" | "error";
  onSave: (input: {
    firstName: string;
    avatarStyle: AvatarStyle;
    defaultIntent: AppUser["defaultIntent"];
    defaultVibes: string[];
    profilePrompt: string;
    approachPrompt: string;
  }) => void;
  onOpenSettings: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(user.firstName);
  const [avatarStyle, setAvatarStyle] = useState<AvatarStyle>(user.avatarStyle);
  const [defaultIntent, setDefaultIntent] = useState<AppUser["defaultIntent"]>(user.defaultIntent);
  const [defaultVibes, setDefaultVibes] = useState<string[]>(user.defaultVibes);
  const [profilePrompt, setProfilePrompt] = useState(user.profilePrompt);
  const [approachPrompt, setApproachPrompt] = useState(user.approachPrompt);

  useEffect(() => {
    setFirstName(user.firstName);
    setAvatarStyle(user.avatarStyle);
    setDefaultIntent(user.defaultIntent);
    setDefaultVibes(user.defaultVibes);
    setProfilePrompt(user.profilePrompt);
    setApproachPrompt(user.approachPrompt);
  }, [user]);

  function toggleVibe(vibe: string) {
    setDefaultVibes((current) => {
      const exists = current.includes(vibe);
      if (exists) return current.filter((value) => value !== vibe);
      if (current.length >= 2) return [current[0], vibe];
      return [...current, vibe];
    });
  }

  function saveProfileDefaults() {
    onSave({ firstName, avatarStyle, defaultIntent, defaultVibes, profilePrompt, approachPrompt });
  }

  const intent = (user.defaultIntent ?? "networking").replaceAll("_", " ");
  const vibes = user.defaultVibes.length ? user.defaultVibes.join(", ") : "Open";
  const displayedAvatarStyle = editing ? avatarStyle : user.avatarStyle;

  return (
    <View style={styles.profilePage}>
      <View style={styles.profileTopBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={editing ? "Return to profile" : "Back"}
          onPress={editing ? () => setEditing(false) : undefined}
          style={({ pressed }) => [styles.profileHeaderButton, pressed && styles.iconButtonPressed]}
        >
          <Feather name="chevron-left" size={28} color={T.textPrimary} />
        </Pressable>
        <Text style={styles.profileHeaderTitle}>Profile</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={editing ? "Open settings" : "Edit profile"}
          onPress={() => (editing ? onOpenSettings() : setEditing(true))}
          style={({ pressed }) => [styles.profileEditHeaderButton, pressed && styles.iconButtonPressed]}
        >
          <Text style={styles.profileEditHeaderText}>{editing ? "Settings" : "Edit"}</Text>
        </Pressable>
      </View>

      <View style={styles.profileHero}>
        <LeftAvatar name={firstName} avatarStyle={displayedAvatarStyle} size="lg" />
        <Text style={styles.profileDisplayName}>{user.firstName}</Text>
        <View style={styles.profileRolePill}>
          <Text style={styles.profileRoleText}>{intent}</Text>
        </View>
      </View>

      <Text style={styles.profileSectionTitle}>Personal Information</Text>
      <View style={styles.profileInfoCard}>
        <ProfileInfoRow label="First Name" value={user.firstName} />
        <ProfileInfoRow label="Intent" value={intent} />
        <ProfileInfoRow label="Vibes" value={vibes} />
        <ProfileInfoRow label="Avatar Style" value={user.avatarStyle} last />
      </View>

      {editing ? (
        <View style={styles.profileEditCard}>
          <View style={styles.settingsInputRow}>
            <Text style={styles.settingsEditLabel}>First name</Text>
            <TextInput
              value={firstName}
              onChangeText={(value) => setFirstName(value.split(" ")[0] ?? "")}
              placeholder="Your first name"
              placeholderTextColor={T.textMuted}
              style={styles.settingsInlineInput}
              autoCapitalize="words"
            />
          </View>

          <Text style={styles.settingsEditLabel}>Avatar style</Text>
          <View style={styles.chipWrap}>
            {avatarStyles.map((style) => (
              <SelectChip
                key={style}
                label={`${AVATAR_GLYPHS[style]} ${style}`}
                active={avatarStyle === style}
                onPress={() => setAvatarStyle(style)}
              />
            ))}
          </View>

          <Text style={styles.settingsEditLabel}>Default intent</Text>
          <View style={styles.chipWrap}>
            {intents.map((intentOption) => (
              <SelectChip
                key={intentOption.id}
                label={intentOption.label}
                active={defaultIntent === intentOption.id}
                onPress={() => setDefaultIntent(intentOption.id)}
              />
            ))}
          </View>

          <Text style={styles.settingsEditLabel}>Default vibes</Text>
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

          <Text style={styles.settingsEditLabel}>Approach prompt</Text>
          <TextInput
            value={approachPrompt}
            onChangeText={setApproachPrompt}
            placeholder="What should Left suggest when you're walking over?"
            placeholderTextColor={T.textMuted}
            style={[styles.settingsInlineInput, styles.settingsPromptInput]}
            multiline
            maxLength={160}
          />

          <View style={styles.profileEditActions}>
            <PrimaryButton
              label={saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved" : "Save Changes"}
              onPress={saveProfileDefaults}
              disabled={saveState === "saving"}
            />
            <Pressable onPress={() => setEditing(false)} style={({ pressed }) => [styles.profileEditCancel, pressed && styles.iconButtonPressed]}>
              <Text style={styles.profileEditCancelText}>Cancel</Text>
            </Pressable>
          </View>
          {saveState === "error" ? <Text style={styles.errorText}>We could not save your profile settings yet.</Text> : null}
        </View>
      ) : null}

      <View style={styles.profileAboutBlock}>
        <Text style={styles.profileSectionTitle}>About Me</Text>
        <View style={styles.profileAboutRule} />
        <Text style={styles.profileAboutText}>{user.approachPrompt}</Text>
      </View>
    </View>
  );
}

function ProfileInfoRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.profileInfoRow, last && styles.profileInfoRowLast]}>
      <Text style={styles.profileInfoLabel}>{label}</Text>
      <View style={styles.profileInfoValueWrap}>
        <Text style={styles.profileInfoValue} numberOfLines={1}>{value}</Text>
      </View>
    </View>
  );
}
