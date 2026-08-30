import type { VenueActivityEnvelope } from "./activity-types";

export type VenueActivityDisplay = {
  title: string;
  subtitle: string;
  score: number | null;
  tone: "muted" | "calm" | "active" | "busy";
};

export function resolveVenueActivityDisplay(
  venueActivity: VenueActivityEnvelope | null,
): VenueActivityDisplay {
  if (!venueActivity?.activity) {
    return {
      title: "No live activity yet",
      subtitle: "Activity will appear when verified signals are available.",
      score: null,
      tone: "muted",
    };
  }

  const score = venueActivity.activity.score ?? venueActivity.activity.forecastScore;
  return {
    title: venueActivity.activity.displayText,
    subtitle: venueActivity.activity.liveAvailable
      ? venueActivity.activity.comparisonText
      : venueActivity.activity.forecastScore != null
        ? "Based on typical activity"
        : "Live activity is unavailable",
    score,
    tone: score == null ? "muted" : score >= 75 ? "busy" : score >= 45 ? "active" : "calm",
  };
}