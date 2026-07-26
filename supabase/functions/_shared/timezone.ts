// @ts-nocheck

function resolveParts(timezone: string, date: Date) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour12: false,
    weekday: "short",
    hour: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const weekday = parts.find((part) => part.type === "weekday")?.value ?? "Mon";
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");

  return { weekday, hour };
}

const weekdayMap: Record<string, number> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 0,
};

export function getVenueLocalSlot(timezone?: string | null, date = new Date()) {
  const safeTimezone = timezone || "UTC";

  try {
    const { weekday, hour } = resolveParts(safeTimezone, date);
    let dayOfWeek = weekdayMap[weekday] ?? 0;
    let normalizedHour = hour;

    // BestTime documents a 06:00 -> 05:00 window. Hours before 06:00 belong to the prior day.
    if (normalizedHour < 6) {
      dayOfWeek = (dayOfWeek + 6) % 7;
      normalizedHour += 24;
    }

    return {
      timezone: safeTimezone,
      dayOfWeek,
      hour: normalizedHour,
    };
  } catch {
    return {
      timezone: "UTC",
      dayOfWeek: date.getUTCDay(),
      hour: date.getUTCHours(),
    };
  }
}
