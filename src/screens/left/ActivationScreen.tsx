import { Text, TextInput, View } from "react-native";
import type { AppUser } from "../../types/left-domain";
import { durationOptions, intents, vibeOptions } from "../../app/leftConfig";
import { T, styles } from "../../app/leftTheme";
import { Card, FieldBlock, PrimaryButton, SelectChip } from "../../components/left/ui";

export function ActivationScreen(props: {
  selectedIntent: AppUser["defaultIntent"];
  selectedVibes: string[];
  selectedDuration: number;
  hintDraft: string;
  onPickIntent: (v: AppUser["defaultIntent"]) => void;
  onToggleVibe: (v: string) => void;
  onPickDuration: (v: number) => void;
  onChangeHint: (v: string) => void;
  onActivate: () => void;
}) {
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
      <PrimaryButton label="Become visible" onPress={props.onActivate} />
    </Card>
  );
}
