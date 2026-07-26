// @ts-nocheck

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.primaryType",
  "places.types",
  "places.photos",
].join(",");

export async function searchNearbyPlaces(input: {
  apiKey: string;
  latitude: number;
  longitude: number;
  radiusMetres: number;
  maxResultCount?: number;
}) {
  const response = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": input.apiKey,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify({
      includedTypes: [
        "cafe",
        "bar",
        "library",
        "coffee_shop",
        "coworking_space",
        "restaurant",
        "university",
      ],
      maxResultCount: input.maxResultCount ?? 5,
      locationRestriction: {
        circle: {
          center: {
            latitude: input.latitude,
            longitude: input.longitude,
          },
          radius: input.radiusMetres,
        },
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Google Places request failed (${response.status}): ${body}`);
  }

  const payload = await response.json();
  return Array.isArray(payload?.places) ? payload.places : [];
}
