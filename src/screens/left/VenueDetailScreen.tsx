import { useState } from "react";
import { ActivityIndicator, Image, Linking, Pressable, Text, View } from "react-native";
import type { RuntimeVenueCandidate } from "../../features/location/location-storage";
import type { NearbyFeedItem, VenueActivityEnvelope, VenueContextSummary } from "../../types/left-domain";
import { resolveVenueActivityDisplay } from "../../features/activity/venue-activity-display";
import { T } from "../../app/leftTheme";
import { PrimaryButton } from "../../components/buttons";
import { LeftIcon } from "../../components/icons";
import { GlassSurface, glassRadii } from "../../components/glass";
import { BackNavButton } from "../../components/left/navigation";
import { venueDetailStyles as styles } from "../../components/styles/features/venue-detail";

const VENUE_ILLUSTRATIONS = {
  cafe: require("../../../output/illustrations/venues/cafe.png"),
  restaurant: require("../../../output/illustrations/venues/restaurant.png"),
  bar: require("../../../output/illustrations/venues/bar.png"),
  coworking: require("../../../output/illustrations/venues/coworking.png"),
  market: require("../../../output/illustrations/venues/market.png"),
  park: require("../../../output/illustrations/venues/park.png"),
  library: require("../../../output/illustrations/venues/library.png"),
  generic: require("../../../output/illustrations/venues/generic-place.png"),
} as const;

export function VenueDetailScreen({
  venue,
  venueSummary,
  venueActivity,
  feed,
  sessionVisible,
  detailsLoading,
  saved,
  saving,
  onBack,
  onPrimaryAction,
  onToggleSaved,
}: {
  venue: RuntimeVenueCandidate;
  venueSummary: VenueContextSummary;
  venueActivity: VenueActivityEnvelope | null;
  feed: NearbyFeedItem[];
  sessionVisible: boolean;
  detailsLoading: boolean;
  saved: boolean;
  saving: boolean;
  onBack: () => void;
  onPrimaryAction: () => void;
  onToggleSaved: () => void;
}) {
  const isCurrentVenue = venue.id === venueSummary.venueId || venue.name === venueSummary.venueName;
  const venueType = venue.venueType ?? inferVenueTypeFromName(venue.name);
  const imageSource = getVenueIllustrationSource(venue.name, venueType);
  const photoUri = venue.photo?.uri ?? null;
  const [loadedPhotoUri, setLoadedPhotoUri] = useState<string | null>(null);
  const [failedPhotoUri, setFailedPhotoUri] = useState<string | null>(null);
  const showPhoto = !!photoUri && failedPhotoUri !== photoUri;
  const photoLoaded = showPhoto && loadedPhotoUri === photoUri;
  const currentFeed = isCurrentVenue ? feed : [];
  const visibleCount = venueActivity?.leftPresence.visible ?? (isCurrentVenue ? currentFeed.length : null);
  const openToMeetCount = venueActivity?.leftPresence.openToMeet ?? (isCurrentVenue
    ? currentFeed.filter((item) => item.intent === "networking" || item.intent === "open_to_conversation").length
    : null);
  const forecastCount = venueActivity?.activity.forecastScore ?? null;
  const activityDisplay = resolveVenueActivityDisplay(venueActivity);
  const activityTone = getActivityTone(activityDisplay.tone);
  const activityState = { ...activityDisplay, ...activityTone };
  const pulseBars = activityState.score == null
    ? Array.from({ length: 5 }, () => false)
    : getPulseBarsForScore(activityState.score);
  const subline = formatVenueSubline(venue, isCurrentVenue, venueType);
  const statusLabel = formatDistanceLabel(venue.distanceMeters) ?? "Nearby venue";
  const primaryLabel = isCurrentVenue && sessionVisible
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
      title: `${venue.rating.toFixed(1)} rating`,
      text: venue.userRatingCount ? `Based on ${venue.userRatingCount.toLocaleString()} Google ratings` : "Google rating",
    } : null,
    accessibilitySummary ? { icon: "heart" as const, title: "Accessibility", text: accessibilitySummary } : null,
  ].filter((fact): fact is NonNullable<typeof fact> => !!fact);

  return (
    <View style={styles.page}>
      <View style={styles.hero}>
        <Image source={imageSource} style={styles.heroImage} resizeMode="cover" accessible={false} />
        {showPhoto ? (
          <Image
            key={`${venue.id}-${photoUri}`}
            source={{ uri: photoUri! }}
            style={styles.googlePhoto}
            resizeMode="cover"
            accessibilityLabel={`Photo of ${venue.name}`}
            onLoad={() => setLoadedPhotoUri(photoUri)}
            onError={() => setFailedPhotoUri(photoUri)}
          />
        ) : null}
        {showPhoto && !photoLoaded ? (
          <View style={styles.photoLoading} accessibilityLabel="Loading venue photo">
            <ActivityIndicator size="small" color={T.primary} />
          </View>
        ) : null}
        <View style={styles.heroBackButton}>
          <BackNavButton label="" onPress={onBack} />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={saved ? "Remove from saved places" : "Save this place"}
          accessibilityState={{ selected: saved, busy: saving, disabled: saving }}
          disabled={saving}
          onPress={onToggleSaved}
          style={({ pressed }) => [styles.heroSaveButton, saved && styles.heroSaveButtonActive, pressed && styles.detailPressed]}
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

      {photoLoaded ? (
        <View style={styles.photoAttribution}>
          <Text numberOfLines={1} style={styles.photoAttributionText}>Google Maps</Text>
          {venue.photo?.attributions.map((author, index) => (
            author.uri ? (
              <Pressable
                key={`${author.displayName}-${index}`}
                accessibilityRole="link"
                accessibilityLabel={`Photo by ${author.displayName}`}
                onPress={() => void Linking.openURL(author.uri!).catch(() => {})}
                style={styles.photoAttributionLink}
              >
                <Text style={styles.photoAttributionText}>· {author.displayName}</Text>
              </Pressable>
            ) : <Text key={`${author.displayName}-${index}`} style={styles.photoAttributionText}>· {author.displayName}</Text>
          ))}
        </View>
      ) : null}

      <View style={styles.content}>
        <View style={styles.identityBlock}>
          <Text style={styles.title}>{venue.name}</Text>
          <Text style={styles.subtitle}>{subline}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.venuePracticalHeading}>
            <Text style={styles.sectionTitle}>Good to know</Text>
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
                    <Text style={styles.venuePracticalTitle}>{fact.title}</Text>
                    <Text style={styles.venuePracticalText}>{fact.text}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : detailsLoading ? null : (
            <Text style={styles.venuePracticalUnavailable}>Practical details have not been published for this venue yet.</Text>
          )}
          {venue.websiteUri || venue.phoneNumber ? (
            <View style={styles.venuePracticalActions}>
              {venue.websiteUri ? (
                <Pressable accessibilityRole="link" accessibilityLabel="Open venue website" onPress={() => void Linking.openURL(venue.websiteUri!)} style={({ pressed }) => [styles.venuePracticalAction, pressed && styles.detailPressed]}>
                  <LeftIcon name="external-link" size={15} color={T.primary} />
                  <Text style={styles.venuePracticalActionText}>Website</Text>
                </Pressable>
              ) : null}
              {venue.phoneNumber ? (
                <Pressable accessibilityRole="button" accessibilityLabel="Call venue" onPress={() => void Linking.openURL(`tel:${venue.phoneNumber}`)} style={({ pressed }) => [styles.venuePracticalAction, pressed && styles.detailPressed]}>
                  <LeftIcon name="phone" size={15} color={T.primary} />
                  <Text style={styles.venuePracticalActionText}>Call</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Live pulse</Text>
          <View style={styles.pulseCard}>
            <View style={[styles.pulseIconWrap, { backgroundColor: activityState.softColor }]}>
              <LeftIcon name="activity" size={21} color={activityState.color} />
            </View>
            <View style={styles.pulseCopy}>
              <Text style={[styles.pulseTitle, { color: activityState.color }]}>{activityState.title}</Text>
              <Text style={styles.pulseSubtitle}>{activityState.subtitle}</Text>
            </View>
            <View
              accessible
              accessibilityLabel={activityState.score == null
                ? "Activity score unavailable"
                : `Activity score ${activityState.score} out of 100`}
              style={styles.pulseBars}
            >
              {pulseBars.map((active, index) => (
                <View
                  key={`pulse-${index}`}
                  style={[
                    styles.pulseBar,
                    getSignalBarHeightStyle(index),
                    active
                      ? { backgroundColor: activityState.color, borderColor: activityState.color }
                      : styles.pulseBarInactive,
                  ]}
                />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.peopleHeading}>
            <Text style={styles.sectionTitle}>People on Left</Text>
            <Text style={styles.peopleSubtitle}>
              {visibleCount == null ? "Live presence is not available yet" : "Visible at this venue now"}
            </Text>
          </View>
          <View style={styles.peopleCard}>
            <View style={styles.peopleMetric}>
              <Text style={styles.peopleMetricValue}>{visibleCount ?? "—"}</Text>
              <Text style={styles.peopleMetricLabel}>Visible now</Text>
            </View>
            <View style={styles.peopleMetricDivider} />
            <View style={styles.peopleMetric}>
              <Text style={styles.peopleMetricValue}>{openToMeetCount ?? "—"}</Text>
              <Text style={styles.peopleMetricLabel}>Open to meet</Text>
            </View>
            {forecastCount != null ? (
              <>
                <View style={styles.peopleMetricDivider} />
                <View style={styles.peopleMetric}>
                  <Text style={styles.peopleMetricValue}>{forecastCount}</Text>
                  <Text style={styles.peopleMetricLabel}>Typical score</Text>
                </View>
              </>
            ) : null}
          </View>
        </View>

        <View style={styles.privacyRow}>
          <View style={styles.privacyIconWrap}>
            <LeftIcon name="lock" size={17} color={T.primary} />
          </View>
          <View style={styles.privacyCopy}>
            <Text style={styles.privacyTitle}>Your precise location stays private</Text>
            <Text style={styles.privacyText}>Only your first name, venue, intent, and vibe are shown while visible.</Text>
          </View>
        </View>

        <PrimaryButton
          label={primaryLabel}
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

function getVenueIllustrationSource(
  venueName: string,
  venueType: RuntimeVenueCandidate["venueType"] | undefined,
) {
  const resolvedVenueType = venueType ?? inferVenueTypeFromName(venueName);
  if (resolvedVenueType === "cafe") return VENUE_ILLUSTRATIONS.cafe;
  if (resolvedVenueType === "coworking_space") return VENUE_ILLUSTRATIONS.coworking;
  if (resolvedVenueType === "library" || resolvedVenueType === "university") return VENUE_ILLUSTRATIONS.library;
  const normalized = venueName.toLowerCase();
  if (/restaurant|grill|steak|bistro|kitchen|diner|pizza|sushi|brasserie|eatery/.test(normalized)) return VENUE_ILLUSTRATIONS.restaurant;
  if (/bar|pub|tap|cocktail|wine|brew|club|lounge/.test(normalized)) return VENUE_ILLUSTRATIONS.bar;
  if (/market|hall|grocery|bazaar/.test(normalized)) return VENUE_ILLUSTRATIONS.market;
  if (/park|garden|green|square/.test(normalized)) return VENUE_ILLUSTRATIONS.park;
  return VENUE_ILLUSTRATIONS.generic;
}

function inferVenueTypeFromName(venueName: string) {
  const normalized = venueName.toLowerCase();
  if (/cafe|coffee|espresso|roastery/.test(normalized)) return "cafe" as const;
  if (/library|books|reading|oodi/.test(normalized)) return "library" as const;
  if (/cowork|co-working|workspace|office|studio|hub/.test(normalized)) return "coworking_space" as const;
  if (/university|campus|college/.test(normalized)) return "university" as const;
  return "other" as const;
}

function formatDistanceLabel(distanceMeters: number | null) {
  if (distanceMeters == null || distanceMeters <= 0) return null;
  if (distanceMeters < 1000) return `${Math.round(distanceMeters)} m away`;
  return `${Math.max(1, Math.round(distanceMeters / 80))} min walk`;
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
    .map(([key]) => labels[key])
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

function getPulseBarsForScore(score: number) {
  const activeCount = score <= 20 ? 1 : score <= 40 ? 2 : score <= 60 ? 3 : score <= 80 ? 4 : 5;
  return Array.from({ length: 5 }, (_, index) => index < activeCount);
}

function getSignalBarHeightStyle(index: number) {
  const heights = [12, 17, 22, 27, 32];
  return { height: heights[index] ?? heights[heights.length - 1] };
}
