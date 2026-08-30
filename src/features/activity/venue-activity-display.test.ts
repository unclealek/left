import { describe, expect, it } from "vitest";
import type { VenueActivityEnvelope } from "./activity-types";
import { resolveVenueActivityDisplay } from "./venue-activity-display";

describe("resolveVenueActivityDisplay", () => {
  it("does not invent a score when verified activity is unavailable", () => {
    expect(resolveVenueActivityDisplay(null)).toEqual({
      title: "No live activity yet",
      subtitle: "Activity will appear when verified signals are available.",
      score: null,
      tone: "muted",
    });
  });

  it("labels forecast-only data as typical rather than live", () => {
    const activity = {
      venueId: "venue-1",
      googlePlaceId: null,
      name: "Test venue",
      activity: {
        label: "active",
        displayText: "Usually active",
        score: null,
        forecastScore: 62,
        liveAvailable: false,
        comparison: "as_expected",
        comparisonText: "As expected",
        updatedAt: null,
        isStale: false,
        refreshing: false,
        source: "besttime",
      },
      leftPresence: { total: 0, visible: 0, openToMeet: 0 },
    } satisfies VenueActivityEnvelope;

    expect(resolveVenueActivityDisplay(activity)).toMatchObject({
      subtitle: "Based on typical activity",
      score: 62,
      tone: "active",
    });
  });
});