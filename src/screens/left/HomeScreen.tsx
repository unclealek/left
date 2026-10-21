import { t } from "../../features/preferences/translation-runtime";
import { useDistanceFormatter } from "../../features/preferences/use-distance";
import { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, FlatList, Linking, Pressable, Text, View, useWindowDimensions } from 'react-native';
import type { RuntimeVenueCandidate } from '../../features/location/location-storage';
import { getVenuePhotoFallbackLabel, resolveVenuePhotoKind } from '../../components/left/venue-photo-model';
import { VenuePhoto, PhotoCredits } from '../../components/left/VenuePhoto';
import { resolveVenueConfidence } from '../../features/location/venue-confidence';
import { styles } from '../../app/leftTheme';
import { LeftIcon } from '../../components/icons';
import { GhostButton, PrimaryButton } from '../../components/buttons';
import { hospitalityColors as H } from '../../components/theme/hospitality';
import type { NearbyFeedItem, VenueActivityEnvelope, VenueContextSummary, VenueExperience } from '../../types/left-domain';
import { fetchVenuePracticalDetails } from '../../features/venues/venue-details-service';
import { homeActivityLabel, venueCategory } from './home-presentation';

type Photo = NonNullable<RuntimeVenueCandidate['photo']>;
type HomeProps = {
  guest?: boolean;
  venue: VenueContextSummary;
  nearbyVenues: RuntimeVenueCandidate[];
  venueActivityById: Record<string, VenueActivityEnvelope>;
  experiences: VenueExperience[];
  feed: NearbyFeedItem[];
  sessionVisible: boolean;
  venueHidden: boolean;
  activationSubmitting?: boolean;
  visibilityPending?: boolean;
  visibilityError?: string | null;
  nearbyLoading?: boolean;
  topInset?: number;
  onBecomeVisible: () => void;
  onGoPrivate: () => void;
  onOpenPeople: () => void;
  onOpenAllVenues: () => void;
  onOpenVenueDetail: (venue: RuntimeVenueCandidate) => void;
  onOpenExperience: (experience: VenueExperience) => void;
  onCreateExperience: () => void;
  onOpenSafety: () => void;
};

// One bounded photo queue for both hero and carousel. URLs remain memory-only.
function useHomePhotos(venues: RuntimeVenueCandidate[]) {
  const ids = JSON.stringify(venues.map(venue => venue.id));
  const [details, setDetails] = useState<Record<string, Awaited<ReturnType<typeof fetchVenuePracticalDetails>>>>({});
  const completed = useRef(new Set<string>());
  useEffect(() => {
    let cancelled = false;
    const queue = (JSON.parse(ids) as string[]).filter(id => !completed.current.has(id));
    async function worker() {
      while (queue.length && !cancelled) {
        const id = queue.shift()!;
        try {
          const result = await fetchVenuePracticalDetails(id);
          if (!cancelled && result) {
            completed.current.add(id);
            setDetails(current => ({ ...current, [id]: result }));
          }
        } catch { /* Keep the local, neutral fallback; venue details can retry later. */ }
      }
    }
    void Promise.all([worker(), worker()]);
    return () => { cancelled = true; };
  }, [ids]);
  return details;
}

function SectionHeader({ title, onPress, disabled = false }: { title: string; onPress?: () => void; disabled?: boolean }) {
  return <View style={styles.homeHeadingRow}>
    <Text accessibilityRole="header" style={styles.homeSectionTitle}>{title}</Text>
    {onPress ? <Pressable accessibilityRole="button" accessibilityLabel={`${t("See all")} ${title.toLowerCase()}`}
      accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
      style={[styles.homeSeeAll, disabled && styles.homeDisabled]}>
      <Text style={styles.homeSeeAllText}>{t("See all")}</Text><LeftIcon name="arrow-right" size={15} color={H.moss} />
    </Pressable> : null}
  </View>;
}
function VisibilityCard({ visible, confirmed, pending, error, onAction, onOpenSafety, guest = false }: {
  guest?: boolean; visible: boolean; confirmed: boolean; pending: boolean; error?: string | null;
  onAction: () => void; onOpenSafety: () => void;
}) {
  const Action = visible ? GhostButton : PrimaryButton;
  const awaitingVenue = !visible && !confirmed;
  return <View style={styles.homeVisibilityCard}>
    <View style={styles.homeVisibilityHeading}>
      <View style={styles.homeVisibilityCopy}>
        <View style={styles.homeStateRow}><View style={[styles.homeStateDot, !visible && styles.homePrivateDot]} />
          <Text style={styles.homeStateLabel}>{visible ? t("Visible here") : awaitingVenue ? t("Private right now") : t("Private here")}</Text></View>
        {!awaitingVenue ? <Text style={styles.homeCardTitle}>{visible ? t("You're visible at this venue") : t("You're private at this venue")}</Text> : null}
      </View>
      <View style={styles.homeStateIcon}><LeftIcon name={visible ? "eye" : "eye-off"} size={25} color={H.moss} /></View>
    </View>
    <Text style={styles.homeBody}>{guest ? t("Sign in to confirm your venue and discover people nearby.") : awaitingVenue ? t("Confirm your venue to become visible and discover people nearby.") : visible
      ? t("People here can discover you through your interests and vibe. You stay anonymous.")
      : t("You're hidden until you choose to be discovered.")}</Text>
    {error ? <Text accessibilityRole="alert" style={styles.homeError}>{t(error)}</Text> : null}
    <Action label={guest ? t("Sign in to go visible") : visible ? t("Go private") : t("Go visible")} leadingIcon={visible ? "eye-off" : "eye"}
      onPress={onAction} loading={pending} disabled={!guest && !visible && !confirmed} tone="hospitality" />
    <Pressable accessibilityRole="button" onPress={onOpenSafety} style={styles.homeSafety}>
      <LeftIcon name="shield" size={21} color={H.moss} />
      <Text style={styles.homeSafetyLabel}>{t("Privacy and safety controls")}</Text><LeftIcon name="chevron-right" size={18} color={H.ink} />
    </Pressable>
  </View>;
}
const CONNECTION_INTENTS = [
  { label: 'Open to chat', icon: 'message-circle' },
  { label: 'Networking', icon: 'users' },
  { label: 'Group discussion', icon: 'users' },
  { label: 'Casual chat', icon: 'coffee' },
] as const;
function PeopleHereSection({ visible, available, onOpen }: { visible: boolean; available: boolean; onOpen: () => void }) {
  return <View style={styles.homeSection}>
    <SectionHeader title={t("People here")} onPress={onOpen} disabled={!visible} />
    <View style={styles.homePeopleCard}>
      {visible ? <>
        <View style={styles.homeIntentRow} accessibilityLabel={t("Connection interests, without availability counts")}>
          {CONNECTION_INTENTS.map((intent, index) => <View key={intent.label} style={styles.homeIntentItem}>
            <View style={[styles.homeIntentCircle, { backgroundColor: H.intentTints[index] }]} accessible={false}>
              <LeftIcon name={intent.icon} size={24} color={H.moss} />
            </View><Text style={styles.homeIntentLabel}>{t(intent.label)}</Text>
          </View>)}
        </View>
        {!available ? <Text style={styles.homePeopleNote}>{t("No discoverable people here yet. Check back in a moment.")}</Text> : null}
      </> : <>
        <View style={styles.homePrivatePeopleRow}><LeftIcon name="lock" size={22} color={H.moss} />
          <View style={styles.homeVisibilityCopy}>
            <Text style={styles.homePeopleTitle}>{t("Profiles are hidden while you're private")}</Text>
            <Text style={styles.homeBody}>{t("Go visible to discover people nearby.")}</Text>
          </View>
        </View>
      </>}
    </View>
  </View>;
}
function NearbyVenueCard({ venue, photo, activity, onPress }: {
  venue: RuntimeVenueCandidate; photo?: Photo | null; activity?: VenueActivityEnvelope; onPress: () => void;
}) {
  const formatVenueDistance = useDistanceFormatter();
  const activityLabel = homeActivityLabel(activity);
  const [loadedPhotoUri, setLoadedPhotoUri] = useState<string | null>(null);
  return <View style={styles.homeVenueCard}>
    <Pressable accessibilityRole="button" accessibilityLabel={t("View {venue}", { venue: venue.name })} onPress={onPress}
      style={({ pressed }) => pressed && styles.homePressed}>
      <View style={styles.homeVenueImage}><VenuePhoto photo={photo} venue={venue}
        onPhotoLoad={() => setLoadedPhotoUri(photo?.uri ?? null)} onPhotoError={() => setLoadedPhotoUri(null)} /></View>
      <View style={styles.homeVenueCopy}>
        <Text numberOfLines={2} style={styles.homeVenueTitle}>{venue.name}</Text>
        <Text style={styles.homeVenueMeta}>{t(venueCategory(venue))}</Text>
        {activityLabel ? <Text style={styles.homeActivity}>{t(activityLabel)}</Text> : null}
        {formatVenueDistance(venue.distanceMeters) ? <Text style={styles.homeVenueMeta}>{formatVenueDistance(venue.distanceMeters)}</Text> : null}
      </View>
    </Pressable>
    {photo && loadedPhotoUri === photo.uri ? <PhotoCredits photo={photo} /> : null}
  </View>;
}
function HostPlanCard({ onPress }: { onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={t("Host something small")} onPress={onPress}
    style={({ pressed }) => [styles.homeHostRow, pressed && styles.homePressed]}>
    <View style={styles.homeHostIcon} accessible={false}>
      <LeftIcon name="calendar" size={24} color={H.moss} /><View style={styles.homeHostPlus}><LeftIcon name="plus" size={13} color={H.moss} /></View>
    </View>
    <View style={styles.homeHostCopy}><Text style={styles.homePeopleTitle}>{t("Host something small")}</Text>
      <Text style={styles.homeBody}>{t("Suggest a place and plan. Left reviews it before it appears nearby.")}</Text></View>
    <LeftIcon name="arrow-up-right" size={20} color={H.moss} />
  </Pressable>;
}

export function HomeScreen(props: HomeProps) {
  const formatVenueDistance = useDistanceFormatter();
  const { fontScale } = useWindowDimensions();
  const { venue, nearbyVenues, venueActivityById, experiences, feed, onOpenAllVenues, onOpenVenueDetail } = props;
  const currentVenue = nearbyVenues.find(candidate => candidate.id === venue.venueId) ?? null;
  const confirmed = !!currentVenue && resolveVenueConfidence(venue, nearbyVenues) === 'confirmed';
  const nearby = nearbyVenues.filter(candidate => candidate.id !== currentVenue?.id);
  // Bound requests on Home; the existing venue details flow loads the remaining places on demand.
  const [photoLimit, setPhotoLimit] = useState(3);
  const photoVenues = [...(currentVenue ? [currentVenue] : []), ...nearby.slice(0, photoLimit)];
  const details = useHomePhotos(photoVenues);
  const currentDetails = currentVenue ? details[currentVenue.id] : null;
  const currentPhoto = currentDetails?.photo ?? currentVenue?.photo;
  const currentPhotoUri = currentPhoto?.uri ?? currentDetails?.photoUrl ?? currentVenue?.photoUrl;
  const [loadedHeroPhotoUri, setLoadedHeroPhotoUri] = useState<string | null>(null);
  const hasRealHeroPhoto = !!currentPhotoUri && loadedHeroPhotoUri === currentPhotoUri;
  const isVisible = props.sessionVisible && !props.venueHidden;
  const [mapsError, setMapsError] = useState(false);
  async function openMaps() {
    if (!currentVenue) return;
    setMapsError(false);
    const placeId = currentDetails?.placeId ?? currentVenue.placeId;
    const query = [currentVenue.name, currentDetails?.formattedAddress ?? currentVenue.formattedAddress].filter(Boolean).join(', ');
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}${placeId ? `&query_place_id=${encodeURIComponent(placeId)}` : ''}`;
    try { await Linking.openURL(url); } catch { setMapsError(true); }
  }
  return <View key={`home-type-${fontScale}`} style={styles.homePage}>
    <StatusBar style="light" />
    <View style={styles.homeHero}>
      <View style={styles.homeHeroVisual}>
        <VenuePhoto photo={currentPhoto} uri={currentDetails?.photoUrl ?? currentVenue?.photoUrl} venue={currentVenue} showFallbackLabel={false}
          onPhotoLoad={() => setLoadedHeroPhotoUri(currentPhotoUri ?? null)} onPhotoError={() => setLoadedHeroPhotoUri(null)} />
        <LinearGradient pointerEvents="none" colors={['rgba(23,24,18,0.05)', 'rgba(23,24,18,0.92)']}
          style={styles.homePhoto} />
        <View style={[styles.homeHeroCopy, { paddingTop: (props.topInset ?? 0) + 4 }]}>
          <View style={styles.homeHeroBadge}><LeftIcon name={confirmed ? "check-circle" : "map-pin"} size={13} color={H.lime} />
            <Text style={styles.homeHeroBadgeText}>{confirmed ? t("Confirmed venue") : props.guest ? t("Guest preview") : t("Find your place")}</Text></View>
          <Text style={styles.homeHeroTitle}>{currentVenue?.name ?? t('Your next little discovery')}</Text>
          <Text style={styles.homeHeroMeta}>{currentVenue ? t(venueCategory(currentVenue)) : t("Explore nearby places and confirm where you are.")}</Text>
          <View style={[styles.homeHeroBottomRow, fontScale > 1.3 && { flexDirection: 'column', alignItems: 'stretch' }]}>
            {currentVenue ? <View style={[styles.homeHeroLocation, fontScale > 1.3 && { flexBasis: 'auto', flexGrow: 0, flexShrink: 0, width: '100%' }]}>
              {formatVenueDistance(currentVenue.distanceMeters) ? <Text style={styles.homeHeroMeta}>{formatVenueDistance(currentVenue.distanceMeters)}</Text> : null}
              {(currentDetails?.formattedAddress ?? currentVenue.formattedAddress) ? <Text style={styles.homeHeroAddress}>{currentDetails?.formattedAddress ?? currentVenue.formattedAddress}</Text> : null}
            </View> : null}
          <Pressable accessibilityRole="button" onPress={currentVenue ? () => void openMaps() : onOpenAllVenues} style={styles.homeMaps}>
            <LeftIcon name={currentVenue ? "map-pin" : "search"} size={15} color="#FFFFFF" />
            <Text style={styles.homeMapsLabel}>{currentVenue ? t("Open in Maps") : t("Explore nearby places")}</Text><LeftIcon name="arrow-up-right" size={16} color="#FFFFFF" />
          </Pressable>
          </View>
          {hasRealHeroPhoto ? <PhotoCredits photo={currentPhoto} onDark />
            : <Text style={styles.homeHeroAddress}>{getVenuePhotoFallbackLabel(resolveVenuePhotoKind(currentVenue))}</Text>}
        </View>
      </View>
    </View>
    {mapsError ? <Text accessibilityRole="alert" style={styles.homeError}>{t("Maps could not open. Please try again.")}</Text> : null}
    <View style={styles.homeBodyContent}>
    <VisibilityCard guest={props.guest} visible={isVisible} confirmed={confirmed} pending={!!props.activationSubmitting || !!props.visibilityPending}
      error={props.visibilityError} onAction={isVisible ? props.onGoPrivate : props.onBecomeVisible} onOpenSafety={props.onOpenSafety} />
    <PeopleHereSection visible={isVisible} available={isVisible && feed.length > 0} onOpen={props.onOpenPeople} />
    <View style={styles.homeSection}>
      <SectionHeader title={t("Around you now")} onPress={onOpenAllVenues} />
      {nearby.length ? <FlatList horizontal data={nearby} keyExtractor={item => item.id}
        renderItem={({ item }) => <NearbyVenueCard venue={item} photo={details[item.id]?.photo ?? item.photo}
          activity={venueActivityById[item.id]} onPress={() => onOpenVenueDetail(item)} />}
        onEndReached={() => setPhotoLimit(limit => Math.min(limit + 3, nearby.length))}
        onEndReachedThreshold={1} showsHorizontalScrollIndicator={false} snapToInterval={136} decelerationRate="fast"
        initialNumToRender={3} maxToRenderPerBatch={3} windowSize={3}
        style={styles.homeCarousel} contentContainerStyle={styles.homeCarouselContent} />
        : <View style={styles.homeCard}>{props.nearbyLoading ? <ActivityIndicator color={H.moss} /> : null}
          <Text style={styles.homePeopleTitle}>{props.nearbyLoading ? t("Finding nearby places…") : t("A place to begin")}</Text>
          <Text style={styles.homeBody}>{props.guest ? t("Preview venue pages or sign in for location-based discovery.") : t("Explore nearby places to check location access and choose your current venue.")}</Text>
        </View>}
    </View>
    <View style={styles.homeSection}><SectionHeader title={t("Bring people together")} /><HostPlanCard onPress={props.onCreateExperience} /></View>
    {experiences.length ? <View style={styles.homeSection}><SectionHeader title={t("Something to join")} />
      {experiences.slice(0, 2).map(experience => <Pressable key={experience.id} accessibilityRole="button"
        onPress={() => props.onOpenExperience(experience)} style={styles.homeCard}>
        <Text style={styles.homePeopleTitle}>{experience.title}</Text><Text style={styles.homeSeeAllText}>{t("View gathering →")}</Text>
      </Pressable>)}
    </View> : null}
    </View>
  </View>;
}
