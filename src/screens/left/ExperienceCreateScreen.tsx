import { t, getTranslationLocale } from "../../features/preferences/translation-runtime";
import { isUuid } from "../../lib/validation";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Share, Text, TextInput, View } from "react-native";
import { styles, T } from "../../app/leftTheme";
import { FieldBlock, PrimaryButton, SelectChip } from "../../components/left/ui";
import { ScreenHeader } from "../../components/left/navigation";
import { fetchHostedExperiences, type HostedExperience, type ExperienceProposalInput } from "../../features/discovery/discovery-service";
import type { RuntimeVenueCandidate } from "../../features/location/location-storage";

import { COST_CHOICES, POTLUCK_CHOICES, changeAmount, costNotesFor, parseEuroAmount, type GatheringCostChoice } from "../../features/discovery/gathering-cost";
import { approvedGatheringUrl } from "../../features/guest/gathering-links";

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
  const [hostedPlans, setHostedPlans] = useState<HostedExperience[]>([]);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [plansLoading, setPlansLoading] = useState(true);
  const [reloadPlans, setReloadPlans] = useState(0);
  useEffect(() => {
    let active = true;
    setPlansLoading(true);
    setPlansError(null);
    void fetchHostedExperiences().then((plans) => {
      if (active) setHostedPlans(plans);
    }).catch((error) => {
      if (active) setPlansError(error instanceof Error ? error.message : "Couldn’t load your plans.");
    }).finally(() => { if (active) setPlansLoading(false); });
    return () => { active = false; };
  }, [reloadPlans]);
  const eligibleVenues = useMemo(() => venues.filter((venue) => isUuid(venue.id)), [venues]);
  const locale = getTranslationLocale();
  const schedules = useMemo(() => buildScheduleOptions(locale), [locale]);
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
  const [costChoice, setCostChoice] = useState<GatheringCostChoice>("free");
  const [amountCents, setAmountCents] = useState(500);
  const [amountText, setAmountText] = useState("5");
  const [potluck, setPotluck] = useState(POTLUCK_CHOICES[0]);
  const [costDetails, setCostDetails] = useState("");
  const costNotes = costNotesFor(costChoice, amountCents, potluck, costDetails);
  const hasAmount = costChoice === "paid" || costChoice === "split";
  const amountInvalid = hasAmount && parseEuroAmount(amountText) === null;
  const adjustAmount = (direction:number) => {
    const next=changeAmount(parseEuroAmount(amountText) ?? amountCents,direction);
    setAmountCents(next);setAmountText(new Intl.NumberFormat(locale, { useGrouping: false, maximumFractionDigits: 2 }).format(next / 100));
  };

  useEffect(() => {
    if (eligibleVenues.some((venue) => venue.id === venueId)) return;
    setVenueId(
      eligibleVenues.find((venue) => venue.id === defaultVenueId)?.id ??
      eligibleVenues[0]?.id ??
      "",
    );
  }, [defaultVenueId, eligibleVenues, venueId]);

  const validationMessage = amountInvalid ? "Enter an amount between €0 and €1,000, with up to two decimal places." : !venueId
    ? "Choose a verified nearby venue first."
    : title.trim().length < 3
      ? "Add a short title."
      : description.trim().length < 20
        ? "Add a little more detail so people know what they’re joining."
        : null;

  return (
    <View style={styles.discoveryPage}>
      <ScreenHeader
        title={t("Host something small")}
        subtitle={t("A simple plan, reviewed before anyone nearby can see it.")}
        onBack={onBack}
        variant="utility"
      />

      <FieldBlock label={t("Your plans")} hint="Submitted plans stay private until a reviewer approves them.">
        {plansLoading ? <Text style={styles.experienceValidationHint}>{t("Loading your plans…")}</Text> : null}
        {plansError ? <Text style={styles.experienceFieldError}>{t(plansError)}</Text> : null}
        {!plansLoading && !plansError && !hostedPlans.length ? <Text style={styles.experienceValidationHint}>{t("You haven’t submitted a plan yet.")}</Text> : null}
        {hostedPlans.map((plan) => (
          <View key={plan.id} style={styles.experienceReviewNotice}>
            <Text style={styles.experienceReviewEyebrow}>{plan.status === "pending_review" ? t("Awaiting review") : plan.status}</Text>
            <Text style={styles.experienceReviewText}>{plan.title}</Text>
            <Text style={styles.experienceValidationHint}>{new Date(plan.starts_at).toLocaleString(getTranslationLocale())}</Text>
            {approvedGatheringUrl(plan, process.env.EXPO_PUBLIC_GATHERING_SHARE_ORIGIN) ? (
              <SelectChip label={t("Share gathering")} active={false} onPress={() => {
                const url=approvedGatheringUrl(plan, process.env.EXPO_PUBLIC_GATHERING_SHARE_ORIGIN);
                if(url) void Share.share({message:`${plan.title} — ${url}`,url}).catch(() => setPlansError("Couldn’t open sharing. Try again."));
              }} />
            ) : plan.status === "published" && Date.parse(plan.starts_at)>Date.now() ? <Text style={styles.experienceValidationHint}>{t("Sharing will be available soon.")}</Text> : null}
          </View>
        ))}
        <SelectChip label={t("Refresh plans")} active={false} onPress={() => setReloadPlans((value) => value + 1)} />
      </FieldBlock>

      <View style={styles.experienceReviewNotice}>
        <Text style={styles.experienceReviewEyebrow}>{t("REVIEWED, NOT INSTANT")}</Text>
        <Text style={styles.experienceReviewText}>{t("HERE checks the plan, place, and wording first. Submitting does not publish it automatically.")}{" "}</Text>
      </View>

      <FieldBlock label={t("Place")} hint="Choose where the gathering will actually happen.">
        {eligibleVenues.length ? (
          <View style={styles.chipWrap}>
            {eligibleVenues.slice(0, 5).map((venue) => (
              <SelectChip key={venue.id} label={venue.name} active={venueId === venue.id} onPress={() => setVenueId(venue.id)} />
            ))}
          </View>
        ) : (
          <Text style={styles.experienceFieldError}>{t("No verified nearby venue is available yet.")}</Text>
        )}
      </FieldBlock>

      <FieldBlock label={t("Title")} hint="Keep it specific and welcoming.">
        <TextInput
          value={title}
          onChangeText={(value) => setTitle(value.slice(0, 90))}
          placeholder={t("Coffee and portfolio feedback")}
          placeholderTextColor={T.textMuted}
          style={styles.input}
        />
      </FieldBlock>

      <FieldBlock label={t("What will happen")} hint="At least 20 characters. Say who it suits and what to expect.">
        <TextInput
          value={description}
          onChangeText={(value) => setDescription(value.slice(0, 1200))}
          placeholder={t("A relaxed hour for sharing one piece of work and getting thoughtful feedback.")}
          placeholderTextColor={T.textMuted}
          style={[styles.input, styles.multilineInput]}
          multiline
        />
      </FieldBlock>

      <FieldBlock label={t("When")} hint="Preset times keep the first version simple and dependable.">
        <View style={styles.experienceChoiceColumn}>
          {schedules.map((option) => (
            <SelectChip
              key={option.startsAt}
              label={`${t(option.label)} · ${option.time}`}
              active={startsAt === option.startsAt}
              onPress={() => setStartsAt(option.startsAt)}
            />
          ))}
        </View>
      </FieldBlock>

      <FieldBlock label={t("Group size")} hint="Small enough for everyone to take part.">
        <View style={styles.chipWrap}>
          {[6, 8, 12, 16].map((value) => (
            <SelectChip key={value} label={`${value} people`} active={capacity === value} onPress={() => setCapacity(value)} />
          ))}
        </View>
      </FieldBlock>

      <FieldBlock label={t("Accessibility")} hint="Optional practical access information.">
        <TextInput
          value={accessibilityNotes}
          onChangeText={(value) => setAccessibilityNotes(value.slice(0, 300))}
          placeholder={t("Step-free entrance, quiet corner, seating…")}
          placeholderTextColor={T.textMuted}
          style={styles.input}
        />
      </FieldBlock>

      <FieldBlock label={t("Cost")} hint="Choose an option, then add any practical details.">
        <View style={styles.chipWrap}>
          {COST_CHOICES.map(option => <SelectChip key={option.id} label={t(option.label)} active={costChoice===option.id} onPress={() => setCostChoice(option.id)} />)}
        </View>
        {costChoice === "potluck" ? <View style={styles.chipWrap}>
          {POTLUCK_CHOICES.map(option => <SelectChip key={option} label={t(option)} active={potluck===option} onPress={() => setPotluck(option)} />)}
        </View> : null}
        {hasAmount ? <View style={{flexDirection:"row",alignItems:"center",gap:12}}>
          <Pressable accessibilityRole="button" accessibilityLabel={t("Decrease amount by one euro")} disabled={amountCents===0} accessibilityState={{disabled:amountCents===0}} onPress={() => adjustAmount(-1)} style={[styles.input,{width:48,alignItems:"center",justifyContent:"center"}]}><Text style={styles.experienceReviewText}>−</Text></Pressable>
          <View style={{flex:1}}>
            <Text style={styles.experienceValidationHint}>{t("EUR per person")}</Text>
            <TextInput accessibilityLabel={t("Amount in euros per person")} value={amountText} keyboardType="decimal-pad" onChangeText={value => {setAmountText(value.slice(0,8));const cents=parseEuroAmount(value);if(cents!==null)setAmountCents(cents);}} style={styles.input} />
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel={t("Increase amount by one euro")} disabled={amountCents===100000} accessibilityState={{disabled:amountCents===100000}} onPress={() => adjustAmount(1)} style={[styles.input,{width:48,alignItems:"center",justifyContent:"center"}]}><Text style={styles.experienceReviewText}>+</Text></Pressable>
        </View> : null}
        <TextInput accessibilityLabel={t("Custom cost or potluck details")} value={costDetails} onChangeText={value => setCostDetails(value.slice(0,100))} placeholder={costChoice === "potluck" ? t("Dietary needs or what to bring…") : t("Add your own details (optional)…")} placeholderTextColor={T.textMuted} style={styles.input} />
        {costNotes ? <Text style={styles.experienceValidationHint}>{costNotes}</Text> : null}
      </FieldBlock>

      {submitError ? <Text style={styles.experienceFieldError}>{t(submitError)}</Text> : null}
      {validationMessage && (title.length > 0 || description.length > 0) ? (
        <Text style={styles.experienceValidationHint}>{t(validationMessage)}</Text>
      ) : null}
      <PrimaryButton
        label={submitting ? t("Submitting for review…") : t("Submit for review")}
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


function buildScheduleOptions(locale: string) {
  const now = new Date();
  const make = (daysAhead: number, hour: number, label: string) => {
    const date = new Date(now);
    date.setDate(date.getDate() + daysAhead);
    date.setHours(hour, 0, 0, 0);
    return {
      label,
      time: new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit" }).format(date),
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
