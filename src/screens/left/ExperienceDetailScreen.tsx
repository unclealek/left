import { ActivityIndicator, Pressable, Text, View } from "react-native";
import type { VenueExperience } from "../../types/left-domain";
import { styles, T } from "../../app/leftTheme";
import { LeftIcon } from "../../components/icons";
import { ScreenHeader } from "../../components/left/navigation";

export function ExperienceDetailScreen({
  experience,
  attendanceBusy,
  onBack,
  onToggleAttendance,
  onOpenVenue,
}: {
  experience: VenueExperience;
  attendanceBusy: boolean;
  onBack: () => void;
  onToggleAttendance: () => void;
  onOpenVenue: () => void;
}) {
  const remaining = Math.max(experience.capacity - experience.attendeeCount, 0);

  return (
    <View style={styles.discoveryPage}>
      <ScreenHeader title="Small gathering" onBack={onBack} variant="utility" />

      <View style={styles.experienceHero}>
        <Text style={styles.experienceEyebrow}>HOSTED BY {experience.hostFirstName.toUpperCase()}</Text>
        <Text style={styles.experienceTitle}>{experience.title}</Text>
        <View style={styles.experienceHeroMeta}>
          <LeftIcon name="calendar" size={16} color={T.primary} />
          <Text style={styles.experienceHeroMetaText}>{formatExperienceDate(experience.startsAt)}</Text>
        </View>
      </View>

      <Text style={styles.experienceDescription}>{experience.description}</Text>

      <View style={styles.experienceFacts}>
        <ExperienceFact icon="map-pin" title={experience.venueName} text="Open venue details" onPress={onOpenVenue} />
        <ExperienceFact
          icon="users"
          title={`${experience.attendeeCount} of ${experience.capacity} going`}
          text={remaining > 0 ? `${remaining} ${remaining === 1 ? "place" : "places"} left` : "This gathering is full"}
        />
        {experience.accessibilityNotes ? (
          <ExperienceFact icon="heart" title="Accessibility" text={experience.accessibilityNotes} />
        ) : null}
        {experience.costNotes ? <ExperienceFact icon="credit-card" title="Cost" text={experience.costNotes} /> : null}
      </View>

      <View style={styles.experienceSafetyNote}>
        <LeftIcon name="shield" size={18} color={T.primary} />
        <Text style={styles.experienceSafetyText}>Experiences appear publicly only after review. Normal blocking and reporting controls still apply.</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: attendanceBusy || (!experience.viewerAttending && remaining === 0), busy: attendanceBusy }}
        disabled={attendanceBusy || (!experience.viewerAttending && remaining === 0)}
        onPress={onToggleAttendance}
        style={({ pressed }) => [
          styles.experiencePrimaryAction,
          experience.viewerAttending && styles.experiencePrimaryActionSelected,
          pressed && styles.iconButtonPressed,
        ]}
      >
        {attendanceBusy ? (
          <ActivityIndicator color={T.actionContent} />
        ) : (
          <LeftIcon name={experience.viewerAttending ? "check" : "calendar"} size={18} color={T.actionContent} />
        )}
        <Text style={styles.experiencePrimaryActionText}>
          {experience.viewerAttending ? "You’re going · Change plans" : remaining > 0 ? "Attend this gathering" : "Gathering full"}
        </Text>
      </Pressable>
    </View>
  );
}

function ExperienceFact({ icon, title, text, onPress }: { icon: "map-pin" | "users" | "heart" | "credit-card"; title: string; text: string; onPress?: () => void }) {
  const content = (
    <>
      <View style={styles.experienceFactIcon}><LeftIcon name={icon} size={17} color={T.primary} /></View>
      <View style={styles.experienceFactCopy}>
        <Text style={styles.experienceFactTitle}>{title}</Text>
        <Text style={styles.experienceFactText}>{text}</Text>
      </View>
      {onPress ? <LeftIcon name="chevron-right" size={18} color={T.textSecondary} /> : null}
    </>
  );
  return onPress ? (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.experienceFact, pressed && styles.iconButtonPressed]}>{content}</Pressable>
  ) : <View style={styles.experienceFact}>{content}</View>;
}

function formatExperienceDate(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
