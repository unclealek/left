import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import type { AppUser, AvatarStyle } from "../../types/left-domain";
import { avatarStyles, intents, vibeOptions } from "../../app/leftConfig";
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
  currentIntent,
  currentVibes,
  nearbyVenueCount,
  approachCount,
  onBecomeVisible,
}: {
  user: AppUser;
  saveState: "idle" | "saving" | "saved" | "error";
  onSave: (input: {
    firstName: string;
    avatarStyle: AvatarStyle;
    defaultIntent: AppUser["defaultIntent"];
    defaultVibes: string[];
    profilePrompt: string;
  }) => void;
  onOpenSettings: () => void;
  sessionVisible: boolean;
  currentVenueName: string;
  currentIntent: AppUser["defaultIntent"];
  currentVibes: string[];
  nearbyVenueCount: number;
  approachCount: number;
  onBecomeVisible: () => void;
}) {
  function normalizeSingleVibe(vibes: string[] | null | undefined, fallback = "Open") {
    const first = Array.isArray(vibes) ? vibes.find((value) => value.trim().length > 0) : null;
    return first ? [first] : [fallback];
  }

  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(user.firstName);
  const [avatarStyle, setAvatarStyle] = useState<AvatarStyle>(user.avatarStyle);
  const [defaultIntent, setDefaultIntent] = useState<AppUser["defaultIntent"]>(user.defaultIntent);
  const [defaultVibes, setDefaultVibes] = useState<string[]>(normalizeSingleVibe(user.defaultVibes));
  const [profilePrompt, setProfilePrompt] = useState(user.profilePrompt);

  useEffect(() => {
    setFirstName(user.firstName);
    setAvatarStyle(user.avatarStyle);
    setDefaultIntent(user.defaultIntent);
    setDefaultVibes(normalizeSingleVibe(user.defaultVibes));
    setProfilePrompt(user.profilePrompt);
  }, [user]);

  function toggleVibe(vibe: string) {
    setDefaultVibes((current) => {
      const exists = current.includes(vibe);
      if (exists) return current;
      return [vibe];
    });
  }

  function saveProfileDefaults() {
    onSave({ firstName, avatarStyle, defaultIntent, defaultVibes, profilePrompt });
  }

  const intent = (user.defaultIntent ?? "networking").replaceAll("_", " ");
  const intentLabel = intents.find((item) => item.id === user.defaultIntent)?.label ?? intent;
  const liveIntent = (currentIntent ?? user.defaultIntent ?? "networking").replaceAll("_", " ");
  const liveVibes = currentVibes.length ? normalizeSingleVibe(currentVibes) : normalizeSingleVibe(user.defaultVibes);
  const vibePreview = liveVibes[0] || "Open";
  const vibeLabel = (normalizeSingleVibe(user.defaultVibes)[0] || "Open")
    .replace("/", " / ")
    .replace(/startups/i, "Startups");
  const styleLabel = `${user.avatarStyle.charAt(0).toUpperCase()}${user.avatarStyle.slice(1)}`;
  const venueLabel = sessionVisible ? `At ${currentVenueName}` : "Hidden right now";
  const venueMeta = sessionVisible
    ? `${vibePreview || "Open"} · ${liveIntent}`
    : "People see your intent and vibe after you go visible.";
  const stats = [
    { icon: "radio", value: sessionVisible ? "1" : "0", label: "Live now" },
    { icon: "activity", value: String(approachCount), label: "Approaches started" },
    { icon: "map-pin", value: String(nearbyVenueCount), label: "Venues nearby" },
  ] as const;
  const signalCards = [
    { icon: "radio", label: "Intent", value: intentLabel },
    { icon: "activity", label: "Vibe", value: vibeLabel },
    { icon: "edit", label: "Style", value: styleLabel },
  ] as const;

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
          <View style={styles.profileRolePill}>
            <Text style={styles.profileRoleText}>{intent}</Text>
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

          <Text style={styles.settingsEditLabel}>Default vibe</Text>
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
          {saveState === "error" ? <Text style={styles.errorText}>We could not save your profile settings yet.</Text> : null}
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
