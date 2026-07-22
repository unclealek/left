import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import type { AppUser, AvatarStyle } from "../../types/left-domain";
import { AVATAR_GLYPHS, avatarStyles, intents, vibeOptions } from "../../app/leftConfig";
import { T, styles } from "../../app/leftTheme";
import { LeftDoorwayMark } from "../../components/left/LeftDoorwayMark";
import { PrimaryButton, SelectChip } from "../../components/left/ui";

export function MeScreen({
  user,
  saveState,
  onSave,
  onOpenSettings,
  onBack,
  sessionVisible,
  currentVenueName,
  currentIntent,
  currentVibes,
  nearbyVenueCount,
  waveCount,
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
  onBack: () => void;
  sessionVisible: boolean;
  currentVenueName: string;
  currentIntent: AppUser["defaultIntent"];
  currentVibes: string[];
  nearbyVenueCount: number;
  waveCount: number;
}) {
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(user.firstName);
  const [avatarStyle, setAvatarStyle] = useState<AvatarStyle>(user.avatarStyle);
  const [defaultIntent, setDefaultIntent] = useState<AppUser["defaultIntent"]>(user.defaultIntent);
  const [defaultVibes, setDefaultVibes] = useState<string[]>(user.defaultVibes);
  const [profilePrompt, setProfilePrompt] = useState(user.profilePrompt);

  useEffect(() => {
    setFirstName(user.firstName);
    setAvatarStyle(user.avatarStyle);
    setDefaultIntent(user.defaultIntent);
    setDefaultVibes(user.defaultVibes);
    setProfilePrompt(user.profilePrompt);
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
    onSave({ firstName, avatarStyle, defaultIntent, defaultVibes, profilePrompt });
  }

  const intent = (user.defaultIntent ?? "networking").replaceAll("_", " ");
  const liveIntent = (currentIntent ?? user.defaultIntent ?? "networking").replaceAll("_", " ");
  const liveVibes = currentVibes.length ? currentVibes : user.defaultVibes;
  const vibePreview = liveVibes.slice(0, 2).join(" · ");
  const venueLabel = sessionVisible ? `At ${currentVenueName}` : "Hidden right now";
  const venueMeta = sessionVisible
    ? `${vibePreview || "Open"} · ${liveIntent}`
    : "People see your intent and vibe after you go visible.";
  const stats = [
    { icon: "radio", value: sessionVisible ? "1" : "0", label: "Live now" },
    { icon: "send", value: String(waveCount), label: "Waves sent" },
    { icon: "map-pin", value: String(Math.max(1, nearbyVenueCount)), label: "Venues nearby" },
  ] as const;
  const signalCards = [
    { icon: "target", label: "Intent", value: intent },
    { icon: "star", label: "Vibes", value: user.defaultVibes.slice(0, 2).join(" · ") || "Open" },
    { icon: "edit-3", label: "Style", value: user.avatarStyle },
  ] as const;

  return (
    <View style={styles.profilePage}>
      <View style={styles.profileTopBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={editing ? "Return to profile" : "Back"}
          onPress={editing ? () => setEditing(false) : onBack}
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

      <View style={styles.profileHeroCard}>
        <View style={styles.profileBrandHalo}>
          <View style={styles.profileBrandCore}>
            <LeftDoorwayMark size={38} archColor={T.primary} innerColor={T.surface} baseColor={T.primarySoft} />
          </View>
          <View style={styles.profileBrandSparkOne} />
          <View style={styles.profileBrandSparkTwo} />
          <View style={styles.profileBrandSparkThree} />
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
              <Feather name={card.icon} size={20} color={T.primary} />
            </View>
            <Text style={styles.profileSignalLabel}>{card.label}</Text>
            <Text style={styles.profileSignalValue}>{card.value}</Text>
          </View>
        ))}
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
      ) : (
        <>
          <View style={styles.profileNowSection}>
            <View style={styles.profileSectionHeaderRow}>
              <View style={styles.profileSectionHeaderLeft}>
                <Feather name="map-pin" size={16} color={T.primary} />
                <Text style={styles.profileSectionTitle}>Right now</Text>
              </View>
            </View>
            <View style={styles.profilePresenceCard}>
              <View style={styles.profilePresenceCopy}>
                <Text style={styles.profilePresenceVenue}>{venueLabel}</Text>
                <View style={styles.profilePresencePill}>
                  <View style={styles.profilePresenceDot} />
                  <Text style={styles.profilePresencePillText}>{venueMeta}</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={22} color={"rgba(53,102,77,0.76)"} />
            </View>
          </View>

          <View style={styles.profileActivitySection}>
            <View style={styles.profileSectionHeaderRow}>
              <View style={styles.profileSectionHeaderLeft}>
                <Text style={styles.profileSectionTitle}>My activity</Text>
                <Feather name="minus" size={16} color={"rgba(53,102,77,0.55)"} />
              </View>
            </View>
            <View style={styles.profileActivityCard}>
              {stats.map((stat, index) => (
                <View key={stat.label} style={[styles.profileStatItem, index === stats.length - 1 && styles.profileStatItemLast]}>
                  <View style={styles.profileStatValueRow}>
                    <Feather name={stat.icon} size={15} color={index === 1 ? T.accentBright : T.primary} />
                    <Text style={styles.profileStatValue}>{stat.value}</Text>
                  </View>
                  <Text style={styles.profileStatLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.profilePrivacyCard}>
            <Text style={styles.profilePrivacyText}>
              People see your intent and vibe, but not your name or details until you connect.
            </Text>
            <View style={styles.profilePrivacyIconWrap}>
              <Feather name="lock" size={20} color={T.primary} />
            </View>
          </View>
        </>
      )}
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
