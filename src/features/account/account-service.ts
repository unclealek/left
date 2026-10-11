import { supabase } from "../../lib/supabase";
import * as AppleAuthentication from "expo-apple-authentication";
import type { AppUser, AvatarStyle } from "../../types/left-domain";
import type { UserProfileRow } from "../../app/leftConfig";
import type { LegalDocumentId } from "../legal/legal-content";

export type AccountDeletionResult = "processed" | "queued" | "duplicate" | "failed" | "cancelled";

export async function fetchUserProfile(userId: string) {
  const { data, error } = await supabase.from("users").select("*").eq("id", userId).maybeSingle();
  return { profile: data as UserProfileRow | null, error };
}

export async function upsertOnboardingProfile(
  user: AppUser,
  legalAcceptance?: {
    versions: Record<LegalDocumentId, string>;
  } | null,
) {
  const { error } = await supabase.from("users").upsert(
    {
      id: user.id,
      auth_provider: user.authProvider,
      provider_subject: user.providerSubject,
      first_name: user.firstName,
      avatar_style: user.avatarStyle,
      default_intent: user.defaultIntent,
      default_vibes: user.defaultVibes,
      interests: user.interests,
      offering: user.offering,
      social_rhythm: user.socialRhythm,
      conversation_style: user.conversationStyle,
      profile_prompt: user.profilePrompt,
      approach_prompt: user.approachPrompt,
      focus_mode_enabled: user.focusModeEnabled,
      prompts_enabled: user.promptsEnabled,
      onboarding_completed: legalAcceptance ? false : user.onboardingCompleted,
    },
    { onConflict: "id" },
  );

  if (error) return { ok: false, error };
  if (legalAcceptance) {
    // The acceptance FK requires a profile; never complete setup before the RPC succeeds.
    const acceptance = await recordLegalAcceptance(legalAcceptance.versions);
    if (!acceptance.ok) return acceptance;
    const completion = await supabase.from("users")
      .update({ onboarding_completed: user.onboardingCompleted }).eq("id", user.id);
    return { ok: !completion.error, error: completion.error };
  }
  return { ok: true, error: null };
}

export async function recordLegalAcceptance(versions: Record<LegalDocumentId, string>) {
  const { error } = await supabase.rpc("record_current_legal_acceptance", {
    expected_terms_version: versions.terms,
    expected_privacy_version: versions.privacy,
    expected_community_version: versions.community,
  });
  return { ok: !error, error };
}

export async function hasAcceptedLegalVersions(
  userId: string,
  versions: Record<LegalDocumentId, string>,
) {
  const { data, error } = await supabase
    .from("legal_acceptances")
    .select("document_id, document_version")
    .eq("user_id", userId);

  if (error) return { accepted: false, error };
  // Historical versions coexist; an older row must not shadow a current one.
  const accepted = new Set((data ?? []).map((row) => JSON.stringify([row.document_id, row.document_version])));
  return {
    accepted: (Object.keys(versions) as LegalDocumentId[]).every(
      (documentId) => accepted.has(JSON.stringify([documentId, versions[documentId]])),
    ),
    error: null,
  };
}

export async function updateUserSettings(input: {
  userId: string;
  firstName: string;
  avatarStyle: AvatarStyle;
  defaultIntent: AppUser["defaultIntent"];
  defaultVibes: string[];
  interests: string[];
  offering: string;
  socialRhythm: string;
  conversationStyle: string;
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
      interests: input.interests,
      offering: input.offering,
      social_rhythm: input.socialRhythm,
      conversation_style: input.conversationStyle,
      profile_prompt: input.profilePrompt,
      approach_prompt: input.approachPrompt,
    })
    .eq("id", input.userId);

  return !error;
}

export async function submitIdentityRemovalRequest(user: AppUser): Promise<AccountDeletionResult> {
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !authUser || authUser.id !== user.id) return "failed";
  let appleAuthorizationCode: string | undefined;
  if (authUser.identities?.some((identity) => identity.provider === "apple")) {
    try {
      const credential = await AppleAuthentication.signInAsync();
      if (!credential.authorizationCode) return "failed";
      appleAuthorizationCode = credential.authorizationCode;
    } catch (error) {
      return typeof error === "object" && error !== null && "code" in error && error.code === "ERR_REQUEST_CANCELED"
        ? "cancelled" : "failed";
    }
  }
  const { data: pending, error: pendingError } = await supabase.from("identity_removal_requests")
    .select("id").eq("user_id", user.id).in("status", ["pending", "processing"]).maybeSingle();
  if (pendingError) return "failed";

  const { data: requestRow, error } = pending ? { data: pending, error: null } : await supabase
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
        "profile_interests",
        "profile_offering",
        "social_rhythm",
        "conversation_style",
        "saved_venues",
        "experience_attendance",
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

  const { data: processingResult, error: processingError } = await supabase.functions.invoke("process-identity-removal", {
    body: { requestId: requestRow.id, ...(appleAuthorizationCode ? { appleAuthorizationCode } : {}) },
  });

  return processingError || processingResult?.ok !== true ? "queued" : "processed";
}
