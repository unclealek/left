/** Probe lazily: older builds may not contain the native module at all. */
export function canUseLiquidGlass(
  platform: string,
  reduceTransparency: boolean,
  isAvailable: () => boolean,
  isAPIAvailable: () => boolean,
): boolean {
  if (platform !== 'ios' || reduceTransparency) return false;
  try {
    return isAvailable() && isAPIAvailable();
  } catch {
    return false;
  }
}
