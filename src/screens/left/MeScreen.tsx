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
import { LeftIcon, type LeftIconName } from "../../components/icons";
import { LeftLogoMark } from "../../components/left/LeftLogoMark";
import { PrimaryButton, SelectChip } from "../../components/left/ui";
import { ScreenHeader } from "../../components/left/navigation";

export function MeScreen({
  user,
  saveState,
  onSave,
  onOpenSettings,
  sessionVisible,
  currentVenueName,
  currentVibes,
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
  sessionVisible: boolean;
  currentVenueName: string;
  currentVibes: string[];
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

  const vibePreview = currentVibes[0] ?? user.interests[0] ?? "Open";
  const styleLabel = `${user.avatarStyle.charAt(0).toUpperCase()}${user.avatarStyle.slice(1)}`;
  const venueLabel = sessionVisible ? `At ${currentVenueName}` : "Hidden right now";
  const venueMeta = sessionVisible
    ? `${vibePreview || "Open"} vibe active`
    : "People see your vibes and identifying hint after you go visible.";
  const stats = [
    { icon: "radio", value: sessionVisible ? "1" : "0", label: "Live now" },
    { icon: "activity", value: String(approachCount), label: "Approaches started" },
    { icon: "map-pin", value: String(nearbyVenueCount), label: "Venues nearby" },
  ] as const;
  const signalCards = [{ icon: "edit", label: "Style", value: styleLabel }] as const;
  const profileFields = [user.interests.length >= 3, Boolean(user.offering), Boolean(user.socialRhythm), Boolean(user.conversationStyle)];
  const profileCompletion = Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100);

  return (
    <View style={styles.profilePage}>
      {editing ? (
        <ScreenHeader
          title="Edit profile"
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

      {!editing ? (
        <>
          <View style={styles.profileHeroCard}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
            onPress={() => setEditing(true)}
            style={({ pressed }) => [styles.profileHeroEditButton, pressed && styles.iconButtonPressed]}
          >
            <LeftIcon name="edit" size={18} color={T.textSecondary} />
          </Pressable>
          <View style={styles.profileBrandHalo}>
            <View style={styles.profileBrandCore}>
              <LeftLogoMark size={40} />
            </View>
          </View>
          <Text style={styles.profileDisplayName}>{user.firstName}</Text>
        </View>

          <View style={styles.profileInterestsCard}>
            <Text style={styles.profileInterestsLabel}>YOUR INTERESTS</Text>
            <View style={styles.profileInterestsWrap}>
              {user.interests.length ? user.interests.map((interest) => (
                <View key={interest} style={styles.profileInterestPill}><Text style={styles.profileInterestText}>{interest}</Text></View>
              )) : <Text style={styles.profileInterestsEmpty}>Add at least three interests to shape the vibes you share.</Text>}
            </View>
          </View>

          <View style={styles.profileSignalGrid}>
            {signalCards.map((card) => (
              <View key={card.label} style={styles.profileSignalCard}>
                <View style={styles.profileSignalIconWrap}>
                  <LeftIcon name={card.icon as LeftIconName} size={20} color={T.primary} />
                </View>
                <Text style={styles.profileSignalLabel}>{card.label}</Text>
                <Text style={styles.profileSignalValue}>{card.value}</Text>
              </View>
            ))}
          </View>
          {profileCompletion < 100 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Complete your profile, ${profileCompletion}% complete`}
              onPress={() => setEditing(true)}
              style={({ pressed }) => [styles.profileCompassEmpty, pressed && styles.iconButtonPressed]}
            >
              <View style={styles.profileCompassIconWrap}><Text style={styles.profileCompassValue}>{profileCompletion}%</Text></View>
              <View style={styles.profileCompassEmptyCopy}>
                <Text style={styles.profileCompassEmptyTitle}>Complete your profile</Text>
                <Text style={styles.profileCompassEmptyText}>Add a few details to make your vibe and introductions more useful.</Text>
              </View>
              <LeftIcon name="chevron-right" size={18} color={T.textSecondary} />
            </Pressable>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open ${savedVenueCount} saved ${savedVenueCount === 1 ? "place" : "places"}`}
            onPress={onOpenSaved}
            style={({ pressed }) => [styles.profileSavedCard, pressed && styles.iconButtonPressed]}
          >
            <View style={styles.profileSavedIcon}>
              <LeftIcon name="bookmark" size={19} color={T.primary} />
            </View>
            <View style={styles.profileSavedCopy}>
              <Text style={styles.profileSavedTitle}>Saved places</Text>
              <Text style={styles.profileSavedText}>
                {savedVenueCount > 0 ? `${savedVenueCount} ${savedVenueCount === 1 ? "place" : "places"} waiting for later` : "Build a private list for later"}
              </Text>
            </View>
            <LeftIcon name="chevron-right" size={18} color={T.textSecondary} />
          </Pressable>
        </>
      ) : null}

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
                label={`${style.charAt(0).toUpperCase()}${style.slice(1)}`}
                active={avatarStyle === style}
                onPress={() => setAvatarStyle(style)}
              />
            ))}
          </View>

          <View style={styles.profileRefinementHeader}>
            <Text style={styles.profileRefinementTitle}>Your interests</Text>
            <Text style={styles.profileRefinementSubtitle}>Choose at least three. These become the vibes you can select when you go visible.</Text>
          </View>

          <Text style={styles.settingsEditLabel}>What draws you out?</Text>
          <View style={styles.chipWrap}>
            {interestOptions.map((interest) => (
              <SelectChip
                key={interest}
                label={interest}
                active={interests.includes(interest)}
                onPress={() => toggleInterest(interest)}
              />
            ))}
          </View>
          {interests.length < 3 ? <Text style={styles.errorText}>{`Choose ${3 - interests.length} more ${3 - interests.length === 1 ? "interest" : "interests"} to finish this section.`}</Text> : null}

          <Text style={styles.settingsEditLabel}>When are you usually open to meeting?</Text>
          <View style={styles.chipWrap}>
            {socialRhythmOptions.map((rhythm) => (
              <SelectChip
                key={rhythm}
                label={rhythm}
                active={socialRhythm === rhythm}
                onPress={() => setSocialRhythm(rhythm)}
              />
            ))}
          </View>

          <Text style={styles.settingsEditLabel}>Conversation style</Text>
          <View style={styles.chipWrap}>
            {conversationStyleOptions.map((style) => (
              <SelectChip
                key={style}
                label={style}
                active={conversationStyle === style}
                onPress={() => setConversationStyle(style)}
              />
            ))}
          </View>

          <View style={styles.settingsInputRow}>
            <Text style={styles.settingsEditLabel}>What might you bring to a conversation?</Text>
            <TextInput
              value={offering}
              onChangeText={(value) => setOffering(value.slice(0, 220))}
              placeholder="A perspective, a skill, or simply a listening ear…"
              placeholderTextColor={T.textMuted}
              style={[styles.settingsInlineInput, styles.profileOfferingInput]}
              multiline
            />
            <Text style={styles.profileInputCount}>{`${offering.length}/220`}</Text>
          </View>

          <View style={styles.profileEditActions}>
            <PrimaryButton
              label={saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved" : "Save Changes"}
              onPress={saveProfileDefaults}
              loading={saveState === "saving"}
            />
            <Pressable onPress={() => setEditing(false)} style={({ pressed }) => [styles.profileEditCancel, pressed && styles.iconButtonPressed]}>
              <Text style={styles.profileEditCancelText}>Cancel</Text>
            </Pressable>
          </View>
          {profileValidationError ? <Text style={styles.errorText}>{profileValidationError}</Text> : null}
          {saveState === "error" ? <Text style={styles.errorText}>We couldn’t save your profile settings. Check your connection and try again.</Text> : null}
        </View>
      ) : (
        <>
          <View style={styles.profileNowSection}>
            <View style={styles.profilePresenceCard}>
              <View style={styles.profilePresenceTopRow}>
                <View style={styles.profilePresenceCopy}>
                  <View style={styles.profilePresenceTitleRow}>
                    <View style={[styles.profilePresenceIconWrap, sessionVisible && styles.profilePresenceIconWrapVisible]}>
                      <LeftIcon name={sessionVisible ? "radio" : "lock"} size={18} color={sessionVisible ? T.visibilityOn : T.visibilityOff} />
                    </View>
                    <View style={styles.profilePresenceTitleCopy}>
                      <Text style={styles.profilePresenceVenue}>{venueLabel}</Text>
                      <Text style={styles.profilePresenceMessage}>{venueMeta}</Text>
                    </View>
                  </View>
                </View>
                <PrimaryButton label={sessionVisible ? "Manage" : "Go visible"} onPress={onBecomeVisible} compact />
              </View>
              <View style={styles.profilePresenceDivider} />
              <View style={styles.profilePresenceNotesRow}>
                <View style={styles.profilePresenceNote}>
                  <View style={[styles.profilePresenceDot, sessionVisible && styles.profilePresenceDotVisible]} />
                  <Text style={styles.profilePresenceNoteText}>{sessionVisible ? "Visible now" : "Right now"}</Text>
                  <Text style={styles.profilePresenceNoteSeparator}>•</Text>
                  <Text style={styles.profilePresenceNoteText}>{sessionVisible ? currentVenueName : "Location private"}</Text>
                </View>
                <View style={styles.profilePresencePrivacyNote}>
                  <LeftIcon name="map-pin" size={15} color={T.textMuted} />
                  <Text style={styles.profilePresencePrivacyText}>
                    {sessionVisible ? "Your venue is visible during this session" : "Private until you choose to be seen"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {(user.offering || user.socialRhythm || user.conversationStyle || user.interests.length > 0) ? (
            <View style={styles.profileCompassCard}>
              <View style={styles.profileSectionHeaderLeft}>
                <View style={styles.profileCompassIconWrap}>
                  <LeftIcon name="compass" size={18} color={T.primary} />
                </View>
                <Text style={styles.profileSectionTitle}>My social compass</Text>
              </View>
              {user.offering ? (
                <View style={styles.profileCompassRow}>
                  <Text style={styles.profileCompassLabel}>What I bring</Text>
                  <Text style={styles.profileCompassValue}>{user.offering}</Text>
                </View>
              ) : null}
              {user.interests.length > 0 ? (
                <View style={styles.profileCompassRow}>
                  <Text style={styles.profileCompassLabel}>Drawn to</Text>
                  <Text style={styles.profileCompassValue}>{user.interests.join(" · ")}</Text>
                </View>
              ) : null}
              {user.socialRhythm ? (
                <View style={styles.profileCompassRow}>
                  <Text style={styles.profileCompassLabel}>Usually around</Text>
                  <Text style={styles.profileCompassValue}>{user.socialRhythm}</Text>
                </View>
              ) : null}
              {user.conversationStyle ? (
                <View style={[styles.profileCompassRow, styles.profileCompassRowLast]}>
                  <Text style={styles.profileCompassLabel}>Conversation style</Text>
                  <Text style={styles.profileCompassValue}>{user.conversationStyle}</Text>
                </View>
              ) : null}
            </View>
          ) : (
            <Pressable
              accessibilityRole="button"
              onPress={() => setEditing(true)}
              style={({ pressed }) => [styles.profileCompassEmpty, pressed && styles.iconButtonPressed]}
            >
              <View style={styles.profileCompassIconWrap}>
                <LeftIcon name="compass" size={18} color={T.primary} />
              </View>
              <View style={styles.profileCompassEmptyCopy}>
                <Text style={styles.profileCompassEmptyTitle}>Shape better introductions</Text>
                <Text style={styles.profileCompassEmptyText}>Add what interests you, what you bring, and when you’re usually open.</Text>
              </View>
              <LeftIcon name="chevron-right" size={18} color={T.textSecondary} />
            </Pressable>
          )}

          <View style={styles.profileActivitySection}>
            <View style={styles.profileSectionHeaderRow}>
              <View style={styles.profileSectionHeaderLeft}>
                <Text style={styles.profileSectionTitle}>Your recent moments</Text>
              </View>
            </View>
            <View style={styles.profileActivityCard}>
              {stats.map((stat, index) => (
                <View key={stat.label} style={[styles.profileStatItem, index === stats.length - 1 && styles.profileStatItemLast]}>
                  <View style={styles.profileStatValueRow}>
                    <LeftIcon name={stat.icon as LeftIconName} size={15} color={index === 1 ? T.accentBright : T.primary} />
                    <Text style={styles.profileStatValue}>{stat.value}</Text>
                  </View>
                  <Text style={styles.profileStatLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>

        </>
      )}
    </View>
  );
}
