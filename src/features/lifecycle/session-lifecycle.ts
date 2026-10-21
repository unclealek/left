export function getRemainingSeconds(expiresAt: string | null | undefined, nowMs = Date.now()) {
  if (!expiresAt) return 0;
  const expiresAtMs = Date.parse(expiresAt);
  if (!Number.isFinite(expiresAtMs)) return 0;
  return Math.max(0, Math.ceil((expiresAtMs - nowMs) / 1000));
}

export function hasExpired(expiresAt: string | null | undefined, nowMs = Date.now()) {
  if (!expiresAt) return false;
  const expiresAtMs = Date.parse(expiresAt);
  return !Number.isFinite(expiresAtMs) || expiresAtMs <= nowMs;
}

/** A stored expiry already ends discoverability server-side; manual changes need acknowledgement. */
export async function completePresenceEnd(steps: {
  endPresence: () => Promise<boolean>;
  clearLocal: () => void;
  expired: boolean;
}) {
  let confirmed = false;
  try { confirmed = await steps.endPresence(); }
  catch (error) { if (!steps.expired) throw error; }
  if (!confirmed && !steps.expired) throw new Error('Visibility change was not confirmed.');
  steps.clearLocal();
}
