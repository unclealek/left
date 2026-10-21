import { t } from "../preferences/translation-runtime";
export const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
export type ChartHour = { hour: number; busyness: number | null };
export const dayLabel = (day: string) => t(day.charAt(0).toUpperCase() + day.slice(1));

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
  if (!available.length) return t("{day}: no popular-times data for this day.", { day: dayLabel(day) });
  const peak = available.reduce((a, b) => b.busyness > a.busyness ? b : a);
  const summary = peak.busyness === 0
    ? t("{day}: reported typical activity is 0% throughout the available hours.", { day: dayLabel(day) })
    : t("{day}: busiest around {hour}:00, {percent}% typical activity.", { day: dayLabel(day), hour: String(peak.hour).padStart(2, "0"), percent: peak.busyness });
  const missing = hours.length - available.length;
  return missing ? `${summary} ${t("{count} hours have no data.", { count: missing })}` : summary;
}
