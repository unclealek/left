import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import type { AppUser } from "../../types/left-domain";
import { durationOptions, formatElapsedDuration, intents, vibeOptions } from "../../app/leftConfig";
import { T, styles } from "../../app/leftTheme";
import { LeftIcon, type LeftIconName } from "../../components/icons";
import { ScreenHeader } from "../../components/left/navigation";
import { BrandPrimaryButton, FieldBlock, GhostButton, IconSelectChip, SlideToConfirmButton } from "../../components/left/ui";

function PresenceTimerRing({
  remainingLabel,
  remainingSeconds,
  totalSeconds,
}: {
  remainingLabel: string;
  remainingSeconds: number;
  totalSeconds: number;
}) {
  const size = 184;
  const center = size / 2;
  const radius = 76;
  const circumference = 2 * Math.PI * radius;
  const progress = totalSeconds > 0 ? Math.max(0, Math.min(remainingSeconds / totalSeconds, 1)) : 0;
  const endpointAngle = progress * Math.PI * 2 - Math.PI / 2;
  const endpointX = center + radius * Math.cos(endpointAngle);
  const endpointY = center + radius * Math.sin(endpointAngle);

  return (
    <View
      accessibilityLabel={`${remainingLabel} remaining`}
      style={styles.activationLiveTimerRing}
    >
      <Svg width={size} height={size} style={styles.activationLiveTimerSvg}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={T.visibilityOnSoft}
          strokeWidth={7}
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={T.visibilityOn}
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - progress)}
          rotation={-90}
          origin={`${center}, ${center}`}
        />
        {progress > 0 && progress < 1 ? (
          <Circle
            cx={endpointX}
            cy={endpointY}
            r={6}
            fill={T.visibilityOn}
            stroke={T.white}
            strokeWidth={3}
          />
        ) : null}
      </Svg>
      <View pointerEvents="none" style={styles.activationLiveTimerContent}>
        <Text style={styles.activationLiveTimerValue}>{remainingLabel}</Text>
        <Text style={styles.activationLiveTimerLabel}>remaining</Text>
      </View>
    </View>
  );
}

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
  const [hintExpanded, setHintExpanded] = useState(Boolean(props.hintDraft.trim()));

  if (props.sessionVisible) {
    const elapsedLabel = formatElapsedDuration(props.elapsedSeconds);
    const remainingSeconds = Math.max(props.selectedDuration * 60 - props.elapsedSeconds, 0);
    const remainingLabel = formatElapsedDuration(remainingSeconds);
    const intentLabel = formatSelectionLabel(props.selectedIntent ?? "networking");
    const vibeLabel = props.selectedVibes[0] ?? "Open";

    return (
      <View style={[styles.activationPage, styles.activationLivePage]}>
        <ScreenHeader
          title="You’re visible"
          subtitle="People here can discover you for this moment."
          onBack={props.onBack}
          variant="utility"
        />

        <View style={styles.activationLiveHero}>
          <View style={styles.activationLiveStatusRow}>
            <View style={styles.activationLiveStatusDot} />
            <Text style={styles.activationLiveStatusText}>Visible now</Text>
          </View>
          <PresenceTimerRing
            remainingLabel={remainingLabel}
            remainingSeconds={remainingSeconds}
            totalSeconds={props.selectedDuration * 60}
          />
          <Text style={styles.activationLiveElapsed}>{elapsedLabel} elapsed</Text>
        </View>

        <View style={styles.activationLiveVenueRow}>
          <View style={[styles.activationVenueIconWrap, styles.activationLiveVenueIconWrap]}>
            <LeftIcon name="map-pin" size={22} color={T.venueAccent} active />
          </View>
          <View style={styles.activationLiveVenueCopy}>
            <Text style={styles.activationLiveVenueLabel}>Current venue</Text>
            <Text style={[styles.activationVenueName, styles.activationLiveVenueName]}>{props.venueName}</Text>
          </View>
          <View style={[styles.activationVenueStatus, styles.activationVenueStatusConfirmed]}>
            <LeftIcon name="check" size={16} color={T.white} />
          </View>
        </View>

        <View style={styles.activationLiveSummary}>
          <View style={styles.activationLiveSummaryItem}>
            <View style={styles.activationLiveSummaryIconWrap}>
              <LeftIcon name={getIntentIcon(props.selectedIntent)} size={18} color={T.primary} />
            </View>
            <View style={styles.activationLiveSummaryCopy}>
              <Text style={styles.activationLiveSummaryLabel}>Intent</Text>
              <Text style={styles.activationLiveSummaryValue}>{intentLabel}</Text>
            </View>
          </View>
          <View style={styles.activationLiveSummaryDivider} />
          <View style={styles.activationLiveSummaryItem}>
            <View style={styles.activationLiveSummaryIconWrap}>
              <LeftIcon name={getVibeIcon(vibeLabel)} size={18} color={T.primary} />
            </View>
            <View style={styles.activationLiveSummaryCopy}>
              <Text style={styles.activationLiveSummaryLabel}>Vibe</Text>
              <Text style={styles.activationLiveSummaryValue}>{vibeLabel}</Text>
            </View>
          </View>
        </View>

        {props.hintDraft.trim() ? (
          <View style={styles.activationLiveHint}>
            <View style={styles.activationLiveSummaryIconWrap}>
              <LeftIcon name="tag" size={18} color={T.primary} />
            </View>
            <View style={styles.activationLiveHintCopy}>
              <Text style={styles.activationLiveHintLabel}>Your hint</Text>
              <Text style={styles.activationLiveHintText}>{props.hintDraft.trim()}</Text>
            </View>
          </View>
        ) : null}

        <BrandPrimaryButton
          label="See who’s here"
          subtitle="See who is visible here"
          onPress={props.onOpenFeed}
          size="compact"
          trailingIcon="arrow"
        />
        <GhostButton
          label={props.endingSession ? "Ending visibility..." : "End visibility"}
          onPress={props.onEndSession}
          destructive
          loading={props.endingSession}
        />
        <View style={styles.activationLivePrivacyNote}>
          <View style={styles.activationLivePrivacyIconWrap}>
            <LeftIcon name="lock" size={14} color={T.primary} />
          </View>
          <Text style={styles.activationLivePrivacyText}>Your precise location remains private.</Text>
        </View>
      </View>
    );
  }

  const venueConfirmed = props.venueConfidenceLabel === "Confirmed venue";
  const durationLabel = formatDurationOption(props.selectedDuration);

  return (
    <View style={styles.activationPage}>
      <ScreenHeader
        title="Share this moment"
        subtitle="Choose how you want to be discovered nearby."
        onBack={props.onBack}
        variant="utility"
      />

      <View style={[styles.activationSectionCard, styles.activationVenueCard]}>
        <Text style={styles.activationSectionTitle}>Current venue</Text>
        <View style={styles.activationVenueCardTopRow}>
          <View style={styles.activationVenueIconWrap}>
            <LeftIcon name="map-pin" size={22} color={T.venueAccent} active={venueConfirmed} />
          </View>
          <View style={styles.activationVenueCopy}>
            <Text style={styles.activationVenueName}>{props.venueName}</Text>
            <View style={styles.activationVenueMetaRow}>
              <Text
                style={[
                  styles.activationVenueConfidence,
                  venueConfirmed && styles.activationVenueConfidenceConfirmed,
                ]}
              >
                {props.venueConfidenceLabel}
              </Text>
              <View
                style={[
                  styles.activationVenueMetaDot,
                  venueConfirmed && styles.activationVenueMetaDotConfirmed,
                ]}
              />
              <Text style={styles.activationVenuePrivacy}>Your location stays private</Text>
            </View>
            {!venueConfirmed ? (
              <Text style={styles.activationVenueBody}>{props.venueConfidenceCopy}</Text>
            ) : null}
          </View>
          <View
            style={[
              styles.activationVenueStatus,
              venueConfirmed && styles.activationVenueStatusConfirmed,
            ]}
          >
            <LeftIcon name={venueConfirmed ? "check" : "radio"} size={16} color={T.white} />
          </View>
        </View>
      </View>

      <View style={styles.activationSectionCard}>
        <Text style={styles.activationSectionTitle}>How you show up</Text>
        <FieldBlock
          label="Why are you here?"
          hint="Pick the main reason people should see your signal."
          step={1}
          variant="section"
        >
          <View style={styles.activationChoiceGrid}>
            {intents.map((i) => (
              <IconSelectChip
                key={i.id}
                label={i.label}
                icon={getIntentIcon(i.id)}
                active={props.selectedIntent === i.id}
                halfWidth
                onPress={() => props.onPickIntent(i.id)}
              />
            ))}
          </View>
        </FieldBlock>

        <View style={styles.activationSectionDivider} />

        <FieldBlock
          label="What's your vibe?"
          hint="Pick one cue so the room knows your energy."
          step={2}
          variant="section"
        >
          <View style={styles.activationChoiceGrid}>
            {vibeOptions.map((v) => (
              <IconSelectChip
                key={v}
                label={v}
                icon={getVibeIcon(v)}
                active={props.selectedVibes.includes(v)}
                halfWidth
                onPress={() => props.onToggleVibe(v)}
              />
            ))}
          </View>
        </FieldBlock>
      </View>

      <View style={styles.activationSectionCard}>
        <Text style={styles.activationSectionTitle}>Session details</Text>
        <FieldBlock
          label="How long will your signal stay active?"
          hint="You can change this anytime."
          step={3}
          variant="section"
        >
          <View style={styles.activationDurationRow}>
            {durationOptions.map((d) => (
              <IconSelectChip
                key={d}
                label={formatDurationOption(d)}
                icon="clock"
                compact
                active={props.selectedDuration === d}
                onPress={() => props.onPickDuration(d)}
              />
            ))}
          </View>
        </FieldBlock>

        <View style={styles.activationSectionDivider} />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={hintExpanded ? "Close presence hint" : "Add a presence hint"}
          onPress={() => setHintExpanded((current) => !current)}
          style={({ pressed }) => [styles.activationHintCard, pressed && styles.primaryBtnPressed]}
        >
          <View style={styles.activationHintIconWrap}>
            <LeftIcon name="edit" size={16} color={T.primary} />
          </View>
          <View style={styles.activationHintContent}>
            <Text style={styles.activationHintTitle}>
              Add a hint <Text style={styles.activationHintOptional}>(optional)</Text>
            </Text>
            <Text style={styles.activationHintMeta}>Help others spot you in the room.</Text>
          </View>
          <LeftIcon
            name={hintExpanded ? "chevron-down" : "chevron-right"}
            size={18}
            color={T.textSecondary}
          />
        </Pressable>

        {hintExpanded ? (
          <View style={styles.activationHintEditor}>
            <TextInput
              autoFocus
              value={props.hintDraft}
              onChangeText={props.onChangeHint}
              placeholder="e.g. Grey hoodie, corner seat"
              placeholderTextColor={T.textMuted}
              maxLength={42}
              style={styles.activationHintInput}
            />
            <Text style={styles.activationHintCounter}>{`${props.hintDraft.length}/42`}</Text>
          </View>
        ) : null}
      </View>

      {props.venueHidden ? (
        <Text style={styles.activationWarningText}>
          This venue is hidden in your settings. Unhide it before going visible here again.
        </Text>
      ) : null}

      <View style={styles.activationPrivacyNote}>
        <View style={styles.activationPrivacyIconWrap}>
          <LeftIcon name="lock" size={17} color={T.primary} />
        </View>
        <View style={styles.activationPrivacyCopy}>
          <Text style={styles.activationPrivacyTitle}>Your location and details remain private</Text>
          <Text style={styles.activationPrivacyText}>People only see your intent and vibe.</Text>
        </View>
      </View>

      <SlideToConfirmButton
        label="Slide to go visible"
        subtitle={`Start a ${durationLabel} presence`}
        onConfirm={props.onActivate}
        disabled={props.venueHidden || props.activationSubmitting}
        loading={props.activationSubmitting}
      />
    </View>
  );
}

function formatDurationOption(duration: number) {
  if (duration === 60) return "1 hour";
  if (duration === 120) return "2 hours";
  return `${duration} min`;
}

function formatSelectionLabel(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getIntentIcon(intent: AppUser["defaultIntent"]): LeftIconName {
  switch (intent) {
    case "open_to_conversation":
      return "radio";
    case "group_discussion":
      return "users" as const;
    case "casual_chat":
      return "user";
    case "networking":
    default:
      return "user";
  }
}

function getVibeIcon(vibe: string): LeftIconName {
  switch (vibe) {
    case "AI/startups":
      return "activity";
    case "Design":
      return "edit";
    case "Travel":
      return "map-pin";
    case "Language exchange":
      return "radio";
    case "Creativity":
    default:
      return "activity";
  }
}
