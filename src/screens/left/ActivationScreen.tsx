import { Text, TextInput, View } from "react-native";
import type { AppUser } from "../../types/left-domain";
import { durationOptions, formatElapsedDuration, intents, vibeOptions } from "../../app/leftConfig";
import { T, styles } from "../../app/leftTheme";
import { Card, FieldBlock, PrimaryButton, SelectChip } from "../../components/left/ui";

export function ActivationScreen(props: {
  sessionVisible: boolean;
  venueHidden: boolean;
  selectedIntent: AppUser["defaultIntent"];
  selectedVibes: string[];
  selectedDuration: number;
  hintDraft: string;
  elapsedSeconds: number;
  activationSubmitting: boolean;
  endingSession: boolean;
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
      <Text style={styles.cardTitle}>Set your{"\n"}presence.</Text>
      <FieldBlock label="Intent">
        <View style={styles.chipWrap}>
          {intents.map((i) => (
            <SelectChip key={i.id} label={i.label} active={props.selectedIntent === i.id} onPress={() => props.onPickIntent(i.id)} />
          ))}
        </View>
      </FieldBlock>
      <FieldBlock label="Vibes">
        <View style={styles.chipWrap}>
          {vibeOptions.map((v) => (
            <SelectChip key={v} label={v} active={props.selectedVibes.includes(v)} onPress={() => props.onToggleVibe(v)} />
          ))}
        </View>
      </FieldBlock>
      <FieldBlock label="Duration">
        <View style={styles.chipWrap}>
          {durationOptions.map((d) => (
            <SelectChip key={d} label={`${d}m`} active={props.selectedDuration === d} onPress={() => props.onPickDuration(d)} />
          ))}
        </View>
      </FieldBlock>
      <FieldBlock label="Hint card">
        <TextInput
          value={props.hintDraft}
          onChangeText={props.onChangeHint}
          placeholder="e.g. Blue headphones, left table"
          placeholderTextColor={T.textMuted}
          style={styles.input}
        />
      </FieldBlock>
      {props.venueHidden ? (
        <Text style={styles.settingsInfoBody}>
          This venue is hidden in your settings. Unhide it before going visible here again.
        </Text>
      ) : null}
      <PrimaryButton
        label={props.activationSubmitting ? "Going visible..." : "Go visible"}
        onPress={props.onActivate}
        disabled={props.venueHidden || props.activationSubmitting}
      />
    </Card>
  );
}
