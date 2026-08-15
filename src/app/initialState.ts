import type { NearbyFeedItem, VenueContextSummary } from "../types/left-domain";

export const EMPTY_NEARBY_FEED: NearbyFeedItem[] = [];

export const INITIAL_VENUE_SUMMARY: VenueContextSummary = {
  venueId: "runtime-pending",
  venueName: "Current venue",
  visibleCount: 0,
  energyLevel: "calm",
  activeVibes: [],
  popularIntents: [],
  pulseCopy: "Checking your nearby venue.",
};
