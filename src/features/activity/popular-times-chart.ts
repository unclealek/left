export const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
export type ChartHour = { hour: number; busyness: number | null };
export const dayLabel = (day: string) => day.charAt(0).toUpperCase() + day.slice(1);

export function chartDay(timezone?: string | null, now = new Date()): string | null {
  if (!timezone) return null;
  try {
    return new Intl.DateTimeFormat('en-US', { timeZone: timezone, weekday: 'long' }).format(now).toLowerCase();
  } catch { return null; }
}

export function chartHours(values?: Array<{ hour: number; busyness: number }>): ChartHour[] {
  return Array.from({ length: 24 }, (_, hour) => ({
    hour, busyness: values?.find(value => value.hour === hour)?.busyness ?? null,
  }));
}

export function chartSummary(day: string, hours: ChartHour[]): string {
  const available = hours.filter((value): value is { hour: number; busyness: number } => value.busyness !== null);
  if (!available.length) return `${dayLabel(day)}: no popular-times data for this day.`;
  const peak = available.reduce((a, b) => b.busyness > a.busyness ? b : a);
  const summary = peak.busyness === 0
    ? `${dayLabel(day)}: reported typical activity is 0% throughout the available hours.`
    : `${dayLabel(day)}: busiest around ${String(peak.hour).padStart(2, '0')}:00, ${peak.busyness}% typical activity.`;
  const missing = hours.length - available.length;
  return missing ? `${summary} ${missing} hours have no data.` : summary;
}
