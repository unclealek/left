// @ts-nocheck

import { pickForecastScore } from "./activity-normalizer.ts";

type BestTimeInitializeInput = {
  besttimeVenueId?: string | null;
  googlePlaceId?: string | null;
  venueName: string;
  venueAddress?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  timezone?: string | null;
};

type BestTimeInitializeResult =
  | {
      status: "available";
      besttimeVenueId: string;
      timezone: string | null;
      rawForecast: Record<string, unknown>;
      forecastScore: number | null;
      fetchedAt: string;
      expiresAt: string;
    }
  | {
      status: "unavailable";
      reason: string;
      expiresAt: string;
    }
  | {
      status: "unconfigured";
      reason: string;
    }
  | {
      status: "failed";
      reason: string;
      retryAfterSeconds: number;
    };

export function createBestTimeClient(env: Record<string, string | undefined>) {
  return {
    async initializeVenue(input: BestTimeInitializeInput): Promise<BestTimeInitializeResult> {
      const mode = env.BESTTIME_PROVIDER_MODE ?? "unconfigured";

      if (mode === "mock") {
        return mockInitializeVenue(input, env);
      }

      return {
        status: "unconfigured",
        reason: "BestTime adapter not configured. Add the current endpoint and auth format before enabling provider calls.",
      };
    },
  };
}

function mockInitializeVenue(
  input: BestTimeInitializeInput,
  env: Record<string, string | undefined>,
): BestTimeInitializeResult {
  const now = new Date();
  const fetchedAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString();
  const fixture = parseFixture(env.BESTTIME_MOCK_FORECAST_JSON);
  const timezone = input.timezone ?? env.BESTTIME_MOCK_TIMEZONE ?? "Europe/Helsinki";
  const rawForecast = fixture ?? buildFallbackForecast(input.venueName);

  return {
    status: "available",
    besttimeVenueId:
      input.besttimeVenueId ??
      `${input.googlePlaceId ?? "mock"}:${slugify(input.venueName)}`,
    timezone,
    rawForecast,
    forecastScore: pickForecastScore(rawForecast, timezone),
    fetchedAt,
    expiresAt,
  };
}

function parseFixture(rawValue?: string) {
  if (!rawValue) return null;
  try {
    const parsed = JSON.parse(rawValue);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function buildFallbackForecast(seedValue: string) {
  const seed = seedValue.split("").reduce((total, char) => total + char.charCodeAt(0), 11);
  const forecast = [];
  for (let dayOfWeek = 0; dayOfWeek <= 6; dayOfWeek += 1) {
    for (let hour = 6; hour <= 29; hour += 1) {
      const normalizedHour = hour >= 24 ? hour - 24 : hour;
      const middayLift = normalizedHour >= 11 && normalizedHour <= 14 ? 18 : 0;
      const eveningLift = normalizedHour >= 17 && normalizedHour <= 22 ? 28 : 0;
      const weekendLift = dayOfWeek === 5 || dayOfWeek === 6 ? 8 : 0;
      const base = 16 + ((seed + dayOfWeek * 13 + hour * 7) % 34);
      forecast.push({
        dayOfWeek,
        hour,
        score: Math.min(100, base + middayLift + eveningLift + weekendLift),
      });
    }
  }
  return { forecast };
}

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
