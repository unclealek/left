import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RuntimeVenueCandidate } from '../../features/location/location-storage';
import { VenuePhoto, PhotoCredits } from './VenuePhoto';
import { useReducedTransparency } from './use-navigation-accessibility';
import { hospitalityColors as H } from '../theme/hospitality';

/** One fixed, edge-to-edge photographic backdrop for product pages. */
export function VenueBackground({ venue }: { venue?: RuntimeVenueCandidate | null }) {
  const opaque = useReducedTransparency();
  const insets = useSafeAreaInsets();
  return <View pointerEvents="box-none" style={[StyleSheet.absoluteFillObject, { backgroundColor: H.ivory }]}>
    {!opaque ? <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={StyleSheet.absoluteFillObject}>
      <VenuePhoto venue={venue} photo={venue?.photo} uri={venue?.photoUrl} blurRadius={14} showFallbackLabel={false} />
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(247,244,238,0.60)' }]} />
    </View> : null}
    {!opaque && venue?.photo ? <View pointerEvents="box-none" style={{ position: 'absolute', bottom: insets.bottom + 102, right: 12, maxWidth: '65%' }}>
      <PhotoCredits photo={venue.photo} />
    </View> : null}
  </View>;
}
