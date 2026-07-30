import { Feather } from "@expo/vector-icons";
import { Pressable, Text, TextInput, View } from "react-native";
import type { AppUser } from "../../types/left-domain";
import { durationOptions, formatElapsedDuration, intents, vibeOptions } from "../../app/leftConfig";
import { T, styles } from "../../app/leftTheme";
import { BackNavButton } from "../../components/left/navigation";
import { BrandPrimaryButton, Card, FieldBlock, IconSelectChip, PrimaryButton } from "../../components/left/ui";

export function ActivationScreen(props: {
  sessionVisible: boolean;
  venueHidden: boolean;
  venueName: string;
  venueConfidenceLabel: string;
  venueConfidenceCopy: string;
  selectedIntent: AppUser["defaultIntent"];
  selectedVibes: string[];
  selectedDuration: number;
  hintDraft: string;
  elapsedSeconds: number;
  activationSubmitting: boolean;
  endingSession: boolean;
  onBack: () => void;
  onPickIntent: (v: AppUser["defaultIntent"]) => void;
  onToggleVibe: (v: string) => void;
  onPickDuration: (v: number) => void;
  onChangeHint: (v: string) => void;
  onActivate: () => void;
  onOpenFeed: () => void;
  onEndSession: () => void;
}) {
  if (props.sessionVisible) {
    const elapsedLabel = formatElapsedDuration(props.elapsedSeconds);

    return (
      <Card>
        <Text style={styles.cardTitle}>You are{"\n"}visible now.</Text>
        <View style={styles.approachHero}>
          <Text style={styles.approachLabel}>Session live</Text>
          <View style={styles.timerRing}>
            <Text style={styles.timerNum}>{elapsedLabel}</Text>
            <Text style={styles.timerUnit}>elapsed</Text>
          </View>
        </View>
        <FieldBlock label="Current session">
          <Text style={styles.cardBody}>
            {props.selectedVibes[0] ?? "Open"} · {props.selectedDuration}m window
          </Text>
          <Text style={styles.cardBody}>Intent: {(props.selectedIntent ?? "networking").replaceAll("_", " ")}</Text>
          <Text style={styles.cardBody}>
            Hint: {props.hintDraft.trim() || "No hint added."}
          </Text>
        </FieldBlock>
        <PrimaryButton label="Open nearby feed" onPress={props.onOpenFeed} />
        <View style={{ height: 12 }} />
        <PrimaryButton label={props.endingSession ? "Ending..." : "End visibility"} onPress={props.onEndSession} disabled={props.endingSession} />
      </Card>
    );
  }

  return (
    <Card>
      <View style={styles.activationTopRow}>
        <BackNavButton label="" onPress={props.onBack} />
        <View style={styles.activationTopRowTitleWrap}>
          <Text style={styles.activationTitle}>Your presence</Text>
        </View>
      </View>
      <View style={styles.activationHeader}>
        <Text style={styles.activationSubtitle}>
          Confirm the details below and go visible.
        </Text>
      </View>

      <View style={styles.activationVenueCard}>
        <View style={styles.activationVenueCardTopRow}>
          <View style={styles.activationVenueIconWrap}>
            <Feather name="map-pin" size={18} color={T.primary} />
          </View>
          <View style={styles.activationVenueCopy}>
            <Text style={styles.activationVenueEyebrow}>{props.venueConfidenceLabel}</Text>
            <Text style={styles.activationVenueName}>{props.venueName}</Text>
            <Text style={styles.activationVenueBody}>{props.venueConfidenceCopy}</Text>
          </View>
          <View
            style={[
              styles.activationVenueStatusDot,
              props.sessionVisible &&
                props.venueConfidenceLabel === "Confirmed venue" &&
                styles.activationVenueStatusDotConfirmed,
            ]}
          />
        </View>
      </View>

      <FieldBlock label="Intent" hint="Pick the main reason people should read your signal.">
        <View style={styles.activationChoiceGrid}>
          {intents.map((i) => (
            <IconSelectChip
              key={i.id}
              label={i.label}
              icon={getIntentIcon(i.id)}
              active={props.selectedIntent === i.id}
              onPress={() => props.onPickIntent(i.id)}
            />
          ))}
        </View>
      </FieldBlock>

      <FieldBlock label="Vibe" hint="Pick one cue so the room knows your energy.">
        <View style={styles.activationChoiceGrid}>
          {vibeOptions.map((v) => (
            <IconSelectChip
              key={v}
              label={v}
              icon={getVibeIcon(v)}
              active={props.selectedVibes.includes(v)}
              onPress={() => props.onToggleVibe(v)}
            />
          ))}
        </View>
      </FieldBlock>

      <FieldBlock label="Duration" hint="How long will your signal stay active?">
        <View style={styles.activationDurationRow}>
          {durationOptions.map((d) => (
            <IconSelectChip
              key={d}
              label={`${d}m`}
              icon="clock"
              compact
              active={props.selectedDuration === d}
              onPress={() => props.onPickDuration(d)}
            />
          ))}
        </View>
      </FieldBlock>

      <FieldBlock label="Hint card" hint="Add a short hint to help people spot you.">
        <View style={styles.activationHintCard}>
          <View style={styles.activationHintIconWrap}>
            <Feather name="edit-3" size={16} color={T.primary} />
          </View>
          <View style={styles.activationHintContent}>
            <TextInput
              value={props.hintDraft}
              onChangeText={props.onChangeHint}
              placeholder="e.g. Grey hoodie, corner seat"
              placeholderTextColor={T.textMuted}
              maxLength={42}
              style={styles.activationHintInput}
            />
            <Text style={styles.activationHintMeta}>{`${props.hintDraft.length}/42 characters`}</Text>
          </View>
        </View>
      </FieldBlock>

      {props.venueHidden ? (
        <Text style={styles.activationWarningText}>
          This venue is hidden in your settings. Unhide it before going visible here again.
        </Text>
      ) : null}

      <BrandPrimaryButton
        label={props.activationSubmitting ? "Going visible..." : "Go visible"}
        onPress={props.onActivate}
        disabled={props.venueHidden || props.activationSubmitting}
        size="compact"
      />

      <View style={styles.activationPrivacyNote}>
        <View style={styles.activationPrivacyDot} />
        <Text style={styles.activationPrivacyText}>Your venue stays private until you go visible.</Text>
      </View>
    </Card>
  );
}

function getIntentIcon(intent: AppUser["defaultIntent"]) {
  switch (intent) {
    case "open_to_conversation":
      return "message-circle" as const;
    case "group_discussion":
      return "users" as const;
    case "casual_chat":
      return "smile" as const;
    case "networking":
    default:
      return "user-plus" as const;
  }
}

function getVibeIcon(vibe: string) {
  switch (vibe) {
    case "AI/startups":
      return "cpu" as const;
    case "Design":
      return "pen-tool" as const;
    case "Travel":
      return "map" as const;
    case "Language exchange":
      return "message-square" as const;
    case "Creativity":
    default:
      return "sun" as const;
  }
}
