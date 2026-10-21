import type { VenuePhotoKind } from "./venue-photo-model";

// Local category samples. Actual venue imagery is always preferred by VenuePhoto.
export function getVenuePhotoFallbackSource(kind: VenuePhotoKind = "hospitality") {
  switch (kind) {
    case "cafe": return require("../../../assets/onboarding/private-by-default.jpg");
    case "bar": return require("../../../assets/venue-placeholders/bar.jpg");
    case "restaurant": return require("../../../assets/venue-placeholders/restaurant.jpg");
    case "library": return require("../../../assets/venue-placeholders/library.jpg");
    case "coworking": return require("../../../assets/venue-placeholders/coworking.jpg");
    case "park": return require("../../../assets/venue-placeholders/park.jpg");
    case "gym": return require("../../../assets/venue-placeholders/gym.jpg");
    case "airport": return require("../../../assets/venue-placeholders/airport.jpg");
    default: return require("../../../assets/backgrounds/hospitality.jpeg");
  }
}
