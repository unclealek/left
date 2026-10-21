import { t } from "../../features/preferences/translation-runtime";
import { Text, TextInput, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { VISIBILITY_DISCLOSURE } from "../../features/presence/visibility-copy";
import type { AppUser } from "../../types/left-domain";
import { durationOptions, formatElapsedDuration } from "../../app/leftConfig";
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
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${Math.floor(Math.max(0, remainingSeconds) / 60)} minutes ${Math.floor(Math.max(0, remainingSeconds) % 60)} seconds remaining`}
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
        <Text style={styles.activationLiveTimerLabel}>{t("remaining")}</Text>
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
  availableVibes: string[];
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
    const remainingSeconds = Math.max(props.selectedDuration * 60 - props.elapsedSeconds, 0);
    const remainingLabel = formatElapsedDuration(remainingSeconds);
    const vibeLabel = props.selectedVibes[0] ?? "Open";

    return (
      <View style={[styles.activationPage, styles.activationLivePage]}>
        <ScreenHeader
          title={t("You’re visible")}
          subtitle={t("People here can discover you for this moment.")}
          onBack={props.onBack}
          variant="utility"
        />

        <View style={styles.activationLiveHero}>
          <View style={styles.activationLiveStatusRow}>
            <View style={styles.activationLiveStatusDot} />
            <Text style={styles.activationLiveStatusText}>{t("Visible now")}</Text>
          </View>
          <PresenceTimerRing
            remainingLabel={remainingLabel}
            remainingSeconds={remainingSeconds}
            totalSeconds={props.selectedDuration * 60}
          />
          <Text style={styles.activationLiveElapsed}>{elapsedLabel}{" "}{t("elapsed")}</Text>
        </View>

        <View style={styles.activationLiveVenueRow}>
          <View style={[styles.activationVenueIconWrap, styles.activationLiveVenueIconWrap]}>
            <LeftIcon name="map-pin" size={22} color={T.venueAccent} active />
          </View>
          <View style={styles.activationLiveVenueCopy}>
            <Text style={styles.activationLiveVenueLabel}>{t("Current venue")}</Text>
            <Text style={[styles.activationVenueName, styles.activationLiveVenueName]}>{props.venueName}</Text>
          </View>
          <View style={[styles.activationVenueStatus, styles.activationVenueStatusConfirmed]}>
            <LeftIcon name="check" size={16} color={T.white} />
          </View>
        </View>

        <View style={styles.activationLiveSummary}>
          <View style={styles.activationLiveSummaryItem}>
            <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.activationLiveSummaryIconWrap}>
              <LeftIcon name={getVibeIcon(vibeLabel)} size={18} color={T.primary} />
            </View>
            <View style={styles.activationLiveSummaryCopy}>
              <Text style={styles.activationLiveSummaryLabel}>{t("Vibe")}</Text>
              <Text style={styles.activationLiveSummaryValue}>{vibeLabel}</Text>
            </View>
          </View>
        </View>

        {props.hintDraft.trim() ? (
          <View style={styles.activationLiveHint}>
            <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.activationLiveSummaryIconWrap}>
              <LeftIcon name="tag" size={18} color={T.primary} />
            </View>
            <View style={styles.activationLiveHintCopy}>
              <Text style={styles.activationLiveHintLabel}>{t("Your hint")}</Text>
              <Text style={styles.activationLiveHintText}>{props.hintDraft.trim()}</Text>
            </View>
          </View>
        ) : null}

        <BrandPrimaryButton
          label={t("See who’s here")}
          subtitle={t("See who is visible here")}
          onPress={props.onOpenFeed}
          size="compact"
          trailingIcon="arrow"
        />
        <GhostButton
          label={props.endingSession ? t("Ending visibility...") : t("End visibility")}
          onPress={props.onEndSession}
          destructive
          loading={props.endingSession}
        />
        <View style={styles.activationLivePrivacyNote}>
          <View style={styles.activationLivePrivacyIconWrap}>
            <LeftIcon name="lock" size={14} color={T.primary} />
          </View>
          <Text style={styles.activationLivePrivacyText}>{t(VISIBILITY_DISCLOSURE)}</Text>
        </View>
      </View>
    );
  }

  const venueConfirmed = props.venueConfidenceLabel === "Confirmed venue";
  const durationLabel = formatDurationOption(props.selectedDuration);

  return (
    <View style={styles.activationPage}>
      <ScreenHeader
        title={t("Share this moment")}
        subtitle={t("Choose how you want to be discovered nearby.")}
        onBack={props.onBack}
        variant="utility"
      />

      <View style={[styles.activationSectionCard, styles.activationVenueCard]}>
        <Text style={styles.activationSectionTitle}>{t("Current venue")}</Text>
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
              <Text style={styles.activationVenuePrivacy}>{t("Your precise location stays private")}</Text>
            </View>
            {!venueConfirmed ? (
              <Text style={styles.activationVenueBody}>{t(props.venueConfidenceCopy)}</Text>
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
        <Text style={styles.activationSectionTitle}>{t("How you show up")}</Text>
        <FieldBlock
          label={t("What's your vibe?")}
          hint="Choose one or more of the interests you added to your profile."
          step={1}
          variant="section"
        >
          <View style={styles.activationChoiceGrid}>
            {props.availableVibes.map((v) => (
              <IconSelectChip
                key={v}
                label={t(v)}
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
        <Text style={styles.activationSectionTitle}>{t("Session details")}</Text>
        <FieldBlock
          label={t("How long will your signal stay active?")}
          hint="You can change this anytime."
          step={2}
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

        <View style={styles.activationHintCard}>
          <View style={styles.activationHintIconWrap}>
            <LeftIcon name="edit" size={16} color={T.primary} />
          </View>
          <View style={styles.activationHintContent}>
            <Text style={styles.activationHintTitle}>{t("How can people recognize you?")}{" "}</Text>
            <Text style={styles.activationHintMeta}>{t("Required. Describe something people can spot without a photo.")}</Text>
          </View>
        </View>

        <View style={styles.activationHintEditor}>
          <TextInput
            accessibilityLabel={t("Recognition hint (required)")}
            value={props.hintDraft}
            onChangeText={props.onChangeHint}
            placeholder={t("e.g. Grey hoodie, corner seat")}
            placeholderTextColor={T.textMuted}
            maxLength={42}
            style={styles.activationHintInput}
          />
          <Text style={styles.activationHintCounter}>{`${props.hintDraft.length}/42`}</Text>
        </View>
      </View>

      {props.venueHidden ? (
        <Text style={styles.activationWarningText}>{t("This venue is hidden in your settings. Unhide it before going visible here again.")}{" "}</Text>
      ) : null}

      <View style={styles.activationPrivacyNote}>
        <View style={styles.activationPrivacyIconWrap}>
          <LeftIcon name="lock" size={17} color={T.primary} />
        </View>
        <View style={styles.activationPrivacyCopy}>
          <Text style={styles.activationPrivacyTitle}>{t("What people here can see")}</Text>
          <Text style={styles.activationPrivacyText}>{t(VISIBILITY_DISCLOSURE)}</Text>
        </View>
      </View>

      <SlideToConfirmButton
        label={t("Slide to go visible")}
        subtitle={t("Start a {duration} presence", { duration: durationLabel })}
        onConfirm={props.onActivate}
        disabled={props.venueHidden || props.activationSubmitting || props.selectedVibes.length === 0 || !props.hintDraft.trim()}
        loading={props.activationSubmitting}
      />
    </View>
  );
}

function formatDurationOption(duration: number) {
  if (duration === 60) return t("1 hour");
  if (duration === 120) return t("2 hours");
  return t("{count} min", { count: duration });
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
