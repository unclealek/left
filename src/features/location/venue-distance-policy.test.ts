import { describe, expect, it } from "vitest";
import {
  isVenueWithinConfirmationRange,
  VENUE_CONFIRMATION_MAX_DISTANCE_METERS,
  VENUE_DISCOVERY_RADIUS_METERS,
} from "./venue-distance-policy";

describe("venue distance policy", () => {
  it("discovers farther venues without automatically confirming them", () => {
    expect(VENUE_DISCOVERY_RADIUS_METERS).toBeGreaterThan(VENUE_CONFIRMATION_MAX_DISTANCE_METERS);
    expect(isVenueWithinConfirmationRange({ distanceMeters: 240, radiusMeters: 120 })).toBe(false);
  });

  it("confirms a venue only inside both its geofence and the safety maximum", () => {
    expect(isVenueWithinConfirmationRange({ distanceMeters: 80, radiusMeters: 100 })).toBe(true);
    expect(isVenueWithinConfirmationRange({ distanceMeters: 110, radiusMeters: 100 })).toBe(false);
    expect(isVenueWithinConfirmationRange({ distanceMeters: 121, radiusMeters: 500 })).toBe(false);
  });

  it("does not confirm an unknown distance", () => {
    expect(isVenueWithinConfirmationRange({ distanceMeters: null, radiusMeters: 120 })).toBe(false);
  });
});
