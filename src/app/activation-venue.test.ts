import { expect, it } from "vitest";
import { resolveActivationVenue } from "./activation-venue";
const a = { id: "11111111-1111-4111-8111-111111111111", name: "Cafe", distanceMeters: 10, radiusMeters: 100 } as any;
const b = { ...a, id: "22222222-2222-4222-8222-222222222222", name: "Library" };
const runtime = { lastKnownCoords: { accuracy: 5 }, nearbyVenues: [a, b], currentVenueId: a.id, selectedVenueId: null } as any;
it("uses the fresh detected venue even when several places are nearby", () => {
  expect(resolveActivationVenue(runtime)).toBe(a);
});
it("respects an explicit selection in confirmation range", () => {
  expect(resolveActivationVenue({ ...runtime, selectedVenueId: b.id })).toBe(b);
});
it("does not choose the first nearby result without a current venue", () => {
  expect(resolveActivationVenue({ ...runtime, currentVenueId: null })).toBeNull();
});
it("rejects a far venue or a missing fresh fix", () => {
  expect(resolveActivationVenue({ ...runtime, nearbyVenues: [{ ...a, distanceMeters: 400 }] })).toBeNull();
  expect(resolveActivationVenue({ ...runtime, lastKnownCoords: null })).toBeNull();
});
