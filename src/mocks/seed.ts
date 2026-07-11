import type { AppUser, NearbyFeedItem, VenueContextSummary } from "../types/left-domain";

export const viewerSeed: AppUser = {
  id: "user-viewer",
  authProvider: "apple",
  providerSubject: "apple-user-viewer",
  firstName: "Kelvin",
  avatarStyle: "geometric",
  defaultIntent: "networking",
  defaultVibes: ["AI/startups", "Design"],
  profilePrompt: "Ask what they're building right now, not what they do generally.",
  approachPrompt: "What are you working on that feels genuinely exciting?",
  focusModeEnabled: false,
  promptsEnabled: true,
  identityRemoved: false,
  onboardingCompleted: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const initialVenueSummary: VenueContextSummary = {
  venueId: "runtime-pending",
  venueName: "Current venue",
  visibleCount: 1,
  energyLevel: "active",
  activeVibes: ["AI/startups", "Design"],
  popularIntents: ["networking"],
  pulseCopy: "Checking your nearby venue.",
};

export const initialFeed: NearbyFeedItem[] = [];
