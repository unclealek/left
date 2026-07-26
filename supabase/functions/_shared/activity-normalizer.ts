// @ts-nocheck

import { getVenueLocalSlot } from "./timezone.ts";

export type ActivityLabel =
  | "quiet"
  | "light"
  | "active"
  | "busy"
  | "packed"
  | "unknown"
  | "closed";

export type ActivityComparison =
  | "quieter_than_usual"
  | "as_expected"
  | "busier_than_usual"
  | "unknown";

export function activityLabel(score: number | null): ActivityLabel {
  if (score === null || score === undefined) return "unknown";
  if (score <= 20) return "quiet";
  if (score <= 40) return "light";
  if (score <= 60) return "active";
  if (score <= 80) return "busy";
  return "packed";
}

export function compareActivity(
  liveScore: number | null,
  forecastScore: number | null,
): ActivityComparison {
  if (liveScore === null || forecastScore === null) return "unknown";
  const difference = liveScore - forecastScore;
  if (difference >= 10) return "busier_than_usual";
  if (difference <= -10) return "quieter_than_usual";
  return "as_expected";
}

export function comparisonText(value: ActivityComparison) {
  switch (value) {
    case "busier_than_usual":
      return "Busier than usual";
    case "quieter_than_usual":
      return "Quieter than usual";
    case "as_expected":
      return "As expected";
    default:
      return "Activity unavailable";
  }
}

export function displayText(label: ActivityLabel, liveAvailable: boolean) {
  if (label === "unknown") return "Activity unavailable";
  if (label === "closed") return "Closed";
  const prefix = liveAvailable ? "" : "Usually ";
  switch (label) {
    case "quiet":
      return `${prefix}quiet now`;
    case "light":
      return `${prefix}light now`;
    case "active":
      return `${prefix}active now`;
    case "busy":
      return `${prefix}busy now`;
    case "packed":
      return `${prefix}packed now`;
    default:
      return "Activity unavailable";
  }
}

export function pickForecastScore(rawForecast: unknown, timezone?: string | null) {
  if (!rawForecast || typeof rawForecast !== "object") return null;
  const { dayOfWeek, hour } = getVenueLocalSlot(timezone);
  const record = findForecastRecord(rawForecast, dayOfWeek, hour);
  return typeof record?.score === "number" ? clampScore(record.score) : null;
}

function findForecastRecord(rawForecast: any, dayOfWeek: number, hour: number) {
  const candidates = [
    rawForecast?.forecast,
    rawForecast?.weekly_forecast,
    rawForecast?.analysis?.forecast,
    rawForecast?.analysis?.weekly_forecast,
    rawForecast?.data?.forecast,
  ].find((value) => Array.isArray(value));

  if (!Array.isArray(candidates)) return null;

  return candidates.find((entry) => {
    if (!entry || typeof entry !== "object") return false;
    const candidateDay = normalizeDay(entry.dayOfWeek ?? entry.day_of_week ?? entry.day ?? entry.weekday);
    const candidateHour = normalizeHour(entry.hour ?? entry.hourOfDay ?? entry.hour_of_day);
    return candidateDay === dayOfWeek && candidateHour === hour;
  }) ?? null;
}

function normalizeDay(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const lowered = value.slice(0, 3).toLowerCase();
    const map: Record<string, number> = {
      sun: 0,
      mon: 1,
      tue: 2,
      wed: 3,
      thu: 4,
      fri: 5,
      sat: 6,
    };
    return map[lowered] ?? null;
  }
  return null;
}

function normalizeHour(value: unknown) {
  if (typeof value !== "number") return null;
  return value < 6 ? value + 24 : value;
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function normalizeActivityEnvelope(input: {
  venueId: string;
  besttimeStatus: string | null | undefined;
  timezone?: string | null;
  cache?: any;
  leftPresence: {
    total: number;
    visible: number;
    openToMeet: number;
  };
}) {
  const liveScore = input.cache?.live_available ? input.cache?.live_score ?? null : null;
  const forecastScore =
    input.cache?.forecast_score ??
    pickForecastScore(input.cache?.raw_forecast, input.timezone);
  const liveAvailable = !!input.cache?.live_available && typeof liveScore === "number";
  const score = liveAvailable ? liveScore : forecastScore;
  const comparison =
    input.cache?.comparison ?? compareActivity(liveScore, forecastScore);
  const label = activityLabel(score);
  const source = input.besttimeStatus === "available" ? "besttime" : "left";

  return {
    venueId: input.venueId,
    activity: {
      label,
      displayText: displayText(label, liveAvailable),
      score,
      forecastScore,
      liveAvailable,
      comparison,
      comparisonText: comparisonText(comparison),
      updatedAt: input.cache?.live_fetched_at ?? input.cache?.forecast_fetched_at ?? null,
      isStale:
        !!input.cache?.forecast_expires_at &&
        new Date(input.cache.forecast_expires_at).getTime() <= Date.now(),
      refreshing: input.cache?.refresh_status === "refreshing",
      source,
    },
    leftPresence: input.leftPresence,
  };
}
