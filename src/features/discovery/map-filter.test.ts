import { describe, expect, it } from "vitest";
import type { VenueActivityEnvelope } from "../../types/left-domain";
import type { RuntimeVenueCandidate } from "../location/location-storage";
import { filterMapVenues, filterShowsPeople, venueHasActivity } from "./map-filter";

const venue = (id: string): RuntimeVenueCandidate => ({
  id,
  name: id,
  latitude: 60.17,
  longitude: 24.94,
  radiusMeters: 80,
  distanceMeters: null,
  source: "local_catalog",
});

const activity = (
  id: string,
  score: number | null,
  visible = 0,
): VenueActivityEnvelope => ({
  venueId: id,
  googlePlaceId: null,
  name: id,
  activity: {
    label: "quiet",
    displayText: "Quiet",
    score,
    forecastScore: null,
    liveAvailable: score !== null,
    comparison: "unknown",
    comparisonText: "",
    updatedAt: null,
    isStale: false,
    refreshing: false,
    source: "left",
  },
  leftPresence: { total: visible, visible, openToMeet: visible },
});

describe("discovery map filters", () => {
  it("treats real presence or a meaningful activity score as active", () => {
    expect(venueHasActivity(venue("busy"), { busy: activity("busy", 62) })).toBe(true);
    expect(venueHasActivity(venue("social"), { social: activity("social", 0, 1) })).toBe(true);
    expect(venueHasActivity(venue("quiet"), { quiet: activity("quiet", 12) })).toBe(false);
  });

  it("filters places without inventing activity", () => {
    const candidates = [venue("busy"), venue("quiet")];
    expect(filterMapVenues(candidates, "active", { busy: activity("busy", 48) })).toEqual([
      candidates[0],
    ]);
    expect(filterMapVenues(candidates, "people", {})).toEqual([]);
    expect(filterMapVenues(candidates, "places", {})).toEqual(candidates);
  });

  it("only overlays people for relevant filters", () => {
    expect(filterShowsPeople("all")).toBe(true);
    expect(filterShowsPeople("active")).toBe(true);
    expect(filterShowsPeople("people")).toBe(true);
    expect(filterShowsPeople("places")).toBe(false);
  });
});
