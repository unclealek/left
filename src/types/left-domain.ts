export type AuthProvider = "google" | "apple";

export type IntentType =
  | "networking"
  | "open_to_conversation"
  | "group_discussion"
  | "casual_chat";

export type PresenceStatus =
  | "activating"
  | "visible"
  | "discoverable"
  | "expiring"
  | "paused"
  | "session_ended";

export type PromptState =
  | "none"
  | "prompt_eligible"
  | "prompted"
  | "accepted"
  | "dismissed";

export type WaveStatus =
  | "sent"
  | "seen"
  | "reciprocated"
  | "expired"
  | "cancelled";

export type ApproachStatus =
  | "started"
  | "confirmed_going"
  | "connected"
  | "expired"
  | "cancelled";

export type ReportCategory =
  | "harassment"
  | "impersonation"
  | "unsafe_behavior"
  | "spam"
  | "other";

export type AvatarStyle = "geometric" | "abstract" | "minimal" | "soft";

export type VenueType =
  | "cafe"
  | "library"
  | "coworking_space"
  | "airport"
  | "gym"
  | "university"
  | "other";

export type DistanceBucket = "same_area" | "nearby" | "within_venue";
export type EnergyLevel = "quiet" | "warm" | "high";

export interface AppUser {
  id: string;
  authProvider: AuthProvider;
  providerSubject: string;
  firstName: string;
  avatarStyle: AvatarStyle;
  defaultIntent: IntentType | null;
  defaultVibes: string[];
  focusModeEnabled: boolean;
  promptsEnabled: boolean;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Venue {
  id: string;
  name: string;
  type: VenueType;
  city: string | null;
  geofenceJson: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PresenceSession {
  id: string;
  userId: string;
  venueId: string;
  intent: IntentType;
  vibes: string[];
  hintText: string | null;
  status: PresenceStatus;
  promptState: PromptState;
  startedAt: string;
  expiresAt: string;
  pausedAt: string | null;
  endedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PromptEvent {
  id: string;
  userId: string;
  venueId: string;
  triggeredAt: string;
  reason: string;
  accepted: boolean | null;
  createdAt: string;
}

export interface Wave {
  id: string;
  fromUserId: string;
  toUserId: string;
  presenceSessionId: string;
  status: WaveStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ApproachAttempt {
  id: string;
  fromUserId: string;
  toUserId: string;
  presenceSessionId: string;
  status: ApproachStatus;
  startedAt: string;
  expiresAt: string;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HiddenUser {
  id: string;
  actorUserId: string;
  targetUserId: string;
  createdAt: string;
}

export interface Block {
  id: string;
  actorUserId: string;
  targetUserId: string;
  reason: string | null;
  createdAt: string;
}

export interface Report {
  id: string;
  actorUserId: string;
  targetUserId: string;
  presenceSessionId: string | null;
  category: ReportCategory;
  notes: string | null;
  createdAt: string;
}

export interface SafetyZone {
  id: string;
  userId: string;
  name: string;
  geofenceJson: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type DeletionRequestStatus =
  | "pending"
  | "processing"
  | "completed"
  | "rejected"
  | "cancelled";

export interface IdentityRemovalRequest {
  id: string;
  userId: string | null;
  profileUserId: string | null;
  contactEmail: string;
  contactName: string | null;
  authProvider: AuthProvider | null;
  requestKind: "identity_removal";
  identityFieldsToRemove: string[];
  retainedRecordClasses: string[];
  payload: Record<string, unknown>;
  status: DeletionRequestStatus;
  requestedAt: string;
  processedAt: string | null;
  failureReason: string | null;
  processingNotes: string | null;
}

export interface NearbyFeedItem {
  profileUserId: string;
  presenceSessionId: string;
  firstName: string;
  intent: IntentType;
  hintText: string | null;
  primaryVibe: string | null;
  sessionDurationRemaining: string;
  distanceBucket: DistanceBucket;
  venueName: string;
  energyLevel: EnergyLevel;
  sessionExpiresAt: string;
}

export interface VenueContextSummary {
  venueId: string;
  venueName: string;
  visibleCount: number;
  energyLevel: EnergyLevel;
  activeVibes: string[];
  popularIntents: IntentType[];
  pulseCopy: string;
}

export interface AuthBootstrapResult {
  userId: string;
  isNewUser: boolean;
  firstName: string;
  avatarStyle: AvatarStyle | null;
  onboardingCompleted: boolean;
}

export interface CompleteOnboardingInput {
  firstName: string;
  avatarStyle: AvatarStyle;
}

export interface ActivatePresenceInput {
  venueId: string;
  intent: IntentType;
  vibes: string[];
  durationMinutes: number;
  hintText?: string | null;
}

export interface ActivatePresenceResult {
  presenceSessionId: string;
  status: Extract<PresenceStatus, "visible">;
  expiresAt: string;
}

export interface StartApproachInput {
  targetUserId: string;
  presenceSessionId: string;
}

export interface StartApproachResult {
  approachAttemptId: string;
  startedAt: string;
  expiresAt: string;
  status: Extract<ApproachStatus, "started">;
}

export interface ContactExchangeDecisionInput {
  approachAttemptId: string;
  decision: "share_my_number" | "skip";
}

export interface ContactExchangeEligibility {
  approachAttemptId: string;
  exchangeWindowExpiresAt: string;
  canShareNumber: boolean;
}

export interface ReportUserInput {
  targetUserId: string;
  presenceSessionId?: string | null;
  category: ReportCategory;
  notes?: string | null;
}

export interface DomainEventMap {
  prompt_received: { venueId: string };
  prompt_opened: { venueId: string };
  presence_activated: { presenceSessionId: string; venueId: string };
  presence_cancelled: { venueId: string };
  nearby_feed_loaded: { venueId: string; resultCount: number };
  profile_opened: { targetUserId: string; presenceSessionId: string };
  wave_sent: { targetUserId: string; waveId: string };
  approach_started: { targetUserId: string; approachAttemptId: string };
  approach_cancelled: { approachAttemptId: string };
  approach_connected: { approachAttemptId: string };
  contact_exchange_prompt_seen: { approachAttemptId: string };
  contact_exchange_opt_in: { approachAttemptId: string };
  contact_exchange_skipped: { approachAttemptId: string };
  session_expiring_seen: { presenceSessionId: string };
  session_ended: { presenceSessionId: string };
  safety_opened: { source: "feed" | "profile" | "approach" | "settings" };
  user_hidden: { targetUserId: string };
  user_blocked: { targetUserId: string };
  user_reported: { targetUserId: string; category: ReportCategory };
  venue_pulse_seen: { venueId: string; visibleCount: number };
}
