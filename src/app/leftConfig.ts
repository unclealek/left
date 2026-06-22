import type { AppUser, AuthProvider, AvatarStyle } from "../types/left-domain";

export type Screen =
  | "loading"
  | "auth"
  | "onboarding-name"
  | "onboarding-avatar"
  | "onboarding-location"
  | "venue-select"
  | "venue-add"
  | "home"
  | "venue"
  | "activate"
  | "feed"
  | "me"
  | "profile"
  | "approach"
  | "safety"
  | "settings";

export type FooterDestination = "home" | "nearby" | "session" | "account";

export type UserProfileRow = {
  id: string;
  auth_provider: AuthProvider;
  provider_subject: string;
  first_name: string;
  avatar_style: AvatarStyle;
  default_intent: AppUser["defaultIntent"];
  default_vibes: string[];
  profile_prompt: string;
  approach_prompt: string;
  focus_mode_enabled: boolean;
  prompts_enabled: boolean;
  identity_removed: boolean;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
};

export const avatarStyles: AvatarStyle[] = ["geometric", "abstract", "minimal", "soft"];

export const AVATAR_GLYPHS: Record<AvatarStyle, string> = {
  geometric: "◆",
  abstract: "◎",
  minimal: "—",
  soft: "◐",
};

export const intents = [
  { id: "networking", label: "Networking" },
  { id: "open_to_conversation", label: "Open to chat" },
  { id: "group_discussion", label: "Group discussion" },
  { id: "casual_chat", label: "Casual chat" },
] as const;

export const vibeOptions = ["AI/startups", "Design", "Travel", "Language exchange", "Creativity"];
export const durationOptions = [30, 60, 120];
export const defaultProfilePrompt = "Ask what they're building right now, not what they do generally.";
export const defaultApproachPrompt = "What are you working on that feels genuinely exciting?";

export const AUTH_CALLBACK_PATH = "auth/callback";
export const NATIVE_AUTH_REDIRECT = "left://auth/callback";
export const SESSION_NAV_SCREENS: Screen[] = ["home", "venue", "activate", "feed", "me", "profile", "approach", "safety", "settings"];

export function formatIntent(intent: string) {
  return intent.replaceAll("_", " ");
}

export function formatRemaining(value: string) {
  return value.startsWith("00:") ? value.slice(3, 8) : value;
}

export function formatElapsedDuration(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function getFooterDestination(screen: Screen): FooterDestination {
  if (screen === "home") return "home";
  if (screen === "feed" || screen === "profile" || screen === "approach") return "nearby";
  if (screen === "venue" || screen === "activate") return "session";
  return "account";
}
