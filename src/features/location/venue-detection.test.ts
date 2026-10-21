import { expect, it, vi } from "vitest";
vi.mock("./nearby-venues-service", () => ({ fetchNearbyVenuesFromServer: vi.fn() }));
import { detectVenueFromCoords } from "./venue-detection";
const venue = { id: "v", name: "Cafe", distanceMeters: 10, radiusMeters: 100 } as any;
it.each([null, 500, -1, NaN])("does not infer a current venue with uncertain accuracy %s", async accuracy => {
  expect(await detectVenueFromCoords({ latitude: 60, longitude: 24, accuracy } as any, null, [venue])).toBeNull();
});
it("accepts a nearby candidate with a precise fix", async () => {
  expect(await detectVenueFromCoords({ latitude: 60, longitude: 24, accuracy: 5 } as any, null, [venue])).toBe(venue);
});
