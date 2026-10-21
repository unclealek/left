import { t } from "../../features/preferences/translation-runtime";
import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import type { AppUser, AvatarStyle } from "../../types/left-domain";
import {
  avatarStyles,
  conversationStyleOptions,
  interestOptions,
  socialRhythmOptions,
} from "../../app/leftConfig";
import { T, styles } from "../../app/leftTheme";
import { LeftIcon } from "../../components/icons";
import { PrimaryButton, SelectChip } from "../../components/left/ui";
import { ProfileOverview } from "../../components/left/ProfileOverview";
import { ScreenHeader } from "../../components/left/navigation";

export function MeScreen({
  user,
  saveState,
  onSave,
  onOpenSettings,
  onOpenSafety,
  sessionVisible,
  currentVenueName,
  nearbyVenueCount,
  approachCount,
  savedVenueCount,
  onOpenSaved,
  onBecomeVisible,
}: {
  user: AppUser;
  saveState: "idle" | "saving" | "saved" | "error";
  onSave: (input: {
    firstName: string;
    avatarStyle: AvatarStyle;
    defaultIntent: AppUser["defaultIntent"];
    defaultVibes: string[];
    interests: string[];
    offering: string;
    socialRhythm: string;
    conversationStyle: string;
    profilePrompt: string;
  }) => void;
  onOpenSettings: () => void;
  onOpenSafety: () => void;
  sessionVisible: boolean;
  currentVenueName: string;
  nearbyVenueCount: number;
  approachCount: number;
  savedVenueCount: number;
  onOpenSaved: () => void;
  onBecomeVisible: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(user.firstName);
  const [avatarStyle, setAvatarStyle] = useState<AvatarStyle>(user.avatarStyle);
  const [interests, setInterests] = useState<string[]>(user.interests);
  const [offering, setOffering] = useState(user.offering);
  const [socialRhythm, setSocialRhythm] = useState(user.socialRhythm);
  const [conversationStyle, setConversationStyle] = useState(user.conversationStyle);
  const [profilePrompt, setProfilePrompt] = useState(user.profilePrompt);
  const [profileValidationError, setProfileValidationError] = useState<string | null>(null);

  useEffect(() => {
    setFirstName(user.firstName);
    setAvatarStyle(user.avatarStyle);
    setInterests(user.interests);
    setOffering(user.offering);
    setSocialRhythm(user.socialRhythm);
    setConversationStyle(user.conversationStyle);
    setProfilePrompt(user.profilePrompt);
  }, [user]);

  function saveProfileDefaults() {
    if (interests.length < 3) {
      setProfileValidationError(`Choose ${3 - interests.length} more ${3 - interests.length === 1 ? "interest" : "interests"} before saving your profile.`);
      return;
    }
    setProfileValidationError(null);
    onSave({
      firstName,
      avatarStyle,
      defaultIntent: user.defaultIntent,
      defaultVibes: interests,
      interests,
      offering,
      socialRhythm,
      conversationStyle,
      profilePrompt,
    });
  }

  function toggleInterest(interest: string) {
    setInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest],
    );
  }

  return (
    <View style={styles.profilePage}>
      {editing ? (
        <ScreenHeader
          title={t("Edit profile")}
          onBack={() => setEditing(false)}
          variant="utility"
          trailing={(
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open settings"
              onPress={onOpenSettings}
              style={({ pressed }) => [styles.profileEditHeaderButton, pressed && styles.iconButtonPressed]}
            >
              <LeftIcon name="settings" size={20} color={T.primary} />
            </Pressable>
          )}
        />
      ) : null}

      {!editing ? <ProfileOverview user={user} sessionVisible={sessionVisible} currentVenueName={currentVenueName}
        nearbyVenueCount={nearbyVenueCount} approachCount={approachCount} savedVenueCount={savedVenueCount}
        onEdit={() => setEditing(true)} onOpenSettings={onOpenSettings} onOpenSafety={onOpenSafety}
        onOpenSaved={onOpenSaved} onBecomeVisible={onBecomeVisible} /> : null}

      {editing ? (
        <View style={styles.profileEditCard}>
          <View style={styles.settingsInputRow}>
            <Text style={styles.settingsEditLabel}>{t("First name")}</Text>
            <TextInput
              value={firstName}
              onChangeText={(value) => setFirstName(value.split(" ")[0] ?? "")}
              placeholder={t("Your first name")}
              placeholderTextColor={T.textMuted}
              style={styles.settingsInlineInput}
              autoCapitalize="words"
            />
          </View>

          <Text style={styles.settingsEditLabel}>{t("Avatar style")}</Text>
          <View style={styles.chipWrap}>
            {avatarStyles.map((style) => (
              <SelectChip
                key={style}
                label={t(`${style.charAt(0).toUpperCase()}${style.slice(1)}`)}
                active={avatarStyle === style}
                onPress={() => setAvatarStyle(style)}
              />
            ))}
          </View>

          <View style={styles.profileRefinementHeader}>
            <Text style={styles.profileRefinementTitle}>{t("Your interests")}</Text>
            <Text style={styles.profileRefinementSubtitle}>{t("Choose at least three. These become the vibes you can select when you go visible.")}</Text>
          </View>

          <Text style={styles.settingsEditLabel}>{t("What draws you out?")}</Text>
          <View style={styles.chipWrap}>
            {interestOptions.map((interest) => (
              <SelectChip
                key={interest}
                label={t(interest)}
                active={interests.includes(interest)}
                onPress={() => toggleInterest(interest)}
              />
            ))}
          </View>
          {interests.length < 3 ? <Text style={styles.errorText}>{t(3 - interests.length === 1 ? "Choose {count} more interest to finish this section." : "Choose {count} more interests to finish this section.", { count: 3 - interests.length })}</Text> : null}

          <Text style={styles.settingsEditLabel}>{t("When are you usually open to meeting?")}</Text>
          <View style={styles.chipWrap}>
            {socialRhythmOptions.map((rhythm) => (
              <SelectChip
                key={rhythm}
                label={t(rhythm)}
                active={socialRhythm === rhythm}
                onPress={() => setSocialRhythm(rhythm)}
              />
            ))}
          </View>

          <Text style={styles.settingsEditLabel}>{t("Conversation style")}</Text>
          <View style={styles.chipWrap}>
            {conversationStyleOptions.map((style) => (
              <SelectChip
                key={style}
                label={t(style)}
                active={conversationStyle === style}
                onPress={() => setConversationStyle(style)}
              />
            ))}
          </View>

          <View style={styles.settingsInputRow}>
            <Text style={styles.settingsEditLabel}>{t("What might you bring to a conversation?")}</Text>
            <TextInput
              value={offering}
              onChangeText={(value) => setOffering(value.slice(0, 220))}
              placeholder={t("A perspective, a skill, or simply a listening ear…")}
              placeholderTextColor={T.textMuted}
              style={[styles.settingsInlineInput, styles.profileOfferingInput]}
              multiline
            />
            <Text style={styles.profileInputCount}>{`${offering.length}/220`}</Text>
          </View>

          <View style={styles.profileEditActions}>
            <PrimaryButton
              label={saveState === "saving" ? t("Saving...") : saveState === "saved" ? t("Saved") : t("Save Changes")}
              onPress={saveProfileDefaults}
              loading={saveState === "saving"}
            />
            <Pressable onPress={() => setEditing(false)} style={({ pressed }) => [styles.profileEditCancel, pressed && styles.iconButtonPressed]}>
              <Text style={styles.profileEditCancelText}>{t("Cancel")}</Text>
            </Pressable>
          </View>
          {profileValidationError ? <Text style={styles.errorText}>{t(profileValidationError)}</Text> : null}
          {saveState === "error" ? <Text style={styles.errorText}>{t("We couldn’t save your profile settings. Check your connection and try again.")}</Text> : null}
        </View>
      ) : null}

    </View>
  );
}
