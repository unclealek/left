import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";
import type { AppUser, AvatarStyle } from "../../types/left-domain";
import type { UserProfileRow } from "../../app/leftConfig";

export type AccountDeletionResult = "processed" | "queued" | "duplicate" | "failed";

export async function fetchUserProfile(userId: string) {
  const { data, error } = await supabase.from("users").select("*").eq("id", userId).maybeSingle();
  return { profile: data as UserProfileRow | null, error };
}

export async function upsertOnboardingProfile(user: AppUser) {
  const { error } = await supabase.from("users").upsert(
    {
      id: user.id,
      auth_provider: user.authProvider,
      provider_subject: user.providerSubject,
      first_name: user.firstName,
      avatar_style: user.avatarStyle,
      default_intent: user.defaultIntent,
      default_vibes: user.defaultVibes,
      profile_prompt: user.profilePrompt,
      approach_prompt: user.approachPrompt,
      focus_mode_enabled: user.focusModeEnabled,
      prompts_enabled: user.promptsEnabled,
      onboarding_completed: user.onboardingCompleted,
    },
    { onConflict: "id" },
  );

  return !error;
}

export async function updateUserSettings(input: {
  userId: string;
  firstName: string;
  avatarStyle: AvatarStyle;
  defaultIntent: AppUser["defaultIntent"];
  defaultVibes: string[];
  profilePrompt: string;
  approachPrompt: string;
}) {
  const { error } = await supabase
    .from("users")
    .update({
      first_name: input.firstName,
      avatar_style: input.avatarStyle,
      default_intent: input.defaultIntent,
      default_vibes: input.defaultVibes,
      profile_prompt: input.profilePrompt,
      approach_prompt: input.approachPrompt,
    })
    .eq("id", input.userId);

  return !error;
}

export async function submitIdentityRemovalRequest(user: AppUser): Promise<AccountDeletionResult> {
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const { data: requestRow, error } = await supabase
    .from("identity_removal_requests")
    .insert({
      user_id: user.id,
      profile_user_id: user.id,
      contact_email: authUser?.email ?? "unknown@left.local",
      contact_name: user.firstName,
      auth_provider: user.authProvider,
      request_kind: "identity_removal",
      identity_fields_to_remove: [
        "email",
        "first_name",
        "provider_subject",
        "auth_provider_metadata",
        "direct_auth_credentials",
      ],
      retained_record_classes: ["hints", "venue_history", "safety_zones"],
      payload: {
        defaultIntent: user.defaultIntent,
        defaultVibes: user.defaultVibes,
        focusModeEnabled: user.focusModeEnabled,
        promptsEnabled: user.promptsEnabled,
      },
    })
    .select("id")
    .single();

  if (error) {
    return error.code === "23505" ? "duplicate" : "failed";
  }

  if (!requestRow?.id) return "failed";

  const { error: processingError } = await supabase.functions.invoke("process-identity-removal", {
    body: { requestId: requestRow.id },
  });

  return processingError ? "queued" : "processed";
}

export function getProvider(session: Session) {
  return session.user.app_metadata.provider ?? "google";
}
