import { useEffect, useMemo, useState } from "react";
import { Text, TextInput, View } from "react-native";
import { styles, T } from "../../app/leftTheme";
import { FieldBlock, PrimaryButton, SelectChip } from "../../components/left/ui";
import { ScreenHeader } from "../../components/left/navigation";
import type { ExperienceProposalInput } from "../../features/discovery/discovery-service";
import type { RuntimeVenueCandidate } from "../../features/location/location-storage";

type ProposalDraft = Omit<ExperienceProposalInput, "hostUserId">;

export function ExperienceCreateScreen({
  venues,
  defaultVenueId,
  submitting,
  submitError,
  onBack,
  onSubmit,
}: {
  venues: RuntimeVenueCandidate[];
  defaultVenueId: string | null;
  submitting: boolean;
  submitError: string | null;
  onBack: () => void;
  onSubmit: (draft: ProposalDraft) => void;
}) {
  const eligibleVenues = useMemo(() => venues.filter((venue) => isUuid(venue.id)), [venues]);
  const schedules = useMemo(buildScheduleOptions, []);
  const [venueId, setVenueId] = useState(
    eligibleVenues.some((venue) => venue.id === defaultVenueId)
      ? defaultVenueId!
      : eligibleVenues[0]?.id ?? "",
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState(schedules[0].startsAt);
  const [capacity, setCapacity] = useState(8);
  const [accessibilityNotes, setAccessibilityNotes] = useState("");
  const [costNotes, setCostNotes] = useState("");

  useEffect(() => {
    if (eligibleVenues.some((venue) => venue.id === venueId)) return;
    setVenueId(
      eligibleVenues.find((venue) => venue.id === defaultVenueId)?.id ??
      eligibleVenues[0]?.id ??
      "",
    );
  }, [defaultVenueId, eligibleVenues, venueId]);

  const validationMessage = !venueId
    ? "Choose a verified nearby venue first."
    : title.trim().length < 3
      ? "Add a short title."
      : description.trim().length < 20
        ? "Add a little more detail so people know what they’re joining."
        : null;

  return (
    <View style={styles.discoveryPage}>
      <ScreenHeader
        title="Host something small"
        subtitle="A simple plan, reviewed before anyone nearby can see it."
        onBack={onBack}
        variant="utility"
      />

      <View style={styles.experienceReviewNotice}>
        <Text style={styles.experienceReviewEyebrow}>REVIEWED, NOT INSTANT</Text>
        <Text style={styles.experienceReviewText}>
          Left checks the plan, place, and wording first. Submitting does not publish it automatically.
        </Text>
      </View>

      <FieldBlock label="Place" hint="Choose where the gathering will actually happen.">
        {eligibleVenues.length ? (
          <View style={styles.chipWrap}>
            {eligibleVenues.slice(0, 5).map((venue) => (
              <SelectChip key={venue.id} label={venue.name} active={venueId === venue.id} onPress={() => setVenueId(venue.id)} />
            ))}
          </View>
        ) : (
          <Text style={styles.experienceFieldError}>No verified nearby venue is available yet.</Text>
        )}
      </FieldBlock>

      <FieldBlock label="Title" hint="Keep it specific and welcoming.">
        <TextInput
          value={title}
          onChangeText={(value) => setTitle(value.slice(0, 90))}
          placeholder="Coffee and portfolio feedback"
          placeholderTextColor={T.textMuted}
          style={styles.input}
        />
      </FieldBlock>

      <FieldBlock label="What will happen" hint="At least 20 characters. Say who it suits and what to expect.">
        <TextInput
          value={description}
          onChangeText={(value) => setDescription(value.slice(0, 1200))}
          placeholder="A relaxed hour for sharing one piece of work and getting thoughtful feedback."
          placeholderTextColor={T.textMuted}
          style={[styles.input, styles.multilineInput]}
          multiline
        />
      </FieldBlock>

      <FieldBlock label="When" hint="Preset times keep the first version simple and dependable.">
        <View style={styles.experienceChoiceColumn}>
          {schedules.map((option) => (
            <SelectChip
              key={option.startsAt}
              label={`${option.label} · ${option.time}`}
              active={startsAt === option.startsAt}
              onPress={() => setStartsAt(option.startsAt)}
            />
          ))}
        </View>
      </FieldBlock>

      <FieldBlock label="Group size" hint="Small enough for everyone to take part.">
        <View style={styles.chipWrap}>
          {[6, 8, 12, 16].map((value) => (
            <SelectChip key={value} label={`${value} people`} active={capacity === value} onPress={() => setCapacity(value)} />
          ))}
        </View>
      </FieldBlock>

      <FieldBlock label="Accessibility" hint="Optional practical access information.">
        <TextInput
          value={accessibilityNotes}
          onChangeText={(value) => setAccessibilityNotes(value.slice(0, 300))}
          placeholder="Step-free entrance, quiet corner, seating…"
          placeholderTextColor={T.textMuted}
          style={styles.input}
        />
      </FieldBlock>

      <FieldBlock label="Cost" hint="Optional. Be clear about any expected spend.">
        <TextInput
          value={costNotes}
          onChangeText={(value) => setCostNotes(value.slice(0, 160))}
          placeholder="Free, or buy your own drink"
          placeholderTextColor={T.textMuted}
          style={styles.input}
        />
      </FieldBlock>

      {submitError ? <Text style={styles.experienceFieldError}>{submitError}</Text> : null}
      {validationMessage && (title.length > 0 || description.length > 0) ? (
        <Text style={styles.experienceValidationHint}>{validationMessage}</Text>
      ) : null}
      <PrimaryButton
        label={submitting ? "Submitting for review…" : "Submit for review"}
        loading={submitting}
        disabled={!!validationMessage || submitting}
        onPress={() => onSubmit({
          venueId,
          title,
          description,
          startsAt,
          capacity,
          accessibilityNotes,
          costNotes,
        })}
      />
    </View>
  );
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function buildScheduleOptions() {
  const now = new Date();
  const make = (daysAhead: number, hour: number, label: string) => {
    const date = new Date(now);
    date.setDate(date.getDate() + daysAhead);
    date.setHours(hour, 0, 0, 0);
    return {
      label,
      time: new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date),
      startsAt: date.toISOString(),
    };
  };
  const daysUntilSaturday = ((6 - now.getDay() + 7) % 7) || 7;
  return [
    make(1, 18, "Tomorrow"),
    make(3, 18, "In three days"),
    make(daysUntilSaturday, 14, "Saturday"),
  ];
}
