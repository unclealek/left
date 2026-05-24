import { Text, TextInput, View } from "react-native";
import { styles, T } from "../../app/leftTheme";
import { Card, FieldBlock, GhostButton, PrimaryButton, SelectChip } from "../../components/left/ui";
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

export function VenueSelectionScreen({
  venues,
  currentVenueId,
  onSelectVenue,
  onAddVenue,
}: {
  venues: RuntimeVenueCandidate[];
  currentVenueId: string | null;
  onSelectVenue: (venueId: string) => void;
  onAddVenue: () => void;
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
      <FieldBlock label="Venue name">
        <TextInput
          value={name}
          onChangeText={onChangeName}
          placeholder="e.g. Workshop Cafe"
          placeholderTextColor={T.textMuted}
          style={styles.input}
        />
      </FieldBlock>
      <FieldBlock label="Type">
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
      </FieldBlock>
      <FieldBlock label="Address or landmark">
        <TextInput
          value={address}
          onChangeText={onChangeAddress}
          placeholder="Street, mall level, corner, or entrance"
          placeholderTextColor={T.textMuted}
          style={styles.input}
        />
      </FieldBlock>
      <FieldBlock label="Notes">
        <TextInput
          value={notes}
          onChangeText={onChangeNotes}
          placeholder="Optional context that helps distinguish the venue"
          placeholderTextColor={T.textMuted}
          style={[styles.input, styles.multilineInput]}
          multiline
        />
      </FieldBlock>
      <PrimaryButton label={submitting ? "Saving venue..." : "Save venue"} onPress={onSubmit} />
      <GhostButton label="Back to nearby venues" onPress={onBack} />
    </Card>
  );
}
