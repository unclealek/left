// @ts-nocheck
import { json } from "./http.ts";

export async function enforceRateLimit(supabase: any, endpoint: string) {
  const { data, error } = await supabase.rpc("consume_api_rate_limit", {
    p_endpoint: endpoint,
  });

  if (error) {
    console.warn(`[rate-limit] ${endpoint} check failed`, error.message);
    return json({ error: "Request protection is temporarily unavailable." }, 503);
  }

  if (data !== true) {
    return json({ error: "Too many requests. Please try again shortly." }, 429);
  }

  return null;
}
