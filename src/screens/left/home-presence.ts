export function getNearbyPeopleCount(
  reportedVisibleCount: number | null | undefined,
  viewerIsVisible: boolean,
) {
  const normalizedCount = Number.isFinite(reportedVisibleCount)
    ? Math.max(0, Math.floor(reportedVisibleCount ?? 0))
    : 0;

  return Math.max(0, normalizedCount - (viewerIsVisible ? 1 : 0));
}
