import { t } from "../../features/preferences/translation-runtime";
import { useState } from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import type { RuntimeVenueCandidate } from '../../features/location/location-storage';
import { hospitalityColors as H } from '../theme/hospitality';
import { T } from '../theme';
import { resolveVenuePhotoKind, getVenuePhotoFallbackLabel, type VenuePhotoContext, type VenuePhotoKind } from './venue-photo-model';
import { getVenuePhotoFallbackSource } from './venue-illustrations';

type Photo = NonNullable<RuntimeVenueCandidate['photo']>;
/** One image/failure path for venue heroes, thumbnails, and decorative page photography. */
export function VenuePhoto({ photo, uri, venue, fallback, variant = 'fill', showFallbackLabel = true, blurRadius = 0, onPhotoLoad, onPhotoError }: {
  photo?: Photo | null; uri?: string | null; fallback?: VenuePhotoKind; venue?: VenuePhotoContext | null; variant?: 'fill' | 'panel'; showFallbackLabel?: boolean;
  blurRadius?: number; onPhotoLoad?: () => void; onPhotoError?: () => void;
}) {
  const fallbackKind = fallback ?? resolveVenuePhotoKind(venue);
  const sourceUri = photo?.uri ?? uri;
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const [loadedUri, setLoadedUri] = useState<string | null>(null);
  const available = !!sourceUri && failedUri !== sourceUri;
  return <View pointerEvents="none" style={variant === 'panel' ? s.panel : s.fill}>
    <Image accessible={false} source={getVenuePhotoFallbackSource(fallbackKind)} resizeMode="cover" blurRadius={blurRadius} style={s.fill} />
    {available ? <Image accessible={false} source={{ uri: sourceUri }} resizeMode="cover" blurRadius={blurRadius} style={s.fill}
      onLoad={() => { setLoadedUri(sourceUri); onPhotoLoad?.(); }}
      onError={() => { setFailedUri(sourceUri); setLoadedUri(null); onPhotoError?.(); }} /> : null}
    {showFallbackLabel && (!available || loadedUri !== sourceUri) ? <View style={s.caption}>
      <Text style={s.captionText}>{getVenuePhotoFallbackLabel(fallbackKind)}</Text>
    </View> : null}
  </View>;
}

export function PhotoCredits({ photo, onDark = false }: { photo?: Photo | null; onDark?: boolean }) {
  if (!photo) return null;
  return <View style={[s.credits, onDark && s.darkCredits]}>
    <Text style={[s.creditText, onDark && s.lightText]}>{t("Google Maps")}</Text>
    {photo.attributions.map((author, index) => author.uri ?
      <Pressable key={index} accessibilityRole="link" accessibilityLabel={t("Photo by {author}", { author: author.displayName })}
        style={s.creditLink} onPress={() => { void Linking.openURL(author.uri!).catch(() => {}); }}>
        <Text style={[s.creditText, onDark && s.lightText]}>{author.displayName}</Text>
      </Pressable> : <Text key={index} style={[s.creditText, onDark && s.lightText]}>{author.displayName}</Text>)}
  </View>;
}
const s = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  panel: { height: 140, width: '100%', borderRadius: 20, overflow: 'hidden', backgroundColor: H.soft },
  caption: { position: 'absolute', bottom: 8, left: 8, right: 8, alignItems: 'flex-start' },
  captionText: { backgroundColor: H.ivory, color: H.ink, paddingHorizontal: 6, paddingVertical: 3,
    borderRadius: 5, fontSize: 10, lineHeight: 15, fontFamily: T.fontBody },
  credits: { paddingHorizontal: 8, paddingVertical: 3, flexDirection: 'row', flexWrap: 'wrap', gap: 5, backgroundColor: H.ivory },
  darkCredits: { backgroundColor: 'transparent', paddingHorizontal: 0 },
  creditText: { color: H.secondary, fontSize: 10, lineHeight: 15, fontFamily: T.fontBody },
  lightText: { color: '#FFFFFF' },
  creditLink: { minHeight: 44, justifyContent: 'center', flexShrink: 1 },
});
