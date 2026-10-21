import { supabase } from "../../lib/supabase";
export const EXPORT_CATEGORIES = ["profile", "presence", "prompts", "approaches", "waves_sent", "contact_choices", "reports_submitted", "removal_requests", "saved_places", "gatherings_hosted", "gatherings_joined", "venue_preferences", "legal_acknowledgements", "hidden_people", "blocked_people", "social_interactions", "safety_zones"] as const;
export async function collectAccountData() {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user || user.is_anonymous) throw new Error("Sign in required");
  const records: Record<string, unknown[]> = {};
  for (const category of EXPORT_CATEGORIES) {
    records[category] = [];
    for (let offset = 0; ; offset += 500) {
      const { data, error } = await supabase.rpc("export_my_data", { p_category: category, p_offset: offset });
      if (error || !Array.isArray(data)) throw new Error("Could not complete data export");
      records[category].push(...data);
      if (data.length < 500) break;
    }
  }
  // Revalidate ownership before presenting a file if the account changed during collection.
  const { data: current, error } = await supabase.auth.getUser();
  if (error || current.user?.id !== user.id) throw new Error("Account changed");
  return {
    format_version: 1,
    exported_at: new Date().toISOString(),
    account: { id: user.id, email: user.email, created_at: user.created_at },
    scope: "App account records. Excludes provider-held analytics, backups, internal safety reviews and other people's private data.",
    records,
  };
}
