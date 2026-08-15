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
