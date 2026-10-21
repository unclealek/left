import { t } from "../features/preferences/translation-runtime";
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles, T } from './leftTheme';
import { PrimaryButton, SelectChip } from '../components/left/ui';
import { BackgroundWaveLayer } from '../components/left/BackgroundWaveLayer';
import { ExperienceDetailScreen } from '../screens/left/ExperienceDetailScreen';
import { fetchSharedGathering } from '../features/guest/shared-gathering';
import type { VenueExperience } from '../types/left-domain';
import { usePostHogScreen } from '../lib/use-posthog-screen';

// Link-scoped preview only: never mounts member discovery or general navigation.
export function GuestApp({ sharedGatheringId, onSignIn }: { sharedGatheringId: string | null; onSignIn: () => void }) {
  const insets = useSafeAreaInsets();
  const [result, setResult] = useState<{ linkId: string; gathering: VenueExperience | null; error: string | null } | null>(null);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let active = true;
    setResult(null);
    if (!sharedGatheringId) return;
    void fetchSharedGathering(sharedGatheringId).then(gathering => {
      if (active) setResult({ linkId: sharedGatheringId, gathering, error: gathering ? null : 'This gathering is no longer available.' });
    }).catch(() => {
      if (active) setResult({ linkId: sharedGatheringId, gathering: null, error: 'This gathering could not be loaded. Please try again.' });
    });
    return () => { active = false; };
  }, [sharedGatheringId, reload]);
  usePostHogScreen('shared-gathering', 'guest');
  // Never briefly show the previous event while a different link is loading.
  const current = sharedGatheringId && result?.linkId === sharedGatheringId ? result : null;
  return <View style={styles.shell}>
    <StatusBar style="dark" />
    <BackgroundWaveLayer variant="hospitality" />
    <ScrollView contentInsetAdjustmentBehavior="never"
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24, gap: 16 }]}>
      {current?.gathering ? <ExperienceDetailScreen experience={current.gathering} attendanceBusy={false}
        onBack={onSignIn} onToggleAttendance={onSignIn} onOpenVenue={onSignIn} guest /> :
      sharedGatheringId && !current ? <ActivityIndicator accessibilityLabel="Loading shared gathering" color={T.primary} /> :
      <View style={styles.homeCard}>
        <Text accessibilityRole={current?.error ? 'alert' : 'header'} style={current?.error ? styles.homeError : styles.homeCardTitle}>
          {t(current?.error ?? 'Open a gathering link to view its event')}</Text>
        {current?.error ? <SelectChip label={t("Try again")} active={false} onPress={() => { setResult(null); setReload(value => value + 1); }} /> : null}
        <PrimaryButton label={t("Sign in")} onPress={onSignIn} />
      </View>}
    </ScrollView>
  </View>;
}
