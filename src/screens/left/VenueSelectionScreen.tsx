import { StyleSheet, Text, TextInput, View } from "react-native";
import { styles, T } from "../../app/leftTheme";
import { Card, GhostButton, PrimaryButton, SelectChip } from "../../components/left/ui";
import type { VenueType } from "../../types/left-domain";
import type { RuntimeVenueCandidate } from "../../features/location/location-storage";

const venueTypes: VenueType[] = [
  "cafe",
  "library",
  "coworking_space",
  "airport",
  "gym",
  "university",
  "other",
];

function VenueFieldBlock({
  label,
  tone,
  helper,
  children,
}: {
  label: string;
  tone: "required" | "important" | "optional";
  helper: string;
  children: React.ReactNode;
}) {
  const badgeLabel =
    tone === "required" ? "Required" : tone === "important" ? "Important" : "Optional";

  return (
    <View style={styles.fieldBlock}>
      <View style={localStyles.fieldLabelRow}>
        <Text style={styles.fieldLabel}>{label.toUpperCase()}</Text>
        <View
          style={[
            localStyles.fieldBadge,
            tone === "required"
              ? localStyles.fieldBadgeRequired
              : tone === "important"
                ? localStyles.fieldBadgeImportant
                : localStyles.fieldBadgeOptional,
          ]}
        >
          <Text
            style={[
              localStyles.fieldBadgeText,
              tone === "required"
                ? localStyles.fieldBadgeTextRequired
                : tone === "important"
                  ? localStyles.fieldBadgeTextImportant
                  : localStyles.fieldBadgeTextOptional,
            ]}
          >
            {badgeLabel}
          </Text>
        </View>
      </View>
      {children}
      <Text style={styles.cardBody}>{helper}</Text>
    </View>
  );
}

export function VenueSelectionScreen({
  venues,
  currentVenueId,
  onSelectVenue,
  onAddVenue,
  onBack,
}: {
  venues: RuntimeVenueCandidate[];
  currentVenueId: string | null;
  onSelectVenue: (venueId: string) => void;
  onAddVenue: () => void;
  onBack: () => void;
}) {
  return (
    <Card>
      <Text style={styles.cardTitle}>Pick your{"\n"}venue.</Text>
      <Text style={styles.cardBody}>
        We found more than one nearby place. Choose the one you are actually in so presence and prompts stay accurate.
      </Text>
      <View style={styles.venueChoiceList}>
        {venues.map((venue) => (
          <GhostButton
            key={venue.id}
            label={`${venue.name}${venue.distanceMeters ? ` · ${Math.round(venue.distanceMeters)}m` : ""}${currentVenueId === venue.id ? " ✓" : ""}`}
            onPress={() => onSelectVenue(venue.id)}
          />
        ))}
      </View>
      <GhostButton label="Can't find your venue? Add +" onPress={onAddVenue} />
      <GhostButton label="Back" onPress={onBack} />
    </Card>
  );
}

export function VenueAddScreen({
  name,
  address,
  notes,
  venueType,
  submitting,
  onChangeName,
  onChangeAddress,
  onChangeNotes,
  onChangeVenueType,
  onSubmit,
  onBack,
}: {
  name: string;
  address: string;
  notes: string;
  venueType: VenueType;
  submitting: boolean;
  onChangeName: (value: string) => void;
  onChangeAddress: (value: string) => void;
  onChangeNotes: (value: string) => void;
  onChangeVenueType: (value: VenueType) => void;
  onSubmit: () => void;
  onBack: () => void;
}) {
  return (
    <Card>
      <Text style={styles.cardTitle}>Add this{"\n"}venue.</Text>
      <Text style={styles.cardBody}>
        If the right place is missing, add it with enough detail for the next person standing nearby.
      </Text>
      <Text style={styles.settingsInfoBody}>Name and address are mandatory before this venue can be saved.</Text>
      <VenueFieldBlock
        label="Venue name"
        tone="required"
        helper="Use the real name people would recognize on arrival."
      >
        <TextInput
          value={name}
          onChangeText={onChangeName}
          placeholder="e.g. Workshop Cafe"
          placeholderTextColor={T.textMuted}
          style={styles.input}
        />
      </VenueFieldBlock>
      <VenueFieldBlock
        label="Type"
        tone="important"
        helper="Pick the closest category so discovery and filtering stay accurate."
      >
        <View style={styles.chipWrap}>
          {venueTypes.map((option) => (
            <SelectChip
              key={option}
              label={option.replaceAll("_", " ")}
              active={venueType === option}
              onPress={() => onChangeVenueType(option)}
            />
          ))}
        </View>
      </VenueFieldBlock>
      <VenueFieldBlock
        label="Address or landmark"
        tone="required"
        helper="Add the key detail someone would need to find this exact place."
      >
        <TextInput
          value={address}
          onChangeText={onChangeAddress}
          placeholder="Street, mall level, corner, or entrance"
          placeholderTextColor={T.textMuted}
          style={styles.input}
        />
      </VenueFieldBlock>
      <VenueFieldBlock
        label="Notes"
        tone="optional"
        helper="Use notes for anything unusual like floor, entrance, or inside-a-building context."
      >
        <TextInput
          value={notes}
          onChangeText={onChangeNotes}
          placeholder="Optional context that helps distinguish the venue"
          placeholderTextColor={T.textMuted}
          style={[styles.input, styles.multilineInput]}
          multiline
        />
      </VenueFieldBlock>
      <PrimaryButton label={submitting ? "Saving venue..." : "Save venue"} onPress={onSubmit} />
      <GhostButton label="Back to nearby venues" onPress={onBack} />
    </Card>
  );
}

const localStyles = StyleSheet.create({
  fieldLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  fieldBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
  },
  fieldBadgeRequired: {
    backgroundColor: T.dangerDim,
    borderColor: T.dangerBorder,
  },
  fieldBadgeImportant: {
    backgroundColor: T.visibilityOffSoft,
    borderColor: T.visibilityOff,
  },
  fieldBadgeOptional: {
    backgroundColor: T.surfaceMid,
    borderColor: T.borderBlack,
  },
  fieldBadgeText: {
    fontSize: 11,
    lineHeight: 12,
    fontFamily: T.fontBodyBold,
  },
  fieldBadgeTextRequired: {
    color: T.accentBright,
  },
  fieldBadgeTextImportant: {
    color: T.textPrimary,
  },
  fieldBadgeTextOptional: {
    color: T.textSecondary,
  },
});
