import { describe, expect, it, vi } from "vitest";
import { fetchGooglePlaceWithPhoto } from "./google-photo";

const apiKey = "test-server-key";
const input = { apiKey, placeId: "test-place", fields: "formattedAddress" };
const metadata = {
  formattedAddress: "Example street",
  photos: [{ name: "places/test-place/photos/fresh-reference", authorAttributions: [
    { displayName: "Photographer", uri: "https://www.google.com/maps/contrib/example" },
  ] }],
};
const response = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status });

describe("Google venue photos", () => {
  it("requests fresh metadata and returns an attributed URL without credentials", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(response(metadata))
      .mockResolvedValueOnce(response({ photoUri: "https://lh3.googleusercontent.com/venue-photo" }));
    const result = await fetchGooglePlaceWithPhoto(input, fetcher);
    expect(result.photo).toEqual({
      uri: "https://lh3.googleusercontent.com/venue-photo",
      attributions: [{ displayName: "Photographer", uri: "https://www.google.com/maps/contrib/example" }],
    });
    expect(fetcher.mock.calls[0][1].headers["X-Goog-FieldMask"]).toBe("formattedAddress,photos");
    for (const [url, options] of fetcher.mock.calls) {
      expect(String(url)).not.toContain(apiKey);
      expect(options.headers["X-Goog-Api-Key"]).toBe(apiKey);
    }
    expect(new URL(fetcher.mock.calls[1][0]).searchParams.get("skipHttpRedirect")).toBe("true");
    expect(JSON.stringify(result.photo)).not.toContain(apiKey);
  });

  it("keeps practical details when no photo exists", async () => {
    const fetcher = vi.fn().mockResolvedValue(response({ formattedAddress: "Example street" }));
    const result = await fetchGooglePlaceWithPhoto(input, fetcher);
    expect(result).toEqual({ place: { formattedAddress: "Example street" }, photo: null });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it.each([403, 404, 429, 500])("falls back when photo media returns %i", async status => {
    const fetcher = vi.fn().mockResolvedValueOnce(response(metadata)).mockResolvedValueOnce(response({}, status));
    const result = await fetchGooglePlaceWithPhoto(input, fetcher);
    expect(result.photo).toBeNull();
    expect(result.place.formattedAddress).toBe("Example street");
  });

  it("keeps practical details on a photo timeout", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(response(metadata)).mockRejectedValueOnce(new Error("timeout"));
    expect((await fetchGooglePlaceWithPhoto(input, fetcher)).photo).toBeNull();
  });

  it.each(["http://lh3.googleusercontent.com/photo", "https://attacker.example/photo", "https://lh3.googleusercontent.com/photo?key=test-server-key"])("rejects unsafe media URL %s", async photoUri => {
    const fetcher = vi.fn().mockResolvedValueOnce(response(metadata)).mockResolvedValueOnce(response({ photoUri }));
    expect((await fetchGooglePlaceWithPhoto(input, fetcher)).photo).toBeNull();
  });

  it("does not pass an unsafe attribution URL to the client", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(response({ photos: [{ ...metadata.photos[0],
      authorAttributions: [{ displayName: "Photographer", uri: "javascript:alert(1)" }],
    }] })).mockResolvedValueOnce(response({ photoUri: "https://lh3.googleusercontent.com/photo" }));
    expect((await fetchGooglePlaceWithPhoto(input, fetcher)).photo?.attributions[0]).toEqual({ displayName: "Photographer", uri: null });
  });

  it("reports metadata status without leaking Google's response body", async () => {
    const fetcher = vi.fn().mockResolvedValue(response({ error: "sensitive-provider-error" }, 403));
    await expect(fetchGooglePlaceWithPhoto(input, fetcher)).rejects.toThrow("Google Place Details failed (403)");
  });
});
