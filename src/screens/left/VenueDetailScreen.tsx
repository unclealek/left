import { t, getTranslationLocale } from "../../features/preferences/translation-runtime";
import { useDistanceFormatter } from "../../features/preferences/use-distance";
import { getVenuePhotoFallbackLabel, resolveVenuePhotoKind } from "../../components/left/venue-photo-model";
import { VenuePhoto, PhotoCredits } from "../../components/left/VenuePhoto";
import { VISIBILITY_DISCLOSURE } from "../../features/presence/visibility-copy";
import { PopularTimesChart } from "../../components/left/PopularTimesChart";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ActivityIndicator, Linking, Pressable, Text, View } from "react-native";
import type { RuntimeVenueCandidate } from "../../features/location/location-storage";
import type { VenueActivityEnvelope, VenueContextSummary } from "../../types/left-domain";
import { usePopularTimes } from "../../features/activity/use-popular-times";
import { googleMapsPlaceUrl, popularTimesActivity } from "../../features/activity/popular-times-model";
import { resolveVenueActivityDisplay } from "../../features/activity/venue-activity-display";
import { T } from "../../app/leftTheme";
import { PrimaryButton } from "../../components/buttons";
import { LeftIcon } from "../../components/icons";
import { GlassSurface, glassRadii } from "../../components/glass";
import { BackNavButton } from "../../components/left/navigation";
import { venueDetailStyles as styles } from "../../components/styles/features/venue-detail";

export function VenueDetailScreen({
  guest = false,
  venue,
  venueSummary,
  venueActivity,
  sessionVisible,
  detailsLoading,
  saved,
  saving,
  onBack,
  onPrimaryAction,
  onToggleSaved,
}: {
  guest?: boolean;
  venue: RuntimeVenueCandidate;
  venueSummary: VenueContextSummary;
  venueActivity: VenueActivityEnvelope | null;
  sessionVisible: boolean;
  detailsLoading: boolean;
  saved: boolean;
  saving: boolean;
  onBack: () => void;
  onPrimaryAction: () => void;
  onToggleSaved: () => void;
}) {
  const insets = useSafeAreaInsets();
  const isCurrentVenue = venue.id === venueSummary.venueId || venue.name === venueSummary.venueName;
  const venueType = venue.venueType ?? inferVenueTypeFromName(venue.name);
  const photoUri = venue.photo?.uri ?? venue.photoUrl ?? null;
  const isGooglePhoto = !!venue.photo?.uri;
  const [loadedPhotoUri, setLoadedPhotoUri] = useState<string | null>(null);
  const photoLoaded = !!photoUri && loadedPhotoUri === photoUri;
  const roomVibes = isCurrentVenue ? venueSummary.activeVibes.slice(0, 4) : [];
  const popularTimes = usePopularTimes(venue.placeId, venue.placeId ? googleMapsPlaceUrl(venue.placeId) : null);
  const popularActivity = popularTimesActivity(popularTimes.data, venue.timezone);
  if (popularTimes.status !== "pending" && !popularTimes.data) {
    popularActivity.refreshing = false;
    popularActivity.displayText = popularTimes.status === "failed" ? "Popular times temporarily unavailable" : "Popular times unavailable";
  }
  const activityDisplay = resolveVenueActivityDisplay({
    venueId: venue.id, googlePlaceId: venue.placeId ?? null, name: venue.name,
    activity: popularActivity, leftPresence: venueActivity?.leftPresence ?? {total:0,visible:0,openToMeet:0},
  });
  const activityTone = getActivityTone(activityDisplay.tone);
  const activityState = { ...activityDisplay, ...activityTone };
  const subline = formatVenueSubline(venue, isCurrentVenue, venueType);
  const formatDistanceLabel = useDistanceFormatter();
  const statusLabel = guest ? "Venue preview" : formatDistanceLabel(venue.distanceMeters) ?? "Nearby venue";
  const primaryLabel = guest ? "Sign in to take part" : isCurrentVenue && sessionVisible
    ? "See people here"
    : !sessionVisible
      ? "Go visible here"
      : "Use this venue";
  const todayHours = getTodayHours(venue.openingHours?.weekdayDescriptions ?? []);
  const accessibilitySummary = formatAccessibility(venue.accessibilityOptions);
  const practicalFacts = [
    venue.formattedAddress ? { icon: "map-pin" as const, title: "Address", text: venue.formattedAddress } : null,
    venue.openingHours ? {
      icon: "clock" as const,
      title: venue.openingHours.openNow === true ? "Open now" : venue.openingHours.openNow === false ? "Closed now" : "Opening hours",
      text: todayHours ?? "Hours are available from the venue.",
    } : null,
    venue.rating != null ? {
      icon: "star" as const,
      title: t("{rating} rating", { rating: new Intl.NumberFormat(getTranslationLocale(), { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(venue.rating) }),
      text: venue.userRatingCount ? t("Based on {count} Google ratings", { count: venue.userRatingCount.toLocaleString(getTranslationLocale()) }) : "Google rating",
    } : null,
    accessibilitySummary ? { icon: "heart" as const, title: "Accessibility", text: accessibilitySummary } : null,
  ].filter((fact): fact is NonNullable<typeof fact> => !!fact);

  return (
    <View style={styles.page}>
      <View style={[styles.hero, { height: 252 + insets.top }]}>
        <VenuePhoto venue={venue} photo={venue.photo} uri={venue.photoUrl} showFallbackLabel={false}
          onPhotoLoad={() => setLoadedPhotoUri(photoUri)} onPhotoError={() => setLoadedPhotoUri(null)} />
        <View style={[styles.heroBackButton, { top: insets.top + 12 }]}>
          <BackNavButton label="" onPress={onBack} />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={guest ? t("Sign in to save places") : saved ? t("Remove from saved places") : t("Save this place")}
          accessibilityState={{ selected: saved, busy: saving, disabled: saving }}
          disabled={saving}
          onPress={onToggleSaved}
          style={({ pressed }) => [styles.heroSaveButton, { top: insets.top + 12 }, saved && styles.heroSaveButtonActive, pressed && styles.detailPressed]}
        >
          {saving ? <ActivityIndicator size="small" color={saved ? T.actionContent : T.primary} /> : <LeftIcon name={saved ? "check" : "bookmark"} size={19} color={saved ? T.actionContent : T.textPrimary} />}
        </Pressable>
        <GlassSurface
          variant="soft"
          radius={glassRadii.pill}
          style={styles.heroStatusGlass}
          contentStyle={styles.heroStatusPill}
        >
          <LeftIcon name="map-pin" size={15} color={T.textPrimary} />
          <Text style={styles.heroStatusText}>{statusLabel}</Text>
        </GlassSurface>
      </View>

      {photoLoaded && isGooglePhoto ? <PhotoCredits photo={venue.photo} />
        : !photoLoaded ? <Text style={styles.photoFallbackCaption}>{getVenuePhotoFallbackLabel(resolveVenuePhotoKind(venue))}</Text> : null}

      <View style={styles.content}>
        <View style={styles.identityBlock}>
          <Text style={styles.title}>{venue.name}</Text>
          <Text style={styles.subtitle}>{subline}</Text>
          {venue.communityAddedByName ? (
            <Text style={styles.subtitle}>{t("Added by:")}{" "}{venue.communityAddedByName}</Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <View style={styles.venuePracticalHeading}>
            <Text style={styles.sectionTitle}>{t("Good to know")}</Text>
            {detailsLoading ? <ActivityIndicator size="small" color={T.primary} /> : null}
          </View>
          {practicalFacts.length > 0 ? (
            <View style={styles.venuePracticalCard}>
              {practicalFacts.map((fact, index) => (
                <View key={`${fact.title}-${index}`} style={[styles.venuePracticalRow, index === practicalFacts.length - 1 && styles.venuePracticalRowLast]}>
                  <View style={styles.venuePracticalIcon}>
                    <LeftIcon name={fact.icon} size={16} color={T.primary} />
                  </View>
                  <View style={styles.venuePracticalCopy}>
                    <Text style={styles.venuePracticalTitle}>{t(fact.title)}</Text>
                    <Text style={styles.venuePracticalText}>{fact.text}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : detailsLoading ? null : (
            <Text style={styles.venuePracticalUnavailable}>{t("Practical details have not been published for this venue yet.")}</Text>
          )}
          {venue.websiteUri || venue.phoneNumber ? (
            <View style={styles.venuePracticalActions}>
              {venue.websiteUri ? (
                <Pressable accessibilityRole="link" accessibilityLabel={t("Open venue website")} onPress={() => void Linking.openURL(venue.websiteUri!)} style={({ pressed }) => [styles.venuePracticalAction, pressed && styles.detailPressed]}>
                  <LeftIcon name="external-link" size={15} color={T.primary} />
                  <Text style={styles.venuePracticalActionText}>{t("Website")}</Text>
                </Pressable>
              ) : null}
              {venue.phoneNumber ? (
                <Pressable accessibilityRole="button" accessibilityLabel={t("Call venue")} onPress={() => void Linking.openURL(`tel:${venue.phoneNumber}`)} style={({ pressed }) => [styles.venuePracticalAction, pressed && styles.detailPressed]}>
                  <LeftIcon name="phone" size={15} color={T.primary} />
                  <Text style={styles.venuePracticalActionText}>{t("Call")}</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
          {venue.communityNotes ? (
            <Text style={styles.venuePracticalUnavailable}>{venue.communityNotes}</Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("Popular times")}</Text>
          {popularTimes.status === "ready" && popularTimes.hasData && !popularActivity.isStale && popularTimes.data?.popular_times ? (
            <View style={styles.popularTimesCard}>
              <PopularTimesChart key={venue.placeId ?? venue.id} data={popularTimes.data.popular_times} timezone={venue.timezone} />
              {popularTimes.data.typical_time_spent ? <Text style={styles.pulseSubtitle}>{popularTimes.data.typical_time_spent}</Text> : null}
            </View>
          ) : (
            <View style={styles.pulseCard}>
              {popularTimes.status === "pending" ? <ActivityIndicator accessibilityLabel={t("Loading popular times")} color={T.textMuted} /> : null}
              <View style={[styles.pulseIconWrap, { backgroundColor: activityState.softColor }]}>
                <LeftIcon name="activity" size={21} color={activityState.color} />
              </View>
              <View style={styles.pulseCopy}>
                <Text style={[styles.pulseTitle, { color: activityState.color }]}>{t(activityState.title)}</Text>
                <Text style={styles.pulseSubtitle}>{t(activityState.subtitle)}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.peopleHeading}>
            <Text style={styles.sectionTitle}>{t("Social signals")}</Text>
            <Text style={styles.peopleSubtitle}>{t("Aggregated from people who are visible here")}</Text>
          </View>
          <View style={styles.peopleCard}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {(roomVibes.length ? roomVibes : ["No shared vibes yet"]).map((vibe) => (
                <View key={vibe} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: T.venueAccentSoft }}>
                  <Text style={{ color: T.primary, fontWeight: "600" }}>{vibe}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.privacyRow}>
          <View style={styles.privacyIconWrap}>
            <LeftIcon name="lock" size={17} color={T.primary} />
          </View>
          <View style={styles.privacyCopy}>
            <Text style={styles.privacyTitle}>{t("What people here can see")}</Text>
            <Text style={styles.privacyText}>{t(VISIBILITY_DISCLOSURE)}</Text>
          </View>
        </View>

        <PrimaryButton
          label={t(primaryLabel)}
          onPress={onPrimaryAction}
        />
      </View>
    </View>
  );
}

function getActivityTone(tone: "muted" | "calm" | "active" | "busy") {
  if (tone === "busy") return { color: T.visibilityOff, softColor: T.visibilityOffSoft };
  if (tone === "active") return { color: T.visibilityOn, softColor: T.visibilityOnSoft };
  if (tone === "calm") return { color: T.venueAccent, softColor: T.venueAccentSoft };
  return { color: T.textSecondary, softColor: T.surfaceMid };
}

function formatVenueSubline(
  venue: RuntimeVenueCandidate,
  isCurrentVenue: boolean,
  venueType: RuntimeVenueCandidate["venueType"],
) {
  const venueLabel = formatVenueTypeLabel(venueType, venue.name);
  return isCurrentVenue ? `${venueLabel} · current venue` : venueLabel;
}

function inferVenueTypeFromName(venueName: string) {
  const normalized = venueName.toLowerCase();
  if (/cafe|coffee|espresso|roastery/.test(normalized)) return "cafe" as const;
  if (/library|books|reading|oodi/.test(normalized)) return "library" as const;
  if (/cowork|co-working|workspace|office|studio|hub/.test(normalized)) return "coworking_space" as const;
  if (/university|campus|college/.test(normalized)) return "university" as const;
  return "other" as const;
}


function getTodayHours(descriptions: string[]) {
  if (!descriptions.length) return null;
  const dayIndex = new Date().getDay();
  const mondayFirstIndex = dayIndex === 0 ? 6 : dayIndex - 1;
  return descriptions[mondayFirstIndex] ?? descriptions[0] ?? null;
}

function formatAccessibility(options: RuntimeVenueCandidate["accessibilityOptions"]) {
  if (!options) return null;
  const labels: Record<string, string> = {
    wheelchairAccessibleEntrance: "wheelchair-accessible entrance",
    wheelchairAccessibleParking: "wheelchair-accessible parking",
    wheelchairAccessibleRestroom: "wheelchair-accessible restroom",
    wheelchairAccessibleSeating: "wheelchair-accessible seating",
  };
  const available = Object.entries(options)
    .filter(([, enabled]) => enabled === true)
    .map(([key]) => t(labels[key] ?? ""))
    .filter((label): label is string => !!label);
  if (!available.length) return null;
  return `${available.slice(0, 3).join(", ")}.`;
}

function formatVenueTypeLabel(venueType: RuntimeVenueCandidate["venueType"], venueName: string) {
  if (venueType === "library") return "Library";
  if (venueType === "coworking_space") return "Coworking";
  if (venueType === "university") return "Campus";
  if (venueType === "cafe") return "Cafe";
  if (/restaurant|bistro|grill|kitchen|pizza|sushi/i.test(venueName)) return "Restaurant";
  if (/bar|pub|cocktail|brewery/i.test(venueName)) return "Bar";
  if (/market|bazaar/i.test(venueName)) return "Market";
  if (/park|garden/i.test(venueName)) return "Park";
  return "Venue";
}
