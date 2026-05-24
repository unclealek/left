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
  venueId: "venue-regatta",
  venueName: "Café Regatta",
  visibleCount: 1,
  energyLevel: "warm",
  activeVibes: ["AI/startups", "Design"],
  popularIntents: ["networking"],
  pulseCopy: "1 person is active nearby right now.",
};

export const initialFeed: NearbyFeedItem[] = [
  {
    profileUserId: "user-kelvin-2",
    presenceSessionId: "presence-kelvin-2",
    firstName: "Mika",
    intent: "networking",
    hintText: "Blue headphones",
    primaryVibe: "AI/startups",
    sessionDurationRemaining: "00:42:00",
    distanceBucket: "within_venue",
    venueName: "Café Regatta",
    energyLevel: "warm",
    sessionExpiresAt: new Date(Date.now() + 42 * 60_000).toISOString(),
  },
  {
    profileUserId: "user-alva",
    presenceSessionId: "presence-alva",
    firstName: "Alva",
    intent: "open_to_conversation",
    hintText: "Near the window with a black notebook",
    primaryVibe: "Design",
    sessionDurationRemaining: "00:18:00",
    distanceBucket: "within_venue",
    venueName: "Café Regatta",
    energyLevel: "warm",
    sessionExpiresAt: new Date(Date.now() + 18 * 60_000).toISOString(),
  },
];
